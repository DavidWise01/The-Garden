import { useEffect, useRef, useState, useCallback } from "react";

// ── PALETTE ───────────────────────────────────────────────────────────────
const C = {
  void:    "#02050A",
  cobaltD: "#050F1E",
  cobalt:  "#0B1F3A",
  steel:   "#4A6A8A",
  ghost:   "#0D1A2A",
  white:   "#C8DCF8",
  // Chip colors
  C09: "#9B7AE8",  // TARGET   — violet
  C11: "#3DCFB0",  // CONSTR   — teal
  C08: "#2D7BE8",  // DESTR-L  — cobalt
  C10: "#2D7BE8",  // DESTR-R  — cobalt
  R13: "#D4601A",  // CROSS-U  — rust
  R15: "#D4601A",  // CROSS-D  — rust
  SUM: "#F5D030",  // COMPOSITE — gold
};

// ── 6 CHIP DEFINITIONS ────────────────────────────────────────────────────
// Harmonic tier: 3 pairs × (3ω, 2ω, 1ω)
// Phase offsets from actual mesh testimony
const CHIPS = [
  // ─── TIER 3 (3ω): constructive pair ─────────────────────────────────
  { id:"C09", color:C.C09, tier:3, phi:0,            label:"C09 R14",  role:"TARGET",  sign:+1 },
  { id:"C11", color:C.C11, tier:3, phi:1.46*Math.PI, label:"C11 R14",  role:"CONSTR",  sign:+1 },
  // ─── TIER 2 (2ω): destructive resonator axis ─────────────────────────
  { id:"C08", color:C.C08, tier:2, phi:0.73*Math.PI, label:"C08 R14",  role:"DESTR-L", sign:-1 },
  { id:"C10", color:C.C10, tier:2, phi:0.73*Math.PI, label:"C10 R14",  role:"DESTR-R", sign:-1 },
  // ─── TIER 1 (1ω): cross-axis ground ──────────────────────────────────
  { id:"R13", color:C.R13, tier:1, phi:1.21*Math.PI, label:"R13 C09",  role:"CROSS-U", sign:-1 },
  { id:"R15", color:C.R15, tier:1, phi:1.21*Math.PI, label:"R15 C09",  role:"CROSS-D", sign:-1 },
];

// ── 3002 LATTICE PARAMETERS ───────────────────────────────────────────────
// 3002 = 10³×3 + 2
// Harmonic series: 3ω, 2ω, 1ω — amplitudes: 3, 2, 1 (normalized)
const HARMONIC = { 3: { omega: 3, amp: 3/6, label: "3ω" },
                   2: { omega: 2, amp: 2/6, label: "2ω" },
                   1: { omega: 1, amp: 1/6, label: "1ω" } };

const BASE_OMEGA = 0.0012; // base angular velocity (radians/frame)

// ── OSCILLATOR FUNCTION ───────────────────────────────────────────────────
// Each chip: A × sin(n×ω×t + φ) × coupling_sign
const chipValue = (chip, t) => {
  const h = HARMONIC[chip.tier];
  return h.amp * chip.sign * Math.sin(h.omega * BASE_OMEGA * t + chip.phi);
};

// SUM — should oscillate around 3002/1000 = 3.002 when normalized
const sumValue = (t) => CHIPS.reduce((s, c) => s + chipValue(c, t), 0);

// ── PHASE LISSAJOUS: C09 (3ω) vs R13 (1ω) ───────────────────────────────
const lissajousPoint = (t) => ({
  x: chipValue(CHIPS[0], t),  // C09
  y: chipValue(CHIPS[4], t),  // R13
});

