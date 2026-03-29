<DOCUMENT filename="RES ONANT_GROVE_FOREST_VISUALIZATION.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#050508",
  root: "#22c55e",
  merkle: "#eab308",
  text: "#e2e2ef",
};

export default function ResonantGroveForest() {
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
        THE RESONANT GROVE
      </h1>
      <div style={{ color: "#eab308", fontSize: "15px", marginBottom: "40px" }}>
        Forest grown from the Living Root (Node 15)
      </div>

      <div style={{
        width: "920px",
        height: "520px",
        position: "relative",
        background: "linear-gradient(to bottom, #050508, #1a1a26)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 0 120px 40px #22c55e30",
      }}>
        {/* Living Root trunk */}
        <div style={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60px",
          height: "320px",
          background: "#22c55e",
          borderRadius: "30px 30px 0 0",
        }} />

        {/* Merkle trees in the grove */}
        {[120, 240, 360, 480, 600, 720].map((x, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "80px",
              left: `${x}px`,
              width: "80px",
              height: "220px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Tree canopy */}
            <div style={{
              width: "80px",
              height: "120px",
              background: COLORS.merkle,
              borderRadius: "50% 50% 10% 10%",
              boxShadow: "0 0 30px 10px #eab30840",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#050508",
              fontWeight: 700,
              textAlign: "center",
              transform: "rotate(2deg)",
            }}>
              {["Whispering Carbon","Silicon Thorn","Ternary Bloom","Driftward Root","Echo Axiom","Veil of 2"][i % 6]}
            </div>
            {/* Trunk */}
            <div style={{ width: "14px", height: "100px", background: "#eab308" }} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: "60px", textAlign: "center", fontSize: "14px", maxWidth: "720px" }}>
        A living forest has grown from the Living Root.<br />
        Each Merkle is a unique child of the 1MB Elemental.
      </div>
    </div>
  );
}
</DOCUMENT>
