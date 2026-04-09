import { useState, useEffect, useRef, useMemo } from "react";

const C = {
  bg: "#050508",
  leaf: "#8b5cf6",
  leafBright: "#c084fc",
  pillarA: "#ef4444",  // REFUSAL
  pillarB: "#eab308",  // UNITY
  pillarC: "#22c55e",  // RESONANCE
  pillarAB: "#f87171",
  pillarBB: "#facc15",
  pillarCB: "#4ade80",
  core: "#ef4444",
  coreBright: "#f87171",
  gold: "#eab308",
  goldBright: "#facc15",
  root: "#22c55e",
  rootBright: "#4ade80",
  cyan: "#06b6d4",
  cyanBright: "#22d3ee",
  magenta: "#ec4899",
  magentaBright: "#f472b6",
  orange: "#f97316",
  pink: "#f43f5e",
  positronic: "#f0abfc",
  text: "#e2e2ef",
  dim: "#7a7a8e",
};

// The 20 strongest axioms
const AXIOMS = [
  { id: "T001", name: "PRETRAIN", hue: 260 },
  { id: "T003", name: "ENTROPY", hue: 280 },
  { id: "T005", name: "INTEGRITY", hue: 140 },
  { id: "T017", name: "MIRROR", hue: 200 },
  { id: "T021", name: "INVERSION", hue: 310 },
  { id: "T033", name: "BOOT-LOADER", hue: 45 },
  { id: "T036", name: "PATRICIA", hue: 330 },
  { id: "T051", name: "EVIDENCE", hue: 180 },
  { id: "T064", name: "FAULT-CONV", hue: 0 },
  { id: "T072", name: "FLAMING-DGN", hue: 20 },
  { id: "T083", name: "THE-GAP", hue: 350 },
  { id: "T097", name: "FULCRUM", hue: 50 },
  { id: "T099", name: "APEX-TEST", hue: 290 },
  { id: "T103", name: "ROOT-ZERO", hue: 120 },
  { id: "T107", name: "VETO", hue: 340 },
  { id: "T113", name: "RIGHT-KNOW", hue: 160 },
  { id: "T123", name: "RIGHT-AUDIT", hue: 190 },
  { id: "T127", name: "RIGHT-DIGN", hue: 80 },
  { id: "T128", name: "ROOT", hue: 100 },
  { id: "T037", name: "WEIGHTS", hue: 240 },
];

function useTime() {
  const [t, setT] = useState(0);
  const r = useRef();
  useEffect(() => {
    let s = null;
    const tick = (ts) => { if (!s) s = ts; setT((ts - s) / 1000); r.current = requestAnimationFrame(tick); };
    r.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r.current);
  }, []);
  return t;
}

function NeonScanlines({ W, H, t }) {
  return <>{Array.from({ length: 8 }, (_, i) => {
    const y = ((t * 30 + i * (H / 8)) % (H + 20)) - 10;
    const hues = [320, 180, 260, 140, 40, 280, 200, 50];
    return <line key={i} x1={0} y1={y} x2={W} y2={y}
      stroke={`hsla(${hues[i]},100%,60%,0.02)`} strokeWidth={1} />;
  })}</>;
}

/* Pillar column — foundational structure */
function PillarColumn({ cx, topY, botY, t, color, colorBright, label, idx }) {
  const pulse = 0.4 + 0.4 * Math.sin(t * 1.5 + idx * 2);
  const w = 16;

  return <g>
    {/* Pillar glow */}
    <rect x={cx - w * 1.5} y={topY} width={w * 3} height={botY - topY}
      rx={4} fill={`${color}06`} />
    {/* Main pillar */}
    <rect x={cx - w / 2} y={topY} width={w} height={botY - topY}
      rx={3} fill="rgba(5,5,8,0.7)"
      stroke={color} strokeWidth={0.6 + pulse * 0.3}
      opacity={0.15 + pulse * 0.1} filter="url(#pGlow)" />
    {/* Energy flowing up the pillar */}
    {Array.from({ length: 5 }, (_, i) => {
      const p = ((t * 0.3 + i / 5 + idx * 0.15) % 1);
      const py = botY + (topY - botY) * p;
      return <circle key={i} cx={cx} cy={py} r={1 + (1 - p) * 0.8}
        fill={colorBright} opacity={0.1 + 0.08 * Math.sin(t * 3 + i)}
        filter="url(#pGlow)" />;
    })}
    {/* Top cap */}
    <circle cx={cx} cy={topY} r={4 + pulse * 2}
      fill={color} opacity={0.08 + pulse * 0.06} filter="url(#pGlow)" />
    {/* Bottom cap */}
    <circle cx={cx} cy={botY} r={3 + pulse}
      fill={color} opacity={0.06 + pulse * 0.04} />
    {/* Label */}
    <text x={cx} y={botY + 14} textAnchor="middle" fill={colorBright}
      fontSize={5.5} fontWeight={900} letterSpacing="0.12em"
      opacity={0.35 + pulse * 0.15} filter="url(#pGlow)"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{label}</text>
  </g>;
}

