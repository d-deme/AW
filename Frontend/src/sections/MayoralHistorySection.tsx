import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Target } from 'lucide-react';
import { useApi } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { MayoralHistory } from '../types';
import { SafeHtml, stripHtml } from '../components/ui/SafeHtml';

export const MayoralHistorySection = () => {
  const { data: mayoralHistory, loading, error } = useApi<MayoralHistory[]>('/mayoral-history');
  const [activeMayor, setActiveMayor] = useState<string | null>(null);

  useEffect(() => {
    if (mayoralHistory && mayoralHistory.length > 0 && !activeMayor) {
      setActiveMayor(mayoralHistory[0].id);
    }
  }, [mayoralHistory, activeMayor]);

  const currentMayor = (mayoralHistory || []).find(m => m.id === activeMayor);

  return (
    <section id="history" className="section-padding bg-neutral-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(0,229,255,0.05),transparent_50%)]" />
      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50, scale: 0.9, rotateY: -10 }}
          whileInView={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="mb-20"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-cyan mb-4">Historical Documentation</h3>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy mb-6 font-official">Mayoral History</h2>
          <p className="text-neutral-500 text-sm md:text-lg font-medium max-w-2xl">A chronological journey through the leadership that has shaped Adama City over the decades.</p>
        </motion.div>

        {loading ? (
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
            <div className="lg:col-span-9">
              <div className="card p-16 space-y-10">
                <div className="grid md:grid-cols-3 gap-16">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                    <div className="grid md:grid-cols-2 gap-10">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-48 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-bold">Error loading history: {error}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Timeline Sidebar */}
            <div className="lg:col-span-3 space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {(mayoralHistory || []).map((mayor) => (
                <button
                  key={mayor.id}
                  onClick={() => setActiveMayor(mayor.id)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex flex-col gap-2 group ${activeMayor === mayor.id ? 'bg-navy border-navy shadow-xl shadow-navy/20' : 'bg-white border-neutral-100 hover:border-cyan/30 shadow-sm'}`}
                  aria-label={`View term of ${mayor.name}: ${mayor.term}`}
                  aria-pressed={activeMayor === mayor.id}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${activeMayor === mayor.id ? 'text-cyan' : 'text-neutral-400'}`}>
                    {mayor.term}
                  </span>
                  <span className={`text-lg font-bold transition-colors ${activeMayor === mayor.id ? 'text-white' : 'text-navy group-hover:text-cyan'}`}>
                    {mayor.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Detail View */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                {currentMayor && (
                  <motion.div
                    key={activeMayor || 'empty'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="card p-10 md:p-16"
                  >
                    <div className="grid md:grid-cols-3 gap-16">
                      <div className="md:col-span-1">
                        <div className="relative group">
                          <div className="absolute -inset-3 border border-cyan/20 rounded-2xl group-hover:border-cyan/50 transition-all" />
                          <img src={currentMayor.photoUrl || undefined} alt={currentMayor.name} className="w-full aspect-[3/4] object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700 shadow-2xl" referrerPolicy="no-referrer" loading="lazy" />
                          <div className="absolute -bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 text-center rounded-2xl shadow-xl border border-neutral-100">
                            <div className="text-[10px] text-cyan font-bold uppercase tracking-widest mb-1">Term of Office</div>
                            <div className="text-base font-bold text-navy">{currentMayor.term}</div>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2 grid md:grid-cols-subgrid md:gap-x-16 gap-y-10">
                        <div className="md:col-span-2">
                          <h3 className="text-2xl md:text-4xl font-black tracking-tight text-navy mb-4">{currentMayor.name}</h3>
                          <p className="text-neutral-500 text-sm md:text-lg leading-relaxed italic font-medium">"{stripHtml(currentMayor.summary)}"</p>
                        </div>

                        <div className="md:col-span-1 space-y-6">
                          <h4 className="text-xs font-bold text-cyan uppercase tracking-widest flex items-center gap-3">
                            <Award size={16} /> Key Achievements
                          </h4>
                          <ul className="space-y-4">
                            {currentMayor.achievements.map((ach, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-neutral-500 font-medium">
                                <div className="w-1.5 h-1.5 bg-cyan rounded-full mt-1.5 shrink-0" />
                                {ach}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="md:col-span-1 space-y-6">
                          <h4 className="text-xs font-bold text-cyan uppercase tracking-widest flex items-center gap-3">
                            <Target size={16} /> Major Initiatives
                          </h4>
                          <ul className="space-y-4">
                            {currentMayor.initiatives.map((init, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-neutral-500 font-medium">
                                <div className="w-1.5 h-1.5 bg-navy rounded-full mt-1.5 shrink-0" />
                                {init}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {currentMayor.details && (
                          <div className="md:col-span-2 pt-8 border-t border-neutral-100">
                            <span className="text-[10px] font-black text-cyan uppercase tracking-[0.25em] block mb-3 font-mono">Office Record & Full Biography</span>
                            <SafeHtml text={currentMayor.details} className="text-sm text-neutral-500 leading-relaxed font-medium" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
