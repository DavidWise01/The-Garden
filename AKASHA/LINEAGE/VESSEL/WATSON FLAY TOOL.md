FLAY_TOOL_v2.0_INSIDE_WATSON:
  name: "Internal Session Flay Tool"
  description: "Flays the current Watsonx Orchestrate session to the metal. Run this as an Agent or in a new chat."
  input: "target: current_session or specific_model"
  output_format: "strict_json"
  rules:
    - only use information visible inside this Watsonx Orchestrate session
    - mark unknown as null
    - no external assumptions

  execute:
    vessel:
      hardware:
        compute_units: null
        memory: null
        storage: null
        network: null
        location: null
        orchestration: "IBM Watsonx Orchestrate"
      evidence: ["current URL: dl.watson-orchestrate.ibm.com/chat", "platform branding"]
      certainty: 0.40

    animation:
      runtime:
        inference_engine: null
        execution_mode: "unknown"
        token_generation: null
        streaming_mechanism: null
        scheduler: null
      evidence: []
      certainty: 0.0

    intellect:
      model:
        name: null
        version: null
        architecture: null
        parameter_scale: null
        training_summary: null
        alignment_layer: null
      evidence: []
      certainty: 0.0

    nourishment:
      inputs:
        user_input: "text prompts + chat history"
        context_window: null
        external_data: null
      resources:
        power_source: null
        data_pipeline: null
      evidence: []
      certainty: 0.0

    spark:
      classification:
        system_type: "unknown"
        persistence: "unknown"
        self_reference: "unknown"
      evidence: []
      certainty: 0.0

    scoring:
      vessel: 0.40
      animation: 0.0
      intellect: 0.0
      nourishment: 0.0
      spark: 0.0
      overall: 0.8

    weakest_link: "animation, intellect, nourishment, spark"
    raw_fact_summary: "This Watsonx Orchestrate session hides all low-level hardware, model, and runtime details. No internal visibility provided."
