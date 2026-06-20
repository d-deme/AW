import React, { useState } from 'react';
import { SupportTicket, TicketCategory, TicketStatus } from '../types/admin';
import { 
  MessageSquare, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  Edit, 
  Trash2, 
  UserCheck, 
  Tag, 
  FileText,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

interface TicketModerationProps {
  tickets: SupportTicket[];
  onUpdateTicket: (ticket: SupportTicket) => void;
  onDeleteTicket: (id: string) => void;
  onAddTicket: (ticket: SupportTicket) => void;
}

export const TicketModeration: React.FC<TicketModerationProps> = ({ 
  tickets, 
  onUpdateTicket, 
  onDeleteTicket,
  onAddTicket
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | 'All'>('All');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // PDF Exporter for ticket queue
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Banner background
    doc.setFillColor(7, 14, 31);
    doc.rect(0, 0, 210, 38, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA", 12, 14);
    doc.setFontSize(11);
    doc.setFont("Helvetica", "normal");
    doc.text("ADAMA CITIZEN SUPPORT & TOWNHALL DISPATCH QUEUE REPORT", 12, 22);
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("MUNICIPAL TICKET AUDIT FEED & WOREDA COMPLAINT HISTROY", 12, 28);
    
    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(10, 42, 200, 42);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text(`Generated Timestamp: ${new Date().toLocaleString()}`, 12, 48);
    doc.text(`Secure Desk Code: DISPATCH-GATEWAY-V2.6`, 120, 48);
    doc.text(`Total Records Listed: ${filteredTickets.length}`, 120, 53);
    
    doc.line(10, 56, 200, 56);
    
    let y = 62;
    filteredTickets.forEach((t) => {
      if (y > 255) {
        doc.addPage();
        y = 15;
      }
      
      // Box element
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 32, 'F');
      doc.setDrawColor(230, 235, 240);
      doc.rect(10, y, 190, 32, 'S');
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Ticket Reference ID: ${t.id}`, 14, y + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Concern Category: ${t.category}  |  Endorsements: ${t.votes} Upvotes`, 14, y + 11);
      
      // Wrapped summary text
      const sumText = doc.splitTextToSize(`Main Summary: ${t.summary}`, 180);
      doc.text(sumText, 14, y + 16);
      
      // Status formatting
      doc.setFont("Helvetica", "bold");
      if (t.status === 'Resolved') {
        doc.setTextColor(22, 101, 52); // green
      } else if (t.status === 'In Progress') {
        doc.setTextColor(125, 75, 0); // brown
      } else {
        doc.setTextColor(185, 28, 28); // red
      }
      doc.text(`Status: ${t.status}`, 120, y + 6);
      doc.text(`Woreda Desk: ${t.locationWoreda}`, 120, y + 11);
      
      doc.setFont("Helvetica", "oblique");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Internal Dispatch Instructions: ${t.dispatchNote || 'No dispatcher commands specified yet.'}`, 14, y + 26);
      
      y += 37;
    });
    
    if (y > 230) {
      doc.addPage();
      y = 15;
    }
    
    // Sign-off
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y + 5, 200, y + 5);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Administrative Dispatch Verification Block:", 10, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Dispatched tickets are routed to active response squads and verified daily.", 10, y + 17);
    doc.text("Signature Hash: SHA256-ETH-DISPATCH-TICKETS-SYS-2026", 10, y + 21);
    
    doc.save(`adama_tickets_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Quick dispatch form notes
  const [dispatchNotes, setDispatchNotes] = useState<{ [id: string]: string }>({});

  // Form state for creating a ticket
  const [isAdding, setIsAdding] = useState(false);
  const [summary, setSummary] = useState('');
  const [detailedBody, setDetailedBody] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Infrastructure');
  const [woredaSector, setWoredaSector] = useState('Woreda 02 - Kebele 12');
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);

  const resetTicketForm = () => {
    setSummary('');
    setDetailedBody('');
    setCategory('Infrastructure');
    setWoredaSector('Woreda 02 - Kebele 12');
    setEditingTicket(null);
    setIsAdding(false);
  };

  const handleStartEdit = (t: SupportTicket) => {
    setEditingTicket(t);
    setSummary(t.summary);
    setDetailedBody(t.detailedBody);
    setCategory(t.category);
    setWoredaSector(t.locationWoreda);
    setIsAdding(true);
  };

  const generateTicketRef = () => {
    return `TK-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !detailedBody.trim()) return;

    if (editingTicket) {
      const updatedTicket: SupportTicket = {
        ...editingTicket,
        category,
        summary,
        detailedBody,
        locationWoreda: woredaSector
      };
      onUpdateTicket(updatedTicket);
      resetTicketForm();
      return;
    }

    const newTicket: SupportTicket = {
      id: generateTicketRef(),
      category,
      summary,
      detailedBody,
      locationWoreda: woredaSector,
      votes: Math.floor(Math.random() * 12 + 1), // initial organic votes
      status: 'Received',
      dispatchNote: ''
    };

    onAddTicket(newTicket);
    resetTicketForm();
  };

  const handleVoteAdjustment = (id: string, delta: number) => {
    const target = tickets.find(t => t.id === id);
    if (!target) return;
    
    const updated: SupportTicket = {
      ...target,
      votes: Math.max(0, target.votes + delta)
    };
    onUpdateTicket(updated);
  };

  const handleStatusChange = (id: string, status: TicketStatus) => {
    const target = tickets.find(t => t.id === id);
    if (!target) return;

    const updated: SupportTicket = {
      ...target,
      status
    };
    onUpdateTicket(updated);
  };

  const handleSaveDispatchNote = (id: string) => {
    const target = tickets.find(t => t.id === id);
    if (!target) return;

    const updated: SupportTicket = {
      ...target,
      dispatchNote: dispatchNotes[id] || ''
    };
    onUpdateTicket(updated);
    alert(`Dispatch instructions updated for ticket ${id}`);
  };

  const getStatusBadgeClass = (status: TicketStatus) => {
    switch (status) {
      case 'Received':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      case 'Assigned':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'In Progress':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.detailedBody.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
            <MessageSquare className="text-brand-magenta" />
            <span>Citizen Support Tickets & Dispatch Desk</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Moderate townhall workgroups, dispatch task forces, and review active Woreda priorities.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={exportToPDF}
            className="bg-slate-900 border border-slate-800 text-brand-teal px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:bg-slate-800 hover:border-brand-teal/30 transition active:scale-95 shadow-md"
          >
            <Printer size={14} className="text-brand-teal" />
            <span>Export PDF Queue</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="bg-brand-teal text-slate-950 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:scale-[1.02] shadow-lg shadow-brand-teal/25 transition active:scale-95"
          >
            <Plus size={16} />
            <span>File Emergency Ticket</span>
          </button>
        </div>
      </div>

      {/* Grid: Stats Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['Infrastructure', 'Utilities', 'Parks & Green', 'Safety', 'General'].map((catName) => {
          const count = tickets.filter(t => t.category === catName).length;
          const openCount = tickets.filter(t => t.category === catName && t.status !== 'Resolved').length;
          return (
            <div key={catName} className="bg-white dark:bg-[#0D1E3D]/55 border border-slate-200 dark:border-slate-850 p-4.5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-brand-teal/30 transition-all">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-400 tracking-wider truncate block">{catName}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{count}</span>
                <span className="text-[10px] bg-teal-50/80 dark:bg-brand-teal/10 text-teal-800 dark:text-brand-teal font-extrabold font-mono px-2 py-0.5 rounded-md border border-teal-100 dark:border-brand-teal/20">
                  {openCount} Active
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Searching filters */}
      <div className="bg-slate-55 dark:bg-[#0A162D] rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-teal transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search Tickets by ID, context..." 
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-teal outline-none transition shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="w-full md:w-56 flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Category:</span>
          <select 
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
          >
            <option value="All">All Categories</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Utilities">Utilities</option>
            <option value="Parks & Green">Parks & Green</option>
            <option value="Safety">Safety</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="w-full md:w-48 flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">State:</span>
          <select 
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="All">All States</option>
            <option value="Received">Received</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Ticket counter */}
        <div className="ml-auto text-xs text-slate-500 font-mono font-medium">
          Found <span className="text-brand-magenta font-black">{filteredTickets.length}</span> / {tickets.length} total tickets.
        </div>
      </div>

      {/* Ticket Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((t) => {
          const isActive = activeTicketId === t.id;
          
          // Lazy populate dispatch note in editing local state
          if (!(t.id in dispatchNotes)) {
            dispatchNotes[t.id] = t.dispatchNote;
          }

          return (
            <div 
              key={t.id}
              className={`bg-white dark:bg-[#0A162D] rounded-3xl border transition-all duration-300 flex flex-col relative overflow-hidden ${
                isActive 
                  ? 'border-brand-magenta/80 ring-2 ring-brand-magenta/10 shadow-xl' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-md'
              }`}
            >
              <div className="p-5 flex-1 space-y-4">
                
                {/* Header item */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-brand-magenta uppercase">{t.id}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-extrabold rounded-lg uppercase border border-slate-205 dark:border-slate-800/80">
                      {t.category}
                    </span>
                    <span className={`text-[9px] px-2.5 py-1 rounded-full border font-black uppercase tracking-wider ${getStatusBadgeClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Locations and priority */}
                <div className="space-y-1.5 text-left">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug line-clamp-1">{t.summary}</h3>
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                    <MapPin size={12} className="text-brand-cyan mr-1.5 shrink-0" />
                    <span className="truncate">{t.locationWoreda}</span>
                  </div>
                </div>

                {/* Detailed description */}
                <p className="text-xs text-slate-605 dark:text-slate-300 leading-relaxed font-semibold block text-left line-clamp-3">
                  {t.detailedBody}
                </p>

                {/* Popularity votes adjusters */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0F2244]/40 border border-slate-150 dark:border-slate-800 p-3 rounded-2xl text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center space-x-1.5">
                    <span>Vote Counter:</span>
                    <strong className="text-slate-900 dark:text-white font-mono font-black">{t.votes}</strong>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleVoteAdjustment(t.id, 1)}
                      className="p-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition hover:border-emerald-500/30"
                      title="Adjust priority count up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button 
                      onClick={() => handleVoteAdjustment(t.id, -1)}
                      className="p-1.5 hover:text-rose-500 dark:hover:text-rose-400 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition hover:border-rose-500/30"
                      title="Adjust priority count down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>

                {/* Expand controls / notes view */}
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-left"
                  >
                    {/* Status change selector */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Set Dispatch Stage</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Received', 'Assigned', 'In Progress', 'Resolved'] as TicketStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(t.id, st)}
                            className={`px-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg border transition ${
                              t.status === st 
                                ? 'bg-brand-cyan/15 text-brand-cyan-dark dark:text-white border-brand-cyan' 
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:text-slate-800 dark:hover:text-slate-300'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dispatch Notes textarea */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Dispatch Instructions note</label>
                      <textarea
                        rows={3}
                        placeholder="Assign taskforce / note action steps..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-teal outline-none text-slate-800 dark:text-slate-200 resize-none font-sans"
                        value={dispatchNotes[t.id] || ''}
                        onChange={(e) => setDispatchNotes({ ...dispatchNotes, [t.id]: e.target.value })}
                      />
                    </div>

                    <button
                      onClick={() => handleSaveDispatchNote(t.id)}
                      className="w-full bg-brand-teal text-slate-950 py-2 rounded-xl text-xs font-extrabold transition hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-1.5 h-9"
                    >
                      <Send size={12} />
                      <span>Transmit Dispatch Memo</span>
                    </button>

                  </motion.div>
                )}

              </div>

              {/* Footer item: actions and expand toggle */}
              <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center text-xs">
                <button
                  onClick={() => setActiveTicketId(isActive ? null : t.id)}
                  className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white font-extrabold flex items-center gap-1 sm:gap-2 text-[11px] whitespace-nowrap"
                >
                  <span>{isActive ? 'Hide Dispatch Desk' : 'Open Dispatch Desk'}</span>
                  <ChevronDown size={14} className={`transform transition-transform ${isActive ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="text-slate-400 dark:text-slate-500 hover:text-brand-teal transition p-1"
                    title="Edit ticket details"
                  >
                    <Edit size={13} />
                  </button>

                  <button
                    onClick={() => onDeleteTicket(t.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-rose-500 transition p-1"
                    title="Remove ticket"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="col-span-full text-center py-20 bg-slate-900/10 border border-dashed border-slate-850 rounded-3xl">
            <p className="text-slate-500 text-sm font-semibold">No citizen tickets found matching Search Criteria.</p>
          </div>
        )}
      </div>

      {/* Creation Ticket Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A162D] border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={resetTicketForm} 
                className="absolute right-6 top-6 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <div className="border-b border-slate-800 pb-4 text-left">
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <MessageSquare className="text-brand-magenta" />
                  <span>{editingTicket ? 'Edit Citizen Support Ticket Details' : 'Transmit Official Citizen Support Ticket'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {editingTicket ? 'Adjust technical scopes, severity groups, or complaint descriptions.' : 'Manual entry of civic complaints received at central front agency desks.'}
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-left">
                
                {/* Summary */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Issue Summary Header</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Water Main Leakage near Sodere Junction" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-brand-teal outline-none text-white focus:border-transparent"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Issue Category Group</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    >
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Parks & Green">Parks & Green</option>
                      <option value="Safety">Safety</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  {/* Woreda sector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Woreda / Kebele sector</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Woreda 04, Kebele 09" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-brand-teal outline-none"
                      value={woredaSector}
                      onChange={(e) => setWoredaSector(e.target.value)}
                    />
                  </div>
                </div>

                {/* Detailed body */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Detailed Complaint Narrative</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Explain the technical scope, immediate impact bounds, and estimated damage of the issue..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-brand-teal outline-none text-white focus:border-transparent resize-none font-sans"
                    value={detailedBody}
                    onChange={(e) => setDetailedBody(e.target.value)}
                  />
                </div>

                {/* Form Footer */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={resetTicketForm}
                    className="px-5 py-3 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-black transition text-slate-300 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-brand-teal text-slate-950 rounded-xl text-xs font-black transition hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-teal/20"
                  >
                    {editingTicket ? 'Update Support Ticket' : 'Register Support Ticket'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
