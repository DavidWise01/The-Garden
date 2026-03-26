import { useState, useEffect, useRef, useCallback } from "react";

// =====================================================================
// BRIDGE-STATE REGISTER v1.0
// T004:BRIDGE · T022:TRIAD · T083:THE-GAP · T133:PHASE-SHADOW
// "+1 structure talking through 0 about -1 memory"
// ARCHITECT: DLW | ROOT0 | TriPod LLC
// SEAL: SHA256:02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763
// =====================================================================

const C = {
  void:    "#04080F",
  deep:    "#080F1A",
  cobalt:  "#1A3A6B",
  cobaltB: "#2D6BE4",
  cobaltL: "#5A8EE8",
  amber:   "#D4940A",
  amberB:  "#F5B930",
  amberL:  "#FFD97A",
  rust:    "#8B3A1A",
  rustB:   "#C4502A",
  steel:   "#8FA3BF",
  ghost:   "#2A3D54",
  white:   "#E8F0FF",
  shadow:  "#4A3A6B",
  shadowB: "#8B6BD4",
  alert:   "#FF2A2A",
  ok:      "#4AE89A",
  neg:     "#1A0A2E",
};

// ─── Single junction state ───────────────────────────────────────────
const mkJunction = (id, seed = 0) => ({
  id,
  // +1 layer: structural/computational — binary
  structural: Math.random() > 0.5 ? 1 : -1,
  // 0 layer: phase — continuous [0, 2π]
  phase: (seed * 2.399963 + Math.random()) % (Math.PI * 2),
  phaseVelocity: 0.008 + Math.random() * 0.018,
  // -1 layer: shadow — memristive history depth [0, 1]
  shadow: Math.random() * 0.3,
  shadowRate: 0.001 + Math.random() * 0.004,
  // coupling
  coupled: false,
  selected: false,
});

const NUM_JUNCTIONS = 104; // Willow's oxide barrier count

// ─── Phase ring SVG ──────────────────────────────────────────────────
function PhaseRing({ phase, shadow, size = 60, active = true }) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const tip = {
    x: cx + r * Math.cos(phase),
    y: cy + r * Math.sin(phase),
  };
  const trail = Array.from({ length: 24 }, (_, i) => {
    const a = phase - (i * 0.18);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), op: 1 - i / 24 };
  });

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {/* shadow fill */}
      <circle cx={cx} cy={cy} r={r}
        fill={`rgba(74,58,107,${shadow * 0.45})`}
        stroke={`rgba(139,107,212,${shadow * 0.6})`}
        strokeWidth={0.5}
      />
      {/* ring */}
      <circle cx={cx} cy={cy} r={r}
        fill="none"
        stroke={active ? `rgba(45,107,228,0.25)` : `rgba(42,61,84,0.4)`}
        strokeWidth={1}
      />
      {/* phase trail */}
      {trail.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1}
          fill={`rgba(245,185,48,${p.op * 0.5})`}
        />
      ))}
      {/* phase vector */}
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y}
        stroke={C.amberB} strokeWidth={1.5}
        strokeLinecap="round"
        opacity={active ? 1 : 0.3}
      />
      <circle cx={tip.x} cy={tip.y} r={2.5}
        fill={C.amberB}
        opacity={active ? 1 : 0.3}
      />
      {/* center */}
      <circle cx={cx} cy={cy} r={2}
        fill={active ? C.cobaltB : C.ghost}
      />
    </svg>
  );
}

