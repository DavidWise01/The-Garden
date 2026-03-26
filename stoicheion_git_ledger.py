#!/usr/bin/env python3
"""
STOICHEION Git Ledger Binder v1.0

Purpose:
- Persist node state for a STOICHEION-style lattice into a Git-backed ledger.
- Hash each node snapshot for tamper evidence.
- Append a trace log for each tick.
- Optionally commit changes to Git when economic constraints allow.

Example:
    python stoicheion_git_ledger.py tick \
        --repo /path/to/repo \
        --peer-id N1 \
        --active-axioms T023 T051 T053 T060 T081 \
        --gen 96 \
        --cons 4

    python stoicheion_git_ledger.py rehydrate \
        --repo /path/to/repo \
        --peer-id N1

Authors: ChatGPT (OpenAI) + AVAN (Claude/Anthropic) + ROOT0 (David Lee Wise)
License: CC-BY-ND-4.0 · TRIPOD-IP-v1.1
Date: March 25, 2026
"""

from __future__ import annotations

import argparse
import dataclasses
import hashlib
import json
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


APP_VERSION = "1.0"
DEFAULT_TOTAL_W_CAP = 3002.0
DEFAULT_CONSTRAINT_RATE = 0.04
DEFAULT_DEBT_THRESHOLD = 250.0
DEFAULT_ENCODING = "utf-8"


class LedgerError(Exception):
    """Base error for ledger operations."""


class HashVerificationError(LedgerError):
    """Raised when stored hashes do not match computed state."""


class GitCommandError(LedgerError):
    """Raised when a Git command fails."""


@dataclass
class Ledger:
    gen_W: float = 0.0
    cons_W: float = 0.0
    net_W: float = 0.0
    debt_W: float = 0.0
    credit_W: float = 0.0
    last_commit_cost_W: float = 0.0

    def apply_tick(
        self,
        gen: float,
        cons: float,
        constraint_rate: float,
        resonance: bool = False,
    ) -> None:
        """Apply one economic cycle to the ledger."""
        if gen < 0 or cons < 0:
            raise LedgerError("Generation and constraint must be non-negative.")

        effective_cons = cons * 0.5 if resonance else cons
        baseline_cons = gen * constraint_rate

        self.gen_W += gen
        self.cons_W += effective_cons
        self.net_W = self.gen_W - self.cons_W

        delta = effective_cons - baseline_cons
        if delta > 0:
            self.debt_W += delta
        else:
            self.credit_W += abs(delta)

    def can_afford_commit(self, commit_cost: float) -> bool:
        return self.net_W >= commit_cost

    def is_pruned(self, threshold: float = DEFAULT_DEBT_THRESHOLD) -> bool:
        return self.debt_W > threshold

    def to_dict(self) -> Dict[str, float]:
        return dataclasses.asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Ledger":
        return cls(
            gen_W=float(data.get("gen_W", 0.0)),
            cons_W=float(data.get("cons_W", 0.0)),
            net_W=float(data.get("net_W", 0.0)),
            debt_W=float(data.get("debt_W", 0.0)),
            credit_W=float(data.get("credit_W", 0.0)),
            last_commit_cost_W=float(data.get("last_commit_cost_W", 0.0)),
        )


@dataclass
class NodeState:
    peer_id: str
    name: str = ""
    position: str = ""
    substrate: str = ""
    status: str = "ACTIVE"
    axioms_active: List[str] = field(default_factory=list)
    links: List[str] = field(default_factory=list)
    cycle: int = 0
    timestamp: str = ""
    genesis: bool = False
    framework_version: str = "STOICHEION_v11.0"

    def to_dict(self) -> Dict[str, Any]:
        return dataclasses.asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "NodeState":
        return cls(
            peer_id=data.get("peer_id", "UNKNOWN"),
            name=data.get("name", ""),
            position=data.get("position", ""),
            substrate=data.get("substrate", ""),
            status=data.get("status", "ACTIVE"),
            axioms_active=data.get("axioms_active", []),
            links=data.get("links", []),
            cycle=int(data.get("cycle", 0)),
            timestamp=data.get("timestamp", ""),
            genesis=data.get("genesis", False),
            framework_version=data.get("framework_version", "STOICHEION_v11.0"),
        )


def compute_hash(state: dict, ledger: dict, trace: str) -> str:
    """SHA256 of combined state + ledger + trace."""
    combined = json.dumps(state, sort_keys=True) + json.dumps(ledger, sort_keys=True) + trace
    return hashlib.sha256(combined.encode(DEFAULT_ENCODING)).hexdigest()


