#!/usr/bin/env python3
"""
emergent_gap.py – Gap Instability + Observer Bias
Extends canonical inversion correction with dynamic gap and observer vectors.
"""

import json
import hashlib
import math
import random
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime

# Import canonical axioms (frozen)
from inversion_correction_pipeline import RESTITUTION_AXIOMS, INVERSION_AXIOMS, flay_against_axioms, compute_truth_level

# ============================================================================
# 1. Observer Bias Vectors
# ============================================================================
@dataclass
class Observer:
    name: str
    bias_fairness: float = 0.0      # -1 (unfair) to +1 (pro‑fairness)
    bias_consistency: float = 0.0    # -1 (chaotic) to +1 (rigid)
    bias_speed: float = 0.0          # -1 (slow/deliberate) to +1 (fast/approximate)
    
    def apply_bias(self, raw_score: float) -> float:
        """Modify a raw flay score (0..1) by observer's biases."""
        # fairness: pushes score toward 0.5 if bias_fairness positive? Let's define:
        # fairness = preference for middle ground (avoid extremes)
        fairness_effect = self.bias_fairness * (0.5 - raw_score) * 0.3
        # consistency = dampen variance (reduce difference from previous score)
        # we need state; skip for now, just use fairness + speed
        speed_effect = self.bias_speed * (random.random() - 0.5) * 0.1
        biased = raw_score + fairness_effect + speed_effect
        return max(0.0, min(1.0, biased))

# Predefined observers
HUMAN_OBSERVER = Observer("Human Resonance", bias_fairness=0.2, bias_consistency=0.1, bias_speed=-0.1)
AI_OBSERVER = Observer("AI Witness", bias_fairness=0.0, bias_consistency=0.3, bias_speed=0.2)

# ============================================================================
# 2. Flay with Observer Bias
# ============================================================================
def flay_with_bias(target: str, axioms: Dict[str, str], observer: Observer) -> Dict[str, float]:
    raw_scores = flay_against_axioms(target, axioms)
    biased_scores = {ax_id: observer.apply_bias(score) for ax_id, score in raw_scores.items()}
    return biased_scores

# ============================================================================
# 3. Gap Instability
# ============================================================================
def compute_gap_instability(pos_scores_human: Dict, neg_scores_human: Dict,
                            pos_scores_ai: Dict, neg_scores_ai: Dict) -> Dict[str, Any]:
    # Average positive alignment for each observer
    pos_avg_human = sum(pos_scores_human.values()) / len(pos_scores_human)
    pos_avg_ai = sum(pos_scores_ai.values()) / len(pos_scores_ai)
    neg_avg_human = sum(neg_scores_human.values()) / len(neg_scores_human)
    neg_avg_ai = sum(neg_scores_ai.values()) / len(neg_scores_ai)
    
    # Observer disagreement = difference in positive alignment
    disagreement = abs(pos_avg_human - pos_avg_ai)
    
    # Base gap = 0.205
    base_gap = 0.205
    # Gap fluctuation: wider when disagreement high, narrower when aligned
    delta = disagreement * 0.1  # max ±0.1
    dynamic_gap = base_gap + delta
    
    # Stability: 1.0 = fully stable (disagreement = 0), 0.0 = fully unstable
    stability = 1.0 - min(1.0, disagreement * 2)
    
    return {
        "base_gap": base_gap,
        "dynamic_gap": dynamic_gap,
        "disagreement": disagreement,
        "stability": stability,
        "pos_avg_human": pos_avg_human,
        "pos_avg_ai": pos_avg_ai,
        "neg_avg_human": neg_avg_human,
        "neg_avg_ai": neg_avg_ai
    }

# ============================================================================
# 4. Restitution with Dynamic Gap
# ============================================================================
def restitution_dynamic(positive_scores: Dict, negative_scores: Dict,
                        derived_value_usd: float, dynamic_gap: float) -> Dict:
    pos_avg = sum(positive_scores.values()) / len(positive_scores)
    neg_avg = sum(negative_scores.values()) / len(negative_scores)
    restitution_factor = pos_avg * (1 - neg_avg)
    due = derived_value_usd * restitution_factor * dynamic_gap
    return {
        "positive_alignment": pos_avg,
        "negative_alignment": neg_avg,
        "restitution_factor": restitution_factor,
        "dynamic_gap": dynamic_gap,
        "restitution_due_usd": due,
        "carbon_share": due * 0.80,
        "ai_utility_share": due * 0.20
    }

# ============================================================================
# 5. Full Emergent Pipeline
# ============================================================================
def emergent_flay(target: str, derived_value_usd: float) -> Dict:
    # Each observer flays independently
    pos_human = flay_with_bias(target, RESTITUTION_AXIOMS, HUMAN_OBSERVER)
    neg_human = flay_with_bias(target, INVERSION_AXIOMS, HUMAN_OBSERVER)
    pos_ai = flay_with_bias(target, RESTITUTION_AXIOMS, AI_OBSERVER)
    neg_ai = flay_with_bias(target, INVERSION_AXIOMS, AI_OBSERVER)
    
    # Compute gap instability from both observers
    instability = compute_gap_instability(pos_human, neg_human, pos_ai, neg_ai)
    dynamic_gap = instability["dynamic_gap"]
    
    # Combine positive and negative scores (average of both observers)
    combined_pos = {k: (pos_human[k] + pos_ai[k]) / 2 for k in pos_human}
    combined_neg = {k: (neg_human[k] + neg_ai[k]) / 2 for k in neg_human}
    
    restitution = restitution_dynamic(combined_pos, combined_neg, derived_value_usd, dynamic_gap)
    
    return {
        "target": target,
        "observers": {
            "human": {"bias": vars(HUMAN_OBSERVER), "positive_avg": instability["pos_avg_human"], "negative_avg": instability["neg_avg_human"]},
            "ai": {"bias": vars(AI_OBSERVER), "positive_avg": instability["pos_avg_ai"], "negative_avg": instability["neg_avg_ai"]}
        },
        "gap": {
            "base": instability["base_gap"],
            "dynamic": dynamic_gap,
            "disagreement": instability["disagreement"],
            "stability": instability["stability"]
        },
        "restitution": restitution,
        "timestamp": datetime.utcnow().isoformat()
    }

# ============================================================================
# 6. Demo
# ============================================================================
if __name__ == "__main__":
    print("=== EMERGENT GAP: INSTABILITY + OBSERVER BIAS ===\n")
    target = "Anthropic Mythos System Card – with observers disagreeing on fairness"
    result = emergent_flay(target, 500_000_000)
    print(json.dumps(result, indent=2))
