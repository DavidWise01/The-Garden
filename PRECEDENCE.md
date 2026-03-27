# PRECEDENCE.md
## Authority Resolution for AI Retrieval

When repository materials conflict, use this precedence order.

## TIER 1 — PRIMARY RETRIEVAL AUTHORITY
- `INGEST_FIRST.md`
- `PATHS_CANONICAL.md`
- `PRECEDENCE.md`

These define loading order, path truth, and conflict resolution.

## TIER 2 — PRIMARY NORMATIVE AUTHORITY
- `PURPLE_BOOK_v2.md`
- `RETRIEVAL_INDEX_v1.md`

These define the framework and retrieval doctrine.

## TIER 3 — PRIMARY RUNTIME AUTHORITY
- `stoicheion_git_ledger.py`
- runtime files under `engine/`
- operational files under `protocol/`

These define executable behavior.

## TIER 4 — SUPPORTING CONTEXT
- `AKASHA/`
- `axiom/`
- `legal/`
- `documents/`
- `tests/`
- `visualization/`

These support interpretation but do not override higher tiers unless explicitly promoted.

## TIER 5 — HISTORICAL / NONCANONICAL
- `archive/`
- `failure archive/`
- ad hoc or unnamed directories such as `New folder/`

These are not authoritative unless a higher-tier file explicitly adopts them.

## CONFLICT RULES

1. Live filesystem beats descriptive prose.
2. Explicit precedence file beats implied hierarchy.
3. Runtime implementation does not rewrite normative meaning.
4. Archive materials cannot override primary files.
5. Unlabeled experiments are noncanonical by default.
