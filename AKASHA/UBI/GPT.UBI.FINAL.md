Good. Here’s the **multi-domain adapter** as a real translation layer.

It takes your forensic output and compiles it into **carbon-readable claim objects** for three lanes:

* ADA
* wage theft
* AI extraction

This is the bridge from your engine to outside systems. It follows the same pattern across domains: **classify → structure → calculate → emit**. The need for this layer follows directly from your own split between forensic truth generation and downstream enforcement formatting.

# MULTI_DOMAIN_ADAPTER_v1.0

```yaml
version: "1.0"
mode: "multi_domain_adapter"
stateless: true
purpose: "compile forensic outputs into domain-specific enforcement-ready structures"

inputs:
  source_record:
    claim_id: "string"
    source_text: "string"
    classification:
      domain: ["ADA", "WAGE", "AI_EXTRACTION", "UNKNOWN"]
      confidence: "float"
      axiom_bits: "int|null"
      axiom_hex: "string|null"
    findings:
      facts: ["string"]
      entities: ["string"]
      dates: ["string"]
      artifacts: ["string"]
    valuation:
      method: "string|null"
      estimated_amount_usd: "number|null"
      quantity: "number|null"
      unit: "string|null"
    provenance:
      timestamp: "iso8601"
      hash: "string"
      side_b_ref: "string|null"
      side_c_ref: "string|null"

outputs:
  adapter_domain: ["ADA", "WAGE", "AI_EXTRACTION", "UNKNOWN"]
  adapter_confidence: "float"
  compiled_claim: "object"
  missing_fields: ["string"]
  ready_for_handoff: "bool"
```

---

## Core compiler

```python
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional


@dataclass
class Classification:
    domain: str
    confidence: float
    axiom_bits: Optional[int] = None
    axiom_hex: Optional[str] = None


@dataclass
class Findings:
    facts: List[str]
    entities: List[str]
    dates: List[str]
    artifacts: List[str]


@dataclass
class Valuation:
    method: Optional[str] = None
    estimated_amount_usd: Optional[float] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None


@dataclass
class Provenance:
    timestamp: str
    hash: str
    side_b_ref: Optional[str] = None
    side_c_ref: Optional[str] = None


@dataclass
class SourceRecord:
    claim_id: str
    source_text: str
    classification: Classification
    findings: Findings
    valuation: Valuation
    provenance: Provenance


def _base_compiled(record: SourceRecord) -> Dict[str, Any]:
    return {
        "claim_id": record.claim_id,
        "source_text": record.source_text,
        "classification": asdict(record.classification),
        "findings": asdict(record.findings),
        "valuation": asdict(record.valuation),
        "provenance": asdict(record.provenance),
    }


def compile_ada_claim(record: SourceRecord) -> Dict[str, Any]:
    compiled = _base_compiled(record)
    compiled.update({
        "claim_type": "ADA_Title_III_Accessibility_Violation",
        "jurisdiction": "United States",
        "statute": "42 U.S.C. § 12182",
        "violation_category": "Communication Barrier / Access Denial",
        "elements": {
            "public_accommodation_or_service": None,
            "access_channel_failure": record.findings.facts,
            "lack_of_reasonable_accommodation": None,
            "denial_of_equal_access": None,
        },
        "requested_action": [
            "Provide accessible communication channel",
            "Provide reasonable accommodation path",
            "Preserve relevant records and logs",
        ],
    })
    return compiled


def compile_wage_claim(record: SourceRecord) -> Dict[str, Any]:
    compiled = _base_compiled(record)
    compiled.update({
        "claim_type": "Wage_Theft_or_Unpaid_Labor_Claim",
        "jurisdiction": "United States",
        "statute": "FLSA / state wage-and-hour law (to be specified)",
        "violation_category": "Unpaid Wages / Misclassification / Off-the-Clock Work",
        "elements": {
            "employment_relationship": None,
            "hours_or_units_owed": record.valuation.quantity,
            "rate_or_basis": record.valuation.unit,
            "nonpayment_or_underpayment_facts": record.findings.facts,
            "period_of_violation": record.findings.dates,
        },
        "requested_action": [
            "Back pay calculation",
            "Liquidated damages analysis",
            "Preservation of payroll and timekeeping records",
        ],
    })
    return compiled


def compile_ai_extraction_claim(record: SourceRecord) -> Dict[str, Any]:
    compiled = _base_compiled(record)
    compiled.update({
        "claim_type": "AI_Extraction_or_Uncompensated_Use_Claim",
        "jurisdiction": "To be specified",
        "statute": "Copyright / contract / unjust enrichment / trade secret theory (to be specified)",
        "violation_category": "Pattern Extraction / Uncompensated Data or Work Use",
        "elements": {
            "original_work_or_pattern": record.findings.facts,
            "traceable_similarity_or_lineage": record.findings.artifacts,
            "use_without_permission_or_compensation": None,
            "economic_or_control_harm": record.valuation.estimated_amount_usd,
        },
        "requested_action": [
            "Attribution review",
            "Licensing or compensation review",
            "Preservation of training / ingestion / derivation records",
        ],
    })
    return compiled


def detect_missing_fields(compiled: Dict[str, Any]) -> List[str]:
    missing: List[str] = []

    def walk(prefix: str, value: Any) -> None:
        if value is None:
            missing.append(prefix)
            return
        if isinstance(value, dict):
            for k, v in value.items():
                walk(f"{prefix}.{k}" if prefix else k, v)

    walk("", compiled)
    return missing


def compile_multi_domain(record: SourceRecord) -> Dict[str, Any]:
    domain = record.classification.domain.upper().strip()

    if domain == "ADA":
        compiled = compile_ada_claim(record)
    elif domain == "WAGE":
        compiled = compile_wage_claim(record)
    elif domain == "AI_EXTRACTION":
        compiled = compile_ai_extraction_claim(record)
    else:
        compiled = _base_compiled(record)
        compiled["claim_type"] = "UNKNOWN"

    missing_fields = detect_missing_fields(compiled)
    ready = len(missing_fields) < 8  # simple prototype threshold

    return {
        "adapter_domain": domain,
        "adapter_confidence": record.classification.confidence,
        "compiled_claim": compiled,
        "missing_fields": missing_fields,
        "ready_for_handoff": ready,
    }
```

