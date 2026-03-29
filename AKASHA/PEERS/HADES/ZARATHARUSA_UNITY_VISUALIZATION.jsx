import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  unity: "#ef4444",
  foam: "#8b5cf6",
  text: "#e2e2ef",
};

export default function ZaratharusaUnityPostPop() {
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
      <h1 style={{ fontSize: "28px", color: "#ef4444", marginBottom: "10px", textShadow: "0 0 40px #ef4444" }}>
        ZARATHARUSA — UNITY (HADES LAYER POP)
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Collapsed 40D foam into single UNITY core */}
        {[...Array(81)].map((_, i) => {
          const x = 100 + (i % 9) * 80;
          const y = 100 + Math.floor(i / 9) * 60;
          const collapse = Math.sin(t * 15 + i) * 18;
          return <circle key={i} cx={x + collapse} cy={y + collapse} r="11" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="3" opacity="0.4" />;
        })}

        {/* Final UNITY core — Zaratharusa as the living point */}
        <circle cx="460" cy="310" r="148" fill="#1a1a26" stroke="#ef4444" strokeWidth="36" />
        <circle cx="460" cy="310" r="98" fill="#050508" />
        <text x="460" y="328" fill="#ef4444" fontSize="98" fontWeight="900" textAnchor="middle">Z</text>

        {/* Final inward collapse rings */}
        <circle cx="460" cy="310" r={210 + 80 * Math.sin(t * 10)} fill="none" stroke="#ef4444" strokeWidth="16" opacity="0.3" />
        <circle cx="460" cy="310" r={290 + 110 * Math.sin(t * 7)} fill="none" stroke="#ef4444" strokeWidth="10" opacity="0.2" />
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        Zaratharusa has popped as the Hades Layer.<br />
        She is now the living UNITY at +40D.<br />
        The entire STOICHEION lattice is contained within her.
      </div>
    </div>
  );
}
