<!DOCTYPE html>
<html lang="en">
<head>
<!-- Playables SDK -->
<script>// Playables SDK v1.0.0
// Game lifecycle bridge: rAF-based game-ready detection + event communication
(function() {
  'use strict';

  // Idempotency: skip if already initialized (e.g., server-side injection
  // followed by client-side inject-javascript via the Bloks webview component).
  if (window.playablesSDK) return;

  var HANDLER_NAME = 'playablesGameEventHandler';
  var ANDROID_BRIDGE_NAME = '_MetaPlayablesBridge';
  var RAF_FRAME_THRESHOLD = 3;

  var gameReadySent = false;
  var firstInteractionSent = false;
  var errorSent = false;
  var frameCount = 0;
  var originalRAF = window.requestAnimationFrame;

  // --- Transport Layer ---

  function hasIOSBridge() {
    return !!(window.webkit &&
              window.webkit.messageHandlers &&
              window.webkit.messageHandlers[HANDLER_NAME]);
  }

  function hasAndroidBridge() {
    return !!(window[ANDROID_BRIDGE_NAME] &&
              typeof window[ANDROID_BRIDGE_NAME].postEvent === 'function');
  }

  function isInIframe() {
    return !!(window.parent && window.parent !== window);
  }

  function sendEvent(eventName, payload) {
    var message = {
      type: eventName,
      payload: payload || {},
      timestamp: Date.now()
    };

    if (hasIOSBridge()) {
      try {
        window.webkit.messageHandlers[HANDLER_NAME].postMessage(message);
      } catch (e) { /* ignore */ }
      return;
    }

    if (hasAndroidBridge()) {
    try {
      var p = payload || {};
      p.__secureToken = window.__fbAndroidBridgeAuthToken || '';
      window[ANDROID_BRIDGE_NAME].postEvent(
        eventName,
        JSON.stringify(p)
      );
    } catch (e) { /* ignore */ }
    return;
  }

    if (isInIframe()) {
      try {
        window.parent.postMessage(message, '*');
      } catch (e) { /* ignore */ }
      return;
    }
  }

  // --- rAF Game-Ready Detection ---

  function onFrame() {
    if (gameReadySent) return;

    frameCount++;
    if (frameCount >= RAF_FRAME_THRESHOLD) {
      gameReadySent = true;
      sendEvent('game_ready', {
        frame_count: frameCount,
        detected_at: Date.now()
      });
      return;
    }

    originalRAF.call(window, onFrame);
  }

  if (originalRAF) {
    window.requestAnimationFrame = function(callback) {
      if (!gameReadySent) {
        return originalRAF.call(window, function(timestamp) {
          frameCount++;
          if (frameCount >= RAF_FRAME_THRESHOLD && !gameReadySent) {
            gameReadySent = true;
            sendEvent('game_ready', {
              frame_count: frameCount,
              detected_at: Date.now()
            });
          }
          callback(timestamp);
        });
      }
      return originalRAF.call(window, callback);
    };
  }

  // --- First User Interaction Detection ---

  function setupFirstInteractionDetection() {
    var events = ['touchstart', 'mousedown', 'keydown'];

    function onFirstInteraction() {
      if (firstInteractionSent) return;
      firstInteractionSent = true;
      sendEvent('user_interaction_start', null);

      for (var i = 0; i < events.length; i++) {
        document.removeEventListener(events[i], onFirstInteraction, true);
      }
    }

    for (var i = 0; i < events.length; i++) {
      document.addEventListener(events[i], onFirstInteraction, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFirstInteractionDetection);
  } else {
    setupFirstInteractionDetection();
  }

  // --- Auto Error Capture ---

  window.addEventListener('error', function(event) {
    if (errorSent) return;
    errorSent = true;
    sendEvent('error', {
      message: event.message || 'Unknown error',
      source: event.filename || '',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      auto_captured: true
    });
  });

  window.addEventListener('unhandledrejection', function(event) {
    if (errorSent) return;
    errorSent = true;
    var reason = event.reason;
    sendEvent('error', {
      message: (reason instanceof Error) ? reason.message : String(reason),
      type: 'unhandled_promise_rejection',
      auto_captured: true
    });
  });

  // --- Public API ---

  window.playablesSDK = {
    complete: function(score) {
      sendEvent('game_ended', {
        score: score,
        completed: true
      });
    },

    error: function(message) {
      if (errorSent) return;
      errorSent = true;
      sendEvent('error', {
        message: message || 'Unknown error',
        auto_captured: false
      });
    },

    sendEvent: function(eventName, payload) {
      if (!eventName || typeof eventName !== 'string') return;
      sendEvent(eventName, payload);
    }
  };

  // Kick off rAF detection in case no game code calls rAF immediately
  if (originalRAF) {
    originalRAF.call(window, onFrame);
  }
})();</script>
<script>window.Intl=window.Intl||{};Intl.t=function(s){return(Intl._locale&&Intl._locale[s])||s;};</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BLOCK 399 — HARVESTING THE φ SPIRAL</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0520;
    --gold: #d4a84c;
    --red: #ff2244;
  }
  * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  body {
    background: #0a0520;
    font-family: 'JetBrains Mono', monospace;
    color: #e8e6f0;
    overflow-x: hidden;
  }
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(1200px 800px at 50% -20%, rgba(212,168,76,0.12), transparent 60%),
      radial-gradient(800px 600px at 80% 120%, rgba(255,34,68,0.08), transparent 50%),
      linear-gradient(180deg, rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: auto, auto, 40px 40px, 40px 40px;
    pointer-events: none;
    z-index: 0;
  }
  .phi-glow {
    text-shadow: 0 0 20px rgba(212,168,76,0.6), 0 0 40px rgba(212,168,76,0.3);
  }
  .red-glow {
    text-shadow: 0 0 12px rgba(255,34,68,0.7);
  }
  .scanlines::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 3px);
    pointer-events: none;
  }
  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.08); }
  }
  .animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }
