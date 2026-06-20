import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Zap, Globe, ArrowUpRight } from 'lucide-react';
import { useApi } from '../services/api';
import { HighContrastImage } from '../components/ui/HighContrastImage';

const ROICalculator = () => {
  const [amount, setAmount] = useState<number>(500000);
  const [roi, setRoi] = useState<number | null>(null);

  const calculateROI = () => {
    // Simple logic: 12.5% return
    setRoi(amount * 0.125);
  };

  return (
    <div className="glass p-6 rounded-sm">
      <h5 className="text-xs font-bold text-cyan uppercase tracking-widest mb-4">ROI Calculator</h5>
      <div className="space-y-4">
        <div>
          <label className="block text-[8px] text-gray-500 uppercase mb-1">Investment Amount ($)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="500,000" 
            className="w-full bg-navy/50 border border-white/10 p-2 text-xs rounded-sm outline-none focus:border-cyan" 
          />
        </div>
        <div className="text-[10px] text-gray-400">
          Estimated Annual Return: 
          <span className="text-green-400 font-bold ml-1">
            {roi !== null ? `$${roi.toLocaleString()}` : '12.5%'}
          </span>
        </div>
        <button 
          onClick={calculateROI}
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest transition-all"
        >
          Calculate
        </button>
      </div>
    </div>
  );
};

interface BusinessSectionProps {
  onNavigate: (page: string) => void;
}

export const BusinessSection = ({ onNavigate }: BusinessSectionProps) => {
  const { data: stats, loading } = useApi<any[]>('/business-stats');

  return (
    <section id="business" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8, rotateX: -15 }}
            whileInView={{ opacity: 1, x: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan mb-4">Business & Development</h3>
            <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tight text-navy font-official">Invest in the Future of Adama</h2>
            <p className="text-neutral-500 text-sm md:text-lg mb-10 leading-relaxed font-medium">
              Adama is strategically positioned as Ethiopia's premier logistics and industrial hub. 
              With a business-friendly environment, modern infrastructure, and a skilled workforce, 
              we offer unparalleled opportunities for investors and entrepreneurs.
            </p>
            <div className="grid grid-cols-2 gap-8 mb-12">
              {loading ? (
                [1, 2].map(i => <div key={i} className="bg-neutral-50 h-32 rounded-2xl animate-pulse" />)
              ) : (
                (stats || []).slice(0, 2).map((stat, i) => (
                  <div key={i} className="bg-neutral-50 p-8 rounded-2xl border border-neutral-100">
                    <div className={`text-4xl font-black mb-2 ${i === 0 ? 'text-cyan' : 'text-navy'}`}>{stat.value}</div>
                    <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => onNavigate('#government?tab=Documents')} className="btn-primary px-10 py-5 text-base shadow-xl shadow-cyan/20">Download Investment Guide</button>
            
            {/* Investor Tools */}
            <div className="mt-16 pt-12 border-t border-neutral-100">
              <h4 className="text-sm font-bold uppercase tracking-widest text-navy mb-8">Investor Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ROICalculator />
                <div className="card p-8 bg-neutral-50 border-neutral-100">
                  <h5 className="text-xs font-bold text-cyan uppercase tracking-widest mb-6">Key Documents</h5>
                  <ul className="space-y-4">
                    {[
                      { name: 'Zoning Laws 2026', icon: <FileText size={16} />, href: '#government?tab=Documents' },
                      { name: 'Tax Incentive Guide', icon: <Zap size={16} />, href: '#government?tab=Documents' },
                      { name: 'Land Acquisition Policy', icon: <Globe size={16} />, href: '#government?tab=Documents' }
                    ].map(item => (
                      <li key={item.name} className="flex items-center justify-between group cursor-pointer" onClick={() => onNavigate(item.href)}>
                        <span className="text-sm text-neutral-500 group-hover:text-navy flex items-center gap-3 transition-colors font-bold">
                          {item.icon} {item.name}
                        </span>
                        <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-cyan transition-all" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="relative group overflow-hidden rounded-2xl">
            <div className="absolute -inset-4 bg-cyan/5 rounded-3xl -z-10 group-hover:bg-cyan/10 transition-all" />
            <HighContrastImage src="https://picsum.photos/seed/business/800/600" alt="Business in Adama" className="w-full h-[480px] object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};
