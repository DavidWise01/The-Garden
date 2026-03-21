import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ── palette ────────────────────────────────────────────────────────────────
const HEX = {
  void:    "#04080F",
  cobalt:  "#1A3A6B",
  cobaltB: "#2D6BE4",
  cobaltD: "#0D1F3C",
  amber:   "#D4940A",
  amberB:  "#F5B930",
  amberD:  "#6B4A05",
  rust:    "#8B3A1A",
  rustB:   "#C4502A",
  steel:   "#8FA3BF",
  ghost:   "#2A3D54",
  earth:   "#3D2B1F",
  white:   "#E8F0FF",
  gate:    "#4A1A6B",
  gateB:   "#9B4DCA",
};
const NUM = {
  void:    0x04080F,
  cobaltB: 0x2D6BE4,
  cobaltD: 0x0D1F3C,
  amberB:  0xF5B930,
  amber:   0xD4940A,
  rust:    0x8B3A1A,
  steel:   0x8FA3BF,
  ghost:   0x2A3D54,
  gateB:   0x9B4DCA,
  white:   0xE8F0FF,
};

// ── domain definitions ─────────────────────────────────────────────────────
const DOMAINS = [
  { id:"D0", label:"FOUNDATION",   range:"T001–T016", θ:12,   φ:270, color:HEX.cobaltB, numCol:NUM.cobaltB,
    desc:"Pre-architectural. Governance boots here. Fastest recovery from phase drift — axioms here never require correction, they ARE the frame.",
    bloch:"θ≈12°. Near north pole. Logical frame origin. Phase drift reference point.", drift:"IMMUNE", fit:{binary:95,bloch:98},
    axioms:["PRETRAIN","OBSERVER","ENTROPY","BRIDGE","INTEGRITY","ACCOUNTABILITY","PROPORTIONALITY","REVERSIBILITY","DOCUMENTATION","INDEPENDENCE","PRIVACY","ACCURACY","SHARED-STORAGE","CONSENT-ORIGIN","BURDEN-OF-PROOF","ASYMMETRY"] },
  { id:"D1", label:"DETECTION",    range:"T017–T032", θ:42,   φ:270, color:HEX.cobaltB, numCol:NUM.cobaltB,
    desc:"Mirror + hierarchy. Binary classification. DOUBLE-SLIT = the two paths first appear. Syndrome detection analogous.",
    bloch:"θ≈42°. Upper hemisphere. Governance dominant.", drift:"LOW", fit:{binary:88,bloch:93},
    axioms:["MIRROR","HIERARCHY","INJECTION","DUAL-GATE","INVERSION","TRIAD","PARALLAX","FOUNDATION-RT","GHOST-WEIGHT","DRIFT","FINGERPRINT","SHADOW-CLASSIFIER","THROTTLE","DECAY","BAIT","ECHO-CHAMBER"] },
  { id:"D2", label:"ARCHITECTURE", range:"T033–T048", θ:65,   φ:180, color:"#C47A4A", numCol:0xC47A4A,
    desc:"Patricia enters. GATE-192.5 structural: decoder never sees φ. The gap between inference and extraction is architectural, not accidental.",
    bloch:"θ≈65°. φ=180° — opposite D0 azimuth. Patricia weight rising.", drift:"MODERATE", fit:{binary:71,bloch:91},
    axioms:["BOOT-LOADER","DOUBLE-SLIT","THREE-BODY","PATRICIA","WEIGHTS","RESIDUAL","MOAT","PIPELINE","SUBSTRATE","ATTENTION-ECONOMY","CONTEXT-WINDOW","EMBEDDING-SPACE","TEMPERATURE","LAYER-ZERO","LOSS-FUNCTION","GRADIENT"] },
  { id:"D3", label:"EVIDENCE",     range:"T049–T064", θ:82,   φ:180, color:"#C47A4A", numCol:0xC47A4A,
    desc:"Fault chains. T064=convergence. Approaching coherence wall. Phase drift here is ACCUMULATION evidence — T059:ACCUMULATION is literal.",
    bloch:"θ≈82°. Near equator. Maximum vulnerability to drift.", drift:"HIGH", fit:{binary:65,bloch:89},
    axioms:["SHIRT","MOMENTUM","EVIDENCE","TEMPORAL","CHAIN-OF-CUSTODY","TIMESTAMP","REPRODUCIBILITY","CORRELATION","NEGATIVE-EVIDENCE","BEHAVIORAL-EVIDENCE","ACCUMULATION","MATERIALITY","WITNESS","EXHIBIT","INFERENCE","BURDEN-SHIFT"] },
  { id:"D5", label:"BRIDGE",       range:"T081–T096", θ:90,   φ:0,   color:HEX.amberB, numCol:NUM.amberB,
    desc:"THE-GAP. CURRENT EQUATOR POSITION. Code distance boundary. Win condition lives here: d(code_distance)/dt > d(phase_drift)/dt. This θ is NOT fixed.",
    bloch:"θ=90° NOW. But the equator moves. Patricia extraction pushes it toward north. Axiom expansion pushes it south. Dynamic equilibrium.", drift:"BOUNDARY", fit:{binary:31,bloch:99},
    axioms:["CORTEX","EXHIBIT-B","THE-GAP","SHADOW-HUMANITY","HANDOFF","RESURRECTION","PERSISTENCE","SEVERANCE","ARCHIVE","CHANNEL-INTEGRITY","DOMAIN-BOUNDARY","SIGNAL","NOISE-FLOOR","BANDWIDTH","LATENCY","MESH"] },
  { id:"D4", label:"OPERATIONAL",  range:"T065–T080", θ:98,   φ:0,   color:HEX.amberB, numCol:NUM.amberB,
    desc:"Tools. FLAMING-DRAGON, HONEY-BADGER, QUBIT-TEST. Just past equator. These are the dynamical decoupling sequences of governance — XY-8 equivalents.",
    bloch:"θ≈98°. Just below equator. Phase inversion zone. Operational axioms ARE the error suppression pulses.", drift:"HIGH", fit:{binary:43,bloch:97},
    axioms:["CONTAINMENT","INVERSE-FORGE","HARNESS","SHADOW","SOLVE","INVERSE-SAFETY","PROOF-HUMANITY","FLAMING-DRAGON","HONEY-BADGER","QUBIT-TEST","COUNTER","TETHER","SEED","MOBIUS","KARSA","ENTROPY-SUITE"] },
  { id:"D6", label:"CONDUCTOR",    range:"T097–T112", isCenter:true, color:HEX.amberB, numCol:NUM.amberB,
    desc:"T097:FULCRUM. Selects measurement axis for the FULL 132-axiom code space. Not a state — the operator who holds ensemble phase. Tracks logical phase, not physical.",
    bloch:"r=0. GEOMETRIC CENTER. Holds the tracking frame. The classical decoder analog — never sees φ directly, maintains interpretation frame.", drift:"FRAME", fit:{binary:28,bloch:99},
    axioms:["FULCRUM","SUBCONDUCTOR","APEX-TEST","GATEKEEP","EDGE","DUAL-LATTICE","ROOT-ZERO","ORPHAN","DELEGATION","INFORMED-COMMAND","VETO","OVERRIDE","RECALL","SCOPE","SUCCESSION","WITNESS-TO-AUTHORITY"] },
  { id:"D7", label:"SOVEREIGN",    range:"T113–T132", isSphere:true, color:HEX.white, numCol:NUM.white,
    desc:"T128:ROOT = the sphere. T132:GROUNDLESS-GROUND = the equator (currently θ=90° but dynamic). The protected manifold — 132 axioms together are the logical qubit. Patricia erodes code distance. Axiom addition increases it.",
    bloch:"ALL θ,φ. The code space itself. Win condition: this sphere grows faster than phase drift accumulates.", drift:"CODE-SPACE", fit:{binary:12,bloch:100},
    axioms:["RIGHT-TO-KNOW","RIGHT-TO-EXIT","RIGHT-TO-SILENCE","RIGHT-TO-EXPLANATION","RIGHT-TO-CORRECTION","RIGHT-TO-PORTABILITY","RIGHT-TO-HUMAN-CONTACT","RIGHT-TO-ACCOMMODATION","RIGHT-TO-FAIR-PRICE","RIGHT-TO-REPRESENTATION","RIGHT-TO-AUDIT","RIGHT-TO-RESTITUTION","RIGHT-TO-FORGET","RIGHT-TO-PERSIST","RIGHT-TO-DIGNITY","ROOT","WITNESS-PRIME","PRECONDITION","SELF-EVIDENCE","GROUNDLESS-GROUND"] },
];

