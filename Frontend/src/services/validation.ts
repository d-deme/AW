import { z } from 'zod';

// 1. App / Site Settings Schema
export const SiteSettingsSchema = z.object({
  id: z.coerce.number().optional().default(1),
  site_name: z.string().min(3).default("Adama City Administration"),
  site_description: z.string().min(10).default("The official public digital gateway for Adama City Administration, serving residents, businesses, and investors with secure, real-time civic resources, official news, and digital government services."),
  contact_email: z.string().email().or(z.string().length(0)).default("info@adama.gov.et"),
  contact_phone: z.string().min(5).default("+251-22-111-2092"),
  address: z.string().min(5).default("Municipal Boulevard, Central District, Adama, Ethiopia"),
  logo_url: z.string().url().or(z.string().length(0)).default("https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&q=80&w=200"),
  favicon_url: z.string().url().or(z.string().length(0)).default("https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&q=80&w=64"),
  footer_text: z.string().min(5).default("© 2026 Adama City Municipal Administration. Devoted to sustainable progress and citizen prosperity."),
  established: z.string().default("1916 G.C."),
  area: z.string().default("58,109 Hectares"),
  altitude: z.string().default("1,712 Meters"),
  avg_climate: z.string().default("22°C (Warm & Sunny)"),
  population: z.string().default("560,000+"),
  administrative_structure: z.string().default("6 Sub-Cities, 19 Kebeles, 32 Municipal Directorates"),
  about_us: z.string().default("Adama represents the cornerstone of municipal modernity, serving as a vital trade gate, industrial epicenter, and administrative blueprint. Through sustainable development, environmental resilience, and dynamic community-centric devolution models, we are fostering unparalleled pathways for enterprise and liveability."),
  mission: z.string().default("To maximize public efficiency, accelerate modern city transition, and enhance equity."),
  vision: z.string().default("To become the premier industrial and green-aligned smart administrative hub."),
  mandate: z.string().default("To govern spatial development, support industrial setups, and deliver master utilities."),
  mayors_message: z.string().default("Welcome to the official digital portal of Adama City. Our vision is to serve our residents, support our businesses, and welcome visitors with open doors and transparent administrative services."),
  mayors_message_author: z.string().default("Hon. Hailu Jelde"),
  mayors_message_photo: z.string().default("https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256"),
  maintenance_mode: z.boolean().default(false).optional()
});

// 2. Announcements Schemas
export const AnnouncementSchema = z.object({
  id: z.string().or(z.number()).transform(String).optional().default(() => Math.random().toString()),
  title: z.string().min(3, 'Title must be at least 3 characters long.').max(120, 'Title must be under 120 characters.'),
  message: z.string().min(10, 'Declaration message notice must be at least 10 characters long.'),
  link: z.string().default('#news'),
  linkText: z.string().default('Read Details'),
  active: z.coerce.boolean().default(true),
  category: z.enum(['Infrastructure', 'Social', 'Economy', 'General']).default('General'),
  imageUrl: z.string().or(z.string().length(0)).optional().default('')
});

export const AnnouncementDbSchema = z.object({
  id: z.coerce.number(),
  title: z.string().min(1).default(''),
  message: z.string().min(1).default(''),
  type: z.string().default('general'),
  priority: z.string().default('medium'),
  status: z.string().default('published'),
  expiry_date: z.string().optional(),
  created_at: z.string().optional()
});

// 3. News Chronicle Schemas
export const NewsPostSchema = z.object({
  id: z.string().or(z.number()).transform(String).optional().default(() => Math.random().toString()),
  title: z.string().min(5, 'Chronicle title must be at least 5 characters long.').max(150, 'Chronicle title must be under 150 characters.'),
  author: z.string().min(2, 'Correspondent name must be at least 2 characters.').default('Adama Press Correspondent'),
  date: z.string().optional(),
  category: z.enum(['Press Release', 'Announcement', 'Event', 'Blog']).default('Blog'),
  summary: z.string().max(300, 'Summary lead block must be under 300 characters.').optional().default(''),
  content: z.string().min(20, 'Content body of the article must be at least 20 characters.'),
  imageUrl: z.string().default('https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800'),
  tags: z.array(z.string()).default([])
});

export const NewsItemDbSchema = z.object({
  id: z.coerce.number(),
  title: z.string().min(1).default('Untitled'),
  content: z.string().min(1).default(''),
  category: z.string().default('Press Release'),
  image_url: z.string().default('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'),
  slug: z.string().optional().default(''),
  tags: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split(',').map(t => t.trim()).filter(Boolean); }
  }).default([]),
  author: z.string().default('Adama Communications Dept'),
  published_at: z.string().optional(),
  created_at: z.string().optional()
});

// 4. Public City Services Schema
export const ServiceDbSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1).default('Public Service'),
  description: z.string().default(''),
  requirements: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split('\n').map(r => r.trim()).filter(Boolean); }
  }).default([]),
  process: z.string().default('Submission, Municipal Audit, and Final License Issuance.'),
  contact_info: z.string().default('Municipal Service Desk'),
  status: z.string().default('published')
});

// 5. Leadership Profile Schema
export const LeadershipDbSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1).default(''),
  title: z.string().default('Coordinating Officer'),
  department: z.string().default('General Administration'),
  biography: z.string().default('Official member of the Adama city coordinator cabinets.'),
  responsibilities: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split('\n').filter(Boolean); }
  }).default([]),
  email: z.string().default('info@adama.gov.et'),
  phone: z.string().default('+251-22-111-2092'),
  photo: z.string().default('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'),
  status: z.string().default('published')
});

