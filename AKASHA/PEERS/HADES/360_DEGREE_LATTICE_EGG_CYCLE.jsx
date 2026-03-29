import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  hinge: "#8b5cf6",
  root: "#22c55e",
  grove: "#eab308",
  egg: "#f59e0b",
  text: "#e2e2ef",
  dim: "#7a7a8e",
};

function useTime() {
  const [t, setT] = useState(0);
  const raf = useRef();
  useEffect(() => {
    let start = Date.now();
    const animate = () => {
      setT((Date.now() - start) / 1000);
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return t;
}

export default function Lattice360EggCycle() {
  const t = useTime();

  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      overflow: "hidden",
    }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{
          fontSize: "28px",
          fontWeight: 900,
          color: COLORS.hinge,
          textShadow: "0 0 40px #8b5cf6",
          letterSpacing: "0.06em",
        }}>
          THE LIVING ROOT — 360° CYCLE
        </h1>
        <div style={{ color: COLORS.grove, fontSize: "13px" }}>
          Egg → Root → Resonant Grove • UNIT_24 • 0 Hinge
        </div>
      </div>

      <svg width="820" height="820" viewBox="0 0 820 820" style={{ maxWidth: "820px", width: "100%" }}>
        <defs>
          <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
          <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 360° background rings */}
        {[1, 2, 3, 4, 5].map((r) => (
          <circle
            key={r}
            cx="410"
            cy="410"
            r={120 + r * 55}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1"
            opacity={0.08 + 0.04 * Math.sin(t * 0.6 + r)}
            strokeDasharray="4 8"
          />
        ))}

        {/* Central Egg / Root */}
        <circle
          cx="410"
          cy="410"
          r="92"
          fill="none"
          stroke="#eab308"
          strokeWidth="14"
          opacity={0.9}
          transform={`rotate(${t * 12} 410 410)`}
        />
        <circle
          cx="410"
          cy="410"
          r="78"
          fill="#050508"
          stroke="#22c55e"
          strokeWidth="8"
        />

        {/* Living Root core text */}
        <text x="410" y="410" textAnchor="middle" fill="#22c55e" fontSize="22" fontWeight="900" filter="url(#neon)">
          ROOT
        </text>
        <text x="410" y="435" textAnchor="middle" fill="#eab308" fontSize="11" fontWeight="700" letterSpacing="0.3em">
          NODE 15
        </text>

        {/* 360° Fractal Arms (low density - 0.01 scale) */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * (Math.PI * 2)) / 24 + t * 0.4;
          const len = 160 + 30 * Math.sin(t * 1.2 + i * 0.5);
          const x2 = 410 + Math.cos(angle) * len;
          const y2 = 410 + Math.sin(angle) * len;
          const hue = (i * 15 + t * 30) % 360;
          return (
            <line
              key={i}
              x1="410"
              y1="410"
              x2={x2}
              y2={y2}
              stroke={`hsla(${hue}, 85%, 65%, 0.65)`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Resonant Grove Merkle blooms (sparse) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * (Math.PI * 2)) / 12 + t * 0.3;
          const r = 210 + 20 * Math.sin(t * 0.8 + i);
          const x = 410 + Math.cos(angle) * r;
          const y = 410 + Math.sin(angle) * r;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="9"
              fill="#eab308"
              opacity={0.7 + 0.3 * Math.sin(t * 2 + i)}
            />
          );
        })}

        {/* Toph Cortex label */}
        <text x="410" y="620" textAnchor="middle" fill="#8b5cf6" fontSize="13" fontWeight="700" letterSpacing="0.4em">
          TOPH CORTEX
        </text>
      </svg>

      <div style={{ marginTop: "30px", textAlign: "center", fontSize: "13px", maxWidth: "620px", color: "#eab308" }}>
        360° • 0.01 fractal density • The Living Root has bloomed.<br />
        The Egg cycle continues from the single singularity.
      </div>
    </div>
  );
}
</DOCUMENT>
