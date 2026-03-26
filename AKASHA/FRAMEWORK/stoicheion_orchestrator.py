#!/usr/bin/env python3
"""
STOICHEION Multi-Node Orchestrator v1.0

Purpose:
- Drive coordinated N1..N8 node ticks on top of stoicheion_git_ledger.py.
- Support sync and async stepping.
- Apply simple resonance, transfer, and ethics-block rules.
- Persist each node through the Git ledger binder.

Expected repo usage:
- Place this file alongside stoicheion_git_ledger.py, or update the import path below.

Example:
    python stoicheion_orchestrator.py init-cluster --repo /path/to/repo --nodes N1 N2 N3 N4 N5 N6 N7 N8

    python stoicheion_orchestrator.py tick-cluster \
        --repo /path/to/repo \
        --nodes N1 N2 N3 N4 N5 N6 N7 N8 \
        --mode sync
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from stoicheion_git_ledger import (
    LedgerError,
    ensure_node_dir,
    read_node,
    write_node,
)

DEFAULT_GEN = 96.0
DEFAULT_CONS = 4.0
DEFAULT_SEED = 3002
DEFAULT_TRANSFER_RATE = 0.10
DEFAULT_RESONANCE_BONUS_FACTOR = 0.50
DEFAULT_HARM_AXIOMS = {"T071", "T073", "T075"}
DEFAULT_EXEC_AXIOMS = {"T081", "T088", "T099"}


@dataclass
class NodePlan:
    peer_id: str
    active_axioms: List[str]
    gen: float = DEFAULT_GEN
    cons: float = DEFAULT_CONS
    links: List[str] = field(default_factory=list)
    resonance: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    blocked_by_ethics: bool = False
    transfer_out_W: float = 0.0
    transfer_in_W: float = 0.0


class StoicheionOrchestrator:
    def __init__(
        self,
        repo: Path,
        nodes: List[str],
        constraint_rate: float = 0.04,
        debt_threshold: float = 250.0,
        total_w_cap: float = 3002.0,
        seed: int = DEFAULT_SEED,
    ) -> None:
        self.repo = repo.resolve()
        self.nodes = nodes
        self.constraint_rate = constraint_rate
        self.debt_threshold = debt_threshold
        self.total_w_cap = total_w_cap
        self.rng = random.Random(seed)
       self.binders = {node: node for node in nodes}

    def topology_ring_plus_chords(self) -> Dict[str, List[str]]:
        """Create a stable N1..N8 style topology.

        Each node links to:
        - previous node
        - next node
        - opposite node (when possible)
        """
        ordered = self.nodes[:]
        n = len(ordered)
        topo: Dict[str, List[str]] = {}
        for i, node in enumerate(ordered):
            links = {ordered[(i - 1) % n], ordered[(i + 1) % n]}
            if n >= 4:
                links.add(ordered[(i + (n // 2)) % n])
            links.discard(node)
            topo[node] = sorted(links)
        return topo

    def init_cluster(self, do_commit: bool = False, do_push: bool = False) -> Dict[str, Any]:
        topology = self.topology_ring_plus_chords()
        out: Dict[str, Any] = {"nodes": {}}
        for node, binder in self.binders.items():
            state = binder.load_state()
            ledger = binder.load_ledger()
            state.links = topology[node]
            state.active_axioms = ["T023", "T051", "T053", "T092"]
            state.metadata = {"cluster_initialized": True}
            state_hash = binder.persist(state, ledger)
            commit_cost = 0.0
            if do_commit:
                commit_cost = binder.commit(
                    f"GENESIS {node} | hash {state_hash[:12]}",
                    ledger,
                    allow_empty=False,
                )
                binder.persist(state, ledger)
            out["nodes"][node] = {
                "links": topology[node],
                "hash": state_hash,
                "commit_cost_W": commit_cost,
            }

        if do_push and do_commit:
            next(iter(self.binders.values())).push()
        return out

    def _default_axioms_for_node(self, node: str, tick_seed: int) -> List[str]:
        presets = [
            ["T023", "T051", "T053", "T081"],
            ["T009", "T013", "T099", "T104"],
            ["T039", "T051", "T060", "T088"],
            ["T065", "T071", "T075", "T081"],
            ["T017", "T023", "T032", "T093"],
            ["T021", "T029", "T083", "T097"],
            ["T018", "T024", "T089", "T091"],
            ["T048", "T062", "T106", "T122"],
        ]
        idx = (sum(ord(c) for c in node) + tick_seed) % len(presets)
        return presets[idx]

    def _plan_cluster(self, mode: str) -> Dict[str, NodePlan]:
        topology = self.topology_ring_plus_chords()
        tick_seed = sum(self.binders[node].load_state().tick for node in self.nodes) + 1
        plans: Dict[str, NodePlan] = {}

        for node in self.nodes:
            active_axioms = self._default_axioms_for_node(node, tick_seed)
            gen = DEFAULT_GEN
            cons = DEFAULT_CONS

            if mode == "async":
                gen += self.rng.uniform(-12.0, 12.0)
                cons += self.rng.uniform(-1.0, 2.0)

            plans[node] = NodePlan(
                peer_id=node,
                active_axioms=sorted(set(active_axioms)),
                gen=max(0.0, round(gen, 2)),
                cons=max(0.0, round(cons, 2)),
                links=topology[node],
                metadata={"mode": mode},
            )

        self._apply_resonance(plans)
        self._apply_ethics_gate(plans)
        self._apply_transfers(plans)
        return plans

    def _apply_resonance(self, plans: Dict[str, NodePlan]) -> None:
        """Resonance when neighbors share at least 2 axioms."""
        for node, plan in plans.items():
            for neighbor in plan.links:
                shared = set(plan.active_axioms) & set(plans[neighbor].active_axioms)
                if len(shared) >= 2:
                    plan.resonance = True
                    plan.metadata["resonant_with"] = neighbor
                    plan.cons = round(plan.cons * DEFAULT_RESONANCE_BONUS_FACTOR, 2)
                    break

    def _apply_ethics_gate(self, plans: Dict[str, NodePlan]) -> None:
        """Block execution-heavy plans when ethics axioms are absent.

        Rule used here:
        - if a node intends execution/propagation but lacks any ethical axiom, throttle generation.
        """
        ethical_domain = {"T065", "T066", "T067", "T068", "T069", "T070", "T071", "T072", "T073", "T074", "T075", "T076", "T077", "T078", "T079", "T080"}
        for plan in plans.values():
            has_execution = bool(DEFAULT_EXEC_AXIOMS & set(plan.active_axioms))
            has_ethics = bool(ethical_domain & set(plan.active_axioms))
            if has_execution and not has_ethics:
                plan.blocked_by_ethics = True
                plan.metadata["ethics_gate"] = "blocked"
                plan.gen = round(plan.gen * 0.25, 2)
                plan.cons = round(max(plan.cons, DEFAULT_CONS), 2)

    def _apply_transfers(self, plans: Dict[str, NodePlan]) -> None:
        """Transfer a fraction of generation to the first linked node."""
        for node, plan in plans.items():
            if not plan.links or plan.blocked_by_ethics:
                continue
            receiver = plan.links[0]
            transfer = round(plan.gen * DEFAULT_TRANSFER_RATE, 2)
            plan.transfer_out_W = transfer
            plans[receiver].transfer_in_W += transfer
            plan.metadata["transfer_to"] = receiver
            plan.metadata["transfer_out_W"] = transfer

        for plan in plans.values():
            if plan.transfer_in_W:
                plan.gen = round(plan.gen + plan.transfer_in_W, 2)
                plan.metadata["transfer_in_W"] = round(plan.transfer_in_W, 2)

    def tick_cluster(
        self,
        mode: str,
        do_commit: bool = False,
        do_push: bool = False,
    ) -> Dict[str, Any]:
        if mode not in {"sync", "async"}:
            raise ValueError("mode must be 'sync' or 'async'")

        plans = self._plan_cluster(mode)
        results: Dict[str, Any] = {
            "mode": mode,
            "nodes": {},
            "cluster": {
                "resonant_nodes": [],
                "blocked_nodes": [],
                "total_gen_W": 0.0,
                "total_cons_W": 0.0,
                "total_net_W": 0.0,
            },
        }

        for node in self.nodes:
            plan = plans[node]
            binder = self.binders[node]
            result = binder.tick(
                gen=plan.gen,
                cons=plan.cons,
                active_axioms=plan.active_axioms,
                links=plan.links,
                resonance=plan.resonance,
                metadata=plan.metadata,
                do_commit=do_commit,
                do_push=False,
            )
            results["nodes"][node] = {
                **result,
                "active_axioms": plan.active_axioms,
                "links": plan.links,
                "blocked_by_ethics": plan.blocked_by_ethics,
                "transfer_out_W": plan.transfer_out_W,
                "transfer_in_W": round(plan.transfer_in_W, 2),
            }
            results["cluster"]["total_gen_W"] += plan.gen
            results["cluster"]["total_cons_W"] += plan.cons
            results["cluster"]["total_net_W"] += result["ledger"]["net_W"]
            if plan.resonance:
                results["cluster"]["resonant_nodes"].append(node)
            if plan.blocked_by_ethics:
                results["cluster"]["blocked_nodes"].append(node)

        results["cluster"]["total_gen_W"] = round(results["cluster"]["total_gen_W"], 2)
        results["cluster"]["total_cons_W"] = round(results["cluster"]["total_cons_W"], 2)
        results["cluster"]["total_net_W"] = round(results["cluster"]["total_net_W"], 2)

        if do_push and do_commit:
            next(iter(self.binders.values())).push()

        return results

    def rehydrate_cluster(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {"nodes": {}}
        for node, binder in self.binders.items():
            out["nodes"][node] = binder.rehydrate()
        return out


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="STOICHEION multi-node orchestrator.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--repo", required=True, help="Path to repo root.")
    common.add_argument(
        "--nodes",
        nargs="+",
        required=True,
        help="Node IDs to orchestrate, for example N1 N2 N3 N4 N5 N6 N7 N8.",
    )
    common.add_argument("--seed", type=int, default=DEFAULT_SEED, help="Deterministic random seed.")
    common.add_argument("--constraint-rate", type=float, default=0.04)
    common.add_argument("--debt-threshold", type=float, default=250.0)
    common.add_argument("--total-w-cap", type=float, default=3002.0)

    init_parser = subparsers.add_parser("init-cluster", parents=[common], help="Initialize node directories and topology.")
    init_parser.add_argument("--commit", action="store_true")
    init_parser.add_argument("--push", action="store_true")

    tick_parser = subparsers.add_parser("tick-cluster", parents=[common], help="Tick all nodes once.")
    tick_parser.add_argument("--mode", choices=["sync", "async"], default="sync")
    tick_parser.add_argument("--commit", action="store_true")
    tick_parser.add_argument("--push", action="store_true")

    rehydrate_parser = subparsers.add_parser("rehydrate-cluster", parents=[common], help="Verify and load all nodes.")

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        orch = StoicheionOrchestrator(
            repo=Path(args.repo),
            nodes=args.nodes,
            constraint_rate=args.constraint_rate,
            debt_threshold=args.debt_threshold,
            total_w_cap=args.total_w_cap,
            seed=args.seed,
        )

        if args.command == "init-cluster":
            result = orch.init_cluster(do_commit=args.commit, do_push=args.push)
            print(json.dumps(result, indent=2, sort_keys=True))
            return 0

        if args.command == "tick-cluster":
            result = orch.tick_cluster(mode=args.mode, do_commit=args.commit, do_push=args.push)
            print(json.dumps(result, indent=2, sort_keys=True))
            return 0

        if args.command == "rehydrate-cluster":
            result = orch.rehydrate_cluster()
            print(json.dumps(result, indent=2, sort_keys=True))
            return 0

        parser.error(f"Unknown command: {args.command}")
        return 2

    except (LedgerError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"UNEXPECTED ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