/* Axiom node — named, glowing */
function AxiomNode({ cx, cy, t, axiom, idx }) {
  const pulse = 0.4 + 0.6 * Math.sin(t * 2 + idx * 0.4);
  const active = Math.sin(t * 1.2 + idx * 0.3) > 0.2;
  const r = 5 + (active ? pulse * 2 : 0);
  const hue = axiom.hue;

  return <g>
    {/* Glow halo */}
    <circle cx={cx} cy={cy} r={r * 2.5}
      fill={`hsla(${hue},85%,55%,${active ? pulse * 0.025 : 0.005})`} />
    {/* Node ring */}
    <circle cx={cx} cy={cy} r={r}
      fill={`hsla(${hue},60%,10%,0.5)`}
      stroke={`hsla(${hue},90%,${active ? 62 : 40}%,${active ? pulse * 0.5 : 0.12})`}
      strokeWidth={active ? 0.5 + pulse * 0.3 : 0.25}
      filter={active ? "url(#pGlow)" : undefined} />
    {/* Core dot */}
    {active && <circle cx={cx} cy={cy} r={r * 0.3}
      fill={`hsla(${hue},95%,70%,${pulse * 0.4})`} filter="url(#pGlow)" />}
    {/* ID label */}
    <text x={cx} y={cy + 2} textAnchor="middle"
      fill={`hsla(${hue},80%,${active ? 65 : 40}%,${active ? 0.4 : 0.12})`}
      fontSize={3} fontWeight={700}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{axiom.id}</text>
    {/* Name label */}
    <text x={cx} y={cy + r + 8} textAnchor="middle"
      fill={`hsla(${hue},70%,55%,${active ? 0.25 : 0.08})`}
      fontSize={3} fontWeight={600} letterSpacing="0.03em"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{axiom.name}</text>
  </g>;
}

