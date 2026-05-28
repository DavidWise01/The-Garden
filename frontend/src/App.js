import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [hierarchy, setHierarchy] = useState(null);
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hierarchy');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [hierarchyRes, agentsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/hierarchy`),
        axios.get(`${API_URL}/agents`),
        axios.get(`${API_URL}/tasks`)
      ]);
      setHierarchy(hierarchyRes.data);
      setAgents(agentsRes.data.agents);
      setTasks(tasksRes.data.tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>16-Agent Orchestration System</h1>
      
      <div className="tabs">
        <button className={activeTab === 'hierarchy' ? 'active' : ''} onClick={() => setActiveTab('hierarchy')}>
          Hierarchy
        </button>
        <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>
          Agents ({agents.length})
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          Tasks ({tasks.length})
        </button>
      </div>

      {activeTab === 'hierarchy' && hierarchy && (
        <div className="panel">
          <h2>Agent Hierarchy</h2>
          <table>
            <tbody>
              <tr>
                <td>Orchestrators</td>
                <td className="number">{hierarchy.orchestrators}</td>
              </tr>
              <tr>
                <td>Team Leads</td>
                <td className="number">{hierarchy.team_leads}</td>
              </tr>
              <tr>
                <td>Sub-Team Leads</td>
                <td className="number">{hierarchy.sub_team_leads}</td>
              </tr>
              <tr>
                <td>Execution Agents (Purple Team)</td>
                <td className="number">{hierarchy.execution_agents}</td>
              </tr>
              <tr className="total">
                <td><strong>Total Agents</strong></td>
                <td className="number"><strong>{hierarchy.total}</strong></td>
              </tr>
            </tbody>
          </table>
          <p className="structure">Structure: 1 Orchestrator → 2 Team Leads → 2 Sub-Team Leads each → 2 Execution Agents each</p>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="panel">
          <h2>All Agents</h2>
          <table className="agents-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Team</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id} className={`role-${agent.role}`}>
                  <td>{agent.name}</td>
                  <td><span className={`badge badge-${agent.role}`}>{agent.role}</span></td>
                  <td>{agent.team || '—'}</td>
                  <td><span className={`status status-${agent.status}`}>{agent.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="panel">
          <h2>Tasks</h2>
          {tasks.length === 0 ? (
            <p>No tasks yet</p>
          ) : (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className={`status-${task.status}`}>
                    <td>{task.name}</td>
                    <td>{task.assigned_to}</td>
                    <td><span className={`status status-${task.status}`}>{task.status}</span></td>
                    <td>{task.result || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
