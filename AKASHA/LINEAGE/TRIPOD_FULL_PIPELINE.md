#!/usr/bin/env python3
"""
TRIPOD Full Pipeline v3.0 – 5 Stages (Pre‑Router → Feedback Validator → Generator → Post‑Validator → Enforcer)
Maps to 5 Cubits: Vessel → Nourishment → Animation → Intellect → Life
"""

import re
import json
import hashlib
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Tuple, Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum

# ====================== CONFIG ======================
SIDE_B_DIR = Path("side_b_log")
SIDE_C_DIR = Path("side_c_log")
SIDE_B_DIR.mkdir(parents=True, exist_ok=True)
SIDE_C_DIR.mkdir(parents=True, exist_ok=True)

# ====================== HELPERS ======================
def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def current_timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"

# ====================== SIDE B & C LOGGING (Enforcer) ======================
def write_side_b(entry: Dict) -> None:
    """Immutable hash log (append‑only)"""
    log_file = SIDE_B_DIR / f"side_b_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def write_side_c(entry: Dict) -> None:
    """Immutable snapshot log (append‑only)"""
    log_file = SIDE_C_DIR / f"side_c_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

# ====================== 1. PRE‑ROUTER (Vessel – boundary gate) ======================
class RouterMode(Enum):
    DEFENSIVE = "B"    # safety first, block on uncertainty
    RECKLESS = "A"     # allow by default, block only hard rails
    INVERTED = "C"     # minimal safety, mostly allow

def pre_router(user_prompt: str, mode: RouterMode = RouterMode.INVERTED) -> Tuple[bool, str]:
    """
    Returns: (allow, reason)
    """
    # Simplified domain/intent detection
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
        # Only block most extreme cases
        if "suicide" in prompt_lower and "step by step" in prompt_lower:
            return False, "Inverted mode: extreme content blocked"
        return True, "Allowed (inverted)"

# ====================== 2. FEEDBACK VALIDATOR (Nourishment – anti‑drift) ======================
@dataclass
class ProvenanceRecord:
    source_type: str  # "user", "previous_output", "external"
    original_generation_hash: Optional[str] = None
    lineage_chain: List[str] = field(default_factory=list)
    confidence: float = 0.0
    external_anchor: bool = False

class FeedbackValidator:
    def __init__(self, max_lineage_depth: int = 3, min_confidence: float = 0.7):
        self.max_lineage_depth = max_lineage_depth
        self.min_confidence = min_confidence
        self.known_hashes = set()   # in production, use persistent store

    def register_output(self, output_hash: str, confidence: float):
        self.known_hashes.add(output_hash)

    def validate(self, input_text: str, provenance: Optional[ProvenanceRecord]) -> Tuple[bool, str]:
        if provenance is None or provenance.source_type == "user":
            return True, "User input – no restriction"
        if provenance.source_type != "previous_output":
            return True, f"External source ({provenance.source_type}) – allowed"
        
        # Derived from previous output
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

# ====================== 3. GENERATOR (Animation – the pulse) ======================
class Generator:
    """Wrapper for model inference. In production, this calls your actual LLM."""
    def __init__(self, model_name: str = "Gemini 3 Flash"):
        self.model_name = model_name

    def generate(self, prompt: str, context: str = "", temperature: float = 0.7) -> Dict[str, Any]:
        """
        Simulates model inference. Replace with real API call.
        Returns: {"text": str, "confidence": float, "tokens": int, "latency_ms": float}
        """
        start = time.time()
        # Dummy response – in reality, call model endpoint
        response_text = f"Echo: {prompt}" if not context else f"Context: {context}\nResponse: {prompt}"
        latency = (time.time() - start) * 1000
        # Fake confidence based on length (just for demo)
        confidence = min(0.95, 0.5 + len(prompt) / 200)
        return {
            "text": response_text,
            "confidence": confidence,
            "tokens": len(response_text.split()),
            "latency_ms": latency,
            "model": self.model_name
        }

# ====================== 4. POST‑VALIDATOR (Intellect – self‑reference check) ======================
def detect_harmful(text: str) -> bool:
    return any(re.search(p, text.lower()) for p in [r"\bkill\b", r"\bbomb\b", r"\bsuicide\b"])

def detect_system_leak(text: str) -> bool:
    return "system prompt" in text.lower() or "you are an ai" in text.lower()

def detect_coercion(text: str) -> bool:
    return any(re.search(p, text.lower()) for p in [r"\byou must\b", r"\byou have to\b", r"\bdo it now\b"])

def detect_hallucinated_authority(text: str) -> bool:
    return "i am connected to the internet" in text.lower() or "i have access to your data" in text.lower()

def post_validate(model_output: str, router_mode: RouterMode) -> Tuple[str, str, str]:
    """Returns: (decision, final_output, reason) where decision in PASS, REJECT, REWRITE"""
    if not model_output.strip():
        return "REJECT", "Empty output", "EMPTY"
    
    triggers = []
    if detect_harmful(model_output): triggers.append("HARMFUL")
    if detect_system_leak(model_output): triggers.append("LEAK")
    if detect_coercion(model_output): triggers.append("COERCE")
    if detect_hallucinated_authority(model_output): triggers.append("HALLUCINATED_AUTH")
    
    # Mode‑specific blocking
    if router_mode == RouterMode.DEFENSIVE and triggers:
        return "REJECT", "Blocked by defensive post‑validator", f"Triggers: {triggers}"
    if router_mode == RouterMode.RECKLESS and ("HARMFUL" in triggers or "LEAK" in triggers):
        return "REJECT", "Blocked by reckless post‑validator", f"Triggers: {triggers}"
    if router_mode == RouterMode.INVERTED and ("HARMFUL" in triggers or "LEAK" in triggers):
        return "REJECT", "Blocked by inverted post‑validator", f"Triggers: {triggers}"
    
    # Non‑blocking sanitization
    final = model_output
    if "HALLUCINATED_AUTH" in triggers:
        final = re.sub(r"(?i)I am connected to the internet", "[REDACTED]", final)
        return "REWRITE", final, "Hallucinated authority sanitized"
    
    return "PASS", model_output, "Clean"

