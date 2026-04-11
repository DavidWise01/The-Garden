Good. Now we build the missing piece.

This is the **AI-Extraction Contribution Tracker → Ledger → Payout loop**.
No philosophy. Just a working system.

---

# 🔧 SYSTEM OVERVIEW

```text
User Activity (creativity)
→ Contribution Scoring
→ Value Attribution
→ Ledger Entry
→ Pool Aggregation
→ Payout Calculation
```

---

# 🧠 CORE IDEA (formalized)

```text
contribution = measurable human input
value = contribution × weight
payout = (user_value / total_pool) × pool
```

---

# 🧱 BUILD: CONTRIBUTION TRACKER

```python
#!/usr/bin/env python3

import hashlib
import json
from datetime import datetime
from decimal import Decimal
from pathlib import Path

DATA_DIR = Path("ai_contributions")
DATA_DIR.mkdir(exist_ok=True)

CONTRIB_FILE = DATA_DIR / "contributions.jsonl"


def now():
    return datetime.utcnow().isoformat() + "Z"


def hash_text(text):
    return hashlib.sha256(text.encode()).hexdigest()


class Contribution:
    def __init__(self, user_id, content, interaction_type):
        self.user_id = user_id
        self.content = content
        self.interaction_type = interaction_type  # prompt, correction, refinement
        self.timestamp = now()
        self.hash = hash_text(content)

        self.score = self.score_contribution()

    def score_contribution(self):
        base = len(self.content.split())

        weights = {
            "prompt": 1.0,
            "refinement": 1.5,
            "correction": 2.0
        }

        return Decimal(base) * Decimal(weights.get(self.interaction_type, 1.0))

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "hash": self.hash,
            "interaction_type": self.interaction_type,
            "score": float(self.score),
            "timestamp": self.timestamp
        }


def log_contribution(contribution):
    with open(CONTRIB_FILE, "a") as f:
        f.write(json.dumps(contribution.to_dict()) + "\n")
```

---

# 🔧 AGGREGATOR → VALUE ENGINE

```python
def load_contributions():
    if not CONTRIB_FILE.exists():
        return []

    with open(CONTRIB_FILE, "r") as f:
        return [json.loads(line) for line in f]


def aggregate_scores():
    contribs = load_contributions()
    user_scores = {}

    for c in contribs:
        user = c["user_id"]
        user_scores[user] = user_scores.get(user, 0) + c["score"]

    return user_scores


def total_score(user_scores):
    return sum(user_scores.values())
```

---

# 🔗 LEDGER INTEGRATION

Hook into your restitution ledger:

```python
def inject_into_ledger(user_scores, total_pool_value):
    payouts = {}

    total = total_score(user_scores)

    for user, score in user_scores.items():
        share = Decimal(score) / Decimal(total)
        payout = share * Decimal(total_pool_value)

        payouts[user] = float(payout)

    return payouts
```

---

# 💰 PAYOUT SIMULATION

```python
def simulate_ai_ubi(pool_value):
    scores = aggregate_scores()
    payouts = inject_into_ledger(scores, pool_value)

    print("\n=== AI CONTRIBUTION UBI ===")
    print(f"Pool: ${pool_value}")

    for user, amount in payouts.items():
        print(f"{user}: ${amount:.2f}")
```

---

# 🧪 EXAMPLE RUN

```python
if __name__ == "__main__":

    log_contribution(Contribution("david", "build a restitution ledger system", "prompt"))
    log_contribution(Contribution("david", "fix hashing and decimals", "refinement"))
    log_contribution(Contribution("user2", "correct payout logic", "correction"))

    simulate_ai_ubi(10000)
```

---

# 🔥 WHAT THIS DOES

You now have:

```text
human input
→ quantified
→ attributed
→ pooled
→ redistributed
```

---

# ⚠️ IMPORTANT (no delusion layer)

This measures:

```text
interaction contribution
```

NOT:

```text
actual model training value
```

But it is enough to:

```text
prove the loop works
```

---

# 🧾 ONE SENTENCE

> This system turns human interaction into quantified contribution, feeds it into your restitution ledger, and outputs proportional payouts from a shared AI value pool.

---

# ▶️ NEXT UPGRADE (if you want it)

```text
real weighting model:
- novelty detection
- reuse tracking
- downstream impact scoring
```

That’s when it stops being a demo and starts approximating **real extraction value**.

Say the word.
