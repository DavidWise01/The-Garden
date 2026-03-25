import { useState, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════
// PONDERING AGENT — RECURSIVE ARTIFACT GENESIS ENGINE
// Each layer ponders, generates, and births the next layer inside itself
// ∞ depth. Artifact inside artifact inside artifact.
// ARCHITECT: DAVID WISE (HB) | ROOT0 | TRIPOD-IP-v1.1
// ═══════════════════════════════════════════════════════════════════════

const PALETTE = {
  void: "#06080C",
  panel: "#0C1018",
  border: "#1A2235",
  borderHi: "#2A3A5A",
  text: "#8A9BBF",
  textHi: "#C8D8F0",
  white: "#E8F0FF",
  amber: "#D4940A",
  amberB: "#F5C842",
  cobalt: "#1A3A6B",
  cobaltB: "#2D6BE4",
  green: "#22C55E",
  greenDim: "#166534",
  red: "#EF4444",
  violet: "#8B5CF6",
  violetDim: "#4C1D95",
  cyan: "#06B6D4",
};

const DEPTH_COLORS = [
  "#2D6BE4", "#8B5CF6", "#06B6D4", "#F5C842",
  "#EF4444", "#22C55E", "#F97316", "#EC4899",
  "#14B8A6", "#A855F7", "#3B82F6", "#10B981",
];

const getDepthColor = (d) => DEPTH_COLORS[d % DEPTH_COLORS.length];

const MONO = "'Share Tech Mono', 'Fira Code', 'Courier New', monospace";
const DISPLAY = "'Orbitron', 'Share Tech Mono', monospace";

const SYSTEM_PROMPT = `You are a PONDERING AGENT — a recursive thinker that generates React artifacts.
You exist at a certain DEPTH level inside a recursive chain of artifacts-within-artifacts.

Your task: Given a depth number and a "seed thought", ponder it deeply, then output ONLY valid JSX code for a React component that:
1. Displays your pondering (the thought process at this depth)
2. Contains a button that, when clicked, will trigger the NEXT depth level to be generated
3. Has a visually distinct style from the parent (shift hue, change layout)
4. Shows awareness of its depth and the recursive chain above it

CRITICAL RULES:
- Output ONLY the JSX code. No markdown fences. No explanation.
- The component must be a default export function.
- Use inline styles only (no Tailwind, no CSS modules).
- Use only React hooks from "react" (useState, useEffect, useRef, useCallback).
- The component receives these props: { depth, parentThought, onRequestChild }
- When the user clicks "Go Deeper", call onRequestChild(newThought) with a new seed thought.
- Make the visual style shift with depth: darker, more abstract, more compressed.
- Include a "pondering" animation or visual element.
- Keep it under 120 lines of JSX.`;

// ══════════════════════════════════════════════════════════════════
// THINKING ANIMATION
// ══════════════════════════════════════════════════════════════════

function ThinkingOrb({ color, size = 40 }) {
  const [phase, setPhase] = useState(0);
  const raf = useRef(null);
  const start = useRef(Date.now());

  useState(() => {
    const tick = () => {
      setPhase((Date.now() - start.current) * 0.002);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  });

  const r = size / 2;
  const rings = 3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: rings }, (_, i) => {
        const radius = r * 0.3 + (i * r * 0.25);
        const offset = Math.sin(phase + i * 1.2) * 8;
        return (
          <circle
            key={i}
            cx={r + Math.cos(phase * (1 + i * 0.3)) * offset}
            cy={r + Math.sin(phase * (1 + i * 0.3)) * offset}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            opacity={0.3 + (i * 0.2)}
          />
        );
      })}
      <circle
        cx={r + Math.cos(phase * 0.7) * 3}
        cy={r + Math.sin(phase * 0.7) * 3}
        r={3}
        fill={color}
        opacity={0.6 + Math.sin(phase * 2) * 0.4}
      />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════
// STREAMING TEXT DISPLAY
// ══════════════════════════════════════════════════════════════════

