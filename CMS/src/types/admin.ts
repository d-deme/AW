export type NewsCategory = 'Government' | 'Infra' | 'Civic' | 'Event';

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  summary: string;
  imageUrl: string;
  publishDate: string;
  isPinned: boolean;
  content: string; // Rich markdown text
}

export type PermitLicenseType = 
  | 'Commercial Construction' 
  | 'Small Business License' 
  | 'Solar Wind Installation' 
  | 'Environmental Impact Certificate';

export type PermitStatusGate = 
  | 'In Review' 
  | 'Zoning Audit' 
  | 'Field Inspection' 
  | 'Approved' 
  | 'Action Required';

export interface PermitWorkflowLog {
  id: string;
  date: string;
  stageDescription: string;
  statusFlag: 'Approved' | 'Pending' | 'Warning' | 'Action Required';
}

export interface PermitRecord {
  id: string; // Unique alphanumeric e.g. "AD-2026-0421"
  applicantName: string;
  licenseType: PermitLicenseType;
  submissionDate: string;
  targetDecisionDate: string;
  statusGate: PermitStatusGate;
  completionPercentage: number; // Slider 0 to 100
  assignedDesk: string;
  auditLogs: PermitWorkflowLog[];
}

export type TicketCategory = 'Infrastructure' | 'Utilities' | 'Parks & Green' | 'Safety' | 'General';
export type TicketStatus = 'Received' | 'Assigned' | 'In Progress' | 'Resolved';

export interface SupportTicket {
  id: string; // "TK-1002"
  category: TicketCategory;
  summary: string;
  detailedBody: string;
  locationWoreda: string;
  votes: number;
  status: TicketStatus;
  dispatchNote: string;
}

export interface BudgetAllocation {
  id: string;
  sectorTitle: string; // e.g. "Roads & Infrastructure"
  weightAllocation: number; // 0 - 100
  approvedCapitalExpenseEtb: number; // in ETB currency
  assignedProject: string;
  activeMilestone: string; // e.g. "Phase III Complete"
}

export type TravelTheme = 'wellness' | 'culture' | 'adventure';

export interface ItineraryStop {
  id: string;
  timeOfDay: string; // e.g. "09:00 AM"
  activityTitle: string;
  geoLocation: string;
  description: string;
  curatorTip: string;
}

export interface TourismPackage {
  id: string;
  theme: TravelTheme;
  title: string;
  curatorSubtitle: string;
  seasonality: string; // e.g. "Perfect Year-Round"
  climateDetails: string; // e.g. "24°C - 28°C, Light Mountain Breeze"
  stops: ItineraryStop[];
}
// Administrative Member (used inside AdministrativeUnit)
export interface AdministrativeMember {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  email?: string;
}

// Administrative Unit (full type)
export interface AdministrativeUnit {
  id: string;
  name: string;
  type: 'Sector' | 'SubCity' | 'Woreda' | 'Department';
  description: string;
  members: AdministrativeMember[];
  status: 'draft' | 'published' | 'archived';
  language: 'en' | 'om' | 'am';
  author?: string;
  createdAt: string;
  updatedAt: string;
  // Optional additional fields for structure mapping
  parentUnit?: string;
  officeLocation?: string;
  contactPhone?: string;
  delegationCode?: string;
  sectorHierarchy?: 'Cabinet' | 'Economic' | 'Infrastructure' | 'Social' | 'Security';
}