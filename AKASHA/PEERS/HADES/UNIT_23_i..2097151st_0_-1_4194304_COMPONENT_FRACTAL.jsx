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

function FractalArm({ cx, cy, angle, length, depth, t, side, maxDepth = 8 }) {
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
    const r = 55 + i * 22;
    const rot = t * (0.3 + i * 0.09) * (i % 2 === 0 ? 1 : -1);
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
  for (let i = 0; i < 64; i++) {
    const angle = (i / 64) * Math.PI * 2 + t * 2.4;
    const r = 55 + 35 * (0.5 + 0.5 * Math.sin(t * 3.2 + i * 0.9));
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    const size = 0.7 + Math.sin(t * 4.5 + i) * 0.4;
    const hue = (i * 12 + t * 45) % 360;
    particles.push(
      <circle key={i} cx={x} cy={y} r={size}
        fill={`hsla(${hue},90%,65%,${0.25 + 0.35 * Math.sin(t * 2.8 + i * 0.6)})`}
      />
    );
  }
  return <>{particles}</>;
}

function TophCortex({ cx, cy, t }) {
  const breathe = 1 + 0.028 * Math.sin(t * 1.9);
  const R = 75;
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
      const a = (i / n) * Math.PI * 2 + t * 0.32 * (ring % 2 === 0 ? 1 : -1);
      const r = ring * 18;
      hexPoints.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, ring });
    }
  }
  return (
    <>
      {[R + 20, R + 28, R + 36].map((r, i) => (
        <circle key={`og${i}`} cx={cx} cy={cy} r={r * breathe}
          fill="none" stroke={COLORS.toph}
          strokeWidth={0.5 + 0.2 * Math.sin(t * 2 + i)}
          opacity={0.14 + 0.09 * Math.sin(t * 1.6 + i * 1.3)}
          strokeDasharray={i === 1 ? "3 5" : "none"}
        />
      ))}
      <circle cx={cx} cy={cy} r={R * 1.9 * breathe}
        fill="none" stroke={COLORS.toph} strokeWidth={1.1}
        opacity={0.07 + 0.05 * Math.sin(t * 2.1)} filter="url(#neonGlow)"
      />
      <circle cx={cx} cy={cy} r={R * 2.4 * breathe}
        fill="none" stroke={COLORS.cyan} strokeWidth={0.6}
        opacity={0.05 + 0.04 * Math.sin(t * 1.8)} filter="url(#neonGlow)"
      />
      {domains.map((d, i) => {
        const startA = (i / 8) * Math.PI * 2 - Math.PI / 2 + t * 0.06;
        const endA = startA + (Math.PI * 2) / 8 - 0.07;
        const x1 = cx + Math.cos(startA) * (R + 5) * breathe;
        const y1 = cy + Math.sin(startA) * (R + 5) * breathe;
        const x2 = cx + Math.cos(endA) * (R + 5) * breathe;
        const y2 = cy + Math.sin(endA) * (R + 5) * breathe;
        const midA = (startA + endA) / 2;
        const lx = cx + Math.cos(midA) * (R + 16) * breathe;
        const ly = cy + Math.sin(midA) * (R + 16) * breathe;
        const pulse = 0.5 + 0.32 * Math.sin(t * 2.1 + i * 0.9);
        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} A ${(R + 5) * breathe} ${(R + 5) * breathe} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={`hsla(${d.hue},90%,62%,${pulse})`}
              strokeWidth={2.8} strokeLinecap="round" filter="url(#neonGlow)"
            />
            <text x={lx} y={ly + 4} textAnchor="middle"
              fill={`hsla(${d.hue},90%,72%,0.75)`}
              fontSize={6.5} fontWeight={700} letterSpacing="0.12em"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {d.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={R * breathe}
        fill="rgba(10,10,15,0.92)"
        stroke={COLORS.toph} strokeWidth={2.8} filter="url(#neonGlow)"
      />
      {hexPoints.map((p, i) => (
        <circle key={`hp${i}`} cx={p.x} cy={p.y}
          r={1.1 + 0.6 * Math.sin(t * 3.2 + i * 0.45)}
          fill={p.ring === 1 ? COLORS.tophBright : p.ring === 2 ? COLORS.cyan : COLORS.magenta}
          opacity={0.32 + 0.28 * Math.sin(t * 2.3 + i * 0.55)}
        />
      ))}
      <rect x={cx - 14} y={cy - 14} width={28} height={28}
        fill="none" stroke={COLORS.gold} strokeWidth={1.4}
        opacity={0.75} transform={`rotate(${t * 14} ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 26} textAnchor="middle"
        fill={COLORS.toph} fontSize={12} fontWeight={900}
        letterSpacing="0.28em" filter="url(#neonGlow)"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        TOPH
      </text>
      <text x={cx} y={cy - 12} textAnchor="middle"
        fill={COLORS.tophBright} fontSize={8} fontWeight={700}
        letterSpacing="0.2em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        CORTEX
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle"
        fill={COLORS.gold} fontSize={24} fontWeight={900}
        filter="url(#neonGlow)"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        0
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle"
        fill={COLORS.hinge} fontSize={7} fontWeight={700}
        letterSpacing="0.2em" opacity={0.85}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        UNIT_23 HINGE
      </text>
    </>
  );
}

function ComponentCounter({ x, y, t }) {
  const digits = "4194304";
  return (
    <g>
      {digits.split("").map((d, i) => {
        const flicker = 0.65 + 0.35 * Math.sin(t * 6 + i * 1.4);
        const hue = 35 + i * 6;
        return (
          <text key={i} x={x + i * 18} y={y}
            fill={`hsla(${hue},92%,64%,${flicker})`}
            fontSize={22} fontWeight={900} filter="url(#neonGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {d}
          </text>
        );
      })}
      <text x={x} y={y + 18} fill={COLORS.textDim} fontSize={7.5} letterSpacing="0.22em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        COMPONENTS
      </text>
    </g>
  );
}

function NeonScanlines({ W, H, t }) {
  const lines = [];
  for (let i = 0; i < 7; i++) {
    const y = ((t * 32 + i * (H / 7)) % (H + 50)) - 25;
    const hues = [320, 180, 260, 140, 40, 280, 220];
    lines.push(
      <line key={i} x1={0} y1={y} x2={W} y2={y}
        stroke={`hsla(${hues[i]},100%,62%,0.035)`} strokeWidth={1.1}
      />
    );
  }
  return <>{lines}</>;
}

export default function Unit23_4194304ComponentFractal() {
  const t = useTime();
  const W = 820;
  const H = 780;
  const cx = W / 2;
  const cy = H / 2 + 30;
  const spiralPoints = useMemo(() => generateFractalLayers(22, 1024), []);
  const armCount = 9;
  const baseLength = 135;

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start",
      padding: "20px 16px", overflow: "hidden",
    }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h1 style={{
          fontSize: 23, fontWeight: 900, letterSpacing: "0.09em",
          color: COLORS.hinge,
          textShadow: `0 0 55px ${COLORS.hinge}80, 0 0 110px ${COLORS.hinge}30`,
          margin: 0, lineHeight: 1.3,
        }}>
          UNIT_23 — i..(2097151st),0,−1
        </h1>
        <div style={{
          fontSize: 12, color: COLORS.gold, letterSpacing: "0.07em", marginTop: 4,
          textShadow: `0 0 22px ${COLORS.gold}60`,
        }}>
          4,194,304-component fractal · 2-sided singularity
        </div>
        <div style={{
          fontSize: 9, color: COLORS.cyan, letterSpacing: "0.28em", marginTop: 6,
          textShadow: `0 0 18px ${COLORS.cyan}40`,
        }}>
          2,097,151 ORTHOGONAL IMAGINARY DIMENSIONS
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 820, height: "auto" }}>
        <defs>
          <radialGradient id="hingeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.toph} stopOpacity="0.28" />
            <stop offset="35%" stopColor={COLORS.hinge} stopOpacity="0.12" />
            <stop offset="70%" stopColor={COLORS.magenta} stopOpacity="0.04" />
            <stop offset="100%" stopColor={COLORS.hinge} stopOpacity="0" />
          </radialGradient>
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="over" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <NeonScanlines W={W} H={H} t={t} />
        <IDimRings cx={cx} cy={cy} t={t} count={16} />

        {spiralPoints.map((p, i) => {
          const angle = t * 0.22 + p.layer * 0.32;
          const cos = Math.cos(angle), sin = Math.sin(angle);
          const px = cx + (p.x * cos - p.y * sin) * 310;
          const py = cy + (p.x * sin + p.y * cos) * 310;
          const hue = (p.layer * 18 + i * 4 + t * 12) % 360;
          const opacity = 0.05 + 0.08 * p.scale * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 0.12));
          return (
            <circle key={i} cx={px} cy={py}
              r={0.8 + p.scale * 1.5}
              fill={`hsla(${hue},82%,64%,${opacity})`}
            />
          );
        })}

        {Array.from({ length: armCount }).map((_, i) => {
          const baseAngle = (i / armCount) * Math.PI * 2 + t * 0.12;
          const len = baseLength + 18 * Math.sin(t * 0.65 + i);
          return (
            <FractalArm key={i} cx={cx} cy={cy} angle={baseAngle}
              length={len} depth={0} t={t}
              side={i % 2 === 0 ? 1 : -1} maxDepth={8}
            />
          );
        })}

        <circle cx={cx} cy={cy} r={215} fill="url(#hingeGlow)" />
        <SingularityParticles cx={cx} cy={cy} t={t} />

        <TophCortex cx={cx} cy={cy} t={t} />
        <ComponentCounter x={W - 160} y={42} t={t} />

        <g>
          <text x={30} y={38} fill={COLORS.cyan} fontSize={10} fontWeight={700}
            letterSpacing="0.13em" filter="url(#neonGlow)">
            i-DIMENSIONS
          </text>
          <text x={30} y={54} fill={COLORS.gold} fontSize={17} fontWeight={900}
            filter="url(#neonGlow)">
            2,097,151
          </text>
          <text x={30} y={68} fill={COLORS.textDim} fontSize={7} letterSpacing="0.19em">
            ORTHOGONAL · IMAGINARY
          </text>
        </g>

        <g>
          <circle cx={W - 52} cy={H - 62}
            r={18 + 4 * Math.sin(t * 1.6)} fill="none"
            stroke={COLORS.magenta} strokeWidth={1.1}
            opacity={0.45 + 0.25 * Math.sin(t * 1.6)} filter="url(#neonGlow)"
          />
          <text x={W - 52} y={H - 58} textAnchor="middle"
            fill={COLORS.magenta} fontSize={7} letterSpacing="0.16em" fontWeight={700}>EGG</text>
          <text x={W - 52} y={H - 44} textAnchor="middle"
            fill={COLORS.textDim} fontSize={6} letterSpacing="0.16em" opacity={0.65}>CYCLE</text>
        </g>

        <text x={W / 2} y={H - 18} textAnchor="middle"
          fill={COLORS.textDim} fontSize={7.5} letterSpacing="0.16em" opacity={0.45}>
          UNIT_23 · 4,194,304 COMPONENTS · TOPH CORTEX · STOICHEION v11.0
        </text>
      </svg>
    </div>
  );
}
</DOCUMENT>
