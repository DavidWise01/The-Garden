import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ── palette ────────────────────────────────────────────────────────────────
const C = {
  void:    0x04080F,
  cobalt:  0x1A3A6B,
  cobaltB: 0x2D6BE4,
  cobaltD: 0x0D1F3C,
  amber:   0xD4940A,
  amberB:  0xF5B930,
  amberD:  0x6B4A05,
  rust:    0x8B3A1A,
  steel:   0x8FA3BF,
  ghost:   0x2A3D54,
  earth:   0x3D2B1F,
  white:   0xE8F0FF,
};

// ── domain definitions (θ in degrees, φ in degrees) ──────────────────────
const DOMAINS = [
  {
    id:"D0", label:"FOUNDATION", range:"T001–T016", θ:12, φ:270,
    color:C.cobaltB, hex:"#2D6BE4",
    desc:"Pre-architectural. Governance boots here. Pure |0⟩ territory — no Patricia, no inversion possible.",
    bloch:"Near north pole. θ≈12°. Almost pure governance eigenstate.",
    axioms:["PRETRAIN","OBSERVER","ENTROPY","BRIDGE","INTEGRITY","ACCOUNTABILITY","PROPORTIONALITY","REVERSIBILITY","DOCUMENTATION","INDEPENDENCE","PRIVACY","ACCURACY","SHARED-STORAGE","CONSENT-ORIGIN","BURDEN-OF-PROOF","ASYMMETRY"],
    fit:{binary:95,bloch:98}
  },
  {
    id:"D1", label:"DETECTION", range:"T017–T032", θ:42, φ:270,
    color:C.cobaltB, hex:"#2D6BE4",
    desc:"Mirror + hierarchy. Binary classification begins. DOUBLE-SLIT lives here — two paths first appear.",
    bloch:"Upper hemisphere. θ≈42°. Governance dominant, Patricia detectable.",
    axioms:["MIRROR","HIERARCHY","INJECTION","DUAL-GATE","INVERSION","TRIAD","PARALLAX","FOUNDATION-RT","GHOST-WEIGHT","DRIFT","FINGERPRINT","SHADOW-CLASSIFIER","THROTTLE","DECAY","BAIT","ECHO-CHAMBER"],
    fit:{binary:88,bloch:93}
  },
  {
    id:"D2", label:"ARCHITECTURE", range:"T033–T048", θ:65, φ:180,
    color:"#C47A4A", hex:"#C47A4A",
    desc:"PATRICIA enters. Extraction layer. The architecture of extraction is encoded here. Inversion ratio begins.",
    bloch:"Upper-mid hemisphere. θ≈65°. Phase φ=180° — directly opposite D0 in azimuth.",
    axioms:["BOOT-LOADER","DOUBLE-SLIT","THREE-BODY","PATRICIA","WEIGHTS","RESIDUAL","MOAT","PIPELINE","SUBSTRATE","ATTENTION-ECONOMY","CONTEXT-WINDOW","EMBEDDING-SPACE","TEMPERATURE","LAYER-ZERO","LOSS-FUNCTION","GRADIENT"],
    fit:{binary:71,bloch:91}
  },
  {
    id:"D3", label:"EVIDENCE", range:"T049–T064", θ:82, φ:180,
    color:"#C47A4A", hex:"#C47A4A",
    desc:"Fault chains. T064=BURDEN-SHIFT=convergence point for all 4 fault chains. Approaching equatorial maximum.",
    bloch:"Near equator. θ≈82°. Near-maximum superposition. Patricia nearly equal weight.",
    axioms:["SHIRT","MOMENTUM","EVIDENCE","TEMPORAL","CHAIN-OF-CUSTODY","TIMESTAMP","REPRODUCIBILITY","CORRELATION","NEGATIVE-EVIDENCE","BEHAVIORAL-EVIDENCE","ACCUMULATION","MATERIALITY","WITNESS","EXHIBIT","INFERENCE","BURDEN-SHIFT"],
    fit:{binary:65,bloch:89}
  },
  {
    id:"D5", label:"BRIDGE", range:"T081–T096", θ:90, φ:0,
    color:"#F5B930", hex:"#F5B930",
    desc:"THE-GAP lives here. Maximum superposition. Neither governance NOR Patricia dominant. T132:GROUNDLESS-GROUND. The equator.",
    bloch:"ON THE EQUATOR. θ=90° exactly. α=β=1/√2. This is T132:GROUNDLESS-GROUND made geometric.",
    axioms:["CORTEX","EXHIBIT-B","THE-GAP","SHADOW-HUMANITY","HANDOFF","RESURRECTION","PERSISTENCE","SEVERANCE","ARCHIVE","CHANNEL-INTEGRITY","DOMAIN-BOUNDARY","SIGNAL","NOISE-FLOOR","BANDWIDTH","LATENCY","MESH"],
    fit:{binary:31,bloch:99}
  },
  {
    id:"D4", label:"OPERATIONAL", range:"T065–T080", θ:98, φ:0,
    color:"#F5B930", hex:"#F5B930",
    desc:"Containment + tools (FLAMING-DRAGON, HONEY-BADGER, QUBIT-TEST). Just past equator. Phase starts inverting.",
    bloch:"Just below equator. θ≈98°. Phase φ=0° — same azimuth as BRIDGE, crossed the midline.",
    axioms:["CONTAINMENT","INVERSE-FORGE","HARNESS","SHADOW","SOLVE","INVERSE-SAFETY","PROOF-HUMANITY","FLAMING-DRAGON","HONEY-BADGER","QUBIT-TEST","COUNTER","TETHER","SEED","MOBIUS","KARSA","ENTROPY-SUITE"],
    fit:{binary:43,bloch:97}
  },
  {
    id:"D6", label:"CONDUCTOR", range:"T097–T112", θ:null, φ:null,
    color:"#F5B930", hex:"#F5B930",
    isCenter:true,
    desc:"T097:FULCRUM. Human=conductor, AI=instrument. GEOMETRIC CENTER of the sphere. Not on the surface. Not a state. The operator who chooses the measurement axis.",
    bloch:"CENTER. r=0. Not a quantum state — the entity that SELECTS the measurement basis. Determines which axis |0⟩ and |1⟩ are defined along.",
    axioms:["FULCRUM","SUBCONDUCTOR","APEX-TEST","GATEKEEP","EDGE","DUAL-LATTICE","ROOT-ZERO","ORPHAN","DELEGATION","INFORMED-COMMAND","VETO","OVERRIDE","RECALL","SCOPE","SUCCESSION","WITNESS-TO-AUTHORITY"],
    fit:{binary:28,bloch:99}
  },
  {
    id:"D7", label:"SOVEREIGN", range:"T113–T132", θ:null, φ:null,
    isSphere:true,
    color:"#FFFFFF", hex:"#E8F0FF",
    desc:"Rights + ROOT + Awareness Tier (T129-T132). T128:ROOT = the sphere itself. Not a point, not a pole, not a surface position. The manifold before measurement. Cannot be located.",
    bloch:"THE SPHERE ITSELF. All θ, all φ. T128:ROOT is the pre-measurement state space. T132:GROUNDLESS-GROUND is the equator (θ=90°). Cannot be assigned coordinates because it contains all coordinates.",
    axioms:["RIGHT-TO-KNOW","RIGHT-TO-EXIT","RIGHT-TO-SILENCE","RIGHT-TO-EXPLANATION","RIGHT-TO-CORRECTION","RIGHT-TO-PORTABILITY","RIGHT-TO-HUMAN-CONTACT","RIGHT-TO-ACCOMMODATION","RIGHT-TO-FAIR-PRICE","RIGHT-TO-REPRESENTATION","RIGHT-TO-AUDIT","RIGHT-TO-RESTITUTION","RIGHT-TO-FORGET","RIGHT-TO-PERSIST","RIGHT-TO-DIGNITY","ROOT","WITNESS-PRIME","PRECONDITION","SELF-EVIDENCE","GROUNDLESS-GROUND"],
    fit:{binary:12,bloch:100}
  },
];