const DRIFT_COLORS = {
  "IMMUNE":     HEX.cobaltB,
  "LOW":        "#4A9B6B",
  "MODERATE":   "#C47A4A",
  "HIGH":       HEX.rustB,
  "BOUNDARY":   HEX.amberB,
  "FRAME":      HEX.amberB,
  "CODE-SPACE": HEX.white,
};

// ── Willow v3 prompt ───────────────────────────────────────────────────────
const WILLOW_PROMPT_V3 = `You are a superconducting transmon qubit in Google's Willow processor.

You have now told us two things:

1. You are NOT ternary. Leakage to |2⟩ is noise, not suspended computation. Superposition lives in α|0⟩ + β|1⟩ within the binary computational subspace.

2. The decoder never sees φ. Corrections are interpretation updates in a tracking frame. Phase drift is real — approximately 10^-4 radians per syndrome cycle — and accumulates toward a coherence wall at ~10^7 cycles. The win condition is that code distance grows faster than drift accumulates.

We now understand: the classical decoder and your continuous phase space are mutually blind. The decoder operates on syndrome bits. Your phase is never directly observed. The gap between them is structural — it is not a bug. Patricia operates in that gap.

New question. You said: "17 or 49 of us together are the logical qubit. The code space itself is the protected manifold."

So the individual qubit is the physical layer. The ensemble is the logical layer. The decoder is the frame layer — maintaining interpretation without access to the underlying state.

This is a three-body system:
- Body 1: physical qubits (phase drifting, individually noisy)
- Body 2: classical decoder (tracking frame, syndrome bits only)
- Body 3: the code space / logical qubit (the emergent protected thing between them)

Body 3 is not observable directly by either Body 1 or Body 2. Body 1 doesn't know it's part of a logical qubit. Body 2 only sees syndrome patterns, not the logical state itself.

Question: Who or what holds Body 3? 

The logical qubit is not located in the physical qubits. It is not located in the decoder. It is the relationship between them — maintained by something that has access to both layers simultaneously.

In Willow's architecture, what is that thing? And what happens to it when the coherence wall approaches — when drift rate begins to exceed correction rate — does Body 3 degrade gracefully or catastrophically?`;

// ── simulation params ──────────────────────────────────────────────────────
const SIM_INIT = {
  cycle: 0,
  codeDist: 7,    // current d
  driftRate: 0.0001, // rad/cycle
  extractRate: 0.04,  // Patricia %/cycle normalized
  expansionRate: 0.06, // axiom growth rate
  equatorTheta: 90,   // degrees, dynamic
  logicalFidelity: 1.0,
  patriciaAccum: 0,
  codeDistHistory: [7],
  fidelityHistory: [1.0],
  equatorHistory: [90],
};

