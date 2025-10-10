import React, { useState, useEffect } from 'react'
import { 
  Users, Plus, Edit3, Trash2, Shield, Eye,
  Search, Download, Upload, UserCheck, UserX,
  Crown, Lock, Activity, Settings, Mail
} from 'lucide-react'
import TwoFactorModal from '../components/TwoFactorModal'
import { settingsService, authService } from '../services/api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'super_admin' | 'admin' | 'manager' | 'accountant' | 'staff' | 'viewer'
  permissions: string[]
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: Date
  createdAt: Date
  department?: string
  companyId?: string
  avatar?: string
  twoFactorEnabled: boolean
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
}

interface AuditLog {
  id: string
  userId: string
  userName: string
  action: string
  resource: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  details?: object
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit' | 'settings'>('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<unknown | null>(null)
  const [twoFaModalOpen, setTwoFaModalOpen] = useState(false)
  const [qrData, setQrData] = useState<{ qr?: string; secret?: string } | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock roles
      setRoles([
        {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access and control',
          permissions: ['all'],
          color: 'from-red-500 to-red-600'
        },
        {
          id: '2',
          name: 'Admin',
          description: 'Administrative access to all modules',
          permissions: ['users.manage', 'settings.manage', 'reports.view', 'transactions.manage'],
          color: 'from-purple-500 to-purple-600'
        },
        {
          id: '3',
          name: 'Manager',
          description: 'Management level access',
          permissions: ['reports.view', 'transactions.view', 'invoices.manage', 'analytics.view'],
          color: 'from-blue-500 to-blue-600'
        },
        {
          id: '4',
          name: 'Accountant',
          description: 'Accounting and financial operations',
          permissions: ['transactions.manage', 'invoices.manage', 'reports.view'],
          color: 'from-green-500 to-green-600'
        },
        {
          id: '5',
          name: 'Staff',
          description: 'Basic operational access',
          permissions: ['transactions.create', 'invoices.create'],
          color: 'from-yellow-500 to-yellow-600'
        },
        {
          id: '6',
          name: 'Viewer',
          description: 'Read-only access',
          permissions: ['reports.view', 'transactions.view'],
          color: 'from-gray-500 to-gray-600'
        }
      ])

      // Mock users
      setUsers([
        {
          id: '1',
          name: 'Ahmad Rahman',
          email: 'ahmad.rahman@hafjet.com',
          phone: '+601234567890',
          role: 'super_admin',
          permissions: ['all'],
          status: 'active',
          lastLogin: new Date(Date.now() - 30 * 60 * 1000),
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          department: 'IT Administration',
          twoFactorEnabled: true
        },
        {
          id: '2',
          name: 'Siti Nurhaliza',
          email: 'siti.nurhaliza@hafjet.com',
          phone: '+601234567891',
          role: 'admin',
          permissions: ['users.manage', 'settings.manage', 'reports.view'],
          status: 'active',
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          department: 'Administration',
          twoFactorEnabled: true
        },
        {
          id: '3',
          name: 'Lim Wei Ming',
          email: 'lim.weiming@hafjet.com',
          phone: '+601234567892',
          role: 'manager',
          permissions: ['reports.view', 'transactions.view', 'invoices.manage'],
          status: 'active',
          lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          department: 'Finance',
          twoFactorEnabled: false
        },
        {
          id: '4',
          name: 'Kavitha Ramasamy',
          email: 'kavitha.ramasamy@hafjet.com',
          phone: '+601234567893',
          role: 'accountant',
          permissions: ['transactions.manage', 'invoices.manage', 'reports.view'],
          status: 'active',
          lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
          department: 'Accounting',
          twoFactorEnabled: true
        },
        {
          id: '5',
          name: 'David Tan',
          email: 'david.tan@hafjet.com',
          phone: '+601234567894',
          role: 'staff',
          permissions: ['transactions.create', 'invoices.create'],
          status: 'inactive',
          lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          department: 'Operations',
          twoFactorEnabled: false
        }
      ])

      // Mock audit logs
      setAuditLogs([
        {
          id: '1',
          userId: '1',
          userName: 'Ahmad Rahman',
          action: 'User Login',
          resource: 'Authentication',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 Chrome/118.0'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Siti Nurhaliza',
          action: 'Created Invoice',
          resource: 'INV-2025-001',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 Chrome/118.0'
        },
        {
          id: '3',
          userId: '3',
          userName: 'Lim Wei Ming',
          action: 'Generated Report',
          resource: 'Profit & Loss Report',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 Safari/605.1'
        }
      ])
      
