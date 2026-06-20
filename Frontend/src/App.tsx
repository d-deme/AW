/// <reference types="vite/client" />
import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, AlertTriangle } from 'lucide-react';
import { useApi } from './services/api';

// Layout & UI
import { Navbar } from './components/layout/Navbar';
import { PinnedAnnouncement } from './components/layout/PinnedAnnouncement';
import { GoToTop } from './components/ui/GoToTop';
import { FeedbackWidget } from './components/ui/FeedbackWidget';
import { SafeBoundary } from './components/ui/SafeBoundary';
import { Skeleton } from './components/ui/Skeleton';
import { PermitTracker } from './components/layout/PermitTracker';

// Sections - Lazy Loaded
const Hero = lazy(() => import('./sections/Hero').then(m => ({ default: m.Hero })));
const QuickAccess = lazy(() => import('./sections/QuickAccess').then(m => ({ default: m.QuickAccess })));
const NewsSection = lazy(() => import('./sections/NewsSection').then(m => ({ default: m.NewsSection })));
const UpcomingEvents = lazy(() => import('./sections/UpcomingEvents').then(m => ({ default: m.UpcomingEvents })));
const CityPulse = lazy(() => import('./sections/CityPulse').then(m => ({ default: m.CityPulse })));
const SmartMap = lazy(() => import('./sections/SmartMap').then(m => ({ default: m.SmartMap })));
const GovernmentSection = lazy(() => import('./sections/GovernmentSection').then(m => ({ default: m.GovernmentSection })));
const ServicesSection = lazy(() => import('./sections/ServicesSection').then(m => ({ default: m.ServicesSection })));
const InitiativesSection = lazy(() => import('./sections/InitiativesSection').then(m => ({ default: m.InitiativesSection })));
const MayoralHistorySection = lazy(() => import('./sections/MayoralHistorySection').then(m => ({ default: m.MayoralHistorySection })));
const DevelopmentProjects = lazy(() => import('./sections/DevelopmentProjects').then(m => ({ default: m.DevelopmentProjects })));
const BusinessSection = lazy(() => import('./sections/BusinessSection').then(m => ({ default: m.BusinessSection })));
const TourismSection = lazy(() => import('./sections/TourismSection').then(m => ({ default: m.TourismSection })));
const ContactSection = lazy(() => import('./sections/ContactSection').then(m => ({ default: m.ContactSection })));
const Footer = lazy(() => import('./sections/Footer').then(m => ({ default: m.Footer })));

const SectionLoader = () => (
  <div className="section-padding container-custom">
    <Skeleton className="h-96 w-full rounded-3xl" />
  </div>
);

export default function App() {
  const { data: siteSettings } = useApi<any>('/site-settings');
  const [isAdminBypass, setIsAdminBypass] = useState(false);
  const [bypassCode, setBypassCode] = useState('');
  const [showBypassForm, setShowBypassForm] = useState(false);
  const [bypassError, setBypassError] = useState(false);

  const [currentPage, setCurrentPage] = useState('home');
  const [targetTab, setTargetTab] = useState<string | undefined>(undefined);

  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bypassCode.toLowerCase() === 'admin' || bypassCode === '2026') {
      setIsAdminBypass(true);
      setBypassError(false);
    } else {
      setBypassError(true);
    }
  };

  const handleNavigate = (page: string) => {
    const [id, query] = page.split('?');
    
    if (id.startsWith('#')) {
      const element = document.querySelector(id);
      if (element) {
        // Handle tabs if present
        if (query) {
          const params = new URLSearchParams(query);
          const tab = params.get('tab');
          if (tab) setTargetTab(tab);
        } else if (id === '#government') {
          setTargetTab('Mayor');
        }
        
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (siteSettings?.maintenance_mode && !isAdminBypass) {
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,rgba(0,229,255,0.1),transparent_60%)] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-3xl shadow-2xl backdrop-blur-md relative z-10 text-center space-y-8">
          <div className="w-16 h-16 bg-cyan/10 border border-cyan/20 rounded-2xl flex items-center justify-center mx-auto text-cyan animate-pulse">
            <Lock size={32} />
          </div>

          <div className="space-y-3">
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-cyan">Scheduled Administrative System Lock</span>
            <h1 className="text-3xl font-black uppercase tracking-tight leading-none font-official">
              Portal Under Maintenance
            </h1>
            <p className="text-sm text-neutral-400 font-medium leading-relaxed">
              The {siteSettings?.site_name || 'Adama City'} digital gateway is undergoing temporary layout improvements to optimize citizen public dashboards.
            </p>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-4">
            <div className="text-[11px] text-neutral-400 font-semibold">
              Have burning inquiries? Reach us at:<br />
              <span className="text-cyan block mt-1 font-bold">{siteSettings?.contact_email || 'info@adamacity.gov.et'}</span>
            </div>

            {!showBypassForm ? (
              <button
                onClick={() => setShowBypassForm(true)}
                className="text-[9px] text-neutral-500 hover:text-cyan uppercase tracking-widest font-bold block mx-auto pt-4 transition-all cursor-pointer"
              >
                🔒 Staff Administration Gate
              </button>
            ) : (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleBypassSubmit} 
                className="space-y-3 text-left pt-2"
              >
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Authorization Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-550" />
                    <input
                      type="password"
                      placeholder="Enter security key..."
                      value={bypassCode}
                      onChange={e => setBypassCode(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2.5 pl-10 rounded-xl text-xs text-white outline-none focus:border-cyan transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-cyan hover:bg-white text-navy px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Bypass
                  </button>
                </div>
                {bypassError && (
                  <p className="text-[10px] text-red-450 font-bold">⚠️ Invalid Key. Access Denied.</p>
                )}
                <button
                  type="button"
                  onClick={() => setShowBypassForm(false)}
                  className="text-[9px] text-neutral-500 hover:text-white uppercase tracking-widest block mx-auto mt-2 font-black cursor-pointer"
                >
                  Cancel
                </button>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-navy-light selection:text-white">
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      <PinnedAnnouncement />
      
      <SafeBoundary>
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.main id="main-content">
                <Suspense fallback={<SectionLoader />}>
                  <Hero onNavigate={handleNavigate} />
                  <QuickAccess onNavigate={handleNavigate} />
                  <NewsSection onNavigate={handleNavigate} />
                  <UpcomingEvents />
                  <CityPulse />
                  <SmartMap onNavigate={handleNavigate} />
                  <GovernmentSection targetTab={targetTab} />
                  <ServicesSection onNavigate={handleNavigate} />
                  <InitiativesSection onNavigate={handleNavigate} />
                  <MayoralHistorySection />
                  <DevelopmentProjects onNavigate={handleNavigate} />
                  <BusinessSection onNavigate={handleNavigate} />
                  <TourismSection onNavigate={handleNavigate} />
                  <ContactSection onNavigate={handleNavigate} />
                </Suspense>
              </motion.main>
            </motion.div>
          ) : (
            <motion.div
              key="permits-portal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="pt-36 pb-24 min-h-screen bg-neutral-50/70"
            >
              <div className="container-custom">
                {/* Back Link */}
                <button
                  onClick={() => handleNavigate('home')}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-navy hover:text-cyan mb-8 cursor-pointer select-none transition-all duration-300"
                >
                  ← Return to Municipal Dashboard
                </button>
                <PermitTracker />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SafeBoundary>

      <Suspense fallback={<footer className="h-64 bg-navy" />}>
        <Footer onNavigate={handleNavigate} />
      </Suspense>
      <GoToTop />
      <FeedbackWidget />
    </div>
  );
}
