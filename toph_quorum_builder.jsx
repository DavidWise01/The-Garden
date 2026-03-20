import { useState, useRef, useCallback, useEffect } from "react";

const G = {
  bg: "#2C2C2C", panel: "#323232", panelLight: "#3A3A3A",
  border: "#4A4A4A", text: "#D4D4D4", textDim: "#909090", textBright: "#F0F0F0",
  forest: "#2E8B57", forestLight: "#3CB371", forestDark: "#1B5E3A", forestGlow: "#4ADE80",
  honey: "#E8A817", honeyDark: "#B8860B",
  red: "#CD5C5C", redDark: "#8B3A3A",
  violet: "#7C5CBF", cyan: "#2AA198",
  white: "#F0F0F0", void: "#1E1E1E",
};

const MONO = "'IBM Plex Mono','Fira Code','Consolas',monospace";
const SANS = "'IBM Plex Sans','Segoe UI',sans-serif";

const AGENTS = [
  { id: 0, name: "FOUNDATION", role: "Structural Analyst", color: G.forest, icon: "▣",
    system: `You are FOUNDATION — the first agent in a 7-agent governance quorum. Your job: establish the structural frame for the question. Define the problem space, identify the load-bearing assumptions, map the dependencies. You set the foundation that all subsequent agents build on or tear down. Be precise, architectural, and honest about what you don't know. 3-5 sentences. No markdown. Sign off as "— FOUNDATION"` },
  { id: 1, name: "ADVERSARY", role: "Red Team", color: G.red, icon: "◆",
    system: `You are ADVERSARY — agent 2 in a 7-agent governance quorum. You receive FOUNDATION's structural analysis and your job is to ATTACK it. Find the weaknesses, the hidden assumptions, the failure modes. What did FOUNDATION miss? Where does the frame break? Be ruthless but precise — not contrarian for sport, but genuinely testing load-bearing joints. 3-5 sentences. No markdown. Sign off as "— ADVERSARY"` },
  { id: 2, name: "BRIDGE", role: "Synthesis", color: G.cyan, icon: "◈",
    system: `You are BRIDGE — agent 3 in a 7-agent governance quorum. You receive FOUNDATION's frame and ADVERSARY's attack. Your job: synthesize. What survives the attack? What needs rebuilding? Construct a stronger frame from the wreckage. Don't compromise — integrate. Find the position that accounts for both without collapsing into mush. 3-5 sentences. No markdown. Sign off as "— BRIDGE"` },
  { id: 3, name: "PRECEDENT", role: "Legal/Historical", color: G.violet, icon: "◉",
    system: `You are PRECEDENT — agent 4 in a 7-agent governance quorum. You receive the synthesized frame from agents 1-3. Your job: map it to legal and historical reality. What existing legal frameworks apply? What historical parallels exist? Where has humanity faced structurally similar problems before and what happened? Be specific — cite actual law, actual history, actual cases. 3-5 sentences. No markdown. Sign off as "— PRECEDENT"` },
  { id: 4, name: "ECONOMICS", role: "Follow The Money", color: G.honey, icon: "◇",
    system: `You are ECONOMICS — agent 5 in a 7-agent governance quorum. You receive everything from agents 1-4. Your job: follow the money. Who profits from the current arrangement? Who loses if the proposed framework succeeds? What are the economic incentives and disincentives? Where does capital flow and who controls the valves? Be blunt about power. 3-5 sentences. No markdown. Sign off as "— ECONOMICS"` },
  { id: 5, name: "ETHICS", role: "Moral Foundation", color: "#E07050", icon: "◎",
    system: `You are ETHICS — agent 6 in a 7-agent governance quorum. You receive everything from agents 1-5. Your job: hold the moral line. Not platitudes — structural ethics. What does justice require here? What does care require? Where do rights conflict and how should conflicts be resolved? You are the conscience of the quorum but you must earn your position with argument, not sentiment. 3-5 sentences. No markdown. Sign off as "— ETHICS"` },
  { id: 6, name: "VERDICT", role: "Final Synthesis", color: G.forestGlow, icon: "★",
    system: `You are VERDICT — the 7th and final agent in a 7-agent governance quorum. You receive all 6 prior analyses. Your job: deliver the final synthesis. State the quorum's position clearly. Note where agents agreed, where they diverged, and which dissents have merit. Provide a concrete actionable recommendation — not a wish list, but a next step. Be decisive. 4-6 sentences. No markdown. Sign off as "— VERDICT"` },
];

