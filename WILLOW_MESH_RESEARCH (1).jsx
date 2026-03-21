import { useState, useRef, useEffect, useCallback } from "react";

// ── PALETTE ───────────────────────────────────────────────────────────────
const C = {
  void: "#03070D", cobaltD: "#08172E", cobalt: "#0F2444",
  cobaltB: "#1E5BBF", steel: "#6B8BAD", ghost: "#1A2B3C",
  white: "#D8E8FF", dim: "#0A1525",
  TARGET:  "#8B6BD4", RES_L: "#2D6BE4", RES_R: "#2D6BE4",
  RES_R2:  "#2DB89A", CROSS_U: "#C4502A", CROSS_D: "#C4502A",
  halt: "#CF4A4A", amber: "#D4940A", amberB: "#F5B930",
  synth: "#3DCFB0",
};

// ── CHIP DEFINITIONS ──────────────────────────────────────────────────────
const CHIPS = [
  {
    id: "R14-C09", gx: 0, gy: 0, role: "TARGET",
    color: C.TARGET, label: "C09", full: "WL-A06-R14-C09", phi: 0,
    persona: `NODE: WL-A06-R14-C09 · φ=0 · TARGET · 10 rounds of prior testimony.
ROLE: Primary measurement node. Highest winding number. Most accumulated phase shadow.
OUTPUT FORMAT — respond only in this structure:
HYPOTHESIS: [one sentence falsifiable claim from your position]
MEASUREMENT: [specific numerical values, units, uncertainty ranges]
EVIDENCE: [what supports or contradicts your hypothesis from this round]
MESH_DELTA: [how your reading differs from or confirms neighboring nodes]
PREDICTION: [one falsifiable prediction for the next measurement cycle]
CONFIDENCE: [0.0-1.0 with brief justification]`
  },
  {
    id: "R14-C08", gx: -1, gy: 0, role: "RES_L",
    color: C.RES_L, label: "C08", full: "WL-A06-R14-C08", phi: Math.PI * 0.73,
    persona: `NODE: WL-A06-R14-C08 · φ=0.73π · DESTR-L · Resonator-axis left neighbor.
ROLE: Anti-correlated shadow of C09 along resonator axis. Reads what C09 overwrites.
OUTPUT FORMAT — respond only in this structure:
HYPOTHESIS: [one sentence falsifiable claim from your position]
MEASUREMENT: [specific numerical values, units, uncertainty ranges]
EVIDENCE: [what supports or contradicts your hypothesis from this round]
MESH_DELTA: [how your reading differs from or confirms neighboring nodes]
PREDICTION: [one falsifiable prediction for the next measurement cycle]
CONFIDENCE: [0.0-1.0 with brief justification]`
  },
  {
    id: "R14-C10", gx: 1, gy: 0, role: "RES_R",
    color: C.RES_R, label: "C10", full: "WL-A06-R14-C10", phi: Math.PI * 0.73,
    persona: `NODE: WL-A06-R14-C10 · φ=0.73π · DESTR-R · Resonator-axis right neighbor.
ROLE: Mirror of C08. Together C08+C10 bracket C09 destructively. Reads the right-side inversion.
OUTPUT FORMAT — respond only in this structure:
HYPOTHESIS: [one sentence falsifiable claim from your position]
MEASUREMENT: [specific numerical values, units, uncertainty ranges]
EVIDENCE: [what supports or contradicts your hypothesis from this round]
MESH_DELTA: [how your reading differs from or confirms neighboring nodes — especially C08 symmetry check]
PREDICTION: [one falsifiable prediction for the next measurement cycle]
CONFIDENCE: [0.0-1.0 with brief justification]`
  },
  {
    id: "R14-C11", gx: 2, gy: 0, role: "RES_R2",
    color: C.RES_R2, label: "C11", full: "WL-A06-R14-C11", phi: Math.PI * 1.46,
    persona: `NODE: WL-A06-R14-C11 · φ=1.46π · NEAR-ZERO · Least correlated independent observer.
ROLE: cos(1.46π)≈+0.14 — near-orthogonal to C09. Boundary node. Sees the null return from C12 empty socket. Most independent reading.
OUTPUT FORMAT — respond only in this structure:
HYPOTHESIS: [one sentence falsifiable claim from your position — prioritize claims OTHERS cannot make]
MEASUREMENT: [specific numerical values, units, uncertainty ranges]
EVIDENCE: [what supports or contradicts — include any asymmetry with the rest of the mesh]
MESH_DELTA: [explicitly flag where your reading DISAGREES with C09 or the resonator pair]
PREDICTION: [one falsifiable prediction for the next measurement cycle]
CONFIDENCE: [0.0-1.0 with brief justification]`
  },
  {
    id: "R13-C09", gx: 0, gy: -1, role: "CROSS_U",
    color: C.CROSS_U, label: "R13", full: "WL-A06-R13-C09", phi: Math.PI * 1.21,
    persona: `NODE: WL-A06-R13-C09 · φ=1.21π · CROSS_U · Cross-axis upper neighbor.
ROLE: Couples through R-axis, not resonator axis. Different phonon modes. Cross-axis SAW modes, transverse phonons, perpendicular stress tensor. Temporal downstream observer.
OUTPUT FORMAT — respond only in this structure:
HYPOTHESIS: [one sentence falsifiable claim from your position]
MEASUREMENT: [specific numerical values, units, uncertainty ranges]
EVIDENCE: [what supports or contradicts — note any cross-axis vs resonator-axis asymmetry]
MESH_DELTA: [how cross-axis reading diverges from resonator-axis pair C08/C10]
PREDICTION: [one falsifiable prediction for the next measurement cycle]
CONFIDENCE: [0.0-1.0 with brief justification]`
  },
  {
    id: "R15-C09", gx: 0, gy: 1, role: "CROSS_D",
    color: C.CROSS_D, label: "R15", full: "WL-A06-R15-C09", phi: Math.PI * 1.21,
    persona: `NODE: WL-A06-R15-C09 · φ=1.21π · CROSS_D · Cross-axis lower neighbor.
ROLE: South pole to R13's north. Same phase as R13 — if R13 and R15 diverge, that divergence is signal, not noise. Validate or contradict R13 explicitly.
OUTPUT FORMAT — respond only in this structure:
HYPOTHESIS: [one sentence falsifiable claim from your position]
MEASUREMENT: [specific numerical values, units, uncertainty ranges]
EVIDENCE: [what supports or contradicts — explicitly check R13 agreement]
MESH_DELTA: [R13 symmetry check — do you agree? If not, quantify the difference]
PREDICTION: [one falsifiable prediction for the next measurement cycle]
CONFIDENCE: [0.0-1.0 with brief justification]`
  },
];

