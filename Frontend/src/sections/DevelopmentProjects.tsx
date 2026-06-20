import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useApi } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { Project } from '../types';

interface DevelopmentProjectsProps {
  onNavigate: (page: string) => void;
}

export const DevelopmentProjects = ({ onNavigate }: DevelopmentProjectsProps) => {
  const { data: projects, loading, error } = useApi<Project[]>('/initiatives?status=published');

  return (
    <section id="development" className="section-padding bg-neutral-50">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.9, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-cyan mb-4">Urban Transformation</h3>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy mb-6 font-official">City Projects & Initiatives</h2>
          <p className="text-neutral-500 text-base md:text-lg font-medium">Highlighting the key projects driving Adama's transformation into a modern, sustainable city.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-0 overflow-hidden">
                <Skeleton className="aspect-video rounded-none" />
                <div className="p-8 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-bold">Error loading projects: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {(projects || []).map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative card overflow-hidden flex flex-col"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 responsive-image"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-navy rounded-full shadow-sm">
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${project.status === 'Live' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-navy card-title leading-tight">{project.title}</h3>
                  <p className="text-base text-neutral-500 mb-8 line-clamp-2 font-medium leading-relaxed">{project.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-neutral-100 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Impact</div>
                      <div className="text-sm font-bold text-navy">{project.impact}</div>
                    </div>
                    <button onClick={() => onNavigate('#initiatives')} className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-navy hover:bg-cyan hover:text-white transition-all">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