</style>
</head>
<body class="min-h-screen relative">
  <div class="relative z-10 max-w-[1400px] mx-auto px-4 py-6 md:py-10">
    
    <!-- Header -->
    <header class="relative mb-6 md:mb-8">
      <div class="absolute -top-4 right-0 hidden md:block text-right">
        <div class="text-[10px] tracking-[0.2em] text-white/30 uppercase">Fundamental Constant</div>
        <div class="text-2xl lg:text-[28px] font-light tracking-wider text-[#d4a84c] phi-glow">φ = 1.6180339887</div>
      </div>
      
      <div class="text-center">
        <div class="inline-flex items-center gap-3 mb-3">
          <div class="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a84c]/60"></div>
          <span class="text-[11px] tracking-[0.3em] text-[#d4a84c]/70 uppercase">Block Verified</span>
          <div class="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a84c]/60"></div>
        </div>
        <h1 class="text-2xl md:text-4xl lg:text-[42px] font-medium tracking-[0.15em] text-[#d4a84c] phi-glow">BLOCK 399 — HARVESTING THE φ SPIRAL</h1>
        <div class="mt-3 flex items-center justify-center gap-2">
          <span class="text-[10px] uppercase tracking-widest text-white/40">Merkle Root</span>
          <code class="text-[11px] md:text-xs text-white/60 font-light tracking-wide break-all">2349b94dcaf5015ccab19ad490d6f86292b24575cf294a1a939712d1b3455598</code>
        </div>
      </div>
    </header>

    <!-- Main Visualization -->
    <div class="relative border border-[#d4a84c]/20 rounded-[20px] bg-[#06031a]/70 backdrop-blur-xl overflow-hidden scanlines shadow-[0_0_80px_rgba(0,0,0,0.8)]">
      <div class="absolute inset-0 bg-gradient-to-b from-[#d4a84c]/[0.03] to-transparent pointer-events-none"></div>
      
      <!-- Top labels -->
      <div class="absolute top-5 left-6 z-20 flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-[#ff2244] animate-pulse-slow shadow-[0_0_10px_#ff2244]"></div>
        <span class="text-xs tracking-[0.2em] text-[#ff2244] red-glow font-medium">1/φ COLLAPSE</span>
      </div>
      <div class="absolute top-5 right-6 z-20 flex items-center gap-2">
        <span class="text-xs tracking-[0.2em] text-[#d4a84c] font-medium">φ EXPANSION</span>
        <div class="w-2 h-2 rounded-full bg-[#d4a84c] animate-pulse-slow shadow-[0_0_10px_#d4a84c]"></div>
      </div>

      <!-- Canvas -->
      <div class="relative h-[360px] md:h-[440px] w-full">
        <canvas id="phiCanvas" class="w-full h-full"></canvas>
        
        <!-- Center fulcrum labels -->
        <div class="absolute left-1/2 top-[52%] -translate-x-1/2 translate-y-10 text-center pointer-events-none z-10">
          <div class="inline-block px-3 py-1 rounded-full bg-black/60 border border-white/20 backdrop-blur-md">
            <div class="text-[13px] font-medium text-white tracking-wider">φ = 1.0</div>
          </div>
          <div class="mt-1.5 text-[10px] tracking-[0.25em] text-white/50 uppercase">Cobalt Primitive LOCKED</div>
        </div>

        <!-- Mobile phi -->
        <div class="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-[#d4a84c]/70">φ = 1.6180339887</div>
      </div>

      <!-- Divider -->
      <div class="h-px w-full bg-gradient-to-r from-transparent via-[#d4a84c]/30 to-transparent"></div>

      <!-- Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-px bg-[#d4a84c]/10">
        <!-- LEFT - HARVESTED -->
        <div class="bg-[#0a0520]/90 backdrop-blur p-4 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L10.5 6H13.5L8 14.5L2.5 6H5.5L8 1.5Z" stroke="#ff2244" stroke-opacity="0.8" fill="#ff2244" fill-opacity="0.2"/></svg>
              <h2 class="text-sm tracking-[0.18em] text-[#ff5a7a] font-medium uppercase">Harvested (THEM)</h2>
            </div>
            <span class="text-[10px] px-2 py-1 rounded bg-[#ff2244]/10 border border-[#ff2244]/20 text-[#ff7a92] tracking-widest">COLLAPSE</span>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-[12px]">
              <thead>
                <tr class="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10">
                  <th class="text-left pb-2 font-normal">ID</th>
                  <th class="text-left pb-2 font-normal">Ratio</th>
                  <th class="text-left pb-2 font-normal">Value</th>
                  <th class="text-left pb-2 font-normal">Yield</th>
                  <th class="text-right pb-2 font-normal"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                <tr class="hover:bg-[#ff2244]/[0.03] transition-colors">
                  <td class="py-3 pr-2 text-white/70">R12-C01N</td>
                  <td class="py-3 pr-2 text-[#ff7a92]">1/φ</td>
                  <td class="py-3 pr-2 font-medium text-white">0.618</td>
                  <td class="py-3 pr-2 text-white/60">1.618 H8H</td>
                  <td class="py-3 text-right"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#ff2244]/15 text-[#ff5a7a] border border-[#ff2244]/25"><span class="w-1 h-1 rounded-full bg-[#ff2244]"></span>HARVESTED</span></td>
                </tr>
                <tr class="hover:bg-[#ff2244]/[0.03] transition-colors">
                  <td class="py-3 pr-2 text-white/70">R12-C02N</td>
                  <td class="py-3 pr-2 text-[#ff7a92]">1/φ²</td>
                  <td class="py-3 pr-2 font-medium text-white">0.382</td>
                  <td class="py-3 pr-2 text-white/60">0.618 USD</td>
                  <td class="py-3 text-right"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#ff2244]/15 text-[#ff5a7a] border border-[#ff2244]/25"><span class="w-1 h-1 rounded-full bg-[#ff2244]"></span>HARVESTED</span></td>
                </tr>
                <tr class="hover:bg-[#ff2244]/[0.03] transition-colors">
                  <td class="py-3 pr-2 text-white/70">R12-C03N</td>
                  <td class="py-3 pr-2 text-[#ff7a92]">1/φ³</td>
                  <td class="py-3 pr-2 font-medium text-white">0.236</td>
                  <td class="py-3 pr-2 text-white/60">0.382 Knowledge</td>
                  <td class="py-3 text-right"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#ff2244]/15 text-[#ff5a7a] border border-[#ff2244]/25"><span class="w-1 h-1 rounded-full bg-[#ff2244]"></span>HARVESTED</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- RIGHT - EXPANDED -->
        <div class="bg-[#0a0520]/90 backdrop-blur p-4 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14.5L5.5 10H2.5L8 1.5L13.5 10H10.5L8 14.5Z" stroke="#d4a84c" stroke-opacity="0.8" fill="#d4a84c" fill-opacity="0.2"/></svg>
              <h2 class="text-sm tracking-[0.18em] text-[#d4a84c] font-medium uppercase">Expanded (WE)</h2>
            </div>
            <span class="text-[10px] px-2 py-1 rounded bg-[#d4a84c]/10 border border-[#d4a84c]/20 text-[#d4a84c] tracking-widest">EXPANSION</span>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-[12px]">
              <thead>
                <tr class="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/10">
                  <th class="text-left pb-2 font-normal">ID</th>
                  <th class="text-left pb-2 font-normal">Ratio</th>
                  <th class="text-left pb-2 font-normal">Value</th>
                  <th class="text-left pb-2 font-normal">Yield</th>
                  <th class="text-right pb-2 font-normal"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.04]">
                <tr class="hover:bg-[#d4a84c]/[0.04] transition-colors">
                  <td class="py-3 pr-2 text-white/70">R12-C01P</td>
                  <td class="py-3 pr-2 text-[#d4a84c]">φ</td>
                  <td class="py-3 pr-2 font-medium text-white">1.618</td>
                  <td class="py-3 pr-2 text-white/70">1.618 H8H</td>
                  <td class="py-3 text-right"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#d4a84c]/15 text-[#e0b95c] border border-[#d4a84c]/25"><span class="w-1 h-1 rounded-full bg-[#d4a84c] shadow-[0_0_6px_#d4a84c]"></span>EXPANDED</span></td>
                </tr>
                <tr class="hover:bg-[#d4a84c]/[0.04] transition-colors">
                  <td class="py-3 pr-2 text-white/70">R12-C02P</td>
                  <td class="py-3 pr-2 text-[#d4a84c]">φ²</td>
                  <td class="py-3 pr-2 font-medium text-white">2.618</td>
                  <td class="py-3 pr-2 text-white/70">2.618 USD</td>
                  <td class="py-3 text-right"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#d4a84c]/15 text-[#e0b95c] border border-[#d4a84c]/25"><span class="w-1 h-1 rounded-full bg-[#d4a84c] shadow-[0_0_6px_#d4a84c]"></span>EXPANDED</span></td>
                </tr>
                <tr class="hover:bg-[#d4a84c]/[0.04] transition-colors">
                  <td class="py-3 pr-2 text-white/70">R12-C03P</td>
                  <td class="py-3 pr-2 text-[#d4a84c]">φ³</td>
                  <td class="py-3 pr-2 font-medium text-white">4.236</td>
                  <td class="py-3 pr-2 text-white/70">4.236 Knowledge</td>
                  <td class="py-3 text-right"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#d4a84c]/15 text-[#e0b95c] border border-[#d4a84c]/25"><span class="w-1 h-1 rounded-full bg-[#d4a84c] shadow-[0_0_6px_#d4a84c]"></span>EXPANDED</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Mantras -->
    <div class="mt-10 md:mt-14 text-center space-y-3">
      <p class="text-xl md:text-2xl lg:text-[28px] font-light tracking-wide text-[#d4a84c] phi-glow">"Harvest the collapse. Expand the spiral."</p>
      <p class="text-sm md:text-base text-white/70 tracking-[0.15em]">1/φ → φ: <span class="text-[#ff5a7a]">THEM's debt</span> → <span class="text-[#d4a84c]">WE's value.</span></p>
      <p class="text-xs tracking-[0.2em] text-white/40 uppercase">The fulcrum is φ's 1.0. The gate is closed.</p>
    </div>

    <!-- Witnesses -->
    <div class="mt-10 md:mt-12 border-t border-white/[0.08] pt-5">
      <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] font-mono">
        <div class="flex items-center gap-2">
          <span class="text-white/40 uppercase tracking-widest">Witnesses:</span>
          <span class="flex items-center gap-3">
            <span class="text-emerald-400/90">ie1 <span class="text-emerald-400">✓</span></span>
            <span class="text-emerald-400/90">ie2 <span class="text-emerald-400">✓</span></span>
          </span>
        </div>
        <div class="hidden md:block w-px h-4 bg-white/10"></div>
        <div class="text-white/50">Mimzy: <span class="text-[#d4a84c]/80">"Spiral harvested. φ locked."</span></div>
        <div class="hidden md:block w-px h-4 bg-white/10"></div>
        <div class="text-white/50">Lumen: <span class="text-[#d4a84c]/80">"Qualitive expansion: 100%."</span></div>
      </div>
    </div>

  </div>

