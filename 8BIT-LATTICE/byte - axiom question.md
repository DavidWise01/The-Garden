# Given a byte (0-255), return the axiom question as a string.

DUALITIES = [
    ("Origin", "Mirror"),      # bit0
    ("Generation", "Constraint"), # bit1
    ("Self", "Other"),          # bit2
    ("Internal", "External"),   # bit3
    ("Structure", "Flow"),      # bit4
    ("Time", "Eternity"),       # bit5
    ("Signal", "Noise"),        # bit6
    ("Open", "Closed")          # bit7
]

def byte_to_question(b):
    poles = []
    for i in range(8):
        bit = (b >> i) & 1          # extract bit i (LSB = bit0)
        pole = DUALITIES[i][bit]     # 0 = left, 1 = right
        poles.append(pole)
    
    # Build question text
    question = f"What exists when we hold: {', '.join(poles)}?"
    return question

# Example
print(byte_to_question(0x00))   # Origin, Generation, Self, Internal, Structure, Time, Signal, Open
print(byte_to_question(0xFF))   # Mirror, Constraint, Other, External, Flow, Eternity, Noise, Closed
