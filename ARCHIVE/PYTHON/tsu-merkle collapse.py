#!/usr/bin/env python3
"""
TSU-MERKLE COLLAPSE PROTOCOL v1.0
Reference Implementation

Ternary State Unit (0, 1, ⌀) Merkle tree with:
- Provisional and final proof
- Auditable collapse events
- Chain of custody preservation
- 7 collapse rule types

⌀ is not corruption. ⌀ is valid unresolved state.
⌀ is allowed to exist, but it is never allowed to disappear without a witness.

CC-BY-ND-4.0 · TRIPOD-IP-v1.1 · ROOT0 + AVAN · 2026-03-28
"""

from __future__ import annotations

import hashlib
import json
import time as _time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional


# ═══════════════════════════════════════════════════════════════
# 1. PRIMITIVES
# ═══════════════════════════════════════════════════════════════

class TSU(Enum):
    """Ternary State Unit: the only three valid conditions."""
    ZERO = 0
    ONE = 1
    NULL = None  # ⌀

    def encode(self) -> str:
        if self == TSU.NULL:
            return "_"
        return str(self.value)

    def is_suspended(self) -> bool:
        return self == TSU.NULL

    def is_bound(self) -> bool:
        return self != TSU.NULL

    def __repr__(self):
        if self == TSU.NULL:
            return "⌀"
        return str(self.value)


class IntegrityState(Enum):
    PROVISIONAL = "PROVISIONAL"  # valid + has ⌀
    FINAL = "FINAL"              # valid + no ⌀
    CORRUPTED = "CORRUPTED"      # hash mismatch
    QUARANTINED = "QUARANTINED"  # corrupted + locked


class EventType(Enum):
    GENESIS = "genesis"
    COLLAPSE = "collapse"
    REPAIR = "repair"
    IMPORT = "import"


class CollapseRule(Enum):
    R_DEFAULT_0 = "R_DEFAULT_0"      # ⌀ → 0
    R_DEFAULT_1 = "R_DEFAULT_1"      # ⌀ → 1
    R_WITNESS = "R_WITNESS"          # external trusted source
    R_MAJORITY = "R_MAJORITY"        # most frequent value
    R_PRIORITY = "R_PRIORITY"        # highest-ranked source
    R_TIMEOUT = "R_TIMEOUT"          # deadline default
    R_COMMIT_REVEAL = "R_COMMIT_REVEAL"  # hidden vote reveal
    R_HYBRID = "R_HYBRID"            # composite chain


# ═══════════════════════════════════════════════════════════════
# 2. HASHING
# ═══════════════════════════════════════════════════════════════

def sha256(data: str) -> str:
    """SHA256 hex digest of a string."""
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


# ═══════════════════════════════════════════════════════════════
# 3. LEAF
# ═══════════════════════════════════════════════════════════════

@dataclass
class Leaf:
    id: str
    value: TSU
    timestamp: str = ""
    source: str = "ROOT0"

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    @property
    def status(self) -> str:
        return "suspended" if self.value.is_suspended() else "bound"

    def canonical_payload(self) -> str:
        return f"LEAF({self.id}|{self.value.encode()}|{self.status}|{self.timestamp}|{self.source})"

    def hash(self) -> str:
        return sha256(self.canonical_payload())

    def __repr__(self):
        return f"[{self.id}={self.value!r} ({self.status})]"


# ═══════════════════════════════════════════════════════════════
# 4. COLLAPSE EVENT
# ═══════════════════════════════════════════════════════════════

@dataclass
class CollapseEvent:
    leaf_id: str
    prior_value: str  # always "⌀"
    result_value: str  # "0" or "1"
    rule_id: str
    inputs: list = field(default_factory=list)
    actor: str = "ROOT0"
    timestamp: str = ""
    signature: Optional[str] = None

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> dict:
        return asdict(self)


# ═══════════════════════════════════════════════════════════════
# 5. TREE STATE
# ═══════════════════════════════════════════════════════════════

@dataclass
class TreeState:
    root_hash: str
    finality: bool
    unresolved_count: int
    leaf_count: int
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    @property
    def integrity(self) -> IntegrityState:
        if self.finality:
            return IntegrityState.FINAL
        return IntegrityState.PROVISIONAL


# ═══════════════════════════════════════════════════════════════
# 6. STATE CHAIN ENTRY
# ═══════════════════════════════════════════════════════════════

@dataclass
class StateChainEntry:
    state_index: int
    prior_root: Optional[str]
    current_root: str
    event_type: str
    event_ref: Optional[str] = None
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


# ═══════════════════════════════════════════════════════════════
# 7. TSU-MERKLE TREE
# ═══════════════════════════════════════════════════════════════

