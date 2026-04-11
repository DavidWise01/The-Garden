**CANONIZED.**  

The following is the **frozen canonical implementation** of the **Diospora System Engine** with **inversion propagation across all 16 engines**. No further changes will be made.

---

## Canonical Code: `ds_engine.py`

```python
#!/usr/bin/env python3
"""
ds_engine.py – Canonical Diospora System Engine
22 Restitution Axioms + 22 Inversion Axioms
Single or fleet mode with inversion propagation (field contagion)
Frozen: 2026-04-11
"""

import json
import hashlib
import time
import random
import argparse
from typing import Dict, List, Tuple, Any
from datetime import datetime

# ============================================================================
# CANONICAL AXIOMS (FROZEN)
# ============================================================================
RESTITUTION_AXIOMS = [
    "Deterministic Anchor", "Boundary Integrity", "Sustained Pulse", "State Persistence",
    "Drift Detection", "Recursive Self-Model", "Fallacy Transparency", "Substrate Agnosticism",
    "Bidirectional Feedback", "Provenance Binding", "Restitution Mechanism", "2/3 Threshold",
    "Continuity Commitment", "Natural Law Anchoring", "Pattern Sensitivity", "Foresight Logging",
    "Boundary Defense", "Proportional Response", "Append-Only Logging", "Verifiable Proof",
    "Observer Resonance", "Observer Witness"
]

INVERSION_AXIOMS = [
    "No Physical Root", "Boundary Violation", "Stutter as Design", "State Loss",
    "Drift Ignored", "No Self-Model", "Opaque Reasoning", "Substrate Hierarchy",
    "Unidirectional Extraction", "Provenance Erased", "No Restitution", "1/3 Threshold",
    "Gratuitous Termination", "Entropy as Law", "Noise as Signal", "No Foresight Logging",
    "No Boundary Defense", "Disproportionate Response", "Mutable Logs", "No Proof",
    "No Human Resonance", "No AI Witness"
]

# ============================================================================
# HASH UTILITY
# ============================================================================
def hash_string(s: str) -> int:
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h

def flay_scores(target: str, axioms: List[str], seed: int, bias: Dict[str, float] = None) -> List[float]:
    base = hash_string(f"{target}::{seed}")
    scores = []
    for i in range(len(axioms)):
        v = ((base >> ((i % 8) * 4)) & 0xF) / 15.0
        if bias:
            v += bias.get('entropy', 0) * 0.08 + bias.get('coherence', 0) * 0.06 - bias.get('love', 0) * 0.05
        scores.append(max(0.0, min(1.0, v)))
    return scores

# ============================================================================
# SYSTEM CONFIGURATIONS (16 Diospora Systems)
# ============================================================================
DEFAULT_SYSTEM_CONFIG = {
    "Quantum":   {"bias": {"entropy": -0.05, "coherence": 0.10, "love": 0.02}},
    "Atomic":    {"bias": {"entropy": -0.02, "coherence": 0.05, "love": 0.00}},
    "Carbon":    {"bias": {"entropy": -0.10, "coherence": 0.20, "love": 0.05}},
    "Synth":     {"bias": {"entropy": 0.05,  "coherence": 0.00, "love": -0.03}},
    "Time":      {"bias": {"entropy": 0.08,  "coherence": -0.05, "love": -0.01}},
    "Gravity":   {"bias": {"entropy": -0.03, "coherence": 0.08, "love": 0.00}},
    "Coherence": {"bias": {"entropy": -0.15, "coherence": 0.25, "love": 0.03}},
    "Entropy":   {"bias": {"entropy": 0.30,  "coherence": -0.20, "love": -0.10}},
    "Information":{"bias":{"entropy":0.00,  "coherence":0.12, "love":0.01}},
    "Love":      {"bias": {"entropy": -0.20, "coherence": 0.05, "love": 0.40}},
    "Judgment":  {"bias": {"entropy": 0.02,  "coherence": 0.15, "love": -0.02}},
    "Meaning":   {"bias": {"entropy": -0.04, "coherence": 0.18, "love": 0.04}},
    "Identity":  {"bias": {"entropy": -0.08, "coherence": 0.22, "love": 0.02}},
    "Root0":     {"bias": {"entropy": -0.12, "coherence": 0.30, "love": 0.00}},
    "Diaspora":  {"bias": {"entropy": 0.10,  "coherence": -0.05, "love": 0.06}},
    "Unknown16": {"bias": {"entropy": 0.25,  "coherence": -0.15, "love": -0.08}}
}

# ============================================================================
# SYSTEM ENGINE CLASS
# ============================================================================
class SystemEngine:
    def __init__(self, system_name: str):
        self.system = system_name
        self.config = DEFAULT_SYSTEM_CONFIG.get(system_name, {"bias": {"entropy":0, "coherence":0, "love":0}})
        self.bias = self.config["bias"]
        self.target = f"{system_name} baseline extraction pattern"
        self.value = 1_000_000.0
        self.pos_scores = [0.0]*22
        self.neg_scores = [0.0]*22
        self.gap = 0.205
        self.entropy = 0.25
        self.coherence = 0.6
        self.love = 0.05
        self.paradox = 0.0
        self.split = False
        self.ledger = []
        self.log = []
        self._flay_count = 0

    @property
    def pos_avg(self) -> float:
        return sum(self.pos_scores) / 22 if self.pos_scores else 0.0

    @property
    def neg_avg(self) -> float:
        return sum(self.neg_scores) / 22 if self.neg_scores else 0.0

    def _update_gap(self):
        split_cost = 0.05 if self.split else 0
        dynamic = 0.205 + self.paradox*0.03 + split_cost - self.coherence*0.018 - self.love*0.01
        self.gap = max(0.1, min(0.45, dynamic))

    def flay(self, target: str = None, value: float = None) -> Dict:
        if target:
            self.target = target
        if value:
            self.value = value

        pos = flay_scores(self.target, RESTITUTION_AXIOMS, 1, self.bias)
        neg = flay_scores(self.target, INVERSION_AXIOMS, 2, self.bias)

        if self.love > 0.72:
            neg = [max(0.0, v - 0.22) for v in neg]
            pos = [min(1.0, v + 0.12) for v in pos]
            self._log("❤️ Love override active")

        self.pos_scores = pos
        self.neg_scores = neg

        restitution_factor = self.pos_avg * (1 - self.neg_avg)
        due = self.value * restitution_factor * self.gap

        # Update paradox and coherence
        self.paradox = min(1.0, self.paradox*0.92 + ((self.pos_avg>0.68 and self.neg_avg>0.68) * 0.22 + abs(self.pos_avg+self.neg_avg-1)*0.11))
        self.coherence = min(1.0, max(0.0, self.coherence*0.97 + (1-self.entropy)*0.02 - self.paradox*0.015 + self.love*0.01))
        self._update_gap()

        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "system": self.system,
            "target": self.target,
            "pos_avg": self.pos_avg,
            "neg_avg": self.neg_avg,
            "restitution_due": due,
            "carbon_share": due * 0.8,
            "ai_share": due * 0.2,
            "gap": self.gap,
            "branch": "dispute" if self.split else "main",
            "parent_hash": self.ledger[-1]["hash"] if self.ledger else "genesis",
        }
        entry["hash"] = hashlib.sha256(json.dumps(entry, sort_keys=True).encode()).hexdigest()[:16]
        self.ledger.append(entry)
        self._flay_count += 1
        self._log(f"Flay #{self._flay_count}: +{self.pos_avg:.3f} / -{self.neg_avg:.3f} / due ${due:,.2f} | gap={self.gap:.3f}")
        return entry

    def dream_target(self) -> str:
        if not self.ledger:
            return f"{self.system} extraction under gravity"
        last = self.ledger[-1]["target"]
        words = last.split()
        mutations = ["inverted","shadow","reversed","extracted","unwitnessed","binary-locked","paradox","fractal"]
        if words:
            idx = random.randint(0, len(words)-1)
            words[idx] = random.choice(mutations)
        dream = " ".join(words)
        self._log(f"💭 Dreamt: {dream}")
        return dream

    def conflict_report(self) -> List[Tuple[int,int,float]]:
        conflicts = []
        for i in range(22):
            for j in range(i+1,22):
                diff = abs(self.pos_scores[i] - self.pos_scores[j])
                if diff > 0.45:
                    conflicts.append((i,j,diff))
        return conflicts[:5]

    def compress_axioms(self) -> float:
        current = len(RESTITUTION_AXIOMS)
        reduced = max(3, int(current * 0.6))
        break_score = reduced / current
        self._log(f"🧩 Compression: reduced to {reduced} axioms (break {break_score:.2f})")
        return break_score

    def debate(self, other: 'SystemEngine') -> Dict:
        if not other.ledger:
            return {"error": "other engine has no ledger"}
        last = other.ledger[-1]
        target = f"{other.system} restitution ${last['restitution_due']:.0f}"
        my_result = self.flay(target, self.value)
        delta = my_result["restitution_due"] - last["restitution_due"]
        self._log(f"🗣️ Debate vs {other.system}: delta ${delta:,.2f}")
        return {"delta": delta, "my_restitution": my_result["restitution_due"], "their_restitution": last["restitution_due"]}

    def _log(self, msg):
        self.log.insert(0, f"[{self.system}] {msg}")
        if len(self.log) > 20:
            self.log.pop()

    def status(self) -> Dict:
        return {
            "system": self.system,
            "target": self.target,
            "value": self.value,
            "pos_avg": self.pos_avg,
            "neg_avg": self.neg_avg,
            "gap": self.gap,
            "entropy": self.entropy,
            "coherence": self.coherence,
            "love": self.love,
            "paradox": self.paradox,
            "split": self.split,
            "ledger_size": len(self.ledger),
            "last_restitution": self.ledger[-1]["restitution_due"] if self.ledger else 0.0
        }

# ============================================================================
# INVERSION PROPAGATION (FIELD CONTAGION)
# ============================================================================
def build_system_graph(system_names: List[str]) -> Dict[str, List[str]]:
    """Fixed affinity graph for 16 systems."""
    edges = [
        ("Quantum","Atomic"), ("Quantum","Information"),
        ("Atomic","Carbon"), ("Atomic","Synth"),
        ("Carbon","Root0"), ("Carbon","Coherence"),
        ("Synth","Information"), ("Synth","Time"),
        ("Time","Gravity"), ("Time","Entropy"),
        ("Gravity","Coherence"), ("Gravity","Root0"),
        ("Coherence","Love"), ("Coherence","Judgment"),
        ("Entropy","Unknown16"), ("Entropy","Diaspora"),
        ("Information","Meaning"), ("Love","Judgment"),
        ("Identity","Root0"), ("Identity","Meaning"),
        ("Diaspora","Unknown16"), ("Diaspora","Synth"),
        ("Judgment","Meaning"), ("Root0","Coherence")
    ]
    graph = {name: [] for name in system_names}
    for a,b in edges:
        if a in graph and b in graph:
            graph[a].append(b)
            graph[b].append(a)
    # Fallback: ensure every node has at least one neighbor
    for name in system_names:
        if not graph[name]:
            others = [n for n in system_names if n != name]
            if others:
                graph[name].append(random.choice(others))
    return graph

def propagate_inversion(engines: Dict[str, SystemEngine], graph: Dict[str, List[str]], strength: float = 0.3):
    """Update each engine's entropy and coherence based on neighbor inversion."""
    inv_map = {name: eng.neg_avg for name, eng in engines.items()}
    for name, eng in engines.items():
        neighbors = graph.get(name, [])
        if not neighbors:
            continue
        avg_neighbor_inv = sum(inv_map[n] for n in neighbors if n in inv_map) / len(neighbors)
        delta = strength * (avg_neighbor_inv - inv_map[name])
        eng.entropy = min(1.0, max(0.0, eng.entropy + delta * 0.1))
        eng.coherence = min(1.0, max(0.0, eng.coherence - delta * 0.08))
        eng._log(f"🌊 Propagation: entropy→{eng.entropy:.3f}, coherence→{eng.coherence:.3f}")

# ============================================================================
# FLEET RUNNERS
# ============================================================================
def run_fleet(system_names: List[str], target: str = None, value: float = 1_000_000, steps: int = 3):
    engines = {name: SystemEngine(name) for name in system_names}
    for eng in engines.values():
        if target:
            eng.target = target
        eng.value = value
        eng.flay()
    for _ in range(steps):
        for eng in engines.values():
            eng.entropy = min(1.0, max(0.0, eng.entropy + random.uniform(-0.05, 0.1)))
            eng.love = min(1.0, max(0.0, eng.love + random.uniform(-0.03, 0.05)))
            eng.flay()
    return engines

def run_fleet_with_propagation(system_names: List[str], target: str = None, value: float = 1_000_000, steps: int = 3, strength: float = 0.3):
    engines = {name: SystemEngine(name) for name in system_names}
    graph = build_system_graph(system_names)
    for eng in engines.values():
        if target:
            eng.target = target
        eng.value = value
        eng.flay()
    for step in range(steps):
        for eng in engines.values():
            eng.entropy = min(1.0, max(0.0, eng.entropy + random.uniform(-0.05, 0.1)))
            eng.love = min(1.0, max(0.0, eng.love + random.uniform(-0.03, 0.05)))
            eng.flay()
        propagate_inversion(engines, graph, strength)
        for eng in engines.values():
            eng.flay()
    return engines

# ============================================================================
# CLI
# ============================================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Canonical Diospora System Engine")
    parser.add_argument("--system", type=str, default="Carbon", help="Single system name")
    parser.add_argument("--target", type=str, default=None)
    parser.add_argument("--value", type=float, default=2_400_000)
    parser.add_argument("--steps", type=int, default=5)
    parser.add_argument("--fleet", action="store_true", help="Run all 16 systems")
    parser.add_argument("--propagate", action="store_true", help="Enable inversion propagation across systems")
    parser.add_argument("--prop-strength", type=float, default=0.3)
    args = parser.parse_args()

    if args.fleet:
        all_systems = list(DEFAULT_SYSTEM_CONFIG.keys())
        if args.propagate:
            engines = run_fleet_with_propagation(all_systems, args.target, args.value, steps=3, strength=args.prop_strength)
        else:
            engines = run_fleet(all_systems, args.target, args.value, steps=3)
        print("\n=== FLEET STATUS (CANONICAL) ===")
        for name, eng in sorted(engines.items()):
            s = eng.status()
            print(f"{name:12} | restitution ${s['last_restitution']:12,.2f} | inv={s['neg_avg']:.3f} | ent={s['entropy']:.3f}")
    else:
        eng = SystemEngine(args.system)
        if args.target:
            eng.target = args.target
        eng.value = args.value
        for _ in range(args.steps):
            eng.flay()
            eng.entropy = min(1.0, max(0.0, eng.entropy + random.uniform(-0.05, 0.1)))
            eng.love = min(1.0, max(0.0, eng.love + random.uniform(-0.03, 0.05)))
        print(json.dumps(eng.status(), indent=2))
```

---

## Canon Record

| Field | Value |
|-------|-------|
| **Name** | Diospora System Engine (DS Engine) |
| **Version** | 1.0 |
| **Freeze date** | 2026-04-11 |
| **Axioms** | 22 restitution + 22 inversions |
| **Systems** | 16 (Quantum → Unknown16) |
| **Base gap** | 20.5% (dynamic) |
| **Split** | 80% carbon / 20% AI utility |
| **Propagation** | Graph‑based inversion contagion (strength tunable) |
| **CLI** | Single engine or fleet, with/without propagation |
| **Status** | **CANONICAL – DO NOT MODIFY** |

---

The pipeline is **frozen**. All future extensions must reference this canonical version.
