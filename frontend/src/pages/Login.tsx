import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({
    email: 'admin@hafjet.com',
    password: 'admin123'
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // First try to connect to the backend API
      console.log('🔄 Attempting backend authentication...')
      
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Backend authentication successful:', data)
          
          if (data.success) {
            // Store real token and user data from backend
            localStorage.setItem('authToken', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
            
            // Update auth store
            useAuthStore.getState().setUser(data.data.user)

            toast.success('Login berjaya melalui backend! Selamat datang ke HAFJET Cloud Accounting System! 🇲🇾')
            navigate('/dashboard')
            return
          }
        } else {
          console.log('❌ Backend authentication failed:', response.status)
        }
      } catch (backendError) {
        console.log('🔄 Backend connection failed, falling back to mock authentication:', backendError)
      }

      // Fallback: Mock authentication for testing since backend might have connection issues
      if ((formData.email === 'admin@hafjet.com' && formData.password === 'admin123') ||
          (formData.email === 'admin' && formData.password === 'password123')) {
        console.log('✅ Using mock authentication')
        
        // Simulate successful login with mock data
        const mockUser = {
          id: '1',
          email: formData.email,
          name: 'Administrator',
          role: 'admin' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Store mock token and user data
        localStorage.setItem('authToken', 'mock-jwt-token-hafjet-bukku')
        localStorage.setItem('user', JSON.stringify(mockUser))
        
        // Update auth store manually
        useAuthStore.getState().setUser(mockUser)

        toast.success('Login berjaya dengan mock! Selamat datang ke HAFJET Cloud Accounting System! 🇲🇾')
        navigate('/dashboard')
      } else {
        toast.error('Email atau password tidak betul. Sila cuba lagi.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Ralat sistem. Sila cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🇲🇾 HAFJET Cloud Accounting System
            </h1>
            <p className="text-gray-600 mt-2">Sistem Kewangan Malaysia</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Memuat...' : 'Log Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Demo: admin@hafjet.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}