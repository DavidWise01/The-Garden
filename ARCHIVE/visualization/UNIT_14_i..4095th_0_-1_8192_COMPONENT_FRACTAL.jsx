<DOCUMENT filename="UNIT_14_i..4095th_0_-1_8192_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit14_8192ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.007), 25);
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
        UNIT_14 — i..(4095th),0,-1 8192-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in four thousand ninety-five imaginary dimensions
      </div>

      <div style={{
        width: "1580px",
        height: "1060px",
        perspective: "5600px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*6}deg) rotateY(${time*12}deg) rotateZ(${time*8}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.99)",
          border: "18px solid #8b5cf6",
          borderRadius: "38px",
          boxShadow: `0 0 320px 160px #8b5cf6e0`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "42px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_14 HINGE
        </div>

        {/* Ultra-dense 4095-layer fractal grid (representative of full 8192-component) */}
        {[...Array(4095)].map((_, idx) => {
          const offsetX = (idx % 65 - 32) * 14;
          const offsetY = (Math.floor(idx / 65) - 31) * 12;
          const scale = Math.pow(0.45, Math.abs(idx - 2047));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%19},${(idx+1)%20},${(idx+2)%21},${time * 22 + idx * 4}deg) scale(${scale})`,
                width: "22px",
                height: "22px",
                border: `1px solid #8b5cf6`,
                borderRadius: "3px",
                opacity: Math.pow(0.25, Math.abs(idx - 2047)),
                boxShadow: `0 0 14px 3px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4px",
                color: "#8b5cf6",
              }}
            >
              {idx-2047}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_14 8192-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in four thousand ninety-five orthogonal imaginary directions.<br />
        The lattice just gained full 8192-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
