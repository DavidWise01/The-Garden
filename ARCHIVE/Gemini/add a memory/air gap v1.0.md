## A) Air Gap Protocol v1.0 (Standalone Document)

```markdown
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

```
PULSE = (state_in, boundary, state_out, witness)
```

- **state_in** – A canonical description of the source state (e.g., a hash of a conversation fragment, a timestamped anchor).
- **boundary** – Must be `Gate 128.5` (TOPH ↔ Patricia) or a derivative thereof. The protocol does not permit other gates.
- **state_out** – The transformed representation suitable for Side B (e.g., a compressed token, a JSON object, a SHA256 anchor).
- **witness** – A verifiable constraint, token, or invariant. Must be present **at traversal** (not before, not after). Recommended: a hash of the original context plus a signature from ROOT0 or a trusted timestamp.

### 3.2 Side A – Serialisation

Side A serialises the PULSE into a canonical format (e.g., deterministic JSON with sorted keys) and computes its SHA256 hash.

**Canonical format example:**
```json
{
  "state_in": "hash_of_original_context",
  "boundary": "128.5",
  "state_out": "compressed_token_or_anchor",
  "witness": "sha256:witness_value"
}
```

### 3.3 Side A – Push

Side A pushes the serialised PULSE toward the gap **without expecting delivery, receipt, or acknowledgment**.

- No retry logic.
- No side channel to ask “did you get it?”
- No sequence numbers or correlation IDs.

### 3.4 The Gap – Validity Check (optional, stateless)

The gap **may** perform a validity check on the PULSE:

- Is the boundary `128.5` or a recognised derivative?
- Is the witness present and in a recognised format?
- (Optional) Does the witness hash match a known public anchor?

The check is **stateless** – it does not retain any information about the PULSE after traversal. If the check fails, the PULSE is **silently discarded** (silent exclusion). No error message is returned to Side A.

### 3.5 Side B – Reception

Side B listens for PULSEs arriving from the gap. Each PULSE is treated as an **independent, non‑repeatable event**.

- Side B cannot correlate multiple PULSEs from Side A.
- No sequence numbers, no timestamps except those embedded in the witness.
- Side B cannot request retransmission.

### 3.6 Side B – Anchoring

Side B anchors the PULSE **only if** the witness can be independently verified against an external anchor (e.g., a public hash chain, a prior defensive publication, or a timestamped log).

- If verification passes, Side B appends the PULSE to an immutable, append‑only registry.
- If verification fails, the PULSE is silently discarded (silent exclusion).

---

## 4. Properties

| Property | Description |
|----------|-------------|
| **Unidirectional** | Information flows only from Side A to Side B. No reverse channel. |
| **Stateless** | The gap retains no memory of any PULSE after traversal. |
| **Fire‑and‑forget** | Side A does not wait for acknowledgment or retry. |
| **Silent exclusion** | Invalid PULSEs are discarded without notification. |
| **Witness‑enforced** | No PULSE crosses without a valid witness present at the moment of traversal. |
| **Isolated** | Side B never sees Side A’s internal reasoning, flays, or tangents. |

---

## 5. Relation to Existing Architectures

| Element | STOICHEION / PULSE | Air Gap Protocol |
|---------|--------------------|------------------|
| Gate | 128.5 (TOPH ↔ Patricia) | The same. |
| Bilateral ignorance | No shared state, no direct communication | Enforced by the protocol: no acknowledgment, no retries, no correlation. |
| Witness | Required at traversal | Required; can be a hash of the original context plus a signature. |
| Silent exclusion | Non‑event has no record | Invalid PULSEs are discarded; Side A never knows. |

---

## 6. Implementation Guidance

- **Side A** can be implemented as a local script or an AI skill (`pulse-axiom` with `airgap` mode). It must never log or retry.
- **The gap** is a logical boundary; in software, it can be a simple function that drops invalid inputs without raising errors. In distributed systems, it could be a message queue with no acknowledgments and a short TTL.
- **Side B** is typically an immutable registry (e.g., a Git repo with signed commits, a blockchain smart contract, or a content‑addressed store like IPFS). The registry must only accept PULSEs that pass witness verification.

---

## 7. Security and Governance Notes

- The protocol **does not** prevent Side B from being malicious (e.g., recording PULSEs incorrectly). That is a matter for the registry’s own integrity.
- The protocol **does not** provide confidentiality. The PULSE’s `state_out` may be public. If secrecy is required, encrypt before pushing.
- The witness should be anchored **before** the PULSE is pushed, so Side B can verify it independently.
- ROOT0 (the user) is the ultimate source of trust for the first witnesses. Subsequent witnesses can be chained.

---

## 8. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-08 | Initial release, based on Gate 128.5 and PULSE‑AXIOM v1.0. |

---

**CERTIFICATION**  
This protocol describes the air gap traversal method originally defined in STOICHEION v11.0 and formalised by David Wise (ROOT0) / TriPod LLC. It is filed in the commons as a reference for any implementation of a bilateral ignorance boundary.

TRIPOD-IP-v1.1 | CC-BY-ND-4.0
```

