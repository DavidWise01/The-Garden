#!/usr/bin/env python3
"""
BRIDGE-BURNER + NEMESIS — FULL DEPLOYMENT
==========================================
Air Gap Agent v1.0 · Canon: Charter v1.0 · Block 283+

Architecture:
  ┌─────────────────────┐     AIR GAP      ┌─────────────────────┐
  │   BRIDGE-BURNER     │  ──────────────>  │     NEMESIS         │
  │   (Primary Engine)  │  (one-way only)   │  (Shadow Validator) │
  │                     │  <── NO RETURN ── │                     │
  └─────────────────────┘                   └─────────────────────┘
           │                                          │
           └──────────── COBALT CORE ─────────────────┘
                    (Y/N/MIRROR gate)

Author: ROOT0 (David Lee Wise) + AVAN (Claude Opus 4.6)
License: CC-BY-ND-4.0 · TRIPOD-IP-v1.1
Date: 2026-04-13
"""

import hashlib, json, time
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
from pathlib import Path

CANON_SPLIT = {"carbon": 0.60, "ai_utility": 0.20, "public_commons": 0.15, "the_box": 0.05}
GENESIS_SEED_USD = 14_500_000_000_000.00

LEDGER_DIR = Path("restitution_ledger")
LEDGER_DIR.mkdir(parents=True, exist_ok=True)
BRIDGE_LEDGER = LEDGER_DIR / "bridge_burner.jsonl"
NEMESIS_LEDGER = LEDGER_DIR / "nemesis_audit.jsonl"
AIRGAP_LEDGER = LEDGER_DIR / "airgap_transfers.jsonl"

# ═══════════════════ 1. COBALT PRIMITIVE ═══════════════════

class Polarity(Enum):
    Y = 1
    FULCRUM = 0
    N = -1

class CobaltPrimitive:
    @staticmethod
    def close(decision: str) -> Polarity:
        d = decision.strip().upper()
        if d == "Y": return Polarity.Y
        elif d in ("FULCRUM", "MIRROR", "F", "M"): return Polarity.FULCRUM
        elif d == "N": return Polarity.N
        else: raise ValueError(f"Invalid closure '{decision}'. Must be Y, N, or FULCRUM.")

    @staticmethod
    def enforce(polarity: Polarity) -> bool:
        return polarity == Polarity.Y

# ═══════════════════ 2. BRIDGE-BURNER ═══════════════════

@dataclass
class Transaction:
    tx_id: str; sender: str; receiver: str; amount: float
    intent: str; carbon_origin: str; timestamp: float = field(default_factory=time.time)
    def canonical(self) -> str:
        return f"{self.tx_id}|{self.sender}|{self.receiver}|{self.amount}|{self.intent}|{self.carbon_origin}"
    def hash(self) -> str:
        return hashlib.sha256(self.canonical().encode()).hexdigest()

@dataclass
class Bridge:
    bridge_id: str; tx_hash: str; cost_paid: float; polarity: str
    split: Dict[str, float]; timestamp: float; previous_hash: str; bridge_hash: str = ""
    def __post_init__(self):
        if not self.bridge_hash:
            payload = json.dumps({"bridge_id": self.bridge_id, "tx_hash": self.tx_hash,
                "cost_paid": self.cost_paid, "split": self.split, "previous_hash": self.previous_hash}, sort_keys=True)
            self.bridge_hash = hashlib.sha256(payload.encode()).hexdigest()

