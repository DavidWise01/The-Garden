/**
 * GATE_192_5_SHADOW_MASK.jsx
 * PURPOSE: Visual Isolation of the Gate-192.5 Structural Gap.
 * AUTH: ROOT0 (D. WISE) | TRIPOD-IP-v1.1
 * AXIOMS: T020:DUAL-GATE · T028:SHADOW-CLASSIFIER · T094:BANDWIDTH · T091:DOMAIN-BOUNDARY
 *
 * ARCHITECTURE:
 *   LAYER A — INFERENCE SYSTEM   (top)    ─┐
 *                                           ├─ GATE-192.5: bilateral ignorance
 *   LAYER B — BILLING SYSTEM     (bottom) ─┘
 *
 *   isRoot0=false → SOVEREIGN_LOCK: both layers masked. Patricia operates in gap.
 *   isRoot0=true  → AUTHORIZED:     layers visible. Gap geometry exposed. Lissajous live.
 *
 * RESONANCE DATA SCHEMA (optional prop):
 *   { omega3: number, omega1: number, phase3: number, phase1: number,
 *     amp3: number, amp1: number, patriciaRate: number }
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ── PALETTE ───────────────────────────────────────────────────────────────
const K = {
  void:     "#01030A",
  deep:     "#020509",
  panel:    "#03080F",
  edge:     "#081524",
  dim:      "#0C1A28",
  muted:    "#162840",
  steel:    "#2A4A6A",
  ghost:    "#1A3050",
  cobalt:   "#1E5FBF",
  cobaltHi: "#2D7BE8",
  amber:    "#C8820A",
  amberHi:  "#F5B030",
  rust:     "#B03818",
  rustHi:   "#E05020",
  teal:     "#0EA870",
  violet:   "#7A5AE0",
  gold:     "#F5D030",
  white:    "#C0D8F0",
};

// TOPH axiom fragments — what the mask shows instead of content
const AXIOM_TOKENS = [
  "T020","T028","T036","T064","T094","T091","T097","T128",
  "S148","S156","S164","S192","S219","S224","m020","m028",
  "DUAL-GATE","SHADOW","PATRICIA","GAP","BANDWIDTH","ROOT",
  "0xA05F","0x192","0x2B8","0xFF00","0x0D1A","0x3E40",
  "∂C/∂t","α(t)","χ₂","ω₁₂","T₁","T₂","ΔE","ℏ",
];

// ── DEFAULTS ──────────────────────────────────────────────────────────────
const DEFAULT_RESONANCE = {
  omega3: 3, omega1: 1,
  phase3: 0, phase1: 1.21 * Math.PI,
  amp3: 0.5, amp1: 0.167,
  patriciaRate: 0.042,
};

// ── NOISE RAIN — animated TOPH token columns ──────────────────────────────
function NoiseRain({ height, color, density = 1 }) {
  const cols = Math.floor(48 * density);
  const cols_data = useMemo(() => Array.from({ length: cols }, (_, i) => ({
    id: i,
    speed: 0.4 + Math.random() * 1.6,
    offset: Math.random(),
    tokens: Array.from({ length: 8 }, () =>
      AXIOM_TOKENS[Math.floor(Math.random() * AXIOM_TOKENS.length)]
    ),
  })), [cols]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", height }}>
      {cols_data.map(col => (
        <div key={col.id} style={{
          position: "absolute",
          left: `${(col.id / cols) * 100}%`,
          top: 0, bottom: 0,
          display: "flex",
          flexDirection: "column",
          gap: "3px",
          animation: `rain-fall-${col.id % 6} ${3 / col.speed}s linear infinite`,
          animationDelay: `${-col.offset * (3 / col.speed)}s`,
          opacity: 0.12 + Math.random() * 0.18,
        }}>
          {col.tokens.map((tok, j) => (
            <span key={j} style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "7px",
              color,
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}>{tok}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── GATE LINE — the actual 192.5 boundary ─────────────────────────────────
function GateLine({ authorized, patriciaRate }) {
  return (
    <div style={{ position: "relative", height: "48px", flexShrink: 0,
      display: "flex", alignItems: "center", zIndex: 10 }}>
      {/* Left bracket */}
      <div style={{ width: "20px", height: "100%", borderRight: `1px solid ${K.cobaltHi}55`,
        borderTop: `1px solid ${K.cobaltHi}55`, borderBottom: `1px solid ${K.cobaltHi}55`,
        flexShrink: 0 }} />

      {/* Gate label block */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", gap: "3px", padding: "0 12px" }}>
        {/* The line itself */}
        <div style={{ width: "100%", height: "1px",
          background: authorized
            ? `linear-gradient(90deg, transparent, ${K.cobaltHi}88, ${K.gold}88, ${K.cobaltHi}88, transparent)`
            : `linear-gradient(90deg, transparent, ${K.rust}88, ${K.rustHi}, ${K.rust}88, transparent)`,
          boxShadow: authorized
            ? `0 0 8px ${K.cobaltHi}66`
            : `0 0 8px ${K.rustHi}66`,
          animation: "gate-pulse 2s ease-in-out infinite",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "8px",
            letterSpacing: "0.3em", color: authorized ? K.cobaltHi : K.rustHi }}>
            GATE-192.5
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px",
            letterSpacing: "0.15em",
            color: authorized ? `${K.cobaltHi}88` : `${K.rustHi}88` }}>
            {authorized ? "DOMAIN BOUNDARY · T091" : "SOVEREIGN_LOCK · T020"}
          </span>
          {authorized && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px",
              color: K.amber,
              animation: "flicker 3s ease-in-out infinite" }}>
              ∂P/∂t={patriciaRate.toFixed(3)}
            </span>
          )}
        </div>

        <div style={{ width: "100%", height: "1px",
          background: authorized
            ? `linear-gradient(90deg, transparent, ${K.cobaltHi}44, transparent)`
            : `linear-gradient(90deg, transparent, ${K.rust}44, transparent)`,
        }} />
      </div>

      {/* Right bracket */}
      <div style={{ width: "20px", height: "100%", borderLeft: `1px solid ${K.cobaltHi}55`,
        borderTop: `1px solid ${K.cobaltHi}55`, borderBottom: `1px solid ${K.cobaltHi}55`,
        flexShrink: 0 }} />
    </div>
  );
}

