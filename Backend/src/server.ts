import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { initDb } from './db/init';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'adama-cms-secret-key-2026';


// Interfaces for Type Safety
interface NewsItem {
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
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: string;
  expiry_date: string;
  priority: string;
  status: string;
  language: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

interface Service {
  id: number;
  name: string;
  description: string;
  requirements: string[];
  process: string;
  contact_info: string;
  status: string;
  language: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

interface Leadership {
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
  created_at: Date;
  updated_at: Date;
}

interface MayoralHistory {
  id: number;
  mayor_name: string;
  photo: string;
  term: string;
  summary: string;
  detailed_description: string;
  stakeholders: string[];
  achievements: string[];
  challenges: string[];
  kpis: string[];
  status: string;
  language: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

interface Initiative {
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
  created_at: Date;
  updated_at: Date;
}

interface Event {
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
  created_at: Date;
  updated_at: Date;
}

interface Document {
  id: number;
  title: string;
  category: string;
  date: string;
  file_url: string;
  description: string;
  status: string;
  language: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

interface Tourism {
  id: number;
  attraction_name: string;
  description: string;
  location: string;
  images: string[];
  category: string;
  status: string;
  language: string;
  author: string;
  created_at: Date;
  updated_at: Date;
}

interface Blog {
  id: number;
  title: string;
  author: string;
  category: string;
  content: string;
  featured_image: string;
  tags: string[];
  status: string;
  language: string;
  created_at: Date;
  updated_at: Date;
}

interface Media {
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
  created_at: Date;
  updated_at: Date;
}

interface HeroVideo {
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
  updated_at: Date;
}

interface SiteSettings {
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
  updated_at: Date;
}

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
}

const { Pool } = pg;

// Mock Database for fallback
let isMockMode = false;
const mockData: Record<string, any[]> = {
  users: [
    { 
      id: 1, 
      username: 'admin', 
      name: 'System Admin',
      email: 'admin@adama.gov.et',
      password_hash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
      role: 'admin' 
    }
  ],
  news: [
    {
      id: 1,
      title: 'Adama City Smart Infrastructure Project Launch',
      slug: 'adama-city-smart-infrastructure-project-launch',
      content: 'Adama City has officially launched its new smart infrastructure project aimed at improving traffic flow and urban connectivity.',
      category: 'Infrastructure',
      image_url: 'https://picsum.photos/seed/adama-infra/800/600',
      tags: ['SmartCity', 'Infrastructure', 'Development'],
      status: 'published',
      author: 'Admin',
      language: 'en',
      created_at: new Date('2026-03-25T10:00:00Z'),
      updated_at: new Date('2026-04-01T12:00:00Z')
    },
    {
      id: 2,
      title: 'New Green Park Initiative in Adama Approved',
      slug: 'new-green-park-initiative-in-adama',
      content: 'The city council has approved the development of three new public parks to enhance the green spaces within the urban area.',
      category: 'Environment',
      image_url: 'https://picsum.photos/seed/adama-park/800/600',
      tags: ['GreenAdama', 'Environment', 'Parks'],
      status: 'published',
      author: 'Editor-Sarah',
      language: 'en',
      created_at: new Date('2026-04-04T09:00:00Z'),
      updated_at: new Date('2026-04-05T14:00:00Z')
    }
  ],
  announcements: [
    {
      id: 1,
      title: 'Urgent: Water Supply Maintenance Notice',
      message: 'Scheduled maintenance for the central water supply system will occur on April 10th from 8:00 AM to 4:00 PM.',
      type: 'Notice',
      expiry_date: '2026-04-11',
      priority: 'High',
      status: 'published',
      author: 'Admin',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  services: [
    {
      id: 1,
      name: 'Business License Registration',
      description: 'Register your new business or renew an existing license with the Adama City Trade Bureau.',
      requirements: ['Valid ID', 'Proof of Address', 'Tax Identification Number', 'Completed Application Form'],
      process: 'Submit documents at the Trade Bureau office, pay processing fee, and receive license within 5 working days.',
      contact_info: 'Trade Bureau - Office 302, City Hall. Phone: +251 22 111 2222',
      status: 'published',
      author: 'Admin',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  leadership: [
    {
      id: 1,
      name: 'Hon. Hailu Jelde',
      title: 'City Mayor',
      department: 'Executive mayoral Office',
      photo: 'https://picsum.photos/seed/hailu/400/400',
      biography: 'Hailu Jelde has served as the mayor since 2024, focusing on modernization and smart city initiatives.',
      responsibilities: ['City Administration', 'Policy Guidance', 'Citizen Grievance Redressal'],
      email: 'mayor@adama.gov.et',
      phone: '+251 22 111 0001',
      status: 'published',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  mayoral_history: [
    {
      id: 1,
      mayor_name: 'Former Mayor Bekele',
      photo: 'https://picsum.photos/seed/bekele/400/400',
      term: '2018 - 2024',
      summary: 'An era of great green legacy expansion and public transit enhancements.',
      detailed_description: 'An executive overview of infrastructure enhancements completed during the six-year mayoral term.',
      status: 'published',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  initiatives: [
    {
      id: 1,
      title: 'Sodere Springs Restoration Drive',
      description: 'Sodere Springs ecological recovery and therapeutic infrastructure upgrading initiative.',
      category: 'Environment',
      current_status: 'Active',
      timeline: '6 Months',
      impact: 'Therapeutic and local recreational facility enhancements.',
      status: 'published',
      language: 'en',
      author: 'Admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  events: [
    {
      id: 1,
      title: 'Adama City Investment Summit',
      date: '2026-06-15',
      location: 'Adama Municipal Hall',
      description: 'Bringing together national and global investors to explore industrial growth opportunities.',
      category: 'Economy',
      image: 'https://picsum.photos/seed/summit/800/600',
      status: 'published',
      language: 'en',
      author: 'Admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  documents: [
    {
      id: 1,
      title: 'Adama Master Plan 2035',
      category: 'Urban Planning',
      date: '2026-05-10',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'Official master planning guidelines and blueprint framework for Adama City development projects.',
      status: 'published',
      language: 'en',
      author: 'Admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  tourism: [
    {
      id: 1,
      attraction_name: 'Sodere Hot Springs Resort',
      description: 'Revered mineral pools and thermal hot springs nestled alongside the Awash River.',
      location: 'Sodere, Adama District',
      images: ['https://picsum.photos/seed/sodere1/800/600'],
      category: 'Resort',
      status: 'published',
      language: 'en',
      author: 'Admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  blog: [
    {
      id: 1,
      title: 'Economic Resurgence of the Rift Valley Gateway',
      author: 'Abebe Bekele',
      category: 'Economy',
      content: 'A detailed study of the industrial logistics hub emerging in Adama, leveraging the rail connection and expressways.',
      featured_image: 'https://picsum.photos/seed/adama-econ/800/600',
      tags: ['Economy', 'Trade', 'Logistics'],
      status: 'published',
      language: 'en',
      created_at: new Date('2026-03-20T08:30:00Z'),
      updated_at: new Date('2026-03-20T08:30:00Z')
    }
  ],
  media: [
    {
      id: 1,
      name: 'Adama Central Expressway Panoramics',
      url: 'https://picsum.photos/seed/panorama/1200/800',
      thumbnail_url: 'https://picsum.photos/seed/panorama/400/300',
      type: 'image',
      category: 'Infrastructure',
      alt_text: 'Adama Expressway Panoramas',
      size: '1.4 MB',
      mime_type: 'image/jpeg',
      status: 'published',
      language: 'en',
      author: 'Admin',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  hero_video: [{ id: 1, title: 'Welcome to Adama (Mock)', subtitle: 'The Heart of Ethiopia', cta_text: 'Explore', cta_link: '#' }],
  site_settings: [{ 
    id: 1, 
    site_name: 'Adama City (Mock)', 
    contact_email: 'info@adama.gov.et',
    established: '1924 GC',
    area: '58,109 ha',
    altitude: '1,712 m asl',
    avg_climate: '22°C',
    population: '1M+',
    administrative_structure: '32 Sectors, 6 Sub-Cities, 19 Woredas',
    about_us: '<p class="text-lg text-slate-700 leading-relaxed font-semibold">Adama is one of the most prominent, rapidly expanding industrial and cultural metropolitan hubs in the East African Rift Valley.</p><p>Known for its pleasant climate, natural therapeutic hot springs, wind farms, and strategic position along the main transit corridor connecting Addis Ababa to the Red Sea port of Djibouti, Adama represents the progressive heart of the Oromia region.</p><p>The city administration is committed to implementing cutting-edge smart city resources, digital municipal integrations, and high-quality educational corridors. We welcome residents, digital nomads, and global industrial investors to explore our vibrant culture, innovative infrastructure, and warm community.</p>',
    mayors_message: '<p>As the Mayor of Adama, it is my distinct honor to welcome you to our official civic portal. Our city is undergoing an epochal digital and physical transformation.</p><p>Through integrated smart governance, sustainable renewable power, therapeutic thermal leisure development, and robust educational systems, we aim to elevate the quality of life for every citizen.</p>',
    mayors_message_author: 'Hon. Mayor Hailu Jelde',
    mayors_message_photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'
  }],
  administrative_units: [
    {
      id: 1,
      name: 'Infrastructure & Urban Dev Sector',
      type: 'Sector',
      description: 'Responsible for municipal physical development, smart expressway hookups, and commercial zoning projects across the city center.',
      status: 'published',
      language: 'en',
      author: 'Admin',
      members: JSON.stringify([
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
      ]),
      created_at: new Date('2026-01-10T08:00:00Z'),
      updated_at: new Date('2026-01-10T11:00:00Z')
    }
  ],
  audit_logs: [],
  permits: [
    {
      id: 'AD-2026-1042',
      applicant_name: 'Oromia Industrial Core PLC',
      license_type: 'Commercial Construction',
      submission_date: '2026-04-12',
      target_decision_date: '2026-06-01',
      status_gate: 'Zoning Audit',
      completion_percentage: 65,
      assigned_desk: 'Central Infrastructure Office (Desk 3)',
      audit_logs: JSON.stringify([
        { id: '1', date: '2026-04-12', stageDescription: 'Docket initialized successfully', statusFlag: 'Pending' },
        { id: '2', date: '2026-04-15', stageDescription: 'Structural design approved', statusFlag: 'Approved' },
        { id: '3', date: '2026-05-10', stageDescription: 'Zoning review pending regional signoff', statusFlag: 'Warning' }
      ])
    },
    {
      id: 'AD-2026-2104',
      applicant_name: 'Sodere Geothermal Power Co.',
      license_type: 'Solar Wind Installation',
      submission_date: '2026-05-01',
      target_decision_date: '2026-06-25',
      status_gate: 'Field Inspection',
      completion_percentage: 45,
      assigned_desk: 'Renewable Power Desk (Desk A)',
      audit_logs: JSON.stringify([
        { id: '1', date: '2026-05-01', stageDescription: 'Solar installation clearance opened', statusFlag: 'Pending' },
        { id: '2', date: '2026-05-04', stageDescription: 'Grid capacity validation complete', statusFlag: 'Approved' }
      ])
    }
  ],
  tickets: [
    {
      id: 'TK-1002',
      category: 'Infrastructure',
      summary: 'Crater pothole on Ring Road highway corridor',
      detailed_body: 'A deep pothole has expanded significantly on the southbound lane of the Adama Ring Road near Kebele 12. Extremely dangerous at night where there is low visibility.',
      location_woreda: 'Woreda 03 - Adama South',
      votes: 48,
      status: 'In Progress',
      dispatch_note: 'Assigned crew 4 for asphalt repair. Scheduled for Friday midnight to ease traffic bottlenecks.'
    },
    {
      id: 'TK-2091',
      category: 'Utilities',
      summary: 'Water pressure fluctuation in Kebele 08 residential block',
      detailed_body: 'Multiple households report zero water pressure during peak hours between 6 AM and 9 AM. Likely a geothermal pump calibration issue.',
      location_woreda: 'Woreda 01 - Kebele 08',
      votes: 12,
      status: 'Assigned',
      dispatch_note: 'Hydrology technician dispatched to verify main pipe branch valve calibration.'
    },
    {
      id: 'TK-3921',
      category: 'Safety',
      summary: 'Inoperable solar street lamp grids',
      detailed_body: 'Three solar street light clusters along the wellness hotspring boulevard are completely unlit, posing security issues during dusk.',
      location_woreda: 'Woreda 04 - East Thermal Zone',
      votes: 35,
      status: 'Received',
      dispatch_note: ''
    }
  ],
  budgets: [
    { id: '1', sector_title: 'Roads & Highway Infrastructure', weight_allocation: 35, approved_capital_expense_etb: 4500000000, assigned_project: 'Ring Road Highway Overpass', active_milestone: 'Phase II Paving' },
    { id: '2', sector_title: 'Smart City & Digital Integration', weight_allocation: 20, approved_capital_expense_etb: 2200000000, assigned_project: 'Broadband Core & Fiber ring', active_milestone: 'Server Farm Rigged' },
    { id: '3', sector_title: 'Water & Sewerage Systems', weight_allocation: 15, approved_capital_expense_etb: 1800000000, assigned_project: 'Awash Deep Borehole Aquifers', active_milestone: 'Excavation 75%' },
    { id: '4', sector_title: 'Thermal Hot Springs & Leisure', weight_allocation: 15, approved_capital_expense_etb: 1500000000, assigned_project: 'Sodere Recreation Retrofits', active_milestone: 'Geothermal Outlets Plumbed' },
    { id: '5', sector_title: 'Civic Schools & Medical Hubs', weight_allocation: 15, approved_capital_expense_etb: 1200000000, assigned_project: 'Woreda 03 Pediatric Wing Expansion', active_milestone: 'Framing Completed' }
  ],
  tourism_packages: [
    {
      id: 'TR-101',
      theme: 'wellness',
      title: 'Adama Geothermal Healing & Springs Day',
      curator_subtitle: 'Wellness Curators • Ministry of Medical Tourism',
      seasonality: 'Excellent Year-Round',
      climate_details: '25°C Average, Warm Geothermal Breezes',
      stops: JSON.stringify([
        {
          id: 's1',
          timeOfDay: '08:30 AM',
          activityTitle: 'Morning Dip in Sodere Deep Hot Springs',
          geoLocation: 'Sodere Wells complex, Adama',
          description: 'Soak in the natural 40°C thermal mineral pools to soothe fatigue, joint pressure, and boost skin revitalization.',
          curatorTip: 'Tip: Refrain from full immersion over 45 mins. Hydrate with natural coconut water post-soak.'
        },
        {
          id: 's2',
          timeOfDay: '12:00 PM',
          activityTitle: 'Organic Al Fresco Ethio-Mediterranean Lunch',
          geoLocation: 'Rift Valley Resort Lawn',
          description: 'Taste localized grilled tilapia harvested sustainably, paired with whole organic grains and specialty herbs.',
          curatorTip: 'Tip: Sit by the terrace overlooking the Awash River bend for glimpses of resident colobus monkeys.'
        }
      ])
    },
    {
      id: 'TR-202',
      theme: 'culture',
      title: 'Oromo Heritage & Culinary Walk',
      curator_subtitle: 'Sociology & Cultural Arts Council of Adama',
      seasonality: 'Dry Season Preferred',
      climate_details: '27°C, Sunny and Clear Skies',
      stops: JSON.stringify([
        {
          id: 'c1',
          timeOfDay: '10:00 AM',
          activityTitle: 'Gada Community Center Guided Exhibit',
          geoLocation: 'Adama Central Boulevard',
          description: 'Immersive guide on Oromo democratic history, Gada social assemblies, and traditional handcraft woven artifacts.',
          curatorTip: 'Tip: Photography is allowed inside the main assembly hall. Ask the curator about the Oda symbolic Sycamore tree.'
        }
      ])
    }
  ]
};

// ---------- Database Connection ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  connectionTimeoutMillis: 5000,
});

// Initialize database tables and seed data
await initDb();

// ---------- Database Query Wrapper ----------
const dbQuery = async (text: string, params?: any[]) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('DATABASE ERROR:', err);
    throw err;
  }
};

// ---------- CDN Config  ----------
interface CDNRegion {
  name: string;
  status: string;
  latency: string;
  cacheHitRatio: string;
}

interface CDNConfig {
  decoupledMode: boolean;
  cdnBaseUrl: string;
  purpleEdgeServer: string;
  regions: CDNRegion[];
  cachePurgedAt: string;
}

let cdnConfig: CDNConfig = {
  decoupledMode: false,
  cdnBaseUrl: 'https://cdn.adama.gov.et',
  purpleEdgeServer: 'edge-eu-london-1',
  regions: [
    { name: 'US East (N. Virginia)', status: 'Active', latency: '24ms', cacheHitRatio: '98.5%' },
    { name: 'Europe (London)', status: 'Active', latency: '8ms', cacheHitRatio: '99.2%' },
    { name: 'Africa (Nairobi)', status: 'Active', latency: '42ms', cacheHitRatio: '97.1%' },
    { name: 'Asia Pacific (Singapore)', status: 'Active', latency: '74ms', cacheHitRatio: '96.8%' }
  ],
  cachePurgedAt: new Date().toISOString()
};

// ---------- Express Server ----------
async function startServer() {
  const app = express();
  const PORT = 5000;

  // ----- Middlewares -----
  app.use(cors({
    origin: true, // allow any origin in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(helmet());
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // ----- Rate Limiting (disabled in development) -----
  // const apiLimiter = rateLimit({ ... });
  // app.use('/api/', apiLimiter);
  // const authLimiter = rateLimit({ ... });
  // app.use('/api/auth/', authLimiter);
// ----- Authentication Middleware -----
  const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. Token missing.' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
      (req as any).user = user;
      next();
    });
  };



// ----- Role & Permission Middlewares -----
  const checkRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    const normalizedRole = (user.role || '').toLowerCase().replace(/_/g, ' ');
    const normalizedTargetRoles = roles.map(r => r.toLowerCase().replace(/_/g, ' '));
    
    // Super Admins always bypass role restrictions
    if (normalizedRole === 'super admin' || normalizedRole === 'super_admin') {
      return next();
    }
    
    if (!normalizedTargetRoles.includes(normalizedRole) && !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };

  const checkPermission = (module: string, action: 'read' | 'write' | 'delete') => (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Access denied. Unauthorized.' });

    const normalizedRole = (user.role || '').toLowerCase().replace(/_/g, ' ');
    // Admins and Super Admins always bypass generic limitation checks
    if (normalizedRole === 'admin' || normalizedRole === 'super admin' || normalizedRole === 'super_admin') return next();

    // Check custom permissions first if they exist
    if (user.permissions && Array.isArray(user.permissions)) {
      const perm = user.permissions.find((p: any) => {
        const m = p.module.toLowerCase();
        const r = module.toLowerCase();
        return m === r || (m === 'history' && r === 'mayoral-history') || (m === 'mayoral-history' && r === 'history');
      });
      if (perm) {
        if (action === 'read' && perm.read) return next();
        if (action === 'write' && perm.write) return next();
        if (action === 'delete' && perm.delete) return next();
        return res.status(403).json({ error: `Access denied. Insufficient granular permissions for module: ${module}.` });
      }
    }

    // Default legacy role fallback:
    if (action === 'read') {
      return next(); // Everyone logged in is allowed to read content
    }

    if (action === 'delete') {
      return res.status(403).json({ error: 'Access denied. Only Admins/Super Admins are authorized to delete content.' });
    }

    if (action === 'write') {
      if (['editor', 'publisher', 'reviewer'].includes(normalizedRole)) {
        return next();
      }
    }

    return res.status(403).json({ error: 'Access denied. Insufficient role permissions.' });
  };
// ----- Multer Configuration (after authenticateToken) -----
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|gif|webp/;
      const extname = allowed.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowed.test(file.mimetype);
      if (extname && mimetype) return cb(null, true);
      cb(new Error('Only image files are allowed'));
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Upload endpoint (protected)
  app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  });

   // In-Memory Rate Limiting for Security
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const customRateLimiter = (limit: number, windowMs: number) => (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    
    if (!record) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    record.count += 1;
    if (record.count > limit) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    next();
  };

   // ----- Centralized Async Error Handler -----
  const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // ----- API Routes -----
  // 1. Authentication Route with Rate Limiter
  app.post('/api/auth/login', customRateLimiter(10, 60 * 1000), asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const result = await dbQuery('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign Access Token (lasts 2h)
    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, permissions: user.permissions }, 
      JWT_SECRET, 
      { expiresIn: '2h' }
    );
    
    // Generate secure cryptographically strong random hex for Refresh Token
    const crypto = await import('crypto');
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Store in PostgreSQL database
    await dbQuery('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)', [refreshToken, user.id, expiresAt]);

    res.json({ 
      token, 
      refresh_token: refreshToken,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, permissions: user.permissions } 
    });
  }));

  // Refresh Token Route with Rate Limiter
  app.post('/api/auth/refresh', customRateLimiter(15, 60 * 1000), asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Refresh token is required' });

    // Look up in database
    const dbTokenResult = await dbQuery('SELECT * FROM refresh_tokens WHERE token = $1', [refresh_token]);
    if (dbTokenResult.rowCount === 0) {
      return res.status(403).json({ error: 'Invalid or revoked refresh token' });
    }

    const dbToken = dbTokenResult.rows[0];
    if (new Date() > new Date(dbToken.expires_at)) {
      // Clean up expired token
      await dbQuery('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);
      return res.status(403).json({ error: 'Expired refresh token' });
    }

    // Get user details
    const userResult = await dbQuery('SELECT id, username, name, email, role, permissions FROM users WHERE id = $1', [dbToken.user_id]);
    if (userResult.rowCount === 0) {
      return res.status(403).json({ error: 'User associated with token not found' });
    }

    const user = userResult.rows[0];
    
    // Sign new access token (lasts 2h)
    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, permissions: user.permissions }, 
      JWT_SECRET, 
      { expiresIn: '2h' }
    );

    res.json({ token: newAccessToken });
  }));

  // Revoke/Logout Clean up route
  app.post('/api/auth/logout', asyncHandler(async (req: Request, res: Response) => {
    const { refresh_token } = req.body;
    if (refresh_token) {
      await dbQuery('DELETE FROM refresh_tokens WHERE token = $1', [refresh_token]);
    }
    res.json({ success: true, message: 'Successfully logged out and revoked tokens.' });
  }));
  // 2. CRUD Routes Helper
  // Standardized CRUD Route Helper
  const createCrudRoutes = (resource: string, table: string, fields: string[], requiredFields: string[] = [], idField: string = 'id') => {
    // GET all with Advanced Pagination, Filtering, Search, & Sorting
    const handleGetAll = asyncHandler(async (req: Request, res: Response) => {
      // 1. Pagination Params
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : (req.query.page ? 10 : 1000);
      const offset = (page - 1) * limit;

      // 2. Sorting Params
      const sortBy = (req.query.sort_by || req.query.sortBy || 'created_at') as string;
      const sortOrder = (req.query.sort_order || req.query.sortOrder || 'DESC').toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // SQL injection safe list
      const allowedColumns = [...fields, idField, 'created_at', 'updated_at', 'published_at'];
      const safeSortBy = allowedColumns.includes(sortBy) ? sortBy : 'created_at';

      // 3. Status-based Visibility Control
      const hasStatusColumn = fields.includes('status');
      const queryValues: any[] = [];
      const whereClauses: string[] = [];

      // Determine authorization for non-published items
      let isPrivilegedUser = false;
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          if (decoded && ['admin', 'editor', 'publisher'].includes(decoded.role || decoded.role_name)) {
            isPrivilegedUser = true;
          }
        } catch (e) {
          // Token invalid, treat as public
        }
      }

      // If table supports workflow status, restrict unauthenticated/viewers to 'published'
      if (hasStatusColumn) {
        if (!isPrivilegedUser) {
          whereClauses.push(`status = $${queryValues.length + 1}`);
          queryValues.push('published');
        } else if (req.query.status) {
          // Allow privileged users to filter by specific status
          const requestedStatus = req.query.status.toString().toLowerCase();
          if (['draft', 'review', 'approved', 'published', 'archived'].includes(requestedStatus)) {
            whereClauses.push(`status = $${queryValues.length + 1}`);
            queryValues.push(requestedStatus);
          }
        }
      }

      // 4. Exact Filters (category, language, author, type, department)
      const filterableKeys = ['category', 'language', 'author', 'type', 'department'];
      filterableKeys.forEach(key => {
        if (req.query[key] && fields.includes(key)) {
          whereClauses.push(`${key} = $${queryValues.length + 1}`);
          queryValues.push(req.query[key]);
        }
      });

      // 5. Full Search Parameter (q or search)
      const searchQuery = (req.query.q || req.query.search) as string;
      if (searchQuery) {
        const sqlFriendlySearch = `%${searchQuery.trim().toLowerCase()}%`;
        const searchableCols = fields.filter(f => ['name', 'title', 'mayor_name', 'attraction_name', 'description', 'summary', 'content', 'message'].includes(f));
        if (searchableCols.length > 0) {
          const searchClause = searchableCols.map(col => `LOWER(${col}) LIKE $${queryValues.length + 1}`).join(' OR ');
          whereClauses.push(`(${searchClause})`);
          queryValues.push(sqlFriendlySearch);
        }
      }

      // 6. Build final SQL parts
      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      // Get Total records count
      const countQuery = `SELECT COUNT(*) FROM ${table} ${whereSQL}`;
      const countResult = await dbQuery(countQuery, queryValues);
      const totalItems = parseInt(countResult.rows[0]?.count || '0', 10);

      // Select data statement
      let selectSQL = `SELECT * FROM ${table} ${whereSQL} ORDER BY ${safeSortBy} ${sortOrder}`;
      
      // Apply offset pagination if requested explicitly or implicitly with pages
      if (req.query.page || req.query.limit) {
        selectSQL += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
        queryValues.push(limit, offset);
      }

      const dataResult = await dbQuery(selectSQL, queryValues);

      // Return unified paginated response if pagination used, otherwise direct array
      if (req.query.page || req.query.limit) {
        res.json({
          data: dataResult.rows,
          meta: {
            total_items: totalItems,
            page,
            limit,
            total_pages: Math.ceil(totalItems / limit)
          }
        });
      } else {
        res.json(dataResult.rows);
      }
    });

    app.get(`/api/${resource}`, handleGetAll);
    app.get(`/api/v1/${resource}`, handleGetAll);

    // GET single item
    const handleGetSingle = asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      const result = await dbQuery(`SELECT * FROM ${table} WHERE ${idField} = $1`, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `${resource} item not found` });
      }
      
