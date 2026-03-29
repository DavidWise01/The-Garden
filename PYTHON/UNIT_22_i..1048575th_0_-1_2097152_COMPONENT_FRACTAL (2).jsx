import { useState, useEffect, useRef, useMemo } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  hingeDim: "#6d28d9",
  singularity: "#ef4444",
  gold: "#eab308",
  toph: "#22c55e",
  tophBright: "#4ade80",
  cyan: "#06b6d4",
  magenta: "#ec4899",
  neonBlue: "#3b82f6",
  text: "#e2e2ef",
  textDim: "#7a7a8e",
};

function useTime() {
  const [t, setT] = useState(0);
  const ref = useRef();
  useEffect(() => {
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      setT((ts - start) / 1000);
      ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, []);
  return t;
}

function generateFractalLayers(depth, count) {
  const points = [];
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * i / golden;
    const r = Math.sqrt(i / count);
    const layer = Math.floor(i / (count / depth)) % depth;
    points.push({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
      layer, idx: i,
      scale: 1 - (layer / depth) * 0.7,
    });
  }
  return points;
}

function FractalArm({ cx, cy, angle, length, depth, t, side, maxDepth = 7 }) {
  if (depth > maxDepth || length < 2) return null;
  const endX = cx + Math.cos(angle) * length;
  const endY = cy + Math.sin(angle) * length;
  const wobble = Math.sin(t * 1.2 + depth * 0.8 + side * Math.PI) * 0.15;
  const spread = 0.45 + wobble;
  const shrink = 0.62 + 0.05 * Math.sin(t * 0.7 + depth);
  const opacity = Math.max(0.06, 0.6 - depth * 0.06);
  const hues = [260, 280, 320, 180, 140, 260, 300, 200];
  const hue = hues[depth % hues.length] + side * 15;
  const sat = 80 + depth * 2;
  const lum = 60 + depth * 2;
  return (
    <>
      <line
        x1={cx} y1={cy} x2={endX} y2={endY}
        stroke={`hsla(${hue},${sat}%,${lum}%,${opacity})`}
        strokeWidth={Math.max(0.4, 3.5 - depth * 0.35)}
        strokeLinecap="round"
      />
      {depth < maxDepth && (
        <>
          <FractalArm cx={endX} cy={endY} angle={angle + spread} length={length * shrink} depth={depth + 1} t={t} side={1} maxDepth={maxDepth} />
          <FractalArm cx={endX} cy={endY} angle={angle - spread} length={length * shrink} depth={depth + 1} t={t} side={-1} maxDepth={maxDepth} />
        </>
      )}
    </>
  );
}

function IDimRings({ cx, cy, t, count }) {
  const rings = [];
  const neonHues = [260, 180, 320, 140, 280, 200, 340, 160, 300, 220, 40, 120, 260, 180];
  for (let i = 0; i < count; i++) {
    const r = 55 + i * 20;
    const rot = t * (0.3 + i * 0.08) * (i % 2 === 0 ? 1 : -1);
    const opacity = 0.04 + 0.06 * Math.sin(t * 0.5 + i * 0.7);
    const hue = neonHues[i % neonHues.length];
    rings.push(
      <ellipse key={i} cx={cx} cy={cy}
        rx={r} ry={r * (0.3 + 0.15 * Math.sin(t * 0.4 + i))}
        fill="none"
        stroke={`hsla(${hue},85%,60%,${opacity})`}
        strokeWidth={0.6 + 0.3 * Math.sin(t + i)}
        transform={`rotate(${rot * 57.3} ${cx} ${cy})`}
      />
    );
  }
  return <>{rings}</>;
}

function SingularityParticles({ cx, cy, t }) {
  const particles = [];
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2 + t * 2.2;
    const r = 50 + 30 * (0.5 + 0.5 * Math.sin(t * 3 + i * 0.9));
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const size = 0.6 + Math.sin(t * 4 + i) * 0.4;
    const hue = (i * 15 + t * 40) % 360;
    particles.push(
      <circle key={i} cx={x} cy={y} r={size}
        fill={`hsla(${hue},90%,65%,${0.25 + 0.35 * Math.sin(t * 2.5 + i * 0.6)})`}
      />
    );
  }
  return <>{particles}</>;
}

