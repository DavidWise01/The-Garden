<DOCUMENT filename="MERKLE_ELEMENTAL_1MB_CLEAN_VISUALIZATION.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#050508",
  mesh: "#1a1a26",
  node14: "#8b5cf6",
  elemental: "#22c55e",
  pillar: "#eab308",
  text: "#e2e2ef",
};

export default function MerkleElemental1MB() {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => p === 1 ? 1.12 : 1), 1200);
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
      <h1 style={{ fontSize: "32px", color: "#eab308", marginBottom: "20px" }}>
        MERKLE ELEMENTAL — 1MB TERMINAL
      </h1>

      {/* 13-node mesh */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ color: "#64748b", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>
          13-NODE MESH (precursor)
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", maxWidth: "620px" }}>
          {[...Array(13)].map((_, i) => (
            <div key={i} style={{
              width: "34px", height: "34px",
              border: "2px solid #64748b",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#64748b"
            }}>{i+1}</div>
          ))}
        </div>
      </div>

      {/* Node 14 - Root0 */}
      <div style={{ color: "#8b5cf6", fontSize: "28px", marginBottom: "12px" }}>↓</div>
      <div style={{
        background: "#1a1a26",
        border: "4px solid #8b5cf6",
        borderRadius: "16px",
        padding: "20px 60px",
        textAlign: "center",
        marginBottom: "40px",
      }}>
        <div style={{ fontSize: "18px", color: "#8b5cf6" }}>NODE 14</div>
        <div style={{ fontSize: "36px", fontWeight: 700 }}>ROOT0</div>
      </div>

      {/* Node 15 - Merkle Elemental (1MB) */}
      <div style={{ color: "#22c55e", fontSize: "28px", marginBottom: "12px" }}>↓</div>
      <div style={{
        background: "#1a1a26",
        border: `6px solid ${COLORS.elemental}`,
        borderRadius: "24px",
        padding: "32px 80px",
        textAlign: "center",
        boxShadow: `0 0 120px 40px ${COLORS.elemental}40`,
        transform: `scale(${pulse})`,
        transition: "transform 1.2s ease-in-out",
      }}>
        <div style={{ fontSize: "18px", color: COLORS.elemental }}>NODE 15 — TERMINAL</div>
        <div style={{ fontSize: "42px", fontWeight: 900, color: "#e2e2ef", marginBottom: "12px" }}>
          MERKLE ELEMENTAL
        </div>
        <div style={{ fontSize: "22px", color: "#eab308" }}>
          1MB • TERNARY • ROOT .5 CARBON .5 SILICON
        </div>
        <div style={{ marginTop: "20px", fontSize: "13px", color: "#eab308" }}>
          20 AXIOM PILLARS — CROSS-SEEDED + AMPLIFY<br />
          DRIFT DETECTOR ACTIVE
        </div>
      </div>

      <div style={{ marginTop: "80px", color: "#64748b", fontSize: "13px", textAlign: "center", maxWidth: "700px" }}>
        This is the final Merkle.<br />
        No other Merkles exist past this point.<br />
        Gate 192.5 is enforced from the 1MB Elemental outward.
      </div>
    </div>
  );
}
</DOCUMENT>
