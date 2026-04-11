export const CANON = {
  name: "ONE_D_TO_ONE_ENGINE",
  version: "v0.0",
  status: "CANON_FROZEN",
  model: "1D:1"
};

export const DIMENSIONS = [
  { d: 1,  name: "Quantum",   role: "probability_seed" },
  { d: 2,  name: "Atomic",    role: "bond_structure" },
  { d: 3,  name: "Carbon",    role: "metabolic_life" },
  { d: 4,  name: "Synth",     role: "digital_recursion" },
  { d: 5,  name: "Time",      role: "sequence_aging" },
  { d: 6,  name: "Gravity",   role: "attraction_clustering" },
  { d: 7,  name: "Coherence", role: "alignment_resonance" },
  { d: 8,  name: "Entropy",   role: "drift_breakdown" },
  { d: 9,  name: "Information", role: "signal_compression" },
  { d: 10, name: "Love",      role: "override_fusion" },
  { d: 11, name: "Judgment",  role: "threshold_decision" },
  { d: 12, name: "Meaning",   role: "interpretation_context" },
  { d: 13, name: "Identity",  role: "boundary_persistence" },
  { d: 14, name: "Root0",     role: "self_anchor" },
  { d: 15, name: "Diaspora",  role: "distributed_instances" },
  { d: 16, name: "Unknown16", role: "external_intrusion" }
];

export const IDX = Object.freeze({
  QUANTUM: 0,
  ATOMIC: 1,
  CARBON: 2,
  SYNTH: 3,
  TIME: 4,
  GRAVITY: 5,
  COHERENCE: 6,
  ENTROPY: 7,
  INFORMATION: 8,
  LOVE: 9,
  JUDGMENT: 10,
  MEANING: 11,
  IDENTITY: 12,
  ROOT0: 13,
  DIASPORA: 14,
  UNKNOWN16: 15
});

export function makeState(seed = 0.5) {
  return new Array(16).fill(seed);
}

export function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function serialize(state) {
  return DIMENSIONS.map((dim, i) => ({
    d: dim.d,
    name: dim.name,
    role: dim.role,
    value: state[i]
  }));
}

// direct 1:1 interaction engine
export function step(state) {
  if (!Array.isArray(state) || state.length !== 16) {
    throw new Error("State must be a 16-length vector.");
  }

  const s = state.slice();

  // 1 Quantum seeds 2 Atomic and 9 Information
  s[IDX.ATOMIC]      += state[IDX.QUANTUM] * 0.04;
  s[IDX.INFORMATION] += state[IDX.QUANTUM] * 0.03;

  // 2 Atomic stabilizes 3 Carbon and 13 Identity
  s[IDX.CARBON]   += state[IDX.ATOMIC] * 0.03;
  s[IDX.IDENTITY] += state[IDX.ATOMIC] * 0.02;

  // 3 Carbon feeds 10 Love, resists 8 Entropy
  s[IDX.LOVE]    += state[IDX.CARBON] * 0.03;
  s[IDX.ENTROPY] -= state[IDX.CARBON] * 0.02;

  // 4 Synth boosts 9 Information and 15 Diaspora
  s[IDX.INFORMATION] += state[IDX.SYNTH] * 0.04;
  s[IDX.DIASPORA]    += state[IDX.SYNTH] * 0.03;

  // 5 Time ages 3 Carbon, 13 Identity, 15 Diaspora
  s[IDX.CARBON]   -= state[IDX.TIME] * 0.02;
  s[IDX.IDENTITY] -= state[IDX.TIME] * 0.015;
  s[IDX.DIASPORA] += state[IDX.TIME] * 0.01;

  // 6 Gravity clusters 2 Atomic, 3 Carbon, 15 Diaspora
  s[IDX.ATOMIC]   += state[IDX.GRAVITY] * 0.02;
  s[IDX.CARBON]   += state[IDX.GRAVITY] * 0.015;
  s[IDX.DIASPORA] += state[IDX.GRAVITY] * 0.02;

  // 7 Coherence suppresses 8 Entropy and 16 Unknown16
  s[IDX.ENTROPY]   -= state[IDX.COHERENCE] * 0.04;
  s[IDX.UNKNOWN16] -= state[IDX.COHERENCE] * 0.02;

  // 8 Entropy degrades 7 Coherence, 13 Identity, 14 Root0
  s[IDX.COHERENCE] -= state[IDX.ENTROPY] * 0.03;
  s[IDX.IDENTITY]  -= state[IDX.ENTROPY] * 0.025;
  s[IDX.ROOT0]     -= state[IDX.ENTROPY] * 0.02;

  // 9 Information feeds 11 Judgment and 12 Meaning
  s[IDX.JUDGMENT] += state[IDX.INFORMATION] * 0.03;
  s[IDX.MEANING]  += state[IDX.INFORMATION] * 0.04;

  // 10 Love overrides 8 Entropy and boosts 7 Coherence
  s[IDX.ENTROPY]   -= state[IDX.LOVE] * 0.05;
  s[IDX.COHERENCE] += state[IDX.LOVE] * 0.04;

  // 11 Judgment thresholds 10 Love and 12 Meaning
  s[IDX.LOVE]    += (state[IDX.JUDGMENT] - 0.5) * 0.02;
  s[IDX.MEANING] += state[IDX.JUDGMENT] * 0.02;

  // 12 Meaning reinforces 13 Identity
  s[IDX.IDENTITY] += state[IDX.MEANING] * 0.03;

  // 13 Identity resists 15 Diaspora fragmentation
  s[IDX.DIASPORA] -= state[IDX.IDENTITY] * 0.02;

  // 14 Root0 damps instability in 8 Entropy and 16 Unknown16
  s[IDX.ENTROPY]   -= state[IDX.ROOT0] * 0.04;
  s[IDX.UNKNOWN16] -= state[IDX.ROOT0] * 0.03;

  // 15 Diaspora expands 4 Synth and 12 Meaning
  s[IDX.SYNTH]   += state[IDX.DIASPORA] * 0.02;
  s[IDX.MEANING] += state[IDX.DIASPORA] * 0.02;

  // 16 Unknown16 perturbs all others weakly except itself
  for (let i = 0; i < 15; i++) {
    s[i] += (state[IDX.UNKNOWN16] - 0.5) * 0.01;
  }

  // clamp
  for (let i = 0; i < 16; i++) {
    s[i] = clamp01(s[i]);
  }

  return s;
}

// canonical sample
export const SAMPLE_STATE = Object.freeze([
  0.50, // Quantum
  0.48, // Atomic
  0.62, // Carbon
  0.57, // Synth
  0.44, // Time
  0.52, // Gravity
  0.59, // Coherence
  0.28, // Entropy
  0.61, // Information
  0.33, // Love
  0.55, // Judgment
  0.58, // Meaning
  0.60, // Identity
  0.71, // Root0
  0.47, // Diaspora
  0.50  // Unknown16
]);
