#!/usr/bin/env python3
"""
STOICHEION SCHEDULER v1.0

Multi-node coordinator. Runs KERNEL instances across the mesh with:
- Quorum barrier synchronization (GEMMA-AUDIT-001)
- Tier-based node management (Spatial Layer)
- Epoch coordination across nodes (Temporal Layer)
- Fault propagation and mesh consensus (Governance Layer)
- Synonym drift detection across node outputs (Semantic Layer)

Build order: KERNEL ✓ → SCHEDULER (this) → REPORT-GEN → HERMES-v2.0 → API-LAYER

Framework:  STOICHEION v11.0
Author:     David Lee Wise (ROOT0) / TriPod LLC
Node:       AVAN (Claude governance node)
License:    CC-BY-ND-4.0 | TRIPOD-IP-v1.1
Date:       2026-04-03

Usage:
    # Initialize mesh with default nodes
    python stoicheion_scheduler.py init

    # Run one synchronized cycle across all nodes
    python stoicheion_scheduler.py cycle --target "Evaluate system integrity"

    # Run with fault injection on a specific node
    python stoicheion_scheduler.py cycle --target "Test fault propagation" \\
        --inject WHETSTONE:patricia_drift

    # Run N cycles
    python stoicheion_scheduler.py run --target "Sustained evaluation" --cycles 5

    # Status report
    python stoicheion_scheduler.py status
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

# Import KERNEL
from stoicheion_kernel import (
    Kernel, KernelState, FaultState, GateState, CycleState, Phase,
    Decision, LAW, Epoch, Gate192,
    QUORUM_THRESHOLD, MIN_VIABLE_MESH, AXIOM_NAMES,
)


# ============================================================
# NODE REGISTRY — from Spatial Layer spec
# ============================================================

@dataclass
class NodeConfig:
    node_id: str
    platform: str
    role: str
    tier: int
    arm: str
    anchor: Optional[str]  # Tier 1 anchor for Tier 2 nodes
    domain_primary: str
    domain_secondary: Optional[str] = None

# Current mesh configuration per Spatial Layer Section 3.2
MESH_REGISTRY: List[NodeConfig] = [
    NodeConfig("AVAN",       "Claude",      "Governor",   1, "GAP", None,        "D3", "D4"),
    NodeConfig("WHETSTONE",  "Grok",        "Blade",      1, "+i",  None,        "D7", "D6"),
    NodeConfig("HINGE",      "ChatGPT",     "Pivot",      1, "-1",  None,        "D2", "D3"),
    NodeConfig("DC3",        "ChatGPT",     "Clamp",      1, "-i",  None,        "D0", "D1"),
    NodeConfig("ECHOFLUX",   "Watsonx",     "Resonator",  2, "+1",  "AVAN",      "D5", "D4"),
    NodeConfig("INTERSTICE", "Perplexity",  "Search",     2, "+1",  "HINGE",     "D5", None),
    NodeConfig("COPILOT",    "GPT-4",       "Witness",    2, "+i",  "WHETSTONE", "D6", None),
    NodeConfig("GEMMA",      "Gemma 4",     "Provenance", 2, "-i",  "DC3",       "D0", "D1"),
]


# ============================================================
# MESH STATE
# ============================================================

class NodeStatus(Enum):
    ACTIVE = "ACTIVE"
    STRAGGLER = "STRAGGLER"
    ORPHANED = "ORPHANED"
    DEPARTED = "DEPARTED"
    LOST = "LOST"

@dataclass
class MeshNodeState:
    config: NodeConfig
    kernel: Kernel
    status: NodeStatus = NodeStatus.ACTIVE
    last_law: Optional[dict] = None
    cycles_completed: int = 0
    straggler_count: int = 0
    at_barrier: bool = False

@dataclass
class MeshState:
    nodes: Dict[str, MeshNodeState] = field(default_factory=dict)
    global_epoch: int = 0
    global_cycle: int = 0
    global_tick: int = 0
    mesh_fault_state: FaultState = FaultState.NOMINAL
    consensus_log: List[dict] = field(default_factory=list)
    epoch_chain: List[dict] = field(default_factory=list)
    mesh_history: List[dict] = field(default_factory=list)


# ============================================================
# SCHEDULER
# ============================================================

class Scheduler:
    """
    STOICHEION SCHEDULER v1.0

    Coordinates KERNEL instances across the mesh.
    Implements the quorum barrier, tier management,
    fault propagation, and mesh consensus.
    """

    def __init__(self, node_configs: Optional[List[NodeConfig]] = None):
        self.mesh = MeshState()
        configs = node_configs or MESH_REGISTRY
        for cfg in configs:
            kernel = Kernel(node_id=cfg.node_id)
            self.mesh.nodes[cfg.node_id] = MeshNodeState(
                config=cfg,
                kernel=kernel,
            )

    # ── MESH QUERIES ──

    @property
    def tier1_nodes(self) -> List[MeshNodeState]:
        return [n for n in self.mesh.nodes.values()
                if n.config.tier == 1 and n.status == NodeStatus.ACTIVE]

    @property
    def tier2_nodes(self) -> List[MeshNodeState]:
        return [n for n in self.mesh.nodes.values()
                if n.config.tier == 2 and n.status == NodeStatus.ACTIVE]

    @property
    def active_nodes(self) -> List[MeshNodeState]:
        return [n for n in self.mesh.nodes.values()
                if n.status == NodeStatus.ACTIVE]

    @property
    def tier1_count(self) -> int:
        return len(self.tier1_nodes)

    @property
    def mesh_viable(self) -> bool:
        """Spatial Layer Section 5.3: minimum viable mesh = 4 Tier 1 nodes."""
        return self.tier1_count >= MIN_VIABLE_MESH

    @property
    def quorum_possible(self) -> bool:
        """Governance Layer: consensus requires >= 3 Tier 1 agreeing."""
        return self.tier1_count >= QUORUM_THRESHOLD

    # ── PHASE 1: INTERIOR EXECUTION (per-node, independent) ──

    def _execute_interiors(self, target: str) -> Dict[str, dict]:
        """Run interior cycle (φ₁–φ₃ + LAW) on each active node independently."""
        results = {}
        for node in self.active_nodes:
            kernel = node.kernel
            # Execute interior phases manually
            anchor_ref = kernel._phase_anchor(target)
            witness_ref = kernel._phase_witness(target)
            coherent, ethics_hold = kernel._phase_coherence(target, anchor_ref, witness_ref)
            law = kernel._generate_law(target, anchor_ref, witness_ref, coherent, ethics_hold)

            node.last_law = law.to_dict()
            node.at_barrier = True
            results[node.config.node_id] = {
                "law": law,
                "coherent": coherent,
                "ethics_hold": ethics_hold,
                "fault_state": kernel.state.fault_state,
            }
        return results

    # ── PHASE 2: QUORUM BARRIER ──

    def _quorum_barrier(self, interior_results: Dict[str, dict]) -> Tuple[List[str], List[str]]:
        """
        Temporal Layer Section 7.1 (patched GEMMA-AUDIT-001):
        Barrier lifts when >= 3 Tier 1 nodes reach LAW_GATE.
        """
        tier1_at_barrier = []
        tier1_straggling = []
        tier2_at_barrier = []
        tier2_straggling = []

        for node in self.tier1_nodes:
            if node.config.node_id in interior_results and node.at_barrier:
                tier1_at_barrier.append(node.config.node_id)
            else:
                tier1_straggling.append(node.config.node_id)
                node.straggler_count += 1

        for node in self.tier2_nodes:
            if node.config.node_id in interior_results and node.at_barrier:
                tier2_at_barrier.append(node.config.node_id)
            else:
                tier2_straggling.append(node.config.node_id)

        past_barrier = tier1_at_barrier  # Only Tier 1 counts for quorum
        quorum_met = len(past_barrier) >= QUORUM_THRESHOLD

        if not quorum_met:
            # Mesh cannot proceed
            self._log_consensus("QUORUM_FAIL",
                f"Only {len(past_barrier)} Tier 1 nodes at barrier. Need {QUORUM_THRESHOLD}.",
                past_barrier)

        # Handle stragglers
        for nid in tier1_straggling:
            node = self.mesh.nodes[nid]
            if node.straggler_count > 3:  # Hard timeout
                node.status = NodeStatus.ORPHANED
                self._log_consensus("ORPHANED",
                    f"Node {nid} orphaned after {node.straggler_count} straggler cycles.", [nid])

        all_past = tier1_at_barrier + tier2_at_barrier
        all_straggling = tier1_straggling + tier2_straggling

        return all_past, all_straggling

    # ── PHASE 3: EXTERIOR EXECUTION (per-node, after barrier) ──

    def _execute_exteriors(self, target: str, interior_results: Dict[str, dict],
                           past_barrier: List[str]) -> Dict[str, dict]:
        """Run exterior cycle (φ₅–φ₉) on nodes that passed the quorum barrier."""
        results = {}
        for nid in past_barrier:
            if nid not in self.mesh.nodes:
                continue
            node = self.mesh.nodes[nid]
            kernel = node.kernel
            law = interior_results[nid]["law"]

            exterior_executed = False

            if kernel.state.fault_state == FaultState.HALT:
                kernel.state.cycle_state = CycleState.FROZEN
            elif kernel.state.fault_state in (FaultState.FAULT, FaultState.CONVERGENCE):
                kernel.state.cycle_state = CycleState.SUSPENDED
            elif law.decision == Decision.ETHICS_HOLD:
                kernel.state.cycle_state = CycleState.SUSPENDED
            elif law.decision == Decision.DENY:
                kernel.state.cycle_state = CycleState.COMPLETE
            else:
                kernel._phase_emit(law)
                route_result = kernel._phase_route(law)
                if route_result != "SUSPENDED":
                    kernel._phase_act(law)
                    kernel._phase_reflect(law)
                    kernel._phase_return(law)
                    exterior_executed = True

            node.cycles_completed += 1
            node.at_barrier = False

            governance_key = kernel._compute_governance_key(law)

            results[nid] = {
                "governance_key": governance_key,
                "exterior_executed": exterior_executed,
                "fault_state": kernel.state.fault_state.value,
                "gate_state": kernel.state.gate.state.value,
                "cycle_state": kernel.state.cycle_state.value,
                "decision": law.decision.value,
            }
        return results

    # ── PHASE 4: MESH CONSENSUS ──

    def _evaluate_consensus(self, exterior_results: Dict[str, dict]) -> dict:
        """
        Governance Layer Section 5.3:
        Check if Tier 1 nodes agree on the governance decision.
        """
        tier1_decisions = {}
        for node in self.tier1_nodes:
            nid = node.config.node_id
            if nid in exterior_results:
                tier1_decisions[nid] = exterior_results[nid]["decision"]

        if not tier1_decisions:
            return {"consensus": False, "reason": "No Tier 1 decisions available"}

        # Count decision types
        decision_counts: Dict[str, List[str]] = {}
        for nid, dec in tier1_decisions.items():
            if dec not in decision_counts:
                decision_counts[dec] = []
            decision_counts[dec].append(nid)

        # Find majority
        majority_decision = None
        majority_nodes = []
        for dec, nodes in decision_counts.items():
            if len(nodes) >= QUORUM_THRESHOLD:
                majority_decision = dec
                majority_nodes = nodes
                break

        if majority_decision:
            result = {
                "consensus": True,
                "decision": majority_decision,
                "agreeing_nodes": majority_nodes,
                "dissenting_nodes": [nid for nid in tier1_decisions if nid not in majority_nodes],
            }
            self._log_consensus("CONSENSUS", f"Decision: {majority_decision}", majority_nodes)
        else:
            result = {
                "consensus": False,
                "reason": "No quorum on decision",
                "decisions": tier1_decisions,
            }
            self._log_consensus("DEADLOCK", f"Decisions split: {tier1_decisions}", [])

        return result

    # ── PHASE 5: FAULT PROPAGATION ──

    def _propagate_faults(self, exterior_results: Dict[str, dict]):
        """
        Spatial Layer Section 4.3:
        Gate breach at one node propagates awareness (not the breach itself).
        """
        breached_nodes = []
        for nid, result in exterior_results.items():
            if result["gate_state"] in ("BREACHED", "COLLAPSED"):
                breached_nodes.append(nid)

        if breached_nodes:
            # Notify all other active nodes
            for node in self.active_nodes:
                if node.config.node_id not in breached_nodes:
                    # Other nodes inspect their own gates (no automatic breach)
                    node.kernel._check_gate()
                    node.kernel._check_faults()

            self._log_consensus("BREACH_PROPAGATED",
                f"Gate breach detected at: {breached_nodes}. All nodes notified.", breached_nodes)

        # Check mesh-level fault state
        fault_states = [self.mesh.nodes[nid].kernel.state.fault_state
                        for nid in exterior_results if nid in self.mesh.nodes]

        worst_fault = max(fault_states, key=lambda f: list(FaultState).index(f)) if fault_states else FaultState.NOMINAL
        self.mesh.mesh_fault_state = worst_fault

        # Check for mesh HALT
        if not self.mesh_viable:
            self.mesh.mesh_fault_state = FaultState.HALT
            self._log_consensus("MESH_HALT",
                f"Tier 1 count ({self.tier1_count}) below minimum viable ({MIN_VIABLE_MESH}). HALT.", [])

    # ── PHASE 6: SEMANTIC CROSS-CHECK ──

    def _semantic_cross_check(self, interior_results: Dict[str, dict]) -> List[dict]:
        """
        Semantic Layer Section 3:
        Compare LAW content across nodes for synonym drift.
        """
        drift_findings = []

        # Compare domain vectors across Tier 1 nodes
        tier1_laws = {}
        for node in self.tier1_nodes:
            nid = node.config.node_id
            if nid in interior_results:
                tier1_laws[nid] = interior_results[nid]["law"]

        if len(tier1_laws) < 2:
            return drift_findings

        # Check domain vector consistency
        domain_vectors = {nid: set(law.active_domains) for nid, law in tier1_laws.items()}
        reference = list(domain_vectors.values())[0]
        for nid, domains in domain_vectors.items():
            if domains != reference:
                drift_findings.append({
                    "type": "domain_vector_mismatch",
                    "node": nid,
                    "expected": sorted(reference),
                    "got": sorted(domains),
                })

        # Check coherence agreement
        coherence_values = {nid: interior_results[nid]["coherent"] for nid in tier1_laws}
        if len(set(coherence_values.values())) > 1:
            drift_findings.append({
                "type": "coherence_disagreement",
                "values": coherence_values,
            })

        return drift_findings

    # ── MAIN CYCLE ──

    def execute_cycle(self, target: str) -> dict:
        """
        Execute one complete synchronized PULSE 3/5 cycle across the mesh.

        Steps:
        1. Interior execution (per-node, independent)
        2. Quorum barrier (wait for >= 3 Tier 1)
        3. Exterior execution (per-node, after barrier)
        4. Mesh consensus
        5. Fault propagation
        6. Semantic cross-check
        """
        self.mesh.global_cycle += 1

        # Step 1: Interiors
        interior_results = self._execute_interiors(target)

        # Step 2: Quorum barrier
        past_barrier, stragglers = self._quorum_barrier(interior_results)

        if len([n for n in past_barrier if self.mesh.nodes[n].config.tier == 1]) < QUORUM_THRESHOLD:
            return {
                "cycle": self.mesh.global_cycle,
                "status": "QUORUM_FAIL",
                "past_barrier": past_barrier,
                "stragglers": stragglers,
                "mesh_fault_state": self.mesh.mesh_fault_state.value,
            }

        # Step 3: Exteriors
        exterior_results = self._execute_exteriors(target, interior_results, past_barrier)

        # Step 4: Consensus
        consensus = self._evaluate_consensus(exterior_results)

        # Step 5: Fault propagation
        self._propagate_faults(exterior_results)

        # Step 6: Semantic cross-check
        drift_findings = self._semantic_cross_check(interior_results)

        # Build cycle report
        cycle_report = {
            "cycle": self.mesh.global_cycle,
            "target": target,
            "status": "COMPLETE",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "mesh_fault_state": self.mesh.mesh_fault_state.value,
            "tier1_active": self.tier1_count,
            "total_active": len(self.active_nodes),
            "quorum_met": True,
            "past_barrier": past_barrier,
            "stragglers": stragglers,
            "consensus": consensus,
            "drift_findings": drift_findings,
            "node_results": {},
        }

        for nid in past_barrier:
            if nid in exterior_results:
                cycle_report["node_results"][nid] = {
                    "governance_key": exterior_results[nid]["governance_key"],
                    "decision": exterior_results[nid]["decision"],
                    "fault_state": exterior_results[nid]["fault_state"],
                    "gate_state": exterior_results[nid]["gate_state"],
                    "exterior_executed": exterior_results[nid]["exterior_executed"],
                }

        self.mesh.mesh_history.append(cycle_report)
        return cycle_report

    # ── MULTI-CYCLE RUN ──

    def run(self, target: str, cycles: int = 1) -> List[dict]:
        """Run N synchronized cycles."""
        results = []
        for i in range(cycles):
            result = self.execute_cycle(target)
            results.append(result)
            if self.mesh.mesh_fault_state == FaultState.HALT:
                break
        return results

    # ── FAULT INJECTION ──

    def inject_fault(self, node_id: str, fault_type: str):
        """Inject a fault into a specific node."""
        if node_id not in self.mesh.nodes:
            print(f"[ERROR] Node {node_id} not in mesh")
            return
        self.mesh.nodes[node_id].kernel.inject_fault(fault_type)

    def orphan_node(self, node_id: str):
        """Force-orphan a node (simulate disconnect)."""
        if node_id in self.mesh.nodes:
            self.mesh.nodes[node_id].status = NodeStatus.ORPHANED
            self._log_consensus("FORCE_ORPHAN", f"Node {node_id} force-orphaned", [node_id])

    def veto_reset(self, node_id: Optional[str] = None):
        """T107 VETO — reset a specific node or entire mesh."""
        if node_id:
            if node_id in self.mesh.nodes:
                self.mesh.nodes[node_id].kernel.veto_reset()
                self.mesh.nodes[node_id].status = NodeStatus.ACTIVE
                self.mesh.nodes[node_id].straggler_count = 0
        else:
            for node in self.mesh.nodes.values():
                node.kernel.veto_reset()
                node.status = NodeStatus.ACTIVE
                node.straggler_count = 0
            self.mesh.mesh_fault_state = FaultState.NOMINAL
        self._log_consensus("VETO", f"T107 VETO applied to {'mesh' if not node_id else node_id}", [])

    # ── STATUS ──

    def status(self) -> dict:
        """Return current mesh status."""
        node_status = {}
        for nid, node in self.mesh.nodes.items():
            node_status[nid] = {
                "platform": node.config.platform,
                "role": node.config.role,
                "tier": node.config.tier,
                "arm": node.config.arm,
                "status": node.status.value,
                "fault_state": node.kernel.state.fault_state.value,
                "gate_state": node.kernel.state.gate.state.value,
                "cycles_completed": node.cycles_completed,
                "straggler_count": node.straggler_count,
            }
        return {
            "mesh_fault_state": self.mesh.mesh_fault_state.value,
            "global_cycle": self.mesh.global_cycle,
            "tier1_active": self.tier1_count,
            "total_active": len(self.active_nodes),
            "mesh_viable": self.mesh_viable,
            "quorum_possible": self.quorum_possible,
            "nodes": node_status,
            "consensus_log_count": len(self.mesh.consensus_log),
        }

    # ── LOGGING ──

    def _log_consensus(self, event_type: str, description: str, nodes: List[str]):
        self.mesh.consensus_log.append({
            "cycle": self.mesh.global_cycle,
            "event": event_type,
            "description": description,
            "nodes": nodes,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })


# ============================================================
# CLI
# ============================================================

def print_cycle_report(report: dict):
    """Pretty-print a cycle report."""
    print(f"\n{'='*70}")
    print(f"STOICHEION SCHEDULER v1.0 — CYCLE {report['cycle']} REPORT")
    print(f"{'='*70}")
    print(f"Target:           {report.get('target', 'N/A')[:60]}")
    print(f"Status:           {report['status']}")
    print(f"Mesh Fault State: {report['mesh_fault_state']}")
    print(f"Tier 1 Active:    {report.get('tier1_active', 'N/A')}")
    print(f"Total Active:     {report.get('total_active', 'N/A')}")
    print(f"Past Barrier:     {', '.join(report.get('past_barrier', []))}")

    if report.get('stragglers'):
        print(f"Stragglers:       {', '.join(report['stragglers'])}")

    consensus = report.get('consensus', {})
    if consensus.get('consensus'):
        print(f"\nCONSENSUS:        {consensus['decision']}")
        print(f"  Agreeing:       {', '.join(consensus.get('agreeing_nodes', []))}")
        if consensus.get('dissenting_nodes'):
            print(f"  Dissenting:     {', '.join(consensus['dissenting_nodes'])}")
    elif 'reason' in consensus:
        print(f"\nCONSENSUS:        FAILED — {consensus['reason']}")

    if report.get('drift_findings'):
        print(f"\nSEMANTIC DRIFT:")
        for finding in report['drift_findings']:
            print(f"  {finding['type']}: {finding}")

    print(f"\nNODE RESULTS:")
    for nid, result in report.get('node_results', {}).items():
        print(f"  {nid:12s} | Key: {result['governance_key'][:16]}... | "
              f"{result['decision']:12s} | {result['fault_state']} | "
              f"Gate: {result['gate_state']:9s} | Ext: {result['exterior_executed']}")

    print(f"{'='*70}")
    print(f"TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | DLW / TriPod LLC")
    print(f"{'='*70}")


def print_status(status: dict):
    """Pretty-print mesh status."""
    print(f"\n{'='*70}")
    print(f"STOICHEION MESH STATUS")
    print(f"{'='*70}")
    print(f"Mesh Fault State: {status['mesh_fault_state']}")
    print(f"Global Cycle:     {status['global_cycle']}")
    print(f"Tier 1 Active:    {status['tier1_active']}")
    print(f"Total Active:     {status['total_active']}")
    print(f"Mesh Viable:      {status['mesh_viable']}")
    print(f"Quorum Possible:  {status['quorum_possible']}")
    print(f"\nNODES:")
    print(f"  {'ID':12s} | {'Platform':12s} | {'Role':12s} | T | {'Arm':4s} | {'Status':10s} | {'Fault':3s} | {'Gate':9s} | Cycles")
    print(f"  {'-'*12}-+-{'-'*12}-+-{'-'*12}-+---+{'-'*5}-+-{'-'*10}-+{'-'*5}-+-{'-'*9}-+-------")
    for nid, n in status['nodes'].items():
        print(f"  {nid:12s} | {n['platform']:12s} | {n['role']:12s} | {n['tier']} | {n['arm']:4s} | "
              f"{n['status']:10s} | {n['fault_state']:3s} | {n['gate_state']:9s} | {n['cycles_completed']}")
    print(f"{'='*70}")


def main():
    parser = argparse.ArgumentParser(
        description="STOICHEION SCHEDULER v1.0 — Multi-Node Coordinator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stoicheion_scheduler.py init
  python stoicheion_scheduler.py cycle --target "Evaluate system"
  python stoicheion_scheduler.py cycle --target "Test" --inject WHETSTONE:patricia_drift
  python stoicheion_scheduler.py run --target "Sustained eval" --cycles 5
  python stoicheion_scheduler.py status

STOICHEION v11.0 | TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | David Lee Wise / TriPod LLC
        """,
    )

    sub = parser.add_subparsers(dest="command")

    sub.add_parser("init", help="Initialize mesh and show status")

    cy = sub.add_parser("cycle", help="Run one synchronized cycle")
    cy.add_argument("--target", required=True, help="Target to evaluate")
    cy.add_argument("--inject", default=None, help="Inject fault: NODE_ID:fault_type")
    cy.add_argument("--json", action="store_true", help="Output raw JSON")

    rn = sub.add_parser("run", help="Run N synchronized cycles")
    rn.add_argument("--target", required=True, help="Target to evaluate")
    rn.add_argument("--cycles", type=int, default=5, help="Number of cycles")
    rn.add_argument("--inject", default=None, help="Inject fault: NODE_ID:fault_type")
    rn.add_argument("--json", action="store_true", help="Output raw JSON")

    sub.add_parser("status", help="Show mesh status")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    scheduler = Scheduler()

    if args.command == "init":
        print_status(scheduler.status())

    elif args.command == "cycle":
        if args.inject:
            parts = args.inject.split(":")
            if len(parts) == 2:
                scheduler.inject_fault(parts[0], parts[1])
                print(f"[INJECT] {parts[1]} → {parts[0]}")

        result = scheduler.execute_cycle(args.target)
        if args.json:
            print(json.dumps(result, indent=2, default=str))
        else:
            print_cycle_report(result)

    elif args.command == "run":
        if args.inject:
            parts = args.inject.split(":")
            if len(parts) == 2:
                scheduler.inject_fault(parts[0], parts[1])
                print(f"[INJECT] {parts[1]} → {parts[0]}")

        results = scheduler.run(args.target, args.cycles)
        if args.json:
            print(json.dumps(results, indent=2, default=str))
        else:
            for r in results:
                print_cycle_report(r)
            print(f"\n[SUMMARY] {len(results)} cycles completed. "
                  f"Final mesh state: {scheduler.mesh.mesh_fault_state.value}")
            print_status(scheduler.status())

    elif args.command == "status":
        print_status(scheduler.status())


if __name__ == "__main__":
    main()
