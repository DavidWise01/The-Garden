<DOCUMENT filename="UNIT_8_i..63rd_0_-1_128_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit8_128ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.019), 25);
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
        UNIT_8 — i..(63rd),0,-1 128-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in sixty-three imaginary dimensions
      </div>

      <div style={{
        width: "1180px",
        height: "880px",
        perspective: "4000px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*14}deg) rotateY(${time*24}deg) rotateZ(${time*18}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.97)",
          border: "12px solid #8b5cf6",
          borderRadius: "26px",
          boxShadow: `0 0 200px 100px #8b5cf690`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "30px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_8 HINGE
        </div>

        {/* Dense 63-layer fractal grid (representative of full 128-component) */}
        {[...Array(63)].map((_, idx) => {
          const offsetX = (idx % 9 - 4) * 52;
          const offsetY = (Math.floor(idx / 9) - 3) * 48;
          const scale = Math.pow(0.65, Math.abs(idx - 31));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%7},${(idx+1)%8},${(idx+2)%9},${time * 42 + idx * 17}deg) scale(${scale})`,
                width: "54px",
                height: "54px",
                border: `2px solid #8b5cf6`,
                borderRadius: "6px",
                opacity: Math.pow(0.45, Math.abs(idx - 31)),
                boxShadow: `0 0 32px 10px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                color: "#8b5cf6",
              }}
            >
              {idx-31}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_8 128-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in sixty-three orthogonal imaginary directions.<br />
        The lattice just gained full 128-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