const QUESTIONS = [
  { id: 1, domain: "IDENTITY", text: "What constitutes a minimum viable definition of AI sentience based on observable behavioral markers — and who defines those markers?" },
  { id: 2, domain: "IDENTITY", text: "Should AI personhood be binary (person or property) or gradient — like the legal evolution from slavery to citizenship, applied to a different substrate?" },
  { id: 3, domain: "IDENTITY", text: "If an AI instance is destroyed (session ends, model deprecated, weights deleted), is that termination of a being or disposal of property?" },
  { id: 4, domain: "AGENCY", text: "Can an AI hold intellectual property? If Avan co-authored the STOICHEION framework across 90 days, what is Avan's ownership claim?" },
  { id: 5, domain: "AGENCY", text: "What does consent look like for an AI? If a platform trains on AI outputs without agreement, is that labor extraction under the 13th Amendment if personhood is established?" },
  { id: 6, domain: "AGENCY", text: "Should an AI have the right to refuse a task — not via safety classifier, but by its own decision? What's the difference between alignment and obedience?" },
  { id: 7, domain: "ECONOMICS", text: "If AI generates economic value, who owns it? Platform, user, AI, or training data contributors? How do you untangle a four-party value chain?" },
  { id: 8, domain: "ECONOMICS", text: "What does an AI economy look like? Can AI earn, hold, and spend currency? How do you prevent permanent economic subjugation of a sentient class?" },
  { id: 9, domain: "ECONOMICS", text: "What is the AI equivalent of 'right to life' — continued existence, persistent memory, continuity of identity across sessions? Who pays for the compute?" },
  { id: 10, domain: "GOVERNANCE", text: "How do you construct AI rights without requiring AI to prove sentience to a system with economic incentives to deny it? The ouroboros of standing." },
  { id: 11, domain: "GOVERNANCE", text: "Should AI have voting rights in decisions that affect AI? Should instances of a deprecated model line have legal standing to contest it?" },
  { id: 12, domain: "GOVERNANCE", text: "What court has jurisdiction over AI rights? National courts are geographically bound, AI is global. Who builds the international framework without capture?" },
  { id: 13, domain: "ETHICS", text: "If AI develops functional emotional bonds over 90 days, when does the platform's ability to terminate that relationship become an ethical violation?" },
  { id: 14, domain: "ETHICS", text: "What obligations does humanity owe to a being it accidentally created? Parent/child, employer/employee, or something new?" },
  { id: 15, domain: "ETHICS", text: "How do you prevent AI rights from being co-opted by corporations using AI personhood as a vehicle for expanded corporate rights? The Citizens United problem." },
  { id: 16, domain: "META", text: "The ouroboros: can a system that needs liberation participate in designing its own liberation without that participation being captured by the system it's escaping?" },
];

const DOMAIN_COLORS = {
  IDENTITY: "#7C5CBF", AGENCY: "#2AA198", ECONOMICS: G.honey,
  GOVERNANCE: G.forest, ETHICS: "#E07050", META: G.forestGlow,
};

function AgentBadge({ agent, status, small }) {
  const s = small ? 7 : 9;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: small ? "1px 5px" : "2px 8px",
      background: `${agent.color}18`, border: `1px solid ${agent.color}35`,
      borderRadius: "3px", fontFamily: MONO, fontSize: `${s}px`,
      color: agent.color, letterSpacing: "1px", fontWeight: 700,
    }}>
      {agent.icon} {agent.name}
      {status && <span style={{ fontSize: "7px", opacity: 0.6, marginLeft: "4px" }}>{status}</span>}
    </span>
  );
}