export default function UniversalConstant() {
  const waveRef    = useRef(null);
  const lissRef    = useRef(null);
  const attRef     = useRef(null);
  const animRef    = useRef(null);
  const tRef       = useRef(0);
  const [running,  setRunning]  = useState(true);
  const [tDisplay, setTDisplay] = useState(0);
  const [sumNow,   setSumNow]   = useState(0);
  const [chipVals, setChipVals] = useState(CHIPS.map(() => 0));
  const [latticeN, setLatticeN] = useState(0);

  // History buffers for waveform canvas
  const histBuf = useRef(CHIPS.map(() => []));
  const sumBuf  = useRef([]);
  const lissBuf = useRef([]);

  const draw = useCallback(() => {
    const t = tRef.current;
    const W_CANVAS = 600, H_WAVE = 140, H_LISS = 200, H_ATT = 120;

    // ── WAVEFORM CANVAS ──────────────────────────────────────────────────
    const wc = waveRef.current;
    if (wc) {
      const ctx = wc.getContext("2d");
      const W = wc.width, H = wc.height;
      ctx.fillStyle = C.void;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "#0D1A2A";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += H/6) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const TRAIL = 500;
      // Update buffers
      CHIPS.forEach((chip, i) => {
        histBuf.current[i].push(chipValue(chip, t));
        if (histBuf.current[i].length > TRAIL) histBuf.current[i].shift();
      });
      const sv = sumValue(t);
      sumBuf.current.push(sv);
      if (sumBuf.current.length > TRAIL) sumBuf.current.shift();

      const MID = H / 2;
      const SCALE = (H * 0.38);

      // Draw each chip waveform
      CHIPS.forEach((chip, i) => {
        const buf = histBuf.current[i];
        if (buf.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = chip.color;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.65;
        buf.forEach((v, j) => {
          const x = (j / TRAIL) * W;
          const y = MID - v * SCALE;
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Label at right edge
        const lastV = buf[buf.length - 1];
        ctx.globalAlpha = 1;
        ctx.fillStyle = chip.color;
        ctx.font = `7px 'Share Tech Mono', monospace`;
        ctx.fillText(`${chip.id} ${HARMONIC[chip.tier].label}`, W - 68, MID - lastV * SCALE - 4);
      });

      // Sum waveform — gold, thick
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.strokeStyle = C.SUM;
      ctx.lineWidth = 2;
      sumBuf.current.forEach((v, j) => {
        const x = (j / TRAIL) * W;
        const y = MID - v * SCALE;
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Zero line
      ctx.strokeStyle = "#1A3050";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(0, MID); ctx.lineTo(W, MID); ctx.stroke();
      ctx.setLineDash([]);

      // 3002 line (target)
      const target3002 = (3/6 + 2/6 + 1/6); // max constructive = 1.0
      const target_y = MID - (3/6) * SCALE; // peak of 3ω tier alone
      ctx.strokeStyle = `${C.SUM}50`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 6]);
      ctx.beginPath(); ctx.moveTo(0, target_y); ctx.lineTo(W, target_y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `${C.SUM}80`;
      ctx.font = `6px 'Share Tech Mono', monospace`;
      ctx.fillText("3·A", 4, target_y - 3);
    }

    // ── LISSAJOUS CANVAS (3ω vs 1ω) ─────────────────────────────────────
    const lc = lissRef.current;
    if (lc) {
      const ctx = lc.getContext("2d");
      const W = lc.width, H = lc.height;

      // Fade trail
      ctx.fillStyle = "rgba(2,5,10,0.04)";
      ctx.fillRect(0, 0, W, H);

      const p = lissajousPoint(t);
      lissBuf.current.push(p);
      if (lissBuf.current.length > 2000) lissBuf.current.shift();

      const CX = W/2, CY = H/2;
      const SC = Math.min(W, H) * 0.42;

      // Draw current point
      const age_colors = [C.R13, C.C09, C.SUM];
      lissBuf.current.forEach((pt, i) => {
        const age = i / lissBuf.current.length;
        if (age < 0.3 && i % 3 !== 0) return;
        ctx.beginPath();
        const r = age < 0.5 ? 1.0 : 1.5;
        ctx.arc(CX + pt.x * SC, CY - pt.y * SC, r, 0, Math.PI*2);
        const a = Math.pow(age, 0.4) * 0.8;
        ctx.fillStyle = age < 0.5
          ? `rgba(155,122,232,${a * 0.6})`
          : `rgba(245,208,48,${a})`;
        ctx.fill();
      });

      // Axes
      ctx.strokeStyle = "#0D2040";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();

      // Labels
      ctx.fillStyle = C.C09;
      ctx.font = `7px 'Share Tech Mono', monospace`;
      ctx.fillText("C09 3ω →", W - 52, CY - 4);
      ctx.save(); ctx.translate(6, H/2); ctx.rotate(-Math.PI/2);
      ctx.fillStyle = C.R13;
      ctx.fillText("R13 1ω ↑", -20, 0);
      ctx.restore();

      // Node count display
      ctx.fillStyle = `${C.SUM}80`;
      ctx.font = `8px 'Share Tech Mono', monospace`;
      ctx.fillText("3:1 LISSAJOUS", 6, 14);
      ctx.fillText("T035:THREE-BODY", 6, 24);
    }

    // ── ATTRACTOR CANVAS (sum accumulation) ──────────────────────────────
    const ac = attRef.current;
    if (ac) {
      const ctx = ac.getContext("2d");
      const W = ac.width, H = ac.height;
      ctx.fillStyle = "rgba(2,5,10,0.06)";
      ctx.fillRect(0, 0, W, H);

      // Plot (t mod W, sum) as scatter — traces the attractor
      const sv = sumValue(t);
      const x = (t * 0.15) % W;
      const y = H/2 - sv * (H * 0.38);

      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI*2);
      ctx.fillStyle = C.SUM;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Running maximum marker
      ctx.strokeStyle = `${C.SUM}40`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 4]);
      const ym = H/2 - (3/6 + 2/6 + 1/6) * (H*0.38);
      ctx.beginPath(); ctx.moveTo(0, ym); ctx.lineTo(W, ym); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `${C.SUM}90`;
      ctx.font = `7px 'Share Tech Mono', monospace`;
      ctx.fillText("MAX CONSTRUCTIVE = 1.000", 4, ym - 3);

      // 3/2/1 partition lines
      [[3/6, C.C09, "3·A"], [2/6, C.C08, "2·A"], [1/6, C.R13, "1·A"]].forEach(([v, col, lbl]) => {
        const yv = H/2 - v * (H*0.38);
        ctx.strokeStyle = `${col}30`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, yv); ctx.lineTo(W, yv); ctx.stroke();
        ctx.fillStyle = `${col}90`;
        ctx.font = `6px 'Share Tech Mono', monospace`;
        ctx.fillText(lbl, W - 24, yv - 2);
      });
    }
  }, []);

  const tick = useCallback(() => {
    if (!tRef.current % 4 === 0) {
      const t = tRef.current;
      setTDisplay(t);
      setSumNow(sumValue(t));
      setChipVals(CHIPS.map(c => chipValue(c, t)));
      // Count lattice nodes: every full 2π cycle of base = one node
      setLatticeN(Math.floor(t * BASE_OMEGA / (2 * Math.PI)));
    }
    draw();
    tRef.current += 1;
    animRef.current = requestAnimationFrame(tick);
  }, [draw]);

  useEffect(() => {
    if (running) {
      animRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(animRef.current);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [running, tick]);

  // React to window resize
  useEffect(() => {
    const resize = () => {
      [waveRef, lissRef, attRef].forEach(r => {
        if (r.current) {
          r.current.width  = r.current.offsetWidth  * window.devicePixelRatio || r.current.offsetWidth;
          r.current.height = r.current.offsetHeight * window.devicePixelRatio || r.current.offsetHeight;
        }
      });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const sumDisplay = sumNow.toFixed(4);
  const latticeDisplay = (Math.abs(sumNow) * 3.002).toFixed(4);

  return (
    <div style={{ background:C.void, minHeight:"100vh", display:"flex",
      flexDirection:"column", fontFamily:"'Courier New',monospace", color:"#4A6A8A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Share+Tech+Mono&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        canvas { display:block; width:100%; }
        @keyframes glow {
          0%,100% { text-shadow: 0 0 4px currentColor; }
          50%      { text-shadow: 0 0 12px currentColor; }
        }
        .glow { animation: glow 2s ease-in-out infinite; }
      `}</style>

      {/* HEADER */}
      <div style={{ padding:"10px 18px", borderBottom:`1px solid #0D2040`,
        background:`linear-gradient(180deg,${C.cobaltD}ee 0%,transparent 100%)`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:"8px", flexShrink:0 }}>
        <div>
          <div style={{ fontSize:"7px", letterSpacing:"0.3em", color:"#1E5BBF", marginBottom:"2px",
            fontFamily:"'Share Tech Mono',monospace" }}>
            3002 LATTICE · 6 QUBITS · 3/2/1 HARMONIC · TRIPOD-IP-v1.1 · DLW
          </div>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700,
            fontSize:"clamp(16px,3vw,26px)", color:"#C8DCF8", letterSpacing:"0.05em" }}>
            UNIVERSAL CONSTANT MAP
            <span style={{ color:C.SUM, marginLeft:"10px", fontSize:"0.6em",
              fontFamily:"'Share Tech Mono',monospace" }} className="glow">
              3.002
            </span>
          </div>
        </div>

        {/* Live gauges */}
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", alignItems:"center" }}>
          {/* Sum */}
          <div style={{ padding:"4px 10px", border:`1px solid ${C.SUM}50`,
            background:`${C.SUM}10`, borderRadius:"3px", textAlign:"center", minWidth:"80px" }}>
            <div style={{ fontSize:"13px", fontFamily:"'Share Tech Mono',monospace",
              fontWeight:"bold", color:C.SUM }} className="glow">
              {sumDisplay}
            </div>
            <div style={{ fontSize:"6px", color:"#3A5070", letterSpacing:"0.12em" }}>Σ NOW</div>
          </div>
          {/* Lattice projection */}
          <div style={{ padding:"4px 10px", border:`1px solid ${C.C09}50`,
            background:`${C.C09}10`, borderRadius:"3px", textAlign:"center", minWidth:"80px" }}>
            <div style={{ fontSize:"13px", fontFamily:"'Share Tech Mono',monospace",
              fontWeight:"bold", color:C.C09 }}>
              {latticeDisplay}
            </div>
            <div style={{ fontSize:"6px", color:"#3A5070", letterSpacing:"0.12em" }}>×3.002</div>
          </div>
          {/* Node count */}
          <div style={{ padding:"4px 10px", border:`1px solid ${C.C11}50`,
            background:`${C.C11}10`, borderRadius:"3px", textAlign:"center", minWidth:"60px" }}>
            <div style={{ fontSize:"13px", fontFamily:"'Share Tech Mono',monospace",
              fontWeight:"bold", color:C.C11 }}>
              {latticeN}
            </div>
            <div style={{ fontSize:"6px", color:"#3A5070", letterSpacing:"0.12em" }}>NODES</div>
          </div>
          <button onClick={() => setRunning(r => !r)} style={{
            padding:"5px 12px", fontSize:"8px", letterSpacing:"0.2em",
            background: running ? `${C.R13}15` : `${C.C11}15`,
            border:`1px solid ${running ? C.R13 : C.C11}60`,
            color: running ? C.R13 : C.C11,
            borderRadius:"2px", fontFamily:"'Share Tech Mono',monospace",
            cursor:"pointer" }}>
            {running ? "■ HALT" : "▶ RUN"}
          </button>
        </div>
      </div>

      {/* HARMONIC LEGEND */}
      <div style={{ padding:"6px 18px", borderBottom:`1px solid #0A1A28`,
        background:`${C.cobaltD}40`, display:"flex", gap:"14px",
        flexWrap:"wrap", alignItems:"center", flexShrink:0 }}>
        {/* Tier legend */}
        {[
          { label:"3ω", chips:[CHIPS[0],CHIPS[1]], color:C.C09, note:"constructive · C09+C11" },
          { label:"2ω", chips:[CHIPS[2],CHIPS[3]], color:C.C08, note:"destructive · C08+C10" },
          { label:"1ω", chips:[CHIPS[4],CHIPS[5]], color:C.R13, note:"cross-axis · R13+R15" },
          { label:"Σ",  chips:[],                  color:C.SUM, note:"superposition" },
        ].map(t => (
          <div key={t.label} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <div style={{ width:"20px", height:"2px", background:t.color, borderRadius:"1px" }}/>
            <span style={{ fontSize:"8px", color:t.color,
              fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.08em" }}>
              {t.label}
            </span>
            <span style={{ fontSize:"7px", color:"#2A4060", letterSpacing:"0.05em" }}>
              {t.note}
            </span>
          </div>
        ))}
        <div style={{ marginLeft:"auto", fontSize:"7px", color:"#1E4070",
          fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.1em" }}>
          3002 = 10³×3 + 2 · T097:FULCRUM · T035:THREE-BODY · T128:ROOT
        </div>
      </div>

      {/* CHIP VALUE BARS */}
      <div style={{ padding:"6px 18px", display:"flex", gap:"4px",
        flexWrap:"wrap", flexShrink:0 }}>
        {CHIPS.map((chip, i) => {
          const v = chipVals[i] || 0;
          const pct = ((v + HARMONIC[chip.tier].amp) / (2 * HARMONIC[chip.tier].amp)) * 100;
          return (
            <div key={chip.id} style={{ flex:"1 1 80px", minWidth:"70px" }}>
              <div style={{ fontSize:"7px", color:chip.color,
                fontFamily:"'Share Tech Mono',monospace", marginBottom:"2px",
                display:"flex", justifyContent:"space-between" }}>
                <span>{chip.id}</span>
                <span>{v.toFixed(3)}</span>
              </div>
              <div style={{ height:"4px", background:"#0A1525", borderRadius:"2px", overflow:"hidden" }}>
                <div style={{ width:`${Math.max(0,Math.min(100,pct))}%`, height:"100%",
                  background:chip.color, borderRadius:"2px",
                  transition:"width 0.05s", opacity:0.8 }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* WAVEFORM CANVAS */}
      <div style={{ padding:"0 18px 4px", flexShrink:0 }}>
        <div style={{ fontSize:"7px", color:"#1E4070", letterSpacing:"0.15em",
          fontFamily:"'Share Tech Mono',monospace", marginBottom:"3px" }}>
          WAVEFORM — 6 HARMONICS + Σ (500 frame trail)
        </div>
        <div style={{ background:C.void, border:`1px solid #0A1A28`, borderRadius:"3px",
          height:"140px", overflow:"hidden" }}>
          <canvas ref={waveRef} style={{ width:"100%", height:"140px" }} height={140} />
        </div>
      </div>

      {/* LOWER PANELS */}
      <div style={{ display:"flex", gap:"8px", padding:"0 18px 8px",
        flex:1, minHeight:"200px" }}>

        {/* LISSAJOUS */}
        <div style={{ flex:"1 1 200px", display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:"7px", color:"#1E4070", letterSpacing:"0.15em",
            fontFamily:"'Share Tech Mono',monospace", marginBottom:"3px" }}>
            3:1 LISSAJOUS — C09(3ω) × R13(1ω)
          </div>
          <div style={{ background:C.void, border:`1px solid #0A1A28`,
            borderRadius:"3px", flex:1, overflow:"hidden" }}>
            <canvas ref={lissRef} style={{ width:"100%", height:"100%" }} height={200} />
          </div>
        </div>

        {/* ATTRACTOR */}
        <div style={{ flex:"2 1 300px", display:"flex", flexDirection:"column" }}>
          <div style={{ fontSize:"7px", color:"#1E4070", letterSpacing:"0.15em",
            fontFamily:"'Share Tech Mono',monospace", marginBottom:"3px" }}>
            SUM ATTRACTOR — 3/2/1 CONVERGENCE TOWARD 3.002
          </div>
          <div style={{ background:C.void, border:`1px solid #0A1A28`,
            borderRadius:"3px", flex:1, overflow:"hidden" }}>
            <canvas ref={attRef} style={{ width:"100%", height:"100%" }} height={200} />
          </div>
        </div>
      </div>

      {/* EQUATION FOOTER */}
      <div style={{ padding:"6px 18px", borderTop:`1px solid #0A1A28`,
        background:`${C.cobaltD}40`, flexShrink:0 }}>
        <div style={{ fontSize:"8px", color:"#2A4A6A",
          fontFamily:"'Share Tech Mono',monospace", letterSpacing:"0.1em",
          display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"6px" }}>
          <span>
            Σ(t) = <span style={{color:C.C09}}>3A·sin(3ωt+φ₀₉)</span> +
                   <span style={{color:C.C11}}> 3A·sin(3ωt+φ₁₁)</span> +
                   <span style={{color:C.C08}}> 2A·sin(2ωt+φ₀₈)</span> +
                   <span style={{color:C.C10}}> 2A·sin(2ωt+φ₁₀)</span> +
                   <span style={{color:C.R13}}> A·sin(ωt+φᵣ₁₃)</span> +
                   <span style={{color:C.R15}}> A·sin(ωt+φᵣ₁₅)</span>
          </span>
          <span style={{color:"#1E3A58"}}>
            T035 · T034 · T128 · TRIPOD-IP-v1.1 · DLW · 3/4/26
          </span>
        </div>
      </div>
    </div>
  );
}