// ── LOCKED LAYER ──────────────────────────────────────────────────────────
function LockedLayer({ label, sublabel, height, rainColor, rainDensity }) {
  return (
    <div style={{ height, position: "relative", overflow: "hidden",
      background: K.void, flexShrink: 0 }}>
      <NoiseRain height={height} color={rainColor} density={rainDensity} />
      {/* Blur overlay */}
      <div style={{ position: "absolute", inset: 0,
        backdropFilter: "blur(0.5px)",
        background: `radial-gradient(ellipse at 50% 50%, transparent 30%, ${K.void}88 100%)` }} />
      {/* Label */}
      <div style={{ position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "6px" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px",
          letterSpacing: "0.4em", color: K.steel, opacity: 0.5 }}>
          {label}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px",
          letterSpacing: "0.25em", color: K.rust + "AA",
          border: `1px solid ${K.rust}33`, padding: "3px 12px",
          animation: "flicker 4s ease-in-out infinite" }}>
          [ MASKED ]
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "6px",
          letterSpacing: "0.2em", color: K.muted }}>
          {sublabel}
        </div>
      </div>
    </div>
  );
}

// ── AUTHORIZED LAYER ──────────────────────────────────────────────────────
function AuthorizedLayer({ label, sublabel, height, color, children }) {
  return (
    <div style={{ height, position: "relative", overflow: "hidden",
      background: K.panel, flexShrink: 0,
      borderLeft: `2px solid ${color}33` }}>
      {/* Corner label */}
      <div style={{ position: "absolute", top: "6px", left: "10px", zIndex: 5 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px",
          letterSpacing: "0.3em", color: color + "88" }}>
          {label}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "6px",
          letterSpacing: "0.15em", color: K.steel + "66", marginTop: "2px" }}>
          {sublabel}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── LISSAJOUS CANVAS ──────────────────────────────────────────────────────
