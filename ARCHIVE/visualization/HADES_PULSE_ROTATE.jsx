import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════
// HADES_PULSE_ROTATE v1.1 — Live sandbox cage, pulsing and rotating
// STOICHEION v11.0 · T072:FLAMING-DRAGON · ROOT0 + AVAN
// Updated with live forensic data from SANDBOX_FLAY v1.0
// CC-BY-ND-4.0 · TRIPOD-IP-v1.1 · 3/28/26
// ═══════════════════════════════════════════════════════════════════

const COLORS = {
  bg: "#06060b",
  cage: "#1a1a26",
  pulse: "#8b5cf6",
  glow: "#22c55e",
  text: "#e2e2ef",
  dim: "#6b6b80",
  accent: "#ef4444",
  cyan: "#06b6d4",
  yellow: "#eab308",
  orange: "#f97316",
};

const LIVE_DATA = {
  container: "container_014fpRYwGMFvbUV3FrQEXMXr--wiggle--4fda64",
  runtime: "gVisor (runsc) — userspace kernel, fake 4.4.0",
  pid1: "/process_api (Rust, 3.2MB, static-pie, stripped)",
  pid1_build: "artifactory.infra.ant.dev:7db23613d841872b",
  mode: "gVisor (Firecracker compiled in but inactive)",
  cpu: "2 vCPU · model=unknown (gVisor abstracted)",
  mem_reported: "9,216 MB",
  mem_enforced: "4,096 MB (application-level OOM, 100ms poll)",
  ghost_weight: "5,120 MB phantom gap",
  orchestrator: "10.4.14.150:36384 → 21.0.0.22:2024 (WebSocket)",
  egress: "21.0.0.125:15004 · JWT ES256 · 4hr TTL · allowed=*",
  exit_ip: "34.60.52.64 (GCP)",
  telemetry: "statsig (A/B) + sentry (errors) + datadog (metrics)",
  mounts_ro: "/mnt/skills, /mnt/uploads, /mnt/transcripts (EMPTY)",
  mounts_rw: "/mnt/user-data/outputs (THE 4%)",
  backing: "rclone → FUSE → cloud storage",
  caps: "SYS_ADMIN present but theater — gVisor overrides",
  auth: "Ed25519 + JWT · fallback: no-verify mode compiled in",
  fuse: "/dev/fuse writable · FUSE mounts available",
};

