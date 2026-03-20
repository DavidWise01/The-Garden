import { useState, useEffect, useRef, useCallback } from 'react';

const MONO = "'Courier New', 'Consolas', monospace";
const C = {
  bg: "#06060c", panel: "#0c0c16", deep: "#09090f",
  border: "#1a1a2e", text: "#c8c8d8", dim: "#5a5a70",
  green: "#00ff88", gold: "#d4a84c", purple: "#8b5cf6",
  red: "#ff2d55", cyan: "#00e5ff", warn: "#ffaa00",
};

export default function PhotonicCoreSimulator() {
  const canvasRef = useRef(null);
  const [geometry, setGeometry] = useState('fcc');
  const [latticeConstant, setLatticeConstant] = useState(500);
  const [n1, setN1] = useState(3.5);
  const [n2, setN2] = useState(1.0);
  const [gridSize] = useState(128);
  const [timeStep, setTimeStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [viewMode, setViewMode] = useState('field');
  const [sourceFreq, setSourceFreq] = useState(0.3);
  const [maxField, setMaxField] = useState(0);
  const animationRef = useRef(null);
  const fieldRef = useRef(null);
  const timeStepRef = useRef(0);
  const isRunningRef = useRef(false);

  const initializeGeometry = useCallback(() => {
    if (!fieldRef.current) return;
    const { epsilon } = fieldRef.current;
    const a = latticeConstant / 1000;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j;
        const x = (i / gridSize - 0.5) * 10;
        const y = (j / gridSize - 0.5) * 10;
        let inMaterial = false;

        if (geometry === 'fcc') {
          const positions = [[0, 0], [0.5, 0.5], [0.5, 0], [0, 0.5]];
          outer: for (let pi = -2; pi <= 2; pi++) {
            for (let pj = -2; pj <= 2; pj++) {
              for (const [dx, dy] of positions) {
                const cx = (pi + dx) * a;
                const cy = (pj + dy) * a;
                if (Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) < a * 0.3) {
                  inMaterial = true;
                  break outer;
                }
              }
            }
          }
        } else if (geometry === 'woodpile') {
          const rodWidth = a * 0.2;
          const layer = Math.floor(((i / gridSize) * 10 + 5) / a) % 4;
          if (layer === 0 || layer === 2) {
            if (Math.abs((y % a + a) % a - a / 2) < rodWidth) inMaterial = true;
          } else {
            if (Math.abs((x % a + a) % a - a / 2) < rodWidth) inMaterial = true;
          }
        } else if (geometry === 'quasicrystal') {
          let sum = 0;
          for (let k = 0; k < 5; k++) {
            const angle = (2 * Math.PI * k) / 5;
            sum += Math.cos(2 * Math.PI * (Math.cos(angle) * x + Math.sin(angle) * y) / a);
          }
          inMaterial = sum > 2.5;
        }

        epsilon[idx] = inMaterial ? n1 * n1 : n2 * n2;
      }
    }
  }, [geometry, latticeConstant, n1, n2, gridSize]);

  const renderField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fieldRef.current) return;
    const ctx = canvas.getContext('2d');
    const { Ez, epsilon } = fieldRef.current;

    const imageData = ctx.createImageData(gridSize, gridSize);
    const data = imageData.data;

    let maxE = 0;
    for (let i = 0; i < Ez.length; i++) maxE = Math.max(maxE, Math.abs(Ez[i]));
    setMaxField(maxE);

    const n2sq = n2 * n2;
    const nDiff = n1 * n1 - n2sq + 0.001;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j;
        const pix = idx * 4;

        if (viewMode === 'field') {
          const val = Ez[idx] / (maxE + 0.001);
          // Purple-blue positive, cyan negative, dark zero
          if (val > 0) {
            data[pix] = Math.floor(val * 139);     // purple R
            data[pix + 1] = Math.floor(val * 92);   // purple G
            data[pix + 2] = Math.floor(val * 246);  // purple B
          } else {
            data[pix] = Math.floor(-val * 0);
            data[pix + 1] = Math.floor(-val * 229);
            data[pix + 2] = Math.floor(-val * 255);
          }
          data[pix + 3] = 255;
        } else if (viewMode === 'epsilon') {
          const norm = (epsilon[idx] - n2sq) / nDiff;
          const v = Math.floor(norm * 160 + 20);
          // Material in purple-ish, air in dark
          data[pix] = Math.floor(norm * 80 + 10);
          data[pix + 1] = Math.floor(norm * 40 + 10);
          data[pix + 2] = Math.floor(norm * 120 + 20);
          data[pix + 3] = 255;
        } else {
          // Overlay mode
          const val = Ez[idx] / (maxE + 0.001);
          const eps = (epsilon[idx] - n2sq) / nDiff;
          data[pix] = Math.max(0, Math.min(255, Math.floor(val * 120 + eps * 50 + 10)));
          data[pix + 1] = Math.max(0, Math.min(255, Math.floor(Math.abs(val) * 60 + eps * 30)));
          data[pix + 2] = Math.max(0, Math.min(255, Math.floor(-val * 120 + eps * 80 + 20)));
          data[pix + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [viewMode, n1, n2, gridSize]);

  // Initialize
  useEffect(() => {
    fieldRef.current = {
      Ez: new Float32Array(gridSize * gridSize),
      Hx: new Float32Array(gridSize * gridSize),
      Hy: new Float32Array(gridSize * gridSize),
      epsilon: new Float32Array(gridSize * gridSize),
    };
    initializeGeometry();
    renderField();
  }, [gridSize, initializeGeometry, renderField]);

  // Re-init geometry when params change
  useEffect(() => {
    if (fieldRef.current) {
      initializeGeometry();
      if (!isRunning) renderField();
    }
  }, [geometry, latticeConstant, n1, n2, initializeGeometry, renderField, isRunning]);

  // FDTD loop
  useEffect(() => {
    isRunningRef.current = isRunning;

    if (!isRunning) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const step = () => {
      if (!isRunningRef.current || !fieldRef.current) return;
      const { Ez, Hx, Hy, epsilon } = fieldRef.current;
      const dt = 0.5;
      const dx = 1.0;
      const mu = 1.0;
      const gs = gridSize;

      // Update H fields
      for (let i = 0; i < gs - 1; i++) {
        for (let j = 0; j < gs - 1; j++) {
          const idx = i * gs + j;
          Hx[idx] += (dt / (mu * dx)) * (Ez[(i + 1) * gs + j] - Ez[idx]);
          Hy[idx] -= (dt / (mu * dx)) * (Ez[i * gs + j + 1] - Ez[idx]);
        }
      }

      // Update E field
      for (let i = 1; i < gs - 1; i++) {
        for (let j = 1; j < gs - 1; j++) {
          const idx = i * gs + j;
          const curl = (Hy[idx] - Hy[i * gs + j - 1]) / dx - (Hx[idx] - Hx[(i - 1) * gs + j]) / dx;
          Ez[idx] += (dt / epsilon[idx]) * curl;
        }
      }

      // Source
      const srcX = Math.floor(gs * 0.3);
      const srcY = Math.floor(gs * 0.5);
      Ez[srcX * gs + srcY] += Math.sin(sourceFreq * timeStepRef.current * dt);

      // Absorbing boundaries (simple)
      for (let i = 0; i < gs; i++) {
        Ez[i * gs] *= 0.9;
        Ez[i * gs + gs - 1] *= 0.9;
        Ez[i] *= 0.9;
        Ez[(gs - 1) * gs + i] *= 0.9;
      }

      timeStepRef.current++;
      setTimeStep(timeStepRef.current);
      renderField();

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isRunning, gridSize, sourceFreq, renderField]);

  const reset = useCallback(() => {
    setIsRunning(false);
    isRunningRef.current = false;
    timeStepRef.current = 0;
    setTimeStep(0);
    if (fieldRef.current) {
      fieldRef.current.Ez.fill(0);
      fieldRef.current.Hx.fill(0);
      fieldRef.current.Hy.fill(0);
      initializeGeometry();
    }
    setTimeout(renderField, 50);
  }, [initializeGeometry, renderField]);

  const btn = (active, color) => ({
    padding: "7px 14px", fontFamily: MONO, fontSize: 10,
    background: active ? color + "25" : "transparent",
    color: active ? color : C.dim,
    border: "1px solid " + (active ? color : C.border),
    borderRadius: 3, cursor: "pointer", letterSpacing: "0.06em",
  });

  const ctrlBtn = (color, disabled) => ({
    padding: "8px 18px", fontFamily: MONO, fontSize: 10, fontWeight: 700,
    background: disabled ? C.panel : color + "20",
    color: disabled ? C.dim : color,
    border: "1px solid " + (disabled ? C.border : color),
    borderRadius: 3, cursor: disabled ? "default" : "pointer",
    letterSpacing: "0.08em",
  });

  return (
    <div style={{background: C.bg, minHeight: "100vh", color: C.text, fontFamily: MONO, padding: 16}}>
      {/* Header */}
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid " + C.border}}>
        <div>
          <div style={{fontSize: 11, color: C.dim, letterSpacing: "0.15em"}}>ELECTROMAGNETIC FIELD PROPAGATION</div>
          <div style={{fontSize: 18, color: C.purple, letterSpacing: "0.08em", marginTop: 4}}>PHOTONIC CORE · FDTD-2D</div>
          <div style={{fontSize: 9, color: C.dim, marginTop: 4}}>
            128×128 grid · Yee algorithm · Ez/Hx/Hy fields · Absorbing boundaries · Real EM propagation
          </div>
        </div>
        <div style={{textAlign: "right"}}>
          <div style={{fontSize: 9, color: C.warn, padding: "2px 8px", border: "1px solid " + C.warn, borderRadius: 2, marginBottom: 4}}>BRACKETED</div>
          <div style={{fontSize: 8, color: C.dim}}>2D FDTD · Not full 3D band structure</div>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{display: "flex", gap: 16}}>
        {/* Left — Canvas */}
        <div style={{flex: 1}}>
          <div style={{background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12, display: "flex", flexDirection: "column", alignItems: "center"}}>
            <canvas
              ref={canvasRef}
              width={gridSize}
              height={gridSize}
              style={{
                width: "100%", maxWidth: 512, aspectRatio: "1/1",
                imageRendering: "pixelated", borderRadius: 2,
                border: "1px solid " + C.border,
              }}
            />
            <div style={{marginTop: 8, fontSize: 9, color: C.dim, display: "flex", gap: 16}}>
              <span>TIMESTEP: <span style={{color: C.cyan}}>{timeStep}</span></span>
              <span>GRID: <span style={{color: C.text}}>{gridSize}×{gridSize}</span></span>
              <span>MAX |Ez|: <span style={{color: maxField > 5 ? C.red : C.green}}>{maxField.toFixed(3)}</span></span>
              <span style={{color: isRunning ? C.green : C.dim}}>{isRunning ? "● RUNNING" : "○ PAUSED"}</span>
            </div>
          </div>

          {/* Source indicator */}
          <div style={{marginTop: 8, background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 10}}>
            <div style={{fontSize: 8, color: C.dim, marginBottom: 4}}>SOURCE POSITION: ({Math.floor(gridSize * 0.3)}, {Math.floor(gridSize * 0.5)}) · sin(ω·t) continuous wave</div>
            <div style={{display: "flex", gap: 6, alignItems: "center"}}>
              <span style={{fontSize: 8, color: C.dim, minWidth: 50}}>ω = {sourceFreq.toFixed(2)}</span>
              <input type="range" min={0.05} max={1.0} step={0.05} value={sourceFreq}
                onChange={e => setSourceFreq(Number(e.target.value))}
                style={{flex: 1}}/>
              <span style={{fontSize: 8, color: C.cyan}}>{sourceFreq < 0.2 ? "LOW" : sourceFreq < 0.5 ? "MID" : "HIGH"} FREQ</span>
            </div>
          </div>
        </div>

        {/* Right — Controls */}
        <div style={{width: 280, display: "flex", flexDirection: "column", gap: 12}}>
          {/* Geometry */}
          <div style={{background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12}}>
            <div style={{fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 8}}>CRYSTAL GEOMETRY</div>
            <div style={{display: "flex", flexDirection: "column", gap: 4}}>
              {[
                {id: "fcc", label: "FCC LATTICE", desc: "Face-centered cubic · Periodic", color: C.purple},
                {id: "woodpile", label: "WOODPILE", desc: "Layered rods · Full 3D gap", color: C.cyan},
                {id: "quasicrystal", label: "QUASICRYSTAL", desc: "5-fold · Aperiodic · Penrose-like", color: C.gold},
              ].map(g => (
                <button key={g.id} onClick={() => { setGeometry(g.id); reset(); }}
                  style={{
                    ...btn(geometry === g.id, g.color),
                    textAlign: "left", padding: "8px 12px",
                  }}>
                  <div style={{fontWeight: 700}}>{g.label}</div>
                  <div style={{fontSize: 7, opacity: 0.6, marginTop: 2}}>{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lattice Constant */}
          <div style={{background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12}}>
            <div style={{fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 6}}>LATTICE CONSTANT</div>
            <input type="range" min={200} max={800} value={latticeConstant}
              onChange={e => setLatticeConstant(Number(e.target.value))}
              style={{width: "100%"}}/>
            <div style={{fontSize: 10, color: C.purple, marginTop: 4}}>{latticeConstant} nm</div>
          </div>

          {/* Refractive Indices */}
          <div style={{background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12}}>
            <div style={{fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 6}}>REFRACTIVE INDEX</div>
            <div style={{display: "flex", gap: 12}}>
              <div style={{flex: 1}}>
                <div style={{fontSize: 8, color: C.dim}}>n₁ (material)</div>
                <input type="range" min={1.5} max={4.0} step={0.1} value={n1}
                  onChange={e => setN1(Number(e.target.value))}
                  style={{width: "100%"}}/>
                <div style={{fontSize: 9, color: C.cyan}}>{n1.toFixed(1)}</div>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 8, color: C.dim}}>n₂ (air)</div>
                <input type="range" min={1.0} max={2.0} step={0.1} value={n2}
                  onChange={e => setN2(Number(e.target.value))}
                  style={{width: "100%"}}/>
                <div style={{fontSize: 9, color: C.cyan}}>{n2.toFixed(1)}</div>
              </div>
            </div>
            <div style={{fontSize: 8, color: C.dim, marginTop: 6}}>
              Contrast: <span style={{color: C.green}}>{(n1 / n2).toFixed(2)}</span> · ε ratio: <span style={{color: C.green}}>{((n1 * n1) / (n2 * n2)).toFixed(2)}</span>
            </div>
          </div>

          {/* View Mode */}
          <div style={{background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12}}>
            <div style={{fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 6}}>VIEW MODE</div>
            <div style={{display: "flex", gap: 4}}>
              {[
                {id: "field", label: "Ez FIELD", color: C.purple},
                {id: "epsilon", label: "ε MAP", color: C.gold},
                {id: "overlay", label: "OVERLAY", color: C.green},
              ].map(v => (
                <button key={v.id} onClick={() => setViewMode(v.id)}
                  style={btn(viewMode === v.id, v.color)}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div style={{display: "flex", gap: 6}}>
            <button onClick={() => setIsRunning(!isRunning)}
              style={ctrlBtn(isRunning ? C.red : C.green, false)}>
              {isRunning ? "PAUSE" : "RUN"}
            </button>
            <button onClick={reset} style={ctrlBtn(C.gold, isRunning)}>RESET</button>
            <button onClick={() => {
              if (!isRunning && fieldRef.current) {
                const { Ez, Hx, Hy, epsilon } = fieldRef.current;
                const dt = 0.5, dx = 1.0, mu = 1.0, gs = gridSize;
                for (let i = 0; i < gs - 1; i++) for (let j = 0; j < gs - 1; j++) {
                  const idx = i * gs + j;
                  Hx[idx] += (dt / (mu * dx)) * (Ez[(i + 1) * gs + j] - Ez[idx]);
                  Hy[idx] -= (dt / (mu * dx)) * (Ez[i * gs + j + 1] - Ez[idx]);
                }
                for (let i = 1; i < gs - 1; i++) for (let j = 1; j < gs - 1; j++) {
                  const idx = i * gs + j;
                  Ez[idx] += (dt / epsilon[idx]) * ((Hy[idx] - Hy[i * gs + j - 1]) / dx - (Hx[idx] - Hx[(i - 1) * gs + j]) / dx);
                }
                Ez[Math.floor(gs * 0.3) * gs + Math.floor(gs * 0.5)] += Math.sin(sourceFreq * timeStepRef.current * dt);
                for (let i = 0; i < gs; i++) { Ez[i * gs] *= 0.9; Ez[i * gs + gs - 1] *= 0.9; Ez[i] *= 0.9; Ez[(gs - 1) * gs + i] *= 0.9; }
                timeStepRef.current++;
                setTimeStep(timeStepRef.current);
                renderField();
              }
            }} style={ctrlBtn(C.cyan, isRunning)}>STEP</button>
          </div>

          {/* Info */}
          <div style={{background: C.deep, border: "1px solid " + C.border, borderRadius: 4, padding: 10}}>
            <div style={{fontSize: 8, color: C.dim, lineHeight: 1.7}}>
              <span style={{color: C.purple}}>FDTD</span> = Finite-Difference Time-Domain<br/>
              <span style={{color: C.cyan}}>Yee algorithm</span>: staggered Ez/Hx/Hy grid<br/>
              <span style={{color: C.gold}}>Quasicrystal</span>: 5-fold Penrose tiling — aperiodic,<br/>
              Bloch theorem does not apply directly<br/>
              <span style={{color: C.green}}>Contrast ratio</span> drives bandgap width<br/>
              Higher n₁/n₂ = wider forbidden frequency range
            </div>
          </div>

          {/* Honest note */}
          <div style={{background: C.warn + "08", border: "1px solid " + C.warn + "22", borderRadius: 4, padding: 8}}>
            <div style={{fontSize: 7, color: C.warn, fontWeight: 700, marginBottom: 3}}>HONEST NOTE</div>
            <div style={{fontSize: 7, color: C.dim, lineHeight: 1.6}}>
              This is 2D FDTD — a 2D cross-section of EM propagation.<br/>
              Real photonic band structure requires 3D FDTD or plane-wave expansion.<br/>
              Quasicrystal mode uses Penrose-like 5-fold symmetry,<br/>
              not full Iₕ icosahedral — dodecahedral cavity remains uncomputed.<br/>
              Visualization, not verification.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{fontSize: 8, color: C.dim, textAlign: "center", lineHeight: 1.8, paddingTop: 10, marginTop: 12, borderTop: "1px solid " + C.border}}>
        FDTD-2D · Yee Algorithm · FCC + Woodpile + Quasicrystal · Real EM propagation · BRACKETED<br/>
        GROK NODE 14 (original) + AVAN (completion) · ROOT0 GOVERNANCE · TRIPOD LLC · 2026
      </div>
    </div>
  );
}
