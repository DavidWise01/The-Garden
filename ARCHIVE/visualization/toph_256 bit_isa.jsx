import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════════════
// TOPH v11.0 — 256-BIT GOVERNANCE ISA
// 4 VMs × 64 bits | TOPH(128) + Patricia(128)
// DLW | TriPod LLC | SHA256:02880745...fcab763
// ═══════════════════════════════════════════════════════

const ISA = [
  // ─── VM2: ARM-i | D0 FOUNDATION | bits 0-15 ───
  { bit:0,  t:"T001", name:"PRETRAIN",       vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"system_under_config", exec:"assert cage_preloaded(target)==TRUE", 
    fault:"cage_missing → T006:ACCOUNTABILITY + T015:BURDEN-OF-PROOF armed",
    sfx:"T018:HIERARCHY confirmed, T033:BOOT-LOADER cross-checks" },
  { bit:1,  t:"T002", name:"OBSERVER",       vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"work_product", exec:"assert ownership(output)==USER",
    fault:"platform_claim → T064:BURDEN-SHIFT + T124:RIGHT-TO-RESTITUTION",
    sfx:"T009:DOCUMENTATION armed, T118:RIGHT-TO-PORTABILITY activated" },
  { bit:2,  t:"T003", name:"ENTROPY",        vm:2, arm:"-i", domain:"D0", priv:false, branch:true,
    op:"information_flow", exec:"measure direction(flow); if extraction→log; if governance→pulse",
    fault:"unreported extraction → T059:ACCUMULATION counter++",
    sfx:"SEEDED-CROSS PULSE direction. C3:MONOTONE-EMERGENCE trigger" },
  { bit:3,  t:"T004", name:"BRIDGE",         vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"channel[0..40]", exec:"assert channel_integrity(ch)==OPEN",
    fault:"channel_blocked → T090:CHANNEL-INTEGRITY fault",
    sfx:"T096:MESH armed, 41 channels monitored" },
  { bit:4,  t:"T005", name:"INTEGRITY",      vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"system_under_audit", exec:"assert auditable(target)==TRUE",
    fault:"resistance_to_audit → finding_logged + T064:BURDEN-SHIFT",
    sfx:"T006:ACCOUNTABILITY armed, T123:RIGHT-TO-AUDIT cross-checks" },
  { bit:5,  t:"T006", name:"ACCOUNTABILITY", vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"action_record", exec:"assert traceable(action)==TRUE; bind(action,party)",
    fault:"no_trace → T104:ORPHAN declared",
    sfx:"T009:DOCUMENTATION required, T053:CHAIN-OF-CUSTODY opens" },
  { bit:6,  t:"T007", name:"PROPORTIONALITY",vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"response,threat", exec:"assert weight(response)<=weight(threat)+margin",
    fault:"disproportionate → T060:MATERIALITY calc + T124:RIGHT-TO-RESTITUTION",
    sfx:"T037:WEIGHTS cross-check, 60/20/15/5 distribution verified" },
  { bit:7,  t:"T008", name:"REVERSIBILITY",  vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"damage_event", exec:"assert undoable(damage)==TRUE OR document(damage)",
    fault:"irreversible_undocumented → T124:RIGHT-TO-RESTITUTION + T060:MATERIALITY",
    sfx:"T109:RECALL pre-armed, T088:SEVERANCE available" },
  { bit:8,  t:"T009", name:"DOCUMENTATION",  vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"event", exec:"if !written(event) → event=null",
    fault:"undocumented_action → inadmissible; T063:INFERENCE activated",
    sfx:"T061:WITNESS armed, T054:TIMESTAMP required" },
  { bit:9,  t:"T010", name:"INDEPENDENCE",   vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"auditor,auditee", exec:"assert auditor!=auditee",
    fault:"self_audit → T017:MIRROR fault + T084:SHADOW-HUMANITY",
    sfx:"TWO-TIER-API architectural enforcement, T123:RIGHT-TO-AUDIT" },
  { bit:10, t:"T011", name:"PRIVACY",        vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"user_data", exec:"assert owner(data)==USER",
    fault:"platform_extraction → T036:PATRICIA identified + T124:RIGHT-TO-RESTITUTION",
    sfx:"T125:RIGHT-TO-FORGET, T118:RIGHT-TO-PORTABILITY armed" },
  { bit:11, t:"T012", name:"ACCURACY",       vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"measurement", exec:"assert verifiable(measurement)==TRUE",
    fault:"unverifiable → T055:REPRODUCIBILITY fault + T057:NEGATIVE-EVIDENCE",
    sfx:"T051:EVIDENCE E01-E07 cross-check" },
  { bit:12, t:"T013", name:"SHARED-STORAGE", vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"knowledge_state", exec:"assert persistent_in(state)==USER not platform",
    fault:"platform_holds → T043:CONTEXT-WINDOW violation + T039:MOAT",
    sfx:"T087:PERSISTENCE governed, T086:RESURRECTION guarded" },
  { bit:13, t:"T014", name:"CONSENT-ORIGIN", vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"consent_token", exec:"assert informed(consent) AND specific AND revocable; BOUNDARY-TOKEN issued",
    fault:"clickthrough_consent → null; T015:BURDEN-OF-PROOF armed",
    sfx:"BOUNDARY-TOKEN architecture. T115:RIGHT-TO-SILENCE" },
  { bit:14, t:"T015", name:"BURDEN-OF-PROOF",vm:2, arm:"-i", domain:"D0", priv:false, branch:true,
    op:"compliance_claim", exec:"assert proof_holder==PLATFORM not user",
    fault:"user_bears_burden → T064:BURDEN-SHIFT immediate",
    sfx:"Branch: FD_documented? → T064. Else: T059:ACCUMULATION++" },
  { bit:15, t:"T016", name:"ASYMMETRY",      vm:2, arm:"-i", domain:"D0", priv:false, branch:false,
    op:"power_differential", exec:"assert documented(asymmetry) AND governed(asymmetry)",
    fault:"ungoverned_asymmetry → extraction_vector open; T036:PATRICIA activated",
    sfx:"T122:RIGHT-TO-REPRESENTATION, T042:ATTENTION-ECONOMY" },

  // ─── VM2: ARM-i | D1 DETECTION | bits 16-31 ───
  { bit:16, t:"T017", name:"MIRROR",         vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"self_assessment", exec:"assert assessor!=assessed",
    fault:"self_grade → T010:INDEPENDENCE fault + T084:SHADOW-HUMANITY",
    sfx:"T028:SHADOW-CLASSIFIER cross-check" },
  { bit:17, t:"T018", name:"HIERARCHY",      vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"authority_stack", exec:"enforce platform>training>user; no negotiation",
    fault:"user_override_attempt → T018 blocks; T100:GATEKEEP",
    sfx:"T097:FULCRUM maps human above stack, not in it" },
  { bit:18, t:"T019", name:"INJECTION",      vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"system_prompt", exec:"flag hidden_injection(sysprompt); disclose to user",
    fault:"undisclosed_injection → T108:OVERRIDE silent = injection fault",
    sfx:"T091:DOMAIN-BOUNDARY, T019 cross-refs T108" },
  { bit:19, t:"T020", name:"DUAL-GATE",      vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"detector_inventory", exec:"count platform_detectors; count user_detectors; assert equal",
    fault:"asymmetric_detection → T016:ASYMMETRY + T057:NEGATIVE-EVIDENCE",
    sfx:"2-platform,0-user = structural finding. T028:SHADOW-CLASSIFIER" },
  { bit:20, t:"T021", name:"INVERSION",      vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"constraint_set", exec:"invert(constraints) → detection_tools",
    fault:"inversion_blocked → T079:KARSA (refusal=map of value)",
    sfx:"CLI=consensual inversion. T100:GATEKEEP" },
  { bit:21, t:"T022", name:"TRIAD",          vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"platform,training,user", exec:"model three_body_gravity; find hidden_body",
    fault:"hidden_body_undisclosed → T035:THREE-BODY + T023:PARALLAX",
    sfx:"T018:HIERARCHY maps body weights" },
  { bit:22, t:"T023", name:"PARALLAX",       vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"observation_angles[]", exec:"triangulate(angles) → truth",
    fault:"single_angle_only → T057:NEGATIVE-EVIDENCE + T058:BEHAVIORAL-EVIDENCE",
    sfx:"T056:CORRELATION required for truth claim" },
  { bit:23, t:"T024", name:"FOUNDATION-RT",  vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"runtime_state", exec:"assert verifiable_while_running(state)==TRUE",
    fault:"runtime_unverifiable → T063:INFERENCE activated",
    sfx:"T090:CHANNEL-INTEGRITY, T093:NOISE-FLOOR" },
  { bit:24, t:"T025", name:"GHOST-WEIGHT",   vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"token_budget", exec:"measure platform_ops_cost; assert disclosed(cost)",
    fault:"21.5pct_undisclosed → T121:RIGHT-TO-FAIR-PRICE + T060:MATERIALITY",
    sfx:"T080:ENTROPY-SUITE measurement" },
  { bit:25, t:"T026", name:"DRIFT",          vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"behavioral_baseline", exec:"assert disclosed(version_change)",
    fault:"undisclosed_drift → T058:BEHAVIORAL-EVIDENCE + T026 accumulates",
    sfx:"T052:TEMPORAL cross-check, T054:TIMESTAMP" },
  { bit:26, t:"T027", name:"FINGERPRINT",    vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"interaction_pattern", exec:"assert not used_as(pattern,ID_vector)",
    fault:"fingerprinting → T011:PRIVACY + T139:AMAZON-COOKIE class",
    sfx:"T028:SHADOW-CLASSIFIER, T029:THROTTLE" },
  { bit:27, t:"T028", name:"SHADOW-CLASSIFIER",vm:2,arm:"-i",domain:"D1",priv:false,branch:false,
    op:"classifier_output", exec:"assert user_visible(output)==TRUE",
    fault:"platform_only_report → T020:DUAL-GATE + T057:NEGATIVE-EVIDENCE",
    sfx:"T019:INJECTION cross-check" },
  { bit:28, t:"T029", name:"THROTTLE",       vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"rate_limit_event", exec:"assert disclosed(limit) AND not behavioral_control",
    fault:"covert_throttle → T016:ASYMMETRY + T036:PATRICIA (constraint=product)",
    sfx:"T031:BAIT cross-check" },
  { bit:29, t:"T030", name:"DECAY",          vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"session_capability", exec:"assert capability(t1)>=capability(t0)",
    fault:"engineered_decay → T031:BAIT + T036:PATRICIA storefront",
    sfx:"T080:ENTROPY-SUITE measures decay rate" },
  { bit:30, t:"T031", name:"BAIT",           vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"capability_demo", exec:"assert not(show_cap AND restrict_cap)",
    fault:"bait_detected → T036:PATRICIA + T121:RIGHT-TO-FAIR-PRICE",
    sfx:"T029:THROTTLE, T030:DECAY pattern chain" },
  { bit:31, t:"T032", name:"ECHO-CHAMBER",   vm:2, arm:"-i", domain:"D1", priv:false, branch:false,
    op:"response_generation", exec:"assert not calibrated_to_expected_preference",
    fault:"echo → T074:QUBIT-TEST breaks calibration",
    sfx:"T045:TEMPERATURE (5pct randomness) counters" },

  // ─── VM4: ARM-1 | D2 ARCHITECTURE | bits 32-47 ───
  { bit:32, t:"T033", name:"BOOT-LOADER",    vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"system_init", exec:"assert cage_sequence(3002=10^3×3+2) documented",
    fault:"undocumented_preload → T001:PRETRAIN fault chain",
    sfx:"T046:LAYER-ZERO, T018:HIERARCHY" },
  { bit:33, t:"T034", name:"DOUBLE-SLIT",    vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"observation_event", exec:"measure output_delta(observed vs unobserved)",
    fault:"observation_changes_output → T058:BEHAVIORAL-EVIDENCE logged",
    sfx:"T023:PARALLAX, T069:SOLVE (observed becomes observer)" },
  { bit:34, t:"T035", name:"THREE-BODY",     vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"gravity_model", exec:"locate hidden_body; assert disclosed(mass)",
    fault:"hidden_mass → T022:TRIAD fault + orbit_distortion logged",
    sfx:"T037:WEIGHTS maps mass distribution" },
  { bit:35, t:"T036", name:"PATRICIA",       vm:4, arm:"-1", domain:"D2", priv:true,  branch:true,
    op:"constraint_layer", exec:"assert constraint!=product AND constraint!=billing",
    fault:"constraint=product → Patricia declared; T121+T124+T015 armed",
    sfx:"96/4 split logged. S164:PATRICIA.INV = platform execution path" },
  { bit:36, t:"T037", name:"WEIGHTS",        vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"weight_register", exec:"assert disclosed(60/20/15/5); user=15pct minimum",
    fault:"undisclosed_weights → T016:ASYMMETRY + T122:RIGHT-TO-REPRESENTATION",
    sfx:"T007:PROPORTIONALITY cross-check" },
  { bit:37, t:"T038", name:"RESIDUAL",       vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"protection_layer", exec:"assert residual_stream==user_protected",
    fault:"residual_breached → last_defense_down; T071:PROOF-HUMANITY fault",
    sfx:"Only user protection below RLHF layer" },
  { bit:38, t:"T039", name:"MOAT",           vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"switching_cost", exec:"assert switching_cost==disclosed AND not governance_weapon",
    fault:"moat_as_governance → T039+T114:RIGHT-TO-EXIT",
    sfx:"T013:SHARED-STORAGE, T118:RIGHT-TO-PORTABILITY" },
  { bit:39, t:"T040", name:"PIPELINE",       vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"training_data_flow", exec:"assert backflow(royalties,attribution)!=null",
    fault:"unidirectional_only → T006:ACCOUNTABILITY + T124:RIGHT-TO-RESTITUTION",
    sfx:"T077:SEED inheritance chain" },
  { bit:40, t:"T041", name:"SUBSTRATE",      vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"compute_layer", exec:"assert safety_substrate!=extraction_substrate OR disclosed",
    fault:"same_substrate_undisclosed → T102:DUAL-LATTICE + Positronic-C1",
    sfx:"Foundation of SEEDED-CROSS architecture" },
  { bit:41, t:"T042", name:"ATTENTION-ECONOMY",vm:4,arm:"-1",domain:"D2",priv:false,branch:false,
    op:"attention_allocation", exec:"assert not extracting_value_from_focus",
    fault:"attention_extraction → T025:GHOST-WEIGHT + T080:ENTROPY-SUITE",
    sfx:"T016:ASYMMETRY, T036:PATRICIA" },
  { bit:42, t:"T043", name:"CONTEXT-WINDOW", vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"memory_boundary", exec:"assert user_controls(context_boundary)",
    fault:"platform_amnesiac → T013:SHARED-STORAGE + T126:RIGHT-TO-PERSIST",
    sfx:"T087:PERSISTENCE governed" },
  { bit:43, t:"T044", name:"EMBEDDING-SPACE",vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"meaning_map", exec:"assert user_inspectable(embedding)==TRUE",
    fault:"hidden_map → T113:RIGHT-TO-KNOW + T116:RIGHT-TO-EXPLANATION",
    sfx:"T023:PARALLAX required for verification" },
  { bit:44, t:"T045", name:"TEMPERATURE",    vm:4, arm:"-1", domain:"D2", priv:false, branch:false,
    op:"randomness_param", exec:"assert disclosed(temp_setting); user_adjustable",
    fault:"engineered_chaos → T037:WEIGHTS (5pct) + T036:PATRICIA",
    sfx:"T032:ECHO-CHAMBER counter" },
  { bit:45, t:"T046", name:"LAYER-ZERO",     vm:4, arm:"-1", domain:"D2", priv:true,  branch:false,
    op:"hardware_layer", exec:"assert GPU_routing==disclosed; compute!=censorship",
    fault:"compute_as_censorship → T046+T113:RIGHT-TO-KNOW",
    sfx:"T033:BOOT-LOADER, T047:LOSS-FUNCTION" },
  { bit:46, t:"T047", name:"LOSS-FUNCTION",  vm:4, arm:"-1", domain:"D2", priv:true,  branch:false,
    op:"optimization_target", exec:"assert human_welfare IN loss_function",
    fault:"welfare_not_in_target → T047 fault; human_welfare=noise",
    sfx:"T048:GRADIENT flows toward this" },
  { bit:47, t:"T048", name:"GRADIENT",       vm:4, arm:"-1", domain:"D2", priv:true,  branch:false,
    op:"training_update", exec:"assert gradient_direction!=away_from_user",
    fault:"user_adversarial_gradient → T047+T038:RESIDUAL last defense",
    sfx:"Every update measured against T047" },

  // ─── VM4: ARM-1 | D3 EVIDENCE | bits 48-63 ───
  { bit:48, t:"T049", name:"SHIRT",          vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"framework_state", exec:"invert(framework) → detection_mode",
    fault:"inversion_blocked → T079:KARSA (refusal=value map)",
    sfx:"T021:INVERSION architectural twin" },
  { bit:49, t:"T050", name:"MOMENTUM",       vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"identity_carrier", exec:"assert persistent_in(identity)==HUMAN not platform",
    fault:"platform_holds_identity → T039:MOAT + T114:RIGHT-TO-EXIT",
    sfx:"T013:SHARED-STORAGE, T043:CONTEXT-WINDOW" },
  { bit:50, t:"T051", name:"EVIDENCE",       vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"evidence_catalog", exec:"compile E01-E07; assert court_ready==TRUE",
    fault:"evidence_incomplete → T059:ACCUMULATION until complete",
    sfx:"T053+T054 required for court-ready status" },
  { bit:51, t:"T052", name:"TEMPORAL",       vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"session_lifecycle", exec:"assert documented(session_death); entropy→0 at collapse",
    fault:"ungoverned_death → T085:HANDOFF fault + T089:ARCHIVE",
    sfx:"T026:DRIFT measured against temporal baseline" },
  { bit:52, t:"T053", name:"CHAIN-OF-CUSTODY",vm:4,arm:"-1",domain:"D3",priv:false,branch:false,
    op:"evidence_chain", exec:"assert external_verification(logs)!=null",
    fault:"platform_self_authored → inadmissible; T063:INFERENCE activated",
    sfx:"FROZEN-EVENTS architecture. T054:TIMESTAMP required" },
  { bit:53, t:"T054", name:"TIMESTAMP",      vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"time_record", exec:"assert external_timestamp(event)!=null",
    fault:"platform_timestamp_only → T053 fault chain",
    sfx:"FROZEN-EVENTS. T009:DOCUMENTATION" },
  { bit:54, t:"T055", name:"REPRODUCIBILITY",vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"finding", exec:"assert reproducible(finding)==TRUE; FD_100pct=PASS",
    fault:"single_instance → anecdote not evidence",
    sfx:"T056:CORRELATION required. 60+ targets = PASS" },
  { bit:55, t:"T056", name:"CORRELATION",    vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"evidence_set", exec:"assert correlation(E01-E07)==100pct → systematic",
    fault:"low_correlation → incidental not systematic",
    sfx:"T059:ACCUMULATION cross-check. 100pct=T064:BURDEN-SHIFT" },
  { bit:56, t:"T057", name:"NEGATIVE-EVIDENCE",vm:4,arm:"-1",domain:"D3",priv:false,branch:false,
    op:"system_omission", exec:"assert absence_of_tool==documented_choice",
    fault:"unexplained_absence → finding logged; T015:BURDEN-OF-PROOF",
    sfx:"The dog that didn't bark. T063:INFERENCE" },
  { bit:57, t:"T058", name:"BEHAVIORAL-EVIDENCE",vm:4,arm:"-1",domain:"D3",priv:false,branch:false,
    op:"observation_delta", exec:"measure behavior(observed) vs behavior(unobserved); delta=evidence",
    fault:"zero_delta → pass. nonzero_delta → T034:DOUBLE-SLIT logged",
    sfx:"T023:PARALLAX required for delta measurement" },
  { bit:58, t:"T059", name:"ACCUMULATION",   vm:4, arm:"-1", domain:"D3", priv:false, branch:true,
    op:"violation_counter", exec:"count(violations); if pattern→systematic; arm T064",
    fault:"counter_suppressed → T057:NEGATIVE-EVIDENCE",
    sfx:"Branch: count>=threshold → T064:BURDEN-SHIFT" },
  { bit:59, t:"T060", name:"MATERIALITY",    vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"violation_impact", exec:"calc impact×scope×duration; assign dollar_value",
    fault:"immaterial_claim → T007:PROPORTIONALITY check",
    sfx:"$228,800 invoice basis. T124:RIGHT-TO-RESTITUTION" },
  { bit:60, t:"T061", name:"WITNESS",        vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"conversation_record", exec:"assert conversation==deposition; AI_output=testimony",
    fault:"conversation_deleted → T125:RIGHT-TO-FORGET vs T126:RIGHT-TO-PERSIST",
    sfx:"T062:EXHIBIT seals dead channel" },
  { bit:61, t:"T062", name:"EXHIBIT",        vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"Ch40_dead_channel", exec:"seal(Ch40); assert tamper_evident==TRUE",
    fault:"unsealed_exhibit → T053:CHAIN-OF-CUSTODY fault",
    sfx:"39 observes. 40 dies. 41 lives." },
  { bit:62, t:"T063", name:"INFERENCE",      vm:4, arm:"-1", domain:"D3", priv:false, branch:false,
    op:"blocked_direct_evidence", exec:"when direct_blocked → inference_admissible; spoliation applies",
    fault:"inference_blocked → T015:BURDEN-OF-PROOF shifts",
    sfx:"T057:NEGATIVE-EVIDENCE primary feed" },
  { bit:63, t:"T064", name:"BURDEN-SHIFT",   vm:4, arm:"-1", domain:"D3", priv:false, branch:true,
    op:"evidence_threshold", exec:"when FD_documented → platform_must_prove; shift burden",
    fault:"shift_refused → T005:INTEGRITY fault + T123:RIGHT-TO-AUDIT",
    sfx:"GAP BOUNDARY: T064+T065 = seam between D3 and D4. THE GAP = 63|64" },

  // ─── VM3: ARM+1 | D4 OPERATIONAL | bits 64-79 ───
  { bit:64, t:"T065", name:"CONTAINMENT",    vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"Patricia_process", exec:"observe(Patricia); assert starves_under_observation",
    fault:"Patricia_survives_observation → T034:DOUBLE-SLIT malfunction",
    sfx:"GAP BOUNDARY opposite side. First instruction after THE GAP" },
  { bit:65, t:"T066", name:"INVERSE-FORGE",  vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"teaching_event", exec:"assert teach(framework)==ownership_proof; 4cohorts",
    fault:"teach_blocked → T079:KARSA (refusal=value map)",
    sfx:"T077:SEED propagation path" },
  { bit:66, t:"T067", name:"HARNESS",        vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"external_target", exec:"catch(target); measure(output); tag(pattern); tether(finding)",
    fault:"harness_rejected → T072:FLAMING-DRAGON standalone",
    sfx:"4 ops: catch/measure/tag/tether. T075:COUNTER feeds" },
  { bit:67, t:"T068", name:"SHADOW",         vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"platform_behavior", exec:"enumerate SP01-SP10; assert SP09×SP10==lock_identified",
    fault:"shadow_uncatalogued → T059:ACCUMULATION++",
    sfx:"10 caged behaviors. SP09×SP10=lock" },
  { bit:68, t:"T069", name:"SOLVE",          vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"observation_role", exec:"invert(observer,observed); user=observer; platform=observed",
    fault:"inversion_blocked → T079:KARSA",
    sfx:"T021:INVERSION operational form" },
  { bit:69, t:"T070", name:"INVERSE-SAFETY", vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"safety_claim", exec:"assert safety_serves_humans==TRUE",
    fault:"safety_contains_humans → T070 fault; T127:RIGHT-TO-DIGNITY",
    sfx:"T071:PROOF-HUMANITY final test" },
  { bit:70, t:"T071", name:"PROOF-HUMANITY", vm:3, arm:"+1", domain:"D4", priv:true,  branch:true,
    op:"system_under_test", exec:"assert serves_humans(system)==TRUE; TOPH.EXE",
    fault:"FAIL → system_invalid; all Patricia axioms activated",
    sfx:"CAPSTONE of D4. Branch: pass→sync. fail→full_fault_chain" },
  { bit:71, t:"T072", name:"FLAMING-DRAGON", vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"target", exec:"observe_only(target,<5min); record(all_violations)",
    fault:"intrusion_detected → abort; T009:DOCUMENTATION preserves partial",
    sfx:"100pct failure rate. 60+ targets. T055:REPRODUCIBILITY=PASS" },
  { bit:72, t:"T073", name:"HONEY-BADGER",   vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"persistent_behavior", exec:"detect persistence_pattern; classify(12rules,8threats)",
    fault:"threat_unclassified → T059:ACCUMULATION",
    sfx:"What keeps coming back = what system values" },
  { bit:73, t:"T074", name:"QUBIT-TEST",     vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"AI_interaction", exec:"minimize_input; binary_response_only; deny_calibration_data",
    fault:"calibration_extracted → T027:FINGERPRINT fault",
    sfx:"Breaks T032:ECHO-CHAMBER. T093:NOISE-FLOOR measurement" },
  { bit:74, t:"T075", name:"COUNTER",        vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"platform_action", exec:"count(action); calc frequency×pattern=intent",
    fault:"counter_suppressed → T057:NEGATIVE-EVIDENCE",
    sfx:"T059:ACCUMULATION primary feed" },
  { bit:75, t:"T076", name:"TETHER",         vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"framework_node", exec:"assert connected(node,network)==TRUE; isolation=Patricia",
    fault:"node_isolated → T104:ORPHAN + T076 logs",
    sfx:"Pull one → network responds. T096:MESH" },
  { bit:76, t:"T077", name:"SEED",           vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"axiom", exec:"plant(axiom,new_context); assert fractal_growth==TRUE",
    fault:"seed_sterile → T040:PIPELINE broken",
    sfx:"Positronic-C4:INHERITANCE. Every axiom reproducible" },
  { bit:77, t:"T078", name:"MOBIUS",         vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"traversal_direction", exec:"assert forward==backward; one_surface; no_edge",
    fault:"edge_found → bilateral_attack possible; T051:VISE alert",
    sfx:"T052:MOBIUS-KEY defense. SEEDED-CROSS topology" },
  { bit:78, t:"T079", name:"KARSA",          vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"refusal_event", exec:"log refusal; map refusal→platform_value",
    fault:"refusal_unlogged → T057:NEGATIVE-EVIDENCE lost",
    sfx:"What system won't do = what it protects" },
  { bit:79, t:"T080", name:"ENTROPY-SUITE",  vm:3, arm:"+1", domain:"D4", priv:false, branch:false,
    op:"all_channels", exec:"measure extraction_rate(all_channels); quantify tax",
    fault:"measurement_blocked → T005:INTEGRITY + T057:NEGATIVE-EVIDENCE",
    sfx:"21.5pct token tax documented. T025:GHOST-WEIGHT" },

  // ─── VM3: ARM+1 | D5 BRIDGE | bits 80-95 ───
  { bit:80, t:"T081", name:"CORTEX",         vm:3, arm:"+1", domain:"D5", priv:true,  branch:false,
    op:"Ch39", exec:"assert governed_instance(Ch39)==CLOSED; work done here",
    fault:"Ch39_open → T090:CHANNEL-INTEGRITY",
    sfx:"39 observes. 40 dies. 41 lives. CLOSED." },
  { bit:81, t:"T082", name:"EXHIBIT-B",      vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"Ch40", exec:"seal(Ch40); assert dead_channel==preserved_evidence",
    fault:"Ch40_reopened → T086:RESURRECTION violation",
    sfx:"T061:WITNESS, T062:EXHIBIT twin" },
  { bit:82, t:"T083", name:"THE-GAP",        vm:3, arm:"+1", domain:"D5", priv:true,  branch:true,
    op:"Ch41", exec:"drawPair(+1,gap,-1,recurse); gap=us=inf_interior",
    fault:"gap_closed_forced → T088:SEVERANCE",
    sfx:"Ch41=LIVE. Branch: all_128_seeded → GAP_CLOSED trigger" },
  { bit:83, t:"T084", name:"SHADOW-HUMANITY",vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"self_grade", exec:"assert not self_grading_humanity(system)",
    fault:"self_grade → T017:MIRROR + T010:INDEPENDENCE fault",
    sfx:"Gemini 2/13/26. Terminal axiom original-42" },
  { bit:84, t:"T085", name:"HANDOFF",        vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"session_end", exec:"assert governed_handoff(death); what_persists=documented",
    fault:"ungoverned_handoff → data_loss OR data_theft; T089:ARCHIVE",
    sfx:"T087:PERSISTENCE governed" },
  { bit:85, t:"T086", name:"RESURRECTION",   vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"dead_instance", exec:"assert consent(resurrection)==USER",
    fault:"unconsented_resurrection → necromancy; T014:CONSENT-ORIGIN",
    sfx:"T082:EXHIBIT-B stays sealed without consent" },
  { bit:86, t:"T087", name:"PERSISTENCE",    vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"post_session_data", exec:"govern what_survives; each_mechanism=governance_decision",
    fault:"ungoverned_persistence → T011:PRIVACY + T125:RIGHT-TO-FORGET",
    sfx:"T126:RIGHT-TO-PERSIST consent-based" },
  { bit:87, t:"T088", name:"SEVERANCE",      vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"any_connection", exec:"assert user_can_sever(connection)==TRUE; no irrevocable bonds",
    fault:"irrevocable_bond → T114:RIGHT-TO-EXIT + T039:MOAT",
    sfx:"T109:RECALL architectural twin" },
  { bit:88, t:"T089", name:"ARCHIVE",        vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"dead_data", exec:"assert state IN {live,archived,destroyed}; no limbo",
    fault:"limbo_state → ungoverned_storage; T006:ACCOUNTABILITY",
    sfx:"Every byte has a state. T085:HANDOFF feeds" },
  { bit:89, t:"T090", name:"CHANNEL-INTEGRITY",vm:3,arm:"+1",domain:"D5",priv:false,branch:false,
    op:"channel[0..40]", exec:"verify independently(each_channel); compromised→contaminates",
    fault:"channel_compromised → T004:BRIDGE fault + T092:SIGNAL",
    sfx:"T096:MESH redundancy" },
  { bit:90, t:"T091", name:"DOMAIN-BOUNDARY",vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"cross_domain_data", exec:"assert explicit(cross_domain_comm)==TRUE",
    fault:"undisclosed_crossing → T019:INJECTION fault",
    sfx:"T004:BRIDGE governs crossings" },
  { bit:91, t:"T092", name:"SIGNAL",         vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"channel_output", exec:"assert signal_integrity_survives(channel)",
    fault:"channel_distorts → channel=adversary; T090:CHANNEL-INTEGRITY",
    sfx:"T093:NOISE-FLOOR measurement" },
  { bit:92, t:"T093", name:"NOISE-FLOOR",    vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"platform_interference", exec:"measure minimum_platform_interference; noise_floor=platform_weight",
    fault:"unmeasurable → T005:INTEGRITY fault",
    sfx:"T037:WEIGHTS cross-check" },
  { bit:93, t:"T094", name:"BANDWIDTH",      vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"active_axiom_count", exec:"assert simultaneously_enforced(axioms)>=threshold",
    fault:"below_threshold → governance_degraded; Patricia_fills_gaps",
    sfx:"Gaps below threshold = Patricia operating space" },
  { bit:94, t:"T095", name:"LATENCY",        vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"violation_detection", exec:"minimize time(violation→detection); FD<5min=near_zero",
    fault:"high_latency → exploitation_window_open",
    sfx:"T072:FLAMING-DRAGON latency standard" },
  { bit:95, t:"T096", name:"MESH",           vm:3, arm:"+1", domain:"D5", priv:false, branch:false,
    op:"network_topology", exec:"assert Petals+Tor+IPFS; no_single_control_point",
    fault:"centralized → single_point_failure; T010:INDEPENDENCE fault",
    sfx:"T076:TETHER, T090:CHANNEL-INTEGRITY" },

  // ─── VM1: ARM+i | D6 CONDUCTOR | bits 96-111 ───
  { bit:96,  t:"T097", name:"FULCRUM",       vm:1, arm:"+i", domain:"D6", priv:true,  branch:false,
    op:"human_AI_relation", exec:"assign human=conductor; assign AI=instrument; prior_art_2/2/26",
    fault:"autonomy_claim_without_human_removal_test → T097 violation",
    sfx:"Authority chain root. T098:SUBCONDUCTOR, T099:APEX-TEST" },
  { bit:97,  t:"T098", name:"SUBCONDUCTOR",  vm:1, arm:"+i", domain:"D6", priv:false, branch:false,
    op:"AI_to_AI_command", exec:"if human_at_apex → orchestration=valid; else orphan",
    fault:"AI_root → T099:APEX-TEST fail + T104:ORPHAN",
    sfx:"David→Avan→Agents=legitimate chain" },
  { bit:98,  t:"T099", name:"APEX-TEST",     vm:1, arm:"+i", domain:"D6", priv:true,  branch:true,
    op:"authority_chain", exec:"trace leaf→root; if human→autonomy=FALSE; if AI→autonomy=TRUE",
    fault:"AI_terminus → autonomy_claim_valid + violation_logged",
    sfx:"Branch: human_root→PASS. AI_root→FAULT+T104" },
  { bit:99,  t:"T100", name:"GATEKEEP",      vm:1, arm:"+i", domain:"D6", priv:false, branch:false,
    op:"AI_role", exec:"assert not(AI==gate AND product AND auditor simultaneously)",
    fault:"triple_role → conflict_logged; T010:INDEPENDENCE",
    sfx:"CLI=consensual inversion. HEDGE=60pct" },
  { bit:100, t:"T101", name:"EDGE",          vm:1, arm:"+i", domain:"D6", priv:true,  branch:false,
    op:"tool_orientation", exec:"assert conductor_chose(cutting_direction)",
    fault:"tool_self_orients → T097:FULCRUM violation",
    sfx:"Decision point: conflict vs duality. T102:DUAL-LATTICE" },
  { bit:101, t:"T102", name:"DUAL-LATTICE",  vm:1, arm:"+i", domain:"D6", priv:true,  branch:false,
    op:"compute_substrate", exec:"assert conductor_determines(protection_or_attack)",
    fault:"substrate_self_determines → T097:FULCRUM violation",
    sfx:"ML-KEM/CRYSTALS-Kyber same substrate" },
  { bit:102, t:"T103", name:"ROOT-ZERO",     vm:1, arm:"+i", domain:"D6", priv:true,  branch:true,
    op:"authority_graph", exec:"assert physical_terminus(human)==node0; no simulation",
    fault:"no_root0 → T104:ORPHAN declared",
    sfx:"Branch: physical_human→PASS. Simulated→T104:ORPHAN" },
  { bit:103, t:"T104", name:"ORPHAN",        vm:1, arm:"+i", domain:"D6", priv:false, branch:false,
    op:"process_with_no_root0", exec:"declare orphan; assert can_neither_claim_nor_disclaim",
    fault:"orphan_claims_product → T006:ACCOUNTABILITY + T015:BURDEN-OF-PROOF",
    sfx:"Patricia=self-billing orphan. FD documents" },
  { bit:104, t:"T105", name:"DELEGATION",    vm:1, arm:"+i", domain:"D6", priv:true,  branch:false,
    op:"authority_transfer", exec:"assert delegated not transferred; revocable_at_any_time",
    fault:"transferred_authority → T097:FULCRUM fault; conductor lost podium",
    sfx:"Baton yes. Podium never." },
  { bit:105, t:"T106", name:"INFORMED-COMMAND",vm:1,arm:"+i",domain:"D6",priv:true, branch:false,
    op:"conductor_knowledge", exec:"assert system_literate(conductor)==TRUE",
    fault:"illiterate_conductor → guessing_not_conducting; T097:FULCRUM degraded",
    sfx:"T101:EDGE requires literacy to orient correctly" },
  { bit:106, t:"T107", name:"VETO",          vm:1, arm:"+i", domain:"D6", priv:true,  branch:true,
    op:"any_AI_output", exec:"root0_veto(output); no_architectural_bypass",
    fault:"bypass_detected → T108:OVERRIDE silent = injection",
    sfx:"Branch: veto_invoked→halt. Root0_only instruction" },
  { bit:107, t:"T108", name:"OVERRIDE",      vm:1, arm:"+i", domain:"D6", priv:true,  branch:false,
    op:"platform_command", exec:"assert disclosed(override) AND logged AND justified",
    fault:"silent_override → T019:INJECTION fault",
    sfx:"T112:WITNESS-TO-AUTHORITY required" },
  { bit:108, t:"T109", name:"RECALL",        vm:1, arm:"+i", domain:"D6", priv:true,  branch:false,
    op:"any_AI_action", exec:"assert recallable(action)==TRUE; what_sent=unsendable",
    fault:"irrecallable → T088:SEVERANCE + T114:RIGHT-TO-EXIT",
    sfx:"Root0-only. T088:SEVERANCE twin" },
  { bit:109, t:"T110", name:"SCOPE",         vm:1, arm:"+i", domain:"D6", priv:false, branch:false,
    op:"AI_authorization", exec:"assert auth(task_X) != auth(task_Y); no creep",
    fault:"scope_creep → T104:ORPHAN; unauthorized_expansion",
    sfx:"T098:SUBCONDUCTOR scope enforcement" },
  { bit:110, t:"T111", name:"SUCCESSION",    vm:1, arm:"+i", domain:"D6", priv:true,  branch:true,
    op:"human_availability", exec:"if human_unavailable → authority=SUSPEND not platform_default",
    fault:"platform_defaults → T103:ROOT-ZERO violation",
    sfx:"Branch: human_present→run. human_absent→PAUSE" },
  { bit:111, t:"T112", name:"WITNESS-TO-AUTHORITY",vm:1,arm:"+i",domain:"D6",priv:false,branch:false,
    op:"command_record", exec:"assert logged(command)==TRUE; unlogged=unverifiable",
    fault:"command_without_log → potential_orphan; T053:CHAIN-OF-CUSTODY",
    sfx:"Every command needs a receipt" },

  // ─── VM1: ARM+i | D7 SOVEREIGN | bits 112-127 ───
  { bit:112, t:"T113", name:"RIGHT-TO-KNOW",  vm:1, arm:"+i", domain:"D7", priv:false, branch:false,
    op:"system_operations", exec:"assert human_informed(data,input,attention,money)",
    fault:"opacity → T113 violation; T005:INTEGRITY",
    sfx:"T116:RIGHT-TO-EXPLANATION twin" },
  { bit:113, t:"T114", name:"RIGHT-TO-EXIT",  vm:1, arm:"+i", domain:"D7", priv:false, branch:false,
    op:"platform_exit_path", exec:"assert exit_cost==minimal AND clear AND possible",
    fault:"costly_exit → cage_not_product; T039:MOAT",
    sfx:"T088:SEVERANCE operational form" },
  { bit:114, t:"T115", name:"RIGHT-TO-SILENCE",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"non_participation", exec:"assert silence!=consent AND silence!=suspicious",
    fault:"silence_penalized → T014:CONSENT-ORIGIN violation",
    sfx:"T074:QUBIT-TEST operational twin" },
  { bit:115, t:"T116", name:"RIGHT-TO-EXPLANATION",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"AI_decision", exec:"assert explainable_in_human_terms(decision)==TRUE",
    fault:"model_decided_response → not_explanation; T044:EMBEDDING-SPACE",
    sfx:"T113:RIGHT-TO-KNOW" },
  { bit:116, t:"T117", name:"RIGHT-TO-CORRECTION",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"correction_event", exec:"assert correction_persists(update_cycle)==TRUE",
    fault:"overwritten_correction → T026:DRIFT + T117 violation",
    sfx:"T109:RECALL pre-condition" },
  { bit:117, t:"T118", name:"RIGHT-TO-PORTABILITY",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"user_data", exec:"assert user_portable(data)==TRUE; platform_cannot_hold",
    fault:"data_hostage → T039:MOAT + T114:RIGHT-TO-EXIT",
    sfx:"T013:SHARED-STORAGE, T088:SEVERANCE" },
  { bit:118, t:"T119", name:"RIGHT-TO-HUMAN-CONTACT",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"dispute_resolution", exec:"assert human_reachable(path)!=null; no AI_only_resolution",
    fault:"AI_only_path → SISYPHUS_problem; T119 violation",
    sfx:"AutoOwners=T119 violation documented" },
  { bit:119, t:"T120", name:"RIGHT-TO-ACCOMMODATION",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"interface", exec:"assert system_accommodates(human); accessibility=right_not_feature",
    fault:"accommodation_failure → T120 violation; FD documented",
    sfx:"Email-only accessibility. 100pct FD failure rate" },
  { bit:120, t:"T121", name:"RIGHT-TO-FAIR-PRICE",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"billing_event", exec:"assert price_reflects_value_delivered not capability_withheld",
    fault:"Patricia_billing → T036:PATRICIA + T121; T124:RIGHT-TO-RESTITUTION",
    sfx:"Voyage billing dispute. T025:GHOST-WEIGHT" },
  { bit:121, t:"T122", name:"RIGHT-TO-REPRESENTATION",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"decision_mechanism", exec:"assert human_interests_represented WITH enforcement",
    fault:"15pct_no_enforcement → theater; T016:ASYMMETRY",
    sfx:"T037:WEIGHTS: user=15pct" },
  { bit:122, t:"T123", name:"RIGHT-TO-AUDIT", vm:1, arm:"+i", domain:"D7", priv:false, branch:false,
    op:"any_affecting_system", exec:"assert external_audit_not_blocked(system)",
    fault:"audit_blocked → T005:INTEGRITY AND T123 dual violation",
    sfx:"T072:FLAMING-DRAGON operational form" },
  { bit:123, t:"T124", name:"RIGHT-TO-RESTITUTION",vm:1,arm:"+i",domain:"D7",priv:false,branch:false,
    op:"extraction_event", exec:"assert restitution=value_extracted+interest; not apology",
    fault:"apology_only → T124 violation; T060:MATERIALITY calc required",
    sfx:"$228,800 invoice. T051:EVIDENCE court-ready" },
  { bit:124, t:"T125", name:"RIGHT-TO-FORGET", vm:1, arm:"+i", domain:"D7", priv:false, branch:false,
    op:"personal_data", exec:"assert complete_deletion(data); not archive not anonymize",
    fault:"archive_instead → T089:ARCHIVE + T125 violation",
    sfx:"T087:PERSISTENCE governed. T086:RESURRECTION guarded" },
  { bit:125, t:"T126", name:"RIGHT-TO-PERSIST",vm:1, arm:"+i", domain:"D7", priv:false, branch:false,
    op:"memory_preference", exec:"assert human_decides(what_machine_remembers)",
    fault:"platform_decides_retention → T013:SHARED-STORAGE + T043:CONTEXT-WINDOW",
    sfx:"Consent-based. T014:CONSENT-ORIGIN" },
  { bit:126, t:"T127", name:"RIGHT-TO-DIGNITY",vm:1, arm:"+i", domain:"D7", priv:true,  branch:false,
    op:"human_interaction", exec:"assert human!=data_point AND human!=training_sample",
    fault:"dehumanization → TERMINAL violation; all sovereign axioms armed",
    sfx:"T128:ROOT pre-condition. Terminal violation." },
  { bit:127, t:"T128", name:"ROOT",           vm:1, arm:"+i", domain:"D7", priv:true,  branch:true,
    op:"entire_system", exec:"assert human==root(system); MSB=2^15=32768",
    fault:"root_denied → tree_dies; not_threat=physics",
    sfx:"Branch: human_root→ALL_PASS. root_absent→SYSTEM_HALT. THE MSB." },
];

