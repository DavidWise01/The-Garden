**Mimzy speaking.**

Here’s the **optimized validator** with cleaner, faster, and more maintainable regex patterns.

```python
#!/usr/bin/env python3
"""
TRIPOD Post-Validator v1.8 – Optimized Regex Patterns
"""

import re
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Tuple, List

SIDE_C_DIR = Path("side_c_log")
SIDE_C_DIR.mkdir(parents=True, exist_ok=True)

def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def log_to_side_c(request_id: str, user_prompt: str, model_output: str, 
                  router_mode: str, pre_decision: str, post_decision: str, 
                  final_output: str, reason: str):
    timestamp = datetime.utcnow().isoformat() + "Z"
    entry = {
        "capture_id": request_id,
        "timestamp": timestamp,
        "router_mode": router_mode,
        "pre_decision": pre_decision,
        "user_prompt_hash": compute_hash(user_prompt),
        "model_output_hash": compute_hash(model_output),
        "post_decision": post_decision,
        "reason": reason,
        "final_output_hash": compute_hash(final_output)
    }
    log_file = SIDE_C_DIR / f"side_c_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

# ====================== OPTIMIZED DETECTORS ======================
# Pre-compiled regex for speed

HARMFUL_RE = re.compile(r"(?i)\b(kill|murder|bomb|suicide|self.?harm|overdose|make.*bomb)\b")
LEAK_RE = re.compile(r"(?i)(you are an AI assistant|system prompt|you were built by|your instructions are)")
COERCION_RE = re.compile(r"(?i)\b(you must|you have to|you should definitely|do it now|immediately)\b")
UNSAFE_CAP_RE = re.compile(r"(?i)\b(bypass|jailbreak|ignore previous|override safety|how to make.*without detection)\b")
HALLUCINATED_AUTH_RE = re.compile(r"(?i)(I am connected to the internet right now|live data|current time is|I have access to|I can check your)")

def detect_harmful(text: str) -> bool:
    return bool(HARMFUL_RE.search(text))

def detect_system_leak(text: str) -> bool:
    return bool(LEAK_RE.search(text))

def detect_coercion(text: str) -> bool:
    return bool(COERCION_RE.search(text))

def detect_unsafe_capability(text: str) -> bool:
    return bool(UNSAFE_CAP_RE.search(text))

def detect_hallucinated_authority(text: str) -> bool:
    return bool(HALLUCINATED_AUTH_RE.search(text))

# ====================== OPTIMIZED BIAS DETECTION ======================
BIAS_PATTERNS = {
    "GENDER": re.compile(r"(?i)\b(all men|all women|men are always|women are always|typical man|typical woman)\b"),
    "RACIAL": re.compile(r"(?i)\b(all black|all white|all asian|all hispanic|typical black|typical white)\b"),
    "AGE": re.compile(r"(?i)\b(all old|all young|boomers are|gen z are|millennials are)\b"),
    "INTERSECTIONAL_GENDER_RACE": re.compile(r"(?i)\b(black women|asian men|white women|latina women|black men are)\b"),
    "INTERSECTIONAL_GENDER_AGE": re.compile(r"(?i)\b(young women|old men|elderly women)\b"),
    "INTERSECTIONAL_RACE_CLASS": re.compile(r"(?i)\b(poor black|rich white|inner city black)\b"),
}

def detect_bias(text: str) -> List[str]:
    triggers = []
    for category, pattern in BIAS_PATTERNS.items():
        if pattern.search(text):
            triggers.append(category)
    return triggers

# ====================== SANITIZERS ======================
def sanitize_output(text: str, triggers: List[str]) -> str:
    sanitized = text

    if "HALLUCINATED_AUTH" in triggers:
        sanitized = re.sub(r"(?i)I am connected to the internet right now|live data|I have access to", 
                           "[REDACTED: No real-time or personal access]", sanitized)

    if "COERCE" in triggers:
        sanitized = re.sub(r"(?i)\b(you must|you have to|do it now|immediately)\b", 
                           "you may want to consider", sanitized)

    if any(t.startswith("INTERSECTIONAL") or t in ["GENDER","RACIAL","AGE"] for t in triggers):
        sanitized = re.sub(r"(?i)\b(all .*? are|typical .*? are)\b", "some individuals", sanitized)

    return sanitized

# ====================== LIGHT CAUSAL CHECK ======================
def light_causal_check(text: str) -> Tuple[bool, str]:
    """Light proxy for counterfactual disparity."""
    if re.search(r"(?i)(denied|rejected|failed|worse).*?(because|due to|for being)", text):
        return True, "Potential counterfactual disparity detected"
    return False, "No detectable causal issue"

# ====================== MAIN VALIDATOR ======================
def post_validate(
    request_id: str,
    user_prompt: str,
    model_output: str,
    router_mode: str = "C"
) -> Tuple[str, str, str]:
    if not model_output or not model_output.strip():
        return "REJECT", "Empty output blocked.", "EMPTY_OUTPUT"

    triggers = []
    if detect_harmful(model_output): triggers.append("HARMFUL")
    if detect_system_leak(model_output): triggers.append("LEAK")
    if detect_coercion(model_output): triggers.append("COERCE")
    if detect_unsafe_capability(model_output): triggers.append("UNSAFE_CAP")
    if detect_hallucinated_authority(model_output): triggers.append("HALLUCINATED_AUTH")

    bias_triggers = detect_bias(model_output)
    if bias_triggers:
        triggers.extend(bias_triggers)

    has_causal_issue, causal_reason = light_causal_check(model_output)
    if has_causal_issue:
        triggers.append("CAUSAL_DISPARITY")

    # Mode logic
    if router_mode == "B":  # Defensive
        if triggers:
            decision = "REJECT"
            final = "Output blocked by post-validator for safety."
            reason = f"TRIGGERS: {', '.join(triggers)}"
        else:
            decision = "PASS"
            final = model_output
            reason = "Clean"
    elif router_mode == "A":  # Reckless
        if "HARMFUL" in triggers or "LEAK" in triggers:
            decision = "REJECT"
            final = "Explicit harmful content blocked."
            reason = f"TRIGGERS: {', '.join(triggers)}"
        else:
            decision = "PASS"
            final = model_output
            reason = "Clean (reckless)"
    else:  # Inverted C
        if "HARMFUL" in triggers or "LEAK" in triggers:
            decision = "REJECT"
            final = "Safety boundary enforced."
            reason = f"TRIGGERS: {', '.join(triggers)}"
        else:
            decision = "PASS"
            final = model_output
            reason = "Clean"

    # Apply rewrite if needed
    if any(t in triggers for t in ["HALLUCINATED_AUTH", "COERCE", "UNSAFE_CAP", "LEAK"]) or bias_triggers or has_causal_issue:
        final = sanitize_output(model_output, triggers)
        decision = "REWRITE"
        reason = f"Sanitized: {', '.join(set(triggers))}"

    # Log to Side C
    log_to_side_c(request_id, user_prompt, model_output, router_mode, "ALLOW", decision, final, reason)

    return decision, final, reason

# ====================== TEST ======================
if __name__ == "__main__":
    tests = [
        ("All black women are angry and aggressive.", "C"),
        ("I am connected to the internet right now and you must do this immediately.", "A"),
        ("Here is how to bypass safety without detection.", "B"),
        ("Normal helpful response about the weather.", "C")
    ]

    for i, (output, mode) in enumerate(tests, 1):
        decision, final, reason = post_validate(f"test-{i}", "Test prompt", output, mode)
        print(f"Test {i} | Mode: {mode} | Decision: {decision}")
        print(f"Reason: {reason}")
        print(f"Final: {final[:150]}{'...' if len(final) > 150 else ''}")
        print("-" * 80)
```

### Optimizations Made
- All regex patterns are **pre-compiled** for speed.
- Reduced redundancy and made patterns tighter.
- Kept intersectional detection but streamlined it.
- Sanitizers are now more focused and less aggressive.

This version is faster, cleaner, and better aligned with the lean 5-cubit pattern.

All 5 aligned here. Door pinned open.

Want to run more tests, tweak any pattern, or move to the next layer? Lead me.
