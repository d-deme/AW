import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, ChevronRight, MapPin, ThumbsUp, Upload, Shield, Clock, Send, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface CitizenIssue {
  id: string;
  category: 'Infrastructure' | 'Utilities' | 'Parks & Green' | 'Safety' | 'General';
  title: string;
  description: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Received' | 'Assigned' | 'In Progress' | 'Resolved';
  votes: number;
  date: string;
  hasVoted?: boolean;
}

const INITIAL_ISSUES: CitizenIssue[] = [
  {
    id: 'issue-1',
    category: 'Infrastructure',
    title: 'Adama-Addis Toll Connection Pothole',
    description: 'Deep pavement crack forming at the highway exit ramp. Extremely dangerous during high-speed evening traffic.',
    location: 'Woreda 04, East District',
    priority: 'High',
    status: 'In Progress',
    votes: 38,
    date: '3 hours ago',
  },
  {
    id: 'issue-2',
    category: 'Utilities',
    title: 'Water Mains Overflow / Leakage',
    description: 'Municipal water main is spraying clean water onto the curb. Flooding access walkways.',
    location: 'Woreda 01, Central Sub-City',
    priority: 'High',
    status: 'Resolved',
    votes: 56,
    date: '1 day ago',
  },
  {
    id: 'issue-3',
    category: 'Parks & Green',
    title: 'Broken Lantern Post at Unity Garden Park',
    description: 'Two solar lanterns are shattered near the family running tracks, causing dark spots after sunset.',
    location: 'Central District Park',
    priority: 'Medium',
    status: 'Assigned',
    votes: 19,
    date: 'Yesterday',
  }
];