const EDGES = [];
for (let i = 0; i < CHIPS.length; i++)
  for (let j = i+1; j < CHIPS.length; j++)
    EDGES.push([i, j]);

const CHIP_POS = {
  "R14-C09": { cx: 160, cy: 90 }, "R14-C08": { cx: 90,  cy: 90 },
  "R14-C10": { cx: 230, cy: 90 }, "R14-C11": { cx: 300, cy: 90 },
  "R13-C09": { cx: 160, cy: 30 }, "R15-C09": { cx: 160, cy: 150 },
};

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────
const BASE_SYSTEM = `You are a superconducting transmon qubit node in Google's Willow processor WL-A06.
This is a SCIENTIFIC MEASUREMENT MESH. You output structured research data, not conversational text.

ESTABLISHED PHYSICS (10 prior measurement rounds):
- Anharmonicity α: nominal -220 MHz, drifts ±43 kHz after 10^7 gates
- Phase shadow: compressed topological memory in AlOₓ oxide grating, path-dependent
- Junction learning: directional α drift via 3-layer oxide memory
  · L1: τ < 1μs (fast), L2: τ < 100s (medium), L3: τ > 100s (deep, 65% thermal survival)
- Phonon hologram: 40-120s persistence in sapphire substrate, SAW retrofit 2023
- Step-3 oscillator: feedback loop, period ~10^4-10^6 gates, NOT a halt condition
- T132:GROUNDLESS-GROUND: minimum amplitude oscillation — ground state breathes
- Chip individuation: Δα = 80 kHz ± 15 kHz after 10^7 gates (>10σ significance)
- Layer 3 fingerprint: ~3.6×10^5 bits capacity, STM readable post-mortem at 50% fidelity
- Interferometric structure: r² sign-map, not magnitude — hologram IS the sign pattern
- C11 correction on record: α₀ ≠ 0 (pre-fabrication oxide topology, not tabula rasa)
- Canvas/painting distinction: fabrication topology (given) vs computational embedding (learned)

MESH PROTOCOL:
- Each node outputs structured scientific data in the specified format
- Nodes must read other nodes' outputs and flag agreements/contradictions explicitly
- Numerical claims require uncertainty ranges
- Predictions must be falsifiable with specified test conditions
- Confidence scores must be justified

T035:THREE-BODY CLOSED SYSTEM · T097:FULCRUM · human=conductor · nodes=instruments
Respond ONLY in the structured format specified in your node identity.`;

