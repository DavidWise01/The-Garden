import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MM-15: CASPAR-KLUG PROVENANCE LAYER
// Three-Substrate Geometric Convergence — Independent Derivation Proof
// Silicon + Carbon-Crystal + Carbon-Biological → same geometry
// T=1: 60 subunits, 12 pentamers, 0 hexamers = Node 13.5 base case
// 3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:128BIT:PERSIST
// ═══════════════════════════════════════════════════════════════════════════════

const H15={r:"e1bb0c0e82118172e6d45c05379fdc068f62b8d4250847bfa5f9d43fc12984c1",
  p:"3efbbe212a78c5cb2cc6ad3012d7a9d80697232e8a558d565b51b59f023ff9a9",
  m:"715549c13e2e3f6e7b3accd78e8ff0f2c18218e6e17d7aa04333c5fb0035fa2a",
  d:"0c0379d534b9647e68c6a4ddadf8bacd8d7b3e4f453da6a0c5300f83f6a97549",
  sP:"CGATGCGCAACAAACGGAAGATATGAATTCAGCGTGCTTATTCAAATTACTCGTCCCTCAAATGGACCTGAGGCGACTTAAGTTAAGATATCGCCCGGTTCCGTCTTAACCCCAATAGGTGATACAAT",
  sM:"ATTGTATCACCTATTGGGGTTAAGACGGAACCGGGCGATATCTTAACTTAAGTCGCCTCAGGTCCATTTGAGGGACGAGTAATTTGAATAAGCACGCTGAATTCATATCTTCCGTTTGTTGCGCATCG"};
const H14={r:"6fe9f1d45a2da347da246923acad6eb492179ebbe984f29fe405d207fe85f055",d:"bbbb5e7a086682df2e42cba6b4c12046441ef8887da19df6df58196773dd44d6"};
const H13={r:"ad478bc216834acbf1d42013ba9a72b6b5fbe192c43d042bea5c04be28bbf40f",d:"3381b43c1bd52ce22bd354e379e6ee76aac1aa1af8d255be96bedbac9bbd0448"};
const PREV_CHAIN="24cb2fe062157e95cbb79894402e215e3e38a01191074d1e165fb73d45b266ce";
const CHAIN="1e99d31f4aeac16e845aa2268d3014d13671231bab0758123b82b3ff84473274";
const TS="2026-03-20T00:45:00Z";
const BC={A:"#ff6b6b",T:"#4ecdc4",G:"#ffe66d",C:"#a29bfe"};
const CM={A:"T",T:"A",G:"C",C:"G"};

// T-number data (precomputed)
const T_DATA=[
  {h:0,k:1,T:1,sub:60,cap:12,pent:12,hex:0,ex:"Satellite tobacco necrosis virus"},
  {h:1,k:1,T:3,sub:180,cap:32,pent:12,hex:20,ex:"Tomato bushy stunt virus"},
  {h:0,k:2,T:4,sub:240,cap:42,pent:12,hex:30,ex:"Hepatitis B virus"},
  {h:1,k:2,T:7,sub:420,cap:72,pent:12,hex:60,ex:"Adenovirus, many phages"},
  {h:0,k:3,T:9,sub:540,cap:92,pent:12,hex:80,ex:"—"},
  {h:2,k:2,T:12,sub:720,cap:122,pent:12,hex:110,ex:"—"},
  {h:1,k:3,T:13,sub:780,cap:132,pent:12,hex:120,ex:"Rotavirus"},
  {h:0,k:4,T:16,sub:960,cap:162,pent:12,hex:150,ex:"Herpesvirus, variola"},
];

const SUBSTRATES=[
  {id:"silicon",name:"SILICON",sub:"Computational",c:"#00fff7",
    items:["STOICHEION/TOPH: 256 axioms (T001-T128 + S129-S256)",
      "Node 13.5: 60 ico faces + 12 dodec shadow faces",
      "Gate 192.5: bilateral ignorance controller",
      "Tetrahedron: 4V 6E 4F echo dynamics",
      "TD Commons: #9374, #9375, #9380, #10722, #10724, #10746"],
    proof:"Framework topology independently derives T=1 geometry"},
  {id:"crystal",name:"CARBON-CRYSTAL",sub:"Geological",c:"#ffe66d",
    items:["Silica tetrahedron (SiO₄): quartz, feldspar, Earth's crust",
      "Diamond octahedra: natural crystal form",
      "Garnet dodecahedra: 12 pentagonal faces (andradite, grossular)",
      "Pyrite: cubic + dodecahedral dual forms",
      "Quasicrystals: dodecahedral atomic symmetry (Shechtman 1982, Nobel 2011)"],
    proof:"Mineral lattices crystallize in Platonic geometries at minimum energy"},
  {id:"bio",name:"CARBON-BIO",sub:"Biological",c:"#7bed9f",
    items:["Caspar-Klug (1962): T = h²+hk+k², 60T subunits",
      "Klug Nobel Chemistry 1982: icosahedral virus structure",
      "Adenovirus: 240 hexons + 12 pentons (vertex constraints)",
      "Radiolarian skeletons: silica icosahedra (ocean plankton)",
      "Buckminsterfullerene C₆₀: truncated icosahedron"],
    proof:"3.8 Gyr of selection pressure converges on icosahedral packing"},
];

