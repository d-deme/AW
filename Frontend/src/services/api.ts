// src/services/api.ts
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnnouncementSchema, NewsPostSchema } from './validation';
import {
  mapCMSNewsItemToNewsPost,
  mapCMSAnnouncementToAnnouncement,
  mapCMSServiceToCityService,
  mapCMSLeadershipToLeadershipProfile,
  mapCMSMayoralHistoryToMayoralHistory,
  mapCMSInitiativeToInitiative,
  mapCMSTourismToAttraction,
  mapCMSDocumentToDocument
} from './cmsAdapter';

// ========== CONFIGURATION ==========
// Use Vite environment variable, fallback to localhost
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to build full URL
const buildUrl = (path: string) => {
  const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

// ========== ADAPTER FOR USEAPI ==========
const getAdapterForEndpoint = (endpoint: string) => {
  const cleanEP = endpoint.split('?')[0].replace(/^\//, '');
  switch (cleanEP) {
    case 'news':
      return mapCMSNewsItemToNewsPost;
    case 'announcements':
      return mapCMSAnnouncementToAnnouncement;
    case 'services':
      return mapCMSServiceToCityService;
    case 'leadership':      // corrected from 'profiles'
      return mapCMSLeadershipToLeadershipProfile;
    case 'mayoral-history':
      return mapCMSMayoralHistoryToMayoralHistory;
    case 'initiatives':
      return mapCMSInitiativeToInitiative;
    case 'tourism':
      return mapCMSTourismToAttraction;
    case 'documents':
      return mapCMSDocumentToDocument;
    default:
      return null;
  }
};

// ========== AUTHENTICATED FETCH (for admin actions) ==========
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  return response;
};

// ========== API SERVICE ==========
export const api = {
  // ---- News ----
  getNews: async () => {
    const res = await fetch(buildUrl('/news'));
    if (!res.ok) throw new Error(`Failed to fetch news: ${res.statusText}`);
    return res.json();
  },
  createNewsPost: async (data: any) => {
    const validated = NewsPostSchema.parse(data);
    const res = await authenticatedFetch(buildUrl('/news'), {
      method: 'POST',
      body: JSON.stringify(validated)
    });
    window.dispatchEvent(new CustomEvent('adama_cms_state_change'));
    return res.json();
  },
  updateNewsPost: async (id: string, data: any) => {
    const validated = NewsPostSchema.parse(data);
    const res = await authenticatedFetch(buildUrl(`/news/${id}`), {
      method: 'PUT',
      body: JSON.stringify(validated)
    });
    window.dispatchEvent(new CustomEvent('adama_cms_state_change'));
    return res.json();
  },
  deleteNewsPost: async (id: string) => {
    await authenticatedFetch(buildUrl(`/news/${id}`), { method: 'DELETE' });
    window.dispatchEvent(new CustomEvent('adama_cms_state_change'));
    return { ok: true };
  },

  // ---- Announcements ----
  getAnnouncements: async () => {
    const res = await fetch(buildUrl('/announcements'));
    if (!res.ok) throw new Error(`Failed to fetch announcements: ${res.statusText}`);
    return res.json();
  },
  createAnnouncement: async (data: any) => {
    const validated = AnnouncementSchema.parse(data);
    const res = await authenticatedFetch(buildUrl('/announcements'), {
      method: 'POST',
      body: JSON.stringify(validated)
    });
    window.dispatchEvent(new CustomEvent('adama_cms_state_change'));
    return res.json();
  },
  updateAnnouncement: async (id: string, data: any) => {
    const validated = AnnouncementSchema.parse(data);
    const res = await authenticatedFetch(buildUrl(`/announcements/${id}`), {
      method: 'PUT',
      body: JSON.stringify(validated)
    });
    window.dispatchEvent(new CustomEvent('adama_cms_state_change'));
    return res.json();
  },
  deleteAnnouncement: async (id: string) => {
    await authenticatedFetch(buildUrl(`/announcements/${id}`), { method: 'DELETE' });
    window.dispatchEvent(new CustomEvent('adama_cms_state_change'));
    return { ok: true };
  },

  // ---- Services ----
  getServices: async () => {
    const res = await fetch(buildUrl('/services'));
    return res.json();
  },

  // ---- Events ----
  getEvents: async () => {
    const res = await fetch(buildUrl('/events'));
    return res.json();
  },

  // ---- Site Settings (about, mayor's message, etc.) ----
  getSiteSettings: async () => {
    const res = await fetch(buildUrl('/site-settings'));
    return res.json();
  },
  updateSiteSettings: async (data: any) => {
    const res = await authenticatedFetch(buildUrl('/site-settings'), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ---- Leadership (formerly /profiles) ----
  getLeadership: async () => {
    const res = await fetch(buildUrl('/leadership?status=published'));
    return res.json();
  },

  // ---- Initiatives ----
  getInitiatives: async () => {
    const res = await fetch(buildUrl('/initiatives'));
    return res.json();
  },

  // ---- Mayoral History ----
  getMayoralHistory: async () => {
    const res = await fetch(buildUrl('/mayoral-history'));
    return res.json();
  },

  // ---- Tourism ----
  getTourism: async () => {
    const res = await fetch(buildUrl('/tourism'));
    return res.json();
  },

  // ---- Documents ----
  getDocuments: async () => {
    const res = await fetch(buildUrl('/documents'));
    return res.json();
  },

  // ---- Blog ----
  getBlog: async () => {
    const res = await fetch(buildUrl('/blog'));
    return res.json();
  },

  // ---- Hero Video ----
  getHeroVideo: async () => {
    const res = await fetch(buildUrl('/hero-video'));
    return res.json();
  },
  updateHeroVideo: async (data: any) => {
    const res = await authenticatedFetch(buildUrl('/hero-video'), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ---- Permits ----
  getPermits: async () => {
    const res = await fetch(buildUrl('/permits'));
    return res.json();
  },
  createPermit: async (data: any) => {
    const res = await authenticatedFetch(buildUrl('/permits'), {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ---- Tickets ----
  getTickets: async () => {
    const res = await fetch(buildUrl('/tickets'));
    return res.json();
  },
  createTicket: async (data: any) => {
    const res = await authenticatedFetch(buildUrl('/tickets'), {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ---- Budgets ----
  getBudgets: async () => {
    const res = await fetch(buildUrl('/budgets'));
    return res.json();
  },
  createBudget: async (data: any) => {
    const res = await authenticatedFetch(buildUrl('/budgets'), {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ---- Tourism Packages ----
  getTourismPackages: async () => {
    const res = await fetch(buildUrl('/tourism-packages'));
    return res.json();
  },
  createTourismPackage: async (data: any) => {
    const res = await authenticatedFetch(buildUrl('/tourism-packages'), {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ---- Administrative Units (formerly /admin-structure, /administrative_units) ----
  getAdministrativeUnits: async () => {
    const res = await fetch(buildUrl('/administrative-units?status=published'));
    return res.json();
  },

  // ---- Growth Metrics (historical/demographic records) ----
  getGrowthMetrics: async () => {
    const res = await fetch(buildUrl('/growth-metrics'));
    return res.json();
  },

  // ========== DEPRECATED / REMOVED ENDPOINTS ==========
  // The following endpoints do not exist in the backend.
  // Use getSiteSettings() or getGrowthMetrics() instead.
  // getAbout, getMayorMessage, getMetrics, getKpis, getNavLinks,
  // getHero, getMapZones, getMapLocations, getBusinessStats,
  // getTourismDestinations, getProjects
};

// ========== REACT QUERY HOOK ==========
export const useApi = <T,>(endpoint: string) => {
  const [lang] = useState('en');      // or get from your language store
  const [status] = useState('published');

  const { data, isLoading: loading, error, refetch } = useQuery<T, Error>({
    queryKey: [endpoint, lang, status],
    queryFn: async () => {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = buildUrl(`${cleanEndpoint}?lang=${lang}&status=${status}`);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${endpoint} (${response.status})`);
        }
        const rawData = await response.json();
        const adapter = getAdapterForEndpoint(endpoint);
        if (adapter) {
          if (Array.isArray(rawData)) {
            return rawData.map(adapter) as unknown as T;
          } else if (rawData && typeof rawData === 'object') {
            return adapter(rawData) as unknown as T;
          }
        }
        return rawData as T;
      } catch (err) {
        console.error(`[CMS API Consumer] Failed to fetch ${url}`, err);
        throw err;
      }
    },
  });

  return { data: data || null, loading, error: error?.message || null, refetch };
};

// For backward compatibility, keep the same export names
export const API_URL = API_BASE;