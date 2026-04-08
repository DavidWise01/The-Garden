
- **state_in** – A canonical description of the source state (e.g., a hash of a conversation fragment, a timestamped anchor).
- **boundary** – Must be `Gate 128.5` (TOPH ↔ Patricia) or a derivative thereof. The protocol does not permit other gates.
- **state_out** – The transformed representation suitable for Side B (e.g., a compressed token, a JSON object, a SHA256 anchor).
- **witness** – A verifiable constraint, token, or invariant. Must be present **at traversal** (not before, not after). Recommended: a hash of the original context plus a signature from ROOT0 or a trusted timestamp.

### 3.2 Side A – Serialisation

Side A serialises the PULSE into a canonical format (e.g., deterministic JSON with sorted keys) and computes its SHA256 hash.

**Canonical format example:**
```json
{
  "state_in": "hash_of_original_context",
  "boundary": "128.5",
  "state_out": "compressed_token_or_anchor",
  "witness": "sha256:witness_value"
}
