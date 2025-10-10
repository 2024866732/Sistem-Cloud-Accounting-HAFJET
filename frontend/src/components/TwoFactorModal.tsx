import React from 'react'

interface Props {
  open: boolean
  onClose: () => void
  qrDataUrl?: string
  secret?: string
  backupCodes?: string[]
}

const TwoFactorModal: React.FC<Props> = ({ open, onClose, qrDataUrl, secret, backupCodes }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="space-y-4 text-gray-800 dark:text-gray-200">
          {qrDataUrl ? (
            <div className="flex items-center space-x-4">
              <img src={qrDataUrl} alt="2FA QR" className="w-32 h-32 bg-white p-2 rounded-md" />
              <div>
                <p className="text-sm">Scan this QR with your authenticator app.</p>
                {secret && (
                  <div className="mt-2 text-sm">
                    <div className="font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md inline-block">{secret}</div>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(secret) }}
                      className="ml-2 text-xs text-blue-600"
                    >Copy</button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {backupCodes && backupCodes.length > 0 && (
            <div>
              <h4 className="font-medium">Backup codes</h4>
              <p className="text-sm mb-2">Store these in a safe place. Each code can be used once.</p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((c, i) => (
                  <div key={i} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm flex justify-between items-center">
                    <span>{c}</span>
                    <button onClick={() => navigator.clipboard?.writeText(c)} className="text-xs text-blue-600 ml-2">Copy</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-right">
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorModal
