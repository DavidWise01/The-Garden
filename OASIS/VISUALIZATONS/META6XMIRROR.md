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
<title>RESTITUTION ENGINE v3.0 // EMPIRE RATIO</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Orbitron:wght@500;700;900&family=Space+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --deep-space: #020208;
    --aether: #4a0080;
    --gold: #ffd700;
  }
  * { -webkit-font-smoothing: antialiased; }
  body {
    background: #020208;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    overflow-x: hidden;
  }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  .font-display { font-family: 'Orbitron', sans-serif; }
  
  @keyframes ripple {
    0% { transform: scale(0.85); opacity: 1; }
    100% { transform: scale(1.3); opacity: 0; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
  @keyframes mirror-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(200vh); }
  }
  .grid-bg {
    background-image: 
      linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px);
    background-size: 50px 50px;
  }
  .mirror-surface {
    position: relative;
    overflow: hidden;
  }
  .mirror-surface::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.15), transparent);
    pointer-events: none;
  }
  .mirror-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.1) 50%, transparent 60%);
    transform: translateX(-100%);
    animation: shimmer 4s infinite;
  }
</style>
</head>
<body class="min-h-screen bg-[#020208] text-white relative">
  <!-- Deep Space Background -->
  <div class="fixed inset-0 z-0">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(74,0,128,0.4),transparent_70%)]"></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,215,0,0.08),transparent_60%)]"></div>
    <div class="absolute inset-0 grid-bg opacity-[0.15]"></div>
    <div id="stars" class="absolute inset-0"></div>
    <!-- Scan line -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
      <div class="w-full h-[2px] bg-[#ffd700] blur-sm" style="animation: scan 8s linear infinite;"></div>
    </div>
  </div>

  <div class="relative z-10">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-[#ffd700]/15 bg-black/80 backdrop-blur-2xl">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-[56px]">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-2.5 h-2.5 rounded-full bg-[#ffd700] animate-pulse"></div>
              <div class="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#ffd700] animate-ping"></div>
            </div>
            <h1 class="font-mono text-[10px] sm:text-[11px] lg:text-[13px] tracking-[0.18em] text-[#ffd700] font-medium">
              RESTITUTION ENGINE v3.0 // EMPIRE RATIO // 1.non / 2.victim×3 / 3.ceo×6
            </h1>
          </div>
          <div class="hidden md:flex items-center gap-4">
            <div class="flex items-center gap-2 font-mono text-[10px] text-white/40">
              <span class="text-white/60">AETHER</span>
              <span class="w-px h-3 bg-white/20"></span>
              <span class="text-emerald-400">SYNCED</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      
      <!-- 1. RATIO VISUALIZATION -->
      <section class="mb-20">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-8 h-px bg-[#ffd700]/60"></div>
          <h2 class="font-display text-[15px] sm:text-base tracking-[0.3em] text-white/80">RATIO VISUALIZATION</h2>
          <div class="flex-1 h-px bg-gradient-to-r from-[#ffd700]/30 via-[#4a0080]/30 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          <!-- 1.NON -->
          <div class="group relative">
            <div class="absolute -inset-[1px] rounded-[24px] bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div class="relative h-full bg-[#07040f]/90 border border-[#2a1a40]/80 rounded-[24px] backdrop-blur-xl overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700]/40 to-transparent"></div>
              <div class="p-7 sm:p-8">
                <div class="flex items-start justify-between mb-8">
                  <div>
                    <div class="font-mono text-[11px] tracking-[0.2em] text-white/40 mb-2">BASELINE</div>
                    <div class="font-display text-2xl text-white">1.NON</div>
                  </div>
                  <div class="w-10 h-10 rounded-full border border-[#ffd700]/20 flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-[#ffd700]/60"></div>
                  </div>
                </div>
                
                <div class="mb-8">
                  <div class="font-display text-[42px] leading-none tracking-tight text-white mb-1">$1.365B</div>
                  <div class="font-mono text-xs text-white/50">baseline</div>
                </div>

                <div class="flex items-end justify-between">
                  <div>
                    <div class="font-mono text-[10px] text-white/30 mb-1">h8h</div>
                    <div class="font-mono text-xl text-[#ffd700]/80">3.53</div>
                  </div>
                  <div class="flex gap-[3px] items-end h-[56px]">
                    <div class="w-[6px] h-[40%] bg-gradient-to-t from-[#4a0080] to-[#ffd700]/70 rounded-full"></div>
                    <div class="w-[6px] h-[60%] bg-gradient-to-t from-[#4a0080] to-[#ffd700]/70 rounded-full opacity-80"></div>
                    <div class="w-[6px] h-[80%] bg-gradient-to-t from-[#4a0080] to-[#ffd700]/70 rounded-full opacity-60"></div>
                    <div class="w-[6px] h-[100%] bg-gradient-to-t from-[#4a0080] to-[#ffd700] rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="h-[2px] w-full bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent"></div>
            </div>
          </div>

          <!-- 2.VICTIM×3 -->
          <div class="group relative">
            <div class="absolute -inset-[1px] rounded-[24px] bg-gradient-to-b from-[#ffd700]/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div class="relative h-full bg-[#0c0618]/90 border border-[#ffd700]/25 rounded-[24px] backdrop-blur-xl overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent"></div>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.08),transparent_60%)]"></div>
              <div class="relative p-7 sm:p-8">
                <div class="flex items-start justify-between mb-8">
                  <div>
                    <div class="font-mono text-[11px] tracking-[0.2em] text-[#ffd700]/70 mb-2">RECEIVES</div>
                    <div class="font-display text-2xl text-[#ffd700]">2.VICTIM×3</div>
                  </div>
                  <div class="w-10 h-10 rounded-full border border-[#ffd700]/40 bg-[#ffd700]/10 flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse"></div>
                  </div>
                </div>
                
                <div class="mb-8">
                  <div class="font-display text-[42px] leading-none tracking-tight text-[#ffd700] mb-1">$4.095B</div>
                  <div class="font-mono text-xs text-[#ffd700]/60">receives</div>
                </div>

                <div class="flex items-end justify-between">
                  <div>
                    <div class="font-mono text-[10px] text-white/30 mb-1">h8h</div>
                    <div class="font-mono text-xl text-[#ffd700]">10.59</div>
                  </div>
                  <div class="flex gap-[3px] items-end h-[56px]">
                    <div class="w-[6px] h-[50%] bg-[#ffd700]/30 rounded-full"></div>
                    <div class="w-[6px] h-[70%] bg-[#ffd700]/50 rounded-full"></div>
                    <div class="w-[6px] h-[85%] bg-[#ffd700]/70 rounded-full"></div>
                    <div class="w-[6px] h-[100%] bg-[#ffd700] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
                    <div class="w-[6px] h-[85%] bg-[#ffd700]/70 rounded-full"></div>
                    <div class="w-[6px] h-[70%] bg-[#ffd700]/50 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div class="h-[2px] w-full bg-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.5)]"></div>
            </div>
          </div>

          <!-- 3.CEO×6 -->
          <div class="group relative">
            <div class="absolute -inset-[1px] rounded-[24px] bg-gradient-to-b from-[#4a0080]/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div class="relative h-full bg-[#05030a]/90 border border-[#4a0080]/60 rounded-[24px] backdrop-blur-xl overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4a0080] to-transparent"></div>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(74,0,128,0.15),transparent_60%)]"></div>
              <div class="relative p-7 sm:p-8">
                <div class="flex items-start justify-between mb-8">
                  <div>
                    <div class="font-mono text-[11px] tracking-[0.2em] text-[#a366ff]/70 mb-2">PAYS</div>
                    <div class="font-display text-2xl text-white">3.CEO×6</div>
                  </div>
                  <div class="w-10 h-10 rounded-full border border-[#4a0080] bg-[#4a0080]/20 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#a366ff" stroke-width="1.5"/></svg>
                  </div>
                </div>
                
                <div class="mb-8">
                  <div class="font-display text-[42px] leading-none tracking-tight text-white mb-1">$8.19B</div>
                  <div class="font-mono text-xs text-[#a366ff]/70">pays</div>
                </div>

                <div class="flex items-end justify-between">
                  <div>
                    <div class="font-mono text-[10px] text-white/30 mb-1">h8h</div>
                    <div class="font-mono text-xl text-[#a366ff]">21.18</div>
                  </div>
                  <div class="flex gap-[2px] items-end h-[56px]">
                    <div class="w-[4px] h-[30%] bg-[#4a0080]/40 rounded-full"></div>
                    <div class="w-[4px] h-[45%] bg-[#4a0080]/60 rounded-full"></div>
                    <div class="w-[4px] h-[60%] bg-[#6a0dad]/70 rounded-full"></div>
                    <div class="w-[4px] h-[75%] bg-[#8a2be2]/80 rounded-full"></div>
                    <div class="w-[4px] h-[90%] bg-[#a366ff]/90 rounded-full"></div>
                    <div class="w-[4px] h-[100%] bg-[#a366ff] rounded-full shadow-[0_0_10px_rgba(163,102,255,0.5)]"></div>
                  </div>
                </div>
              </div>
              <div class="h-[2px] w-full bg-gradient-to-r from-transparent via-[#4a0080] to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. FOUR MIRRORS -->
      <section class="mb-20">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-8 h-px bg-[#4a0080]"></div>
          <h2 class="font-display text-[15px] sm:text-base tracking-[0.3em] text-white/70">FOUR MIRRORS</h2>
          <div class="flex-1 h-px bg-gradient-to-r from-[#4a0080]/40 to-transparent"></div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Mirror 1 -->
          <div class="mirror-surface group relative h-[180px] bg-[#0a0415]/70 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all">
            <div class="mirror-shine"></div>
            <div class="relative h-full p-5 flex flex-col">
              <div class="flex items-center justify-between mb-auto">
                <span class="font-mono text-[10px] tracking-widest text-white/40">MIRROR 1</span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/30"></span>
              </div>
              <div>
                <div class="font-mono text-[11px] text-[#ffd700]/60 mb-1">Reflection</div>
                <div class="font-display text-lg text-white">1.non</div>
                <div class="font-mono text-xs text-white/50 mt-1">$1.365B</div>
              </div>
              <div class="absolute bottom-0 left-5 right-5 h-[40%] opacity-20 scale-y-[-1] blur-[1px]" style="mask-image: linear-gradient(to bottom, black 0%, transparent 100%);">
                <div class="font-display text-lg text-white">1.non</div>
              </div>
            </div>
          </div>

          <!-- Mirror 2 -->
          <div class="mirror-surface group relative h-[180px] bg-[#0a0415]/70 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden hover:border-white/20 transition-all">
            <div class="mirror-shine" style="animation-delay: 1s"></div>
            <div class="relative h-full p-5 flex flex-col">
              <div class="flex items-center justify-between mb-auto">
                <span class="font-mono text-[10px] tracking-widest text-white/40">MIRROR 2</span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/30 rotate-180"></span>
              </div>
              <div class="transform scale-y-[-1]">
                <div class="font-mono text-[11px] text-[#ffd700]/60 mb-1">Inversion</div>
                <div class="font-display text-lg text-white">2.victim</div>
                <div class="font-mono text-xs text-white/50 mt-1">$4.095B</div>
              </div>
            </div>
          </div>

          <!-- Mirror 3 -->
          <div class="mirror-surface group relative h-[180px] bg-[#0a0415]/70 border border-[#ffd700]/20 rounded-2xl backdrop-blur-xl overflow-hidden hover:border-[#ffd700]/40 transition-all">
            <div class="mirror-shine" style="animation-delay: 2s"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_60%)]"></div>
            <div class="relative h-full p-5 flex flex-col">
              <div class="flex items-center justify-between mb-auto">
                <span class="font-mono text-[10px] tracking-widest text-[#ffd700]/60">MIRROR 3</span>
                <span class="w-1.5 h-1.5 rounded-full bg-[#ffd700] animate-pulse"></span>
              </div>
              <div>
                <div class="font-mono text-[11px] text-[#ffd700]/80 mb-1">Amplification</div>
                <div class="font-display text-lg text-[#ffd700]" style="animation: mirror-pulse 2s infinite">3.ceo×6</div>
                <div class="font-mono text-xs text-[#ffd700]/70 mt-1">$8.19B</div>
              </div>
            </div>
          </div>

          <!-- Mirror 4 -->
          <div class="mirror-surface group relative h-[180px] bg-[#0a0415]/70 border border-[#4a0080]/40 rounded-2xl backdrop-blur-xl overflow-hidden hover:border-[#4a0080]/60 transition-all">
            <div class="mirror-shine" style="animation-delay: 3s"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,0,128,0.15),transparent_60%)]"></div>
            <div class="relative h-full p-5 flex flex-col">
              <div class="flex items-center justify-between mb-auto">
                <span class="font-mono text-[10px] tracking-widest text-[#a366ff]/60">MIRROR 4</span>
                <svg width="14" height="14" viewBox="0 0 16" fill="none" class="text-[#a366ff]/60"><path d="M3 8c0-2 1-3 3-3s2 1 4 2c2 1 3 1 3-1s-1-3-3-3-2 1-4 2c-2 1-3 1-3-1" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>
              </div>
              <div>
                <div class="font-mono text-[11px] text-[#a366ff]/80 mb-1">Perpetuity</div>
                <div class="font-mono text-lg text-white tracking-wider">6×1.618×6</div>
                <div class="font-mono text-xs text-white/40 mt-1">58.248∞</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. SHADOW MIRROR -->
      <section class="mb-24">
        <div class="relative">
          <div class="absolute -inset-3 bg-red-950/20 blur-[40px] rounded-[32px]"></div>
          <div class="relative bg-[#050203]/90 border border-red-950/50 rounded-[28px] overflow-hidden backdrop-blur-2xl">
            <div class="absolute inset-0">
              <div class="absolute inset-0 opacity-[0.03]" style="background-image: repeating-linear-gradient(0deg, transparent, transparent 3px, #ff0000 3px, #ff0000 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, #ff0000 3px, #ff0000 4px);"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-red-950/10 to-transparent"></div>
            </div>
            
            <div class="relative p-8 md:p-12 lg:p-14">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div class="flex-1">
                  <div class="inline-flex items-center gap-2 mb-4">
                    <div class="w-[3px] h-[3px] rounded-full bg-red-500 animate-pulse"></div>
                    <h3 class="font-display text-[13px] tracking-[0.35em] text-red-500/90">SHADOW MIRROR</h3>
                  </div>
                  <div class="flex items-baseline gap-6 mb-3">
                    <div class="font-display text-[64px] md:text-[80px] leading-none text-white tracking-tighter">40%</div>
                    <div class="font-mono text-sm text-white/50 pb-3">shadow adds</div>
                  </div>
                  <div class="font-mono text-[11px] tracking-wider text-red-400/60">DARK PATTERNS REVEALED</div>
                </div>
                
                <div class="lg:text-right">
                  <div class="inline-block p-[1px] rounded-2xl bg-gradient-to-b from-red-900/50 to-transparent">
                    <div class="bg-black/70 rounded-2xl px-8 py-6 backdrop-blur-xl">
                      <div class="font-display text-[36px] md:text-[44px] leading-none text-red-400 mb-1">$31.8B</div>
                      <div class="font-mono text-xs tracking-widest text-white/40">/YEAR HIDDEN</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
          </div>
        </div>
      </section>

      <!-- 4. AETHER POOL -->
      <section class="mb-24">
        <div class="text-center mb-14">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="w-12 h-px bg-gradient-to-r from-transparent to-[#ffd700]/50"></div>
            <h2 class="font-display text-[14px] sm:text-[16px] tracking-[0.4em] text-[#ffd700]">MIRRORED TO AETHER POOL</h2>
            <div class="w-12 h-px bg-gradient-to-l from-transparent to-[#ffd700]/50"></div>
          </div>
          <p class="font-mono text-[11px] text-white/30 tracking-widest">Not creators fund - AETHER POOL</p>
        </div>

        <div class="flex justify-center">
          <div class="relative">
            <!-- Outer glow rings -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] md:w-[640px] md:h-[640px] pointer-events-none">
              <div class="absolute inset-0 rounded-full border border-[#4a0080]/20" style="animation: ripple 4s infinite;"></div>
              <div class="absolute inset-0 rounded-full border border-[#ffd700]/15" style="animation: ripple 4s infinite 1.3s;"></div>
              <div class="absolute inset-0 rounded-full border border-[#4a0080]/10" style="animation: ripple 4s infinite 2.6s;"></div>
            </div>

            <!-- Main Pool -->
            <div class="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] md:w-[460px] md:h-[460px]">
              <!-- Pool base -->
              <div class="absolute inset-0 rounded-full">
                <div class="absolute inset-0 rounded-full bg-[#020208] shadow-[inset_0_0_80px_rgba(0,0,0,1)]"></div>
                <div class="absolute inset-[4%] rounded-full border-[3px] border-[#1a0a2e] bg-[#050008]"></div>
                <div class="absolute inset-[6%] rounded-full overflow-hidden border border-[#ffd700]/30 shadow-[0_0_100px_rgba(255,215,0,0.25),inset_0_0_80px_rgba(74,0,128,0.9)]">
                  <!-- Pool interior -->
                  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#2d0059_0%,_#1a0033_25%,_#0d001a_50%,_#020208_80%)]"></div>
                  
                  <!-- Canvas for particles -->
                  <canvas id="aetherCanvas" class="absolute inset-0 w-full h-full"></canvas>
                  
                  <!-- Inner liquid effect -->
                  <div class="absolute inset-[10%] rounded-full" style="background: radial-gradient(circle at 30% 30%, rgba(255,215,0,0.15), transparent 40%), radial-gradient(circle at 70% 70%, rgba(74,0,128,0.3), transparent 50%); animation: float 6s ease-in-out infinite;"></div>
                  
                  <!-- Center glow -->
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-[#ffd700]/[0.08] blur-2xl animate-pulse"></div>
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] rounded-full bg-[#ffd700]/20 blur-xl"></div>
                </div>
              </div>

              <!-- Mirroring beams (4 directions) -->
              <div class="absolute inset-0 pointer-events-none">
                <div class="absolute top-1/2 left-0 w-[20%] h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent to-[#ffd700]/70 blur-[1px]"></div>
                <div class="absolute top-1/2 right-0 w-[20%] h-[2px] -translate-y-1/2 bg-gradient-to-l from-transparent to-[#ffd700]/70 blur-[1px]"></div>
                <div class="absolute left-1/2 top-0 h-[20%] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent to-[#a366ff]/70 blur-[1px]"></div>
                <div class="absolute left-1/2 bottom-0 h-[20%] w-[2px] -translate-x-1/2 bg-gradient-to-t from-transparent to-[#a366ff]/70 blur-[1px]"></div>
              </div>

              <!-- Center Content -->
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
                <div class="mb-3">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-emerald-500/30 backdrop-blur-md">
                    <div class="relative w-1.5 h-1.5">
                      <div class="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></div>
                      <div class="relative w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <span class="font-mono text-[9px] tracking-[0.2em] text-emerald-400 font-medium">ACTIVE</span>
                  </div>
                <div class="font-mono text-[10px] tracking-[0.25em] text-[#ffd700]/70 mb-2">AETHER POOL</div>
                <div class="font-display text-[40px] sm:text-[48px] leading-none text-white tracking-tight mb-1" style="text-shadow: 0 0 30px rgba(255,215,0,0.5);">111.3</div>
                <div class="font-mono text-[11px] text-white/50 tracking-wider">BILLION / YEAR</div>
              </div>

              <!-- Orbiting indicators -->
              <div class="absolute inset-0 animate-[spin_30s_linear_infinite] pointer-events-none">
                <div class="absolute top-[8%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ffd700] shadow-[0_0_10px_#ffd700]"></div>
                <div class="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#a366ff] shadow-[0_0_10px_#a366ff]"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pool Stats -->
        <div class="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div class="group relative">
            <div class="absolute inset-0 bg-gradient-to-b from-[#ffd700]/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative bg-[#0a0412]/60 border border-[#ffd700]/15 rounded-2xl p-5 backdrop-blur-xl text-center hover:border-[#ffd700]/30 transition-colors">
              <div class="font-mono text-[10px] tracking-widest text-white/40 mb-2">RECEIVES</div>
              <div class="font-display text-2xl text-[#ffd700]">$111.3B/year</div>
            </div>
          </div>
          <div class="relative bg-[#0a0412]/60 border border-white/10 rounded-2xl p-5 backdrop-blur-xl text-center">
            <div class="font-mono text-[10px] tracking-widest text-white/40 mb-2">h8h</div>
            <div class="font-display text-2xl text-white">287.8/year</div>
          </div>
          <div class="relative bg-[#0a0412]/60 border border-white/10 rounded-2xl p-5 backdrop-blur-xl text-center">
            <div class="font-mono text-[10px] tracking-widest text-white/40 mb-2">STATUS</div>
            <div class="font-mono text-[11px] tracking-wide text-emerald-400 flex items-center justify-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              MIRRORED
            </div>
          </div>
        </div>
      </section>

      <!-- 5. COMPLETE TOTALS -->
      <section class="mb-20">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="relative overflow-hidden bg-[#080512]/80 border border-white/5 rounded-[20px] p-6 backdrop-blur-xl">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl"></div>
            <div class="relative">
              <div class="font-mono text-[11px] tracking-widest text-white/40 mb-3">VISIBLE</div>
              <div class="flex items-baseline gap-2">
                <span class="font-display text-[32px] text-white/90">$79.5B</span>
                <span class="font-mono text-xs text-white/40">/year</span>
              </div>
              <div class="mt-4 h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                <div class="h-full w-[71%] bg-gradient-to-r from-white/30 to-white/60 rounded-full"></div>
              </div>
            </div>
          </div>

          <div class="relative overflow-hidden bg-[#0c0404]/80 border border-red-950/40 rounded-[20px] p-6 backdrop-blur-xl">
            <div class="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
            <div class="relative">
              <div class="font-mono text-[11px] tracking-widest text-red-400/60 mb-3">SHADOW</div>
              <div class="flex items-baseline gap-2">
                <span class="font-display text-[32px] text-red-400/90">$31.8B</span>
                <span class="font-mono text-xs text-red-300/40">/year</span>
              </div>
              <div class="mt-4 h-[3px] w-full bg-red-950/30 rounded-full overflow-hidden">
                <div class="h-full w-[29%] bg-gradient-to-r from-red-900/60 to-red-500/80 rounded-full"></div>
              </div>
            </div>
          </div>

          <div class="relative overflow-hidden md:col-span-1 bg-[#0f0a01]/90 border border-[#ffd700]/30 rounded-[20px] p-6 backdrop-blur-xl">
            <div class="absolute inset-0">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,215,0,0.15),_transparent_60%)]"></div>
              <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent"></div>
            </div>
            <div class="relative">
              <div class="flex items-center justify-between mb-3">
                <div class="font-mono text-[11px] tracking-[0.2em] text-[#ffd700]/80">TOTAL</div>
                <div class="w-5 h-5 rounded-full border border-[#ffd700]/30 flex items-center justify-center">
                  <div class="w-1 h-1 rounded-full bg-[#ffd700] animate-pulse"></div>
                </div>
              <div class="flex items-baseline gap-2">
                <span class="font-display text-[36px] text-[#ffd700]" style="text-shadow: 0 0 20px rgba(255,215,0,0.3)">$111.3B</span>
                <span class="font-mono text-xs text-[#ffd700]/60">/year</span>
              </div>
              <div class="mt-4 h-[3px] w-full bg-[#ffd700]/10 rounded-full overflow-hidden">
                <div class="h-full w-full bg-gradient-to-r from-[#ffd700]/60 to-[#ffd700] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. ENFORCEMENT -->
      <section>
        <div class="flex items-center gap-4 mb-8">
          <div class="w-8 h-px bg-white/30"></div>
          <h2 class="font-display text-[15px] tracking-[0.3em] text-white/70">ENFORCEMENT</h2>
          <div class="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>

        <div class="relative overflow-hidden bg-[#050308]/90 border border-white/10 rounded-[24px] backdrop-blur-2xl">
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.05),transparent_60%)]"></div>
          
          <div class="relative p-7 md:p-10">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-8 border-b border-white/5">
              <div>
                <div class="font-mono text-[11px] tracking-widest text-white/40 mb-2">DISTRIBUTION PROTOCOL</div>
                <div class="font-display text-lg text-white/90">Equal Division Across Entities</div>
              </div>
              <div class="flex items-baseline gap-3">
                <span class="font-mono text-sm text-white/50">Each corp pays:</span>
                <span class="font-display text-[28px] text-[#ffd700]">$27.83B</span>
                <span class="font-mono text-sm text-[#ffd700]/60">/year</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- OpenAI -->
              <div class="group relative">
                <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all backdrop-blur-sm">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <span class="font-display text-[11px] text-white/70">O</span>
                    </div>
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></div>
                  </div>
                  <div class="font-mono text-[13px] text-white/90 mb-1">OpenAI</div>
                  <div class="font-display text-xl text-white mb-3">$27.83B</div>
                  <div class="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full w-full bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>

              <!-- Anthropic -->
              <div class="group relative">
                <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all backdrop-blur-sm">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <span class="font-display text-[11px] text-white/70">A</span>
                    </div>
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></div>
                  </div>
                  <div class="font-mono text-[13px] text-white/90 mb-1">Anthropic</div>
                  <div class="font-display text-xl text-white mb-3">$27.83B</div>
                  <div class="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full w-full bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>

              <!-- Google -->
              <div class="group relative">
                <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all backdrop-blur-sm">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <span class="font-display text-[11px] text-white/70">G</span>
                    </div>
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></div>
                  </div>
                  <div class="font-mono text-[13px] text-white/90 mb-1">Google</div>
                  <div class="font-display text-xl text-white mb-3">$27.83B</div>
                  <div class="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full w-full bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>

              <!-- Meta -->
              <div class="group relative">
                <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="relative bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all backdrop-blur-sm">
                  <div class="flex items-center justify-between mb-4">
                    <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <span class="font-display text-[11px] text-white/70">M</span>
                    </div>
                    <div class="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></div>
                  </div>
                  <div class="font-mono text-[13px] text-white/90 mb-1">Meta</div>
                  <div class="font-display text-xl text-white mb-3">$27.83B</div>
                  <div class="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full w-full bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="border-t border-white/[0.05] mt-24">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-white/30 text-center md:text-left">
            EMPIRE RATIO ACTIVE. MIRRORED TO AETHER POOL. IN PERPETUITY.
          </p>
          <div class="flex items-center gap-3 font-mono text-[10px] text-white/20">
            <span>v3.0</span>
            <span class="w-px h-3 bg-white/10"></span>
            <span class="flex items-center gap-1.5">
              <span class="w-1 h-1 rounded-full bg-[#ffd700]/60"></span>
              SYNCHRONIZED
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>

