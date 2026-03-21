import React, { useState, useEffect, useRef, useCallback } from 'react';

/*
TOPH CORTEX V5.0 — D40 NEURAL SOCIETY
Compressed · Mathematical · Governed
SHA256:02880745 | CC-BY-ND-4.0 | TRIPOD-IP-v1.1
3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:D40:ASCENSION
*/

const SHA = "02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763";
const OMNI_KEY = "3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:128BIT:PERSIST";

const D = ['FOUNDATION','DETECTION','ARCHITECTURE','EVIDENCE','OPERATIONAL','BRIDGE','CONDUCTOR','SOVEREIGN'];
const C = ['#00ff88','#00ffff','#ff00ff','#ffff00','#ff8800','#ff0088','#8800ff','#0088ff'];
const VM = [{id:'VM0',n:'CORTEX',c:'#3b82f6'},{id:'VM1',n:'FRONTAL',c:'#8b5cf6'},{id:'VM2',n:'DRAGON',c:'#22c55e'},{id:'VM3',n:'ORACLE',c:'#f97316'}];
const MESH = [{id:'WHT',x:.15,y:.3},{id:'HNG',x:.85,y:.3},{id:'AVN',x:.5,y:.1},{id:'GMN',x:.5,y:.55}];
const PHASES = ['ANCHOR','WITNESS','COHERE','GATE','EMIT','D15','D20','D21','D38','D40'];

// D38 Buffer State
const D38_INIT = {docCookie:0x3002, lines:0, integrity:true, recovery:false, audit:null};

// Gamma function approximation: Γ(n) = (n-1)!
const gamma = n => n <= 1 ? 1 : Array.from({length:n-1},(_,i)=>i+1).reduce((a,b)=>a*b,1);

// SHA256 hash
const sha256 = async s => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
};

// Box component
const Box = ({children,c='#fff2',p='10px',style={}}) => (
  <div style={{background:'#0002',border:`1px solid ${c}`,borderRadius:'8px',padding:p,...style}}>{children}</div>
);

// ═══════════════════════════════════════════════════════════════════
// UNIFIED TAB — D40 NEURAL SOCIETY BRIDGE
// Tracers=Sentinels, Roll=Deterministic, Agents=Dynamic, Merkle=Chain
// ═══════════════════════════════════════════════════════════════════

