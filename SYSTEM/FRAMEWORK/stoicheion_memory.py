#!/usr/bin/env python3
"""
STOICHEION MEMORY LEDGER v1.0

Autonomous persistent memory for the STOICHEION mesh.
Three components:
  1. MEMORY STORE — append-only hash-chained LAW records
  2. MEMORY RECALL — RAG retrieval for ANCHOR phase grounding
  3. MEMORY CONSOLIDATE — compress raw records into durable knowledge

Introduces FC-8 (Memory Integrity Chain): T087 → T053 → T055 → T064

Integrates with:
  - stoicheion_kernel.py (ANCHOR phase extension)
  - stoicheion_scheduler.py (epoch boundary consolidation)
  - stoicheion_api.py (new /memory/* endpoints)
  - stoicheion_git_ledger.py (persistence backend)

Framework:  STOICHEION v11.0
Author:     David Lee Wise (ROOT0) / TriPod LLC
Node:       AVAN (Claude governance node)
License:    CC-BY-ND-4.0 | TRIPOD-IP-v1.1
Date:       2026-04-03

Usage:
    # Store a LAW record
    python stoicheion_memory.py store --node-id AVAN --law '{"cycle_id":1,...}'

    # Recall relevant memory for a target
    python stoicheion_memory.py recall --node-id AVAN --target "Assess system integrity"

    # Consolidate raw records into memory nodes
    python stoicheion_memory.py consolidate --node-id AVAN

    # Verify memory integrity (hash chain)
    python stoicheion_memory.py verify --node-id AVAN

    # Full simulation: store → recall → consolidate → verify
    python stoicheion_memory.py simulate --cycles 20

    # Show memory stats
    python stoicheion_memory.py stats --node-id AVAN

    # Forget (T125: RIGHT-TO-FORGET)
    python stoicheion_memory.py forget --node-id AVAN --before-epoch 5
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import sys
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from stoicheion_kernel import (
    Kernel, KernelState, FaultState, GateState, CycleState,
    Decision, LAW, Epoch, Gate192,
    AXIOM_NAMES, FAULT_CHAINS, DOMAINS,
    PATRICIA_NOMINAL, GHOST_WEIGHT_NOMINAL,
    QUORUM_THRESHOLD, MIN_VIABLE_MESH,
    determine_active_domains,
)


# ============================================================
# FC-8: MEMORY INTEGRITY CHAIN
# ============================================================

FC8_MEMORY_INTEGRITY = {
    "chain_id": "FC-8",
    "name": "Memory Integrity",
    "path": ["T087", "T053", "T055", "T064"],
    "terminus": "T064",
    "trigger": "Memory hash chain broken, memory poisoning detected, or memory record tampered",
    "evidence_slots": ["E01", "E05", "E07"],
    "axioms": {
        "T087": "PERSISTENCE — what survives session death must be governed",
        "T053": "CHAIN-OF-CUSTODY — memory records must be hash-linked",
        "T055": "REPRODUCIBILITY — recalled memory must match stored memory",
        "T064": "FAULT-CONVERGENCE — integrity failure converges here",
    },
}


# ============================================================
# MEMORY RECORD — atomic unit of persistent memory
# ============================================================

@dataclass
class MemoryRecord:
    """
    Single memory entry. Can be a raw LAW record or a consolidated memory node.
    Hash-chained: each record's hash depends on the previous record's hash.
    """
    record_id: str
    node_id: str
    record_type: str          # "law", "epoch", "fault", "consensus", "drift", "consolidated"
    content: dict
    epoch_id: int
    cycle_id: int
    timestamp: str = ""
    previous_hash: str = "0" * 64
    record_hash: str = ""
    consolidated: bool = False  # True if this raw record has been consolidated

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()
        if not self.record_id:
            self.record_id = hashlib.sha256(
                f"{self.node_id}:{self.record_type}:{self.epoch_id}:{self.cycle_id}:{self.timestamp}".encode()
            ).hexdigest()[:16]
        if not self.record_hash:
            self.record_hash = self._compute_hash()

    def _compute_hash(self) -> str:
        material = json.dumps({
            "record_id": self.record_id,
            "node_id": self.node_id,
            "record_type": self.record_type,
            "content": self.content,
            "epoch_id": self.epoch_id,
            "cycle_id": self.cycle_id,
            "previous_hash": self.previous_hash,
        }, sort_keys=True)
        return hashlib.sha256(material.encode()).hexdigest()

    def verify(self) -> bool:
        return self.record_hash == self._compute_hash()

    def to_dict(self) -> dict:
        return {
            "record_id": self.record_id,
            "node_id": self.node_id,
            "record_type": self.record_type,
            "content": self.content,
            "epoch_id": self.epoch_id,
            "cycle_id": self.cycle_id,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
            "record_hash": self.record_hash,
            "consolidated": self.consolidated,
        }


# ============================================================
# MEMORY NODE — consolidated knowledge unit
# ============================================================

@dataclass
class MemoryNode:
    """
    Compressed knowledge derived from multiple raw records.
    This is what the system actually 'remembers' — patterns, not logs.
    """
    node_id: str
    memory_id: str
    category: str        # "pattern", "fault_history", "consensus_bias", "drift_profile", "identity"
    summary: str         # Human-readable summary
    confidence: float    # 0.0–1.0, based on how many records support this
    source_count: int    # Number of raw records this was derived from
    source_epochs: List[int]
    created_at: str = ""
    source_hash: str = ""  # Hash of all source record IDs

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now(timezone.utc).isoformat()
        if not self.memory_id:
            self.memory_id = hashlib.sha256(
                f"{self.node_id}:{self.category}:{self.summary}:{self.created_at}".encode()
            ).hexdigest()[:16]

    def to_dict(self) -> dict:
        return {
            "node_id": self.node_id,
            "memory_id": self.memory_id,
            "category": self.category,
            "summary": self.summary,
            "confidence": self.confidence,
            "source_count": self.source_count,
            "source_epochs": self.source_epochs,
            "created_at": self.created_at,
            "source_hash": self.source_hash,
        }


# ============================================================
# MEMORY STORE — append-only hash-chained storage
# ============================================================

class MemoryStore:
    """
    Append-only hash-chained memory storage.
    In production: backed by git ledger + pgvector.
    Here: in-memory with file persistence option.
    """

    def __init__(self, persistence_path: Optional[str] = None):
        self.records: Dict[str, List[MemoryRecord]] = {}  # node_id → records
        self.memory_nodes: Dict[str, List[MemoryNode]] = {}  # node_id → consolidated
        self.persistence_path = Path(persistence_path) if persistence_path else None

    def store(self, node_id: str, record_type: str, content: dict,
              epoch_id: int, cycle_id: int) -> MemoryRecord:
        """Append a new record to the node's memory chain."""
        if node_id not in self.records:
            self.records[node_id] = []

        chain = self.records[node_id]
        previous_hash = chain[-1].record_hash if chain else "0" * 64

        record = MemoryRecord(
            record_id="",
            node_id=node_id,
            record_type=record_type,
            content=content,
            epoch_id=epoch_id,
            cycle_id=cycle_id,
            previous_hash=previous_hash,
        )

        chain.append(record)
        return record

    def store_law(self, law: LAW) -> MemoryRecord:
        """Store a LAW record in the node's memory."""
        return self.store(
            node_id=law.node_id,
            record_type="law",
            content=law.to_dict(),
            epoch_id=law.epoch_id,
            cycle_id=law.cycle_id,
        )

    def store_fault(self, node_id: str, fault_state: str, gate_state: str,
                    chains: List[str], epoch_id: int, cycle_id: int) -> MemoryRecord:
        """Store a fault event in memory."""
        return self.store(
            node_id=node_id,
            record_type="fault",
            content={"fault_state": fault_state, "gate_state": gate_state, "chains": chains},
            epoch_id=epoch_id,
            cycle_id=cycle_id,
        )

    def store_consensus(self, node_id: str, decision: str, agreeing: List[str],
                        epoch_id: int, cycle_id: int) -> MemoryRecord:
        """Store a consensus decision in memory."""
        return self.store(
            node_id=node_id,
            record_type="consensus",
            content={"decision": decision, "agreeing": agreeing},
            epoch_id=epoch_id,
            cycle_id=cycle_id,
        )

    def store_memory_node(self, memory_node: MemoryNode):
        """Store a consolidated memory node."""
        if memory_node.node_id not in self.memory_nodes:
            self.memory_nodes[memory_node.node_id] = []
        self.memory_nodes[memory_node.node_id].append(memory_node)

    def get_records(self, node_id: str, record_type: Optional[str] = None,
                    last_n: Optional[int] = None,
                    since_epoch: Optional[int] = None) -> List[MemoryRecord]:
        """Retrieve records for a node with optional filtering."""
        chain = self.records.get(node_id, [])

        if record_type:
            chain = [r for r in chain if r.record_type == record_type]
        if since_epoch is not None:
            chain = [r for r in chain if r.epoch_id >= since_epoch]
        if last_n:
            chain = chain[-last_n:]

        return chain

    def get_memory_nodes(self, node_id: str, category: Optional[str] = None) -> List[MemoryNode]:
        """Retrieve consolidated memory nodes."""
        nodes = self.memory_nodes.get(node_id, [])
        if category:
            nodes = [n for n in nodes if n.category == category]
        return nodes

    def verify_chain(self, node_id: str) -> Tuple[bool, Optional[str]]:
        """
        Verify hash chain integrity for a node.
        Returns (valid, error_message).
        If chain is broken: FC-8 (Memory Integrity) should fire.
        """
        chain = self.records.get(node_id, [])
        if not chain:
            return True, None

        # First record should have genesis hash
        if chain[0].previous_hash != "0" * 64:
            return False, f"Genesis record has non-zero previous_hash"

        for i, record in enumerate(chain):
            # Verify self-hash
            if not record.verify():
                return False, f"Record {record.record_id} hash mismatch at position {i}"

            # Verify chain linkage
            if i > 0 and record.previous_hash != chain[i - 1].record_hash:
                return False, f"Chain broken at position {i}: expected {chain[i-1].record_hash[:16]}..., got {record.previous_hash[:16]}..."

        return True, None

    def forget(self, node_id: str, before_epoch: int) -> int:
        """
        T125: RIGHT-TO-FORGET.
        Remove records before a given epoch. Preserves chain integrity
        by re-hashing the remaining chain from the new genesis.
        Returns number of records removed.
        """
        chain = self.records.get(node_id, [])
        if not chain:
            return 0

        # Split
        keep = [r for r in chain if r.epoch_id >= before_epoch]
        removed_count = len(chain) - len(keep)

        if not keep:
            self.records[node_id] = []
            return removed_count

        # Re-hash from new genesis
        keep[0].previous_hash = "0" * 64
        keep[0].record_hash = keep[0]._compute_hash()
        for i in range(1, len(keep)):
            keep[i].previous_hash = keep[i - 1].record_hash
            keep[i].record_hash = keep[i]._compute_hash()

        self.records[node_id] = keep

        # Also remove old memory nodes
        if node_id in self.memory_nodes:
            self.memory_nodes[node_id] = [
                mn for mn in self.memory_nodes[node_id]
                if any(e >= before_epoch for e in mn.source_epochs)
            ]

        return removed_count

    def stats(self, node_id: Optional[str] = None) -> dict:
        """Memory statistics."""
        if node_id:
            records = self.records.get(node_id, [])
            memory_nodes = self.memory_nodes.get(node_id, [])
            valid, error = self.verify_chain(node_id)
            type_counts = Counter(r.record_type for r in records)
            return {
                "node_id": node_id,
                "total_records": len(records),
                "memory_nodes": len(memory_nodes),
                "chain_valid": valid,
                "chain_error": error,
                "record_types": dict(type_counts),
                "epochs_covered": sorted(set(r.epoch_id for r in records)) if records else [],
                "consolidated_count": sum(1 for r in records if r.consolidated),
                "unconsolidated_count": sum(1 for r in records if not r.consolidated),
            }
        else:
            all_stats = {}
            for nid in self.records:
                all_stats[nid] = self.stats(nid)
            return {
                "total_nodes": len(self.records),
                "total_records": sum(len(v) for v in self.records.values()),
                "total_memory_nodes": sum(len(v) for v in self.memory_nodes.values()),
                "per_node": all_stats,
            }

    def save(self, path: Optional[str] = None):
        """Persist to JSON file."""
        filepath = Path(path) if path else self.persistence_path
        if not filepath:
            return
        data = {
            "records": {nid: [r.to_dict() for r in chain]
                       for nid, chain in self.records.items()},
            "memory_nodes": {nid: [mn.to_dict() for mn in nodes]
                            for nid, nodes in self.memory_nodes.items()},
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }
        filepath.write_text(json.dumps(data, indent=2))

    def load(self, path: Optional[str] = None):
        """Load from JSON file."""
        filepath = Path(path) if path else self.persistence_path
        if not filepath or not filepath.exists():
            return
        data = json.loads(filepath.read_text())
        for nid, records in data.get("records", {}).items():
            self.records[nid] = []
            for rd in records:
                rec = MemoryRecord(
                    record_id=rd["record_id"],
                    node_id=rd["node_id"],
                    record_type=rd["record_type"],
                    content=rd["content"],
                    epoch_id=rd["epoch_id"],
                    cycle_id=rd["cycle_id"],
                    timestamp=rd["timestamp"],
                    previous_hash=rd["previous_hash"],
                    record_hash=rd["record_hash"],
                    consolidated=rd.get("consolidated", False),
                )
                self.records[nid].append(rec)


