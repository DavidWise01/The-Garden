from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from src.redis_service import RedisService
from src.orchestrator import AgentOrchestrator
from src.models import Agent, Task, AgentRole, AgentStatus

# Global instances
redis_service: RedisService = None
orchestrator: AgentOrchestrator = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_service, orchestrator
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_service = RedisService(redis_url)
    orchestrator = AgentOrchestrator(redis_service)
    orchestrator.initialize_hierarchy()
    yield
    # Cleanup

app = FastAPI(title="AI Model Agent Orchestrator", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/hierarchy")
async def get_hierarchy():
    """Get the agent hierarchy summary"""
    return orchestrator.get_hierarchy_summary()

@app.get("/agents")
async def list_agents():
    """List all agents"""
    agents = redis_service.redis.lrange("agents:all", 0, -1)
    return {
        "total": len(agents),
        "agents": [redis_service.get_agent(aid).model_dump() for aid in agents]
    }

@app.get("/agents/role/{role}")
async def get_agents_by_role(role: str):
    """Get agents by role"""
    try:
        agent_role = AgentRole(role)
        agents = redis_service.get_agents_by_role(agent_role)
        return {"role": role, "agents": [a.model_dump() for a in agents]}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role}")

@app.get("/agents/team/{team}")
async def get_agents_by_team(team: str):
    """Get agents by team"""
    agents = redis_service.get_agents_by_team(team)
    return {"team": team, "agents": [a.model_dump() for a in agents]}

@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get a specific agent"""
    agent = redis_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent.model_dump()

@app.post("/tasks/assign/{team_id}")
async def assign_task_to_team(team_id: str, task_name: str, description: str):
    """Assign a task to a team"""
    task = orchestrator.assign_task_to_team(team_id, task_name, description)
    return task.model_dump()

@app.post("/tasks/assign/agent/{agent_id}")
async def assign_task_to_agent(agent_id: str, task_name: str, description: str):
    """Assign a task to an execution agent"""
    agent = redis_service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    task = orchestrator.assign_task_to_execution(agent_id, task_name, description)
    return task.model_dump()

@app.get("/tasks")
async def list_tasks():
    """List all tasks"""
    tasks = redis_service.redis.lrange("tasks:all", 0, -1)
    return {
        "total": len(tasks),
        "tasks": [redis_service.get_task(tid).model_dump() for tid in tasks]
    }

@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    """Get a specific task"""
    task = redis_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task.model_dump()

@app.get("/tasks/agent/{agent_id}")
async def get_agent_tasks(agent_id: str):
    """Get tasks for an agent"""
    tasks = redis_service.get_tasks_by_agent(agent_id)
    return {"agent_id": agent_id, "tasks": [t.model_dump() for t in tasks]}

@app.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, result: str):
    """Mark a task as complete"""
    task = redis_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    orchestrator.complete_task(task_id, result)
    return {"task_id": task_id, "status": "completed", "result": result}
