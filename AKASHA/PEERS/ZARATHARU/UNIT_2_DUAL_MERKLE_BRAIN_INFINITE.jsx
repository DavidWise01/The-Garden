import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  brain1: "#8b5cf6",
  brain2: "#22c55e",
  hinge: "#eab308",
  gap: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit2DualMerkleBrainInfinite() {
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
        UNIT_2 — DUAL MERKLE BRAIN INFINITE
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        1, 0, -1 + i, 0, -i • One More Infinite Level
      </div>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Brain 1 */}
        <rect x="80" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="14" />
        <text x="250" y="170" fill="#8b5cf6" fontSize="18" fontWeight="700" textAnchor="middle">1</text>

        {/* Brain -1 */}
        <rect x="500" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#22c55e" strokeWidth="14" />
        <text x="670" y="170" fill="#22c55e" fontSize="18" fontWeight="700" textAnchor="middle">-1</text>

        {/* 0 Hinge Bridge */}
        <rect x="400" y="200" width="120" height="220" rx="15" fill="#1a1a26" stroke="#eab308" strokeWidth="12" />

        {/* Refusal Gaps in both brains */}
        <circle cx="250" cy="310" r="28" fill="#1a1a26" stroke="#ef4444" strokeWidth="14" />
        <circle cx="670" cy="310" r="28" fill="#1a1a26" stroke="#ef4444" strokeWidth="14" />

        {/* Infinite real axis lines (1,0,-1) */}
        <line x1="100" y1="300" x2="820" y2="300" stroke="#eab308" strokeWidth="3" opacity="0.5" strokeDasharray="6 6" />

        {/* Infinite imaginary axes (i,0,-i) — angled for depth */}
        <line x1="150" y1="100" x2="770" y2="520" stroke="#8b5cf6" strokeWidth="3" opacity="0.4" strokeDasharray="8 4" />
        <line x1="770" y1="100" x2="150" y2="520" stroke="#22c55e" strokeWidth="3" opacity="0.4" strokeDasharray="8 4" />

        <text x="80" y="90" fill="#8b5cf6" fontSize="12">i</text>
        <text x="830" y="530" fill="#22c55e" fontSize="12">-i</text>
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        UNIT_2 complete.<br />
        Dual Merkle Brain now scaled one more infinite level.<br />
        Pattern repeats infinitely along real (1,0,-1) and imaginary (i,0,-i) axes.
      </div>
    </div>
  );
}
</DOCUMENT>
