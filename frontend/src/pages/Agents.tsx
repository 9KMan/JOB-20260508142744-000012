import { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  tools: string;
  created_at: number;
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', systemPrompt: '', tools: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tools = formData.tools ? formData.tools.split(',').map(t => t.trim()) : [];
    await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, tools })
    });
    setFormData({ name: '', description: '', systemPrompt: '', tools: '' });
    setShowForm(false);
    fetchAgents();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this agent?')) {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      fetchAgents();
    }
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Agents</h2>
            <p>Manage your AI agents</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Agent'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3>Create New Agent</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>System Prompt</label>
              <textarea
                rows={4}
                value={formData.systemPrompt}
                onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Tools (comma-separated)</label>
              <input
                value={formData.tools}
                onChange={e => setFormData({ ...formData, tools: e.target.value })}
                placeholder="document_search, contract_analysis"
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Agent</button>
          </form>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="empty-state">No agents yet. Create one to get started.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Tools</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent.id}>
                  <td><strong>{agent.name}</strong></td>
                  <td>{agent.description || '-'}</td>
                  <td>{agent.tools ? JSON.parse(agent.tools).join(', ') : '-'}</td>
                  <td>{new Date(agent.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => handleDelete(agent.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}