export type Language = 'en' | 'om' | 'am';

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

export interface BaseContent {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ContentStatus;
  author: string;
  language: Language;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface NewsAnnouncement extends BaseContent {
  title: string;
  date: string;
  category: string; // 'Press Release' | 'Announcement' | 'Event' | 'Blog'
  content: string;
  image: string;        // for existing compat
  imageUrl?: string;    // user adapter schema
  summary?: string;     // user adapter schema
  tags: string[];
}

export interface BlogEntry extends BaseContent {
  title: string;
  author: string;
  category: string;
  content: string;
  featuredImage: string; // existing compat
  imageUrl?: string;     // user adapter schema
  summary?: string;      // user adapter schema
  tags: string[];
}

export interface Initiative extends BaseContent {
  title: string;
  description: string;
  category: string;
  currentStatus: string;
  timeline: string;
  impact: string;
  image?: string;
}

export interface Service extends BaseContent {
  name: string;        // existing compatibility
  title?: string;       // user adapter schema
  description: string;
  requirements: string[];
  process: string;     // existing compatibility
  processSteps?: string[]; // user adapter schema
  contactInfo: string;
  icon?: string;       // user adapter schema
  link?: string;       // user adapter schema
  category?: 'Resident' | 'Business' | 'Visitor'; // user adapter schema
}

export interface LeadershipProfile extends BaseContent {
  name: string;
  title: string;      // existing compatibility (role mapping)
  role?: string;       // user adapter schema
  department?: string;
  photo: string;      // existing compatibility
  imageUrl?: string;   // user adapter schema
  biography: string;  // existing compatibility
  bio?: string;        // user adapter schema
  responsibilities: string[];
  email: string;
  phone: string;
  contact?: string;    // user adapter schema
}

export interface AdministrativeMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  email?: string;
}

export interface AdministrativeUnit extends BaseContent {
  name: string;
  type: 'Sector' | 'SubCity' | 'Woreda' | 'Department';
  description: string;
  members: AdministrativeMember[];
  parentUnit?: string;
  officeLocation?: string;
  contactPhone?: string;
  delegationCode?: string;
  sectorHierarchy?: string;
}

export interface MayoralHistory extends BaseContent {
  mayorName: string;
  photo: string;
  term: string;
  summary: string;
  detailedDescription: string;
  stakeholders: string[];
  achievements: string[];
  challenges: string[];
  kpis: string[];
}

export interface Event extends BaseContent {
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  image?: string;
}

export interface DocumentPublication extends BaseContent {
  title: string;
  category: string;
  date: string;
  fileUrl: string;
  description: string;
  coverImage?: string;
  altIcon?: string;
}

export interface TourismContent extends BaseContent {
  attractionName: string;
  description: string;
  location: string;
  images: string[];
  category: string;
}

export interface PinnedAnnouncement extends BaseContent {
  title: string;
  message: string;
  type: 'Tender' | 'Vacancy' | 'Notice' | 'Service Update';
  expiryDate: string;
  priority: 'High' | 'Medium' | 'Low';
  link?: string;       // user adapter schema
  linkText?: string;   // user adapter schema
  image?: string;
}

export interface MediaItem extends BaseContent {
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'document';
  category: string;
  altText?: string;
  size: string;
  mimeType?: string;
}

export interface HeroVideoConfig extends BaseContent {
  videoUrl: string;
  fallbackImage: string;
  autoplay: boolean;
  mute: boolean;
  loop: boolean;
  showOverlay: boolean;
  overlayStyle: 'dark-gradient' | 'brand-tint' | 'none';
  overlayOpacity: 'light' | 'medium' | 'strong';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  videoQuality: 'low' | 'medium' | 'high';
  lowBandwidthMode: boolean;
  lazyLoad: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'Create' | 'Update' | 'Delete' | 'Publish' | 'Review';
  contentType: string;
  contentId: string;
  contentTitle: string;
  details?: string;
}

export type CMSUserRole = 'admin' | 'editor' | 'viewer';

export interface SiteSettings extends BaseContent {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  maintenanceMode?: boolean;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  aboutUs?: string;
  mayorsMessage?: string;
  mayorsMessageAuthor?: string;
  mayorsMessagePhoto?: string;
  established?: string;
  area?: string;
  altitude?: string;
  avgClimate?: string;
  population?: string;
  administrativeStructure?: string;
  vision?: string;
  mission?: string;
  mandate?: string;
}

// ==========================================
// DB Schemas / Shared Data Models from Specs
// ==========================================

export interface CMSNewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  image_url: string;
  tags: string[];
  status: string;
  language: string;
  author: string;
  published_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSAnnouncement {
  id: number;
  title: string;
  message: string;
  type: string;
  expiry_date: string;
  priority: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSService {
  id: number;
  name: string;
  description: string;
  requirements: string[]; // List of documents or prerequisites
  process: string;        // Text markdown or sequence of steps
  contact_info: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSLeadership {
  id: number;
  name: string;
  title: string;
  department: string;
  photo: string;
  biography: string;
  responsibilities: string[];
  email: string;
  phone: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSMayoralHistory {
  id: number;
  mayor_name: string;
  photo: string;
  term: string;
  summary: string;
  detailed_description: string;
  stakeholders: string[];
  achievements: string[];
  challenges: string[];
  kpis: string[]; // Raw strings or serializable KPI configurations
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSInitiative {
  id: number;
  title: string;
  description: string;
  category: string;
  current_status: string; // 'Concept' | 'Planned' | 'In Progress' | 'Completed'
  timeline: string;
  impact: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  image: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSDocument {
  id: number;
  title: string;
  category: string;
  date: string;
  file_url: string;
  description: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSTourism {
  id: number;
  attraction_name: string;
  description: string;
  location: string;
  images: string[];
  category: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSBlog {
  id: number;
  title: string;
  author: string;
  category: string;
  content: string;
  featured_image: string;
  tags: string[];
  status: string;
  language: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSMedia {
  id: number;
  name: string;
  url: string;
  thumbnail_url: string;
  type: string;
  category: string;
  alt_text: string;
  size: string;
  mime_type: string;
  status: string;
  language: string;
  author: string;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface CMSHeroVideo {
  id: number;
  video_url: string;
  fallback_image: string;
  autoplay: boolean;
  mute: boolean;
  loop: boolean;
  show_overlay: boolean;
  overlay_style: string;
  overlay_opacity: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  video_quality: string;
  low_bandwidth_mode: boolean;
  lazy_load: boolean;
  updated_at: string | Date;
}

export interface CMSSiteSettings {
  id: number;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_links: any; // Dynamic JSON key-value store for direct icon mappings
  logo_url: string;
  favicon_url: string;
  footer_text: string;
  updated_at: string | Date;
}

export interface CMSPermission {
  module: 'news' | 'announcements' | 'services' | 'leadership' | 'history' | 'initiatives' | 'events' | 'documents' | 'tourism' | 'blog' | 'media' | 'administrative-units' | string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

export interface CMSUser {
  id: number | string; // unified supporting both string (internal UI) and number (db schema)
  username: string;
  name: string;
  email: string;
  password_hash?: string; // made optional to support frontend where password_hash is not sent/needed
  role: string | CMSUserRole;
  created_at?: string | Date;
  department?: string; // Support department filter if populated
  permissions?: CMSPermission[]; // granular permissions override
}

export interface GrowthMetric {
  id: string;
  year: number;
  population: number;
  growthRate: number;
  revenue: number;
  createdAt?: string;
  updatedAt?: string;
}
