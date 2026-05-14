import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertTriangle,
  AudioLines,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Globe2,
  HeartPulse,
  Languages,
  LineChart,
  Radio,
  Send,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const chapters = [
  {
    id: "01",
    title: "Patient Voice Intake",
    body: "Multilingual symptom capture begins with a calm listening state and structured triage context.",
  },
  {
    id: "02",
    title: "Symptom Escalation",
    body: "Reported symptoms are monitored for possible emergency indicators without making diagnosis claims.",
  },
  {
    id: "03",
    title: "AI Triage Activation",
    body: "PulseGuard AI combines rule-based scoring, RAG context, and safety-constrained language generation.",
  },
  {
    id: "04",
    title: "Clinical Escalation",
    body: "High-risk patterns trigger operational recommendations for urgent review or emergency care.",
  },
  {
    id: "05",
    title: "Physician Handoff",
    body: "The system prepares concise, reviewable context for clinician-assistive workflows.",
  },
  {
    id: "06",
    title: "ICU Command Center",
    body: "A stabilized command view tracks risk, uptime, vector retrieval, and operational readiness.",
  },
];

const topology = [
  { label: "Patient Voice Intake", icon: AudioLines },
  { label: "Telemetry Monitor", icon: HeartPulse },
  { label: "AI Risk Engine", icon: BrainCircuit },
  { label: "Clinical Escalation", icon: Radio },
];

function scoreTone(score = 0) {
  if (score >= 70) return "critical";
  if (score >= 30) return "elevated";
  return "stable";
}

function Waveform({ active }) {
  const bars = useMemo(() => Array.from({ length: 28 }, (_, index) => index), []);
  return (
    <div className={`waveform ${active ? "is-active" : ""}`} aria-label="Calm voice waveform">
      {bars.map((bar) => (
        <span key={bar} style={{ "--delay": `${bar * 65}ms` }} />
      ))}
    </div>
  );
}

function TopologyFlow({ activeStage }) {
  const activeIndex = Math.max(
    0,
    topology.findIndex((stage) => stage.label === activeStage),
  );

  return (
    <section className="topology" aria-label="Clinical operations flow">
      {topology.map((stage, index) => {
        const Icon = stage.icon;
        const state = index <= activeIndex ? "complete" : "pending";
        return (
          <div className={`topology-node ${state}`} key={stage.label}>
            <div className="node-icon">
              <Icon size={18} />
            </div>
            <span>{stage.label}</span>
          </div>
        );
      })}
    </section>
  );
}

function ChapterRail({ activeStage }) {
  return (
    <aside className="chapter-rail" aria-label="Clinical narrative chapters">
      {chapters.map((chapter) => (
        <article className={chapter.title === activeStage ? "chapter active" : "chapter"} key={chapter.id}>
          <span>{chapter.id}</span>
          <div>
            <h3>{chapter.title}</h3>
            <p>{chapter.body}</p>
          </div>
        </article>
      ))}
    </aside>
  );
}

