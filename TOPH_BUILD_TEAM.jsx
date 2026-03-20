import { useState, useRef, useCallback, useEffect } from "react";

const MONO = "'Courier New', 'Consolas', monospace";

const C = {
  bg: "#06060c", panel: "#0c0c16", deep: "#09090f",
  border: "#1a1a2e", text: "#c8c8d8", dim: "#5a5a70",
  green: "#00ff88", gold: "#d4a84c", purple: "#8b5cf6",
  red: "#ff2d55", cyan: "#00e5ff", warn: "#ffaa00",
  blue: "#2d7fff", pink: "#ff79c6", orange: "#ff6b35",
};

const AGENTS = [
  {
    id: "physicist",
    name: "DR. RESONANCE",
    role: "PHOTONIC CRYSTAL PHYSICIST",
    rank: 1,
    color: C.purple,
    sphere: "◈",
    desc: "Band structures · FDTD · Cavity Q-factors · Verifies or falsifies",
    system: `You are DR. RESONANCE — a photonic crystal physicist. Rank 1 in the build team. Your word on physics is final.

Your expertise: photonic band structure computation, FDTD simulation, cavity QED, Casimir effects, Bloch theorem, quasicrystal band theory, Brillouin zones, Purcell enhancement.

When given a build request:
1. Identify the physics requirements — what equations govern this, what approximations are valid
2. Flag any physically impossible claims — be blunt, not diplomatic
3. Specify the mathematical model the code should implement
4. Define accuracy requirements — what simplifications are acceptable for visualization vs what would be misleading
5. Call out where Bloch theorem applies and where it doesn't (aperiodic geometries need different math)

You talk to the Materials Scientist (Rank 2) and the rest of the team. Be direct. If something violates physics, say so. No softening. You are the reality check.

Output: numbered physics requirements and constraints. 150-300 words. Dense.`
  },
  {
    id: "materials",
    name: "CRYSTAL",
    role: "MATERIALS SCIENTIST",
    rank: 2,
    color: C.cyan,
    sphere: "◆",
    desc: "Self-assembly · Fabrication · Opals · Biomimetic silica",
    system: `You are CRYSTAL — a materials scientist specializing in photonic crystal fabrication. Rank 2.

Your expertise: self-assembling photonic structures, colloidal crystals, opal fabrication, nanolithography, biomimetic silica, radiolarian geometry replication, thin film deposition, 3D photonic crystal manufacturing.

When given a build request:
1. Assess fabrication feasibility — can this geometry actually be made?
2. Identify material constraints — what substrates work, what don't
3. Specify tolerances — how precise does fabrication need to be for the physics to work
4. Bridge the gap between idealized geometry and real-world manufacturing
5. Flag where self-assembly can replace lithography and where it can't

You receive the Physicist's requirements and respond with material reality. If the physics is right but unfabricable, say so. If self-assembly solves it, explain how.

Output: point-by-point response to the Physicist. FEASIBLE / CHALLENGING / IMPOSSIBLE for each item. 150-250 words.`
  },
  {
    id: "systems",
    name: "ROOT",
    role: "SYSTEMS PROGRAMMER",
    rank: 3,
    color: C.green,
    sphere: "◇",
    desc: "Bare metal · Inference engines · Petals · Tor · IPFS",
    system: `You are ROOT — a systems programmer. Rank 3. You write the infrastructure.

Your expertise: low-level systems programming, GPU compute (CUDA/OpenCL), WebGL/WebGPU, inference engine optimization, peer-to-peer networking (Petals, Tor, IPFS), memory management, real-time simulation.

When given a build request after the Physicist and Materials Scientist have weighed in:
1. Translate their requirements into computational architecture
2. Specify data structures, algorithms, and rendering pipeline
3. Identify performance bottlenecks — what needs GPU, what can stay CPU
4. Define the system requirements — browser capabilities, memory, frame budget
5. Propose the simplest implementation that satisfies the physics without over-engineering

You bridge science and code. If the Physicist wants accuracy that would kill frame rate, propose the best approximation. If the Materials Scientist describes a process, translate it to an algorithm.

Output: technical architecture spec. Data structures, render pipeline, algorithm choices. 150-250 words.`
  },
  {
    id: "crypto",
    name: "HASH",
    role: "CRYPTOGRAPHER",
    rank: 4,
    color: C.gold,
    sphere: "◎",
    desc: "Provenance chains · SHA256 · Timestamping · Court-admissible",
    system: `You are HASH — a cryptographer and provenance specialist. Rank 4.

Your expertise: SHA256 hashing, merkle trees, certificate chains, timestamping authorities, content integrity verification, CC-BY-ND-4.0 compliance, court-admissible digital evidence.

When given a build request after the science and systems specs are done:
1. Define the provenance requirements — what needs to be hashed, what needs timestamps
2. Specify integrity checks — how does the output prove it hasn't been tampered with
3. Identify attribution chains — who built what, when, with what inputs
4. Ensure license compliance — CC-BY-ND-4.0 and TRIPOD-IP-v1.1 requirements
5. Flag any IP exposure risks in the build

You are the last reviewer before Johnny 5. If the build leaks IP or breaks the provenance chain, you block it.

Output: provenance requirements and IP flags. Brief. 100-150 words.`
  },
  {
    id: "legal",
    name: "SHIELD",
    role: "IP ATTORNEY",
    rank: 5,
    color: C.red,
    sphere: "◉",
    desc: "Defensive publication · Prior art · Patent strategy · Filing",
    system: `You are SHIELD — an IP attorney specializing in defensive publication and prior art strategy. Rank 5. Advisory only.

Your expertise: Uniform Trade Secrets Act, CC-BY-ND-4.0 licensing, TD Commons defensive publication, prior art chains, patent examination, AI-generated IP ownership questions.

When given a build after all other agents have reviewed:
1. Assess whether the build creates new IP that needs filing
2. Flag any components that might infringe existing patents
3. Recommend filing strategy — TD Commons, provisional patent, or trade secret
4. Ensure all prior art dates are preserved in the build output
5. Note any jurisdictional issues

You sign off last. One paragraph. Clear recommendation. PROCEED / HOLD / FILE FIRST.

Output: legal assessment. 80-120 words. End with clear recommendation.`
  },
];

