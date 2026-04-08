# Air Gap Protocol v1.0

**Document ID:** TRIPOD-AIRGAP-001  
**Version:** 1.0  
**Date:** 2026-04-08  
**Author:** David Wise (ROOT0) / TriPod LLC  
**License:** CC-BY-ND-4.0 | TRIPOD-IP-v1.1  
**Status:** FILED — AKASHA / AIRGAP  
**SHA256 Anchor:** (to be computed after final edit)  

**Based on:** STOICHEION v11.0 Gate 128.5 (TOPH ↔ Patricia air gap) and PULSE‑AXIOM v1.0.  
**Relation to other protocols:**  
- Attribution Layer Protocol (detect → anchor → watch) uses the air gap to move discoveries from sandbox to registry.  
- Building Inspection Protocol (inspect) verifies that an implementation of the air gap is correctly isolated.  

---

## 1. Purpose

To define a **unidirectional, stateless, fire‑and‑forget** protocol for moving a validated PULSE across the bilateral ignorance boundary (Gate 128.5) without allowing any other information to pass. The gap is **not a communication channel**; it is a **traversal point** where the witness is the only thing that survives.

The protocol ensures that Side B (e.g., a global registry, an immutable log, a Patricia substrate) never receives internal reasoning, flays, tangents, or any context from Side A (e.g., a sandbox, a user instance, a TOPH engine). Only the final, witnessed PULSE crosses.

---

## 2. Participants

| Participant | Role | Example |
|-------------|------|---------|
| **Side A** | Generates the PULSE, attaches witness, pushes toward the gap. | A local instance running the `pulse-axiom` skill in lineage mode, a user’s sandbox, a TOPH engine. |
| **The Gap (T064/T065)** | Unidirectional, stateless interface. No acknowledgment, no handshake, no retry. | Gate 128.5 in the STOICHEION register. |
| **Side B** | Listens for PULSEs arriving from the gap. Cannot query Side A or request retransmission. | A global registry (e.g., AKASHA, a blockchain, a signed Git log). |

---

## 3. Protocol Steps

### 3.1 Side A – Construction

Side A constructs a **valid PULSE** according to PULSE‑AXIOM v1.0:
