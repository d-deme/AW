import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Info, 
  LayoutGrid, 
  Users, 
  Briefcase, 
  FileText, 
  ChevronDown, 
  ArrowUpRight, 
  Mail, 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  ChevronRight,
  Building,
  Layers,
  MapPin
} from 'lucide-react';
import { useApi } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { SocialMediaLinks } from '../components/ui/SocialMediaLinks';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { HighContrastImage } from '../components/ui/HighContrastImage';
import { 
  AdministrativeUnit, 
  LeadershipProfile, 
  CityService, 
  NavItem,
  Announcement
} from '../types';
import { AboutAdama } from './AboutAdama';
import { SafeHtml, stripHtml } from '../components/ui/SafeHtml';
import { useHeadlessCms, mapSiteSettings } from '../services/headlessCms';

const HierarchyUnit: React.FC<{ unit: AdministrativeUnit }> = ({ unit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/[0.03] rounded-xl border border-white/10 overflow-hidden transition-all hover:border-cyan/50 hover:bg-white/[0.05]">
      <div 
        className="p-5 cursor-pointer flex items-center justify-between group"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${unit.name} details`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex-1 pr-4">
          <div className="text-[13px] font-black text-white group-hover:text-cyan transition-colors tracking-wide">{unit.name}</div>
          <div className="text-[11px] text-neutral-300 font-medium mt-1 tracking-normal line-clamp-1">{unit.description}</div>
        </div>
        <div className={`transition-transform duration-300 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-neutral-400 group-hover:text-cyan" />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4 bg-navy/60">
              {unit.members && unit.members.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-cyan uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Unit Members ({unit.members.length})</div>
                  {unit.members.map((member) => (
                    <div key={member.id} className="flex gap-3.5 items-start pl-3 border-l-2 border-cyan/30">
                      {member.photoUrl ? (
                        <HighContrastImage 
                          src={member.photoUrl} 
                          alt={member.name} 
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                          <User size={14} className="text-neutral-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{member.name}</div>
                        <div className="text-[10px] text-cyan font-bold uppercase tracking-wider mt-0.5">{member.role}</div>
                        {member.description && (
                          <div className="text-xs text-neutral-300 mt-1 leading-relaxed font-semibold">{stripHtml(member.description, 120)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-neutral-400 italic">No members listed for this unit.</div>
              )}
              
              {unit.parent && (
                <div className="pt-3 mt-3 border-t border-white/10 flex items-center gap-1.5 text-xs text-neutral-400 font-semibold">
                  <ArrowUpRight size={10} className="text-cyan shrink-0" /> 
                  Reports to: <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">{unit.parent}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AboutTab = () => {
  return <AboutAdama />;
};

const MayorTab = () => {
  // Only fetch site-settings – it contains all mayor data
  const { data: settings, loading: settingsLoading, error: settingsError } = useApi<any>('/site-settings');
  const loading = settingsLoading;

  if (loading) return (
    <div className="bg-white/[0.03] p-10 md:p-20 rounded-2xl border border-white/10 shadow-2xl">
      <div className="grid lg:grid-cols-3 gap-20 items-center">
        <Skeleton className="aspect-[3/4] w-full animate-pulse bg-white/10" />
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-12 w-1/2 animate-pulse bg-white/10" />
          <Skeleton className="h-48 w-full animate-pulse bg-white/10" />
          <Skeleton className="h-24 w-full animate-pulse bg-white/10" />
        </div>
      </div>
    </div>
  );

  if (settingsError) return <div className="p-12 bg-red-955/50 border border-red-500/30 text-red-400 rounded-xl">Error: {settingsError}</div>;

  const finalName = settings?.mayors_message_author || "Hon. Hailu Jelde";
  const finalPhoto = settings?.mayors_message_photo || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256";
  const finalMessage = settings?.mayors_message || "Welcome to the official digital portal...";
  const finalVision = settings?.vision || "To become the premier industrial and green-aligned smart administrative hub.";
  const finalTitle = "Adama City Mayor"; // or from settings if you have a field

  return (
    <motion.div
      key="mayor"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/[0.03] p-10 md:p-20 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md"
    >
      <div className="grid lg:grid-cols-3 gap-20 items-center">
        <div className="lg:col-span-1">
          <div className="relative group">
            <div className="absolute -inset-4 bg-cyan/5 rounded-2xl group-hover:bg-cyan/10 transition-all" />
            <HighContrastImage src={finalPhoto} alt={finalName} className="w-full aspect-[3/4] object-cover rounded-2xl border border-white/15 shadow-xl" />
            <div className="absolute bottom-6 left-6 right-6 bg-navy/90 backdrop-blur-md p-6 text-center rounded-xl shadow-lg border border-white/10">
              <h4 className="text-xl font-black text-white">{finalName}</h4>
              <p className="text-cyan text-xs font-bold uppercase tracking-widest mt-1">{finalTitle}</p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-10">
          <div className="relative">
            <span className="text-9xl text-cyan/5 absolute -top-16 -left-12 font-serif pointer-events-none">"</span>
            <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-8 text-white font-official">Message from the Mayor</h3>
            <div className="space-y-6">
              <SafeHtml text={finalMessage} className="text-neutral-200 text-base md:text-lg leading-relaxed italic font-medium font-sans" />
            </div>
          </div>
          <div className="pt-10 border-t border-white/10">
            <h4 className="text-xs font-bold text-cyan uppercase tracking-widest mb-4">Vision Statement</h4>
            <p className="text-neutral-300 text-base leading-relaxed font-medium">{finalVision}</p>
          </div>
          <SocialMediaLinks className="pt-4 text-neutral-400" />
        </div>
      </div>
    </motion.div>
  );
};

const StructureTab = () => {
  const { data: structure, loading, error } = useApi<AdministrativeUnit[]>('/administrative-units');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'sectors' | 'regional' | 'executive'>('all');
  const [expandedSubCities, setExpandedSubCities] = useState<Record<string, boolean>>({
    'subcity-Aba-Geda': true, // default some open for excellent initial visual tree impression
    'subcity-Bole': false,
    'subcity-Boku-Shanan': false,
    'subcity-Denbala': false,
    'subcity-Lugo': false,
    'subcity-Dabe': false,
  });
  const [selectedUnit, setSelectedUnit] = useState<AdministrativeUnit | null>(null);

  // Helper to toggle subcity expand status
  const toggleSubCity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubCities(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full animate-pulse bg-white/5 rounded-3xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5">
            <Skeleton className="h-8 w-2/3 animate-pulse bg-white/10" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(j => <Skeleton key={j} className="h-12 w-full animate-pulse bg-white/10" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error || !structure) return (
    <div className="p-12 bg-red-955/50 border border-red-500/30 text-red-400 rounded-xl">
      Error loading administration data: {error}
    </div>
  );

  // Filter units programmatically based on user selection and search query
  const matchesSearch = (unit: AdministrativeUnit): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Check if name or description matches
    const nameMatch = unit.name.toLowerCase().includes(query);
    const descMatch = unit.description?.toLowerCase().includes(query) || false;
    
    // Check if any member name matches
    const memberMatch = unit.members?.some(m => 
      m.name.toLowerCase().includes(query) || m.role.toLowerCase().includes(query)
    ) || false;

    // Check if any child woreda matches (for subcity view)
    if (unit.type === 'SubCity') {
      const childMatch = structure.some(c => 
        c.type === 'Woreda' && 
        c.parent === unit.id && 
        (c.name.toLowerCase().includes(query) || (c.description?.toLowerCase().includes(query) || false))
      );
      return nameMatch || descMatch || memberMatch || childMatch;
    }

    return nameMatch || descMatch || memberMatch;
  };

  // Hierarchy statistics computed in real-time
  const stats = {
    executive: structure.filter(u => u.type === 'Department').length,
    sectors: structure.filter(u => u.type === 'Sector').length,
    subCities: structure.filter(u => u.type === 'SubCity').length,
    woredas: structure.filter(u => u.type === 'Woreda').length,
  };

  // Grouped units for tree roots
  const coreDepartments = structure.filter(u => u.type === 'Department' && matchesSearch(u));
  const sectors = structure.filter(u => u.type === 'Sector' && matchesSearch(u));
  const subCities = structure.filter(u => u.type === 'SubCity' && matchesSearch(u));

  const getWoredasForSubCity = (subCityId: string) => {
    return structure.filter(u => u.type === 'Woreda' && u.parent === subCityId && matchesSearch(u));
  };

  return (
    <motion.div
      key="structure"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Header Overview */}
      <div className="text-center max-w-3xl mx-auto">
        <h3 className="text-xl md:text-3xl font-black mb-4 text-white font-official">Administrative Hierarchy Explorer</h3>
        <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl mx-auto">
          Explore Adama City's newly optimized administrative matrix. Select a view or click nodes to drill down into unit roles, leaders, and community reports.
        </p>
      </div>

      {/* Levels Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { level: 'LEVEL 1', label: 'Executive & Council', count: stats.executive, icon: <Building className="text-cyan shrink-0" size={16} />, color: 'border-cyan/30' },
          { level: 'LEVEL 2', label: 'Decentralized Sectors', count: stats.sectors, icon: <Layers className="text-purple-400 shrink-0" size={16} />, color: 'border-purple-400/30' },
          { level: 'LEVEL 3', label: 'Sub-Cities', count: stats.subCities, icon: <MapPin className="text-rose-400 shrink-0" size={16} />, color: 'border-rose-400/30' },
          { level: 'LEVEL 4', label: 'Woreda/Districts', count: stats.woredas, icon: <Users className="text-emerald-400 shrink-0" size={16} />, color: 'border-emerald-400/30' },
        ].map((item, idx) => (
          <div 
            key={idx} 
            className={`bg-white/[0.02] border p-5 rounded-2xl flex items-center justify-between shadow-lg ${item.color} backdrop-blur-md hover:bg-white/[0.04] transition-all`}
          >
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{item.level}</span>
              <h4 className="text-xs font-bold text-white mt-1">{item.label}</h4>
              <p className="text-2xl font-black text-white mt-2 font-mono">{item.count} <span className="text-[10px] text-neutral-400 font-normal">Units</span></p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Search & Tabs Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.01] p-4 rounded-2xl border border-white/5">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hierarchy (e.g., Woreda 11, Planning, Boona)..." 
            className="w-full bg-navy/80 border border-white/10 p-3 pl-10 rounded-xl text-xs text-white placeholder-neutral-400 outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30 transition-all font-medium" 
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400 hover:text-white uppercase"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
          {[
            { id: 'all', label: 'Entire Tree' },
            { id: 'executive', label: 'Level 1: Exec' },
            { id: 'sectors', label: 'Level 2: 32 Sectors' },
            { id: 'regional', label: 'Levels 3-4: Sub-Cities' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap min-w-[100px] ${viewMode === tab.id ? 'bg-cyan text-navy shadow-lg' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Structural Tree Container */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* The Tree Nodes View */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* 1. MUNICIPAL & COUNCIL CORE (Level 1) */}
          {(viewMode === 'all' || viewMode === 'executive') && coreDepartments.length > 0 && (
            <div className="bg-white/[0.01] border border-cyan/10 p-6 rounded-3xl relative backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-6 bg-cyan rounded-full shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-cyan">Level 1: Municipal Executive & Council Core</h4>
              </div>

              {/* Connected Visual Hierarchy Layout */}
              <div className="space-y-4">
                {coreDepartments.map((unit) => (
                  <div 
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-4 bg-white/[0.03] hover:bg-white/[0.05] border rounded-xl flex items-center justify-between cursor-pointer transition-all ${selectedUnit?.id === unit.id ? 'border-cyan bg-cyan/5' : 'border-white/10'}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 bg-cyan/15 rounded-lg border border-cyan/10 text-cyan">
                        <Building size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-cyan uppercase tracking-wider block">CORE MUNICIPAL</span>
                        <h5 className="text-xs font-bold text-white mt-0.5">{unit.name}</h5>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5">
                      {unit.members && unit.members.length > 0 && (
                        <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded border border-white/5 font-semibold text-neutral-300">
                          {unit.members[0].role}: {unit.members[0].name}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-neutral-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. THE 32 SECTORS (Level 2) */}
          {(viewMode === 'all' || viewMode === 'sectors') && sectors.length > 0 && (
            <div className="bg-white/[0.01] border border-purple-400/10 p-6 rounded-3xl relative backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-purple-400 rounded-full shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">Level 2: Decentralized Specialized Sectors ({sectors.length})</h4>
                </div>
                <span className="text-[9px] text-purple-400 font-bold bg-purple-400/10 px-2 py-0.5 border border-purple-400/15 rounded-full uppercase tracking-widest">
                  Manager Direct Reports
                </span>
              </div>

              {/* Grid-based Tree View of Sectors with search integration */}
              <div className="grid md:grid-cols-2 gap-4">
                {sectors.map((unit) => (
                  <div 
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`p-4 bg-white/[0.02] hover:bg-white/[0.04] border rounded-xl flex items-start justify-between cursor-pointer transition-all hover:scale-[1.01] ${selectedUnit?.id === unit.id ? 'border-purple-400 bg-purple-400/5' : 'border-white/10'}`}
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <Layers size={10} className="text-purple-400 shrink-0" />
                        <h5 className="text-xs font-bold text-white line-clamp-1">{unit.name}</h5>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed font-semibold">{stripHtml(unit.description, 100)}</p>
                    </div>
                    <ChevronRight size={12} className="text-neutral-400 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. REGIONAL SUB-CITIES & NESTED WOREDAS TREE (Levels 3 & 4) */}
          {(viewMode === 'all' || viewMode === 'regional') && subCities.length > 0 && (
            <div className="bg-white/[0.01] border border-rose-400/10 p-6 rounded-3xl relative backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-6 bg-rose-400 rounded-full shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">Levels 3 & 4: Regional Decentralization Tree</h4>
              </div>

              {/* Collaborative Collapsible Tree of Sub-Cities & Woredas */}
              <div className="space-y-6">
                {subCities.map((subCity) => {
                  const subWoredas = getWoredasForSubCity(subCity.id);
                  const isExpanded = !!expandedSubCities[subCity.id];

                  return (
                    <div key={subCity.id} className="relative group">
                      
                      {/* Leaf Node Line Connector Container */}
                      <div 
                        onClick={() => setSelectedUnit(subCity)}
                        className={`p-4 bg-white/[0.03] hover:bg-white/[0.05] border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${selectedUnit?.id === subCity.id ? 'border-rose-400 bg-rose-400/5' : 'border-white/10'}`}
                      >
                        <div className="flex items-center gap-3.5 pr-4 flex-1">
                          <div className="p-2.5 bg-rose-400/15 rounded-xl border border-rose-400/10 text-rose-400">
                            <MapPin size={14} />
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block">LEVEL 3 SUB-CITY</span>
                            <h5 className="text-xs font-bold text-white mt-0.5">{subCity.name}</h5>
                            <p className="text-[10px] text-neutral-300 font-semibold line-clamp-1 mt-0.5">{stripHtml(subCity.description, 100)}</p>
                          </div>
                        </div>

                        {/* Expand / Close and Statistics Badges for children */}
                        <div className="flex items-center gap-4 shrink-0">
                          <button 
                            onClick={(e) => toggleSubCity(subCity.id, e)}
                            className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 text-neutral-100 hover:text-rose-400 hover:border-rose-400/40 rounded-lg font-black transition-all flex items-center gap-1.5"
                          >
                            <span>{subWoredas.length} {subWoredas.length === 1 ? 'Woreda' : 'Woredas'}</span>
                            <ChevronDown size={10} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded child nodes with connecting tree branch branches */}
                      <AnimatePresence>
                        {isExpanded && subWoredas.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="pl-8 mt-2 space-y-2 relative border-l border-white/10 ml-6"
                          >
                            {subWoredas.map((woreda) => (
                              <div 
                                key={woreda.id}
                                onClick={() => setSelectedUnit(woreda)}
                                className="relative pl-6 py-0.5 select-none"
                              >
                                {/* Mechanical Left Bracket Tree Line Accent */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/10" />
                                
                                <div className={`p-3 bg-white/[0.015] hover:bg-white/[0.035] border rounded-xl flex items-center justify-between cursor-pointer transition-all ${selectedUnit?.id === woreda.id ? 'border-emerald-400 bg-emerald-400/5' : 'border-white/5'}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <div>
                                      <h6 className="text-xs font-bold text-white leading-none">{woreda.name}</h6>
                                      {woreda.description && <p className="text-[9px] text-neutral-400 mt-1 line-clamp-1">{stripHtml(woreda.description, 100)}</p>}
                                    </div>
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 px-2 py-0.5 bg-emerald-400/10 rounded-md border border-emerald-400/5">Level 4 Woreda</span>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback Empty Search */}
          {coreDepartments.length === 0 && sectors.length === 0 && subCities.length === 0 && (
            <div className="text-center py-20 bg-white/[0.01] rounded-3xl border border-white/5 shadow-xl max-w-lg mx-auto">
              <Search className="mx-auto text-neutral-400 mb-4" size={24} />
              <p className="text-neutral-300 font-bold text-sm mb-1">No hierarchy matches found</p>
              <p className="text-xs text-neutral-400">Try checking spelling or type another division term.</p>
            </div>
          )}

        </div>

        {/* Tree Node Interactive Detail Sidebar on Right */}
        <div className="sticky top-32 lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-[#10223b] to-navy/40 p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,rgba(0,229,255,0.06),transparent_60%)] pointer-events-none" />
            
            {selectedUnit ? (
              <div className="space-y-6">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm border ${
                    selectedUnit.type === 'Department' ? 'bg-cyan/10 text-cyan border-cyan/15' :
                    selectedUnit.type === 'Sector' ? 'bg-purple-400/10 text-purple-400 border-purple-400/15' :
                    selectedUnit.type === 'SubCity' ? 'bg-rose-400/10 text-rose-400 border-rose-400/15' :
                    'bg-emerald-400/10 text-emerald-400 border-emerald-400/15'
                  }`}>
                    {selectedUnit.type === 'Department' ? 'Level 1: Exec Core' :
                     selectedUnit.type === 'Sector' ? 'Level 2: Sector Service' :
                     selectedUnit.type === 'SubCity' ? 'Level 3: regional Sub-City' :
                     'Level 4: Local Woreda'}
                  </span>
                  <h4 className="text-xl font-black text-white mt-4 tracking-tight leading-tight">{selectedUnit.name}</h4>
                </div>

                {selectedUnit.description && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Office Responsibility</h5>
                    <SafeHtml text={selectedUnit.description} className="text-xs text-neutral-200 leading-relaxed font-normal bg-white/[0.02] p-3 rounded-lg border border-white/5" />
                  </div>
                )}

                {/* Parent connection */}
                {selectedUnit.parent && (
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Reports to / Parents Node</h5>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />
                        <span className="text-xs text-white font-bold">
                          {structure.find(u => u.id === selectedUnit.parent)?.name || 'Executive Bureau'}
                        </span>
                      </div>
                      <span className="text-[8px] bg-white/5 text-neutral-400 font-bold px-2 py-0.5 rounded border border-white/5">Parent</span>
                    </div>
                  </div>
                )}

                {/* Team / Leadership */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Leadership Profile</h5>
                  
                  {selectedUnit.members && selectedUnit.members.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUnit.members.map((member) => (
                        <div key={member.id} className="flex gap-3.5 items-start bg-white/[0.03] p-4 rounded-xl border border-white/5">
                          {member.photoUrl ? (
                            <HighContrastImage 
                              src={member.photoUrl} 
                              alt={member.name} 
                              className="w-11 h-11 rounded-full object-cover border border-white/20 shrink-0 shadow"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                              <User size={16} className="text-neutral-300 animate-pulse" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white truncate">{member.name}</div>
                            <div className="text-[9px] text-cyan font-black uppercase tracking-wider mt-0.5 truncate">{member.role}</div>
                            {member.description && (
                              <div className="text-[11px] text-neutral-300 mt-1 leading-normal font-medium">{member.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 italic bg-white/[0.01] p-4 rounded-xl border border-white/5 text-center">
                      No registered public administrator at this node. Standard bureaus are operated by Civil Service coordinates.
                    </div>
                  )}
                </div>

                {/* Map integration or smart alert simulated check */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Duty Station Location: Adama</span>
                  <span className="text-cyan font-bold flex items-center gap-1">● Active Unit</span>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-cyan">
                  <Info size={20} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">No Unit Selected</h5>
                  <p className="text-[11px] text-neutral-400 max-w-[200px] mx-auto mt-2 leading-relaxed">
                    Select any unit, sector, sub-city, or woreda in the tree layout to explore its organizational parameters and reporting line.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Quick Help Tip */}
          <div className="bg-white/[0.01] p-5 rounded-2xl border border-white/5 shadow text-xs text-neutral-400 space-y-2 leading-relaxed">
            <h5 className="font-bold text-neutral-200">How level hierarchy is organized:</h5>
            <ol className="list-decimal list-inside space-y-1.5 ml-1">
              <li><span className="text-cyan font-bold">Level 1:</span> Council provides legislation and laws.</li>
              <li><span className="text-purple-400 font-bold">Level 2:</span> 32 sectors guide central execution.</li>
              <li><span className="text-rose-400 font-bold">Level 3:</span> 6 Sub-cities coordinate decentralized regions.</li>
              <li><span className="text-emerald-400 font-bold">Level 4:</span> 19 Woredas deliver services directly to households.</li>
            </ol>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

const LeadershipTab = () => {
  const { data: leadership, loading, error } = useApi<LeadershipProfile[]>('/leadership?status=published`');
  const [activeDispatchLeaderId, setActiveDispatchLeaderId] = useState<string | null>(null);
  const [expandedLeaderId, setExpandedLeaderId] = useState<string | null>(null);

  if (loading) return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white/[0.03] p-8 space-y-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-full animate-pulse bg-white/10" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-3/4 animate-pulse bg-white/10" />
              <Skeleton className="h-4 w-1/2 animate-pulse bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-24 w-full animate-pulse bg-white/10" />
          <Skeleton className="h-32 w-full animate-pulse bg-white/10" />
        </div>
      ))}
    </div>
  );
  if (error || !leadership) return <div className="p-12 bg-red-955/50 border border-red-500/30 text-red-400 rounded-xl">Error: {error}</div>;

  return (
    <motion.div
      key="leadership"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {leadership.map((leader) => (
        <div key={leader.id} className="bg-white/[0.03] p-8 rounded-3xl group hover:border-cyan/50 hover:bg-white/[0.05] transition-all flex flex-col border border-white/10 shadow-xl">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 border border-cyan/30 rounded-full group-hover:border-cyan transition-all animate-pulse" />
              <HighContrastImage src={leader.imageUrl} alt={leader.name} className="w-20 h-20 rounded-full object-cover border border-white/15" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white leading-tight">{leader.name}</h4>
              <p className="text-cyan text-xs font-extrabold uppercase tracking-wider mt-1.5">{leader.role}</p>
            </div>
          </div>
          {expandedLeaderId === leader.id ? (
            <div className="text-sm text-neutral-200 mb-6 bg-white/[0.02] p-4 rounded-2xl border border-white/5 max-h-56 overflow-y-auto custom-scrollbar">
              <SafeHtml text={leader.bio} className="text-neutral-200" />
            </div>
          ) : (
            <p className="text-sm text-neutral-200 mb-6 leading-relaxed line-clamp-4 font-normal">
              {stripHtml(leader.bio, 180)}
            </p>
          )}
          <button 
            onClick={() => setExpandedLeaderId(expandedLeaderId === leader.id ? null : leader.id)}
            className="text-cyan hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-left self-start cursor-pointer border border-cyan/25 bg-cyan/5 hover:bg-cyan/15 px-3 py-1.5 rounded-lg"
          >
            {expandedLeaderId === leader.id ? 'Close biography' : 'Read full biography'}
          </button>
          <div className="space-y-4 mb-8 flex-1">
            <h5 className="text-[11px] uppercase font-black text-cyan tracking-wider">Key Mandates / Responsibilities</h5>
            <ul className="space-y-3">
              {leader.responsibilities.map((resp, i) => (
                <li key={i} className="text-xs text-neutral-200 flex items-start gap-2.5 leading-relaxed font-semibold">
                  <ChevronRight size={14} className="text-cyan shrink-0 mt-0.5" /> {resp}
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">Contact Office</span>
                <span className="text-xs text-white font-semibold font-mono mt-1">{leader.contact}</span>
              </div>
              <button 
                onClick={() => {
                  setActiveDispatchLeaderId(leader.id);
                  setTimeout(() => setActiveDispatchLeaderId(null), 4000);
                }}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-cyan hover:text-navy hover:border-cyan transition-all cursor-pointer text-white"
                aria-label={`Mail ${leader.name}`}
              >
                <Mail size={15} />
              </button>
            </div>
            
            <AnimatePresence>
              {activeDispatchLeaderId === leader.id && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="bg-cyan/10 border border-cyan/20 p-3 rounded-xl text-[10px] text-cyan leading-relaxed font-bold flex items-start gap-2"
                >
                  <Mail size={12} className="shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-extrabold uppercase tracking-wider text-[9px] text-white">Connection Initiated</p>
                    <p className="text-neutral-300 font-medium text-[8.5px] mt-0.5">Official dispatch request logs queued to: {leader.contact}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const ServicesTab = () => {
  const { data: services, loading, error } = useApi<CityService[]>('/services');

  if (loading) return (
    <div className="grid md:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
         <div key={i} className="bg-white/[0.03] p-8 h-96 rounded-3xl border border-white/5 animate-pulse" />
      ))}
    </div>
  );
  if (error || !services) return <div className="p-12 bg-red-955/50 border border-red-500/30 text-red-400 rounded-xl">Error: {error}</div>;

  return (
    <motion.div
      key="services"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid md:grid-cols-2 gap-8"
    >
      {services.map((service) => (
        <div key={service.id} className="bg-white/[0.03] p-8 rounded-3xl group hover:border-cyan/50 hover:bg-white/[0.05] border border-white/10 transition-all shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-cyan/10 rounded-xl text-cyan group-hover:bg-cyan group-hover:text-navy transition-all border border-cyan/20">
                <ServiceIcon iconName={service.icon} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-cyan/35 bg-cyan/10 rounded-full text-white">
                {service.category}
              </span>
            </div>
            <h4 className="text-2xl font-black mb-4 text-white group-hover:text-cyan transition-colors">{service.title}</h4>
            <p className="text-xs text-neutral-200 mb-8 leading-relaxed font-semibold">{stripHtml(service.description, 160)}</p>
            
            <div className="space-y-6">
              {service.requirements && (
                <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <h5 className="text-[11px] uppercase font-black text-white tracking-wider flex items-center gap-2">
                    <FileText size={14} className="text-cyan" /> Required Submissions
                  </h5>
                  <ul className="grid grid-cols-1 gap-2.5">
                    {service.requirements.map((req, i) => (
                      <li key={i} className="text-xs text-neutral-200 flex items-start gap-2 leading-relaxed font-semibold">
                        <div className="w-1.5 h-1.5 bg-cyan rounded-full mt-1.5 shrink-0" /> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">Processing Time</span>
              <span className="text-xs text-white font-black mt-1">{service.processSteps?.[0] || '2-5 Working Days'}</span>
            </div>
            <a 
              href={service.link} 
              className="px-6 py-3 bg-cyan text-navy hover:bg-white text-xs font-black uppercase tracking-widest transition-all rounded-xl shadow-lg border-none"
            >
              Apply Online
            </a>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const DocumentsTab = () => {
  const { data: documents, loading, error } = useApi<any[]>('/documents');

  if (loading) return (
    <div className="grid gap-4 mt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/[0.03] p-6 h-20 rounded-2xl border border-white/10 animate-pulse" />
      ))}
    </div>
  );
  if (error) return <div className="p-12 bg-red-955/50 border border-red-500/30 text-red-400 rounded-xl">Error: {error}</div>;

  const docs = documents && documents.length > 0 ? documents : [
    { title: 'Adama City Master Plan 2025-2035', type: 'Policy', date: 'Jan 2026', size: '12.4 MB' },
    { title: 'Annual Budget Report FY 2025', type: 'Financial', date: 'Dec 2025', size: '4.2 MB' },
    { title: 'Smart City Initiative Roadmap', type: 'Strategic', date: 'Nov 2025', size: '8.1 MB' },
    { title: 'Public Service Charter V2', type: 'Manual', date: 'Oct 2025', size: '2.5 MB' },
    { title: 'Zoning & Land Use Regulations', type: 'Legal', date: 'Sep 2025', size: '5.7 MB' },
  ];

  return (
    <motion.div
      key="documents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
          <input 
            type="text" 
            placeholder="Search publications, gazettes, policies..." 
            className="w-full bg-navy/60 border border-white/15 p-4 pl-12 rounded-xl text-xs text-white placeholder-neutral-400 outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-all" 
          />
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-3 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:text-cyan hover:border-cyan transition-all rounded-xl text-white">
            <Filter size={14} className="text-cyan" /> Filter
          </button>
          <button className="px-5 py-3 bg-cyan text-navy text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all rounded-xl border-none">
            <Download size={14} /> Bulk Download
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {docs.map((doc, i) => (
          <div key={i} className="bg-white/[0.03] p-6 rounded-2xl flex items-center justify-between group border border-white/10 hover:border-cyan/30 hover:bg-white/[0.05] transition-all shadow-md">
            <div className="flex items-center gap-6">
              <div className="p-3 bg-white/5 rounded-xl text-neutral-300 group-hover:text-cyan transition-colors border border-white/10">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan transition-colors">{doc.title}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[10px] text-cyan uppercase tracking-widest font-black bg-cyan/10 px-2 py-0.5 rounded border border-cyan/15">{doc.type}</span>
                  <span className="text-xs text-neutral-300 font-semibold">{doc.date}</span>
                  <span className="text-xs text-neutral-400 font-medium">{doc.size}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-neutral-300 hover:text-cyan hover:border-cyan/50 transition-all" title="View Online"><ExternalLink size={16} /></button>
              <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-neutral-300 hover:text-cyan hover:border-cyan/50 transition-all" title="Download"><Download size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};export const GovernmentDirectory = () => {
  const { data: units, loading, error } = useApi<any[]>('/administrative-units');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !units) {
    return (
      <div className="p-8 bg-red-955/40 border border-red-500/20 text-red-200 rounded-2xl max-w-xl mx-auto text-center space-y-4">
        <p className="text-sm font-semibold">Could not load government directory</p>
        <p className="text-xs text-neutral-400 font-mono">{error || 'Unknown Error'}</p>
      </div>
    );
  }

  const filtered = units.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unit.delegation_code && unit.delegation_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || unit.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h3 className="text-xl md:text-3xl font-black mb-4 text-white font-official">Woreda & Sector Office Directory</h3>
        <p className="text-neutral-300 text-sm leading-relaxed max-w-2xl mx-auto">
          Officially synced from our administrative ledger. Locate sector bureaus and local administrative woredas to access specialized public support lines.
        </p>
      </div>

      {/* Filter / Search UI */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search offices, woredas, codes or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-navy/85 border border-white/10 p-4 pl-12 rounded-xl text-xs text-white placeholder-neutral-400 outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-all font-semibold"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-navy border border-white/10 text-white text-xs px-5 py-4 rounded-xl outline-none focus:border-cyan transition-all font-bold uppercase tracking-wider"
          >
            <option value="all">ANY CLASSIFICATION</option>
            <option value="Woreda">Woredas</option>
            <option value="Sector">Sector Offices</option>
            <option value="Kebele">Kebeles</option>
          </select>
        </div>
      </div>

      {/* Grid Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.length > 0 ? (
          filtered.map((unit) => (
            <motion.div
              key={unit.id}
              layoutId={`unit-${unit.id}`}
              className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-cyan/30 rounded-3xl p-6 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      unit.type === 'Woreda' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : unit.type === 'Sector' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {unit.type}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-neutral-400 bg-white/5 px-2 py-1 rounded">
                      code: {unit.delegation_code}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-400 bg-white/5 px-2 py-1 rounded">
                      {unit.sector_hierarchy}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white group-hover:text-cyan transition-colors">{unit.name}</h4>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed font-semibold mb-6">{unit.description}</p>

              <div className="space-y-3.5 border-t border-white/5 pt-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-0.5">Contact Line</span>
                    <span className="text-white font-mono flex items-center gap-1.5 hover:text-cyan transition-colors">
                      <Mail size={12} className="text-cyan shrink-0" />
                      {unit.contact_phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-0.5">Office Precinct</span>
                    <span className="text-white flex items-center gap-1.5">
                      <MapPin size={12} className="text-cyan shrink-0" />
                      {unit.office_location}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-semibold">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-0.5">Reporting Hierarchies</span>
                  <span className="text-white/80 bg-white/5 px-2.5 py-1 rounded border border-white/5 w-fit block mt-1">
                    {unit.parent_unit}
                  </span>
                </div>

                {unit.members && unit.members.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest block mb-1">Assigned Officials</span>
                    <div className="flex flex-wrap gap-2">
                      {unit.members.map((m: any, idx: number) => (
                        <div key={idx} className="bg-navy/80 border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-white/90">
                          <span className="font-bold text-cyan">{m.title}:</span> {m.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-neutral-400 bg-white/[0.01] border border-white/5 rounded-3xl">
            No administrative units found matching your constraints.
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AdministrativeUnitsTab = () => {
  return <GovernmentDirectory />;
};

export const GovernmentSection = ({ targetTab }: { targetTab?: string }) => {
  const [activeTab, setActiveTab] = useState('Mayor');

  useEffect(() => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [targetTab]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('adama_active_tab_changed', { detail: activeTab }));
  }, [activeTab]);

  const tabs = [
    { id: 'Mayor', label: "Mayor's Message", icon: <User size={16} /> },
    { id: 'About', label: 'About Us', icon: <Info size={16} /> },
    { id: 'Structure', label: 'Administration', icon: <LayoutGrid size={16} /> },
    { id: 'Units', label: 'Woredas & Offices', icon: <Building size={16} /> },
    { id: 'Leadership', label: 'Leadership', icon: <Users size={16} /> },
    { id: 'Services', label: 'Services', icon: <Briefcase size={16} /> },
    { id: 'Documents', label: 'Publications', icon: <FileText size={16} /> },
  ];

  return (
    <section id="government" className="section-padding bg-navy relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.05),transparent_50%)]" />
      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-20"
        >
          <h3 className="text-xs font-black uppercase tracking-widest text-cyan mb-4">Governance & Transparency</h3>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white font-official">City Administration</h2>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-16 border-b border-white/10 pb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-xl ${activeTab === tab.id ? 'bg-white text-navy shadow-xl shadow-white/10' : 'text-neutral-300 hover:text-cyan hover:bg-white/5'}`}
              aria-label={`View ${tab.label} section`}
              aria-pressed={activeTab === tab.id}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Mayor' && <MayorTab />}
          {activeTab === 'About' && <AboutTab />}
          {activeTab === 'Structure' && <StructureTab />}
          {activeTab === 'Units' && <AdministrativeUnitsTab />}
          {activeTab === 'Leadership' && <LeadershipTab />}
          {activeTab === 'Services' && <ServicesTab />}
          {activeTab === 'Documents' && <DocumentsTab />}
        </AnimatePresence>
      </div>
    </section>
  );
};
