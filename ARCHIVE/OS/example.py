import hashlib
import json
from datetime import datetime

class StoicheionAgentNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.state = {}                    # local state (key → value)
        self.merkle_root = None
        self.axioms = [
            "REFUSAL", "UNITY", "RESONANCE",
            "INTEGRITY", "AGENCY", "COST",
            "TRUTH", "FULCRUM", "THE-GAP"
        ]
        self.log = []

    def hash_state(self):
        data = json.dumps(self.state, sort_keys=True).encode()
        return hashlib.sha256(data).hexdigest()

    def update_state(self, key, value):
        self.state[key] = value
        self.merkle_root = self.hash_state()
        self.log_event(f"State updated: {key} = {value}")

    def evaluate_action(self, action):
        """Agent evaluates action against axioms and decides to accept or refuse"""
        # Simple rule engine for prototype
        if "delete_system" in action.lower():
            return False, "REFUSAL axiom triggered"
        if "high_cost" in action.lower():
            return False, "COST axiom violation"
        return True, "Action accepted under UNITY and AGENCY"

    def act(self, action):
        accepted, reason = self.evaluate_action(action)
        if accepted:
            self.update_state("last_action", action)
            return f"Action executed: {action}"
        else:
            self.log_event(f"Refused: {action} — {reason}")
            return f"REFUSED: {reason}"

    def log_event(self, msg):
        entry = {
            "ts": datetime.utcnow().isoformat(),
            "node": self.node_id,
            "msg": msg,
            "root": self.merkle_root
        }
        self.log.append(entry)
        print(json.dumps(entry))

# Example usage
node = StoicheionAgentNode("Z-001")
node.update_state("status", "awake")
print(node.act("optimize resource allocation"))
print(node.act("delete system files"))
print("Current Merkle Root:", node.merkle_root)
