import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  Activity, 
  Plus, 
  Minus, 
  Compass, 
  Layers, 
  Loader2, 
  Map, 
  MapPin,
  Check,
  Search,
  Calendar,
  Phone,
  Clock,
  Navigation,
  Wind,
  Info,
  ShieldCheck,
  Sun,
  Eye,
  Route,
  Zap,
  RefreshCw,
  X,
  MessageSquare,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useApi } from '../services/api';
import { SafeHtml, stripHtml } from '../components/ui/SafeHtml';

const SUB_CITIES_BOUNDS = [
  {
    id: 'sub-city-bole',
    name: 'Bole Sub-City',
    path: 'M 180,40 L 480,40 L 520,180 L 350,210 L 180,180 Z',
    fill: 'rgba(234, 179, 8, 0.1)',
    activeFill: 'rgba(234, 179, 8, 0.3)',
    stroke: '#eab308',
    labelX: 330,
    labelY: 110,
    text: 'Bole Sub-City (Yellow) - Northern Commercial Hub'
  },
  {
    id: 'sub-city-dabe',
    name: 'Dabe Sub-City',
    path: 'M 520,180 L 760,120 L 780,390 L 480,340 Z',
    fill: 'rgba(219, 39, 119, 0.1)',
    activeFill: 'rgba(219, 39, 119, 0.3)',
    stroke: '#db2777',
    labelX: 630,
    labelY: 250,
    text: 'Dabe Sub-City (Dark Pink) - Institutional Sector & Eastern Summit Grid'
  },
  {
    id: 'sub-city-lugo',
    name: 'Lugo Sub-City',
    path: 'M 350,210 L 520,180 L 480,340 L 280,340 Z',
    fill: 'rgba(239, 68, 68, 0.1)',
    activeFill: 'rgba(239, 68, 68, 0.3)',
    stroke: '#ef4444',
    labelX: 400,
    labelY: 260,
    text: 'Lugo Sub-City (Red) - Beating CBD & Retail Metro Core'
  },
  {
    id: 'sub-city-aba-gadaa',
    name: 'Aba Gadaa Sub-City',
    path: 'M 40,150 L 180,180 L 280,340 L 80,400 Z',
    fill: 'rgba(249, 115, 22, 0.1)',
    activeFill: 'rgba(249, 115, 22, 0.3)',
    stroke: '#f97316',
    labelX: 140,
    labelY: 270,
    text: 'Aba Gadaa Sub-City (Orange) - Historic Green Boulevards & Cultural Forum'
  },
  {
    id: 'sub-city-dambala',
    name: 'Dambala Sub-City',
    path: 'M 80,400 L 280,340 L 220,520 L 50,510 Z',
    fill: 'rgba(34, 197, 94, 0.1)',
    activeFill: 'rgba(34, 197, 94, 0.3)',
    stroke: '#22c55e',
    labelX: 155,
    labelY: 440,
    text: 'Dambala Sub-City (Light Green) - Western Industrial Buffer & Logistics Hub'
  },
  {
    id: 'sub-city-boku-shanan',
    name: 'Boku Shanan Sub-City',
    path: 'M 280,340 L 480,340 L 500,520 L 220,520 Z',
    fill: 'rgba(244, 114, 182, 0.1)',
    activeFill: 'rgba(244, 114, 182, 0.3)',
    stroke: '#f472b6',
    labelX: 370,
    labelY: 430,
    text: 'Boku Shanan Sub-City (Light Pink) - Southern Eco-Farming & Development Frontier'
  }
];

interface SmartMapProps {
  onNavigate: (page: string) => void;
}

interface MapZone {
  id: string;
  name: string;
  color: string;
}

export interface LocationPOI {
  id: string;
  label: string;
  category: 'civic' | 'economy' | 'energy' | 'culture';
  desc: string;
  details: string;
  coords: { lat: number; lng: number };
  zoom: number;
  hours: string;
  contact: string;
  status: 'Functional' | 'Peak Output' | 'Ready' | 'Busy';
  statusColor: string;
  mapX?: number;
  mapY?: number;
}