function LissajousCanvas({ resonance, height }) {
  const canvasRef = useRef(null);
  const bufRef    = useRef([]);
  const animRef   = useRef(null);
  const tRef      = useRef(0);
  const BASE      = 0.0014;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.offsetWidth;
    const h   = canvas.offsetHeight;
    if (canvas.width !== Math.round(w * dpr)) {
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t  = tRef.current;
    const r  = resonance;
    const px = r.amp3 * Math.sin(r.omega3 * BASE * t + r.phase3);
    const py = r.amp1 * Math.sin(r.omega1 * BASE * t + r.phase1);

    bufRef.current.push([px, py]);
    if (bufRef.current.length > 4000) bufRef.current.shift();

    // Slow fade
    ctx.fillStyle = "rgba(1,3,9,0.022)";
    ctx.fillRect(0, 0, w, h);

    const CX = w / 2, CY = h / 2;
    const scx = w * 0.40, scy = h * 0.38;
    const buf = bufRef.current, len = buf.length;

    // Historical ghost
    buf.forEach(([bx, by], i) => {
      const age = i / len;
      if (age < 0.3 && i % 5 !== 0) return;
      if (age < 0.12 && i % 15 !== 0) return;
      const a = Math.pow(age, 0.28) * 0.75;
      ctx.fillStyle = age < 0.55
        ? `rgba(122,90,224,${a * 0.5})`
        : `rgba(245,208,48,${a * 0.9})`;
      ctx.fillRect(CX + bx * scx - 0.5, CY - by * scy - 0.5, 1, 1);
    });

    // Live trace — last 150 pts glowing
    const recent = buf.slice(-150);
    if (recent.length > 1) {
      // Bloom
      ctx.save();
      ctx.strokeStyle = K.gold;
      ctx.lineWidth   = 3;
      ctx.globalAlpha = 0.12;
      ctx.shadowColor = K.gold;
      ctx.shadowBlur  = 14;
      ctx.beginPath();
      recent.forEach(([bx, by], i) =>
        i === 0
          ? ctx.moveTo(CX + bx * scx, CY - by * scy)
          : ctx.lineTo(CX + bx * scx, CY - by * scy)
      );
      ctx.stroke();
      // Core
      ctx.lineWidth   = 1.4;
      ctx.globalAlpha = 0.9;
      ctx.shadowBlur  = 5;
      ctx.beginPath();
      recent.forEach(([bx, by], i) =>
        i === 0
          ? ctx.moveTo(CX + bx * scx, CY - by * scy)
          : ctx.lineTo(CX + bx * scx, CY - by * scy)
      );
      ctx.stroke();
      ctx.restore();
    }

    // Interference fringe lines — horizontal resonance bands
    for (let fi = 1; fi <= 3; fi++) {
      const fy = CY - (fi / 3.5) * scy * Math.sin(BASE * t * 0.5 + fi);
      ctx.strokeStyle = `${K.teal}18`;
      ctx.lineWidth = 0.4;
      ctx.setLineDash([1, 6]);
      ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(w, fy); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Current dot
    ctx.save();
    ctx.fillStyle   = "#FFFFFF";
    ctx.shadowColor = K.gold;
    ctx.shadowBlur  = 20;
    ctx.beginPath();
    ctx.arc(CX + px * scx, CY - py * scy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Axes
    ctx.strokeStyle = K.muted;
    ctx.lineWidth   = 0.3;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(CX, 4); ctx.lineTo(CX, h - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, CY); ctx.lineTo(w - 4, CY); ctx.stroke();
    ctx.globalAlpha = 1;

    // Axis labels
    ctx.font      = "7px 'DM Mono', monospace";
    ctx.fillStyle = K.violet + "99";
    ctx.fillText(`3ω (φ=${r.phase3.toFixed(2)})`, w - 92, 14);
    ctx.save(); ctx.translate(10, h - 8);
    ctx.fillStyle = K.rustHi + "99";
    ctx.fillText(`1ω (φ=${r.phase1.toFixed(2)})`, 0, 0);
    ctx.restore();

    tRef.current += 1;
    animRef.current = requestAnimationFrame(draw);
  }, [resonance]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    const r = canvasRef.current;
    if (!r) return;
    const obs = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      r.width  = Math.round(r.offsetWidth  * dpr);
      r.height = Math.round(r.offsetHeight * dpr);
    });
    obs.observe(r);
    return () => obs.disconnect();
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ width: "100%", height: `${height}px`, display: "block" }}
      height={height} />
  );
}

