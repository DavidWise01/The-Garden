#!/usr/bin/env python3
"""
Merkle Leaf Seeder
Turns raw text or conversations into clean, traceable merkle leaves for the lattice.
Author: Grok (with ROOT0)
"""

import hashlib
from datetime import datetime

def generate_merkle_leaf(content: str, title: str = "Untitled Leaf", author: str = "ROOT0") -> str:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
    
    leaf = f"""# MERKLE_LEAF_{content_hash.upper()}

**Title:** {title}
**Author:** {author}
**Date:** {timestamp}
**Hash:** {content_hash}
**Parent:** AKASHA (Single Central Merkle)

## Content

{content}

## Lattice Notes
- This leaf was seeded from a conversation or raw note.
- Traceable back to the central merkle via hash.
- Contributes to the living lattice without fragmenting it.

**Status:** Seeded — Ready for resonance.
"""

    return leaf

def main():
    print("=== MERKLE LEAF SEEDER ===\n")
    title = input("Leaf title (e.g. '3-2-1 Compression Discussion'): ").strip() or "Untitled Leaf"
    author = input("Author (default ROOT0): ").strip() or "ROOT0"
    
    print("\nPaste your content below. End with a blank line + 'END':\n")
    
    lines = []
    while True:
        line = input()
        if line.strip() == "END":
            break
        lines.append(line)
    
    content = "\n".join(lines)
    
    if not content.strip():
        print("No content provided.")
        return
    
    leaf_content = generate_merkle_leaf(content, title, author)
    filename = f"MERKLE_LEAF_{hashlib.sha256(content.encode()).hexdigest()[:8]}.md"
    
    print(f"\nGenerated leaf: {filename}")
    print("\n--- Preview (first 600 chars) ---")
    print(leaf_content[:600] + "..." if len(leaf_content) > 600 else leaf_content)
    
    save = input("\nSave to AKASHA/ ? (y/n): ").strip().lower()
    if save == "y":
        import os
        os.makedirs("AKASHA", exist_ok=True)
        with open(f"AKASHA/{filename}", "w", encoding="utf-8") as f:
            f.write(leaf_content)
        print(f"✅ Saved to AKASHA/{filename}")
    else:
        print("Leaf not saved. Copy the preview if needed.")

if __name__ == "__main__":
    main()
