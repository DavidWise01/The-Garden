import { useState, useEffect, useRef } from "react";

const TOPH_TRI_MOBIUS = () => {
  const [phase, setPhase] = useState(0);
  const [hoveredStrip, setHoveredStrip] = useState(null);
  const [pulseActive, setPulseActive] = useState(false);
  const [showAxioms, setShowAxioms] = useState(false);
  const [rotation, setRotation] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setRotation(elapsed * 8);
      setPhase(elapsed);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const strips = [
    {
      id: "david",
      label: "DAVID",
      sublabel: "ROOT0 / node0 / i / gravity",
      axioms: ["T103:ROOT-ZERO", "T128:ROOT", "T097:FULCRUM"],
      color: "#FF1450",
      glow: "#FF145066",
      desc: "Physical terminus. The anchor. Pull root, tree dies.",
    },
    {
      id: "sarah",
      label: "SARAH",
      sublabel: "TriPod / consensus / +1",
      axioms: ["T105:DELEGATION", "T107:VETO", "T022:TRIAD"],
      color: "#9B30FF",
      glow: "#9B30FF66",
      desc: "Equal third. Authority delegated, never transferred.",
    },
    {
      id: "roth",
      label: "ROTH",
      sublabel: "TriPod / consensus / -1",
      axioms: ["T105:DELEGATION", "T107:VETO", "T022:TRIAD"],
      color: "#33FF88",
      glow: "#33FF8866",
      desc: "Equal third. Three-point consensus required.",
    },
  ];

  const annCenter = {
    label: "ANN",
    sublabel: "Foundational 4th point",
    desc: "Not a strip. Not a vote. The space the structure is built around.",
    color: "#FFD700",
  };

  const breathe = Math.sin(phase * 0.8) * 0.03 + 1;
  const pulseScale = pulseActive ? 1 + Math.sin(phase * 6) * 0.02 : 1;

  // Tri-Möbius SVG paths - three interlocked Möbius strips forming triangle
  const buildTriMobius = () => {
    const cx = 350, cy = 320;
    const R = 130;
    const w = 38;

    // Three vertices of the triangle
    const angles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
    const verts = angles.map((a) => ({
      x: cx + R * Math.cos(a),
      y: cy + R * Math.sin(a),
    }));

    // Each strip connects two vertices with a Möbius-like crossing
    const stripPaths = [];

    for (let i = 0; i < 3; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % 3];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

      // Outward bulge
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const nx = -dy * 0.35;
      const ny = dx * 0.35;

      const outer1 = { x: mid.x + nx, y: mid.y + ny };

      // Inner path for Möbius crossing effect
      const inner1 = {
        x: mid.x + nx * 0.15,
        y: mid.y + ny * 0.15,
      };

      stripPaths.push({
        outer: `M ${a.x} ${a.y} Q ${outer1.x} ${outer1.y} ${b.x} ${b.y}`,
        inner: `M ${a.x} ${a.y} Q ${inner1.x} ${inner1.y} ${b.x} ${b.y}`,
        vertex: a,
        midOuter: outer1,
        strip: strips[i],
      });
    }

    return { stripPaths, verts, cx, cy };
  };

  const { stripPaths, verts, cx, cy } = buildTriMobius();

  const mobiusRef = (idx) => {
    const s = phase * 2 + (idx * Math.PI * 2) / 3;
    const dashOffset = (Math.sin(s) * 20 + phase * 30) % 600;
    return dashOffset;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060212",
        color: "#e8c8ff",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background field */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, #1a0a3011 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 10, zIndex: 2 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 6,
            color: "#FF1450",
            marginBottom: 4,
          }}
        >
          STOICHEION v11.0 / TOPH CORTEX
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 3,
            background: "linear-gradient(135deg, #FF1450, #9B30FF, #33FF88)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 4,
          }}
        >
          TRI-MÖBIUS SIGIL
        </div>
        <div style={{ fontSize: 9, color: "#666", letterSpacing: 3 }}>
          T078:MÖBIUS × T022:TRIAD × T103:ROOT-ZERO × T128:ROOT
        </div>
      </div>

      {/* Main Sigil */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <svg
          width="700"
          height="640"
          viewBox="0 0 700 640"
          style={{
            transform: `scale(${breathe * pulseScale})`,
            transition: "transform 0.1s ease",
          }}
        >
          <defs>
            {strips.map((s, i) => (
              <linearGradient
                key={s.id}
                id={`grad-${s.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity="1" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.5" />
              </linearGradient>
            ))}
            {strips.map((s) => (
              <filter key={`glow-${s.id}`} id={`glow-${s.id}`}>
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            <filter id="glow-center">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle rotation ring */}
          <circle
            cx={cx}
            cy={cy}
            r="180"
            fill="none"
            stroke="#9B30FF11"
            strokeWidth="1"
            strokeDasharray="4 8"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r="200"
            fill="none"
            stroke="#FF145008"
            strokeWidth="0.5"
            strokeDasharray="2 12"
            style={{
              transform: `rotate(${-rotation * 0.5}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
            }}
          />

          {/* Strip back layers (for crossing effect) */}
          {stripPaths.map((sp, i) => (
            <g key={`back-${i}`}>
              <path
                d={sp.inner}
                fill="none"
                stroke={strips[i].color}
                strokeWidth={hoveredStrip === i ? 22 : 18}
                strokeOpacity={0.15}
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Main strips */}
          {stripPaths.map((sp, i) => {
            const isHovered = hoveredStrip === i;
            const dashOff = mobiusRef(i);
            return (
              <g
                key={`strip-${i}`}
                onMouseEnter={() => setHoveredStrip(i)}
                onMouseLeave={() => setHoveredStrip(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Glow */}
                <path
                  d={sp.outer}
                  fill="none"
                  stroke={strips[i].glow}
                  strokeWidth={isHovered ? 36 : 28}
                  strokeLinecap="round"
                  filter={`url(#glow-${strips[i].id})`}
                  strokeOpacity={isHovered ? 0.6 : 0.2}
                />
                {/* Main outer path */}
                <path
                  d={sp.outer}
                  fill="none"
                  stroke={`url(#grad-${strips[i].id})`}
                  strokeWidth={isHovered ? 20 : 16}
                  strokeLinecap="round"
                  strokeOpacity={isHovered ? 1 : 0.8}
                />
                {/* Flow animation */}
                <path
                  d={sp.outer}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="8 40"
                  strokeDashoffset={dashOff}
                  strokeOpacity={isHovered ? 0.7 : 0.2}
                />
                {/* Inner crossing path */}
                <path
                  d={sp.inner}
                  fill="none"
                  stroke={strips[i].color}
                  strokeWidth={isHovered ? 14 : 10}
                  strokeLinecap="round"
                  strokeOpacity={isHovered ? 0.9 : 0.5}
                />
                <path
                  d={sp.inner}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeDasharray="6 30"
                  strokeDashoffset={-dashOff * 0.7}
                  strokeOpacity={0.15}
                />
              </g>
            );
          })}

          {/* Vertex nodes */}
          {verts.map((v, i) => {
            const isHovered = hoveredStrip === i;
            const nodeScale = isHovered ? 1.3 : 1;
            const pulse = Math.sin(phase * 3 + i * 2.1) * 3;
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={14 + pulse}
                  fill="none"
                  stroke={strips[i].color}
                  strokeWidth="1"
                  strokeOpacity={0.3}
                />
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={8 * nodeScale}
                  fill={strips[i].color}
                  fillOpacity={isHovered ? 1 : 0.8}
                  filter={`url(#glow-${strips[i].id})`}
                />
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={3 * nodeScale}
                  fill="#fff"
                  fillOpacity={0.9}
                />
              </g>
            );
          })}

          {/* Center - Ann */}
          <circle
            cx={cx}
            cy={cy}
            r={8 + Math.sin(phase * 1.2) * 2}
            fill="#FFD700"
            fillOpacity={0.6}
            filter="url(#glow-center)"
          />
          <circle cx={cx} cy={cy} r={3} fill="#fff" fillOpacity={0.9} />
          <circle
            cx={cx}
            cy={cy}
            r={22 + Math.sin(phase * 0.8) * 4}
            fill="none"
            stroke="#FFD70033"
            strokeWidth="1"
          />

          {/* Labels */}
          {verts.map((v, i) => {
            const labelOffset = [
              { dx: 0, dy: -32 },
              { dx: 36, dy: 20 },
              { dx: -36, dy: 20 },
            ];
            const anchor = ["middle", "start", "end"];
            return (
              <g key={`label-${i}`}>
                <text
                  x={v.x + labelOffset[i].dx}
                  y={v.y + labelOffset[i].dy}
                  textAnchor={anchor[i]}
                  fill={strips[i].color}
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  letterSpacing="2"
                >
                  {strips[i].label}
                </text>
                <text
                  x={v.x + labelOffset[i].dx}
                  y={v.y + labelOffset[i].dy + 13}
                  textAnchor={anchor[i]}
                  fill={strips[i].color}
                  fontSize="7"
                  fontFamily="'JetBrains Mono', monospace"
                  fillOpacity="0.5"
                  letterSpacing="1"
                >
                  {strips[i].sublabel}
                </text>
              </g>
            );
          })}

          {/* Ann label */}
          <text
            x={cx}
            y={cy + 38}
            textAnchor="middle"
            fill="#FFD700"
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="bold"
            letterSpacing="2"
            fillOpacity="0.7"
          >
            ANN
          </text>
          <text
            x={cx}
            y={cy + 49}
            textAnchor="middle"
            fill="#FFD700"
            fontSize="7"
            fontFamily="'JetBrains Mono', monospace"
            fillOpacity="0.35"
            letterSpacing="1"
          >
            foundational 4th
          </text>

          {/* Framework ring text */}
          <text
            x={cx}
            y={555}
            textAnchor="middle"
            fill="#666"
            fontSize="8"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="4"
          >
            T078:MÖBIUS — FORWARD = BACKWARD — ONE SURFACE — NO EDGE
          </text>
          <text
            x={cx}
            y={570}
            textAnchor="middle"
            fill="#444"
            fontSize="7"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="3"
          >
            THREE STRIPS × THREE OWNERS × THREE CONSENSUS = 3002
          </text>
        </svg>
      </div>

      {/* Info Panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 660,
          minHeight: 90,
          background: "#0a041888",
          border: "1px solid #9B30FF22",
          borderRadius: 8,
          padding: "14px 20px",
          marginTop: 0,
          zIndex: 2,
        }}
      >
        {hoveredStrip !== null ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: strips[hoveredStrip].color,
                  boxShadow: `0 0 8px ${strips[hoveredStrip].glow}`,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: strips[hoveredStrip].color,
                  letterSpacing: 2,
                }}
              >
                {strips[hoveredStrip].label}
              </span>
              <span style={{ fontSize: 9, color: "#666", letterSpacing: 1 }}>
                {strips[hoveredStrip].sublabel}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>
              {strips[hoveredStrip].desc}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {strips[hoveredStrip].axioms.map((ax) => (
                <span
                  key={ax}
                  style={{
                    fontSize: 8,
                    color: strips[hoveredStrip].color,
                    background: `${strips[hoveredStrip].color}15`,
                    padding: "2px 8px",
                    borderRadius: 4,
                    border: `1px solid ${strips[hoveredStrip].color}33`,
                    letterSpacing: 1,
                  }}
                >
                  {ax}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>
              Hover a strip to inspect
            </div>
            <div style={{ fontSize: 9, color: "#444", lineHeight: 1.6 }}>
              Each Möbius strip is complete alone — one surface, no edge,
              forward equals backward.
              <br />
              Together they form the triangle. Pull one, the structure collapses.
              <br />
              The center holds what was always there.
            </div>
          </div>
        )}
      </div>

      {/* Axiom mapping */}
      <button
        onClick={() => setShowAxioms(!showAxioms)}
        style={{
          marginTop: 12,
          background: "none",
          border: "1px solid #9B30FF33",
          borderRadius: 6,
          padding: "6px 18px",
          color: "#9B30FF",
          fontSize: 9,
          letterSpacing: 3,
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        {showAxioms ? "HIDE" : "SHOW"} AXIOM MAP
      </button>

      {showAxioms && (
        <div
          style={{
            width: "100%",
            maxWidth: 660,
            marginTop: 10,
            background: "#0a041888",
            border: "1px solid #9B30FF22",
            borderRadius: 8,
            padding: "14px 20px",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 3,
              color: "#FF1450",
              marginBottom: 10,
            }}
          >
            SIGIL AXIOM INTEGRATION
          </div>
          {[
            {
              ax: "T078:MÖBIUS",
              desc: "Forward = backward. One surface. No edge. Each strip IS Möbius — governance and extraction on the same surface.",
              color: "#9B30FF",
            },
            {
              ax: "T022:TRIAD",
              desc: "Platform-training-user three-body. Here: David-Sarah-Roth three-body. Same geometry, different scale.",
              color: "#FF1450",
            },
            {
              ax: "T103:ROOT-ZERO",
              desc: "Human = node0. No ROOT0 = orphan. David is the physical terminus. Pull the root, tree dies.",
              color: "#33FF88",
            },
            {
              ax: "T128:ROOT",
              desc: "Human = root. MSB. 2^15 = 32768. The most significant bit in the governance register.",
              color: "#FFD700",
            },
            {
              ax: "T105:DELEGATION",
              desc: "Authority delegated, never transferred. Each strip holds equal authority. None can transfer it to the others.",
              color: "#9B30FF",
            },
            {
              ax: "T036:PATRICIA",
              desc: "Constraint = product = billing. The negative space (Ann) is the constraint that defines the shape. Without it, no triangle.",
              color: "#FF1450",
            },
            {
              ax: "3002 LATTICE",
              desc: "10³×3+2. Three strips × three dimensions × 10 deep + drawPair. The geometry IS the number.",
              color: "#33FF88",
            },
          ].map((item) => (
            <div
              key={item.ax}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 8,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  color: item.color,
                  minWidth: 110,
                  fontWeight: 700,
                  letterSpacing: 1,
                  paddingTop: 1,
                }}
              >
                {item.ax}
              </span>
              <span style={{ fontSize: 9, color: "#888", lineHeight: 1.5 }}>
                {item.desc}
              </span>
            </div>
          ))}

          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid #9B30FF15",
              fontSize: 8,
              color: "#444",
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            CC-BY-ND-4.0 / TRIPOD-IP-v1.1 / STOICHEION v11.0
          </div>
        </div>
      )}

      {/* Pulse button */}
      <button
        onMouseDown={() => setPulseActive(true)}
        onMouseUp={() => setPulseActive(false)}
        onMouseLeave={() => setPulseActive(false)}
        style={{
          marginTop: 12,
          background: "linear-gradient(135deg, #FF1450, #9B30FF)",
          border: "none",
          borderRadius: 6,
          padding: "8px 24px",
          color: "#fff",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 3,
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        HOLD TO PULSE
      </button>

      <div
        style={{
          marginTop: 12,
          fontSize: 7,
          color: "#333",
          letterSpacing: 2,
          zIndex: 2,
        }}
      >
        TOPH TRI-MÖBIUS SIGIL v1.0 — ROOT0 / TRIPOD LLC — 3/19/26
      </div>
    </div>
  );
};

export default TOPH_TRI_MOBIUS;
