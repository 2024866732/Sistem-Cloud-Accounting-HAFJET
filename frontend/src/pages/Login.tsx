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
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Backend authentication (customize for real API)
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          useAuthStore.getState().setUser(data.data.user);
          setSuccessMsg('Login berjaya melalui backend! Selamat datang ke HAFJET Cloud Accounting System! 🇲🇾');
          toast.success('Login berjaya melalui backend!');
          setTimeout(() => navigate('/dashboard'), 1200);
          return;
        }
      }
      // Fallback: Mock authentication
      if ((formData.email === 'admin@hafjet.com' && formData.password === 'admin123') ||
          (formData.email === 'admin' && formData.password === 'password123')) {
        const mockUser = {
          id: '1', email: formData.email, name: 'Administrator', role: 'admin' as const,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        localStorage.setItem('authToken', 'mock-jwt-token-hafjet-bukku');
        localStorage.setItem('user', JSON.stringify(mockUser));
        useAuthStore.getState().setUser(mockUser);
        setSuccessMsg('Login berjaya dengan mock! Selamat datang ke HAFJET Cloud Accounting System! 🇲🇾');
        toast.success('Login berjaya dengan mock!');
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setErrorMsg('Email atau password tidak betul. Sila cuba lagi.');
        toast.error('Email atau password tidak betul.');
      }
    } catch (err) {
      console.debug('Login error', err);
      setErrorMsg('Ralat sistem. Sila cuba lagi.');
      toast.error('Ralat sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50 flex flex-col items-center">
          {/* Branding/logo section */}
          <div className="flex flex-col items-center mb-8">
            {/* Replace with <img src="/logo.png" alt="HAFJET Logo" className="h-12 mb-2" /> if logo available */}
            <span className="text-4xl mb-2">🇲🇾</span>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Log Masuk Ke Akaun HAFJET</h1>
            <p className="text-gray-600 mt-2">Selamat datang ke Sistem Kewangan Malaysia</p>
          </div>

          {/* Error/success states */}
          {errorMsg && <div className="w-full flex items-center bg-red-100 text-red-700 rounded-lg px-4 py-2 mb-4" role="alert"><span className="material-icons mr-2">error</span>{errorMsg}</div>}
          {successMsg && <div className="w-full flex items-center bg-green-100 text-green-700 rounded-lg px-4 py-2 mb-4" role="status"><span className="material-icons mr-2">check_circle</span>{successMsg}</div>}

          <form onSubmit={handleSubmit} className="w-full space-y-6" aria-label="Login form">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M2.94 6.94A8 8 0 1117.06 17.06 8 8 0 012.94 6.94zm1.42 1.42a6 6 0 108.48 8.48 6 6 0 00-8.48-8.48zm2.12 2.12a1 1 0 011.41 0l1.41 1.41 1.41-1.41a1 1 0 111.41 1.41l-2.12 2.12a1 1 0 01-1.41 0l-2.12-2.12a1 1 0 010-1.41z"/></svg></span>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                  autoComplete="email"
                  aria-label="Email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm-2 6V6a2 2 0 114 0v2H8zm-3 2h10v6H5v-6z"/></svg></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none">
                  {showPassword ? (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3C5 3 1.73 7.11 1.73 10c0 2.89 3.27 7 8.27 7s8.27-4.11 8.27-7c0-2.89-3.27-7-8.27-7zm0 12c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-10a3 3 0 013 3c0 1.66-1.34 3-3 3s-3-1.34-3-3a3 3 0 013-3z"/></svg>
                  ) : (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3C5 3 1.73 7.11 1.73 10c0 2.89 3.27 7 8.27 7s8.27-4.11 8.27-7c0-2.89-3.27-7-8.27-7zm0 12c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-10a3 3 0 013 3c0 1.66-1.34 3-3 3s-3-1.34-3-3a3 3 0 013-3z"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center"><svg className="animate-spin mr-2" width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/></svg>Memuat...</span>
              ) : 'Log Masuk'}
            </button>

            <div className="flex items-center justify-between mt-2">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Lupa password?</a>
              <a href="/register" className="text-sm text-purple-600 hover:underline">Daftar Akaun Baru</a>
            </div>

            {/* Social login buttons (disabled for now) */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" disabled className="w-full flex items-center justify-center bg-gray-100 text-gray-400 py-2 rounded-xl border border-gray-200"><span className="mr-2"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg></span>Google</button>
              <button type="button" disabled className="w-full flex items-center justify-center bg-gray-100 text-gray-400 py-2 rounded-xl border border-gray-200"><span className="mr-2"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><rect width="20" height="20"/></svg></span>Facebook</button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">Demo: admin@hafjet.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
