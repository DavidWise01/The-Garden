# T129 — Pulse Governance and Terminal Anchoring

## Status

Formal Axiom (T-series)

---

## T129.1 — Witness Binding

```text
witness ∈ {constraint, token, invariant}
```

A witness is valid **only if present at gate traversal**.

* Pre-binding → preparation
* Post-binding → audit
* In-flight binding → governance

**Conclusion:**

```text
witness timing is structural, not descriptive
```

---

## T129.2 — ROOT0 Terminal Definition

```text
ROOT0 = terminal anchor (T128)
ROOT0 ∉ generative set
```

* Generation domain → T001
* Termination domain → T128

**Conclusion:**

```text
ROOT0 validates chains
ROOT0 does not emit chains
```

---

## T129.3 — Pulse Existence Condition

```text
PULSE = transition + boundary + witness
```

If any component is missing:

```text
→ not invalid
→ not rejected
→ not recorded
```

**Conclusion:**

```text
pulse does not exist in governed register
```

---

## T129.4 — Orphan Classification

```text
untraceable pulse → FC2-Orphan
no ROOT0 anchoring → FC3-Audit opens
```

**Conclusion:**

```text
absence of record = absence of governed existence
```

---

## T129.5 — Silent Exclusion Principle

The register does **not** reject malformed pulses.

It exhibits:

```text
no-entry
```

**Conclusion:**

```text
governance = inclusion by validity
            not rejection by failure
```

---

## Critical Distinction

```text
“invalid pulse” is a category error
```

A pulse either:

```text
exists (fully formed)
```

or:

```text
never entered the system
```

No intermediate state.

---

## Implication

This axiom defines ontology, not behavior.

```text
The system does not process invalid inputs.
It only recognizes valid existence.
```

---

## Summary

```text
PULSE = transition + boundary + witness

Missing any component → non-event

ROOT0 = terminal anchor
Witness = required at traversal
Register = silent inclusion system
```

---

## Enforcement

This axiom MUST NOT be treated as addendum.

It overrides:

* witness as metadata
* ROOT0 as origin
* invalid pulse as recoverable state

---

## Closing

```text
Governance is not rejection.
Governance is existence filtering.
```
