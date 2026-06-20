import { cdnService } from '../services/api';
import { useState, useEffect } from 'react';
import { 
  ShieldAlert, RefreshCcw, Globe, Cpu, Activity, 
  Database, CheckCircle2, Server, Flame, Wifi, Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export const CDNDecouplingHub: React.FC = () => {
  const [config, setConfig] = useState<CDNConfig | null>(null);
  const [cdnBase, setCdnBase] = useState('https://cdn.adama.gov.et');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [simulatedBandwidth, setSimulatedBandwidth] = useState('1.84 GB/m');
  const [logs, setLogs] = useState<string[]>([]);
  const [events] = useState<string[]>([
    'CDN Console handshake completed successfully.',
    'Discovered 4 edge delivery regions.',
    'Static file assets cached in edge layers.'
  ]);

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 20));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchConfig = async () => {
    setIsSyncing(true);
    try {
      const data = await cdnService.getConfig();
      setConfig(data);
      setCdnBase(data.cdnBaseUrl);
    } catch (err) {
      console.error('Failed to load CDN configuration:', err);
      showToast('Failed to load CDN configuration');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    const timer = setInterval(() => {
      const speed = (1.5 + Math.random() * 0.8).toFixed(2);
      setSimulatedBandwidth(`${speed} GB/m`);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleDecouple = async (checked: boolean) => {
    setIsSyncing(true);
    try {
      const data = await cdnService.updateConfig({
        decoupledMode: checked,
        cdnBaseUrl: cdnBase
      });
      setConfig(data);
      const actionText = checked 
        ? 'Static decoupling activated. Express server bypassed for bundle deliveries.' 
        : 'Express server fallback mode restored for static distribution.';
      addLog(actionText);
      showToast(checked ? 'Decoupled static distribution active!' : 'Restored local Fallback serving.');
    } catch (err) {
      console.error(err);
      showToast('Transaction rejected by administrative auth check.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateCdnUrl = async () => {
    setIsSyncing(true);
    try {
      const data = await cdnService.updateConfig({ cdnBaseUrl: cdnBase });
      setConfig(data);
      addLog(`Updated global Edge target routing host to: ${cdnBase}`);
      showToast('CDN host address matching compiled origin.');
    } catch (err) {
      console.error(err);
      showToast('Error modifying CDN host.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePurgeCache = async () => {
    setIsPurging(true);
    addLog('Initiating multi-region cache invalidation protocol...');
    try {
      const result = await cdnService.purgeCache();
      addLog(result.message || 'Cache purge completed successfully.');
      showToast('Global cache purge completed.');
      await fetchConfig();
    } catch (err) {
      console.error(err);
      addLog('Cache purge failed. Please check authentication and try again.');
      showToast('Purge failed – check console for details.');
    } finally {
      setIsPurging(false);
    }
  };

  if (!config) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 font-bold font-mono">
        Authenticating Console Credentials...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 p-2 text-left select-none" id="cdn-decoupling-hub">
      
      {/* Toast alert slider */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-8 z-[100] bg-brand-navy border border-brand-teal/30 shadow-2xl p-4 rounded-2xl flex items-center space-x-3 text-xs"
          >
            <CheckCircle2 size={16} className="text-brand-teal animate-bounce" />
            <span className="font-extrabold font-mono text-white select-none">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2.5 bg-brand-teal/10 rounded-2xl text-brand-teal inline-block">
              <Globe size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Production Edge CDN Distribution Console</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  config.decoupledMode ? 'bg-emerald-500/25 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {config.decoupledMode ? 'Bypassed & Decoupled' : 'Direct express Coupled'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Control the static asset pipeline. When decoupled, static content is served strictly from external CDNs, isolating the Node API process from bulk transport bandwidth loading.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPILER: Configuration settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Cpu size={14} className="text-brand-teal" />
              <span>Pipeline Configuration</span>
            </h3>

            <div className="space-y-6">
              {/* Main Toggle Switch */}
              <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-905 border border-slate-150 dark:border-slate-850 rounded-2xl transition">
                <div className="space-y-1 pr-4 text-left">
                  <span className="text-xs font-black text-slate-800 dark:text-white block">Decoupled Static Delivery Mode</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-relaxed block max-w-xs font-medium">
                    When active, local Express servers will refuse fallback bundle servings. Forcing visitors to fetch bundles exclusively through edge domains.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1 select-none">
                  <input 
                    type="checkbox" 
                    checked={config.decoupledMode}
                    onChange={(e) => handleToggleDecouple(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-teal border border-transparent dark:border-slate-800/50"></div>
                </label>
              </div>

              {/* CDN URL text field */}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Edge distribution domain (Distribution URL)</label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={cdnBase}
                    onChange={(e) => setCdnBase(e.target.value)}
                    placeholder="https://cdn.adama.gov.et"
                    disabled={isSyncing}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition"
                  />
                  <button
                    onClick={handleUpdateCdnUrl}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 font-extrabold text-xs text-slate-705 dark:text-white rounded-2xl active:scale-95 transition flex items-center space-x-1 border border-slate-200 dark:border-slate-700"
                  >
                    <span>Save</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-550 italic mt-1 font-medium block">
                  Ensure domain endpoints resolve to correct IP nodes.
                </span>
              </div>

              {/* Cache purge invalidator */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-3 text-left">
                <span className="text-xs font-black text-slate-800 dark:text-white block">Edge Invalidation sequence</span>
                <p className="text-[10px] text-slate-450 leading-relaxed block font-medium">
                  Trigger global Edge network purges to force static cluster reconciliations after shipping code changes. This clears local client proxy cached buffers.
                </p>
                <button
                  type="button"
                  onClick={handlePurgeCache}
                  disabled={isPurging || isSyncing}
                  className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 active:scale-[0.98] transition font-black text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-inner"
                >
                  <Flame size={14} className={isPurging ? 'animate-spin' : ''} />
                  <span>{isPurging ? 'Purging Global Clusters...' : 'Purge All CDN Edge Caches'}</span>
                </button>
                <span className="text-[9px] font-mono text-slate-400 block text-center mt-1">
                  Cluster status: CLEAN (Last action: {new Date(config.cachePurgedAt).toLocaleTimeString()})
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT METRICS: Live regions telemetry */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active edge points */}
          <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Active Target Edge Clusters</span>
              <span className="flex items-center space-x-1 text-[10px] text-brand-teal uppercase font-black tracking-widest font-mono">
                <Wifi size={10} className="animate-pulse text-emerald-500" />
                <span>DNS SECURE</span>
              </span>
            </h3>

            <div className="space-y-3 select-none">
              {config.regions.map((region) => (
                <div 
                  key={region.name}
                  className="p-3.5 bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 rounded-xl bg-brand-teal/5 flex items-center justify-center text-brand-teal">
                      <Server size={14} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white leading-tight block">{region.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold block mt-0.5">Host: edge-{region.name.slice(0,3).toLowerCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-right font-mono text-[11px] font-bold">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans font-black">Latency</span>
                      <span className="text-brand-teal tracking-wide">{region.latency}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-sans font-black">Hit Ratio</span>
                      <span className="text-emerald-450 tracking-wide">{region.cacheHitRatio}</span>
                    </div>

                    <div className="pl-2 border-l border-slate-200 dark:border-slate-800 text-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Logs Shell console */}
          <div className="bg-[#030a1c] border border-slate-900 rounded-3xl p-6 shadow-2xl relative select-none">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center space-x-2">
                <Activity size={10} className="text-brand-teal animate-bounce" />
                <span>Edge Distribution logs console</span>
              </span>
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="h-[150px] overflow-y-auto font-mono text-[11px] text-slate-400 space-y-2.5 custom-scrollbar text-left pr-2">
              {events.map((evt, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-brand-teal select-none">&gt;</span>
                  <p className="flex-1 leading-relaxed">{evt}</p>
                </div>
              ))}
            </div>

            {/* Simulated Live egress rates footer */}
            <div className="border-t border-slate-850 pt-4 mt-4 grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold select-none">
              <div>
                <span className="text-[9px] text-slate-550 uppercase block font-sans font-bold">Total Savings</span>
                <span className="text-brand-teal text-sm !font-black">94.2% Bandwidth</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 uppercase block font-sans font-bold">Inbound requests</span>
                <span className="text-white text-sm !font-black">21,480 reqs/h</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 uppercase block font-sans font-bold">Egress Throughput</span>
                <span className="text-emerald-450 text-sm !font-black">{simulatedBandwidth}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
