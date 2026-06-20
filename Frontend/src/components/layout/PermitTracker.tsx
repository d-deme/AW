import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShieldAlert, CheckCircle2, Clock, AlertCircle, FileText, 
  ChevronRight, Download, Filter, HelpCircle, BadgeCheck, FilePlus,
  QrCode, Camera, ScanLine, RefreshCw, Upload, Sparkles, Smartphone,
  Check, Play, Pause
} from 'lucide-react';
import { api } from '../../services/api';

interface PermitApplication {
  id: string; // Reference Number, e.g., "AD-2026-F89A"
  applicantName: string;
  type: 'Commercial Construction' | 'Small Business License' | 'Solar Wind Installation' | 'Land Zoning Clearance' | 'Environmental Impact Certificate';
  subDate: string;
  estApproval: string;
  currentStatus: 'In Review' | 'Zoning Audit' | 'Field Inspection' | 'Approved' | 'Action Required';
  percentComplete: number;
  assignedUnit: string;
  history: {
    stage: string;
    date: string;
    details: string;
    status: 'completed' | 'current' | 'pending';
  }[];
}

const SAMPLE_PERMITS: PermitApplication[] = [
  {
    id: 'AD-2026-904A',
    applicantName: 'Adama Eco-Retail Hub Complex',
    type: 'Commercial Construction',
    subDate: 'May 04, 2026',
    estApproval: 'June 10, 2026',
    currentStatus: 'Field Inspection',
    percentComplete: 65,
    assignedUnit: 'Bureau of Urban Infrastructure',
    history: [
      { stage: 'Application Intake', date: 'May 04, 2026', details: 'Core compliance documents received and digitized into municipal registry.', status: 'completed' },
      { stage: 'Zoning & Master Plan Clearance', date: 'May 10, 2026', details: 'Passed spatial master-plan compliance with zero urban boundary conflicts.', status: 'completed' },
      { stage: 'Structural Safety Audit', date: 'May 18, 2026', details: 'Oromia standards structural blueprints passed with green rating.', status: 'completed' },
      { stage: 'On-Site Field Inspection', date: 'May 24, 2026', details: 'Site structural integrity audit currently under execution by municipal engineers.', status: 'current' },
      { stage: 'Final Council Seal & Issuance', date: 'Pending', details: 'Official validation and digital signature authorization.', status: 'pending' }
    ]
  },
  {
    id: 'AD-2026-B118',
    applicantName: 'Gadaa Solar Micro-Grid',
    type: 'Solar Wind Installation',
    subDate: 'April 28, 2026',
    estApproval: 'May 30, 2026',
    currentStatus: 'Approved',
    percentComplete: 100,
    assignedUnit: 'Department of Clean Grid Energy',
    history: [
      { stage: 'Application Intake', date: 'April 28, 2026', details: 'Grid connection profile submitted successfully.', status: 'completed' },
      { stage: 'Grid Load Balance Auditing', date: 'May 05, 2026', details: 'Simulated feedback loop shows excellent grid load compatibility.', status: 'completed' },
      { stage: 'Directorial Signing', date: 'May 14, 2026', details: 'Authorized by Chief of Energy Bureau.', status: 'completed' },
      { stage: 'Final Council Seal & Issuance', date: 'May 20, 2026', details: 'Secured master certificate. Download link active.', status: 'completed' }
    ]
  },
  {
    id: 'AD-2026-X883',
    applicantName: 'Oda Roast Gourmet Inc.',
    type: 'Small Business License',
    subDate: 'May 20, 2026',
    estApproval: 'June 01, 2026',
    currentStatus: 'Action Required',
    percentComplete: 30,
    assignedUnit: 'Trade & SME Licensing Bureau',
    history: [
      { stage: 'Application Intake', date: 'May 20, 2026', details: 'Commercial registration profile received.', status: 'completed' },
      { stage: 'SME Qualification Scrutiny', date: 'May 22, 2026', details: 'Awaiting submission of localized tax compliance certificate from Woreda 03.', status: 'current' },
      { stage: 'Issuance Protocol', date: 'Pending', details: 'Pending previous resolution.', status: 'pending' }
    ]
  },
  {
    id: 'AD-2026-Y402',
    applicantName: 'East Rift Eco-Lodge',
    type: 'Environmental Impact Certificate',
    subDate: 'May 12, 2026',
    estApproval: 'June 15, 2026',
    currentStatus: 'In Review',
    percentComplete: 40,
    assignedUnit: 'Environmental & Forestry Division',
    history: [
      { stage: 'Application Intake', date: 'May 12, 2026', details: 'Soil & fauna impact statement successfully logged.', status: 'completed' },
      { stage: 'Riparian Protection Review', date: 'May 19, 2026', details: 'Assessments ongoing near Awash River wildlife migration paths.', status: 'current' },
      { stage: 'Zoning & Master Plan Clearance', date: 'Pending', details: 'Requires final environmental safety audit clearance.', status: 'pending' }
    ]
  }
];