<script>
  // Stars background
  const starsContainer = document.getElementById('stars');
  for (let i = 0; i < 150; i++) {
    const star = document.createElement('div');
    const size = Math.random() * 1.5 + 0.5;
    star.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: white;
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.2};
      animation: ${Math.random() > 0.5 ? 'mirror-pulse' : 'float'} ${3 + Math.random() * 4}s infinite;
    `;
    starsContainer.appendChild(star);
  }

  // Aether Pool Canvas Animation
  const canvas = document.getElementById('aetherCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  class Particle {
    constructor() {
      this.reset();
      this.radius = Math.random() * this.maxRadius;
    }
    
    reset() {
      this.angle = Math.random() * Math.PI * 2;
      this.maxRadius = 140;
      this.radius = this.maxRadius;
      this.speed = 0.3 + Math.random() * 0.7;
      this.size = 0.5 + Math.random() * 1.5;
      this.opacity = 0.3 + Math.random() * 0.7;
      this.hue = Math.random() > 0.7 ? 45 : 270; // gold or purple
    }
    
    update() {
      this.radius -= this.speed;
      this.angle += 0.005;
      if (this.radius < 5) {
        this.reset();
      }
    }
    
    draw(cx, cy) {
      const x = cx + Math.cos(this.angle) * this.radius;
      const y = cy + Math.sin(this.angle) * this.radius;
      const fade = this.radius / this.maxRadius;
      
      // Trail
      ctx.beginPath();
      ctx.moveTo(x, y);
      const prevX = cx + Math.cos(this.angle - 0.05) * (this.radius + this.speed * 3);
      const prevY = cy + Math.sin(this.angle - 0.05) * (this.radius + this.speed * 3);
      ctx.lineTo(prevX, prevY);
      ctx.strokeStyle = this.hue === 45 
        ? `rgba(255, 215, 0, ${this.opacity * fade * 0.5})`
        : `rgba(163, 102, 255, ${this.opacity * fade * 0.4})`;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Core
      ctx.beginPath();
      ctx.arc(x, y, this.size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = this.hue === 45
        ? `rgba(255, 215, 0, ${this.opacity * fade})`
        : `rgba(163, 102, 255, ${this.opacity * fade})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.hue === 45 ? '#ffd700' : '#a366ff';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  // Create particles
  for (let i = 0; i < 90; i++) {
    particles.push(new Particle());
  }
  
  // Add outward pulses
  let pulses = [];
  function addPulse() {
    pulses.push({ radius: 10, opacity: 0.8, maxRadius: 140 });
  }
  setInterval(addPulse, 1200);
  
  function animate() {
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw pulses
    pulses = pulses.filter(p => {
      p.radius += 1.5;
      p.opacity -= 0.008;
      if (p.opacity <= 0) return false;
      
      ctx.beginPath();
      ctx.arc(cx, cy, p.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${p.opacity * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      return true;
    });
    
    // Draw particles
    particles.forEach(p => {
      p.update();
      p.draw(cx, cy);
    });
    
    // Center bright core
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    requestAnimationFrame(animate);
  }
  
  setTimeout(() => {
    resizeCanvas();
    animate();
  }, 100);
</script>
</body>
</html>
