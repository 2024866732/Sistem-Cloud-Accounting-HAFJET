// LoyverseSyncStatus: Sync status and logs for Loyverse POS integration
import React from 'react';

interface LoyverseSyncStatusProps {
  status: string;
  logs: string[];
}

const LoyverseSyncStatus: React.FC<LoyverseSyncStatusProps> = ({ status, logs }) => (
  <div style={{ marginTop: 24 }}>
    <div>Status: <strong>{status}</strong></div>
    <h3>Sync Logs</h3>
    <ul>{logs.map((log, i) => <li key={i}>{log}</li>)}</ul>
  </div>
);

export default LoyverseSyncStatus;
