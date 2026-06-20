import React, { useState } from 'react';
import { User, ClipboardCheck, Wallet } from 'lucide-react';

interface CitizenDashboardProps {
  onNavigate?: (page: string) => void;
}

export const CitizenDashboard = ({ onNavigate }: CitizenDashboardProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden lg:block text-right">
        <div className="text-[8px] font-bold text-cyan uppercase tracking-widest">Resident</div>
        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Abebe K.</div>
      </div>
      <div className="relative group">
        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white cursor-pointer hover:border-cyan/50 transition-all">
          <User size={18} />
        </div>
        <div className="absolute top-full right-0 mt-4 w-64 bg-navy border border-white/10 rounded-2xl shadow-2xl p-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-[110]">
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate && onNavigate('permits')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left bg-transparent border-none"
            >
              <ClipboardCheck size={16} className="text-cyan" />
              <div className="text-[10px] font-bold text-white uppercase tracking-widest">My Requests (3)</div>
            </button>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <Wallet size={16} className="text-magenta" />
              <div className="text-[10px] font-bold text-white uppercase tracking-widest">Payments</div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="w-full text-left text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