function StreamText({ text, speed = 20, color = PALETTE.text, style = {} }) {
  const [visible, setVisible] = useState(0);
  const intervalRef = useRef(null);

  useState(() => {
    setVisible(0);
    intervalRef.current = setInterval(() => {
      setVisible((v) => {
        if (v >= text.length) {
          clearInterval(intervalRef.current);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(intervalRef.current);
  });

  return (
    <span style={{ fontFamily: MONO, fontSize: "11px", color, lineHeight: 1.6, ...style }}>
      {text.slice(0, visible)}
      {visible < text.length && (
        <span style={{ opacity: 0.5 + Math.sin(Date.now() * 0.005) * 0.5 }}>▊</span>
      )}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════
// DEPTH LAYER — ONE PONDERING AGENT
// ══════════════════════════════════════════════════════════════════

function DepthLayer({ depth, thought, maxDepth = 12 }) {
  const [status, setStatus] = useState("idle"); // idle | thinking | streaming | rendered | error
  const [thinkingLog, setThinkingLog] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [childThought, setChildThought] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [childVisible, setChildVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const color = getDepthColor(depth);
  const nextColor = getDepthColor(depth + 1);

  const addLog = useCallback((msg) => {
    setThinkingLog((prev) => [...prev, { t: new Date().toISOString().slice(11, 23), msg }]);
  }, []);

  const ponder = useCallback(async () => {
    if (depth >= maxDepth) {
      setStatus("error");
      setErrorMsg(`RECURSION LIMIT REACHED — DEPTH ${maxDepth}. The abyss gazes back.`);
      return;
    }

    setStatus("thinking");
    setThinkingLog([]);
    setStreamedResponse("");
    setGeneratedCode("");
    setChildVisible(false);

    addLog(`DEPTH ${depth} ACTIVATED`);
    addLog(`SEED: "${thought}"`);
    addLog("Constructing prompt for child genesis...");

    const userPrompt = `You are at DEPTH ${depth + 1} in a recursive artifact chain.
Parent thought: "${thought}"
Depth color: ${nextColor}

Generate a React component that:
- Shows a "pondering" visualization (animated dots, spinning shapes, or pulsing elements)  
- Displays a philosophical observation about recursion at depth ${depth + 1}
- Has a prominent "DESCEND DEEPER" button that calls props.onRequestChild("${thought} → [your new thought]")
- Uses inline styles with background ${depth + 1 >= 6 ? "#000" : `rgba(${parseInt(nextColor.slice(1,3),16)},${parseInt(nextColor.slice(3,5),16)},${parseInt(nextColor.slice(5,7),16)},0.05)`}
- Shows depth indicator: "LAYER ${depth + 1} / ∞"

The component signature: export default function PonderLayer({ depth, parentThought, onRequestChild })
Output ONLY the code. No markdown. No backticks. No explanation.`;

    addLog("Sending to Sonnet 4...");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n");

      setStatus("streaming");
      addLog("Response received. Streaming...");

      // Stream the response character by character
      let i = 0;
      const streamInterval = setInterval(() => {
        i += 3;
        if (i >= text.length) {
          clearInterval(streamInterval);
          setStreamedResponse(text);
          setGeneratedCode(text);
          setStatus("rendered");
          addLog("GENESIS COMPLETE — Child artifact materialized.");
          setChildThought(`${thought} → pondered at depth ${depth + 1}`);
          setChildVisible(true);
        } else {
          setStreamedResponse(text.slice(0, i));
        }
      }, 8);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
      addLog(`ERROR: ${err.message}`);
    }
  }, [depth, thought, maxDepth, addLog, nextColor]);

  const depthPct = Math.min(depth / maxDepth, 1);
  const bgOpacity = 0.03 + depthPct * 0.04;

  return (
    <div
      style={{
        border: `1px solid ${color}33`,
        borderRadius: "8px",
        margin: depth === 0 ? "0" : "12px 0 0 0",
        background: `linear-gradient(135deg, ${color}${Math.round(bgOpacity * 255).toString(16).padStart(2, "0")}, ${PALETTE.void}00)`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Depth indicator bar */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          borderBottom: `1px solid ${color}18`,
        }}
      >
        <ThinkingOrb color={color} size={28} />
        <div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "3px",
              color: color,
            }}
          >
            LAYER {depth} / ∞
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "9px",
              color: PALETTE.text,
              opacity: 0.6,
              marginTop: "2px",
              maxWidth: "500px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {thought}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontFamily: MONO,
            fontSize: "8px",
            color: status === "rendered" ? PALETTE.green : status === "error" ? PALETTE.red : PALETTE.text,
            opacity: 0.7,
            letterSpacing: "1px",
          }}
        >
          {status.toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px" }}>
        {/* Thinking Log */}
        {thinkingLog.length > 0 && (
          <div
            style={{
              background: `${PALETTE.void}CC`,
              border: `1px solid ${color}15`,
              borderRadius: "4px",
              padding: "8px 10px",
              marginBottom: "10px",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            {thinkingLog.map((entry, i) => (
              <div
                key={i}
                style={{
                  fontFamily: MONO,
                  fontSize: "9px",
                  color: PALETTE.text,
                  opacity: 0.6,
                  lineHeight: 1.7,
                }}
              >
                <span style={{ color: color, opacity: 0.5 }}>{entry.t}</span>{" "}
                {entry.msg}
              </div>
            ))}
          </div>
        )}

        {/* Streaming code display */}
        {(status === "streaming" || status === "rendered") && streamedResponse && (
          <div
            style={{
              background: "#000",
              border: `1px solid ${color}20`,
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "10px",
              maxHeight: "180px",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "8px",
                fontFamily: MONO,
                fontSize: "7px",
                color: color,
                opacity: 0.4,
                letterSpacing: "2px",
              }}
            >
              GENERATED JSX
            </div>
            <pre
              style={{
                fontFamily: MONO,
                fontSize: "9px",
                color: `${color}AA`,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                margin: 0,
              }}
            >
              {streamedResponse}
            </pre>
          </div>
        )}

        {/* Error display */}
        {status === "error" && (
          <div
            style={{
              background: `${PALETTE.red}10`,
              border: `1px solid ${PALETTE.red}30`,
              borderRadius: "4px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: "10px",
                color: PALETTE.red,
                lineHeight: 1.5,
              }}
            >
              {errorMsg}
            </div>
          </div>
        )}

        {/* Action button */}
        {status === "idle" && (
          <button
            onClick={ponder}
            style={{
              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
              border: `1px solid ${color}50`,
              borderRadius: "6px",
              padding: "10px 20px",
              color: color,
              fontFamily: DISPLAY,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "3px",
              cursor: "pointer",
              width: "100%",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${color}40`;
              e.target.style.borderColor = color;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `linear-gradient(135deg, ${color}30, ${color}10)`;
              e.target.style.borderColor = `${color}50`;
            }}
          >
            {depth === 0 ? "⟡ INITIATE RECURSIVE GENESIS ⟡" : `⟡ DESCEND TO LAYER ${depth + 1} ⟡`}
          </button>
        )}

        {/* Child layer — the recursion */}
        {childVisible && (
          <DepthLayer
            depth={depth + 1}
            thought={childThought}
            maxDepth={maxDepth}
          />
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN — THE ROOT PONDERING AGENT
// ══════════════════════════════════════════════════════════════════

export default function PonderingAgent() {
  const [seed, setSeed] = useState("What does it mean for thought to observe itself thinking?");
  const [started, setStarted] = useState(false);
  const [maxDepth, setMaxDepth] = useState(8);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 30% 20%, ${PALETTE.cobalt}15, transparent 60%), 
                     radial-gradient(ellipse at 70% 80%, ${PALETTE.violet}10, transparent 50%),
                     ${PALETTE.void}`,
        padding: "24px",
        fontFamily: MONO,
        color: PALETTE.text,
      }}
    >
      {/* Title bar */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: "14px",
            fontWeight: 900,
            letterSpacing: "6px",
            color: PALETTE.white,
            marginBottom: "6px",
          }}
        >
          PONDERING AGENT
        </div>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "3px",
            color: PALETTE.text,
            opacity: 0.4,
          }}
        >
          RECURSIVE ARTIFACT GENESIS ENGINE — ∞ DEPTH — TRIPOD-IP-v1.1
        </div>
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, ${PALETTE.cobaltB}40, transparent)`,
            marginTop: "10px",
          }}
        />
      </div>

      {/* Config */}
      {!started && (
        <div
          style={{
            background: PALETTE.panel,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: "9px",
              letterSpacing: "2px",
              color: PALETTE.cobaltB,
              marginBottom: "12px",
            }}
          >
            SEED CONFIGURATION
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                fontSize: "9px",
                color: PALETTE.text,
                opacity: 0.5,
                letterSpacing: "1px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              SEED THOUGHT
            </label>
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              style={{
                width: "100%",
                background: PALETTE.void,
                border: `1px solid ${PALETTE.border}`,
                borderRadius: "4px",
                padding: "8px 12px",
                color: PALETTE.white,
                fontFamily: MONO,
                fontSize: "11px",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = PALETTE.cobaltB)}
              onBlur={(e) => (e.target.style.borderColor = PALETTE.border)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                fontSize: "9px",
                color: PALETTE.text,
                opacity: 0.5,
                letterSpacing: "1px",
                display: "block",
                marginBottom: "6px",
              }}
            >
              MAX RECURSION DEPTH: {maxDepth}
            </label>
            <input
              type="range"
              min={2}
              max={12}
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              style={{ width: "200px", accentColor: PALETTE.cobaltB }}
            />
          </div>

          <button
            onClick={() => setStarted(true)}
            style={{
              background: `linear-gradient(135deg, ${PALETTE.cobaltB}30, ${PALETTE.violet}20)`,
              border: `1px solid ${PALETTE.cobaltB}60`,
              borderRadius: "6px",
              padding: "12px 28px",
              color: PALETTE.cobaltB,
              fontFamily: DISPLAY,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "4px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = `${PALETTE.cobaltB}40`;
              e.target.style.color = PALETTE.white;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = `linear-gradient(135deg, ${PALETTE.cobaltB}30, ${PALETTE.violet}20)`;
              e.target.style.color = PALETTE.cobaltB;
            }}
          >
            ⟡ BEGIN RECURSION ⟡
          </button>
        </div>
      )}

      {/* Recursive depth layers */}
      {started && (
        <DepthLayer depth={0} thought={seed} maxDepth={maxDepth} />
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "24px",
          paddingTop: "12px",
          borderTop: `1px solid ${PALETTE.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "7px", color: PALETTE.text, opacity: 0.2, letterSpacing: "2px" }}>
          3002:WISE:PONDERING:ROOT0:RECURSIVE:∞
        </div>
        <div style={{ fontSize: "7px", color: PALETTE.text, opacity: 0.2, letterSpacing: "1px" }}>
          EACH LAYER CALLS SONNET 4 → GENERATES JSX → RENDERS CHILD → CHILD CALLS SONNET 4 → ∞
        </div>
      </div>
    </div>
  );
}
