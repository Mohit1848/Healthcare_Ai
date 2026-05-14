import * as React from "react";
import { Activity, Clock } from "lucide-react";

const Icons = { Activity, Clock };
const API_URL = import.meta.env.VITE_API_URL || "/api";
const DEFAULT_MESSAGE = "I have fever, dizziness, chest pain, and trouble breathing.";

const Sparkline = ({ data, color, className = "" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(' ');
  return (
    <svg viewBox="0 -10 100 120" preserveAspectRatio="none" className={`w-full h-6 overflow-visible ${className}`}>
      <polyline fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} className="opacity-90" />
    </svg>
  );
};

const App = () => {
  // Continuous scroll mapping tracked cleanly from 0.0 to 1.0
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [systemClock, setSystemClock] = React.useState('');

  // Floating Command Palette state
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  const [paletteSearch, setPaletteSearch] = React.useState('');

  // Interruption controls
  const [autoScrollIntervalId, setAutoScrollIntervalId] = React.useState(null);
  const [actionFeedback, setActionFeedback] = React.useState('');
  
  // Compact Topology Node inspection selections
  const [selectedNodeId, setSelectedNodeId] = React.useState('node3');

  const [patientMessage, setPatientMessage] = React.useState(DEFAULT_MESSAGE);
  const [triageResponse, setTriageResponse] = React.useState(null);
  const [triageLoading, setTriageLoading] = React.useState(false);
  const [triageError, setTriageError] = React.useState("");
  
  // Enterprise Copilot State
  const [chatInput, setChatInput] = React.useState('');
  const [aiThinking, setAiThinking] = React.useState(false);
  
  const [chatMessages, setChatMessages] = React.useState([
    { id: 1, sender: 'ai', text: '⚡ PulseGuard Clinical Intelligence online. Ready to synthesize telemetry buffers.' }
  ]);

  // Production Event logs arrays
  const [eventFeed, setEventFeed] = React.useState([
    { id: 1, time: '18:00:12', text: 'Patient ID-7422 registered at Triage Intake.', type: 'info' },
    { id: 2, time: '18:01:45', text: 'Telemetry synchronization streams active.', type: 'success' }
  ]);

  const [terminalLogs, setTerminalLogs] = React.useState([
    { id: 1, time: '14:10', text: "SpO2 stabilized at 98%. Heart Rate nominal at 72 BPM.", label: "[MONITOR]" },
    { id: 2, time: '14:11', text: "Diagnostic voice intake active in Kannada & Hindi.", label: "[SYSTEM]" }
  ]);

  const score = triageResponse?.emergency_score ?? 0;
  const riskTone = score >= 70 ? "high" : score >= 30 ? "medium" : "low";
  const selectedRiskNode = riskTone === "high" ? "node4" : riskTone === "medium" ? "node3" : "node1";
  const activeRiskLabel = triageResponse?.risk_level || "Awaiting Triage";
  const clinicalSummary =
    triageResponse?.clinical_summary ||
    "Submit patient symptoms to activate your backend triage engine, RAG lookup, risk scoring, and safety guardrails.";
  const guidance =
    triageResponse?.guidance ||
    "No live backend assessment has been run yet. Enter symptoms and activate triage.";
  const recommendation =
    triageResponse?.emergency_recommendation ||
    "No escalation recommendation has been generated yet.";
  const language = triageResponse?.language || "Pending";
  const ragChunks = triageResponse?.telemetry?.rag_context_chunks ?? 0;

  // High-fidelity UTC System Clock ticker
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSystemClock(now.toISOString().split('T')[1].slice(0, 8) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous Scroll progress mapping listener
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global CMD+K Palette Listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if (e.key === 'Escape') setShowCommandPalette(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    setSelectedNodeId(selectedRiskNode);
  }, [selectedRiskNode]);

  React.useEffect(() => {
    if (!triageResponse) return;
    const timeNow = new Date().toISOString().split('T')[1].slice(0, 5);
    setTerminalLogs(prev => [
      ...prev.slice(-5),
      { id: Date.now(), time: timeNow, text: `Backend triage completed: ${triageResponse.risk_level} at ${triageResponse.emergency_score}/100.`, label: score >= 70 ? "[CRITICAL]" : score >= 30 ? "[AI CORE]" : "[SYSTEM]" },
      { id: Date.now() + 1, time: timeNow, text: `RAG context chunks: ${triageResponse.telemetry?.rag_context_chunks ?? 0}. Language: ${triageResponse.language}.`, label: "[RAG]" },
    ]);
    setChatMessages(prev => [
      ...prev,
      { id: Date.now() + 2, sender: 'ai', text: triageResponse.clinical_summary },
    ]);
  }, [triageResponse, score]);

  // Highly controlled chapter indices mapping real-time viewport displays
  const getChapterIndex = () => {
    if (scrollProgress < 0.12) return 1;
    if (scrollProgress < 0.28) return 2;
    if (scrollProgress < 0.50) return 3;
    if (scrollProgress < 0.70) return 4;
    if (scrollProgress < 0.85) return 5;
    return 6;
  };

  const currentChapter = getChapterIndex();

  // Controlled stream simulator
  React.useEffect(() => {
    if (scrollProgress >= 0.15 && scrollProgress < 0.50) {
      const interval = setInterval(() => {
        const msgs = [
          { text: "Oxygen saturation boundary breached (89% ↓).", label: "[CRITICAL]" },
          { text: "Heart rate variability scaling rapidly (135 BPM ↑).", label: "[CRITICAL]" },
          { text: "Predictive engine calculating escalation routing trajectories.", label: "[AI CORE]" }
        ];
        const nextMsg = msgs[Math.floor(Math.random() * msgs.length)];
        const timeNow = new Date().toISOString().split('T')[1].slice(0, 5);
        setTerminalLogs(prev => [...prev.slice(-6), { id: Date.now(), time: timeNow, ...nextMsg }]);
      }, 2400); 
      return () => clearInterval(interval);
    }
  }, [scrollProgress]);

  // Cancel programmatic scroll automation if operator wheel inputs intervene
  React.useEffect(() => {
    const handleWheel = () => {
      if (autoScrollIntervalId) {
        clearInterval(autoScrollIntervalId);
        setAutoScrollIntervalId(null);
        const timeStr = new Date().toTimeString().split(' ')[0];
        setEventFeed(f => [{ id: Date.now(), time: timeStr, text: '⏸️ OPERATOR: Auto-scroll sequence manually intercepted', type: 'warn' }, ...f]);
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [autoScrollIntervalId]);

  // Scroll traversal executor
  const scrollToChapterOffset = (targetProgress) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = maxScroll * targetProgress;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const submitTriage = async () => {
    setTriageLoading(true);
    setTriageError("");
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: "pulseguard-ui", message: patientMessage }),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const data = await res.json();
      setTriageResponse(data);
      const timeStr = new Date().toTimeString().split(' ')[0];
      setEventFeed(f => [
        { id: Date.now(), time: timeStr, text: `LIVE TRIAGE: ${data.risk_level} generated by backend /chat`, type: data.emergency_score >= 70 ? 'warn' : 'success' },
        ...f,
      ]);
      scrollToChapterOffset(data.emergency_score >= 70 ? 0.4 : data.emergency_score >= 30 ? 0.28 : 0.98);
    } catch (err) {
      setTriageError("Could not reach the backend /chat endpoint. Make sure the API is running.");
    } finally {
      setTriageLoading(false);
    }
  };

  // Execute remediation action with luxury sinusoidal easing traversal
  const handlePrimaryAction = () => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    
    setActionFeedback(`${recommendation} Handoff summary prepared from backend triage response.`);
    setEventFeed(f => [{ id: Date.now(), time: timeStr, text: '✅ ESCALATION: Duty Physician alerted. Patient vitals registering stabilization.', type: 'success' }, ...f]);

    if (autoScrollIntervalId) clearInterval(autoScrollIntervalId);
    
    const startY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = maxScroll * 0.98;
    const startTime = Date.now();
    const duration = 2400; // Premium pacing curve

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        clearInterval(interval);
        setAutoScrollIntervalId(null);
        window.scrollTo(0, targetY);
      } else {
        const t = elapsed / duration;
        const easeInOutQuad = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const currentY = startY + (targetY - startY) * easeInOutQuad;
        window.scrollTo(0, currentY);
      }
    }, 16);

    setAutoScrollIntervalId(interval);
  };

  const handleSecondaryAction = (label) => {
    setActionFeedback(`Clinical note recorded: ${label}. Risk telemetry streams continuing to buffer.`);
  };

  const runCopilotQuery = (query) => {
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: query }]);
    setAiThinking(true);
    setTimeout(() => {
      setAiThinking(false);
      let reply = triageResponse
        ? `${triageResponse.assistant_name}: ${triageResponse.clinical_summary} ${triageResponse.disclaimer}`
        : "Submit symptoms first so I can answer from the live backend triage result.";
      if (triageResponse && query.toLowerCase().includes('rag')) reply = `Retrieved ${ragChunks} RAG context chunk(s): ${triageResponse.retrieved_context?.join(' | ') || 'none returned'}.`;
      else if (triageResponse && (query.toLowerCase().includes('risk') || query.toLowerCase().includes('score'))) reply = `Risk score is ${score}/100. Backend risk level: ${triageResponse.risk_level}. Care pathway: ${triageResponse.topology_stage}.`;
      else if (triageResponse && query.toLowerCase().includes('action')) reply = triageResponse.safety_actions?.join(' ') || recommendation;
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    }, 600);
  };

  // ---------------------------------------------------------
  // CLINICAL DICTIONARY & METRICS
  // ---------------------------------------------------------
  const isFailed = score >= 70 || (score >= 30 && currentChapter >= 2 && currentChapter <= 4);
  
  const metrics = {
    spo2: isFailed ? (score >= 70 ? '89%' : '93%') : '98%',
    spo2Trend: isFailed ? '↓' : '',
    spo2Spark: isFailed ? [98, 97, 95, 93, score >= 70 ? 90 : 94, score >= 70 ? 89 : 93, score >= 70 ? 89 : 93] : [98, 98, 97, 98, 98, 98],
    bpm: isFailed ? (score >= 70 ? '135' : '112') : '72',
    bpmTrend: isFailed ? '↑' : '',
    bpmSpark: isFailed ? [72, 85, 100, 112, score >= 70 ? 125 : 110, score >= 70 ? 135 : 112, score >= 70 ? 135 : 112] : [72, 73, 71, 72, 74, 72],
    resp: isFailed ? (score >= 70 ? '28' : '22') : '16',
    respTrend: isFailed ? '↑' : '',
    respSpark: isFailed ? [16, 18, 20, 22, score >= 70 ? 25 : 22, score >= 70 ? 28 : 22, score >= 70 ? 28 : 22] : [16, 15, 16, 16, 17, 16],
    statusStr: triageResponse ? activeRiskLabel.toUpperCase() : 'AWAITING TRIAGE',
    riskScore: `${score}/100`,
  };

  const topoNodes = [ 
    { id: 'node1', label: 'Voice Intake' }, 
    { id: 'node2', label: 'Telemetry' }, 
    { id: 'node3', label: 'AI Risk Engine' }, 
    { id: 'node4', label: 'Escalation Flow' } 
  ];

  // Highly restrained, data-first ambient lighting interpolation style maps
  const getAmbientGlowStyle = () => {
    let color = 'rgba(6,182,212,0.03)'; // Base Clinical Cyan
    if (currentChapter >= 6) color = 'rgba(6,182,212,0.04)'; // Stable Cyan
    else if (currentChapter >= 5) color = 'rgba(16,185,129,0.04)'; // Emerald Recovery
    else if (currentChapter >= 3) color = 'rgba(217,119,6,0.06)'; // Deep Amber Medical Escalation
    else if (currentChapter >= 2) color = 'rgba(217,119,6,0.03)'; // Soft Amber Warning
    
    return {
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
      transform: `scale(${1 + scrollProgress * 0.012})`,
      transition: 'background 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s ease-out'
    };
  };

  // Restrained CSS-animated waveform for Voice Intake
  const VoiceWaveform = ({ active }) => {
    return (
      <div className="flex items-center justify-center space-x-1.5 h-8 px-4 rounded bg-[#0A0B10] border border-[#1A1D24]">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-sm bg-[#06B6D4] transition-all duration-300 ease-in-out`}
            style={{
              height: active ? `${Math.random() * 60 + 20}%` : '20%',
              opacity: active ? 1 : 0.5,
              animation: active ? `pulseWave ${1 + (i * 0.2)}s infinite alternate` : 'none'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#060609] text-[#EDEDEE] font-sans selection:bg-[#06B6D4] selection:text-white relative select-none antialiased">
      <style>{`
        @keyframes pulseWave {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.2); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
      <div className="w-full min-h-[700vh] relative">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between z-10 box-border">
          
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:2.5rem_2.5rem]" />
            <div className="absolute top-1/6 left-1/4 w-[50rem] h-[50rem] rounded-full blur-[140px] pointer-events-none origin-center" style={getAmbientGlowStyle()} />
          </div>

          {/* UPPER ZONE: PREMIUM HEADER BANNER */}
          <header className="relative z-40 h-16 px-4 lg:px-8 border-b border-[#1A1D24] bg-[#060609]/90 backdrop-blur-xl flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-[#06B6D4] to-[#10B981] p-[1px]">
                  <div className="w-full h-full bg-[#060609] rounded-[5px] flex items-center justify-center">
                    <Icons.Activity className="w-4 h-4 text-[#06B6D4]" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight text-white text-sm">PulseGuard <span className="text-[#06B6D4]">AI</span></span>
                  <span className="text-[9px] text-[#8A8F98] font-mono tracking-wider uppercase">Clinical Operations Core</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-5 font-mono text-xs">
              <div className="hidden lg:flex items-center space-x-4 border-r border-[#1A1D24] pr-5">
                <span className="flex items-center space-x-1.5 text-[10px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/20">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></span>
                  <span>MULTILINGUAL: ACTIVE</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[10px] bg-[#06B6D4]/10 text-[#06B6D4] px-2 py-0.5 rounded border border-[#06B6D4]/20">
                  <span className="w-1.5 h-1.5 bg-[#06B6D4] rounded-full animate-pulse"></span>
                  <span>VOICE: LISTENING</span>
                </span>
              </div>
              <div className="hidden lg:flex items-center space-x-2 text-[#8A8F98] pr-2">
                  <Icons.Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span className="text-[#EDEDEE]">{systemClock || '03:47 UTC'}</span>
              </div>
            </div>
          </header>

          {/* UPPER ZONE: COMPACT CLINICAL TOPOLOGY STRIP */}
          <section className="relative z-30 h-14 px-4 lg:px-8 border-b border-[#1A1D24] bg-[#0A0A0F]/90 flex items-center justify-between shrink-0">
            <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-2 font-mono text-xs">
              
              <div className="flex items-center space-x-2 text-[#8A8F98] shrink-0 hidden sm:flex">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider hidden lg:inline">Routing Topology</span>
              </div>

              {/* Nodes Array */}
              <div className="flex-1 flex items-center justify-center max-w-3xl mx-auto px-4">
                {topoNodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <button 
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`px-3 py-1.5 rounded-[4px] border text-[11px] transition-all font-mono whitespace-nowrap relative ${
                        selectedNodeId === node.id ? 'bg-[#1C1E25] border-[#06B6D4] text-white font-bold shadow-sm' : 'bg-[#0E0F14] border-[#1A1D24] text-[#8A8F98] hover:border-[#2A2E39]'
                      }`}
                    >
                      {(i === 1 || i === 2) && currentChapter >= 2 && currentChapter <= 4 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D97706] border-2 border-[#0A0A0F]" />}
                      {node.label}
                    </button>
                    {i < topoNodes.length - 1 && (
                      <div className={`w-8 sm:w-16 h-[2px] relative transition-colors duration-500 mx-2 ${
                        (i === 0 || i === 1) && currentChapter >= 2 && currentChapter <= 4 ? 'bg-[#D97706]' : 'bg-[#2A2D35]'
                      }`}>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* State Chip */}
              <div className="shrink-0 flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-[4px] text-[11px] font-bold tracking-wider uppercase border ${
                  riskTone === "high" ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30' : riskTone === "medium" ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30'
                }`}>
                  {metrics.statusStr}
                </span>
              </div>

            </div>
          </section>

          {/* DYNAMIC NARRATIVE CORE CONTAINMENT ZONE */}
          <main className="relative z-20 flex-1 w-full max-w-6xl mx-auto px-4 lg:px-8 py-6 flex flex-col justify-center items-center overflow-y-auto box-border">
            
            {/* CHAPTER 1: PATIENT INTAKE */}
            {currentChapter === 1 && (
              <div className="w-full animate-fade-in space-y-8 flex flex-col items-center">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">Patient Triage Intake</h1>
                  <p className="text-sm text-[#8A8F98] max-w-xl mx-auto">
                    Multilingual NLP arrays actively parsing incoming clinical symptom records.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mx-auto">
                  {/* Demographic Card */}
                  <div className="p-6 rounded-xl bg-[#0A0B10] border border-[#1A1D24] flex flex-col justify-center space-y-4">
                    <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase border-b border-[#1A1D24] pb-2">Patient Demographics</span>
                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                      <div><span className="text-[#8A8F98]">ID:</span> <span className="text-white">PT-7422</span></div>
                      <div><span className="text-[#8A8F98]">Ward:</span> <span className="text-white">ICU-EAST</span></div>
                      <div><span className="text-[#8A8F98]">Age:</span> <span className="text-white">64</span></div>
                      <div><span className="text-[#8A8F98]">Status:</span> <span className="text-[#06B6D4]">Admitting</span></div>
                    </div>
                  </div>

                  {/* Voice Intake Card */}
                  <div className="p-6 rounded-xl bg-[#0A0B10] border border-[#1A1D24] flex flex-col justify-center space-y-5">
                    <div className="flex items-center space-x-3 pb-3 border-b border-[#1A1D24] w-full">
                      <VoiceWaveform active={true} />
                      <span className="text-[10px] font-mono text-[#06B6D4] font-bold uppercase tracking-widest">Listening</span>
                    </div>
                    <div className="w-full text-left font-mono text-[11px] space-y-3">
                      <div>
                        <div className="text-[#EDEDEE] font-semibold">"ನನಗೆ ಉಸಿರಾಟ ಸಮಸ್ಯೆ ಇದೆ"</div>
                        <div className="text-[#8A8F98] mt-0.5">Translation: <span className="text-[#06B6D4]">I am having breathing difficulty.</span></div>
                      </div>
                      <div>
                        <div className="text-[#EDEDEE] font-semibold">"छाती में हल्का दर्द है"</div>
                        <div className="text-[#8A8F98] mt-0.5">Translation: <span className="text-[#06B6D4]">Mild chest pain observed.</span></div>
                      </div>
                    </div>
                    <textarea
                      value={patientMessage}
                      onChange={(event) => setPatientMessage(event.target.value)}
                      className="w-full min-h-28 rounded bg-[#060609] border border-[#1A1D24] p-3 text-xs text-white placeholder-[#8A8F98] focus:outline-none focus:border-[#06B6D4]"
                      placeholder="Enter patient symptoms for backend triage..."
                    />
                    {triageError && <div className="text-[11px] text-[#D97706] font-mono">{triageError}</div>}
                    <button
                      onClick={submitTriage}
                      disabled={triageLoading || !patientMessage.trim()}
                      className="w-full py-3 rounded bg-[#06B6D4] hover:bg-[#22D3EE] disabled:opacity-50 text-[#060609] font-bold text-sm transition-colors"
                    >
                      {triageLoading ? "Running backend triage..." : "Activate Live Triage"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 2: SYMPTOM ESCALATION */}
            {currentChapter === 2 && (
              <div className="w-full max-w-5xl animate-fade-in space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Clinical Telemetry Fluctuations</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* SpO2 Card */}
                  <div className="lg:col-span-4 p-6 rounded-xl bg-[#0A0B10] border border-[#D97706]/40 flex flex-col justify-between shadow-sm">
                    <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#8A8F98]">Oxygen Saturation (SpO2)</span>
                    <div className="my-6 flex items-baseline space-x-2">
                      <span className="text-6xl font-bold text-white">{metrics.spo2}</span>
                      <span className="text-2xl text-[#D97706] font-bold">{metrics.spo2Trend}</span>
                    </div>
                    <Sparkline data={metrics.spo2Spark} color="#D97706" className="mt-auto" />
                  </div>
                  
                  {/* Audit Trail Log */}
                  <div className="lg:col-span-8 bg-[#0A0B10] border border-[#1A1D24] rounded-xl p-5 font-mono text-[11px] flex flex-col h-[280px]">
                    <div className="text-[#8A8F98] pb-3 border-b border-[#1A1D24] mb-3 font-bold uppercase tracking-widest">Active Audit Trail Logger</div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {terminalLogs.map((log) => (
                        <div key={log.id} className="flex items-start space-x-3 text-[#D1D5DB] leading-relaxed border-l-2 pl-3 border-[#1A1D24]">
                          <span className="text-[#8A8F98] shrink-0 w-12">{log.time}</span>
                          <span className={`shrink-0 font-bold w-24 ${log.label === '[CRITICAL]' ? 'text-[#D97706]' : 'text-[#06B6D4]'}`}>{log.label}</span>
                          <span className="text-white">{log.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 3: AI TRIAGE ACTIVATION - THE 12 COLUMN DASHBOARD REWRITE */}
            {currentChapter === 3 && (
              <div className="w-full animate-fade-in flex flex-col h-full space-y-6">
                <div className="text-center shrink-0">
                  <h2 className="text-3xl font-bold text-white tracking-tight">AI Diagnostic Triage Synthesis</h2>
                </div>
                
                <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
                  
                  {/* LEFT COLUMN: 3 ACTIVE VITALS */}
                  <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
                    <div className="flex-1 p-4 rounded-xl bg-[#0A0B10] border border-[#D97706]/40 flex flex-col justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">SpO2 Level</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-bold text-white">{metrics.spo2}</span>
                        <span className="text-lg text-[#D97706] font-bold">{metrics.spo2Trend}</span>
                      </div>
                      <Sparkline data={metrics.spo2Spark} color="#D97706" className="mt-1" />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-[#0A0B10] border border-[#D97706]/40 flex flex-col justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Heart Rate</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-bold text-white">{metrics.bpm}</span>
                        <span className="text-xs text-[#8A8F98] ml-1">bpm</span>
                        <span className="text-lg text-[#D97706] font-bold">{metrics.bpmTrend}</span>
                      </div>
                      <Sparkline data={metrics.bpmSpark} color="#D97706" className="mt-1" />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-[#0A0B10] border border-[#D97706]/40 flex flex-col justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Resp Rate</span>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-bold text-white">{metrics.resp}</span>
                        <span className="text-xs text-[#8A8F98] ml-1">bpm</span>
                        <span className="text-lg text-[#D97706] font-bold">{metrics.respTrend}</span>
                      </div>
                      <Sparkline data={metrics.respSpark} color="#D97706" className="mt-1" />
                    </div>
                  </div>

                  {/* CENTER COLUMN: DOMINANT AI REASONING STACK */}
                  <div className="lg:col-span-6 flex flex-col space-y-4 min-h-0 justify-center px-2">
                    {/* Reasoning Block 1 */}
                    <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                      <div className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase pb-2 border-b border-[#1A1D24]">[ STEP 01 ] // EVIDENCE EXTRACTION</div>
                      <p className="text-sm text-white font-medium leading-relaxed pt-3">{patientMessage}</p>
                    </div>
                    
                    {/* Reasoning Block 2 */}
                    <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                      <div className="text-[10px] font-mono font-bold text-[#06B6D4] uppercase pb-2 border-b border-[#1A1D24]">[ STEP 02 ] // CONFIDENCE MAPPING</div>
                      <p className="text-sm text-white font-medium leading-relaxed pt-3">Backend score computed at <strong className="text-[#06B6D4] text-base">{score}/100</strong>. Language: {language}. RAG chunks: {ragChunks}.</p>
                    </div>
                    
                    {/* Reasoning Block 3 */}
                    <div className="p-6 rounded-xl bg-[#140D0A] border-2 border-[#D97706] shadow-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                      <div className="text-[11px] font-mono font-bold text-[#D97706] uppercase pb-2 border-b border-[#D97706]/30 flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#D97706] rounded-full animate-pulse"></span>
                        <span>[ STEP 03 ] // OPERATIONAL RECOMMENDATION</span>
                      </div>
                      <p className="text-lg text-white font-bold leading-relaxed pt-3">{clinicalSummary}</p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: SEVERITY ESCALATION ROUTING */}
                  <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
                    <div className="w-full text-center py-2 mb-2 border-b border-[#1A1D24]">
                       <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase tracking-widest">Routing Logic</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0A0B10] border border-[#1A1D24] opacity-40 flex items-center space-x-3">
                      <div className="w-1.5 h-full bg-[#8A8F98] rounded-sm absolute left-0 top-0 bottom-0"></div>
                      <div>
                        <span className="text-[#8A8F98] text-[10px] font-mono font-bold tracking-widest block uppercase">Low Risk</span>
                        <span className="text-white text-xs">Standard Queue</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0A0B10] border border-[#1A1D24] opacity-40 flex items-center space-x-3">
                      <div className="w-1.5 h-full bg-[#F59E0B] rounded-sm absolute left-0 top-0 bottom-0"></div>
                      <div>
                        <span className="text-[#F59E0B] text-[10px] font-mono font-bold tracking-widest block uppercase">Medium Risk</span>
                        <span className="text-white text-xs">Secondary Consult</span>
                      </div>
                    </div>
                    <div className="p-5 rounded-xl bg-[#140C07] border border-[#D97706] flex flex-col justify-center transform scale-[1.02] relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D97706]"></div>
                      <span className="text-[#D97706] text-[11px] font-mono font-bold tracking-widest block uppercase mb-1 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-pulse"></span>
                        <span>High Risk</span>
                      </span>
                      <span className="text-white font-bold text-sm">{activeRiskLabel}</span>
                      <span className="text-[#D97706]/80 text-xs mt-2 italic font-mono">{triageResponse?.topology_stage || "backend pending"}</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* CHAPTER 4: EMERGENCY RISK ASSESSMENT */}
            {currentChapter === 4 && (
              <div className="w-full max-w-4xl animate-fade-in space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Clinical Escalation Routing Matrix</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LOW */}
                  <div className="p-6 rounded-xl bg-[#0A0B10] border border-[#1A1D24] opacity-40 flex flex-col">
                    <span className="text-[#8A8F98] text-[11px] font-mono font-bold tracking-widest mb-2 uppercase">Severity: Low</span>
                    <h4 className="text-white font-bold text-lg mb-2">Home Monitoring</h4>
                    <p className="text-[#8A8F98] text-xs">Vitals within standard operational bounds. Scheduled clinical follow-up applied.</p>
                  </div>
                  {/* MED */}
                  <div className="p-6 rounded-xl bg-[#0A0B10] border border-[#1A1D24] opacity-40 flex flex-col">
                    <span className="text-[#F59E0B] text-[11px] font-mono font-bold tracking-widest mb-2 uppercase">Severity: Medium</span>
                    <h4 className="text-white font-bold text-lg mb-2">Secondary Consult</h4>
                    <p className="text-[#8A8F98] text-xs">Moderate variance detected. Diagnostic re-evaluation queued for physician review.</p>
                  </div>
                  {/* HIGH */}
                  <div className="p-6 rounded-xl bg-[#140C07] border border-[#D97706] shadow-sm flex flex-col transform scale-105 z-10 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-[#D97706]" />
                    <span className="text-[#D97706] text-xs font-mono font-bold tracking-widest mb-2 uppercase flex items-center space-x-2 pt-2">
                      <span className="w-2 h-2 bg-[#D97706] rounded-full animate-pulse"></span>
                      <span>Severity: High</span>
                    </span>
                    <h4 className="text-white font-extrabold text-2xl mb-3 leading-tight">Immediate Emergency Attention</h4>
                    <p className="text-[#FCD34D] text-sm leading-relaxed">{recommendation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 5: PHYSICIAN ESCALATION */}
            {currentChapter === 5 && (
              <div className="w-full max-w-5xl animate-fade-in space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Authorize Physician Dispatch</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Tabular Timeline */}
                  <div className="flex-1 p-6 rounded-xl bg-[#0A0B10] border border-[#1A1D24]">
                    <div className="text-[11px] font-mono font-bold text-[#8A8F98] uppercase pb-3 border-b border-[#1A1D24] mb-4 tracking-widest">Escalation Audit Trail</div>
                    <table className="w-full text-xs font-mono text-left">
                      <tbody className="divide-y divide-[#1A1D24]">
                        <tr>
                          <td className="py-3 text-[#8A8F98] w-24">14:13 UTC</td>
                          <td className="py-3 text-[#D97706] font-bold w-28">[CRITICAL]</td>
                          <td className="py-3 text-[#EDEDEE]">Patient message submitted to /api/chat</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-[#8A8F98]">14:16 UTC</td>
                          <td className="py-3 text-[#D97706] font-bold">[CRITICAL]</td>
                          <td className="py-3 text-[#EDEDEE]">Risk score computed at {score}/100</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-[#8A8F98]">14:18 UTC</td>
                          <td className="py-3 text-[#06B6D4] font-bold">[AI CORE]</td>
                          <td className="py-3 text-[#EDEDEE]">Triage severity designated {activeRiskLabel}</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-[#10B981]">14:20 UTC</td>
                          <td className="py-3 text-[#10B981] font-bold">[SYSTEM]</td>
                          <td className="py-3 text-[#10B981] animate-pulse">{recommendation}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Action Block */}
                  <div className="flex-1 p-8 rounded-xl bg-[#060B10] border border-[#06B6D4]/40 flex flex-col justify-center space-y-6">
                    <span className="text-[#06B6D4] font-mono font-bold text-[11px] tracking-widest uppercase">Primary Triage Action</span>
                    <button onClick={handlePrimaryAction} className="w-full py-4 rounded bg-white hover:bg-[#EDEDEE] text-[#060609] font-bold text-base transition-colors shadow-sm tracking-tight">
                      Dispatch Duty Physician →
                    </button>
                    {actionFeedback && <div className="p-4 rounded bg-[#0A0B10] border border-[#1A1D24] font-mono text-[11px] text-[#10B981] text-center">{actionFeedback}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 6: HEALTHCARE COMMAND CENTER */}
            {currentChapter === 6 && (
              <div className="w-full max-w-6xl animate-fade-in space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Active Triage Cases</span>
                    <span className="text-4xl font-bold text-white mt-3">{triageResponse ? 1 : 0} <span className="text-sm text-[#10B981] font-normal tracking-tight ml-1">{triageResponse ? "live case" : "pending"}</span></span>
                  </div>
                  <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Patient SpO2 Avg</span>
                    <div className="mt-3 flex items-baseline space-x-1.5">
                      <span className="text-4xl font-bold text-[#10B981]">{metrics.spo2}</span>
                      <span className="text-xs text-[#8A8F98]">{activeRiskLabel}</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Patient BPM Avg</span>
                    <span className="text-4xl font-bold text-white mt-3">{metrics.bpm}</span>
                  </div>
                  <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-mono font-bold text-[#8A8F98] uppercase">Current Risk Index</span>
                    <span className="text-4xl font-bold text-white mt-3">{metrics.riskScore}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7 space-y-5 font-mono text-sm text-left">
                    <div className="p-6 rounded-xl bg-[#0A0B10] border border-[#1A1D24] shadow-sm">
                      <span className="text-xs text-[#06B6D4] uppercase block mb-3 font-bold tracking-widest">// Operations Summary</span>
                      <p className="text-[13px] text-[#D1D5DB] leading-relaxed">
                        {clinicalSummary}
                      </p>
                    </div>
                    <div className="p-6 rounded-xl bg-[#0A0B10] border border-[#1A1D24] shadow-sm">
                      <span className="text-xs text-[#06B6D4] uppercase block mb-3 font-bold tracking-widest">// Backend Guidance</span>
                      <p className="text-[13px] text-[#D1D5DB] leading-relaxed">{guidance}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] shadow-sm">
                        <span className="text-[10px] text-[#8A8F98] uppercase block mb-3 font-bold tracking-widest">Operational Insights</span>
                        {(triageResponse?.operational_insights || ["Run live triage to populate backend operational insights."]).map((item) => (
                          <p key={item} className="text-[11px] text-[#D1D5DB] leading-relaxed mb-2">{item}</p>
                        ))}
                      </div>
                      <div className="p-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] shadow-sm">
                        <span className="text-[10px] text-[#8A8F98] uppercase block mb-3 font-bold tracking-widest">Safety Actions</span>
                        {(triageResponse?.safety_actions || ["Safety actions will appear after backend triage completes."]).map((item) => (
                          <p key={item} className="text-[11px] text-[#D1D5DB] leading-relaxed mb-2">{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 rounded-xl bg-[#0A0B10] border border-[#1A1D24] p-5 flex flex-col h-[280px] text-left shadow-sm">
                    <span className="text-[11px] font-mono text-white font-bold pb-3 border-b border-[#1A1D24] flex items-center justify-between mb-3 uppercase tracking-widest">
                      <span>Intelligence Copilot</span>
                      <span className="text-[10px] text-[#10B981] font-normal">● Secure Network</span>
                    </span>
                    <div className="flex-1 overflow-y-auto space-y-3 py-2 font-mono text-[11px]">
                      {chatMessages.map((m) => (
                        <div key={m.id} className={`p-3 rounded-lg leading-relaxed break-words ${m.sender === 'user' ? 'bg-[#1C1E25] text-white ml-auto max-w-[85%]' : 'bg-[#060609] text-[#8A8F98] border border-[#1A1D24]'}`}>
                          {m.text}
                        </div>
                      ))}
                      {aiThinking && <div className="text-[10px] text-[#06B6D4] italic pl-2">Synthesizing telemetry arrays...</div>}
                    </div>
                    <div className="pt-3 border-t border-[#1A1D24] flex items-center space-x-3 font-mono mt-2">
                      <span className="text-[#06B6D4] text-[13px] font-bold">&gt;</span>
                      <input type="text" placeholder="Query patient telemetry metrics..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && chatInput.trim()) { runCopilotQuery(chatInput.trim()); setChatInput(''); } }} className="flex-1 bg-transparent text-[11px] text-white placeholder-[#8A8F98] focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* LOWER ZONE: HIGH-END COMPACT REPLAY DESK SCRUBBER */}
          <footer className="relative z-40 h-12 px-4 lg:px-8 border-t border-[#1A1D24] bg-[#0A0A0F] text-[11px] font-mono text-[#8A8F98] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-white font-bold text-[10px] uppercase">Replay Scrubber:</span>
              <span className="text-[10px] hidden md:inline text-[#4B5563]">// Clinical traversal synchronized natively</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {[
                { label: "Ch 1: Intake", prog: 0.05 },
                { label: "Ch 2: Escalation", prog: 0.20 },
                { label: "Ch 3: AI Triage", prog: 0.40 },
                { label: "Ch 4: Severity", prog: 0.60 },
                { label: "Ch 5: Dispatch", prog: 0.80 },
                { label: "Ch 6: ICU Desk", prog: 0.98 }
              ].map((sch, i) => (
                <button
                  key={i}
                  onClick={() => scrollToChapterOffset(sch.prog)}
                  className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold font-mono transition-colors hidden sm:inline-block ${
                    currentChapter === (i + 1) ? 'bg-[#EDEDEE] text-[#060609]' : 'text-[#8A8F98] hover:text-white'
                  }`}
                >
                  {sch.label}
                </button>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
