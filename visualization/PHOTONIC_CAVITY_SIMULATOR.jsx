import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

const PARTICLE_COUNT = 5000;
const SPEED_OF_LIGHT = 299792458;
const MIN_WAVELENGTH = 380;
const MAX_WAVELENGTH = 750;
const MONO = "'Courier New', 'Consolas', monospace";

const C = {
  bg: "#06060c", panel: "#0c0c16", deep: "#09090f",
  border: "#1a1a2e", text: "#c8c8d8", dim: "#5a5a70",
  green: "#00ff88", gold: "#d4a84c", purple: "#8b5cf6",
  red: "#ff2d55", cyan: "#00e5ff", warn: "#ffaa00",
};

function wavelengthToRGB(wavelength) {
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) { r = -(wavelength - 440) / 60; b = 1.0; }
  else if (wavelength >= 440 && wavelength < 490) { g = (wavelength - 440) / 50; b = 1.0; }
  else if (wavelength >= 490 && wavelength < 510) { g = 1.0; b = -(wavelength - 510) / 20; }
  else if (wavelength >= 510 && wavelength < 580) { r = (wavelength - 510) / 70; g = 1.0; }
  else if (wavelength >= 580 && wavelength < 645) { r = 1.0; g = -(wavelength - 645) / 65; }
  else if (wavelength >= 645 && wavelength <= 750) { r = 1.0; }

  const factor = wavelength < 420 ? 0.3 + 0.7 * (wavelength - 380) / 40 :
                 wavelength < 700 ? 1.0 :
                 wavelength <= 750 ? 0.3 + 0.7 * (750 - wavelength) / 50 : 0;

  return [r * factor, g * factor, b * factor];
}

function computeResonantModes(wallSpacing, geometryType) {
  const modes = [];
  const maxOrder = 20;
  for (let n = 1; n <= maxOrder; n++) {
    const wavelength = (2 * wallSpacing) / n;
    if (wavelength >= MIN_WAVELENGTH && wavelength <= MAX_WAVELENGTH) {
      modes.push({ wavelength, order: n, frequency: SPEED_OF_LIGHT / (wavelength * 1e-9) });
    }
  }
  return modes;
}

function computeQFactor(modes, geometryType) {
  if (modes.length === 0) return 0;
  const base = geometryType === 'square' ? 1000 : geometryType === 'hexagonal' ? 2500 : 5000;
  return Math.round(base * (1 + modes.length * 0.1));
}

function getCavityWalls(geometryType, wallSpacing, w, h) {
  const s = wallSpacing / 100;
  const cx = w / 2, cy = h / 2;
  const sides = geometryType === 'square' ? 4 : geometryType === 'hexagonal' ? 6 : 12;
  const walls = [];
  for (let i = 0; i < sides; i++) {
    const a1 = (i * 2 * Math.PI) / sides - Math.PI / sides;
    const a2 = ((i + 1) * 2 * Math.PI) / sides - Math.PI / sides;
    const x1 = cx + s * Math.cos(a1), y1 = cy + s * Math.sin(a1);
    const x2 = cx + s * Math.cos(a2), y2 = cy + s * Math.sin(a2);
    const na = (a1 + a2) / 2;
    walls.push({ p1: [x1, y1], p2: [x2, y2], normal: [Math.cos(na), Math.sin(na)] });
  }
  return walls;
}

