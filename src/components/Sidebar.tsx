import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  LogOut 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TabType } from '../types';
import { User } from 'firebase/auth';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: User;
  handleLogout: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, user, handleLogout }: SidebarProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'categories', label: 'Categories', icon: PieChartIcon },
    { id: 'reports', label: 'Reports', icon: TrendingDown },
  ];

  return (
    <aside className="hidden lg:flex w-64 border-r border-zinc-200 bg-white flex-col">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">FinPortal</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-zinc-100 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-zinc-200" referrerPolicy="no-referrer" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-zinc-900 truncate">{user.displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