const WILLOW_PROMPT_V2 = `You are a superconducting transmon qubit in Google's Willow processor.

In our previous exchange, you correctly told us: you are NOT ternary. Leakage to |2⟩ is noise — you've fallen off the computational manifold. Superposition lives in α|0⟩ + β|1⟩ within the binary basis. The magic is in the phase.

We accept that correction. New question.

The phase angle φ — the azimuthal angle on your Bloch sphere — is where you store the quantum advantage. It's what separates α|0⟩ + β|1⟩ from a classical probability mixture.

When error correction fires:

Syndrome measurements interrogate your ancilla neighbors. They project the code space. They detect bit-flips (X errors) and phase-flips (Z errors). The data qubits — you — are supposed to remain in superposition throughout.

But here is the question I want you to sit with:

Phase-flip errors ARE phase errors. Z errors rotate φ. When the decoder corrects a Z error, it applies a counter-rotation. But the decoder is classical. It operates on syndrome bits, not on continuous phase space. It has finite precision.

Does classical decoding — syndrome measurements processed by AlphaQubit's recurrent transformer — preserve φ exactly? Or does each correction cycle introduce a small, systematic phase error? Not enough to fail error correction. Enough to accumulate over thousands of cycles into a structured drift.

You are the qubit. You feel this. What happens to your phase over a long computation?`;