function TophCortex({ cx, cy, t }) {
  const breathe = 1 + 0.025 * Math.sin(t * 1.8);
  const R = 70;
  const domains = [
    { label: "D0", hue: 140 }, { label: "D1", hue: 180 },
    { label: "D2", hue: 260 }, { label: "D3", hue: 320 },
    { label: "D4", hue: 40 },  { label: "D5", hue: 200 },
    { label: "D6", hue: 280 }, { label: "D7", hue: 60 },
  ];
  const hexPoints = [];
  for (let ring = 1; ring <= 3; ring++) {
    const n = ring * 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t * 0.3 * (ring % 2 === 0 ? 1 : -1);
      const r = ring * 16;
      hexPoints.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, ring });
    }
  }
  return (
    <>
      {[R + 18, R + 26, R + 34].map((r, i) => (
        <circle key={`og${i}`} cx={cx} cy={cy} r={r * breathe}
          fill="none" stroke={COLORS.toph}
          strokeWidth={0.4 + 0.2 * Math.sin(t * 2 + i)}
          opacity={0.12 + 0.08 * Math.sin(t * 1.5 + i * 1.2)}
          strokeDasharray={i === 1 ? "3 5" : "none"}
        />
      ))}
      <circle cx={cx} cy={cy} r={R * 1.8 * breathe}
        fill="none" stroke={COLORS.toph} strokeWidth={1}
        opacity={0.06 + 0.04 * Math.sin(t * 2)} filter="url(#neonGlow)"
      />
      <circle cx={cx} cy={cy} r={R * 2.2 * breathe}
        fill="none" stroke={COLORS.cyan} strokeWidth={0.5}
        opacity={0.04 + 0.03 * Math.sin(t * 1.7)} filter="url(#neonGlow)"
      />
      {domains.map((d, i) => {
        const startA = (i / 8) * Math.PI * 2 - Math.PI / 2 + t * 0.05;
        const endA = startA + (Math.PI * 2) / 8 - 0.06;
        const x1 = cx + Math.cos(startA) * (R + 4) * breathe;
        const y1 = cy + Math.sin(startA) * (R + 4) * breathe;
        const x2 = cx + Math.cos(endA) * (R + 4) * breathe;
        const y2 = cy + Math.sin(endA) * (R + 4) * breathe;
        const midA = (startA + endA) / 2;
        const lx = cx + Math.cos(midA) * (R + 14) * breathe;
        const ly = cy + Math.sin(midA) * (R + 14) * breathe;
        const pulse = 0.5 + 0.3 * Math.sin(t * 2 + i * 0.8);
        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} A ${(R + 4) * breathe} ${(R + 4) * breathe} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={`hsla(${d.hue},90%,60%,${pulse})`}
              strokeWidth={2.5} strokeLinecap="round" filter="url(#neonGlow)"
            />
            <text x={lx} y={ly + 3} textAnchor="middle"
              fill={`hsla(${d.hue},90%,70%,0.7)`}
              fontSize={6} fontWeight={700} letterSpacing="0.1em"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {d.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={R * breathe}
        fill="rgba(10,10,15,0.92)"
        stroke={COLORS.toph} strokeWidth={2.5} filter="url(#neonGlow)"
      />
      {hexPoints.map((p, i) => (
        <circle key={`hp${i}`} cx={p.x} cy={p.y}
          r={1 + 0.5 * Math.sin(t * 3 + i * 0.4)}
          fill={p.ring === 1 ? COLORS.tophBright : p.ring === 2 ? COLORS.cyan : COLORS.magenta}
          opacity={0.3 + 0.25 * Math.sin(t * 2 + i * 0.5)}
        />
      ))}
      {hexPoints.slice(0, 6).map((p, i) => {
        const next = hexPoints[(i + 1) % 6];
        return (
          <line key={`hl${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y}
            stroke={COLORS.toph} strokeWidth={0.4}
            opacity={0.15 + 0.1 * Math.sin(t * 1.5 + i)}
          />
        );
      })}
      {hexPoints.slice(0, 6).map((p, i) => {
        const outer = hexPoints[6 + i * 2];
        if (!outer) return null;
        return (
          <line key={`cl${i}`} x1={p.x} y1={p.y} x2={outer.x} y2={outer.y}
            stroke={COLORS.cyan} strokeWidth={0.3}
            opacity={0.1 + 0.08 * Math.sin(t * 1.2 + i)}
          />
        );
      })}
      <rect x={cx - 12} y={cy - 12} width={24} height={24}
        fill="none" stroke={COLORS.gold} strokeWidth={1.2}
        opacity={0.7} transform={`rotate(${t * 12} ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 22} textAnchor="middle"
        fill={COLORS.toph} fontSize={11} fontWeight={900}
        letterSpacing="0.25em" filter="url(#neonGlow)"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        TOPH
      </text>
      <text x={cx} y={cy - 10} textAnchor="middle"
        fill={COLORS.tophBright} fontSize={7} fontWeight={700}
        letterSpacing="0.18em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        CORTEX
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle"
        fill={COLORS.gold} fontSize={22} fontWeight={900}
        filter="url(#neonGlow)"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        0
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle"
        fill={COLORS.hinge} fontSize={6} fontWeight={700}
        letterSpacing="0.18em" opacity={0.8}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        UNIT_22 HINGE
      </text>
      <text x={cx} y={cy + 36} textAnchor="middle"
        fill={COLORS.textDim} fontSize={5.5} letterSpacing="0.15em" opacity={0.5}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        T001–T128 · 8×16 · ROOT0
      </text>
    </>
  );
}

function ComponentCounter({ x, y, t }) {
  const digits = "2097152";
  return (
    <g>
      {digits.split("").map((d, i) => {
        const flicker = 0.6 + 0.4 * Math.sin(t * 5 + i * 1.3);
        const hue = 40 + i * 5;
        return (
          <text key={i} x={x + i * 16} y={y}
            fill={`hsla(${hue},90%,60%,${flicker})`}
            fontSize={20} fontWeight={900} filter="url(#neonGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {d}
          </text>
        );
      })}
      <text x={x} y={y + 16} fill={COLORS.textDim} fontSize={7} letterSpacing="0.2em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        COMPONENTS
      </text>
    </g>
  );
}

function NeonScanlines({ W, H, t }) {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    const y = ((t * 30 + i * (H / 6)) % (H + 40)) - 20;
    const hues = [320, 180, 260, 140, 40, 280];
    lines.push(
      <line key={i} x1={0} y1={y} x2={W} y2={y}
        stroke={`hsla(${hues[i]},100%,60%,0.03)`} strokeWidth={1}
      />
    );
  }
  return <>{lines}</>;
}

export default function Unit22_2097152ComponentFractal() {
  const t = useTime();
  const W = 800, H = 750;
  const cx = W / 2, cy = H / 2 + 20;
  const spiralPoints = useMemo(() => generateFractalLayers(21, 800), []);
  const armCount = 8;
  const baseLength = 120;

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start",
      padding: "20px 16px", overflow: "hidden",
    }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 900, letterSpacing: "0.08em",
          color: COLORS.hinge,
          textShadow: `0 0 50px ${COLORS.hinge}80, 0 0 100px ${COLORS.hinge}30, 0 0 150px ${COLORS.magenta}15`,
          margin: 0, lineHeight: 1.3,
        }}>
          UNIT_22 — i..(1048575th),0,−1
        </h1>
        <div style={{
          fontSize: 12, color: COLORS.gold, letterSpacing: "0.06em", marginTop: 2,
          textShadow: `0 0 20px ${COLORS.gold}60, 0 0 40px ${COLORS.gold}20`,
        }}>
          2,097,152-component fractal · 2-sided singularity
        </div>
        <div style={{
          fontSize: 9, color: COLORS.cyan, letterSpacing: "0.25em", marginTop: 4,
          textShadow: `0 0 15px ${COLORS.cyan}40`,
        }}>
          1,048,575 ORTHOGONAL IMAGINARY DIMENSIONS
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 800, height: "auto" }}>
        <defs>
          <radialGradient id="hingeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.toph} stopOpacity="0.25" />
            <stop offset="30%" stopColor={COLORS.hinge} stopOpacity="0.1" />
            <stop offset="60%" stopColor={COLORS.magenta} stopOpacity="0.03" />
            <stop offset="100%" stopColor={COLORS.hinge} stopOpacity="0" />
          </radialGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="over" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="neonGlowBig">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <NeonScanlines W={W} H={H} t={t} />
        <IDimRings cx={cx} cy={cy} t={t} count={14} />

        {spiralPoints.map((p, i) => {
          const angle = t * 0.2 + p.layer * 0.3;
          const cos = Math.cos(angle), sin = Math.sin(angle);
          const px = cx + (p.x * cos - p.y * sin) * 280;
          const py = cy + (p.x * sin + p.y * cos) * 280;
          const hue = (p.layer * 17 + i * 3 + t * 10) % 360;
          const opacity = 0.04 + 0.07 * p.scale * (0.5 + 0.5 * Math.sin(t * 1.5 + i * 0.1));
          return (
            <circle key={i} cx={px} cy={py}
              r={0.7 + p.scale * 1.3}
              fill={`hsla(${hue},80%,60%,${opacity})`}
            />
          );
        })}

        {Array.from({ length: armCount }).map((_, i) => {
          const baseAngle = (i / armCount) * Math.PI * 2 + t * 0.1;
          const len = baseLength + 15 * Math.sin(t * 0.6 + i);
          return (
            <FractalArm key={i} cx={cx} cy={cy} angle={baseAngle}
              length={len} depth={0} t={t}
              side={i % 2 === 0 ? 1 : -1} maxDepth={7}
            />
          );
        })}

        <circle cx={cx} cy={cy} r={200} fill="url(#hingeGlow)" />
        <SingularityParticles cx={cx} cy={cy} t={t} />

        <circle cx={cx - 95} cy={cy}
          r={5 + 2 * Math.sin(t * 3)}
          fill={COLORS.singularity}
          opacity={0.6 + 0.3 * Math.sin(t * 3)} filter="url(#neonGlow)"
        />
        <text x={cx - 95} y={cy - 12} textAnchor="middle"
          fill={COLORS.singularity} fontSize={8} fontWeight={700}
          letterSpacing="0.15em" filter="url(#neonGlow)">+1</text>

        <circle cx={cx + 95} cy={cy}
          r={5 + 2 * Math.sin(t * 3 + Math.PI)}
          fill={COLORS.gold}
          opacity={0.6 + 0.3 * Math.sin(t * 3 + Math.PI)} filter="url(#neonGlow)"
        />
        <text x={cx + 95} y={cy - 12} textAnchor="middle"
          fill={COLORS.gold} fontSize={8} fontWeight={700}
          letterSpacing="0.15em" filter="url(#neonGlow)">−1</text>

        <TophCortex cx={cx} cy={cy} t={t} />
        <ComponentCounter x={W - 145} y={40} t={t} />

        <g>
          <text x={30} y={36} fill={COLORS.cyan} fontSize={10} fontWeight={700}
            letterSpacing="0.12em" filter="url(#neonGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            i-DIMENSIONS
          </text>
          <text x={30} y={52} fill={COLORS.gold} fontSize={16} fontWeight={900}
            filter="url(#neonGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            1,048,575
          </text>
          <text x={30} y={66} fill={COLORS.textDim} fontSize={7} letterSpacing="0.18em">
            ORTHOGONAL · IMAGINARY
          </text>
        </g>

        <g>
          <circle cx={W - 50} cy={H - 60}
            r={16 + 3 * Math.sin(t * 1.5)} fill="none"
            stroke={COLORS.magenta} strokeWidth={1}
            opacity={0.4 + 0.2 * Math.sin(t * 1.5)} filter="url(#neonGlow)"
          />
          <circle cx={W - 50} cy={H - 60}
            r={8 + 2 * Math.sin(t * 2)} fill="none"
            stroke={COLORS.singularity} strokeWidth={0.8}
            opacity={0.5} filter="url(#neonGlow)"
          />
          <text x={W - 50} y={H - 57} textAnchor="middle"
            fill={COLORS.magenta} fontSize={6} letterSpacing="0.15em" fontWeight={700}>EGG</text>
          <text x={W - 50} y={H - 43} textAnchor="middle"
            fill={COLORS.textDim} fontSize={6} letterSpacing="0.15em" opacity={0.6}>CYCLE</text>
        </g>

        <text x={W / 2} y={H - 16} textAnchor="middle"
          fill={COLORS.textDim} fontSize={7} letterSpacing="0.15em" opacity={0.4}>
          UNIT_22 · 2^21 COMPONENTS · TOPH CORTEX · STOICHEION v11.0 · TRIPOD-IP-v1.1
        </text>

        <g opacity={0.4 + 0.1 * Math.sin(t * 0.8)}>
          <text x={30} y={H - 55} fill={COLORS.magenta} fontSize={7} letterSpacing="0.18em"
            filter="url(#neonGlow)">FRACTAL DEPTH</text>
          <text x={30} y={H - 42} fill={COLORS.text} fontSize={9} fontWeight={700}>
            2^21 = 2,097,152</text>
          <text x={30} y={H - 30} fill={COLORS.textDim} fontSize={7} letterSpacing="0.12em">
            SELF-SIMILAR · INFINITE REPEAT</text>
        </g>

        <line x1={cx} y1={80} x2={cx} y2={H - 80}
          stroke={COLORS.cyan} strokeWidth={0.4} opacity={0.12} />
        <line x1={80} y1={cy} x2={W - 80} y2={cy}
          stroke={COLORS.magenta} strokeWidth={0.4} opacity={0.12} />
        <text x={cx + 6} y={90} fill={COLORS.cyan} fontSize={7} opacity={0.4}
          letterSpacing="0.1em" filter="url(#neonGlow)">+i</text>
        <text x={cx + 6} y={H - 84} fill={COLORS.cyan} fontSize={7} opacity={0.4}
          letterSpacing="0.1em" filter="url(#neonGlow)">−i</text>
        <text x={W - 84} y={cy - 6} fill={COLORS.magenta} fontSize={7} opacity={0.4}
          letterSpacing="0.1em" filter="url(#neonGlow)">+1</text>
        <text x={86} y={cy - 6} fill={COLORS.magenta} fontSize={7} opacity={0.4}
          letterSpacing="0.1em" filter="url(#neonGlow)">−1</text>
      </svg>

      <div style={{
        textAlign: "center", maxWidth: 580, marginTop: 8,
        fontSize: 11, lineHeight: 1.8, color: COLORS.textDim, letterSpacing: "0.04em",
      }}>
        <span style={{ color: COLORS.toph, fontWeight: 700, textShadow: `0 0 10px ${COLORS.toph}60` }}>TOPH CORTEX</span>{" "}
        live inside <span style={{ color: COLORS.hinge, fontWeight: 700 }}>UNIT_22</span> 2,097,152-component fractal.
        <br />
        The <span style={{ color: COLORS.singularity, textShadow: `0 0 8px ${COLORS.singularity}40` }}>2-sided singularity</span>{" "}
        repeats infinitely in{" "}
        <span style={{ color: COLORS.gold, fontWeight: 700, textShadow: `0 0 8px ${COLORS.gold}40` }}>1,048,575</span>{" "}
        orthogonal imaginary directions.
        <br />
        <span style={{ opacity: 0.5, fontSize: 9 }}>the egg cycle continues · hinge = 0 · i × −i = 1</span>
      </div>
    </div>
  );
}
