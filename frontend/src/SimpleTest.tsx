function SimpleTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>🚀 HAFJET Bukku - Basic Test</h1>
      <p style={{ color: '#666' }}>React is working! Time: {new Date().toLocaleTimeString()}</p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h2 style={{ color: '#2563eb' }}>System Status</h2>
        <p>✅ React: Working</p>
        <p>✅ CSS: Applied</p>
        <p>✅ TypeScript: Compiled</p>
        <p>✅ Vite: Development Server</p>
      </div>
    </div>
  )
}

export default SimpleTest