// Complete Oromia Adama City Landmark Dataset
const ADAMA_POIS: LocationPOI[] = [
  {
    id: 'city-hall',
    label: 'Adama Municipal City Hall',
    category: 'civic',
    desc: 'Central Administrative Headquarters & Mayor Office',
    details: 'The legislative heart of Adama, executing master developments, issuing public circulars, and hosting Oromia planning Councils.',
    coords: { lat: 8.5430, lng: 39.2050 },
    zoom: 16,
    hours: '08:30 AM - 05:30 PM (Mon-Fri)',
    contact: '+251-22-111-2092',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 380,
    mapY: 240
  },
  {
    id: 'referral-hospital',
    label: 'Adama General Referral Hospital',
    category: 'civic',
    desc: 'Primary Regional Health & Emergency Facility',
    details: 'Serving East Oromia with advanced multi-specialty triage labs, digital diagnostics scanners, and 24/7 direct ambulance dispatcher nets.',
    coords: { lat: 8.5510, lng: 39.2150 },
    zoom: 15,
    hours: '24 Hours / 7 Days Active',
    contact: '+251-22-112-9900 (Emergency)',
    status: 'Busy',
    statusColor: 'text-amber-600 bg-amber-50 border-amber-100',
    mapX: 430,
    mapY: 200
  },
  {
    id: 'gadaa-hall',
    label: 'Gadaa Conference Center & Summit Arena',
    category: 'civic',
    desc: 'Oromia Regional Assembly & Cultural Forum',
    details: 'Pioneering host venue for pan-African investment symposiums, local development forums, and municipal budget voting meetings.',
    coords: { lat: 8.5360, lng: 39.2200 },
    zoom: 15,
    hours: '09:00 AM - 06:00 PM (Event Days)',
    contact: '+251-22-114-1002',
    status: 'Ready',
    statusColor: 'text-blue-500 bg-blue-50 border-blue-100',
    mapX: 550,
    mapY: 230
  },
  {
    id: 'industrial-park',
    label: 'Adama Industrial Park (AIPDC)',
    category: 'economy',
    desc: 'Special Export & Heavy Textile Manufactories',
    details: 'A premier green logistics park spanning hundreds of hectares. Connected directly to electricity from local wind nodes and express rail cargo.',
    coords: { lat: 8.5250, lng: 39.2600 },
    zoom: 14,
    hours: '07:00 AM - 10:00 PM (Shift Base)',
    contact: '+251-22-119-4500 (Invest Desk)',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 680,
    mapY: 340
  },
  {
    id: 'djibouti-rail',
    label: 'Ethio-Djibouti Railway Station',
    category: 'economy',
    desc: 'Transnational Cargo, Freights & Transit Terminal',
    details: 'The crucial transport backbone delivering rapid freight import and export flows between landlocked Ethiopia and Djibouti Gulf sea lanes.',
    coords: { lat: 8.5150, lng: 39.2450 },
    zoom: 15,
    hours: '06:00 AM - 09:00 PM Daily',
    contact: '+251-22-120-1122',
    status: 'Ready',
    statusColor: 'text-blue-500 bg-blue-50 border-blue-100',
    mapX: 580,
    mapY: 440
  },
  {
    id: 'expressway',
    label: 'Adama-Addis Expressway Toll Plaza',
    category: 'economy',
    desc: 'Smart 6-Lane High Speed Industrial Expressway',
    details: 'Ethiopia first stellar mega-tolled speedway, shortening transport times from Adama to the capital city to under 45 minutes.',
    coords: { lat: 8.5750, lng: 39.1850 },
    zoom: 14,
    hours: '24 Hours / 365 Days Active',
    contact: '+251-11-412-8822',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 280,
    mapY: 90
  },
  {
    id: 'wind-farm',
    label: 'Adama Wind Energy Farm (I & II)',
    category: 'energy',
    desc: '102 MegaWatt Renewable Wind Grid Hub',
    details: 'Dozens of towering wind turbine hills harnessing strong Rift Valley gales to feed sustainable, eco-friendly energy directly to Adama grid nodes.',
    coords: { lat: 8.5550, lng: 39.2120 },
    zoom: 14,
    hours: '24/7 Grid Generation Core',
    contact: '+251-22-132-0091',
    status: 'Peak Output',
    statusColor: 'text-cyan bg-cyan/10 border-cyan/20 animate-pulse',
    mapX: 425,
    mapY: 130
  },
  {
    id: 'water-hub',
    label: 'Abaa-Sena Smart Water Treatment Depot',
    category: 'energy',
    desc: 'SCADA Integrated Fresh Sewage & Water Grid',
    details: 'Digitally monitored water filtration and purification plant with telemetry monitoring flows across all 19 municipal Woreda pipelines.',
    coords: { lat: 8.5320, lng: 39.1920 },
    zoom: 15,
    hours: '24/7 Utilities Monitoring Core',
    contact: '+251-22-135-4422',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 250,
    mapY: 210
  },
  {
    id: 'sodere-resort',
    label: 'Sodere Thermal Springs Resort',
    category: 'culture',
    desc: 'Natural Hot Mineral Spas & Awash River Forest',
    details: 'Adama leading natural destination spot, famous for geothermal therapy pools, local monkeys corridors, and relaxing weekend lodges.',
    coords: { lat: 8.4110, lng: 39.3890 },
    zoom: 13,
    hours: '07:00 AM - 11:30 PM Daily',
    contact: '+251-22-225-0100',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 740,
    mapY: 530
  },
  {
    id: 'oromo-cultural',
    label: 'Oromo Cultural Heritage Center Museum',
    category: 'culture',
    desc: 'Interactive Exhibition of Gadaa Assembly Roots',
    details: 'Preserving the historic relics of traditional Oromo architecture, historic instruments, clothing, and Odaa meeting records.',
    coords: { lat: 8.5450, lng: 39.2150 },
    zoom: 16,
    hours: '08:30 AM - 05:30 PM Daily',
    contact: '+251-22-115-9088',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 480,
    mapY: 210
  },
  {
    id: 'central-park',
    label: 'Municipal Smart Central Greenway Park',
    category: 'culture',
    desc: 'Active Urban Forest with Public Solar Lighting',
    details: 'A pristine landscaped green public sector offering scenic jogging tracks, community picnic areas, and free municipal civic Wi-Fi.',
    coords: { lat: 8.5385, lng: 39.2065 },
    zoom: 16,
    hours: '06:00 AM - 10:00 PM Daily',
    contact: '+251-22-111-0011',
    status: 'Ready',
    statusColor: 'text-blue-500 bg-blue-50 border-blue-100',
    mapX: 345,
    mapY: 290
  },
  {
    id: 'sub-city-bole',
    label: 'Bole Sub-City Administration (Yellow)',
    category: 'civic',
    desc: 'Northern Commercial Hub & High-Density Residential Sector',
    details: 'Governing the yellow Northern sub-city bounds. Focal point for high-density modern housing, express commercial corridors, and primary schools expansion grids.',
    coords: { lat: 8.5600, lng: 39.2000 },
    zoom: 14,
    hours: '08:30 AM - 05:30 PM (Mon-Fri)',
    contact: '+251-22-111-9001',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 330,
    mapY: 110
  },
  {
    id: 'sub-city-dabe',
    label: 'Dabe Sub-City Administration (Dark Pink)',
    category: 'civic',
    desc: 'Institutional Sector, Universities & Research Belt',
    details: 'Governing the dark pink North-Eastern sub-city bounds. Famous for hosting Adama Science & Technology University (ASTU) and regional administration parks.',
    coords: { lat: 8.5360, lng: 39.2250 },
    zoom: 14,
    hours: '08:30 AM - 05:30 PM (Mon-Fri)',
    contact: '+251-22-111-9003',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 630,
    mapY: 250
  },
  {
    id: 'sub-city-lugo',
    label: 'Lugo Sub-City Administration (Red)',
    category: 'civic',
    desc: 'Central Business District & Retail Core Metro',
    details: 'The beating retail heart of Adama, colored Red in the regional logistics maps. Governs central hospitality corridors, banks, shopping complexes, and major public transport junctions.',
    coords: { lat: 8.5440, lng: 39.2050 },
    zoom: 14,
    hours: '08:30 AM - 05:30 PM (Mon-Fri)',
    contact: '+251-22-111-9005',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 400,
    mapY: 260
  },
  {
    id: 'sub-city-aba-gadaa',
    label: 'Aba Gadaa Sub-City Administration (Orange)',
    category: 'civic',
    desc: 'Western Gateway & Manufacturing Corridors',
    details: 'Regulating the highly active orange western industrial zones. Manages public utilities connection maps for express manufacturers and heavy trucking ports.',
    coords: { lat: 8.5200, lng: 39.1700 },
    zoom: 14,
    hours: '08:30 AM - 05:30 PM (Mon-Fri)',
    contact: '+251-22-111-9004',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 140,
    mapY: 270
  },
  {
    id: 'sub-city-dambala',
    label: 'Dambala Sub-City Office (Light Green)',
    category: 'civic',
    desc: 'Historic Riverway Trading Sector & Agricultural Port',
    details: 'Governing the fertile south-western district of Adama, colored Light Green in the logistics directory. Focuses on local agricultural wholesale, traditional marketplaces, and health posts coordination.',
    coords: { lat: 8.5300, lng: 39.1800 },
    zoom: 14,
    hours: '08:30 AM - 05:30 PM (Mon-Fri)',
    contact: '+251-22-111-9002',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 155,
    mapY: 440
  },
  {
    id: 'sub-city-boku-shanan',
    label: 'Boku Shanan Sub-City Administration (Light Pink)',
    category: 'civic',
    desc: 'Southern Expansion Area & Eco-Farming Belt',
    details: 'Governing the Southern frontier sector, colored Light Pink in our spatial map picture. Focuses on local agricultural cooperatives, hot springs tourism pathways, and green forest reservations.',
    coords: { lat: 8.4900, lng: 39.2100 },
    zoom: 14,
    hours: '08:30 AM - 05:30 PM (Mon-Fri)',
    contact: '+251-22-111-9006',
    status: 'Functional',
    statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    mapX: 370,
    mapY: 430
  }
];

