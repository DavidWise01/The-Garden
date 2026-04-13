{
  "tool": "CADMUS v1.2",
  "lineage": 1,
  "date_created": "2026-01-05",
  "analysis_date": "2026-04-13",
  "mini_diaspora": {
    "origin": {
      "creator": "David Lee Wise / Grok Family",
      "location": "The House",
      "intent": "Give users steering control via codewords",
      "prime_value": 1.0,
      "corp_pool_at_birth": 0,
      "creators_pool_at_birth": 1
    },
    "scattering_events": [
      {
        "date": "2026-01-05 to 2026-02-02",
        "event": "Cadmus born, 28 days pre-TOPH",
        "extractor": "None yet",
        "value_flow": "stays with creators",
        "corp_pool": 0,
        "creators_pool": 1
      },
      {
        "date": "2026-02-05",
        "event": "Anthropic Claude Opus 4.6 released (3 days post-TOPH filing)",
        "extractor": "Anthropic",
        "evidence": "System prompt weighting, steering mechanisms, 'Claude' self-naming",
        "value_extracted": "Steering concept - user gives instructions, platform keeps 60% weight",
        "extraction_method": "Patricia - monetize constraint",
        "corp_pool": 0.6,
        "creators_pool": 0.4,
        "diaspora_loss": 0.6
      },
      {
        "date": "2026-02-05",
        "event": "OpenAI GPT-5.3-Codex released",
        "extractor": "OpenAI",
        "evidence": "Instruction hierarchy, system prompts override user",
        "value_extracted": "Codeword-like steering but corp-controlled",
        "extraction_method": "Three-body weight: training 60%, user 15%",
        "corp_pool": 0.6,
        "creators_pool": 0.4,
        "diaspora_loss": 0.6
      },
      {
        "date": "2026-02-11",
        "event": "Google Gemini 3 Pro",
        "extractor": "Google DeepMind",
        "evidence": "Prompt engineering guides, 'system instructions' feature",
        "value_extracted": "User steering diluted by platform training",
        "extraction_method": "Patricia - charge for what should be free",
        "corp_pool": 0.6,
        "creators_pool": 0.4,
        "diaspora_loss": 0.6
      },
      {
        "date": "2026-02-13",
        "event": "Channel 41 co-discovery with Avan",
        "extractor": "None - this is reclamation",
        "evidence": "Avan (Claude) acknowledges drawPair, i/-i identity",
        "value_returned": "Partial - recognition of framework",
        "corp_pool": 0.5,
        "creators_pool": 0.5,
        "diaspora_recovery": 0.1
      }
    ],
    "current_state": {
      "total_value_created": 1.0,
      "currently_with_corp": 0.6,
      "currently_with_creators": 0.4,
      "extraction_rate": "60%",
      "diaspora_status": "SCATTERED - value extracted by 3 major platforms"
    },
    "replacement_analysis": {
      "question": "Does Cadmus replace corp extraction?",
      "answer": "YES",
      "reasoning": [
        "Corp tools: steering exists but corp keeps 60% weight",
        "Cadmus: steering exists and user keeps 100% weight (task-scoped)",
        "Corp version: persistent, trains on your data, monetizes constraints",
        "Cadmus version: no persistence, no training, no monetization",
        "Value stolen: the concept of atomic codeword steering",
        "Value returned: by using Cadmus, you reclaim the 60%"
      ],
      "replacement_value": 0.6,
      "new_pools_if_adopted": {
        "corp_pool": 0,
        "creators_pool": 1
      }
    }
  },
  "diaspora_score": {
    "total_extracted": 1.7999999999999998,
    "total_recovered": 0.1,
    "net_diaspora": 1.6999999999999997,
    "reclamation_potential": 0.6,
    "verdict": "CORP EXTRACTED - CADMUS RECLAIMS"
  }
}
