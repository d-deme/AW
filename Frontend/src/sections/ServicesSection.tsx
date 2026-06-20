import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useApi } from '../services/api';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { Skeleton } from '../components/ui/Skeleton';
import { CityService } from '../types';
import { stripHtml } from '../components/ui/SafeHtml';

interface ServicesSectionProps {
  onNavigate: (page: string) => void;
}

export const ServicesSection = ({ onNavigate }: ServicesSectionProps) => {
  const { data: services, loading, error } = useApi<CityService[]>('/services');

  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, x: -100, scale: 0.8, rotateX: -20 }}
          whileInView={{ opacity: 1, x: 0, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-navy-light mb-4">Public Services</h3>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy mb-6 font-official">How can we help you today?</h2>
          <p className="text-neutral-500 text-sm md:text-lg font-medium">Access essential government services online, anytime. We are committed to making city life easier for everyone.</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card p-10 space-y-6">
                <Skeleton className="w-16 h-16" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-red-600 font-bold">Error loading services: {error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(services || []).map((service) => (
              <div key={service.id} className="card p-10 group hover:-translate-y-2">
                <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-cyan/10 group-hover:text-cyan text-neutral-400 transition-all duration-500">
                  <ServiceIcon iconName={service.icon} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-navy card-title leading-tight">{service.title}</h3>
                <p className="text-sm text-neutral-500 mb-10 leading-relaxed font-semibold">{stripHtml(service.description, 120)}</p>
                <button 
                  onClick={() => onNavigate(service.link)} 
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy-light group/link"
                  aria-label={`Access ${service.title} service`}
                >
                  Access Service <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 bg-navy p-12 md:p-20 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">Need Assistance?</h3>
            <p className="text-neutral-400 mb-10 max-w-2xl mx-auto text-sm md:text-lg">Our support team is available to assist you with any city-related inquiries or technical issues with our digital portal.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => onNavigate('#contact')} className="btn-primary px-10">Visit Help Center</button>
              <button onClick={() => onNavigate('#contact')} className="px-10 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all">Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