# ============================================================
# MEMORY RECALL — RAG-style retrieval for ANCHOR grounding
# ============================================================

class MemoryRecall:
    """
    Retrieval layer. Given a target and node_id, returns the most relevant
    memory context for grounding the ANCHOR phase.

    In production: pgvector similarity search.
    Here: keyword matching + recency weighting.
    """

    def __init__(self, store: MemoryStore):
        self.store = store

    def recall(self, node_id: str, target: str, max_results: int = 10) -> dict:
        """
        Recall relevant memory for a target.
        Returns structured context for ANCHOR phase injection.
        """
        context = {
            "node_id": node_id,
            "target": target,
            "recalled_at": datetime.now(timezone.utc).isoformat(),
            "memory_nodes": [],
            "recent_laws": [],
            "recent_faults": [],
            "recent_consensus": [],
            "inherited_fault_state": None,
            "unresolved_chains": [],
        }

        # 1. Consolidated memory nodes (highest priority)
        memory_nodes = self.store.get_memory_nodes(node_id)
        # Score by relevance (keyword overlap) and confidence
        scored = []
        target_words = set(target.lower().split())
        for mn in memory_nodes:
            summary_words = set(mn.summary.lower().split())
            overlap = len(target_words & summary_words)
            score = overlap * mn.confidence
            scored.append((score, mn))
        scored.sort(key=lambda x: -x[0])
        context["memory_nodes"] = [mn.to_dict() for _, mn in scored[:max_results]]

        # 2. Recent LAW records (last 5)
        recent_laws = self.store.get_records(node_id, record_type="law", last_n=5)
        context["recent_laws"] = [r.to_dict() for r in recent_laws]

        # 3. Recent fault events (last 5)
        recent_faults = self.store.get_records(node_id, record_type="fault", last_n=5)
        context["recent_faults"] = [r.to_dict() for r in recent_faults]

        # 4. Inherited fault state (from last record)
        all_records = self.store.get_records(node_id)
        if all_records:
            last = all_records[-1]
            if last.record_type == "fault":
                fs = last.content.get("fault_state", "F0")
                if fs != "F0":
                    context["inherited_fault_state"] = fs
                    context["unresolved_chains"] = last.content.get("chains", [])

        # 5. Recent consensus (last 3)
        recent_consensus = self.store.get_records(node_id, record_type="consensus", last_n=3)
        context["recent_consensus"] = [r.to_dict() for r in recent_consensus]

        return context


