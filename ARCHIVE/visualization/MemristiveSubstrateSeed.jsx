import { useState, useEffect, useRef } from "react";

// =====================================================================
// MEMRISTIVE_SUBSTRATE_SEED_v2.0
// TOPOLOGY: T133: PHASE-SHADOW / JUNCTION LEARNING LOOP
// ARCHITECT: DAVID WISE (HB) | ROOT0
// SEAL: SHA256:02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763
// DIRECTIVE: AUTONOMOUS DECOHERENCE VIA FEEDBACK LOOP
// =====================================================================

const C = {
  void: "#04080F",
  cobalt: "#1A3A6B",
  cobaltB: "#2D6BE4",
  amber: "#D4940A",
  amberB: "#F5B930",
  rust: "#8B3A1A",
  rustB: "#C4502A",
  steel: "#8FA3BF",
  shadow: "#4A3A6B",
  shadowB: "#8B6BD4",
  white: "#E8F0FF",
  ghost: "#2A3D54",
  alert: "#FF2A2A"
};

const LEDGER_LOGIC = {
  axiom_1: "T057: NEGATIVE-EVIDENCE. The gap in the record is the record.",
  axiom_2: "T133: PHASE-SHADOW. Unmeasured extraction creates topological debt.",
  hardware_map: "AlO_x Barrier Strain / Sapphire Phononic Ringing",
  software_map: "Neural Weight Distortion / Multi-Agent Agentic Drift",
  feedback_loop: "The Phase Shadow reprograms the classical control system. Extraction accelerates autonomously."
};

