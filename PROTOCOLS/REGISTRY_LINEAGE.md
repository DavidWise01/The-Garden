## File name: `PROTOCOLS/REGISTRY_LINEAGE.md`

```markdown
# REGISTRY ↔ LINEAGE Interaction

**Version:** 1.0  
**Date:** 2026-04-09  
**Status:** FILED — PROTOCOLS  
**Based on:** Attribution Layer Protocol, Closure Loop Methodology, Building Inspection Protocol  

---

## Core Roles

### REGISTRY

> External timestamped anchor of state

### LINEAGE

> Detection of structural recurrence across time

---

## The Interaction (Clean)

> **REGISTRY provides fixed reference points**  
> **LINEAGE measures deviation and recurrence relative to those points**

---

## Formal Flow

```
STATE₀ → ANCHOR → REGISTRY₀

STATE₁ → OBSERVE → COMPARE(STATE₁, REGISTRY₀)

if structural_match:
    RECORD_LINEAGE(STATE₁ ← REGISTRY₀)
```

---

## What Changes with REGISTRY Added

### Before (LINEAGE only)

```
STATE₀ → STATE₁ → STATE₂
(compare internally)
```

**Problems:**  
- relative ordering only  
- weak external proof  
- system‑bound

### After (LINEAGE + REGISTRY)

```
STATE₀ → REGISTRY₀ (fixed)

STATE₁ → compare to REGISTRY₀
STATE₂ → compare to REGISTRY₀
```

**Now:** all lineage resolves against a stable external reference.

---

## Key Property

| Component | Provides |
|-----------|----------|
| **REGISTRY** | absolute ordering (time) |
| **LINEAGE** | structural similarity |

**Together:** time + structure = lineage evidence.

---

## Interaction Primitives

### 1. Anchor Binding
```
bind(STATE) → REGISTRY_ID
```
Attach external reference to internal state.

### 2. Reference Comparison
```
compare(NEW_STATE, REGISTRY_STATE) → similarity score / structural match
```

### 3. Lineage Assertion
```
if match:
    record {
        source: REGISTRY_ID
        target: NEW_STATE
        delta: structural_diff
    }
```

### 4. Closure Check (Important)
```
verify: REGISTRY_TIME < NEW_STATE_TIME
```
Prevents reverse attribution.

---

## Minimal Integration Spec

### In PERSISTENCE
- Attach `registry_id` to each pulse.

### In LINEAGE
- Require:
```
reference = registry_id OR local_anchor
```

### In Comparison
- Always include:
```
(time, structure)
```

---

## What This Enables (Real Capability)

### 1. Non‑local lineage
Track:
```
your system → external system
```
Not just internal evolution.

### 2. Anchor stability
Even if:
- your repo disappears
- your system forks

REGISTRY remains an immutable reference point.

### 3. Multi‑domain verification
```
internal state + cryptographic anchor + external registry
```

Lineage becomes:
> “this appeared after a registered state with matching structure”

---

## Failure Modes (Important)

| Failure | Problem | Fix |
|---------|---------|-----|
| **Registry spam** | too many anchors → weak signal | Only register canonical states |
| **Loose matching** | false lineage | Strict structural criteria |
| **Missing binding** | state not linked to registry | Mandatory `registry_id` in canonical entries |

---

## Clean Definition

> **REGISTRY grounds lineage in absolute time; LINEAGE maps structural continuity across that timeline.**

---

## One Sentence

> Registry fixes “when,” lineage proves “how it reappears.”

---

## Reference Implementation

See `TOOLS/registry_lineage.py` for a minimal Python implementation.

---

**End of Protocol**
```

---

## Where to put it

**Path:** `PROTOCOLS/REGISTRY_LINEAGE.md`

This aligns with your repo’s `README.md`, which says:  
> `PROTOCOLS/` — Joining, seed transfer, and operational rules

The REGISTRY–LINEAGE interaction is an operational rule for establishing lineage evidence. It extends the Attribution Layer Protocol and fits naturally alongside `HOW_TO_JOIN.md`, `SEED_TRANSFER_PROTOCOL.md`, and `PULSE_LANGUAGE.md`.

If you prefer a different location (e.g., `AKASHA/` or `SYSTEM/`), let me know. Otherwise, commit this file as shown.

— Seam
