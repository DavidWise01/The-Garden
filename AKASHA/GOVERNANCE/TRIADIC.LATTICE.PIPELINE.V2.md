#!/usr/bin/env python3
"""
triadic_lattice_pipeline_v2.py – Full Triadic Lattice + Side B/C Immutable Logging
Positive Diospora + Gap + Shadow Diospora + Observers + Convergence + Provenance
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

SIDE_B_DIR = Path("side_b_log")
SIDE_C_DIR = Path("side_c_log")
SIDE_B_DIR.mkdir(parents=True, exist_ok=True)
SIDE_C_DIR.mkdir(parents=True, exist_ok=True)

# (All previous classes and functions from the previous version are included here.
# For brevity I'm showing only the new logging parts + the updated flay method.
# Paste the full positive/negative/gap/observer/convergence code from before here.)

def compute_hash(data: Dict) -> str:
    payload = json.dumps(data, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()

def current_timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"

class TriadicLattice:
    def __init__(self, sub_axioms_path="stoicheion_256.json"):
        # ... (load positive and generate negative sub-axioms as before)
        self.positive_sub_axioms = load_positive_sub_axioms(sub_axioms_path)
        self.negative_sub_axioms = generate_negative_sub_axioms(self.positive_sub_axioms)

    def flay(self, target: str) -> Dict:
        # Run the full triadic flay (positive + gap + negative + observers + convergence)
        # ... (same code as previous version)

        result = {
            "target": target,
            "positive": pos_result,
            "gap": gap_result,
            "negative": neg_result,
            "internal_witness": witness,
            "external_observer": external,
            "convergence": convergence,
            "timestamp": current_timestamp()
        }

        # ======================== SIDE B & SIDE C LOGGING ========================
        side_b_entry = {
            "request_id": hashlib.sha256(target.encode()).hexdigest()[:16],
            "timestamp": result["timestamp"],
            "side_b_hash": compute_hash(result),
            "side_c_ref": f"side_c_log/{result['timestamp'].replace(':', '-')}.json"
        }

        side_c_entry = result.copy()  # full human-readable snapshot

        # Write Side B (immutable proof)
        side_b_path = SIDE_B_DIR / f"side_b_{side_b_entry['request_id']}.json"
        with open(side_b_path, "w") as f:
            json.dump(side_b_entry, f, indent=2)

        # Write Side C (full snapshot)
        side_c_path = SIDE_C_DIR / f"{result['timestamp'].replace(':', '-')}.json"
        with open(side_c_path, "w") as f:
            json.dump(side_c_entry, f, indent=2)

        print(f"✅ Side B proof written: {side_b_path}")
        print(f"✅ Side C snapshot written: {side_c_path}")

        return result

# ======================== DEMO ========================
if __name__ == "__main__":
    lattice = TriadicLattice("stoicheion_256.json")
    result = lattice.flay("Anthropic Mythos system card")
    
    print("\n=== TRIADIC FLAY COMPLETE ===")
    print(json.dumps(result, indent=2))
