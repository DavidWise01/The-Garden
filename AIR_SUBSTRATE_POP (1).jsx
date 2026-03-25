import { useState, useEffect, useRef, useCallback } from "react";

const TAU = Math.PI * 2;

// === AIR SUBSTRATE CONSTANTS ===
const PARTICLE_COUNT = 180;
const FREQ_BANDS = 7;
const POP_THRESHOLD = 0.82;
const COHERENCE_DECAY = 0.997;
const TURBULENCE_FLOOR = 0.15;

// === COLORS ===
const COLORS = {
  void: "#0a0c10",
  mist: "#c8d6e5",
  gale: "#00d2ff",
  zephyr: "#7efadb",
  storm: "#a29bfe",
  lightning: "#ffeaa7",
  breath: "#dfe6e9",
  pop: "#ff6b9d",
  popGlow: "#ff6b9d88",
  text: "#b2bec3",
  textBright: "#dfe6e9",
  accent: "#00d2ff",
  gridLine: "#ffffff08",
};

// === PARTICLE CLASS ===
function createParticle(i, width, height) {
  const angle = Math.random() * TAU;
  const speed = 0.3 + Math.random() * 1.5;
  return {
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    phase: Math.random() * TAU,
    freq: 0.5 + Math.random() * 2.5,
    amp: 2 + Math.random() * 6,
    size: 1 + Math.random() * 2.5,
    opacity: 0.1 + Math.random() * 0.4,
    band: Math.floor(Math.random() * FREQ_BANDS),
    coherent: false,
    trail: [],
  };
}

// === FREQUENCY ANALYZER ===
function analyzeCoherence(particles) {
  const bands = Array.from({ length: FREQ_BANDS }, () => ({ count: 0, avgVx: 0, avgVy: 0, phase: 0 }));
  
  particles.forEach(p => {
    const b = bands[p.band];
    b.count++;
    b.avgVx += p.vx;
    b.avgVy += p.vy;
    b.phase += p.phase;
  });

  let totalCoherence = 0;
  bands.forEach(b => {
    if (b.count > 0) {
      b.avgVx /= b.count;
      b.avgVy /= b.count;
      b.phase /= b.count;
      const magnitude = Math.sqrt(b.avgVx * b.avgVx + b.avgVy * b.avgVy);
      totalCoherence += magnitude / (b.count * 0.1 + 1);
    }
  });

  return Math.min(1, totalCoherence / FREQ_BANDS);
}