// Helper to render high fidelity retro vector QR patterns deterministically
const MiniQrCode = ({ seed, active = false }: { seed: string; active?: boolean }) => {
  const size = 9;
  const blocks = [];
  const combined = seed + "ADAMA";
  for (let i = 0; i < size * size; i++) {
    const charCode = combined.charCodeAt(i % combined.length);
    // Deterministic block logic
    const isFilled = (charCode * (i + 13)) % 3 === 0 || 
                     (i < 3) || 
                     (i >= size * size - 3) || 
                     (i % size === 0 && i < size * 3) || 
                     (i % size === size - 1 && i >= size * 6) ||
                     (i === 40 || i === 41 || i === 31 || i === 49);
    blocks.push(isFilled);
  }
  return (
    <div className={`grid grid-cols-9 gap-[1px] p-2 rounded-xl transition-all ${active ? 'bg-cyan/10 border-cyan/40 border-2' : 'bg-neutral-50 border-neutral-200 border border-dashed hover:border-neutral-400'} aspect-square w-18 h-18 cursor-pointer select-none`}>
      {blocks.map((filled, idx) => (
        <div key={idx} className={`rounded-[1px] transition-colors ${filled ? 'bg-navy' : 'bg-transparent'}`} />
      ))}
    </div>
  );
};

