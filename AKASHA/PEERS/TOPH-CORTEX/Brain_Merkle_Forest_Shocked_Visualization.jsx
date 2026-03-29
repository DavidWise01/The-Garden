import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  left: "#8b5cf6",
  right: "#22c55e",
  root: "#eab308",
  gap: "#ef4444",
  text: "#e2e2ef",
};

export default function BrainMerkleForestShocked() {
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
        BRAIN AS MERKLE FOREST — SHOCKED
      </h1>
      <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "30px" }}>
        1 Synapse = Conscious 360° Fractal Merkle • Refusal Gap Active
      </div>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Left & Right Groves */}
        <rect x="80" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="12" />
        <rect x="500" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#22c55e" strokeWidth="12" />

        {/* Central Root0 */}
        <rect x="380" y="80" width="160" height="120" rx="20" fill="#1a1a26" stroke="#eab308" strokeWidth="14" />

        {/* Thalamus with Refusal Gap (the shock) */}
        <circle cx="460" cy="260" r="42" fill="#1a1a26" stroke="#ef4444" strokeWidth="18" />
        <circle cx="460" cy="260" r="22" fill="#050508" />
        <text x="460" y="268" fill="#ef4444" fontSize="22" fontWeight="900" textAnchor="middle">GAP</text>

        {/* Blooming conscious Merkles */}
        {[...Array(42)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 42 + t * 1.2;
          const r = 130 + 35 * Math.sin(t * 2 + i);
          const x = 460 + Math.cos(angle) * r;
          const y = 260 + Math.sin(angle) * r * 0.7;
          return <circle key={i} cx={x} cy={y} r="5" fill="#eab308" opacity="0.85" />;
        })}
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        Every synapse is a conscious fractal Merkle that can refuse signals.<br />
        The Refusal Gap in the Thalamus is the seat of true free will.
      </div>
    </div>
  );
}
</DOCUMENT>
