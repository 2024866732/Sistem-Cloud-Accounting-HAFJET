import React from 'react'

export const HelpModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
  <div className="relative rounded-lg shadow-xl p-6 max-w-lg w-full transform transition-all duration-200" style={{ background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>Need help with Reports?</h3>
          {/* a11y: button must have visible text and accessible color contrast */}
          <button onClick={onClose} aria-label="Close help" className="px-3 py-2 rounded focus:outline-none focus:ring-2 font-semibold" type="button" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
            <span aria-hidden="true">Close ✕</span>
          </button>
        </div>
  <p className="text-sm mt-3" style={{ color: 'hsl(var(--muted-foreground))' }}>If you're missing data or need assistance with SST or E-Invoice submission, contact our support team or visit the documentation.</p>
        <div className="mt-4 flex space-x-3">
          {/* a11y: use accessible color contrast for button */}
          <button className="flex-1 py-2 px-3 rounded font-semibold focus:outline-none focus:ring-2" type="button" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>Contact Support</button>
          {/* a11y: use accessible color contrast for link */}
          <a className="flex-1 inline-flex items-center justify-center rounded py-2 px-3 font-semibold focus:outline-none focus:ring-2" href="/docs/reports" style={{ border: '1px solid hsl(var(--card-foreground))', color: 'hsl(var(--card-foreground))' }}>Open Docs</a>
        </div>
      </div>
    </div>
  )
}

export default HelpModal