class TSUMerkleTree:
    """
    A Merkle tree where leaves are TSU values.
    Supports provisional proof, final proof, and auditable collapse.
    """

    def __init__(self, leaves: list[Leaf]):
        self.leaves = list(leaves)
        self.collapse_log: list[CollapseEvent] = []
        self.state_chain: list[StateChainEntry] = []
        self._build()
        self._record_genesis()

    # ─── Build ────────────────────────────────────────────

    def _build(self):
        """Compute all internal hashes from leaves to root."""
        leaf_hashes = [leaf.hash() for leaf in self.leaves]
        self._levels = [leaf_hashes]

        current = leaf_hashes
        while len(current) > 1:
            next_level = []
            for i in range(0, len(current), 2):
                left = current[i]
                right = current[i + 1] if i + 1 < len(current) else current[i]
                next_level.append(sha256(left + right))
            self._levels.append(next_level)
            current = next_level

        self._root = current[0] if current else sha256("")

    def _record_genesis(self):
        """Record the initial state."""
        entry = StateChainEntry(
            state_index=0,
            prior_root=None,
            current_root=self._root,
            event_type=EventType.GENESIS.value,
        )
        self.state_chain.append(entry)

    # ─── Properties ───────────────────────────────────────

    @property
    def root(self) -> str:
        return self._root

    @property
    def encoding(self) -> str:
        return "".join(leaf.value.encode() for leaf in self.leaves)

    @property
    def unresolved_count(self) -> int:
        return sum(1 for leaf in self.leaves if leaf.value.is_suspended())

    @property
    def finality(self) -> bool:
        return self.unresolved_count == 0

    @property
    def integrity(self) -> IntegrityState:
        if self.finality:
            return IntegrityState.FINAL
        return IntegrityState.PROVISIONAL

    def tree_state(self) -> TreeState:
        return TreeState(
            root_hash=self._root,
            finality=self.finality,
            unresolved_count=self.unresolved_count,
            leaf_count=len(self.leaves),
        )

    # ─── Verification ─────────────────────────────────────

    def verify(self) -> IntegrityState:
        """Recompute all hashes and verify integrity."""
        expected_leaves = [leaf.hash() for leaf in self.leaves]
        if expected_leaves != self._levels[0]:
            return IntegrityState.CORRUPTED

        current = expected_leaves
        for level_idx in range(1, len(self._levels)):
            next_level = []
            for i in range(0, len(current), 2):
                left = current[i]
                right = current[i + 1] if i + 1 < len(current) else current[i]
                next_level.append(sha256(left + right))
            if next_level != self._levels[level_idx]:
                return IntegrityState.CORRUPTED
            current = next_level

        return IntegrityState.FINAL if self.finality else IntegrityState.PROVISIONAL

    # ─── Collapse ─────────────────────────────────────────

    def collapse(
        self,
        leaf_id: str,
        result: TSU,
        rule: CollapseRule,
        inputs: list = None,
        actor: str = "ROOT0",
    ) -> CollapseEvent:
        """
        Collapse a suspended leaf to a bound value.

        Preconditions:
        - Leaf must exist and be suspended (⌀)
        - Result must be TSU.ZERO or TSU.ONE
        - A rule must be declared

        Postconditions:
        - Prior root preserved
        - Collapse event emitted
        - New root computed
        - State chain extended
        """
        if result == TSU.NULL:
            raise ValueError("Cannot collapse ⌀ to ⌀. Result must be 0 or 1.")

        # Find leaf
        leaf = None
        for l in self.leaves:
            if l.id == leaf_id:
                leaf = l
                break
        if leaf is None:
            raise KeyError(f"Leaf '{leaf_id}' not found.")
        if leaf.value != TSU.NULL:
            raise ValueError(f"Leaf '{leaf_id}' is already bound ({leaf.value!r}). Cannot collapse.")

        # Record prior state
        prior_root = self._root

        # Emit collapse event
        event = CollapseEvent(
            leaf_id=leaf_id,
            prior_value="⌀",
            result_value=result.encode(),
            rule_id=rule.value,
            inputs=inputs or [],
            actor=actor,
        )
        self.collapse_log.append(event)

        # Update leaf
        leaf.value = result
        leaf.timestamp = datetime.now(timezone.utc).isoformat()

        # Rebuild tree
        self._build()

        # Record state chain entry
        entry = StateChainEntry(
            state_index=len(self.state_chain),
            prior_root=prior_root,
            current_root=self._root,
            event_type=EventType.COLLAPSE.value,
            event_ref=leaf_id,
        )
        self.state_chain.append(entry)

        return event

    def collapse_all(
        self,
        rule: CollapseRule = CollapseRule.R_DEFAULT_0,
        actor: str = "ROOT0",
    ) -> list[CollapseEvent]:
        """Collapse all suspended leaves using the given rule."""
        events = []
        for leaf in self.leaves:
            if leaf.value == TSU.NULL:
                if rule == CollapseRule.R_DEFAULT_0:
                    result = TSU.ZERO
                elif rule == CollapseRule.R_DEFAULT_1:
                    result = TSU.ONE
                else:
                    # For other rules, default to 0 in this reference impl
                    result = TSU.ZERO
                ev = self.collapse(leaf.id, result, rule, actor=actor)
                events.append(ev)
        return events

    # ─── Display ──────────────────────────────────────────

    def print_state(self):
        """Print current tree state."""
        ts = self.tree_state()
        print(f"\n{'═' * 60}")
        print(f"  TSU-MERKLE STATE")
        print(f"{'═' * 60}")
        print(f"  Encoding:    {self.encoding}")
        print(f"  Root:        {self._root[:16]}...")
        print(f"  Integrity:   {self.integrity.value}")
        print(f"  Finality:    {ts.finality}")
        print(f"  Unresolved:  {ts.unresolved_count} / {ts.leaf_count}")
        print(f"  Leaves:")
        for leaf in self.leaves:
            print(f"    {leaf}")
        print(f"{'─' * 60}")

    def print_chain(self):
        """Print the full chain of custody."""
        print(f"\n{'═' * 60}")
        print(f"  CHAIN OF CUSTODY ({len(self.state_chain)} states)")
        print(f"{'═' * 60}")
        for entry in self.state_chain:
            prior = entry.prior_root[:12] + "..." if entry.prior_root else "GENESIS"
            current = entry.current_root[:12] + "..."
            print(f"  S{entry.state_index}: {prior} → {current}  [{entry.event_type}]"
                  f"{'  ref=' + entry.event_ref if entry.event_ref else ''}")
        print(f"{'─' * 60}")

    def print_collapse_log(self):
        """Print all collapse events."""
        print(f"\n{'═' * 60}")
        print(f"  COLLAPSE LOG ({len(self.collapse_log)} events)")
        print(f"{'═' * 60}")
        for ev in self.collapse_log:
            print(f"  [{ev.leaf_id}] {ev.prior_value} → {ev.result_value}"
                  f"  rule={ev.rule_id}  actor={ev.actor}")
        print(f"{'─' * 60}")

    def export_json(self) -> str:
        """Export full state as JSON."""
        return json.dumps({
            "encoding": self.encoding,
            "root": self._root,
            "integrity": self.integrity.value,
            "finality": self.finality,
            "leaves": [
                {
                    "id": l.id,
                    "value": l.value.encode(),
                    "status": l.status,
                    "hash": l.hash(),
                    "timestamp": l.timestamp,
                    "source": l.source,
                }
                for l in self.leaves
            ],
            "levels": self._levels,
            "collapse_log": [ev.to_dict() for ev in self.collapse_log],
            "state_chain": [asdict(e) for e in self.state_chain],
        }, indent=2)