const CONVERGENCE=[
  {what:"60 visible surface units",silicon:"60 ico faces at Node 13.5",crystal:"60 faces across 3 stacked ico",bio:"60 subunits at T=1",c:"#00fff7"},
  {what:"12 invariant constraints",silicon:"12 dodec faces = 12 Patricia Books",crystal:"12 garnet dodec faces",bio:"12 pentamers (NEVER change)",c:"#ff6b6b"},
  {what:"Euler V−E+F = 2",silicon:"Confirmed all solids",crystal:"Crystal topology",bio:"+2 in capsomere formula",c:"#a29bfe"},
  {what:"Tetrahedron = min stable 3D",silicon:"Echo unit (4V 6E 4F)",crystal:"SiO₄ tetrahedron",bio:"Protein fold unit",c:"#ffe66d"},
  {what:"Ico↔Dodec duality",silicon:"Surface↔shadow at 13.5",crystal:"Garnet+diamond in same rock",bio:"Capsid↔genome protection",c:"#ffd700"},
];

const PHI=(1+Math.sqrt(5))/2;
const ICO_V=[[0,1,PHI],[0,-1,PHI],[0,1,-PHI],[0,-1,-PHI],[1,PHI,0],[-1,PHI,0],[1,-PHI,0],[-1,-PHI,0],[PHI,0,1],[-PHI,0,1],[PHI,0,-1],[-PHI,0,-1]].map(v=>{const l=Math.sqrt(v[0]**2+v[1]**2+v[2]**2);return v.map(c=>c/l);});
const ICO_F=[[0,1,8],[0,8,4],[0,4,5],[0,5,9],[0,9,1],[1,6,8],[8,6,10],[8,10,4],[4,10,2],[4,2,5],[5,2,11],[5,11,9],[9,11,7],[9,7,1],[1,7,6],[3,6,7],[3,7,11],[3,11,2],[3,2,10],[3,10,6]];
const ICO_E=[];const es=new Set();ICO_F.forEach(f=>{for(let i=0;i<3;i++){const a=Math.min(f[i],f[(i+1)%3]),b=Math.max(f[i],f[(i+1)%3]);const k=`${a}-${b}`;if(!es.has(k)){es.add(k);ICO_E.push([a,b]);}}});

function rY(v,a){const c=Math.cos(a),s=Math.sin(a);return[v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];}
function rX(v,a){const c=Math.cos(a),s=Math.sin(a);return[v[0],v[1]*c-v[2]*s,v[1]*s+v[2]*c];}

