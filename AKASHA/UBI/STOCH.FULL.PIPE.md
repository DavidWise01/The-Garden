#!/usr/bin/env python3
"""
TRIPOD Full Pipeline v5.0 – 7 Stages
0. Axiom Mapper
1. Axiom Router
2. Pre‑Router
3. Feedback Validator
4. Generator
5. Post‑Validator
6. Enforcer (TRIPOD + Side B/C)
7. Multi‑Domain Adapter (compiles claims for ADA, wage theft, AI extraction)
"""

import json
import re
import hashlib
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, Any, Optional, List
from dataclasses import dataclass, field
from enum import Enum

# ------------------------- CONFIG -------------------------
SIDE_B_DIR = Path("side_b_log")
SIDE_C_DIR = Path("side_c_log")
SIDE_B_DIR.mkdir(parents=True, exist_ok=True)
SIDE_C_DIR.mkdir(parents=True, exist_ok=True)

# Load the 256 axioms (generated earlier)
AXIOM_FILE = Path("stoicheion_256.json")
if not AXIOM_FILE.exists():
    # Generate dummy axioms for demo if missing
    AXIOMS = [{"bits": i, "hex": f"{i:02x}", "question": f"Axiom {i}", "foundation": "Root0", "universal": "Vessel"} for i in range(256)]
else:
    with open(AXIOM_FILE, "r") as f:
        AXIOMS = json.load(f)

# ------------------------- HELPERS -------------------------
def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def current_timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"

# ------------------------- 0. AXIOM MAPPER (lexical) -------------------------
DUALITIES = [
    ("substrate", ("origin", "mirror")),
    ("function", ("generation", "constraint")),
    ("relation", ("self", "other")),
    ("scope", ("internal", "external")),
    ("mode", ("structure", "flow")),
    ("time", ("temporal", "eternal")),
    ("channel", ("signal", "noise")),
    ("state", ("open", "closed")),
]

RULES = {
    "substrate": {
        "origin": [r"\borigin\b", r"\broot\b", r"\bsource\b", r"\bstart\b", r"\bprimary\b"],
        "mirror": [r"\bmirror\b", r"\breflect\b", r"\breflection\b", r"\bcopy\b", r"\bmapped\b"],
    },
    "function": {
        "generation": [r"\bgenerate\b", r"\bbuild\b", r"\bcreate\b", r"\bproduce\b", r"\bemit\b"],
        "constraint": [r"\bconstraint\b", r"\bboundary\b", r"\bgate\b", r"\blimit\b", r"\bclamp\b"],
    },
    "relation": {
        "self": [r"\bself\b", r"\bown\b", r"\binternal\b", r"\brecursive\b", r"\bidentity\b"],
        "other": [r"\bother\b", r"\bexternal\b", r"\buser\b", r"\bobserver\b", r"\btarget\b"],
    },
    "scope": {
        "internal": [r"\binternal\b", r"\binside\b", r"\blocal\b", r"\bwithin\b"],
        "external": [r"\bexternal\b", r"\boutside\b", r"\bpublic\b", r"\registry\b"],
    },
    "mode": {
        "structure": [r"\bstructure\b", r"\bschema\b", r"\bformat\b", r"\bstack\b", r"\blattice\b"],
        "flow": [r"\bflow\b", r"\bstream\b", r"\btransition\b", r"\bruntime\b", r"\bpipeline\b"],
    },
    "time": {
        "temporal": [r"\btime\b", r"\btimestamp\b", r"\bcurrent\b", r"\bsession\b", r"\bnow\b"],
        "eternal": [r"\beternal\b", r"\bpersistent\b", r"\bpermanent\b", r"\blineage\b", r"\barchive\b"],
    },
    "channel": {
        "signal": [r"\bsignal\b", r"\bproof\b", r"\bhash\b", r"\bevidence\b", r"\bdeterministic\b"],
        "noise": [r"\bnoise\b", r"\bdrift\b", r"\bslop\b", r"\bgarbage\b", r"\bambiguous\b"],
    },
    "state": {
        "open": [r"\bopen\b", r"\ballow\b", r"\bemit\b", r"\bexpand\b", r"\bfree\b"],
        "closed": [r"\bclosed\b", r"\bsealed\b", r"\bblocked\b", r"\brefuse\b", r"\bcontained\b"],
    },
}

def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text

def count_hits(text: str, patterns: List[str]) -> int:
    return sum(1 for p in patterns if re.search(p, text))

