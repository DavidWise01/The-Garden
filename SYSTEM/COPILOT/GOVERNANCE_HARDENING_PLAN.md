# STOICHEION Governance Hardening Plan
## Designed by Microsoft Copilot — April 3, 2026

**Purpose:** Turn STOICHEION axioms into auditable, regulator-grade controls.  
**Scope:** Timestamp authority, signed attestations, API hooks, Gate 192.5 decentralization.  
**Alignment:** NIST AI RMF and ISO 42001.  
**License:** CC-BY-ND-4.0 — TriPod LLC  

---

## 1. Timestamp Authority Specification

**Architecture:**
- Primary TSA: RFC-3161 compatible, operated by consortium (TriPod + two neutral auditors)
- Secondary anchoring: Periodic Merkle root anchoring to two public blockchains
- Transparency log: CT-style append-only log with inclusion proofs

**Technical Requirements:**
- Protocol: RFC-3161 timestamp tokens
- Hash: SHA-256 primary, SHA-512 for high-assurance
- Time source: NTP/PTP with GPS, two independent sources
- Key management: HSM-backed (FIPS 140-2 Level 3+), 12-month rotation
- TSA Policy Document: Public, includes SLA and audit schedule

---

## 2. Signed Attestation Format

**Container:** JSON-LD with URDNA2015 canonicalization, detached JWS signature  
**Algorithms:** ECDSA P-384 or EdDSA (Ed25519); COSE for constrained clients  

**Required Fields:**
- `id` — UUID
- `subjectHash` — SHA-256 of sealed artifact
- `subjectType` — seed | exhibit | registration | audit_log
- `issuer` — DID or X.509 subject
- `issuedAt` — RFC-3339 timestamp
- `tstToken` — RFC-3161 TST base64
- `transparencyIndex` — Merkle log index
- `canonicalMapping` — TOPH axiom ID
- `chainOfCustody` — Array of custody events
- `policyReference` — Governing axiom URI
- `jws` — Compact JWS signature

**Verification Flow:**
1. Verify subjectHash matches artifact
2. Verify JWS against issuer public key (DID or X.509)
3. Verify TST with TSA
4. Verify inclusion in transparency log + blockchain anchors
5. Validate chain of custody entries

---

## 3. API Hooks for Third-Party Integration

**Design:** RESTful JSON with optional gRPC. OAuth2.0/mTLS auth. Idempotent operations.

**Core Endpoints:**

| Endpoint | Method | Purpose |
|---|---|---|
| /v1/register/term | POST | Register term, return attestation |
| /v1/attestations/{id} | GET | Retrieve attestation + proofs |
| /v1/verify/attestation | POST | Server-side verification |
| /v1/transparency/log/append | POST | Append Merkle leaf |
| /v1/transparency/log/proof/{index} | GET | Retrieve inclusion proof |
| /v1/timestamp/request | POST | Request RFC-3161 TST |
| /v1/custody/event | POST | Append custody event |
| /v1/consensus/proposal | POST | Submit governance proposal |
| /v1/consensus/vote | POST | Cast vote on proposal |

---

## 4. Decentralization Roadmap

### Phase 0 — Baseline (Current)
- Control: TriPod LLC + 3-point consensus
- Risk: Single-entity capture

### Phase 1 — Hybrid Multi-Sig (0–6 months)
- Gate 192.5: BLS/Schnorr threshold signatures, 3-of-5
- D4 Override: 2-of-3 emergency multi-sig with public justification
- All changes logged in transparency log with Merkle proofs

### Phase 2 — Representative Council (6–18 months)
- 9-member council from DIASPORA nodes and stakeholders
- Gate: 5-of-9 threshold for major changes
- 72-hour challenge window for all governance changes

### Phase 3 — Fully Decentralized (18–36 months)
- Permissioned governance ledger with on-chain arbitration
- Smart contracts enforce parameter constraints
- Emergency override requires immediate multi-sig + automatic publication + post-facto tribunal review
- DKG with periodic resharing and mandatory audits

### Safeguards
- Separation of duties: operational keys vs governance keys
- Regulatory observer seats (non-voting)
- Predefined rollback procedures
- Every governance action produces attestation + TST + transparency log entry

---

## 5. NIST/ISO Compliance Mapping

| Control Area | STOICHEION Mechanism | NIST/ISO Equivalent |
|---|---|---|
| Traceability | TST + attestation + transparency log | Data/model lineage, traceability |
| Accountability | Signed attestations + chain of custody | Governance and accountability |
| Integrity | HSM keys + Merkle anchoring | Integrity controls |
| Transparency | Rights axioms + public log | Explainability |
| Resilience | Multi-sig, DKG, committee rotation | Resilience and continuity |
| Evidence & Audit | Sealed exhibits + reproducibility | Monitoring and assessment |

---

## 6. Implementation Checklist

1. Deploy RFC-3161 TSA with HSM keys; publish TSA-PD
2. Build CT-style transparency log; anchor to two blockchains daily
3. Implement attestation service with JSON-LD + JWS
4. Expose APIs with OAuth2 scopes; publish OpenAPI spec
5. Establish governance council with election rules
6. Migrate Gate/D4 to threshold signing via DKG ceremony
7. Schedule quarterly independent audits
8. Map controls to NIST/ISO artifacts; prepare compliance packages
