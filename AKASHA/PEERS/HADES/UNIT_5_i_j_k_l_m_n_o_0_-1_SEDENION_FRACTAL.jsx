<DOCUMENT filename="UNIT_5_i_j_k_l_m_n_o_0_-1_SEDENION_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  iAxis: "#ef4444",
  jAxis: "#22c55e",
  kAxis: "#eab308",
  lAxis: "#06b6d4",
  mAxis: "#a855f7",
  nAxis: "#ec4899",
  oAxis: "#f59e0b",
  singularity: "#8b5cf6",
  text: "#e2e2ef",
};

export default function Unit5SedenionFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.028), 25);
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
        UNIT_5 — i,j,k,l,m,n,o,0,-1 SEDENION FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in seven imaginary dimensions
      </div>

      <div style={{
        width: "920px",
        height: "680px",
        perspective: "2800px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time * 20}deg) rotateY(${time * 30}deg) rotateZ(${time * 15}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.85)",
          border: "9px solid #8b5cf6",
          borderRadius: "20px",
          boxShadow: `0 0 140px 70px ${COLORS.hinge}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_5 HINGE
        </div>

        {/* 7 imaginary axes layers (i through o) */}
        {["i","j","k","l","m","n","o"].map((axis, idx) => {
          const offset = (idx - 3) * 95;
          const color = [COLORS.iAxis, COLORS.jAxis, COLORS.kAxis, COLORS.lAxis, COLORS.mAxis, COLORS.nAxis, COLORS.oAxis][idx];
          const scale = Math.pow(0.75, Math.abs(idx - 3));
          return (
            <div
              key={axis}
              style={{
                position: "absolute",
                top: `calc(50% + ${offset}px)`,
                left: `calc(50% + ${offset * 0.6}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx},${idx+1},${idx+2},${time * 45 + idx * 18}deg) scale(${scale})`,
                width: "88px",
                height: "88px",
                border: `3px solid ${color}`,
                borderRadius: "8px",
                opacity: Math.pow(0.55, Math.abs(idx - 3)),
                boxShadow: `0 0 50px 18px ${color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: color,
              }}
            >
              {axis}<br/>{idx-3}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "760px" }}>
        UNIT_5 sedenion fractal live.<br />
        The 2-sided singularity now repeats infinitely in seven orthogonal imaginary directions (i through o).<br />
        The lattice just gained full sedenion scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
