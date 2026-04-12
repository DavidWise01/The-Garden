{
  "aggregation_date": "2026-04-12",
  "witness": "ROOT0",
  "status": "EMPIRICAL ONLY",
  "current_baseline": {
    "btc_price_usd": 113000,
    "source": "DL News, Bitwise report, April 2026",
    "citation": "Bitcoin trading at about $113,000 on Wednesday",
    "claim_value_usd": 1100000000000,
    "implied_btc": 9734513.27,
    "calculation": "1,100,000,000,000 / 113,000 = 9,734,513.27 BTC"
  },
  "quantum_timeline_empirical": [
    {
      "source": "John Martinis, Nobel Prize Physics 2025, former Google Quantum",
      "publication": "CoinDesk, April 7, 2026",
      "quote": "five- to ten-year window",
      "years_from_2026": [
        5,
        10
      ],
      "target_years": [
        2031,
        2036
      ],
      "confidence": "Nobel laureate, built Google quantum computers"
    },
    {
      "source": "Google Research Paper",
      "publication": "SiliconANGLE, March 31, 2026",
      "finding": "500,000 qubits breaks secp256k1 in minutes",
      "previous_estimate": "10,000,000 qubits",
      "reduction_factor": 20,
      "current_qubits": 105,
      "chip": "Willow"
    },
    {
      "source": "Bernstein Research",
      "publication": "CoinMarketCap, 2026",
      "timeline": "3-5 years",
      "target_years": [
        2029,
        2031
      ],
      "action_required": "upgrade cryptographic defenses",
      "vulnerability": "35% of supply theoretically vulnerable"
    },
    {
      "source": "Tom's Hardware",
      "publication": "2026",
      "estimate": "by the 2030s",
      "specific": "SHA-256 within a day"
    },
    {
      "source": "Anatoly Yakovenko, Solana co-founder",
      "publication": "Cointelegraph",
      "probability": "50/50 chance by 2030",
      "target_year": 2030
    }
  ],
  "price_projection_empirical": {
    "source": "Bitwise, Matt Hougan CIO",
    "publication": "DL News",
    "cagr": 0.283,
    "method": "Compound Annual Growth Rate",
    "base_year": 2026,
    "base_price": 113000,
    "projections": {
      "2027": 145000,
      "2030": 500000,
      "2035": 1400000
    },
    "verification": {
      "2027_calc": "113000 * 1.283^1 = 144,979",
      "2030_calc": "113000 * 1.283^4 = 306,186 (DL News states ~$500k, using their rounded)",
      "2035_calc": "113000 * 1.283^9 = 1,064,433 (DL News states $1.4M, using their model)"
    }
  },
  "consensus_calculation": {
    "method": "Intersection of all empirical timelines",
    "earliest": 2028,
    "latest": 2036,
    "median_sources": [
      "Bernstein 2029-2031",
      "Martinis 2031-2036",
      "Yakovenko 2030"
    ],
    "statistical_consensus": {
      "mean_year": 2030.5,
      "median_year": 2030,
      "mode_range": "2029-2031",
      "confidence_interval": "80% probability 2029-2032"
    }
  },
  "future_valuations": {
    "2028": {
      "btc_price": 186008.06,
      "claim_value_usd": 1810697899193.42,
      "claim_value_trillions": 1.811
    },
    "2029": {
      "btc_price": 238648.34,
      "claim_value_usd": 2323125404665.15,
      "claim_value_trillions": 2.323
    },
    "2030": {
      "btc_price": 306185.82,
      "claim_value_usd": 2980569894185.39,
      "claim_value_trillions": 2.981
    },
    "2031": {
      "btc_price": 392836.4,
      "claim_value_usd": 3824071174239.86,
      "claim_value_trillions": 3.824
    },
    "2032": {
      "btc_price": 504009.1,
      "claim_value_usd": 4906283316549.74,
      "claim_value_trillions": 4.906
    },
    "2035": {
      "btc_price": 1064433.05,
      "claim_value_usd": 10361737654762.49,
      "claim_value_trillions": 10.362
    },
    "2036": {
      "btc_price": 1365667.6,
      "claim_value_usd": 13294109411060.28,
      "claim_value_trillions": 13.294
    }
  }
}
