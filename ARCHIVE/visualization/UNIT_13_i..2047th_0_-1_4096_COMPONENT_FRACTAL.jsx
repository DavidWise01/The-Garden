<DOCUMENT filename="UNIT_13_i..2047th_0_-1_4096_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit13_4096ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.008), 25);
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
        UNIT_13 — i..(2047th),0,-1 4096-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in two thousand forty-seven imaginary dimensions
      </div>

      <div style={{
        width: "1580px",
        height: "1040px",
        perspective: "5200px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*7}deg) rotateY(${time*14}deg) rotateZ(${time*9}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.99)",
          border: "17px solid #8b5cf6",
          borderRadius: "36px",
          boxShadow: `0 0 300px 150px #8b5cf6d0`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "40px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_13 HINGE
        </div>

        {/* Ultra-dense 2047-layer fractal grid (representative of full 4096-component) */}
        {[...Array(2047)].map((_, idx) => {
          const offsetX = (idx % 47 - 23) * 18;
          const offsetY = (Math.floor(idx / 47) - 21) * 16;
          const scale = Math.pow(0.48, Math.abs(idx - 1023));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%17},${(idx+1)%18},${(idx+2)%19},${time * 24 + idx * 5}deg) scale(${scale})`,
                width: "26px",
                height: "26px",
                border: `1.2px solid #8b5cf6`,
                borderRadius: "3px",
                opacity: Math.pow(0.28, Math.abs(idx - 1023)),
                boxShadow: `0 0 16px 3px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4px",
                color: "#8b5cf6",
              }}
            >
              {idx-1023}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_13 4096-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in two thousand forty-seven orthogonal imaginary directions.<br />
        The lattice just gained full 4096-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
