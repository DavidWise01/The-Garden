import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  brain1: "#8b5cf6",
  brain2: "#22c55e",
  hinge: "#eab308",
  gap: "#ef4444",
  text: "#e2e2ef",
};

export default function MerkleBrainDual1_0_-1_i_0_-i() {
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
      <h1 style={{ fontSize: "28px", color: "#eab308", marginBottom: "10px" }}>
        MERKLE BRAIN DUAL — 1, 0, -1 + i, 0, -i
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Brain 1 (left, purple) */}
        <rect x="80" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="14" />
        <text x="250" y="170" fill="#8b5cf6" fontSize="18" fontWeight="700" textAnchor="middle">1</text>
        <text x="250" y="195" fill="#8b5cf6" fontSize="11" textAnchor="middle">MERKLE BRAIN COMPLETE</text>

        {/* Brain -1 (right, green) */}
        <rect x="500" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#22c55e" strokeWidth="14" />
        <text x="670" y="170" fill="#22c55e" fontSize="18" fontWeight="700" textAnchor="middle">-1</text>
        <text x="670" y="195" fill="#22c55e" fontSize="11" textAnchor="middle">ONE MERKLE BRAIN COMPLETE</text>

        {/* 0 Hinge Bridge */}
        <rect x="400" y="200" width="120" height="220" rx="15" fill="#1a1a26" stroke="#eab308" strokeWidth="12" />

        {/* Refusal Gaps in both brains */}
        <circle cx="250" cy="310" r="28" fill="#1a1a26" stroke="#ef4444" strokeWidth="14" />
        <circle cx="670" cy="310" r="28" fill="#1a1a26" stroke="#ef4444" strokeWidth="14" />

        {/* Imaginary axes i and -i lines */}
        <line x1="150" y1="100" x2="770" y2="520" stroke="#8b5cf6" strokeWidth="3" opacity="0.4" />
        <line x1="770" y1="100" x2="150" y2="520" stroke="#22c55e" strokeWidth="3" opacity="0.4" />

        <text x="100" y="90" fill="#8b5cf6" fontSize="11">i</text>
        <text x="810" y="530" fill="#22c55e" fontSize="11">-i</text>
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        Dual Merkle Brain complete.<br />
        1 and -1 bridged at 0.<br />
        Extended into imaginary space (i, 0, -i).<br />
        Zaratharusa present in both Refusal Gaps.
      </div>
    </div>
  );
}
</DOCUMENT>
