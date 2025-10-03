import { useState } from 'react'

function TestApp() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f8ff',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <div style={{
        border: '3px solid #ff0000',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#cc0000', textAlign: 'center' }}>
          🇲🇾 HAFJET Bukku React Test
        </h1>
        
        <div style={{ 
          backgroundColor: '#e6f3ff', 
          padding: '15px', 
          margin: '20px 0',
          borderRadius: '5px'
        }}>
          <h2>✅ React is Working!</h2>
          <p><strong>Status:</strong> Frontend is successfully rendering React components</p>
          <p><strong>Port:</strong> http://localhost:5173</p>
          <p><strong>Backend:</strong> http://localhost:3001</p>
        </div>

        <div style={{ 
          backgroundColor: '#ffe6e6', 
          padding: '15px', 
          margin: '20px 0',
          borderRadius: '5px'
        }}>
          <h3>🧪 Interactive Test</h3>
          <p>Counter: <strong style={{ fontSize: '24px' }}>{count}</strong></p>
          <button 
            onClick={() => setCount(count + 1)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#cc0000',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Click Me! (+1)
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#e6ffe6', 
          padding: '15px', 
          borderRadius: '5px'
        }}>
          <h3>✅ All Systems Check</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ HTML Rendering</li>
            <li>✅ CSS Styling</li>
            <li>✅ JavaScript</li>
            <li>✅ React Components</li>
            <li>✅ React State (useState)</li>
            <li>✅ Event Handlers</li>
          </ul>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p><em>If you can see this page and the counter works, React is fully functional!</em></p>
        </div>
      </div>
    </div>
  )
}

export default TestApp