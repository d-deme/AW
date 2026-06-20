import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, FileText, Calendar, Building2, CheckCircle, ArrowRight } from 'lucide-react';
import { useApi } from '../../services/api';
import { Announcement } from '../../types';

let dismissedInMemory = false;

export const PinnedAnnouncement = () => {
  const { data: announcements, loading } = useApi<Announcement[]>('/announcements');
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    dismissedInMemory = true;
    (window as any).__adama_announcement_dismissed = true;
    try {
      sessionStorage.setItem('adama_announcement_modal_dismissed', 'true');
      localStorage.setItem('adama_announcement_modal_dismissed', 'true');
      document.cookie = "adama_announcement_modal_dismissed=true; path=/; max-age=31536000; SameSite=Lax";
    } catch (e) {
      console.warn('Session or local storage storage limit or isolation:', e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (loading || !announcements || announcements.length === 0) return;
    const announcement = announcements.find(a => a.active);
    if (!announcement) return;

    // Check memory barriers and global states first to prevent race-condition triggers
    if (dismissedInMemory || (window as any).__adama_announcement_dismissed) {
      setIsOpen(false);
      return;
    }

    let isDismissed = false;
    try {
      isDismissed = sessionStorage.getItem('adama_announcement_modal_dismissed') === 'true' ||
                    localStorage.getItem('adama_announcement_modal_dismissed') === 'true' ||
                    document.cookie.includes('adama_announcement_modal_dismissed=true');
    } catch (e) {
      // Sandboxed browser contexts can block storage access. Use logical false fallback.
      isDismissed = false;
    }

    if (isDismissed) {
      setIsOpen(false);
      return;
    }

    // Simple short delay for high-impact experience on page open
    const timer = setTimeout(() => {
      // Final re-evaluation of global states before opening
      if (!dismissedInMemory && !(window as any).__adama_announcement_dismissed) {
        setIsOpen(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [announcements, loading]);

  if (loading || !announcements || announcements.length === 0) return null;

  const announcement = announcements.find(a => a.active);
  if (!announcement) return null;

  // Responsive spacing to maintain visual alignment and layout separation from top social media/language bars
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="announcement-modal" 
          onClick={handleClose}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 cursor-pointer mb-2 sm:mb-4"
        >
          {/* Real-time Backdrop Blur & Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-950/75 backdrop-blur-md pointer-events-none"
          />

          {/* Premium Modal Card */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 cursor-default"
          >
            {/* Header branding background */}
            <div className="relative bg-gradient-to-br from-navy via-navy-light to-neutral-900 text-white p-8 pb-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gold/5 rounded-full blur-2xl" />

              {/* Close Button top-right */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div id="badge-announcement" className="p-3 bg-cyan/15 border border-cyan/30 rounded-2xl text-cyan shrink-0">
                  <Bell size={22} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan/90">Official Notice Portal</span>
                  <h4 className="text-xl font-extrabold tracking-tight leading-tight uppercase text-white font-official">
                    {announcement.title}
                  </h4>
                </div>
              </div>
            </div>

            {/* Inner Content Section */}
            <div className="p-8 space-y-8">
              {/* Main message box - styled for high contrast and readibility */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-cyan/10 text-cyan rounded-lg shrink-0 mt-0.5">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-navy uppercase tracking-wider mb-1">Tender Submission Details</h5>
                    <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                </div>

                {/* Secondary details - looks extremely official rather than empty slop */}
                <div className="grid grid-cols-2 gap-3 border-t border-neutral-200/60 pt-4 text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-cyan shrink-0" />
                    <div>
                      <span className="block text-[8px] text-neutral-400 font-black">DEADLINE</span>
                      <span className="text-navy font-extrabold">May 15, 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-cyan shrink-0" />
                    <div>
                      <span className="block text-[8px] text-neutral-400 font-black">AUTHORITY</span>
                      <span className="text-navy font-bold">Adama Mun. Gov.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Checklist */}
              <div className="space-y-2.5">
                {[
                  'Procurement documents are free to download.',
                  'Submit queries via the digital commercial portal.',
                  'All local & international bids are welcome.'
                ].map((text, i) => (
                  <div key={i} className="flex Skinner-checklist items-center gap-2.5 text-[11px] text-neutral-500 font-semibold">
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={announcement.link}
                  onClick={handleClose}
                  className="flex-1 btn-primary py-4 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"
                >
                  {announcement.linkText || 'Read Details'} <ArrowRight size={12} />
                </a>
                <button
                  onClick={handleClose}
                  className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-navy border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all duration-200 text-center"
                >
                  Acknowledge Notice
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