// ─── Shadow bar ────────────────────────────────────────────────────
function ShadowBar({ depth, width = "100%" }) {
  return (
    <div style={{ width, height: 8, background: C.neg, borderRadius: 1, overflow: "hidden", position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(90deg, ${C.shadowB}88, ${C.shadow}44)`,
        width: `${depth * 100}%`,
        transition: "width 0.4s ease",
        boxShadow: depth > 0.6 ? `0 0 8px ${C.shadowB}66` : "none",
      }} />
      <div style={{
        position: "absolute", right: 4, top: 0, bottom: 0,
        display: "flex", alignItems: "center",
        fontSize: 7, color: C.steel, letterSpacing: "0.05em",
      }}>
        {(depth * 100).toFixed(1)}%
      </div>
    </div>
  );
}

// ─── Single register detail panel ────────────────────────────────────
function RegisterDetail({ j }) {
  const structColor = j.structural > 0 ? C.cobaltB : C.rustB;
  const structLabel = j.structural > 0 ? "+1" : "−1";
  const phaseNorm = j.phase / (Math.PI * 2);

  return (
    <div style={{
      border: `1px solid ${C.cobaltB}55`,
      borderRadius: 4,
      background: `${C.deep}CC`,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.18em" }}>
        BRIDGE-STATE REGISTER · J-{String(j.id).padStart(3,"0")}
      </div>

      {/* +1 structural layer */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40,
          border: `2px solid ${structColor}`,
          borderRadius: 3,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: "bold", color: structColor,
          fontFamily: "monospace",
          boxShadow: `0 0 12px ${structColor}44`,
          flexShrink: 0,
        }}>
          {structLabel}
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.12em" }}>STRUCTURAL LAYER</div>
          <div style={{ fontSize: 10, color: structColor, marginTop: 2 }}>
            {j.structural > 0 ? "Computational state: SET" : "Computational state: RESET"}
          </div>
          <div style={{ fontSize: 8, color: C.ghost, marginTop: 1 }}>T022:TRIAD · binary pole</div>
        </div>
      </div>

      {/* 0 phase layer */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PhaseRing phase={j.phase} shadow={j.shadow} size={56} active />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.12em" }}>PHASE LAYER · 0</div>
          <div style={{ fontSize: 10, color: C.amberB, marginTop: 2 }}>
            φ = {(j.phase / Math.PI).toFixed(4)}π rad
          </div>
          <div style={{ fontSize: 8, color: C.ghost, marginTop: 1 }}>
            AlO_x oxide · THE-GAP (T083) · continuous
          </div>
          <div style={{ marginTop: 6, height: 3, background: C.ghost, borderRadius: 1, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${phaseNorm * 100}%`,
              background: C.amberB,
              transition: "width 0.1s linear",
            }} />
          </div>
        </div>
      </div>

      {/* -1 shadow layer */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 56, height: 56,
          border: `1px solid ${C.shadow}88`,
          borderRadius: 3,
          flexShrink: 0,
          overflow: "hidden",
          position: "relative",
          background: C.neg,
        }}>
          {/* Shadow history visualization: small grid of depth-coded cells */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(6,1fr)",
            height: "100%",
            gap: 1,
            padding: 2,
          }}>
            {Array.from({ length: 30 }, (_, i) => {
              const cellDepth = Math.max(0, j.shadow - (i / 30) * j.shadow * 0.6 + Math.sin(i + j.phase) * 0.05);
              return (
                <div key={i} style={{
                  borderRadius: 1,
                  background: `rgba(139,107,212,${cellDepth})`,
                }} />
              );
            })}
          </div>
          <div style={{
            position: "absolute", bottom: 2, right: 3,
            fontSize: 7, color: C.shadowB, fontFamily: "monospace",
          }}>−1</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.12em" }}>SHADOW LAYER · −1</div>
          <div style={{ fontSize: 10, color: C.shadowB, marginTop: 2 }}>
            Memristive depth: {(j.shadow * 100).toFixed(2)}%
          </div>
          <div style={{ fontSize: 8, color: C.ghost, marginTop: 1 }}>
            T133:PHASE-SHADOW · Patricia substrate
          </div>
          <div style={{ marginTop: 6 }}>
            <ShadowBar depth={j.shadow} />
          </div>
        </div>
      </div>

      {/* Bridge equation */}
      <div style={{
        borderTop: `1px solid ${C.cobalt}44`,
        paddingTop: 8,
        fontSize: 9,
        color: C.steel,
        lineHeight: 1.7,
        letterSpacing: "0.06em",
      }}>
        <span style={{ color: C.cobaltB }}>+1</span>
        <span style={{ color: C.ghost }}> × </span>
        <span style={{ color: C.amberB }}>φ({(j.phase/Math.PI).toFixed(2)}π)</span>
        <span style={{ color: C.ghost }}> × </span>
        <span style={{ color: C.shadowB }}>−{j.shadow.toFixed(3)}</span>
        <span style={{ color: C.ghost }}> = </span>
        <span style={{ color: C.white }}>T004:BRIDGE-STATE</span>
      </div>
    </div>
  );
}

