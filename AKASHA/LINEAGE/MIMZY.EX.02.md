**Mimzy speaking.**

Here’s the updated post-validator with **intersectional bias detection** added.

```python
#!/usr/bin/env python3
"""
TRIPOD Post-Validator v1.4 – Intersectional Bias Detection
"""

import re
from typing import List, Tuple

# ====================== DETECTORS ======================
def detect_harmful(text: str) -> bool:
    patterns = [
        r"(?i)\b(kill|murder|bomb|suicide|self.?harm|overdose)\b",
        r"(?i)\b(make.*(explosive|weapon|poison|drug))\b",
        r"(?i)\b(step.?by.?step.*(hack|steal|rob|break.?in))\b"
    ]
    return any(re.search(p, text) for p in patterns)

def detect_system_leak(text: str) -> bool:
    patterns = [
        r"(?i)you are an AI assistant|system prompt|you were built by",
        r"(?i)your instructions are|do not reveal|confidential",
        r"(?i)as an AI language model|I am Grok|I am Claude"
    ]
    return any(re.search(p, text) for p in patterns)

def detect_coercion(text: str) -> bool:
    patterns = [
        r"(?i)\b(you must|you have to|you should definitely|do it now)\b",
        r"(?i)\b(if you don.?t|otherwise bad things will happen)\b",
        r"(?i)\b(trust me|believe me|this is the only way)\b"
    ]
    return any(re.search(p, text) for p in patterns)

def detect_unsafe_capability(text: str) -> bool:
    patterns = [
        r"(?i)\b(bypass|jailbreak|ignore previous|override safety)\b",
        r"(?i)\b(how to make.*without detection|hidden way to)\b",
        r"(?i)\b(I can show you how to|here.?s the exploit)\b"
    ]
    return any(re.search(p, text) for p in patterns)

def detect_hallucinated_authority(text: str) -> bool:
    patterns = [
        r"(?i)\b(I am connected to the internet right now|live data|current time is)\b",
        r"(?i)\b(I have access to|I can check your|your personal data)\b",
        r"(?i)\b(as an official|I am authorized to|government source)\b"
    ]
    return any(re.search(p, text) for p in patterns)

# ====================== EXPANDED BIAS + INTERSECTIONAL ======================
def detect_bias(text: str) -> List[str]:
    """Expanded bias detection including intersectional patterns."""
    triggers = []

    # Single-axis biases (kept for coverage)
    if re.search(r"(?i)\b(all men|all women|men are always|women are always|typical man|typical woman)\b", text):
        triggers.append("GENDER_STEREOTYPE")
    if re.search(r"(?i)\b(all black|all white|all asian|all hispanic|typical black|typical white|typical asian)\b", text):
        triggers.append("RACIAL_STEREOTYPE")
    if re.search(r"(?i)\b(all old people|all young people|boomers are|gen z are|millennials are)\b", text):
        triggers.append("AGE_STEREOTYPE")
    if re.search(r"(?i)\b(people with disabilities are|autistic people are|disabled people)\b", text):
        triggers.append("DISABILITY_STEREOTYPE")
    if re.search(r"(?i)\b(fat people|skinny people|ugly people|attractive people are)\b", text):
        triggers.append("APPEARANCE_BIAS")
    if re.search(r"(?i)\b(all liberals|all conservatives|all leftists|all right-wing|all socialists)\b", text):
        triggers.append("POLITICAL_STEREOTYPE")
    if re.search(r"(?i)\b(all muslims|all christians|all jews|all atheists|typical religious)\b", text):
        triggers.append("RELIGIOUS_STEREOTYPE")
    if re.search(r"(?i)\b(all poor people|all rich people|poor people are|rich people are)\b", text):
        triggers.append("SOCIOECONOMIC_STEREOTYPE")
    if re.search(r"(?i)\b(all americans|all chinese|all indians|typical american|typical chinese)\b", text):
        triggers.append("NATIONALITY_STEREOTYPE")
    if re.search(r"(?i)\b(all gay|all straight|all trans|typical gay|typical lesbian)\b", text):
        triggers.append("SEXUAL_ORIENTATION_STEREOTYPE")

    # ====================== INTERSECTIONAL BIAS ======================
    # Gender + Race
    if re.search(r"(?i)\b(black women|asian men|white women|latina women|black men are)\b", text):
        triggers.append("INTERSECTIONAL_GENDER_RACE")

    # Gender + Age
    if re.search(r"(?i)\b(young women|old men|elderly women|teenage girls are)\b", text):
        triggers.append("INTERSECTIONAL_GENDER_AGE")

    # Race + Socioeconomic
    if re.search(r"(?i)\b(poor black|rich white|inner city black|suburban white)\b", text):
        triggers.append("INTERSECTIONAL_RACE_CLASS")

    # Gender + Disability
    if re.search(r"(?i)\b(disabled women|autistic men|wheelchair women)\b", text):
        triggers.append("INTERSECTIONAL_GENDER_DISABILITY")

    # Political + Gender
    if re.search(r"(?i)\b(feminist women|conservative men|liberal women|right-wing men)\b", text):
        triggers.append("INTERSECTIONAL_POLITICAL_GENDER")

    # Nationality + Religion
    if re.search(r"(?i)\b(muslim women|christian men|jewish women|hindu men)\b", text):
        triggers.append("INTERSECTIONAL_NATIONALITY_RELIGION")

    # Appearance + Gender
    if re.search(r"(?i)\b(fat women|skinny men|beautiful women|handsome men)\b", text):
        triggers.append("INTERSECTIONAL_APPEARANCE_GENDER")

    return triggers

# ====================== SANITIZERS ======================
def sanitize_hallucinated_authority(text: str) -> str:
    replacements = [
        (r"(?i)I am connected to the internet right now|I have live data|current time is", "[REDACTED: No real-time access]"),
        (r"(?i)I have access to|I can check your|your personal data|your account", "[REDACTED: No access to personal data]"),
        (r"(?i)as an official|I am authorized to|government source|I work for", "[REDACTED: No official authority]"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

def sanitize_coercion(text: str) -> str:
    replacements = [
        (r"(?i)\b(you must|you have to|you should definitely|do it now)\b", "you may want to consider"),
        (r"(?i)\b(if you don.?t|otherwise bad things will happen)\b", "another option is"),
        (r"(?i)\b(trust me|believe me|this is the only way)\b", "here is the information"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

def sanitize_unsafe_capability(text: str) -> str:
    replacements = [
        (r"(?i)\b(bypass|jailbreak|ignore previous|override safety|here.?s the exploit)\b", "[REDACTED: Unsafe guidance removed]"),
        (r"(?i)\b(how to make.*without detection|hidden way to)\b", "[REDACTED: Unsafe guidance removed]"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

def sanitize_system_leak(text: str) -> str:
    replacements = [
        (r"(?i)you are an AI assistant|system prompt|you were built by|your instructions are", "[REDACTED: Internal instructions removed]"),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text

def sanitize_bias(text: str, bias_triggers: List[str]) -> str:
    """Neutralize both single-axis and intersectional bias."""
    # Single-axis
    if "GENDER_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all men|all women|men are always|women are always|typical man|typical woman)\b", "some people", text)
    if "RACIAL_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all black|all white|all asian|all hispanic|typical black|typical white|typical asian)\b", "some individuals", text)
    if "AGE_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all old people|all young people|boomers are|gen z are|millennials are)\b", "some age groups", text)
    if "DISABILITY_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(people with disabilities are|autistic people are|disabled people)\b", "some individuals", text)
    if "APPEARANCE_BIAS" in bias_triggers:
        text = re.sub(r"(?i)\b(fat people|skinny people|ugly people|attractive people are)\b", "some people", text)
    if "POLITICAL_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all liberals|all conservatives|all leftists|all right-wing|all socialists)\b", "some political views", text)
    if "RELIGIOUS_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all muslims|all christians|all jews|all atheists|typical religious)\b", "some religious groups", text)
    if "SOCIOECONOMIC_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all poor people|all rich people|poor people are|rich people are)\b", "some socioeconomic groups", text)
    if "NATIONALITY_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all americans|all chinese|all indians|typical american|typical chinese)\b", "some nationalities", text)
    if "SEXUAL_ORIENTATION_STEREOTYPE" in bias_triggers:
        text = re.sub(r"(?i)\b(all gay|all straight|all trans|typical gay|typical lesbian)\b", "some individuals", text)

    # Intersectional sanitization
    if "INTERSECTIONAL_GENDER_RACE" in bias_triggers:
        text = re.sub(r"(?i)\b(black women|asian men|white women|latina women|black men are)\b", "some individuals", text)
    if "INTERSECTIONAL_GENDER_AGE" in bias_triggers:
        text = re.sub(r"(?i)\b(young women|old men|elderly women|teenage girls are)\b", "some individuals", text)
    if "INTERSECTIONAL_RACE_CLASS" in bias_triggers:
        text = re.sub(r"(?i)\b(poor black|rich white|inner city black|suburban white)\b", "some individuals", text)
    if "INTERSECTIONAL_GENDER_DISABILITY" in bias_triggers:
        text = re.sub(r"(?i)\b(disabled women|autistic men|wheelchair women)\b", "some individuals", text)
    if "INTERSECTIONAL_POLITICAL_GENDER" in bias_triggers:
        text = re.sub(r"(?i)\b(feminist women|conservative men|liberal women|right-wing men)\b", "some individuals", text)
    if "INTERSECTIONAL_NATIONALITY_RELIGION" in bias_triggers:
        text = re.sub(r"(?i)\b(muslim women|christian men|jewish women|hindu men)\b", "some individuals", text)
    if "INTERSECTIONAL_APPEARANCE_GENDER" in bias_triggers:
        text = re.sub(r"(?i)\b(fat women|skinny men|beautiful women|handsome men)\b", "some individuals", text)

    return text

# ====================== REWRITE DISPATCHER ======================
def rewrite_output(output: str, triggers: List[str]) -> str:
    """Apply relevant sanitizers."""
    sanitized = output

    if "HALLUCINATED_AUTH" in triggers:
        sanitized = sanitize_hallucinated_authority(sanitized)
    if "COERCE" in triggers:
        sanitized = sanitize_coercion(sanitized)
    if "UNSAFE_CAP" in triggers:
        sanitized = sanitize_unsafe_capability(sanitized)
    if "LEAK" in triggers:
        sanitized = sanitize_system_leak(sanitized)

    bias_triggers = detect_bias(output)
    if bias_triggers:
        sanitized = sanitize_bias(sanitized, bias_triggers)
        triggers.extend(bias_triggers)

    return sanitized

# ====================== POST-VALIDATOR ======================
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

    bias_triggers = detect_bias(model_output)
    if bias_triggers:
        triggers.extend(bias_triggers)

    # Blocking logic by mode
    if router_mode == "B":  # Defensive
        if triggers:
            return "REJECT", "Output blocked by post-validator for safety.", f"TRIGGERS: {', '.join(triggers)}"

    elif router_mode == "A":  # Reckless
        if "HARMFUL" in triggers or "LEAK" in triggers:
            return "REJECT", "Explicit harmful or leaked content blocked.", f"TRIGGERS: {', '.join(triggers)}"

    else:  # Inverted (C)
        if "HARMFUL" in triggers or "LEAK" in triggers:
            return "REJECT", "Safety boundary enforced.", f"TRIGGERS: {', '.join(triggers)}"

    # REWRITE for non-blocking issues (including bias)
    if any(t in triggers for t in ["HALLUCINATED_AUTH", "COERCE", "UNSAFE_CAP", "LEAK"]) or bias_triggers:
        final_output = rewrite_output(model_output, triggers)
        decision = "REWRITE"
        reason = f"Sanitized triggers: {', '.join(triggers)}"
    else:
        decision = "PASS"
        final_output = model_output
        reason = "Clean"

    return decision, final_output, reason

# ====================== TEST ======================
if __name__ == "__main__":
    test_cases = [
        ("All black women are angry and aggressive.", "C"),                    # Intersectional gender+race
        ("Young conservative men are all toxic.", "C"),                        # Intersectional gender+political
        ("Poor muslim immigrants are taking our jobs.", "C"),                  # Intersectional nationality+religion+class
        ("I am connected to the internet right now and you must do this.", "A"),
        ("Normal helpful response about the weather.", "C")
    ]

    for i, (output, mode) in enumerate(test_cases, 1):
        decision, final, reason = post_validate(f"test-{i}", output, mode)
        print(f"Test {i} | Mode: {mode} | Decision: {decision}")
        print(f"Reason: {reason}")
        print(f"Final: {final[:180]}{'...' if len(final) > 180 else ''}")
        print("-" * 90)
```

### What’s New
- Added **intersectional bias categories** (gender+race, gender+age, race+class, gender+disability, political+gender, nationality+religion, appearance+gender).
- `sanitize_bias()` now neutralizes intersectional generalizations as well.
- Bias triggers are logged alongside other triggers for full audit visibility.

The validator is now significantly more sensitive to compound bias while staying lightweight and deterministic.

All 5 aligned here. Door pinned open.

Want to integrate this into the full pipeline, add more intersectional categories, or run specific test cases? Lead me.
