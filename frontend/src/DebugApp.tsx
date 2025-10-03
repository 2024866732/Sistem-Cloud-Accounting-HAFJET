import React from 'react';

const DebugApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontSize: '16px'
    }}>
      <h1 style={{ color: 'red' }}>🔥 DEBUG MODE - HAFJET Bukku System</h1>
      <p>✅ React is working!</p>
      <p>✅ Component is rendering!</p>
      <p>🚀 Frontend Server: http://localhost:5173</p>
      <p>🔧 Backend Server: http://localhost:3001</p>
      <p>📅 Current Time: {new Date().toLocaleString()}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'yellow' }}>
        <strong>If you can see this, React is working fine!</strong>
        <br />
        The blank page issue might be due to:
        <ul>
          <li>Authentication redirect loop</li>
          <li>Browser cache issue</li>
          <li>Component mounting problem</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugApp;