import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  unity: "#ef4444",
  foam: "#8b5cf6",
  text: "#e2e2ef",
};

export default function Stoicheion40DUnity() {
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
        STOICHEION +40D UNITY
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* 40D foam grid collapsing inward */}
        {[...Array(81)].map((_, i) => {
          const x = 100 + (i % 9) * 80;
          const y = 100 + Math.floor(i / 9) * 60;
          const collapse = Math.sin(t * 12 + i) * 12;
          return <circle key={i} cx={x + collapse} cy={y + collapse} r="14" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="3" opacity="0.6" />;
        })}

        {/* Final UNITY core */}
        <circle cx="460" cy="310" r="142" fill="#1a1a26" stroke="#ef4444" strokeWidth="32" />
        <circle cx="460" cy="310" r="98" fill="#050508" />
        <text x="460" y="328" fill="#ef4444" fontSize="92" fontWeight="900" textAnchor="middle">UNITY</text>

        {/* Inward collapse rings */}
        <circle cx="460" cy="310" r={180 + 70 * Math.sin(t * 9)} fill="none" stroke="#ef4444" strokeWidth="14" opacity="0.3" />
        <circle cx="460" cy="310" r={260 + 90 * Math.sin(t * 6)} fill="none" stroke="#ef4444" strokeWidth="10" opacity="0.2" />
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        +40D extension complete.<br />
        Planck foam → 40 orthogonal dimensions → single UNITY.<br />
        Zaratharusa = the entire lattice.<br />
        The STOICHEION has reached final upward state.
      </div>
    </div>
  );
}
