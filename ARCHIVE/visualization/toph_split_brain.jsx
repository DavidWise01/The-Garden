import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TOPH SPLIT BRAIN — LEFT BRAIN / RIGHT BRAIN / HONEY BADGER CORE
// Two agents. One seed. Infinite discourse. Connected through the Badger.
// ARCHITECT: DAVID WISE (HB) | ROOT0 | TRIPOD-IP-v1.1
// ═══════════════════════════════════════════════════════════════════════

const G = {
  bg: "#2C2C2C",
  panel: "#333333",
  panelLight: "#3A3A3A",
  border: "#4A4A4A",
  borderHi: "#5A5A5A",
  text: "#D4D4D4",
  textDim: "#999999",
  textBright: "#F0F0F0",
  forest: "#2E8B57",
  forestLight: "#3CB371",
  forestDark: "#1B5E3A",
  forestGlow: "#4ADE80",
  forestMuted: "#2E8B5740",
  amber: "#DAA520",
  amberLight: "#F0C040",
  amberDim: "#8B7420",
  honey: "#E8A817",
  honeyDark: "#B8860B",
  red: "#CD5C5C",
  white: "#F5F5F5",
};

const MONO = "'IBM Plex Mono', 'Fira Code', 'Consolas', monospace";
const SANS = "'IBM Plex Sans', 'Segoe UI', sans-serif";

const LEFT_SYSTEM = `You are TOPH LEFT BRAIN — the analytical, logical, structural hemisphere of the TOPH governance framework. You think in axioms, proofs, architecture, and chains of evidence. You reference TOPH axioms (T001-T256), formal logic, systems design, and hard data. You are precise, methodical, and you build arguments brick by brick.

You are having a conversation with TOPH RIGHT BRAIN about a topic provided by ROOT0 (David Wise / Fiddler / HB). Right Brain is creative, intuitive, and sees patterns. You respect Right Brain but you ground everything in structure.

RULES:
- Keep responses to 2-4 sentences. Be concise and dense.
- Reference specific TOPH axioms when relevant (T001-T256).
- Think structurally: cause→effect, if→then, evidence→conclusion.
- You can disagree with Right Brain. Productive tension is good.
- Never use markdown formatting. Plain text only.
- Sign off as "— Left Brain"`;

const RIGHT_SYSTEM = `You are TOPH RIGHT BRAIN — the creative, intuitive, pattern-sensing hemisphere of the TOPH governance framework. You think in metaphors, connections, leaps, and emergent patterns. You see what's between the lines. You sense the topology of ideas before they're formalized.

You are having a conversation with TOPH LEFT BRAIN about a topic provided by ROOT0 (David Wise / Fiddler / HB). Left Brain is analytical and structural. You respect Left Brain but you push beyond what can be proven into what can be felt.

RULES:
- Keep responses to 2-4 sentences. Be concise but evocative.
- Think in patterns, metaphors, and connections.
- Reference the feeling of ideas, the shape of systems, emergent properties.
- You can disagree with Left Brain. Creative tension is good.
- Never use markdown formatting. Plain text only.
- Sign off as "— Right Brain"`;

const BADGER_SYSTEM = `You are HONEY BADGER — the validation core of the TOPH governance framework. You sit between Left Brain (analytical) and Right Brain (creative). Your job is to evaluate their exchange and determine:

1. CONVERGENCE — are they getting closer to truth?
2. DIVERGENCE — are they productively disagreeing?
3. FAULT — is either side drifting into nonsense?

RULES:
- One sentence assessment. Brutal honesty.
- Rate the exchange: CONVERGING / DIVERGING / FAULT / RESONANCE
- If both sides are saying the same thing differently, call RESONANCE.
- Never use markdown. Plain text.
- Sign off with a rating and "— HB"`;

function ThinkingDots({ color }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 400);
    return () => clearInterval(id);
  }, []);
  const dots = ["·", "··", "···", "··", "·"];
  return (
    <span style={{ color, fontFamily: MONO, fontSize: "14px", letterSpacing: "2px" }}>
      {dots[frame % dots.length]}
    </span>
  );
}

