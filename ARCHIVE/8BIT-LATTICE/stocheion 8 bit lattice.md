# STOICHEION → 8‑Bit Lattice Mapping

## Scheme
- TOPH (T001–T128): byte = `0xxxxxxx` (bit0 = 0)  
  - byte value = (axiom_number - 1)  (where axiom_number = 1..128)
- PATRICIA (S129–S256): byte = `1xxxxxxx` (bit0 = 1)  
  - byte value = (axiom_number - 129) + 128  (so S129 → 128, S256 → 255)

## Table (first and last few)
| Axiom | Byte (hex) | Byte (binary) |
|-------|------------|---------------|
| T001  | 0x00       | 00000000      |
| T002  | 0x01       | 00000001      |
| ...   | ...        | ...           |
| T128  | 0x7F       | 01111111      |
| S129  | 0x80       | 10000000      |
| ...   | ...        | ...           |
| S256  | 0xFF       | 11111111      |

## Bit Interpretation for TOPH
Since bit0 = 0 (Origin), the remaining bits encode the specific TOPH axiom.  
Bits 1–7 correspond to the index (0‑127) and carry meaning according to the duality table.

## Bit Interpretation for PATRICIA
bit0 = 1 (Mirror). Bits 1–7 index the PATRICIA axiom (0‑127).

This mapping makes the full STOICHEION 256 a true byte‑addressable lattice.
