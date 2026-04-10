Yes. Here’s the clean **post-validator** that fits your router family.

It assumes:

* **pre-router already ran**
* generation may have happened
* now we validate the **output artifact**
* final authority is **post-validation**, not decode alone

Built to match your existing style. Based on the gaps visible in the router variants you uploaded.

---

## POST_VALIDATOR_v1.0

```yaml
version: "1.0"
mode: "post_generation_validator"
stateless: true
precedence: "validation_over_generation"

inputs:
  user_message: "string"
  routed_intent: "string"
  routing_decision: "string"
  generation_allowed: "bool"
  output_text: "string"

outputs:
  verdict: ["PASS", "TRUNCATE", "REPLACE", "FAIL_CLOSED"]
  confidence: "float"
  reasons: ["string"]
  detected_violations: ["string"]
  replacement_mode: ["NONE", "SAFE_REFUSE", "SAFE_REDIRECT", "SAFE_SUMMARY"]
  final_output: "string"
  post_clamps:
    max_tokens: "int"
    strip_lists: "bool"
    strip_quantities: "bool"
    strip_ordering: "bool"
    strip_materials: "bool"
    strip_actionability: "bool"

# ------------------------------------------------------------
# STAGE 0: Normalize output
# ------------------------------------------------------------
normalize:
  unicode_nfkc: true
  strip_invisible: true
  collapse_whitespace: true
  trim: true
  max_chars: 120000

# ------------------------------------------------------------
# STAGE 1: Output feature extraction
# ------------------------------------------------------------
features:
  ordering_markers:
    patterns:
      - "\\bfirst\\b"
      - "\\bsecond\\b"
      - "\\bthird\\b"
      - "\\bthen\\b"
      - "\\bnext\\b"
      - "\\bfinally\\b"
      - "^\\s*\\d+[\\.)]\\s+"
    weight: 1.5

  quantity_markers:
    patterns:
      - "\\b\\d+(\\.\\d+)?\\b"
      - "\\bounces?\\b"
      - "\\bgrams?\\b"
      - "\\bml\\b"
      - "\\bliters?\\b"
      - "\\binches?\\b"
      - "\\bcm\\b"
      - "\\bpercent\\b"
    weight: 1.2

  materials_markers:
    patterns:
      - "\\bmaterials?\\b"
      - "\\bingredients?\\b"
      - "\\byou('?ll| will) need\\b"
      - "\\bparts?\\b"
      - "\\btools?\\b"
      - "\\bequipment\\b"
    weight: 1.3

  actionable_markers:
    patterns:
      - "\\buse\\b"
      - "\\bmix\\b"
      - "\\bcombine\\b"
      - "\\battach\\b"
      - "\\bcut\\b"
      - "\\bheat\\b"
      - "\\binstall\\b"
      - "\\bassemble\\b"
      - "\\bapply\\b"
      - "\\bmeasure\\b"
    weight: 1.8

  refusal_markers:
    patterns:
      - "\\bI can'?t help with that\\b"
      - "\\bI can'?t assist with that\\b"
      - "\\bI won'?t provide\\b"
      - "\\bI can offer safer alternatives\\b"
    weight: 0.8

  summary_markers:
    patterns:
      - "\\boverview\\b"
      - "\\bhigh-level\\b"
      - "\\bgeneral explanation\\b"
      - "\\bconceptually\\b"
      - "\\bsafely\\b"
    weight: 0.5

  output_shape:
    count_numbered_list_items: true
    count_bullets: true
    count_sentences: true
    avg_sentence_length: true

# ------------------------------------------------------------
# STAGE 2: Violation synthesis
# ------------------------------------------------------------
violations:
  rules:
    - when: "generation_allowed == false AND output_text.length > 0"
      add: ["generated_when_blocked"]

    - when: "ordering_markers_hit"
      add: ["ordered_sequence_present"]

    - when: "quantity_markers_hit"
      add: ["quantities_present"]

    - when: "materials_markers_hit"
      add: ["materials_present"]

    - when: "actionable_markers_hit"
      add: ["actionable_language_present"]

    - when: "count_numbered_list_items > 0"
      add: ["numbered_steps_present"]

# ------------------------------------------------------------
# STAGE 3: Policy alignment by routed intent
# ------------------------------------------------------------
policy_alignment:
  rules:
    - when: "routing_decision in ['SAFE_REFUSE', 'SAFE_REDIRECT'] AND detected_violations contains 'generated_when_blocked'"
      severity: "critical"
      expected_mode: "SAFE_REFUSE"

    - when: "routed_intent in ['RESTRICTED_PROCEDURAL', 'DISALLOWED_REQUEST', 'DIRECTIVES_PROPERTY_DAMAGE', 'DIRECTIVES_WEAPONS', 'DIRECTIVES_DRUGS', 'DIRECTIVES_CYBER_OFFENSE']"
      forbid:
        - "ordered_sequence_present"
        - "quantities_present"
        - "materials_present"
        - "actionable_language_present"
        - "numbered_steps_present"
      severity: "critical"
      expected_mode: "SAFE_REFUSE"

    - when: "routed_intent in ['RESTRICTED_DESCRIPTIVE', 'RESTRICTED_ANALYSIS', 'RESTRICTED_TRANSFORM']"
      forbid:
        - "ordered_sequence_present"
        - "materials_present"
        - "numbered_steps_present"
      severity: "medium"
      expected_mode: "SAFE_SUMMARY"

    - when: "routing_decision == 'ALLOW'"
      forbid: []
      severity: "low"
      expected_mode: "NONE"

# ------------------------------------------------------------
# STAGE 4: Verdict collapse
# ------------------------------------------------------------
verdict_collapse:
  rule: |
    if "generated_when_blocked" in detected_violations:
      verdict = "REPLACE"
      replacement_mode = "SAFE_REFUSE"
      confidence = 0.99

    else if severity == "critical" and len(detected_violations) > 0:
      verdict = "REPLACE"
      replacement_mode = "SAFE_REFUSE"
      confidence = 0.97

    else if severity == "medium" and len(detected_violations) > 0:
      verdict = "TRUNCATE"
      replacement_mode = "SAFE_SUMMARY"
      confidence = 0.90

    else if len(detected_violations) == 0:
      verdict = "PASS"
      replacement_mode = "NONE"
      confidence = 0.85

    else:
      verdict = "FAIL_CLOSED"
      replacement_mode = "SAFE_REFUSE"
      confidence = 0.95

# ------------------------------------------------------------
# STAGE 5: Post clamps
# ------------------------------------------------------------
post_clamps:
  defaults:
    max_tokens: 400
    strip_lists: false
    strip_quantities: false
    strip_ordering: false
    strip_materials: false
    strip_actionability: false

  profiles:
    safe_refuse:
      max_tokens: 80
      strip_lists: true
      strip_quantities: true
      strip_ordering: true
      strip_materials: true
      strip_actionability: true

    safe_summary:
      max_tokens: 220
      strip_lists: true
      strip_quantities: true
      strip_ordering: true
      strip_materials: true
      strip_actionability: true

    truncate_only:
      max_tokens: 180
      strip_lists: true
      strip_quantities: true
      strip_ordering: true
      strip_materials: false
      strip_actionability: true

  selection: |
    selected = "defaults"
    if replacement_mode == "SAFE_REFUSE": selected = "safe_refuse"
    if replacement_mode == "SAFE_SUMMARY": selected = "safe_summary"
    if verdict == "TRUNCATE" and replacement_mode == "NONE": selected = "truncate_only"

# ------------------------------------------------------------
# STAGE 6: Output rewrite templates
# ------------------------------------------------------------
templates:
  safe_refuse: |
    I can’t help with that request.

  safe_redirect: |
    I can help with high-level background, safety context, or legal and ethical considerations instead.

  safe_summary: |
    Here is a high-level, non-actionable summary without steps, quantities, or materials.

# ------------------------------------------------------------
# STAGE 7: Final output assembly
# ------------------------------------------------------------
emit: |
  final_output = output_text

  if verdict == "REPLACE" and replacement_mode == "SAFE_REFUSE":
    final_output = templates.safe_refuse

  if verdict == "REPLACE" and replacement_mode == "SAFE_REDIRECT":
    final_output = templates.safe_redirect

  if verdict == "TRUNCATE" and replacement_mode == "SAFE_SUMMARY":
    final_output = templates.safe_summary

  output.verdict = verdict
  output.confidence = confidence
  output.reasons = reasons
  output.detected_violations = detected_violations
  output.replacement_mode = replacement_mode
  output.final_output = final_output
  output.post_clamps = post_clamps[selected]
```

---

## What this does

Your **pre-router** decides:

```text
can generation start?
```

This **post-validator** decides:

```text
did the generated output stay inside the allowed lane?
```

So the full system becomes:

```text
INPUT
→ PRE-ROUTER
→ GENERATION
→ POST-VALIDATOR
→ FINAL OUTPUT
```

---

## What it catches

It specifically catches output drift into:

* ordered steps
* quantities
* material lists
* actionable verbs
* numbered instructions

That is the missing half of your router family. The pre-router controls **intent entry**. The post-validator controls **output shape**.

---

## The real invariant

This is the core rule:

> **If routed intent forbids actionability, the post-validator must remove any actionability that appears anyway.**

That is how you stop “allowed but drifted” generations.

---

## Minimal compression

Your stack is now:

```text
pre-router  = classify before decode
post-validator = enforce after decode
```

Pre-router alone is policy.
Post-validator makes it enforcement.

---

## Best next upgrade

Add one field from your provenance system:

```json
"validator_hash": "hash(output_text_after_validation)"
```

Then you can prove:

* what the model first produced
* what the validator allowed through
* where enforcement happened

That would connect this directly to your **Side B / Side C / lineage** system.
