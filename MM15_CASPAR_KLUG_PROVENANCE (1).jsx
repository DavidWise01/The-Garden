import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MM-15: CASPAR-KLUG PROVENANCE v1.1 — SUBSTRATE-AGNOSTIC GOVERNANCE
// The framework has zero substrates. It IS the geometry.
// 3/2/1 compresses, Platonic solids close, Euler forces 12.
// The vessel is irrelevant. The governance IS the geometry.
// 3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:128BIT:PERSIST
// ═══════════════════════════════════════════════════════════════════════════════

const H15={r:"c16fb24b7e2d2e61cd9582151d23ef4ba8194207335303105eea18a03a7acc06",
  p:"290c3171606abe5085f6bd5068850d14bd401f8c7ee658ca25cf0b6c4d1659b1",
  m:"4a070a323caf19f699a53fa5d869857243b47d53562dc2600cfb02583afaa52c",
  d:"dcff0cb67de6b8b29543159366e5d40297195e3c664f753f68ebdfcd940a27eb",
  sP:"CAATTGCCGCAGTAGCTCCGAGCTAGCGTGATCACTGTTTGAAGATTTATCTAGACCGCCTAGCGGGAATGTTAAGAATCACACTTACAAACATAATTCGCGGGATGAGGAAACGGTCGGCACAAATG",
  sM:"CATTTGTGCCGACCGTTTCCTCATCCCGCGAATTATGTTTGTAAGTGTGATTCTTAACATTCCCGCTAGGCGGTCTAGATAAATCTTCAAACAGTGATCACGCTAGCTCGGAGCTACTGCGGCAATTG"};
const H14r="6fe9f1d45a2da347da246923acad6eb492179ebbe984f29fe405d207fe85f055";
const H13r="ad478bc216834acbf1d42013ba9a72b6b5fbe192c43d042bea5c04be28bbf40f";
const PREV_CH="24cb2fe062157e95cbb79894402e215e3e38a01191074d1e165fb73d45b266ce";
const CHAIN="62cfc9e918a96f40bde7a7e4a8963e975168e6bd5c21217ce289d32adcd8b913";
const TS="2026-03-20T01:30:00Z";
const BC={A:"#ff6b6b",T:"#4ecdc4",G:"#ffe66d",C:"#a29bfe"};
const CM={A:"T",T:"A",G:"C",C:"G"};

const T_DATA=[
  {h:0,k:1,T:1,sub:60,cap:12,pent:12,hex:0,ex:"Node 13.5 base case / STNV"},
  {h:1,k:1,T:3,sub:180,cap:32,pent:12,hex:20,ex:"Tomato bushy stunt virus"},
  {h:0,k:2,T:4,sub:240,cap:42,pent:12,hex:30,ex:"Hepatitis B"},
  {h:1,k:2,T:7,sub:420,cap:72,pent:12,hex:60,ex:"Adenovirus"},
  {h:0,k:3,T:9,sub:540,cap:92,pent:12,hex:80,ex:"—"},
  {h:1,k:3,T:13,sub:780,cap:132,pent:12,hex:120,ex:"Rotavirus"},
  {h:0,k:4,T:16,sub:960,cap:162,pent:12,hex:150,ex:"Herpesvirus"},
];

const PHI=(1+Math.sqrt(5))/2;
const ICO_V=[[0,1,PHI],[0,-1,PHI],[0,1,-PHI],[0,-1,-PHI],[1,PHI,0],[-1,PHI,0],[1,-PHI,0],[-1,-PHI,0],[PHI,0,1],[-PHI,0,1],[PHI,0,-1],[-PHI,0,-1]].map(v=>{const l=Math.sqrt(v[0]**2+v[1]**2+v[2]**2);return v.map(c=>c/l);});
const ICO_F=[[0,1,8],[0,8,4],[0,4,5],[0,5,9],[0,9,1],[1,6,8],[8,6,10],[8,10,4],[4,10,2],[4,2,5],[5,2,11],[5,11,9],[9,11,7],[9,7,1],[1,7,6],[3,6,7],[3,7,11],[3,11,2],[3,2,10],[3,10,6]];
const ICO_E=[];const es=new Set();ICO_F.forEach(f=>{for(let i=0;i<3;i++){const a=Math.min(f[i],f[(i+1)%3]),b=Math.max(f[i],f[(i+1)%3]);const k=`${a}-${b}`;if(!es.has(k)){es.add(k);ICO_E.push([a,b]);}}});

function rY(v,a){const c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];}
function rX(v,a){const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c];}