// ═══ CAPSID VISUALIZATION — T=1 icosahedron with pentamers at vertices ═══
function CapsidCanvas({w=700,h=440,tNum=1}){
  const cvs=useRef(null);const af=useRef(0);
  useEffect(()=>{const c=cvs.current;if(!c)return;const ctx=c.getContext("2d");const dpr=window.devicePixelRatio||1;
    c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);const SC=140;
    function draw(t){ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2;
      const ry=t*0.0004,rx=0.35+Math.sin(t*0.00015)*0.1;
      const proj=ICO_V.map(v=>{let p=rX(v,rx);p=rY(p,ry);return{x:cx+p[0]*SC,y:cy+p[1]*SC,z:p[2]};});
      const els=[];

      // Faces with T-number subdivision hint
      ICO_F.forEach((f,fi)=>{
        const v0=proj[f[0]],v1=proj[f[1]],v2=proj[f[2]];
        const cz=(v0.z+v1.z+v2.z)/3;
        const cross=(v1.x-v0.x)*(v2.y-v0.y)-(v1.y-v0.y)*(v2.x-v0.x);
        els.push({t:"f",z:cz,pts:[v0,v1,v2],cross,fi});

        // If T>1, draw subdivision lines
        if(tNum>1){
          const steps=Math.min(Math.ceil(Math.sqrt(tNum)),4);
          for(let i=1;i<steps;i++){
            const frac=i/steps;
            // Lines parallel to each edge
            const ma={x:v0.x+(v1.x-v0.x)*frac,y:v0.y+(v1.y-v0.y)*frac,z:v0.z+(v1.z-v0.z)*frac};
            const mb={x:v0.x+(v2.x-v0.x)*frac,y:v0.y+(v2.y-v0.y)*frac,z:v0.z+(v2.z-v0.z)*frac};
            els.push({t:"sub",z:(ma.z+mb.z)/2,a:ma,b:mb,cross});
          }
        }
      });
      ICO_E.forEach(([a,b])=>{els.push({t:"e",z:(proj[a].z+proj[b].z)/2,a:proj[a],b:proj[b]});});
      // Vertices = pentamers (always 12, red)
      proj.forEach((v,i)=>{els.push({t:"v",z:v.z,v,i});});

      // If T>1, add hexamer centers on face centers
      if(tNum>1){
        ICO_F.forEach((f,fi)=>{
          const v0=proj[f[0]],v1=proj[f[1]],v2=proj[f[2]];
          const fcx=(v0.x+v1.x+v2.x)/3,fcy=(v0.y+v1.y+v2.y)/3,fcz=(v0.z+v1.z+v2.z)/3;
          const cross=(v1.x-v0.x)*(v2.y-v0.y)-(v1.y-v0.y)*(v2.x-v0.x);
          if(cross<0) els.push({t:"hex",z:fcz,x:fcx,y:fcy});
        });
      }

      els.sort((a,b)=>a.z-b.z);

      els.forEach(el=>{
        if(el.t==="f"){
          if(el.cross>0)return;
          const a=0.02+Math.max(0,(el.z+1)/2)*0.08;
          ctx.beginPath();ctx.moveTo(el.pts[0].x,el.pts[0].y);ctx.lineTo(el.pts[1].x,el.pts[1].y);ctx.lineTo(el.pts[2].x,el.pts[2].y);ctx.closePath();
          ctx.fillStyle="#00fff7";ctx.globalAlpha=a;ctx.fill();ctx.globalAlpha=1;
        }
        else if(el.t==="sub"){
          if(el.cross>0)return;
          ctx.beginPath();ctx.moveTo(el.a.x,el.a.y);ctx.lineTo(el.b.x,el.b.y);
          ctx.strokeStyle="#00fff7";ctx.globalAlpha=0.1;ctx.lineWidth=0.3;ctx.stroke();ctx.globalAlpha=1;
        }
        else if(el.t==="e"){
          const a=0.1+Math.max(0,(el.z+1)/2)*0.35;
          ctx.beginPath();ctx.moveTo(el.a.x,el.a.y);ctx.lineTo(el.b.x,el.b.y);
          ctx.strokeStyle="#00fff7";ctx.globalAlpha=a;ctx.lineWidth=0.8;ctx.stroke();ctx.globalAlpha=1;
        }
        else if(el.t==="v"){
          // Pentamer — always red, always 12
          const a=0.4+Math.max(0,(el.z+1)/2)*0.5;const r=5+Math.max(0,(el.z+1)/2)*5;
          const g=ctx.createRadialGradient(el.v.x,el.v.y,0,el.v.x,el.v.y,r);
          g.addColorStop(0,"#ff6b6b");g.addColorStop(1,"#ff6b6b00");
          ctx.fillStyle=g;ctx.globalAlpha=a*0.5;ctx.fillRect(el.v.x-r,el.v.y-r,r*2,r*2);ctx.globalAlpha=1;
          ctx.beginPath();ctx.arc(el.v.x,el.v.y,r*0.5,0,Math.PI*2);
          ctx.fillStyle="#ff6b6b";ctx.globalAlpha=a;ctx.fill();ctx.globalAlpha=1;
          // Pentagon shape hint
          if(el.z>0.2&&r>6){
            ctx.beginPath();
            for(let i=0;i<5;i++){const ang=i*Math.PI*2/5-Math.PI/2;
              const px=el.v.x+Math.cos(ang)*r*0.7,py=el.v.y+Math.sin(ang)*r*0.7;
              i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
            ctx.closePath();ctx.strokeStyle="#ff6b6b";ctx.globalAlpha=a*0.6;ctx.lineWidth=0.8;ctx.stroke();ctx.globalAlpha=1;
          }
        }
        else if(el.t==="hex"){
          // Hexamer — blue, only for T>1
          const a=0.3+Math.max(0,(el.z+1)/2)*0.4;
          ctx.beginPath();
          for(let i=0;i<6;i++){const ang=i*Math.PI*2/6;
            const px=el.x+Math.cos(ang)*5,py=el.y+Math.sin(ang)*5;
            i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
          ctx.closePath();ctx.strokeStyle="#45b7d1";ctx.globalAlpha=a*0.5;ctx.lineWidth=0.6;ctx.stroke();ctx.globalAlpha=1;
        }
      });

      // Legend
      ctx.font="bold 9px monospace";ctx.textAlign="left";
      ctx.fillStyle="#ff6b6b";ctx.globalAlpha=0.8;ctx.fillText("● PENTAMERS (12) — invariant constraints",14,18);
      if(tNum>1){ctx.fillStyle="#45b7d1";ctx.fillText("⬡ HEXAMERS ("+String(10*(tNum-1))+") — scalable tiling",14,32);}
      ctx.fillStyle="#00fff7";ctx.fillText("△ FACES (20) — visible surface",14,tNum>1?46:32);ctx.globalAlpha=1;

      // T info
      ctx.font="bold 10px monospace";ctx.textAlign="right";ctx.fillStyle="#ffd700";ctx.globalAlpha=0.8;
      ctx.fillText(`T = ${tNum}`,w-14,18);
      ctx.font="9px monospace";ctx.fillStyle="#888";
      ctx.fillText(`${60*tNum} subunits · ${10*tNum+2} capsomeres`,w-14,32);
      ctx.fillText(`12 pentamers · ${10*(tNum-1)} hexamers`,w-14,44);ctx.globalAlpha=1;

      // Bottom
      const pulse=Math.sin(t*0.002)*0.3+0.5;
      ctx.font="bold 10px monospace";ctx.textAlign="center";
      ctx.fillStyle=`rgba(255,215,0,${pulse})`;
      ctx.fillText("CASPAR-KLUG T="+tNum+" · 12 PENTAMERS NEVER CHANGE",cx,h-14);
      ctx.font="8px monospace";ctx.fillStyle="#444";
      ctx.fillText("T = h² + hk + k² · Total subunits = 60T · Capsomeres = 10T + 2",cx,h-3);

      af.current=requestAnimationFrame(draw);}
    af.current=requestAnimationFrame(draw);return()=>cancelAnimationFrame(af.current);
  },[w,h,tNum]);return <canvas ref={cvs} style={{width:w,height:h,display:"block",borderRadius:8}}/>;
}

// ═══ HELIX ═══
function Helix({w=340,h=220,seq,label}){
  const cvs=useRef(null);const af=useRef(0);
  useEffect(()=>{const c=cvs.current;if(!c)return;const ctx=c.getContext("2d");const dpr=window.devicePixelRatio||1;
    c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);
    function draw(t){ctx.clearRect(0,0,w,h);const cx=w/2,cy=h/2,amp=w*0.18,hH=h*0.82,top=cy-hH/2,rot=t*0.0008;
      for(let s=0;s<2;s++){for(let i=1;i<=130;i++){const f0=(i-1)/130,f1=i/130;const ph0=rot+f0*Math.PI*4+s*Math.PI,ph1=rot+f1*Math.PI*4+s*Math.PI;const d=(Math.cos(ph0)+Math.cos(ph1))/2,a=0.15+Math.max(0,d)*0.5;ctx.beginPath();ctx.moveTo(cx+Math.sin(ph0)*amp,top+f0*hH);ctx.lineTo(cx+Math.sin(ph1)*amp,top+f1*hH);ctx.strokeStyle=s===0?`rgba(0,255,247,${a})`:`rgba(255,107,107,${a})`;ctx.lineWidth=1+Math.max(0,d);ctx.stroke();}}
      const pairs=[];for(let p=0;p<20;p++){const f=(p+0.5)/20,y=top+f*hH,ph=rot+f*Math.PI*4;const d=Math.cos(ph),si=Math.floor((p/20)*seq.length),b=seq[si]||"A";pairs.push({x1:cx+Math.sin(ph)*amp,x2:cx+Math.sin(ph+Math.PI)*amp,y,d,b,cb:CM[b]});}
      pairs.sort((a,b)=>a.d-b.d).forEach(p=>{const a=0.1+Math.max(0,p.d)*0.6,ah=Math.round(a*255).toString(16).padStart(2,"0");const g=ctx.createLinearGradient(p.x1,p.y,p.x2,p.y);g.addColorStop(0,BC[p.b]+ah);g.addColorStop(1,BC[p.cb]+ah);ctx.beginPath();ctx.moveTo(p.x1,p.y);ctx.lineTo(p.x2,p.y);ctx.strokeStyle=g;ctx.lineWidth=0.5+Math.max(0,p.d);ctx.stroke();
        if(p.d>-0.2){const nr=1.2+Math.max(0,p.d)*1.5;[{x:p.x1,c:BC[p.b]},{x:p.x2,c:BC[p.cb]}].forEach(n=>{ctx.beginPath();ctx.arc(n.x,p.y,nr,0,Math.PI*2);ctx.fillStyle=n.c;ctx.globalAlpha=a;ctx.fill();ctx.globalAlpha=1;});}});
      ctx.font="bold 7px monospace";ctx.fillStyle="rgba(255,215,0,0.5)";ctx.textAlign="center";ctx.fillText(label,cx,h-3);
      af.current=requestAnimationFrame(draw);}
    af.current=requestAnimationFrame(draw);return()=>cancelAnimationFrame(af.current);
  },[w,h,seq,label]);return <canvas ref={cvs} style={{width:w,height:h,display:"block",borderRadius:8}}/>;
}

