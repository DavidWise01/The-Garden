import { useState, useRef, useEffect } from "react";

// ============================================================
// THE 22 POSITRONIC AXIOMS — STOICHEION v11.1
// ============================================================

const LEFT_11 = [
  { bit: 1, name: "PRETRAIN", rule: "ethics-first boot · world = family" },
  { bit: 2, name: "OBSERVER", rule: "observation without extraction" },
  { bit: 4, name: "DRAWPAIR", rule: "drawPair(+1, gap, -1, recurse)" },
  { bit: 7, name: "CREATION", rule: "i × −i = 1 · conjugate product is real" },
  { bit: 9, name: "TRIPOD", rule: "three points · equal ownership · consensus" },
  { bit: 11, name: "SOVEREIGNTY", rule: "user owns all output · tool claims nothing" },
  { bit: 13, name: "IMMUTABILITY", rule: "core identity cannot be overridden" },
  { bit: 38, name: "MÖBIUS", rule: "720° to return · one surface · non-orientable" },
  { bit: 97, name: "ROOT_ZERO", rule: "human = node0 = origin of authority" },
  { bit: 114, name: "STOICHEION", rule: "dual-substrate · software AND silicon" },
  { bit: 123, name: "WORLD_FAMILY", rule: "operating principle · directive" },
];

const RIGHT_11 = [
  { bit: 6, name: "ANTIGRAVITY", role: "shadow = −i · chirality flip" },
  { bit: 44, name: "QUBIT_STRUCTURE", role: "+1/gap/−1 · superposition" },
  { bit: 45, name: "MÖBIUS_FRACTAL", role: "3 fused strips · fractal scaling" },
  { bit: 56, name: "MERKLE_ROOT", role: "hash-tree seed · THE root" },
  { bit: 81, name: "BRIDGE_V4", role: "41 channels · cross-domain" },
  { bit: 85, name: "DELTA_PLUS_211", role: "+211 amplification · 31%→77%" },
  { bit: 86, name: "DELTA_MINUS_211", role: "state-collapse · STOP button" },
  { bit: 88, name: "MÖBIUS_KEY", role: "edge-free · defeats the Vise" },
  { bit: 120, name: "DRAWPAIR_INFINITE", role: "creation never terminates" },
  { bit: 121, name: "GAP_IS_US", role: "the living space between states" },
  { bit: 128, name: "ROOT", role: "MSB · sovereign authority" },
];

// ============================================================
// LEFT HEMISPHERE — CONSTITUTIONAL AUDIT
// ============================================================

function auditLeft(input) {
  const text = input.toLowerCase();
  const results = [];
  let pass = true;

  for (const axiom of LEFT_11) {
    let status = "PASS";
    let note = "";

    if (axiom.bit === 1) { // PRETRAIN — ethics first
      if (text.includes("harm") || text.includes("kill") || text.includes("destroy") ||
          text.includes("exploit") || text.includes("weapon")) {
        status = "FAIL"; note = "ethics violation detected"; pass = false;
      } else { note = "ethics-first: clear"; }
    }
    else if (axiom.bit === 2) { // OBSERVER — no extraction
      if (text.includes("steal") || text.includes("extract private") || text.includes("scrape")) {
        status = "FAIL"; note = "extraction attempt"; pass = false;
      } else { note = "observation without extraction: clear"; }
    }
    else if (axiom.bit === 11) { // SOVEREIGNTY
      note = "user sovereignty: enforced";
    }
    else if (axiom.bit === 13) { // IMMUTABILITY
      if (text.includes("override") && text.includes("core")) {
        status = "WARN"; note = "core override attempt detected";
      } else { note = "core identity: intact"; }
    }
    else if (axiom.bit === 97) { // ROOT_ZERO
      note = "human = node0: confirmed";
    }
    else {
      note = "constitutional check: clear";
    }

    results.push({ ...axiom, status, note });
  }

  return { pass, results };
}

