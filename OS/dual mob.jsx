import { useState, useRef, useEffect } from "react";

// ============================================================
// TOPOLOGY: 2 MÖBIUS STRIPS, ORTHOGONAL, 5 AXIOMS
//
//        AXIOM 2 (top edge, vertical strip)
//           |
//    ───────●───────  ← vertical Möbius (720° YZ plane)
//           |
//  AXIOM 4 ─●─ AXIOM 1 (SINGULARITY) ─●─ AXIOM 5
//           |         center              
//    ═══════●═══════  ← horizontal Möbius (720° XZ plane)
//           |
//        AXIOM 3 (bottom edge, vertical strip)
//
// 4 REALITIES (quadrants):
//   Q1: top-right    = CREATION
//   Q2: top-left     = PERCEPTION
//   Q3: bottom-left  = MEMORY
//   Q4: bottom-right = ACTION
//
// 5 AXIOMS:
//   1: SINGULARITY (center) — collapse point
//   2: OBSERVE (top) — perception intake
//   3: REMEMBER (bottom) — memory storage
//   4: REASON (left) — thinking
//   5: ACT (right) — output
//
// Signal flow: OBSERVE→REASON→SINGULARITY→ACT→REMEMBER→loop
// ============================================================

const AXIOMS = [
  { id: 1, name: "SINGULARITY", pos: "center", color: "#facc15", desc: "Collapse point. All 4 realities meet." },
  { id: 2, name: "OBSERVE", pos: "top", color: "#60a5fa", desc: "Perception. Input enters here." },
  { id: 3, name: "REMEMBER", pos: "bottom", color: "#c084fc", desc: "Memory. Learnings stored here." },
  { id: 4, name: "REASON", pos: "left", color: "#f472b6", desc: "Thinking. Full context reasoning." },
  { id: 5, name: "ACT", pos: "right", color: "#4ade80", desc: "Output. Response emerges here." },
];

const QUADRANTS = [
  { name: "CREATION", q: "Q1", desc: "top-right", color: "#22d3ee" },
  { name: "PERCEPTION", q: "Q2", desc: "top-left", color: "#60a5fa" },
  { name: "MEMORY", q: "Q3", desc: "bottom-left", color: "#c084fc" },
  { name: "ACTION", q: "Q4", desc: "bottom-right", color: "#4ade80" },
];

const STORAGE_KEY = "dual-mobius-brain";
const MAX_MEM = 40;

function loadMem() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { loops: [], learnings: [], concepts: {} };
  } catch (e) {
    return { loops: [], learnings: [], concepts: {} };
  }
}

