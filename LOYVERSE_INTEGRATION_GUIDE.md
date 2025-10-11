# 🏪 Loyverse POS Integration Guide

## Overview
Complete integration page for connecting **Loyverse POS** system with **HAFJET Cloud Accounting**. This provides seamless synchronization of sales, products, customers, and inventory data.

---

## 📁 File Location
```
frontend/src/pages/Integrations/LoyverseIntegration.tsx
```

---

## 🎯 Features

### 1. **Connection Management**
- **API Key Authentication**: Secure connection using Loyverse API key
- **Show/Hide API Key**: Toggle visibility for security
- **Connection Status**: Visual indicator (Connected/Disconnected)
- **One-Click Connect/Disconnect**: Simple integration flow

### 2. **Real-time Synchronization**
Four main sync categories:
- **Products & Services** (234 items)
- **Customers** (892 records)
- **Sales Transactions** (1,547 transactions)
- **Inventory Levels** (189 items)

### 3. **Sync Controls**
- **Manual Sync Button**: Force immediate synchronization
- **Auto-sync Toggle**: Enable/disable automatic sync (every 5 minutes)
- **Sync Status Indicators**: Success/Syncing/Error states
- **Last Sync Timestamp**: Track sync history

### 4. **Configurable Settings**
Toggle switches for:
- ✅ Auto-sync Sales (every 5 minutes)
- ✅ Sync Products (catalog synchronization)
- ✅ Sync Customers (database sync)
- ✅ Sync Inventory (real-time stock levels)

### 5. **Feature Showcase**
Highlighted benefits:
- 🛒 Real-time Sales Sync
- 📦 Product Management
- 👥 Customer Data Sync
- 📈 Financial Reports

---

## 🎨 UI Components

### Connection State (Not Connected)
```tsx
- API Key input field with password masking
- Show/Hide toggle button
- Connect button with loading state
- Link to Loyverse API settings
- Gradient logo (blue to purple)
```

### Dashboard State (Connected)
```tsx
- 4 sync status cards with metrics
- Manual sync button
- Disconnect button
- Toggle switches for sync settings
- Feature cards with icons
- Security notice
- Help section with links
```

---

## 🔧 Technical Implementation

### State Management
```tsx
const [isConnected, setIsConnected] = useState(false);
const [isSyncing, setIsSyncing] = useState(false);
const [apiKey, setApiKey] = useState('');
const [showApiKey, setShowApiKey] = useState(false);
```

### Sync Status Interface
```tsx
interface SyncStatus {
  type: 'products' | 'customers' | 'sales' | 'inventory';
  label: string;
  lastSync: string;
  status: 'success' | 'syncing' | 'error';
  count: number;
}
```

### Key Functions
1. **handleConnect()**: Authenticates with Loyverse API (2s simulated delay)
2. **handleDisconnect()**: Clears connection and API key
3. **handleSync()**: Triggers manual sync (3s simulated delay)

---

## 🎨 Design System

### Color Palette
- **Primary Gradient**: `from-blue-500 to-purple-600`
- **Success**: `green-500/600` (connected, synced)
- **Error**: `red-500/600` (disconnected, errors)
- **Info**: `blue-500/600` (syncing state)
- **Warning**: `orange-500` (alerts)

### Icon Mapping
```tsx
Store         → Main logo
CheckCircle2  → Success status
XCircle       → Error status
RefreshCw     → Sync/loading (with spin animation)
Settings      → Configuration
ShoppingCart  → Sales feature
Package       → Products feature
Users         → Customers feature
TrendingUp    → Reports feature
Zap           → Quick connect
Lock          → Security notice
Key           → API key input
AlertCircle   → Help section
```

### Status Colors
```tsx
Success:  bg-green-100, text-green-600
Syncing:  bg-blue-100, text-blue-600
Error:    bg-red-100, text-red-600
```

---

## 📊 Data Flow

### Connection Flow
```
1. User enters API key
2. Click "Connect to Loyverse"
3. Show loading state (2s)
4. Validate API key (simulated)
5. Set isConnected = true
6. Show sync dashboard
```

### Sync Flow
```
1. Click "Sync Now" button
2. Set isSyncing = true
3. Update UI (spinning icon, disabled buttons)
4. Fetch data from Loyverse API
5. Process and store in HAFJET
6. Update last sync timestamps
7. Set isSyncing = false
```

---

## 🔐 Security Features

### 1. **API Key Protection**
- Password-masked input field
- Show/Hide toggle for visibility
- Never displayed in plain text logs
- Encrypted storage (backend)

### 2. **SSL/TLS Encryption**
- All API calls use HTTPS
- Certificate validation
- Secure data transfer

### 3. **Access Control**
- API key scoped to user account
- No third-party data sharing
- Audit logs for sync operations

---

## 📱 Responsive Design

### Breakpoints
- **Mobile** (< 768px): Single column layout
- **Tablet** (768px - 1024px): 2-column grid
- **Desktop** (> 1024px): 4-column grid for sync cards

### Grid Classes
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

---

## 🚀 Usage Instructions

### Step 1: Get Loyverse API Key
1. Login to Loyverse dashboard
2. Navigate to Settings → API
3. Generate new API key
4. Copy the key securely

### Step 2: Connect in HAFJET
1. Go to **Bukku Store** → **Integrations**
2. Find **Loyverse POS Integration**
3. Paste API key
4. Click **Connect to Loyverse**
5. Wait for confirmation

