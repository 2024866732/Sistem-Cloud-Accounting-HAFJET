/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // sm: '640px', // default
        // md: '768px', // default
        // lg: '1024px', // default
        // xl: '1280px', // default
        '2xl': '1536px',
      },
      colors: {
        futuristic: {
          'dark': '#0a0e1a',
          'darker': '#070a13',
          'blue': {
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
          },
          'purple': {
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
          },
          'cyan': {
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
          },
          'neon-blue': '#00f6ff',
          'neon-purple': '#a855f7',
          'neon-pink': '#ff00ff',
          'neon-green': '#00ff88',
          'gray': {
            400: '#94a3b8',
            500: '#64748b',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        }
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'data-flow': 'data-flow 3s linear infinite',
        'fade-in': 'fade-in 0.3s ease-in',
        'fadeIn': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'slideDown': 'slideDown 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'reverse': 'spin 1s linear infinite reverse',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.6)' 
          },
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fadeIn': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          },
        },
        'slideDown': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 246, 255, 0.5), 0 0 20px rgba(0, 246, 255, 0.3)',
        'neon-blue': '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
        'neon-purple': '0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}

