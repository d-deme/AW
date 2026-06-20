import React, { useState } from 'react';
import { BudgetAllocation } from '../types/admin';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  PiggyBank, 
  Coins, 
  Plus, 
  Briefcase, 
  TrendingUp, 
  Trash2, 
  AlertTriangle, 
  Edit, 
  Save, 
  X, 
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BudgetWeightAdjusterProps {
  budgets: BudgetAllocation[];
  onChange: (updatedBudgets: BudgetAllocation[]) => void;
}

// Highly stylized modern cyber-tech color wheel
const CHART_COLORS = [
  '#00E5FF', // Cyber Cyan
  '#FF007F', // Neon Magenta
  '#7C4DFF', // Electric Violet
  '#10B981', // Emerald Green
  '#F59E0B', // Amber Gold
  '#3B82F6'  // Digital Blue
];

export const BudgetWeightAdjuster: React.FC<BudgetWeightAdjusterProps> = ({ 
  budgets, 
  onChange 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetAllocation | null>(null);
  const [sectorTitle, setSectorTitle] = useState('');
  const [weight, setWeight] = useState(10);
  const [expense, setExpense] = useState(100000000);
  const [project, setProject] = useState('');
  const [milestone, setMilestone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate sum of weight allocations
  const totalWeight = budgets.reduce((sum, b) => sum + b.weightAllocation, 0);
  const totalExpense = budgets.reduce((sum, b) => sum + b.approvedCapitalExpenseEtb, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0
    }).format(val).replace('ETB', 'ETB ');
  };

  // Safe handler to adjust weights dynamically
  const handleWeightSlide = (id: string, newWeight: number) => {
    const currentBudget = budgets.find(b => b.id === id);
    if (!currentBudget) return;

    const sumOfOthers = budgets
      .filter(b => b.id !== id)
      .reduce((sum, b) => sum + b.weightAllocation, 0);

    // Hard limit at 100% total
    let safeWeight = newWeight;
    if (sumOfOthers + newWeight > 100) {
      safeWeight = 100 - sumOfOthers;
    }

    const updated = budgets.map(b => 
      b.id === id ? { ...b, weightAllocation: Math.max(0, safeWeight) } : b
    );
    onChange(updated);
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorTitle.trim()) return;

    // Validate limit first
    if (totalWeight + weight > 100) {
      setFormError(`Cannot add budget. This would exceed the 100% boundary (Current total: ${totalWeight}%, adding: ${weight}%). Please reduce the weight.`);
      return;
    }

    const newAllocation: BudgetAllocation = {
      id: `BG-${Date.now()}`,
      sectorTitle,
      weightAllocation: weight,
      approvedCapitalExpenseEtb: expense,
      assignedProject: project || 'General Municipal Upgrade',
      activeMilestone: milestone || 'Initiation'
    };

    onChange([...budgets, newAllocation]);
    resetForm();
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    const sumOfOthers = budgets
      .filter(b => b.id !== editingBudget.id)
      .reduce((sum, b) => sum + b.weightAllocation, 0);

    if (sumOfOthers + weight > 100) {
      setFormError(`Invalid adjustment. Subtotals would exceed the 100% maximum capacity limit. (Current total sum of other sectors is ${sumOfOthers}%, input: ${weight}%).`);
      return;
    }

    const updated = budgets.map(b => 
      b.id === editingBudget.id 
        ? { 
            ...b, 
            sectorTitle, 
            weightAllocation: weight, 
            approvedCapitalExpenseEtb: expense, 
            assignedProject: project, 
            activeMilestone: milestone 
          } 
        : b
    );
    onChange(updated);
    resetForm();
  };

  const startEdit = (b: BudgetAllocation) => {
    setEditingBudget(b);
    setSectorTitle(b.sectorTitle);
    setWeight(b.weightAllocation);
    setExpense(b.approvedCapitalExpenseEtb);
    setProject(b.assignedProject);
    setMilestone(b.activeMilestone);
    setFormError(null);
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget segment? This will release its weight allocation.')) {
      onChange(budgets.filter(b => b.id !== id));
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingBudget(null);
    setSectorTitle('');
    setWeight(10);
    setExpense(10000000);
    setProject('');
    setMilestone('');
    setFormError(null);
  };

  // Prep Recharts data
  const chartData = budgets.map(b => ({
    name: b.sectorTitle,
    value: b.weightAllocation,
    expense: b.approvedCapitalExpenseEtb,
    milestone: b.activeMilestone
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black text-white">{data.name}</p>
          <div className="h-px bg-slate-800 my-2" />
          <p className="text-xs text-brand-teal font-black flex justify-between gap-6 mr-1">
            <span>Weight:</span>
            <span>{data.value}%</span>
          </p>
          <p className="text-xs text-slate-300 font-bold flex justify-between gap-6 mt-1">
            <span>Capital Expense:</span>
            <span className="text-white font-black">{formatCurrency(data.expense)}</span>
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[200px] truncate">
            Milestone: <span className="text-brand-magenta font-black">{data.milestone}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Header info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Weight Ledger */}
        <div className="bg-[#0D1E3D] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Weight Distribution</h3>
            <div className={`p-2 rounded-xl border ${totalWeight === 100 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              <Coins size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">{totalWeight}%</span>
              <span className="text-sm font-bold text-slate-500">/ 100% Maximum</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 mt-3 overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-500 ${totalWeight === 100 ? 'bg-emerald-400' : totalWeight > 100 ? 'bg-rose-500' : 'bg-brand-teal'}`}
                style={{ width: `${Math.min(100, totalWeight)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2.5">
              <span className="text-[10px] text-slate-400 font-medium font-mono">Capacity Ledger Integrity</span>
              {totalWeight === 100 ? (
                <span className="text-xs text-emerald-400 font-black flex items-center space-x-1">
                  <CheckCircle2 size={12} />
                  <span>Fully Allocated</span>
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-bold flex items-center space-x-1">
                  <AlertTriangle size={12} />
                  <span>{100 - totalWeight}% Unallocated</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Total Capital Budget */}
        <div className="bg-[#0D1E3D] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-magenta/5 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Total Approved Capital</h3>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <PiggyBank size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-white font-mono leading-none tracking-tight">
              {formatCurrency(totalExpense)}
            </p>
            <div className="flex items-center space-x-1 mt-4 text-xs text-slate-400">
              <TrendingUp size={14} className="text-emerald-400" />
              <span>Dedicated FY - 2026 Core Infrastructure Funds</span>
            </div>
          </div>
        </div>

        {/* Sync panel mock preview */}
        <div className="bg-[#0D1E3D] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Strategic Sector Count</h3>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Cpu size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white">{budgets.length}</span>
              <span className="text-sm font-bold text-slate-500">Active Economic Nodes</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-3">
              Budget distribution directly feeds live charts on the Adama Mayor Council Public Portal.
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: interactive adjusters vs chart panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sliders Grid on the left */}
        <div className="lg:col-span-7 bg-[#0A162D] rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl shadow-slate-950/45">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Financial Allocation Rail</h2>
              <p className="text-xs text-slate-400">Adjust the weights dynamically to rebalance municipal expenditure.</p>
            </div>
            <button
              onClick={() => { resetForm(); setIsAdding(true); }}
              className="bg-brand-teal text-slate-950 px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 hover:scale-105 transition active:scale-95 shadow-lg shadow-brand-teal/20"
              title="Add a new capital budget weight segment"
            >
              <Plus size={14} />
              <span>Add Budget Weight</span>
            </button>
          </div>

          {/* Add / Edit Budget Segment Modal Overlay */}
          <AnimatePresence>
            {isAdding && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={resetForm}
                  className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
                />
                
                {/* Modal Body */}
                <motion.form 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
                  className="relative w-full max-w-xl bg-[#09162D] border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 text-left overflow-hidden"
                >
                  {/* Top glowing bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-teal via-[#7C4DFF] to-brand-magenta" />

                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <Coins className="text-brand-teal" size={18} />
                        <span>{editingBudget ? 'Edit Budget Weight Allocation' : 'Add Strategic Budget Segment'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Configure allocation coefficients, funding metrics, and milestone checklists.</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={resetForm} 
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {formError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 animate-in fade-in zoom-in-95 duration-200">
                      <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <div className="font-semibold text-left">{formError}</div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Sector Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Clean Geothermal Energy & Heat" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-teal focus:border-transparent text-white outline-none transition"
                        value={sectorTitle}
                        onChange={(e) => setSectorTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Capital Expenditure (ETB) *</label>
                        <input 
                          type="number" 
                          required
                          min={100000}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-teal focus:border-transparent text-white outline-none font-mono transition"
                          value={expense}
                          onChange={(e) => setExpense(parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex justify-between">
                          <span>Allocation Weight *</span>
                          <span className="text-brand-teal font-black">{weight}%</span>
                        </label>
                        <div className="flex items-center space-x-3 h-full pt-1">
                          <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            className="w-full h-1.5 rounded-lg bg-slate-950 accent-brand-teal cursor-pointer"
                            value={weight}
                            onChange={(e) => setWeight(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Strategic Initiative Project</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Sodere Hydro Borehole Installation" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-teal focus:border-transparent text-white outline-none transition"
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Active Progress Milestone</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Drilling Rig Commissioned" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-teal focus:border-transparent text-white outline-none transition"
                        value={milestone}
                        onChange={(e) => setMilestone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800/80 text-slate-300 rounded-xl text-xs font-black transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand-teal text-slate-950 rounded-xl text-xs font-black transition hover:scale-105 active:scale-95 shadow-lg shadow-brand-teal/20"
                    >
                      {editingBudget ? 'Save Changes' : 'Add Strategic Segment'}
                    </button>
                  </div>
                </motion.form>
              </div>
            )}
          </AnimatePresence>

          <div className="space-y-4 max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
            {budgets.map((b, i) => {
              const colorIdx = i % CHART_COLORS.length;
              const color = CHART_COLORS[colorIdx];
              return (
                <div 
                  key={b.id}
                  className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 hover:border-slate-700 transition duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="w-4 h-4 rounded-full mt-1 shrink-0" style={{ backgroundColor: color }} />
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{b.sectorTitle}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 truncate flex items-center">
                          <Briefcase size={12} className="inline mr-1 text-brand-teal" />
                          <span>{b.assignedProject}</span>
                          <span className="mx-2 text-slate-700 font-bold">•</span>
                          <span className="text-brand-magenta font-semibold font-mono">{b.activeMilestone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Subtotal Allocation</p>
                        <p className="text-sm font-black text-white font-mono">{formatCurrency(b.approvedCapitalExpenseEtb)}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => startEdit(b)}
                          className="p-2 text-slate-400 hover:text-brand-teal hover:bg-slate-800 rounded-xl transition"
                          title="Edit metrics"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition"
                          title="Remove block"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Weight Slider with visual feedback of total */}
                  <div className="mt-4 flex items-center space-x-4">
                    <span className="text-xs font-black text-slate-400 w-10">Weight:</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100"
                      className="flex-1 accent-brand-teal cursor-pointer h-1.5 rounded-lg bg-slate-950 focus:outline-none"
                      style={{
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${b.weightAllocation}%, #000 0%)`
                      }}
                      value={b.weightAllocation}
                      onChange={(e) => handleWeightSlide(b.id, parseInt(e.target.value))}
                    />
                    <span className="text-xs font-black font-mono w-12 text-right" style={{ color: color }}>
                      {b.weightAllocation}%
                    </span>
                  </div>
                </div>
              );
            })}

            {budgets.length === 0 && (
              <div className="text-center py-12 bg-slate-900/10 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm">No municipal budget segments declared.</p>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="mt-2 text-brand-teal text-xs font-bold underline"
                >
                  Create initial sector
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Visualizer on the right */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Donut Chart Visualizer */}
          <div className="bg-[#0A162D] rounded-3xl border border-slate-800 p-6 flex flex-col items-center justify-between shadow-xl shadow-slate-950/45 md:min-h-[380px]">
            <div className="w-full text-left border-b border-slate-800/60 pb-4">
              <h3 className="text-base font-black text-white tracking-tight">Active Allocation Visualizer</h3>
              <p className="text-xs text-slate-400">Donut distribution calculated instantly on weight manipulation.</p>
            </div>

            <div className="w-full h-64 relative mt-4">
              {budgets.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {budgets.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                  Add segments to render donut.
                </div>
              )}
              
              {/* Central counter showing total registered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest text-center leading-none">Total Weight</p>
                <p className="text-3xl font-black text-white mt-1 leading-none font-mono">
                  {totalWeight}%
                </p>
                <p className="text-[8px] mt-1 uppercase font-black text-brand-teal">Balanced Integrity</p>
              </div>
            </div>

            {/* Micro Legended lists */}
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-slate-800/60 text-xs font-medium">
              {budgets.map((b, idx) => (
                <div key={b.id} className="flex items-center space-x-1.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <span className="text-slate-300 truncate">{b.sectorTitle}</span>
                  <span className="text-slate-500 font-mono text-[10px] shrink-0">({b.weightAllocation}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0A162D] rounded-3xl border border-slate-800 p-6 shadow-xl shadow-slate-950/45 space-y-3">
            <h4 className="text-xs uppercase font-black text-brand-teal tracking-wider">Internal Controller Audit</h4>
            <div className="space-y-2 text-xs text-slate-400 font-medium">
              <p className="leading-relaxed">
                Budget adjustment is subject to city council approval. Under <strong className="text-slate-200">Article 8 of Urban Financial Governance</strong>, total capital segment weight allocations must reside at precisely <strong className="text-slate-200">100%</strong> before pushing to primary public DNS gateways.
              </p>
              <div className="flex items-center space-x-2 border-t border-slate-800 pt-3 text-[10px] uppercase font-mono">
                <span className={`w-2 h-2 rounded-full ${totalWeight === 100 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>Status Code: {totalWeight === 100 ? 'SUCCESS_LEDGER_BALANCED_100_PCT' : 'WARNING_PENDING_REBALANCING_REQUIRED'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
