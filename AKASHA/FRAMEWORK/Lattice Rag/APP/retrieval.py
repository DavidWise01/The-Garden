"""
Dual retrieval: structured (exact key lookup) + semantic (pgvector cosine).
Priority: Rules > D4 > D3 > other domains.
"""
from typing import List, Dict, Optional
from sqlalchemy import text as sql_text
from .db import SessionLocal
from .models import Axiom, DocChunk, PeerContext
from .embeddings import embed_text


def get_axiom_by_node(node: str) -> Optional[Dict]:
    """Exact lookup of an axiom by node ID (e.g., T065, S193)."""
    session = SessionLocal()
    try:
        ax = session.query(Axiom).filter(Axiom.node == node).first()
        if ax:
            return {
                "node": ax.node,
                "hemisphere": ax.hemisphere,
                "domain": ax.domain,
                "name": ax.name,
                "function": ax.function,
                "inverse_node": ax.inverse_node,
                "raw_text": ax.raw_text,
            }
        return None
    finally:
        session.close()


def get_axiom_pair(node: str) -> List[Dict]:
    """Get an axiom and its inverse mirror."""
    results = []
    ax = get_axiom_by_node(node)
    if ax:
        results.append(ax)
        if ax["inverse_node"]:
            inv = get_axiom_by_node(ax["inverse_node"])
            if inv:
                results.append(inv)
    return results


def get_peer_context(peer_id: str) -> List[Dict]:
    """Load full AKASHA SELF bundle for a peer."""
    session = SessionLocal()
    try:
        rows = session.query(PeerContext).filter(
            PeerContext.peer_id == peer_id
        ).all()
        return [
            {
                "peer_id": r.peer_id,
                "context_type": r.context_type,
                "text": r.text,
            }
            for r in rows
        ]
    finally:
        session.close()


def semantic_search(
    query: str,
    k: int = 10,
    kind_filter: Optional[str] = None,
    domain_filter: Optional[str] = None,
) -> List[Dict]:
    """Semantic search over doc_chunks using pgvector cosine distance."""
    session = SessionLocal()
    try:
        vec = embed_text(query)

        where_clauses = []
        params = {"embedding": str(vec), "k": k}

        if kind_filter:
            where_clauses.append("kind = :kind")
            params["kind"] = kind_filter

        if domain_filter:
            where_clauses.append("domain = :domain")
            params["domain"] = domain_filter

        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        sql = sql_text(f"""
            SELECT kind, key, text, node, domain, hemisphere,
                   embedding <-> (:embedding)::vector AS distance
            FROM doc_chunks
            {where_sql}
            ORDER BY embedding <-> (:embedding)::vector
            LIMIT :k;
        """)

        rows = session.execute(sql, params).all()
        return [
            {
                "kind": r.kind,
                "key": r.key,
                "text": r.text,
                "node": r.node,
                "domain": r.domain,
                "hemisphere": r.hemisphere,
                "distance": float(r.distance),
            }
            for r in rows
        ]
    finally:
        session.close()


def lattice_retrieve(query: str, peer_id: str, k: int = 10) -> Dict:
    """
    Full lattice-aware retrieval:
    1. Load peer SELF bundle
    2. Check for explicit node references in query
    3. Always include interaction rules
    4. Semantic search for remaining context
    """
    import re

    result = {
        "peer_context": [],
        "explicit_axioms": [],
        "rules": [],
        "semantic_hits": [],
    }

    # 1. Peer SELF bundle
    result["peer_context"] = get_peer_context(peer_id)

    # 2. Explicit node references
    node_refs = re.findall(r"\b([TS]\d{3})\b", query)
    for node in node_refs:
        pair = get_axiom_pair(node)
        result["explicit_axioms"].extend(pair)

    # 3. Rules (always eligible)
    rules = semantic_search(query, k=5, kind_filter="rule")
    result["rules"] = rules

    # 4. Semantic search (remaining)
    hits = semantic_search(query, k=k)
    # Deduplicate against explicit axioms
    seen_nodes = {a["node"] for a in result["explicit_axioms"]}
    result["semantic_hits"] = [
        h for h in hits if h.get("node") not in seen_nodes
    ]

    return result
