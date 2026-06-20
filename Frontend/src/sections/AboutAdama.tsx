import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Map, 
  Mountain, 
  Layers, 
  CloudSun, 
  Users, 
  Eye, 
  Award,
  Compass
} from 'lucide-react';
import { useApi } from '../services/api';
import { useHeadlessCms, mapSiteSettings } from '../services/headlessCms';
import { Skeleton } from '../components/ui/Skeleton';
import { HighContrastImage } from '../components/ui/HighContrastImage';
import { SafeHtml, stripHtml } from '../components/ui/SafeHtml';

export const AboutAdama = () => {
  const { data: about, loading: aboutLoading, error: aboutError } = useApi<any>('/site-settings');
  const { data: settings, loading: settingsLoading, error: settingsError } = useHeadlessCms('/site-settings', mapSiteSettings);

  const loading = aboutLoading || settingsLoading;
  const error = aboutError || settingsError;

  if (loading) {
    return (
      <div className="space-y-12 py-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <Skeleton className="h-4 w-1/4 bg-white/5" />
            <Skeleton className="h-12 w-3/4 bg-white/5" />
            <Skeleton className="h-32 w-full bg-white/5" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5" />
        </div>
        <div className="pt-8 border-t border-white/5">
          <div className="space-y-4 mb-6">
            <Skeleton className="h-4 w-1/5 bg-white/5" />
            <Skeleton className="h-8 w-2/5 bg-white/5" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
            <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
            <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
            <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
            <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
            <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
            <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !about) {
    return (
      <div className="p-8 bg-red-950/40 border border-red-500/20 text-red-200 rounded-2xl max-w-xl mx-auto text-center space-y-4">
        <p className="text-sm font-semibold">Could not load historical and demographic records</p>
        <p className="text-xs text-neutral-400 font-mono">{error || 'Unknown Error'}</p>
      </div>
    );
  }

  // Construct dynamic KPI cards array strictly mapped from /site-settings response
  const quickFacts = settings ? [
    { 
      label: "Established", 
      value: settings.established, 
      description: "Over a century of rich city heritage and industrial growth" 
    },
    { 
      label: "Total Area", 
      value: settings.area, 
      description: "Expansive modern municipal borders" 
    },
    { 
      label: "Altitude", 
      value: settings.altitude, 
      description: "Highland altitude optimizing respiratory health and atmospheric breeze" 
    },
    { 
      label: "Elevation", 
      value: settings.altitude, 
      description: "Elevated geographic footprint across the East Rift Valley" 
    },
    { 
      label: "Climate", 
      value: settings.avgClimate, 
      description: "Moderately warm, perfect for active year-round enterprise" 
    },
    { 
      label: "Population", 
      value: settings.population, 
      description: "A thriving, dynamic, and diverse public demographic powerhouse" 
    },
    { 
      label: "Structure", 
      value: settings.administrativeStructure, 
      description: "Highly decentralized and community-centric governance" 
    }
  ] : [];

  // Map factual statistics to dynamic visual properties
  const getFactDecoration = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('established')) {
      return {
        icon: <Calendar className="text-amber-400 shrink-0" size={20} />,
        border: 'hover:border-amber-400/40',
        glow: 'from-amber-400/5 to-transparent',
        tag: 'Timeline Heritage'
      };
    }
    if (l.includes('area')) {
      return {
        icon: <Map className="text-emerald-400 shrink-0" size={20} />,
        border: 'hover:border-emerald-400/40',
        glow: 'from-emerald-400/5 to-transparent',
        tag: 'Spatial Horizon'
      };
    }
    if (l.includes('altitude')) {
      return {
        icon: <Mountain className="text-teal-400 shrink-0" size={20} />,
        border: 'hover:border-teal-400/40',
        glow: 'from-teal-400/5 to-transparent',
        tag: 'Geographic Scale'
      };
    }
    if (l.includes('elevation')) {
      return {
        icon: <Compass className="text-cyan shrink-0" size={20} />,
        border: 'hover:border-cyan/40',
        glow: 'from-cyan/5 to-transparent',
        tag: 'Strategic Elevation'
      };
    }
    if (l.includes('climate') || l.includes('weather') || l.includes('temperature')) {
      return {
        icon: <CloudSun className="text-orange-400 shrink-0" size={20} />,
        border: 'hover:border-orange-400/40',
        glow: 'from-orange-400/5 to-transparent',
        tag: 'Ambient Forecast'
      };
    }
    if (l.includes('population') || l.includes('demographic')) {
      return {
        icon: <Users className="text-sky-400 shrink-0" size={20} />,
        border: 'hover:border-sky-400/40',
        glow: 'from-sky-400/5 to-transparent',
        tag: 'Human Powerhouse'
      };
    }
    if (l.includes('structure') || l.includes('administrative')) {
      return {
        icon: <Layers className="text-indigo-400 shrink-0" size={20} />,
        border: 'hover:border-indigo-400/40',
        glow: 'from-indigo-400/5 to-transparent',
        tag: 'Civic Devolution'
      };
    }
    return {
      icon: <Compass className="text-cyan shrink-0" size={20} />,
      border: 'hover:border-cyan/40',
      glow: 'from-cyan/5 to-transparent',
      tag: 'Strategic Metric'
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring' as const, 
        stiffness: 110, 
        damping: 16,
        mass: 0.7
      } 
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-16 text-left"
    >
      {/* Upper Story & Visual Core Block */}
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-7 space-y-8">
          <div>
            <span className="text-[10px] font-black text-cyan uppercase tracking-[0.3em] block mb-3">THE STRATEGIC STORY</span>
            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none font-official">
              {about.title || 'Adama City'}
            </h3>
          </div>
          
          <SafeHtml 
            text={settings?.aboutUs || about.content} 
            fallback="A vibrant node of industrial and logistical synergy in East-Central Ethiopia." 
            className="text-neutral-200 text-lg leading-relaxed font-normal bg-white/[0.01] border-l-2 border-cyan/40 pl-6 py-2" 
          />

          <p className="text-sm text-neutral-300 leading-relaxed font-semibold">
            {stripHtml(settings?.aboutUs) || "Adama represents the cornerstone of municipal modernity, serving as a vital trade gate, industrial epicenter, and administrative blueprint. Through sustainable development, environmental resilience, and dynamic community-centric devolution models, we are fostering unparalleled pathways for enterprise and liveability."}
          </p>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 pt-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
          >
            <motion.div 
              variants={itemVariants}
              className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-cyan/30 hover:bg-white/[0.04] transition-all group shadow-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Eye className="text-cyan shrink-0" size={16} />
                <h4 className="text-[10px] font-black text-cyan uppercase tracking-widest">Vision</h4>
              </div>
              <SafeHtml 
                text={settings?.vision || about.vision} 
                fallback="To become the premier industrial and green-aligned smart administrative hub." 
                className="text-xs text-neutral-200 leading-relaxed font-semibold" 
              />
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-magenta/30 hover:bg-white/[0.04] transition-all group shadow-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Compass className="text-magenta shrink-0" size={16} />
                <h4 className="text-[10px] font-black text-magenta uppercase tracking-widest">Mission</h4>
              </div>
              <SafeHtml 
                text={settings?.mission || about.mission} 
                fallback="To maximize public efficiency, accelerate modern city transition, and enhance equity." 
                className="text-xs text-neutral-200 leading-relaxed font-semibold" 
              />
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="bg-white/[0.02] p-5 rounded-xl border border-white/5 hover:border-cyan/30 hover:bg-white/[0.04] transition-all group shadow-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="text-cyan shrink-0" size={16} />
                <h4 className="text-[10px] font-black text-cyan uppercase tracking-widest">Mandate</h4>
              </div>
              <SafeHtml 
                text={settings?.mandate || about.mandate} 
                fallback="To govern spatial development, support industrial setups, and deliver master utilities." 
                className="text-xs text-neutral-200 leading-relaxed font-semibold" 
              />
            </motion.div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 relative mt-6 lg:mt-0">
          <div className="absolute -inset-4 bg-gradient-to-tr from-cyan/10 to-transparent rounded-2xl -z-10 animate-pulse blur-lg" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,rgba(0,229,255,0.08),transparent_60%)] pointer-events-none" />
          
          <HighContrastImage 
            src={about.imageUrl || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390'} 
            alt="Adama City Municipal Corridor" 
            className="w-full h-[380px] lg:h-[460px] object-cover rounded-3xl shadow-2xl border border-white/15" 
          />
          
          {/* Decorative floating badge */}
          <div className="absolute -bottom-6 -left-6 bg-navy/90 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-xl max-w-xs hidden sm:block">
            <span className="text-[9px] font-black tracking-widest text-cyan uppercase block mb-1">East Gate Hub</span>
            <p className="text-xs text-neutral-200 leading-tight font-bold">Connecting key agricultural, logistics, and production corridors of Ethiopia.</p>
          </div>
        </div>
      </div>

      {/* Modern Bento-Style Statistics and Fact Cards */}
      <div className="pt-10 border-t border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-cyan uppercase tracking-[0.3em] block mb-2">City Profile</span>
            <h4 className="text-2xl font-black text-white uppercase tracking-tight font-official">
              Adama Dimension Profiles
            </h4>
          </div>
          <p className="text-xs text-neutral-400 max-w-sm md:text-right font-semibold">
            All data points are synchronized live through our municipal Central Management System (CMS).
          </p>
        </div>

        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {quickFacts.map((fact: any, index: number) => {
            const dec = getFactDecoration(fact.label);
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ 
                  y: -6, 
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className={`bg-white/[0.01] bg-gradient-to-br ${dec.glow} p-6 rounded-2xl border border-white/5 ${dec.border} transition-all duration-300 shadow-xl group relative overflow-hidden`}
              >
                {/* Decorative graphic element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                    {dec.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-cyan uppercase tracking-widest leading-none">
                      {dec.tag}
                    </span>
                    <span className="text-xs font-bold text-neutral-400 mt-1 leading-none">
                      {fact.label}
                    </span>
                  </div>
                </div>

                <div className="text-3xl font-black text-white tracking-tight font-official mb-2 group-hover:translate-x-1.5 transition-transform duration-300">
                  {fact.value}
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed font-semibold">
                  {stripHtml(fact.description)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};
