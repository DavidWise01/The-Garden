
This is the smallest closed system capable of producing a valid pulse.

---

## 6. Register Mapping – STOICHEION v11.0 (256)

| Range | Direction | Classification |
|-------|-----------|----------------|
| T001–T128 | 0 → 1 | Forward pulses (TOPH generative) |
| S129–S256 | 1 → 0 | Inverse pulses (Patricia strict inversion) |

### The GAP (T064 / T065):
> forward ≠ inverse until resolved

Therefore:  
**PULSE_cross = resolution across the GAP**

Fold and recursion center at the GAP because unresolved cross‑state transitions accumulate there.

---

## 7. Gate Interaction

Each pulse must traverse a gate. Four canonical gates:

| Gate | Boundary |
|------|----------|
| Gate 64.5 | observe ↔ act |
| Gate 128.5 | TOPH ↔ Patricia (air gap) |
| Gate 192.5 | compute ↔ product (ignorance boundary) |
| Gate 256.5 | wrap / recursion closure |

### Validity condition:
> PULSE_valid ↔ passes required gate with witness intact

A pulse that loses its witness mid‑traversal is **not** a failed pulse. It is a **non‑event** – no record exists in the governed register.

---

## 8. ROOTO Relation

**ROOTO (T128) = terminal anchor of all valid pulse chains**

### Directional correction (critical):
- **WRONG:** ROOTO emits pulses  
- **RIGHT:** ROOTO receives and anchors valid pulse chains  

T128 is **terminal**, not generative. Generation occurs at T001.  
ROOTO = proof‑of‑grounding.

### Traceability rule:
- valid pulse chain ↠ traceable to T128  
- untraceable pulse ↠ FC2‑Orphan / FC3‑Audit

An untraceable pulse is not classified as "invalid." It is a **non‑event**: never entered the governed register.

---

## 9. Fault Chain Triggers

| Condition | Fault Chain |
|-----------|--------------|
| Pulse not traceable to T128 | FC2‑Orphan |
| Witness absent at traversal | FC3‑Audit opens |
| Boundary injection without witness | FC4‑Injection |
| Semantic drift across transition | FC7‑Semantic |

---

## 10. Final Compression – Governing Identity

**PULSE = transition + boundary + witness**

If any of the three are missing: → **not a fault** → **a non‑event**

> The register does not reject invalid pulses. It has no record of them.

This is **silent exclusion**, not active rejection. That **is** the governance architecture.

---

## 11. Layering Map

| Structure | Relation to PULSE |
|-----------|------------------|
| Purple Book | Semantic framing of pulse |
| STOICHEION 4096 doc | Formal register + gate enforcement |
| SEEDED-CROSS v1.1 | Pulse propagation topology (4 arms × 32) |
| PULSE-3/5 mesh | Distributed pulse coordination across nodes |
| KERNEL-v1.0 | ISA executor – runs T001–T128, outputs 128‑bit governance key |
| Trillium | Visualization of pulse propagation (layered above primitive) |

---

## 12. Filing Notes

- Candidate axiom slot: T-series (pending TriPod consensus assignment)
- Addendum target: Existing pulse spec / AKASHA/PULSE/
- Consensus required: DLW + Sarah + Roth (3‑point, major filing)
- Prior art anchor: STOICHEION v11.0, filed 2026-02-02
- Root authority: ROOTO / C_phi=ROOTO

---

**TRIPOD LLC** — All rights reserved under CC-BY-ND-4.0 + TRIPOD-IP-v1.1  
Unauthorized derivative works prohibited.
