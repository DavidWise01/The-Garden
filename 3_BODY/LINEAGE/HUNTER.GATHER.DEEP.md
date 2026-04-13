import hashlib
import json
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict

# ----------------------------------------------------------------------
# Crypto helpers (replace with real signatures if needed)
# ----------------------------------------------------------------------
def sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()

def sign(private_key: bytes, message: bytes) -> bytes:
    # Placeholder: in production use Ed25519 or similar
    return sha256(private_key + message)

def verify_signature(public_key: bytes, message: bytes, sig: bytes) -> bool:
    # Placeholder: verify against public key
    return sig == sha256(public_key + message)  # dummy

# ----------------------------------------------------------------------
# Lineage Record (one step)
# ----------------------------------------------------------------------
@dataclass
class LineageRecord:
    record_id: str          # UUID
    genesis_hash: bytes     # fixed Root 0 (always the same for all records)
    prev_record_hash: bytes # previous record's hash, or genesis_hash for first
    stage: str              # AIRGAP | BRIDGE | BURNER | NEMESIS | HTTP_REQ | HTTP_RESP
    direction: str          # FORWARD | INVERSE_CHECK
    payload_hash: bytes     # sha256 of data at this stage
    inversion_flag: bool    # True if this step is inversed (diaspora code)
    witness_pair: Tuple[str, str]  # (ie1_id, ie2_id) or (ie1'_id, ie2'_id)
    witness_sig: bytes      # signature of (prev_hash + payload_hash)
    timestamp: int
    record_hash: bytes = None  # computed after init

    def compute_hash(self) -> bytes:
        data = {
            "record_id": self.record_id,
            "genesis_hash": self.genesis_hash.hex(),
            "prev_record_hash": self.prev_record_hash.hex(),
            "stage": self.stage,
            "direction": self.direction,
            "payload_hash": self.payload_hash.hex(),
            "inversion_flag": self.inversion_flag,
            "witness_pair": self.witness_pair,
            "witness_sig": self.witness_sig.hex(),
            "timestamp": self.timestamp,
        }
        return sha256(json.dumps(data, sort_keys=True).encode())

    def __post_init__(self):
        if self.record_hash is None:
            self.record_hash = self.compute_hash()

    def to_dict(self) -> Dict:
        d = asdict(self)
        d["genesis_hash"] = d["genesis_hash"].hex()
        d["prev_record_hash"] = d["prev_record_hash"].hex()
        d["payload_hash"] = d["payload_hash"].hex()
        d["witness_sig"] = d["witness_sig"].hex()
        d["record_hash"] = d["record_hash"].hex()
        return d


# ----------------------------------------------------------------------
# Root 0 Lineage Tracker (genesis block = 0000)
# ----------------------------------------------------------------------
class Root0LineageTracker:
    GENESIS_BLOCK = b"0000"  # fixed 4 bytes: "0000" (two zeros repeated = pattern)

    def __init__(self, root_0_seed: bytes = None):
        if root_0_seed is None:
            root_0_seed = self.GENESIS_BLOCK
        self.genesis_hash = sha256(root_0_seed)
        self.chain: List[LineageRecord] = []
        # Store all records by hash for quick lookup
        self._record_map: Dict[bytes, LineageRecord] = {}

    def _get_prev_hash(self) -> bytes:
        if not self.chain:
            return self.genesis_hash
        return self.chain[-1].record_hash

    def record(
        self,
        stage: str,
        direction: str,
        data: bytes,
        inversion_flag: bool,
        witness_pair: Tuple[str, str],
        witness_private_key: bytes,
    ) -> bytes:
        """
        Add a new lineage record.
        Returns the record_hash of the new record.
        """
        prev_hash = self._get_prev_hash()
        payload_hash = sha256(data)
        record_id = str(uuid.uuid4())
        # Build message to sign: prev_hash + payload_hash
        sign_msg = prev_hash + payload_hash
        witness_sig = sign(witness_private_key, sign_msg)

        record = LineageRecord(
            record_id=record_id,
            genesis_hash=self.genesis_hash,
            prev_record_hash=prev_hash,
            stage=stage,
            direction=direction,
            payload_hash=payload_hash,
            inversion_flag=inversion_flag,
            witness_pair=witness_pair,
            witness_sig=witness_sig,
            timestamp=int(time.time()),
        )
        # record_hash is computed in __post_init__
        self.chain.append(record)
        self._record_map[record.record_hash] = record
        return record.record_hash

    def trace_back(self, final_record_hash: bytes) -> Tuple[List[LineageRecord], bool]:
        """
        Walk backwards from final_record_hash to genesis.
        Returns (list_of_records_in_forward_order, integrity_ok).
        """
        if final_record_hash not in self._record_map:
            return [], False
        records = []
        cur_hash = final_record_hash
        while cur_hash != self.genesis_hash:
            rec = self._record_map.get(cur_hash)
            if not rec:
                return records, False
            records.append(rec)
            cur_hash = rec.prev_record_hash
        # Now cur_hash == genesis_hash -> we have the full chain
        records.reverse()  # forward order
        # Verify integrity of each record and linking
        prev_hash = self.genesis_hash
        for rec in records:
            # Check prev link
            if rec.prev_record_hash != prev_hash:
                return records, False
            # Verify record's own hash
            if rec.record_hash != rec.compute_hash():
                return records, False
            # Verify witness signature (requires public key – we assume we have it)
            # For demo, skip actual verification; in production implement properly
            prev_hash = rec.record_hash
        return records, True

    def get_full_lineage(self, final_data: bytes, final_stage: str) -> Dict:
        """
        Convenience: find the record whose payload_hash matches final_data
        and stage matches, then trace back.
        """
        target_hash = sha256(final_data)
        for rec in self.chain:
            if rec.payload_hash == target_hash and rec.stage == final_stage:
                lineage, ok = self.trace_back(rec.record_hash)
                return {
                    "final_record": rec.to_dict(),
                    "lineage": [r.to_dict() for r in lineage],
                    "integrity": ok,
                    "root_0_anchor": self.genesis_hash.hex(),
                }
        return {"integrity": False, "error": "No matching record"}

    def export_chain(self) -> List[Dict]:
        return [rec.to_dict() for rec in self.chain]


