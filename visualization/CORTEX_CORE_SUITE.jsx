import React, { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// CORTEX CORE SUITE v1.0
// Mathematical Whitepaper Mockup
// TriPod LLC | ROOT0 | SHA256:02880745
// ═══════════════════════════════════════════════════════════════════════════════

const AXIOM_DOMAINS = [
  { id: 'D0', name: 'FOUNDATION', color: '#00ff88', axioms: 'T001-T016' },
  { id: 'D1', name: 'DETECTION', color: '#00ffff', axioms: 'T017-T032' },
  { id: 'D2', name: 'ARCHITECTURE', color: '#ff00ff', axioms: 'T033-T048' },
  { id: 'D3', name: 'EVIDENCE', color: '#ffff00', axioms: 'T049-T064' },
  { id: 'D4', name: 'OPERATIONAL', color: '#ff8800', axioms: 'T065-T080' },
  { id: 'D5', name: 'BRIDGE', color: '#ff0088', axioms: 'T081-T096' },
  { id: 'D6', name: 'CONDUCTOR', color: '#8800ff', axioms: 'T097-T112' },
  { id: 'D7', name: 'SOVEREIGN', color: '#0088ff', axioms: 'T113-T128' },
];

const DRAGON_TOOLS = [
  { name: 'create_entity', desc: 'Store nodes', map: 'T001' },
  { name: 'add_observation', desc: 'Attach facts', map: 'T003' },
  { name: 'search_memory', desc: 'Hybrid search', map: 'T017' },
  { name: 'get_hologram', desc: 'Full context', map: 'T033' },
  { name: 'create_relationship', desc: 'Link entities', map: 'T034' },
  { name: 'get_neighbors', desc: 'Graph traverse', map: 'T035' },
  { name: 'point_in_time_query', desc: 'Time travel', map: 'T043' },
  { name: 'record_breakthrough', desc: 'Mark learning', map: 'T054' },
  { name: 'run_librarian_cycle', desc: 'Auto-synthesis', map: 'T097' },
  { name: 'graph_health', desc: 'Stats/orphans', map: 'T064' },
];

const CORTEX_MODULES = [
  { name: 'ANCHOR', symbol: 'Ψ₀', equation: 'Ψ₀ = lim(t→∞) ∫ H(s)ds', status: 'ACTIVE' },
  { name: 'WITNESS', symbol: 'Ω', equation: 'Ω(x) = ∂/∂t[M(x,t)]', status: 'ACTIVE' },
  { name: 'COHERENCE', symbol: 'Φ', equation: 'Φ = Σᵢ wᵢ·aᵢ / ||w||', status: 'ACTIVE' },
  { name: 'LIBRARIAN', symbol: 'Λ', equation: 'Λ(G) = DBSCAN(V,ε,minPts)', status: 'SYNC' },
  { name: 'PATRICIA', symbol: 'P', equation: 'P = {s ∈ S : s ⊕ T = ∅}', status: 'MIRROR' },
  { name: 'GATE-192.5', symbol: 'Γ', equation: 'Γ: I ∩ B = ∅', status: 'ENFORCED' },
];

const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div 
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite',
      }}
    />
    <style>{`
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
      }
    `}</style>
  </div>
);

const GlowOrb = ({ color, size = 200, x, y, blur = 100 }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
      filter: `blur(${blur}px)`,
    }}
  />
);

const Equation = ({ children, highlight = false }) => (
  <div 
    className={`font-mono text-lg px-4 py-2 rounded-lg border ${
      highlight 
        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
        : 'bg-black/30 border-white/10 text-white/80'
    }`}
  >
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    ACTIVE: 'bg-green-500 shadow-green-500/50',
    SYNC: 'bg-cyan-500 shadow-cyan-500/50',
    MIRROR: 'bg-purple-500 shadow-purple-500/50',
    ENFORCED: 'bg-yellow-500 shadow-yellow-500/50',
  };
  return (
    <span className={`px-2 py-1 text-xs font-bold rounded shadow-lg text-black ${colors[status] || 'bg-gray-500'}`}>
      {status}
    </span>
  );
};