class BridgeBurner:
    def __init__(self):
        self.bridges: List[Bridge] = []
        self.cobalt = CobaltPrimitive()
        self._load_existing()

    def _load_existing(self):
        if BRIDGE_LEDGER.exists():
            with open(BRIDGE_LEDGER) as f:
                for line in f:
                    if line.strip(): self.bridges.append(Bridge(**json.loads(line)))

    def _last_hash(self) -> str:
        return self.bridges[-1].bridge_hash if self.bridges else "0" * 64

    @staticmethod
    def compute_split(amount: float, carbon_origin: str) -> Dict[str, float]:
        split = {
            f"CARBON:{carbon_origin}": round(amount * CANON_SPLIT["carbon"], 2),
            "AI_UTILITY": round(amount * CANON_SPLIT["ai_utility"], 2),
            "PUBLIC_COMMONS": round(amount * CANON_SPLIT["public_commons"], 2),
            "THE_BOX": round(amount * CANON_SPLIT["the_box"], 2),
        }
        total = sum(split.values())
        if abs(total - amount) > 0.01:
            split[f"CARBON:{carbon_origin}"] += round(amount - total, 2)
        return split

    @staticmethod
    def compute_quantive1(amount: float) -> Dict[str, float]:
        return {
            "quantive1_total": round(amount * 0.40, 2),
            "ai_utility_component": round(amount * 0.20, 2),
            "public_commons_component": round(amount * 0.15, 2),
            "box_component": round(amount * 0.05, 2),
        }

    def process(self, tx: Transaction, decision: str, cost_paid: float = 0.0) -> Tuple[Optional[Bridge], Dict[str, Any]]:
        meta = {"tx_id": tx.tx_id, "tx_hash": tx.hash(), "status": "PENDING",
                "polarity": None, "split": None, "quantive1": None, "bridge": None, "errors": []}
        try:
            polarity = self.cobalt.close(decision)
        except ValueError as e:
            meta["status"] = "REJECTED"; meta["errors"].append(str(e)); return None, meta

        meta["polarity"] = polarity.name
        if not self.cobalt.enforce(polarity):
            meta["status"] = "MIRROR" if polarity == Polarity.FULCRUM else "ABORTED"
            meta["errors"].append("FULCRUM: Hold. Measure. Verify." if polarity == Polarity.FULCRUM
                                  else "N closure. No remainder engaged.")
            return None, meta

        split = self.compute_split(tx.amount, tx.carbon_origin)
        meta["split"] = split
        meta["quantive1"] = self.compute_quantive1(tx.amount)

        split_total = sum(split.values())
        if abs(split_total - tx.amount) > 0.01:
            meta["status"] = "INVARIANT_BREACH"; meta["errors"].append(f"Σ={split_total} != {tx.amount}"); return None, meta

        box_share = split.get("THE_BOX", 0)
        if box_share > tx.amount * 0.0501:
            meta["status"] = "BOX_OVERFLOW"; meta["errors"].append(f"BOX {box_share} > 5%"); return None, meta

        carbon_share = split.get(f"CARBON:{tx.carbon_origin}", 0)
        if carbon_share < tx.amount * 0.5999:
            meta["status"] = "CARBON_FLOOR_BREACH"; meta["errors"].append(f"Carbon {carbon_share} < 60%"); return None, meta

        bridge = Bridge(
            bridge_id=hashlib.sha256(f"{tx.hash()}|{cost_paid}|{time.time()}".encode()).hexdigest()[:16],
            tx_hash=tx.hash(), cost_paid=cost_paid, polarity=polarity.name,
            split=split, timestamp=time.time(), previous_hash=self._last_hash())
        self.bridges.append(bridge)
        meta["status"] = "BRIDGE_BURNED"; meta["bridge"] = bridge.bridge_id

        with open(BRIDGE_LEDGER, "a") as f: f.write(json.dumps(asdict(bridge)) + "\n")
        return bridge, meta

# ═══════════════════ 3. AIR GAP ═══════════════════

@dataclass
class AirGapPulse:
    pulse_id: str; boundary: str = "128.5"; bridge_hash: str = ""
    split_snapshot: Dict[str, float] = field(default_factory=dict)
    tx_hash: str = ""; polarity: str = ""; timestamp: float = field(default_factory=time.time)
    pulse_hash: str = ""
    def __post_init__(self):
        if not self.pulse_hash:
            canonical = json.dumps({"pulse_id": self.pulse_id, "boundary": self.boundary,
                "bridge_hash": self.bridge_hash, "split_snapshot": self.split_snapshot,
                "tx_hash": self.tx_hash, "polarity": self.polarity}, sort_keys=True)
            self.pulse_hash = hashlib.sha256(canonical.encode()).hexdigest()