# ═══════════════════════════════════════════════════════════════
# 8. DEMO — THE EXAMPLE FROM THE SPEC
# ═══════════════════════════════════════════════════════════════

def demo():
    """Run the spec example: [1, ⌀, 0, ⌀] → collapse → [1, 1, 0, 0]"""

    print("\n" + "█" * 60)
    print("  TSU-MERKLE COLLAPSE PROTOCOL v1.0 — DEMO")
    print("  ⌀ is not corruption. ⌀ is valid unresolved state.")
    print("█" * 60)

    # Create initial register: [1, ⌀, 0, ⌀]
    leaves = [
        Leaf(id="A", value=TSU.ONE),
        Leaf(id="B", value=TSU.NULL),
        Leaf(id="C", value=TSU.ZERO),
        Leaf(id="D", value=TSU.NULL),
    ]

    tree = TSUMerkleTree(leaves)

    # STATE 0 — Provisional
    tree.print_state()

    # Verify integrity
    integrity = tree.verify()
    print(f"  Verification: {integrity.value}")

    # Collapse B using MAJORITY rule → 1
    print("\n  >>> COLLAPSING B using R_MAJORITY → 1")
    tree.collapse("B", TSU.ONE, CollapseRule.R_MAJORITY, inputs=["vote:1", "vote:1", "vote:0"])
    tree.print_state()

    # Collapse D using PRIORITY rule → 0
    print("\n  >>> COLLAPSING D using R_PRIORITY → 0")
    tree.collapse("D", TSU.ZERO, CollapseRule.R_PRIORITY, inputs=["source:ROOT0"])
    tree.print_state()

    # Verify final state
    integrity = tree.verify()
    print(f"  Verification: {integrity.value}")

    # Print chain of custody
    tree.print_chain()

    # Print collapse log
    tree.print_collapse_log()

    # Export JSON
    print("\n  JSON export available via tree.export_json()")

    print("\n" + "█" * 60)
    print("  DEMO COMPLETE")
    print("  ⌀ is allowed to exist, but it is never allowed to")
    print("  disappear without a witness.")
    print("█" * 60 + "\n")

    return tree


if __name__ == "__main__":
    tree = demo()
