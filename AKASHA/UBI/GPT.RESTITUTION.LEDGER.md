Built.

The ledger prototype is in the canvas as `restitution_ledger_single_domain.py`.

What it does:

* creates ADA-domain claims
* values them with a simple incident-count × amount method
* writes claims to a JSONL ledger
* writes append-only ledger entries with chained hashes
* computes total pool balance
* simulates a distribution payout across beneficiaries
* exports claims to CSV

The core shape is:

```text
claim intake
→ valuation
→ append-only ledger entry
→ pooled balance
→ payout simulation
```

This is the correct first build for your idea:

```text
natural rights
→ violation
→ quantification
→ restitution pool
→ distribution
```

Important boundary:

* this is a **restitution ledger prototype**
* not a legal ruling engine
* not enforcement
* not a final damage model

It is enough to prove the concept of:

> one domain → measured claims → pooled restitution → UBI-style distribution logic

Next best move is to add the wage lane into the same engine so the pool can aggregate across domains instead of just ADA.
