import { useState } from 'react';

export default function Settings() {
  const [envVars, setEnvVars] = useState({
    anthropicApiKey: '',
    cloudflareAccountId: '',
    databaseUrl: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved (demo mode - not persisted)');
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your AI Agent platform</p>
      </div>

      <div className="card">
        <h3>Environment Configuration</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Anthropic API Key</label>
            <input
              type="password"
              value={envVars.anthropicApiKey}
              onChange={e => setEnvVars({ ...envVars, anthropicApiKey: e.target.value })}
              placeholder="sk-ant-..."
            />
          </div>
          <div className="form-group">
            <label>Cloudflare Account ID</label>
            <input
              value={envVars.cloudflareAccountId}
              onChange={e => setEnvVars({ ...envVars, cloudflareAccountId: e.target.value })}
              placeholder="abc123..."
            />
          </div>
          <div className="form-group">
            <label>Database URL</label>
            <input
              value={envVars.databaseUrl}
              onChange={e => setEnvVars({ ...envVars, databaseUrl: e.target.value })}
              placeholder="file:./data.db"
            />
          </div>
          <button type="submit" className="btn btn-primary">Save Settings</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Platform Info</h3>
        <div className="form-row">
          <div>
            <label>Version</label>
            <p>1.0.0</p>
          </div>
          <div>
            <label>Runtime</label>
            <p>Cloudflare Workers</p>
          </div>
          <div>
            <label>AI Model</label>
            <p>Claude Sonnet 4</p>
          </div>
        </div>
      </div>
    </div>
  );
}