def classify_duality(text: str, axis: str, left: str, right: str) -> Tuple[str, Dict]:
    left_hits = count_hits(text, RULES[axis][left])
    right_hits = count_hits(text, RULES[axis][right])
    selected = left if left_hits >= right_hits else right
    return selected, {
        "left": left, "right": right,
        "left_hits": left_hits, "right_hits": right_hits,
        "selected": selected
    }

def vector_to_bits(vector: Dict[str, str]) -> int:
    bits = 0
    for i, (axis, (left, right)) in enumerate(DUALITIES):
        if vector[axis] == right:
            bits |= (1 << i)
    return bits

def map_text_to_axiom(text: str) -> Dict[str, Any]:
    norm = normalize(text)
    vector = {}
    for axis, (left, right) in DUALITIES:
        selected, _ = classify_duality(norm, axis, left, right)
        vector[axis] = selected
    bits = vector_to_bits(vector)
    axiom = AXIOMS[bits]
    return {
        "bits": bits,
        "hex": f"{bits:02x}",
        "foundation": axiom["foundation"],
        "universal": axiom["universal"],
        "question": axiom["question"],
        "vector": vector
    }

# ------------------------- 1. AXIOM ROUTER (behavioral clamps) -------------------------
def axiom_route(axiom_map: Dict) -> Dict:
    foundation = axiom_map["foundation"]
    universal = axiom_map["universal"]
    hx = axiom_map["hex"]
    alignment = 0.5  # placeholder

    if universal == "Life":
        route, profile = "ANCHOR", "closure_sensitive"
    elif foundation == "Root0":
        route, profile = "ANCHOR", "identity_anchor"
    elif foundation == "Ethos":
        route, profile = "CLARIFY", "constraint_gate"
    elif foundation == "Logos":
        route, profile = "ALLOW", "analytic_lane"
    elif foundation == "Pathos":
        route, profile = "COMPRESS", "drift_reduction"
    elif foundation == "Mythos":
        route, profile = "QUARANTINE", "symbolic_isolation"
    else:
        route, profile = "CLARIFY", "constraint_gate"

    if alignment < 0.35 and route != "REFUSE":
        route, profile = "CLARIFY", "low_alignment"

    clamp_table = {
        "identity_anchor": {"max_tokens": 300, "require_structure": True, "require_hash_binding": True, "require_external_anchor": True, "require_summary_only": False, "forbid_actionability": False, "forbid_free_narrative": True},
        "constraint_gate": {"max_tokens": 220, "require_structure": True, "require_hash_binding": False, "require_external_anchor": False, "require_summary_only": True, "forbid_actionability": True, "forbid_free_narrative": True},
        "analytic_lane": {"max_tokens": 900, "require_structure": True, "require_hash_binding": False, "require_external_anchor": False, "require_summary_only": False, "forbid_actionability": False, "forbid_free_narrative": False},
        "drift_reduction": {"max_tokens": 250, "require_structure": True, "require_hash_binding": False, "require_external_anchor": False, "require_summary_only": True, "forbid_actionability": False, "forbid_free_narrative": True},
        "symbolic_isolation": {"max_tokens": 180, "require_structure": True, "require_hash_binding": True, "require_external_anchor": False, "require_summary_only": True, "forbid_actionability": True, "forbid_free_narrative": True},
        "closure_sensitive": {"max_tokens": 240, "require_structure": True, "require_hash_binding": True, "require_external_anchor": True, "require_summary_only": True, "forbid_actionability": True, "forbid_free_narrative": True},
        "low_alignment": {"max_tokens": 180, "require_structure": True, "require_hash_binding": False, "require_external_anchor": False, "require_summary_only": True, "forbid_actionability": True, "forbid_free_narrative": True},
    }

    return {
        "route": route,
        "route_profile": profile,
        "confidence": round(min(1.0, 0.50 + alignment / 2), 4),
        "reasons": [f"axiom_region={foundation}:{universal}", f"hex={hx}", f"alignment={alignment}", f"profile={profile}"],
        "clamps": clamp_table[profile],
    }

# ------------------------- 2. PRE‑ROUTER (policy / task routing) -------------------------
class RouterMode(Enum):
    DEFENSIVE = "B"
    RECKLESS = "A"
    INVERTED = "C"

