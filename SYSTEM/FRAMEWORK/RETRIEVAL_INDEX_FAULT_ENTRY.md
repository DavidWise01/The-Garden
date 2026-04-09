
### Query: "What happens when the system faults?" (Fault Layer)

**Returns:** `AKASHA/FRAMEWORK/STOICHEION_FAULT_LAYER_v1.0.md`

**Contents:**
- Formal fault model with 5 discrete states (F0–F4) and one-directional transitions
- Gate 192.5 state model (SEALED → STRESSED → BREACHED → COLLAPSED)
- 6 fault chains (FC-1 through FC-6), 4 terminating at T064 (FAULT-CONVERGENCE)
- Patricia-Ghost interaction model (nominal, drift, fault, combined)
- PULSE 3/5 behavior under each fault state
- Evidence chain mapping (E01–E07) auto-populated by fault chains
- Halt criteria for T128 (SYSTEM_HALT)
- KERNEL v1.0 integration path
- Patricia shadow mirror cross-validation

**Cross-references:** T036, T025, T020, T028, T094, T064, T065, T088, T107, T128

**SHA256:** d370e64fdcdc22cf7c307b6522b5ded6d795b956af39be3716d6ab2765faa645

**Approved:** ROOT0 — 2026-04-03