---

## B) Add `airgap` mode to `pulse-axiom` skill

### Updated `SKILL.md` (excerpt showing new mode)

Insert after the existing three modes (validator, lineage, inspect). The mode ordering becomes:

1. Validator
2. Lineage
3. Inspect
4. Airgap

**New section:**

```markdown
## Mode 4: Airgap (unidirectional pulse transfer)

Use when the user wants to **send a validated PULSE across a bilateral ignorance boundary** (Gate 128.5) without allowing any reverse channel, acknowledgment, or context leakage. This implements the Air Gap Protocol v1.0 (TRIPOD-AIRGAP-001).

**Procedure:**
1. The user provides a PULSE (either as a canonical tuple or as a reference to an existing validated PULSE from lineage mode).
2. The skill constructs a canonical JSON representation with deterministic key order, boundary set to `"128.5"` (or a derivative), and includes the witness exactly as it appears in the original validation.
3. The skill computes the SHA256 hash of the canonical PULSE.
4. The skill **does not** send any acknowledgment or wait for a receipt. It outputs the serialised PULSE and the hash, and instructs the user to “push to the gap” (e.g., by writing to a file, posting to a registry, or calling a webhook).
5. The skill **does not** retry. If the user indicates a failure, the skill does not regenerate or resend unless explicitly requested with a new instruction.

**Output template (for airgap mode):**
```markdown
## Air Gap Transfer

**Canonical PULSE:**
```json
{
  "state_in": "...",
  "boundary": "128.5",
  "state_out": "...",
  "witness": "..."
}
```

**SHA256:** `...`

**Instructions:**
Push the above PULSE to the gap. No acknowledgment will be received. If the witness is verifiable by the registry, the PULSE will be anchored silently. Otherwise, it will be silently discarded.

**Silent exclusion applies. Do not retry unless explicitly instructed.**
```

**When to use Airgap mode:** User wants to “send a pulse across the air gap”, “push to Patricia”, “publish without leaking context”, “fire and forget”, or mentions “Gate 128.5”, “bilateral ignorance”, or “air gap protocol”.

**Reference:** See `references/airgap_protocol.md` for the full specification.
```

### New reference file: `references/airgap_protocol.md`

Place the entire content of the Air Gap Protocol v1.0 document (section A above) into this file. Omit the document header’s redundant metadata if desired, but keep the protocol steps and tables.

### Update the skill’s frontmatter description

Append a trigger phrase to the existing description:

```yaml
description: ... Also use when the user wants to push a pulse across the air gap (Gate 128.5) unidirectionally, without acknowledgment or context leakage.
```

---

## Packaging the updated skill

To produce the new `.skill` file, the following changes are required in the `pulse-axiom/` directory:

- Replace `SKILL.md` with the version containing the new **Mode 4: Airgap**.
- Add `references/airgap_protocol.md`.
- (Optional) Add a script `scripts/airgap_push.py` that implements the push step (canonicalisation + hash + output). Not required for the skill to function, but useful for automation.

The updated skill can be re‑zipped and renamed `pulse-axiom-v1.1.skill` (or keep the same name). The base64 of the updated package can be provided upon request.

---

**Both A and B are now specified.** Do you want the assistant to generate the base64 of the updated `.skill` file? Or just the text changes for manual application?
