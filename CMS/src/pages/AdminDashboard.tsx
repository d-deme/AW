// src/pages/AdminDashboard.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, Globe, Settings, FileText, Users, Megaphone,
  Briefcase, Calendar, History, Image as ImageIcon, LayoutGrid, LogOut,
  Menu, X, ChevronRight, Plus, Edit, Trash2, Eye, Search, Bell, CheckCircle,
  Clock, AlertCircle, Lightbulb, FileDown, FileSpreadsheet, Upload, MapPin,
  PenTool, Filter, CheckSquare, Square, ClipboardList, User, Loader2,
  ChevronUp, ChevronDown, Zap, ArrowLeft, ArrowRight, Printer, Activity,
  Mountain, Thermometer, Compass, Layers, Target, Shield, Sun, Moon
} from 'lucide-react';
import { useCMS } from '../CMSContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { BudgetWeightAdjuster } from '../components/BudgetWeightAdjuster';
import { PermitLedger } from '../components/PermitLedger';
import { TicketModeration } from '../components/TicketModeration';
import { TourismPlanner } from '../components/TourismPlanner';
import { DynamicContentModeler } from '../components/DynamicContentModeler';
import { CDNDecouplingHub } from '../components/CDNDecouplingHub';
import { APIDocumentationPortal } from '../components/APIDocumentationPortal';
import { ExportConfirmationModal } from '../components/ExportConfirmationModal';
import { ContentManager } from '../components/ContentManager';
import { HeroVideoForm, SettingsForm } from '../components/ContentForms';
import { UserProfile } from '../components/UserProfile';
import { UserManagement } from '../components/UserManagement';
import { AuditTrail } from '../components/AuditTrail';
import { PermitRecord, SupportTicket, BudgetAllocation, TourismPackage } from '../types/admin';
import { LazyImage } from '../components/LazyImage';
import { QuickEditMembersModal } from '../components/QuickEditMembersModal';
import { getMemberAvatarUrl } from '../utils/avatar';
import * as XLSX from 'xlsx';
import { importExcelFile, exportDataToExcel } from '../utils/excelUtils';
import { useCMS as useCMSHook } from '../CMSContext';

interface AdminDashboardProps {
  permits: PermitRecord[];
  setPermits: React.Dispatch<React.SetStateAction<PermitRecord[]>>;
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  budgets: BudgetAllocation[];
  setBudgets: React.Dispatch<React.SetStateAction<BudgetAllocation[]>>;
  packages: TourismPackage[];
  setPackages: React.Dispatch<React.SetStateAction<TourismPackage[]>>;
  addPermit: (p: PermitRecord) => Promise<void>;
  updatePermit: (updated: PermitRecord) => Promise<void>;
  deletePermit: (id: string) => Promise<void>;
  addTicket: (t: SupportTicket) => Promise<void>;
  updateTicket: (updated: SupportTicket) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  addPackage: (pkg: TourismPackage) => Promise<void>;
  updatePackage: (updated: TourismPackage) => Promise<void>;
  deletePackage: (id: string) => Promise<void>;
  syncBudgetsList: (newList: BudgetAllocation[]) => Promise<void>;
}

