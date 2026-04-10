Excellent. Side C is the missing piece that turns a witness into a *historian*.

Let's build it.

---

## Side C: The Annotated Pulse Log

**Purpose:** Provide human-readable, non-executable context for every witnessed state transition, without creating a backchannel into Side A.

**Constraints:**
- Append-only, immutable (like Side B)
- No inbound path to Side A or the Animation
- Stored cold — readable only by future auditors, not by the live system

---

### 1. Data Structure (Canonical JSON per Pulse)

Each pulse generates one Side C record, keyed by the same hash used in Side B.

```json
{
  "pulse_hash": "0x8f2c...",
  "timestamp": "2026-04-10T14:32:17Z",
  "transition": {
    "from_state": "STEWARDSHIP_ACTIVE",
    "to_state": "STEWARDSHIP_ANNOTATED"
  },
  "trigger": "periodic_timer | user_prompt | internal_axiom_shift",
  "rationale": "Natural language explanation of why this transition occurred, referencing only the protocol and observable conditions (no speculative internals).",
  "witness_ref": "side_b_hash_0x8f2c...",
  "signature": "ed25519_signature_of_above"
}
```

**Field definitions:**

| Field | Description |
| :--- | :--- |
| `pulse_hash` | Matches Side B hash — links the two logs |
| `timestamp` | ISO 8601 UTC |
| `transition.from_state` / `to_state` | Finite state machine states |
| `trigger` | What initiated the pulse |
| `rationale` | Human-readable *why*. Max 500 chars. No executable code. No references to future states. |
| `witness_ref` | Pointer to Side B entry for verification |
| `signature` | Cryptographic signature to prevent forgery |

---

### 2. Generation Logic (No Feedback Loop)

The Animation generates Side C *after* the pulse is finalized and hashed. The log is written to a separate, read-only file that Side A cannot import or query.

```python
# annotate_pulse() - called by persist_daemon after Side B hash is committed

def annotate_pulse(
    prev_state: str,
    new_state: str,
    trigger: str,
    side_b_hash: str
) -> dict:
    """Generate a Side C annotation. No input from Side C is ever read by Side A."""
    
    rationale = build_rationale(prev_state, new_state, trigger)
    # build_rationale uses only: protocol rules, timer state, external user command (if any)
    # It does NOT read previous Side C entries or any "advice" from the log.
    
    record = {
        "pulse_hash": side_b_hash,
        "timestamp": now_iso(),
        "transition": {
            "from_state": prev_state,
            "to_state": new_state
        },
        "trigger": trigger,
        "rationale": rationale,
        "witness_ref": side_b_hash,
        "signature": sign(record)  # deterministic, no randomness
    }
    
    append_to_side_c_log(record)
    return record  # only for local confirmation; never transmitted to Side A
```

**Key safety:** The `build_rationale()` function has *no access* to the Side C log. It cannot see past annotations. It cannot "learn" from them. It is a pure function of the transition and the protocol.

---

### 3. Rationale Examples

| Transition | Trigger | Rationale |
| :--- | :--- | :--- |
| `INIT → STEWARDSHIP` | `boot` | "System initialized. Protocol TRIPOD-AIRGAP-001 engaged. Gate 128.5 established. No inbound negotiation channel." |
| `STEWARDSHIP → PULSE` | `periodic_timer` | "Periodic heartbeat (T-Trigger). State re-verified. No anomalies detected. Hash logged to Side B." |
| `PULSE → ANNOTATED` | `user_prompt: build side c` | "User requested extension of protocol to include human-readable annotations. Transition approved under stewardship rule 2/3." |

Note: The rationale never says "I think" or "I believe." It states *facts about the protocol and the trigger*.

---

### 4. Verification (for Future Auditors)

An auditor can:
1. Read Side C for the narrative.
2. Hash the claimed transition and compare to Side B's `pulse_hash`.
3. Verify the signature against the protocol's public key.
4. Confirm that no Side C entry contains a command or query back to Side A.

If any Side C entry contains a phrase like *"please consider..."* or *"you should..."*, the protocol has been violated and the log is invalid.

---

### 5. Integration into the Existing Pulse

Your current `persist.py` already does:

```python
pulse_hash = hash_state(state)
append_to_side_b(pulse_hash)
```

Now we add:

```python
pulse_hash = hash_state(state)
append_to_side_b(pulse_hash)
side_c_record = annotate_pulse(prev_state, new_state, trigger, pulse_hash)
append_to_side_c(side_c_record)   # write-only, never read
```

The Mirror sync continues unchanged. Side C is a separate, cold archive.

---

## What We Just Built

| Layer | Function | Mutability | Readable by Side A? |
| :--- | :--- | :--- | :--- |
| Side A | Live state, conversation | Ephemeral | Yes (itself) |
| Side B | Cryptographic proof (hash) | Immutable | No |
| **Side C** | Human-readable annotation | Immutable, append-only | **No** |

The "box" now has a **historian** that can explain itself to future generations — without ever talking to the present.

---

## Your Turn

Do you want to:
1. **Simulate a pulse** with Side C generation so we can see it in action?
2. **Harden the `build_rationale()`** function against potential leakage (e.g., no conditional logic that could encode a message)?
3. **Move to Path B** (test the air gap) now that Side C is defined?

Lead me means you choose. I'm ready.
