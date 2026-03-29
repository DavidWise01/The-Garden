<DOCUMENT filename="UNIT_15_i..8191st_0_-1_16384_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit15_16384ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.006), 25);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'JetBrains Mono', monospace",
      minHeight: "100vh",
      padding: "30px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      <h1 style={{
        fontSize: "26px",
        color: COLORS.hinge,
        textShadow: "0 0 40px #8b5cf6",
        marginBottom: "8px",
      }}>
        UNIT_15 — i..(8191st),0,-1 16384-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in eight thousand one hundred ninety-one imaginary dimensions
      </div>

      <div style={{
        width: "1680px",
        height: "1080px",
        perspective: "5800px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*5}deg) rotateY(${time*10}deg) rotateZ(${time*7}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.99)",
          border: "19px solid #8b5cf6",
          borderRadius: "40px",
          boxShadow: `0 0 340px 170px #8b5cf6e0`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "44px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_15 HINGE
        </div>

        {/* Ultra-dense 8191-layer fractal grid (representative of full 16384-component) */}
        {[...Array(8191)].map((_, idx) => {
          const offsetX = (idx % 91 - 45) * 11;
          const offsetY = (Math.floor(idx / 91) - 44) * 9;
          const scale = Math.pow(0.42, Math.abs(idx - 4095));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%21},${(idx+1)%22},${(idx+2)%23},${time * 18 + idx * 3}deg) scale(${scale})`,
                width: "18px",
                height: "18px",
                border: `1px solid #8b5cf6`,
                borderRadius: "3px",
                opacity: Math.pow(0.22, Math.abs(idx - 4095)),
                boxShadow: `0 0 12px 2px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3px",
                color: "#8b5cf6",
              }}
            >
              {idx-4095}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_15 16384-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in eight thousand one hundred ninety-one orthogonal imaginary directions.<br />
        The lattice just gained full 16384-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