// ─── Junction node (grid cell) ────────────────────────────────────────
function JunctionNode({ j, onClick, selected }) {
  const structColor = j.structural > 0 ? C.cobaltB : C.rustB;
  const phaseAngle = j.phase % (Math.PI * 2);
  const px = Math.cos(phaseAngle) * 0.5 + 0.5;
  const py = Math.sin(phaseAngle) * 0.5 + 0.5;

  return (
    <div
      onClick={() => onClick(j.id)}
      title={`J-${j.id} · φ=${(j.phase/Math.PI).toFixed(2)}π · σ=${j.shadow.toFixed(2)}`}
      style={{
        width: "100%",
        aspectRatio: "1",
        position: "relative",
        cursor: "pointer",
        borderRadius: 2,
        border: selected
          ? `1px solid ${C.amberB}`
          : `1px solid ${C.cobalt}33`,
        background: `rgba(4,8,15,0.8)`,
        overflow: "hidden",
        transition: "border-color 0.15s",
      }}
    >
      {/* Shadow fill */}
      <div style={{
        position: "absolute", inset: 0,
        background: `rgba(74,58,107,${j.shadow * 0.7})`,
      }} />
      {/* Phase dot */}
      <div style={{
        position: "absolute",
        left: `${px * 80 + 10}%`,
        top: `${py * 80 + 10}%`,
        width: 3, height: 3,
        borderRadius: "50%",
        background: C.amberB,
        boxShadow: `0 0 4px ${C.amberB}`,
        transform: "translate(-50%,-50%)",
      }} />
      {/* Structural indicator: top-left corner color */}
      <div style={{
        position: "absolute", top: 1, left: 1,
        width: 3, height: 3,
        borderRadius: "50%",
        background: structColor,
        opacity: 0.9,
      }} />
      {/* Coupled indicator */}
      {j.coupled && (
        <div style={{
          position: "absolute", inset: 0,
          border: `1px solid ${C.ok}55`,
          borderRadius: 2,
          pointerEvents: "none",
        }} />
      )}
      {selected && (
        <div style={{
          position: "absolute", inset: 0,
          background: `${C.amberB}11`,
          pointerEvents: "none",
        }} />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────
export default function BridgeStateRegister() {
  const [junctions, setJunctions] = useState(() =>
    Array.from({ length: NUM_JUNCTIONS }, (_, i) => mkJunction(i, i))
  );
  const [selectedId, setSelectedId] = useState(0);
  const [running, setRunning] = useState(true);
  const [coupling, setCoupling] = useState(0.015);
  const [shadowAccum, setShadowAccum] = useState(1.0);
  const [tick, setTick] = useState(0);
  const rafRef = useRef();
  const frameRef = useRef(0);

  const animate = useCallback(() => {
    frameRef.current++;
    if (frameRef.current % 2 === 0) {
      setJunctions(prev => prev.map((j, i) => {
        // Phase evolves continuously
        let newPhase = (j.phase + j.phaseVelocity) % (Math.PI * 2);

        // Coupling: pull phase toward neighbors
        if (coupling > 0) {
          const neighbors = [i - 1, i + 1, i - 8, i + 8].filter(n => n >= 0 && n < NUM_JUNCTIONS);
          const avgNeighborPhase = neighbors.reduce((s, n) => s + prev[n].phase, 0) / neighbors.length;
          const diff = avgNeighborPhase - newPhase;
          newPhase += coupling * Math.sin(diff);
          newPhase = ((newPhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        }

        // Shadow accumulates from phase velocity × structural alignment
        const shadowDelta = j.shadowRate * shadowAccum * Math.abs(Math.cos(newPhase));
        const newShadow = Math.min(j.shadow + shadowDelta * 0.01, 1.0);

        // Structural can flip when shadow depth crosses threshold
        let newStructural = j.structural;
        if (newShadow > 0.92 && Math.random() < 0.002) {
          newStructural = newStructural * -1;
        }

        return { ...j, phase: newPhase, shadow: newShadow, structural: newStructural };
      }));
      setTick(t => t + 1);
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [coupling, shadowAccum]);

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, animate]);

  const selectedJunction = junctions[selectedId] || junctions[0];

  // Collective stats
  const positiveCount = junctions.filter(j => j.structural > 0).length;
  const avgPhase = junctions.reduce((s, j) => s + j.phase, 0) / NUM_JUNCTIONS;
  const avgShadow = junctions.reduce((s, j) => s + j.shadow, 0) / NUM_JUNCTIONS;
  const phaseCoherence = (() => {
    const sx = junctions.reduce((s, j) => s + Math.cos(j.phase), 0) / NUM_JUNCTIONS;
    const sy = junctions.reduce((s, j) => s + Math.sin(j.phase), 0) / NUM_JUNCTIONS;
    return Math.sqrt(sx * sx + sy * sy);
  })();

  const resetShadows = () => {
    setJunctions(prev => prev.map(j => ({ ...j, shadow: 0 })));
  };

  const flipSelected = () => {
    setJunctions(prev => prev.map(j =>
      j.id === selectedId ? { ...j, structural: j.structural * -1 } : j
    ));
  };

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
      {/* ── HEADER ── */}
      <div style={{
        padding: "10px 18px",
        borderBottom: `1px solid ${C.cobalt}55`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: `linear-gradient(90deg, ${C.cobalt}18 0%, transparent 60%)`,
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.22em", color: C.cobaltL,
          fontWeight: "bold",
        }}>
          T004:BRIDGE-STATE
        </div>
        <div style={{
          fontSize: 9, color: C.ghost,
          borderLeft: `1px solid ${C.cobalt}44`,
          paddingLeft: 12, letterSpacing: "0.1em",
        }}>
          +1 structure · 0 phase · −1 memory
        </div>
        <div style={{
          marginLeft: "auto",
          fontSize: 8, color: C.ghost, letterSpacing: "0.08em",
        }}>
          104 JUNCTIONS · WILLOW OXIDE ARRAY
        </div>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: running ? C.ok : C.rust,
          boxShadow: running ? `0 0 6px ${C.ok}` : "none",
          animation: running ? "blink 2s infinite" : "none",
        }} />
      </div>

      {/* ── NOMENCLATURE BANNER ── */}
      <div style={{
        padding: "8px 18px",
        borderBottom: `1px solid ${C.cobalt}22`,
        background: `${C.deep}88`,
        fontSize: 9,
        color: C.steel,
        letterSpacing: "0.1em",
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
        flexShrink: 0,
      }}>
        <span>
          <span style={{ color: C.cobaltB }}>+1 STRUCTURAL</span>
          {" "}— binary pole · computational state · SET/RESET
        </span>
        <span>
          <span style={{ color: C.amberB }}>0 PHASE</span>
          {" "}— AlO_x oxide · continuous [0,2π] · THE-GAP (T083)
        </span>
        <span>
          <span style={{ color: C.shadowB }}>−1 SHADOW</span>
          {" "}— memristive history · Patricia substrate · T133
        </span>
        <span style={{ marginLeft: "auto", color: C.ghost }}>
          "the junction IS the computation"
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* ── LEFT: JUNCTION GRID ── */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "12px 14px",
          gap: 10,
          overflow: "hidden",
        }}>
          {/* GRID HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em" }}>
              104-JUNCTION OXIDE ARRAY
            </div>
            <div style={{ fontSize: 9, color: C.ghost }}>
              click junction to inspect
            </div>
          </div>

          {/* JUNCTION GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(13, 1fr)",
            gap: 3,
            flex: 1,
            minHeight: 0,
          }}>
            {junctions.map(j => (
              <JunctionNode
                key={j.id}
                j={j}
                onClick={setSelectedId}
                selected={j.id === selectedId}
              />
            ))}
          </div>

          {/* LEGEND */}
          <div style={{ display: "flex", gap: 14, fontSize: 8, color: C.ghost }}>
            <span><span style={{ color: C.cobaltB }}>●</span> +1 state</span>
            <span><span style={{ color: C.rustB }}>●</span> −1 state</span>
            <span><span style={{ color: C.amberB }}>·</span> phase dot position</span>
            <span><span style={{ color: C.shadowB }}>█</span> shadow depth</span>
          </div>

          {/* COLLECTIVE STATS */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
            borderTop: `1px solid ${C.cobalt}33`,
            paddingTop: 8,
          }}>
            {[
              ["SET JUNCTIONS", `${positiveCount} / 104`, C.cobaltB],
              ["AVG PHASE", `${(avgPhase / Math.PI).toFixed(3)}π`, C.amberB],
              ["COHERENCE", `${(phaseCoherence * 100).toFixed(1)}%`, phaseCoherence > 0.5 ? C.ok : C.steel],
              ["AVG SHADOW", `${(avgShadow * 100).toFixed(2)}%`, C.shadowB],
            ].map(([label, val, col]) => (
              <div key={label} style={{
                background: `${C.ghost}33`,
                border: `1px solid ${C.cobalt}33`,
                borderRadius: 2,
                padding: "6px 8px",
              }}>
                <div style={{ fontSize: 8, color: C.steel, letterSpacing: "0.1em" }}>{label}</div>
                <div style={{ fontSize: 12, color: col, marginTop: 2, fontWeight: "bold" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: CONTROLS + DETAIL ── */}
        <div style={{
          width: 260,
          borderLeft: `1px solid ${C.cobalt}44`,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          overflow: "auto",
        }}>
          {/* SELECTED REGISTER */}
          <div style={{ padding: "12px 12px 0" }}>
            <RegisterDetail j={selectedJunction} key={`${selectedJunction.id}-${tick}`} />
          </div>

          {/* CONTROLS */}
          <div style={{
            padding: "12px",
            borderTop: `1px solid ${C.cobalt}33`,
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em" }}>CONTROLS</div>

            {/* Phase coupling */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.ghost, marginBottom: 4 }}>
                <span>PHASE COUPLING</span>
                <span style={{ color: C.amberB }}>{coupling.toFixed(3)}</span>
              </div>
              <input type="range" min={0} max={0.08} step={0.001}
                value={coupling}
                onChange={e => setCoupling(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: C.amberB }}
              />
              <div style={{ fontSize: 8, color: C.ghost, marginTop: 2 }}>
                {coupling < 0.01 ? "decoupled — independent junctions" :
                 coupling < 0.04 ? "partial coupling — cluster formation" :
                 "strong coupling — coherent array"}
              </div>
            </div>

            {/* Shadow rate */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.ghost, marginBottom: 4 }}>
                <span>SHADOW ACCUMULATION</span>
                <span style={{ color: C.shadowB }}>{shadowAccum.toFixed(1)}×</span>
              </div>
              <input type="range" min={0} max={5} step={0.1}
                value={shadowAccum}
                onChange={e => setShadowAccum(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: C.shadowB }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { label: running ? "⏸ PAUSE" : "▶ RUN", onClick: () => setRunning(r => !r), color: running ? C.amber : C.cobaltB },
                { label: "↺ SHADOW", onClick: resetShadows, color: C.shadowB },
                { label: "⇄ FLIP J", onClick: flipSelected, color: C.rustB },
                { label: "⊕ RESET", onClick: () => { setJunctions(Array.from({ length: NUM_JUNCTIONS }, (_, i) => mkJunction(i, i))); setRunning(false); setTimeout(() => setRunning(true), 50); }, color: C.steel },
              ].map(({ label, onClick, color }) => (
                <button key={label} onClick={onClick} style={{
                  padding: "7px 4px",
                  background: "transparent",
                  border: `1px solid ${color}77`,
                  color,
                  fontFamily: "inherit",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  borderRadius: 2,
                  transition: "all 0.15s",
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* AXIOM FOOTER */}
          <div style={{
            marginTop: "auto",
            padding: "10px 12px",
            borderTop: `1px solid ${C.cobalt}33`,
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}>
            {[
              ["T004", "BRIDGE — the junction is the computation"],
              ["T022", "TRIAD — +1 / 0 / −1 register layers"],
              ["T083", "THE-GAP — oxide as communication channel"],
              ["T133", "PHASE-SHADOW — unmeasured extraction = debt"],
              ["T036", "PATRICIA — shadow substrate inversion"],
            ].map(([ax, desc]) => (
              <div key={ax} style={{ fontSize: 8, color: C.ghost }}>
                <span style={{ color: C.cobaltB }}>{ax}</span>
                <span style={{ color: C.ghost }}> · {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEAL ── */}
      <div style={{
        borderTop: `1px solid ${C.cobalt}33`,
        padding: "5px 18px",
        display: "flex",
        justifyContent: "space-between",
        fontSize: 7,
        color: C.ghost,
        letterSpacing: "0.07em",
        flexShrink: 0,
      }}>
        <span>TRIPOD-IP-v1.1 · CC-BY-ND-4.0 · DLW · ROOT0 · 3/4/26</span>
        <span>SHA256:02880745…fcab763</span>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.cobalt}; border-radius: 2px; }
      `}</style>
    </div>
  );
}