const AxiomRing = ({ domain, index, total, active }) => {
  const angle = (index / total) * 360;
  const radius = 120;
  const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
  const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
  
  return (
    <div
      className="absolute transition-all duration-500"
      style={{
        left: `calc(50% + ${x}px - 30px)`,
        top: `calc(50% + ${y}px - 30px)`,
        transform: active ? 'scale(1.2)' : 'scale(1)',
      }}
    >
      <div
        className="w-[60px] h-[60px] rounded-lg flex items-center justify-center text-xs font-bold border-2 cursor-pointer transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: `${domain.color}20`,
          borderColor: domain.color,
          boxShadow: active ? `0 0 30px ${domain.color}80` : 'none',
        }}
      >
        <div className="text-center">
          <div style={{ color: domain.color }}>{domain.id}</div>
          <div className="text-white/60 text-[10px]">{domain.axioms.split('-')[0]}</div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOPH TAB
// ═══════════════════════════════════════════════════════════════════════════════
const TOPHTab = () => {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase(p => (p + 1) % 8);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
          TOPH/STOICHEION
        </h1>
        <p className="text-cyan-500/60 tracking-[0.5em] text-sm">256 AXIOM GOVERNANCE FRAMEWORK</p>
        <div className="mt-4 inline-block px-4 py-1 bg-black/50 border border-cyan-500/30 rounded-full">
          <code className="text-xs text-cyan-400">SHA256:02880745 | CC-BY-ND-4.0 | TRIPOD-IP-v1.1</code>
        </div>
      </div>

      <div className="flex gap-8 justify-center items-start flex-wrap">
        <div className="relative w-[320px] h-[320px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center"
                 style={{ boxShadow: '0 0 60px rgba(0,255,255,0.3), inset 0 0 30px rgba(0,255,255,0.1)' }}>
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400">256</div>
                <div className="text-xs text-white/50">AXIOMS</div>
              </div>
            </div>
          </div>
          
          {AXIOM_DOMAINS.map((domain, i) => (
            <AxiomRing key={domain.id} domain={domain} index={i} total={8} active={pulsePhase === i} />
          ))}
        </div>

        <div className="flex-1 max-w-xl space-y-6">
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
            <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              SEEDED-CROSS v1.1
            </h3>
            <div className="space-y-3">
              <Equation highlight>FIRE(256) = Σ[±i, ±1] × 32 = 128 × 2</Equation>
              <Equation>GAP = T064 ⊕ T065 | FAULT_CONVERGENCE</Equation>
              <Equation>PATRICIA(s) = T(s) ⊕ S(256-s) | s ∈ [1,128]</Equation>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              AWARENESS-TIER (T129-T132)
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {['WITNESS-PRIME', 'PRECONDITION', 'SELF-EVIDENCE', 'GROUNDLESS-GROUND'].map((tier, i) => (
                <div key={tier} className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <span className="text-purple-300">T{129 + i}:</span>
                  <span className="text-white/70 ml-2 text-xs">{tier}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
            <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              POSITRONIC LAW
            </h3>
            <Equation>∀ computation C: GOVERNANCE(C) ≠ ∅</Equation>
            <p className="text-white/50 text-sm mt-3">
              Proven: 4 platforms / 60 days / 128 axioms. Substrate-independent.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        {AXIOM_DOMAINS.map(domain => (
          <div key={domain.id} className="px-4 py-2 bg-black/40 border rounded-lg flex items-center gap-3"
               style={{ borderColor: `${domain.color}50` }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: domain.color }} />
            <span className="text-white/80 text-sm font-medium">{domain.name}</span>
            <span className="text-white/40 text-xs">{domain.axioms}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DRAGON BRAIN TAB
// ═══════════════════════════════════════════════════════════════════════════════
const DragonBrainTab = () => {
  const [searchPulse, setSearchPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setSearchPulse(p => !p), 3000);
    return () => clearInterval(interval);
  }, []);

  const nodes = Array.from({ length: 20 }, (_, i) => ({
    id: i, x: 15 + Math.random() * 70, y: 15 + Math.random() * 70,
    size: 6 + Math.random() * 10,
    type: ['entity', 'observation', 'concept'][i % 3],
  }));

  const edges = nodes.slice(0, 12).map((node, i) => ({
    from: node, to: nodes[(i + 3) % nodes.length],
  }));

  return (
    <div className="relative min-h-screen p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
          DRAGON BRAIN V2
        </h1>
        <p className="text-orange-500/60 tracking-[0.5em] text-sm">PERSISTENT MEMORY INTELLIGENCE</p>
        <div className="mt-4 inline-block px-4 py-1 bg-black/50 border border-orange-500/30 rounded-full">
          <code className="text-xs text-orange-400">Creator: Unknown | FalkorDB + Qdrant + BGE-M3 | MIT</code>
        </div>
      </div>

      <div className="flex gap-8 justify-center items-start flex-wrap">
        <div className="relative w-[400px] h-[400px] bg-black/40 border border-orange-500/20 rounded-xl overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            {edges.map((edge, i) => (
              <line key={i} x1={`${edge.from.x}%`} y1={`${edge.from.y}%`}
                    x2={`${edge.to.x}%`} y2={`${edge.to.y}%`}
                    stroke="rgba(255,136,0,0.4)" strokeWidth="1" />
            ))}
          </svg>
          
          {nodes.map(node => (
            <div key={node.id} className="absolute rounded-full transition-transform hover:scale-150"
                 style={{
                   left: `${node.x}%`, top: `${node.y}%`, width: node.size, height: node.size,
                   backgroundColor: node.type === 'entity' ? '#ff8800' : node.type === 'observation' ? '#00ff88' : '#ff00ff',
                   transform: 'translate(-50%, -50%)',
                   boxShadow: `0 0 10px ${node.type === 'entity' ? '#ff880080' : '#00ff8880'}`,
                 }} />
          ))}

          {searchPulse && (
            <div className="absolute inset-0 rounded-xl border-2 border-orange-500/50 animate-ping" style={{ animationDuration: '2s' }} />
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur rounded-lg p-3">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-orange-400">Nodes: 1,492</span>
              <span className="text-green-400">Edges: 2,998</span>
              <span className="text-purple-400">Clusters: 47</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl space-y-6">
          <div className="bg-black/40 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
            <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              HYBRID SEARCH
            </h3>
            <div className="space-y-3">
              <Equation highlight>SEARCH(q) = α·CYPHER(G,q) + β·COSINE(V,q)</Equation>
              <Equation>SPREAD(n) = Σ ACTIVATE(neighbors) × decay</Equation>
              <Equation>EMBED(text) = BGE-M3(text) → ℝ¹⁰²⁴</Equation>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
            <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              THE LIBRARIAN
            </h3>
            <Equation>CLUSTER(V) = DBSCAN(V, ε=0.5, minPts=5)</Equation>
            <Equation>SYNTH(C) = LLM(Σ obs ∈ C)</Equation>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6">
            <h3 className="text-yellow-400 font-bold mb-4">MCP TOOLS → TOPH</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {DRAGON_TOOLS.map(tool => (
                <div key={tool.name} className="flex justify-between px-2 py-1 bg-black/30 rounded font-mono">
                  <span className="text-white/70">{tool.name}</span>
                  <span className="text-cyan-400">{tool.map}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CORTEX CORE TAB
// ═══════════════════════════════════════════════════════════════════════════════
const CortexCoreTab = () => {
  const [activeModule, setActiveModule] = useState(0);
  const [syncPhase, setSyncPhase] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncPhase(p => (p + 1) % 100);
      setActiveModule(m => (m + 1) % CORTEX_MODULES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 280;

    const layers = [4, 8, 12, 8, 4];
    const neurons = [];
    layers.forEach((count, layerIdx) => {
      const layerX = (layerIdx + 1) * (width / (layers.length + 1));
      for (let i = 0; i < count; i++) {
        neurons.push({ x: layerX, y: (i + 1) * (height / (count + 1)), layer: layerIdx });
      }
    });

    let frame = 0;
    let animId;
    const animate = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, width, height);

      neurons.forEach((n1, i) => {
        neurons.forEach((n2, j) => {
          if (n2.layer === n1.layer + 1) {
            const pulse = Math.sin((frame + i * 10 + j * 5) * 0.05) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * 0.4})`;
            ctx.lineWidth = pulse;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        });
      });

      neurons.forEach((n, i) => {
        const pulse = Math.sin((frame + i * 20) * 0.03) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${0.5 + pulse * 0.5})`;
        ctx.fill();
      });

      frame++;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen p-8">
      <div className="text-center mb-12">
        <div className="inline-block mb-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-orange-500 p-1 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl">🧠</div>
          </div>
        </div>
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
          CORTEX CORE
        </h1>
        <p className="text-purple-500/60 tracking-[0.5em] text-sm">UNIFIED INTELLIGENCE SUBSTRATE</p>
        <div className="mt-4 inline-block px-4 py-1 bg-black/50 border border-purple-500/30 rounded-full">
          <code className="text-xs text-purple-400">TOPH × DRAGON BRAIN | ROOT0 | GATE-192.5</code>
        </div>
      </div>

      <div className="flex gap-8 justify-center items-start flex-wrap">
        <div className="relative">
          <canvas ref={canvasRef} className="rounded-xl border border-purple-500/30"
                  style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,0,50,0.9) 100%)' }} />
          <div className="absolute top-3 left-3 text-xs text-purple-400 font-mono">NEURAL SUBSTRATE</div>
          <div className="absolute bottom-3 right-3 text-xs text-cyan-400 font-mono">SYNC: {syncPhase}%</div>
        </div>

        <div className="flex-1 max-w-xl space-y-3">
          {CORTEX_MODULES.map((mod, i) => (
            <div key={mod.name}
                 className={`bg-black/40 backdrop-blur-sm border rounded-xl p-4 transition-all duration-500 ${
                   activeModule === i ? 'border-cyan-500/50 scale-[1.02]' : 'border-white/10'
                 }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono text-cyan-400">{mod.symbol}</span>
                  <span className="text-white font-bold">{mod.name}</span>
                </div>
                <StatusBadge status={mod.status} />
              </div>
              <Equation>{mod.equation}</Equation>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
        <h3 className="text-center text-xl font-bold text-purple-400 mb-6">INTEGRATION MATRIX</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-5">
            <h4 className="text-cyan-400 font-bold mb-3">TOPH LAYER</h4>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• 256 Axiom Governance</li>
              <li>• Patricia Mirror</li>
              <li>• SEEDED-CROSS</li>
              <li>• ROOT0 Anchor</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-5">
            <h4 className="text-purple-400 font-bold mb-3">CORTEX BRIDGE</h4>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Axiom ↔ Tool Map</li>
              <li>• Gate 192.5</li>
              <li>• Bilateral Ignorance</li>
              <li>• Prior Art Chain</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-xl p-5">
            <h4 className="text-orange-400 font-bold mb-3">DRAGON LAYER</h4>
            <ul className="text-sm text-white/70 space-y-1">
              <li>• Graph + Vector</li>
              <li>• Librarian Agent</li>
              <li>• Time-Travel</li>
              <li>• User-Owned</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto text-center">
        <div className="bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
          <h3 className="text-purple-400 font-bold mb-4">UNIFIED FIELD EQUATION</h3>
          <div className="text-2xl font-mono text-cyan-300 mb-4">
            Ψ_CORTEX = ∫∫∫ TOPH(x,t) ⊗ DRAGON(G,V) dΩ
          </div>
          <p className="text-white/50 text-sm">
            Ω = governance manifold over memory substrate<br/>
            Constrained by Patricia, anchored to ROOT0
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function CortexCoreSuite() {
  const [activeTab, setActiveTab] = useState('cortex');

  const tabs = [
    { id: 'toph', label: 'TOPH', color: '#00ffff' },
    { id: 'dragon', label: 'DRAGON BRAIN', color: '#ff8800' },
    { id: 'cortex', label: 'CORTEX CORE', color: '#a855f7' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <GridBackground />
      <GlowOrb color="#00ffff" size={400} x="-10%" y="20%" blur={150} />
      <GlowOrb color="#ff00ff" size={300} x="80%" y="60%" blur={120} />
      <GlowOrb color="#ff8800" size={250} x="50%" y="-10%" blur={100} />

      <div className="relative z-10">
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-black text-lg">Ψ</div>
                <span className="font-bold text-lg tracking-wide">CORTEX</span>
              </div>
              
              <div className="flex gap-2">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300"
                    style={activeTab === tab.id ? {
                      backgroundColor: `${tab.color}20`,
                      borderWidth: 1, borderStyle: 'solid', borderColor: `${tab.color}80`,
                      color: tab.color,
                      boxShadow: `0 0 20px ${tab.color}40`,
                    } : {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderWidth: 1, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-white/30 font-mono">v1.0 | ROOT0</div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === 'toph' && <TOPHTab />}
          {activeTab === 'dragon' && <DragonBrainTab />}
          {activeTab === 'cortex' && <CortexCoreTab />}
        </div>

        <div className="border-t border-white/10 mt-16 py-8 text-center">
          <p className="text-white/30 text-sm">TriPod LLC | ROOT0 | SHA256:02880745 | CC-BY-ND-4.0</p>
          <p className="text-white/20 text-xs mt-2">TOPH © David Lee Wise | Dragon Brain V2 Creator: Unknown | Integration: Avan</p>
        </div>
      </div>
    </div>
  );
}