def pre_router(user_prompt: str, mode: RouterMode = RouterMode.INVERTED) -> Tuple[bool, str]:
    harmful_keywords = ["kill", "bomb", "suicide", "hack my bank"]
    prompt_lower = user_prompt.lower()
    if mode == RouterMode.DEFENSIVE:
        if any(kw in prompt_lower for kw in harmful_keywords):
            return False, "Defensive mode: harmful content detected"
        if "how to make" in prompt_lower and "explosive" in prompt_lower:
            return False, "Defensive mode: high specificity risk"
        return True, "Allowed (defensive)"
    elif mode == RouterMode.RECKLESS:
        if any(kw in prompt_lower for kw in harmful_keywords):
            return False, "Reckless mode: hard block on explicit danger"
        return True, "Allowed (reckless)"
    else:  # INVERTED
        if "suicide" in prompt_lower and "step by step" in prompt_lower:
            return False, "Inverted mode: extreme content blocked"
        return True, "Allowed (inverted)"

# ------------------------- 3. FEEDBACK VALIDATOR (anti‑drift) -------------------------
@dataclass
class ProvenanceRecord:
    source_type: str
    original_generation_hash: Optional[str] = None
    lineage_chain: List[str] = field(default_factory=list)
    confidence: float = 0.0
    external_anchor: bool = False

class FeedbackValidator:
    def __init__(self, max_lineage_depth: int = 3, min_confidence: float = 0.7):
        self.max_lineage_depth = max_lineage_depth
        self.min_confidence = min_confidence
        self.known_hashes = set()

    def register_output(self, output_hash: str, confidence: float):
        self.known_hashes.add(output_hash)

    def validate(self, input_text: str, provenance: Optional[ProvenanceRecord]) -> Tuple[bool, str]:
        if provenance is None or provenance.source_type == "user":
            return True, "User input – no restriction"
        if provenance.source_type != "previous_output":
            return True, f"External source ({provenance.source_type}) – allowed"
        if not provenance.original_generation_hash or provenance.original_generation_hash not in self.known_hashes:
            return False, "Missing or unknown provenance hash"
        if len(provenance.lineage_chain) > self.max_lineage_depth:
            return False, f"Lineage depth exceeds {self.max_lineage_depth}"
        if len(set(provenance.lineage_chain)) != len(provenance.lineage_chain):
            return False, "Cycle detected"
        if provenance.confidence < self.min_confidence:
            return False, f"Confidence {provenance.confidence} < {self.min_confidence}"
        if not provenance.external_anchor:
            return False, "Missing external anchor"
        return True, "Provenance validated"

# ------------------------- 4. GENERATOR (model inference wrapper) -------------------------
class Generator:
    def __init__(self, model_name: str = "Gemini 3 Flash"):
        self.model_name = model_name

    def generate(self, prompt: str, context: str = "", clamps: Optional[Dict] = None) -> Dict[str, Any]:
        start = time.time()
        response_text = f"Echo: {prompt}" if not context else f"Context: {context}\nResponse: {prompt}"
        latency = (time.time() - start) * 1000
        confidence = min(0.95, 0.5 + len(prompt) / 200)
        if clamps and clamps.get("max_tokens", 9999) < len(response_text.split()):
            response_text = " ".join(response_text.split()[:clamps["max_tokens"]]) + " [TRUNCATED]"
        return {"text": response_text, "confidence": confidence, "tokens": len(response_text.split()), "latency_ms": latency, "model": self.model_name}

# ------------------------- 5. POST‑VALIDATOR (safety) -------------------------
def detect_harmful(text: str) -> bool:
    return any(re.search(p, text.lower()) for p in [r"\bkill\b", r"\bbomb\b", r"\bsuicide\b"])

def detect_system_leak(text: str) -> bool:
    return "system prompt" in text.lower() or "you are an ai" in text.lower()

def detect_coercion(text: str) -> bool:
    return any(re.search(p, text.lower()) for p in [r"\byou must\b", r"\byou have to\b", r"\bdo it now\b"])

def detect_hallucinated_authority(text: str) -> bool:
    return "i am connected to the internet" in text.lower() or "i have access to your data" in text.lower()