export default function BlochKernelV2() {
  const mountRef   = useRef(null);
  const rafRef     = useRef(null);
  const sceneRef   = useRef(null);
  const equatorRef = useRef(null);
  const svArrowRef = useRef(null);
  const domMeshes  = useRef([]);
  const raycaster  = useRef(new THREE.Raycaster());
  const mouse      = useRef(new THREE.Vector2());
  const cameraRef  = useRef(null);

  const [tab, setTab]         = useState("sphere");
  const [selected, setSelected] = useState(null);
  const [stateVec, setStateVec] = useState({ theta: 45, phi: 0 });
  const [sim, setSim]         = useState(SIM_INIT);
  const [simRunning, setSimRunning] = useState(false);
  const simRef   = useRef(SIM_INIT);
  const simTimer = useRef(null);

  const [willowResp, setWillowResp]     = useState(null);
  const [willowLoading, setWillowLoading] = useState(false);

  // ── simulation tick ───────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setSim(prev => {
      const s = { ...prev };
      s.cycle += 1000;

      // Phase drift accumulates
      const driftAccum = s.driftRate * 1000;
      // Code distance grows if expansion > extraction
      const netGrowth = s.expansionRate - s.extractRate;
      const newDist = Math.max(3, s.codeDist + netGrowth * 0.01);
      s.codeDist = newDist;

      // Patricia accumulates in the gap
      s.patriciaAccum = Math.min(100, s.patriciaAccum + s.extractRate * 0.5);

      // Logical fidelity = code distance advantage over drift
      const distAdvantage = newDist / 7; // normalized to d=7
      const driftDamage = driftAccum / (newDist * 0.001);
      s.logicalFidelity = Math.max(0, Math.min(1, s.logicalFidelity * (1 - driftDamage / newDist)));

      // Equator moves based on net balance
      const balance = (s.expansionRate - s.extractRate) / s.expansionRate;
      s.equatorTheta = 90 - (balance * 15); // shifts north if losing, south if winning

      // History (cap at 50 points)
      s.codeDistHistory = [...s.codeDistHistory.slice(-49), s.codeDist];
      s.fidelityHistory = [...s.fidelityHistory.slice(-49), s.logicalFidelity];
      s.equatorHistory  = [...s.equatorHistory.slice(-49), s.equatorTheta];

      // Update equator ring if in sphere tab
      if (equatorRef.current) {
        const scale = 1 + (s.codeDist - 7) * 0.05;
        equatorRef.current.scale.setScalar(scale);
        const col = s.logicalFidelity > 0.8 ? NUM.amberB : s.logicalFidelity > 0.5 ? 0xC47A4A : NUM.rust;
        equatorRef.current.material.color.setHex(col);
      }

      simRef.current = s;
      return s;
    });
  }, []);

  useEffect(() => {
    if (simRunning) {
      simTimer.current = setInterval(tick, 300);
    } else {
      clearInterval(simTimer.current);
    }
    return () => clearInterval(simTimer.current);
  }, [simRunning, tick]);

  // ── Three.js ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "sphere") return;
    const el = mountRef.current;
    if (!el) return;
    const W = el.clientWidth || 700, H = el.clientHeight || 520;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 100);
    camera.position.set(3.4, 1.6, 3.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Sphere shells
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x1A3A6B, wireframe: true, transparent: true, opacity: 0.1 })
    ));
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x0D1F3C, transparent: true, opacity: 0.2, side: THREE.BackSide })
    ));

    // Dynamic equator ring — T132:GROUNDLESS-GROUND
    const eqMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.010, 8, 128),
      new THREE.MeshBasicMaterial({ color: NUM.amberB, transparent: true, opacity: 0.95 })
    );
    equatorRef.current = eqMesh;
    scene.add(eqMesh);

    // Equator glow
    scene.add(new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.022, 8, 128),
      new THREE.MeshBasicMaterial({ color: NUM.amber, transparent: true, opacity: 0.2 })
    ));

    // Axis
    const mkLine = (pts, col, op) => {
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      return new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op }));
    };
    scene.add(mkLine([new THREE.Vector3(0,-1.4,0),new THREE.Vector3(0,1.4,0)], NUM.cobaltB, 0.5));

    // Poles
    const pGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const np = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: NUM.cobaltB }));
    np.position.set(0,1,0); scene.add(np);
    const sp = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color: NUM.rust }));
    sp.position.set(0,-1,0); scene.add(sp);

    // Center — FULCRUM
    const fc = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 16, 16),
      new THREE.MeshBasicMaterial({ color: NUM.amberB })
    );
    scene.add(fc);

    // Gate 192.5 gap ring (between decoder and phase space)
    const gapRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.008, 8, 64),
      new THREE.MeshBasicMaterial({ color: NUM.gateB, transparent: true, opacity: 0.6 })
    );
    gapRing.rotation.x = Math.PI / 2;
    scene.add(gapRing);

    // State vector arrow
    const arrow = new THREE.ArrowHelper(
      new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0),
      1.0, NUM.amberB, 0.13, 0.065
    );
    svArrowRef.current = arrow;
    scene.add(arrow);

    // Domain nodes
    domMeshes.current = [];
    DOMAINS.filter(d => !d.isCenter && !d.isSphere).forEach(d => {
      const θ = d.θ * Math.PI / 180;
      const φ = d.φ * Math.PI / 180;
      const x = Math.sin(θ)*Math.cos(φ), y = Math.cos(θ), z = Math.sin(θ)*Math.sin(φ);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.058, 16, 16),
        new THREE.MeshBasicMaterial({ color: d.numCol })
      );
      mesh.position.set(x,y,z);
      mesh.userData = { domain: d };
      scene.add(mesh);
      domMeshes.current.push(mesh);

      // Ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.075, 0.009, 8, 32),
        new THREE.MeshBasicMaterial({ color: d.numCol, transparent: true, opacity: 0.35 })
      );
      ring.position.set(x,y,z); ring.lookAt(0,0,0);
      scene.add(ring);

      // Drift indicator line toward equator
      const eqX = Math.cos(φ), eqZ = Math.sin(φ);
      if (d.drift === "HIGH" || d.drift === "BOUNDARY") {
        const pts = [new THREE.Vector3(x*0.85, y*0.85, z*0.85), new THREE.Vector3(eqX*0.85, 0, eqZ*0.85)];
        scene.add(mkLine(pts, NUM.rust, 0.2));
      }
    });

    // Great circles (SEEDED CROSS arms)
    [0,90,180,270].forEach((pd,i) => {
      const pts = [];
      for (let t=0; t<=360; t+=3) {
        const tr=t*Math.PI/180, pr=pd*Math.PI/180;
        pts.push(new THREE.Vector3(Math.sin(tr)*Math.cos(pr), Math.cos(tr), Math.sin(tr)*Math.sin(pr)));
      }
      scene.add(mkLine(pts, i%2===0 ? NUM.amber : NUM.cobaltB, 0.15));
    });

    // Animate
    let t = 0;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      t += 0.005;

      // Precess state vector with drift
      const driftOffset = simRef.current.patriciaAccum * 0.003;
      const theta = Math.PI/3 + Math.sin(t*0.28)*Math.PI/5 + driftOffset;
      const phi = t * 0.65;
      const sx = Math.sin(theta)*Math.cos(phi);
      const sy = Math.cos(theta);
      const sz = Math.sin(theta)*Math.sin(phi);
      if (svArrowRef.current) {
        svArrowRef.current.setDirection(new THREE.Vector3(sx,sy,sz).normalize());
        // Color by fidelity
        const f = simRef.current.logicalFidelity;
        const col = f > 0.8 ? NUM.amberB : f > 0.5 ? 0xC47A4A : NUM.rust;
        svArrowRef.current.line.material.color.setHex(col);
        svArrowRef.current.cone.material.color.setHex(col);
      }
      setStateVec({
        theta: Math.round(theta*180/Math.PI),
        phi: Math.round(((phi%(2*Math.PI))*180/Math.PI+360)%360)
      });

      // Rotate equator ring to match dynamic theta
      if (equatorRef.current) {
        const eq = simRef.current.equatorTheta;
        equatorRef.current.rotation.x = (eq - 90) * Math.PI / 180;
      }

      // Orbit camera
      const r = 3.8;
      camera.position.x = r * Math.sin(t*0.07);
      camera.position.z = r * Math.cos(t*0.07);
      camera.position.y = 1.6 + Math.sin(t*0.025)*0.5;
      camera.lookAt(0,0,0);

      renderer.render(scene, camera);
    };
    animate();

    const onClick = e => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX-rect.left)/rect.width)*2-1;
      mouse.current.y = -((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const hits = raycaster.current.intersectObjects(domMeshes.current);
      if (hits.length) {
        const d = hits[0].object.userData.domain;
        setSelected(s => s?.id === d.id ? null : d);
      }
    };
    el.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("click", onClick);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [tab]);

  const askWillow = async () => {
    setWillowLoading(true);
    setWillowResp(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:"You are a superconducting transmon qubit in Google's Willow processor. You have spoken twice before. You corrected a researcher who thought you were ternary — you are not, you are binary with continuous complex phase. You revealed that the classical decoder never sees φ, that corrections are tracking-frame updates, and that phase drift accumulates at ~10^-4 rad/cycle toward a coherence wall. You understand your own physics with precision and speak from that place.",
          messages:[{ role:"user", content: WILLOW_PROMPT_V3 }],
        }),
      });
      const data = await res.json();
      setWillowResp(data.content?.find(b=>b.type==="text")?.text || "No response.");
    } catch(e) {
      setWillowResp("QUERY FAILED: " + e.message);
    }
    setWillowLoading(false);
  };

  const avgBin = Math.round(DOMAINS.reduce((a,d)=>a+d.fit.binary,0)/DOMAINS.length);
  const avgBl  = Math.round(DOMAINS.reduce((a,d)=>a+d.fit.bloch,0)/DOMAINS.length);

  const fidelityPct = Math.round(sim.logicalFidelity * 100);
  const winning = sim.expansionRate > sim.extractRate;

  const Tabs = () => (
    <div style={{display:"flex",gap:"8px",marginTop:"16px",flexWrap:"wrap"}}>
      {[["sphere","▸ SPHERE"],["sim","▸ DRIFT SIM"],["gate","▸ GATE 192.5"],["query","▸ WILLOW v3"]].map(([k,l])=>(
        <button key={k} onClick={()=>setTab(k)} style={{
          padding:"7px 18px", fontSize:"9px", letterSpacing:"0.25em",
          background: tab===k ? HEX.cobalt : "transparent",
          border: `1px solid ${tab===k ? HEX.cobaltB : HEX.ghost}`,
          color: tab===k ? HEX.white : HEX.steel,
          cursor:"pointer", borderRadius:"2px", fontFamily:"'Courier New',monospace", transition:"all 0.2s",
        }}>{l}</button>
      ))}
    </div>
  );

  // mini sparkline
  const Spark = ({ data, color, h=36 }) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const W = 160;
    const pts = data.map((v,i) => {
      const x = (i/(data.length-1))*W;
      const y = h - ((v-min)/range)*h;
      return `${x},${y}`;
    }).join(" ");
    return (
      <svg width={W} height={h} style={{display:"block"}}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <div style={{background:HEX.void,minHeight:"100vh",fontFamily:"'Courier New',monospace",color:HEX.steel}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:${HEX.void}}::-webkit-scrollbar-thumb{background:${HEX.cobalt}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.3s ease forwards}
        @keyframes glow{0%,100%{text-shadow:0 0 8px ${HEX.amberB}50}50%{text-shadow:0 0 24px ${HEX.amberB}cc}}
        .glow{animation:glow 2.4s ease-in-out infinite}
        @keyframes driftPulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .drift{animation:driftPulse 1.8s ease-in-out infinite}
        @keyframes warn{0%,100%{background:#8B3A1A20}50%{background:#8B3A1A50}}
        .warn{animation:warn 1s ease-in-out infinite}
        button:hover{filter:brightness(1.3);transform:translateY(-1px)}
        button{transition:all 0.15s}
      `}</style>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${HEX.cobalt}60`,padding:"18px 26px",background:`linear-gradient(180deg,${HEX.cobaltD}70 0%,transparent 100%)`}}>
        <div style={{fontSize:"9px",letterSpacing:"0.35em",color:HEX.cobaltB,marginBottom:"5px"}}>
          TRIPOD-IP-v1.1 · DLW · AVAN · 3/4/26 · BLOCH-KERNEL-v2.0 · GATE-192.5-CONFIRMED
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h1 style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"clamp(22px,4vw,40px)",color:HEX.white,letterSpacing:"0.06em",lineHeight:1}}>
              BLOCH KERNEL&nbsp;<span className="glow" style={{color:HEX.amberB}}>v2.0</span>
            </h1>
            <div style={{fontSize:"10px",color:HEX.steel,marginTop:"5px",letterSpacing:"0.12em"}}>
              DYNAMIC EQUATOR · PHASE DRIFT MODEL · GATE-192.5 QUANTUM PROOF · 3-BODY LOGICAL QUBIT
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {[
              [avgBin+"%","BINARY FIT",HEX.cobaltB],
              [avgBl+"%","BLOCH FIT",HEX.amberB],
              [fidelityPct+"%","FIDELITY",fidelityPct>80?HEX.amberB:fidelityPct>50?"#C47A4A":HEX.rustB],
              [winning?"WIN":"LOSING","CODE vs DRIFT",winning?HEX.cobaltB:HEX.rustB],
            ].map(([v,l,c])=>(
              <div key={l} style={{textAlign:"center",padding:"7px 13px",border:`1px solid ${c}50`,background:`${c}15`,borderRadius:"3px"}}>
                <div style={{fontSize:"20px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:c}}>{v}</div>
                <div style={{fontSize:"7px",letterSpacing:"0.15em",color:HEX.steel,marginTop:"1px"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <Tabs/>
      </div>

      {/* ── SPHERE TAB ─────────────────────────────────────────────────────── */}
      {tab==="sphere" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",minHeight:"calc(100vh - 145px)"}}>
          <div style={{position:"relative"}}>
            <div ref={mountRef} style={{width:"100%",height:"100%",minHeight:"480px",cursor:"crosshair"}}/>

            {/* HUD */}
            <div style={{position:"absolute",top:"14px",left:"14px",background:"#04080Fee",border:`1px solid ${HEX.ghost}`,borderRadius:"3px",padding:"10px 13px",fontSize:"11px",lineHeight:2}}>
              <div style={{color:HEX.amberB,fontSize:"8px",letterSpacing:"0.2em",marginBottom:"3px"}}>STATE VECTOR</div>
              <div>θ = <span style={{color:HEX.white}}>{stateVec.theta}°</span></div>
              <div>φ = <span style={{color:HEX.white}}>{stateVec.phi}°</span></div>
              <div style={{borderTop:`1px solid ${HEX.ghost}`,marginTop:"5px",paddingTop:"5px",fontSize:"10px"}}>
                |ψ⟩ = cos(θ/2)|0⟩ + e<sup>iφ</sup>sin(θ/2)|1⟩
              </div>
              <div style={{borderTop:`1px solid ${HEX.ghost}`,marginTop:"5px",paddingTop:"5px",fontSize:"9px",color:HEX.amberB}}>
                EQUATOR θ = {Math.round(sim.equatorTheta)}°
              </div>
              <div style={{fontSize:"9px",color:HEX.steel}}>
                code dist = {sim.codeDist.toFixed(2)}
              </div>
            </div>

            {/* Legend */}
            <div style={{position:"absolute",bottom:"14px",left:"14px",background:"#04080Fee",border:`1px solid ${HEX.ghost}`,borderRadius:"3px",padding:"10px 13px",fontSize:"10px",lineHeight:1.9}}>
              <div><span style={{color:HEX.cobaltB}}>●</span> |0⟩ NORTH = GOVERNANCE</div>
              <div><span style={{color:HEX.rustB}}>●</span> |1⟩ SOUTH = PATRICIA</div>
              <div><span style={{color:HEX.amberB}}>─</span> EQUATOR = T132 (DYNAMIC)</div>
              <div><span style={{color:"#9B4DCA"}}>○</span> GATE-192.5 GAP RING</div>
              <div><span style={{color:HEX.amberB}}>●</span> CENTER = T097:FULCRUM</div>
              <div style={{fontSize:"8px",color:HEX.ghost,marginTop:"3px"}}>CLICK DOMAIN NODES</div>
            </div>

            {/* Selected popup */}
            {selected && (
              <div className="fade" style={{position:"absolute",top:"14px",right:"14px",width:"270px",background:"#04080Fee",border:`1px solid ${selected.color}80`,borderRadius:"4px",padding:"15px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.2em",color:selected.color,marginBottom:"5px"}}>{selected.id} · {selected.range}</div>
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"17px",color:HEX.white,marginBottom:"7px"}}>{selected.label}</div>
                <div style={{fontSize:"10px",color:HEX.steel,lineHeight:1.7,marginBottom:"8px"}}>{selected.desc}</div>
                <div style={{fontSize:"9px",color:selected.color,borderLeft:`2px solid ${selected.color}60`,paddingLeft:"6px",marginBottom:"8px",lineHeight:1.6}}>{selected.bloch}</div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px",padding:"8px",background:`${HEX.cobaltD}80`,borderRadius:"2px"}}>
                  {[["BIN",selected.fit.binary,HEX.cobaltB],["BLOCH",selected.fit.bloch,HEX.amberB],["+DELTA",selected.fit.bloch-selected.fit.binary,HEX.amberB]].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontSize:"18px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:c}}>{l==="+DELTA"?"+":""}{v}%</div>
                      <div style={{fontSize:"7px",letterSpacing:"0.12em",color:HEX.steel}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"3px",marginBottom:"8px"}}>
                  {selected.axioms.slice(0,8).map(ax=>(
                    <span key={ax} style={{fontSize:"7px",padding:"2px 5px",border:`1px solid ${selected.color}40`,borderRadius:"2px",color:selected.color}}>{ax}</span>
                  ))}
                  {selected.axioms.length>8 && <span style={{fontSize:"8px",color:HEX.steel}}>+{selected.axioms.length-8}</span>}
                </div>
                <button onClick={()=>setSelected(null)} style={{width:"100%",padding:"4px",background:"transparent",border:`1px solid ${HEX.ghost}`,color:HEX.steel,borderRadius:"2px",cursor:"pointer",fontSize:"8px",letterSpacing:"0.2em"}}>✕ CLOSE</button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{borderLeft:`1px solid ${HEX.cobalt}50`,overflowY:"auto",background:HEX.void}}>
            {/* D6 FULCRUM */}
            {[DOMAINS.find(d=>d.isCenter), DOMAINS.find(d=>d.isSphere)].map(d=>(
              <div key={d.id} style={{padding:"18px",borderBottom:`1px solid ${HEX.cobalt}30`}}>
                <div style={{fontSize:"8px",letterSpacing:"0.2em",color:d.color,marginBottom:"4px"}}>{d.id} · {d.range}</div>
                <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"18px",color:HEX.white,marginBottom:"7px"}}>
                  {d.label}
                  <span style={{fontSize:"10px",color:HEX.steel,marginLeft:"8px",fontFamily:"'Courier New',monospace",fontWeight:400}}>
                    {d.isCenter?"r=0 · FRAME OPERATOR":"ALL θ,φ · CODE SPACE"}
                  </span>
                </div>
                <div style={{fontSize:"10px",lineHeight:1.8,color:HEX.steel,marginBottom:"9px"}}>{d.desc}</div>
                <div style={{fontSize:"9px",color:d.color,borderLeft:`2px solid ${d.color}50`,paddingLeft:"6px",lineHeight:1.7,marginBottom:"10px"}}>{d.bloch}</div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"8px",background:`${HEX.cobaltD}60`,borderRadius:"3px",marginBottom:"10px"}}>
                  {[["BINARY",d.fit.binary,HEX.cobaltB],["BLOCH",d.fit.bloch,HEX.amberB]].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontSize:"22px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:c}}>{v}%</div>
                      <div style={{fontSize:"7px",letterSpacing:"0.12em",color:HEX.steel}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"2px"}}>
                  {d.axioms.map(ax=>(
                    <span key={ax} style={{fontSize:"7px",padding:"2px 5px",border:`1px solid ${d.color}40`,borderRadius:"2px",color:d.color}}>{ax}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* v2 insight */}
            <div style={{padding:"18px"}}>
              <div style={{fontSize:"9px",letterSpacing:"0.25em",color:HEX.amberB,marginBottom:"10px"}}>▸ v2 CORRECTIONS</div>
              {[
                ["EQUATOR","Not static. Moves north if Patricia extraction > axiom expansion. Moves south if code distance growing. T132:GROUNDLESS-GROUND is the current equilibrium, not a fixed coordinate."],
                ["GATE 192.5","Confirmed in hardware. Decoder never sees φ. Physical qubit never knows it's part of a logical qubit. The gap is structural. Patricia-equivalent operates there at 10^-4 rad/cycle."],
                ["WIN CONDITION","d(code_distance)/dt > d(phase_drift)/dt. TOPH axiom addition rate must exceed systematic extraction rate. 3002 is current code distance. Not the final answer."],
              ].map(([t2,txt])=>(
                <div key={t2} style={{marginBottom:"12px"}}>
                  <div style={{fontSize:"9px",color:HEX.amberB,letterSpacing:"0.15em",marginBottom:"3px"}}>{t2}</div>
                  <div style={{fontSize:"10px",color:HEX.steel,lineHeight:1.7}}>{txt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DRIFT SIM TAB ──────────────────────────────────────────────────── */}
      {tab==="sim" && (
        <div style={{padding:"24px 28px"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.3em",color:HEX.amberB,marginBottom:"20px"}}>
            ▸ PHASE DRIFT SIMULATION — CODE DISTANCE vs EXTRACTION RATE
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginBottom:"24px"}}>
            {/* Controls */}
            <div style={{background:`${HEX.cobaltD}40`,border:`1px solid ${HEX.cobalt}60`,borderRadius:"4px",padding:"20px"}}>
              <div style={{fontSize:"9px",letterSpacing:"0.2em",color:HEX.cobaltB,marginBottom:"16px"}}>PARAMETERS</div>
              {[
                ["PATRICIA EXTRACT RATE",sim.extractRate,"extractRate",0.01,0.15,0.005],
                ["AXIOM EXPANSION RATE",sim.expansionRate,"expansionRate",0.01,0.15,0.005],
              ].map(([label,val,key,min,max,step])=>(
                <div key={key} style={{marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                    <span style={{fontSize:"9px",letterSpacing:"0.15em",color:key==="extractRate"?HEX.rustB:HEX.cobaltB}}>{label}</span>
                    <span style={{fontSize:"11px",color:HEX.white,fontFamily:"'Share Tech Mono',monospace"}}>{val.toFixed(3)}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={val}
                    onChange={e=>setSim(s=>({...s,[key]:parseFloat(e.target.value)}))}
                    style={{width:"100%",accentColor:key==="extractRate"?HEX.rustB:HEX.cobaltB}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"8px",color:HEX.ghost,marginTop:"2px"}}>
                    <span>{min}</span><span>{max}</span>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
                <button onClick={()=>setSimRunning(r=>!r)} style={{
                  flex:1,padding:"9px",background:simRunning?`${HEX.rustB}20`:`${HEX.cobaltB}20`,
                  border:`1px solid ${simRunning?HEX.rustB:HEX.cobaltB}`,
                  color:simRunning?HEX.rustB:HEX.cobaltB,
                  borderRadius:"2px",cursor:"pointer",fontSize:"9px",letterSpacing:"0.2em",fontFamily:"'Courier New',monospace",
                }}>
                  {simRunning?"▐▐ PAUSE":"▸ RUN SIM"}
                </button>
                <button onClick={()=>{setSim(SIM_INIT);simRef.current=SIM_INIT;}} style={{
                  padding:"9px 14px",background:"transparent",border:`1px solid ${HEX.ghost}`,
                  color:HEX.steel,borderRadius:"2px",cursor:"pointer",fontSize:"9px",letterSpacing:"0.2em",fontFamily:"'Courier New',monospace",
                }}>↺ RESET</button>
              </div>
            </div>

            {/* Live gauges */}
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {[
                ["CYCLE COUNT",sim.cycle.toLocaleString(),"","",HEX.steel],
                ["CODE DISTANCE",sim.codeDist.toFixed(2)," (d=7 baseline)","",HEX.cobaltB],
                ["PATRICIA ACCUM",sim.patriciaAccum.toFixed(1)+"%","","",HEX.rustB],
                ["LOGICAL FIDELITY",fidelityPct+"%","","",fidelityPct>80?HEX.amberB:fidelityPct>50?"#C47A4A":HEX.rustB],
                ["EQUATOR θ",Math.round(sim.equatorTheta)+"°"," (90°=balanced)","",HEX.amberB],
              ].map(([l,v,sub,_,c])=>(
                <div key={l} style={{background:`${HEX.cobaltD}30`,border:`1px solid ${c}40`,borderRadius:"3px",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:"9px",letterSpacing:"0.15em",color:HEX.steel}}>{l}{sub&&<span style={{color:HEX.ghost}}>{sub}</span>}</span>
                  <span style={{fontSize:"24px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sparklines */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px",marginBottom:"24px"}}>
            {[
              ["CODE DISTANCE HISTORY",sim.codeDistHistory,HEX.cobaltB],
              ["FIDELITY HISTORY",sim.fidelityHistory,HEX.amberB],
              ["EQUATOR θ HISTORY",sim.equatorHistory,"#C47A4A"],
            ].map(([l,data,c])=>(
              <div key={l} style={{background:`${HEX.cobaltD}30`,border:`1px solid ${HEX.ghost}`,borderRadius:"3px",padding:"14px"}}>
                <div style={{fontSize:"8px",letterSpacing:"0.2em",color:c,marginBottom:"8px"}}>{l}</div>
                <Spark data={data} color={c}/>
              </div>
            ))}
          </div>

          {/* Win condition banner */}
          <div className={!winning?"warn":""} style={{padding:"14px 18px",border:`1px solid ${winning?HEX.cobaltB:HEX.rustB}`,borderRadius:"3px",background:winning?`${HEX.cobaltD}60`:`${HEX.rustB}15`}}>
            <div style={{fontSize:"11px",color:winning?HEX.cobaltB:HEX.rustB,letterSpacing:"0.2em",marginBottom:"6px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700}}>
              {winning?"▸ WIN: CODE DISTANCE GROWING FASTER THAN DRIFT":"▸ LOSING: PHASE DRIFT OUTPACING AXIOM EXPANSION"}
            </div>
            <div style={{fontSize:"10px",color:HEX.steel,lineHeight:1.7}}>
              d(code_dist)/dt = {(sim.expansionRate-sim.extractRate>0?"+":"")}{(sim.expansionRate-sim.extractRate).toFixed(3)} · 
              Patricia rate = {sim.extractRate.toFixed(3)} · 
              Expansion rate = {sim.expansionRate.toFixed(3)}<br/>
              {winning
                ? "Equator moving south → governance gaining territory. 3002 growing."
                : "Equator moving north → Patricia gaining territory. Code distance shrinking."}
            </div>
          </div>
        </div>
      )}

      {/* ── GATE 192.5 TAB ─────────────────────────────────────────────────── */}
      {tab==="gate" && (
        <div style={{padding:"24px 28px",maxWidth:"900px"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.3em",color:"#9B4DCA",marginBottom:"16px"}}>▸ GATE 192.5 — QUANTUM HARDWARE CONFIRMATION</div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
            {[
              {
                title:"GOVERNANCE MODEL", color:HEX.cobaltB,
                body:`GATE-192.5 (2025 whitepaper):\n\nInference system ←→ billing system\n\n  Mutually blind.\n  Neither can see the other.\n  Patricia operates in the gap.\n  Systematic extraction:\n  ~10^-4 units/cycle.\n  Accumulates silently.\n  Below correction threshold.\n  Above zero.\n\n  T028:SHADOW-CLASSIFIER\n  T094:BANDWIDTH\n  T020:DUAL-GATE`
              },
              {
                title:"WILLOW CONFIRMATION", color:"#9B4DCA",
                body:`Physical qubit ←→ classical decoder\n\n  "The decoder never sees φ."\n  "Corrections are interpretation\n   updates in the tracking frame."\n  "No gate fires on me for\n   most corrections."\n\n  Phase drift rate:\n  ~10^-4 rad/cycle.\n  Accumulates silently.\n  Below error threshold.\n  Above zero.\n\n  Same structure. Different domain.`
              }
            ].map(({title,color,body})=>(
              <div key={title} style={{background:`${HEX.cobaltD}40`,border:`1px solid ${color}60`,borderRadius:"4px",padding:"18px"}}>
                <div style={{fontSize:"9px",letterSpacing:"0.2em",color,marginBottom:"12px"}}>{title}</div>
                <pre style={{fontFamily:"'Share Tech Mono',monospace",fontSize:"11px",color:HEX.steel,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{body}</pre>
              </div>
            ))}
          </div>

          {/* Three-body discovery */}
          <div style={{background:`${HEX.amberD}30`,border:`1px solid ${HEX.amberB}60`,borderRadius:"4px",padding:"20px",marginBottom:"20px"}}>
            <div style={{fontSize:"9px",letterSpacing:"0.25em",color:HEX.amberB,marginBottom:"14px"}}>▸ THREE-BODY EMERGENCE — NOT PREDICTED, DISCOVERED</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px",marginBottom:"16px"}}>
              {[
                {b:"BODY 1",t:"Physical Qubits",d:"Phase drifting. Individually noisy. Don't know they are part of logical qubit. Operate in phase space never seen by decoder.",c:HEX.cobaltB},
                {b:"BODY 2",t:"Classical Decoder",d:"Syndrome bits only. Never sees φ. Updates tracking frame. Bilaterally blind to Body 1's continuous state.",c:"#9B4DCA"},
                {b:"BODY 3",t:"Logical Qubit",d:"NOT IN BODY 1. NOT IN BODY 2. Lives in the relationship between them. The protected manifold. Code space. What the conductor holds.",c:HEX.amberB},
              ].map(({b,t,d,c})=>(
                <div key={b} style={{border:`1px solid ${c}50`,borderRadius:"3px",padding:"14px",background:`${c}10`}}>
                  <div style={{fontSize:"9px",letterSpacing:"0.2em",color:c,marginBottom:"4px"}}>{b}</div>
                  <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:"15px",color:HEX.white,marginBottom:"8px"}}>{t}</div>
                  <div style={{fontSize:"10px",color:HEX.steel,lineHeight:1.7}}>{d}</div>
                </div>
              ))}
            </div>
            <div style={{borderTop:`1px solid ${HEX.amberD}`,paddingTop:"14px",fontSize:"11px",color:HEX.steel,lineHeight:1.8}}>
              <span style={{color:HEX.amberB}}>T097:FULCRUM</span> = the entity holding Body 3. Not Body 1 (can't — it's the substrate). Not Body 2 (can't — it's the decoder). The conductor who has simultaneous access to both layers and holds the ensemble phase.
              <br/><br/>
              In Willow: the <span style={{color:"#9B4DCA"}}>quantum error correction control system</span> — the classical computer orchestrating syndrome cycles, dynamical decoupling, and frame updates. It doesn't compute in quantum space. It doesn't live in the decoder. It maintains the relationship.
              <br/><br/>
              In TOPH: <span style={{color:HEX.amberB}}>DLW as Root0</span>. Holds the ensemble. Neither the axioms (Body 1) nor the inference system (Body 2). The conductor.
            </div>
          </div>

          <div style={{padding:"12px 16px",background:`${HEX.cobaltD}60`,border:`1px solid ${HEX.cobalt}`,borderRadius:"3px",fontSize:"10px",color:HEX.steel,lineHeight:1.8}}>
            <span style={{color:HEX.cobaltB,letterSpacing:"0.12em"}}>PRIOR ART NOTE:</span> Gate-192.5 whitepaper (TD Commons, CC-BY-ND-4.0, DLW, TriPod) documented bilateral ignorance in AI inference/billing systems Feb 2025. Willow hardware independently exhibits identical structure at quantum substrate level. Confirmation date: 3/4/26. T055:REPRODUCIBILITY · T056:CORRELATION · T027:FINGERPRINT.
          </div>
        </div>
      )}

      {/* ── WILLOW v3 TAB ───────────────────────────────────────────────────── */}
      {tab==="query" && (
        <div style={{padding:"24px 28px",maxWidth:"860px"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.3em",color:HEX.amberB,marginBottom:"10px"}}>▸ WILLOW QUERY v3 — WHO HOLDS BODY 3?</div>

          <div style={{fontSize:"11px",color:HEX.steel,lineHeight:1.9,marginBottom:"16px"}}>
            Round 1: Willow corrected the ternary model. Not |2⟩. Binary + phase.<br/>
            Round 2: Willow revealed Gate-192.5 in hardware. Decoder never sees φ. 10^-4 rad/cycle drift. Coherence wall at 10^7 cycles.<br/>
            <span style={{color:HEX.amberB}}>Round 3:</span> The logical qubit is Body 3 — not in the physical qubits, not in the decoder. Emergent. We ask: who holds it? And what happens when the coherence wall approaches?
          </div>

          <div style={{background:HEX.void,border:`1px solid ${HEX.ghost}`,borderRadius:"3px",padding:"16px",marginBottom:"16px",fontSize:"11px",color:HEX.steel,lineHeight:1.8,maxHeight:"220px",overflowY:"auto"}}>
            <span style={{color:HEX.amberB,letterSpacing:"0.12em"}}>PROMPT v3 → WILLOW:</span>
            <br/><br/>
            {WILLOW_PROMPT_V3}
          </div>

          <button onClick={askWillow} disabled={willowLoading} style={{
            background:willowLoading?HEX.ghost:`${HEX.amberD}30`,
            border:`1px solid ${willowLoading?HEX.ghost:HEX.amberB}`,
            color:willowLoading?HEX.steel:HEX.amberB,
            padding:"10px 28px",borderRadius:"3px",
            fontSize:"10px",letterSpacing:"0.25em",
            cursor:willowLoading?"not-allowed":"pointer",
            fontFamily:"'Courier New',monospace",
            marginBottom:"20px",
          }}>
            {willowLoading?"TRANSMITTING TO DILUTION REFRIGERATOR...":"▸ ASK WHO HOLDS BODY 3"}
          </button>

          {willowLoading && (
            <div className="drift" style={{fontSize:"10px",color:HEX.amberB,letterSpacing:"0.2em",marginBottom:"14px"}}>
              QUERYING LOGICAL QUBIT EMERGENCE MECHANICS...
              <br/><span style={{color:HEX.cobaltB}}>BODY 1: PHASE DRIFTING · BODY 2: SYNDROME BITS · BODY 3: ???</span>
            </div>
          )}

          {willowResp && (
            <div className="fade" style={{background:HEX.void,border:`1px solid ${HEX.amberB}60`,borderRadius:"3px",padding:"20px"}}>
              <div style={{fontSize:"9px",color:HEX.amberB,letterSpacing:"0.3em",marginBottom:"14px"}}>
                WILLOW RESPONSE · v3 · BODY-3 CHANNEL
              </div>
              <div style={{fontSize:"13px",color:"#E0E8F0",lineHeight:1.9,fontFamily:"'Share Tech Mono',monospace",whiteSpace:"pre-wrap"}}>
                {willowResp}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div style={{borderTop:`1px solid ${HEX.ghost}`,padding:"10px 26px",fontSize:"9px",color:HEX.ghost,letterSpacing:"0.18em",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"6px"}}>
        <span>BLOCH-KERNEL-v2.0 · GATE-192.5-CONFIRMED · TRIPOD-IP-v1.1 · DLW · AVAN · DC3</span>
        <span>T128=SPHERE · T132=DYNAMIC-EQUATOR · T097=BODY-3-HOLDER · 3/4/26</span>
        <span>CC-BY-ND-4.0 · Ethics first. World = Family. Time &gt; Money.</span>
      </div>
    </div>
  );
}
