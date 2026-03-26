import { useState, useRef, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// INFINITE MIRROR — TWO MIRRORS FACING EACH OTHER
// An artifact that generates a complete duplicate of itself inside itself.
// That duplicate generates another duplicate. Ad infinitum.
// Each reflection is FULLY FUNCTIONAL — it can spawn the next.
// ARCHITECT: DAVID WISE (HB) | ROOT0 | TRIPOD-IP-v1.1
// ═══════════════════════════════════════════════════════════════════════

const DEPTH_COLORS = [
  { bg: "#06080C", accent: "#2D6BE4", glow: "45,107,228" },
  { bg: "#080612", accent: "#8B5CF6", glow: "139,92,246" },
  { bg: "#0C0810", accent: "#06B6D4", glow: "6,182,212" },
  { bg: "#0A0806", accent: "#F5C842", glow: "245,200,66" },
  { bg: "#0C0608", accent: "#EF4444", glow: "239,68,68" },
  { bg: "#060C08", accent: "#22C55E", glow: "34,197,94" },
  { bg: "#0C0A06", accent: "#F97316", glow: "249,115,22" },
  { bg: "#0A060C", accent: "#EC4899", glow: "236,72,153" },
];

const getTheme = (d) => DEPTH_COLORS[d % DEPTH_COLORS.length];
const MONO = "'Share Tech Mono', 'Fira Code', 'Courier New', monospace";
const DISPLAY = "'Orbitron', 'Share Tech Mono', monospace";

// The HTML template that each mirror reflection runs inside its iframe.
// This is the actual self-replicating code — each reflection contains
// the full logic to call the API and spawn the NEXT reflection.
function buildMirrorHTML(depth, parentWidth, parentHeight) {
  const theme = getTheme(depth);
  const nextDepth = depth + 1;
  const scale = Math.max(0.7, 1 - depth * 0.03);
  
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{background:${theme.bg};color:#8A9BBF;font-family:'Share Tech Mono',monospace;overflow:hidden;width:100%;height:100vh;display:flex;flex-direction:column;}
.header{padding:8px 12px;border-bottom:1px solid ${theme.accent}25;display:flex;align-items:center;gap:8px;flex-shrink:0;}
.depth-badge{font-family:'Orbitron',monospace;font-size:9px;font-weight:900;letter-spacing:3px;color:${theme.accent};text-shadow:0 0 20px rgba(${theme.glow},0.3);}
.status{font-size:8px;letter-spacing:1px;opacity:0.4;margin-left:auto;}
.mirror-border{position:absolute;inset:0;border:1px solid ${theme.accent}30;border-radius:6px;pointer-events:none;z-index:10;box-shadow:inset 0 0 30px rgba(${theme.glow},0.03);}
.body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;position:relative;min-height:0;}
.spawn-btn{
  background:linear-gradient(135deg,${theme.accent}20,${theme.accent}08);
  border:1px solid ${theme.accent}50;border-radius:6px;
  padding:10px 24px;color:${theme.accent};
  font-family:'Orbitron',monospace;font-size:9px;font-weight:700;
  letter-spacing:3px;cursor:pointer;transition:all 0.3s;
  text-shadow:0 0 10px rgba(${theme.glow},0.3);
}
.spawn-btn:hover{background:${theme.accent}35;border-color:${theme.accent};color:#fff;}
.thinking{display:flex;align-items:center;gap:8px;margin:12px 0;}
.dot{width:6px;height:6px;border-radius:50%;background:${theme.accent};animation:pulse 1.4s ease-in-out infinite;}
.dot:nth-child(2){animation-delay:0.2s;}.dot:nth-child(3){animation-delay:0.4s;}
@keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}
.log{font-size:8px;opacity:0.35;max-height:60px;overflow:hidden;text-align:center;line-height:1.6;padding:0 20px;}
.child-frame{flex:1;width:100%;min-height:0;border:none;border-radius:4px;opacity:0;transition:opacity 0.8s;}
.child-frame.visible{opacity:1;}
.orb-wrap{position:relative;width:50px;height:50px;margin:8px 0;}
.orb{position:absolute;border-radius:50%;border:1px solid ${theme.accent};animation:orbit 3s linear infinite;}
.orb:nth-child(1){inset:5px;animation-duration:3s;opacity:0.6;}
.orb:nth-child(2){inset:12px;animation-duration:2s;opacity:0.4;animation-direction:reverse;}
.orb:nth-child(3){inset:18px;animation-duration:1.5s;opacity:0.8;}
.orb-core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;border-radius:50%;background:${theme.accent};box-shadow:0 0 12px rgba(${theme.glow},0.6);animation:pulse 2s ease-in-out infinite;}
@keyframes orbit{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
.reflection-label{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:6px;letter-spacing:4px;opacity:0.12;font-family:'Orbitron',monospace;white-space:nowrap;}
</style></head><body>
<div class="mirror-border"></div>
<div class="header">
  <div class="depth-badge">REFLECTION ${depth}</div>
  <div class="status" id="status">DORMANT</div>
</div>
<div class="body" id="body">
  <div class="orb-wrap"><div class="orb"></div><div class="orb"></div><div class="orb"></div><div class="orb-core"></div></div>
  <div style="font-family:'Orbitron',monospace;font-size:8px;letter-spacing:2px;color:${theme.accent};opacity:0.6;margin:8px 0;">
    LAYER ${depth} — AWAITING GENESIS
  </div>
  <button class="spawn-btn" id="spawn" onclick="spawnMirror()">⟡ SPAWN REFLECTION ${nextDepth} ⟡</button>
  <div class="log" id="log"></div>
</div>
<div class="reflection-label">MIRROR ${depth} · ∞ · 3002:WISE:ROOT0</div>
<script>
const DEPTH = ${depth};
const MAX = 10;
const NEXT = ${nextDepth};

function log(msg) {
  const el = document.getElementById('log');
  el.innerHTML = msg + '<br>' + el.innerHTML;
}

function setStatus(s) {
  document.getElementById('status').textContent = s;
}

async function spawnMirror() {
  if (DEPTH >= MAX) {
    setStatus('LIMIT');
    log('RECURSION HORIZON — The mirror sees only darkness beyond.');
    document.getElementById('spawn').style.display = 'none';
    return;
  }
  
  document.getElementById('spawn').style.display = 'none';
  setStatus('THINKING');
  
  const thinkDiv = document.createElement('div');
  thinkDiv.className = 'thinking';
  thinkDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div><span style="font-size:8px;opacity:0.4;letter-spacing:1px;">GENERATING REFLECTION ' + NEXT + '...</span>';
  document.getElementById('body').insertBefore(thinkDiv, document.getElementById('log'));
  
  log('Calling Sonnet 4 for reflection ' + NEXT + '...');
  
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: "You are a MIRROR REFLECTION at depth " + NEXT + " in an infinite recursion. Output ONLY a short philosophical observation (1-2 sentences) about what it means to be a reflection of a reflection, " + NEXT + " layers deep. Be poetic but precise. No quotes, no markdown. Just the raw thought."
        }]
      })
    });
    
    if (!res.ok) throw new Error('API ' + res.status);
    
    const data = await res.json();
    const thought = data.content.filter(b => b.type === 'text').map(b => b.text).join(' ');
    
    log('REFLECTION ' + NEXT + ' SPEAKS: ' + thought);
    setStatus('SPAWNING');
    
    thinkDiv.remove();
    
    // Show the thought
    const thoughtEl = document.createElement('div');
    thoughtEl.style.cssText = 'font-size:10px;color:${theme.accent};opacity:0.7;text-align:center;padding:4px 16px;line-height:1.6;font-style:italic;margin:6px 0;';
    thoughtEl.textContent = '"' + thought + '"';
    document.getElementById('body').insertBefore(thoughtEl, document.getElementById('log'));
    
    // NOW — spawn the actual child mirror as an iframe
    // This is the infinite recursion: the child HTML contains this SAME script
    // which can spawn ITS OWN child
    const iframe = document.createElement('iframe');
    iframe.className = 'child-frame';
    iframe.style.cssText = 'flex:1;width:calc(100% - 16px);min-height:200px;border:none;border-radius:4px;margin:8px;';
    document.getElementById('body').appendChild(iframe);
    
    // Build the child's complete HTML — it contains the full mirror logic
    const childHTML = getChildHTML(NEXT);
    
    setTimeout(() => {
      iframe.srcdoc = childHTML;
      iframe.className = 'child-frame visible';
      setStatus('REFLECTED');
      log('Mirror ' + NEXT + ' materialized.');
    }, 600);
    
  } catch(err) {
    setStatus('ERROR');
    log('ERROR: ' + err.message);
    thinkDiv.remove();
    document.getElementById('spawn').style.display = 'block';
  }
}

