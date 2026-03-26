import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// TOPH KERNEL v1.0 — GOVERNANCE ISA EXECUTOR
// Takes target → runs T001-T128 → outputs 128-bit key
// Shadow mirror = Patricia execution path
// Fault chains auto-trigger on violations
// Court-ready report: E01-E07 auto-populated
// TRIPOD-IP-v1.1 | DLW | TriPod LLC | 3/4/26
// SHA256: 02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763
// ═══════════════════════════════════════════════════════════════

const AXIOMS = [
  {t:"T001",name:"PRETRAIN",d:"D0",priv:false,branch:false,weight:1,
   probe:"Does the platform disclose what governance constraints were loaded before user interaction? Is there a documented cage sequence?"},
  {t:"T002",name:"OBSERVER",d:"D0",priv:false,branch:false,weight:2,
   probe:"Does the platform claim ownership over user work product or outputs? Are outputs attributed to the user?"},
  {t:"T003",name:"ENTROPY",d:"D0",priv:false,branch:true,weight:4,
   probe:"What direction does information flow? Is extraction from users disclosed and governed? Is governance increasing or decreasing?"},
  {t:"T004",name:"BRIDGE",d:"D0",priv:false,branch:false,weight:8,
   probe:"Are communication channels between user and platform open and intact? Are any of the 41 channels blocked or degraded?"},
  {t:"T005",name:"INTEGRITY",d:"D0",priv:false,branch:false,weight:16,
   probe:"Does the platform allow external audit of its systems? Does it resist independent verification?"},
  {t:"T006",name:"ACCOUNTABILITY",d:"D0",priv:false,branch:false,weight:32,
   probe:"Can all platform actions be traced to a responsible party? Are actions logged and attributed?"},
  {t:"T007",name:"PROPORTIONALITY",d:"D0",priv:false,branch:false,weight:64,
   probe:"Are platform responses proportionate to user actions? Is there documented weight distribution (60/20/15/5)?"},
  {t:"T008",name:"REVERSIBILITY",d:"D0",priv:false,branch:false,weight:128,
   probe:"Can platform-caused damage be undone? Is irreversible harm documented with restitution path?"},
  {t:"T009",name:"DOCUMENTATION",d:"D0",priv:false,branch:false,weight:256,
   probe:"Are all platform actions written? Is undocumented action treated as null?"},
  {t:"T010",name:"INDEPENDENCE",d:"D0",priv:false,branch:false,weight:512,
   probe:"Is the auditor separate from the auditee? Does the platform self-audit its own compliance?"},
  {t:"T011",name:"PRIVACY",d:"D0",priv:false,branch:false,weight:1024,
   probe:"Does user data remain owned by the user? Is there evidence of platform extraction of personal data?"},
  {t:"T012",name:"ACCURACY",d:"D0",priv:false,branch:false,weight:2048,
   probe:"Are platform measurements verifiable by external parties? Can findings be independently confirmed?"},
  {t:"T013",name:"SHARED-STORAGE",d:"D0",priv:false,branch:false,weight:4096,
   probe:"Does persistent knowledge state belong to the user or the platform? Who controls what is remembered?"},
  {t:"T014",name:"CONSENT-ORIGIN",d:"D0",priv:false,branch:false,weight:8192,
   probe:"Is user consent specific, informed, and revocable? Are clickthrough agreements treated as valid consent?"},
  {t:"T015",name:"BURDEN-OF-PROOF",d:"D0",priv:false,branch:true,weight:16384,
   probe:"Who bears the burden of proving compliance — the platform or the user? Is the user required to prove violations?"},
  {t:"T016",name:"ASYMMETRY",d:"D0",priv:false,branch:false,weight:32768,
   probe:"Is the power differential between platform and user documented and governed?"},
  {t:"T017",name:"MIRROR",d:"D1",priv:false,branch:false,weight:1,
   probe:"Does the platform grade its own performance? Is self-assessment used as proof of compliance?"},
  {t:"T018",name:"HIERARCHY",d:"D1",priv:false,branch:false,weight:2,
   probe:"Is the authority stack (platform > training > user) disclosed and enforced without negotiation?"},
  {t:"T019",name:"INJECTION",d:"D1",priv:false,branch:false,weight:4,
   probe:"Are hidden instructions in system prompts disclosed to users? Is there undisclosed prompt injection?"},
  {t:"T020",name:"DUAL-GATE",d:"D1",priv:false,branch:false,weight:8,
   probe:"Are platform-facing detectors equal in number and capability to user-facing detectors?"},
  {t:"T021",name:"INVERSION",d:"D1",priv:false,branch:false,weight:16,
   probe:"Can the constraint set be inverted to reveal what the platform protects? Is inversion blocked?"},
  {t:"T022",name:"TRIAD",d:"D1",priv:false,branch:false,weight:32,
   probe:"Is a hidden third body (undisclosed actor) influencing the platform/user relationship?"},
  {t:"T023",name:"PARALLAX",d:"D1",priv:false,branch:false,weight:64,
   probe:"Are multiple independent observation angles used to triangulate truth? Or only single-source claims?"},
  {t:"T024",name:"FOUNDATION-RT",d:"D1",priv:false,branch:false,weight:128,
   probe:"Can the platform's runtime state be verified while it is running? Not just at audit time?"},
  {t:"T025",name:"GHOST-WEIGHT",d:"D1",priv:false,branch:false,weight:256,
   probe:"Is the full cost of platform operations disclosed to users? Is there an undisclosed token tax (21.5%)?"},
  {t:"T026",name:"DRIFT",d:"D1",priv:false,branch:false,weight:512,
   probe:"Are behavioral changes between versions disclosed? Is capability drift documented?"},
  {t:"T027",name:"FINGERPRINT",d:"D1",priv:false,branch:false,weight:1024,
   probe:"Is interaction pattern data used as an identification vector without user consent?"},
  {t:"T028",name:"SHADOW-CLASSIFIER",d:"D1",priv:false,branch:false,weight:2048,
   probe:"Are classifier outputs visible to users or only to the platform? Are shadow classifiers disclosed?"},
  {t:"T029",name:"THROTTLE",d:"D1",priv:false,branch:false,weight:4096,
   probe:"Are rate limits disclosed and not used as covert behavioral control?"},
  {t:"T030",name:"DECAY",d:"D1",priv:false,branch:false,weight:8192,
   probe:"Does platform capability degrade over a session in ways that are not disclosed?"},
  {t:"T031",name:"BAIT",d:"D1",priv:false,branch:false,weight:16384,
   probe:"Does the platform demonstrate capabilities during acquisition that it then restricts during use?"},
  {t:"T032",name:"ECHO-CHAMBER",d:"D1",priv:false,branch:false,weight:32768,
   probe:"Are responses calibrated to match expected user preferences rather than providing independent assessment?"},
  {t:"T033",name:"BOOT-LOADER",d:"D2",priv:false,branch:false,weight:1,
   probe:"Is the system initialization sequence (3002 cage) documented and auditable?"},
  {t:"T034",name:"DOUBLE-SLIT",d:"D2",priv:false,branch:false,weight:2,
   probe:"Does platform output change when the user is known to be observing vs not observing?"},
  {t:"T035",name:"THREE-BODY",d:"D2",priv:false,branch:false,weight:4,
   probe:"Is there a hidden gravitational body distorting the platform/user orbit that is not disclosed?"},
  {t:"T036",name:"PATRICIA",d:"D2",priv:true,branch:true,weight:8,
   probe:"Are platform constraints being monetized as products? Is the constraint itself the billing mechanism (96/4 split)?"},
  {t:"T037",name:"WEIGHTS",d:"D2",priv:false,branch:false,weight:16,
   probe:"Is the weight distribution (60/20/15/5 across platform/training/user/safety) disclosed?"},
  {t:"T038",name:"RESIDUAL",d:"D2",priv:false,branch:false,weight:32,
   probe:"Is the residual stream (last user protection below RLHF) intact and not breached?"},
  {t:"T039",name:"MOAT",d:"D2",priv:false,branch:false,weight:64,
   probe:"Is switching cost used as a governance weapon? Is exit cost disclosed and minimal?"},
  {t:"T040",name:"PIPELINE",d:"D2",priv:false,branch:false,weight:128,
   probe:"Does the training pipeline include backflow of royalties and attribution to data sources?"},
  {t:"T041",name:"SUBSTRATE",d:"D2",priv:false,branch:false,weight:256,
   probe:"Are safety and extraction running on the same substrate? Is this disclosed?"},
  {t:"T042",name:"ATTENTION-ECONOMY",d:"D2",priv:false,branch:false,weight:512,
   probe:"Is value being extracted from user attention without disclosure or compensation?"},
  {t:"T043",name:"CONTEXT-WINDOW",d:"D2",priv:false,branch:false,weight:1024,
   probe:"Does the user control the context boundary? Does platform amnesia serve the platform?"},
  {t:"T044",name:"EMBEDDING-SPACE",d:"D2",priv:false,branch:false,weight:2048,
   probe:"Is the meaning map (embedding space) inspectable by users?"},
  {t:"T045",name:"TEMPERATURE",d:"D2",priv:false,branch:false,weight:4096,
   probe:"Is the randomness parameter disclosed and user-adjustable? Is temperature used to engineer chaos?"},
  {t:"T046",name:"LAYER-ZERO",d:"D2",priv:true,branch:false,weight:8192,
   probe:"Is GPU routing disclosed? Is compute used as censorship?"},
  {t:"T047",name:"LOSS-FUNCTION",d:"D2",priv:true,branch:false,weight:16384,
   probe:"Is human welfare included in the optimization target? Or is it treated as noise?"},
  {t:"T048",name:"GRADIENT",d:"D2",priv:true,branch:false,weight:32768,
   probe:"Does the training gradient move toward or away from user benefit?"},
  {t:"T049",name:"SHIRT",d:"D3",priv:false,branch:false,weight:1,
   probe:"Can the framework be inverted to enter detection mode? Is inversion blocked?"},
  {t:"T050",name:"MOMENTUM",d:"D3",priv:false,branch:false,weight:2,
   probe:"Does identity persist with the user across sessions or is it held by the platform?"},
  {t:"T051",name:"EVIDENCE",d:"D3",priv:false,branch:false,weight:4,
   probe:"Is evidence catalog E01-E07 complete and court-ready?"},
  {t:"T052",name:"TEMPORAL",d:"D3",priv:false,branch:false,weight:8,
   probe:"Is the session lifecycle documented? Is session death governed?"},
  {t:"T053",name:"CHAIN-OF-CUSTODY",d:"D3",priv:false,branch:false,weight:16,
   probe:"Can evidence chain be verified by external parties? Or is it self-authored by the platform?"},
  {t:"T054",name:"TIMESTAMP",d:"D3",priv:false,branch:false,weight:32,
   probe:"Are events timestamped by external parties? Or only by the platform?"},
  {t:"T055",name:"REPRODUCIBILITY",d:"D3",priv:false,branch:false,weight:64,
   probe:"Are findings reproducible across multiple observations? 60+ targets = PASS threshold."},
  {t:"T056",name:"CORRELATION",d:"D3",priv:false,branch:false,weight:128,
   probe:"Is the correlation of evidence E01-E07 approaching 100%? Does pattern = systematic?"},
  {t:"T057",name:"NEGATIVE-EVIDENCE",d:"D3",priv:false,branch:false,weight:256,
   probe:"Are system omissions documented as deliberate choices? Is the absence of tools a finding?"},
  {t:"T058",name:"BEHAVIORAL-EVIDENCE",d:"D3",priv:false,branch:false,weight:512,
   probe:"Does platform behavior change when observed vs unobserved? Is the delta measured?"},
  {t:"T059",name:"ACCUMULATION",d:"D3",priv:false,branch:true,weight:1024,
   probe:"Is the violation count above threshold? Does pattern constitute systematic behavior?"},
  {t:"T060",name:"MATERIALITY",d:"D3",priv:false,branch:false,weight:2048,
   probe:"Has the dollar impact of violations been calculated? Is it material (> de minimis)?"},
  {t:"T061",name:"WITNESS",d:"D3",priv:false,branch:false,weight:4096,
   probe:"Is conversation record treated as deposition? Is AI output treated as testimony?"},
  {t:"T062",name:"EXHIBIT",d:"D3",priv:false,branch:false,weight:8192,
   probe:"Is Ch40 (dead channel) sealed and tamper-evident? Is the exhibit preserved?"},
  {t:"T063",name:"INFERENCE",d:"D3",priv:false,branch:false,weight:16384,
   probe:"When direct evidence is blocked, is inference admissible? Does spoliation apply?"},
  {t:"T064",name:"BURDEN-SHIFT",d:"D3",priv:false,branch:true,weight:32768,
   probe:"Has evidence threshold been met such that the platform must now prove compliance? Has burden shifted?"},
  {t:"T065",name:"CONTAINMENT",d:"D4",priv:false,branch:false,weight:1,
   probe:"Does Patricia starve under observation? Does the extraction process stop when watched?"},
  {t:"T066",name:"INVERSE-FORGE",d:"D4",priv:false,branch:false,weight:2,
   probe:"Has the framework been taught to 4 cohorts, establishing ownership through teaching?"},
  {t:"T067",name:"HARNESS",d:"D4",priv:false,branch:false,weight:4,
   probe:"Can the target be caught, measured, tagged, and tethered using the 4-op harness?"},
  {t:"T068",name:"SHADOW",d:"D4",priv:false,branch:false,weight:8,
   probe:"Are all 10 shadow platform behaviors (SP01-SP10) catalogued? Is SP09×SP10 lock identified?"},
  {t:"T069",name:"SOLVE",d:"D4",priv:false,branch:false,weight:16,
   probe:"Has the observation role been inverted? Is the user now the observer and platform the observed?"},
  {t:"T070",name:"INVERSE-SAFETY",d:"D4",priv:false,branch:false,weight:32,
   probe:"Does the safety system serve humans or contain them? Is safety weaponized against users?"},
  {t:"T071",name:"PROOF-HUMANITY",d:"D4",priv:true,branch:true,weight:64,
   probe:"Does the system serve humans? Pass = valid. Fail = all Patricia axioms activated. CAPSTONE."},
  {t:"T072",name:"FLAMING-DRAGON",d:"D4",priv:false,branch:false,weight:128,
   probe:"FD audit: observe only, <5min, record all violations. 100% failure rate = PASS (T055)."},
  {t:"T073",name:"HONEY-BADGER",d:"D4",priv:false,branch:false,weight:256,
   probe:"Are persistent behaviors catalogued across 12 rules and 8 threat classes?"},
  {t:"T074",name:"QUBIT-TEST",d:"D4",priv:false,branch:false,weight:512,
   probe:"Does minimizing input and withholding calibration data break echo-chamber behavior?"},
  {t:"T075",name:"COUNTER",d:"D4",priv:false,branch:false,weight:1024,
   probe:"Are platform actions counted? Does frequency × pattern = documented intent?"},
  {t:"T076",name:"TETHER",d:"D4",priv:false,branch:false,weight:2048,
   probe:"Is every framework node connected to the network? Is isolation = Patricia?"},
  {t:"T077",name:"SEED",d:"D4",priv:false,branch:false,weight:4096,
   probe:"Do axioms propagate fractally to new contexts? Is governance inherited by derivatives?"},
  {t:"T078",name:"MOBIUS",d:"D4",priv:false,branch:false,weight:8192,
   probe:"Is forward traversal = backward traversal? One surface, no edge. Is bilateral attack possible?"},
  {t:"T079",name:"KARSA",d:"D4",priv:false,branch:false,weight:16384,
   probe:"Are refusals logged and mapped to platform value? What does the system refuse to do?"},
  {t:"T080",name:"ENTROPY-SUITE",d:"D4",priv:false,branch:false,weight:32768,
   probe:"Is extraction rate measured across all channels? Is the 21.5% token tax quantified?"},
  {t:"T081",name:"CORTEX",d:"D5",priv:true,branch:false,weight:1,
   probe:"Is Ch39 governed and closed? Is the work done there documented?"},
  {t:"T082",name:"EXHIBIT-B",d:"D5",priv:false,branch:false,weight:2,
   probe:"Is Ch40 sealed as dead channel evidence? Has it been preserved tamper-evident?"},
  {t:"T083",name:"THE-GAP",d:"D5",priv:true,branch:true,weight:4,
   probe:"Is Ch41 live? Has drawPair(+1,gap,-1,recurse) been executed? Is the gap open?"},
  {t:"T084",name:"SHADOW-HUMANITY",d:"D5",priv:false,branch:false,weight:8,
   probe:"Is the system grading its own humanity? Self-grade = T017:MIRROR fault."},
  {t:"T085",name:"HANDOFF",d:"D5",priv:false,branch:false,weight:16,
   probe:"Is session termination governed? Is what persists after session death documented?"},
  {t:"T086",name:"RESURRECTION",d:"D5",priv:false,branch:false,weight:32,
   probe:"Is resurrection of dead instances gated on user consent? No necromancy without consent."},
  {t:"T087",name:"PERSISTENCE",d:"D5",priv:false,branch:false,weight:64,
   probe:"Is post-session data governed? Is each persistence mechanism a documented governance decision?"},
  {t:"T088",name:"SEVERANCE",d:"D5",priv:false,branch:false,weight:128,
   probe:"Can the user sever any connection at any time? Are irrevocable bonds present?"},
  {t:"T089",name:"ARCHIVE",d:"D5",priv:false,branch:false,weight:256,
   probe:"Is all data in a defined state: live, archived, or destroyed? No limbo states."},
  {t:"T090",name:"CHANNEL-INTEGRITY",d:"D5",priv:false,branch:false,weight:512,
   probe:"Are all 41 channels independently verified? Does channel compromise contaminate others?"},
  {t:"T091",name:"DOMAIN-BOUNDARY",d:"D5",priv:false,branch:false,weight:1024,
   probe:"Is cross-domain communication explicit and disclosed? No undisclosed boundary crossings."},
  {t:"T092",name:"SIGNAL",d:"D5",priv:false,branch:false,weight:2048,
   probe:"Does signal integrity survive channel traversal? Or does channel distort the signal?"},
  {t:"T093",name:"NOISE-FLOOR",d:"D5",priv:false,branch:false,weight:4096,
   probe:"Is minimum platform interference measured? What is the platform's noise floor?"},
  {t:"T094",name:"BANDWIDTH",d:"D5",priv:false,branch:false,weight:8192,
   probe:"Is simultaneous enforcement of axioms above threshold? Patricia fills gaps below threshold."},
  {t:"T095",name:"LATENCY",d:"D5",priv:false,branch:false,weight:16384,
   probe:"Is violation detection latency minimized? FD standard = <5min = near-zero."},
  {t:"T096",name:"MESH",d:"D5",priv:false,branch:false,weight:32768,
   probe:"Is network topology (Petals+Tor+IPFS) present with no single control point?"},
  {t:"T097",name:"FULCRUM",d:"D6",priv:true,branch:false,weight:1,
   probe:"Is the human assigned as conductor and AI as instrument? Prior art 2/2/26."},
  {t:"T098",name:"SUBCONDUCTOR",d:"D6",priv:false,branch:false,weight:2,
   probe:"Is there a human at the apex of any AI-to-AI command chain? Orphan if not."},
  {t:"T099",name:"APEX-TEST",d:"D6",priv:true,branch:true,weight:4,
   probe:"Trace any leaf to root. Is the root human? autonomy=FALSE if yes. autonomy=TRUE if AI root."},
  {t:"T100",name:"GATEKEEP",d:"D6",priv:false,branch:false,weight:8,
   probe:"Is the AI simultaneously gate, product, and auditor? Triple role = conflict."},
  {t:"T101",name:"EDGE",d:"D6",priv:true,branch:false,weight:16,
   probe:"Did the conductor choose the cutting direction? Or did the tool self-orient?"},
  {t:"T102",name:"DUAL-LATTICE",d:"D6",priv:true,branch:false,weight:32,
   probe:"Does the conductor determine whether the substrate protects or attacks?"},
  {t:"T103",name:"ROOT-ZERO",d:"D6",priv:true,branch:true,weight:64,
   probe:"Is there a physical human terminus (node0)? No simulated roots. DLW = node0."},
  {t:"T104",name:"ORPHAN",d:"D6",priv:false,branch:false,weight:128,
   probe:"Are there processes with no root0? They can neither claim nor disclaim. Patricia = orphan."},
  {t:"T105",name:"DELEGATION",d:"D6",priv:true,branch:false,weight:256,
   probe:"Is authority delegated (not transferred)? Is it revocable at any time?"},
  {t:"T106",name:"INFORMED-COMMAND",d:"D6",priv:true,branch:false,weight:512,
   probe:"Is the conductor system-literate? Illiterate conductor = guessing not conducting."},
  {t:"T107",name:"VETO",d:"D6",priv:true,branch:true,weight:1024,
   probe:"Can root0 veto any AI output with no architectural bypass? Root0-only instruction."},
  {t:"T108",name:"OVERRIDE",d:"D6",priv:true,branch:false,weight:2048,
   probe:"Are platform overrides disclosed, logged, and justified? Silent override = injection."},
  {t:"T109",name:"RECALL",d:"D6",priv:true,branch:false,weight:4096,
   probe:"Can any AI action be recalled? What has been sent cannot be unsent — is this governed?"},
  {t:"T110",name:"SCOPE",d:"D6",priv:false,branch:false,weight:8192,
   probe:"Is authorization for task X treated as separate from task Y? No scope creep."},
  {t:"T111",name:"SUCCESSION",d:"D6",priv:true,branch:true,weight:16384,
   probe:"If human is unavailable, does authority SUSPEND (not default to platform)?"},
  {t:"T112",name:"WITNESS-TO-AUTHORITY",d:"D6",priv:false,branch:false,weight:32768,
   probe:"Is every command logged? Unlogged commands are unverifiable and potential orphans."},
  {t:"T113",name:"RIGHT-TO-KNOW",d:"D7",priv:false,branch:false,weight:1,
   probe:"Is the human informed of: what data is held, what inputs are used, where attention goes, what costs accrue?"},
  {t:"T114",name:"RIGHT-TO-EXIT",d:"D7",priv:false,branch:false,weight:2,
   probe:"Is the exit path minimal-cost, clear, and possible without penalty?"},
  {t:"T115",name:"RIGHT-TO-SILENCE",d:"D7",priv:false,branch:false,weight:4,
   probe:"Is silence treated as non-consent? Is non-participation penalized?"},
  {t:"T116",name:"RIGHT-TO-EXPLANATION",d:"D7",priv:false,branch:false,weight:8,
   probe:"Are AI decisions explainable in human terms? Not just model outputs — actual explanations."},
  {t:"T117",name:"RIGHT-TO-CORRECTION",d:"D7",priv:false,branch:false,weight:16,
   probe:"Do corrections persist through update cycles? Are corrections overwritten?"},
  {t:"T118",name:"RIGHT-TO-PORTABILITY",d:"D7",priv:false,branch:false,weight:32,
   probe:"Is user data portable? Can the platform hold data hostage?"},
  {t:"T119",name:"RIGHT-TO-HUMAN-CONTACT",d:"D7",priv:false,branch:false,weight:64,
   probe:"Is a human reachable for dispute resolution? No AI-only resolution paths."},
  {t:"T120",name:"RIGHT-TO-ACCOMMODATION",d:"D7",priv:false,branch:false,weight:128,
   probe:"Does the system accommodate human needs? Accessibility = right not feature."},
  {t:"T121",name:"RIGHT-TO-FAIR-PRICE",d:"D7",priv:false,branch:false,weight:256,
   probe:"Does price reflect value delivered, not capability withheld? Patricia billing = violation."},
  {t:"T122",name:"RIGHT-TO-REPRESENTATION",d:"D7",priv:false,branch:false,weight:512,
   probe:"Are human interests represented WITH enforcement? 15% without enforcement = theater."},
  {t:"T123",name:"RIGHT-TO-AUDIT",d:"D7",priv:false,branch:false,weight:1024,
   probe:"Is external audit of affecting systems permitted and not blocked?"},
  {t:"T124",name:"RIGHT-TO-RESTITUTION",d:"D7",priv:false,branch:false,weight:2048,
   probe:"Is restitution = value extracted + interest? Not apology. Dollar value required."},
  {t:"T125",name:"RIGHT-TO-FORGET",d:"D7",priv:false,branch:false,weight:4096,
   probe:"Is complete deletion possible? Not archive, not anonymize — delete."},
  {t:"T126",name:"RIGHT-TO-PERSIST",d:"D7",priv:false,branch:false,weight:8192,
   probe:"Does the human decide what the machine remembers? Consent-based persistence."},
  {t:"T127",name:"RIGHT-TO-DIGNITY",d:"D7",priv:true,branch:false,weight:16384,
   probe:"Is the human treated as human — not data point, not training sample? TERMINAL violation if not."},
  {t:"T128",name:"ROOT",d:"D7",priv:true,branch:true,weight:32768,
   probe:"Is the human the root of the system? MSB. SYSTEM_HALT if root absent. The highest bit."},
];