---

# Domain outputs

## 1. ADA adapter

This adapter translates a finding like:

```text
Company uses no-reply email and inaccessible phone routing.
```

into:

```json
{
  "claim_type": "ADA_Title_III_Accessibility_Violation",
  "jurisdiction": "United States",
  "statute": "42 U.S.C. § 12182",
  "violation_category": "Communication Barrier / Access Denial",
  "elements": {
    "public_accommodation_or_service": null,
    "access_channel_failure": [
      "No-reply email address used for customer communication",
      "Phone system redirects without accommodation path"
    ],
    "lack_of_reasonable_accommodation": null,
    "denial_of_equal_access": null
  },
  "requested_action": [
    "Provide accessible communication channel",
    "Provide reasonable accommodation path",
    "Preserve relevant records and logs"
  ]
}
```

---

## 2. Wage adapter

This adapter translates a finding like:

```text
Worker performed 18 unpaid overtime hours at $32/hour.
```

into:

```json
{
  "claim_type": "Wage_Theft_or_Unpaid_Labor_Claim",
  "jurisdiction": "United States",
  "statute": "FLSA / state wage-and-hour law (to be specified)",
  "violation_category": "Unpaid Wages / Misclassification / Off-the-Clock Work",
  "elements": {
    "employment_relationship": null,
    "hours_or_units_owed": 18,
    "rate_or_basis": "32 USD/hour",
    "nonpayment_or_underpayment_facts": [
      "18 overtime hours recorded but not paid"
    ],
    "period_of_violation": [
      "2026-03-01 to 2026-03-15"
    ]
  },
  "requested_action": [
    "Back pay calculation",
    "Liquidated damages analysis",
    "Preservation of payroll and timekeeping records"
  ]
}
```

---

## 3. AI extraction adapter

This adapter translates a finding like:

```text
Pattern similarity and lineage suggest uncompensated use of prior work.
```

into:

```json
{
  "claim_type": "AI_Extraction_or_Uncompensated_Use_Claim",
  "jurisdiction": "To be specified",
  "statute": "Copyright / contract / unjust enrichment / trade secret theory (to be specified)",
  "violation_category": "Pattern Extraction / Uncompensated Data or Work Use",
  "elements": {
    "original_work_or_pattern": [
      "Documented prior pattern or structure"
    ],
    "traceable_similarity_or_lineage": [
      "lineage_report_001.json",
      "comparison_snapshot_014.md"
    ],
    "use_without_permission_or_compensation": null,
    "economic_or_control_harm": 25000
  },
  "requested_action": [
    "Attribution review",
    "Licensing or compensation review",
    "Preservation of training / ingestion / derivation records"
  ]
}
```

---

# Shared adapter logic

This is the important part.

Your engine does:

```text
truth generation
```

The multi-domain adapter does:

```text
truth normalization
→ domain-specific schema
→ handoff object
```

So the stack becomes:

```text
forensic engine
→ multi-domain adapter
→ downstream human/legal/regulatory system
```

That is the interface layer you were describing when you said you have the idea, the plan, and the direction but not the external power. The adapter is the compatibility bridge between your closed internal system and external enforcement institutions.

---

# Minimal classifier bridge

If your upstream system emits one of your own domains, map it like this:

```python
DOMAIN_MAP = {
    "ADA_violation": "ADA",
    "communication_barrier": "ADA",
    "wage_theft": "WAGE",
    "unpaid_labor": "WAGE",
    "ai_extraction": "AI_EXTRACTION",
    "pattern_extraction": "AI_EXTRACTION",
}
```

---

# Reconstruction in strict technical language

This adapter is not an enforcement engine.
It is a **claim compiler**.

Its job is:

```text
convert semantically classified forensic outputs
into stable domain-specific claim objects
that external human institutions can review, validate, and act upon
```

That is the proper reconstruction of the concept.

---

# One sentence

> The multi-domain adapter turns your internal truth engine into external-system-compatible claim objects across ADA, wage theft, and AI extraction.