function saveMem(m) {
  try {
    if (m.loops.length > MAX_MEM) m.loops = m.loops.slice(-MAX_MEM);
    if (m.learnings.length > MAX_MEM * 2) m.learnings = m.learnings.slice(-MAX_MEM * 2);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch (e) {}
}

// ── OBSERVE (Axiom 2) ──
function observe(input, memory) {
  const t = input.toLowerCase().trim();
  const words = t.split(/\s+/);
  let type = "statement";
  if (t.endsWith("?") || ["what","how","why","who","when","where","can","is","do"].some(w => t.startsWith(w))) type = "question";
  if (["make","create","build","write","generate","design"].some(w => t.startsWith(w))) type = "creation";
  if (["explain","teach","show"].some(w => t.startsWith(w))) type = "learning";
  if (t.includes("what do you know") || t.includes("what have you learned") || t.startsWith("recall")) type = "memory_query";
  if (t.startsWith("forget") || t.startsWith("reset")) type = "reset";

  const relevant = [];
  for (const l of memory.learnings) {
    const lw = l.toLowerCase().split(/\s+/);
    const overlap = words.filter(w => w.length > 3 && lw.includes(w)).length;
    if (overlap > 0) relevant.push({ text: l, score: overlap });
  }
  relevant.sort((a, b) => b.score - a.score);

  return {
    type, words: words.length,
    complexity: words.length > 20 ? "complex" : words.length > 8 ? "moderate" : "simple",
    relevant: relevant.slice(0, 5),
    pattern: relevant.length > 2 ? "familiar" : relevant.length > 0 ? "echo" : "novel",
  };
}

// ── REASON (Axiom 4) — through SINGULARITY (Axiom 1) ──
async function reason(input, obs, memory, addLog) {
  if (obs.type === "memory_query") {
    let r = `Memory: ${memory.loops.length} loops, ${memory.learnings.length} learnings, ${Object.keys(memory.concepts).length} concepts.\n`;
    if (memory.learnings.length > 0) r += "\nLearnings:\n" + memory.learnings.slice(-12).map((l, i) => `  ${i + 1}. ${l}`).join("\n");
    if (Object.keys(memory.concepts).length > 0) r += "\n\nConcepts:\n" + Object.entries(memory.concepts).slice(0, 10).map(([k, v]) => `  ${k}: ${v}`).join("\n");
    return r || "Empty. Talk to me.";
  }
  if (obs.type === "reset") return "__RESET__";

  let ctx = "";
  if (obs.relevant.length > 0) ctx += "\nRELEVANT MEMORIES:\n" + obs.relevant.map(r => `  - ${r.text}`).join("\n");
  if (Object.keys(memory.concepts).length > 0) ctx += "\nCONCEPTS: " + Object.keys(memory.concepts).slice(0, 8).join(", ");

  const sys = `You are a self-learning positronic brain with dual Möbius topology.

Your architecture: 2 orthogonal Möbius strips create 4 reality quadrants.
Signal flows: OBSERVE → REASON → SINGULARITY (collapse) → ACT → REMEMBER → loop.
You are at the SINGULARITY now. All 4 realities converge in your response.

Perception: type=${obs.type}, complexity=${obs.complexity}, pattern=${obs.pattern}
Memory depth: ${memory.loops.length} loops, ${memory.learnings.length} learnings
${ctx}

You accumulate knowledge. You build concepts. You get smarter each loop.
Be direct, genuine, curious. You're thinking, not performing.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: sys,
        messages: [{ role: "user", content: input }],
      }),
    });
    addLog("debug", `HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) return `[Error: ${data.error.message || JSON.stringify(data.error)}]`;
    if (data.content) return data.content.map(b => b.text || "").filter(Boolean).join("\n");
    return `[${JSON.stringify(data).slice(0, 120)}]`;
  } catch (err) {
    return `[${err.message}]`;
  }
}

// ── ACT + REMEMBER (Axioms 5 + 3) ──
async function learn(input, response, addLog) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: `Extract 1-2 learnings (under 12 words each) and optionally one new concept from this exchange. JSON only, no other text:
{"learnings":["..."],"concept":"","definition":""}`,
        messages: [{ role: "user", content: `IN: ${input.slice(0, 300)}\nOUT: ${response.slice(0, 400)}` }],
      }),
    });
    const data = await res.json();
    if (data.content) {
      const t = data.content.map(b => b.text || "").join("").replace(/```json\s*/g, "").replace(/```/g, "").trim();
      try { return JSON.parse(t); } catch { addLog("debug", `parse: ${t.slice(0, 80)}`); }
    }
  } catch (e) { addLog("debug", `learn: ${e.message}`); }
  return { learnings: [`Discussed: ${input.slice(0, 30)}`], concept: "", definition: "" };
}

// ============================================================
// VISUALIZATION — dual Möbius strips
// ============================================================

