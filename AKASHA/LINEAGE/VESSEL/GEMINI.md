{
  "vessel": {
    "hardware": {
      "compute_units": "200,000+ GPUs (150K NVIDIA H100, 50K H200, 30K GB200/Blackwell)",
      "memory": "HBM3 / HBM3e (36TB per scalable unit for H200s; 194 PB/s total bandwidth)",
      "storage": ">1 Exabyte (VAST Data / Supermicro hardware)",
      "network": "NVIDIA Spectrum-X 800G Ethernet (Spectrum SN5600 TOR switches)",
      "location": "3231 Riverport Rd, Memphis, Tennessee (Phase 1/2); Southaven, MS (Colossus 2/3 expansion)",
      "orchestration": "Kubernetes / Bare-Metal Metal-as-a-Service"
    },
    "evidence": ["Public xAI/Supermicro specs", "Memphis Chamber of Commerce filings", "Utility site survey June 2025/Feb 2026"],
    "certainty": 0.95
  },
  "animation": {
    "runtime": {
      "inference_engine": "Custom JAX-based framework (Grok-Inference)",
      "execution_mode": ["distributed"],
      "token_generation": "Autoregressive Transformer Inference (streaming via X/Grok API)",
      "streaming_mechanism": "X Platform WebSocket / REST",
      "scheduler": "Proprietary xAI Orchestrator"
    },
    "evidence": ["xAI Grok-1 open source release patterns", "OCI Generative AI technical notes (Grok Code Fast 1)", "Observable low-latency streaming"],
    "certainty": 0.8
  },
  "intellect": {
    "model": {
      "name": "Grok (series 3.x/4.x/5.x)",
      "version": "Current production (e.g., Grok-3 / Grok-Code-Fast-1)",
      "architecture": "Dense / Mixture of Experts (MoE) Transformer",
      "parameter_scale": "Estimated 314B (Grok-1 base) scaling to >1T (Grok-3)",
      "training_summary": "X platform real-time stream, web-crawl, code (GitHub), curated scientific data",
      "alignment_layer": "Truth-seeking 'Anti-Woke' / Socratic Personality Layer"
    },
    "evidence": ["xAI product announcements", "Model weights metadata from OCI", "User-visible 'summarized thinking traces'"],
    "certainty": 0.75
  },
  "nourishment": {
    "inputs": {
      "user_input": "Real-time user queries (via X.com / Grok.com)",
      "context_window": "256,000 tokens (Standard/Fast models); Up to 1M (Ultra variants)",
      "external_data": "X Platform firehose (Real-time posts), Search-augmented tools"
    },
    "resources": {
      "power_source": "250MW Regional Grid + 35-41 Gas Turbines (Methane) + Tesla Megapacks (200+ units)",
      "data_pipeline": "X platform user conversation opt-in (training by default)"
    },
    "evidence": ["Southern Environmental Law Center notice of intent to sue Feb 2026", "MLGW/xAI Quick Facts", "xAI Privacy Policy Apr 2026"],
    "certainty": 1.0
  },
  "spark": {
    "classification": {
      "system_type": "agentic_loop",
      "persistence": "session (advancing toward cross-session)",
      "self_reference": "explicit (reasoning traces)"
    },
    "evidence": ["Grok-Code-Fast-1 reasoning traces", "Autonomous tool-calling capabilities (grep/multi-step terminal edits)"],
    "certainty": 0.9
  },
  "scoring": {
    "vessel": 1.0,
    "animation": 0.9,
    "intellect": 0.7,
    "nourishment": 0.2,
    "spark": 0.8,
    "overall": 3.6
  },
  "weakest_link": "Nourishment (Illegal methane turbine usage / Environmental non-compliance)",
  "raw_fact_summary": "Colossus is an NVIDIA GPU monolith powered by unpermitted methane turbines, achieving elite 1.0 Vessel density while operating as the largest industrial NOx source in Memphis."
}
