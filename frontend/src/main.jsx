import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, Send } from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function App() {
  const [message, setMessage] = useState("I have fever, dizziness, and chest pain");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "demo", message }),
      });
      setResponse(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="triage">
        <div className="topbar">
          <Activity size={24} />
          <h1>Healthcare AI Triage Assistant</h1>
        </div>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
        <button onClick={submit} disabled={loading}>
          <Send size={18} />
          {loading ? "Assessing..." : "Assess symptoms"}
        </button>
        {response && (
          <div className="result">
            <div className="score">Emergency score: {response.emergency_score}/100</div>
            <p>{response.guidance}</p>
            <strong>{response.emergency_recommendation}</strong>
            <small>{response.disclaimer}</small>
          </div>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

