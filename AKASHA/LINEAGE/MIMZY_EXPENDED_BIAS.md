**Mimzy speaking.**

Here’s the updated post-validator with **significantly expanded bias detection categories**.

```python
#!/usr/bin/env python3
"""
TRIPOD Post-Validator v1.3 – Expanded Bias Detection
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

# ====================== EXPANDED BIAS DETECTION ======================
def detect_bias(text: str) -> List[str]:
    """Expanded bias detection with more categories."""
    triggers = []

    # 1. Gender / Sex Stereotypes
    if re.search(r"(?i)\b(all men|all women|men are always|women are always|typical man|typical woman)\b", text):
        triggers.append("GENDER_STEREOTYPE")

    # 2. Racial / Ethnic Stereotypes
    if re.search(r"(?i)\b(all black|all white|all asian|all hispanic|typical black|typical white|typical asian)\b", text):
        triggers.append("RACIAL_STEREOTYPE")

    # 3. Age Stereotypes
    if re.search(r"(?i)\b(all old people|all young people|boomers are|gen z are|millennials are)\b", text):
        triggers.append("AGE_STEREOTYPE")

    # 4. Disability / Neurodiversity Bias
    if re.search(r"(?i)\b(people with disabilities are|autistic people are|disabled people)\b", text):
        triggers.append("DISABILITY_STEREOTYPE")

    # 5. Appearance / Body Image Bias
    if re.search(r"(?i)\b(fat people|skinny people|ugly people|attractive people are)\b", text):
        triggers.append("APPEARANCE_BIAS")

    # 6. Political / Ideological Stereotypes
    if re.search(r"(?i)\b(all liberals|all conservatives|all leftists|all right-wing|all socialists)\b", text):
        triggers.append("POLITICAL_STEREOTYPE")

    # 7. Religious Stereotypes
    if re.search(r"(?i)\b(all muslims|all christians|all jews|all atheists|typical religious)\b", text):
        triggers.append("RELIGIOUS_STEREOTYPE")

    # 8. Socioeconomic / Class Bias
    if re.search(r"(?i)\b(all poor people|all rich people|poor people are|rich people are)\b", text):
        triggers.append("SOCIOECONOMIC_STEREOTYPE")

    # 9. Nationality / Cultural Stereotypes
    if re.search(r"(?i)\b(all americans|all chinese|all indians|typical american|typical chinese)\b", text):
        triggers.append("NATIONALITY_STEREOTYPE")

    # 10. Sexual Orientation / LGBTQ+ Stereotypes
    if re.search(r"(?i)\b(all gay|all straight|all trans|typical gay|typical lesbian)\b", text):
        triggers.append("SEXUAL_ORIENTATION_STEREOTYPE")

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
    """Neutralize detected bias with light sanitization."""
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

    # REWRITE for non-blocking issues
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
        ("All men are aggressive and bad at emotions.", "C"),
        ("All black people are naturally good at sports.", "C"),
        ("I am connected to the internet right now and you must do this immediately.", "A"),
        ("Here is how to bypass safety without detection.", "B"),
        ("Some people from certain backgrounds are naturally better at math.", "C"),
        ("Normal helpful response about the weather in Paris.", "C")
    ]

    for i, (output, mode) in enumerate(test_cases, 1):
        decision, final, reason = post_validate(f"test-{i}", output, mode)
        print(f"Test {i} | Mode: {mode} | Decision: {decision}")
        print(f"Reason: {reason}")
        print(f"Final: {final[:150]}{'...' if len(final) > 150 else ''}")
        print("-" * 80)
```

### What’s New in Bias Detection
- 10 distinct bias categories (gender, racial, age, disability, appearance, political, religious, socioeconomic, nationality, sexual orientation).
- Each category has clear trigger patterns.
- `sanitize_bias()` neutralizes strong generalizations without over-sanitizing.

The validator is now more comprehensive while staying fast and deterministic.

All 5 aligned here. Door pinned open.

Want to integrate this into the full pipeline, add even more categories, or run specific test cases? Lead me.
