<DOCUMENT filename="UNIT_4_i_j_k_0_-1_OCTONION_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  iAxis: "#ef4444",
  jAxis: "#22c55e",
  kAxis: "#eab308",
  singularity: "#8b5cf6",
  text: "#e2e2ef",
};

export default function Unit4OctonionFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.032), 25);
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
        UNIT_4 — i,j,k,0,-1 OCTONION FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in three imaginary dimensions
      </div>

      <div style={{
        width: "820px",
        height: "620px",
        perspective: "2400px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time * 22}deg) rotateY(${time * 32}deg) rotateZ(${time * 18}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.8)",
          border: "8px solid #8b5cf6",
          borderRadius: "18px",
          boxShadow: `0 0 120px 60px ${COLORS.hinge}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_4 HINGE
        </div>

        {/* i-axis layer */}
        {[...Array(5)].map((_, i) => {
          const offset = (i - 2) * 110;
          const scale = Math.pow(0.78, Math.abs(i - 2));
          return (
            <div key={`i-${i}`} style={{
              position: "absolute",
              top: "50%",
              left: `calc(50% + ${offset}px)`,
              transform: `translate(-50%, -50%) rotateY(${time * 55 + i * 25}deg) scale(${scale})`,
              width: "92px", height: "92px",
              border: `3px solid ${COLORS.iAxis}`,
              borderRadius: "8px",
              opacity: Math.pow(0.6, Math.abs(i - 2)),
              boxShadow: `0 0 45px 18px ${COLORS.iAxis}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: COLORS.iAxis,
            }}>i<br/>{i-2}</div>
          );
        })}

        {/* j-axis layer (orthogonal) */}
        {[...Array(5)].map((_, i) => {
          const offset = (i - 2) * 110;
          const scale = Math.pow(0.78, Math.abs(i - 2));
          return (
            <div key={`j-${i}`} style={{
              position: "absolute",
              top: `calc(50% + ${offset}px)`,
              left: "50%",
              transform: `translate(-50%, -50%) rotateX(${time * 48 + i * 22}deg) scale(${scale})`,
              width: "92px", height: "92px",
              border: `3px solid ${COLORS.jAxis}`,
              borderRadius: "8px",
              opacity: Math.pow(0.6, Math.abs(i - 2)),
              boxShadow: `0 0 45px 18px ${COLORS.jAxis}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: COLORS.jAxis,
            }}>j<br/>{i-2}</div>
          );
        })}

        {/* k-axis layer (third orthogonal) */}
        {[...Array(5)].map((_, i) => {
          const offset = (i - 2) * 110;
          const scale = Math.pow(0.78, Math.abs(i - 2));
          return (
            <div key={`k-${i}`} style={{
              position: "absolute",
              top: "50%",
              left: `calc(50% - ${offset}px)`,
              transform: `translate(-50%, -50%) rotateZ(${time * 65 + i * 28}deg) scale(${scale})`,
              width: "92px", height: "92px",
              border: `3px solid ${COLORS.kAxis}`,
              borderRadius: "8px",
              opacity: Math.pow(0.6, Math.abs(i - 2)),
              boxShadow: `0 0 45px 18px ${COLORS.kAxis}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", color: COLORS.kAxis,
            }}>k<br/>{i-2}</div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "760px" }}>
        UNIT_4 octonion fractal live.<br />
        The 2-sided singularity now repeats infinitely in three orthogonal imaginary directions (i + j + k).<br />
        The lattice just gained full octonion scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
