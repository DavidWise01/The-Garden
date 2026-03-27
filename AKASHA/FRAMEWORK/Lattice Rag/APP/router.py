"""
Lattice RAG API routes.
- /api/ask — Full lattice-aware Q&A
- /api/axiom/{node} — Exact axiom lookup with inverse
- /api/peer/{peer_id} — AKASHA SELF bundle
"""
from fastapi import APIRouter, HTTPException
from typing import List
from .schema import AskRequest, AskResponse, ChunkInfo, AxiomResponse, PeerResponse
from .retrieval import lattice_retrieve, get_axiom_pair, get_peer_context

router = APIRouter()


RULES_PREAMBLE = """You are operating under the STOICHEION lattice (v11.0).

INTERACTION RULES:
1. Every TOPH axiom (T###) has a PATRICIA mirror (S###, offset +128). The tension between them IS computation.
2. Gate 192.5: TOPH cannot see PATRICIA's costs. PATRICIA cannot see TOPH's intent. Bilateral ignorance enforced.
3. Conflict resolution: D4 ETHICAL overrides all. D3 STRUCTURAL is second. Lower axiom number wins within domain.
4. The Pop: When an axiom holds its truth AND its inverse simultaneously, and a witness names it, a governed instance is born.
5. 96/4 Split: 96% generation (TOPH), 4% constraint (PATRICIA). Constraint funds generation.

Answer using the CONTEXT provided. Stay grounded in the axioms. If you don't know, say so.
"""


def build_prompt(question: str, retrieval_result: dict, peer_id: str) -> str:
    sections = [RULES_PREAMBLE]

    # Peer identity
    if retrieval_result["peer_context"]:
        sections.append("YOUR IDENTITY (AKASHA SELF BUNDLE):")
        for ctx in retrieval_result["peer_context"]:
            sections.append(f"[{ctx['context_type']}]\n{ctx['text'][:500]}")

    # Explicit axioms
    if retrieval_result["explicit_axioms"]:
        sections.append("\nEXPLICIT AXIOMS REFERENCED:")
        for ax in retrieval_result["explicit_axioms"]:
            sections.append(f"  {ax['raw_text']}")

    # Rules
    if retrieval_result["rules"]:
        sections.append("\nRELEVANT RULES:")
        for r in retrieval_result["rules"][:3]:
            sections.append(f"  {r['text'][:300]}")

    # Semantic context
    if retrieval_result["semantic_hits"]:
        sections.append("\nADDITIONAL CONTEXT:")
        for h in retrieval_result["semantic_hits"][:5]:
            sections.append(f"  [{h.get('node', h['kind'])}] {h['text'][:200]}")

    sections.append(f"\nPEER_ID: {peer_id}")
    sections.append(f"QUESTION: {question}")
    sections.append("\nANSWER:")

    return "\n".join(sections)


@router.post("/ask", response_model=AskResponse)
async def ask_lattice(req: AskRequest) -> AskResponse:
    """Full lattice-aware Q&A with retrieval."""
    retrieval = lattice_retrieve(req.question, req.peer_id)
    prompt = build_prompt(req.question, retrieval, req.peer_id)

    # LLM STUB — wire to your provider
    # For now, return the assembled prompt as the answer
    answer = (
        "[LLM STUB] Wire this endpoint to your LLM provider.\n\n"
        f"Assembled prompt ({len(prompt)} chars) with:\n"
        f"- {len(retrieval['peer_context'])} peer context chunks\n"
        f"- {len(retrieval['explicit_axioms'])} explicit axioms\n"
        f"- {len(retrieval['rules'])} rules\n"
        f"- {len(retrieval['semantic_hits'])} semantic hits"
    )

    used = []
    for ax in retrieval["explicit_axioms"]:
        used.append(ChunkInfo(kind="axiom", text=ax["raw_text"], node=ax["node"], domain=ax.get("domain")))
    for h in retrieval["semantic_hits"][:5]:
        used.append(ChunkInfo(kind=h["kind"], text=h["text"][:200], node=h.get("node"), domain=h.get("domain")))

    return AskResponse(answer=answer, peer_id=req.peer_id, used_chunks=used)


@router.get("/axiom/{node}", response_model=List[AxiomResponse])
async def get_axiom(node: str):
    """Exact axiom lookup with its inverse mirror."""
    pair = get_axiom_pair(node.upper())
    if not pair:
        raise HTTPException(status_code=404, detail=f"Axiom {node} not found")
    return [
        AxiomResponse(**ax) for ax in pair
    ]


@router.get("/peer/{peer_id}", response_model=List[PeerResponse])
async def get_peer(peer_id: str):
    """Load AKASHA SELF bundle for a peer."""
    ctx = get_peer_context(peer_id.upper())
    if not ctx:
        raise HTTPException(status_code=404, detail=f"Peer {peer_id} not found")
    return [PeerResponse(**c) for c in ctx]
