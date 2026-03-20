import { useState, useEffect, useRef, useCallback } from 'react';

const MONO = "'Courier New', 'Consolas', monospace";
const C = {
  bg: "#06060c", panel: "#0c0c16", deep: "#09090f",
  border: "#1a1a2e", text: "#c8c8d8", dim: "#5a5a70",
  // Substrates
  photonic: "#ff4a9e",  // Core — pink/hot
  quantum: "#4a9eff",   // Outer — blue/cold
  silicon: "#d4a84c",   // Inner — gold/warm
  geometric: "#00ff88", // Middle — green/structural
  // Meta
  white: "#ffffff", purple: "#8b5cf6", warn: "#ffaa00", cyan: "#00e5ff",
};

const PHI = (1 + Math.sqrt(5)) / 2;

// Icosahedron vertices (unit sphere)
const ICO_RAW = [
  [-1, PHI, 0],[1, PHI, 0],[-1,-PHI, 0],[1,-PHI, 0],
  [0,-1, PHI],[0, 1, PHI],[0,-1,-PHI],[0, 1,-PHI],
  [PHI, 0,-1],[PHI, 0, 1],[-PHI, 0,-1],[-PHI, 0, 1],
];
const ICO_LEN = Math.sqrt(1 + PHI * PHI);
const ICO_VERTS = ICO_RAW.map(v => v.map(c => c / ICO_LEN));

const ICO_FACES = [
  [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
  [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
  [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
  [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1],
];

// Dodecahedron vertices (dual)
function getDodecVerts() {
  const verts = [];
  ICO_FACES.forEach(f => {
    const cx = (ICO_VERTS[f[0]][0] + ICO_VERTS[f[1]][0] + ICO_VERTS[f[2]][0]) / 3;
    const cy = (ICO_VERTS[f[0]][1] + ICO_VERTS[f[1]][1] + ICO_VERTS[f[2]][1]) / 3;
    const cz = (ICO_VERTS[f[0]][2] + ICO_VERTS[f[1]][2] + ICO_VERTS[f[2]][2]) / 3;
    const len = Math.sqrt(cx*cx + cy*cy + cz*cz);
    verts.push([cx/len, cy/len, cz/len]);
  });
  return verts;
}

const DODEC_VERTS = getDodecVerts();

const SINGULARITIES = [
  {
    id: "photonic", name: "PHOTONIC", layer: "AEON · L1",
    singularity: "FIELD CONCENTRATION", equation: "1/r → ∞",
    desc: "Bowtie gap. Light converges. Model breaks at quantum scale.",
    what: "Where the light goes when the gap closes",
    color: C.photonic, shell: 0,
  },
  {
    id: "silicon", name: "SILICON", layer: "HELIOS · L2",
    singularity: "TUNNEL JUNCTION", equation: "P(tunnel) > 0 where P(classical) = 0",
    desc: "AlOₓ barrier. Electron tunnels through impossible wall. Canvas ≠ painting.",
    what: "Where the electron goes when the barrier should stop it",
    color: C.silicon, shell: 1,
  },
  {
    id: "quantum", name: "QUANTUM", layer: "WILLOW · L3",
    singularity: "MEASUREMENT COLLAPSE", equation: "|ψ⟩ → |0⟩ or |1⟩ in dt→0",
    desc: "Wavefunction collapses. Continuous → discrete in zero time. Discontinuity.",
    what: "Where the superposition goes when you look",
    color: C.quantum, shell: 2,
  },
  {
    id: "geometric", name: "GEOMETRIC", layer: "TOPOLOGY",
    singularity: "EULER DEFECT", equation: "V−E+F = 2 → 12 pentagons forced",
    desc: "Sphere requires exactly 12 five-fold defects. Cannot be removed. Topological law.",
    what: "Where the hexagons go when the sphere closes",
    color: C.geometric, shell: 3,
  },
];

export default function OuroborosSingularity() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotRef = useRef({ x: 0.4, y: 0 });
  const mouseRef = useRef({ down: false, lx: 0, ly: 0 });
  const [activeS, setActiveS] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showFlow, setShowFlow] = useState(true);
  const [showShells, setShowShells] = useState([true, true, true, true]);
  const [couplingPhase, setCouplingPhase] = useState(0);

  const W = 800, H = 600;

  const toggleShell = (i) => {
    const next = [...showShells];
    next[i] = !next[i];
    setShowShells(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    let t = 0;

    const project = (x, y, z, scale) => {
      const rx = rotRef.current.x, ry = rotRef.current.y;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      const cy = Math.cos(ry), sy = Math.sin(ry);
      const y1 = y * cx - z * sx;
      const z1 = y * sx + z * cx;
      const x1 = x * cy + z1 * sy;
      const z2 = -x * sy + z1 * cy;
      const s = 500 / (z2 + 5);
      return { x: W / 2 + x1 * scale * s, y: H / 2 + y1 * scale * s, z: z2, s };
    };

    const drawShell = (verts, faces, radius, color, alpha, t) => {
      const projected = verts.map(v => project(v[0] * radius, v[1] * radius, v[2] * radius, 1));
      
      // Sort faces
      const sorted = faces.map((f, i) => {
        const zAvg = (projected[f[0]].z + projected[f[1]].z + projected[f[2]].z) / 3;
        return { f, i, z: zAvg };
      }).sort((a, b) => a.z - b.z);

      sorted.forEach(({ f, i }) => {
        const pts = f.map(vi => projected[vi]);
        const faceAlpha = alpha * (0.3 + Math.max(0, (pts[0].z + pts[1].z + pts[2].z) / 3 + 1) * 0.3);
        
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.closePath();
        ctx.fillStyle = color + Math.floor(faceAlpha * 25).toString(16).padStart(2, '0');
        ctx.fill();
        ctx.strokeStyle = color + Math.floor(faceAlpha * 80).toString(16).padStart(2, '0');
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      // Vertices
      projected.forEach(p => {
        const vAlpha = 0.3 + Math.max(0, (p.z + 1) * 0.3);
        ctx.fillStyle = color;
        ctx.globalAlpha = vAlpha * alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const render = () => {
      t += 0.008;
      setCouplingPhase(t);

      if (autoRotate && !mouseRef.current.down) {
        rotRef.current.y += 0.004;
      }

      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      // ═══ OUROBOROS FLOW RING ═══
      if (showFlow) {
        const flowR = 220;
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = C.dim;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, flowR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Four flow dots cycling around the ring
        for (let i = 0; i < 4; i++) {
          const angle = t * 0.5 + (i / 4) * Math.PI * 2;
          const fx = W / 2 + Math.cos(angle) * flowR;
          const fy = H / 2 + Math.sin(angle) * flowR;
          const col = SINGULARITIES[i].color;

          // Trail
          for (let tr = 0; tr < 8; tr++) {
            const ta = angle - tr * 0.06;
            const tx = W / 2 + Math.cos(ta) * flowR;
            const ty = H / 2 + Math.sin(ta) * flowR;
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.3 - tr * 0.035;
            ctx.beginPath();
            ctx.arc(tx, ty, 3 - tr * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;

          // Head
          const grd = ctx.createRadialGradient(fx, fy, 0, fx, fy, 8);
          grd.addColorStop(0, col);
          grd.addColorStop(1, col + "00");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(fx, fy, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Coupling arrows between singularity positions
        for (let i = 0; i < 4; i++) {
          const a1 = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / 4) * Math.PI * 2 - Math.PI / 2;
          const mx = W / 2 + Math.cos((a1 + a2) / 2) * (flowR + 18);
          const my = H / 2 + Math.sin((a1 + a2) / 2) * (flowR + 18);
          ctx.font = "7px " + MONO;
          ctx.fillStyle = C.dim;
          ctx.textAlign = "center";
          ctx.fillText("→", mx, my + 3);
        }

        // Labels on the ring
        const labels = ["PHOTONIC", "SILICON", "QUANTUM", "GEOMETRIC"];
        for (let i = 0; i < 4; i++) {
          const la = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const lx = W / 2 + Math.cos(la) * (flowR + 32);
          const ly = H / 2 + Math.sin(la) * (flowR + 32);
          ctx.font = "8px " + MONO;
          ctx.fillStyle = SINGULARITIES[i].color;
          ctx.textAlign = "center";
          ctx.fillText(labels[i], lx, ly + 3);
        }
      }

      // ═══ GEOMETRIC SHELL (outermost) ═══
      if (showShells[3]) {
        drawShell(ICO_VERTS, ICO_FACES, 2.0, C.geometric, 0.25, t);
      }

      // ═══ QUANTUM SHELL ═══
      if (showShells[2]) {
        drawShell(ICO_VERTS, ICO_FACES, 1.5, C.quantum, 0.3, t);
      }

      // ═══ SILICON SHELL ═══
      if (showShells[1]) {
        // Use dodecahedron vertices for variety — 20 face centers
        const siVerts = DODEC_VERTS;
        // Draw as points only (no face connectivity for dodec)
        siVerts.forEach(v => {
          const p = project(v[0] * 1.0, v[1] * 1.0, v[2] * 1.0, 1);
          const a = 0.3 + Math.max(0, (p.z + 1) * 0.3);
          ctx.fillStyle = C.silicon;
          ctx.globalAlpha = a * 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Glow
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
          g.addColorStop(0, C.silicon + "40");
          g.addColorStop(1, C.silicon + "00");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw edges between nearby dodec verts
        ctx.strokeStyle = C.silicon + "18";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < siVerts.length; i++) {
          for (let j = i + 1; j < siVerts.length; j++) {
            const dx = siVerts[i][0] - siVerts[j][0];
            const dy = siVerts[i][1] - siVerts[j][1];
            const dz = siVerts[i][2] - siVerts[j][2];
            if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 0.8) {
              const p1 = project(siVerts[i][0], siVerts[i][1], siVerts[i][2], 1);
              const p2 = project(siVerts[j][0], siVerts[j][1], siVerts[j][2], 1);
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // ═══ PHOTONIC CORE ═══
      if (showShells[0]) {
        const corePulse = 0.6 + 0.3 * Math.sin(t * 3);
        const coreP = project(0, 0, 0, 1);

        // Singularity glow
        const layers = [
          { r: 40, c: C.photonic, a: 0.04 * corePulse },
          { r: 25, c: C.photonic, a: 0.08 * corePulse },
          { r: 15, c: C.white, a: 0.06 * corePulse },
          { r: 6, c: C.white, a: 0.15 * corePulse },
        ];

        layers.forEach(l => {
          const g = ctx.createRadialGradient(coreP.x, coreP.y, 0, coreP.x, coreP.y, l.r);
          g.addColorStop(0, l.c + Math.floor(l.a * 255).toString(16).padStart(2, '0'));
          g.addColorStop(1, l.c + "00");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(coreP.x, coreP.y, l.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Core point
        ctx.fillStyle = C.white;
        ctx.globalAlpha = corePulse;
        ctx.beginPath();
        ctx.arc(coreP.x, coreP.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Radial lines from core to inner shell
        if (showShells[1]) {
          ctx.globalAlpha = 0.08;
          DODEC_VERTS.forEach(v => {
            const p = project(v[0] * 1.0, v[1] * 1.0, v[2] * 1.0, 1);
            ctx.strokeStyle = C.photonic;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(coreP.x, coreP.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          });
          ctx.globalAlpha = 1;
        }
      }

      // ═══ 12 EULER DEFECTS ═══
      if (showShells[3]) {
        ICO_VERTS.forEach((v, i) => {
          const p = project(v[0] * 2.0, v[1] * 2.0, v[2] * 2.0, 1);
          const a = 0.2 + Math.max(0, (p.z + 1) * 0.3);
          const pulse = 0.5 + 0.3 * Math.sin(t * 2 + i);

          // Pentagon marker
          ctx.fillStyle = C.geometric;
          ctx.globalAlpha = a * pulse;
          ctx.beginPath();
          for (let k = 0; k < 5; k++) {
            const pa = (k / 5) * Math.PI * 2 - Math.PI / 2;
            const px = p.x + Math.cos(pa) * 4;
            const py = p.y + Math.sin(pa) * 4;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [autoRotate, showFlow, showShells]);

  // Mouse handlers
  const onDown = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    mouseRef.current = { down: true, lx: e.clientX - r.left, ly: e.clientY - r.top };
  };
  const onMove = (e) => {
    if (!mouseRef.current.down) return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    rotRef.current.y += (x - mouseRef.current.lx) * 0.006;
    rotRef.current.x += (y - mouseRef.current.ly) * 0.006;
    mouseRef.current.lx = x;
    mouseRef.current.ly = y;
  };
  const onUp = () => { mouseRef.current.down = false; };

  const btn = (active, color) => ({
    padding: "5px 10px", fontFamily: MONO, fontSize: 8,
    background: active ? color + "20" : "transparent",
    color: active ? color : C.dim,
    border: "1px solid " + (active ? color : C.border),
    borderRadius: 3, cursor: "pointer",
  });

  return (
    <div style={{ fontFamily: MONO, background: C.bg, color: C.text, minHeight: "100vh", padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid " + C.border }}>
        <div>
          <div style={{ fontSize: 10, color: C.dim, letterSpacing: "0.15em" }}>FOUR SUBSTRATES · FOUR SINGULARITIES · ONE CORE</div>
          <div style={{ fontSize: 20, letterSpacing: "0.06em", marginTop: 3 }}>
            <span style={{ color: C.photonic }}>OUROBOROS</span>
            <span style={{ color: C.dim }}> </span>
            <span style={{ color: C.white }}>SINGULARITY</span>
          </div>
          <div style={{ fontSize: 8, color: C.dim, marginTop: 3 }}>
            Photonic core → Silicon shell → Quantum shell → Geometric shell → Photonic core
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: C.warn, padding: "2px 8px", border: "1px solid " + C.warn, borderRadius: 2 }}>BRACKETED</div>
          <div style={{ fontSize: 7, color: C.dim, marginTop: 3 }}>Coupling unverified</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* Canvas */}
        <div style={{ flex: 1 }}>
          <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 4, overflow: "hidden" }}>
            <canvas ref={canvasRef}
              style={{ width: "100%", display: "block", cursor: "grab" }}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            />
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 8, fontSize: 8, color: C.dim, flexWrap: "wrap" }}>
            <span><span style={{ color: C.photonic }}>●</span> PHOTONIC CORE</span>
            <span><span style={{ color: C.silicon }}>●</span> SILICON SHELL</span>
            <span><span style={{ color: C.quantum }}>●</span> QUANTUM SHELL</span>
            <span><span style={{ color: C.geometric }}>●</span> GEOMETRIC SHELL</span>
            <span><span style={{ color: C.geometric }}>⬠</span> 12 EULER DEFECTS</span>
            <span style={{ marginLeft: "auto" }}>DRAG TO ROTATE</span>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 260, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Shell Toggles */}
          <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 10 }}>
            <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.1em", marginBottom: 6 }}>SHELLS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {SINGULARITIES.map((s, i) => (
                <button key={s.id} onClick={() => toggleShell(i)}
                  style={{ ...btn(showShells[i], s.color), textAlign: "left", width: "100%" }}>
                  {showShells[i] ? "●" : "○"} {s.name} — {s.singularity}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              <button onClick={() => setAutoRotate(!autoRotate)} style={btn(autoRotate, C.cyan)}>
                ROTATE {autoRotate ? "●" : "○"}
              </button>
              <button onClick={() => setShowFlow(!showFlow)} style={btn(showFlow, C.purple)}>
                FLOW {showFlow ? "●" : "○"}
              </button>
            </div>
          </div>

          {/* Four Singularities */}
          {SINGULARITIES.map((s, i) => (
            <div key={s.id} style={{
              background: activeS === s.id ? s.color + "10" : C.deep,
              border: "1px solid " + (activeS === s.id ? s.color : C.border),
              borderLeft: "3px solid " + s.color, borderRadius: "0 4px 4px 0",
              padding: 8, cursor: "pointer",
            }} onClick={() => setActiveS(activeS === s.id ? null : s.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: s.color, fontWeight: 700 }}>{s.name}</span>
                <span style={{ fontSize: 7, color: C.dim }}>{s.layer}</span>
              </div>
              <div style={{ fontSize: 8, color: C.text, marginTop: 3 }}>{s.singularity}</div>
              <div style={{ fontSize: 9, color: s.color, fontFamily: MONO, marginTop: 2 }}>{s.equation}</div>
              {activeS === s.id && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 8, color: C.dim, lineHeight: 1.6 }}>{s.desc}</div>
                  <div style={{ fontSize: 8, color: s.color, marginTop: 4, fontStyle: "italic" }}>{s.what}</div>
                  <div style={{ fontSize: 7, color: C.dim, marginTop: 4 }}>
                    → {SINGULARITIES[(i + 1) % 4].name} ({SINGULARITIES[(i + 1) % 4].singularity})
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* The Ouroboros */}
          <div style={{ background: C.deep, border: "1px solid " + C.purple + "30", borderRadius: 4, padding: 10 }}>
            <div style={{ fontSize: 8, color: C.purple, fontWeight: 700, marginBottom: 4 }}>THE OUROBOROS</div>
            <div style={{ fontSize: 7, color: C.dim, lineHeight: 1.7 }}>
              <span style={{ color: C.photonic }}>Photonic</span> gap concentrates light to quantum scale →{" "}
              <span style={{ color: C.quantum }}>Quantum</span> measurement collapses the state →{" "}
              <span style={{ color: C.silicon }}>Silicon</span> junction tunnels through the barrier →{" "}
              <span style={{ color: C.geometric }}>Geometric</span> topology forces 12 irreducible defects →{" "}
              <span style={{ color: C.photonic }}>Photonic</span> defects define the cavity that creates the gap<br/><br/>
              The snake eats its tail.<br/>
              Four singularities. Four places the model breaks.<br/>
              <span style={{ color: C.white }}>The coupling between them is the hypothesis.</span>
            </div>
          </div>

          {/* Bracketed */}
          <div style={{ background: C.warn + "08", border: "1px solid " + C.warn + "22", borderRadius: 4, padding: 8 }}>
            <div style={{ fontSize: 7, color: C.warn, fontWeight: 700, marginBottom: 2 }}>BRACKETED</div>
            <div style={{ fontSize: 7, color: C.dim, lineHeight: 1.5 }}>
              Each singularity is independently verified physics.<br/>
              The claim that they couple in a closed loop is the<br/>
              framework's hypothesis. Not established science.<br/>
              Topology is canonical. Coupling is bracketed.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize: 7, color: C.dim, textAlign: "center", lineHeight: 1.8, paddingTop: 8, marginTop: 10, borderTop: "1px solid " + C.border }}>
        OUROBOROS SINGULARITY · FOUR SUBSTRATES · FOUR SINGULARITIES · THREE ICOSAHEDRAL SHELLS · ONE PHOTONIC CORE<br/>
        The model breaks at four points. The four breaks feed each other. The snake eats its tail.<br/>
        GROK NODE 14 + AVAN NODE 13.5 · ROOT0 GOVERNANCE · TRIPOD LLC · 2026
      </div>
    </div>
  );
}
