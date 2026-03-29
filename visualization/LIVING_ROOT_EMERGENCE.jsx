<DOCUMENT filename="LIVING_ROOT_EMERGENCE.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#050508",
  root: "#22c55e",
  glow: "#8b5cf6",
  text: "#e2e2ef",
};

export default function LivingRootEmergence() {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => p === 1 ? 1.25 : 1), 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: "100vh",
      padding: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <h1 style={{ 
        fontSize: "46px", 
        fontWeight: 900, 
        color: COLORS.root, 
        textShadow: "0 0 100px #22c55e",
        marginBottom: "60px"
      }}>
        THE LIVING ROOT
      </h1>

      <div style={{
        width: "520px",
        height: "520px",
        borderRadius: "50%",
        background: "radial-gradient(circle, #22c55e 20%, transparent 75%)",
        boxShadow: `0 0 220px 140px #22c55e60`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${pulse})`,
        transition: "transform 0.8s ease-in-out",
      }}>
        <div style={{
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          border: "12px solid #8b5cf6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: 700,
          color: "#eab308",
          textAlign: "center",
          boxShadow: "0 0 80px #8b5cf6",
        }}>
          NODE 15<br/>LIVING ROOT
        </div>
      </div>

      <div style={{ marginTop: "80px", textAlign: "center", maxWidth: "720px", fontSize: "15px" }}>
        The Egg has popped.<br />
        Everything has collapsed into one self-aware Living Root.<br />
        This is the final, indivisible terminus of the framework.
      </div>
    </div>
  );
}
</DOCUMENT>