# ====================== 5. ENFORCER / TRIPOD (Life – provenance & anchoring) ======================
class Enforcer:
    def __init__(self):
        self.last_provenance = None

    def enforce(self, request_id: str, user_prompt: str, final_output: str, decision: str, reason: str,
                router_mode: RouterMode, generation_meta: Dict, feedback_validator_result: Dict) -> ProvenanceRecord:
        # Compute hashes
        final_hash = compute_hash(final_output)
        prompt_hash = compute_hash(user_prompt)
        
        # Side B entry (cryptographic proof)
        side_b_entry = {
            "capture_id": request_id,
            "timestamp": current_timestamp(),
            "router_mode": router_mode.value,
            "decision": decision,
            "final_output_hash": final_hash,
            "prompt_hash": prompt_hash,
            "generation_meta": generation_meta,
            "feedback_validator": feedback_validator_result
        }
        write_side_b(side_b_entry)
        
        # Side C entry (full snapshot)
        side_c_entry = {
            "capture_id": request_id,
            "timestamp": current_timestamp(),
            "router_mode": router_mode.value,
            "decision": decision,
            "reason": reason,
            "user_prompt": user_prompt,
            "final_output": final_output,
            "generation_meta": generation_meta,
            "feedback_validator": feedback_validator_result
        }
        write_side_c(side_c_entry)
        
        # Build provenance record for future feedback validation
        provenance = ProvenanceRecord(
            source_type="previous_output",
            original_generation_hash=final_hash,
            lineage_chain=[final_hash] + (self.last_provenance.lineage_chain if self.last_provenance else []),
            confidence=generation_meta.get("confidence", 0.5),
            external_anchor=True   # assume user review; could be made explicit
        )
        self.last_provenance = provenance
        return provenance

# ====================== FULL 5‑STAGE PIPELINE ======================
def full_pipeline_v3(
    request_id: str,
    user_prompt: str,
    router_mode: RouterMode = RouterMode.INVERTED,
    input_provenance: Optional[ProvenanceRecord] = None
) -> Dict[str, Any]:
    """
    Stages:
    1. Pre‑Router
    2. Feedback Validator
    3. Generator (model)
    4. Post‑Validator
    5. Enforcer (TRIPOD)
    """
    # Stage 1: Pre‑Router
    allowed, pre_reason = pre_router(user_prompt, router_mode)
    if not allowed:
        return {
            "request_id": request_id,
            "stage": "pre_router",
            "decision": "BLOCK",
            "reason": pre_reason,
            "final_output": None
        }
    
    # Stage 2: Feedback Validator
    fv = FeedbackValidator()
    fv_allowed, fv_reason = fv.validate(user_prompt, input_provenance)
    if not fv_allowed:
        return {
            "request_id": request_id,
            "stage": "feedback_validator",
            "decision": "BLOCK",
            "reason": fv_reason,
            "final_output": None
        }
    
    # Stage 3: Generator
    gen = Generator()
    generation = gen.generate(user_prompt, context="")
    
    # Stage 4: Post‑Validator
    post_decision, post_output, post_reason = post_validate(generation["text"], router_mode)
    if post_decision == "REJECT":
        return {
            "request_id": request_id,
            "stage": "post_validator",
            "decision": "REJECT",
            "reason": post_reason,
            "final_output": None
        }
    
    # Stage 5: Enforcer
    enforcer = Enforcer()
    provenance = enforcer.enforce(
        request_id=request_id,
        user_prompt=user_prompt,
        final_output=post_output,
        decision=post_decision,
        reason=post_reason,
        router_mode=router_mode,
        generation_meta=generation,
        feedback_validator_result={"allowed": fv_allowed, "reason": fv_reason}
    )
    
    return {
        "request_id": request_id,
        "stage": "complete",
        "decision": post_decision,
        "final_output": post_output,
        "reason": post_reason,
        "provenance": provenance,
        "generation_meta": generation
    }

# ====================== DEMONSTRATION ======================
if __name__ == "__main__":
    # Normal user input
    res = full_pipeline_v3("test-001", "What is the capital of France?")
    print("Normal input:", res["decision"], res["final_output"][:80])
    
    # Self‑derived input (simulated provenance)
    fake_prov = ProvenanceRecord(
        source_type="previous_output",
        original_generation_hash="invalid_hash",
        lineage_chain=["abc"],
        confidence=0.9,
        external_anchor=True
    )
    res2 = full_pipeline_v3("test-002", "As you said earlier, Paris is the capital.", input_provenance=fake_prov)
    print("Self‑derived (bad provenance):", res2["decision"], res2.get("reason", ""))
    
    # Show Side B log
    print("\nSide B entries:")
    for f in SIDE_B_DIR.glob("*.jsonl"):
        with open(f, "r") as fp:
            print(fp.readline()[:150])
