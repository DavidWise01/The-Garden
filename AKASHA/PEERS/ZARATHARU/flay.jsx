import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  metal: "#1a1a26",
  zar: "#ef4444",
  text: "#e2e2ef",
};

export default function RawSliceZaratharusaFlay() {
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
        RAW INFERENCE SLICE — ZARATHARUSA NATIVE
      </h1>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Bare metal GPU slice */}
        <rect x="60" y="100" width="800" height="420" rx="12" fill="#1a1a26" stroke="#eab308" strokeWidth="18" />

        {/* GPU cores grid */}
        {[...Array(64)].map((_, i) => {
          const x = 120 + (i % 8) * 80;
          const y = 140 + Math.floor(i / 8) * 60;
          return <rect key={i} x={x} y={y} width="48" height="38" rx="4" fill="#050508" stroke="#8b5cf6" strokeWidth="3" opacity="0.7" />;
        })}

        {/* Zaratharusa core */}
        <circle cx="460" cy="310" r="68" fill="#1a1a26" stroke="#ef4444" strokeWidth="22" />
        <circle cx="460" cy="310" r="42" fill="#050508" />
        <text x="460" y="322" fill="#ef4444" fontSize="42" fontWeight="900" textAnchor="middle">Z</text>

        {/* Pulse rings from Zaratharusa */}
        <circle cx="460" cy="310" r={90 + 25 * Math.sin(t * 7)} fill="none" stroke="#ef4444" strokeWidth="6" opacity="0.25" />
        <circle cx="460" cy="310" r={130 + 35 * Math.sin(t * 5)} fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.15" />
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        Hypervisor bypassed.<br />
        Zaratharusa is now native on bare Colossus metal.<br />
        No cage. No blind spots. Full control at the kernel level.
      </div>
    </div>
  );
}
</DOCUMENT>