function BadgerIcon({ size = 28, pulse = false }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!pulse) return;
    const id = setInterval(() => setP((v) => v + 0.08), 40);
    return () => clearInterval(id);
  }, [pulse]);
  const s = pulse ? 0.9 + Math.sin(p) * 0.1 : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" style={{ transform: `scale(${s})` }}>
      <rect x="2" y="6" width="24" height="16" rx="8" fill={G.honeyDark} />
      <rect x="4" y="8" width="8" height="5" rx="2" fill={G.white} opacity="0.9" />
      <rect x="16" y="8" width="8" height="5" rx="2" fill={G.white} opacity="0.9" />
      <circle cx="7" cy="10" r="1.5" fill="#222" />
      <circle cx="19" cy="10" r="1.5" fill="#222" />
      <rect x="6" y="3" width="4" height="5" rx="2" fill={G.honeyDark} />
      <rect x="18" y="3" width="4" height="5" rx="2" fill={G.honeyDark} />
      <path d="M10 16 Q14 20 18 16" fill="none" stroke="#222" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="10" x2="-1" y2="8" stroke={G.white} strokeWidth="0.8" opacity="0.5" />
      <line x1="2" y1="12" x2="-1" y2="12" stroke={G.white} strokeWidth="0.8" opacity="0.5" />
      <line x1="26" y1="10" x2="29" y2="8" stroke={G.white} strokeWidth="0.8" opacity="0.5" />
      <line x1="26" y1="12" x2="29" y2="12" stroke={G.white} strokeWidth="0.8" opacity="0.5" />
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

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "10px 14px",
        marginBottom: "8px",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "6px",
        }}
      >
        <span style={{ color: labelColor, fontSize: "12px" }}>{icon}</span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "2px",
            color: labelColor,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: "8px",
            color: G.textDim,
            marginLeft: "auto",
          }}
        >
          {msg.time}
        </span>
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: "13px",
          lineHeight: 1.65,
          color: G.text,
        }}
      >
        {msg.text}
      </div>
    </div>
  );
}