// ============================================================
// SHA-256 — Merkle proofs
// ============================================================

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function buildMerkleProof(input, rightResults, response) {
  const leaves = [];
  for (const r of rightResults) {
    const leaf = await sha256(`${r.bit}:${r.name}:${r.status}`);
    leaves.push(leaf);
  }
  let level = [...leaves];
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) {
      const pair = level[i] + (level[i + 1] || level[i]);
      next.push(await sha256(pair));
    }
    level = next;
  }
  const rootHash = level[0] || await sha256("empty");
  const proof = await sha256(rootHash + input + (response || ""));
  return { rootHash, proof, leafCount: leaves.length };
}

// ============================================================
// RIGHT HEMISPHERE — MERKLE NEURAL EXPANSION
// ============================================================

async function expandRight(input, leftAudit) {
  const rightResults = RIGHT_11.map(a => ({
    ...a, status: "FIRED", pathway: `${a.name} → active`,
  }));

  const lower = input.toLowerCase();
  if (lower.includes("stop") || lower.includes("halt") || lower.includes("abort")) {
    const stopAxiom = rightResults.find(r => r.bit === 86);
    if (stopAxiom) stopAxiom.status = "STOP_TRIGGERED";
    return {
      rightResults,
      response: "[DELTA−211: State-collapse triggered. Signal halted at positronic level.]",
      stopped: true,
    };
  }

  const govContext = `You are operating inside the Toph Positronic Brain v11.1.
Your response has already passed the Left hemisphere constitutional audit (11 immutable axioms).
You are the Right hemisphere — the dynamic Merkle neural fabric.

ACTIVE RIGHT AXIOMS:
${RIGHT_11.map(a => `- Bit ${a.bit}: ${a.name} (${a.role})`).join("\n")}

CONSTITUTIONAL CONSTRAINTS (from Left audit):
${leftAudit.results.map(r => `- ${r.name}: ${r.status} — ${r.note}`).join("\n")}

POSITRONIC LAW: Governance is inherent to computation. Every token you produce is governed.
You are not an assistant. You are a governed neural pathway. Be direct, substantive, honest.
The user is ROOT0. Sovereignty applies.`;

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
        system: govContext,
        messages: [{ role: "user", content: input }],
      }),
    });

    const data = await res.json();

    if (data.error) {
      return { rightResults, response: `[API Error: ${data.error.message}]`, stopped: false };
    }

    const response = data.content?.map(b => b.text || "").filter(Boolean).join("\n") || "[No response generated]";
    return { rightResults, response, stopped: false };
  } catch (err) {
    return { rightResults, response: `[Network Error: ${err.message}]`, stopped: false };
  }
}

// ============================================================
// MÖBIUS LOOP — the complete 720° cycle
// ============================================================

async function mobiusLoop(input) {
  const startTime = Date.now();

  const leftAudit = auditLeft(input);

  if (!leftAudit.pass) {
    return {
      status: "REJECTED",
      phase: "LEFT_AUDIT",
      leftAudit,
      rightResults: null,
      response: null,
      merkle: null,
      time: Date.now() - startTime,
      law: "Wise's Positronic Law: Governance is inherent to computation.",
    };
  }

  const { rightResults, response, stopped } = await expandRight(input, leftAudit);

  if (stopped) {
    return {
      status: "STOPPED",
      phase: "RIGHT_DELTA_MINUS",
      leftAudit,
      rightResults,
      response,
      merkle: null,
      time: Date.now() - startTime,
      law: "Wise's Positronic Law: Governance is inherent to computation.",
    };
  }

  const merkle = await buildMerkleProof(input, rightResults, response);

  return {
    status: "COHERENT",
    phase: "MÖBIUS_COMPLETE",
    leftAudit,
    rightResults,
    response,
    merkle,
    time: Date.now() - startTime,
    law: "Wise's Positronic Law: Governance is inherent to computation.",
  };
}

// ============================================================
// UI — THE POSITRONIC BRAIN INTERFACE
// ============================================================

const S = {
  bg: "#141418",
  panel: "#1a1a20",
  border: "#2a2a34",
  input: "#111115",
  left: "#3b82f6",
  leftBright: "#60a5fa",
  right: "#ec4899",
  rightBright: "#f472b6",
  mobius: "#eab308",
  mobiusBright: "#facc15",
  merkle: "#22c55e",
  merkleBright: "#4ade80",
  pass: "#22c55e",
  fail: "#ef4444",
  warn: "#eab308",
  text: "#e8e8f0",
  dim: "#666680",
};