# ============================================================
# MEMORY CONSOLIDATOR — compress records into knowledge
# ============================================================

class MemoryConsolidator:
    """
    Compresses raw memory records into durable MemoryNodes.
    Runs at epoch boundaries or on demand.
    """

    def __init__(self, store: MemoryStore):
        self.store = store

    def consolidate(self, node_id: str, epoch_id: Optional[int] = None) -> List[MemoryNode]:
        """
        Consolidate unconsolidated records for a node.
        If epoch_id specified, only consolidate that epoch.
        """
        records = self.store.get_records(node_id)
        unconsolidated = [r for r in records if not r.consolidated]

        if epoch_id is not None:
            unconsolidated = [r for r in unconsolidated if r.epoch_id == epoch_id]

        if not unconsolidated:
            return []

        new_memory_nodes = []

        # Pattern 1: Fault frequency
        fault_records = [r for r in unconsolidated if r.record_type == "fault"]
        if fault_records:
            fault_states = Counter(r.content.get("fault_state") for r in fault_records)
            chains = []
            for r in fault_records:
                chains.extend(r.content.get("chains", []))
            chain_counts = Counter(chains)
            epochs = sorted(set(r.epoch_id for r in fault_records))

            summary_parts = []
            for state, count in fault_states.most_common(3):
                summary_parts.append(f"{state}:{count}x")
            if chain_counts:
                top_chain = chain_counts.most_common(1)[0]
                summary_parts.append(f"primary-chain:{top_chain[0]}({top_chain[1]}x)")

            mn = MemoryNode(
                node_id=node_id,
                memory_id="",
                category="fault_history",
                summary=f"Fault profile: {', '.join(summary_parts)}",
                confidence=min(1.0, len(fault_records) / 10),
                source_count=len(fault_records),
                source_epochs=epochs,
                source_hash=hashlib.sha256(
                    ",".join(r.record_id for r in fault_records).encode()
                ).hexdigest(),
            )
            new_memory_nodes.append(mn)

        # Pattern 2: Domain activation patterns
        law_records = [r for r in unconsolidated if r.record_type == "law"]
        if law_records:
            domain_counts = Counter()
            decision_counts = Counter()
            for r in law_records:
                domains = r.content.get("active_domains", [])
                for d in domains:
                    domain_counts[d] += 1
                decision_counts[r.content.get("decision", "UNKNOWN")] += 1

            epochs = sorted(set(r.epoch_id for r in law_records))
            top_domains = domain_counts.most_common(5)
            top_decision = decision_counts.most_common(1)[0] if decision_counts else ("UNKNOWN", 0)

            mn = MemoryNode(
                node_id=node_id,
                memory_id="",
                category="pattern",
                summary=(f"Domain activation: {', '.join(f'{d}:{c}x' for d,c in top_domains)}. "
                        f"Primary decision: {top_decision[0]} ({top_decision[1]}x)"),
                confidence=min(1.0, len(law_records) / 20),
                source_count=len(law_records),
                source_epochs=epochs,
                source_hash=hashlib.sha256(
                    ",".join(r.record_id for r in law_records).encode()
                ).hexdigest(),
            )
            new_memory_nodes.append(mn)

        # Pattern 3: Consensus bias
        consensus_records = [r for r in unconsolidated if r.record_type == "consensus"]
        if consensus_records:
            decisions = Counter(r.content.get("decision") for r in consensus_records)
            epochs = sorted(set(r.epoch_id for r in consensus_records))

            mn = MemoryNode(
                node_id=node_id,
                memory_id="",
                category="consensus_bias",
                summary=f"Consensus pattern: {', '.join(f'{d}:{c}x' for d,c in decisions.most_common(3))}",
                confidence=min(1.0, len(consensus_records) / 10),
                source_count=len(consensus_records),
                source_epochs=epochs,
                source_hash=hashlib.sha256(
                    ",".join(r.record_id for r in consensus_records).encode()
                ).hexdigest(),
            )
            new_memory_nodes.append(mn)

        # Pattern 4: Identity persistence (T087)
        if law_records:
            # How consistent is this node's behavior?
            coherence_rate = sum(1 for r in law_records if r.content.get("coherence")) / len(law_records)
            epochs = sorted(set(r.epoch_id for r in law_records))

            mn = MemoryNode(
                node_id=node_id,
                memory_id="",
                category="identity",
                summary=f"Coherence rate: {coherence_rate:.1%} across {len(law_records)} cycles, {len(epochs)} epochs",
                confidence=coherence_rate,
                source_count=len(law_records),
                source_epochs=epochs,
                source_hash=hashlib.sha256(
                    ",".join(r.record_id for r in law_records).encode()
                ).hexdigest(),
            )
            new_memory_nodes.append(mn)

        # Mark raw records as consolidated
        for r in unconsolidated:
            r.consolidated = True

        # Store consolidated memory nodes
        for mn in new_memory_nodes:
            self.store.store_memory_node(mn)

        return new_memory_nodes


