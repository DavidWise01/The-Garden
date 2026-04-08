# ATTRIBUTION LAYER PROTOCOL v1.0

**Document ID:** TRIPOD-ATTRIB-001  
**Version:** 1.0  
**Date:** 2026-04-08  
**Author:** David Wise (ROOT0) / TriPod LLC  
**License:** CC-BY-ND-4.0 | TRIPOD-IP-v1.1  
**Status:** FILED — AKASHA / ATTRIBUTION  
**SHA256 Anchor:** (to be computed after final edit)

---

## 1. Core Principle

> I do not need to control the model.  
> I only need to:  
> **detect structure early** → **anchor it externally** → **watch for its extension later**

This is the **attribution layer** — a method for a private individual to claim precedence over structural patterns that later appear in third‑party AI systems, without requiring access to, control over, or cooperation from those systems.

---

## 2. The Three Phases

### Phase 1: Detect Structure Early

Identify a **repeating, non‑trivial pattern** in the behaviour or output of an AI system.  
The pattern must be:

- **Formalisable** – can be expressed as a set of rules, axioms, or a compressed representation.
- **Observable** – can be detected without internal access to the model (e.g., from outputs, API responses, or public system cards).
- **Novel** – not already a common or generic pattern in the field at the time of detection.

**Output of Phase 1:**  
A **pattern description** (e.g., “3/2/1 compression: three inputs → two constrained states → one emission”) plus a **timestamped record** of when and where it was observed.

### Phase 2: Anchor It Externally

Create a **permanent, immutable, publicly referenceable anchor** for the detected structure.  
The anchor must be:

- **Timestamped** – using a trusted time source (e.g., UTC clock, blockchain, notarised log).
- **Hashed** – using a collision‑resistant hash (e.g., SHA256) to fix the exact content.
- **Stored** – in a location the individual controls and that third parties can later verify (e.g., a personal repo, AKASHA, GitHub Gist, IPFS, or a filed document).

**Output of Phase 2:**  
An **anchor record** containing:

- The original pattern description (or a canonical representation)
- The hash of that description
- The timestamp
- A unique identifier (e.g., `TOPH-v1.0-2026-02-03`)
- Optional: a legal statement (license, IP claim, watermark)

### Phase 3: Watch for Its Extension Later

Monitor future AI systems (new model versions, system cards, or public outputs) for **structural extensions** of the anchored pattern.  
An extension is defined as a new instance that:

- Shares the **core relation** of the original pattern
- Preserves the **ordered structure** (as a subsequence)
- Maintains the **dependency pattern** (removing the new element recovers the original)
- Adds **at least one novel element** (new state, new constraint, new boundary)

**Output of Phase 3:**  
A **lineage statement** comparing the anchored pattern to the later observation, with a verdict of:

- **LINEAGE CONFIRMED** – all criteria met
- **NOT LINEAGE** – criteria not met
- **AMBIGUOUS** – partial match, requires threshold tuning

---

## 3. Required Artifacts

| Artifact | Purpose | Example |
|----------|---------|---------|
| **Pattern description** | Human‑readable specification of the structure | “3/2/1 compression: (intent, constraint, context) → (allowed, blocked) → emit(state_out)” |
| **Canonical representation** | Machine‑readable, deterministic string for hashing | JSON or a normalised text format |
| **Hash (SHA256)** | Immutable fingerprint | `02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763` |
| **Timestamp** | Proof of precedence | `2026-02-03T00:00:00Z` |
| **External storage proof** | Verifiable location | URL, transaction ID, filing receipt |
| **Comparison threshold rules** | Criteria for lineage | Same core relation + same ordered structure + same dependency pattern + new extension |

---

## 4. Relation to the PULSE Axiom

The PULSE axiom defines the **minimal deterministic transition** over a bounded register:

`PULSE = (state_in, boundary, state_out, witness)`

The Attribution Layer Protocol uses the **same primitive** as its detection unit:

- **Detect** = extract a PULSE from a conversation or system output  
- **Anchor** = hash the canonical PULSE and store it externally  
- **Watch** = compare a later PULSE against anchored PULSEs using the lineage criteria

Thus, the `pulse-axiom` skill (validator + lineage modes) is the **reference implementation** of this protocol.

---

## 5. Local Closure Loop

The protocol does **not** require:

- Control over the target model
- Cooperation from the model’s developer
- A centralised registry
- Legal enforcement (though it can support it)

Instead, it creates a **local closure loop**:
