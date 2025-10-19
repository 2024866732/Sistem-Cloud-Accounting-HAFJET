import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  DollarSign,
  ShoppingCart,
  Upload,
  Briefcase,
  Building2,
  Users,
  Package,
  BarChart3,
  Calculator,
  Settings,
  Store,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  submenu?: MenuItem[];
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    path: '/dashboard',
  },
  {
    id: 'financing',
    label: 'Financing Portal',
    icon: <DollarSign size={20} />,
    path: '/financing',
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: <ShoppingCart size={20} />,
    submenu: [
      { id: 'invoices', label: 'Invoices', icon: null, path: '/sales/invoices' },
      { id: 'quotations', label: 'Quotations', icon: null, path: '/sales/quotations' },
      { id: 'sales-orders', label: 'Sales Orders', icon: null, path: '/sales/orders' },
      { id: 'delivery-notes', label: 'Delivery Notes', icon: null, path: '/sales/delivery' },
      { id: 'customers', label: 'Customers', icon: null, path: '/sales/customers' },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    icon: <Upload size={20} />,
    submenu: [
      { id: 'bills', label: 'Bills', icon: null, path: '/purchases/bills' },
      { id: 'purchase-orders', label: 'Purchase Orders', icon: null, path: '/purchases/orders' },
      { id: 'suppliers', label: 'Suppliers', icon: null, path: '/purchases/suppliers' },
      { id: 'expenses', label: 'Expenses', icon: null, path: '/purchases/expenses' },
    ],
  },
  {
    id: 'digital-shoebox',
    label: 'Digital Shoebox',
    icon: <Briefcase size={20} />,
    path: '/shoebox',
  },
  {
    id: 'bank',
    label: 'Bank',
    icon: <Building2 size={20} />,
    submenu: [
      { id: 'accounts', label: 'Bank Accounts', icon: null, path: '/bank/accounts' },
      { id: 'transactions', label: 'Transactions', icon: null, path: '/bank/transactions' },
      { id: 'reconciliation', label: 'Reconciliation', icon: null, path: '/bank/reconciliation' },
      { id: 'transfers', label: 'Transfers', icon: null, path: '/bank/transfers' },
    ],
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: <Users size={20} />,
    path: '/contacts',
  },
  {
    id: 'products',
    label: 'Products & Services',
    icon: <Package size={20} />,
    path: '/products',
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: <Package size={20} />,
    submenu: [
      { id: 'inventory', label: 'Inventory', icon: null, path: '/stock/inventory' },
      { id: 'adjustments', label: 'Stock Adjustments', icon: null, path: '/stock/adjustments' },
      { id: 'movements', label: 'Stock Movements', icon: null, path: '/stock/movements' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <BarChart3 size={20} />,
    submenu: [
      { id: 'profit-loss', label: 'Profit & Loss', icon: null, path: '/reports/profit-loss' },
      { id: 'balance-sheet', label: 'Balance Sheet', icon: null, path: '/reports/balance-sheet' },
      { id: 'cash-flow', label: 'Cash Flow', icon: null, path: '/reports/cash-flow' },
      { id: 'trial-balance', label: 'Trial Balance', icon: null, path: '/reports/trial-balance' },
      { id: 'aged-receivables', label: 'Aged Receivables', icon: null, path: '/reports/aged-receivables' },
      { id: 'aged-payables', label: 'Aged Payables', icon: null, path: '/reports/aged-payables' },
      { id: 'tax-report', label: 'Tax Report (SST)', icon: null, path: '/reports/tax' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: <Calculator size={20} />,
    submenu: [
      { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: null, path: '/accounting/chart-of-accounts' },
      { id: 'journal-entries', label: 'Journal Entries', icon: null, path: '/accounting/journal' },
      { id: 'fixed-assets', label: 'Fixed Assets', icon: null, path: '/accounting/fixed-assets' },
    ],
  },
  {
    id: 'control-panel',
    label: 'Control Panel',
    icon: <Settings size={20} />,
    submenu: [
      { id: 'company', label: 'Company Settings', icon: null, path: '/settings/company' },
      { id: 'users', label: 'Users & Permissions', icon: null, path: '/settings/users' },
      { id: 'tax-settings', label: 'Tax Settings', icon: null, path: '/settings/tax' },
      { id: 'email-templates', label: 'Email Templates', icon: null, path: '/settings/email' },
      { id: 'integrations', label: 'Integrations', icon: null, path: '/settings/integrations' },
    ],
  },
  {
    id: 'bukku-store',
    label: 'Bukku Store',
    icon: <Store size={20} />,
    submenu: [
      { id: 'loyverse', label: 'Loyverse POS', icon: null, path: '/integrations/loyverse' },
      { id: 'marketplace', label: 'Marketplace', icon: null, path: '/store/marketplace' },
      { id: 'my-apps', label: 'My Apps', icon: null, path: '/store/my-apps' },
      { id: 'all-integrations', label: 'All Integrations', icon: null, path: '/integrations' },
    ],
  },
];

interface SidebarProps {
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, isMobileMenuOpen = false, onClose }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['sales', 'purchases']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (submenu?: MenuItem[]) => {
    if (!submenu) return false;
    return submenu.some((item) => isActive(item.path));
  };

  // On mobile, auto-close collapsed sidebar
  React.useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-slate-300
        transition-all duration-300 ease-in-out z-40
        ${isCollapsed && !isMobile ? 'w-16' : 'w-64'}
        flex flex-col
        ${isMobile ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        lg:translate-x-0
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">hafzigadjet</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors"
        >
          <ChevronRight
            size={18}
            className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.submenu ? (
                // Menu with submenu
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                      transition-colors text-sm
                      ${
                        isParentActive(item.submenu)
                          ? 'bg-slate-800 text-white'
                          : 'hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={isParentActive(item.submenu) ? 'text-cyan-400' : ''}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expandedMenus.includes(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  {!isCollapsed && expandedMenus.includes(item.id) && (
                    <ul className="mt-1 ml-4 space-y-1 pl-6 border-l border-slate-700">
                      {item.submenu.map((subItem) => (
                        <li key={subItem.id}>
                          <Link
                            to={subItem.path || '#'}
                            onClick={() => isMobile && onClose?.()}
                            className={`
                              block px-3 py-2 rounded-lg text-sm
                              transition-colors
                              ${
                                isActive(subItem.path)
                                  ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                                  : 'hover:bg-slate-800/50'
                              }
                            `}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Menu without submenu
                <Link
                  to={item.path || '#'}
                  onClick={() => isMobile && onClose?.()}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg
                    transition-colors text-sm
                    ${
                      isActive(item.path)
                        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                        : 'hover:bg-slate-800/50'
                    }
                  `}
                >
                  <span className={isActive(item.path) ? 'text-cyan-400' : ''}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - User Profile */}
      {!isCollapsed && (
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">H</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Hafizi Zainal</p>
              <p className="text-xs text-slate-400 truncate">Admin</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
