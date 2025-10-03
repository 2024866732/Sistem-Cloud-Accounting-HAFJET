import React, { useState, useEffect } from 'react'
import { 
  Smartphone, Shield, Key, QrCode, Copy, Check,
  AlertCircle, CheckCircle, Download,
  Mail, MessageSquare
} from 'lucide-react'

interface TwoFactorMethod {
  id: string
  name: string
  type: 'authenticator' | 'sms' | 'email' | 'backup_codes'
  description: string
  icon: React.ReactNode
  enabled: boolean
  lastUsed?: Date
  setupRequired: boolean
}

interface BackupCode {
  code: string
  used: boolean
  usedAt?: Date
}

const TwoFactorAuth: React.FC = () => {
  const [activeMethod, setActiveMethod] = useState<string>('authenticator')
  const [setupStep, setSetupStep] = useState<'select' | 'setup' | 'verify' | 'complete'>('select')
  const [secretKey, setSecretKey] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [copied, setCopied] = useState<string>('')
  const [methods, setMethods] = useState<TwoFactorMethod[]>([])

  useEffect(() => {
    // Initialize 2FA methods
    setMethods([
      {
        id: 'authenticator',
        name: 'Authenticator App',
        type: 'authenticator',
        description: 'Use Google Authenticator, Authy, or similar apps',
        icon: <Smartphone className="h-6 w-6" />,
        enabled: false,
        setupRequired: true
      },
      {
        id: 'sms',
        name: 'SMS Text Message',
        type: 'sms',
        description: 'Receive codes via SMS to your phone',
        icon: <MessageSquare className="h-6 w-6" />,
        enabled: false,
        setupRequired: true
      },
      {
        id: 'email',
        name: 'Email Verification',
        type: 'email',
        description: 'Receive codes via email',
        icon: <Mail className="h-6 w-6" />,
        enabled: true,
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        setupRequired: false
      },
      {
        id: 'backup_codes',
        name: 'Backup Codes',
        type: 'backup_codes',
        description: 'One-time use codes for emergency access',
        icon: <Key className="h-6 w-6" />,
        enabled: false,
        setupRequired: true
      }
    ])

    // Generate mock secret
    setSecretKey('JBSWY3DPEHPK3PXP')

    // Generate backup codes
    setBackupCodes([
      { code: '98765432', used: false },
      { code: '87654321', used: false },
      { code: '76543210', used: false },
      { code: '65432109', used: false },
      { code: '54321098', used: false },
      { code: '43210987', used: true, usedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { code: '32109876', used: false },
      { code: '21098765', used: false },
      { code: '10987654', used: false },
      { code: '09876543', used: false }
    ])
  }, [])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSetupMethod = (methodId: string) => {
    setActiveMethod(methodId)
    setSetupStep('setup')
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) return

    setIsVerifying(true)
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update method as enabled
    setMethods(prev => prev.map(method =>
      method.id === activeMethod
        ? { ...method, enabled: true, setupRequired: false, lastUsed: new Date() }
        : method
    ))
    
    setIsVerifying(false)
    setSetupStep('complete')
  }

  const generateNewBackupCodes = () => {
    const newCodes = Array.from({ length: 10 }, () => ({
      code: Math.random().toString().slice(2, 10),
      used: false
    }))
    setBackupCodes(newCodes)
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes
      .map(backup => `${backup.code}${backup.used ? ' (USED)' : ''}`)
      .join('\n')
    
    const blob = new Blob([`HAFJET Cloud Accounting System Backup Codes\n\n${codesText}\n\nKeep these codes safe and secure!`], {
      type: 'text/plain'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hafjet-bukku-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleMethod = (methodId: string) => {
    setMethods(prev => prev.map(method =>
      method.id === methodId
        ? { ...method, enabled: !method.enabled }
        : method
    ))
  }

  const renderMethodSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {methods.map((method) => (
        <div key={method.id} className="bg-white/10 rounded-xl p-6 border border-white/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                {method.icon}
              </div>
              <div>
                <h3 className="text-white font-semibold">{method.name}</h3>
                <p className="text-white/70 text-sm">{method.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {method.enabled ? (
                <span className="flex items-center space-x-1 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Enabled</span>
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Disabled</span>
              )}
            </div>
          </div>
          
          {method.lastUsed && (
            <p className="text-white/60 text-xs mb-4">
              Last used: {method.lastUsed.toLocaleString()}
            </p>
          )}
          
          <div className="flex space-x-3">
            {method.setupRequired ? (
              <button
                onClick={() => handleSetupMethod(method.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Set Up
              </button>
            ) : (
              <button
                onClick={() => toggleMethod(method.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  method.enabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {method.enabled ? 'Disable' : 'Enable'}
              </button>
            )}
            
            {method.type === 'backup_codes' && (
              <button
                onClick={downloadBackupCodes}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <Download className="inline h-4 w-4 mr-1" />
                Download
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderAuthenticatorSetup = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 rounded-xl p-8 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          Set up Authenticator App
        </h3>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <QrCode className="h-32 w-32 text-gray-800" />
            </div>
            <p className="text-white/80 text-sm">
              Scan this QR code with your authenticator app
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Or enter this key manually:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={secretKey}
                  readOnly
                  className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(secretKey, 'secret')}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {copied === 'secret' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Enter verification code:
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setSetupStep('select')}
              className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || isVerifying}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify & Enable'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderComplete = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-8">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Setup Complete!</h3>
        <p className="text-white/80 mb-6">
          Two-factor authentication has been enabled for your account.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={generateNewBackupCodes}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Backup Codes
          </button>
          
          <button
            onClick={() => setSetupStep('select')}
            className="w-full bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Settings
          </button>
        </div>
      </div>
    </div>
  )

  const renderBackupCodes = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Backup Codes</h3>
          <div className="flex space-x-3">
            <button
              onClick={generateNewBackupCodes}
              className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              Generate New
            </button>
            <button
              onClick={downloadBackupCodes}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Download className="inline h-4 w-4 mr-1" />
              Download
            </button>
          </div>
        </div>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium text-sm">Important:</p>
              <p className="text-yellow-300 text-sm">
                Each backup code can only be used once. Store them securely and don't share them.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {backupCodes.map((backup, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border font-mono text-center ${
                backup.used
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 line-through'
                  : 'bg-green-500/10 border-green-500/30 text-green-400'
              }`}
            >
              {backup.code}
              {backup.used && backup.usedAt && (
                <p className="text-xs text-red-300 mt-1">
                  Used {backup.usedAt.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            {backupCodes.filter(b => !b.used).length} of {backupCodes.length} codes remaining
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔐 Two-Factor Authentication
          </h1>
          <p className="text-white/80 text-lg">
            🛡️ Enhance your account security with additional verification methods
          </p>
        </div>

        {/* Security Status */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Security Status</h3>
                <p className="text-white/70">
                  {methods.filter(m => m.enabled).length} of {methods.length} methods enabled
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">
                  {methods.some(m => m.enabled) ? 'Protected' : 'Vulnerable'}
                </p>
                <p className="text-white/60 text-sm">Account Security</p>
              </div>
              
              <div className={`h-3 w-3 rounded-full ${
                methods.filter(m => m.enabled).length >= 2 ? 'bg-green-400' :
                methods.some(m => m.enabled) ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30">
          {setupStep === 'select' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Choose Authentication Methods</h2>
              {renderMethodSelection()}
            </div>
          )}
          
          {setupStep === 'setup' && activeMethod === 'authenticator' && renderAuthenticatorSetup()}
          {setupStep === 'complete' && renderComplete()}
          
          {activeMethod === 'backup_codes' && setupStep === 'select' && renderBackupCodes()}
        </div>

        {/* Quick Actions */}
        {setupStep === 'select' && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
            <p className="text-white/60 text-sm">
              🔒 Enable at least 2 methods for optimal security | 
              📱 Authenticator apps are recommended | 
              💾 Always keep backup codes safe
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TwoFactorAuth