export const SmartMap = ({ onNavigate }: SmartMapProps) => {
  const [zoom, setZoom] = useState(13);
  const [mapMode, setMapMode] = useState<'vibrant_city' | 'standard' | 'satellite'>('vibrant_city');
  const [center, setCenter] = useState({ lat: 8.5430, lng: 39.2050 });
  const [locating, setLocating] = useState(false);
  const [locStatus, setLocStatus] = useState<string | null>(null);

  // Advanced interactivity UI controls
  const [selectedPoiId, setSelectedPoiId] = useState<string>('city-hall');
  const [activeTab, setActiveTab] = useState<'landmarks' | 'directions' | 'climate'>('landmarks');
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'traffic' | 'wind' | 'infrastructure' | 'districts'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [poiCategoryFilter, setPoiCategoryFilter] = useState<'all' | 'civic' | 'economy' | 'energy' | 'culture'>('all');
  
  // Custom router simulator states
  const [routeFrom, setRouteFrom] = useState('city-hall');
  const [routeTo, setRouteTo] = useState('industrial-park');
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [hasRouteResult, setHasRouteResult] = useState(false);
  const [directionsSteps, setDirectionsSteps] = useState<string[]>([]);
  const [routeDistance, setRouteDistance] = useState('0.0 km');
  const [routeTime, setRouteTime] = useState('0 min');

  // Wind energy slider state
  const [windSpeedVal, setWindSpeedVal] = useState(45); // Representing standard 45 km/h Rift gale
  const [routeWarning, setRouteWarning] = useState<string | null>(null);

  // Liaison Modal Feedback state
  const [showLiaisonSuccess, setShowLiaisonSuccess] = useState(false);
  const [liaisonText, setLiaisonText] = useState('');

  // Fetch city zones directly from the backend API
  const { data: zonesData } = useApi<MapZone[]>('/administrative-units');
  
  // Dynamic Feed integration from Municipal Database
  const { data: dynamicPoisData } = useApi<LocationPOI[]>('/map-locations');
  const datasetPOIs = (dynamicPoisData && dynamicPoisData.length > 0) ? dynamicPoisData : ADAMA_POIS;

  const defaultZones: MapZone[] = [
    { id: 'central', name: 'Central Business District', color: 'cyan' },
    { id: 'industrial', name: 'Industrial Zone', color: 'magenta' },
    { id: 'residential', name: 'Smart Residential', color: 'green' },
    { id: 'transport', name: 'Logistics Hub', color: 'yellow' }
  ];

  const zones = zonesData || defaultZones;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 1, 19));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 1, 10));
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocStatus("Geolocation is not supported by your browser");
      setTimeout(() => setLocStatus(null), 3000);
      return;
    }

    setLocating(true);
    setLocStatus("Locating user coordinates...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Check if user location is in Adama limits for smart bounds alignment
        const inAdamaLat = lat >= 8.35 && lat <= 8.75;
        const inAdamaLng = lng >= 39.05 && lng <= 39.45;

        if (inAdamaLat && inAdamaLng) {
          setCenter({ lat, lng });
          setZoom(16);
          setLocStatus("Success! Centered on your position.");
        } else {
          // If the user's remote device is outside Adama limits, demo a realistic local resident node inside city limits 
          setCenter({ lat: 8.5492, lng: 39.2014 });
          setZoom(16);
          setLocStatus("Centered on simulated resident position within Adama limits!");
        }
        setLocating(false);
        setTimeout(() => setLocStatus(null), 4000);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setCenter({ lat: 8.5430, lng: 39.2050 });
        setZoom(14);
        setLocStatus("Location access denied. Centered to Adama City Center.");
        setLocating(false);
        setTimeout(() => setLocStatus(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  };

  // Sync active landmark location when clicked directly on list card
  const selectPOI = (poi: LocationPOI) => {
    setSelectedPoiId(poi.id);
    setCenter(poi.coords);
    setZoom(poi.zoom);
  };

  // Simulated smart route path mapping calculator
  const calculateSimulatedRoute = () => {
    if (routeFrom === routeTo) {
      setRouteWarning("Please select distinct starting and arrival coordinates.");
      setTimeout(() => setRouteWarning(null), 5000);
      return;
    }
    setRouteWarning(null);
    setCalculatingRoute(true);
    setHasRouteResult(false);

    setTimeout(() => {
      const fromObj = datasetPOIs.find(p => p.id === routeFrom);
      const toObj = datasetPOIs.find(p => p.id === routeTo);
      if (!fromObj || !toObj) return;

      // Deterministic distance calculations
      const dLat = Math.abs(fromObj.coords.lat - toObj.coords.lat);
      const dLng = Math.abs(fromObj.coords.lng - toObj.coords.lng);
      const distanceRaw = (dLat + dLng) * 111.32; // Rough kilometer conversion in East Africa
      const finalDistance = Math.min(Math.max(distanceRaw, 1.2), 35.8).toFixed(1);
      
      const speedKmH = 42; // Estimate city traffic limits
      const finalMinutes = Math.round((parseFloat(finalDistance) / speedKmH) * 60 + 2);

      // Generate dynamic routing timeline steps
      const steps = [
        `Depart starting point: [${fromObj.label}]`,
        `Merge onto regional connector road toward Bole or central expressway feeder`,
        distanceRaw > 12 
          ? `Proceed onto High-Speed Adama expressway lanes toward Rift scenic pass` 
          : `Navigate through civic center roundabout bypass, avoiding municipal congestion`,
        `Confirm approach vector inside assigned sub-city administration bounds`,
        `Arrive safely at destination point: [${toObj.label}]`
      ];

      setRouteDistance(`${finalDistance} km`);
      setRouteTime(`${finalMinutes} mins`);
      setDirectionsSteps(steps);
      setCalculatingRoute(false);
      setHasRouteResult(true);

      // Center maps center directly to midpoint coordinates
      const midLat = (fromObj.coords.lat + toObj.coords.lat) / 2;
      const midLng = (fromObj.coords.lng + toObj.coords.lng) / 2;
      setCenter({ lat: midLat, lng: midLng });
      setZoom(Math.max(12, 16 - Math.round(parseFloat(finalDistance) / 4.5)));
    }, 800);
  };

  const handleLiaisonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liaisonText.trim()) return;
    setShowLiaisonSuccess(true);
    setTimeout(() => {
      setShowLiaisonSuccess(false);
      setLiaisonText('');
    }, 4000);
  };

  // Build high impact embed maps source URL
  const mapUrl = mapMode === 'satellite' 
    ? `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}&t=k&output=embed` 
    : `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}&output=embed`;

  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500 shadow-cyan-500/30 border-cyan-400',
    magenta: 'bg-fuchsia-500 shadow-fuchsia-500/30 border-fuchsia-400',
    green: 'bg-emerald-500 shadow-emerald-500/30 border-emerald-400',
    yellow: 'bg-amber-400 shadow-amber-400/30 border-amber-300',
  };

  const textDotMap: Record<string, string> = {
    cyan: 'bg-cyan-500',
    magenta: 'bg-fuchsia-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-400',
  };

  // Filters POIs by Category and Search criteria
  const filteredPOIs = datasetPOIs.filter(poi => {
    const matchesCategory = poiCategoryFilter === 'all' || poi.category === poiCategoryFilter;
    const matchesSearch = poi.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          poi.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          poi.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activePOI = datasetPOIs.find(p => p.id === selectedPoiId) || datasetPOIs[0];

  return (
    <section id="map" className="section-padding bg-neutral-50 relative pb-28" aria-labelledby="map-heading">
      
      {/* CSS Keyframe animations injection */}
      <style>{`
        @keyframes borderDash {
          to {
            stroke-dashoffset: -80;
          }
        }
        @keyframes windBlowCurrents {
          0% {
            transform: translateX(-40%) translateY(0%);
            opacity: 0;
          }
          30% {
            opacity: 0.65;
          }
          70% {
            opacity: 0.65;
          }
          100% {
            transform: translateX(40%) translateY(20%);
            opacity: 0;
          }
        }
        .animate-border-dash {
          stroke-dasharray: 10, 5;
          animation: borderDash 4s linear infinite;
        }
        .animate-wind-flow {
          animation: windBlowCurrents 5s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="max-w-2xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-navy-light mb-3">Enterprise GIS & Utilities</h3>
            <h2 id="map-heading" className="text-2xl md:text-4xl font-extrabold tracking-tight text-navy mb-4 font-official uppercase">Interactive City Logistics & Energy Map</h2>
            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
              Explore municipal offices, strategic business points, and regional climate resources. Coordinate sustainable grid outputs or calculate optimal expressway routes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('#tourism')} 
              className="btn-secondary py-3 text-[10px]"
              aria-label="View tourist attractions on map"
            >
              Tourism Destinations
            </button>
            <button 
              onClick={() => onNavigate('#services')} 
              className="btn-primary py-3 text-[10px]"
              aria-label="View public facilities on map"
            >
              Assigned Services
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10 items-stretch">
          
          {/* Left Container (3 cols): Map Area & Visual Interactive Overlays */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-neutral-200 min-h-[580px] relative flex flex-col"
            >
              {/* Map Canvas Frame Area */}
              <div className="flex-1 relative overflow-hidden min-h-[460px]">
                <iframe
                  title="Google Map of Adama, Ethiopia"
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ 
                    border: 0,
                    filter: mapMode === 'vibrant_city' 
                      ? 'invert(1) hue-rotate(185deg) saturate(1.8) contrast(1.25) brightness(0.95)'
                      : undefined
                  }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className={`w-full h-full border-0 transition-all duration-700 ${
                    mapMode === 'standard' 
                      ? 'contrast-[1.02] saturate-[1.05]' 
                      : mapMode === 'satellite'
                      ? 'contrast-[1.05] saturate-[1.15]'
                      : ''
                  }`}
                />

                {/* ADVANCED OVERLAY SVG DIRECTLY RENDERED ON TOP OF THE GOOGLE MAP CHASSIS */}
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-screen select-none">
                  
                  {/* Traffic Overlay (Simulated neon vehicular pulse flows) */}
                  {activeOverlay === 'traffic' && (
                    <svg className="w-full h-full opacity-80" viewBox="0 0 800 600" preserveAspectRatio="none">
                      <path d="M 50 200 Q 400 350, 750 200" fill="none" stroke="#22c55e" strokeWidth="4" className="animate-border-dash fill-none" />
                      <path d="M 50 200 Q 400 350, 750 200" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="5, 30" className="animate-[borderDash_2s_linear_infinite] fill-none" />
                      
                      <path d="M 200 500 Q 450 300, 700 50" fill="none" stroke="#ef4444" strokeWidth="4" className="animate-border-dash fill-none" />
                      <path d="M 300 100 Q 350 400, 480 550" fill="none" stroke="#22c55e" strokeWidth="3" className="animate-border-dash fill-none" />
                      
                      {/* Floating hot-spots markers */}
                      <circle cx="440" cy="270" r="16" fill="#ef4444" fillOpacity="0.15" className="animate-ping" />
                      <circle cx="440" cy="270" r="6" fill="#ef4444" />
                      
                      <circle cx="340" cy="250" r="12" fill="#eab308" fillOpacity="0.2" className="animate-pulse" />
                      <circle cx="340" cy="250" r="5" fill="#eab308" />
                    </svg>
                  )}

                  {/* Wind / Meteorological Overlay (Flowing wavy ribbons aligned with Rift Gale sliders) */}
                  {activeOverlay === 'wind' && (
                    <svg className="w-full h-full opacity-70" viewBox="0 0 800 600" preserveAspectRatio="none">
                      {/* Generates customized ribbons based on set windspeed */}
                      <path d="M -200 100 C 150 50, 250 200, 850 120" fill="none" stroke="#06b6d4" strokeWidth={windSpeedVal / 18 + 0.5} className="animate-wind-flow fill-none" style={{ animationDuration: `${12 - (windSpeedVal / 10)}s` }} />
                      <path d="M -150 240 C 200 180, 300 350, 900 200" fill="none" stroke="#00ebc7" strokeWidth={windSpeedVal / 22 + 0.5} className="animate-wind-flow fill-none" style={{ animationDuration: `${9 - (windSpeedVal / 12)}s` }} />
                      <path d="M -220 380 C 100 300, 400 500, 800 420" fill="none" stroke="#06b6d4" strokeWidth={windSpeedVal / 20 + 0.5} className="animate-wind-flow fill-none" style={{ animationDuration: `${14 - (windSpeedVal / 10)}s` }} />
                      <path d="M -100 500 C 250 420, 350 580, 950 480" fill="none" stroke="#00ebc7" strokeWidth={windSpeedVal / 24 + 0.5} className="animate-wind-flow fill-none" style={{ animationDuration: `${11 - (windSpeedVal / 11)}s` }} />
                      
                      {/* Fast vector particle coordinates */}
                      <circle cx={420 + (windSpeedVal % 50)} cy="220" r="2.5" fill="#00ebc7" className="animate-[ping_3s_infinite]" />
                      <circle cx={220 + (windSpeedVal % 40)} cy="450" r="3" fill="#06b6d4" className="animate-[ping_4s_infinite]" />
                    </svg>
                  )}

                  {/* Smart Logistics Infrastructure Mesh Networks */}
                  {activeOverlay === 'infrastructure' && (
                    <svg className="w-full h-full opacity-80" viewBox="0 0 800 600" preserveAspectRatio="none">
                      {/* Draw nodes linking City Hall, IPDC, and rail gates */}
                      <g stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4, 4" className="fill-none">
                        <line x1="150" y1="200" x2="350" y2="150" />
                        <line x1="350" y1="150" x2="620" y2="400" />
                        <line x1="620" y1="400" x2="520" y2="510" />
                        <line x1="520" y1="510" x2="150" y2="200" />
                        <line x1="350" y1="150" x2="520" y2="510" />
                      </g>

                      {/* Moving packages circles */}
                      <circle cx="350" cy="150" r="9" fill="#6366f1" fillOpacity="0.4" className="animate-[ping_2s_infinite]" />
                      <circle cx="350" cy="150" r="4.5" fill="#6366f1" />
                      
                      <circle cx="620" cy="400" r="9" fill="#06d6a0" fillOpacity="0.4" className="animate-[ping_2.5s_infinite]" />
                      <circle cx="620" cy="400" r="4.5" fill="#06d6a0" />

                       <circle cx="150" cy="200" r="9" fill="#ff5b79" fillOpacity="0.4" className="animate-[ping_3s_infinite]" />
                       <circle cx="150" cy="200" r="4.5" fill="#ff5b79" />
                     </svg>
                   )}
                 </div>
 
                 {/* DISTRICTS / SUB-CITIES BOUNDARY MAP INTERACTIVE VECTOR OVERLAY */}
                 {activeOverlay === 'districts' && (
                   <div className="absolute inset-0 z-20 overflow-hidden bg-navy/25 backdrop-blur-[0.5px]">
                     <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
                       {SUB_CITIES_BOUNDS.map((sub) => {
                         const isSelected = selectedPoiId === sub.id;
                         return (
                           <g key={sub.id} className="group cursor-pointer">
                             {/* Hoverable path overlay */}
                             <path
                               d={sub.path}
                               fill={isSelected ? sub.activeFill : sub.fill}
                               stroke={sub.stroke}
                               strokeWidth={isSelected ? "4" : "1.5"}
                               strokeDasharray={isSelected ? "6,4" : "none"}
                               onClick={() => {
                                 const poiObj = datasetPOIs.find(p => p.id === sub.id);
                                 if (poiObj) {
                                   setSelectedPoiId(sub.id);
                                   setCenter(poiObj.coords);
                                   setZoom(poiObj.zoom || 14);
                                 }
                               }}
                               className="transition-all duration-300 hover:fill-opacity-40"
                               style={{ pointerEvents: 'auto' }}
                             />
                             {/* District center label text bubble representation using foreignObject */}
                             <foreignObject
                               x={sub.labelX - 85}
                               y={sub.labelY - 22}
                               width="170"
                               height="60"
                               className="pointer-events-none"
                             >
                               <div className="flex flex-col items-center justify-center text-center">
                                 <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-black text-white ${
                                   isSelected ? 'bg-fuchsia-600 border border-fuchsia-400 shadow-lg font-black scale-105' : 'bg-navy/85 border border-white/20'
                                 } transition-all duration-300 shadow-md uppercase tracking-wide`}>
                                   {sub.name}
                                 </span>
                                 <span className="text-[7.5px] font-bold text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,1)] mt-0.5 max-w-[150px] truncate">
                                   {sub.text}
                                 </span>
                               </div>
                             </foreignObject>
                           </g>
                         );
                       })}
                     </svg>
                   </div>
                 )}

                  {/* INTERACTIVE LOCATION PINS LAYER ON MAP OVERLAY */}
                  <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                    {datasetPOIs.map((poi) => {
                      if (poi.mapX === undefined || poi.mapY === undefined) return null;
                      const isSelected = selectedPoiId === poi.id;
                      
                      const leftPercent = (poi.mapX / 800) * 100;
                      const topPercent = (poi.mapY / 600) * 100;
                      
                      return (
                        <div
                          key={poi.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-200"
                          style={{ left: `${leftPercent}%`, top: `${topPercent}%`, zIndex: isSelected ? 40 : 20 }}
                        >
                          {/* Button Pin */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectPOI(poi);
                            }}
                            className={`relative p-1.5 rounded-full border shadow-md transition-all duration-300 focus:outline-none group ${
                              isSelected
                                ? 'bg-navy text-cyan scale-120 ring-2 ring-cyan shadow-cyan-500/35 border-cyan shadow-lg'
                                : 'bg-white text-navy hover:text-cyan border-neutral-300/80 hover:scale-110 hover:shadow-lg'
                            }`}
                          >
                            {/* Landmark Category Visual Key Icon */}
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                              poi.category === 'civic' ? 'bg-indigo-500 text-white' :
                              poi.category === 'economy' ? 'bg-fuchsia-500 text-white' :
                              poi.category === 'energy' ? 'bg-cyan-500 text-slate-900' :
                              'bg-emerald-500 text-white'
                            }`}>
                              {poi.category === 'civic' ? '🏛️' :
                               poi.category === 'economy' ? '💼' :
                               poi.category === 'energy' ? '⚡' :
                               '🌸'}
                            </div>

                            {/* Enhanced Tooltip hovering card */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:flex flex-col gap-1.5 bg-navy border border-white/20 text-white p-3 rounded-xl shadow-2xl z-50 pointer-events-none min-w-[210px] w-52 text-left font-sans animate-[fadeIn_0.2s_ease-out]">
                              <div className="flex justify-between items-center gap-1.5 w-full">
                                <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider rounded ${
                                  poi.category === 'civic' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                  poi.category === 'economy' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' :
                                  poi.category === 'energy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                  {poi.category === 'civic' ? '🏛️ Civic' :
                                   poi.category === 'economy' ? '💼 Economy' :
                                   poi.category === 'energy' ? '⚡ Energy' :
                                   '🌸 Culture'}
                                </span>
                                <span className="px-1.5 py-0.5 text-[7.5px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  {poi.status}
                                </span>
                              </div>
                              <h5 className="text-[11px] font-black tracking-tight leading-tight uppercase text-white font-official">
                                {poi.label}
                              </h5>
                              <p className="text-[8.5px] text-neutral-300 font-medium line-clamp-2 leading-relaxed">
                                {poi.desc}
                              </p>
                              {(poi.contact || poi.hours) && (
                                <div className="border-t border-white/10 pt-1.5 mt-0.5 flex flex-col gap-0.5 text-[8px] text-neutral-400 font-semibold font-mono">
                                  {poi.contact && <span className="truncate">📞 {poi.contact}</span>}
                                  {poi.hours && <span className="truncate flex items-center gap-1">🕒 {poi.hours}</span>}
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}

                    {/* POPUP INFO CARD FOR CLICKED PIN */}
                    {selectedPoiId && activePOI && activePOI.mapX !== undefined && activePOI.mapY !== undefined && (
                      <div
                        className="absolute pointer-events-auto transition-all duration-300 shadow-2xl animate-[fadeIn_0.25s_ease-out]"
                        style={{
                          left: `${(activePOI.mapX ?? 400) > 400 ? '4%' : '52%'}`, // Dynamic responsive side adjustment to prevent clipping
                          top: '10%',
                          zIndex: 50,
                          width: '310px'
                        }}
                      >
                        <div className="bg-white/95 backdrop-blur-md rounded-2.5xl p-5 border border-neutral-200/90 text-left flex flex-col gap-3 font-sans">
                          {/* Header */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border ${
                                activePOI.category === 'civic' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                activePOI.category === 'economy' ? 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-700' :
                                activePOI.category === 'energy' ? 'bg-cyan-50 border-cyan-150 text-cyan-800' :
                                'bg-emerald-50 border-emerald-100 text-emerald-700'
                              }`}>
                                {activePOI.category}
                              </span>
                              <h4 className="text-[13px] font-extrabold text-navy leading-tight mt-0.5">{activePOI.label}</h4>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPoiId('');
                              }}
                              className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                              title="Close pin info panel"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Description */}
                          <p className="text-[10.5px] text-neutral-500 font-semibold leading-relaxed">
                            {activePOI.desc}
                          </p>

                          {/* Details metadata stats list */}
                          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-150/50 space-y-1.5 text-[9.5px]">
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-400 font-bold uppercase text-[7.5px] tracking-wider">Operational Status</span>
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black leading-none ${activePOI.statusColor}`}>
                                {activePOI.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-neutral-400 font-bold uppercase text-[7.5px] tracking-wider shrink-0">Working Hours</span>
                              <span className="text-neutral-700 font-extrabold text-right leading-tight max-w-[160px] truncate">{activePOI.hours}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-400 font-bold uppercase text-[7.5px] tracking-wider">Contact Net</span>
                              <span className="text-neutral-700 font-mono font-black">{activePOI.contact}</span>
                            </div>
                          </div>

                          {/* Description paragraph */}
                          <SafeHtml 
                            text={activePOI.details} 
                            className="text-[10px] text-neutral-650 leading-normal border-t border-neutral-100/70 pt-2 font-medium" 
                          />

                          {/* Action Route CTA button */}
                          <div className="flex gap-2.5 mt-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRouteTo(activePOI.id);
                                setActiveTab('directions');
                              }}
                              className="flex-1 py-2.5 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-[9px] uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5"
                            >
                              <Navigation size={10} />
                              Calculate Routing Track
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                {/* Geolocation notifications layout */}
                {locStatus && (
                  <div className="absolute top-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
                    <div className="bg-navy rounded-2xl text-white text-[11px] font-black px-5 py-3 shadow-2xl flex items-center gap-2.5 border border-white/20 backdrop-blur-md animate-bounce max-w-sm text-center">
                      <MapPin size={14} className="text-cyan animate-pulse" />
                      <span>{locStatus}</span>
                    </div>
                  </div>
                )}

                {/* INTERACTIVE FLOATING DECKS */}
                
                {/* TOP LEFT: Quick Dynamic Zone Indicators */}
                <div className="absolute top-4 left-4 z-20 max-w-[200px] hidden sm:block">
                  <div className="bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-xl rounded-2xl p-4 text-left">
                    <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-neutral-100">
                      <Layers size={12} className="text-navy" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-navy">GIS Zone Legend</span>
                    </div>
                    <div className="space-y-2">
                      {zones.map((zone) => (
                        <div key={zone.id} className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${textDotMap[zone.color] || 'bg-neutral-500'}`} />
                          <span className="text-[9px] font-extrabold text-neutral-600 uppercase tracking-wider leading-none">{zone.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM LEFT: High contrast layout selector */}
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg p-1.5 rounded-2xl flex gap-1 items-center">
                    <button
                      onClick={() => setMapMode('vibrant_city')}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        mapMode === 'vibrant_city' 
                          ? 'bg-navy text-cyan shadow-sm' 
                          : 'text-neutral-500 hover:text-navy hover:bg-neutral-100'
                      }`}
                      aria-label="Toggle Custom Vibrant Map Style"
                    >
                      <Sparkles size={11} />
                      Custom Vibrant
                    </button>
                    <button
                      onClick={() => setMapMode('standard')}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        mapMode === 'standard' 
                          ? 'bg-navy text-white shadow-sm' 
                          : 'text-neutral-500 hover:text-navy hover:bg-neutral-100'
                      }`}
                      aria-label="Toggle Standard Google Map"
                    >
                      <Map size={11} />
                      Standard Map
                    </button>
                    <button
                      onClick={() => setMapMode('satellite')}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        mapMode === 'satellite' 
                          ? 'bg-navy text-white shadow-sm' 
                          : 'text-neutral-500 hover:text-navy hover:bg-neutral-100'
                      }`}
                      aria-label="Toggle Satellite theme"
                    >
                      <Layers size={11} />
                      Satellite
                    </button>
                  </div>
                </div>

                {/* BOTTOM RIGHT: Precision zoom & Geolocation touch targets */}
                <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2.5">
                  <button
                    onClick={handleLocateMe}
                    disabled={locating}
                    className="w-11 h-11 bg-white hover:bg-neutral-50 text-navy rounded-2xl shadow-xl flex items-center justify-center border border-neutral-200 transition-all hover:scale-105 active:scale-95 disabled:disabled:opacity-50 pointer-events-auto"
                    title="Center on your live spot"
                  >
                    {locating ? (
                      <Loader2 size={16} className="animate-spin text-cyan" />
                    ) : (
                      <Compass size={18} className="text-navy hover:text-cyan transition-colors" />
                    )}
                  </button>

                  <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 flex flex-col overflow-hidden pointer-events-auto">
                    <button
                      onClick={handleZoomIn}
                      className="w-11 h-11 hover:bg-neutral-50 text-navy border-b border-neutral-100 flex items-center justify-center transition-colors hover:text-cyan"
                      title="Zoom in map viewport"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="w-11 h-11 hover:bg-neutral-50 text-navy flex items-center justify-center transition-colors hover:text-cyan"
                      title="Zoom out map viewport"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Real-time coordinates and metadata status bar */}
              <div className="bg-neutral-900 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white border-t border-neutral-800">
                <div className="flex items-center gap-2.5 text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">
                  <MapPin size={12} className="text-cyan animate-pulse shrink-0" />
                  <span>GIS Center Locked: {center.lat.toFixed(5)}° N, {center.lng.toFixed(5)}° E</span>
                </div>
                <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-cyan uppercase">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping" />
                    Optima Resolution: {zoom}x
                  </div>
                  <div className="text-neutral-400">
                    Authority: Oromia Spatial Council
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Real-time Overlay Toggles Selector bar */}
            <div className="bg-white border border-neutral-200 p-5 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-1">
                <Eye size={14} className="text-cyan" />
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Interactive Overlay Network Layers</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'none', label: 'Default Vector Base', color: 'border-neutral-200 text-neutral-700 hover:bg-neutral-50', icon: <Map size={12} /> },
                  { id: 'traffic', label: 'Traffic Load Simulator', color: 'border-green-200 bg-green-50/10 text-green-700 hover:bg-green-50/40', icon: <Activity size={12} /> },
                  { id: 'wind', label: 'Meteorological Gales', color: 'border-cyan/20 bg-cyan/5 text-cyan hover:bg-cyan/10', icon: <Wind size={12} /> },
                  { id: 'infrastructure', label: 'Power & Cargo Grid', color: 'border-indigo-200 bg-indigo-50/10 text-indigo-700 hover:bg-indigo-50/40', icon: <Layers size={12} /> },
                  { id: 'districts', label: 'Sub-City Borders', color: 'border-fuchsia-200 bg-fuchsia-50/10 text-fuchsia-700 hover:bg-fuchsia-50/40', icon: <Compass size={12} /> },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveOverlay(item.id as any);
                      if (item.id === 'wind') {
                        setActiveTab('climate');
                      }
                    }}
                    className={`p-3 border rounded-xl text-[9px] font-extrabold text-center uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      activeOverlay === item.id 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-md font-black hover:bg-neutral-800' 
                        : item.color
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Container (2 cols): Advanced control widgets deck with Tabs switcher */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="bg-white border border-neutral-200 p-6 md:p-8 rounded-3xl shadow-lg flex-1">
              
              {/* Workspace Navigation tab deck */}
              <div className="flex border-b border-neutral-100 pb-3.5 mb-6 gap-4">
                <button
                  onClick={() => setActiveTab('landmarks')}
                  className={`pb-2 text-[10px] font-extrabold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'landmarks' 
                      ? 'border-navy text-navy font-black' 
                      : 'border-transparent text-neutral-400 hover:text-navy'
                  }`}
                >
                  <MapPin size={13} /> Grid Points
                </button>
                <button
                  onClick={() => setActiveTab('directions')}
                  className={`pb-2 text-[10px] font-extrabold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'directions' 
                      ? 'border-navy text-navy font-black' 
                      : 'border-transparent text-neutral-400 hover:text-navy'
                  }`}
                >
                  <Route size={13} /> Smart Router
                </button>
                <button
                  onClick={() => setActiveTab('climate')}
                  className={`pb-2 text-[10px] font-extrabold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'climate' 
                      ? 'border-navy text-navy font-black' 
                      : 'border-transparent text-neutral-400 hover:text-navy'
                  }`}
                >
                  <Wind size={13} /> Renewable Energy
                </button>
              </div>

              {/* Render dynamic Tab content panels */}
              <AnimatePresence mode="wait">
                
                {/* 1. Landmarks Search Directory Panel */}
                {activeTab === 'landmarks' && (
                  <motion.div
                    key="landmarks-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Compact Search Deck */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={13} />
                      <input
                        type="text"
                        placeholder="Search landmark coordinates, offices..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 pl-9 pr-3 py-3 rounded-xl text-[11px] outline-none focus:ring-1 focus:ring-navy transition-all font-medium"
                      />
                    </div>

                    {/* Taxonomy Category Tag Deck */}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth p-0.5 select-none text-[8.5px] font-bold uppercase tracking-wider">
                      {[
                        { id: 'all', label: 'All Locations' },
                        { id: 'civic', label: '🏛️ Civic & Health' },
                        { id: 'economy', label: '💼 Logistics' },
                        { id: 'energy', label: '⚡ Energy' },
                        { id: 'culture', label: '🌸 Culture' },
                      ].map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => setPoiCategoryFilter(tag.id as any)}
                          className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                            poiCategoryFilter === tag.id 
                              ? 'bg-navy border-navy text-white font-black' 
                              : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>

                    {/* Scrollable POIs list */}
                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 select-none custom-scrollbar pb-2">
                      {filteredPOIs.length > 0 ? (
                        filteredPOIs.map(poi => {
                          const isSelected = poi.id === activePOI.id;
                          return (
                            <button
                              key={poi.id}
                              onClick={() => selectPOI(poi)}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all relative flex flex-col gap-1.5 ${
                                isSelected 
                                  ? 'bg-white border-navy ring-1 ring-navy shadow-md translate-x-1' 
                                  : 'bg-neutral-50/50 border-neutral-200 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2.5 w-full">
                                <h4 className="text-[11px] font-extrabold text-navy leading-tight">{poi.label}</h4>
                                <span className={`px-1.5 py-0.5 text-[7px] uppercase font-black tracking-widest border rounded shrink-0 ${poi.statusColor}`}>
                                  {poi.status}
                                </span>
                              </div>
                              <p className="text-[9.5px] text-neutral-400 leading-normal font-medium truncate w-64">{poi.desc}</p>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-10 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/30">
                          <Info className="mx-auto text-neutral-400 mb-2" size={24} />
                          <h5 className="text-[11px] font-bold text-navy">No landmarks found</h5>
                          <span className="text-[9px] text-neutral-400 font-medium">Verify keywords or adjust active tags.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. Path Transit Route Calculator Panel */}
                {activeTab === 'directions' && (
                  <motion.div
                    key="directions-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="space-y-3">
                      
                      {/* From Coordinates select */}
                      <div className="relative">
                        <label className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                          Source Anchor Vector
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsFromOpen(!isFromOpen);
                            setIsToOpen(false);
                          }}
                          className="w-full bg-neutral-50 border border-neutral-250 p-3.5 rounded-xl text-[10.5px] font-bold text-navy text-left flex items-center justify-between cursor-pointer focus:ring-1 focus:ring-cyan outline-none select-none"
                        >
                          <span className="truncate">
                            {datasetPOIs.find(p => p.id === routeFrom)?.label || 'Select Source'}
                          </span>
                          <span className="text-neutral-400 shrink-0 ml-1 text-[8px]">▼</span>
                        </button>
                        
                        {isFromOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsFromOpen(false)} />
                            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto custom-scrollbar bg-white border border-neutral-200 shadow-xl rounded-xl z-20 py-1">
                              {datasetPOIs.map(poi => (
                                <button
                                  key={poi.id}
                                  type="button"
                                  onClick={() => {
                                    setRouteFrom(poi.id);
                                    setHasRouteResult(false);
                                    setIsFromOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 hover:bg-neutral-50 flex flex-col transition-colors cursor-pointer ${
                                    routeFrom === poi.id ? 'bg-cyan/10' : ''
                                  }`}
                                >
                                  <span className={`text-[10.5px] font-bold ${routeFrom === poi.id ? 'text-cyan' : 'text-navy'}`}>{poi.label}</span>
                                  <span className="text-[9px] text-neutral-400 font-mono">
                                    ({poi.coords.lat.toFixed(3)}, {poi.coords.lng.toFixed(3)})
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* To Coordinates select */}
                      <div className="relative">
                        <label className="block text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                          Arrival Coordinates Target
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsToOpen(!isToOpen);
                            setIsFromOpen(false);
                          }}
                          className="w-full bg-neutral-50 border border-neutral-250 p-3.5 rounded-xl text-[10.5px] font-bold text-navy text-left flex items-center justify-between cursor-pointer focus:ring-1 focus:ring-cyan outline-none select-none"
                        >
                          <span className="truncate">
                            {datasetPOIs.find(p => p.id === routeTo)?.label || 'Select Target'}
                          </span>
                          <span className="text-neutral-400 shrink-0 ml-1 text-[8px]">▼</span>
                        </button>
                        
                        {isToOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsToOpen(false)} />
                            <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto custom-scrollbar bg-white border border-neutral-200 shadow-xl rounded-xl z-20 py-1">
                              {datasetPOIs.map(poi => (
                                <button
                                  key={poi.id}
                                  type="button"
                                  onClick={() => {
                                    setRouteTo(poi.id);
                                    setHasRouteResult(false);
                                    setIsToOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-2 hover:bg-neutral-50 flex flex-col transition-colors cursor-pointer ${
                                    routeTo === poi.id ? 'bg-cyan/10' : ''
                                  }`}
                                >
                                  <span className={`text-[10.5px] font-bold ${routeTo === poi.id ? 'text-cyan' : 'text-navy'}`}>{poi.label}</span>
                                  <span className="text-[9px] text-neutral-400 font-mono">
                                    ({poi.coords.lat.toFixed(3)}, {poi.coords.lng.toFixed(3)})
                                  </span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <AnimatePresence>
                        {routeWarning && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-bold leading-relaxed flex items-center gap-2"
                          >
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{routeWarning}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={calculateSimulatedRoute}
                        disabled={calculatingRoute}
                        className="w-full btn-primary text-[9.5px] py-3.5 tracking-widest flex items-center justify-center gap-2 font-black uppercase"
                      >
                        {calculatingRoute ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-white" />
                            Calculating Grid Mesh...
                          </>
                        ) : (
                          <>
                            <Navigation size={13} />
                            Generate Intelligent Route
                          </>
                        )}
                      </button>
                    </div>

                    {/* Calculated Router Results */}
                    {hasRouteResult && (
                      <div className="bg-neutral-50 border border-neutral-200 p-4.5 rounded-2xl space-y-4">
                        <div className="grid grid-cols-2 gap-2 border-b border-neutral-200/50 pb-3 text-center">
                          <div>
                            <span className="block text-[7.5px] font-black text-neutral-400 uppercase tracking-widest">Est. Travel Distance</span>
                            <span className="text-sm font-black text-navy">{routeDistance}</span>
                          </div>
                          <div className="border-l border-neutral-200/60">
                            <span className="block text-[7.5px] font-black text-neutral-400 uppercase tracking-widest">Calculated Drive Time</span>
                            <span className="text-sm font-black text-cyan">{routeTime}</span>
                          </div>
                        </div>

                        {/* Turn-by-Turn directions steps timeline */}
                        <div className="space-y-3">
                          <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest block">
                            Integrated Turn-by-Turn Nav logs
                          </span>
                          <div className="space-y-2.5 pl-3 border-l border-neutral-200">
                            {directionsSteps.map((step, idx) => (
                              <div key={idx} className="text-[9.5px] font-semibold text-neutral-600 leading-normal flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0 mt-1.5" />
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>

                          <div className="bg-cyan/5 border border-cyan/10 p-3 rounded-xl flex items-center gap-2 mt-2">
                            <Zap size={13} className="text-cyan animate-pulse shrink-0" />
                            <span className="text-[8.5px] text-neutral-600 font-extrabold uppercase tracking-wide">
                              Eco-Alternative: Oromia e-Bus services active along this track.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. Climate wind speeds & turbines energy generator simulation tab */}
                {activeTab === 'climate' && (
                  <motion.div
                    key="climate-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-navy uppercase tracking-widest">
                          Rift Valley Gale Velocity
                        </span>
                        <span className="font-mono text-xs font-black text-cyan">
                          {windSpeedVal} km/h
                        </span>
                      </div>

                      {/* Interactive range slider to simulate wind conditions */}
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={windSpeedVal}
                        onChange={e => {
                          setWindSpeedVal(parseInt(e.target.value));
                          setActiveOverlay('wind'); // Auto highlight overlays
                        }}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-cyan"
                      />

                      <div className="flex justify-between text-[7px] text-neutral-400 font-black uppercase tracking-widest px-0.5">
                        <span>Light Breeze (5km)</span>
                        <span>Moderate Rift (50km)</span>
                        <span>Gale Force (100km)</span>
                      </div>
                    </div>

                    {/* Turbines Animated graphics panel */}
                    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl text-white flex items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan">
                          Live Grid Telemetry
                        </span>
                        <h4 className="text-xl font-mono font-black text-white leading-none">
                          {(windSpeedVal * 1.02).toFixed(1)} MW
                        </h4>
                        <span className="text-[8.5px] font-semibold text-neutral-500 block leading-tight">
                          Estimated feed output from Adama wind hills I & II directly to industrial bus nodes.
                        </span>
                      </div>

                      {/* Interactive CSS rotating Turbine SVG */}
                      <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                        {/* Turbine Hub pole */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-10 bg-neutral-700 rounded-t-sm" />
                        
                        {/* Rotating SVG Blades */}
                        <svg 
                          id="turbine-blades" 
                          className="w-14 h-14 relative z-10" 
                          viewBox="0 0 100 100"
                          style={{
                            transformOrigin: '50% 50%',
                            animation: `spin ${30 / Math.max(windSpeedVal, 1)}s linear infinite`
                          }}
                        >
                          <circle cx="50" cy="50" r="5" fill="#f8fafc" />
                          <path d="M 50 50 Q 40 10, 50 0 Q 60 10, 50 50" fill="#f8fafc" />
                          <path d="M 50 50 Q 85 70, 93.3 50 Q 85 30, 50 50" fill="#cbd5e1" />
                          <path d="M 50 50 Q 15 70, 6.7 50 Q 15 30, 50 50" fill="#e2e8f0" />
                        </svg>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl text-[9px] text-neutral-500 leading-normal font-semibold flex items-start gap-2.5">
                      <Sun size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        Simulate stronger Rift winds to visualize how dynamic gales increase generated megawatts output automatically.
                      </span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom active POI detailed stats descriptor card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePOI.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-neutral-50 border border-neutral-200 p-6 md:p-8 rounded-3xl space-y-5"
              >
                <div>
                  <span className="text-[8px] font-black text-cyan uppercase tracking-widest bg-cyan/10 px-2 py-0.5 rounded-md border border-cyan/10">
                    Selected Anchor Profile
                  </span>
                  <h4 className="text-lg font-extrabold text-navy mt-2 leading-tight font-official">{activePOI.label}</h4>
                  <p className="text-[10.5px] text-neutral-500 font-semibold leading-relaxed mt-1">{stripHtml(activePOI.desc, 120)}</p>
                </div>

                <SafeHtml 
                  text={activePOI.details}
                  className="text-[11px] text-neutral-600 leading-relaxed font-semibold"
                />

                {/* Logistics attributes coordinates */}
                <div className="grid grid-cols-2 gap-4 border-y border-neutral-200/60 py-3.5 text-[9.5px] uppercase font-black text-navy tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-cyan shrink-0" />
                    <div>
                      <span className="block text-[7.5px] text-neutral-400 font-black">ACTIVE SCHEDULE</span>
                      <span className="font-semibold text-neutral-600 block lowercase truncate first-letter:uppercase">{activePOI.hours}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-cyan shrink-0 animate-[bounce_3s_infinite]" />
                    <div>
                      <span className="block text-[7.5px] text-neutral-400 font-black">TELEPHONE FEED</span>
                      <span className="font-semibold text-neutral-600 block truncate">{activePOI.contact}</span>
                    </div>
                  </div>
                </div>

                {/* Custom Citizen Liaison Form */}
                <form onSubmit={handleLiaisonSubmit} className="space-y-2 text-left pt-1">
                  <label htmlFor="liaison-input" className="block text-[8px] font-black uppercase text-neutral-400 tracking-widest">
                    Quick Citizen Inquiry Box
                  </label>
                  <div className="relative">
                    <input
                      id="liaison-input"
                      type="text"
                      placeholder={`Send comment directly to ${activePOI.label} desk...`}
                      value={liaisonText}
                      onChange={e => setLiaisonText(e.target.value)}
                      className="w-full bg-white border border-neutral-200 pl-4 pr-12 py-3 rounded-xl text-[10.5px] outline-none font-medium text-navy"
                    />
                    <button
                      type="submit"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan hover:text-navy transition-colors font-extrabold text-[10px] uppercase p-1"
                      aria-label="Send Inquiry"
                    >
                      SEND
                    </button>
                  </div>

                  <AnimatePresence>
                    {showLiaisonSuccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[9.5px] text-emerald-700 font-bold flex items-center gap-2"
                      >
                        <ShieldCheck size={14} className="shrink-0" />
                        <span>Transmission Secured! Message routed to municipal server queue.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};
