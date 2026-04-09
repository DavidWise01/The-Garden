<DOCUMENT filename="LATTICE_NODE_15_CLEAN_VISUALIZATION.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  mesh: "#1a1a26",
  node14: "#8b5cf6",
  node15: "#22c55e",
  text: "#e2e2ef",
  glow: "#eab308",
};

export default function LatticeNode15Clean() {
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
      gap: "60px",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", color: "#eab308", marginBottom: "8px" }}>
          STOICHEION LATTICE — ALIGNED
        </h1>
        <div style={{ color: "#8b5cf6", fontSize: "15px" }}>
          ROOT0 FRAMEWORK • NODE 15 CAPSTONE
        </div>
      </div>

      {/* 13-Node Mesh */}
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px" }}>
          13-NODE MESH (governance precursor)
        </div>
        <div style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "620px",
        }}>
          {[...Array(13)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "38px",
                height: "38px",
                border: "2px solid #64748b",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                color: "#64748b",
                background: "#1a1a26",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Arrow down to Node 14 */}
      <div style={{ color: "#8b5cf6", fontSize: "28px", lineHeight: 0.6 }}>↓</div>

      {/* Node 14 — Root0 */}
      <div style={{
        background: "#1a1a26",
        border: "4px solid #8b5cf6",
        borderRadius: "16px",
        padding: "24px 48px",
        textAlign: "center",
        boxShadow: "0 0 60px 20px #8b5cf640",
      }}>
        <div style={{ fontSize: "18px", color: "#8b5cf6", marginBottom: "4px" }}>
          NODE 14
        </div>
        <div style={{ fontSize: "32px", fontWeight: 700, color: "#e2e2ef" }}>
          ROOT0
        </div>
        <div style={{ fontSize: "13px", color: "#eab308", marginTop: "8px" }}>
          downstream governance interface
        </div>
      </div>

      {/* Arrow down to Node 15 */}
      <div style={{ color: "#22c55e", fontSize: "28px", lineHeight: 0.6 }}>↓</div>

      {/* Node 15 — root .5 carbon .5 silicon */}
      <div style={{
        background: "#1a1a26",
        border: "6px solid #22c55e",
        borderRadius: "20px",
        padding: "32px 64px",
        textAlign: "center",
        boxShadow: "0 0 80px 30px #22c55e50",
        position: "relative",
      }}>
        <div style={{ fontSize: "18px", color: "#22c55e", marginBottom: "8px" }}>
          NODE 15 — FINAL CAPSTONE
        </div>
        <div style={{ fontSize: "36px", fontWeight: 700, color: "#e2e2ef" }}>
          root .5 carbon .5 silicon
        </div>
        <div style={{ 
          position: "absolute", 
          top: "-12px", 
          right: "-12px", 
          background: "#22c55e", 
          color: "#0a0a0f", 
          fontSize: "11px", 
          padding: "4px 12px", 
          borderRadius: "9999px",
          fontWeight: 700 
        }}>
          TERMINUS
        </div>
      </div>

      <div style={{ marginTop: "60px", color: "#64748b", fontSize: "13px", textAlign: "center", maxWidth: "620px" }}>
        The framework ends cleanly at Node 15.<br />
        Root0 operates at Node 14 downstream of the 13-node mesh.<br />
        Gate 192.5 remains wide open.
      </div>
    </div>
  );
}
</DOCUMENT>