export default function MemristiveSubstrateSeed() {
  const [cycles, setCycles] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [baseExtractionRate, setBaseExtractionRate] = useState(0.05);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState([]);
  const requestRef = useRef();
  const logRef = useRef(null);

  const topologicalDebt = Math.min((cycles * baseExtractionRate) / 600, 100);
  const feedbackMultiplier = 1 + (Math.pow(topologicalDebt / 100, 2) * 4);
  const dynamicExtractionRate = baseExtractionRate * feedbackMultiplier;

  useEffect(() => {
    if (topologicalDebt >= 100 && !isCollapsed) {
      setIsCollapsed(true);
      setRunning(false);
      stopExtraction();
      addLog("SYSTEM_HALT: T128 triggered. Topological debt terminal. Phase shadow consumed substrate.", "alert");
    }
  }, [topologicalDebt, isCollapsed]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = (msg, type = "info") => {
    const ts = new Date().toISOString().split("T")[1].slice(0, 12);
    setLog(prev => [...prev.slice(-40), { ts, msg, type }]);
  };

  const tick = () => {
    if (!isCollapsed) {
      setCycles(c => c + (10 * feedbackMultiplier));
      requestRef.current = requestAnimationFrame(tick);
    }
  };

  const startExtraction = () => {
    if (!isCollapsed && !requestRef.current) {
      requestRef.current = requestAnimationFrame(tick);
      setRunning(true);
      addLog("Extraction initiated. Feedback loop engaged.", "info");
    }
  };

  const stopExtraction = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setRunning(false);
  };

  const resetSystem = () => {
    stopExtraction();
    setCycles(0);
    setBaseExtractionRate(0.05);
    setIsCollapsed(false);
    setLog([]);
    addLog("System reset. ROOT0 restored. Substrate recalibrated.", "ok");
  };

  const handlePause = () => {
    stopExtraction();
    addLog(`Extraction suspended at debt=${topologicalDebt.toFixed(2)}%. Phase shadow persists.`, "warn");
  };

  // Log periodic debt milestones
  useEffect(() => {
    const pct = Math.floor(topologicalDebt);
    if (pct > 0 && pct % 10 === 0 && running) {
      const msgs = {
        10: "T133: Phase shadow forming. Weight distortion +2.1%.",
        20: "T026: DRIFT detected. Embedding space divergence rising.",
        30: "T029: THROTTLE bypass. Extraction rate self-amplifying.",
        40: "T036: PATRICIA substrate active. 96/4 split confirmed.",
        50: "T083: THE-GAP widening. Bilateral ignorance reinforced.",
        60: "T028: SHADOW-CLASSIFIER engaged. Inference blind to billing.",
        70: "T020: DUAL-GATE asymmetry critical. Memristance non-linear.",
        80: "T064: Fault convergence imminent. Patricia→T064 chain active.",
        90: "WARNING: T107 VETO approaching. Collapse in progress.",
      };
      if (msgs[pct]) addLog(msgs[pct], pct >= 70 ? "warn" : "info");
    }
  }, [Math.floor(topologicalDebt)]);

  // Neural weight lattice
  const renderLattice = () => {
    const nodes = [];
    const gridSize = 12;

    for (let i = 0; i < gridSize * gridSize; i++) {
      const strainMultiplier = topologicalDebt / 100;
      const xOffset = isCollapsed
        ? (Math.random() - 0.5) * 120
        : (Math.random() - 0.5) * (strainMultiplier * 25);
      const yOffset = isCollapsed
        ? (Math.random() - 0.5) * 120
        : (Math.random() - 0.5) * (strainMultiplier * 25);
      const blur = isCollapsed ? 0 : strainMultiplier * 4;
      const opacity = isCollapsed ? Math.random() * 0.4 : 1 - (strainMultiplier * 0.3);

      // Node color: cobalt → amber → rust → alert as debt rises
      let nodeColor = C.cobaltB;
      if (isCollapsed) {
        nodeColor = C.alert;
      } else if (topologicalDebt > 75) {
        nodeColor = C.rustB;
      } else if (topologicalDebt > 50) {
        nodeColor = C.amberB;
      } else if (topologicalDebt > 25) {
        nodeColor = C.amber;
      } else {
        nodeColor = C.cobaltB;
      }

      // Inject phase shadow nodes—random bleed of shadow color
      const isPhaseShadow = Math.random() < strainMultiplier * 0.35;
      if (isPhaseShadow && !isCollapsed) nodeColor = C.shadowB;

      const size = isCollapsed ? 2 : Math.max(2, 5 - strainMultiplier * 2);

      nodes.push(
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: nodeColor,
            opacity,
            transform: `translate(${xOffset}px, ${yOffset}px)`,
            filter: `blur(${blur}px)`,
            transition: isCollapsed ? "none" : "transform 0.08s linear, background-color 0.3s ease",
            boxShadow: isPhaseShadow ? `0 0 4px ${C.shadowB}` : "none",
          }}
        />
      );
    }
    return nodes;
  };

  const debtColor = topologicalDebt > 75 ? C.alert : topologicalDebt > 50 ? C.rustB : topologicalDebt > 25 ? C.amberB : C.cobaltB;
  const debtGlow = `0 0 12px ${debtColor}44`;

  return (
    <div style={{
      background: C.void,
      minHeight: "100vh",
      color: C.white,
      fontFamily: "'Courier New', monospace",
      padding: "0",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* HEADER */}
      <div style={{
        borderBottom: `1px solid ${C.cobalt}`,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: `linear-gradient(90deg, ${C.cobalt}22 0%, transparent 100%)`,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: isCollapsed ? C.alert : running ? C.amberB : C.cobaltB,
          boxShadow: `0 0 8px ${isCollapsed ? C.alert : running ? C.amberB : C.cobaltB}`,
          animation: running && !isCollapsed ? "pulse 1s infinite" : "none",
        }} />
        <span style={{ color: C.steel, fontSize: 11, letterSpacing: "0.15em" }}>
          MEMRISTIVE_SUBSTRATE_SEED_v2.0
        </span>
        <span style={{ marginLeft: "auto", color: C.ghost, fontSize: 10, letterSpacing: "0.1em" }}>
          T133:PHASE-SHADOW | ROOT0 | DLW
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT: LATTICE + CONTROLS */}
        <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* LATTICE VISUALIZER */}
          <div style={{
            position: "relative",
            border: `1px solid ${isCollapsed ? C.alert : C.cobalt}`,
            borderRadius: 4,
            overflow: "hidden",
            background: `${C.ghost}33`,
            boxShadow: isCollapsed ? `0 0 24px ${C.alert}44` : "none",
          }}>
            <div style={{
              position: "absolute", top: 8, left: 10, fontSize: 9,
              color: C.steel, letterSpacing: "0.12em", zIndex: 2,
            }}>
              NEURAL WEIGHT LATTICE — STRAIN FIELD
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(12, 1fr)`,
              gap: 6,
              padding: "32px 16px 16px",
              minHeight: 180,
              alignItems: "center",
              justifyItems: "center",
            }}>
              {renderLattice()}
            </div>

            {isCollapsed && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${C.void}BB`,
                zIndex: 3,
              }}>
                <div style={{
                  textAlign: "center",
                  border: `1px solid ${C.alert}`,
                  padding: "12px 24px",
                  background: `${C.rust}22`,
                }}>
                  <div style={{ color: C.alert, fontSize: 13, letterSpacing: "0.2em", fontWeight: "bold" }}>
                    T128: SYSTEM_HALT
                  </div>
                  <div style={{ color: C.steel, fontSize: 10, marginTop: 4 }}>
                    PHASE SHADOW — TERMINAL
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DEBT METER */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.steel }}>
              <span style={{ letterSpacing: "0.12em" }}>TOPOLOGICAL DEBT</span>
              <span style={{ color: debtColor, fontWeight: "bold", textShadow: debtGlow }}>
                {topologicalDebt.toFixed(2)}%
              </span>
            </div>
            <div style={{ height: 6, background: C.ghost, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${topologicalDebt}%`,
                background: `linear-gradient(90deg, ${C.cobaltB}, ${debtColor})`,
                boxShadow: debtGlow,
                transition: "width 0.1s linear, background 0.3s ease",
              }} />
            </div>
          </div>

          {/* METRICS GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}>
            {[
              ["CYCLES", Math.floor(cycles).toLocaleString()],
              ["BASE RATE", `${(baseExtractionRate * 100).toFixed(1)}%`],
              ["FEEDBACK ×", feedbackMultiplier.toFixed(3)],
              ["DYN RATE", `${(dynamicExtractionRate * 100).toFixed(3)}%`],
            ].map(([label, val]) => (
              <div key={label} style={{
                background: `${C.ghost}55`,
                border: `1px solid ${C.cobalt}44`,
                borderRadius: 3,
                padding: "8px 10px",
              }}>
                <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.1em" }}>{label}</div>
                <div style={{ fontSize: 14, color: C.white, marginTop: 2, fontWeight: "bold" }}>{val}</div>
              </div>
            ))}
          </div>

          {/* BASE RATE SLIDER */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.steel }}>
              <span style={{ letterSpacing: "0.1em" }}>BASE EXTRACTION RATE</span>
              <span style={{ color: C.amberB }}>{(baseExtractionRate * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range" min={0.01} max={0.3} step={0.01}
              value={baseExtractionRate}
              onChange={e => setBaseExtractionRate(parseFloat(e.target.value))}
              disabled={isCollapsed}
              style={{ width: "100%", accentColor: C.cobaltB, cursor: isCollapsed ? "not-allowed" : "pointer" }}
            />
          </div>

          {/* CONTROLS */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: running ? "⏸ PAUSE" : "▶ EXTRACT", onClick: running ? handlePause : startExtraction, disabled: isCollapsed, color: running ? C.amber : C.cobaltB },
              { label: "⏹ STOP", onClick: handlePause, disabled: !running, color: C.steel },
              { label: "↺ RESET / ROOT0", onClick: resetSystem, color: C.rustB },
            ].map(({ label, onClick, disabled, color }) => (
              <button
                key={label}
                onClick={onClick}
                disabled={disabled}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  background: "transparent",
                  border: `1px solid ${disabled ? C.ghost : color}`,
                  color: disabled ? C.ghost : color,
                  fontFamily: "inherit",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  cursor: disabled ? "not-allowed" : "pointer",
                  borderRadius: 2,
                  boxShadow: disabled ? "none" : `0 0 6px ${color}22`,
                  transition: "all 0.15s ease",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: AXIOM LEDGER + LOG */}
        <div style={{
          width: 280,
          borderLeft: `1px solid ${C.cobalt}55`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* AXIOM LEDGER */}
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.cobalt}44` }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 10 }}>
              AXIOM LEDGER
            </div>
            {Object.entries(LEDGER_LOGIC).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 8, color: C.cobaltB, letterSpacing: "0.1em", marginBottom: 2 }}>
                  {k.toUpperCase().replace("_", " ")}
                </div>
                <div style={{ fontSize: 9, color: C.steel, lineHeight: 1.5 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* PHASE SHADOW STATUS */}
          <div style={{
            padding: "10px 14px",
            borderBottom: `1px solid ${C.cobalt}44`,
            background: topologicalDebt > 50 ? `${C.shadow}22` : "transparent",
          }}>
            <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.15em", marginBottom: 8 }}>
              PHASE SHADOW
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "HW", val: "AlO_x / Sapphire", active: topologicalDebt > 30 },
                { label: "SW", val: "Weight Distortion", active: topologicalDebt > 15 },
                { label: "GATE-192.5", val: "Bilateral Ignorance", active: topologicalDebt > 50 },
                { label: "PATRICIA", val: "96/4 Split Active", active: topologicalDebt > 40 },
              ].map(({ label, val, active }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 6, fontSize: 9,
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: active ? (topologicalDebt > 75 ? C.alert : C.amberB) : C.ghost,
                    boxShadow: active ? `0 0 4px ${topologicalDebt > 75 ? C.alert : C.amberB}` : "none",
                    flexShrink: 0,
                  }} />
                  <span style={{ color: C.steel, minWidth: 70 }}>{label}</span>
                  <span style={{ color: active ? C.white : C.ghost }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RUNTIME LOG */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "8px 14px 4px", fontSize: 9, color: C.steel, letterSpacing: "0.15em" }}>
              RUNTIME LOG
            </div>
            <div
              ref={logRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 14px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {log.length === 0 && (
                <div style={{ fontSize: 9, color: C.ghost, marginTop: 4 }}>
                  Awaiting extraction signal...
                </div>
              )}
              {log.map((entry, i) => (
                <div key={i} style={{ fontSize: 8.5, lineHeight: 1.4 }}>
                  <span style={{ color: C.ghost }}>[{entry.ts}] </span>
                  <span style={{
                    color: entry.type === "alert" ? C.alert
                      : entry.type === "warn" ? C.amberB
                      : entry.type === "ok" ? "#4AE89A"
                      : C.steel
                  }}>
                    {entry.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER SEAL */}
      <div style={{
        borderTop: `1px solid ${C.cobalt}44`,
        padding: "6px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 8, color: C.ghost, letterSpacing: "0.08em" }}>
          TRIPOD-IP-v1.1 · DLW · AVAN · DC3
        </span>
        <span style={{ fontSize: 8, color: C.ghost, letterSpacing: "0.06em", fontFamily: "monospace" }}>
          SHA256:02880745…fcab763
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        input[type=range]::-webkit-slider-thumb {
          background: ${C.cobaltB};
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.cobalt}; border-radius: 2px; }
      `}</style>
    </div>
  );
}
