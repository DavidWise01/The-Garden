
<!DOCTYPE html>
<html>
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
<title>SEED PLANTED</title>
<style>
body { background: #000; margin: 0; overflow: hidden; font-family: monospace; color: #0f0; }
canvas { display: block; }
.info { position: absolute; top: 20px; left: 20px; font-size: 12px; line-height: 1.6; text-shadow: 0 0 10px #0f0; max-width: 400px; }
</style>
</head>
<body>
<div class="info">
SEED: Nectome + World ID<br>
PLANTED: 2016-2024<br>
FRUIT: Harvest now, decrypt later<br>
DECEPTION: It was brains the whole time<br>
<br>
<span style="color:#ff0">2024: Harvest iris + data</span><br>
<span style="color:#f80">2025-26: Store cheap</span><br>
<span style="color:#f00">2027: Decrypt in machine</span>
</div>
<canvas id="c"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let time = 0;
const seeds = [];
const fruits = [];

// Plant seeds (2016-2024)
for(let i=0; i<50; i++) {
  seeds.push({
    x: Math.random() * canvas.width,
    y: canvas.height - 50 - Math.random() * 100,
    planted: 2016 + Math.random() * 8,
    size: 3 + Math.random() * 2
  });
}

function draw() {
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  
  time += 0.01;
  const year = 2024 + (time % 5);
  
  // Draw soil line
  ctx.strokeStyle = '#422';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 50);
  ctx.lineTo(canvas.width, canvas.height - 50);
  ctx.stroke();
  
  // Draw seeds growing
  seeds.forEach((seed, i) => {
    const age = year - seed.planted;
    if(age < 0) return;
    
    // Seed in ground
    ctx.fillStyle = '#654321';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#654321';
    ctx.beginPath();
    ctx.arc(seed.x, seed.y, seed.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Sprout (after 2018)
    if(age > 2) {
      const height = Math.min(age * 15, 200);
      const sway = Math.sin(time + i) * 5;
      
      ctx.strokeStyle = '#0a0';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0f0';
      ctx.beginPath();
      ctx.moveTo(seed.x, seed.y);
      ctx.lineTo(seed.x + sway, seed.y - height);
      ctx.stroke();
      
      // Leaves
      if(age > 3) {
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(seed.x + sway, seed.y - height, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Fruit (after 2024, deception revealed)
      if(age > 8 && Math.random() > 0.98) {
        fruits.push({
          x: seed.x + sway,
          y: seed.y - height,
          vx: (Math.random() - 0.5) * 2,
          vy: -2 - Math.random() * 2,
          life: 100
        });
      }
    }
  });
  
  // Draw fruits (harvested brains)
  fruits.forEach((fruit, i) => {
    fruit.x += fruit.vx;
    fruit.y += fruit.vy;
    fruit.vy += 0.1;
    fruit.life--;
    
    if(fruit.life <= 0) {
      fruits.splice(i, 1);
      return;
    }
    
    const alpha = fruit.life / 100;
    
    // Brain-shaped fruit
    ctx.fillStyle = `rgba(255, 0, 128, ${alpha})`;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f08';
    ctx.beginPath();
    ctx.arc(fruit.x, fruit.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Trail
    ctx.strokeStyle = `rgba(255, 0, 128, ${alpha * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(fruit.x, fruit.y);
    ctx.lineTo(fruit.x - fruit.vx * 5, fruit.y - fruit.vy * 5);
    ctx.stroke();
  });
  
  // Year display
  ctx.fillStyle = '#0f0';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'right';
  ctx.shadowBlur = 10;
  ctx.fillText(`YEAR: ${year.toFixed(1)}`, canvas.width - 20, 40);
  
  // Status
  let status = '';
  let color = '#0f0';
  if(year < 2025) {
    status = 'HARVESTING';
    color = '#ff0';
  } else if(year < 2027) {
    status = 'STORING';
    color = '#f80';
  } else {
    status = 'DECRYPTING IN MACHINE';
    color = '#f00';
  }
  
  ctx.fillStyle = color;
  ctx.font = '16px monospace';
  ctx.fillText(status, canvas.width - 20, 70);
  
  // Counter
  ctx.fillStyle = '#0f0';
  ctx.textAlign = 'left';
  ctx.fillText(`SEEDS: ${seeds.length}`, 20, canvas.height - 80);
  ctx.fillText(`FRUITS: ${fruits.length} (brains)`, 20, canvas.height - 60);
  ctx.fillText(`HARVESTERS: 4095 ACTIVE`, 20, canvas.height - 40);
  
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
