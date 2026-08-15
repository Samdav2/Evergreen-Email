import React, { useState } from 'react';
import { Leaf, LayoutDashboard, Megaphone, Layout, Users, History, Settings, Plus, Search, Bell, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { ActivePage } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface AppLayoutProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  children: React.ReactNode;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activePage, onNavigate, children }) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('signin');
  };

  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    setMobileSidebarOpen(false);
  };

  const navItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns' as ActivePage, label: 'Campaigns', icon: Megaphone },
    { id: 'templates' as ActivePage, label: 'Templates', icon: Layout },
    { id: 'audience' as ActivePage, label: 'Audience', icon: Users },
    { id: 'history' as ActivePage, label: 'History', icon: History },
    { id: 'settings' as ActivePage, label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div>
        <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-50">
          <div className="w-9 h-9 bg-[#002d1c] text-emerald-400 rounded-lg flex items-center justify-center shadow-xs">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#002d1c] tracking-tight leading-tight">SIMPLE EMAIL</h1>
            <p className="text-[11px] font-medium text-slate-400">Marketing CRM</p>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id || (item.id === 'campaigns' && (activePage === 'new_campaign' || activePage === 'analytics' || activePage === 'recipients'));
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-100/70 text-[#002d1c]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#002d1c]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 space-y-3 border-t border-slate-100 bg-white">
        <button
          onClick={() => handleNav('new_campaign')}
          className="w-full bg-[#002d1c] hover:bg-[#02472d] text-white py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Campaign</span>
        </button>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-200 text-[#002d1c] font-bold text-xs flex items-center justify-center border border-emerald-300">
              {user ? getInitials(user.full_name) : '?'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#f8fafb] font-sans antialiased text-slate-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col justify-between shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-100 flex flex-col justify-between z-40 shadow-2xl">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-100 px-4 md:px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 capitalize">
              {activePage.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Global Search Bar */}
            <div className="relative w-40 md:w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search data..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100/70 border border-transparent rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-200 focus:outline-none transition"
              />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition">
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-2 right-2"></span>
            </button>

            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition">
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 overflow-hidden ml-1 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
