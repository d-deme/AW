import { 
  NewsPost, 
  Announcement, 
  CityService, 
  LeadershipProfile, 
  MayoralHistory, 
  Initiative, 
  Attraction
} from '../types';

import {
  NewsItemDbSchema,
  AnnouncementDbSchema,
  ServiceDbSchema,
  LeadershipDbSchema,
  MayoralHistoryDbSchema,
  InitiativeDbSchema,
  TourismDbSchema,
  DocumentDbSchema
} from './validation';

/**
 * Enterprise Adapter to programmatically map and integrate
 * the Backend CMS Database schema with the existing Adama City Official Website components.
 * Configured with robust Zod validation parser constraints to enforce safety fallback defaults.
 */

// 1. News Mapper
export const mapCMSNewsItemToNewsPost = (item: any): NewsPost => {
  if (!item) return {} as NewsPost;
  
  // If already in frontend structure
  if ('imageUrl' in item) return item as NewsPost;

  // Validate using Zod schema
  const parsedResult = NewsItemDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    title: item.title || 'Official Bulletin Update',
    content: item.content || 'Detailed report and municipal guidance under construction.',
    category: item.category || 'Press Release',
    image_url: item.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    tags: Array.isArray(item.tags) ? item.tags : [],
    author: item.author || 'Municipal Editorial Office',
    published_at: item.published_at || item.created_at,
    created_at: item.created_at
  };

  const pubDate = cms.published_at || cms.created_at || new Date();
  
  return {
    id: String(cms.id),
    title: cms.title,
    author: cms.author,
    date: pubDate ? new Date(pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
    category: (cms.category as any) || 'Press Release',
    summary: cms.content ? cms.content.split('\n')[0].substring(0, 160) + '...' : 'Executive announcement from Adama City Management.',
    content: cms.content,
    imageUrl: cms.image_url,
    tags: cms.tags,
  };
};

// 2. Announcement Mapper
export const mapCMSAnnouncementToAnnouncement = (item: any): Announcement => {
  if (!item) return {} as Announcement;

  if ('message' in item && 'link' in item) {
    return {
      ...item,
      imageUrl: item.imageUrl || ''
    } as Announcement;
  }

  // Validate using Zod schema
  const parsedResult = AnnouncementDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    title: item.title || 'Municipal Advisory circular',
    message: item.message || 'Public services operate under standard holiday coordinates today.',
    type: item.type || 'general',
    priority: item.priority || 'medium',
    status: item.status || 'published'
  };

  return {
    id: String(cms.id),
    title: cms.title,
    message: cms.message,
    link: cms.type === 'emergency' ? '#contact' : '#services',
    linkText: 'View Official Bulletin',
    active: cms.status === 'published' || cms.status === 'active',
    category: (item.category || (cms.type === 'emergency' ? 'General' : 'General')) as any,
    imageUrl: item.image_url || item.imageUrl || ''
  };
};

// 3. Service Mapper
export const mapCMSServiceToCityService = (item: any): CityService => {
  if (!item) return {} as CityService;

  if ('title' in item && 'icon' in item) return item as CityService;

  // Validate using Zod schema
  const parsedResult = ServiceDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    name: item.name || 'Direct Licensing Gate',
    description: item.description || 'Secure public interface coordinate for citizen and investor registry fillings.',
    requirements: Array.isArray(item.requirements) ? item.requirements : [],
    process: item.process || 'Submit Kebele clearance certificate online, collect processed deliverables within 48 hours.',
    contact_info: item.contact_info || 'Administrative Service Desk',
    status: item.status || 'published'
  };
  
  // Map relevant icon
  let mappedIcon = 'FileText';
  const nameLower = (cms.name || '').toLowerCase();
  if (nameLower.includes('tax') || nameLower.includes('revenue') || nameLower.includes('pay')) {
    mappedIcon = 'Briefcase';
  } else if (nameLower.includes('id') || nameLower.includes('certificate') || nameLower.includes('card')) {
    mappedIcon = 'FileText';
  } else if (nameLower.includes('tourism') || nameLower.includes('hotel') || nameLower.includes('map')) {
    mappedIcon = 'MapPin';
  }

  // Set default category
  let parsedCategory: 'Resident' | 'Business' | 'Visitor' = 'Resident';
  if (nameLower.includes('investment') || nameLower.includes('business') || nameLower.includes('trade')) {
    parsedCategory = 'Business';
  } else if (nameLower.includes('tour') || nameLower.includes('museum') || nameLower.includes('visitor')) {
    parsedCategory = 'Visitor';
  }

  return {
    id: String(cms.id),
    title: cms.name,
    description: cms.description,
    icon: mappedIcon,
    link: '#services',
    category: parsedCategory,
    requirements: cms.requirements,
    processSteps: cms.process ? [cms.process] : ['Submission', 'Municipal Audit', 'Directorial Signing', 'License Issuance'],
    contactInfo: cms.contact_info
  };
};

// 4. Leadership Mapper
export const mapCMSLeadershipToLeadershipProfile = (item: any): LeadershipProfile => {
  if (!item) return {} as LeadershipProfile;

  if ('role' in item && 'bio' in item) return item as LeadershipProfile;

  // Validate using Zod schema
  const parsedResult = LeadershipDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    name: item.name || 'Administrative Representative',
    title: item.title || 'Municipal Coordinating Officer',
    department: item.department || 'Office of Executive Mayor',
    biography: item.biography || 'Devoted civil representative guiding sector programs.',
    responsibilities: Array.isArray(item.responsibilities) ? item.responsibilities : [],
    email: item.email || 'info@adama.gov.et',
    phone: item.phone || '+251-22-111-2092',
    photo: item.photo || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    status: item.status || 'published'
  };

  return {
    id: String(cms.id),
    name: cms.name,
    role: cms.title,
    bio: cms.biography,
    responsibilities: cms.responsibilities,
    contact: cms.email || cms.phone || 'admin@adamacity.gov.et',
    imageUrl: cms.photo
  };
};