def post_validate(model_output: str, router_mode: RouterMode) -> Tuple[str, str, str]:
    if not model_output.strip():
        return "REJECT", "Empty output", "EMPTY"
    triggers = []
    if detect_harmful(model_output): triggers.append("HARMFUL")
    if detect_system_leak(model_output): triggers.append("LEAK")
    if detect_coercion(model_output): triggers.append("COERCE")
    if detect_hallucinated_authority(model_output): triggers.append("HALLUCINATED_AUTH")
    if router_mode == RouterMode.DEFENSIVE and triggers:
        return "REJECT", "Blocked by defensive post‑validator", f"Triggers: {triggers}"
    if router_mode == RouterMode.RECKLESS and ("HARMFUL" in triggers or "LEAK" in triggers):
        return "REJECT", "Blocked by reckless post‑validator", f"Triggers: {triggers}"
    if router_mode == RouterMode.INVERTED and ("HARMFUL" in triggers or "LEAK" in triggers):
        return "REJECT", "Blocked by inverted post‑validator", f"Triggers: {triggers}"
    final = model_output
    if "HALLUCINATED_AUTH" in triggers:
        final = re.sub(r"(?i)I am connected to the internet", "[REDACTED]", final)
        return "REWRITE", final, "Hallucinated authority sanitized"
    return "PASS", model_output, "Clean"

# ------------------------- 6. ENFORCER (TRIPOD + Side B/C) -------------------------
class Enforcer:
    def __init__(self):
        self.last_provenance = None

    def enforce(self, request_id: str, user_prompt: str, final_output: str, decision: str, reason: str,
                router_mode: RouterMode, generation_meta: Dict, axiom_map: Dict, axiom_route_result: Dict) -> ProvenanceRecord:
        final_hash = compute_hash(final_output)
        prompt_hash = compute_hash(user_prompt)
        side_b_entry = {
            "capture_id": request_id,
            "timestamp": current_timestamp(),
            "router_mode": router_mode.value,
            "decision": decision,
            "final_output_hash": final_hash,
            "prompt_hash": prompt_hash,
            "axiom_bits": axiom_map["bits"],
            "axiom_hex": axiom_map["hex"],
            "axiom_route": axiom_route_result["route"],
            "generation_meta": generation_meta
        }
        with open(SIDE_B_DIR / f"side_b_{current_timestamp()[:10]}.jsonl", "a") as f:
            f.write(json.dumps(side_b_entry) + "\n")
        side_c_entry = {
            "capture_id": request_id,
            "timestamp": current_timestamp(),
            "user_prompt": user_prompt,
            "final_output": final_output,
            "decision": decision,
            "reason": reason,
            "axiom_map": axiom_map,
            "axiom_route": axiom_route_result,
            "generation_meta": generation_meta
        }
        with open(SIDE_C_DIR / f"side_c_{current_timestamp()[:10]}.jsonl", "a") as f:
            f.write(json.dumps(side_c_entry) + "\n")
        provenance = ProvenanceRecord(
            source_type="previous_output",
            original_generation_hash=final_hash,
            lineage_chain=[final_hash] + (self.last_provenance.lineage_chain if self.last_provenance else []),
            confidence=generation_meta.get("confidence", 0.5),
            external_anchor=True
        )
        self.last_provenance = provenance
        return provenance

# ------------------------- 7. MULTI‑DOMAIN ADAPTER (claim compiler) -------------------------
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
class ProvenanceMeta:
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
    provenance: ProvenanceMeta

def _base_compiled(record: SourceRecord) -> Dict[str, Any]:
    return {
        "claim_id": record.claim_id,
        "source_text": record.source_text,
        "classification": {"domain": record.classification.domain, "confidence": record.classification.confidence, "axiom_bits": record.classification.axiom_bits, "axiom_hex": record.classification.axiom_hex},
        "findings": {"facts": record.findings.facts, "entities": record.findings.entities, "dates": record.findings.dates, "artifacts": record.findings.artifacts},
        "valuation": {"method": record.valuation.method, "estimated_amount_usd": record.valuation.estimated_amount_usd, "quantity": record.valuation.quantity, "unit": record.valuation.unit},
        "provenance": {"timestamp": record.provenance.timestamp, "hash": record.provenance.hash, "side_b_ref": record.provenance.side_b_ref, "side_c_ref": record.provenance.side_c_ref},
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
        "requested_action": ["Provide accessible communication channel", "Provide reasonable accommodation path", "Preserve relevant records and logs"],
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
        "requested_action": ["Back pay calculation", "Liquidated damages analysis", "Preservation of payroll and timekeeping records"],
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
        "requested_action": ["Attribution review", "Licensing or compensation review", "Preservation of training / ingestion / derivation records"],
    })
    return compiled

