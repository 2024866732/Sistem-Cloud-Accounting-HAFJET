import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';

const Topbar: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Invoice Payment',
      message: 'INV-2025-001 has been paid by ABC Sdn Bhd',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'Product XYZ is running low (5 units remaining)',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Monthly Report Ready',
      message: 'Your September financial report is ready',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search invoices, customers, products..."
            className="
              w-full pl-10 pr-4 py-2 
              bg-slate-50 border border-slate-200 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
              text-sm
            "
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 ml-6">
        {/* Help Button */}
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
          <HelpCircle size={20} className="text-slate-600" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
          >
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
              <div className="px-4 py-2 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100
                      ${notification.unread ? 'bg-cyan-50/50' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <span className="w-2 h-2 bg-cyan-500 rounded-full mt-1"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-200">
                <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Settings size={20} className="text-slate-600" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">H</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-slate-800">Hafizi Zainal</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-800">Hafizi Zainal</p>
                <p className="text-xs text-slate-500">2024866732@student.uitm.edu.my</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3">
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3">
                  <Settings size={16} />
                  <span>Account Settings</span>
                </button>
              </div>
              <div className="border-t border-slate-200 py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