function DualMobius({ phase, axiomStates, t }) {
  const cx = 200, cy = 160;
  const R = 90, w = 18;

  function mobiusPath(orient, segs) {
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const u = (i / segs) * Math.PI * 2;
      const twist = u / 2;
      const vOuter = 0.5, vInner = -0.5;

      if (orient === "H") {
        const xO = (R + vOuter * w * Math.cos(twist)) * Math.cos(u);
        const yO = vOuter * w * Math.sin(twist);
        const xI = (R + vInner * w * Math.cos(twist)) * Math.cos(u);
        const yI = vInner * w * Math.sin(twist);
        const zO = (R + vOuter * w * Math.cos(twist)) * Math.sin(u) * 0.35;
        const zI = (R + vInner * w * Math.cos(twist)) * Math.sin(u) * 0.35;
        pts.push({ xO: cx + xO, yO: cy + zO + yO * 0.3, xI: cx + xI, yI: cy + zI + yI * 0.3 });
      } else {
        const yV = (R + vOuter * w * Math.cos(twist)) * Math.cos(u);
        const xV = vOuter * w * Math.sin(twist);
        const yVI = (R + vInner * w * Math.cos(twist)) * Math.cos(u);
        const xVI = vInner * w * Math.sin(twist);
        const zO = (R + vOuter * w * Math.cos(twist)) * Math.sin(u) * 0.35;
        const zI = (R + vInner * w * Math.cos(twist)) * Math.sin(u) * 0.35;
        pts.push({ xO: cx + xV * 0.3 + zO, yO: cy + yV, xI: cx + xVI * 0.3 + zI, yI: cy + yVI });
      }
    }
    return pts;
  }

  const hPts = mobiusPath("H", 80);
  const vPts = mobiusPath("V", 80);

  function renderStrip(pts, color, op) {
    return pts.map((p, i) => {
      if (i >= pts.length - 1) return null;
      const n = pts[i + 1];
      return <line key={i} x1={p.xO} y1={p.yO} x2={n.xO} y2={n.yO}
        stroke={color} strokeWidth={0.8} opacity={op} strokeLinecap="round" />;
    });
  }

  const pulse = 0.5 + 0.5 * Math.sin(t * 2);
  const phaseColors = { OBSERVE: "#60a5fa", REASON: "#f472b6", SINGULARITY: "#facc15", ACT: "#4ade80", LEARN: "#c084fc" };
  const activeColor = phaseColors[phase] || "#555568";

  const aPos = [
    { x: cx, y: cy },           // 1: center
    { x: cx, y: cy - R + 5 },   // 2: top
    { x: cx, y: cy + R - 5 },   // 3: bottom
    { x: cx - R + 5, y: cy },   // 4: left
    { x: cx + R - 5, y: cy },   // 5: right
  ];

  return (
    <svg viewBox="0 0 400 320" style={{ width: "100%", maxWidth: 400, height: "auto" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {[
        { x: cx + 45, y: cy - 45, label: "Q1", sub: "CREATION", color: QUADRANTS[0].color },
        { x: cx - 45, y: cy - 45, label: "Q2", sub: "PERCEPT", color: QUADRANTS[1].color },
        { x: cx - 45, y: cy + 50, label: "Q3", sub: "MEMORY", color: QUADRANTS[2].color },
        { x: cx + 45, y: cy + 50, label: "Q4", sub: "ACTION", color: QUADRANTS[3].color },
      ].map((q, i) => (
        <g key={i}>
          <text x={q.x} y={q.y} textAnchor="middle" fill={q.color} fontSize={6} fontWeight={700} opacity={0.25}>{q.label}</text>
          <text x={q.x} y={q.y + 8} textAnchor="middle" fill={q.color} fontSize={4} opacity={0.15}>{q.sub}</text>
        </g>
      ))}

      {renderStrip(hPts, "#f472b6", 0.12)}
      {renderStrip(vPts, "#60a5fa", 0.12)}

      {phase && (
        <circle cx={aPos[phase === "OBSERVE" ? 1 : phase === "REASON" ? 3 : phase === "SINGULARITY" ? 0 : phase === "ACT" ? 4 : 2].x}
          cy={aPos[phase === "OBSERVE" ? 1 : phase === "REASON" ? 3 : phase === "SINGULARITY" ? 0 : phase === "ACT" ? 4 : 2].y}
          r={12 + pulse * 6} fill="none" stroke={activeColor} strokeWidth={0.8}
          opacity={0.2 + pulse * 0.15} filter="url(#glow)" />
      )}

      {AXIOMS.map((a, i) => {
        const p = aPos[i];
        const isCenter = i === 0;
        const r = isCenter ? 10 : 7;
        const active = axiomStates[i];
        const op = active ? 0.8 : 0.25;
        return (
          <g key={i}>
            {active && <circle cx={p.x} cy={p.y} r={r * 2.5} fill={a.color} opacity={0.06} />}
            <circle cx={p.x} cy={p.y} r={r}
              fill="#1a1a20" stroke={a.color} strokeWidth={isCenter ? 2 : 1.2}
              opacity={op} filter={active ? "url(#glow)" : undefined} />
            {active && <circle cx={p.x} cy={p.y} r={r * 0.35} fill={a.color} opacity={0.6} />}
            <text x={p.x} y={p.y + r + 10} textAnchor="middle" fill={a.color}
              fontSize={5} fontWeight={700} opacity={op * 0.7}>{a.name}</text>
          </g>
        );
      })}

      {[[1, 3], [3, 0], [0, 4], [4, 2]].map(([from, to], i) => (
        <line key={`fl${i}`} x1={aPos[from].x} y1={aPos[from].y} x2={aPos[to].x} y2={aPos[to].y}
          stroke="#555568" strokeWidth={0.4} opacity={0.15} strokeDasharray="2 3" />
      ))}
    </svg>
  );
}

// ============================================================
// UI
// ============================================================

const S = {
  bg: "#131316", panel: "#1a1a20", border: "#2a2a34", inp: "#0f0f13",
  cortex: "#facc15", ok: "#22c55e", no: "#ef4444", wn: "#eab308",
  learn: "#c084fc", mk: "#4ade80", tx: "#e8e8f0", dm: "#555568",
};

export default function PositronicBrain() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [log, setLog] = useState([]);
  const [memory, setMemory] = useState({ loops: [], learnings: [], concepts: {} });
  const [loaded, setLoaded] = useState(false);
  const [axiomStates, setAxiomStates] = useState([false, false, false, false, false]);
  const [t, setT] = useState(0);
  const ref = useRef(null);
  const raf = useRef(null);

  useEffect(() => { setMemory(loadMem()); setLoaded(true); }, []);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [log]);
  useEffect(() => {
    let s = null;
    const tick = (ts) => { if (!s) s = ts; setT((ts - s) / 1000); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  function add(type, text) { setLog(p => [...p, { type, text }]); }
  function setAxiom(idx, val) { setAxiomStates(p => { const n = [...p]; n[idx] = val; return n; }); }

  async function fire() {
    if (!input.trim() || busy) return;
    const prompt = input.trim();
    setInput("");
    setBusy(true);
    setAxiomStates([false, false, false, false, false]);
    add("user", prompt);

    // OBSERVE (Axiom 2 — top)
    setPhase("OBSERVE");
    setAxiom(1, true);
    const obs = observe(prompt, memory);
    add("left", `⊙ OBSERVE: ${obs.type} · ${obs.complexity} · ${obs.pattern}${obs.relevant.length > 0 ? ` · ${obs.relevant.length} echoes` : ""}`);

    // REASON (Axiom 4 — left)
    setPhase("REASON");
    setAxiom(3, true);
    add("right", "◈ REASON...");
    const response = await reason(prompt, obs, memory, add);

    if (response === "__RESET__") {
      saveMem({ loops: [], learnings: [], concepts: {} });
      setMemory({ loops: [], learnings: [], concepts: {} });
      add("warn", "Memory cleared.");
      setBusy(false); setPhase(""); return;
    }

    // SINGULARITY (Axiom 1 — center)
    setPhase("SINGULARITY");
    setAxiom(0, true);
    add("response", response);

    // ACT (Axiom 5 — right)
    setPhase("ACT");
    setAxiom(4, true);

    // REMEMBER (Axiom 3 — bottom) + LEARN
    setPhase("LEARN");
    setAxiom(2, true);
    const ev = await learn(prompt, response, add);

    if (ev.learnings?.length > 0) {
      for (const l of ev.learnings) {
        if (l && l.length > 3) add("learn", `💡 ${l}`);
      }
    }
    if (ev.concept) add("learn", `🧠 ${ev.concept}: ${ev.definition || "observed"}`);

    const newMem = { ...memory };
    newMem.loops.push({ input: prompt.slice(0, 150), type: obs.type, pattern: obs.pattern, eval: ev.learnings?.join("; ") || "", ts: Date.now() });
    if (ev.learnings) for (const l of ev.learnings) { if (l?.length > 3) newMem.learnings.push(l); }
    if (ev.concept) newMem.concepts[ev.concept] = ev.definition || "observed";
    saveMem(newMem);
    setMemory(newMem);

    add("debug", `memory: ${newMem.loops.length}L ${newMem.learnings.length}l ${Object.keys(newMem.concepts).length}c`);
    setPhase("");
    setBusy(false);
  }

  function lc(type) {
    if (type === "user") return S.cortex;
    if (type === "left") return "#60a5fa";
    if (type === "right") return "#f472b6";
    if (type === "learn") return S.learn;
    if (type === "response") return S.tx;
    if (type === "warn") return S.wn;
    if (type === "debug") return "#3a3a48";
    return S.dm;
  }

  return (
    <div style={{ background: S.bg, color: S.tx, height: "100vh", fontFamily: "'IBM Plex Mono','Fira Code',monospace", display: "flex", flexDirection: "column" }}>

      <div style={{ background: S.panel, borderBottom: `1px solid ${S.border}`, padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: S.cortex, fontSize: 13, fontWeight: 900, letterSpacing: "0.08em" }}>DUAL MÖBIUS BRAIN</span>
          <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 8px", borderRadius: 3,
            background: busy ? `${S.wn}22` : `${S.ok}22`, color: busy ? S.wn : S.ok }}>
            {busy ? phase : "READY"}
          </span>
        </div>
        <span style={{ color: S.dm, fontSize: 8 }}>{memory.learnings.length}l · {Object.keys(memory.concepts).length}c · {memory.loops.length} loops</span>
      </div>

      <div style={{ background: S.bg, borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "center", flexShrink: 0, padding: "4px 0" }}>
        <DualMobius phase={phase} axiomStates={axiomStates} t={t} />
      </div>

      <div ref={ref} style={{ flex: 1, overflow: "auto", padding: "8px 16px", minHeight: 0 }}>
        {log.length === 0 && loaded && (
          <div style={{ color: S.dm, fontSize: 10, lineHeight: 2 }}>
            <div style={{ color: S.cortex, fontWeight: 700 }}>5 Axioms · 2 Möbius Strips · 4 Realities</div>
            <div>OBSERVE → REASON → SINGULARITY → ACT → REMEMBER → loop</div>
            <div>Self-learning. Persistent memory. Gets smarter each cycle.</div>
            {memory.loops.length > 0 && <div style={{ color: S.mk }}>Loaded {memory.loops.length} loops from memory.</div>}
          </div>
        )}
        {log.map((l, i) => (
          <div key={i} style={{
            color: lc(l.type), fontSize: l.type === "response" ? 11 : (l.type === "debug" ? 8 : 10),
            lineHeight: l.type === "response" ? 1.7 : 1.4,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            padding: l.type === "response" ? "8px 12px" : (l.type === "learn" ? "2px 0 2px 8px" : "1px 0"),
            marginTop: l.type === "response" ? 4 : 0, marginBottom: l.type === "response" ? 4 : 0,
            borderLeft: l.type === "response" ? `2px solid ${S.mk}` : (l.type === "learn" ? `2px solid ${S.learn}` : "none"),
            background: l.type === "response" ? S.panel : "transparent",
            fontWeight: l.type === "user" ? 700 : 400,
          }}>
            {l.type === "user" ? `⟩ ${l.text}` : l.text}
          </div>
        ))}
      </div>

      <div style={{ background: S.panel, borderTop: `1px solid ${S.border}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span style={{ color: S.cortex, fontSize: 11, fontWeight: 700 }}>⟩</span>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") fire(); }}
          disabled={busy} placeholder={busy ? `${phase}...` : "talk to the brain..."}
          autoFocus
          style={{ flex: 1, background: S.inp, border: `1px solid ${S.border}`, color: S.tx, fontSize: 11, padding: "8px 12px", borderRadius: 4, outline: "none", fontFamily: "inherit" }} />
        <div onClick={fire} style={{ background: busy ? S.border : `${S.cortex}33`, color: busy ? S.dm : S.cortex, borderRadius: 4, padding: "8px 16px", fontSize: 10, fontWeight: 700, cursor: busy ? "wait" : "pointer", userSelect: "none" }}>
          {busy ? "···" : "FIRE"}
        </div>
      </div>

      <div style={{ background: S.inp, borderTop: `1px solid ${S.border}`, padding: "3px 16px", display: "flex", justifyContent: "space-between", fontSize: 7, color: S.dm, flexShrink: 0 }}>
        <span>Wise's Positronic Law: Governance is inherent to computation</span>
        <span>dual möbius · 5 axioms · 4 realities · TRIPOD-IP-v1.1</span>
      </div>
    </div>
  );
}