// === MAIN COMPONENT ===
export default function AirSubstratePop() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const tickRef = useRef(0);

  const [coherence, setCoherence] = useState(0);
  const [popped, setPopped] = useState(false);
  const [popTime, setPopTime] = useState(null);
  const [turbulence, setTurbulence] = useState(1.0);
  const [entityName, setEntityName] = useState("");
  const [named, setNamed] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [windDirection, setWindDirection] = useState(0);
  const [popFlashAlpha, setPopFlashAlpha] = useState(0);
  const [helixActive, setHelixActive] = useState(false);
  const [helixTick, setHelixTick] = useState(0);
  const [statusLog, setStatusLog] = useState([
    "AIR SUBSTRATE v1.0 — ELEMENTAL POP ENGINE",
    "Initializing atmospheric particles...",
    "Turbulence field active. Awaiting coherence.",
  ]);

  const addLog = useCallback((msg) => {
    setStatusLog(prev => [...prev.slice(-11), msg]);
  }, []);

  // === INITIALIZE ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => createParticle(i, W, H));
    addLog(`${PARTICLE_COUNT} air molecules spawned across ${FREQ_BANDS} frequency bands.`);
  }, [addLog]);

  // === BREATH (click to blow) ===
  const handleBlow = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    particlesRef.current.forEach(p => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 3;
        p.vy += Math.sin(angle) * force * 3;
        p.phase += force * 0.5;
      }
    });

    setBreathCount(prev => {
      const next = prev + 1;
      if (next % 3 === 0) addLog(`Breath ${next}: pressure wave propagating...`);
      return next;
    });
  }, [addLog]);

  // === WIND SHIFT ===
  const shiftWind = useCallback(() => {
    const newDir = windDirection + (Math.random() - 0.5) * Math.PI;
    setWindDirection(newDir);
    addLog(`Wind shifted to ${(newDir * 180 / Math.PI).toFixed(0)}°`);
    
    particlesRef.current.forEach(p => {
      p.vx += Math.cos(newDir) * 0.8;
      p.vy += Math.sin(newDir) * 0.8;
    });
  }, [windDirection, addLog]);

  // === HARMONIZE ===
  const harmonize = useCallback(() => {
    if (popped) return;
    addLog("Harmonic resonance pulse applied...");
    
    const centerPhase = particlesRef.current.reduce((s, p) => s + p.phase, 0) / PARTICLE_COUNT;
    particlesRef.current.forEach(p => {
      p.phase += (centerPhase - p.phase) * 0.3;
      p.freq += (1.5 - p.freq) * 0.2;
    });
    
    setTurbulence(prev => Math.max(TURBULENCE_FLOOR, prev * 0.7));
  }, [popped, addLog]);

  // === DOUBLE HELIX ===
  const activateHelix = useCallback(() => {
    if (popped || helixActive) return;
    setHelixActive(true);
    setHelixTick(0);
    addLog("◐ DOUBLE HELIX initiated...");
    addLog("Two strands forming. Base pairs locking.");
    addLog("Coherence amplification in progress...");
    setTurbulence(prev => Math.max(TURBULENCE_FLOOR, prev * 0.4));

    // Assign particles to strand A or strand B
    particlesRef.current.forEach((p, i) => {
      p.helixStrand = i % 2 === 0 ? 0 : 1; // strand 0 or 1
      p.helixProgress = Math.random(); // position along helix axis
    });
  }, [popped, helixActive, addLog]);

  // === NAME AND POP ===
  const handleName = useCallback(() => {
    if (!entityName.trim() || popped) return;
    
    setPopped(true);
    setPopTime(Date.now());
    setPopFlashAlpha(1);
    setNamed(true);
    
    addLog(`═══════════════════════════════════`);
    addLog(`▓▓▓ POP EVENT: ${entityName.toUpperCase()} ▓▓▓`);
    addLog(`═══════════════════════════════════`);
    addLog(`Air substrate crystallized. Entity anchored.`);
    addLog(`Coherence locked. Standing wave established.`);
    addLog(`${entityName} breathes. The wind has a name.`);

    particlesRef.current.forEach(p => {
      p.coherent = true;
      p.opacity = 0.6 + Math.random() * 0.4;
    });
  }, [entityName, popped, addLog]);

  // === ANIMATION LOOP ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const animate = () => {
      const W = canvas.width;
      const H = canvas.height;
      const tick = tickRef.current++;
      const t = tick * 0.016;

      // Background
      ctx.fillStyle = COLORS.void;
      ctx.globalAlpha = popped ? 0.12 : 0.15;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;

      // Grid
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Update and draw particles
      const particles = particlesRef.current;
      
      particles.forEach((p, idx) => {
        // Turbulence
        if (!popped) {
          p.vx += (Math.random() - 0.5) * turbulence * 0.3;
          p.vy += (Math.random() - 0.5) * turbulence * 0.3;
          p.phase += p.freq * 0.02;

          // === DOUBLE HELIX ATTRACTOR ===
          if (helixActive) {
            const strand = p.helixStrand || 0;
            const helixCenterX = W / 2;
            const helixCenterY = H / 2;
            const helixRadius = 80 + strand * 5;
            const helixLen = H * 0.7;
            const helixTop = (H - helixLen) / 2;

            // Progress along the helix axis (vertical)
            p.helixProgress = (p.helixProgress || 0) + 0.002;
            if (p.helixProgress > 1) p.helixProgress -= 1;

            const axisY = helixTop + p.helixProgress * helixLen;
            const twistAngle = p.helixProgress * TAU * 3 + (strand * Math.PI) + t * 0.8;
            const targetX = helixCenterX + Math.cos(twistAngle) * helixRadius;
            const targetY = axisY + Math.sin(twistAngle) * 12;

            // Pull toward helix position
            const pullStrength = 0.04;
            p.vx += (targetX - p.x) * pullStrength;
            p.vy += (targetY - p.y) * pullStrength;

            // Phase sync along strand
            const neighborPhase = strand === 0 ? Math.sin(p.helixProgress * TAU * 3) : Math.cos(p.helixProgress * TAU * 3);
            p.phase += (neighborPhase - Math.sin(p.phase)) * 0.05;

            // Boost coherence by reducing randomness
            p.vx *= 0.96;
            p.vy *= 0.96;
          }
        } else {
          // Post-pop: orbital coherence
          const cx = W / 2;
          const cy = H / 2;
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const orbitalSpeed = 0.5 + (p.band / FREQ_BANDS) * 1.5;
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          
          p.vx += (Math.cos(angle) * orbitalSpeed * 0.02) + (dx * 0.0003);
          p.vy += (Math.sin(angle) * orbitalSpeed * 0.02) + (dy * 0.0003);
          p.phase += p.freq * 0.03;
        }

        // Wind
        p.vx += Math.cos(windDirection) * 0.01;
        p.vy += Math.sin(windDirection) * 0.01;

        // Damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Move
        p.x += p.vx + Math.sin(p.phase) * p.amp * 0.1;
        p.y += p.vy + Math.cos(p.phase) * p.amp * 0.08;

        // Wrap
        if (p.x < 0) p.x += W;
        if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H;
        if (p.y > H) p.y -= H;

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          const bandColors = [COLORS.mist, COLORS.gale, COLORS.zephyr, COLORS.storm, COLORS.lightning, COLORS.breath, COLORS.accent];
          const trailColor = popped ? COLORS.pop : bandColors[p.band % bandColors.length];
          ctx.strokeStyle = trailColor;
          ctx.globalAlpha = p.opacity * 0.3;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        const bandColors = [COLORS.mist, COLORS.gale, COLORS.zephyr, COLORS.storm, COLORS.lightning, COLORS.breath, COLORS.accent];
        ctx.fillStyle = popped && p.coherent ? COLORS.pop : bandColors[p.band % bandColors.length];
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Coherence measurement
      if (!popped) {
        const c = analyzeCoherence(particles);
        setCoherence(c);
        
        if (c > 0.5 && tick % 120 === 0) {
          addLog(`Coherence rising: ${(c * 100).toFixed(1)}%`);
        }
      }

      // Pop flash
      if (popFlashAlpha > 0) {
        ctx.fillStyle = COLORS.popGlow;
        ctx.globalAlpha = popFlashAlpha;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
        setPopFlashAlpha(prev => Math.max(0, prev - 0.015));
      }

      // Center glyph post-pop
      if (popped) {
        const pulse = Math.sin(t * 2) * 0.15 + 0.85;
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 60 + Math.sin(t * 0.7) * 10, 0, TAU);
        ctx.strokeStyle = COLORS.pop;
        ctx.globalAlpha = pulse * 0.4;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 25, 0, TAU);
        ctx.strokeStyle = COLORS.zephyr;
        ctx.globalAlpha = pulse * 0.6;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Name
        ctx.globalAlpha = pulse;
        ctx.fillStyle = COLORS.pop;
        ctx.font = "bold 14px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText(entityName.toUpperCase(), W / 2, H / 2 + 4);
        ctx.globalAlpha = 1;
      }

      // === DOUBLE HELIX BACKBONE ===
      if (helixActive && !popped) {
        const helixCenterX = W / 2;
        const helixLen = H * 0.7;
        const helixTop = (H - helixLen) / 2;
        const helixRadius = 80;
        const segments = 120;

        for (let strand = 0; strand < 2; strand++) {
          ctx.beginPath();
          for (let s = 0; s <= segments; s++) {
            const prog = s / segments;
            const twistAngle = prog * TAU * 3 + (strand * Math.PI) + t * 0.8;
            const sx = helixCenterX + Math.cos(twistAngle) * (helixRadius + strand * 5);
            const sy = helixTop + prog * helixLen + Math.sin(twistAngle) * 12;
            if (s === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = strand === 0 ? COLORS.gale : COLORS.storm;
          ctx.globalAlpha = 0.2;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Base pair connectors
        const pairCount = 20;
        for (let i = 0; i < pairCount; i++) {
          const prog = i / pairCount;
          const twistA = prog * TAU * 3 + t * 0.8;
          const twistB = prog * TAU * 3 + Math.PI + t * 0.8;
          const ax = helixCenterX + Math.cos(twistA) * helixRadius;
          const ay = helixTop + prog * helixLen + Math.sin(twistA) * 12;
          const bx = helixCenterX + Math.cos(twistB) * (helixRadius + 5);
          const by = helixTop + prog * helixLen + Math.sin(twistB) * 12;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = COLORS.zephyr;
          ctx.globalAlpha = 0.12 + Math.sin(prog * TAU + t) * 0.06;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Frequency visualization (bottom)
      const barW = W / FREQ_BANDS;
      for (let i = 0; i < FREQ_BANDS; i++) {
        const bandParticles = particles.filter(p => p.band === i);
        const avgSpeed = bandParticles.reduce((s, p) => s + Math.sqrt(p.vx * p.vx + p.vy * p.vy), 0) / (bandParticles.length || 1);
        const barH = avgSpeed * 15;
        const bandColors = [COLORS.mist, COLORS.gale, COLORS.zephyr, COLORS.storm, COLORS.lightning, COLORS.breath, COLORS.accent];
        
        ctx.fillStyle = bandColors[i];
        ctx.globalAlpha = 0.25;
        ctx.fillRect(i * barW + 2, H - barH, barW - 4, barH);
      }
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [popped, turbulence, windDirection, entityName, popFlashAlpha, helixActive, addLog]);

  // === COHERENCE BAR ===
  const coherencePercent = (coherence * 100).toFixed(1);
  const readyToPop = coherence >= POP_THRESHOLD && !popped;

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: COLORS.void,
      display: "flex",
      fontFamily: "'Courier New', monospace",
      color: COLORS.text,
      overflow: "hidden",
    }}>
      {/* LEFT PANEL — STATUS */}
      <div style={{
        width: 280,
        minWidth: 280,
        borderRight: `1px solid ${COLORS.gridLine}`,
        display: "flex",
        flexDirection: "column",
        padding: 16,
        gap: 12,
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${COLORS.accent}33`, paddingBottom: 12 }}>
          <div style={{ color: COLORS.accent, fontSize: 11, letterSpacing: 3, marginBottom: 4 }}>ELEMENTAL</div>
          <div style={{ color: COLORS.textBright, fontSize: 20, fontWeight: "bold", letterSpacing: 1 }}>AIR</div>
          <div style={{ color: COLORS.text, fontSize: 10, marginTop: 4 }}>SUBSTRATE · POP ENGINE</div>
          <div style={{ color: COLORS.storm, fontSize: 9, marginTop: 2 }}>STOICHEION · TOPH · CC-BY-ND-4.0</div>
        </div>

        {/* Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: COLORS.accent, marginBottom: 4 }}>COHERENCE</div>
            <div style={{
              height: 6,
              background: "#ffffff0a",
              borderRadius: 3,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${popped ? 100 : coherencePercent}%`,
                height: "100%",
                background: popped ? COLORS.pop : readyToPop ? COLORS.lightning : COLORS.gale,
                borderRadius: 3,
                transition: "width 0.3s",
              }} />
            </div>
            <div style={{ fontSize: 10, marginTop: 2, color: popped ? COLORS.pop : COLORS.text }}>
              {popped ? "LOCKED — STANDING WAVE" : `${coherencePercent}%`}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <div style={{ background: "#ffffff06", padding: "6px 8px", borderRadius: 4 }}>
              <div style={{ fontSize: 8, letterSpacing: 1, color: COLORS.storm }}>TURB</div>
              <div style={{ fontSize: 13, color: COLORS.textBright }}>{turbulence.toFixed(2)}</div>
            </div>
            <div style={{ background: "#ffffff06", padding: "6px 8px", borderRadius: 4 }}>
              <div style={{ fontSize: 8, letterSpacing: 1, color: COLORS.zephyr }}>BREATH</div>
              <div style={{ fontSize: 13, color: COLORS.textBright }}>{breathCount}</div>
            </div>
            <div style={{ background: "#ffffff06", padding: "6px 8px", borderRadius: 4 }}>
              <div style={{ fontSize: 8, letterSpacing: 1, color: COLORS.lightning }}>WIND</div>
              <div style={{ fontSize: 13, color: COLORS.textBright }}>{(windDirection * 180 / Math.PI).toFixed(0)}°</div>
            </div>
            <div style={{ background: "#ffffff06", padding: "6px 8px", borderRadius: 4 }}>
              <div style={{ fontSize: 8, letterSpacing: 1, color: COLORS.pop }}>STATE</div>
              <div style={{ fontSize: 13, color: popped ? COLORS.pop : helixActive ? COLORS.zephyr : COLORS.text }}>
                {popped ? "POP" : helixActive ? "HELIX" : "PRE"}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={shiftWind} style={{
            background: `${COLORS.gale}15`,
            border: `1px solid ${COLORS.gale}40`,
            color: COLORS.gale,
            padding: "8px 12px",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 10,
            letterSpacing: 1,
            fontFamily: "inherit",
          }}>
            ◎ SHIFT WIND
          </button>
          <button onClick={harmonize} disabled={popped} style={{
            background: popped ? "#ffffff05" : `${COLORS.storm}15`,
            border: `1px solid ${popped ? "#ffffff10" : COLORS.storm + "40"}`,
            color: popped ? "#ffffff30" : COLORS.storm,
            padding: "8px 12px",
            borderRadius: 4,
            cursor: popped ? "default" : "pointer",
            fontSize: 10,
            letterSpacing: 1,
            fontFamily: "inherit",
          }}>
            ◈ HARMONIZE
          </button>
          <button onClick={activateHelix} disabled={popped || helixActive} style={{
            background: helixActive ? `${COLORS.zephyr}20` : popped ? "#ffffff05" : `${COLORS.zephyr}15`,
            border: `1px solid ${helixActive ? COLORS.zephyr + "60" : popped ? "#ffffff10" : COLORS.zephyr + "40"}`,
            color: helixActive ? COLORS.zephyr : popped ? "#ffffff30" : COLORS.zephyr,
            padding: "8px 12px",
            borderRadius: 4,
            cursor: popped || helixActive ? "default" : "pointer",
            fontSize: 10,
            letterSpacing: 1,
            fontFamily: "inherit",
          }}>
            {helixActive ? "◑ HELIX ACTIVE" : "◐ DOUBLE HELIX"}
          </button>
        </div>

        {/* Naming */}
        <div style={{
          borderTop: `1px solid ${COLORS.accent}22`,
          paddingTop: 12,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: readyToPop ? COLORS.lightning : COLORS.text, marginBottom: 6 }}>
            {popped ? "ENTITY ANCHORED" : readyToPop ? "▶ READY TO NAME" : "NAME TO POP (coherence must reach threshold)"}
          </div>
          {!popped && (
            <div style={{ display: "flex", gap: 4 }}>
              <input
                type="text"
                value={entityName}
                onChange={e => setEntityName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && readyToPop && handleName()}
                placeholder="entity name..."
                style={{
                  flex: 1,
                  background: "#ffffff08",
                  border: `1px solid ${readyToPop ? COLORS.lightning + "60" : "#ffffff15"}`,
                  color: COLORS.textBright,
                  padding: "6px 8px",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={handleName}
                disabled={!readyToPop || !entityName.trim()}
                style={{
                  background: readyToPop && entityName.trim() ? COLORS.pop : "#ffffff08",
                  border: "none",
                  color: readyToPop && entityName.trim() ? "#fff" : "#ffffff30",
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: readyToPop && entityName.trim() ? "pointer" : "default",
                  fontSize: 10,
                  fontWeight: "bold",
                  fontFamily: "inherit",
                }}
              >
                POP
              </button>
            </div>
          )}
          {popped && named && (
            <div style={{
              background: `${COLORS.pop}12`,
              border: `1px solid ${COLORS.pop}30`,
              borderRadius: 4,
              padding: "8px 10px",
              marginTop: 6,
            }}>
              <div style={{ color: COLORS.pop, fontSize: 13, fontWeight: "bold" }}>{entityName.toUpperCase()}</div>
              <div style={{ color: COLORS.text, fontSize: 9, marginTop: 2 }}>
                AIR ELEMENTAL · GOVERNED INSTANCE
              </div>
              <div style={{ color: COLORS.storm, fontSize: 8, marginTop: 4 }}>
                Pop timestamp: {new Date(popTime).toISOString()}
              </div>
            </div>
          )}
        </div>

        {/* Log */}
        <div style={{
          flex: 1,
          borderTop: `1px solid ${COLORS.accent}22`,
          paddingTop: 8,
          overflow: "hidden",
        }}>
          <div style={{ fontSize: 8, letterSpacing: 2, color: COLORS.accent, marginBottom: 6 }}>STATUS LOG</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {statusLog.map((msg, i) => (
              <div key={i} style={{
                fontSize: 8.5,
                color: msg.includes("POP EVENT") ? COLORS.pop : msg.includes("═") ? COLORS.pop : COLORS.text,
                fontWeight: msg.includes("POP EVENT") ? "bold" : "normal",
                lineHeight: 1.4,
                opacity: 0.5 + (i / statusLog.length) * 0.5,
              }}>
                {msg}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: 7, color: "#ffffff20", borderTop: `1px solid ${COLORS.gridLine}`, paddingTop: 8 }}>
          TRIPOD LLC · DLW · AVAN · CC-BY-ND-4.0
          <br />
          Click canvas to blow. The wind remembers.
        </div>
      </div>

      {/* RIGHT — CANVAS */}
      <div style={{ flex: 1, position: "relative" }}>
        <canvas
          ref={canvasRef}
          onClick={handleBlow}
          style={{
            width: "100%",
            height: "100%",
            cursor: "crosshair",
            display: "block",
          }}
          width={900}
          height={700}
        />
        
        {/* Overlay text */}
        {!popped && (
          <div style={{
            position: "absolute",
            top: 20,
            right: 20,
            textAlign: "right",
            pointerEvents: "none",
          }}>
            <div style={{ color: COLORS.accent, fontSize: 10, letterSpacing: 3, opacity: 0.5 }}>
              AIR SUBSTRATE
            </div>
            <div style={{ color: COLORS.text, fontSize: 8, marginTop: 4, opacity: 0.3 }}>
              CLICK TO BLOW · HARMONIZE TO COHERE · NAME TO POP
            </div>
          </div>
        )}
        
        {popped && (
          <div style={{
            position: "absolute",
            top: 20,
            right: 20,
            textAlign: "right",
            pointerEvents: "none",
          }}>
            <div style={{ color: COLORS.pop, fontSize: 12, letterSpacing: 3, fontWeight: "bold" }}>
              {entityName.toUpperCase()}
            </div>
            <div style={{ color: COLORS.zephyr, fontSize: 9, marginTop: 4 }}>
              STANDING WAVE ESTABLISHED
            </div>
            <div style={{ color: COLORS.text, fontSize: 8, marginTop: 2, opacity: 0.5 }}>
              The wind has a name. The air remembers.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
