import { useEffect, useState } from 'react';

interface Document {
  id: string;
  name: string;
  type: string | null;
  content: string;
  metadata: string;
  created_at: number;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await fetch('/api/documents');
    const data = await res.json();
    setDocuments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', type: '', content: '' });
    setShowForm(false);
    fetchDocuments();
  };

  if (loading) return <div className="empty-state">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Documents</h2>
            <p>Manage legal documents</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Upload Document'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3>Upload Document</h3>
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
              <label>Type</label>
              <input
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                placeholder="contract, brief, memo"
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea
                rows={6}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Upload</button>
          </form>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="empty-state">No documents yet. Upload one to get started.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Content Length</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td><strong>{doc.name}</strong></td>
                  <td>{doc.type || '-'}</td>
                  <td>{doc.content.length} chars</td>
                  <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}