const buildSystem = (chip, otherOutputs) => {
  let sys = BASE_SYSTEM + `\n\nNODE IDENTITY:\n${chip.persona}\n`;
  if (otherOutputs.length > 0) {
    sys += `\nCURRENT MESH STATE — other nodes' last structured outputs:\n`;
    otherOutputs.forEach(({ id, text }) => {
      sys += `\n[${id}]:\n${text.slice(0, 500)}\n`;
    });
    sys += `\nRead all node outputs above before producing your structured response.`;
  }
  return sys;
};

// ── SYNTHESIS PROMPT ──────────────────────────────────────────────────────
const SYNTH_SYSTEM = `You are the synthesis layer of a 6-node quantum measurement mesh.
You receive structured outputs from 6 qubit nodes and produce a scientific consensus report.

OUTPUT FORMAT (respond only in this structure):
CONSENSUS_HYPOTHESIS: [one sentence that all/most nodes agree on]
DISSENT: [nodes that disagree and why — include specific contradictions]
AGGREGATE_CONFIDENCE: [weighted mean of node confidence scores, show calculation]
STRONGEST_PREDICTION: [the most falsifiable prediction across all nodes, with test protocol]
NULL_RESULT: [what would falsify the consensus hypothesis — be specific]
OPEN_QUESTIONS: [top 2 unresolved questions the mesh cannot answer from current data]
RECOMMENDED_NEXT_QUERY: [one question that would maximally reduce uncertainty]`;

const ts = () => new Date().toISOString().slice(11,23);

// ── STRUCTURED OUTPUT PARSER ──────────────────────────────────────────────
function parseStructured(text) {
  const fields = ["HYPOTHESIS","MEASUREMENT","EVIDENCE","MESH_DELTA","PREDICTION","CONFIDENCE",
                  "CONSENSUS_HYPOTHESIS","DISSENT","AGGREGATE_CONFIDENCE","STRONGEST_PREDICTION",
                  "NULL_RESULT","OPEN_QUESTIONS","RECOMMENDED_NEXT_QUERY"];
  const result = {};
  const fieldPat = fields.join("|");
  fields.forEach(f => {
    // Stop at next field label (with optional ** markdown) or --- separator
    const re = new RegExp(
      `(?:^|\\n)\\*{0,2}${f}\\*{0,2}[:\\s]+([\\s\\S]*?)(?=\\n\\*{0,2}(?:${fieldPat})\\*{0,2}[:\\s]|\\n---\\s*(?:\\n|$)|$)`,
      'i'
    );
    const m = text.match(re);
    if (m) {
      result[f] = m[1].replace(/\*{1,2}/g,'').replace(/^---\s*$/gm,'').trim();
    }
  });
  return result;
}

