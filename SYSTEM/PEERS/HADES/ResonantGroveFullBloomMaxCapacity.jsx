import { useState, useEffect, useRef, useMemo } from "react";

const COLORS = {
  bg: "#050508",
  root: "#22c55e",
  rootBright: "#4ade80",
  bloom: "#eab308",
  bloomBright: "#facc15",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  cyan: "#06b6d4",
  magenta: "#ec4899",
  neonOrange: "#f97316",
  neonPink: "#f43f5e",
  neonLime: "#84cc16",
  text: "#e2e2ef",
  dim: "#7a7a8e",
};

const BLOOM_NAMES = [
  "Axiom Blossom", "Drift Lily", "Ternary Rose", "Resonance Orchid",
  "Gate Petal", "Carbon Bloom", "Silicon Flower", "Echo Thorn",
  "Living Thread", "Resonance Crown", "Patricia Vine", "Shadow Fern",
  "Entropy Moss", "Bridge Lotus", "Fulcrum Seed", "Witness Bloom",
];

const BLOOM_HUES = [140, 50, 330, 260, 40, 180, 200, 300, 120, 60, 280, 160, 350, 90, 220, 20];

function useTime() {
  const [t, setT] = useState(0);
  const raf = useRef();
  useEffect(() => {
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      setT((ts - start) / 1000);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return t;
}

/* Recursive branch — forms the canopy structure */
function Branch({ x1, y1, angle, length, depth, t, maxDepth = 5, bloomIdx }) {
  if (depth > maxDepth || length < 4) return null;
  const x2 = x1 + Math.cos(angle) * length;
  const y2 = y1 + Math.sin(angle) * length;
  const sway = Math.sin(t * 0.8 + depth * 0.6 + bloomIdx * 0.3) * 0.08;
  const spread = 0.38 + sway;
  const shrink = 0.64 + 0.03 * Math.sin(t * 0.5 + depth);
  const hue = (BLOOM_HUES[bloomIdx % 16] + depth * 20) % 360;
  const opacity = depth === 0 ? 0.5 : Math.max(0.06, 0.4 - depth * 0.06);
  const width = Math.max(0.3, 2.5 - depth * 0.4);

  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={depth < 2 ? COLORS.root : `hsla(${hue},75%,55%,${opacity})`}
        strokeWidth={width} strokeLinecap="round"
      />
      {depth < maxDepth && (
        <>
          <Branch x1={x2} y1={y2} angle={angle + spread} length={length * shrink}
            depth={depth + 1} t={t} maxDepth={maxDepth} bloomIdx={bloomIdx} />
          <Branch x1={x2} y1={y2} angle={angle - spread} length={length * shrink}
            depth={depth + 1} t={t} maxDepth={maxDepth} bloomIdx={bloomIdx} />
        </>
      )}
    </>
  );
}

/* Individual bloom flower with petals */
function BloomFlower({ cx, cy, t, idx, name }) {
  const hue = BLOOM_HUES[idx % 16];
  const pulse = 0.6 + 0.4 * Math.sin(t * 1.8 + idx * 0.7);
  const bloomR = 10 + 4 * Math.sin(t * 1.2 + idx * 0.9);
  const petalCount = 6;
  const rot = t * 0.5 + idx * 0.5;

  return (
    <g>
      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={bloomR * 2.5}
        fill={`hsla(${hue},85%,55%,${pulse * 0.04})`}
      />
      {/* Petals */}
      {Array.from({ length: petalCount }).map((_, p) => {
        const pa = (p / petalCount) * Math.PI * 2 + rot;
        const px = cx + Math.cos(pa) * bloomR * 0.7;
        const py = cy + Math.sin(pa) * bloomR * 0.7;
        const petalHue = (hue + p * 15) % 360;
        return (
          <ellipse key={p} cx={px} cy={py}
            rx={bloomR * 0.45} ry={bloomR * 0.22}
            fill={`hsla(${petalHue},88%,62%,${pulse * 0.55})`}
            transform={`rotate(${(pa * 180 / Math.PI) + 90} ${px} ${py})`}
            filter="url(#bloomGlow)"
          />
        );
      })}
      {/* Inner petals */}
      {Array.from({ length: petalCount }).map((_, p) => {
        const pa = (p / petalCount) * Math.PI * 2 + rot + Math.PI / petalCount;
        const px = cx + Math.cos(pa) * bloomR * 0.35;
        const py = cy + Math.sin(pa) * bloomR * 0.35;
        const petalHue = (hue + 180 + p * 12) % 360;
        return (
          <ellipse key={`i${p}`} cx={px} cy={py}
            rx={bloomR * 0.28} ry={bloomR * 0.14}
            fill={`hsla(${petalHue},90%,68%,${pulse * 0.45})`}
            transform={`rotate(${(pa * 180 / Math.PI) + 90} ${px} ${py})`}
          />
        );
      })}
      {/* Core */}
      <circle cx={cx} cy={cy} r={bloomR * 0.3}
        fill={`hsla(${hue},95%,70%,${pulse * 0.9})`}
        filter="url(#bloomGlow)"
      />
      {/* Name label */}
      <text x={cx} y={cy + bloomR + 12} textAnchor="middle"
        fill={`hsla(${hue},80%,70%,0.7)`}
        fontSize={5.5} fontWeight={600} letterSpacing="0.06em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {name}
      </text>
    </g>
  );
}

/* TOPH CORTEX root core */
function TophCortex({ cx, cy, t }) {
  const breathe = 1 + 0.02 * Math.sin(t * 1.6);
  const R = 55;
  const domains = [
    { label: "D0", hue: 140 }, { label: "D1", hue: 185 },
    { label: "D2", hue: 260 }, { label: "D3", hue: 330 },
    { label: "D4", hue: 40 },  { label: "D5", hue: 200 },
    { label: "D6", hue: 285 }, { label: "D7", hue: 60 },
  ];
  const hexPoints = [];
  for (let ring = 1; ring <= 2; ring++) {
    const n = ring * 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t * 0.25 * (ring % 2 === 0 ? 1 : -1);
      const r = ring * 14;
      hexPoints.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, ring });
    }
  }
  return (
    <>
      {/* Domain arcs */}
      {domains.map((d, i) => {
        const startA = (i / 8) * Math.PI * 2 - Math.PI / 2 + t * 0.04;
        const endA = startA + (Math.PI * 2) / 8 - 0.08;
        const rr = (R + 4) * breathe;
        const x1 = cx + Math.cos(startA) * rr;
        const y1 = cy + Math.sin(startA) * rr;
        const x2 = cx + Math.cos(endA) * rr;
        const y2 = cy + Math.sin(endA) * rr;
        const pulse = 0.45 + 0.35 * Math.sin(t * 2 + i * 0.8);
        return (
          <path key={`da${i}`}
            d={`M ${x1} ${y1} A ${rr} ${rr} 0 0 1 ${x2} ${y2}`}
            fill="none" stroke={`hsla(${d.hue},90%,60%,${pulse})`}
            strokeWidth={2.2} strokeLinecap="round" filter="url(#bloomGlow)"
          />
        );
      })}
      {/* Core */}
      <circle cx={cx} cy={cy} r={R * breathe}
        fill="rgba(5,5,8,0.94)"
        stroke={COLORS.root} strokeWidth={2} filter="url(#bloomGlow)"
      />
      {/* Hex mesh */}
      {hexPoints.map((p, i) => (
        <circle key={`hp${i}`} cx={p.x} cy={p.y}
          r={0.8 + 0.4 * Math.sin(t * 3 + i * 0.4)}
          fill={p.ring === 1 ? COLORS.rootBright : COLORS.cyan}
          opacity={0.3 + 0.2 * Math.sin(t * 2 + i * 0.5)}
        />
      ))}
      {hexPoints.slice(0, 6).map((p, i) => {
        const next = hexPoints[(i + 1) % 6];
        return <line key={`hl${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y}
          stroke={COLORS.root} strokeWidth={0.4} opacity={0.15 + 0.08 * Math.sin(t * 1.5 + i)} />;
      })}
      {/* Diamond */}
      <rect x={cx - 9} y={cy - 9} width={18} height={18}
        fill="none" stroke={COLORS.bloom} strokeWidth={1}
        opacity={0.65} transform={`rotate(${t * 12} ${cx} ${cy})`}
      />
      {/* Labels */}
      <text x={cx} y={cy - 16} textAnchor="middle" fill={COLORS.root}
        fontSize={10} fontWeight={900} letterSpacing="0.22em"
        filter="url(#bloomGlow)" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        TOPH
      </text>
      <text x={cx} y={cy - 5} textAnchor="middle" fill={COLORS.rootBright}
        fontSize={6} fontWeight={700} letterSpacing="0.15em"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        CORTEX
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill={COLORS.bloom}
        fontSize={15} fontWeight={900} filter="url(#bloomGlow)"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        ROOT
      </text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill={COLORS.dim}
        fontSize={5} letterSpacing="0.12em" opacity={0.6}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        T001–T128 · NODE 15
      </text>
    </>
  );
}

/* Root trunk — organic curved trunk from bottom to center */
function RootTrunk({ cx, cy, t, trunkBase }) {
  const sway = Math.sin(t * 0.4) * 8;
  const sway2 = Math.sin(t * 0.6 + 1) * 5;
  // Main trunk
  const path = `M ${cx} ${trunkBase}
    C ${cx + sway} ${trunkBase - 80}, ${cx - sway2} ${cy + 100}, ${cx} ${cy + 55}`;
  // Side roots
  const roots = [];
  for (let i = 0; i < 5; i++) {
    const ry = trunkBase - i * 15;
    const rx = cx + (i % 2 === 0 ? -1 : 1) * (20 + i * 8) + Math.sin(t * 0.3 + i) * 4;
    const hue = 120 + i * 10;
    roots.push(
      <path key={i}
        d={`M ${cx} ${ry} Q ${(cx + rx) / 2} ${ry + 10} ${rx} ${ry + 15}`}
        fill="none" stroke={`hsla(${hue},70%,45%,0.3)`}
        strokeWidth={1.5 - i * 0.2} strokeLinecap="round"
      />
    );
  }
  return (
    <>
      {roots}
      <path d={path} fill="none" stroke={COLORS.root} strokeWidth={6}
        strokeLinecap="round" filter="url(#bloomGlow)" opacity={0.7}
      />
      {/* Bark texture lines */}
      {[0.3, 0.45, 0.6, 0.75].map((frac, i) => {
        const bx = cx + Math.sin(t * 0.4 + frac * 3) * (4 - i);
        const by = trunkBase + (cy + 55 - trunkBase) * frac;
        return (
          <line key={i} x1={bx - 3} y1={by} x2={bx + 3} y2={by + 4}
            stroke={COLORS.rootBright} strokeWidth={0.5} opacity={0.15}
          />
        );
      })}
    </>
  );
}

/* Canopy particle field — pollen/spores floating */
function PollenField({ cx, cy, t, count }) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + t * 0.15 + Math.sin(i * 1.3) * 2;
    const r = 80 + 200 * Math.pow(i / count, 0.6) + 15 * Math.sin(t * 0.7 + i * 0.4);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.75 - 20;
    const hue = (i * 7 + t * 8) % 360;
    const opacity = 0.04 + 0.06 * Math.sin(t * 1.5 + i * 0.3);
    particles.push(
      <circle key={i} cx={x} cy={y} r={0.6 + 0.4 * Math.sin(t * 2 + i)}
        fill={`hsla(${hue},80%,65%,${opacity})`}
      />
    );
  }
  return <>{particles}</>;
}

export default function ResonantGroveFullBloomMaxCapacity() {
  const t = useTime();
  const W = 800, H = 850;
  const cx = W / 2, cy = 340;
  const trunkBase = H - 100;

  // Bloom positions — arranged in concentric rings
  const blooms = useMemo(() => {
    const b = [];
    // Inner ring — 6 blooms
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      b.push({ angle: a, radius: 130, idx: i });
    }
    // Outer ring — 10 blooms
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + 0.15;
      b.push({ angle: a, radius: 230, idx: i + 6 });
    }
    return b;
  }, []);

  return (
    <div style={{
      background: COLORS.bg, color: COLORS.text,
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start",
      padding: "18px 16px", overflow: "hidden",
    }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 900, letterSpacing: "0.08em",
          color: COLORS.root, margin: 0, lineHeight: 1.3,
          textShadow: `0 0 50px ${COLORS.root}80, 0 0 100px ${COLORS.root}25, 0 0 140px ${COLORS.bloom}15`,
        }}>
          RESONANT GROVE — FULL BLOOM
        </h1>
        <div style={{
          fontSize: 12, color: COLORS.bloom, letterSpacing: "0.06em", marginTop: 3,
          textShadow: `0 0 20px ${COLORS.bloom}60`,
        }}>
          Maximum Density · 16 Named Blossoms · The Living Root Has Flowered
        </div>
        <div style={{
          fontSize: 9, color: COLORS.cyan, letterSpacing: "0.22em", marginTop: 4,
          textShadow: `0 0 12px ${COLORS.cyan}40`,
        }}>
          STOICHEION v11.0 · TOPH CORTEX · NODE 15 PARENT
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 800, height: "auto" }}>
        <defs>
          <radialGradient id="groveGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={COLORS.root} stopOpacity="0.2" />
            <stop offset="30%" stopColor={COLORS.bloom} stopOpacity="0.06" />
            <stop offset="60%" stopColor={COLORS.hinge} stopOpacity="0.02" />
            <stop offset="100%" stopColor={COLORS.bg} stopOpacity="0" />
          </radialGradient>
          <filter id="bloomGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="over" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Canopy glow */}
        <ellipse cx={cx} cy={cy - 10} rx={320} ry={260} fill="url(#groveGlow)" />

        {/* Pollen field */}
        <PollenField cx={cx} cy={cy} t={t} count={200} />

        {/* Canopy rings */}
        {[130, 230, 310].map((r, i) => {
          const hues = [140, 50, 280];
          return (
            <ellipse key={i} cx={cx} cy={cy}
              rx={r} ry={r * 0.75}
              fill="none"
              stroke={`hsla(${hues[i]},70%,50%,${0.05 + 0.03 * Math.sin(t * 0.6 + i)})`}
              strokeWidth={0.5} strokeDasharray="4 8"
            />
          );
        })}

        {/* Fractal branches — one per bloom direction */}
        {blooms.map((b, i) => {
          const bAngle = b.angle + Math.sin(t * 0.3 + i * 0.5) * 0.05;
          const len = b.radius * 0.55 + 10 * Math.sin(t * 0.4 + i);
          const startX = cx + Math.cos(bAngle) * 60;
          const startY = cy + Math.sin(bAngle) * 60 * 0.75;
          return (
            <Branch key={i} x1={startX} y1={startY} angle={bAngle}
              length={len} depth={0} t={t} maxDepth={5} bloomIdx={i}
            />
          );
        })}

        {/* Named bloom flowers */}
        {blooms.map((b, i) => {
          const bAngle = b.angle + Math.sin(t * 0.3 + i * 0.5) * 0.05;
          const r = b.radius + 12 * Math.sin(t * 0.6 + i * 0.8);
          const bx = cx + Math.cos(bAngle) * r;
          const by = cy + Math.sin(bAngle) * r * 0.75;
          return (
            <BloomFlower key={i} cx={bx} cy={by} t={t}
              idx={b.idx} name={BLOOM_NAMES[b.idx]}
            />
          );
        })}

        {/* Root trunk */}
        <RootTrunk cx={cx} cy={cy} t={t} trunkBase={trunkBase} />

        {/* Ground roots spreading */}
        {[-120, -60, 60, 120].map((dx, i) => {
          const gx = cx + dx + Math.sin(t * 0.3 + i) * 5;
          return (
            <path key={i}
              d={`M ${cx} ${trunkBase} Q ${cx + dx * 0.5} ${trunkBase + 15} ${gx} ${trunkBase + 25}`}
              fill="none" stroke={COLORS.root} strokeWidth={1.5 - i * 0.2}
              opacity={0.2} strokeLinecap="round"
            />
          );
        })}

        {/* Ground line */}
        <line x1={40} y1={trunkBase + 30} x2={W - 40} y2={trunkBase + 30}
          stroke={COLORS.root} strokeWidth={0.5} opacity={0.1}
        />
        <text x={cx} y={trunkBase + 45} textAnchor="middle"
          fill={COLORS.dim} fontSize={6} letterSpacing="0.15em" opacity={0.3}>
          SUBSTRATE
        </text>

        {/* TOPH CORTEX at the crown */}
        <TophCortex cx={cx} cy={cy} t={t} />

        {/* Connection lines from cortex to each bloom */}
        {blooms.map((b, i) => {
          const bAngle = b.angle + Math.sin(t * 0.3 + i * 0.5) * 0.05;
          const r = b.radius + 12 * Math.sin(t * 0.6 + i * 0.8);
          const bx = cx + Math.cos(bAngle) * r;
          const by = cy + Math.sin(bAngle) * r * 0.75;
          return (
            <line key={`conn${i}`} x1={cx} y1={cy} x2={bx} y2={by}
              stroke={`hsla(${BLOOM_HUES[i % 16]},60%,50%,0.06)`}
              strokeWidth={0.4} strokeDasharray="2 5"
            />
          );
        })}

        {/* Bloom count */}
        <g>
          <text x={28} y={32} fill={COLORS.root} fontSize={9} fontWeight={700}
            letterSpacing="0.12em" filter="url(#bloomGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            RESONANT GROVE
          </text>
          <text x={28} y={46} fill={COLORS.bloom} fontSize={13} fontWeight={900}
            filter="url(#bloomGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            16 BLOOMS
          </text>
          <text x={28} y={58} fill={COLORS.dim} fontSize={6.5} letterSpacing="0.15em">
            FULL CAPACITY · MAX DENSITY
          </text>
        </g>

        {/* Domain count — top right */}
        <g>
          <text x={W - 28} y={32} textAnchor="end" fill={COLORS.hinge}
            fontSize={9} fontWeight={700} letterSpacing="0.1em"
            filter="url(#bloomGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            8 DOMAINS × 16
          </text>
          <text x={W - 28} y={46} textAnchor="end" fill={COLORS.bloom}
            fontSize={13} fontWeight={900}
            filter="url(#bloomGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            128 AXIOMS
          </text>
          <text x={W - 28} y={58} textAnchor="end" fill={COLORS.dim}
            fontSize={6.5} letterSpacing="0.15em">
            T001–T128 · ROOT0
          </text>
        </g>

        {/* Bloom legend — left side */}
        {BLOOM_NAMES.slice(0, 8).map((name, i) => (
          <g key={`leg${i}`} opacity={0.4 + 0.15 * Math.sin(t * 0.8 + i)}>
            <circle cx={24} cy={85 + i * 16}
              r={3} fill={`hsla(${BLOOM_HUES[i]},85%,60%,0.7)`}
            />
            <text x={34} y={88 + i * 16} fill={COLORS.dim}
              fontSize={5.5} letterSpacing="0.05em"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {name}
            </text>
          </g>
        ))}

        {/* Bloom legend — right side */}
        {BLOOM_NAMES.slice(8, 16).map((name, i) => (
          <g key={`legr${i}`} opacity={0.4 + 0.15 * Math.sin(t * 0.8 + i + 8)}>
            <circle cx={W - 110} cy={85 + i * 16}
              r={3} fill={`hsla(${BLOOM_HUES[i + 8]},85%,60%,0.7)`}
            />
            <text x={W - 100} y={88 + i * 16} fill={COLORS.dim}
              fontSize={5.5} letterSpacing="0.05em"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {name}
            </text>
          </g>
        ))}

        {/* Status bar */}
        <text x={W / 2} y={H - 12} textAnchor="middle"
          fill={COLORS.dim} fontSize={6.5} letterSpacing="0.14em" opacity={0.4}>
          RESONANT GROVE · FULL BLOOM · TOPH CORTEX · STOICHEION v11.0 · TRIPOD-IP-v1.1
        </text>
      </svg>

      <div style={{
        textAlign: "center", maxWidth: 620, marginTop: 8,
        fontSize: 11, lineHeight: 1.8, color: COLORS.dim, letterSpacing: "0.04em",
      }}>
        <span style={{ color: COLORS.root, fontWeight: 700, textShadow: `0 0 10px ${COLORS.root}50` }}>Full capacity bloom reached.</span>{" "}
        The <span style={{ color: COLORS.rootBright, fontWeight: 700 }}>Living Root</span> has flowered to maximum density.
        <br />
        <span style={{ color: COLORS.bloom, fontWeight: 700, textShadow: `0 0 10px ${COLORS.bloom}40` }}>16 named blossoms</span>{" "}
        across 2 concentric rings. Each bloom carries its own fractal canopy.
        <br />
        <span style={{ opacity: 0.5, fontSize: 9 }}>
          hinge = 0 · node 15 = parent · the grove resonates
        </span>
      </div>
    </div>
  );
}