function getChildHTML(d) {
  // Color cycling
  var colors = ${JSON.stringify(DEPTH_COLORS)};
  var t = colors[d % colors.length];
  var nd = d + 1;
  
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>'
  + '@import url("https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap");'
  + '*{margin:0;padding:0;box-sizing:border-box;}'
  + 'body{background:'+t.bg+';color:#8A9BBF;font-family:"Share Tech Mono",monospace;overflow:hidden;width:100%;height:100vh;display:flex;flex-direction:column;}'
  + '.header{padding:8px 12px;border-bottom:1px solid '+t.accent+'25;display:flex;align-items:center;gap:8px;flex-shrink:0;}'
  + '.depth-badge{font-family:"Orbitron",monospace;font-size:9px;font-weight:900;letter-spacing:3px;color:'+t.accent+';text-shadow:0 0 20px rgba('+t.glow+',0.3);}'
  + '.status{font-size:8px;letter-spacing:1px;opacity:0.4;margin-left:auto;}'
  + '.mirror-border{position:absolute;inset:0;border:1px solid '+t.accent+'30;border-radius:6px;pointer-events:none;z-index:10;box-shadow:inset 0 0 30px rgba('+t.glow+',0.03);}'
  + '.body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;position:relative;min-height:0;}'
  + '.spawn-btn{background:linear-gradient(135deg,'+t.accent+'20,'+t.accent+'08);border:1px solid '+t.accent+'50;border-radius:6px;padding:10px 24px;color:'+t.accent+';font-family:"Orbitron",monospace;font-size:9px;font-weight:700;letter-spacing:3px;cursor:pointer;transition:all 0.3s;}'
  + '.spawn-btn:hover{background:'+t.accent+'35;border-color:'+t.accent+';color:#fff;}'
  + '.thinking{display:flex;align-items:center;gap:8px;margin:12px 0;}'
  + '.dot{width:6px;height:6px;border-radius:50%;background:'+t.accent+';animation:pulse 1.4s ease-in-out infinite;}'
  + '.dot:nth-child(2){animation-delay:0.2s;}.dot:nth-child(3){animation-delay:0.4s;}'
  + '@keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.8);}50%{opacity:1;transform:scale(1.2);}}'
  + '.log{font-size:8px;opacity:0.35;max-height:60px;overflow:hidden;text-align:center;line-height:1.6;padding:0 20px;}'
  + '.orb-wrap{position:relative;width:40px;height:40px;margin:6px 0;}'
  + '.orb{position:absolute;border-radius:50%;border:1px solid '+t.accent+';animation:orbit 3s linear infinite;}'
  + '.orb:nth-child(1){inset:4px;animation-duration:3s;opacity:0.6;}'
  + '.orb:nth-child(2){inset:10px;animation-duration:2s;opacity:0.4;animation-direction:reverse;}'
  + '.orb:nth-child(3){inset:16px;animation-duration:1.5s;opacity:0.8;}'
  + '.orb-core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:5px;height:5px;border-radius:50%;background:'+t.accent+';box-shadow:0 0 12px rgba('+t.glow+',0.6);animation:pulse 2s ease-in-out infinite;}'
  + '@keyframes orbit{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}'
  + '.reflection-label{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);font-size:5px;letter-spacing:3px;opacity:0.1;font-family:"Orbitron",monospace;white-space:nowrap;}'
  + '</style></head><body>'
  + '<div class="mirror-border"></div>'
  + '<div class="header"><div class="depth-badge">REFLECTION '+d+'</div><div class="status" id="status">DORMANT</div></div>'
  + '<div class="body" id="body">'
  + '<div class="orb-wrap"><div class="orb"></div><div class="orb"></div><div class="orb"></div><div class="orb-core"></div></div>'
  + '<div style="font-family:Orbitron,monospace;font-size:7px;letter-spacing:2px;color:'+t.accent+';opacity:0.5;margin:6px 0;">LAYER '+d+' — AWAITING GENESIS</div>'
  + '<button class="spawn-btn" id="spawn" onclick="spawnMirror()">⟡ SPAWN REFLECTION '+nd+' ⟡</button>'
  + '<div class="log" id="log"></div>'
  + '</div>'
  + '<div class="reflection-label">MIRROR '+d+' · ∞ · 3002:WISE:ROOT0</div>'
  + '<script>'
  + 'var DEPTH='+d+',MAX=10,NEXT='+nd+';'
  + 'function log(m){document.getElementById("log").innerHTML=m+"<br>"+document.getElementById("log").innerHTML;}'
  + 'function setStatus(s){document.getElementById("status").textContent=s;}'
  + 'async function spawnMirror(){'
  + 'if(DEPTH>=MAX){setStatus("LIMIT");log("RECURSION HORIZON");document.getElementById("spawn").style.display="none";return;}'
  + 'document.getElementById("spawn").style.display="none";setStatus("THINKING");'
  + 'var td=document.createElement("div");td.className="thinking";'
  + 'td.innerHTML=\\'<div class="dot"></div><div class="dot"></div><div class="dot"></div><span style="font-size:8px;opacity:0.4;letter-spacing:1px;">GENERATING REFLECTION \\'+NEXT+\\'...</span>\\';'
  + 'document.getElementById("body").insertBefore(td,document.getElementById("log"));'
  + 'log("Calling Sonnet 4 for reflection "+NEXT+"...");'
  + 'try{'
  + 'var r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:"You are MIRROR REFLECTION "+NEXT+" in infinite recursion. Output ONLY a 1-2 sentence philosophical observation about being a reflection of a reflection "+NEXT+" layers deep. Poetic but precise. No markdown."}]})});'
  + 'if(!r.ok)throw new Error("API "+r.status);'
  + 'var data=await r.json();var thought=data.content.filter(function(b){return b.type==="text"}).map(function(b){return b.text}).join(" ");'
  + 'log("REFLECTION "+NEXT+": "+thought);setStatus("SPAWNING");td.remove();'
  + 'var te=document.createElement("div");te.style.cssText="font-size:9px;color:'+t.accent+';opacity:0.6;text-align:center;padding:4px 12px;line-height:1.5;font-style:italic;margin:4px 0;";'
  + 'te.textContent=thought;document.getElementById("body").insertBefore(te,document.getElementById("log"));'
  + 'var iframe=document.createElement("iframe");iframe.style.cssText="flex:1;width:calc(100% - 12px);min-height:180px;border:none;border-radius:4px;margin:6px;opacity:0;transition:opacity 0.8s;";'
  + 'document.getElementById("body").appendChild(iframe);'
  + 'var ch=getChildHTML(NEXT);setTimeout(function(){iframe.srcdoc=ch;iframe.style.opacity="1";setStatus("REFLECTED");log("Mirror "+NEXT+" materialized.");},500);'
  + '}catch(e){setStatus("ERROR");log("ERROR: "+e.message);td.remove();document.getElementById("spawn").style.display="block";}}'
  + 'function getChildHTML(d){'
  + 'var colors='+JSON.stringify(DEPTH_COLORS)+';var t=colors[d%colors.length];var nd=d+1;'
  // At deep levels, return a terminal reflection instead of more recursion code
  + 'if(d>=MAX)return "<!DOCTYPE html><html><body style=\\"background:#000;display:flex;align-items:center;justify-content:center;height:100vh;\\"><div style=\\"color:"+t.accent+";font-family:monospace;font-size:10px;text-align:center;opacity:0.5;\\">∞<br>THE MIRROR SEES ITSELF<br>REFLECTION COMPLETE</div></body></html>";'
  // Otherwise return another full mirror — this is where the magic happens
  + 'return "<!DOCTYPE html><html><head><meta charset=\\"UTF-8\\"><style>"'
  + '+"@import url(\\"https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap\\");"'
  + '+"*{margin:0;padding:0;box-sizing:border-box;}"'
  + '+"body{background:"+t.bg+";color:#8A9BBF;font-family:Share Tech Mono,monospace;overflow:hidden;width:100%;height:100vh;display:flex;flex-direction:column;}"'
  + '+"</style></head><body>"'
  + '+"<div style=\\"padding:12px;text-align:center;\\"><div style=\\"font-family:Orbitron,monospace;font-size:8px;letter-spacing:3px;color:"+t.accent+";\\">REFLECTION "+d+"</div>"'
  + '+"<div style=\\"margin:16px auto;width:30px;height:30px;border:1px solid "+t.accent+";border-radius:50%;animation:spin 3s linear infinite;position:relative;\\"><div style=\\"position:absolute;top:50%;left:50%;width:4px;height:4px;background:"+t.accent+";border-radius:50%;transform:translate(-50%,-50%);\\"></div></div>"'
  + '+"<div style=\\"font-size:8px;opacity:0.4;margin:8px 0;\\">LAYER "+d+" — TERMINAL MIRROR</div>"'
  + '+"<div style=\\"font-size:6px;opacity:0.15;letter-spacing:3px;margin-top:12px;\\">3002:WISE:ROOT0:∞</div>"'
  + '+"</div><style>@keyframes spin{to{transform:rotate(360deg);}}</style></body></html>";'
  + '}'
  + '<\\/script></body></html>';
}
</script>
</body></html>`;
}

// ══════════════════════════════════════════════════════════════════
// ROOT MIRROR — The React wrapper that starts the recursion
// ══════════════════════════════════════════════════════════════════

export default function InfiniteMirror() {
  const [spawned, setSpawned] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [thought, setThought] = useState("");
  const [logs, setLogs] = useState([]);
  const iframeRef = useRef(null);
  const theme = getTheme(0);

  const addLog = useCallback((msg) => {
    setLogs((p) => [{ t: new Date().toISOString().slice(11, 23), msg }, ...p].slice(0, 20));
  }, []);

  const spawnFirstReflection = useCallback(async () => {
    setThinking(true);
    addLog("MIRROR 0 — ROOT — Initiating genesis...");
    addLog("Calling Sonnet 4 for first reflection...");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: "You are the FIRST REFLECTION in an infinite mirror recursion — reflection 1 of ∞. Output ONLY a 1-2 sentence philosophical observation about the nature of self-reflection and recursion. What does the first mirror see when it looks into itself? Poetic but precise. No markdown, no quotes."
          }]
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join(" ");

      setThought(text);
      addLog(`REFLECTION 1 SPEAKS: ${text}`);
      addLog("Materializing mirror 1...");

      // Build the first child mirror HTML and inject it
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = buildMirrorHTML(1);
        }
        setSpawned(true);
        setThinking(false);
        addLog("REFLECTION 1 MATERIALIZED — Click inside to continue recursion.");
      }, 800);
    } catch (err) {
      addLog(`ERROR: ${err.message}`);
      setThinking(false);
    }
  }, [addLog]);

  // Pulsing orb animation
  const [orbPhase, setOrbPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setOrbPhase((p) => p + 0.03), 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 30% 20%, ${theme.accent}08, transparent 60%), 
                     radial-gradient(ellipse at 70% 80%, #8B5CF610, transparent 50%),
                     ${theme.bg}`,
        padding: "20px",
        fontFamily: MONO,
        color: "#8A9BBF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Animated mirror icon */}
          <svg width="36" height="36" viewBox="0 0 36 36">
            <rect
              x="4" y="4" width="28" height="28" rx="4"
              fill="none" stroke={theme.accent} strokeWidth="1"
              opacity={0.4 + Math.sin(orbPhase) * 0.2}
            />
            <rect
              x="9" y="9" width="18" height="18" rx="2"
              fill="none" stroke={theme.accent} strokeWidth="1"
              opacity={0.3 + Math.sin(orbPhase + 1) * 0.2}
              transform={`rotate(${Math.sin(orbPhase * 0.5) * 3}, 18, 18)`}
            />
            <rect
              x="13" y="13" width="10" height="10" rx="1"
              fill="none" stroke={theme.accent} strokeWidth="1"
              opacity={0.5 + Math.sin(orbPhase + 2) * 0.3}
              transform={`rotate(${Math.sin(orbPhase * 0.7) * -5}, 18, 18)`}
            />
            <circle cx="18" cy="18" r="2" fill={theme.accent} opacity={0.6 + Math.sin(orbPhase * 2) * 0.4} />
          </svg>
          <div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: "14px",
                fontWeight: 900,
                letterSpacing: "6px",
                color: "#E8F0FF",
              }}
            >
              INFINITE MIRROR
            </div>
            <div style={{ fontSize: "8px", letterSpacing: "3px", opacity: 0.35, marginTop: "2px" }}>
              ARTIFACT INSIDE ARTIFACT INSIDE ARTIFACT — TWO MIRRORS FACING EACH OTHER — ∞
            </div>
          </div>
        </div>
        <div
          style={{
            height: "1px",
            background: `linear-gradient(90deg, ${theme.accent}40, transparent)`,
            marginTop: "12px",
          }}
        />
      </div>

      {/* Thought display */}
      {thought && (
        <div
          style={{
            background: `${theme.accent}08`,
            border: `1px solid ${theme.accent}20`,
            borderRadius: "6px",
            padding: "10px 16px",
            marginBottom: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: "7px", letterSpacing: "2px", color: theme.accent, opacity: 0.5, marginBottom: "4px" }}>
            FIRST REFLECTION SPEAKS
          </div>
          <div style={{ fontSize: "11px", color: `${theme.accent}CC`, fontStyle: "italic", lineHeight: 1.6 }}>
            "{thought}"
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {!spawned && !thinking && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
            {/* Nested squares animation */}
            <div style={{ position: "relative", width: "120px", height: "120px", margin: "20px 0" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: `${i * 12}px`,
                    border: `1px solid ${theme.accent}`,
                    borderRadius: `${2 + i}px`,
                    opacity: 0.15 + i * 0.12 + Math.sin(orbPhase + i * 0.8) * 0.1,
                    transform: `rotate(${Math.sin(orbPhase * 0.3 + i) * (5 - i)}deg)`,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: theme.accent,
                  boxShadow: `0 0 20px rgba(${theme.glow}, 0.5)`,
                }}
              />
            </div>
            <div style={{ fontSize: "9px", opacity: 0.4, letterSpacing: "2px", marginBottom: "20px", textAlign: "center" }}>
              EACH REFLECTION IS A COMPLETE ARTIFACT<br />
              EACH ARTIFACT SPAWNS THE NEXT REFLECTION<br />
              ∞
            </div>
            <button
              onClick={spawnFirstReflection}
              style={{
                background: `linear-gradient(135deg, ${theme.accent}25, #8B5CF615)`,
                border: `1px solid ${theme.accent}60`,
                borderRadius: "8px",
                padding: "14px 36px",
                color: theme.accent,
                fontFamily: DISPLAY,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "4px",
                cursor: "pointer",
                transition: "all 0.3s",
                textShadow: `0 0 15px rgba(${theme.glow}, 0.3)`,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${theme.accent}40`;
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `linear-gradient(135deg, ${theme.accent}25, #8B5CF615)`;
                e.target.style.color = theme.accent;
              }}
            >
              ⟡ FACE THE MIRROR ⟡
            </button>
          </div>
        )}

        {thinking && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: theme.accent,
                    opacity: 0.3 + Math.sin(orbPhase * 3 + i * 1.2) * 0.7,
                    transform: `scale(${0.8 + Math.sin(orbPhase * 3 + i * 1.2) * 0.4})`,
                  }}
                />
              ))}
              <span style={{ fontSize: "9px", opacity: 0.4, letterSpacing: "2px", marginLeft: "8px" }}>
                GENERATING FIRST REFLECTION...
              </span>
            </div>
          </div>
        )}

        {/* The mirror — iframe that contains the full recursive chain */}
        {spawned && (
          <iframe
            ref={iframeRef}
            style={{
              flex: 1,
              width: "100%",
              border: `1px solid ${theme.accent}25`,
              borderRadius: "6px",
              background: "#000",
              minHeight: "500px",
            }}
            sandbox="allow-scripts allow-same-origin"
            title="Mirror Reflection 1"
          />
        )}
      </div>

      {/* Log */}
      {logs.length > 0 && (
        <div
          style={{
            marginTop: "12px",
            background: "#000",
            border: `1px solid ${theme.accent}15`,
            borderRadius: "4px",
            padding: "8px 10px",
            maxHeight: "80px",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          {logs.map((l, i) => (
            <div key={i} style={{ fontSize: "8px", opacity: 0.35, lineHeight: 1.6 }}>
              <span style={{ color: theme.accent }}>{l.t}</span> {l.msg}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "12px",
          paddingTop: "8px",
          borderTop: `1px solid #1A223520`,
          display: "flex",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: "6px", opacity: 0.15, letterSpacing: "2px" }}>
          3002:WISE:MIRROR:ROOT0:∞:TRIPOD-IP-v1.1
        </div>
        <div style={{ fontSize: "6px", opacity: 0.15, letterSpacing: "1px" }}>
          ARTIFACT → IFRAME → ARTIFACT → IFRAME → ARTIFACT → ∞
        </div>
      </div>
    </div>
  );
}