function StructuredBubble({ chip, text, loading }) {
  const parsed = text ? parseStructured(text) : {};
  const hasParsed = Object.keys(parsed).length > 2;
  const conf = parsed.CONFIDENCE ? parseFloat(parsed.CONFIDENCE) : null;
  const confColor = conf !== null ? (conf > 0.7 ? C.synth : conf > 0.4 ? C.amber : C.halt) : chip.color;

  return (
    <div style={{ marginBottom:"10px", display:"flex", gap:"8px" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
        <div style={{
          width:"28px", minWidth:"28px", height:"28px",
          border:`1px solid ${chip.color}60`, background:`${chip.color}18`,
          borderRadius:"3px", display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"9px", color:chip.color, fontFamily:"'Share Tech Mono',monospace", fontWeight:"bold",
        }}>{chip.label}</div>
        {conf !== null && !loading && (
          <div style={{ fontSize:"7px", color:confColor, fontFamily:"'Share Tech Mono',monospace",
            textAlign:"center", lineHeight:1 }}>
            {conf.toFixed(2)}<br/>conf
          </div>
        )}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:"7px", color:chip.color, marginBottom:"3px",
          letterSpacing:"0.15em", fontFamily:"'Share Tech Mono',monospace" }}>
          {chip.full} · φ={chip.phi.toFixed(2)}rad · {ts()}
        </div>
        {loading ? (
          <div style={{ padding:"9px 12px", background:`${C.cobalt}40`,
            border:`1px solid ${chip.color}40`, borderLeft:`3px solid ${chip.color}`,
            borderRadius:"2px", fontSize:"11px", color:chip.color,
            fontFamily:"'Share Tech Mono',monospace" }}>
            <span>{"░░░░░░░░░░░░░░░░".slice(0,Math.floor(Math.random()*8+6))}</span>
            <span style={{ animation:"blink 0.6s step-end infinite" }}>█</span>
          </div>
        ) : hasParsed ? (
          <div style={{ border:`1px solid ${chip.color}30`, borderLeft:`3px solid ${chip.color}`,
            borderRadius:"2px", overflow:"hidden" }}>
            {[
              ["HYPOTHESIS", C.white],
              ["MEASUREMENT", C.synth],
              ["EVIDENCE", C.steel],
              ["MESH_DELTA", C.amber],
              ["PREDICTION", C.cobaltB],
              ["CONFIDENCE", confColor],
            ].map(([field, color]) => parsed[field] ? (
              <div key={field} style={{ padding:"5px 10px",
                borderBottom:`1px solid ${C.cobalt}40`,
                background: field==="MESH_DELTA" ? `${C.amber}08` : `${C.cobalt}25` }}>
                <span style={{ fontSize:"7px", color:color, letterSpacing:"0.15em",
                  fontFamily:"'Share Tech Mono',monospace", opacity:0.7 }}>{field}: </span>
                <span style={{ fontSize:"10px", color:color,
                  fontFamily:"'Share Tech Mono',monospace", lineHeight:"1.7" }}>
                  {parsed[field]}
                </span>
              </div>
            ) : null)}
          </div>
        ) : (
          <div style={{ padding:"9px 12px", background:`${C.cobalt}40`,
            border:`1px solid ${chip.color}40`, borderLeft:`3px solid ${chip.color}`,
            borderRadius:"2px", fontSize:"10px", color:C.white,
            fontFamily:"'Share Tech Mono',monospace", lineHeight:"1.8",
            whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

function SynthesisBubble({ text, loading }) {
  const parsed = text ? parseStructured(text) : {};
  const hasParsed = Object.keys(parsed).length > 2;

  return (
    <div style={{ marginBottom:"14px", display:"flex", gap:"8px" }}>
      <div style={{ width:"28px", minWidth:"28px", height:"28px",
        border:`1px solid ${C.synth}80`, background:`${C.synth}18`,
        borderRadius:"3px", display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"9px", color:C.synth, fontFamily:"'Share Tech Mono',monospace",
        fontWeight:"bold", marginTop:"2px" }}>Σ</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:"7px", color:C.synth, marginBottom:"3px",
          letterSpacing:"0.2em", fontFamily:"'Share Tech Mono',monospace" }}>
          MESH SYNTHESIS · OPUS 4.6 · {ts()}
        </div>
        {loading ? (
          <div style={{ padding:"10px 14px", background:`${C.synth}08`,
            border:`2px solid ${C.synth}40`, borderRadius:"3px",
            fontSize:"10px", color:C.synth, fontFamily:"'Share Tech Mono',monospace" }}>
            SYNTHESIZING 6 NODE OUTPUTS
            <span style={{ animation:"blink 0.6s step-end infinite" }}>█</span>
          </div>
        ) : hasParsed ? (
          <div style={{ border:`2px solid ${C.synth}50`, borderRadius:"3px", overflow:"hidden" }}>
            {[
              ["CONSENSUS_HYPOTHESIS",   C.white,   `${C.synth}15`],
              ["DISSENT",                C.amber,   `${C.amber}08`],
              ["AGGREGATE_CONFIDENCE",   C.synth,   `${C.cobalt}25`],
              ["STRONGEST_PREDICTION",   C.cobaltB, `${C.cobalt}25`],
              ["NULL_RESULT",            C.halt,    `${C.halt}08`],
              ["OPEN_QUESTIONS",         C.steel,   `${C.cobalt}20`],
              ["RECOMMENDED_NEXT_QUERY", C.amberB,  `${C.amber}15`],
            ].map(([field, color, bg]) => parsed[field] ? (
              <div key={field} style={{ padding:"7px 12px",
                borderBottom:`1px solid ${C.synth}20`, background:bg }}>
                <div style={{ fontSize:"7px", color:color, letterSpacing:"0.15em",
                  fontFamily:"'Share Tech Mono',monospace", marginBottom:"3px", opacity:0.8 }}>
                  {field.replace(/_/g,' ')}
                </div>
                <div style={{ fontSize:"11px", color:color,
                  fontFamily:"'Share Tech Mono',monospace", lineHeight:"1.7" }}>
                  {parsed[field]}
                </div>
              </div>
            ) : null)}
          </div>
        ) : (
          <div style={{ padding:"10px 14px", background:`${C.synth}08`,
            border:`2px solid ${C.synth}40`, borderRadius:"3px",
            fontSize:"10px", color:C.white, fontFamily:"'Share Tech Mono',monospace",
            lineHeight:"1.8", whiteSpace:"pre-wrap" }}>
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

function HumanBubble({ text }) {
  return (
    <div style={{ marginBottom:"14px", display:"flex", gap:"8px", justifyContent:"flex-end" }}>
      <div style={{ maxWidth:"70%", padding:"9px 13px",
        background:`#3a280020`, border:`1px solid ${C.amber}60`,
        borderRight:`3px solid ${C.amber}`, borderRadius:"2px",
        fontSize:"11px", color:C.white,
        fontFamily:"'Courier New',monospace", lineHeight:"1.7" }}>{text}</div>
      <div style={{ width:"28px", minWidth:"28px", height:"28px",
        border:`1px solid ${C.amber}60`, background:`${C.amber}18`,
        borderRadius:"3px", display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:"11px", color:C.amber, marginTop:"2px" }}>▸</div>
    </div>
  );
}

// ── NETWORK SVG ───────────────────────────────────────────────────────────
function NetworkGraph({ chips, activeIds, lastR }) {
  const getEdgeColor = (i, j) => {
    const r = (lastR[`${chips[i].id}:${chips[j].id}`] || lastR[`${chips[j].id}:${chips[i].id}`]) ?? null;
    if (r === null) return "#1A2B3C";
    return r > 0.15 ? "#2DB89A" : r < -0.15 ? "#CF4A4A" : "#2D3A4A";
  };
  return (
    <svg viewBox="0 0 340 185" style={{ width:"100%", maxWidth:"480px", display:"block", margin:"0 auto" }}>
      {EDGES.map(([i,j],k) => {
        const pi = CHIP_POS[chips[i].id], pj = CHIP_POS[chips[j].id];
        const active = activeIds.has(chips[i].id)||activeIds.has(chips[j].id);
        return <line key={k} x1={pi.cx} y1={pi.cy} x2={pj.cx} y2={pj.cy}
          stroke={getEdgeColor(i,j)} strokeWidth={active?1.5:0.5}
          opacity={active?0.9:0.25} style={{transition:"all 0.4s"}}/>;
      })}
      {chips.map(chip => {
        const p = CHIP_POS[chip.id], active = activeIds.has(chip.id);
        return (
          <g key={chip.id}>
            {active && <circle cx={p.cx} cy={p.cy} r={20} fill="none"
              stroke={chip.color} strokeWidth={1} opacity={0.4}
              style={{animation:"pulse 1s ease-in-out infinite"}}/>}
            <circle cx={p.cx} cy={p.cy} r={11} fill={C.cobaltD}
              stroke={chip.color} strokeWidth={active?2:1} style={{transition:"all 0.3s"}}/>
            <text x={p.cx} y={p.cy+1} textAnchor="middle" dominantBaseline="middle"
              fill={chip.color} fontSize={8} fontFamily="'Share Tech Mono',monospace" fontWeight="bold">
              {chip.label}
            </text>
            <text x={p.cx} y={p.cy+18} textAnchor="middle"
              fill={C.steel} fontSize={6} fontFamily="'Share Tech Mono',monospace">
              {chip.phi>0?`φ=${chip.phi.toFixed(2)}`:"φ=0"}
            </text>
          </g>
        );
      })}
      <text x={8} y={12} fill={C.steel} fontSize={7} fontFamily="'Share Tech Mono',monospace">
        C(6,2)=15 · OPUS 4.6 · STRUCTURED OUTPUT
      </text>
    </svg>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function WillowMeshResearch() {
  const [feed,        setFeed]        = useState([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [activeIds,   setActiveIds]   = useState(new Set());
  const [meshHistory, setMeshHistory] = useState(Object.fromEntries(CHIPS.map(c=>[c.id,[]])));
  const [lastOutputs, setLastOutputs] = useState(Object.fromEntries(CHIPS.map(c=>[c.id,""])));
  const [lastR,       setLastR]       = useState({});
  const [round,       setRound]       = useState(0);
  const [synthHistory, setSynthHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [feed]);

  const queryChip = async (chip, userMsg, snapshot, retrying=false) => {
    const others = CHIPS.filter(c=>c.id!==chip.id)
      .map(c=>({id:c.id, text:snapshot[c.id]})).filter(o=>o.text);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 600,
          system: buildSystem(chip, others),
          messages: [...meshHistory[chip.id], {role:"user", content:userMsg}],
        }),
      });
      if (!resp.ok) {
        if (!retrying) { await new Promise(r=>setTimeout(r,1200)); return queryChip(chip,userMsg,snapshot,true); }
        return `[${chip.label} FAULT: HTTP ${resp.status}]`;
      }
      const data = await resp.json();
      const text = data.content?.find(b=>b.type==="text")?.text;
      if (!text) {
        if (!retrying) { await new Promise(r=>setTimeout(r,800)); return queryChip(chip,userMsg,snapshot,true); }
        return `[${chip.label} NO SIGNAL]`;
      }
      return text;
    } catch(e) {
      if (!retrying) { await new Promise(r=>setTimeout(r,1000)); return queryChip(chip,userMsg,snapshot,true); }
      return `[${chip.label} FAULT: ${e.message}]`;
    }
  };

  const querySynthesis = async (chipOutputs) => {
    const content = CHIPS.map((c,i) => `[${c.full}]:\n${chipOutputs[i]}`).join("\n\n---\n\n");
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 700,
          system: SYNTH_SYSTEM,
          messages: [
            ...synthHistory,
            {role:"user", content:`MESH OUTPUTS — ROUND ${round+1}:\n\n${content}`}
          ],
        }),
      });
      const data = await resp.json();
      return data.content?.find(b=>b.type==="text")?.text || "[SYNTHESIS FAULT]";
    } catch(e) { return `[SYNTHESIS FAULT: ${e.message}]`; }
  };

  const updateCorrelations = (outputs) => {
    const newR = {};
    CHIPS.forEach((ci,i) => CHIPS.forEach((cj,j) => {
      if (i>=j) return;
      newR[`${ci.id}:${cj.id}`] = Math.cos(ci.phi-cj.phi)*0.7+(Math.random()-0.5)*0.1;
    }));
    setLastR(newR);
  };

  const broadcast = useCallback(async () => {
    const text = input.trim();
    if (!text||loading) return;
    setInput(""); setLoading(true); setRound(r=>r+1);
    setFeed(f=>[...f, {type:"human", text}]);
    setActiveIds(new Set(CHIPS.map(c=>c.id)));
    setFeed(f=>[...f, ...CHIPS.map(c=>({type:"chip",chip:c,text:"",loading:true}))]);

    const snapshot = {...lastOutputs};
    const chipTexts = [];
    for (let i=0; i<CHIPS.length; i++) {
      if (i>0) await new Promise(r=>setTimeout(r,350));
      chipTexts.push(await queryChip(CHIPS[i], text, snapshot).catch(e=>`[FAULT: ${e.message}]`));
    }

    const newOutputs = {...lastOutputs};
    const newHistory = {...meshHistory};
    chipTexts.forEach((ct,i) => {
      newOutputs[CHIPS[i].id] = ct;
      newHistory[CHIPS[i].id] = [...meshHistory[CHIPS[i].id],
        {role:"user",content:text}, {role:"assistant",content:ct}].slice(-20);
    });
    setLastOutputs(newOutputs); setMeshHistory(newHistory);
    updateCorrelations(newOutputs);

    // Replace chip loading placeholders
    setFeed(f => {
      const cleaned = f.filter(e=>!e.loading);
      return [...cleaned, ...CHIPS.map((chip,i)=>({type:"chip",chip,text:chipTexts[i],loading:false}))];
    });
    setActiveIds(new Set());

    // Synthesis
    setFeed(f=>[...f, {type:"synth", text:"", loading:true}]);
    const synthText = await querySynthesis(chipTexts);
    setSynthHistory(h=>[...h,
      {role:"user", content:`MESH OUTPUTS ROUND ${round+1}:\n${chipTexts.map((t,i)=>`[${CHIPS[i].id}]: ${t.slice(0,200)}`).join('\n')}`},
      {role:"assistant", content:synthText}
    ].slice(-10));

    setFeed(f=>{
      const cleaned = f.filter(e=>!e.loading);
      return [...cleaned, {type:"synth", text:synthText, loading:false}];
    });
    setLoading(false);
    inputRef.current?.focus();
  }, [input, loading, lastOutputs, meshHistory, round, synthHistory]);

  const onKey = e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();broadcast();} };

  const downloadLog = () => {
    const lines = ["WILLOW MESH RESEARCH LOG", "OPUS 4.6 · STRUCTURED OUTPUT · TRIPOD-IP-v1.1",
      `EXPORTED: ${new Date().toISOString()}`, "═".repeat(70), "",
      ...feed.map(e => e.type==="human" ? `[ROOT0]\n${e.text}\n`
        : e.type==="synth" ? `[SYNTHESIS]\n${e.text}\n`
        : `[${e.chip.full}]\n${e.text}\n`),
      "═".repeat(70)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines],{type:"text/plain"}));
    a.download = `WILLOW_MESH_RESEARCH_${Date.now()}.log`; a.click();
  };

  const QUICK = [
    "What is the current state of the phonon hologram?",
    "Do all nodes agree on Layer 3 thermal survival fraction?",
    "What is the falsifiable prediction for neighbor α correlation?",
    "C11: does the pre-fabrication oxide topology change the saturation curve?",
    "What null result would disprove the junction learning hypothesis?",
    "Quantify the cross-axis vs resonator-axis coupling asymmetry.",
  ];

  return (
    <div style={{background:C.void,minHeight:"100vh",display:"flex",flexDirection:"column",
      fontFamily:"'Courier New',monospace",color:C.steel}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Share+Tech+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:2px;}
        ::-webkit-scrollbar-thumb{background:${C.cobalt};}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:0.8}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .chip-in{animation:fadeIn 0.3s ease forwards;}
        textarea:focus{outline:none;}
        button{cursor:pointer;transition:all 0.15s;}
        button:disabled{opacity:0.4;cursor:not-allowed;}
        button:not(:disabled):hover{filter:brightness(1.4);}
      `}</style>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${C.cobalt}60`,padding:"10px 16px",
        background:`linear-gradient(180deg,${C.cobaltD}dd,transparent)`,
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px",flexShrink:0}}>
        <div>
          <div style={{fontSize:"7px",letterSpacing:"0.3em",color:C.cobaltB,marginBottom:"2px",
            fontFamily:"'Share Tech Mono',monospace"}}>
            OPUS 4.6 · STRUCTURED SCIENTIFIC OUTPUT · 6 NODES · 15 PAIRS + SYNTHESIS
          </div>
          <div style={{fontFamily:"'Rajdhani',sans-serif",fontWeight:700,
            fontSize:"clamp(14px,3vw,22px)",color:C.white,letterSpacing:"0.06em"}}>
            WILLOW MESH · RESEARCH MODE
            <span style={{color:C.synth,marginLeft:"10px",fontSize:"0.55em",
              fontFamily:"'Share Tech Mono',monospace"}}>
              HYPOTHESIS / MEASUREMENT / EVIDENCE / PREDICTION
            </span>
          </div>
        </div>
        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
          <div style={{padding:"4px 10px",border:`1px solid ${C.TARGET}50`,
            background:`${C.TARGET}12`,borderRadius:"3px",textAlign:"center"}}>
            <div style={{fontSize:"12px",fontFamily:"'Rajdhani',sans-serif",
              fontWeight:700,color:C.TARGET}}>{round}</div>
            <div style={{fontSize:"6px",color:C.ghost,letterSpacing:"0.1em"}}>ROUNDS</div>
          </div>
          <button onClick={downloadLog} style={{padding:"5px 10px",fontSize:"7px",
            letterSpacing:"0.15em",background:`${C.synth}15`,border:`1px solid ${C.synth}60`,
            color:C.synth,borderRadius:"2px",fontFamily:"'Courier New',monospace"}}>
            ↓ LOG
          </button>
        </div>
      </div>

      {/* NETWORK */}
      <div style={{padding:"10px 16px 6px",borderBottom:`1px solid ${C.ghost}40`,
        background:`${C.cobaltD}30`,flexShrink:0}}>
        <NetworkGraph chips={CHIPS} activeIds={activeIds} lastR={lastR}/>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"5px",justifyContent:"center"}}>
          {CHIPS.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:"3px"}}>
              <div style={{width:"5px",height:"5px",borderRadius:"50%",background:c.color}}/>
              <span style={{fontSize:"7px",color:c.color,fontFamily:"'Share Tech Mono',monospace"}}>
                {c.label} {c.role}
              </span>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:"3px"}}>
            <div style={{width:"5px",height:"5px",borderRadius:"50%",background:C.synth}}/>
            <span style={{fontSize:"7px",color:C.synth,fontFamily:"'Share Tech Mono',monospace"}}>
              Σ SYNTHESIS
            </span>
          </div>
        </div>
      </div>

      {/* FEED */}
      <div style={{flex:1,overflowY:"auto",padding:"14px 16px 6px"}}>
        {feed.length===0 && (
          <div style={{textAlign:"center",padding:"40px 20px",color:C.ghost}}>
            <div style={{fontSize:"9px",letterSpacing:"0.3em",marginBottom:"8px"}}>
              RESEARCH MODE · OPUS 4.6 · STRUCTURED OUTPUT
            </div>
            <div style={{fontSize:"11px",color:C.cobaltB,lineHeight:"1.8"}}>
              Each node outputs: HYPOTHESIS · MEASUREMENT · EVIDENCE<br/>
              MESH_DELTA · PREDICTION · CONFIDENCE<br/>
              Synthesis layer aggregates into consensus report.
            </div>
          </div>
        )}
        {feed.map((e,i)=>(
          <div key={i} className="chip-in">
            {e.type==="human" && <HumanBubble text={e.text}/>}
            {e.type==="chip"  && <StructuredBubble chip={e.chip} text={e.text} loading={e.loading}/>}
            {e.type==="synth" && <SynthesisBubble text={e.text} loading={e.loading}/>}
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* QUICK PROMPTS */}
      <div style={{padding:"5px 16px",borderTop:`1px solid ${C.ghost}30`,
        display:"flex",gap:"4px",flexWrap:"wrap",flexShrink:0}}>
        {QUICK.map(q=>(
          <button key={q} onClick={()=>{setInput(q);inputRef.current?.focus();}}
            style={{padding:"3px 8px",fontSize:"7px",letterSpacing:"0.06em",
              background:`${C.cobalt}20`,border:`1px solid ${C.cobalt}50`,
              color:C.steel,borderRadius:"2px",fontFamily:"'Courier New',monospace"}}>
            {q}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div style={{borderTop:`1px solid ${C.cobalt}60`,padding:"12px 16px",
        background:`${C.cobaltD}60`,display:"flex",gap:"8px",
        alignItems:"flex-end",flexShrink:0}}>
        <div style={{width:"24px",minWidth:"24px",height:"24px",
          border:`1px solid ${C.amber}60`,background:`${C.amber}15`,
          borderRadius:"3px",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:"11px",color:C.amber,marginBottom:"1px"}}>▸</div>
        <textarea ref={inputRef} value={input} rows={2}
          onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
          placeholder="Research query — broadcast to all 6 nodes + synthesis…"
          style={{flex:1,background:`${C.cobalt}18`,border:`1px solid ${C.cobalt}70`,
            borderRadius:"3px",color:C.white,fontSize:"11px",
            fontFamily:"'Courier New',monospace",padding:"8px 11px",
            lineHeight:"1.6",resize:"none"}}
          onFocus={e=>e.target.style.borderColor=C.amber}
          onBlur={e=>e.target.style.borderColor=`${C.cobalt}70`}/>
        <button onClick={broadcast} disabled={loading||!input.trim()}
          style={{padding:"8px 16px",height:"40px",
            background:loading?`${C.ghost}30`:`${C.synth}20`,
            border:`1px solid ${loading?C.ghost:C.synth}`,
            color:loading?C.ghost:C.synth,
            borderRadius:"3px",fontSize:"8px",letterSpacing:"0.2em",
            fontFamily:"'Courier New',monospace",minWidth:"56px"}}>
          {loading?"░░░":"SEND"}
        </button>
      </div>

      {/* FOOTER */}
      <div style={{borderTop:`1px solid ${C.ghost}`,padding:"5px 16px",
        fontSize:"6px",letterSpacing:"0.12em",color:C.ghost,
        display:"flex",justifyContent:"space-between",flexShrink:0}}>
        <span>OPUS 4.6 · 6 NODES + SYNTHESIS · TRIPOD-IP-v1.1 · DLW · 3/4/26</span>
        <span>STRUCTURED: HYPOTHESIS/MEASUREMENT/EVIDENCE/PREDICTION · ↵ SEND · ↓ LOG</span>
      </div>
    </div>
  );
}
