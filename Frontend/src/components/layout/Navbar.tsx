import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  User, 
  Phone, 
  Mail,
  Users,
  LayoutGrid,
  History,
  ShieldCheck,
  Home,
  Briefcase,
  MapPin,
  AlertTriangle,
  CreditCard,
  Truck,
  Zap,
  Wind,
  Activity,
  Bell,
  FileText,
  Music
} from 'lucide-react';
import { EmergencyAlert } from './EmergencyAlert';
import { SocialMediaLinks } from '../ui/SocialMediaLinks';
import { SearchCommandMenu } from './SearchCommandMenu';
import { NavItem } from '../../types';
import { useApi } from '../../services/api';
import { getActiveLang, setActiveLang } from '../../services/headlessCms';
import { WeatherWidget } from '../ui/WeatherWidget';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar = ({ onNavigate, currentPage }: NavbarProps) => {
  const { data: siteSettings } = useApi<any>('/site-settings');
  const navLinks = [
    { label: 'Home', href: '#home' },
    {
      label: 'Governance',
      items: [
        { label: "Mayor's Office", href: '#government?tab=Mayor', description: 'Executive leadership and strategic vision.', icon: 'User' },
        { label: 'City Council', href: '#government?tab=Structure', description: 'Legislative body and policy-making.', icon: 'Users' },
        { label: 'Administrative Structure', href: '#government?tab=Structure', description: 'Detailed hierarchy and departments.', icon: 'LayoutGrid' },
        { label: 'Mayoral History', href: '#history', description: 'Legacy and past leadership of Adama.', icon: 'History' },
        { label: 'Transparency Portal', href: '#government?tab=Documents', description: 'Public records and accountability.', icon: 'ShieldCheck' },
      ]
    },
    {
      label: 'Services',
      items: [
        { label: 'Resident Services', href: '#services', description: 'Taxes, utilities, and community permits.', icon: 'Home' },
        { label: 'Business Portal', href: '#business', description: 'Licenses, investment, and trade support.', icon: 'Briefcase' },
        { label: 'Visitor Guide', href: '#tourism', description: 'Tourism, culture, and local attractions.', icon: 'MapPin' },
        { label: 'Report an Issue', href: '#contact', description: 'Maintenance, safety, and service concerns.', icon: 'AlertTriangle' },
        { label: 'Permits Tracking', href: '#services?tab=Permits', description: 'Track business, zoning and construction licenses live.', icon: 'CreditCard' },
      ]
    },
    {
      label: 'Projects',
      items: [
        { label: 'Infrastructure', href: '#development?tab=Infrastructure', description: 'Roads, expressways, and transport.', icon: 'Truck' },
        { label: 'Smart Grid & Power', href: '#development?tab=Energy', description: 'Electricity and energy stability.', icon: 'Zap' },
        { label: 'Refuse & Ecology', href: '#development?tab=Green', description: 'Green corridors and sustainable living.', icon: 'Wind' },
      ]
    },
    {
      label: 'News',
      items: [
        { label: 'Press Releases', href: '#news', description: 'Official municipal press updates.', icon: 'FileText' },
        { label: 'Public Notices', href: '#news', description: 'Citizen guidelines and urgent decrees.', icon: 'Bell' },
        { label: 'Adama Chronicle', href: '#news', description: 'Latest stories from around the city.', icon: 'Activity' },
      ]
    },
    { label: 'About', href: '#government?tab=About' },
    { label: 'Contact', href: '#contact' }
  ];

  const [currentLang, setCurrentLang] = useState(getActiveLang().toUpperCase());
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const triggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const itemRefs = useRef<{ [key: string]: (HTMLButtonElement | null)[] }>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStateSync = () => {
        setCurrentLang(getActiveLang().toUpperCase());
      };
      window.addEventListener('adama_cms_state_change', handleStateSync);
      return () => window.removeEventListener('adama_cms_state_change', handleStateSync);
    }
  }, []);

  const handleLangChange = (lang: string) => {
    setActiveLang(lang.toLowerCase());
    setCurrentLang(lang.toUpperCase());
  };

  useEffect(() => {
    const handleGlobalSearchShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalSearchShortcut);
    return () => window.removeEventListener('keydown', handleGlobalSearchShortcut);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Intersection Observer for active section
    const sections = ['home', 'government', 'services', 'initiatives', 'history', 'development', 'business', 'tourism', 'news', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleLinkClick = (href: string) => {
    onNavigate(href);
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const isActive = (href: string) => {
    if (href.startsWith('#')) {
      return activeSection === href.substring(1);
    }
    return currentPage === href;
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent, label: string, hasItems: boolean) => {
    if (!hasItems) return;

    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveDropdown(label);
      setTimeout(() => {
        const items = itemRefs.current[label];
        if (items && items[0]) items[0].focus();
      }, 50);
    } else if (e.key === 'Escape') {
      setActiveDropdown(null);
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, label: string, index: number, total: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % total;
      itemRefs.current[label]?.[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + total) % total;
      itemRefs.current[label]?.[prevIndex]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setActiveDropdown(null);
      triggerRefs.current[label]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      itemRefs.current[label]?.[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      itemRefs.current[label]?.[total - 1]?.focus();
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'bg-navy py-2 shadow-2xl' : 'bg-transparent py-4'}`}>
      {!isScrolled && <EmergencyAlert />}
      {/* Top Bar - Hidden on scroll */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div 
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-white/10 mt-12 mb-4 pb-6 overflow-hidden hidden lg:block"
          >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase text-gray-300">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-white/60" />
                  <span>Emergency: 991</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-white/60" />
                  <span>info@adama.gov.et</span>
                </div>
              </div>
              <div className="flex items-center gap-12">
                <SocialMediaLinks className="text-white/60" />
                <div className="flex items-center gap-8 pl-8 border-l border-white/10">
                  <div className="flex items-center gap-6">
                    {['EN', 'OR', 'AM'].map((lang) => (
                      <button 
                        key={lang} 
                        onClick={() => handleLangChange(lang)}
                        className={`hover:text-white transition-colors cursor-pointer ${lang === currentLang ? 'text-white font-black scale-105' : 'text-white/40 font-medium'}`}
                        aria-label={`Change language to ${lang === 'EN' ? 'English' : lang === 'OR' ? 'Oromo' : 'Amharic'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <button onClick={() => handleLinkClick('home')} className="flex items-center gap-3 group" aria-label="Adama City Home">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-white/20 transition-all duration-500 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center transition-colors">
                <div className="w-4 h-4 rotate-45 bg-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white">ADAMA CITY</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/60">Official Website</span>
            </div>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-[10px] font-bold tracking-widest uppercase text-white">
          {navLinks.map((link) => {
            const hasItems = 'items' in link;
            const dropdownId = `dropdown-${link.label.toLowerCase().replace(/\s+/g, '-')}`;
            
            return (
              <div 
                key={link.label} 
                className="relative group"
                onMouseEnter={() => hasItems && setActiveDropdown(link.label)}
                onMouseLeave={() => hasItems && setActiveDropdown(null)}
              >
                <button 
                  ref={(el) => { triggerRefs.current[link.label] = el; }}
                  className={`flex items-center gap-1 hover:text-white/70 transition-colors py-4 relative group/link ${isActive(!hasItems ? (link as any).href : '') ? 'text-white' : 'text-white/80'}`}
                  onClick={() => {
                    if (!hasItems) handleLinkClick((link as any).href);
                    else setActiveDropdown(activeDropdown === link.label ? null : link.label);
                  }}
                  onKeyDown={(e) => handleTriggerKeyDown(e, link.label, hasItems)}
                  aria-haspopup={hasItems ? "true" : undefined}
                  aria-expanded={hasItems ? activeDropdown === link.label : undefined}
                  aria-controls={hasItems ? dropdownId : undefined}
                >
                  <span>{link.label}</span>
                  {hasItems && <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />}
                  <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left ${isActive(!hasItems ? (link as any).href : '') ? 'scale-x-100' : ''}`} />
                </button>
                
                {hasItems && (
                  <AnimatePresence>
                    {activeDropdown === link.label && (
                      <motion.div
                        id={dropdownId}
                        role="menu"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 w-72 glass-dark p-2 mt-2 flex flex-col gap-1 shadow-2xl rounded-xl max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                      >
                        {link.items.map((subItem, idx) => {
                          const IconComponent = {
                            User, Users, LayoutGrid, History, ShieldCheck,
                            Home, Briefcase, MapPin, AlertTriangle, CreditCard,
                            Truck, Zap, Wind, Activity, Bell, FileText, Music
                          }[subItem.icon || ''] as any;

                          return (
                            <button 
                              key={subItem.label} 
                              ref={(el) => {
                                if (!itemRefs.current[link.label]) itemRefs.current[link.label] = [];
                                itemRefs.current[link.label][idx] = el;
                              }}
                              role="menuitem"
                              onClick={() => handleLinkClick(subItem.href)}
                              onKeyDown={(e) => handleItemKeyDown(e, link.label, idx, link.items.length)}
                              className="flex items-start gap-4 text-left group/item p-4 hover:bg-white/5 rounded-lg transition-all focus:bg-white/10 focus:outline-none"
                            >
                              {IconComponent && (
                                <div className="mt-0.5 p-2 bg-white/5 rounded-lg text-gray-400 group-hover/item:text-cyan group-hover/item:bg-cyan/10 transition-all">
                                  <IconComponent size={16} />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-[11px] font-bold text-white group-hover/item:text-cyan transition-colors">{subItem.label}</div>
                                <div className="text-[9px] text-gray-500 font-medium leading-tight mt-1">{subItem.description}</div>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <WeatherWidget />
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-full transition-all text-white hover:bg-white/10 cursor-pointer" 
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button 
            className="lg:hidden p-2 rounded-lg transition-colors text-white hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <SearchCommandMenu 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onNavigate={handleLinkClick} 
      />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-dark border-t border-white/10 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            <div className="p-6 space-y-6">
              {navLinks.map((link) => (
                <div key={link.label} className="space-y-4">
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{link.label}</div>
                  <div className="grid grid-cols-1 gap-2">
                    {'items' in link ? link.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleLinkClick(item.href)}
                        className="text-left py-2 text-sm text-white hover:text-white/70 transition-colors flex items-center gap-3"
                      >
                        <ChevronRight size={14} className="text-white/20" />
                        {item.label}
                      </button>
                    )) : (
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-left py-2 text-sm text-white hover:text-white/70 transition-colors flex items-center gap-3"
                      >
                        <ChevronRight size={14} className="text-white/20" />
                        {link.label}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex gap-4">
                  {['EN', 'OR', 'AM'].map((lang) => (
                    <button 
                      key={lang} 
                      onClick={() => handleLangChange(lang)}
                      className={`text-xs font-bold cursor-pointer ${lang === currentLang ? 'text-cyan font-black' : 'text-gray-500 font-medium'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <SocialMediaLinks className="text-gray-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
