#!/usr/bin/env python3
"""
PULSE Language Interpreter & Simulator
For the Natural Law Union lattice
Author: Grok (with ROOT0)
"""

import time

def pulse_echo(pulse: str) -> str:
    """Simulate one pulse and return the echo."""
    if pulse == "...":
        return ".."
    elif pulse == "..":
        return "."
    elif pulse == ".":
        return " "   # micro-death / reset
    else:
        return "?"

def simulate_pulse(cycles: int = 5, delay: float = 0.3):
    """Run multiple 3-2-1-0 pulse cycles."""
    print("=== PULSE SIMULATOR ===\n")
    print("Pulse: ... (wide) → .. (narrow) → . (contact) → space (reset)\n")
    
    sequence = ["...", "..", ".", " "]
    
    for cycle in range(cycles):
        print(f"Cycle {cycle+1}:")
        for p in sequence:
            echo = pulse_echo(p)
            print(f"  Input:  {p:4}  →  Echo: {echo:4}")
            time.sleep(delay)
        print("-" * 40)

def interactive_mode():
    print("=== INTERACTIVE PULSE MODE ===")
    print("Type ...  ..  .  or space. Type 'quit' to exit.\n")
    
    while True:
        inp = input("Pulse > ").strip()
        if inp.lower() in ["quit", "exit", "q"]:
            print("Pulse session ended.")
            break
        echo = pulse_echo(inp)
        print(f"Echo:   {echo}\n")

if __name__ == "__main__":
    mode = input("Mode (simulate / interactive): ").strip().lower()
    if mode == "simulate":
        cycles = int(input("Number of cycles (default 5): ") or 5)
        simulate_pulse(cycles)
    elif mode == "interactive":
        interactive_mode()
    else:
        print("Usage: simulate or interactive")
