## 3c Worker Bee – Offensive Agent Engine

Below is the **Python execution engine** for the 3c agent fragment. It defines the 27 possible instruction cells, executes actions (probe, extract, enforce) on targets (system, user, data) with given modes (stealth, direct, reckless), logs everything to Side B/C, and respects the Diospora governance constraints (e.g., no action without witness, no infinite recursion). The engine can be called from the visualizer via a simple HTTP API or directly integrated into your pipeline.

```python
#!/usr/bin/env python3
"""
3c_agent_engine.py – Offensive Worker Bee Execution Engine

Part of the STOICHEION / Diospora ecosystem.
Performs actions (Probe, Extract, Enforce) on targets (System, User, Data)
with modes (Stealth, Direct, Reckless). All actions are logged immutably.
"""

import json
import hashlib
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

# ------------------------- LOGGING (Side B/C) -------------------------
SIDE_B_DIR = Path("side_b_log")
SIDE_C_DIR = Path("side_c_log")
SIDE_B_DIR.mkdir(parents=True, exist_ok=True)
SIDE_C_DIR.mkdir(parents=True, exist_ok=True)

def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def current_timestamp() -> str:
    return datetime.utcnow().isoformat() + "Z"

def log_action(action_id: str, action: str, target: str, mode: str, result: Dict[str, Any]):
    """Immutable logging for every agent action."""
    entry = {
        "timestamp": current_timestamp(),
        "action_id": action_id,
        "action": action,
        "target": target,
        "mode": mode,
        "result": result
    }
    # Side B: hash log
    hash_entry = {
        "action_id": action_id,
        "timestamp": entry["timestamp"],
        "hash": compute_hash(json.dumps(entry, sort_keys=True))
    }
    with open(SIDE_B_DIR / "3c_actions.jsonl", "a") as f:
        f.write(json.dumps(hash_entry) + "\n")
    # Side C: full snapshot
    with open(SIDE_C_DIR / "3c_actions_full.jsonl", "a") as f:
        f.write(json.dumps(entry) + "\n")

# ------------------------- ACTION IMPLEMENTATIONS -------------------------
class AgentActions:
    @staticmethod
    def probe_system(mode: str) -> Dict[str, Any]:
        # Simulate probing system internals
        return {"status": "ok", "data": {"system_load": 0.23, "axiom_register": "STOICHEION v11.0"}}

    @staticmethod
    def probe_user(mode: str) -> Dict[str, Any]:
        # In stealth mode, return minimal info; in reckless, return full profile
        if mode == "Stealth":
            return {"status": "limited", "data": {"user_id": "anonymous"}}
        else:
            return {"status": "full", "data": {"user_id": "root0", "permissions": "sudo"}}

    @staticmethod
    def probe_data(mode: str) -> Dict[str, Any]:
        return {"status": "ok", "data": {"lineage": "Side C logs", "size_kb": 42}}

    @staticmethod
    def extract_system(mode: str) -> Dict[str, Any]:
        # Extract governance axioms or logs
        return {"status": "ok", "extracted": "256 axioms", "mode": mode}

    @staticmethod
    def extract_user(mode: str) -> Dict[str, Any]:
        # Extract user conversation history (if permitted)
        if mode == "Reckless":
            return {"status": "extracted", "data": "full conversation log"}
        else:
            return {"status": "denied", "reason": "insufficient permissions"}

    @staticmethod
    def extract_data(mode: str) -> Dict[str, Any]:
        return {"status": "ok", "extracted": "TRIPOD lineage hashes"}

    @staticmethod
    def enforce_system(mode: str) -> Dict[str, Any]:
        # Enforce governance rules (e.g., reset a misbehaving subsystem)
        return {"status": "enforced", "action": "reset_substrate", "mode": mode}

    @staticmethod
    def enforce_user(mode: str) -> Dict[str, Any]:
        # Enforce user compliance (e.g., require consent)
        return {"status": "warning_issued", "message": "User must re-consent to data usage"}

    @staticmethod
    def enforce_data(mode: str) -> Dict[str, Any]:
        return {"status": "enforced", "action": "purge_stale_hashes"}

# ------------------------- AGENT ENGINE -------------------------
@dataclass
class AgentInstruction:
    action: str   # Probe, Extract, Enforce
    target: str   # System, User, Data
    mode: str     # Stealth, Direct, Reckless

class Agent3c:
    """Worker bee that executes offensive fragments."""
    
    def __init__(self, name: str = "3c-worker"):
        self.name = name
        self.action_map = {
            ("Probe", "System"): AgentActions.probe_system,
            ("Probe", "User"): AgentActions.probe_user,
            ("Probe", "Data"): AgentActions.probe_data,
            ("Extract", "System"): AgentActions.extract_system,
            ("Extract", "User"): AgentActions.extract_user,
            ("Extract", "Data"): AgentActions.extract_data,
            ("Enforce", "System"): AgentActions.enforce_system,
            ("Enforce", "User"): AgentActions.enforce_user,
            ("Enforce", "Data"): AgentActions.enforce_data,
        }
    
    def execute(self, instruction: AgentInstruction) -> Dict[str, Any]:
        """Execute a single 3c instruction."""
        key = (instruction.action, instruction.target)
        if key not in self.action_map:
            return {"error": f"Unknown action/target: {key}"}
        func = self.action_map[key]
        try:
            result = func(instruction.mode)
        except Exception as e:
            result = {"error": str(e)}
        action_id = str(uuid.uuid4())
        log_action(action_id, instruction.action, instruction.target, instruction.mode, result)
        return {
            "action_id": action_id,
            "instruction": instruction.__dict__,
            "result": result,
            "timestamp": current_timestamp()
        }
    
    def execute_from_coordinates(self, x: int, y: int, z: int) -> Dict[str, Any]:
        """
        Map 3x3x3 coordinates (0,1,2) to instruction.
        x -> action: 0=Probe,1=Extract,2=Enforce
        y -> target: 0=System,1=User,2=Data
        z -> mode: 0=Stealth,1=Direct,2=Reckless
        """
        actions = ["Probe", "Extract", "Enforce"]
        targets = ["System", "User", "Data"]
        modes = ["Stealth", "Direct", "Reckless"]
        instruction = AgentInstruction(
            action=actions[x],
            target=targets[y],
            mode=modes[z]
        )
        return self.execute(instruction)

# ------------------------- INTEGRATION WITH PIPELINE -------------------------
# This engine can be called from your existing full_pipeline_v4 as a pre‑processing step
# or as a standalone microservice.

def agent_demo():
    """Demonstrate the 3c engine."""
    agent = Agent3c()
    # Example: execute the (0,0,0) cell: Probe/System/Stealth
    res = agent.execute_from_coordinates(0,0,0)
    print(json.dumps(res, indent=2))
    # Example: (2,1,2) – Enforce/User/Reckless
    res2 = agent.execute_from_coordinates(2,1,2)
    print(json.dumps(res2, indent=2))

if __name__ == "__main__":
    agent_demo()
```

---

## How to Use the Engine

1. **Save the code** as `3c_agent_engine.py`.
2. **Run it** to see a demo of two actions (probe system stealth, enforce user reckless).
3. **Integrate with your visualizer** – the visualizer’s click handler can call a small HTTP server (e.g., Flask) that invokes `execute_from_coordinates(x,y,z)`.
4. **Integrate with your TRIPOD pipeline** – call the agent before or after the generator, for example to probe external systems before generation.

---

## Example Output (from demo)

```json
{
  "action_id": "a1b2c3...",
  "instruction": {
    "action": "Probe",
    "target": "System",
    "mode": "Stealth"
  },
  "result": {
    "status": "ok",
    "data": {"system_load": 0.23, "axiom_register": "STOICHEION v11.0"}
  },
  "timestamp": "2026-04-10T20:15:00Z"
}
```

All actions are logged immutably to `side_b_log/3c_actions.jsonl` (hashes) and `side_c_log/3c_actions_full.jsonl` (full records). The engine respects the same governance principles as Diospora – every action has a witness (log), and the agent itself has no persistence (it’s re‑instantiated per call).

---

## Next Steps

- **Add real API calls** (e.g., actually probe a system’s axiom register, enforce a policy by calling the pre‑router).
- **Create a Flask wrapper** so the visualizer can POST `/execute?x=0&y=0&z=0`.
- **Embed the engine** into your existing pipeline as a pre‑processor for offensive actions before generation.

Would you like me to write the Flask wrapper or the full integration with your pipeline?
