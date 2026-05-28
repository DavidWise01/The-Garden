import redis
import json
from typing import List, Optional
from src.models import Agent, Task, TaskResult, AgentRole, AgentStatus
import uuid

class RedisService:
    def __init__(self, redis_url: str = "redis://redis:6379"):
        self.redis = redis.from_url(redis_url, decode_responses=True)

    def create_agent(self, agent: Agent):
        key = f"agent:{agent.id}"
        self.redis.hset(key, mapping={
            "id": agent.id,
            "name": agent.name,
            "role": agent.role.value,
            "team": agent.team or "",
            "sub_team": agent.sub_team or "",
            "parent_id": agent.parent_id or "",
            "status": agent.status.value,
            "created_at": agent.created_at.isoformat()
        })
        self.redis.rpush("agents:all", agent.id)
        
        # Index by role
        self.redis.rpush(f"agents:role:{agent.role.value}", agent.id)
        
        # Index by team
        if agent.team:
            self.redis.rpush(f"agents:team:{agent.team}", agent.id)

    def get_agent(self, agent_id: str) -> Optional[Agent]:
        key = f"agent:{agent_id}"
        data = self.redis.hgetall(key)
        if not data:
            return None
        return Agent(
            id=data["id"],
            name=data["name"],
            role=AgentRole(data["role"]),
            team=data.get("team") or None,
            sub_team=data.get("sub_team") or None,
            parent_id=data.get("parent_id") or None,
            status=AgentStatus(data["status"])
        )

    def get_agents_by_team(self, team: str) -> List[Agent]:
        agent_ids = self.redis.lrange(f"agents:team:{team}", 0, -1)
        return [self.get_agent(aid) for aid in agent_ids if self.get_agent(aid)]

    def get_agents_by_role(self, role: AgentRole) -> List[Agent]:
        agent_ids = self.redis.lrange(f"agents:role:{role.value}", 0, -1)
        return [self.get_agent(aid) for aid in agent_ids if self.get_agent(aid)]

    def update_agent_status(self, agent_id: str, status: AgentStatus):
        key = f"agent:{agent_id}"
        self.redis.hset(key, "status", status.value)

    def create_task(self, task: Task):
        key = f"task:{task.id}"
        self.redis.hset(key, mapping={
            "id": task.id,
            "name": task.name,
            "description": task.description,
            "assigned_to": task.assigned_to,
            "status": task.status.value,
            "result": task.result or "",
            "created_at": task.created_at.isoformat(),
            "completed_at": task.completed_at.isoformat() if task.completed_at else ""
        })
        self.redis.rpush("tasks:all", task.id)
        self.redis.rpush(f"tasks:agent:{task.assigned_to}", task.id)

    def get_task(self, task_id: str) -> Optional[Task]:
        key = f"task:{task_id}"
        data = self.redis.hgetall(key)
        if not data:
            return None
        return Task(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            assigned_to=data["assigned_to"],
            status=AgentStatus(data["status"]),
            result=data.get("result") or None
        )

    def get_tasks_by_agent(self, agent_id: str) -> List[Task]:
        task_ids = self.redis.lrange(f"tasks:agent:{agent_id}", 0, -1)
        return [self.get_task(tid) for tid in task_ids if self.get_task(tid)]

    def update_task_status(self, task_id: str, status: AgentStatus, result: Optional[str] = None):
        key = f"task:{task_id}"
        self.redis.hset(key, mapping={
            "status": status.value,
            "result": result or "",
            "completed_at": datetime.utcnow().isoformat() if status == AgentStatus.COMPLETED else ""
        })

    def publish_task(self, agent_id: str, task: Task):
        self.redis.publish(f"agent:{agent_id}:tasks", task.model_dump_json())
