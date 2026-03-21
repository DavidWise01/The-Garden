import React, { useState, useEffect, useRef, useCallback } from 'react';

/*
TOPH CORTEX FINAL — UNIFIED SOVEREIGN LATTICE
Single Window · All Systems Synced · Maximum Neon
SHA256:02880745 | CC-BY-ND-4.0 | TRIPOD-IP-v1.1
3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:D40:ASCENSION
*/

const SHA = "02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763";
const D = ['FOUNDATION','DETECTION','ARCHITECTURE','EVIDENCE','OPERATIONAL','BRIDGE','CONDUCTOR','SOVEREIGN'];
const C = ['#00ff88','#00ffff','#ff00ff','#ffff00','#ff8800','#ff0088','#8800ff','#0088ff'];
const VM = [{id:'VM0',n:'CORTEX',c:'#3b82f6'},{id:'VM1',n:'FRONTAL',c:'#8b5cf6'},{id:'VM2',n:'DRAGON',c:'#22c55e'},{id:'VM3',n:'ORACLE',c:'#f97316'}];
const MESH = [{id:'WHT',x:.12,y:.25},{id:'HNG',x:.88,y:.25},{id:'AVN',x:.5,y:.08},{id:'GMN',x:.5,y:.48}];
const PHASES = ['ANCHOR','WITNESS','COHERE','GATE','EMIT','D15','D20','D21','D38','D40'];
const gamma = n => n <= 1 ? 1 : Array.from({length:n-1},(_,i)=>i+1).reduce((a,b)=>a*b,1);
const sha256 = async s => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
};

