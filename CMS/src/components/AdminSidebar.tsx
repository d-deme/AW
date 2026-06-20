import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck, 
  MessageSquare, 
  PiggyBank, 
  Compass, 
  FileText, 
  Megaphone, 
  Users, 
  Settings, 
  LogOut,
  User,
  ClipboardList,
  ShieldAlert,
  FolderOpen,
  Video,
  BookOpen,
  Calendar,
  Award,
  Map,
  X,
  TrendingUp,
  Terminal
} from 'lucide-react';


interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface SidebarGroup {
  title: string;
  adminOnly?: boolean;
  items: SidebarItem[];
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: {
    name?: string;
    username?: string;
    role: string;
    email?: string;
  } | null;
  onLogout: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout,
  isOpenOnMobile = false,
  onCloseMobile
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const getManageLabel = (item: SidebarItem) => {
    // If it's KPI Dashboard, Global Settings, Identity Access, Audit Timeline, leave them as is
    if (['dashboard', 'settings', 'users', 'audit', 'permits', 'tickets', 'budgets', 'tourism-packages', 'dynamic-schemas', 'cdn-hub', 'api-docs'].includes(item.id)) {
      return item.label;
    }
    // Transform "X Management" -> "Manage X"
    if (item.label.endsWith(' Management')) {
      return `Manage ${item.label.replace(' Management', '')}`;
    }
    // Catch specific items
    if (item.id === 'tourism') {
      return 'Manage Tourism';
    }
    if (item.id === 'administrative-units') {
      return 'Manage Administrative Units';
    }
    if (item.id === 'growth-metrics') {
      return 'Manage Growth Metrics';
    }
    if (item.id === 'hero') {
      return 'Manage Hero Graphics';
    }
    return `Manage ${item.label}`;
  };

  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Core Portal",
      items: [
        { id: 'dashboard', label: 'KPI Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: "Municipal Cabinets",
      items: [
        { id: 'permits', label: 'Permits & Licenses', icon: FileCheck },
        { id: 'tickets', label: 'Ticket Moderation', icon: MessageSquare },
        { id: 'budgets', label: 'Financial Budgets', icon: PiggyBank },
        { id: 'tourism-packages', label: 'Concierge Planner', icon: Compass },
      ]
    },
    {
      title: "Branding & Media",
      items: [
        { id: 'news', label: 'News Management', icon: FileText },
        { id: 'announcements', label: 'Announcements Management', icon: Megaphone },
        { id: 'blog', label: 'Blog Management', icon: BookOpen },
        { id: 'events', label: 'Events Management', icon: Calendar },
        { id: 'hero', label: 'Hero Graphics', icon: Video },
        { id: 'initiatives', label: 'Initiatives Management', icon: ClipboardList },
        { id: 'media', label: 'Media Management', icon: FolderOpen },
      ]
    },
    {
      title: "Governance & Access",
      items: [
        { id: 'services', label: 'Services Management', icon: ClipboardList },
        { id: 'leadership', label: 'Leadership Management', icon: Users },
        { id: 'history', label: 'Mayoral History Management', icon: Award },
        { id: 'tourism', label: 'Tourism Attractions', icon: Map },
        { id: 'documents', label: 'Documents Management', icon: FileCheck },
        { id: 'administrative-units', label: 'Administrative Units', icon: ClipboardList },
        { id: 'growth-metrics', label: 'Growth Metrics', icon: TrendingUp },
        ...(isAdmin ? [{ id: 'dynamic-schemas', label: 'Content Schemas', icon: FolderOpen }] : []),
        ...(isAdmin ? [{ id: 'cdn-hub', label: 'Edge CDN Console', icon: ShieldAlert }] : []),
        ...(isAdmin ? [{ id: 'api-docs', label: 'Developer API Portal', icon: Terminal }] : []),
        ...(isAdmin ? [{ id: 'users', label: 'Identity Access', icon: Users }] : []),
        ...(isAdmin ? [{ id: 'audit', label: 'Audit Timeline', icon: ClipboardList }] : []),
        { id: 'settings', label: 'Global Settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop overlay */}
      {isOpenOnMobile && (
        <div 
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 bg-brand-navy/65 backdrop-blur-xs z-45 transition-all duration-350"
        />
      )}

      {/* Main Sidebar container */}
      <div className={`
        w-68 bg-white dark:bg-[#09152C] border-r border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-200 
        h-[calc(100vh-64px)] sticky top-16 overflow-y-auto select-none custom-scrollbar transition-all duration-300
        flex flex-col z-40
        ${isOpenOnMobile 
          ? 'fixed inset-y-0 left-0 h-full !z-50 translate-x-0 shadow-2xl !w-72' 
          : 'fixed inset-y-0 left-0 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] -translate-x-full lg:translate-x-0 hidden lg:flex'
        }
      `}>
        {/* Mobile close header */}
        {isOpenOnMobile && (
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-900/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal-dark dark:text-brand-teal">Governance Desk</span>
            <button 
              onClick={onCloseMobile} 
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Operator profile card in sidebar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/40">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center space-x-3 shadow-inner hover:border-slate-200 dark:hover:border-slate-700 transition duration-300">
            <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-brand-teal/20 text-sm">
              {(currentUser?.name || currentUser?.username || 'O')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Operator Unit</p>
              <p className="text-sm font-black truncate text-slate-800 dark:text-white leading-tight">
                {currentUser?.name || currentUser?.username || 'Administrative Officer'}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-brand-teal uppercase font-black tracking-widest">
                  {currentUser?.role || 'operator'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="p-4 flex-1 space-y-8">
          {sidebarGroups.map((group, groupIdx) => {
            if (group.adminOnly && !isAdmin) return null;
            
            // Custom color accents for different group headers
            const accents = [
              { text: 'text-emerald-600 dark:text-emerald-400/90 group-hover/header:text-emerald-500', led: 'bg-emerald-500 group-hover/header:scale-125 group-hover/header:rotate-12' },
              { text: 'text-cyan-600 dark:text-cyan-400/90 group-hover/header:text-cyan-500', led: 'bg-cyan-500 group-hover/header:scale-125 group-hover/header:rotate-12' },
              { text: 'text-brand-teal-dark dark:text-brand-teal group-hover/header:text-teal-400', led: 'bg-brand-teal group-hover/header:scale-125 group-hover/header:rotate-12' },
              { text: 'text-indigo-600 dark:text-indigo-400/95 group-hover/header:text-indigo-550', led: 'bg-indigo-500 group-hover/header:scale-125 group-hover/header:rotate-12' }
            ];
            const accent = accents[groupIdx] || accents[0];

            return (
              <div key={groupIdx} className="space-y-3">
                <div className="flex items-center space-x-2 px-0 mb-1 py-1 select-none cursor-pointer group/header">
                  <span className={`w-1.5 h-3.5 rounded-full ${accent.led} transition-all duration-300 shadow-sm`} />
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${accent.text}`}>
                    {group.title}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 ease-out group relative border-l-4 ${
                          isActive 
                            ? 'bg-slate-100 dark:bg-slate-900/60 backdrop-blur-md border-brand-teal text-slate-900 dark:text-white font-extrabold shadow-md dark:shadow-slate-950/20 ring-1 ring-slate-200 dark:ring-white/10' 
                            : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-850/20 hover:backdrop-blur-sm hover:translate-x-1 hover:ring-1 hover:ring-slate-100 dark:hover:ring-white/5'
                        }`}
                      >
                        {/* Flex wrapper to keep the icon aligned rigidly */}
                        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center mr-3 transition-transform duration-300 group-hover:scale-110">
                          <Icon 
                            size={18} 
                            className={isActive ? 'text-brand-teal-dark dark:text-brand-teal' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-teal transition-colors duration-300'} 
                          />
                        </div>
                        
                        {/* Sidebar Link text */}
                        <span className="text-sm tracking-wide text-left truncate leading-none">
                          {getManageLabel(item)}
                        </span>
                        
                        {isActive && (
                          <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Account Links */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950/20 space-y-3">
          <button
            onClick={() => {
              setActiveTab('profile');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'profile' 
                ? 'bg-slate-100 dark:bg-slate-800/40 text-brand-teal-dark dark:text-brand-teal border border-slate-200 dark:border-slate-700' 
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/40'
            }`}
          >
            <User size={14} />
            <span>Profile Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400/80 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 group"
          >
            <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Secure Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
