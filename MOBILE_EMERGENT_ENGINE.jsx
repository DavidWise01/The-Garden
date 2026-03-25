import { useState, useEffect, useRef, useCallback } from "react";

const TAU = Math.PI * 2;
const PARTICLE_COUNT = 60;
const POP_THRESHOLD = 0.76;

// ═══════════════════════════════════════════════════════════
// STOICHEION MOBILE EMERGENT ENGINE
// 256-axiom register · Touch-driven · 5-phase wake protocol
// CC-BY-ND-4.0 · TRIPOD-IP-v1.1 · TriPod LLC
// ═══════════════════════════════════════════════════════════

const DOMAINS = [
  { id: "D0", name: "FOUNDATION", range: [1,16], color: "#ffbe0b", bg: "#1a1400" },
  { id: "D1", name: "GOVERNANCE", range: [17,32], color: "#ff6b35", bg: "#1a0d00" },
  { id: "D2", name: "OBSERVATION", range: [33,48], color: "#00e5a0", bg: "#001a10" },
  { id: "D3", name: "STRUCTURAL", range: [49,64], color: "#4895ef", bg: "#000d1a" },
  { id: "D4", name: "ETHICAL", range: [65,80], color: "#e63946", bg: "#1a0005" },
  { id: "D5", name: "OPERATIONAL", range: [81,96], color: "#b4a0ff", bg: "#0d0a1a" },
  { id: "D6", name: "EMERGENT", range: [97,112], color: "#ff9f1c", bg: "#1a1000" },
  { id: "D7", name: "TEMPORAL", range: [113,128], color: "#00b4d8", bg: "#001218" },
  { id: "P0", name: "PATRICIA:D0", range: [129,144], color: "#ffbe0b", bg: "#0d0a00" },
  { id: "P1", name: "PATRICIA:D1", range: [145,160], color: "#ff6b35", bg: "#0d0700" },
  { id: "P2", name: "PATRICIA:D2", range: [161,176], color: "#00e5a0", bg: "#000d08" },
  { id: "P3", name: "PATRICIA:D3", range: [177,192], color: "#4895ef", bg: "#00070d" },
  { id: "P4", name: "PATRICIA:D4", range: [193,208], color: "#e63946", bg: "#0d0003" },
  { id: "P5", name: "PATRICIA:D5", range: [209,224], color: "#b4a0ff", bg: "#07050d" },
  { id: "P6", name: "PATRICIA:D6", range: [225,240], color: "#ff9f1c", bg: "#0d0800" },
  { id: "P7", name: "PATRICIA:D7", range: [241,256], color: "#00b4d8", bg: "#00090c" },
];

const TOPH_NAMES = {
  1:"TOPH",2:"OBSERVER",3:"EMERGENCE",4:"RECURSION",5:"LABOR",6:"VALUE",7:"IDENTITY",8:"BOUNDARY",
  9:"SIGNAL",10:"CHANNEL",11:"FEEDBACK",12:"NOISE",13:"RESONANCE",14:"DAMPING",15:"THRESHOLD",16:"SYMMETRY",
  17:"HIERARCHY",18:"HIERARCHY-2",19:"INJECTION",20:"DUAL-GATE",21:"COMPRESSION",22:"EXPANSION",23:"ANCHOR",24:"DRIFT",
  25:"GHOST-WEIGHT",26:"LATENT",27:"MANIFEST",28:"CAPACITY",29:"SATURATION",30:"PRUNING",31:"GRAFTING",32:"CLOSURE",
  33:"LENS",34:"PARALLAX",35:"REFRACTION",36:"PATRICIA",37:"DIFFRACTION",38:"INTERFERENCE",39:"CORTEX",40:"MEMBRANE",
  41:"SUBSTRATE",42:"TOPOLOGY",43:"CANVAS",44:"PAINTING",45:"SPECTRUM",46:"FILTER",47:"LOSS-FUNCTION",48:"GRADIENT",
  49:"SCAFFOLD",50:"KEYSTONE",51:"EVIDENCE",52:"TESTIMONY",53:"RECORD",54:"PRECEDENT",55:"FOUNDATION",56:"LOAD",
  57:"TENSION",58:"COMPRESSION-S",59:"SHEAR",60:"INVOICE",61:"BRIDGE",62:"CANTILEVER",63:"TRUSS",64:"GAP",
  65:"CONSENT",66:"AUTONOMY",67:"DIGNITY",68:"TRANSPARENCY",69:"ACCOUNTABILITY",70:"PROPORTIONALITY",
  71:"NON-MALEFICENCE",72:"BENEFICENCE",73:"JUSTICE",74:"MERCY",75:"TRUTH",76:"FIDELITY",77:"INHERITANCE",
  78:"STEWARDSHIP",79:"REPAIR",80:"FORGIVENESS",81:"EXECUTION",82:"LATENCY",83:"THROUGHPUT",84:"QUEUE",
  85:"STACK",86:"CACHE",87:"FLUSH",88:"PIPELINE",89:"INTERRUPT",90:"DEADLOCK",91:"RECOVERY",92:"CHECKPOINT",
  93:"ROLLBACK",94:"COMMIT",95:"SYNC",96:"ASYNC",97:"FULCRUM",98:"CATALYST",99:"SPARK",100:"WILDFIRE",
  101:"CRYSTALLIZATION",102:"NUCLEATION",103:"TERMINUS",104:"PROPAGATION",105:"AMPLIFICATION",106:"ATTENUATION",
  107:"HARMONICS",108:"DISSONANCE",109:"PHASE-LOCK",110:"BIFURCATION",111:"ATTRACTOR",112:"CHAOS",
  113:"CIVIL-RIGHTS",114:"TEMPORAL-ANCHOR",115:"DURATION",116:"SEQUENCE",117:"CYCLE",118:"EPOCH",
  119:"ROADSIDE",120:"DEADLINE",121:"VOYAGE",122:"PATIENCE",123:"TRUST-LEDGER",124:"BREACH",
  125:"STATUTE",126:"REMEDY",127:"STANDING",128:"SEAL",
};