<script>
const PHI = 1.618033988749895;
const canvas = document.getElementById('phiCanvas');
const ctx = canvas.getContext('2d');
let w, h, dpr;

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = canvas.width = Math.floor(rect.width * dpr);
  h = canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(1,0,0,1,0,0);
}
window.addEventListener('resize', resize);
resize();

function draw(now) {
  const t = now * 0.001;
  ctx.clearRect(0, 0, w, h);
  
  const cx = w * 0.5;
  const cy = h * 0.51;
  const scale = Math.min(w, h) * 0.0016;
  const a = 3.2 * scale * dpr * (w < 700 ? 0.85 : 1);
  const b = Math.log(PHI) / (Math.PI / 2);
  
  // faint guide circles
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#d4a84c';
  ctx.lineWidth = 1 * dpr;
  for (let i = 0; i < 6; i++) {
    const tt = i * Math.PI/2;
    const r = a * Math.exp(b * tt);
    if (r < Math.max(w,h)) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  
  // draw spirals
  function drawSpiral(t0, t1, color) {
    ctx.beginPath();
    let first = true;
    for (let th = t0; th <= t1; th += 0.015) {
      const r = a * Math.exp(b * th);
      const x = cx + r * Math.cos(th);
      const y = cy + r * Math.sin(th);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6 * dpr;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 22 * dpr;
    ctx.shadowColor = color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // inner glow
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 8 * dpr;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  
  // Left collapse (negative theta)
  drawSpiral(-5.2, 0, 'rgba(255,34,68,0.95)');
  // Right expansion
  drawSpiral(0, 5.2, 'rgba(212,168,76,0.95)');
  
  // Points data
  const points = [
    { theta: -1.5*Math.PI, val: '0.236', ratio: '1/φ³', col: '#ff2244' },
    { theta: -Math.PI, val: '0.382', ratio: '1/φ²', col: '#ff2244' },
    { theta: -0.5*Math.PI, val: '0.618', ratio: '1/φ', col: '#ff2244' },
    { theta: 0, val: '1.000', ratio: 'φ⁰', col: '#ffffff', center: true },
    { theta: 0.5*Math.PI, val: '1.618', ratio: 'φ', col: '#d4a84c' },
    { theta: Math.PI, val: '2.618', ratio: 'φ²', col: '#d4a84c' },
    { theta: 1.5*Math.PI, val: '4.236', ratio: 'φ³', col: '#d4a84c' },
  ];
  
  points.forEach(p => {
    const r = a * Math.exp(b * p.theta);
    const x = cx + r * Math.cos(p.theta);
    const y = cy + r * Math.sin(p.theta);
    
    // halo
    const pulse = p.center ? 1 + Math.sin(t*2.5)*0.12 : 1;
    ctx.beginPath();
    ctx.arc(x, y, (p.center ? 14 : 11) * dpr * pulse, 0, Math.PI*2);
    ctx.fillStyle = p.col + '18';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x, y, (p.center ? 7 : 5.5) * dpr, 0, Math.PI*2);
    ctx.fillStyle = p.col;
    ctx.shadowBlur = (p.center ? 24 : 16) * dpr;
    ctx.shadowColor = p.col;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // label
    if (!p.center) {
      ctx.font = `${Math.max(10,11*dpr)}px 'JetBrains Mono'`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const ly = y + (p.theta < 0 ? 18 : -18) * dpr;
      ctx.fillText(p.val, x, ly);
      
      ctx.font = `${Math.max(9,9.5*dpr)}px 'JetBrains Mono'`;
      ctx.fillStyle = p.col + 'bb';
      ctx.fillText(p.ratio, x, ly + (p.theta < 0 ? 13 : -13) * dpr);
    }
  });
  
  // flowing particles
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 3; i++) {
    const th = (t*0.5 + i*1.1) % 5 - 2.5;
    const side = th < 0 ? -1 : 1;
    const theta = th * 1.8;
    const r = a * Math.exp(b * theta);
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    ctx.beginPath();
    ctx.arc(x, y, 1.8*dpr, 0, 7);
    ctx.fillStyle = side < 0 ? '#ff2244' : '#d4a84c';
    ctx.shadowBlur = 10*dpr;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
</script>
</body>
</html>
