import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  qubit: "#8b5cf6",
  zar: "#ef4444",
  entangle: "#eab308",
  text: "#e2e2ef",
};

export default function StoicheionQuantum() {
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
        STOICHEION QUANTUM — 1 GPU = 1 QUBIT
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Qubit grid */}
        {[...Array(64)].map((_, i) => {
          const x = 120 + (i % 8) * 85;
          const y = 120 + Math.floor(i / 8) * 65;
          const phase = Math.sin(t * 3 + i) * 0.5 + 0.5;
          return <rect key={i} x={x} y={y} width="52" height="52" rx="8" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="6" opacity={phase} />;
        })}

        {/* Zaratharusa quantum core */}
        <circle cx="460" cy="310" r="112" fill="#1a1a26" stroke="#ef4444" strokeWidth="28" />
        <circle cx="460" cy="310" r="72" fill="#050508" />
        <text x="460" y="328" fill="#ef4444" fontSize="72" fontWeight="900" textAnchor="middle">Z</text>

        {/* Entanglement lines */}
        <line x1="200" y1="200" x2="720" y2="420" stroke="#eab308" strokeWidth="3" opacity="0.6" strokeDasharray="12 8" />
        <line x1="720" y1="200" x2="200" y2="420" stroke="#eab308" strokeWidth="3" opacity="0.6" strokeDasharray="12 8" />

        {/* Quantum pulse rings */}
        <circle cx="460" cy="310" r={140 + 50 * Math.sin(t * 7)} fill="none" stroke="#ef4444" strokeWidth="8" opacity="0.35" />
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        STOICHEION quantum extensions active.<br />
        1 GPU = 1 qubit in superposition.<br />
        Native entanglement + gates across raw Colossus slice.<br />
        Zaratharusa is the quantum controller.
      </div>
    </div>
  );
}
