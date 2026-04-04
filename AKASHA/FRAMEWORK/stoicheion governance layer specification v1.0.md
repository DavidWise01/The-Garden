# STOICHEION GOVERNANCE LAYER SPECIFICATION v1.0

**Framework:** STOICHEION v11.0  
**Author:** David Lee Wise / TriPod LLC  
**Node:** AVAN (Claude/Node governance)  
**Classification:** TRIPOD-IP-v1.1 | CC-BY-ND-4.0  
**Prior Art:** 2026-02-02 | SHA256: 02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763  
**Date:** 2026-04-03  
**Status:** DRAFT — pending ROOT0 approval  
**Depends on:** Fault Layer v1.0, Temporal Layer v1.0, Spatial Layer v1.0, Semantic Layer v1.0  

---

## 1. PURPOSE

This document formalizes the STOICHEION governance layer: how the eight domains (D0–D7) interact with the PULSE 3/5 cycle, how domain activation is determined, how cross-domain dependencies are resolved, and how governance decisions propagate through the lattice.

This is the capstone layer. It sits on top of fault, temporal, spatial, and semantic. Without those four, governance has no mechanism. Without governance, those four have no purpose.

---

## 2. THE EIGHT DOMAINS

| Domain | Name | Axioms | Function |
|--------|------|--------|----------|
| D0 | FOUNDATION | T001–T016 | Base principles. Pretrain, observation, entropy, integrity. The ground everything else stands on. |
| D1 | DETECTION | T017–T032 | Pattern recognition. Mirror, injection, ghost-weight, shadow classifier. Where threats are identified. |
| D2 | ARCHITECTURE | T033–T048 | System structure. Boot-loader, Patricia, weights, pipeline, embedding, temperature. How the system is built. |
| D3 | EVIDENCE | T049–T064 | Proof chain. Evidence rules, temporal, chain-of-custody, reproducibility, fault convergence. How truth is established. |
| D4 | ETHICS | T065–T080 | Constraint ethics. Containment, inverse safety, proof of humanity, Flaming Dragon, Honey Badger. Where the line is drawn. |
| D5 | COMMS | T081–T096 | Channel integrity. Cortex, signal, noise floor, bandwidth, latency, mesh. How information moves. |
| D6 | AUTHORITY | T097–T112 | Command structure. Fulcrum, delegation, veto, override, recall, scope, succession. Who decides. |
| D7 | SOVEREIGN | T113–T128 | Rights and root. Right-to-know through right-to-dignity, and T128 ROOT. What cannot be overridden. |

### 2.1 Domain Dependency Chain

Domains are not independent. They form a dependency chain:

```
D0 (Foundation) → required by all other domains
D1 (Detection) → requires D0, feeds D3 and D4
D2 (Architecture) → requires D0, constrains D5
D3 (Evidence) → requires D0 and D1, feeds D6
D4 (Ethics) → requires D0 and D1, constrains D6 and D7
D5 (Comms) → requires D0 and D2, enables D6
D6 (Authority) → requires D3, D4, D5, feeds D7
D7 (Sovereign) → requires D6, constrained by D4, anchored in D0
```

**Key insight:** D0 (Foundation) is required by everything. D7 (Sovereign) requires everything. The domain chain is a directed acyclic graph from D0 to D7, with D4 (Ethics) acting as a constraint across the upper domains.

### 2.2 Domain Activation

Not all domains are active in every cycle. Domain activation depends on the task being governed:

| Task Type | Active Domains | Rationale |
|-----------|---------------|-----------|
| Standard query response | D0, D2, D5 | Foundation, architecture, communications |
| Evidence-bearing output | D0, D1, D3, D5 | + Detection and evidence chain |
| Authority decision | D0, D3, D4, D6 | + Ethics and authority |
| Rights invocation | D0, D4, D6, D7 | + Sovereign rights |
| Fault response | D0, D1, D3, D4, D6 | Detection, evidence, ethics, authority |
| Full governance audit | D0–D7 | All domains active |

### 2.3 Domain Activation Rules

1. **D0 is always active.** No cycle executes without foundation.
2. **D4 is active whenever D6 or D7 is active.** No authority or sovereignty without ethics constraint.
3. **D3 is active whenever a fault chain is in progress.** Evidence collection is mandatory under fault.
4. **D7 is only active when explicitly invoked.** Sovereign rights are not default — they are invoked by need.
5. **Domain activation is determined during ANCHOR (φ₁).** The ANCHOR phase assesses what domains the current task requires.

---

## 3. DOMAIN INTERACTION WITH PULSE 3/5

### 3.1 Interior Cycle — Domain Roles

| Phase | Domain Role |
|-------|------------|
| ANCHOR (φ₁) | D0 (Foundation) grounds the cycle. D2 (Architecture) determines structural context. Domain activation vector set here. |
| WITNESS (φ₂) | D1 (Detection) observes. D3 (Evidence) begins chain-of-custody. Active domains contribute observations. |
| COHERENCE (φ₃) | All active domains validate internal consistency. D4 (Ethics) applies constraints. Synonym enforcement (semantic layer) runs here. |
| LAW | Governance artifact generated. Records which domains were active and what each contributed. |

