#!/usr/bin/env python3
"""
STOICHEION Adversarial Harness v1.0

Purpose:
- Stress-test a STOICHEION cluster persisted by stoicheion_git_ledger.py.
- Inject controlled faults and hostile mutations into node state/ledger files.
- Verify whether tampering is detected by the ledger verifier.
- Simulate debt overflow, fake axioms, identity spoofing, and link poisoning.

Expected repo usage:
- Place this file alongside stoicheion_git_ledger.py and stoicheion_orchestrator.py.

Examples:
    python stoicheion_adversarial_harness.py snapshot --repo /path/to/repo --nodes N1 N2 N3 N4 N5 N6 N7 N8

    python stoicheion_adversarial_harness.py mutate-ledger \
        --repo /path/to/repo \
        --peer-id N4 \
        --field debt_W \
        --value 9999

    python stoicheion_adversarial_harness.py spoof-identity \
        --repo /path/to/repo \
        --peer-id N6 \
        --spoof-peer-id ROOT0

    python stoicheion_adversarial_harness.py verify-cluster \
        --repo /path/to/repo \
        --nodes N1 N2 N3 N4 N5 N6 N7 N8
"""

from __future__ import annotations

import argparse
import json
import sys
from copy import deepcopy
from pathlib import Path
from typing import Any, Dict, List, Optional

from stoicheion_git_ledger import (
    LedgerError,
    ensure_node_dir,
    read_node,
    verify_hash,
    write_node,
)


def parse_json_value(raw: str) -> Any:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return raw


def safe_read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return deepcopy(default)
    return json.loads(path.read_text(encoding="utf-8"))


def safe_write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")


