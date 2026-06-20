import React, { useState } from 'react';
import { TourismPackage, ItineraryStop, TravelTheme } from '../types/admin';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Palmtree, 
  Plus, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Smile, 
  Thermometer, 
  Award, 
  X, 
  Map, 
  Save, 
  Edit,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourismPlannerProps {
  packages: TourismPackage[];
  onAddPackage: (pkg: TourismPackage) => void;
  onUpdatePackage: (pkg: TourismPackage) => void;
  onDeletePackage: (id: string) => void;
}

export const TourismPlanner: React.FC<TourismPlannerProps> = ({
  packages,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState<TravelTheme | 'All'>('All');
  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(null);

  // Package Form States
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [curatorSubtitle, setCuratorSubtitle] = useState('');
  const [theme, setTheme] = useState<TravelTheme>('wellness');
  const [seasonality, setSeasonality] = useState('Perfect Year-Round');
  const [climate, setClimate] = useState('24°C - 28°C, Soft Thermal Mists');
  const [editingPackage, setEditingPackage] = useState<TourismPackage | null>(null);

  const resetPackageForm = () => {
    setTitle('');
    setCuratorSubtitle('');
    setTheme('wellness');
    setSeasonality('Perfect Year-Round');
    setClimate('24°C - 28°C, Soft Thermal Mists');
    setEditingPackage(null);
    setIsAdding(false);
  };

  const handleStartEdit = (pkg: TourismPackage) => {
    setEditingPackage(pkg);
    setTitle(pkg.title);
    setCuratorSubtitle(pkg.curatorSubtitle || '');
    setTheme(pkg.theme);
    setSeasonality(pkg.seasonality || 'Perfect Year-Round');
    setClimate(pkg.climateDetails || '');
    setIsAdding(true);
  };

  // Stop builder states for active expanded package
  const [stopTimeAndDay, setStopTimeAndDay] = useState('09:00 AM');
  const [stopActivity, setStopActivity] = useState('');
  const [stopGeo, setStopGeo] = useState('');
  const [stopDesc, setStopDesc] = useState('');
  const [stopCuratorTip, setStopCuratorTip] = useState('');

  const generatePackageId = () => {
    return `TR-${Math.floor(100 + Math.random() * 900)}`;
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingPackage) {
      const updatedPkg: TourismPackage = {
        ...editingPackage,
        theme,
        title,
        curatorSubtitle,
        seasonality,
        climateDetails: climate
      };
      onUpdatePackage(updatedPkg);
      resetPackageForm();
      return;
    }

    const newPkg: TourismPackage = {
      id: generatePackageId(),
      theme,
      title,
      curatorSubtitle,
      seasonality,
      climateDetails: climate,
      stops: [
        {
          id: `ST-${Date.now()}`,
          timeOfDay: "08:30 AM",
          activityTitle: "Morning Geothermal Spring Dip",
          geoLocation: "Sodere Thermal Hot Springs Resort",
          description: "Relax in the natural mineral-dense natural spring, known for healing dermal properties and full circulatory decompression.",
          curatorTip: "Expert Curator Tip: Soak for less than 35 minutes to monitor heart rate, then enjoy a freshly brewed local ginger infusion tea."
        }
      ]
    };

    onAddPackage(newPkg);
    resetPackageForm();
  };

  const handleAddStop = (pkgId: string) => {
    if (!stopActivity.trim() || !stopGeo.trim()) return;

    const targetPkg = packages.find(p => p.id === pkgId);
    if (!targetPkg) return;

    const newStop: ItineraryStop = {
      id: `ST-${Date.now()}`,
      timeOfDay: stopTimeAndDay,
      activityTitle: stopActivity,
      geoLocation: stopGeo,
      description: stopDesc,
      curatorTip: stopCuratorTip
    };

    const updated: TourismPackage = {
      ...targetPkg,
      stops: [...targetPkg.stops, newStop]
    };

    onUpdatePackage(updated);
    // Reset stop builders
    setStopActivity('');
    setStopGeo('');
    setStopDesc('');
    setStopCuratorTip('');
  };

  const handleDeleteStop = (pkgId: string, stopId: string) => {
    const targetPkg = packages.find(p => p.id === pkgId);
    if (!targetPkg) return;

    const updated: TourismPackage = {
      ...targetPkg,
      stops: targetPkg.stops.filter(s => s.id !== stopId)
    };
    onUpdatePackage(updated);
  };

  const getThemeBadgeColor = (t: TravelTheme) => {
    switch (t) {
      case 'wellness':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'culture':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'adventure':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  const filteredPackages = packages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.curatorSubtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTheme = themeFilter === 'All' || p.theme === themeFilter;

    return matchesSearch && matchesTheme;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
            <Compass className="text-brand-teal" />
            <span>Travel & Culture Concierge Day Planner</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Curate tourism pipelines, hot spring exploration itineraries, and local wellness day journeys.</p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="bg-brand-teal text-slate-950 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 hover:scale-[1.02] shadow-lg shadow-brand-teal/25 transition active:scale-95 self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Curate New Journey</span>
        </button>
      </div>

      {/* Searching filters */}
      <div className="bg-[#0A162D] rounded-3xl border border-slate-800 p-5 flex flex-col md:flex-row gap-4 items-center shadow-lg">
        {/* Search Input */}
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-teal transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search Itineraries by theme..." 
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-teal outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Theme dropdown filter */}
        <div className="w-full md:w-56 flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Journey Theme:</span>
          <select 
            className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-teal"
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value as any)}
          >
            <option value="All">All Themes</option>
            <option value="wellness">Wellness (Thermal Springs)</option>
            <option value="culture">Culture (Oromo Heritage)</option>
            <option value="adventure">Adventure (Rift Valley Rift)</option>
          </select>
        </div>

        {/* Dynamic counter */}
        <div className="ml-auto text-xs text-slate-500 font-mono font-medium">
          Records: <span className="text-brand-teal font-black">{filteredPackages.length}</span> / {packages.length} active paths.
        </div>
      </div>

      {/* Journeys List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPackages.map((pkg) => {
          const isExpanded = expandedPkgId === pkg.id;
          return (
            <div 
              key={pkg.id} 
              className="bg-[#0A162D] rounded-3xl border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700/80 transition duration-300"
            >
              {/* Outer summary row */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 text-left flex-1">
                  
                  {/* Category, seasonality tags block */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-brand-teal uppercase mr-1">{pkg.id}</span>
                    <span className={`text-[9px] px-2.5 py-1 rounded-full uppercase font-black border tracking-wider ${getThemeBadgeColor(pkg.theme)}`}>
                      {pkg.theme}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-lg flex items-center">
                      <Calendar size={10} className="mr-1 text-slate-500" />
                      {pkg.seasonality}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-lg flex items-center">
                      <Thermometer size={10} className="mr-1 text-brand-magenta" />
                      {pkg.climateDetails}
                    </span>
                  </div>

                  {/* Journey descriptive titles */}
                  <div>
                    <h3 className="text-lg font-black text-white">{pkg.title}</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed italic">By Admin Curator • {pkg.curatorSubtitle}</p>
                  </div>
                </div>

                {/* Counter indicator and action button */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none">Sequence Stops</p>
                    <p className="text-2xl font-black text-white leading-none mt-1 font-mono">
                      {pkg.stops.length} <span className="text-xs font-semibold text-slate-400">Events</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedPkgId(isExpanded ? null : pkg.id)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700/60 text-slate-200 rounded-xl text-xs font-black transition flex items-center space-x-1"
                    >
                      <span>{isExpanded ? 'Collapse' : 'Manage Stops'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                     <button
                      onClick={() => handleStartEdit(pkg)}
                      className="p-2.5 text-slate-500 hover:text-brand-teal hover:bg-slate-900 bg-slate-950/45 border border-slate-850 rounded-xl transition"
                      title="Edit day journey details"
                    >
                      <Edit size={13} />
                    </button>

                    <button
                      onClick={() => onDeletePackage(pkg.id)}
                      className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 bg-slate-950/45 border border-slate-850 rounded-xl transition"
                      title="Decommission day journey"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sequential Stops Expand Timeline */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-800 bg-[#050D1F]/50 p-6 overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                      
                      {/* Left list: Stops ordered timeline */}
                      <div className="flex-1 space-y-4">
                        <h4 className="text-xs font-black uppercase text-brand-teal tracking-widest mb-4 flex items-center space-x-2">
                          <Map size={14} />
                          <span>Sequential Day Itinerary Log</span>
                        </h4>

                        <div className="relative pl-6 border-l border-slate-800 space-y-6 ml-4">
                          {pkg.stops.map((stop, stopIdx) => (
                            <div key={stop.id} className="relative group text-left">
                              {/* Central absolute node number */}
                              <div className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-white flex items-center justify-center font-black group-hover:border-brand-teal transition">
                                {stopIdx + 1}
                              </div>

                              <div className="bg-[#0A162D] border border-slate-800 p-4 rounded-2xl relative">
                                <button
                                  onClick={() => handleDeleteStop(pkg.id, stop.id)}
                                  className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                                  title="Delete stop"
                                >
                                  <Trash2 size={12} />
                                </button>

                                <div className="space-y-2">
                                  {/* Stop attributes */}
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                    <span className="font-mono font-black text-brand-teal flex items-center">
                                      <Clock size={12} className="mr-1 inline text-slate-500" />
                                      {stop.timeOfDay}
                                    </span>
                                    <span className="text-slate-700 font-bold">•</span>
                                    <span className="font-semibold text-slate-300 flex items-center">
                                      <MapPin size={12} className="mr-1 inline text-slate-500" />
                                      {stop.geoLocation}
                                    </span>
                                  </div>

                                  {/* Activities summary */}
                                  <h5 className="font-extrabold text-sm text-white">{stop.activityTitle}</h5>
                                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">{stop.description}</p>
                                  
                                  {/* Tips block */}
                                  {stop.curatorTip && (
                                    <div className="bg-[#0D1E3D]/50 border-l-2 border-brand-magenta p-2 rounded-r-xl mt-2 text-[10px] text-slate-400 italic font-medium">
                                      {stop.curatorTip}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {pkg.stops.length === 0 && (
                            <p className="text-slate-500 text-xs italic">No stops created. Use stop builder on the right to compile stops.</p>
                          )}
                        </div>
                      </div>

                      {/* Right list: Stop creation docket */}
                      <div className="w-full lg:w-96 bg-[#0A162D] border border-slate-800/80 rounded-2xl p-5 space-y-4 text-left">
                        <h4 className="text-xs font-black uppercase text-white tracking-widest border-b border-slate-800 pb-2">Append Itinerary Stop</h4>
                        
                        {/* Time and Day */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Time of Day</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 11:30 AM" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-teal outline-none text-white"
                            value={stopTimeAndDay}
                            onChange={(e) => setStopTimeAndDay(e.target.value)}
                          />
                        </div>

                        {/* Stop Activity Title */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Activity Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Guided Crater hike" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-teal outline-none text-white"
                            value={stopActivity}
                            onChange={(e) => setStopActivity(e.target.value)}
                          />
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Geo-Location</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Mount Dere Gorge, Adama" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-teal outline-none text-white"
                            value={stopGeo}
                            onChange={(e) => setStopGeo(e.target.value)}
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Activity Description</label>
                          <textarea 
                            rows={3}
                            placeholder="Briefly state historical nuances or physical requirements..." 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-teal outline-none text-white resize-none"
                            value={stopDesc}
                            onChange={(e) => setStopDesc(e.target.value)}
                          />
                        </div>

                        {/* Curator Tip */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block">Expert Director/Curator Tip</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Carry trekking poles and drinking water..." 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-1 focus:ring-brand-teal outline-none text-white"
                            value={stopCuratorTip}
                            onChange={(e) => setStopCuratorTip(e.target.value)}
                          />
                        </div>

                        <button
                          onClick={() => handleAddStop(pkg.id)}
                          className="w-full bg-brand-teal text-slate-950 py-2.5 rounded-xl text-xs font-black transition hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-1.5 h-10 shadow-md shadow-brand-teal/10"
                        >
                          <Plus size={14} />
                          <span>Append Stop To Path</span>
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredPackages.length === 0 && (
          <div className="text-center py-20 bg-slate-900/10 border border-dashed border-slate-850 rounded-3xl">
            <p className="text-slate-500 text-sm">No curated packages matching theme filter details.</p>
          </div>
        )}
      </div>

      {/* Creation Package Dialog */}
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
                onClick={resetPackageForm} 
                className="absolute right-6 top-6 text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <div className="border-b border-slate-800 pb-4 text-left">
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <Compass className="text-brand-teal" />
                  <span>{editingPackage ? 'Edit Day-Itinerary Journey Package' : 'Curate Day-Itinerary Journey package'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {editingPackage ? 'Adjust theme classifications, seasonality limits, and curation tag lines.' : 'Configure general geographic values to feed the public resort companion apps.'}
                </p>
              </div>

              <form onSubmit={handleCreatePackage} className="space-y-4 text-left">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Journey Name / Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Direct Sodere Hot Springs Retreat Day" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-brand-teal outline-none text-white focus:border-transparent"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Curator Subheading Credits</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Mastered by City Health & Leisure Office" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold focus:ring-2 focus:ring-brand-teal outline-none text-white focus:border-transparent"
                    value={curatorSubtitle}
                    onChange={(e) => setCuratorSubtitle(e.target.value)}
                  />
                </div>

                {/* Theme Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Travel Theme</label>
                  <select 
                    className="w-[#180] bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as TravelTheme)}
                  >
                    <option value="wellness">Wellness (Hot springs & Healing)</option>
                    <option value="culture">Culture (Museums & Oromo art)</option>
                    <option value="adventure">Adventure (Volcanoes & Safaris)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Seasonality */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Seasonality Guideline</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Perfect Year-Round" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-brand-teal outline-none"
                      value={seasonality}
                      onChange={(e) => setSeasonality(e.target.value)}
                    />
                  </div>

                  {/* Climate details */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Average Climate / Temp</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 25°C - 29°C, Dry Peak" 
                      className="w-full bg-[#000] border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-brand-teal outline-none"
                      value={climate}
                      onChange={(e) => setClimate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit button layout */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={resetPackageForm}
                    className="px-5 py-3 border border-slate-850 hover:bg-slate-900 rounded-xl text-xs font-black transition text-slate-300 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-brand-teal text-slate-950 rounded-xl text-xs font-black transition hover:scale-[1.02] active:scale-95 shadow-lg shadow-brand-teal/20"
                  >
                    {editingPackage ? 'Update Curated Day Itinerary' : 'Save Curated Day Itinerary'}
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
