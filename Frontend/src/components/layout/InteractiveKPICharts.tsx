import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, TrendingUp, Landmark, ExternalLink, HelpCircle } from 'lucide-react';

interface BudgetSector {
  name: string;
  percentage: number;
  amount: string; // e.g. "920M ETB"
  color: string;
  project: string;
  milestone: string;
}

const BUDGET_DATA: BudgetSector[] = [
  { name: 'Roads & Infrastructure', percentage: 35, amount: '920 Million ETB', color: '#0A1F44', project: 'Adama Central Beltway Interchange', milestone: '82% Completed' },
  { name: 'Smart City & IoT', percentage: 20, amount: '520 Million ETB', color: '#00E5FF', project: 'AI Traffic Management Corridor', milestone: 'Live Testing' },
  { name: 'Health & Welfare', percentage: 18, amount: '470 Million ETB', color: '#FF007F', project: 'Integrated Woreda Community Clinics', milestone: 'Procurement Stage' },
  { name: 'Parks & Green Reforestation', percentage: 15, amount: '390 Million ETB', color: '#10B981', project: 'Green Canopy & 5 Urban Parks', milestone: 'Phase III Complete' },
  { name: 'SME & Business Grants', percentage: 12, amount: '310 Million ETB', color: '#F59E0B', project: 'Industrial Park Incubation Fund', milestone: 'Active Disbursements' },
];

export const InteractiveKPICharts = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedSector = BUDGET_DATA[activeIndex] || BUDGET_DATA[0];

  return (
    <div className="card p-8 md:p-10 border border-neutral-200 mt-16 bg-white shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-neutral-100 pb-8">
        <div>
          <h4 className="text-xl font-black text-navy mb-1 leading-tight flex items-center gap-2">
            <Landmark size={18} className="text-cyan" /> Approved FY 2026 Budget
          </h4>
          <p className="text-xs text-neutral-400 font-medium">Approved by the Adama City General Council matching smart master plans.</p>
        </div>
        <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-100 text-[10px] text-green-600 font-bold uppercase tracking-widest">
          <ShieldCheck size={14} /> Council Ledger Audited
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left column: Chart */}
        <div className="relative flex flex-col items-center">
          <div className="w-full h-[280px] sm:h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={BUDGET_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={4}
                  dataKey="percentage"
                  onMouseEnter={(_, idx) => setActiveIndex(idx)}
                  className="outline-none"
                >
                  {BUDGET_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      style={{
                        filter: activeIndex === index ? 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.4))' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}% Weights`, 'Allocation']}
                  contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Text overlay */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-[52%] text-center pointer-events-none">
              <span className="text-3xl font-black text-navy leading-none font-mono">
                {selectedSector.percentage}%
              </span>
              <p className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-widest mt-1">
                Weight Weight
              </p>
            </div>
          </div>

          {/* Quick Legend indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {BUDGET_DATA.map((sector, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeIndex === idx 
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                    : 'border-neutral-200 text-neutral-400 hover:bg-neutral-50 hover:text-navy'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.color }} />
                <span>{sector.name.split(' & ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Informative description cards responding to the slice hovered */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-8 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-6 flex flex-col justify-between"
          >
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: selectedSector.color }} />
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                  Key Budget Target Sector
                </span>
              </div>
              <h5 className="text-xl font-bold text-navy leading-tight">{selectedSector.name}</h5>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-navy font-mono">
                  {selectedSector.amount}
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="p-5 bg-white border border-neutral-100 rounded-xl space-y-2.5">
              <div className="text-[9px] font-extrabold text-cyan uppercase tracking-widest flex items-center gap-1">
                <TrendingUp size={12} /> Primary Smart City Project
              </div>
              <p className="text-xs font-bold text-navy">{selectedSector.project}</p>
              <div className="flex justify-between items-center bg-neutral-50 p-2.5 rounded-lg text-[9px] font-bold text-neutral-400">
                <span>Milestone Stage</span>
                <span className="text-neutral-900 uppercase tracking-widest font-black">{selectedSector.milestone}</span>
              </div>
            </div>

            {/* Footer action hint */}
            <div className="flex justify-between items-center text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1 border-t border-neutral-200 pt-4">
              <span>Audited FY 2026</span>
              <button className="text-navy hover:text-cyan flex items-center gap-1 select-none transition-colors">
                Municipal Ledger <ExternalLink size={10} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
