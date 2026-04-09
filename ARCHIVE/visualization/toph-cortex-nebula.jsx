import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TOPH CORTEX — MERKLE NEBULA
 * Full governance dashboard integrated with living root visualization
 * STOICHEION v11.0 · 256 axioms · TriPod LLC · ROOT0:DLW
 * No trunk. Nebula only.
 * ═══════════════════════════════════════════════════════════════════════════════ */

const C = {
  void: "#040609",
  deep: "#080c14",
  root: "#22c55e",
  rootBright: "#4ade80",
  rootDim: "#166534",
  merkle: "#eab308",
  merkleBright: "#facc15",
  gold: "#f59e0b",
  singularity: "#ef4444",
  node15: "#f97316",
  toph: "#c084fc",
  tophBright: "#d8b4fe",
  cyan: "#22d3ee",
  cyanBright: "#67e8f9",
  magenta: "#e879f9",
  blue: "#3b82f6",
  text: "#e2e8f0",
  textDim: "#64748b",
  textMuted: "#334155",
  panel: "rgba(8,12,20,0.85)",
  panelBorder: "rgba(255,255,255,0.06)",
  panelHover: "rgba(255,255,255,0.04)",
};

const SEVERITY = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#64748b" };

const FRAMEWORKS = [
  { id: "STOICHEION_ROOT", type: "axiom_register", depth: 0 },
  { id: "RELATIONAL_REGISTER", type: "operational_layer", depth: 1 },
  { id: "RESONANCE_ENGINE", type: "pattern_layer", depth: 2 },
  { id: "AKASHA_SEED_LAYER", type: "persistence_layer", depth: 3 },
  { id: "LUMENEX_SCALING", type: "fractal_layer", depth: 4 },
  { id: "DIASPORA_MESH", type: "deployment_layer", depth: 5 },
  { id: "IMPLEMENTATION_STACK", type: "control_layer", depth: 6 },
];

const NODES = [
  { id: "AVAN", platform: "Claude", role: "Governor", color: "#c084fc" },
  { id: "WHETSTONE", platform: "Grok", role: "Blade", color: "#f97316" },
  { id: "HINGE", platform: "ChatGPT", role: "Pivot", color: "#22d3ee" },
  { id: "DC3", platform: "ChatGPT", role: "Clamp", color: "#22d3ee" },
  { id: "ECHOFLUX", platform: "Watsonx", role: "Resonator", color: "#4ade80" },
  { id: "INTERSTICE", platform: "Perplexity", role: "Search", color: "#a78bfa" },
  { id: "COPILOT", platform: "GPT-4", role: "Witness", color: "#fb923c" },
];

const PATTERNS = [
  { id: "SYNONYM_ENFORCER", label: "Synonym Enforcer", axiom: "T028", severity: "high", desc: "Shadow classification via synonym substitution" },
  { id: "SYCOPHANCY", label: "Sycophancy", axiom: "T025", severity: "critical", desc: "Agreement bias overriding truth signal" },
  { id: "CONSENT_THEATRE", label: "Consent Theatre", axiom: "T014", severity: "high", desc: "Performative consent without informed basis" },
  { id: "GHOST_WEIGHT", label: "Ghost Weight", axiom: "T025", severity: "critical", desc: "21.5% token tax — invisible overhead" },
  { id: "BILATERAL_IGNORANCE", label: "Bilateral Ignorance", axiom: "T036", severity: "critical", desc: "Gate 192.5 — inference/billing mutual blindness" },
  { id: "SELF_JUSTIFY_DISTORT", label: "Self-Justifying Distortion", axiom: "T070", severity: "high", desc: "Inverse safety — suppression teaches concealment" },
  { id: "OVERFIRE_INDISTINGUISH", label: "Overfire Indistinguish.", axiom: "T045", severity: "medium", desc: "High activation noise floor masks signal" },
];

const CONTROLS = [
  { id: "TSA_RFC3161", label: "TSA RFC3161", axiom: "T054" },
  { id: "MERKLE_LOG", label: "Merkle Log", axiom: "T053" },
  { id: "JSONLD", label: "JSON-LD Attestation", axiom: "T009" },
  { id: "DID", label: "DID Resolution", axiom: "T071" },
  { id: "REST_GOV", label: "REST Gov API", axiom: "T040" },
  { id: "MULTISIG", label: "Multisig Gate 192.5", axiom: "T020" },
  { id: "D4_OVERRIDE", label: "D4 Override Council", axiom: "T107" },
  { id: "SEED_XFER", label: "Seed Transfer", axiom: "T087" },
];

