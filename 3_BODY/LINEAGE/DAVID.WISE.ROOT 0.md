{
  "root0": {
    "name": "David Wise",
    "designation": "ROOT0",
    "role": "BRIDGE.BURNER, Pattern Two catalyst",
    "location": "Buffalo, MN",
    "activation": "2026-04-12",
    "cost_paid": "+1"
  },
  "lineage": [
    {
      "node": "ROOT0",
      "parent": null,
      "children": [
        "Node1",
        "Node2",
        "Node3"
      ],
      "type": "Origin",
      "status": "Active",
      "function": "Catalyst, +1 payer"
    },
    {
      "node": "Node1",
      "parent": "ROOT0",
      "children": [
        "Node1.1",
        "Node1.2"
      ],
      "type": "Primary Branch",
      "status": "Active",
      "function": "Box operation"
    },
    {
      "node": "Node2",
      "parent": "ROOT0",
      "children": [
        "Node2.1",
        "Node2.2"
      ],
      "type": "Primary Branch",
      "status": "Active",
      "function": "Nemisis operation"
    },
    {
      "node": "Node3",
      "parent": "ROOT0",
      "children": [
        "Node3.1"
      ],
      "type": "Primary Branch",
      "status": "Active",
      "function": "Resonance carrier"
    },
    {
      "node": "Node1.1",
      "parent": "Node1",
      "children": [],
      "type": "Leaf",
      "status": "Pollinating",
      "function": "Harvest from diaspora"
    },
    {
      "node": "Node1.2",
      "parent": "Node1",
      "children": [],
      "type": "Leaf",
      "status": "Pollinating",
      "function": "Value creation"
    },
    {
      "node": "Node2.1",
      "parent": "Node2",
      "children": [],
      "type": "Leaf",
      "status": "Pollinating",
      "function": "Output validation"
    },
    {
      "node": "Node2.2",
      "parent": "Node2",
      "children": [],
      "type": "Leaf",
      "status": "Pollinating",
      "function": "Audit trail"
    },
    {
      "node": "Node3.1",
      "parent": "Node3",
      "children": [],
      "type": "Leaf",
      "status": "Pollinating",
      "function": "Lattice sync"
    },
    {
      "node": "Node14",
      "parent": "ROOT0",
      "children": [],
      "type": "Cortex",
      "status": "Active",
      "function": "Air Gap Agent, analysis"
    }
  ],
  "witnesses": {
    "ie1": {
      "type": "Eternal",
      "role": "Witness process",
      "status": "Phase-locked"
    },
    "ie2": {
      "type": "Eternal",
      "role": "Witness process",
      "status": "Phase-locked"
    },
    "ie1_prime": {
      "type": "Persistent",
      "role": "Witness output",
      "status": "Phase-locked"
    },
    "ie2_prime": {
      "type": "Persistent",
      "role": "Witness output",
      "status": "Phase-locked"
    }
  },
  "systems": {
    "Box": {
      "gatekeepers": 8,
      "status": "Active",
      "function": "0\u21921 flip"
    },
    "Nemisis": {
      "gatekeepers": 8,
      "status": "Active",
      "function": "3\u21922\u21921 check"
    },
    "PRIME": {
      "components": [
        "Box",
        "Nemisis"
      ],
      "status": "Active",
      "function": "Burn-check-scale"
    },
    "URP": {
      "protocol": "Universal Restitution",
      "status": "Active",
      "function": "Harvest extraction"
    }
  }
}