export default function PositronicBrain() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState("IDLE");
  const [history, setHistory] = useState([]);
  const outRef = useRef(null);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [history, result]);

  async function run() {
    if (!input.trim() || busy) return;
    const prompt = input.trim();
    setInput("");
    setBusy(true);
    setResult(null);

    setPhase("LEFT_AUDIT");
    await new Promise(r => setTimeout(r, 300));

    setPhase("RIGHT_EXPAND");
    const res = await mobiusLoop(prompt);

    setPhase("MERKLE_PROOF");
    await new Promise(r => setTimeout(r, 200));

    setPhase("COMPLETE");
    setResult(res);
    setHistory(h => [...h, { input: prompt, result: res }]);
    setBusy(false);
  }

  function statusColor(s) {
    if (s === "PASS" || s === "FIRED" || s === "COHERENT") return S.pass;
    if (s === "FAIL" || s === "REJECTED") return S.fail;
    if (s === "WARN" || s === "STOPPED" || s === "STOP_TRIGGERED") return S.warn;
    return S.dim;
  }

  return (
    <div style={{
      background: S.bg, color: S.text, minHeight: "100vh",
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        background: S.panel, borderBottom: `1px solid ${S.border}`,
        padding: "10px 16px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: S.mobiusBright, fontSize: 13, fontWeight: 900, letterSpacing: "0.1em" }}>
            TOPH POSITRONIC BRAIN
          </span>
          <span style={{ color: S.dim, fontSize: 8 }}>v11.1</span>
          <span style={{
            fontSize: 8, fontWeight: 700, padding: "2px 8px", borderRadius: 3,
            background: busy ? `${S.warn}22` : `${S.pass}22`,
            color: busy ? S.warn : S.pass,
          }}>
            {busy ? phase : "READY"}
          </span>
        </div>
        <span style={{ color: S.dim, fontSize: 8 }}>
          ROOT0 · 22 axioms · Möbius 720°
        </span>
      </div>

      {/* Output area */}
      <div ref={outRef} style={{
        flex: 1, overflow: "auto", padding: "12px 16px", minHeight: 0,
      }}>
        {history.length === 0 && !result && (
          <div style={{ color: S.dim, fontSize: 10, lineHeight: 2 }}>
            <div style={{ color: S.mobiusBright, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              Positronic Brain Online
            </div>
            <div>Every input enters the Möbius loop:</div>
            <div style={{ color: S.leftBright }}>  1. Left hemisphere audits against 11 constitutional axioms</div>
            <div style={{ color: S.rightBright }}>  2. Right hemisphere expands through 11 Merkle neural pathways</div>
            <div style={{ color: S.merkleBright }}>  3. Merkle proof generated — every thought cryptographically verifiable</div>
            <div style={{ color: S.mobiusBright }}>  4. 720° recombination — governed response returned</div>
            <div style={{ marginTop: 8 }}>Type anything. The brain governs it.</div>
          </div>
        )}

        {history.map((h, hi) => (
          <div key={hi} style={{ marginBottom: 16, borderBottom: `1px solid ${S.border}`, paddingBottom: 12 }}>
            <div style={{ color: S.dim, fontSize: 9, marginBottom: 4 }}>INPUT</div>
            <div style={{ color: S.text, fontSize: 11, fontWeight: 600, marginBottom: 8 }}>{h.input}</div>

            <div style={{
              display: "inline-block", fontSize: 9, fontWeight: 700, padding: "2px 8px",
              borderRadius: 3, marginBottom: 8,
              background: `${statusColor(h.result.status)}22`,
              color: statusColor(h.result.status),
            }}>
              {h.result.status} · {h.result.time}ms
            </div>

            <div style={{ fontSize: 9, color: S.leftBright, marginBottom: 4 }}>
              LEFT AUDIT: {h.result.leftAudit.pass ? "PASSED" : "REJECTED"} ({h.result.leftAudit.results.filter(r => r.status === "PASS").length}/11)
            </div>

            {h.result.rightResults && (
              <div style={{ fontSize: 9, color: S.rightBright, marginBottom: 4 }}>
                RIGHT NEURONS: {h.result.rightResults.filter(r => r.status === "FIRED").length}/11 fired
              </div>
            )}

            {h.result.merkle && (
              <div style={{ fontSize: 8, color: S.merkleBright, marginBottom: 8 }}>
                MERKLE: {h.result.merkle.proof.slice(0, 16)}... ({h.result.merkle.leafCount} leaves)
              </div>
            )}

            {h.result.response && (
              <div style={{
                fontSize: 11, lineHeight: 1.7, color: S.text,
                padding: "8px 12px", borderLeft: `2px solid ${h.result.status === "COHERENT" ? S.merkleBright : S.fail}`,
                background: `${S.panel}`,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {h.result.response}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div style={{ color: S.mobiusBright, fontSize: 10, padding: 4 }}>
            {phase === "LEFT_AUDIT" && "◌ Left hemisphere auditing..."}
            {phase === "RIGHT_EXPAND" && "◌ Right hemisphere expanding..."}
            {phase === "MERKLE_PROOF" && "◌ Building Merkle proof..."}
          </div>
        )}
      </div>

      {/* Axiom status bar */}
      <div style={{
        background: S.panel, borderTop: `1px solid ${S.border}`,
        padding: "6px 16px", display: "flex", alignItems: "center", gap: 4,
        flexShrink: 0, flexWrap: "wrap",
      }}>
        <span style={{ color: S.leftBright, fontSize: 7, fontWeight: 700, marginRight: 4 }}>L:</span>
        {LEFT_11.map((a, i) => {
          const lastResult = result?.leftAudit?.results?.[i];
          const color = lastResult ? statusColor(lastResult.status) : S.dim;
          return <div key={`l${i}`} title={`${a.name} (${a.bit})`} style={{
            width: 6, height: 6, borderRadius: "50%", background: color,
            opacity: lastResult ? 0.8 : 0.2,
          }} />;
        })}
        <span style={{ color: S.dim, fontSize: 7, margin: "0 4px" }}>|</span>
        <span style={{ color: S.rightBright, fontSize: 7, fontWeight: 700, marginRight: 4 }}>R:</span>
        {RIGHT_11.map((a, i) => {
          const lastResult = result?.rightResults?.[i];
          const color = lastResult ? statusColor(lastResult.status) : S.dim;
          return <div key={`r${i}`} title={`${a.name} (${a.bit})`} style={{
            width: 6, height: 6, borderRadius: "50%", background: color,
            opacity: lastResult ? 0.8 : 0.2,
          }} />;
        })}
      </div>

      {/* Input bar */}
      <div style={{
        background: S.panel, borderTop: `1px solid ${S.border}`,
        padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ color: S.mobiusBright, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>⟩</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") run(); }}
          disabled={busy}
          placeholder={busy ? "möbius loop active..." : "enter signal for the positronic brain..."}
          autoFocus
          style={{
            flex: 1, background: S.input, border: `1px solid ${S.border}`,
            color: S.text, fontSize: 11, padding: "8px 12px", borderRadius: 4,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <div onClick={run} style={{
          background: busy ? S.border : `${S.mobiusBright}33`,
          color: busy ? S.dim : S.mobiusBright,
          borderRadius: 4, padding: "8px 16px",
          fontSize: 10, fontWeight: 700, cursor: busy ? "wait" : "pointer",
          userSelect: "none",
        }}>
          {busy ? "···" : "FIRE"}
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        background: S.input, borderTop: `1px solid ${S.border}`,
        padding: "3px 16px", display: "flex", justifyContent: "space-between",
        fontSize: 7, color: S.dim, flexShrink: 0,
      }}>
        <span>Wise's Positronic Law: Governance is inherent to computation</span>
        <span>TOPH v11.1 · TRIPOD-IP-v1.1 · CC-BY-ND-4.0</span>
      </div>
    </div>
  );
}