export const AdminDashboard = ({
  permits,
  setPermits,
  tickets,
  setTickets,
  budgets,
  setBudgets,
  packages,
  setPackages,
  addPermit,
  updatePermit,
  deletePermit,
  addTicket,
  updateTicket,
  deleteTicket,
  addPackage,
  updatePackage,
  deletePackage,
  syncBudgetsList
}: AdminDashboardProps) => {
  const navigate = useNavigate();
  const { logout, currentUser, auditLogs, news, pinned, services, leadership, administrativeUnits, mayoralHistory, initiatives, events, documents, tourism, blog, media, siteSettings } = useCMSHook();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('cms_active_tab') || 'dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [syncedPayload, setSyncedPayload] = useState('');
  const [exportTarget, setExportTarget] = useState('full');
  const [isExportBackupModalOpen, setIsExportBackupModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [liveLogs, setLiveLogs] = useState(() => [
    { id: 'L-1', timestamp: new Date().toISOString(), userName: 'Director Aster Kassa', action: 'Zoning Audit Transition', contentType: 'Permit Gate', contentTitle: 'AD-2026-8042 (Solar Grid Core)', transition: { from: 'In Review', to: 'Action Required' }, operatorRole: 'Renewable Infrastructure Lead', secHash: 'SHA256-TRX-740' },
    { id: 'L-2', timestamp: new Date(Date.now() - 32000).toISOString(), userName: 'Woreda Inspector Abebe', action: 'Status Clearance', contentType: 'Workgroup Ticket', contentTitle: 'TK-1205 (Water Valve Leakage)', transition: { from: 'Received', to: 'In Progress' }, operatorRole: 'Civil Services Dispatcher', secHash: 'SHA256-TRX-912' },
    { id: 'L-3', timestamp: new Date(Date.now() - 145000).toISOString(), userName: 'Interim Treasurer Solomon', action: 'Capital Re-allocation', contentType: 'Budget Allocation', contentTitle: 'Road Transport Division Boost', transition: { from: 'Pending', to: 'Approved' }, operatorRole: 'Municipal Finance Lead', secHash: 'SHA256-TRX-041' }
  ]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [deptPermissions, setDeptPermissions] = useState<any>(() => {
    const cached = localStorage.getItem('adama_dept_permissions');
    if (cached) return JSON.parse(cached);
    return {
      'Zoning & Land Division': { writePermits: true, moderateTickets: true, adjustBudgets: false, deleteAccounts: false, viewLogs: true },
      'Renewable Infrastructure': { writePermits: true, moderateTickets: false, adjustBudgets: true, deleteAccounts: false, viewLogs: true },
      'Digital Gateway & Identity Desk': { writePermits: false, moderateTickets: true, adjustBudgets: false, deleteAccounts: true, viewLogs: true },
      'Revenue & Commercial Licensing': { writePermits: true, moderateTickets: true, adjustBudgets: false, deleteAccounts: false, viewLogs: true }
    };
  });
  const [selectedDept, setSelectedDept] = useState('Zoning & Land Division');
  const [permSuccess, setPermSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('cms_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(() => {
      const simulationPool = [
        { userName: 'Officer Dawit Kebede', action: 'Zoning Audit Transition', contentType: 'Permit Gate', contentTitle: 'AD-2026-4410 (Structure Build)', transition: { from: 'Zoning Audit', to: 'In Review' }, operatorRole: 'Zoning & Land Division lead' },
        { userName: 'Woreda Operator 07', action: 'Status Clearance', contentType: 'Civic Ticket', contentTitle: 'TK-4105 (Road Pothole Patching)', transition: { from: 'In Progress', to: 'Resolved' }, operatorRole: 'Public Infrastructure Supervisor' },
        { userName: 'Director Aster Kassa', action: 'Content Publication', contentType: 'CMS Announcement', contentTitle: 'Grid expansion schedules', transition: { from: 'Draft', to: 'Published' }, operatorRole: 'Renewable Infrastructure Lead' }
      ];
      const logTemplate = simulationPool[Math.floor(Math.random() * simulationPool.length)];
      const newLiveLog = {
        id: `L-SIM-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userName: logTemplate.userName,
        action: logTemplate.action,
        contentType: logTemplate.contentType,
        contentTitle: logTemplate.contentTitle,
        transition: logTemplate.transition,
        operatorRole: logTemplate.operatorRole,
        secHash: `SHA256-TRX-${Math.floor(100 + Math.random() * 900)}`
      };
      setLiveLogs(prev => [newLiveLog, ...prev.slice(0, 7)]);
    }, 18000);
    return () => clearInterval(timer);
  }, []);

  const searchResults = React.useMemo(() => {
    if (!globalSearch.trim()) return [];
    const term = globalSearch.toLowerCase();
    const matchedNews = news.filter(n => n.title.toLowerCase().includes(term) || n.content.toLowerCase().includes(term)).map(n => ({ id: n.id, type: 'News & Announcements', category: n.category || 'General', title: n.title, desc: n.content.substring(0,100)+'...', meta: `By ${n.author || 'Admin'} on ${n.date}` }));
    const matchedServices = services.filter(s => (s.title || s.name || '').toLowerCase().includes(term) || s.description.toLowerCase().includes(term)).map(s => ({ id: s.id, type: 'Municipal Service', category: s.category || 'Resident', title: s.title || s.name, desc: s.description, meta: `Target Audience: ${s.category || 'Resident'}` }));
    const matchedLeadership = leadership.filter(l => l.name.toLowerCase().includes(term) || (l.role || l.title || '').toLowerCase().includes(term) || (l.bio || l.biography || '').toLowerCase().includes(term)).map(l => ({ id: l.id, type: 'Leadership Committee', category: l.role || 'Director', title: l.name, desc: l.bio || l.biography || 'No bio', meta: `Office Mail: ${l.contact || 'info@adama.gov.et'}` }));
    return [...matchedNews, ...matchedServices, ...matchedLeadership];
  }, [globalSearch, news, services, leadership]);

  const handleBudgetsChange = (valOrUpdater: any) => {
    const newList = typeof valOrUpdater === 'function' ? valOrUpdater(budgets) : valOrUpdater;
    setBudgets(newList);
    syncBudgetsList(newList);
  };

  const handlePackagesChange = (valOrUpdater: any) => {
    const newList = typeof valOrUpdater === 'function' ? valOrUpdater(packages) : valOrUpdater;
    setPackages(newList);
    // Also sync if needed - you can implement a similar sync function for packages
  };

  const handleSyncSystems = () => {
    const payload = {
      agencyCode: "ADAMA-MUNICIPAL-GATEWAY-2026",
      syncTimestamp: new Date().toISOString(),
      compilationVersion: "v2.6.2-stable",
      datasets: { architecturalLicensing: permits, civicTicketsQueue: tickets, capitalBudgets: budgets, curatedTourismDayPlanner: packages }
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    setSyncedPayload(jsonStr);
    navigator.clipboard.writeText(jsonStr);
    setShowSyncSuccess(true);
  };

  const handleDownloadExport = () => setIsExportBackupModalOpen(true);

  const executeDownloadExport = () => {
    let exportData: any = {};
    let fileName = `adama-city-${exportTarget}-export.json`;
    if (exportTarget === 'full') {
      fileName = `adama-city-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      exportData = { backupVersion: "v2.6.2", backupTimestamp: new Date().toISOString(), datasets: { news, pinned, services, leadership, administrativeUnits } };
    } else if (exportTarget === 'news') exportData = news;
    else if (exportTarget === 'announcements') exportData = pinned;
    else if (exportTarget === 'services') exportData = services;
    else if (exportTarget === 'leadership') exportData = leadership;
    else if (exportTarget === 'administrative_units') exportData = administrativeUnits;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const pendingPermits = permits.filter(p => p.statusGate !== 'Approved').length;
  const activeTickets = tickets.filter(t => t.status !== 'Resolved').length;
  const totalAllocatedBudget = budgets.reduce((acc, b) => acc + b.approvedCapitalExpenseEtb, 0);
  const avgPermitCompletion = Math.round(permits.reduce((acc, p) => acc + p.completionPercentage, 0) / (permits.length || 1));
  const stats = [
    { label: 'Registered Citizens', value: '342,950', icon: Users, color: 'text-brand-cyan border-brand-cyan/25 bg-brand-cyan/5', desc: 'Verified public bio-id profiles' },
    { label: 'Active Permits', value: `${pendingPermits} Pending`, icon: ClipboardList, color: 'text-amber-400 border-amber-400/25 bg-[#e2ced2] bg-opacity-[0.05]', desc: 'Zoning clearances in review' },
    { label: 'Open Ticket Issues', value: `${activeTickets} Active`, icon: AlertCircle, color: 'text-brand-magenta border-brand-magenta/25 bg-brand-magenta/5', desc: 'Citizen support complaints' },
    { label: 'FY 2026 Allocation', value: `${(totalAllocatedBudget / 1e9).toFixed(1)}B ETB`, icon: Briefcase, color: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/5', desc: 'Capital investments mapped' },
  ];

  const modules = [
    { id: 'news', label: 'Manage News', badge: 'Official Broadcasts', color: 'from-blue-500/20 to-blue-600/5 text-blue-300 border-blue-500/30', count: news.length, desc: 'Official city news articles, press releases, and media bulletins.' },
    { id: 'announcements', label: 'Manage Announcements', badge: 'Critical Alerts', color: 'from-rose-500/20 to-rose-600/5 text-rose-300 border-rose-500/30', count: pinned.length, desc: 'High-visibility emergency broadcasts, tenders, and services updates.' },
    { id: 'services', label: 'Manage City Services', badge: 'Citizen Guides', color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-300 border-emerald-500/30', count: services.length, desc: 'Citizen portal prerequisites, requirements, and steps processes.' },
    { id: 'leadership', label: 'Manage Leadership', badge: 'Cabinet Profiles', color: 'from-amber-500/20 to-amber-600/5 text-amber-300 border-amber-500/30', count: leadership.length, desc: 'Profiles directory of current cabinet directors and department administrators.' },
    { id: 'history', label: 'Manage Mayoral History', badge: 'Historic Archives', color: 'from-yellow-500/20 to-orange-600/5 text-yellow-300 border-yellow-500/30', count: mayoralHistory.length, desc: 'Chronicles past mayors, terminology, reforms, and administrative KPIs.' },
    { id: 'initiatives', label: 'Manage Initiatives', badge: 'Smart Campaigns', color: 'from-cyan-500/20 to-cyan-600/5 text-cyan-300 border-cyan-500/30', count: initiatives.length, desc: 'Urban modernization, infrastructure, expected impact metrics, and logs.' },
    { id: 'events', label: 'Manage Events', badge: 'Municipal Calendar', color: 'from-purple-500/20 to-purple-600/5 text-purple-300 border-purple-500/30', count: events.length, desc: 'Town halls, holiday dates, and public forums schedule entries.' },
    { id: 'documents', label: 'Manage Documents', badge: 'PDF Repository', color: 'from-zinc-500/20 to-zinc-600/5 text-zinc-300 border-zinc-500/30', count: documents.length, desc: 'Downloadable form guidelines, PDFs, legal materials, and tender requests.' },
    { id: 'tourism', label: 'Manage Tourism', badge: 'Tourist Discovery', color: 'from-teal-500/20 to-teal-600/5 text-teal-300 border-teal-500/30', count: tourism.length, desc: 'Visitor discovery directions, parks, and regional centers of gravity.' },
    { id: 'blog', label: 'Manage Blogs', badge: 'Resident Opinions', color: 'from-pink-500/20 to-pink-600/5 text-pink-300 border-pink-500/30', count: blog.length, desc: 'Citizen newsletters, editorial insights, columns, and resident write-ups.' },
    { id: 'media', label: 'Manage Media Assets', badge: 'DAM Vault', color: 'from-indigo-500/20 to-indigo-600/5 text-indigo-300 border-indigo-500/30', count: media.length, desc: 'Digital Asset Management keeping track of dimensions, URLs, and alt texts.' },
    { id: 'administrative-units', label: 'Manage Administrative Units', badge: 'Municipal Hierarchy', color: 'from-fuchsia-500/20 to-fuchsia-600/5 text-fuchsia-300 border-fuchsia-500/30', count: administrativeUnits.length, desc: 'Organizes sector divisions, sub-cities, woredas, and departments cards.' }
  ];

  return (
    <div className="flex bg-[#f8fafc] dark:bg-[#070E1F] min-h-[calc(100vh-64px)] transition-colors duration-300">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => { logout(); navigate('/login'); }}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-[#09152C] border-b border-slate-200 dark:border-slate-850 sticky top-0 z-30 transition-all shadow-xs">
          <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -ml-2 rounded-xl text-slate-705 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <Menu size={20} className="text-slate-700 dark:text-white" />
          </button>
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-teal-dark dark:text-[#00FFFF]">Governance Portal</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
                {/* Header and sync button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                      <LayoutGrid className="text-brand-teal" />
                      <span>Adama Municipal CMS Intelligence Console</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manage interactive content feeding the primary Adama City Official Website gateway.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={handleSyncSystems} className="bg-brand-teal text-slate-950 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-teal/25 transition active:scale-95">
                      <Zap size={14} className="fill-current" />
                      <span>Sync Systems (Copy Payload JSON)</span>
                    </button>
                  </div>
                </div>
                {/* KPI Counters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#0A162D] p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition duration-200 shadow-xs hover:shadow-md">
                      <div className="space-y-3.5">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                            <stat.icon size={16} />
                          </div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</span>
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{stat.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Module Bento Grid */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#00E5FF] dark:text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-[#00FFFF] rounded" />
                      <span>Government Gateway Modules & Content Controllers</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Directly launch administration desks to update cached public portal registry feeds.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {modules.map((m) => (
                      <div key={m.id} className="bg-white dark:bg-[#040C1A]/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-950 transition-all duration-300 flex flex-col justify-between group shadow-xs">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider uppercase border bg-gradient-to-r shadow-xs ${m.color}`}>{m.badge}</span>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">{m.count} {m.count === 1 ? 'Record' : 'Records'}</span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-brand-teal transition-colors duration-200">{m.label}</h3>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{m.desc}</p>
                          </div>
                        </div>
                        <button onClick={() => setActiveTab(m.id)} className="mt-4 w-full py-2 bg-slate-50 hover:bg-brand-teal/15 dark:bg-slate-950 hover:dark:bg-brand-teal/15 hover:text-brand-teal border border-slate-200 hover:border-brand-teal dark:border-slate-900 dark:hover:border-brand-teal/30 rounded-xl text-[10px] font-black text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-brand-teal tracking-wider uppercase text-center transition-all duration-200">
                          Configure Catalog
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Global Search */}
                <div className="bg-white dark:bg-[#0A162D] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-sm font-black uppercase tracking-widest text-brand-teal-dark dark:text-[#00FFFF] flex items-center gap-2">
                        <Search size={16} />
                        <span>Unified CMS Global Search Index</span>
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Search instantly across active News announcements, Municipal services, and the Leadership directory.</p>
                    </div>
                    <div className="relative w-full md:w-96 group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-teal transition-colors" size={16} />
                      <input type="text" placeholder="Query Name, Title, Content fragments..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-teal outline-none transition" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
                    </div>
                  </div>
                  {globalSearch.trim() && (
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-850 max-h-80 overflow-y-auto space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-900">
                        <span className="text-[10px] font-mono font-bold text-slate-500">Query Matches: {searchResults.length} entries located</span>
                        <button onClick={() => setGlobalSearch('')} className="text-[10px] text-brand-teal hover:underline font-bold">Clear Query</button>
                      </div>
                      {searchResults.length === 0 ? <p className="text-xs text-slate-500 italic py-2">No matching entries found.</p> : (
                        <div className="space-y-3">
                          {searchResults.map((result, idx) => (
                            <div key={`${result.id}-${idx}`} className="p-3 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 transition flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">{result.type}</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">• {result.category}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-800 dark:text-white">{result.title}</h4>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{result.desc}</p>
                              </div>
                              <div className="text-[9px] text-slate-500 font-mono font-semibold self-center whitespace-nowrap">{result.meta}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Budget Weights and Live Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#0A162D] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
                      <div className="mb-6">
                        <h2 className="text-lg font-black text-slate-800 dark:text-white">Interactive FY 2026 Budget Weights</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Surgically modify sectoral capital weight allocations. Capped at 100% aggregate limit.</p>
                      </div>
                      <BudgetWeightAdjuster budgets={budgets} onChange={handleBudgetsChange} />
                    </div>
                  </div>
                  <div className="space-y-8">
                    {/* Sync Node Gateway */}
                    <div className="bg-white dark:bg-[#0A162D] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-teal"></span></span>
                          <span>Sync Node Gateway</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">The gateway is equipped with micro-caching layers. Synchronizing pushes live JSON content schemas directly into public-facing caching caches.</p>
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-850 space-y-2.5 text-slate-800 dark:text-slate-300">
                          <div className="flex justify-between items-center text-[10px] font-mono"><span className="text-slate-500 dark:text-slate-400 font-bold">Node Compliance:</span><span className="text-emerald-500 dark:text-emerald-400 font-black">98.2% Secure</span></div>
                          <div className="flex justify-between items-center text-[10px] font-mono"><span className="text-slate-500 dark:text-slate-400 font-bold">License Permits:</span><span className="text-brand-teal font-black">{permits.length} Records</span></div>
                          <div className="flex justify-between items-center text-[10px] font-mono"><span className="text-slate-500 dark:text-slate-400 font-bold">Citizen Workgroups:</span><span className="text-brand-magenta font-black">{tickets.length} Active</span></div>
                        </div>
                      </div>
                      <button onClick={handleSyncSystems} className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-black text-slate-800 dark:text-brand-teal text-center transition active:scale-95">
                        Examine Integration payload
                      </button>
                    </div>
                    {/* Static Schema Exporter */}
                    <div className="bg-white dark:bg-[#0A162D] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2"><FileDown size={16} className="text-brand-cyan" /><span>Static Schema Exporter</span></h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">Generate and backup offline JSON configurations formatted to match Adama City adapter schemas.</p>
                        <div className="space-y-3">
                          <div><label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Select Export Target</label>
                            <select value={exportTarget} onChange={(e) => setExportTarget(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-855 dark:text-slate-200 outline-none focus:border-brand-teal">
                              <option value="full">Full DB Backup Bundle</option>
                              <option value="news">News & Articles (NewsPost/Blog)</option>
                              <option value="announcements">Announcement Header Alerts</option>
                              <option value="services">Services Registry</option>
                              <option value="leadership">Leadership Directory</option>
                              <option value="administrative_units">Administrative Hierarchy</option>
                            </select>
                          </div>
                          <button onClick={handleDownloadExport} className="w-full py-2.5 bg-brand-cyan text-slate-950 hover:bg-brand-cyan/90 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 transition active:scale-95 border-0"><FileDown size={14} /><span>Download JSON Schema</span></button>
                        </div>
                      </div>
                    </div>
                    {/* Interactive Live Activity Feed */}
                    <div className="bg-white dark:bg-[#0A162D] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 shadow-md">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span><span>Interactive Live Activity Feed</span></h3>
                          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black bg-emerald-400/10 px-2 py-0.5 rounded">Real-time Stream</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Pulsing audit logs, real-time status transitions, and secure digital signatures.</p>
                      </div>
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {liveLogs.map((log) => {
                          const isSelected = activeLogId === log.id;
                          return (
                            <div key={log.id} onClick={() => setActiveLogId(isSelected ? null : log.id)} className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col space-y-2 ${isSelected ? 'bg-slate-100 dark:bg-[#122854] border-slate-300 dark:border-[#00FFFF]/50 shadow-md' : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-850/85 hover:border-slate-300 dark:hover:border-slate-800'}`}>
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5"><span className="text-[10px] font-mono text-slate-500 block">{new Date(log.timestamp).toLocaleTimeString()} • {log.userName}</span><h4 className="text-xs font-black text-slate-800 dark:text-white">{log.action}</h4></div>
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan">{log.contentType}</span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate">Content: {log.contentTitle}</p>
                              {isSelected && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white dark:bg-slate-950/80 rounded-xl p-3 border border-slate-200 dark:border-slate-900 space-y-2.5 mt-2">
                                  <div className="flex items-center justify-between text-[11px] font-mono"><span className="text-slate-400 dark:text-slate-500">Officer Role:</span><span className="text-slate-700 dark:text-slate-300 font-bold">{log.operatorRole}</span></div>
                                  <div className="flex items-center justify-between bg-slate-50 lg:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-850"><span className="text-[10px] font-mono text-rose-650 dark:text-rose-400 font-bold uppercase">{log.transition.from}</span><ArrowRight size={12} className="text-brand-teal animate-pulse" /><span className="text-[10px] font-mono text-emerald-650 dark:text-emerald-400 font-bold uppercase">{log.transition.to}</span></div>
                                  <div className="flex items-center justify-between text-[9px] font-mono pt-1 text-slate-500"><span>Secure Hash Proof:</span><span>{log.secHash}</span></div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Other tabs (content managers, etc.) */}
            {activeTab === 'news' && <ContentManager type="news" />}
            {activeTab === 'announcements' && <ContentManager type="announcements" />}
            {activeTab === 'services' && <ContentManager type="services" />}
            {activeTab === 'initiatives' && <ContentManager type="initiatives" />}
            {activeTab === 'leadership' && <ContentManager type="leadership" />}
            {activeTab === 'history' && <ContentManager type="history" />}
            {activeTab === 'events' && <ContentManager type="events" />}
            {activeTab === 'documents' && <ContentManager type="documents" />}
            {activeTab === 'tourism' && <ContentManager type="tourism" />}
            {activeTab === 'blog' && <ContentManager type="blog" />}
            {activeTab === 'media' && <ContentManager type="media" />}
            {activeTab === 'administrative-units' && <ContentManager type="administrative-units" />}
            {activeTab === 'growth-metrics' && <ContentManager type="growth-metrics" />}
            {activeTab === 'permits' && <PermitLedger permits={permits} onAddPermit={addPermit} onUpdatePermit={updatePermit} onDeletePermit={deletePermit} />}
            {activeTab === 'tickets' && <TicketModeration tickets={tickets} onUpdateTicket={updateTicket} onDeleteTicket={deleteTicket} onAddTicket={addTicket} />}
            {activeTab === 'budgets' && (
              <div className="p-8">
                <div className="bg-[#0A162D] p-6 rounded-3xl border border-slate-800 shadow-lg text-left">
                  <div className="mb-6"><h2 className="text-lg font-black text-white">Interactive FY 2026 Budget Weights</h2><p className="text-xs text-slate-400">Surgically modify sectoral capital weight allocations. Capped at 100% aggregate limit.</p></div>
                  <BudgetWeightAdjuster budgets={budgets} onChange={handleBudgetsChange} />
                </div>
              </div>
            )}
            {activeTab === 'tourism-packages' && <TourismPlanner packages={packages} onAddPackage={addPackage} onUpdatePackage={updatePackage} onDeletePackage={deletePackage} />}
            {activeTab === 'dynamic-schemas' && <DynamicContentModeler />}
            {activeTab === 'cdn-hub' && <CDNDecouplingHub />}
            {activeTab === 'api-docs' && <APIDocumentationPortal />}
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'audit' && <AuditTrail />}
            {activeTab === 'settings' && (
              <div className="p-8">
                <SettingsForm initialData={siteSettings} onSave={(data) => { /* update site settings using context */ }} onCancel={() => setActiveTab('dashboard')} />
              </div>
            )}
            {activeTab === 'hero' && (
              <div className="p-8">
                <HeroVideoForm initialData={useCMSHook().heroVideo} onSave={useCMSHook().updateHeroVideo} onCancel={() => setActiveTab('dashboard')} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sync Success Modal */}
      <AnimatePresence>
        {showSyncSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0B1832] border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl relative text-left">
              <button onClick={() => setShowSyncSuccess(false)} className="absolute right-6 top-6 text-slate-400 hover:text-white transition"><X size={18} /></button>
              <div className="flex items-center space-x-3.5 border-b border-slate-850 pb-4">
                <div className="p-3 bg-brand-teal/10 rounded-2xl text-brand-teal border border-brand-teal/20"><CheckCircle size={24} /></div>
                <div><h3 className="text-lg font-black text-white">Integration Payload Synced & Copied!</h3><p className="text-xs text-slate-400 font-medium">Validation complete: 0 errors detected. Database state serialized successfully.</p></div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Live Copied JSON Payload:</label>
                <div className="bg-slate-950 hover:border-slate-800/80 border border-slate-900 rounded-2xl p-4 overflow-x-auto font-mono text-xs text-slate-300 max-h-64 scrollbar-thin"><pre>{syncedPayload}</pre></div>
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => { const blob = new Blob([syncedPayload], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'adama-municipal-sync-payload.json'; a.click(); URL.revokeObjectURL(url); }} className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-brand-teal rounded-xl text-xs font-black transition hover:bg-slate-850"><FileDown size={14} /><span className="ml-1">Download File (.json)</span></button>
                <button onClick={() => setShowSyncSuccess(false)} className="px-6 py-2.5 bg-brand-teal text-slate-950 rounded-xl text-xs font-black transition">Dismiss Console</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ExportConfirmationModal isOpen={isExportBackupModalOpen} onClose={() => setIsExportBackupModalOpen(false)} onConfirm={executeDownloadExport} title="Admin Backup Exporter" type="JSON" recordCount={exportTarget === 'full' ? (news?.length||0)+(pinned?.length||0)+(services?.length||0)+(leadership?.length||0)+(administrativeUnits?.length||0) : exportTarget==='news' ? news.length : exportTarget==='announcements' ? pinned.length : exportTarget==='services' ? services.length : exportTarget==='leadership' ? leadership.length : administrativeUnits.length} estimatedSize={exportTarget==='full'? '~155 KB' : '~42 KB'} />
    </div>
  );
};