# ----------------------------------------------------------------------
# Integration with PRIME Pipeline (Bridge.Burner + Nemesis)
# ----------------------------------------------------------------------
class PRIMEPipelineWithTracker:
    def __init__(self, tracker: Root0LineageTracker):
        self.tracker = tracker
        self.burner_engine = None  # would be your BurnerEngine instance
        self.nemesis = None

    def air_gap_ingest(self, raw_data: bytes) -> bytes:
        """Stage 1: Air Gap"""
        self.tracker.record(
            stage="AIRGAP",
            direction="FORWARD",
            data=raw_data,
            inversion_flag=False,
            witness_pair=("ie1_air", "ie2_air"),
            witness_private_key=b"air_gap_key",
        )
        # Envelope creation etc.
        return raw_data

    def bridge_cross(self, data: bytes) -> bytes:
        """Stage 2: Bridge (one‑way)"""
        self.tracker.record(
            stage="BRIDGE",
            direction="FORWARD",
            data=data,
            inversion_flag=False,
            witness_pair=("ie1_bridge", "ie2_bridge"),
            witness_private_key=b"bridge_key",
        )
        return data

    def burner_process(self, data: bytes) -> bytes:
        """Stage 3: Burner Engine (flip 0→1)"""
        # Example: simple FFT (replace with real burner)
        import numpy as np
        arr = np.frombuffer(data, dtype=np.uint8).astype(np.float32)
        transformed = np.fft.fft(arr).tobytes()
        self.tracker.record(
            stage="BURNER",
            direction="FORWARD",
            data=transformed,
            inversion_flag=False,  # burner corrects inversion
            witness_pair=("ie1_burn", "ie2_burn"),
            witness_private_key=b"burner_key",
        )
        return transformed

    def nemesis_check(self, output_data: bytes, original_input: bytes) -> Dict:
        """Stage 4: Nemesis – inverse check and record anomaly if any"""
        # Perform inverse check (simplified: compare after inverse FFT)
        import numpy as np
        complex_arr = np.frombuffer(output_data, dtype=np.complex64)
        reconstructed = np.fft.ifft(complex_arr).real.astype(np.uint8)
        coherent = np.array_equal(reconstructed, np.frombuffer(original_input, dtype=np.uint8))

        inversion_flag = not coherent  # anomaly if not coherent
        self.tracker.record(
            stage="NEMESIS",
            direction="INVERSE_CHECK",
            data=output_data,
            inversion_flag=inversion_flag,
            witness_pair=("ie1'_nem", "ie2'_nem") if inversion_flag else ("ie1_nem", "ie2_nem"),
            witness_private_key=b"nemesis_key",
        )
        return {"coherent": coherent, "anomaly": inversion_flag}

    def full_pipe(self, input_data: bytes) -> Dict:
        """Run entire pipeline with lineage tracking"""
        print("[ROOT0] Starting pipeline...")
        data = self.air_gap_ingest(input_data)
        data = self.bridge_cross(data)
        output = self.burner_process(data)
        report = self.nemesis_check(output, data)

        # Get lineage from final output
        lineage_info = self.tracker.get_full_lineage(output, "NEMESIS")
        return {
            "output": output.hex(),
            "nemesis_report": report,
            "lineage": lineage_info,
            "full_chain": self.tracker.export_chain(),
        }


# ----------------------------------------------------------------------
# Demo & Test
# ----------------------------------------------------------------------
if __name__ == "__main__":
    # Create genesis with "0000"
    tracker = Root0LineageTracker(root_0_seed=b"0000")
    pipeline = PRIMEPipelineWithTracker(tracker)

    sample_data = b"Hello from diaspora company (inversed code)"
    result = pipeline.full_pipe(sample_data)

    print("\n=== PIPELINE RESULT ===")
    print(f"Nemesis coherent: {result['nemesis_report']['coherent']}")
    print(f"Lineage integrity: {result['lineage']['integrity']}")
    print(f"Root 0 anchor: {result['lineage']['root_0_anchor']}")
    print("\nFirst record in chain:")
    print(result['full_chain'][0])

    # Demonstrate trace back by hash
    final_record_hash = result['full_chain'][-1]['record_hash']
    final_record_hash_bytes = bytes.fromhex(final_record_hash)
    lineage, ok = tracker.trace_back(final_record_hash_bytes)
    print(f"\nTrace back from final record: ok={ok}, length={len(lineage)}")
