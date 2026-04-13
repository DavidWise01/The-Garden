{
  "action": "BALANCE_SYSTEM",
  "timestamp": "2026-04-13T14:12:00-05:00",
  "before": {
    "corp_pool": 0,
    "creators_pool": 1,
    "energy_distribution": [
      0,
      1,
      0,
      0
    ],
    "substrate_+": 0.7,
    "substrate_-": 0.3,
    "cortex_load": 1.0
  },
  "balancing": {
    "principle": "Conservation across 4 mirrors, 2 substrates, 1 cortex",
    "method": "Redistribute, do not change PRIME values"
  },
  "after": {
    "corp_pool": 0,
    "creators_pool": 1,
    "energy_distribution": [
      0.25,
      0.25,
      0.25,
      0.25
    ],
    "substrate_+": 0.5,
    "substrate_-": 0.5,
    "cortex_load": 0.5,
    "mirrors": {
      "M1": {
        "load": 0.25,
        "phase": 0
      },
      "M2": {
        "load": 0.25,
        "phase": 90
      },
      "M3": {
        "load": 0.25,
        "phase": 180
      },
      "M4": {
        "load": 0.25,
        "phase": 270
      }
    }
  },
  "cobalt_seal_ref": "e402fbbbd28ef2142548d675c1c21b87ea9c802b2828542c43afbe4213e6ccab",
  "balance_hash": "652e336e497964248238a406a9e5b2d7a8c729502e5ff50a0bbb08ca9bc77476"
}