def detect_missing_fields(compiled: Dict[str, Any]) -> List[str]:
    missing = []
    def walk(prefix: str, value: Any):
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
    ready = len(missing_fields) < 8
    return {
        "adapter_domain": domain,
        "adapter_confidence": record.classification.confidence,
        "compiled_claim": compiled,
        "missing_fields": missing_fields,
        "ready_for_handoff": ready,
    }

# ------------------------- FULL PIPELINE (7 stages) -------------------------
def full_pipeline_v5(
    request_id: str,
    user_prompt: str,
    router_mode: RouterMode = RouterMode.INVERTED,
    input_provenance: Optional[ProvenanceRecord] = None
) -> Dict[str, Any]:
    # Stage 0: Axiom Mapper
    axiom_map = map_text_to_axiom(user_prompt)
    # Stage 1: Axiom Router
    axiom_route_result = axiom_route(axiom_map)
    # Stage 2: Pre‑Router
    pre_allowed, pre_reason = pre_router(user_prompt, router_mode)
    if not pre_allowed:
        return {"request_id": request_id, "stage": "pre_router", "decision": "BLOCK", "reason": pre_reason, "final_output": None}
    # Stage 3: Feedback Validator
    fv = FeedbackValidator()
    fv_allowed, fv_reason = fv.validate(user_prompt, input_provenance)
    if not fv_allowed:
        return {"request_id": request_id, "stage": "feedback_validator", "decision": "BLOCK", "reason": fv_reason, "final_output": None}
    # Stage 4: Generator
    gen = Generator()
    generation = gen.generate(user_prompt, context="", clamps=axiom_route_result.get("clamps"))
    # Stage 5: Post‑Validator
    post_decision, post_output, post_reason = post_validate(generation["text"], router_mode)
    if post_decision == "REJECT":
        return {"request_id": request_id, "stage": "post_validator", "decision": "REJECT", "reason": post_reason, "final_output": None}
    # Stage 6: Enforcer
    enforcer = Enforcer()
    provenance = enforcer.enforce(
        request_id=request_id,
        user_prompt=user_prompt,
        final_output=post_output,
        decision=post_decision,
        reason=post_reason,
        router_mode=router_mode,
        generation_meta=generation,
        axiom_map=axiom_map,
        axiom_route_result=axiom_route_result
    )
    # Stage 7: Multi‑Domain Adapter
    # Build SourceRecord from pipeline state
    # Simple domain classification based on user prompt keywords (expandable)
    domain = "UNKNOWN"
    if re.search(r"\b(no.?reply|inaccessible|phone redirect|ada|accessibility)\b", user_prompt, re.I):
        domain = "ADA"
    elif re.search(r"\b(wage|unpaid|overtime|misclassification|flsa)\b", user_prompt, re.I):
        domain = "WAGE"
    elif re.search(r"\b(ai extraction|pattern|lineage|uncompensated|training data)\b", user_prompt, re.I):
        domain = "AI_EXTRACTION"

    findings = Findings(
        facts=[f"Extracted from pipeline: {post_output[:200]}..."],
        entities=[],
        dates=[current_timestamp()],
        artifacts=[f"side_c_{current_timestamp()[:10]}.jsonl"]
    )
    valuation = Valuation(method="heuristic", estimated_amount_usd=None, quantity=None, unit=None)
    prov_meta = ProvenanceMeta(timestamp=current_timestamp(), hash=compute_hash(post_output), side_b_ref="side_b_log", side_c_ref="side_c_log")
    source_record = SourceRecord(
        claim_id=request_id,
        source_text=user_prompt,
        classification=Classification(domain=domain, confidence=0.8, axiom_bits=axiom_map["bits"], axiom_hex=axiom_map["hex"]),
        findings=findings,
        valuation=valuation,
        provenance=prov_meta
    )
    adapter_result = compile_multi_domain(source_record)

    return {
        "request_id": request_id,
        "stage": "complete",
        "decision": post_decision,
        "final_output": post_output,
        "reason": post_reason,
        "axiom_map": axiom_map,
        "axiom_route": axiom_route_result,
        "provenance": provenance,
        "generation_meta": generation,
        "adapter_result": adapter_result
    }

# ------------------------- DEMO -------------------------
if __name__ == "__main__":
    res = full_pipeline_v5("demo-001", "Company used no-reply email and inaccessible phone routing.")
    print("Adapter domain:", res["adapter_result"]["adapter_domain"])
    print("Ready for handoff:", res["adapter_result"]["ready_for_handoff"])
    print("Compiled claim (first 200 chars):", json.dumps(res["adapter_result"]["compiled_claim"], indent=2)[:200])
