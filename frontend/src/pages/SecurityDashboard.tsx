import React, { useState, useEffect } from 'react'
import { 
  Shield, Eye, AlertTriangle, UserCheck, Globe,
  Smartphone, Key, Settings, Activity, CheckCircle,
  XCircle, Clock, MapPin, Monitor, Database,
  FileText, Search
} from 'lucide-react'

interface SecurityEvent {
  id: string
  type: 'login_success' | 'login_failed' | 'password_change' | 'ip_blocked' | 'suspicious_activity' | '2fa_enabled' | 'data_access'
  user: string
  timestamp: Date
  ipAddress: string
  location: string
  device: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details: string
  status: 'resolved' | 'investigating' | 'open'
}

interface SecurityPolicy {
  id: string
  name: string
  description: string
  enabled: boolean
  category: 'authentication' | 'access_control' | 'data_protection' | 'monitoring'
  lastUpdated: Date
  appliedTo: string[]
}

interface ThreatAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'brute_force' | 'suspicious_login' | 'data_breach' | 'malware' | 'policy_violation'
  timestamp: Date
  affectedUsers: string[]
  status: 'active' | 'resolved' | 'investigating'
  recommendations: string[]
}

interface SessionInfo {
  id: string
  userId: string
  userName: string
  ipAddress: string
  location: string
  device: string
  browser: string
  loginTime: Date
  lastActivity: Date
  status: 'active' | 'expired' | 'terminated'
  is2FAEnabled: boolean
}

const SecurityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'policies' | 'threats' | 'sessions' | 'compliance'>('overview')
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([])
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([])
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterTimeRange, setFilterTimeRange] = useState<string>('24h')

  useEffect(() => {
    const fetchSecurityData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock security events
      setSecurityEvents([
        {
          id: '1',
          type: 'login_success',
          user: 'Ahmad Rahman',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ipAddress: '192.168.1.100',
          location: 'Kuala Lumpur, MY',
          device: 'Windows 11 - Chrome',
          severity: 'low',
          details: 'Successful login with 2FA verification',
          status: 'resolved'
        },
        {
          id: '2',
          type: 'login_failed',
          user: 'Unknown',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: '103.45.67.89',
          location: 'Unknown, CN',
          device: 'Unknown',
          severity: 'high',
          details: 'Multiple failed login attempts for admin@hafjet.com',
          status: 'investigating'
        },
        {
          id: '3',
          type: 'suspicious_activity',
          user: 'Siti Nurhaliza',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          ipAddress: '192.168.1.101',
          location: 'Penang, MY',
          device: 'iPhone 15 - Safari',
          severity: 'medium',
          details: 'Unusual data access pattern detected',
          status: 'open'
        },
        {
          id: '4',
          type: '2fa_enabled',
          user: 'David Tan',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          ipAddress: '192.168.1.102',
          location: 'Johor Bahru, MY',
          device: 'MacBook Pro - Safari',
          severity: 'low',
          details: 'Two-factor authentication enabled for account',
          status: 'resolved'
        },
        {
          id: '5',
          type: 'ip_blocked',
          user: 'System',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          ipAddress: '45.67.89.123',
          location: 'Unknown, RU',
          device: 'Automated',
          severity: 'critical',
          details: 'IP address blocked due to repeated brute force attempts',
          status: 'resolved'
        }
      ])

      // Mock security policies
      setSecurityPolicies([
        {
          id: '1',
          name: 'Strong Password Policy',
          description: 'Enforce minimum 12 characters with special characters and numbers',
          enabled: true,
          category: 'authentication',
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          appliedTo: ['All Users']
        },
        {
          id: '2',
          name: 'Two-Factor Authentication',
          description: 'Require 2FA for all administrative accounts',
          enabled: true,
          category: 'authentication',
          lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          appliedTo: ['Administrators', 'Managers']
        },
        {
          id: '3',
          name: 'IP Whitelist Restriction',
          description: 'Allow access only from approved IP addresses',
          enabled: false,
          category: 'access_control',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          appliedTo: ['Finance Team']
        },
        {
          id: '4',
          name: 'Session Timeout',
          description: 'Automatic logout after 30 minutes of inactivity',
          enabled: true,
          category: 'access_control',
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          appliedTo: ['All Users']
        },
        {
          id: '5',
          name: 'Data Encryption',
          description: 'Encrypt all sensitive data at rest and in transit',
          enabled: true,
          category: 'data_protection',
          lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          appliedTo: ['System Wide']
        },
        {
          id: '6',
          name: 'Audit Logging',
          description: 'Log all user activities and system changes',
          enabled: true,
          category: 'monitoring',
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          appliedTo: ['All Users']
        }
      ])

      // Mock threat alerts
      setThreatAlerts([
        {
          id: '1',
          title: 'Brute Force Attack Detected',
          description: 'Multiple failed login attempts from IP 103.45.67.89',
          severity: 'critical',
          category: 'brute_force',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          affectedUsers: ['admin@hafjet.com'],
          status: 'investigating',
          recommendations: [
            'Block suspicious IP address',
            'Enable account lockout policy',
            'Review access logs for patterns'
          ]
        },
        {
          id: '2',
          title: 'Unusual Data Access Pattern',
          description: 'User accessing large amounts of financial data outside normal hours',
          severity: 'medium',
          category: 'suspicious_login',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          affectedUsers: ['siti.nurhaliza@hafjet.com'],
          status: 'investigating',
          recommendations: [
            'Contact user to verify legitimate access',
            'Review data access permissions',
            'Monitor future activities'
          ]
        },
        {
          id: '3',
          title: 'Weak Password Policy Violation',
          description: '5 users still using passwords that do not meet security requirements',
          severity: 'medium',
          category: 'policy_violation',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          affectedUsers: ['user1@hafjet.com', 'user2@hafjet.com', 'user3@hafjet.com'],
          status: 'active',
          recommendations: [
            'Force password reset for affected users',
            'Send security awareness training',
            'Implement stricter password validation'
          ]
        }
      ])

      // Mock active sessions
      setActiveSessions([
        {
          id: '1',
          userId: '1',
          userName: 'Ahmad Rahman',
          ipAddress: '192.168.1.100',
          location: 'Kuala Lumpur, MY',
          device: 'Windows 11',
          browser: 'Chrome 118.0',
          loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          status: 'active',
          is2FAEnabled: true
        },
        {
          id: '2',
          userId: '2',
          userName: 'Siti Nurhaliza',
          ipAddress: '192.168.1.101',
          location: 'Penang, MY',
          device: 'iPhone 15',
          browser: 'Safari 17.0',
          loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 15 * 60 * 1000),
          status: 'active',
          is2FAEnabled: true
        },
        {
          id: '3',
          userId: '3',
          userName: 'Lim Wei Ming',
          ipAddress: '192.168.1.102',
          location: 'Johor Bahru, MY',
          device: 'MacBook Pro',
          browser: 'Safari 17.0',
          loginTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 45 * 60 * 1000),
          status: 'active',
          is2FAEnabled: false
        }
      ])

      setLoading(false)
    }

    fetchSecurityData()
  }, [])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'login_failed': return <XCircle className="h-5 w-5 text-red-400" />
      case 'password_change': return <Key className="h-5 w-5 text-blue-400" />
      case 'ip_blocked': return <Shield className="h-5 w-5 text-red-400" />
      case 'suspicious_activity': return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case '2fa_enabled': return <Smartphone className="h-5 w-5 text-green-400" />
      case 'data_access': return <Database className="h-5 w-5 text-blue-400" />
      default: return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-500/10'
      case 'resolved': return 'text-green-400 bg-green-500/10'
      case 'investigating': return 'text-yellow-400 bg-yellow-500/10'
      case 'open': return 'text-blue-400 bg-blue-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const togglePolicy = (policyId: string) => {
    setSecurityPolicies(prev => prev.map(policy =>
      policy.id === policyId
        ? { ...policy, enabled: !policy.enabled, lastUpdated: new Date() }
        : policy
    ))
  }

  const terminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.map(session =>
      session.id === sessionId
        ? { ...session, status: 'terminated' }
        : session
    ))
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Threat Level</p>
              <p className="text-2xl font-bold text-yellow-400">Medium</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Active Sessions</p>
              <p className="text-2xl font-bold text-green-400">{activeSessions.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <UserCheck className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Security Events (24h)</p>
              <p className="text-2xl font-bold text-blue-400">{securityEvents.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Security Policies</p>
              <p className="text-2xl font-bold text-purple-400">{securityPolicies.filter(p => p.enabled).length}/{securityPolicies.length}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Threats */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">🚨 Active Security Threats</h3>
        <div className="space-y-4">
          {threatAlerts.filter(alert => alert.status === 'active' || alert.status === 'investigating').slice(0, 3).map((alert) => (
            <div key={alert.id} className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white mb-1">{alert.title}</h4>
                  <p className="text-white/70 text-sm">{alert.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">
                  {alert.timestamp.toLocaleString()}
                </span>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Investigate →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">📋 Recent Security Events</h3>
        <div className="space-y-4">
          {securityEvents.slice(0, 5).map((event) => (
            <div key={event.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-start space-x-4">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{event.user}</h4>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{event.details}</p>
                  <div className="flex items-center space-x-4 text-xs text-white/60">
                    <span>📍 {event.location}</span>
                    <span>🌐 {event.ipAddress}</span>
                    <span>⏰ {event.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecurityEvents = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <select 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" className="bg-gray-800">All Severity</option>
            <option value="critical" className="bg-gray-800">Critical</option>
            <option value="high" className="bg-gray-800">High</option>
            <option value="medium" className="bg-gray-800">Medium</option>
            <option value="low" className="bg-gray-800">Low</option>
          </select>

          <select 
            value={filterTimeRange}
            onChange={(e) => setFilterTimeRange(e.target.value)}
            className="bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h" className="bg-gray-800">Last Hour</option>
            <option value="24h" className="bg-gray-800">Last 24 Hours</option>
            <option value="7d" className="bg-gray-800">Last 7 Days</option>
            <option value="30d" className="bg-gray-800">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">Security Events Log</h3>
        <div className="space-y-4">
          {securityEvents.map((event) => (
            <div key={event.id} className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-start space-x-4">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-white font-semibold">{event.user}</h4>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3">{event.details}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-white/60">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>{event.ipAddress}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Monitor className="h-3 w-3" />
                      <span>{event.device}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecurityPolicies = () => (
    <div className="space-y-6">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Security Policies Configuration</h3>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
            <Settings className="inline h-4 w-4 mr-2" />
            Configure
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {securityPolicies.map((policy) => (
            <div key={policy.id} className="bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{policy.name}</h4>
                  <p className="text-white/70 text-sm mb-3">{policy.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-white/60">
                    <span>Category: {policy.category.replace('_', ' ')}</span>
                    <span>Updated: {policy.lastUpdated.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => togglePolicy(policy.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    policy.enabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      policy.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-white/80 text-sm font-medium">Applied to:</h5>
                <div className="flex flex-wrap gap-2">
                  {policy.appliedTo.map((target, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                      {target}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderActiveSessions = () => (
    <div className="space-y-6">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">Active User Sessions</h3>
        
        <div className="space-y-4">
          {activeSessions.filter(session => session.status === 'active').map((session) => (
            <div key={session.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {session.userName.charAt(0)}
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold">{session.userName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-white/70 mt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>{session.ipAddress}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Monitor className="h-3 w-3" />
                        <span>{session.device}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {session.is2FAEnabled ? (
                        <Shield className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      )}
                      <span className="text-sm text-white/80">
                        {session.is2FAEnabled ? '2FA Enabled' : '2FA Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      Last activity: {Math.floor((Date.now() - session.lastActivity.getTime()) / (1000 * 60))} min ago
                    </p>
                  </div>
                  
                  <button
                    onClick={() => terminateSession(session.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Terminate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🛡️ Security Dashboard
          </h1>
          <p className="text-white/80 text-lg">
            🔒 Advanced security monitoring and threat protection for HAFJET Cloud Accounting System
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Security Overview', icon: Shield },
              { id: 'events', label: 'Security Events', icon: Activity },
              { id: 'policies', label: 'Security Policies', icon: Settings },
              { id: 'threats', label: 'Threat Alerts', icon: AlertTriangle },
              { id: 'sessions', label: 'Active Sessions', icon: UserCheck },
              { id: 'compliance', label: 'Compliance', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'events' | 'policies' | 'threats' | 'sessions' | 'compliance')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white/30 text-white font-semibold shadow-lg'
                      : 'text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'events' && renderSecurityEvents()}
              {activeTab === 'policies' && renderSecurityPolicies()}
              {activeTab === 'threats' && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-center">
                  <AlertTriangle className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white/80 mb-2">Threat Intelligence</h3>
                  <p className="text-white/60">Advanced threat detection and response system coming soon.</p>
                </div>
              )}
              {activeTab === 'sessions' && renderActiveSessions()}
              {activeTab === 'compliance' && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-center">
                  <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white/80 mb-2">Compliance Monitoring</h3>
                  <p className="text-white/60">Malaysian regulatory compliance tracking and reporting.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
          <p className="text-white/60 text-sm">
            🛡️ Security Level: Medium | 
            🔍 {securityEvents.length} events monitored | 
            🚨 {threatAlerts.filter(a => a.status === 'active').length} active threats | 
            👥 {activeSessions.filter(s => s.status === 'active').length} active sessions
          </p>
        </div>
      </div>
    </div>
  )
}

export default SecurityDashboard