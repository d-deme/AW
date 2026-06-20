import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HardDrive, Download, X, Clock, HelpCircle, HardDriveDownload } from 'lucide-react';

interface ExportConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  type?: 'JSON' | 'CSV' | 'Excel' | 'PDF' | 'Backup';
  recordCount?: number;
  estimatedSize?: string;
}

export const ExportConfirmationModal: React.FC<ExportConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Database Content Export',
  type = 'CSV',
  recordCount = 0,
  estimatedSize = 'Unknown'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-lg bg-[#061126] border border-slate-800/80 shadow-2xl rounded-3xl p-6 overflow-hidden text-left text-slate-100 select-none"
            id="export-confirmation-modal"
          >
            {/* Decors */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-5">
              <div className="flex items-center space-x-2.5">
                <span className="p-2.5 bg-brand-cyan/10 text-brand-cyan rounded-xl">
                  <HardDrive size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">{title}</h3>
                  <p className="text-[10px] text-brand-cyan uppercase font-black tracking-wider font-mono">Gateway Export Protocol</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-xl transition text-slate-400 hover:text-slate-200"
              >
                <X size={14} />
              </button>
            </div>

            {/* Warn Notice Box */}
            <div className="mb-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3">
              <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={16} strokeWidth={2.5} />
              <div className="space-y-1">
                <span className="text-xs font-black text-amber-350 block">Bulk Export Server Load Warning</span>
                <p className="text-[10px] leading-relaxed text-slate-350 select-text font-medium">
                  Generating structured datasets in real-time bypasses caching pools. This instructs Node.js to rebuild relational structures, escalating CPU workloads and high-throughput network transport.
                </p>
              </div>
            </div>

            {/* Data estimation specifications */}
            <div className="bg-[#030915] border border-slate-900 rounded-2xl p-4 space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Export Format</span>
                  <span className="text-xs font-bold font-mono text-brand-cyan tracking-wider flex items-center space-x-1 mt-0.5">
                    <span>.{type.toLowerCase()}</span>
                    <span className="text-[9px] bg-brand-cyan/10 font-bold px-1.5 py-0.2 rounded uppercase">{type} Stream</span>
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Record count estimate</span>
                  <span className="text-xs font-bold font-mono text-white block mt-0.5">
                    {recordCount !== undefined && recordCount > 0 ? `${recordCount.toLocaleString()} Rows` : 'All Available'}
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Bandwidth Impact</span>
                  <span className="text-xs font-bold font-mono text-white block mt-0.5">{estimatedSize}</span>
                </div>

                <div className="text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Server Queued Time</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <Clock size={11} />
                    <span>&lt; 420 ms</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <p className="text-[10px] text-slate-400 leading-normal font-medium">
                Please verify that this request is deliberate. Triggering redundant full catalog downloads blocks API responsiveness for concurrent visitors of the Adama City portal.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-850 pt-4 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition"
              >
                Abrupt cancel
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-5 py-2 bg-brand-cyan hover:bg-cyan-500/95 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 transition shadow-lg shadow-brand-cyan/5"
              >
                <Download size={13} strokeWidth={2.5} />
                <span>Confirm &amp; Download</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
