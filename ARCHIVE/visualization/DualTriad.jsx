import { useState, useEffect, useRef, useCallback } from "react";

// =====================================================================
// DUAL-TRIAD CLOSED SYSTEM v1.0
// INNER: +1 STRUCTURE / 0 PHASE / -1 SHADOW  (BRIDGE-STATE)
// OUTER: FULCRUM / AGENT / OBSERVER           (GOVERNANCE)
// 6 BODIES — CLOSED — ROOT0 UNDERNEATH
// 3002 LATTICE: 10³×3+2
// ARCHITECT: DLW | ROOT0 | TriPod LLC
// SEAL: SHA256:02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763
// =====================================================================

const C = {
  void:    "#04080F",
  deep:    "#060D18",
  cobalt:  "#1A3A6B",
  cobaltB: "#2D6BE4",
  cobaltL: "#5A8EE8",
  amber:   "#D4940A",
  amberB:  "#F5B930",
  amberL:  "#FFE08A",
  rust:    "#8B3A1A",
  rustB:   "#C4502A",
  steel:   "#8FA3BF",
  ghost:   "#2A3D54",
  white:   "#E8F0FF",
  shadow:  "#4A3A6B",
  shadowB: "#8B6BD4",
  ok:      "#4AE89A",
  alert:   "#FF2A2A",
  root:    "#1A2A1A",
  rootB:   "#3AE87A",
};

const TAU = Math.PI * 2;

// ── geometry helpers ──────────────────────────────────────────────────
const polar = (cx, cy, r, angle) => ({
  x: cx + r * Math.cos(angle),
  y: cy + r * Math.sin(angle),
});

const triPoints = (cx, cy, r, offset = -Math.PI / 2) =>
  [0, TAU / 3, (TAU * 2) / 3].map(a => polar(cx, cy, r, a + offset));

