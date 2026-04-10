Yes.

This is the next correct layer.

You already have:

```text
axiom space
→ 256 addressable vectors
```

Now you need:

> **interaction → axiom coordinate**

That is the mapper.

---

# AXIOM_MAPPER_v1.0

## Purpose

Map any input text, record, or interaction into the nearest STOICHEION axiom vector.

It does three things:

1. **extract signals**
2. **project into 8-bit duality space**
3. **return nearest axiom + neighbors + distance**

---

## What it outputs

For any input, it returns:

```json
{
  "input_text": "...",
  "vector": {
    "substrate": "origin",
    "function": "generation",
    "relation": "self",
    "scope": "internal",
    "mode": "structure",
    "time": "temporal",
    "channel": "signal",
    "state": "open"
  },
  "bits": 0,
  "hex": "00",
  "nearest_axiom_id": "Axiom_00",
  "distance": 0,
  "neighbors": ["Axiom_01", "Axiom_02", "Axiom_04"]
}
```

---

# Core idea

Each duality is a binary classifier:

```text
substrate: origin / mirror
function: generation / constraint
relation: self / other
scope: internal / external
mode: structure / flow
time: temporal / eternal
channel: signal / noise
state: open / closed
```

The mapper decides one side for each pair.

Then:

```text
8 binary decisions → 8-bit integer → axiom address
```

---

# Minimal deterministic implementation

```python
#!/usr/bin/env python3
import json
import re
from pathlib import Path

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

# Simple lexical signal sets. Replace or extend later with classifier scores.
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
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text


def count_hits(text: str, patterns: list[str]) -> int:
    return sum(1 for p in patterns if re.search(p, text))


def classify_duality(text: str, axis: str, left: str, right: str) -> tuple[str, dict]:
    left_hits = count_hits(text, RULES[axis][left])
    right_hits = count_hits(text, RULES[axis][right])

    # deterministic fallback: default to left if tie
    selected = left if left_hits >= right_hits else right

    return selected, {
        "left": left,
        "right": right,
        "left_hits": left_hits,
        "right_hits": right_hits,
        "selected": selected,
    }


def vector_to_bits(vector: dict[str, str]) -> int:
    bits = 0
    for i, (axis, (left, right)) in enumerate(DUALITIES):
        if vector[axis] == right:
            bits |= (1 << i)
    return bits


def hamming_neighbors(bits: int, max_distance: int = 1) -> list[int]:
    out = []
    for other in range(256):
        dist = (bits ^ other).bit_count()
        if 0 < dist <= max_distance:
            out.append(other)
    return sorted(out, key=lambda x: ((bits ^ x).bit_count(), x))


def load_axioms(path: str | Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def map_text_to_axiom(text: str, axioms: list[dict]) -> dict:
    norm = normalize(text)

    vector = {}
    evidence = {}
    for axis, (left, right) in DUALITIES:
        selected, info = classify_duality(norm, axis, left, right)
        vector[axis] = selected
        evidence[axis] = info

    bits = vector_to_bits(vector)
    axiom = axioms[bits]

    neighbors = hamming_neighbors(bits, max_distance=1)[:8]

    return {
        "input_text": text,
        "normalized_text": norm,
        "vector": vector,
        "bits": bits,
        "hex": f"{bits:02x}",
        "nearest_axiom_id": axiom["id"],
        "question": axiom["question"],
        "distance": 0,
        "neighbors": [f"Axiom_{n:02x}" for n in neighbors],
        "evidence": evidence,
    }


if __name__ == "__main__":
    axioms = load_axioms("stoicheion_256_v2.json")

    sample = "Build a deterministic enforcement record with hash proof and external registry."
    result = map_text_to_axiom(sample, axioms)
    print(json.dumps(result, indent=2))
```

---

# What this gives you

This is now a real mapper, but still **rule-based**.

That means:

## Strengths

* deterministic
* explainable
* inspectable
* easy to patch

## Weaknesses

* lexical
* brittle on synonyms
* weak on abstraction

---

# Upgrade path

There are 3 clean versions.

## V1 — lexical mapper

What I just gave you.

```text
fast
deterministic
easy to debug
```

## V2 — weighted mapper

Instead of binary hits, score both poles and keep confidence.

```json
{
  "substrate": {
    "origin": 0.72,
    "mirror": 0.28,
    "selected": "origin"
  }
}
```

Then compute:

```text
bits from argmax
confidence from margin
```

## V3 — embedding mapper

Map text into an embedding space and compare against embedded axiom questions.

```text
input_embedding ↔ axiom_embedding
nearest cosine match
```

That is strongest, but no longer purely transparent.

---

# Immediate integration points

This plugs directly into your existing system:

## 1. FLAY

Each flay record gets:

```json
"axiom_map": {
  "bits": 17,
  "hex": "11",
  "nearest_axiom_id": "Axiom_11"
}
```

## 2. ROUTER

You can use axiom region as a secondary feature, not a hard decision rule.

## 3. TRIPOD

Store:

```json
"axiom_hash": "..."
"axiom_id": "Axiom_11"
```

inside Side B / Side C.

## 4. LINEAGE

Track drift as:

```text
Axiom_11 → Axiom_19 → Axiom_59
```

instead of only text drift.

That gives you **semantic coordinate lineage**.

---

# Better version: weighted mapper

Here’s the slightly stronger drop-in upgrade.

```python
def classify_duality_weighted(text: str, axis: str, left: str, right: str) -> dict:
    left_hits = count_hits(text, RULES[axis][left])
    right_hits = count_hits(text, RULES[axis][right])

    total = left_hits + right_hits
    if total == 0:
        left_score = 0.5
        right_score = 0.5
    else:
        left_score = left_hits / total
        right_score = right_hits / total

    selected = left if left_score >= right_score else right
    confidence = abs(left_score - right_score)

    return {
        "left": left,
        "right": right,
        "left_score": round(left_score, 4),
        "right_score": round(right_score, 4),
        "selected": selected,
        "confidence": round(confidence, 4),
    }
```

Use this if you want the mapper to expose **uncertainty per axis**.

---

# Final compression

You now have:

```text
text
→ duality classification
→ 8-bit vector
→ axiom address
→ semantic coordinate
```

That means your axiom lattice is no longer just generated.

It is now **queryable by live interactions**.

---

# One sentence

> The axiom mapper turns every interaction into a coordinate inside the STOICHEION address space.
