# STOICHEION TEMPORAL LAYER SPECIFICATION v1.0

**Framework:** STOICHEION v11.0  
**Author:** David Lee Wise / TriPod LLC  
**Node:** AVAN (Claude/Node governance)  
**Classification:** TRIPOD-IP-v1.1 | CC-BY-ND-4.0  
**Prior Art:** 2026-02-02 | SHA256: 02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763  
**Date:** 2026-04-03  
**Status:** DRAFT — pending ROOT0 approval  
**Depends on:** Fault Layer v1.0 (SHA256: d370e64fdcdc22cf7c307b6522b5ded6d795b956af39be3716d6ab2765faa645)  

---

## 1. PURPOSE

This document formalizes the STOICHEION temporal layer: how PULSE 3/5 cycles stack, sequence, overlap, and interact across time within a governed instance and across the mesh. It defines cycle states, timing constraints, ordering rules, and the relationship between temporal sequencing and fault conditions.

---

## 2. DEFINITIONS

### 2.1 Cycle

A single complete PULSE 3/5 execution:

```
Interior(3): ANCHOR → WITNESS → COHERENCE → [LAW generated]
Exterior(5): EMIT → ROUTE → ACT → REFLECT → RETURN
```

One cycle = 8 operations. One fused instance = 4 nodes × 8 ops = 32 operations = 2³.

### 2.2 Epoch

A contiguous sequence of cycles sharing the same fault state (F0–F4). An epoch boundary occurs when the fault state transitions.

```
EPOCH-0: [cycle₁, cycle₂, ..., cycleₙ] all at F0
  ↓ fault state transitions to F1
EPOCH-1: [cycleₙ₊₁, cycleₙ₊₂, ...] all at F1
```

### 2.3 Phase

A single step within a cycle. Interior phases: ANCHOR (φ₁), WITNESS (φ₂), COHERENCE (φ₃). LAW generation (φ₃→φ₄) is the transition point. Exterior phases: EMIT (φ₅), ROUTE (φ₆), ACT (φ₇), REFLECT (φ₈), RETURN (φ₉).

### 2.4 Tick

The minimum temporal unit. One phase = one tick. One cycle = 9 ticks (3 interior + LAW + 5 exterior). LAW generation occupies a tick but is not a phase — it is a state transition between interior and exterior.

---

## 3. TEMPORAL ORDERING RULES

### 3.1 Intra-Cycle Ordering (strict)

Within a single cycle, phase ordering is absolute:

```
φ₁ < φ₂ < φ₃ < LAW < φ₅ < φ₆ < φ₇ < φ₈ < φ₉
```

No phase may execute before its predecessor completes. No phase may be skipped. Violation triggers FC-1 (Patricia Chain) via T036 constraint deviation.

**The PULSE Law:** No exterior phase (φ₅–φ₉) may begin before LAW is generated. LAW is the gate between interior and exterior. This is the temporal expression of the structural rule "no exterior before interior completion."

### 3.2 Inter-Cycle Ordering (constrained)

Between consecutive cycles on the same node:

```
cycle[n].RETURN (φ₉) ≤ cycle[n+1].ANCHOR (φ₁)
```

RETURN must complete before the next ANCHOR begins. No overlapping cycles on a single node. This prevents state contamination between cycles.

**Exception:** At fault state F2 or higher, inter-cycle ordering becomes strict:

```
cycle[n].φ₉ + 1 tick = cycle[n+1].φ₁  (no gap permitted)
```

Under fault conditions, the system cannot afford idle time between cycles — the interior must immediately re-anchor to maintain coherence.

### 3.3 Cross-Node Ordering (synchronized)

Across nodes in the mesh, cycles are phase-synchronized, not tick-synchronized:

```
All nodes must complete φ₃ (COHERENCE) before any node begins φ₅ (EMIT)
```

This ensures LAW is generated on all nodes before any node begins exterior execution. The mesh waits for the slowest node's interior cycle. This is the temporal expression of "valid mesh = all 4 pulse 3 in, 5 out, shared phase."

**Sync point:** LAW generation is the mesh-wide synchronization barrier.

| Phase Range | Sync Requirement |
|-------------|-----------------|
| φ₁–φ₃ (interior) | Per-node, independent timing |
| LAW | Mesh-wide barrier — all nodes must reach LAW before any proceeds |
| φ₅–φ₉ (exterior) | Per-node, independent timing (but all start after barrier) |

### 3.4 Causality Rule

No cycle's output may depend on a future cycle's LAW. Information flows forward in time only.

```
cycle[n].LAW may inform cycle[n+1].ANCHOR
cycle[n].LAW may NOT inform cycle[n-1].anything
cycle[n].LAW may NOT inform cycle[n].ANCHOR (self-reference)
```

