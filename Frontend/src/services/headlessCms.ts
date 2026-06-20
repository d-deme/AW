/**
 * Headless CMS Client & Integration Service
 * Specializing in high-performance, cached, and robust consumption
 * of the custom Adama Municipal Headless CMS endpoints.
 */

import { useState, useEffect } from 'react';

// Dynamically determine the CMS BASE_URL using environment variables, defaulting to current origin in browser.
const getCmsBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  const envBaseUrl = import.meta.env?.VITE_API_BASE_URL;
  const envApiUrl = import.meta.env?.VITE_API_URL;
  const fallbackUrl = envBaseUrl || envApiUrl;

  if (fallbackUrl) {
    const cleanUrl = fallbackUrl.endsWith('/') ? fallbackUrl.slice(0, -1) : fallbackUrl;
    if (cleanUrl.endsWith('/api')) {
      return cleanUrl;
    }
    return `${cleanUrl}/api`;
  }
  return '/api';
};

export const BASE_URL = getCmsBaseUrl();

// ============================================================================
// STRICTOR TYPES FOR DATABASE RESPONSES (SNAKE_CASE & CMS SCHEMA SPECIFIC)
// ============================================================================

export interface CMSSiteSettingsDb {
  id?: number;
  site_name?: string;
  site_description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  logo_url?: string;
  favicon_url?: string;
  footer_text?: string;
  established?: string;
  area?: string;
  altitude?: string;
  avg_climate?: string;
  population?: string;
  administrative_structure?: string;
  about_us?: string;
  mission?: string;
  vision?: string;
  mandate?: string;
  mayors_message?: string;
  mayors_message_author?: string;
  mayors_message_photo?: string;
  updated_at?: string;
}

export interface CMSNewsItemDb {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  slug?: string;
  tags?: string[] | string;
  author: string;
  created_at?: string;
  updated_at?: string;
}

export interface CMSAnnouncementDb {
  id: number;
  title: string;
  message: string;
  type?: string;
  priority: 'low' | 'medium' | 'high' | string;
  status: 'active' | 'archived' | 'published' | string;
  expiry_date?: string;
  created_at?: string;
}

export interface CMSServiceDb {
  id: number;
  name: string;
  description: string;
  requirements?: string[] | string;
  process?: string;
  contact_info?: string;
  status?: string;
}

export interface CMSLeadershipDb {
  id: number;
  name: string;
  title: string;
  department: string;
  photo?: string;
  biography?: string;
  responsibilities?: string;
  email?: string;
  phone?: string;
  status: string;
}

export interface CMSMayoralHistoryDb {
  id: number;
  mayor_name: string;
  photo?: string;
  term: string;
  summary: string;
  detailed_description?: string;
  achievements?: string;
  challenges?: string;
  kpis?: string;
  status: string;
}

export interface CMSInitiativeDb {
  id: number;
  title: string;
  description: string;
  category: string;
  current_status?: string;
  timeline?: string;
  impact?: string;
  status?: string;
}

export interface CMSEventDb {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  image?: string;
  status: string;
}

export interface CMSDocumentDb {
  id: number;
  title: string;
  category: string;
  date: string;
  file_url: string;
  description?: string;
  status: string;
}

export interface CMSTourismDb {
  id: number;
  attraction_name: string;
  description: string;
  location: string;
  images?: string[] | string;
  category: string;
  status: string;
}

export interface CMSBlogDb {
  id: number;
  title: string;
  author: string;
  category: string;
  content: string;
  featured_image?: string;
  tags?: string[] | string;
  status: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface CMSMediaDb {
  id: number;
  name: string;
  url: string;
  thumbnail_url?: string;
  type: string;
  category: string;
  alt_text?: string;
  size?: number;
  mime_type?: string;
  status: string;
}

export interface CMSAdministrativeUnitDb {
  id: number;
  name: string;
  type: string;
  description: string;
  members?: string | string[];
  status: string;
}

// ============================================================================
// REFINED CLIENT-SIDE MODEL REPRESENTATIONS (CAMELCASE & CLEAN STRUCTURE)
// ============================================================================

export interface ClientSiteSettings {
  id?: number;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  established: string;
  area: string;
  altitude: string;
  avgClimate: string;
  population: string;
  administrativeStructure: string;
  aboutUs?: string;
  mission?: string;
  vision?: string;
  mandate?: string;
  mayorsMessage?: string;
  mayorsMessageAuthor?: string;
  mayorsMessagePhoto?: string;
  updatedAt?: string;
}

export interface ClientNewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  slug: string;
  tags: string[];
  author: string;
  createdAt: string;
}