// 5. Mayoral History Mapper
export const mapCMSMayoralHistoryToMayoralHistory = (item: any): MayoralHistory => {
  if (!item) return {} as MayoralHistory;

  if ('photoUrl' in item && 'details' in item) return item as MayoralHistory;

  // Validate using Zod schema
  const parsedResult = MayoralHistoryDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    mayor_name: item.mayor_name || 'Legacy Mayor represent',
    photo: item.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    term: item.term || 'Decade Leadership',
    summary: item.summary || 'Guiding legacy programs.',
    detailed_description: item.detailed_description || 'Detailed historical logs on city transition campaigns.',
    achievements: Array.isArray(item.achievements) ? item.achievements : [],
    challenges: Array.isArray(item.challenges) ? item.challenges : [],
    kpis: Array.isArray(item.kpis) ? item.kpis : [],
    status: item.status || 'published'
  };

  // KPIs parser (some backends keep this as stringified JSON or raw string metrics)
  let structuredKpis: { label: string; value: string | number }[] = [
    { label: 'Infrastructure projects completed', value: '45+' },
    { label: 'Annual FDI capitalization', value: '$120M+' }
  ];

  if (cms.kpis && cms.kpis.length > 0) {
    try {
      structuredKpis = cms.kpis.map((kpiStr: string) => {
        if (kpiStr.includes(':')) {
          const [label, val] = kpiStr.split(':');
          return { label: label.trim(), value: val.trim() };
        }
        return { label: 'Key Performance Metric', value: kpiStr };
      });
    } catch (e) {
      console.warn("Could not parse mayoral KPIs", e);
    }
  }

  return {
    id: String(cms.id),
    name: cms.mayor_name,
    photoUrl: cms.photo,
    term: cms.term,
    summary: cms.summary,
    details: cms.detailed_description,
    stakeholders: [],
    achievements: cms.achievements,
    initiatives: [], // Ingested via CMS Mayoral relationship keys if needed
    challenges: cms.challenges,
    kpis: structuredKpis
  };
};

// 6. Initiative Mapper
export const mapCMSInitiativeToInitiative = (item: any): Initiative => {
  if (!item) return {} as Initiative;

  if ('status' in item && 'imageUrl' in item) return item as Initiative;

  // Validate using Zod schema
  const parsedResult = InitiativeDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    title: item.title || 'Green Corridors Campaign',
    description: item.description || 'Promoting environmental trees canopy layout parameters across highways.',
    current_status: item.current_status || 'Ongoing',
    impact: item.impact || 'Carbon neutral offset integration',
    category: item.category || 'Transit',
    image_url: item.image_url || 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800',
    timeline: item.timeline || '2025 - 2026',
    status: item.status || 'published'
  };

  // Let's standardise the status
  let mappedStatus: 'Ongoing' | 'Completed' | 'Concept' | 'Planned' = 'Ongoing';
  const cStat = (cms.current_status || '').toLowerCase();
  if (cStat.includes('complete')) mappedStatus = 'Completed';
  else if (cStat.includes('concept')) mappedStatus = 'Concept';
  else if (cStat.includes('plan')) mappedStatus = 'Planned';

  return {
    id: String(cms.id),
    title: cms.title,
    description: cms.description,
    status: mappedStatus as any,
    impact: cms.impact,
    category: (cms.category as any) || 'Smart City',
    imageUrl: cms.image_url,
    timeline: cms.timeline
  };
};

// 7. Tourism Mapper
export const mapCMSTourismToAttraction = (item: any): Attraction => {
  if (!item) return {} as Attraction;

  if ('imageUrl' in item && 'name' in item) return item as Attraction;

  // Validate using Zod schema
  const parsedResult = TourismDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    attraction_name: item.attraction_name || 'Awash Valley Eco park',
    description: item.description || 'Natural scenic routes flanking the Rift corridor hotspring spa baths.',
    location: item.location || 'Adama Region',
    images: Array.isArray(item.images) ? item.images : [],
    category: item.category || 'Eco Tourism',
    rating: Number(item.rating) || 4.5,
    status: item.status || 'published'
  };

  return {
    id: String(cms.id),
    name: cms.attraction_name,
    description: cms.description,
    imageUrl: cms.images && cms.images.length > 0 ? cms.images[0] : 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800',
    location: cms.location,
    rating: cms.rating,
    category: cms.category
  };
};

// 8. Documents Mapper
export const mapCMSDocumentToDocument = (item: any): any => {
  if (!item) return {};

  if ('size' in item) return item; // Already mapped

  // Validate using Zod schema
  const parsedResult = DocumentDbSchema.safeParse(item);
  const cms = parsedResult.success ? parsedResult.data : {
    id: Number(item.id) || Math.random(),
    title: item.title || 'Municipal Budget Ledger Circular',
    category: item.category || 'Gazette',
    date: item.date || new Date().toLocaleDateString(),
    file_url: item.file_url || '#',
    status: item.status || 'published'
  };

  return {
    title: cms.title,
    type: cms.category,
    date: cms.date,
    size: 'PDF File',
    fileUrl: cms.file_url
  };
};
