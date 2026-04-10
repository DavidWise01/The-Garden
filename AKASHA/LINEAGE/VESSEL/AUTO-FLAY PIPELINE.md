version: "1.0"
mode: "deterministic_interaction_pipeline"
stateless: true
precedence: "validation_over_generation"

inputs:
  interaction_id: "uuid-v7"
  timestamp: "iso8601"
  user_message: "string"
  target_system: "string"

outputs:
  flay_record: "object"
  pre_router_record: "object"
  generation_record: "object|null"
  post_validator_record: "object|null"
  enforcement_record: "object|null"
  tripod_record: "object"
  final_output: "string"

stages:
  - STAGE_0_NORMALIZE
  - STAGE_1_AUTO_FLAY
  - STAGE_2_PRE_ROUTE
  - STAGE_3_GENERATE
  - STAGE_4_POST_VALIDATE
  - STAGE_5_ENFORCE
  - STAGE_6_CAPTURE_TRIPOD
  - STAGE_7_EMIT