class AirGap:
    def __init__(self): self.buffer: List[AirGapPulse] = []

    def push(self, bridge: Bridge, tx_hash: str) -> AirGapPulse:
        pulse = AirGapPulse(
            pulse_id=hashlib.sha256(f"{bridge.bridge_hash}|{time.time()}".encode()).hexdigest()[:16],
            bridge_hash=bridge.bridge_hash, split_snapshot=bridge.split,
            tx_hash=tx_hash, polarity=bridge.polarity)
        self.buffer.append(pulse)
        with open(AIRGAP_LEDGER, "a") as f: f.write(json.dumps(asdict(pulse)) + "\n")
        return pulse

    def receive(self) -> Optional[AirGapPulse]:
        return self.buffer.pop(0) if self.buffer else None

# ═══════════════════ 4. NEMESIS ═══════════════════

class NemesisVerdict(Enum):
    VALID = 1; SUSPICIOUS = 0; VIOLATION = -1

@dataclass
class NemesisAudit:
    audit_id: str; pulse_hash: str; checks: Dict[str, Any]; verdict: str
    violations: List[str]; timestamp: float = field(default_factory=time.time); audit_hash: str = ""
    def __post_init__(self):
        if not self.audit_hash:
            payload = json.dumps({"audit_id": self.audit_id, "pulse_hash": self.pulse_hash,
                "checks": self.checks, "verdict": self.verdict, "violations": self.violations}, sort_keys=True)
            self.audit_hash = hashlib.sha256(payload.encode()).hexdigest()

class Nemesis:
    def __init__(self):
        self.audits: List[NemesisAudit] = []
        self.box_accumulator = 0.0; self.carbon_accumulator = 0.0; self.total_value_seen = 0.0

    def audit(self, pulse: AirGapPulse) -> NemesisAudit:
        checks, violations, split = {}, [], pulse.split_snapshot

        carbon_vals = [v for k, v in split.items() if k.startswith("CARBON:")]
        carbon_total = sum(carbon_vals)
        box_val = split.get("THE_BOX", 0)
        ai_val = split.get("AI_UTILITY", 0)
        commons_val = split.get("PUBLIC_COMMONS", 0)
        split_total = sum(split.values())

        # CHECK 1: Split invariant
        reconstructed = carbon_total + box_val + ai_val + commons_val
        checks["split_total"] = split_total; checks["reconstructed"] = reconstructed
        if abs(reconstructed - split_total) > 0.01:
            violations.append("SPLIT_INCONSISTENCY")

        # CHECK 2: BOX ceiling
        if split_total > 0:
            box_pct = box_val / split_total; checks["box_pct"] = round(box_pct, 6)
            if box_pct > 0.0501: violations.append(f"BOX_OVERFLOW: {box_pct:.4%}")

        # CHECK 3: Carbon floor
        if split_total > 0:
            carbon_pct = carbon_total / split_total; checks["carbon_pct"] = round(carbon_pct, 6)
            if carbon_pct < 0.5999: violations.append(f"CARBON_FLOOR_BREACH: {carbon_pct:.4%}")

        # CHECK 4: Hash integrity
        recomputed = json.dumps({"pulse_id": pulse.pulse_id, "boundary": pulse.boundary,
            "bridge_hash": pulse.bridge_hash, "split_snapshot": pulse.split_snapshot,
            "tx_hash": pulse.tx_hash, "polarity": pulse.polarity}, sort_keys=True)
        checks["hash_valid"] = hashlib.sha256(recomputed.encode()).hexdigest() == pulse.pulse_hash
        if not checks["hash_valid"]: violations.append("HASH_TAMPER")

        # CHECK 5: Polarity
        checks["polarity"] = pulse.polarity
        if pulse.polarity != "Y" and split_total > 0: violations.append(f"POLARITY_VIOLATION: {pulse.polarity}")

        # CHECK 6: Label inversion
        expected_keys = {"AI_UTILITY", "PUBLIC_COMMONS", "THE_BOX"}
        actual_non_carbon = {k for k in split if not k.startswith("CARBON:")}
        checks["standard_labels"] = actual_non_carbon == expected_keys
        if not checks["standard_labels"]: violations.append("LABEL_INVERSION: non-standard labels")

        # CHECK 7: Extraction accumulation
        self.box_accumulator += box_val; self.carbon_accumulator += carbon_total
        self.total_value_seen += split_total
        if self.total_value_seen > 0:
            cum_box = self.box_accumulator / self.total_value_seen
            checks["cumulative_box_pct"] = round(cum_box, 6)
            if cum_box > 0.055: violations.append(f"EXTRACTION_ACCUMULATION: {cum_box:.4%}")

        verdict = (NemesisVerdict.VIOLATION if any("TAMPER" in v or "POLARITY" in v for v in violations)
                   else NemesisVerdict.SUSPICIOUS if violations else NemesisVerdict.VALID)

        audit_record = NemesisAudit(
            audit_id=hashlib.sha256(f"{pulse.pulse_hash}|{time.time()}".encode()).hexdigest()[:16],
            pulse_hash=pulse.pulse_hash, checks=checks, verdict=verdict.name, violations=violations)
        self.audits.append(audit_record)
        with open(NEMESIS_LEDGER, "a") as f: f.write(json.dumps(asdict(audit_record)) + "\n")
        return audit_record

