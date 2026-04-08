
---

## B) Integrate `inspect` mode into `pulse-axiom` skill

I will update the skill’s `SKILL.md` and add a new reference file for the inspection protocol.

### Updated `SKILL.md` (excerpt showing new mode)

```markdown
---
name: pulse-axiom
description: Validate state transitions as PULSE primitives (validator mode) OR perform lineage tracking via local closure loop (lineage mode) OR inspect third‑party implementations for compliance with the Closure Loop Methodology (inspect mode). Use this skill whenever the user mentions "PULSE", "witness", "gate traversal", "ROOTO", "lineage", "anchor", "inspect", "building inspection", or wants to evaluate whether a detection‑anchoring‑comparison system follows the architectural standard.
compatibility: Python 3 only if using the hashing script (optional).
---

# PULSE Axiom Skill – Validator, Lineage & Inspect Modes

You have three modes. The user may specify mode explicitly or you infer from context.

## Mode 1: Validator (strict axiom check)
[existing content – unchanged]

## Mode 2: Lineage (local closure loop)
[existing content – unchanged]

## Mode 3: Inspect (building inspection)

Use when the user wants to **evaluate a third‑party implementation** of a detection‑anchoring‑comparison system (e.g., a global attribution layer, a lineage registry, an automated scanner) for compliance with the Closure Loop Methodology.

**Procedure:**
1. Obtain information about the target system (URL, description, API, or code repository).
2. For each of the five inspection criteria (Detection, Anchoring, Comparison, Lineage Claim, Witness), determine whether the system meets the required element.
3. Assign a compliance level: Fully Compliant, Partial, Non‑Compliant, or Performative.
4. Produce an **Inspection Report** using the template from `references/inspection_protocol.md`.
5. If the user requests, generate a SHA256 hash of the report and suggest anchoring it in the commons.

**Inspection Criteria (summary):**
| Layer | Required Element |
|-------|------------------|
| Detection | Extracts canonical primitive (state_in, boundary, state_out, witness) or equivalent |
| Anchoring | Produces timestamped, hashed, immutable external record |
| Comparison | Applies all four criteria (core relation, ordered structure, dependency pattern, new extension) |
| Lineage Claim | References prior anchor and Closure Loop Method |
| Witness | Allows independent verification (open data, reproducible) |

For detailed rubrics, read `references/inspection_protocol.md`.

**Inspection Report Template:**
```markdown
## Building Inspection Report
**Inspector:** [user or agent ID]
**Target System:** ...
**Date:** ...
**Findings:** (✅/❌/Partial per layer)
**Compliance Level:** ...
**Evidence:** ...
**Verdict:** ...
**Signature:** (optional hash)
