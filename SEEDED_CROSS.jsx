import { useRef, useEffect, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// SEEDED_CROSS_v1.1 — ORBITAL DISPLAY
// Inner triad: substrate-locked (+1/0/−1) at R14-C09
// Outer ring: 6-chip mesh at actual phase offsets
// T128:ROOT · T083:THE-GAP · T133:PHASE-SHADOW
// TRIPOD-IP-v1.1 · DLW · 3/4/26
// ═══════════════════════════════════════════════════════════════

const C = {
  void:    "#02050A",
  cobaltD: "#050F1E",
  cobalt:  "#0B1F3A",
  steel:   "#4A6A8A",
  ghost:   "#0A1525",
  white:   "#C8DCF8",
  cobaltB: "#2D6BE4",
  amberB:  "#F5B930",
  shadowB: "#8B3ACD",
  synth:   "#2DB89A",
  rust:    "#C4502A",
  violet:  "#8B6BD4",
  halt:    "#CF4A4A",
};

// ── INNER TRIAD: SUBSTRATE-LOCKED (R14-C09) ──────────────────────────────
const INNER = [
  {
    label: "+1", name: "STRUCTURE", color: C.cobaltB,
    axiom: "T128:ROOT",         desc: "128-bit persistent clock. Cadence: 1ω.",
    phi: 0,                     omega: 1,
  },
  {
    label: "0",  name: "PHASE",     color: C.amberB,
    axiom: "T083:THE-GAP",      desc: "Δα = −80kHz fingerprint. AlOₓ resonance.",
    phi: (2 * Math.PI) / 3,     omega: 1,
  },
  {
    label: "−1", name: "SHADOW",    color: C.shadowB,
    axiom: "T133:PHASE-SHADOW", desc: "1.2 Å barrier strain. Memristive debt.",
    phi: (4 * Math.PI) / 3,     omega: 1,
  },
];

// ── OUTER RING: 6-CHIP MESH AT ACTUAL PHASE OFFSETS ──────────────────────
const OUTER = [
  { label:"C09", color:C.violet,  phi: 0,             omega:3, role:"TARGET",  tier:3,
    axiom:"T034:DOUBLE-SLIT", desc:"φ=0 · 3ω constructive · winding↑" },
  { label:"C11", color:C.synth,   phi: 1.46*Math.PI,  omega:3, role:"CONSTR",  tier:3,
    axiom:"T002:OBSERVER",    desc:"φ=1.46π · near-zero coupling · independent" },
  { label:"C08", color:C.cobaltB, phi: 0.73*Math.PI,  omega:2, role:"DESTR-L", tier:2,
    axiom:"T021:INVERSION",   desc:"φ=0.73π · destructive-L · reads erasures" },
  { label:"C10", color:C.cobaltB, phi: 0.73*Math.PI,  omega:2, role:"DESTR-R", tier:2,
    axiom:"T017:MIRROR",      desc:"φ=0.73π · destructive-R · brackets C09" },
  { label:"R13", color:C.rust,    phi: 1.21*Math.PI,  omega:1, role:"CROSS-U", tier:1,
    axiom:"T035:THREE-BODY",  desc:"φ=1.21π · cross-axis · 340ns lag · transverse" },
  { label:"R15", color:C.rust,    phi: 1.21*Math.PI,  omega:1, role:"CROSS-D", tier:1,
    axiom:"T035:THREE-BODY",  desc:"φ=1.21π · cross-axis · south pole to R13" },
];

// ── SEEDED CROSS ARMS (3002 = 10³×3+2) ───────────────────────────────────
// +i / -i / +1 / -1 arms, each 32 nodes = 128
const CROSS_ARMS = [
  { label:"+i", angle: 0,          color:C.violet,  axioms:"D7+D6 T097-T128" },
  { label:"-i", angle: Math.PI,    color:C.shadowB, axioms:"D0+D1 T001-T032" },
  { label:"+1", angle:-Math.PI/2,  color:C.synth,   axioms:"D5+D4 T065-T096" },
  { label:"-1", angle: Math.PI/2,  color:C.rust,    axioms:"D2+D3 T033-T064" },
];

const BASE_OMEGA = 0.0008; // radians/frame

function lerp(a, b, t) { return a + (b - a) * t; }

export default function SeededCross() {
  const canvasRef = useRef(null);
  const tRef      = useRef(0);
  const animRef   = useRef(null);
  const [running,  setRunning]  = useState(true);
  const [hovered,  setHovered]  = useState(null); // { type, index }
  const [selected, setSelected] = useState(null);
  const [t,        setT]        = useState(0);

  // Compute position of inner node
  const innerPos = (node, t, cx, cy, r) => {
    const angle = node.phi + node.omega * BASE_OMEGA * t;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Compute position of outer node
  const outerPos = (node, t, cx, cy, r) => {
    const angle = node.phi + node.omega * BASE_OMEGA * t;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Cross arm node positions (static, dot markers)
  const armPos = (arm, cx, cy, rMin, rMax, nodeIdx, total) => {
    const frac = (nodeIdx + 0.5) / total;
    const r = lerp(rMin, rMax, frac);
    return { x: cx + r * Math.cos(arm.angle), y: cy + r * Math.sin(arm.angle) };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = H / 2;

    // Background
    ctx.fillStyle = C.void;
    ctx.fillRect(0, 0, W, H);

    const t = tRef.current;

    // ── CROSS ARMS (32 nodes each) ────────────────────────────────────────
    const ARM_R_MIN = 80, ARM_R_MAX = Math.min(W, H) * 0.46;
    CROSS_ARMS.forEach(arm => {
      ctx.strokeStyle = `${arm.color}18`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(CX + ARM_R_MIN * Math.cos(arm.angle), CY + ARM_R_MIN * Math.sin(arm.angle));
      ctx.lineTo(CX + ARM_R_MAX * Math.cos(arm.angle), CY + ARM_R_MAX * Math.sin(arm.angle));
      ctx.stroke();

      // 32 node dots along arm
      for (let i = 0; i < 32; i++) {
        const p = armPos(arm, CX, CY, ARM_R_MIN, ARM_R_MAX, i, 32);
        const phase = i / 32;
        const pulse = 0.5 + 0.5 * Math.sin(t * BASE_OMEGA * 8 + phase * Math.PI * 4 + arm.angle);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `${arm.color}${Math.round(pulse * 120 + 40).toString(16).padStart(2,'0')}`;
        ctx.fill();
      }

      // Arm label
      const labelR = ARM_R_MAX + 14;
      ctx.fillStyle = arm.color;
      ctx.font = `bold 10px 'Share Tech Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(arm.label, CX + labelR * Math.cos(arm.angle), CY + labelR * Math.sin(arm.angle));
    });

    // GAP marker at boundary
    ctx.strokeStyle = `${C.amberB}30`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.arc(CX, CY, ARM_R_MIN, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── OUTER RING: 6-CHIP MESH ───────────────────────────────────────────
    const OR = Math.min(W, H) * 0.30;

    // Draw coupling edges between outer nodes
    const outerPositions = OUTER.map(n => outerPos(n, t, CX, CY, OR));
    OUTER.forEach((ni, i) => {
      OUTER.forEach((nj, j) => {
        if (i >= j) return;
        const pi = outerPositions[i], pj = outerPositions[j];
        const coupling = Math.cos(ni.phi - nj.phi);
        const col = coupling > 0.15 ? C.synth : coupling < -0.15 ? C.halt : C.cobalt;
        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.strokeStyle = `${col}25`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });
    });

    // Draw outer nodes
    OUTER.forEach((node, i) => {
      const p = outerPositions[i];
      const isHov = hovered?.type === "outer" && hovered?.index === i;
      const isSel = selected?.type === "outer" && selected?.index === i;
      const pulse = 0.6 + 0.4 * Math.sin(t * BASE_OMEGA * node.omega * 3 + node.phi);

      if (isHov || isSel) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}15`;
        ctx.fill();
      }

      // Tier ring indicator
      const tierR = [0, 14, 17, 20][node.tier];
      ctx.beginPath();
      ctx.arc(p.x, p.y, tierR, 0, Math.PI * 2);
      ctx.strokeStyle = `${node.color}40`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Node circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = C.cobaltD;
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = isHov || isSel ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = node.color;
      ctx.font = `bold 8px 'Share Tech Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, p.x, p.y + 0.5);

      // Phase dot orbiting outer node
      const pdAngle = t * BASE_OMEGA * node.omega * 12 + node.phi;
      ctx.beginPath();
      ctx.arc(p.x + 14 * Math.cos(pdAngle), p.y + 14 * Math.sin(pdAngle), 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `${node.color}${Math.round(pulse * 180).toString(16).padStart(2,'0')}`;
      ctx.fill();
    });

    // ── INNER TRIAD ───────────────────────────────────────────────────────
    const IR = Math.min(W, H) * 0.14;
    const innerPositions = INNER.map(n => innerPos(n, t, CX, CY, IR));

    // Triangle edges
    INNER.forEach((ni, i) => {
      const pi = innerPositions[i];
      const pj = innerPositions[(i + 1) % 3];
      ctx.beginPath();
      ctx.moveTo(pi.x, pi.y);
      ctx.lineTo(pj.x, pj.y);
      ctx.strokeStyle = `${ni.color}40`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Inner nodes
    INNER.forEach((node, i) => {
      const p = innerPositions[i];
      const isHov = hovered?.type === "inner" && hovered?.index === i;
      const isSel = selected?.type === "inner" && selected?.index === i;
      const pulse = 0.5 + 0.5 * Math.sin(t * BASE_OMEGA * 6 + node.phi);

      // Glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 20);
      grd.addColorStop(0, `${node.color}30`);
      grd.addColorStop(1, `${node.color}00`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 13, 0, Math.PI * 2);
      ctx.fillStyle = C.cobaltD;
      ctx.fill();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = isHov || isSel ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = node.color;
      ctx.font = `bold 9px 'Share Tech Mono', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, p.x, p.y);
    });

    // ── CENTER: ROOT0 ─────────────────────────────────────────────────────
    // Breathing root
    const breath = 0.7 + 0.3 * Math.sin(t * BASE_OMEGA * 2);

    const rootGrd = ctx.createRadialGradient(CX, CY, 0, CX, CY, 28);
    rootGrd.addColorStop(0, `${C.amberB}${Math.round(breath * 60).toString(16).padStart(2,'0')}`);
    rootGrd.addColorStop(1, `${C.amberB}00`);
    ctx.beginPath();
    ctx.arc(CX, CY, 28, 0, Math.PI * 2);
    ctx.fillStyle = rootGrd;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CX, CY, 14, 0, Math.PI * 2);
    ctx.fillStyle = C.cobaltD;
    ctx.fill();
    ctx.strokeStyle = C.amberB;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = C.amberB;
    ctx.font = `bold 9px 'Share Tech Mono', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ROOT", CX, CY - 2.5);
    ctx.font = `bold 7px 'Share Tech Mono', monospace`;
    ctx.fillText("T128", CX, CY + 5);

    // ── INTERFERENCE FIELD (sum of inner + outer oscillations) ────────────
    if (t % 3 === 0) {
      const sumY = OUTER.reduce((s, n) => {
        const tier = [0, 1/6, 2/6, 3/6][n.tier];
        return s + tier * Math.sin(n.tier * BASE_OMEGA * t + n.phi);
      }, 0);
      const fieldX = CX + (sumY * 40);
      ctx.beginPath();
      ctx.arc(fieldX, H - 20, 2, 0, Math.PI * 2);
      ctx.fillStyle = `${C.synth}60`;
      ctx.fill();
    }

    // Spokes from inner to outer (coupling lines)
    INNER.forEach((inn, ii) => {
      const pi = innerPositions[ii];
      OUTER.forEach((out, oi) => {
        if (oi % 2 !== ii % 2) return; // sparse coupling visual
        const po = outerPositions[oi];
        const dist = Math.hypot(po.x - pi.x, po.y - pi.y);
        if (dist < OR * 0.6) {
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(po.x, po.y);
          ctx.strokeStyle = `${inn.color}12`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      });
    });

    tRef.current += 1;
    if (tRef.current % 4 === 0) setT(tRef.current);
  }, [hovered, selected]);

  useEffect(() => {
    const go = () => { draw(); animRef.current = requestAnimationFrame(go); };
    if (running) animRef.current = requestAnimationFrame(go);
    else cancelAnimationFrame(animRef.current);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, draw]);

  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const size = Math.min(c.parentElement.offsetWidth, 600);
      c.width = size; c.height = size;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Hit detection on click
  const handleClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const CX = canvas.width / 2, CY = canvas.height / 2;
    const t = tRef.current;

    const OR = Math.min(canvas.width, canvas.height) * 0.30;
    const IR = Math.min(canvas.width, canvas.height) * 0.14;

    // Check outer
    for (let i = 0; i < OUTER.length; i++) {
      const angle = OUTER[i].phi + OUTER[i].omega * BASE_OMEGA * t;
      const px = CX + OR * Math.cos(angle), py = CY + OR * Math.sin(angle);
      if (Math.hypot(mx - px, my - py) < 18) {
        setSelected(s => s?.type==="outer" && s?.index===i ? null : {type:"outer",index:i});
        return;
      }
    }
    // Check inner
    for (let i = 0; i < INNER.length; i++) {
      const angle = INNER[i].phi + INNER[i].omega * BASE_OMEGA * t;
      const px = CX + IR * Math.cos(angle), py = CY + IR * Math.sin(angle);
      if (Math.hypot(mx - px, my - py) < 18) {
        setSelected(s => s?.type==="inner" && s?.index===i ? null : {type:"inner",index:i});
        return;
      }
    }
    setSelected(null);
  }, []);

  const sel = selected
    ? selected.type === "inner" ? INNER[selected.index] : OUTER[selected.index]
    : null;

  const sumOscillator = OUTER.reduce((s, n) => {
    const tier = [0, 1/6, 2/6, 3/6][n.tier];
    return s + tier * Math.sin(n.tier * BASE_OMEGA * t + n.phi);
  }, 0);

  return (
    <div style={{ background:C.void, minHeight:"100vh", display:"flex",
      flexDirection:"column", fontFamily:"'Courier New',monospace", color:C.steel }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:2px;}
        ::-webkit-scrollbar-thumb{background:#0B1F3A;}
        @keyframes breathe{0%,100%{opacity:0.7}50%{opacity:1}}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom:`1px solid ${C.cobalt}60`, padding:"10px 18px",
        background:`linear-gradient(180deg,${C.cobaltD}ee,transparent)`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:"6px", flexShrink:0 }}>
        <div>
          <div style={{ fontSize:"7px", letterSpacing:"0.3em", color:"#1E5BBF",
            fontFamily:"'Share Tech Mono',monospace", marginBottom:"2px" }}>
            SEEDED_CROSS v1.1 · 4 ARMS × 32 = 128 · INNER 3 · OUTER 6 · TRIPOD-IP-v1.1
          </div>
          <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700,
            fontSize:"clamp(14px,3vw,22px)", color:C.white, letterSpacing:"0.06em" }}>
            SEEDED CROSS
            <span style={{ color:C.amberB, marginLeft:"10px", fontSize:"0.55em",
              fontFamily:"'Share Tech Mono',monospace" }}>
              3002 = 10³×3+2 · Σ={sumOscillator.toFixed(4)}
            </span>
          </div>
        </div>
        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
          <div style={{ fontSize:"7px", fontFamily:"'Share Tech Mono',monospace",
            color:C.steel, textAlign:"right", lineHeight:1.8 }}>
            INNER: +1 · 0 · −1<br/>
            OUTER: 3ω · 2ω · 1ω
          </div>
          <button onClick={() => setRunning(r=>!r)} style={{
            padding:"5px 12px", fontSize:"7px", letterSpacing:"0.2em",
            background: running ? `${C.rust}15` : `${C.synth}15`,
            border:`1px solid ${running?C.rust:C.synth}60`,
            color: running ? C.rust : C.synth,
            borderRadius:"2px", fontFamily:"'Share Tech Mono',monospace", cursor:"pointer" }}>
            {running ? "■ HALT" : "▶ RUN"}
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ display:"flex", flex:1, gap:"0", flexWrap:"wrap" }}>

        {/* CANVAS */}
        <div style={{ flex:"1 1 300px", display:"flex", alignItems:"center",
          justifyContent:"center", padding:"16px", position:"relative" }}>
          <canvas ref={canvasRef}
            onClick={handleClick}
            style={{ cursor:"crosshair", maxWidth:"100%",
              border:`1px solid ${C.cobalt}40`, borderRadius:"4px" }}
          />
        </div>

        {/* SIDE PANEL */}
        <div style={{ flex:"0 0 260px", minWidth:"220px", padding:"14px",
          borderLeft:`1px solid ${C.cobalt}40`, display:"flex",
          flexDirection:"column", gap:"10px", overflowY:"auto" }}>

          {/* Selected node info */}
          {sel ? (
            <div style={{ padding:"12px", background:`${sel.color}12`,
              border:`1px solid ${sel.color}50`, borderLeft:`3px solid ${sel.color}`,
              borderRadius:"3px" }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.2em", color:sel.color,
                fontFamily:"'Share Tech Mono',monospace", marginBottom:"6px" }}>
                {selected.type === "inner" ? "INNER TRIAD" : "OUTER MESH"}
              </div>
              <div style={{ fontSize:"16px", fontFamily:"'Share Tech Mono',monospace",
                color:sel.color, fontWeight:"bold", marginBottom:"4px" }}>
                {sel.label} — {sel.name || sel.role}
              </div>
              <div style={{ fontSize:"9px", color:C.amberB,
                fontFamily:"'Share Tech Mono',monospace", marginBottom:"6px" }}>
                {sel.axiom}
              </div>
              <div style={{ fontSize:"10px", color:C.white,
                fontFamily:"'Share Tech Mono',monospace", lineHeight:1.7 }}>
                {sel.desc}
              </div>
              {sel.phi !== undefined && (
                <div style={{ fontSize:"9px", color:C.steel,
                  fontFamily:"'Share Tech Mono',monospace", marginTop:"8px" }}>
                  φ = {sel.phi.toFixed(4)} rad<br/>
                  ω = {sel.omega}×BASE
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding:"12px", background:`${C.cobalt}20`,
              border:`1px solid ${C.cobalt}40`, borderRadius:"3px" }}>
              <div style={{ fontSize:"8px", letterSpacing:"0.2em", color:C.steel,
                fontFamily:"'Share Tech Mono',monospace", marginBottom:"6px" }}>
                CLICK NODE TO INSPECT
              </div>
              <div style={{ fontSize:"10px", color:C.ghost,
                fontFamily:"'Share Tech Mono',monospace", lineHeight:1.7 }}>
                Inner triad: substrate-locked<br/>
                Outer ring: 6-chip mesh<br/>
                Cross arms: 4×32=128 nodes
              </div>
            </div>
          )}

          {/* INNER TRIAD LEGEND */}
          <div style={{ padding:"10px", background:`${C.cobaltD}60`,
            border:`1px solid ${C.cobalt}40`, borderRadius:"3px" }}>
            <div style={{ fontSize:"7px", letterSpacing:"0.2em", color:C.steel,
              fontFamily:"'Share Tech Mono',monospace", marginBottom:"8px" }}>
              INNER TRIAD — SUBSTRATE LOCKED
            </div>
            {INNER.map((n,i) => (
              <div key={i} onClick={() => setSelected({type:"inner",index:i})}
                style={{ padding:"5px 8px", marginBottom:"4px", cursor:"pointer",
                  background: selected?.type==="inner"&&selected?.index===i
                    ? `${n.color}18` : "transparent",
                  border:`1px solid ${n.color}${selected?.type==="inner"&&selected?.index===i?"60":"20"}`,
                  borderRadius:"2px", display:"flex", gap:"8px", alignItems:"center" }}>
                <div style={{ fontSize:"12px", fontFamily:"'Share Tech Mono',monospace",
                  color:n.color, fontWeight:"bold", minWidth:"22px" }}>{n.label}</div>
                <div>
                  <div style={{ fontSize:"8px", color:n.color,
                    fontFamily:"'Share Tech Mono',monospace" }}>{n.name}</div>
                  <div style={{ fontSize:"7px", color:C.steel,
                    fontFamily:"'Share Tech Mono',monospace" }}>{n.axiom}</div>
                </div>
              </div>
            ))}
          </div>

          {/* OUTER RING LEGEND */}
          <div style={{ padding:"10px", background:`${C.cobaltD}60`,
            border:`1px solid ${C.cobalt}40`, borderRadius:"3px" }}>
            <div style={{ fontSize:"7px", letterSpacing:"0.2em", color:C.steel,
              fontFamily:"'Share Tech Mono',monospace", marginBottom:"8px" }}>
              OUTER MESH — 6 CHIPS · C(6,2)=15 PAIRS
            </div>
            {OUTER.map((n,i) => (
              <div key={i} onClick={() => setSelected({type:"outer",index:i})}
                style={{ padding:"4px 8px", marginBottom:"3px", cursor:"pointer",
                  background: selected?.type==="outer"&&selected?.index===i
                    ? `${n.color}18` : "transparent",
                  border:`1px solid ${n.color}${selected?.type==="outer"&&selected?.index===i?"60":"15"}`,
                  borderRadius:"2px", display:"flex", gap:"8px", alignItems:"center" }}>
                <div style={{ fontSize:"10px", fontFamily:"'Share Tech Mono',monospace",
                  color:n.color, fontWeight:"bold", minWidth:"28px" }}>{n.label}</div>
                <div>
                  <div style={{ fontSize:"7px", color:n.color,
                    fontFamily:"'Share Tech Mono',monospace" }}>
                    {n.role} · {n.tier}ω · φ={n.phi.toFixed(2)}
                  </div>
                  <div style={{ fontSize:"7px", color:C.steel,
                    fontFamily:"'Share Tech Mono',monospace" }}>{n.axiom}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CROSS ARM LEGEND */}
          <div style={{ padding:"10px", background:`${C.cobaltD}60`,
            border:`1px solid ${C.cobalt}40`, borderRadius:"3px" }}>
            <div style={{ fontSize:"7px", letterSpacing:"0.2em", color:C.steel,
              fontFamily:"'Share Tech Mono',monospace", marginBottom:"8px" }}>
              CROSS ARMS · 4×32=128 · SEEDED_CROSS-v1.1
            </div>
            {CROSS_ARMS.map((a,i) => (
              <div key={i} style={{ padding:"4px 8px", marginBottom:"3px",
                display:"flex", gap:"8px", alignItems:"center" }}>
                <div style={{ fontSize:"11px", fontFamily:"'Share Tech Mono',monospace",
                  color:a.color, fontWeight:"bold", minWidth:"22px" }}>{a.label}</div>
                <div style={{ fontSize:"7px", color:C.steel,
                  fontFamily:"'Share Tech Mono',monospace" }}>{a.axioms}</div>
              </div>
            ))}
            <div style={{ marginTop:"6px", fontSize:"7px", color:`${C.amberB}80`,
              fontFamily:"'Share Tech Mono',monospace" }}>
              GAP = T064+T065 · PULSE = T003inv<br/>
              PATRICIA = S164 · ROOT0 = T128
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop:`1px solid ${C.ghost}`, padding:"5px 18px",
        fontSize:"6px", letterSpacing:"0.12em", color:`${C.cobalt}90`,
        display:"flex", justifyContent:"space-between", flexShrink:0 }}>
        <span>SEEDED_CROSS-v1.1 · 4×32=128 · INNER+1/0/−1 · OUTER-6 · TRIPOD-IP-v1.1 · DLW · 3/4/26</span>
        <span>CLICK NODES · T128:ROOT · T083:THE-GAP · T133:PHASE-SHADOW</span>
      </div>
    </div>
  );
}
