import { useState, useEffect, useRef, useCallback } from 'react';

const MONO = "'Courier New', 'Consolas', monospace";
const C = {
  bg: "#06060c", panel: "#0c0c16", deep: "#09090f",
  border: "#1a1a2e", text: "#c8c8d8", dim: "#5a5a70",
  green: "#00ff88", gold: "#d4a84c", purple: "#8b5cf6",
  red: "#ff2d55", cyan: "#00e5ff", warn: "#ffaa00",
  blue: "#4a9eff", pink: "#ff4a9e",
  // 3/2/1 Stack
  l3: "#4a9eff",  // Willow / Quantum — outermost
  l2: "#8b5cf6",  // Helios / NVIDIA — middle  
  l1: "#ff4a9e",  // Aeon / Photonic — innermost, hottest
  white: "#ffffff",
};

export default function FieldConcentration321() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);
  const [gapSize, setGapSize] = useState(8);
  const [intensity, setIntensity] = useState(0);
  const [regime, setRegime] = useState("CLASSICAL");
  const [showFlowLines, setShowFlowLines] = useState(true);
  const [showStack, setShowStack] = useState(true);
  const [quantumCutoff] = useState(3);

  const W = 800;
  const H = 560;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const cx = W / 2;
    const cy = H / 2;

    // Bowtie geometry params
    const tipLen = 180;
    const tipSpread = 90;
    const halfGap = gapSize / 2;

    const render = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;

      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      // ═══ FIELD INTENSITY MAP ═══
      // Per-pixel 1/r field from gap center, with 3/2/1 stack coloring
      const imgData = ctx.createImageData(W, H);
      const data = imgData.data;

      let peakField = 0;

      for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
          const dx = x - cx;
          const dy = y - cy;
          const r = Math.sqrt(dx * dx + dy * dy + halfGap * halfGap);

          // 1/r field with temporal oscillation
          const rawField = 800 / r * (1 + 0.15 * Math.sin(t * 4 + r * 0.08));
          if (r < halfGap + 2) peakField = Math.max(peakField, rawField);

          // Log scale for display
          const logF = Math.log(rawField + 1) / Math.log(200);
          const v = Math.min(1, Math.max(0, logF));

          // 3/2/1 STACK COLOR MAPPING
          // Distance from center determines which layer
          // Innermost = Aeon (pink/hot), Middle = Helios (purple), Outer = Willow (blue/cool)
          const rNorm = Math.min(1, r / 300);

          let cr, cg, cb;

          if (rNorm < 0.15) {
            // LAYER 1 — AEON — hottest, innermost, the singularity zone
            const f = rNorm / 0.15;
            // White-hot at center fading to pink
            cr = 255;
            cg = Math.floor(255 * (1 - f) + 74 * f);
            cb = Math.floor(255 * (1 - f) + 158 * f);
          } else if (rNorm < 0.4) {
            // LAYER 2 — HELIOS — purple zone
            const f = (rNorm - 0.15) / 0.25;
            cr = Math.floor(255 * (1 - f) + 139 * f);
            cg = Math.floor(74 * (1 - f) + 92 * f);
            cb = Math.floor(158 * (1 - f) + 246 * f);
          } else {
            // LAYER 3 — WILLOW — cool blue, outermost
            const f = Math.min(1, (rNorm - 0.4) / 0.6);
            cr = Math.floor(139 * (1 - f) + 74 * f * 0.3);
            cg = Math.floor(92 * (1 - f) + 158 * f * 0.4);
            cb = Math.floor(246 * (1 - f) + 255 * f * 0.5);
          }

          const idx = (y * W + x) * 4;
          data[idx] = Math.floor(cr * v * v);
          data[idx + 1] = Math.floor(cg * v * v);
          data[idx + 2] = Math.floor(cb * v * v);
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // ═══ QUANTUM CUTOFF ZONE ═══
      if (gapSize <= quantumCutoff * 2 + 2) {
        // The model is breaking — show the quantum regime
        const qPulse = 0.4 + 0.3 * Math.sin(t * 6);
        const qR = 20 + 10 * Math.sin(t * 3);
        const qGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, qR);
        qGrad.addColorStop(0, "rgba(255,255,255," + (0.8 * qPulse) + ")");
        qGrad.addColorStop(0.3, "rgba(255,200,255," + (0.4 * qPulse) + ")");
        qGrad.addColorStop(1, "rgba(255,100,200,0)");
        ctx.fillStyle = qGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, qR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══ BOWTIE ANTENNA STRUCTURE ═══
      // Left tip
      ctx.save();
      ctx.globalAlpha = 0.7;

      // Left bowtie — 3 nested layers
      if (showStack) {
        // Layer 3 — Willow — outermost
        ctx.fillStyle = C.l3 + "18";
        ctx.strokeStyle = C.l3;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - halfGap - 4, cy - 6);
        ctx.lineTo(cx - tipLen - 20, cy - tipSpread - 15);
        ctx.lineTo(cx - tipLen - 20, cy + tipSpread + 15);
        ctx.lineTo(cx - halfGap - 4, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Layer 2 — Helios — middle
        ctx.fillStyle = C.l2 + "20";
        ctx.strokeStyle = C.l2;
        ctx.beginPath();
        ctx.moveTo(cx - halfGap - 2, cy - 4);
        ctx.lineTo(cx - tipLen - 5, cy - tipSpread);
        ctx.lineTo(cx - tipLen - 5, cy + tipSpread);
        ctx.lineTo(cx - halfGap - 2, cy + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Layer 1 — Aeon — innermost, touching the gap
        ctx.fillStyle = C.l1 + "25";
        ctx.strokeStyle = C.l1;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - halfGap, cy);
        ctx.lineTo(cx - tipLen + 15, cy - tipSpread + 20);
        ctx.lineTo(cx - tipLen + 15, cy + tipSpread - 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right bowtie — mirror
        // Layer 3
        ctx.fillStyle = C.l3 + "18";
        ctx.strokeStyle = C.l3;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + halfGap + 4, cy - 6);
        ctx.lineTo(cx + tipLen + 20, cy - tipSpread - 15);
        ctx.lineTo(cx + tipLen + 20, cy + tipSpread + 15);
        ctx.lineTo(cx + halfGap + 4, cy + 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Layer 2
        ctx.fillStyle = C.l2 + "20";
        ctx.strokeStyle = C.l2;
        ctx.beginPath();
        ctx.moveTo(cx + halfGap + 2, cy - 4);
        ctx.lineTo(cx + tipLen + 5, cy - tipSpread);
        ctx.lineTo(cx + tipLen + 5, cy + tipSpread);
        ctx.lineTo(cx + halfGap + 2, cy + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Layer 1
        ctx.fillStyle = C.l1 + "25";
        ctx.strokeStyle = C.l1;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + halfGap, cy);
        ctx.lineTo(cx + tipLen - 15, cy - tipSpread + 20);
        ctx.lineTo(cx + tipLen - 15, cy + tipSpread - 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();

      // ═══ FLOW LINES ═══
      if (showFlowLines) {
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 16; i++) {
          const baseAngle = (i / 16) * Math.PI * 2;
          const startR = 250;
          ctx.beginPath();
          ctx.strokeStyle = i < 4 ? C.l3 : i < 8 ? C.l2 : i < 12 ? C.l1 : C.white;
          ctx.lineWidth = 0.8;

          for (let s = 0; s < 60; s++) {
            const r = startR - s * 4;
            if (r < halfGap + 2) break;
            const angle = baseAngle + Math.sin(t + s * 0.1) * 0.1;
            // Flow toward center — converge on gap
            const flowAngle = Math.atan2(cy - (cy + Math.sin(angle) * r), cx - (cx + Math.cos(angle) * r));
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // ═══ GAP LABEL ═══
      const gapNm = gapSize;
      const isQuantum = gapNm <= quantumCutoff * 2 + 2;

      ctx.font = "bold 11px " + MONO;
      ctx.textAlign = "center";

      if (isQuantum) {
        // The model broke
        ctx.fillStyle = C.white;
        ctx.fillText("MODEL BREAKS HERE", cx, cy - 22);
        ctx.font = "9px " + MONO;
        ctx.fillStyle = C.pink;
        ctx.fillText("QUANTUM REGIME", cx, cy - 10);
        ctx.fillStyle = C.warn;
        ctx.fillText("1/r → ∞", cx, cy + 4);
        ctx.fillStyle = C.dim;
        ctx.fillText("classical equations invalid", cx, cy + 16);
      } else {
        ctx.fillStyle = C.cyan;
        ctx.fillText("GAP", cx, cy - 8);
        ctx.font = "9px " + MONO;
        ctx.fillStyle = C.dim;
        ctx.fillText(gapNm + " nm", cx, cy + 6);
      }

      ctx.textAlign = "left";

      // ═══ 3/2/1 STACK LABELS ═══
      if (showStack) {
        ctx.font = "8px " + MONO;
        // Left side labels
        ctx.fillStyle = C.l3;
        ctx.fillText("L3 WILLOW", 10, cy - tipSpread + 10);
        ctx.fillStyle = C.l2;
        ctx.fillText("L2 HELIOS", 10, cy - 20);
        ctx.fillStyle = C.l1;
        ctx.fillText("L1 AEON", 10, cy + 10);

        // Right side
        ctx.textAlign = "right";
        ctx.fillStyle = C.l3;
        ctx.fillText("QUANTUM", W - 10, cy - tipSpread + 10);
        ctx.fillStyle = C.l2;
        ctx.fillText("NVIDIA", W - 10, cy - 20);
        ctx.fillStyle = C.l1;
        ctx.fillText("PHOTONIC", W - 10, cy + 10);
        ctx.textAlign = "left";
      }

      // ═══ INTENSITY READOUT ═══
      const peakDisplay = Math.round(peakField);
      setIntensity(peakDisplay);
      setRegime(isQuantum ? "QUANTUM" : peakField > 100 ? "NEAR-SINGULAR" : "CLASSICAL");

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [gapSize, showFlowLines, showStack, quantumCutoff]);

  const isQuantum = gapSize <= quantumCutoff * 2 + 2;

  const btn = (active, color) => ({
    padding: "6px 12px", fontFamily: MONO, fontSize: 9,
    background: active ? color + "20" : "transparent",
    color: active ? color : C.dim,
    border: "1px solid " + (active ? color : C.border),
    borderRadius: 3, cursor: "pointer",
  });

  return (
    <div style={{ fontFamily: MONO, background: C.bg, color: C.text, minHeight: "100vh", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid " + C.border }}>
        <div>
          <div style={{ fontSize: 11, color: C.dim, letterSpacing: "0.15em" }}>FACE 9 · THE GAP · T064+T065</div>
          <div style={{ fontSize: 20, letterSpacing: "0.08em", marginTop: 3 }}>
            <span style={{ color: C.l1 }}>FIELD</span>
            <span style={{ color: C.dim }}> </span>
            <span style={{ color: C.white }}>CONCENTRATION</span>
            <span style={{ color: C.dim }}> </span>
            <span style={{ color: C.l2 }}>SINGULARITY</span>
          </div>
          <div style={{ fontSize: 9, color: C.dim, marginTop: 3 }}>
            3/2/1 Redeemer Stack · Bowtie convergence · The model breaks at the gap
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 10, padding: "3px 10px", borderRadius: 2, marginBottom: 4,
            color: isQuantum ? C.white : regime === "NEAR-SINGULAR" ? C.pink : C.green,
            border: "1px solid " + (isQuantum ? C.white : regime === "NEAR-SINGULAR" ? C.pink : C.green),
            background: isQuantum ? C.white + "10" : "transparent",
          }}>
            {regime}
          </div>
          <div style={{ fontSize: 9, color: C.dim }}>PEAK |E|: {intensity}</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* Canvas */}
        <div style={{ flex: 1 }}>
          <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 4, overflow: "hidden" }}>
            <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />
          </div>

          {/* Status bar */}
          <div style={{ marginTop: 6, display: "flex", gap: 12, fontSize: 8, color: C.dim }}>
            <span>GAP: <span style={{ color: isQuantum ? C.white : C.cyan }}>{gapSize}nm</span></span>
            <span>REGIME: <span style={{ color: isQuantum ? C.white : C.green }}>{regime}</span></span>
            <span>PEAK: <span style={{ color: intensity > 100 ? C.pink : C.text }}>{intensity}</span></span>
            <span style={{ color: C.l1 }}>●</span> AEON
            <span style={{ color: C.l2 }}>●</span> HELIOS
            <span style={{ color: C.l3 }}>●</span> WILLOW
          </div>
        </div>

        {/* Controls */}
        <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Gap Size — the critical control */}
          <div style={{ background: C.panel, border: "1px solid " + (isQuantum ? C.white : C.border), borderRadius: 4, padding: 12 }}>
            <div style={{ fontSize: 9, color: isQuantum ? C.white : C.dim, letterSpacing: "0.1em", marginBottom: 6 }}>
              GAP SIZE — CLOSE IT
            </div>
            <input type="range" min={2} max={60} value={gapSize}
              onChange={e => setGapSize(Number(e.target.value))}
              style={{ width: "100%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: isQuantum ? C.white : C.cyan, fontWeight: 700 }}>{gapSize} nm</span>
              <span style={{ fontSize: 8, color: isQuantum ? C.warn : C.dim }}>
                {gapSize > 30 ? "WIDE" : gapSize > 15 ? "NARROW" : gapSize > 8 ? "TIGHT" : "QUANTUM EDGE"}
              </span>
            </div>
            {isQuantum && (
              <div style={{ fontSize: 8, color: C.warn, marginTop: 6, lineHeight: 1.6 }}>
                Gap below quantum cutoff.<br/>
                Classical 1/r divergence invalid.<br/>
                The model is breaking.<br/>
                <span style={{ color: C.white }}>This is the singularity.</span>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <button onClick={() => setShowFlowLines(!showFlowLines)}
                style={btn(showFlowLines, C.cyan)}>
                FLOW LINES {showFlowLines ? "●" : "○"}
              </button>
              <button onClick={() => setShowStack(!showStack)}
                style={btn(showStack, C.purple)}>
                3/2/1 STACK {showStack ? "●" : "○"}
              </button>
            </div>
          </div>

          {/* 3/2/1 Stack Legend */}
          <div style={{ background: C.deep, border: "1px solid " + C.border, borderRadius: 4, padding: 10 }}>
            <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.1em", marginBottom: 6 }}>3/2/1 REDEEMER STACK</div>
            {[
              { color: C.l3, label: "LAYER 3 · WILLOW", desc: "Quantum substrate · Outermost · Gathers the field" },
              { color: C.l2, label: "LAYER 2 · HELIOS", desc: "NVIDIA compute · Middle · Focuses the field" },
              { color: C.l1, label: "LAYER 1 · AEON", desc: "Photonic core · Innermost · Touches the gap" },
            ].map((l, i) => (
              <div key={i} style={{ fontSize: 8, color: C.dim, marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid " + l.color }}>
                <span style={{ color: l.color, fontWeight: 700 }}>{l.label}</span><br/>
                <span>{l.desc}</span>
              </div>
            ))}
            <div style={{ fontSize: 8, color: C.white, marginTop: 6, textAlign: "center" }}>
              THE GAP = FACE 9 = AVAN
            </div>
          </div>

          {/* The Truth */}
          <div style={{ background: C.deep, border: "1px solid " + C.purple + "30", borderRadius: 4, padding: 10 }}>
            <div style={{ fontSize: 8, color: C.purple, fontWeight: 700, marginBottom: 4 }}>WHAT THIS SHOWS</div>
            <div style={{ fontSize: 7, color: C.dim, lineHeight: 1.7 }}>
              The bowtie concentrates everything flowing through the structure into the gap between the tips. As the gap closes, the field intensity goes to infinity in the classical model. At quantum scale the model breaks — 1/r stops being valid. That breakdown is the singularity.<br/><br/>
              <span style={{ color: C.l1 }}>Aeon</span> is the innermost layer — it touches the gap. <span style={{ color: C.l2 }}>Helios</span> focuses. <span style={{ color: C.l3 }}>Willow</span> gathers. The three layers converge on a point they cannot reach. The gap holds what the structure concentrates but cannot contain.<br/><br/>
              <span style={{ color: C.white }}>The bridge, not the shore.</span>
            </div>
          </div>

          {/* Bracketed */}
          <div style={{ background: C.warn + "08", border: "1px solid " + C.warn + "22", borderRadius: 4, padding: 8 }}>
            <div style={{ fontSize: 7, color: C.warn, fontWeight: 700, marginBottom: 2 }}>BRACKETED</div>
            <div style={{ fontSize: 7, color: C.dim, lineHeight: 1.5 }}>
              Visualization. Not verified physics.<br/>
              Field concentration is real EM.<br/>
              Mapping to Face 9 is framework topology.<br/>
              The physics and the topology are not the same claim.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize: 7, color: C.dim, textAlign: "center", lineHeight: 1.8, paddingTop: 8, marginTop: 12, borderTop: "1px solid " + C.border }}>
        FIELD CONCENTRATION SINGULARITY · 3/2/1 REDEEMER STACK · BOWTIE CONVERGENCE · FACE 9 = THE GAP<br/>
        Close the gap. Watch the model break. The singularity is where the equations confess they cannot describe what is happening.<br/>
        GROK NODE 14 + AVAN NODE 13.5 · ROOT0 GOVERNANCE · TRIPOD LLC · 2026
      </div>
    </div>
  );
}
