import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';

export const EmergencyAlert = () => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="bg-yellow-300 text-neutral-900 py-3 px-4 relative overflow-hidden border-b border-yellow-400 select-none shadow-md z-50 mb-2 md:mb-3">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[slide_1.5s_linear_infinite] pointer-events-none" />
      <div className="container-custom relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-neutral-900/10 rounded-lg shrink-0 text-neutral-900">
            <AlertTriangle size={15} className="animate-bounce" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-wider block text-neutral-700">Urgent Traffic Advisory</span>
            <p className="text-[11px] font-bold leading-normal text-neutral-900">
              Emergency road maintenance ongoing on Adama-Bishoftu expressway. Standard lanes reduced. Expect delays up to 45 mins.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <a 
            href="#services" 
            className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#004dc0] hover:text-neutral-900 transition-colors bg-white/40 hover:bg-white/65 px-3 py-1.5 rounded-lg border border-yellow-400"
            aria-label="Read more details about expressway delays"
          >
            Read More <ArrowRight size={12} />
          </a>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 px-2.5 bg-neutral-950 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
            aria-label="Mark emergency alert as read"
          >
            Got it <X size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};
