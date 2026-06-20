import React, { useState, useEffect } from 'react';


import { useCMS } from '../CMSContext';
import { getMemberAvatarUrl } from '../utils/avatar';
import type { AdministrativeUnit, AdministrativeMember } from '../types/admin';
import { FormWrapper, InputField, SelectField } from './FormComponents';
import { 
  X,  Image as ImageIcon, Plus, Trash2, 
  FileText, Briefcase, Users, 
   MapPin, PenTool,
  Upload, CheckCircle2, Eye, Search,
  Check,
  Video,
  Monitor,
  Smartphone,
  Settings2,
  Layers,
  Type,
  Zap,
  Globe,
  Lock,
  Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  NewsAnnouncement, 
  PinnedAnnouncement, 
  Service, 
  LeadershipProfile, 
  MayoralHistory, 
  Initiative,
  Event,
  DocumentPublication,
  TourismContent,
  BlogEntry,
  MediaItem,
  HeroVideoConfig,
  SiteSettings,
  GrowthMetric
} from '../types';
import { LANGUAGES } from '../constants';
interface FormProps<T> {
  initialData?: Partial<T>;
  onSave: (data: T) => void;
  onCancel: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};



const SEOSection: React.FC<{
  data: any;
  onChange: (updates: any) => void;
}> = ({ data, onChange }) => (
  <div className="space-y-6 pt-6 border-t border-gray-100">
    <div className="flex items-center space-x-2 text-slate-800">
      <Globe size={18} />
      <h3 className="font-black text-lg">Search Engine Optimization</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InputField 
        label="Meta Title" 
        value={data.metaTitle || ''} 
        onChange={(val) => onChange({ metaTitle: val })}
        placeholder="Custom SEO Title"
        maxLength={70}
      />
      <InputField 
        label="URL Slug" 
        value={data.slug || ''} 
        onChange={(val) => onChange({ slug: val })}
        placeholder="custom-url-slug"
      />
    </div>
    <InputField 
      label="Meta Description" 
      value={data.metaDescription || ''} 
      onChange={(val) => onChange({ metaDescription: val })}
      placeholder="Description for Google search results"
      multiline
      maxLength={160}
    />
    <InputField 
      label="Meta Keywords" 
      value={data.metaKeywords || ''} 
      onChange={(val) => onChange({ metaKeywords: val })}
      placeholder="keyword1, keyword2, keyword3"
    />
  </div>
);

