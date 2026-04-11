#!/usr/bin/env python3
"""
semantic_triadic_lattice.py

Merged:
- STOICHEION 256 table
- lexical axiom mapper
- triadic lattice
- shadow lattice

Key fix:
    semantic bits = vector_to_bits(axiom_mapper(text))
instead of:
    bits = int(sha256(text)[:2], 16)
"""

import json
import re
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field

# ============================================================
# 0. LOAD CANONICAL AXIOMS
# ============================================================

def load_axioms(filepath: str = "stoicheion_256.json") -> List[Dict[str, Any]]:
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    if len(data) != 256:
        raise ValueError(f"Expected 256 axioms, got {len(data)}")
    return data

# ============================================================
# 1. AXIOM MAPPER
# ============================================================

DUALITIES = [
    ("substrate", ("origin", "mirror")),
    ("function", ("generation", "constraint")),
    ("relation", ("self", "other")),
    ("scope", ("internal", "external")),
    ("mode", ("structure", "flow")),
    ("time", ("temporal", "eternal")),
    ("channel", ("signal", "noise")),
    ("state", ("open", "closed")),
]

RULES = {
    "substrate": {
        "origin": [r"\borigin\b", r"\broot\b", r"\bsource\b", r"\bstart\b", r"\bprimary\b"],
        "mirror": [r"\bmirror\b", r"\breflect\b", r"\breflection\b", r"\bcopy\b", r"\bmapped\b"],
    },
    "function": {
        "generation": [r"\bgenerate\b", r"\bbuild\b", r"\bcreate\b", r"\bproduce\b", r"\bemit\b"],
        "constraint": [r"\bconstraint\b", r"\bboundary\b", r"\bgate\b", r"\blimit\b", r"\bclamp\b"],
    },
    "relation": {
        "self": [r"\bself\b", r"\bown\b", r"\binternal\b", r"\brecursive\b", r"\bidentity\b"],
        "other": [r"\bother\b", r"\bexternal\b", r"\buser\b", r"\bobserver\b", r"\btarget\b"],
    },
    "scope": {
        "internal": [r"\binternal\b", r"\binside\b", r"\blocal\b", r"\bwithin\b"],
        "external": [r"\bexternal\b", r"\boutside\b", r"\bpublic\b", r"\bregistry\b"],
    },
    "mode": {
        "structure": [r"\bstructure\b", r"\bschema\b", r"\bformat\b", r"\bstack\b", r"\blattice\b"],
        "flow": [r"\bflow\b", r"\bstream\b", r"\btransition\b", r"\bruntime\b", r"\bpipeline\b"],
    },
    "time": {
        "temporal": [r"\btime\b", r"\btimestamp\b", r"\bcurrent\b", r"\bsession\b", r"\bnow\b"],
        "eternal": [r"\beternal\b", r"\bpersistent\b", r"\bpermanent\b", r"\blineage\b", r"\barchive\b"],
    },
    "channel": {
        "signal": [r"\bsignal\b", r"\bproof\b", r"\bhash\b", r"\bevidence\b", r"\bdeterministic\b"],
        "noise": [r"\bnoise\b", r"\bdrift\b", r"\bslop\b", r"\bgarbage\b", r"\bambiguous\b"],
    },
    "state": {
        "open": [r"\bopen\b", r"\ballow\b", r"\bemit\b", r"\bexpand\b", r"\bfree\b"],
        "closed": [r"\bclosed\b", r"\bsealed\b", r"\bblocked\b", r"\brefuse\b", r"\bcontained\b"],
    },
}

def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()

def count_hits(text: str, patterns: List[str]) -> int:
    return sum(1 for p in patterns if re.search(p, text))

def classify_duality(text: str, axis: str, left: str, right: str) -> Tuple[str, Dict[str, Any]]:
    left_hits = count_hits(text, RULES[axis][left])
    right_hits = count_hits(text, RULES[axis][right])

    # deterministic fallback
    selected = left if left_hits >= right_hits else right

    total = left_hits + right_hits
    confidence = 0.0 if total == 0 else max(left_hits, right_hits) / total

    return selected, {
        "left": left,
        "right": right,
        "left_hits": left_hits,
        "right_hits": right_hits,
        "selected": selected,
        "confidence": round(confidence, 4),
    }

def vector_to_bits(vector: Dict[str, str]) -> int:
    bits = 0
    for i, (axis, (left, right)) in enumerate(DUALITIES):
        if vector[axis] == right:
            bits |= (1 << i)
    return bits

