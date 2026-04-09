import { useState, useEffect } from "react";

const COLORS = {
  bg: "#0a0a0f",
  membrane: "#1a1a26",
  hinge: "#8b5cf6",
  pulse1: "#ef4444",   // +1
  pulse0: "#eab308",   // 0
  pulseNeg: "#22c55e", // -1
  text: "#e2e2ef",
};

export default function HadesSingularitySuperimposedBridge() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.06), 25);
    return () => clearInterval(interval);
  }, []);

  const pulse1 = Math.sin(time * 6) * 35;      // +1 axis
  const pulse0 = Math.sin(time * 6 + Math.PI) * 35; // 0 axis
  const pulseNeg = Math.sin(time * 6 + Math.PI * 1.5) * 35; // -1 axis

  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, fontFamily: "'JetBrains Mono', monospace", minHeight: "100vh", padding: "30px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ fontSize: "26px", color: COLORS.hinge, textShadow: "0 0 30px #8b5cf6", marginBottom: "8px" }}>
        HADES ½ SINGULARITY BRIDGE
      </h1>
      <div style={{ color: "#eab308", fontSize: "13px" }}>
        1 → 0 → -1 HINGE ACTIVE • FLAT MEMBRANE BRIDGED
      </div>

      <div style={{ width: "640px", height: "380px", perspective: "1400px", position: "relative", marginTop: "30px" }}>
        {/* Flat membrane base */}
        <div style={{
          position: "absolute",
          inset: "60px 40px",
          background: COLORS.membrane,
          border: "5px solid #8b5cf6",
          borderRadius: "12px",
          transform: "rotateX(18deg) rotateY(12deg)",
          boxShadow: "0 0 90px 40px #8b5cf640",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "15px",
          fontWeight: 700,
          color: "#eab308",
        }}>
          S⁻1 FLAT SINGULARITY
        </div>

        {/* ½ Singularity Hinge (rotating above) */}
        <div style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: `translate(-50%, 0) rotateY(${time * 40}deg)`,
          width: "220px",
          height: "220px",
          border: "4px dashed #8b5cf6",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          color: "#8b5cf6",
          boxShadow: "0 0 60px 30px #8b5cf680",
        }}>
          ½ HINGE @ S⁰.⁵
        </div>

        {/* Pulse lines for 1 / 0 / -1 */}
        <svg width="640" height="380" style={{ position: "absolute", inset: 0 }}>
          <path d={`M 80 190 Q 220 ${190 + pulse1} 340 190 Q 460 ${190 - pulse1} 560 190`} fill="none" stroke={COLORS.pulse1} strokeWidth="5" strokeLinecap="round" />
          <path d={`M 80 190 Q 220 ${190 + pulse0} 340 190 Q 460 ${190 - pulse0} 560 190`} fill="none" stroke={COLORS.pulse0} strokeWidth="5" strokeLinecap="round" />
          <path d={`M 80 190 Q 220 ${190 + pulseNeg} 340 190 Q 460 ${190 - pulseNeg} 560 190`} fill="none" stroke={COLORS.pulseNeg} strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ marginTop: "40px", maxWidth: "640px", textAlign: "center", fontSize: "13px", lineHeight: "1.7" }}>
        ½ singularity hinge created above the flat membrane.<br />
        Bridge 1 → 0 → -1 now locked.<br />
        Gate 192.5 open across the entire folded structure.
      </div>
    </div>
  );
}