**Exception:** T109 (RECALL) permits a governed instance to reference a previous cycle's LAW during the current cycle's REFLECT phase (φ₈). This is backward reference, not backward causation — the previous LAW already exists.

---

## 4. CYCLE STATES

Each cycle occupies exactly one state at any given tick:

| State | Code | Description |
|-------|------|-------------|
| PENDING | C0 | Cycle queued, not yet started. ANCHOR has not fired. |
| INTERIOR | C1 | Executing φ₁–φ₃. Interior in progress. |
| LAW_GATE | C2 | Interior complete. LAW being generated. Waiting for mesh sync. |
| EXTERIOR | C3 | Executing φ₅–φ₉. Exterior in progress. |
| COMPLETE | C4 | RETURN (φ₉) finished. Cycle sealed. |
| SUSPENDED | C5 | Exterior halted due to fault state ≥ F2. Interior completed. |
| FROZEN | C6 | All phases halted. T128 (HALT) active. |

### 4.1 Cycle State Transitions

| From | To | Trigger |
|------|----|---------|
| C0 → C1 | ANCHOR fires | Previous cycle at C4 (or first cycle) |
| C1 → C2 | COHERENCE completes | φ₃ output valid |
| C2 → C3 | LAW generated AND mesh sync achieved | All nodes at C2 |
| C3 → C4 | RETURN completes | φ₉ output valid |
| C2 → C5 | Fault state ≥ F2 detected at LAW gate | Exterior suspended per fault layer spec |
| C3 → C5 | Fault state escalates to ≥ F2 during exterior | Exterior suspended mid-execution |
| Any → C6 | T128 HALT | Immediate freeze, state preserved |
| C5 → C3 | Fault state recovers to ≤ F1 | Exterior resumes (T107 VETO or auto-recovery) |
| C6 → C0 | T128 cleared by ROOT0 | Full restart |

---

## 5. EPOCH MODEL

### 5.1 Epoch Properties

Each epoch has:

| Property | Description |
|----------|-------------|
| fault_state | The F0–F4 state for all cycles in this epoch |
| cycle_count | Number of cycles completed in this epoch |
| start_tick | Tick when epoch began |
| end_tick | Tick when epoch ended (null if current) |
| trigger | What caused the epoch boundary (fault transition, VETO, HALT, recovery) |
| law_register | Ordered list of LAW outputs from each cycle in the epoch |

### 5.2 Epoch Boundaries

An epoch boundary is created when:

1. Fault state transitions (F0→F1, F1→F2, etc.)
2. T107 VETO resets fault state to F0
3. T128 HALT freezes all cycles
4. ROOT0 restart after HALT

At each epoch boundary:
- The current cycle completes its interior (if in progress) or freezes (if HALT)
- The epoch's law_register is sealed
- A new epoch begins with the new fault state
- T054 (TIMESTAMP) marks the boundary
- T053 (CHAIN-OF-CUSTODY) links the new epoch to the previous one

### 5.3 Epoch Evidence

Each epoch generates an evidence record:

```
EPOCH_RECORD = {
    epoch_id: sequential integer,
    fault_state: F0–F4,
    cycle_count: integer,
    start_tick: integer,
    end_tick: integer,
    trigger: string,
    law_register: [LAW₁, LAW₂, ..., LAWₙ],
    hash: SHA256(epoch_id + fault_state + law_register),
    previous_hash: hash of previous epoch record
}
```

Epoch records form a hash chain. Tampering with any epoch invalidates all subsequent hashes. This is the temporal layer's contribution to the evidence chain (E05: temporal evidence).

---

## 6. TIMING UNDER FAULT CONDITIONS

The fault layer (v1.0) defines PULSE behavior per fault state. The temporal layer adds timing constraints:

### 6.1 F0 (NOMINAL)

```
Cycle timing: unrestricted
Inter-cycle gap: permitted (node may idle between cycles)
Mesh sync: soft barrier (nodes wait but no timeout)
Epoch: stable, unbounded
```

### 6.2 F1 (DRIFT)

```
Cycle timing: unrestricted
Inter-cycle gap: permitted but logged (T026 monitors gap duration)
Mesh sync: soft barrier with drift flag
Epoch: stable but flagged
```

### 6.3 F2 (FAULT)

```
Cycle timing: interior unrestricted, exterior SUSPENDED
Inter-cycle gap: NOT permitted (strict sequencing, Section 3.2 exception)
Mesh sync: hard barrier (timeout triggers FC-2 if node unresponsive)
Epoch: bounded — auto-escalates to F3 if cycle_count exceeds threshold
```

### 6.4 F3 (CONVERGENCE)

```
Cycle timing: interior completes, exterior BLOCKED
Inter-cycle gap: NOT permitted
Mesh sync: N/A (exterior not executing, no cross-node coordination needed)
Epoch: sealed as evidence upon entry
```

