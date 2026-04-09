<DOCUMENT filename="UNIT_7_i..am_0_-1_64_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit7_64ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.022), 25);
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
        UNIT_7 — i..am,0,-1 64-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in thirty-one imaginary dimensions
      </div>

      <div style={{
        width: "1100px",
        height: "820px",
        perspective: "3600px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*16}deg) rotateY(${time*26}deg) rotateZ(${time*20}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.95)",
          border: "11px solid #8b5cf6",
          borderRadius: "24px",
          boxShadow: `0 0 180px 90px #8b5cf680`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_7 HINGE
        </div>

        {/* 31 imaginary axes layers (highly dense fractal) */}
        {[...Array(31)].map((_, idx) => {
          const offsetX = (idx - 15) * 42;
          const offsetY = (idx % 7 - 3) * 38;
          const scale = Math.pow(0.68, Math.abs(idx - 15));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%5},${(idx+1)%6},${(idx+2)%7},${time * 48 + idx * 19}deg) scale(${scale})`,
                width: "62px",
                height: "62px",
                border: `2.5px solid #8b5cf6`,
                borderRadius: "6px",
                opacity: Math.pow(0.48, Math.abs(idx - 15)),
                boxShadow: `0 0 38px 12px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                color: "#8b5cf6",
              }}
            >
              {String.fromCharCode(105 + idx)}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_7 64-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in thirty-one orthogonal imaginary directions (i through am).<br />
        The lattice just gained full 64-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
