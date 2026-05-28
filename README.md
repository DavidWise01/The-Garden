# The Garden

**Author:** David Wise (ROOT0) / TriPod LLC  
**Version:** 1.0  
**License:** MIT

A multi-system AI workspace: 16-agent hierarchical orchestration, Nano Factory learning atom minter, and three perceptual environments (Breathing, Dance, Ignition).

---

## Systems

### 1. 16-Agent Orchestration

Hierarchical agent swarm with Redis message queue and PostgreSQL persistence.

```
1  Orchestrator       main control
2  Team Leads         team_1, team_2
4  Sub-Team Leads     2 per team
8  Execution Agents   2 per sub-team (Purple Team)
─────────────────
16 total agents
```

Each agent has a role (`orchestrator` / `team_lead` / `sub_team_lead` / `execution`), team membership, parent reference, and a status (`idle` / `active` / `completed` / `failed`).

**Stack:** FastAPI (port 8000) · React (port 3000) · Redis (port 6379) · PostgreSQL (port 5432)

### 2. Nano Factory

Fetches trending GitHub repositories, mints 5-minute **learning atoms** for each topic.

Each atom has 4 timed stages:
```
Atom 1 — Core   (60s)  What is <topic> in one sentence?
Atom 2 — Why    (90s)  Why does <topic> matter to root0?
Atom 3 — Build  (120s) Make one thing with <topic> right now.
Atom 4 — Test   (30s)  Did it work? Witness it.
```

Output: Markdown files in `nano_output/` (gitignored — regeneratable).  
Sources: GitHub public repos (stars > 50k) + Microsoft / Google / Meta org repos.

### 3. Perceptual Environments

Three self-contained HTML pages with audio loops:

| Page | File | Loop |
|------|------|------|
| Breathing | `breathing/index.html` | `breathing_555.mp3` |
| Dance | `dance/index.html` | `dance_loop.mp3` |
| Ignition | `ignition/index.html` | `dance_loop.mp3` |

Open any in a browser. No server required.

---

## Architecture

```
the-garden/
  src/
    main.py          FastAPI app — /health /hierarchy /agents /tasks
    orchestrator.py  AgentOrchestrator — initialize_hierarchy(), get_hierarchy_summary()
    models.py        Agent, Task, AgentRole, AgentStatus (Pydantic)
    redis_service.py Redis adapter — create/get/list agents and tasks
  frontend/
    src/
      App.js         React dashboard — agent list, task assignment
  nano_factory.py    Nano minting — fetch_topics(), mint_nano(topic), maxcap()
  docker-compose.yml api + redis + postgres
  Dockerfile         Python 3.11-slim, uvicorn entry
  requirements.txt   FastAPI, uvicorn, pydantic, SQLAlchemy, redis, httpx
  railway.toml       Railway deploy config
  breathing/         Breathing environment
  dance/             Dance environment
  ignition/          Ignition environment
```

---

## Quick start

```bash
# Full stack (Docker)
docker compose up -d
```

- API: http://localhost:8000
- Frontend: http://localhost:3000

```bash
# API only
pip install -r requirements.txt
uvicorn src.main:app --reload
```

```bash
# Nano factory
python nano_factory.py
# Outputs .md atoms to nano_output/
```

---

## API

```
GET  /health                      Health check
GET  /hierarchy                   Agent hierarchy summary
GET  /agents                      List all agents (total + details)
GET  /agents/role/{role}          Filter: orchestrator | team_lead | sub_team_lead | execution
GET  /agents/team/{team}          Filter by team: team_1 | team_2
POST /tasks/assign/{team_id}      Assign task to team
POST /tasks/assign/agent/{id}     Assign task to specific agent
GET  /tasks                       List all tasks
POST /tasks/{task_id}/complete    Mark task complete with result
```

---

## Scaling

Extend `orchestrator.py::initialize_hierarchy()` to add teams, sub-teams, or execution agents. Agent count is determined at startup — no config file needed.
