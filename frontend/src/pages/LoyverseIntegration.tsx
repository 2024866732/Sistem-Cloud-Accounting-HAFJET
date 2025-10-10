// Loyverse POS Integration UI for HAFJET Cloud Accounting
// React page for OAuth setup, sync status/log, manual trigger

import React, { useState } from 'react';

const LoyverseIntegration: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Idle');
  const [logs, setLogs] = useState<string[]>([]);

  // Simulate OAuth connect
  const handleConnect = async () => {
    setConnected(true);
    setLogs(l => [...l, 'Connected to Loyverse POS']);
  };

  // Simulate manual sync
  const handleSync = async () => {
    setSyncStatus('Syncing...');
    setLogs(l => [...l, 'Sync started']);
    setTimeout(() => {
      setSyncStatus('Completed');
      setLogs(l => [...l, 'Sync completed']);
    }, 2000);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Loyverse POS Integration</h1>
      <p>Connect your Loyverse POS account and sync sales, inventory, and customers with HAFJET Cloud Accounting.</p>
      {!connected ? (
        <button onClick={handleConnect} style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: 8, padding: '12px 24px', fontWeight: 600 }}>Connect Loyverse POS</button>
      ) : (
        <>
          <div style={{ margin: '24px 0' }}>
            <button onClick={handleSync} style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', borderRadius: 8, padding: '12px 24px', fontWeight: 600 }}>Manual Sync</button>
            <span style={{ marginLeft: 16 }}>Status: {syncStatus}</span>
          </div>
          <div>
            <h3>Sync Logs</h3>
            <ul>{logs.map((log, i) => <li key={i}>{log}</li>)}</ul>
          </div>
        </>
      )}
    </div>
  );
};

export default LoyverseIntegration;
