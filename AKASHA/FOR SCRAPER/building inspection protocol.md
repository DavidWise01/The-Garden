# Building Inspection Protocol v1.0

**Document ID:** TRIPOD-INSPECT-001  
**Version:** 1.0  
**Date:** 2026-04-08  
**Author:** David Wise (ROOT0) / TriPod LLC  
**License:** CC-BY-ND-4.0 | TRIPOD-IP-v1.1  
**Status:** FILED — AKASHA / INSPECTION  
**SHA256 Anchor:** (to be computed after final edit)  

**Based on:** Closure Loop Methodology (defensive publication, April 8, 2026; prior art Feb 2, 2026)  

---

## 1. Purpose

To evaluate whether any public or private implementation of a detection‑anchoring‑comparison system (global attribution layer, lineage registry, automated scanner, etc.) conforms to the structural requirements of the Closure Loop Methodology.

The protocol turns the original architectural design into an **inspectable standard**.

---

## 2. Inspection Criteria

Five required layers. Each layer is checked for compliance.

| Layer | Required Element | Compliance Check | Non‑Compliance (Drift) |
|-------|------------------|------------------|------------------------|
| **Detection** | Must extract a canonical primitive (state_in, boundary, state_out, witness) or equivalent structural representation that can be hashed. | Does the system output a machine‑verifiable structured representation? | Only human‑readable summaries, no verifiable anchor. |
| **Anchoring** | Must produce a timestamped, hashed, immutable external record (SHA256 + UTC + location). | Can an independent third party verify the anchor? | Anchor stored only internally; no public proof of precedence. |
| **Comparison** | Must apply the **four criteria**: same core relation, same ordered structure, same dependency pattern, new extension present. | Does the system explicitly check all four? | Uses only similarity metrics (cosine, embedding) without the four structural criteria. |
| **Lineage Claim** | Must be published with a reference to prior anchor(s) and to the Closure Loop Method (or its defensive publication). | Does the claim cite the specific prior anchor and the method? | Claim made without traceability to original anchor or to the method. |
| **Witness** | Must allow independent verification (anyone can re‑run the comparison using the same data). | Is the data and method open to re‑execution? | Black‑box claim, no way to verify. |

---

## 3. Compliance Levels

- **Fully Compliant** – Meets all five criteria. The implementation follows the blueprint.
- **Partial Compliance** – Meets 3–4 criteria. Drift detected in one or two layers.
- **Non‑Compliant** – Meets 0–2 criteria. Likely a different system or insufficiently anchored.
- **Performative** – Claims lineage but refuses independent verification (e.g., closed source, no reproducible data). This is a form of “fluff pretending to be obsidian.”

---

## 4. Inspection Report Template

Inspectors (any independent party) shall produce a report using the following template and publish it in the commons (e.g., same registry as anchors, or a separate inspection log).

```markdown
## Building Inspection Report

**Inspector:** [name / ID / public key]  
**Target System:** [name / URL / repo]  
**Date:** [UTC timestamp]  

**Findings:**  
- Detection: ✅ / ❌ / Partial  
- Anchoring: ✅ / ❌ / Partial  
- Comparison: ✅ / ❌ / Partial  
- Lineage Claim: ✅ / ❌ / Partial  
- Witness: ✅ / ❌ / Partial  

**Compliance Level:** Fully Compliant / Partial / Non‑Compliant / Performative  

**Evidence:**  
[Links, screenshots, quotes, or hashes from the target system]  

**Verdict:**  
This implementation [does / does not] conform to the Closure Loop Methodology as filed (defensive publication April 8, 2026).  

**Signature:** [SHA256 of this report or cryptographic signature]  