      // also fetch current user from auth service if available
      try {
        const me = await authService.getCurrentUser()
        setCurrentUser(me?.data || null)
      } catch {
        // keep mock users if auth not configured in dev
        setCurrentUser(null)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.name.toLowerCase().replace(' ', '_') === role)
    return roleData?.color || 'from-gray-500 to-gray-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10'
      case 'inactive': return 'text-gray-400 bg-gray-500/10'
      case 'suspended': return 'text-red-400 bg-red-500/10'
      default: return 'text-blue-400 bg-blue-500/10'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }

  const toggle2FA = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, twoFactorEnabled: !user.twoFactorEnabled }
        : user
    ))
  }

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.name.toLowerCase().replace(' ', '_')} className="bg-gray-800">
                  {role.name}
                </option>
              ))}
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">All Status</option>
              <option value="active" className="bg-gray-800">Active</option>
              <option value="inactive" className="bg-gray-800">Inactive</option>
              <option value="suspended" className="bg-gray-800">Suspended</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              <Upload className="inline h-4 w-4 mr-2" />
              Import
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors">
              <Download className="inline h-4 w-4 mr-2" />
              Export
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
              <Plus className="inline h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <p className="text-white/60 text-sm">{user.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Role</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getRoleColor(user.role)}`}>
                  {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">2FA</span>
                <div className="flex items-center space-x-2">
                  {user.twoFactorEnabled ? (
                    <Shield className="h-4 w-4 text-green-400" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-400" />
                  )}
                  <button
                    onClick={() => toggle2FA(user.id)}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    {user.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
              
              {user.lastLogin && (
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Last Login</span>
                  <span className="text-white/60 text-xs">{getTimeAgo(user.lastLogin)}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => toggleUserStatus(user.id)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                  user.status === 'active'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {user.status === 'active' ? (
                  <>
                    <UserX className="inline h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="inline h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </button>
              
              <button className="py-2 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                <Mail className="inline h-4 w-4 mr-2" />
                Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/80 mb-2">No users found</h3>
          <p className="text-white/60">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  )

  const renderRoleManagement = () => (
    <div className="space-y-6">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">User Roles & Permissions</h3>
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
            <Plus className="inline h-4 w-4 mr-2" />
            Create Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${role.color} text-white`}>
                  <Crown className="h-6 w-6" />
                </div>
                <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
              
              <h4 className="text-white font-semibold mb-2">{role.name}</h4>
              <p className="text-white/70 text-sm mb-4">{role.description}</p>
              
              <div className="space-y-2">
                <h5 className="text-white/80 text-sm font-medium">Permissions</h5>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 3).map((permission, index) => (
                    <span key={index} className="px-2 py-1 bg-white/20 text-white/80 text-xs rounded-lg">
                      {permission}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="px-2 py-1 bg-white/20 text-white/80 text-xs rounded-lg">
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Users with this role</span>
                  <span className="text-white font-medium">
                    {users.filter(u => u.role === role.name.toLowerCase().replace(' ', '_')).length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">User Activity Audit Trail</h3>
        
        <div className="space-y-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500/20 p-2 rounded-xl">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-white font-semibold">{log.action}</h4>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                        {log.resource}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">User: </span>
                        <span className="text-white">{log.userName}</span>
                      </div>
                      <div>
                        <span className="text-white/60">IP Address: </span>
                        <span className="text-white">{log.ipAddress}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Time: </span>
                        <span className="text-white">{getTimeAgo(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
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
            👥 User Management
          </h1>
          <p className="text-white/80 text-lg">
            🔐 Comprehensive user management with role-based permissions and audit trails
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'users', label: 'Users', icon: Users, count: users.length },
              { id: 'roles', label: 'Roles & Permissions', icon: Shield, count: roles.length },
              { id: 'audit', label: 'Audit Logs', icon: Activity, count: auditLogs.length },
              { id: 'settings', label: 'Security Settings', icon: Settings, count: 0 }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'users' | 'roles' | 'audit' | 'settings')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white/30 text-white font-semibold shadow-lg'
                      : 'text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
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
              {activeTab === 'users' && renderUserManagement()}
              {activeTab === 'roles' && renderRoleManagement()}
              {activeTab === 'audit' && renderAuditLogs()}
              {activeTab === 'settings' && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-center">
                    <Settings className="h-16 w-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white/80 mb-2">Security Settings</h3>
                    <p className="text-white/60 mb-4">Manage two-factor authentication for your account.</p>
                  </div>

                  {/* 2FA Panel */}
                  <div className="max-w-xl mx-auto mt-6 space-y-4 text-left">
                    <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                      <h4 className="text-white font-semibold mb-2">Two-Factor Authentication (2FA)</h4>
                      <p className="text-white/70 text-sm mb-4">Add an extra layer of security using authenticator apps (e.g., Google Authenticator, Authy).</p>

                      {/* Show current user 2FA status from mock users */}
                      {(() => {
                        const currentUserId = (currentUser && typeof currentUser === 'object' && 'id' in (currentUser as Record<string, unknown>)) ? String((currentUser as Record<string, unknown>)['id']) : '1'
                        const me = users.find(u => u.id === currentUserId)
                        if (!me) return <p className="text-white/60">User not found</p>
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white/80">2FA Status</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${me.twoFactorEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                {me.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>

                            {!me.twoFactorEnabled ? (
                              <div className="space-y-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await settingsService.setup2FA()
                                      const payloadUnknown: unknown = (res as unknown as { data?: unknown })?.data ?? res
                                      const payload = typeof payloadUnknown === 'object' && payloadUnknown !== null ? payloadUnknown as Record<string, unknown> : {}
                                      function getString(obj: unknown, key: string): string | undefined {
                                        if (typeof obj === 'object' && obj !== null && key in (obj as Record<string, unknown>)) {
                                          const v = (obj as Record<string, unknown>)[key]
                                          return typeof v === 'string' ? v : undefined
                                        }
                                        return undefined
                                      }
                                      const qr = getString(payload, 'qr') ?? getString((payload as Record<string, unknown>)['data'], 'qr') ?? getString(payload, 'otpauth_url')
                                      const secret = getString(payload, 'secret') ?? getString((payload as Record<string, unknown>)['data'], 'secret')
                                      setQrData({ qr, secret })
                                      // open modal to show QR
                                      setTwoFaModalOpen(true)
                                    } catch (error) {
                                      console.error(error)
                                      alert('Failed to start 2FA setup')
                                    }
                                  }}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                                >
                                  Setup 2FA
                                </button>

                                <div className="pt-2">
                                  <label className="block text-white/80 text-sm mb-1">Enter code from your authenticator</label>
                                  <div className="flex space-x-2">
                                    <input id="tfacode" className="flex-1 px-3 py-2 rounded-xl bg-white/5 text-white border border-white/20" placeholder="123456" />
                                    <button
                                      onClick={async () => {
                                        const tokenInput = (document.getElementById('tfacode') as HTMLInputElement)
                                        const token = tokenInput?.value || ''
                                        try {
                                          const res = await settingsService.verify2FA({ token })
                                          const payloadUnknown: unknown = (res as unknown as { data?: unknown })?.data ?? res
                                          function hasBackupCodes(obj: unknown): obj is { backupCodes: string[] } {
                                            return typeof obj === 'object' && obj !== null && 'backupCodes' in (obj as Record<string, unknown>)
                                          }
                                          const codes = hasBackupCodes(payloadUnknown) ? (payloadUnknown as { backupCodes: string[] }).backupCodes : (Array.isArray(payloadUnknown) ? payloadUnknown : [])
                                          setBackupCodes(codes as string[])
                                          setUsers(prev => prev.map(u => u.id === '1' ? { ...u, twoFactorEnabled: true } : u))
                                          // keep the modal open so user can copy backup codes after verification
                                          setTwoFaModalOpen(true)
                                          // optionally notify the user (kept for parity with UI flow)
                                          if (typeof window !== 'undefined' && typeof window.alert === 'function') {
                                            window.alert('2FA enabled')
                                          }
                                        } catch (err) {
                                          console.error(err)
                                          alert('Invalid token or verification failed')
                                        }
                                      }}
                                      className="bg-green-600 text-white px-4 py-2 rounded-xl"
                                    >
                                      Verify & Enable
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-white/70 text-sm">2FA is currently enabled for your account. You can disable it below.</p>
                                <button
                                  onClick={async () => {
                                    try {
                                      await settingsService.disable2FA()
                                      setUsers(prev => prev.map(u => u.id === '1' ? { ...u, twoFactorEnabled: false } : u))
                                      alert('2FA disabled')
                                    } catch (err) {
                                      console.error(err)
                                      alert('Failed to disable 2FA')
                                    }
                                  }}
                                  className="bg-red-600 text-white px-4 py-2 rounded-xl"
                                >
                                  Disable 2FA
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <TwoFactorModal
          open={twoFaModalOpen}
          onClose={() => setTwoFaModalOpen(false)}
          qrDataUrl={qrData?.qr}
          secret={qrData?.secret}
          backupCodes={backupCodes}
        />

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
          <p className="text-white/60 text-sm">
            👥 {users.length} total users | 
            🔐 {users.filter(u => u.twoFactorEnabled).length} with 2FA enabled | 
            📊 {auditLogs.length} recent activities logged
          </p>
        </div>
      </div>
    </div>
  )
}

export default UserManagement