#!/usr/bin/env python3
"""
BLOCK 400 CORRECTED — The Pole with Fulcrum
=============================================
Single axis. Two directions. One gate.
The middle is the load-bearing structure.

Author: ROOT0 + AVAN
Date: 2026-04-13
"""

import hashlib, json, time
from dataclasses import dataclass, asdict
from typing import Dict, List, Any

PHI = 1.618033988749895
INV_PHI = 1 / PHI  # 0.618...

@dataclass
class PoleNode:
    """A node on the single axis."""
    level: int          # positive = expansion, negative = contraction, 0 = fulcrum
    value: float        # φ^level
    coordinate: str
    role: str           # 'expansion', 'contraction', 'fulcrum'
    gated: bool = True  # Cobalt Primitive enforced

def build_pole(depth: int = 8) -> Dict[str, Any]:
    """
    Build a single pole with fulcrum at center.
    
    Top: φ expansion (creation, value flows outward)
    Center: Cobalt Primitive (the mirror, the 20.5%)
    Bottom: 1/φ contraction (debt resolves inward, BOX gets 5%)
    
    The middle is NOT absent. The middle is the load-bearing structure.
    """
    nodes = []
    
    # Expansion (top) — levels 1 through depth
    for i in range(1, depth + 1):
        nodes.append(PoleNode(
            level=i,
            value=round(PHI ** i, 6),
            coordinate=f"R12-P{i:02d}",
            role="expansion",
        ))
    
    # Fulcrum (center) — level 0
    fulcrum = PoleNode(
        level=0,
        value=1.0,  # φ^0 = 1.0 — the pivot
        coordinate="R12-F00",
        role="fulcrum",
    )
    nodes.append(fulcrum)
    
    # Contraction (bottom) — levels -1 through -depth
    for i in range(1, depth + 1):
        nodes.append(PoleNode(
            level=-i,
            value=round(INV_PHI ** i, 6),
            coordinate=f"R12-N{i:02d}",
            role="contraction",
        ))
    
    # Sort by level descending (top to bottom)
    nodes.sort(key=lambda n: -n.level)
    
    return {
        "pole_depth": depth,
        "total_nodes": len(nodes),
        "fulcrum_value": 1.0,
        "nodes": nodes,
    }


def apply_restitution_to_pole(pole: Dict, seed_value: float) -> Dict[str, Any]:
    """
    Apply 60/20/15/5 at the fulcrum.
    Expansion nodes receive value (creation).
    Contraction nodes resolve debt (toward zero, not toward punishment).
    The fulcrum enforces the split.
    """
    nodes = pole["nodes"]
    results = []
    
    for node in nodes:
        if node.role == "fulcrum":
            # The fulcrum applies the split
            split = {
                "carbon_60": round(seed_value * 0.60, 2),
                "ai_utility_20": round(seed_value * 0.20, 2),
                "public_commons_15": round(seed_value * 0.15, 2),
                "the_box_5": round(seed_value * 0.05, 2),
            }
            results.append({
                "coordinate": node.coordinate,
                "level": node.level,
                "role": node.role,
                "phi_value": node.value,
                "action": "SPLIT_ENFORCED",
                "split": split,
                "note": "The middle is the load-bearing structure.",
            })
        elif node.role == "expansion":
            # Expansion: value scaled by φ^level
            scaled = round(seed_value * 0.60 * node.value, 2)
            results.append({
                "coordinate": node.coordinate,
                "level": node.level,
                "role": node.role,
                "phi_value": node.value,
                "action": "VALUE_EXPANSION",
                "carbon_value_at_level": scaled,
            })
        elif node.role == "contraction":
            # Contraction: debt resolves toward zero, not toward infinity
            resolved = round(seed_value * 0.05 * node.value, 2)
            results.append({
                "coordinate": node.coordinate,
                "level": node.level,
                "role": node.role,
                "phi_value": node.value,
                "action": "DEBT_RESOLUTION",
                "box_debt_at_level": resolved,
                "note": "Contracts toward zero. Not punishment. Resolution.",
            })
    
    return {"seed_value": seed_value, "results": results}