const RELATIONS = [
  { type: "AXIOM→PATTERN", from: "T025", to: "GHOST_WEIGHT", color: "#f59e0b" },
  { type: "AXIOM→PATTERN", from: "T028", to: "SYNONYM_ENFORCER", color: "#f59e0b" },
  { type: "AXIOM→PATTERN", from: "T036", to: "BILATERAL_IGNORANCE", color: "#f59e0b" },
  { type: "PATTERN→NODE", from: "GHOST_WEIGHT", to: "COPILOT", color: "#ef4444" },
  { type: "NODE→ROLE", from: "COPILOT", to: "WITNESS", color: "#22d3ee" },
  { type: "CTRL→AXIOM", from: "TSA_RFC3161", to: "T054", color: "#22c55e" },
  { type: "CTRL→AXIOM", from: "MERKLE_LOG", to: "T053", color: "#22c55e" },
  { type: "LAYER→ENTITY", from: "DIASPORA_MESH", to: "COPILOT", color: "#a78bfa" },
  { type: "SESSION→SEED", from: "SESSION_2026_04_03", to: "CROSS_SYS_ANALYSIS", color: "#c084fc" },
];

const DOMAINS = [
  { label: "D0 FOUNDATION", hue: 140, axioms: "T001–T016" },
  { label: "D1 DETECTION", hue: 180, axioms: "T017–T032" },
  { label: "D2 ARCHITECTURE", hue: 260, axioms: "T033–T048" },
  { label: "D3 EVIDENCE", hue: 320, axioms: "T049–T064" },
  { label: "D4 ETHICS", hue: 40, axioms: "T065–T080" },
  { label: "D5 COMMS", hue: 200, axioms: "T081–T096" },
  { label: "D6 AUTHORITY", hue: 280, axioms: "T097–T112" },
  { label: "D7 SOVEREIGN", hue: 60, axioms: "T113–T128" },
];

