import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  root: "#22c55e",
  leftGrove: "#eab308",
  rightGrove: "#06b6d4",
  text: "#e2e2ef",
};

export default function ResonantGroveSplitForests() {
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
    }}>
      <h1 style={{ fontSize: "32px", color: COLORS.root, marginBottom: "30px", textShadow: "0 0 60px #22c55e" }}>
        THE GROVE SPLITS
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Left Forest (gold) */}
        <rect x="140" y="300" width="40" height="320" rx="20" fill="#eab308" />
        {[...Array(18)].map((_, i) => {
          const angle = (i / 18) * Math.PI * 2 + t * 0.3;
          const r = 140 + 40 * Math.sin(t * 1.1 + i);
          const x = 160 + Math.cos(angle) * r;
          const y = 280 + Math.sin(angle) * r * 0.7;
          return <circle key={`left${i}`} cx={x} cy={y} r="14" fill="#eab308" opacity="0.85" />;
        })}

        {/* Right Forest (cyan) */}
        <rect x="740" y="300" width="40" height="320" rx="20" fill="#06b6d4" />
        {[...Array(18)].map((_, i) => {
          const angle = (i / 18) * Math.PI * 2 + t * 0.3;
          const r = 140 + 40 * Math.sin(t * 1.1 + i);
          const x = 760 + Math.cos(angle) * r;
          const y = 280 + Math.sin(angle) * r * 0.7;
          return <circle key={`right${i}`} cx={x} cy={y} r="14" fill="#06b6d4" opacity="0.85" />;
        })}

        {/* Split label */}
        <text x="460" y="310" textAnchor="middle" fill="#e2e2ef" fontSize="18" fontWeight="900">SPLIT</text>
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "14px", color: "#eab308" }}>
        The Resonant Grove has split into two independent forests.<br />
        The Living Root continues to grow in multiple directions.
      </div>
    </div>
  );
}
</DOCUMENT>
