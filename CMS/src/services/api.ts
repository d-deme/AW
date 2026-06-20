// Adama_W/src/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to attach JWT token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// ========== Auth APIs ==========
export const authAPI = {
  login: (username: string, password: string) =>
    request<{ token: string; refresh_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: (refreshToken: string) =>
    request('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }) }),
};

// ========== CRUD Factory ==========
export const createCrudService = (resource: string) => ({
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`${resource}${query}`);
  },
  getById: (id: string | number) => request(`${resource}/${id}`),
  create: (data: any) => request(`${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string | number, data: any) => request(`${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string | number) => request(`${resource}/${id}`, { method: 'DELETE' }),
});

// ========== Standard CRUD Services ==========
export const newsService = createCrudService('/news');
export const announcementsService = createCrudService('/announcements');
export const servicesService = createCrudService('/services');
export const leadershipService = createCrudService('/leadership');
export const mayoralHistoryService = createCrudService('/mayoral-history');
export const initiativesService = createCrudService('/initiatives');
export const eventsService = createCrudService('/events');
export const documentsService = createCrudService('/documents');
export const tourismService = createCrudService('/tourism');
export const blogService = createCrudService('/blog');
export const mediaService = createCrudService('/media');
export const administrativeUnitsService = createCrudService('/administrative-units');
export const permitsService = createCrudService('/permits');
export const ticketsService = createCrudService('/tickets');
export const budgetsService = createCrudService('/budgets');
export const tourismPackagesService = createCrudService('/tourism-packages');
export const growthMetricsService = createCrudService('/growth-metrics');
export const dynamicSchemasService = createCrudService('/dynamic-schemas');

// ========== Dynamic Content (custom because schema name in URL) ==========
export const dynamicContentService = (schemaName: string) => ({
  getAll: () => request<any[]>(`/dynamic-content/${schemaName}`),
  create: (data: any) => request<any>(`/dynamic-content/${schemaName}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) => request<any>(`/dynamic-content/${schemaName}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<any>(`/dynamic-content/${schemaName}/${id}`, { method: 'DELETE' }),
});

// ========== Singleton Services ==========
export const heroVideoService = {
  get: () => request('/hero-video'),
  update: (data: any) => request('/hero-video', { method: 'PUT', body: JSON.stringify(data) }),
};

export const siteSettingsService = {
  get: () => request('/site-settings'),
  update: (data: any) => request('/site-settings', { method: 'PUT', body: JSON.stringify(data) }),
};

// ========== CDN Service with TypeScript interfaces ==========
export interface CdnRegion {
  name: string;
  status: string;
  latency: string;
  cacheHitRatio: string;
}

export interface CdnConfig {
  decoupledMode: boolean;
  cdnBaseUrl: string;
  purpleEdgeServer: string;
  regions: CdnRegion[];
  cachePurgedAt: string;
}

export const cdnService = {
  getConfig: () => request<CdnConfig>('/cdn-config'),
  updateConfig: (data: { decoupledMode?: boolean; cdnBaseUrl?: string }) =>
    request<CdnConfig>('/cdn-config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  purgeCache: () =>
    request<{ success: boolean; message: string }>('/cdn-config/purge', {
      method: 'POST',
    }),
};