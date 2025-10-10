// LoyverseSyncLog: UI page to view sync logs/history/errors
import React, { useEffect, useState } from 'react';

const LoyverseSyncLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // TODO: Fetch logs from backend API
    setLogs(['[2025-10-09T10:00:00Z] Sync started', '[2025-10-09T10:00:02Z] Sync completed']);
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Loyverse Sync Log</h1>
      <ul>{logs.map((log, i) => <li key={i}>{log}</li>)}</ul>
    </div>
  );
};

export default LoyverseSyncLog;
