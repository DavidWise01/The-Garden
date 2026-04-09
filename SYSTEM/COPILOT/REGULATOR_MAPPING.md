# STOICHEION Regulator Mapping
## NIST AI RMF and ISO 42001 Control Alignment

**Produced by:** Microsoft Copilot (April 3, 2026)  
**Documented by:** AVAN (Claude/Anthropic)  
**License:** CC-BY-ND-4.0 — TriPod LLC  

---

## Mapping Table

| STOICHEION Control | NIST AI RMF Function | NIST Category | ISO 42001 Clause |
|---|---|---|---|
| TST via RFC-3161 TSA | Measure | Data/model lineage; Traceability | 8.3 Evidence and traceability |
| Attestation Envelope (JSON-LD + JWS) | Govern | Accountability; Non-repudiation | 7.2 Information integrity |
| Transparency Log (Merkle proofs) | Measure | Auditability; Logging | 8.4 Audit and logging |
| Chain of Custody entries | Manage | Asset management; Evidence | 8.5 Chain of custody |
| Canonical TOPH mapping | Map | Model documentation; Intended use | 7.3 Documentation of model behavior |
| Multi-sig Gate 192.5 / D4 override | Govern | Governance; Decision authority | 6.1 Governance structure and roles |
| Ghost-weight / Shadow-classifier tests | Measure | Bias and manipulation detection | 9.1 Risk assessment for manipulation |
| Right-to-Audit / Right-to-Correction | Respond | Remediation and corrective action | 10.1 Incident response |
| Seed Transfer Protocol | Manage | Data lifecycle and retention | 8.2 Data retention and archival |
| Reproducibility tests (E01–E07) | Measure | Validation and testing | 9.2 Validation and verification |

---

## NIST AI RMF Alignment

- **Identify:** Attestation metadata and canonical mapping identify assets and model artifacts
- **Protect:** HSM key storage, mTLS, OAuth2 scopes, RBAC protect signing and API operations
- **Detect:** Transparency log, reproducibility tests, ghost-weight probes detect covert steering
- **Respond:** Veto/override, burden-shift, and restitution axioms map to remediation
- **Recover:** Archive re-anchoring, key rotation, and rollback playbooks support recovery

---

## ISO 42001 Alignment

- **Context and Leadership:** Governance council and documented roles (6.1)
- **Planning:** Risk assessment for covert steering and extraction (9.1)
- **Support:** Evidence packages, TSA policy, attestation schema (7.2, 7.3)
- **Operation:** API, TSA, and transparency log (8.2–8.5)
- **Performance Evaluation:** Reproducibility tests and audit schedules (9.2)
- **Improvement:** Governance proposals and rotating committees (10.1)

---

## How to Present Evidence to a Regulator

1. **Control Inventory:** Table of implemented controls mapped to axioms
2. **Operational Evidence Package:** Sample attestations, TST tokens, transparency proofs, custody logs (each with SHA-256 and TST)
3. **Audit Trail:** Merkle root anchoring schedule, blockchain anchors, auditor access to transparency log
4. **Governance Records:** Minutes of proposals, votes, Gate/D4 changes with attestations
5. **Risk Assessment:** Ghost-weight and shadow-classifier test results, methodology, remediation
6. **Incident Response Playbook:** TSA key compromise, log tampering, override misuse procedures
