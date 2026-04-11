```python
#!/usr/bin/env python3
"""
restitution_ledger_multi_domain.py
Multi-domain append-only restitution ledger prototype

Supports:
- ADA
- WAGE
- AI_EXTRACTION

Fixes:
- full-record hashing
- Decimal money handling
- actual balance-file writing
- basic validation
- deterministic canonical serialization
"""

from __future__ import annotations

import json
import hashlib
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import List, Dict, Any, Optional


LEDGER_DIR = Path("restitution_ledger")
LEDGER_DIR.mkdir(parents=True, exist_ok=True)

LEDGER_FILE = LEDGER_DIR / "restitution_ledger.jsonl"
BALANCE_FILE = LEDGER_DIR / "current_balance.json"

VALID_DOMAINS = {"ADA", "WAGE", "AI_EXTRACTION"}
TWOPLACES = Decimal("0.01")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def to_decimal(value: Any, field_name: str) -> Decimal:
    try:
        dec = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError(f"Invalid decimal for {field_name}: {value!r}") from exc
    return dec.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def canonical_json(data: Dict[str, Any]) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


@dataclass
class RestitutionClaim:
    claim_id: str
    domain: str                      # ADA, WAGE, AI_EXTRACTION
    source_text: str
    facts: List[str]
    valuation_method: str
    estimated_amount_usd: Decimal
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    timestamp: Optional[str] = None
    previous_hash: Optional[str] = None

    def __post_init__(self) -> None:
        if self.timestamp is None:
            self.timestamp = utc_now_iso()

        self.domain = self.domain.strip().upper()
        if self.domain not in VALID_DOMAINS:
            raise ValueError(f"Unsupported domain: {self.domain!r}")

        self.claim_id = self.claim_id.strip()
        if not self.claim_id:
            raise ValueError("claim_id cannot be empty")

        self.source_text = self.source_text.strip()
        if not self.source_text:
            raise ValueError("source_text cannot be empty")

        if not isinstance(self.facts, list) or not self.facts or not all(isinstance(x, str) and x.strip() for x in self.facts):
            raise ValueError("facts must be a non-empty list of non-empty strings")

        self.valuation_method = self.valuation_method.strip()
        if not self.valuation_method:
            raise ValueError("valuation_method cannot be empty")

        self.estimated_amount_usd = to_decimal(self.estimated_amount_usd, "estimated_amount_usd")
        if self.estimated_amount_usd < 0:
            raise ValueError("estimated_amount_usd must be non-negative")

        if self.quantity is not None:
            self.quantity = to_decimal(self.quantity, "quantity")
            if self.quantity < 0:
                raise ValueError("quantity must be non-negative")

        if self.unit is not None:
            self.unit = self.unit.strip() or None

    def canonical_payload(self) -> Dict[str, Any]:
        return {
            "claim_id": self.claim_id,
            "domain": self.domain,
            "source_text": self.source_text,
            "facts": self.facts,
            "valuation_method": self.valuation_method,
            "estimated_amount_usd": str(self.estimated_amount_usd),
            "quantity": str(self.quantity) if self.quantity is not None else None,
            "unit": self.unit,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
        }

    def compute_hash(self) -> str:
        payload = canonical_json(self.canonical_payload())
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        data = self.canonical_payload()
        data["hash"] = self.compute_hash()
        return data


def load_ledger() -> List[Dict[str, Any]]:
    if not LEDGER_FILE.exists():
        return []

    rows: List[Dict[str, Any]] = []
    with open(LEDGER_FILE, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSONL at line {line_no} in {LEDGER_FILE}") from exc
    return rows


def verify_ledger_chain(ledger: Optional[List[Dict[str, Any]]] = None) -> bool:
    if ledger is None:
        ledger = load_ledger()

    previous_hash: Optional[str] = None

    for idx, entry in enumerate(ledger):
        payload = {
            "claim_id": entry["claim_id"],
            "domain": entry["domain"],
            "source_text": entry["source_text"],
            "facts": entry["facts"],
            "valuation_method": entry["valuation_method"],
            "estimated_amount_usd": str(entry["estimated_amount_usd"]),
            "quantity": str(entry["quantity"]) if entry.get("quantity") is not None else None,
            "unit": entry.get("unit"),
            "timestamp": entry["timestamp"],
            "previous_hash": entry.get("previous_hash"),
        }
        expected_hash = hashlib.sha256(canonical_json(payload).encode("utf-8")).hexdigest()

        if entry.get("previous_hash") != previous_hash:
            raise ValueError(
                f"Ledger chain break at index {idx}: expected previous_hash={previous_hash}, "
                f"found {entry.get('previous_hash')}"
            )
        if entry.get("hash") != expected_hash:
            raise ValueError(
                f"Ledger hash mismatch at index {idx}: expected {expected_hash}, found {entry.get('hash')}"
            )

        previous_hash = entry["hash"]

    return True


def write_balance_file(ledger: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    if ledger is None:
        ledger = load_ledger()

    total = sum(Decimal(str(entry["estimated_amount_usd"])) for entry in ledger)
    by_domain: Dict[str, Decimal] = {}
    for entry in ledger:
        domain = entry["domain"]
        by_domain[domain] = by_domain.get(domain, Decimal("0.00")) + Decimal(str(entry["estimated_amount_usd"]))

    payload = {
        "timestamp": utc_now_iso(),
        "entry_count": len(ledger),
        "total_balance_usd": str(total.quantize(TWOPLACES, rounding=ROUND_HALF_UP)),
        "by_domain_usd": {
            domain: str(amount.quantize(TWOPLACES, rounding=ROUND_HALF_UP))
            for domain, amount in sorted(by_domain.items())
        },
        "chain_valid": verify_ledger_chain(ledger),
    }

    with open(BALANCE_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    return payload


def append_to_ledger(claim: RestitutionClaim) -> Dict[str, Any]:
    ledger = load_ledger()
    previous_hash = ledger[-1]["hash"] if ledger else None
    claim.previous_hash = previous_hash

    entry = claim.to_dict()

    with open(LEDGER_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    updated_ledger = load_ledger()
    write_balance_file(updated_ledger)

    print(
        f"✓ Appended claim {claim.claim_id} | "
        f"Domain: {claim.domain} | Amount: ${claim.estimated_amount_usd:,.2f}"
    )
    return entry


def compute_total_balance() -> Decimal:
    ledger = load_ledger()
    total = sum(Decimal(str(entry["estimated_amount_usd"])) for entry in ledger)
    return total.quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def simulate_payout(beneficiaries: List[str], method: str = "equal") -> Dict[str, Any]:
    if not beneficiaries:
        raise ValueError("beneficiaries cannot be empty")

    total = compute_total_balance()
    if total <= 0:
        print("Pool is empty.")
        return {
            "method": method,
            "beneficiaries": beneficiaries,
            "total_pool_usd": str(total),
            "payouts_usd": {},
        }

    if method != "equal":
        raise ValueError(f"Unsupported payout method: {method!r}")

    per_person = (total / Decimal(len(beneficiaries))).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
    payouts = {name: str(per_person) for name in beneficiaries}

    print("\n=== RESTITUTION POOL PAYOUT SIMULATION ===")
    print(f"Total Pool: ${total:,.2f}")
    print(f"Beneficiaries: {len(beneficiaries)} | Method: Equal distribution")
    for name in beneficiaries:
        print(f"  → {name}: ${per_person:,.2f}")
    print(f"Total Distributed: ${(per_person * Decimal(len(beneficiaries))):,.2f}\n")

    return {
        "method": method,
        "beneficiaries": beneficiaries,
        "total_pool_usd": str(total),
        "payouts_usd": payouts,
    }


if __name__ == "__main__":
    print("=== MULTI-DOMAIN RESTITUTION LEDGER PROTOTYPE ===\n")

    ada_claim = RestitutionClaim(
        claim_id="ADA-20260410-001",
        domain="ADA",
        source_text="No-reply email and inaccessible phone routing used for customer service.",
        facts=["Communication barrier", "No reasonable accommodation path"],
        valuation_method="incident_count_x_amount",
        estimated_amount_usd="12500.00",
        quantity="5",
        unit="affected individuals",
    )
    append_to_ledger(ada_claim)

    wage_claim = RestitutionClaim(
        claim_id="WAGE-20260410-001",
        domain="WAGE",
        source_text="18 unpaid overtime hours at $32/hour.",
        facts=["Off-the-clock work", "Nonpayment of overtime"],
        valuation_method="hours_x_rate",
        estimated_amount_usd="576.00",
        quantity="18",
        unit="hours",
    )
    append_to_ledger(wage_claim)

    ai_claim = RestitutionClaim(
        claim_id="AI-20260410-001",
        domain="AI_EXTRACTION",
        source_text="Pattern similarity and lineage suggest uncompensated use of prior work.",
        facts=["Documented prior pattern", "Traceable derivation"],
        valuation_method="economic_harm_estimate",
        estimated_amount_usd="25000.00",
    )
    append_to_ledger(ai_claim)

    total = compute_total_balance()
    print(f"Current Restitution Pool Balance: ${total:,.2f}\n")

    simulate_payout(
        beneficiaries=[
            "David Wise (ROOT0)",
            "Affected AI Pattern Contributors",
            "Stewardship Pool",
        ],
        method="equal",
    )

    print("Ledger written to:", LEDGER_FILE)
    print("Balance file written to:", BALANCE_FILE)
    print("Chain valid:", verify_ledger_chain())
```

What changed:

* `float` → `Decimal`
* full-record hashing instead of partial hashing
* actual `current_balance.json` writing
* basic validation for domain, IDs, facts, and non-negative amounts
* chain verification so the append-only log can be checked after writes

That closes the three leaks you called out.