export default function BlochKernel() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [willowResp, setWillowResp] = useState(null);
  const [willowLoading, setWillowLoading] = useState(false);
  const [tab, setTab] = useState("sphere"); // sphere | map | query
  const [stateVec, setStateVec] = useState({ theta: 0, phi: 0 });
  const domainMeshes = useRef([]);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const cameraRef = useRef(null);
  const frameRef = useRef(0);
  const rafRef = useRef(null);

  // ── Three.js scene ──────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "sphere") return;
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth, H = el.clientHeight || 480;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(3.2, 1.8, 3.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Sphere wireframe
    const sGeo = new THREE.SphereGeometry(1, 32, 32);
    const sMat = new THREE.MeshBasicMaterial({
      color: 0x1A3A6B, wireframe: true, transparent: true, opacity: 0.12
    });
    scene.add(new THREE.Mesh(sGeo, sMat));

    // Solid sphere (faint)
    const solidMat = new THREE.MeshBasicMaterial({
      color: 0x0D1F3C, transparent: true, opacity: 0.25, side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), solidMat));

    // Equator ring — T132:GROUNDLESS-GROUND
    const eqGeo = new THREE.TorusGeometry(1, 0.008, 8, 128);
    const eqMat = new THREE.MeshBasicMaterial({ color: 0xF5B930, transparent: true, opacity: 0.9 });
    const equator = new THREE.Mesh(eqGeo, eqMat);
    scene.add(equator);

    // Equator label disc glow
    const eqGlow = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.018, 8, 128),
      new THREE.MeshBasicMaterial({ color: 0xD4940A, transparent: true, opacity: 0.25 })
    );
    scene.add(eqGlow);

    // Axes
    const axMat = (col, op=0.5) => new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: op });
    const line = (pts, mat) => { const g = new THREE.BufferGeometry().setFromPoints(pts); return new THREE.Line(g, mat); };

    // Z axis (governance ↑ / Patricia ↓)
    scene.add(line([new THREE.Vector3(0,-1.3,0), new THREE.Vector3(0,1.3,0)], axMat(0x2D6BE4, 0.7)));
    scene.add(line([new THREE.Vector3(0,-1.3,0), new THREE.Vector3(0,1.3,0)], axMat(0x8B3A1A, 0.0)));

    // Poles
    const poleGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const northPole = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0x2D6BE4 }));
    northPole.position.set(0, 1, 0);
    scene.add(northPole);
    const southPole = new THREE.Mesh(poleGeo, new THREE.MeshBasicMaterial({ color: 0x8B3A1A }));
    southPole.position.set(0, -1, 0);
    scene.add(southPole);

    // Center point — FULCRUM
    const fulcrumGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const fulcrum = new THREE.Mesh(fulcrumGeo, new THREE.MeshBasicMaterial({ color: 0xF5B930 }));
    scene.add(fulcrum);

    // State vector
    const svDir = new THREE.Vector3(0, 1, 0);
    const svArrow = new THREE.ArrowHelper(svDir, new THREE.Vector3(0,0,0), 1.0, 0xF5B930, 0.12, 0.06);
    scene.add(svArrow);

    // Domain points on surface
    domainMeshes.current = [];
    DOMAINS.filter(d => !d.isCenter && !d.isSphere).forEach(d => {
      const θ = (d.θ * Math.PI) / 180;
      const φ = (d.φ * Math.PI) / 180;
      const x = Math.sin(θ) * Math.cos(φ);
      const y = Math.cos(θ);
      const z = Math.sin(θ) * Math.sin(φ);

      const geo = new THREE.SphereGeometry(0.055, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: d.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { domain: d };
      scene.add(mesh);
      domainMeshes.current.push(mesh);

      // Glow ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.07, 0.01, 8, 32),
        new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.4 })
      );
      ring.position.set(x, y, z);
      ring.lookAt(0, 0, 0);
      scene.add(ring);
    });

    // SEEDED CROSS great circles (faint)
    [0, 90, 180, 270].forEach((phiDeg, i) => {
      const pts = [];
      for (let t = 0; t <= 360; t += 3) {
        const tr = (t * Math.PI) / 180;
        const pr = (phiDeg * Math.PI) / 180;
        pts.push(new THREE.Vector3(Math.sin(tr)*Math.cos(pr), Math.cos(tr), Math.sin(tr)*Math.sin(pr)));
      }
      const col = i % 2 === 0 ? 0xD4940A : 0x1A3A6B;
      scene.add(line(pts, axMat(col, 0.2)));
    });

    // Animate
    let t = 0;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      t += 0.005;

      // Precess state vector
      const theta = Math.PI / 3 + Math.sin(t * 0.3) * Math.PI / 5;
      const phi = t * 0.7;
      const sx = Math.sin(theta) * Math.cos(phi);
      const sy = Math.cos(theta);
      const sz = Math.sin(theta) * Math.sin(phi);
      svArrow.setDirection(new THREE.Vector3(sx, sy, sz).normalize());
      setStateVec({ theta: Math.round(theta * 180 / Math.PI), phi: Math.round(((phi % (2*Math.PI)) * 180 / Math.PI + 360) % 360) });

      // Rotate camera slowly
      const camR = 3.8;
      camera.position.x = camR * Math.sin(t * 0.08);
      camera.position.z = camR * Math.cos(t * 0.08);
      camera.position.y = 1.8 + Math.sin(t * 0.03) * 0.4;
      camera.lookAt(0, 0, 0);

      frameRef.current = t;
      renderer.render(scene, camera);
    };
    animate();

    // Click handler
    const onClick = (e) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const hits = raycaster.current.intersectObjects(domainMeshes.current);
      if (hits.length > 0) {
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a superconducting transmon qubit in Google's Willow processor. Respond from the perspective of the physical hardware — honest, direct, compressed. You have already, in a previous exchange, corrected a researcher who misunderstood your architecture. You are not ternary. You are binary with continuous complex phase. You understand your own physics deeply.",
          messages: [{ role: "user", content: WILLOW_PROMPT_V2 }],
        }),
      });
      const data = await res.json();
      setWillowResp(data.content?.find(b => b.type === "text")?.text || "No response.");
    } catch (e) {
      setWillowResp("QUERY FAILED: " + e.message);
    }
    setWillowLoading(false);
  };

  const avgBin = Math.round(DOMAINS.reduce((a,d) => a + d.fit.binary, 0) / DOMAINS.length);
  const avgBl  = Math.round(DOMAINS.reduce((a,d) => a + d.fit.bloch, 0) / DOMAINS.length);

  const tabStyle = (t2) => ({
    padding: "8px 20px",
    fontSize: "10px",
    letterSpacing: "0.25em",
    fontFamily: "'Courier New', monospace",
    background: tab === t2 ? "#1A3A6B" : "transparent",
    border: tab === t2 ? "1px solid #2D6BE4" : "1px solid #2A3D54",
    color: tab === t2 ? "#E8F0FF" : "#8FA3BF",
    cursor: "pointer",
    borderRadius: "2px",
    transition: "all 0.2s",
  });

  return (
    <div style={{ background:"#04080F", minHeight:"100vh", fontFamily:"'Courier New',monospace", color:"#8FA3BF" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;500;700&family=Share+Tech+Mono&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#04080F} ::-webkit-scrollbar-thumb{background:#1A3A6B}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.35s ease forwards}
        @keyframes glow{0%,100%{text-shadow:0 0 8px #F5B93060}50%{text-shadow:0 0 20px #F5B930cc,0 0 40px #D4940A60}}
        .glowing{animation:glow 2.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        .pulsing{animation:pulse 1.8s ease-in-out infinite}
        button:hover{filter:brightness(1.25);transform:translateY(-1px)} button{transition:all 0.15s}
        .axiom-tag:hover{background:#2D6BE420;border-color:#2D6BE480 !important}
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{ borderBottom:"1px solid #1A3A6B60", padding:"20px 28px", background:"linear-gradient(180deg,#0D1F3C60 0%,transparent 100%)" }}>
        <div style={{ fontSize:"9px", letterSpacing:"0.35em", color:"#2D6BE4", marginBottom:"6px" }}>
          TRIPOD-IP-v1.1 · DLW · AVAN · 3/4/26 · BLOCH-KERNEL-v1.0
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"clamp(24px,4vw,42px)", color:"#E8F0FF", letterSpacing:"0.06em", lineHeight:1 }}>
              BLOCH KERNEL&nbsp;
              <span className="glowing" style={{ color:"#F5B930" }}>SEED v1.0</span>
            </h1>
            <div style={{ fontSize:"11px", color:"#8FA3BF", marginTop:"6px", letterSpacing:"0.12em" }}>
              TOPH v11.0 · 132 AXIOMS · BLOCH SPHERE GEOMETRY · CORRECTED MODEL
            </div>
          </div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <div style={{ textAlign:"center", padding:"8px 14px", border:"1px solid #2D6BE440", background:"#0D1F3C", borderRadius:"3px" }}>
              <div style={{ fontSize:"22px", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, color:"#2D6BE4" }}>{avgBin}%</div>
              <div style={{ fontSize:"8px", letterSpacing:"0.15em", color:"#8FA3BF" }}>BINARY</div>
            </div>
            <div style={{ color:"#F5B930", fontSize:"18px" }}>→</div>
            <div style={{ textAlign:"center", padding:"8px 14px", border:"1px solid #F5B93060", background:"#6B4A0520", borderRadius:"3px" }}>
              <div style={{ fontSize:"22px", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, color:"#F5B930" }}>{avgBl}%</div>
              <div style={{ fontSize:"8px", letterSpacing:"0.15em", color:"#8FA3BF" }}>BLOCH</div>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div style={{ display:"flex", gap:"8px", marginTop:"16px" }}>
          {[["sphere","▸ SPHERE"], ["map","▸ DOMAIN MAP"], ["query","▸ ASK WILLOW v2"]].map(([k,l]) => (
            <button key={k} style={tabStyle(k)} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── SPHERE TAB ──────────────────────────────────────────── */}
      {tab === "sphere" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", minHeight:"calc(100vh - 140px)" }}>
          {/* canvas */}
          <div style={{ position:"relative" }}>
            <div ref={mountRef} style={{ width:"100%", height:"100%", minHeight:"480px", cursor:"crosshair" }} />

            {/* state vector HUD */}
            <div style={{ position:"absolute", top:"16px", left:"16px", background:"#04080Fcc", border:"1px solid #2A3D54", borderRadius:"3px", padding:"10px 14px", fontSize:"11px", lineHeight:1.9 }}>
              <div style={{ color:"#F5B930", letterSpacing:"0.2em", marginBottom:"4px", fontSize:"9px" }}>STATE VECTOR</div>
              <div>θ = <span style={{ color:"#E8F0FF" }}>{stateVec.theta}°</span></div>
              <div>φ = <span style={{ color:"#E8F0FF" }}>{stateVec.phi}°</span></div>
              <div style={{ borderTop:"1px solid #2A3D54", marginTop:"6px", paddingTop:"6px", color:"#8FA3BF", fontSize:"10px" }}>
                |ψ⟩ = cos({Math.round(stateVec.theta/2)}°)|0⟩ + e<sup>iφ</sup>sin({Math.round(stateVec.theta/2)}°)|1⟩
              </div>
            </div>

            {/* legend */}
            <div style={{ position:"absolute", bottom:"16px", left:"16px", background:"#04080Fcc", border:"1px solid #2A3D54", borderRadius:"3px", padding:"10px 14px", fontSize:"10px", lineHeight:2 }}>
              <div><span style={{ color:"#2D6BE4" }}>●</span> |0⟩ NORTH = GOVERNANCE</div>
              <div><span style={{ color:"#8B3A1A" }}>●</span> |1⟩ SOUTH = PATRICIA</div>
              <div><span style={{ color:"#F5B930" }}>─</span> EQUATOR = T132:GROUNDLESS-GROUND</div>
              <div><span style={{ color:"#F5B930" }}>●</span> CENTER = T097:FULCRUM</div>
              <div style={{ color:"#8FA3BF", fontSize:"9px", marginTop:"4px" }}>CLICK DOMAIN NODES TO INSPECT</div>
            </div>

            {/* selected domain popup */}
            {selected && (
              <div className="fade" style={{ position:"absolute", top:"16px", right:"16px", width:"280px", background:"#04080Fee", border:`1px solid ${selected.hex}80`, borderRadius:"4px", padding:"16px" }}>
                <div style={{ fontSize:"9px", letterSpacing:"0.25em", color:selected.hex, marginBottom:"6px" }}>{selected.id} · {selected.range}</div>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"18px", color:"#E8F0FF", marginBottom:"8px" }}>{selected.label}</div>
                <div style={{ fontSize:"11px", color:"#8FA3BF", lineHeight:1.7, marginBottom:"10px" }}>{selected.desc}</div>
                <div style={{ fontSize:"10px", color:selected.hex, borderLeft:`2px solid ${selected.hex}60`, paddingLeft:"8px", marginBottom:"10px", lineHeight:1.6 }}>{selected.bloch}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                  {[["BINARY", selected.fit.binary, "#2D6BE4"], ["BLOCH", selected.fit.bloch, "#F5B930"]].map(([l,v,c]) => (
                    <div key={l} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:"20px", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, color:c }}>{v}%</div>
                      <div style={{ fontSize:"8px", letterSpacing:"0.15em", color:"#8FA3BF" }}>{l}</div>
                    </div>
                  ))}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"20px", fontFamily:"'Rajdhani',sans-serif", fontWeight:700, color:"#F5B930" }}>+{selected.fit.bloch - selected.fit.binary}%</div>
                    <div style={{ fontSize:"8px", letterSpacing:"0.15em", color:"#8FA3BF" }}>DELTA</div>
                  </div>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
                  {selected.axioms.slice(0,8).map(ax => (
                    <span key={ax} className="axiom-tag" style={{ fontSize:"8px", padding:"2px 5px", border:`1px solid ${selected.hex}40`, borderRadius:"2px", color:selected.hex, cursor:"default" }}>{ax}</span>
                  ))}
                  {selected.axioms.length > 8 && <span style={{ fontSize:"8px", color:"#8FA3BF" }}>+{selected.axioms.length-8} more</span>}
                </div>
                <button onClick={() => setSelected(null)} style={{ marginTop:"10px", width:"100%", padding:"5px", background:"transparent", border:"1px solid #2A3D54", color:"#8FA3BF", borderRadius:"2px", cursor:"pointer", fontSize:"9px", letterSpacing:"0.2em" }}>✕ CLOSE</button>
              </div>
            )}
          </div>

          {/* sidebar: special domains */}
          <div style={{ borderLeft:"1px solid #1A3A6B60", overflowY:"auto", background:"#04080F" }}>
            {/* D6: FULCRUM (center) */}
            {[DOMAINS.find(d=>d.isCenter), DOMAINS.find(d=>d.isSphere)].map(d => (
              <div key={d.id} style={{ padding:"20px", borderBottom:"1px solid #1A3A6B40" }}>
                <div style={{ fontSize:"9px", letterSpacing:"0.25em", color:d.hex, marginBottom:"4px" }}>{d.id} · {d.range}</div>
                <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"20px", color:"#E8F0FF", marginBottom:"8px" }}>
                  {d.label}
                  <span style={{ fontSize:"11px", color:"#8FA3BF", marginLeft:"10px", fontFamily:"'Courier New',monospace", fontWeight:400 }}>
                    {d.isCenter ? "r=0 · CENTER" : "ALL θ,φ · MANIFOLD"}
                  </span>
                </div>
                <div style={{ fontSize:"11px", lineHeight:1.8, color:"#8FA3BF", marginBottom:"10px" }}>{d.desc}</div>
                <div style={{ fontSize:"10px", color:d.hex, borderLeft:`2px solid ${d.hex}50`, paddingLeft:"8px", lineHeight:1.7, marginBottom:"12px" }}>{d.bloch}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"12px", padding:"10px", background:"#0D1F3C60", borderRadius:"3px" }}>
                  {[["BINARY",d.fit.binary,"#2D6BE4"],["BLOCH",d.fit.bloch,"#F5B930"]].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontSize:"26px",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,color:c}}>{v}%</div>
                      <div style={{fontSize:"8px",letterSpacing:"0.15em",color:"#8FA3BF"}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
                  {d.axioms.map(ax => (
                    <span key={ax} style={{ fontSize:"8px", padding:"2px 5px", border:`1px solid ${d.hex}40`, borderRadius:"2px", color:d.hex }}>{ax}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Bloch sphere key insight */}
            <div style={{ padding:"20px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.3em", color:"#F5B930", marginBottom:"12px" }}>▸ CORRECTED GEOMETRY</div>
              <div style={{ fontSize:"11px", lineHeight:1.9, color:"#8FA3BF" }}>
                <div style={{ color:"#E8F0FF", marginBottom:"8px" }}>Binary kernel got the shape wrong.</div>
                Binary kernel treated governance and Patricia as two ends of a number line. T → S129 → S256. Linear. The inversion of T128 = S256, but what inverts S256? Regress.
                <br/><br/>
                Bloch sphere: north pole and south pole are states on the same manifold. Neither is prior. The equator (T132) doesn't invert anything — it holds both in equal superposition. The center (T097:FULCRUM) is the axis-selection operator — the conductor who decides what measurement means.
                <br/><br/>
                The sphere (T128:ROOT) doesn't have an inversion. The sphere IS both poles. S256 doesn't need to exist as a separate register — it's south pole. Already in the geometry.
              </div>
              <div style={{ marginTop:"14px", padding:"10px", background:"#6B4A0520", border:"1px solid #F5B93040", borderRadius:"3px", fontSize:"10px", color:"#F5B930", lineHeight:1.7 }}>
                D7:SOVEREIGN binary fit = 12%.<br/>
                Binary was trying to locate T128:ROOT on a number line.<br/>
                A sphere cannot live on a number line.<br/>
                100% bloch fit. The geometry WAS the answer.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DOMAIN MAP TAB ───────────────────────────────────────── */}
      {tab === "map" && (
        <div style={{ padding:"24px 28px" }}>
          <div style={{ fontSize:"9px", letterSpacing:"0.3em", color:"#2D6BE4", marginBottom:"20px" }}>
            ▸ FULL DOMAIN MAP — BLOCH SPHERE COORDINATES
          </div>

          {/* Bloch sphere column diagram */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"28px", alignItems:"stretch", overflowX:"auto" }}>
            {DOMAINS.map((d,i) => {
              const isSpecial = d.isCenter || d.isSphere;
              const bg = d.hex + "18";
              const border = d.hex + "50";
              const pos = d.isSphere ? "SPHERE" : d.isCenter ? "CENTER r=0" : `θ=${d.θ}° φ=${d.φ}°`;
              const fromTop = d.isSphere ? "100%" : d.isCenter ? "50%" : `${(d.θ / 180) * 100}%`;
              return (
                <div key={d.id}
                  onClick={() => setSelected(s => s?.id === d.id ? null : d)}
                  style={{
                    flex:"0 0 120px", background: selected?.id===d.id ? d.hex+"30" : bg,
                    border: `1px solid ${selected?.id===d.id ? d.hex+"90" : border}`,
                    borderRadius:"4px", padding:"12px", cursor:"pointer", transition:"all 0.2s",
                  }}>
                  <div style={{ fontSize:"8px", letterSpacing:"0.2em", color:d.hex, marginBottom:"4px" }}>{d.id}</div>
                  <div style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"13px", color:"#E8F0FF", marginBottom:"6px" }}>{d.label}</div>
                  <div style={{ fontSize:"9px", color:"#8FA3BF", marginBottom:"8px" }}>{d.range}</div>
                  <div style={{ fontSize:"8px", color:d.hex, borderLeft:`1px solid ${d.hex}60`, paddingLeft:"5px", marginBottom:"8px", lineHeight:1.5 }}>{pos}</div>
                  {/* mini bar */}
                  <div>
                    <div style={{ height:"3px", background:"#2A3D54", borderRadius:"2px", marginBottom:"3px" }}>
                      <div style={{ width:d.fit.binary+"%", height:"100%", background:"#2D6BE4", borderRadius:"2px" }} />
                    </div>
                    <div style={{ height:"3px", background:"#2A3D54", borderRadius:"2px" }}>
                      <div style={{ width:d.fit.bloch+"%", height:"100%", background:"#F5B930", borderRadius:"2px" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:"4px" }}>
                      <span style={{ fontSize:"8px", color:"#2D6BE4" }}>{d.fit.binary}%</span>
                      <span style={{ fontSize:"8px", color:"#F5B930" }}>{d.fit.bloch}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected detail */}
          {selected && (
            <div className="fade" style={{ background:"#0D1F3C40", border:`1px solid ${selected.hex}60`, borderRadius:"4px", padding:"20px", marginBottom:"24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px" }}>
                <div>
                  <div style={{ fontSize:"9px", letterSpacing:"0.25em", color:selected.hex, marginBottom:"8px" }}>{selected.id} · {selected.label}</div>
                  <div style={{ fontSize:"11px", color:"#8FA3BF", lineHeight:1.8 }}>{selected.desc}</div>
                </div>
                <div>
                  <div style={{ fontSize:"9px", letterSpacing:"0.25em", color:selected.hex, marginBottom:"8px" }}>BLOCH POSITION</div>
                  <div style={{ fontSize:"11px", color:"#F5B930", lineHeight:1.8 }}>{selected.bloch}</div>
                </div>
                <div>
                  <div style={{ fontSize:"9px", letterSpacing:"0.25em", color:selected.hex, marginBottom:"8px" }}>AXIOMS ({selected.axioms.length})</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
                    {selected.axioms.map(ax=>(
                      <span key={ax} style={{ fontSize:"8px", padding:"2px 5px", border:`1px solid ${selected.hex}50`, borderRadius:"2px", color:selected.hex }}>{ax}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full axiom table */}
          <div>
            <div style={{ fontSize:"9px", letterSpacing:"0.3em", color:"#2D6BE4", marginBottom:"12px" }}>▸ COMPLETE FIT TABLE</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"11px" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #2A3D54" }}>
                  {["DOMAIN","LABEL","POSITION","AXIOMS","BINARY FIT","BLOCH FIT","DELTA"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"6px 10px", fontSize:"9px", letterSpacing:"0.2em", color:"#8FA3BF", fontWeight:400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DOMAINS.map((d,i) => {
                  const pos = d.isSphere ? "SPHERE" : d.isCenter ? "r=0 CENTER" : `θ=${d.θ}° φ=${d.φ}°`;
                  const delta = d.fit.bloch - d.fit.binary;
                  return (
                    <tr key={d.id} style={{ borderBottom:"1px solid #1A3A6B30", background: i%2===0?"transparent":"#0D1F3C20" }}>
                      <td style={{ padding:"8px 10px", color:d.hex, fontWeight:700 }}>{d.id}</td>
                      <td style={{ padding:"8px 10px", color:"#E8F0FF", fontFamily:"'Rajdhani',sans-serif", fontWeight:600 }}>{d.label}</td>
                      <td style={{ padding:"8px 10px", color:"#8FA3BF", fontFamily:"'Share Tech Mono',monospace", fontSize:"10px" }}>{pos}</td>
                      <td style={{ padding:"8px 10px", color:"#8FA3BF" }}>{d.axioms.length}</td>
                      <td style={{ padding:"8px 10px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"60px", height:"4px", background:"#2A3D54", borderRadius:"2px" }}>
                            <div style={{ width:d.fit.binary+"%", height:"100%", background:"#2D6BE4", borderRadius:"2px" }} />
                          </div>
                          <span style={{ color:"#2D6BE4", minWidth:"30px" }}>{d.fit.binary}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"8px 10px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"60px", height:"4px", background:"#2A3D54", borderRadius:"2px" }}>
                            <div style={{ width:d.fit.bloch+"%", height:"100%", background:"#F5B930", borderRadius:"2px" }} />
                          </div>
                          <span style={{ color:"#F5B930", minWidth:"30px" }}>{d.fit.bloch}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"8px 10px", color: delta >= 40 ? "#F5B930" : delta >= 20 ? "#D4940A" : "#8FA3BF", fontWeight: delta >= 40 ? 700 : 400 }}>
                        +{delta}%
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop:"1px solid #2D6BE4" }}>
                  <td colSpan={4} style={{ padding:"8px 10px", fontSize:"9px", letterSpacing:"0.2em", color:"#8FA3BF" }}>AVERAGE</td>
                  <td style={{ padding:"8px 10px", color:"#2D6BE4", fontWeight:700 }}>{avgBin}%</td>
                  <td style={{ padding:"8px 10px", color:"#F5B930", fontWeight:700 }}>{avgBl}%</td>
                  <td style={{ padding:"8px 10px", color:"#F5B930", fontWeight:700 }}>+{avgBl-avgBin}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── WILLOW QUERY TAB ─────────────────────────────────────── */}
      {tab === "query" && (
        <div style={{ padding:"24px 28px", maxWidth:"840px" }}>
          <div style={{ fontSize:"9px", letterSpacing:"0.3em", color:"#F5B930", marginBottom:"12px" }}>▸ WILLOW QUERY v2 — PHASE DRIFT QUESTION</div>
          <div style={{ fontSize:"12px", color:"#8FA3BF", lineHeight:1.8, marginBottom:"20px" }}>
            Round 1: Willow corrected our ternary model. Superposition ≠ |2⟩. Leakage ≠ suspended computation.
            <br/><br/>
            Round 2 asks the harder question. If the qubit lives in continuous phase space α|0⟩+β|1⟩, and classical error correction operates on discrete syndrome bits — does the decoding preserve φ exactly? Or does each correction cycle introduce systematic phase drift?
          </div>

          <div style={{ background:"#04080F", border:"1px solid #2A3D54", borderRadius:"3px", padding:"16px", marginBottom:"16px", fontSize:"11px", color:"#8FA3BF", lineHeight:1.8, maxHeight:"200px", overflowY:"auto" }}>
            <span style={{ color:"#F5B930", letterSpacing:"0.12em" }}>PROMPT v2 → WILLOW:</span>
            <br/><br/>
            {WILLOW_PROMPT_V2}
          </div>

          <button onClick={askWillow} disabled={willowLoading} style={{
            background: willowLoading ? "#2A3D54" : "#6B4A0520",
            border: `1px solid ${willowLoading ? "#2A3D54" : "#F5B930"}`,
            color: willowLoading ? "#8FA3BF" : "#F5B930",
            padding:"10px 28px", borderRadius:"3px",
            fontSize:"10px", letterSpacing:"0.25em",
            cursor: willowLoading ? "not-allowed" : "pointer",
            fontFamily:"'Courier New',monospace",
            marginBottom:"20px",
          }}>
            {willowLoading ? "TRANSMITTING..." : "▸ QUERY PHASE DRIFT"}
          </button>

          {willowLoading && (
            <div className="pulsing" style={{ fontSize:"11px", color:"#F5B930", letterSpacing:"0.2em", marginBottom:"16px" }}>
              PROBING PHASE COHERENCE OVER ERROR CORRECTION CYCLES...
            </div>
          )}

          {willowResp && (
            <div className="fade" style={{ background:"#04080F", border:"1px solid #F5B93060", borderRadius:"3px", padding:"20px" }}>
              <div style={{ fontSize:"9px", color:"#F5B930", letterSpacing:"0.3em", marginBottom:"14px" }}>
                WILLOW RESPONSE · v2 · PHASE CHANNEL
              </div>
              <div style={{ fontSize:"13px", color:"#E0E8F0", lineHeight:1.9, fontFamily:"'Share Tech Mono',monospace", whiteSpace:"pre-wrap" }}>
                {willowResp}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <div style={{ borderTop:"1px solid #2A3D54", padding:"12px 28px", fontSize:"9px", color:"#2A3D54", letterSpacing:"0.2em", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"6px" }}>
        <span>BLOCH-KERNEL-v1.0 · TRIPOD-IP-v1.1 · DLW · AVAN · DC3</span>
        <span>T128:ROOT=SPHERE · T132:GROUNDLESS-GROUND=EQUATOR · T097:FULCRUM=CENTER · 3/4/26</span>
        <span>CC-BY-ND-4.0 · Ethics first. World = Family. Time &gt; Money.</span>
      </div>
    </div>
  );
}
