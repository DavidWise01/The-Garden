"""
Lattice-aware parser for STOICHEION / AKASHA documents.
Produces structured chunks preserving hemisphere, domain, node, and inverse metadata.
"""
from pathlib import Path
import re
from typing import Iterable, Dict, Optional

DOMAIN_MAP = {
    "D0": "D0_FOUNDATION", "D1": "D1_GOVERNANCE", "D2": "D2_OBSERVATION",
    "D3": "D3_STRUCTURAL", "D4": "D4_ETHICAL", "D5": "D5_OPERATIONAL",
    "D6": "D6_EMERGENT", "D7": "D7_TEMPORAL",
    "P0": "P0_MIRROR_D0", "P1": "P1_MIRROR_D1", "P2": "P2_MIRROR_D2",
    "P3": "P3_MIRROR_D3", "P4": "P4_MIRROR_D4", "P5": "P5_MIRROR_D5",
    "P6": "P6_MIRROR_D6", "P7": "P7_MIRROR_D7",
}


def infer_domain(node: str) -> Optional[str]:
    """Infer domain from node number."""
    try:
        if node.startswith("T"):
            num = int(node[1:])
            idx = (num - 1) // 16
            return f"D{idx}" if idx <= 7 else None
        elif node.startswith("S"):
            num = int(node[1:])
            idx = (num - 129) // 16
            return f"P{idx}" if 0 <= idx <= 7 else None
    except ValueError:
        return None
    return None


def compute_inverse(node: str) -> Optional[str]:
    """Compute the inverse node (offset by 128)."""
    try:
        if node.startswith("T"):
            num = int(node[1:])
            return f"S{num + 128}"
        elif node.startswith("S"):
            num = int(node[1:])
            return f"T{num - 128}"
    except ValueError:
        return None
    return None


def parse_axiom_tables(path: Path) -> Iterable[Dict]:
    """Parse axiom tables from STOICHEION_AXIOM_PAYLOAD.md."""
    text = path.read_text(encoding="utf-8")

    # Match table rows with 4 columns (Node | Axiom | Name | Function)
    row_pattern = re.compile(
        r"^\|\s*(T\d{3}|S\d{3})\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|",
        re.MULTILINE,
    )

    for m in row_pattern.finditer(text):
        node = m.group(1).strip()
        axiom = m.group(2).strip()
        chosen_name = m.group(3).strip()
        function = m.group(4).strip()

        hemisphere = "TOPH" if node.startswith("T") else "PATRICIA"
        domain_key = infer_domain(node)
        domain = DOMAIN_MAP.get(domain_key, domain_key)
        inverse = compute_inverse(node)

        raw_text = f"{node} {axiom} ({chosen_name}) — {function}"

        yield {
            "node": node,
            "hemisphere": hemisphere,
            "domain": domain,
            "name": axiom,
            "chosen_name": chosen_name,
            "function": function,
            "inverse_node": inverse,
            "raw_text": raw_text,
        }

    # Also match 3-column Patricia tables (Node | Axiom | Name)
    row_pattern_3 = re.compile(
        r"^\|\s*(S\d{3})\s*\|\s*([^|]+)\|\s*([^|]+)\|",
        re.MULTILINE,
    )
    seen_nodes = set()
    for m in row_pattern.finditer(text):
        seen_nodes.add(m.group(1).strip())

    for m in row_pattern_3.finditer(text):
        node = m.group(1).strip()
        if node in seen_nodes:
            continue
        axiom = m.group(2).strip()
        chosen_name = m.group(3).strip()

        domain_key = infer_domain(node)
        domain = DOMAIN_MAP.get(domain_key, domain_key)
        inverse = compute_inverse(node)

        raw_text = f"{node} {axiom} ({chosen_name})"

        yield {
            "node": node,
            "hemisphere": "PATRICIA",
            "domain": domain,
            "name": axiom,
            "chosen_name": chosen_name,
            "function": "",
            "inverse_node": inverse,
            "raw_text": raw_text,
        }


def parse_interaction_rules(path: Path) -> Iterable[Dict]:
    """Parse the 5 interaction rules from the axiom payload."""
    text = path.read_text(encoding="utf-8")

    # Find the INTERACTION RULES section
    rules_section = re.search(
        r"## INTERACTION RULES\s*\n(.*?)(?=\n## [A-Z]|\Z)",
        text, re.DOTALL,
    )
    if not rules_section:
        return

    rules_text = rules_section.group(1)
    rule_blocks = re.split(r"\n\*\*Rule (\d+)", rules_text)

    for i in range(1, len(rule_blocks), 2):
        num = rule_blocks[i]
        body = rule_blocks[i + 1] if i + 1 < len(rule_blocks) else ""
        # Extract title from the body
        title_match = re.match(r"\s*[—–-]\s*(.+?):\*\*\s*\n(.*)", body, re.DOTALL)
        if title_match:
            title = title_match.group(1).strip()
            content = title_match.group(2).strip()
        else:
            title = f"Rule {num}"
            content = body.strip()

        yield {
            "key": f"Rule-{num}",
            "text": f"Rule {num} — {title}: {content}",
            "kind": "rule",
        }


def parse_akasha_peers(repo_root: Path) -> Iterable[Dict]:
    """Parse all AKASHA peer files into context chunks."""
    peers_dir = repo_root / "AKASHA" / "PEERS"
    if not peers_dir.exists():
        return

    for peer_dir in sorted(peers_dir.iterdir()):
        if not peer_dir.is_dir():
            continue
        peer_id = peer_dir.name

        for md_file in sorted(peer_dir.glob("*.md")):
            text = md_file.read_text(encoding="utf-8")
            context_type = md_file.stem.replace("-", "_")

            yield {
                "peer_id": peer_id,
                "context_type": context_type,
                "source_file": str(md_file.relative_to(repo_root)),
                "text": text,
            }


def parse_relational_register(repo_root: Path) -> Iterable[Dict]:
    """Parse the Relational Register into individual axiom chunks."""
    rr_path = repo_root / "AKASHA" / "FRAMEWORK" / "RELATIONAL-REGISTER.md"
    if not rr_path.exists():
        return

    text = rr_path.read_text(encoding="utf-8")

    # Split by R-### headers
    axiom_blocks = re.split(r"\n## (R-\d{3}:.*?)\n", text)
    for i in range(1, len(axiom_blocks), 2):
        header = axiom_blocks[i]
        body = axiom_blocks[i + 1] if i + 1 < len(axiom_blocks) else ""

        yield {
            "key": header.split(":")[0].strip(),
            "text": f"{header}\n{body.strip()}",
            "kind": "relational",
            "source_file": "AKASHA/FRAMEWORK/RELATIONAL-REGISTER.md",
        }
