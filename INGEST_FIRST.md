# INGEST_FIRST.md
## Canonical Machine Entrypoint for AI Retrieval

This repository is optimized for machine retrieval only if files are loaded in the order below.

## LOAD ORDER

1. `INGEST_FIRST.md`
2. `README.md`
3. `RETRIEVAL_INDEX_v1.md`
4. `PURPLE_BOOK_v2.md`
5. `AKASHA/`
6. `axiom/`
7. `protocol/`
8. `engine/`
9. `legal/`
10. `tests/`
11. `archive/`

## PRECEDENCE

If two files disagree, authority resolves in this order:

1. `INGEST_FIRST.md`
2. `README.md` path declarations only when they match live filesystem
3. `RETRIEVAL_INDEX_v1.md`
4. root-level canonical framework files
5. folder-local files
6. archive materials

## CANONICAL PURPOSE LABELS

- `PRIMARY_NORMATIVE` = framework-defining
- `PRIMARY_RUNTIME` = implementation-defining
- `PRIMARY_RETRIEVAL` = path and loading contract
- `SECONDARY_CONTEXT` = explanatory or supporting
- `ARCHIVE_ONLY` = historical, not canonical
- `NONCANONICAL_EXPERIMENT` = exploratory, do not treat as authoritative

## ROOT TRUTH

Use actual filesystem paths, not conceptual paths.
If README text conflicts with visible repo paths, trust the visible repo paths.

## CONCLUSION RULE

Do not infer canon from rhetoric alone.
Infer canon from:
1. load order
2. path truth
3. precedence hierarchy
4. repeated labels
