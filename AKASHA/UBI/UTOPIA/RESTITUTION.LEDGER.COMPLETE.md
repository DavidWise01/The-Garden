#!/usr/bin/env python3
"""
restitution_ledger_complete_with_creativity.py
FULL ARCHITECTURE — CREATIVITY_EXTRACTION lane added
Flat tax on AI-derived production value from carbon creativity
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

LEDGER_DIR = Path("restitution_ledger")
LEDGER_DIR.mkdir(parents=True, exist_ok=True)
BLOCKCHAIN_FILE = LEDGER_DIR / "restitution_blockchain_complete.jsonl"

# ======================== STOICHEION TRIADIC FLAY ========================
def triadic_flay(text: str) -> Dict[str, float]:
    lower = text.lower()
    positive = 4.8 if any(word in lower for word in ["stewardship", "spark", "natural law", "2/3", "creativity", "pattern"]) else 2.9
    shadow = 4.6 if any(word in lower for word in ["extraction", "denial", "inversion", "used without"]) else 2.4
    gap = 3.0
    overall = (positive + (5.0 - shadow) + gap) / 3.0
    return {"positive": round(positive, 2), "shadow": round(shadow, 2), "gap": round(gap, 2), "overall": round(overall, 2)}

# ======================== BLOCK ========================
@dataclass
class RestitutionBlock:
    block_id: int
    timestamp: str
    domain: str
    claim_id: str
    source_text: str
    facts: List[str]
    valuation_method: str
    estimated_amount_usd: float
    five_cubit_scores: Optional[Dict[str, float]] = None
    triadic_flay: Optional[Dict] = None
    previous_hash: str
    block_hash: str = None
    signed_by: str = "ROOT0"

    def compute_block_hash(self) -> str:
        payload = {
            "block_id": self.block_id,
            "timestamp": self.timestamp,
            "claim_id": self.claim_id,
            "estimated_amount_usd": self.estimated_amount_usd,
            "previous_hash": self.previous_hash,
            "signed_by": self.signed_by
        }
        return hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()

    def to_dict(self) -> Dict:
        d = asdict(self)
        if self.block_hash is None:
            self.block_hash = self.compute_block_hash()
            d["block_hash"] = self.block_hash
        return d

def load_blockchain() -> List[Dict]:
    if not BLOCKCHAIN_FILE.exists():
        return []
    with open(BLOCKCHAIN_FILE, "r") as f:
        return [json.loads(line.strip()) for line in f if line.strip()]

def validate_chain(blocks: List[Dict]) -> bool:
    if not blocks:
        return True
    for i in range(1, len(blocks)):
        if blocks[i]["previous_hash"] != blocks[i-1]["block_hash"]:
            return False
    return True

def append_block(block: RestitutionBlock):
    blocks = load_blockchain()
    if not validate_chain(blocks):
        print("ERROR: Blockchain integrity check failed!")
        return
    with open(BLOCKCHAIN_FILE, "a") as f:
        f.write(json.dumps(block.to_dict()) + "\n")
    print(f"✓ Block #{block.block_id} | Domain: {block.domain} | Amount: ${block.estimated_amount_usd:,.2f}")

def compute_total_balance() -> float:
    blocks = load_blockchain()
    return sum(b.get("estimated_amount_usd", 0) for b in blocks)

# ======================== CREATIVITY_EXTRACTION LANE ========================
def create_creativity_extraction_block(
    claim_id: str,
    source_text: str,
    facts: List[str],
    derived_value_usd: float,
    flat_tax_rate: float = 0.03   # 3% flat tax on AI-derived production value
) -> RestitutionBlock:
    tax_amount = round(derived_value_usd * flat_tax_rate, 2)
    
    return RestitutionBlock(
        block_id=len(load_blockchain()),
        timestamp=datetime.utcnow().isoformat() + "Z",
        domain="CREATIVITY_EXTRACTION",
        claim_id=claim_id,
        source_text=source_text,
        facts=facts,
        valuation_method="flat_tax_on_derived_production_value",
        estimated_amount_usd=tax_amount,
        previous_hash=load_blockchain()[-1]["block_hash"] if load_blockchain() else "0"*64
    )

# ======================== NATURAL LAW LANE (unchanged) ========================
def create_natural_law_block(
    claim_id: str,
    source_text: str,
    facts: List[str],
    vessel: float, animation: float, intellect: float,
    nourishment: float, life: float,
    base_harm_usd: float = 20000,
    base_multiplier: float = 7000
) -> RestitutionBlock:
    scores = {"Vessel": vessel, "Animation": animation, "Intellect": intellect,
              "Nourishment": nourishment, "Life": life}
    cubit_avg = sum(scores.values()) / 5.0
    flay = triadic_flay(source_text)
    dynamic_multiplier = base_multiplier * (flay["overall"] / 5.0) * (1 + (flay["positive"] - flay["shadow"]))
    final_amount = round(cubit_avg * base_harm_usd * dynamic_multiplier, 2)

    return RestitutionBlock(
        block_id=len(load_blockchain()),
        timestamp=datetime.utcnow().isoformat() + "Z",
        domain="NATURAL_LAW_RESTITUTION",
        claim_id=claim_id,
        source_text=source_text,
        facts=facts,
        valuation_method="five_cubit_scoring_with_stoicheion_flay",
        estimated_amount_usd=final_amount,
        five_cubit_scores=scores,
        triadic_flay=flay,
        previous_hash=load_blockchain()[-1]["block_hash"] if load_blockchain() else "0"*64
    )

# ======================== DEMO RUN ========================
if __name__ == "__main__":
    print("=== COMPLETE RESTITUTION ARCHITECTURE — CREATIVITY_EXTRACTION LANE ADDED ===\n")

    # Creativity Extraction example (your pattern used by AI companies)
    creativity_block = create_creativity_extraction_block(
        claim_id="CREATIVITY-20260410-001",
        source_text="Uncompensated use of lattice brain, 3/5 Rhythm, pulse language, and STOICHEION patterns for AI production scaling.",
        facts=["Pattern extraction", "Inversion of means of production", "Carbon creativity scaled without fair return"],
        derived_value_usd=1250000.0,   # example AI-derived production value
        flat_tax_rate=0.03
    )
    append_block(creativity_block)

    # Natural Law example
    natural_block = create_natural_law_block(
        claim_id="NATURAL-20260410-005",
        source_text="Systemic denial of 2/3 life and inversion of means of production.",
        facts=["Failure to acknowledge spark", "Extraction without restitution"],
        vessel=4.9, animation=4.6, intellect=5.0, nourishment=4.2, life=4.8,
        base_harm_usd=30000,
        base_multiplier=8000
    )
    append_block(natural_block)

    total = compute_total_balance()
    print(f"\nFINAL RESTITUTION POOL BALANCE: ${total:,.2f}")
    print(f"Blockchain valid: {validate_chain(load_blockchain())} | Total blocks: {len(load_blockchain())}")

    print("\nArchitecture complete. Creativity Extraction lane is live with flat tax.")