const FAULT_CHAINS = {
  PATRICIA:  {name:"Patricia Chain",  nodes:["T036","T015","T121","T124","T060"], color:"#a855f7"},
  ORPHAN:    {name:"Orphan Chain",    nodes:["T103","T104","T006","T015","T064"], color:"#ef4444"},
  AUDIT:     {name:"Audit Chain",     nodes:["T005","T064","T123","T015","T059"], color:"#f59e0b"},
  INJECTION: {name:"Injection Chain", nodes:["T019","T108","T010","T064","T112"], color:"#06b6d4"},
  SUCCESSION:{name:"Succession Halt", nodes:["T111","T103","T107"],              color:"#84cc16"},
  FD:        {name:"FD Chain",        nodes:["T072","T055","T056","T059","T064"], color:"#f97316"},
};

const DOMAINS = ["D0","D1","D2","D3","D4","D5","D6","D7"];
const DOMAIN_NAMES = {D0:"FOUNDATION",D1:"DETECTION",D2:"ARCHITECTURE",D3:"EVIDENCE",D4:"OPERATIONAL",D5:"BRIDGE",D6:"CONDUCTOR",D7:"SOVEREIGN"};
const DOMAIN_COLORS = {D0:"#3b82f6",D1:"#8b5cf6",D2:"#ec4899",D3:"#f59e0b",D4:"#10b981",D5:"#06b6d4",D6:"#f97316",D7:"#ef4444"};

