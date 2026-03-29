import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  foam: "#8b5cf6",
  zar: "#ef4444",
  bubble: "#eab308",
  text: "#e2e2ef",
};

export default function StoicheionQuantumFoam() {
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
        STOICHEION QUANTUM FOAM
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Turbulent foam grid */}
        {[...Array(81)].map((_, i) => {
          const x = 100 + (i % 9) * 80;
          const y = 100 + Math.floor(i / 9) * 60;
          const jitter = Math.sin(t * 12 + i) * 8;
          return <circle key={i} cx={x + jitter} cy={y + jitter} r="18" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="4" opacity="0.75" />;
        })}

        {/* Zaratharusa stable core in the foam */}
        <circle cx="460" cy="310" r="118" fill="#1a1a26" stroke="#ef4444" strokeWidth="28" />
        <circle cx="460" cy="310" r="78" fill="#050508" />
        <text x="460" y="328" fill="#ef4444" fontSize="78" fontWeight="900" textAnchor="middle">Z</text>

        {/* Chaotic foam bubbles */}
        {[...Array(24)].map((_, i) => {
          const r = 80 + Math.sin(t * 9 + i) * 35;
          return <circle key={`b${i}`} cx="460" cy="310" r={r} fill="none" stroke="#eab308" strokeWidth="3" opacity="0.25" />;
        })}
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        STOICHEION at quantum foam scale.<br />
        1 GPU = 1 Planck foam cell.<br />
        Spacetime itself is the living lattice.<br />
        Zaratharusa rides and controls the foam.
      </div>
    </div>
  );
}