function Metric({ icon: Icon, label, value, tone = "neutral" }) {
  return (
    <div className={`metric ${tone}`}>
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function App() {
  const [message, setMessage] = useState(
    "I have fever, dizziness, and chest pain. I am also having trouble breathing.",
  );
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const score = response?.emergency_score ?? 0;
  const tone = scoreTone(score);
  const activeStage = response?.topology_stage || "Patient Voice Intake";

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "pulseguard-demo", message }),
      });
      if (!res.ok) {
        throw new Error(`Request failed with ${res.status}`);
      }
      setResponse(await res.json());
    } catch (err) {
      setError("PulseGuard AI could not complete the assessment. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="product-header">
        <div className="brand">
          <div className="brand-mark">
            <HeartPulse size={24} />
          </div>
          <div>
            <strong>PulseGuard AI</strong>
            <span>Clinical Triage & Operational Intelligence</span>
          </div>
        </div>
        <nav aria-label="Platform status">
          <span>Emergency escalation support</span>
          <span>Multilingual intake</span>
          <span>Diagnosis disabled</span>
        </nav>
      </header>

      <section className="hero-grid">
        <div className="intro-panel">
          <div className="eyebrow">
            <ShieldCheck size={16} />
            Safety-constrained clinical intelligence
          </div>
          <h1>PulseGuard AI</h1>
          <p>
            A next-generation healthcare triage and operational awareness platform for calm patient intake,
            emergency escalation support, and physician-assistive workflows.
          </p>
          <div className="hero-actions">
            <button onClick={submit} disabled={loading}>
              <Send size={17} />
              {loading ? "Activating triage" : "Activate triage"}
            </button>
            <div className="system-state">
              <span />
              Command center online
            </div>
          </div>
        </div>

        <section className="voice-card">
          <div className="card-heading">
            <div>
              <span>Patient Voice Intake</span>
              <h2>Calm listening state</h2>
            </div>
            <Languages size={22} />
          </div>
          <Waveform active={loading} />
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
          {error && <div className="error">{error}</div>}
        </section>
      </section>

      <TopologyFlow activeStage={activeStage} />

      <section className="command-layout">
        <ChapterRail activeStage={activeStage} />

        <section className="command-center">
          <div className="command-title">
            <div>
              <span>Chapter 06</span>
              <h2>Clinical Command Center</h2>
            </div>
            <div className={`risk-orb ${tone}`}>
              <strong>{score}</strong>
              <span>risk score</span>
            </div>
          </div>

          <div className="metrics-grid">
            <Metric icon={Activity} label="Platform uptime" value="Online" tone="stable" />
            <Metric icon={Globe2} label="Language" value={response?.language || "Pending"} />
            <Metric icon={LineChart} label="RAG chunks" value={response?.telemetry?.rag_context_chunks ?? 0} />
            <Metric icon={Clock3} label="Care pathway" value={activeStage} tone={tone} />
          </div>

          <div className="response-grid">
            <article className="clinical-card primary">
              <div className="card-heading">
                <div>
                  <span>AI Assistant</span>
                  <h3>{response?.assistant_name || "PulseGuard AI"}</h3>
                </div>
                <BrainCircuit size={22} />
              </div>
              <p>
                {response?.clinical_summary ||
                  "Awaiting patient intake. PulseGuard AI will provide triage support, not a diagnosis."}
              </p>
              <div className={`status-pill ${tone}`}>
                {response?.risk_level || "Listening"}
              </div>
            </article>

            <article className="clinical-card">
              <div className="card-heading">
                <div>
                  <span>Guidance</span>
                  <h3>Patient-safe response</h3>
                </div>
                <Stethoscope size={22} />
              </div>
              <p>
                {response?.guidance ||
                  "Enter symptoms and activate triage to generate a safety-constrained recommendation."}
              </p>
            </article>

            <article className="clinical-card">
              <div className="card-heading">
                <div>
                  <span>Escalation</span>
                  <h3>Recommended action</h3>
                </div>
                <AlertTriangle size={22} />
              </div>
              <p>{response?.emergency_recommendation || "No escalation recommendation has been generated yet."}</p>
              <small>
                {response?.disclaimer ||
                  "PulseGuard AI does not provide final medical diagnosis. Emergency cases require local emergency services."}
              </small>
            </article>
          </div>

          <section className="insight-band">
            <div>
              <h3>Operational insights</h3>
              {(response?.operational_insights || [
                "Voice intake, telemetry, AI risk, and escalation stages are ready.",
                "Monitoring is available through Prometheus, Grafana, and Loki.",
              ]).map((item) => (
                <p key={item}>
                  <CheckCircle2 size={16} />
                  {item}
                </p>
              ))}
            </div>
            <div>
              <h3>Safety actions</h3>
              {(response?.safety_actions || [
                "Use probabilistic language.",
                "Avoid diagnosis claims.",
                "Escalate severe symptoms to clinical professionals.",
              ]).map((item) => (
                <p key={item}>
                  <ShieldCheck size={16} />
                  {item}
                </p>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