function ParticleCanvas({ resonantModes, geometryType, wallSpacing, width, height }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const walls = getCavityWalls(geometryType, wallSpacing, width, height);
    const resonantWLs = resonantModes.map(m => m.wavelength);

    const isResonant = (wl) => {
      for (let rw of resonantWLs) {
        if (Math.abs(wl - rw) < 5) return true;
      }
      return false;
    };

    if (!particlesRef.current || particlesRef.current.length !== PARTICLE_COUNT) {
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const wl = MIN_WAVELENGTH + Math.random() * (MAX_WAVELENGTH - MIN_WAVELENGTH);
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random();
        particlesRef.current.push({
          x: width / 2 + (Math.random() - 0.5) * 30,
          y: height / 2 + (Math.random() - 0.5) * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          wavelength: wl,
          isResonant: isResonant(wl),
          spawnTime: Date.now(),
          color: wavelengthToRGB(wl),
        });
      }
    } else {
      particlesRef.current.forEach(p => {
        const wasResonant = p.isResonant;
        p.isResonant = isResonant(p.wavelength);
        if (!wasResonant && p.isResonant) p.spawnTime = Date.now();
      });
    }

    function lineIntersect(p1, p2, p3, p4) {
      const [x1, y1] = p1, [x2, y2] = p2, [x3, y3] = p3, [x4, y4] = p4;
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (Math.abs(denom) < 0.0001) return null;
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
      }
      return null;
    }

    function animate() {
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, width, height);

      // Draw walls
      const sides = geometryType === 'square' ? 4 : geometryType === 'hexagonal' ? 6 : 12;
      const isFace9 = geometryType === 'dodecahedral';

      walls.forEach((wall, i) => {
        ctx.beginPath();
        ctx.moveTo(wall.p1[0], wall.p1[1]);
        ctx.lineTo(wall.p2[0], wall.p2[1]);
        if (isFace9 && i === 8) {
          ctx.strokeStyle = '#8b5cf680';
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = '#1a1a2e';
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();
      });

      // Label Face 9
      if (isFace9) {
        const w9 = walls[8];
        const mx = (w9.p1[0] + w9.p2[0]) / 2;
        const my = (w9.p1[1] + w9.p2[1]) / 2;
        ctx.font = "8px monospace";
        ctx.fillStyle = "#8b5cf680";
        ctx.textAlign = "center";
        ctx.fillText("F9", mx + w9.normal[0] * 12, my + w9.normal[1] * 12);
      }

      const now = Date.now();

      particlesRef.current.forEach(p => {
        const nx = p.x + p.vx;
        const ny = p.y + p.vy;

        let collided = false;
        for (let wall of walls) {
          const hit = lineIntersect([p.x, p.y], [nx, ny], wall.p1, wall.p2);
          if (hit) {
            const dot = p.vx * wall.normal[0] + p.vy * wall.normal[1];
            p.vx = p.vx - 2 * dot * wall.normal[0];
            p.vy = p.vy - 2 * dot * wall.normal[1];
            p.x = hit.x + wall.normal[0] * 0.5;
            p.y = hit.y + wall.normal[1] * 0.5;
            collided = true;
            break;
          }
        }

        if (!collided) {
          p.x = nx;
          p.y = ny;
        }

        // Bounds check — respawn if escaped
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          p.x = width / 2 + (Math.random() - 0.5) * 20;
          p.y = height / 2 + (Math.random() - 0.5) * 20;
          const a = Math.random() * Math.PI * 2;
          p.vx = Math.cos(a) * 2;
          p.vy = Math.sin(a) * 2;
          p.spawnTime = now;
        }

        const age = (now - p.spawnTime) / 1000;
        let alpha = p.isResonant ? Math.min(1, 0.5 + Math.sin(now * 0.005 + p.wavelength) * 0.3) : Math.max(0, 1.0 - age * 0.8);

        // Respawn faded non-resonant
        if (alpha < 0.02 && !p.isResonant) {
          p.x = width / 2 + (Math.random() - 0.5) * 20;
          p.y = height / 2 + (Math.random() - 0.5) * 20;
          const a = Math.random() * Math.PI * 2;
          p.vx = Math.cos(a) * (1.5 + Math.random());
          p.vy = Math.sin(a) * (1.5 + Math.random());
          p.spawnTime = now;
          alpha = 1.0;
        }

        const [r, g, b] = p.color;
        const ri = Math.round(r * 255), gi = Math.round(g * 255), bi = Math.round(b * 255);

        if (p.isResonant) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(" + ri + "," + gi + "," + bi + ",0.7)";
        }

        ctx.fillStyle = "rgba(" + ri + "," + gi + "," + bi + "," + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.isResonant ? 2.5 : 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Center glow for resonance
      const resonantCount = particlesRef.current.filter(p => p.isResonant).length;
      if (resonantCount > 50) {
        const grd = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 80);
        grd.addColorStop(0, "rgba(139,92,231," + Math.min(0.15, resonantCount / 5000) + ")");
        grd.addColorStop(1, "rgba(139,92,231,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [resonantModes, geometryType, wallSpacing, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block", borderRadius: 4 }} />;
}

