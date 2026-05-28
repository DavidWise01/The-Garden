from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class AgentRole(str, Enum):
    ORCHESTRATOR = "orchestrator"
    TEAM_LEAD = "team_lead"
    SUB_TEAM_LEAD = "sub_team_lead"
    EXECUTION = "execution"

class AgentStatus(str, Enum):
    IDLE = "idle"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"

class Agent(BaseModel):
    id: str
    name: str
    role: AgentRole
    team: Optional[str] = None
    sub_team: Optional[str] = None
    parent_id: Optional[str] = None
    status: AgentStatus = AgentStatus.IDLE
    created_at: datetime = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.created_at is None:
            self.created_at = datetime.utcnow()

class Task(BaseModel):
    id: str
    name: str
    description: str
    assigned_to: str
    status: AgentStatus = AgentStatus.IDLE
    result: Optional[str] = None
    created_at: datetime = None
    completed_at: Optional[datetime] = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.created_at is None:
            self.created_at = datetime.utcnow()

class TaskResult(BaseModel):
    task_id: str
    agent_id: str
    result: str
    status: AgentStatus
    timestamp: datetime = None

    def __init__(self, **data):
        super().__init__(**data)
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()