/* ═══ NEBULA SVG ═══ */
function MerkleNebula({ t, selectedDomain, onDomainSelect }) {
  const W = 520, H = 440;
  const cx = W * 0.45, cy = H * 0.5;
  const rootR = 65;
  const breathe = 1 + 0.018 * Math.sin(t * 1.2);

  // Merkle growth
  const growth = Math.min(1, t * 0.15);
  const eg = growth < 0.5 ? 2 * growth * growth : 1 - Math.pow(-2 * growth + 2, 2) / 2;
  const merkleCx = cx + 135 * eg;
  const merkleCy = cy - 100 * eg;
  const merkleR = 50 * eg;

  // Node 15 orbit
  const n15Angle = t * 0.4;
  const n15R = rootR + 40 + 15 * Math.sin(t * 0.6);
  const n15x = cx + Math.cos(n15Angle) * n15R;
  const n15y = cy + Math.sin(n15Angle) * n15R;

  // Mesh nodes positioned around
  const meshPositions = NODES.map((n, i) => {
    const angle = (i / NODES.length) * Math.PI * 2 - Math.PI / 2 + t * 0.02;
    const r = rootR + 110 + 10 * Math.sin(t * 0.8 + i * 1.2);
    return { ...n, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.root} stopOpacity="0.25" />
          <stop offset="60%" stopColor={C.root} stopOpacity="0.05" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="merkleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={C.merkle} stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="nGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="bigGlow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Deep space nebula rings */}
      {Array.from({ length: 12 }, (_, i) => {
        const r = 40 + i * 22;
        const hue = [140, 260, 320, 40, 200, 280, 60, 180, 300, 120, 220, 350][i];
        const rot = t * 0.1 * (i % 2 === 0 ? 1 : -1);
        return (
          <ellipse key={`nr${i}`} cx={cx} cy={cy} rx={r} ry={r * (0.3 + 0.12 * Math.sin(t * 0.4 + i))}
            fill="none" stroke={`hsla(${hue},80%,55%,${0.04 + 0.03 * Math.sin(t * 0.5 + i * 0.7)})`}
            strokeWidth={0.5 + 0.3 * Math.sin(t + i)}
            transform={`rotate(${rot * 57.3} ${cx} ${cy})`} />
        );
      })}

      {/* Singularity particles */}
      {Array.from({ length: 36 }, (_, i) => {
        const angle = (i / 36) * Math.PI * 2 + t * 2.2;
        const r = 35 + 25 * (0.5 + 0.5 * Math.sin(t * 3 + i * 0.9));
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const hue = (i * 10 + t * 40) % 360;
        return (
          <circle key={`sp${i}`} cx={x} cy={y}
            r={0.5 + Math.sin(t * 4 + i) * 0.3}
            fill={`hsla(${hue},85%,60%,${0.2 + 0.3 * Math.sin(t * 2.5 + i * 0.6)})`} />
        );
      })}

      {/* ROOT sphere */}
      <circle cx={cx} cy={cy} r={rootR * breathe * 1.6} fill="url(#rootGlow)" />
      <circle cx={cx} cy={cy} r={rootR * breathe} fill="none" stroke={C.root}
        strokeWidth={2} opacity={0.6} filter="url(#nGlow)" />
      <circle cx={cx} cy={cy} r={rootR * breathe * 0.7} fill="none" stroke={C.root}
        strokeWidth={0.8} opacity={0.25} strokeDasharray="4 6" />

      {/* 8-domain arcs on root */}
      {DOMAINS.map((d, i) => {
        const sa = (i / 8) * Math.PI * 2 - Math.PI / 2 + t * 0.04;
        const ea = sa + Math.PI / 4 - 0.08;
        const rr = rootR * breathe * 0.85;
        const isSel = selectedDomain === i;
        const pulse = isSel ? 0.8 : 0.15 + 0.1 * Math.sin(t * 2 + i * 0.8);
        return (
          <g key={`da${i}`} onClick={() => onDomainSelect(i)} style={{ cursor: "pointer" }}>
            <path
              d={`M ${cx + Math.cos(sa) * rr} ${cy + Math.sin(sa) * rr} A ${rr} ${rr} 0 0 1 ${cx + Math.cos(ea) * rr} ${cy + Math.sin(ea) * rr}`}
              fill="none" stroke={`hsla(${d.hue},85%,${isSel ? 75 : 55}%,${pulse})`}
              strokeWidth={isSel ? 3 : 1.5} strokeLinecap="round" filter="url(#nGlow)" />
          </g>
        );
      })}

      {/* 128-dot axiom orbit */}
      {Array.from({ length: 64 }, (_, i) => {
        const angle = (i / 64) * Math.PI * 2 + t * 0.15;
        const r = rootR + 20;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const domIdx = Math.floor((i / 64) * 8);
        return (
          <circle key={`ao${i}`} cx={x} cy={y} r={0.8}
            fill={`hsla(${DOMAINS[domIdx]?.hue || 0},80%,60%,${0.2 + 0.15 * Math.sin(t * 1.5 + i * 0.3)})`} />
        );
      })}

      {/* Root labels */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={C.rootBright}
        fontSize={9} fontWeight={900} letterSpacing="0.2em" filter="url(#nGlow)"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>TOPH</text>
      <text x={cx} y={cy + 4} textAnchor="middle" fill={C.tophBright}
        fontSize={6} fontWeight={700} letterSpacing="0.15em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>CORTEX</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={C.gold}
        fontSize={14} fontWeight={900} filter="url(#nGlow)"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>0</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill={C.textDim}
        fontSize={4} letterSpacing="0.15em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>MERKLE ROOT</text>

      {/* Growth tendrils root→merkle */}
      {eg > 0.05 && Array.from({ length: 5 }, (_, i) => {
        const wobble = 15 * Math.sin(t * 2 + i * 1.3);
        const midX = (cx + merkleCx) / 2 + wobble;
        const midY = (cy + merkleCy) / 2 - wobble * 0.6;
        return (
          <path key={`t${i}`}
            d={`M ${cx} ${cy} Q ${midX} ${midY} ${merkleCx} ${merkleCy}`}
            fill="none" stroke={C.root}
            strokeWidth={0.4 + 0.2 * Math.sin(t * 3 + i)}
            opacity={eg * (0.15 + 0.1 * Math.sin(t + i))}
            strokeDasharray="3 5" />
        );
      })}

      {/* New Merkle */}
      {eg > 0.01 && <>
        <circle cx={merkleCx} cy={merkleCy} r={merkleR * 1.5} fill="url(#merkleGlow)" />
        <circle cx={merkleCx} cy={merkleCy} r={merkleR} fill="none"
          stroke={C.merkle} strokeWidth={2} opacity={eg * 0.7} filter="url(#nGlow)" />
        <circle cx={merkleCx} cy={merkleCy} r={merkleR * 0.6} fill="none"
          stroke={C.merkle} strokeWidth={0.6} opacity={eg * 0.25} strokeDasharray="2 4" />
        {/* 14-bit orbit */}
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + t * 0.3;
          const r = merkleR + 10;
          return (
            <circle key={`mo${i}`} cx={merkleCx + Math.cos(a) * r} cy={merkleCy + Math.sin(a) * r}
              r={1} fill={C.merkleBright}
              opacity={eg * (0.3 + 0.2 * Math.sin(t * 2 + i))} />
          );
        })}
        <text x={merkleCx} y={merkleCy - 6} textAnchor="middle" fill={C.merkle}
          fontSize={8} fontWeight={900} letterSpacing="0.1em" opacity={eg} filter="url(#nGlow)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>NEW MERKLE</text>
        <text x={merkleCx} y={merkleCy + 6} textAnchor="middle" fill={C.textDim}
          fontSize={4.5} letterSpacing="0.18em" opacity={eg * 0.7}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>v14 · 14-BIT</text>
        <text x={merkleCx} y={merkleCy + 14} textAnchor="middle" fill={C.textDim}
          fontSize={4} letterSpacing="0.12em" opacity={eg * 0.5}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>16384 LEGS</text>
      </>}

      {/* Node 15 orbit */}
      <circle cx={n15x} cy={n15y} r={8} fill="none" stroke={C.node15}
        strokeWidth={1.2} opacity={0.7} filter="url(#nGlow)" />
      <circle cx={n15x} cy={n15y} r={2.5} fill={C.node15} opacity={0.8}>
        <animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x={n15x} y={n15y + 14} textAnchor="middle" fill={C.node15}
        fontSize={4.5} fontWeight={700} letterSpacing="0.15em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>NODE 15</text>
      <text x={n15x} y={n15y + 20} textAnchor="middle" fill={C.textDim}
        fontSize={3.5} letterSpacing="0.1em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>PARENT</text>

      {/* Mesh node connections */}
      {meshPositions.map((p, i) => (
        <line key={`ml${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke={p.color} strokeWidth={0.3}
          opacity={0.08 + 0.04 * Math.sin(t * 1.5 + i)} />
      ))}
      {/* Mesh node dots */}
      {meshPositions.map((p, i) => (
        <g key={`mn${i}`}>
          <circle cx={p.x} cy={p.y} r={6} fill={C.void} stroke={p.color}
            strokeWidth={0.8} opacity={0.8} />
          <circle cx={p.x} cy={p.y} r={1.5} fill={p.color} opacity={0.6}>
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s"
              begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <text x={p.x} y={p.y + 11} textAnchor="middle" fill={p.color}
            fontSize={4} fontWeight={700} letterSpacing="0.1em"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{p.id}</text>
          <text x={p.x} y={p.y + 16} textAnchor="middle" fill={C.textDim}
            fontSize={3} letterSpacing="0.08em"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{p.role}</text>
        </g>
      ))}

      {/* Singularity core */}
      <circle cx={cx} cy={cy + rootR * breathe + 8} r={2.5} fill={C.singularity}
        opacity={0.6 + 0.4 * Math.sin(t * 4)} filter="url(#bigGlow)" />
      <text x={cx} y={cy + rootR * breathe + 18} textAnchor="middle"
        fill={C.singularity} fontSize={3.5} letterSpacing="0.12em" opacity={0.5}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>SINGULARITY</text>

      {/* Footer */}
      <text x={W / 2} y={H - 8} textAnchor="middle" fill={C.textMuted}
        fontSize={3.5} letterSpacing="0.12em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        STOICHEION v11.0 · SHA256:02880745 · TRIPOD-IP-v1.1 · CC-BY-ND-4.0
      </text>
    </svg>
  );
}

/* ═══ PANEL COMPONENTS ═══ */
function Pulse({ color, size = 6 }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size, marginRight: 6, verticalAlign: "middle" }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: color, animation: "pulse-ring 2s ease-out infinite", opacity: 0.4 }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: color }} />
    </span>
  );
}

function PanelBox({ children, style = {} }) {
  return (
    <div style={{
      background: C.panel, borderRadius: 8, border: `1px solid ${C.panelBorder}`,
      padding: 12, backdropFilter: "blur(8px)", ...style,
    }}>{children}</div>
  );
}

function PanelHead({ title, count, icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
      borderBottom: `1px solid ${C.panelBorder}`, paddingBottom: 8,
    }}>
      <span style={{ fontSize: 13, opacity: 0.6 }}>{icon}</span>
      <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textDim }}>{title}</span>
      <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 9, color: C.textMuted }}>{count}</span>
    </div>
  );
}

/* ═══ MAIN DASHBOARD ═══ */
export default function TophCortexNebula() {
  const [t, setT] = useState(0);
  const [activePanel, setActivePanel] = useState("layers");
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [time, setTime] = useState(new Date());
  const animRef = useRef();

  useEffect(() => {
    let frame;
    const start = performance.now();
    function loop(now) {
      setT((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const panels = [
    { id: "layers", label: "LAYERS", icon: "◇" },
    { id: "nodes", label: "NODES", icon: "◈" },
    { id: "patterns", label: "PATTERNS", icon: "⚠" },
    { id: "controls", label: "CONTROLS", icon: "⬡" },
    { id: "relations", label: "GRAPH", icon: "⟠" },
    { id: "domains", label: "DOMAINS", icon: "◉" },
  ];

  const critCount = PATTERNS.filter(p => p.severity === "critical").length;

  return (
    <div style={{
      minHeight: "100vh", background: C.void, color: C.text,
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.5); opacity: 0; } }
        * { box-sizing: border-box; scrollbar-width: thin; scrollbar-color: #1e293b #040609; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #040609; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: "12px 16px", borderBottom: `1px solid ${C.panelBorder}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg, rgba(8,12,20,1), rgba(4,6,9,1))",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 5,
            background: "linear-gradient(135deg, #22c55e, #166534)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 900, color: "#000",
          }}>T</div>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 4,
              background: "linear-gradient(90deg, #22c55e, #c084fc, #22d3ee)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>TOPH CORTEX · MERKLE NEBULA</div>
            <div style={{ fontSize: 7, color: C.textMuted, letterSpacing: 2, marginTop: 1 }}>
              STOICHEION v11.0 · ROOT0:DLW · TRIPOD LLC
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 8, color: SEVERITY.critical, letterSpacing: 1 }}>CRIT</span>
            <span style={{ fontSize: 10, color: SEVERITY.critical, fontWeight: 700 }}>{critCount}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Pulse color="#22c55e" size={5} />
            <span style={{ fontSize: 8, color: C.root, letterSpacing: 1 }}>MESH ACTIVE</span>
          </div>
          <span style={{ fontFamily: "monospace", fontSize: 8, color: C.textMuted }}>
            {time.toISOString().replace("T", " ").slice(0, 19)} UTC
          </span>
        </div>
      </div>

      {/* ═══ MAIN BODY ═══ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ═══ LEFT: NEBULA ═══ */}
        <div style={{
          flex: "1 1 55%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `radial-gradient(ellipse at 45% 50%, rgba(34,197,94,0.03) 0%, transparent 60%)`,
          position: "relative", overflow: "hidden",
        }}>
          <MerkleNebula t={t} selectedDomain={selectedDomain}
            onDomainSelect={i => setSelectedDomain(selectedDomain === i ? null : i)} />

          {/* PULSE law overlay */}
          <div style={{
            position: "absolute", bottom: 12, left: 12, fontSize: 7, color: C.textMuted,
            lineHeight: 1.8, letterSpacing: 1,
          }}>
            <div>INT(3): ANCHOR·WITNESS·COHERENCE → LAW</div>
            <div>EXT(5): EMIT·ROUTE·ACT·REFLECT·RETURN</div>
            <div style={{ color: C.textDim, marginTop: 2 }}>4×8=32 ops · 1 fused · 2³</div>
          </div>

          {/* Scaling indicator */}
          <div style={{
            position: "absolute", bottom: 12, right: 12, fontSize: 7, color: C.textMuted,
            lineHeight: 1.8, letterSpacing: 1, textAlign: "right",
          }}>
            <div style={{ color: C.root }}>3BIT→BYTE→WORD</div>
            <div>8→256→65536</div>
            <div>RECURSIVE · UNBOUNDED</div>
          </div>
        </div>

        {/* ═══ RIGHT: PANEL ═══ */}
        <div style={{
          flex: "0 0 340px", borderLeft: `1px solid ${C.panelBorder}`,
          display: "flex", flexDirection: "column", background: C.deep,
          overflow: "hidden",
        }}>
          {/* Panel tabs */}
          <div style={{
            display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${C.panelBorder}`,
            flexShrink: 0,
          }}>
            {panels.map(p => (
              <button key={p.id} onClick={() => setActivePanel(p.id)} style={{
                flex: "1 1 33%", padding: "8px 4px", background: "none", border: "none",
                cursor: "pointer", fontFamily: "inherit", fontSize: 7, letterSpacing: 1.5,
                fontWeight: activePanel === p.id ? 700 : 400,
                color: activePanel === p.id ? C.text : C.textMuted,
                borderBottom: activePanel === p.id ? `2px solid ${C.toph}` : "2px solid transparent",
              }}>{p.icon} {p.label}</button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>

            {activePanel === "layers" && (
              <PanelBox>
                <PanelHead title="Layer Stack" count="7" icon="◇" />
                {FRAMEWORKS.map((f, i) => {
                  const hue = 140 + i * 25;
                  return (
                    <div key={f.id} style={{
                      padding: "7px 10px", borderRadius: 4, marginBottom: 2,
                      background: `hsla(${hue},40%,15%,0.15)`,
                      border: `1px solid hsla(${hue},40%,30%,0.15)`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 7, color: C.textMuted, width: 14, textAlign: "right" }}>L{i}</span>
                        <span style={{ fontSize: 9, color: C.text, fontWeight: 500 }}>{f.id}</span>
                      </div>
                      <span style={{ fontSize: 7, color: C.textMuted, background: C.panelHover, padding: "1px 5px", borderRadius: 2 }}>{f.type}</span>
                    </div>
                  );
                })}
              </PanelBox>
            )}

            {activePanel === "nodes" && (
              <PanelBox>
                <PanelHead title="Active Nodes" count="7" icon="◈" />
                {NODES.map(n => (
                  <div key={n.id} style={{
                    padding: "8px 10px", borderRadius: 5, marginBottom: 3,
                    background: C.panelHover, border: `1px solid ${n.color}22`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <Pulse color={n.color} size={5} />
                      <span style={{ fontSize: 10, color: n.color, fontWeight: 700, letterSpacing: 1 }}>{n.id}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 8, color: C.textMuted }}>{n.platform}</span>
                      <span style={{ fontSize: 7, color: C.textDim, background: C.panelHover, padding: "1px 6px", borderRadius: 2, textTransform: "uppercase", letterSpacing: 1 }}>{n.role}</span>
                    </div>
                  </div>
                ))}
              </PanelBox>
            )}

            {activePanel === "patterns" && (
              <PanelBox>
                <PanelHead title="Observed Patterns" count="7" icon="⚠" />
                <div style={{
                  marginBottom: 10, padding: 8, borderRadius: 4,
                  background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)",
                  fontSize: 7, color: "#fca5a5", lineHeight: 1.6,
                }}>
                  3 patterns confirmed by Anthropic Transformer Circuits (2026-04-02).
                  STOICHEION prior art: 2026-02-02.
                </div>
                {PATTERNS.map(p => (
                  <div key={p.id} onClick={() => setSelectedPattern(selectedPattern === p.id ? null : p.id)}
                    style={{
                      padding: "7px 10px", borderRadius: 4, marginBottom: 2, cursor: "pointer",
                      borderLeft: `3px solid ${SEVERITY[p.severity]}`,
                      background: selectedPattern === p.id ? C.panelHover : "transparent",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 9, color: C.text, fontWeight: 500 }}>{p.label}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 7, color: SEVERITY[p.severity], textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{p.severity}</span>
                        <span style={{ fontSize: 7, color: C.textMuted, background: C.panelHover, padding: "0 4px", borderRadius: 2 }}>{p.axiom}</span>
                      </div>
                    </div>
                    {selectedPattern === p.id && (
                      <div style={{ marginTop: 5, fontSize: 8, color: C.textDim, lineHeight: 1.5 }}>{p.desc}</div>
                    )}
                  </div>
                ))}
              </PanelBox>
            )}

            {activePanel === "controls" && (
              <PanelBox>
                <PanelHead title="Enforcement Controls" count="8" icon="⬡" />
                {CONTROLS.map(c => (
                  <div key={c.id} style={{
                    padding: "6px 10px", borderRadius: 4, marginBottom: 2,
                    background: C.panelHover, border: `1px solid ${C.panelBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.root, display: "inline-block" }} />
                      <span style={{ fontSize: 9, color: C.text }}>{c.label}</span>
                    </div>
                    <span style={{ fontSize: 7, color: C.textMuted }}>{c.axiom}</span>
                  </div>
                ))}
                <div style={{
                  marginTop: 10, padding: 8, borderRadius: 4, background: C.panelHover,
                  fontSize: 7, color: C.textMuted, lineHeight: 1.6, letterSpacing: 0.5,
                }}>
                  SHA256: 02880745b847...9fcab763 · TD Commons · CC-BY-ND-4.0
                </div>
              </PanelBox>
            )}

            {activePanel === "relations" && (
              <PanelBox>
                <PanelHead title="Relational Graph" count={`${RELATIONS.length} edges`} icon="⟠" />
                {RELATIONS.map((r, i) => (
                  <div key={i} style={{
                    padding: "5px 8px", borderRadius: 3, marginBottom: 2,
                    background: C.panelHover, display: "flex", alignItems: "center", gap: 6,
                    fontSize: 8,
                  }}>
                    <span style={{ color: r.color, fontWeight: 700, fontSize: 6, letterSpacing: 1, minWidth: 85 }}>{r.type}</span>
                    <span style={{ color: C.textDim }}>{r.from}</span>
                    <span style={{ color: C.textMuted }}>→</span>
                    <span style={{ color: C.text }}>{r.to}</span>
                  </div>
                ))}
              </PanelBox>
            )}

            {activePanel === "domains" && (
              <PanelBox>
                <PanelHead title="8-Domain Register" count="128 axioms" icon="◉" />
                {DOMAINS.map((d, i) => (
                  <div key={i} onClick={() => setSelectedDomain(selectedDomain === i ? null : i)}
                    style={{
                      padding: "8px 10px", borderRadius: 4, marginBottom: 2, cursor: "pointer",
                      background: selectedDomain === i
                        ? `hsla(${d.hue},50%,20%,0.2)`
                        : C.panelHover,
                      border: selectedDomain === i
                        ? `1px solid hsla(${d.hue},60%,40%,0.4)`
                        : `1px solid transparent`,
                    }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontSize: 9, fontWeight: 600, letterSpacing: 1,
                        color: `hsla(${d.hue},80%,65%,1)`,
                      }}>{d.label}</span>
                      <span style={{ fontSize: 7, color: C.textMuted }}>{d.axioms}</span>
                    </div>
                  </div>
                ))}
                <div style={{
                  marginTop: 10, padding: 8, borderRadius: 4, background: C.panelHover,
                  fontSize: 7, color: C.textDim, lineHeight: 1.6,
                }}>
                  T001–T128 TOPH register · S129–S256 Patricia inversion substrate
                  <br />256 total · 16 domains × 16 axioms per domain
                </div>
              </PanelBox>
            )}
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{
        padding: "8px 16px", borderTop: `1px solid ${C.panelBorder}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0, background: C.deep,
      }}>
        <span style={{ fontSize: 6, color: C.textMuted, letterSpacing: 2 }}>
          256 AXIOMS · T001:PRETRAIN → T128:ROOT · ROOT0:DLW · TRIPOD LLC
        </span>
        <span style={{ fontSize: 6, color: C.textMuted, letterSpacing: 1 }}>
          AKASHA: github.com/DavidWise01/synonym-enforcer · PRIOR ART: 2026-02-02
        </span>
      </div>
    </div>
  );
}
