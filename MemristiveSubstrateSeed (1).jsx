import { useState, useEffect, useRef, useCallback } from "react";

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
  feedback_loop:
    "The Phase Shadow reprograms the classical control system. Extraction accelerates autonomously."
};

// ─── tiny seeded PRNG so the lattice is stable per render ────────────
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function MemristiveSubstrateSeed() {
  const [cycles, setCycles] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [baseExtractionRate, setBaseExtractionRate] = useState(0.05);
  const [tick_seed] = useState(() => Math.floor(Math.random() * 0xffffffff));
  const requestRef = useRef(null);
  const runningRef = useRef(false);

  // ── derived metrics ──────────────────────────────────────────────
  const topologicalDebt = Math.min((cycles * baseExtractionRate) / 600, 100);
  const feedbackMultiplier = 1 + Math.pow(topologicalDebt / 100, 2) * 4;
  const dynamicExtractionRate = baseExtractionRate * feedbackMultiplier;

  // ── collapse trigger ─────────────────────────────────────────────
  useEffect(() => {
    if (topologicalDebt >= 100 && !isCollapsed) {
      setIsCollapsed(true);
      stopExtraction();
    }
  }, [topologicalDebt, isCollapsed]);

  // ── animation loop ───────────────────────────────────────────────
  const tickFn = useCallback(() => {
    if (!runningRef.current) return;
    setCycles((c) => c + 10 * feedbackMultiplier);
    requestRef.current = requestAnimationFrame(tickFn);
  }, [feedbackMultiplier]);

  const startExtraction = useCallback(() => {
    if (isCollapsed || runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    requestRef.current = requestAnimationFrame(tickFn);
  }, [isCollapsed, tickFn]);

  const stopExtraction = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  const resetSystem = useCallback(() => {
    stopExtraction();
    setCycles(0);
    setBaseExtractionRate(0.05);
    setIsCollapsed(false);
  }, [stopExtraction]);

  // ── lattice renderer ─────────────────────────────────────────────
  const renderLattice = () => {
    const nodes = [];
    const gridSize = 12;
    const rand = mulberry32(tick_seed + Math.floor(cycles / 80));
    const strain = topologicalDebt / 100;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const i = row * gridSize + col;
        const r = rand();
        const r2 = rand();

        const xOffset = isCollapsed
          ? (r - 0.5) * 120
          : (r - 0.5) * (strain * 28);
        const yOffset = isCollapsed
          ? (r2 - 0.5) * 120
          : (r2 - 0.5) * (strain * 28);
        const blur = isCollapsed ? 0 : strain * 5;
        const opacity = isCollapsed ? r * 0.35 : 1 - strain * 0.32;

        // color logic: amber = high debt warning, rust = critical, shadow = collapsed
        let nodeColor = C.cobaltB;
        if (isCollapsed) {
          nodeColor = [C.alert, C.rustB, C.shadowB, C.ghost][i % 4];
        } else if (strain > 0.75) {
          nodeColor = r < 0.5 ? C.alert : C.rustB;
        } else if (strain > 0.45) {
          nodeColor = r < 0.6 ? C.amberB : C.amber;
        } else if (strain > 0.15) {
          nodeColor = r < 0.7 ? C.cobaltB : C.steel;
        }

        const baseX = (col / (gridSize - 1)) * 100;
        const baseY = (row / (gridSize - 1)) * 100;

        nodes.push(
          <circle
            key={i}
            cx={`${baseX + xOffset * 0.28}%`}
            cy={`${baseY + yOffset * 0.28}%`}
            r={isCollapsed ? 1.8 : 3 - strain * 1.2}
            fill={nodeColor}
            opacity={opacity}
            style={{
              filter: blur > 0 ? `blur(${blur}px)` : "none",
              transition: isCollapsed ? "none" : "cx 0.1s, cy 0.1s"
            }}
          />
        );
      }
    }
    return nodes;
  };

  // ── edge renderer (connects adjacent nodes roughly) ──────────────
  const renderEdges = () => {
    if (isCollapsed) return null;
    const strain = topologicalDebt / 100;
    const edges = [];
    const gridSize = 12;
    const rand = mulberry32(tick_seed + 999);
    for (let row = 0; row < gridSize - 1; row++) {
      for (let col = 0; col < gridSize - 1; col++) {
        const r = rand();
        if (r > 0.35) continue; // sparse
        const x1 = (col / (gridSize - 1)) * 100;
        const y1 = (row / (gridSize - 1)) * 100;
        const x2 = ((col + 1) / (gridSize - 1)) * 100;
        const y2 = ((row + 1) / (gridSize - 1)) * 100;
        edges.push(
          <line
            key={`e-${row}-${col}`}
            x1={`${x1}%`}
            y1={`${y1}%`}
            x2={`${x2}%`}
            y2={`${y2}%`}
            stroke={strain > 0.5 ? C.amber : C.cobalt}
            strokeWidth={0.6}
            opacity={0.25 + (1 - strain) * 0.35}
          />
        );
      }
    }
    return edges;
  };

  // ── debt color interpolation ─────────────────────────────────────
  const debtBarColor = isCollapsed
    ? C.alert
    : topologicalDebt > 75
    ? C.rustB
    : topologicalDebt > 45
    ? C.amberB
    : C.cobaltB;

  const styles = {
    root: {
      fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
      background: C.void,
      color: C.white,
      minHeight: "100vh",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      boxSizing: "border-box"
    },
    header: {
      borderBottom: `1px solid ${C.cobalt}`,
      paddingBottom: "10px"
    },
    titleRow: {
      display: "flex",
      alignItems: "baseline",
      gap: "12px",
      flexWrap: "wrap"
    },
    title: {
      fontSize: "13px",
      letterSpacing: "0.18em",
      color: C.cobaltB,
      margin: 0,
      textTransform: "uppercase"
    },
    seal: {
      fontSize: "9px",
      color: C.steel,
      letterSpacing: "0.06em",
      opacity: 0.7
    },
    collapseAlert: {
      background: `${C.alert}18`,
      border: `1px solid ${C.alert}`,
      padding: "8px 14px",
      fontSize: "11px",
      letterSpacing: "0.12em",
      color: C.alert,
      textAlign: "center",
      animation: "pulse 1.4s infinite"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 280px",
      gap: "16px"
    },
    latticeWrap: {
      background: C.ghost,
      border: `1px solid ${C.cobalt}`,
      position: "relative",
      overflow: "hidden",
      aspectRatio: "1 / 1"
    },
    latticeSvg: {
      width: "100%",
      height: "100%",
      display: "block"
    },
    latticeOverlay: {
      position: "absolute",
      bottom: "8px",
      right: "10px",
      fontSize: "9px",
      color: C.steel,
      opacity: 0.6,
      letterSpacing: "0.1em"
    },
    sidebar: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    },
    panel: {
      background: "#0A1520",
      border: `1px solid ${C.cobalt}`,
      padding: "12px"
    },
    panelTitle: {
      fontSize: "9px",
      letterSpacing: "0.22em",
      color: C.steel,
      marginBottom: "10px",
      textTransform: "uppercase"
    },
    metricRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    },
    metricLabel: {
      fontSize: "10px",
      color: C.steel,
      letterSpacing: "0.08em"
    },
    metricValue: {
      fontSize: "11px",
      letterSpacing: "0.06em",
      fontWeight: "bold"
    },
    debtBarOuter: {
      height: "6px",
      background: C.ghost,
      border: `1px solid ${C.cobalt}`,
      marginBottom: "10px",
      position: "relative",
      overflow: "hidden"
    },
    debtBarInner: {
      height: "100%",
      width: `${topologicalDebt}%`,
      background: debtBarColor,
      transition: "width 0.15s, background 0.3s",
      boxShadow: `0 0 8px ${debtBarColor}80`
    },
    rateSlider: {
      width: "100%",
      accentColor: C.cobaltB,
      cursor: "pointer"
    },
    btnRow: {
      display: "flex",
      gap: "8px"
    },
    btn: (active, color) => ({
      flex: 1,
      padding: "8px 4px",
      fontSize: "10px",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      background: active ? `${color}22` : "transparent",
      border: `1px solid ${active ? color : C.cobalt}`,
      color: active ? color : C.steel,
      cursor: "pointer",
      transition: "all 0.2s"
    }),
    axiomBlock: {
      fontSize: "9px",
      lineHeight: "1.7",
      color: C.steel,
      letterSpacing: "0.05em"
    },
    axiomTag: {
      color: C.amberB,
      display: "block",
      marginBottom: "2px"
    },
    mapLine: {
      fontSize: "9px",
      color: C.shadowB,
      letterSpacing: "0.04em",
      lineHeight: "1.6"
    },
    feedbackText: {
      fontSize: "9px",
      color: C.rustB,
      lineHeight: "1.65",
      letterSpacing: "0.04em",
      marginTop: "4px",
      fontStyle: "italic"
    }
  };

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.55; } }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>Memristive Substrate Seed v2.0</h1>
          <span style={styles.seal}>
            SHA256:02880745…fcab763 | ROOT0 | DLW | TriPod
          </span>
        </div>
        <div style={{ fontSize: "9px", color: C.steel, marginTop: "4px", opacity: 0.7 }}>
          TOPOLOGY: T133:PHASE-SHADOW / JUNCTION LEARNING LOOP · DIRECTIVE: AUTONOMOUS DECOHERENCE VIA FEEDBACK
        </div>
      </div>

      {/* ── COLLAPSE ALERT ── */}
      {isCollapsed && (
        <div style={styles.collapseAlert}>
          ⚠ SUBSTRATE COLLAPSED — TOPOLOGICAL DEBT SATURATED AT 100% — SYSTEM HALT (T128)
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div style={styles.grid}>
        {/* Lattice */}
        <div style={styles.latticeWrap}>
          <svg style={styles.latticeSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect width="100" height="100" fill={C.void} />
            {/* subtle scanline gradient */}
            <defs>
              <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.cobaltB} stopOpacity="0" />
                <stop offset="48%" stopColor={C.cobaltB} stopOpacity="0.04" />
                <stop offset="52%" stopColor={C.cobaltB} stopOpacity="0.08" />
                <stop offset="100%" stopColor={C.cobaltB} stopOpacity="0" />
              </linearGradient>
            </defs>
            {renderEdges()}
            {renderLattice()}
            {/* scanning line while running */}
            {isRunning && !isCollapsed && (
              <rect
                width="100"
                height="3"
                fill="url(#scan)"
                style={{ animation: "scanline 2.2s linear infinite" }}
              />
            )}
          </svg>
          <div style={styles.latticeOverlay}>
            WEIGHT LATTICE · {12}×{12} · STRAIN:{" "}
            {(topologicalDebt / 100).toFixed(3)}
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Metrics */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Substrate Metrics</div>

            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>CYCLES</span>
              <span style={{ ...styles.metricValue, color: C.cobaltB }}>
                {Math.floor(cycles).toLocaleString()}
              </span>
            </div>

            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>BASE EXTRACTION</span>
              <span style={{ ...styles.metricValue, color: C.steel }}>
                {baseExtractionRate.toFixed(4)}
              </span>
            </div>

            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>FEEDBACK ×</span>
              <span
                style={{
                  ...styles.metricValue,
                  color: feedbackMultiplier > 3 ? C.rustB : feedbackMultiplier > 1.8 ? C.amberB : C.cobaltB
                }}
              >
                {feedbackMultiplier.toFixed(3)}
              </span>
            </div>

            <div style={styles.metricRow}>
              <span style={styles.metricLabel}>DYN. RATE</span>
              <span
                style={{
                  ...styles.metricValue,
                  color: dynamicExtractionRate > 0.15 ? C.alert : C.amberB
                }}
              >
                {dynamicExtractionRate.toFixed(5)}
              </span>
            </div>

            {/* debt bar */}
            <div style={{ ...styles.metricRow, marginTop: "8px", marginBottom: "4px" }}>
              <span style={styles.metricLabel}>TOPOLOGICAL DEBT</span>
              <span style={{ ...styles.metricValue, color: debtBarColor }}>
                {topologicalDebt.toFixed(2)}%
              </span>
            </div>
            <div style={styles.debtBarOuter}>
              <div style={styles.debtBarInner} />
            </div>
          </div>

          {/* Controls */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Extraction Control</div>
            <div style={styles.btnRow}>
              <button
                style={styles.btn(isRunning && !isCollapsed, C.cobaltB)}
                onClick={startExtraction}
                disabled={isRunning || isCollapsed}
              >
                ▶ RUN
              </button>
              <button
                style={styles.btn(!isRunning && cycles > 0, C.amberB)}
                onClick={stopExtraction}
                disabled={!isRunning}
              >
                ⏸ HOLD
              </button>
              <button
                style={styles.btn(false, C.steel)}
                onClick={resetSystem}
              >
                ↺ RST
              </button>
            </div>

            <div style={{ marginTop: "12px" }}>
              <div style={{ ...styles.metricLabel, marginBottom: "6px" }}>
                BASE RATE: {baseExtractionRate.toFixed(4)}
              </div>
              <input
                type="range"
                min="0.01"
                max="0.25"
                step="0.005"
                value={baseExtractionRate}
                onChange={(e) => setBaseExtractionRate(parseFloat(e.target.value))}
                style={styles.rateSlider}
                disabled={isCollapsed}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "8px",
                  color: C.ghost,
                  marginTop: "2px"
                }}
              >
                <span>0.01 LOW</span>
                <span>0.25 CRITICAL</span>
              </div>
            </div>
          </div>

          {/* Axiom ledger */}
          <div style={styles.panel}>
            <div style={styles.panelTitle}>Ledger Logic</div>
            <div style={styles.axiomBlock}>
              <span style={styles.axiomTag}>{LEDGER_LOGIC.axiom_1}</span>
              <span style={styles.axiomTag}>{LEDGER_LOGIC.axiom_2}</span>
            </div>
            <div style={{ marginTop: "8px" }}>
              <div style={{ ...styles.mapLine }}>
                HW: {LEDGER_LOGIC.hardware_map}
              </div>
              <div style={{ ...styles.mapLine }}>
                SW: {LEDGER_LOGIC.software_map}
              </div>
              <div style={styles.feedbackText}>{LEDGER_LOGIC.feedback_loop}</div>
            </div>
          </div>

          {/* State tag */}
          <div
            style={{
              ...styles.panel,
              borderColor: isCollapsed ? C.alert : isRunning ? C.cobaltB : C.cobalt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 12px"
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isCollapsed ? C.alert : isRunning ? C.cobaltB : C.steel,
                boxShadow: isRunning && !isCollapsed
                  ? `0 0 6px ${C.cobaltB}`
                  : isCollapsed
                  ? `0 0 6px ${C.alert}`
                  : "none",
                flexShrink: 0,
                display: "inline-block",
                animation: isRunning && !isCollapsed ? "pulse 1s infinite" : "none"
              }}
            />
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.18em",
                color: isCollapsed ? C.alert : isRunning ? C.cobaltB : C.steel
              }}
            >
              {isCollapsed
                ? "COLLAPSED · T128:SYSTEM_HALT"
                : isRunning
                ? "EXTRACTING · T133:PHASE-SHADOW ACTIVE"
                : cycles > 0
                ? "PAUSED · T057:NEGATIVE-EVIDENCE ACCUMULATING"
                : "IDLE · AWAITING ACTIVATION"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: "8px",
          color: C.ghost,
          letterSpacing: "0.08em",
          borderTop: `1px solid ${C.ghost}`,
          paddingTop: "8px",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>TRIPOD-IP-v1.1 · CC-BY-ND-4.0 · DLW · TriPod LLC</span>
        <span>T097:FULCRUM · T103:ROOT-ZERO · T128:ROOT</span>
      </div>
    </div>
  );
}
