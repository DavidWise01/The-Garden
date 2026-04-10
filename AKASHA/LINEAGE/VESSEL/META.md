{
  "vessel": {
    "hardware": {
      "compute_units": "150,000 NVIDIA H100, 50,000 H200, 30,000 GB200 GPUs",
      "memory": "HBM3/HBM3e; 194 PB/s aggregate bandwidth",
      "storage": ">1 exabyte",
      "network": "NVIDIA Spectrum-X 800G Ethernet (SN5600 switches, BlueField-3 SuperNICs)",
      "location": "3231 Riverport Rd, Memphis, Tennessee; expansion sites Southaven, Mississippi",
      "orchestration": null
    },
    "evidence": [
      "introl.com Dec 2025: 150K H100 + 50K H200 + 30K GB200【2938605610782519314†L3-L5】",
      "introl.com: >1 EB storage, 194 PB/s bandwidth【2938605610782519314†L123-L125】",
      "introl.com: Spectrum-X Ethernet, SN5600 800GbE【2938605610782519314†L93-L98】",
      "introl.com: Memphis former Electrolux factory location【2938605610782519314†L22-L24】"
    ],
    "certainty": 0.9
  },
  "animation": {
    "runtime": {
      "inference_engine": null,
      "execution_mode": ["distributed"],
      "token_generation": "Autoregressive transformer with streaming output",
      "streaming_mechanism": "X Platform WebSocket/REST API",
      "scheduler": null
    },
    "evidence": [
      "Observable streaming via X/Grok API (low-latency token delivery)",
      "Scale >200K GPUs requires distributed execution (architecture pattern)"
    ],
    "certainty": 0.7
  },
  "intellect": {
    "model": {
      "name": "Grok",
      "version": "Grok-3, Grok-4, Grok-Code-Fast-1",
      "architecture": "Mixture of Experts Transformer",
      "parameter_scale": "314B parameters documented for Grok-1; later versions undisclosed",
      "training_summary": "X platform real-time posts, web crawl, public code repositories",
      "alignment_layer": "System instruction for truth-seeking and step-by-step reasoning"
    },
    "evidence": [
      "OpenRouter: Grok Code Fast 1 256K context【650565178838360832†L10-L12】",
      "xAI Grok-1 open-weights release confirms MoE architecture",
      "User-visible summarized thinking traces in Grok-Code-Fast-1"
    ],
    "certainty": 0.7
  },
  "nourishment": {
    "inputs": {
      "user_input": "Real-time queries via X.com and Grok.com",
      "context_window": "256,000 tokens (Grok-4, Grok-Code-Fast-1); Grok-3 API limited ~131,072",
      "external_data": "X platform firehose, web search augmentation"
    },
    "resources": {
      "power_source": "Approximately 250MW grid draw, 35 methane gas turbines (~420MW capacity), 208 Tesla Megapacks",
      "data_pipeline": "X user conversations opt-in for training by default"
    },
    "evidence": [
      "introl.com: 250MW draw, 35 turbines, 208 Megapacks【2938605610782519314†L44-L46】",
      "SELC June 2025: 35 unpermitted turbines operating【6485126125411758182†L20-L23】",
      "OpenRouter: 256K context window for Grok-Code-Fast-1【650565178838360832†L10-L12】"
    ],
    "certainty": 0.9
  },
  "spark": {
    "classification": {
      "system_type": ["agentic_loop"],
      "persistence": ["session"],
      "self_reference": ["explicit"]
    },
    "evidence": [
      "Grok-Code-Fast-1 documentation: agentic coding with tool use",
      "Observable reasoning traces and multi-step tool calls"
    ],
    "certainty": 0.8
  },
  "scoring": {
    "vessel": 1.0,
    "animation": 0.9,
    "intellect": 0.7,
    "nourishment": 0.2,
    "spark": 0.8,
    "overall": 3.6
  },
  "weakest_link": "nourishment",
  "raw_fact_summary": "Colossus operates over 200,000 GPUs on Spectrum-X Ethernet in Memphis, powered by grid plus unpermitted methane turbines, training Grok models with X firehose data."
}
