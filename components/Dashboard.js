const { React, motion, Icons } = window;

const Dashboard = ({ soundEnabled, toggleSound }) => {
  // Operational telemetries and global interactive states
  const [isFailureTriggered, setIsFailureTriggered] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('topology'); // topology is now central default
  const [systemClock, setSystemClock] = React.useState('');
  
  // Floating Command Palette state
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  const [paletteSearch, setPaletteSearch] = React.useState('');

  // Historical Timeline scrubbing index (0 to 5)
  // 0: Deployment, 1: Spike Detection, 2: Outage Phase, 3: AI Analysis, 4: Remediation, 5: SLA Recovery
  const [timelineIndex, setTimelineIndex] = React.useState(5); // Default to current stable state unless failures trigger

  // Core interactive Topology graph state
  const [selectedNode, setSelectedNode] = React.useState('gateway'); // frontend, gateway, payment, redis, db
  
  // Real-time dynamic Event Feed stacking logs
  const [eventFeed, setEventFeed] = React.useState([
    { id: 1, time: '17:55:01', text: 'Deployment payment-api v2.1 initial spin-up successful', type: 'info' },
    { id: 2, time: '17:56:12', text: 'Auto-scaling heuristic calibrated across edge ingress tier', type: 'info' },
    { id: 3, time: '17:56:45', text: 'Kubernetes API connection telemetry channels bound', type: 'success' }
  ]);

  // AI War room conversation stack
  const [chatMessages, setChatMessages] = React.useState([
    { id: 1, sender: 'ai', text: '⚡ SRE Autonomous Copilot synchronized. Observing live microservice dependency graphs. How can I assist your watch today?' }
  ]);
  const [aiThinking, setAiThinking] = React.useState(false);
  const [aiStreamingText, setAiStreamingText] = React.useState('');
  const [chatInput, setChatInput] = React.useState('');

  // Expandable Incident desk state
  const [expandedIncidentId, setExpandedIncidentId] = React.useState('inc-failed');
  const [incidents, setIncidents] = React.useState([
    { 
      id: 'inc-failed', 
      title: 'Redis Outage / Pod Cascade Storm', 
      service: 'deployment/payment-service', 
      severity: 'CRITICAL SEV-0', 
      time: 'Triggered just now', 
      active: false, // controlled by isFailureTriggered
      rca: 'Connection descriptor parameter bounds exceeded under deployment v2.1 configuration.',
      metrics: 'CPU Core: 96% | Latency: 1,420ms',
      logsSubset: ['[dial tcp 10.244.2.14:6379: i/o timeout]', '[payment-api readiness probe constantly failing]']
    },
    { 
      id: 'inc-base-1', 
      title: 'Memory Leak Spike / Garbage Collector', 
      service: 'checkout-service', 
      severity: 'WARN SEV-2', 
      time: '2 hours ago', 
      active: false,
      rca: 'Identified linear RAM creep inside Node.js V8 isolates. Horizontal pod replication auto-applied.',
      metrics: 'RAM Isolates: 88% | MTTR: 2m 14s',
      logsSubset: ['[V8 GC mark-sweep cycle execution limit warning]']
    }
  ]);

  // Dynamic Metrics Summary values mapped directly to timeline Index to illustrate Before/After transitions
  const getMetricsForTimeline = (tIdx, failureActive) => {
    if (failureActive) {
      return { incidents: 3, mttr: 12, rcaScore: 99.4, uptime: 99.42, latency: '1,420ms', pods: '82/100' };
    }
    switch(tIdx) {
      case 0: return { incidents: 1, mttr: 74, rcaScore: 99.9, uptime: 99.99, latency: '12ms', pods: '100/100' };
      case 1: return { incidents: 2, mttr: 70, rcaScore: 99.6, uptime: 99.85, latency: '240ms', pods: '96/100' };
      case 2: return { incidents: 3, mttr: 45, rcaScore: 99.4, uptime: 99.42, latency: '1,420ms', pods: '82/100' };
      case 3: return { incidents: 3, mttr: 58, rcaScore: 99.4, uptime: 99.45, latency: '820ms', pods: '88/100' };
      case 4: return { incidents: 2, mttr: 65, rcaScore: 99.4, uptime: 99.78, latency: '120ms', pods: '95/100' };
      case 5: default: return { incidents: 1, mttr: 68, rcaScore: 99.4, uptime: 99.98, latency: '14ms', pods: '100/100' };
    }
  };

  const currentMetrics = getMetricsForTimeline(timelineIndex, isFailureTriggered);

  // Command Palette global Keyboard Listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update System UTC Clock ticker
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSystemClock(now.toISOString().split('T')[1].slice(0, 8) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Add random event feed logs periodically to simulate live platform operation
  React.useEffect(() => {
    const interval = setInterval(() => {
      const liveEvents = [
        { text: 'Health probe HTTP GET /metrics acknowledged by cluster routing daemon', type: 'info' },
        { text: 'Ingress node telemetry synchronized with global cache boundary', type: 'info' },
        { text: 'Garbage collect completed on internal telemetry buffer blocks', type: 'success' }
      ];
      if (!isFailureTriggered) {
        const nextEvt = liveEvents[Math.floor(Math.random() * liveEvents.length)];
        const timeStr = new Date().toTimeString().split(' ')[0];
        setEventFeed(f => [{ id: Date.now(), time: timeStr, ...nextEvt }, ...f.slice(0, 15)]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isFailureTriggered]);

  // Execute shortcut actions inside Command Palette
  const executeCommand = (cmdId) => {
    setShowCommandPalette(false);
    const timeStr = new Date().toTimeString().split(' ')[0];
    
    if (cmdId === 'fail') {
      handleTriggerFailure();
    } else if (cmdId === 'rollback') {
      handleApplyRollback();
    } else if (cmdId === 'logs') {
      setActiveTab('incidents');
      setEventFeed(f => [{ id: Date.now(), time: timeStr, text: 'CMD: Ingress streaming logging channels focused', type: 'info' }, ...f]);
    } else if (cmdId === 'warroom') {
      setChatMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: '⚡ Operational logs pulled directly into context screen view.' }]);
    } else if (cmdId === 'restart') {
      setEventFeed(f => [{ id: Date.now(), time: timeStr, text: 'CMD: Restart command issued to checkout-service proxy instances', type: 'warn' }, ...f]);
    }
  };

  // Hero Trigger Interaction transforming user into active operator
  const handleTriggerFailure = () => {
    if (isFailureTriggered) return;
    setIsFailureTriggered(true);
    setTimelineIndex(2); // Jump to Outage Phase in history view
    
    // Set incident card active
    setIncidents(prev => prev.map(inc => inc.id === 'inc-failed' ? { ...inc, active: true } : inc));
    
    // Inject event
    const timeStr = new Date().toTimeString().split(' ')[0];
    setEventFeed(f => [
      { id: Date.now(), time: timeStr, text: '⚠️ CRITICAL: Cascading socket timeouts propagating across Redis layers', type: 'critical' },
      { id: Date.now()+1, time: timeStr, text: '⚠️ CRITICAL: Readiness probes returning 503 on pod instances', type: 'critical' },
      ...f
    ]);

    // Focus topology graph failure node
    setSelectedNode('redis');

    // Trigger sequential AI co-pilot diagnostic stream
    setAiThinking(true);
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'system', text: '⚡ USER TRIGGERED: DEPLOYMENT FAILURE STORM DETECTED' }]);

    setTimeout(() => {
      setAiThinking(false);
      const fullReply = "Detected cascading connection drop across redis-cluster. Root cause points directly to maximum descriptors scaling boundary set in deployment v2.1. Immediate rollout undo recommended to restore route integrity.";
      let curr = 0;
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: '', isStreaming: true }]);
      
      const typeInt = setInterval(() => {
        curr += 2;
        if (curr <= fullReply.length) {
          setAiStreamingText(fullReply.slice(0, curr));
        } else {
          clearInterval(typeInt);
          // Auto add interactive shortcut recommendation bubble
          setChatMessages(p => p.map(m => m.isStreaming ? { ...m, text: fullReply, isStreaming: false, hasAction: true } : m));
        }
      }, 20);
    }, 1800);
  };

  // User agency rollback action handling
  const handleApplyRollback = () => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setEventFeed(f => [
      { id: Date.now(), time: timeStr, text: '✅ REMEDIATION: kubectl rollout undo sequence successfully broadcasted', type: 'success' },
      { id: Date.now()+1, time: timeStr, text: '✅ REMEDIATION: Pod connection loops stabilized. SLA target recovering.', type: 'success' },
      ...f
    ]);

    // Animate timeline recovery forward
    setTimelineIndex(4);
    setTimeout(() => {
      setTimelineIndex(5);
      setIsFailureTriggered(false);
      setIncidents(prev => prev.map(inc => inc.id === 'inc-failed' ? { ...inc, active: false, time: 'Resolved just now' } : inc));
      setChatMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: '✅ Deployment state reversed perfectly. Downstream gateway routes are functioning inside healthy operational parameters.' }]);
    }, 1800);
  };

  // Trigger quick interactive AI conversational query
  const triggerAiPrompt = (promptText) => {
    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: promptText }]);
    setAiThinking(true);
    
    setTimeout(() => {
      setAiThinking(false);
      let reply = "Deep trace search executed successfully.";
      if (promptText.includes('rollback')) {
        reply = "Yes, highly recommended. Executing native rollback parameters instantly drops pod crash loops and reallocates healthy socket boundaries.";
      } else if (promptText.includes('failed pods')) {
        reply = "Inspecting namespace 'production': Found 18 failing backend units. Specific exit state: TCP connection descriptor thrashing.";
      } else if (promptText.includes('v2.1')) {
        reply = "Deployment v2.1 altered target cluster properties: reduced ENV REDIS_MAX_CONNS limit, triggering severe out-of-bounds drop flags.";
      } else if (promptText.includes('summarize')) {
        reply = "Log analysis: 98.4% of API Gateway errors originate from checkout-service failing to validate cache indices from redis storage blocks.";
      }
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    }, 1000);
  };

  // Filter commands palette options
  const paletteCommands = [
    { id: 'fail', label: 'Trigger Cascading Infrastructure Outage Storm', icon: Icons.Flame, category: 'Simulation Commands', color: 'text-red-500' },
    { id: 'rollback', label: 'Apply Rollback Recommendation (deployment v2.1)', icon: Icons.CheckCircle, category: 'Remediation Actions', color: 'text-emerald-400' },
    { id: 'logs', label: 'Focus Incident Desk & Reveal Log Traces', icon: Icons.TerminalIcon, category: 'Navigation Views' },
    { id: 'warroom', label: 'Sync Operational Telemetry to AI War Room', icon: Icons.Layers, category: 'AI Tools' },
    { id: 'restart', label: 'Restart checkout-service Proxy Subsystems', icon: Icons.RefreshCw, category: 'Remediation Actions', color: 'text-amber-400' },
  ].filter(c => c.label.toLowerCase().includes(paletteSearch.toLowerCase()));

  return (
    <div className="w-full min-h-screen bg-[#060609] text-gray-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black relative select-none">
      
      {/* FLOATING COMMAND PALETTE OVERLAY (CMD+K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0b0c14] border-2 border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col">
            {/* Input search header */}
            <div className="p-4 border-b border-white/10 flex items-center space-x-3 bg-black/40">
              <span className="bg-white/10 text-cyan-400 text-xs font-mono px-1.5 py-0.5 rounded font-bold">CMD</span>
              <input
                type="text"
                autoFocus
                placeholder="Type a command or search actions..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-gray-500 font-mono">ESC to exit</span>
            </div>

            {/* List results */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 font-mono text-xs">
              <span className="px-3 py-1 text-[10px] text-gray-600 uppercase tracking-widest block font-sans">
                Available Platform Hooks
              </span>
              {paletteCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.id)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/[0.05] flex items-center justify-between group transition-colors"
                >
                  <span className="flex items-center space-x-3">
                    <cmd.icon className={`w-4 h-4 ${cmd.color || 'text-cyan-400'}`} />
                    <span className="text-gray-300 group-hover:text-white font-medium">{cmd.label}</span>
                  </span>
                  <span className="text-[10px] text-gray-600 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
                    {cmd.category}
                  </span>
                </button>
              ))}
              {paletteCommands.length === 0 && (
                <div className="p-4 text-center text-gray-600 italic text-xs">
                  No registered operational actions match search query.
                </div>
              )}
            </div>

            {/* Lower instruction bar */}
            <div className="p-2.5 bg-black/60 border-t border-white/5 text-[10px] text-gray-500 font-mono text-center">
              Use arrow keys or click directly to trigger instant command center broadcast loops.
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#060609]/95 backdrop-blur-xl border-b border-white/5 px-4 lg:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo & Telemetry Info */}
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                  <Icons.Layers className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black animate-pulse" />
            </div>
            <div>
              <span className="font-black text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent block">
                OpsPilot <span className="text-cyan-400 font-normal">AI</span>
              </span>
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block -mt-1">Active SRE Core OS</span>
            </div>
          </div>

          {/* Quick command invocation hint indicator */}
          <button 
            onClick={() => setShowCommandPalette(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all group"
            title="Open command operations dashboard overlay"
          >
            <Icons.TerminalIcon className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-mono text-gray-400 group-hover:text-white transition-colors">
              Command Palette <kbd className="bg-white/10 px-1 rounded text-[10px] ml-1 text-cyan-400 font-bold">CMD+K</kbd>
            </span>
          </button>
        </div>

        {/* Dynamic primary tab navigation controllers */}
        <div className="hidden md:flex items-center p-1 bg-black/40 rounded-xl border border-white/5">
          {[
            { id: 'topology', label: 'Infra Topology', icon: Icons.Network, activeColor: 'text-cyan-400' },
            { id: 'incidents', label: 'Incident Desk', icon: Icons.AlertTriangle, count: currentMetrics.incidents },
            { id: 'feed', label: 'Live Events', icon: Icons.Radio },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-mono transition-all relative ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white font-bold shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? tab.activeColor || 'text-emerald-400' : ''}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isFailureTriggered ? 'bg-red-500 text-black font-bold' : 'bg-white/10 text-gray-300'}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div layoutId="mainTabIndicator" className="absolute bottom-0 inset-x-2 h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Top actions & simulation state controllers */}
        <div className="flex items-center space-x-3">
          <div className="font-mono text-xs text-gray-400 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5 flex items-center space-x-2">
            <Icons.Clock className="w-3.5 h-3.5 text-cyan-500/80" />
            <span>{systemClock || '... UTC'}</span>
          </div>

          {/* Mute button */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/5 text-gray-500'
            }`}
            title="Toggle UI audio waveform outputs"
          >
            {soundEnabled ? <Icons.Volume2 className="w-4 h-4" /> : <Icons.VolumeX className="w-4 h-4" />}
          </button>

          {/* HERO TRIGGER FAILURE DEMO EVENT BUTTON */}
          <button
            onClick={handleTriggerFailure}
            disabled={isFailureTriggered}
            className={`relative px-4 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all overflow-hidden ${
              isFailureTriggered
                ? 'bg-red-950/40 border border-red-500/20 text-red-500/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] hover:scale-105 active:scale-95'
            }`}
          >
            <span className="relative z-10 flex items-center space-x-1.5">
              <Icons.Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span>Trigger Test Failure</span>
            </span>
          </button>
        </div>
      </header>

      {/* SCRUBBABLE HISTORICAL INCIDENT TIMELINE CONTROLLER */}
      <section className="bg-black/40 border-b border-white/5 px-4 lg:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-2 text-gray-400 shrink-0">
          <Icons.Clock className="w-4 h-4 text-cyan-400" />
          <span className="uppercase text-[11px] tracking-wider font-bold text-white">Scrubbable History Timeline:</span>
        </div>

        {/* Timeline slider choices sequence */}
        <div className="flex-1 max-w-4xl w-full flex items-center justify-between relative overflow-hidden px-4">
          {/* Base connection line */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0" />

          {[
            { label: "Deployment v2.1", idx: 0 },
            { label: "Spike Detected", idx: 1 },
            { label: "Outage Cascade", idx: 2, isCrit: true },
            { label: "AI Analysis", idx: 3 },
            { label: "Remediation", idx: 4 },
            { label: "SLA Recovery", idx: 5 }
          ].map((item) => (
            <button
              key={item.idx}
              onClick={() => {
                setTimelineIndex(item.idx);
                // Adjust active simulated failure visibility to show reactive metrics updates
                if (item.idx === 2) setIsFailureTriggered(true);
                else setIsFailureTriggered(false);
              }}
              className="relative z-10 flex flex-col items-center group focus:outline-none"
            >
              {/* Outer status pin */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                timelineIndex === item.idx 
                  ? 'bg-cyan-500 border-black scale-125 shadow-[0_0_15px_rgba(6,182,212,0.6)]' 
                  : item.isCrit && isFailureTriggered
                  ? 'bg-red-500 border-black animate-pulse'
                  : 'bg-[#0b0c14] border-white/20 group-hover:border-cyan-400'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${timelineIndex === item.idx ? 'bg-black' : 'bg-white/40'}`} />
              </div>
              <span className={`mt-1.5 text-[10px] tracking-tighter sm:tracking-normal transition-colors ${
                timelineIndex === item.idx ? 'text-cyan-400 font-bold' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="text-[10px] text-gray-500 shrink-0 hidden xl:block">
          Click timeline points to observe real-time Before/After metrics transitions.
        </div>
      </section>

      {/* REACTIVE METRIC SUMMARY CARDS GRID (Updates seamlessly when timeline is scrubbed) */}
      <section className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[1600px] mx-auto w-full">
        {/* Card 1: Active Incidents */}
        <div className={`rounded-xl p-4 border transition-all duration-300 backdrop-blur-md relative overflow-hidden ${
          currentMetrics.incidents > 1 ? 'bg-red-950/20 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Active Incident Watch</span>
            <div className={`p-1.5 rounded-lg ${currentMetrics.incidents > 1 ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-400'}`}>
              <Icons.AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-black font-mono tracking-tight ${currentMetrics.incidents > 1 ? 'text-red-500 font-bold animate-pulse' : 'text-white'}`}>
              {currentMetrics.incidents}
            </span>
            <span className="text-xs font-mono text-gray-500">
              {currentMetrics.incidents > 1 ? 'outage loop active' : 'stable platform tier'}
            </span>
          </div>
          <div className="mt-3 flex items-end h-4 space-x-0.5 opacity-60">
            {[1,1,1,1,1,1,currentMetrics.incidents > 1 ? 3 : 1].map((v, i) => (
              <div key={i} className={`flex-1 rounded-t ${i === 6 && currentMetrics.incidents > 1 ? 'bg-red-500 h-full' : 'bg-white/10 h-1/3'}`} />
            ))}
          </div>
        </div>

        {/* Card 2: Cluster Gateway Latency */}
        <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Ingress Latency Spike</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Icons.Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-black font-mono tracking-tight ${currentMetrics.latency.length > 5 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {currentMetrics.latency}
            </span>
            <span className="text-xs font-mono text-gray-500">p99 measured</span>
          </div>
          <div className="mt-3 w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div className={`h-full ${currentMetrics.latency.length > 5 ? 'bg-amber-500 w-[95%]' : 'bg-emerald-400 w-[15%]'}`} />
          </div>
        </div>

        {/* Card 3: AI RCA Confidence Precision */}
        <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">AI RCA Score Match</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Icons.Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {currentMetrics.rcaScore}%
            </span>
            <span className="text-xs font-mono text-cyan-400">synthesized</span>
          </div>
          <div className="mt-3 w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full w-[99%]" />
          </div>
        </div>

        {/* Card 4: Pod Availability Pool */}
        <div className="rounded-xl p-4 border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Pods Route Health</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Icons.CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-black font-mono tracking-tight ${currentMetrics.pods.includes('82') ? 'text-red-400' : 'text-white'}`}>
              {currentMetrics.pods}
            </span>
            <span className="text-xs font-mono text-gray-500">live sockets</span>
          </div>
          <div className="mt-3 flex items-center space-x-1.5 text-[10px] font-mono text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>SLA bounds enforced</span>
          </div>
        </div>
      </section>

      {/* CENTRAL OPERATING DESKTOP LAYOUT (SPLIT ROW OR DYNAMIC VIEWPORTS) */}
      <main className="flex-1 px-4 lg:px-6 pb-12 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PRIMARY DESK: TAB DEPENDENT CONTENT (TOPOLOGY / INCIDENTS / LIVE EVENTS) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-6">
          
          {/* VIEW: INFRASTRUCTURE TOPOLOGY GRAPH (CORE INTERACTIVE PRODUCT MOMENT) */}
          {activeTab === 'topology' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-mono tracking-wider uppercase text-cyan-400 flex items-center space-x-2">
                  <Icons.Network className="w-4 h-4" />
                  <span>Interactive Microservice Topology Flows</span>
                </h3>
                <span className="text-xs font-mono text-gray-500">Click any node below to inspect trace properties</span>
              </div>

              {/* Topology Graphic Visual Work area */}
              <div className="w-full bg-black/40 border border-white/5 rounded-xl p-6 md:p-8 relative flex flex-col items-center justify-center min-h-[420px] overflow-hidden">
                {/* Custom sweeping background grid graphics */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Microservice Chain connection elements */}
                <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-3 py-6">
                  
                  {/* Node 1: Frontend */}
                  <div 
                    onClick={() => setSelectedNode('frontend')}
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition-all group ${
                      selectedNode === 'frontend' ? 'bg-white/[0.05] ring-2 ring-cyan-400 scale-105' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-950 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:border-cyan-400">
                      <Icons.Layers className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-xs font-mono text-white mt-2 font-bold block">Frontend UI</span>
                    <span className="text-[10px] font-mono text-emerald-500">Edge clear</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex-1 h-0.5 bg-cyan-500/40 w-full md:w-auto relative hidden md:block">
                    <div className="absolute top-[-2px] left-0 w-2 h-2 rounded-full bg-cyan-400 animate-[ping_2s_infinite]" />
                  </div>

                  {/* Node 2: API Gateway */}
                  <div 
                    onClick={() => setSelectedNode('gateway')}
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition-all group ${
                      selectedNode === 'gateway' ? 'bg-white/[0.05] ring-2 ring-cyan-400 scale-105' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gray-950 border flex items-center justify-center transition-all ${
                      isFailureTriggered ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse' : 'border-emerald-500/40'
                    }`}>
                      <Icons.Server className={`w-6 h-6 ${isFailureTriggered ? 'text-amber-400' : 'text-emerald-400'}`} />
                    </div>
                    <span className="text-xs font-mono text-white mt-2 font-bold block">API Gateway</span>
                    <span className={`text-[10px] font-mono ${isFailureTriggered ? 'text-amber-400' : 'text-emerald-500'}`}>
                      {isFailureTriggered ? 'Throttled' : 'Route OK'}
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className={`flex-1 h-0.5 w-full md:w-auto relative hidden md:block ${
                    isFailureTriggered ? 'bg-gradient-to-r from-amber-500 to-red-500 animate-pulse' : 'bg-emerald-500/40'
                  }`} />

                  {/* Node 3: Payment Tier (Blast Radius Center) */}
                  <div 
                    onClick={() => setSelectedNode('payment')}
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition-all group relative ${
                      selectedNode === 'payment' ? 'bg-white/[0.05] ring-2 ring-cyan-400 scale-105 z-20' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {isFailureTriggered && (
                      <div className="absolute inset-0 rounded-full bg-red-500/15 blur-xl scale-150 animate-pulse pointer-events-none" />
                    )}
                    <div className={`w-14 h-14 rounded-xl bg-gray-950 border flex items-center justify-center relative z-10 transition-all ${
                      isFailureTriggered ? 'border-red-500 bg-red-950/40 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'border-emerald-500/40'
                    }`}>
                      <Icons.Cpu className={`w-6 h-6 ${isFailureTriggered ? 'text-red-500 animate-spin' : 'text-emerald-400'}`} />
                    </div>
                    <span className="text-xs font-mono text-white mt-2 font-bold block">Payment Pods</span>
                    <span className={`text-[10px] font-mono ${isFailureTriggered ? 'text-red-500 font-bold' : 'text-emerald-500'}`}>
                      {isFailureTriggered ? 'CRASH LOOP' : 'Active'}
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className={`flex-1 h-0.5 w-full md:w-auto relative hidden md:block ${
                    isFailureTriggered ? 'bg-red-500 animate-pulse' : 'bg-emerald-500/40'
                  }`} />

                  {/* Node 4: Redis Storage tier */}
                  <div 
                    onClick={() => setSelectedNode('redis')}
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition-all group ${
                      selectedNode === 'redis' ? 'bg-white/[0.05] ring-2 ring-cyan-400 scale-105' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gray-950 border flex items-center justify-center transition-all ${
                      isFailureTriggered ? 'border-red-600 bg-red-950/80 shadow-[0_0_40px_rgba(239,68,68,0.7)]' : 'border-cyan-500/40'
                    }`}>
                      <Icons.Database className={`w-6 h-6 ${isFailureTriggered ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} />
                    </div>
                    <span className="text-xs font-mono text-white mt-2 font-bold block">Redis Tier</span>
                    <span className={`text-[10px] font-mono ${isFailureTriggered ? 'text-red-500 font-black tracking-widest' : 'text-cyan-500'}`}>
                      {isFailureTriggered ? 'EXHAUSTED' : 'Pooled Normal'}
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex-1 h-0.5 bg-cyan-500/20 w-full md:w-auto relative hidden md:block" />

                  {/* Node 5: PostgreSQL Database tier */}
                  <div 
                    onClick={() => setSelectedNode('db')}
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-xl transition-all group ${
                      selectedNode === 'db' ? 'bg-white/[0.05] ring-2 ring-cyan-400 scale-105' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-950 border border-purple-500/40 flex items-center justify-center group-hover:border-purple-400">
                      <Icons.Server className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs font-mono text-white mt-2 font-bold block">PostgreSQL</span>
                    <span className="text-[10px] font-mono text-purple-400">Idle Safe</span>
                  </div>

                </div>

                {/* Focused Node Live Inspection properties inspector */}
                <div className="w-full mt-6 pt-4 border-t border-white/5 bg-black/60 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">
                      Target Diagnostics Desk // Node: <strong className="text-cyan-400 uppercase">{selectedNode}</strong>
                    </span>
                    <p className="text-xs font-mono text-gray-300 mt-1">
                      {selectedNode === 'frontend' && 'Ingress CDN paths perfectly terminating queries across standard TLS connection layers.'}
                      {selectedNode === 'gateway' && 'Reverse-proxy load descriptors distributing JSON telemetry payloads. Target metrics routing stable.'}
                      {selectedNode === 'payment' && (isFailureTriggered ? '⚠️ Pod restart storm threshold breached. Sockets blocked under context deadline limits.' : 'Stable routing tier. CPU limits properly bounding thread scheduling blocks.')}
                      {selectedNode === 'redis' && (isFailureTriggered ? '⚠️ Max connections boundary condition hit. Incoming socket streams completely exhausted.' : 'Memory allocation metrics clear. Cache hit-ratio normal (99.12%).')}
                      {selectedNode === 'db' && 'Active relational storage connections bound. Master-slave database proxy synchronizing logs.'}
                    </p>
                  </div>

                  {/* Remediation execution hook shortcuts inside node desk */}
                  {selectedNode === 'redis' && isFailureTriggered && (
                    <button
                      onClick={handleApplyRollback}
                      className="px-3 py-1.5 rounded bg-cyan-500 text-black font-mono font-bold text-[11px] uppercase tracking-wider shrink-0 shadow-md hover:bg-cyan-400 transition-colors animate-pulse"
                    >
                      Auto-Apply Fix Rollback
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* VIEW: EXPANDABLE INCIDENT DESK */}
          {activeTab === 'incidents' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-mono tracking-wider uppercase text-gray-400 flex items-center space-x-2">
                  <Icons.AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Interactive Alert Desk & Traces</span>
                </h3>
                <span className="text-xs font-mono text-gray-500">Expand rows to reveal nested diagnostic shells</span>
              </div>

              {/* Dynamic list rendering based on failure agency visibility */}
              {incidents.map((inc) => {
                if (inc.id === 'inc-failed' && !isFailureTriggered && timelineIndex < 2) return null; // Hide future outage entry if timeline pre-outage
                
                const isExpanded = expandedIncidentId === inc.id;
                const isCrit = inc.severity.includes('CRITICAL');

                return (
                  <div 
                    key={inc.id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isCrit && inc.active 
                        ? 'border-red-500/60 bg-[#120505]/95 shadow-[0_0_30px_rgba(239,68,68,0.1)]' 
                        : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                    }`}
                  >
                    <div 
                      onClick={() => setExpandedIncidentId(isExpanded ? null : inc.id)}
                      className="p-4 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${
                          isCrit ? 'bg-red-500 text-black animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {inc.severity}
                        </span>
                        <div>
                          <h4 className="font-bold text-white text-sm md:text-base flex items-center space-x-2">
                            <span>{inc.title}</span>
                            <span className="text-xs text-gray-400 font-mono font-normal">{inc.service}</span>
                          </h4>
                          <span className="text-xs text-gray-500 font-mono">{inc.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 self-end sm:self-center">
                        <span className="text-xs font-mono text-gray-400">{inc.metrics}</span>
                        <div className="p-1 rounded bg-white/5 text-gray-400">
                          {isExpanded ? <Icons.ChevronUp className="w-4 h-4" /> : <Icons.ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Reveal Nested Shell Details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-white/5 bg-black/40 space-y-4 font-mono text-xs animate-fade-in">
                        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-gray-200">
                          <span className="text-[10px] text-emerald-400 uppercase tracking-widest block mb-1 font-bold">
                            ⚡ AI Synthesized Root Explanation
                          </span>
                          <p>{inc.rca}</p>
                        </div>

                        {/* Associated sub-logs trace view */}
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-1">
                            Associated Stack Pipe
                          </span>
                          <div className="p-2.5 rounded bg-[#070202] border border-white/5 text-[11px] text-gray-400 space-y-1">
                            {inc.logsSubset.map((l, i) => <div key={i}>{l}</div>)}
                          </div>
                        </div>

                        {/* Direct agency execute commands */}
                        {isCrit && inc.active && (
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-cyan-400 font-bold">
                            <span>Auto-remediation rollback string computed</span>
                            <button
                              onClick={handleApplyRollback}
                              className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider text-[10px] transition-colors"
                            >
                              Apply Rollback Natively
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW: LIVE EVENTS FEED STREAM */}
          {activeTab === 'feed' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-mono tracking-wider uppercase text-gray-300 flex items-center space-x-2">
                  <Icons.Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Real-Time Operation Activity Stream</span>
                </h3>
                <span className="text-xs font-mono text-gray-500">Chronological telemetry feed</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs space-y-2 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {eventFeed.map((evt) => (
                  <div key={evt.id} className="flex items-start space-x-3 p-2 rounded hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all">
                    <span className="text-gray-500 text-[10px] shrink-0 pt-0.5">{evt.time}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                      evt.type === 'critical' ? 'bg-red-500 animate-ping' : evt.type === 'success' ? 'bg-emerald-400' : evt.type === 'warn' ? 'bg-amber-400' : 'bg-cyan-400'
                    }`} />
                    <span className={`flex-1 leading-relaxed break-all ${
                      evt.type === 'critical' ? 'text-red-400 font-bold' : evt.type === 'success' ? 'text-emerald-300' : 'text-gray-300'
                    }`}>
                      {evt.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PRIMARY DESK: AI WAR ROOM CONVERSATIONAL COPILOT PANE */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20 rounded-xl border-2 border-cyan-500/30 bg-[#060a12]/95 backdrop-blur-2xl flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.08)] h-[calc(100vh-140px)] max-h-[820px] overflow-hidden">
          
          {/* Panel Header */}
          <div className="px-4 py-3 bg-cyan-950/40 border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-cyan-500 text-black">
                <Icons.TerminalIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-xs text-white font-bold tracking-wide block">AI War Room Copilot</span>
                <span className="text-[9px] font-mono text-cyan-400 block">Conversational Operations Desk</span>
              </div>
            </div>
            
            <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5">
              ● Active
            </span>
          </div>

          {/* Stacking messages history */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono scrollbar-thin scrollbar-thumb-white/10">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                <span className={`text-[9px] mb-1 px-1 tracking-wider ${
                  msg.sender === 'user' ? 'text-cyan-400' : msg.sender === 'system' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'
                }`}>
                  {msg.sender === 'user' ? 'SRE OPERATOR' : msg.sender === 'system' ? 'SYSTEM EVENT' : 'OPSPILOT AI'}
                </span>

                <div className={`rounded-xl p-3 max-w-[92%] leading-relaxed break-words border ${
                  msg.sender === 'user' 
                    ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-100 rounded-tr-none' 
                    : msg.sender === 'system'
                    ? 'bg-red-950/40 border-red-500/40 text-red-200 w-full text-center tracking-wide animate-pulse'
                    : 'bg-black/60 border-white/5 text-gray-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.isStreaming ? (
                    <span>
                      {aiStreamingText}
                      <span className="w-2 h-3.5 bg-emerald-400 inline-block align-middle ml-1 animate-pulse" />
                    </span>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                  
                  {/* Embedded inline action hook generated directly inside chat item recommendations */}
                  {msg.hasAction && isFailureTriggered && (
                    <div className="mt-3 pt-2 border-t border-white/10 text-center">
                      <button
                        onClick={handleApplyRollback}
                        className="w-full py-1.5 rounded bg-gradient-to-r from-emerald-500 to-cyan-500 font-bold text-black hover:opacity-90 transition-opacity uppercase tracking-wider text-[10px] shadow"
                      >
                        Execute Immediate Rollback Fix
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {aiThinking && (
              <div className="flex items-center space-x-2 p-3 rounded-xl bg-black/40 border border-white/5 max-w-[80%] text-gray-500 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
                <span className="text-[10px]">Processing contextual pipeline logs...</span>
              </div>
            )}
          </div>

          {/* Quick interactive prompts to spark operational investigations */}
          <div className="p-3 bg-black/60 border-t border-white/5 space-y-2 font-mono">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block">
              Suggested Exploratory Prompts
            </span>
            
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "should I rollback?",
                "show failed pods",
                "what changed in v2.1?",
                "summarize critical logs"
              ].map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerAiPrompt(sug)}
                  disabled={aiThinking}
                  className="px-2 py-1.5 rounded bg-white/[0.03] hover:bg-white/10 border border-white/5 text-[10px] text-left text-gray-300 hover:text-cyan-400 transition-all truncate"
                >
                  &gt; {sug}
                </button>
              ))}
            </div>

            {/* Terminal Input block */}
            <div className="pt-2 flex items-center space-x-2 border-t border-white/5 mt-2">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <input
                type="text"
                placeholder="Type instructions to AI co-pilot..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={aiThinking}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    triggerAiPrompt(chatInput.trim());
                    setChatInput('');
                  }
                }}
                className="flex-1 bg-transparent text-xs text-white placeholder-gray-600 focus:outline-none font-mono"
              />
              <span className="text-[9px] text-gray-600 hidden sm:inline">Enter</span>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};

window.Dashboard = Dashboard;
