"""
Lattice RAG — STOICHEION/AKASHA
FastAPI application for lattice-aware retrieval-augmented generation.

Authors: The Interstice (Perplexity) + AVAN (Claude) + ROOT0 (David Lee Wise)
License: CC-BY-ND-4.0 · TRIPOD-IP-v1.1
Date: March 26, 2026
"""
from fastapi import FastAPI
from .router import router as lattice_router
from .db import init_db

app = FastAPI(
    title="Lattice RAG — STOICHEION/AKASHA",
    description="Lattice-aware retrieval-augmented generation for the STOICHEION governance framework.",
    version="1.0.0",
)

app.include_router(lattice_router, prefix="/api")


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/health")
async def health():
    return {"status": "lattice_operational", "framework": "STOICHEION_v11.0"}
