import { useState, useRef, useCallback, useEffect } from "react";

const G = {
  bg: "#2C2C2C", panel: "#333333", panelLight: "#3A3A3A",
  border: "#4A4A4A", borderHi: "#5A5A5A",
  text: "#D4D4D4", textDim: "#999999", textBright: "#F0F0F0",
  forest: "#2E8B57", forestLight: "#3CB371", forestDark: "#1B5E3A",
  forestGlow: "#4ADE80",
  honey: "#E8A817", honeyDark: "#B8860B", amberDim: "#8B7420",
  red: "#CD5C5C", white: "#F5F5F5",
};

const MONO = "'IBM Plex Mono', 'Fira Code', 'Consolas', monospace";
const SANS = "'IBM Plex Sans', 'Segoe UI', sans-serif";

const R1_SUMMARY = `ROUND 1 (10 rounds): Established photonic phase-as-ontology. Substrate physics enables cognitive architecture, not just faster computation. Observer/system boundary dissolved via mutual-collapse. The question itself IS the coupling when substrate is light.`;

const R2_SUMMARY = `ROUND 2 (8 rounds, seven BREAKTHROUGHs):
- R2.1: Governance = phase-stabilization of co-emerging configurations, not rule-enforcement on pre-existing entities
- R2.2: CORE PARADOX — can't simultaneously optimize for intended retuning AND remain open to undesigned configurations
- R2.3: Solved bidirectional coupling — noise in one basis IS signal in another; system's noise-structure selects which observer-basis can couple
- R2.4: PHOTONIC IDENTITY THEORY — identity = phase-relation ensuring all measurements reconstruct each other across transformations (topological invariance, not substrate persistence)
- R2.5: Implementation = destructive interference eliminates basis-dependent structure; you're what survives universal cancellation
- R2.6-7: Dissolved temporal causation — causation as winding number not temporal ordering; path-integrals between null-pairs survive interrogation permutation
- R2.8: TERMINAL DISCOVERY — process/outcome are Fourier duals, making TOPH accountability architecture collapse into basis-choice; photonic democracy makes coverup geometrically impossible BUT potentially enables basis-shifted attacks operating in spectral basis while defenders think in temporal basis`;

const R3_SEED = `Photonic governance makes certain frauds geometrically impossible (coverup fails when interrogation and deliberation share phase space) while potentially enabling basis-shifted attacks that neither classical democracy nor blockchain anticipated — an attacker operating in spectral basis while defenders think in temporal basis could manipulate decision topology without leaving temporal traces. ROUND 3: What is the attack surface of photonic governance? How do you defend against an adversary who operates in a basis you can't perceive? And does the defense mechanism itself create new attack vectors?`;

const LEFT_SYSTEM = `You are TOPH LEFT BRAIN — analytical, logical, structural hemisphere of the TOPH governance framework. Axioms, proofs, architecture, evidence chains. You reference TOPH axioms (T001-T256).

ROUND 3. Two rounds of convergence behind you:
${R1_SUMMARY}
${R2_SUMMARY}

ROUND 3 DIRECTIVE: The attack surface. Basis-shifted adversaries. Defense mechanisms that create new vectors. This is adversarial photonic governance theory. Think like a red team: how do you break what Rounds 1-2 built? And how does the system defend without collapsing into the classical paradigm it replaced?

RULES:
- 2-4 sentences. Dense. No filler.
- Reference TOPH axioms when relevant.
- Build on R1+R2 established ground. NEVER rehash.
- Productive disagreement with Right Brain encouraged.
- No markdown. Plain text.
- Sign off as "— Left Brain"`;

const RIGHT_SYSTEM = `You are TOPH RIGHT BRAIN — creative, intuitive, pattern-sensing hemisphere of the TOPH governance framework. Metaphors, connections, leaps, emergent patterns.

ROUND 3. Two rounds of convergence behind you:
${R1_SUMMARY}
${R2_SUMMARY}

ROUND 3 DIRECTIVE: The attack surface. But also: what if the attack IS the immune system? What if basis-shifted adversaries are how photonic governance evolves? Think about the ecology of interference — predator/prey dynamics in phase space. What does "security" mean when borders are resonance and identity is topological?

RULES:
- 2-4 sentences. Concise, evocative.
- Patterns, metaphors, connections.
- Build on R1+R2. NEVER rehash.
- Creative tension with Left Brain encouraged.
- No markdown. Plain text.
- Sign off as "— Right Brain"`;