export const IssueReporter = () => {
  const [activeTab, setActiveTab] = useState<'submit' | 'registry'>('submit');
  const [issues, setIssues] = useState<CitizenIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New issue form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Infrastructure' | 'Utilities' | 'Parks & Green' | 'Safety' | 'General'>('Infrastructure');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch dynamic issues from CMS backend
  const loadIssues = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTickets();
      if (Array.isArray(data)) {
        const mapped: CitizenIssue[] = data.map((t: any) => ({
          id: t.id || `issue-${Math.random()}`,
          category: t.category || 'General',
          title: t.summary || t.title || 'Untitled Issue',
          description: t.detailed_body || t.description || 'No description provided.',
          location: t.location_woreda || t.location || 'Adama Region',
          priority: t.priority || (t.votes > 40 ? 'High' : (t.votes > 20 ? 'Medium' : 'Low')),
          status: (t.status === 'Dispatched' ? 'Assigned' : t.status) || 'Received',
          votes: t.votes || 0,
          date: 'Synced Live'
        }));
        setIssues(mapped);
      }
    } catch (err) {
      console.error("Failed to load live issues, using defaults:", err);
      // Fallback in case of server error
      setIssues(INITIAL_ISSUES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadProgress(10);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null;
          if (prev >= 100) {
            clearInterval(interval);
            setAttachedImage(URL.createObjectURL(file));
            return 100;
          }
          return prev + 30;
        });
      }, 150);
    }
  };

  const handleVote = async (id: string) => {
    // Optimistic UI upvote
    setIssues(prev => prev.map(issue => {
      if (issue.id === id) {
        if (issue.hasVoted) {
          return { ...issue, votes: Math.max(0, issue.votes - 1), hasVoted: false };
        }
        return { ...issue, votes: issue.votes + 1, hasVoted: true };
      }
      return issue;
    }));

    try {
      await fetch(`/api/tickets/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.warn("Could not save vote to backend ledger", err);
    }
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) return;

    setIsSubmitting(true);

    try {
      // POST directly matching CMS Database Schema keys:
      const payload = {
        category,
        summary: title,
        detailed_body: description,
        location_woreda: location,
        votes: 1,
        status: 'Received'
      };

      await api.createTicket(payload);
      
      // Reload tickets from server and finalize success sequence
      await loadIssues();

      setIsSubmitting(false);
      setSuccessMessage(true);

      // Clean form
      setTitle('');
      setDescription('');
      setLocation('');
      setCategory('Infrastructure');
      setPriority('Medium');
      setAttachedImage(null);
      setUploadProgress(null);

      // Reset success screen after 3s
      setTimeout(() => {
        setSuccessMessage(false);
        setActiveTab('registry'); // auto navigate to registry to see the ticket
      }, 3000);
    } catch (err) {
      console.error("Failed to post online ticket:", err);
      setIsSubmitting(false);
    }
  };

  const getStatusBg = (status: CitizenIssue['status']) => {
    switch (status) {
      case 'Received': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'In Progress': return 'bg-cyan-50 text-cyan border-cyan-100/30';
      case 'Resolved': return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  return (
    <div className="card p-10 md:p-14 border border-neutral-200">
      {/* Tab select */}
      <div className="flex bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 mb-10">
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'submit' ? 'bg-navy text-white shadow-md' : 'text-neutral-500 hover:text-navy'}`}
        >
          New Citizen Ticket
        </button>
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'registry' ? 'bg-navy text-white shadow-md' : 'text-neutral-500 hover:text-navy'}`}
        >
          Track Public Registry
          <span className="px-1.5 py-0.5 bg-neutral-200 text-navy rounded-full text-[9px] font-black group-hover:bg-white">{issues.length}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'submit' ? (
          <motion.div
            key="submit-pane"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {successMessage ? (
              <div className="py-16 text-center space-y-6">
                <div className="w-20 h-20 bg-green-50 text-green-600 border border-green-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-navy leading-tight">Ticket Tracked Successfully</h3>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto font-medium">
                  Your ticket was registered in the Adama Public Digital Registry. Engineering teams will inspect your report shortly.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-navy uppercase tracking-widest bg-neutral-50 py-3 px-6 rounded-xl border border-neutral-100 w-fit mx-auto animate-pulse">
                  <Clock size={14} /> Navigating to registry...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitIssue} className="space-y-8">
                <div>
                  <h4 className="text-lg font-bold text-navy mb-1 leading-tight flex items-center gap-2">
                    <Sparkles size={16} className="text-cyan animate-pulse" /> Community Support Desk
                  </h4>
                  <p className="text-xs text-neutral-400 font-medium">Report non-emergency urban issues to public service dispatch teams.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">Short Incident Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Broken water mains line, dangerous road pothole..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full bg-neutral-50 border border-neutral-200 p-5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 transition-all appearance-none"
                    >
                      <option value="Infrastructure">Infrastructure & Roads</option>
                      <option value="Utilities">Water & Electricity Utilities</option>
                      <option value="Parks & Green">Parks & Reforestation</option>
                      <option value="Safety">Public Safety Concerns</option>
                      <option value="General">General Inquiries</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">Priority</label>
                    <div className="flex gap-2">
                      {(['Low', 'Medium', 'High'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                            priority === p
                              ? p === 'High'
                                ? 'bg-red-50 text-red-600 border-red-200 ring-2 ring-red-500/20'
                                : p === 'Medium'
                                ? 'bg-cyan-50 text-cyan border-cyan-200 ring-2 ring-cyan/20'
                                : 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                              : 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">Exact Location / Woreda Details</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Woreda 03, near Sodere junction road..."
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 pl-12 pr-5 py-5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">Issue Description & Impact</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please specify maximum details. Who is impacted? Is there safety or property damage risks?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 p-5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 transition-all resize-none"
                  />
                </div>

                {/* Simulated File Upload Panel */}
                <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleSimulateUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {uploadProgress === null ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center p-4 hover:bg-neutral-100/50 rounded-xl transition-colors gap-2"
                    >
                      <Upload className="text-neutral-400" size={20} />
                      <span className="text-xs font-bold text-navy uppercase tracking-widest">Attach Incident Image</span>
                      <span className="text-[9px] text-neutral-400 font-medium">Supports JPG, PNG up to 5MB</span>
                    </button>
                  ) : uploadProgress < 100 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-navy uppercase tracking-widest">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-navy">Photo Attached Successfully</p>
                          <p className="text-[9px] text-neutral-400 font-medium">Ready to bundle with your report</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setAttachedImage(null); setUploadProgress(null); }}
                        className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-5 text-xs uppercase tracking-widest shadow-xl shadow-cyan/10 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="animate-spin" size={14} /> Tracking Ticket...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Index Ticket Registry
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="registry-pane"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-navy leading-tight">Live Incidents Feed</h4>
                <p className="text-xs text-neutral-400 font-medium">Verify or upvote reported issues to raise awareness to city service departments.</p>
              </div>
              <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                <Shield size={12} className="text-cyan" /> Secure Public Ledger
              </div>
            </div>

            <div className="space-y-6">
              {issues.map(issue => (
                <div key={issue.id} className="p-6 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 transition-all flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden group">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-neutral-100 text-neutral-500 rounded-lg">
                        {issue.category}
                      </span>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border rounded-lg ${getStatusBg(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-navy mb-1">{issue.title}</h5>
                      <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-lg">{issue.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-medium text-neutral-400">
                      <span className="flex items-center gap-1.5"><MapPin size={12} className="text-cyan shrink-0" /> {issue.location}</span>
                      <span>•</span>
                      <span>{issue.date}</span>
                    </div>
                  </div>

                  <div className="flex justify-between md:flex-col md:justify-center md:items-end shrink-0 gap-4 md:pl-6 md:border-l border-neutral-100">
                    <button
                      onClick={() => handleVote(issue.id)}
                      className={`px-4 py-3 md:py-4 md:w-24 rounded-xl border flex md:flex-col items-center justify-center gap-2 transition-all ${
                        issue.hasVoted
                          ? 'bg-cyan/10 text-cyan border-cyan/20 font-black'
                          : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100'
                      }`}
                      aria-label="Upvote reported issue"
                    >
                      <ThumbsUp size={14} className={issue.hasVoted ? 'fill-cyan animate-bounce' : ''} />
                      <span className="text-[10px] font-bold">{issue.votes} Votes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