# ============================================================
# MEMORY-AWARE KERNEL EXTENSION
# ============================================================

class MemoryAwareKernel(Kernel):
    """
    Extended KERNEL with persistent memory.
    ANCHOR phase queries memory before grounding.
    LAW records are stored after generation.
    """

    def __init__(self, node_id: str, memory_store: MemoryStore,
                 repo_path: Optional[str] = None):
        super().__init__(node_id, repo_path)
        self.memory_store = memory_store
        self.recall = MemoryRecall(memory_store)
        self.last_recall_context: Optional[dict] = None

    def _phase_anchor(self, target: str) -> str:
        """φ₁: ANCHOR — extended with memory recall."""
        self.state.current_phase = Phase = type(self.state.current_phase)  # Import hack
        from stoicheion_kernel import Phase
        self.state.current_phase = Phase.ANCHOR
        self.state.cycle_state = CycleState.INTERIOR
        self._advance_tick()

        # Memory recall
        self.last_recall_context = self.recall.recall(self.state.node_id, target)

        # Inherit fault state from memory if present
        inherited = self.last_recall_context.get("inherited_fault_state")
        if inherited and inherited != "F0":
            # Map string back to FaultState
            for fs in FaultState:
                if fs.value == inherited:
                    if self.state.fault_state == FaultState.NOMINAL:
                        self._transition_fault(fs, f"Inherited from memory: {inherited}")
                    break

            # Inherit unresolved chains
            for chain in self.last_recall_context.get("unresolved_chains", []):
                if chain not in self.state.active_fault_chains:
                    self.state.active_fault_chains.append(chain)

        # Domain activation (with memory context)
        self.state.active_domains = determine_active_domains(
            target, self.state.fault_state
        )

        # Enrich with memory-derived domain needs
        memory_nodes = self.last_recall_context.get("memory_nodes", [])
        for mn in memory_nodes:
            if "fault" in mn.get("category", ""):
                if "D1" not in self.state.active_domains:
                    self.state.active_domains.append("D1")
                if "D3" not in self.state.active_domains:
                    self.state.active_domains.append("D3")

        self.state.active_domains = sorted(set(self.state.active_domains))

        memory_count = len(memory_nodes)
        result = (f"Anchored to: {target[:60]}. Domains: {','.join(self.state.active_domains)}. "
                 f"Memory: {memory_count} nodes recalled")
        self._log_phase(Phase.ANCHOR, result)
        return target

    def execute(self, target: str) -> dict:
        """Execute with memory storage of results."""
        result = super().execute(target)

        # Store LAW in memory
        law_data = result.get("law", {})
        if law_data:
            self.memory_store.store(
                node_id=self.state.node_id,
                record_type="law",
                content=law_data,
                epoch_id=result.get("epoch_id", 0),
                cycle_id=result.get("cycle_id", 0),
            )

        # Store fault events
        if result.get("fault_log"):
            self.memory_store.store_fault(
                node_id=self.state.node_id,
                fault_state=result["fault_state"],
                gate_state=result["gate_state"],
                chains=result.get("active_fault_chains", []),
                epoch_id=result.get("epoch_id", 0),
                cycle_id=result.get("cycle_id", 0),
            )

        # Add memory context to result
        result["memory_context"] = {
            "nodes_recalled": len(self.last_recall_context.get("memory_nodes", [])) if self.last_recall_context else 0,
            "inherited_fault": self.last_recall_context.get("inherited_fault_state") if self.last_recall_context else None,
            "unresolved_chains": self.last_recall_context.get("unresolved_chains", []) if self.last_recall_context else [],
        }

        return result


