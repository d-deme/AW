import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, CheckSquare, Clock, Coffee, Compass, Heart, Landmark, MapPin, Sparkles, Sun, Thermometer } from 'lucide-react';

interface ItineraryStep {
  time: string;
  activity: string;
  location: string;
  description: string;
  tip: string;
}

interface TravelTheme {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  seasonRating: string;
  temp: string;
  icon: any;
  steps: ItineraryStep[];
}

const TOURISM_THEMES: TravelTheme[] = [
  {
    id: 'wellness',
    title: 'Sodere Hot Springs & Wellness',
    subtitle: 'Healing Thermal Escape',
    description: 'A soothing full-day itinerary focusing on Adama\'s legendary natural thermal springs, tropical baths, and local forest hikes along the Awash River.',
    seasonRating: 'Perfect Year-Round',
    temp: '32°C • Sunny',
    icon: Sun,
    steps: [
      {
        time: '08:30 AM',
        activity: 'Depart Adama City for Sodere',
        location: 'Inbound Shuttle Road',
        description: 'Take a scenic 25km morning drive through the acacia fields and valley outskirts of Adama.',
        tip: 'Taxis or local shuttles run continuously from the central station.'
      },
      {
        time: '10:00 AM',
        activity: 'Healing Mineral Pool Soak',
        location: 'Sodere Springs Complex',
        description: 'Immerse Yourself in the legendary public or private hot spring pools. The naturally mineral-rich spring waters are celebrated for physical therapy and complete relaxation.',
        tip: 'Bring a towel and sandals. Standard locker rentals are available.'
      },
      {
        time: '01:00 PM',
        activity: 'Tropical Awash River Lunch',
        location: 'Soda Restaurant Terrace',
        description: 'Dine under massive ancient shade trees while observing native monkeys playing in the canopy near the river currents.',
        tip: 'Try the fresh pan-fried Tilapia fish, a local specialty caught daily!'
      },
      {
        time: '03:30 PM',
        activity: 'Acacia Botanical Forest Trail Hike',
        location: 'Awash Riparian Border',
        description: 'A light guided walk along the forest trails bordering the Awash river, featuring birdwatching, mineral spouts, and lush flora.',
        tip: 'Carry plenty of water and wear SPF protection.'
      }
    ]
  },
  {
    id: 'culture',
    title: 'Oromo Heritage & Coffee Rituals',
    subtitle: 'Authentic Folk Arts & Flavors',
    description: 'A deep dive into the cultural soul of Adama. Explore historical centers, artisanal markets, the historic Oromo coffee rituals, and traditional Ethiopian dancing.',
    seasonRating: 'Excellent Cultural Hub',
    temp: '28°C • Breezy',
    icon: Coffee,
    steps: [
      {
        time: '09:00 AM',
        activity: 'Oromo Traditional Arts & Music Hub',
        location: 'Adama Cultural Center',
        description: 'Inspect authentic Oromo handwoven items, historic musical instruments, and local Oromia art galleries.',
        tip: 'Ask local guides about the "Gadaa system" governance architecture displays.'
      },
      {
        time: '11:30 AM',
        activity: 'Ethiopian Gourmet Coffee Ceremony',
        location: 'Buna Central Roastery',
        description: 'Participate in a complete triple-brew coffee ceremony (Abol, Tona, Baraka). Watch the raw coffee beans roasted by hand, ground by mortar, and brewed in a clay Jabena.',
        tip: 'It is traditional to accept all three cups as a sign of respect and friendship.'
      },
      {
        time: '01:30 PM',
        activity: 'Oromo Traditional Feast',
        location: 'Oda Traditional Restaurant',
        description: 'Feast on authentic Oromo dishes such as Chumbo (layered crepe with spiced butter) or kitfo paired with locally baked honey bread.',
        tip: 'Dishes are traditionally shared on a large communal tray.'
      },
      {
        time: '04:00 PM',
        activity: 'Artisanal Handicrafts Shopping',
        location: 'Adama Souvenir District',
        description: 'Browse local pottery, customized leatherware, handspun cotton scarves, and fresh Ethiopian spices.',
        tip: 'Friendly bargaining is standard and expected here.'
      }
    ]
  },
  {
    id: 'adventure',
    title: 'Windfarms & Rift Valley Ridges',
    subtitle: 'Clean Energy & Scenic Views',
    description: 'An eco-forward adventure showcasing Adama\'s position as Ethiopia\'s wind power pioneer, combined with hiking the scenic high ridges of the East African Rift Valley.',
    seasonRating: 'Best in Afternoon',
    temp: '26°C • High Wind',
    icon: Compass,
    steps: [
      {
        time: '02:00 PM',
        activity: 'Adama I Wind Power Reserve',
        location: 'Adama High Ridge',
        description: 'Stand directly underneath the colossal white wind turbines that supply green energy to the country. Witness clean-energy initiatives in action.',
        tip: 'Hold onto your hats! The wind currents on the ridge are consistently high.'
      },
      {
        time: '04:30 PM',
        activity: 'Rift Valley Sunset Trek',
        location: 'Nazret Escarpment',
        description: 'Hike along the high ridge trails for a dramatic panoramic view of Adama city and the vast Rift Valley plains reflecting the orange glow of sunset.',
        tip: 'Perfect opportunity for landscape photography. Take binoculars!'
      },
      {
        time: '07:30 PM',
        activity: 'Rooftop Fireside Dinner',
        location: 'SkyRidge Lounge Nazret',
        description: 'Wind down your adventure with a modern fusion dinner overlooking the sparkling night lights of the city gateway.',
        tip: 'Booking ahead is highly recommended for weekend evenings.'
      }
    ]
  }
];