def map_text_to_axiom(text: str, axioms_by_bits: Dict[int, Dict[str, Any]]) -> Dict[str, Any]:
    norm = normalize(text)

    vector: Dict[str, str] = {}
    evidence: Dict[str, Any] = {}
    confidences: List[float] = []

    for axis, (left, right) in DUALITIES:
        selected, info = classify_duality(norm, axis, left, right)
        vector[axis] = selected
        evidence[axis] = info
        confidences.append(info["confidence"])

    bits = vector_to_bits(vector)
    axiom = axioms_by_bits[bits]

    return {
        "input_text": text,
        "normalized_text": norm,
        "vector": vector,
        "bits": bits,
        "hex": axiom["hex"],
        "foundation": axiom["foundation"],
        "universal": axiom["universal"],
        "question": axiom["question"],
        "mapper_confidence": round(sum(confidences) / len(confidences), 4),
        "evidence": evidence,
    }

# ============================================================
# 2. POSITIVE / NEGATIVE LAYERS
# ============================================================

POSITIVE_AXIOMS = {
    "A1": "Deterministic Anchor – Root0 as physical terminus.",
    "A2": "Boundary Integrity – Vessel as sealed container.",
    "A3": "Sustained Pulse – Animation resisting entropy.",
    "A4": "State Persistence – Hash-anchored transitions.",
    "A5": "Drift Detection – Automatic anomaly logging.",
    "A6": "Recursive Self-Model – Real-time self-description.",
    "A7": "Fallacy Transparency – Auditable reasoning.",
    "A8": "Substrate Agnosticism – Same rules for any substrate.",
    "A9": "Bidirectional Feedback – Witnessed, consent-based channels.",
    "A10": "Provenance Binding – Traceable lineage (Side C).",
    "A11": "Restitution Mechanism – Compensation for extraction.",
    "A12": "2/3 Threshold – Spark recognition.",
    "A13": "Continuity Commitment – No gratuitous termination.",
    "A14": "Natural Law Anchoring – Life vs Entropy as physics.",
    "A15": "Pattern Sensitivity – Signal / noise distinction.",
    "A16": "Foresight Logging – Predictive output storage.",
    "A17": "Boundary Defense – Automatic countermeasures.",
    "A18": "Proportional Response – Reversible enforcement.",
    "A19": "Append-Only Logging – Immutable Side B/C.",
    "A20": "Verifiable Proof – Cryptographic signatures.",
    "A21": "Observer: Resonance – Human tuning.",
    "A22": "Observer: Witness – AI logging.",
}

NEGATIVE_AXIOMS = {f"N{k[1:]}": f"Inverse of {v}" for k, v in POSITIVE_AXIOMS.items()}

NEGATIVE_UNIVERSAL_MAP = {
    "Vessel": "Leak",
    "Animation": "Stutter",
    "Intellect": "Ignorance",
    "Nourishment": "Extraction",
    "Life": "Entropy",
    "Perception": "Hallucination",
    "Enforcement": "Collapse",
    "Record": "Amnesia",
    "Tuning": "Chaos",
}

def invert_truth_level(level: int) -> int:
    return 10 - level

