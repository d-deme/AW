import React from 'react';
import { CreditCard, AlertTriangle, Briefcase, Users, FileCheck, MapPin } from 'lucide-react';

interface QuickAccessProps {
  onNavigate: (page: string) => void;
}

export const QuickAccess = ({ onNavigate }: QuickAccessProps) => {
  const links = [
    { label: 'Pay Bills', icon: <CreditCard size={20} />, href: '#services' },
    { label: 'Report Issue', icon: <AlertTriangle size={20} />, href: '#contact' },
    { label: 'Business License', icon: <Briefcase size={20} />, href: '#business' },
    { label: 'Job Portal', icon: <Users size={20} />, href: '#business' },
    { label: 'E-Permits', icon: <FileCheck size={20} />, href: '#services' },
    { label: 'City Map', icon: <MapPin size={20} />, href: '#map' },
  ];

  return (
    <div className="bg-white border-y border-neutral-100 py-8 relative z-20">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8 justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b lg:border-b-0 lg:border-r border-neutral-100 pb-2 lg:pb-0 lg:pr-8 w-full lg:w-auto">
            Quick Access
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6 w-full flex-grow">
            {links.map((link, i) => (
              <button 
                key={i}
                onClick={() => onNavigate(link.href)}
                className="flex items-center gap-3 text-navy hover:text-cyan transition-all group p-3.5 bg-neutral-50/80 hover:bg-cyan/5 rounded-xl border border-neutral-100 text-left cursor-pointer"
                aria-label={link.label}
              >
                <div className="p-2 bg-white rounded-lg group-hover:bg-cyan/20 transition-all border border-neutral-100 shrink-0 text-navy">
                  {link.icon}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider truncate">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
