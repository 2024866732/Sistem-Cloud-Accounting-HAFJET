import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Initialize Sentry for frontend error tracking if DSN provided
if (import.meta.env.VITE_SENTRY_DSN) {
  // Dynamic import to avoid requiring the package when not configured
  import('@sentry/react').then(Sentry => {
    import('@sentry/tracing').then(Tracing => {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE || 'development',
        integrations: [new Tracing.BrowserTracing()],
        tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.0')
      });
    });
  }).catch(err => console.warn('Sentry not initialized:', err));
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  console.error('Root element not found!')
}
