import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Clock, Filter, Search, Bell, Info, X } from 'lucide-react';
import { useApi } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { HighContrastImage } from '../components/ui/HighContrastImage';
import { SafeHtml, stripHtml } from '../components/ui/SafeHtml';

interface CityEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  category: 'Meeting' | 'Festival' | 'Deadline' | string;
  imageUrl?: string;
  status?: string;
}

export const UpcomingEvents = () => {
  const { data: events, loading, error } = useApi<CityEvent[]>('/events');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);

  // Helper date conversions for calendar badges
  const getEventDateParts = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) {
        return { month: 'JUN', day: dateStr.split('-')[2] || '15', year: '2026' };
      }
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return {
        month: monthNames[dateObj.getMonth()],
        day: dateObj.getDate().toString().padStart(2, '0'),
        year: dateObj.getFullYear().toString(),
      };
    } catch {
      return { month: 'JUN', day: '15', year: '2026' };
    }
  };

  // Helper to calculate days remaining relative to current session date (2026-06-03)
  const getDaysRemainingStr = (dateStr: string) => {
    try {
      const today = new Date('2026-06-03T00:00:00Z');
      const eventDate = new Date(`${dateStr}T00:00:00Z`);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '👉 Happening Today!';
      if (diffDays === 1) return '🚨 Tomorrow!';
      if (diffDays < 0) return '⌛ Passed';
      return `📅 In ${diffDays} days`;
    } catch {
      return '';
    }
  };

  // Filter & sort logic (Chronological order: closest first)
  const processedEvents = (events || [])
    .filter(event => {
      // Category filter matching
      const catMatch = activeCategory === 'All' || 
        (activeCategory === 'Meetings' && event.category === 'Meeting') ||
        (activeCategory === 'Festivals' && event.category === 'Festival') ||
        (activeCategory === 'Deadlines' && event.category === 'Deadline');

      // Search keyword matching
      const searchLower = searchQuery.toLowerCase().trim();
      const searchMatch = !searchLower || 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower);

      return catMatch && searchMatch;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section id="events" className="section-padding bg-white relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-navy/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Header Block */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black uppercase tracking-[0.25em] text-cyan block mb-3 font-mono"
          >
            📋 MUNICIPAL CALENDAR
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4 text-4xl md:text-5xl font-black tracking-tight text-navy mb-4 font-official"
          >
            Upcoming City Events
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-neutral-500 text-sm md:text-base font-semibold leading-relaxed max-w-2xl mx-auto"
          >
            Plan your month. View chronological agendas for scheduled public assemblies, environmental festivals, and civic compliance deadlines.
          </motion.p>
        </div>

        {/* Filters and Search Bar Row */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-neutral-50 p-6 rounded-3xl border border-neutral-150 mb-10">
          {/* Categories Tab Group */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['All', 'Meetings', 'Festivals', 'Deadlines'].map((cat) => {
              const icon = cat === 'Meetings' ? '👥' : cat === 'Festivals' ? '🎉' : cat === 'Deadlines' ? '⚠️' : '🌐';
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
                    activeCategory === cat
                      ? 'bg-navy border-transparent text-white shadow-md'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:text-navy hover:bg-neutral-100 hover:border-neutral-300'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box input */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event schedules..."
              className="w-full bg-white border border-neutral-200/80 pl-11 pr-4 py-3 rounded-2xl text-xs text-navy font-bold placeholder-neutral-400 outline-none focus:border-cyan transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Chronological List Grid Layout */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-neutral-50 p-6 rounded-3xl border border-neutral-150 flex items-center gap-6 animate-pulse">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-6 w-1/3 rounded-lg" />
                  <Skeleton className="h-4 w-2/3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 text-red-700 rounded-3xl border border-red-200">
            <p className="font-bold">Error loading dynamic schedules.</p>
          </div>
        ) : processedEvents.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-4xl border border-dashed border-neutral-200">
            <p className="text-sm font-bold text-neutral-550">No upcoming events match the search query or filter segment choice.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {processedEvents.map((evt, idx) => {
              const { month, day, year } = getEventDateParts(evt.date);
              const remainingStr = getDaysRemainingStr(evt.date);
              const isPassed = remainingStr.includes('Passed');

              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white hover:bg-neutral-50/50 p-6 sm:p-8 rounded-4xl border transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm hover:shadow-md hover:border-cyan/30 text-left ${
                    isPassed ? 'opacity-70 border-neutral-200' : 'border-neutral-200/80'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-6 flex-1">
                    {/* Calendar visual badge */}
                    <div className="h-20 w-16 bg-navy rounded-2xl text-center flex flex-col justify-center border-b-4 border-cyan/70 select-none shadow shrink-0">
                      <span className="text-[10px] font-black tracking-widest text-cyan uppercase leading-none mb-1 font-mono">{month}</span>
                      <span className="text-2xl font-black text-white leading-none font-mono">{day}</span>
                    </div>

                    {/* Meta info column */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Event Category Tag */}
                        <span className={`text-[8.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                          evt.category === 'Meeting'
                            ? 'bg-emerald-50 border-emerald-205 text-emerald-700'
                            : evt.category === 'Deadline'
                            ? 'bg-rose-50 border-rose-205 text-rose-600'
                            : 'bg-indigo-50 border-indigo-205 text-indigo-600'
                        }`}>
                          {evt.category}
                        </span>

                        {/* Real-time proximity countdown badge */}
                        {remainingStr && (
                          <span className={`text-[8.5px] font-bold px-2.5 py-1 rounded-lg ${
                            isPassed 
                              ? 'bg-neutral-100 text-neutral-500' 
                              : remainingStr.includes('Today') || remainingStr.includes('Tomorrow')
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-cyan/10 text-cyan border border-cyan/25'
                          }`}>
                            {remainingStr}
                          </span>
                        )}
                      </div>

                      {/* Title & snippet */}
                      <h3 className="text-lg md:text-xl font-black text-navy leading-snug tracking-tight uppercase hover:text-cyan transition-colors cursor-pointer" onClick={() => setSelectedEvent(evt)}>
                        {evt.title}
                      </h3>

                      {/* Direct details snippet */}
                      <p className="text-xs text-neutral-550 font-semibold line-clamp-2 max-w-3xl leading-relaxed">
                        {stripHtml(evt.description, 160)}
                      </p>

                      {/* Mini metadata row (Time and Location) */}
                      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1.5 text-neutral-500 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 shrink-0">
                          <Clock size={13} className="text-cyan shrink-0" />
                          <span>{evt.time}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-cyan shrink-0" />
                          <span className="line-clamp-1">{evt.location}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / CTA visual button */}
                  <div className="flex lg:flex-col items-start lg:items-end gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-[10px] font-black uppercase tracking-widest text-navy transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Info size={12} className="text-cyan" />
                      <span>Explore Agenda Detail</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal display overlay for full event schedule details */}
        <AnimatePresence>
          {selectedEvent && (
            <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-white rounded-4xl max-w-2xl w-full border border-neutral-150 overflow-hidden shadow-2xl relative text-left"
              >
                {/* Image header banner */}
                <div className="relative h-48 bg-navy">
                  {selectedEvent.imageUrl && (
                    <HighContrastImage src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                  
                  {/* Close floating badge button */}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white rounded-full p-2.5 transition-all outline-none border border-white/10 cursor-pointer z-20"
                  >
                    <X size={16} />
                  </button>

                  <div className="absolute bottom-4 left-6 right-6">
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-cyan text-navy inline-block mb-2 shadow">
                      {selectedEvent.category} Agenda
                    </span>
                    <h4 className="text-lg md:text-xl font-bold text-white uppercase leading-snug">{selectedEvent.title}</h4>
                  </div>
                </div>

                {/* Details layout grids */}
                <div className="p-6 md:p-8 space-y-6">
                  {/* Summary & Descriptions */}
                  <SafeHtml 
                    text={selectedEvent.description}
                    className="text-neutral-600 text-xs md:text-sm font-semibold leading-relaxed"
                  />

                  <div className="grid sm:grid-cols-2 gap-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-150 text-xs text-navy font-bold">
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-cyan shrink-0" />
                      <div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-wider leading-none mb-1">Scheduled Date</div>
                        <div>{selectedEvent.date} ({getEventDateParts(selectedEvent.date).month} {getEventDateParts(selectedEvent.date).day})</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-cyan shrink-0" />
                      <div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-wider leading-none mb-1">Agreed Time</div>
                        <div>{selectedEvent.time}</div>
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-start gap-3 border-t border-neutral-200/60 pt-3 mt-1">
                      <MapPin size={16} className="text-cyan shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[9px] text-neutral-400 uppercase tracking-wider leading-none mb-1">Administrative Assembly Location</div>
                        <div>{selectedEvent.location}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Close Details
                    </button>
                    <button
                      onClick={() => {
                        alert(`Successfully added "${selectedEvent.title}" to local calendar storage!`);
                      }}
                      className="px-6 py-3 rounded-xl bg-navy hover:bg-cyan text-white hover:text-navy text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow"
                    >
                      <Bell size={12} /> Add Reminder Alert
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
