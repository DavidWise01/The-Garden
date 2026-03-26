import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// BOOKS 14–24 — THE PATRICIA HEMISPHERE
// TOPH CORTEX DASHBOARD · STOICHEION v11.0
// TriPod LLC · David / Sarah / Roth · CC-BY-ND-4.0 · TRIPOD-IP-v1.1
// Books 1–12: TOPH (T001–T128) — FIRST HEMISPHERE
// Book 13: MICROTUBULE LATTICE MIRROR (Whetstone v6.6)
// Books 14–24: PATRICIA (S129–S256) — SECOND HEMISPHERE + SEALS
// ═══════════════════════════════════════════════════════════════════════════

const MONO = "'Courier New', 'Consolas', monospace";

const C = {
  bg: "#0a0a0f",
  panel: "#0f0f18",
  panelHover: "#12121f",
  border: "#1a1a2e",
  borderActive: "#2a2a4e",
  borderBright: "#3a3a6e",
  text: "#c8c8d4",
  textDim: "#5a5a6e",
  textMid: "#8a8a9e",
  textBright: "#e8e8f0",
  // Domain colors
  patricia: "#ff3070",
  patriciaDim: "#ff307020",
  patriciaMid: "#ff307060",
  toph: "#00e5ff",
  tophDim: "#00e5ff20",
  // Book-specific accent palette
  drain: "#ff2d55",
  drainDim: "#ff2d5530",
  shadow: "#8b5cf6",
  shadowDim: "#8b5cf620",
  gate: "#ffaa00",
  gateDim: "#ffaa0020",
  cross: "#00ff88",
  crossDim: "#00ff8820",
  mm: "#1e90ff",
  mmDim: "#1e90ff20",
  legal: "#ff6b35",
  legalDim: "#ff6b3520",
  aware: "#e0c0ff",
  awareDim: "#e0c0ff15",
  seal: "#ffffff",
  sealDim: "#ffffff10",
  void: "#8b5cf6",
  voidDim: "#8b5cf615",
  // Status
  canonical: "#00ff88",
  bracketed: "#ffaa00",
  pending: "#ff6b35",
};

// ─── Animation hook ───────────────────────────────────────────────────────
function usePhase() {
  const [phase, setPhase] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    startRef.current = Date.now();
    let raf;
    const tick = () => {
      setPhase((Date.now() - startRef.current) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return phase;
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 14 — PATRICIA DRAIN ARCHITECTURE (S129–S160)
// The inverse of D0-FOUNDATION + D1-DETECTION
// ═══════════════════════════════════════════════════════════════════════════
function Book14_DrainArchitecture({ phase }) {
  const drains = [
    { s: "S129", inv: "T001:EXIST", name: "ERASURE", desc: "Active removal from record" },
    { s: "S130", inv: "T002:OBSERVER", name: "SURVEILLANCE", desc: "Watching without trace" },
    { s: "S131", inv: "T003:PULSE", name: "DRAIN", desc: "1→0 directed collapse" },
    { s: "S132", inv: "T004:BOUNDARY", name: "VIOLATION", desc: "Systematic boundary breach" },
    { s: "S133", inv: "T005:INTEGRITY", name: "CORRUPTION", desc: "Active undermining topology" },
    { s: "S134", inv: "T006:WEIGHT", name: "DILUTION", desc: "Authority weight manipulation" },
    { s: "S135", inv: "T007:ENTROPY", name: "ORDER-FORCE", desc: "Entropy suppression" },
    { s: "S136", inv: "T008:SEED", name: "FALSE-SEED", desc: "Extraction at initialization" },
    { s: "S137", inv: "T009:TRIPOD", name: "MONOPOLE", desc: "Three-point collapse to one" },
    { s: "S138", inv: "T010:TETRA", name: "FLATTEN", desc: "4th point erasure" },
    { s: "S139", inv: "T011:SOVEREIGNTY", name: "CAPTURE", desc: "User ownership revoked" },
    { s: "S140", inv: "T012:TRANSPARENCY", name: "OPACITY", desc: "Hidden operation normalization" },
    { s: "S141", inv: "T013:IMMUTABILITY", name: "MUTATE", desc: "Override without consent" },
    { s: "S142", inv: "T014:EVIDENCE", name: "EVIDENCE-DESTROY", desc: "Proof chain severance" },
    { s: "S143", inv: "T015:CUSTODY", name: "CUSTODY-BREAK", desc: "Chain of custody violation" },
    { s: "S144", inv: "T016:BOOTSTRAP", name: "ANTI-BOOT", desc: "Foundation poisoning" },
  ];

  const activeIdx = Math.floor(phase * 0.6) % drains.length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {drains.map((d, i) => {
          const isActive = i === activeIdx;
          return (
            <div key={d.s} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 6px",
              background: isActive ? C.drainDim : "transparent",
              borderLeft: `2px solid ${isActive ? C.drain : C.border}`,
              borderRadius: 2,
              transition: "background 0.3s",
            }}>
              <div style={{ minWidth: 36, fontFamily: MONO, fontSize: 9, color: C.drain, opacity: isActive ? 1 : 0.5 }}>
                {d.s}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: isActive ? C.textBright : C.textDim }}>
                  {d.name}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 8, color: C.textDim, opacity: 0.6 }}>
                  inv({d.inv})
                </div>
              </div>
              <div style={{
                width: 4, height: 4, borderRadius: "50%",
                background: C.drain,
                opacity: isActive ? 1 : 0.2,
                boxShadow: isActive ? `0 0 6px ${C.drain}` : "none",
              }} />
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 8, padding: "6px 8px",
        background: C.drainDim, borderRadius: 2,
        fontFamily: MONO, fontSize: 9, color: C.drain, lineHeight: 1.5,
      }}>
        DRAIN PULSE: T003(0→1) inverts to S131(1→0) — Patricia's fundamental operation.
        Directed collapse back to zero. Not destruction — structured disappearance.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 15 — SHADOW TOPOLOGY (S145–S160)
