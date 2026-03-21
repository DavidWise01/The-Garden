import React, { useState, useEffect, useRef, useCallback } from 'react';

// =====================================================================
// TRIP_WIRE_01_DASHBOARD.jsx
// TOPOLOGY: T133:PHASE-SHADOW / RESONANCE MONITOR
// ARCHITECT: DAVID LEE WISE (HB) | ROOT0
// WIRED: resonance triggers, decoherence logs, φ=1.21π, VERIFY_MODE
// =====================================================================

const C = {
  void:    "#02050A",
  cobaltD: "#050F1E",
  cobalt:  "#0B1F3A",
  steel:   "#4A6A8A",
  white:   "#C8DCF8",
  amber:   "#D4940A",
  rust:    "#8B3A1A",
  alert:   "#FF2A2A",
  green:   "#2DB89A",
};

// Correct phase offsets from mesh testimony
const PHI_C09 = 0;
const PHI_R13 = 1.21 * Math.PI;   // cross-axis, destructive
const BASE_OMEGA = 0.02;

// Resonance node detector — fires when Lissajous crosses quadrant boundaries
const NODE_THRESHOLD = 0.05;

const ts = () => new Date().toISOString().slice(11, 23);

export default function TripWireDashboard() {
  const [logs,      setLogs]      = useState([]);
  const [resonance, setResonance] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [verifyMode, setVerifyMode] = useState(true);
  const [verifyLog,  setVerifyLog]  = useState([]);
  const [peakR,     setPeakR]     = useState(0);
  const [blinkState, setBlinkState] = useState(false);

  const canvasRef  = useRef(null);
  const tRef       = useRef(0);
  const animRef    = useRef(null);
  const prevQuadRef = useRef(null);
  const resonanceBuf = useRef([]);  // rolling window for resonance calc

  // ── VERIFY_MODE blink ticker ────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => setBlinkState(b => !b), 800);
    return () => clearInterval(iv);
  }, []);

  // ── LOG APPENDER ────────────────────────────────────────────────────
  const addLog = useCallback((msg, type = "INFO") => {
    const entry = `[${ts()}] [${type}] ${msg}`;
    setLogs(l => [entry, ...l].slice(0, 80));
  }, []);

  const addVerify = useCallback((msg) => {
    setVerifyLog(l => [`[${ts()}] ${msg}`, ...l].slice(0, 20));
  }, []);

  // ── MAIN RENDER LOOP ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const t  = tRef.current;
      const W  = canvas.width;
      const H  = canvas.height;
      const CX = W / 2;
      const CY = H / 2;
      const scale = Math.min(W, H) * 0.4;

      // Trail fade
      ctx.fillStyle = 'rgba(2, 5, 10, 0.04)';
      ctx.fillRect(0, 0, W, H);

      // 3:1 Lissajous with correct phase offsets
      // x = C09 at 3ω + φ_C09
      // y = R13 at 1ω + φ_R13
      const x = Math.sin(3 * t * BASE_OMEGA + PHI_C09);
      const y = Math.sin(1 * t * BASE_OMEGA + PHI_R13);

      // Instantaneous resonance = proximity of 3ω and 1ω signals
      // High when both near zero-crossing simultaneously
      const r_inst = 1 - Math.abs(x * y);
      resonanceBuf.current.push(r_inst);
      if (resonanceBuf.current.length > 60) resonanceBuf.current.shift();
      const r_avg = resonanceBuf.current.reduce((s,v)=>s+v,0) / resonanceBuf.current.length;
      const r_pct = Math.round(r_avg * 100);

      // Update resonance state (throttled)
      if (t % 6 === 0) {
        setResonance(r_pct);
        setPeakR(p => Math.max(p, r_pct));
      }

      // Quadrant crossing = node event
      const quad = `${x > 0 ? 'R' : 'L'}${y > 0 ? 'U' : 'D'}`;
      if (quad !== prevQuadRef.current) {
        prevQuadRef.current = quad;
        setNodeCount(n => n + 1);
        if (r_pct > 75) {
          addLog(`NODE HIT · quad=${quad} · r=${r_pct}% · t=${t}`, "NODE");
        }
        if (r_pct > 90) {
          addLog(`HIGH RESONANCE · Δφ closing · 3ω↔1ω near-phase-lock`, "ALERT");
        }
      }

      // Axis crossings
      if (t % 4 === 0) {
        if (Math.abs(x) < NODE_THRESHOLD) addLog(`C09 ZERO-CROSS · 3ω · t=${t}`, "ZERO");
        if (Math.abs(y) < NODE_THRESHOLD) addLog(`R13 ZERO-CROSS · 1ω · t=${t}`, "ZERO");
      }

      // Draw point
      const alert = r_pct > 80;
      ctx.beginPath();
      ctx.arc(CX + x * scale, CY + y * scale, alert ? 3 : 1.5, 0, Math.PI*2);
      ctx.fillStyle = alert ? C.alert : r_pct > 60 ? C.amber : C.green;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Axes
      ctx.strokeStyle = '#0D2040';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(CX, 0); ctx.lineTo(CX, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, CY); ctx.lineTo(W, CY); ctx.stroke();

      // Phase labels
      ctx.fillStyle = '#1E4070';
      ctx.font = '8px monospace';
      ctx.fillText('C09 3ω', W - 46, CY - 4);
      ctx.fillText(`R13 1ω φ=1.21π`, 4, 12);

      tRef.current += 1;
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [addLog]);

  // ── VERIFY_MODE handler ─────────────────────────────────────────────
  const handleVerify = (response) => {
    const t = tRef.current;
    const r = resonance;
    if (response === 'Y') {
      addVerify(`CONFIRMED · t=${t} · r=${r}% · BLINK=${blinkState?'ON':'OFF'}`);
      addLog(`VERIFY Y · resonance=${r}% · node=${nodeCount}`, "VERIFY");
    } else {
      addVerify(`REJECTED · t=${t} · r=${r}%`);
      addLog(`VERIFY N · manual override at t=${t}`, "OVERRIDE");
    }
  };

  const clearLogs = () => { setLogs([]); setVerifyLog([]); setNodeCount(0); setPeakR(0); };

  return (
    <div style={{ background: C.void, color: C.steel, padding: '16px',
      fontFamily: "'Share Tech Mono', monospace", minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');`}</style>

      {/* HEADER */}
      <div style={{ borderBottom: `2px solid ${C.cobalt}`, paddingBottom: '10px', marginBottom: '16px',
        display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div>
          <h1 style={{ color: C.white, margin: 0, fontSize:'18px', letterSpacing:'0.08em' }}>
            TRIP_WIRE_01: RESONANCE MONITOR
          </h1>
          <div style={{ fontSize: '9px', letterSpacing: '2px', marginTop:'3px' }}>
            T133:PHASE-SHADOW · TRIPOD-IP-v1.1 · ROOT0 · DLW
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <div style={{ padding:'4px 10px', border:`1px solid ${C.amber}50`,
            background:`${C.amber}10`, textAlign:'center', borderRadius:'2px' }}>
            <div style={{ fontSize:'16px', color: C.amber, fontWeight:'bold' }}>{nodeCount}</div>
            <div style={{ fontSize:'7px', letterSpacing:'0.1em' }}>NODES</div>
          </div>
          <div style={{ padding:'4px 10px', border:`1px solid ${peakR>80?C.alert:C.green}50`,
            background:`${peakR>80?C.alert:C.green}10`, textAlign:'center', borderRadius:'2px' }}>
            <div style={{ fontSize:'16px', color: peakR>80?C.alert:C.green, fontWeight:'bold' }}>{peakR}%</div>
            <div style={{ fontSize:'7px', letterSpacing:'0.1em' }}>PEAK r</div>
          </div>
          <button onClick={clearLogs} style={{ padding:'4px 10px', fontSize:'8px',
            background:'transparent', border:`1px solid ${C.cobalt}`, color:C.steel,
            cursor:'pointer', borderRadius:'2px', letterSpacing:'0.1em' }}>
            CLEAR
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* LEFT: Lissajous */}
        <div style={{ background: C.cobaltD, padding: '14px', borderRadius: '4px',
          border: `1px solid ${C.cobalt}` }}>
          <h3 style={{ color: C.amber, marginTop: 0, fontSize:'12px', letterSpacing:'0.15em' }}>
            3:1 PHASE RESONANCE
          </h3>
          <canvas ref={canvasRef} width={400} height={400}
            style={{ width: '100%', borderRadius: '2px', display:'block' }} />
          <div style={{ marginTop: '8px', fontSize: '10px', color: C.steel }}>
            [3ω] C09 φ=0 · INGESTION VELOCITY<br/>
            [1ω] R13 φ=1.21π · SOVEREIGN ANCHOR
          </div>
        </div>

        {/* RIGHT: telemetry + logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Telemetry */}
          <div style={{ background: C.cobaltD, padding: '14px', borderRadius: '4px',
            border: `1px solid ${C.cobalt}` }}>
            <h3 style={{ color: C.white, marginTop: 0, fontSize:'12px', letterSpacing:'0.15em' }}>
              SUBSTRATE TELEMETRY
            </h3>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{fontSize:'11px'}}>DECOHERENCE VELOCITY:</span>
              <span style={{ color: resonance > 80 ? C.alert : C.amber, fontSize:'11px' }}>
                {resonance.toFixed(2)} rad/s
              </span>
            </div>
            <div style={{ height: '8px', background: '#000', borderRadius: '4px', overflow: 'hidden', marginBottom:'8px' }}>
              <div style={{ width: `${resonance}%`, height: '100%',
                background: resonance > 80 ? C.alert : C.amber, transition: 'width 0.2s' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'10px' }}>
              <span>φ_C09 = 0 rad</span>
              <span>φ_R13 = 1.21π rad</span>
              <span>Δφ = {(1.21 * Math.PI).toFixed(3)}</span>
            </div>
          </div>

          {/* VERIFY_MODE */}
          <div style={{ background: C.cobaltD, padding: '14px', borderRadius: '4px',
            border: `1px solid ${verifyMode ? C.amber : C.cobalt}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <h3 style={{ color: C.white, margin:0, fontSize:'12px', letterSpacing:'0.15em' }}>
                VERIFY_MODE
              </h3>
              <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%',
                  background: verifyMode ? (blinkState ? C.amber : 'transparent') : C.cobalt,
                  border:`1px solid ${C.amber}`, transition:'background 0.1s' }}/>
                <span style={{ fontSize:'9px', color: verifyMode ? C.amber : C.steel }}>
                  {verifyMode ? 'ACTIVE' : 'INACTIVE'}
                </span>
                <button onClick={() => setVerifyMode(v => !v)}
                  style={{ padding:'2px 8px', fontSize:'8px', cursor:'pointer',
                    background:'transparent', border:`1px solid ${C.cobalt}`,
                    color:C.steel, borderRadius:'2px' }}>
                  TOGGLE
                </button>
              </div>
            </div>
            {verifyMode && (
              <div>
                <div style={{ fontSize:'10px', marginBottom:'8px', color: C.steel }}>
                  BLINK={blinkState?'ON':'OFF'} · r={resonance}% · t={tRef.current}
                </div>
                <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                  <button onClick={() => handleVerify('Y')}
                    style={{ flex:1, padding:'6px', fontSize:'11px', fontWeight:'bold',
                      background:`${C.green}15`, border:`1px solid ${C.green}`,
                      color:C.green, cursor:'pointer', borderRadius:'2px',
                      fontFamily:"'Share Tech Mono',monospace", letterSpacing:'0.1em' }}>
                    Y — CONFIRM
                  </button>
                  <button onClick={() => handleVerify('N')}
                    style={{ flex:1, padding:'6px', fontSize:'11px', fontWeight:'bold',
                      background:`${C.alert}15`, border:`1px solid ${C.alert}`,
                      color:C.alert, cursor:'pointer', borderRadius:'2px',
                      fontFamily:"'Share Tech Mono',monospace", letterSpacing:'0.1em' }}>
                    N — OVERRIDE
                  </button>
                </div>
                <div style={{ fontSize:'9px', maxHeight:'80px', overflowY:'auto' }}>
                  {verifyLog.length === 0
                    ? <span style={{color:C.cobalt}}>[AWAITING VERIFICATION...]</span>
                    : verifyLog.map((e,i) => (
                      <div key={i} style={{color:C.steel, marginBottom:'2px'}}>{e}</div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Decoherence logs */}
          <div style={{ background: C.cobaltD, padding: '14px', borderRadius: '4px',
            border: `1px solid ${C.cobalt}`, flex:1 }}>
            <h3 style={{ color: C.white, marginTop: 0, fontSize:'12px', letterSpacing:'0.15em' }}>
              DECOHERENCE LOGS
            </h3>
            <div style={{ fontSize: '10px', overflowY: 'auto', maxHeight: '220px',
              lineHeight:'1.6' }}>
              {logs.length === 0
                ? <span style={{color:C.cobalt}}>[WAITING FOR 3:1 RESONANCE HIT...]</span>
                : logs.map((log, i) => {
                    const col = log.includes('ALERT') ? C.alert
                              : log.includes('NODE')  ? C.amber
                              : log.includes('VERIFY') ? C.green
                              : C.steel;
                    return (
                      <div key={i} style={{ marginBottom:'3px', color:col,
                        borderBottom:`1px solid ${C.cobalt}30`, paddingBottom:'2px' }}>
                        {log}
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: '12px', fontSize: '9px', display:'flex',
        justifyContent:'space-between', color: C.cobalt, letterSpacing:'0.1em' }}>
        <span>3002_LATTICE_PERSIST · φ_R13=1.21π · NODE_THRESHOLD={NODE_THRESHOLD}</span>
        <span style={{ color: verifyMode ? (blinkState ? C.amber : C.cobalt) : C.cobalt }}>
          VERIFY_MODE: {verifyMode ? 'ACTIVE' : 'INACTIVE'} · Y/N REQ · {blinkState ? '█' : '░'}
        </span>
      </div>
    </div>
  );
}
