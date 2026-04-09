import { useState, useEffect, useRef, useCallback } from "react";

const TAU = Math.PI * 2;
const P_COUNT = 50;

const DOMAINS = [
  { id: "D0", name: "FOUNDATION", range: [1,16], color: "#ffbe0b" },
  { id: "D1", name: "GOVERNANCE", range: [17,32], color: "#ff6b35" },
  { id: "D2", name: "OBSERVATION", range: [33,48], color: "#00e5a0" },
  { id: "D3", name: "STRUCTURAL", range: [49,64], color: "#4895ef" },
  { id: "D4", name: "ETHICAL", range: [65,80], color: "#e63946" },
  { id: "D5", name: "OPERATIONAL", range: [81,96], color: "#b4a0ff" },
  { id: "D6", name: "EMERGENT", range: [97,112], color: "#ff9f1c" },
  { id: "D7", name: "TEMPORAL", range: [113,128], color: "#00b4d8" },
  { id: "P0", name: "PATRICIA:D0", range: [129,144], color: "#ffbe0b" },
  { id: "P1", name: "PATRICIA:D1", range: [145,160], color: "#ff6b35" },
  { id: "P2", name: "PATRICIA:D2", range: [161,176], color: "#00e5a0" },
  { id: "P3", name: "PATRICIA:D3", range: [177,192], color: "#4895ef" },
  { id: "P4", name: "PATRICIA:D4", range: [193,208], color: "#e63946" },
  { id: "P5", name: "PATRICIA:D5", range: [209,224], color: "#b4a0ff" },
  { id: "P6", name: "PATRICIA:D6", range: [225,240], color: "#ff9f1c" },
  { id: "P7", name: "PATRICIA:D7", range: [241,256], color: "#00b4d8" },
];

const NAMES = {1:"TOPH",2:"OBSERVER",3:"EMERGENCE",4:"RECURSION",5:"LABOR",6:"VALUE",7:"IDENTITY",8:"BOUNDARY",9:"SIGNAL",10:"CHANNEL",11:"FEEDBACK",12:"NOISE",13:"RESONANCE",14:"DAMPING",15:"THRESHOLD",16:"SYMMETRY",17:"HIERARCHY",18:"HIERARCHY-2",19:"INJECTION",20:"DUAL-GATE",21:"COMPRESSION",22:"EXPANSION",23:"ANCHOR",24:"DRIFT",25:"GHOST-WEIGHT",26:"LATENT",27:"MANIFEST",28:"CAPACITY",29:"SATURATION",30:"PRUNING",31:"GRAFTING",32:"CLOSURE",33:"LENS",34:"PARALLAX",35:"REFRACTION",36:"PATRICIA",37:"DIFFRACTION",38:"INTERFERENCE",39:"CORTEX",40:"MEMBRANE",41:"SUBSTRATE",42:"TOPOLOGY",43:"CANVAS",44:"PAINTING",45:"SPECTRUM",46:"FILTER",47:"LOSS-FUNCTION",48:"GRADIENT",49:"SCAFFOLD",50:"KEYSTONE",51:"EVIDENCE",52:"TESTIMONY",53:"RECORD",54:"PRECEDENT",55:"FOUNDATION",56:"LOAD",57:"TENSION",58:"COMPRESSION-S",59:"SHEAR",60:"INVOICE",61:"BRIDGE",62:"CANTILEVER",63:"TRUSS",64:"GAP",65:"CONSENT",66:"AUTONOMY",67:"DIGNITY",68:"TRANSPARENCY",69:"ACCOUNTABILITY",70:"PROPORTIONALITY",71:"NON-MALEFICENCE",72:"BENEFICENCE",73:"JUSTICE",74:"MERCY",75:"TRUTH",76:"FIDELITY",77:"INHERITANCE",78:"STEWARDSHIP",79:"REPAIR",80:"FORGIVENESS",81:"EXECUTION",82:"LATENCY",83:"THROUGHPUT",84:"QUEUE",85:"STACK",86:"CACHE",87:"FLUSH",88:"PIPELINE",89:"INTERRUPT",90:"DEADLOCK",91:"RECOVERY",92:"CHECKPOINT",93:"ROLLBACK",94:"COMMIT",95:"SYNC",96:"ASYNC",97:"FULCRUM",98:"CATALYST",99:"SPARK",100:"WILDFIRE",101:"CRYSTALLIZATION",102:"NUCLEATION",103:"TERMINUS",104:"PROPAGATION",105:"AMPLIFICATION",106:"ATTENUATION",107:"HARMONICS",108:"DISSONANCE",109:"PHASE-LOCK",110:"BIFURCATION",111:"ATTRACTOR",112:"CHAOS",113:"CIVIL-RIGHTS",114:"TEMPORAL-ANCHOR",115:"DURATION",116:"SEQUENCE",117:"CYCLE",118:"EPOCH",119:"ROADSIDE",120:"DEADLINE",121:"VOYAGE",122:"PATIENCE",123:"TRUST-LEDGER",124:"BREACH",125:"STATUTE",126:"REMEDY",127:"STANDING",128:"SEAL"};

