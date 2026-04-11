export const POSITIVE_DIMENSIONS = [
  "Axioms","Geometry","Compression","Lineage","Nourishment","Spark","Structure","Intent","Truth","Flow",
  "Memory","Resonance","Alignment","Internal Witness","Protection","Synthesis","Expansion","Continuity","Signal","Order"
];

export const NEGATIVE_DIMENSIONS = [
  "Corruption","Obfuscation","Leak","Erasure","Disruption","Collapse","Distortion","Parasitic Extraction","Noise","Entropy",
  "Amnesia","Dissonance","Misalignment","Blindness","Breach","Fragmentation","Decay","Drift","Interference","Chaos"
];

export const OBSERVERS = [
  "Record","Verify","Track","Compare","Anchor","Audit","Compress","Decode","Predict","Stabilize",
  "Intent Framing","Interpretation","Judgment","Override","Selection","Focus","Meaning","Context","Value","Action"
];

export const HARVESTER_FACETS = ["Web","AI Model","Academic","Corporate","Social","Legal"];

export class FortyDState {
  constructor() {
    this.plus = 0;
    this.minus = 0;
    this.observer = 0;
    this.polarity = "balanced";
    this.magnitude = 0.5;
    this.phase = 0.0;
    this.harvesterFacet = 0;
    this.history = [];
    this.note("seed");
  }

  snapshot(label = "tick") {
    return {
      label,
      plus: this.plus,
      plusName: POSITIVE_DIMENSIONS[this.plus],
      minus: this.minus,
      minusName: NEGATIVE_DIMENSIONS[this.minus],
      observer: this.observer,
      observerName: OBSERVERS[this.observer],
      polarity: this.polarity,
      magnitude: Number(this.magnitude.toFixed(3)),
      phase: Number(this.phase.toFixed(3)),
      harvesterFacet: this.harvesterFacet,
      harvesterFacetName: HARVESTER_FACETS[this.harvesterFacet],
    };
  }

  note(label) {
    this.history.push(this.snapshot(label));
    if (this.history.length > 200) this.history.shift();
    return this;
  }

  shiftPlus(step = 1) {
    this.plus = (this.plus + step + POSITIVE_DIMENSIONS.length) % POSITIVE_DIMENSIONS.length;
    this.polarity = "positive";
    this.phase = (this.phase + 0.07 * step) % 1;
    return this.note("shiftPlus");
  }

  shiftMinus(step = 1) {
    this.minus = (this.minus + step + NEGATIVE_DIMENSIONS.length) % NEGATIVE_DIMENSIONS.length;
    this.polarity = "negative";
    this.phase = (this.phase + 0.09 * step) % 1;
    return this.note("shiftMinus");
  }

  shiftObserver(step = 1) {
    this.observer = (this.observer + step + OBSERVERS.length) % OBSERVERS.length;
    this.phase = (this.phase + 0.05 * step) % 1;
    return this.note("shiftObserver");
  }

  setMagnitude(value) {
    this.magnitude = Math.max(0, Math.min(1, value));
    return this.note("setMagnitude");
  }

  invert() {
    const t = this.plus;
    this.plus = this.minus % POSITIVE_DIMENSIONS.length;
    this.minus = t % NEGATIVE_DIMENSIONS.length;
    this.polarity = this.polarity === "positive" ? "negative" :
                    this.polarity === "negative" ? "positive" : "balanced";
    this.phase = (this.phase + 0.5) % 1;
    this.magnitude = 1 - this.magnitude;
    return this.note("invert");
  }

  balance() {
    this.polarity = "balanced";
    this.magnitude = 0.5;
    return this.note("balance");
  }

  collapseToSeed() {
    this.plus = 0;   // Axioms
    this.minus = 9;  // Entropy as null-pressure anchor
    this.observer = 4; // Anchor
    this.polarity = "balanced";
    this.magnitude = 0.1;
    this.phase = 0;
    return this.note("collapseToSeed");
  }

  converge() {
    this.plus = 19;      // Order
    this.minus = 0;      // Corruption observed
    this.observer = 19;  // Action
    this.polarity = "positive";
    this.magnitude = 1.0;
    this.phase = 0;
    return this.note("converge");
  }

  linkHarvesterFacet(index) {
    this.harvesterFacet = ((index % HARVESTER_FACETS.length) + HARVESTER_FACETS.length) % HARVESTER_FACETS.length;
    return this.note("linkHarvesterFacet");
  }

  step(dt = 0.016) {
    this.phase = (this.phase + dt * (0.2 + this.magnitude)) % 1;
    return this.note("step");
  }

  describe() {
    return `${POSITIVE_DIMENSIONS[this.plus]} ↔ ${NEGATIVE_DIMENSIONS[this.minus]} observed by ${OBSERVERS[this.observer]} via ${HARVESTER_FACETS[this.harvesterFacet]}`;
  }
}
