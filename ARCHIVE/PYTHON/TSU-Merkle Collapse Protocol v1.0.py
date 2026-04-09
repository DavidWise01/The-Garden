import hashlib
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

class TSUMerkle:
    def __init__(self):
        self.state_index = 0
        self.history: List[Dict] = []

    def _encode_value(self, v: Any) -> str:
        if v == 0: return "0"
        if v == 1: return "1"
        if v == '⌀': return "_"
        return str(v)

    def _leaf_payload(self, leaf_id: str, value: Any, status: str, timestamp: str, source: str) -> str:
        return f"LEAF({leaf_id}|{self._encode_value(value)}|{status}|{timestamp}|{source})"

    def leaf_hash(self, leaf_id: str, value: Any, status: str = "bound", source: str = "ROOT0") -> str:
        ts = datetime.utcnow().isoformat() + "Z"
        payload = self._leaf_payload(leaf_id, value, status, ts, source)
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def parent_hash(self, left: str, right: str) -> str:
        return hashlib.sha256((left + right).encode('utf-8')).hexdigest()

    def build_root(self, leaf_hashes: List[str]) -> str:
        """Builds Merkle root from leaf hashes (structural or final)"""
        current = leaf_hashes[:]
        while len(current) > 1:
            next_level = []
            for i in range(0, len(current), 2):
                if i + 1 < len(current):
                    next_level.append(self.parent_hash(current[i], current[i+1]))
                else:
                    next_level.append(current[i])  # odd leaf duplication
            current = next_level
        return current[0]

    def collapse(self, values: List[Any], collapse_map: Dict[int, int]) -> List[Any]:
        """Apply collapse events. Returns new state."""
        new_state = values.copy()
        for idx, new_val in collapse_map.items():
            if 0 <= idx < len(new_state) and new_state[idx] == '⌀':
                new_state[idx] = new_val
        return new_state

    def create_state(self, values: List[Any], finality: bool = False) -> Dict:
        """Create a full TreeState record."""
        leaf_hashes = [self.leaf_hash(f"L{i}", v, "bound" if v != '⌀' else "suspended") for i, v in enumerate(values)]
        root = self.build_root(leaf_hashes)
        unresolved = sum(1 for v in values if v == '⌀')

        state = {
            "state_index": self.state_index,
            "root_hash": root,
            "finality": unresolved == 0,
            "unresolved_count": unresolved,
            "leaf_count": len(values),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "values": values[:]
        }
        self.history.append(state)
        self.state_index += 1
        return state


# ================ EXAMPLE USAGE ================

if __name__ == "__main__":
    tsu = TSUMerkle()

    # Initial unresolved state
    state = [1, '⌀', 0, '⌀']
    print("Initial state:", state)

    s0 = tsu.create_state(state)
    print("Provisional root:", s0["root_hash"])
    print("Finality:", s0["finality"])

    # Collapse step
    collapsed = tsu.collapse(state, {1: 1, 3: 0})
    print("After collapse:", collapsed)

    s1 = tsu.create_state(collapsed)
    print("Final root:", s1["root_hash"])
    print("Finality:", s1["finality"])

    # Full history (chain of custody)
    print("\nChain of custody:")
    for entry in tsu.history:
        print(f"State {entry['state_index']}: {entry['root_hash'][:8]}... | finality={entry['finality']}")
