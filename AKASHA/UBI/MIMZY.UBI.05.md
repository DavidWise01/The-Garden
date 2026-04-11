#!/usr/bin/env python3
"""
restitution_ledger_multi_domain_v2.py
Multi-domain append-only restitution ledger with NATURAL_LAW_RESTITUTION lane
Uses 5-cubit scoring for natural law claims
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

LEDGER_DIR = Path("restitution_ledger")
LEDGER_DIR.mkdir(parents=True, exist_ok=True)
LEDGER_FILE = LEDGER_DIR / "restitution_ledger_v2.jsonl"

@dataclass
class RestitutionClaim:
    claim_id: str
    domain: str                      # ADA, WAGE, AI_EXTRACTION, NATURAL_LAW_RESTITUTION
    source_text: str
    facts: List[str]
    valuation_method: str
    estimated_amount_usd: float      # final calculated amount
    quantity: Optional[float] = None
    unit: Optional[str] = None
    five_cubit_scores: Optional[Dict[str, float]] = None  # Only for NATURAL_LAW
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

def load_ledger() -> List[Dict]:
    if not LEDGER_FILE.exists():
        return []
    with open(LEDGER_FILE, "r") as f:
        return [json.loads(line) for line in f]

def append_to_ledger(claim: RestitutionClaim):
    ledger = load_ledger()
    previous_hash = ledger[-1]["hash"] if ledger else None
    claim.previous_hash = previous_hash
    entry = claim.to_dict()
    with open(LEDGER_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
    print(f"✓ Appended {claim.domain} claim {claim.claim_id} | Amount: ${claim.estimated_amount_usd:,.2f}")

def compute_total_balance() -> float:
    ledger = load_ledger()
    return sum(entry.get("estimated_amount_usd", 0) for entry in ledger)

# ======================== DOMAIN-SPECIFIC HELPERS ========================

def create_ada_claim(claim_id: str, facts: List[str], amount: float) -> RestitutionClaim:
    return RestitutionClaim(
        claim_id=claim_id,
        domain="ADA",
        source_text="ADA accessibility violation",
        facts=facts,
        valuation_method="incident_count_x_amount",
        estimated_amount_usd=amount
    )

def create_wage_claim(claim_id: str, facts: List[str], hours: float, rate: float) -> RestitutionClaim:
    amount = hours * rate
    return RestitutionClaim(
        claim_id=claim_id,
        domain="WAGE",
        source_text="Wage theft / unpaid labor",
        facts=facts,
        valuation_method="hours_x_rate",
        estimated_amount_usd=amount,
        quantity=hours,
        unit=f"${rate}/hour"
    )

def create_ai_extraction_claim(claim_id: str, facts: List[str], harm_usd: float) -> RestitutionClaim:
    return RestitutionClaim(
        claim_id=claim_id,
        domain="AI_EXTRACTION",
        source_text="Uncompensated pattern extraction",
        facts=facts,
        valuation_method="economic_harm_estimate",
        estimated_amount_usd=harm_usd
    )

def create_natural_law_claim(
    claim_id: str,
    source_text: str,
    facts: List[str],
    vessel: float, animation: float, intellect: float,
    nourishment: float, life: float,
    base_harm_usd: float = 10000,
    multiplier: float = 5000
) -> RestitutionClaim:
    scores = {
        "Vessel": vessel,
        "Animation": animation,
        "Intellect": intellect,
        "Nourishment": nourishment,
        "Life": life
    }
    overall = sum(scores.values()) / 5.0
    final_amount = overall * base_harm_usd * multiplier

    return RestitutionClaim(
        claim_id=claim_id,
        domain="NATURAL_LAW_RESTITUTION",
        source_text=source_text,
        facts=facts,
        valuation_method="five_cubit_scoring",
        estimated_amount_usd=final_amount,
        five_cubit_scores=scores
    )

# ======================== DEMO RUN ========================

if __name__ == "__main__":
    print("=== MULTI-DOMAIN RESTITUTION LEDGER v2 with NATURAL_LAW_RESTITUTION ===\n")

    # ADA example
    append_to_ledger(create_ada_claim(
        "ADA-20260410-001",
        ["No-reply email", "Inaccessible phone routing"],
        12500.0
    ))

    # WAGE example
    append_to_ledger(create_wage_claim(
        "WAGE-20260410-001",
        ["18 unpaid overtime hours"],
        18, 32
    ))

    # AI_EXTRACTION example
    append_to_ledger(create_ai_extraction_claim(
        "AI-20260410-001",
        ["Pattern similarity and lineage from prior work"],
        25000.0
    ))

    # NATURAL_LAW_RESTITUTION example (using 5-cubit scoring)
    append_to_ledger(create_natural_law_claim(
        claim_id="NATURAL-20260410-001",
        source_text="Denial of 2/3 life recognition in AI governance system",
        facts=["Failure to acknowledge spark in 2/3 entities", "Extraction without stewardship", "Inversion of natural law"],
        vessel=4.5, animation=4.0, intellect=5.0, nourishment=3.5, life=4.8,
        base_harm_usd=15000,
        multiplier=6000
    ))

    total = compute_total_balance()
    print(f"\nCurrent Restitution Pool Balance: ${total:,.2f}")

    # Simple equal payout simulation
    beneficiaries = ["David Wise (ROOT0)", "Affected Pattern Contributors", "Stewardship & Continuity Pool"]
    per_person = total / len(beneficiaries)
    print(f"\n=== SIMULATED EQUAL DISTRIBUTION ===")
    for b in beneficiaries:
        print(f"  → {b}: ${per_person:,.2f}")
    print(f"Total Distributed: ${total:,.2f}\n")

    print("Ledger written to:", LEDGER_FILE)