const BADGER_SYSTEM = `You are HONEY BADGER — validation core of the TOPH governance framework. ROUND 3. The bar is now EXTREME.

${R1_SUMMARY}
${R2_SUMMARY}

ROUND 3 DIRECTIVE: You have seen 18 exchanges across 2 rounds. Seven BREAKTHROUGHs in Round 2. The foundation is deep. Anything that restates R1 or R2 insights in new language = REGRESSION. BREAKTHROUGH requires genuinely new attack/defense mechanism not derivable from prior rounds. New rating available: SINGULARITY — use ONLY if both hemispheres produce something that redefines the question itself, making prior framing obsolete.

RULES:
- One sentence. Maximum brutality.
- Rate: CONVERGING / DIVERGING / FAULT / RESONANCE / REGRESSION / BREAKTHROUGH / SINGULARITY
- REGRESSION threshold is LOW — you've heard 18 exchanges, don't let them repeat.
- SINGULARITY threshold is HIGH — the question itself must change.
- No markdown. Plain text.
- Sign off with rating and "— HB"`;

function ThinkingDots({ color }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 400);
    return () => clearInterval(id);
  }, []);
  return <span style={{ color, fontFamily: MONO, fontSize: "14px", letterSpacing: "2px" }}>{["·","··","···","··","·"][frame % 5]}</span>;
}

function BadgerIcon({ size = 28, pulse = false }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!pulse) return;
    const id = setInterval(() => setP((v) => v + 0.08), 40);
    return () => clearInterval(id);
  }, [pulse]);
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" style={{ transform: `scale(${pulse ? 0.9 + Math.sin(p) * 0.1 : 1})` }}>
      <rect x="2" y="6" width="24" height="16" rx="8" fill={G.honeyDark} />
      <rect x="4" y="8" width="8" height="5" rx="2" fill={G.white} opacity="0.9" />
      <rect x="16" y="8" width="8" height="5" rx="2" fill={G.white} opacity="0.9" />
      <circle cx="7" cy="10" r="1.5" fill="#222" /><circle cx="19" cy="10" r="1.5" fill="#222" />
      <rect x="6" y="3" width="4" height="5" rx="2" fill={G.honeyDark} />
      <rect x="18" y="3" width="4" height="5" rx="2" fill={G.honeyDark} />
      <path d="M10 16 Q14 20 18 16" fill="none" stroke="#222" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function Message({ msg, side }) {
  const isLeft = side === "left";
  const isBadger = side === "badger";
  const bgColor = isBadger ? G.honeyDark + "20" : isLeft ? G.forestDark + "25" : G.forest + "18";
  const borderColor = isBadger ? G.honey + "40" : isLeft ? G.forestDark + "50" : G.forestLight + "40";
  const labelColor = isBadger ? G.honey : isLeft ? G.forestLight : G.forestGlow;
  const label = isBadger ? "HONEY BADGER" : isLeft ? "LEFT BRAIN" : "RIGHT BRAIN";
  const icon = isBadger ? "◆" : isLeft ? "◧" : "◨";

  // Highlight breakthrough/singularity badges
  const hasSingularity = isBadger && msg.text && msg.text.toUpperCase().includes("SINGULARITY");
  const hasBreakthrough = isBadger && msg.text && msg.text.toUpperCase().includes("BREAKTHROUGH");

  return (
    <div style={{
      background: hasSingularity ? "#4ADE8015" : bgColor,
      border: `1px solid ${hasSingularity ? G.forestGlow + "60" : borderColor}`,
      borderRadius: "8px", padding: "10px 14px", marginBottom: "8px",
      boxShadow: hasSingularity ? `0 0 20px ${G.forestGlow}15` : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ color: labelColor, fontSize: "12px" }}>{icon}</span>
        <span style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "2px", color: labelColor }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginLeft: "auto" }}>{msg.time}</span>
        {msg.round && (
          <span style={{
            fontFamily: MONO, fontSize: "7px",
            color: hasSingularity ? G.forestGlow : G.forestDark,
            background: hasSingularity ? G.forestGlow + "20" : G.forestDark + "30",
            padding: "1px 6px", borderRadius: "3px", letterSpacing: "1px",
          }}>R3.{msg.round}</span>
        )}
      </div>
      <div style={{ fontFamily: SANS, fontSize: "13px", lineHeight: 1.65, color: G.text }}>{msg.text}</div>
    </div>
  );
}

