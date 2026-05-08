import { useEffect, useState } from 'react';

interface Stats {
  agents: number;
  tasks: number;
  workflows: number;
  documents: number;
  pendingTasks: number;
  completedTasks: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    agents: 0,
    tasks: 0,
    workflows: 0,
    documents: 0,
    pendingTasks: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/workflows').then(r => r.json()),
      fetch('/api/documents').then(r => r.json())
    ]).then(([agents, tasks, workflows, documents]) => {
      setStats({
        agents: Array.isArray(agents) ? agents.length : 0,
        tasks: Array.isArray(tasks) ? tasks.length : 0,
        workflows: Array.isArray(workflows) ? workflows.length : 0,
        documents: Array.isArray(documents) ? documents.length : 0,
        pendingTasks: Array.isArray(tasks) ? tasks.filter((t: { status: string }) => t.status === 'pending').length : 0,
        completedTasks: Array.isArray(tasks) ? tasks.filter((t: { status: string }) => t.status === 'completed').length : 0
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="empty-state">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your AI Agent platform</p>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{stats.agents}</div>
          <div className="stat-label">Active Agents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.tasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingTasks}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completedTasks}</div>
          <div className="stat-label">Completed Tasks</div>
        </div>
      </div>

      <div className="form-row">
        <div className="card">
          <h3>Recent Activity</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Task history will appear here</p>
        </div>
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => window.location.href = '/agents'}>
              Create Agent
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/workflows'}>
              New Workflow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}