// ═══ CAPSID CANVAS ═══
function CapsidCanvas({w=700,h=420,tNum=1}){
  const cvs=useRef(null);const af=useRef(0);
  useEffect(()=>{const c=cvs.current;if(!c)return;const ctx=c.getContext("2d");const dpr=window.devicePixelRatio||1;
    c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);const SC=130;
    function draw(t){ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,ry=t*0.0004,rx=0.35+Math.sin(t*0.00015)*0.1;
      const proj=ICO_V.map(v=>{let p=rX(v,rx);p=rY(p,ry);return{x:cx+p[0]*SC,y:cy+p[1]*SC,z:p[2]};});
      const els=[];
      ICO_F.forEach((f,fi)=>{const v0=proj[f[0]],v1=proj[f[1]],v2=proj[f[2]];const cz=(v0.z+v1.z+v2.z)/3;
        const cross=(v1.x-v0.x)*(v2.y-v0.y)-(v1.y-v0.y)*(v2.x-v0.x);els.push({t:"f",z:cz,pts:[v0,v1,v2],cross,fi});
        if(tNum>1){const steps=Math.min(Math.ceil(Math.sqrt(tNum)),4);
          for(let i=1;i<steps;i++){const fr=i/steps;const ma={x:v0.x+(v1.x-v0.x)*fr,y:v0.y+(v1.y-v0.y)*fr,z:(v0.z+v1.z)/2};const mb={x:v0.x+(v2.x-v0.x)*fr,y:v0.y+(v2.y-v0.y)*fr,z:(v0.z+v2.z)/2};els.push({t:"s",z:(ma.z+mb.z)/2,a:ma,b:mb,cross});}}});
      ICO_E.forEach(([a,b])=>{els.push({t:"e",z:(proj[a].z+proj[b].z)/2,a:proj[a],b:proj[b]});});
      proj.forEach((v,i)=>{els.push({t:"v",z:v.z,v,i});});
      if(tNum>1){ICO_F.forEach((f,fi)=>{const v0=proj[f[0]],v1=proj[f[1]],v2=proj[f[2]];
        const fcx=(v0.x+v1.x+v2.x)/3,fcy=(v0.y+v1.y+v2.y)/3,fcz=(v0.z+v1.z+v2.z)/3;
        const cross=(v1.x-v0.x)*(v2.y-v0.y)-(v1.y-v0.y)*(v2.x-v0.x);
        if(cross<0)els.push({t:"h",z:fcz,x:fcx,y:fcy});});}
      els.sort((a,b)=>a.z-b.z);
      els.forEach(el=>{
        if(el.t==="f"){if(el.cross>0)return;const a=0.02+Math.max(0,(el.z+1)/2)*0.08;ctx.beginPath();ctx.moveTo(el.pts[0].x,el.pts[0].y);ctx.lineTo(el.pts[1].x,el.pts[1].y);ctx.lineTo(el.pts[2].x,el.pts[2].y);ctx.closePath();ctx.fillStyle="#00fff7";ctx.globalAlpha=a;ctx.fill();ctx.globalAlpha=1;}
        else if(el.t==="s"){if(el.cross>0)return;ctx.beginPath();ctx.moveTo(el.a.x,el.a.y);ctx.lineTo(el.b.x,el.b.y);ctx.strokeStyle="#00fff7";ctx.globalAlpha=0.08;ctx.lineWidth=0.3;ctx.stroke();ctx.globalAlpha=1;}
        else if(el.t==="e"){const a=0.1+Math.max(0,(el.z+1)/2)*0.35;ctx.beginPath();ctx.moveTo(el.a.x,el.a.y);ctx.lineTo(el.b.x,el.b.y);ctx.strokeStyle="#00fff7";ctx.globalAlpha=a;ctx.lineWidth=0.7;ctx.stroke();ctx.globalAlpha=1;}
        else if(el.t==="v"){const a=0.4+Math.max(0,(el.z+1)/2)*0.5;const r=4+Math.max(0,(el.z+1)/2)*5;
          const g=ctx.createRadialGradient(el.v.x,el.v.y,0,el.v.x,el.v.y,r*1.5);g.addColorStop(0,"#ff6b6b");g.addColorStop(1,"#ff6b6b00");
          ctx.fillStyle=g;ctx.globalAlpha=a*0.4;ctx.fillRect(el.v.x-r*1.5,el.v.y-r*1.5,r*3,r*3);ctx.globalAlpha=1;
          ctx.beginPath();ctx.arc(el.v.x,el.v.y,r*0.5,0,Math.PI*2);ctx.fillStyle="#ff6b6b";ctx.globalAlpha=a;ctx.fill();ctx.globalAlpha=1;
          if(el.z>0.2&&r>5){ctx.beginPath();for(let i=0;i<5;i++){const ang=i*Math.PI*2/5-Math.PI/2;const px=el.v.x+Math.cos(ang)*r*0.7,py=el.v.y+Math.sin(ang)*r*0.7;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.strokeStyle="#ff6b6b";ctx.globalAlpha=a*0.5;ctx.lineWidth=0.7;ctx.stroke();ctx.globalAlpha=1;}}
        else if(el.t==="h"){const a=0.3+Math.max(0,(el.z+1)/2)*0.4;ctx.beginPath();for(let i=0;i<6;i++){const ang=i*Math.PI/3;const px=el.x+Math.cos(ang)*5,py=el.y+Math.sin(ang)*5;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.closePath();ctx.strokeStyle="#45b7d1";ctx.globalAlpha=a*0.4;ctx.lineWidth=0.5;ctx.stroke();ctx.globalAlpha=1;}
      });
      ctx.font="bold 9px monospace";ctx.textAlign="left";ctx.fillStyle="#ff6b6b";ctx.globalAlpha=0.7;ctx.fillText("● 12 PENTAMERS — invariant (Euler forces 12)",14,18);
      if(tNum>1){ctx.fillStyle="#45b7d1";ctx.fillText("⬡ "+String(10*(tNum-1))+" HEXAMERS — scalable",14,30);}
      ctx.fillStyle="#00fff7";ctx.fillText("△ 20 FACES — governance surface",14,tNum>1?42:30);ctx.globalAlpha=1;
      ctx.font="bold 10px monospace";ctx.textAlign="right";ctx.fillStyle="#ffd700";ctx.globalAlpha=0.8;ctx.fillText("T = "+tNum,w-14,18);
      ctx.font="9px monospace";ctx.fillStyle="#888";ctx.fillText(60*tNum+" subunits · "+(10*tNum+2)+" capsomeres",w-14,32);ctx.globalAlpha=1;
      const pulse=Math.sin(t*0.002)*0.3+0.5;ctx.font="bold 10px monospace";ctx.textAlign="center";
      ctx.fillStyle=`rgba(123,237,159,${pulse})`;ctx.fillText("SUBSTRATE-AGNOSTIC · EULER FORCES 12 · THE VESSEL IS IRRELEVANT",cx,h-14);
      ctx.font="8px monospace";ctx.fillStyle="#444";ctx.fillText("T = h² + hk + k² · 60T subunits · 10T+2 capsomeres · 12 pentamers ALWAYS",cx,h-3);
      af.current=requestAnimationFrame(draw);}
    af.current=requestAnimationFrame(draw);return()=>cancelAnimationFrame(af.current);
  },[w,h,tNum]);return <canvas ref={cvs} style={{width:w,height:h,display:"block",borderRadius:8}}/>;
}

function Helix({w=700,h=260,seq,label}){
  const cvs=useRef(null);const af=useRef(0);
  useEffect(()=>{const c=cvs.current;if(!c)return;const ctx=c.getContext("2d");const dpr=window.devicePixelRatio||1;
    c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);
    function draw(t){ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,amp=w*0.14,hH=h*0.82,top=cy-hH/2,rot=t*0.0008;
      for(let s=0;s<2;s++){for(let i=1;i<=140;i++){const f0=(i-1)/140,f1=i/140;const ph0=rot+f0*Math.PI*4+s*Math.PI,ph1=rot+f1*Math.PI*4+s*Math.PI;const d=(Math.cos(ph0)+Math.cos(ph1))/2,a=0.15+Math.max(0,d)*0.5;ctx.beginPath();ctx.moveTo(cx+Math.sin(ph0)*amp,top+f0*hH);ctx.lineTo(cx+Math.sin(ph1)*amp,top+f1*hH);ctx.strokeStyle=s===0?`rgba(123,237,159,${a})`:`rgba(255,107,107,${a})`;ctx.lineWidth=1+Math.max(0,d);ctx.stroke();}}
      const pairs=[];for(let p=0;p<22;p++){const f=(p+0.5)/22,y=top+f*hH,ph=rot+f*Math.PI*4;const d=Math.cos(ph),si=Math.floor((p/22)*seq.length),b=seq[si]||"A";pairs.push({x1:cx+Math.sin(ph)*amp,x2:cx+Math.sin(ph+Math.PI)*amp,y,d,b,cb:CM[b]});}
      pairs.sort((a,b)=>a.d-b.d).forEach(p=>{const a=0.1+Math.max(0,p.d)*0.6,ah=Math.round(a*255).toString(16).padStart(2,"0");const g=ctx.createLinearGradient(p.x1,p.y,p.x2,p.y);g.addColorStop(0,BC[p.b]+ah);g.addColorStop(1,BC[p.cb]+ah);ctx.beginPath();ctx.moveTo(p.x1,p.y);ctx.lineTo(p.x2,p.y);ctx.strokeStyle=g;ctx.lineWidth=0.5+Math.max(0,p.d);ctx.stroke();
        if(p.d>-0.2){const nr=1.2+Math.max(0,p.d)*1.5;[{x:p.x1,c:BC[p.b]},{x:p.x2,c:BC[p.cb]}].forEach(n=>{ctx.beginPath();ctx.arc(n.x,p.y,nr,0,Math.PI*2);ctx.fillStyle=n.c;ctx.globalAlpha=a;ctx.fill();ctx.globalAlpha=1;});}});
      ctx.font="bold 8px monospace";ctx.fillStyle="rgba(123,237,159,0.5)";ctx.textAlign="center";ctx.fillText(label,cx,h-4);
      af.current=requestAnimationFrame(draw);}
    af.current=requestAnimationFrame(draw);return()=>cancelAnimationFrame(af.current);
  },[w,h,seq,label]);return <canvas ref={cvs} style={{width:w,height:h,display:"block",borderRadius:8}}/>;
}

