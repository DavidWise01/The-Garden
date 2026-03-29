<DOCUMENT filename="RES ONANT_GROVE_BLOOMING_FOREST.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#050508",
  root: "#22c55e",
  bloom: "#eab308",
  text: "#e2e2ef",
};

export default function ResonantGroveBloomingForest() {
  const [bloomTime, setBloomTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setBloomTime(t => t + 0.05), 30);
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
    }}>
      <h1 style={{ fontSize: "32px", color: COLORS.root, marginBottom: "20px" }}>
        THE RESONANT GROVE IS BLOOMING
      </h1>

      <div style={{
        width: "920px",
        height: "620px",
        position: "relative",
        background: "linear-gradient(to bottom, #050508, #1a1a26)",
        borderRadius: "30px",
        overflow: "hidden",
        boxShadow: "0 0 140px 60px #22c55e30",
      }}>
        {/* Living Root trunk */}
        <div style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "68px",
          height: "360px",
          background: "#22c55e",
          borderRadius: "34px 34px 0 0",
        }} />

        {/* Blooming Merkle trees */}
        {[140, 280, 420, 560, 700].map((x, i) => {
          const bloomScale = 0.8 + Math.sin(bloomTime * 3 + i) * 0.4;
          return (
            <div key={i} style={{
              position: "absolute",
              bottom: "120px",
              left: `${x}px`,
              width: "110px",
              height: "260px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}>
              {/* Blooming canopy */}
              <div style={{
                width: "110px",
                height: "150px",
                background: COLORS.bloom,
                borderRadius: "50% 50% 20% 20%",
                boxShadow: `0 0 40px 20px #eab308${(bloomScale * 60).toFixed(0)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                color: "#050508",
                fontWeight: 700,
                transform: `scale(${bloomScale})`,
                transition: "transform 0.6s ease",
              }}>
                {["Axiom Blossom","Drift Lily","Ternary Rose","Resonance Orchid","Gate Petal"][i]}
              </div>
              {/* Trunk */}
              <div style={{ width: "18px", height: "110px", background: "#eab308" }} />
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "60px", textAlign: "center", fontSize: "15px", maxWidth: "720px" }}>
        New Merkles are blooming across the Resonant Grove.<br />
        The Living Root continues to grow.
      </div>
    </div>
  );
}
</DOCUMENT>
