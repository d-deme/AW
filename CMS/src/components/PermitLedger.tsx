import React, { useState } from 'react';
import { PermitRecord, PermitLicenseType, PermitStatusGate, PermitWorkflowLog } from '../types/admin';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Calendar, 
  Building, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  Clipboard, 
  X, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert,
  Save,
  Cpu,
  Bell,
  Check,
  Send,
  Printer,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

interface PermitLedgerProps {
  permits: PermitRecord[];
  onAddPermit: (permit: PermitRecord) => void;
  onUpdatePermit: (permit: PermitRecord) => void;
  onDeletePermit: (id: string) => void;
}

export const PermitLedger: React.FC<PermitLedgerProps> = ({ 
  permits, 
  onAddPermit, 
  onUpdatePermit, 
  onDeletePermit 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PermitStatusGate | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<PermitLicenseType | 'All'>('All');
  const [expandedPermitId, setExpandedPermitId] = useState<string | null>(null);

  // Automated notification center state
  const [notifications, setNotifications] = useState<any[]>(() => {
    const cached = localStorage.getItem('adama_department_notifications');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'NOTIF-1',
        permitId: 'AD-2026-8042',
        applicantName: 'Adama Solar Grid Consortium',
        licenseType: 'Solar Wind Installation',
        gate: 'Action Required',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        leadRole: 'Renewable Infrastructure Department Lead',
        dismissed: false,
        priority: 'High',
        notes: 'Grid placement maps failed standard zoning clearances.'
      },
      {
        id: 'NOTIF-2',
        permitId: 'AD-2026-4410',
        applicantName: 'Abyssinia Warehousing Partner',
        licenseType: 'Commercial Construction',
        gate: 'Action Required',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        leadRole: 'Zoning & Land Division Department Lead',
        dismissed: false,
        priority: 'High',
        notes: 'Deep structure soil impact assessment pending verification.'
      }
    ];
  });

  const [toastAlert, setToastAlert] = useState<string | null>(null);

  // New Permit form states
  const [isAdding, setIsAdding] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [licenseType, setLicenseType] = useState<PermitLicenseType>('Commercial Construction');
  const [submissionDate, setSubmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 45); // Target 45 days in future
    return today.toISOString().split('T')[0];
  });
  const [statusGate, setStatusGate] = useState<PermitStatusGate>('In Review');
  const [completionPercentage, setCompletionPercentage] = useState(10);
  const [assignedDesk, setAssignedDesk] = useState('Central Planning Office (Desk 4)');
  const [editingPermit, setEditingPermit] = useState<PermitRecord | null>(null);

  const resetForm = () => {
    setApplicantName('');
    setCompletionPercentage(10);
    setAssignedDesk('Central Planning Office (Desk 4)');
    setEditingPermit(null);
    setIsAdding(false);
  };

  const handleStartEdit = (p: PermitRecord) => {
    setEditingPermit(p);
    setApplicantName(p.applicantName);
    setLicenseType(p.licenseType);
    setSubmissionDate(p.submissionDate || new Date().toISOString().split('T')[0]);
    setTargetDate(p.targetDecisionDate || new Date().toISOString().split('T')[0]);
    setStatusGate(p.statusGate);
    setCompletionPercentage(p.completionPercentage);
    setAssignedDesk(p.assignedDesk || 'Central Planning Office (Desk 4)');
    setIsAdding(true);
  };

  // Timeline add states
  const [newLogStage, setNewLogStage] = useState('');
  const [newLogFlag, setNewLogFlag] = useState<PermitWorkflowLog['statusFlag']>('Pending');

  // PDF Exporter layout for administrative printing
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header Style
    doc.setFillColor(7, 14, 31);
    doc.rect(0, 0, 210, 38, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA", 12, 14);
    doc.setFontSize(11);
    doc.setFont("Helvetica", "normal");
    doc.text("ADAMA CITY ADMINISTRATION MUNICIPAL DEVELOPMENT LEDGER", 12, 22);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("AUDITED LAND clearance, ARCHITECTURAL LICENSING & ZONING REGISTER", 12, 28);
    
    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(10, 42, 200, 42);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.text(`Report Generation Date: ${new Date().toLocaleString()}`, 12, 48);
    doc.text(`Sign-off Verification: SECURE-LEDGER-V2.6.2`, 120, 48);
    doc.text(`Total Records Displayed: ${filteredPermits.length}`, 120, 53);
    
    doc.line(10, 56, 200, 56);
    
    let y = 62;
    filteredPermits.forEach((p) => {
      if (y > 260) {
        doc.addPage();
        y = 15;
      }
      
      // Card box element
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 28, 'F');
      doc.setDrawColor(230, 235, 240);
      doc.rect(10, y, 190, 28, 'S');
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Reference Code: ${p.id}`, 14, y + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Applicant Entity Name: ${p.applicantName}`, 14, y + 11);
      doc.text(`Specific License Category: ${p.licenseType}`, 14, y + 16);
      doc.text(`Submission: ${p.submissionDate}  |  Assigned Station: ${p.assignedDesk}`, 14, y + 21);
      
      // Status formatting
      doc.setFont("Helvetica", "bold");
      if (p.statusGate === 'Approved') {
        doc.setTextColor(22, 101, 52); // green
      } else if (p.statusGate === 'Action Required') {
        doc.setTextColor(185, 28, 28); // red
      } else {
        doc.setTextColor(125, 75, 0); // brown
      }
      doc.text(`Gate Check: ${p.statusGate} (${p.completionPercentage}% Clear)`, 120, y + 6);
      doc.text(`Target Decision: ${p.targetDecisionDate || 'Immediate'}`, 120, y + 11);
      
      y += 33;
    });
    
    if (y > 230) {
      doc.addPage();
      y = 15;
    }
    
    // Authorization Block
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y + 5, 200, y + 5);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Official Department Sign-off Block:", 10, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.text("This physical document serves as a verified representation of current municipal database states.", 10, y + 17);
    doc.text("Authorized by: Federal Adama Zoning Directorate & Digital Services Registrar.", 10, y + 21);
    doc.text("Verification Hash: SHA256-ETH-ADAMA-2026-950482B", 10, y + 25);
    
    doc.save(`adama_permits_ledger_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Trigger download of permits CSV
  const exportToCSV = () => {
    const headers = ['File Reference ID', 'Applicant Entity', 'License Type', 'Submission Date', 'Target Decision Date', 'Status Gate', 'Completion %', 'Assigned Agency Desk'];
    const rows = permits.map(p => [
      p.id,
      p.applicantName,
      p.licenseType,
      p.submissionDate,
      p.targetDecisionDate,
      p.statusGate,
      `${p.completionPercentage}%`,
      p.assignedDesk
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adama_permits_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe generator for license file codes like "AD-2026-XXXX" using date and random alpha-numeric block
  const generateFileReference = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `AD-2026-${rand}`;
  };

  const handleCreatePermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) return;

    if (editingPermit) {
      const updatedRecord: PermitRecord = {
        ...editingPermit,
        applicantName,
        licenseType,
        submissionDate,
        targetDecisionDate: targetDate,
        statusGate,
        completionPercentage,
        assignedDesk,
      };
      onUpdatePermit(updatedRecord);
      resetForm();
      return;
    }

    const fileRef = generateFileReference();
    const newRecord: PermitRecord = {
      id: fileRef,
      applicantName,
      licenseType,
      submissionDate,
      targetDecisionDate: targetDate,
      statusGate,
      completionPercentage,
      assignedDesk,
      auditLogs: [
        {
          id: `LG-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          stageDescription: `Licensing Docket Opened. Assigned desk: ${assignedDesk}`,
          statusFlag: 'Pending'
        }
      ]
    };

    onAddPermit(newRecord);
    setIsAdding(false);
    
    // Check Status and dispatch alerting notification automatically
    if (statusGate === 'Action Required') {
      triggerNotification(newRecord);
    }

    // Reset Form
    resetForm();
  };

  // Automated core notification dispatcher
  const triggerNotification = (p: PermitRecord) => {
    const leadMap: Record<string, string> = {
      'Commercial Construction': 'Zoning & Land Division Department Lead',
      'Small Business License': 'Revenue & Commercial Licensing Department Lead',
      'Solar Wind Installation': 'Renewable Infrastructure Department Lead',
      'Environmental Impact Certificate': 'Environment & Public Health Department Lead'
    };

    const targetLead = leadMap[p.licenseType] || 'General Administration Lead';
    
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      permitId: p.id,
      applicantName: p.applicantName,
      licenseType: p.licenseType,
      gate: 'Action Required',
      timestamp: new Date().toISOString(),
      leadRole: targetLead,
      dismissed: false,
      priority: 'High' as const,
      notes: `Alert: Status shifted to "Action Required" for ${p.applicantName}. Department escalation standard is active.`
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('adama_department_notifications', JSON.stringify(updatedNotifs));

    setToastAlert(`🔔 NOTIFICATION DISPATCHED: Alerted ${targetLead} for Dossier Ref ${p.id}!`);
    setTimeout(() => {
      setToastAlert(null);
    }, 6000);
  };

  const handleAddTimelineStep = (permitId: string) => {
    if (!newLogStage.trim()) return;
    
    const targetPermit = permits.find(p => p.id === permitId);
    if (!targetPermit) return;

    const newStep: PermitWorkflowLog = {
      id: `LG-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      stageDescription: newLogStage,
      statusFlag: newLogFlag
    };

    const updated: PermitRecord = {
      ...targetPermit,
      auditLogs: [...targetPermit.auditLogs, newStep]
    };

    onUpdatePermit(updated);
    setNewLogStage('');
    setNewLogFlag('Pending');
  };

  const handleDeleteTimelineStep = (permitId: string, logId: string) => {
    const targetPermit = permits.find(p => p.id === permitId);
    if (!targetPermit) return;

    const updated: PermitRecord = {
      ...targetPermit,
      auditLogs: targetPermit.auditLogs.filter(log => log.id !== logId)
    };
    onUpdatePermit(updated);
  };

  const handleUpdateCompletion = (permitId: string, value: number) => {
    const targetPermit = permits.find(p => p.id === permitId);
    if (!targetPermit) return;

    const updated: PermitRecord = {
      ...targetPermit,
      completionPercentage: value
    };
    onUpdatePermit(updated);
  };

  const handleUpdateStatusGate = (permitId: string, gate: PermitStatusGate) => {
    const targetPermit = permits.find(p => p.id === permitId);
    if (!targetPermit) return;

    const updated: PermitRecord = {
      ...targetPermit,
      statusGate: gate,
      auditLogs: [
        ...targetPermit.auditLogs,
        {
          id: `LG-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          stageDescription: `Status updated to ${gate}`,
          statusFlag: gate === 'Approved' ? 'Approved' : gate === 'Action Required' ? 'Action Required' : 'Pending'
        }
      ]
    };
    onUpdatePermit(updated);

    // Automated trigger on Status shift to "Action Required"
    if (gate === 'Action Required') {
      triggerNotification(targetPermit);
    }
  };

  // Searching and Filtering
  const filteredPermits = permits.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.assignedDesk.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || p.statusGate === statusFilter;
    const matchesType = typeFilter === 'All' || p.licenseType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (gate: PermitStatusGate) => {
    switch(gate) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'In Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Zoning Audit':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Field Inspection':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Action Required':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getFlagColor = (flag: PermitWorkflowLog['statusFlag']) => {
    switch (flag) {
      case 'Approved': return 'text-emerald-400';
      case 'Action Required': return 'text-rose-400';
      case 'Warning': return 'text-amber-400';
      case 'Pending': return 'text-brand-teal';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      
      {/* Real-time automated system banner toast */}
      <AnimatePresence>
        {toastAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-brand-magenta text-slate-950 px-5 py-4 rounded-2xl border border-brand-magenta/30 shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5">
              <span className="text-lg">📢</span>
              <p className="text-xs font-black tracking-wide uppercase">{toastAlert}</p>
            </div>
            <button onClick={() => setToastAlert(null)} className="text-slate-950 font-black hover:opacity-75">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top action layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
            <FileCheck className="text-brand-cyan" />
            <span>Permits & Architectural Licensing</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Oversee construction records, zoning clearance, and active land audits.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportToPDF}
            className="bg-slate-900 border border-slate-800 text-brand-teal px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:bg-slate-800 hover:border-brand-teal/30 transition active:scale-95 shadow-md"
          >
            <Printer size={14} className="text-brand-teal" />
            <span>Export PDF Report</span>
          </button>

          <button
            onClick={exportToCSV}
            className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:bg-slate-800 transition active:scale-95 shadow-md"
          >
            <Download size={14} />
            <span>Export CSV Ledger</span>
          </button>
          
          <button
            onClick={() => setIsAdding(true)}
            className="bg-brand-teal text-slate-950 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-teal/25 transition active:scale-95"
          >
            <Plus size={16} />
            <span>New Development Docket</span>
          </button>
        </div>
      </div>

      {/* Interactive Sector Leads Alert Hub Terminal */}
      <div className="bg-[#0c1938] rounded-3xl border border-brand-teal/20 p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-teal/10 rounded-xl text-brand-teal animate-pulse">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">📟 Department Leads Alert Terminal</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Automated broadcasts routed to sector leads following "Action Required" overrides.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg text-brand-cyan font-bold uppercase">
            {notifications.filter(n => !n.dismissed).length} Unsolved Alerts
          </span>
        </div>

        {notifications.filter(n => !n.dismissed).length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">All dispatched lead alerts have been addressed and cleared.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.filter(n => !n.dismissed).map((notif) => (
              <div key={notif.id} className="bg-slate-950/80 rounded-2xl p-4 border border-rose-500/20 hover:border-rose-500/30 transition flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert size={12} />
                      {notif.priority} Priority
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{notif.leadRole}</h4>
                  <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                    Dossier <span className="text-brand-cyan font-mono">{notif.permitId}</span> ({notif.applicantName}) is flagged: <span className="text-rose-400 font-bold">{notif.notes}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                  <span className="text-[9px] font-mono text-slate-400">Escalated: Automated Dispatch</span>
                  <button 
                    onClick={() => {
                      const updated = notifications.map(n => n.id === notif.id ? { ...n, dismissed: true } : n);
                      setNotifications(updated);
                      localStorage.setItem('adama_department_notifications', JSON.stringify(updated));
                    }}
                    className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/25 hover:bg-emerald-500/25 rounded-lg text-[10px] font-black text-emerald-400 flex items-center space-x-1 transition"
                  >
                    <Check size={12} />
                    <span>Acknowledge & Sync</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-[#0A162D] rounded-3xl border border-slate-800 p-5 flex flex-col md:flex-row gap-4 items-center shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-teal transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search Reference, Applicant..." 
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-teal outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* License dropdown filter */}
        <div className="w-full md:w-60 flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Type:</span>
          <select 
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="All">All License Types</option>
            <option value="Commercial Construction">Commercial Construction</option>
            <option value="Small Business License">Small Business License</option>
            <option value="Solar Wind Installation">Solar Wind Installation</option>
            <option value="Environmental Impact Certificate">Environmental Impact Certificate</option>
          </select>
        </div>

        {/* Status Gate dropdown filter */}
        <div className="w-full md:w-56 flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Gate:</span>
          <select 
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Status Gates</option>
            <option value="In Review">In Review</option>
            <option value="Zoning Audit">Zoning Audit</option>
            <option value="Field Inspection">Field Inspection</option>
            <option value="Approved">Approved</option>
            <option value="Action Required">Action Required</option>
          </select>
        </div>

        {/* Records counter */}
        <div className="ml-auto text-xs text-slate-500 font-mono font-medium">
          Showing <span className="text-brand-teal font-black">{filteredPermits.length}</span> of {permits.length} records.
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-[#0A162D] rounded-3xl border border-slate-800 overflow-hidden shadow-xl shadow-slate-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/70 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800/80">
                <th className="px-6 py-4.5">Reference ID</th>
                <th className="px-6 py-4.5">Applicant & Entity</th>
                <th className="px-6 py-4.5">License Track</th>
                <th className="px-6 py-4.5">Submission Details</th>
                <th className="px-6 py-4.5">Completion Tracker</th>
                <th className="px-6 py-4.5">Security Gate</th>
                <th className="px-6 py-4.5 text-center">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredPermits.map((p) => {
                const isExpanded = expandedPermitId === p.id;
                return (
                  <React.Fragment key={p.id}>
                    <tr className="hover:bg-slate-900/10 group transition duration-150">
                      {/* Ref ID */}
                      <td className="px-6 py-4.5 font-mono text-xs font-black text-brand-teal group-hover:text-white transition">
                        {p.id}
                      </td>

                      {/* Applicant Name */}
                      <td className="px-6 py-4.5">
                        <p className="font-extrabold text-white text-sm">{p.applicantName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{p.assignedDesk}</p>
                      </td>

                      {/* License Type */}
                      <td className="px-6 py-4.5 text-xs text-slate-300 font-semibold">
                        {p.licenseType}
                      </td>

                      {/* Submission / Dec Dates */}
                      <td className="px-6 py-4.5 text-xs text-slate-400">
                        <div className="space-y-0.5">
                          <p className="flex items-center">
                            <Clock size={12} className="inline mr-1 text-slate-500" />
                            <span>Sub: {p.submissionDate}</span>
                          </p>
                          <p className="flex items-center text-rose-400/80">
                            <Calendar size={12} className="inline mr-1 text-slate-500" />
                            <span>Target: {p.targetDecisionDate}</span>
                          </p>
                        </div>
                      </td>

                      {/* Completion Tracker info */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center space-x-3 w-40">
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${p.completionPercentage === 100 ? 'bg-emerald-400' : p.completionPercentage < 40 ? 'bg-amber-400' : 'bg-brand-cyan'}`}
                              style={{ width: `${p.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold font-mono text-slate-300">{p.completionPercentage}%</span>
                        </div>
                      </td>

                      {/* Security Gate / Status Dropdown */}
                      <td className="px-6 py-4.5">
                        <select
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border outline-none ${getStatusColor(p.statusGate)} cursor-pointer`}
                          value={p.statusGate}
                          onChange={(e) => handleUpdateStatusGate(p.id, e.target.value as PermitStatusGate)}
                        >
                          <option value="In Review">In Review</option>
                          <option value="Zoning Audit">Zoning Audit</option>
                          <option value="Field Inspection">Field Inspection</option>
                          <option value="Approved">Approved</option>
                          <option value="Action Required">Action Required</option>
                        </select>
                      </td>

                      {/* Expand / Actions */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setExpandedPermitId(isExpanded ? null : p.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700/60 text-slate-300 rounded-lg text-xs transition flex items-center space-x-1"
                            title="Audit Workflow Log"
                          >
                            <span>Logs</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-brand-teal hover:bg-slate-900 rounded-lg transition"
                            title="Edit docket information"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            onClick={() => onDeletePermit(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
                            title="Decommission docket"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Timeline Expansion */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-slate-950/40 px-8 py-6 border-b border-slate-800">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-6"
                            >
                              <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left Side Timeline List */}
                                <div className="flex-1 space-y-4">
                                  <h4 className="text-xs uppercase font-black text-brand-teal tracking-wider flex items-center space-x-2">
                                    <Clipboard size={14} />
                                    <span>Milestone Docket Audit Timeline</span>
                                  </h4>

                                  <div className="relative pl-6 border-l border-slate-800 space-y-5 ml-2.5">
                                    {p.auditLogs.map((log) => (
                                      <div key={log.id} className="relative group">
                                        {/* Radial pin icon indicating state */}
                                        <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-brand-teal ring-4 ring-brand-teal/10" />
                                        
                                        <div className="flex items-start justify-between bg-[#0A162D]/60 border border-slate-800/60 p-3.5 rounded-2xl">
                                          <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-400 font-mono flex items-center gap-2">
                                              <span>{log.date}</span>
                                              <span className="text-slate-700">•</span>
                                              <span className={`text-[10px] uppercase font-black tracking-widest ${getFlagColor(log.statusFlag)}`}>
                                                {log.statusFlag}
                                              </span>
                                            </p>
                                            <p className="text-slate-200 text-sm font-semibold">{log.stageDescription}</p>
                                          </div>
                                          
                                          <button
                                            onClick={() => handleDeleteTimelineStep(p.id, log.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition shrink-0"
                                            title="Delete step"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}

                                    {p.auditLogs.length === 0 && (
                                      <p className="text-xs text-slate-500 italic">No timeline audit logs recorded.</p>
                                    )}
                                  </div>
                                </div>

                                {/* Right Side: Fast Quick Adjustment Form */}
                                <div className="w-full lg:w-96 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Append Workflow Step</h4>
                                  
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Stage Action Description</label>
                                    <textarea 
                                      rows={2}
                                      placeholder="e.g. Completed initial geological drill analysis..." 
                                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-brand-teal outline-none text-slate-200 resize-none"
                                      value={newLogStage}
                                      onChange={(e) => setNewLogStage(e.target.value)}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] uppercase font-bold text-slate-400 block">Gate Status Mark</label>
                                      <select 
                                        className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-teal"
                                        value={newLogFlag}
                                        onChange={(e) => setNewLogFlag(e.target.value as any)}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Warning">Warning</option>
                                        <option value="Action Required">Action Required</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1.5 flex flex-col justify-end">
                                      <button
                                        onClick={() => handleAddTimelineStep(p.id)}
                                        className="bg-brand-teal text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition hover:scale-[1.02] active:scale-95 leading-none flex items-center justify-center space-x-1.5 h-[34px]"
                                      >
                                        <Save size={12} />
                                        <span>Log Action</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="border-t border-slate-800 pt-3">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
                                      <span>Scale Progress</span>
                                      <span className="text-brand-cyan font-black">{p.completionPercentage}%</span>
                                    </label>
                                    <input 
                                      type="range" 
                                      min="0" 
                                      max="100"
                                      className="w-full h-1.5 accent-brand-cyan mt-1 cursor-pointer"
                                      value={p.completionPercentage}
                                      onChange={(e) => handleUpdateCompletion(p.id, parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}

              {filteredPermits.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500 font-medium">
                    No licensing records match the configured search/filter schema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0A162D] border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={resetForm} 
                className="absolute right-6 top-6 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <div className="border-b border-slate-800/80 pb-4">
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <Building className="text-brand-teal" />
                  <span>{editingPermit ? 'Edit Licensing Docket Details' : 'Open New Municipal Development Docket'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {editingPermit ? 'Update applicant information, status gates, or target milestones.' : 'Provide credentials to initialize zoning clearances or building licenses.'}
                </p>
              </div>

              <form onSubmit={handleCreatePermit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                
                {/* Applicant name */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Applicant Entity Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Adama East Geothermal Consortium PLC" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-brand-teal outline-none text-white focus:border-transparent"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                  />
                </div>

                {/* License Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Select License Class</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value as PermitLicenseType)}
                  >
                    <option value="Commercial Construction">Commercial Construction</option>
                    <option value="Small Business License">Small Business License</option>
                    <option value="Solar Wind Installation">Solar Wind Installation</option>
                    <option value="Environmental Impact Certificate">Environmental Impact Certificate</option>
                  </select>
                </div>

                {/* Status Gate */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Status Gate</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    value={statusGate}
                    onChange={(e) => setStatusGate(e.target.value as PermitStatusGate)}
                  >
                    <option value="In Review">In Review</option>
                    <option value="Zoning Audit">Zoning Audit</option>
                    <option value="Field Inspection">Field Inspection</option>
                    <option value="Approved">Approved</option>
                    <option value="Action Required">Action Required</option>
                  </select>
                </div>

                {/* Submission Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Submission Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-brand-teal outline-none"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                  />
                </div>

                {/* Target Decision Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Target Decision Deadline</label>
                  <input 
                    type="date" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-brand-teal outline-none"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                {/* Assigned Agency Desk */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Assigned Municipal Agency Desk</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-brand-teal outline-none"
                    value={assignedDesk}
                    onChange={(e) => setAssignedDesk(e.target.value)}
                  />
                </div>

                {/* Workflow Completion Percentage Slider */}
                <div className="space-y-1.5 md:col-span-2 pt-1 pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Workflow Completion Percentage</label>
                    <span className="text-xs font-black font-mono text-brand-teal">{completionPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    className="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-xl appearance-none cursor-pointer accent-brand-teal focus:outline-none"
                    value={completionPercentage}
                    onChange={(e) => setCompletionPercentage(parseInt(e.target.value, 10))}
                  />
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-black transition text-slate-300 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-brand-teal text-slate-950 rounded-xl text-xs font-black transition hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-teal/20"
                  >
                    {editingPermit ? 'Update Licensing Record' : 'Create Licensing Record'}
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