const MediaPicker: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, required, error }) => {
  const { media, addMedia } = useCMS();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const filteredMedia = media.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const base64 = await fileToBase64(file);
        const newMedia: MediaItem = {
          id: `media-${Date.now()}`,
          name: file.name,
          url: base64,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          category: 'Uploads',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
          status: 'published',
          author: 'Admin',
          language: 'en',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: file.type,
          thumbnailUrl: file.type.startsWith('image/') ? base64 : undefined
        };
        await addMedia(newMedia);
        onChange(newMedia.url);
        setIsOpen(false);
      } catch (err) {
        console.error('File conversion to base64 failed', err);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-gray-700 flex items-center space-x-1">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className={`relative group rounded-xl border-2 border-dashed ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-4 transition-all hover:border-brand-teal/50`}>
        {value ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img src={value} alt="Selected" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button 
                onClick={() => setIsOpen(true)}
                className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"
              >
                <PenTool size={18} />
              </button>
              <button 
                onClick={() => onChange('')}
                className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full py-8 flex flex-col items-center justify-center space-y-2 text-gray-400 hover:text-brand-teal-dark transition-colors"
          >
            <ImageIcon size={32} />
            <span className="text-sm font-medium">Select or Upload Image</span>
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Media Library</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('library')}
                className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'library' ? 'border-brand-teal-dark text-brand-teal-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Library
              </button>
              <button 
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'upload' ? 'border-brand-teal-dark text-brand-teal-dark' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Upload New
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'library' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text"
                      placeholder="Search media..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-teal outline-none text-sm"
                    />
                  </div>
                  {/* User Uploaded Media */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Uploaded Media ({filteredMedia.filter(m => m.type === 'image').length})</h4>
                    {filteredMedia.filter(m => m.type === 'image').length === 0 ? (
                      <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200/60 rounded-2xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">No uploaded images yet.</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Use the "Upload New" tab to add your files.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {filteredMedia.filter(m => m.type === 'image').map((item) => (
                          <button
                            key={item.id}
                            onClick={() => { onChange(item.url); setIsOpen(false); }}
                            className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${value === item.url ? 'border-brand-teal-dark ring-2 ring-brand-teal/20' : 'border-transparent hover:border-brand-teal/30'}`}
                          >
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-2 text-left">
                              <p className="text-[10px] font-bold text-white truncate leading-none mb-0.5">{item.name}</p>
                              <p className="text-[8px] font-mono text-brand-teal uppercase tracking-wider leading-none">{item.size || 'N/A'}</p>
                            </div>
                            <div className="absolute inset-0 bg-brand-teal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              {value === item.url && <Check className="text-white" size={32} />}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* System Graphic Presets */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">System Graphic Presets</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { url: 'https://images.unsplash.com/photo-1573164713562-b3cabe31fc7e?w=800', name: 'Adama Wind Project' },
                        { url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800', name: 'Modern Council Hall' },
                        { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', name: 'Downtown Center' },
                        { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800', name: 'Governance Cabinet Meeting' },
                        { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', name: 'Municipal Planning' },
                        { url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', name: 'Public Engagement' },
                        { url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800', name: 'Official Certificates & Licenses' },
                        { url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800', name: 'Abebe Bikila Infrastructure' }
                      ].filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((preset, idx) => (
                        <button
                          key={`preset-${idx}`}
                          onClick={() => { onChange(preset.url); setIsOpen(false); }}
                          className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${value === preset.url ? 'border-brand-teal-dark ring-2 ring-brand-teal/20' : 'border-transparent hover:border-brand-teal/30'}`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-2 text-left">
                            <p className="text-[10px] font-bold text-white truncate leading-none mb-0.5">{preset.name}</p>
                            <p className="text-[8px] font-mono text-brand-teal uppercase tracking-wider leading-none">System Asset</p>
                          </div>
                          <div className="absolute inset-0 bg-brand-teal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            {value === preset.url && <Check className="text-white" size={32} />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-200 rounded-2xl p-12">
                  {uploading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-brand-teal-dark border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-600">Uploading image...</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-brand-teal/10 rounded-full text-brand-teal-dark">
                        <Upload size={40} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PreviewModal: React.FC<{
  type: string;
  data: any;
  onClose: () => void;
}> = ({ type, data, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl min-h-[80vh] flex flex-col relative" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-all z-10"
        >
          <X size={24} />
        </button>

        <div className="flex-1 overflow-y-auto p-8 sm:p-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header / Meta */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-brand-teal/10 text-brand-teal-dark rounded-full text-xs font-bold uppercase tracking-wider">
                  {data.category || type}
                </span>
                <span className="text-gray-400 text-sm">•</span>
                <span className="text-gray-500 text-sm font-medium">
                  {data.date || data.createdAt || new Date().toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-brand-navy leading-tight">
                {data.title || data.name || data.mayorName || data.attractionName || 'Untitled Content'}
              </h1>
              {data.author && (
                <p className="text-gray-600 font-medium">By <span className="text-brand-teal-dark font-bold">{data.author}</span></p>
              )}
            </div>

            {/* Featured Image */}
            {(data.image || data.featuredImage || data.photo || (data.images && data.images[0])) && (
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <img 
                  src={data.image || data.featuredImage || data.photo || data.images[0]} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Content Body */}
            <div className="prose prose-brand max-w-none">
              <div 
                className="rich-text-content text-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.content || data.message || data.description || data.summary || data.biography || 'No content provided.' }}
              />
              
              {data.detailedDescription && (
                <div 
                  className="mt-8 pt-8 border-t border-gray-100 text-gray-700 h-full"
                  dangerouslySetInnerHTML={{ __html: data.detailedDescription }}
                />
              )}
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
              {data.location && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</p>
                  <p className="text-gray-900 font-medium flex items-center space-x-2">
                    <MapPin size={16} className="text-brand-teal-dark" />
                    <span>{data.location}</span>
                  </p>
                </div>
              )}
              {data.term && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Term of Office</p>
                  <p className="text-gray-900 font-medium">{data.term}</p>
                </div>
              )}
              {data.tags && data.tags.length > 0 && (
                <div className="sm:col-span-2 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-center">
          <p className="text-sm text-gray-500 font-medium italic">This is a preview of how the content will appear on the public website.</p>
        </div>
      </div>
    </div>
  );
};



const VideoUploadField: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
}> = ({ label, value, onChange, error }) => {
  const { addMedia } = useCMS();
  const [uploading, setUploading] = useState(false);
  const [isExternal, setIsExternal] = useState(value.startsWith('http') && !value.includes('blob:'));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        const newMedia: MediaItem = {
          id: `vid-${Date.now()}`,
          name: file.name,
          url: url,
          type: 'video',
          category: 'Hero Videos',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'published',
          author: 'Admin',
          language: 'en',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: file.type
        };
        addMedia(newMedia);
        onChange(url);
        setUploading(false);
        setIsExternal(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-gray-700 flex items-center space-x-2">
        <Video size={16} className="text-[#0A1F44]" />
        <span>{label}</span>
      </label>
      
      <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 transition-all hover:border-[#00E5FF]/50 relative">
        {!value || uploading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {uploading ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 border-4 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-[#0A1F44]">Uploading Video...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                  <Upload size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">Click to upload MP4/WebM</p>
                  <p className="text-xs text-gray-500 mt-1">Maximum file size: 50MB</p>
                </div>
                <input 
                  type="file" 
                  accept="video/mp4,video/webm" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                />
              </>
            )}
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
            <video src={value} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <button 
                onClick={() => onChange('')}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <CheckCircle2 size={14} className="text-[#00E5FF]" />
                <span className="text-[10px] text-white font-bold truncate max-w-[150px]">
                  {isExternal ? 'External URL' : 'Uploaded Video'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <InputField 
          label="External Video URL" 
          value={isExternal ? value : ''} 
          onChange={(v) => {
            onChange(v);
            setIsExternal(true);
          }} 
          placeholder="https://example.com/video.mp4"
          error={isExternal ? error : undefined}
        />
      </div>
    </div>
  );
};

const ImageUploadField: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
}> = ({ label, value, onChange }) => {
  const { media, addMedia } = useCMS();
  const [isOpen, setIsOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const newMedia: MediaItem = {
          id: `img-${Date.now()}`,
          name: file.name,
          url: base64,
          type: 'image',
          category: 'Hero Fallbacks',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'published',
          author: 'Admin',
          language: 'en',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          mimeType: file.type
        };
        await addMedia(newMedia);
        onChange(base64);
      } catch (err) {
        console.error('Image conversion error', err);
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-gray-700 flex items-center space-x-2">
        <ImageIcon size={16} className="text-[#0A1F44]" />
        <span>{label}</span>
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative aspect-video bg-gray-100 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden group flex items-center justify-center">
          {value ? (
            <>
              <img src={value} className="w-full h-full object-cover" alt="Preview" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <button 
                  onClick={() => setIsOpen(true)}
                  className="bg-white text-[#0A1F44] p-2 rounded-lg hover:bg-[#00E5FF] transition-colors"
                >
                  <Search size={20} />
                </button>
                <button 
                  onClick={() => onChange('')}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-gray-400">
              <Upload size={24} />
              <span className="text-xs font-bold">Upload Image</span>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-3">
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0A1F44] hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
          >
            <ImageIcon size={18} />
            <span>Browse Library</span>
          </button>
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Select a high-resolution image (1920x1080) to ensure the hero section looks great on all screens.
          </p>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#0A1F44]">Media Library</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {media.filter(m => m.type === 'image').map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      onChange(item.url);
                      setIsOpen(false);
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${value === item.url ? 'border-[#00E5FF] ring-2 ring-[#00E5FF]/20' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                    {value === item.url && (
                      <div className="absolute top-2 right-2 bg-[#00E5FF] text-[#0A1F44] p-1 rounded-full">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ListField: React.FC<{
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}> = ({ label, items, onChange, placeholder }) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange((items || []).filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</label>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal text-xs font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <button 
          type="button"
          onClick={addItem}
          className="px-4 py-3 bg-brand-teal/10 dark:bg-brand-teal/20 text-slate-900 dark:text-brand-teal border border-transparent dark:border-brand-teal/20 rounded-xl hover:bg-brand-teal/20 dark:hover:bg-brand-teal/30 transition-all font-bold text-xs flex items-center justify-center"
        >
          <Plus size={16} className="stroke-[2.5]" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {(items || []).map((item, i) => (
          <div key={i} className="flex items-center space-x-2 bg-slate-50 dark:bg-[#030914] border border-slate-150 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-705 dark:text-slate-200">
            <span>{item}</span>
            <button type="button" onClick={() => removeItem(i)} className="text-slate-400 hover:text-rose-500 dark:text-slate-550 dark:hover:text-rose-400 transition-colors">
              <X size={12} className="stroke-[2.5]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FormStatus: React.FC<{
  success: boolean;
  message: string;
  subMessage?: string;
}> = ({ success, message, subMessage }) => {
  if (!success) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between mb-6"
    >
      <div className="flex items-center space-x-3">
        <div className="p-1 bg-emerald-100 rounded-full text-emerald-600">
          <Check size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800">{message}</p>
          {subMessage && <p className="text-xs text-emerald-600">{subMessage}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// --- News & Announcements Form ---
export const NewsForm: React.FC<FormProps<NewsAnnouncement>> = ({ initialData = {}, onCancel })  => { 
  const { addNews, updateNews, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<NewsAnnouncement>>(initialData || {
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Announcement',
    content: '',
    image: '',
    tags: [],
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const validate = (dataToValidate = formData) => {
    const newErrors: Record<string, string> = {};
    if (!dataToValidate.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (dataToValidate.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    // Strip HTML tags for clean rich text length/empty validation
    const cleanContent = dataToValidate.content ? dataToValidate.content.replace(/<[^>]*>/g, '').trim() : '';
    if (!cleanContent) {
      newErrors.content = 'Content is required';
    } else if (cleanContent.length < 20) {
      newErrors.content = 'Content must be at least 20 characters';
    }
    
    if (!dataToValidate.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(dataToValidate.date);
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = 'Invalid date format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof NewsAnnouncement, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (hasSubmitted) {
        validate(updated);
      }
      return updated;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    setHasSubmitted(true);
    if (validate()) {
      try {
        if (!initialData) {
          await addNews(formData as Omit<NewsAnnouncement, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateNews(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit News' : 'Add News'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="News saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField label="Title" value={formData.title || ''} onChange={(v) => handleChange('title', v)} required error={errors.title} maxLength={100} />
          </div>
          <InputField label="Date" type="date" value={formData.date || ''} onChange={(v) => handleChange('date', v)} required error={errors.date} />
          <SelectField 
            label="Category" 
            value={formData.category || ''} 
            onChange={(v) => handleChange('category', v)} 
            options={[
              { value: 'Press Release', label: 'Press Release' },
              { value: 'Announcement', label: 'Announcement' },
              { value: 'Event', label: 'Event' },
              { value: 'Infrastructure', label: 'Infrastructure' },
              { value: 'Environment', label: 'Environment' }
            ]}
          />
          <div className="md:col-span-2">
            <InputField label="Content" value={formData.content || ''} onChange={(v) => handleChange('content', v)} rich required error={errors.content} />
          </div>
          <div className="md:col-span-2">
            <MediaPicker label="Featured Image" value={formData.image || ''} onChange={(v) => handleChange('image', v)} />
          </div>
          <ListField label="Tags" items={formData.tags || []} onChange={(v) => handleChange('tags', v)} placeholder="Add tag..." />
          <SelectField 
            label="Language" 
            value={formData.language || 'en'} 
            onChange={(v) => handleChange('language', v)} 
            options={LANGUAGES.map(l => ({ value: l.code, label: l.name }))}
          />
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
          <div className="md:col-span-2">
            <SEOSection data={formData} onChange={(updates) => setFormData(prev => ({...prev, ...updates}))} />
          </div>
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="News" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Pinned Announcements Form ---
export const PinnedForm: React.FC<FormProps<PinnedAnnouncement>> = ({ initialData, onCancel }) => {
  const { addPinned, updatePinned, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<PinnedAnnouncement>>(initialData || {
    title: '',
    message: '',
    type: 'Notice',
    expiryDate: '',
    priority: 'Medium',
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof PinnedAnnouncement, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.message) newErrors.message = 'Message is required';
    else if (formData.message.length < 10) newErrors.message = 'Message must be at least 10 characters';
    
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    else {
      const expiry = new Date(formData.expiryDate);
      if (expiry < new Date()) newErrors.expiryDate = 'Expiry date cannot be in the past';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addPinned(formData as Omit<PinnedAnnouncement, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updatePinned(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Pinned Announcement' : 'Add Pinned Announcement'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Announcement saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField label="Title" value={formData.title || ''} onChange={(v) => handleChange('title', v)} required error={errors.title} maxLength={100} />
          </div>
          <div className="md:col-span-2">
            <InputField label="Message" value={formData.message || ''} onChange={(v) => handleChange('message', v)} multiline required error={errors.message} maxLength={500} />
          </div>
          <SelectField 
            label="Type" 
            value={formData.type || 'Notice'} 
            onChange={(v) => handleChange('type', v)} 
            options={[
              { value: 'Tender', label: 'Tender' },
              { value: 'Vacancy', label: 'Vacancy' },
              { value: 'Notice', label: 'Notice' },
              { value: 'Service Update', label: 'Service Update' }
            ]}
          />
          <InputField label="Expiry Date" type="date" value={formData.expiryDate || ''} onChange={(v) => handleChange('expiryDate', v)} required error={errors.expiryDate} />
          <SelectField 
            label="Priority" 
            value={formData.priority || 'Medium'} 
            onChange={(v) => handleChange('priority', v)} 
            options={[
              { value: 'High', label: 'High' },
              { value: 'Medium', label: 'Medium' },
              { value: 'Low', label: 'Low' }
            ]}
          />
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
          <div className="md:col-span-2">
            <MediaPicker label="Announcement Image (Optional)" value={formData.image || ''} onChange={(v) => handleChange('image', v)} />
          </div>
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Pinned Announcement" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Mayoral History Form ---
export const MayoralHistoryForm: React.FC<FormProps<MayoralHistory>> = ({ initialData, onCancel }) => {
  const { addMayoralHistory, updateMayoralHistory, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<MayoralHistory>>(initialData || {
    mayorName: '',
    photo: '',
    term: '',
    summary: '',
    detailedDescription: '',
    stakeholders: [],
    achievements: [],
    challenges: [],
    kpis: [],
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof MayoralHistory, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mayorName) newErrors.mayorName = 'Mayor name is required';
    if (!formData.term) newErrors.term = 'Term is required';
    else if (!/^\d{4}\s*-\s*(\d{4}|Present)$/.test(formData.term)) newErrors.term = 'Format: YYYY - YYYY or YYYY - Present';
    
    if (!formData.summary) newErrors.summary = 'Summary is required';
    else if (formData.summary.length < 50) newErrors.summary = 'Summary must be at least 50 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addMayoralHistory(formData as Omit<MayoralHistory, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateMayoralHistory(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Mayoral Entry' : 'Add Mayoral Entry'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Mayoral entry saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Mayor Name" value={formData.mayorName || ''} onChange={(v) => handleChange('mayorName', v)} required error={errors.mayorName} maxLength={50} />
          <InputField label="Term (e.g. 2015-2022)" value={formData.term || ''} onChange={(v) => handleChange('term', v)} required error={errors.term} placeholder="2015 - 2022" />
          <div className="md:col-span-2">
            <MediaPicker label="Mayor Photo" value={formData.photo || ''} onChange={(v) => handleChange('photo', v)} />
          </div>
          <div className="md:col-span-2">
            <InputField label="Summary" value={formData.summary || ''} onChange={(v) => handleChange('summary', v)} multiline required error={errors.summary} maxLength={500} />
          </div>
          <div className="md:col-span-2">
            <InputField label="Detailed Description" value={formData.detailedDescription || ''} onChange={(v) => handleChange('detailedDescription', v)} multiline required maxLength={5000} />
          </div>
          <ListField label="Key Stakeholders" items={formData.stakeholders || []} onChange={(v) => handleChange('stakeholders', v)} placeholder="Add stakeholder..." />
          <ListField label="Achievements" items={formData.achievements || []} onChange={(v) => handleChange('achievements', v)} placeholder="Add achievement..." />
          <ListField label="Challenges" items={formData.challenges || []} onChange={(v) => handleChange('challenges', v)} placeholder="Add challenge..." />
          <ListField label="KPIs / Outcomes" items={formData.kpis || []} onChange={(v) => handleChange('kpis', v)} placeholder="Add KPI..." />
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Mayoral History" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Leadership Profiles Form ---
export const LeadershipForm: React.FC<FormProps<LeadershipProfile>> = ({ initialData, onCancel }) => {
  const { addLeadership, updateLeadership, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<LeadershipProfile>>(initialData || {
    name: '',
    title: '',
    department: '',
    photo: '',
    biography: '',
    responsibilities: [],
    email: '',
    phone: '',
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof LeadershipProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.title) newErrors.title = 'Title is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (formData.phone && !/^\+?[\d\s-]{8,20}$/.test(formData.phone)) newErrors.phone = 'Invalid phone format';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addLeadership(formData as Omit<LeadershipProfile, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateLeadership(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Profile' : 'Add Profile'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Profile saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Full Name" value={formData.name || ''} onChange={(v) => handleChange('name', v)} required error={errors.name} maxLength={60} />
          <InputField label="Title / Role" value={formData.title || ''} onChange={(v) => handleChange('title', v)} required error={errors.title} maxLength={80} />
          <InputField label="Department" value={formData.department || ''} onChange={(v) => handleChange('department', v)} maxLength={100} />
          <div className="md:col-span-2">
            <MediaPicker label="Profile Photo" value={formData.photo || ''} onChange={(v) => handleChange('photo', v)} />
          </div>
          <div className="md:col-span-2">
            <InputField label="Biography" value={formData.biography || ''} onChange={(v) => handleChange('biography', v)} multiline required maxLength={2000} />
          </div>
          <div className="md:col-span-2">
            <ListField label="Responsibilities" items={formData.responsibilities || []} onChange={(v) => handleChange('responsibilities', v)} placeholder="Add responsibility..." />
          </div>
          <InputField label="Email" type="email" value={formData.email || ''} onChange={(v) => handleChange('email', v)} required error={errors.email} />
          <InputField label="Phone" value={formData.phone || ''} onChange={(v) => handleChange('phone', v)} required error={errors.phone} />
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Leadership Profile" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Services Form ---
export const ServiceForm: React.FC<FormProps<Service>> = ({ initialData, onCancel }) => {
  const { addService, updateService, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<Service>>(initialData || {
    name: '',
    description: '',
    requirements: [],
    process: '',
    contactInfo: '',
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof Service, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Service name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    else if (formData.description.length < 30) newErrors.description = 'Description must be at least 30 characters';
    
    if (!formData.process) newErrors.process = 'Process is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addService(formData as Omit<Service, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateService(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Service' : 'Add Service'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Service saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 gap-6">
          <InputField label="Service Name" value={formData.name || ''} onChange={(v) => handleChange('name', v)} required error={errors.name} maxLength={100} />
          <InputField label="Description" value={formData.description || ''} onChange={(v) => handleChange('description', v)} multiline required error={errors.description} maxLength={1000} />
          <ListField label="Requirements" items={formData.requirements || []} onChange={(v) => handleChange('requirements', v)} placeholder="Add requirement..." />
          <InputField label="Step-by-Step Process" value={formData.process || ''} onChange={(v) => handleChange('process', v)} multiline required error={errors.process} maxLength={2000} />
          <InputField label="Contact Information" value={formData.contactInfo || ''} onChange={(v) => handleChange('contactInfo', v)} multiline required maxLength={500} />
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Service" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Initiatives Form ---
export const InitiativeForm: React.FC<FormProps<Initiative>> = ({ initialData, onCancel }) => {
  const { addInitiative, updateInitiative, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<Initiative>>(initialData || {
    title: '',
    description: '',
    category: 'Infrastructure',
    currentStatus: 'Planned',
    timeline: '',
    impact: '',
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof Initiative, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addInitiative(formData as Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateInitiative(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Initiative' : 'Add Initiative'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Initiative saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField label="Title" value={formData.title || ''} onChange={(v) => handleChange('title', v)} required error={errors.title} maxLength={120} />
          </div>
          <div className="md:col-span-2">
            <InputField label="Description" value={formData.description || ''} onChange={(v) => handleChange('description', v)} multiline required error={errors.description} maxLength={1000} />
          </div>
          <SelectField 
            label="Category" 
            value={formData.category || 'Infrastructure'} 
            onChange={(v) => handleChange('category', v)} 
            options={[
              { value: 'Smart City', label: 'Smart City' },
              { value: 'Infrastructure', label: 'Infrastructure' },
              { value: 'Community', label: 'Community' },
              { value: 'Environment', label: 'Environment' }
            ]}
          />
          <SelectField 
            label="Current Status" 
            value={formData.currentStatus || 'Planned'} 
            onChange={(v) => handleChange('currentStatus', v)} 
            options={[
              { value: 'Planned', label: 'Planned' },
              { value: 'Ongoing', label: 'Ongoing' },
              { value: 'Completed', label: 'Completed' }
            ]}
          />
          <InputField label="Timeline" value={formData.timeline || ''} onChange={(v) => handleChange('timeline', v)} placeholder="e.g. 2024 - 2026" maxLength={50} />
          <div className="md:col-span-2">
            <InputField label="Impact / Outcomes" value={formData.impact || ''} onChange={(v) => handleChange('impact', v)} multiline maxLength={1000} />
          </div>
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
          <div className="md:col-span-2">
            <MediaPicker label="Featured Initiative Image (Optional)" value={formData.image || ''} onChange={(v) => handleChange('image', v)} />
          </div>
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Initiative" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Events Form ---
export const EventForm: React.FC<FormProps<Event>> = ({ initialData, onCancel }) => {
  const { addEvent, updateEvent, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<Event>>(initialData || {
    title: '',
    date: '',
    location: '',
    description: '',
    category: 'General',
    image: '',
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date & Time is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.description) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addEvent(formData as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateEvent(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Event' : 'Add Event'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Event saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField label="Title" value={formData.title || ''} onChange={(v) => handleChange('title', v)} required error={errors.title} maxLength={100} />
          </div>
          <InputField label="Date & Time" type="datetime-local" value={formData.date || ''} onChange={(v) => handleChange('date', v)} required error={errors.date} />
          <InputField label="Location" value={formData.location || ''} onChange={(v) => handleChange('location', v)} required error={errors.location} maxLength={150} />
          <div className="md:col-span-2">
            <InputField label="Description" value={formData.description || ''} onChange={(v) => handleChange('description', v)} multiline required error={errors.description} maxLength={2000} />
          </div>
          <SelectField 
            label="Category" 
            value={formData.category || 'General'} 
            onChange={(v) => handleChange('category', v)} 
            options={[
              { value: 'General', label: 'General' },
              { value: 'Culture', label: 'Culture' },
              { value: 'Business', label: 'Business' },
              { value: 'Sports', label: 'Sports' }
            ]}
          />
          <MediaPicker label="Event Image" value={formData.image || ''} onChange={(v) => handleChange('image', v)} />
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Event" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Documents Form ---
export const DocumentForm: React.FC<FormProps<DocumentPublication>> = ({ initialData, onCancel }) => {
  const { addDocument, updateDocument, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<DocumentPublication>>(initialData || {
    title: '',
    category: 'Report',
    date: new Date().toISOString().split('T')[0],
    fileUrl: '',
    description: '',
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof DocumentPublication, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.fileUrl) newErrors.fileUrl = 'File is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addDocument(formData as Omit<DocumentPublication, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateDocument(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Document' : 'Add Document'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Document saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField label="Title" value={formData.title || ''} onChange={(v) => handleChange('title', v)} required error={errors.title} maxLength={150} />
          </div>
          <SelectField 
            label="Category" 
            value={formData.category || 'Report'} 
            onChange={(v) => handleChange('category', v)} 
            options={[
              { value: 'Report', label: 'Report' },
              { value: 'Budget', label: 'Budget' },
              { value: 'Policy', label: 'Policy' },
              { value: 'Legal', label: 'Legal' }
            ]}
          />
          <InputField label="Date" type="date" value={formData.date || ''} onChange={(v) => handleChange('date', v)} required error={errors.date} />
          <div className="md:col-span-2">
            <InputField label="File URL (PDF/DOC)" value={formData.fileUrl || ''} onChange={(v) => handleChange('fileUrl', v)} placeholder="https://..." required error={errors.fileUrl} />
          </div>
          <div className="md:col-span-2">
            <InputField label="Description" value={formData.description || ''} onChange={(v) => handleChange('description', v)} multiline maxLength={500} />
          </div>
          <SelectField 
            label="Alternative Document Icon Type" 
            value={formData.altIcon || 'FileText'} 
            onChange={(v) => handleChange('altIcon', v)} 
            options={[
              { value: 'FileText', label: 'Standard PDF / Word Document' },
              { value: 'FileSpreadsheet', label: 'Financial Spreadsheet (Excel/CSV)' },
              { value: 'Scale', label: 'Legal Gazette / Resolution' },
              { value: 'Award', label: 'Official Seal / Approved Stamp' },
              { value: 'FolderArchive', label: 'Zip Archive / Bundle' }
            ]}
          />
          <div className="md:col-span-2">
            <MediaPicker label="Optional Document Cover Image" value={formData.coverImage || ''} onChange={(v) => handleChange('coverImage', v)} />
          </div>
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Document" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Tourism Form ---
export const TourismForm: React.FC<FormProps<TourismContent>> = ({ initialData, onCancel }) => {
  const { addTourism, updateTourism, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<TourismContent>>(initialData || {
    attractionName: '',
    description: '',
    location: '',
    images: [],
    category: 'Landmark',
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof TourismContent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.attractionName) newErrors.attractionName = 'Attraction name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.description) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addTourism(formData as Omit<TourismContent, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateTourism(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Attraction' : 'Add Attraction'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Attraction saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Attraction Name" value={formData.attractionName || ''} onChange={(v) => handleChange('attractionName', v)} required error={errors.attractionName} maxLength={100} />
          <InputField label="Location" value={formData.location || ''} onChange={(v) => handleChange('location', v)} required error={errors.location} maxLength={150} />
          <div className="md:col-span-2">
            <InputField label="Description" value={formData.description || ''} onChange={(v) => handleChange('description', v)} multiline required error={errors.description} maxLength={1500} />
          </div>
          <SelectField 
            label="Category" 
            value={formData.category || 'Landmark'} 
            onChange={(v) => handleChange('category', v)} 
            options={[
              { value: 'Nature', label: 'Nature' },
              { value: 'Culture', label: 'Culture' },
              { value: 'Landmark', label: 'Landmark' },
              { value: 'Resort', label: 'Resort' }
            ]}
          />
          <div className="md:col-span-2 space-y-4">
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 block">Attraction Images</label>
            {formData.images && formData.images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {formData.images.map((imgUrl, i) => (
                  <div key={i} className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleChange('images', formData.images?.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-0.5 bg-rose-500 rounded-full text-white hover:bg-rose-700 transition"
                    >
                      <X size={10} className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <MediaPicker 
              label="Add Attraction Picture" 
              value="" 
              onChange={(v) => {
                if (v && !formData.images?.includes(v)) {
                  handleChange('images', [...(formData.images || []), v]);
                }
              }} 
            />
          </div>
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Tourism" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Blog Form ---
export const BlogForm: React.FC<FormProps<BlogEntry>> = ({ initialData, onCancel }) => {
  const { addBlog, updateBlog, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<BlogEntry>>(initialData || {
    title: '',
    author: '',
    category: 'General',
    content: '',
    featuredImage: '',
    tags: [],
    status: 'draft',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const validate = (dataToValidate = formData) => {
    const newErrors: Record<string, string> = {};
    if (!dataToValidate.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (dataToValidate.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!dataToValidate.author?.trim()) {
      newErrors.author = 'Author is required';
    }
    
    // Strip HTML tags for clean rich text length/empty validation
    const cleanContent = dataToValidate.content ? dataToValidate.content.replace(/<[^>]*>/g, '').trim() : '';
    if (!cleanContent) {
      newErrors.content = 'Content is required';
    } else if (cleanContent.length < 50) {
      newErrors.content = 'Blog content must be at least 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof BlogEntry, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (hasSubmitted) {
        validate(updated);
      }
      return updated;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    setHasSubmitted(true);
    if (validate()) {
      try {
        if (!initialData) {
          await addBlog(formData as Omit<BlogEntry, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateBlog(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Blog Post' : 'Add Blog Post'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        onPreview={() => setShowPreview(true)}
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Blog post saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <InputField label="Title" value={formData.title || ''} onChange={(v) => handleChange('title', v)} required error={errors.title} maxLength={120} />
          </div>
          <InputField label="Author" value={formData.author || ''} onChange={(v) => handleChange('author', v)} required error={errors.author} />
          <SelectField 
            label="Category" 
            value={formData.category || 'General'} 
            onChange={(v) => handleChange('category', v)} 
            options={[
              { value: 'General', label: 'General' },
              { value: 'Urban Development', label: 'Urban Development' },
              { value: 'Community', label: 'Community' },
              { value: 'Economy', label: 'Economy' }
            ]}
          />
          <div className="md:col-span-2">
            <InputField label="Content" value={formData.content || ''} onChange={(v) => handleChange('content', v)} rich required error={errors.content} />
          </div>
          <div className="md:col-span-2">
            <MediaPicker label="Featured Image" value={formData.featuredImage || ''} onChange={(v) => handleChange('featuredImage', v)} />
          </div>
          <ListField label="Tags" items={formData.tags || []} onChange={(v) => handleChange('tags', v)} placeholder="Add tag..." />
          <SelectField 
            label="Status" 
            value={formData.status || 'draft'} 
            onChange={(v) => handleChange('status', v)} 
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'review', label: 'Review' },
              { value: 'published', label: 'Published' }
            ]}
          />
          <div className="md:col-span-2">
            <SEOSection data={formData} onChange={(updates) => setFormData(prev => ({...prev, ...updates}))} />
          </div>
        </div>
      </FormWrapper>
      {showPreview && <PreviewModal type="Blog Post" data={formData} onClose={() => setShowPreview(false)} />}
    </>
  );
};

// --- Media Library Form ---
export const MediaForm: React.FC<FormProps<MediaItem>> = ({ initialData, onCancel }) => {
  const { addMedia, updateMedia, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<MediaItem>>(initialData || {
    name: '',
    url: '',
    type: 'image',
    category: 'General',
    altText: '',
    size: '',
    status: 'published',
    language: 'en'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof MediaItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'File name is required';
    if (!formData.url) newErrors.url = 'File URL or upload is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsDirty(true);
    try {
      const base64 = await fileToBase64(file);
      setFormData(prev => ({
        ...prev,
        name: file.name,
        url: base64,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        mimeType: file.type
      }));
    } catch (err) {
      console.error('Media upload error', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addMedia(formData as Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateMedia(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 2000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <FormWrapper 
      title={initialData ? 'Edit Media Info' : 'Upload Media'} 
      onSave={handleSave} 
      onCancel={handleCancel} 
      errors={cmsError ? { api: cmsError, ...errors } : errors}
      isLoading={cmsLoading}
    >
      <FormStatus success={saveSuccess} message="Media saved successfully!" subMessage="Returning to list..." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 bg-gray-50/50 hover:bg-gray-50 transition-all group relative">
            <div className={`p-4 rounded-full ${isUploading ? 'bg-brand-teal/10 text-brand-teal-dark animate-pulse' : 'bg-gray-100 text-gray-400 group-hover:text-brand-teal-dark group-hover:bg-brand-teal/10'} transition-all`}>
              {isUploading ? <Upload size={32} /> : <ImageIcon size={32} />}
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-700">{isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 or PDF (max. 10MB)</p>
            </div>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <InputField label="File Name" value={formData.name || ''} onChange={(v) => handleChange('name', v)} required error={errors.name} />
        </div>
        <InputField label="File URL" value={formData.url || ''} onChange={(v) => handleChange('url', v)} placeholder="https://..." required error={errors.url} />
        <SelectField 
          label="Type" 
          value={formData.type || 'image'} 
          onChange={(v) => handleChange('type', v)} 
          options={[
            { value: 'image', label: 'Image' },
            { value: 'video', label: 'Video' },
            { value: 'document', label: 'Document' }
          ]}
        />
        <InputField label="Category" value={formData.category || ''} onChange={(v) => handleChange('category', v)} required error={errors.category} />
        <InputField label="Alt Text (Accessibility)" value={formData.altText || ''} onChange={(v) => handleChange('altText', v)} />
        <InputField label="File Size" value={formData.size || ''} onChange={(v) => handleChange('size', v)} placeholder="e.g. 1.5 MB" />
        <SelectField 
          label="Status" 
          value={formData.status || 'published'} 
          onChange={(v) => handleChange('status', v)} 
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'Review' },
            { value: 'published', label: 'Published' }
          ]}
        />
      </div>
    </FormWrapper>
  );
};

export const HeroVideoForm: React.FC<FormProps<HeroVideoConfig>> = ({ initialData, onCancel }) => {
  const { updateHeroVideo, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<HeroVideoConfig>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof HeroVideoConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.videoUrl) newErrors.videoUrl = 'Video URL is required';
    if (!formData.title) newErrors.title = 'Headline title is required';
    if (!formData.ctaText) newErrors.ctaText = 'CTA text is required';
    if (!formData.ctaLink) newErrors.ctaLink = 'CTA link is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        await updateHeroVideo(formData);
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const getOpacityClass = (opacity: string) => {
    switch (opacity) {
      case 'light': return 'bg-black/30';
      case 'medium': return 'bg-black/50';
      case 'strong': return 'bg-black/70';
      default: return 'bg-black/50';
    }
  };

  const getOverlayStyle = (style: string) => {
    switch (style) {
      case 'dark-gradient': return 'bg-gradient-to-b from-black/60 via-transparent to-black/60';
      case 'brand-tint': return 'bg-[#0A1F44]/40';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
      {/* Form Side */}
      <div className="flex-1">
        <FormWrapper 
          title="Hero Video Configuration" 
          onSave={handleSave} 
          onCancel={handleCancel}
          onPreview={() => setShowPreview(true)}
          errors={cmsError ? { api: cmsError, ...errors } : errors}
          isLoading={cmsLoading}
        >
          <FormStatus success={saveSuccess} message="Hero configuration updated successfully!" />
          <div className="space-y-8 p-6">
            {/* Video Source */}
            <section className="space-y-6">
              <div className="flex items-center space-x-2 text-brand-navy font-bold border-b pb-2">
                <Video size={20} />
                <h3>Video & Visual Assets</h3>
              </div>
              <div className="space-y-8">
                <VideoUploadField 
                  label="Hero Background Video" 
                  value={formData.videoUrl || ''} 
                  onChange={(v) => handleChange('videoUrl', v)} 
                  error={errors.videoUrl}
                />
                
                <ImageUploadField 
                  label="Fallback Image (Static)" 
                  value={formData.fallbackImage || ''} 
                  onChange={(v) => handleChange('fallbackImage', v)} 
                />
                <p className="text-xs text-gray-500 italic">
                  * Fallback image is critical for accessibility and performance on mobile devices.
                </p>
              </div>
            </section>

            {/* Playback Settings */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-brand-navy font-bold border-b pb-2">
                <Settings2 size={20} />
                <h3>Playback Settings</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={formData.autoplay ?? true} 
                    onChange={(e) => handleChange('autoplay', e.target.checked)}
                    className="w-5 h-5 text-brand-teal rounded focus:ring-brand-teal"
                  />
                  <span className="text-sm font-medium text-gray-700">Autoplay</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={formData.mute ?? true} 
                    onChange={(e) => handleChange('mute', e.target.checked)}
                    className="w-5 h-5 text-brand-teal rounded focus:ring-brand-teal"
                  />
                  <span className="text-sm font-medium text-gray-700">Mute Audio</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={formData.loop ?? true} 
                    onChange={(e) => handleChange('loop', e.target.checked)}
                    className="w-5 h-5 text-brand-teal rounded focus:ring-brand-teal"
                  />
                  <span className="text-sm font-medium text-gray-700">Loop Video</span>
                </div>
              </div>
            </section>

            {/* Overlay Settings */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-brand-navy font-bold border-b pb-2">
                <Layers size={20} />
                <h3>Overlay & Visuals</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={formData.showOverlay ?? true} 
                    onChange={(e) => handleChange('showOverlay', e.target.checked)}
                    className="w-5 h-5 text-brand-teal rounded focus:ring-brand-teal"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Overlay</span>
                </div>
                <SelectField 
                  label="Overlay Style" 
                  value={formData.overlayStyle || 'dark-gradient'} 
                  onChange={(v) => handleChange('overlayStyle', v as any)}
                  options={[
                    { value: 'dark-gradient', label: 'Dark Gradient' },
                    { value: 'brand-tint', label: 'Adama Navy Tint' },
                    { value: 'none', label: 'None' }
                  ]}
                />
                <SelectField 
                  label="Overlay Opacity" 
                  value={formData.overlayOpacity || 'medium'} 
                  onChange={(v) => handleChange('overlayOpacity', v as any)}
                  options={[
                    { value: 'light', label: 'Light (30%)' },
                    { value: 'medium', label: 'Medium (50%)' },
                    { value: 'strong', label: 'Strong (70%)' }
                  ]}
                />
              </div>
            </section>

            {/* Headline Content */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-brand-navy font-bold border-b pb-2">
                <Type size={20} />
                <h3>Headline Content</h3>
              </div>
              <div className="space-y-4">
                <InputField 
                  label="Main Title" 
                  value={formData.title || ''} 
                  onChange={(v) => handleChange('title', v)} 
                  placeholder="e.g. Welcome to Adama City"
                  required
                  error={errors.title}
                />
                <InputField 
                  label="Subtitle / Tagline" 
                  value={formData.subtitle || ''} 
                  onChange={(v) => handleChange('subtitle', v)} 
                  placeholder="e.g. The Heart of Ethiopia's Industrial Future"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="CTA Button Text" 
                    value={formData.ctaText || ''} 
                    onChange={(v) => handleChange('ctaText', v)} 
                    placeholder="e.g. Explore Services"
                    required
                    error={errors.ctaText}
                  />
                  <InputField 
                    label="CTA Link" 
                    value={formData.ctaLink || ''} 
                    onChange={(v) => handleChange('ctaLink', v)} 
                    placeholder="/services"
                    required
                    error={errors.ctaLink}
                  />
                </div>
              </div>
            </section>

            {/* Performance */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2 text-brand-navy font-bold border-b pb-2">
                <Zap size={20} />
                <h3>Performance & Optimization</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField 
                  label="Video Quality" 
                  value={formData.videoQuality || 'high'} 
                  onChange={(v) => handleChange('videoQuality', v as any)}
                  options={[
                    { value: 'low', label: 'Low (Optimized for Mobile)' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High (4K/HD)' }
                  ]}
                />
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={formData.lowBandwidthMode ?? false} 
                    onChange={(e) => handleChange('lowBandwidthMode', e.target.checked)}
                    className="w-5 h-5 text-brand-teal rounded focus:ring-brand-teal"
                  />
                  <span className="text-sm font-medium text-gray-700">Low Bandwidth Mode</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    checked={formData.lazyLoad ?? true} 
                    onChange={(e) => handleChange('lazyLoad', e.target.checked)}
                    className="w-5 h-5 text-brand-teal rounded focus:ring-brand-teal"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Lazy Loading</span>
                </div>
              </div>
            </section>
          </div>
        </FormWrapper>
      </div>

      {/* Preview Side */}
      {showPreview && (
        <div className="lg:w-[400px] space-y-6">
          <div className="sticky top-24">
            <div className="bg-brand-navy p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center space-x-2">
                <Eye size={18} className="text-brand-teal" />
                <span>Live Preview</span>
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button 
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-brand-teal text-brand-navy' : 'text-white hover:bg-white/10'}`}
                  >
                    <Monitor size={16} />
                  </button>
                  <button 
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-brand-teal text-brand-navy' : 'text-white hover:bg-white/10'}`}
                  >
                    <Smartphone size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className={`bg-gray-100 border-x border-b border-gray-200 overflow-hidden transition-all duration-500 ${previewMode === 'mobile' ? 'max-w-[320px] mx-auto rounded-b-[40px] border-[8px] border-brand-navy aspect-[9/16]' : 'rounded-b-2xl aspect-video'}`}>
            <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
              {/* Video/Image Layer */}
              {formData.videoUrl ? (
                <video 
                  src={formData.videoUrl} 
                  autoPlay={formData.autoplay} 
                  muted={formData.mute} 
                  loop={formData.loop}
                  preload={formData.videoQuality === 'high' ? 'auto' : formData.videoQuality === 'medium' ? 'metadata' : 'none'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : formData.fallbackImage ? (
                <img 
                  src={formData.fallbackImage} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Fallback" 
                  loading={formData.lazyLoad ? "lazy" : "eager"}
                />
              ) : (
                <div className="text-gray-500 text-xs">No media selected</div>
              )}

              {/* Overlay Layer */}
              {formData.showOverlay && (
                <div className={`absolute inset-0 ${getOpacityClass(formData.overlayOpacity || 'medium')} ${getOverlayStyle(formData.overlayStyle || 'dark-gradient')}`} />
              )}

              {/* Content Layer */}
              <div className="relative z-10 text-center p-6 space-y-4">
                <h1 className={`font-black text-white leading-tight ${previewMode === 'mobile' ? 'text-2xl' : 'text-4xl'}`}>
                  {formData.title || 'Welcome to Adama'}
                </h1>
                <p className={`text-white/90 font-medium ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                  {formData.subtitle || 'The Heart of Ethiopia'}
                </p>
                <button className="bg-brand-teal text-brand-navy px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform">
                  {formData.ctaText || 'Explore'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-brand-teal/10 rounded-xl border border-brand-teal/20">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white rounded-lg text-brand-teal-dark">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">Global Hero Section</p>
                <p className="text-xs text-brand-navy/70 mt-1">Changes made here will affect the main landing page across all languages.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export const SettingsForm: React.FC<FormProps<SiteSettings>> = ({ initialData, onCancel }) => {
  const { updateSiteSettings, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<SiteSettings>>(initialData || { socialLinks: {} });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('socialLinks.')) {
      const platform = field.split('.')[1] as keyof SiteSettings['socialLinks'];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.siteName) newErrors.siteName = 'Site name is required';
    if (!formData.contactEmail) newErrors.contactEmail = 'Contact email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        await updateSiteSettings(formData);
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const [activeTab, setActiveTabInternal] = useState<'general' | 'about' | 'contact' | 'assets' | 'social' | 'visibility'>('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'about', label: 'About & Message', icon: FileText },
    { id: 'visibility', label: 'Visibility', icon: Lock },
    { id: 'contact', label: 'Contact', icon: Briefcase },
    { id: 'assets', label: 'Assets', icon: ImageIcon },
    { id: 'social', label: 'Social', icon: Share2 },
  ];

  return (
    <FormWrapper 
      title="Global Site Settings" 
      onSave={handleSave} 
      onCancel={handleCancel}
      errors={cmsError ? { api: cmsError, ...errors } : errors}
      isLoading={cmsLoading}
    >
      <FormStatus success={saveSuccess} message="Site settings updated successfully!" />
      
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabInternal(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-brand-navy shadow-sm' 
                  : 'text-gray-500 hover:text-brand-navy'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8">
            {activeTab === 'visibility' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-brand-navy border-b pb-4">
                  <div className="p-2 bg-brand-navy/5 rounded-lg">
                    <Lock size={20} />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Site Visibility</h3>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-black text-brand-navy text-lg">Maintenance Mode</p>
                    <p className="text-sm text-gray-500 font-medium">When enabled, public visitors will see a professional maintenance page.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleChange('maintenanceMode', !formData.maintenanceMode)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-4 ring-offset-2 ring-transparent ${formData.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${formData.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'about' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-brand-navy border-b pb-4">
                  <div className="p-2 bg-brand-navy/5 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">About Adama & Mayor's Message</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <InputField 
                    label="About Us / City History (Rich Text)" 
                    value={formData.aboutUs || ''} 
                    onChange={(v) => handleChange('aboutUs', v)} 
                    rich
                    placeholder="Provide a detailed overview of Adama City, history, geography, and strategic goals..."
                  />
                  
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/60 my-4 space-y-4">
                    <h4 className="font-black text-brand-navy text-sm uppercase tracking-wider">City Key Statistics & Indicators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField 
                        label="Established" 
                        value={formData.established || ''} 
                        onChange={(v) => handleChange('established', v)} 
                        placeholder="e.g. 1924 GC"
                      />
                      <InputField 
                        label="Total Area" 
                        value={formData.area || ''} 
                        onChange={(v) => handleChange('area', v)} 
                        placeholder="e.g. 58,109 ha"
                      />
                      <InputField 
                        label="Altitude" 
                        value={formData.altitude || ''} 
                        onChange={(v) => handleChange('altitude', v)} 
                        placeholder="e.g. 1,712 m asl"
                      />
                      <InputField 
                        label="Avg Climate" 
                        value={formData.avgClimate || ''} 
                        onChange={(v) => handleChange('avgClimate', v)} 
                        placeholder="e.g. 22°C"
                      />
                      <InputField 
                        label="Population" 
                        value={formData.population || ''} 
                        onChange={(v) => handleChange('population', v)} 
                        placeholder="e.g. 1M+"
                      />
                      <InputField 
                        label="Administrative Structure" 
                        value={formData.administrativeStructure || ''} 
                        onChange={(v) => handleChange('administrativeStructure', v)} 
                        placeholder="e.g. 32 Sectors, 6 Sub-Cities, 19 Woredas"
                      />
                    </div>
                  </div>

                  <div className="bg-teal-50/35 p-6 rounded-3xl border border-teal-100/70 my-4 space-y-4">
                    <h4 className="font-black text-brand-navy text-sm uppercase tracking-wider flex items-center space-x-2">
                      <span className="w-2   h-2 rounded-full bg-brand-teal animate-pulse" />
                      <span>Vision, Mission, & Mandate Declarations</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      <InputField 
                        label="Vision Statement (Official Metropolises Target)" 
                        value={formData.vision || ''} 
                        onChange={(v) => handleChange('vision', v)} 
                        multiline 
                        rows={3}
                        placeholder="To transform Adama into a highly sustainable, self-reliant, digitally integrated smart metropolis in East Africa..."
                      />
                      <InputField 
                        label="Mission Statement" 
                        value={formData.mission || ''} 
                        onChange={(v) => handleChange('mission', v)} 
                        multiline 
                        rows={3}
                        placeholder="To deliver exceptional municipal services, modernize administrative operations, safeguard social welfare..."
                      />
                      <InputField 
                        label="Official Mandate" 
                        value={formData.mandate || ''} 
                        onChange={(v) => handleChange('mandate', v)} 
                        multiline 
                        rows={3}
                        placeholder="Execute municipal policies, supervise legal and developmental compliances across sub-cities and woredas..."
                      />
                    </div>
                  </div>

                  <hr className="border-slate-100 my-4" />
                  <InputField 
                    label="Mayor's Official Message (Rich Text)" 
                    value={formData.mayorsMessage || ''} 
                    onChange={(v) => handleChange('mayorsMessage', v)} 
                    rich
                    placeholder="Welcome statement from the Honorable Mayor to citizens, visitors, and investors..."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                      label="Mayor's Full Name & Title" 
                      value={formData.mayorsMessageAuthor || ''} 
                      onChange={(v) => handleChange('mayorsMessageAuthor', v)} 
                      placeholder="e.g. Mayor Hailu Kemal"
                    />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Mayor's Official Portrait</p>
                      <MediaPicker 
                        label="" 
                        value={formData.mayorsMessagePhoto || ''} 
                        onChange={(v) => handleChange('mayorsMessagePhoto', v)} 
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'general' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-brand-navy border-b pb-4">
                  <div className="p-2 bg-brand-navy/5 rounded-lg">
                    <Globe size={20} />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Identity & Branding</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <InputField 
                    label="Legal Entity Name" 
                    value={formData.siteName || ''} 
                    onChange={(v) => handleChange('siteName', v)} 
                    required
                    error={errors.siteName}
                    placeholder="e.g. Adama City Administration"
                  />
                  <InputField 
                    label="Site Description" 
                    value={formData.siteDescription || ''} 
                    onChange={(v) => handleChange('siteDescription', v)} 
                    multiline
                    placeholder="Official description for search engines and footer..."
                  />
                  <InputField 
                    label="Footer Copyright" 
                    value={formData.footerText || ''} 
                    onChange={(v) => handleChange('footerText', v)} 
                    placeholder="e.g. © 2024 Adama City Admin. All Rights Reserved."
                  />
                </div>
              </section>
            )}

            {activeTab === 'contact' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-brand-navy border-b pb-4">
                  <div className="p-2 bg-brand-navy/5 rounded-lg">
                    <Briefcase size={20} />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Nexus Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Primary Contact Email" 
                    value={formData.contactEmail || ''} 
                    onChange={(v) => handleChange('contactEmail', v)} 
                    required
                    error={errors.contactEmail}
                    placeholder="info@adama.gov.et"
                  />
                  <InputField 
                    label="Contact Hotline" 
                    value={formData.contactPhone || ''} 
                    onChange={(v) => handleChange('contactPhone', v)} 
                    placeholder="+251-XXX-XXXXXX"
                  />
                  <div className="md:col-span-2">
                    <InputField 
                      label="HQ physical Address" 
                      value={formData.address || ''} 
                      onChange={(v) => handleChange('address', v)} 
                      placeholder="Main Street, Building 4, Adama..."
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'assets' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-brand-navy border-b pb-4">
                  <div className="p-2 bg-brand-navy/5 rounded-lg">
                    <ImageIcon size={20} />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Global Assets</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Primary Logo</p>
                    <ImageUploadField 
                      label="" 
                      value={formData.logoUrl || ''} 
                      onChange={(v) => handleChange('logoUrl', v)} 
                    />
                    <p className="text-[10px] text-gray-400 text-center italic">SVG or High-Res PNG recommended</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Browser Favicon</p>
                    <ImageUploadField 
                      label="" 
                      value={formData.faviconUrl || ''} 
                      onChange={(v) => handleChange('faviconUrl', v)} 
                    />
                    <p className="text-[10px] text-gray-400 text-center italic">ICO or PNG (32x32px)</p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'social' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 text-brand-navy border-b pb-4">
                  <div className="p-2 bg-brand-navy/5 rounded-lg">
                    <Users size={20} />
                  </div>
                  <h3 className="font-black text-xl uppercase tracking-tight">Social Integrations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="Facebook Page URL" 
                    value={formData.socialLinks?.facebook || ''} 
                    onChange={(v) => handleChange('socialLinks.facebook', v)} 
                    placeholder="https://facebook.com/..."
                  />
                  <InputField 
                    label="Twitter / X Profile" 
                    value={formData.socialLinks?.twitter || ''} 
                    onChange={(v) => handleChange('socialLinks.twitter', v)} 
                    placeholder="https://twitter.com/..."
                  />
                  <InputField 
                    label="Instagram Account" 
                    value={formData.socialLinks?.instagram || ''} 
                    onChange={(v) => handleChange('socialLinks.instagram', v)} 
                    placeholder="https://instagram.com/..."
                  />
                  <InputField 
                    label="LinkedIn Organization" 
                    value={formData.socialLinks?.linkedin || ''} 
                    onChange={(v) => handleChange('socialLinks.linkedin', v)} 
                    placeholder="https://linkedin.com/..."
                  />
                  <InputField 
                    label="YouTube Channel" 
                    value={formData.socialLinks?.youtube || ''} 
                    onChange={(v) => handleChange('socialLinks.youtube', v)} 
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </div>
    </FormWrapper>
  );
};

// AdministrativeUnitForm is the main form component for creating/editing administrative units (sectors, sub-cities, woredas, departments) with comprehensive fields and member management capabilities.

export const AdministrativeUnitForm: React.FC<FormProps<AdministrativeUnit>> = ({ initialData, onSave, onCancel }) => {
  const { isLoading: cmsLoading } = useCMS();
  const [formData, setFormData] = useState<Partial<AdministrativeUnit>>(initialData || {
    name: '',
    type: 'Sector',
    description: '',
    members: [],
    status: 'draft',
    language: 'en',
    parentUnit: '',
    officeLocation: '',
    contactPhone: '',
    delegationCode: '',
    sectorHierarchy: 'Cabinet'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', photoUrl: '', email: '' });
  const [memberErrors, setMemberErrors] = useState<Record<string, string>>({});

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  const handleChange = (field: keyof AdministrativeUnit, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMember = () => {
    const errs: Record<string, string> = {};
    if (!newMember.name) errs.name = 'Member name is required';
    if (!newMember.role) errs.role = 'Member role is required';
    
    if (Object.keys(errs).length > 0) {
      setMemberErrors(errs);
      return;
    }

    const memberWithId: AdministrativeMember = {
      id: `m-${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      photoUrl: getMemberAvatarUrl(newMember.email, newMember.name, newMember.photoUrl),
      email: newMember.email
    };

    setFormData(prev => ({
      ...prev,
      members: [...(prev.members || []), memberWithId]
    }));
    setNewMember({ name: '', role: '', photoUrl: '', email: '' });
    setMemberErrors({});
  };

  const handleRemoveMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      members: (prev.members || []).filter(m => m.id !== id)
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Unit name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      await onSave(formData as AdministrativeUnit);
    } catch (err) {
      console.error('Failed to save unit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormWrapper
      title={initialData?.id ? 'Edit Administrative Unit' : 'Create New Administrative Unit'}
      onSave={handleSubmit}
      onCancel={onCancel}
      isLoading={cmsLoading || isSaving}
      submitText={initialData?.id ? 'Update Unit' : 'Create Unit'}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Administrative Unit Name" 
            value={formData.name || ''} 
            onChange={(v) => handleChange('name', v)} 
            placeholder="e.g. Finance & Economic Development Department"
            error={errors.name}
            required
          />
          
          <SelectField
            label="Unit Type Hierarchy"
            value={formData.type || 'Sector'}
            onChange={(v) => handleChange('type', v)}
            options={[
              { value: 'Sector', label: 'Sector (Cabinet Executive)' },
              { value: 'SubCity', label: 'SubCity Administration' },
              { value: 'Woreda', label: 'Woreda District' },
              { value: 'Department', label: 'Department / Agency' }
            ]}
          />
        </div>

        <InputField 
          label="Description & Responsibilities" 
          value={formData.description || ''} 
          onChange={(v) => handleChange('description', v)} 
          placeholder="Outline physical jurisdiction, public services managed, or legal authority..."
          multiline
          rows={4}
          error={errors.description}
          required
        />

        {/* Structure Association Mapping Fields */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-slate-50/50 dark:bg-[#030914] space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-brand-teal-dark dark:text-brand-teal" />
              <span>Official Sector Structure & Location Map</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Configure structural associations, physical headquarters, delegation references, and sector hierarchy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              label="Parent / Supervisor Unit" 
              value={formData.parentUnit || ''} 
              onChange={(v) => handleChange('parentUnit', v)} 
              placeholder="e.g. City Administration Executive Office or Sub-City Administration"
            />
            <SelectField 
              label="Sector Hierarchy Division" 
              value={formData.sectorHierarchy || 'Cabinet'} 
              onChange={(v) => handleChange('sectorHierarchy', v)} 
              options={[
                { value: 'Cabinet', label: 'Cabinet & Political Secretariat' },
                { value: 'Economic', label: 'Economic & Finance Structure' },
                { value: 'Infrastructure', label: 'Municipal Infrastructure & Utilities' },
                { value: 'Social', label: 'Social & Welfare Development' },
                { value: 'Security', label: 'Security & Legal Compliance' }
              ]}
            />
            <InputField 
              label="Office Location / Headquarters" 
              value={formData.officeLocation || ''} 
              onChange={(v) => handleChange('officeLocation', v)} 
              placeholder="e.g. Block B, 2nd Floor, Central Municipal Complex"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField 
                label="Public Phone Contact" 
                value={formData.contactPhone || ''} 
                onChange={(v) => handleChange('contactPhone', v)} 
                placeholder="e.g. +251 22 111 2222"
              />
              <InputField 
                label="Delegation Code" 
                value={formData.delegationCode || ''} 
                onChange={(v) => handleChange('delegationCode', v)} 
                placeholder="e.g. AU-ADM-SUB-04"
              />
            </div>
          </div>
        </div>

        {/* Assigned Unit Members */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-slate-50/50 dark:bg-[#030914] space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-brand-teal-dark dark:text-brand-teal" />
              <span>Assigned Unit Members & Officials</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Manage public servants, managers, and representatives assigned to this hierarchy point.</p>
          </div>

          {/* Active Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(formData.members || []).map((member) => (
              <div key={member.id} className="bg-white dark:bg-[#0A162D] border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl flex items-center justify-between space-x-3 hover:translate-y-[-2px] hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <img src={getMemberAvatarUrl(member.email, member.name, member.photoUrl)} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{member.name}</h4>
                    <p className="text-[10px] font-bold text-brand-teal-dark dark:text-brand-teal uppercase tracking-wider truncate">{member.role}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-1.5 text-rose-500 dark:text-rose-400/80 hover:text-rose-700 dark:hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-lg transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {(formData.members || []).length === 0 && (
              <p className="text-xs text-slate-500 italic col-span-2 py-2">No cabinet or ward members assigned yet.</p>
            )}
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* New Member Input Form Block */}
          <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-900 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Official Name</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Ato Alula Kabede"
                className={`w-full bg-slate-50/50 dark:bg-slate-900 border ${memberErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-1 focus:ring-brand-teal`}
              />
              {memberErrors.name && <span className="text-[9px] text-rose-500 block mt-0.5">{memberErrors.name}</span>}
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Official Role</label>
              <input
                type="text"
                value={newMember.role}
                onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Deputy Ward Head"
                className={`w-full bg-slate-50/50 dark:bg-slate-900 border ${memberErrors.role ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-1 focus:ring-brand-teal`}
              />
              {memberErrors.role && <span className="text-[9px] text-rose-500 block mt-0.5">{memberErrors.role}</span>}
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Email (Gravatar lookup)</label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. member@ademacity.gov.et"
                className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-1 focus:ring-brand-teal"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400 block mb-1">Photo URL (Optional)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMember.photoUrl}
                  onChange={(e) => setNewMember(prev => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="flex-1 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-1 focus:ring-brand-teal"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="bg-[#2a4365] dark:bg-brand-teal text-white dark:text-brand-navy px-3.5 py-2 rounded-lg text-xs font-black transition hover:scale-105 active:scale-95 hover:bg-[#1a365d] dark:hover:bg-brand-teal/90"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <SelectField
            label="Publication Status"
            value={formData.status || 'draft'}
            onChange={(v) => handleChange('status', v)}
            options={[
              { value: 'draft', label: 'Draft Mode' },
              { value: 'published', label: 'Published / Active' },
              { value: 'archived', label: 'Archived Offline' }
            ]}
          />

          <SelectField
            label="Translation Scope"
            value={formData.language || 'en'}
            onChange={(v) => handleChange('language', v)}
            options={[
              { value: 'en', label: 'English translation' },
              { value: 'om', label: 'Afaan Oromo translation' },
              { value: 'am', label: 'Amharic translation' }
            ]}
          />
        </div>
      </div>
    </FormWrapper>
  );
};

// --- Growth Metric Form ---
export const GrowthMetricForm: React.FC<FormProps<GrowthMetric>> = ({ initialData, onCancel }) => {
  const { addGrowthMetric, updateGrowthMetric, isLoading: cmsLoading, error: cmsError } = useCMS();
  const [formData, setFormData] = useState<Partial<GrowthMetric>>(initialData || {
    year: new Date().getFullYear(),
    population: 0,
    growthRate: 0,
    revenue: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  const handleChange = (field: keyof GrowthMetric, value: string) => {
    setIsDirty(true);
    let parsedValue: any = value;
    if (field === 'year' || field === 'population') {
      parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) parsedValue = 0;
    } else if (field === 'growthRate' || field === 'revenue') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }
    setFormData(prev => ({ ...prev, [field]: parsedValue }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.year || formData.year < 1900 || formData.year > 2100) {
      newErrors.year = 'A valid year between 1900 and 2100 is required';
    }
    if (formData.population === undefined || formData.population <= 0) {
      newErrors.population = 'Population must be a positive number';
    }
    if (formData.growthRate === undefined || formData.growthRate < -100 || formData.growthRate > 100) {
      newErrors.growthRate = 'Growth rate must be between -100 and 100%';
    }
    if (formData.revenue === undefined || formData.revenue < 0) {
      newErrors.revenue = 'Municipal revenue must be a non-negative number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        if (!initialData) {
          await addGrowthMetric(formData as Omit<GrowthMetric, 'id' | 'createdAt' | 'updatedAt'>);
        } else if (initialData.id) {
          await updateGrowthMetric(initialData.id, formData);
        } else {
          console.error('Cannot update: missing id');
        }
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => {
          setSaveSuccess(false);
          onCancel();
        }, 1500);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <>
      <FormWrapper 
        title={initialData ? 'Edit Growth Metric' : 'Add Growth Metric'} 
        onSave={handleSave} 
        onCancel={handleCancel} 
        errors={cmsError ? { api: cmsError, ...errors } : errors}
        isLoading={cmsLoading}
      >
        <FormStatus success={saveSuccess} message="Growth metric saved successfully!" subMessage="Returning to list..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Metric Year" 
            value={formData.year ? String(formData.year) : ''} 
            onChange={(v) => handleChange('year', v)} 
            type="number"
            required 
            error={errors.year} 
          />
          <InputField 
            label="Total Population" 
            value={formData.population ? String(formData.population) : ''} 
            onChange={(v) => handleChange('population', v)} 
            type="number"
            required 
            error={errors.population} 
          />
          <InputField 
            label="Growth Rate (%)" 
            value={formData.growthRate ? String(formData.growthRate) : ''} 
            onChange={(v) => handleChange('growthRate', v)} 
            type="number"
            required 
            error={errors.growthRate} 
          />
          <InputField 
            label="Annual Municipal Revenue (ETB)" 
            value={formData.revenue ? String(formData.revenue) : ''} 
            onChange={(v) => handleChange('revenue', v)} 
            type="number"
            required 
            error={errors.revenue} 
          />
        </div>
      </FormWrapper>
    </>
  );
};