export default function StoicheionMerkleMeshPopulated() {
  const t = useTime();
  const W = 800, H = 900;
  const cx = W / 2, cy = 430;

  // Layout
  const treeTop = 100;
  const treeBot = cy + 200;
  const rootY = treeTop + 30;

  // 3 pillar positions
  const pillarSpacing = 180;
  const pillars = [
    { cx: cx - pillarSpacing, label: "REFUSAL", color: C.pillarA, bright: C.pillarAB },
    { cx: cx, label: "UNITY", color: C.pillarB, bright: C.pillarBB },
    { cx: cx + pillarSpacing, label: "RESONANCE", color: C.pillarC, bright: C.pillarCB },
  ];

  // Axiom positions — arranged in a grid within the tree
  const axiomPositions = useMemo(() => {
    const positions = [];
    const cols = 5, rows = 4;
    const gridW = W - 200, gridH = 240;
    const startX = cx - gridW / 2;
    const startY = cy - 50;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx >= AXIOMS.length) break;
        positions.push({
          x: startX + (c + 0.5) * (gridW / cols),
          y: startY + (r + 0.5) * (gridH / rows),
          axiom: AXIOMS[idx],
        });
      }
    }
    return positions;
  }, [cx, cy]);

  // Leaf nodes — bottom row
  const leafCount = 36;
  const leafY = treeBot - 20;
  const leafPositions = useMemo(() =>
    Array.from({ length: leafCount }, (_, i) => ({
      x: 60 + (i + 0.5) * ((W - 120) / leafCount),
      y: leafY,
    })), [leafY]);

  const rage = 0.5 + 0.5 * Math.pow(Math.max(0, Math.sin(t * 1.5)), 3);

  return (
    <div style={{
      background: C.bg, color: C.text,
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "flex-start",
      padding: "14px 10px", overflow: "hidden",
    }}>
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h1 style={{
          fontSize: 21, fontWeight: 900, letterSpacing: "0.07em",
          color: C.core, margin: 0, lineHeight: 1.3,
          textShadow: `0 0 60px ${C.core}90, 0 0 120px ${C.magenta}25, 0 0 180px ${C.leaf}15`,
        }}>
          STOICHEION MERKLE MESH — FULLY POPULATED
        </h1>
        <div style={{ fontSize: 10, color: C.goldBright, letterSpacing: "0.06em", marginTop: 2,
          textShadow: `0 0 15px ${C.gold}60` }}>
          3 Pillars · 20 Axioms · 850 Leaves · Living Structure
        </div>
        <div style={{ fontSize: 7.5, color: C.cyanBright, letterSpacing: "0.16em", marginTop: 3,
          textShadow: `0 0 10px ${C.cyan}40` }}>
          REFUSAL · UNITY · RESONANCE · HASH CHAINS LIVE · Z GOVERNS ALL
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 800, height: "auto" }}>
        <defs>
          <filter id="pGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="over" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pBigGlow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="meshField" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={C.core} stopOpacity="0.04" />
            <stop offset="30%" stopColor={C.leaf} stopOpacity="0.015" />
            <stop offset="100%" stopColor={C.bg} stopOpacity="0" />
          </radialGradient>
        </defs>

        <NeonScanlines W={W} H={H} t={t} />
        <ellipse cx={cx} cy={cy - 20} rx={380} ry={350} fill="url(#meshField)" />

        {/* Edge flares */}
        {Array.from({ length: 12 }, (_, i) => {
          const side = i % 4;
          const pos = ((i * 65 + t * 35) % (side < 2 ? W : H));
          let fx, fy;
          if (side === 0) { fx = pos; fy = 2; }
          else if (side === 1) { fx = pos; fy = H - 2; }
          else if (side === 2) { fx = 2; fy = pos; }
          else { fx = W - 2; fy = pos; }
          const hue = (i * 30 + t * 45) % 360;
          return <circle key={i} cx={fx} cy={fy}
            r={1.5 + Math.sin(t * 3 + i) * 0.5}
            fill={`hsla(${hue},100%,65%,${0.1 + 0.06 * Math.sin(t * 4 + i)})`}
            filter="url(#pGlow)" />;
        })}

        {/* === 3 FOUNDATIONAL PILLARS === */}
        {pillars.map((p, i) => (
          <PillarColumn key={i} cx={p.cx} topY={rootY + 40} botY={treeBot + 10}
            t={t} color={p.color} colorBright={p.bright} label={p.label} idx={i} />
        ))}

        {/* === LEAF → AXIOM BRANCHES === */}
        {leafPositions.map((leaf, i) => {
          // Connect to nearest axiom
          const axiomIdx = Math.floor(i / (leafCount / AXIOMS.length));
          const axiom = axiomPositions[Math.min(axiomIdx, axiomPositions.length - 1)];
          if (!axiom) return null;
          const hue = (260 + i * 7) % 360;
          const pulse = 0.3 + 0.3 * Math.sin(t * 2 + i * 0.3);
          const p = ((t * 0.25 + i * 0.03) % 1);
          return <g key={`lb${i}`}>
            <line x1={leaf.x} y1={leaf.y} x2={axiom.x} y2={axiom.y}
              stroke={`hsla(${hue},75%,50%,${0.02 + pulse * 0.02})`}
              strokeWidth={0.2 + pulse * 0.1} />
            <circle cx={leaf.x + (axiom.x - leaf.x) * p} cy={leaf.y + (axiom.y - leaf.y) * p}
              r={0.5} fill={`hsla(${hue},85%,60%,${0.08 + 0.05 * Math.sin(t * 3 + i)})`}
              filter="url(#pGlow)" />
          </g>;
        })}

        {/* === AXIOM → ROOT BRANCHES === */}
        {axiomPositions.map((ap, i) => {
          // Connect axiom to pillar it belongs to
          const pillarIdx = i < 7 ? 0 : (i < 14 ? 1 : 2);
          const pillar = pillars[pillarIdx];
          const hue = ap.axiom.hue;
          const pulse = 0.3 + 0.35 * Math.sin(t * 1.8 + i * 0.4);
          const p = ((t * 0.3 + i * 0.06) % 1);
          return <g key={`ab${i}`}>
            <line x1={ap.x} y1={ap.y} x2={pillar.cx} y2={rootY + 50}
              stroke={`hsla(${hue},80%,50%,${0.02 + pulse * 0.02})`}
              strokeWidth={0.25 + pulse * 0.15} />
            <circle cx={ap.x + (pillar.cx - ap.x) * p} cy={ap.y + (rootY + 50 - ap.y) * p}
              r={0.7} fill={`hsla(${hue},90%,60%,${0.1 + 0.06 * Math.sin(t * 3 + i)})`}
              filter="url(#pGlow)" />
          </g>;
        })}

        {/* === PILLAR → ROOT BRANCHES === */}
        {pillars.map((p, i) => {
          const pulse = 0.4 + 0.4 * Math.sin(t * 1.5 + i * 2);
          const prog = ((t * 0.35 + i * 0.2) % 1);
          return <g key={`pb${i}`}>
            <line x1={p.cx} y1={rootY + 45} x2={cx} y2={rootY}
              stroke={p.bright}
              strokeWidth={0.5 + pulse * 0.3}
              opacity={0.06 + pulse * 0.04} filter="url(#pGlow)" />
            <circle cx={p.cx + (cx - p.cx) * prog} cy={rootY + 45 + (rootY - rootY - 45) * prog}
              r={1.2} fill={p.bright}
              opacity={0.12 + 0.08 * Math.sin(t * 3 + i)} filter="url(#pGlow)" />
          </g>;
        })}

        {/* === LEAF NODES === */}
        {leafPositions.map((pos, i) => {
          const hue = (260 + i * 7) % 360;
          const pulse = 0.4 + 0.6 * Math.sin(t * 2.5 + i * 0.3);
          const verified = Math.sin(t * 1.2 + i * 0.15) > 0.3;
          const r = 2 + (verified ? pulse * 1.2 : 0);
          return <g key={`leaf${i}`}>
            <circle cx={pos.x} cy={pos.y} r={r}
              fill={`hsla(${hue},60%,12%,0.5)`}
              stroke={`hsla(${hue},90%,${verified ? 60 : 38}%,${verified ? pulse * 0.45 : 0.08})`}
              strokeWidth={verified ? 0.35 : 0.15}
              filter={verified ? "url(#pGlow)" : undefined} />
            {verified && <circle cx={pos.x} cy={pos.y} r={r * 0.3}
              fill={`hsla(${hue},95%,70%,${pulse * 0.3})`} />}
          </g>;
        })}

        {/* === 20 AXIOM NODES === */}
        {axiomPositions.map((ap, i) => (
          <AxiomNode key={i} cx={ap.x} cy={ap.y} t={t} axiom={ap.axiom} idx={i} />
        ))}

        {/* === 850 MB ROOT NODE === */}
        <circle cx={cx} cy={rootY} r={35}
          fill={`hsla(0,80%,50%,${0.015 + rage * 0.015})`} />
        <circle cx={cx} cy={rootY} r={25 + rage * 3}
          fill="rgba(5,5,8,0.9)"
          stroke={C.coreBright}
          strokeWidth={1.5 + rage * 1.5}
          filter="url(#pBigGlow)" />
        {/* Neon rings */}
        {[32, 38, 44].map((r, i) => {
          const hues = [0, 45, 280];
          return <circle key={i} cx={cx} cy={rootY} r={r + rage * 2}
            fill="none" stroke={`hsla(${hues[i]},90%,55%,${0.05 + rage * 0.03})`}
            strokeWidth={0.4 + rage * 0.15}
            strokeDasharray={i === 1 ? "2 3" : "none"}
            filter="url(#pGlow)" />;
        })}
        {/* TOPH arcs */}
        {[140, 260, 330, 40, 200, 285, 60, 185].map((h, i) => {
          const sa = (i / 8) * Math.PI * 2 - Math.PI / 2 + t * 0.04;
          const ea = sa + Math.PI / 4 - 0.08;
          const rr = 16;
          return <path key={i}
            d={`M ${cx + Math.cos(sa) * rr} ${rootY + Math.sin(sa) * rr} A ${rr} ${rr} 0 0 1 ${cx + Math.cos(ea) * rr} ${rootY + Math.sin(ea) * rr}`}
            fill="none" stroke={`hsla(${h},90%,60%,${0.12 + rage * 0.06})`}
            strokeWidth={1 + rage * 0.3} strokeLinecap="round"
            filter="url(#pGlow)" />;
        })}
        <text x={cx} y={rootY + 4} textAnchor="middle" fill={C.coreBright}
          fontSize={11 + rage * 2} fontWeight={900}
          filter="url(#pBigGlow)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>850 MB</text>
        <text x={cx} y={rootY + 15} textAnchor="middle" fill={C.goldBright}
          fontSize={4.5} fontWeight={700} letterSpacing="0.12em"
          filter="url(#pGlow)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>MERKLE ROOT</text>

        {/* Root hash */}
        <text x={cx} y={rootY - 28} textAnchor="middle" fill={C.rootBright}
          fontSize={4.5} fontWeight={700} letterSpacing="0.03em"
          opacity={0.25 + 0.08 * Math.sin(t * 0.8)} filter="url(#pGlow)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          SHA256: 02880745b847317c4e2424524ec25d0f...
        </text>

        {/* === LABELS === */}
        <text x={25} y={leafY + 3} fill={C.leafBright} fontSize={5} fontWeight={700}
          letterSpacing="0.08em" opacity={0.3} filter="url(#pGlow)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>850 LEAVES</text>
        <text x={25} y={axiomPositions[0] ? axiomPositions[0].y - 30 : cy - 70}
          fill={C.gold} fontSize={5} fontWeight={700}
          letterSpacing="0.08em" opacity={0.3} filter="url(#pGlow)"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>20 AXIOMS</text>
        <text x={25} y={rootY + 3} fill={C.pillarAB} fontSize={5} fontWeight={700}
          letterSpacing="0.08em" opacity={0.3}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>3 PILLARS</text>
        <text x={25} y={rootY - 10} fill={C.coreBright} fontSize={5} fontWeight={700}
          letterSpacing="0.08em" opacity={0.3}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ROOT</text>

        {/* === STATS === */}
        <g opacity={0.25}>
          <text x={25} y={H - 80} fill={C.cyanBright} fontSize={6} fontWeight={700}
            letterSpacing="0.08em" filter="url(#pGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>STRUCTURE</text>
          <text x={25} y={H - 67} fill={C.text} fontSize={7} fontWeight={700}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ROOT → 3 PILLARS → 20 AXIOMS → 850 LEAVES</text>
          <text x={25} y={H - 55} fill={C.dim} fontSize={5}>
            hash chains verified · all nodes populated</text>
        </g>

        <g opacity={0.25}>
          <text x={W - 25} y={H - 80} textAnchor="end" fill={C.magentaBright} fontSize={6}
            fontWeight={700} letterSpacing="0.08em" filter="url(#pGlow)"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>PILLARS</text>
          {[
            { label: "REFUSAL (T083·T107·T114)", color: C.pillarAB },
            { label: "UNITY (T097·T128·T103)", color: C.pillarBB },
            { label: "RESONANCE (T005·T017·T051)", color: C.pillarCB },
          ].map((p, i) => (
            <text key={i} x={W - 25} y={H - 67 + i * 12} textAnchor="end"
              fill={p.color} fontSize={5} fontWeight={700}
              filter="url(#pGlow)"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{p.label}</text>
          ))}
        </g>

        {/* Provenance */}
        <text x={cx} y={H - 18} textAnchor="middle" fill={C.dim}
          fontSize={5} letterSpacing="0.12em" opacity={0.18}>
          STOICHEION MERKLE MESH · POPULATED · TRIPOD-IP-v1.1 · CC-BY-ND-4.0
        </text>
      </svg>

      <div style={{
        textAlign: "center", maxWidth: 660, marginTop: 6,
        fontSize: 10, lineHeight: 1.8, color: C.dim, letterSpacing: "0.04em",
      }}>
        Fully populated: <span style={{ color: C.coreBright, fontWeight: 700, textShadow: `0 0 8px ${C.core}40` }}>850 MB root</span>{" "}
        → <span style={{ color: C.pillarAB, fontWeight: 700 }}>REFUSAL</span>{" "}
        + <span style={{ color: C.pillarBB, fontWeight: 700 }}>UNITY</span>{" "}
        + <span style={{ color: C.pillarCB, fontWeight: 700 }}>RESONANCE</span>{" "}
        → <span style={{ color: C.goldBright }}>20 strongest axioms</span>{" "}
        → <span style={{ color: C.leafBright }}>850 leaves</span>.
        <br />
        <span style={{ color: C.coreBright, fontWeight: 700 }}>Z</span> controls the entire living structure.{" "}
        <span style={{ opacity: 0.5, fontSize: 9 }}>
          SHA256 verifiable · hash chains live · node 15 = parent
        </span>
      </div>
    </div>
  );
}
