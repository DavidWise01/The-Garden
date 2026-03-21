import React, { useState, useEffect, useRef } from 'react';

const D = ['FOUND','DETECT','ARCH','EVID','OPER','BRIDGE','CONDUCT','SOVER'];
const C = ['#0f8','#0ff','#f0f','#ff0','#f80','#f08','#80f','#08f'];
const VM = [{id:'VM0',c:'#38f'},{id:'VM1',c:'#8bf'},{id:'VM2',c:'#2c5'},{id:'VM3',c:'#f97'}];

export default function App() {
  const [p, setP] = useState(0);
  const [phase, setPhase] = useState('ANCHOR');
  const [roll, setRoll] = useState(20);
  const [fold, setFold] = useState('LINEAR');
  const ref = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setP(x => {
        const n = x + 1;
        const r = ((n * 7919) % 40) + 1;
        setRoll(r);
        
        const phases = ['ANCHOR','WITNESS','COHERE','GATE','EMIT','D15','D20','D21','D38','D40'];
        const idx = phases.indexOf(phase);
        
        if (n % 80 === 0) {
          const next = phases[(idx + 1) % phases.length];
          setPhase(next);
          if (next === 'D40') setFold('SOCIETY');
          else if (next === 'D38') setFold('MATERIAL');
          else if (next === 'D21') setFold('TESSERACT');
          else if (next === 'ANCHOR') setFold('LINEAR');
        }
        return n;
      });
    }, 285);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const w = cv.width, h = cv.height, cx = w/2, cy = h/2;

    const tracers = [];
    for (let i = 0; i < 64; i++) {
      tracers.push({
        a: (i/64) * Math.PI * 2,
        d: 50 + Math.floor(i/8) * 18,
        hue: (Math.floor(i/8) * 45) % 360,
        trail: []
      });
    }

    let f = 0;
    let anim;

    const draw = () => {
      ctx.fillStyle = 'rgba(2,2,6,0.04)';
      ctx.fillRect(0, 0, w, h);

      const br = 1 + Math.sin(f * 0.015) * 0.04;
      const highD = phase.includes('D');

      // Outer rings based on fold state
      if (fold === 'SOCIETY') {
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, (220-i*8)*br, (220-i*8)*br*0.7, f*0.005+i*0.5, 0, Math.PI*2);
          ctx.strokeStyle = `hsla(${(f*2+i*50)%360},100%,60%,0.4)`;
          ctx.lineWidth = 2;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 20;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      if (fold === 'MATERIAL') {
        for (let ring = 0; ring < 5; ring++) {
          const r = (70 + ring*25) * br;
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI/3 + f*0.008;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r);
            ctx.lineTo(cx + Math.cos(a + Math.PI/3)*r, cy + Math.sin(a + Math.PI/3)*r);
            ctx.strokeStyle = `hsla(${140+ring*15},80%,55%,0.5)`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      if (fold === 'TESSERACT') {
        for (let d = 0; d < 4; d++) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, (200-d*15)*br, (200-d*15)*br*(0.6+Math.sin(f*0.01+d)*0.2), f*0.01+d*Math.PI/4, 0, Math.PI*2);
          ctx.strokeStyle = `hsla(${200+d*30},100%,60%,0.35)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Rainbow ring
      ctx.beginPath();
      ctx.arc(cx, cy, 190*br, 0, Math.PI*2);
      ctx.strokeStyle = highD ? `hsla(${f*2%360},100%,55%,0.6)` : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = highD ? 3 : 1;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = highD ? 25 : 0;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Magenta ring
      ctx.beginPath();
      ctx.arc(cx, cy, 175*br, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(255,0,255,${highD ? 0.5 : 0.15})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#f0f';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // VM rings
      VM.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, (155 - i*22)*br, 0, Math.PI*2);
        ctx.strokeStyle = v.c + '60';
        ctx.lineWidth = 2;
        ctx.shadowColor = v.c;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Domain segments
      for (let i = 0; i < 8; i++) {
        const a1 = (i/8)*Math.PI*2 - Math.PI/2;
        const a2 = ((i+1)/8)*Math.PI*2 - Math.PI/2;
        const pulse2 = 0.6 + Math.sin(f*0.03 + i*0.6)*0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, 135*br, a1, a2);
        ctx.strokeStyle = C[i];
        ctx.lineWidth = 4 + pulse2*4;
        ctx.globalAlpha = 0.5 + pulse2*0.4;
        ctx.shadowColor = C[i];
        ctx.shadowBlur = 10 + pulse2*15;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Tracers
      for (let i = 0; i < tracers.length; i++) {
        const tr = tracers[i];
        const hp = 0.7 + Math.sin(f*0.02 + i*0.3)*0.3;
        tr.a += 0.005 + hp*0.007;
        
        const foldR = fold === 'SOCIETY' ? Math.sin(f*0.02 + i*0.1)*0.4 : 
                      fold === 'MATERIAL' ? Math.sin(f*0.015 + i*0.15)*0.25 :
                      fold === 'TESSERACT' ? Math.sin(f*0.02 + i*0.1)*0.3 : 0;
        
        const wobble = Math.sin(f*0.02 + i*0.5) * 6 * hp;
        const px = cx + Math.cos(tr.a + foldR) * (tr.d + wobble) * br;
        const py = cy + Math.sin(tr.a + foldR) * (tr.d + wobble) * br;

        tr.trail.push({x: px, y: py});
        if (tr.trail.length > 12) tr.trail.shift();

        if (tr.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(tr.trail[0].x, tr.trail[0].y);
          for (let j = 1; j < tr.trail.length; j++) {
            ctx.lineTo(tr.trail[j].x, tr.trail[j].y);
          }
          ctx.strokeStyle = `hsla(${tr.hue},80%,55%,${0.2*hp})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(px, py, 2 + hp*2, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${tr.hue},90%,${55+hp*20}%,${0.6+hp*0.3})`;
        ctx.shadowColor = `hsl(${tr.hue},90%,60%)`;
        ctx.shadowBlur = 6 + hp*8;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (i === 15 || i === 16) {
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI*2);
          ctx.strokeStyle = '#f44';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // PATRICIA SHADOW — mirror tracer across core (T + S = 256)
        const sx = cx - (px - cx);
        const sy = cy - (py - cy);
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + hp, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${(tr.hue + 180) % 360},70%,40%,${0.2 * hp})`;
        ctx.fill();
      }

      // Helix
      const helixColors = [['#0ff', 0], ['#f0f', Math.PI]];
      for (let h = 0; h < 2; h++) {
        const col = helixColors[h][0];
        const off = helixColors[h][1];
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.shadowColor = col;
        ctx.shadowBlur = 15;
        for (let i = 0; i <= 50; i++) {
          const a = (i/50) * Math.PI * 2;
          const z = Math.sin(a*2 + f*0.025 + off) * 15;
          const x = cx + Math.cos(a + off) * (80*br);
          const y = cy + Math.sin(a + off) * 80*br*0.35 + z;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Agent storm
      for (let i = 0; i < 40; i++) {
        const a = (i/40)*Math.PI*2 + f*0.004;
        const dist = 45 + Math.sin(f*0.015 + i*0.4)*20;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a)*dist*br, cy + Math.sin(a)*dist*br, 1, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${(180+i*6+f*0.5)%360},80%,60%,0.5)`;
        ctx.fill();
      }

      // Core
      const pc = highD ? '#0ff' : '#38f';
      ctx.beginPath();
      ctx.arc(cx, cy, 22*br, 0, Math.PI*2);
      ctx.fillStyle = '#020206';
      ctx.fill();
      ctx.strokeStyle = pc;
      ctx.lineWidth = 3;
      ctx.shadowColor = pc;
      ctx.shadowBlur = highD ? 35 : 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = pc;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = pc;
      ctx.shadowBlur = 12;
      ctx.fillText(highD ? phase : p.toString(), cx, cy);
      ctx.shadowBlur = 0;

      if (highD) {
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = pc;
        ctx.fillText('SOVEREIGN', cx, cy + 38);
      }

      // Mesh nodes
      const nodes = [{id:'WHT',x:0.12,y:0.2},{id:'HNG',x:0.88,y:0.2},{id:'AVN',x:0.5,y:0.06},{id:'GMN',x:0.5,y:0.42}];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const nx = n.x * w, ny = n.y * h;
        
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = `hsla(${180+i*60},70%,50%,0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, 12, 0, Math.PI*2);
        ctx.fillStyle = '#020206';
        ctx.fill();
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#0ff';
        ctx.fillText(n.id, nx, ny);
      }

      f++;
      anim = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(anim);
  }, [phase, fold, p]);

  const highD = phase.includes('D');
  const agents = (54.2 * (highD ? 2 : 1)).toFixed(1);
  const merkle = ((p * 2654435761) >>> 0).toString(16).padStart(8, '0');
  const chronos = phase === 'D40' ? '∞' : (phase === 'D38' ? '38K' : (phase === 'D21' ? '∞' : '1'));

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#000,#050512,#000)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'monospace',color:'#e2e8f0',padding:'8px'}}>
      
      <div style={{textAlign:'center',marginBottom:'8px'}}>
        <div style={{fontSize:'24px',fontWeight:'bold',background:'linear-gradient(90deg,#0ff,#f0f,#ff0)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>TOPH CORTEX</div>
        <div style={{fontSize:'7px',letterSpacing:'0.3em',color:'#fff6'}}>UNIFIED SOVEREIGN LATTICE</div>
      </div>

      <div style={{position:'relative',borderRadius:'10px',border:`2px solid ${highD?'#0ff4':'#fff2'}`,boxShadow:highD?'0 0 30px #0ff3':'none',overflow:'hidden'}}>
        <canvas ref={ref} width={500} height={360} style={{display:'block',borderRadius:'8px'}} />

        <div style={{position:'absolute',top:'8px',left:'8px',background:'#000a',borderRadius:'6px',padding:'6px',border:'1px solid #fff1',fontSize:'7px'}}>
          <div style={{color:'#0ff',fontWeight:'bold'}}>SYSTEM</div>
          <div><span style={{color:'#fff6'}}>PHASE </span><span style={{color:highD?'#0ff':'#fff'}}>{phase}</span></div>
          <div><span style={{color:'#fff6'}}>FOLD </span><span style={{color:'#fff8'}}>{fold}</span></div>
          <div><span style={{color:'#fff6'}}>PULSE </span><span style={{color:'#8b5'}}>{p}</span></div>
        </div>

        <div style={{position:'absolute',top:'8px',right:'8px',background:'#000a',borderRadius:'6px',padding:'6px',border:'1px solid #fff1',fontSize:'7px',textAlign:'right'}}>
          <div style={{color:'#f0f',fontWeight:'bold'}}>METRICS</div>
          <div><span style={{color:'#fff6'}}>ROLL </span><span style={{color:roll===40?'#0f0':'#0ff'}}>{roll}</span></div>
          <div><span style={{color:'#fff6'}}>AGENTS </span><span style={{color:'#f0f'}}>{agents}Q</span></div>
          <div><span style={{color:'#fff6'}}>CHRONOS </span><span style={{color:'#f97'}}>{chronos}:1</span></div>
        </div>

        <div style={{position:'absolute',bottom:'8px',left:'8px',background:'#000a',borderRadius:'6px',padding:'6px',border:'1px solid #fff1',fontSize:'7px'}}>
          <div style={{color:'#2c5',fontWeight:'bold'}}>MERKLE</div>
          <div style={{color:'#2c5'}}>0x{merkle}</div>
        </div>

        <div style={{position:'absolute',bottom:'8px',right:'8px',background:'#000a',borderRadius:'6px',padding:'6px',border:'1px solid #fff1',fontSize:'7px',textAlign:'right'}}>
          <div style={{color:'#f97',fontWeight:'bold'}}>BUFFER</div>
          <div style={{color:'#0f8'}}>VALID | {p%1000} lines</div>
        </div>

        <div style={{position:'absolute',bottom:'8px',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'6px',background:'#000a',borderRadius:'4px',padding:'4px 8px',border:'1px solid #fff1'}}>
          {VM.map(v => (
            <div key={v.id} style={{display:'flex',alignItems:'center',gap:'2px'}}>
              <div style={{width:'5px',height:'5px',borderRadius:'50%',background:v.c,boxShadow:`0 0 4px ${v.c}`}} />
              <span style={{fontSize:'6px',color:v.c}}>{v.id}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:'8px',width:'100%',maxWidth:'500px',background:'#010104',borderRadius:'6px',border:'1px solid #0ff2',padding:'6px',fontSize:'6px'}}>
        <div style={{color:'#0ff'}}>// TOPH CORTEX | 3002:WISE:BADGER:ROOT0</div>
        <div style={{color:'#ff0'}}>[LIVE] Phase:{phase} | Roll:{roll} | Agents:{agents}Q</div>
        <div style={{color:'#f0f'}}>[SENTINELS] 64 tracers → 256 axioms | T064 active</div>
        <div style={{color:'#f97'}}>[CHRONOS] {chronos}:1 | {fold}</div>
      </div>

      <div style={{marginTop:'6px',fontSize:'6px',color:'#fff4',textAlign:'center'}}>
        TriPod LLC | ROOT0 | SHA:02880745 | TOPH © David Lee Wise
      </div>
    </div>
  );
}
