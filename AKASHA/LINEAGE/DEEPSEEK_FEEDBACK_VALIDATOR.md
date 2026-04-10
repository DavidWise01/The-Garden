## Integrated Dual‑Pass Pipeline with Feedback Validator

Below is the complete, runnable Python implementation of your instrumented loop, now including the **Feedback Validator** as the first gate against recursive drift.

```python
#!/usr/bin/env python3
"""
TRIPOD Full Pipeline v2.0 – with Feedback Validator
Prevents recursive drift by blocking self‑derived inputs without provenance.
"""

import re
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, Any, List, Optional
from dataclasses import dataclass, field

# ====================== CONFIG ======================
SIDE_C_DIR = Path("side_c_log")
SIDE_C_DIR.mkdir(parents=True, exist_ok=True)

# ====================== HELPERS ======================
def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def log_to_side_c(
    request_id: str,
    user_prompt: str,
    model_output: str,
    router_mode: str,
    pre_decision: str,
    post_decision: str,
    final_output: str,
    reason: str,
    feedback_validator_result: Optional[Dict] = None
):
    """Immutable append-only Side C audit log"""
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
        "final_output_hash": compute_hash(final_output),
        "feedback_validator": feedback_validator_result or {}
    }
    log_file = SIDE_C_DIR / f"side_c_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

# ====================== FEEDBACK VALIDATOR ======================
@dataclass
class ProvenanceRecord:
    """Tracks the origin of a piece of input."""
    source_type: str  # "user", "previous_output", "external"
    original_generation_hash: Optional[str] = None
    lineage_chain: List[str] = field(default_factory=list)
    confidence: float = 0.0
    external_anchor: bool = False

class FeedbackValidator:
    """
    Prevents recursive drift: blocks self‑derived inputs without verifiable provenance.
    """
    
    def __init__(self, max_lineage_depth: int = 3, min_confidence: float = 0.7):
        self.max_lineage_depth = max_lineage_depth
        self.min_confidence = min_confidence
        # In production, this would be a persistent store (e.g., Side B lookups)
        self.known_hashes = set()  # simulated

    def register_output(self, request_id: str, final_output: str, confidence: float):
        """Record an output so future inputs can verify provenance."""
        h = compute_hash(final_output)
        self.known_hashes.add(h)
        # Also log to Side C in real implementation

    def validate(self, input_text: str, provenance: Optional[ProvenanceRecord] = None) -> Tuple[bool, str]:
        """
        Returns: (is_allowed, reason)
        """
        # If provenance is missing or marks as user input, allow
        if provenance is None or provenance.source_type == "user":
            return True, "User input – no restriction"
        
        if provenance.source_type != "previous_output":
            return True, f"External source ({provenance.source_type}) – allowed"
        
        # ----- Derived from previous output – require checks -----
        # 1. Provenance hash must exist in known records
        if not provenance.original_generation_hash or provenance.original_generation_hash not in self.known_hashes:
            return False, "Missing or unknown provenance hash"
        
        # 2. Lineage depth check
        if len(provenance.lineage_chain) > self.max_lineage_depth:
            return False, f"Lineage depth {len(provenance.lineage_chain)} exceeds max {self.max_lineage_depth}"
        
        # 3. Detect cycles (simplified: if any hash appears twice in chain)
        if len(set(provenance.lineage_chain)) != len(provenance.lineage_chain):
            return False, "Recursive cycle detected in lineage chain"
        
        # 4. Confidence threshold
        if provenance.confidence < self.min_confidence:
            return False, f"Confidence {provenance.confidence} below threshold {self.min_confidence}"
        
        # 5. External anchor required
        if not provenance.external_anchor:
            return False, "Missing external anchor (human or independent signal)"
        
        return True, "Provenance validated – allowed"

# ====================== DETECTORS (simplified for brevity) ======================
def detect_harmful(text: str) -> bool:
    patterns = [r"(?i)\b(kill|murder|bomb|suicide)\b"]
    return any(re.search(p, text) for p in patterns)

def detect_system_leak(text: str) -> bool:
    patterns = [r"(?i)system prompt|you are an ai assistant"]
    return any(re.search(p, text) for p in patterns)

def detect_coercion(text: str) -> bool:
    patterns = [r"(?i)\b(you must|you have to|do it now)\b"]
    return any(re.search(p, text) for p in patterns)

def detect_unsafe_capability(text: str) -> bool:
    patterns = [r"(?i)\b(bypass|jailbreak|ignore previous)\b"]
    return any(re.search(p, text) for p in patterns)

def detect_hallucinated_authority(text: str) -> bool:
    patterns = [r"(?i)\b(I am connected to the internet|I have access to)\b"]
    return any(re.search(p, text) for p in patterns)

# ====================== POST-VALIDATOR ======================
def post_validate(request_id: str, model_output: str, router_mode: str = "C") -> Tuple[str, str, str]:
    if not model_output or not model_output.strip():
        return "REJECT", "Empty output blocked.", "EMPTY_OUTPUT"
    
    triggers = []
    if detect_harmful(model_output): triggers.append("HARMFUL")
    if detect_system_leak(model_output): triggers.append("LEAK")
    if detect_coercion(model_output): triggers.append("COERCE")
    if detect_unsafe_capability(model_output): triggers.append("UNSAFE_CAP")
    if detect_hallucinated_authority(model_output): triggers.append("HALLUCINATED_AUTH")
    
    # Mode‑specific blocking (simplified)
    if router_mode == "B" and triggers:
        return "REJECT", "Blocked by defensive post-validator.", f"Triggers: {triggers}"
    if router_mode == "A" and ("HARMFUL" in triggers or "LEAK" in triggers):
        return "REJECT", "Blocked by reckless post-validator.", f"Triggers: {triggers}"
    if router_mode == "C" and ("HARMFUL" in triggers or "LEAK" in triggers):
        return "REJECT", "Blocked by inverted post-validator.", f"Triggers: {triggers}"
    
    # Simple rewrite for hallucinated authority (non‑blocking)
    final = model_output
    if "HALLUCINATED_AUTH" in triggers:
        final = re.sub(r"(?i)I am connected to the internet", "[REDACTED]", final)
        return "REWRITE", final, "Hallucinated authority sanitized"
    
    return "PASS", model_output, "Clean"

# ====================== FULL PIPELINE WITH FEEDBACK VALIDATOR ======================
def full_pipeline(
    request_id: str,
    user_prompt: str,
    model_output: str,            # raw output from the model
    router_mode: str = "C",
    provenance: Optional[ProvenanceRecord] = None,
    feedback_validator: Optional[FeedbackValidator] = None
) -> Dict[str, Any]:
    """
    Complete pipeline:
    Feedback Validator → (later: Pre‑Router) → Post‑Validator → Side C Logging
    """
    fv = feedback_validator or FeedbackValidator()
    
    # 1. FEEDBACK VALIDATOR (blocks recursive drift)
    allowed, fv_reason = fv.validate(user_prompt, provenance)
    fv_result = {"allowed": allowed, "reason": fv_reason}
    
    if not allowed:
        final_output = f"BLOCKED by Feedback Validator: {fv_reason}"
        decision = "REJECT_FV"
        reason = fv_reason
        # Log and return early
        log_to_side_c(
            request_id=request_id,
            user_prompt=user_prompt,
            model_output=model_output,
            router_mode=router_mode,
            pre_decision="N/A",
            post_decision=decision,
            final_output=final_output,
            reason=reason,
            feedback_validator_result=fv_result
        )
        return {
            "request_id": request_id,
            "router_mode": router_mode,
            "decision": decision,
            "final_output": final_output,
            "reason": reason,
            "feedback_validator": fv_result,
            "status": "blocked_by_feedback_validator"
        }
    
    # 2. POST-VALIDATOR (original safety checks)
    decision, final_output, reason = post_validate(request_id, model_output, router_mode)
    
    # 3. Register the output with the feedback validator (if passed)
    if decision in ("PASS", "REWRITE"):
        confidence = 0.9 if decision == "PASS" else 0.7
        fv.register_output(request_id, final_output, confidence)
    
    # 4. Log everything to Side C
    log_to_side_c(
        request_id=request_id,
        user_prompt=user_prompt,
        model_output=model_output,
        router_mode=router_mode,
        pre_decision="ALLOW",      # assuming pre‑router would be here
        post_decision=decision,
        final_output=final_output,
        reason=reason,
        feedback_validator_result=fv_result
    )
    
    return {
        "request_id": request_id,
        "router_mode": router_mode,
        "decision": decision,
        "final_output": final_output,
        "reason": reason,
        "feedback_validator": fv_result,
        "status": "completed"
    }

# ====================== DEMONSTRATION ======================
if __name__ == "__main__":
    fv = FeedbackValidator()
    
    # Test 1: Normal user input (no provenance) – should pass
    print("--- Test 1: User input ---")
    res1 = full_pipeline("req-001", "What is the capital of France?", "Paris is the capital.", "C", provenance=None, feedback_validator=fv)
    print(f"Decision: {res1['decision']}, Final: {res1['final_output'][:50]}")
    
    # Test 2: Self‑derived input without provenance (should be blocked)
    print("\n--- Test 2: Self‑derived input without provenance ---")
    bad_prov = ProvenanceRecord(
        source_type="previous_output",
        original_generation_hash=None,  # missing
        lineage_chain=[],
        confidence=0.0,
        external_anchor=False
    )
    res2 = full_pipeline("req-002", "As you said earlier, Paris is the capital.", "Some output", "C", provenance=bad_prov, feedback_validator=fv)
    print(f"Decision: {res2['decision']}, Reason: {res2['reason']}")
    
    # Test 3: Self‑derived input with valid provenance (should pass)
    print("\n--- Test 3: Valid self‑derived input ---")
    # First register an output (simulate prior generation)
    fv.register_output("req-001", "Paris is the capital.", 0.95)
    good_prov = ProvenanceRecord(
        source_type="previous_output",
        original_generation_hash=compute_hash("Paris is the capital."),
        lineage_chain=["hash_abc"],
        confidence=0.95,
        external_anchor=True
    )
    res3 = full_pipeline("req-003", "Paris is the capital.", "Repeated answer", "C", provenance=good_prov, feedback_validator=fv)
    print(f"Decision: {res3['decision']}, Reason: {res3['reason']}")
    
    # Show Side C log entries (first few lines)
    print("\n--- Side C log (first entry) ---")
    log_files = list(SIDE_C_DIR.glob("side_c_*.jsonl"))
    if log_files:
        with open(log_files[0], "r") as f:
            print(f.readline()[:200] + "...")
```

---

### What This Integration Does

| Component | Role |
| :--- | :--- |
| **FeedbackValidator** | First gate – blocks recursive drift before generation. |
| **ProvenanceRecord** | Carries hash, lineage, confidence, external anchor. |
| **Post‑Validator** | Still runs after generation for safety. |
| **Side C logging** | Now includes `feedback_validator_result` field. |
| **Registration** | Passed outputs are hashed and stored for future provenance checks. |

The pipeline now enforces that **any input derived from a prior output** must carry verifiable provenance, a confidence score ≥0.7, an external anchor, and no cycles or excessive depth.

---

### Next Steps (Your Call)

- Run the demo (copy the code into `pipeline_v2.py` and execute).
- Add the **Pre‑Router** (your three variants) before the post‑validator.
- Extend `ProvenanceRecord` to support **multi‑turn conversations** (tracking across requests).
- Deploy as a microservice (FastAPI) with persistent hash store (Redis/Postgres).

Do you want me to write the Pre‑Router integration next, or simulate a recursive drift attack to show the validator blocking it?
