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
import { motion } from 'motion/react';

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
    <aside className="hidden lg:flex w-80 bg-zinc-950 flex-col border-r border-white/5">
      <div className="p-10">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Financial</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em]">Tracker</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative",
                activeTab === item.id 
                  ? "text-white bg-white/5 shadow-sm" 
                  : "text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200"
              )}
            >
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                activeTab === item.id ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5">
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 mb-4">
          <div className="relative">
            <img 
              src={user.photoURL || ''} 
              className="w-12 h-12 rounded-2xl object-cover border border-white/10" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
            <p className="text-[10px] font-medium text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
