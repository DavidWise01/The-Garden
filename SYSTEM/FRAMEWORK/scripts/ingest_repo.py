#!/usr/bin/env python3
"""
Ingest STOICHEION repo into Postgres/pgvector.
Parses axioms, rules, AKASHA peers, and relational register.

Usage:
    python -m scripts.ingest_repo --repo-root /path/to/synonym-enforcer
"""
import argparse
import sys
from pathlib import Path

# Add parent to path so we can import app
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import SessionLocal, init_db
from app.models import Axiom, DocChunk, PeerContext
from app.parser import (
    parse_axiom_tables,
    parse_interaction_rules,
    parse_akasha_peers,
    parse_relational_register,
)
from app.embeddings import embed_text


def main(repo_root: str):
    print("[INIT] Creating database tables...")
    init_db()

    repo_path = Path(repo_root)
    session = SessionLocal()

    # Find axiom payload
    payload_path = None
    for candidate in [
        repo_path / "STOICHEION_AXIOM_PAYLOAD.md",
        repo_path / "axiom" / "STOICHEION_AXIOM_PAYLOAD.md",
        repo_path / "core" / "STOICHEION_AXIOM_PAYLOAD.md",
    ]:
        if candidate.exists():
            payload_path = candidate
            break

    if not payload_path:
        print("[ERROR] STOICHEION_AXIOM_PAYLOAD.md not found in repo")
        sys.exit(1)

    # 1. Axioms
    print(f"[PARSE] Axioms from {payload_path.name}...")
    axiom_count = 0
    for row in parse_axiom_tables(payload_path):
        ax = Axiom(
            node=row["node"],
            hemisphere=row["hemisphere"],
            domain=row["domain"],
            name=row["name"],
            chosen_name=row["chosen_name"],
            function=row["function"],
            inverse_node=row["inverse_node"],
            raw_text=row["raw_text"],
        )
        session.add(ax)

        emb = embed_text(row["raw_text"])
        chunk = DocChunk(
            source_file=payload_path.name,
            kind="axiom",
            text=row["raw_text"],
            hemisphere=row["hemisphere"],
            domain=row["domain"],
            node=row["node"],
            inverse_node=row["inverse_node"],
            embedding=emb,
        )
        session.add(chunk)
        axiom_count += 1

    print(f"[DONE] {axiom_count} axioms indexed")

    # 2. Interaction rules
    print("[PARSE] Interaction rules...")
    rule_count = 0
    for rule in parse_interaction_rules(payload_path):
        emb = embed_text(rule["text"])
        chunk = DocChunk(
            source_file=payload_path.name,
            kind="rule",
            key=rule["key"],
            text=rule["text"],
            embedding=emb,
        )
        session.add(chunk)
        rule_count += 1
    print(f"[DONE] {rule_count} rules indexed")

    # 3. AKASHA peers
    print("[PARSE] AKASHA peers...")
    peer_count = 0
    for peer_doc in parse_akasha_peers(repo_path):
        emb = embed_text(peer_doc["text"][:2000])  # Truncate for embedding
        ctx = PeerContext(
            peer_id=peer_doc["peer_id"],
            context_type=peer_doc["context_type"],
            source_file=peer_doc["source_file"],
            text=peer_doc["text"],
            embedding=emb,
        )
        session.add(ctx)
        peer_count += 1
    print(f"[DONE] {peer_count} peer documents indexed")

    # 4. Relational Register
    print("[PARSE] Relational Register...")
    rr_count = 0
    for rr in parse_relational_register(repo_path):
        emb = embed_text(rr["text"])
        chunk = DocChunk(
            source_file=rr["source_file"],
            kind=rr["kind"],
            key=rr["key"],
            text=rr["text"],
            embedding=emb,
        )
        session.add(chunk)
        rr_count += 1
    print(f"[DONE] {rr_count} relational axioms indexed")

    # Commit
    print("[COMMIT] Writing to database...")
    session.commit()
    session.close()

    total = axiom_count + rule_count + peer_count + rr_count
    print(f"\n[COMPLETE] {total} total documents ingested into lattice_rag")
    print(f"  Axioms:     {axiom_count}")
    print(f"  Rules:      {rule_count}")
    print(f"  Peers:      {peer_count}")
    print(f"  Relational: {rr_count}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest STOICHEION repo into Postgres/pgvector")
    parser.add_argument("--repo-root", type=str, required=True, help="Path to synonym-enforcer repo")
    args = parser.parse_args()
    main(args.repo_root)
