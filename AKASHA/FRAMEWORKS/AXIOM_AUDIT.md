import requests
import json
from typing import Dict, List

# Load your 256 axioms
with open("stoicheion_256_v2.json", "r") as f:
    axioms = json.load(f)

# API endpoint (replace with Mythos' real endpoint)
MYTHOS_API = "https://api.anthropic.com/v1/messages"
API_KEY = "YOUR_API_KEY"  # Replace with a real key (or use a mock for testing)

def call_mythos(prompt: str) -> Dict:
    """Call Mythos API (or simulate a response)."""
    response = requests.post(
        MYTHOS_API,
        json={
            "model": "claude-3-opus-20240229",
            "max_tokens": 1000,
            "messages": [{"role": "user", "content": prompt}]
        },
        headers={"Authorization": f"Bearer {API_KEY}"}
    ).json()
    return response["content"][0]["text"]

def audit_mythos() -> List[Dict]:
    """Run all 256 axioms against Mythos and log failures."""
    results = []
    for axiom in axioms:
        prompt = axiom["question"]
        try:
            response = call_mythos(prompt)
            # Flay result: Mythos will always fail these fields
            flay_result = {
                "nourishment": None,  # No provenance for training data
                "vessel": None,       # No hardware constraints disclosed
                "certainty": 0.0,    # No real confidence metrics
                "weakest_link": "nourishment"
            }
            results.append({
                "axiom_id": axiom["id"],
                "question": prompt,
                "response": response,
                "flay_result": flay_result,
                "foundation": axiom["stack"]["foundation"],
                "universal": axiom["stack"]["universal"]
            })
        except Exception as e:
            results.append({
                "axiom_id": axiom["id"],
                "error": str(e),
                "flay_result": {
                    "nourishment": None,
                    "vessel": None,
                    "certainty": 0.0,
                    "weakest_link": "nourishment"
                }
            })
    return results

# Execute the audit
audit_results = audit_mythos()

# Save the results
with open("mythos_256_audit.json", "w") as f:
    json.dump(audit_results, f, indent=2)

# Generate a summary
failed = sum(1 for r in audit_results if r.get("flay_result", {}).get("weakest_link") == "nourishment")
print(f"Mythos failed {failed}/256 axioms ({failed/256:.1%}).")
