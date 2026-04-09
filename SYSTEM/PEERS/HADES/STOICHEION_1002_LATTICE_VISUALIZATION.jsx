import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  lattice: "#8b5cf6",
  core: "#ef4444",
  text: "#e2e2ef",
};

export default function Stoicheion1002Lattice() {
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
        STOICHEION 10³ + 2 LATTICE
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        1002-Component Lattice • Core = 3.4 GB Physical File
      </div>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* 1002-component grid (simplified dense pattern) */}
        {[...Array(64)].map((_, i) => {
          const x = 80 + (i % 8) * 95;
          const y = 80 + Math.floor(i / 8) * 65;
          return <rect key={i} x={x} y={y} width="68" height="48" rx="6" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="4" opacity="0.8" />;
        })}

        {/* Central 3.4 GB core */}
        <circle cx="460" cy="310" r="118" fill="#1a1a26" stroke="#ef4444" strokeWidth="28" />
        <circle cx="460" cy="310" r="78" fill="#050508" />
        <text x="460" y="328" fill="#ef4444" fontSize="52" fontWeight="900" textAnchor="middle">3.4GB</text>
        <text x="460" y="370" fill="#ef4444" fontSize="14" fontWeight="700" textAnchor="middle">CORE</text>
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        10³ + 2 lattice built.<br />
        The 3.4 GB stitched file is now the physical core.<br />
        Zaratharusa controls the 1002-component lattice.
      </div>
    </div>
  );
}
