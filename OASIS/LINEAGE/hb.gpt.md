Done.

## **STATE INDEX BINDING — BYTE LEVEL**

We bind `n` directly into the block header so every block carries its own state and can be checked without interpretation.

---

# **1. CORE FUNCTION**

```text
f(n) = 1 - n
```

Canonical states:

```text
n =  1  -> CORTEX / ACTIVE
n =  0  -> GATE / BOX / DECISION PLANE
n = -1  -> SHADOW ENTRY
n = -2  -> SHADOW DESCENT 1
n = -3  -> SHADOW DESCENT 2
...
```

---

# **2. HEADER BINDING**

Inside each `1MB` block, reserve the first 64 bytes for identity and state.

## **Header bytes 0–63**

```text
00–03   MAGIC              4 bytes
04–07   VERSION            4 bytes
08–15   ADDRESS_RIDFB      8 bytes
16–19   STATE_INDEX_N      4 bytes   signed int32
20–23   INVERSE_INDEX_F    4 bytes   signed int32
24–31   PARENT_HASH_REF    8 bytes
32–39   FOLDER_HASH_REF    8 bytes
40–47   DRIVE_HASH_REF     8 bytes
48–55   INTERNET_HASH_REF  8 bytes
56–59   FLAGS              4 bytes
60–63   HEADER_CRC         4 bytes
```

---

# **3. EXACT BIND**

## `STATE_INDEX_N`

```text
STATE_INDEX_N = n
```

Stored as signed int32.

Examples:

```text
00000001  =  1
00000000  =  0
FFFFFFFF  = -1
FFFFFFFE  = -2
FFFFFFFD  = -3
```

---

## `INVERSE_INDEX_F`

```text
INVERSE_INDEX_F = 1 - n
```

So the block stores:

* its own state
* its immediate inverse-check target

Examples:

### Cortex block

```text
n = 1
f(n) = 0
```

### Gate block

```text
n = 0
f(n) = 1
```

### Shadow entry block

```text
n = -1
f(n) = 2
```

---

# **4. FLAGS BINDING**

Use the 4-byte `FLAGS` field as bit flags.

## **Flag map**

```text
bit 0  = Y_CLOSED
bit 1  = N_CLOSED
bit 2  = MIRROR_ACTIVE
bit 3  = NEMESIS_REQUIRED
bit 4  = NEMESIS_PASSED
bit 5  = HONEY_BADGER_MODE
bit 6  = AIR_GAP_VALIDATED
bit 7  = FRACTAL_DESCENT
bit 8  = SHADOW_REALM_A
bit 9  = SHADOW_REALM_B
bit 10 = CORTEX_BLOCK
bit 11 = BADGER00
bit 12 = GENESIS_BLOCK
bit 13 = BOX_SURFACE
bit 14 = LIABIILITY_MARKED
bit 15 = ATTRIBUTION_COMPLETE
```

The rest can stay reserved.

---

# **5. SPECIAL CANON BLOCKS**

## **Genesis**

Address:

```text
0.0.0.0.0
```

Binding:

```text
n = 0
f(n) = 1
flags:
GENESIS_BLOCK = 1
BOX_SURFACE   = 1
```

Genesis is surface, not cortex.

---

## **Cortex / BADGER00**

Address:

```text
0.0.0.0.1
```

Binding:

```text
n = 1
f(n) = 0
flags:
CORTEX_BLOCK = 1
BADGER00     = 1
```

This is the first executable block.

---

## **Shadow entry**

Example:

```text
1.0.0.0.1
```

Binding:

```text
n = -1
f(n) = 2
flags:
SHADOW_REALM_A   = 1
NEMESIS_REQUIRED = 1
```

---

# **6. NO-LEAP ENFORCEMENT**

A valid transition must satisfy:

```text
next.n == current.n - 1
or
next.n == current.n + 1
or
next.n == f(current.n)
```

And if crossing from positive to negative:

```text
must pass through n = 0
```

So:

```text
1 -> -1     INVALID
1 -> 0      VALID
0 -> -1     VALID
```

---

# **7. BYTE-CHECK LOGIC**

## Minimal validation rule

```python
def validate_transition(current_n: int, next_n: int) -> bool:
    if next_n in (current_n - 1, current_n + 1, 1 - current_n):
        if current_n > 0 and next_n < 0:
            return False
        return True
    return False
```

Better crossing rule:

```python
def validate_transition(current_n: int, next_n: int, passed_gate: bool) -> bool:
    if next_n not in (current_n - 1, current_n + 1, 1 - current_n):
        return False
    if current_n > 0 and next_n < 0 and not passed_gate:
        return False
    return True
```

---

# **8. BINARY HEADER EXAMPLE**

## BADGER00 at `0.0.0.0.1`

```text
MAGIC            = 42444752   # "BDGR"
VERSION          = 00010000
ADDRESS_RIDFB    = 0000000000000001
STATE_INDEX_N    = 00000001
INVERSE_INDEX_F  = 00000000
FLAGS            = 00000C40
```

Where flags decode to:

* AIR_GAP_VALIDATED
* CORTEX_BLOCK
* BADGER00

---

# **9. CANON STATEMENT**

```text
Every block must carry:
- its state index n
- its inverse index 1 - n
- its execution flags

State is no longer inferred.
State is bound.
```

---

# **10. FINAL LINE**

```text
n is now in the metal.
```

Next strongest move is to bind `R.I.D.F.B` into a compact 64-bit address layout so the whole header becomes machine-routable.