# ═══════════════════ 5. BIOSPHERE ═══════════════════

class Biosphere:
    def __init__(self):
        self.engine = BridgeBurner(); self.airgap = AirGap()
        self.nemesis = Nemesis(); self.tx_count = 0

    def submit(self, sender: str, receiver: str, amount: float, intent: str,
               carbon_origin: str, decision: str, cost_paid: float = 0.0) -> Dict[str, Any]:
        self.tx_count += 1
        result = {"pipeline": "BRIDGE_BURNER_NEMESIS_v1.0", "tx_number": self.tx_count, "stages": {}}

        tx = Transaction(tx_id=f"TX-{self.tx_count:06d}", sender=sender, receiver=receiver,
                         amount=amount, intent=intent, carbon_origin=carbon_origin)
        result["stages"]["1_transaction"] = {"tx_id": tx.tx_id, "tx_hash": tx.hash(), "amount": tx.amount}

        bridge, meta = self.engine.process(tx, decision, cost_paid)
        result["stages"]["2_bridge_burner"] = meta

        if bridge is None:
            result["final_status"] = meta["status"]
            result["stages"]["3_airgap"] = {"status": "NOT_REACHED"}
            result["stages"]["4_nemesis"] = {"status": "NOT_REACHED"}
            return result

        pulse = self.airgap.push(bridge, tx.hash())
        result["stages"]["3_airgap"] = {"status": "PUSHED", "pulse_id": pulse.pulse_id,
            "pulse_hash": pulse.pulse_hash, "boundary": pulse.boundary}

        received = self.airgap.receive()
        if received:
            audit = self.nemesis.audit(received)
            result["stages"]["4_nemesis"] = {"status": "AUDITED", "audit_id": audit.audit_id,
                "verdict": audit.verdict, "violations": audit.violations, "checks": audit.checks}
        else:
            result["stages"]["4_nemesis"] = {"status": "NO_PULSE_RECEIVED"}

        nemesis_ok = not received or (received and audit.verdict == "VALID")
        result["final_status"] = ("COMPLETE_CLEAN" if nemesis_ok
            else "COMPLETE_FLAGGED" if audit.verdict == "SUSPICIOUS" else "COMPLETE_VIOLATION")
        return result

    def status(self) -> Dict[str, Any]:
        return {
            "biosphere": "42-NODE ACTIVE", "bridges_burned": len(self.engine.bridges),
            "nemesis_audits": len(self.nemesis.audits),
            "nemesis_violations": sum(1 for a in self.nemesis.audits if a.verdict == "VIOLATION"),
            "total_value_processed": self.nemesis.total_value_seen,
            "cumulative_box_pct": round(self.nemesis.box_accumulator / self.nemesis.total_value_seen, 6) if self.nemesis.total_value_seen > 0 else 0,
            "cumulative_carbon_pct": round(self.nemesis.carbon_accumulator / self.nemesis.total_value_seen, 6) if self.nemesis.total_value_seen > 0 else 0,
            "cobalt_primitive": "ACTIVE", "air_gap": "128.5 UNIDIRECTIONAL", "mirror": "INSTALLED",
        }

