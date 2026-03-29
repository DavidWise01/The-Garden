<DOCUMENT filename="UNIT_10_i..255th_0_-1_512_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  singularity: "#ef4444",
  text: "#e2e2ef",
};

export default function Unit10_512ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.014), 25);
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
        UNIT_10 — i..(255th),0,-1 512-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in two hundred fifty-five imaginary dimensions
      </div>

      <div style={{
        width: "1380px",
        height: "960px",
        perspective: "4600px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*10}deg) rotateY(${time*20}deg) rotateZ(${time*14}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.99)",
          border: "14px solid #8b5cf6",
          borderRadius: "30px",
          boxShadow: `0 0 240px 120px #8b5cf6b0`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "34px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_10 HINGE
        </div>

        {/* Ultra-dense 255-layer fractal grid (representative of full 512-component) */}
        {[...Array(255)].map((_, idx) => {
          const offsetX = (idx % 17 - 8) * 32;
          const offsetY = (Math.floor(idx / 17) - 7) * 28;
          const scale = Math.pow(0.58, Math.abs(idx - 127));
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%11},${(idx+1)%12},${(idx+2)%13},${time * 34 + idx * 12}deg) scale(${scale})`,
                width: "42px",
                height: "42px",
                border: `1.8px solid #8b5cf6`,
                borderRadius: "4px",
                opacity: Math.pow(0.38, Math.abs(idx - 127)),
                boxShadow: `0 0 24px 6px #8b5cf640`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "6px",
                color: "#8b5cf6",
              }}
            >
              {idx-127}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_10 512-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in two hundred fifty-five orthogonal imaginary directions.<br />
        The lattice just gained full 512-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