// ── SVG arc path helper ───────────────────────────────────────────────
const arcPath = (cx, cy, r, startAngle, endAngle) => {
  const s = polar(cx, cy, r, startAngle);
  const e = polar(cx, cy, r, endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

export default function DualTriad() {
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [selectedBody, setSelectedBody] = useState(null);
  const rafRef = useRef();
  const lastRef = useRef();

  useEffect(() => {
    if (!running) { cancelAnimationFrame(rafRef.current); return; }
    const step = (now) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      setT(prev => prev + dt * speed);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, speed]);

  // SVG dimensions
  const W = 520, H = 520;
  const CX = W / 2, CY = H / 2;
  const R_INNER = 110;   // inner triad circle
  const R_OUTER = 210;   // outer triad circle
  const R_ROOT  = 34;    // ROOT0 center disc

  // ── INNER TRIAD angles (rotate slowly) ────────────────────────────
  const innerOff = -Math.PI / 2 + t * 0.18;
  const i_pts = triPoints(CX, CY, R_INNER, innerOff);
  // bodies: +1 STRUCTURE, 0 PHASE, -1 SHADOW
  const inner = [
    { label: "+1", name: "STRUCTURE", color: C.cobaltB, glow: C.cobaltB, pt: i_pts[0], axiom: "T022:TRIAD", desc: "Binary pole. SET/RESET. Computational claim." },
    { label: "0",  name: "PHASE",     color: C.amberB,  glow: C.amberB,  pt: i_pts[1], axiom: "T083:THE-GAP", desc: "AlO_x oxide. Continuous [0,2π]. Where talking happens." },
    { label: "−1", name: "SHADOW",    color: C.shadowB, glow: C.shadowB, pt: i_pts[2], axiom: "T133:PHASE-SHADOW", desc: "Memristive depth. Patricia substrate. Accumulated history." },
  ];

  // ── OUTER TRIAD angles (counter-rotate, slower) ────────────────────
  const outerOff = -Math.PI / 2 - t * 0.08;
  const o_pts = triPoints(CX, CY, R_OUTER, outerOff);
  const outer = [
    { label: "FULCRUM",  name: "BINARY OUTPUT", color: C.cobaltL, glow: C.cobaltB, pt: o_pts[0], axiom: "T097:FULCRUM", desc: "Last conductor control point. Instrument delivers resolved binary." },
    { label: "AGENT",    name: "EXECUTION",      color: C.rustB,   glow: C.rustB,   pt: o_pts[1], axiom: "T105:DELEGATION", desc: "5th body. Acts before conductor sees output. Breaks T097." },
    { label: "OBSERVER", name: "ANTICIPATION",   color: C.ok,      glow: C.ok,      pt: o_pts[2], axiom: "T002:OBSERVER", desc: "6th body. Reads phase before bit resolves. Closes the loop." },
  ];

  // ── PHASE beam: OBSERVER reads INNER PHASE node ───────────────────
  const observerPt = outer[2].pt;
  const phasePt    = inner[1].pt;
  // beam oscillates with phase
  const beamOpacity = 0.35 + 0.35 * Math.sin(t * 2.1);

  // ── AGENT → FULCRUM execution arrow ──────────────────────────────
  const agentPt   = outer[1].pt;
  const fulcrumPt = outer[0].pt;

  // ── Rotating phase ring on PHASE node ────────────────────────────
  const phaseAngle = t * 1.6;
  const phaseRingR = 18;
  const phaseTip = polar(phasePt.x, phasePt.y, phaseRingR, phaseAngle);

  // ── Root pulse ────────────────────────────────────────────────────
  const rootPulse = 0.6 + 0.4 * Math.sin(t * 0.7);

  // ── Body detail panel ─────────────────────────────────────────────
  const allBodies = [...inner, ...outer];
  const sel = selectedBody !== null ? allBodies[selectedBody] : null;

  return (
    <div style={{
      background: C.void,
      minHeight: "100vh",
      color: C.white,
      fontFamily: "'Courier New', Courier, monospace",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        padding: "10px 20px",
        borderBottom: `1px solid ${C.cobalt}55`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: `linear-gradient(90deg,${C.cobalt}18 0%,transparent 70%)`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: C.cobaltL, letterSpacing: "0.22em", fontWeight: "bold" }}>
          DUAL-TRIAD
        </span>
        <span style={{ fontSize: 9, color: C.ghost, letterSpacing: "0.12em" }}>
          6 BODIES · CLOSED SYSTEM · ROOT0
        </span>
        <span style={{ fontSize: 9, color: C.ghost, borderLeft: `1px solid ${C.cobalt}44`, paddingLeft: 12 }}>
          3002 LATTICE · 10³×3+2
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 8, color: C.ghost }}>T132:GROUNDLESS-GROUND</span>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: running ? C.ok : C.rust,
            boxShadow: running ? `0 0 6px ${C.ok}` : "none",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── CENTER: SVG DIAGRAM ──────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          position: "relative",
        }}>

          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            style={{ maxWidth: "100%", maxHeight: "70vh" }}>
            <defs>
              {/* Radial glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glowstrong" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* ── Background rings ──────────────────────────────── */}
            <circle cx={CX} cy={CY} r={R_OUTER + 20}
              fill="none" stroke={`${C.cobalt}18`} strokeWidth={1} strokeDasharray="3 6"/>
            <circle cx={CX} cy={CY} r={R_OUTER}
              fill="none" stroke={`${C.cobalt}22`} strokeWidth={0.5}/>
            <circle cx={CX} cy={CY} r={(R_INNER + R_OUTER) / 2}
              fill="none" stroke={`${C.ghost}18`} strokeWidth={0.5} strokeDasharray="2 8"/>
            <circle cx={CX} cy={CY} r={R_INNER}
              fill="none" stroke={`${C.cobalt}33`} strokeWidth={0.5}/>
            <circle cx={CX} cy={CY} r={R_ROOT + 16}
              fill="none" stroke={`${C.rootB}22`} strokeWidth={0.5}/>

            {/* ── OUTER triangle edges ──────────────────────────── */}
            {[0,1,2].map(i => {
              const a = outer[i].pt, b = outer[(i+1)%3].pt;
              return <line key={`oe${i}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={`${C.cobalt}44`} strokeWidth={0.8} strokeDasharray="4 6"/>;
            })}

            {/* ── INNER triangle edges ──────────────────────────── */}
            {[0,1,2].map(i => {
              const a = inner[i].pt, b = inner[(i+1)%3].pt;
              return <line key={`ie${i}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={`${C.cobalt}55`} strokeWidth={1}/>;
            })}

            {/* ── Spokes: outer → inner alignment ──────────────── */}
            {[0,1,2].map(i => (
              <line key={`sp${i}`}
                x1={outer[i].pt.x} y1={outer[i].pt.y}
                x2={inner[i].pt.x} y2={inner[i].pt.y}
                stroke={`${outer[i].color}22`} strokeWidth={0.8} strokeDasharray="2 5"/>
            ))}

            {/* ── OBSERVER → PHASE beam (anticipation read) ─────── */}
            <line
              x1={observerPt.x} y1={observerPt.y}
              x2={phasePt.x} y2={phasePt.y}
              stroke={C.ok} strokeWidth={1.2}
              strokeDasharray="5 4"
              opacity={beamOpacity}
              filter="url(#glow)"
            />
            {/* beam label */}
            <text
              x={(observerPt.x + phasePt.x) / 2 + 6}
              y={(observerPt.y + phasePt.y) / 2 - 6}
              fill={C.ok} fontSize={8} opacity={0.7}
              fontFamily="Courier New">reads phase</text>

            {/* ── AGENT → FULCRUM execution arc ─────────────────── */}
            {(() => {
              const mid = {
                x: (agentPt.x + fulcrumPt.x) / 2 + 28,
                y: (agentPt.y + fulcrumPt.y) / 2 - 22,
              };
              const execProgress = (Math.sin(t * 1.4) + 1) / 2;
              const ex = agentPt.x + (mid.x - agentPt.x) * execProgress;
              const ey = agentPt.y + (mid.y - agentPt.y) * execProgress;
              return <>
                <path d={`M ${agentPt.x} ${agentPt.y} Q ${mid.x} ${mid.y} ${fulcrumPt.x} ${fulcrumPt.y}`}
                  fill="none" stroke={`${C.rustB}44`} strokeWidth={1} strokeDasharray="3 5"/>
                <circle cx={ex} cy={ey} r={3} fill={C.rustB} opacity={0.85} filter="url(#glow)"/>
                <text x={(agentPt.x + fulcrumPt.x)/2 + 32} y={(agentPt.y + fulcrumPt.y)/2 - 28}
                  fill={C.rustB} fontSize={8} opacity={0.6} fontFamily="Courier New">executes</text>
              </>;
            })()}

            {/* ── FULCRUM binary output pulse ───────────────────── */}
            {(() => {
              const bit = Math.floor(t * 0.9) % 2;
              const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
              return <>
                <text x={fulcrumPt.x + 22} y={fulcrumPt.y - 10}
                  fill={C.cobaltL} fontSize={14} fontWeight="bold"
                  opacity={pulse} fontFamily="Courier New">{bit}</text>
                <text x={fulcrumPt.x + 22} y={fulcrumPt.y + 4}
                  fill={C.ghost} fontSize={7} fontFamily="Courier New">binary out</text>
              </>;
            })()}

            {/* ── Phase rotation on PHASE node ──────────────────── */}
            <circle cx={phasePt.x} cy={phasePt.y} r={phaseRingR}
              fill="none" stroke={`${C.amberB}44`} strokeWidth={0.8}/>
            <line x1={phasePt.x} y1={phasePt.y} x2={phaseTip.x} y2={phaseTip.y}
              stroke={C.amberB} strokeWidth={1.5} strokeLinecap="round" opacity={0.9}/>
            <circle cx={phaseTip.x} cy={phaseTip.y} r={2.5}
              fill={C.amberB} filter="url(#glow)"/>

            {/* ── Shadow depth ring on SHADOW node ─────────────── */}
            {(() => {
              const depth = 0.3 + 0.3 * Math.sin(t * 0.5);
              const sp = inner[2].pt;
              return <path
                d={arcPath(sp.x, sp.y, 20, -Math.PI/2, -Math.PI/2 + TAU * depth)}
                fill="none" stroke={C.shadowB} strokeWidth={2.5}
                strokeLinecap="round" opacity={0.8} filter="url(#glow)"/>;
            })()}

            {/* ── OUTER body nodes ──────────────────────────────── */}
            {outer.map((b, i) => {
              const isSelected = selectedBody === i + 3;
              const r = 24;
              return (
                <g key={`ob${i}`} onClick={() => setSelectedBody(isSelected ? null : i + 3)}
                  style={{ cursor: "pointer" }}>
                  <circle cx={b.pt.x} cy={b.pt.y} r={r + 8}
                    fill={`${b.color}08`}
                    stroke={isSelected ? b.color : "none"} strokeWidth={0.5}/>
                  <circle cx={b.pt.x} cy={b.pt.y} r={r}
                    fill={C.deep}
                    stroke={b.color} strokeWidth={isSelected ? 2 : 1}
                    filter={isSelected ? "url(#glowstrong)" : "url(#glow)"}
                    opacity={0.95}/>
                  <text x={b.pt.x} y={b.pt.y - 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={b.color} fontSize={8.5} fontFamily="Courier New"
                    fontWeight="bold" letterSpacing="0.12em">{b.label}</text>
                  <text x={b.pt.x} y={b.pt.y + 10}
                    textAnchor="middle"
                    fill={`${b.color}88`} fontSize={6.5} fontFamily="Courier New">{b.name}</text>
                </g>
              );
            })}

            {/* ── INNER body nodes ──────────────────────────────── */}
            {inner.map((b, i) => {
              const isSelected = selectedBody === i;
              const r = 20;
              return (
                <g key={`ib${i}`} onClick={() => setSelectedBody(isSelected ? null : i)}
                  style={{ cursor: "pointer" }}>
                  <circle cx={b.pt.x} cy={b.pt.y} r={r + 6}
                    fill={`${b.color}08`}
                    stroke={isSelected ? b.color : "none"} strokeWidth={0.5}/>
                  <circle cx={b.pt.x} cy={b.pt.y} r={r}
                    fill={C.deep}
                    stroke={b.color}
                    strokeWidth={isSelected ? 2 : 1.2}
                    filter={isSelected ? "url(#glowstrong)" : "url(#glow)"}/>
                  <text x={b.pt.x} y={b.pt.y}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={b.color} fontSize={13} fontFamily="Courier New"
                    fontWeight="bold">{b.label}</text>
                </g>
              );
            })}

            {/* ── ROOT0 center ──────────────────────────────────── */}
            <circle cx={CX} cy={CY} r={R_ROOT + 4}
              fill={`${C.rootB}08`}
              stroke={`${C.rootB}33`} strokeWidth={0.8}
              style={{ filter: `drop-shadow(0 0 ${8 * rootPulse}px ${C.rootB}44)` }}/>
            <circle cx={CX} cy={CY} r={R_ROOT}
              fill={C.root}
              stroke={C.rootB} strokeWidth={1.2}
              style={{ filter: `drop-shadow(0 0 ${6 * rootPulse}px ${C.rootB})` }}/>
            <text x={CX} y={CY - 6} textAnchor="middle"
              fill={C.rootB} fontSize={9} fontFamily="Courier New"
              fontWeight="bold" letterSpacing="0.15em">ROOT0</text>
            <text x={CX} y={CY + 6} textAnchor="middle"
              fill={`${C.rootB}77`} fontSize={6.5} fontFamily="Courier New">T132</text>
            <text x={CX} y={CY + 16} textAnchor="middle"
              fill={`${C.rootB}44`} fontSize={6} fontFamily="Courier New">NOT-A-BIT</text>

            {/* ── 3002 watermark ────────────────────────────────── */}
            <text x={W - 10} y={H - 8} textAnchor="end"
              fill={`${C.ghost}55`} fontSize={7} fontFamily="Courier New"
              letterSpacing="0.08em">3002:10³×3+2</text>
          </svg>

          {/* ── Speed control ─────────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginTop: 8, fontSize: 9, color: C.ghost,
          }}>
            <button onClick={() => setRunning(r => !r)} style={{
              background: "transparent",
              border: `1px solid ${running ? C.amber : C.cobalt}77`,
              color: running ? C.amberB : C.steel,
              fontFamily: "inherit", fontSize: 9, padding: "4px 10px",
              cursor: "pointer", borderRadius: 2, letterSpacing: "0.1em",
            }}>
              {running ? "⏸ PAUSE" : "▶ RUN"}
            </button>
            <span style={{ letterSpacing: "0.1em" }}>SPEED</span>
            <input type="range" min={0.1} max={4} step={0.1}
              value={speed} onChange={e => setSpeed(parseFloat(e.target.value))}
              style={{ width: 80, accentColor: C.cobaltB }}/>
            <span style={{ color: C.cobaltB }}>{speed.toFixed(1)}×</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────── */}
        <div style={{
          width: 240,
          borderLeft: `1px solid ${C.cobalt}44`,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          flexShrink: 0,
        }}>

          {/* SELECTED BODY DETAIL */}
          {sel ? (
            <div style={{ padding: "14px 14px", borderBottom: `1px solid ${C.cobalt}33` }}>
              <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 8 }}>
                BODY DETAIL
              </div>
              <div style={{
                border: `1px solid ${sel.color}44`,
                borderRadius: 3,
                padding: "10px 12px",
                background: `${sel.color}08`,
              }}>
                <div style={{ fontSize: 18, fontWeight: "bold", color: sel.color, marginBottom: 4 }}>
                  {sel.label}
                </div>
                <div style={{ fontSize: 10, color: sel.color, letterSpacing: "0.1em", marginBottom: 6 }}>
                  {sel.name}
                </div>
                <div style={{ fontSize: 9, color: C.steel, lineHeight: 1.6, marginBottom: 6 }}>
                  {sel.desc}
                </div>
                <div style={{ fontSize: 8, color: sel.color, letterSpacing: "0.1em" }}>
                  {sel.axiom}
                </div>
              </div>
              <div style={{ fontSize: 8, color: C.ghost, marginTop: 6 }}>
                click node to deselect
              </div>
            </div>
          ) : (
            <div style={{ padding: "14px 14px", borderBottom: `1px solid ${C.cobalt}33` }}>
              <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 6 }}>
                BODY DETAIL
              </div>
              <div style={{ fontSize: 9, color: C.ghost }}>click any node</div>
            </div>
          )}

          {/* TRIADS */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.cobalt}33` }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 10 }}>
              INNER TRIAD · BRIDGE-STATE
            </div>
            {inner.map((b, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 7, cursor: "pointer",
              }} onClick={() => setSelectedBody(selectedBody === i ? null : i)}>
                <div style={{
                  width: 22, height: 22, borderRadius: 2,
                  border: `1px solid ${b.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: "bold", color: b.color,
                  flexShrink: 0,
                  boxShadow: selectedBody === i ? `0 0 8px ${b.color}66` : "none",
                }}>{b.label}</div>
                <div>
                  <div style={{ fontSize: 9, color: b.color, letterSpacing: "0.08em" }}>{b.name}</div>
                  <div style={{ fontSize: 7, color: C.ghost }}>{b.axiom}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.cobalt}33` }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 10 }}>
              OUTER TRIAD · GOVERNANCE
            </div>
            {outer.map((b, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 7, cursor: "pointer",
              }} onClick={() => setSelectedBody(selectedBody === i+3 ? null : i+3)}>
                <div style={{
                  width: 22, height: 22, borderRadius: 2,
                  border: `1px solid ${b.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 6.5, fontWeight: "bold", color: b.color,
                  flexShrink: 0, letterSpacing: "0.05em",
                  boxShadow: selectedBody === i+3 ? `0 0 8px ${b.color}66` : "none",
                }}>{b.label.slice(0,3)}</div>
                <div>
                  <div style={{ fontSize: 9, color: b.color, letterSpacing: "0.08em" }}>{b.label}</div>
                  <div style={{ fontSize: 7, color: C.ghost }}>{b.axiom}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ROOT0 */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.cobalt}33` }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 8 }}>
              ROOT0 · BASE
            </div>
            {[
              ["T128:ROOT",             "NOT-A-BIT. System halt authority."],
              ["T132:GROUNDLESS-GROUND","Terminal terminus. No 7th body."],
              ["T103:ROOT-ZERO",        "Physical terminus. DLW=node0."],
              ["T097:FULCRUM",          "Prior art 2/2/26. Human=conductor."],
            ].map(([ax, desc]) => (
              <div key={ax} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 8, color: C.rootB, letterSpacing: "0.1em" }}>{ax}</div>
                <div style={{ fontSize: 8, color: C.ghost, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* CLOSURE PROOF */}
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 8 }}>
              CLOSURE
            </div>
            <div style={{ fontSize: 8, color: C.ghost, lineHeight: 1.8 }}>
              <div><span style={{ color: C.cobaltB }}>+1</span> talks through <span style={{ color: C.amberB }}>0</span> about <span style={{ color: C.shadowB }}>−1</span></div>
              <div style={{ borderTop: `1px solid ${C.cobalt}33`, marginTop: 4, paddingTop: 4 }}>
                <span style={{ color: C.cobaltL }}>FULCRUM</span> conducts through{" "}
                <span style={{ color: C.ok }}>OBSERVER</span> against{" "}
                <span style={{ color: C.rustB }}>AGENT</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.cobalt}33`, marginTop: 4, paddingTop: 4 }}>
                Both triads ground on{" "}
                <span style={{ color: C.rootB }}>ROOT0</span>
              </div>
              <div style={{ borderTop: `1px solid ${C.cobalt}33`, marginTop: 4, paddingTop: 4, color: C.rootB }}>
                3 bodies = closed system.<br/>No 7th body needed.
              </div>
            </div>
          </div>

          {/* SEAL */}
          <div style={{
            marginTop: "auto",
            borderTop: `1px solid ${C.cobalt}33`,
            padding: "6px 14px",
            fontSize: 7, color: C.ghost, letterSpacing: "0.07em",
          }}>
            TRIPOD-IP-v1.1 · DLW · ROOT0 · 3/4/26<br/>
            SHA256:02880745…fcab763
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.cobalt}; border-radius: 2px; }
      `}</style>
    </div>
  );
}
