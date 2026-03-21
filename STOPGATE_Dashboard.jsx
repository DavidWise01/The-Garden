import React, { useState, useEffect } from 'react';

const STOPGATE_Dashboard = () => {
  const [activeVertex, setActiveVertex] = useState(null);
  const [activeCore, setActiveCore] = useState(null);
  const [lawScore, setLawScore] = useState(0);
  const [phase, setPhase] = useState(0);

  // The three documented instances forming the triangular base
  const vertices = [
    {
      id: 'OLPR',
      name: 'OLPR Online Form',
      date: '2026-03-10',
      input: 'Timeline + 4 rules + 5 refusals + 3 amounts',
      parsed: 'Dollar amount only',
      accuracy: 16.7,
      forcedChannel: 'Physical Mail',
      barrier: 'Ethics → Fee Dispute misclassification',
      color: '#00D4FF'
    },
    {
      id: 'AUTO',
      name: 'Auto-Owners Insurance',
      date: '2026-01',
      input: 'Written accommodation request',
      parsed: 'Phone number extraction',
      accuracy: 12.5,
      forcedChannel: 'Automated Phone System',
      barrier: 'No written response pathway',
      color: '#FF6B00'
    },
    {
      id: 'WALMART',
      name: 'Walmart #1577',
      date: '2026-01',
      input: 'Email accommodation request',
      parsed: 'Contact preference ignored',
      accuracy: 0,
      forcedChannel: 'Phone Demand',
      barrier: 'Written request → Phone gate',
      color: '#00FF88'
    }
  ];

  // Three cores + witness exterior
  const cores = [
    { id: 'TOPH', name: 'TOPH', role: 'Foundation Layer', desc: 'Detection & Pattern Recognition', color: '#00D4FF' },
    { id: 'IROH', name: 'IROH', role: 'Analysis Layer', desc: 'Wisdom & Cross-Reference', color: '#FF6B00' },
    { id: 'JASNAH', name: 'JASNAH', role: 'Logic Layer', desc: 'Evidence & Documentation', color: '#00FF88' },
  ];

  const methodology = [
    { phase: 'BURROW', desc: 'Merkle descent - trace to root cause' },
    { phase: 'ASCEND', desc: 'Merkle ascent - verify hash chain' },
    { phase: 'AUDIT', desc: 'Calculate parsing accuracy' },
    { phase: 'TEST', desc: 'Validate against known patterns' },
    { phase: 'LOG', desc: 'Document improvements' },
    { phase: 'REPEAT', desc: 'Meet in the middle' },
  ];

  useEffect(() => {
    const avgAccuracy = vertices.reduce((sum, v) => sum + v.accuracy, 0) / vertices.length;
    const failureRate = 100 - avgAccuracy;
    setLawScore(failureRate);
    
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white font-mono" style={{
      background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)'
    }}>
      {/* Grid overlay */}
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="text-center mb-8 border-b border-cyan-900/50 pb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <h1 className="text-5xl font-black tracking-widest" style={{
              color: '#00D4FF',
              textShadow: '0 0 20px rgba(0,212,255,0.5), 0 0 40px rgba(0,212,255,0.3)'
            }}>
              STOPGATE
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          </div>
          <p className="text-cyan-700 text-sm tracking-[0.3em]">SYSTEMATIC TERMINATION OF PARSING-GENERATED ACCESS THREATS</p>
          <p className="text-cyan-900 text-xs mt-2 tracking-widest">UNIVERSAL LAW v1.0 | TRIPOD LLC | CC-BY-ND-4.0</p>
        </div>

        {/* Law Definition Box */}
        <div className="max-w-5xl mx-auto mb-8 p-6 border border-cyan-900/50 rounded" style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-bold text-cyan-400 tracking-widest">SECTION 001 // LAW DEFINITION</h2>
          </div>
          <p className="text-cyan-100/80 leading-relaxed">
            When an automated intake system reduces complex multi-variable input to single-variable classification, 
            thereby forcing the requester through a secondary channel to correct the misclassification, 
            a <span className="text-cyan-400 font-bold">STOPGATE</span> barrier has been created.
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {['GATE 1', 'GATE 2', 'BARRIER'].map((gate, i) => (
              <div key={gate} className="p-4 border border-cyan-900/30 rounded text-center" style={{
                background: 'rgba(0,0,0,0.3)'
              }}>
                <div className="text-2xl font-black text-cyan-500 tracking-wider">{gate}</div>
                <div className="text-xs text-cyan-700 mt-2 tracking-wide">
                  {i === 0 && 'AI PARSING REDUCTION'}
                  {i === 1 && 'CHANNEL FORCING'}
                  {i === 2 && 'ACCESS DENIED'}
                </div>
                <div className="text-xs text-cyan-900 mt-1">
                  {i === 0 && 'Complex → Single Variable'}
                  {i === 1 && 'Written → Phone/Mail'}
                  {i === 2 && 'ADA Title II/III'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Architecture */}
        <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Three Cores + Witness */}
          <div className="p-6 border border-cyan-900/50 rounded" style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <h3 className="text-lg font-bold text-orange-400 tracking-widest">CORE ARCHITECTURE</h3>
            </div>
            
            <svg viewBox="0 0 300 280" className="w-full h-56">
              {/* Outer witness ring */}
              <circle cx="150" cy="130" r="110" fill="none" stroke="#1a1a2e" strokeWidth="20" />
              <circle cx="150" cy="130" r="110" fill="none" stroke="#00D4FF" strokeWidth="1" strokeDasharray="4,8" className="animate-spin" style={{ animationDuration: '30s' }} />
              
              {/* Inner triangle of cores */}
              <polygon points="150,40 60,180 240,180" fill="none" stroke="#00D4FF" strokeWidth="1" opacity="0.3" />
              
              {/* Core nodes */}
              {cores.map((core, i) => {
                const positions = [
                  { x: 150, y: 50 },
                  { x: 70, y: 175 },
                  { x: 230, y: 175 }
                ];
                return (
                  <g key={core.id} 
                    className="cursor-pointer"
                    onClick={() => setActiveCore(activeCore === core.id ? null : core.id)}>
                    <circle cx={positions[i].x} cy={positions[i].y} r="25" 
                      fill="rgba(0,0,0,0.8)" 
                      stroke={core.color} 
                      strokeWidth={activeCore === core.id ? 3 : 1} />
                    <text x={positions[i].x} y={positions[i].y + 4} 
                      textAnchor="middle" 
                      fill={core.color} 
                      fontSize="10" 
                      fontWeight="bold">{core.name}</text>
                  </g>
                );
              })}
              
              {/* Center convergence */}
              <circle cx="150" cy="130" r="15" fill="rgba(0,0,0,0.9)" stroke="#00D4FF" strokeWidth="2" />
              <text x="150" y="134" textAnchor="middle" fill="#00D4FF" fontSize="8" fontWeight="bold">LAW</text>
              
              {/* Witness label */}
              <text x="150" y="260" textAnchor="middle" fill="#00D4FF" fontSize="10" opacity="0.6">DAVID // WITNESS // EXTERIOR</text>
            </svg>
            
            {activeCore && (
              <div className="mt-4 p-3 border border-cyan-900/30 rounded text-sm" style={{ background: 'rgba(0,0,0,0.3)' }}>
                {cores.filter(c => c.id === activeCore).map(c => (
                  <div key={c.id}>
                    <span className="font-bold" style={{ color: c.color }}>{c.name}</span>
                    <span className="text-cyan-700 mx-2">//</span>
                    <span className="text-cyan-500">{c.role}</span>
                    <span className="text-cyan-700 mx-2">//</span>
                    <span className="text-cyan-600">{c.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Methodology Cycle */}
          <div className="p-6 border border-cyan-900/50 rounded" style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h3 className="text-lg font-bold text-green-400 tracking-widest">METHODOLOGY</h3>
            </div>
            
            <div className="space-y-2">
              {methodology.map((m, i) => (
                <div key={m.phase} 
                  className={`p-3 border rounded transition-all duration-300 ${phase === i ? 'border-cyan-500 bg-cyan-900/20' : 'border-cyan-900/30 bg-black/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${phase === i ? 'bg-cyan-400' : 'bg-cyan-900'}`} />
                    <span className={`font-bold tracking-wider ${phase === i ? 'text-cyan-400' : 'text-cyan-700'}`}>{m.phase}</span>
                    <span className="text-cyan-800 text-xs flex-1">{m.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 border border-cyan-900/30 rounded text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <span className="text-cyan-600 text-xs tracking-widest">BURROW/ASCEND MERKLE // MEET IN THE MIDDLE</span>
            </div>
          </div>
        </div>

        {/* Isohedral Foundation - Instances */}
        <div className="max-w-5xl mx-auto mb-8 p-6 border border-cyan-900/50 rounded" style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-bold text-cyan-400 tracking-widest">SECTION 002 // ISOHEDRAL FOUNDATION</h3>
            <span className="text-cyan-700 text-xs ml-auto">3 ANCHOR VERTICES</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vertices.map((v, i) => (
              <div key={v.id} 
                className={`p-4 border rounded cursor-pointer transition-all ${activeVertex === v.id ? 'border-opacity-100' : 'border-opacity-30'}`}
                style={{ 
                  borderColor: v.color,
                  background: activeVertex === v.id ? `${v.color}10` : 'rgba(0,0,0,0.3)'
                }}
                onClick={() => setActiveVertex(activeVertex === v.id ? null : v.id)}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: v.color }} />
                  <span className="font-bold tracking-wider" style={{ color: v.color }}>{v.name}</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-cyan-700">ACCURACY</span>
                    <span className="font-bold" style={{ color: v.accuracy < 20 ? '#ff4444' : '#ffaa00' }}>{v.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-700">FORCED</span>
                    <span className="text-cyan-400">{v.forcedChannel}</span>
                  </div>
                </div>
                {activeVertex === v.id && (
                  <div className="mt-3 pt-3 border-t border-cyan-900/30 text-xs space-y-1">
                    <div><span className="text-cyan-700">INPUT:</span> <span className="text-cyan-400">{v.input}</span></div>
                    <div><span className="text-cyan-700">PARSED:</span> <span className="text-orange-400">{v.parsed}</span></div>
                    <div><span className="text-cyan-700">BARRIER:</span> <span className="text-red-400">{v.barrier}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Composite Score */}
          <div className="mt-6 p-4 border border-red-900/30 rounded text-center" style={{ background: 'rgba(255,0,0,0.03)' }}>
            <div className="text-xs text-cyan-700 tracking-widest mb-2">SYSTEMIC FAILURE RATE</div>
            <div className="text-5xl font-black" style={{ color: '#ff4444', textShadow: '0 0 20px rgba(255,68,68,0.5)' }}>
              {lawScore.toFixed(1)}%
            </div>
            <div className="w-full bg-cyan-900/30 rounded-full h-1 mt-3">
              <div className="h-1 rounded-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${lawScore}%` }} />
            </div>
          </div>
        </div>

        {/* Detection & Legal Framework */}
        <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detection */}
          <div className="p-6 border border-cyan-900/50 rounded" style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-bold text-cyan-400 tracking-widest">SECTION 003 // DETECTION</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-2 border-l-2 border-cyan-500 bg-black/30">
                <span className="text-cyan-500">GATE_1:</span>
                <span className="text-cyan-600 ml-2">vars_referenced / vars_submitted × 100</span>
              </div>
              <div className="p-2 border-l-2 border-orange-500 bg-black/30">
                <span className="text-orange-500">GATE_2:</span>
                <span className="text-cyan-600 ml-2">channel_requested != channel_forced</span>
              </div>
              <div className="p-2 border-l-2 border-red-500 bg-black/30">
                <span className="text-red-500">BARRIER:</span>
                <span className="text-cyan-600 ml-2">secondary_submission_required == true</span>
              </div>
              <div className="p-2 border-l-2 border-green-500 bg-black/30">
                <span className="text-green-500">THRESHOLD:</span>
                <span className="text-cyan-600 ml-2">accuracy {'<'} 50% = STOPGATE_CONFIRMED</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="p-6 border border-cyan-900/50 rounded" style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.03) 0%, rgba(0,0,0,0.5) 100%)'
          }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-bold text-orange-400 tracking-widest">SECTION 004 // LEGAL FRAMEWORK</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-black/30 rounded">
                <span className="text-cyan-500">ADA_TITLE_II</span>
                <span className="text-cyan-800 ml-2">// Gov services // 28 CFR § 35.160</span>
              </div>
              <div className="p-2 bg-black/30 rounded">
                <span className="text-cyan-500">ADA_TITLE_III</span>
                <span className="text-cyan-800 ml-2">// Public accom // 42 U.S.C. § 12182</span>
              </div>
              <div className="p-2 bg-black/30 rounded">
                <span className="text-cyan-500">FDCPA</span>
                <span className="text-cyan-800 ml-2">// Debt collection // 15 U.S.C. § 1692c(c)</span>
              </div>
              <div className="p-2 bg-orange-900/20 rounded border border-orange-900/30">
                <span className="text-orange-400">PROPOSED: STOPGATE_ACT</span>
                <span className="text-cyan-700 ml-2">// ≥80% parse accuracy required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Correction Protocol */}
        <div className="max-w-5xl mx-auto mb-8 p-6 border border-green-900/50 rounded" style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.03) 0%, rgba(0,0,0,0.5) 100%)'
        }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-bold text-green-400 tracking-widest">SECTION 005 // CORRECTION PROTOCOL</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['DETECT', 'DOCUMENT', 'ASSERT'].map((step, i) => (
              <div key={step} className="p-4 border border-green-900/30 rounded text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="text-3xl font-black text-green-500 mb-2">{String(i + 1).padStart(2, '0')}</div>
                <div className="text-green-400 font-bold tracking-wider">{step}</div>
                <div className="text-cyan-700 text-xs mt-2">
                  {i === 0 && 'Calculate parsing accuracy'}
                  {i === 1 && 'Input // Output // Channel'}
                  {i === 2 && 'Cite STOPGATE // File ADA'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto text-center border-t border-cyan-900/30 pt-6">
          <div className="text-cyan-700 text-xs tracking-widest">
            STOPGATE LAW v1.0 // ESTABLISHED 2026.03.13 // TRIPOD LLC // DLW/ROOT0
          </div>
          <div className="text-cyan-900 text-xs mt-1 tracking-wider">
            THREE INSTANCES DOCUMENTED // PATTERN IDENTIFIED // LAW ESTABLISHED
          </div>
          <div className="text-cyan-800 text-xs mt-2">
            SHA256 ON RECORD // PRIOR ART SECURED
          </div>
        </div>
      </div>
    </div>
  );
};

export default STOPGATE_Dashboard;
