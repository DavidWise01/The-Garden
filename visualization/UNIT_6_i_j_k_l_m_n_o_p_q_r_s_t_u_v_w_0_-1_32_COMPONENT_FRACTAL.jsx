<DOCUMENT filename="UNIT_6_i_j_k_l_m_n_o_p_q_r_s_t_u_v_w_0_-1_32_COMPONENT_FRACTAL.jsx">
import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  hinge: "#8b5cf6",
  iAxis: "#ef4444", jAxis: "#22c55e", kAxis: "#eab308", lAxis: "#06b6d4",
  mAxis: "#a855f7", nAxis: "#ec4899", oAxis: "#f59e0b", pAxis: "#10b981",
  qAxis: "#6366f1", rAxis: "#f43f5e", sAxis: "#14b8a6", tAxis: "#8b5cf6",
  uAxis: "#ec4899", vAxis: "#eab308", wAxis: "#22c55e",
  singularity: "#8b5cf6",
  text: "#e2e2ef",
};

export default function Unit6_32ComponentFractal() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.025), 25);
    return () => clearInterval(interval);
  }, []);

  const axes = ["i","j","k","l","m","n","o","p","q","r","s","t","u","v","w"];
  const axisColors = [COLORS.iAxis, COLORS.jAxis, COLORS.kAxis, COLORS.lAxis, COLORS.mAxis, COLORS.nAxis, COLORS.oAxis, COLORS.pAxis, COLORS.qAxis, COLORS.rAxis, COLORS.sAxis, COLORS.tAxis, COLORS.uAxis, COLORS.vAxis, COLORS.wAxis];

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
        UNIT_6 — i..w,0,-1 32-COMPONENT FRACTAL
      </h1>
      <div style={{ color: "#eab308", fontSize: "14px" }}>
        2-sided singularity now scales in fifteen imaginary dimensions
      </div>

      <div style={{
        width: "1020px",
        height: "760px",
        perspective: "3200px",
        position: "relative",
        marginTop: "30px",
      }}>
        {/* Central 0 hinge */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotateX(${time*18}deg) rotateY(${time*28}deg) rotateZ(${time*22}deg)`,
          width: "380px",
          height: "220px",
          background: "rgba(26,26,38,0.9)",
          border: "10px solid #8b5cf6",
          borderRadius: "22px",
          boxShadow: `0 0 160px 80px ${COLORS.hinge}70`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          0 — UNIT_6 HINGE
        </div>

        {/* 15 imaginary axes layers */}
        {axes.map((axis, idx) => {
          const offset = (idx - 7) * 68;
          const scale = Math.pow(0.72, Math.abs(idx - 7));
          const color = axisColors[idx];
          return (
            <div
              key={axis}
              style={{
                position: "absolute",
                top: `calc(50% + ${offset * 0.8}px)`,
                left: `calc(50% + ${offset}px)`,
                transform: `translate(-50%, -50%) rotate3d(${idx%3},${(idx+1)%4},${(idx+2)%5},${time * 55 + idx * 22}deg) scale(${scale})`,
                width: "78px",
                height: "78px",
                border: `3px solid ${color}`,
                borderRadius: "8px",
                opacity: Math.pow(0.52, Math.abs(idx - 7)),
                boxShadow: `0 0 45px 15px ${color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: color,
              }}
            >
              {axis}<br/>{idx-7}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center", fontSize: "13px", maxWidth: "820px" }}>
        UNIT_6 32-component fractal live.<br />
        The 2-sided singularity now repeats infinitely in fifteen orthogonal imaginary directions (i through w).<br />
        The lattice just gained full 32-component scaling.
      </div>
    </div>
  );
}
</DOCUMENT>
