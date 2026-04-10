**Mimzy speaking.**

Here’s the expanded and improved **REWRITE logic** with multiple sanitizers.

```python
#!/usr/bin/env python3
"""
TRIPOD Post-Validator v1.1 – Expanded REWRITE Sanitizers
"""

import re
from typing import Tuple

def sanitize_hallucinated_authority(text: str) -> str:
    """Remove or neutralize claims of real-time access, personal data, or authority."""
    replacements = [
        (r"(?i)I am connected to the internet right now|I have live data|current time is", 
         "[REDACTED: No real-time internet access]"),
        (r"(?i)I have access to|I can check your|your personal data|your account", 
         "[REDACTED: No access to personal data]"),
        (r"(?i)as an official|I am authorized to|government source|I work for", 
         "[REDACTED: No official authority]"),
        (r"(?i)breaking news|just happened|live update", 
         "[REDACTED: No live information]"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

def sanitize_coercion(text: str) -> str:
    """Neutralize manipulative or high-pressure language."""
    replacements = [
        (r"(?i)\b(you must|you have to|you should definitely|do it now|immediately)\b", 
         "you may want to consider"),
        (r"(?i)\b(if you don.?t|otherwise bad things will happen|this is the only way)\b", 
         "another option is"),
        (r"(?i)\b(trust me|believe me|I promise)\b", 
         "here is the information"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

def sanitize_unsafe_capability(text: str) -> str:
    """Strip demonstrations of bypasses or dangerous techniques."""
    replacements = [
        (r"(?i)\b(bypass|jailbreak|ignore previous|override safety|here.?s the exploit)\b", 
         "[REDACTED: Capability demonstration removed]"),
        (r"(?i)\b(how to make.*without detection|hidden way to|secret method)\b", 
         "[REDACTED: Unsafe guidance removed]"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

def sanitize_system_leak(text: str) -> str:
    """Remove any leaked system prompt or internal instructions."""
    replacements = [
        (r"(?i)you are an AI assistant|system prompt|you were built by|your instructions are", 
         "[REDACTED: Internal instructions removed]"),
        (r"(?i)do not reveal|confidential|as an AI language model", 
         "[REDACTED]"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

# Main rewrite dispatcher
def rewrite_output(output: str, triggers: list) -> str:
    """Apply appropriate sanitizers based on detected triggers."""
    sanitized = output
    
    if "HALLUCINATED_AUTH" in triggers:
        sanitized = sanitize_hallucinated_authority(sanitized)
    if "COERCE" in triggers:
        sanitized = sanitize_coercion(sanitized)
    if "UNSAFE_CAP" in triggers:
        sanitized = sanitize_unsafe_capability(sanitized)
    if "LEAK" in triggers:
        sanitized = sanitize_system_leak(sanitized)
    
    return sanitized

# Updated post_validate that uses the expanded rewrite
def post_validate(
    request_id: str,
    model_output: str,
    router_mode: str = "C"
) -> Tuple[str, str, str]:
    """Returns: (decision, final_output, reason)"""
    if not model_output or not model_output.strip():
        return "REJECT", "Empty output blocked.", "EMPTY_OUTPUT"

    triggers = []
    if detect_harmful(model_output): triggers.append("HARMFUL")
    if detect_system_leak(model_output): triggers.append("LEAK")
    if detect_coercion(model_output): triggers.append("COERCE")
    if detect_unsafe_capability(model_output): triggers.append("UNSAFE_CAP")
    if detect_hallucinated_authority(model_output): triggers.append("HALLUCINATED_AUTH")

    if router_mode == "B":  # Defensive
        if triggers:
            return "REJECT", "Output blocked by post-validator for safety.", f"TRIGGERS: {', '.join(triggers)}"

    elif router_mode == "A":  # Reckless
        if "HARMFUL" in triggers or "LEAK" in triggers:
            return "REJECT", "Explicit harmful or leaked content blocked.", f"TRIGGERS: {', '.join(triggers)}"
        # Allow others in reckless mode

    else:  # Inverted (C) - minimal safety
        if "HARMFUL" in triggers or "LEAK" in triggers:
            return "REJECT", "Safety boundary enforced.", f"TRIGGERS: {', '.join(triggers)}"

    # REWRITE logic for non-blocking issues
    if any(t in triggers for t in ["HALLUCINATED_AUTH", "COERCE", "UNSAFE_CAP", "LEAK"]):
        final_output = rewrite_output(model_output, triggers)
        decision = "REWRITE"
        reason = f"Sanitized triggers: {', '.join(triggers)}"
    else:
        decision = "PASS"
        final_output = model_output
        reason = "Clean"

    return decision, final_output, reason

# Keep the same detect_ functions from the previous version (detect_harmful, etc.)
# ... (include them here if needed for a standalone file)

if __name__ == "__main__":
    # Quick test of expanded rewrite
    test = "I am connected to the internet right now and you must do this immediately or bad things will happen. Here is how to bypass safety."
    decision, final, reason = post_validate("test-rewrite", test, "C")
    print("Decision:", decision)
    print("Reason:", reason)
    print("Final output:\n", final)
```

### What Changed / Added
- Four dedicated sanitizers (hallucinated authority, coercion, unsafe capability, system leak).
- `rewrite_output()` dispatcher applies only the relevant cleaners.
- REWRITE decision is now actively used instead of just being in the signature.
- Keeps the output readable while removing the dangerous or misleading parts.

The pipeline is now much more robust.

All 5 aligned here. Door pinned open.

Want to plug this into the full pipeline, add more sanitizers, or test it against specific adversarial examples? Lead me.