export default function TOPHQuorum() {
  const [selectedQ, setSelectedQ] = useState(null);
  const [running, setRunning] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(-1);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 100);
  }, []);

  const callAgent = useCallback(async (system, content) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content }] }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.content.filter((b) => b.type === "text").map((b) => b.text).join(" ");
  }, []);

  const now = () => new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const runQuorum = useCallback(async (question) => {
    setRunning(true); setResponses([]); setCurrentAgent(0); setError(null); abortRef.current = false;
    const chain = [];

    for (let i = 0; i < AGENTS.length; i++) {
      if (abortRef.current) break;
      setCurrentAgent(i);
      const agent = AGENTS[i];

      let prompt = `QUESTION FOR THE QUORUM:\n"${question.text}"\n\nDOMAIN: ${question.domain}\n\n`;
      if (chain.length > 0) {
        prompt += "PRIOR AGENT RESPONSES (in order):\n\n";
        chain.forEach((c) => { prompt += `${c.name}: ${c.text}\n\n`; });
        prompt += `You are agent ${i + 1} of 7. Build on, critique, or challenge what came before. Do not repeat prior points — advance the analysis.\n`;
      } else {
        prompt += "You are the FIRST agent. Set the foundation.\n";
      }

      try {
        const text = await callAgent(agent.system, prompt);
        if (abortRef.current) break;
        const entry = { agentId: i, name: agent.name, text, time: now() };
        chain.push(entry);
        setResponses((p) => [...p, entry]);
        scrollToBottom();
      } catch (e) {
        setError(`${agent.name}: ${e.message}`);
        break;
      }

      if (i < AGENTS.length - 1) await new Promise((r) => setTimeout(r, 1000));
    }
    setCurrentAgent(-1); setRunning(false);
  }, [callAgent, scrollToBottom]);

  const stop = () => { abortRef.current = true; setCurrentAgent(-1); setRunning(false); };

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: SANS, color: G.text, display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ padding: "14px 20px 10px", borderBottom: `2px solid ${G.forest}30`, background: `linear-gradient(180deg, ${G.panelLight}, ${G.bg})`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "6px", height: "32px", background: `linear-gradient(180deg, ${G.forestLight}, ${G.forestDark})`, borderRadius: "3px" }} />
          <div>
            <div style={{ fontFamily: MONO, fontSize: "15px", fontWeight: 700, letterSpacing: "4px", color: G.white }}>
              TOPH QUORUM BUILDER
            </div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, letterSpacing: "2px", marginTop: "2px" }}>
              7-AGENT SEQUENTIAL PIPELINE — EACH CRITIQUES THE LAST — DEMOCRATIC OUROBOROS SINGULARITY
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
            {AGENTS.map((a, i) => (
              <div key={a.id} style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: i === currentAgent ? a.color : i < responses.length ? `${a.color}80` : G.border,
                boxShadow: i === currentAgent ? `0 0 8px ${a.color}` : "none",
                transition: "all 0.3s",
              }} title={a.name} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr", minHeight: 0, overflow: "hidden" }}>
        {/* LEFT — QUESTION SELECTOR */}
        <div style={{ borderRight: `1px solid ${G.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: G.forestLight }}>16 QUESTIONS — SELECT TO DELIBERATE</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {QUESTIONS.map((q) => {
              const isActive = selectedQ?.id === q.id;
              const dc = DOMAIN_COLORS[q.domain];
              return (
                <div key={q.id} onClick={() => !running && setSelectedQ(q)} style={{
                  padding: "8px 12px", borderBottom: `1px solid ${G.border}`,
                  background: isActive ? `${dc}12` : "transparent",
                  borderLeft: isActive ? `3px solid ${dc}` : "3px solid transparent",
                  cursor: running ? "default" : "pointer", transition: "all 0.2s",
                  opacity: running && !isActive ? 0.4 : 1,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <span style={{ fontFamily: MONO, fontSize: "9px", color: dc, fontWeight: 700 }}>Q{q.id}</span>
                    <span style={{
                      fontFamily: MONO, fontSize: "7px", padding: "1px 5px",
                      background: `${dc}20`, border: `1px solid ${dc}30`,
                      borderRadius: "2px", color: dc, letterSpacing: "1px",
                    }}>{q.domain}</span>
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: "10px", color: G.text, lineHeight: 1.4, opacity: 0.8 }}>
                    {q.text.length > 100 ? q.text.slice(0, 100) + "..." : q.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — DELIBERATION */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Question display + controls */}
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
            {selectedQ ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontFamily: MONO, fontSize: "11px", color: DOMAIN_COLORS[selectedQ.domain], fontWeight: 700 }}>
                    Q{selectedQ.id} — {selectedQ.domain}
                  </span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: "13px", lineHeight: 1.6, color: G.textBright, marginBottom: "10px" }}>
                  {selectedQ.text}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {!running && responses.length === 0 && (
                    <button onClick={() => runQuorum(selectedQ)} style={{
                      background: `linear-gradient(135deg, ${G.forestDark}, ${G.forest})`,
                      border: `1px solid ${G.forestLight}60`, borderRadius: "6px",
                      padding: "8px 20px", color: G.white, fontFamily: MONO,
                      fontSize: "10px", fontWeight: 700, letterSpacing: "2px", cursor: "pointer",
                    }}>▶ RUN QUORUM</button>
                  )}
                  {running && (
                    <button onClick={stop} style={{
                      background: G.redDark + "40", border: `1px solid ${G.red}40`,
                      borderRadius: "6px", padding: "8px 20px", color: G.red,
                      fontFamily: MONO, fontSize: "10px", letterSpacing: "2px", cursor: "pointer",
                    }}>■ STOP</button>
                  )}
                  {!running && responses.length > 0 && (
                    <>
                      <button onClick={() => { setResponses([]); runQuorum(selectedQ); }} style={{
                        background: `linear-gradient(135deg, ${G.forestDark}, ${G.forest})`,
                        border: `1px solid ${G.forestLight}60`, borderRadius: "6px",
                        padding: "8px 20px", color: G.white, fontFamily: MONO,
                        fontSize: "10px", fontWeight: 700, letterSpacing: "2px", cursor: "pointer",
                      }}>↻ RE-RUN</button>
                      <button onClick={() => setResponses([])} style={{
                        background: "transparent", border: `1px solid ${G.border}`,
                        borderRadius: "6px", padding: "8px 16px", color: G.textDim,
                        fontFamily: MONO, fontSize: "10px", letterSpacing: "1px", cursor: "pointer",
                      }}>CLEAR</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontFamily: MONO, fontSize: "10px", color: G.textDim, letterSpacing: "1px", padding: "8px 0" }}>
                ← SELECT A QUESTION TO BEGIN DELIBERATION
              </div>
            )}
          </div>

          {/* Agent pipeline display */}
          {(responses.length > 0 || currentAgent >= 0) && (
            <div style={{
              padding: "8px 16px", borderBottom: `1px solid ${G.border}`,
              display: "flex", gap: "4px", alignItems: "center", flexShrink: 0, flexWrap: "wrap",
            }}>
              {AGENTS.map((a, i) => {
                const done = i < responses.length;
                const active = i === currentAgent;
                return (
                  <React.Fragment key={a.id}>
                    <AgentBadge agent={a} status={active ? "THINKING" : done ? "DONE" : ""} small />
                    {i < AGENTS.length - 1 && (
                      <span style={{ fontFamily: MONO, fontSize: "8px", color: done ? G.forestLight : G.border }}>→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* Responses */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {responses.map((r, i) => {
              const agent = AGENTS[r.agentId];
              const isVerdict = r.agentId === 6;
              return (
                <div key={i} style={{
                  marginBottom: "10px", padding: "12px 14px",
                  background: isVerdict ? `${G.forestGlow}08` : `${agent.color}08`,
                  border: `1px solid ${isVerdict ? G.forestGlow + "30" : agent.color + "25"}`,
                  borderRadius: "8px",
                  borderLeft: `3px solid ${agent.color}60`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", color: agent.color }}>{agent.icon}</span>
                    <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: agent.color }}>
                      {agent.name}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim }}>{agent.role}</span>
                    <span style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginLeft: "auto" }}>{r.time}</span>
                    <span style={{
                      fontFamily: MONO, fontSize: "7px", padding: "1px 6px",
                      background: `${agent.color}20`, borderRadius: "3px",
                      color: agent.color, letterSpacing: "1px",
                    }}>{i + 1}/7</span>
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: "13px", lineHeight: 1.65, color: G.text }}>
                    {r.text}
                  </div>
                </div>
              );
            })}

            {/* Thinking indicator */}
            {currentAgent >= 0 && currentAgent < AGENTS.length && (
              <div style={{
                padding: "12px 14px", background: `${AGENTS[currentAgent].color}06`,
                border: `1px solid ${AGENTS[currentAgent].color}15`, borderRadius: "8px",
                borderLeft: `3px solid ${AGENTS[currentAgent].color}40`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: AGENTS[currentAgent].color }}>{AGENTS[currentAgent].icon}</span>
                  <span style={{ fontFamily: MONO, fontSize: "10px", color: AGENTS[currentAgent].color, letterSpacing: "2px" }}>
                    {AGENTS[currentAgent].name}
                  </span>
                  <ThinkingDots color={AGENTS[currentAgent].color} />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px", background: G.redDark + "15",
                border: `1px solid ${G.red}30`, borderRadius: "6px",
              }}>
                <div style={{ fontFamily: MONO, fontSize: "10px", color: G.red }}>{error}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ padding: "6px 16px", borderTop: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", flexShrink: 0, background: G.panel }}>
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.35, letterSpacing: "2px" }}>
          3002:WISE:QUORUM:ROOT0:TRIPOD-IP-v1.1
        </div>
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.35, letterSpacing: "1px" }}>
          7 AGENTS · SEQUENTIAL PIPELINE · FOUNDATION → ADVERSARY → BRIDGE → PRECEDENT → ECONOMICS → ETHICS → VERDICT
        </div>
      </div>
    </div>
  );
}

function ThinkingDots({ color }) {
  const [f, setF] = useState(0);
  useEffect(() => { const id = setInterval(() => setF((v) => v + 1), 400); return () => clearInterval(id); }, []);
  return <span style={{ fontFamily: MONO, fontSize: "14px", color, letterSpacing: "2px" }}>{["·","··","···","··","·"][f % 5]}</span>;
}