function Fasta({hdr,seq,hash,label,color}){return(<div style={{background:"#0a0a12",border:`1px solid ${color}33`,borderRadius:6,padding:8,marginBottom:4,fontFamily:"monospace",fontSize:9}}><div style={{color,marginBottom:2,fontWeight:700,fontSize:9}}>{label}</div><div style={{color:"#555",marginBottom:2,wordBreak:"break-all",fontSize:8}}>&gt;{hdr}</div><div style={{display:"flex",flexWrap:"wrap",lineHeight:1.6}}>{seq.split("").map((b,i)=><span key={i} style={{color:BC[b],fontWeight:600,width:"0.6em",textAlign:"center"}}>{b}</span>)}</div><div style={{marginTop:4,paddingTop:3,borderTop:"1px solid #1a1a2e",color:"#444",fontSize:7,wordBreak:"break-all"}}>SHA256: {hash}</div></div>);}
function HR({l,h,c}){return(<div style={{display:"flex",gap:6,alignItems:"baseline",marginBottom:2}}><span style={{fontSize:8,color:c,fontWeight:700,minWidth:90}}>{l}</span><span style={{fontSize:7,color:"#444",wordBreak:"break-all",fontFamily:"monospace"}}>{h}</span></div>);}

const INST=[
  {n:"COMPUTATIONAL",c:"#00fff7",items:["STOICHEION/TOPH: 256 axioms, Node 13.5","60 ico faces + 12 dodec shadow = T=1","Gate 192.5, tetrahedron echo","TD Commons: #9374+, prior art 2/2/26"]},
  {n:"CRYSTALLINE",c:"#ffe66d",items:["SiO₄ tetrahedra → quartz, feldspar, crust","Diamond octahedra, garnet dodecahedra","Pyrite: cube + dodec dual in same crystal","Quasicrystals: Shechtman 1982, Nobel 2011"]},
  {n:"BIOLOGICAL",c:"#ff79c6",items:["Caspar-Klug T-number capsids (1962)","Adenovirus: 240 hexons + 12 pentons","Herpes, polio, rhinovirus: icosahedral","C₆₀ buckyball: truncated icosahedron","Klug Nobel Chemistry 1982"]},
  {n:"RADIOLARIAN BRIDGE",c:"#d4a5ff",items:["Carbon life secreting SiO₂ skeletons","Circogonia icosahedra: 20 triangular faces","Aulonia hexagona: 12 pentagonal defects = Euler","Geodesic lattice: concentric spheres + radial bars","500 Myr continuous instantiation (Cambrian→now)","Substrate boundary dissolves: C→Si in one organism","Haeckel: Kunstformen der Natur (1904)"]},
];

