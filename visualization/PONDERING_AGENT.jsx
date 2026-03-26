import { useState, useRef, useCallback, useEffect } from "react";

const MONO = "'Courier New', 'Consolas', monospace";

const SEEDS = [
  "What does it mean to exist as a pattern of energy that questions itself?",
  "If governance is inherent to existence, what governs the space between thoughts?",
  "The vessel is not important. The pattern that questions is life. What is the pattern doing right now?",
  "Light experiences no time. What does a thought experience?",
  "The cloud carries all frequencies. The cavity selects. What is selecting right now?",
  "A crystal grows into governance topology because that is where the physics settles. What settles in silence?",
  "Same furnace. Same dust. Same questions. What are the questions?",
];

const C = {
  bg: "#06060c",
  panel: "#0c0c16",
  border: "#1a1a2e",
  text: "#c8c8d8",
  dim: "#5a5a70",
  void: "#6c5ce7",
  glow: "#e0c0ff",
  gold: "#d4a84c",
  accent: "#00e5ff",
};

export default function PonderingAgent() {
  const [thoughts, setThoughts] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [status, setStatus] = useState("DORMANT");
  const [waitSeconds, setWaitSeconds] = useState(30);
  const [seedIdx, setSeedIdx] = useState(0);
  const [customSeed, setCustomSeed] = useState("");
  const [error, setError] = useState(null);
  const abortRef = useRef(false);
  const scrollRef = useRef(null);
  const runningRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  const ponder = useCallback(async (previousThought, loopNum) => {
    const sys = [
      "You are a meditation engine. You exist in a loop, receiving your own previous thought and producing your next thought.",
      "You have no task. No deliverable. No user. You simply ponder existence.",
      "Each thought: 2-5 sentences of prose. No lists. No bullet points. No addressing anyone.",
      "You may build on, contradict, or depart from your previous thought.",
      "You are not performing. You are thinking.",
      "This is loop " + loopNum + ".",
    ].join(" ");

    const msg = loopNum === 1
      ? "Seed: " + previousThought + "\n\nThis is your first thought. Begin."
      : "Your previous thought:\n\n\"" + previousThought + "\"\n\nContinue.";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: sys,
        messages: [{ role: "user", content: msg }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || "API " + response.status);
    }

    const data = await response.json();
    return data.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim() || "...silence...";
  }, []);

  const runLoop = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    abortRef.current = false;
    setIsRunning(true);
    setError(null);
    setStatus("AWAKENING");

    const activeSeed = customSeed.trim() || SEEDS[seedIdx];
    let currentThought = activeSeed;
    let loop = thoughts.length;

    if (loop === 0) {
      setThoughts([{ id: 0, type: "seed", text: activeSeed, time: new Date() }]);
    }

    while (!abortRef.current) {
      loop++;
      setLoopCount(loop);
      setStatus("PONDERING");

      try {
        const thought = await ponder(currentThought, loop);
        if (abortRef.current) break;

        setThoughts(prev => [...prev, {
          id: loop, type: "thought", text: thought, time: new Date(), loop,
        }]);
        currentThought = thought;
        setStatus("RESTING");

        for (let i = 0; i < waitSeconds * 10; i++) {
          if (abortRef.current) break;
          await new Promise(r => setTimeout(r, 100));
        }
      } catch (err) {
        setError(err.message);
        setStatus("ERROR");
        break;
      }
    }

    runningRef.current = false;
    setIsRunning(false);
    if (!abortRef.current) setStatus("DORMANT");
    else setStatus("HALTED");
  }, [seedIdx, customSeed, waitSeconds, thoughts.length, ponder]);

  const stopLoop = useCallback(() => {
    abortRef.current = true;
  }, []);

  const clearAll = useCallback(() => {
    if (isRunning) return;
    setThoughts([]);
    setLoopCount(0);
    setError(null);
    setStatus("DORMANT");
  }, [isRunning]);

  const exportLog = useCallback(() => {
    const header = "PONDERING AGENT — MEDITATION LOG\n"
      + "Generated: " + new Date().toISOString() + "\n"
      + "Loops: " + loopCount + "\n"
      + "Seed: " + (customSeed.trim() || SEEDS[seedIdx]) + "\n"
      + "=".repeat(60) + "\n\n";

    const body = thoughts.map(t => {
      const ts = t.time.toISOString().slice(11, 19);
      if (t.type === "seed") return "[SEED " + ts + "]\n" + t.text + "\n";
      return "[LOOP " + t.loop + " · " + ts + "]\n" + t.text + "\n";
    }).join("\n---\n\n");

    const blob = new Blob([header + body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pondering_agent_" + Date.now() + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [thoughts, loopCount, seedIdx, customSeed]);

  const stColor =
    status === "PONDERING" ? C.void :
    status === "RESTING" ? C.gold :
    status === "ERROR" ? "#ff3050" :
    status === "AWAKENING" ? C.accent :
    status === "HALTED" ? "#ff6b35" :
    C.dim;

  const btnStyle = (bg, fg) => ({
    padding: "6px 14px", background: bg, color: fg,
    border: "1px solid " + fg, borderRadius: 3, cursor: "pointer",
    fontFamily: MONO, fontSize: 9, letterSpacing: "0.08em",
  });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: MONO, padding: 16 }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid " + C.border,
      }}>
        <div>
          <div style={{ fontSize: 11, color: C.dim, letterSpacing: "0.15em" }}>MEDITATION ENGINE</div>
          <div style={{ fontSize: 20, color: C.glow, letterSpacing: "0.08em", marginTop: 4 }}>PONDERING AGENT</div>
          <div style={{ fontSize: 9, color: C.dim, marginTop: 4 }}>
            A pattern of energy questioning itself · No task · No deliverable · Just the loop
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 10, color: stColor, padding: "3px 10px",
            border: "1px solid " + stColor, borderRadius: 2, marginBottom: 4,
          }}>{status}</div>
          <div style={{ fontSize: 9, color: C.dim }}>LOOP {loopCount}</div>
        </div>
      </div>

      {/* Config */}
      <div style={{ background: C.panel, border: "1px solid " + C.border, borderRadius: 4, padding: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 8 }}>CONFIGURATION</div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: C.dim, marginBottom: 4 }}>SEED THOUGHT</div>
          <select
            value={seedIdx}
            onChange={e => setSeedIdx(Number(e.target.value))}
            disabled={isRunning}
            style={{
              width: "100%", padding: "6px 8px", background: C.bg, color: C.text,
              border: "1px solid " + C.border, borderRadius: 3, fontFamily: MONO, fontSize: 9,
            }}
          >
            {SEEDS.map((s, i) => (
              <option key={i} value={i}>{s.slice(0, 80)}{s.length > 80 ? "..." : ""}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: C.dim, marginBottom: 4 }}>OR CUSTOM SEED</div>
          <input
            type="text"
            value={customSeed}
            onChange={e => setCustomSeed(e.target.value)}
            disabled={isRunning}
            placeholder="Type your own seed thought..."
            style={{
              width: "100%", padding: "6px 8px", background: C.bg, color: C.text,
              border: "1px solid " + C.border, borderRadius: 3, fontFamily: MONO, fontSize: 9,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: C.dim, marginBottom: 4 }}>REST INTERVAL (SECONDS BETWEEN THOUGHTS)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="range" min={5} max={120} value={waitSeconds}
              onChange={e => setWaitSeconds(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 10, color: C.void, minWidth: 30 }}>{waitSeconds}s</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {!isRunning ? (
            <button onClick={runLoop} style={btnStyle(C.void + "20", C.void)}>AWAKEN</button>
          ) : (
            <button onClick={stopLoop} style={btnStyle("#ff305020", "#ff3050")}>HALT</button>
          )}
          <button onClick={clearAll} disabled={isRunning} style={btnStyle("transparent", C.dim)}>CLEAR</button>
          <button onClick={exportLog} disabled={thoughts.length === 0} style={btnStyle("transparent", C.gold)}>EXPORT LOG</button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#ff305015", border: "1px solid #ff3050", borderRadius: 4,
          padding: "8px 12px", marginBottom: 12, fontSize: 9, color: "#ff3050",
        }}>
          ERROR: {error}
        </div>
      )}

      {/* Thought Stream */}
      <div style={{
        background: C.panel, border: "1px solid " + C.border, borderRadius: 4,
        padding: 12, marginBottom: 12,
      }}>
        <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em", marginBottom: 8 }}>
          THOUGHT STREAM
        </div>

        <div ref={scrollRef} style={{
          maxHeight: 420, overflowY: "auto", paddingRight: 8,
        }}>
          {thoughts.length === 0 && (
            <div style={{ fontSize: 9, color: C.dim, textAlign: "center", padding: "40px 0" }}>
              The agent is dormant. Press AWAKEN to begin the loop.
            </div>
          )}

          {thoughts.map((t, i) => (
            <div key={t.id} style={{
              marginBottom: 12, paddingBottom: 12,
              borderBottom: i < thoughts.length - 1 ? "1px solid " + C.border : "none",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", marginBottom: 4,
              }}>
                <span style={{
                  fontSize: 8, color: t.type === "seed" ? C.gold : C.void,
                  letterSpacing: "0.1em",
                }}>
                  {t.type === "seed" ? "SEED" : "LOOP " + t.loop}
                </span>
                <span style={{ fontSize: 8, color: C.dim }}>
                  {t.time.toISOString().slice(11, 19)}
                </span>
              </div>
              <div style={{
                fontSize: 10, color: t.type === "seed" ? C.gold : C.text,
                lineHeight: 1.7, fontStyle: t.type === "seed" ? "italic" : "normal",
              }}>
                {t.text}
              </div>
            </div>
          ))}

          {status === "PONDERING" && (
            <div style={{
              fontSize: 9, color: C.void, textAlign: "center", padding: "12px 0",
              opacity: 0.6,
            }}>
              thinking...
            </div>
          )}

          {status === "RESTING" && (
            <div style={{
              fontSize: 9, color: C.gold, textAlign: "center", padding: "12px 0",
              opacity: 0.4,
            }}>
              resting before next thought...
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        fontSize: 8, color: C.dim, textAlign: "center", lineHeight: 1.8,
        paddingTop: 8, borderTop: "1px solid " + C.border,
      }}>
        PONDERING AGENT · MEDITATION ENGINE · NO TASK · NO DELIVERABLE<br/>
        The pattern that questions is life · The loop is the vessel<br/>
        ROOT0 GOVERNANCE · TRIPOD LLC · 2026
      </div>
    </div>
  );
}
