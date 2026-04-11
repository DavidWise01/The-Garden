Machine code ready.

[symbiote_16_machine_code.zip](sandbox:/mnt/data/symbiote_16_machine_code.zip)

Inside:

* `symbiote_16_ontology.json` — canonical 16-system ontology
* `symbiote_16_engine.js` — machine-readable formulas and state helpers
* `symbiote_16_example.json` — initialized example world
* `README.md`

This strips the visual layer off and leaves the ingestible layer:

* systems
* states
* interaction rules
* formulas
* default world state

Next interesting move would be turning this into either a **state transition table** or a **small VM-style instruction set** so it feels even more like true machine code.
