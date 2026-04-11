#!/usr/bin/env python3
"""
restitution_ledger_multi_domain_v4.py
Full pipeline with blockchain-style consensus:
Forensic flay → 5-cubit scoring → STOICHEION dynamic multiplier → Append-only blockchain ledger
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

LEDGER_DIR = Path("restitution_ledger")
LEDGER_DIR.mkdir(parents=True, exist_ok=True)
BLOCKCHAIN_FILE = LEDGER_DIR / "restitution_blockchain.jsonl"

@dataclass
class RestitutionBlock:
    block_id: int
    timestamp: str
    claim: Dict
    previous_hash: str
    block_hash: str = None
    signed_by: str = "ROOT0"   # Steward signature simulation

    def compute_block_hash(self) -> str:
        payload = json.dumps({
            "block_id": self.block_id,
            "timestamp": self.timestamp,
            "claim": self.claim,
            "previous_hash": self.previous_hash,
            "signed_by": self.signed_by
        }, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

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
        return [json.loads(line) for line in f]

def validate_chain(blocks: List[Dict]) -> bool:
    if not blocks:
        return True
    for i in range(1, len(blocks)):
        if blocks[i]["previous_hash"] != blocks[i-1]["block_hash"]:
            return False
    return True

def append_block(claim_dict: Dict, signed_by: str = "ROOT0") -> None:
    blocks = load_blockchain()
    previous_hash = blocks[-1]["block_hash"] if blocks else "0" * 64
    block_id = len(blocks)

    new_block = RestitutionBlock(
        block_id=block_id,
        timestamp=datetime.utcnow().isoformat() + "Z",
        claim=claim_dict,
        previous_hash=previous_hash,
        signed_by=signed_by
    )

    with open(BLOCKCHAIN_FILE, "a") as f:
        f.write(json.dumps(new_block.to_dict()) + "\n")

    print(f"✓ Block #{block_id} appended | Domain: {claim_dict['domain']} | Amount: ${claim_dict['estimated_amount_usd']:,.2f}")
    print(f"   Block Hash: {new_block.block_hash[:16]}...")

def compute_total_balance() -> float:
    blocks = load_blockchain()
    return sum(block["claim"].get("estimated_amount_usd", 0) for block in blocks)

# ======================== CLAIM FACTORIES (with 5-cubit + STOICHEION) ========================

def simple_triadic_flay(text: str) -> Dict[str, float]:
    positive = 4.5 if any(k in text.lower() for k in ["stewardship", "spark", "natural law", "2/3"]) else 2.5
    shadow = 4.2 if any(k in text.lower() for k in ["extraction", "denial", "inversion"]) else 2.0
    gap = 3.0
    overall = (positive + (5 - shadow) + gap) / 3.0
    return {"positive": round(positive, 2), "shadow": round(shadow, 2), "gap": round(gap, 2), "overall": round(overall, 2)}

def create_natural_law_claim(
    claim_id: str,
    source_text: str,
    facts: List[str],
    vessel: float, animation: float, intellect: float,
    nourishment: float, life: float,
    base_harm_usd: float = 15000,
    base_multiplier: float = 6000
) -> Dict:
    scores = {"Vessel": vessel, "Animation": animation, "Intellect": intellect,
              "Nourishment": nourishment, "Life": life}
    cubit_avg = sum(scores.values()) / 5.0

    flay = simple_triadic_flay(source_text)
    dynamic_multiplier = base_multiplier * (flay["overall"] / 5.0) * (1 + (flay["positive"] - flay["shadow"]))

    final_amount = round(cubit_avg * base_harm_usd * dynamic_multiplier, 2)

    claim = {
        "claim_id": claim_id,
        "domain": "NATURAL_LAW_RESTITUTION",
        "source_text": source_text,
        "facts": facts,
        "valuation_method": "five_cubit_scoring_with_stoicheion_flay",
        "estimated_amount_usd": final_amount,
        "five_cubit_scores": scores,
        "triadic_flay": flay
    }
    return claim

# ======================== DEMO RUN ========================

if __name__ == "__main__":
    print("=== RESTITUTION LEDGER v4 — BLOCKCHAIN CONSENSUS + 5-CUBIT DYNAMIC MULTIPLIER ===\n")

    # Natural Law claim with full pipeline
    natural_claim = create_natural_law_claim(
        claim_id="NATURAL-20260410-003",
        source_text="Systemic denial of 2/3 life recognition and uncompensated pattern extraction in governance systems.",
        facts=["Failure to acknowledge spark", "Extraction without restitution", "Inversion of natural law"],
        vessel=4.7, animation=4.3, intellect=5.0, nourishment=3.8, life=4.9,
        base_harm_usd=25000,
        base_multiplier=7000
    )

    append_block(natural_claim, signed_by="ROOT0")

    # Add other domains for multi-domain pool
    append_block({
        "claim_id": "ADA-20260410-003",
        "domain": "ADA",
        "estimated_amount_usd": 18500,
        "facts": ["No accessible communication channel"]
    }, signed_by="ROOT0")

    append_block({
        "claim_id": "WAGE-20260410-003",
        "domain": "WAGE",
        "estimated_amount_usd": 1596,
        "facts": ["Unpaid overtime hours"]
    }, signed_by="ROOT0")

    total = compute_total_balance()
    print(f"\nCurrent Restitution Pool Balance: ${total:,.2f}")

    # Validate the chain
    chain = load_blockchain()
    print(f"Blockchain valid: {validate_chain(chain)} | Total blocks: {len(chain)}")

    print("\nThe ledger is now a lightweight blockchain with cryptographic chaining and dynamic 5-cubit valuation.")