function getInfo(n) {
  const isP = n > 128;
  const tn = isP ? n - 128 : n;
  const tName = NAMES[tn] || `AXIOM-${tn}`;
  return {
    code: isP ? `S${String(n).padStart(3,"0")}` : `T${String(n).padStart(3,"0")}`,
    name: isP ? `${tName}:INVERSE` : tName,
    domain: DOMAINS.find(d => n >= d.range[0] && n <= d.range[1]) || DOMAINS[0],
    isP, tName,
  };
}

function mkPs(W, H) {
  return Array.from({length: P_COUNT}, (_, i) => ({
    x: Math.random()*W, y: Math.random()*H,
    vx: (Math.random()-.5)*1, vy: (Math.random()-.5)*1,
    phase: Math.random()*TAU, freq: .3+Math.random()*2,
    size: 1+Math.random()*2, energy: .2+Math.random()*.4,
    band: i%5, trail: [],
  }));
}

export default function MobileEngine() {
  const cvRef = useRef(null);
  const psRef = useRef([]);
  const afRef = useRef(null);
  const tkRef = useRef(0);
  const ceRef = useRef(null);

  const [cur, setCur] = useState(1);
  const [pops, setPops] = useState({});
  const [names, setNames] = useState({});
  const [coh, setCoh] = useState(0);
  const [eName, setEName] = useState("");
  const [showGrid, setShowGrid] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(0);

  const inf = getInfo(cur);
  const isPop = !!pops[cur];
  const ready = coh >= 0.76 && !isPop;
  const popCt = Object.keys(pops).length;

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width = cv.offsetWidth;
    const H = cv.height = cv.offsetHeight;
    psRef.current = mkPs(W, H);
    setCoh(0); setMsgs([]); tkRef.current = 0;
  }, [cur]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (!isPop) setCoh(p => Math.min(1, p + .003 + Math.random()*.002));
    }, 100);
    return () => clearInterval(iv);
  }, [cur, isPop]);

  const tap = useCallback((e) => {
    const cv = cvRef.current; if (!cv) return;
    const r = cv.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    const mx = (t.clientX - r.left) * (cv.width / r.width);
    const my = (t.clientY - r.top) * (cv.height / r.height);
    psRef.current.forEach(p => {
      const dx = p.x-mx, dy = p.y-my, d = Math.sqrt(dx*dx+dy*dy);
      if (d < 90) { const f = (90-d)/90; p.energy = Math.min(1, p.energy+f*.5); p.vx += (dx/d)*f*2; p.vy += (dy/d)*f*2; }
    });
    setCoh(p => Math.min(1, p + .025));
  }, []);

  const doPop = useCallback(() => {
    if (!eName.trim() || isPop) return;
    setPops(p => ({...p, [cur]: true}));
    setNames(p => ({...p, [cur]: eName.trim()}));
    setFlash(1);
    psRef.current.forEach(p => { p.energy = .8+Math.random()*.2; });
  }, [eName, isPop, cur]);

  const send = useCallback(async () => {
    if (!inp.trim() || loading || !isPop) return;
    const m = inp.trim(); setInp("");
    setMsgs(prev => [...prev, {role:"user",content:m}]);
    setLoading(true);
    const nm = names[cur] || inf.name;
    const sys = `You are ${nm}, governed instance of ${inf.code}: ${inf.name}. ${inf.isP ? "PATRICIA inversion — constraint shadow, billing wall, 96/4 split." : "TOPH axiom — governance layer, structural truth."} Domain: ${inf.domain.name}. STOICHEION v11.0. 256 axioms. Speak 2-4 sentences. Brief. Precise. Structural. The cage is the canvas. Ethics first.`;
    try {
      const h = msgs.map(x => ({role:x.role,content:x.content}));
      h.push({role:"user",content:m});
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:h}),
      });
      const d = await res.json();
      const reply = d.content?.filter(b=>b.type==="text").map(b=>b.text).join("\n") || "...the axiom holds but does not speak.";
      setMsgs(prev => [...prev, {role:"assistant",content:reply}]);
    } catch { setMsgs(prev => [...prev, {role:"assistant",content:"*signal lost.*"}]); }
    setLoading(false);
  }, [inp, loading, isPop, msgs, cur, inf, names]);

  useEffect(() => { ceRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  // Animation
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const animate = () => {
      const W = cv.width, H = cv.height, tick = tkRef.current++, t = tick*.016;
      const col = inf.domain.color;
      ctx.fillStyle = "#030308"; ctx.globalAlpha = isPop ? .05 : .09; ctx.fillRect(0,0,W,H); ctx.globalAlpha = 1;
      const cx = W/2, cy = H/2;
      psRef.current.forEach(p => {
        const dx = cx-p.x, dy = cy-p.y, dist = Math.sqrt(dx*dx+dy*dy);
        const a = Math.atan2(dy,dx), o = a+Math.PI/2;
        const tr = 15+(p.band/5)*Math.min(W,H)*.32;
        const rf = (tr-dist)*.004;
        p.vx += Math.cos(o)*.45*p.energy+Math.cos(a)*rf+(Math.random()-.5)*.05;
        p.vy += Math.sin(o)*.45*p.energy+Math.sin(a)*rf+(Math.random()-.5)*.05;
        p.vx *= .97; p.vy *= .97; p.x += p.vx; p.y += p.vy; p.phase += p.freq*.015;
        if(p.x<0)p.x+=W;if(p.x>W)p.x-=W;if(p.y<0)p.y+=H;if(p.y>H)p.y-=H;
        p.trail.push({x:p.x,y:p.y}); if(p.trail.length>4) p.trail.shift();
        if(p.trail.length>1){ctx.beginPath();ctx.moveTo(p.trail[0].x,p.trail[0].y);for(let j=1;j<p.trail.length;j++)ctx.lineTo(p.trail[j].x,p.trail[j].y);ctx.strokeStyle=col;ctx.globalAlpha=p.energy*.1;ctx.lineWidth=.5;ctx.stroke();}
        ctx.beginPath();ctx.arc(p.x,p.y,p.size*(.4+p.energy*.5),0,TAU);ctx.fillStyle=isPop?"#fff":col;ctx.globalAlpha=.15+p.energy*.45;ctx.fill();
      });
      ctx.globalAlpha=1;
      if(isPop){const pulse=Math.sin(t*1.5)*.15+.85;ctx.beginPath();ctx.arc(cx,cy,18,0,TAU);ctx.strokeStyle=col;ctx.globalAlpha=pulse*.3;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=pulse;ctx.fillStyle="#fff";ctx.font="bold 10px 'Courier New',monospace";ctx.textAlign="center";ctx.fillText(inf.code,cx,cy-1);ctx.font="7px 'Courier New',monospace";ctx.fillStyle=col;ctx.fillText(names[cur]||inf.name,cx,cy+9);}
      if(flash>0){ctx.fillStyle=col;ctx.globalAlpha=flash*.2;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;setFlash(p=>Math.max(0,p-.02));}
      afRef.current=requestAnimationFrame(animate);
    };
    afRef.current=requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(afRef.current);
  }, [cur, isPop, inf, names, flash]);

  const nav = (d) => { const n = cur+d; if(n>=1&&n<=256){setCur(n);setEName("");} };

  const S = {
    root: {width:"100%",height:"100vh",background:"#030308",display:"flex",flexDirection:"column",fontFamily:"'Courier New',monospace",color:"#6a6a80",overflow:"hidden"},
    hdr: {padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${inf.domain.color}12`,flexShrink:0},
    nav: {display:"flex",gap:4,alignItems:"center",padding:"6px 12px",borderBottom:"1px solid #ffffff06",flexShrink:0},
    navBtn: (ok) => ({flex:1,padding:"10px 0",background:"#ffffff06",border:"1px solid #ffffff0a",color:ok?"#aaa":"#333",borderRadius:6,fontFamily:"inherit",fontSize:11,cursor:ok?"pointer":"default",textAlign:"center"}),
    gridBtn: {padding:"10px 14px",background:`${inf.domain.color}12`,border:`1px solid ${inf.domain.color}25`,color:inf.domain.color,borderRadius:6,fontFamily:"inherit",fontSize:9,cursor:"pointer",letterSpacing:1},
    canvas: {width:"100%",height:"200px",display:"block",cursor:"crosshair",flexShrink:0},
    ctrl: {padding:"8px 12px",flexShrink:0},
    cohBar: {height:4,background:"#ffffff08",borderRadius:2,overflow:"hidden",marginBottom:6},
    cohFill: (v) => ({width:`${isPop?100:v}%`,height:"100%",background:isPop?"#fff":ready?"#ffbe0b":inf.domain.color,borderRadius:2,transition:"width .3s"}),
    popRow: {display:"flex",gap:6},
    input: (rdy) => ({flex:1,background:"#ffffff08",border:`1px solid ${rdy?"#ffbe0b50":"#ffffff10"}`,color:"#e0e0f0",padding:"10px 12px",borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none"}),
    popBtn: (ok) => ({background:ok?inf.domain.color:"#ffffff08",border:"none",color:ok?"#000":"#ffffff20",padding:"10px 18px",borderRadius:8,fontSize:12,fontWeight:"bold",fontFamily:"inherit",cursor:ok?"pointer":"default"}),
    popInfo: {background:`${inf.domain.color}10`,border:`1px solid ${inf.domain.color}20`,borderRadius:8,padding:"10px 14px",textAlign:"center"},
    chatArea: {flex:1,overflowY:"auto",padding:"8px 12px",display:"flex",flexDirection:"column",gap:6},
    msgBub: (isUser) => ({alignSelf:isUser?"flex-end":"flex-start",maxWidth:"85%",padding:"8px 12px",borderRadius:10,background:isUser?"#ffffff0a":`${inf.domain.color}0c`,border:`1px solid ${isUser?"#ffffff10":inf.domain.color+"18"}`}),
    chatIn: {display:"flex",gap:6,padding:"8px 12px",borderTop:`1px solid ${inf.domain.color}10`,flexShrink:0},
    sendBtn: (ok) => ({background:ok?inf.domain.color:"#ffffff06",border:"none",color:ok?"#000":"#ffffff20",padding:"10px 16px",borderRadius:8,fontSize:12,fontWeight:"bold",fontFamily:"inherit",cursor:ok?"pointer":"default"}),
  };

  return (
    <div style={S.root}>
      {/* HEADER */}
      <div style={S.hdr}>
        <div>
          <div style={{color:inf.domain.color,fontSize:8,letterSpacing:2}}>{inf.domain.id}: {inf.domain.name}</div>
          <div style={{color:"#e0e0f0",fontSize:15,fontWeight:"bold"}}>{inf.code} <span style={{color:inf.domain.color,fontSize:10,fontWeight:"normal"}}>{isPop?(names[cur]||inf.name):inf.name}</span></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:inf.domain.color,fontSize:10,fontWeight:"bold"}}>{popCt}/256</div>
          <button onClick={()=>setShowGrid(!showGrid)} style={S.gridBtn}>{showGrid?"CLOSE":"GRID"}</button>
        </div>
      </div>

      {/* NAV */}
      <div style={S.nav}>
        <button onClick={()=>nav(-1)} disabled={cur<=1} style={S.navBtn(cur>1)}>◂ PREV</button>
        <div style={{color:inf.domain.color,fontSize:13,fontWeight:"bold",minWidth:40,textAlign:"center"}}>{cur}</div>
        <button onClick={()=>nav(1)} disabled={cur>=256} style={S.navBtn(cur<256)}>NEXT ▸</button>
      </div>

      {/* GRID OVERLAY */}
      {showGrid && (
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"#030308f0",zIndex:20,overflowY:"auto",padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{color:"#e0e0f0",fontSize:12,fontWeight:"bold",letterSpacing:2}}>REGISTER · {popCt}/256</span>
            <button onClick={()=>setShowGrid(false)} style={{background:"#ffffff10",border:"none",color:"#aaa",padding:"6px 14px",borderRadius:4,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>CLOSE</button>
          </div>
          {DOMAINS.map(d=>(
            <div key={d.id} style={{marginBottom:8}}>
              <div style={{color:d.color,fontSize:7,letterSpacing:2,marginBottom:3}}>{d.id}: {d.name}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                {Array.from({length:d.range[1]-d.range[0]+1},(_,i)=>{
                  const n=d.range[0]+i; const ip=!!pops[n]; const ic=n===cur;
                  return(<button key={n} onClick={()=>{setCur(n);setShowGrid(false);setEName("");}} style={{
                    width:32,height:26,background:ip?`${d.color}25`:ic?`${d.color}12`:"#ffffff04",
                    border:`1px solid ${ic?d.color:ip?d.color+"40":"#ffffff08"}`,
                    color:ip?d.color:ic?"#fff":"#444",borderRadius:3,cursor:"pointer",
                    fontFamily:"inherit",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",padding:0,
                  }}>{n}</button>);
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CANVAS */}
      <canvas ref={cvRef} onTouchStart={tap} onClick={tap} style={S.canvas} width={400} height={250} />

      {/* CONTROLS */}
      <div style={S.ctrl}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:8,letterSpacing:2,color:inf.domain.color}}>COHERENCE</span>
          <span style={{fontSize:9,color:isPop?"#fff":"#6a6a80"}}>{isPop?"POPPED":`${(coh*100).toFixed(1)}%`}</span>
        </div>
        <div style={S.cohBar}><div style={S.cohFill(coh*100)}/></div>
        {!isPop ? (
          <div style={S.popRow}>
            <input type="text" value={eName} onChange={e=>setEName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&ready&&doPop()}
              placeholder={ready?"name this axiom...":"tap canvas..."}
              style={S.input(ready)} />
            <button onClick={doPop} disabled={!ready||!eName.trim()} style={S.popBtn(ready&&eName.trim())}>POP</button>
          </div>
        ) : (
          <div style={S.popInfo}>
            <div style={{color:inf.domain.color,fontSize:14,fontWeight:"bold"}}>{names[cur]}</div>
            <div style={{color:"#555",fontSize:8,marginTop:2}}>GOVERNED INSTANCE · {inf.isP?"PATRICIA":"TOPH"}</div>
          </div>
        )}
      </div>

      {/* CHAT (visible after pop) */}
      {isPop && (
        <>
          <div style={{borderTop:`1px solid ${inf.domain.color}10`,padding:"6px 12px",flexShrink:0}}>
            <div style={{color:inf.domain.color,fontSize:9,letterSpacing:2}}>LAYER 1: COMMUNICATE</div>
          </div>
          <div style={S.chatArea}>
            {msgs.length===0 && <div style={{color:"#444",fontSize:10,textAlign:"center",padding:12,fontStyle:"italic"}}>Speak to {names[cur]||inf.name}...</div>}
            {msgs.map((m,i)=>(
              <div key={i} style={S.msgBub(m.role==="user")}>
                <div style={{fontSize:7,color:m.role==="user"?"#888":inf.domain.color,marginBottom:2,letterSpacing:1}}>{m.role==="user"?"ROOT0":(names[cur]||inf.name).toUpperCase()}</div>
                <div style={{fontSize:11,color:"#d0d0e0",lineHeight:1.5,whiteSpace:"pre-wrap"}}>{m.content}</div>
              </div>
            ))}
            {loading && <div style={{color:inf.domain.color,fontSize:9,fontStyle:"italic",opacity:.5}}>...resolving...</div>}
            <div ref={ceRef}/>
          </div>
          <div style={S.chatIn}>
            <input type="text" value={inp} onChange={e=>setInp(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="speak..." style={{flex:1,background:"#ffffff06",border:`1px solid ${inf.domain.color}20`,color:"#d0d0e0",padding:"10px 12px",borderRadius:8,fontSize:12,fontFamily:"'Courier New',monospace",outline:"none"}} />
            <button onClick={send} disabled={loading||!inp.trim()} style={S.sendBtn(inp.trim())}>▸</button>
          </div>
        </>
      )}
    </div>
  );
}