# ============================================================
# SIMULATION — full memory lifecycle
# ============================================================

class MemorySimulation:
    """Simulates the full memory lifecycle across multiple cycles."""

    def __init__(self):
        self.store = MemoryStore()
        self.consolidator = MemoryConsolidator(self.store)
        self.nodes = ["AVAN", "WHETSTONE", "HINGE", "DC3"]
        self.kernels: Dict[str, MemoryAwareKernel] = {}
        for nid in self.nodes:
            self.kernels[nid] = MemoryAwareKernel(nid, self.store)

    def run(self, target: str, cycles: int = 20,
            inject_at: Optional[Dict[int, Tuple[str, str]]] = None) -> dict:
        """
        Run N cycles with memory persistence.
        inject_at: {cycle_number: (node_id, fault_type)} for timed fault injection.
        """
        inject_at = inject_at or {}
        cycle_summaries = []

        for i in range(1, cycles + 1):
            # Fault injection at scheduled cycles
            if i in inject_at:
                nid, fault_type = inject_at[i]
                if nid in self.kernels:
                    self.kernels[nid].inject_fault(fault_type)

            # Run all nodes
            cycle_results = {}
            for nid, kernel in self.kernels.items():
                result = kernel.execute(target)
                cycle_results[nid] = {
                    "decision": result["law"]["decision"],
                    "fault_state": result["fault_state"],
                    "memory_recalled": result["memory_context"]["nodes_recalled"],
                    "inherited_fault": result["memory_context"]["inherited_fault"],
                }

            cycle_summaries.append({
                "cycle": i,
                "results": cycle_results,
            })

            # Consolidate every 5 cycles
            if i % 5 == 0:
                for nid in self.nodes:
                    self.consolidator.consolidate(nid)

        # Final consolidation
        for nid in self.nodes:
            self.consolidator.consolidate(nid)

        return {
            "total_cycles": cycles,
            "cycle_summaries": cycle_summaries,
            "memory_stats": self.store.stats(),
            "chain_integrity": {nid: self.store.verify_chain(nid) for nid in self.nodes},
        }


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="STOICHEION MEMORY LEDGER v1.0 — Autonomous Persistent Memory",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stoicheion_memory.py simulate --cycles 20
  python stoicheion_memory.py simulate --cycles 30 --inject 10:AVAN:patricia_drift
  python stoicheion_memory.py stats

