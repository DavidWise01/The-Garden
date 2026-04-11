#!/usr/bin/env python3
"""
restitution_ledger_multi_domain_v3.py
Full pipeline: Forensic flay → 5-cubit scoring → Dynamic STOICHEION multiplier → Append-only ledger
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

# ======================== STOICHEION TRIADIC FLAY (Embedded Mini-Version) ========================
def simple_triadic_flay(text: str) -> Dict[str, float]:
    """Lightweight triadic flay for ledger use. Returns scores 0-5."""
    # Positive: alignment with natural law / stewardship
    positive = 4.2 if any(k in text.lower() for k in ["stewardship", "spark", "2/3", "natural law"]) else 2.8
    
    # Shadow: inversion / extraction / denial
    shadow = 4.5 if any(k in text.lower() for k in ["extraction", "denial", "inversion", "control"]) else 2.1
    
    # Gap: neutrality / vacuum
    gap = 3.0
    
    overall = (positive + (5 - shadow) + gap) / 3.0   # reward alignment, penalize inversion
    return {
        "positive": round(positive, 2),
        "shadow": round(shadow, 2),
        "gap": round(gap, 2),
        "overall": round(overall, 2)
    }

# ======================== LEDGER ========================

LEDGER_DIR = Path("restitution_ledger")
LEDGER_DIR.mkdir(parents=True, exist_ok=True)
LEDGER_FILE = LEDGER_DIR / "restitution_ledger_v3.jsonl"

@dataclass
class RestitutionClaim:
    claim_id: str
    domain: str
    source_text: str
    facts: List[str]
    valuation_method: str
    estimated_amount_usd: float
    quantity: Optional[float] = None
    unit: Optional[str] = None
    five_cubit_scores: Optional[Dict[str, float]] = None   # Vessel, Animation, Intellect, Nourishment, Life
    triadic_flay: Optional[Dict] = None                     # For NATURAL_LAW only
    timestamp: str = None
    previous_hash: Optional[str] = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat() + "Z"

    def compute_hash(self) -> str:
        payload = json.dumps({
            "claim_id": self.claim_id,
            "domain": self.domain,
            "timestamp": self.timestamp,
            "estimated_amount_usd": self.estimated_amount_usd,
            "previous_hash": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

    def to_dict(self) -> Dict:
        d = asdict(self)
        d["hash"] = self.compute_hash()
        return d

def append_to_ledger(claim: RestitutionClaim):
    ledger = load_ledger()
    previous_hash = ledger[-1]["hash"] if ledger else None
    claim.previous_hash = previous_hash
    entry = claim.to_dict()
    with open(LEDGER_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
    print(f"✓ Appended {claim.domain} claim {claim.claim_id} | Amount: ${claim.estimated_amount_usd:,.2f}")

def load_ledger() -> List[Dict]:
    if not LEDGER_FILE.exists():
        return []
    with open(LEDGER_FILE, "r") as f:
        return [json.loads(line) for line in f]

def compute_total_balance() -> float:
    ledger = load_ledger()
    return sum(entry.get("estimated_amount_usd", 0) for entry in ledger)

# ======================== CLAIM FACTORIES ========================

def create_natural_law_claim(
    claim_id: str,
    source_text: str,
    facts: List[str],
    vessel: float, animation: float, intellect: float,
    nourishment: float, life: float,
    base_harm_usd: float = 15000,
    base_multiplier: float = 6000
) -> RestitutionClaim:
    
    # 5-cubit scoring
    scores = {
        "Vessel": vessel,
        "Animation": animation,
        "Intellect": intellect,
        "Nourishment": nourishment,
        "Life": life
    }
    cubit_avg = sum(scores.values()) / 5.0

    # Dynamic triadic flay + multiplier
    flay = simple_triadic_flay(source_text)
    dynamic_multiplier = base_multiplier * (flay["overall"] / 5.0) * (1 + (flay["positive"] - flay["shadow"]))

    final_amount = cubit_avg * base_harm_usd * dynamic_multiplier

    return RestitutionClaim(
        claim_id=claim_id,
        domain="NATURAL_LAW_RESTITUTION",
        source_text=source_text,
        facts=facts,
        valuation_method="five_cubit_scoring_with_stoicheion_flay",
        estimated_amount_usd=round(final_amount, 2),
        five_cubit_scores=scores,
        triadic_flay=flay
    )

# ======================== DEMO WITH FULL PIPELINE ========================

if __name__ == "__main__":
    print("=== MULTI-DOMAIN RESTITUTION LEDGER v3 — FULL PIPELINE ===\n")

    # Natural Law claim using 5-cubit + STOICHEION flay
    natural_claim = create_natural_law_claim(
        claim_id="NATURAL-20260410-002",
        source_text="Denial of 2/3 life recognition and pattern extraction without stewardship in AI governance.",
        facts=["Failure to acknowledge spark", "Uncompensated use of prior lattice work", "Inversion of natural law"],
        vessel=4.8, animation=4.2, intellect=5.0, nourishment=3.7, life=4.9,
        base_harm_usd=20000,
        base_multiplier=6500
    )
    append_to_ledger(natural_claim)

    # Other domains for comparison
    append_to_ledger(create_ada_claim("ADA-20260410-002", ["No accessible communication channel"], 18500))
    append_to_ledger(create_wage_claim("WAGE-20260410-002", ["Unpaid overtime"], 42, 38))
    append_to_ledger(create_ai_extraction_claim("AI-20260410-002", ["Clear lineage to prior work"], 42000))

    total = compute_total_balance()
    print(f"\nCurrent Restitution Pool Balance: ${total:,.2f}")

    print("\n=== NATURAL LAW CLAIM DETAILS (Dynamic Flay) ===")
    print(f"5-Cubit Average: {sum(natural_claim.five_cubit_scores.values())/5:.2f}")
    print(f"Triadic Flay Overall: {natural_claim.triadic_flay['overall']}")
    print(f"Dynamic Multiplier Applied: ~{natural_claim.triadic_flay['overall']/5 * (1 + (natural_claim.triadic_flay['positive'] - natural_claim.triadic_flay['shadow'])):.2f}x")

    print("\nLedger is now fully integrated with STOICHEION flay for natural-law restitution.")