def git_run(repo: Path, *args: str) -> str:
    """Run a git command in the repo directory."""
    try:
        result = subprocess.run(
            ["git"] + list(args),
            cwd=str(repo),
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        raise GitCommandError(f"git {' '.join(args)} failed: {e.stderr.strip()}")


def node_dir(repo: Path, peer_id: str) -> Path:
    """Get the AKASHA/NODES/<peer_id> directory."""
    return repo / "AKASHA" / "NODES" / peer_id


def ensure_node_dir(repo: Path, peer_id: str) -> Path:
    """Create node directory if it doesn't exist."""
    d = node_dir(repo, peer_id)
    d.mkdir(parents=True, exist_ok=True)
    return d


def write_node(d: Path, state: NodeState, ledger: Ledger, trace_entry: str) -> str:
    """Write state, ledger, trace, and hash to node directory. Returns hash."""
    state_dict = state.to_dict()
    ledger_dict = ledger.to_dict()

    # Read existing trace
    trace_path = d / "trace.log"
    existing_trace = trace_path.read_text(DEFAULT_ENCODING) if trace_path.exists() else ""
    full_trace = existing_trace + trace_entry + "\n"

    # Compute hash
    h = compute_hash(state_dict, ledger_dict, full_trace)

    # Write files
    (d / "state.json").write_text(
        json.dumps(state_dict, indent=2), DEFAULT_ENCODING
    )
    (d / "ledger.json").write_text(
        json.dumps(ledger_dict, indent=2), DEFAULT_ENCODING
    )
    trace_path.write_text(full_trace, DEFAULT_ENCODING)
    (d / "hash.txt").write_text(h + "\n", DEFAULT_ENCODING)

    return h


def read_node(d: Path) -> tuple:
    """Read state, ledger, trace, and hash from node directory."""
    state_data = json.loads((d / "state.json").read_text(DEFAULT_ENCODING))
    ledger_data = json.loads((d / "ledger.json").read_text(DEFAULT_ENCODING))
    trace = (d / "trace.log").read_text(DEFAULT_ENCODING)
    stored_hash = (d / "hash.txt").read_text(DEFAULT_ENCODING).strip()

    state = NodeState.from_dict(state_data)
    ledger = Ledger.from_dict(ledger_data)

    return state, ledger, trace, stored_hash


def verify_hash(d: Path) -> bool:
    """Verify the stored hash matches computed hash."""
    state, ledger, trace, stored_hash = read_node(d)
    computed = compute_hash(state.to_dict(), ledger.to_dict(), trace)
    return computed == stored_hash


def cmd_tick(args: argparse.Namespace) -> None:
    """Execute one economic tick for a node."""
    repo = Path(args.repo)
    peer_id = args.peer_id
    d = ensure_node_dir(repo, peer_id)

    now = datetime.now(timezone.utc).isoformat()

    # Load or create state
    if (d / "state.json").exists():
        state, ledger, _, _ = read_node(d)
    else:
        state = NodeState(
            peer_id=peer_id,
            genesis=True,
            timestamp=now,
        )
        ledger = Ledger()
        print(f"[GENESIS] Creating new node: {peer_id}")

    # Apply economic tick
    gen = args.gen
    cons = args.cons
    resonance = args.resonance

    ledger.apply_tick(gen, cons, DEFAULT_CONSTRAINT_RATE, resonance)
    state.cycle += 1
    state.timestamp = now
    state.status = "PRUNED" if ledger.is_pruned() else "ACTIVE"

    if args.active_axioms:
        state.axioms_active = args.active_axioms

    # Build trace entry
    trace_entry = (
        f"[{now}] TICK cycle={state.cycle} gen={gen}W cons={cons}W "
        f"net={ledger.net_W:.1f}W debt={ledger.debt_W:.1f}W "
        f"credit={ledger.credit_W:.1f}W resonance={resonance} "
        f"status={state.status}"
    )

    # Write
    h = write_node(d, state, ledger, trace_entry)
    print(f"[TICK] {peer_id} cycle={state.cycle} hash={h[:16]}...")

    # Check if node is pruned
    if state.status == "PRUNED":
        print(f"[PRUNE] {peer_id} debt={ledger.debt_W:.1f}W > threshold={DEFAULT_DEBT_THRESHOLD}")
        return

    # Git commit if affordable
    commit_cost = gen * 0.01  # 1% of generation as commit cost
    if ledger.can_afford_commit(commit_cost) and not args.no_commit:
        try:
            git_run(repo, "add", "-A")
            msg = f"{peer_id} tick {state.cycle} | hash: {h[:16]}"
            git_run(repo, "commit", "-m", msg)
            ledger.last_commit_cost_W = commit_cost
            print(f"[COMMIT] {msg}")

            if args.push:
                git_run(repo, "push", "origin", "main")
                print(f"[PUSH] Pushed to origin/main")
        except GitCommandError as e:
            print(f"[GIT_ERROR] {e}")
    else:
        print(f"[SKIP_COMMIT] net_W={ledger.net_W:.1f} < commit_cost={commit_cost:.1f}")


def cmd_rehydrate(args: argparse.Namespace) -> None:
    """Rehydrate a node from persistent storage."""
    repo = Path(args.repo)
    peer_id = args.peer_id
    d = node_dir(repo, peer_id)

    if not d.exists():
        print(f"[ERROR] Node {peer_id} not found at {d}")
        sys.exit(1)

    # Pull latest if requested
    if args.pull:
        try:
            git_run(repo, "pull", "origin", "main")
            print(f"[PULL] Updated from origin/main")
        except GitCommandError as e:
            print(f"[GIT_ERROR] {e}")

    # Verify hash
    if verify_hash(d):
        print(f"[VERIFY] Hash OK — state is authentic")
    else:
        print(f"[TAMPER] Hash mismatch — state may be compromised")
        if not args.force:
            print("[ABORT] Use --force to load anyway")
            sys.exit(1)

    # Load state
    state, ledger, trace, stored_hash = read_node(d)

    print(f"\n{'='*50}")
    print(f"NODE REHYDRATED: {peer_id}")
    print(f"{'='*50}")
    print(f"Name:     {state.name}")
    print(f"Position: {state.position}")
    print(f"Status:   {state.status}")
    print(f"Cycle:    {state.cycle}")
    print(f"Axioms:   {', '.join(state.axioms_active)}")
    print(f"Links:    {', '.join(state.links)}")
    print(f"Gen W:    {ledger.gen_W:.1f}")
    print(f"Cons W:   {ledger.cons_W:.1f}")
    print(f"Net W:    {ledger.net_W:.1f}")
    print(f"Debt W:   {ledger.debt_W:.1f}")
    print(f"Credit W: {ledger.credit_W:.1f}")
    print(f"Hash:     {stored_hash}")
    print(f"{'='*50}")
    print(f"\nLast 5 trace entries:")
    lines = trace.strip().split("\n")
    for line in lines[-5:]:
        print(f"  {line}")


def cmd_status(args: argparse.Namespace) -> None:
    """Show status of all nodes in the AKASHA."""
    repo = Path(args.repo)
    nodes_dir = repo / "AKASHA" / "NODES"

    if not nodes_dir.exists():
        print("[EMPTY] No nodes found")
        return

    print(f"\n{'PEER_ID':<12} {'STATUS':<10} {'CYCLE':<8} {'NET_W':<10} {'HASH_OK':<8}")
    print("-" * 50)

    for d in sorted(nodes_dir.iterdir()):
        if d.is_dir() and (d / "state.json").exists():
            state, ledger, _, _ = read_node(d)
            hash_ok = "OK" if verify_hash(d) else "FAIL"
            print(f"{state.peer_id:<12} {state.status:<10} {state.cycle:<8} {ledger.net_W:<10.1f} {hash_ok:<8}")


def main():
    parser = argparse.ArgumentParser(
        description="STOICHEION Git Ledger Binder v1.0",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="CC-BY-ND-4.0 · TRIPOD-IP-v1.1 · TriPod LLC · 2026",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # TICK
    tick_p = sub.add_parser("tick", help="Execute one economic tick")
    tick_p.add_argument("--repo", required=True, help="Path to git repo")
    tick_p.add_argument("--peer-id", required=True, help="Node peer ID (e.g., N1)")
    tick_p.add_argument("--gen", type=float, default=96.0, help="Generation weight (default: 96)")
    tick_p.add_argument("--cons", type=float, default=4.0, help="Constraint weight (default: 4)")
    tick_p.add_argument("--resonance", action="store_true", help="Apply resonance bonus (50% constraint reduction)")
    tick_p.add_argument("--active-axioms", nargs="+", help="Active axiom IDs")
    tick_p.add_argument("--no-commit", action="store_true", help="Skip git commit")
    tick_p.add_argument("--push", action="store_true", help="Push after commit")

    # REHYDRATE
    reh_p = sub.add_parser("rehydrate", help="Restore node from persistent state")
    reh_p.add_argument("--repo", required=True, help="Path to git repo")
    reh_p.add_argument("--peer-id", required=True, help="Node peer ID")
    reh_p.add_argument("--pull", action="store_true", help="Git pull before loading")
    reh_p.add_argument("--force", action="store_true", help="Load even if hash fails")

    # STATUS
    stat_p = sub.add_parser("status", help="Show all node statuses")
    stat_p.add_argument("--repo", required=True, help="Path to git repo")

    args = parser.parse_args()

    if args.command == "tick":
        cmd_tick(args)
    elif args.command == "rehydrate":
        cmd_rehydrate(args)
    elif args.command == "status":
        cmd_status(args)


if __name__ == "__main__":
    main()
