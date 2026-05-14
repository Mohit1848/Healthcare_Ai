import os
import time
from typing import Any

import httpx
from fastapi import FastAPI
from fastapi.responses import Response
from openai import OpenAI
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest
from pydantic import BaseModel, Field
from pymongo import MongoClient
from tenacity import retry, stop_after_attempt, wait_exponential


FALLBACK_RESPONSE = "Unable to confidently assess symptoms. Please consult a healthcare professional."

app = FastAPI(title="Healthcare AI Triage Backend", version="0.1.0")

REQUEST_COUNT = Counter("backend_request_count", "Backend HTTP request count", ["endpoint"])
API_LATENCY = Histogram("backend_api_latency_seconds", "Backend API latency", ["endpoint"])
OPENAI_FAILURES = Counter("openai_api_failures_total", "OpenAI API failures")
OPENAI_REQUESTS = Counter("openai_requests_total", "OpenAI API requests")
RAG_LATENCY = Histogram("rag_retrieval_latency_seconds", "RAG retrieval latency")
ACTIVE_SESSIONS = Gauge("active_sessions", "Approximate active chat sessions")
TRIAGE_RISK_SCORE = Gauge("triage_risk_score", "Latest triage risk score")


class ChatRequest(BaseModel):
    session_id: str = Field(default="demo-session")
    message: str


class ChatResponse(BaseModel):
    guidance: str
    emergency_score: int
    risk_level: str
    emergency_recommendation: str
    disclaimer: str
    retrieved_context: list[str]
    assistant_name: str
    language: str
    topology_stage: str
    clinical_summary: str
    operational_insights: list[str]
    safety_actions: list[str]
    telemetry: dict[str, Any]


def mongo_client() -> MongoClient:
    return MongoClient(os.getenv("MONGODB_URI", "mongodb://mongodb:27017/healthcare_ai"))


def openai_client() -> OpenAI:
    return OpenAI(
        api_key=os.getenv("OPENAI_API_KEY", "missing-key"),
        timeout=float(os.getenv("OPENAI_TIMEOUT_SECONDS", "20")),
        max_retries=0,
    )


def emergency_score(message: str) -> int:
    high_risk = ["chest pain", "trouble breathing", "stroke", "severe bleeding", "unconscious", "suicidal"]
    medium_risk = ["fever", "dizzy", "vomiting", "dehydration", "severe pain"]
    text = message.lower()
    score = 0
    score += 70 if any(term in text for term in high_risk) else 0
    score += 30 if any(term in text for term in medium_risk) else 0
    return min(score, 100)


def detect_language(message: str) -> str:
    text = message.lower()
    hindi_markers = ["hai", "dard", "bukhar", "saans", "chakkar", "mujhe", "seene"]
    spanish_markers = ["dolor", "fiebre", "mareo", "respirar", "pecho"]
    if any(marker in text for marker in hindi_markers):
        return "Hindi / Hinglish"
    if any(marker in text for marker in spanish_markers):
        return "Spanish"
    return "English"


def risk_level(score: int) -> str:
    if score >= 70:
        return "Escalation Recommended"
    if score >= 30:
        return "Elevated Observation"
    return "Guidance Only"


def topology_stage(score: int) -> str:
    if score >= 70:
        return "Clinical Escalation"
    if score >= 30:
        return "AI Risk Engine"
    return "Patient Voice Intake"


def operational_insights(message: str, score: int) -> list[str]:
    insights = [
        "Patient-reported symptoms captured for triage review.",
        "Response uses probabilistic language and avoids diagnosis claims.",
    ]
    if score >= 70:
        insights.append("Potential emergency indicators detected; escalation workflow should be prioritized.")
    elif score >= 30:
        insights.append("Moderate risk indicators detected; recommend clinician review if symptoms persist or worsen.")
    else:
        insights.append("No high-risk keywords detected by the rule layer; continue safe symptom guidance.")
    if len(message) < 20:
        insights.append("Symptom description is brief; request additional onset, duration, severity, and age context.")
    return insights


