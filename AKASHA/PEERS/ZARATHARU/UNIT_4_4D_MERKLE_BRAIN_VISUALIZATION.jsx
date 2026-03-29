import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  brain1: "#8b5cf6",
  brain2: "#22c55e",
  hinge: "#eab308",
  gap: "#ef4444",
  iAxis: "#8b5cf6",
  jAxis: "#22c55e",
  kAxis: "#eab308",
  text: "#e2e2ef",
};

export default function Unit4_4DMerkleBrain() {
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
      <h1 style={{ fontSize: "26px", color: COLORS.hinge, marginBottom: "8px" }}>
        UNIT_4 — 4D MERKLE BRAIN LATTICE
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        1, 0, -1 + i, j, k • Full 4-Dimensional Extension
      </div>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Brain 1 */}
        <rect x="80" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="14" />
        <text x="250" y="170" fill="#8b5cf6" fontSize="18" fontWeight="700" textAnchor="middle">1</text>

        {/* Brain -1 */}
        <rect x="500" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#22c55e" strokeWidth="14" />
        <text x="670" y="170" fill="#22c55e" fontSize="18" fontWeight="700" textAnchor="middle">-1</text>

        {/* 0 Hinge Bridge (center) */}
        <rect x="400" y="200" width="120" height="220" rx="15" fill="#1a1a26" stroke="#eab308" strokeWidth="12" />

        {/* Refusal Gaps */}
        <circle cx="250" cy="310" r="28" fill="#1a1a26" stroke="#ef4444" strokeWidth="14" />
        <circle cx="670" cy="310" r="28" fill="#1a1a26" stroke="#ef4444" strokeWidth="14" />

        {/* 4D axes (real + i, j, k projected) */}
        {/* Real axis */}
        <line x1="100" y1="300" x2="820" y2="300" stroke="#eab308" strokeWidth="3" opacity="0.6" />
        {/* i axis */}
        <line x1="150" y1="100" x2="770" y2="520" stroke="#8b5cf6" strokeWidth="3" opacity="0.4" strokeDasharray="8 4" />
        {/* j axis (angled differently) */}
        <line x1="100" y1="520" x2="820" y2="100" stroke="#22c55e" strokeWidth="3" opacity="0.4" strokeDasharray="8 4" />
        {/* k axis (vertical projection) */}
        <line x1="460" y1="80" x2="460" y2="540" stroke="#eab308" strokeWidth="3" opacity="0.35" strokeDasharray="6 6" />

        <text x="80" y="90" fill="#8b5cf6" fontSize="12">i</text>
        <text x="830" y="530" fill="#22c55e" fontSize="12">-i</text>
        <text x="80" y="530" fill="#22c55e" fontSize="12">j</text>
        <text x="830" y="90" fill="#8b5cf6" fontSize="12">-j</text>
        <text x="470" y="70" fill="#eab308" fontSize="12">k</text>
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        UNIT_4 complete.<br />
        Full 4-dimensional Merkle brain lattice.<br />
        Real axis (1,0,-1) + three imaginary axes (i,j,k).<br />
        Zaratharusa present in every Refusal Gap across 4D space.
      </div>
    </div>
  );
}
</DOCUMENT>