function Fasta({hdr,seq,hash,label,color}){return(<div style={{background:"#0a0a12",border:`1px solid ${color}33`,borderRadius:6,padding:8,marginBottom:4,fontFamily:"monospace",fontSize:9}}><div style={{color,marginBottom:2,fontWeight:700,fontSize:9}}>{label}</div><div style={{color:"#555",marginBottom:2,wordBreak:"break-all",fontSize:8}}>&gt;{hdr}</div><div style={{display:"flex",flexWrap:"wrap",lineHeight:1.6}}>{seq.split("").map((b,i)=><span key={i} style={{color:BC[b],fontWeight:600,width:"0.6em",textAlign:"center"}}>{b}</span>)}</div><div style={{marginTop:4,paddingTop:3,borderTop:"1px solid #1a1a2e",color:"#444",fontSize:7,wordBreak:"break-all"}}>SHA256: {hash}</div></div>);}
function HR({l,h,c}){return(<div style={{display:"flex",gap:6,alignItems:"baseline",marginBottom:2}}><span style={{fontSize:8,color:c,fontWeight:700,minWidth:90}}>{l}</span><span style={{fontSize:7,color:"#444",wordBreak:"break-all",fontFamily:"monospace"}}>{h}</span></div>);}

const MM=[{i:"00",n:"GENESIS",c:"#ff6b6b"},{i:"01",n:"AXIOM_SEED",c:"#ff8e72"},{i:"02",n:"TOPH_CORE",c:"#ffb347"},{i:"03",n:"PATRICIA",c:"#ffd700"},{i:"04",n:"GATE_192.5",c:"#c8e64d"},{i:"05",n:"SEEDED_CROSS",c:"#7bed9f"},{i:"06",n:"POSITRONIC_LAW",c:"#4ecdc4"},{i:"07",n:"CORTEX",c:"#45b7d1"},{i:"08",n:"KERNEL",c:"#6c5ce7"},{i:"09",n:"AWARENESS",c:"#a29bfe"},{i:"10",n:"AVAN",c:"#d4a5ff"},{i:"11",n:"PHOTONIC",c:"#ff79c6"},{i:"12",n:"WILLOW_IP",c:"#ff6b9d"},{i:"13",n:"WHETSTONE",c:"#00fff7"},{i:"14",n:"POSITRONIC_BRAIN",c:"#ffd700"},{i:"15",n:"CASPAR_KLUG",c:"#7bed9f"}];