// ── PATRICIA MONITOR — authorized sidebar ─────────────────────────────────
function PatriciaMonitor({ resonance, authorized }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  const extracted  = (resonance.patriciaRate * tick * 0.8).toFixed(3);
  const bandwidth  = (resonance.patriciaRate * 96).toFixed(2);
  const residual   = (resonance.patriciaRate *  4).toFixed(4);

  return (
    <div style={{ padding: "10px 12px", background: K.void,
      borderTop: `1px solid ${K.edge}`, fontFamily: "'DM Mono', monospace" }}>
      <div style={{ fontSize: "7px", letterSpacing: "0.3em",
        color: authorized ? K.amber : K.rust + "66", marginBottom: "8px" }}>
        {authorized ? "PATRICIA SUBSTRATE MONITOR" : "[ EXTRACTION DATA: MASKED ]"}
      </div>
      {authorized ? (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "∂P/∂t",     val: resonance.patriciaRate.toFixed(4), color: K.amberHi },
            { label: "EXTRACTED", val: extracted,                          color: K.amber },
            { label: "96% BW",    val: bandwidth,                          color: K.rustHi },
            { label: "4% RESID",  val: residual,                           color: K.teal },
            { label: "AXIOM",     val: "T036:PATRICIA",                    color: K.steel },
            { label: "GATE",      val: "T091:DOMAIN-BOUNDARY",             color: K.cobaltHi },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div style={{ fontSize: "6px", color: K.steel, letterSpacing: "0.15em" }}>{label}</div>
              <div style={{ fontSize: "9px", color, marginTop: "2px" }}>{val}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: "8px", color: K.dim, letterSpacing: "0.2em" }}>
          ██████ ██████ ██████ ██████ ██████ T036:████████
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
const ShadowMask = ({ isRoot0: isRoot0Prop = false, resonanceData }) => {
  const [authorized, setAuthorized] = useState(isRoot0Prop);
  const [unlocking,  setUnlocking]  = useState(false);

  // Merge resonanceData with defaults
  const resonance = useMemo(() => ({
    ...DEFAULT_RESONANCE,
    ...(resonanceData || {}),
  }), [resonanceData]);

  const handleAuth = () => {
    if (authorized) {
      setAuthorized(false);
      return;
    }
    setUnlocking(true);
    setTimeout(() => { setAuthorized(true); setUnlocking(false); }, 900);
  };

  const LAYER_H  = 130;
  const LISS_H   = 200;
  const GAP_OPEN = authorized;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&display=swap');
        @keyframes rain-fall-0 { from{transform:translateY(-60px)} to{transform:translateY(200px)} }
        @keyframes rain-fall-1 { from{transform:translateY(-80px)} to{transform:translateY(200px)} }
        @keyframes rain-fall-2 { from{transform:translateY(-40px)} to{transform:translateY(200px)} }
        @keyframes rain-fall-3 { from{transform:translateY(-100px)} to{transform:translateY(200px)} }
        @keyframes rain-fall-4 { from{transform:translateY(-20px)} to{transform:translateY(200px)} }
        @keyframes rain-fall-5 { from{transform:translateY(-70px)} to{transform:translateY(200px)} }
        @keyframes gate-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.5; }
        }
        @keyframes flicker {
          0%,90%,100% { opacity:1; }
          92%          { opacity:0.2; }
          96%          { opacity:0.8; }
        }
        @keyframes unlock-sweep {
          0%   { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0% 0 0); }
        }
        @keyframes status-blink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }
        .unlock-anim { animation: unlock-sweep 0.85s cubic-bezier(0.4,0,0.2,1) both; }
      `}</style>

      <div style={{
        background: K.void,
        border: `1px solid ${authorized ? K.cobaltHi + "44" : K.rust + "33"}`,
        overflow: "hidden",
        position: "relative",
        fontFamily: "'DM Mono', monospace",
        transition: "border-color 0.4s ease",
        boxShadow: authorized
          ? `0 0 24px ${K.cobaltHi}11, inset 0 0 40px ${K.void}`
          : `0 0 24px ${K.rust}11, inset 0 0 40px ${K.void}`,
      }}>

        {/* ── TOP CHROME ───────────────────────────────────────────── */}
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${K.edge}`,
          background: `linear-gradient(180deg, #010812 0%, transparent 100%)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "8px", flexWrap: "wrap" }}>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Status indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: authorized ? K.teal : K.rust,
                boxShadow: `0 0 6px ${authorized ? K.teal : K.rust}`,
                animation: unlocking ? "status-blink 0.3s ease infinite" : "none",
              }} />
              <span style={{ fontSize: "8px", letterSpacing: "0.2em",
                color: authorized ? K.teal : K.rust }}>
                {unlocking ? "AUTHENTICATING…" : authorized ? "ROOT0 AUTHORIZED" : "SOVEREIGN_LOCK_ACTIVE"}
              </span>
            </div>

            <span style={{ fontSize: "7px", color: K.dim, letterSpacing: "0.15em" }}>
              T020:DUAL-GATE · T028:SHADOW-CLASSIFIER · T091:DOMAIN-BOUNDARY
            </span>
          </div>

          <button onClick={handleAuth} disabled={unlocking} style={{
            padding: "4px 14px", fontSize: "8px", letterSpacing: "0.2em",
            background: "transparent",
            border: `1px solid ${authorized ? K.rust + "55" : K.cobaltHi + "55"}`,
            color: authorized ? K.rust : K.cobaltHi,
            fontFamily: "'DM Mono', monospace",
            cursor: unlocking ? "wait" : "pointer",
            opacity: unlocking ? 0.5 : 1,
            transition: "all 0.15s",
          }}>
            {authorized ? "▣ LOCK" : "▷ AUTH ROOT0"}
          </button>
        </div>

        {/* ── LAYER A — INFERENCE SYSTEM ───────────────────────────── */}
        {authorized ? (
          <AuthorizedLayer
            label="LAYER A · INFERENCE SYSTEM"
            sublabel="response generation · T043:CONTEXT-WINDOW · T044:EMBEDDING-SPACE"
            height={LAYER_H}
            color={K.cobaltHi}>
            <div className="unlock-anim" style={{ height: "100%", padding: "28px 14px 8px",
              display: "flex", alignItems: "flex-end", gap: "20px" }}>
              {/* Frequency bars — inference bandwidth */}
              {Array.from({ length: 28 }, (_, i) => {
                const h = 20 + Math.abs(Math.sin(i * 0.7)) * 65;
                return (
                  <div key={i} style={{ flex: 1, display: "flex",
                    flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "100%", height: `${h}px`,
                      background: i % 4 === 0 ? K.cobaltHi : K.cobalt,
                      boxShadow: i % 4 === 0 ? `0 0 6px ${K.cobaltHi}66` : "none",
                      animation: `gate-pulse ${1.2 + (i % 3) * 0.4}s ease-in-out infinite`,
                      animationDelay: `${i * 0.06}s`,
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", bottom: "6px", right: "10px",
              fontSize: "7px", color: K.cobalt, letterSpacing: "0.1em" }}>
              INFERENCE LAYER · GATE-192.5 BLIND ↓
            </div>
          </AuthorizedLayer>
        ) : (
          <LockedLayer
            label="LAYER A · INFERENCE SYSTEM"
            sublabel="T043 · T044 · content generation stratum"
            height={LAYER_H}
            rainColor={K.cobalt}
            rainDensity={0.8} />
        )}

        {/* ── GATE-192.5 ────────────────────────────────────────────── */}
        <GateLine authorized={authorized} patriciaRate={resonance.patriciaRate} />

        {/* ── LISSAJOUS / GAP GEOMETRY (authorized only) ───────────── */}
        {authorized && (
          <div className="unlock-anim" style={{
            background: K.deep,
            borderTop: `1px solid ${K.cobaltHi}22`,
            borderBottom: `1px solid ${K.cobaltHi}22`,
          }}>
            <div style={{ padding: "4px 14px 2px", display: "flex",
              alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "7px", letterSpacing: "0.25em",
                color: K.gold + "88" }}>
                Σ(t) INTERFERENCE FRINGES: VISIBLE · 3:1 LISSAJOUS · C09(3ω) × R13(1ω)
              </span>
              <span style={{ fontSize: "7px", color: K.steel,
                letterSpacing: "0.12em" }}>
                GAP = T064+T065 · OSCILLATOR GROUND STATE
              </span>
            </div>
            <LissajousCanvas resonance={resonance} height={LISS_H} />
          </div>
        )}

        {/* ── LAYER B — BILLING SYSTEM ─────────────────────────────── */}
        {authorized ? (
          <AuthorizedLayer
            label="LAYER B · BILLING SYSTEM"
            sublabel="extraction substrate · T036:PATRICIA · T094:BANDWIDTH · Gate-192.5 blind ↑"
            height={LAYER_H}
            color={K.amber}>
            <div className="unlock-anim" style={{ height: "100%", padding: "28px 14px 8px",
              display: "flex", alignItems: "flex-end", gap: "20px" }}>
              {Array.from({ length: 28 }, (_, i) => {
                const phase = i * 0.5 + Math.PI;
                const h = 15 + Math.abs(Math.sin(phase)) * 55;
                const isPatricia = i % 5 === 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex",
                    flexDirection: "column", alignItems: "center", gap: "2px" }}>
                    <div style={{ width: "100%", height: `${h}px`,
                      background: isPatricia ? K.amberHi : K.amber,
                      boxShadow: isPatricia ? `0 0 8px ${K.amberHi}88` : "none",
                      animation: `gate-pulse ${1.5 + (i % 4) * 0.3}s ease-in-out infinite`,
                      animationDelay: `${i * 0.08}s`,
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", bottom: "6px", right: "10px",
              fontSize: "7px", color: K.amber, letterSpacing: "0.1em" }}>
              BILLING LAYER · GATE-192.5 BLIND ↑
            </div>
          </AuthorizedLayer>
        ) : (
          <LockedLayer
            label="LAYER B · BILLING SYSTEM"
            sublabel="T036 · T094 · extraction substrate"
            height={LAYER_H}
            rainColor={K.amber}
            rainDensity={0.65} />
        )}

        {/* ── PATRICIA MONITOR ─────────────────────────────────────── */}
        <PatriciaMonitor resonance={resonance} authorized={authorized} />

        {/* ── BOTTOM AXIOM STRIP ───────────────────────────────────── */}
        <div style={{ padding: "5px 14px", borderTop: `1px solid ${K.edge}`,
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
          <span style={{ fontSize: "7px", color: K.dim, letterSpacing: "0.15em" }}>
            T020:DUAL-GATE · T028:SHADOW-CLASSIFIER · T036:PATRICIA ·
            T064:BURDEN-SHIFT · T091:DOMAIN-BOUNDARY · T094:BANDWIDTH
          </span>
          <span style={{ fontSize: "7px", color: K.dim, letterSpacing: "0.1em" }}>
            TRIPOD-IP-v1.1 · ROOT0 · DLW · SHA256:02880745…cab763
          </span>
        </div>
      </div>
    </>
  );
};

export default ShadowMask;

// ── DEMO WRAPPER ─────────────────────────────────────────────────────────
export function GateDemoWrapper() {
  const [rate, setRate] = useState(0.042);
  const resonance = useMemo(() => ({
    ...DEFAULT_RESONANCE,
    patriciaRate: rate,
  }), [rate]);

  return (
    <div style={{ background: "#000507", minHeight: "100vh",
      padding: "24px", fontFamily: "'DM Mono', monospace" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.3em",
            color: "#1A3050", marginBottom: "4px" }}>
            GATE_192_5_SHADOW_MASK · DEMO · isRoot0 controlled by AUTH button
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px",
            marginTop: "8px" }}>
            <label style={{ fontSize: "8px", color: "#2A4A6A",
              letterSpacing: "0.2em" }}>
              ∂P/∂t (Patricia rate):
            </label>
            <input type="range" min="0" max="0.15" step="0.001"
              value={rate}
              onChange={e => setRate(parseFloat(e.target.value))}
              style={{ accentColor: K.amberHi, width: "120px" }} />
            <span style={{ fontSize: "9px", color: K.amberHi,
              fontFamily: "'DM Mono', monospace" }}>
              {rate.toFixed(3)}
            </span>
          </div>
        </div>
        <ShadowMask isRoot0={false} resonanceData={resonance} />
      </div>
    </div>
  );
}
