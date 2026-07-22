import React from 'react';
import { Leaf, LayoutDashboard, Megaphone, Layout, Users, History, Settings, Plus, Search, Bell, HelpCircle, LogOut } from 'lucide-react';
import { ActivePage } from '../../types';

interface AppLayoutProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activePage, onNavigate, children }) => {
  const navItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns' as ActivePage, label: 'Campaigns', icon: Megaphone },
    { id: 'templates' as ActivePage, label: 'Templates', icon: Layout },
    { id: 'audience' as ActivePage, label: 'Audience', icon: Users },
    { id: 'history' as ActivePage, label: 'History', icon: History },
    { id: 'settings' as ActivePage, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafb] font-sans antialiased text-slate-800 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Logo Header */}
          <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-50">
            <div className="w-9 h-9 bg-[#002d1c] text-emerald-400 rounded-lg flex items-center justify-center shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-[#002d1c] tracking-tight leading-tight">Evergreen Mail</h1>
              <p className="text-[11px] font-medium text-slate-400">Marketing CRM</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id || (item.id === 'campaigns' && (activePage === 'new_campaign' || activePage === 'analytics' || activePage === 'recipients'));
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
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

        {/* Bottom Sidebar Action & Profile */}
        <div className="p-3 space-y-3 border-t border-slate-100 bg-white">
          <button
            onClick={() => onNavigate('new_campaign')}
            className="w-full bg-[#002d1c] hover:bg-[#02472d] text-white py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Campaign</span>
          </button>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-200 text-[#002d1c] font-bold text-xs flex items-center justify-center border border-emerald-300">
                JD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">Jane Doe</p>
                <p className="text-[10px] text-slate-500 truncate">Admin Account</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('signin')}
              title="Sign Out"
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800 capitalize">
              {activePage.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <div className="relative w-64 hidden sm:block">
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

            <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 overflow-hidden ml-1">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