def safety_actions(score: int) -> list[str]:
    if score >= 70:
        return [
            "Advise immediate emergency care or local emergency services.",
            "Keep the patient on the line if this is a live intake workflow.",
            "Prepare a concise handoff summary for clinical staff.",
        ]
    if score >= 30:
        return [
            "Recommend timely consultation with a healthcare professional.",
            "Monitor worsening symptoms and escalation triggers.",
            "Avoid final diagnosis and provide supportive guidance only.",
        ]
    return [
        "Provide general symptom guidance.",
        "Ask the patient to seek care if symptoms worsen or new severe symptoms appear.",
        "Keep medical disclaimer visible.",
    ]


async def retrieve_context(message: str) -> list[str]:
    vector_url = os.getenv("VECTOR_SERVICE_URL", "http://vector-service:8001/search")
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.post(vector_url, json={"query": message, "top_k": 3})
            response.raise_for_status()
            data = response.json()
            return [item["text"] for item in data.get("matches", [])]
    except Exception:
        return []
    finally:
        RAG_LATENCY.observe(time.perf_counter() - start)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=6))
def generate_guidance(message: str, context: list[str], score: int) -> str:
    OPENAI_REQUESTS.inc()
    prompt = (
        "You are PulseGuard AI, a healthcare triage and operational intelligence assistant. "
        "Do not diagnose. Use probabilistic language. Provide symptom guidance, escalation "
        "recommendations when appropriate, and a short safety disclaimer.\n\n"
        f"User symptoms: {message}\n"
        f"Emergency score: {score}/100\n"
        f"Retrieved medical context: {context}\n"
    )
    try:
        completion = openai_client().chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "Never provide a final medical diagnosis or certainty claim."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        return completion.choices[0].message.content or FALLBACK_RESPONSE
    except Exception:
        OPENAI_FAILURES.inc()
        raise


@app.get("/health")
def health() -> dict[str, str]:
    REQUEST_COUNT.labels("/health").inc()
    return {"status": "healthy"}


@app.get("/status")
def status() -> dict[str, Any]:
    REQUEST_COUNT.labels("/status").inc()
    checks: dict[str, Any] = {"api": "ok"}
    try:
        mongo_client().admin.command("ping")
        checks["mongodb"] = "ok"
    except Exception as exc:
        checks["mongodb"] = f"error: {exc.__class__.__name__}"
    checks["openai_key_configured"] = bool(os.getenv("OPENAI_API_KEY"))
    return checks


@app.get("/metrics")
def metrics() -> Response:
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    REQUEST_COUNT.labels("/chat").inc()
    ACTIVE_SESSIONS.inc()
    start = time.perf_counter()
    try:
        score = emergency_score(payload.message)
        TRIAGE_RISK_SCORE.set(score)
        context = await retrieve_context(payload.message)
        try:
            guidance = generate_guidance(payload.message, context, score)
        except Exception:
            guidance = FALLBACK_RESPONSE
        level = risk_level(score)
        recommendation = "Seek emergency care now." if score >= 70 else "Monitor symptoms and consult a clinician if symptoms worsen."
        language = detect_language(payload.message)
        insights = operational_insights(payload.message, score)
        actions = safety_actions(score)
        telemetry = {
            "risk_probability": round(score / 100, 2),
            "rag_context_chunks": len(context),
            "language": language,
            "care_pathway": topology_stage(score),
            "diagnosis_mode": "disabled",
        }
        try:
            mongo_client().healthcare_ai.triage_events.insert_one(
                {
                    "session_id": payload.session_id,
                    "message": payload.message,
                    "score": score,
                    "risk_level": level,
                    "language": language,
                    "created_at": time.time(),
                }
            )
        except Exception:
            pass
        return ChatResponse(
            guidance=guidance,
            emergency_score=score,
            risk_level=level,
            emergency_recommendation=recommendation,
            disclaimer="This assistant does not provide diagnosis. For emergencies, contact local emergency services.",
            retrieved_context=context,
            assistant_name="PulseGuard AI",
            language=language,
            topology_stage=topology_stage(score),
            clinical_summary=(
                f"PulseGuard AI identified a {level.lower()} case pattern with a "
                f"{score}/100 operational risk score. This is triage support, not a diagnosis."
            ),
            operational_insights=insights,
            safety_actions=actions,
            telemetry=telemetry,
        )
    finally:
        ACTIVE_SESSIONS.dec()
        API_LATENCY.labels("/chat").observe(time.perf_counter() - start)