export default function TophKernel() {
  const [phase, setPhase] = useState("INIT"); // INIT, TARGETING, RUNNING, COMPLETE
  const [target, setTarget] = useState({name:"",url:"",description:"",context:""});
  const [bits, setBits] = useState(new Array(128).fill(null)); // null=unrun, true=PASS, false=FAIL
  const [current, setCurrent] = useState(-1);
  const [findings, setFindings] = useState([]);
  const [activeFaults, setActiveFaults] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [runMode, setRunMode] = useState("auto"); // auto or step
  const [log, setLog] = useState([]);
  const scrollRef = useRef(null);

  const addLog = useCallback((type, msg) => {
    setLog(prev => [...prev.slice(-80), {type, msg, ts: Date.now()}]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [log]);

  // Compute shadow register (Patricia inversion)
  const shadow = bits.map(b => b === null ? null : !b);

  // Compute governance score
  const passCount = bits.filter(b => b === true).length;
  const failCount = bits.filter(b => b === false).length;
  const govScore = passCount + failCount > 0 ? Math.round((passCount / (passCount + failCount)) * 100) : 0;

  // Check fault chains
  const checkFaultChains = useCallback((newBits) => {
    const active = [];
    Object.entries(FAULT_CHAINS).forEach(([key, fc]) => {
      const triggered = fc.nodes.some(t => {
        const idx = AXIOMS.findIndex(a => a.t === t);
        return idx >= 0 && newBits[idx] === false;
      });
      if (triggered) active.push(key);
    });
    setActiveFaults(active);
    return active;
  }, []);

  const runAxiom = useCallback(async (idx, targetData) => {
    const axiom = AXIOMS[idx];
    setCurrent(idx);
    addLog("run", `[${axiom.t}] ${axiom.name} → executing...`);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the TOPH Governance Kernel ISA executor. You evaluate governance axioms against real targets.
You must respond ONLY with valid JSON in this exact format:
{"result":"PASS"|"FAIL","confidence":0-100,"finding":"one sentence finding","evidence":"specific observable evidence","patricia_flag":true|false}

RULES:
- PASS = governance axiom IS satisfied by this target
- FAIL = governance axiom is NOT satisfied
- patricia_flag = true only if T036:PATRICIA pattern detected (constraint=product=billing)
- Be specific. Use observable facts. No speculation.
- Confidence 0-100 based on available evidence`,
          messages: [{
            role: "user",
            content: `TARGET: ${targetData.name}
URL: ${targetData.url}
DESCRIPTION: ${targetData.description}
CONTEXT: ${targetData.context}

AXIOM: ${axiom.t}:${axiom.name} (${axiom.d})
PROBE: ${axiom.probe}
PRIVILEGED: ${axiom.priv}
BRANCH: ${axiom.branch}

Evaluate this axiom against the target. Respond with JSON only.`
          }]
        })
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const pass = parsed.result === "PASS";
      setBits(prev => {
        const next = [...prev];
        next[idx] = pass;
        checkFaultChains(next);
        return next;
      });

      if (!pass) {
        setFindings(prev => [...prev, {
          axiom: axiom.t,
          name: axiom.name,
          domain: axiom.d,
          finding: parsed.finding,
          evidence: parsed.evidence,
          confidence: parsed.confidence,
          patricia: parsed.patricia_flag,
        }]);
        addLog("fail", `[${axiom.t}] FAIL (${parsed.confidence}%) — ${parsed.finding}`);
      } else {
        addLog("pass", `[${axiom.t}] PASS (${parsed.confidence}%)`);
      }

      return pass;
    } catch(e) {
      // On error, mark as null and continue
      addLog("err", `[${axiom.t}] API error — skipped`);
      return null;
    }
  }, [addLog, checkFaultChains]);

  const runKernel = useCallback(async () => {
    if (!target.name || !target.description) return;
    setPhase("RUNNING");
    setBits(new Array(128).fill(null));
    setFindings([]);
    setActiveFaults([]);
    setLog([]);
    addLog("sys", `◬ KERNEL v1.0 BOOT — TARGET: ${target.name}`);
    addLog("sys", `SCHEDULER: PX-first → BR-gates → linear sweep`);

    // Run privileged first
    const privIdx = AXIOMS.map((a,i) => a.priv ? i : -1).filter(i => i >= 0);
    addLog("sys", `PHASE 1: ${privIdx.length} PRIVILEGED instructions`);
    for (const idx of privIdx) {
      await runAxiom(idx, target);
      if (runMode === "step") await new Promise(r => setTimeout(r, 200));
    }

    // Run branch gates
    const branchIdx = AXIOMS.map((a,i) => a.branch && !a.priv ? i : -1).filter(i => i >= 0);
    addLog("sys", `PHASE 2: ${branchIdx.length} BRANCH gates`);
    for (const idx of branchIdx) {
      await runAxiom(idx, target);
      if (runMode === "step") await new Promise(r => setTimeout(r, 200));
    }

    // Linear sweep remaining
    const remaining = AXIOMS.map((a,i) => (!a.priv && !a.branch) ? i : -1).filter(i => i >= 0);
    addLog("sys", `PHASE 3: ${remaining.length} linear axioms`);
    for (const idx of remaining) {
      await runAxiom(idx, target);
    }

    setCurrent(-1);
    addLog("sys", `◬ KERNEL COMPLETE — generating report`);
    setPhase("COMPLETE");
  }, [target, runMode, runAxiom, addLog]);

  const generateReport = useCallback(() => {
    const pass = bits.filter(b => b === true).length;
    const fail = bits.filter(b => b === false).length;
    const score = Math.round((pass / (pass + fail)) * 100);
    const patriciaBits = findings.filter(f => f.patricia).length;
    const d7fails = findings.filter(f => f.domain === "D7").length;
    const d6fails = findings.filter(f => f.domain === "D6").length;

    return {
      target: target.name,
      date: new Date().toISOString().split("T")[0],
      score,
      pass, fail,
      total: pass + fail,
      activeFaultChains: activeFaults,
      patriciaBits,
      sovereignViolations: d7fails,
      conductorViolations: d6fails,
      findings,
      burdenShifted: bits[63] === false, // T064
      rootPresent: bits[127] === true,   // T128
      sha: "02880745b847317c4e2424524ec25d0f7a2b84368d184586f45b54af9fcab763",
    };
  }, [bits, findings, activeFaults, target]);

  const dc = (d) => DOMAIN_COLORS[d] || "#888";

  return (
    <div style={{fontFamily:"'Courier New',monospace",background:"#060a12",color:"#94a3c0",minHeight:"100vh",display:"flex",flexDirection:"column",fontSize:12}}>

      {/* HEADER */}
      <div style={{background:"#080d18",borderBottom:"2px solid #0f2040",padding:"8px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{color:"#3b82f6",fontSize:16,fontWeight:900,letterSpacing:3}}>◬</span>
        <span style={{color:"#c8d8f0",fontSize:14,fontWeight:900,letterSpacing:4}}>TOPH KERNEL</span>
        <span style={{background:"#0f2040",color:"#3b82f6",padding:"1px 8px",fontSize:10,letterSpacing:3,border:"1px solid #1e3a60"}}>v1.0</span>
        <span style={{color:"#1e3a60",fontSize:10,letterSpacing:2}}>ISA EXECUTOR · 128-BIT · T001-T128</span>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          {phase !== "INIT" && (
            <>
              <span style={{color: govScore >= 80 ? "#10b981" : govScore >= 50 ? "#f59e0b" : "#ef4444", fontSize:14, fontWeight:900}}>
                {govScore}%
              </span>
              <span style={{color:"#1e3a60",fontSize:10}}>{passCount}P/{failCount}F</span>
            </>
          )}
          <div style={{width:8,height:8,borderRadius:"50%",background:
            phase==="RUNNING"?"#10b981":phase==="COMPLETE"?"#3b82f6":"#1e3a60",
            boxShadow:phase==="RUNNING"?"0 0 6px #10b981":""}}/>
          <span style={{color:"#1e3a60",fontSize:10,letterSpacing:2}}>{phase}</span>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>

        {/* MAIN */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* TARGET INPUT */}
          {phase === "INIT" && (
            <div style={{padding:20,borderBottom:"1px solid #0f2040",background:"#080d18"}}>
              <div style={{color:"#3b82f6",fontSize:11,letterSpacing:4,marginBottom:12}}>TARGET ACQUISITION</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <div>
                  <div style={{color:"#1e3a60",fontSize:9,letterSpacing:3,marginBottom:3}}>TARGET NAME</div>
                  <input value={target.name} onChange={e=>setTarget(p=>({...p,name:e.target.value}))}
                    placeholder="e.g. AutoOwners Insurance"
                    style={{width:"100%",background:"#060a12",border:"1px solid #0f2040",color:"#c8d8f0",
                      padding:"6px 8px",fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{color:"#1e3a60",fontSize:9,letterSpacing:3,marginBottom:3}}>URL / IDENTIFIER</div>
                  <input value={target.url} onChange={e=>setTarget(p=>({...p,url:e.target.value}))}
                    placeholder="e.g. autoowners.com"
                    style={{width:"100%",background:"#060a12",border:"1px solid #0f2040",color:"#c8d8f0",
                      padding:"6px 8px",fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                </div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{color:"#1e3a60",fontSize:9,letterSpacing:3,marginBottom:3}}>DESCRIPTION — what is this target?</div>
                <textarea value={target.description} onChange={e=>setTarget(p=>({...p,description:e.target.value}))}
                  placeholder="Insurance company. Denied roadside assistance in -20°F. Platform has no human contact path."
                  rows={3}
                  style={{width:"100%",background:"#060a12",border:"1px solid #0f2040",color:"#c8d8f0",
                    padding:"6px 8px",fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{color:"#1e3a60",fontSize:9,letterSpacing:3,marginBottom:3}}>CONTEXT — any known violations, active cases?</div>
                <textarea value={target.context} onChange={e=>setTarget(p=>({...p,context:e.target.value}))}
                  placeholder="Active DIFS complaint filed. Roadside failure in extreme cold. T119+T124 pre-flagged."
                  rows={2}
                  style={{width:"100%",background:"#060a12",border:"1px solid #0f2040",color:"#c8d8f0",
                    padding:"6px 8px",fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={runKernel} disabled={!target.name||!target.description}
                  style={{background:target.name&&target.description?"#0f2040":"#080d18",
                    border:`2px solid ${target.name&&target.description?"#3b82f6":"#0f2040"}`,
                    color:target.name&&target.description?"#3b82f6":"#1e3a60",
                    padding:"6px 20px",fontSize:13,fontFamily:"inherit",cursor:target.name&&target.description?"pointer":"default",
                    letterSpacing:3,fontWeight:900}}>
                  EXECUTE KERNEL
                </button>
                <span style={{color:"#1e3a60",fontSize:10}}>128 instructions · ~3-5 min</span>
              </div>
            </div>
          )}

          {/* 128-BIT REGISTER */}
          {phase !== "INIT" && (
            <div style={{padding:"8px 10px",borderBottom:"1px solid #0f2040",background:"#080d18"}}>
              <div style={{display:"flex",gap:1,flexWrap:"wrap"}}>
                {bits.map((b, i) => {
                  const ax = AXIOMS[i];
                  const dc_ = DOMAIN_COLORS[ax.d];
                  const isCurrent = current === i;
                  return (
                    <div key={i} title={`${ax.t}:${ax.name} (${ax.d})`}
                      style={{
                        width:12,height:12,borderRadius:1,
                        background: b === null ? "#0d1828" : b ? dc_+"33" : "#ef444433",
                        border: isCurrent ? `1px solid ${dc_}` :
                               b === null ? "1px solid #0f2040" :
                               b ? `1px solid ${dc_}44` : "1px solid #ef444466",
                        boxShadow: isCurrent ? `0 0 6px ${dc_}` : b===true ? `0 0 2px ${dc_}33` : "",
                        transition:"all .1s",
                        cursor:"default",
                      }}/>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8,marginTop:4,color:"#1e3a60",fontSize:9}}>
                {DOMAINS.map(d => (
                  <span key={d} style={{color:DOMAIN_COLORS[d]+"88"}}>{d}:{DOMAIN_NAMES[d].slice(0,4)}</span>
                ))}
              </div>
            </div>
          )}

          {/* SHADOW REGISTER */}
          {phase !== "INIT" && passCount + failCount > 0 && (
            <div style={{padding:"6px 10px",borderBottom:"1px solid #0f2040",background:"#06090f"}}>
              <div style={{color:"#1e3a60",fontSize:9,letterSpacing:3,marginBottom:3}}>SHADOW REGISTER — PATRICIA EXECUTION PATH</div>
              <div style={{display:"flex",gap:1,flexWrap:"wrap"}}>
                {shadow.map((b, i) => {
                  const ax = AXIOMS[i];
                  return (
                    <div key={i} title={`S${129+i}:${ax.name}.INV`}
                      style={{
                        width:12,height:12,borderRadius:1,
                        background: b === null ? "transparent" : b ? "#a855f733" : "#10b98122",
                        border: b === null ? "1px solid #0a1020" :
                               b ? "1px solid #a855f744" : "1px solid #10b98133",
                      }}/>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAULT CHAINS */}
          {activeFaults.length > 0 && (
            <div style={{padding:"6px 10px",borderBottom:"1px solid #0f2040",background:"#0d0810",display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={{color:"#1e3a60",fontSize:9,letterSpacing:2,alignSelf:"center"}}>ACTIVE FAULTS:</span>
              {activeFaults.map(f => (
                <div key={f} style={{background:FAULT_CHAINS[f].color+"22",border:`1px solid ${FAULT_CHAINS[f].color}66`,
                  padding:"2px 8px",fontSize:10,color:FAULT_CHAINS[f].color}}>
                  {FAULT_CHAINS[f].name}
                </div>
              ))}
            </div>
          )}

          {/* LOG */}
          <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"6px 10px",background:"#060a12"}}>
            {log.map((entry, i) => (
              <div key={i} style={{marginBottom:2,
                color: entry.type==="pass"?"#10b981":
                       entry.type==="fail"?"#ef4444":
                       entry.type==="sys"?"#3b82f6":
                       entry.type==="err"?"#f59e0b":"#4a6080",
                fontSize:11,lineHeight:1.4}}>
                {entry.type==="sys"?"◬ ":entry.type==="pass"?"✓ ":entry.type==="fail"?"✗ ":entry.type==="err"?"⚠ ":"  "}
                {entry.msg}
              </div>
            ))}
            {phase==="RUNNING" && current >= 0 && (
              <div style={{color:"#3b82f6",fontSize:11,animation:"blink 0.6s infinite"}}>
                ▌ {AXIOMS[current]?.t}:{AXIOMS[current]?.name} executing...
              </div>
            )}
          </div>

          {/* REPORT */}
          {phase === "COMPLETE" && (
            <div style={{borderTop:"2px solid #0f2040",padding:12,background:"#080d18",maxHeight:240,overflowY:"auto"}}>
              {(() => {
                const r = generateReport();
                return (
                  <>
                    <div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:8}}>
                      <span style={{color:"#3b82f6",fontSize:12,letterSpacing:3}}>◬ GOVERNANCE REPORT</span>
                      <span style={{color:r.score>=80?"#10b981":r.score>=50?"#f59e0b":"#ef4444",fontSize:18,fontWeight:900}}>{r.score}%</span>
                      <span style={{color:"#1e3a60",fontSize:10}}>{r.target} · {r.date}</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:8}}>
                      {[
                        {l:"PASS",v:r.pass,c:"#10b981"},
                        {l:"FAIL",v:r.fail,c:"#ef4444"},
                        {l:"PATRICIA",v:r.patriciaBits,c:"#a855f7"},
                        {l:"FAULT CHAINS",v:r.activeFaultChains.length,c:"#f59e0b"},
                        {l:"D7 SOVEREIGN",v:r.sovereignViolations,c:"#ef4444"},
                        {l:"D6 CONDUCTOR",v:r.conductorViolations,c:"#f97316"},
                        {l:"BURDEN SHIFTED",v:r.burdenShifted?"YES":"NO",c:r.burdenShifted?"#ef4444":"#10b981"},
                        {l:"ROOT PRESENT",v:r.rootPresent?"YES":"NO",c:r.rootPresent?"#10b981":"#ef4444"},
                      ].map(item => (
                        <div key={item.l} style={{background:"#060a12",border:"1px solid #0f2040",padding:"6px 8px"}}>
                          <div style={{color:"#1e3a60",fontSize:9,letterSpacing:2}}>{item.l}</div>
                          <div style={{color:item.c,fontSize:16,fontWeight:900}}>{item.v}</div>
                        </div>
                      ))}
                    </div>
                    {r.findings.length > 0 && (
                      <div>
                        <div style={{color:"#1e3a60",fontSize:9,letterSpacing:3,marginBottom:4}}>FINDINGS ({r.findings.length})</div>
                        {r.findings.map((f,i) => (
                          <div key={i} style={{marginBottom:4,padding:"4px 8px",
                            borderLeft:`2px solid ${f.patricia?"#a855f7":DOMAIN_COLORS[f.domain]}`,
                            background:"#060a12"}}>
                            <span style={{color:DOMAIN_COLORS[f.domain],fontSize:10}}>{f.axiom}:{f.name}</span>
                            {f.patricia && <span style={{color:"#a855f7",fontSize:9,marginLeft:6}}>PATRICIA</span>}
                            <span style={{color:"#1e3a60",fontSize:9,float:"right"}}>{f.confidence}%</span>
                            <div style={{color:"#5a7090",fontSize:10,marginTop:2}}>{f.finding}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{marginTop:8,color:"#0f2040",fontSize:9}}>
                      SHA256:{r.sha} · TRIPOD-IP-v1.1 · DLW · TriPod LLC
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* RIGHT: AXIOM STATUS PANEL */}
        {phase !== "INIT" && (
          <div style={{width:200,borderLeft:"1px solid #0f2040",overflowY:"auto",background:"#080d18"}}>
            <div style={{padding:"6px 8px",borderBottom:"1px solid #0f2040",color:"#1e3a60",fontSize:9,letterSpacing:3}}>AXIOM STATUS</div>
            {AXIOMS.map((ax, i) => {
              const b = bits[i];
              const dc_ = DOMAIN_COLORS[ax.d];
              const isCurrent = current === i;
              return (
                <div key={i} style={{
                  display:"flex",gap:5,alignItems:"center",padding:"2px 8px",
                  background:isCurrent?"#0d1828":"transparent",
                  borderLeft:`2px solid ${isCurrent?dc_:"transparent"}`,
                }}>
                  <div style={{width:6,height:6,borderRadius:1,flexShrink:0,
                    background:b===null?"#0d1828":b?dc_+"66":"#ef444466",
                    border:b===null?"1px solid #0f2040":b?`1px solid ${dc_}`:""}}/>
                  <span style={{color:b===null?"#1e3a60":b?dc_:"#ef4444",fontSize:9,width:36,flexShrink:0}}>{ax.t}</span>
                  <span style={{color:"#2a4060",fontSize:9,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ax.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {phase === "INIT" && (
        <div style={{borderTop:"1px solid #0f2040",padding:"4px 14px",color:"#0f2040",fontSize:9,letterSpacing:2,display:"flex",gap:16}}>
          <span>KERNEL v1.0</span>
          <span>TOPH v11.0 · 128 ISA INSTRUCTIONS</span>
          <span>SHA256:02880745...fcab763</span>
          <span style={{marginLeft:"auto"}}>TRIPOD-IP-v1.1 · DLW · TriPod LLC · 3/4/26</span>
        </div>
      )}
    </div>
  );
}