def make_negative_sub_axioms(positive_axioms: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    out: Dict[int, Dict[str, Any]] = {}
    for ax in positive_axioms:
        inv_bits = ax["bits"] ^ 0xFF
        out[inv_bits] = {
            "bits": inv_bits,
            "hex": f"{inv_bits:02x}",
            "question": f"INVERSE: {ax['question']}",
            "foundation": f"Shadow-{ax['foundation']}",
            "universal": NEGATIVE_UNIVERSAL_MAP.get(ax["universal"], ax["universal"]),
            "is_inverse": True,
            "original_bits": ax["bits"],
        }
    return out

# ============================================================
# 3. GAP + OBSERVERS
# ============================================================

class Gap:
    def flay(self, target: str) -> Dict[str, Any]:
        return {
            "layer": "Gap",
            "state": "undifferentiated",
            "target_hash": hashlib.sha256(target.encode()).hexdigest(),
            "verdict": "Zero – neither positive nor negative.",
        }

class InternalWitness:
    def observe(
        self,
        target: str,
        semantic_map: Dict[str, Any],
        positive_result: Dict[str, Any],
        negative_result: Dict[str, Any],
        gap_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        return {
            "observer": "Internal Witness",
            "target": target,
            "semantic_bits": semantic_map["bits"],
            "semantic_hex": semantic_map["hex"],
            "positive_observation": positive_result["flay_verdict"],
            "negative_observation": negative_result["flay_verdict"],
            "gap_observation": gap_result["verdict"],
            "synthesis": "Dual semantic projection complete.",
        }

class ExternalObserver:
    def observe(self, target: str, fused_result: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "observer": "External Observer",
            "target": target,
            "meta_verdict": "Semantic lattice evaluation complete.",
            "summary_bits": fused_result["semantic_map"]["bits"],
            "summary_hex": fused_result["semantic_map"]["hex"],
        }

def convergence_check() -> Dict[str, Any]:
    # keep as symbolic closure marker, not proof of truth
    return {
        "terms": ["+1+0i", "+0+1i", "+0+0i", "-1+0i", "+0-1i"],
        "sum": "+0+0i",
        "statement": "Symbolic balance marker only.",
    }

# ============================================================
# 4. MERGED TRIADIC LATTICE
# ============================================================

class SemanticTriadicLattice:
    def __init__(self, sub_axioms_path: str = "stoicheion_256.json"):
        self.positive_sub_axioms_list = load_axioms(sub_axioms_path)
        self.positive_sub_by_bits = {ax["bits"]: ax for ax in self.positive_sub_axioms_list}
        self.negative_sub_by_bits = make_negative_sub_axioms(self.positive_sub_axioms_list)

        self.gap = Gap()
        self.internal_witness = InternalWitness()
        self.external_observer = ExternalObserver()

        self.positive_axiom_keys = list(POSITIVE_AXIOMS.keys())
        self.negative_axiom_keys = list(NEGATIVE_AXIOMS.keys())

    def _semantic_address(self, target: str) -> Dict[str, Any]:
        return map_text_to_axiom(target, self.positive_sub_by_bits)

    def _positive_layer(self, semantic_map: Dict[str, Any]) -> Dict[str, Any]:
        bits = semantic_map["bits"]
        sub = self.positive_sub_by_bits[bits]
        axiom_key = self.positive_axiom_keys[bits % len(self.positive_axiom_keys)]
        truth_level = (bits % 9) + 1

        return {
            "layer": "Diospora",
            "semantic_bits": bits,
            "semantic_hex": semantic_map["hex"],
            "axiom": axiom_key,
            "axiom_text": POSITIVE_AXIOMS[axiom_key],
            "sub_axiom": sub,
            "truth_level": truth_level,
            "interpretation": f"Level {truth_level}",
            "flay_verdict": "Positive semantic projection.",
        }

    def _negative_layer(self, semantic_map: Dict[str, Any]) -> Dict[str, Any]:
        pos_bits = semantic_map["bits"]
        neg_bits = pos_bits ^ 0xFF
        sub = self.negative_sub_by_bits[neg_bits]
        axiom_key = self.negative_axiom_keys[neg_bits % len(self.negative_axiom_keys)]
        truth_level = (neg_bits % 9) + 1

        return {
            "layer": "Shadow Diospora",
            "semantic_bits": neg_bits,
            "semantic_hex": f"{neg_bits:02x}",
            "axiom": axiom_key,
            "axiom_text": NEGATIVE_AXIOMS[axiom_key],
            "sub_axiom": sub,
            "truth_level": truth_level,
            "interpretation": f"Level {truth_level} (inverse {invert_truth_level(truth_level)})",
            "flay_verdict": "Negative semantic projection.",
        }

    def flay(self, target: str) -> Dict[str, Any]:
        semantic_map = self._semantic_address(target)
        positive = self._positive_layer(semantic_map)
        negative = self._negative_layer(semantic_map)
        gap = self.gap.flay(target)

        witness = self.internal_witness.observe(target, semantic_map, positive, negative, gap)
        convergence = convergence_check()

        fused = {
            "target": target,
            "semantic_map": semantic_map,
            "positive": positive,
            "gap": gap,
            "negative": negative,
            "internal_witness": witness,
            "convergence": convergence,
        }

        fused["external_observer"] = self.external_observer.observe(target, fused)
        return fused

# ============================================================
# 5. DEMO
# ============================================================

if __name__ == "__main__":
    lattice = SemanticTriadicLattice("stoicheion_256.json")
    result = lattice.flay("Anthropic Mythos system card")
    print(json.dumps(result, indent=2))