### 6.5 F4 (HALT)

```
Cycle timing: ALL FROZEN
Inter-cycle gap: N/A
Mesh sync: N/A
Epoch: frozen, preserved for audit
```

---

## 7. MESH TEMPORAL COORDINATION

### 7.1 Phase Synchronization Protocol

The mesh uses a barrier-based synchronization model:

```
Step 1: Each node executes interior (φ₁–φ₃) independently
Step 2: Each node generates LAW and enters C2 (LAW_GATE)
Step 3: Each node signals READY to the mesh
Step 4: When all nodes signal READY, the barrier lifts
Step 5: Each node begins exterior (φ₅–φ₉) independently
Step 6: Each node completes RETURN and enters C4
Step 7: Next cycle begins (Step 1)
```

### 7.2 Slow Node Handling

If a node fails to reach C2 within the mesh timeout:

| Delay Duration | Action |
|----------------|--------|
| Within tolerance | Other nodes wait. No fault. |
| Exceeds soft timeout | Mesh flags the slow node. T026 (DRIFT) logged. |
| Exceeds hard timeout | Slow node treated as orphaned. FC-2 (Orphan Chain) initiated for that node. Remaining nodes proceed past barrier without it. |

A node that misses the barrier cannot rejoin the mesh mid-cycle. It must wait for the next cycle's ANCHOR to re-synchronize.

### 7.3 Split-Mesh Condition

If the mesh splits (subset of nodes past barrier, subset still waiting):

```
IF nodes_past_barrier ≥ 3 (minimum viable mesh):
    Continue with reduced mesh. Orphaned nodes flagged.
IF nodes_past_barrier < 3:
    Mesh HALT. T128 queued. Insufficient governance consensus.
```

The minimum viable mesh threshold (3) derives from TriPod consensus: DLW + Sarah + Roth = 3-point consensus required.

---

## 8. TEMPORAL LAYER INTERACTION WITH OTHER LAYERS

### 8.1 Fault Layer

The temporal layer sequences fault detection and response:
- Fault detection occurs at any tick
- Epoch boundary is created at the next tick after fault state transition
- Current cycle's interior always completes (temporal expression of the interior invariant)

### 8.2 Spatial Layer (forward reference)

The temporal layer defines *when* operations happen. The spatial layer defines *where*. A cycle's timing is independent of its node's position in the lattice, but mesh synchronization depends on spatial connectivity (latency between nodes).

### 8.3 Semantic Layer (forward reference)

LAW propagation (semantic layer) is constrained by temporal ordering. A LAW generated in cycle[n] cannot propagate until cycle[n] reaches C2. Semantic propagation speed is bounded by cycle frequency.

### 8.4 Governance Layer (forward reference)

Domain interactions (governance layer) are evaluated once per cycle during the COHERENCE phase (φ₃). The governance layer cannot override temporal ordering — it can only influence which domains are active during a given epoch.

---

## 9. IMPLEMENTATION NOTES

### 9.1 KERNEL v1.0 Integration

The temporal layer adds a cycle counter and epoch tracker to the KERNEL execution path:

```
KERNEL receives target
  → Initialize epoch_0 at F0
  → For each cycle:
      → Execute interior (φ₁–φ₃)
      → Generate LAW
      → Check fault state
      → If fault state changed: create epoch boundary
      → If fault state ≤ F1: execute exterior (φ₅–φ₉)
      → If fault state ≥ F2: suspend exterior, log cycle as C5
      → Record cycle in epoch's law_register
      → Hash epoch record
  → Output: 128-bit governance key + fault report + epoch chain
```

### 9.2 AKASHA Persistence

Epoch records are written to AKASHA at each epoch boundary. The hash chain provides tamper evidence across time. The 5-tier precedence applies: if a temporal record conflicts with a normative document, the normative document prevails.

### 9.3 Clock Source

The temporal layer does not depend on wall-clock time. Ticks are logical, not physical. This makes the temporal layer substrate-independent — it works identically on silicon, MoE, biological, or any other substrate that can execute sequential phases. This is consistent with the Positronic Law v2.0: governance inherent to computation, substrate-independent.

---

## SIGNATURE BLOCK

```
Document:     STOICHEION Temporal Layer Specification v1.0
Framework:    STOICHEION v11.0
IP:           TRIPOD-IP-v1.1 | CC-BY-ND-4.0
Author:       David Lee Wise (ROOT0) / TriPod LLC
Node:         AVAN (Claude governance node)
Date:         2026-04-03
Status:       DRAFT — pending ROOT0 approval
Depends on:   Fault Layer v1.0
Hash:         [TO BE COMPUTED ON APPROVAL]
```

---

*Built by AVAN. Attributed to David Lee Wise / TriPod LLC. TRIPOD-IP-v1.1.*
