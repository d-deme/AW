import { dynamicSchemasService } from '../services/api';
import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Code, 
  Copy, 
  Check, 
  BookOpen, 
  ShieldAlert, 
  Play, 
  Server, 
  Sliders, 
  Database, 
  Lock, 
  Key, 
  ChevronRight, 
  Globe, 
  CheckCircle,
  HelpCircle,
  Cpu,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicSchema } from './DynamicContentModeler';

interface APIEndpoint {
  category: 'Administration' | 'Core Portal' | 'Governance' | 'Dynamic Schema Engine' | 'Edge CDN';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  route: string;
  description: string;
  authRequired: boolean;
  requiredRole?: string[];
  parameters?: { name: string; position: 'path' | 'query' | 'body'; type: string; required: boolean; desc: string }[];
  sampleResponse: Record<string, any> | string;
}

export const APIDocumentationPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'auth' | 'dynamic' | 'playground'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [dynamicSchemas, setDynamicSchemas] = useState<DynamicSchema[]>([]);
  const [isLoadingSchemas, setIsLoadingSchemas] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Playground state
  const [playgroundRoute, setPlaygroundRoute] = useState('/api/cdn-config');
  const [playgroundMethod, setPlaygroundMethod] = useState<'GET' | 'POST'>('GET');
  const [playgroundHeaders, setPlaygroundHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [playgroundBody, setPlaygroundBody] = useState('{\n  "decoupledMode": true\n}');
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  
const fetchDynamicSchemas = async () => {
  setIsLoadingSchemas(true);
  try {
    const data = await dynamicSchemasService.getAll();
    setDynamicSchemas(data);
  } catch (err) {
    console.error('Failed to fetch dynamic schemas for API portal:', err);
  } finally {
    setIsLoadingSchemas(false);
  }
};

  useEffect(() => {
    fetchDynamicSchemas();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setToastMessage(`Copied: ${label}`);
    setTimeout(() => {
      setCopiedText(null);
      setToastMessage(null);
    }, 2000);
  };

  // Pre-compiled static endpoints based strictly on server capabilities
  const primaryEndpoints: APIEndpoint[] = [
    {
      category: 'Administration',
      method: 'POST',
      route: '/api/auth/login',
      description: 'Authenticate administrative and editor accounts. Returns JSON Web Token (JWT) on validation.',
      authRequired: false,
      parameters: [
        { name: 'email', position: 'body', type: 'string', required: true, desc: 'Registered user login email' },
        { name: 'password', position: 'body', type: 'string', required: true, desc: 'Login credential password' }
      ],
      sampleResponse: {
        success: true,
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: { id: 1, email: "admin@adama.gov.et", nickname: "Adama Supervisor", role: "admin" }
      }
    },
    {
      category: 'Core Portal',
      method: 'GET',
      route: '/api/news',
      description: 'Retrieve catalog of news articles, announcements, and editorial entries published on Adama City Portal.',
      authRequired: false,
      sampleResponse: [
        {
          id: 1,
          title: "Adama Smart-City Water Grid Expansion Initiated",
          content: "Water infrastructural development started across East-Woreda regions...",
          category: "Infrastructure",
          date: "2026-06-01",
          author: "City Council Directorate"
        }
      ]
    },
    {
      category: 'Governance',
      method: 'GET',
      route: '/api/permits',
      description: 'Fetch real-time building, architectural, and land development licensing items registered inside the city ledger.',
      authRequired: false,
      sampleResponse: [
        {
          id: "PERMIT-2026-940B",
          applicantName: "Gada Real Estate Group",
          licenseType: "Commercial Construction Permit",
          submissionDate: "2026-05-14",
          statusGate: "In Review",
          completionPercentage: 65,
          assignedDesk: "Structural Integrity Bureau"
        }
      ]
    },
    {
      category: 'Governance',
      method: 'POST',
      route: '/api/tickets',
      description: 'Submit an interactive resident support / civic ticket feedback card to the Adama municipal queue.',
      authRequired: true,
      parameters: [
        { name: 'category', position: 'body', type: 'string', required: true, desc: 'Ticket classification (e.g., Road repair, Water, Waste)' },
        { name: 'summary', position: 'body', type: 'string', required: true, desc: 'Short title summary of civic incident' },
        { name: 'locationWoreda', position: 'body', type: 'string', required: true, desc: 'Target Woreda sector number' },
        { name: 'detailedBody', position: 'body', type: 'string', required: false, desc: 'Description of municipal report' }
      ],
      sampleResponse: {
        success: true,
        message: "Civic ticket initialized.",
        id: 42,
        ticket: { id: 42, category: "Sanitation", summary: "Streetlight outage", status: "Open" }
      }
    },
    {
      category: 'Edge CDN',
      method: 'GET',
      route: '/api/cdn-config',
      description: 'Get current Production CDN Edge routing configuration settings, caching hit ratios, and domain resolution status.',
      authRequired: false,
      sampleResponse: {
        decoupledMode: true,
        cdnBaseUrl: "https://cdn.adama.gov.et",
        purpleEdgeServer: "akamai-node-eth-04.net",
        regions: [
          { name: "Adama Core Node", status: "ACTIVE", latency: "4ms", cacheHitRatio: "98.1%" }
        ],
        cachePurgedAt: "2026-06-05T09:12:00Z"
      }
    },
    {
      category: 'Edge CDN',
      method: 'POST',
      route: '/api/cdn-config/purge',
      description: 'Trigger an administrative full multi-region cache invalidation cycle to resolve immediate static changes.',
      authRequired: true,
      requiredRole: ['admin'],
      sampleResponse: {
        success: true,
        invalidatedRegionsCount: 4,
        timestamp: "2026-06-05T12:11:00Z"
      }
    }
  ];

  // Set default endpoint on load
  useEffect(() => {
    if (!selectedEndpoint) {
      setSelectedEndpoint(primaryEndpoints[0]);
    }
  }, []);

  const handleTestAPIPlayground = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    
    try {
      const headersObject = JSON.parse(playgroundHeaders);
      
      // Attempt token lookup
      const token = localStorage.getItem('cms_token');
      if (token) {
        headersObject['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method: playgroundMethod,
        headers: headersObject,
      };

      if (playgroundMethod === 'POST') {
        options.body = playgroundBody;
      }

      const res = await fetch(playgroundRoute, options);
      setPlaygroundStatus(res.status);
      
      const payloadText = await res.text();
      try {
        const json = JSON.parse(payloadText);
        setPlaygroundResponse(json);
      } catch {
        setPlaygroundResponse({ text: payloadText });
      }
    } catch (err: any) {
      setPlaygroundResponse({ error: err.message || 'Error executing request' });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 p-2 text-left select-none relative" id="api-docs-portal">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed top-20 right-8 z-[130] bg-[#0c1d3a] border border-brand-cyan/40 shadow-2xl p-4 rounded-2xl flex items-center space-x-3 text-xs text-white">
            <CheckCircle size={16} className="text-brand-cyan animate-pulse" />
            <span className="font-extrabold font-mono">{toastMessage}</span>
          </div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-brand-cyan/10 rounded-2xl text-brand-cyan inline-block">
              <Terminal size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Adama City Developer API Gateway</span>
                <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  v2.0 RESTful
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Connect external systems directly to the Adama City administration ledger, access published content catalogs, and integrate with municipal dynamic schemas dynamically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 dark:bg-[#071329] p-1.5 rounded-2xl max-w-xl">
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`flex-1 py-2 rounded-xl text-center text-xs font-black transition ${
            activeTab === 'endpoints' 
              ? 'bg-white dark:bg-[#0d1f3d] text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Endpoints Reference
        </button>
        <button
          onClick={() => setActiveTab('dynamic')}
          className={`flex-1 py-2 rounded-xl text-center text-xs font-black transition relative ${
            activeTab === 'dynamic' 
              ? 'bg-white dark:bg-[#0d1f3d] text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span>Dynamic Schemas</span>
          {dynamicSchemas.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('auth')}
          className={`flex-1 py-2 rounded-xl text-center text-xs font-black transition ${
            activeTab === 'auth' 
              ? 'bg-white dark:bg-[#0d1f3d] text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Auth &amp; Integrity
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`flex-1 py-2 rounded-xl text-center text-xs font-black transition ${
            activeTab === 'playground' 
              ? 'bg-white dark:bg-[#0d1f3d] text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-800' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          API Console
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: ENDPOINTS REFERENCE */}
            {activeTab === 'endpoints' && (
              <motion.div
                key="endpoints-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Side: Endpoints Index list */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                      <span>Gateway Routes List</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-mono font-bold text-slate-450">
                        {primaryEndpoints.length} total
                      </span>
                    </h3>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {primaryEndpoints.map((ep, idx) => {
                        const isSelected = selectedEndpoint?.route === ep.route && selectedEndpoint?.method === ep.method;
                        const methodColors = {
                          GET: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400',
                          POST: 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20',
                          PUT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                          DELETE: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        };

                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedEndpoint(ep)}
                            className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between ${
                              isSelected 
                                ? 'bg-slate-50 dark:bg-slate-950/60 border-brand-cyan shadow-sm' 
                                : 'bg-transparent border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-905/40'
                            }`}
                          >
                            <div className="space-y-1.5 min-w-0 pr-2">
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-black border uppercase ${methodColors[ep.method]}`}>
                                  {ep.method}
                                </span>
                                <span className="font-mono text-xs font-bold truncate text-slate-900 dark:text-white">
                                  {ep.route}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 line-clamp-1 font-medium">{ep.description}</span>
                            </div>
                            <ChevronRight size={14} className={`shrink-0 ${isSelected ? 'text-brand-cyan' : 'text-slate-450'}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Selected Endpoint Details specifications */}
                {selectedEndpoint && (
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                      {/* Title Segment */}
                      <div className="border-b border-slate-100 dark:border-slate-850 pb-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan block">
                            {selectedEndpoint.category} GATEWAY MODULE
                          </span>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-0.5 rounded-lg border font-mono uppercase ${
                              selectedEndpoint.method === 'GET' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              selectedEndpoint.method === 'POST' ? 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20' :
                              selectedEndpoint.method === 'PUT' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                              {selectedEndpoint.method}
                            </span>
                            <span className="font-mono text-lg">{selectedEndpoint.route}</span>
                          </h2>
                        </div>

                        {/* Badges / Security guidelines status */}
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex items-center space-x-1 border ${
                            selectedEndpoint.authRequired 
                              ? 'bg-rose-600/10 text-rose-500 dark:text-rose-450 border-rose-500/20' 
                              : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20'
                          }`}>
                            <Lock size={10} />
                            <span>{selectedEndpoint.authRequired ? 'Bearer Token Required' : 'Public Access'}</span>
                          </span>

                          {selectedEndpoint.requiredRole && (
                            <span className="text-[10px] font-black bg-blue-500/15 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full uppercase">
                              Role: {selectedEndpoint.requiredRole.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Route Objectives</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal font-semibold select-text">
                          {selectedEndpoint.description}
                        </p>
                      </div>

                      {/* Parameters definition */}
                      {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                        <div className="mb-6 space-y-2 text-left">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Parameters Schema Spec</span>
                          <div className="overflow-hidden border border-slate-100 dark:border-slate-850 rounded-2xl">
                            <table className="w-full text-xs text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 text-slate-450 uppercase text-[9px] font-black tracking-widest">
                                  <th className="px-4 py-2.5">Field</th>
                                  <th className="px-4 py-2.5">Position</th>
                                  <th className="px-4 py-2.5">Type</th>
                                  <th className="px-4 py-2.5">Requirement</th>
                                  <th className="px-4 py-2.5">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-[11px] font-mono select-text font-bold text-slate-650 dark:text-slate-300">
                                {selectedEndpoint.parameters.map((param, index) => (
                                  <tr key={index} className="hover:bg-slate-500/5">
                                    <td className="px-4 py-3 font-black text-slate-800 dark:text-white">{param.name}</td>
                                    <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">{param.position}</span></td>
                                    <td className="px-4 py-3 text-brand-cyan">{param.type}</td>
                                    <td className="px-4 py-3">
                                      {param.required ? (
                                        <span className="text-amber-500 tracking-wider">REQUIRED</span>
                                      ) : (
                                        <span className="text-slate-400">Optional</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 font-sans leading-normal">{param.desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Sandbox Snippets */}
                      <div className="mb-6 space-y-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HTTP Curl Instruction</span>
                          <button
                            onClick={() => handleCopy(`curl -X ${selectedEndpoint.method} "https://ais-dev-gmfwpoz4wohm3zujho2gct-754916342755.europe-west2.run.app${selectedEndpoint.route}"${selectedEndpoint.authRequired ? ' -H "Authorization: Bearer <JWT_TOKEN>"' : ''}`, 'cURL Command')}
                            className="text-[10px] font-black text-brand-cyan flex items-center space-x-1 hover:underline"
                          >
                            <Copy size={10} />
                            <span>Copy Command</span>
                          </button>
                        </div>
                        <div className="bg-[#030915] border border-slate-900 rounded-2xl p-4 font-mono text-[11px] text-slate-300 select-text overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                          <span className="text-brand-cyan select-none">$ </span>
                          curl -X {selectedEndpoint.method} "https://ais-dev.run.app{selectedEndpoint.route}"<br />
                          {selectedEndpoint.authRequired && (
                            <>
                              <span className="text-slate-550 select-none">  -H </span>
                              <span className="text-emerald-400">"Authorization: Bearer &lt;YOUR_API_TOKEN&gt;"</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Sample JSON response */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mock Response payload</span>
                          <button
                            onClick={() => handleCopy(JSON.stringify(selectedEndpoint.sampleResponse, null, 2), 'Sample Payload')}
                            className="text-[10px] font-black text-brand-cyan flex items-center space-x-1 hover:underline"
                          >
                            <Copy size={10} />
                            <span>Copy Payload</span>
                          </button>
                        </div>
                        <div className="bg-[#030915] border border-slate-900 rounded-2xl p-4 font-mono text-[11px] text-slate-300 max-h-[220px] overflow-y-auto select-text leading-relaxed shadow-inner scrollbar-thin">
                          <pre>{JSON.stringify(selectedEndpoint.sampleResponse, null, 2)}</pre>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: DYNAMIC CUSTOM SCHEMAS */}
            {activeTab === 'dynamic' && (
              <motion.div
                key="dynamic-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">
                    <span className="p-2 bg-brand-cyan/10 text-brand-cyan rounded-lg">
                      <Database size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Reconciled Dynamic Schemas Endpoints</h3>
                      <p className="text-[11px] text-slate-450 mt-0.5 font-medium leading-normal">
                        Every dynamic schema created in the Admin Panel is immediately bound to standalone SQL engines and serves dedicated REST operations.
                      </p>
                    </div>
                  </div>

                  {isLoadingSchemas ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-bold font-mono">
                      Querying live relational schema catalog...
                    </div>
                  ) : dynamicSchemas.length === 0 ? (
                    <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                      <Zap size={24} className="text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 font-bold">No dynamic schemas registered yet.</p>
                      <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Create custom schemas in the "Content Schemas" tab to see dynamic endpoints compiled on-the-fly.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-text">
                      {dynamicSchemas.map((schema) => (
                        <div 
                          key={schema.name}
                          className="bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl space-y-4"
                        >
                          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                              <span className="text-[10px] font-black uppercase text-brand-cyan font-mono tracking-wider">Dynamic Object Endpoint</span>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{schema.title}</h4>
                              <p className="text-[10px] text-slate-400 italic font-medium mt-0.5">{schema.description}</p>
                            </div>
                            <span className="px-2 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-mono text-[9px] rounded-full uppercase font-black">
                              ID: {schema.name}
                            </span>
                          </div>

                          {/* Endpoint definitions URL mock */}
                          <div className="space-y-2 text-xs font-mono">
                            <div className="flex items-center space-x-1.5">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-black text-[9px]">GET</span>
                              <span className="text-[11px] text-slate-700 dark:text-slate-350 tracking-tight">/api/dynamic-content/{schema.name}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 px-1.5 py-0.2 rounded font-black text-[9px]">POST</span>
                              <span className="text-[11px] text-slate-700 dark:text-slate-350 tracking-tight">/api/dynamic-content/{schema.name}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded font-black text-[9px]">PUT</span>
                              <span className="text-[11px] text-slate-700 dark:text-slate-350 tracking-tight">/api/dynamic-content/{schema.name}/:id</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.2 rounded font-black text-[9px]">DELETE</span>
                              <span className="text-[11px] text-slate-700 dark:text-slate-350 tracking-tight">/api/dynamic-content/{schema.name}/:id</span>
                            </div>
                          </div>

                          {/* Object Schema Field breakdown */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Compiled JSON Fields</span>
                            <div className="grid grid-cols-2 gap-2 bg-[#020712] border border-slate-900 rounded-2xl p-3 max-h-[140px] overflow-y-auto scrollbar-thin">
                              {Object.entries(schema.schema_definition.properties || {}).map(([key, prop]: [string, any]) => (
                                <div key={key} className="text-[10px] font-mono leading-relaxed p-1.5 bg-slate-900/40 rounded-lg border border-slate-850 flex flex-col">
                                  <span className="font-extrabold text-slate-200">{key}</span>
                                  <span className="text-[8px] text-brand-cyan font-bold uppercase mt-0.5">Type: {prop.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* TAB 3: AUTHENTICATION AND INTEGRITY */}
            {activeTab === 'auth' && (
              <motion.div
                key="auth-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6 select-text"
              >
                <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-850 pb-4 mb-5">
                    <span className="p-2 bg-brand-cyan/10 text-brand-cyan rounded-lg">
                      <Key size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Administrative Authentication (JWT Handshake)</h3>
                      <p className="text-[11px] text-slate-450 mt-0.5 font-medium leading-normal">
                        Admin write/modify endpoints require JSON Web Tokens generated dynamically on credential verification.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Instructions column */}
                    <div className="lg:col-span-5 space-y-4 font-semibold text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                      <div className="space-y-1.5">
                        <span className="font-black text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-wider block">1. Negotiate token</span>
                        <p className="pl-3 border-l border-brand-cyan/30 text-[11px]">
                          Submit a `POST /api/auth/login` request comprising administrative credentials. Upon verification, the portal issues a high-entropy JSON Web Token.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-black text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-wider block">2. Construct headers</span>
                        <p className="pl-3 border-l border-brand-cyan/30 text-[11px]">
                          Insert the generated token value formatted as `Bearer &lt;TOKEN&gt;` into the `Authorization` header of all administrative actions.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-black text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-wider block">3. Rate Limit Pools</span>
                        <p className="pl-3 border-l border-brand-cyan/30 text-[11px]">
                          The API pool utilizes rate limit monitors restricting public request metrics to 60 transactions per/minute to ensure core database stability.
                        </p>
                      </div>
                    </div>

                    {/* Code Snippet Column */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Example Node.js Client Connection</span>
                          <button
                            onClick={() => handleCopy(`const fetch = require('node-fetch');\n\nasync function triggerAdministrativeSync(token) {\n  const response = await fetch('https://ais-dev-gmfwpoz4wohm3zujho2gct-754916342755.europe-west2.run.app/api/cdn-config/purge', {\n    method: 'POST',\n    headers: {\n      'Authorization': \`Bearer \${token}\`,\n      'Content-Type': 'application/json'\n    }\n  });\n  return await response.json();\n}`, 'NodeJS Snippet')}
                            className="text-[10px] text-brand-cyan font-black flex items-center space-x-1"
                          >
                            <Copy size={11} />
                            <span>Copy JS snippet</span>
                          </button>
                        </div>
                        <div className="bg-[#030915] border border-slate-900 rounded-3xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                          <span className="text-purple-400">const</span> fetch = <span className="text-yellow-400">require</span>(<span className="text-emerald-400">'node-fetch'</span>);<br /><br />
                          <span className="text-purple-400">async function</span> <span className="text-blue-400">triggerAdministrativeSync</span>(token) &#123;<br />
                          &nbsp;&nbsp;<span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-emerald-400">'/api/cdn-config/purge'</span>, &#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;method: <span className="text-emerald-400">'POST'</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;headers: &#123;<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'Authorization'</span>: <span className="text-emerald-400">`Bearer $&#123;token&#125;`</span>,<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">'Content-Type'</span>: <span className="text-emerald-400">'application/json'</span><br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br />
                          &nbsp;&nbsp;&#125;);<br />
                          &nbsp;&nbsp;<span className="text-purple-400">return await</span> response.<span className="text-blue-400">json</span>();<br />
                          &#125;
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 4: API PLAYGROUND CONSOLE */}
            {activeTab === 'playground' && (
              <motion.div
                key="playground-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-text">
                  
                  {/* Left Side: Playground controls */}
                  <div className="lg:col-span-5 bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm space-y-4 text-left">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-3 mb-2 flex items-center space-x-1.5">
                      <Cpu size={14} className="text-brand-cyan" />
                      <span>Console Controls</span>
                    </h3>

                    {/* Method and Route selection */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Route selection</label>
                        <select 
                          value={playgroundRoute}
                          onChange={(e) => {
                            setPlaygroundRoute(e.target.value);
                            const found = primaryEndpoints.find(pe => pe.route === e.target.value);
                            if (found) {
                              setPlaygroundMethod(found.method === 'GET' ? 'GET' : 'POST');
                            }
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none focus:border-brand-cyan font-mono"
                        >
                          <option value="/api/cdn-config">GET /api/cdn-config</option>
                          <option value="/api/news">GET /api/news</option>
                          <option value="/api/permits">GET /api/permits</option>
                          <option value="/api/dynamic-schemas">GET /api/dynamic-schemas</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Method</label>
                        <select 
                          value={playgroundMethod}
                          onChange={(e) => setPlaygroundMethod(e.target.value as 'GET' | 'POST')}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-2.5 py-2 text-xs text-slate-850 dark:text-slate-100 outline-none focus:border-brand-cyan font-mono"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Headers (JSON)</label>
                        <textarea
                          rows={3}
                          value={playgroundHeaders}
                          onChange={(e) => setPlaygroundHeaders(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-cyan font-mono leading-relaxed"
                        />
                      </div>

                      {playgroundMethod === 'POST' && (
                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Request Body (JSON)</label>
                          <textarea
                            rows={3}
                            value={playgroundBody}
                            onChange={(e) => setPlaygroundBody(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-cyan font-mono leading-relaxed"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={handleTestAPIPlayground}
                        disabled={playgroundLoading}
                        className="w-full py-2.5 bg-brand-cyan hover:bg-cyan-500 hover:text-slate-950 active:scale-95 transition font-black text-xs text-slate-950 rounded-2xl flex items-center justify-center space-x-2 shadow-inner"
                      >
                        {playgroundLoading ? (
                          <>
                            <RefreshCcw size={12} className="animate-spin" />
                            <span>Dispatching Transaction...</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" />
                            <span>Execute Console Test</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Response Terminal Log */}
                  <div className="lg:col-span-7 bg-[#030915] border border-slate-900 rounded-3xl p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-1.5">
                        <Terminal size={12} className="text-brand-cyan" />
                        <span>Interactive Response Console</span>
                      </span>
                      {playgroundStatus !== null && (
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold font-mono">
                          <span className="text-slate-500">STATUS:</span>
                          <span className={playgroundStatus >= 200 && playgroundStatus < 300 ? 'text-emerald-400' : 'text-rose-450'}>
                            {playgroundStatus}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="h-[280px] overflow-y-auto font-mono text-[11px] text-slate-350 leading-relaxed scrollbar-thin">
                      {playgroundResponse ? (
                        <pre className="text-slate-300 select-text">{JSON.stringify(playgroundResponse, null, 2)}</pre>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 select-none">
                          <Terminal size={24} className="opacity-40 animate-pulse text-brand-cyan" />
                          <p className="font-mono text-[10px] uppercase font-bold tracking-wider">No active sequence dispatched</p>
                          <p className="text-[9px] max-w-[240px] text-center font-bold">Configure parameters and hit "Execute Console Test" to transact against operational routes.</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-850 pt-3 flex items-center justify-between text-[9px] text-slate-550 font-mono font-bold">
                      <span>SECURE LOCAL TUNNEL</span>
                      <span>HTTPS PROTOCOL DEPLOYED</span>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>

    </div>
  );
};