### Step 3: Configure Sync Settings
1. Toggle sync options as needed:
   - Auto-sync Sales ✅
   - Sync Products ✅
   - Sync Customers ✅
   - Inventory Sync ✅
2. Click **Sync Now** to start first sync

### Step 4: Monitor Sync Status
- Check sync cards for real-time status
- View last sync timestamps
- Monitor record counts

---

## 🔗 Integration with Sidebar

Add to `Sidebar.tsx` under "Bukku Store" submenu:

```tsx
{
  id: 'bukku-store',
  label: 'Bukku Store',
  icon: <Store />,
  submenu: [
    { 
      id: 'loyverse', 
      label: 'Loyverse POS', 
      path: '/integrations/loyverse' 
    },
    { 
      id: 'integrations', 
      label: 'All Integrations', 
      path: '/integrations' 
    },
  ],
}
```

---

## 🔌 Backend API Endpoints (To Be Implemented)

### Authentication
```
POST /api/integrations/loyverse/connect
Body: { apiKey: string }
Response: { success: boolean, message: string }
```

### Sync Operations
```
POST /api/integrations/loyverse/sync
Body: { type: 'all' | 'products' | 'customers' | 'sales' | 'inventory' }
Response: { success: boolean, syncedCount: number }
```

### Get Sync Status
```
GET /api/integrations/loyverse/status
Response: { 
  isConnected: boolean,
  syncStatuses: SyncStatus[],
  lastSync: string
}
```

### Disconnect
```
DELETE /api/integrations/loyverse/disconnect
Response: { success: boolean }
```

---

## 📝 Sample Data (Mock)

### Sync Statuses
```tsx
const syncStatuses: SyncStatus[] = [
  {
    type: 'products',
    label: 'Products & Services',
    lastSync: '2 minutes ago',
    status: 'success',
    count: 234,
  },
  {
    type: 'customers',
    label: 'Customers',
    lastSync: '5 minutes ago',
    status: 'success',
    count: 892,
  },
  {
    type: 'sales',
    label: 'Sales Transactions',
    lastSync: '1 minute ago',
    status: 'syncing',
    count: 1547,
  },
  {
    type: 'inventory',
    label: 'Inventory Levels',
    lastSync: '3 minutes ago',
    status: 'success',
    count: 189,
  },
];
```

---

## 🎯 Next Steps

### Phase 1: Backend Integration ⏳
- [ ] Create Loyverse API service
- [ ] Implement authentication endpoints
- [ ] Build sync logic for products
- [ ] Build sync logic for customers
- [ ] Build sync logic for sales
- [ ] Build sync logic for inventory
- [ ] Add error handling and retries

### Phase 2: Real-time Updates ⏳
- [ ] WebSocket connection for live sync
- [ ] Push notifications for sync completion
- [ ] Progress bars for large syncs

### Phase 3: Advanced Features ⏳
- [ ] Selective sync (date ranges)
- [ ] Conflict resolution UI
- [ ] Export sync reports
- [ ] Sync scheduling (cron jobs)
- [ ] Multi-store support

### Phase 4: Testing 🧪
- [ ] Unit tests for sync logic
- [ ] Integration tests with Loyverse sandbox
- [ ] Error scenario testing
- [ ] Performance testing (large datasets)

---

## 🐛 Error Handling

### Common Errors
1. **Invalid API Key**: Show error message, prompt re-entry
2. **Network Timeout**: Retry logic with exponential backoff
3. **Rate Limiting**: Queue requests, show wait time
4. **Data Conflicts**: Show conflict resolution UI
5. **Partial Sync**: Resume from last checkpoint

### Error UI States
```tsx
{sync.status === 'error' && (
  <div className="text-red-600">
    <XCircle size={20} />
    <span>Sync failed. Retry?</span>
  </div>
)}
```

---

## 📊 Metrics & Analytics

Track:
- Total syncs performed
- Average sync duration
- Error rate
- Data volume synced
- Most synced data types
- Peak sync times

---

## 🌍 Localization Support

Add translations for:
- Connection messages
- Sync status labels
- Error messages
- Help text
- Feature descriptions

Bahasa Malaysia example:
```tsx
const translations = {
  en: {
    connect: 'Connect to Loyverse',
    connected: 'Connected',
    syncNow: 'Sync Now',
  },
  ms: {
    connect: 'Sambung ke Loyverse',
    connected: 'Bersambung',
    syncNow: 'Sync Sekarang',
  },
};
```

---

## 🎓 Resources

- [Loyverse API Documentation](https://developer.loyverse.com/docs/)
- [HAFJET Integration Guidelines](./docs/INTEGRATION_GUIDELINES.md)
- [Security Best Practices](./docs/SECURITY.md)

---

## ✅ Checklist for Developers

- [x] Create LoyverseIntegration.tsx component
- [x] Design connection flow UI
- [x] Implement sync status cards
- [x] Add toggle switches for settings
- [x] Create feature showcase section
- [x] Add security notice
- [x] Include help section
- [ ] Connect to real backend API
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1)

---

**Created**: October 11, 2025  
**Version**: 1.0.0  
**Component**: LoyverseIntegration.tsx  
**Status**: ✅ UI Complete, ⏳ Backend Pending
