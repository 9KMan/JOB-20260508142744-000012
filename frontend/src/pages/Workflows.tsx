import { useEffect, useState } from 'react';

interface Workflow {
  id: string;
  name: string;
  steps: string;
  created_at: number;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', steps: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    const res = await fetch('/api/workflows');
    const data = await res.json();
    setWorkflows(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const steps = formData.steps ? JSON.parse(formData.steps) : [];
    await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.name, steps })
    });
    setFormData({ name: '', steps: '' });
    setShowForm(false);
    fetchWorkflows();
  };

  const executeWorkflow = async (id: string) => {
    await fetch(`/api/workflows/${id}/execute`, { method: 'POST' });
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Workflows</h2>
            <p>Automate multi-step processes</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Workflow'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3>Create New Workflow</h3>
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
              <label>Steps (JSON array)</label>
              <textarea
                rows={6}
                value={formData.steps}
                onChange={e => setFormData({ ...formData, steps: e.target.value })}
                placeholder='[{"agentId": "uuid", "input": {"query": "test"}}]'
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Workflow</button>
          </form>
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="empty-state">No workflows yet. Create one to get started.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Steps</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map(workflow => (
                <tr key={workflow.id}>
                  <td><strong>{workflow.name}</strong></td>
                  <td>{JSON.parse(workflow.steps).length} steps</td>
                  <td>{new Date(workflow.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => executeWorkflow(workflow.id)}>
                      Execute
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