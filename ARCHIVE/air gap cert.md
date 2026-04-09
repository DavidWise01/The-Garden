
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
