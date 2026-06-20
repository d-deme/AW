import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  NewsAnnouncement, 
  PinnedAnnouncement, 
  Service, 
  LeadershipProfile, 
  MayoralHistory, 
  Language, 
  CMSUser,
  Initiative,
  Event,
  DocumentPublication,
  TourismContent,
  BlogEntry,
  MediaItem,
  AuditLog,
  HeroVideoConfig,
  SiteSettings,
  AdministrativeUnit,
  GrowthMetric
} from './types';
import { 
  INITIAL_HERO_VIDEO,
  INITIAL_SITE_SETTINGS,
  INITIAL_ADMINISTRATIVE_UNITS
} from './constants';

// ========== API Base URL from environment ==========
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========== Helper: API Request with token ==========
const getAuthHeaders = (token?: string | null) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// ========== Context Type ==========
interface CMSContextType {
  news: NewsAnnouncement[];
  pinned: PinnedAnnouncement[];
  services: Service[];
  leadership: LeadershipProfile[];
  mayoralHistory: MayoralHistory[];
  initiatives: Initiative[];
  events: Event[];
  documents: DocumentPublication[];
  tourism: TourismContent[];
  blog: BlogEntry[];
  media: MediaItem[];
  administrativeUnits: AdministrativeUnit[];
  growthMetrics: GrowthMetric[];
  users: CMSUser[];
  heroVideo: HeroVideoConfig;
  siteSettings: SiteSettings;
  auditLogs: AuditLog[];
  currentUser: CMSUser | null;
  isAuthenticated: boolean;
  currentLanguage: Language;
  isLoading: boolean;
  error: string | null;
  setLanguage: (lang: Language) => void;
  login: (token: string, user: CMSUser) => void;
  logout: () => void;
  logAction: (action: AuditLog['action'], contentType: string, contentId: string, contentTitle: string, details?: string) => void;
  fetchAll: () => Promise<void>;
  // CRUD methods
  addNews: (item: any) => Promise<void>;
  updateNews: (id: string, item: any) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  addPinned: (item: any) => Promise<void>;
  updatePinned: (id: string, item: any) => Promise<void>;
  deletePinned: (id: string) => Promise<void>;
  addService: (item: any) => Promise<void>;
  updateService: (id: string, item: any) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addLeadership: (item: any) => Promise<void>;
  updateLeadership: (id: string, item: any) => Promise<void>;
  deleteLeadership: (id: string) => Promise<void>;
  addMayoralHistory: (item: any) => Promise<void>;
  updateMayoralHistory: (id: string, item: any) => Promise<void>;
  deleteMayoralHistory: (id: string) => Promise<void>;
  addInitiative: (item: any) => Promise<void>;
  updateInitiative: (id: string, item: any) => Promise<void>;
  deleteInitiative: (id: string) => Promise<void>;
  addEvent: (item: any) => Promise<void>;
  updateEvent: (id: string, item: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addDocument: (item: any) => Promise<void>;
  updateDocument: (id: string, item: any) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  addTourism: (item: any) => Promise<void>;
  updateTourism: (id: string, item: any) => Promise<void>;
  deleteTourism: (id: string) => Promise<void>;
  addBlog: (item: any) => Promise<void>;
  updateBlog: (id: string, item: any) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;
  addMedia: (item: any) => Promise<void>;
  updateMedia: (id: string, item: any) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  addAdministrativeUnit: (item: any) => Promise<void>;
  updateAdministrativeUnit: (id: string, item: any) => Promise<void>;
  deleteAdministrativeUnit: (id: string) => Promise<void>;
  addGrowthMetric: (item: any) => Promise<void>;
  updateGrowthMetric: (id: string, item: any) => Promise<void>;
  deleteGrowthMetric: (id: string) => Promise<void>;
  addUser: (item: any) => Promise<void>;
  updateUser: (id: string, item: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateProfile: (item: any) => Promise<void>;
  updateHeroVideo: (item: Partial<HeroVideoConfig>) => Promise<void>;
  updateSiteSettings: (item: Partial<SiteSettings>) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

// ========== Provider Component ==========
export const CMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ---------- State ----------
  const [news, setNews] = useState<NewsAnnouncement[]>([]);
  const [pinned, setPinned] = useState<PinnedAnnouncement[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [leadership, setLeadership] = useState<LeadershipProfile[]>([]);
  const [mayoralHistory, setMayoralHistory] = useState<MayoralHistory[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [documents, setDocuments] = useState<DocumentPublication[]>([]);
  const [tourism, setTourism] = useState<TourismContent[]>([]);
  const [blog, setBlog] = useState<BlogEntry[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [administrativeUnits, setAdministrativeUnits] = useState<AdministrativeUnit[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [users, setUsers] = useState<CMSUser[]>([]);
  const [heroVideo, setHeroVideo] = useState<HeroVideoConfig>(INITIAL_HERO_VIDEO);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cms_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<CMSUser | null>(() => {
    const saved = localStorage.getItem('cms_user');
    return saved ? JSON.parse(saved) : null;
  });

  const cache = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const isAuthenticated = !!token;

  // ---------- Theme Effect ----------
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cms_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // ---------- API Request Helper ----------
  const apiRequest = async <T = any>(url: string, method: string = 'GET', body?: any, useCache = true): Promise<T> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    if (method === 'GET' && useCache) {
      const cached = cache.current.get(fullUrl);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as T;
      }
    }

    const response = await fetch(fullUrl, {
      method,
      headers: getAuthHeaders(token),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      logout();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (method === 'GET') {
      cache.current.set(fullUrl, { data, timestamp: Date.now() });
    } else {
      cache.current.clear(); // invalidate cache on mutations
    }
    return data;
  };

  // ---------- Authentication ----------
  const login = (newToken: string, user: CMSUser) => {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('token', newToken);
    localStorage.setItem('cms_user', JSON.stringify(user));
    cache.current.clear();
    fetchAll(); // load data after login
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('cms_user');
    cache.current.clear();
    // Reset all state to empty? Optionally you could, but typically you navigate away.
  };

  const setLanguage = (lang: Language) => setCurrentLanguage(lang);

  // ---------- Audit Log ----------
  const logAction = async (action: AuditLog['action'], contentType: string, contentId: string, contentTitle: string, details?: string) => {
    if (!currentUser) return;
    try {
      const newLog = await apiRequest('/audit-logs', 'POST', {
        action,
        contentType,
        contentId,
        contentTitle,
        details,
      });
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.error('Failed to log action:', err);
    }
  };

  // ---------- Fetch All Data ----------
  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        newsData,
        pinnedData,
        servicesData,
        leadershipData,
        historyData,
        initiativesData,
        eventsData,
        docsData,
        tourismData,
        blogData,
        mediaData,
        usersData,
        heroData,
        settingsData,
        auditLogsData,
        growthMetricsData,
        adminUnitsData,
      ] = await Promise.all([
        apiRequest('/news').catch(() => []),
        apiRequest('/announcements').catch(() => []),
        apiRequest('/services').catch(() => []),
        apiRequest('/leadership').catch(() => []),
        apiRequest('/mayoral-history').catch(() => []),
        apiRequest('/initiatives').catch(() => []),
        apiRequest('/events').catch(() => []),
        apiRequest('/documents').catch(() => []),
        apiRequest('/tourism').catch(() => []),
        apiRequest('/blog').catch(() => []),
        apiRequest('/media').catch(() => []),
        isAuthenticated && (currentUser?.role === 'admin' || currentUser?.role === 'super_admin')
          ? apiRequest('/users').catch(() => [])
          : Promise.resolve([]),
        apiRequest('/hero-video').catch(() => INITIAL_HERO_VIDEO),
        apiRequest('/site-settings').catch(() => INITIAL_SITE_SETTINGS),
        isAuthenticated && (currentUser?.role === 'admin' || currentUser?.role === 'super_admin')
          ? apiRequest('/audit-logs').catch(() => [])
          : Promise.resolve([]),
        apiRequest('/growth-metrics').catch(() => []),
        apiRequest('/administrative-units').catch(() => INITIAL_ADMINISTRATIVE_UNITS),
      ]);

      // Map responses to frontend format
      setNews((newsData || []).map((n: any) => ({ ...n, id: n.id.toString(), createdAt: n.created_at, updatedAt: n.updated_at, image: n.image_url })));
      setPinned((pinnedData || []).map((p: any) => ({ ...p, id: p.id.toString(), createdAt: p.created_at, updatedAt: p.updated_at, expiryDate: p.expiry_date, image: p.image_url })));
      setServices((servicesData || []).map((s: any) => ({ ...s, id: s.id.toString(), createdAt: s.created_at, updatedAt: s.updated_at, contactInfo: s.contact_info })));
      setLeadership((leadershipData || []).map((l: any) => ({ ...l, id: l.id.toString(), createdAt: l.created_at, updatedAt: l.updated_at })));
      setMayoralHistory((historyData || []).map((m: any) => ({ ...m, id: m.id.toString(), createdAt: m.created_at, updatedAt: m.updated_at, mayorName: m.mayor_name, detailedDescription: m.detailed_description })));
      setInitiatives((initiativesData || []).map((i: any) => ({ ...i, id: i.id.toString(), createdAt: i.created_at, updatedAt: i.updated_at, currentStatus: i.current_status, image: i.image_url })));
      setEvents((eventsData || []).map((e: any) => ({ ...e, id: e.id.toString(), createdAt: e.created_at, updatedAt: e.updated_at })));
      setDocuments((docsData || []).map((d: any) => ({ ...d, id: d.id.toString(), createdAt: d.created_at, updatedAt: d.updated_at, fileUrl: d.file_url, coverImage: d.cover_image, altIcon: d.alt_icon })));
      setTourism((tourismData || []).map((t: any) => ({ ...t, id: t.id.toString(), createdAt: t.created_at, updatedAt: t.updated_at, attractionName: t.attraction_name })));
      setBlog((blogData || []).map((b: any) => ({ ...b, id: b.id.toString(), createdAt: b.created_at, updatedAt: b.updated_at, featuredImage: b.featured_image })));
      setMedia((mediaData || []).map((m: any) => ({ ...m, id: m.id.toString(), createdAt: m.created_at, updatedAt: m.updated_at, thumbnailUrl: m.thumbnail_url, altText: m.alt_text, mimeType: m.mime_type })));
      setUsers((usersData || []).map((u: any) => {
        let perms = u.permissions;
        if (typeof perms === 'string') {
          try { perms = JSON.parse(perms); } catch { perms = []; }
        }
        return { ...u, id: u.id.toString(), createdAt: u.created_at, permissions: Array.isArray(perms) ? perms : [] };
      }));
      setGrowthMetrics((growthMetricsData || []).map((gm: any) => ({
        id: gm.id.toString(),
        year: parseInt(gm.year, 10),
        population: parseInt(gm.population, 10),
        growthRate: parseFloat(gm.growth_rate),
        revenue: parseFloat(gm.revenue),
        createdAt: gm.created_at,
        updatedAt: gm.updated_at,
      })));
      setHeroVideo(heroData);
      setSiteSettings({
        ...settingsData,
        id: settingsData.id?.toString(),
        siteName: settingsData.site_name,
        siteDescription: settingsData.site_description,
        contactEmail: settingsData.contact_email,
        contactPhone: settingsData.contact_phone,
        socialLinks: settingsData.social_links,
        logoUrl: settingsData.logo_url,
        faviconUrl: settingsData.favicon_url,
        footerText: settingsData.footer_text,
        aboutUs: settingsData.about_us,
        mayorsMessage: settingsData.mayors_message,
        mayorsMessageAuthor: settingsData.mayors_message_author,
        mayorsMessagePhoto: settingsData.mayors_message_photo,
        established: settingsData.established,
        area: settingsData.area,
        altitude: settingsData.altitude,
        avgClimate: settingsData.avg_climate,
        population: settingsData.population,
        administrativeStructure: settingsData.administrative_structure,
        vision: settingsData.vision,
        mission: settingsData.mission,
        mandate: settingsData.mandate,
        updatedAt: settingsData.updated_at,
      });
      setAuditLogs((auditLogsData || []).map((al: any) => ({ ...al, id: al.id.toString(), userName: al.user_name, contentType: al.content_type, contentId: al.content_id, contentTitle: al.content_title })));
      
      setAdministrativeUnits((adminUnitsData || []).map((au: any) => {
        let members = au.members;
        if (typeof members === 'string') {
          try {
            members = JSON.parse(members);
          } catch (e) {
            members = [];
          }
        }
        return {
          ...au,
          id: au.id.toString(),
          createdAt: au.created_at,
          updatedAt: au.updated_at,
          members: Array.isArray(members) ? members : []
        };
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('fetchAll error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load if authenticated on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
    }
  }, [isAuthenticated]);

  // ---------- CRUD Handlers Factory ----------
  const createResourceHandlers = <T extends { id: string }>(
    resource: string,
    setState: React.Dispatch<React.SetStateAction<T[]>>,
    mapping: Record<string, string> = {}
  ) => {
    const reverseMap = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]));
    const mapResponse = (data: any): T => {
      const mapped: any = { ...data, id: data.id.toString() };
      Object.entries(data).forEach(([key, value]) => {
        if (reverseMap[key]) mapped[reverseMap[key]] = value;
        if (key === 'created_at') mapped.createdAt = value;
        if (key === 'updated_at') mapped.updatedAt = value;
      });
      return mapped;
    };

    const add = async (item: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const body: any = {};
        Object.entries(item).forEach(([k, v]) => {
          const dbKey = mapping[k] || k;
          body[dbKey] = v;
        });
        const saved = await apiRequest(`/${resource}`, 'POST', body);
        const mapped = mapResponse(saved);
        setState(prev => [mapped, ...prev]);
        logAction('Create', resource, mapped.id, (mapped as any).title || (mapped as any).name || 'Item');
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    const update = async (id: string, item: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const body: any = {};
        Object.entries(item).forEach(([k, v]) => {
          const dbKey = mapping[k] || k;
          body[dbKey] = v;
        });
        const updated = await apiRequest(`/${resource}/${id}`, 'PUT', body);
        const mapped = mapResponse(updated);
        setState(prev => prev.map(i => (i.id === id ? mapped : i)));
        logAction('Update', resource, id, (mapped as any).title || (mapped as any).name || 'Item');
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    const remove = async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await apiRequest(`/${resource}/${id}`, 'DELETE');
        setState(prev => prev.filter(i => i.id !== id));
        logAction('Delete', resource, id, 'Item');
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    };

    return { add, update, remove };
  };

  // Instantiate handlers
  const newsHandlers = createResourceHandlers('news', setNews, { image: 'image_url' });
  const pinnedHandlers = createResourceHandlers('announcements', setPinned, { expiryDate: 'expiry_date', image: 'image_url' });
  const serviceHandlers = createResourceHandlers('services', setServices, { contactInfo: 'contact_info' });
  const leadershipHandlers = createResourceHandlers('leadership', setLeadership);
  const historyHandlers = createResourceHandlers('mayoral-history', setMayoralHistory, { mayorName: 'mayor_name', detailedDescription: 'detailed_description' });
  const initiativeHandlers = createResourceHandlers('initiatives', setInitiatives, { currentStatus: 'current_status', image: 'image_url' });
  const eventHandlers = createResourceHandlers('events', setEvents);
  const docHandlers = createResourceHandlers('documents', setDocuments, { fileUrl: 'file_url', coverImage: 'cover_image', altIcon: 'alt_icon' });
  const tourismHandlers = createResourceHandlers('tourism', setTourism, { attractionName: 'attraction_name' });
  const blogHandlers = createResourceHandlers('blog', setBlog, { featuredImage: 'featured_image' });
  const mediaHandlers = createResourceHandlers('media', setMedia, { thumbnailUrl: 'thumbnail_url', altText: 'alt_text', mimeType: 'mime_type' });
  const growthMetricsHandlers = createResourceHandlers('growth-metrics', setGrowthMetrics, { growthRate: 'growth_rate' });
 
  // Custom handlers for administrative units (to properly handle JSON `members`)
const adminUnitsHandlers = {
  add: async (item: any) => {
    setIsLoading(true);
    setError(null);
    try {
      let bodyItem = { ...item };
      if (Array.isArray(bodyItem.members)) {
        bodyItem.members = JSON.stringify(bodyItem.members);
      } else if (typeof bodyItem.members === 'string') {
        try {
          JSON.parse(bodyItem.members);
        } catch {
          bodyItem.members = '[]';
        }
      } else {
        bodyItem.members = '[]';
      }

      const mapping: Record<string, string> = {
        parentUnit: 'parent_unit',
        officeLocation: 'office_location',
        contactPhone: 'contact_phone',
        delegationCode: 'delegation_code',
        sectorHierarchy: 'sector_hierarchy'
      };
      const body: any = {};
      Object.entries(bodyItem).forEach(([k, v]) => {
        const dbKey = mapping[k] || k;
        body[dbKey] = v;
      });
      const saved = await apiRequest('/administrative-units', 'POST', body);
      const mapped = {
        ...saved,
        id: saved.id.toString(),
        createdAt: saved.created_at,
        updatedAt: saved.updated_at,
        members: Array.isArray(saved.members) ? saved.members : (saved.members ? JSON.parse(saved.members) : [])
      };
      setAdministrativeUnits(prev => [mapped, ...prev]);
      logAction('Create', 'administrative-units', mapped.id, mapped.name);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  update: async (id: string, item: any) => {
    setIsLoading(true);
    setError(null);
    try {
      let bodyItem = { ...item };
      if (Array.isArray(bodyItem.members)) {
        bodyItem.members = JSON.stringify(bodyItem.members);
      } else if (typeof bodyItem.members === 'string') {
        try {
          JSON.parse(bodyItem.members);
        } catch {
          bodyItem.members = '[]';
        }
      } else {
        bodyItem.members = '[]';
      }

      const mapping: Record<string, string> = {
        parentUnit: 'parent_unit',
        officeLocation: 'office_location',
        contactPhone: 'contact_phone',
        delegationCode: 'delegation_code',
        sectorHierarchy: 'sector_hierarchy'
      };
      const body: any = {};
      Object.entries(bodyItem).forEach(([k, v]) => {
        const dbKey = mapping[k] || k;
        body[dbKey] = v;
      });
      const updated = await apiRequest(`/administrative-units/${id}`, 'PUT', body);
      const mapped = {
        ...updated,
        id: updated.id.toString(),
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
        members: Array.isArray(updated.members) ? updated.members : (updated.members ? JSON.parse(updated.members) : [])
      };
      setAdministrativeUnits(prev => prev.map(u => u.id === id ? mapped : u));
      logAction('Update', 'administrative-units', id, mapped.name);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  remove: async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiRequest(`/administrative-units/${id}`, 'DELETE');
      setAdministrativeUnits(prev => prev.filter(u => u.id !== id));
      logAction('Delete', 'administrative-units', id, 'Item');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }
};

  // Users handlers (special due to permissions)
  const userHandlers = {
    add: async (item: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const saved = await apiRequest('/users', 'POST', item);
        const mapped = {
          ...saved,
          id: saved.id.toString(),
          createdAt: saved.created_at,
          permissions: Array.isArray(saved.permissions) ? saved.permissions : [],
        };
        setUsers(prev => [mapped, ...prev]);
        logAction('Create', 'users', mapped.id, mapped.username);
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    update: async (id: string, item: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const saved = await apiRequest(`/users/${id}`, 'PUT', item);
        const mapped = {
          ...saved,
          id: saved.id.toString(),
          createdAt: saved.created_at,
          permissions: Array.isArray(saved.permissions) ? saved.permissions : [],
        };
        setUsers(prev => prev.map(u => (u.id === id ? mapped : u)));
        logAction('Update', 'users', id, item.username || 'User');
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    delete: async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await apiRequest(`/users/${id}`, 'DELETE');
        setUsers(prev => prev.filter(u => u.id !== id));
        logAction('Delete', 'users', id, 'User');
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
  };

  const updateProfile = async (item: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await apiRequest('/profile', 'PUT', item);
      setCurrentUser(updated);
      localStorage.setItem('cms_user', JSON.stringify(updated));
      setUsers(prev => prev.map(u => (u.id === updated.id.toString() ? { ...u, ...updated, id: updated.id.toString() } : u)));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeroVideo = async (item: Partial<HeroVideoConfig>) => {
    setIsLoading(true);
    try {
      const mapping: any = { videoUrl: 'video_url', fallbackImage: 'fallback_image', showOverlay: 'show_overlay', overlayStyle: 'overlay_style', overlayOpacity: 'overlay_opacity', ctaText: 'cta_text', ctaLink: 'cta_link', videoQuality: 'video_quality', lowBandwidthMode: 'low_bandwidth_mode', lazyLoad: 'lazy_load' };
      const body: any = {};
      Object.entries(item).forEach(([k, v]) => { if (mapping[k]) body[mapping[k]] = v; else body[k] = v; });
      const updated = await apiRequest('/hero-video', 'PUT', body);
      setHeroVideo(updated);
    } catch (err) { setError(err instanceof Error ? err.message : 'Update failed'); }
    finally { setIsLoading(false); }
  };

  const updateSiteSettings = async (item: Partial<SiteSettings>) => {
    setIsLoading(true);
    try {
      const mapping: any = { siteName: 'site_name', siteDescription: 'site_description', contactEmail: 'contact_email', contactPhone: 'contact_phone', socialLinks: 'social_links', logoUrl: 'logo_url', faviconUrl: 'favicon_url', footerText: 'footer_text', aboutUs: 'about_us', mayorsMessage: 'mayors_message', mayorsMessageAuthor: 'mayors_message_author', mayorsMessagePhoto: 'mayors_message_photo', established: 'established', area: 'area', altitude: 'altitude', avgClimate: 'avg_climate', population: 'population', administrativeStructure: 'administrative_structure', vision: 'vision', mission: 'mission', mandate: 'mandate' };
      const body: any = {};
      Object.entries(item).forEach(([k, v]) => { if (mapping[k]) body[mapping[k]] = v; else body[k] = v; });
      const updated = await apiRequest('/site-settings', 'PUT', body);
      setSiteSettings({
        ...updated,
        id: updated.id.toString(),
        siteName: updated.site_name,
        siteDescription: updated.site_description,
        contactEmail: updated.contact_email,
        contactPhone: updated.contact_phone,
        socialLinks: updated.social_links,
        logoUrl: updated.logo_url,
        faviconUrl: updated.favicon_url,
        footerText: updated.footer_text,
        aboutUs: updated.about_us,
        mayorsMessage: updated.mayors_message,
        mayorsMessageAuthor: updated.mayors_message_author,
        mayorsMessagePhoto: updated.mayors_message_photo,
        established: updated.established,
        area: updated.area,
        altitude: updated.altitude,
        avgClimate: updated.avg_climate,
        population: updated.population,
        administrativeStructure: updated.administrative_structure,
        vision: updated.vision,
        mission: updated.mission,
        mandate: updated.mandate,
        updatedAt: updated.updated_at,
      });
    } catch (err) { setError(err instanceof Error ? err.message : 'Update failed'); }
    finally { setIsLoading(false); }
  };

  // ---------- Provider Value ----------
  const value: CMSContextType = {
    news,
    pinned,
    services,
    leadership,
    mayoralHistory,
    initiatives,
    events,
    documents,
    tourism,
    blog,
    media,
    administrativeUnits,
    growthMetrics,
    users,
    heroVideo,
    siteSettings,
    auditLogs,
    currentUser,
    isAuthenticated,
    currentLanguage,
    isLoading,
    error,
    setLanguage,
    login,
    logout,
    logAction,
    fetchAll,
    addNews: newsHandlers.add,
    updateNews: newsHandlers.update,
    deleteNews: newsHandlers.remove,
    addPinned: pinnedHandlers.add,
    updatePinned: pinnedHandlers.update,
    deletePinned: pinnedHandlers.remove,
    addService: serviceHandlers.add,
    updateService: serviceHandlers.update,
    deleteService: serviceHandlers.remove,
    addLeadership: leadershipHandlers.add,
    updateLeadership: leadershipHandlers.update,
    deleteLeadership: leadershipHandlers.remove,
    addMayoralHistory: historyHandlers.add,
    updateMayoralHistory: historyHandlers.update,
    deleteMayoralHistory: historyHandlers.remove,
    addInitiative: initiativeHandlers.add,
    updateInitiative: initiativeHandlers.update,
    deleteInitiative: initiativeHandlers.remove,
    addEvent: eventHandlers.add,
    updateEvent: eventHandlers.update,
    deleteEvent: eventHandlers.remove,
    addDocument: docHandlers.add,
    updateDocument: docHandlers.update,
    deleteDocument: docHandlers.remove,
    addTourism: tourismHandlers.add,
    updateTourism: tourismHandlers.update,
    deleteTourism: tourismHandlers.remove,
    addBlog: blogHandlers.add,
    updateBlog: blogHandlers.update,
    deleteBlog: blogHandlers.remove,
    addMedia: mediaHandlers.add,
    updateMedia: mediaHandlers.update,
    deleteMedia: mediaHandlers.remove,
    addAdministrativeUnit: adminUnitsHandlers.add,
    updateAdministrativeUnit: adminUnitsHandlers.update,
    deleteAdministrativeUnit: adminUnitsHandlers.remove,
    addGrowthMetric: growthMetricsHandlers.add,
    updateGrowthMetric: growthMetricsHandlers.update,
    deleteGrowthMetric: growthMetricsHandlers.remove,
    addUser: userHandlers.add,
    updateUser: userHandlers.update,
    deleteUser: userHandlers.delete,
    updateProfile,
    updateHeroVideo,
    updateSiteSettings,
    theme,
    toggleTheme,
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error('useCMS must be used within a CMSProvider');
  return context;
};