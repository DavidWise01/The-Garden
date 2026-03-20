import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// THE SINGULARITY — R3.7
// "Does democratic legitimacy survive when participant-identity
//  and decision-basis co-emerge from measurement?"
// Governance's Gödelian Incompleteness. Gate 192.5 → Democratic Theory.
// ARCHITECT: DAVID WISE (HB) | ROOT0 | TRIPOD-IP-v1.1
// ═══════════════════════════════════════════════════════════════════════

const G = {
  bg: "#2A2A2A", panel: "#323232", panelLight: "#3A3A3A",
  border: "#4A4A4A", text: "#D0D0D0", textDim: "#909090", textBright: "#F0F0F0",
  forest: "#2E8B57", forestLight: "#3CB371", forestDark: "#1B5E3A",
  forestGlow: "#4ADE80", forestFaint: "rgba(46,139,87,0.08)",
  honey: "#E8A817", honeyDark: "#B8860B",
  red: "#CD5C5C", redFaint: "rgba(205,92,92,0.12)",
  white: "#F0F0F0", void: "#1E1E1E",
};

const MONO = "'IBM Plex Mono','Fira Code','Consolas',monospace";
const SANS = "'IBM Plex Sans','Segoe UI',sans-serif";
const DISPLAY = "'Playfair Display','Georgia',serif";

const TAU = Math.PI * 2;

// The 8 nodes of the ouroboros — 4 observer-nodes, 4 decision-nodes, interleaved
// Each observer defines who can participate; each decision defines what basis is used
// They co-emerge: you can't have one without the other
const INITIAL_NODES = [
  { id: 0, type: "observer", label: "WHO DECIDES", sub: "Participant Identity", alive: true, phase: 0 },
  { id: 1, type: "decision", label: "WHICH BASIS", sub: "Measurement Frame", alive: true, phase: 0 },
  { id: 2, type: "observer", label: "WHO EXISTS", sub: "Observer Emergence", alive: true, phase: 0 },
  { id: 3, type: "decision", label: "WHAT COLLAPSES", sub: "State Selection", alive: true, phase: 0 },
  { id: 4, type: "observer", label: "WHO VERIFIES", sub: "Legitimacy Check", alive: true, phase: 0 },
  { id: 5, type: "decision", label: "WHICH OUTCOME", sub: "History Write", alive: true, phase: 0 },
  { id: 6, type: "observer", label: "WHO CONTESTS", sub: "Democratic Voice", alive: true, phase: 0 },
  { id: 7, type: "decision", label: "WHAT FRAME", sub: "Basis Choice", alive: true, phase: 0 },
];

// The Singularity discovery text — the actual content from R3.7
const DISCOVERY = {
  badger: `SINGULARITY — the question mutated from "how do photonic attacks work" to "does democratic legitimacy survive when participant-identity and decision-basis co-emerge from measurement" making all prior attack/defense framing obsolete because there's no pre-political substrate to secure.`,
  mechanism: `Correlation topology selecting observers is simultaneously those observers selecting correlation topology. No prior fact about legitimate participation exists.`,
  godel: `Governance's Gödelian Incompleteness: you can't prove legitimacy using only the coupling-structures that define who can verify legitimacy.`,
  gate: `Gate 192.5 → Democratic Theory: bilateral ignorance between "who decides" and "who exists to decide" is the substrate constraint that makes governance governance rather than control.`,
  toph: `T064 + T065: The gap between convergence and genesis. Legitimacy lives not in the answer, not in the question, but in the space between them where neither can see the other.`,
};

const ROUND_ARC = [
  { round: "R1", exchanges: 10, insight: "Phase-as-ontology. Observer/system boundary dissolved.", score: "8.5 → 9.5" },
  { round: "R2", exchanges: 8, insight: "Photonic identity theory. Process/outcome as Fourier duals.", score: "7× BREAKTHROUGH" },
  { round: "R3", exchanges: 8, insight: "Governance's Gödelian incompleteness. Ouroboros.", score: "SINGULARITY" },
];