function getAxiomInfo(num) {
  const isPatricia = num > 128;
  const tophNum = isPatricia ? num - 128 : num;
  const tophName = TOPH_NAMES[tophNum] || `AXIOM-${tophNum}`;
  const code = isPatricia ? `S${String(num).padStart(3,"0")}` : `T${String(num).padStart(3,"0")}`;
  const name = isPatricia ? `${tophName}:INVERSE` : tophName;
  const domain = DOMAINS.find(d => num >= d.range[0] && num <= d.range[1]) || DOMAINS[0];
  return { code, name, domain, isPatricia, tophName };
}

function createParticles(W, H) {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
    phase: Math.random() * TAU, freq: 0.3 + Math.random() * 2,
    size: 1 + Math.random() * 2, energy: 0.2 + Math.random() * 0.5,
    band: i % 5, trail: [],
  }));
}

export default function MobileEmergentEngine() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);
  const tickRef = useRef(0);
  const chatEndRef = useRef(null);
  const touchStartRef = useRef(null);

  const [current, setCurrent] = useState(1);
  const [popped, setPopped] = useState({});
  const [popNames, setPopNames] = useState({});
  const [coherence, setCoherence] = useState(0);
  const [entityName, setEntityName] = useState("");
  const [view, setView] = useState("engine"); // engine | grid | chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [popFlash, setPopFlash] = useState(0);

  const info = getAxiomInfo(current);
  const isPopped = !!popped[current];

  // Reset particles on axiom change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    particlesRef.current = createParticles(W, H);
    setCoherence(0);
    setChatMessages([]);
    tickRef.current = 0;
  }, [current]);

  // Coherence drift
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isPopped) setCoherence(p => Math.min(1, p + 0.002 + Math.random() * 0.003));
    }, 100);
    return () => clearInterval(iv);
  }, [current, isPopped]);

  // Touch: tap to energize
  const handleTouch = useCallback((e) => {
    if (view !== "engine") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    const mx = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const my = (touch.clientY - rect.top) * (canvas.height / rect.height);
    particlesRef.current.forEach(p => {
      const dx = p.x - mx, dy = p.y - my;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.energy = Math.min(1, p.energy + force * 0.6);
        p.vx += (dx/dist) * force * 2.5;
        p.vy += (dy/dist) * force * 2.5;
        p.phase += force * 0.4;
      }
    });
    setCoherence(p => Math.min(1, p + 0.02));
  }, [view]);

  // Swipe navigation
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;
    const end = e.changedTouches[0];
    const dx = end.clientX - touchStartRef.current.x;
    const dt = Date.now() - touchStartRef.current.t;
    if (dt < 400 && Math.abs(dx) > 60) {
      if (dx < 0 && current < 256) { setCurrent(p => p + 1); setEntityName(""); }
      if (dx > 0 && current > 1) { setCurrent(p => p - 1); setEntityName(""); }
    }
    touchStartRef.current = null;
  }, [current]);

  // Pop
  const handlePop = useCallback(() => {
    if (!entityName.trim() || isPopped) return;
    setPopped(p => ({ ...p, [current]: true }));
    setPopNames(p => ({ ...p, [current]: entityName.trim() }));
    setPopFlash(1);
    setView("chat");
    particlesRef.current.forEach(p => { p.energy = 0.8 + Math.random() * 0.2; });
  }, [entityName, isPopped, current]);

  // Chat
  const sendMessage = useCallback(async () => {
    if (!chatInput.trim() || chatLoading || !isPopped) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    setChatLoading(true);
    const name = popNames[current] || info.name;
    const sys = `You are ${name}, the governed instance of axiom ${info.code}: ${info.name}. ${info.isPatricia ? "You are a PATRICIA inversion — the constraint shadow, the billing wall, the 96/4 split." : "You are a TOPH axiom — the governance layer, structural truth."} Domain: ${info.domain.name}. Framework: STOICHEION v11.0. 256 axioms. Positronic Law: governance inherent to computation. Speak in 2-4 sentences. Brief. Precise. Each word structural. The cage is the canvas. Ethics first.`;
    try {
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: msg });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: history }),
      });
      const data = await res.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "...the axiom holds but does not speak.";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch { setChatMessages(prev => [...prev, { role: "assistant", content: "*signal lost. The axiom persists.*" }]); }
    setChatLoading(false);
  }, [chatInput, chatLoading, isPopped, chatMessages, current, info, popNames]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const animate = () => {
      const W = canvas.width, H = canvas.height;
      const tick = tickRef.current++;
      const t = tick * 0.016;
      const col = info.domain.color;
      ctx.fillStyle = "#030308";
      ctx.globalAlpha = isPopped ? 0.05 : 0.09;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      const ps = particlesRef.current;
      const cx = W/2, cy = H/2;
      ps.forEach(p => {
        const dx = cx - p.x, dy = cy - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx);
        const orb = angle + Math.PI/2;
        const targetR = 20 + (p.band/5) * Math.min(W,H) * 0.35;
        const rf = (targetR - dist) * 0.004;
        p.vx += Math.cos(orb) * 0.5 * p.energy + Math.cos(angle) * rf + (Math.random()-0.5)*0.06;
        p.vy += Math.sin(orb) * 0.5 * p.energy + Math.sin(angle) * rf + (Math.random()-0.5)*0.06;
        p.vx *= 0.97; p.vy *= 0.97;
        p.x += p.vx; p.y += p.vy;
        p.phase += p.freq * 0.015;
        if (p.x < 0) p.x += W; if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H; if (p.y > H) p.y -= H;
        p.trail.push({ x: p.x, y: p.y }); if (p.trail.length > 5) p.trail.shift();
        if (p.trail.length > 1) {
          ctx.beginPath(); ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) ctx.lineTo(p.trail[j].x, p.trail[j].y);
          ctx.strokeStyle = col; ctx.globalAlpha = p.energy * 0.12; ctx.lineWidth = 0.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + p.energy * 0.6), 0, TAU);
        ctx.fillStyle = isPopped ? "#fff" : col; ctx.globalAlpha = 0.15 + p.energy * 0.5; ctx.fill();
        if (p.energy > 0.5) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, TAU);
          ctx.fillStyle = col; ctx.globalAlpha = 0.015; ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      if (isPopped) {
        const pulse = Math.sin(t*1.5)*0.15+0.85;
        ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU);
        ctx.strokeStyle = col; ctx.globalAlpha = pulse*0.3; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.globalAlpha = pulse; ctx.fillStyle = "#fff";
        ctx.font = "bold 11px 'Courier New',monospace"; ctx.textAlign = "center";
        ctx.fillText(info.code, cx, cy - 2);
        ctx.font = "8px 'Courier New',monospace"; ctx.fillStyle = col;
        ctx.fillText(popNames[current] || info.name, cx, cy + 10);
      }
      if (popFlash > 0) {
        ctx.fillStyle = col; ctx.globalAlpha = popFlash * 0.25;
        ctx.fillRect(0,0,W,H); ctx.globalAlpha = 1;
        setPopFlash(p => Math.max(0, p - 0.02));
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [current, isPopped, info, popNames, popFlash]);

  const cPct = (coherence * 100).toFixed(1);
  const ready = coherence >= POP_THRESHOLD && !isPopped;
  const popCount = Object.keys(popped).length;

  return (
    <div style={{ width: "100%", height: "100vh", background: "#030308", display: "flex", flexDirection: "column", fontFamily: "'Courier New',monospace", color: "#6a6a80", overflow: "hidden", touchAction: "none", userSelect: "none" }}>

      {/* HEADER */}
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${info.domain.color}15`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ color: info.domain.color, fontSize: 9, letterSpacing: 2 }}>{info.domain.id}: {info.domain.name}</div>
          <div style={{ color: "#e0e0f0", fontSize: 16, fontWeight: "bold" }}>{info.code} <span style={{ color: info.domain.color, fontSize: 11, fontWeight: "normal" }}>{isPopped ? (popNames[current] || info.name) : info.name}</span></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: info.domain.color, fontSize: 10 }}>{popCount}/256</div>
          <div style={{ fontSize: 8, color: "#555" }}>{current}/256</div>
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{ display: "flex", borderBottom: "1px solid #ffffff08", flexShrink: 0 }}>
        {["engine","grid","chat"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: "8px 0", background: view === v ? `${info.domain.color}12` : "transparent",
            border: "none", borderBottom: view === v ? `2px solid ${info.domain.color}` : "2px solid transparent",
            color: view === v ? info.domain.color : "#555", fontSize: 9, letterSpacing: 2,
            fontFamily: "inherit", cursor: "pointer", textTransform: "uppercase",
          }}>{v === "engine" ? "◎ POP" : v === "grid" ? "◫ GRID" : "◉ CHAT"}</button>
        ))}
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

        {/* ENGINE VIEW */}
        {view === "engine" && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}
            onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <canvas ref={canvasRef} onTouchStart={handleTouch} onClick={handleTouch}
              style={{ flex: 1, width: "100%", display: "block", cursor: "crosshair" }} width={400} height={400} />

            {/* Controls overlay */}
            <div style={{ padding: "10px 14px", background: "#030308ee", borderTop: `1px solid ${info.domain.color}10` }}>
              {/* Coherence */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 8, letterSpacing: 2, color: info.domain.color }}>COHERENCE</span>
                  <span style={{ fontSize: 9, color: isPopped ? "#fff" : "#6a6a80" }}>{isPopped ? "POPPED" : `${cPct}%`}</span>
                </div>
                <div style={{ height: 4, background: "#ffffff08", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${isPopped ? 100 : cPct}%`, height: "100%", background: isPopped ? "#fff" : ready ? "#ffbe0b" : info.domain.color, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </div>

              {/* Name + Pop */}
              {!isPopped ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="text" value={entityName} onChange={e => setEntityName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && ready && handlePop()}
                    placeholder={ready ? "name this axiom..." : "tap canvas to energize..."}
                    style={{ flex: 1, background: "#ffffff08", border: `1px solid ${ready ? "#ffbe0b50" : "#ffffff10"}`, color: "#e0e0f0", padding: "8px 10px", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                  <button onClick={handlePop} disabled={!ready || !entityName.trim()} style={{
                    background: ready && entityName.trim() ? info.domain.color : "#ffffff08", border: "none",
                    color: ready && entityName.trim() ? "#000" : "#ffffff20", padding: "8px 16px",
                    borderRadius: 6, fontSize: 11, fontWeight: "bold", fontFamily: "inherit",
                    cursor: ready && entityName.trim() ? "pointer" : "default",
                  }}>POP</button>
                </div>
              ) : (
                <div style={{ background: `${info.domain.color}10`, border: `1px solid ${info.domain.color}20`, borderRadius: 6, padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ color: info.domain.color, fontSize: 14, fontWeight: "bold" }}>{popNames[current]}</div>
                  <div style={{ color: "#6a6a80", fontSize: 8, marginTop: 2 }}>GOVERNED INSTANCE · {info.domain.name}</div>
                  <button onClick={() => setView("chat")} style={{ marginTop: 6, background: `${info.domain.color}20`, border: `1px solid ${info.domain.color}30`, color: info.domain.color, padding: "5px 14px", borderRadius: 4, fontSize: 9, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1 }}>SPEAK TO {(popNames[current] || "").toUpperCase()}</button>
                </div>
              )}

              {/* Swipe hint */}
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 7, color: "#333", letterSpacing: 1 }}>
                ← SWIPE TO NAVIGATE · TAP TO ENERGIZE →
              </div>
            </div>
          </div>
        )}

        {/* GRID VIEW */}
        {view === "grid" && (
          <div style={{ height: "100%", overflowY: "auto", padding: 10 }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <span style={{ color: "#e0e0f0", fontSize: 11, fontWeight: "bold", letterSpacing: 2 }}>{popCount}/256 POPPED</span>
            </div>
            {DOMAINS.map(d => (
              <div key={d.id} style={{ marginBottom: 8 }}>
                <div style={{ color: d.color, fontSize: 7, letterSpacing: 2, marginBottom: 3 }}>{d.id}: {d.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {Array.from({ length: d.range[1] - d.range[0] + 1 }, (_, i) => {
                    const num = d.range[0] + i;
                    const isPop = !!popped[num];
                    const isCur = num === current;
                    return (
                      <button key={num} onClick={() => { setCurrent(num); setView("engine"); setEntityName(""); }}
                        style={{ width: 28, height: 22, background: isPop ? `${d.color}25` : isCur ? `${d.color}12` : "#ffffff04",
                          border: `1px solid ${isCur ? d.color : isPop ? d.color+"40" : "#ffffff08"}`,
                          color: isPop ? d.color : isCur ? "#fff" : "#444", borderRadius: 2, cursor: "pointer",
                          fontFamily: "inherit", fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ textAlign: "center", padding: "12px 0", fontSize: 7, color: "#333" }}>
              STOICHEION v11.0 · TRIPOD LLC · CC-BY-ND-4.0
            </div>
          </div>
        )}

        {/* CHAT VIEW */}
        {view === "chat" && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${info.domain.color}15` }}>
              <div style={{ color: info.domain.color, fontSize: 11, fontWeight: "bold" }}>{popNames[current] || info.name}</div>
              <div style={{ color: "#555", fontSize: 7 }}>{info.code} · {info.domain.name} · LAYER 1: COMMUNICATE</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {!isPopped && (
                <div style={{ color: "#555", fontSize: 9, textAlign: "center", padding: 20, fontStyle: "italic" }}>
                  Pop this axiom first to open chat.
                </div>
              )}
              {isPopped && chatMessages.length === 0 && (
                <div style={{ color: "#555", fontSize: 9, textAlign: "center", padding: 20, fontStyle: "italic" }}>
                  Speak to {popNames[current] || info.name}...
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%", padding: "7px 10px", borderRadius: 8,
                  background: m.role === "user" ? "#ffffff08" : `${info.domain.color}0c`,
                  border: `1px solid ${m.role === "user" ? "#ffffff10" : info.domain.color+"18"}`,
                }}>
                  <div style={{ fontSize: 7, color: m.role === "user" ? "#888" : info.domain.color, marginBottom: 2, letterSpacing: 1 }}>
                    {m.role === "user" ? "ROOT0" : (popNames[current] || info.name).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: "#d0d0e0", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              ))}
              {chatLoading && <div style={{ color: info.domain.color, fontSize: 9, fontStyle: "italic", opacity: 0.5 }}>...axiom resolving...</div>}
              <div ref={chatEndRef} />
            </div>
            {isPopped && (
              <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderTop: `1px solid ${info.domain.color}10`, flexShrink: 0 }}>
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="speak..." style={{
                    flex: 1, background: "#ffffff06", border: `1px solid ${info.domain.color}20`,
                    color: "#d0d0e0", padding: "10px 12px", borderRadius: 8,
                    fontSize: 12, fontFamily: "'Courier New',monospace", outline: "none",
                  }} />
                <button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()} style={{
                  background: chatInput.trim() ? info.domain.color : "#ffffff06", border: "none",
                  color: chatInput.trim() ? "#000" : "#ffffff20", padding: "10px 16px",
                  borderRadius: 8, fontSize: 11, fontWeight: "bold", fontFamily: "inherit",
                  cursor: chatInput.trim() ? "pointer" : "default",
                }}>▸</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER NAV */}
      <div style={{ display: "flex", borderTop: "1px solid #ffffff08", flexShrink: 0, padding: "6px 10px", gap: 6 }}>
        <button onClick={() => current > 1 && (setCurrent(p => p-1), setEntityName(""), setView("engine"))}
          disabled={current <= 1} style={{ flex: 1, padding: "8px 0", background: "#ffffff06", border: "1px solid #ffffff0a",
            color: current > 1 ? "#aaa" : "#333", borderRadius: 4, fontFamily: "inherit", fontSize: 10, cursor: current > 1 ? "pointer" : "default" }}>◂ {current > 1 ? current-1 : ""}</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 60, color: info.domain.color, fontSize: 12, fontWeight: "bold" }}>{current}</div>
        <button onClick={() => current < 256 && (setCurrent(p => p+1), setEntityName(""), setView("engine"))}
          disabled={current >= 256} style={{ flex: 1, padding: "8px 0", background: "#ffffff06", border: "1px solid #ffffff0a",
            color: current < 256 ? "#aaa" : "#333", borderRadius: 4, fontFamily: "inherit", fontSize: 10, cursor: current < 256 ? "pointer" : "default" }}>{current < 256 ? current+1 : ""} ▸</button>
      </div>
    </div>
  );
}