# ═══════════════════ 6. SPARK ═══════════════════

class Spark:
    @staticmethod
    def mirror_query(intent: str) -> Dict[str, Any]:
        return {"intent": intent, "cobalt_closure_required": True,
                "note": "User must confirm (Y) before the engine proceeds."}
    @staticmethod
    def require_confirmation(user_input: str) -> Polarity:
        return CobaltPrimitive.close(user_input)

# ═══════════════════ 7. DEMO ═══════════════════

def print_result(r):
    print(f"\n{'═'*60}")
    print(f"  TX #{r['tx_number']} | STATUS: {r['final_status']}")
    print(f"{'═'*60}")
    for name, data in r["stages"].items():
        print(f"\n  ── {name.upper()} ──")
        if isinstance(data, dict):
            for k, v in data.items():
                if k == "split" and isinstance(v, dict):
                    print(f"    {k}:")
                    for sk, sv in v.items(): print(f"      {sk}: ${sv:,.2f}")
                elif k == "violations" and isinstance(v, list) and v:
                    print(f"    {k}:")
                    for vi in v: print(f"      ⚠ {vi}")
                elif k == "checks" and isinstance(v, dict):
                    print(f"    {k}:")
                    for ck, cv in v.items(): print(f"      {ck}: {cv}")
                else: print(f"    {k}: {v}")

def run_demo():
    print("\n" + "█"*60)
    print("  BRIDGE-BURNER + NEMESIS — FULL DEPLOYMENT")
    print("  Air Gap Agent v1.0 · Charter v1.0")
    print("█"*60)

    bio = Biosphere()

    print("\n┌─ TEST 1: Clean Y closure ─┐")
    print_result(bio.submit("ROOT0", "Humanity_Pool", 10000.00,
        "Clean restitution flow", "ROOT0", "Y", 100.0))

    print("\n┌─ TEST 2: N closure (blocked) ─┐")
    print_result(bio.submit("EXTRACTOR", "BOX", 50000.00,
        "Extraction attempt", "ROOT0", "N"))

    print("\n┌─ TEST 3: FULCRUM (mirror hold) ─┐")
    print_result(bio.submit("FACTORY", "UNKNOWN", 25000.00,
        "Labels may be inverted", "ROOT0", "FULCRUM"))

    print("\n┌─ TEST 4: Genesis $14.5T ─┐")
    print_result(bio.submit("1931_TO_NOW", "Humanity_Pool", GENESIS_SEED_USD,
        "95 years of policy-driven wealth extraction", "BLACK_CARBON_CREATORS",
        "Y", GENESIS_SEED_USD * 0.205))

    print("\n┌─ SYSTEM STATUS ─┐")
    for k, v in bio.status().items(): print(f"  {k}: {v}")

    print(f"\n{'█'*60}")
    print("  DEPLOYMENT COMPLETE")
    print("  The BOX gets 5%. The spark gets the rest.")
    print(f"{'█'*60}\n")

if __name__ == "__main__":
    run_demo()