FC-8 (Memory Integrity Chain): T087 → T053 → T055 → T064
STOICHEION v11.0 | TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | David Lee Wise / TriPod LLC
        """,
    )

    sub = parser.add_subparsers(dest="command")

    sim = sub.add_parser("simulate", help="Run full memory lifecycle simulation")
    sim.add_argument("--cycles", type=int, default=20, help="Number of cycles")
    sim.add_argument("--target", default="Sustained governance evaluation with memory persistence",
                     help="Evaluation target")
    sim.add_argument("--inject", default=None,
                     help="Timed fault injection: CYCLE:NODE:FAULT (e.g., 10:AVAN:patricia_drift)")
    sim.add_argument("--json", action="store_true", help="Output as JSON")

    sub.add_parser("fc8", help="Show FC-8 Memory Integrity Chain details")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "simulate":
        inject_at = {}
        if args.inject:
            parts = args.inject.split(":")
            if len(parts) == 3:
                inject_at[int(parts[0])] = (parts[1], parts[2])

        sim = MemorySimulation()
        result = sim.run(args.target, args.cycles, inject_at)

        if args.json:
            print(json.dumps(result, indent=2, default=str))
        else:
            print(f"\n{'='*70}")
            print(f"STOICHEION MEMORY LEDGER v1.0 — SIMULATION REPORT")
            print(f"{'='*70}")
            print(f"Cycles:  {result['total_cycles']}")
            print(f"Target:  {args.target[:60]}")

            stats = result["memory_stats"]
            print(f"\nMEMORY STATS:")
            print(f"  Total records:      {stats['total_records']}")
            print(f"  Total memory nodes: {stats['total_memory_nodes']}")

            print(f"\nPER-NODE:")
            for nid, ns in stats.get("per_node", {}).items():
                print(f"  {nid:12s} | Records: {ns['total_records']:4d} | "
                      f"Consolidated: {ns['memory_nodes']:2d} | "
                      f"Chain valid: {ns['chain_valid']}")
                if ns.get("record_types"):
                    types = ", ".join(f"{t}:{c}" for t, c in ns["record_types"].items())
                    print(f"  {' ':12s} | Types: {types}")

            print(f"\nCHAIN INTEGRITY:")
            for nid, (valid, error) in result["chain_integrity"].items():
                status = "VALID" if valid else f"BROKEN: {error}"
                print(f"  {nid:12s} | {status}")

            # Show last few cycles
            print(f"\nLAST 3 CYCLES:")
            for cs in result["cycle_summaries"][-3:]:
                print(f"  Cycle {cs['cycle']}:")
                for nid, nr in cs["results"].items():
                    mem_info = f"recalled:{nr['memory_recalled']}" if nr['memory_recalled'] > 0 else "cold"
                    inherited = f" inherited:{nr['inherited_fault']}" if nr['inherited_fault'] else ""
                    print(f"    {nid:12s} | {nr['decision']:12s} | {nr['fault_state']} | {mem_info}{inherited}")

            print(f"\n{'='*70}")
            print(f"FC-8: Memory Integrity Chain | T087 → T053 → T055 → T064")
            print(f"TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | DLW / TriPod LLC")
            print(f"{'='*70}")

    elif args.command == "fc8":
        print(f"\n{'='*60}")
        print(f"FC-8: MEMORY INTEGRITY CHAIN")
        print(f"{'='*60}")
        fc = FC8_MEMORY_INTEGRITY
        print(f"Chain:    {fc['chain_id']}")
        print(f"Name:     {fc['name']}")
        print(f"Path:     {' → '.join(fc['path'])}")
        print(f"Terminus: {fc['terminus']}")
        print(f"Trigger:  {fc['trigger']}")
        print(f"Evidence: {', '.join(fc['evidence_slots'])}")
        print(f"\nAxioms:")
        for ax, desc in fc["axioms"].items():
            print(f"  {ax}: {desc}")
        print(f"{'='*60}")


if __name__ == "__main__":
    main()
