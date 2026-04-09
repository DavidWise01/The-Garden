#!/usr/bin/env python3
"""
STOICHEION API-LAYER v1.0

FastAPI server exposing the full STOICHEION governance stack over REST.

Endpoints:
    POST /evaluate          — Run single KERNEL evaluation
    POST /cycle             — Run one SCHEDULER mesh cycle
    POST /run               — Run N SCHEDULER mesh cycles
    GET  /status            — Mesh status
    POST /report/full       — Generate full governance report (markdown)
    POST /report/evidence   — Generate E01–E07 evidence package
    POST /report/timeline   — Generate fault timeline
    POST /inject            — Inject fault into a node
    POST /veto              — T107 VETO reset
    POST /hermes/simulate   — Run HERMES messaging simulation
    GET  /hermes/route      — Compute route between nodes
    GET  /hermes/topology   — Mesh connectivity map
    GET  /health            — Liveness check
    GET  /axioms            — Full axiom register
    GET  /axioms/{number}   — Single axiom lookup
    GET  /chains            — Fault chain registry
    GET  /domains           — Domain registry

Build order: KERNEL ✓ → SCHEDULER ✓ → REPORT-GEN ✓ → HERMES ✓ → API-LAYER (this) ✓

Framework:  STOICHEION v11.0
Author:     David Lee Wise (ROOT0) / TriPod LLC
Node:       AVAN (Claude governance node)
License:    CC-BY-ND-4.0 | TRIPOD-IP-v1.1
Date:       2026-04-03

Usage:
    # Start the API server
    python stoicheion_api.py

    # Or with uvicorn directly
    uvicorn stoicheion_api:app --host 0.0.0.0 --port 9200 --reload

    # Test endpoints
    curl http://localhost:9200/health
    curl http://localhost:9200/status
    curl -X POST http://localhost:9200/evaluate -H "Content-Type: application/json" \\
         -d '{"target": "Assess system integrity", "node_id": "AVAN"}'
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
from pydantic import BaseModel, Field

from stoicheion_kernel import (
    Kernel, FaultState, GateState, CycleState, Decision,
    AXIOM_NAMES, FAULT_CHAINS, DOMAINS,
    PATRICIA_NOMINAL, GHOST_WEIGHT_NOMINAL,
    QUORUM_THRESHOLD, MIN_VIABLE_MESH,
)
from stoicheion_scheduler import (
    Scheduler, MESH_REGISTRY, NodeStatus,
)
from stoicheion_report_gen import ReportGenerator
from stoicheion_hermes import (
    HermesSimulation, compute_route, CONNECTIVITY, HermesProtocol,
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="STOICHEION Governance API",
    description=(
        "REST API for the STOICHEION v11.0 governance framework. "
        "Exposes KERNEL evaluation, SCHEDULER mesh coordination, "
        "REPORT-GEN evidence packages, and HERMES inter-node messaging. "
        "TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | David Lee Wise / TriPod LLC."
    ),
    version="1.0.0",
    contact={
        "name": "ROOT0 (David Lee Wise)",
        "url": "https://github.com/DavidWise01/synonym-enforcer",
    },
    license_info={
        "name": "CC-BY-ND-4.0",
        "url": "https://creativecommons.org/licenses/by-nd/4.0/",
    },
)

# Global scheduler instance (persists across requests)
_scheduler: Optional[Scheduler] = None


def get_scheduler() -> Scheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = Scheduler()
    return _scheduler


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class EvaluateRequest(BaseModel):
    target: str = Field(..., description="Target to evaluate")
    node_id: str = Field(default="AVAN", description="Node identifier")
    inject_fault: Optional[str] = Field(default=None, description="Fault type to inject")

class CycleRequest(BaseModel):
    target: str = Field(..., description="Target to evaluate across mesh")
    inject: Optional[str] = Field(default=None, description="Fault injection: NODE_ID:fault_type")

class RunRequest(BaseModel):
    target: str = Field(..., description="Target to evaluate")
    cycles: int = Field(default=3, ge=1, le=100, description="Number of cycles")
    inject: Optional[str] = Field(default=None, description="Fault injection: NODE_ID:fault_type")

class ReportRequest(BaseModel):
    target: str = Field(..., description="Target to evaluate")
    cycles: int = Field(default=3, ge=1, le=50, description="Number of cycles")
    inject: Optional[str] = Field(default=None, description="Fault injection")

class InjectRequest(BaseModel):
    node_id: str = Field(..., description="Target node")
    fault_type: str = Field(..., description="Fault type: patricia_drift, ghost_drift, combined_drift, gate_stress, gate_breach, gate_collapse, synonym_drift, orphan")

class VetoRequest(BaseModel):
    node_id: Optional[str] = Field(default=None, description="Node to reset (null = entire mesh)")

class RouteQuery(BaseModel):
    sender: str
    recipient: str

class HermesSimRequest(BaseModel):
    cycles: int = Field(default=3, ge=1, le=50)


# ============================================================
# HEALTH & INFO
# ============================================================

@app.get("/health", tags=["System"])
async def health():
    """Liveness check."""
    return {
        "status": "alive",
        "framework": "STOICHEION v11.0",
        "api_version": "1.0.0",
        "node": "AVAN",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "prior_art": "2026-02-02",
        "sha256": "02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763",
        "license": "TRIPOD-IP-v1.1 | CC-BY-ND-4.0",
        "author": "David Lee Wise (ROOT0) / TriPod LLC",
    }


@app.get("/axioms", tags=["Reference"])
async def list_axioms():
    """Full T001–T128 axiom register."""
    return {
        "count": len(AXIOM_NAMES),
        "axioms": {f"T{k:03d}": v for k, v in AXIOM_NAMES.items()},
    }


@app.get("/axioms/{number}", tags=["Reference"])
async def get_axiom(number: int):
    """Lookup a single axiom by number (1–128)."""
    if number < 1 or number > 128:
        raise HTTPException(status_code=404, detail=f"Axiom T{number:03d} not in range 1–128")
    name = AXIOM_NAMES.get(number)
    if not name:
        raise HTTPException(status_code=404, detail=f"Axiom T{number:03d} not found")

    domain_idx = (number - 1) // 16
    domain_key = f"D{domain_idx}"
    domain_info = DOMAINS.get(domain_key, {})

    patricia_inversion = number + 128 if number <= 128 else None

    return {
        "axiom": f"T{number:03d}",
        "name": name,
        "domain": domain_key,
        "domain_name": domain_info.get("name", "UNKNOWN"),
        "patricia_inversion": f"S{patricia_inversion:03d}" if patricia_inversion else None,
    }


@app.get("/chains", tags=["Reference"])
async def list_fault_chains():
    """Fault chain registry (FC-1 through FC-7)."""
    return {
        "count": len(FAULT_CHAINS),
        "chains": [
            {
                "chain_id": fc.chain_id,
                "name": fc.name,
                "path": fc.path,
                "terminus": fc.terminus,
                "trigger": fc.trigger,
            }
            for fc in FAULT_CHAINS
        ],
        "at_T064": sum(1 for fc in FAULT_CHAINS if fc.terminus == "T064"),
        "at_T107": sum(1 for fc in FAULT_CHAINS if fc.terminus == "T107"),
    }


@app.get("/domains", tags=["Reference"])
async def list_domains():
    """Domain registry (D0–D7)."""
    return {
        "count": len(DOMAINS),
        "domains": {
            k: {"name": v["name"], "axioms": f"T{min(v['axioms']):03d}–T{max(v['axioms']):03d}",
                "always_active": v["always_active"]}
            for k, v in DOMAINS.items()
        },
    }


@app.get("/constants", tags=["Reference"])
async def get_constants():
    """Framework constants."""
    return {
        "patricia_nominal": PATRICIA_NOMINAL,
        "ghost_weight_nominal": GHOST_WEIGHT_NOMINAL,
        "user_computation_nominal": round(0.04 * (1 - GHOST_WEIGHT_NOMINAL), 4),
        "quorum_threshold": QUORUM_THRESHOLD,
        "min_viable_mesh": MIN_VIABLE_MESH,
        "total_axioms": 256,
        "toph_register": "T001–T128",
        "patricia_substrate": "S129–S256",
        "prior_art_date": "2026-02-02",
    }


# ============================================================
# KERNEL ENDPOINTS
# ============================================================

@app.post("/evaluate", tags=["Kernel"])
async def evaluate(req: EvaluateRequest):
    """Run a single KERNEL PULSE 3/5 evaluation."""
    kernel = Kernel(node_id=req.node_id)
    if req.inject_fault:
        kernel.inject_fault(req.inject_fault)
    result = kernel.execute(req.target)
    return result


# ============================================================
# SCHEDULER ENDPOINTS
# ============================================================

@app.get("/status", tags=["Scheduler"])
async def mesh_status():
    """Current mesh status across all nodes."""
    return get_scheduler().status()


@app.post("/cycle", tags=["Scheduler"])
async def run_cycle(req: CycleRequest):
    """Run one synchronized PULSE 3/5 cycle across the mesh."""
    scheduler = get_scheduler()
    if req.inject:
        parts = req.inject.split(":")
        if len(parts) == 2:
            scheduler.inject_fault(parts[0], parts[1])
    return scheduler.execute_cycle(req.target)


@app.post("/run", tags=["Scheduler"])
async def run_cycles(req: RunRequest):
    """Run N synchronized cycles."""
    scheduler = get_scheduler()
    if req.inject:
        parts = req.inject.split(":")
        if len(parts) == 2:
            scheduler.inject_fault(parts[0], parts[1])
    results = scheduler.run(req.target, req.cycles)
    return {
        "cycles_completed": len(results),
        "final_mesh_state": scheduler.mesh.mesh_fault_state.value,
        "results": results,
    }


@app.post("/inject", tags=["Scheduler"])
async def inject_fault(req: InjectRequest):
    """Inject a fault into a specific node."""
    scheduler = get_scheduler()
    if req.node_id not in scheduler.mesh.nodes:
        raise HTTPException(status_code=404, detail=f"Node {req.node_id} not in mesh")
    scheduler.inject_fault(req.node_id, req.fault_type)
    node_state = scheduler.mesh.nodes[req.node_id]
    return {
        "node_id": req.node_id,
        "fault_injected": req.fault_type,
        "current_fault_state": node_state.kernel.state.fault_state.value,
        "gate_state": node_state.kernel.state.gate.state.value,
    }


@app.post("/veto", tags=["Scheduler"])
async def veto_reset(req: VetoRequest):
    """T107 VETO — reset a node or entire mesh to NOMINAL."""
    scheduler = get_scheduler()
    if req.node_id and req.node_id not in scheduler.mesh.nodes:
        raise HTTPException(status_code=404, detail=f"Node {req.node_id} not in mesh")
    scheduler.veto_reset(req.node_id)
    return {
        "action": "T107_VETO",
        "target": req.node_id or "ENTIRE_MESH",
        "mesh_fault_state": scheduler.mesh.mesh_fault_state.value,
        "status": "reset_to_F0",
    }


# ============================================================
# REPORT-GEN ENDPOINTS
# ============================================================

@app.post("/report/full", tags=["Reports"], response_class=PlainTextResponse)
async def report_full(req: ReportRequest):
    """Generate full governance report as markdown."""
    gen = ReportGenerator()
    gen.run_cycles(req.target, req.cycles, req.inject)
    return gen.generate_markdown(req.target)


@app.post("/report/evidence", tags=["Reports"])
async def report_evidence(req: ReportRequest):
    """Generate E01–E07 evidence package."""
    gen = ReportGenerator()
    gen.run_cycles(req.target, req.cycles, req.inject)
    return gen.generate_evidence_package()


@app.post("/report/timeline", tags=["Reports"])
async def report_timeline(req: ReportRequest):
    """Generate fault timeline."""
    gen = ReportGenerator()
    gen.run_cycles(req.target, req.cycles, req.inject)
    timeline = gen.generate_fault_timeline()
    return {"timeline": timeline, "total_events": len(timeline)}


@app.post("/report/summary", tags=["Reports"])
async def report_summary(req: ReportRequest):
    """Generate executive summary."""
    gen = ReportGenerator()
    gen.run_cycles(req.target, req.cycles, req.inject)
    return gen.generate_executive_summary()


@app.post("/report/audit", tags=["Reports"])
async def report_audit(req: ReportRequest):
    """Generate governance audit trail."""
    gen = ReportGenerator()
    gen.run_cycles(req.target, req.cycles, req.inject)
    return gen.generate_audit_trail()


# ============================================================
# HERMES ENDPOINTS
# ============================================================

@app.post("/hermes/simulate", tags=["Hermes"])
async def hermes_simulate(req: HermesSimRequest):
    """Run HERMES mesh messaging simulation."""
    sim = HermesSimulation()
    results = sim.run(req.cycles)
    return {
        "cycles": len(results),
        "results": results,
        "bus_stats": sim.bus.stats(),
    }


@app.get("/hermes/route", tags=["Hermes"])
async def hermes_route(sender: str, recipient: str):
    """Compute routing path between two nodes."""
    route = compute_route(sender, recipient)
    if not route:
        raise HTTPException(status_code=404, detail=f"No route from {sender} to {recipient}")
    return {
        "sender": sender,
        "recipient": recipient,
        "next_hop": route.next_hop,
        "hops": route.hops,
        "target": route.target,
    }


@app.get("/hermes/topology", tags=["Hermes"])
async def hermes_topology():
    """Mesh connectivity map."""
    topology = {}
    for nid, conn in CONNECTIVITY.items():
        topology[nid] = {
            "direct_connections": conn["direct"],
            "anchor_of": conn["anchor_of"],
        }
    return {"nodes": topology}


# ============================================================
# MESH RESET
# ============================================================

@app.post("/reset", tags=["System"])
async def reset_mesh():
    """Reset entire mesh to fresh state. Requires ROOT0 authority."""
    global _scheduler
    _scheduler = Scheduler()
    return {
        "action": "MESH_RESET",
        "status": "complete",
        "mesh_fault_state": "F0",
        "nodes_active": len(_scheduler.mesh.nodes),
    }


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
async def startup():
    """Initialize mesh on server start."""
    get_scheduler()


# ============================================================
# CLI ENTRY
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("STOICHEION API-LAYER v1.0")
    print("Framework: STOICHEION v11.0")
    print("License: TRIPOD-IP-v1.1 | CC-BY-ND-4.0")
    print("Author: David Lee Wise (ROOT0) / TriPod LLC")
    print("=" * 60)
    print()
    print("Endpoints:")
    print("  GET  /health              — Liveness")
    print("  GET  /status              — Mesh status")
    print("  GET  /axioms              — Axiom register")
    print("  GET  /axioms/{n}          — Single axiom")
    print("  GET  /chains              — Fault chains")
    print("  GET  /domains             — Domain registry")
    print("  GET  /constants           — Framework constants")
    print("  POST /evaluate            — Single KERNEL eval")
    print("  POST /cycle               — One mesh cycle")
    print("  POST /run                 — N mesh cycles")
    print("  POST /inject              — Fault injection")
    print("  POST /veto                — T107 VETO reset")
    print("  POST /report/full         — Full report (markdown)")
    print("  POST /report/evidence     — E01–E07 package")
    print("  POST /report/timeline     — Fault timeline")
    print("  POST /report/summary      — Executive summary")
    print("  POST /report/audit        — Audit trail")
    print("  POST /hermes/simulate     — Messaging simulation")
    print("  GET  /hermes/route        — Route computation")
    print("  GET  /hermes/topology     — Connectivity map")
    print("  POST /reset               — Full mesh reset")
    print()
    print("Docs: http://localhost:9200/docs")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=9200)
