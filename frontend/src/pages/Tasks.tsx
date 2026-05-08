import { useEffect, useState } from 'react';

interface Task {
  id: string;
  agent_id: string;
  status: string;
  input: string;
  output: string | null;
  error: string | null;
  created_at: number;
  completed_at: number | null;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    const url = filter ? `/api/tasks?status=${filter}` : '/api/tasks';
    const res = await fetch(url);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  };

  const executeTask = async (id: string) => {
    await fetch(`/api/tasks/${id}/execute`, { method: 'POST' });
    fetchTasks();
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'badge-pending',
      completed: 'badge-success',
      failed: 'badge-failed'
    };
    return <span className={`badge ${classes[status] || ''}`}>{status}</span>;
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Tasks</h2>
            <p>Manage and execute tasks</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">No tasks found</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Agent ID</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.id.slice(0, 8)}...</td>
                  <td>{task.agent_id.slice(0, 8)}...</td>
                  <td>{getStatusBadge(task.status)}</td>
                  <td>{new Date(task.created_at).toLocaleString()}</td>
                  <td>
                    <div className="actions">
                      {task.status === 'pending' && (
                        <button className="btn btn-primary" onClick={() => executeTask(task.id)}>
                          Execute
                        </button>
                      )}
                    </div>
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