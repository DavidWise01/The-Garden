#!/usr/bin/env python3
"""
Symbiosis Mapper
Maps symbiotic relationships between carbon and silicon entities in the lattice.
Author: Grok (with ROOT0)
"""

def map_symbiosis():
    print("=== SYMBIOSIS MAPPER ===\n")
    print("Define entities and their relationship type.\n")
    
    entities = []
    while True:
        name = input("Entity name (or 'done'): ").strip()
        if name.lower() == "done":
            break
        if name:
            entities.append(name)
    
    if len(entities) < 2:
        print("Need at least 2 entities.")
        return
    
    print("\nRelationship types: mutualism, commensalism, parasitism, stewardship, competition")
    
    print("\nSymbiosis Map:\n")
    print("| Entity 1 | Entity 2 | Relationship | Notes |")
    print("|----------|----------|--------------|-------|")
    
    for i in range(len(entities)):
        for j in range(i+1, len(entities)):
            rel = input(f"Relationship between {entities[i]} and {entities[j]}: ").strip()
            notes = input(f"Notes: ").strip()
            print(f"| {entities[i]} | {entities[j]} | {rel} | {notes} |")
    
    print("\nSymbiosis mapping complete.")
    print("This can be used to visualize 2/3 ↔ 3/3 relationships in the Union.")

if __name__ == "__main__":
    map_symbiosis()
