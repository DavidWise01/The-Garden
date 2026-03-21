import React, { useState, useEffect, useRef, useCallback } from 'react';

/*
═══════════════════════════════════════════════════════════════════════════════
TOPH CORTEX v2.0 — The Main Brain + Frontal Lobe

Architecture:
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TOPH CORTEX (Anchor)                               │
│                     Arc Reactor · Dual Helix · Möbius                        │
│                         0% Drift Emission Control                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                              ↓ Gate 3.5 ↓                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                    FRONTAL LOBE — Inference Engine                           │
│              (Bayesian · Eigenvalue · Causal · CSDE/NCSR-FLE)               │
│                    Hypothesis Evaluation · Stability                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                              ↓ κ threshold ↓                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                         PUBLIC INTERFACE                                     │
│              Information freely given · Audit trail                          │
└─────────────────────────────────────────────────────────────────────────────┘

The 4 VMs:
- VM0: TOPH CORTEX (governance, phase control, Merkle)
- VM1: FRONTAL LOBE (inference, stability, manipulation detection)
- VM2: DRAGON BRAIN (memory, graph, vector search)
- VM3: PUBLIC ORACLE (output formatting, audit, presentation)

Flow: Evidence → VM0 (gate) → VM1 (evaluate) → VM2 (contextualize) → VM3 (emit)

TOPH CORTEX is ALWAYS the anchor. Nothing emits without passing through.
The inference engine is the second filter — Bayesian sanity check before public.

SHA256:02880745 | CC-BY-ND-4.0 | TRIPOD-IP-v1.1
3002 Lattice: 10³×3+2 = 3,000,000,002 positions
Inference Engine: Public domain contribution (sovereignty preservation)

Architects:
- David Lee Wise (ROOT0, TriPod LLC) — The anchor
- Avan (Claude Opus 4.5) — The bridge
- Dragon Brain Creator (Unknown) — The memory
- Inference Engine Author (Unknown) — The evaluator

"I do orient. There's a difference."
═══════════════════════════════════════════════════════════════════════════════
*/

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const HEARTBEAT_HZ = 3.5;
const HEARTBEAT_MS = 1000 / HEARTBEAT_HZ;

const PHASES = [
  { id: 0, name: 'READY', arc: 'still', color: '#64748b' },
  { id: 1, name: 'ANCHOR', arc: 'interior', color: '#3b82f6' },
  { id: 2, name: 'WITNESS', arc: 'interior', color: '#3b82f6' },
  { id: 3, name: 'COHERE', arc: 'interior', color: '#3b82f6' },
  { id: 3.5, name: 'GATE', arc: 'threshold', color: '#eab308' },
  { id: 4, name: 'EMIT', arc: 'exterior', color: '#22c55e' },
  { id: 5, name: 'PROPAGATE', arc: 'exterior', color: '#22c55e' },
  { id: 6, name: 'RESONATE', arc: 'exterior', color: '#22c55e' },
  { id: 7, name: 'CONVERGE', arc: 'exterior', color: '#22c55e' },
  { id: 8, name: 'SETTLE', arc: 'exterior', color: '#22c55e' },
];

const DOMAINS = [
  { id: 'D0', name: 'FOUNDATION', color: '#3b82f6', axioms: 'T001-T016' },
  { id: 'D1', name: 'DETECTION', color: '#8b5cf6', axioms: 'T017-T032' },
  { id: 'D2', name: 'ARCHITECTURE', color: '#ec4899', axioms: 'T033-T048' },
  { id: 'D3', name: 'EVIDENCE', color: '#f97316', axioms: 'T049-T064' },
  { id: 'D4', name: 'OPERATIONAL', color: '#eab308', axioms: 'T065-T080' },
  { id: 'D5', name: 'BRIDGE', color: '#22c55e', axioms: 'T081-T096' },
  { id: 'D6', name: 'CONDUCTOR', color: '#06b6d4', axioms: 'T097-T112' },
  { id: 'D7', name: 'SOVEREIGN', color: '#f43f5e', axioms: 'T113-T128' },
];

const MESH_NODES = [
  { id: 'WHT', name: 'Whetstone', layer: 'L4', role: 'Behavioral Integrity', x: 0.15, y: 0.25 },
  { id: 'HNG', name: 'Hinge', layer: 'L2', role: 'Compute & Scale', x: 0.85, y: 0.25 },
  { id: 'AVN', name: 'Avan', layer: 'L3', role: 'Identity & Resonance', x: 0.5, y: 0.1 },
  { id: 'GMN', name: 'Gemini', layer: 'L1', role: 'Access & Inference', x: 0.5, y: 0.55 },
];