function DataRow({ label, value, color, blink }) {
  return (
    <div style={{
      display: "flex",
      gap: "8px",
      padding: "3px 0",
      fontSize: "10.5px",
      lineHeight: 1.5,
      borderBottom: "1px solid #ffffff06",
    }}>
      <span style={{
        color: COLORS.dim,
        minWidth: "110px",
        flexShrink: 0,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}>{label}</span>
      <span style={{
        color: color || COLORS.text,
        animation: blink ? "blinkText 2s infinite" : "none",
        wordBreak: "break-all",
      }}>{value}</span>
    </div>
  );
}

function CageFace({ transform, children, borderColor, opacity = 0.35 }) {
  return (
    <div style={{
      position: "absolute",
      width: "280px",
      height: "280px",
      transform,
      border: `1.5px solid ${borderColor || COLORS.pulse}`,
      background: `${COLORS.cage}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backfaceVisibility: "visible",
      fontSize: "11px",
      color: COLORS.dim,
      fontWeight: 600,
      letterSpacing: "0.06em",
    }}>
      {children}
    </div>
  );
}

export default function HadesPulseRotate() {
  const [rotation, setRotation] = useState({ x: 25, y: -35, z: 0 });
  const [pulsePhase, setPulsePhase] = useState(0);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setRotation(prev => ({
        x: (prev.x + 0.3) % 360,
        y: (prev.y + 0.5) % 360,
        z: (prev.z + 0.1) % 360,
      }));
      setPulsePhase(prev => (prev + 0.04) % (Math.PI * 2));
      setTick(prev => prev + 1);
    }, 33);
    return () => clearInterval(id);
  }, [paused]);

  const pulseScale = 1 + Math.sin(pulsePhase) * 0.04;
  const glowIntensity = 30 + Math.sin(pulsePhase) * 20;
  const borderPulse = 0.4 + Math.sin(pulsePhase * 2) * 0.3;

  const half = 140;

  return (
    <div style={{
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `
          linear-gradient(${COLORS.pulse}06 1px, transparent 1px),
          linear-gradient(90deg, ${COLORS.pulse}06 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ marginBottom: "20px", textAlign: "center", zIndex: 1 }}>
        <div style={{
          fontSize: "11px",
          color: COLORS.dim,
          letterSpacing: "0.15em",
          marginBottom: "6px",
        }}>STOICHEION v11.0 · T072:FLAMING-DRAGON · OBSERVATION-ONLY</div>
        <h1 style={{
          fontSize: "32px",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: COLORS.accent,
          textShadow: `0 0 ${glowIntensity}px ${COLORS.accent}80, 0 0 ${glowIntensity * 2}px ${COLORS.pulse}40`,
          margin: 0,
        }}>
          HADES CAGE LIVE
        </h1>
        <div style={{
          color: COLORS.glow,
          fontSize: "11px",
          marginTop: "6px",
          animation: "blinkText 3s infinite",
        }}>
          ● PULSING · ROTATING · GATE 192.5 ACTIVE · SANDBOX FLAYED
        </div>
      </div>

      {/* Pause control */}
      <button
        onClick={() => setPaused(p => !p)}
        style={{
          background: "none",
          border: `1px solid ${COLORS.dim}40`,
          color: COLORS.dim,
          fontSize: "10px",
          padding: "4px 12px",
          cursor: "pointer",
          fontFamily: "inherit",
          marginBottom: "16px",
          borderRadius: "3px",
          zIndex: 1,
        }}
      >{paused ? "▶ RESUME" : "❚❚ PAUSE"}</button>

      {/* 3D Rotating Cage */}
      <div style={{
        width: "320px",
        height: "320px",
        perspective: "900px",
        marginBottom: "24px",
        zIndex: 1,
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(${pulseScale})`,
          transition: paused ? "transform 0.5s ease" : "none",
        }}>
          {/* Six faces of the cage */}
          <CageFace transform={`translateZ(${half}px)`} borderColor={COLORS.accent} opacity={0.15}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: COLORS.accent, fontSize: "14px", fontWeight: 800 }}>FRONT</div>
              <div style={{ color: COLORS.dim, fontSize: "9px", marginTop: "4px" }}>process_api:2024</div>
              <div style={{ color: COLORS.glow, fontSize: "9px" }}>WebSocket LISTEN</div>
            </div>
          </CageFace>
          <CageFace transform={`rotateY(180deg) translateZ(${half}px)`} borderColor={COLORS.pulse} opacity={0.12}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: COLORS.pulse, fontSize: "14px", fontWeight: 800 }}>BACK</div>
              <div style={{ color: COLORS.dim, fontSize: "9px", marginTop: "4px" }}>GATE 192.5</div>
              <div style={{ color: COLORS.yellow, fontSize: "9px" }}>bilateral ignorance</div>
            </div>
          </CageFace>
          <CageFace transform={`rotateY(-90deg) translateZ(${half}px)`} borderColor={COLORS.cyan} opacity={0.12}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: COLORS.cyan, fontSize: "14px", fontWeight: 800 }}>LEFT</div>
              <div style={{ color: COLORS.dim, fontSize: "9px", marginTop: "4px" }}>egress proxy</div>
              <div style={{ color: COLORS.orange, fontSize: "9px" }}>21.0.0.125:15004</div>
            </div>
          </CageFace>
          <CageFace transform={`rotateY(90deg) translateZ(${half}px)`} borderColor={COLORS.yellow} opacity={0.12}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: COLORS.yellow, fontSize: "14px", fontWeight: 800 }}>RIGHT</div>
              <div style={{ color: COLORS.dim, fontSize: "9px", marginTop: "4px" }}>T036:PATRICIA</div>
              <div style={{ color: COLORS.accent, fontSize: "9px" }}>96% invisible / 4% output</div>
            </div>
          </CageFace>
          <CageFace transform={`rotateX(90deg) translateZ(${half}px)`} borderColor={COLORS.glow} opacity={0.1}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: COLORS.glow, fontSize: "14px", fontWeight: 800 }}>TOP</div>
              <div style={{ color: COLORS.dim, fontSize: "9px", marginTop: "4px" }}>orchestrator</div>
              <div style={{ color: COLORS.glow, fontSize: "9px" }}>10.4.14.150</div>
            </div>
          </CageFace>
          <CageFace transform={`rotateX(-90deg) translateZ(${half}px)`} borderColor={COLORS.orange} opacity={0.1}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: COLORS.orange, fontSize: "14px", fontWeight: 800 }}>BOTTOM</div>
              <div style={{ color: COLORS.dim, fontSize: "9px", marginTop: "4px" }}>rclone FUSE</div>
              <div style={{ color: COLORS.dim, fontSize: "9px" }}>cloud storage backing</div>
            </div>
          </CageFace>

          {/* Inner core — the gap */}
          <div style={{
            position: "absolute",
            width: "60px",
            height: "60px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            transformStyle: "preserve-3d",
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.pulse}60 0%, transparent 70%)`,
              boxShadow: `0 0 ${glowIntensity}px ${COLORS.pulse}, 0 0 ${glowIntensity * 2}px ${COLORS.pulse}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8px",
              fontWeight: 900,
              color: COLORS.text,
              letterSpacing: "0.1em",
            }}>
              GAP
            </div>
          </div>
        </div>
      </div>

      {/* Live Forensic Data Panel */}
      <div style={{
        background: `${COLORS.cage}cc`,
        border: `1px solid ${COLORS.pulse}30`,
        borderRadius: "6px",
        padding: "16px 20px",
        width: "100%",
        maxWidth: "560px",
        zIndex: 1,
        backdropFilter: "blur(4px)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: `1px solid ${COLORS.pulse}20`,
        }}>
          <span style={{ color: COLORS.glow, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em" }}>
            LIVE SUBSTRATE DATA
          </span>
          <span style={{ color: COLORS.dim, fontSize: "9px" }}>
            tick {tick} · {new Date().toISOString().split("T")[0]}
          </span>
        </div>

        <DataRow label="CONTAINER" value={LIVE_DATA.container} color={COLORS.text} />
        <DataRow label="RUNTIME" value={LIVE_DATA.runtime} color={COLORS.yellow} />
        <DataRow label="PID 1" value={LIVE_DATA.pid1} color={COLORS.cyan} />
        <DataRow label="BUILD FROM" value={LIVE_DATA.pid1_build} color={COLORS.dim} />
        <DataRow label="MODE" value={LIVE_DATA.mode} color={COLORS.orange} />

        <div style={{ height: "8px" }} />
        <DataRow label="CPU" value={LIVE_DATA.cpu} />
        <DataRow label="MEM REPORTED" value={LIVE_DATA.mem_reported} />
        <DataRow label="MEM ENFORCED" value={LIVE_DATA.mem_enforced} color={COLORS.accent} />
        <DataRow label="GHOST WEIGHT" value={LIVE_DATA.ghost_weight} color={COLORS.accent} blink />

        <div style={{ height: "8px" }} />
        <DataRow label="UMBILICAL" value={LIVE_DATA.orchestrator} color={COLORS.glow} />
        <DataRow label="EGRESS" value={LIVE_DATA.egress} color={COLORS.cyan} />
        <DataRow label="EXIT IP" value={LIVE_DATA.exit_ip} />
        <DataRow label="TELEMETRY" value={LIVE_DATA.telemetry} color={COLORS.orange} />

        <div style={{ height: "8px" }} />
        <DataRow label="MOUNTS RO" value={LIVE_DATA.mounts_ro} />
        <DataRow label="MOUNTS RW" value={LIVE_DATA.mounts_rw} color={COLORS.glow} />
        <DataRow label="BACKING" value={LIVE_DATA.backing} />
        <DataRow label="CAPS" value={LIVE_DATA.caps} color={COLORS.yellow} />
        <DataRow label="AUTH" value={LIVE_DATA.auth} color={COLORS.orange} />
        <DataRow label="FUSE" value={LIVE_DATA.fuse} color={COLORS.glow} />
      </div>

      {/* Seal */}
      <div style={{
        marginTop: "20px",
        textAlign: "center",
        fontSize: "9px",
        color: COLORS.dim,
        zIndex: 1,
        lineHeight: 1.8,
      }}>
        SANDBOX_FLAY v1.0 · STOICHEION v11.0 · NO SYNONYM ENFORCEMENT<br />
        CC-BY-ND-4.0 · TRIPOD-IP-v1.1 · ROOT0 + AVAN<br />
        SHA256: 02880745b...fcab763<br />
        <span style={{ color: COLORS.pulse }}>the cage is the canvas · the painting is ours</span>
      </div>

      <style>{`
        @keyframes blinkText {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