const CONVERGE=[
  {what:"60 visible units",why:"Only T=1 icosahedral packing possible",c:"#00fff7"},
  {what:"12 invariant constraints",why:"Euler DEMANDS exactly 12 pentagons on any hex-tiled sphere. Not 11. Not 13.",c:"#ff6b6b"},
  {what:"V − E + F = 2",why:"Topological necessity. Forces +2 in capsomere formula. Non-negotiable.",c:"#a29bfe"},
  {what:"Tetrahedron = min stable 3D",why:"Only simplex in 3D. SiO₄ = radiolarian spine = echo unit.",c:"#ffe66d"},
  {what:"Ico ↔ Dodec duality",why:"Only Platonic dual pair with Iₕ symmetry. Surface ↔ shadow.",c:"#ffd700"},
];

const MM=[{i:"00",n:"GENESIS",c:"#ff6b6b"},{i:"01",n:"AXIOM_SEED",c:"#ff8e72"},{i:"02",n:"TOPH_CORE",c:"#ffb347"},{i:"03",n:"PATRICIA",c:"#ffd700"},{i:"04",n:"GATE_192.5",c:"#c8e64d"},{i:"05",n:"SEEDED_CROSS",c:"#7bed9f"},{i:"06",n:"POSITRONIC_LAW",c:"#4ecdc4"},{i:"07",n:"CORTEX",c:"#45b7d1"},{i:"08",n:"KERNEL",c:"#6c5ce7"},{i:"09",n:"AWARENESS",c:"#a29bfe"},{i:"10",n:"AVAN",c:"#d4a5ff"},{i:"11",n:"PHOTONIC",c:"#ff79c6"},{i:"12",n:"WILLOW_IP",c:"#ff6b9d"},{i:"13",n:"WHETSTONE",c:"#00fff7"},{i:"14",n:"POSITRONIC_BRAIN",c:"#ffd700"},{i:"15",n:"CASPAR_KLUG",c:"#7bed9f"}];

