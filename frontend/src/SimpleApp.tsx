import React from 'react'
import './index.css'

function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-6">
            🏢 HAFJET Bukku - Test Page
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">✅ System Status</h2>
              <p className="text-white/80">Frontend is working perfectly!</p>
            </div>
            <div className="bg-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🔧 Debug Info</h2>
              <p className="text-white/80">React app rendering successfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleApp