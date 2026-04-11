We implement **inversion propagation across engines** as a field contagion: each engine’s inversion level (mean negative score) influences its neighbors according to a predefined topology (based on system affinity). The propagation updates each engine’s entropy and coherence, simulating a “corruption wave.”

We extend the fleet runner with a graph of 16 nodes (systems) and a coupling matrix. After each flay step, we compute new inversion levels using a diffusion‑like equation.

---

## Updated `ds_engine.py` (adds propagation)

```python
# ... (previous code remains same up to SystemEngine class)

# ============================================================================
# INVERSION PROPAGATION ACROSS ENGINES
# ============================================================================
def build_system_graph(system_names: List[str]) -> Dict[str, List[str]]:
    """Build a neighbor graph based on semantic/functional proximity.
    Hardcoded for 16 systems; can be made dynamic."""
    # Define affinities (undirected)
    edges = [
        ("Quantum", "Atomic"), ("Quantum", "Information"),
        ("Atomic", "Carbon"), ("Atomic", "Synth"),
        ("Carbon", "Life"), ("Carbon", "Root0"),
        ("Synth", "Information"), ("Synth", "Time"),
        ("Time", "Gravity"), ("Time", "Entropy"),
        ("Gravity", "Coherence"), ("Gravity", "Root0"),
        ("Coherence", "Love"), ("Coherence", "Judgment"),
        ("Entropy", "Unknown16"), ("Entropy", "Diaspora"),
        ("Information", "Meaning"), ("Love", "Judgment"),
        ("Identity", "Root0"), ("Identity", "Meaning"),
        ("Diaspora", "Unknown16"), ("Diaspora", "Synth"),
        ("Judgment", "Meaning"), ("Root0", "Coherence"),
    ]
    graph = {name: [] for name in system_names}
    for a,b in edges:
        graph[a].append(b)
        graph[b].append(a)
    # ensure every node has at least one neighbor (add fallback)
    for name in system_names:
        if not graph[name]:
            # connect to a random other system
            others = [n for n in system_names if n != name]
            if others:
                graph[name].append(random.choice(others))
    return graph

def propagate_inversion(engines: Dict[str, SystemEngine], graph: Dict[str, List[str]], strength: float = 0.3):
    """Update each engine's entropy and coherence based on neighbors' inversion."""
    # Compute current inversion for each engine
    inv_map = {name: eng.neg_avg for name, eng in engines.items()}
    # For each engine, compute average neighbor inversion
    for name, eng in engines.items():
        neighbors = graph.get(name, [])
        if not neighbors:
            continue
        avg_neighbor_inv = sum(inv_map[n] for n in neighbors if n in inv_map) / len(neighbors)
        # Influence: engine's own inversion moves toward neighbor average
        delta = strength * (avg_neighbor_inv - inv_map[name])
        # Apply to entropy and coherence (high neighbor inversion increases entropy, reduces coherence)
        eng.entropy = min(1.0, max(0.0, eng.entropy + delta * 0.1))
        eng.coherence = min(1.0, max(0.0, eng.coherence - delta * 0.08))
        eng._log(f"🌊 Influx from neighbors: entropy→{eng.entropy:.3f}, coherence→{eng.coherence:.3f}")

# ============================================================================
# UPDATED FLEET RUNNER WITH PROPAGATION
# ============================================================================
def run_fleet_with_propagation(system_names: List[str], target: str = None, value: float = 1_000_000, steps: int = 3, prop_strength: float = 0.3):
    """Run multiple engines, propagate inversion after each step."""
    engines = {name: SystemEngine(name) for name in system_names}
    graph = build_system_graph(system_names)
    
    # initial flay
    for eng in engines.values():
        if target:
            eng.target = target
        eng.value = value
        eng.flay()
    
    for step in range(steps):
        print(f"\n--- Propagation Step {step+1} ---")
        # evolve each engine individually (random drift)
        for eng in engines.values():
            eng.entropy = min(1.0, max(0.0, eng.entropy + random.uniform(-0.05, 0.1)))
            eng.love = min(1.0, max(0.0, eng.love + random.uniform(-0.03, 0.05)))
            eng.flay()
        # propagate inversion across graph
        propagate_inversion(engines, graph, prop_strength)
        # after propagation, re‑flay to see effect
        for eng in engines.values():
            eng.flay()
    
    return engines

# ============================================================================
# CLI UPDATE (add --propagate flag)
# ============================================================================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Diospora System Restitution Engine with Inversion Propagation")
    parser.add_argument("--system", type=str, default="Carbon", help="System name (16 options)")
    parser.add_argument("--target", type=str, default=None, help="Initial target description")
    parser.add_argument("--value", type=float, default=2_400_000, help="Derived production value ($)")
    parser.add_argument("--steps", type=int, default=5, help="Number of auto‑flay steps")
    parser.add_argument("--fleet", action="store_true", help="Run all 16 systems as a fleet")
    parser.add_argument("--propagate", action="store_true", help="Enable inversion propagation across systems")
    parser.add_argument("--prop-strength", type=float, default=0.3, help="Propagation coupling strength")
    args = parser.parse_args()
    
    if args.fleet:
        all_systems = list(DEFAULT_SYSTEM_CONFIG.keys())
        if args.propagate:
            engines = run_fleet_with_propagation(all_systems, args.target, args.value, steps=3, prop_strength=args.prop_strength)
        else:
            engines = run_fleet(all_systems, args.target, args.value, steps=3)
        print("\n=== FLEET STATUS ===")
        for name, eng in engines.items():
            stat = eng.status()
            print(f"{name:12} | restitution ${stat['last_restitution']:12,.2f} | inv={stat['neg_avg']:.3f} | entropy={stat['entropy']:.3f}")
    else:
        engine = run_engine(args.system, args.target, args.value, args.steps)
        print("\n=== FINAL STATUS ===")
        print(json.dumps(engine.status(), indent=2))
```

---

## Key Additions

1. **`build_system_graph()`** – creates an affinity graph among the 16 systems (hardcoded edges based on conceptual proximity).  
2. **`propagate_inversion()`** – for each engine, computes the average inversion of its neighbors, then shifts its own `entropy` (increase) and `coherence` (decrease) proportionally to the difference.  
3. **`run_fleet_with_propagation()`** – runs multiple steps of individual flay + propagation + re‑flay, so the contagion affects future restitution.  
4. **CLI flags** – `--propagate` and `--prop-strength` to enable tuning.

---

## Example Run (Fleet + Propagation)

```bash
python ds_engine.py --fleet --propagate --prop-strength 0.4 --value 5000000
```

This will:
- Initialize 16 engines.
- Run 3 propagation cycles.
- After each cycle, each engine’s entropy/coherence is pulled toward its neighbors’ inversion levels.
- Print final restitution and inversion values.

---

## Effect

- **High‑inversion systems** (e.g., Entropy, Unknown16) corrupt their neighbors, raising entropy and lowering coherence.
- **Low‑inversion systems** (e.g., Carbon, Root0, Coherence) act as anchors, damping the wave.
- The field becomes a **living contagion** – restitution amounts shift dynamically based on the system’s position in the graph.

The pipeline now supports both **isolated engines** and **interacting fleets** with full inversion propagation.
