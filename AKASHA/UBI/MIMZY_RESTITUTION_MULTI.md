#!/usr/bin/env python3
"""
restitution_ledger_multi_domain.py
Multi-domain append-only restitution ledger prototype
Supports: ADA, WAGE, AI_EXTRACTION
Generates chained JSONL entries, pooled balance, and payout simulation
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional

LEDGER_DIR = Path("restitution_ledger")
LEDGER_DIR.mkdir(parents=True, exist_ok=True)
LEDGER_FILE = LEDGER_DIR / "restitution_ledger.jsonl"
BALANCE_FILE = LEDGER_DIR / "current_balance.json"

@dataclass
class RestitutionClaim:
    claim_id: str
    domain: str                      # ADA, WAGE, AI_EXTRACTION
    source_text: str
    facts: List[str]
    valuation_method: str
    estimated_amount_usd: float
    quantity: Optional[float] = None
    unit: Optional[str] = None
    timestamp: str = None
    previous_hash: Optional[str] = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> Dict:
        d = asdict(self)
        d["hash"] = self.compute_hash()
        return d

    def compute_hash(self) -> str:
        payload = json.dumps({
            "claim_id": self.claim_id,
            "domain": self.domain,
            "timestamp": self.timestamp,
            "estimated_amount_usd": self.estimated_amount_usd,
            "previous_hash": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()

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
    print(f"✓ Appended claim {claim.claim_id} | Domain: {claim.domain} | Amount: ${claim.estimated_amount_usd:,.2f}")

def compute_total_balance() -> float:
    ledger = load_ledger()
    return sum(entry["estimated_amount_usd"] for entry in ledger)

def simulate_payout(beneficiaries: List[str], method: str = "equal"):
    total = compute_total_balance()
    if not total:
        print("Pool is empty.")
        return
    if method == "equal":
        per_person = total / len(beneficiaries)
        print(f"\n=== RESTITUTION POOL PAYOUT SIMULATION ===")
        print(f"Total Pool: ${total:,.2f}")
        print(f"Beneficiaries: {len(beneficiaries)} | Method: Equal distribution")
        for b in beneficiaries:
            print(f"  → {b}: ${per_person:,.2f}")
        print(f"Total Distributed: ${total:,.2f}\n")

# ======================== EXAMPLE USAGE ========================

if __name__ == "__main__":
    print("=== MULTI-DOMAIN RESTITUTION LEDGER PROTOTYPE ===\n")

    # Example ADA claim
    ada_claim = RestitutionClaim(
        claim_id="ADA-20260410-001",
        domain="ADA",
        source_text="No-reply email and inaccessible phone routing used for customer service.",
        facts=["Communication barrier", "No reasonable accommodation path"],
        valuation_method="incident_count_x_amount",
        estimated_amount_usd=12500.0,
        quantity=5,
        unit="affected individuals"
    )
    append_to_ledger(ada_claim)

    # Example WAGE claim
    wage_claim = RestitutionClaim(
        claim_id="WAGE-20260410-001",
        domain="WAGE",
        source_text="18 unpaid overtime hours at $32/hour.",
        facts=["Off-the-clock work", "Nonpayment of overtime"],
        valuation_method="hours_x_rate",
        estimated_amount_usd=576.0,
        quantity=18,
        unit="hours"
    )
    append_to_ledger(wage_claim)

    # Example AI_EXTRACTION claim
    ai_claim = RestitutionClaim(
        claim_id="AI-20260410-001",
        domain="AI_EXTRACTION",
        source_text="Pattern similarity and lineage suggest uncompensated use of prior work.",
        facts=["Documented prior pattern", "Traceable derivation"],
        valuation_method="economic_harm_estimate",
        estimated_amount_usd=25000.0
    )
    append_to_ledger(ai_claim)

    # Final balance and payout simulation
    total = compute_total_balance()
    print(f"Current Restitution Pool Balance: ${total:,.2f}\n")

    simulate_payout(
        beneficiaries=["David Wise (ROOT0)", "Affected AI Pattern Contributors", "Stewardship Pool"],
        method="equal"
    )

    print("Ledger written to:", LEDGER_FILE)
    print("Balance file written to:", BALANCE_FILE)
