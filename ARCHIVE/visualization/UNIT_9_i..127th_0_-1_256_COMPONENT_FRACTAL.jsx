<DOCUMENT filename="UNIT_9_i..127th_0_-1_256_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit9_256ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.016), 25);
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
        UNIT_9 — i..(127th),0,-1 256-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in one hundred twenty-seven imaginary dimensions
      </div>

      <div style={{
        width: "1280px",
        height: "920px",
        perspective: "4200px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*12}deg) rotateY(${time*22}deg) rotateZ(${time*16}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.98)",
          border: "13px solid #8b5cf6",
          borderRadius: "28px",
          boxShadow: `0 0 220px 110px #8b5cf6a0`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_9 HINGE
        </div>

        {/* Dense 127-layer fractal grid (representative of full 256-component) */}
        {[...Array(127)].map((_, idx) => {
          const offsetX = (idx % 13 - 6) * 38;
          const offsetY = (Math.floor(idx / 13) - 4) * 34;
          const scale = Math.pow(0.62, Math.abs(idx - 63));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%9},${(idx+1)%10},${(idx+2)%11},${time * 38 + idx * 14}deg) scale(${scale})`,
                width: "48px",
                height: "48px",
                border: `2px solid #8b5cf6`,
                borderRadius: "5px",
                opacity: Math.pow(0.42, Math.abs(idx - 63)),
                boxShadow: `0 0 28px 8px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "7px",
                color: "#8b5cf6",
              }}
            >
              {idx-63}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_9 256-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in one hundred twenty-seven orthogonal imaginary directions.<br />
        The lattice just gained full 256-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