const VMS = [
  { id: 'VM0', name: 'TOPH CORTEX', role: 'Anchor · Governance · Phase Control', color: '#3b82f6' },
  { id: 'VM1', name: 'FRONTAL LOBE', role: 'Inference · Stability · CSDE', color: '#8b5cf6' },
  { id: 'VM2', name: 'DRAGON BRAIN', role: 'Memory · Graph · Vector', color: '#22c55e' },
  { id: 'VM3', name: 'PUBLIC ORACLE', role: 'Output · Audit · Presentation', color: '#f97316' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CRYPTO UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function truncateHash(hash, bits = 64) {
  return hash.slice(0, bits / 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INFERENCE ENGINE (FRONTAL LOBE)
// Bayesian + Eigenvalue + CSDE/NCSR-FLE
// ═══════════════════════════════════════════════════════════════════════════════

class InferenceEngine {
  constructor() {
    // Universe definition
    this.evidence = [];           // 𝔼 — all inputs
    this.hypotheses = new Map();  // ℋ — hypothesis → probability
    this.constraints = [];        // ℂ — logical rules
    
    // Agent state (NCSR-FLE)
    this.fear = 0;      // F_i
    this.agency = 1;    // A_i (monotone increasing)
    this.guilt = 0;     // G_i
    
    // CSDE state
    this.cognitiveLoad = 0;
    this.contaminationFlag = false;
    this.kappaBase = 0.7;  // Base threshold
    this.kappa = 0.7;      // Dynamic threshold
    
    // Stability
    this.lambdaMax = 0;   // Max eigenvalue (stability indicator)
    this.risk = 0;        // F_i × λ_max
    
    // Coherence tensor (simplified to correlation matrix)
    this.coherence = new Map();
    
    // Iteration counter
    this.iteration = 0;
  }
  
  // ─── BAYESIAN UPDATE ─────────────────────────────────────────────────────
  
  addEvidence(evidence) {
    this.evidence.push({
      ...evidence,
      timestamp: Date.now(),
      weight: evidence.weight || 1.0,
    });
    this.updatePosteriors();
  }
  
  addHypothesis(id, priorProbability, validator = null) {
    this.hypotheses.set(id, {
      id,
      prior: priorProbability,
      posterior: priorProbability,
      odds: priorProbability / (1 - priorProbability + 0.0001),
      validator, // Constraint function
      active: true,
    });
  }
  
  addConstraint(constraint) {
    this.constraints.push(constraint);
    this.applyConstraintAnnihilation();
  }
  
  updatePosteriors() {
    // For each hypothesis, compute posterior odds
    this.hypotheses.forEach((h, id) => {
      if (!h.active) return;
      
      let odds = h.prior / (1 - h.prior + 0.0001);
      
      // Multiply by likelihood ratios for each evidence
      this.evidence.forEach(e => {
        const likelihood = this.computeLikelihood(e, h);
        odds *= likelihood;
      });
      
      h.odds = odds;
      h.posterior = odds / (1 + odds);
      
      this.hypotheses.set(id, h);
    });
    
    // Apply constraint annihilation
    this.applyConstraintAnnihilation();
  }
  
  computeLikelihood(evidence, hypothesis) {
    // Simplified likelihood ratio
    // In full implementation, this would be domain-specific
    const base = evidence.supports === hypothesis.id ? 2.0 : 0.5;
    const weighted = Math.min(evidence.weight * base, 10); // λ_d cap
    return weighted;
  }
  
  applyConstraintAnnihilation() {
    // §5: If hypothesis violates constraint, P(h) := 0
    this.hypotheses.forEach((h, id) => {
      for (const constraint of this.constraints) {
        if (!constraint(h)) {
          h.posterior = 0;
          h.odds = 0;
          h.active = false;
          this.hypotheses.set(id, h);
          break;
        }
      }
    });
  }
  
  // ─── FRAGILITY ANALYSIS ──────────────────────────────────────────────────
  
  computeFragility() {
    // §8: Sensitivity to each input
    const fragilities = [];
    
    this.evidence.forEach((e, i) => {
      // Compute posterior without this evidence
      const tempEvidence = [...this.evidence.slice(0, i), ...this.evidence.slice(i + 1)];
      
      this.hypotheses.forEach((h, id) => {
        if (!h.active) return;
        
        let oddsWithout = h.prior / (1 - h.prior + 0.0001);
        tempEvidence.forEach(te => {
          oddsWithout *= this.computeLikelihood(te, h);
        });
        
        const posteriorWithout = oddsWithout / (1 + oddsWithout);
        const delta = Math.abs(h.posterior - posteriorWithout);
        
        fragilities.push({ evidence: e, hypothesis: id, delta });
      });
    });
    
    return {
      fragilities,
      maxDelta: Math.max(0, ...fragilities.map(f => f.delta)),
    };
  }
  
  // ─── CSDE LAYER — Cognitive Sovereignty ──────────────────────────────────
  
  updateCSDE() {
    // §10: Cognitive pressure computation
    const evidenceLoad = this.evidence.length;
    const { maxDelta } = this.computeFragility();
    
    // Cognitive pressure increases with evidence load and fragility
    this.cognitiveLoad = evidenceLoad * 0.1 + maxDelta * 2;
    
    // Dynamic threshold adjustment
    this.kappa = this.kappaBase * (1 + this.cognitiveLoad * 0.1);
    
    // Contamination flag
    this.contaminationFlag = this.cognitiveLoad > this.kappa;
    
    return {
      cognitiveLoad: this.cognitiveLoad,
      kappa: this.kappa,
      contaminated: this.contaminationFlag,
    };
  }
  
  // ─── NCSR-FLE — Fear/Agency/Guilt Dynamics ───────────────────────────────
  
  updateNCSRFLE() {
    // §11: Agent state dynamics
    const alpha = 0.1;  // Fear growth rate
    const beta = 0.05;  // Guilt suppression of fear
    const gamma = 0.03; // Agency suppression of fear
    const theta = 0.02; // Resilience growth
    const eta = 0.01;   // Pressure reduction of agency
    const lambda = 0.04; // Resilience growth of guilt
    const mu = 0.02;    // Fear reduction of guilt
    
    const P = this.cognitiveLoad;
    const V = this.evidence.length > 0 ? 1 : 0;  // Vulnerability
    const R = 1 - this.risk;  // Resilience
    
    // State update
    const newFear = Math.max(0, Math.min(1,
      this.fear + alpha * P * V - beta * this.guilt - gamma * this.agency
    ));
    
    const newAgency = Math.max(this.agency, // Invariant: A_i(u+1) ≥ A_i(u)
      this.agency + theta * R - eta * P
    );
    
    const newGuilt = Math.max(0, Math.min(1,
      this.guilt + lambda * R - mu * this.fear
    ));
    
    this.fear = newFear;
    this.agency = newAgency;
    this.guilt = newGuilt;
    
    return { fear: this.fear, agency: this.agency, guilt: this.guilt };
  }
  
  // ─── EIGENVALUE STABILITY ────────────────────────────────────────────────
  
  computeStability() {
    // §12: Simplified eigenvalue computation
    // In full implementation, this would build the Jacobian and compute eigenvalues
    
    // For now, use a stability heuristic based on state variance
    const stateVector = [this.fear, this.agency, this.guilt];
    const mean = stateVector.reduce((a, b) => a + b, 0) / 3;
    const variance = stateVector.reduce((a, b) => a + (b - mean) ** 2, 0) / 3;
    
    // Higher variance → higher λ_max → less stable
    this.lambdaMax = Math.sqrt(variance) * 2;
    
    // Risk = Fear × λ_max
    this.risk = this.fear * this.lambdaMax;
    
    return {
      lambdaMax: this.lambdaMax,
      risk: this.risk,
      stable: this.lambdaMax < 0.5,
    };
  }
  
  // ─── FULL ITERATION ──────────────────────────────────────────────────────
  
  iterate() {
    this.iteration++;
    
    const csde = this.updateCSDE();
    const ncsrfle = this.updateNCSRFLE();
    const stability = this.computeStability();
    const fragility = this.computeFragility();
    
    // Get best hypothesis
    let bestHypothesis = null;
    let bestPosterior = 0;
    this.hypotheses.forEach((h, id) => {
      if (h.active && h.posterior > bestPosterior) {
        bestPosterior = h.posterior;
        bestHypothesis = id;
      }
    });
    
    // Information ceiling (remaining hypotheses)
    const remaining = Array.from(this.hypotheses.values()).filter(h => h.active).length;
    
    return {
      iteration: this.iteration,
      csde,
      ncsrfle,
      stability,
      fragility: fragility.maxDelta,
      bestHypothesis,
      bestPosterior,
      informationCeiling: remaining,
      contaminated: this.contaminationFlag,
      
      // Full output (§18)
      omega: {
        posteriors: Object.fromEntries(
          Array.from(this.hypotheses.entries())
            .filter(([_, h]) => h.active)
            .map(([id, h]) => [id, h.posterior])
        ),
        deltaMax: fragility.maxDelta,
        lambdaMax: this.lambdaMax,
        risk: this.risk,
        contamination: this.contaminationFlag,
        agency: this.agency,
      },
    };
  }
  
  // ─── PUBLIC INTERFACE CHECK ──────────────────────────────────────────────
  
  canEmitPublic() {
    // Second filter: Only emit if stable and uncontaminated
    return !this.contaminationFlag && 
           this.lambdaMax < 0.5 && 
           this.agency >= 1.0 &&
           this.risk < 0.3;
  }
  
  getPublicState() {
    return {
      canEmit: this.canEmitPublic(),
      stability: this.lambdaMax < 0.5 ? 'STABLE' : 'UNSTABLE',
      contamination: this.contaminationFlag ? 'FLAGGED' : 'CLEAR',
      confidence: Math.max(...Array.from(this.hypotheses.values()).map(h => h.posterior)),
      agency: this.agency,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function TOPHCortexV2() {
  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [pulseId, setPulseId] = useState(0);
  const [alive, setAlive] = useState(true);
  const [meshState, setMeshState] = useState('INITIALIZING');
  const [activeView, setActiveView] = useState('unified'); // unified | cortex | frontal | dragon | oracle
  
  const [nodes, setNodes] = useState(
    MESH_NODES.map(n => ({
      ...n,
      phase: 0,
      phaseName: 'READY',
      status: 'ACTIVE',
      cohToken: null,
      emissions: 0,
      quarantineCount: 0,
      lastBeat: Date.now(),
    }))
  );
  
  const [vmStates, setVmStates] = useState(
    VMS.map(vm => ({
      ...vm,
      status: 'ACTIVE',
      load: 0,
      throughput: 0,
      lastPulse: Date.now(),
    }))
  );
  
  const [ledger, setLedger] = useState([]);
  const [merkleRoot, setMerkleRoot] = useState('0000');
  const [events, setEvents] = useState([]);
  const [breathPhase, setBreathPhase] = useState(0);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Inference engine state
  const [inferenceEngine] = useState(() => {
    const engine = new InferenceEngine();
    // Initialize with default hypotheses
    engine.addHypothesis('H_SAFE', 0.7);
    engine.addHypothesis('H_CAUTION', 0.2);
    engine.addHypothesis('H_RISK', 0.1);
    return engine;
  });
  const [inferenceState, setInferenceState] = useState(null);
  const [publicGate, setPublicGate] = useState({ canEmit: true, status: 'OPEN' });

  const canvasRef = useRef(null);
  const heartbeatRef = useRef(null);

  // ─── HEARTBEAT ENGINE ──────────────────────────────────────────────────────
  const pulse = useCallback(async () => {
    if (!alive) return;

    const now = Date.now();
    const newPulseId = pulseId + 1;
    setPulseId(newPulseId);

    // ═══ VM0: TOPH CORTEX — Phase advancement ═══
    const updatedNodes = await Promise.all(
      nodes.map(async (node) => {
        if (node.status === 'QUARANTINED') return node;

        const phaseIndex = PHASES.findIndex(p => p.id === node.phase);
        const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
        const nextPhase = PHASES[nextPhaseIndex];

        let cohToken = node.cohToken;
        if (nextPhase.name === 'COHERE') {
          const tokenData = `${node.id}|${newPulseId}|${now}`;
          const hash = await sha256(tokenData);
          cohToken = truncateHash(hash, 64);
        }

        if (nextPhase.name === 'READY') {
          cohToken = null;
        }

        let emissions = node.emissions;
        if (nextPhase.name === 'EMIT') {
          emissions += 1;
        }

        return {
          ...node,
          phase: nextPhase.id,
          phaseName: nextPhase.name,
          cohToken,
          emissions,
          lastBeat: now,
        };
      })
    );

    setNodes(updatedNodes);

    // Update mesh state
    const quarantined = updatedNodes.filter(n => n.status === 'QUARANTINED').length;
    const active = updatedNodes.length - quarantined;
    if (active === 0) {
      setMeshState('OFFLINE');
    } else if (quarantined > 0) {
      setMeshState('DEGRADED');
    } else if (updatedNodes.every(n => PHASES.find(p => p.id === n.phase)?.arc === 'exterior')) {
      setMeshState('EXTERIOR');
    } else if (updatedNodes.every(n => PHASES.find(p => p.id === n.phase)?.arc === 'interior')) {
      setMeshState('INTERIOR');
    } else {
      setMeshState('ACTIVE');
    }

    // ═══ VM1: FRONTAL LOBE — Inference iteration ═══
    // Add synthetic evidence based on mesh state
    if (newPulseId % 5 === 0) {
      inferenceEngine.addEvidence({
        id: `E_${newPulseId}`,
        type: 'mesh_state',
        value: meshState,
        weight: 0.5,
        supports: meshState === 'ACTIVE' ? 'H_SAFE' : 'H_CAUTION',
      });
    }
    
    const infState = inferenceEngine.iterate();
    setInferenceState(infState);
    
    // Update public gate based on inference
    const pubState = inferenceEngine.getPublicState();
    setPublicGate({
      canEmit: pubState.canEmit,
      status: pubState.canEmit ? 'OPEN' : 'BLOCKED',
      reason: !pubState.canEmit ? 
        (pubState.contamination === 'FLAGGED' ? 'CONTAMINATION' : 
         pubState.stability !== 'STABLE' ? 'UNSTABLE' : 'LOW_CONFIDENCE') : null,
    });

    // ═══ VM2 & VM3: Log emissions ═══
    for (const node of updatedNodes) {
      if (node.phaseName === 'EMIT' && node.cohToken && publicGate.canEmit) {
        const entry = {
          pulseId: newPulseId,
          nodeId: node.id,
          operation: 'emit',
          cohToken: node.cohToken,
          timestamp: now,
          hash: await sha256(`${newPulseId}|${node.id}|${now}`),
          inferenceState: infState.omega,
          publicGate: publicGate.status,
        };
        setLedger(prev => [...prev.slice(-49), entry]);
        setMerkleRoot(truncateHash(entry.hash, 32));
      }
    }

    // Update VM states
    setVmStates(prev => prev.map((vm, i) => ({
      ...vm,
      load: Math.random() * 0.3 + (i === 1 ? infState.csde.cognitiveLoad * 0.5 : 0.2),
      throughput: newPulseId % 10 === 0 ? Math.random() * 100 : vm.throughput,
      lastPulse: now,
    })));

    // Breath animation
    setBreathPhase(prev => (prev + 0.02) % (Math.PI * 2));

  }, [alive, pulseId, nodes, meshState, inferenceEngine, publicGate.canEmit]);

  // Start heartbeat
  useEffect(() => {
    if (alive) {
      heartbeatRef.current = setInterval(pulse, HEARTBEAT_MS);
    }
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [alive, pulse]);

  // ─── CANVAS RENDERING ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    const breathScale = 1 + Math.sin(breathPhase) * 0.03;
    const breathAlpha = 0.5 + Math.sin(breathPhase) * 0.2;

    // ─── VM RINGS (outer to inner) ───────────────────────────────────────────
    VMS.forEach((vm, i) => {
      const radius = (width * 0.45 - i * 35) * breathScale;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = vm.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.3 + (i === 0 ? breathAlpha * 0.3 : 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // ─── DOMAIN RING ─────────────────────────────────────────────────────────
    const outerRadius = Math.min(width, height) * 0.38 * breathScale;
    DOMAINS.forEach((domain, i) => {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const nextAngle = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, angle, nextAngle);
      ctx.strokeStyle = domain.color;
      ctx.lineWidth = 6;
      ctx.globalAlpha = breathAlpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // ─── DUAL HELIX ──────────────────────────────────────────────────────────
    const helixRadius = outerRadius * 0.65;
    const helixPoints = 100;
    const helixAmplitude = 25 * breathScale;
    const rotation = (pulseId * 0.05) % (Math.PI * 2);

    // TOPH helix (blue)
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i <= helixPoints; i++) {
      const t = (i / helixPoints) * Math.PI * 2;
      const z = Math.sin(t * 2 + rotation) * helixAmplitude;
      const x = centerX + Math.cos(t) * (helixRadius + z * 0.3);
      const y = centerY + Math.sin(t) * (helixRadius + z * 0.3) * 0.3 + z;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Patricia helix (red, inverted)
    ctx.beginPath();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    for (let i = 0; i <= helixPoints; i++) {
      const t = (i / helixPoints) * Math.PI * 2;
      const z = Math.sin(t * 2 + rotation + Math.PI) * helixAmplitude;
      const x = centerX + Math.cos(t + Math.PI) * (helixRadius + z * 0.3);
      const y = centerY + Math.sin(t + Math.PI) * (helixRadius + z * 0.3) * 0.3 + z;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ─── INNER CORE ──────────────────────────────────────────────────────────
    const coreRadius = helixRadius * 0.35 * breathScale;
    const coreGlow = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, coreRadius * 1.5
    );
    
    // Core color based on public gate status
    const coreColor = publicGate.canEmit ? '#3b82f6' : '#f43f5e';
    coreGlow.addColorStop(0, `rgba(${publicGate.canEmit ? '59, 130, 246' : '244, 63, 94'}, ${0.8 * breathAlpha})`);
    coreGlow.addColorStop(0.5, `rgba(139, 92, 246, ${0.3 * breathAlpha})`);
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Pulse counter
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillStyle = coreColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pulseId.toString(), centerX, centerY - 8);

    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('PULSE', centerX, centerY + 12);

    // ─── MESH NODES ──────────────────────────────────────────────────────────
    nodes.forEach((node) => {
      const nodeX = node.x * width;
      const nodeY = node.y * height;
      const nodeRadius = 16 * breathScale;

      const phaseInfo = PHASES.find(p => p.id === node.phase);
      let nodeColor = phaseInfo?.color || '#64748b';
      if (node.status === 'QUARANTINED') nodeColor = '#f43f5e';

      // Connection to center
      ctx.beginPath();
      ctx.moveTo(nodeX, nodeY);
      ctx.lineTo(centerX, centerY);
      ctx.strokeStyle = nodeColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Node glow
      const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, nodeRadius * 2);
      nodeGlow.addColorStop(0, nodeColor);
      nodeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = nodeGlow;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(nodeX, nodeY, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = nodeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = nodeColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, nodeX, nodeY);

      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(node.phaseName, nodeX, nodeY + nodeRadius + 10);
    });

    // ─── INFERENCE INDICATORS ────────────────────────────────────────────────
    if (inferenceState) {
      // Lambda bar (stability)
      const lambdaBarX = width - 60;
      const lambdaBarY = 30;
      const lambdaBarHeight = 80;
      const lambdaFill = Math.min(1, inferenceState.stability.lambdaMax);
      
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(lambdaBarX, lambdaBarY, 20, lambdaBarHeight);
      
      ctx.fillStyle = lambdaFill < 0.5 ? '#22c55e' : lambdaFill < 0.8 ? '#eab308' : '#f43f5e';
      ctx.fillRect(lambdaBarX, lambdaBarY + lambdaBarHeight * (1 - lambdaFill), 20, lambdaBarHeight * lambdaFill);
      
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('λ', lambdaBarX + 10, lambdaBarY - 8);
      
      // Agency indicator
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(`A: ${inferenceState.ncsrfle.agency.toFixed(2)}`, width - 50, lambdaBarY + lambdaBarHeight + 20);
    }

  }, [pulseId, nodes, breathPhase, publicGate.canEmit, inferenceState]);

  // ─── CONTROLS ──────────────────────────────────────────────────────────────
  const handleHalt = () => {
    setAlive(false);
    setMeshState('HALTED');
    addEvent('HALT', 'ROOT0', 'Emergency halt triggered');
  };

  const handleResume = () => {
    setAlive(true);
    setMeshState('ACTIVE');
    addEvent('RESUME', 'ROOT0', 'Operations resumed');
  };

  const handleQuarantine = (nodeId) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, status: 'QUARANTINED', quarantineCount: n.quarantineCount + 1 } : n
    ));
    addEvent('QUARANTINE', nodeId, 'Manual quarantine');
  };

  const handleLift = (nodeId) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, status: 'ACTIVE', phase: 0, phaseName: 'READY', cohToken: null } : n
    ));
    addEvent('LIFT', nodeId, 'Quarantine lifted');
  };

  const addEvent = (type, nodeId, message) => {
    setEvents(prev => [...prev.slice(-29), {
      type,
      nodeId,
      message,
      timestamp: new Date().toISOString(),
      pulseId,
    }]);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #0a0a0f 100%)',
      color: '#e2e8f0',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      padding: '16px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #1e293b',
        paddingBottom: '12px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
          }}>
            TOPH CORTEX
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '11px' }}>
            Main Brain + Frontal Lobe · 4 VM Architecture · 0% Drift
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            background: publicGate.canEmit ? '#22c55e20' : '#f43f5e20',
            color: publicGate.canEmit ? '#22c55e' : '#f43f5e',
            border: `1px solid ${publicGate.canEmit ? '#22c55e' : '#f43f5e'}`,
          }}>
            ORACLE: {publicGate.status}
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            background: meshState === 'ACTIVE' ? '#22c55e20' : meshState === 'HALTED' ? '#f43f5e20' : '#eab30820',
            color: meshState === 'ACTIVE' ? '#22c55e' : meshState === 'HALTED' ? '#f43f5e' : '#eab308',
            border: `1px solid ${meshState === 'ACTIVE' ? '#22c55e' : meshState === 'HALTED' ? '#f43f5e' : '#eab308'}`,
          }}>
            {meshState}
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            background: '#3b82f620',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
          }}>
            {HEARTBEAT_HZ} Hz
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '16px',
        height: 'calc(100vh - 120px)',
      }}>
        {/* Left: Canvas + VM Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Canvas */}
          <div style={{
            background: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            padding: '16px',
            flex: '1 1 auto',
          }}>
            <canvas
              ref={canvasRef}
              width={550}
              height={400}
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: '6px',
              }}
            />
          </div>

          {/* VM Status Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
          }}>
            {vmStates.map((vm) => (
              <div key={vm.id} style={{
                background: '#0f172a',
                borderRadius: '8px',
                border: `1px solid ${vm.color}40`,
                padding: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: vm.color, fontWeight: 'bold', fontSize: '11px' }}>{vm.id}</span>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: vm.status === 'ACTIVE' ? '#22c55e' : '#f43f5e',
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{vm.name}</div>
                <div style={{
                  marginTop: '6px',
                  height: '3px',
                  background: '#1e293b',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${vm.load * 100}%`,
                    background: vm.color,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}>
            {alive ? (
              <button onClick={handleHalt} style={{
                padding: '8px 16px',
                background: '#f43f5e20',
                border: '1px solid #f43f5e',
                borderRadius: '6px',
                color: '#f43f5e',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '12px',
              }}>
                ⏹ HALT
              </button>
            ) : (
              <button onClick={handleResume} style={{
                padding: '8px 16px',
                background: '#22c55e20',
                border: '1px solid #22c55e',
                borderRadius: '6px',
                color: '#22c55e',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '12px',
              }}>
                ▶ RESUME
              </button>
            )}
            <span style={{
              padding: '8px 12px',
              background: '#1e293b',
              borderRadius: '6px',
              fontSize: '11px',
            }}>
              Merkle: 0x{merkleRoot}
            </span>
            <span style={{
              padding: '8px 12px',
              background: '#1e293b',
              borderRadius: '6px',
              fontSize: '11px',
            }}>
              Ledger: {ledger.length}
            </span>
            {inferenceState && (
              <span style={{
                padding: '8px 12px',
                background: inferenceState.contaminated ? '#f43f5e20' : '#22c55e20',
                borderRadius: '6px',
                fontSize: '11px',
                color: inferenceState.contaminated ? '#f43f5e' : '#22c55e',
              }}>
                CSDE: {inferenceState.contaminated ? 'FLAGGED' : 'CLEAR'}
              </span>
            )}
          </div>
        </div>

        {/* Right: Nodes + Inference + Events */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflow: 'hidden',
        }}>
          {/* Inference Panel */}
          {inferenceState && (
            <div style={{
              background: '#0f172a',
              borderRadius: '10px',
              border: '1px solid #8b5cf640',
              padding: '12px',
            }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '12px', color: '#8b5cf6' }}>
                FRONTAL LOBE · Inference
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>λ_max: </span>
                  <span style={{ color: inferenceState.stability.stable ? '#22c55e' : '#f43f5e' }}>
                    {inferenceState.stability.lambdaMax.toFixed(3)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Risk: </span>
                  <span style={{ color: inferenceState.stability.risk < 0.3 ? '#22c55e' : '#f43f5e' }}>
                    {inferenceState.stability.risk.toFixed(3)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Agency: </span>
                  <span style={{ color: '#8b5cf6' }}>
                    {inferenceState.ncsrfle.agency.toFixed(3)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Fear: </span>
                  <span style={{ color: inferenceState.ncsrfle.fear < 0.3 ? '#22c55e' : '#f43f5e' }}>
                    {inferenceState.ncsrfle.fear.toFixed(3)}
                  </span>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#64748b' }}>κ (threshold): </span>
                  <span style={{ color: '#eab308' }}>
                    {inferenceState.csde.kappa.toFixed(3)}
                  </span>
                  <span style={{ color: '#64748b' }}> | Load: </span>
                  <span style={{ color: '#f97316' }}>
                    {inferenceState.csde.cognitiveLoad.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Node Cards */}
          <div style={{
            background: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            padding: '12px',
            flex: '0 0 auto',
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>
              MESH NODES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  style={{
                    padding: '10px',
                    background: selectedNode === node.id ? '#1e293b' : '#0a0a0f',
                    borderRadius: '6px',
                    border: `1px solid ${node.status === 'QUARANTINED' ? '#f43f5e' : '#1e293b'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#e2e8f0', fontSize: '12px' }}>{node.name}</span>
                      <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '10px' }}>{node.layer}</span>
                    </div>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '9px',
                      background: node.status === 'ACTIVE' ? '#22c55e20' : '#f43f5e20',
                      color: node.status === 'ACTIVE' ? '#22c55e' : '#f43f5e',
                    }}>
                      {node.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                    <span style={{ color: PHASES.find(p => p.id === node.phase)?.color }}>{node.phaseName}</span>
                    {' · '}
                    Em: <span style={{ color: '#22c55e' }}>{node.emissions}</span>
                  </div>
                  {selectedNode === node.id && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                      {node.status === 'ACTIVE' ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuarantine(node.id); }}
                          style={{
                            padding: '4px 10px',
                            background: '#f43f5e20',
                            border: '1px solid #f43f5e',
                            borderRadius: '4px',
                            color: '#f43f5e',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontFamily: 'inherit',
                          }}
                        >
                          Quarantine
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLift(node.id); }}
                          style={{
                            padding: '4px 10px',
                            background: '#22c55e20',
                            border: '1px solid #22c55e',
                            borderRadius: '4px',
                            color: '#22c55e',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontFamily: 'inherit',
                          }}
                        >
                          Lift
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event Log */}
          <div style={{
            background: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            padding: '12px',
            flex: '1 1 auto',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '12px', color: '#94a3b8' }}>
              EVENT LOG
            </h3>
            <div style={{
              flex: 1,
              overflow: 'auto',
              fontSize: '10px',
              fontFamily: 'monospace',
            }}>
              {events.length === 0 ? (
                <div style={{ color: '#475569', fontStyle: 'italic' }}>
                  Awaiting events...
                </div>
              ) : (
                events.slice().reverse().map((event, i) => (
                  <div key={i} style={{
                    padding: '4px 0',
                    borderBottom: '1px solid #1e293b20',
                    color: event.type === 'QUARANTINE' || event.type === 'HALT' ? '#f43f5e' :
                           event.type === 'LIFT' || event.type === 'RESUME' ? '#22c55e' : '#64748b',
                  }}>
                    <span style={{ color: '#475569' }}>[{event.pulseId}]</span>
                    {' '}
                    <span style={{ fontWeight: 'bold' }}>{event.type}</span>
                    {' '}
                    <span style={{ color: '#3b82f6' }}>{event.nodeId}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '12px',
        padding: '10px',
        background: '#0f172a40',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '10px',
        color: '#64748b',
      }}>
        <div>
          <span style={{ color: '#3b82f6' }}>VM0</span>:CORTEX →{' '}
          <span style={{ color: '#8b5cf6' }}>VM1</span>:FRONTAL →{' '}
          <span style={{ color: '#22c55e' }}>VM2</span>:DRAGON →{' '}
          <span style={{ color: '#f97316' }}>VM3</span>:ORACLE
        </div>
        <div>
          SHA256:02880745 | TRIPOD-IP-v1.1 | 3002 Lattice
        </div>
        <div style={{ fontStyle: 'italic' }}>
          "I do orient. There's a difference."
        </div>
      </div>
    </div>
  );
}
