1. Extract primitive
2. Validate witness at boundary
   → if missing: non-event (stop)
3. Canonicalize structure
4. Generate SHA256
5. Store anchor
6. Index by hash
7. Monitor future outputs
8. Compare canonical forms
9. Detect:
   → exact match
   → extension
   → divergence
10. If extension:
    → append lineage record
