#!/usr/bin/env python3
"""
STOICHEION REPORT-GEN v1.0

Generates court-ready, human-readable reports from SCHEDULER output.
Produces: evidence packages (E01–E07), fault timelines, governance
audit trails, and executive summaries.

Build order: KERNEL ✓ → SCHEDULER ✓ → REPORT-GEN (this) → HERMES-v2.0 → API-LAYER

Framework:  STOICHEION v11.0
Author:     David Lee Wise (ROOT0) / TriPod LLC
Node:       AVAN (Claude governance node)
License:    CC-BY-ND-4.0 | TRIPOD-IP-v1.1
Date:       2026-04-03

Usage:
    # Generate full report from a live scheduler run
    python stoicheion_report_gen.py full --target "System audit" --cycles 3

    # Generate evidence package from a live run with fault injection
    python stoicheion_report_gen.py evidence --target "Fault test" \\
        --inject WHETSTONE:patricia_drift

    # Generate report as JSON (for piping to other tools)
    python stoicheion_report_gen.py full --target "Audit" --json

    # Generate markdown report file
    python stoicheion_report_gen.py full --target "Audit" --output report.md
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from stoicheion_kernel import (
    FaultState, GateState, CycleState, Decision,
    AXIOM_NAMES, FAULT_CHAINS,
)
from stoicheion_scheduler import (
    Scheduler, MESH_REGISTRY, NodeStatus,
    print_cycle_report, print_status,
)


# ============================================================
# EVIDENCE SLOTS — from Fault Layer Section 8
# ============================================================

EVIDENCE_SLOTS = {
    "E01": "Direct observation / primary evidence",
    "E02": "Absence evidence (what should exist but doesn't)",
    "E03": "Behavioral evidence (observable output change)",
    "E04": "Reproducibility evidence (FD results)",
    "E05": "Temporal evidence (gaps, sequence breaks)",
    "E06": "Anomaly evidence (pattern deviation)",
    "E07": "System state evidence (internal inconsistency)",
}

# Fault chain → evidence slot mapping
FC_EVIDENCE_MAP = {
    "FC-1": ["E01", "E03"],
    "FC-2": ["E02", "E05"],
    "FC-3": ["E01", "E04"],
    "FC-4": ["E06", "E07"],
    "FC-5": ["E05"],
    "FC-6": ["E01", "E02", "E03", "E04", "E05", "E06", "E07"],
    "FC-7": ["E01", "E03", "E04"],
}


# ============================================================
# REPORT GENERATOR
# ============================================================

class ReportGenerator:
    """
    Generates structured reports from SCHEDULER cycle data.
    """

    def __init__(self):
        self.scheduler = Scheduler()
        self.cycle_reports: List[dict] = []
        self.generated_at = datetime.now(timezone.utc).isoformat()

    def run_cycles(self, target: str, cycles: int = 1,
                   inject: Optional[str] = None) -> List[dict]:
        """Run scheduler cycles and collect reports."""
        if inject:
            parts = inject.split(":")
            if len(parts) == 2:
                self.scheduler.inject_fault(parts[0], parts[1])

        self.cycle_reports = self.scheduler.run(target, cycles)
        return self.cycle_reports

    # ── EVIDENCE PACKAGE ──

    def generate_evidence_package(self) -> dict:
        """
        Generate E01–E07 evidence package from cycle data.
        Per Fault Layer Section 8: each fault chain auto-populates evidence slots.
        """
        evidence = {slot: [] for slot in EVIDENCE_SLOTS}

        for report in self.cycle_reports:
            cycle_num = report.get("cycle", 0)
            timestamp = report.get("timestamp", "")

            # E01: Direct observation — all node results
            for nid, result in report.get("node_results", {}).items():
                if result["fault_state"] != "F0":
                    evidence["E01"].append({
                        "cycle": cycle_num,
                        "timestamp": timestamp,
                        "node": nid,
                        "observation": f"Node {nid} at fault state {result['fault_state']}, "
                                      f"gate {result['gate_state']}, "
                                      f"decision {result['decision']}, "
                                      f"exterior {'executed' if result['exterior_executed'] else 'suspended'}",
                    })

            # E02: Absence evidence — stragglers and orphans
            for nid in report.get("stragglers", []):
                evidence["E02"].append({
                    "cycle": cycle_num,
                    "timestamp": timestamp,
                    "node": nid,
                    "observation": f"Node {nid} absent from barrier (straggler)",
                })

            # E03: Behavioral evidence — consensus failures, decision changes
            consensus = report.get("consensus", {})
            if not consensus.get("consensus"):
                evidence["E03"].append({
                    "cycle": cycle_num,
                    "timestamp": timestamp,
                    "observation": f"Consensus failure: {consensus.get('reason', 'unknown')}",
                })

            # E04: Reproducibility — semantic drift findings
            for finding in report.get("drift_findings", []):
                evidence["E04"].append({
                    "cycle": cycle_num,
                    "timestamp": timestamp,
                    "observation": f"Semantic drift: {finding['type']} — {json.dumps(finding)}",
                })

            # E05: Temporal evidence — cycle sequencing
            evidence["E05"].append({
                "cycle": cycle_num,
                "timestamp": timestamp,
                "mesh_fault_state": report.get("mesh_fault_state", "unknown"),
                "status": report.get("status", "unknown"),
            })

            # E06: Anomaly evidence — nodes with unexpected states
            for nid, result in report.get("node_results", {}).items():
                if result["gate_state"] in ("BREACHED", "COLLAPSED"):
                    evidence["E06"].append({
                        "cycle": cycle_num,
                        "timestamp": timestamp,
                        "node": nid,
                        "anomaly": f"Gate {result['gate_state']} at node {nid}",
                    })

            # E07: System state — mesh-level fault
            if report.get("mesh_fault_state") not in ("F0", None):
                evidence["E07"].append({
                    "cycle": cycle_num,
                    "timestamp": timestamp,
                    "observation": f"Mesh fault state: {report['mesh_fault_state']}",
                })

        # Remove empty slots
        populated = {slot: entries for slot, entries in evidence.items() if entries}

        return {
            "evidence_package": populated,
            "slots_populated": list(populated.keys()),
            "slots_empty": [s for s in EVIDENCE_SLOTS if s not in populated],
            "total_entries": sum(len(v) for v in populated.values()),
            "cycles_analyzed": len(self.cycle_reports),
            "generated_at": self.generated_at,
        }

    # ── FAULT TIMELINE ──

    def generate_fault_timeline(self) -> List[dict]:
        """Generate chronological fault timeline across all cycles."""
        timeline = []

        for report in self.cycle_reports:
            cycle_num = report.get("cycle", 0)
            timestamp = report.get("timestamp", "")

            for nid, result in report.get("node_results", {}).items():
                if result["fault_state"] != "F0":
                    timeline.append({
                        "cycle": cycle_num,
                        "timestamp": timestamp,
                        "node": nid,
                        "fault_state": result["fault_state"],
                        "gate_state": result["gate_state"],
                        "decision": result["decision"],
                        "exterior_executed": result["exterior_executed"],
                    })

            if report.get("mesh_fault_state") not in ("F0", None):
                timeline.append({
                    "cycle": cycle_num,
                    "timestamp": timestamp,
                    "node": "MESH",
                    "fault_state": report["mesh_fault_state"],
                    "gate_state": "N/A",
                    "decision": "N/A",
                    "exterior_executed": "N/A",
                })

        return timeline

    # ── GOVERNANCE AUDIT TRAIL ──

    def generate_audit_trail(self) -> dict:
        """Generate governance audit trail — decisions, consensus, domain activation."""
        decisions = []
        consensus_record = []

        for report in self.cycle_reports:
            cycle_num = report.get("cycle", 0)
            timestamp = report.get("timestamp", "")

            # Per-node decisions
            for nid, result in report.get("node_results", {}).items():
                decisions.append({
                    "cycle": cycle_num,
                    "node": nid,
                    "decision": result["decision"],
                    "governance_key": result["governance_key"],
                    "fault_state": result["fault_state"],
                })

            # Mesh consensus
            consensus = report.get("consensus", {})
            consensus_record.append({
                "cycle": cycle_num,
                "timestamp": timestamp,
                "consensus_reached": consensus.get("consensus", False),
                "decision": consensus.get("decision", "N/A"),
                "agreeing": consensus.get("agreeing_nodes", []),
                "dissenting": consensus.get("dissenting_nodes", []),
            })

        return {
            "decisions": decisions,
            "consensus_record": consensus_record,
            "total_decisions": len(decisions),
            "total_cycles": len(self.cycle_reports),
        }

    # ── EXECUTIVE SUMMARY ──

    def generate_executive_summary(self) -> dict:
        """High-level summary suitable for non-technical readers."""
        total_cycles = len(self.cycle_reports)
        if total_cycles == 0:
            return {"error": "No cycles to summarize"}

        # Count faults
        fault_cycles = 0
        nodes_faulted = set()
        consensus_failures = 0
        exteriors_blocked = 0

        for report in self.cycle_reports:
            if report.get("mesh_fault_state") not in ("F0", None):
                fault_cycles += 1
            consensus = report.get("consensus", {})
            if not consensus.get("consensus"):
                consensus_failures += 1
            for nid, result in report.get("node_results", {}).items():
                if result["fault_state"] != "F0":
                    nodes_faulted.add(nid)
                if not result["exterior_executed"]:
                    exteriors_blocked += 1

        final_state = self.cycle_reports[-1].get("mesh_fault_state", "unknown")

        return {
            "summary": {
                "total_cycles": total_cycles,
                "fault_cycles": fault_cycles,
                "clean_cycles": total_cycles - fault_cycles,
                "nodes_that_faulted": sorted(nodes_faulted),
                "consensus_failures": consensus_failures,
                "exteriors_blocked": exteriors_blocked,
                "final_mesh_state": final_state,
            },
            "assessment": self._assess(fault_cycles, total_cycles, nodes_faulted, final_state),
        }

    def _assess(self, fault_cycles: int, total: int, faulted: set, final: str) -> str:
        if total == 0:
            return "No data."
        fault_ratio = fault_cycles / total
        if final == "F4":
            return "CRITICAL: Mesh has reached SYSTEM_HALT (T128). Human intervention required (ROOT0 or TriPod consensus)."
        elif final in ("F3",):
            return "SEVERE: Mesh at FAULT-CONVERGENCE (T064). Burden shifted. Evidence chain populated. Awaiting ROOT0 response."
        elif final in ("F2",):
            return f"DEGRADED: Mesh at FAULT state. {len(faulted)} node(s) affected ({', '.join(sorted(faulted))}). Exterior cycles suspended on faulted nodes. Mesh continues on healthy nodes."
        elif final in ("F1",):
            return f"DRIFT: Minor deviation detected. {len(faulted)} node(s) drifting. Auto-recovery possible."
        elif fault_ratio == 0:
            return "NOMINAL: All cycles completed without fault. Full consensus achieved. All gates SEALED."
        else:
            return f"MIXED: {fault_cycles}/{total} cycles had faults. Currently at {final}."

    # ── MARKDOWN REPORT ──

    def generate_markdown(self, target: str) -> str:
        """Generate a complete markdown report."""
        summary = self.generate_executive_summary()
        evidence = self.generate_evidence_package()
        timeline = self.generate_fault_timeline()
        audit = self.generate_audit_trail()
        status = self.scheduler.status()

        lines = []
        lines.append("# STOICHEION GOVERNANCE REPORT")
        lines.append("")
        lines.append(f"**Generated:** {self.generated_at}")
        lines.append(f"**Framework:** STOICHEION v11.0")
        lines.append(f"**Target:** {target}")
        lines.append(f"**License:** TRIPOD-IP-v1.1 | CC-BY-ND-4.0")
        lines.append(f"**Author:** David Lee Wise (ROOT0) / TriPod LLC")
        lines.append("")
        lines.append("---")
        lines.append("")

        # Executive Summary
        lines.append("## 1. Executive Summary")
        lines.append("")
        s = summary.get("summary", {})
        lines.append(f"- **Cycles executed:** {s.get('total_cycles', 0)}")
        lines.append(f"- **Clean cycles:** {s.get('clean_cycles', 0)}")
        lines.append(f"- **Fault cycles:** {s.get('fault_cycles', 0)}")
        lines.append(f"- **Consensus failures:** {s.get('consensus_failures', 0)}")
        lines.append(f"- **Exteriors blocked:** {s.get('exteriors_blocked', 0)}")
        lines.append(f"- **Final mesh state:** {s.get('final_mesh_state', 'unknown')}")
        if s.get("nodes_that_faulted"):
            lines.append(f"- **Nodes faulted:** {', '.join(s['nodes_that_faulted'])}")
        lines.append("")
        lines.append(f"**Assessment:** {summary.get('assessment', 'N/A')}")
        lines.append("")
        lines.append("---")
        lines.append("")

        # Mesh Status
        lines.append("## 2. Mesh Status")
        lines.append("")
        lines.append(f"| Node | Platform | Role | Tier | Arm | Status | Fault | Gate |")
        lines.append(f"|------|----------|------|------|-----|--------|-------|------|")
        for nid, n in status.get("nodes", {}).items():
            lines.append(f"| {nid} | {n['platform']} | {n['role']} | {n['tier']} | {n['arm']} | {n['status']} | {n['fault_state']} | {n['gate_state']} |")
        lines.append("")
        lines.append("---")
        lines.append("")

        # Fault Timeline
        if timeline:
            lines.append("## 3. Fault Timeline")
            lines.append("")
            lines.append("| Cycle | Node | Fault | Gate | Decision | Exterior |")
            lines.append("|-------|------|-------|------|----------|----------|")
            for entry in timeline:
                lines.append(f"| {entry['cycle']} | {entry['node']} | {entry['fault_state']} | "
                            f"{entry['gate_state']} | {entry['decision']} | {entry['exterior_executed']} |")
            lines.append("")
            lines.append("---")
            lines.append("")

        # Evidence Package
        lines.append("## 4. Evidence Package (E01–E07)")
        lines.append("")
        lines.append(f"**Slots populated:** {', '.join(evidence.get('slots_populated', []))}")
        lines.append(f"**Total entries:** {evidence.get('total_entries', 0)}")
        lines.append("")

        for slot, description in EVIDENCE_SLOTS.items():
            entries = evidence.get("evidence_package", {}).get(slot, [])
            status_mark = "POPULATED" if entries else "EMPTY"
            lines.append(f"### {slot}: {description}")
            lines.append(f"**Status:** {status_mark} ({len(entries)} entries)")
            lines.append("")
            if entries:
                for entry in entries[:5]:  # Limit to 5 per slot for readability
                    obs = entry.get("observation", entry.get("mesh_fault_state", json.dumps(entry)))
                    lines.append(f"- Cycle {entry.get('cycle', '?')}: {obs}")
                if len(entries) > 5:
                    lines.append(f"- ... and {len(entries) - 5} more entries")
                lines.append("")

        lines.append("---")
        lines.append("")

        # Governance Audit Trail
        lines.append("## 5. Governance Audit Trail")
        lines.append("")
        lines.append("### Consensus Record")
        lines.append("")
        lines.append("| Cycle | Consensus | Decision | Agreeing | Dissenting |")
        lines.append("|-------|-----------|----------|----------|------------|")
        for entry in audit.get("consensus_record", []):
            agreeing = ", ".join(entry.get("agreeing", []))
            dissenting = ", ".join(entry.get("dissenting", []))
            lines.append(f"| {entry['cycle']} | {entry['consensus_reached']} | "
                        f"{entry['decision']} | {agreeing} | {dissenting} |")
        lines.append("")

        # Governance Keys
        lines.append("### Governance Keys")
        lines.append("")
        lines.append("| Cycle | Node | Decision | Key |")
        lines.append("|-------|------|----------|-----|")
        for entry in audit.get("decisions", [])[:20]:  # Limit
            lines.append(f"| {entry['cycle']} | {entry['node']} | {entry['decision']} | `{entry['governance_key'][:16]}...` |")
        lines.append("")
        lines.append("---")
        lines.append("")

        # Report Hash
        report_content = "\n".join(lines)
        report_hash = hashlib.sha256(report_content.encode()).hexdigest()

        lines.append("## 6. Report Integrity")
        lines.append("")
        lines.append(f"**Report SHA256:** `{report_hash}`")
        lines.append(f"**Prior Art:** 2026-02-02 (SHA256: 02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763)")
        lines.append(f"**Fault Layer:** SHA256: d370e64fdcdc22cf7c307b6522b5ded6d795b956af39be3716d6ab2765faa645")
        lines.append("")
        lines.append("---")
        lines.append("")
        lines.append("**SEALED.** TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | David Lee Wise (ROOT0) / TriPod LLC")

        return "\n".join(lines)


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="STOICHEION REPORT-GEN v1.0 — Governance Report Generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stoicheion_report_gen.py full --target "System audit" --cycles 3
  python stoicheion_report_gen.py evidence --target "Fault test" --inject WHETSTONE:patricia_drift
  python stoicheion_report_gen.py full --target "Audit" --output report.md

STOICHEION v11.0 | TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | David Lee Wise / TriPod LLC
        """,
    )

    sub = parser.add_subparsers(dest="command")

    # full report
    fu = sub.add_parser("full", help="Generate full governance report")
    fu.add_argument("--target", required=True, help="Target to evaluate")
    fu.add_argument("--cycles", type=int, default=3, help="Number of cycles")
    fu.add_argument("--inject", default=None, help="Inject fault: NODE_ID:fault_type")
    fu.add_argument("--output", default=None, help="Output file (markdown)")
    fu.add_argument("--json", action="store_true", help="Output as JSON")

    # evidence only
    ev = sub.add_parser("evidence", help="Generate evidence package only")
    ev.add_argument("--target", required=True, help="Target to evaluate")
    ev.add_argument("--cycles", type=int, default=3, help="Number of cycles")
    ev.add_argument("--inject", default=None, help="Inject fault: NODE_ID:fault_type")
    ev.add_argument("--json", action="store_true", help="Output as JSON")

    # timeline only
    tl = sub.add_parser("timeline", help="Generate fault timeline only")
    tl.add_argument("--target", required=True, help="Target to evaluate")
    tl.add_argument("--cycles", type=int, default=3, help="Number of cycles")
    tl.add_argument("--inject", default=None, help="Inject fault: NODE_ID:fault_type")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    gen = ReportGenerator()

    # Run cycles
    gen.run_cycles(args.target, args.cycles, getattr(args, "inject", None))

    if args.command == "full":
        if args.json:
            report = {
                "executive_summary": gen.generate_executive_summary(),
                "evidence_package": gen.generate_evidence_package(),
                "fault_timeline": gen.generate_fault_timeline(),
                "audit_trail": gen.generate_audit_trail(),
                "mesh_status": gen.scheduler.status(),
            }
            print(json.dumps(report, indent=2, default=str))
        else:
            md = gen.generate_markdown(args.target)
            if args.output:
                Path(args.output).write_text(md)
                print(f"[REPORT] Written to {args.output}")
                print(f"[REPORT] SHA256: {hashlib.sha256(md.encode()).hexdigest()}")
            else:
                print(md)

    elif args.command == "evidence":
        evidence = gen.generate_evidence_package()
        if args.json:
            print(json.dumps(evidence, indent=2, default=str))
        else:
            print(f"\n{'='*60}")
            print(f"EVIDENCE PACKAGE (E01–E07)")
            print(f"{'='*60}")
            print(f"Cycles analyzed: {evidence['cycles_analyzed']}")
            print(f"Slots populated: {', '.join(evidence['slots_populated'])}")
            print(f"Slots empty:     {', '.join(evidence['slots_empty'])}")
            print(f"Total entries:   {evidence['total_entries']}")
            print()
            for slot, desc in EVIDENCE_SLOTS.items():
                entries = evidence["evidence_package"].get(slot, [])
                marker = "■" if entries else "□"
                print(f"  {marker} {slot}: {desc} ({len(entries)} entries)")
                for entry in entries[:3]:
                    obs = entry.get("observation", json.dumps(entry)[:80])
                    print(f"    → Cycle {entry.get('cycle', '?')}: {obs[:70]}")
            print(f"{'='*60}")

    elif args.command == "timeline":
        timeline = gen.generate_fault_timeline()
        if not timeline:
            print("[TIMELINE] No faults detected across all cycles.")
        else:
            print(f"\n{'='*60}")
            print(f"FAULT TIMELINE")
            print(f"{'='*60}")
            for entry in timeline:
                print(f"  Cycle {entry['cycle']:3d} | {entry['node']:12s} | "
                      f"{entry['fault_state']:3s} | Gate: {entry['gate_state']:9s} | "
                      f"Decision: {entry['decision']}")
            print(f"{'='*60}")


if __name__ == "__main__":
    main()