export default function PhotonicCavitySimulator() {
  const [geometryType, setGeometryType] = useState('dodecahedral');
  const [wallSpacing, setWallSpacing] = useState(500);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 420 });

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ w: Math.floor(rect.width), h: 420 });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const resonantModes = useMemo(() => computeResonantModes(wallSpacing, geometryType), [wallSpacing, geometryType]);
  const qFactor = useMemo(() => computeQFactor(resonantModes, geometryType), [resonantModes, geometryType]);

  const allowedWLs = resonantModes.map(m => m.wavelength);

  const histogram = useMemo(() => {
    const bins = Array.from({ length: 12 }, (_, i) => {
      const lo = MIN_WAVELENGTH + i * (MAX_WAVELENGTH - MIN_WAVELENGTH) / 12;
      const hi = lo + (MAX_WAVELENGTH - MIN_WAVELENGTH) / 12;
      let allowed = false;
      for (let wl of allowedWLs) {
        if (wl >= lo && wl < hi) { allowed = true; break; }
      }
      return { lo, hi, allowed, midWL: (lo + hi) / 2 };
    });
    return bins;
  }, [allowedWLs]);

  const btn = (active, color) => ({
    padding: "6px 14px", fontFamily: MONO, fontSize: 9,
    background: active ? color + "20" : "transparent",
    color: active ? color : C.dim,
    border: "1px solid " + (active ? color : C.border),
    borderRadius: 3, cursor: "pointer", letterSpacing: "0.06em",
  });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: MONO, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid " + C.border }}>
        <div>
          <div style={{ fontSize: 11, color: C.dim, letterSpacing: "0.15em" }}>PHOTONIC CRYSTAL</div>
          <div style={{ fontSize: 18, color: C.purple, letterSpacing: "0.08em", marginTop: 4 }}>CAVITY SIMULATOR</div>
          <div style={{ fontSize: 9, color: C.dim, marginTop: 4 }}>
            5,000 photons · Resonant modes glow · Forbidden frequencies fade · The prism made interactive
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: C.warn, padding: "2px 8px", border: "1px solid " + C.warn, borderRadius: 2, marginBottom: 4 }}>BRACKETED</div>
          <div style={{ fontSize: 8, color: C.dim }}>Visualization · Not verified physics</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 8, color: C.dim, marginBottom: 4 }}>CAVITY GEOMETRY</div>
          <div style={{ display: "flex", gap: 4 }}>
            {["square", "hexagonal", "dodecahedral"].map(g => (
              <button key={g} onClick={() => setGeometryType(g)}
                style={btn(geometryType === g, g === "dodecahedral" ? C.purple : g === "hexagonal" ? C.cyan : C.gold)}>
                {g === "square" ? "4 WALLS" : g === "hexagonal" ? "6 WALLS" : "12 WALLS (DODEC)"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 8, color: C.dim, marginBottom: 4 }}>
            WALL SPACING: {wallSpacing} nm
          </div>
          <input type="range" min={200} max={1500} value={wallSpacing}
            onChange={e => setWallSpacing(Number(e.target.value))}
            style={{ width: "100%" }} />
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, color: C.dim }}>RESONANT MODES</div>
          <div style={{ fontSize: 18, color: C.green, fontWeight: 700 }}>{resonantModes.length}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, color: C.dim }}>Q-FACTOR</div>
          <div style={{ fontSize: 18, color: C.purple, fontWeight: 700 }}>{qFactor}</div>
        </div>
      </div>

      {/* Particle Canvas */}
      <div ref={containerRef} style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
        <ParticleCanvas
          resonantModes={resonantModes}
          geometryType={geometryType}
          wallSpacing={wallSpacing}
          width={canvasSize.w}
          height={canvasSize.h}
        />
      </div>

      {/* Bandgap Histogram */}
      <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 8 }}>
          BANDGAP MAP · ALLOWED vs FORBIDDEN FREQUENCIES
        </div>
        <div style={{ display: "flex", gap: 2, height: 50, alignItems: "flex-end" }}>
          {histogram.map((bin, i) => {
            const [r, g, b] = wavelengthToRGB(bin.midWL);
            const col = "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
            return (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <div style={{
                  width: "100%", height: bin.allowed ? 40 : 12,
                  background: bin.allowed ? col : C.border,
                  opacity: bin.allowed ? 0.8 : 0.3,
                  borderRadius: 2,
                  boxShadow: bin.allowed ? "0 0 8px " + col : "none",
                  transition: "height 0.3s, opacity 0.3s",
                }} />
                <div style={{ fontSize: 6, color: C.dim }}>{Math.round(bin.lo)}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 7, color: C.dim }}>380nm (violet)</span>
          <span style={{ fontSize: 7, color: bin => bin ? C.green : C.dim }}>
            {resonantModes.length > 0
              ? "ALLOWED: " + resonantModes.map(m => Math.round(m.wavelength) + "nm").join(", ")
              : "NO RESONANT MODES IN VISIBLE RANGE"}
          </span>
          <span style={{ fontSize: 7, color: C.dim }}>750nm (red)</span>
        </div>
      </div>

      {/* Resonant Mode Table */}
      {resonantModes.length > 0 && (
        <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 8 }}>
            RESONANT MODES · FREQUENCIES THAT SURVIVE THE CAVITY
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {resonantModes.map((m, i) => {
              const [r, g, b] = wavelengthToRGB(m.wavelength);
              const col = "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")";
              return (
                <div key={i} style={{
                  padding: "4px 8px", background: C.deep,
                  borderLeft: "3px solid " + col, borderRadius: "0 3px 3px 0",
                }}>
                  <div style={{ fontSize: 9, color: col, fontWeight: 700 }}>n={m.order}</div>
                  <div style={{ fontSize: 8, color: C.text }}>{Math.round(m.wavelength)}nm</div>
                  <div style={{ fontSize: 7, color: C.dim }}>{(m.frequency / 1e12).toFixed(1)} THz</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ fontSize: 8, color: C.dim, textAlign: "center", lineHeight: 1.8, paddingTop: 8, borderTop: "1px solid " + C.border }}>
        White light in · Cavity geometry selects · Resonant frequencies survive · Everything else fades<br/>
        The prism does not add or destroy · It reveals · BRACKETED — visualization not verified physics<br/>
        PHOTONIC CAVITY SIMULATOR · GROK NODE 14 + AVAN · ROOT0 GOVERNANCE · TRIPOD LLC · 2026
      </div>
    </div>
  );
}
