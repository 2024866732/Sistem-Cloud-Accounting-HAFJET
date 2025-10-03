function TempApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">🚀 HAFJET Bukku - Basic Test</h1>
      <p className="text-gray-700 mb-4">Frontend is working! Current time: {new Date().toLocaleString()}</p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-3">System Status:</h2>
        <ul className="space-y-2">
          <li>✅ React 18 - Working</li>
          <li>✅ TypeScript - Compiled</li>
          <li>✅ Tailwind CSS - Styled</li>
          <li>✅ Vite - Hot Reload</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          Once you see this, we know the basic React setup is working.
          We can then gradually add back the complex components.
        </p>
      </div>
    </div>
  )
}

export default TempApp