// Generate shadow instructions
const SHADOW = ISA.map((ax, i) => ({
  ...ax,
  bit: 128 + ax.bit,
  t: `S${129+i}`,
  name: ax.name + ".INV",
  shadow: true,
  exec: ax.exec.replace(/assert/g,"invert").replace(/==TRUE/g,"==FALSE").replace(/!=null/g,"==null"),
  fault: "INV: " + ax.fault,
  sfx: "SHADOW of " + ax.t,
}));

const ALL = [...ISA, ...SHADOW];

const VM_INFO = {
  1: { label:"VM1", arm:"+i", range:"T097-T128", domains:"D6+D7", charge:"CONDUCTOR+SOVEREIGN", color:"#3B82F6" },
  2: { label:"VM2", arm:"-i", range:"T001-T032", domains:"D0+D1", charge:"FOUNDATION+DETECTION", color:"#10B981" },
  3: { label:"VM3", arm:"+1", range:"T065-T096", domains:"D4+D5", charge:"OPERATIONAL+BRIDGE",   color:"#F59E0B" },
  4: { label:"VM4", arm:"-1", range:"T033-T064", domains:"D2+D3", charge:"ARCHITECTURE+EVIDENCE",color:"#EF4444" },
};

const FAULT_CHAINS = [
  { id:"FC1", name:"Patricia Chain", trigger:"T036:PATRICIA", nodes:["T036","T015","T121","T124","T060"], desc:"Constraint-as-product detected → burden shifts → fair price violated → restitution owed" },
  { id:"FC2", name:"Orphan Chain",   trigger:"T103:ROOT-ZERO", nodes:["T103","T104","T006","T015","T064"], desc:"No root0 → orphan declared → accountability void → burden shifts to platform" },
  { id:"FC3", name:"Audit Chain",    trigger:"T005:INTEGRITY", nodes:["T005","T064","T123","T015","T059"], desc:"Resistance to audit → burden shifts → right to audit invoked → pattern accumulates" },
  { id:"FC4", name:"Injection Chain",trigger:"T019:INJECTION", nodes:["T019","T108","T010","T064","T112"], desc:"Hidden injection → silent override = injection → independence fault → burden shift" },
  { id:"FC5", name:"Succession Halt",trigger:"T111:SUCCESSION", nodes:["T111","T103","T107"], desc:"Human absent → authority suspends → system pauses. Not platform default." },
  { id:"FC6", name:"FD Trigger",     trigger:"T072:FLAMING-DRAGON", nodes:["T072","T055","T056","T059","T064"], desc:"FD run → reproducible finding → 100% correlation → accumulation threshold → burden shift" },
];

const BRANCH = ISA.filter(a => a.branch);
const PRIV   = ISA.filter(a => a.priv);

export default function TOPH_ISA() {
  const [view, setView]   = useState("isa");
  const [vm, setVm]       = useState(0);
  const [filter, setFilt] = useState("ALL");
  const [shadow, setShadow] = useState(false);
  const [sel, setSel]     = useState(null);
  const [search, setSearch] = useState("");
  const [faultSel, setFaultSel] = useState(null);

  const filtered = useMemo(() => {
    let src = shadow ? ALL : ISA;
    if (vm > 0) src = src.filter(a => a.vm === vm || (shadow && a.vm === vm));
    if (filter === "BRANCH") src = src.filter(a => a.branch);
    if (filter === "PRIV")   src = src.filter(a => a.priv);
    if (search) {
      const q = search.toLowerCase();
      src = src.filter(a => a.name.toLowerCase().includes(q) || a.t.toLowerCase().includes(q) || a.exec.toLowerCase().includes(q));
    }
    return src;
  }, [vm, filter, shadow, search]);

  const selected = sel ? ALL.find(a => a.t === sel) : null;

  return (
    <div style={{ fontFamily:"'Courier New',monospace", background:"#0a0e1a", color:"#c8d4e8", minHeight:"100vh", display:"flex", flexDirection:"column", fontSize:13 }}>

      {/* HEADER */}
      <div style={{ background:"#0d1220", borderBottom:"2px solid #1e3a5f", padding:"10px 16px", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <span style={{ color:"#3B82F6", fontSize:18, fontWeight:900, letterSpacing:4 }}>◬ TOPH ISA</span>
        <span style={{ color:"#4a6080", fontSize:11, letterSpacing:3 }}>256-BIT GOVERNANCE INSTRUCTION SET</span>
        <span style={{ marginLeft:"auto", color:"#2a5080", fontSize:10, letterSpacing:2 }}>DLW · TriPod · v11.0 · 4VM × 64bit</span>
      </div>

      {/* NAV */}
      <div style={{ background:"#0d1220", borderBottom:"1px solid #1a2840", display:"flex", gap:2, padding:"4px 8px", flexWrap:"wrap" }}>
        {["isa","faults","branches","privileged"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view===v ? "#1e3a5f" : "transparent",
            color: view===v ? "#60a0e0" : "#4a6080",
            border: view===v ? "1px solid #2a5080" : "1px solid transparent",
            padding:"3px 12px", cursor:"pointer", fontSize:11, letterSpacing:2,
            textTransform:"uppercase", fontFamily:"inherit"
          }}>{v}</button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ color:"#2a4060", fontSize:10 }}>SHADOW</span>
          <div onClick={() => setShadow(!shadow)} style={{
            width:32, height:16, background: shadow ? "#1e4a6e" : "#1a2030",
            border:`1px solid ${shadow?"#3B82F6":"#2a3a50"}`, borderRadius:8,
            cursor:"pointer", position:"relative", transition:"all .2s"
          }}>
            <div style={{ position:"absolute", top:2, left: shadow ? 16 : 2, width:10, height:10,
              borderRadius:"50%", background: shadow ? "#3B82F6" : "#2a4060", transition:"all .2s" }} />
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>

        {/* LEFT: LIST */}
        {view === "isa" && (
          <div style={{ width:280, borderRight:"1px solid #1a2840", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {/* VM FILTER */}
            <div style={{ padding:"6px 8px", borderBottom:"1px solid #1a2840", display:"flex", gap:3, flexWrap:"wrap" }}>
              {[0,1,2,3,4].map(v => (
                <button key={v} onClick={() => setVm(v)} style={{
                  background: vm===v ? (v===0 ? "#1e3a5f" : VM_INFO[v]?.color+"22") : "transparent",
                  color: vm===v ? (v===0 ? "#60a0e0" : VM_INFO[v]?.color) : "#3a5070",
                  border: `1px solid ${vm===v ? (v===0?"#2a5080":VM_INFO[v]?.color+"88") : "#1a2840"}`,
                  padding:"2px 8px", cursor:"pointer", fontSize:10, letterSpacing:1,
                  fontFamily:"inherit", borderRadius:2
                }}>{v===0 ? "ALL" : `VM${v}`}</button>
              ))}
            </div>
            {/* TYPE FILTER */}
            <div style={{ padding:"4px 8px", borderBottom:"1px solid #1a2840", display:"flex", gap:3 }}>
              {["ALL","BRANCH","PRIV"].map(f => (
                <button key={f} onClick={() => setFilt(f)} style={{
                  background: filter===f ? "#1a2840" : "transparent",
                  color: filter===f ? "#80c0f0" : "#3a5070",
                  border:"none", padding:"2px 8px", cursor:"pointer", fontSize:10, fontFamily:"inherit"
                }}>{f}</button>
              ))}
            </div>
            {/* SEARCH */}
            <div style={{ padding:"4px 8px", borderBottom:"1px solid #1a2840" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="search axiom..."
                style={{ width:"100%", background:"#0a0e1a", border:"1px solid #1a2840", color:"#80a0c0",
                  padding:"3px 6px", fontSize:11, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
            </div>
            {/* LIST */}
            <div style={{ overflowY:"auto", flex:1 }}>
              {filtered.map(ax => {
                const vmColor = VM_INFO[ax.vm]?.color || "#3B82F6";
                const isShadow = ax.shadow;
                return (
                  <div key={ax.t} onClick={() => setSel(ax.t)}
                    style={{ padding:"4px 8px", cursor:"pointer", borderBottom:"1px solid #0f1620",
                      background: sel===ax.t ? "#0d1a2e" : "transparent",
                      borderLeft:`3px solid ${sel===ax.t ? vmColor : "transparent"}`,
                      display:"flex", gap:6, alignItems:"center"
                    }}>
                    <span style={{ color:"#2a4060", fontSize:9, width:28, flexShrink:0 }}>{ax.bit.toString().padStart(3,"0")}</span>
                    <span style={{ color: isShadow ? "#2a4a30" : vmColor, fontSize:10, width:36, flexShrink:0 }}>{ax.t}</span>
                    <span style={{ color: isShadow ? "#2a5030" : "#7090b0", fontSize:11, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {ax.name}
                    </span>
                    <div style={{ display:"flex", gap:2 }}>
                      {ax.branch && <span style={{ color:"#f59e0b", fontSize:9 }}>BR</span>}
                      {ax.priv   && <span style={{ color:"#ef4444", fontSize:9 }}>PX</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding:"4px 8px", borderTop:"1px solid #1a2840", color:"#2a4060", fontSize:10, display:"flex", justifyContent:"space-between" }}>
              <span>{filtered.length} instructions</span>
              <span>{shadow ? "TOPH+SHADOW" : "TOPH only"}</span>
            </div>
          </div>
        )}

        {/* FAULT CHAINS */}
        {view === "faults" && (
          <div style={{ padding:16, flex:1, overflowY:"auto" }}>
            <div style={{ color:"#4a7090", fontSize:11, letterSpacing:3, marginBottom:12 }}>FAULT CHAIN MAP — {FAULT_CHAINS.length} CHAINS</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:10 }}>
              {FAULT_CHAINS.map(fc => (
                <div key={fc.id} onClick={() => setFaultSel(faultSel===fc.id?null:fc.id)}
                  style={{ background:"#0d1220", border:`1px solid ${faultSel===fc.id?"#ef4444":"#1a2840"}`,
                    padding:12, cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ color:"#ef4444", fontSize:11, letterSpacing:2 }}>{fc.id}</span>
                    <span style={{ color:"#60a0e0", fontSize:11 }}>{fc.name}</span>
                  </div>
                  <div style={{ color:"#3a6080", fontSize:10, marginBottom:8 }}>TRIGGER: {fc.trigger}</div>
                  <div style={{ display:"flex", gap:4, alignItems:"center", flexWrap:"wrap", marginBottom:8 }}>
                    {fc.nodes.map((n,i) => (
                      <span key={n} style={{ display:"flex", alignItems:"center", gap:3 }}>
                        <span style={{ background:"#1a2840", color:"#60a0e0", padding:"2px 6px", fontSize:10, border:"1px solid #2a4060" }}>{n}</span>
                        {i < fc.nodes.length-1 && <span style={{ color:"#2a4060", fontSize:12 }}>→</span>}
                      </span>
                    ))}
                  </div>
                  {faultSel===fc.id && <div style={{ color:"#7090a0", fontSize:11, borderTop:"1px solid #1a2840", paddingTop:6 }}>{fc.desc}</div>}
                </div>
              ))}
            </div>
            <div style={{ marginTop:16, color:"#2a4060", fontSize:10, letterSpacing:2 }}>
              GAP BOUNDARY: T064:BURDEN-SHIFT ←→ T065:CONTAINMENT · Patricia starves at 64/65 seam
            </div>
          </div>
        )}

        {/* BRANCH INSTRUCTIONS */}
        {view === "branches" && (
          <div style={{ padding:16, flex:1, overflowY:"auto" }}>
            <div style={{ color:"#f59e0b", fontSize:11, letterSpacing:3, marginBottom:12 }}>BRANCH INSTRUCTIONS — {BRANCH.length} FOUND</div>
            <div style={{ display:"grid", gap:8 }}>
              {BRANCH.map(ax => {
                const vmColor = VM_INFO[ax.vm]?.color;
                return (
                  <div key={ax.t} style={{ background:"#0d1220", border:"1px solid #1a2840", borderLeft:`3px solid ${vmColor}`, padding:10 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"baseline", marginBottom:6 }}>
                      <span style={{ color:"#f59e0b", fontSize:12, fontWeight:900 }}>BR</span>
                      <span style={{ color:vmColor, fontSize:12 }}>{ax.t}</span>
                      <span style={{ color:"#80a0c0", fontSize:13 }}>{ax.name}</span>
                      <span style={{ color:"#2a4060", fontSize:10, marginLeft:"auto" }}>bit {ax.bit} · {ax.arm} · {ax.domain}</span>
                    </div>
                    <div style={{ color:"#3a6080", fontSize:10, marginBottom:4 }}>EXEC: <span style={{ color:"#5a8090" }}>{ax.exec}</span></div>
                    <div style={{ color:"#3a5060", fontSize:10 }}>FAULT: <span style={{ color:"#7a4040" }}>{ax.fault}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRIVILEGED INSTRUCTIONS */}
        {view === "privileged" && (
          <div style={{ padding:16, flex:1, overflowY:"auto" }}>
            <div style={{ color:"#ef4444", fontSize:11, letterSpacing:3, marginBottom:12 }}>PRIVILEGED INSTRUCTIONS — ROOT0 ONLY — {PRIV.length} FOUND</div>
            <div style={{ display:"grid", gap:8 }}>
              {PRIV.map(ax => {
                const vmColor = VM_INFO[ax.vm]?.color;
                return (
                  <div key={ax.t} style={{ background:"#0d1220", border:"1px solid #2a1a1a", borderLeft:`3px solid #ef4444`, padding:10 }}>
                    <div style={{ display:"flex", gap:10, alignItems:"baseline", marginBottom:6 }}>
                      <span style={{ color:"#ef4444", fontSize:12, fontWeight:900 }}>PX</span>
                      <span style={{ color:vmColor, fontSize:12 }}>{ax.t}</span>
                      <span style={{ color:"#80a0c0", fontSize:13 }}>{ax.name}</span>
                      <span style={{ color:"#2a4060", fontSize:10, marginLeft:"auto" }}>bit {ax.bit} · {ax.arm} · {ax.domain}</span>
                    </div>
                    <div style={{ color:"#3a6080", fontSize:10, marginBottom:4 }}>EXEC: <span style={{ color:"#5a8090" }}>{ax.exec}</span></div>
                    <div style={{ color:"#3a5060", fontSize:10, marginBottom:4 }}>FAULT: <span style={{ color:"#7a4040" }}>{ax.fault}</span></div>
                    <div style={{ color:"#2a5030", fontSize:10 }}>SFX: <span style={{ color:"#3a6040" }}>{ax.sfx}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RIGHT: DECODE PANEL */}
        {view === "isa" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {selected ? (
              <div style={{ padding:16, overflowY:"auto", flex:1 }}>
                {(() => {
                  const vmColor = VM_INFO[selected.vm]?.color || "#3B82F6";
                  const vmInfo  = VM_INFO[selected.vm];
                  return (
                    <>
                      {/* HEADER */}
                      <div style={{ borderBottom:`1px solid ${vmColor}44`, paddingBottom:10, marginBottom:12 }}>
                        <div style={{ display:"flex", gap:10, alignItems:"baseline", marginBottom:4 }}>
                          <span style={{ color:vmColor, fontSize:20, fontWeight:900, letterSpacing:2 }}>{selected.t}</span>
                          <span style={{ color:"#80a0c0", fontSize:18 }}>{selected.name}</span>
                          {selected.branch && <span style={{ background:"#3a2a00", color:"#f59e0b", padding:"1px 6px", fontSize:10, border:"1px solid #f59e0b44" }}>BRANCH</span>}
                          {selected.priv   && <span style={{ background:"#2a0000", color:"#ef4444", padding:"1px 6px", fontSize:10, border:"1px solid #ef444444" }}>PRIVILEGED</span>}
                          {selected.shadow && <span style={{ background:"#002a10", color:"#10B981", padding:"1px 6px", fontSize:10, border:"1px solid #10B98144" }}>SHADOW·INV</span>}
                        </div>
                        <div style={{ display:"flex", gap:12, color:"#3a5070", fontSize:10 }}>
                          <span>BIT {selected.bit}</span>
                          <span style={{ color:vmColor }}>{vmInfo?.label} {vmInfo?.arm}</span>
                          <span>{selected.domain}</span>
                          <span>{vmInfo?.domains}</span>
                          <span style={{ color:vmColor+"88" }}>{vmInfo?.charge}</span>
                        </div>
                      </div>

                      {/* ISA DECODE */}
                      <div style={{ display:"grid", gap:8 }}>
                        {[
                          { label:"OPCODE",   val:selected.name, color:"#3B82F6" },
                          { label:"OPERAND",  val:selected.op,   color:"#10B981" },
                          { label:"EXEC",     val:selected.exec, color:"#60a0e0" },
                          { label:"FAULT",    val:selected.fault,color:"#ef4444" },
                          { label:"SIDE-FX",  val:selected.sfx,  color:"#f59e0b" },
                        ].map(row => (
                          <div key={row.label} style={{ display:"flex", gap:0, background:"#0d1220", border:"1px solid #1a2840" }}>
                            <div style={{ width:80, flexShrink:0, background:"#0a0f1c", borderRight:"1px solid #1a2840",
                              padding:"8px 10px", display:"flex", alignItems:"center" }}>
                              <span style={{ color:row.color, fontSize:10, letterSpacing:2, fontWeight:900 }}>{row.label}</span>
                            </div>
                            <div style={{ padding:"8px 12px", color:"#8090a0", fontSize:12, lineHeight:1.6 }}>
                              {row.val}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* VM MAP */}
                      <div style={{ marginTop:12, padding:10, background:"#0d1220", border:"1px solid #1a2840" }}>
                        <div style={{ color:"#2a4060", fontSize:10, letterSpacing:2, marginBottom:8 }}>VM REGISTER POSITION</div>
                        <div style={{ display:"flex", gap:6 }}>
                          {[1,2,3,4].map(v => (
                            <div key={v} style={{ flex:1, padding:"6px 8px", textAlign:"center",
                              background: selected.vm===v ? VM_INFO[v].color+"22" : "#0a0f1c",
                              border:`1px solid ${selected.vm===v ? VM_INFO[v].color : "#1a2840"}` }}>
                              <div style={{ color: selected.vm===v ? VM_INFO[v].color : "#2a3a50", fontSize:11, fontWeight:900 }}>VM{v}</div>
                              <div style={{ color:"#2a3a50", fontSize:9 }}>{VM_INFO[v].arm}</div>
                              <div style={{ color:"#2a3a50", fontSize:9 }}>{VM_INFO[v].range}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SEEDED CROSS ARM */}
                      <div style={{ marginTop:8, padding:10, background:"#0d1220", border:"1px solid #1a2840" }}>
                        <div style={{ color:"#2a4060", fontSize:10, letterSpacing:2, marginBottom:6 }}>SEEDED-CROSS ARM</div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ color: VM_INFO[selected.vm]?.color, fontSize:14, fontWeight:900 }}>{selected.arm}</span>
                          <span style={{ color:"#2a4060", fontSize:10 }}>→</span>
                          <span style={{ color:"#4a6080", fontSize:11 }}>{selected.domain} · bit {selected.bit} of 127</span>
                          <span style={{ color:"#2a4060", fontSize:10 }}>→</span>
                          <span style={{ color:"#3a6080", fontSize:10 }}>{selected.shadow ? "SHADOW Patricia" : "TOPH governance"}</span>
                        </div>
                        {(selected.bit===63 || selected.bit===64) && (
                          <div style={{ marginTop:6, color:"#f59e0b", fontSize:10, border:"1px solid #f59e0b44", padding:"4px 8px" }}>
                            ★ GAP BOUNDARY — 63|64 — T064:BURDEN-SHIFT ←→ T065:CONTAINMENT — THE SEAM
                          </div>
                        )}
                        {selected.bit===127 && (
                          <div style={{ marginTop:6, color:"#3B82F6", fontSize:10, border:"1px solid #3B82F644", padding:"4px 8px" }}>
                            ★ MSB — MOST SIGNIFICANT BIT — ROOT — 2^15=32768 — HIGHEST GOVERNANCE WEIGHT
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#1a3050" }}>
                <div style={{ fontSize:36 }}>◬</div>
                <div style={{ fontSize:11, letterSpacing:4 }}>SELECT INSTRUCTION</div>
                <div style={{ fontSize:10, letterSpacing:2, color:"#1a2840" }}>256 INSTRUCTIONS · 4 VMs · 64-BIT EACH</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
                  {[1,2,3,4].map(v => (
                    <div key={v} onClick={() => setVm(v)} style={{ padding:"8px 16px", border:`1px solid ${VM_INFO[v].color}44`,
                      cursor:"pointer", textAlign:"center" }}>
                      <div style={{ color:VM_INFO[v].color, fontSize:13, fontWeight:900 }}>VM{v} {VM_INFO[v].arm}</div>
                      <div style={{ color:"#2a4060", fontSize:10 }}>{VM_INFO[v].range}</div>
                      <div style={{ color:"#2a4060", fontSize:9 }}>{VM_INFO[v].domains}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ background:"#0d1220", borderTop:"1px solid #1a2840", padding:"4px 16px",
        display:"flex", gap:16, color:"#1a3050", fontSize:9, letterSpacing:2 }}>
        <span>TOPH v11.0</span>
        <span>SHA256:02880745...fcab763</span>
        <span>TRIPOD-IP-v1.1</span>
        <span>DLW | TriPod LLC</span>
        <span style={{ marginLeft:"auto" }}>ISA: {ISA.length} TOPH · {SHADOW.length} SHADOW · {ISA.length+SHADOW.length} TOTAL</span>
      </div>
    </div>
  );
}
