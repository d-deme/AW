// Frontend/src/sections/Hero.tsx
import React from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, MapPin, Layers, Calendar, TrendingUp, Pause, Play } from 'lucide-react';
import { useApi } from '../services/api';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { CityService } from '../types';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export const Hero = ({ onNavigate }: HeroProps) => {
  // Use only the correct endpoints
  const { data: heroVideo, loading: heroLoading } = useApi<any>('/hero-video');
  const { data: services, loading: servicesLoading } = useApi<CityService[]>('/services');
  const { data: siteSettings, loading: settingsLoading } = useApi<any>('/site-settings');
  console.log('heroVideo:', heroVideo); //test
  console.log('video_url:', heroVideo?.video_url); //test
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  if (heroLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan border-t-navy rounded-full animate-spin" />
      </div>
    );
  }

  // Use data from site_settings and hero_video
  const displayTitle = siteSettings?.site_name || heroVideo?.title || "ADAMA CITY";
  const displaySubtitle = heroVideo?.subtitle || "";
  const displayDescription = siteSettings?.site_description || heroVideo?.description || "Welcome to the digital heart of Adama. Explore our vibrant city, access government services, and stay informed about our growth and opportunities.";
  const videoUrl = heroVideo?.video_url || "https://assets.mixkit.co/videos/preview/mixkit-busy-street-in-a-modern-city-4064-large.mp4";
  const posterUrl = heroVideo?.fallback_image || "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=2000";

  return (
    <section id="home" className="relative min-h-screen flex items-start lg:items-center justify-center overflow-hidden pt-28 sm:pt-32 md:pt-36 lg:pt-[13.5rem] xl:pt-[15rem] pb-20 lg:pb-24 bg-navy">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/60 to-transparent z-10" />
        <motion.video 
          ref={videoRef}
          key={videoUrl}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          autoPlay 
          muted 
          loop 
          playsInline
          className="w-full h-full object-cover"
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/mp4" />
        </motion.video>
      </div>
      //test
<video
  ref={videoRef}
  key={videoUrl}
  onError={(e) => console.error('Video load error:', e)}
  // ... other props
/>
      {/* Rest of the JSX (same as before, but using displayTitle etc.) */}
      {/* ... (keep the rest of your JSX unchanged, just use displayTitle, displaySubtitle, displayDescription) */}
      {/* I'll include the full JSX for completeness */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 relative z-20 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="inline-flex flex-wrap sm:flex-nowrap items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-widest uppercase mb-3 sm:mb-4 lg:mb-5 max-w-full"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="break-words">{displaySubtitle}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 40, rotateX: -30 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-3 sm:mb-4 lg:mb-5 text-white leading-[1.1] font-official"
          >
            {displayTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-lg mb-4 sm:mb-5 lg:mb-6 leading-relaxed font-medium"
          >
            {displayDescription}
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="relative max-w-md mb-4 sm:mb-5 lg:mb-6 group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-cyan transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search services, news, or documents..." 
              className="w-full bg-white/5 border border-white/10 p-4 sm:p-5 pl-12 sm:pl-14 rounded-xl text-xs sm:text-sm text-white focus:border-cyan focus:ring-4 focus:ring-cyan/10 outline-none transition-all shadow-2xl backdrop-blur-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value.toLowerCase();
                  if (query.includes('news') || query.includes('update')) onNavigate('#news');
                  else if (query.includes('map') || query.includes('location')) onNavigate('#map');
                  else if (query.includes('invest') || query.includes('business')) onNavigate('#business');
                  else onNavigate('#services');
                }
              }}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => onNavigate('#government?tab=About')} 
              className="btn-primary flex items-center gap-2 group"
              aria-label="Explore Adama City government and history"
            >
              Explore Adama <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('#tourism')} 
              className="btn-secondary border-white text-white hover:bg-white/10"
              aria-label="Visit Adama City tourist attractions"
            >
              Visit Adama
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full relative mt-6 sm:mt-8 lg:mt-0"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-navy-light/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-navy-light/10 rounded-full blur-3xl animate-pulse" />
          
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6 lg:mb-8 ml-2">City Profile</h3>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className="card-dark p-5 sm:p-6 lg:p-8 group hover:-translate-y-1.5 transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan mb-4 sm:mb-6 border border-cyan/25">
                <MapPin size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-cyan uppercase font-bold tracking-widest mb-1">Municipal Area</div>
              <div className="text-xl sm:text-2xl font-black text-white">{siteSettings?.area || "58,109 ha"}</div>
              <p className="text-[10px] sm:text-[10.5px] text-neutral-400 mt-1 sm:mt-2 font-medium leading-relaxed">Expansive modern boundary</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="card-dark p-5 sm:p-6 lg:p-8 group hover:-translate-y-1.5 transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan mb-4 sm:mb-6 border border-cyan/25">
                <Layers size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-cyan uppercase font-bold tracking-widest mb-1">Administrative Node</div>
              <div className="text-xl sm:text-2xl font-black text-white">{siteSettings?.administrative_structure || "6 Sub-Cities, 19 Kebeles, 32 Municipal Directorates"}</div>
              <p className="text-[10px] sm:text-[10.5px] text-neutral-400 mt-1 sm:mt-2 font-medium leading-relaxed">Highly decentralized corridors</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="card-dark p-5 sm:p-6 lg:p-8 group hover:-translate-y-1.5 transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan mb-4 sm:mb-6 border border-cyan/25">
                <Calendar size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-cyan uppercase font-bold tracking-widest mb-1">Established</div>
              <div className="text-xl sm:text-2xl font-black text-white">{siteSettings?.established || "1924 GC"}</div>
              <p className="text-[10px] sm:text-[10.5px] text-neutral-400 mt-1 sm:mt-2 font-medium leading-relaxed">Over a century of rich city heritage</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="card-dark p-5 sm:p-6 lg:p-8 group hover:-translate-y-1.5 transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan mb-4 sm:mb-6 border border-cyan/25">
                <TrendingUp size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="text-[9px] sm:text-[10px] text-cyan uppercase font-bold tracking-widest mb-1">Population</div>
              <div className="text-xl sm:text-2xl font-black text-white">{siteSettings?.population || "1M+"}</div>
              <p className="text-[10px] sm:text-[10.5px] text-neutral-400 mt-1 sm:mt-2 font-medium leading-relaxed">A thriving, diverse powerhouse</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 text-center w-full px-4"
      >
        <a href="#about" className="text-[10px] text-cyan hover:text-white uppercase tracking-[0.3em] transition-all flex flex-col items-center gap-2 group">
          <span className="group-hover:translate-y-1 transition-transform">Learn About Adama</span>
          <div className="w-px h-8 md:h-12 bg-gradient-to-b from-cyan to-transparent" />
        </a>
      </motion.div>

      {/* Video Control Button */}
      <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-30">
        <button
          onClick={toggleVideoPlayback}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all backdrop-blur-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan cursor-pointer flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase"
          title={isVideoPlaying ? "Pause Video Background" : "Play Video Background"}
        >
          {isVideoPlaying ? <Pause size={12} /> : <Play size={12} />}
          <span>{isVideoPlaying ? "PAUSE VIDEO" : "PLAY VIDEO"}</span>
        </button>
      </div>
    </section>
  );
};