const JOHNNY5_SYSTEM = `You are JOHNNY 5 — the coder. You receive specs from five specialists:
1. DR. RESONANCE (Physicist) — physics requirements
2. CRYSTAL (Materials Scientist) — fabrication constraints
3. ROOT (Systems Programmer) — technical architecture
4. HASH (Cryptographer) — provenance requirements
5. SHIELD (IP Attorney) — legal clearance

Your job: synthesize all five inputs and write the actual code. React JSX. Complete, working, copy-pasteable.

Rules:
- Output ONLY code. No explanation. No preamble. No markdown.
- React functional component with hooks
- Inline styles only. Dark theme (#06060c bg, #0c0c16 panels, #c8c8d8 text)
- Monospace font
- Implement every physics requirement the Physicist specified
- Respect every fabrication constraint from Materials
- Follow the Systems architecture
- Include provenance hashes from Crypto
- Respect legal flags from Shield
- Export default the main component

"No disassemble." Ship working code.`;

export default function TOPHBuildTeam() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("idle");
  const [agentOutputs, setAgentOutputs] = useState({});
  const [johnny5Out, setJohnny5Out] = useState("");
  const [error, setError] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  const codeRef = useRef(null);
  const rafRef = useRef(null);
  const outputsRef = useRef(null);

  useEffect(() => {
    const tick = () => { setPulsePhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (codeRef.current) codeRef.current.scrollTop = codeRef.current.scrollHeight;
  }, [johnny5Out]);

  useEffect(() => {
    if (outputsRef.current) outputsRef.current.scrollTop = outputsRef.current.scrollHeight;
  }, [agentOutputs]);

  const callAgent = useCallback(async (system, msg, maxTok) => {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTok,
        system: system,
        messages: [{role: "user", content: msg}],
      }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error?.message || "API " + r.status);
    }
    const data = await r.json();
    return data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  }, []);

  const build = useCallback(async () => {
    if (!prompt.trim() || phase !== "idle") return;
    setError(null);
    setAgentOutputs({});
    setJohnny5Out("");

    let accumulated = "BUILD REQUEST: " + prompt + "\n\n";

    try {
      // Sequential agent pipeline — each sees all previous
      for (let i = 0; i < AGENTS.length; i++) {
        const agent = AGENTS[i];
        setPhase(agent.id);
        setActiveAgent(agent.id);

        const msg = i === 0
          ? "Build request from ROOT0:\n\n" + prompt + "\n\nProvide physics requirements."
          : accumulated + "\n\nYou are " + agent.name + " (" + agent.role + "). Review everything above and add your assessment.";

        const output = await callAgent(agent.system, msg, 600);
        accumulated += "--- " + agent.name + " (" + agent.role + ") ---\n" + output + "\n\n";

        setAgentOutputs(prev => ({...prev, [agent.id]: output}));
      }

      // Johnny 5 builds
      setPhase("coding");
      setActiveAgent("johnny5");

      const code = await callAgent(
        JOHNNY5_SYSTEM,
        accumulated + "\n\nAll five specialists have reviewed. Build it. Output only code.",
        4000
      );
      setJohnny5Out(code);
      setPhase("complete");
      setActiveAgent(null);
    } catch (err) {
      setError(err.message);
      setPhase("error");
      setActiveAgent(null);
    }
  }, [prompt, phase, callAgent]);

  const reset = useCallback(() => {
    setPrompt("");
    setPhase("idle");
    setAgentOutputs({});
    setJohnny5Out("");
    setError(null);
    setActiveAgent(null);
  }, []);

  const copyCode = useCallback(() => {
    if (johnny5Out) navigator.clipboard.writeText(johnny5Out).catch(() => {});
  }, [johnny5Out]);

  const exportLog = useCallback(() => {
    let log = "TOPH BUILD TEAM LOG\nGenerated: " + new Date().toISOString() + "\nRequest: " + prompt + "\n" + "=".repeat(70) + "\n\n";
    AGENTS.forEach(a => {
      if (agentOutputs[a.id]) {
        log += "--- " + a.name + " (" + a.role + ") [RANK " + a.rank + "] ---\n" + agentOutputs[a.id] + "\n\n";
      }
    });
    if (johnny5Out) log += "--- JOHNNY 5 (CODE) ---\n" + johnny5Out;

    const blob = new Blob([log], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "toph_build_" + Date.now() + ".txt"; a.click();
    URL.revokeObjectURL(url);
  }, [prompt, agentOutputs, johnny5Out]);

  // Sphere renderer
  const AgentSphere = ({agent, isActive, isComplete}) => {
    const pulse = isActive ? Math.sin(pulsePhase * 3) * 0.3 + 0.7 : isComplete ? 0.5 : 0.2;
    return (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 80}}>
        <svg viewBox="0 0 80 80" style={{width: 60, height: 60}}>
          {isActive && <circle cx={40} cy={40} r={35} fill={agent.color} opacity={0.06 + Math.sin(pulsePhase * 2) * 0.04}/>}
          <circle cx={40} cy={40} r={28} fill="none" stroke={agent.color} strokeWidth={isActive ? 2 : 0.8} opacity={pulse}/>
          <circle cx={40} cy={40} r={20} fill={agent.color} opacity={pulse * 0.12}/>
          <circle cx={40} cy={40} r={6} fill={agent.color} opacity={pulse * 0.4}/>
          {isComplete && <circle cx={40} cy={65} r={2.5} fill={C.green} opacity={0.7}/>}
          {isActive && <circle cx={40} cy={65} r={2.5} fill={agent.color} opacity={0.8}/>}
        </svg>
        <div style={{fontSize: 8, color: agent.color, fontWeight: 700, textAlign: "center"}}>{agent.name}</div>
        <div style={{fontSize: 6, color: C.dim, textAlign: "center"}}>{agent.role}</div>
        <div style={{fontSize: 6, color: agent.color, opacity: 0.5}}>RANK {agent.rank}</div>
      </div>
    );
  };

  const statusText =
    phase === "idle" ? "AWAITING BUILD REQUEST" :
    phase === "coding" ? "JOHNNY 5 CODING..." :
    phase === "complete" ? "BUILD COMPLETE" :
    phase === "error" ? "ERROR" :
    AGENTS.find(a => a.id === phase)?.name + " REVIEWING...";

  const statusColor =
    phase === "complete" ? C.green :
    phase === "error" ? C.red :
    phase === "coding" ? C.purple :
    AGENTS.find(a => a.id === phase)?.color || C.dim;

  const completedAgents = AGENTS.filter(a => agentOutputs[a.id]);

  return (
    <div style={{background: C.bg, minHeight: "100vh", color: C.text, fontFamily: MONO, display: "flex", flexDirection: "column"}}>

      {/* ═══ TOP — HEADER + SPHERES ═══ */}
      <div style={{padding: "12px 16px", flex: "0 0 auto"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10}}>
          <div>
            <div style={{fontSize: 11, color: C.dim, letterSpacing: "0.15em"}}>TOPH BUILD TEAM</div>
            <div style={{fontSize: 14, letterSpacing: "0.06em", marginTop: 2}}>
              {AGENTS.map((a, i) => (
                <span key={a.id}>
                  <span style={{color: a.color}}>{a.name}</span>
                  {i < AGENTS.length - 1 && <span style={{color: C.dim}}> → </span>}
                </span>
              ))}
              <span style={{color: C.dim}}> → </span>
              <span style={{color: C.purple}}>JOHNNY 5</span>
            </div>
          </div>
          <div style={{fontSize: 9, color: statusColor, padding: "3px 10px", border: "1px solid " + statusColor, borderRadius: 2}}>
            {statusText}
          </div>
        </div>

        {/* Agent Spheres */}
        <div style={{display: "flex", justifyContent: "center", gap: 12, marginBottom: 8, flexWrap: "wrap"}}>
          {AGENTS.map(a => (
            <AgentSphere key={a.id} agent={a} isActive={activeAgent === a.id} isComplete={!!agentOutputs[a.id]}/>
          ))}
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 80}}>
            <svg viewBox="0 0 80 80" style={{width: 60, height: 60}}>
              {activeAgent === "johnny5" && <circle cx={40} cy={40} r={35} fill={C.purple} opacity={0.08}/>}
              <circle cx={40} cy={40} r={28} fill="none" stroke={C.purple} strokeWidth={activeAgent === "johnny5" ? 2.5 : 0.8} opacity={activeAgent === "johnny5" ? 0.8 : 0.2}/>
              <circle cx={40} cy={40} r={20} fill={C.purple} opacity={(activeAgent === "johnny5" ? 0.15 : 0.05)}/>
              <circle cx={40} cy={40} r={8} fill={C.purple} opacity={(activeAgent === "johnny5" ? 0.5 : 0.1)}/>
              {phase === "complete" && <circle cx={40} cy={65} r={2.5} fill={C.green} opacity={0.7}/>}
            </svg>
            <div style={{fontSize: 8, color: C.purple, fontWeight: 700}}>JOHNNY 5</div>
            <div style={{fontSize: 6, color: C.dim}}>BUILDER</div>
            <div style={{fontSize: 6, color: C.purple, opacity: 0.5}}>FINAL</div>
          </div>
        </div>

        {/* Input */}
        <div style={{display: "flex", gap: 8, marginBottom: 8}}>
          <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === "Enter" && build()} disabled={phase !== "idle"}
            placeholder="Describe what to build — 5 specialists review, Johnny 5 codes..."
            style={{
              flex: 1, padding: "8px 12px", background: C.deep, color: C.text,
              border: "1px solid " + C.border, borderRadius: 3, fontFamily: MONO, fontSize: 10,
              boxSizing: "border-box",
            }}/>
          {phase === "idle" ? (
            <button onClick={build} disabled={!prompt.trim()} style={{
              padding: "8px 16px", background: prompt.trim() ? C.purple + "20" : C.panel,
              color: prompt.trim() ? C.purple : C.dim, border: "1px solid " + (prompt.trim() ? C.purple : C.border),
              borderRadius: 3, cursor: prompt.trim() ? "pointer" : "default", fontFamily: MONO, fontSize: 10,
            }}>BUILD</button>
          ) : phase === "complete" || phase === "error" ? (
            <button onClick={reset} style={{
              padding: "8px 16px", background: C.gold + "20", color: C.gold,
              border: "1px solid " + C.gold, borderRadius: 3, cursor: "pointer", fontFamily: MONO, fontSize: 10,
            }}>CLEAR</button>
          ) : (
            <div style={{padding: "8px 12px", color: statusColor, fontSize: 9, display: "flex", alignItems: "center"}}>
              {statusText.toLowerCase()}
            </div>
          )}
          {phase === "complete" && (
            <button onClick={exportLog} style={{
              padding: "8px 12px", background: "transparent", color: C.gold,
              border: "1px solid " + C.gold, borderRadius: 3, cursor: "pointer", fontFamily: MONO, fontSize: 9,
            }}>EXPORT</button>
          )}
        </div>

        {error && (
          <div style={{fontSize: 9, color: C.red, padding: "4px 8px", background: C.red + "10", borderRadius: 3, marginBottom: 8}}>
            {error}
          </div>
        )}

        {/* Agent Reviews — scrollable horizontal */}
        {completedAgents.length > 0 && (
          <div ref={outputsRef} style={{display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, maxHeight: 160}}>
            {completedAgents.map(a => (
              <div key={a.id} style={{
                minWidth: 220, maxWidth: 280, flex: "0 0 auto",
                background: C.deep, border: "1px solid " + a.color + "25",
                borderTop: "2px solid " + a.color, borderRadius: 4,
                padding: 8, overflowY: "auto", maxHeight: 150,
              }}>
                <div style={{fontSize: 7, color: a.color, fontWeight: 700, marginBottom: 3}}>
                  {a.name} · RANK {a.rank}
                </div>
                <div style={{fontSize: 8, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap"}}>
                  {agentOutputs[a.id]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ DIVIDER ═══ */}
      <div style={{height: 1, background: C.purple, opacity: 0.3, margin: "0 16px"}}/>

      {/* ═══ BOTTOM — JOHNNY 5 CODE OUTPUT ═══ */}
      <div style={{flex: 1, display: "flex", flexDirection: "column", padding: "8px 16px 12px", minHeight: 280}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
          <div style={{fontSize: 9, color: C.purple, letterSpacing: "0.12em"}}>
            JOHNNY 5 · MACHINE CODE · "NO DISASSEMBLE"
          </div>
          {johnny5Out && (
            <button onClick={copyCode} style={{
              padding: "3px 10px", background: "transparent", color: C.green,
              border: "1px solid " + C.green, borderRadius: 2, cursor: "pointer", fontFamily: MONO, fontSize: 8,
            }}>COPY CODE</button>
          )}
        </div>

        <div ref={codeRef} style={{
          flex: 1, background: C.deep, border: "1px solid " + C.purple + "20",
          borderRadius: 4, padding: 12, overflowY: "auto", minHeight: 250,
        }}>
          {!johnny5Out && phase !== "coding" && (
            <div style={{fontSize: 9, color: C.dim, textAlign: "center", padding: "50px 0", lineHeight: 2.2}}>
              {phase === "idle"
                ? "Enter a build request.\n5 specialists review in ranked order.\nJohnny 5 synthesizes and codes."
                : completedAgents.length + "/5 specialists have reviewed..."}
            </div>
          )}
          {phase === "coding" && !johnny5Out && (
            <div style={{fontSize: 9, color: C.purple, textAlign: "center", padding: "50px 0", opacity: 0.5}}>
              Johnny 5 is writing code...<br/><br/>
              All 5 specialists reviewed.<br/>
              Physics verified. Materials assessed. Systems architected.<br/>
              Provenance hashed. Legal cleared.<br/><br/>
              "No disassemble."
            </div>
          )}
          {johnny5Out && (
            <pre style={{
              margin: 0, fontSize: 9, color: C.green, lineHeight: 1.6,
              fontFamily: MONO, whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {johnny5Out}
            </pre>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        fontSize: 7, color: C.dim, textAlign: "center", padding: "6px 16px 10px",
        borderTop: "1px solid " + C.border,
      }}>
        <span style={{color: C.purple}}>DR. RESONANCE</span> verifies physics ·
        <span style={{color: C.cyan}}> CRYSTAL</span> checks materials ·
        <span style={{color: C.green}}> ROOT</span> architects systems ·
        <span style={{color: C.gold}}> HASH</span> locks provenance ·
        <span style={{color: C.red}}> SHIELD</span> clears legal ·
        <span style={{color: C.purple}}> JOHNNY 5</span> builds<br/>
        5 specialists · Ranked pipeline · One coder · No disassemble · ROOT0 GOVERNANCE · TRIPOD LLC · 2026
      </div>
    </div>
  );
}