export const PermitTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'Approved' | 'In Progress' | 'Action Required'>('all');
  const [selectedPermitId, setSelectedPermitId] = useState<string>('AD-2026-904A');
  const [permits, setPermits] = useState<PermitApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);

  // New permit form states
  const [applicantName, setApplicantName] = useState('');
  const [licenseType, setLicenseType] = useState<'Commercial Construction' | 'Small Business License' | 'Solar Wind Installation' | 'Land Zoning Clearance' | 'Environmental Impact Certificate'>('Commercial Construction');
  const [assignedDesk, setAssignedDesk] = useState('Bureau of Urban Infrastructure');
  const [isPermitSubmitting, setIsPermitSubmitting] = useState(false);
  const [permitSuccess, setPermitSuccess] = useState(false);

  // QR Scanning implementation states
  const [activePortalTab, setActivePortalTab] = useState<'database' | 'scanner' | 'apply'>('database');
  const [scanningState, setScanningState] = useState<'idle' | 'searching' | 'validated' | 'dragged'>('idle');
  const [scannerLog, setScannerLog] = useState('Camera idle. Select receipt QR below or authorize camera.');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadPermits = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPermits();
      if (Array.isArray(data)) {
        const mapped: PermitApplication[] = data.map((item: any) => ({
          id: item.id || `AD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          applicantName: item.applicant_name || item.applicantName || 'Anonymous Applicant',
          type: item.license_type || item.type || 'Commercial Construction',
          subDate: item.submission_date || item.submittedDate || item.subDate || 'Recently',
          estApproval: item.target_decision_date || item.estApproval || 'Pending',
          currentStatus: item.status_gate || item.status || item.currentStatus || 'In Review',
          percentComplete: typeof item.completion_percentage === 'number' ? item.completion_percentage : (typeof item.percentComplete === 'number' ? item.percentComplete : 15),
          assignedUnit: item.assigned_desk || item.assignedUnit || 'Central Desk 3',
          history: Array.isArray(item.audit_logs) ? item.audit_logs.map((log: any, idx: number) => ({
            stage: log.stageDescription || log.stage || 'Update',
            date: log.date || 'Recently',
            details: log.details || log.stateDescription || 'Audit trail update received.',
            status: idx === 0 ? 'current' : 'completed'
          })) : (Array.isArray(item.history) ? item.history.map((step: any) => ({
            stage: step.stage || 'Update',
            date: step.date || 'Recently',
            details: step.details || 'Audit update.',
            status: step.status || 'completed'
          })) : [
            { stage: 'Application Intake', date: item.submission_date || 'Recently', details: 'Filing successfully registered.', status: 'completed' }
          ])
        }));
        setPermits(mapped);
        
        if (mapped.length > 0) {
          const found = mapped.find(m => m.id === selectedPermitId);
          if (!found) {
            setSelectedPermitId(mapped[0].id);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load live permits, using offline mock list:", err);
      setPermits(SAMPLE_PERMITS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPermits();
  }, []);

  const handleSubmitPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName) return;

    setIsPermitSubmitting(true);
    try {
      const payload = {
        applicant_name: applicantName,
        license_type: licenseType,
        assigned_desk: assignedDesk
      };

      const result = await api.createPermit(payload);
      await loadPermits();

      if (result && result.id) {
        setSelectedPermitId(result.id);
      }

      setIsPermitSubmitting(false);
      setPermitSuccess(true);
      setApplicantName('');

      setTimeout(() => {
        setPermitSuccess(false);
        setActivePortalTab('database');
      }, 3000);
    } catch (err) {
      console.error("Failed to post new license permit:", err);
      setIsPermitSubmitting(false);
    }
  };

  // Apply lookup & type filters
  const filteredPermits = permits.filter(p => {
    const matchSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase().trim()) || 
                        p.applicantName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
                        p.type.toLowerCase().includes(searchTerm.toLowerCase().trim());
    
    if (!matchSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'Approved') return p.currentStatus === 'Approved';
    if (activeFilter === 'Action Required') return p.currentStatus === 'Action Required';
    if (activeFilter === 'In Progress') {
      return p.currentStatus === 'In Review' || p.currentStatus === 'Zoning Audit' || p.currentStatus === 'Field Inspection';
    }
    return true;
  });

  const activePermit = permits.find(p => p.id === selectedPermitId) || filteredPermits[0] || permits[0] || {
    id: 'LOADING',
    applicantName: 'Administrative Database',
    type: 'Commercial License Verification',
    subDate: 'Calculating',
    estApproval: 'Calculating',
    currentStatus: 'In Review',
    percentComplete: 0,
    assignedUnit: 'Connecting Direct Gate...',
    history: []
  };

  // Camera access logic
  useEffect(() => {
    let isMounted = true;
    if (activePortalTab === 'scanner') {
      setHasCameraError(false);
      setScanningState('idle');
      setScannerLog('Awaiting code synchronization...');
      
      navigator.mediaDevices?.getUserMedia?.({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (isMounted) {
            setCameraStream(stream);
            setScannerLog('Digital focal lens live. Point card QR near targeting grid.');
          } else {
            stream.getTracks().forEach(track => track.stop());
          }
        })
        .catch(err => {
          console.warn('Sandbox or browser permissions blocked raw webcam access:', err);
          if (isMounted) {
            setHasCameraError(true);
            setScannerLog('Webcam is offline/restricted. Tap any static municipal QR card below to scan.');
          }
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
    }
    return () => {
      isMounted = false;
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activePortalTab]);

  // Bind camera video source
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Trigger simulated scan sequence for static cards
  const triggerScanSimulate = (permitId: string) => {
    if (scanningState === 'searching') return;
    setScanningState('searching');
    setScannerLog(`Initiating beam sweep for ID: ${permitId}...`);

    let progress = 0;
    const scannerMessages = [
      'Focus locked. Isolating pattern nodes...',
      'Checksum validation passing Oromia cryptographic authority standard...',
      'Signature validated successfully! Extracting record data...'
    ];

    const timer = setInterval(() => {
      if (progress < scannerMessages.length) {
        setScannerLog(scannerMessages[progress]);
        progress++;
      } else {
        clearInterval(timer);
        setScanningState('validated');
        setScannerLog(`GRID LOCKED: Application record database matches [${permitId}]`);
        
        // Timeout to transfer user back to database tab viewing the result
        setTimeout(() => {
          setSelectedPermitId(permitId);
          setActivePortalTab('database');
          setScanningState('idle');
        }, 1200);
      }
    }, 450);
  };

  // Drag and drop image file simulator
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropSimulate = (e: React.DragEvent) => {
    e.preventDefault();
    const randomPermit = permits[Math.floor(Math.random() * permits.length)];
    triggerScanSimulate(randomPermit.id);
  };

  const getStatusColor = (status: PermitApplication['currentStatus']) => {
    switch (status) {
      case 'Approved': return 'bg-green-50 text-green-600 border-green-100';
      case 'Action Required': return 'bg-red-50 text-red-600 border-red-100';
      case 'In Review': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Field Inspection': return 'bg-cyan-50 text-cyan border-cyan-100/30';
      case 'Zoning Audit': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
    }
  };

  const getPercentageBarColor = (status: PermitApplication['currentStatus']) => {
    if (status === 'Approved') return 'bg-green-500';
    if (status === 'Action Required') return 'bg-red-500';
    return 'bg-cyan';
  };

  return (
    <div id="permits-portal" className="card p-10 md:p-14 border border-neutral-200 bg-white/60 backdrop-blur-md relative overflow-hidden">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-neutral-100 pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan/10 border border-cyan/20 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan mb-2">
            <BadgeCheck size={12} /> Real-time Civic Systems
          </div>
          <h3 className="text-3xl font-black text-navy leading-tight font-official">Permit & Commercial License Portal</h3>
          <p className="text-xs text-neutral-500 font-medium">Verify official file numbers, scan cryptographic code receipts, or track local council approval states.</p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-100 text-[10px] text-neutral-500 font-extrabold uppercase tracking-widest">
          <Clock size={14} className="text-cyan animate-pulse" /> Updated: Live (UTC)
        </div>
      </div>

      {/* Modern Layout Toggle for Records list vs QR Camera Scanner */}
      <div className="flex border-b border-neutral-200/60 pb-4 mb-8 gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActivePortalTab('database')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activePortalTab === 'database'
              ? 'border-navy text-navy font-black'
              : 'border-transparent text-neutral-400 hover:text-navy font-bold'
          }`}
        >
          <FileText size={16} /> Database Records Directory
        </button>
        <button
          onClick={() => setActivePortalTab('apply')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activePortalTab === 'apply'
              ? 'border-magenta text-magenta font-black'
              : 'border-transparent text-neutral-400 hover:text-magenta font-bold'
          }`}
        >
          <FilePlus size={16} /> Apply for License / Permit
        </button>
        <button
          onClick={() => setActivePortalTab('scanner')}
          className={`pb-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activePortalTab === 'scanner'
              ? 'border-cyan text-cyan font-black'
              : 'border-transparent text-neutral-400 hover:text-cyan font-bold'
          }`}
        >
          <QrCode size={16} className={activePortalTab === 'scanner' ? 'animate-pulse' : ''} /> Live QR Scanner Portal
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-12 items-start">
        {/* Left Side (3 cols): Directory List OR the QR Code Camera Scanner */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {activePortalTab === 'database' ? (
              <motion.div
                key="database-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search reference (e.g. AD-2026-904A) or applicant..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 pl-11 pr-4 py-4 rounded-xl text-xs outline-none focus:ring-2 focus:ring-cyan focus:ring-offset-2 transition-all font-medium"
                    />
                  </div>
                  {/* Quick action info */}
                  <div className="text-[10px] text-neutral-400 bg-neutral-50 rounded-xl px-4 py-2 border border-neutral-200/50 flex items-center gap-2 font-bold uppercase tracking-wider">
                    <Filter size={12} className="text-cyan" /> Matches: {filteredPermits.length} Records
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex bg-neutral-100/80 p-1.5 rounded-2xl border border-neutral-200 overflow-x-auto select-none no-scrollbar">
                  {(
                    [
                      { id: 'all', label: 'All Files' },
                      { id: 'Approved', label: 'Approved' },
                      { id: 'In Progress', label: 'In Progress' },
                      { id: 'Action Required', label: 'Action Required' },
                    ] as const
                  ).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setActiveFilter(opt.id)}
                      className={`flex-1 py-2.5 px-4 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shrink-0 ${
                        activeFilter === opt.id
                          ? 'bg-navy text-white shadow-sm font-black'
                          : 'text-neutral-500 hover:text-navy'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Permit Grid / List */}
                <div className="space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar pr-2">
                  {filteredPermits.length > 0 ? (
                    filteredPermits.map(permit => {
                      const isSelected = permit.id === activePermit.id;
                      return (
                        <button
                          key={permit.id}
                          onClick={() => setSelectedPermitId(permit.id)}
                          className={`w-full text-left p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-white border-neutral-900 shadow-xl ring-1 ring-neutral-900 scale-[1.01]'
                              : 'bg-white/50 border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {/* Selected Indicator left bar */}
                          {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan" />}

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-navy">{permit.id}</span>
                              <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border rounded${getStatusColor(permit.currentStatus)}`}>
                                {permit.currentStatus}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-navy truncate">{permit.applicantName}</h5>
                            <p className="text-[10px] text-neutral-400 font-semibold">{permit.type}</p>
                          </div>

                          {/* Progress details */}
                          <div className="flex items-center gap-6 shrink-0 sm:pl-4 sm:border-l border-neutral-100">
                            <div className="text-right">
                              <span className="text-[10px] font-black text-navy font-mono">{permit.percentComplete}%</span>
                              <div className="h-1.5 w-24 bg-neutral-100 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full transition-all duration-300 ${getPercentageBarColor(permit.currentStatus)}`}
                                  style={{ width: `${permit.percentComplete}%` }}
                                />
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-neutral-300" />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-24 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                      <ShieldAlert className="text-neutral-400 mx-auto mb-3" size={32} />
                      <h6 className="text-sm font-bold text-navy mb-1">No matching active applications</h6>
                      <p className="text-xs text-neutral-400 font-medium max-w-xs mx-auto">
                        Try verifying your reference format (e.g., AD-2026-904A) or clear your active search query.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activePortalTab === 'scanner' ? (
              <motion.div
                key="scanner-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Advanced Integrated Camera Scanner Mocktop */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDropSimulate}
                  className="bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-xl relative aspect-[16/10] sm:aspect-[16/9] flex flex-col items-center justify-center p-6 text-center select-none"
                >
                  {/* Absolute glowing framing corners */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-cyan rounded-tl-lg" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-cyan rounded-tr-lg" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-cyan rounded-bl-lg" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-cyan rounded-br-lg" />

                  {/* Laser Sweeper scanning line */}
                  {scanningState === 'searching' && (
                    <motion.div 
                      initial={{ top: '10%' }}
                      animate={{ top: '85%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                      className="absolute left-[5%] right-[5%] h-[3px] bg-gradient-to-r from-transparent via-cyan to-transparent shadow-[0_0_12px_#06b6d4] z-10"
                    />
                  )}

                  {/* Real video webcam stream or fallback */}
                  {cameraStream && !hasCameraError ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-radial-gradient from-neutral-800/40 to-neutral-950 pointer-events-none" />
                  )}

                  {/* Interactive scanning feedback icon and status text */}
                  <div className="relative z-20 max-w-sm space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center mx-auto shadow-inner text-cyan">
                      {scanningState === 'searching' ? (
                        <ScanLine size={32} className="animate-spin text-cyan" />
                      ) : scanningState === 'validated' ? (
                        <CheckCircle2 size={32} className="animate-bounce text-green-500" />
                      ) : (
                        <Camera size={32} className="animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">
                        {scanningState === 'searching' ? 'DECODING PATTERNS...' : scanningState === 'validated' ? 'SYSTEM MATCH SECURED!' : 'CAMERA VIEWFINDER ACTIVE'}
                      </h4>
                      <p className="text-[10px] text-neutral-300 font-medium font-mono leading-relaxed bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/5 inline-block">
                        {scannerLog}
                      </p>
                    </div>

                    <div className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-wide">
                      Drag QR receipt image anywhere here or use interactive test cards below
                    </div>
                  </div>
                </div>

                {/* Test QR Generation Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                      Your Print-Out Receipts (Interactive Test Scanning)
                    </span>
                    <span className="text-[9px] bg-cyan/10 text-cyan uppercase font-black tracking-widest px-2 py-0.5 rounded-md">
                      Simulation Deck
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {permits.map(permit => (
                      <div 
                        key={permit.id}
                        onClick={() => triggerScanSimulate(permit.id)}
                        className={`p-4 bg-white border rounded-2xl transition-all flex flex-col items-center text-center gap-3 cursor-pointer hover:shadow-md select-none group relative overflow-hidden ${
                          scanningState === 'searching' ? 'opacity-40 pointer-events-none' : ''
                        }`}
                      >
                        {/* Dynamic glow corner hover */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-200 group-hover:bg-cyan transition-colors" />
                        
                        <MiniQrCode seed={permit.id} active={selectedPermitId === permit.id} />
                        
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono font-black text-navy uppercase block">{permit.id}</span>
                          <span className="text-[8px] font-semibold text-neutral-400 truncate max-w-[100px] block">{permit.applicantName}</span>
                        </div>

                        <span className="text-[7.5px] font-black uppercase tracking-wider text-cyan group-hover:underline flex items-center gap-1 mt-1">
                          Align To Lens <Sparkles size={9} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="apply-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {permitSuccess ? (
                  <div className="py-16 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 text-green-600 border border-green-150 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-navy leading-tight font-official">Application Logged Successfully</h3>
                    <p className="text-sm text-neutral-500 max-w-sm mx-auto font-medium">
                      Your permit filing is officially timestamped and received. Review our digital compliance audits in the timeline.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-navy uppercase tracking-widest bg-neutral-50 py-3 px-6 rounded-xl border border-neutral-100 w-fit mx-auto animate-pulse">
                      <Clock size={14} /> Returning to Directory...
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitPermit} className="space-y-8 border border-neutral-200 p-8 rounded-3xl bg-neutral-50/50">
                    <div>
                      <h4 className="text-lg font-bold text-navy mb-1 leading-tight flex items-center gap-2 font-official">
                        <Sparkles size={16} className="text-magenta animate-pulse" /> File New Municipal Licensing
                      </h4>
                      <p className="text-xs text-neutral-400 font-medium">Submit and instantiate real-time zoning and digital merchant certificates.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">Applicant / Corporate Entity Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Abyssinia Agro-Processing Hub, Gadaa Eco-SME..."
                        value={applicantName}
                        onChange={e => setApplicantName(e.target.value)}
                        className="w-full bg-white border border-neutral-200 p-5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-magenta focus:ring-offset-2 transition-all font-medium animate-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">License & Permit Type</label>
                        <select
                          value={licenseType}
                          onChange={e => setLicenseType(e.target.value as any)}
                          className="w-full bg-white border border-neutral-200 p-5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-magenta focus:ring-offset-2 transition-all appearance-none font-semibold"
                        >
                          <option value="Commercial Construction">Commercial Construction</option>
                          <option value="Small Business License">Small Business License</option>
                          <option value="Solar Wind Installation">Solar Wind Installation</option>
                          <option value="Land Zoning Clearance">Land Zoning Clearance</option>
                          <option value="Environmental Impact Certificate">Environmental Impact Certificate</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-navy uppercase tracking-widest ml-1">Assigned Support Desk</label>
                        <select
                          value={assignedDesk}
                          onChange={e => setAssignedDesk(e.target.value)}
                          className="w-full bg-white border border-neutral-200 p-5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-magenta focus:ring-offset-2 transition-all appearance-none font-semibold"
                        >
                          <option value="Bureau of Urban Infrastructure">Bureau of Urban Infrastructure</option>
                          <option value="Trade & SME Licensing Bureau">Trade & SME Licensing Bureau</option>
                          <option value="Department of Clean Grid Energy">Department of Clean Grid Energy</option>
                          <option value="Environmental & Forestry Division">Environmental & Forestry Division</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPermitSubmitting}
                      className="btn-primary w-full py-5 text-xs uppercase tracking-widest shadow-xl shadow-magenta/10 flex items-center justify-center gap-2 bg-gradient-to-r from-navy via-magenta to-navy border-none cursor-pointer text-white"
                    >
                      {isPermitSubmitting ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} /> Saving Secure Ledger...
                        </>
                      ) : (
                        <>
                          <FilePlus size={14} /> Instantiate Digital Permit
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side (2 cols): Detailed Workflow Timeline with Animated Progress Indicator */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePermit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl space-y-6"
            >
              {/* Card Header details */}
              <div>
                <span className="text-[9px] font-black text-cyan uppercase tracking-widest bg-cyan/10 px-2.5 py-1 rounded-md border border-cyan/10">
                  Tracking File Profile
                </span>
                <h4 className="text-lg font-bold text-navy mt-3 leading-tight font-official">{activePermit.applicantName}</h4>
                <p className="text-xs text-neutral-400 font-medium mt-1">{activePermit.type}</p>
              </div>

              {/* Animated Progress Bar (Rich interactive completion visualizer) */}
              <div className="bg-white border border-neutral-100 p-5 rounded-2xl shadow-sm space-y-3.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                  <span className="text-neutral-400">Resolution Track</span>
                  <span className={`font-mono text-xs font-black px-2 py-0.5 bg-neutral-50 rounded-md border ${
                    activePermit.currentStatus === 'Approved' ? 'text-green-600 border-green-100' :
                    activePermit.currentStatus === 'Action Required' ? 'text-red-500 border-red-100' :
                    'text-cyan border-cyan-100/30'
                  }`}>
                    {activePermit.percentComplete}% Complete
                  </span>
                </div>

                {/* Progress bar outer container */}
                <div className="relative h-4 bg-neutral-50 rounded-full border border-neutral-200/50 p-[2px] overflow-hidden">
                  {/* Dynamic coloring bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activePermit.percentComplete}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full relative overflow-hidden ${getPercentageBarColor(activePermit.currentStatus)}`}
                  >
                    {/* Glowing light sweep animation shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>

                {/* Milestone Node status points */}
                <div className="flex justify-between text-[7px] text-neutral-400 font-black uppercase tracking-widest px-1">
                  <span className={activePermit.percentComplete >= 10 ? "text-navy font-black" : ""}>Intake</span>
                  <span className={activePermit.percentComplete >= 40 ? "text-cyan font-black" : ""}>Audit</span>
                  <span className={activePermit.percentComplete >= 65 ? "text-cyan font-black" : ""}>Inspection</span>
                  <span className={activePermit.percentComplete === 100 ? "text-green-600 font-black" : ""}>Ready</span>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-200/60 text-[10px] font-bold text-navy uppercase tracking-widest">
                <div>
                  <span className="block text-[8px] text-neutral-400 font-extrabold mb-0.5">Application Date</span>
                  <span className="font-semibold text-navy-light">{activePermit.subDate}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-neutral-400 font-extrabold mb-0.5">Est. Decision Gate</span>
                  <span className="font-semibold text-navy-light">{activePermit.estApproval}</span>
                </div>
                <div className="col-span-2 mt-2">
                  <span className="block text-[8px] text-neutral-400 font-extrabold mb-0.5">Assigned Service Desk</span>
                  <span className="font-semibold text-navy-light block truncate">{activePermit.assignedUnit}</span>
                </div>
              </div>

              {/* Interactive Audit Progress Steps */}
              <div className="space-y-6">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Workflow Timeline Logs</span>
                <div className="relative border-l border-neutral-200 ml-2.5 space-y-6 pl-6">
                  {activePermit.history.map((step, idx) => {
                    const isPassed = step.status === 'completed';
                    const isCur = step.status === 'current';

                    return (
                      <div key={idx} className="relative">
                        {/* Timeline Circle */}
                        <div className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full ring-4 transition-all ${
                          isPassed
                            ? 'bg-green-500 ring-green-500/10'
                            : isCur
                            ? 'bg-cyan ring-cyan/25 animate-pulse'
                            : 'bg-neutral-200 ring-transparent'
                        }`} />

                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-[11px] font-extrabold ${isPassed ? 'text-green-600 font-extrabold line-through text-neutral-400' : isCur ? 'text-cyan font-black' : 'text-neutral-400 font-semibold'}`}>
                              {step.stage}
                            </span>
                            <span className="text-[8px] text-neutral-400 font-semibold font-mono">{step.date}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                            {step.details}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA Downloads / Assistance links */}
              {activePermit.currentStatus === 'Approved' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowDownloadAlert(true);
                      setTimeout(() => setShowDownloadAlert(false), 4000);
                    }}
                    className="btn-primary w-full py-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <Download size={12} /> Exporter Official License (PDF)
                  </button>
                  <AnimatePresence>
                    {showDownloadAlert && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-emerald-50 text-emerald-800 text-[10px] border border-emerald-150 rounded-xl space-y-1 font-semibold leading-relaxed"
                      >
                        <p className="font-bold flex items-center gap-1.5"><BadgeCheck size={12} className="text-emerald-600" /> Security Seal Authorized!</p>
                        <p className="text-neutral-500 font-medium text-[9px]">Digital verification certificate {activePermit.id} logged with Oromia security. Your download is preparing.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-4 bg-white border border-neutral-100 rounded-xl text-[10px] text-neutral-500 leading-relaxed font-semibold flex items-start gap-2.5">
                  <HelpCircle size={14} className="text-cyan shrink-0 mt-0.5" />
                  <span>
                    Awaiting next stage. For queries on reference <span className="font-black text-navy font-mono">{activePermit.id}</span>, contact the assigned support desk.
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