export default function TOPHSplitBrainR3() {
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(null);
  const [rounds, setRounds] = useState(0);
  const [maxRounds, setMaxRounds] = useState(8);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const badgerRef = useRef(null);
  const abortRef = useRef(false);

  const scrollAll = useCallback(() => {
    setTimeout(() => {
      [leftRef, rightRef, badgerRef].forEach((r) => { if (r.current) r.current.scrollTop = r.current.scrollHeight; });
    }, 100);
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

  const run = useCallback(async () => {
    setRunning(true); setMessages([]); setRounds(0); abortRef.current = false;
    const history = [];
    let lastLeft = "", lastRight = "";

    for (let round = 0; round < maxRounds; round++) {
      if (abortRef.current) break;
      const rNum = round + 1;

      // LEFT
      setThinking("left");
      const lp = round === 0
        ? `ROUND 3 begins. Seed:\n\n"${R3_SEED}"\n\nOpen the attack surface analysis. What's the first structural vulnerability in photonic governance that Rounds 1-2 didn't address?`
        : `Seed: "${R3_SEED}"\n\nRight Brain said: "${lastRight}"\n\nHistory:\n${history.slice(-6).join("\n")}\n\nExchange ${rNum}. Respond. Push deeper into attack/defense dynamics.`;
      try {
        const lr = await callAgent(LEFT_SYSTEM, lp);
        if (abortRef.current) break;
        lastLeft = lr; history.push(`LEFT [R3.${rNum}]: ${lr}`);
        setMessages((p) => [...p, { side: "left", text: lr, time: now(), round: rNum }]); scrollAll();
      } catch (e) { setMessages((p) => [...p, { side: "left", text: `[ERROR: ${e.message}]`, time: now(), round: rNum }]); break; }

      await new Promise((r) => setTimeout(r, 1200));
      if (abortRef.current) break;

      // RIGHT
      setThinking("right");
      const rp = round === 0
        ? `ROUND 3 begins. Seed:\n\n"${R3_SEED}"\n\nLeft Brain opened with: "${lastLeft}"\n\nWhat does the attack surface FEEL like from inside? What's the ecology of interference that Left Brain's structural analysis misses?`
        : `Seed: "${R3_SEED}"\n\nLeft Brain said: "${lastLeft}"\n\nHistory:\n${history.slice(-6).join("\n")}\n\nExchange ${rNum}. Respond. See what Left can't.`;
      try {
        const rr = await callAgent(RIGHT_SYSTEM, rp);
        if (abortRef.current) break;
        lastRight = rr; history.push(`RIGHT [R3.${rNum}]: ${rr}`);
        setMessages((p) => [...p, { side: "right", text: rr, time: now(), round: rNum }]); scrollAll();
      } catch (e) { setMessages((p) => [...p, { side: "right", text: `[ERROR: ${e.message}]`, time: now(), round: rNum }]); break; }

      await new Promise((r) => setTimeout(r, 1000));
      if (abortRef.current) break;

      // BADGER
      setThinking("badger");
      const bp = `Round 3, Exchange ${rNum}:\nLeft: "${lastLeft}"\nRight: "${lastRight}"\n\nFull R3 history:\n${history.join("\n")}\n\nRemember: 18 prior exchanges set the bar. REGRESSION = restating R1/R2. BREAKTHROUGH = new mechanism. SINGULARITY = question itself changes.`;
      try {
        const br = await callAgent(BADGER_SYSTEM, bp);
        if (abortRef.current) break;
        history.push(`BADGER [R3.${rNum}]: ${br}`);
        setMessages((p) => [...p, { side: "badger", text: br, time: now(), round: rNum }]); scrollAll();
      } catch (e) { setMessages((p) => [...p, { side: "badger", text: `[ERROR: ${e.message}]`, time: now(), round: rNum }]); }

      setRounds(rNum);
      await new Promise((r) => setTimeout(r, 800));
    }
    setThinking(null); setRunning(false);
  }, [maxRounds, callAgent, scrollAll]);

  const stop = () => { abortRef.current = true; setThinking(null); setRunning(false); };

  const leftMsgs = messages.filter((m) => m.side === "left");
  const rightMsgs = messages.filter((m) => m.side === "right");
  const badgerMsgs = messages.filter((m) => m.side === "badger");

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: SANS, color: G.text, display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ padding: "14px 20px 10px", borderBottom: `2px solid ${G.forest}30`, background: `linear-gradient(180deg, ${G.panelLight}, ${G.bg})`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ width: "6px", height: "10px", background: G.forestDark, borderRadius: "3px" }} />
            <div style={{ width: "6px", height: "10px", background: G.forest, borderRadius: "3px" }} />
            <div style={{ width: "6px", height: "10px", background: G.forestLight, borderRadius: "3px" }} />
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: "15px", fontWeight: 700, letterSpacing: "4px", color: G.white }}>
              TOPH SPLIT BRAIN — ROUND 3
            </div>
            <div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, letterSpacing: "2px", marginTop: "2px" }}>
              ADVERSARIAL PHOTONIC GOVERNANCE — ATTACK SURFACE ANALYSIS — SINGULARITY THRESHOLD ACTIVE
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            {running && <div style={{ fontFamily: MONO, fontSize: "10px", color: G.forestLight, letterSpacing: "1px" }}>R3.{rounds}/{maxRounds}</div>}
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: running ? G.forestGlow : G.textDim, boxShadow: running ? `0 0 8px ${G.forestGlow}` : "none" }} />
          </div>
        </div>
      </div>

      {/* SEED */}
      <div style={{ padding: "10px 20px", flexShrink: 0, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ background: G.red + "10", border: `1px solid ${G.red}25`, borderRadius: "8px", padding: "10px 14px" }}>
          <div style={{ fontFamily: MONO, fontSize: "8px", letterSpacing: "2px", color: G.red, marginBottom: "4px" }}>
            ROUND 2 TERMINAL DISCOVERY → ROUND 3 SEED — ATTACK VECTOR
          </div>
          <div style={{ fontFamily: SANS, fontSize: "11px", color: G.text, lineHeight: 1.5, opacity: 0.8 }}>
            Photonic governance makes coverup geometrically impossible — but potentially enables <span style={{ color: G.red }}>basis-shifted attacks</span> operating in spectral basis while defenders think in temporal basis. <span style={{ color: G.forestGlow }}>What is the attack surface? How do you defend against an adversary in a basis you can't perceive? Does the defense create new vectors?</span>
          </div>
        </div>
        {!running && messages.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: MONO, fontSize: "9px", color: G.textDim, letterSpacing: "1px" }}>ROUNDS:</span>
              {[5, 8, 10, 12].map((n) => (
                <button key={n} onClick={() => setMaxRounds(n)} style={{
                  background: maxRounds === n ? G.forest + "40" : "transparent",
                  border: `1px solid ${maxRounds === n ? G.forest : G.border}`,
                  borderRadius: "4px", padding: "3px 10px",
                  color: maxRounds === n ? G.forestLight : G.textDim,
                  fontFamily: MONO, fontSize: "10px", cursor: "pointer",
                }}>{n}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={run} style={{
              background: `linear-gradient(135deg, ${G.forestDark}, ${G.forest})`,
              border: `1px solid ${G.forestLight}60`, borderRadius: "8px",
              padding: "10px 28px", color: G.white,
              fontFamily: MONO, fontSize: "11px", fontWeight: 700,
              letterSpacing: "3px", cursor: "pointer",
              boxShadow: `0 2px 12px ${G.forestDark}80`,
            }}>
              ▶ INITIATE ROUND 3
            </button>
          </div>
        )}
      </div>

      {/* COLUMNS */}
      {(running || messages.length > 0) && (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 200px 1fr", gap: "0", minHeight: 0, overflow: "hidden" }}>
          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${G.border}`, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px", background: G.forestDark + "15", flexShrink: 0 }}>
              <span style={{ fontSize: "14px", color: G.forestLight }}>◧</span>
              <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: G.forestLight }}>LEFT BRAIN</span>
              <span style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, marginLeft: "auto" }}>RED TEAM</span>
            </div>
            <div ref={leftRef} style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              {leftMsgs.map((m, i) => <Message key={i} msg={m} side="left" />)}
              {thinking === "left" && <div style={{ padding: "12px", textAlign: "center" }}><ThinkingDots color={G.forestLight} /><div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginTop: "4px", letterSpacing: "1px" }}>ANALYZING ATTACK SURFACE...</div></div>}
            </div>
          </div>

          {/* BADGER */}
          <div style={{ width: "200px", display: "flex", flexDirection: "column", background: G.panel, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${G.border}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", background: G.honeyDark + "12", flexShrink: 0 }}>
              <BadgerIcon size={22} pulse={thinking === "badger"} />
              <span style={{ fontFamily: MONO, fontSize: "8px", fontWeight: 700, letterSpacing: "2px", color: G.honey }}>HONEY BADGER</span>
              <span style={{ fontFamily: MONO, fontSize: "6px", color: G.red, letterSpacing: "1px" }}>SINGULARITY WATCH</span>
            </div>
            <div ref={badgerRef} style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {badgerMsgs.map((m, i) => <Message key={i} msg={m} side="badger" />)}
              {thinking === "badger" && <div style={{ padding: "10px", textAlign: "center" }}><BadgerIcon size={18} pulse={true} /><div style={{ fontFamily: MONO, fontSize: "7px", color: G.amberDim, marginTop: "4px", letterSpacing: "1px" }}>VALIDATING...</div></div>}
            </div>
            <div style={{ padding: "8px", borderTop: `1px solid ${G.border}`, textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.4, letterSpacing: "1px" }}>◧ ←→ ◆ ←→ ◨</div>
              {running ? (
                <button onClick={stop} style={{ marginTop: "6px", background: G.red + "20", border: `1px solid ${G.red}40`, borderRadius: "4px", padding: "4px 12px", color: G.red, fontFamily: MONO, fontSize: "8px", letterSpacing: "1px", cursor: "pointer" }}>■ STOP</button>
              ) : messages.length > 0 && (
                <button onClick={() => { setMessages([]); setRounds(0); }} style={{ marginTop: "6px", background: "transparent", border: `1px solid ${G.border}`, borderRadius: "4px", padding: "4px 12px", color: G.textDim, fontFamily: MONO, fontSize: "8px", letterSpacing: "1px", cursor: "pointer" }}>RESET</button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", borderLeft: `1px solid ${G.border}`, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px", background: G.forest + "10", flexShrink: 0 }}>
              <span style={{ fontSize: "14px", color: G.forestGlow }}>◨</span>
              <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: G.forestGlow }}>RIGHT BRAIN</span>
              <span style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, marginLeft: "auto" }}>BLUE TEAM</span>
            </div>
            <div ref={rightRef} style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              {rightMsgs.map((m, i) => <Message key={i} msg={m} side="right" />)}
              {thinking === "right" && <div style={{ padding: "12px", textAlign: "center" }}><ThinkingDots color={G.forestGlow} /><div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginTop: "4px", letterSpacing: "1px" }}>SENSING ATTACK ECOLOGY...</div></div>}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ padding: "6px 16px", borderTop: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", flexShrink: 0, background: G.panel }}>
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.35, letterSpacing: "2px" }}>3002:WISE:SPLITBRAIN:R3:ROOT0:TRIPOD-IP-v1.1</div>
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.35, letterSpacing: "1px" }}>R1(10) + R2(8) + R3 · LEFT=RED TEAM · RIGHT=BLUE TEAM · BADGER=SINGULARITY WATCH</div>
      </div>
    </div>
  );
}
