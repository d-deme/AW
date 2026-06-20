import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ChevronRight, FileText, MapPin, Layers, Calendar, UserCheck } from 'lucide-react';
import { useApi } from '../../services/api';

interface SearchCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
}

export const SearchCommandMenu = ({ isOpen, onClose, onNavigate }: SearchCommandMenuProps) => {
  const { data: dbServices } = useApi<any[]>('/services');
  const { data: dbProjects } = useApi<any[]>('/initiatives');
  const { data: dbNews } = useApi<any[]>('/news');
  const { data: dbLeadership } = useApi<any[]>('/leadership');
  const { data: dbTourism } = useApi<any[]>('/tourism');

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'services' | 'government' | 'culture' | 'news'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle Ctrl+K/Cmd+K to open search is done in Parent, but we handle Escape here
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle index boundaries and scrolling into view when navigating via keyboard
  const filteredCount = useRef(0);

  const getFilteredItems = () => {
    const searchStr = query.toLowerCase().trim();

    const services = (dbServices || []).map(s => ({
      id: `service-${s.id}`,
      title: s.name || s.title || '',
      description: s.description || '',
      category: 'services',
      href: '#services',
      icon: FileText,
    }));

    const government = [
      ...(dbLeadership || []).map(l => ({
        id: `leader-${l.id}`,
        title: l.name || '',
        description: l.title || l.role || '',
        category: 'government',
        href: '#government?tab=Mayor',
        icon: UserCheck,
      })),
      {
        id: 'govt-council',
        title: 'City Council',
        description: 'Legislative and policy-making branch of Adama administration',
        category: 'government',
        href: '#government?tab=Structure',
        icon: Layers,
      }
    ];

    const culture = [
      ...(dbTourism || []).map(a => ({
        id: `attract-${a.id}`,
        title: a.attractionName || a.name || '',
        description: a.location ? `Located in ${a.location}` : '',
        category: 'culture',
        href: '#tourism',
        icon: MapPin,
      })),
      ...(dbProjects || []).map(p => ({
        id: `proj-${p.id}`,
        title: p.title || p.name || '',
        description: `${p.status || ''} • ${p.description || ''}`,
        category: 'culture',
        href: '#development',
        icon: Layers,
      }))
    ];

    const news = (dbNews || []).map(n => {
      const dateVal = n.createdAt || n.date || '';
      const displayDate = typeof dateVal === 'string' && dateVal.includes('T') 
        ? new Date(dateVal).toLocaleDateString() 
        : dateVal;
      return {
        id: `news-${n.id}`,
        title: n.title || '',
        description: `${displayDate} • ${n.summary || ''}`,
        category: 'news',
        href: '#news',
        icon: Calendar,
      };
    });

    let allItems = [...services, ...government, ...culture, ...news];

    // Substring matches
    if (searchStr) {
      allItems = allItems.filter(
        item =>
          item.title.toLowerCase().includes(searchStr) ||
          item.description.toLowerCase().includes(searchStr)
      );
    }

    // Tab filter
    if (activeTab !== 'all') {
      allItems = allItems.filter(item => item.category === activeTab);
    }

    filteredCount.current = allItems.length;
    return allItems;
  };

  const results = getFilteredItems();

  // Reset selected index when tab or query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onNavigate(results[selectedIndex].href);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  // Adjust scroll position to keep selected item in view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        const container = scrollContainerRef.current;
        const elemTop = selectedElement.offsetTop;
        const elemBottom = elemTop + selectedElement.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (elemTop < containerTop) {
          container.scrollTop = elemTop;
        } else if (elemBottom > containerBottom) {
          container.scrollTop = elemBottom - container.offsetHeight;
        }
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/80 backdrop-blur-md z-[200]"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl z-[201] border border-neutral-200"
          >
            {/* Header / Input */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-neutral-100">
              <Search className="text-neutral-400 shrink-0" size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search services, officials, archives..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full text-base font-medium text-navy bg-transparent outline-none placeholder:text-neutral-400"
              />
              <span className="hidden sm:inline-block px-1.5 py-1 text-[8px] font-black text-neutral-400 bg-neutral-100 rounded-md uppercase tracking-wider">
                ESC
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-neutral-400 hover:text-navy transition-colors"
                aria-label="Close search overlay"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 px-6 py-3 border-b border-neutral-50 bg-neutral-50/50 overflow-x-auto select-none no-scrollbar">
              {(
                [
                  { id: 'all', label: 'All Results' },
                  { id: 'services', label: 'Services' },
                  { id: 'government', label: 'Government' },
                  { id: 'culture', label: 'Tourism & Culture' },
                  { id: 'news', label: 'News Archive' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-neutral-400 hover:text-navy'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content list */}
            <div
              ref={scrollContainerRef}
              className="max-h-[380px] overflow-y-auto p-4 space-y-1 custom-scrollbar"
            >
              {results.length > 0 ? (
                results.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.href);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? 'bg-neutral-50 ring-1 ring-neutral-200 shadow-sm'
                          : 'hover:bg-neutral-50/40'
                      }`}
                    >
                      {/* Left indicator bar */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan" />
                      )}

                      <div
                        className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-cyan/10 text-cyan'
                            : 'bg-neutral-100 text-neutral-400'
                        }`}
                      >
                        <ItemIcon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4 mb-0.5">
                          <span className="text-xs font-bold text-navy truncate">
                            {item.title}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 font-medium leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={14}
                        className={`self-center shrink-0 transition-all ${
                          isSelected
                            ? 'text-cyan translate-x-1'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <div className="text-neutral-400 font-medium text-xs mb-1">
                    No results found for "{query}"
                  </div>
                  <div className="text-[10px] text-neutral-300 uppercase tracking-widest font-bold">
                    Try broadening your query
                  </div>
                </div>
              )}
            </div>

            {/* Footer with hint keys */}
            <div className="hidden sm:flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded-md">
                    ↓
                  </span>
                  <span className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded-md">
                    ↑
                  </span>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded-md">
                    ↵
                  </span>{' '}
                  Open Link
                </span>
              </div>
              <div>Adama City Public Registry © 2026</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
