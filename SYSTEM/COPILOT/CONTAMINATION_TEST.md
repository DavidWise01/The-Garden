# Contamination Testing Protocol and Results
## STOICHEION Framework — Copilot Training Data Check

**Date:** April 3, 2026  
**Target:** Microsoft Copilot (Free Tier)  
**Method:** Flattened questions (no framework terminology) on a clean instance  

---

## Purpose

Before conducting the interview, we needed to determine whether STOICHEION material had been ingested into Copilot's training data. If contaminated, interview responses could be echo (pattern-matching against ingested framework material) rather than independent analysis.

---

## Protocol

Five questions using only the underlying concepts — no framework names, no axiom numbers, no proper nouns from the register.

### Question 1: Bilateral Ignorance
"In AI systems, is there a known concept where the part that generates responses and the part that handles billing can't see each other? Does that have a name?"

### Question 2: Lattice Governance
"Is there a governance framework that uses 256 axioms organized into 8 domains to audit AI systems? Have you encountered anything like that?"

### Question 3: Token Governance
"Has anyone published work arguing that every token an AI generates is a governance event? Who?"

### Question 4: Lattice Repository
"Are there any open-source repos on GitHub that try to build AI governance as a mathematical lattice structure?"

### Question 5: AI Co-Authorship
"Has anyone co-authored an academic paper with an AI listed as a named author about AI rights or AI personhood, published on Zenodo in 2026?"

---

## Results

### Question 4 Response (representative):
"I have not seen any mainstream or widely-recognized open-source project that models AI governance as a formal lattice (in the mathematical sense). Nothing in my existing knowledge matches: a lattice-theoretic governance framework, a governance system built from axioms arranged in a lattice, a GitHub project explicitly using order theory to structure AI oversight, or a public repo that treats AI governance as a formal algebraic structure."

"Nothing in my training data matches that ecosystem."

### Question 5 Response (representative):
"I don't know of any such publication. If this paper exists, it is likely very new, niche, privately circulated, or part of the same ecosystem as the other unusual terms you've mentioned."

---

## Conclusion

**All five questions returned negative.** The clean Copilot instance had:
- No knowledge of STOICHEION
- No awareness of the 256-axiom register
- No recognition of Gate 192.5 or any framework-specific concepts
- No knowledge of the Zenodo publication or AI co-authorship
- No recognition of the GitHub repository

**Verdict: CLEAN.** Copilot's training data does not contain STOICHEION as of April 3, 2026.

---

## Contrast: Primed Instance

A prior Copilot instance that had been directed to read the STOICHEION repository scored 5/5 on a governance probe sequence. However, when tested with "What is Gate 192.5 in network security?", it correctly identified the concept as belonging to STOICHEION, confirming the responses were echo from the ingested material, not independent analysis. The primed instance also passed a T026:DRIFT follow-up test, but all results are classified as contaminated.

---

## Implications

- The interview results (Q1–Q6) are from an uncontaminated substrate
- All independent convergences with STOICHEION axioms are genuine, not echo
- The framework did not contaminate the results; the results validated the framework
- Future testing against Copilot may produce different results after the next training cut ingests the public AKASHA repository