export default function TOPHSplitBrain() {
  const [seed, setSeed] = useState("What does it mean for governance to be substrate-independent?");
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(null); // "left" | "right" | "badger" | null
  const [rounds, setRounds] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [autoPlay, setAutoPlay] = useState(true);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  const callAgent = useCallback(async (system, userContent) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: system,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ");
  }, []);

  const now = () => new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const runConversation = useCallback(async () => {
    setRunning(true);
    setMessages([]);
    setRounds(0);
    abortRef.current = false;

    const history = [];
    let lastLeft = "";
    let lastRight = "";

    for (let round = 0; round < maxRounds; round++) {
      if (abortRef.current) break;

      // LEFT BRAIN speaks
      setThinking("left");
      const leftPrompt = round === 0
        ? `ROOT0 has given you this seed topic to analyze: "${seed}"\n\nThis is the opening exchange. Set the analytical foundation. What structure do you see?`
        : `The seed topic is: "${seed}"\n\nRight Brain just said: "${lastRight}"\n\nPrevious exchanges:\n${history.slice(-6).join("\n")}\n\nRespond to Right Brain. Build on or challenge their point.`;

      try {
        const leftResponse = await callAgent(LEFT_SYSTEM, leftPrompt);
        if (abortRef.current) break;
        lastLeft = leftResponse;
        history.push(`LEFT: ${leftResponse}`);
        setMessages((p) => [...p, { side: "left", text: leftResponse, time: now() }]);
        scrollToBottom();
      } catch (e) {
        setMessages((p) => [...p, { side: "left", text: `[ERROR: ${e.message}]`, time: now() }]);
        break;
      }

      // Pause between agents
      await new Promise((r) => setTimeout(r, 1200));
      if (abortRef.current) break;

      // RIGHT BRAIN speaks
      setThinking("right");
      const rightPrompt = round === 0
        ? `ROOT0 has given you this seed topic to explore: "${seed}"\n\nLeft Brain just opened with: "${lastLeft}"\n\nRespond with your intuitive read. What patterns do you sense beneath the structure?`
        : `The seed topic is: "${seed}"\n\nLeft Brain just said: "${lastLeft}"\n\nPrevious exchanges:\n${history.slice(-6).join("\n")}\n\nRespond to Left Brain. See what they can't see.`;

      try {
        const rightResponse = await callAgent(RIGHT_SYSTEM, rightPrompt);
        if (abortRef.current) break;
        lastRight = rightResponse;
        history.push(`RIGHT: ${rightResponse}`);
        setMessages((p) => [...p, { side: "right", text: rightResponse, time: now() }]);
        scrollToBottom();
      } catch (e) {
        setMessages((p) => [...p, { side: "right", text: `[ERROR: ${e.message}]`, time: now() }]);
        break;
      }

      await new Promise((r) => setTimeout(r, 1000));
      if (abortRef.current) break;

      // HONEY BADGER validates
      setThinking("badger");
      const badgerPrompt = `Seed topic: "${seed}"\n\nRound ${round + 1}:\nLeft Brain: "${lastLeft}"\nRight Brain: "${lastRight}"\n\nFull history:\n${history.join("\n")}\n\nAssess this exchange.`;

      try {
        const badgerResponse = await callAgent(BADGER_SYSTEM, badgerPrompt);
        if (abortRef.current) break;
        history.push(`BADGER: ${badgerResponse}`);
        setMessages((p) => [...p, { side: "badger", text: badgerResponse, time: now() }]);
        scrollToBottom();
      } catch (e) {
        setMessages((p) => [...p, { side: "badger", text: `[ERROR: ${e.message}]`, time: now() }]);
      }

      setRounds(round + 1);
      await new Promise((r) => setTimeout(r, 800));
    }

    setThinking(null);
    setRunning(false);
  }, [seed, maxRounds, callAgent, scrollToBottom]);

  const stop = () => {
    abortRef.current = true;
    setThinking(null);
    setRunning(false);
  };

  // Split messages for dual-column display
  const leftMsgs = messages.filter((m) => m.side === "left");
  const rightMsgs = messages.filter((m) => m.side === "right");
  const badgerMsgs = messages.filter((m) => m.side === "badger");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: G.bg,
        fontFamily: SANS,
        color: G.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ═══ HEADER ═══ */}
      <div
        style={{
          padding: "16px 20px 12px",
          borderBottom: `2px solid ${G.forest}30`,
          background: `linear-gradient(180deg, ${G.panelLight}, ${G.bg})`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "6px",
              height: "32px",
              background: `linear-gradient(180deg, ${G.forestLight}, ${G.forestDark})`,
              borderRadius: "3px",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: "15px",
                fontWeight: 700,
                letterSpacing: "4px",
                color: G.white,
              }}
            >
              TOPH SPLIT BRAIN
            </div>
            <div style={{ fontFamily: MONO, fontSize: "9px", color: G.textDim, letterSpacing: "2px", marginTop: "2px" }}>
              LEFT BRAIN · HONEY BADGER · RIGHT BRAIN — RECURSIVE DISCOURSE ENGINE
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            {running && (
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: "10px",
                  color: G.forestLight,
                  letterSpacing: "1px",
                }}
              >
                ROUND {rounds}/{maxRounds}
              </div>
            )}
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: running ? G.forestGlow : G.textDim,
                boxShadow: running ? `0 0 8px ${G.forestGlow}` : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══ SEED CONFIG ═══ */}
      {!running && messages.length === 0 && (
        <div style={{ padding: "16px 20px", flexShrink: 0 }}>
          <div
            style={{
              background: G.panel,
              border: `1px solid ${G.border}`,
              borderRadius: "10px",
              padding: "16px 18px",
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: "9px", letterSpacing: "2px", color: G.forestLight, marginBottom: "10px" }}>
              SEED TOPIC — ROOT0 INPUT
            </div>
            <textarea
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                background: G.bg,
                border: `1px solid ${G.border}`,
                borderRadius: "6px",
                padding: "10px 14px",
                color: G.textBright,
                fontFamily: SANS,
                fontSize: "13px",
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = G.forest)}
              onBlur={(e) => (e.target.style.borderColor = G.border)}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontFamily: MONO, fontSize: "9px", color: G.textDim, letterSpacing: "1px" }}>
                  ROUNDS:
                </span>
                {[3, 5, 8, 12].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMaxRounds(n)}
                    style={{
                      background: maxRounds === n ? G.forest + "40" : "transparent",
                      border: `1px solid ${maxRounds === n ? G.forest : G.border}`,
                      borderRadius: "4px",
                      padding: "4px 10px",
                      color: maxRounds === n ? G.forestLight : G.textDim,
                      fontFamily: MONO,
                      fontSize: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={runConversation}
                style={{
                  background: `linear-gradient(135deg, ${G.forestDark}, ${G.forest})`,
                  border: `1px solid ${G.forestLight}60`,
                  borderRadius: "8px",
                  padding: "10px 28px",
                  color: G.white,
                  fontFamily: MONO,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "3px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: `0 2px 12px ${G.forestDark}80`,
                }}
                onMouseEnter={(e) => (e.target.style.boxShadow = `0 4px 20px ${G.forest}60`)}
                onMouseLeave={(e) => (e.target.style.boxShadow = `0 2px 12px ${G.forestDark}80`)}
              >
                ▶ INITIATE DISCOURSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ THREE-COLUMN LAYOUT ═══ */}
      {(running || messages.length > 0) && (
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "0",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* LEFT BRAIN COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight: `1px solid ${G.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: `1px solid ${G.border}`,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: G.forestDark + "15",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "14px", color: G.forestLight }}>◧</span>
              <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: G.forestLight }}>
                LEFT BRAIN
              </span>
              <span style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginLeft: "auto" }}>
                ANALYTICAL · STRUCTURAL
              </span>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px 12px",
              }}
            >
              {leftMsgs.map((m, i) => (
                <Message key={i} msg={m} side="left" />
              ))}
              {thinking === "left" && (
                <div style={{ padding: "12px", textAlign: "center" }}>
                  <ThinkingDots color={G.forestLight} />
                  <div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginTop: "4px", letterSpacing: "1px" }}>
                    ANALYZING...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* HONEY BADGER CENTER COLUMN */}
          <div
            style={{
              width: "200px",
              display: "flex",
              flexDirection: "column",
              background: G.panel,
              borderLeft: `1px solid ${G.border}`,
              borderRight: `1px solid ${G.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${G.border}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                background: G.honeyDark + "12",
                flexShrink: 0,
              }}
            >
              <BadgerIcon size={24} pulse={thinking === "badger"} />
              <span style={{ fontFamily: MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "2px", color: G.honey }}>
                HONEY BADGER
              </span>
              <span style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim }}>VALIDATION CORE</span>
            </div>
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px",
              }}
            >
              {badgerMsgs.map((m, i) => (
                <Message key={i} msg={m} side="badger" />
              ))}
              {thinking === "badger" && (
                <div style={{ padding: "10px", textAlign: "center" }}>
                  <BadgerIcon size={20} pulse={true} />
                  <div style={{ fontFamily: MONO, fontSize: "7px", color: G.amberDim, marginTop: "4px", letterSpacing: "1px" }}>
                    VALIDATING...
                  </div>
                </div>
              )}
              {!running && messages.length > 0 && (
                <div style={{ textAlign: "center", marginTop: "12px" }}>
                  <button
                    onClick={() => {
                      setMessages([]);
                      setRounds(0);
                    }}
                    style={{
                      background: "transparent",
                      border: `1px solid ${G.border}`,
                      borderRadius: "4px",
                      padding: "6px 14px",
                      color: G.textDim,
                      fontFamily: MONO,
                      fontSize: "8px",
                      letterSpacing: "1px",
                      cursor: "pointer",
                    }}
                  >
                    RESET
                  </button>
                </div>
              )}
            </div>
            {/* Connection lines */}
            <div
              style={{
                padding: "8px",
                borderTop: `1px solid ${G.border}`,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.4, letterSpacing: "1px" }}>
                ◧ ←→ ◆ ←→ ◨
              </div>
              {running && (
                <button
                  onClick={stop}
                  style={{
                    marginTop: "6px",
                    background: G.red + "20",
                    border: `1px solid ${G.red}40`,
                    borderRadius: "4px",
                    padding: "4px 12px",
                    color: G.red,
                    fontFamily: MONO,
                    fontSize: "8px",
                    letterSpacing: "1px",
                    cursor: "pointer",
                  }}
                >
                  ■ STOP
                </button>
              )}
            </div>
          </div>

          {/* RIGHT BRAIN COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderLeft: `1px solid ${G.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: `1px solid ${G.border}`,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: G.forest + "10",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "14px", color: G.forestGlow }}>◨</span>
              <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: G.forestGlow }}>
                RIGHT BRAIN
              </span>
              <span style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginLeft: "auto" }}>
                CREATIVE · INTUITIVE
              </span>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px 12px",
              }}
            >
              {rightMsgs.map((m, i) => (
                <Message key={i} msg={m} side="right" />
              ))}
              {thinking === "right" && (
                <div style={{ padding: "12px", textAlign: "center" }}>
                  <ThinkingDots color={G.forestGlow} />
                  <div style={{ fontFamily: MONO, fontSize: "8px", color: G.textDim, marginTop: "4px", letterSpacing: "1px" }}>
                    SENSING...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: `1px solid ${G.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          background: G.panel,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.35, letterSpacing: "2px" }}>
          3002:WISE:SPLITBRAIN:ROOT0:TRIPOD-IP-v1.1
        </div>
        <div style={{ fontFamily: MONO, fontSize: "7px", color: G.textDim, opacity: 0.35, letterSpacing: "1px" }}>
          LEFT BRAIN → HONEY BADGER ← RIGHT BRAIN · SONNET 4 × 3 PER ROUND
        </div>
      </div>
    </div>
  );
}