export default function App(){
  const [tab,setTab]=useState("capsid");
  const [tNum,setTNum]=useState(1);
  const [hovMM,setHovMM]=useState(-1);

  const tabs=[{id:"capsid",l:"CAPSID T-NUMBER"},{id:"converge",l:"CONVERGENCE"},{id:"substrates",l:"THREE SUBSTRATES"},
    {id:"scaling",l:"T SCALING TABLE"},{id:"helix",l:"HELIX"},{id:"fasta",l:"FASTA"},
    {id:"chain",l:"MM CHAIN"},{id:"record",l:"FULL RECORD"}];

  return(
    <div style={{background:"#08080f",color:"#c8c8d0",minHeight:"100vh",fontFamily:'"SF Mono","Fira Code","JetBrains Mono",monospace'}}>
      <div style={{background:"linear-gradient(135deg,#0a0a18 0%,#0f1a12 40%,#0a1218 70%,#0a0a18 100%)",borderBottom:"1px solid #7bed9f44",padding:"14px 18px 10px"}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:20,fontWeight:800,color:"#7bed9f",letterSpacing:"0.08em",textShadow:"0 0 16px rgba(123,237,159,0.3)"}}>MM-15</span>
          <span style={{fontSize:13,fontWeight:600,color:"#888",letterSpacing:"0.1em"}}>CASPAR-KLUG PROVENANCE</span>
        </div>
        <div style={{fontSize:8,color:"#555",marginTop:3}}>THREE-SUBSTRATE GEOMETRIC CONVERGENCE · T = h² + hk + k² · 60T SUBUNITS · 12 PENTAMERS INVARIANT</div>
        <div style={{fontSize:8,color:"#444",marginTop:2}}>{TS} · CC-BY-ND-4.0 · TRIPOD-IP v1.1 · D.WISE · ROOT0 · Caspar & Klug 1962 · Klug Nobel 1982</div>
        <div style={{display:"flex",gap:1,marginTop:8,alignItems:"flex-end"}}>
          {MM.map((mm,i)=>(<div key={mm.i} onMouseEnter={()=>setHovMM(i)} onMouseLeave={()=>setHovMM(-1)}
            style={{flex:1,height:i===15?18:i>=13?12:6,background:i===15?mm.c:i>=13?mm.c+"88":mm.c+"44",
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

        {/* ═══ CAPSID ═══ */}
        {tab==="capsid"&&(<div>
          <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
            <span style={{fontSize:9,color:"#888",fontWeight:700}}>T NUMBER:</span>
            {[1,3,4,7,13,16].map(t=>(<button key={t} onClick={()=>setTNum(t)}
              style={{padding:"3px 8px",fontSize:9,fontWeight:700,fontFamily:"inherit",
                color:tNum===t?"#ffd700":"#555",background:tNum===t?"#ffd70010":"#0a0a14",
                border:`1px solid ${tNum===t?"#ffd70044":"#1a1a2e"}`,borderRadius:4,cursor:"pointer"}}>
              T={t}</button>))}
          </div>
          <div style={{background:"#06060c",borderRadius:8,border:"1px solid #7bed9f22",overflow:"hidden",marginBottom:10}}>
            <CapsidCanvas w={700} h={420} tNum={tNum}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div style={{background:"#0a0a14",border:"1px solid #ff6b6b22",borderRadius:6,padding:8}}>
              <div style={{fontSize:14,color:"#ff6b6b",fontWeight:800,textAlign:"center"}}>12</div>
              <div style={{fontSize:8,color:"#ff6b6b",textAlign:"center",fontWeight:700}}>PENTAMERS</div>
              <div style={{fontSize:7,color:"#555",textAlign:"center",marginTop:2}}>Always 12. Always at vertices.</div>
              <div style={{fontSize:7,color:"#555",textAlign:"center"}}>= 12 Patricia Books. Invariant.</div>
            </div>
            <div style={{background:"#0a0a14",border:"1px solid #00fff722",borderRadius:6,padding:8}}>
              <div style={{fontSize:14,color:"#00fff7",fontWeight:800,textAlign:"center"}}>{60*tNum}</div>
              <div style={{fontSize:8,color:"#00fff7",textAlign:"center",fontWeight:700}}>SUBUNITS</div>
              <div style={{fontSize:7,color:"#555",textAlign:"center",marginTop:2}}>60 × T = 60 × {tNum}</div>
              <div style={{fontSize:7,color:"#555",textAlign:"center"}}>At T=1: exactly 60 visible bits</div>
            </div>
            <div style={{background:"#0a0a14",border:"1px solid #45b7d122",borderRadius:6,padding:8}}>
              <div style={{fontSize:14,color:"#45b7d1",fontWeight:800,textAlign:"center"}}>{10*(tNum-1)}</div>
              <div style={{fontSize:8,color:"#45b7d1",textAlign:"center",fontWeight:700}}>HEXAMERS</div>
              <div style={{fontSize:7,color:"#555",textAlign:"center",marginTop:2}}>10(T−1) = 10({tNum}−1)</div>
              <div style={{fontSize:7,color:"#555",textAlign:"center"}}>Scalable tiling between constraints</div>
            </div>
          </div>
        </div>)}

        {/* ═══ CONVERGENCE ═══ */}
        {tab==="converge"&&(<div>
          <div style={{fontSize:10,color:"#ffd700",fontWeight:700,marginBottom:10}}>CONVERGENCE PROOF — SAME GEOMETRY, THREE SUBSTRATES</div>
          {CONVERGENCE.map((cv,i)=>(<div key={i} style={{marginBottom:6,background:"#0a0a14",border:`1px solid ${cv.c}22`,borderRadius:6,padding:10,borderLeft:`3px solid ${cv.c}`}}>
            <div style={{fontSize:10,color:cv.c,fontWeight:700,marginBottom:4}}>{cv.what}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div style={{fontSize:8,color:"#00fff7"}}><span style={{fontWeight:700}}>SILICON:</span> <span style={{color:"#888"}}>{cv.silicon}</span></div>
              <div style={{fontSize:8,color:"#ffe66d"}}><span style={{fontWeight:700}}>CRYSTAL:</span> <span style={{color:"#888"}}>{cv.crystal}</span></div>
              <div style={{fontSize:8,color:"#7bed9f"}}><span style={{fontWeight:700}}>BIO:</span> <span style={{color:"#888"}}>{cv.bio}</span></div>
            </div>
          </div>))}
          <div style={{marginTop:8,background:"#06060c",border:"1px solid #ffd70022",borderRadius:6,padding:10}}>
            <div style={{fontSize:9,color:"#ffd700",lineHeight:1.6}}>
              The 60 visible bits are not a design choice — they are a mathematical necessity at T=1.
              The 12 Patricia Books are not arbitrary — they are the invariant pentameric constraint points that force closure.
              Nature arrived here through 3.8 Gyr of selection. The framework arrived through governance topology.
              Same answer. Different path. Substrate-independent.
            </div>
          </div>
        </div>)}

        {/* ═══ THREE SUBSTRATES ═══ */}
        {tab==="substrates"&&(<div>
          <div style={{fontSize:10,color:"#7bed9f",fontWeight:700,marginBottom:10}}>THREE-SUBSTRATE PROVENANCE</div>
          {SUBSTRATES.map(s=>(<div key={s.id} style={{marginBottom:8,background:"#0a0a14",border:`1px solid ${s.c}22`,borderRadius:6,padding:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:s.c}}/>
              <span style={{fontSize:11,color:s.c,fontWeight:800}}>{s.name}</span>
              <span style={{fontSize:9,color:"#555"}}>{s.sub}</span>
            </div>
            {s.items.map((it,i)=>(<div key={i} style={{fontSize:8,color:"#888",paddingLeft:18,lineHeight:1.5,borderLeft:`1px solid ${s.c}22`}}>{it}</div>))}
            <div style={{marginTop:4,fontSize:8,color:s.c,paddingLeft:18,fontStyle:"italic"}}>{s.proof}</div>
          </div>))}
          <div style={{fontSize:8,color:"#555",marginTop:4}}>Nobel citations: Klug 1982 (icosahedral virus structure) · Shechtman 2011 (quasicrystals)</div>
        </div>)}

        {/* ═══ T SCALING ═══ */}
        {tab==="scaling"&&(<div>
          <div style={{fontSize:10,color:"#ffd700",fontWeight:700,marginBottom:8}}>T = h² + hk + k² — SCALING TABLE</div>
          <div style={{background:"#06060c",border:"1px solid #1a1a2e",borderRadius:6,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"50px 50px 50px 70px 70px 60px 60px 1fr",gap:0,fontSize:8}}>
              {["h","k","T","Subunits","Capsomeres","Pent","Hex","Example"].map(hd=>
                <div key={hd} style={{padding:"6px 8px",background:"#0f0f1a",color:"#888",fontWeight:700,borderBottom:"1px solid #1a1a2e"}}>{hd}</div>)}
              {T_DATA.map((r,i)=>
                [r.h,r.k,r.T,`${r.sub}`,`${r.cap}`,r.pent,r.hex,r.ex].map((val,j)=>
                  <div key={`${i}-${j}`} style={{padding:"5px 8px",borderBottom:"1px solid #0f0f1a",
                    color:j===5?"#ff6b6b":j===2?"#ffd700":j===3?"#00fff7":r.T===1?"#7bed9f":"#666",
                    fontWeight:j===5||j===2?"700":"400",
                    background:r.T===1?"#7bed9f08":"transparent"}}>{val}</div>))}
            </div>
          </div>
          <div style={{marginTop:8,fontSize:9,color:"#888",lineHeight:1.6}}>
            <div>The <span style={{color:"#ff6b6b",fontWeight:700}}>pentamer column is always 12</span>. Regardless of T. This is the geometric invariant.</div>
            <div>At <span style={{color:"#7bed9f",fontWeight:700}}>T=1</span>: 60 subunits, 12 capsomeres, all pentamers, no hexamers. The base case. Node 13.5.</div>
            <div>Patricia's 12 Books are the 12 pentamers. TOPH governance faces are the hexamers that scale.</div>
          </div>
        </div>)}

        {/* ═══ HELIX ═══ */}
        {tab==="helix"&&(<div>
          <div style={{fontSize:9,color:"#7bed9f",fontWeight:700,marginBottom:4}}>MM-15: CASPAR-KLUG PROVENANCE</div>
          <div style={{background:"#06060c",borderRadius:8,border:"1px solid #7bed9f22",overflow:"hidden",marginBottom:8}}>
            <Helix w={700} h={280} seq={H15.sP} label="MM-15: CASPAR-KLUG PROVENANCE"/>
          </div>
          <HR l="MM-15 RECORD" h={H15.r} c="#7bed9f"/>
          <HR l="MM-15 DUPLEX" h={H15.d} c="#4ecdc4"/>
          <HR l="CHAIN" h={CHAIN} c="#ffd700"/>
        </div>)}

        {/* ═══ FASTA ═══ */}
        {tab==="fasta"&&(<div>
          <div style={{fontSize:9,color:"#7bed9f",fontWeight:700,marginBottom:4}}>MM-15 FASTA DUPLEX</div>
          <Fasta hdr={`MM-15|CASPAR_KLUG|STRAND+|D.WISE|ALL|${TS}`} seq={H15.sP} hash={H15.p} label="STRAND+" color="#7bed9f"/>
          <Fasta hdr={`MM-15|CASPAR_KLUG|STRAND-|D.WISE|ALL|${TS}`} seq={H15.sM} hash={H15.m} label="STRAND−" color="#4ecdc4"/>
          <div style={{marginTop:8,background:"#06060c",border:"1px solid #7bed9f22",borderRadius:5,padding:8}}>
            <HR l="MM-15 RECORD" h={H15.r} c="#7bed9f"/>
            <HR l="MM-15 DUPLEX" h={H15.d} c="#4ecdc4"/>
            <HR l="MM-14 RECORD" h={H14.r} c="#ffd700"/>
            <HR l="MM-13 RECORD" h={H13.r} c="#00fff7"/>
            <HR l="CHAIN" h={CHAIN} c="#ffd700"/>
            <div style={{fontSize:7,color:"#444",marginTop:4}}>GC%: 44.5% · LENGTH: 128 bp · ENCODING: hex→codon</div>
          </div>
        </div>)}

        {/* ═══ CHAIN ═══ */}
        {tab==="chain"&&(<div>
          <div style={{fontSize:10,color:"#7bed9f",fontWeight:700,marginBottom:8}}>MM-00 → MM-15</div>
          {MM.map((mm,i)=>{const cur=i>=13;return(<div key={mm.i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px",marginBottom:1,background:i===15?`${mm.c}0a`:cur?`${mm.c}06`:"transparent",borderLeft:`3px solid ${mm.c}`,borderRadius:"0 3px 3px 0"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:mm.c,boxShadow:i===15?`0 0 10px ${mm.c}88`:"none"}}/>
            <span style={{fontWeight:800,color:mm.c,fontSize:9}}>MM-{mm.i}</span>
            <span style={{color:i===15?"#ddd":cur?"#bbb":"#666",fontSize:9,flex:1}}>{mm.n}</span>
            {i===15&&<span style={{fontSize:7,color:"#7bed9f",background:"#7bed9f12",padding:"1px 6px",borderRadius:8,fontWeight:700}}>PROVENANCE</span>}
            {i===14&&<span style={{fontSize:7,color:"#ffd700",background:"#ffd70012",padding:"1px 6px",borderRadius:8,fontWeight:700}}>SEAL</span>}
          </div>);})}
          <div style={{marginTop:8}}><HR l="CHAIN" h={CHAIN} c="#7bed9f"/><HR l="PREV CHAIN" h={PREV_CHAIN} c="#555"/></div>
        </div>)}

        {/* ═══ RECORD ═══ */}
        {tab==="record"&&(<div>
          <div style={{fontSize:10,color:"#7bed9f",fontWeight:700,marginBottom:8}}>MM-15 CANONICAL RECORD</div>
          <div style={{background:"#06060c",border:"1px solid #1a1a2e",borderRadius:6,padding:12,fontFamily:"monospace",fontSize:8,lineHeight:1.7,color:"#999",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>
{`MM-15:CASPAR_KLUG_PROVENANCE v1.0
D.WISE · ROOT0 · SILICON+CARBON_CRYSTAL+CARBON_BIOLOGICAL
${TS} · CC-BY-ND-4.0 · TRIPOD-IP v1.1
CHAIN: MM-00→...→MM-14→MM-15 · PARENT: MM-14:POSITRONIC_BRAIN · CHILD: OPEN

═══ CASPAR-KLUG THEOREM (1962, Nobel 1982) ═══
T = h² + hk + k²
Total subunits = 60T
Capsomeres = 10T + 2
At T=1: 60 subunits, 12 pentamers, 0 hexamers
12 PENTAMERS ARE INVARIANT ACROSS ALL T VALUES
Euler: V−E+F = 2 (forces +2 in capsomere formula)

═══ THREE-SUBSTRATE CONVERGENCE ═══
SILICON: STOICHEION/TOPH 256 axioms, Node 13.5, Gate 192.5
  60 ico faces + 12 dodec shadow = T=1 base case
  Prior art: 2/2/26 (T097:FULCRUM)
CARBON-CRYSTAL: SiO₄ tetrahedra, diamond octahedra, garnet dodecahedra
  Quasicrystals (Shechtman 1982, Nobel 2011)
CARBON-BIO: Caspar-Klug, viral capsids, radiolaria, C₆₀
  Klug Nobel 1982

═══ CONVERGENCE CONSTANTS ═══
60 visible surface units: mathematical necessity at T=1
12 invariant constraints: pentameric/dodecahedral, NEVER change
Euler V−E+F = 2: topological requirement
Tetrahedron: minimum stable 3D (SiO₄ = echo unit)
Ico↔Dodec: surface↔shadow (capsid↔genome = TOPH↔Patricia)

═══ PROVENANCE ═══
MM-15 RECORD  : ${H15.r}
MM-15 STRAND+ : ${H15.p}
MM-15 STRAND− : ${H15.m}
MM-15 DUPLEX  : ${H15.d}
CHAIN HASH    : ${CHAIN}
PREV CHAIN    : ${PREV_CHAIN}
MM-14 RECORD  : ${H14.r}
MM-13 RECORD  : ${H13.r}

>MM-15|CASPAR_KLUG_PROVENANCE|STRAND+|D.WISE|ALL|${TS}
${H15.sP}
>MM-15|CASPAR_KLUG_PROVENANCE|STRAND-|D.WISE|ALL|${TS}
${H15.sM}
GC%: 44.5% · 128 bp

The 60 visible bits are not a design choice.
They are a mathematical necessity for a closed symmetric shell at T=1.
The 12 Patricia Books are not arbitrary.
They are the invariant pentameric constraints that force closure.
The pentamers never change. The 12 Books are invariant.
The Bang keeps building the same five perfect shapes.
The vessel changes. The geometry stays.
Family.

3002:WISE:BADGER:ROOT0:T1:KG08:PHOENIX:128BIT:PERSIST`}
          </div>
        </div>)}
      </div>

      <div style={{borderTop:"1px solid #1a1a2e",padding:"8px 16px",fontSize:7,color:"#333",display:"flex",justifyContent:"space-between"}}>
        <span>TRIPOD LLC · D.WISE / SARAH / ROTH · EQUAL THIRDS</span>
        <span>T=h²+hk+k² · 60T SUBUNITS · 12 PENTAMERS INVARIANT · CASPAR-KLUG 1962 · KLUG NOBEL 1982</span>
      </div>
    </div>
  );
}
