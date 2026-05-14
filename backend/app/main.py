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


class ChatRequest(BaseModel):
    session_id: str = Field(default="demo-session")
    message: str


class ChatResponse(BaseModel):
    guidance: str
    emergency_score: int
    emergency_recommendation: str
    disclaimer: str
    retrieved_context: list[str]


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
        "You are a healthcare triage assistant. Do not diagnose. Provide symptom guidance, "
        "urgent-care recommendations when appropriate, and a short safety disclaimer.\n\n"
        f"User symptoms: {message}\n"
        f"Emergency score: {score}/100\n"
        f"Retrieved medical context: {context}\n"
    )
    try:
        completion = openai_client().chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "Never provide a final medical diagnosis."},
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
        context = await retrieve_context(payload.message)
        try:
            guidance = generate_guidance(payload.message, context, score)
        except Exception:
            guidance = FALLBACK_RESPONSE
        recommendation = "Seek emergency care now." if score >= 70 else "Monitor symptoms and consult a clinician if symptoms worsen."
        return ChatResponse(
            guidance=guidance,
            emergency_score=score,
            emergency_recommendation=recommendation,
            disclaimer="This assistant does not provide diagnosis. For emergencies, contact local emergency services.",
            retrieved_context=context,
        )
    finally:
        ACTIVE_SESSIONS.dec()
        API_LATENCY.labels("/chat").observe(time.perf_counter() - start)

