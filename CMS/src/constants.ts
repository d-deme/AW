import { 
  NewsAnnouncement, 
  PinnedAnnouncement, 
  Service, 
  LeadershipProfile, 
  MayoralHistory, 
  Language,
  Initiative,
  Event,
  DocumentPublication,
  TourismContent,
  BlogEntry,
  MediaItem,
  HeroVideoConfig,
  SiteSettings,
  AdministrativeUnit
} from './types';

export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'om', name: 'Afaan Oromo' },
  { code: 'am', name: 'Amharic' },
];

export const INITIAL_NEWS: NewsAnnouncement[] = [
  {
    id: 'news-1',
    title: 'Adama City Smart Infrastructure Project Launch',
    date: '2026-04-01',
    category: 'Infrastructure',
    content: 'Adama City has officially launched its new smart infrastructure project aimed at improving traffic flow and urban connectivity.',
    image: 'https://picsum.photos/seed/adama-infra/800/600',
    tags: ['SmartCity', 'Infrastructure', 'Development'],
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-03-25T10:00:00Z',
    updatedAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'news-2',
    title: 'New Green Park Initiative in Adama',
    date: '2026-04-05',
    category: 'Environment',
    content: 'The city council has approved the development of three new public parks to enhance the green spaces within the urban area.',
    image: 'https://picsum.photos/seed/adama-park/800/600',
    tags: ['GreenAdama', 'Environment', 'Parks'],
    status: 'published',
    author: 'Editor-Sarah',
    language: 'en',
    createdAt: '2026-04-04T09:00:00Z',
    updatedAt: '2026-04-05T14:00:00Z',
  }
];

export const INITIAL_PINNED: PinnedAnnouncement[] = [
  {
    id: 'pin-1',
    title: 'Urgent: Water Supply Maintenance Notice',
    message: 'Scheduled maintenance for the central water supply system will occur on April 10th from 8:00 AM to 4:00 PM.',
    type: 'Notice',
    expiryDate: '2026-04-11',
    priority: 'High',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-04-06T08:00:00Z',
    updatedAt: '2026-04-06T08:00:00Z',
  },
  {
    id: 'pin-2',
    title: 'Tender: Urban Lighting Expansion Phase II',
    message: 'Adama City invites qualified contractors to submit bids for the expansion of urban street lighting in the eastern district.',
    type: 'Tender',
    expiryDate: '2026-05-15',
    priority: 'Medium',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-04-05T11:00:00Z',
    updatedAt: '2026-04-05T11:00:00Z',
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: 'Business License Registration',
    description: 'Register your new business or renew an existing license with the Adama City Trade Bureau.',
    requirements: ['Valid ID', 'Proof of Address', 'Tax Identification Number', 'Completed Application Form'],
    process: 'Submit documents at the Trade Bureau office, pay processing fee, and receive license within 5 working days.',
    contactInfo: 'Trade Bureau - Office 302, City Hall. Phone: +251 22 111 2222',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'svc-2',
    name: 'Urban Planning & Building Permits',
    description: 'Apply for building permits for residential or commercial construction projects within the city limits.',
    requirements: ['Architectural Plans', 'Land Ownership Documents', 'Environmental Impact Assessment', 'Structural Design'],
    process: 'Initial review of plans, site inspection, final approval by the Urban Planning Committee.',
    contactInfo: 'Urban Planning Dept - Office 105, City Hall. Phone: +251 22 111 3333',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  }
];

