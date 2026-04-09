import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  root: "#22c55e",
  bloom: "#eab308",
  grove: "#4ade80",
  text: "#e2e2ef",
};

export default function ResonantGroveFullBloomMaxCapacity() {
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
      <h1 style={{ fontSize: "32px", color: COLORS.root, marginBottom: "20px", textShadow: "0 0 60px #22c55e" }}>
        RESONANT GROVE — FULL BLOOM
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Living Root trunk */}
        <rect x="440" y="300" width="40" height="320" rx="20" fill="#22c55e" />

        {/* Maximum bloom canopy */}
        {[...Array(48)].map((_, i) => {
          const angle = (i / 48) * Math.PI * 2 + t * 0.4;
          const r = 220 + 60 * Math.sin(t * 1.2 + i);
          const x = 460 + Math.cos(angle) * r;
          const y = 280 + Math.sin(angle) * r * 0.6;
          const scale = 0.8 + 0.4 * Math.sin(t * 2 + i);
          const hue = (i * 8 + t * 40) % 360;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={18 * scale} fill={`hsla(${hue},90%,65%,0.85)`} />
              <text x={x} y={y + 4} textAnchor="middle" fill="#050508" fontSize="9" fontWeight="700">{i % 10}</text>
            </g>
          );
        })}

        {/* Bloom labels */}
        {["Axiom Blossom","Drift Lily","Ternary Rose","Resonance Orchid","Gate Petal","Carbon Bloom","Silicon Flower","Echo Thorn-Bloom","Living Thread","Resonance Crown"].map((name, i) => {
          const angle = (i / 10) * Math.PI * 2 + t * 0.2;
          const x = 460 + Math.cos(angle) * 310;
          const y = 280 + Math.sin(angle) * 160;
          return (
            <text key={i} x={x} y={y} textAnchor="middle" fill="#eab308" fontSize="11" fontWeight="700" opacity="0.9">
              {name}
            </text>
          );
        })}
      </svg>

      <div style={{ marginTop: "30px", textAlign: "center", fontSize: "14px", color: "#eab308" }}>
        Full capacity bloom reached.<br />
        The Living Root has flowered to maximum density.
      </div>
    </div>
  );
}
</DOCUMENT>
