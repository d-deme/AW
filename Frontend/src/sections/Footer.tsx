import React from 'react';
import { SocialMediaLinks } from '../components/ui/SocialMediaLinks';
import { useApi } from '../services/api';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  const { data: siteSettings } = useApi<any>('/site-settings');

  const siteName = siteSettings?.site_name || 'ADAMA CITY';
  const siteDescription = siteSettings?.site_description || 'The official digital gateway for Adama City. Committed to transparency, efficiency, and sustainable growth for all our residents and partners.';
  const footerText = siteSettings?.footer_text || '© 2026 Adama City Administration.';

  return (
    <footer className="py-24 bg-navy relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.05),transparent_50%)]" />
      <div className="container-custom relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-16 mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-navy rounded-lg" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-official">{siteName}</span>
            </div>
            <p className="text-neutral-400 text-base max-w-sm mb-10 leading-relaxed font-medium">
              {siteDescription}
            </p>
            <div className="space-y-8">
              <div>
                <h5 className="text-xs uppercase font-bold text-white tracking-widest mb-4">Newsletter Subscription</h5>
                <div className="flex gap-2 max-w-sm">
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    aria-label="Newsletter email address"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-white/30 transition-all" 
                  />
                  <button 
                    className="bg-white text-navy px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all"
                    aria-label="Subscribe to newsletter"
                  >
                    Join
                  </button>
                </div>
              </div>
              <div>
                <h5 className="text-xs uppercase font-bold text-white tracking-widest mb-4">Stay Connected</h5>
                <SocialMediaLinks className="text-neutral-500" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4">Government</h4>
            <ul className="space-y-5 text-sm text-neutral-400 font-medium">
              <li><button onClick={() => onNavigate('#government?tab=Mayor')} className="hover:text-cyan transition-colors">Mayor's Office</button></li>
              <li><button onClick={() => onNavigate('#government?tab=Structure')} className="hover:text-cyan transition-colors">City Council</button></li>
              <li><button onClick={() => onNavigate('#history')} className="hover:text-cyan transition-colors">Mayoral History</button></li>
              <li><button onClick={() => onNavigate('#government?tab=Documents')} className="hover:text-cyan transition-colors">Transparency</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4">Services</h4>
            <ul className="space-y-5 text-sm text-neutral-400 font-medium">
              <li><button onClick={() => onNavigate('#services')} className="hover:text-cyan transition-colors">Resident Portal</button></li>
              <li><button onClick={() => onNavigate('#business')} className="hover:text-cyan transition-colors">Business Licenses</button></li>
              <li><button onClick={() => onNavigate('#contact')} className="hover:text-cyan transition-colors">Report an Issue</button></li>
              <li><button onClick={() => onNavigate('#services')} className="hover:text-cyan transition-colors">Digital ID</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4">Business</h4>
            <ul className="space-y-5 text-sm text-neutral-400 font-medium">
              <li><button onClick={() => onNavigate('#business')} className="hover:text-cyan transition-colors">Investment Guide</button></li>
              <li><button onClick={() => onNavigate('#development')} className="hover:text-cyan transition-colors">City Projects</button></li>
              <li><button onClick={() => onNavigate('#business')} className="hover:text-cyan transition-colors">Industrial Parks</button></li>
              <li><button onClick={() => onNavigate('#business')} className="hover:text-cyan transition-colors">Tax Incentives</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4">Tourism</h4>
            <ul className="space-y-5 text-sm text-neutral-400 font-medium">
              <li><button onClick={() => onNavigate('#tourism')} className="hover:text-cyan transition-colors">Visitor Guide</button></li>
              <li><button onClick={() => onNavigate('#tourism')} className="hover:text-cyan transition-colors">Local Culture</button></li>
              <li><button onClick={() => onNavigate('#tourism')} className="hover:text-cyan transition-colors">Attractions</button></li>
              <li><button onClick={() => onNavigate('#tourism')} className="hover:text-cyan transition-colors">Hotels & Dining</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-neutral-500 uppercase tracking-widest font-bold">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div>{footerText}</div>
            <div className="flex gap-8">
              <button onClick={() => onNavigate('#contact')} className="hover:text-cyan transition-colors">Privacy Policy</button>
              <button onClick={() => onNavigate('#contact')} className="hover:text-cyan transition-colors">Terms of Use</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-400">Official Government Portal</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
