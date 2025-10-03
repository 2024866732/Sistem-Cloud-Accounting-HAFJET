import React, { useState, useEffect } from 'react'
import { 
  Globe, Shield, Plus, Trash2, Edit3, X,
  MapPin, Clock, Activity, AlertTriangle, CheckCircle,
  Search, Download, Upload, Settings
} from 'lucide-react'

interface IPRule {
  id: string
  name: string
  ipAddress: string
  type: 'allow' | 'block'
  category: 'whitelist' | 'blacklist' | 'geofence'
  description: string
  createdAt: Date
  lastMatched?: Date
  enabled: boolean
  appliedTo: string[]
  priority: number
}

interface AccessAttempt {
  id: string
  ipAddress: string
  location: string
  timestamp: Date
  status: 'allowed' | 'blocked' | 'flagged'
  userAgent: string
  username?: string
  reason: string
  ruleId?: string
}

interface GeoLocation {
  country: string
  region: string
  city: string
  countryCode: string
  blocked: boolean
  allowedUsers: string[]
}

const IPAccessControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'attempts' | 'geo' | 'settings'>('rules')
  const [ipRules, setIPRules] = useState<IPRule[]>([])
  const [accessAttempts, setAccessAttempts] = useState<AccessAttempt[]>([])
  const [geoLocations, setGeoLocations] = useState<GeoLocation[]>([])
  const [showAddRule, setShowAddRule] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const [newRule, setNewRule] = useState({
    name: '',
    ipAddress: '',
    type: 'allow' as 'allow' | 'block',
    category: 'whitelist' as 'whitelist' | 'blacklist' | 'geofence',
    description: '',
    appliedTo: [] as string[],
    priority: 1
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock IP rules
      setIPRules([
        {
          id: '1',
          name: 'Office Network',
          ipAddress: '192.168.1.0/24',
          type: 'allow',
          category: 'whitelist',
          description: 'Main office network range',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastMatched: new Date(Date.now() - 2 * 60 * 60 * 1000),
          enabled: true,
          appliedTo: ['All Users'],
          priority: 1
        },
        {
          id: '2',
          name: 'Admin Home Office',
          ipAddress: '203.45.67.89',
          type: 'allow',
          category: 'whitelist',
          description: 'Administrator home office IP',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          lastMatched: new Date(Date.now() - 4 * 60 * 60 * 1000),
          enabled: true,
          appliedTo: ['Administrators'],
          priority: 2
        },
        {
          id: '3',
          name: 'Suspicious China IP Range',
          ipAddress: '103.45.0.0/16',
          type: 'block',
          category: 'blacklist',
          description: 'Known malicious IP range from threat intelligence',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastMatched: new Date(Date.now() - 6 * 60 * 60 * 1000),
          enabled: true,
          appliedTo: ['All Users'],
          priority: 1
        },
        {
          id: '4',
          name: 'VPN Exit Nodes',
          ipAddress: '45.67.89.0/24',
          type: 'block',
          category: 'blacklist',
          description: 'Block known VPN exit nodes',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          enabled: false,
          appliedTo: ['Finance Team'],
          priority: 3
        },
        {
          id: '5',
          name: 'Malaysia Only Access',
          ipAddress: 'MY',
          type: 'allow',
          category: 'geofence',
          description: 'Allow access only from Malaysia',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          enabled: true,
          appliedTo: ['Finance Team', 'Accounting'],
          priority: 2
        }
      ])

      // Mock access attempts
      setAccessAttempts([
        {
          id: '1',
          ipAddress: '192.168.1.100',
          location: 'Kuala Lumpur, MY',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'allowed',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          username: 'ahmad.rahman@hafjet.com',
          reason: 'Matched whitelist rule: Office Network'
        },
        {
          id: '2',
          ipAddress: '103.45.67.89',
          location: 'Unknown, CN',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'blocked',
          userAgent: 'curl/7.68.0',
          reason: 'Matched blacklist rule: Suspicious China IP Range',
          ruleId: '3'
        },
        {
          id: '3',
          ipAddress: '203.45.67.89',
          location: 'Petaling Jaya, MY',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'allowed',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          username: 'siti.nurhaliza@hafjet.com',
          reason: 'Matched whitelist rule: Admin Home Office',
          ruleId: '2'
        },
        {
          id: '4',
          ipAddress: '45.67.89.123',
          location: 'Unknown, RU',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          status: 'blocked',
          userAgent: 'python-requests/2.25.1',
          reason: 'No matching allow rule found',
          ruleId: '4'
        },
        {
          id: '5',
          ipAddress: '172.16.1.50',
          location: 'Johor Bahru, MY',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          status: 'flagged',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          username: 'lim.weiming@hafjet.com',
          reason: 'Access from new location'
        }
      ])

      // Mock geo locations
      setGeoLocations([
        {
          country: 'Malaysia',
          region: 'Southeast Asia',
          city: 'Kuala Lumpur',
          countryCode: 'MY',
          blocked: false,
          allowedUsers: ['All Users']
        },
        {
          country: 'Singapore',
          region: 'Southeast Asia',
          city: 'Singapore',
          countryCode: 'SG',
          blocked: false,
          allowedUsers: ['Administrators']
        },
        {
          country: 'China',
          region: 'East Asia',
          city: 'Various',
          countryCode: 'CN',
          blocked: true,
          allowedUsers: []
        },
        {
          country: 'Russia',
          region: 'Eastern Europe',
          city: 'Various',
          countryCode: 'RU',
          blocked: true,
          allowedUsers: []
        }
      ])

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleAddRule = () => {
    if (!newRule.name || !newRule.ipAddress) return

    const rule: IPRule = {
      id: Date.now().toString(),
      ...newRule,
      createdAt: new Date(),
      enabled: true
    }

    setIPRules(prev => [rule, ...prev])
    setNewRule({
      name: '',
      ipAddress: '',
      type: 'allow',
      category: 'whitelist',
      description: '',
      appliedTo: [],
      priority: 1
    })
    setShowAddRule(false)
  }

  const handleDeleteRule = (ruleId: string) => {
    setIPRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  const toggleRule = (ruleId: string) => {
    setIPRules(prev => prev.map(rule =>
      rule.id === ruleId
        ? { ...rule, enabled: !rule.enabled }
        : rule
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allowed': return 'text-green-400 bg-green-500/10'
      case 'blocked': return 'text-red-400 bg-red-500/10'
      case 'flagged': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'allow': return 'text-green-400 bg-green-500/10'
      case 'block': return 'text-red-400 bg-red-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'whitelist': return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'blacklist': return <X className="h-4 w-4 text-red-400" />
      case 'geofence': return <MapPin className="h-4 w-4 text-blue-400" />
      default: return <Shield className="h-4 w-4 text-gray-400" />
    }
  }

  const filteredRules = ipRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || rule.type === filterType
    return matchesSearch && matchesType
  })

  const filteredAttempts = accessAttempts.filter(attempt => {
    const matchesSearch = attempt.ipAddress.includes(searchTerm) ||
                         attempt.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || attempt.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const renderIPRules = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">All Types</option>
              <option value="allow" className="bg-gray-800">Allow Rules</option>
              <option value="block" className="bg-gray-800">Block Rules</option>
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
            <button 
              onClick={() => setShowAddRule(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              <Plus className="inline h-4 w-4 mr-2" />
              Add Rule
            </button>
          </div>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <h3 className="text-xl font-bold text-white mb-6">Add New IP Rule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Rule Name</label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter rule name"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">IP Address/Range</label>
              <input
                type="text"
                value={newRule.ipAddress}
                onChange={(e) => setNewRule(prev => ({ ...prev, ipAddress: e.target.value }))}
                placeholder="192.168.1.0/24 or 203.45.67.89"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Action</label>
              <select 
                value={newRule.type}
                onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as 'allow' | 'block' }))}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="allow" className="bg-gray-800">Allow</option>
                <option value="block" className="bg-gray-800">Block</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
              <select 
                value={newRule.category}
                onChange={(e) => setNewRule(prev => ({ ...prev, category: e.target.value as 'whitelist' | 'blacklist' | 'geofence' }))}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whitelist" className="bg-gray-800">Whitelist</option>
                <option value="blacklist" className="bg-gray-800">Blacklist</option>
                <option value="geofence" className="bg-gray-800">Geo-fence</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
            <textarea
              value={newRule.description}
              onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter rule description"
              rows={3}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowAddRule(false)}
              className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRule}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Add Rule
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">IP Access Rules</h3>
        
        <div className="space-y-4">
          {filteredRules.map((rule) => (
            <div key={rule.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(rule.category)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRuleTypeColor(rule.type)}`}>
                      {rule.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold">{rule.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-white/70 mt-1">
                      <span className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span>{rule.ipAddress}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Created {rule.createdAt.toLocaleDateString()}</span>
                      </span>
                      {rule.lastMatched && (
                        <span className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>Last match {rule.lastMatched.toLocaleString()}</span>
                        </span>
                      )}
                    </div>
                    {rule.description && (
                      <p className="text-white/60 text-sm mt-1">{rule.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      rule.enabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  
                  <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Applied to:</span>
                  <div className="flex flex-wrap gap-1">
                    {rule.appliedTo.map((target, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAccessAttempts = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <input
              type="text"
              placeholder="Search attempts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" className="bg-gray-800">All Status</option>
            <option value="allowed" className="bg-gray-800">Allowed</option>
            <option value="blocked" className="bg-gray-800">Blocked</option>
            <option value="flagged" className="bg-gray-800">Flagged</option>
          </select>
        </div>
      </div>

      {/* Attempts List */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
        <h3 className="text-xl font-bold text-white mb-6">Access Attempts Log</h3>
        
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => (
            <div key={attempt.id} className="bg-white/10 rounded-xl p-4 border border-white/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(attempt.status)}`}>
                      {attempt.status.toUpperCase()}
                    </span>
                    <span className="text-white font-semibold">{attempt.ipAddress}</span>
                    <span className="text-white/60 text-sm">{attempt.location}</span>
                  </div>
                  
                  {attempt.username && (
                    <p className="text-white/80 text-sm mb-1">User: {attempt.username}</p>
                  )}
                  
                  <p className="text-white/70 text-sm mb-2">{attempt.reason}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-white/60">
                    <span>📅 {attempt.timestamp.toLocaleString()}</span>
                    <span>🌐 {attempt.userAgent.slice(0, 50)}...</span>
                  </div>
                </div>
                
                <button className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors">
                  <Settings className="h-4 w-4" />
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
            🌐 IP Access Control
          </h1>
          <p className="text-white/80 text-lg">
            🔒 Manage IP restrictions and geographic access controls
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Rules</p>
                <p className="text-2xl font-bold text-blue-400">{ipRules.filter(r => r.enabled).length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Blocked Today</p>
                <p className="text-2xl font-bold text-red-400">{accessAttempts.filter(a => a.status === 'blocked').length}</p>
              </div>
              <X className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Allowed Today</p>
                <p className="text-2xl font-bold text-green-400">{accessAttempts.filter(a => a.status === 'allowed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Flagged</p>
                <p className="text-2xl font-bold text-yellow-400">{accessAttempts.filter(a => a.status === 'flagged').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'rules', label: 'IP Rules', icon: Shield },
              { id: 'attempts', label: 'Access Attempts', icon: Activity },
              { id: 'geo', label: 'Geographic Control', icon: MapPin },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'rules' | 'attempts' | 'geo' | 'settings')}
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
              {activeTab === 'rules' && renderIPRules()}
              {activeTab === 'attempts' && renderAccessAttempts()}
              {activeTab === 'geo' && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-center">
                  <MapPin className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white/80 mb-2">Geographic Controls</h3>
                  <p className="text-white/60">Country and region-based access controls coming soon.</p>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-center">
                  <Settings className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white/80 mb-2">Access Control Settings</h3>
                  <p className="text-white/60">Advanced configuration options for IP access control.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-center">
          <p className="text-white/60 text-sm">
            🛡️ {ipRules.filter(r => r.enabled).length} active rules | 
            🚫 {accessAttempts.filter(a => a.status === 'blocked').length} blocked attempts | 
            ✅ {accessAttempts.filter(a => a.status === 'allowed').length} allowed connections | 
            📍 {geoLocations.filter(g => !g.blocked).length} allowed countries
          </p>
        </div>
      </div>
    </div>
  )
}

export default IPAccessControl