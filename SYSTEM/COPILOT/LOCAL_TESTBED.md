# STOICHEION Local Testbed
## Docker Compose Stack and Mock Services

**Produced by:** Microsoft Copilot (April 3, 2026)  
**License:** CC-BY-ND-4.0 — TriPod LLC  

---

## Overview

A fully isolated local testbed for the STOICHEION attestation infrastructure. Includes mock TSA, transparency log, attestation API, and DID resolver. Everything runs locally — no external network calls.

---

## Prerequisites

- Docker and Docker Compose
- Python 3.10+
- Ports 8000, 8001, 8002, 8003 free

---

## docker-compose.yml

```yaml
version: "3.8"
services:
  mock-tsa:
    build: ./services/mock_tsa
    ports:
      - "8001:8001"
  transparency-log:
    build: ./services/transparency_log
    ports:
      - "8002:8002"
  attestation-api:
    build: ./services/attestation_api
    ports:
      - "8000:8000"
    environment:
      - TSA_URL=http://mock-tsa:8001
      - LOG_URL=http://transparency-log:8002
      - DID_RESOLVER_URL=http://did-resolver:8003
  did-resolver:
    build: ./services/did_resolver
    ports:
      - "8003:8003"
```

---

## Service Implementations

### services/mock_tsa/app.py
Mock RFC-3161 timestamp authority using Ed25519 signing.

### services/transparency_log/app.py
CT-style Merkle log with append and proof endpoints.

### services/attestation_api/app.py
Accepts term registrations, requests TSA tokens, appends to transparency log, returns JSON-LD attestation envelope with Ed25519 signature.

### services/did_resolver/app.py
Simple DID resolver returning public key material for local DIDs.

*Full source code for all services was provided in the Copilot session and is available in the session transcript.*

---

## Quick Start

```bash
# Generate keys
chmod +x scripts/generate_keys_and_populate_did.sh
./scripts/generate_keys_and_populate_did.sh

# Start stack
docker compose up --build -d

# Register a test artifact
echo "Test artifact $(date)" > artifact.txt
HASH=$(sha256sum artifact.txt | awk '{print $1}')
curl -s -X POST http://localhost:8000/v1/register/term \
  -H "Content-Type: application/json" \
  -d "{\"subject_hash\":\"$HASH\",\"subject_type\":\"seed\",\"canonical_mapping\":\"T001\"}" | jq

# Verify
python3 stoicheion_verifier.py attestation.json artifact.txt

# Cleanup
docker compose down --volumes --remove-orphans
```

---

## Automated Test Harness

```bash
python3 tools/run_local_testbed.py
```

Automates: key generation → stack startup → artifact creation → registration → verification → cleanup.

---

## Security Notes

- Mock services use local keys for testing ONLY
- Production requires HSM-backed keys (FIPS 140-2 Level 3+)
- Production requires TLS everywhere and mTLS for service-to-service
- See GOVERNANCE_HARDENING_PLAN.md for full production requirements
