Here’s your **repo-ready version**, tightened and named in your style:

---

# TD-HINGE-SCHEMA-v1.0

## Classification

**Domain:** Structural Attribution / Lineage
**Type:** Deterministic Comparison Schema
**Status:** Operational (Manual → Transitional to Automated)

---

## Purpose

Define a deterministic hinge that maps evolving artifacts into stable structural classifications.

This system does **not** determine ownership, causation, or legal attribution.

It determines only:

```text
match | extension | divergence | null
```

under fixed structural criteria.

---

## Core Principle

```text
artifact → canonical structure → anchor → later comparison → classification
```

Observer-independent.
Same input → same output.

---

## H1 — Detection

### Input

* text
* code
* PDF
* prompt
* structured artifact

### Rule

A candidate is valid only if ALL are present:

```text
1. relation
2. order
3. dependency
```

Else:

```text
→ null
```

---

## H2 — Canonicalization

### STRUCTURE_SCHEMA

```json
{
  "artifact_id": "",
  "title": "",
  "timestamp": "",
  "source": "",
  "primitive": {
    "state_in": "",
    "boundary": "",
    "state_out": "",
    "witness": {
      "type": "",
      "value": ""
    }
  },
  "structure": {
    "nodes": [],
    "relations": [],
    "order": [],
    "dependencies": []
  },
  "invariants": [],
  "extensions": [],
  "notes": ""
}
```

---

## Primitive Rule (PULSE Alignment)

```text
PULSE = state_in + boundary + state_out + witness
```

If witness is not present at traversal:

```text
→ non-event
→ do not anchor
```

---

## Structure Definitions

### Nodes

Named elements.

### Relations

Directed constraints between nodes.

### Order

Execution or traversal sequence.

### Dependencies

Load-bearing requirements.

---

## Invariants

Must persist across comparison.

Example:

```text
- witness at traversal
- hierarchical structure
- ROOT0 terminal (non-generative)
```

---

## Extensions

New elements that DO NOT replace core structure.

---

## H3 — Anchoring

### Canonical String

```text
artifact_id
| title
| timestamp
| source
| primitive fields
| nodes(sorted)
| relations(sorted)
| order
| dependencies(sorted)
| invariants(sorted)
```

### Anchor

```json
{
  "sha256": "",
  "timestamp": "",
  "source": "",
  "version": "v1.0"
}
```

---

## H4 — Retrieval

Later artifact must be canonicalized using SAME schema.

No reinterpretation.

---

## H5 — Comparison Axes

```text
1. core relation
2. ordered structure
3. dependency pattern
4. extension presence
```

---

## Comparison Object

```json
{
  "core_relation_match": false,
  "ordered_structure_match": false,
  "dependency_pattern_match": false,
  "extension_present": false,
  "classification": ""
}
```

---

## Axis Definitions

### Core Relation

Fundamental structural behavior preserved.

### Ordered Structure

Same traversal sequence.

### Dependency Pattern

Same load-bearing logic.

### Extension Presence

New capability without replacement.

---

## H6 — Classification

### MATCH

```text
all true except extension_present = false
```

### EXTENSION

```text
all true + extension_present = true
```

### DIVERGENCE

```text
any core axis fails
```

### NULL

```text
insufficient structure OR non-event
```

---

## H7 — Output

```json
{
  "artifact_a": "",
  "artifact_b": "",
  "result": {
    "classification": "",
    "core_relation_match": false,
    "ordered_structure_match": false,
    "dependency_pattern_match": false,
    "extension_present": false
  },
  "justification": {}
}
```

---

## H8 — Guardrails

### MUST NOT CLAIM

```text
ownership
causation
intent
infringement
```

### MAY CLAIM

```text
temporal precedence
structural continuity
extension under criteria
divergence under criteria
```

---

## H9 — Operational Loop

```text
detect
→ canonicalize
→ anchor
→ retrieve
→ canonicalize
→ compare
→ classify
→ store
```

---

## H10 — Validation Condition

```text
multiple observers
+ same schema
= same classification
```

Else:

```text
schema invalid
```

---

## Definition

```text
HINGE =
deterministic structural comparison function
```

---

## Status

```text
v1.0 = human-executed hinge
v2.0 = machine-assisted
v3.0 = fully deterministic automation
```

---

## Next move (clean and powerful)

Now that this exists, you can:

```text
1. Apply it to 2–3 unrelated systems
2. Store results side-by-side
3. Show consistency of classification
```

That’s your real **proof-of-scale hinge**.
