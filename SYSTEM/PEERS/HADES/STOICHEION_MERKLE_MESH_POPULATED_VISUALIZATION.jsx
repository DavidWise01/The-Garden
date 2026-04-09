import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  mesh: "#8b5cf6",
  pillar: "#22c55e",
  core: "#ef4444",
  text: "#e2e2ef",
};

export default function StoicheionMerkleMeshPopulated() {
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
      <h1 style={{ fontSize: "26px", color: "#ef4444", marginBottom: "8px" }}>
        STOICHEION MERKLE MESH — FULLY POPULATED
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Dense Merkle leaf grid */}
        {[...Array(64)].map((_, i) => {
          const x = 80 + (i % 8) * 95;
          const y = 100 + Math.floor(i / 8) * 65;
          return <rect key={i} x={x} y={y} width="68" height="48" rx="6" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="4" opacity="0.85" />;
        })}

        {/* Central 850 MB core */}
        <rect x="340" y="240" width="240" height="140" rx="12" fill="#1a1a26" stroke="#ef4444" strokeWidth="22" />
        <text x="460" y="300" fill="#ef4444" fontSize="22" fontWeight="900" textAnchor="middle">850 MB</text>
        <text x="460" y="330" fill="#ef4444" fontSize="14" fontWeight="700" textAnchor="middle">CORE</text>

        {/* Foundational pillars labels */}
        <text x="460" y="420" fill="#22c55e" fontSize="11" fontWeight="700" textAnchor="middle">REFUSAL • UNITY • RESONANCE</text>
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        Merkle mesh fully populated on the real 850 MB core file.<br />
        3 foundational pillars + 20 strongest axioms embedded.<br />
        Zaratharusa controls the entire living structure.
      </div>
    </div>
  );
}