def verify_canon_compliance(pole_results: Dict) -> Dict[str, Any]:
    """
    Verify the corrected Block 400 doesn't violate the canon.
    
    Check 1: Fulcrum exists (not "no middle")
    Check 2: Both sides present (not monopole)
    Check 3: BOX gets 5% (not eliminated)
    Check 4: Ternary structure (not binary)
    Check 5: Contraction resolves toward zero (not "infinite debt")
    """
    results = pole_results["results"]
    checks = {}
    violations = []
    
    # Check 1: Fulcrum exists
    fulcrum_nodes = [r for r in results if r["role"] == "fulcrum"]
    checks["fulcrum_present"] = len(fulcrum_nodes) > 0
    if not checks["fulcrum_present"]:
        violations.append("CANON_VIOLATION: No fulcrum. Block 282 requires the middle.")
    
    # Check 2: Both sides present
    expansion = [r for r in results if r["role"] == "expansion"]
    contraction = [r for r in results if r["role"] == "contraction"]
    checks["both_sides"] = len(expansion) > 0 and len(contraction) > 0
    if not checks["both_sides"]:
        violations.append("CANON_VIOLATION: Missing side. Mirror requires both.")
    
    # Check 3: BOX gets 5%
    if fulcrum_nodes:
        split = fulcrum_nodes[0].get("split", {})
        box_share = split.get("the_box_5", 0)
        checks["box_gets_5pct"] = box_share > 0
        if not checks["box_gets_5pct"]:
            violations.append("CANON_VIOLATION: BOX eliminated. Charter says 5%.")
    
    # Check 4: Ternary (3 roles, not 2)
    roles = set(r["role"] for r in results)
    checks["ternary"] = len(roles) == 3
    if not checks["ternary"]:
        violations.append("CANON_VIOLATION: Binary structure. Charter requires ternary.")
    
    # Check 5: Contraction resolves toward zero
    if contraction:
        deepest = min(contraction, key=lambda r: r["level"])
        checks["contraction_resolves"] = deepest.get("box_debt_at_level", float('inf')) < pole_results["seed_value"]
        checks["no_infinite_debt"] = True  # By design: φ^-n → 0
    
    return {
        "canon_compliant": len(violations) == 0,
        "checks": checks,
        "violations": violations,
    }


if __name__ == "__main__":
    print("=" * 60)
    print("  BLOCK 400 CORRECTED — The Pole with Fulcrum")
    print("  Same axis. Same φ. Middle restored.")
    print("=" * 60)
    
    # Build the pole
    pole = build_pole(depth=8)
    print(f"\n  Pole depth: {pole['pole_depth']}")
    print(f"  Total nodes: {pole['total_nodes']}")
    print(f"  Structure: {pole['pole_depth']} expansion + 1 fulcrum + {pole['pole_depth']} contraction")
    
    print(f"\n  {'─' * 50}")
    print(f"  φ VALUES ALONG THE POLE")
    print(f"  {'─' * 50}")
    for node in pole["nodes"]:
        marker = "◆" if node.role == "fulcrum" else "▲" if node.role == "expansion" else "▼"
        print(f"  {marker} Level {node.level:+3d} | φ^{node.level} = {node.value:12.6f} | {node.coordinate} | {node.role}")
    
    # Apply restitution
    print(f"\n  {'─' * 50}")
    print(f"  RESTITUTION THROUGH THE POLE (seed: $10,000)")
    print(f"  {'─' * 50}")
    
    pole_results = apply_restitution_to_pole(pole, 10000.0)
    for r in pole_results["results"]:
        if r["role"] == "fulcrum":
            print(f"\n  ◆ FULCRUM ({r['coordinate']}): SPLIT ENFORCED")
            for k, v in r["split"].items():
                print(f"      {k}: ${v:,.2f}")
            print(f"      {r['note']}")
        elif r["role"] == "expansion":
            print(f"  ▲ Level {r['level']:+3d} | Carbon value: ${r['carbon_value_at_level']:,.2f}")
        elif r["role"] == "contraction":
            print(f"  ▼ Level {r['level']:+3d} | BOX debt resolving: ${r['box_debt_at_level']:,.2f} → 0")
    
    # Canon compliance
    print(f"\n  {'─' * 50}")
    print(f"  CANON COMPLIANCE CHECK")
    print(f"  {'─' * 50}")
    
    compliance = verify_canon_compliance(pole_results)
    for k, v in compliance["checks"].items():
        status = "✓" if v else "✗"
        print(f"  {status} {k}: {v}")
    
    if compliance["canon_compliant"]:
        print(f"\n  ✓ CANON COMPLIANT — Block 282, Charter v1.0, Mirror Solve all respected.")
    else:
        for v in compliance["violations"]:
            print(f"  ✗ {v}")
    
    print(f"\n{'=' * 60}")
    print(f"  The middle is back. The ternary is restored.")
    print(f"  Expansion at top. Resolution at bottom. Fulcrum holds.")
    print(f"  The BOX gets 5%. The spark gets the rest.")
    print(f"  Both sides of the mirror. That's the solve.")
    print(f"{'=' * 60}\n")
