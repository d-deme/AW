import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  Send, 
  Sparkles,
  Search,
  Filter,
  Plus,
  Compass,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

interface SupportTicket {
  id: string | number;
  category: string;
  summary: string;
  detailed_body: string;
  location_woreda: string;
  status: 'Received' | 'Dispatched' | 'In Progress' | 'Resolved';
  votes: number;
  dateStr?: string;
  hasVoted?: boolean;
}

const CATEGORIES = [
  'Infrastructure',
  'Utilities',
  'Parks & Greenery',
  'Public Safety',
  'General Services'
];

const WOREDAS = [
  'Woreda 01 (Central Sub-City)',
  'Woreda 02 (Southern District)',
  'Woreda 03 (Western Commercial)',
  'Woreda 04 (Eastern Industrial)',
  'Woreda 05 (Eco-Corridor Ward)',
  'Woreda 06 (Gadaa SME Gateway)'
];

export const CitySupportTickets = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'submit'>('registry');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form states matching database schema
  const [summary, setSummary] = useState('');
  const [detailedBody, setDetailedBody] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [locationWoreda, setLocationWoreda] = useState(WOREDAS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load tickets dynamic
  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTickets();
      if (Array.isArray(data)) {
        const mapped: SupportTicket[] = data.map((t: any) => ({
          id: t.id || `ticket-${Math.random()}`,
          category: t.category || 'General Services',
          summary: t.summary || t.title || 'Untitled Ticket',
          detailed_body: t.detailed_body || t.description || 'No detailed body supplied.',
          location_woreda: t.location_woreda || t.location || 'Woreda Not Specified',
          status: t.status || 'Received',
          votes: t.votes || 0,
          dateStr: 'Synced Live'
        }));
        setTickets(mapped);
      }
    } catch (err) {
      console.warn("Error loading dynamic tickets. Rendering seed data:", err);
      // Fallback
      setTickets([
        {
          id: 'mock-1',
          category: 'Infrastructure',
          summary: 'Asphalt rutting near Mojo road intersection',
          detailed_body: 'Significant rutting has occurred on the outer lane, steering light vehicles out of control during afternoon transit.',
          location_woreda: 'Woreda 04 (Eastern Industrial)',
          status: 'In Progress',
          votes: 24,
          dateStr: 'Yesterday'
        },
        {
          id: 'mock-2',
          category: 'Utilities',
          summary: 'Water pressure drop in Block B commercial sector',
          detailed_body: 'Water pressure has fallen below 1.2 bar for domestic and business vendors since Wednesday night.',
          location_woreda: 'Woreda 01 (Central Sub-City)',
          status: 'Dispatched',
          votes: 15,
          dateStr: '2 days ago'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleVote = async (ticketId: string | number) => {
    // Optimistic UI state vote update
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        if (t.hasVoted) {
          return { ...t, votes: Math.max(0, t.votes - 1), hasVoted: false };
        }
        return { ...t, votes: t.votes + 1, hasVoted: true };
      }
      return t;
    }));

    try {
      await fetch(`/api/tickets/${ticketId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.warn("Could not synchronize vote to server ledger", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary || !detailedBody) return;

    setIsSubmitting(true);
    try {
      const payload = {
        category,
        summary,
        detailed_body: detailedBody,
        location_woreda: locationWoreda,
        votes: 1,
        status: 'Received'
      };

      await api.createTicket(payload);
      
      // Reset form
      setSummary('');
      setDetailedBody('');
      setSuccess(true);
      setIsSubmitting(false);

      // Refresh listings
      await loadTickets();

      setTimeout(() => {
        setSuccess(false);
        setActiveTab('registry');
      }, 3000);
    } catch (err) {
      console.error("Submission error:", err);
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.detailed_body.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.location_woreda.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const getStatusBadgeStyles = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Dispatched':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden w-full lg:max-w-2xl">
      {/* Visual Header */}
      <div className="bg-navy p-6 text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,rgba(0,229,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <Compass className="text-cyan animate-spin-slow" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight leading-none font-official">City Support Tickets</h3>
            <p className="text-[11px] text-cyan uppercase tracking-widest font-black mt-1">Municipal Issue & Repair Registry</p>
          </div>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-neutral-100 bg-neutral-50/50 p-2 gap-2">
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'registry' 
              ? 'bg-white text-navy shadow-sm border border-neutral-100' 
              : 'text-neutral-500 hover:text-navy hover:bg-neutral-100/50'
          }`}
        >
          <FileText size={14} /> Active Filings ({filteredTickets.length})
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'submit' 
              ? 'bg-white text-navy shadow-sm border border-neutral-100' 
              : 'text-neutral-500 hover:text-navy hover:bg-neutral-100/50'
          }`}
        >
          <Plus size={14} /> File New Issue
        </button>
      </div>

      {/* Contents */}
      <div className="p-6 h-[460px] overflow-y-auto custom-scrollbar bg-white">
        <AnimatePresence mode="wait">
          {activeTab === 'registry' ? (
            <motion.div
              key="registry-sc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                  <input
                    type="text"
                    placeholder="Search ticket summary, woreda..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-2.5 pl-10 rounded-xl text-xs outline-none focus:ring-1 focus:ring-cyan transition-all font-semibold"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs px-3 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-cyan font-bold"
                >
                  <option value="all">ANY CATEGORY</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="space-y-3 py-4">
                  <div className="h-20 bg-neutral-100 animate-pulse rounded-2xl w-full" />
                  <div className="h-20 bg-neutral-100 animate-pulse rounded-2xl w-full" />
                </div>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => (
                  <div 
                    key={ticket.id}
                    className="border border-neutral-100 hover:border-cyan/30 bg-neutral-50/20 hover:bg-white rounded-2xl p-4.5 transition-all shadow-sm flex items-start gap-4"
                  >
                    {/* Upvote button */}
                    <button
                      onClick={() => handleVote(ticket.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        ticket.hasVoted 
                          ? 'bg-cyan/10 border-cyan text-cyan' 
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-500 hover:text-navy'
                      }`}
                    >
                      <ThumbsUp size={14} className={ticket.hasVoted ? 'fill-cyan' : ''} />
                      <span className="text-[10px] font-bold font-mono mt-1">{ticket.votes}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-cyan font-official">{ticket.category}</span>
                        <span className={`text-[9px] font-bold border rounded px-2 py-0.5 ${getStatusBadgeStyles(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 font-bold ml-auto">{ticket.dateStr}</span>
                      </div>
                      
                      <h4 className="text-xs font-extrabold text-navy leading-snug truncate">{ticket.summary}</h4>
                      <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-relaxed line-clamp-2">{ticket.detailed_body}</p>

                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-bold mt-3 border-t border-neutral-100/60 pt-2">
                        <MapPin size={10} className="text-cyan shrink-0" />
                        <span>Zone: {ticket.location_woreda}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-neutral-400">
                  <AlertCircle className="mx-auto text-neutral-300 mb-2" size={28} />
                  <p className="text-xs font-semibold">No active support tickets found</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="submit-sc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              {success ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-black text-navy leading-none">Ticket Logged Securely</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    Thank you. Your request is registered under the live decentralized municipal audit tracking.
                  </p>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 animate-pulse bg-neutral-50 py-2 px-4 rounded-xl border border-neutral-100 w-fit mx-auto">
                    Returning to local ledger...
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-navy leading-none flex items-center gap-1.5 font-official">
                      <Sparkles size={14} className="text-cyan animate-pulse shrink-0" /> Launch Municipal Action Request
                    </h4>
                    <p className="text-[10px] text-neutral-400 font-medium mt-1">All tickets are publicly logged and dispatched directly to local desks.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-navy">Category Classification</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-cyan font-semibold"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-navy">Neighborhood Zone (Woreda)</label>
                      <select
                        value={locationWoreda}
                        onChange={e => setLocationWoreda(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-cyan font-semibold"
                      >
                        {WOREDAS.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-navy">Summary Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ruptured water line, Broken pavement, Loose solar pole..."
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-cyan transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-navy">Detailed Body Description</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Specify the exact coordinates or landmarks, issue nature, and urgency notes..."
                      value={detailedBody}
                      onChange={e => setDetailedBody(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-cyan transition-all font-medium resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all bg-gradient-to-r from-navy to-cyan border-none hover:opacity-90 rounded-xl text-white shadow-md shadow-cyan/10"
                  >
                    {isSubmitting ? (
                      'Broadcasting Request...'
                    ) : (
                      <>
                        <Send size={12} /> Broadcast Support Ticket
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
