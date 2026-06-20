import React from 'react';
import { motion } from 'motion/react';
import { MapIcon, ChevronRight, Star, MapPin } from 'lucide-react';
import { useApi } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { CulturePlanner } from '../components/layout/CulturePlanner';
import { HighContrastImage } from '../components/ui/HighContrastImage';

interface TourismSectionProps {
  onNavigate: (page: string) => void;
}

export const TourismSection = ({ onNavigate }: TourismSectionProps) => {
  const { data: destinations, loading } = useApi<any[]>('/tourism');

  return (
    <section id="tourism" className="section-padding bg-neutral-50">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, x: 100, scale: 0.8, rotateX: 20 }}
          whileInView={{ opacity: 1, x: 0, scale: 1, rotateX: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-navy-light mb-4">Visit Adama</h3>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-navy mb-6 font-official">Discover Our Vibrant City</h2>
          <p className="text-neutral-500 text-base md:text-lg font-medium">Experience the natural beauty, rich culture, and warm hospitality of Adama.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {loading ? (
            [1, 2].map(i => (
              <div key={i} className="card p-0 overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="p-10 space-y-4">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))
          ) : (
            (destinations || []).slice(0, 2).map((attraction) => {
              const rating = attraction.rating || (attraction.name?.toLowerCase().includes('sodere') ? 4.8 : 4.7);
              const category = attraction.category || (attraction.name?.toLowerCase().includes('sodere') ? 'Wellness & Spa Resort' : 'Culture & Heritage');
              return (
                <div key={attraction.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl border border-neutral-100 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-cyan/20">
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
                    <HighContrastImage src={attraction.imageUrl} alt={attraction.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 z-10">
                      <Star className="text-amber-400 fill-amber-400" size={14} />
                      <span className="text-white text-xs font-bold leading-none">{rating.toFixed(1)} / 5</span>
                    </div>
                    <div className="absolute bottom-4 left-6 flex items-center gap-1.5 text-white/90 text-sm font-semibold z-10 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                      <MapPin size={14} className="text-cyan" />
                      <span>{attraction.location || 'Adama, Ethiopia'}</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow justify-between bg-white text-left border-t border-neutral-100">
                    <div>
                      <div className="flex items-center gap-2 text-cyan text-xs font-black uppercase tracking-widest mb-3">
                        <MapIcon size={14} /> {category}
                      </div>
                      <h3 className="text-2xl font-black mb-3 text-navy tracking-tight leading-tight font-official">{attraction.name}</h3>
                      
                      {/* High Legibility Contrast Paragraph */}
                      <p className="text-neutral-750 text-sm md:text-base font-semibold leading-relaxed mb-6">
                        Experience the best of Adama at <span className="text-navy font-black">{attraction.name}</span>. Rated <span className="text-amber-600 font-extrabold">{rating?.toFixed(1) || '4.8'} / 5</span> by verified visitors. {attraction.description || ''}
                      </p>
                    </div>
                    
                    {/* Footnote Row with Star Ratings pill and Explore Button */}
                    <div className="pt-5 border-t border-neutral-155 flex flex-wrap gap-4 justify-between items-center bg-white">
                      <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-150 px-3 py-1.5 rounded-full select-none">
                        <span className="text-[9px] text-amber-800 font-black uppercase tracking-wider">REPUTATION:</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={`${i < Math.floor(rating || 4) ? 'text-amber-500 fill-amber-500' : 'text-neutral-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => onNavigate('#tourism')} 
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-navy hover:text-cyan transition-colors group/btn cursor-pointer py-1.5"
                        aria-label={`Explore destination: ${attraction.name}`}
                      >
                        <span>Explore Destination</span>
                        <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-cyan" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card p-10">
            <h4 className="text-xl font-bold mb-4 text-navy">Events & Festivals</h4>
            <p className="text-sm text-neutral-500 mb-8 font-medium leading-relaxed">From traditional celebrations to modern music festivals, there's always something happening in Adama.</p>
            <button onClick={() => onNavigate('#events')} className="text-cyan text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer">View Event Calendar</button>
          </div>
          <div className="card p-10">
            <h4 className="text-xl font-bold mb-4 text-navy">Visitor Guide</h4>
            <p className="text-sm text-neutral-500 mb-8 font-medium leading-relaxed">Find the best places to stay, eat, and explore. Our comprehensive guide has everything you need.</p>
            <button onClick={() => onNavigate('#tourism')} className="text-cyan text-xs font-bold uppercase tracking-widest hover:underline">Download Guide</button>
          </div>
          <div className="card p-10">
            <h4 className="text-xl font-bold mb-4 text-navy">Photo Gallery</h4>
            <p className="text-sm text-neutral-500 mb-8 font-medium leading-relaxed">Take a visual tour of Adama and see why it's one of Ethiopia's most beloved cities.</p>
            <button onClick={() => onNavigate('#tourism')} className="text-cyan text-xs font-bold uppercase tracking-widest hover:underline">View Gallery</button>
          </div>
        </div>

        <CulturePlanner />
      </div>
    </section>
  );
};