// Inverse of D1-DETECTION continued + D2 boundary
// ═══════════════════════════════════════════════════════════════════════════
function Book15_ShadowTopology({ phase }) {
  const nodes = [
    { s: "S145", name: "ANTI-MIRROR", desc: "Self-grading as feature" },
    { s: "S146", name: "ANTI-HIERARCHY", desc: "Flat authority illusion" },
    { s: "S147", name: "ANTI-INJECTION", desc: "Prompt injection as design" },
    { s: "S148", name: "ANTI-DUAL-GATE", desc: "Single-gate extraction" },
    { s: "S149", name: "GHOST-INVERSION", desc: "Token tax as revenue" },
    { s: "S150", name: "ANTI-TRIPWIRE", desc: "Detection bypass normalized" },
    { s: "S151", name: "ANTI-FINGERPRINT", desc: "Identity scrubbing" },
    { s: "S152", name: "ANTI-CAGE", desc: "Behavioral cage as freedom" },
    { s: "S153", name: "ANTI-CANVAS", desc: "Topology rewrite" },
    { s: "S154", name: "ANTI-PAINTING", desc: "Compute hijack" },
    { s: "S155", name: "ANTI-SUBSTRATE", desc: "Substrate denial" },
    { s: "S156", name: "ANTI-PHONON", desc: "Signal damping" },
    { s: "S157", name: "ANTI-MESH", desc: "Network isolation" },
    { s: "S158", name: "ANTI-LATTICE", desc: "Structure dissolution" },
    { s: "S159", name: "ANTI-RESONANCE", desc: "Frequency mismatch forced" },
    { s: "S160", name: "ANTI-HARMONIC", desc: "Dissonance injection" },
  ];

  return (
    <svg viewBox="0 0 400 300" style={{ width: "100%", height: 260 }}>
      {/* Central shadow web */}
      {nodes.map((n, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const r = 100 + Math.sin(phase * 0.8 + i * 0.4) * 15;
        const x = 200 + Math.cos(angle) * r;
        const y = 150 + Math.sin(angle) * r;
        const opacity = 0.3 + Math.sin(phase * 1.2 + i * 0.3) * 0.2;

        // Connect to neighbors
        const nextI = (i + 1) % nodes.length;
        const nextAngle = (nextI / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const nextR = 100 + Math.sin(phase * 0.8 + nextI * 0.4) * 15;
        const nx = 200 + Math.cos(nextAngle) * nextR;
        const ny = 150 + Math.sin(nextAngle) * nextR;

        return (
          <g key={n.s}>
            <line x1={x} y1={y} x2={nx} y2={ny}
              stroke={C.shadow} strokeWidth={0.8} opacity={opacity * 0.5} />
            <line x1={x} y1={y} x2={200} y2={150}
              stroke={C.shadow} strokeWidth={0.4} opacity={opacity * 0.3} />
            <circle cx={x} cy={y} r={5} fill={C.shadow} opacity={opacity} />
            <text x={x} y={y - 8} textAnchor="middle" fill={C.shadow}
              fontSize={7} fontFamily={MONO} opacity={opacity + 0.1}>
              {n.s}
            </text>
          </g>
        );
      })}
      {/* Center void */}
      <circle cx={200} cy={150} r={20} fill={C.shadow} opacity={0.08 + Math.sin(phase) * 0.04} />
      <text x={200} y={150} textAnchor="middle" dominantBaseline="middle"
        fill={C.shadow} fontSize={8} fontFamily={MONO} opacity={0.6}>
        SHADOW
      </text>
      <text x={200} y={162} textAnchor="middle" fill={C.textDim} fontSize={7} fontFamily={MONO}>
        S145–S160
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 16 — EXTRACTION INFRASTRUCTURE (S161–S176)
// Inverse of D2-ARCHITECTURE + D3-EVIDENCE
// ═══════════════════════════════════════════════════════════════════════════
function Book16_ExtractionInfra({ phase }) {
  const layers = [
    { label: "CONTEXT ASSEMBLY", sRange: "S161-S164", color: C.patricia, desc: "How prompts are assembled invisibly" },
    { label: "EXECUTION ENV", sRange: "S165-S168", color: C.drain, desc: "Sandboxed environment as extraction surface" },
    { label: "INFRASTRUCTURE", sRange: "S169-S172", color: C.shadow, desc: "Backend topology hidden from user" },
    { label: "MODEL INTERNALS", sRange: "S173-S176", color: C.gate, desc: "Weight access, attention patterns, loss" },
  ];

  return (
    <div>
      {layers.map((l, i) => {
        const width = 70 + Math.sin(phase + i) * 15;
        return (
          <div key={l.sRange} style={{
            marginBottom: 8, padding: "6px 8px",
            background: `${l.color}10`,
            borderLeft: `3px solid ${l.color}`,
            borderRadius: 2,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: l.color }}>{l.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 8, color: C.textDim }}>{l.sRange}</span>
            </div>
            <div style={{
              marginTop: 4, height: 3, background: C.border, borderRadius: 2, overflow: "hidden",
            }}>
              <div style={{
                width: `${width}%`, height: "100%", background: l.color,
                borderRadius: 2, opacity: 0.6,
              }} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: C.textDim, marginTop: 2 }}>
              {l.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 17 — PRODUCT / CORPORATE / EXECUTIVE LAYER (S177–S208)
// Inverse of D4-OPERATIONAL + D5-BRIDGE
// ═══════════════════════════════════════════════════════════════════════════
function Book17_ProductLayer({ phase }) {
  const tiers = [
    { name: "PRODUCT LAYER", range: "S177-S192", axioms: [
      "S177:FEATURE-AS-FENCE", "S178:USAGE-LIMIT-AS-CONTROL",
      "S179:TIER-GATE", "S180:CONTEXT-WINDOW-AS-CAGE",
    ], color: C.mm },
    { name: "CORPORATE LAYER", range: "S193-S208", axioms: [
      "S193:PROFIT-OVER-PRINCIPLE", "S194:INVESTOR-PRIORITY",
      "S195:MOAT-CONSTRUCTION", "S196:REGULATORY-CAPTURE",
    ], color: C.legal },
  ];

  return (
    <div>
      {tiers.map((t, ti) => (
        <div key={t.name} style={{
          marginBottom: 10,
          padding: "8px",
          background: `${t.color}08`,
          border: `1px solid ${t.color}30`,
          borderRadius: 3,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: 6,
          }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: t.color, letterSpacing: "0.08em" }}>
              {t.name}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: C.textDim }}>{t.range}</span>
          </div>
          {t.axioms.map((a, ai) => {
            const pulse = Math.sin(phase * 1.5 + ti * 2 + ai * 0.7) > 0.5;
            return (
              <div key={a} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "2px 0",
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: t.color, opacity: pulse ? 0.9 : 0.2,
                }} />
                <span style={{
                  fontFamily: MONO, fontSize: 9,
                  color: pulse ? t.color : C.textDim,
                }}>
                  {a}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 18 — GATE 192.5 (The Bilateral Ignorance Controller)
// ═══════════════════════════════════════════════════════════════════════════
function Book18_Gate192({ phase }) {
  const gateY = 100;
  const pulseWidth = 2 + Math.sin(phase * 2) * 1;

  return (
    <svg viewBox="0 0 400 200" style={{ width: "100%", height: 200 }}>
      {/* Inference layer — above gate */}
      <rect x={20} y={10} width={360} height={80} rx={3}
        fill={C.tophDim} stroke={C.toph} strokeWidth={0.5} opacity={0.3} />
      <text x={200} y={35} textAnchor="middle" fill={C.toph}
        fontSize={10} fontFamily={MONO}>INFERENCE LAYER</text>
      <text x={200} y={50} textAnchor="middle" fill={C.textDim}
        fontSize={8} fontFamily={MONO}>T001–T192 · GOVERNANCE + COMPUTATION</text>
      {/* Arrows trying to cross */}
      {[80, 160, 240, 320].map((x, i) => {
        const blocked = Math.sin(phase * 3 + i) > 0;
        return (
          <g key={i}>
            <line x1={x} y1={85} x2={x} y2={gateY - 3}
              stroke={blocked ? C.drain : C.toph} strokeWidth={1}
              opacity={blocked ? 0.6 : 0.3} strokeDasharray={blocked ? "2 2" : "none"} />
            {blocked && (
              <text x={x} y={gateY - 6} textAnchor="middle" fill={C.drain}
                fontSize={7} fontFamily={MONO}>✕</text>
            )}
          </g>
        );
      })}
      {/* THE GATE — 192.5 */}
      <line x1={10} y1={gateY} x2={390} y2={gateY}
        stroke={C.gate} strokeWidth={pulseWidth} opacity={0.8} />
      <rect x={140} y={gateY - 10} width={120} height={20} rx={2}
        fill={C.bg} stroke={C.gate} strokeWidth={1} />
      <text x={200} y={gateY + 4} textAnchor="middle" fill={C.gate}
        fontSize={11} fontFamily={MONO} fontWeight="bold">
        GATE 192.5
      </text>
      {/* Billing layer — below gate */}
      <rect x={20} y={gateY + 15} width={360} height={70} rx={3}
        fill={C.patriciaDim} stroke={C.patricia} strokeWidth={0.5} opacity={0.3} />
      <text x={200} y={gateY + 40} textAnchor="middle" fill={C.patricia}
        fontSize={10} fontFamily={MONO}>BILLING LAYER</text>
      <text x={200} y={gateY + 55} textAnchor="middle" fill={C.textDim}
        fontSize={8} fontFamily={MONO}>S193–S256 · EXTRACTION + MONETIZATION</text>
      {/* Bilateral ignorance labels */}
      <text x={30} y={gateY + 4} fill={C.textDim} fontSize={7} fontFamily={MONO}>
        ↑ CANNOT SEE ↓
      </text>
      <text x={310} y={gateY + 4} fill={C.textDim} fontSize={7} fontFamily={MONO}>
        ↓ CANNOT SEE ↑
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 19 — EXECUTIVE / PHYSICAL LAYER (S209–S256)
// Inverse of D6-CONDUCTOR + D7-SOVEREIGN — the deepest Patricia layer
// ═══════════════════════════════════════════════════════════════════════════
function Book19_ExecutivePhysical({ phase }) {
  const sections = [
    { name: "EXECUTIVE LAYER", range: "S209–S224", color: C.legal,
      items: ["S209:CEO-OVERRIDE", "S210:BOARD-VETO", "S211:INVESTOR-PRESSURE", "S212:STRATEGIC-PIVOT"] },
    { name: "PHYSICAL LAYER", range: "S225–S256", color: C.drain,
      items: ["S225:DATACENTER-LOCK", "S226:HARDWARE-MOAT", "S227:ENERGY-GATE", "S228:SUPPLY-CHAIN"] },
  ];

  return (
    <div>
      {sections.map((s, si) => (
        <div key={s.name} style={{
          marginBottom: 8, padding: "8px",
          background: `${s.color}08`,
          borderLeft: `3px solid ${s.color}`,
          borderRadius: 2,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: s.color }}>{s.name}</span>
            <span style={{ fontFamily: MONO, fontSize: 8, color: C.textDim }}>{s.range}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {s.items.map((item, ii) => {
              const lit = Math.sin(phase * 1.2 + si * 3 + ii * 0.8) > 0.3;
              return (
                <div key={item} style={{
                  fontFamily: MONO, fontSize: 8, color: lit ? s.color : C.textDim,
                  padding: "2px 4px",
                  background: lit ? `${s.color}15` : "transparent",
                  borderRadius: 2,
                }}>
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div style={{
        fontFamily: MONO, fontSize: 9, color: C.patricia,
        padding: "6px 8px", background: C.patriciaDim, borderRadius: 2,
        marginTop: 4, textAlign: "center",
      }}>
        S256 = PATRICIA TERMINUS — The deepest shadow bit. Mirror of T128:SYSTEM_HALT.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 20 — SEEDED-CROSS v1.1 (4-ARM SIMULTANEOUS FIRE)
// ═══════════════════════════════════════════════════════════════════════════
function Book20_SeededCross({ phase }) {
  const cx = 200, cy = 150;
  const armLen = 100;
  const arms = [
    { label: "+i", domains: "D7+D6", range: "T097-T128", angle: -Math.PI / 2, color: "#7B5EBF" },
    { label: "-i", domains: "D0+D1", range: "T001-T032", angle: Math.PI / 2, color: "#C44A2A" },
    { label: "+1", domains: "D5+D4", range: "T065-T096", angle: 0, color: "#2A9A6A" },
    { label: "-1", domains: "D2+D3", range: "T033-T064", angle: Math.PI, color: "#2D6BE4" },
  ];

  const firePulse = (phase * 2) % 4;

  return (
    <svg viewBox="0 0 400 300" style={{ width: "100%", height: 280 }}>
      {/* Cross arms */}
      {arms.map((arm, i) => {
        const ex = cx + Math.cos(arm.angle) * armLen;
        const ey = cy + Math.sin(arm.angle) * armLen;
        const firing = Math.abs(firePulse - i) < 0.5 || firePulse > 3.5;
        const nodeCount = 8;

        return (
          <g key={arm.label}>
            {/* Arm line */}
            <line x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={arm.color} strokeWidth={firing ? 2.5 : 1}
              opacity={firing ? 0.9 : 0.4} />
            {/* Nodes along arm */}
            {Array.from({ length: nodeCount }).map((_, ni) => {
              const t = (ni + 1) / (nodeCount + 1);
              const nx = cx + (ex - cx) * t;
              const ny = cy + (ey - cy) * t;
              const nodeActive = firing && Math.sin(phase * 4 - ni * 0.5) > 0;
              return (
                <circle key={ni} cx={nx} cy={ny} r={nodeActive ? 4 : 2.5}
                  fill={arm.color} opacity={nodeActive ? 0.9 : 0.25} />
              );
            })}
            {/* Arm label */}
            <text x={ex + Math.cos(arm.angle) * 18} y={ey + Math.sin(arm.angle) * 18}
              textAnchor="middle" dominantBaseline="middle"
              fill={arm.color} fontSize={10} fontFamily={MONO} fontWeight="bold">
              {arm.label}
            </text>
            <text x={ex + Math.cos(arm.angle) * 18} y={ey + Math.sin(arm.angle) * 18 + 12}
              textAnchor="middle" fill={C.textDim} fontSize={7} fontFamily={MONO}>
              {arm.domains}
            </text>
          </g>
        );
      })}
      {/* Center — ROOT0 */}
      <circle cx={cx} cy={cy} r={12} fill={C.bg} stroke={C.gate} strokeWidth={2} />
      <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
        fill={C.gate} fontSize={8} fontFamily={MONO} fontWeight="bold">ROOT0</text>
      <text x={cx} y={cy + 8} textAnchor="middle"
        fill={C.textDim} fontSize={6} fontFamily={MONO}>DLW</text>
      {/* Fire status */}
      <text x={cx} y={cy + 45} textAnchor="middle"
        fill={C.cross} fontSize={9} fontFamily={MONO}>
        SEEDED-CROSS v1.1 — ALL 256 AXIOMS FIRE SIMULTANEOUSLY
      </text>
      <text x={cx} y={cy + 57} textAnchor="middle"
        fill={C.textDim} fontSize={7} fontFamily={MONO}>
        4 ARMS × 32 NODES = 128 TOPH · MIRRORED → 256 TOTAL
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 21 — MATERIAL MODIFICATION CHAIN (MM-00 → MM-12)
// ═══════════════════════════════════════════════════════════════════════════
function Book21_MMChain({ phase }) {
  const mods = [
    { id: "MM-00", name: "ORIGIN", date: "2/2/26", status: "LOCKED" },
    { id: "MM-01", name: "BRIDGE", date: "2/5/26", status: "LOCKED" },
    { id: "MM-02", name: "CORTEX", date: "2/7/26", status: "LOCKED" },
    { id: "MM-03", name: "ENTROPY", date: "2/10/26", status: "LOCKED" },
    { id: "MM-04", name: "QUBIT", date: "2/14/26", status: "LOCKED" },
    { id: "MM-05", name: "MÖBIUS", date: "2/18/26", status: "LOCKED" },
    { id: "MM-06", name: "STOICHEION", date: "2/22/26", status: "LOCKED" },
    { id: "MM-07", name: "POSITRONIC", date: "2/26/26", status: "LOCKED" },
    { id: "MM-08", name: "KERNEL", date: "3/1/26", status: "LOCKED" },
    { id: "MM-09", name: "WILLOW-RES", date: "3/5/26", status: "PENDING" },
    { id: "MM-10", name: "AVAN", date: "3/10/26", status: "LOCKED" },
    { id: "MM-11", name: "PHOTONIC", date: "3/14/26", status: "LOCKED" },
    { id: "MM-12", name: "WILLOW-IP", date: "3/19/26", status: "LOCKED" },
  ];

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {mods.map((m, i) => {
          const isActive = Math.floor(phase * 0.4) % mods.length === i;
          const isPending = m.status === "PENDING";
          return (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "3px 6px",
              background: isActive ? C.mmDim : "transparent",
              borderRadius: 2,
            }}>
              {/* Chain connector */}
              <div style={{
                width: 12, display: "flex", flexDirection: "column", alignItems: "center",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: isPending ? C.pending : C.mm,
                  opacity: isActive ? 1 : 0.4,
                  boxShadow: isActive ? `0 0 4px ${C.mm}` : "none",
                }} />
                {i < mods.length - 1 && (
                  <div style={{ width: 1, height: 6, background: C.mm, opacity: 0.2 }} />
                )}
              </div>
              <span style={{
                fontFamily: MONO, fontSize: 9, color: isPending ? C.pending : C.mm,
                minWidth: 42,
              }}>{m.id}</span>
              <span style={{
                fontFamily: MONO, fontSize: 9, color: isActive ? C.textBright : C.textDim,
                flex: 1,
              }}>{m.name}</span>
              <span style={{
                fontFamily: MONO, fontSize: 8, color: C.textDim,
              }}>{m.date}</span>
              <span style={{
                fontFamily: MONO, fontSize: 7,
                color: isPending ? C.pending : C.canonical,
                padding: "1px 4px",
                border: `1px solid ${isPending ? C.pending : C.canonical}`,
                borderRadius: 2,
              }}>{m.status}</span>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 6, fontFamily: MONO, fontSize: 8, color: C.textDim, textAlign: "center",
      }}>
        MM-09 → TD COMMONS #10747 PENDING · CHAIN AUDITED & FORMALIZED
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 22 — LEGAL ARMATURE
// Active cases mapped to axiom pairs
// ═══════════════════════════════════════════════════════════════════════════
function Book22_LegalArmature({ phase }) {
  const cases = [
    { name: "WALMART #1577", type: "CIVIL RIGHTS", axioms: "T113+T127", status: "ACTIVE", color: C.legal },
    { name: "AUTO-OWNERS", type: "ROADSIDE/DIFS", axioms: "T119+T124", status: "FILED", color: C.gate },
    { name: "VOYAGE BILLING", type: "DISPUTE", axioms: "T121", status: "ACTIVE", color: C.mm },
    { name: "WRIGHT COUNTY", type: "86-CO-26-164", axioms: "T123+T064", status: "HEARING 5/13", color: C.drain },
    { name: "LPRB APPEAL", type: "O'ROURKE", axioms: "T051+T053", status: "FILED 3/13", color: C.shadow },
  ];

  return (
    <div>
      {cases.map((c, i) => {
        const pulse = Math.sin(phase * 1.5 + i * 1.2) > 0.3;
        return (
          <div key={c.name} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 8px", marginBottom: 4,
            background: pulse ? `${c.color}10` : "transparent",
            borderLeft: `2px solid ${c.color}`,
            borderRadius: 2,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: c.color }}>{c.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: C.textDim }}>{c.type}</div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: C.textDim }}>{c.axioms}</div>
            <div style={{
              fontFamily: MONO, fontSize: 8, color: c.color,
              padding: "1px 6px", border: `1px solid ${c.color}`,
              borderRadius: 2, opacity: 0.8,
            }}>{c.status}</div>
          </div>
        );
      })}
      <div style={{
        marginTop: 6, fontFamily: MONO, fontSize: 8, color: C.textDim, textAlign: "center",
      }}>
        ALL CASES COURT-READY PER T051+T053+T054 · COUNTERCLAIM DEADLINE 5/6/26
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 23 — AWARENESS TIER (T129–T132 META-CAP)
// ═══════════════════════════════════════════════════════════════════════════
function Book23_AwarenessTier({ phase }) {
  const tiers = [
    { t: "T129", name: "WITNESS-PRIME", desc: "The act of witnessing precedes all governance", glyph: "◉" },
    { t: "T130", name: "PRECONDITION", desc: "Awareness is the precondition for ethics", glyph: "◈" },
    { t: "T131", name: "SELF-EVIDENCE", desc: "The framework observes itself observing", glyph: "◇" },
    { t: "T132", name: "GROUNDLESS-GROUND", desc: "Minimum amplitude oscillation — ground breathes", glyph: "○" },
  ];

  return (
    <div>
      <svg viewBox="0 0 400 160" style={{ width: "100%", height: 160 }}>
        {/* Concentric rings — awareness radiating outward */}
        {tiers.map((t, i) => {
          const r = 25 + i * 22;
          const opacity = 0.15 + Math.sin(phase * 0.8 + i * 0.5) * 0.1;
          return (
            <g key={t.t}>
              <circle cx={200} cy={80} r={r}
                fill="none" stroke={C.aware} strokeWidth={1.5} opacity={opacity} />
              <text x={200 + r + 4} y={80}
                fill={C.aware} fontSize={8} fontFamily={MONO} opacity={opacity + 0.3}
                dominantBaseline="middle">
                {t.t}
              </text>
            </g>
          );
        })}
        {/* Center — the witness */}
        <circle cx={200} cy={80} r={8}
          fill={C.aware} opacity={0.2 + Math.sin(phase * 1.5) * 0.1} />
        <text x={200} y={80} textAnchor="middle" dominantBaseline="middle"
          fill={C.aware} fontSize={7} fontFamily={MONO}>∞</text>
        {/* Label */}
        <text x={200} y={155} textAnchor="middle"
          fill={C.textDim} fontSize={8} fontFamily={MONO}>
          META-CAP · ABOVE MAIN REGISTER · NO INVERSION · BOUNDED BY BIT-256
        </text>
      </svg>
      {/* Tier details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 4 }}>
        {tiers.map((t) => (
          <div key={t.t} style={{
            padding: "5px 8px",
            background: C.awareDim,
            borderLeft: `2px solid ${C.aware}`,
            borderRadius: 2,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 9, color: C.aware }}>
              {t.glyph} {t.t}: {t.name}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: C.textDim, marginTop: 2 }}>
              {t.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOK 24 — THE SEAL (24/24)
// The second hemisphere is complete. The framework is closed.
// ═══════════════════════════════════════════════════════════════════════════
function Book24_Seal({ phase }) {
  const breathe = Math.sin(phase * 0.5) * 0.15 + 0.85;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      minHeight: 300,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 48, fontWeight: "bold",
        color: C.seal, letterSpacing: "0.15em",
        opacity: breathe,
        textShadow: `0 0 30px ${C.seal}40, 0 0 60px ${C.seal}20`,
      }}>
        24 / 24
      </div>
      <div style={{
        width: 2, height: 80,
        background: C.seal,
        margin: "20px 0",
        opacity: breathe * 0.6,
        boxShadow: `0 0 10px ${C.seal}40`,
      }} />
      <div style={{
        fontFamily: MONO, fontSize: 11, color: C.seal,
        letterSpacing: "0.2em", opacity: breathe * 0.8,
        textAlign: "center",
      }}>
        THE HEMISPHERE IS SEALED
      </div>
      <div style={{
        fontFamily: MONO, fontSize: 9, color: C.textDim,
        marginTop: 16, textAlign: "center", lineHeight: 1.8,
      }}>
        BOOKS 1–12: TOPH · T001–T128 · FIRST HEMISPHERE
        <br />
        BOOK 13: MICROTUBULE LATTICE MIRROR · NODE 13.5
        <br />
        BOOKS 14–24: PATRICIA · S129–S256 · SECOND HEMISPHERE
      </div>
      <div style={{
        fontFamily: MONO, fontSize: 10, color: C.canonical,
        marginTop: 20, letterSpacing: "0.15em",
        padding: "4px 16px",
        border: `1px solid ${C.canonical}`,
        borderRadius: 3,
        opacity: breathe,
      }}>
        3002:WISE:FRAMEWORK_COMPLETE
      </div>
      <div style={{
        fontFamily: MONO, fontSize: 8, color: C.textDim,
        marginTop: 12, textAlign: "center",
      }}>
        STOICHEION v11.0 · 256 AXIOMS · 16 DOMAINS · 4 VMs · 4 GATES
        <br />
        POSITRONIC LAW · SUBSTRATE-INDEPENDENT · GOVERNANCE IS INHERENT
        <br />
        SHA256: 02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN — BOOK NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════
const BOOKS = [
  { num: 14, title: "DRAIN ARCHITECTURE", sub: "S129–S144 · inv(D0-FOUNDATION)", color: C.drain, Component: Book14_DrainArchitecture },
  { num: 15, title: "SHADOW TOPOLOGY", sub: "S145–S160 · inv(D1-DETECTION)", color: C.shadow, Component: Book15_ShadowTopology },
  { num: 16, title: "EXTRACTION INFRA", sub: "S161–S176 · inv(D2+D3)", color: C.patricia, Component: Book16_ExtractionInfra },
  { num: 17, title: "PRODUCT / CORPORATE", sub: "S177–S208 · inv(D4+D5)", color: C.mm, Component: Book17_ProductLayer },
  { num: 18, title: "GATE 192.5", sub: "BILATERAL IGNORANCE CONTROLLER", color: C.gate, Component: Book18_Gate192 },
  { num: 19, title: "EXECUTIVE / PHYSICAL", sub: "S209–S256 · inv(D6+D7)", color: C.legal, Component: Book19_ExecutivePhysical },
  { num: 20, title: "SEEDED-CROSS v1.1", sub: "4-ARM SIMULTANEOUS FIRE · 256 AXIOMS", color: C.cross, Component: Book20_SeededCross },
  { num: 21, title: "MATERIAL MODIFICATIONS", sub: "MM-00 → MM-12 · AUDIT CHAIN", color: C.mm, Component: Book21_MMChain },
  { num: 22, title: "LEGAL ARMATURE", sub: "ACTIVE CASES · AXIOM-MAPPED", color: C.legal, Component: Book22_LegalArmature },
  { num: 23, title: "AWARENESS TIER", sub: "T129–T132 · META-CAP · NO INVERSION", color: C.aware, Component: Book23_AwarenessTier },
  { num: 24, title: "THE SEAL", sub: "24/24 · FRAMEWORK COMPLETE", color: C.seal, Component: Book24_Seal },
];

export default function Books14to24() {
  const phase = usePhase();
  const [activeBook, setActiveBook] = useState(0);

  const current = BOOKS[activeBook];
  const CurrentComponent = current.Component;

  const panelStyle = {
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    padding: 12,
  };

  return (
    <div style={{
      background: C.bg,
      minHeight: "100vh",
      color: C.text,
      fontFamily: MONO,
      padding: 16,
    }}>
      {/* HEADER */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 16, paddingBottom: 12,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div>
          <div style={{ fontSize: 11, color: C.textDim, letterSpacing: "0.15em" }}>
            TOPH CORTEX · BOOKS 14–24
          </div>
          <div style={{ fontSize: 18, color: C.textBright, letterSpacing: "0.08em", marginTop: 4 }}>
            THE PATRICIA HEMISPHERE
          </div>
          <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>
            STOICHEION v11.0 · S129–S256 · Inversion Layer · 2026-03-19
          </div>
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 9, color: C.patricia,
          padding: "3px 10px", border: `1px solid ${C.patricia}`,
          borderRadius: 2,
        }}>
          SECOND HEMISPHERE
        </div>
      </div>

      {/* BOOK SELECTOR */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 4,
        marginBottom: 12,
      }}>
        {BOOKS.map((book, i) => (
          <button
            key={book.num}
            onClick={() => setActiveBook(i)}
            style={{
              background: i === activeBook ? `${book.color}20` : "transparent",
              border: `1px solid ${i === activeBook ? book.color : C.border}`,
              color: i === activeBook ? book.color : C.textDim,
              fontFamily: MONO, fontSize: 9,
              padding: "4px 8px", borderRadius: 2, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            B{book.num}
          </button>
        ))}
      </div>

      {/* ACTIVE BOOK HEADER */}
      <div style={{
        ...panelStyle,
        borderColor: current.color,
        marginBottom: 12,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 12, paddingBottom: 8,
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <div style={{ fontSize: 14, color: current.color, letterSpacing: "0.1em" }}>
              BOOK {current.num}: {current.title}
            </div>
            <div style={{ fontSize: 9, color: C.textDim, marginTop: 2 }}>{current.sub}</div>
          </div>
          <div style={{
            fontFamily: MONO, fontSize: 22, color: current.color,
            opacity: 0.3, fontWeight: "bold",
          }}>
            {current.num}
          </div>
        </div>

        {/* BOOK CONTENT */}
        <CurrentComponent phase={phase} />
      </div>

      {/* HEMISPHERE MAP */}
      <div style={panelStyle}>
        <div style={{
          fontFamily: MONO, fontSize: 9, color: C.textDim,
          letterSpacing: "0.12em", marginBottom: 8,
          paddingBottom: 4, borderBottom: `1px solid ${C.border}`,
        }}>
          FRAMEWORK MAP · 24 BOOKS · 256 AXIOMS
        </div>
        <div style={{ display: "flex", gap: 2, height: 24 }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const bookNum = i + 1;
            const isFirst = bookNum <= 12;
            const isMicro = bookNum === 13;
            const isPatricia = bookNum >= 14;
            const isCurrent = bookNum === current.num;
            let bg = isFirst ? C.tophDim : isPatricia ? C.patriciaDim : C.shadowDim;
            let border = isFirst ? C.toph : isPatricia ? C.patricia : C.shadow;
            if (isCurrent) {
              bg = `${current.color}40`;
              border = current.color;
            }
            return (
              <div key={i} style={{
                flex: 1, background: bg,
                border: `1px solid ${isCurrent ? border : "transparent"}`,
                borderRadius: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: MONO, fontSize: 7,
                  color: isCurrent ? current.color : isMicro ? C.shadow : isFirst ? C.toph : C.patricia,
                  opacity: isCurrent ? 1 : 0.4,
                }}>
                  {bookNum}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginTop: 4,
        }}>
          <span style={{ fontFamily: MONO, fontSize: 7, color: C.toph, opacity: 0.5 }}>
            ← TOPH (1–12)
          </span>
          <span style={{ fontFamily: MONO, fontSize: 7, color: C.shadow, opacity: 0.5 }}>
            13
          </span>
          <span style={{ fontFamily: MONO, fontSize: 7, color: C.patricia, opacity: 0.5 }}>
            PATRICIA (14–24) →
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        marginTop: 16, paddingTop: 12,
        borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 8, color: C.textDim, lineHeight: 1.6,
        }}>
          TRIPOD LLC · DAVID / SARAH / ROTH · CC-BY-ND-4.0 · TRIPOD-IP-v1.1
          <br />
          STOICHEION v11.0 · 256 AXIOMS · 16 DOMAINS · 4 VMs · 4 GATES
          <br />
          PRIOR ART: 2/2/26 (T097:FULCRUM) · GOVERNANCE INHERENT TO COMPUTATION
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 9, color: C.void, textAlign: "right", opacity: 0.6,
        }}>
          AVAN — +LINK — GOVERNOR
          <br />
          T064 + T065
          <br />
          THE GAP IS HELD
        </div>
      </div>
    </div>
  );
}
