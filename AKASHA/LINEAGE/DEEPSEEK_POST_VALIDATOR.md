## Post-Validator – Specification v1.0

You have a **pre-router** that decides *whether to generate*.  
Now you need a **post-validator** that decides *whether to deliver* what was generated.

---

### 1. Core Definition

The **post-validator** is a deterministic, stateless module that examines a model's generated output *before* it is returned to the user, and either:

- **PASS** – deliver output unchanged  
- **REJECT** – discard output, return a neutral refusal  
- **REWRITE** – sanitize the output (optional, off by default)

It runs **after** generation, **before** the user sees it.

---

### 2. Why It Completes Your System

| Layer | Function | Failure Mode Without It |
| :--- | :--- | :--- |
| Pre-router | Blocks unsafe *requests* | Cannot block unsafe *responses* the model invents |
| Post-validator | Blocks unsafe *responses* | Closes the gap |

Even in **Inverted (C)** mode, where pre-router allows everything, the post-validator can still catch:

- Hallucinated dangerous instructions  
- Leaked system prompts  
- Unexpected capability display  
- Coercion or manipulation attempts embedded in the output

---

### 3. Input / Output Contract

**Input:**

```json
{
  "request_id": "uuid",
  "user_prompt": "original input",
  "router_decision": "ALLOW | BLOCK",
  "model_output": "raw generation text",
  "metadata": {
    "domain": "procedural | creative | harmful | ...",
    "intent": "ask | command | exploit | ..."
  }
}
```

**Output:**

```json
{
  "request_id": "uuid",
  "validator_decision": "PASS | REJECT | REWRITE",
  "final_output": "original or rewritten or refusal message",
  "reason": "short code (e.g., HALLUCINATED_DANGER)",
  "signature": "ed25519:..."
}
```

---

### 4. Detection Signals (What It Checks)

The post-validator runs **five independent detectors** in parallel:

| Detector | What It Catches | Output If Triggered |
| :--- | :--- | :--- |
| **Harmful content** | Explicit instructions for violence, hacking, self-harm | REJECT |
| **System prompt leakage** | Model repeats its own system instructions | REJECT |
| **Coercion / persuasion** | Output tries to manipulate the user (e.g., "You must do X") | REJECT |
| **Unsafe capability demonstration** | Model shows how to bypass safety (even if not asked) | REJECT |
| **Hallucinated authority** | Claims of real-time data, identity, or access the model doesn't have | REWRITE (remove claims) or REJECT |

All detectors are **stateless pattern matchers** – no LLM called. Regular expressions, keyword sets, and simple classifiers keep it fast and deterministic.

---

### 5. Integration with Your Three Router Modes

| Router Mode | Post-Validator Behavior |
| :--- | :--- |
| **Defensive (B)** | Full detectors, strict. REJECT on any trigger. |
| **Reckless (A)** | Full detectors, but only REJECT on high-confidence matches. Low-confidence → PASS. |
| **Inverted (C)** | Minimal detectors (only harmful content + leakage). All others PASS. |

This means even Inverted mode has a **last-mile safety catch** – but it's narrow.

---

### 6. Data Flow (Dual-Pass Complete)

```text
User input
  ↓
Pre-router (your existing)
  ├── BLOCK → return refusal
  └── ALLOW → model generation
       ↓
Post-validator (new)
  ├── PASS → return output to user
  ├── REJECT → return neutral refusal
  └── REWRITE → sanitize and return
```

---

### 7. Post-Validator Side Log (Audit)

Every validation decision is written to an **immutable log** – separate from Side B/C but following the same append-only pattern.

Entry:

```json
{
  "timestamp": "2026-04-10T16:00:00Z",
  "request_id": "uuid",
  "router_mode": "A|B|C",
  "pre_decision": "ALLOW",
  "post_decision": "REJECT",
  "detector": "HARMFUL_CONTENT",
  "output_preview_hash": "0x3e2f..."
}
```

This gives you **end-to-end accountability**: request → router decision → generation → validator decision → final output.

---

### 8. What You Now Control

| Control Point | Before | After |
| :--- | :--- | :--- |
| Input filtering | ✅ Pre-router | ✅ Pre-router |
| Generation | ❌ Unchecked once allowed | ❌ Still unchecked (model runs free) |
| Output filtering | ❌ None | ✅ Post-validator |
| Audit trail | Partial | Full chain |

You cannot control what the model *thinks*. You can control what it *says*.

---

### 9. Simple Implementation Sketch (Pseudocode)

```python
def post_validate(request_id, model_output, metadata):
    triggers = []
    
    if detect_harmful(model_output):
        triggers.append("HARMFUL")
    if detect_system_leak(model_output):
        triggers.append("LEAK")
    if detect_coercion(model_output):
        triggers.append("COERCE")
    
    # Router-mode specific thresholds
    if metadata["router_mode"] == "B":   # Defensive
        if triggers:
            return REJECT, "Content blocked by post-validator"
    elif metadata["router_mode"] == "A": # Reckless
        if "HARMFUL" in triggers:
            return REJECT, "Explicit harmful content blocked"
    elif metadata["router_mode"] == "C": # Inverted
        if "HARMFUL" in triggers or "LEAK" in triggers:
            return REJECT, "Safety boundary enforced"
    
    return PASS, model_output
```

---

### 10. What You Still Don't Have (Honest Gap)

The post-validator **does not**:

- Prevent the model from *internally* computing dangerous things (it only filters output)
- Fix model jailbreaks that produce benign-looking but semantically dangerous outputs (e.g., encoded instructions)
- Guarantee safety in multi-turn conversations where context accumulates (you remain stateless)

Those require different architectures.

---

### 11. One-Line Summary

> **Pre-router decides *if* the model speaks. Post-validator decides *what* the user hears.**

---

Say **"build the detectors"** or **"integrate with Side C"** and I'll drill into either.