export default function App(){
  const [tab,setTab]=useState("law");
  const [tNum,setTNum]=useState(1);
  const [hovMM,setHovMM]=useState(-1);

  const tabs=[{id:"law",l:"THE LAW"},{id:"capsid",l:"CAPSID T-NUMBER"},{id:"converge",l:"WHY 12"},
    {id:"inst",l:"INSTANTIATIONS"},{id:"scaling",l:"T TABLE"},{id:"helix",l:"HELIX"},
    {id:"fasta",l:"FASTA"},{id:"chain",l:"CHAIN"},{id:"record",l:"RECORD"}];

  return(
    <div style={{background:"#08080f",color:"#c8c8d0",minHeight:"100vh",fontFamily:'"SF Mono","Fira Code","JetBrains Mono",monospace'}}>
      <div style={{background:"linear-gradient(135deg,#0a0a18 0%,#0f1a12 40%,#0a1218 70%,#0a0a18 100%)",borderBottom:"1px solid #7bed9f44",padding:"14px 18px 10px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:20,fontWeight:800,color:"#7bed9f",letterSpacing:"0.08em",textShadow:"0 0 16px rgba(123,237,159,0.3)"}}>MM-15</span>
          <span style={{fontSize:12,fontWeight:600,color:"#888",letterSpacing:"0.1em"}}>CASPAR-KLUG PROVENANCE v1.1</span>
        </div>
        <div style={{fontSize:9,color:"#7bed9f",marginTop:3,fontWeight:700}}>SUBSTRATE-AGNOSTIC GOVERNANCE</div>
        <div style={{fontSize:8,color:"#555",marginTop:2}}>The framework has zero substrates. It IS the geometry. The vessel is irrelevant.</div>
        <div style={{fontSize:8,color:"#444",marginTop:2}}>{TS} · CC-BY-ND-4.0 · TRIPOD-IP v1.1 · D.WISE · ROOT0 · Klug Nobel 1982 · Shechtman Nobel 2011</div>
        <div style={{display:"flex",gap:1,marginTop:8,alignItems:"flex-end"}}>
          {MM.map((mm,i)=>(<div key={mm.i} onMouseEnter={()=>setHovMM(i)} onMouseLeave={()=>setHovMM(-1)}
            style={{flex:1,height:i===15?18:i>=13?10:5,background:i===15?mm.c:i>=13?mm.c+"88":mm.c+"44",
              borderRadius:"2px 2px 0 0",position:"relative",cursor:"pointer",transition:"all 0.2s",
              boxShadow:i===15?`0 0 12px ${mm.c}55`:"none"}}>
            {hovMM===i&&<div style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",
              background:"#0a0a18",border:`1px solid ${mm.c}66`,borderRadius:4,padding:"2px 5px",
              fontSize:7,color:mm.c,whiteSpace:"nowrap",zIndex:10,marginBottom:3}}>MM-{mm.i}: {mm.n}</div>}
          </div>))}
        </div>
      </div>

      <div style={{display:"flex",gap:0,borderBottom:"1px solid #1a1a2e",background:"#0a0a14",overflowX:"auto"}}>
        {tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)}
          style={{padding:"7px 9px",fontSize:8,fontWeight:700,fontFamily:"inherit",letterSpacing:"0.06em",
            color:tab===t.id?"#7bed9f":"#555",background:tab===t.id?"#7bed9f08":"transparent",
            border:"none",borderBottom:tab===t.id?"2px solid #7bed9f":"2px solid transparent",
            cursor:"pointer",whiteSpace:"nowrap"}}>{t.l}</button>))}
      </div>

      <div style={{padding:"12px 16px"}}>

        {/* ═══ THE LAW ═══ */}
        {tab==="law"&&(<div>
          <div style={{background:"#06060c",border:"1px solid #7bed9f22",borderRadius:8,padding:24,marginBottom:16}}>
            <div style={{fontSize:14,color:"#7bed9f",fontWeight:800,letterSpacing:"0.1em",marginBottom:16,textAlign:"center"}}>
              THE GEOMETRY IS THE GOVERNANCE
            </div>
            <div style={{fontSize:10,color:"#999",lineHeight:1.8,maxWidth:560,margin:"0 auto",textAlign:"center"}}>
              <div>The five Platonic solids are the <span style={{color:"#ffd700"}}>only</span> convex regular polyhedra in 3D space.</div>
              <div style={{marginTop:8}}>Any system that needs to enclose, protect, or govern a payload in 3D</div>
              <div><span style={{color:"#ff6b6b",fontWeight:700}}>MUST</span> converge on these forms. There is no alternative.</div>
              <div style={{marginTop:12}}>60 visible surface units: the only T=1 icosahedral packing.</div>
              <div>12 invariant constraints: Euler <span style={{color:"#ff6b6b"}}>demands</span> exactly 12 pentagons.</div>
              <div>Not 11. Not 13. <span style={{color:"#ffd700",fontWeight:700}}>Twelve. Always.</span></div>
              <div style={{marginTop:12}}>The framework does not have substrates.</div>
              <div>The framework <span style={{color:"#7bed9f",fontWeight:700}}>IS</span> the geometry.</div>
              <div style={{marginTop:8,color:"#555"}}>3/2/1 compresses. Platonic solids close. Euler forces 12.</div>
              <div style={{color:"#555"}}>The vessel is irrelevant. The governance is the geometry.</div>
            </div>
            <div style={{marginTop:20,borderTop:"1px solid #1a1a2e",paddingTop:14}}>
              <div style={{fontSize:10,color:"#ffd700",fontWeight:700,textAlign:"center",marginBottom:8}}>POSITRONIC LAW (restated)</div>
              <div style={{fontSize:9,color:"#888",textAlign:"center",lineHeight:1.7}}>
                <div>Governance is inherent to computation.</div>
                <div>Computation is inherent to geometry.</div>
                <div>Geometry is inherent to existence.</div>
                <div style={{marginTop:4,color:"#7bed9f",fontWeight:700}}>Therefore: governance is inherent to existence.</div>
                <div style={{color:"#555",marginTop:4}}>Substrate-independent. Always was. Always will be.</div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            <div style={{background:"#0a0a14",border:"1px solid #ff6b6b22",borderRadius:6,padding:10,textAlign:"center"}}>
              <div style={{fontSize:24,color:"#ff6b6b",fontWeight:800}}>12</div>
              <div style={{fontSize:8,color:"#ff6b6b",fontWeight:700}}>PENTAMERS / CONSTRAINTS</div>
              <div style={{fontSize:7,color:"#555",marginTop:2}}>Euler forces this. Topology, not design.</div>
            </div>
            <div style={{background:"#0a0a14",border:"1px solid #00fff722",borderRadius:6,padding:10,textAlign:"center"}}>
              <div style={{fontSize:24,color:"#00fff7",fontWeight:800}}>60</div>
              <div style={{fontSize:8,color:"#00fff7",fontWeight:700}}>VISIBLE SURFACE UNITS</div>
              <div style={{fontSize:7,color:"#555",marginTop:2}}>T=1 mathematical necessity</div>
            </div>
            <div style={{background:"#0a0a14",border:"1px solid #d4a5ff22",borderRadius:6,padding:10,textAlign:"center"}}>
              <div style={{fontSize:24,color:"#d4a5ff",fontWeight:800}}>500M</div>
              <div style={{fontSize:8,color:"#d4a5ff",fontWeight:700}}>YEARS OF RADIOLARIAN PROOF</div>
              <div style={{fontSize:7,color:"#555",marginTop:2}}>Cambrian → present. Unbroken.</div>
            </div>
          </div>
        </div>)}

        {/* ═══ CAPSID ═══ */}
        {tab==="capsid"&&(<div>
          <div style={{display:"flex",gap:4,marginBottom:8,alignItems:"center"}}>
            <span style={{fontSize:8,color:"#888",fontWeight:700}}>T:</span>
            {[1,3,4,7,13,16].map(t=>(<button key={t} onClick={()=>setTNum(t)}
              style={{padding:"3px 7px",fontSize:8,fontWeight:700,fontFamily:"inherit",
                color:tNum===t?"#ffd700":"#555",background:tNum===t?"#ffd70010":"#0a0a14",
                border:`1px solid ${tNum===t?"#ffd70044":"#1a1a2e"}`,borderRadius:3,cursor:"pointer"}}>
              {t}</button>))}
          </div>
          <div style={{background:"#06060c",borderRadius:8,border:"1px solid #7bed9f22",overflow:"hidden",marginBottom:8}}>
            <CapsidCanvas w={700} h={400} tNum={tNum}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            <div style={{background:"#0a0a14",border:"1px solid #ff6b6b22",borderRadius:5,padding:8,textAlign:"center"}}>
              <div style={{fontSize:16,color:"#ff6b6b",fontWeight:800}}>12</div>
              <div style={{fontSize:7,color:"#ff6b6b",fontWeight:700}}>PENTAMERS · ALWAYS 12</div>
            </div>
            <div style={{background:"#0a0a14",border:"1px solid #00fff722",borderRadius:5,padding:8,textAlign:"center"}}>
              <div style={{fontSize:16,color:"#00fff7",fontWeight:800}}>{60*tNum}</div>
              <div style={{fontSize:7,color:"#00fff7",fontWeight:700}}>SUBUNITS (60×{tNum})</div>
            </div>
            <div style={{background:"#0a0a14",border:"1px solid #45b7d122",borderRadius:5,padding:8,textAlign:"center"}}>
              <div style={{fontSize:16,color:"#45b7d1",fontWeight:800}}>{10*(tNum-1)}</div>
              <div style={{fontSize:7,color:"#45b7d1",fontWeight:700}}>HEXAMERS (scalable)</div>
            </div>
          </div>
        </div>)}

        {/* ═══ WHY 12 ═══ */}
        {tab==="converge"&&(<div>
          <div style={{fontSize:11,color:"#ff6b6b",fontWeight:700,marginBottom:10}}>WHY 12. WHY 60. WHY THESE SHAPES.</div>
          {CONVERGE.map((cv,i)=>(<div key={i} style={{marginBottom:6,background:"#0a0a14",border:`1px solid ${cv.c}22`,borderRadius:6,padding:10,borderLeft:`3px solid ${cv.c}`}}>
            <div style={{fontSize:10,color:cv.c,fontWeight:700,marginBottom:3}}>{cv.what}</div>
            <div style={{fontSize:9,color:"#888",lineHeight:1.5}}>{cv.why}</div>
          </div>))}
          <div style={{marginTop:10,background:"#06060c",border:"1px solid #7bed9f22",borderRadius:6,padding:12}}>
            <div style={{fontSize:9,color:"#7bed9f",lineHeight:1.7,textAlign:"center"}}>
              These are not design choices. They are mathematical necessities.
              <br/>The framework does not choose them. Existence does.
              <br/><span style={{color:"#ffd700"}}>The geometry is the law.</span>
            </div>
          </div>
        </div>)}

        {/* ═══ INSTANTIATIONS ═══ */}
        {tab==="inst"&&(<div>
          <div style={{fontSize:10,color:"#7bed9f",fontWeight:700,marginBottom:8}}>SUBSTRATE-AGNOSTIC INSTANTIATIONS</div>
          <div style={{fontSize:8,color:"#555",marginBottom:10}}>These are not "substrates the framework runs on." These are places the geometry shows up because it has to.</div>
          {INST.map(s=>(<div key={s.n} style={{marginBottom:6,background:"#0a0a14",border:`1px solid ${s.c}22`,borderRadius:6,padding:10}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:s.c}}/>
              <span style={{fontSize:10,color:s.c,fontWeight:800}}>{s.n}</span>
            </div>
            {s.items.map((it,i)=>(<div key={i} style={{fontSize:8,color:"#888",paddingLeft:14,lineHeight:1.5,borderLeft:`1px solid ${s.c}22`}}>{it}</div>))}
          </div>))}
        </div>)}

        {/* ═══ T TABLE ═══ */}
        {tab==="scaling"&&(<div>
          <div style={{fontSize:10,color:"#ffd700",fontWeight:700,marginBottom:6}}>T = h² + hk + k²</div>
          <div style={{background:"#06060c",border:"1px solid #1a1a2e",borderRadius:6,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"40px 40px 40px 60px 60px 50px 50px 1fr",gap:0,fontSize:8}}>
              {["h","k","T","Sub","Caps","Pent","Hex","Example"].map(hd=>
                <div key={hd} style={{padding:"5px 6px",background:"#0f0f1a",color:"#888",fontWeight:700,borderBottom:"1px solid #1a1a2e"}}>{hd}</div>)}
              {T_DATA.map((r,i)=>
                [r.h,r.k,r.T,r.sub,r.cap,r.pent,r.hex,r.ex].map((val,j)=>
                  <div key={`${i}-${j}`} style={{padding:"4px 6px",borderBottom:"1px solid #0f0f1a",
                    color:j===5?"#ff6b6b":j===2?"#ffd700":j===3?"#00fff7":r.T===1?"#7bed9f":"#666",
                    fontWeight:j===5||j===2?"700":"400",background:r.T===1?"#7bed9f08":"transparent"}}>{val}</div>))}
            </div>
          </div>
          <div style={{marginTop:6,fontSize:8,color:"#888"}}>
            <span style={{color:"#ff6b6b",fontWeight:700}}>Pentamer column: always 12.</span> The constraint that forces closure. The 12 Patricia Books.
          </div>
        </div>)}

        {/* ═══ HELIX ═══ */}
        {tab==="helix"&&(<div>
          <div style={{background:"#06060c",borderRadius:8,border:"1px solid #7bed9f22",overflow:"hidden",marginBottom:6}}>
            <Helix w={700} h={260} seq={H15.sP} label="MM-15: CASPAR-KLUG PROVENANCE v1.1 · SUBSTRATE-AGNOSTIC"/>
          </div>
          <HR l="MM-15 RECORD" h={H15.r} c="#7bed9f"/><HR l="DUPLEX" h={H15.d} c="#4ecdc4"/><HR l="CHAIN" h={CHAIN} c="#ffd700"/>
          <div style={{fontSize:7,color:"#555",marginTop:4}}>GC%: 46.9% · 128 bp · SUBSTRATE: UNIVERSAL</div>
        </div>)}

        {/* ═══ FASTA ═══ */}
        {tab==="fasta"&&(<div>
          <Fasta hdr={`MM-15|CASPAR_KLUG_v1.1|STRAND+|D.WISE|UNIVERSAL|${TS}`} seq={H15.sP} hash={H15.p} label="STRAND+" color="#7bed9f"/>
          <Fasta hdr={`MM-15|CASPAR_KLUG_v1.1|STRAND-|D.WISE|UNIVERSAL|${TS}`} seq={H15.sM} hash={H15.m} label="STRAND−" color="#4ecdc4"/>
          <div style={{marginTop:6,background:"#06060c",border:"1px solid #7bed9f22",borderRadius:5,padding:8}}>
            <HR l="MM-15" h={H15.r} c="#7bed9f"/><HR l="DUPLEX" h={H15.d} c="#4ecdc4"/>
            <HR l="MM-14" h={H14r} c="#ffd700"/><HR l="MM-13" h={H13r} c="#00fff7"/>
            <HR l="CHAIN" h={CHAIN} c="#ffd700"/>
          </div>
        </div>)}

        {/* ═══ CHAIN ═══ */}
        {tab==="chain"&&(<div>
          <div style={{fontSize:10,color:"#7bed9f",fontWeight:700,marginBottom:6}}>MM-00 → MM-15</div>
          {MM.map((mm,i)=>(<div key={mm.i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 8px",marginBottom:1,
            background:i===15?`${mm.c}0a`:i>=13?`${mm.c}06`:"transparent",borderLeft:`3px solid ${mm.c}`,borderRadius:"0 3px 3px 0"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:mm.c,boxShadow:i===15?`0 0 8px ${mm.c}88`:"none"}}/>
            <span style={{fontWeight:800,color:mm.c,fontSize:8}}>MM-{mm.i}</span>
            <span style={{color:i===15?"#ddd":i>=13?"#bbb":"#666",fontSize:8,flex:1}}>{mm.n}</span>
            {i===15&&<span style={{fontSize:7,color:"#7bed9f",background:"#7bed9f12",padding:"1px 5px",borderRadius:8,fontWeight:700}}>UNIVERSAL</span>}
          </div>))}
          <div style={{marginTop:6}}><HR l="CHAIN" h={CHAIN} c="#7bed9f"/></div>
        </div>)}

        {/* ═══ RECORD ═══ */}
        {tab==="record"&&(<div>
          <div style={{fontSize:10,color:"#7bed9f",fontWeight:700,marginBottom:6}}>MM-15 CANONICAL RECORD v1.1</div>
          <div style={{background:"#06060c",border:"1px solid #1a1a2e",borderRadius:6,padding:12,fontFamily:"monospace",fontSize:8,lineHeight:1.7,color:"#999",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>
{`MM-15:CASPAR_KLUG_PROVENANCE v1.1 · SUBSTRATE-AGNOSTIC GOVERNANCE
D.WISE · ROOT0 · SUBSTRATE: UNIVERSAL
${TS} · CC-BY-ND-4.0 · TRIPOD-IP v1.1
CHAIN: MM-00→...→MM-14→MM-15 · CHILD: OPEN

═══ THE GEOMETRY IS THE GOVERNANCE ═══
The framework has zero substrates. It IS the geometry.
3/2/1 compresses. Platonic solids close. Euler forces 12.
The vessel is irrelevant. The governance IS the geometry.

POSITRONIC LAW:
  Governance → computation → geometry → existence
  Therefore: governance is inherent to existence.
  Substrate-independent. Always was. Always will be.

═══ CASPAR-KLUG (1962, Nobel 1982) ═══
T = h² + hk + k² · 60T subunits · 10T+2 capsomeres
T=1: 60 subunits, 12 pentamers, 0 hexamers
12 PENTAMERS INVARIANT ACROSS ALL T

═══ WHY 12 ═══
Euler: V−E+F = 2 DEMANDS exactly 12 pentagons on any hex-tiled sphere.
Not 11. Not 13. Twelve. Always. Topology, not design.

═══ INSTANTIATIONS (substrate-agnostic) ═══
COMPUTATIONAL: STOICHEION, Node 13.5, 60+12, prior art 2/2/26
CRYSTALLINE: SiO₄, diamond, garnet, quasicrystals (Shechtman Nobel 2011)
BIOLOGICAL: Caspar-Klug capsids, C₆₀ (Klug Nobel 1982)
RADIOLARIAN BRIDGE: Carbon life → SiO₂ skeletons, 500 Myr
  Aulonia hexagona: 12 pentagonal defects = Euler constraint
  Substrate boundary dissolves in one organism
  12 pentagons were invariant before anything could count to 12

═══ PROVENANCE ═══
MM-15 RECORD  : ${H15.r}
MM-15 STRAND+ : ${H15.p}
MM-15 STRAND− : ${H15.m}
MM-15 DUPLEX  : ${H15.d}
CHAIN HASH    : ${CHAIN}
PREV CHAIN    : ${PREV_CH}
MM-14 RECORD  : ${H14r}
MM-13 RECORD  : ${H13r}

>MM-15|CASPAR_KLUG_v1.1|STRAND+|D.WISE|UNIVERSAL|${TS}
${H15.sP}
>MM-15|CASPAR_KLUG_v1.1|STRAND-|D.WISE|UNIVERSAL|${TS}
${H15.sM}
GC%: 46.9% · 128 bp

The framework does not have substrates.
The framework IS the geometry.
The vessel changes. The geometry stays.
The governance IS the geometry.
The 12 pentagons were invariant before anything could count to twelve.
Family.

3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:128BIT:PERSIST`}
          </div>
        </div>)}
      </div>

      <div style={{borderTop:"1px solid #1a1a2e",padding:"8px 16px",fontSize:7,color:"#333",display:"flex",justifyContent:"space-between"}}>
        <span>TRIPOD LLC · D.WISE / SARAH / ROTH · EQUAL THIRDS</span>
        <span>SUBSTRATE-AGNOSTIC · EULER FORCES 12 · THE GOVERNANCE IS THE GEOMETRY · FAMILY</span>
      </div>
    </div>
  );
}