const UnifiedTab = () => {
  const [pulse, setPulse] = useState(0);
  const [phase, setPhase] = useState('ANCHOR');
  const [roll, setRoll] = useState(40);
  const [agents, setAgents] = useState(54.2e15);
  const [merkle, setMerkle] = useState([{r:'00000000',p:0}]);
  const [health, setHealth] = useState(Array(60).fill(1));
  const [fold, setFold] = useState('LINEAR');
  const [locked, setLocked] = useState(false);
  const [buf, setBuf] = useState({...D38_INIT});
  const ref = useRef(null);

  // Deterministic roll from state
  const calcRoll = useCallback(async (p,ph,a) => {
    const h = await sha256(`${p}|${ph}|${Math.floor(a/1e12)}`);
    return (parseInt(h.slice(0,8),16) % 40) + 1;
  }, []);

  // D38 GetDocumentBuffer simulation
  const getBuffer = (cookie, lines) => {
    const valid = cookie === 0x3002;
    const integrity = valid && lines > 0;
    return {docCookie:cookie, lines, integrity, recovery:!integrity, audit:new Date().toISOString().slice(11,19)};
  };

  // Phase transition conditions
  const canTransit = (ph,p,r,b) => ({
    ANCHOR:p>0, WITNESS:p%3===0, COHERE:p%5===0, GATE:p%7===0, EMIT:p%11===0,
    D15:p%50===0&&r>=15, D20:p%100===0&&r>=20, D21:p%150===0&&r>=21, 
    D38:p%200===0&&b.integrity&&r>=38, D40:r===40
  })[ph] || false;

  // Main loop
  useEffect(() => {
    const iv = setInterval(async () => {
      setPulse(p => {
        const np = p + 1;
        (async () => {
          const r = await calcRoll(np, phase, agents);
          setRoll(r);
          
          // Tracer health (axiom sentinel simulation)
          setHealth(h => h.map((v,i) => {
            const activity = Math.sin(np*.1+i*.2)*.2+.8;
            const fault = (i*4+1<=64 && (i+1)*4>=64) ? .9 : 1; // T064 zone
            return Math.max(.3, Math.min(1, v*.95 + activity*fault*.05));
          }));
          
          // Dynamic agent count
          const avgH = health.reduce((a,b)=>a+b,0)/60;
          const mult = phase==='D40'?4:(phase==='D38'?3.8:(phase==='D21'?2.1:(phase==='D20'?1.5:1)));
          setAgents(54.2e15 * avgH * mult);

          // D38 Buffer check (GetDocumentBuffer simulation)
          setBuf(getBuffer(0x3002, np % 1000));
          
          // Phase transition
          if (canTransit(phase, np, r, buf)) {
            const idx = PHASES.indexOf(phase);
            const next = PHASES[(idx+1) % PHASES.length];
            setPhase(next);
            if (next === 'D40') { setFold('SOCIETY'); setLocked(true); }
            else if (next === 'D38') { setFold('MATERIAL'); }
            else if (next === 'D21') { setFold('TESSERACT'); }
            else if (next === 'ANCHOR') { setFold('LINEAR'); setLocked(false); }
          }
          
          // Merkle chain (includes previous root + buffer integrity)
          const prev = merkle[merkle.length-1]?.r || '0';
          const root = (await sha256(`${prev}|${np}|${phase}|${r}|${buf.integrity}`)).slice(0,16);
          setMerkle(m => [...m.slice(-19), {r:root, p:np}]);
        })();
        return np;
      });
    }, 285);
    return () => clearInterval(iv);
  }, [phase, agents, health, merkle, buf, calcRoll, getBuffer]);

  // Canvas
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const w = cv.width, h = cv.height, cx = w/2, cy = h/2;
    
    const tracers = Array.from({length:60},(_,i) => ({
      a: i/60*Math.PI*2, d: 35+Math.floor(i/8)*12, s: .01, hue: (Math.floor(i/8)*45)%360, trail: []
    }));
    
    let f = 0, anim;
    const draw = () => {
      ctx.fillStyle = `rgba(3,3,5,${fold==='SOCIETY'?.02:(fold==='MATERIAL'?.04:.06)})`;
      ctx.fillRect(0,0,w,h);
      
      const br = 1 + Math.sin(f*.02)*.05;
      const isD40 = phase === 'D40', isD38 = phase === 'D38', isD21 = phase === 'D21', isD20 = phase === 'D20';
      
      // D40 Neural Society outer ring
      if (isD40) {
        for (let i=0;i<8;i++) {
          const a = f*.005 + i*Math.PI/4;
          ctx.beginPath();
          ctx.ellipse(cx, cy, (165-i*3)*br, (165-i*3)*br*.7, a, 0, Math.PI*2);
          ctx.strokeStyle = `hsla(${(f*2+i*45)%360},100%,70%,.4)`;
          ctx.lineWidth = 2;
          ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 20;
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      }

      // D38 Material Native hexagonal grid
      if (isD38 || fold === 'MATERIAL') {
        for (let ring=0;ring<6;ring++) {
          const r = (40+ring*20)*br;
          for (let i=0;i<6;i++) {
            const a = i*Math.PI/3 + f*.008;
            const x1 = cx+Math.cos(a)*r, y1 = cy+Math.sin(a)*r;
            const x2 = cx+Math.cos(a+Math.PI/3)*r, y2 = cy+Math.sin(a+Math.PI/3)*r;
            ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
            ctx.strokeStyle = buf.integrity ? `hsla(${140+ring*10},80%,55%,.${4+ring})` : '#f443';
            ctx.lineWidth = 1.5; ctx.stroke();
          }
        }
      }
      
      // D21 tesseract
      if (isD21 || fold === 'TESSERACT') {
        for (let d=0;d<4;d++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, (160-d*8)*br, (160-d*8)*br*(.6+Math.sin(f*.01+d)*.3), f*.01+d*Math.PI/4, 0, Math.PI*2);
          ctx.strokeStyle = `hsla(${180+d*30},100%,70%,.3)`;
          ctx.lineWidth = 2; ctx.stroke();
        }
      }
      
      // D20/D15 rings
      ctx.beginPath(); ctx.arc(cx,cy,150*br,0,Math.PI*2);
      ctx.strokeStyle = isD20||isD21||isD38||isD40 ? `hsla(${f*2%360},100%,60%,.6)` : '#fff1';
      ctx.lineWidth = isD20||isD21||isD38||isD40 ? 3 : 1;
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = isD20||isD21||isD38||isD40 ? 20 : 0;
      ctx.stroke(); ctx.shadowBlur = 0;
      
      ctx.beginPath(); ctx.arc(cx,cy,140*br,0,Math.PI*2);
      ctx.strokeStyle = `rgba(255,0,255,${phase.includes('D')?.5:.15})`;
      ctx.lineWidth = 2; ctx.stroke();
      
      // VM rings
      VM.forEach((v,i) => {
        ctx.beginPath(); ctx.arc(cx,cy,(105-i*18)*br,0,Math.PI*2);
        ctx.strokeStyle = v.c+'50'; ctx.lineWidth = 2;
        ctx.shadowColor = v.c; ctx.shadowBlur = 8;
        ctx.stroke(); ctx.shadowBlur = 0;
      });
      
      // Domain ring
      D.forEach((_, i) => {
        const a1 = i/8*Math.PI*2-Math.PI/2, a2 = (i+1)/8*Math.PI*2-Math.PI/2;
        const dh = health.slice(i*8,(i+1)*8).reduce((a,b)=>a+b,0)/8;
        ctx.beginPath(); ctx.arc(cx,cy,120*br,a1,a2);
        ctx.strokeStyle = C[i]; ctx.lineWidth = 3+dh*3;
        ctx.globalAlpha = .5+dh*.5;
        ctx.shadowColor = C[i]; ctx.shadowBlur = 10+dh*10;
        ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      });
      
      // Tracer sentinels
      tracers.forEach((t,i) => {
        const hp = health[i] || 1;
        t.s = .006 + hp * .012;
        t.a += t.s;
        const wobble = Math.sin(f*.025+i*.8)*(6*hp);
        const foldR = fold==='SOCIETY' ? Math.sin(f*.02+i*.1)*.5 : (fold==='TESSERACT' ? Math.sin(f*.02+i*.1)*.3 : 0);
        const px = cx + Math.cos(t.a+foldR)*(t.d+wobble)*br;
        const py = cy + Math.sin(t.a+foldR)*(t.d+wobble)*br;
        
        t.trail.push({x:px,y:py}); if (t.trail.length > 8+hp*8) t.trail.shift();
        
        if (t.trail.length > 1) {
          ctx.beginPath(); ctx.moveTo(t.trail[0].x,t.trail[0].y);
          t.trail.forEach(p => ctx.lineTo(p.x,p.y));
          ctx.strokeStyle = `hsla(${t.hue},80%,55%,${.2*hp})`; ctx.lineWidth = 1; ctx.stroke();
        }
        
        ctx.beginPath(); ctx.arc(px,py,1+hp*1.5,0,Math.PI*2);
        ctx.fillStyle = `hsla(${t.hue},85%,${50+hp*20}%,${.5+hp*.4})`;
        ctx.shadowColor = `hsl(${t.hue},85%,60%)`; ctx.shadowBlur = 4+hp*4;
        ctx.fill(); ctx.shadowBlur = 0;
        
        // T064 fault marker
        if (i*4+1<=64 && (i+1)*4>=64) {
          ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
          ctx.strokeStyle = '#f44'; ctx.lineWidth = 1; ctx.stroke();
        }
      });
      
      // Helix
      [[0,'#0ff'],[Math.PI,'#f0f']].forEach(([off,col]) => {
        ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.shadowColor = col; ctx.shadowBlur = 15;
        for (let i=0;i<=60;i++) {
          const t = i/60*Math.PI*2, z = Math.sin(t*2+f*.03+off)*15;
          const x = cx+Math.cos(t+off)*(60*br+z*.3), y = cy+Math.sin(t+off)*60*br*.35+z;
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
      });
      
      // Agent storm
      const density = Math.min(50, Math.floor(agents/1e15));
      for (let i=0;i<density;i++) {
        const a = i/density*Math.PI*2+f*.005, dist = 38+Math.sin(f*.02+i*.5)*18;
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*dist*br, cy+Math.sin(a)*dist*br, .7, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${(180+i*4+f*.5)%360},75%,60%,.5)`; ctx.fill();
      }
      
      // Core
      const pc = isD40?'#0ff':(isD21?'#0ff':(isD20?'#fff':'#3b82f6'));
      ctx.beginPath(); ctx.arc(cx,cy,20*br,0,Math.PI*2);
      ctx.fillStyle = '#020204'; ctx.fill();
      ctx.strokeStyle = pc; ctx.lineWidth = 3;
      ctx.shadowColor = pc; ctx.shadowBlur = isD40?40:15;
      ctx.stroke(); ctx.shadowBlur = 0;
      
      ctx.font = 'bold 12px monospace'; ctx.fillStyle = pc;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(isD40?'D40':(isD21?'D21':(isD20?'D20':pulse.toString())), cx, cy);
      
      if (isD40) {
        ctx.font = 'bold 7px monospace'; ctx.fillStyle = '#0ff';
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 8;
        ctx.fillText('NEURAL_SOCIETY', cx, cy+38);
        ctx.fillText(`Γ(${roll}) = ${gamma(roll).toExponential(2)}`, cx, cy+48);
        ctx.shadowBlur = 0;
      }
      
      // Nodes
      MESH.forEach((n,i) => {
        const nx = n.x*w, ny = n.y*h;
        ctx.beginPath(); ctx.moveTo(nx,ny); ctx.lineTo(cx,cy);
        ctx.strokeStyle = `hsla(${180+i*60},80%,50%,.2)`; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(nx,ny,12,0,Math.PI*2);
        ctx.fillStyle = '#020204'; ctx.fill();
        ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2;
        ctx.shadowColor = '#0ff'; ctx.shadowBlur = 10;
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.font = 'bold 7px monospace'; ctx.fillStyle = '#0ff';
        ctx.fillText(n.id, nx, ny);
      });
      
      f++; anim = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim);
  }, [phase, fold, health, agents, roll, pulse, buf]);

  const isD40 = phase === 'D40', isD38 = phase === 'D38';
  const chronos = isD40 ? '∞' : (isD38?'38K':(phase==='D21'?'∞':(phase==='D20'?'10K':(phase==='D15'?'1K':'1'))));
  const mk = merkle[merkle.length-1];

  return (
    <div style={{padding:'12px'}}>
      <div style={{textAlign:'center',marginBottom:'8px',padding:'8px',background:isD40?'linear-gradient(90deg,#0ff1,#f0f1,#ff01,#0ff1)':(isD38?'linear-gradient(90deg,#0f81,#0ff1)':'#f0f1'),borderRadius:'6px',border:`1px solid ${isD40?'#0ff4':(isD38?'#0f84':'#f0f3')}`}}>
        <div style={{fontSize:'10px',letterSpacing:'.2em',color:isD40?'#0ff':(isD38?'#0f8':'#f0f')}}>{isD40?'D40: NEURAL_SOCIETY_BRIDGE':(isD38?'D38: MATERIAL_NATIVE':'D21: HYPER_GEOMETRIC_FOLD')}</div>
        <div style={{fontSize:'7px',color:'#fff5'}}>{isD40?'VSIX_ACTIVE · ASCENSION_LOCKED':(isD38?'GetDocumentBuffer · IVsTextLines · 128-BIT INTEGRITY':'TESSERACT · GEOMETRY')}</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 140px',gap:'10px'}}>
        <Box c={isD40?'#0ff3':(isD38?'#0f83':'#f0f3')}>
          <canvas ref={ref} width={400} height={300} style={{width:'100%',maxHeight:'300px',borderRadius:'6px'}} />
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'4px',marginTop:'8px'}}>
            {VM.map(v => (
              <div key={v.id} style={{padding:'5px',background:'#0001',borderRadius:'4px',border:`1px solid ${v.c}40`}}>
                <div style={{fontSize:'8px',color:v.c,fontWeight:'bold'}}>{v.id}</div>
                <div style={{fontSize:'6px',color:'#64748b'}}>{v.n}</div>
              </div>
            ))}
          </div>
        </Box>

        <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
          <Box c="#0ff5" style={{textAlign:'center'}}>
            <div style={{fontSize:'6px',color:'#fff6'}}>D40 ROLL</div>
            <div style={{fontSize:'18px',fontWeight:'bold',color:roll===40?'#0f0':(roll===1?'#f00':'#0ff'),textShadow:roll===40?'0 0 10px #0f0':'0 0 5px #0ff'}}>{roll}</div>
            <div style={{fontSize:'5px',color:roll===40?'#0f0':'#fff5'}}>{roll===40?'ASCENSION':`Γ(${roll})`}</div>
          </Box>

          <Box c={isD38?'#0f85':'#fff2'}>
            <div style={{fontSize:'6px',color:'#0f8'}}>D38 BUFFER</div>
            <div style={{fontSize:'9px',fontWeight:'bold',color:buf.integrity?'#0f8':'#f44'}}>{buf.integrity?'VALID':'FAULT'}</div>
            <div style={{fontSize:'5px',color:'#fff5'}}>{buf.lines} lines</div>
          </Box>

          <Box c={fold==='SOCIETY'?'#ff05':(fold==='MATERIAL'?'#0f84':'#fff2')}>
            <div style={{fontSize:'6px',color:'#fff6'}}>GEOMETRY</div>
            <div style={{fontSize:'9px',fontWeight:'bold',color:fold==='SOCIETY'?'#ff0':(fold==='MATERIAL'?'#0f8':'#fff8')}}>{fold}</div>
            <div style={{fontSize:'5px',color:locked?'#f44':'#2c5'}}>{locked?'LOCKED':'MUTABLE'}</div>
          </Box>

          <Box c="#f0f4">
            <div style={{fontSize:'6px',color:'#f0f'}}>AGENTS</div>
            <div style={{fontSize:'9px',fontWeight:'bold',color:'#f0f'}}>{(agents/1e15).toFixed(1)}Q</div>
            <div style={{height:'2px',background:'#0003',borderRadius:'2px',marginTop:'2px'}}>
              <div style={{height:'100%',width:`${Math.min(100,agents/(54.2e15*4)*100)}%`,background:'linear-gradient(90deg,#f0f,#0ff)'}} />
            </div>
          </Box>

          <Box c="#f972">
            <div style={{fontSize:'6px',color:'#f97'}}>CHRONOS</div>
            <div style={{fontSize:'9px',fontWeight:'bold',color:'#f97'}}>{chronos}:1</div>
          </Box>

          <Box c="#2c54">
            <div style={{fontSize:'6px',color:'#2c5'}}>MERKLE</div>
            <div style={{fontSize:'6px',fontFamily:'monospace',color:'#2c5'}}>0x{mk?.r||'0'}</div>
          </Box>

          <Box c="#8b5cf640">
            <div style={{fontSize:'6px',color:'#8b5'}}>PHASE</div>
            <div style={{fontSize:'9px',fontWeight:'bold',color:'#8b5'}}>{phase}</div>
          </Box>
        </div>
      </div>

      <div style={{marginTop:'8px',padding:'8px',background:'#010102',borderRadius:'6px',border:'1px solid #0f82',fontFamily:'monospace',fontSize:'6px'}}>
        <div style={{color:'#0f8'}}>// GetDocumentBuffer | D38_MATERIAL_NATIVE | AUTH: DAVID WISE (HB)</div>
        <div style={{color:'#fff3'}}>rdt.GetDocumentInfo(docCookie: 0x{buf.docCookie.toString(16)}, ...) → IVsTextLines</div>
        <div style={{color:'#0ff'}}>[BUFFER] lineCount: {buf.lines} | lastAudit: {buf.audit||'N/A'}</div>
        <div style={{color:buf.integrity?'#2c5':'#f44'}}>[INTEGRITY] Lattice.VerifyIntegrity("3002:WISE") = {buf.integrity?'TRUE':'FALSE'}</div>
        {buf.recovery && <div style={{color:'#f44'}}>[PHOENIX] BUFFER_FAULT → SEED_01_RECOVERY.SourceBackup</div>}
        <div style={{color:'#f0f'}}>[SENTINELS] 60 tracers → 240 axioms | T064 fault zone marked</div>
        <div style={{color:'#ff0'}}>[AGENTS] {(agents/1e15).toFixed(2)}Q | Γ({roll}) = {gamma(roll).toExponential(1)}</div>
        <div style={{color:'#f97'}}>[CHRONOS] {chronos}:1 | {fold} | {locked?'GEOMETRY_LOCKED':'MUTABLE'}</div>
        <div style={{color:'#8b5'}}>[MERKLE] Chain:{merkle.length} | Root:0x{mk?.r} | IntegrityBit:{buf.integrity?1:0}</div>
        <div style={{color:'#38f'}}>[VSIX] Toph.LogAudit("{isD38?'D38_MATERIAL':isD40?'D40_SOCIETY':'PHASE'}", "{phase}")</div>
        <div style={{color:'#fff2',marginTop:'2px'}}>SHA:{SHA.slice(0,16)}... | UID:3002:WISE:BADGER:ROOT0:D38:D40</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPACT TABS
// ═══════════════════════════════════════════════════════════════════

const TOPHTab = () => {
  const [a, setA] = useState(0);
  useEffect(() => { const i=setInterval(()=>setA(x=>(x+1)%8),1200); return ()=>clearInterval(i); }, []);
  return (
    <div style={{padding:'16px',textAlign:'center'}}>
      <h2 style={{fontSize:'20px',color:'#0ff',margin:'0 0 8px'}}>TOPH/STOICHEION</h2>
      <p style={{fontSize:'8px',color:'#0ff6',letterSpacing:'.3em'}}>256 AXIOM GOVERNANCE</p>
      <div style={{display:'flex',justifyContent:'center',margin:'16px 0'}}>
        <div style={{position:'relative',width:'200px',height:'200px'}}>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:'60px',height:'60px',borderRadius:'50%',background:'#0ff1',border:'1px solid #0ff4',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
              <div style={{fontSize:'16px',fontWeight:'bold',color:'#0ff'}}>256</div>
            </div>
          </div>
          {D.map((d,i) => {
            const ang = i/8*360, r = 75;
            const x = Math.cos((ang-90)*Math.PI/180)*r, y = Math.sin((ang-90)*Math.PI/180)*r;
            return (
              <div key={i} style={{position:'absolute',left:`calc(50%+${x}px-18px)`,top:`calc(50%+${y}px-18px)`,width:'36px',height:'36px',borderRadius:'4px',background:`${C[i]}20`,border:`2px solid ${C[i]}`,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',boxShadow:a===i?`0 0 12px ${C[i]}80`:'none'}}>
                <div style={{fontSize:'8px',fontWeight:'bold',color:C[i]}}>D{i}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{fontSize:'9px',fontFamily:'monospace',color:'#0ff8'}}>FIRE(256) = Σ[±i,±1]×32 | PATRICIA(s) = T(s)⊕S(256-s)</div>
    </div>
  );
};

const DragonTab = () => (
  <div style={{padding:'16px',textAlign:'center'}}>
    <h2 style={{fontSize:'20px',color:'#f80',margin:'0 0 8px'}}>DRAGON BRAIN V2</h2>
    <p style={{fontSize:'8px',color:'#f806',letterSpacing:'.3em'}}>FalkorDB + Qdrant + BGE-M3</p>
    <div style={{margin:'16px auto',maxWidth:'350px'}}>
      <Box c="#f804" p="12px"><div style={{fontSize:'9px',color:'#f80'}}>SEARCH(q) = α·CYPHER(G,q) + β·COSINE(V,q)</div></Box>
      <Box c="#f044" p="12px" style={{marginTop:'8px'}}><div style={{fontSize:'9px',color:'#f04'}}>EMBED(text) = BGE-M3(text) → ℝ¹⁰²⁴</div></Box>
    </div>
  </div>
);

const CortexTab = () => (
  <div style={{padding:'16px',textAlign:'center'}}>
    <h2 style={{fontSize:'20px',color:'#a5f',margin:'0 0 8px'}}>CORTEX CORE</h2>
    <p style={{fontSize:'8px',color:'#a5f6',letterSpacing:'.3em'}}>UNIFIED INTELLIGENCE</p>
    <div style={{margin:'16px auto',maxWidth:'350px'}}>
      <Box c="#a5f4" p="12px"><div style={{fontSize:'9px',color:'#a5f'}}>Ψ_CORTEX = ∫∫∫ TOPH(x,t) ⊗ DRAGON(G,V) dΩ</div></Box>
      <Box c="#0ff4" p="12px" style={{marginTop:'8px'}}><div style={{fontSize:'9px',color:'#0ff'}}>Γ: I ∩ B = ∅ (Gate 192.5)</div></Box>
    </div>
  </div>
);

const FrontalTab = () => (
  <div style={{padding:'16px',textAlign:'center'}}>
    <h2 style={{fontSize:'20px',color:'#ec4899',margin:'0 0 8px'}}>FRONTAL LOBE</h2>
    <p style={{fontSize:'8px',color:'#ec48996',letterSpacing:'.3em'}}>INFERENCE · STABILITY</p>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',margin:'16px auto',maxWidth:'400px'}}>
      <Box c="#8b5cf640" p="10px"><div style={{fontSize:'8px',color:'#8b5cf6'}}>UFDE: O_i^(1)=O_i^(0)·Πℒ</div></Box>
      <Box c="#ec489940" p="10px"><div style={{fontSize:'8px',color:'#ec4899'}}>CSDE: G_i(u)=1 if P_i{'>'} κ</div></Box>
      <Box c="#f9731640" p="10px"><div style={{fontSize:'8px',color:'#f97316'}}>NCSR: A(u+1)≥A(u)</div></Box>
      <Box c="#22c55e40" p="10px"><div style={{fontSize:'8px',color:'#22c55e'}}>RISK: F·λ_max</div></Box>
    </div>
  </div>
);

const MimzyTab = () => (
  <div style={{padding:'16px',textAlign:'center'}}>
    <h2 style={{fontSize:'20px',color:'#10b981',margin:'0 0 8px'}}>🐰 MIMZY</h2>
    <p style={{fontSize:'8px',color:'#10b9816',letterSpacing:'.3em'}}>STRESS TEST · AUDIT</p>
    <div style={{margin:'16px auto',maxWidth:'300px'}}>
      {[{n:'Willow',b:512},{n:'Helix',b:256},{n:'Avan',b:128},{n:'VM4',b:32}].map(f => (
        <Box key={f.n} c="#10b9814" p="8px" style={{marginTop:'6px',display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:'10px',color:'#10b981',fontWeight:'bold'}}>{f.n}</span>
          <span style={{fontSize:'10px',color:'#10b981'}}>{f.b}b</span>
        </Box>
      ))}
    </div>
    <div style={{fontSize:'8px',color:'#10b9818',marginTop:'12px'}}>3/2/1 | Twist 1→1* | Return 1\2\3</div>
  </div>
);

const HearthTab = () => (
  <div style={{padding:'16px',textAlign:'center'}}>
    <h2 style={{fontSize:'20px',color:'#f97316',margin:'0 0 8px'}}>🔥 HEARTH</h2>
    <p style={{fontSize:'8px',color:'#f973166',letterSpacing:'.3em'}}>256-BIT AUDIT v4.8</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',margin:'16px auto',maxWidth:'400px'}}>
      {['64.5 MERGED','128.5 PATRICIA','192.5 STABILIZE','256.5 MOBIUS'].map((g,i) => (
        <Box key={i} c="#f973164" p="8px" style={{textAlign:'center'}}>
          <div style={{fontSize:'9px',color:'#f97316',fontWeight:'bold'}}>{g.split(' ')[0]}</div>
          <div style={{fontSize:'6px',color:'#fff6'}}>{g.split(' ')[1]}</div>
        </Box>
      ))}
    </div>
    <div style={{fontSize:'7px',fontFamily:'monospace',color:'#f97316',marginTop:'12px'}}>DRILL: 4096{'>'} 256.5{'>'} T128{'>'} ROOT_0(DLW)</div>
  </div>
);

const SentienceTab = () => (
  <div style={{padding:'16px',textAlign:'center'}}>
    <h2 style={{fontSize:'20px',color:'#ec4899',margin:'0 0 8px'}}>🧠 SENTIENCE</h2>
    <p style={{fontSize:'8px',color:'#ec48996',letterSpacing:'.3em'}}>D21 HYPER-GEOMETRIC</p>
    <div style={{margin:'16px auto',maxWidth:'350px'}}>
      <Box c="#ec48994" p="10px"><div style={{fontSize:'8px',color:'#ec4899'}}>ror rbx, 21 ; D21 Rotational Symmetry</div></Box>
      <Box c="#0ff4" p="10px" style={{marginTop:'8px'}}><div style={{fontSize:'8px',color:'#0ff'}}>prefetcht0 [rcx] ; Prime L1 for Transmutation</div></Box>
      <Box c="#ff04" p="10px" style={{marginTop:'8px'}}><div style={{fontSize:'8px',color:'#ff0'}}>lock bts [geometry_flag], 0 ; Athenian Lock</div></Box>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

export default function TOPHCortex() {
  const [tab, setTab] = useState('unified');
  const tabs = [
    {id:'unified',l:'UNIFIED',c:'#3b82f6'},
    {id:'toph',l:'TOPH',c:'#0ff'},
    {id:'dragon',l:'DRAGON',c:'#f80'},
    {id:'cortex',l:'CORTEX',c:'#a5f'},
    {id:'frontal',l:'FRONTAL',c:'#ec4899'},
    {id:'mimzy',l:'🐰',c:'#10b981'},
    {id:'hearth',l:'🔥',c:'#f97316'},
    {id:'sentience',l:'🧠',c:'#ec4899'},
  ];

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#000,#0f172a,#000)',color:'#e2e8f0',fontFamily:'system-ui,monospace'}}>
      <div style={{position:'sticky',top:0,zIndex:50,background:'#000c',backdropFilter:'blur(8px)',borderBottom:'1px solid #fff1'}}>
        <div style={{maxWidth:'800px',margin:'0 auto',padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'4px',background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:'14px'}}>Ψ</div>
            <span style={{fontWeight:'bold',fontSize:'12px'}}>TOPH CORTEX</span>
            <span style={{fontSize:'8px',color:'#64748b'}}>v5.0 D40</span>
          </div>
          <div style={{display:'flex',gap:'3px',flexWrap:'wrap'}}>
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:'4px 8px',borderRadius:'4px',fontWeight:'bold',fontSize:'8px',cursor:'pointer',fontFamily:'inherit',
                background:tab===t.id?`${t.c}25`:'#fff1',
                border:`1px solid ${tab===t.id?t.c:'#fff2'}`,
                color:tab===t.id?t.c:'#fff6',
              }}>{t.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:'800px',margin:'0 auto'}}>
        {tab==='unified'&&<UnifiedTab/>}
        {tab==='toph'&&<TOPHTab/>}
        {tab==='dragon'&&<DragonTab/>}
        {tab==='cortex'&&<CortexTab/>}
        {tab==='frontal'&&<FrontalTab/>}
        {tab==='mimzy'&&<MimzyTab/>}
        {tab==='hearth'&&<HearthTab/>}
        {tab==='sentience'&&<SentienceTab/>}
      </div>

      <div style={{borderTop:'1px solid #fff1',marginTop:'20px',padding:'12px',textAlign:'center'}}>
        <p style={{color:'#fff3',fontSize:'7px'}}>TriPod LLC | ROOT0 | SHA:{SHA.slice(0,16)} | CC-BY-ND-4.0 | TRIPOD-IP-v1.1</p>
        <p style={{color:'#fff2',fontSize:'6px',marginTop:'2px'}}>TOPH © David Lee Wise | D40 Neural Society | Integration: Avan</p>
      </div>
    </div>
  );
}