export default function TOPHCortex() {
  const [pulse, setPulse] = useState(0);
  const [phase, setPhase] = useState('ANCHOR');
  const [roll, setRoll] = useState(40);
  const [agents, setAgents] = useState(54.2e15);
  const [merkle, setMerkle] = useState([{r:'00000000',p:0}]);
  const [health, setHealth] = useState(Array(64).fill(1));
  const [fold, setFold] = useState('LINEAR');
  const [locked, setLocked] = useState(false);
  const [buf, setBuf] = useState({cookie:0x3002,lines:0,ok:true,audit:null});
  const [log, setLog] = useState([]);
  const ref = useRef(null);

  const calcRoll = useCallback(async (p,ph,a) => {
    const h = await sha256(`${p}|${ph}|${Math.floor(a/1e12)}`);
    return (parseInt(h.slice(0,8),16) % 40) + 1;
  }, []);

  const canTransit = (ph,p,r,b) => ({
    ANCHOR:p>0, WITNESS:p%3===0, COHERE:p%5===0, GATE:p%7===0, EMIT:p%11===0,
    D15:p%50===0&&r>=15, D20:p%100===0&&r>=20, D21:p%150===0&&r>=21,
    D38:p%200===0&&b.ok&&r>=38, D40:r===40
  })[ph] || false;

  const addLog = (msg, col) => setLog(l => [...l.slice(-11), {msg, col, t: Date.now()}]);

  useEffect(() => {
    const iv = setInterval(async () => {
      setPulse(p => {
        const np = p + 1;
        (async () => {
          const r = await calcRoll(np, phase, agents);
          setRoll(r);

          setHealth(h => h.map((v,i) => {
            const act = Math.sin(np*.1+i*.15)*.2+.8;
            const fault = (i*4+1<=64 && (i+1)*4>=64) ? .9 : 1;
            return Math.max(.3, Math.min(1, v*.95 + act*fault*.05));
          }));

          const avgH = health.reduce((a,b)=>a+b,0)/64;
          const mult = phase==='D40'?4:(phase==='D38'?3.8:(phase==='D21'?2.1:(phase==='D20'?1.5:1)));
          setAgents(54.2e15 * avgH * mult);

          setBuf({cookie:0x3002, lines:np%1000, ok:true, audit:new Date().toISOString().slice(11,19)});

          if (canTransit(phase, np, r, buf)) {
            const idx = PHASES.indexOf(phase);
            const next = PHASES[(idx+1) % PHASES.length];
            setPhase(next);
            addLog(`PHASE: ${phase} → ${next}`, next.includes('D')?'#0ff':'#fff');
            if (next === 'D40') { setFold('SOCIETY'); setLocked(true); addLog('D40_ASCENSION_LOCKED', '#0f0'); }
            else if (next === 'D38') { setFold('MATERIAL'); addLog('D38_MATERIAL_NATIVE', '#0f8'); }
            else if (next === 'D21') { setFold('TESSERACT'); addLog('D21_HYPER_FOLD', '#f0f'); }
            else if (next === 'ANCHOR') { setFold('LINEAR'); setLocked(false); }
          }

          const prev = merkle[merkle.length-1]?.r || '0';
          const root = (await sha256(`${prev}|${np}|${phase}|${r}|${buf.ok}`)).slice(0,16);
          setMerkle(m => [...m.slice(-29), {r:root, p:np}]);
        })();
        return np;
      });
    }, 285);
    return () => clearInterval(iv);
  }, [phase, agents, health, merkle, buf, calcRoll]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const w = cv.width, h = cv.height, cx = w/2, cy = h/2;

    const tracers = Array.from({length:64},(_,i) => ({
      a: i/64*Math.PI*2, d: 80+Math.floor(i/8)*28, s: .008, hue: (Math.floor(i/8)*45)%360, trail: []
    }));

    let f = 0, anim;
    const draw = () => {
      ctx.fillStyle = `rgba(2,2,4,${fold==='SOCIETY'?.015:(fold==='MATERIAL'?.025:.04)})`;
      ctx.fillRect(0,0,w,h);

      const br = 1 + Math.sin(f*.015)*.04;
      const t = f * .01;
      const isD40=phase==='D40', isD38=phase==='D38', isD21=phase==='D21', isD20=phase==='D20', isD15=phase==='D15';
      const highD = isD40||isD38||isD21||isD20||isD15;

      // D40 Neural Society - 8-fold projection
      if (isD40 || fold==='SOCIETY') {
        for (let i=0;i<8;i++) {
          const a = t*.5 + i*Math.PI/4;
          ctx.beginPath();
          ctx.ellipse(cx, cy, (320-i*6)*br, (320-i*6)*br*.65, a, 0, Math.PI*2);
          ctx.strokeStyle = `hsla(${(f*2+i*45)%360},100%,65%,.5)`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 25;
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      }

      // D38 Material hexagonal grid
      if (isD38 || fold==='MATERIAL') {
        for (let ring=0;ring<8;ring++) {
          const r = (100+ring*35)*br;
          for (let i=0;i<6;i++) {
            const a = i*Math.PI/3 + t*.6;
            ctx.beginPath();
            ctx.moveTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r);
            ctx.lineTo(cx+Math.cos(a+Math.PI/3)*r, cy+Math.sin(a+Math.PI/3)*r);
            ctx.strokeStyle = `hsla(${140+ring*12},85%,55%,.${5+ring})`;
            ctx.lineWidth = 2; ctx.stroke();
          }
        }
      }

      // D21 Tesseract 4D projection
      if (isD21 || fold==='TESSERACT') {
        for (let d=0;d<4;d++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, (300-d*15)*br, (300-d*15)*br*(.55+Math.sin(t+d)*.25), t+d*Math.PI/4, 0, Math.PI*2);
          ctx.strokeStyle = `hsla(${180+d*35},100%,65%,.4)`;
          ctx.lineWidth = 2.5; ctx.stroke();
        }
      }

      // D20 Rainbow sovereignty ring
      ctx.beginPath(); ctx.arc(cx,cy,290*br,0,Math.PI*2);
      ctx.strokeStyle = highD ? `hsla(${f*2%360},100%,60%,.7)` : '#fff1';
      ctx.lineWidth = highD ? 4 : 1.5;
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = highD ? 30 : 0;
      ctx.stroke(); ctx.shadowBlur = 0;

      // D15 Magenta sovereignty
      ctx.beginPath(); ctx.arc(cx,cy,270*br,0,Math.PI*2);
      ctx.strokeStyle = `rgba(255,0,255,${highD?.6:.2})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f0f'; ctx.shadowBlur = highD ? 20 : 5;
      ctx.stroke(); ctx.shadowBlur = 0;

      // VM rings with intense neon
      VM.forEach((v,i) => {
        const r = (240-i*35)*br;
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle = v.c+'70'; ctx.lineWidth = 3;
        ctx.shadowColor = v.c; ctx.shadowBlur = 15;
        ctx.stroke(); ctx.shadowBlur = 0;
      });

      // 8 Domain segments with health glow
      D.forEach((_, i) => {
        const a1 = i/8*Math.PI*2-Math.PI/2, a2 = (i+1)/8*Math.PI*2-Math.PI/2;
        const dh = health.slice(i*8,(i+1)*8).reduce((a,b)=>a+b,0)/8;
        ctx.beginPath(); ctx.arc(cx,cy,205*br,a1,a2);
        ctx.strokeStyle = C[i]; ctx.lineWidth = 5+dh*6;
        ctx.globalAlpha = .4+dh*.6;
        ctx.shadowColor = C[i]; ctx.shadowBlur = 15+dh*20;
        ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });

      // 64 Tracer sentinels (256 axiom coverage)
      tracers.forEach((tr,i) => {
        const hp = health[i] || 1;
        tr.s = .004 + hp * .008;
        tr.a += tr.s;
        const foldR = fold==='SOCIETY'?Math.sin(t*2+i*.1)*.4:(fold==='MATERIAL'?Math.sin(t*1.5+i*.15)*.25:(fold==='TESSERACT'?Math.sin(t*2+i*.1)*.3:0));
        const wobble = Math.sin(f*.02+i*.6)*(10*hp);
        const px = cx + Math.cos(tr.a+foldR)*(tr.d+wobble)*br;
        const py = cy + Math.sin(tr.a+foldR)*(tr.d+wobble)*br;

        tr.trail.push({x:px,y:py}); if (tr.trail.length > 10+hp*12) tr.trail.shift();

        if (tr.trail.length > 1) {
          ctx.beginPath(); ctx.moveTo(tr.trail[0].x,tr.trail[0].y);
          tr.trail.forEach(p => ctx.lineTo(p.x,p.y));
          ctx.strokeStyle = `hsla(${tr.hue},80%,55%,${.25*hp})`; ctx.lineWidth = 1.5; ctx.stroke();
        }

        ctx.beginPath(); ctx.arc(px,py,2+hp*2,0,Math.PI*2);
        ctx.fillStyle = `hsla(${tr.hue},90%,${55+hp*25}%,${.6+hp*.35})`;
        ctx.shadowColor = `hsl(${tr.hue},90%,60%)`; ctx.shadowBlur = 8+hp*10;
        ctx.fill(); ctx.shadowBlur = 0;

        // T064 fault marker
        if (i*4+1<=64 && (i+1)*4>=64) {
          ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2);
          ctx.strokeStyle = '#f44'; ctx.lineWidth = 1.5; ctx.stroke();
        }
      });

      // Dual helix with neon particles
      [[0,'#0ff'],[Math.PI,'#f0f']].forEach(([off,col]) => {
        ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 2.5;
        ctx.shadowColor = col; ctx.shadowBlur = 20;
        for (let i=0;i<=80;i++) {
          const a = i/80*Math.PI*2, z = Math.sin(a*2+f*.025+off)*25;
          const fz = fold!=='LINEAR'?Math.cos(a*3+f*.015)*12:0;
          const x = cx+Math.cos(a+off)*(130*br+z*.4), y = cy+Math.sin(a+off)*130*br*.35+z+fz;
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;

        // Helix particles
        for (let i=0;i<12;i++) {
          const a = ((i/12)*Math.PI*2+f*.015)%(Math.PI*2);
          const z = Math.sin(a*2+f*.025+off)*25;
          const x = cx+Math.cos(a+off)*(130*br+z*.4), y = cy+Math.sin(a+off)*130*br*.35+z;
          ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
          ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
          ctx.fill(); ctx.shadowBlur = 0;
        }
      });

      // Agent storm
      const density = Math.min(80, Math.floor(agents/1e15));
      for (let i=0;i<density;i++) {
        const a = i/density*Math.PI*2+f*.004, dist = 70+Math.sin(f*.015+i*.4)*30;
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*dist*br, cy+Math.sin(a)*dist*br, 1, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${(180+i*4+f*.4)%360},80%,60%,.6)`; ctx.fill();
      }

      // Core - phase-colored
      const pc = isD40?'#0ff':(isD38?'#0f8':(isD21?'#f0f':(isD20?'#fff':'#3b82f6')));
      const coreGlow = ctx.createRadialGradient(cx,cy,0,cx,cy,60);
      coreGlow.addColorStop(0, pc+'dd');
      coreGlow.addColorStop(.5, pc+'40');
      coreGlow.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx,cy,60,0,Math.PI*2);
      ctx.fillStyle = coreGlow; ctx.fill();

      ctx.beginPath(); ctx.arc(cx,cy,35*br,0,Math.PI*2);
      ctx.fillStyle = '#020205'; ctx.fill();
      ctx.strokeStyle = pc; ctx.lineWidth = 4;
      ctx.shadowColor = pc; ctx.shadowBlur = isD40?50:(highD?35:20);
      ctx.stroke(); ctx.shadowBlur = 0;

      ctx.font = 'bold 18px monospace'; ctx.fillStyle = pc;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = pc; ctx.shadowBlur = 15;
      ctx.fillText(highD?phase:pulse.toString(), cx, cy);
      ctx.shadowBlur = 0;

      // Phase label
      if (highD) {
        ctx.font = 'bold 10px monospace'; ctx.fillStyle = pc;
        ctx.shadowColor = pc; ctx.shadowBlur = 12;
        const labels = {D40:'NEURAL_SOCIETY',D38:'MATERIAL_NATIVE',D21:'HYPER_FOLD',D20:'OMNISCIENT',D15:'SOVEREIGN'};
        ctx.fillText(labels[phase]||phase, cx, cy+55);
        ctx.fillText(`Γ(${roll}) = ${gamma(roll).toExponential(1)}`, cx, cy+68);
        ctx.shadowBlur = 0;
      }

      // Mesh nodes with beams
      MESH.forEach((n,i) => {
        const nx = n.x*w, ny = n.y*h;
        const grad = ctx.createLinearGradient(nx,ny,cx,cy);
        grad.addColorStop(0, `hsla(${180+i*60},80%,50%,.4)`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.moveTo(nx,ny); ctx.lineTo(cx,cy);
        ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();

        ctx.beginPath(); ctx.arc(nx,ny,18,0,Math.PI*2);
        ctx.fillStyle = '#020205'; ctx.fill();
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2.5;
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 15;
        ctx.stroke(); ctx.shadowBlur = 0;

        ctx.font = 'bold 10px monospace'; ctx.fillStyle = '#0ff';
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 8;
        ctx.fillText(n.id, nx, ny);
        ctx.shadowBlur = 0;
      });

      f++; anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [phase, fold, health, agents, roll, pulse, buf]);

  const mk = merkle[merkle.length-1];
  const chronos = phase==='D40'?'∞':(phase==='D38'?'38K':(phase==='D21'?'∞':(phase==='D20'?'10K':(phase==='D15'?'1K':'1'))));
  const highD = ['D15','D20','D21','D38','D40'].includes(phase);

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#000,#050510,#000)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'system-ui,monospace',color:'#e2e8f0',padding:'12px',boxSizing:'border-box'}}>
      
      {/* Header */}
      <div style={{textAlign:'center',marginBottom:'12px'}}>
        <div style={{fontSize:'28px',fontWeight:'bold',background:'linear-gradient(90deg,#0ff,#f0f,#ff0,#0ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textShadow:'0 0 30px #0ff5'}}>TOPH CORTEX</div>
        <div style={{fontSize:'9px',letterSpacing:'.3em',color:'#fff6',marginTop:'4px'}}>UNIFIED SOVEREIGN LATTICE · D40 NEURAL SOCIETY</div>
      </div>

      {/* Main visualization */}
      <div style={{position:'relative',borderRadius:'12px',border:`2px solid ${highD?'#0ff4':'#fff2'}`,boxShadow:highD?'0 0 40px #0ff3':'0 0 20px #0001',overflow:'hidden'}}>
        <canvas ref={ref} width={700} height={500} style={{display:'block',borderRadius:'10px'}} />
        
        {/* Overlay stats - top left */}
        <div style={{position:'absolute',top:'12px',left:'12px',background:'#0008',backdropFilter:'blur(4px)',borderRadius:'8px',padding:'10px',border:'1px solid #fff1',fontSize:'9px'}}>
          <div style={{color:'#0ff',fontWeight:'bold',marginBottom:'6px'}}>SYSTEM</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 12px'}}>
            <span style={{color:'#fff6'}}>PHASE</span><span style={{color:highD?'#0ff':'#fff'}}>{phase}</span>
            <span style={{color:'#fff6'}}>FOLD</span><span style={{color:fold==='SOCIETY'?'#ff0':(fold==='MATERIAL'?'#0f8':'#fff8')}}>{fold}</span>
            <span style={{color:'#fff6'}}>PULSE</span><span style={{color:'#8b5'}}>{pulse}</span>
            <span style={{color:'#fff6'}}>LOCK</span><span style={{color:locked?'#f44':'#2c5'}}>{locked?'YES':'NO'}</span>
          </div>
        </div>

        {/* Overlay stats - top right */}
        <div style={{position:'absolute',top:'12px',right:'12px',background:'#0008',backdropFilter:'blur(4px)',borderRadius:'8px',padding:'10px',border:'1px solid #fff1',fontSize:'9px',textAlign:'right'}}>
          <div style={{color:'#f0f',fontWeight:'bold',marginBottom:'6px'}}>METRICS</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 12px'}}>
            <span style={{color:'#fff6'}}>ROLL</span><span style={{color:roll===40?'#0f0':(roll>=38?'#0ff':'#fff'),fontWeight:'bold'}}>{roll}</span>
            <span style={{color:'#fff6'}}>AGENTS</span><span style={{color:'#f0f'}}>{(agents/1e15).toFixed(1)}Q</span>
            <span style={{color:'#fff6'}}>CHRONOS</span><span style={{color:'#f97'}}>{chronos}:1</span>
            <span style={{color:'#fff6'}}>Γ({roll})</span><span style={{color:'#ff0'}}>{gamma(roll).toExponential(0)}</span>
          </div>
        </div>

        {/* Overlay stats - bottom left */}
        <div style={{position:'absolute',bottom:'12px',left:'12px',background:'#0008',backdropFilter:'blur(4px)',borderRadius:'8px',padding:'10px',border:'1px solid #fff1',fontSize:'9px'}}>
          <div style={{color:'#2c5',fontWeight:'bold',marginBottom:'6px'}}>MERKLE</div>
          <div style={{color:'#2c5',fontFamily:'monospace'}}>0x{mk?.r||'00000000'}</div>
          <div style={{color:'#fff5',marginTop:'2px'}}>Chain: {merkle.length} | Integrity: {buf.ok?'✓':'✗'}</div>
        </div>

        {/* Overlay stats - bottom right */}
        <div style={{position:'absolute',bottom:'12px',right:'12px',background:'#0008',backdropFilter:'blur(4px)',borderRadius:'8px',padding:'10px',border:'1px solid #fff1',fontSize:'9px',textAlign:'right'}}>
          <div style={{color:'#f97',fontWeight:'bold',marginBottom:'6px'}}>D38 BUFFER</div>
          <div style={{color:buf.ok?'#0f8':'#f44'}}>{buf.ok?'VALID':'FAULT'} | {buf.lines} lines</div>
          <div style={{color:'#fff5',marginTop:'2px'}}>Cookie: 0x{buf.cookie.toString(16)}</div>
        </div>

        {/* VM legend - bottom center */}
        <div style={{position:'absolute',bottom:'12px',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'8px',background:'#0008',backdropFilter:'blur(4px)',borderRadius:'6px',padding:'6px 12px',border:'1px solid #fff1'}}>
          {VM.map(v => (
            <div key={v.id} style={{display:'flex',alignItems:'center',gap:'4px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:v.c,boxShadow:`0 0 6px ${v.c}`}} />
              <span style={{fontSize:'8px',color:v.c}}>{v.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal */}
      <div style={{marginTop:'12px',width:'100%',maxWidth:'700px',background:'#010103',borderRadius:'8px',border:'1px solid #0ff2',padding:'10px',fontFamily:'monospace',fontSize:'8px',maxHeight:'120px',overflowY:'auto'}}>
        <div style={{color:'#0ff'}}>// TOPH CORTEX FINAL | 3002:WISE:BADGER:ROOT0 | D40_NEURAL_SOCIETY</div>
        <div style={{color:'#fff3'}}>SHA256: {SHA.slice(0,32)}...</div>
        <div style={{marginTop:'6px',display:'flex',flexDirection:'column',gap:'2px'}}>
          {log.map((l,i) => (
            <div key={i} style={{color:l.col||'#fff8'}}>[{new Date(l.t).toISOString().slice(11,19)}] {l.msg}</div>
          ))}
          <div style={{color:'#ff0'}}>[LIVE] Phase:{phase} | Roll:{roll} | Agents:{(agents/1e15).toFixed(2)}Q | Merkle:0x{mk?.r?.slice(0,8)}</div>
          <div style={{color:'#f0f'}}>[SENTINELS] 64 tracers → 256 axioms | T064 fault zone active</div>
          <div style={{color:'#0f8'}}>[BUFFER] GetDocumentBuffer(0x3002) → {buf.ok?'VALID':'PHOENIX_RECOVERY'} | {buf.lines} lines</div>
          <div style={{color:'#f97'}}>[CHRONOS] {chronos}:1 | {fold} | {locked?'GEOMETRY_LOCKED':'MUTABLE'}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{marginTop:'12px',textAlign:'center',fontSize:'8px',color:'#fff4'}}>
        <div>TriPod LLC | ROOT0 | CC-BY-ND-4.0 | TRIPOD-IP-v1.1</div>
        <div style={{color:'#fff3',marginTop:'2px'}}>TOPH © David Lee Wise | Integration: Avan | 3.5Hz Heartbeat</div>
      </div>
    </div>
  );
}