export const CulturePlanner = () => {
  const [activeThemeId, setActiveThemeId] = useState('wellness');
  const [checkedActivities, setCheckedActivities] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState(false);

  const currentTheme = TOURISM_THEMES.find(t => t.id === activeThemeId) || TOURISM_THEMES[0];
  const ThemeIcon = currentTheme.icon;

  const toggleActivity = (stepId: string) => {
    setCheckedActivities(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  return (
    <div className="card p-10 md:p-14 border border-neutral-200 bg-white/70 backdrop-blur-md mt-16 shadow-2xl">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan/10 border border-cyan/20 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan mb-4">
          <Sparkles size={10} className="animate-spin" /> Adama Concierge Companion
        </div>
        <h3 className="text-3xl font-black text-navy mb-4 font-official">Interactive Journey Planner</h3>
        <p className="text-sm text-neutral-500 font-medium">
          Customize your exploration of Adama and Sodere by selecting a travel theme. Build your plan and check off activities as you travel.
        </p>
      </div>

      {/* Select buttons */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {TOURISM_THEMES.map(theme => {
          const btnActive = activeThemeId === theme.id;
          const BtnIcon = theme.icon;

          return (
            <button
              key={theme.id}
              onClick={() => {
                setActiveThemeId(theme.id);
                setCheckedActivities({});
              }}
              className={`p-6 rounded-2xl border text-left transition-all ${
                btnActive
                  ? 'bg-navy border-navy text-white shadow-xl scale-[1.02]'
                  : 'bg-neutral-50 border-neutral-200 text-navy hover:bg-neutral-100 hover:border-neutral-300'
              }`}
            >
              <div className={`p-2 rounded-xl w-fit mb-4 ${btnActive ? 'bg-white/10 text-cyan' : 'bg-white text-neutral-500 border border-neutral-200'}`}>
                <BtnIcon size={16} />
              </div>
              <div className="text-xs font-black uppercase tracking-widest mb-1">{theme.title}</div>
              <div className={`text-[9px] font-medium ${btnActive ? 'text-gray-300' : 'text-neutral-400'}`}>{theme.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Theme Header */}
      <div className="grid md:grid-cols-3 gap-8 items-center p-8 bg-neutral-50 rounded-2xl border border-neutral-200 mb-10">
        <div className="md:col-span-2">
          <h4 className="text-xl font-bold text-navy mb-2 flex items-center gap-2">
            <ThemeIcon size={18} className="text-cyan animate-pulse" /> {currentTheme.title} Itinerary
          </h4>
          <p className="text-xs text-neutral-500 leading-relaxed font-semibold">{currentTheme.description}</p>
        </div>
        <div className="flex flex-col gap-3 md:pl-8 md:border-l border-neutral-200 text-[10px] font-bold text-navy uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Thermometer size={14} className="text-magenta" />
            <span>Climate: {currentTheme.temp}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-cyan" />
            <span>Seasonality: {currentTheme.seasonRating}</span>
          </div>
        </div>
      </div>

      {/* Timeline steps */}
      <div className="relative border-l border-neutral-200 ml-4 md:ml-6 space-y-10 pl-6 md:pl-10">
        {currentTheme.steps.map((step, idx) => {
          const stepId = `${currentTheme.id}-step-${idx}`;
          const isDone = !!checkedActivities[stepId];

          return (
            <div key={idx} className="relative group">
              {/* Timeline dot */}
              <div
                onClick={() => toggleActivity(stepId)}
                className={`absolute -left-[45px] md:-left-[51px] top-1 w-9 h-9 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isDone
                    ? 'bg-green-500 border-green-500 text-white shadow-md'
                    : 'bg-white border-neutral-300 text-neutral-400 hover:border-cyan hover:text-cyan'
                }`}
              >
                {isDone ? <CheckSquare size={14} /> : <span className="text-[10px] font-black">{idx + 1}</span>}
              </div>

              {/* Step content */}
              <div className={`p-6 rounded-2xl border transition-all ${
                isDone 
                  ? 'bg-green-50/20 border-green-200 opacity-60' 
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-cyan uppercase tracking-wider bg-cyan/5 px-2.5 py-1 rounded-md border border-cyan/10">
                    <Clock size={12} /> {step.time}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                    <MapPin size={10} className="text-neutral-300" /> {step.location}
                  </span>
                </div>

                <h5 className={`text-base font-bold text-navy mb-2 ${isDone ? 'line-through text-neutral-400 font-semibold' : ''}`}>
                  {step.activity}
                </h5>
                <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Expert tip banner */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] text-neutral-500 leading-relaxed font-medium">
                  <span className="font-extrabold text-navy uppercase tracking-widest mr-1">Concierge tip:</span> {step.tip}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy planner status */}
      <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-6 relative">
        <p className="text-xs text-neutral-400 font-semibold font-mono">
          Progression: {Object.values(checkedActivities).filter(Boolean).length} of {currentTheme.steps.length} activities completed.
        </p>
        <div className="flex items-center gap-4 relative">
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-full mr-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl shadow-lg border border-emerald-400/20 whitespace-nowrap"
              >
                Copied to clipboard! ✓
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => {
              const checklistStr = currentTheme.steps
                .map((s, i) => `${i + 1}. [${checkedActivities[`${currentTheme.id}-step-${i}`] ? 'X' : ' '}] ${s.time} - ${s.activity}`)
                .join('\n');
              navigator.clipboard.writeText(`ADAMA ITINERARY PLAN: "${currentTheme.title}"\n${checklistStr}\n\nGenerated with Adama Gateway.`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
            className="btn-secondary py-3 px-6 text-xs flex items-center gap-2"
          >
            <Compass size={14} className="text-cyan animate-spin" /> Copy Active Plan Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
