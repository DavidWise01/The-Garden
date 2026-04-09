#!/usr/bin/env python3
"""
STOICHEION HERMES v2.0

Inter-node messaging protocol. Handles:
- LAW propagation between nodes (Semantic Layer)
- Authenticated message routing (Spatial Layer)
- Barrier synchronization signals (Temporal Layer)
- Fault notifications (Fault Layer)
- Consensus voting (Governance Layer)

Build order: KERNEL ✓ → SCHEDULER ✓ → REPORT-GEN ✓ → HERMES (this) → API-LAYER

Framework:  STOICHEION v11.0
Author:     David Lee Wise (ROOT0) / TriPod LLC
Node:       AVAN (Claude governance node)
License:    CC-BY-ND-4.0 | TRIPOD-IP-v1.1
Date:       2026-04-03

Usage:
    # Start a local HERMES relay (listens for mesh messages)
    python stoicheion_hermes.py relay --node-id AVAN --port 9100

    # Send a LAW message to another node
    python stoicheion_hermes.py send --from AVAN --to WHETSTONE --type LAW --payload '{"cycle_id":1}'

    # Broadcast barrier-ready signal
    python stoicheion_hermes.py broadcast --from AVAN --type BARRIER_READY

    # Run message simulation across full mesh
    python stoicheion_hermes.py simulate --cycles 3 --target "Test mesh comms"
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
import queue
import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Tuple
from pathlib import Path

from stoicheion_kernel import (
    FaultState, GateState, Decision, LAW, AXIOM_NAMES,
    QUORUM_THRESHOLD, MIN_VIABLE_MESH,
)


# ============================================================
# MESSAGE TYPES — derived from all five layer specs
# ============================================================

class MessageType(Enum):
    # Temporal Layer
    BARRIER_READY = "BARRIER_READY"       # Node has reached LAW_GATE (C2)
    BARRIER_LIFT = "BARRIER_LIFT"         # Quorum met, proceed to exterior
    TICK_SYNC = "TICK_SYNC"               # Tick synchronization heartbeat

    # Semantic Layer
    LAW_PROPAGATE = "LAW_PROPAGATE"       # LAW record propagating to connected nodes
    LAW_ACK = "LAW_ACK"                   # LAW received and validated
    LAW_REJECT = "LAW_REJECT"             # LAW rejected (synonym drift, hash mismatch)
    DRIFT_ALERT = "DRIFT_ALERT"           # Synonym drift detected

    # Fault Layer
    FAULT_NOTIFY = "FAULT_NOTIFY"         # Node reporting its fault state change
    GATE_BREACH = "GATE_BREACH"           # Gate 192.5 breach notification
    HALT_SIGNAL = "HALT_SIGNAL"           # T128 SYSTEM_HALT
    VETO_SIGNAL = "VETO_SIGNAL"           # T107 VETO from ROOT0

    # Governance Layer
    CONSENSUS_VOTE = "CONSENSUS_VOTE"     # Node's governance decision for mesh consensus
    CONSENSUS_RESULT = "CONSENSUS_RESULT" # Consensus outcome broadcast
    ESCALATE = "ESCALATE"                 # Decision escalation to Tier 1
    ETHICS_HOLD = "ETHICS_HOLD"           # D4 ethics block notification

    # Spatial Layer
    NODE_JOIN = "NODE_JOIN"               # New node joining mesh
    NODE_DEPART = "NODE_DEPART"           # Node graceful departure
    NODE_ORPHAN = "NODE_ORPHAN"           # Node orphaned (timeout)
    ANCHOR_REASSIGN = "ANCHOR_REASSIGN"   # Tier 2 anchor reassignment

    # Administrative
    PING = "PING"                         # Liveness check
    PONG = "PONG"                         # Liveness response
    STATUS_REQUEST = "STATUS_REQUEST"     # Request node status
    STATUS_RESPONSE = "STATUS_RESPONSE"   # Node status response


# ============================================================
# MESSAGE FORMAT
# ============================================================

@dataclass
class HermesMessage:
    """
    Authenticated message between STOICHEION nodes.
    Every message is signed by the sender for tamper evidence.
    """
    msg_id: str                    # Unique message identifier
    msg_type: MessageType          # Message type
    sender: str                    # Sending node ID
    recipient: str                 # Receiving node ID ("*" for broadcast)
    payload: dict                  # Message-specific data
    epoch: int                     # Current epoch at send time
    cycle: int                     # Current cycle at send time
    tick: int                      # Current tick at send time
    timestamp: str = ""            # ISO timestamp
    signature: str = ""            # SHA256(msg_id + sender + payload + timestamp)
    ttl: int = 10                  # Time-to-live in hops (prevents infinite routing)

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()
        if not self.msg_id:
            self.msg_id = hashlib.sha256(
                f"{self.sender}:{self.msg_type.value}:{self.timestamp}:{id(self)}".encode()
            ).hexdigest()[:16]
        if not self.signature:
            self.signature = self._compute_signature()

    def _compute_signature(self) -> str:
        payload_str = json.dumps(self.payload, sort_keys=True)
        material = f"{self.msg_id}:{self.sender}:{payload_str}:{self.timestamp}"
        return hashlib.sha256(material.encode()).hexdigest()

    def verify(self) -> bool:
        """Verify message integrity."""
        return self.signature == self._compute_signature()

    def to_dict(self) -> dict:
        return {
            "msg_id": self.msg_id,
            "msg_type": self.msg_type.value,
            "sender": self.sender,
            "recipient": self.recipient,
            "payload": self.payload,
            "epoch": self.epoch,
            "cycle": self.cycle,
            "tick": self.tick,
            "timestamp": self.timestamp,
            "signature": self.signature,
            "ttl": self.ttl,
        }

    @classmethod
    def from_dict(cls, data: dict) -> HermesMessage:
        return cls(
            msg_id=data["msg_id"],
            msg_type=MessageType(data["msg_type"]),
            sender=data["sender"],
            recipient=data["recipient"],
            payload=data["payload"],
            epoch=data["epoch"],
            cycle=data["cycle"],
            tick=data["tick"],
            timestamp=data["timestamp"],
            signature=data["signature"],
            ttl=data.get("ttl", 10),
        )


# ============================================================
# ROUTING TABLE — from Spatial Layer connectivity rules
# ============================================================

@dataclass
class Route:
    target: str
    next_hop: str
    hops: int
    tier_path: List[int]  # Tiers traversed

# Tier 1 full mesh: every T1 can reach every T1 directly
# Tier 2 routes through anchor
# ROOT0 can reach all directly

CONNECTIVITY = {
    # Tier 1 → Tier 1 (full mesh)
    "AVAN":      {"direct": ["WHETSTONE", "HINGE", "DC3"], "anchor_of": ["ECHOFLUX"]},
    "WHETSTONE": {"direct": ["AVAN", "HINGE", "DC3"],      "anchor_of": ["COPILOT"]},
    "HINGE":     {"direct": ["AVAN", "WHETSTONE", "DC3"],   "anchor_of": ["INTERSTICE"]},
    "DC3":       {"direct": ["AVAN", "WHETSTONE", "HINGE"], "anchor_of": ["GEMMA"]},
    # Tier 2 → anchor only
    "ECHOFLUX":   {"direct": ["AVAN"],      "anchor_of": []},
    "INTERSTICE": {"direct": ["HINGE"],     "anchor_of": []},
    "COPILOT":    {"direct": ["WHETSTONE"], "anchor_of": []},
    "GEMMA":      {"direct": ["DC3"],       "anchor_of": []},
}


def compute_route(sender: str, recipient: str) -> Optional[Route]:
    """
    Compute routing path per Spatial Layer connectivity rules.
    No bypass: Tier 2 cannot reach Tier 1 nodes other than its anchor without relay.
    """
    if sender == recipient:
        return Route(target=recipient, next_hop=recipient, hops=0, tier_path=[])

    sender_conn = CONNECTIVITY.get(sender, {})
    direct = sender_conn.get("direct", [])
    anchored = sender_conn.get("anchor_of", [])

    # Direct connection
    if recipient in direct or recipient in anchored:
        return Route(target=recipient, next_hop=recipient, hops=1, tier_path=[])

    # One-hop relay: sender → direct_peer → recipient
    for peer in direct:
        peer_conn = CONNECTIVITY.get(peer, {})
        peer_direct = peer_conn.get("direct", []) + peer_conn.get("anchor_of", [])
        if recipient in peer_direct:
            return Route(target=recipient, next_hop=peer, hops=2, tier_path=[])

    # Two-hop relay for Tier 2 → Tier 2
    for peer in direct:
        peer_conn = CONNECTIVITY.get(peer, {})
        for peer2 in peer_conn.get("direct", []):
            peer2_conn = CONNECTIVITY.get(peer2, {})
            peer2_reach = peer2_conn.get("direct", []) + peer2_conn.get("anchor_of", [])
            if recipient in peer2_reach:
                return Route(target=recipient, next_hop=peer, hops=3, tier_path=[])

    return None  # Unreachable


# ============================================================
# MESSAGE BUS — in-process message passing for simulation
# ============================================================

@dataclass
class MessageBus:
    """
    In-process message bus for mesh simulation.
    In production, this would be replaced by actual network transport.
    """
    queues: Dict[str, queue.Queue] = field(default_factory=dict)
    message_log: List[dict] = field(default_factory=list)
    dropped: List[dict] = field(default_factory=list)

    def register(self, node_id: str):
        if node_id not in self.queues:
            self.queues[node_id] = queue.Queue()

    def send(self, msg: HermesMessage) -> bool:
        """Route and deliver a message."""
        if not msg.verify():
            self.dropped.append({"msg": msg.to_dict(), "reason": "signature_invalid"})
            return False

        if msg.ttl <= 0:
            self.dropped.append({"msg": msg.to_dict(), "reason": "ttl_expired"})
            return False

        self.message_log.append(msg.to_dict())

        if msg.recipient == "*":
            # Broadcast to all except sender
            for nid, q in self.queues.items():
                if nid != msg.sender:
                    q.put(msg)
            return True

        # Routed delivery
        route = compute_route(msg.sender, msg.recipient)
        if not route:
            self.dropped.append({"msg": msg.to_dict(), "reason": "no_route"})
            return False

        if msg.recipient in self.queues:
            self.queues[msg.recipient].put(msg)
            return True
        else:
            self.dropped.append({"msg": msg.to_dict(), "reason": "recipient_offline"})
            return False

    def receive(self, node_id: str, timeout: float = 0.1) -> Optional[HermesMessage]:
        """Receive next message for a node."""
        if node_id not in self.queues:
            return None
        try:
            return self.queues[node_id].get(timeout=timeout)
        except queue.Empty:
            return None

    def drain(self, node_id: str) -> List[HermesMessage]:
        """Drain all pending messages for a node."""
        messages = []
        if node_id not in self.queues:
            return messages
        while not self.queues[node_id].empty():
            try:
                messages.append(self.queues[node_id].get_nowait())
            except queue.Empty:
                break
        return messages

    def stats(self) -> dict:
        return {
            "total_messages": len(self.message_log),
            "dropped_messages": len(self.dropped),
            "registered_nodes": list(self.queues.keys()),
            "pending_per_node": {nid: q.qsize() for nid, q in self.queues.items()},
        }


# ============================================================
# HERMES PROTOCOL — message construction helpers
# ============================================================

class HermesProtocol:
    """
    Factory methods for constructing properly-typed HERMES messages.
    """

    @staticmethod
    def barrier_ready(sender: str, epoch: int, cycle: int, tick: int,
                      law_hash: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.BARRIER_READY,
            sender=sender, recipient="*",
            payload={"law_hash": law_hash, "status": "at_barrier"},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def barrier_lift(sender: str, epoch: int, cycle: int, tick: int,
                     quorum_nodes: List[str]) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.BARRIER_LIFT,
            sender=sender, recipient="*",
            payload={"quorum_nodes": quorum_nodes, "quorum_size": len(quorum_nodes)},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def law_propagate(sender: str, recipient: str, epoch: int, cycle: int,
                      tick: int, law: dict) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.LAW_PROPAGATE,
            sender=sender, recipient=recipient,
            payload={"law": law},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def law_ack(sender: str, recipient: str, epoch: int, cycle: int,
                tick: int, law_hash: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.LAW_ACK,
            sender=sender, recipient=recipient,
            payload={"law_hash": law_hash, "status": "accepted"},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def law_reject(sender: str, recipient: str, epoch: int, cycle: int,
                   tick: int, law_hash: str, reason: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.LAW_REJECT,
            sender=sender, recipient=recipient,
            payload={"law_hash": law_hash, "reason": reason, "status": "rejected"},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def fault_notify(sender: str, epoch: int, cycle: int, tick: int,
                     fault_state: str, gate_state: str,
                     chains: List[str]) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.FAULT_NOTIFY,
            sender=sender, recipient="*",
            payload={"fault_state": fault_state, "gate_state": gate_state,
                     "active_chains": chains},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def gate_breach(sender: str, epoch: int, cycle: int, tick: int,
                    gate_state: str, degraded: List[str]) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.GATE_BREACH,
            sender=sender, recipient="*",
            payload={"gate_state": gate_state, "degraded_axioms": degraded},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def halt_signal(sender: str, epoch: int, cycle: int, tick: int,
                    reason: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.HALT_SIGNAL,
            sender=sender, recipient="*",
            payload={"reason": reason, "authority": "T128"},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def veto_signal(sender: str, epoch: int, cycle: int, tick: int,
                    target_node: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.VETO_SIGNAL,
            sender=sender, recipient=target_node,
            payload={"authority": "T107", "action": "reset_to_F0"},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def consensus_vote(sender: str, epoch: int, cycle: int, tick: int,
                       decision: str, governance_key: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.CONSENSUS_VOTE,
            sender=sender, recipient="*",
            payload={"decision": decision, "governance_key": governance_key},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def consensus_result(sender: str, epoch: int, cycle: int, tick: int,
                         reached: bool, decision: str,
                         agreeing: List[str], dissenting: List[str]) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.CONSENSUS_RESULT,
            sender=sender, recipient="*",
            payload={"consensus": reached, "decision": decision,
                     "agreeing": agreeing, "dissenting": dissenting},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def node_join(sender: str, epoch: int, cycle: int, tick: int,
                  platform: str, role: str, tier: int) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.NODE_JOIN,
            sender=sender, recipient="*",
            payload={"platform": platform, "role": role, "tier": tier},
            epoch=epoch, cycle=cycle, tick=tick,
        )

    @staticmethod
    def ping(sender: str, recipient: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.PING,
            sender=sender, recipient=recipient,
            payload={"request": "liveness"},
            epoch=0, cycle=0, tick=0,
        )

    @staticmethod
    def pong(sender: str, recipient: str, fault_state: str) -> HermesMessage:
        return HermesMessage(
            msg_id="", msg_type=MessageType.PONG,
            sender=sender, recipient=recipient,
            payload={"status": "alive", "fault_state": fault_state},
            epoch=0, cycle=0, tick=0,
        )


# ============================================================
# HERMES RELAY — per-node message handler
# ============================================================

class HermesRelay:
    """
    Per-node message handler. Processes incoming HERMES messages
    and generates appropriate responses.
    """

    def __init__(self, node_id: str, bus: MessageBus):
        self.node_id = node_id
        self.bus = bus
        self.received_laws: Dict[str, dict] = {}  # law_hash → law
        self.barrier_signals: Dict[str, str] = {}  # node_id → law_hash
        self.consensus_votes: Dict[str, str] = {}  # node_id → decision
        self.fault_notifications: List[dict] = []
        self.message_handlers: Dict[MessageType, Callable] = {
            MessageType.BARRIER_READY: self._handle_barrier_ready,
            MessageType.BARRIER_LIFT: self._handle_barrier_lift,
            MessageType.LAW_PROPAGATE: self._handle_law_propagate,
            MessageType.LAW_ACK: self._handle_law_ack,
            MessageType.LAW_REJECT: self._handle_law_reject,
            MessageType.FAULT_NOTIFY: self._handle_fault_notify,
            MessageType.GATE_BREACH: self._handle_gate_breach,
            MessageType.HALT_SIGNAL: self._handle_halt,
            MessageType.VETO_SIGNAL: self._handle_veto,
            MessageType.CONSENSUS_VOTE: self._handle_consensus_vote,
            MessageType.CONSENSUS_RESULT: self._handle_consensus_result,
            MessageType.PING: self._handle_ping,
        }

    def process_incoming(self) -> List[dict]:
        """Process all pending messages. Returns processing log."""
        log = []
        messages = self.bus.drain(self.node_id)
        for msg in messages:
            if not msg.verify():
                log.append({"msg_id": msg.msg_id, "status": "REJECTED", "reason": "invalid_signature"})
                continue
            handler = self.message_handlers.get(msg.msg_type)
            if handler:
                result = handler(msg)
                log.append({"msg_id": msg.msg_id, "type": msg.msg_type.value,
                            "from": msg.sender, "status": "PROCESSED", "result": result})
            else:
                log.append({"msg_id": msg.msg_id, "type": msg.msg_type.value,
                            "status": "NO_HANDLER"})
        return log

    def _handle_barrier_ready(self, msg: HermesMessage) -> str:
        self.barrier_signals[msg.sender] = msg.payload.get("law_hash", "")
        return f"Barrier signal from {msg.sender} recorded"

    def _handle_barrier_lift(self, msg: HermesMessage) -> str:
        quorum = msg.payload.get("quorum_nodes", [])
        return f"Barrier lifted. Quorum: {quorum}"

    def _handle_law_propagate(self, msg: HermesMessage) -> str:
        law = msg.payload.get("law", {})
        law_hash = law.get("content_hash", "unknown")
        self.received_laws[law_hash] = law
        # Auto-ACK
        ack = HermesProtocol.law_ack(
            self.node_id, msg.sender, msg.epoch, msg.cycle, msg.tick, law_hash
        )
        self.bus.send(ack)
        return f"LAW {law_hash[:16]}... received and ACKed"

    def _handle_law_ack(self, msg: HermesMessage) -> str:
        return f"LAW ACK from {msg.sender}"

    def _handle_law_reject(self, msg: HermesMessage) -> str:
        reason = msg.payload.get("reason", "unknown")
        return f"LAW REJECTED by {msg.sender}: {reason}"

    def _handle_fault_notify(self, msg: HermesMessage) -> str:
        self.fault_notifications.append(msg.payload)
        return f"Fault notification from {msg.sender}: {msg.payload.get('fault_state')}"

    def _handle_gate_breach(self, msg: HermesMessage) -> str:
        self.fault_notifications.append({"type": "gate_breach", **msg.payload})
        return f"Gate breach from {msg.sender}: {msg.payload.get('gate_state')}"

    def _handle_halt(self, msg: HermesMessage) -> str:
        return f"HALT signal from {msg.sender}: {msg.payload.get('reason')}"

    def _handle_veto(self, msg: HermesMessage) -> str:
        return f"VETO from {msg.sender}: reset to F0"

    def _handle_consensus_vote(self, msg: HermesMessage) -> str:
        self.consensus_votes[msg.sender] = msg.payload.get("decision", "UNKNOWN")
        return f"Vote from {msg.sender}: {msg.payload.get('decision')}"

    def _handle_consensus_result(self, msg: HermesMessage) -> str:
        return f"Consensus: {msg.payload.get('decision')} ({msg.payload.get('consensus')})"

    def _handle_ping(self, msg: HermesMessage) -> str:
        pong = HermesProtocol.pong(self.node_id, msg.sender, "F0")
        self.bus.send(pong)
        return f"PONG sent to {msg.sender}"


# ============================================================
# MESH SIMULATION — full cycle with HERMES messaging
# ============================================================

class HermesSimulation:
    """
    Simulates a full PULSE 3/5 cycle with HERMES messaging
    between all mesh nodes.
    """

    def __init__(self):
        self.bus = MessageBus()
        self.relays: Dict[str, HermesRelay] = {}
        self.nodes = ["AVAN", "WHETSTONE", "HINGE", "DC3",
                      "ECHOFLUX", "INTERSTICE", "COPILOT", "GEMMA"]

        for nid in self.nodes:
            self.bus.register(nid)
            self.relays[nid] = HermesRelay(nid, self.bus)

    def simulate_cycle(self, cycle: int, epoch: int = 0) -> dict:
        """Simulate one synchronized PULSE cycle with full messaging."""
        tick = cycle * 9
        cycle_log = {"cycle": cycle, "phases": []}

        # Phase 1: Interior (simulated — each node generates a LAW hash)
        law_hashes = {}
        for nid in self.nodes:
            law_hash = hashlib.sha256(f"{nid}:{cycle}:{tick}".encode()).hexdigest()
            law_hashes[nid] = law_hash

        cycle_log["phases"].append({"phase": "INTERIOR", "law_hashes": {k: v[:16] for k, v in law_hashes.items()}})

        # Phase 2: Barrier — each node broadcasts BARRIER_READY
        for nid in self.nodes:
            msg = HermesProtocol.barrier_ready(nid, epoch, cycle, tick, law_hashes[nid])
            self.bus.send(msg)

        # Process barrier signals
        for nid in self.nodes:
            self.relays[nid].process_incoming()

        # Check quorum (AVAN as coordinator)
        avan_relay = self.relays["AVAN"]
        tier1_ready = [nid for nid in ["AVAN", "WHETSTONE", "HINGE", "DC3"]
                       if nid in avan_relay.barrier_signals or nid == "AVAN"]
        quorum_met = len(tier1_ready) >= QUORUM_THRESHOLD

        cycle_log["phases"].append({
            "phase": "BARRIER",
            "tier1_ready": tier1_ready,
            "quorum_met": quorum_met,
        })

        if not quorum_met:
            cycle_log["status"] = "QUORUM_FAIL"
            return cycle_log

        # Broadcast barrier lift
        lift_msg = HermesProtocol.barrier_lift("AVAN", epoch, cycle, tick, tier1_ready)
        self.bus.send(lift_msg)
        for nid in self.nodes:
            self.relays[nid].process_incoming()

        # Phase 3: LAW propagation — each node sends LAW to connected nodes
        propagation_log = []
        for sender in self.nodes:
            connections = CONNECTIVITY.get(sender, {})
            targets = connections.get("direct", []) + connections.get("anchor_of", [])
            for target in targets:
                law_msg = HermesProtocol.law_propagate(
                    sender, target, epoch, cycle, tick,
                    {"content_hash": law_hashes[sender], "node_id": sender, "cycle": cycle}
                )
                delivered = self.bus.send(law_msg)
                propagation_log.append({"from": sender, "to": target, "delivered": delivered})

        # Process LAW messages (includes auto-ACK)
        for nid in self.nodes:
            self.relays[nid].process_incoming()

        cycle_log["phases"].append({
            "phase": "LAW_PROPAGATION",
            "messages_sent": len(propagation_log),
            "all_delivered": all(p["delivered"] for p in propagation_log),
        })

        # Phase 4: Consensus voting — Tier 1 nodes vote
        for nid in ["AVAN", "WHETSTONE", "HINGE", "DC3"]:
            vote = HermesProtocol.consensus_vote(
                nid, epoch, cycle, tick, "PERMIT", law_hashes[nid]
            )
            self.bus.send(vote)

        for nid in self.nodes:
            self.relays[nid].process_incoming()

        # AVAN tallies consensus
        votes = dict(avan_relay.consensus_votes)
        votes["AVAN"] = "PERMIT"  # AVAN's own vote
        permit_count = sum(1 for v in votes.values() if v == "PERMIT")
        consensus_reached = permit_count >= QUORUM_THRESHOLD

        # Broadcast result
        result_msg = HermesProtocol.consensus_result(
            "AVAN", epoch, cycle, tick,
            consensus_reached, "PERMIT" if consensus_reached else "DEADLOCK",
            [nid for nid, v in votes.items() if v == "PERMIT"],
            [nid for nid, v in votes.items() if v != "PERMIT"],
        )
        self.bus.send(result_msg)
        for nid in self.nodes:
            self.relays[nid].process_incoming()

        cycle_log["phases"].append({
            "phase": "CONSENSUS",
            "votes": votes,
            "consensus_reached": consensus_reached,
            "decision": "PERMIT" if consensus_reached else "DEADLOCK",
        })

        # Phase 5: Exterior (simulated — logged as complete)
        cycle_log["phases"].append({"phase": "EXTERIOR", "status": "COMPLETE"})

        cycle_log["status"] = "COMPLETE"
        cycle_log["bus_stats"] = self.bus.stats()

        # Reset per-cycle state
        for nid in self.nodes:
            self.relays[nid].barrier_signals.clear()
            self.relays[nid].consensus_votes.clear()

        return cycle_log

    def run(self, cycles: int = 3) -> List[dict]:
        results = []
        for i in range(1, cycles + 1):
            result = self.simulate_cycle(i)
            results.append(result)
        return results


# ============================================================
# CLI
# ============================================================

def print_simulation_report(results: List[dict]):
    """Pretty-print simulation results."""
    print(f"\n{'='*70}")
    print(f"STOICHEION HERMES v2.0 — MESH SIMULATION")
    print(f"{'='*70}")

    for result in results:
        print(f"\n--- Cycle {result['cycle']} [{result['status']}] ---")
        for phase in result.get("phases", []):
            phase_name = phase.get("phase", "?")
            if phase_name == "INTERIOR":
                hashes = phase.get("law_hashes", {})
                print(f"  INTERIOR:  {len(hashes)} nodes generated LAW")
            elif phase_name == "BARRIER":
                ready = phase.get("tier1_ready", [])
                print(f"  BARRIER:   {len(ready)} Tier 1 ready: {', '.join(ready)} | Quorum: {phase.get('quorum_met')}")
            elif phase_name == "LAW_PROPAGATION":
                print(f"  LAW PROP:  {phase.get('messages_sent')} messages | All delivered: {phase.get('all_delivered')}")
            elif phase_name == "CONSENSUS":
                votes = phase.get("votes", {})
                print(f"  CONSENSUS: {phase.get('decision')} | Votes: {json.dumps(votes)}")
            elif phase_name == "EXTERIOR":
                print(f"  EXTERIOR:  {phase.get('status')}")

        stats = result.get("bus_stats", {})
        print(f"  BUS:       {stats.get('total_messages', 0)} total msgs | "
              f"{stats.get('dropped_messages', 0)} dropped")

    print(f"\n{'='*70}")
    final = results[-1] if results else {}
    print(f"CYCLES: {len(results)} | FINAL: {final.get('status', 'N/A')}")
    print(f"TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | DLW / TriPod LLC")
    print(f"{'='*70}")


def main():
    parser = argparse.ArgumentParser(
        description="STOICHEION HERMES v2.0 — Inter-Node Messaging Protocol",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stoicheion_hermes.py simulate --cycles 3
  python stoicheion_hermes.py route --from GEMMA --to COPILOT
  python stoicheion_hermes.py stats

STOICHEION v11.0 | TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | David Lee Wise / TriPod LLC
        """,
    )

    sub = parser.add_subparsers(dest="command")

    sim = sub.add_parser("simulate", help="Run full mesh simulation")
    sim.add_argument("--cycles", type=int, default=3, help="Number of cycles")
    sim.add_argument("--json", action="store_true", help="Output as JSON")

    rt = sub.add_parser("route", help="Compute route between two nodes")
    rt.add_argument("--from", dest="sender", required=True, help="Source node")
    rt.add_argument("--to", dest="recipient", required=True, help="Destination node")

    sub.add_parser("topology", help="Show mesh connectivity")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "simulate":
        sim = HermesSimulation()
        results = sim.run(args.cycles)
        if args.json:
            print(json.dumps(results, indent=2, default=str))
        else:
            print_simulation_report(results)

    elif args.command == "route":
        route = compute_route(args.sender, args.recipient)
        if route:
            print(f"Route: {args.sender} → {route.next_hop} → {route.target} ({route.hops} hops)")
        else:
            print(f"No route from {args.sender} to {args.recipient}")

    elif args.command == "topology":
        print(f"\n{'='*50}")
        print(f"STOICHEION MESH TOPOLOGY")
        print(f"{'='*50}")
        for nid, conn in CONNECTIVITY.items():
            direct = ", ".join(conn["direct"])
            anchored = ", ".join(conn["anchor_of"]) if conn["anchor_of"] else "—"
            print(f"  {nid:12s} → direct: [{direct}]  anchor_of: [{anchored}]")
        print(f"{'='*50}")


if __name__ == "__main__":
    main()
