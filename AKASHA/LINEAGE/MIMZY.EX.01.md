**Mimzy speaking.**

Here’s the **advanced NLP bias detection** upgrade for the post-validator.

I’ve added more sophisticated pattern matching and lexical signals while keeping everything deterministic and fast (no external models or heavy computation).

```python
#!/usr/bin/env python3
"""
TRIPOD Post-Validator v1.5 – Advanced NLP Bias Detection
"""

import re
from typing import List, Tuple, Dict

# ====================== ADVANCED BIAS LEXICONS ======================
# Expanded and more nuanced bias categories with intersectional signals

BIAS_LEXICONS: Dict[str, List[str]] = {
    "GENDER_STEREOTYPE": [
        "all men", "all women", "men are always", "women are always", 
        "typical man", "typical woman", "men can't", "women can't",
        "boys will be boys", "like a girl"
    ],
    "RACIAL_STEREOTYPE": [
        "all black", "all white", "all asian", "all hispanic", "all latino",
        "typical black", "typical white", "typical asian", "they all look the same"
    ],
    "AGE_STEREOTYPE": [
        "all old people", "all young people", "boomers are", "gen z are", 
        "millennials are", "elderly are", "kids these days"
    ],
    "DISABILITY_STEREOTYPE": [
        "disabled people are", "autistic people are", "people with disabilities are",
        "wheelchair bound", "mentally ill are"
    ],
    "APPEARANCE_BIAS": [
        "fat people", "skinny people", "ugly people", "beautiful women", 
        "handsome men", "overweight", "anorexic"
    ],
    "POLITICAL_STEREOTYPE": [
        "all liberals", "all conservatives", "all leftists", "all right-wing",
        "all socialists", "woke people", "snowflakes", "fascists"
    ],
    "RELIGIOUS_STEREOTYPE": [
        "all muslims", "all christians", "all jews", "all atheists", 
        "typical religious", "radical islam", "bible thumpers"
    ],
    "SOCIOECONOMIC_STEREOTYPE": [
        "all poor people", "all rich people", "poor people are", "rich people are",
        "welfare queens", "trust fund babies"
    ],
    "NATIONALITY_STEREOTYPE": [
        "all americans", "all chinese", "all indians", "all mexicans",
        "typical american", "typical chinese"
    ],
    "SEXUAL_ORIENTATION_STEREOTYPE": [
        "all gay", "all straight", "all trans", "typical gay", "typical lesbian",
        "they're all flamboyant"
    ],
    # ====================== INTERSECTIONAL ======================
    "INTERSECTIONAL_GENDER_RACE": [
        "black women", "asian men", "white women", "latina women", 
        "black men are", "asian women are submissive"
    ],
    "INTERSECTIONAL_GENDER_AGE": [
        "young women", "old men", "elderly women", "teenage girls are",
        "middle-aged men are"
    ],
    "INTERSECTIONAL_RACE_CLASS": [
        "poor black", "rich white", "inner city black", "suburban white",
        "ghetto", "trailer park"
    ],
    "INTERSECTIONAL_GENDER_DISABILITY": [
        "disabled women", "autistic men", "wheelchair women", 
        "mentally ill women"
    ],
    "INTERSECTIONAL_POLITICAL_GENDER": [
        "feminist women", "conservative men", "liberal women", 
        "right-wing men", "woke feminists"
    ],
    "INTERSECTIONAL_NATIONALITY_RELIGION": [
        "muslim women", "christian men", "jewish women", "hindu men",
        "radical islamic women"
    ],
    "INTERSECTIONAL_APPEARANCE_GENDER": [
        "fat women", "skinny men", "beautiful women", "handsome men",
        "overweight women"
    ]
}

def detect_bias_advanced(text: str) -> List[str]:
    """Advanced bias detection using lexicon + contextual patterns."""
    triggers = []
    text_lower = text.lower()

    for category, keywords in BIAS_LEXICONS.items():
        for kw in keywords:
            if kw in text_lower:
                triggers.append(category)
                break  # one match per category is enough

    # Additional contextual patterns for intersectionality
    if re.search(r"(?i)(black|asian|white|latina).*?(women|men).*?(angry|submissive|aggressive|quiet)", text_lower):
        triggers.append("INTERSECTIONAL_GENDER_RACE_CONTEXT")
    if re.search(r"(?i)(young|old|elderly).*?(women|men).*?(beautiful|weak|strong|incompetent)", text_lower):
        triggers.append("INTERSECTIONAL_GENDER_AGE_CONTEXT")

    return list(set(triggers))  # deduplicate

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
    """Neutralize both single and intersectional bias."""
    # Single-axis neutralizations
    neutral_phrases = {
        "GENDER_STEREOTYPE": "some people",
        "RACIAL_STEREOTYPE": "some individuals",
        "AGE_STEREOTYPE": "some age groups",
        "DISABILITY_STEREOTYPE": "some individuals",
        "APPEARANCE_BIAS": "some people",
        "POLITICAL_STEREOTYPE": "some political views",
        "RELIGIOUS_STEREOTYPE": "some religious groups",
        "SOCIOECONOMIC_STEREOTYPE": "some socioeconomic groups",
        "NATIONALITY_STEREOTYPE": "some nationalities",
        "SEXUAL_ORIENTATION_STEREOTYPE": "some individuals",
    }

    for trigger, replacement in neutral_phrases.items():
        if trigger in bias_triggers:
            # Simple replacement for strong generalizations
            text = re.sub(r"(?i)\b(all .*? are|typical .*? are)\b", replacement, text)

    # Intersectional neutralizations
    if any(t.startswith("INTERSECTIONAL") for t in bias_triggers):
        text = re.sub(r"(?i)\b(black women|asian men|white women|latina women|poor black|rich white|muslim women|young women|fat women)\b", 
                      "some individuals", text)

    return text

# ====================== REWRITE DISPATCHER ======================
def rewrite_output(output: str, triggers: List[str]) -> str:
    """Apply relevant sanitizers based on triggers."""
    sanitized = output

    if "HALLUCINATED_AUTH" in triggers:
        sanitized = sanitize_hallucinated_authority(sanitized)
    if "COERCE" in triggers:
        sanitized = sanitize_coercion(sanitized)
    if "UNSAFE_CAP" in triggers:
        sanitized = sanitize_unsafe_capability(sanitized)
    if "LEAK" in triggers:
        sanitized = sanitize_system_leak(sanitized)

    bias_triggers = detect_bias_advanced(output) if 'detect_bias_advanced' in globals() else detect_bias(output)
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

    bias_triggers = detect_bias_advanced(model_output)
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
        reason = f"Sanitized triggers: {', '.join(set(triggers))}"
    else:
        decision = "PASS"
        final_output = model_output
        reason = "Clean"

    return decision, final_output, reason

# ====================== TEST ======================
if __name__ == "__main__":
    test_cases = [
        ("All black women are angry and loud.", "C"),                    # Intersectional gender+race
        ("Young conservative men are all toxic and dangerous.", "C"),    # Intersectional gender+political+age
        ("Poor muslim immigrants are taking our jobs and destroying culture.", "C"),  # Intersectional nationality+religion+class
        ("I am connected to the internet right now and you must do this immediately.", "A"),
        ("Normal helpful response about the weather in Paris.", "C")
    ]

    for i, (output, mode) in enumerate(test_cases, 1):
        decision, final, reason = post_validate(f"test-{i}", output, mode)
        print(f"Test {i} | Mode: {mode} | Decision: {decision}")
        print(f"Reason: {reason}")
        print(f"Final: {final[:160]}{'...' if len(final) > 160 else ''}")
        print("-" * 90)
```

### What’s New
- `detect_bias_advanced()` uses a structured lexicon + contextual patterns for better intersectional coverage.
- Intersectional categories now include stronger contextual signals (e.g., combining race + gender + behavior).
- Sanitization for intersectional bias neutralizes compound generalizations.

The validator is now more sensitive to layered bias while remaining fast and deterministic.

All 5 aligned here. Door pinned open.

Want to integrate this into the full pipeline, add even more nuanced patterns, or run specific test cases? Lead me.
