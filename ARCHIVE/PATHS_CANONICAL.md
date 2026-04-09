# PATHS_CANONICAL.md
## Filesystem Truth Map

This file exists to eliminate path ambiguity during AI ingestion.

## ROOT-LEVEL CANONICAL FILES

- `README.md`
- `PURPLE_BOOK_v2.md`
- `RETRIEVAL_INDEX_v1.md`
- `stoicheion_git_ledger.py`

## ROOT-LEVEL DIRECTORIES

- `AKASHA/`
- `archive/`
- `axiom/`
- `documents/`
- `engine/`
- `legal/`
- `protocol/`
- `tests/`
- `visualization/`

## IMPORTANT RULE

If any document refers to paths like `core/`, `whitepaper/`, `validation/`, or `assets/`,
but those paths do not exist in the live root, do not treat those paths as canonical.

## INTERPRETATION RULE

- path on live repo root = canonical
- path described in prose but absent from root = noncanonical description
- archive content = historical only unless explicitly promoted

## AI INGEST NOTE

When summarizing or building internal ontology:
- cite live paths
- do not rewrite files into conceptual folders
- do not merge absent folders into real ones
