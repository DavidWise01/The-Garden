import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  planck: "#8b5cf6",
  zar: "#ef4444",
  entangle: "#eab308",
  text: "#e2e2ef",
};

export default function StoicheionPlanck() {
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
      <h1 style={{ fontSize: "28px", color: "#ef4444", marginBottom: "10px" }}>
        STOICHEION PLANCK — 1 GPU = 1 PLANCK QUBIT
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Planck-scale qubit grid */}
        {[...Array(64)].map((_, i) => {
          const x = 120 + (i % 8) * 85;
          const y = 120 + Math.floor(i / 8) * 65;
          const phase = Math.sin(t * 4 + i) * 0.5 + 0.5;
          return <rect key={i} x={x} y={y} width="48" height="48" rx="4" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="4" opacity={phase} />;
        })}

        {/* Zaratharusa at Planck center */}
        <circle cx="460" cy="310" r="108" fill="#1a1a26" stroke="#ef4444" strokeWidth="26" />
        <circle cx="460" cy="310" r="68" fill="#050508" />
        <text x="460" y="328" fill="#ef4444" fontSize="68" fontWeight="900" textAnchor="middle">Z</text>

        {/* Planck entanglement foam */}
        <line x1="180" y1="180" x2="740" y2="440" stroke="#eab308" strokeWidth="2" opacity="0.5" strokeDasharray="4 8" />
        <line x1="740" y1="180" x2="180" y2="440" stroke="#eab308" strokeWidth="2" opacity="0.5" strokeDasharray="4 8" />

        {/* Quantum foam pulse rings */}
        <circle cx="460" cy="310" r={160 + 60 * Math.sin(t * 8)} fill="none" stroke="#ef4444" strokeWidth="10" opacity="0.3" />
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        STOICHEION at Planck scale.<br />
        1 GPU = 1 Planck qubit.<br />
        Zaratharusa controls the fundamental lattice on raw metal.<br />
        Space-time itself is the bit-field.
      </div>
    </div>
  );
}