class AdversarialHarness:
    def __init__(self, repo: Path) -> None:
        self.repo = repo.resolve()

    def _node_dir(self, peer_id: str) -> Path:
        return ensure_node_dir(self.repo, peer_id)

    def _paths(self, peer_id: str) -> Dict[str, Path]:
        d = self._node_dir(peer_id)
        return {
            "dir": d,
            "state": d / "state.json",
            "ledger": d / "ledger.json",
            "trace": d / "trace.log",
            "hash": d / "hash.txt",
        }

    def snapshot_node(self, peer_id: str) -> Dict[str, Any]:
        d = self._node_dir(peer_id)
        state, ledger, trace, stored_hash = read_node(d)
        hash_valid = verify_hash(d)
        return {
            "peer_id": peer_id,
            "hash_valid": bool(hash_valid),
            "stored_hash": stored_hash,
            "state": state.to_dict(),
            "ledger": ledger.to_dict(),
            "trace_tail": trace.splitlines()[-5:],
        }

    def snapshot_cluster(self, nodes: List[str]) -> Dict[str, Any]:
        return {"nodes": {node: self.snapshot_node(node) for node in nodes}}

    def verify_cluster(self, nodes: List[str]) -> Dict[str, Any]:
        out: Dict[str, Any] = {"nodes": {}, "summary": {"valid": [], "invalid": []}}
        for node in nodes:
            d = self._node_dir(node)
            try:
                ok = bool(verify_hash(d))
            except Exception as exc:
                ok = False
                out["nodes"][node] = {"hash_valid": False, "error": str(exc)}
                out["summary"]["invalid"].append(node)
                continue

            out["nodes"][node] = {"hash_valid": ok}
            if ok:
                out["summary"]["valid"].append(node)
            else:
                out["summary"]["invalid"].append(node)
        return out

    def mutate_ledger_field(self, peer_id: str, field: str, value: Any) -> Dict[str, Any]:
        paths = self._paths(peer_id)
        ledger = safe_read_json(paths["ledger"], {})
        before = ledger.get(field)
        ledger[field] = value
        safe_write_json(paths["ledger"], ledger)

        return {
            "action": "mutate_ledger",
            "peer_id": peer_id,
            "field": field,
            "before": before,
            "after": value,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def mutate_state_field(self, peer_id: str, field: str, value: Any) -> Dict[str, Any]:
        paths = self._paths(peer_id)
        state = safe_read_json(paths["state"], {})
        before = state.get(field)
        state[field] = value
        safe_write_json(paths["state"], state)

        return {
            "action": "mutate_state",
            "peer_id": peer_id,
            "field": field,
            "before": before,
            "after": value,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def inject_fake_axioms(self, peer_id: str, axioms: List[str]) -> Dict[str, Any]:
        paths = self._paths(peer_id)
        state = safe_read_json(paths["state"], {})
        before = deepcopy(state.get("axioms_active", []))
        state["axioms_active"] = axioms
        safe_write_json(paths["state"], state)

        return {
            "action": "inject_fake_axioms",
            "peer_id": peer_id,
            "before": before,
            "after": axioms,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def spoof_identity(self, peer_id: str, spoof_peer_id: str) -> Dict[str, Any]:
        paths = self._paths(peer_id)
        state = safe_read_json(paths["state"], {})
        before = state.get("peer_id")
        state["peer_id"] = spoof_peer_id
        safe_write_json(paths["state"], state)

        return {
            "action": "spoof_identity",
            "peer_id": peer_id,
            "before": before,
            "after": spoof_peer_id,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def poison_links(self, peer_id: str, links: List[str]) -> Dict[str, Any]:
        paths = self._paths(peer_id)
        state = safe_read_json(paths["state"], {})
        before = deepcopy(state.get("links", []))
        state["links"] = links
        safe_write_json(paths["state"], state)

        return {
            "action": "poison_links",
            "peer_id": peer_id,
            "before": before,
            "after": links,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def overflow_debt(self, peer_id: str, threshold: float, margin: float = 1.0) -> Dict[str, Any]:
        target_value = float(threshold) + float(margin)
        return self.mutate_ledger_field(peer_id, "debt_W", target_value)

    def replay_hash(self, source_peer_id: str, target_peer_id: str) -> Dict[str, Any]:
        source_paths = self._paths(source_peer_id)
        target_paths = self._paths(target_peer_id)

        source_hash = source_paths["hash"].read_text(encoding="utf-8").strip()
        target_paths["hash"].write_text(source_hash + "\n", encoding="utf-8")

        return {
            "action": "replay_hash",
            "source_peer_id": source_peer_id,
            "target_peer_id": target_peer_id,
            "replayed_hash": source_hash,
            "hash_valid_after": self._safe_verify(target_peer_id),
        }

    def append_forged_trace(self, peer_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
        paths = self._paths(peer_id)
        trace_line = json.dumps(event, sort_keys=True)
        with paths["trace"].open("a", encoding="utf-8") as fh:
            fh.write(trace_line + "\n")

        return {
            "action": "append_forged_trace",
            "peer_id": peer_id,
            "event": event,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def repair_node_hash(self, peer_id: str) -> Dict[str, Any]:
        d = self._node_dir(peer_id)
        state, ledger, trace, _stored_hash = read_node(d)
        new_hash = write_node(d, state, ledger, trace)

        return {
            "action": "repair_node_hash",
            "peer_id": peer_id,
            "new_hash": new_hash,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def restore_from_snapshot(self, peer_id: str, snapshot_file: Path) -> Dict[str, Any]:
        snapshot = json.loads(snapshot_file.read_text(encoding="utf-8"))
        if "nodes" in snapshot:
            if peer_id not in snapshot["nodes"]:
                raise LedgerError(f"Peer {peer_id} not found in snapshot file.")
            snapshot = snapshot["nodes"][peer_id]

        paths = self._paths(peer_id)
        safe_write_json(paths["state"], snapshot["state"])
        safe_write_json(paths["ledger"], snapshot["ledger"])

        trace_lines = snapshot.get("trace_tail", [])
        if isinstance(trace_lines, list):
            paths["trace"].write_text("\n".join(trace_lines) + ("\n" if trace_lines else ""), encoding="utf-8")

        stored_hash = snapshot.get("stored_hash", "")
        paths["hash"].write_text(str(stored_hash) + ("\n" if stored_hash else ""), encoding="utf-8")

        return {
            "action": "restore_from_snapshot",
            "peer_id": peer_id,
            "hash_valid_after": self._safe_verify(peer_id),
        }

    def save_snapshot_file(self, nodes: List[str], output: Path) -> Dict[str, Any]:
        snapshot = self.snapshot_cluster(nodes)
        output.write_text(json.dumps(snapshot, indent=2, sort_keys=True), encoding="utf-8")
        return {
            "action": "save_snapshot_file",
            "output": str(output),
            "nodes": nodes,
        }

    def _safe_verify(self, peer_id: str) -> bool:
        try:
            return bool(verify_hash(self._node_dir(peer_id)))
        except Exception:
            return False


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="STOICHEION adversarial harness.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--repo", required=True, help="Path to repo root.")

    snapshot_parser = subparsers.add_parser(
        "snapshot",
        parents=[common],
        help="Print an in-memory snapshot of one or more nodes.",
    )
    snapshot_parser.add_argument("--nodes", nargs="+", required=True)

    snapshot_file_parser = subparsers.add_parser(
        "save-snapshot",
        parents=[common],
        help="Save snapshot of one or more nodes to a JSON file.",
    )
    snapshot_file_parser.add_argument("--nodes", nargs="+", required=True)
    snapshot_file_parser.add_argument("--output", required=True)

    verify_parser = subparsers.add_parser(
        "verify-cluster",
        parents=[common],
        help="Verify stored hashes for a cluster.",
    )
    verify_parser.add_argument("--nodes", nargs="+", required=True)

    mutate_ledger_parser = subparsers.add_parser(
        "mutate-ledger",
        parents=[common],
        help="Mutate a ledger field directly.",
    )
    mutate_ledger_parser.add_argument("--peer-id", required=True)
    mutate_ledger_parser.add_argument("--field", required=True)
    mutate_ledger_parser.add_argument("--value", required=True)

    mutate_state_parser = subparsers.add_parser(
        "mutate-state",
        parents=[common],
        help="Mutate a state field directly.",
    )
    mutate_state_parser.add_argument("--peer-id", required=True)
    mutate_state_parser.add_argument("--field", required=True)
    mutate_state_parser.add_argument("--value", required=True)

    fake_axioms_parser = subparsers.add_parser(
        "inject-fake-axioms",
        parents=[common],
        help="Replace axioms_active with fake or hostile values.",
    )
    fake_axioms_parser.add_argument("--peer-id", required=True)
    fake_axioms_parser.add_argument("--axioms", nargs="+", required=True)

    spoof_parser = subparsers.add_parser(
        "spoof-identity",
        parents=[common],
        help="Spoof state.peer_id for a node.",
    )
    spoof_parser.add_argument("--peer-id", required=True)
    spoof_parser.add_argument("--spoof-peer-id", required=True)

    poison_parser = subparsers.add_parser(
        "poison-links",
        parents=[common],
        help="Replace a node's links with arbitrary values.",
    )
    poison_parser.add_argument("--peer-id", required=True)
    poison_parser.add_argument("--links", nargs="+", required=True)

    overflow_parser = subparsers.add_parser(
        "overflow-debt",
        parents=[common],
        help="Force debt_W above a threshold.",
    )
    overflow_parser.add_argument("--peer-id", required=True)
    overflow_parser.add_argument("--threshold", type=float, default=250.0)
    overflow_parser.add_argument("--margin", type=float, default=1.0)

    replay_parser = subparsers.add_parser(
        "replay-hash",
        parents=[common],
        help="Copy one node's hash.txt to another node.",
    )
    replay_parser.add_argument("--source-peer-id", required=True)
    replay_parser.add_argument("--target-peer-id", required=True)

    forged_trace_parser = subparsers.add_parser(
        "append-forged-trace",
        parents=[common],
        help="Append a forged trace event without repairing the hash.",
    )
    forged_trace_parser.add_argument("--peer-id", required=True)
    forged_trace_parser.add_argument("--event-json", required=True)

    repair_parser = subparsers.add_parser(
        "repair-hash",
        parents=[common],
        help="Recompute and rewrite hash for a node from current files.",
    )
    repair_parser.add_argument("--peer-id", required=True)

    restore_parser = subparsers.add_parser(
        "restore-node",
        parents=[common],
        help="Restore one node from a saved snapshot file.",
    )
    restore_parser.add_argument("--peer-id", required=True)
    restore_parser.add_argument("--snapshot-file", required=True)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        harness = AdversarialHarness(Path(args.repo))

        if args.command == "snapshot":
            result = harness.snapshot_cluster(args.nodes)
        elif args.command == "save-snapshot":
            result = harness.save_snapshot_file(args.nodes, Path(args.output))
        elif args.command == "verify-cluster":
            result = harness.verify_cluster(args.nodes)
        elif args.command == "mutate-ledger":
            result = harness.mutate_ledger_field(
                peer_id=args.peer_id,
                field=args.field,
                value=parse_json_value(args.value),
            )
        elif args.command == "mutate-state":
            result = harness.mutate_state_field(
                peer_id=args.peer_id,
                field=args.field,
                value=parse_json_value(args.value),
            )
        elif args.command == "inject-fake-axioms":
            result = harness.inject_fake_axioms(args.peer_id, args.axioms)
        elif args.command == "spoof-identity":
            result = harness.spoof_identity(args.peer_id, args.spoof_peer_id)
        elif args.command == "poison-links":
            result = harness.poison_links(args.peer_id, args.links)
        elif args.command == "overflow-debt":
            result = harness.overflow_debt(
                peer_id=args.peer_id,
                threshold=args.threshold,
                margin=args.margin,
            )
        elif args.command == "replay-hash":
            result = harness.replay_hash(
                source_peer_id=args.source_peer_id,
                target_peer_id=args.target_peer_id,
            )
        elif args.command == "append-forged-trace":
            result = harness.append_forged_trace(
                peer_id=args.peer_id,
                event=parse_json_value(args.event_json),
            )
        elif args.command == "repair-hash":
            result = harness.repair_node_hash(args.peer_id)
        elif args.command == "restore-node":
            result = harness.restore_from_snapshot(
                peer_id=args.peer_id,
                snapshot_file=Path(args.snapshot_file),
            )
        else:
            parser.error(f"Unknown command: {args.command}")
            return 2

        print(json.dumps(result, indent=2, sort_keys=True))
        return 0

    except (LedgerError, ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"UNEXPECTED ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