export const INITIAL_LEADERSHIP: LeadershipProfile[] = [
  {
    id: 'lead-1',
    name: 'Hon. Hailu Jelde',
    title: 'Mayor of Adama City',
    department: 'Executive Office',
    photo: 'https://picsum.photos/seed/mayor/400/400',
    biography: 'Hon. Hailu Jelde has served as the Mayor of Adama since 2022, focusing on urban modernization and economic growth.',
    responsibilities: ['City Administration', 'Policy Development', 'Public Relations', 'Economic Strategy'],
    email: 'mayor.office@adama.gov.et',
    phone: '+251 22 111 0000',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_MAYORAL_HISTORY: MayoralHistory[] = [
  {
    id: 'hist-1',
    mayorName: 'Dr. Bekele Tadesse',
    photo: 'https://picsum.photos/seed/past-mayor/400/400',
    term: '2015 - 2022',
    summary: 'A period of significant industrial expansion and infrastructure development.',
    detailedDescription: 'Under Dr. Bekele\'s leadership, Adama saw the completion of the major industrial park and the expansion of the city\'s main arterial roads.',
    stakeholders: ['City Council', 'Regional Government', 'Private Investors'],
    achievements: ['Industrial Park Completion', 'Road Expansion Project', 'New Hospital Wing'],
    challenges: ['Rapid Urban Migration', 'Water Supply Scarcity'],
    kpis: ['95% Infrastructure Completion Rate', '20% Increase in Local Employment'],
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_INITIATIVES: Initiative[] = [
  {
    id: 'init-1',
    title: 'Smart Adama 2030',
    description: 'A comprehensive plan to digitize city services and improve urban infrastructure using IoT and AI.',
    category: 'Smart City',
    currentStatus: 'Ongoing',
    timeline: '2024 - 2030',
    impact: 'Expected 30% reduction in traffic congestion and 50% faster service delivery.',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'Adama Annual Cultural Festival',
    date: '2026-05-20T10:00:00Z',
    location: 'Adama City Stadium',
    description: 'Celebrating the rich cultural heritage of Adama and the surrounding region.',
    category: 'Culture',
    image: 'https://picsum.photos/seed/adama-fest/800/600',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_DOCUMENTS: DocumentPublication[] = [
  {
    id: 'doc-1',
    title: 'Adama City Annual Budget 2026',
    category: 'Budget',
    date: '2026-01-10',
    fileUrl: 'https://example.com/budget-2026.pdf',
    description: 'Detailed breakdown of the city\'s financial plan for the year 2026.',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_TOURISM: TourismContent[] = [
  {
    id: 'tour-1',
    attractionName: 'Sodere Hot Springs',
    description: 'Famous natural hot springs and resort located just outside Adama.',
    location: 'Sodere, Adama',
    images: ['https://picsum.photos/seed/sodere/800/600'],
    category: 'Nature',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_BLOG: BlogEntry[] = [
  {
    id: 'blog-1',
    title: 'The Future of Urban Living in Adama',
    author: 'Dr. Elias Mulugeta',
    category: 'Urban Development',
    content: 'Adama is rapidly evolving into a model for urban development in Ethiopia...',
    featuredImage: 'https://picsum.photos/seed/adama-future/800/600',
    tags: ['UrbanPlanning', 'Adama', 'Future'],
    status: 'published',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'media-1',
    name: 'City Hall Exterior',
    url: 'https://picsum.photos/seed/cityhall/800/600',
    type: 'image',
    category: 'Architecture',
    altText: 'Exterior view of Adama City Hall',
    size: '1.2 MB',
    status: 'published',
    author: 'Admin',
    language: 'en',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  }
];

export const INITIAL_HERO_VIDEO: HeroVideoConfig = {
  id: 'hero-1',
  videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-in-time-lapse-3155-large.mp4',
  fallbackImage: 'https://picsum.photos/seed/adama-hero/1920/1080',
  autoplay: true,
  mute: true,
  loop: true,
  showOverlay: true,
  overlayStyle: 'dark-gradient',
  overlayOpacity: 'medium',
  title: 'Welcome to Adama City',
  subtitle: 'The Heart of Ethiopia\'s Industrial and Cultural Future',
  ctaText: 'Explore Services',
  ctaLink: '/services',
  videoQuality: 'high',
  lowBandwidthMode: false,
  lazyLoad: true,
  status: 'published',
  author: 'Admin',
  language: 'en',
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
};

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  id: 'settings-1',
  siteName: 'Adama City Official Portal',
  siteDescription: 'The official digital gateway to Adama City, Ethiopia.',
  contactEmail: 'info@adama.gov.et',
  contactPhone: '+251 22 111 0000',
  address: 'Adama City Hall, Main Square, Adama, Ethiopia',
  socialLinks: {
    facebook: 'https://facebook.com/AdamaCityOfficial',
    twitter: 'https://twitter.com/AdamaCity',
    instagram: 'https://instagram.com/AdamaCity',
    linkedin: 'https://linkedin.com/company/adama-city-administration',
    youtube: 'https://youtube.com/AdamaCityTV'
  },
  logoUrl: 'https://picsum.photos/seed/adama-logo/200/200',
  faviconUrl: 'https://picsum.photos/seed/adama-favicon/32/32',
  footerText: '© 2026 Adama City Administration. All Rights Reserved.',
  status: 'published',
  author: 'Admin',
  language: 'en',
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
  established: '1924 GC',
  area: '58,109 ha',
  altitude: '1,712 m asl',
  avgClimate: '22°C',
  population: '1M+',
  administrativeStructure: '32 Sectors, 6 Sub-Cities, 19 Woredas',
};

export const INITIAL_ADMINISTRATIVE_UNITS: AdministrativeUnit[] = [
  {
    id: 'unit-1',
    name: 'Infrastructure & Urban Dev Sector',
    type: 'Sector',
    description: 'Responsible for municipal physical development, smart expressway hookups, and commercial zoning projects across the city center.',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T11:00:00Z',
    status: 'published',
    author: 'Admin',
    language: 'en',
    members: [
      {
        id: 'member-1-1',
        name: 'Dr. Girma Bekele',
        role: 'Sector Director',
        photoUrl: 'https://picsum.photos/seed/girma/300/300'
      },
      {
        id: 'member-1-2',
        name: 'Sara Kedir',
        role: 'Chief Urban Planner',
        photoUrl: 'https://picsum.photos/seed/sara/300/300'
      }
    ]
  },
  {
    id: 'unit-2',
    name: 'Bole Sub-City Administration',
    type: 'SubCity',
    description: 'Handles local residential registration, community safety, and local market regulation in the north-east Bole sector.',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
    status: 'published',
    author: 'Admin',
    language: 'en',
    members: [
      {
        id: 'member-2-1',
        name: 'Tesfaye Alemu',
        role: 'Sub-City Administrator',
        photoUrl: 'https://picsum.photos/seed/tesfaye/300/300'
      }
    ]
  }
];