export interface ClientAnnouncement {
  id: string;
  title: string;
  message: string;
  priority: string;
  status: string;
}

export interface ClientCityService {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  process: string;
  contactInfo: string;
}

export interface ClientLeadership {
  id: string;
  name: string;
  title: string;
  department: string;
  photo: string;
  biography: string;
  responsibilities: string;
  email: string;
  phone: string;
  status: string;
}

export interface ClientMayoralHistory {
  id: string;
  mayorName: string;
  photo: string;
  term: string;
  summary: string;
  detailedDescription: string;
  achievements: string;
  challenges: string;
  kpis: string;
  status: string;
}

export interface ClientInitiative {
  id: string;
  title: string;
  description: string;
  category: string;
  currentStatus: string;
  timeline: string;
  impact: string;
}

export interface ClientEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  imageUrl: string;
  status: string;
}

export interface ClientDocument {
  id: string;
  title: string;
  category: string;
  date: string;
  fileUrl: string;
  description: string;
}

export interface ClientTourism {
  id: string;
  attractionName: string;
  description: string;
  location: string;
  images: string[];
  category: string;
  status: string;
}

export interface ClientBlog {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
  featuredImage: string;
  tags: string[];
  status: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface ClientMedia {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  type: string;
  category: string;
  altText: string;
}

export interface ClientAdministrativeUnit {
  id: string;
  name: string;
  type: string;
  description: string;
  members: string[];
  status: string;
}

// ============================================================================
// CONVERSION MAPPERS (SNAKE_CASE -> CAMELCASE)
// ============================================================================

export const mapSiteSettings = (raw: CMSSiteSettingsDb | null | undefined): ClientSiteSettings => {
  if (!raw) {
    return {
      siteName: "Adama Municipal Administration",
      siteDescription: "Official municipal governance & civic portal for Adama City, Oromia, Ethiopia.",
      contactEmail: "info@adama.gov.et",
      contactPhone: "+251-22-111-2092",
      address: "Adama Municipal Boulevard, Block 4, Adama, Ethiopia",
      logoUrl: "",
      faviconUrl: "",
      footerText: "© 2026 Adama Municipal City Administration. All rights reserved.",
      established: "1924 GC",
      area: "58,109 ha",
      altitude: "1,712 m asl",
      avgClimate: "22°C",
      population: "1,000,000+",
      administrativeStructure: "32 Sectors, 6 Sub-Cities, 19 Woredas",
      aboutUs: "",
      mission: "",
      vision: "",
      mandate: "",
      mayorsMessage: "",
      mayorsMessageAuthor: "",
      mayorsMessagePhoto: ""
    };
  }

  return {
    id: raw.id,
    siteName: raw.site_name || "Adama Municipal Administration",
    siteDescription: raw.site_description || "Official municipal governance & civic portal for Adama City, Oromia, Ethiopia.",
    contactEmail: raw.contact_email || "info@adama.gov.et",
    contactPhone: raw.contact_phone || "+251-22-111-2092",
    address: raw.address || "Adama Municipal Boulevard, Block 4, Adama, Ethiopia",
    logoUrl: raw.logo_url || "",
    faviconUrl: raw.favicon_url || "",
    footerText: raw.footer_text || "© 2026 Adama Municipal City Administration. All rights reserved.",
    established: raw.established || "1924 GC",
    area: raw.area || "58,109 ha",
    altitude: raw.altitude || "1,712 m asl",
    avgClimate: raw.avg_climate || "22°C",
    population: raw.population || "1,000,000+",
    administrativeStructure: raw.administrative_structure || "32 Sectors, 6 Sub-Cities, 19 Woredas",
    aboutUs: raw.about_us || "",
    mission: raw.mission || "",
    vision: raw.vision || "",
    mandate: raw.mandate || "",
    mayorsMessage: raw.mayors_message || "",
    mayorsMessageAuthor: raw.mayors_message_author || "",
    mayorsMessagePhoto: raw.mayors_message_photo || "",
    updatedAt: raw.updated_at
  };
};

export const mapNewsItem = (raw: CMSNewsItemDb): ClientNewsItem => {
  let parsedTags: string[] = [];
  if (Array.isArray(raw.tags)) {
    parsedTags = raw.tags;
  } else if (typeof raw.tags === 'string') {
    try {
      parsedTags = JSON.parse(raw.tags);
    } catch {
      parsedTags = raw.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  return {
    id: String(raw.id),
    title: raw.title || '',
    content: raw.content || '',
    category: raw.category || 'Press Release',
    imageUrl: raw.image_url || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800',
    slug: raw.slug || '',
    tags: parsedTags,
    author: raw.author || 'Municipal Editorial Board',
    createdAt: raw.created_at || new Date().toISOString()
  };
};

export const mapAnnouncement = (raw: CMSAnnouncementDb): ClientAnnouncement => ({
  id: String(raw.id),
  title: raw.title || '',
  message: raw.message || '',
  priority: raw.priority || 'medium',
  status: raw.status || 'published'
});

export const mapService = (raw: CMSServiceDb): ClientCityService => {
  let parsedReqs: string[] = [];
  if (Array.isArray(raw.requirements)) {
    parsedReqs = raw.requirements;
  } else if (typeof raw.requirements === 'string') {
    try {
      parsedReqs = JSON.parse(raw.requirements);
    } catch {
      parsedReqs = raw.requirements.split('\n').map(r => r.trim()).filter(Boolean);
    }
  }

  return {
    id: String(raw.id),
    name: raw.name || '',
    description: raw.description || '',
    requirements: parsedReqs,
    process: raw.process || 'Submit online application, verify biometric files, and complete regional fees standard.',
    contactInfo: raw.contact_info || 'Municipal Help Desk (+251-22-111-2092)'
  };
};

export const mapLeadership = (raw: CMSLeadershipDb): ClientLeadership => ({
  id: String(raw.id),
  name: raw.name || '',
  title: raw.title || '',
  department: raw.department || 'General Administration',
  photo: raw.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  biography: raw.biography || 'Elected public administration official for the city executive of Adama.',
  responsibilities: raw.responsibilities || 'Overseeing regional development planning & community infrastructure systems.',
  email: raw.email || 'executive@adama.gov.et',
  phone: raw.phone || '+251-22-111-2092',
  status: raw.status || 'published'
});

export const mapMayoralHistory = (raw: CMSMayoralHistoryDb): ClientMayoralHistory => ({
  id: String(raw.id),
  mayorName: raw.mayor_name || '',
  photo: raw.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
  term: raw.term || '1990 - 1995',
  summary: raw.summary || '',
  detailedDescription: raw.detailed_description || '',
  achievements: raw.achievements || '',
  challenges: raw.challenges || '',
  kpis: raw.kpis || '',
  status: raw.status || 'published'
});

export const mapInitiative = (raw: CMSInitiativeDb): ClientInitiative => ({
  id: String(raw.id),
  title: raw.title || '',
  description: raw.description || '',
  category: raw.category || 'Infrastructure Development',
  currentStatus: raw.current_status || 'In Progress',
  timeline: raw.timeline || '2026 - 2028',
  impact: raw.impact || 'High priority municipal growth directive.'
});

export const mapEvent = (raw: CMSEventDb): ClientEvent => ({
  id: String(raw.id),
  title: raw.title || '',
  date: raw.date || new Date().toISOString(),
  location: raw.location || 'Municipal Convention Chamber',
  description: raw.description || '',
  category: raw.category || 'Public Session',
  imageUrl: raw.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  status: raw.status || 'published'
});

export const mapDocument = (raw: CMSDocumentDb): ClientDocument => ({
  id: String(raw.id),
  title: raw.title || '',
  category: raw.category || 'Policy Paper',
  date: raw.date || new Date().toLocaleDateString(),
  fileUrl: raw.file_url || '#',
  description: raw.description || 'Official legislative or capital ledger file released for public audit.'
});

export const mapTourism = (raw: CMSTourismDb): ClientTourism => {
  let parsedImages: string[] = [];
  if (Array.isArray(raw.images)) {
    parsedImages = raw.images;
  } else if (typeof raw.images === 'string') {
    try {
      parsedImages = JSON.parse(raw.images);
    } catch {
      parsedImages = raw.images.split(',').map(im => im.trim()).filter(Boolean);
    }
  }

  if (parsedImages.length === 0) {
    parsedImages = ['https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800'];
  }

  return {
    id: String(raw.id),
    attractionName: raw.attraction_name || '',
    description: raw.description || '',
    location: raw.location || 'Adama Region',
    images: parsedImages,
    category: raw.category || 'Eco Tourism',
    status: raw.status || 'published'
  };
};

export const mapBlog = (raw: CMSBlogDb): ClientBlog => {
  let parsedTags: string[] = [];
  if (Array.isArray(raw.tags)) {
    parsedTags = raw.tags;
  } else if (typeof raw.tags === 'string') {
    try {
      parsedTags = JSON.parse(raw.tags);
    } catch {
      parsedTags = raw.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  return {
    id: String(raw.id),
    title: raw.title || '',
    author: raw.author || 'Municipal Staff Columnist',
    category: raw.category || 'Insights',
    content: raw.content || '',
    featuredImage: raw.featured_image || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800',
    tags: parsedTags,
    status: raw.status || 'published',
    slug: raw.slug || '',
    metaTitle: raw.meta_title || raw.title || '',
    metaDescription: raw.meta_description || '',
    metaKeywords: raw.meta_keywords || ''
  };
};

export const mapMedia = (raw: CMSMediaDb): ClientMedia => ({
  id: String(raw.id),
  name: raw.name || '',
  url: raw.url || '',
  thumbnailUrl: raw.thumbnail_url || raw.url || '',
  type: raw.type || 'image',
  category: raw.category || 'Gallery',
  altText: raw.alt_text || raw.name || ''
});

export const mapAdministrativeUnit = (raw: CMSAdministrativeUnitDb): ClientAdministrativeUnit => {
  let parsedMembers: string[] = [];
  if (Array.isArray(raw.members)) {
    parsedMembers = raw.members;
  } else if (typeof raw.members === 'string') {
    try {
      parsedMembers = JSON.parse(raw.members);
    } catch {
      parsedMembers = raw.members.split(',').map(m => m.trim()).filter(Boolean);
    }
  }

  return {
    id: String(raw.id),
    name: raw.name || '',
    type: raw.type || 'Sub-City',
    description: raw.description || '',
    members: parsedMembers,
    status: raw.status || 'published'
  };
};

// ============================================================================
// STATEFUL DEEP-INTERCEPT AUTH & LOCALIZATION SETTINGS
// ============================================================================

let activeLang = 'en'; // Global active language parameter ('en' | 'am' | 'or')
let accessToken: string | null = null;
let refreshToken: string | null = null;
let viewStatus: 'published' | 'all' = 'published';

// Synchronize safely with client browser storage if allowed
try {
  if (typeof window !== 'undefined') {
    activeLang = sessionStorage.getItem('adama_cms_lang') || localStorage.getItem('adama_cms_lang') || 'en';
    accessToken = localStorage.getItem('adama_cms_access_token');
    refreshToken = localStorage.getItem('adama_cms_refresh_token');
    viewStatus = (localStorage.getItem('adama_cms_status') as any) || 'published';
  }
} catch (e) {
  console.warn('[Storage Check] Security sandboxing limits access. Falling back to memory state.');
}

export const getActiveLang = () => activeLang;
export const setActiveLang = (lang: string) => {
  activeLang = lang.toLowerCase();
  try {
    localStorage.setItem('adama_cms_lang', activeLang);
    sessionStorage.setItem('adama_cms_lang', activeLang);
  } catch {}
  triggerStateChangeEvent();
};

export const getCmsTokens = () => ({ accessToken, refreshToken });
export const setCmsTokens = (access: string | null, refresh: string | null) => {
  accessToken = access;
  refreshToken = refresh;
  try {
    if (access) localStorage.setItem('adama_cms_access_token', access);
    else localStorage.removeItem('adama_cms_access_token');

    if (refresh) localStorage.setItem('adama_cms_refresh_token', refresh);
    else localStorage.removeItem('adama_cms_refresh_token');
  } catch {}
  triggerStateChangeEvent();
};

export const getViewStatus = () => viewStatus;
export const setViewStatus = (status: 'published' | 'all') => {
  viewStatus = status;
  try {
    localStorage.setItem('adama_cms_status', status);
  } catch {}
  triggerStateChangeEvent();
};

const triggerStateChangeEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adama_cms_state_change'));
  }
};

// ============================================================================
// HIGH PERFORMANCE INTERCEPTOR ENGINE FOR FETCH
// ============================================================================

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let headersWithAuth: HeadersInit = { ...(options.headers || {}) };

  // Set default JSON Content-Type if not specified
  if (!headersWithAuth['Content-Type' as keyof HeadersInit] && !(options.body instanceof FormData)) {
    headersWithAuth = {
      ...headersWithAuth,
      'Content-Type': 'application/json'
    };
  }

  // Intercept and auto-assign Bearer Access Token if present inside local state
  if (accessToken) {
    headersWithAuth = {
      ...headersWithAuth,
      'Authorization': `Bearer ${accessToken}`
    };
  }

  const fetchOptions = {
    ...options,
    headers: headersWithAuth
  };

  let response = await fetch(url, fetchOptions);

  // Capture 401 state to trigger a silent /api/auth/refresh transactional round-trip
  if (response.status === 401 && refreshToken) {
    console.log('[Auth Interceptor] Captured 401 state. Attempting silent access token renewal...');
    try {
      const refreshUrl = `${BASE_URL}/auth/refresh`;
      const refreshResponse = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const nextAccess = refreshData.accessToken || refreshData.access_token;
        const nextRefresh = refreshData.refreshToken || refreshData.refresh_token || refreshToken;
        
        if (nextAccess) {
          console.log('[Auth Interceptor] Dynamic session renewed successfully!');
          setCmsTokens(nextAccess, nextRefresh);

          // Retry the original query utilizing the renewed and hot-swapped session authorization
          headersWithAuth = {
            ...(options.headers || {}),
            'Authorization': `Bearer ${nextAccess}`
          };
          
          if (!headersWithAuth['Content-Type' as keyof HeadersInit] && !(options.body instanceof FormData)) {
            headersWithAuth['Content-Type' as keyof HeadersInit] = 'application/json' as any;
          }

          response = await fetch(url, {
            ...options,
            headers: headersWithAuth
          });
        }
      } else {
        console.warn('[Auth Interceptor] Refresh credential invalid or expired. Terminating active session...');
        setCmsTokens(null, null);
      }
    } catch (e) {
      console.warn('[Auth Interceptor] Error during automatic token recovery sequence:', e);
    }
  }

  return response;
};

// ============================================================================
// LIGHTWEIGHT CACHING ENGINE
// ============================================================================

const cmsCache: { [url: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL_MS = 30 * 1000; // 30 seconds of client-side cache TTL to prevent repeat network loads

export const fetchHeadlessCms = async <Raw, Client>(
  endpoint: string,
  mapper: (raw: Raw) => Client
): Promise<Client> => {
  // Construct parameters seamlessly with active language query and preview status flags
  const glue = endpoint.includes('?') ? '&' : '?';
  const resolvedEndpoint = `${endpoint}${glue}lang=${activeLang}&status=${viewStatus}`;
  const url = `${BASE_URL}${resolvedEndpoint}`;
  const now = Date.now();

  // Return cached result if TTL is active to optimize performance
  if (cmsCache[url] && (now - cmsCache[url].timestamp < CACHE_TTL_MS)) {
    return cmsCache[url].data;
  }

  try {
    const response = await authenticatedFetch(url);
    
    if (!response.ok) {
      throw new Error(`Headless CMS responded with error code: ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    
    // Some CMS single-record endpoints return array containers
    let cleanRawData: any = data;
    if (endpoint.startsWith('/site-settings') && Array.isArray(data)) {
      cleanRawData = data[0] || null;
    }

    const clientData = mapper(cleanRawData);

    // Persist to local in-memory runtime cache
    cmsCache[url] = {
      data: clientData,
      timestamp: now
    };

    return clientData;
  } catch (error: any) {
    console.warn(`[HeadlessCms Client Error] Fetch failed for endpoint: ${endpoint}`, error);
    console.warn(`[HeadlessCms Fallback] Unreachable backend at ${BASE_URL}. Providing decoupled fallback client dataset...`);
    
    // In order for the frontend to remain perfectly stable as a purely decoupled consumer, 
    // we map a safe empty or baseline structure matching the mapper's expectations rather than throwing.
    try {
      if (endpoint.startsWith('/site-settings')) {
        return mapper(null as any);
      }
      if (endpoint.startsWith('/hero-video')) {
        return mapper({
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-at-night-aerial-view-34758-large.mp4',
          status: 'published'
        } as any);
      }
      return mapper(null as any);
    } catch {
      return {} as any;
    }
  }
};

// Also support array endpoints specifically
export const fetchHeadlessCmsList = async <Raw, Client>(
  endpoint: string,
  mapper: (raw: Raw) => Client
): Promise<Client[]> => {
  const glue = endpoint.includes('?') ? '&' : '?';
  const resolvedEndpoint = `${endpoint}${glue}lang=${activeLang}&status=${viewStatus}`;
  const url = `${BASE_URL}${resolvedEndpoint}`;
  const now = Date.now();

  if (cmsCache[url] && (now - cmsCache[url].timestamp < CACHE_TTL_MS)) {
    return cmsCache[url].data;
  }

  try {
    const response = await authenticatedFetch(url);
    
    if (!response.ok) {
      throw new Error(`Headless CMS responded with status: ${response.status}`);
    }

    const data = await response.json();
    const arrayData = Array.isArray(data) ? data : (data && typeof data === 'object' && Array.isArray(data.items) ? data.items : []);
    
    const mappedItems = arrayData.map((item: any) => mapper(item));

    cmsCache[url] = {
      data: mappedItems,
      timestamp: now
    };

    return mappedItems;
  } catch (error: any) {
    console.warn(`[HeadlessCms List Client Error] Fetch failed for endpoint: ${endpoint}. Falling back to empty collection.`, error);
    return [];
  }
};

// ============================================================================
// CACHED REACT HOOK FOR DYNAMIC HEADLESS CMS CONSUMPTION
// ============================================================================

export interface UseHeadlessCmsResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHeadlessCms<Raw, Client>(
  endpoint: string,
  mapper: (raw: Raw) => Client
): UseHeadlessCmsResult<Client> {
  const [data, setData] = useState<Client | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHeadlessCms<Raw, Client>(endpoint, mapper);
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to synchronise data with dynamic CMS registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const handleStateChange = () => {
        loadData();
      };
      window.addEventListener('adama_cms_state_change', handleStateChange);
      return () => {
        window.removeEventListener('adama_cms_state_change', handleStateChange);
      };
    }
  }, [endpoint]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
}

export function useHeadlessCmsList<Raw, Client>(
  endpoint: string,
  mapper: (raw: Raw) => Client
): UseHeadlessCmsResult<Client[]> {
  const [data, setData] = useState<Client[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHeadlessCmsList<Raw, Client>(endpoint, mapper);
      setData(result);
    } catch (err: any) {
      setError(err?.message || "Failed to synchronise data with dynamic CMS registry collection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const handleStateChange = () => {
        loadData();
      };
      window.addEventListener('adama_cms_state_change', handleStateChange);
      return () => {
        window.removeEventListener('adama_cms_state_change', handleStateChange);
      };
    }
  }, [endpoint]);

  return {
    data,
    loading,
    error,
    refetch: loadData
  };
}

// ============================================================================
// REACTION ACTION INTERFACES FOR MUTATIONS (CITIZEN FORMS ETC)
// ============================================================================

export const submitCmsForm = async (endpoint: string, payload: any): Promise<any> => {
  const url = `${BASE_URL}${endpoint}?lang=${activeLang}`;
  try {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.message || errBody.error || `Failed to submit transaction to ${endpoint} (${response.status})`);
    }

    return await response.json();
  } catch (err: any) {
    console.error(`[HeadlessCms Mutation Error] Submission failed on ${endpoint}`, err);
    throw err;
  }
};