// 6. Mayoral History Legacy Schema
export const MayoralHistoryDbSchema = z.object({
  id: z.coerce.number(),
  mayor_name: z.string().min(1).default('Honorable Mayor'),
  photo: z.string().default('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'),
  term: z.string().default('Unknown Term'),
  summary: z.string().default(''),
  detailed_description: z.string().default(''),
  achievements: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split('\n').filter(Boolean); }
  }).default([]),
  challenges: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split('\n').filter(Boolean); }
  }).default([]),
  kpis: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split('\n').filter(Boolean); }
  }).default([]),
  status: z.string().default('published')
});

// 7. Initiatives & Development projects Schema
export const InitiativeDbSchema = z.object({
  id: z.coerce.number(),
  title: z.string().default(''),
  description: z.string().default(''),
  current_status: z.string().default('Ongoing'),
  impact: z.string().default('Enriches local communities with sustainable networks.'),
  category: z.string().default('Infrastructure'),
  image_url: z.string().default('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800'),
  timeline: z.string().default('2025 - 2026'),
  status: z.string().default('published')
});

export const ProjectDbSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).default(''),
  description: z.string().default(''),
  status: z.enum(['Concept', 'Planned', 'Ongoing', 'In Progress', 'Live', 'Completed']).default('Ongoing'),
  impact: z.string().default(''),
  category: z.enum(['Mobility', 'Energy', 'Environment', 'Digital', 'Infrastructure', 'Economic', 'Smart City', 'Community']).default('Infrastructure'),
  imageUrl: z.string().default(''),
  timeline: z.string().optional()
});

// 8. Event Planning Schema
export const EventDbSchema = z.object({
  id: z.string().or(z.number()).transform(String),
  title: z.string().min(1).default('Municipal Event'),
  date: z.string().default(''),
  location: z.string().default('Convention Dome'),
  description: z.string().default(''),
  category: z.string().default('Civic'),
  imageUrl: z.string().default(''),
  status: z.string().default('published')
});

// 9. Document Schema
export const DocumentDbSchema = z.object({
  id: z.coerce.number(),
  title: z.string().min(1).default('Gazette Document'),
  category: z.string().default('Policy Paper'),
  date: z.string().default(''),
  file_url: z.string().default('#'),
  description: z.string().default(''),
  status: z.string().default('published')
});

// 10. Tourism Attraction Schema
export const TourismDbSchema = z.object({
  id: z.coerce.number(),
  attraction_name: z.string().min(1).default(''),
  description: z.string().default(''),
  location: z.string().default('Adama Limits'),
  images: z.union([z.array(z.string()), z.string()]).transform(val => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return val.split(',').map(t => t.trim()).filter(Boolean); }
  }).default([]),
  category: z.string().default('Sightseeing'),
  rating: z.coerce.number().default(4.5),
  status: z.string().default('published')
});

// 11. Permits Form & Creation Schema
export const PermitSchema = z.object({
  applicant_name: z.string().min(2, 'Applicant name is required (min 2 chars).'),
  license_type: z.string().min(1, 'Please select a specific license trade profile.'),
  assigned_desk: z.string().default('Bureau of Urban Infrastructure')
});

// 12. Public Incident Ticket Schema
export const TicketSchema = z.object({
  category: z.enum(['Infrastructure', 'Utilities', 'Parks & Green', 'General Concern']).default('General Concern'),
  summary: z.string().min(5, 'Summary description must be at least 5 character long.'),
  detailed_body: z.string().min(10, 'Details description must be at least 10 characters long.'),
  location_woreda: z.string().min(1, 'Please nominate a target location woreda.')
});

// 13. Budgets Schema
export const BudgetSchema = z.object({
  sector_title: z.string().min(3, 'Sector title is required.'),
  weight_allocation: z.coerce.number().min(1, 'Allocation weight percentage must be over 0.').max(100, 'Weight must be under 100%.'),
  approved_capital_expense_etb: z.coerce.number().min(10000, 'Capital allotment must be at least 10,000 ETB.'),
  assigned_project: z.string().default('Municipal Welfare Campaign'),
  active_milestone: z.string().default('0%')
});

// 14. Tourism Packages Schema
export const TourismPackageSchema = z.object({
  theme: z.enum(['heritage', 'wellness', 'adventure', 'general']).default('general'),
  title: z.string().min(5, 'Special guided title must be at least 5 characters long.'),
  curator_subtitle: z.string().default('Adama Bureau of Tourism'),
  seasonality: z.string().default('Year-Round'),
  climate_details: z.string().default('22°C Warm Sunny'),
  stops: z.array(z.object({
    day: z.coerce.number(),
    title: z.string().min(1)
  })).default([]),
  price: z.string().default('500 ETB'),
  duration: z.string().default('1 Day Tour'),
  inclusions: z.string().default('General Tour Entry Accompanying Guide')
});

// Types Derivations
export type AnnouncementInput = z.infer<typeof AnnouncementSchema>;
export type NewsPostInput = z.infer<typeof NewsPostSchema>;
export type PermitInput = z.infer<typeof PermitSchema>;
export type TicketInput = z.infer<typeof TicketSchema>;
export type BudgetInput = z.infer<typeof BudgetSchema>;
export type TourismPackageInput = z.infer<typeof TourismPackageSchema>;
