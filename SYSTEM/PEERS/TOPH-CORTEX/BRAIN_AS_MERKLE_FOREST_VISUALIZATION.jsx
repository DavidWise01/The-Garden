import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#050508",
  left: "#8b5cf6",
  right: "#22c55e",
  root: "#eab308",
  text: "#e2e2ef",
};

export default function BrainAsMerkleForest() {
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
        HUMAN BRAIN AS MERKLE FOREST
      </h1>
      <div style={{ color: "#8b5cf6", fontSize: "14px", marginBottom: "30px" }}>
        1 Synapse = Full 360° Fractal 01 Merkle at Bloom
      </div>

      <svg width="920" height="620" viewBox="0 0 920 620" style={{ maxWidth: "920px", width: "100%" }}>
        {/* Left Hemisphere (Purple) */}
        <rect x="80" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#8b5cf6" strokeWidth="12" />
        <text x="250" y="190" fill="#8b5cf6" fontSize="18" fontWeight="700" textAnchor="middle">LEFT</text>
        <text x="250" y="215" fill="#8b5cf6" fontSize="11" textAnchor="middle">LOGICAL GROVE</text>

        {/* Right Hemisphere (Green) */}
        <rect x="500" y="120" width="340" height="380" rx="30" fill="#1a1a26" stroke="#22c55e" strokeWidth="12" />
        <text x="670" y="190" fill="#22c55e" fontSize="18" fontWeight="700" textAnchor="middle">RIGHT</text>
        <text x="670" y="215" fill="#22c55e" fontSize="11" textAnchor="middle">CREATIVE GROVE</text>

        {/* Central Root (Prefrontal Cortex) */}
        <rect x="380" y="80" width="160" height="120" rx="20" fill="#1a1a26" stroke="#eab308" strokeWidth="14" />
        <text x="460" y="130" fill="#eab308" fontSize="22" fontWeight="900" textAnchor="middle">ROOT0</text>
        <text x="460" y="155" fill="#eab308" fontSize="11" textAnchor="middle">PREFRONTAL CORTEX</text>

        {/* Thalamus - 0 Hinge */}
        <circle cx="460" cy="260" r="38" fill="#1a1a26" stroke="#eab308" strokeWidth="8" />
        <text x="460" y="268" fill="#eab308" fontSize="14" fontWeight="700" textAnchor="middle">0</text>

        {/* Other organs */}
        <text x="180" y="380" fill="#8b5cf6" fontSize="12">HIPPOCAMPUS</text>
        <text x="180" y="400" fill="#8b5cf6" fontSize="12">AMYGDALA</text>
        <text x="680" y="380" fill="#22c55e" fontSize="12">BASAL GANGLIA</text>
        <text x="680" y="400" fill="#22c55e" fontSize="12">CEREBELLUM</text>

        {/* Blooming Merkles (synapses) */}
        {[...Array(36)].map((_, i) => {
          const angle = (i * Math.PI * 2) / 36 + t * 0.8;
          const r = 110 + Math.sin(t + i) * 20;
          const x = 460 + Math.cos(angle) * r;
          const y = 260 + Math.sin(angle) * r * 0.6;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="6"
              fill="#eab308"
              opacity={0.7 + 0.3 * Math.sin(t * 2 + i)}
            />
          );
        })}
      </svg>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "720px" }}>
        Every synapse is a full 360° fractal Merkle at bloom.<br />
        Left and Right Groves • Central Root0 • All governance organs present.
      </div>
    </div>
  );
}
</DOCUMENT>
