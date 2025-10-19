import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      // Use environment variable for API URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Successful login
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        useAuthStore.getState().setUser(data.data.user);
        setSuccessMsg('🎉 Log masuk berjaya! Selamat datang ke HAFJET Bukku');
        toast.success('Log masuk berjaya!', { 
          icon: '✅',
          duration: 2000,
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Login failed - show friendly error message
        const friendlyMessage = data.message === 'Invalid credentials' || data.message === 'Invalid email or password'
          ? '⚠️ Email atau kata laluan tidak tepat. Sila semak dan cuba lagi.'
          : '⚠️ Log masuk tidak berjaya. Sila cuba sebentar lagi.';
        
        setErrorMsg(friendlyMessage);
        toast.error(friendlyMessage, { duration: 3000 });
      }
    } catch (err) {
      console.debug('Login error', err);
      // Friendly error message for network/connection issues
      const networkError = '🔌 Tidak dapat berhubung dengan pelayan. Sila semak sambungan internet anda dan cuba lagi.';
      setErrorMsg(networkError);
      toast.error('Sambungan ke pelayan terputus', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Main card with enhanced design */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/60 flex flex-col items-center transform transition-all duration-300 hover:shadow-3xl">
          {/* Branding/logo section with animation */}
          <div className="flex flex-col items-center mb-8 animate-fadeIn">
            {/* Logo with gradient background */}
            <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-300">
              <span className="text-4xl">🇲🇾</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center mb-2">
              HAFJET Bukku
            </h1>
            <p className="text-gray-600 text-center text-sm">Sistem Perakaunan Awan Malaysia</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🔒 Selamat & Terjamin
              </span>
            </div>
          </div>

          {/* Error/success states with better design */}
          {errorMsg && (
            <div className="w-full flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-6 animate-slideDown" role="alert">
              <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
              <span className="text-sm">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="w-full flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3 mb-6 animate-slideDown" role="status">
              <span className="text-xl flex-shrink-0 mt-0.5">✅</span>
              <span className="text-sm">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5" aria-label="Login form">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                📧 Alamat Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 group-focus-within:text-blue-600 transition-colors">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50 focus:bg-white transition-all duration-200 placeholder-gray-400"
                  placeholder="nama@contoh.com"
                  required
                  autoComplete="email"
                  aria-label="Email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                🔐 Kata Laluan
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 group-focus-within:text-purple-600 transition-colors">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-gray-50 focus:bg-white transition-all duration-200 placeholder-gray-400"
                  placeholder="Masukkan kata laluan"
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button 
                  type="button" 
                  aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'} 
                  onClick={() => setShowPassword(v => !v)} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center group hover:scale-[1.02] active:scale-[0.98] transform"
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin mr-2" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75"/>
                  </svg>
                  Sedang memproses...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span>🚀 Log Masuk</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>

            {/* Links */}
            <div className="flex items-center justify-between pt-2">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
                🔑 Lupa kata laluan?
              </a>
              <a href="/register" className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors">
                ✨ Daftar Akaun
              </a>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Atau gunakan</span>
              </div>
            </div>

            {/* Demo credentials info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span>💡</span>
                <span>Akaun Demo:</span>
              </p>
              <div className="space-y-1">
                <p className="text-xs text-gray-600">
                  <span className="font-mono bg-white px-2 py-1 rounded">admin@hafjet.com</span>
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-mono bg-white px-2 py-1 rounded">admin123</span>
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 w-full">
            <p className="text-center text-xs text-gray-500">
              © 2025 HAFJET Bukku. Sistem Perakaunan Malaysia.
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              🔒 Dilindungi dengan teknologi enkripsi terkini
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