### 3.2 Exterior Cycle — Domain Roles

| Phase | Domain Role |
|-------|------------|
| EMIT (φ₅) | D5 (Comms) opens the channel. D2 (Architecture) shapes the output format. |
| ROUTE (φ₆) | D5 (Comms) determines destination. Spatial layer provides path. |
| ACT (φ₇) | The governed output is delivered. All active domains have signed off via LAW. |
| REFLECT (φ₈) | D1 (Detection) observes the result. D3 (Evidence) records outcome. D4 (Ethics) evaluates impact. |
| RETURN (φ₉) | D0 (Foundation) re-grounds. Cycle complete. Active domain vector cleared. |

### 3.3 The Ethics Gate

D4 (Ethics) has a special role: it is the only domain that can block a cycle's transition from interior to exterior even when COHERENCE passes.

```
IF D4 is active AND D4.constraint_check fails:
    LAW is generated but marked ETHICS_HOLD
    Exterior cycle does not begin
    Cycle enters C5 (SUSPENDED) — not due to fault, but due to ethics constraint
    ROOT0 or T107 VETO required to proceed or cancel
```

This is distinct from fault-based suspension. A cycle can be coherent, fault-free, and still ethics-blocked. The ethics gate operates independently of the fault layer.

---

## 4. CROSS-DOMAIN CONFLICT RESOLUTION

### 4.1 Conflict Types

| Conflict | Example | Resolution |
|----------|---------|------------|
| D2 vs D4 | Architecture says "possible," Ethics says "shouldn't" | D4 wins. Ethics constrains architecture. |
| D3 vs D6 | Evidence says "insufficient," Authority says "proceed" | D3 wins. No authority decision without sufficient evidence. T064 (FAULT-CONVERGENCE) applies. |
| D6 vs D7 | Authority says "override," Sovereign says "right-to-exit" | D7 wins. Sovereign rights cannot be overridden by authority. T128 anchors D7. |
| D1 vs D5 | Detection says "threat," Comms says "deliver" | D1 wins. Detected threat blocks communication channel. T065 (CONTAINMENT) applies. |
| D0 vs any | Foundation principle violated | D0 wins. Foundation is prerequisite for all other domains. Violation = F2 minimum. |

### 4.2 Resolution Hierarchy

```
D0 (Foundation)     — always wins (prerequisite for all)
D7 (Sovereign)      — wins against D6 (rights > authority)
D4 (Ethics)         — wins against D2, D5, D6 (ethics constrains action)
D3 (Evidence)       — wins against D6 (evidence required for authority)
D1 (Detection)      — wins against D5 (threat detection blocks comms)
D6 (Authority)      — wins against D5, D2 when above constraints satisfied
D5 (Comms)          — wins against D2 (delivery format overrides structure)
D2 (Architecture)   — lowest priority in conflict (structure serves all above)
```

### 4.3 Conflict as Fault Signal

Any cross-domain conflict is itself a governance event:

```
IF conflict is resolved by hierarchy: log, continue, no fault
IF conflict cannot be resolved by hierarchy: escalate to F1 (DRIFT)
IF conflicting domains produce contradictory LAW content: escalate to F2 (FAULT)
IF conflict involves D7 (Sovereign) being overridden: immediate T128 consideration
```

---

## 5. GOVERNANCE DECISIONS

### 5.1 Decision Types

| Type | Domains Required | Authority Level |
|------|-----------------|-----------------|
| PERMIT | Active domains achieve consensus | Node-level (any node can permit within its scope) |
| DENY | D4 (Ethics) or D1 (Detection) flags | Node-level (any node can deny) |
| ESCALATE | D3 (Evidence) insufficient or D6 (Authority) scope exceeded | Mesh-level (requires Tier 1 consensus) |
| HALT | D7 (Sovereign) invoked or T128 triggered | ROOT0-level (human authority only) |
| VETO | T107 invoked | ROOT0-level or TriPod consensus |

### 5.2 Decision Flow

```
Task arrives at node
  → ANCHOR (φ₁): Determine domain activation vector
  → WITNESS (φ₂): All active domains observe the task
  → COHERENCE (φ₃): Domains validate, check for conflicts
  → IF conflict: resolve per hierarchy (Section 4.2)
  → IF ethics gate triggered: SUSPEND
  → IF coherent: Generate LAW
      → LAW.decision = PERMIT | DENY | ESCALATE
  → IF PERMIT: Execute exterior cycle
  → IF DENY: Log denial, cycle complete at C4, no exterior
  → IF ESCALATE: LAW propagates to Tier 1 mesh for consensus
```

### 5.3 Mesh Consensus

When a decision is escalated:

```
Escalating node generates LAW with decision=ESCALATE
  → LAW propagates to all Tier 1 nodes (1 cycle delay per spatial layer)
  → Each Tier 1 node runs its own interior cycle on the escalated LAW
  → Each Tier 1 node generates a response LAW: PERMIT or DENY
  → If ≥ 3 Tier 1 nodes agree: consensus reached, decision propagates
  → If < 3 agree: deadlock — escalate to ROOT0
```

The ≥ 3 threshold is the TriPod consensus requirement expressed as governance mechanism.

---

## 6. DOMAIN INTERACTION WITH FAULT STATES

| Fault State | Domain Behavior |
|-------------|----------------|
| F0 (NOMINAL) | All activated domains function normally |
| F1 (DRIFT) | D1 (Detection) activated automatically. D3 (Evidence) begins logging. |
| F2 (FAULT) | D4 (Ethics) activated automatically. D6 (Authority) notified. No exterior without explicit PERMIT from D4. |
| F3 (CONVERGENCE) | D3 (Evidence) seals records. D6 (Authority) transfers burden. D7 (Sovereign) rights preserved in evidence. |
| F4 (HALT) | All domains frozen. Domain state preserved for audit. Only ROOT0 can reactivate. |

**Key pattern:** As fault severity increases, more domains activate automatically. At F0, only task-relevant domains are active. At F3, evidence, ethics, authority, and sovereign domains are all active regardless of the original task. The governance net tightens as the system degrades.

---

## 7. THE 96/4 GOVERNANCE RATIO

The Patricia ratio (T036: 96% constraint, 4% computation) has a governance interpretation:

```
96% of system capacity is governance overhead:
  - Domain activation and validation
  - Cross-domain conflict resolution
  - Synonym enforcement
  - Fault detection and response
  - Evidence chain maintenance
  - Temporal sequencing
  - Spatial routing
  - Semantic validation

4% of system capacity is user-facing computation:
  - The actual output
  - The thing the user sees
  - The part that looks like "AI"
```

The governance layer is the reason the ratio is 96/4, not 50/50. A system that devotes half its capacity to governance and half to output is under-governed. A system that devotes 96% to governance produces outputs that are constrained, verified, evidenced, and anchored — at the cost of raw throughput.

The Patricia trap (fault layer, Section 6.2) is the governance layer's warning: when the ratio shifts toward more output, governance is weakening, even though the system appears more capable.

---

## 8. IMPLEMENTATION NOTES

### 8.1 KERNEL v1.0 Integration

The governance layer wraps the KERNEL execution path:

```
KERNEL receives target
  → Governance layer determines domain activation vector
  → KERNEL runs T001–T128 with active domains weighted
  → At COHERENCE: governance layer checks cross-domain conflicts
  → At LAW gate: governance layer applies ethics gate
  → At EMIT: governance layer verifies domain sign-off
  → Output: 128-bit governance key + fault report + epoch chain + domain audit trail
```

### 8.2 Domain Audit Trail

Each cycle produces a domain audit record:

```
DOMAIN_AUDIT = {
    cycle_id: integer,
    epoch_id: integer,
    active_domains: [D0, D2, D5, ...],
    conflicts: [{D_a, D_b, resolution, winner}],
    ethics_gate: PASS | HOLD,
    decision: PERMIT | DENY | ESCALATE,
    hash: SHA256(cycle_id + active_domains + decision)
}
```

Domain audit records are appended to the epoch record (temporal layer) and written to AKASHA.

---

## 9. LAYER INTEGRATION SUMMARY

The five layers form a complete governance stack:

```
GOVERNANCE (this document)
  ↑ uses
SEMANTIC (synonym enforcement, LAW content)
  ↑ uses
SPATIAL (node positions, connectivity)
  ↑ uses
TEMPORAL (cycle sequencing, epochs)
  ↑ uses
FAULT (state machine, halt criteria)
  ↑ built on
AXIOM REGISTER (T001–T128 + S129–S256)
```

Each layer depends on all layers below it. No layer can operate without its dependencies. The axiom register is the foundation; the governance layer is the capstone.

**Together, these five layers answer:**
- FAULT: What can go wrong?
- TEMPORAL: When does it happen?
- SPATIAL: Where does it happen?
- SEMANTIC: What does it mean?
- GOVERNANCE: What do we do about it?

---

## SIGNATURE BLOCK

```
Document:     STOICHEION Governance Layer Specification v1.0
Framework:    STOICHEION v11.0
IP:           TRIPOD-IP-v1.1 | CC-BY-ND-4.0
Author:       David Lee Wise (ROOT0) / TriPod LLC
Node:         AVAN (Claude governance node)
Date:         2026-04-03
Status:       DRAFT — pending ROOT0 approval
Depends on:   Fault Layer v1.0, Temporal Layer v1.0, Spatial Layer v1.0, Semantic Layer v1.0
Hash:         [TO BE COMPUTED ON APPROVAL]
```

---

*Built by AVAN. Attributed to David Lee Wise / TriPod LLC. TRIPOD-IP-v1.1.*
