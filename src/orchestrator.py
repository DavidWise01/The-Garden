import uuid
from src.models import Agent, AgentRole, Task, AgentStatus
from src.redis_service import RedisService

class AgentOrchestrator:
    def __init__(self, redis_service: RedisService):
        self.redis = redis_service
        self.agents = {}

    def initialize_hierarchy(self):
        """Create 1 orchestrator, 2 teams of 8 with hierarchical structure"""
        
        # 1 Orchestrator
        orchestrator = Agent(
            id=str(uuid.uuid4()),
            name="Main Orchestrator",
            role=AgentRole.ORCHESTRATOR
        )
        self.redis.create_agent(orchestrator)
        self.agents[orchestrator.id] = orchestrator

        # 2 Teams of 8
        for team_num in range(1, 3):
            team_id = f"team_{team_num}"
            team_lead = Agent(
                id=str(uuid.uuid4()),
                name=f"Team {team_num} Lead",
                role=AgentRole.TEAM_LEAD,
                team=team_id,
                parent_id=orchestrator.id
            )
            self.redis.create_agent(team_lead)
            self.agents[team_lead.id] = team_lead

            # 2 Sub-teams of 4 per team
            for sub_team_num in range(1, 3):
                sub_team_id = f"{team_id}_sub_{sub_team_num}"
                sub_team_lead = Agent(
                    id=str(uuid.uuid4()),
                    name=f"Team {team_num} Sub-Team {sub_team_num} Lead",
                    role=AgentRole.SUB_TEAM_LEAD,
                    team=team_id,
                    sub_team=sub_team_id,
                    parent_id=team_lead.id
                )
                self.redis.create_agent(sub_team_lead)
                self.agents[sub_team_lead.id] = sub_team_lead

                # 2 Execution sub-agents per sub-team (Purple Team)
                for exec_num in range(1, 3):
                    exec_agent = Agent(
                        id=str(uuid.uuid4()),
                        name=f"Execution Agent {team_num}.{sub_team_num}.{exec_num}",
                        role=AgentRole.EXECUTION,
                        team=team_id,
                        sub_team=sub_team_id,
                        parent_id=sub_team_lead.id
                    )
                    self.redis.create_agent(exec_agent)
                    self.agents[exec_agent.id] = exec_agent

    def get_hierarchy_summary(self):
        """Return the agent hierarchy structure"""
        orchestrators = self.redis.get_agents_by_role(AgentRole.ORCHESTRATOR)
        team_leads = self.redis.get_agents_by_role(AgentRole.TEAM_LEAD)
        sub_leads = self.redis.get_agents_by_role(AgentRole.SUB_TEAM_LEAD)
        executions = self.redis.get_agents_by_role(AgentRole.EXECUTION)

        return {
            "orchestrators": len(orchestrators),
            "team_leads": len(team_leads),
            "sub_team_leads": len(sub_leads),
            "execution_agents": len(executions),
            "total": len(orchestrators) + len(team_leads) + len(sub_leads) + len(executions)
        }

    def assign_task_to_team(self, team_id: str, task_name: str, description: str):
        """Orchestrator assigns a task to a team"""
        task = Task(
            id=str(uuid.uuid4()),
            name=task_name,
            description=description,
            assigned_to=team_id,
            status=AgentStatus.ACTIVE
        )
        self.redis.create_task(task)
        
        # Get team lead
        team_agents = self.redis.get_agents_by_team(team_id)
        if team_agents:
            team_lead = [a for a in team_agents if a.role == AgentRole.TEAM_LEAD][0]
            self.redis.publish_task(team_lead.id, task)
        
        return task

    def assign_task_to_execution(self, agent_id: str, task_name: str, description: str):
        """Assign a task directly to an execution agent"""
        task = Task(
            id=str(uuid.uuid4()),
            name=task_name,
            description=description,
            assigned_to=agent_id,
            status=AgentStatus.ACTIVE
        )
        self.redis.create_task(task)
        self.redis.publish_task(agent_id, task)
        return task

    def complete_task(self, task_id: str, result: str):
        """Mark a task as completed"""
        self.redis.update_task_status(task_id, AgentStatus.COMPLETED, result)
