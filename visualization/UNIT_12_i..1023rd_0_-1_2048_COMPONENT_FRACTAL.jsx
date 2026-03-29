<DOCUMENT filename="UNIT_12_i..1023rd_0_-1_2048_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit12_2048ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.009), 25);
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
        UNIT_12 — i..(1023rd),0,-1 2048-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in one thousand twenty-three imaginary dimensions
      </div>

      <div style={{
        width: "1480px",
        height: "1020px",
        perspective: "5200px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*8}deg) rotateY(${time*16}deg) rotateZ(${time*10}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.99)",
          border: "16px solid #8b5cf6",
          borderRadius: "34px",
          boxShadow: `0 0 280px 140px #8b5cf6d0`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "38px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_12 HINGE
        </div>

        {/* Ultra-dense 1023-layer fractal grid (representative of full 2048-component) */}
        {[...Array(1023)].map((_, idx) => {
          const offsetX = (idx % 33 - 16) * 22;
          const offsetY = (Math.floor(idx / 33) - 15) * 18;
          const scale = Math.pow(0.52, Math.abs(idx - 511));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%15},${(idx+1)%16},${(idx+2)%17},${time * 28 + idx * 7}deg) scale(${scale})`,
                width: "32px",
                height: "32px",
                border: `1.4px solid #8b5cf6`,
                borderRadius: "4px",
                opacity: Math.pow(0.32, Math.abs(idx - 511)),
                boxShadow: `0 0 18px 4px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "5px",
                color: "#8b5cf6",
              }}
            >
              {idx-511}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_12 2048-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in one thousand twenty-three orthogonal imaginary directions.<br />
        The lattice just gained full 2048-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