      // Status security constraint: restrict view of non-published single items by public users
      const item = result.rows[0];
      if (fields.includes('status') && item.status !== 'published') {
        let isAuthorized = false;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
          try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            if (decoded && ['admin', 'editor', 'publisher'].includes(decoded.role)) {
              isAuthorized = true;
            }
          } catch (e) {}
        }
        if (!isAuthorized) {
          return res.status(403).json({ error: 'Access denied. Content is not currently published.' });
        }
      }

      res.json(item);
    });

    app.get(`/api/${resource}/:id`, handleGetSingle);
    app.get(`/api/v1/${resource}/:id`, handleGetSingle);

    // POST create
    const handleCreate = asyncHandler(async (req: Request, res: Response) => {
      // Required Fields Validation
      for (const field of requiredFields) {
        if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
          return res.status(400).json({ error: `Required field missing: ${field}` });
        }
      }

      // Workflow Status Validation & Role-based Transition Control
      if (req.body.status) {
        req.body.status = req.body.status.toLowerCase();
        if (!['draft', 'review', 'approved', 'published', 'archived'].includes(req.body.status)) {
          return res.status(400).json({ error: 'Invalid workflow status. Allowed levels: draft, review, approved, published, archived' });
        }

        if (fields.includes('status')) {
          const actingUser = (req as any).user;
          const normalizedRole = (actingUser?.role || 'viewer').toLowerCase().replace(/_/g, ' ');

          if (req.body.status === 'published' || req.body.status === 'archived') {
            if (!['publisher', 'admin', 'super admin'].includes(normalizedRole)) {
              return res.status(403).json({ error: 'Access denied. Only Publishers and Admins are authorized to set status to published or archived.' });
            }
          } else if (req.body.status === 'approved') {
            if (!['reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
              return res.status(403).json({ error: 'Access denied. Only Reviewers, Publishers, and Admins are authorized to approve content.' });
            }
          } else if (req.body.status === 'review' || req.body.status === 'draft') {
            if (!['editor', 'reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
              return res.status(403).json({ error: 'Access denied. Only Editors, Reviewers, and higher roles are authorized to create drafts or submit content for review.' });
            }
          }
        }
      }

      const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
      const columns = fields.join(', ');
      const values = fields.map(f => req.body[f]);
      
      const query = `INSERT INTO ${table} (${columns}, updated_at) VALUES (${placeholders}, NOW()) RETURNING *`;
      const result = await dbQuery(query, values);

      // Create detailed government audit log entry
      if ((req as any).user) {
        const actingUser = (req as any).user;
        await dbQuery(
          `INSERT INTO audit_logs (timestamp, user_id, user_name, action, module, item_id, details) VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
          [actingUser.id, actingUser.username, 'CREATE', resource, result.rows[0].id.toString(), JSON.stringify({ title: req.body.title || req.body.name || '', status: req.body.status || 'draft' })]
        );
      }

      res.status(201).json(result.rows[0]);
    });

    app.post(`/api/${resource}`, authenticateToken, checkPermission(resource, 'write'), handleCreate);
    app.post(`/api/v1/${resource}`, authenticateToken, checkPermission(resource, 'write'), handleCreate);

    // PUT update
    const handleUpdate = asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      
      // Workflow Status Validation & Role-based Transition Control
      if (req.body.status) {
        req.body.status = req.body.status.toLowerCase();
        if (!['draft', 'review', 'approved', 'published', 'archived'].includes(req.body.status)) {
          return res.status(400).json({ error: 'Invalid workflow status. Allowed levels: draft, review, approved, published, archived' });
        }

        if (fields.includes('status')) {
          const actingUser = (req as any).user;
          const normalizedRole = (actingUser?.role || 'viewer').toLowerCase().replace(/_/g, ' ');

          if (req.body.status === 'published' || req.body.status === 'archived') {
            if (!['publisher', 'admin', 'super admin'].includes(normalizedRole)) {
              return res.status(403).json({ error: 'Access denied. Only Publishers and Admins are authorized to set status to published or archived.' });
            }
          } else if (req.body.status === 'approved') {
            if (!['reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
              return res.status(403).json({ error: 'Access denied. Only Reviewers, Publishers, and Admins are authorized to approve content.' });
            }
          } else if (req.body.status === 'review' || req.body.status === 'draft') {
            if (!['editor', 'reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
              return res.status(403).json({ error: 'Access denied. Only Editors, Reviewers, and higher roles are authorized to set status to draft or review.' });
            }
          }
        }
      }

      // Fetch pre-editing state to log precise before/after diff details
      const oldStateResult = await dbQuery(`SELECT * FROM ${table} WHERE ${idField} = $1`, [id]);
      if (oldStateResult.rowCount === 0) {
        return res.status(404).json({ error: `${resource} not found` });
      }
      const beforeState = oldStateResult.rows[0];

      const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
      const values = fields.map(f => req.body[f] !== undefined ? req.body[f] : beforeState[f]);
      values.push(id);
      
      const query = `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE ${idField} = $${fields.length + 1} RETURNING *`;
      const result = await dbQuery(query, values);
      
      // Log precise diff audit logs
      if ((req as any).user) {
        const actingUser = (req as any).user;
        const editedState = result.rows[0];
        const changedFields: any = {};
        fields.forEach(f => {
          if (JSON.stringify(beforeState[f]) !== JSON.stringify(editedState[f])) {
            changedFields[f] = { before: beforeState[f], after: editedState[f] };
          }
        });
        
        await dbQuery(
          `INSERT INTO audit_logs (timestamp, user_id, user_name, action, module, item_id, details) VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
          [actingUser.id, actingUser.username, 'UPDATE', resource, id, JSON.stringify({ title: req.body.title || req.body.name || '', diff: changedFields })]
        );
      }

      res.json(result.rows[0]);
    });

    app.put(`/api/${resource}/:id`, authenticateToken, checkPermission(resource, 'write'), handleUpdate);
    app.put(`/api/v1/${resource}/:id`, authenticateToken, checkPermission(resource, 'write'), handleUpdate);

    // DELETE item
    const handleDelete = asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;

      const preDelResult = await dbQuery(`SELECT * FROM ${table} WHERE ${idField} = $1`, [id]);
      if (preDelResult.rowCount === 0) {
        return res.status(404).json({ error: `${resource} not found` });
      }
      const deletedItem = preDelResult.rows[0];

      const result = await dbQuery(`DELETE FROM ${table} WHERE ${idField} = $1`, [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: `${resource} not found` });
      }

      // Record a destruction action in audit log
      if ((req as any).user) {
        const actingUser = (req as any).user;
        await dbQuery(
          `INSERT INTO audit_logs (timestamp, user_id, user_name, action, module, item_id, details) VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
          [actingUser.id, actingUser.username, 'DELETE', resource, id, JSON.stringify({ title: deletedItem.title || deletedItem.name || '', status: deletedItem.status || '' })]
        );
      }

      res.json({ success: true, message: `Successfully deleted ${resource} item` });
    });

    app.delete(`/api/${resource}/:id`, authenticateToken, checkPermission(resource, 'delete'), handleDelete);
    app.delete(`/api/v1/${resource}/:id`, authenticateToken, checkPermission(resource, 'delete'), handleDelete);
  };

  // Define routes for each resource
  
  // User Management
  app.get('/api/users', authenticateToken, checkRole(['admin']), asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('SELECT id, username, name, email, role, permissions, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  }));

  app.post('/api/users', authenticateToken, checkRole(['admin']), asyncHandler(async (req: Request, res: Response) => {
    const { username, name, email, password, role, permissions } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    
    const hash = await bcrypt.hash(password, 10);
    const result = await dbQuery('INSERT INTO users (username, name, email, password_hash, role, permissions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, name, email, role, permissions, created_at', [username, name, email, hash, role || 'viewer', permissions ? JSON.stringify(permissions) : null]);
    res.status(201).json(result.rows[0]);
  }));

  app.put('/api/users/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, name, email, password, role, permissions } = req.body;
    
    let query, values;
    const finalPermissions = permissions ? JSON.stringify(permissions) : null;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET username = COALESCE($1, username), name = COALESCE($2, name), email = COALESCE($3, email), password_hash = $4, role = COALESCE($5, role), permissions = COALESCE($6, permissions) WHERE id = $7 RETURNING id, username, name, email, role, permissions, created_at';
      values = [username, name, email, hash, role, finalPermissions, id];
    } else {
      query = 'UPDATE users SET username = COALESCE($1, username), name = COALESCE($2, name), email = COALESCE($3, email), role = COALESCE($4, role), permissions = $5 WHERE id = $6 RETURNING id, username, name, email, role, permissions, created_at';
      values = [username, name, email, role, finalPermissions, id];
    }
    
    const result = await dbQuery(query, values);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  }));

  app.delete('/api/users/:id', authenticateToken, checkRole(['admin']), asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('DELETE FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  }));

  // Profile Management (Self)
  app.get('/api/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await dbQuery('SELECT id, username, name, email, role, permissions, created_at FROM users WHERE id = $1', [user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  }));

  app.put('/api/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { name, email, password } = req.body;
    
    let query, values;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), password_hash = $3 WHERE id = $4 RETURNING id, username, name, email, role, created_at';
      values = [name, email, hash, user.id];
    } else {
      query = 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, username, name, email, role, created_at';
      values = [name, email, user.id];
    }
    
    const result = await dbQuery(query, values);
    res.json(result.rows[0]);
  }));

  // News - Enhanced with complete pagination, filtering, search, sorting, and status visibility control
  const handleGetNewsAll = asyncHandler(async (req: Request, res: Response) => {
    // 1. Pagination Parameters
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : (req.query.page ? 10 : 1000);
    const offset = (page - 1) * limit;

    // 2. Sorting
    const sortBy = (req.query.sort_by || 'created_at') as string;
    const safeSortBy = ['id', 'title', 'created_at', 'published_at', 'category'].includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = (req.query.sort_order || 'DESC').toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const queryValues: any[] = [];
    const whereClauses: string[] = [];

    // 3. Security Check: Decrypted Token checks
    let isPrivilegedUser = false;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const normalizedRole = (decoded?.role || '').toLowerCase().replace(/_/g, ' ');
        if (decoded && ['admin', 'super admin', 'super_admin', 'editor', 'publisher', 'reviewer'].includes(normalizedRole)) {
          isPrivilegedUser = true;
        }
      } catch (e) {}
    }

    // Role-based visibility control
    if (!isPrivilegedUser) {
      whereClauses.push(`status = $${queryValues.length + 1}`);
      queryValues.push('published');
    } else if (req.query.status) {
      const requestedStatus = req.query.status.toString().toLowerCase();
      if (['draft', 'review', 'approved', 'published', 'archived'].includes(requestedStatus)) {
        whereClauses.push(`status = $${queryValues.length + 1}`);
        queryValues.push(requestedStatus);
      }
    }

    // Exact Filters
    const filterableKeys = ['category', 'language', 'author'];
    filterableKeys.forEach(key => {
      if (req.query[key]) {
        whereClauses.push(`${key} = $${queryValues.length + 1}`);
        queryValues.push(req.query[key]);
      }
    });

    // Search query
    const searchQuery = (req.query.q || req.query.search) as string;
    if (searchQuery) {
      const sqlFriendlySearch = `%${searchQuery.trim().toLowerCase()}%`;
      whereClauses.push(`(LOWER(title) LIKE $${queryValues.length + 1} OR LOWER(content) LIKE $${queryValues.length + 1})`);
      queryValues.push(sqlFriendlySearch);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // Count query
    const countResult = await dbQuery(`SELECT COUNT(*) FROM news ${whereSQL}`, queryValues);
    const totalItems = parseInt(countResult.rows[0]?.count || '0', 10);

    // Main SQL
    let selectSQL = `SELECT * FROM news ${whereSQL} ORDER BY ${safeSortBy} ${sortOrder}`;
    if (req.query.page || req.query.limit) {
      selectSQL += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
      queryValues.push(limit, offset);
    }

    const dataResult = await dbQuery(selectSQL, queryValues);

    if (req.query.page || req.query.limit) {
      res.json({
        data: dataResult.rows,
        meta: {
          total_items: totalItems,
          page,
          limit,
          total_pages: Math.ceil(totalItems / limit)
        }
      });
    } else {
      res.json(dataResult.rows);
    }
  });

  app.get('/api/news', handleGetNewsAll);
  app.get('/api/v1/news', handleGetNewsAll);

  app.post('/api/news', authenticateToken, checkRole(['super_admin', 'superadmin', 'admin', 'editor', 'publisher']), asyncHandler(async (req: Request, res: Response) => {
    const { title, content, category, image_url, tags, status, language, author } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
    
    const normalizedStatus = (status || 'draft').toLowerCase();
    if (!['draft', 'review', 'approved', 'published', 'archived'].includes(normalizedStatus)) {
      return res.status(400).json({ error: 'Invalid status value. Allowed levels: draft, review, approved, published, archived' });
    }

    // Role-based Transition Control Check
    const actingUser = (req as any).user;
    const normalizedRole = (actingUser?.role || 'viewer').toLowerCase().replace(/_/g, ' ');

    if (normalizedStatus === 'published' || normalizedStatus === 'archived') {
      if (!['publisher', 'admin', 'super admin'].includes(normalizedRole)) {
        return res.status(403).json({ error: 'Access denied. Only Publishers and Admins are authorized to set news status to published or archived.' });
      }
    } else if (normalizedStatus === 'approved') {
      if (!['reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
        return res.status(403).json({ error: 'Access denied. Only Reviewers, Publishers, and Admins are authorized to approve news.' });
      }
    } else if (normalizedStatus === 'review' || normalizedStatus === 'draft') {
      if (!['editor', 'reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
        return res.status(403).json({ error: 'Access denied. Only Editors and higher roles are authorized to save news drafts.' });
      }
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const published_at = normalizedStatus === 'published' ? new Date() : null;
    
    const query = `INSERT INTO news (title, slug, content, category, image_url, tags, status, language, author, published_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *`;
    const result = await dbQuery(query, [title, slug, content, category, image_url, tags, normalizedStatus, language, author, published_at]);
    
    // Create Audit Log
    await dbQuery(
      `INSERT INTO audit_logs (timestamp, user_id, user_name, action, module, item_id, details) VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
      [actingUser.id, actingUser.username, 'CREATE', 'news', result.rows[0].id.toString(), JSON.stringify({ title, status: normalizedStatus })]
    );

    res.status(201).json(result.rows[0]);
  }));
  
  app.post('/api/v1/news', authenticateToken, checkRole(['super_admin', 'superadmin', 'admin', 'editor', 'publisher']), asyncHandler(async (req: Request, res: Response) => {
    // Forward /v1 same call handler
    res.redirect(307, '/api/news');
  }));

  app.put('/api/news/:id', authenticateToken, checkRole(['super_admin', 'superadmin', 'admin', 'editor', 'publisher']), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, category, image_url, tags, status, language, author } = req.body;
    
    const normalizedStatus = status ? status.toLowerCase() : undefined;
    if (normalizedStatus && !['draft', 'review', 'approved', 'published', 'archived'].includes(normalizedStatus)) {
      return res.status(400).json({ error: 'Invalid status value. Allowed levels: draft, review, approved, published, archived' });
    }

    // Role-based Transition Control Check
    const actingUser = (req as any).user;
    const normalizedRole = (actingUser?.role || 'viewer').toLowerCase().replace(/_/g, ' ');

    if (normalizedStatus) {
      if (normalizedStatus === 'published' || normalizedStatus === 'archived') {
        if (!['publisher', 'admin', 'super admin'].includes(normalizedRole)) {
          return res.status(403).json({ error: 'Access denied. Only Publishers and Admins are authorized to set news status to published or archived.' });
        }
      } else if (normalizedStatus === 'approved') {
        if (!['reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
          return res.status(403).json({ error: 'Access denied. Only Reviewers, Publishers, and Admins are authorized to approve news.' });
        }
      } else if (normalizedStatus === 'review' || normalizedStatus === 'draft') {
        if (!['editor', 'reviewer', 'publisher', 'admin', 'super admin'].includes(normalizedRole)) {
          return res.status(403).json({ error: 'Access denied. Only Editors and higher roles are authorized to set news status to draft or review.' });
        }
      }
    }

    // Fetch original state for audit logging diffs
    const oldStateResult = await dbQuery('SELECT * FROM news WHERE id = $1', [id]);
    if (oldStateResult.rowCount === 0) return res.status(404).json({ error: 'News not found' });
    const beforeState = oldStateResult.rows[0];

    const published_at = normalizedStatus === 'published' ? new Date() : undefined;
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;
    const { meta_title, meta_description, meta_keywords } = req.body;

    const result = await dbQuery(
      `UPDATE news SET title = COALESCE($1, title), slug = COALESCE($2, slug), content = COALESCE($3, content), 
       category = COALESCE($4, category), image_url = COALESCE($5, image_url), tags = COALESCE($6, tags), 
       status = COALESCE($7, status), language = COALESCE($8, language), author = COALESCE($9, author), 
       published_at = COALESCE($10, published_at), meta_title = COALESCE($11, meta_title), 
       meta_description = COALESCE($12, meta_description), meta_keywords = COALESCE($13, meta_keywords), 
       updated_at = NOW() WHERE id = $14 RETURNING *`,
      [title, slug, content, category, image_url, tags, normalizedStatus, language, author, published_at, meta_title, meta_description, meta_keywords, id]
    );
    
    // Log audit log diff
    const editedState = result.rows[0];
    const changedFields: any = {};
    const newsFields = ['title', 'content', 'category', 'image_url', 'tags', 'status', 'language', 'author'];
    newsFields.forEach(f => {
      if (JSON.stringify(beforeState[f]) !== JSON.stringify(editedState[f])) {
        changedFields[f] = { before: beforeState[f], after: editedState[f] };
      }
    });

    await dbQuery(
      `INSERT INTO audit_logs (timestamp, user_id, user_name, action, module, item_id, details) VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
      [actingUser.id, actingUser.username, 'UPDATE', 'news', id, JSON.stringify({ title: req.body.title || beforeState.title, diff: changedFields })]
    );

    res.json(editedState);
  }));

  app.put('/api/v1/news/:id', authenticateToken, checkRole(['super_admin', 'superadmin', 'admin', 'editor', 'publisher']), asyncHandler(async (req: Request, res: Response) => {
    // Forward /v1 same call handler
    res.redirect(308, `/api/news/${req.params.id}`);
  }));

  app.delete('/api/news/:id', authenticateToken, checkRole(['super_admin', 'superadmin', 'admin']), asyncHandler(async (req: Request, res: Response) => {
    const preDelResult = await dbQuery('SELECT title, status FROM news WHERE id = $1', [req.params.id]);
    if (preDelResult.rowCount === 0) return res.status(404).json({ error: 'News not found' });
    const deletedItem = preDelResult.rows[0];

    await dbQuery('DELETE FROM news WHERE id = $1', [req.params.id]);
    
    // Log deletion action in audit log
    const actingUser = (req as any).user;
    await dbQuery(
      `INSERT INTO audit_logs (timestamp, user_id, user_name, action, module, item_id, details) VALUES (NOW(), $1, $2, $3, $4, $5, $6)`,
      [actingUser.id, actingUser.username, 'DELETE', 'news', req.params.id, JSON.stringify({ title: deletedItem.title, status: deletedItem.status })]
    );

    res.json({ success: true, message: 'News deleted successfully' });
  }));

  app.delete('/api/v1/news/:id', authenticateToken, checkRole(['super_admin', 'superadmin', 'admin']), asyncHandler(async (req: Request, res: Response) => {
    // Forward /v1 same call handler
    res.redirect(308, `/api/news/${req.params.id}`);
  }));

  // --- PERMITS CABINET (PUBLIC AND WRITE ENDPOINTS) ---
  const handleGetPermits = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : (req.query.page ? 10 : 1000);
    const offset = (page - 1) * limit;

    const sortBy = (req.query.sort_by || req.query.sortBy || 'created_at') as string;
    const safeSortBy = ['id', 'applicant_name', 'license_type', 'submission_date', 'target_decision_date', 'status_gate', 'completion_percentage', 'assigned_desk', 'created_at'].includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = (req.query.sort_order || req.query.sortOrder || 'DESC').toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const queryValues: any[] = [];
    const whereClauses: string[] = [];

    // Exact Match Filters
    if (req.query.status_gate) {
      whereClauses.push(`status_gate = $${queryValues.length + 1}`);
      queryValues.push(req.query.status_gate);
    }
    if (req.query.license_type) {
      whereClauses.push(`license_type = $${queryValues.length + 1}`);
      queryValues.push(req.query.license_type);
    }

    // Full-Text Search
    const searchQuery = (req.query.q || req.query.search) as string;
    if (searchQuery) {
      const sqlFriendlySearch = `%${searchQuery.trim().toLowerCase()}%`;
      whereClauses.push(`(LOWER(applicant_name) LIKE $${queryValues.length + 1} OR LOWER(license_type) LIKE $${queryValues.length + 1} OR LOWER(assigned_desk) LIKE $${queryValues.length + 1} OR LOWER(status_gate) LIKE $${queryValues.length + 1})`);
      queryValues.push(sqlFriendlySearch);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // Total count for Pagination metadata
    const countResult = await dbQuery(`SELECT COUNT(*) FROM permits ${whereSQL}`, queryValues);
    const totalItems = parseInt(countResult.rows[0]?.count || '0', 10);

    // Retrieve items limit/offset
    let selectSQL = `SELECT * FROM permits ${whereSQL} ORDER BY ${safeSortBy} ${sortOrder}`;
    if (req.query.page || req.query.limit) {
      selectSQL += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
      queryValues.push(limit, offset);
    }

    const dataResult = await dbQuery(selectSQL, queryValues);

    if (req.query.page || req.query.limit) {
      res.json({
        data: dataResult.rows,
        meta: {
          total_items: totalItems,
          page,
          limit,
          total_pages: Math.ceil(totalItems / limit)
        }
      });
    } else {
      res.json(dataResult.rows);
    }
  });

  app.get('/api/permits', handleGetPermits);
  app.get('/api/v1/permits', handleGetPermits);

  const handlePostPermit = asyncHandler(async (req: Request, res: Response) => {
    const {
      id,
      applicantName, applicant_name,
      licenseType, license_type,
      submissionDate, submission_date,
      targetDecisionDate, target_decision_date,
      statusGate, status_gate,
      completionPercentage, completion_percentage,
      assignedDesk, assigned_desk,
      auditLogs, audit_logs
    } = req.body;

    const finalId = id || `AD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalApplicant = applicantName || applicant_name || 'Anonymous';
    const finalLicense = licenseType || license_type || 'General Construction';
    const finalSub = submissionDate || submission_date || new Date().toISOString().split('T')[0];
    const finalTarget = targetDecisionDate || target_decision_date || '';
    const finalGate = statusGate || status_gate || 'Zoning Audit';
    const finalPct = Number(completionPercentage !== undefined ? completionPercentage : (completion_percentage !== undefined ? completion_percentage : 0));
    const finalDesk = assignedDesk || assigned_desk || '';
    
    let dbLogs = [];
    const rawLogs = auditLogs || audit_logs;
    if (rawLogs) {
      dbLogs = Array.isArray(rawLogs) ? rawLogs : (typeof rawLogs === 'string' ? JSON.parse(rawLogs) : []);
    }

    const query = `
      INSERT INTO permits (
        id, applicant_name, license_type, submission_date, target_decision_date,
        status_gate, completion_percentage, assigned_desk, audit_logs, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        applicant_name = EXCLUDED.applicant_name,
        license_type = EXCLUDED.license_type,
        submission_date = EXCLUDED.submission_date,
        target_decision_date = EXCLUDED.target_decision_date,
        status_gate = EXCLUDED.status_gate,
        completion_percentage = EXCLUDED.completion_percentage,
        assigned_desk = EXCLUDED.assigned_desk,
        audit_logs = EXCLUDED.audit_logs,
        updated_at = NOW()
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalId, finalApplicant, finalLicense, finalSub, finalTarget,
      finalGate, finalPct, finalDesk, JSON.stringify(dbLogs)
    ]);
    res.status(201).json(result.rows[0]);
  });

  app.post('/api/permits', authenticateToken, checkPermission('permits', 'write'), handlePostPermit);
  app.post('/api/v1/permits', authenticateToken, checkPermission('permits', 'write'), handlePostPermit);

  const handlePutPermit = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      applicantName, applicant_name,
      licenseType, license_type,
      submissionDate, submission_date,
      targetDecisionDate, target_decision_date,
      statusGate, status_gate,
      completionPercentage, completion_percentage,
      assignedDesk, assigned_desk,
      auditLogs, audit_logs
    } = req.body;

    const existing = await dbQuery('SELECT * FROM permits WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Permit not found' });
    }
    const current = existing.rows[0];

    const finalApplicant = applicantName !== undefined ? applicantName : (applicant_name !== undefined ? applicant_name : current.applicant_name);
    const finalLicense = licenseType !== undefined ? licenseType : (license_type !== undefined ? license_type : current.license_type);
    const finalSub = submissionDate !== undefined ? submissionDate : (submission_date !== undefined ? submission_date : current.submission_date);
    const finalTarget = targetDecisionDate !== undefined ? targetDecisionDate : (target_decision_date !== undefined ? target_decision_date : current.target_decision_date);
    const finalGate = statusGate !== undefined ? statusGate : (status_gate !== undefined ? status_gate : current.status_gate);
    const finalPct = completionPercentage !== undefined ? Number(completionPercentage) : (completion_percentage !== undefined ? Number(completion_percentage) : Number(current.completion_percentage));
    const finalDesk = assignedDesk !== undefined ? assignedDesk : (assigned_desk !== undefined ? assigned_desk : current.assigned_desk);
    
    let dbLogs = current.audit_logs;
    const rawLogs = auditLogs !== undefined ? auditLogs : audit_logs;
    if (rawLogs !== undefined) {
      dbLogs = Array.isArray(rawLogs) ? rawLogs : (typeof rawLogs === 'string' ? JSON.parse(rawLogs) : []);
    } else if (typeof dbLogs === 'string') {
      dbLogs = JSON.parse(dbLogs);
    }

    const query = `
      UPDATE permits SET
        applicant_name = $1,
        license_type = $2,
        submission_date = $3,
        target_decision_date = $4,
        status_gate = $5,
        completion_percentage = $6,
        assigned_desk = $7,
        audit_logs = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalApplicant, finalLicense, finalSub, finalTarget,
      finalGate, finalPct, finalDesk, JSON.stringify(dbLogs), id
    ]);
    res.json(result.rows[0]);
  });

  app.put('/api/permits/:id', authenticateToken, checkPermission('permits', 'write'), handlePutPermit);
  app.put('/api/v1/permits/:id', authenticateToken, checkPermission('permits', 'write'), handlePutPermit);

  const handleDeletePermit = asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('DELETE FROM permits WHERE id = $1', [req.params.id]);
    res.json({ success: result.rowCount! > 0 });
  });

  app.delete('/api/permits/:id', authenticateToken, checkPermission('permits', 'delete'), handleDeletePermit);
  app.delete('/api/v1/permits/:id', authenticateToken, checkPermission('permits', 'delete'), handleDeletePermit);

  // --- SUPPORT TICKETS ---
  const handleGetTickets = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : (req.query.page ? 10 : 1000);
    const offset = (page - 1) * limit;

    const sortBy = (req.query.sort_by || req.query.sortBy || 'created_at') as string;
    const safeSortBy = ['id', 'category', 'summary', 'location_woreda', 'votes', 'status', 'created_at'].includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = (req.query.sort_order || req.query.sortOrder || 'DESC').toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const queryValues: any[] = [];
    const whereClauses: string[] = [];

    // Exact Match Filters
    if (req.query.category) {
      whereClauses.push(`category = $${queryValues.length + 1}`);
      queryValues.push(req.query.category);
    }
    if (req.query.status) {
      whereClauses.push(`status = $${queryValues.length + 1}`);
      queryValues.push(req.query.status);
    }
    if (req.query.location_woreda || req.query.locationWoreda) {
      whereClauses.push(`location_woreda = $${queryValues.length + 1}`);
      queryValues.push(req.query.location_woreda || req.query.locationWoreda);
    }

    // Full-Text Search
    const searchQuery = (req.query.q || req.query.search) as string;
    if (searchQuery) {
      const sqlFriendlySearch = `%${searchQuery.trim().toLowerCase()}%`;
      whereClauses.push(`(LOWER(summary) LIKE $${queryValues.length + 1} OR LOWER(detailed_body) LIKE $${queryValues.length + 1} OR LOWER(location_woreda) LIKE $${queryValues.length + 1})`);
      queryValues.push(sqlFriendlySearch);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // Total count for Pagination metadata
    const countResult = await dbQuery(`SELECT COUNT(*) FROM tickets ${whereSQL}`, queryValues);
    const totalItems = parseInt(countResult.rows[0]?.count || '0', 10);

    // Retrieve items limit/offset
    let selectSQL = `SELECT * FROM tickets ${whereSQL} ORDER BY ${safeSortBy} ${sortOrder}`;
    if (req.query.page || req.query.limit) {
      selectSQL += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
      queryValues.push(limit, offset);
    }

    const dataResult = await dbQuery(selectSQL, queryValues);

    if (req.query.page || req.query.limit) {
      res.json({
        data: dataResult.rows,
        meta: {
          total_items: totalItems,
          page,
          limit,
          total_pages: Math.ceil(totalItems / limit)
        }
      });
    } else {
      res.json(dataResult.rows);
    }
  });

  app.get('/api/tickets', handleGetTickets);
  app.get('/api/v1/tickets', handleGetTickets);

  const handlePostTicket = asyncHandler(async (req: Request, res: Response) => {
    const {
      id,
      category,
      summary,
      detailedBody, detailed_body,
      locationWoreda, location_woreda,
      votes,
      status,
      dispatchNote, dispatch_note
    } = req.body;

    const finalId = id || `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalCat = category || 'Infrastructure';
    const finalSummary = summary || '';
    const finalBody = detailedBody || detailed_body || '';
    const finalWoreda = locationWoreda || location_woreda || 'Woreda 01';
    const finalVotes = Number(votes !== undefined ? votes : 0);
    const finalStatus = status || 'Received';
    const finalDispatch = dispatchNote || dispatch_note || '';

    const query = `
      INSERT INTO tickets (
        id, category, summary, detailed_body, location_woreda, votes, status, dispatch_note, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        summary = EXCLUDED.summary,
        detailed_body = EXCLUDED.detailed_body,
        location_woreda = EXCLUDED.location_woreda,
        votes = EXCLUDED.votes,
        status = EXCLUDED.status,
        dispatch_note = EXCLUDED.dispatch_note,
        updated_at = NOW()
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalId, finalCat, finalSummary, finalBody, finalWoreda, finalVotes, finalStatus, finalDispatch
    ]);
    res.status(201).json(result.rows[0]);
  });

  app.post('/api/tickets', authenticateToken, checkPermission('tickets', 'write'), handlePostTicket);
  app.post('/api/v1/tickets', authenticateToken, checkPermission('tickets', 'write'), handlePostTicket);

  const handlePutTicket = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      category,
      summary,
      detailedBody, detailed_body,
      locationWoreda, location_woreda,
      votes,
      status,
      dispatchNote, dispatch_note
    } = req.body;

    const existing = await dbQuery('SELECT * FROM tickets WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const current = existing.rows[0];

    const finalCat = category !== undefined ? category : current.category;
    const finalSummary = summary !== undefined ? summary : current.summary;
    const finalBody = detailedBody !== undefined ? detailedBody : (detailed_body !== undefined ? detailed_body : current.detailed_body);
    const finalWoreda = locationWoreda !== undefined ? locationWoreda : (location_woreda !== undefined ? location_woreda : current.location_woreda);
    const finalVotes = votes !== undefined ? Number(votes) : Number(current.votes);
    const finalStatus = status !== undefined ? status : current.status;
    const finalDispatch = dispatchNote !== undefined ? dispatchNote : (dispatch_note !== undefined ? dispatch_note : current.dispatch_note);

    const query = `
      UPDATE tickets SET
        category = $1,
        summary = $2,
        detailed_body = $3,
        location_woreda = $4,
        votes = $5,
        status = $6,
        dispatch_note = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalCat, finalSummary, finalBody, finalWoreda, finalVotes, finalStatus, finalDispatch, id
    ]);
    res.json(result.rows[0]);
  });

  app.put('/api/tickets/:id', authenticateToken, checkPermission('tickets', 'write'), handlePutTicket);
  app.put('/api/v1/tickets/:id', authenticateToken, checkPermission('tickets', 'write'), handlePutTicket);

  const handleDeleteTicket = asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('DELETE FROM tickets WHERE id = $1', [req.params.id]);
    res.json({ success: result.rowCount! > 0 });
  });

  app.delete('/api/tickets/:id', authenticateToken, checkPermission('tickets', 'delete'), handleDeleteTicket);
  app.delete('/api/v1/tickets/:id', authenticateToken, checkPermission('tickets', 'delete'), handleDeleteTicket);

  // --- BUDGETS ---
  const handleGetBudgets = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : (req.query.page ? 10 : 1000);
    const offset = (page - 1) * limit;

    const sortBy = (req.query.sort_by || req.query.sortBy || 'id') as string;
    const safeSortBy = ['id', 'sector_title', 'weight_allocation', 'approved_capital_expense_etb', 'created_at'].includes(sortBy) ? sortBy : 'id';
    const sortOrder = (req.query.sort_order || req.query.sortOrder || 'ASC').toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const queryValues: any[] = [];
    const whereClauses: string[] = [];

    // Full-Text Search
    const searchQuery = (req.query.q || req.query.search) as string;
    if (searchQuery) {
      const sqlFriendlySearch = `%${searchQuery.trim().toLowerCase()}%`;
      whereClauses.push(`(LOWER(sector_title) LIKE $${queryValues.length + 1} OR LOWER(assigned_project) LIKE $${queryValues.length + 1} OR LOWER(active_milestone) LIKE $${queryValues.length + 1})`);
      queryValues.push(sqlFriendlySearch);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // Total count for Pagination metadata
    const countResult = await dbQuery(`SELECT COUNT(*) FROM budgets ${whereSQL}`, queryValues);
    const totalItems = parseInt(countResult.rows[0]?.count || '0', 10);

    // Retrieve items limit/offset
    let selectSQL = `SELECT * FROM budgets ${whereSQL} ORDER BY ${safeSortBy} ${sortOrder}`;
    if (req.query.page || req.query.limit) {
      selectSQL += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
      queryValues.push(limit, offset);
    }

    const dataResult = await dbQuery(selectSQL, queryValues);

    if (req.query.page || req.query.limit) {
      res.json({
        data: dataResult.rows,
        meta: {
          total_items: totalItems,
          page,
          limit,
          total_pages: Math.ceil(totalItems / limit)
        }
      });
    } else {
      res.json(dataResult.rows);
    }
  });

  app.get('/api/budgets', handleGetBudgets);
  app.get('/api/v1/budgets', handleGetBudgets);

  const handlePostBudget = asyncHandler(async (req: Request, res: Response) => {
    const {
      id,
      sectorTitle, sector_title,
      weightAllocation, weight_allocation,
      approvedCapitalExpenseEtb, approved_capital_expense_etb,
      assignedProject, assigned_project,
      activeMilestone, active_milestone
    } = req.body;

    const finalId = id || `bud-${Math.random().toString(36).substr(2, 9)}`;
    const finalTitle = sectorTitle || sector_title || 'General Sector';
    const finalWeight = Number(weightAllocation !== undefined ? weightAllocation : (weight_allocation !== undefined ? weight_allocation : 0));
    const finalCap = Number(approvedCapitalExpenseEtb !== undefined ? approvedCapitalExpenseEtb : (approved_capital_expense_etb !== undefined ? approved_capital_expense_etb : 0));
    const finalProj = assignedProject || assigned_project || '';
    const finalMilestone = activeMilestone || active_milestone || '';

    const query = `
      INSERT INTO budgets (
        id, sector_title, weight_allocation, approved_capital_expense_etb, assigned_project, active_milestone, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        sector_title = EXCLUDED.sector_title,
        weight_allocation = EXCLUDED.weight_allocation,
        approved_capital_expense_etb = EXCLUDED.approved_capital_expense_etb,
        assigned_project = EXCLUDED.assigned_project,
        active_milestone = EXCLUDED.active_milestone,
        updated_at = NOW()
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalId, finalTitle, finalWeight, finalCap, finalProj, finalMilestone
    ]);
    res.status(201).json(result.rows[0]);
  });

  app.post('/api/budgets', authenticateToken, checkPermission('budgets', 'write'), handlePostBudget);
  app.post('/api/v1/budgets', authenticateToken, checkPermission('budgets', 'write'), handlePostBudget);

  const handlePutBudget = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      sectorTitle, sector_title,
      weightAllocation, weight_allocation,
      approvedCapitalExpenseEtb, approved_capital_expense_etb,
      assignedProject, assigned_project,
      activeMilestone, active_milestone
    } = req.body;

    const existing = await dbQuery('SELECT * FROM budgets WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    const current = existing.rows[0];

    const finalTitle = sectorTitle !== undefined ? sectorTitle : (sector_title !== undefined ? sector_title : current.sector_title);
    const finalWeight = weightAllocation !== undefined ? Number(weightAllocation) : (weight_allocation !== undefined ? Number(weight_allocation) : Number(current.weight_allocation));
    const finalCap = approvedCapitalExpenseEtb !== undefined ? Number(approvedCapitalExpenseEtb) : (approved_capital_expense_etb !== undefined ? Number(approved_capital_expense_etb) : Number(current.approved_capital_expense_etb));
    const finalProj = assignedProject !== undefined ? assignedProject : (assigned_project !== undefined ? assigned_project : current.assigned_project);
    const finalMilestone = activeMilestone !== undefined ? activeMilestone : (active_milestone !== undefined ? active_milestone : current.active_milestone);

    const query = `
      UPDATE budgets SET
        sector_title = $1,
        weight_allocation = $2,
        approved_capital_expense_etb = $3,
        assigned_project = $4,
        active_milestone = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalTitle, finalWeight, finalCap, finalProj, finalMilestone, id
    ]);
    res.json(result.rows[0]);
  });

  app.put('/api/budgets/:id', authenticateToken, checkPermission('budgets', 'write'), handlePutBudget);
  app.put('/api/v1/budgets/:id', authenticateToken, checkPermission('budgets', 'write'), handlePutBudget);

  const handleDeleteBudget = asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('DELETE FROM budgets WHERE id = $1', [req.params.id]);
    res.json({ success: result.rowCount! > 0 });
  });

  app.delete('/api/budgets/:id', authenticateToken, checkPermission('budgets', 'delete'), handleDeleteBudget);
  app.delete('/api/v1/budgets/:id', authenticateToken, checkPermission('budgets', 'delete'), handleDeleteBudget);

  // --- TOURISM PACKAGES ---
  const handleGetTourismPackages = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : (req.query.page ? 10 : 1000);
    const offset = (page - 1) * limit;

    const sortBy = (req.query.sort_by || req.query.sortBy || 'id') as string;
    const safeSortBy = ['id', 'theme', 'title', 'seasonality', 'created_at'].includes(sortBy) ? sortBy : 'id';
    const sortOrder = (req.query.sort_order || req.query.sortOrder || 'ASC').toString().toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const queryValues: any[] = [];
    const whereClauses: string[] = [];

    // Exact Match Filters
    if (req.query.theme) {
      whereClauses.push(`theme = $${queryValues.length + 1}`);
      queryValues.push(req.query.theme);
    }
    if (req.query.seasonality) {
      whereClauses.push(`seasonality = $${queryValues.length + 1}`);
      queryValues.push(req.query.seasonality);
    }

    // Full-Text Search
    const searchQuery = (req.query.q || req.query.search) as string;
    if (searchQuery) {
      const sqlFriendlySearch = `%${searchQuery.trim().toLowerCase()}%`;
      whereClauses.push(`(LOWER(title) LIKE $${queryValues.length + 1} OR LOWER(curator_subtitle) LIKE $${queryValues.length + 1} OR LOWER(theme) LIKE $${queryValues.length + 1})`);
      queryValues.push(sqlFriendlySearch);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    // Total count for Pagination metadata
    const countResult = await dbQuery(`SELECT COUNT(*) FROM tourism_packages ${whereSQL}`, queryValues);
    const totalItems = parseInt(countResult.rows[0]?.count || '0', 10);

    // Retrieve items limit/offset
    let selectSQL = `SELECT * FROM tourism_packages ${whereSQL} ORDER BY ${safeSortBy} ${sortOrder}`;
    if (req.query.page || req.query.limit) {
      selectSQL += ` LIMIT $${queryValues.length + 1} OFFSET $${queryValues.length + 2}`;
      queryValues.push(limit, offset);
    }

    const dataResult = await dbQuery(selectSQL, queryValues);

    if (req.query.page || req.query.limit) {
      res.json({
        data: dataResult.rows,
        meta: {
          total_items: totalItems,
          page,
          limit,
          total_pages: Math.ceil(totalItems / limit)
        }
      });
    } else {
      res.json(dataResult.rows);
    }
  });

  app.get('/api/tourism-packages', handleGetTourismPackages);
  app.get('/api/v1/tourism-packages', handleGetTourismPackages);

  const handlePostTourismPackage = asyncHandler(async (req: Request, res: Response) => {
    const {
      id,
      theme,
      title,
      curatorSubtitle, curator_subtitle,
      seasonality,
      climateDetails, climate_details,
      stops
    } = req.body;

    const finalId = id || `TR-${Math.floor(100 + Math.random() * 900)}`;
    const finalTheme = theme || 'wellness';
    const finalTitle = title || '';
    const finalCurator = curatorSubtitle || curator_subtitle || '';
    const finalSeason = seasonality || '';
    const finalClimate = climateDetails || climate_details || '';

    let dbStops = [];
    if (stops) {
      dbStops = Array.isArray(stops) ? stops : (typeof stops === 'string' ? JSON.parse(stops) : []);
    }

    const query = `
      INSERT INTO tourism_packages (
        id, theme, title, curator_subtitle, seasonality, climate_details, stops, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        theme = EXCLUDED.theme,
        title = EXCLUDED.title,
        curator_subtitle = EXCLUDED.curator_subtitle,
        seasonality = EXCLUDED.seasonality,
        climate_details = EXCLUDED.climate_details,
        stops = EXCLUDED.stops,
        updated_at = NOW()
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalId, finalTheme, finalTitle, finalCurator, finalSeason, finalClimate, JSON.stringify(dbStops)
    ]);
    res.status(201).json(result.rows[0]);
  });

  app.post('/api/tourism-packages', authenticateToken, checkPermission('tourism_packages', 'write'), handlePostTourismPackage);
  app.post('/api/v1/tourism-packages', authenticateToken, checkPermission('tourism_packages', 'write'), handlePostTourismPackage);

  const handlePutTourismPackage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      theme,
      title,
      curatorSubtitle, curator_subtitle,
      seasonality,
      climateDetails, climate_details,
      stops
    } = req.body;

    const existing = await dbQuery('SELECT * FROM tourism_packages WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }
    const current = existing.rows[0];

    const finalTheme = theme !== undefined ? theme : current.theme;
    const finalTitle = title !== undefined ? title : current.title;
    const finalCurator = curatorSubtitle !== undefined ? curatorSubtitle : (curator_subtitle !== undefined ? curator_subtitle : current.curator_subtitle);
    const finalSeason = seasonality !== undefined ? seasonality : current.seasonality;
    const finalClimate = climateDetails !== undefined ? climateDetails : (climate_details !== undefined ? climate_details : current.climate_details);

    let dbStops = current.stops;
    if (stops !== undefined) {
      dbStops = Array.isArray(stops) ? stops : (typeof stops === 'string' ? JSON.parse(stops) : []);
    } else if (typeof dbStops === 'string') {
      dbStops = JSON.parse(dbStops);
    }

    const query = `
      UPDATE tourism_packages SET
        theme = $1,
        title = $2,
        curator_subtitle = $3,
        seasonality = $4,
        climate_details = $5,
        stops = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    const result = await dbQuery(query, [
      finalTheme, finalTitle, finalCurator, finalSeason, finalClimate, JSON.stringify(dbStops), id
    ]);
    res.json(result.rows[0]);
  });

  app.put('/api/tourism-packages/:id', authenticateToken, checkPermission('tourism_packages', 'write'), handlePutTourismPackage);
  app.put('/api/v1/tourism-packages/:id', authenticateToken, checkPermission('tourism_packages', 'write'), handlePutTourismPackage);

  const handleDeleteTourismPackage = asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('DELETE FROM tourism_packages WHERE id = $1', [req.params.id]);
    res.json({ success: result.rowCount! > 0 });
  });

  app.delete('/api/tourism-packages/:id', authenticateToken, checkPermission('tourism_packages', 'delete'), handleDeleteTourismPackage);
  app.delete('/api/v1/tourism-packages/:id', authenticateToken, checkPermission('tourism_packages', 'delete'), handleDeleteTourismPackage);

  // Announcements
  createCrudRoutes('announcements', 'announcements', ['title', 'message', 'type', 'expiry_date', 'priority', 'status', 'language', 'author', 'image_url'], ['title', 'message']);
  
  // Growth Metrics
  createCrudRoutes('growth-metrics', 'growth_metrics', ['year', 'population', 'growth_rate', 'revenue'], ['year']);

  // Services
  createCrudRoutes('services', 'services', ['name', 'description', 'requirements', 'process', 'contact_info', 'status', 'language', 'author'], ['name', 'description']);
  
  // Leadership
  createCrudRoutes('leadership', 'leadership', ['name', 'title', 'department', 'photo', 'biography', 'responsibilities', 'email', 'phone', 'status', 'language', 'author'], ['name', 'title']);
  
  // Mayoral History
  createCrudRoutes('mayoral-history', 'mayoral_history', ['mayor_name', 'photo', 'term', 'summary', 'detailed_description', 'stakeholders', 'achievements', 'challenges', 'kpis', 'status', 'language', 'author'], ['mayor_name']);
  
  // Initiatives
  createCrudRoutes('initiatives', 'initiatives', ['title', 'description', 'category', 'current_status', 'timeline', 'impact', 'status', 'language', 'author', 'image_url'], ['title', 'description']);
  
  // Events
  createCrudRoutes('events', 'events', ['title', 'date', 'location', 'description', 'category', 'image', 'status', 'language', 'author'], ['title', 'date']);
  
  // Documents
  createCrudRoutes('documents', 'documents', ['title', 'category', 'date', 'file_url', 'description', 'status', 'language', 'author', 'cover_image', 'alt_icon'], ['title']);
  
  // Tourism
  createCrudRoutes('tourism', 'tourism', ['attraction_name', 'description', 'location', 'images', 'category', 'status', 'language', 'author'], ['attraction_name']);
  
  // Blog
  createCrudRoutes('blog', 'blog', ['title', 'author', 'category', 'content', 'featured_image', 'tags', 'status', 'language', 'slug', 'meta_title', 'meta_description', 'meta_keywords'], ['title']);
  
  // Media
  createCrudRoutes('media', 'media', ['name', 'url', 'thumbnail_url', 'type', 'category', 'alt_text', 'size', 'mime_type', 'status', 'language', 'author'], ['name', 'url']);

  // Administrative Units
  createCrudRoutes('administrative-units', 'administrative_units', ['name', 'type', 'description', 'members', 'status', 'language', 'author', 'parent_unit', 'office_location', 'contact_phone', 'delegation_code', 'sector_hierarchy'], ['name', 'type']);

  // Hero Video (Singleton)
  app.get('/api/hero-video', asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('SELECT * FROM hero_video LIMIT 1');
    res.json(result.rows[0]);
  }));
  app.put('/api/hero-video', authenticateToken, checkRole(['admin', 'editor']), asyncHandler(async (req: Request, res: Response) => {
    const fields = ['video_url', 'fallback_image', 'autoplay', 'mute', 'loop', 'show_overlay', 'overlay_style', 'overlay_opacity', 'title', 'subtitle', 'cta_text', 'cta_link', 'video_quality', 'low_bandwidth_mode', 'lazy_load'];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => req.body[f]);
    const result = await dbQuery(`UPDATE hero_video SET ${setClause}, updated_at = NOW() RETURNING *`, values);
    res.json(result.rows[0]);
  }));

  // Site Settings (Singleton)
  app.get('/api/site-settings', asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('SELECT * FROM site_settings LIMIT 1');
    res.json(result.rows[0]);
  }));
  app.put('/api/site-settings', authenticateToken, checkRole(['admin']), asyncHandler(async (req: Request, res: Response) => {
    const fields = ['site_name', 'site_description', 'contact_email', 'contact_phone', 'address', 'social_links', 'logo_url', 'favicon_url', 'footer_text', 'maintenance_mode', 'about_us', 'mayors_message', 'mayors_message_author', 'mayors_message_photo', 'established', 'area', 'altitude', 'administrative_structure', 'avg_climate', 'population', 'vision', 'mission', 'mandate'];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => req.body[f]);
    const result = await dbQuery(`UPDATE site_settings SET ${setClause}, updated_at = NOW() RETURNING *`, values);
    res.json(result.rows[0]);
  }));

  // Audit Logs
  app.get('/api/audit-logs', authenticateToken, checkRole(['admin']), asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  }));

  app.post('/api/audit-logs', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    const { action, contentType, contentId, contentTitle, details } = req.body;
    const user = (req as any).user;
    
    const query = `INSERT INTO audit_logs (user_id, user_name, action, content_type, content_id, content_title, details) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
    const result = await dbQuery(query, [user.id, user.username, action, contentType, contentId, contentTitle, details]);
    res.status(201).json(result.rows[0]);
  }));

  // ==========================================
  // DYNAMIC SCHEMAS ENDPOINTS
  // ==========================================
  
  // GET all dynamic schemas
  app.get('/api/dynamic-schemas', asyncHandler(async (req: Request, res: Response) => {
    const result = await dbQuery('SELECT * FROM dynamic_schemas ORDER BY title ASC');
    res.json(result.rows);
  }));

  // GET single dynamic schema
  app.get('/api/dynamic-schemas/:name', asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const result = await dbQuery('SELECT * FROM dynamic_schemas WHERE name = $1', [name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Schema '${name}' not found` });
    }
    res.json(result.rows[0]);
  }));

  // POST create dynamic schema
  app.post('/api/dynamic-schemas', authenticateToken, checkRole(['admin', 'super_admin']), asyncHandler(async (req: Request, res: Response) => {
    const { name, title, description, schema_definition } = req.body;
    if (!name || !title || !schema_definition) {
      return res.status(400).json({ error: 'Name, title, and schema_definition (JSON-Schema format) are required' });
    }
    
    // Slugify name
    const slugifiedName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    
    const query = `INSERT INTO dynamic_schemas (name, title, description, schema_definition) 
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await dbQuery(query, [slugifiedName, title, description, typeof schema_definition === 'string' ? schema_definition : JSON.stringify(schema_definition)]);
    res.status(201).json(result.rows[0]);
  }));

  // PUT update dynamic schema
  app.put('/api/dynamic-schemas/:name', authenticateToken, checkRole(['admin', 'super_admin']), asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const { title, description, schema_definition } = req.body;
    
    if (!title || !schema_definition) {
      return res.status(400).json({ error: 'Title and schema_definition are required for updates' });
    }

    const query = `UPDATE dynamic_schemas 
                   SET title = $1, description = $2, schema_definition = $3, updated_at = NOW() 
                   WHERE name = $4 RETURNING *`;
    const result = await dbQuery(query, [title, description, typeof schema_definition === 'string' ? schema_definition : JSON.stringify(schema_definition), name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Schema '${name}' not found` });
    }
    res.json(result.rows[0]);
  }));

  // DELETE dynamic schema
  app.delete('/api/dynamic-schemas/:name', authenticateToken, checkRole(['admin', 'super_admin']), asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    
    // First let's delete associated dynamic content
    await dbQuery('DELETE FROM dynamic_content WHERE schema_name = $1', [name]);

    const result = await dbQuery('DELETE FROM dynamic_schemas WHERE name = $1 RETURNING *', [name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Schema '${name}' not found` });
    }
    res.json({ success: true, message: `Schema '${name}' successfully deleted` });
  }));

  // ==========================================
  // DYNAMIC CONTENT ENDPOINTS
  // ==========================================

  // GET all content items for a schema
  app.get('/api/dynamic-content/:schema_name', asyncHandler(async (req: Request, res: Response) => {
    const { schema_name } = req.params;
    
    // First verify schema exists
    const schemaResult = await dbQuery('SELECT * FROM dynamic_schemas WHERE name = $1', [schema_name]);
    if (schemaResult.rowCount === 0) {
      return res.status(404).json({ error: `Schema '${schema_name}' does not exist` });
    }

    const result = await dbQuery('SELECT * FROM dynamic_content WHERE schema_name = $1 ORDER BY created_at DESC', [schema_name]);
    res.json(result.rows);
  }));

  // POST create content item for a schema
  app.post('/api/dynamic-content/:schema_name', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    const { schema_name } = req.params;
    const { data, status, language } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Content payload data is required' });
    }

    // Verify schema exists
    const schemaResult = await dbQuery('SELECT * FROM dynamic_schemas WHERE name = $1', [schema_name]);
    if (schemaResult.rowCount === 0) {
      return res.status(404).json({ error: `Schema '${schema_name}' does not exist` });
    }

    const user = (req as any).user;
    const query = `INSERT INTO dynamic_content (schema_name, data, status, language, author) 
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const result = await dbQuery(query, [
      schema_name, 
      typeof data === 'string' ? data : JSON.stringify(data), 
      status || 'draft', 
      language || 'en', 
      user ? user.username : 'admin'
    ]);
    res.status(201).json(result.rows[0]);
  }));

  // PUT update content item
  app.put('/api/dynamic-content/:schema_name/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    const { schema_name, id } = req.params;
    const { data, status, language } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Content payload data is required for updates' });
    }

    const query = `UPDATE dynamic_content 
                   SET data = $1, status = $2, language = $3, updated_at = NOW() 
                   WHERE schema_name = $4 AND id = $5 RETURNING *`;
    const result = await dbQuery(query, [typeof data === 'string' ? data : JSON.stringify(data), status || 'draft', language || 'en', schema_name, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Content item with ID ${id} under schema '${schema_name}' not found` });
    }
    res.json(result.rows[0]);
  }));

  // DELETE content item
  app.delete('/api/dynamic-content/:schema_name/:id', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
    const { schema_name, id } = req.params;
    const result = await dbQuery('DELETE FROM dynamic_content WHERE schema_name = $1 AND id = $2 RETURNING *', [schema_name, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `Content item with ID ${id} under schema '${schema_name}' not found` });
    }
    res.json({ success: true, message: 'Content item successfully deleted' });
  }));

  // ==========================================
  // DECOUPLED CDN SIMULATION ENDPOINTS
  // ==========================================

  // GET CDN Config
  app.get('/api/cdn-config', (req: Request, res: Response) => {
    if (req.query.disable === 'true') {
      cdnConfig.decoupledMode = false;
      return res.redirect('/');
    }
    res.json(cdnConfig);
  });

  // PUT update CDN Config
  app.put('/api/cdn-config', authenticateToken, checkRole(['admin']), (req: Request, res: Response) => {
    const { decoupledMode, cdnBaseUrl } = req.body;
    if (decoupledMode !== undefined) cdnConfig.decoupledMode = !!decoupledMode;
    if (cdnBaseUrl !== undefined) cdnConfig.cdnBaseUrl = cdnBaseUrl;
    res.json(cdnConfig);
  });

  // POST Purge CDN Cache
  app.post('/api/cdn-config/purge', authenticateToken, checkRole(['admin']), (req: Request, res: Response) => {
    cdnConfig.cachePurgedAt = new Date().toISOString();
    cdnConfig.regions.forEach(r => {
      r.cacheHitRatio = (95 + Math.random() * 4.5).toFixed(1) + '%';
    });
    res.json({ success: true, message: 'Global CDN edge caches invalidated successfully.', cdnConfig });
  });

  // Centralized Error Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });

    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
