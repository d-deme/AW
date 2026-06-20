import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  X, 
  Share2, 
  Printer, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Settings, 
  Lock, 
  Unlock, 
  Send, 
  Check, 
  CheckCircle, 
  AlertCircle, 
  Bell, 
  ExternalLink, 
  FileText, 
  LayoutDashboard, 
  Megaphone,
  Hash
} from 'lucide-react';
import { useApi, api } from '../services/api';
import { ZodError } from 'zod';
import { Skeleton } from '../components/ui/Skeleton';
import { NewsPost, Announcement } from '../types';
import { SafeHtml, stripHtml } from '../components/ui/SafeHtml';

// ==========================================
// 1. IMPROVED DETAILS VIEW: NEWS & BLOG MODAL
// ==========================================
interface NewsModalProps {
  post: NewsPost;
  onClose: () => void;
}

const NewsModal = ({ post, onClose }: NewsModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/news/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl border border-neutral-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Absolute Control Bar */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
          <button 
            onClick={handleCopyLink}
            title="Copy reference link"
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-navy shadow-md hover:bg-neutral-50 transition-all text-neutral-600 relative"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            <AnimatePresence>
              {copied && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute bottom-full mb-2 bg-navy text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2 rounded whitespace-nowrap"
                >
                  Link Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <button 
            onClick={handlePrint}
            title="Print publication"
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-navy shadow-md hover:bg-neutral-50 transition-all text-neutral-600"
          >
            <Printer size={16} />
          </button>

          <button 
            onClick={onClose}
            title="Close publication"
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-navy shadow-md hover:bg-navy hover:text-white transition-all text-navy"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Banner Image / Cover */}
        <div className="aspect-[21/9] w-full relative">
          <img src={post.imageUrl || undefined} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy to-navy/10" />
          <div className="absolute bottom-6 left-8 right-8">
            <span className="px-3.5 py-1 bg-cyan text-navy text-[9px] font-black uppercase tracking-widest rounded-md mb-3 inline-block shadow-sm">
              {post.category}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">{post.title}</h2>
          </div>
        </div>
        
        {/* Inner Content Grid */}
        <div className="p-8 md:p-12 lg:p-16">
          <div className="flex flex-wrap items-center gap-6 text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-8 border-b border-neutral-100 pb-6">
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-cyan" /> Published: {post.date}</span>
            <span className="flex items-center gap-1.5"><User size={14} className="text-cyan" /> Correspondent: {post.author}</span>
            <span className="flex items-center gap-1.5"><FileText size={14} className="text-cyan" /> ID: {post.id}</span>
          </div>
          
          {/* Main Layout Body */}
          <div className="grid lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3 space-y-6">
              {/* Summary Lead Block */}
              <p className="text-lg text-navy font-bold leading-relaxed border-l-4 border-cyan pl-4 italic">
                {stripHtml(post.summary)}
              </p>
              
              {/* Full Content Body */}
              <SafeHtml 
                text={post.content} 
                className="whitespace-pre-line text-neutral-700 leading-relaxed text-sm md:text-base font-medium space-y-4" 
              />

              {/* Tags Section */}
              {post.tags && post.tags.length > 0 && (
                <div className="pt-8 flex flex-wrap gap-2">
                  {post.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-navy bg-neutral-100/80 px-3 py-1 rounded-full uppercase tracking-wider border border-neutral-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar metadata block */}
            <div className="space-y-6 bg-neutral-50 border border-neutral-150 p-6 rounded-2xl h-fit">
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-black block border-b border-neutral-200/60 pb-3">Municipal Press Details</span>
              <div className="space-y-4">
                <div>
                  <span className="text-[8px] text-slate-400 font-bold uppercase block">Source</span>
                  <span className="text-xs font-bold text-navy">Adama Communications Div.</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 font-bold uppercase block">Verification Security</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={12} /> Signed Official</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 font-bold uppercase block">Category</span>
                  <span className="text-xs font-extrabold text-cyan uppercase tracking-wider">{post.category}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-200 text-[10px] leading-relaxed text-neutral-500 font-medium">
                For media inquiries, reach our Public Relations Office at <span className="font-bold text-navy">info@adama.gov.et</span> referencing this bulletin.
              </div>
            </div>
          </div>
          
          {/* Modal Footer Controls */}
          <div className="mt-12 pt-8 border-t border-neutral-100 flex flex-wrap gap-4 justify-between items-center">
            <span className="text-[9px] text-neutral-400 font-semibold uppercase font-mono">Reference: AD-NEWS-{post.id}</span>
            <button 
              onClick={onClose} 
              className="px-8 py-3 bg-navy hover:bg-cyan hover:text-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


// ==========================================
// 2. IMPROVED DETAILS VIEW: ANNOUNCEMENT MODAL
// ==========================================
interface AnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
}

const AnnouncementModal = ({ announcement, onClose }: AnnouncementModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-navy/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        className="bg-white rounded-3xl overflow-hidden max-w-xl w-full relative shadow-2xl border border-neutral-150 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button Header */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 bg-neutral-100 hover:bg-navy hover:text-white rounded-full flex items-center justify-center text-navy transition-all z-10 shadow-sm cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header Image if available */}
        {announcement.imageUrl && (
          <div className="relative w-full h-[220px] overflow-hidden bg-neutral-100 border-b border-neutral-200">
            <img 
              src={announcement.imageUrl || undefined} 
              alt={announcement.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Decree header banner */}
        <div className="relative bg-gradient-to-br from-navy via-navy-light to-neutral-800 text-white p-8 border-b border-cyan/15 text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-3.5 mb-2">
            <div className="p-2.5 bg-cyan/15 border border-cyan/30 rounded-xl text-cyan shrink-0">
              <Bell size={20} className="animate-pulse" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan/90 border border-cyan/20 px-2 py-0.5 rounded">MUNICIPAL BULLETIN</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight leading-snug uppercase text-white mt-4 max-w-[85%]">{announcement.title}</h3>
        </div>

        {/* Announcement Body */}
        <div className="p-8 space-y-6 text-left">
          <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-6 space-y-4">
            <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest block font-mono border-b border-neutral-200/60 pb-2">Notice Declaration</span>
            <div className="text-xs md:text-sm text-neutral-700 leading-relaxed font-semibold">
              <SafeHtml text={announcement.message} />
            </div>
            
            {/* Stamp of Authenticity Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-neutral-200/60 pt-4 text-[9px] uppercase font-extrabold text-neutral-400 tracking-widest font-mono">
              <div>
                <span className="block text-[8px] text-neutral-400 font-bold mb-1">PUBLICATION STATE</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle size={10} /> Active Decree</span>
              </div>
              <div>
                <span className="block text-[8px] text-neutral-400 font-bold mb-1">MUNICIPAL HUB</span>
                <span className="text-navy font-bold text-[10px]">ADAMA CIVIL OFFICE</span>
              </div>
            </div>
          </div>

          <div className="border border-neutral-150 rounded-2xl p-4 text-[10px] text-neutral-500 leading-relaxed font-semibold space-y-2">
            <p className="text-navy font-extrabold uppercase tracking-wider">Administrative Guidelines:</p>
            <p>1. This decree is issued for immediate civic compliance and public registration.</p>
            <p>2. Physical inquiries should quote Reference: <span className="font-bold text-navy">AD-NOTICE-{announcement.id}</span>.</p>
          </div>

          {/* Action button bar */}
          <div className="flex gap-4 pt-2">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-navy text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-neutral-200 text-center cursor-pointer"
            >
              Acknowledge Notice
            </button>
            {announcement.link && (
              <a 
                href={announcement.link}
                onClick={onClose}
                className="flex-1 py-3.5 bg-navy hover:bg-cyan hover:text-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-md uppercase"
              >
                <span>{announcement.linkText || 'Read Details'}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


// ==========================================
// 3. MAIN SERVICE INTERFACE CONTAINER
// ==========================================
interface NewsSectionProps {
  onNavigate: (page: string) => void;
}

export const NewsSection = ({ onNavigate }: NewsSectionProps) => {
  const queryClient = useQueryClient();

  // API hooks
  const { data: news, loading: newsLoading, error: newsError } = useApi<NewsPost[]>('/news');
  const { data: announcements, loading: annLoading } = useApi<Announcement[]>('/announcements');

  // Interface view tabs
  const [activePortalView, setActivePortalView] = useState<'chronicle' | 'notices' | 'cms'>('chronicle');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeAnnCategory, setActiveAnnCategory] = useState('All');
  const [annPage, setAnnPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);

  // Modal inspection states
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  // Administrative / CMS credentials toggle
  const [isCmsLocked, setIsCmsLocked] = useState(false);
  const [cmsPasscode, setCmsPasscode] = useState('');
  const [cmsUnlockError, setCmsUnlockError] = useState('');
  const [isSuperEditorMode, setIsSuperEditorMode] = useState(true); // Open CRUD for simple execution, can toggle lock

  // Toast dynamic notification states
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // CMS Form parameters including settings and audit logs
  const [cmsTargetModel, setCmsTargetModel] = useState<'news' | 'announcement' | 'site_settings' | 'audit_logs'>('news');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // NewsPost Form variables
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<'Press Release' | 'Announcement' | 'Event' | 'Blog'>('Blog');
  const [formAuthor, setFormAuthor] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSummary, setFormSummary] = useState('');

  // Announcement Form variables
  const [formAnnTitle, setFormAnnTitle] = useState('');
  const [formAnnMessage, setFormAnnMessage] = useState('');
  const [formAnnLink, setFormAnnLink] = useState('#news');
  const [formAnnLinkText, setFormAnnLinkText] = useState('Read Details');
  const [formAnnActive, setFormAnnActive] = useState(true);
  const [formAnnCategory, setFormAnnCategory] = useState<'Infrastructure' | 'Social' | 'Economy' | 'General'>('General');
  const [formAnnImageUrl, setFormAnnImageUrl] = useState('');

  // CMS Site Settings variables matching the SQL database table schema
  const [formSiteName, setFormSiteName] = useState('');
  const [formSiteDescription, setFormSiteDescription] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [formFaviconUrl, setFormFaviconUrl] = useState('');
  const [formFooterText, setFormFooterText] = useState('');
  const [formAboutUs, setFormAboutUs] = useState('');
  const [formMayorsMessage, setFormMayorsMessage] = useState('');
  const [formMayorsMessageAuthor, setFormMayorsMessageAuthor] = useState('');
  const [formMayorsMessagePhoto, setFormMayorsMessagePhoto] = useState('');
  const [formEstablished, setFormEstablished] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formAltitude, setFormAltitude] = useState('');
  const [formAdministrativeStructure, setFormAdministrativeStructure] = useState('');
  const [formClimate, setFormClimate] = useState('');
  const [formPopulation, setFormPopulation] = useState('');
  const [formMaintenanceMode, setFormMaintenanceMode] = useState(false);

  // Fetch Site Settings and Audit Logs directly using the standard useApi queries
  const { data: siteSettings, loading: siteSettingsLoading } = useApi<any>('/site-settings');
  const { data: auditLogs, loading: auditLoading } = useApi<any[]>('/audit-logs');

  // Load backend site settings metadata into editor forms dynamically
  useEffect(() => {
    if (siteSettings) {
      setFormSiteName(siteSettings.site_name || '');
      setFormSiteDescription(siteSettings.site_description || '');
      setFormContactEmail(siteSettings.contact_email || '');
      setFormContactPhone(siteSettings.contact_phone || '');
      setFormAddress(siteSettings.address || '');
      setFormLogoUrl(siteSettings.logo_url || '');
      setFormFaviconUrl(siteSettings.favicon_url || '');
      setFormFooterText(siteSettings.footer_text || '');
      setFormAboutUs(siteSettings.about_us || '');
      setFormMayorsMessage(siteSettings.mayors_message || '');
      setFormMayorsMessageAuthor(siteSettings.mayors_message_author || '');
      setFormMayorsMessagePhoto(siteSettings.mayors_message_photo || '');
      setFormEstablished(siteSettings.established || '1924 GC');
      setFormArea(siteSettings.area || '58,109 ha');
      setFormAltitude(siteSettings.altitude || '1,712 m asl');
      setFormAdministrativeStructure(siteSettings.administrative_structure || '32 Sectors, 6 Sub-Cities, 19 Woredas');
      setFormClimate(siteSettings.climate || '22°C');
      setFormPopulation(siteSettings.population || '1M+');
      setFormMaintenanceMode(siteSettings.maintenance_mode || false);
    }
  }, [siteSettings]);

  const handleSubmitSiteSettingsForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiteName.trim()) {
      triggerToast('Site name is a mandatory field.', 'error');
      return;
    }

    const payload = {
      site_name: formSiteName,
      site_description: formSiteDescription,
      contact_email: formContactEmail,
      contact_phone: formContactPhone,
      address: formAddress,
      logo_url: formLogoUrl,
      favicon_url: formFaviconUrl,
      footer_text: formFooterText,
      about_us: formAboutUs,
      mayors_message: formMayorsMessage,
      mayors_message_author: formMayorsMessageAuthor,
      mayors_message_photo: formMayorsMessagePhoto,
      established: formEstablished,
      area: formArea,
      altitude: formAltitude,
      administrative_structure: formAdministrativeStructure,
      climate: formClimate,
      population: formPopulation,
      maintenance_mode: formMaintenanceMode
    };

    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('CORS or database connection error to settings api.');

      triggerToast('Enterprise Site Layout Metadata updated & synced!', 'success');
      queryClient.invalidateQueries({ queryKey: ['/site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/about'] });
      queryClient.invalidateQueries({ queryKey: ['/mayor-message'] });
      queryClient.invalidateQueries({ queryKey: ['/audit-logs'] });
    } catch (err: any) {
      triggerToast(err.message || 'Settings update error.', 'error');
    }
  };

  // Triggering feedback signals
  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleEditorPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cmsPasscode === '2026' || cmsPasscode.toLowerCase() === 'admin') {
      setIsCmsLocked(false);
      setCmsUnlockError('');
      triggerToast('Administrator system authorization verified.', 'success');
    } else {
      setCmsUnlockError('Incorrect security key. Access refuted.');
    }
  };

  // Pre-fill fields for editing
  const handleInitiateEditPost = (post: NewsPost) => {
    setCmsTargetModel('news');
    setEditingPostId(post.id);
    setFormTitle(post.title || '');
    setFormContent(post.content || '');
    setFormCategory(post.category || 'Blog');
    setFormAuthor(post.author || '');
    setFormImageUrl(post.imageUrl || '');
    setFormSummary(post.summary || '');
    setFormTags(post.tags ? post.tags.join(', ') : '');
    // Scroll smoothly to CMS view
    setActivePortalView('cms');
    triggerToast(`Loaded post data for: "${post.title.substring(0, 20)}..."`, 'success');
  };

  const handleInitiateEditAnn = (ann: Announcement) => {
    setCmsTargetModel('announcement');
    setEditingAnnId(ann.id);
    setFormAnnTitle(ann.title || '');
    setFormAnnMessage(ann.message || '');
    setFormAnnLink(ann.link || '#news');
    setFormAnnLinkText(ann.linkText || 'Read Details');
    setFormAnnActive(ann.active !== undefined ? ann.active : true);
    setFormAnnCategory((ann.category as any) || 'General');
    setFormAnnImageUrl(ann.imageUrl || '');
    // Scroll smoothly to CMS view
    setActivePortalView('cms');
    triggerToast(`Loaded announcement: "${ann.title.substring(0, 20)}..."`, 'success');
  };

  const handleResetForms = () => {
    setEditingPostId(null);
    setEditingAnnId(null);
    // News Post reset
    setFormTitle('');
    setFormContent('');
    setFormCategory('Blog');
    setFormAuthor('');
    setFormImageUrl('');
    setFormSummary('');
    setFormTags('');
    // Announcement reset
    setFormAnnTitle('');
    setFormAnnMessage('');
    setFormAnnLink('#news');
    setFormAnnLinkText('Read Details');
    setFormAnnActive(true);
    setFormAnnCategory('General');
    setFormAnnImageUrl('');
  };

  // Perform dynamic CRUD operations
  const handleSubmitNewsPostForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      author: formAuthor || 'Adama Press Correspondent',
      imageUrl: formImageUrl || `https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800`,
      summary: formSummary || (formContent.split('\n')[0].substring(0, 160) + '...'),
      tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
      if (editingPostId) {
        await api.updateNewsPost(editingPostId, payload);
      } else {
        await api.createNewsPost(payload);
      }

      triggerToast(
        editingPostId ? 'Publication database successfully updated!' : 'Chronicle article successfully published!',
        'success'
      );
      handleResetForms();
      // Refetch database state query in background
      queryClient.invalidateQueries({ queryKey: ['/news'] });
      setActivePortalView('chronicle');
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errMsg = err.issues.map(e => e.message).join(' ');
        triggerToast(`Validation Error: ${errMsg}`, 'error');
      } else {
        triggerToast(err.message || 'CMS post failed.', 'error');
      }
    }
  };

  const handleSubmitAnnouncementForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formAnnTitle,
      message: formAnnMessage,
      link: formAnnLink,
      linkText: formAnnLinkText,
      active: formAnnActive,
      category: formAnnCategory,
      imageUrl: formAnnImageUrl || ''
    };

    try {
      if (editingAnnId) {
        await api.updateAnnouncement(editingAnnId, payload);
      } else {
        await api.createAnnouncement(payload);
      }

      triggerToast(
        editingAnnId ? 'Official Notice Board registry updated!' : 'New Pinned notice successfully logged!',
        'success'
      );
      handleResetForms();
      queryClient.invalidateQueries({ queryKey: ['/announcements'] });
      setActivePortalView('notices');
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errMsg = err.issues.map(e => e.message).join(' ');
        triggerToast(`Validation Error: ${errMsg}`, 'error');
      } else {
        triggerToast(err.message || 'CMS notice failure.', 'error');
      }
    }
  };

  const handleDeletePost = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently erase: "${name}" from Adama gateway?`)) return;

    try {
      await api.deleteNewsPost(id);
      triggerToast('Article successfully purged from municipal storage.', 'success');
      queryClient.invalidateQueries({ queryKey: ['/news'] });
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently purge notice: "${name}"?`)) return;

    try {
      await api.deleteAnnouncement(id);
      triggerToast('Official Notice successfully purged.', 'success');
      queryClient.invalidateQueries({ queryKey: ['/announcements'] });
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Filter calculations
  const filteredNews = (news || []).filter(n => {
    const categoryMatch = activeCategory === 'All' || n.category === activeCategory;
    const searchMatch = searchQuery.trim() === '' ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  // Split featured vs general lists
  const hasFeatured = activeCategory === 'All' && searchQuery === '' && filteredNews.length > 0;
  const featuredItem = hasFeatured ? filteredNews[0] : null;
  const listItems = hasFeatured ? filteredNews.slice(1) : filteredNews;

  return (
    <section id="news" className="section-padding bg-white relative">
      {/* Toast Alert Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className={`fixed top-28 right-6 z-[400] flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold font-mono tracking-tight leading-relaxed">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-custom">
        {/* Banner Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <span className="text-xs font-black uppercase tracking-widest text-cyan block mb-3">INTEGRATED CIVIC MEDIA</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-navy mb-4">Adama Bulletin & Blogs</h2>
            <p className="text-neutral-500 text-sm md:text-base font-semibold leading-relaxed">
              Explore live municipal notices, press dispatches, and smart-city blog series. A unified, fully administrative CMS platform.
            </p>
          </motion.div>

          {/* Navigation Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            {/* Top Navigation Tabs */}
            <div className="flex bg-neutral-100/85 p-1.5 rounded-2xl border border-neutral-200/60 w-full sm:w-auto overflow-x-auto gap-1">
              <button
                onClick={() => setActivePortalView('chronicle')}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  activePortalView === 'chronicle' 
                    ? 'bg-navy text-white shadow-lg' 
                    : 'text-neutral-500 hover:text-navy hover:bg-neutral-50'
                }`}
              >
                📰 Chronicle Feed
              </button>
              <button
                onClick={() => setActivePortalView('notices')}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  activePortalView === 'notices' 
                    ? 'bg-navy text-white shadow-lg' 
                    : 'text-neutral-500 hover:text-navy hover:bg-neutral-50'
                }`}
              >
                📢 Notice Board
              </button>
              <button
                onClick={() => setActivePortalView('cms')}
                className={`flex-1 sm:flex-none px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  activePortalView === 'cms' 
                    ? 'bg-cyan text-navy shadow-lg font-black' 
                    : 'text-neutral-500 hover:text-navy hover:bg-neutral-50'
                }`}
              >
                ⚙️ CMS Workspace
              </button>
            </div>
          </div>
        </div>

        {/* =======================================================
            PORTAL WINDOW 1: CHRONICLE FEED
            ======================================================= */}
        {activePortalView === 'chronicle' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Inner Chronicle Search & Tag Filtering */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-50 p-4 rounded-3xl border border-neutral-150">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, author, tag content..."
                  className="w-full bg-white border border-neutral-200/80 p-3 pl-11 rounded-xl text-xs text-navy placeholder-neutral-400 outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-all font-semibold"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy hover:text-red-500 text-[10px] font-bold">Clear</button>
                )}
              </div>

              {/* Sub Categories filters */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto h-fit overflow-x-auto justify-start md:justify-end">
                {['All', 'Press Release', 'Announcement', 'Event', 'Blog'].map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveCategory(c);
                      setVisibleCount(4);
                    }}
                    className={`px-4 py-2.5 rounded-lg border text-[10px] uppercase font-black tracking-widest transition-all ${
                      activeCategory === c 
                        ? 'bg-navy border-navy text-cyan shadow-sm' 
                        : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-300 hover:text-navy'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Main reading content render area */}
            {newsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="card p-0 bg-white overflow-hidden rounded-3xl border border-neutral-100">
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-6 space-y-4">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : newsError ? (
              <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
                <p className="text-red-600 font-bold mb-2">Notice Gateway Load Interrupted</p>
                <p className="text-xs text-neutral-400">{newsError}</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 rounded-4xl border border-neutral-150 max-w-md mx-auto">
                <Megaphone size={34} className="text-neutral-400 mx-auto mb-4" />
                <p className="text-sm text-navy font-bold mb-1">No Articles or Journals Match</p>
                <p className="text-xs text-neutral-400">Expand filtering tabs or adjust search query keywords.</p>
              </div>
            ) : (
              <>
                {/* Featured article block */}
                {featuredItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-50/70 border border-neutral-150 rounded-4xl overflow-hidden shadow-sm hover:shadow hover:border-cyan/30 transition-all flex flex-col lg:flex-row group cursor-pointer"
                    onClick={() => setSelectedPost(featuredItem)}
                  >
                    <div className="lg:w-1/2 aspect-video lg:aspect-auto overflow-hidden relative min-h-[300px]">
                      <img src={featuredItem.imageUrl || undefined} alt={featuredItem.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute top-6 left-6">
                        <span className="px-3 py-1 bg-navy text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-md border border-white/10">FEATURED REPORT</span>
                      </div>
                    </div>
                    <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 text-[9px] text-neutral-400 mb-4 uppercase tracking-widest font-black">
                          <span className="bg-cyan/15 text-cyan px-2 py-0.5 rounded border border-cyan/10">{featuredItem.category}</span>
                          <span>•</span>
                          <span>{featuredItem.date}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black mb-4 text-navy group-hover:text-cyan transition-colors leading-tight line-clamp-2">{featuredItem.title}</h3>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-6 font-semibold line-clamp-3">{stripHtml(featuredItem.summary, 220)}</p>
                      </div>
                      <div className="pt-6 border-t border-neutral-200/65 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Journalist: <span className="text-navy">{featuredItem.author}</span></span>
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-navy bg-white border border-neutral-200 px-5 py-2.5 rounded-xl group-hover:bg-cyan group-hover:text-navy hover:border-transparent transition-all">
                          Read Story <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Grid layout */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {listItems.slice(0, visibleCount).map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="card group overflow-hidden flex flex-col cursor-pointer border-neutral-150 bg-white hover:border-cyan/35 rounded-3xl"
                      onClick={() => setSelectedPost(item)}
                    >
                      <div className="aspect-video overflow-hidden relative">
                        <img src={item.imageUrl || undefined} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 left-4">
                          <span className="px-2.5 py-0.5 bg-white text-[9px] font-black uppercase tracking-widest text-navy rounded border border-neutral-200/50">{item.category}</span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-[9px] text-neutral-400 mb-3 uppercase tracking-widest font-black">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {item.date}</span>
                        </div>
                        <h3 className="text-base font-extrabold mb-3 text-navy card-title line-clamp-2 leading-snug group-hover:text-cyan transition-colors">{item.title}</h3>
                        <p className="text-xs text-neutral-500 mb-6 font-semibold line-clamp-3 leading-relaxed">{stripHtml(item.summary, 120)}</p>
                        
                        {/* Tags bottom block */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="mt-auto pt-4 border-t border-neutral-100 flex gap-1 flex-wrap">
                            {item.tags.slice(0, 2).map((t, i) => (
                              <span key={i} className="text-[8px] font-bold text-gray-400 bg-neutral-100 px-2 py-0.5 rounded">#{t}</span>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-neutral-50 mt-3 flex items-center justify-between">
                          <span className="text-[8px] text-neutral-400 font-extrabold uppercase">Reference {item.id}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-navy group-hover:text-cyan flex items-center gap-1">
                            Read More <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {visibleCount < listItems.length && (
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setVisibleCount(p => p + 4)}
                      className="px-8 py-3.5 border border-cyan hover:bg-navy hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl text-navy transition-all flex items-center gap-2 group"
                    >
                      Load More Stories <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* =======================================================
            PORTAL WINDOW 2: NOTICE BOARD
            ======================================================= */}
        {activePortalView === 'notices' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-150 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-navy uppercase tracking-tight block text-left">All Active Notices</h3>
                <p className="text-xs text-neutral-500 font-semibold mt-1 text-left">Official decree files and emergency registry updates compiled by the Director General of Adama.</p>
              </div>
              <div className="text-xs font-black uppercase bg-cyan/10 text-cyan border border-cyan/25 px-4 py-2.5 rounded-xl font-mono tracking-wider text-center h-fit">
                📢 {announcements ? announcements.length : 0} Total Active Declarations
              </div>
            </div>

            {/* Announcement Category filter */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {['All', 'Infrastructure', 'Social', 'Economy', 'General'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveAnnCategory(cat); setAnnPage(1); }}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                    activeAnnCategory === cat
                      ? 'bg-navy text-white border-transparent shadow-md'
                      : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-navy hover:border-neutral-300'
                  }`}
                >
                  {cat === 'All' ? '🌐 All' : cat}
                </button>
              ))}
            </div>

            {annLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
              </div>
            ) : (!announcements || announcements.length === 0) ? (
              <div className="text-center py-16 bg-neutral-50 rounded-3xl border border-neutral-150">
                <p className="text-sm font-bold text-neutral-500">Notice Bulletin is Empty</p>
              </div>
            ) : (
              (() => {
                const filteredAnn = announcements.filter(ann => {
                  if (activeAnnCategory === 'All') return true;
                  return ann.category === activeAnnCategory;
                });

                if (filteredAnn.length === 0) {
                  return (
                    <div className="text-center py-12 bg-neutral-50 rounded-3xl border border-neutral-150">
                      <p className="text-sm font-bold text-neutral-500">No announcements match the '{activeAnnCategory}' category.</p>
                    </div>
                  );
                }

                const LIMIT = 6;
                const totalPages = Math.ceil(filteredAnn.length / LIMIT);
                const currentPage = Math.min(annPage, totalPages || 1);
                const paginatedAnn = filteredAnn.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

                return (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedAnn.map((ann) => (
                        <motion.div
                          key={ann.id}
                          layoutId={ann.id}
                          className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all relative text-left ${
                            ann.active 
                              ? 'border-neutral-200 hover:border-cyan/30' 
                              : 'border-dashed border-neutral-200 opacity-60'
                          }`}
                        >
                          {!ann.active && (
                            <span className="absolute top-4 right-4 bg-neutral-100 text-neutral-400 text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded">ARCHIVED</span>
                          )}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2">
                                <span className="p-2 bg-neutral-100 rounded-lg text-cyan shrink-0"><Bell size={14} /></span>
                                <span className="text-[8px] font-black text-neutral-400 tracking-wider block uppercase">Adama Decree Notice</span>
                              </div>
                              {ann.category && (
                                <span className="text-[8px] font-extrabold uppercase px-2 py-1 tracking-wider bg-neutral-50 border border-neutral-150 text-neutral-600 rounded-lg">
                                  {ann.category}
                                </span>
                              )}
                            </div>

                            {ann.imageUrl && (
                              <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 bg-neutral-100 border border-neutral-150">
                                <img 
                                  src={ann.imageUrl || undefined} 
                                  alt={ann.title} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            <h4 className="text-base font-extrabold text-navy leading-snug line-clamp-2 uppercase">{ann.title}</h4>
                            <p className="text-xs text-neutral-500 mt-2 font-medium leading-relaxed line-clamp-4">{stripHtml(ann.message, 160)}</p>
                          </div>

                          <div className="mt-6 pt-5 border-t border-neutral-100 flex gap-4 items-center justify-between">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">ID: {ann.id.substring(0, 15)}</span>
                            <button
                              onClick={() => setSelectedAnn(ann)}
                              className="text-[9px] font-black uppercase tracking-widest text-navy bg-white hover:bg-cyan px-4 py-2 hover:text-navy rounded-lg border border-neutral-200 transition-all cursor-pointer"
                            >
                              Read Notice Details
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination control panel */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-neutral-100">
                        <button
                          onClick={() => setAnnPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 border border-neutral-200 hover:border-cyan hover:bg-neutral-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-neutral-600 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setAnnPage(idx + 1)}
                            className={`w-9 h-9 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                              currentPage === idx + 1
                                ? 'bg-navy border-navy text-white shadow-md'
                                : 'bg-white border-neutral-200 text-neutral-600 hover:border-cyan hover:bg-neutral-50'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setAnnPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-neutral-200 hover:border-cyan hover:bg-neutral-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-neutral-600 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </motion.div>
        )}

        {/* =======================================================
            PORTAL WINDOW 3: CMS WORKSPACE (CRUD CONTROLS)
            ======================================================= */}
        {activePortalView === 'cms' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Locking Screen Mechanism for Visual Integrity */}
            {isCmsLocked ? (
              <div className="max-w-md mx-auto py-12 px-8 bg-neutral-50 border border-neutral-150 rounded-4xl text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center text-cyan mx-auto shadow-md">
                  <Lock size={26} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-navy uppercase tracking-tight">Administrative Authentication</h4>
                  <p className="text-xs text-neutral-500 font-semibold leading-relaxed mt-1">Please insert the editorial passcode keyword to unlock modification and CMS action bars.</p>
                </div>
                <form onSubmit={handleEditorPasscodeSubmit} className="space-y-3">
                  <input 
                    type="password" 
                    value={cmsPasscode}
                    onChange={e => setCmsPasscode(e.target.value)}
                    placeholder="Enter validation passcode..."
                    className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-center text-navy font-bold placeholder-neutral-400 outline-none text-xs"
                  />
                  {cmsUnlockError && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">{cmsUnlockError}</p>}
                  <button type="submit" className="btn-primary w-full py-3.5 text-[10px] uppercase font-black tracking-widest">Verify Editor Status</button>
                </form>
                <div className="text-[9px] text-neutral-400 font-bold uppercase">Hint: Type <span className="text-cyan font-black italic">"admin"</span> or <span className="text-cyan font-black italic">"2026"</span></div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-10">
                {/* 3a. Sidebar Selector List: Manage Existing */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-navy text-white p-6 rounded-3xl space-y-4 shadow-md border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan/10 rounded-full blur-2xl" />
                    <div className="flex items-center gap-2">
                       <LayoutDashboard size={18} className="text-cyan" />
                       <h4 className="text-sm font-black uppercase tracking-wider">CMS CONTROL DASHBOARD</h4>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-semibold leading-relaxed">
                      Transform digital content across dynamic layout engines. Toggle control segments below to coordinate.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button"
                        onClick={() => { setCmsTargetModel('news'); handleResetForms(); }}
                        className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                          cmsTargetModel === 'news' 
                            ? 'bg-cyan text-navy border-transparent font-black shadow' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold'
                        }`}
                      >
                        📰 News posts
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setCmsTargetModel('announcement'); handleResetForms(); }}
                        className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                          cmsTargetModel === 'announcement' 
                            ? 'bg-cyan text-navy border-transparent font-black shadow' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold'
                        }`}
                      >
                        📢 Bulletins
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setCmsTargetModel('site_settings'); }}
                        className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                          cmsTargetModel === 'site_settings' 
                            ? 'bg-cyan text-navy border-transparent font-black shadow' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold'
                        }`}
                      >
                        ⚙️ Settings
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setCmsTargetModel('audit_logs'); }}
                        className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                          cmsTargetModel === 'audit_logs' 
                            ? 'bg-cyan text-navy border-transparent font-black shadow' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 font-bold'
                        }`}
                      >
                        📋 Audit Logs
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCmsLocked(true)}
                      className="w-full text-center text-[8px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors pt-2 block border-t border-white/5 font-black flex items-center justify-center gap-1"
                    >
                      <Lock size={10} /> LOCK CMS HUB TERMINAL
                    </button>
                  </div>

                  {/* CMS List scroll block */}
                  <div className="bg-neutral-50 border border-neutral-150 p-6 rounded-3xl h-[460px] overflow-y-auto space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-neutral-200">
                      <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">
                        {cmsTargetModel === 'news' && `Active Articles (${news ? news.length : 0})`}
                        {cmsTargetModel === 'announcement' && `Active Notices (${announcements ? announcements.length : 0})`}
                        {cmsTargetModel === 'site_settings' && `System Settings`}
                        {cmsTargetModel === 'audit_logs' && `Recorded Logs (${auditLogs ? auditLogs.length : 0})`}
                      </span>
                      {(cmsTargetModel === 'news' || cmsTargetModel === 'announcement') && (
                        <button 
                          type="button"
                          onClick={handleResetForms}
                          className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white hover:bg-neutral-100 border rounded text-emerald-600 animate-pulse"
                        >
                          + New Frame
                        </button>
                      )}
                    </div>

                    {cmsTargetModel === 'news' ? (
                      newsLoading ? <p className="text-xs text-neutral-400 font-mono">Catalog Loading...</p> : 
                      news && news.length > 0 ? (
                        <div className="space-y-2.5">
                          {news.map(n => (
                            <div 
                              key={n.id} 
                              className={`p-3 rounded-2xl border text-left transition-all ${
                                editingPostId === n.id 
                                  ? 'bg-cyan/10 border-cyan text-navy' 
                                  : 'bg-white border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{n.category} • ID {n.id}</div>
                              <h5 className="text-xs font-extrabold text-navy mt-1 truncate">{n.title}</h5>
                              
                              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-neutral-100">
                                <button
                                  type="button"
                                  onClick={() => handleInitiateEditPost(n)}
                                  className="p-1 px-2.5 border rounded-md text-[9px] font-bold uppercase tracking-wider text-navy bg-white hover:bg-neutral-50 flex items-center gap-1"
                                >
                                  <Edit3 size={10} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(n.id, n.title)}
                                  className="p-1 px-2.5 border rounded-md text-[9px] font-bold uppercase tracking-wider text-red-500 bg-white hover:bg-red-50 flex items-center gap-1"
                                >
                                  <Trash2 size={10} /> Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-neutral-400">Empty articles.</p>
                    ) : cmsTargetModel === 'announcement' ? (
                      annLoading ? <p className="text-xs text-neutral-400 font-mono">Notice Catalog Loading...</p> :
                      announcements && announcements.length > 0 ? (
                        <div className="space-y-2.5">
                          {announcements.map(ann => (
                            <div 
                              key={ann.id} 
                              className={`p-3 rounded-2xl border text-left transition-all ${
                                editingAnnId === ann.id 
                                  ? 'bg-cyan/10 border-cyan text-navy' 
                                  : 'bg-white border-neutral-200 hover:border-neutral-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">ID: {ann.id}</span>
                                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                                  ann.active ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'
                                }`}>
                                  {ann.active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                              </div>
                              <h5 className="text-xs font-extrabold text-navy mt-1 truncate">{ann.title}</h5>
                              
                              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-neutral-150">
                                <button
                                  type="button"
                                  onClick={() => handleInitiateEditAnn(ann)}
                                  className="p-1 px-2.5 border rounded-md text-[9px] font-bold uppercase tracking-wider text-navy bg-white hover:bg-neutral-50 flex items-center gap-1"
                                >
                                  <Edit3 size={10} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                                  className="p-1 px-2.5 border rounded-md text-[9px] font-bold uppercase tracking-wider text-red-500 bg-white hover:bg-red-50 flex items-center gap-1"
                                >
                                  <Trash2 size={10} /> Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-neutral-400">Empty announcements.</p>
                    ) : cmsTargetModel === 'site_settings' ? (
                      <div className="space-y-4 text-xs font-semibold text-neutral-600 leading-relaxed py-2 text-left">
                        <div className="bg-white border p-4 rounded-2xl border-neutral-150 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan/5 rounded-full blur-xl" />
                          <p className="font-bold text-navy uppercase text-[9px] tracking-wider mb-2 flex items-center gap-1">
                            <Settings size={12} className="text-cyan animate-spin-slow" /> Configuration Hub
                          </p>
                          <p className="text-[11px] leading-relaxed text-neutral-500">
                            Updating site settings properties instantly changes headers, background titles, official mail contacts, and portraits!
                          </p>
                          <div className="mt-3 pl-2.5 border-l-2 border-cyan/50 text-[10px] space-y-1 text-navy font-bold">
                            <div>✓ Header Text Tagline</div>
                            <div>✓ Contact Emails / Phone</div>
                            <div>✓ Rich History Records</div>
                            <div>✓ Registered Signatory Message</div>
                          </div>
                        </div>
                        <div className="text-[8px] font-mono text-neutral-400 uppercase text-center">STORAGE INDEX: SQL_SETTINGS_M1</div>
                      </div>
                    ) : (
                      auditLoading ? <p className="text-xs text-neutral-400 font-mono">Trace streams...</p> :
                      auditLogs && auditLogs.length > 0 ? (
                        <div className="space-y-2 max-h-[380px] overflow-y-auto">
                          {auditLogs.map((log: any) => (
                            <div key={log.id} className="p-3 bg-white border border-neutral-200 rounded-xl text-left text-[11px] font-semibold space-y-1 shadow-sm relative hover:border-neutral-300 transition-all">
                              <div className="flex items-center justify-between text-[8px] font-mono">
                                <span className={`px-1.5 py-0.5 rounded text-white font-black uppercase text-[7px] tracking-widest ${
                                  log.action === 'CREATE' ? 'bg-emerald-500' :
                                  log.action === 'UPDATE' ? 'bg-amber-500' : 'bg-red-500'
                                }`}>
                                  {log.action}
                                </span>
                                <span className="text-neutral-400 font-bold">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-navy font-bold">
                                User: <span className="text-cyan font-mono font-black italic">{log.username || 'admin_editor'}</span>
                              </p>
                              <p className="text-neutral-600 text-[10px]">
                                Target: <span className="font-mono text-neutral-500 uppercase">{log.module}</span> (ID {log.item_id})
                              </p>
                              <div className="text-[9px] font-mono bg-neutral-50 p-1.5 rounded text-neutral-500 truncate mt-1 border border-neutral-100">
                                {log.details}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-neutral-400">Empty audit logs trail.</p>
                    )}                 </div>
                </div>

                {/* 3b. Interactive Input Forms & Live Previews */}
                <div className="lg:col-span-8 bg-neutral-50/50 border border-neutral-150 p-6 md:p-8 rounded-4xl shadow-sm space-y-8">
                  <div className="border-b border-neutral-200 pb-4">
                    <span className="text-[9px] text-cyan uppercase tracking-widest font-black block">WORKSPACE FORM TERMINAL</span>
                    <h4 className="text-2xl font-black text-navy uppercase mt-1">
                      {cmsTargetModel === 'news' && (editingPostId ? `📝 Edit Article: "${formTitle.substring(0, 24)}..."` : '📰 Draft New Article & Blog')}
                      {cmsTargetModel === 'announcement' && (editingAnnId ? `📝 Edit Notice: "${formAnnTitle.substring(0, 24)}..."` : '📢 Formulate Official Notice')}
                      {cmsTargetModel === 'site_settings' && '⚙️ Modify Municipal Site Layout Settings'}
                      {cmsTargetModel === 'audit_logs' && '🛡️ Security Compliance Logs Viewer'}
                    </h4>
                  </div>

                  {/* News CRUD Form */}
                  {cmsTargetModel === 'news' && (
                    <form onSubmit={handleSubmitNewsPostForm} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Publication Header Title *</label>
                          <input 
                            type="text"
                            required
                            value={formTitle}
                            onChange={e => setFormTitle(e.target.value)}
                            placeholder="e.g. Adama Stadium Phase II Construction Underway"
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Category *</label>
                            <select
                              value={formCategory}
                              onChange={e => setFormCategory(e.target.value as any)}
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-bold outline-none focus:border-cyan transition-all"
                            >
                              <option value="Press Release">Press Release</option>
                              <option value="Announcement">Announcement</option>
                              <option value="Event">Event</option>
                              <option value="Blog">Blog</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Author Correspondent</label>
                            <input 
                              type="text"
                              value={formAuthor}
                              onChange={e => setFormAuthor(e.target.value)}
                              placeholder="e.g. City Press Office"
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Cover Photo URL</label>
                          <input 
                            type="url"
                            value={formImageUrl}
                            onChange={e => setFormImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/your-image"
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Tags (Comma-separated list)</label>
                          <input 
                            type="text"
                            value={formTags}
                            onChange={e => setFormTags(e.target.value)}
                            placeholder="e.g. Budget, Infrastructure, SmartCity"
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Quick Summary Lead (Teaser) *</label>
                        <input 
                          type="text"
                          required
                          value={formSummary}
                          onChange={e => setFormSummary(e.target.value)}
                          placeholder="A brief 1-2 sentence teaser summary..."
                          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Detailed Article Content Body *</label>
                        <textarea 
                          rows={6}
                          required
                          value={formContent}
                          onChange={e => setFormContent(e.target.value)}
                          placeholder="Type out the complete article prose details..."
                          className="w-full bg-white border border-neutral-200 p-4 rounded-xl text-xs text-navy font-medium outline-none focus:border-cyan transition-all leading-relaxed whitespace-pre"
                        />
                      </div>

                      {/* Live draft preview helper */}
                      <div className="bg-white border rounded-2xl p-6 border-cyan/20 space-y-3">
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-cyan tracking-wider"><Eye size={12} /> Live Card Design Preview (Draft Mode)</div>
                        <div className="border border-neutral-100 p-4 rounded-xl flex gap-4 bg-neutral-50/50">
                          {formImageUrl && (
                            <img src={formImageUrl || undefined} alt="preview" className="w-24 h-16 object-cover rounded-lg shrink-0 border" referrerPolicy="no-referrer" />
                          )}
                          <div>
                            <span className="text-[8px] font-bold uppercase text-white bg-navy px-1.5 py-0.5 rounded">{formCategory}</span>
                            <h5 className="font-extrabold text-navy text-xs mt-1">{formTitle || 'Awaiting Article Title'}</h5>
                            <p className="text-[10px] text-neutral-400 mt-1 line-clamp-1">{formSummary || 'Awaiting Summary Teaser...'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button 
                          type="submit" 
                          className="flex-1 py-4 bg-navy hover:bg-cyan text-white hover:text-navy text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Send size={12} /> {editingPostId ? 'Save & Update Publication' : 'Release & Publish Story'}
                        </button>
                        {editingPostId && (
                          <button 
                            type="button" 
                            onClick={handleResetForms}
                            className="px-6 py-4 border border-neutral-200 hover:bg-neutral-100 rounded-xl text-[10px] uppercase font-black text-neutral-500"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Announcement CRUD Form */}
                  {cmsTargetModel === 'announcement' && (
                    <form onSubmit={handleSubmitAnnouncementForm} className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Bulletin Announcement Title *</label>
                        <input 
                          type="text"
                          required
                          value={formAnnTitle}
                          onChange={e => setFormAnnTitle(e.target.value)}
                          placeholder="e.g. Tender Notice Adama Road Expansion Phase IV"
                          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Announcement Illustration/Picture URL (Optional)</label>
                        <input 
                          type="text"
                          value={formAnnImageUrl}
                          onChange={e => setFormAnnImageUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/... (leave empty for default notice badge)"
                          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Detailed Declaration Notice Message *</label>
                        <textarea 
                          rows={4}
                          required
                          value={formAnnMessage}
                          onChange={e => setFormAnnMessage(e.target.value)}
                          placeholder="Write out official decree instruction bullet points..."
                          className="w-full bg-white border border-neutral-200 p-4 rounded-xl text-xs text-navy font-medium outline-none focus:border-cyan transition-all leading-relaxed"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Redirect Link (Internal/External)</label>
                          <input 
                            type="text"
                            value={formAnnLink}
                            onChange={e => setFormAnnLink(e.target.value)}
                            placeholder="e.g. #news or #services"
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Button Call-To-Action Text</label>
                          <input 
                            type="text"
                            value={formAnnLinkText}
                            onChange={e => setFormAnnLinkText(e.target.value)}
                            placeholder="e.g. Download Tender Document"
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all h-11"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Notice Category</label>
                          <select
                            value={formAnnCategory}
                            onChange={e => setFormAnnCategory(e.target.value as any)}
                            className="w-full bg-white border border-neutral-200 px-3 rounded-xl text-xs text-navy font-bold outline-none focus:border-cyan transition-all h-11"
                          >
                            <option value="General">General</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Social">Social</option>
                            <option value="Economy">Economy</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Notice Priority / Status</label>
                          <div className="flex items-center gap-2 bg-white border p-3 rounded-xl h-11">
                            <input 
                              type="checkbox" 
                              id="ann_active"
                              checked={formAnnActive}
                              onChange={e => setFormAnnActive(e.target.checked)}
                              className="w-4 h-4 text-cyan border-neutral-200 rounded shrink-0 focus:ring-cyan"
                            />
                            <label htmlFor="ann_active" className="text-xs text-navy font-bold select-none cursor-pointer">Active Bulletin Notice</label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button 
                          type="submit" 
                          className="flex-1 py-4 bg-navy hover:bg-cyan text-white hover:text-navy text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Send size={12} /> {editingAnnId ? 'Save & Update Notice Decree' : 'Publish Notice Bulletin'}
                        </button>
                        {editingAnnId && (
                          <button 
                            type="button" 
                            onClick={handleResetForms}
                            className="px-6 py-4 border border-neutral-200 hover:bg-neutral-100 rounded-xl text-[10px] uppercase font-black text-neutral-500"
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Site Settings CRUD Form matching PostgreSQL site_settings schema values */}
                  {cmsTargetModel === 'site_settings' && (
                    <form onSubmit={handleSubmitSiteSettingsForm} className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-[11px] font-semibold text-amber-700 leading-relaxed flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <strong>Administrative Authority Required</strong>: Committing edits to this record directly modifies core portal elements including main menu titles, support contact credentials, and the official message signatory. All changes are programmatically logged.
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Portal Gateway Name *</label>
                          <input 
                            type="text"
                            required
                            value={formSiteName}
                            onChange={e => setFormSiteName(e.target.value)}
                            placeholder="e.g. ADAMA CITY ADMINISTRATION"
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Portal Slogan Description</label>
                          <input 
                            type="text"
                            value={formSiteDescription}
                            onChange={e => setFormSiteDescription(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Contact Email</label>
                          <input 
                            type="email"
                            value={formContactEmail}
                            onChange={e => setFormContactEmail(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Contact Phone Number</label>
                          <input 
                            type="text"
                            value={formContactPhone}
                            onChange={e => setFormContactPhone(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Physical Postal Address</label>
                          <input 
                            type="text"
                            value={formAddress}
                            onChange={e => setFormAddress(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Portal High-Res Logo Image URL</label>
                          <input 
                            type="text"
                            value={formLogoUrl}
                            onChange={e => setFormLogoUrl(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Mayors Signed Portrait Image URL</label>
                          <input 
                            type="text"
                            value={formMayorsMessagePhoto}
                            onChange={e => setFormMayorsMessagePhoto(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Executive Message Signatory Title / Name</label>
                        <input 
                          type="text"
                          value={formMayorsMessageAuthor}
                          onChange={e => setFormMayorsMessageAuthor(e.target.value)}
                          placeholder="e.g. Hon. Hailu Jelde (Adama City Mayor)"
                          className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Live Mayoral Executive Message (JSONB/Statement)</label>
                        <textarea 
                          rows={3}
                          value={formMayorsMessage}
                          onChange={e => setFormMayorsMessage(e.target.value)}
                          className="w-full bg-white border border-neutral-200 p-4 rounded-xl text-xs text-navy font-medium outline-none focus:border-cyan transition-all leading-relaxed"
                        />
                      </div>

                      {/* Dynamic City Facts & Statistics Section */}
                      <div className="border-t border-b border-neutral-200/60 py-6 space-y-5">
                        <span className="text-[10px] font-black text-cyan uppercase tracking-widest block">City Strategic Facts & Statistics</span>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Established Year</label>
                            <input 
                              type="text"
                              value={formEstablished}
                              onChange={e => setFormEstablished(e.target.value)}
                              placeholder="e.g. 1924 GC"
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Total Area</label>
                            <input 
                              type="text"
                              value={formArea}
                              onChange={e => setFormArea(e.target.value)}
                              placeholder="e.g. 58,109 ha"
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Elevation / Altitude</label>
                            <input 
                              type="text"
                              value={formAltitude}
                              onChange={e => setFormAltitude(e.target.value)}
                              placeholder="e.g. 1,712 m asl"
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Average Climate</label>
                            <input 
                              type="text"
                              value={formClimate}
                              onChange={e => setFormClimate(e.target.value)}
                              placeholder="e.g. 22°C"
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Population Strength</label>
                            <input 
                              type="text"
                              value={formPopulation}
                              onChange={e => setFormPopulation(e.target.value)}
                              placeholder="e.g. 1M+"
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Administrative structure</label>
                            <input 
                              type="text"
                              value={formAdministrativeStructure}
                              onChange={e => setFormAdministrativeStructure(e.target.value)}
                              placeholder="e.g. 32 Sectors, 6 Sub-Cities, 19 Woredas"
                              className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">"About Us" Comprehensive City History (Rich Text)</label>
                        <textarea 
                          rows={6}
                          value={formAboutUs}
                          onChange={e => setFormAboutUs(e.target.value)}
                          className="w-full bg-white border border-neutral-200 p-4 rounded-xl text-xs text-navy font-medium outline-none focus:border-cyan transition-all leading-relaxed"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Portal Footer Copyright text</label>
                          <input 
                            type="text"
                            value={formFooterText}
                            onChange={e => setFormFooterText(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-3 rounded-xl text-xs text-navy font-semibold outline-none focus:border-cyan transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide block">Maintenance Mode Switch</label>
                          <div className="flex items-center gap-2 bg-white border p-3 rounded-xl h-11">
                            <input 
                              type="checkbox" 
                              id="settings_maint"
                              checked={formMaintenanceMode}
                              onChange={e => setFormMaintenanceMode(e.target.checked)}
                              className="w-4 h-4 text-cyan border-neutral-200 rounded shrink-0 focus:ring-cyan"
                            />
                            <label htmlFor="settings_maint" className="text-xs text-navy font-bold select-none cursor-pointer">Lock Public Access (Maintenance Mode)</label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button 
                          type="submit" 
                          className="w-full py-4 bg-navy hover:bg-cyan text-white hover:text-navy text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Settings size={12} className="animate-spin-slow" /> Save Administration Layout Profile
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Audit Logs Compliance Viewer Panel */}
                  {cmsTargetModel === 'audit_logs' && (
                    <div className="space-y-6 text-left">
                      <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-[11px] font-semibold text-slate-700 leading-relaxed flex items-start gap-2.5">
                        <FileText size={16} className="shrink-0 text-slate-500 mt-0.5" />
                        <div>
                          <strong>Portal Audit Compliance Trail Active</strong>: All layout overrides, data submissions, and deletions are permanently logged to the system audit trails in chronological order. No item is editable or wipeable for public compliance integrity.
                        </div>
                      </div>

                      {auditLoading ? (
                        <p className="text-xs text-neutral-400 font-mono">Loading compliance logs...</p>
                      ) : auditLogs && auditLogs.length > 0 ? (
                        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[9px] tracking-wider font-extrabold font-mono">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Resource Target</th>
                                <th className="p-4">Changed payload detail</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-semibold text-navy font-sans">
                              {auditLogs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                                  <td className="p-4 font-mono text-[10px] text-neutral-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black text-white ${
                                      log.action === 'CREATE' ? 'bg-emerald-500' :
                                      log.action === 'UPDATE' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-cyan">{log.username || 'admin_editor'}</td>
                                  <td className="p-4 font-mono text-neutral-500 uppercase text-[10px]">
                                    {log.module} <span className="text-neutral-500">(ID {log.item_id})</span>
                                  </td>
                                  <td className="p-4 font-mono text-[10px] text-neutral-400 max-w-xs truncate" title={log.details}>
                                    {log.details}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-400 font-medium">No audit items found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* =======================================================
            DETAIL INSPECTIONS MODAL OVERLAYS
            ======================================================= */}
        <AnimatePresence>
          {selectedPost && (
            <NewsModal post={selectedPost} onClose={() => setSelectedPost(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedAnn && (
            <AnnouncementModal announcement={selectedAnn} onClose={() => setSelectedAnn(null)} />
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
