const { React, motion, Icons } = window;

const CinematicIntro = ({ onComplete, soundEnabled }) => {
  // Operational phase simulation tracking
  const [scene, setScene] = React.useState(1);
  
  // Scene 1 Interactive states
  const [investigated, setInvestigated] = React.useState(false);
  const [scene1Logs, setScene1Logs] = React.useState([
    "Production alert triggered.",
    "Payment API latency exceeded threshold."
  ]);

  // Scene 2 Terminal manipulation states
  const [isPaused, setIsPaused] = React.useState(false);
  const [selectedTrace, setSelectedTrace] = React.useState(null);
  const [highlightedImpact, setHighlightedImpact] = React.useState(null); // 'redis', 'pods', 'cpu'
  const [logsStream, setLogsStream] = React.useState([
    { id: 1, text: "[ERROR] Pod payment-service-cf89d status: CrashLoopBackOff", type: "crash", service: "payment-pods" },
    { id: 2, text: "[CRITICAL] Redis connection pool exhausted: Max connections reached", type: "redis", service: "redis-cluster" },
    { id: 3, text: "[WARN] Memory pressure threshold exceeded on node-k8s-worker-3", type: "mem", service: "worker-node" },
    { id: 4, text: "[TIMEOUT] GET /v1/payments/process - 504 Gateway Timeout", type: "api", service: "ingress-gateway" },
  ]);
  const [cpuUsage, setCpuUsage] = React.useState(95);

  // Scene 3 AI Streaming Reasoning phases
  const [aiAnalysisStage, setAiAnalysisStage] = React.useState(0); // 0: Idle, 1: Scanning, 2: Correlating, 3: Blast Radius, 4: RCA Complete
  const [confidenceScore, setConfidenceScore] = React.useState(12);
  const [streamedText, setStreamedText] = React.useState("");

  // Scene 4 Interactive Resolutions branching
  const [selectedAction, setSelectedAction] = React.useState(null);
  const [actionFeedback, setActionFeedback] = React.useState("");
  const [isFullyRecovered, setIsFullyRecovered] = React.useState(false);

  // Live simulation log spawner for Scene 2
  React.useEffect(() => {
    if (scene !== 2 || isPaused) return;
    const interval = setInterval(() => {
      const msgs = [
        { text: "[FATAL] Readiness probe failed: connection refused tcp:6379", type: "redis", service: "redis-cluster" },
        { text: "[ERROR] Liveness probe restarting pod payment-service-cf89d", type: "crash", service: "payment-pods" },
        { text: "[WARN] API Latency surging past 5,204ms threshold limit", type: "api", service: "ingress-gateway" },
        { text: "[METRIC] CPU core load spiked to 98% during garbage collect", type: "cpu", service: "worker-node" }
      ];
      const nextMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogsStream(prev => [...prev.slice(-15), { id: Date.now(), ...nextMsg }]);
      setCpuUsage(prev => Math.min(99, Math.max(90, prev + Math.floor(Math.random() * 9) - 4)));
    }, 800);
    return () => clearInterval(interval);
  }, [scene, isPaused]);

  // Handle Triggering Investigation in Scene 1
  const handleInvestigate = () => {
    setInvestigated(true);
    // Dynamically spawn remaining breakdown context items
    setTimeout(() => setScene1Logs(l => [...l, "Senior engineer paged."]), 400);
    setTimeout(() => setScene1Logs(l => [...l, "10,842 logs generated."]), 900);
    setTimeout(() => setScene1Logs(l => [...l, "23 minutes lost identifying the root cause."]), 1400);
    // Unlock transition to Interactive Terminal Chaos after brief absorption
    setTimeout(() => setScene(2), 2800);
  };

  // Handle Triggering Progressive AI Analysis in Scene 3
  const handleRunAiAnalysis = () => {
    setScene(3);
    setAiAnalysisStage(1);
    
    // Stage 1: Scanning Logs
    const t1 = setTimeout(() => {
      setAiAnalysisStage(2);
      setConfidenceScore(48);
    }, 1800);

    // Stage 2: Correlating Deployments
    const t2 = setTimeout(() => {
      setAiAnalysisStage(3);
      setConfidenceScore(79);
    }, 3600);

    // Stage 3: Detecting Blast Radius
    const t3 = setTimeout(() => {
      setAiAnalysisStage(4);
      setConfidenceScore(99.4);
      
      // Typewriter sequence for final probable cause output
      const finalRca = "Probable Root Cause: Redis connection exhaustion after deployment v2.1. Maximum connections scaling parameter threshold matched incorrectly.";
      let curr = 0;
      const typeInt = setInterval(() => {
        curr += 2;
        if (curr <= finalRca.length) {
          setStreamedText(finalRca.slice(0, curr));
        } else {
          clearInterval(typeInt);
          // Unlock Scene 4 resolution interactive choices
          setTimeout(() => setScene(4), 1500);
        }
      }, 20);
    }, 5400);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  };

  // Handle Response Option clicks in Scene 4
  const handleSelectAction = (actionType) => {
    setSelectedAction(actionType);
    
    if (actionType === 'restart') {
      setActionFeedback("Restarting Redis cache instances... Latency temporarily dropped to 40ms. Failure re-escalating due to saturated descriptor leak.");
      // Partial recovery simulation dipping metrics briefly then jumping back
      setCpuUsage(75);
      setTimeout(() => {
        setCpuUsage(94);
        setActionFeedback("⚠️ Incident re-escalated: TCP descriptors remaining exhausted. Alternative intervention highly recommended.");
      }, 3500);
    } else if (actionType === 'scale') {
      setActionFeedback("Scaling replica units to max (16 pods)... API gateway throwing Gateway Timeout errors under connection thrashing loops.");
      setCpuUsage(85);
      setTimeout(() => {
        setCpuUsage(96);
        setActionFeedback("⚠️ Incident re-escalated: Pod storm saturating cluster state engine. Rollback deployment recommended.");
      }, 3500);
    } else if (actionType === 'ignore') {
      setActionFeedback("Alert ignored. Error metrics increasing by +412% across ingress proxy nodes.");
      setCpuUsage(99);
    } else if (actionType === 'rollback') {
      setActionFeedback("Executing native kubectl rollout undo sequence... Reversing deployment parameters cleanly.");
      setIsFullyRecovered(true);
      // Cinematic stabilization
      let cpuInt = setInterval(() => {
        setCpuUsage(prev => {
          if (prev <= 35) {
            clearInterval(cpuInt);
            return 35;
          }
          return prev - 8;
        });
      }, 100);

      setTimeout(() => {
        setActionFeedback("✅ Subsystems recovered to 100% stable SLA levels. Handing over operational command desktop.");
        setTimeout(() => onComplete(), 1800);
      }, 2200);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#08080c] via-[#0b0c12] to-[#040406] text-white font-sans flex flex-col justify-between select-none">
      
      {/* Dynamic atmospheric ambient particle matrix */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        {/* Glow modifiers linked directly to active interactive simulation stages */}
        <div className={`absolute top-1/4 left-1/4 w-[32rem] h-[32rem] rounded-full blur-[140px] transition-all duration-1000 ${
          scene === 3 || isFullyRecovered ? 'bg-emerald-600/15' : 'bg-red-600/15 animate-pulse'
        }`} />
        <div className="absolute bottom-1/3 right-1/4 w-[24rem] h-[24rem] bg-cyan-500/10 rounded-full blur-[120px]" />

        {/* Dynamic miniature floating cluster interdependency flow hints */}
        <div className="absolute top-20 right-16 w-3 h-3 rounded-full bg-red-500/30 animate-ping" />
        <div className="absolute bottom-20 left-32 w-2 h-2 rounded-full bg-cyan-400/40 animate-pulse" />
      </div>

      {/* TOP HEADER CONTROLS / SCENE OPERATOR TABS */}
      <div className="relative z-20 w-full px-6 py-4 flex flex-wrap justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs uppercase tracking-widest text-red-400 font-mono font-bold">
            ⚡ INCIDENT SIMULATION SUITE
          </span>
          <span className="hidden sm:inline text-xs font-mono text-gray-500">| USER AGENCY ACTIVE</span>
        </div>

        {/* Phase navigation control shortcuts for seamless hackathon delivery scrub */}
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map(s => (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={`h-2 rounded-full transition-all duration-300 ${
                scene === s 
                  ? 'w-10 bg-gradient-to-r from-red-500 to-amber-500 shadow-[0_0_10px_#ef4444]' 
                  : s < scene 
                  ? 'w-4 bg-white/40' 
                  : 'w-4 bg-white/10'
              }`}
              title={`Jump directly to Operational Phase ${s}`}
            />
          ))}
          <span className="text-xs font-mono text-gray-400 pl-2">PHASE {scene}/4</span>
        </div>

        <button
          onClick={onComplete}
          className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-cyan-400 transition-colors flex items-center space-x-1"
        >
          <span>Skip to Live Desktop</span>
          <Icons.ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CORE EXPERIENCE STAGES THEATER */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-6xl mx-auto w-full py-4">
        
        {/* ================================================== */}
        {/* SCENE 1 — INCIDENT DETECTION */}
        {/* ================================================== */}
        {scene === 1 && (
          <div className="flex flex-col items-center text-center max-w-2xl animate-fade-in w-full">
            <div className="text-xs font-mono tracking-[0.3em] text-red-500 border border-red-500/30 bg-red-500/10 px-4 py-1.5 rounded-full mb-6 animate-pulse">
              SYSTEM TIME: 03:47 UTC
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
              Critical Incident Detected
            </h1>
            <p className="text-sm md:text-base text-gray-400 font-mono mb-8">
              Payment Gateway ingress channels experiencing high dropped frame indices.
            </p>

            {/* Interactive Alert Cards Stream list */}
            <div className="w-full space-y-3 font-mono text-left bg-black/40 p-4 rounded-xl border border-white/5 mb-8">
              {scene1Logs.map((log, idx) => (
                <div 
                  key={idx}
                  className="flex items-center space-x-3 text-xs md:text-sm border-l-2 border-red-500 pl-3 py-1.5 bg-red-500/[0.03]"
                >
                  <Icons.TerminalIcon className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-gray-200 tracking-wide font-medium">{log}</span>
                  {idx === scene1Logs.length - 1 && investigated && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      Streaming
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Core Interaction trigger element unlocking scene progression */}
            {!investigated ? (
              <button
                onClick={handleInvestigate}
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 font-mono font-bold text-base text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 flex items-center space-x-2">
                  <Icons.Eye className="w-5 h-5 animate-pulse" />
                  <span>Investigate Incident</span>
                </span>
              </button>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
                  <Icons.RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synchronizing downstream failure logs...</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">Unlocking Interactive Terminal Desktop</span>
              </div>
            )}
          </div>
        )}

        {/* ================================================== */}
        {/* SCENE 2 — INTERACTIVE TERMINAL CHAOS */}
        {/* ================================================== */}
        {scene === 2 && (
          <div className="w-full h-full flex flex-col justify-between max-h-[700px] animate-fade-in space-y-4">
            
            {/* Top Interactive instruction marquee */}
            <div className="bg-black/40 px-4 py-2 rounded-lg border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-gray-400">
                👉 <strong className="text-white font-bold">OPERATIONAL CONTROL:</strong> Click any stack trace below to highlight impacted infrastructure nodes or freeze logging pipes.
              </span>

              {/* Pause/Resume toggler */}
              <button
                onClick={() => setIsPaused(p => !p)}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-all ${
                  isPaused ? 'bg-amber-500 text-black shadow-[0_0_10px_#f59e0b]' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {isPaused ? '▶ Logging Paused' : '⏸ Pause Logging'}
              </button>
            </div>

            {/* Split Theater: Interactive Console Left + Reactive Impact Panel Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
              
              {/* Interactive Terminal log body */}
              <div className="lg:col-span-2 rounded-xl border border-red-500/40 bg-[#0a0202]/95 backdrop-blur-xl flex flex-col shadow-[0_0_40px_rgba(239,68,68,0.1)] overflow-hidden relative">
                <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-500/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 font-bold">K8S_SRE_CONSOLE // LIVE_PIPE</span>
                  </div>
                  <span className="text-gray-500 text-[10px]">Hover records to trace routes</span>
                </div>

                {/* Log entries container */}
                <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-red-500/20">
                  {logsStream.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => {
                        setSelectedTrace(log);
                        setHighlightedImpact(log.type === 'redis' ? 'redis' : log.type === 'crash' ? 'pods' : 'cpu');
                      }}
                      onMouseEnter={() => setHighlightedImpact(log.type === 'redis' ? 'redis' : log.type === 'crash' ? 'pods' : 'cpu')}
                      className={`p-2 rounded cursor-pointer transition-all border break-all ${
                        selectedTrace?.id === log.id 
                          ? 'bg-red-500/20 border-red-500 text-white font-bold translate-x-1 shadow-sm' 
                          : 'bg-black/30 border-transparent hover:bg-red-500/10 text-red-300 hover:text-white hover:border-red-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span>{log.text}</span>
                        <span className="text-[9px] uppercase bg-red-950 px-1.5 py-0.2 rounded text-red-400 border border-red-800/30 shrink-0">
                          {log.service}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-red-500/60 flex items-center space-x-2">
                    <span>root@opspilot-master:~# listening for pod failures</span>
                    <span className="w-2 h-3 bg-red-500 inline-block animate-pulse" />
                  </div>
                </div>

                {/* Lower Action bar encouraging user-driven progression */}
                <div className="p-3 bg-black/60 border-t border-red-500/20 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 hidden sm:inline">
                    {selectedTrace ? `Inspecting trace: ${selectedTrace.service}` : 'Select error records above to trigger RCA'}
                  </span>
                  
                  {/* Hero Unlock AI button displayed dynamically inline or permanent */}
                  <button
                    onClick={handleRunAiAnalysis}
                    className="px-4 py-2 rounded bg-gradient-to-r from-emerald-500 to-cyan-500 font-mono font-bold text-xs text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all uppercase tracking-wider hover:scale-105 active:scale-95 ml-auto"
                  >
                    Run AI Root Cause Analysis →
                  </button>
                </div>
              </div>

              {/* Reactive System Telemetry / Inspection summary panel */}
              <div className="flex flex-col space-y-4">
                
                {/* CPU Saturation monitor */}
                <div className={`p-4 rounded-xl border transition-all ${
                  highlightedImpact === 'cpu' ? 'bg-red-950/40 border-red-500 scale-[1.02]' : 'bg-black/40 border-white/5'
                }`}>
                  <span className="text-xs font-mono uppercase text-gray-400 block mb-1">CPU Load Core State</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-black font-mono text-red-500 tracking-tighter">
                      {cpuUsage}%
                    </span>
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                      Exhaustion
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${cpuUsage}%` }} />
                  </div>
                  {highlightedImpact === 'cpu' && (
                    <span className="text-[10px] font-mono text-gray-400 mt-2 block italic text-cyan-400">
                      ⚡ Garbage collection triggered by memory leak thrashing.
                    </span>
                  )}
                </div>

                {/* Reactive Topology Highlight Panel */}
                <div className={`flex-1 p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  highlightedImpact === 'redis' || highlightedImpact === 'pods'
                    ? 'bg-red-950/20 border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    : 'bg-black/40 border-white/5'
                }`}>
                  <div>
                    <span className="text-xs font-mono uppercase text-gray-400 block mb-3">
                      Reactive Blast Radius Trace
                    </span>

                    {/* Miniature interactive node visual maps */}
                    <div className="space-y-2 font-mono text-xs">
                      <div className={`p-2 rounded border flex items-center justify-between transition-colors ${
                        highlightedImpact === 'pods' ? 'bg-red-500/20 border-red-500 text-white font-bold' : 'bg-white/[0.02] border-white/5 text-gray-400'
                      }`}>
                        <span className="flex items-center space-x-2">
                          <Icons.Cpu className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="truncate">payment-service instances</span>
                        </span>
                        <span className="text-[10px] uppercase text-red-400">CrashLoop</span>
                      </div>

                      <div className={`p-2 rounded border flex items-center justify-between transition-colors ${
                        highlightedImpact === 'redis' ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold' : 'bg-white/[0.02] border-white/5 text-gray-400'
                      }`}>
                        <span className="flex items-center space-x-2">
                          <Icons.Database className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate">redis-cluster pooling</span>
                        </span>
                        <span className="text-[10px] uppercase text-amber-400">Timed Out</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed inspection descriptor display */}
                  <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-gray-400">
                    {selectedTrace ? (
                      <div className="space-y-1">
                        <span className="text-white font-bold block text-xs">Selected Stack Breakdown:</span>
                        <p className="text-[10px] text-gray-300 leading-tight">
                          {selectedTrace.text.includes('exhausted') ? 'Connection allocation boundaries hit limit (max: 200). Connections refused.' : 'Pod health probe returned 503 HTTP status. Re-scheduling loops blocked.'}
                        </p>
                      </div>
                    ) : (
                      <span>Hover logs to observe interactive component binding highlights.</span>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* SCENE 3 — USER-ACTIVATED AI INTERVENTION */}
        {/* ================================================== */}
        {scene === 3 && (
          <div className="w-full flex flex-col items-center justify-center animate-fade-in max-w-3xl space-y-8 py-8">
            
            {/* Real-time analytical progressive states marquee */}
            <div className="text-center">
              <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 inline-block mb-3 animate-pulse">
                ⚡ AUTONOMOUS COMPUTATION PIPELINE ACTIVE
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white font-sans">
                Real-Time Root Cause Analysis
              </h2>
            </div>

            {/* Stages visualization flow */}
            <div className="w-full grid grid-cols-4 gap-2 font-mono text-[10px] md:text-xs">
              {[
                { label: "Scanning Logs", stage: 1 },
                { label: "Correlating Deploys", stage: 2 },
                { label: "Blast Radius Trace", stage: 3 },
                { label: "RCA Completed", stage: 4 }
              ].map((step) => (
                <div 
                  key={step.stage} 
                  className={`p-2 md:p-3 rounded-lg border text-center transition-all duration-500 ${
                    aiAnalysisStage >= step.stage 
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-black/40 border-white/5 text-gray-600'
                  }`}
                >
                  <span className="block">{step.label}</span>
                  <div className="mt-1 flex items-center justify-center">
                    {aiAnalysisStage === step.stage ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ) : aiAnalysisStage > step.stage ? (
                      <span className="text-emerald-400 text-[10px]">✔</span>
                    ) : (
                      <span className="text-gray-700">•</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Streaming Analysis Theater card */}
            <div className="w-full rounded-2xl border-2 border-emerald-500/40 bg-[#020e09]/90 backdrop-blur-2xl p-6 md:p-8 relative shadow-[0_0_60px_rgba(16,185,129,0.15)] min-h-[220px] flex flex-col justify-between">
              
              {/* Confidence Counter Top corner */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/60 px-3 py-1 rounded-full border border-white/5">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Confidence</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{confidenceScore}%</span>
              </div>

              <div>
                <span className="text-xs font-mono text-gray-500 uppercase block mb-2">Streaming AI reasoning engine</span>
                <div className="text-sm md:text-base font-mono text-emerald-300/90 leading-relaxed min-h-[80px]">
                  {streamedText || (
                    <span className="text-gray-600 italic">Synthesizing node telemetry graphs and event logs...</span>
                  )}
                  {aiAnalysisStage < 4 && (
                    <span className="w-2 h-4 bg-emerald-400 inline-block align-middle ml-1 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Lower Info trigger unlocking scene 4 resolution menu */}
              <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs font-mono text-gray-400 mt-6">
                <span>Affected Services: <strong className="text-white">payment-api, checkout-gateway</strong></span>
                {aiAnalysisStage === 4 ? (
                  <span className="text-cyan-400 font-bold animate-pulse">Proceeding to Remediation Options →</span>
                ) : (
                  <span className="text-emerald-500/80 italic animate-pulse">Deep inspection in progress...</span>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* SCENE 4 — INTERACTIVE INCIDENT RESOLUTION */}
        {/* ================================================== */}
        {scene === 4 && (
          <div className="w-full flex flex-col items-center justify-center animate-fade-in max-w-4xl space-y-8 py-6">
            
            <div className="text-center max-w-xl">
              <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20 inline-block mb-3">
                🎯 OPERATIONAL ACTION REQUIRED
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white font-sans">
                Choose Incident Response
              </h2>
              <p className="text-xs md:text-sm text-gray-400 font-mono mt-2">
                OpsPilot AI computed 4 custom mitigation trajectories. Select an execution path below to observe real-time cluster telemetry recovery behavior.
              </p>
            </div>

            {/* Interactive choices response options grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option 1: Rollback Deployment (Ultimate Successful Path) */}
              <button
                onClick={() => handleSelectAction('rollback')}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  selectedAction === 'rollback' 
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                    : 'bg-black/40 hover:bg-white/[0.03] border-white/5 hover:border-emerald-500/40'
                }`}
              >
                <div className="absolute top-0 right-0 px-2.5 py-0.5 rounded-bl bg-emerald-500 text-black font-mono font-bold text-[9px] uppercase tracking-wider">
                  ⭐ AI Recommended
                </div>
                <h3 className="font-bold text-white text-sm md:text-base flex items-center space-x-2">
                  <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Rollback Deployment v2.1</span>
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-1.5 leading-relaxed">
                  Instantly reverses scaling parameter configuration. Completely restores stable Redis socket connection availability.
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span>Recovery likelihood: 99.4%</span>
                  <span className="group-hover:underline">Execute Command →</span>
                </div>
              </button>

              {/* Option 2: Restart Redis (Sub-optimal Partial Loop) */}
              <button
                onClick={() => handleSelectAction('restart')}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  selectedAction === 'restart' 
                    ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                    : 'bg-black/40 hover:bg-white/[0.03] border-white/5 hover:border-amber-500/40'
                }`}
              >
                <h3 className="font-bold text-gray-200 text-sm md:text-base flex items-center space-x-2">
                  <Icons.RefreshCw className="w-4 h-4 text-amber-400" />
                  <span>Restart Redis Cache Nodes</span>
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-1.5 leading-relaxed">
                  Flushes deadlocked sockets instantly. Provides brief latency drop before leak re-saturates remaining network pipes.
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-amber-500">
                  <span>Recovery likelihood: Temporary Relief</span>
                  <span className="group-hover:underline">Simulate Flush →</span>
                </div>
              </button>

              {/* Option 3: Scale Replicas */}
              <button
                onClick={() => handleSelectAction('scale')}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  selectedAction === 'scale' 
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                    : 'bg-black/40 hover:bg-white/[0.03] border-white/5 hover:border-cyan-500/40'
                }`}
              >
                <h3 className="font-bold text-gray-200 text-sm md:text-base flex items-center space-x-2">
                  <Icons.Layers className="w-4 h-4 text-cyan-400" />
                  <span>Scale Up Pod Replicas</span>
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-1.5 leading-relaxed">
                  Spawns additional backend units to distribute route queries. Increases overall Redis thrashing due to unthrottled connection requests.
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>Recovery likelihood: High Risk</span>
                  <span className="group-hover:underline">Scale Up →</span>
                </div>
              </button>

              {/* Option 4: Ignore Incident */}
              <button
                onClick={() => handleSelectAction('ignore')}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  selectedAction === 'ignore' 
                    ? 'bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : 'bg-black/40 hover:bg-white/[0.03] border-white/5 hover:border-red-500/40'
                }`}
              >
                <h3 className="font-bold text-gray-200 text-sm md:text-base flex items-center space-x-2">
                  <Icons.AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Ignore & Suppress Alert</span>
                </h3>
                <p className="text-xs font-mono text-gray-400 mt-1.5 leading-relaxed">
                  Suppresses PagerDuty telemetry broadcasts. System state continues linear error degradation across edge microservice gateways.
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-red-400">
                  <span>Recovery likelihood: 0%</span>
                  <span className="group-hover:underline">Ignore Alert →</span>
                </div>
              </button>

            </div>

            {/* Dynamic System Output reaction stream */}
            {actionFeedback && (
              <div className="w-full p-4 rounded-xl border border-white/10 bg-black/80 font-mono text-xs animate-fade-in relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-1 ${
                  isFullyRecovered ? 'bg-emerald-500' : selectedAction === 'rollback' ? 'bg-cyan-500' : 'bg-amber-500'
                }`} />
                <span className="text-gray-500 uppercase block text-[10px] mb-1">Live Telemetry Response Console</span>
                <p className={`text-sm ${isFullyRecovered ? 'text-emerald-300 font-bold' : 'text-gray-200'}`}>
                  {actionFeedback}
                </p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* FOOTER INTERACTION INSTRUCTION BAR */}
      <div className="relative z-20 w-full px-6 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 border-t border-white/5 bg-black/20 font-mono">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <span className="text-gray-400">💡 Tip: You can invoke the floating command palette anytime via <strong className="text-white font-bold bg-white/10 px-1 rounded">CMD+K</strong></span>
        </div>

        <div>
          OPSPILOT SRE ARCHITECTURE // ENTERPRISE AGENCY ACTIVE • CHOOSE A MITIGATION OPTION TO RESOLVE
        </div>
      </div>

    </div>
  );
};

window.CinematicIntro = CinematicIntro;