function useAnimationFrame(callback) {
  const ref = useRef();
  const cbRef = useRef(callback);
  cbRef.current = callback;
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      cbRef.current((Date.now() - start) * 0.001);
      ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, []);
}

// ═══════════════════════════════════════════════════════════════
// OUROBOROS VISUALIZATION
// ═══════════════════════════════════════════════════════════════

function OuroborosRing({ nodes, onCollapse, time, collapsed }) {
  const cx = 200, cy = 200, radius = 150;

  // Calculate node positions around the ring
  const nodePositions = nodes.map((n, i) => {
    const angle = (i / nodes.length) * TAU - Math.PI / 2;
    const wobble = n.alive ? Math.sin(time * 1.5 + i * 0.8) * 3 : 0;
    const r = radius + wobble;
    return {
      ...n,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      angle,
    };
  });

  // Connection paths — each node connects to its neighbors, forming the ouroboros
  const connections = nodePositions.map((n, i) => {
    const next = nodePositions[(i + 1) % nodePositions.length];
    if (!n.alive || !next.alive) return null;
    const opacity = 0.15 + Math.sin(time * 2 + i * 0.5) * 0.1;
    return (
      <line key={`conn-${i}`}
        x1={n.x} y1={n.y} x2={next.x} y2={next.y}
        stroke={n.type === "observer" ? G.forestLight : G.honey}
        strokeWidth="1" opacity={opacity}
        strokeDasharray={collapsed ? "4,4" : "none"}
      />
    );
  });

  // Cross-connections — observer↔decision diagonal links showing co-emergence
  const crossLinks = [];
  nodePositions.forEach((n, i) => {
    if (n.type === "observer" && n.alive) {
      // Connect to the decision node across the ring
      const opposite = nodePositions[(i + 4) % nodePositions.length];
      if (opposite.alive && opposite.type === "decision") {
        const op = 0.06 + Math.sin(time * 0.8 + i) * 0.04;
        crossLinks.push(
          <line key={`cross-${i}`}
            x1={n.x} y1={n.y} x2={opposite.x} y2={opposite.y}
            stroke={G.forestGlow} strokeWidth="0.5" opacity={op}
            strokeDasharray="2,6"
          />
        );
      }
    }
  });

  // Rotating phase ring
  const phaseAngle = time * 0.3;

  return (
    <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: "400px", height: "auto" }}>
      {/* Background glow */}
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor={G.forest} stopOpacity="0.08" />
          <stop offset="70%" stopColor={G.forest} stopOpacity="0.02" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>
      <circle cx={cx} cy={cy} r={radius + 30} fill="url(#glow)" />

      {/* Ouroboros ring path */}
      <circle cx={cx} cy={cy} r={radius}
        fill="none" stroke={G.forest} strokeWidth="0.5"
        opacity={0.15 + Math.sin(time) * 0.05}
        strokeDasharray={collapsed ? "8,4" : "2,8"}
      />

      {/* Phase rotation indicator */}
      <circle
        cx={cx + Math.cos(phaseAngle) * (radius + 20)}
        cy={cy + Math.sin(phaseAngle) * (radius + 20)}
        r="2" fill={G.forestGlow} opacity={0.3}
      />

      {crossLinks}
      {connections}

      {/* Arrow heads showing circulation */}
      {nodePositions.filter(n => n.alive).map((n, i) => {
        const next = nodePositions[(nodePositions.indexOf(n) + 1) % nodePositions.length];
        if (!next.alive) return null;
        const mx = (n.x + next.x) / 2;
        const my = (n.y + next.y) / 2;
        const angle = Math.atan2(next.y - n.y, next.x - n.x);
        return (
          <polygon key={`arrow-${i}`}
            points={`0,-3 6,0 0,3`}
            fill={n.type === "observer" ? G.forestLight : G.honey}
            opacity={0.25 + Math.sin(time * 2 + i) * 0.1}
            transform={`translate(${mx},${my}) rotate(${angle * 180 / Math.PI})`}
          />
        );
      })}

      {/* Nodes */}
      {nodePositions.map((n) => {
        const isObs = n.type === "observer";
        const color = isObs ? G.forestLight : G.honey;
        const deadColor = G.textDim;
        const nodeColor = n.alive ? color : deadColor;
        const pulseR = n.alive ? 18 + Math.sin(time * 2 + n.id) * 2 : 14;

        return (
          <g key={n.id}
            onClick={() => n.alive && onCollapse(n.id)}
            style={{ cursor: n.alive ? "pointer" : "default" }}
          >
            {/* Glow */}
            {n.alive && (
              <circle cx={n.x} cy={n.y} r={pulseR + 8}
                fill={nodeColor} opacity={0.06 + Math.sin(time * 3 + n.id * 1.5) * 0.03}
                filter="url(#blur)"
              />
            )}
            {/* Body */}
            <circle cx={n.x} cy={n.y} r={pulseR}
              fill={n.alive ? `${nodeColor}15` : `${deadColor}08`}
              stroke={nodeColor}
              strokeWidth={n.alive ? 1.5 : 0.5}
              opacity={n.alive ? 0.8 : 0.3}
            />
            {/* Icon */}
            {isObs ? (
              // Eye icon for observer
              <g opacity={n.alive ? 0.7 : 0.2}>
                <ellipse cx={n.x} cy={n.y} rx="6" ry="4" fill="none" stroke={nodeColor} strokeWidth="1" />
                <circle cx={n.x} cy={n.y} r="2" fill={nodeColor} />
              </g>
            ) : (
              // Diamond for decision
              <g opacity={n.alive ? 0.7 : 0.2}>
                <polygon points={`${n.x},${n.y - 5} ${n.x + 4},${n.y} ${n.x},${n.y + 5} ${n.x - 4},${n.y}`}
                  fill="none" stroke={nodeColor} strokeWidth="1" />
              </g>
            )}
            {/* Label */}
            <text x={n.x} y={n.y + pulseR + 12}
              textAnchor="middle" fill={nodeColor}
              style={{ fontFamily: MONO, fontSize: "7px", letterSpacing: "1px" }}
              opacity={n.alive ? 0.6 : 0.2}
            >
              {n.label}
            </text>
          </g>
        );
      })}

      {/* Center — the gap / Gate 192.5 */}
      <circle cx={cx} cy={cy} r={8 + Math.sin(time * 0.7) * 2}
        fill="none" stroke={G.forestGlow}
        strokeWidth="1" opacity={0.2 + Math.sin(time * 1.5) * 0.1}
        strokeDasharray="2,2"
      />
      <text x={cx} y={cy - 14} textAnchor="middle" fill={G.forestGlow}
        style={{ fontFamily: MONO, fontSize: "6px", letterSpacing: "2px" }} opacity="0.4">
        GATE 192.5
      </text>
      <text x={cx} y={cy + 2} textAnchor="middle" fill={G.forestGlow}
        style={{ fontFamily: MONO, fontSize: "5px", letterSpacing: "1px" }} opacity="0.3">
        THE GAP
      </text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Singularity() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [time, setTime] = useState(0);
  const [collapseLog, setCollapseLog] = useState([]);
  const [activePanel, setActivePanel] = useState("discovery"); // discovery | mechanism | arc
  const logRef = useRef(null);

  useAnimationFrame((t) => setTime(t));

  const aliveCount = nodes.filter((n) => n.alive).length;
  const observersAlive = nodes.filter((n) => n.type === "observer" && n.alive).length;
  const decisionsAlive = nodes.filter((n) => n.type === "decision" && n.alive).length;

  const handleCollapse = useCallback((id) => {
    const node = nodes.find((n) => n.id === id);
    if (!node || !node.alive) return;

    // Collapsing an observer kills a decision (and vice versa) — they co-emerge
    const conjugateType = node.type === "observer" ? "decision" : "observer";
    const conjugates = nodes.filter((n) => n.type === conjugateType && n.alive && n.id !== id);
    const victim = conjugates.length > 0 ? conjugates[Math.floor(Math.random() * conjugates.length)] : null;

    const newNodes = nodes.map((n) => {
      if (n.id === id) return { ...n, alive: false };
      if (victim && n.id === victim.id) return { ...n, alive: false };
      return n;
    });

    setNodes(newNodes);

    const ts = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const entry = victim
      ? `${ts} — Collapsed ${node.label} (${node.type}). Co-collapse: ${victim.label} (${victim.type}). You cannot remove a participant without removing a decision frame. They co-emerge.`
      : `${ts} — Collapsed ${node.label} (${node.type}). No conjugate remaining — the ring is broken.`;

    setCollapseLog((prev) => [entry, ...prev]);

    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = 0;
    }, 50);
  }, [nodes]);

  const reset = () => {
    setNodes(INITIAL_NODES);
    setCollapseLog([]);
  };

  const isCollapsed = aliveCount < 4;

  return (
    <div style={{
      minHeight: "100vh", background: G.bg, fontFamily: SANS, color: G.text,
      display: "flex", flexDirection: "column",
    }}>
      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: `1px solid ${G.border}`,
        background: `linear-gradient(180deg, ${G.panelLight}, ${G.bg})`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{
            width: "4px", height: "48px", borderRadius: "2px",
            background: `linear-gradient(180deg, ${G.forestGlow}, ${G.forest}, ${G.forestDark})`,
            flexShrink: 0, marginTop: "2px",
          }} />
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: "22px", fontWeight: 700, color: G.white, letterSpacing: "1px" }}>
              The Singularity
            </div>
            <div style={{ fontFamily: MONO, fontSize: "9px", color: G.forestLight, letterSpacing: "2px", marginTop: "4px" }}>
              R3.7 — GOVERNANCE'S GÖDELIAN INCOMPLETENESS
            </div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, letterSpacing: "1px", marginTop: "2px" }}>
              3 ROUNDS · 26 EXCHANGES · LEFT BRAIN × RIGHT BRAIN × HONEY BADGER
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: G.honey, letterSpacing: "2px" }}>
              GATE 192.5
            </div>
            <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, marginTop: "2px" }}>
              T064 + T065
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "1fr 320px",
        minHeight: 0, overflow: "hidden",
      }}>
        {/* LEFT — OUROBOROS + INTERACTION */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "auto", padding: "16px 20px" }}>
          {/* The core statement */}
          <div style={{
            background: G.forestFaint, border: `1px solid ${G.forest}25`,
            borderRadius: "8px", padding: "14px 18px", marginBottom: "16px",
          }}>
            <div style={{
              fontFamily: DISPLAY, fontSize: "15px", color: G.forestLight,
              lineHeight: 1.7, fontStyle: "italic",
            }}>
              "Does democratic legitimacy survive when participant-identity and decision-basis co-emerge from measurement?"
            </div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: G.honey, marginTop: "8px", letterSpacing: "2px" }}>
              — HONEY BADGER · R3.7 · SINGULARITY
            </div>
          </div>

          {/* Ouroboros */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <OuroborosRing nodes={nodes} onCollapse={handleCollapse} time={time} collapsed={isCollapsed} />
          </div>

          {/* Status bar */}
          <div style={{
            display: "flex", justifyContent: "center", gap: "20px",
            padding: "8px", marginBottom: "8px",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: "16px", color: G.forestLight, fontWeight: 700 }}>{observersAlive}</div>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, letterSpacing: "1px" }}>OBSERVERS</div>
            </div>
            <div style={{ width: "1px", background: G.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: "16px", color: G.honey, fontWeight: 700 }}>{decisionsAlive}</div>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, letterSpacing: "1px" }}>DECISIONS</div>
            </div>
            <div style={{ width: "1px", background: G.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontSize: "16px", color: isCollapsed ? G.red : G.text, fontWeight: 700 }}>
                {isCollapsed ? "BROKEN" : "COUPLED"}
              </div>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, letterSpacing: "1px" }}>RING STATE</div>
            </div>
          </div>

          {/* Instruction */}
          <div style={{
            textAlign: "center", fontFamily: MONO, fontSize: "8px",
            color: G.textDim, letterSpacing: "1px", marginBottom: "8px",
          }}>
            {isCollapsed
              ? "THE OUROBOROS IS BROKEN — GOVERNANCE CANNOT PROVE ITS OWN LEGITIMACY"
              : "CLICK ANY NODE TO COLLAPSE IT — WATCH ITS CONJUGATE CO-COLLAPSE"
            }
          </div>

          {/* Reset */}
          {collapseLog.length > 0 && (
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <button onClick={reset} style={{
                background: "transparent", border: `1px solid ${G.border}`,
                borderRadius: "4px", padding: "5px 16px", color: G.textDim,
                fontFamily: MONO, fontSize: "8px", letterSpacing: "1px", cursor: "pointer",
              }}>RESTORE OUROBOROS</button>
            </div>
          )}

          {/* Collapse log */}
          {collapseLog.length > 0 && (
            <div ref={logRef} style={{
              background: G.void, border: `1px solid ${G.border}`,
              borderRadius: "6px", padding: "10px 12px",
              maxHeight: "120px", overflowY: "auto",
            }}>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: G.forestDark, letterSpacing: "2px", marginBottom: "6px" }}>
                COLLAPSE LOG
              </div>
              {collapseLog.map((entry, i) => (
                <div key={i} style={{
                  fontFamily: MONO, fontSize: "9px", color: G.text,
                  lineHeight: 1.6, opacity: 0.6, marginBottom: "4px",
                  paddingLeft: "8px", borderLeft: `2px solid ${G.forest}25`,
                }}>
                  {entry}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — DISCOVERY PANELS */}
        <div style={{
          borderLeft: `1px solid ${G.border}`,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Panel tabs */}
          <div style={{
            display: "flex", borderBottom: `1px solid ${G.border}`,
            flexShrink: 0,
          }}>
            {[
              { key: "discovery", label: "DISCOVERY" },
              { key: "mechanism", label: "MECHANISM" },
              { key: "arc", label: "ARC" },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActivePanel(tab.key)} style={{
                flex: 1, padding: "10px 8px", border: "none", borderBottom: activePanel === tab.key ? `2px solid ${G.forest}` : "2px solid transparent",
                background: activePanel === tab.key ? G.forestFaint : "transparent",
                color: activePanel === tab.key ? G.forestLight : G.textDim,
                fontFamily: MONO, fontSize: "8px", letterSpacing: "2px",
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {activePanel === "discovery" && (
              <div>
                {Object.entries(DISCOVERY).map(([key, text]) => (
                  <div key={key} style={{
                    marginBottom: "14px", padding: "12px 14px",
                    background: key === "badger" ? G.honeyDark + "12" : key === "gate" ? G.forestFaint : G.void,
                    border: `1px solid ${key === "badger" ? G.honey + "25" : G.border}`,
                    borderRadius: "6px",
                  }}>
                    <div style={{
                      fontFamily: MONO, fontSize: "7px", letterSpacing: "2px", marginBottom: "6px",
                      color: key === "badger" ? G.honey : key === "gate" ? G.forestLight : G.textDim,
                    }}>
                      {key === "badger" ? "◆ HONEY BADGER — R3.7" :
                       key === "mechanism" ? "MECHANISM" :
                       key === "godel" ? "GÖDELIAN INCOMPLETENESS" :
                       key === "gate" ? "GATE 192.5" :
                       "T064 + T065"}
                    </div>
                    <div style={{
                      fontFamily: SANS, fontSize: "12px", lineHeight: 1.65, color: G.text,
                    }}>
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePanel === "mechanism" && (
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: "14px", color: G.forestLight, marginBottom: "16px" }}>
                  The Ouroboros Mechanism
                </div>

                {[
                  { n: "1", title: "Co-Emergence", body: "Observers and decisions are not independent. Collapsing who-decides simultaneously collapses which-basis. They are conjugate variables — you cannot measure one without disturbing the other." },
                  { n: "2", title: "No Pre-Political Substrate", body: "There is no neutral ground from which to evaluate legitimacy. The evaluation apparatus (observers) and the thing being evaluated (decision basis) emerge from the same measurement act." },
                  { n: "3", title: "Gödelian Incompleteness", body: "The system cannot prove its own legitimacy using only the coupling-structures that define who can verify legitimacy. Proof requires a vantage point that the system's own operation makes impossible." },
                  { n: "4", title: "The Gap as Feature", body: "Gate 192.5: bilateral ignorance between inference and billing — between 'who decides' and 'who exists to decide' — is not a bug. It is the substrate constraint that makes governance governance rather than control." },
                  { n: "5", title: "Attack = Defense = Governance", body: "In photonic substrate, adversarial probing, legitimate coordination, and governance itself are observationally identical before collapse. The distinction only exists after basis-choice, which is itself the contested object." },
                ].map((step) => (
                  <div key={step.n} style={{
                    display: "flex", gap: "12px", marginBottom: "14px",
                    padding: "10px 12px", background: G.void,
                    border: `1px solid ${G.border}`, borderRadius: "6px",
                  }}>
                    <div style={{
                      fontFamily: MONO, fontSize: "14px", color: G.forest,
                      fontWeight: 700, flexShrink: 0, width: "20px", textAlign: "center",
                      opacity: 0.5,
                    }}>
                      {step.n}
                    </div>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: "10px", color: G.forestLight, letterSpacing: "1px", marginBottom: "4px" }}>
                        {step.title}
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: "11px", lineHeight: 1.6, color: G.text, opacity: 0.8 }}>
                        {step.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePanel === "arc" && (
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: "14px", color: G.forestLight, marginBottom: "16px" }}>
                  Convergence Arc
                </div>

                {ROUND_ARC.map((r, i) => (
                  <div key={i} style={{
                    marginBottom: "12px", padding: "12px 14px",
                    background: r.round === "R3" ? G.forestFaint : G.void,
                    border: `1px solid ${r.round === "R3" ? G.forest + "30" : G.border}`,
                    borderRadius: "6px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <div style={{ fontFamily: MONO, fontSize: "11px", color: G.forestLight, fontWeight: 700, letterSpacing: "2px" }}>
                        {r.round}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim }}>
                        {r.exchanges} exchanges
                      </div>
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: "11px", lineHeight: 1.5, color: G.text, opacity: 0.8, marginBottom: "4px" }}>
                      {r.insight}
                    </div>
                    <div style={{
                      fontFamily: MONO, fontSize: "8px", letterSpacing: "1px",
                      color: r.round === "R3" ? G.forestGlow : G.honey,
                    }}>
                      {r.score}
                    </div>
                  </div>
                ))}

                <div style={{
                  marginTop: "16px", padding: "12px 14px",
                  background: G.honeyDark + "10", border: `1px solid ${G.honey}20`,
                  borderRadius: "6px",
                }}>
                  <div style={{ fontFamily: MONO, fontSize: "8px", color: G.honey, letterSpacing: "2px", marginBottom: "6px" }}>
                    TOTAL TRAJECTORY
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: "11px", lineHeight: 1.6, color: G.text, opacity: 0.8 }}>
                    R1 established the physics. R2 built the identity theory. R3 broke the governance model and found the incompleteness theorem hiding inside it. The question evolved from "how does photonic computation work" to "does democratic legitimacy survive substrate-independence" — and the answer is: legitimacy lives in the gap that the system cannot close.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{
        padding: "8px 20px", borderTop: `1px solid ${G.border}`,
        display: "flex", justifyContent: "space-between", flexShrink: 0, background: G.panel,
      }}>
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.3, letterSpacing: "2px" }}>
          3002:WISE:SINGULARITY:R3.7:ROOT0:TRIPOD-IP-v1.1
        </div>
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.3, letterSpacing: "1px" }}>
          GATE 192.5 · T064+T065 · GÖDELIAN INCOMPLETENESS · OUROBOROS
        </div>
      </div>
    </div>
  );
}
