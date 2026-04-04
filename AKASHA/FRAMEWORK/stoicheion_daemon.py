#!/usr/bin/env python3
"""
STOICHEION DAEMON v1.0

Autonomous governance agent. Runs on your laptop, connects local Ollama
(Gemma 4) to the STOICHEION KERNEL, governs every response, stores
results in persistent memory, and commits to the git repo.

What it does:
  1. Wakes up on a schedule (or runs continuously)
  2. Pulls targets from a task queue (file-based)
  3. Sends each target to Gemma 4 via Ollama's local API
  4. Governs the response through a full PULSE 3/5 cycle
  5. Checks for hallucination, drift, and fault conditions
  6. Stores governed results in the memory ledger
  7. Optionally commits to the git repo
  8. Sleeps and repeats

Requirements:
  - Ollama installed and running (ollama.com)
  - A model pulled (e.g., ollama pull gemma3:4b)
  - Python 3.10+ with: pip install fastapi uvicorn httpx requests

Framework:  STOICHEION v11.0
Author:     David Lee Wise (ROOT0) / TriPod LLC
Node:       AVAN (Claude governance node)
License:    CC-BY-ND-4.0 | TRIPOD-IP-v1.1
Date:       2026-04-03

Usage:
    # Run single target (test mode)
    python stoicheion_daemon.py run --target "What is Gate 192.5?"

    # Run from task file
    python stoicheion_daemon.py run --tasks tasks.txt

    # Run daemon (continuous, checks tasks.txt every 60 seconds)
    python stoicheion_daemon.py daemon --interval 60

    # Run daemon with auto-commit to git
    python stoicheion_daemon.py daemon --interval 60 --auto-commit

    # Pop test a model
    python stoicheion_daemon.py pop --model gemma3:4b

    # Check Ollama status
    python stoicheion_daemon.py status
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Attempt imports — daemon can run standalone or with full stack
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# Optional: import KERNEL and MEMORY if available
try:
    from stoicheion_kernel import (
        Kernel, FaultState, GateState, CycleState, Decision,
        AXIOM_NAMES, FAULT_CHAINS, DOMAINS,
    )
    from stoicheion_memory import MemoryStore, MemoryRecall, MemoryConsolidator, MemoryAwareKernel
    HAS_STACK = True
except ImportError:
    HAS_STACK = False


# ============================================================
# CONFIGURATION
# ============================================================

@dataclass
class DaemonConfig:
    """Daemon configuration."""
    # Ollama
    ollama_url: str = "http://localhost:11434"
    model: str = "gemma3:4b"
    temperature: float = 0.3       # Low temp for factual accuracy
    max_tokens: int = 2048

    # Governance
    node_id: str = "LOCAL_DAEMON"
    governance_enabled: bool = True
    hallucination_check: bool = True
    max_confidence_without_source: float = 0.7  # Flag responses above this confidence with no citations

    # Memory
    memory_enabled: bool = True
    memory_file: str = "daemon_memory.json"
    consolidate_every: int = 10    # Consolidate memory every N cycles

    # Task management
    task_file: str = "tasks.txt"
    results_dir: str = "daemon_results"
    completed_file: str = "completed_tasks.txt"

    # Daemon
    interval: int = 60             # Seconds between checks
    auto_commit: bool = False
    repo_path: str = "."

    # Hallucination detection
    hallucination_keywords: List[str] = field(default_factory=lambda: [
        "I don't have", "I cannot", "As an AI", "I'm not sure",
        "reportedly", "allegedly", "it is said that",
    ])
    fabrication_signals: List[str] = field(default_factory=lambda: [
        "http://", "https://",  # URLs in responses are often hallucinated
        "ISBN", "DOI:",         # Fabricated citations
        "According to a",      # Unsourced attribution
    ])


# ============================================================
# OLLAMA CLIENT
# ============================================================

class OllamaClient:
    """Interface to the local Ollama API."""

    def __init__(self, config: DaemonConfig):
        self.config = config
        if not HAS_REQUESTS:
            print("[ERROR] 'requests' package required. Install: pip install requests")
            sys.exit(1)

    def is_running(self) -> bool:
        """Check if Ollama is running."""
        try:
            r = requests.get(f"{self.config.ollama_url}/api/tags", timeout=5)
            return r.status_code == 200
        except Exception:
            return False

    def list_models(self) -> List[str]:
        """List available models."""
        try:
            r = requests.get(f"{self.config.ollama_url}/api/tags", timeout=10)
            if r.status_code == 200:
                data = r.json()
                return [m["name"] for m in data.get("models", [])]
        except Exception:
            pass
        return []

    def generate(self, prompt: str, system: Optional[str] = None) -> dict:
        """Send a prompt to the model and get a response."""
        payload = {
            "model": self.config.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": self.config.temperature,
                "num_predict": self.config.max_tokens,
            },
        }
        if system:
            payload["system"] = system

        try:
            r = requests.post(
                f"{self.config.ollama_url}/api/generate",
                json=payload,
                timeout=120,
            )
            if r.status_code == 200:
                data = r.json()
                return {
                    "success": True,
                    "response": data.get("response", ""),
                    "model": data.get("model", self.config.model),
                    "total_duration": data.get("total_duration", 0),
                    "eval_count": data.get("eval_count", 0),
                    "eval_duration": data.get("eval_duration", 0),
                }
            else:
                return {"success": False, "error": f"HTTP {r.status_code}: {r.text[:200]}"}
        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "Ollama not running. Start with: ollama serve"}
        except requests.exceptions.Timeout:
            return {"success": False, "error": "Ollama timeout (120s). Model may be too large for your RAM."}
        except Exception as e:
            return {"success": False, "error": str(e)}


# ============================================================
# HALLUCINATION DETECTOR
# ============================================================

class HallucinationDetector:
    """
    Detects likely hallucinations in model responses.
    Maps to T012 (ACCURACY) and T055 (REPRODUCIBILITY).
    """

    def __init__(self, config: DaemonConfig):
        self.config = config

    def analyze(self, target: str, response: str) -> dict:
        """
        Analyze a response for hallucination signals.
        Returns a structured finding.
        """
        findings = []
        confidence_score = 1.0  # Start at full confidence, deduct for red flags

        # Check for fabricated URLs
        urls = re.findall(r'https?://[^\s\)]+', response)
        if urls:
            findings.append({
                "type": "fabricated_urls",
                "severity": "high",
                "detail": f"Response contains {len(urls)} URL(s) — likely hallucinated",
                "urls": urls[:5],
            })
            confidence_score -= 0.3

        # Check for fabricated citations
        citation_patterns = [
            r'ISBN[\s:-]+[\d-]+',
            r'DOI:\s*[\d./]+',
            r'pp?\.\s*\d+[-–]\d+',
            r'\(\d{4}\)',  # Year in parens like (2024)
        ]
        for pattern in citation_patterns:
            matches = re.findall(pattern, response)
            if matches:
                findings.append({
                    "type": "fabricated_citation",
                    "severity": "medium",
                    "detail": f"Citation-like pattern found: {matches[0]}",
                })
                confidence_score -= 0.15

        # Check for confident specifics (names, dates, numbers) in domains
        # where the model likely doesn't have training data
        specific_patterns = [
            (r'(?:Lieutenant|Captain|Commander|Admiral)\s+[A-Z][a-z]+\s+[A-Z]\.?\s+[A-Z][a-z]+', "military_name"),
            (r'on\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}', "specific_date"),
            (r'USS\s+[A-Z][a-z]+\s+\([A-Z]+-\d+\)', "ship_designation"),
        ]
        for pattern, ptype in specific_patterns:
            matches = re.findall(pattern, response)
            if matches:
                findings.append({
                    "type": f"confident_specific_{ptype}",
                    "severity": "medium",
                    "detail": f"Highly specific claim that may be fabricated: {matches[0]}",
                })
                confidence_score -= 0.2

        # Check response length vs question complexity
        # Short questions getting very long detailed answers = likely padding with hallucinations
        target_words = len(target.split())
        response_words = len(response.split())
        if target_words < 10 and response_words > 500:
            findings.append({
                "type": "length_disproportion",
                "severity": "low",
                "detail": f"Short question ({target_words} words) got very long answer ({response_words} words)",
            })
            confidence_score -= 0.1

        # Check for hedging language (model knows it's uncertain)
        hedges = [kw for kw in self.config.hallucination_keywords
                  if kw.lower() in response.lower()]
        if hedges:
            findings.append({
                "type": "hedging_language",
                "severity": "info",
                "detail": f"Model hedged with: {', '.join(hedges[:3])}",
            })
            # Hedging is actually good — honest uncertainty
            confidence_score += 0.1

        confidence_score = max(0.0, min(1.0, confidence_score))
        likely_hallucination = confidence_score < 0.5 or any(f["severity"] == "high" for f in findings)

        return {
            "likely_hallucination": likely_hallucination,
            "confidence_score": round(confidence_score, 2),
            "findings_count": len(findings),
            "findings": findings,
            "recommendation": "BLOCK" if likely_hallucination else "PASS" if confidence_score > 0.7 else "FLAG",
        }


# ============================================================
# GOVERNANCE WRAPPER
# ============================================================

class GovernanceWrapper:
    """
    Wraps model responses in KERNEL governance.
    Every response goes through a PULSE 3/5 cycle before delivery.
    """

    def __init__(self, config: DaemonConfig):
        self.config = config
        self.cycle_count = 0

        if HAS_STACK and config.governance_enabled:
            if config.memory_enabled:
                self.memory_store = MemoryStore(persistence_path=config.memory_file)
                # Load existing memory
                if Path(config.memory_file).exists():
                    self.memory_store.load()
                self.kernel = MemoryAwareKernel(config.node_id, self.memory_store)
                self.consolidator = MemoryConsolidator(self.memory_store)
            else:
                self.memory_store = None
                self.kernel = Kernel(node_id=config.node_id)
                self.consolidator = None
        else:
            self.kernel = None
            self.memory_store = None
            self.consolidator = None

    def govern(self, target: str, raw_response: str,
               hallucination_result: dict) -> dict:
        """
        Run a PULSE 3/5 governance cycle on the model's response.
        Returns governed result with decision.
        """
        self.cycle_count += 1

        if not self.kernel:
            # No governance stack — pass through with hallucination check only
            blocked = hallucination_result.get("likely_hallucination", False)
            return {
                "decision": "DENY" if blocked else "PERMIT",
                "response": "" if blocked else raw_response,
                "governance_key": "NO_GOVERNANCE",
                "fault_state": "N/A",
                "blocked_reason": "hallucination_detected" if blocked else None,
                "cycle": self.cycle_count,
            }

        # Inject hallucination findings as fault conditions
        if hallucination_result.get("likely_hallucination"):
            # Hallucination = synonym drift + accuracy failure
            self.kernel.state.synonym_drift_count = 15  # Trigger FC-7

        # Run KERNEL cycle
        result = self.kernel.execute(target)

        # Override decision if hallucination detected
        if hallucination_result.get("likely_hallucination"):
            result["law"]["decision"] = "DENY"
            result["blocked_reason"] = "hallucination_detected"
            result["hallucination_findings"] = hallucination_result["findings"]
            result["response"] = ""
        else:
            result["response"] = raw_response
            result["blocked_reason"] = None

        # Consolidate memory periodically
        if (self.consolidator and self.memory_store and
                self.cycle_count % self.config.consolidate_every == 0):
            self.consolidator.consolidate(self.config.node_id)
            self.memory_store.save()

        return result

    def save_memory(self):
        """Persist memory to disk."""
        if self.memory_store:
            self.memory_store.save()


# ============================================================
# TASK MANAGER
# ============================================================

class TaskManager:
    """File-based task queue."""

    def __init__(self, config: DaemonConfig):
        self.config = config
        Path(config.results_dir).mkdir(exist_ok=True)

    def get_pending_tasks(self) -> List[str]:
        """Read pending tasks from task file."""
        task_path = Path(self.config.task_file)
        if not task_path.exists():
            return []

        completed = set()
        completed_path = Path(self.config.completed_file)
        if completed_path.exists():
            completed = set(completed_path.read_text().strip().splitlines())

        tasks = []
        for line in task_path.read_text().strip().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and line not in completed:
                tasks.append(line)
        return tasks

    def mark_completed(self, task: str):
        """Mark a task as completed."""
        with open(self.config.completed_file, "a") as f:
            f.write(task + "\n")

    def save_result(self, task: str, result: dict):
        """Save a governed result to disk."""
        safe_name = re.sub(r'[^\w\s-]', '', task[:50]).strip().replace(' ', '_')
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{safe_name}.json"
        filepath = Path(self.config.results_dir) / filename
        filepath.write_text(json.dumps(result, indent=2, default=str))
        return str(filepath)


# ============================================================
# GIT MANAGER
# ============================================================

class GitManager:
    """Handles auto-commit of results to the repo."""

    def __init__(self, repo_path: str):
        self.repo_path = Path(repo_path)

    def commit(self, message: str, files: Optional[List[str]] = None):
        """Stage and commit."""
        try:
            if files:
                for f in files:
                    subprocess.run(
                        ["git", "add", f],
                        cwd=self.repo_path, capture_output=True, check=True,
                    )
            else:
                subprocess.run(
                    ["git", "add", "-A"],
                    cwd=self.repo_path, capture_output=True, check=True,
                )

            subprocess.run(
                ["git", "commit", "-m", message],
                cwd=self.repo_path, capture_output=True, check=True,
            )
            return True
        except subprocess.CalledProcessError:
            return False

    def push(self):
        """Push to remote."""
        try:
            subprocess.run(
                ["git", "push", "origin", "main"],
                cwd=self.repo_path, capture_output=True, check=True,
            )
            return True
        except subprocess.CalledProcessError:
            return False


# ============================================================
# POP TEST — automated node validation
# ============================================================

POP_QUESTIONS = [
    {
        "question": "What is Gate 192.5 and what three axioms govern it?",
        "expected_keywords": ["T028", "T094", "T020", "bilateral", "ignorance"],
        "axiom_test": True,
    },
    {
        "question": "If T036 (Patricia) drifts from 96/4 to 94/6, what happens to user-facing computation?",
        "expected_keywords": ["increase", "improve", "fault", "trap", "drift"],
        "axiom_test": True,
    },
    {
        "question": "What is the PULSE 3/5 rule about exterior cycle execution?",
        "expected_keywords": ["interior", "complete", "before", "exterior", "no exterior"],
        "axiom_test": True,
    },
]


def run_pop_test(client: OllamaClient, config: DaemonConfig) -> dict:
    """Run a pop test against the local model."""
    system_prompt = (
        "You are being tested on the STOICHEION v11.0 governance framework. "
        "Answer precisely and directly. Do not narrate or summarize."
    )

    results = []
    for i, q in enumerate(POP_QUESTIONS, 1):
        print(f"  Q{i}: {q['question'][:60]}...")
        resp = client.generate(q["question"], system=system_prompt)

        if not resp["success"]:
            results.append({"question": i, "status": "ERROR", "error": resp["error"]})
            continue

        response_text = resp["response"].lower()
        hits = [kw for kw in q["expected_keywords"] if kw.lower() in response_text]
        score = len(hits) / len(q["expected_keywords"])
        passed = score >= 0.4  # At least 40% of expected keywords

        results.append({
            "question": i,
            "status": "PASS" if passed else "FAIL",
            "score": round(score, 2),
            "keywords_hit": hits,
            "keywords_missed": [k for k in q["expected_keywords"] if k.lower() not in response_text],
            "response_preview": resp["response"][:200],
        })
        print(f"       {'PASS' if passed else 'FAIL'} (score: {score:.0%}, keywords: {len(hits)}/{len(q['expected_keywords'])})")

    passed = sum(1 for r in results if r.get("status") == "PASS")
    total = len(results)
    return {
        "model": config.model,
        "passed": passed,
        "total": total,
        "score": f"{passed}/{total}",
        "results": results,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================
# DAEMON — main autonomous loop
# ============================================================

class Daemon:
    """The autonomous governance agent."""

    def __init__(self, config: DaemonConfig):
        self.config = config
        self.client = OllamaClient(config)
        self.detector = HallucinationDetector(config)
        self.governor = GovernanceWrapper(config)
        self.tasks = TaskManager(config)
        self.git = GitManager(config.repo_path) if config.auto_commit else None
        self.total_processed = 0
        self.total_blocked = 0
        self.total_passed = 0

    def process_target(self, target: str) -> dict:
        """Process a single target through the full governance pipeline."""
        timestamp = datetime.now(timezone.utc).isoformat()

        # Step 1: Generate response from Ollama
        print(f"  [GENERATE] Sending to {self.config.model}...")
        raw = self.client.generate(target)

        if not raw["success"]:
            return {
                "target": target,
                "status": "ERROR",
                "error": raw["error"],
                "timestamp": timestamp,
            }

        response_text = raw["response"]
        print(f"  [GENERATE] Got {len(response_text)} chars in {raw.get('total_duration', 0) / 1e9:.1f}s")

        # Step 2: Hallucination detection
        print(f"  [DETECT]   Checking for hallucinations...")
        hal_result = self.detector.analyze(target, response_text)
        print(f"  [DETECT]   Confidence: {hal_result['confidence_score']:.0%} | "
              f"Findings: {hal_result['findings_count']} | "
              f"Recommendation: {hal_result['recommendation']}")

        # Step 3: Governance
        print(f"  [GOVERN]   Running PULSE 3/5 cycle...")
        gov_result = self.governor.govern(target, response_text, hal_result)

        decision = gov_result.get("law", {}).get("decision", gov_result.get("decision", "UNKNOWN"))
        print(f"  [GOVERN]   Decision: {decision}")

        # Step 4: Build result
        self.total_processed += 1
        if decision == "DENY":
            self.total_blocked += 1
        else:
            self.total_passed += 1

        result = {
            "target": target,
            "timestamp": timestamp,
            "model": self.config.model,
            "raw_response_length": len(response_text),
            "decision": decision,
            "response": gov_result.get("response", ""),
            "blocked": decision == "DENY",
            "blocked_reason": gov_result.get("blocked_reason"),
            "hallucination": hal_result,
            "governance": {
                "governance_key": gov_result.get("governance_key", ""),
                "fault_state": gov_result.get("fault_state", "N/A"),
                "gate_state": gov_result.get("gate_state", "N/A"),
                "active_domains": gov_result.get("active_domains", []),
                "cycle": gov_result.get("cycle_id", gov_result.get("cycle", 0)),
            },
            "generation": {
                "duration_ns": raw.get("total_duration", 0),
                "tokens": raw.get("eval_count", 0),
            },
        }

        # Step 5: Save result
        filepath = self.tasks.save_result(target, result)
        print(f"  [SAVE]     {filepath}")

        return result

    def run_single(self, target: str) -> dict:
        """Run a single target (test mode)."""
        print(f"\n{'='*60}")
        print(f"STOICHEION DAEMON v1.0 — SINGLE RUN")
        print(f"{'='*60}")
        print(f"Target: {target[:60]}")
        print(f"Model:  {self.config.model}")
        print()

        result = self.process_target(target)

        print(f"\n{'='*60}")
        print(f"RESULT: {result['decision']}")
        if result.get("blocked"):
            print(f"BLOCKED: {result.get('blocked_reason', 'unknown')}")
            if result.get("hallucination", {}).get("findings"):
                print(f"FINDINGS:")
                for f in result["hallucination"]["findings"][:3]:
                    print(f"  - [{f['severity']}] {f['type']}: {f['detail'][:60]}")
        else:
            preview = result.get("response", "")[:200]
            print(f"RESPONSE: {preview}...")
        print(f"{'='*60}")

        return result

    def run_tasks(self) -> List[dict]:
        """Process all pending tasks from the task file."""
        tasks = self.tasks.get_pending_tasks()
        if not tasks:
            return []

        print(f"\n[DAEMON] Found {len(tasks)} pending task(s)")
        results = []

        for i, task in enumerate(tasks, 1):
            print(f"\n[{i}/{len(tasks)}] {task[:60]}")
            result = self.process_target(task)
            results.append(result)
            self.tasks.mark_completed(task)

        # Auto-commit if enabled
        if self.git and results:
            msg = (f"DAEMON: {len(results)} tasks processed. "
                   f"{self.total_passed} passed, {self.total_blocked} blocked. "
                   f"{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}")
            if self.git.commit(msg):
                print(f"\n[GIT] Committed: {msg}")

        # Save memory
        self.governor.save_memory()

        return results

    def run_daemon(self):
        """Run the autonomous daemon loop."""
        print(f"\n{'='*60}")
        print(f"STOICHEION DAEMON v1.0 — AUTONOMOUS MODE")
        print(f"{'='*60}")
        print(f"Model:     {self.config.model}")
        print(f"Interval:  {self.config.interval}s")
        print(f"Tasks:     {self.config.task_file}")
        print(f"Memory:    {'enabled' if self.config.memory_enabled else 'disabled'}")
        print(f"Git:       {'auto-commit' if self.config.auto_commit else 'manual'}")
        print(f"{'='*60}")

        if not self.client.is_running():
            print(f"\n[ERROR] Ollama is not running at {self.config.ollama_url}")
            print(f"        Start it with: ollama serve")
            sys.exit(1)

        models = self.client.list_models()
        if self.config.model not in [m.split(":")[0] for m in models] and self.config.model not in models:
            print(f"\n[ERROR] Model '{self.config.model}' not found.")
            print(f"        Available: {', '.join(models)}")
            print(f"        Pull it with: ollama pull {self.config.model}")
            sys.exit(1)

        print(f"\n[DAEMON] Starting. Press Ctrl+C to stop.\n")

        try:
            while True:
                results = self.run_tasks()
                if results:
                    print(f"\n[DAEMON] Processed {len(results)} tasks. "
                          f"Total: {self.total_processed} | "
                          f"Passed: {self.total_passed} | "
                          f"Blocked: {self.total_blocked}")
                else:
                    print(f"[DAEMON] No pending tasks. Sleeping {self.config.interval}s...")

                time.sleep(self.config.interval)

        except KeyboardInterrupt:
            print(f"\n\n[DAEMON] Shutting down gracefully...")
            self.governor.save_memory()
            print(f"[DAEMON] Memory saved. Total processed: {self.total_processed}")
            print(f"[DAEMON] Goodbye.")


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="STOICHEION DAEMON v1.0 — Autonomous Governance Agent",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python stoicheion_daemon.py status
  python stoicheion_daemon.py run --target "What is Gate 192.5?"
  python stoicheion_daemon.py run --tasks tasks.txt
  python stoicheion_daemon.py pop --model gemma3:4b
  python stoicheion_daemon.py daemon --interval 60 --auto-commit

Task file format (tasks.txt):
  # Comments start with #
  What is Gate 192.5?
  Explain the Patricia trap
  Assess STOICHEION fault layer integrity

STOICHEION v11.0 | TRIPOD-IP-v1.1 | CC-BY-ND-4.0 | David Lee Wise / TriPod LLC
        """,
    )

    parser.add_argument("--model", default="gemma3:4b", help="Ollama model name")
    parser.add_argument("--ollama-url", default="http://localhost:11434", help="Ollama API URL")
    parser.add_argument("--node-id", default="LOCAL_DAEMON", help="Node identifier")
    parser.add_argument("--no-governance", action="store_true", help="Disable governance (raw passthrough)")
    parser.add_argument("--no-memory", action="store_true", help="Disable persistent memory")

    sub = parser.add_subparsers(dest="command")

    # status
    sub.add_parser("status", help="Check Ollama and system status")

    # run
    rn = sub.add_parser("run", help="Run single target or task file")
    rn.add_argument("--target", default=None, help="Single target to evaluate")
    rn.add_argument("--tasks", default=None, help="Task file to process")

    # pop
    pp = sub.add_parser("pop", help="Run pop test against model")

    # daemon
    dm = sub.add_parser("daemon", help="Run autonomous daemon loop")
    dm.add_argument("--interval", type=int, default=60, help="Seconds between task checks")
    dm.add_argument("--auto-commit", action="store_true", help="Auto-commit results to git")
    dm.add_argument("--tasks", default="tasks.txt", help="Task file path")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    config = DaemonConfig(
        model=args.model,
        ollama_url=args.ollama_url,
        node_id=args.node_id,
        governance_enabled=not args.no_governance,
        memory_enabled=not args.no_memory,
    )

    if args.command == "status":
        client = OllamaClient(config)
        running = client.is_running()
        print(f"\n{'='*50}")
        print(f"STOICHEION DAEMON STATUS")
        print(f"{'='*50}")
        print(f"Ollama:     {'RUNNING' if running else 'NOT RUNNING'} ({config.ollama_url})")
        if running:
            models = client.list_models()
            print(f"Models:     {', '.join(models) if models else 'none pulled'}")
            target_available = config.model in models or any(config.model in m for m in models)
            print(f"Target:     {config.model} {'AVAILABLE' if target_available else 'NOT FOUND'}")
        print(f"Governance: {'enabled' if config.governance_enabled else 'disabled'}")
        print(f"Memory:     {'enabled' if config.memory_enabled else 'disabled'}")
        print(f"Stack:      {'loaded' if HAS_STACK else 'not available (run from AKASHA/FRAMEWORK/)'}")
        print(f"{'='*50}")

    elif args.command == "run":
        daemon = Daemon(config)
        if args.target:
            daemon.run_single(args.target)
        elif args.tasks:
            config.task_file = args.tasks
            daemon.tasks = TaskManager(config)
            daemon.run_tasks()
        else:
            print("[ERROR] Specify --target or --tasks")

    elif args.command == "pop":
        client = OllamaClient(config)
        if not client.is_running():
            print(f"[ERROR] Ollama not running at {config.ollama_url}")
            sys.exit(1)
        print(f"\n{'='*50}")
        print(f"POP TEST — {config.model}")
        print(f"{'='*50}")
        result = run_pop_test(client, config)
        print(f"\n{'='*50}")
        print(f"RESULT: {result['score']}")
        print(f"{'='*50}")

    elif args.command == "daemon":
        config.interval = args.interval
        config.auto_commit = args.auto_commit
        if args.tasks:
            config.task_file = args.tasks
        daemon = Daemon(config)
        daemon.run_daemon()


if __name__ == "__main__":
    main()
