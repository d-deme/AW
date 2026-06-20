/**
 * Adama City - Core Types
 */

export type ProjectStatus = 'Concept' | 'Planned' | 'Ongoing' | 'In Progress' | 'Live' | 'Completed';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  link: string;
  linkText: string;
  active: boolean;
  category?: 'Infrastructure' | 'Social' | 'Economy' | 'General';
  imageUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  impact: string;
  category: 'Mobility' | 'Energy' | 'Environment' | 'Digital' | 'Infrastructure' | 'Economic' | 'Smart City' | 'Community';
  imageUrl: string;
  timeline?: string;
}

export interface Initiative extends Project {}

export interface MayoralHistory {
  id: string;
  name: string;
  photoUrl: string;
  term: string;
  summary: string;
  details: string;
  stakeholders: string[];
  achievements: string[];
  initiatives: string[];
  challenges: string[];
  kpis: { label: string; value: string | number }[];
}

export interface UnitMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  description?: string;
}

export interface AdministrativeUnit {
  id: string;
  name: string;
  type: 'Sector' | 'SubCity' | 'Woreda' | 'Department';
  description?: string;
  parent?: string;
  members?: UnitMember[];
}

export interface KPI {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

export interface CityService {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  category: 'Resident' | 'Business' | 'Visitor';
  requirements?: string[];
  processSteps?: string[];
  contactInfo?: string;
}

export interface NewsPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: 'Press Release' | 'Announcement' | 'Event' | 'Blog';
  summary: string;
  content: string;
  imageUrl: string;
  tags: string[];
}

export interface LeadershipProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  responsibilities: string[];
  contact: string;
  imageUrl: string;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  rating?: number;
  category?: string;
}

export interface SystemMetric {
  id: string;
  label: string;
  value: string | number;
  status: 'Healthy' | 'Warning' | 'Critical';
  lastUpdated: string;
  icon?: string;
}

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface NavDropdown {
  label: string;
  items: NavItem[];
}

export type NavigationLink = NavItem | NavDropdown;

// ==========================================
// BACKEND CMS DATABASE SCHEMA INTERFACES
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
  requirements: string[];
  process: string;
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
  kpis: string[]; // Raw strings or JSON stringified representations
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
  current_status: string;
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
  social_links: any;
  logo_url: string;
  favicon_url: string;
  footer_text: string;
  updated_at: string | Date;
}

export interface CMSUser {
  id: number;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string | Date;
}

export interface LocationPOI {
  id: string;
  label: string;
  category: 'all' | 'civic' | 'economy' | 'energy' | 'culture';
  desc: string;
  details: string;
  coords: { lat: number; lng: number };
  zoom: number;
  hours: string;
  contact: string;
  status: 'Functional' | 'Peak Output' | 'Ready' | 'Busy';
  statusColor: string;
}
