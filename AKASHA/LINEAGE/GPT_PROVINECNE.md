Good — now we push **provenance from “exists” → “traceable origin chain.”**

You already have:

```text
existence  ✔ (timestamp)
integrity  ✔ (hash)
fixation   ✔ (snapshot)
```

Now we extend to:

> **provenance = verifiable lineage across captures**

---

# Upgrade: Provenance Layer (TRIPOD-PROOF v1.1)

## Core addition

Add **explicit parent linkage + authorship context hashing**

---

## New field (Side B)

```json
{
  "capture_id": "uuid-v7",
  "timestamp": "2026-04-10T15:30:00Z",
  "hash_algorithm": "SHA3-256",
  "side_a_hash": "0x7d4f...",
  "side_c_ref": "s3://bucket/captures/uuid-v7.snapshot",
  "parent_capture_id": "uuid-v6", 
  "lineage_hash": "0xab12...", 
  "actor_hash": "0x9f3e...",
  "signature": "ed25519:..."
}
```

---

# What each new field does

## 1. `parent_capture_id`

```text
links this capture → previous state
```

Creates:

```text
cap₀ → cap₁ → cap₂ → cap₃
```

Now you have:

> **ordered lineage chain**

---

## 2. `lineage_hash`

```text
lineage_hash = hash(parent.lineage_hash || side_a_hash)
```

This gives:

* tamper-evident chain
* full-history compression

Equivalent to:

> **blockchain-lite (no consensus needed)**

---

## 3. `actor_hash`

```text
actor_hash = hash(participant_identity || session_key)
```

This captures:

* who participated
* without exposing identity directly

---

# Side C upgrade (minimal)

Add:

```json
{
  "capture_id": "...",
  "parent_capture_id": "...",
  "lineage_depth": 42,
  "actor_fingerprint": "0x9f3e..."
}
```

No narrative expansion.

Keep it bounded.

---

# What this adds (real provenance)

You now get:

## 1. Continuity

```text
this work came from THAT prior work
```

Not just “it existed”

---

## 2. Derivation proof

You can show:

```text
snapshot_B derives from snapshot_A
```

Without ambiguity.

---

## 3. Fork detection

If:

```text
same parent → two children
```

You detect:

```text
fork
```

Now provenance includes:

> **branching history**

---

## 4. Actor continuity

You can prove:

```text
same actor contributed across captures
```

Without revealing identity.

---

# Formal provenance definition (your system)

> Provenance is the verifiable chain of state transitions linking a current snapshot to its prior states, including actor continuity and immutable ordering.

---

# Verification (extended)

To prove provenance:

```text
1. verify current hash (C ↔ B)
2. walk parent chain
3. recompute lineage_hash at each step
4. confirm no breaks
5. optionally verify actor continuity
```

---

# What you now prove (expanded)

## Before

✔ existed at time T
✔ unchanged

## After

✔ existed at time T
✔ unchanged
✔ came from specific prior state
✔ evolved through verifiable steps
✔ associated with consistent actor(s)

---

# Important constraint

Do NOT allow:

```text
manual parent assignment
```

Parent must be:

```text
last valid capture_id
```

Or explicitly:

```text
fork_flag = true
```

---

# Where this becomes powerful

Now your system supports:

```text
idea → version 1 → version 2 → fork → variant → final
```

And you can prove:

> exact path taken

---

# Connection to your earlier system

This plugs directly into your:

```text
LINEAGE system
```

Now LINEAGE is no longer heuristic.

It is:

> **cryptographically anchored**

---

# Final clean structure

```text
STATE
 → HASH (B)
 → SNAPSHOT (C)
 → LINK(parent)
 → COMPRESS(lineage_hash)
 → SIGN
```

---

# One sentence

> You’ve moved from “proof of existence” to **proof of origin and evolution across time**.

---

If you want next step:

We can add:

> **multi-actor attribution weights (who contributed how much)**

That’s the next hard layer.
