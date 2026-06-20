import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ArrowUpRight } from 'lucide-react';
import { useApi } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { Initiative } from '../types';
import { stripHtml } from '../components/ui/SafeHtml';

interface InitiativesSectionProps {
  onNavigate: (page: string) => void;
}

export const InitiativesSection = ({ onNavigate }: InitiativesSectionProps) => {
  const { data: initiatives, loading, error } = useApi<Initiative[]>('/initiatives');
  const [filter, setFilter] = useState('All');

  const filteredInitiatives = (initiatives || []).filter(item => 
    (filter === 'All' || item.category === filter)
  );

  return (
    <section id="initiatives" className="section-padding bg-white">
      <div className="container-custom">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -80, scale: 0.85 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan mb-4">Strategic Initiatives</h3>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy mb-6 font-official">Transforming Adama</h2>
            <p className="text-neutral-500 text-sm md:text-lg font-medium">Our roadmap for a smarter, more sustainable, and inclusive city for all residents.</p>
          </motion.div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 bg-neutral-50 p-1.5 rounded-xl">
              {['All', 'Smart City', 'Infrastructure', 'Community'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === cat ? 'bg-navy text-white shadow-lg shadow-navy/20' : 'text-neutral-400 hover:bg-neutral-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-0 overflow-hidden">
                <Skeleton className="aspect-video rounded-none" />
                <div className="p-8 space-y-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-bold">Error loading initiatives: {error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredInitiatives.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="card group overflow-hidden flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img src={item.imageUrl || undefined} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-navy rounded-full shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${item.status === 'Ongoing' ? 'bg-green-100 text-green-600' : item.status === 'Planned' ? 'bg-yellow-100 text-yellow-600' : 'bg-cyan/10 text-cyan'}`}>
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-navy">{item.timeline}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-navy card-title leading-tight">{item.title}</h3>
                    <p className="text-base text-neutral-500 mb-8 line-clamp-3 font-medium leading-relaxed">{stripHtml(item.description, 160)}</p>
                    
                    <div className="mt-auto space-y-6">
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: item.status === 'Completed' ? '100%' : item.status === 'Ongoing' ? '65%' : '15%' }}
                          className={`h-full ${item.status === 'Completed' ? 'bg-green-500' : 'bg-cyan'}`}
                        />
                      </div>
                      <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center text-cyan">
                            <Target size={16} />
                          </div>
                          <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                            Impact: <span className="text-navy">{item.impact}</span>
                          </div>
                        </div>
                        <button onClick={() => onNavigate('#contact')} className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-navy hover:bg-cyan hover:text-white transition-all">
                          <ArrowUpRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};
