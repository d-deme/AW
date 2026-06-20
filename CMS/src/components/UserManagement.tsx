import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMS } from '../CMSContext';
import { Plus, Edit, Trash2, Search, X, AlertCircle, Loader2, CheckCircle, Users, ChevronUp, ChevronDown, PenTool } from 'lucide-react';

const ALL_MODULES = [
  { id: 'news', label: 'News' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'services', label: 'Services' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'history', label: 'History' },
  { id: 'initiatives', label: 'Initiatives' },
  { id: 'events', label: 'Events' },
  { id: 'documents', label: 'Documents' },
  { id: 'tourism', label: 'Tourism' },
  { id: 'blog', label: 'Blog' },
  { id: 'media', label: 'Media' },
  { id: 'administrative-units', label: 'Admin Units' }
];

const getDefaultPermissionsForRole = (role: string) => {
  const norm = (role || '').toLowerCase().replace(/_/g, ' ');
  return ALL_MODULES.map(m => ({
    module: m.id,
    read: true,
    write: ['admin', 'super admin', 'super_admin', 'editor', 'publisher', 'reviewer'].includes(norm),
    delete: ['admin', 'super admin', 'super_admin'].includes(norm)
  }));
};

export const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, isLoading } = useCMS();
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'username', direction: 'asc' });
  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);

  useEffect(() => {
    if (editingUser) {
      setSelectedPermissions(editingUser.permissions || getDefaultPermissionsForRole(editingUser.role));
    } else if (isAdding) {
      setSelectedPermissions(getDefaultPermissionsForRole('viewer'));
    } else {
      setSelectedPermissions([]);
    }
  }, [editingUser, isAdding]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <div className="w-4 h-4 opacity-20"><ChevronUp size={14} /></div>;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-brand-teal" /> : <ChevronDown size={14} className="text-brand-teal" />;
  };

  const filteredUsers = (users || []).filter(user => 
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const userData = {
      username: formData.get('username') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as any,
      password: password || undefined,
      permissions: selectedPermissions,
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await addUser(userData as any);
      }
      setIsAdding(false);
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    }
  };

  // For simplicity, I'm truncating the UI to keep the message manageable. The full UI from your original App.tsx would go here.
  // You can copy the entire UserManagement JSX from your original App.tsx into this return.
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-brand-navy rounded-2xl text-brand-teal shadow-xl shadow-brand-navy/20">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight">Identity Access</h1>
            <p className="text-gray-500 font-medium">Control who can manage your digital infrastructure.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Filter by name, email..." className="pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal outline-none text-sm w-72 bg-white transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsAdding(true)} className="bg-brand-navy text-white px-6 py-3 rounded-2xl font-black flex items-center space-x-2 hover:bg-brand-navy/90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-navy/20">
            <Plus size={20} />
            <span>New Operator</span>
          </button>
        </div>
      </div>

      {/* User table – copy the full table from your original App.tsx here */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 cursor-pointer group" onClick={() => handleSort('username')}>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-brand-navy transition-colors">Operator</span>
                  <SortIcon column="username" />
                </div>
              </th>
              <th className="px-8 py-5 cursor-pointer group" onClick={() => handleSort('role')}>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-brand-navy transition-colors">Authorization</span>
                  <SortIcon column="role" />
                </div>
              </th>
              <th className="px-8 py-5 cursor-pointer group hidden md:table-cell" onClick={() => handleSort('email')}>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-brand-navy transition-colors">Email</span>
                  <SortIcon column="email" />
                </div>
              </th>
              <th className="px-8 py-5 text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Governance</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-center text-brand-navy font-black text-lg shadow-sm group-hover:border-brand-teal/50 transition-colors">
                      {(user.name || user.username)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-brand-navy">{user.name || user.username}</p>
                      <p className="text-xs text-gray-400 font-medium">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-fit ${
                    (user.role === 'admin' || user.role === 'super_admin') ? 'bg-orange-500/10 text-orange-600' :
                    user.role === 'editor' ? 'bg-blue-500/10 text-blue-600' :
                    user.role === 'publisher' ? 'bg-emerald-500/10 text-emerald-600' :
                    user.role === 'reviewer' ? 'bg-purple-500/10 text-purple-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                      (user.role === 'admin' || user.role === 'super_admin') ? 'bg-orange-500' :
                      user.role === 'editor' ? 'bg-blue-500' :
                      user.role === 'publisher' ? 'bg-emerald-500' :
                      user.role === 'reviewer' ? 'bg-purple-500' :
                      'bg-gray-400'
                    }`} />
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5 hidden md:table-cell">
                  <p className="text-sm text-gray-600 font-medium">{user.email}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => setEditingUser(user)} className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => setDeleteConfirm(user)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" disabled={user.username === 'admin'}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal - simplified version, but you can copy the full modal from original */}
      <AnimatePresence>
        {(isAdding || editingUser) && (
          <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-[#070e1e] rounded-3xl shadow-2xl border border-slate-100 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-6">
  {error && (
    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-4 rounded-2xl text-rose-750 dark:text-rose-200 text-xs font-bold flex items-center space-x-2">
      <AlertCircle size={16} className="text-rose-500 shrink-0" />
      <span>{error}</span>
    </div>
  )}

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Full Operator Name</label>
      <input 
        name="name"
        type="text"
        placeholder="e.g. Abebe Kebede"
        defaultValue={editingUser?.name}
        required
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#030914] text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-xs font-semibold"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Operator Username</label>
      <input 
        name="username"
        type="text"
        placeholder="e.g. abebe_k"
        defaultValue={editingUser?.username}
        required
        disabled={!!editingUser}
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#030914] text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-xs font-semibold disabled:opacity-50"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Email Address</label>
      <input 
        name="email"
        type="email"
        placeholder="username@adamacity.gov.et"
        defaultValue={editingUser?.email}
        required
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#030914] text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-xs font-semibold"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Operator Privilege Role</label>
      <select 
        name="role"
        defaultValue={editingUser?.role || 'viewer'}
        onChange={(e) => {
          const newRole = e.target.value;
          setSelectedPermissions(getDefaultPermissionsForRole(newRole));
        }}
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#030914] text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-xs font-semibold"
      >
        <option value="admin">Admin (Full Control)</option>
        <option value="editor">Editor (Write Access)</option>
        <option value="viewer">Viewer (Read-Only)</option>
      </select>
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
        Password {editingUser && '(Optional)'}
      </label>
      <input 
        name="password"
        type="password"
        required={!editingUser}
        placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Enter strong password'}
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#030914] text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-xs font-semibold"
      />
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
        Confirm Password
      </label>
      <input 
        name="confirmPassword"
        type="password"
        required={!editingUser}
        placeholder="Re-type password to verify"
        className="w-full px-4 py-3 bg-slate-50/50 dark:bg-[#030914] text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal text-xs font-semibold"
      />
    </div>
  </div>

  {/* Modular Permissions Overrides */}
  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
    <div className="flex items-center justify-between">
      <label className="text-xs font-black text-brand-navy dark:text-slate-300 uppercase tracking-wider block">Granular Permissions Overrides</label>
      <span className="text-[10px] text-slate-400 font-bold">Customizes system boundaries per resource module</span>
    </div>
    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto shadow-xs bg-slate-50/40 dark:bg-[#030914]/40">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-100/80 dark:bg-slate-900 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 sticky top-0">
          <tr>
            <th className="px-4 py-3">Module</th>
            <th className="px-2 py-3 text-center">Read</th>
            <th className="px-2 py-3 text-center">Write</th>
            <th className="px-2 py-3 text-center">Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {ALL_MODULES.map(m => {
            const p = selectedPermissions.find(x => x.module === m.id) || { read: false, write: false, delete: false };
            return (
              <tr key={m.id} className="hover:bg-slate-150/40 dark:hover:bg-slate-900/40">
                <td className="px-4 py-2.5 font-bold text-slate-705 dark:text-slate-300">{m.label}</td>
                <td className="px-2 py-2.5 text-center">
                  <input type="checkbox" checked={p.read} onChange={(e) => {
                    const updated = selectedPermissions.map(x => x.module === m.id ? { ...x, read: e.target.checked } : x);
                    setSelectedPermissions(updated);
                  }} className="rounded border-slate-300 dark:border-slate-700 text-brand-teal focus:ring-brand-teal/20" />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <input type="checkbox" checked={p.write} onChange={(e) => {
                    const updated = selectedPermissions.map(x => x.module === m.id ? { ...x, write: e.target.checked } : x);
                    setSelectedPermissions(updated);
                  }} className="rounded border-slate-300 dark:border-slate-700 text-brand-teal focus:ring-brand-teal/20" />
                </td>
                <td className="px-2 py-2.5 text-center">
                  <input type="checkbox" checked={p.delete} onChange={(e) => {
                    const updated = selectedPermissions.map(x => x.module === m.id ? { ...x, delete: e.target.checked } : x);
                    setSelectedPermissions(updated);
                  }} className="rounded border-slate-300 dark:border-slate-700 text-brand-teal focus:ring-brand-teal/20" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>

  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
    <button type="button" onClick={() => { setIsAdding(false); setEditingUser(null); setError(null); }} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-xs">
      Cancel
    </button>
    <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-brand-navy text-white font-bold rounded-xl shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50 text-xs">
      {isLoading ? <Loader2 className="animate-spin" size={16} /> : <span>{editingUser ? 'Update Operator' : 'Register Operator'}</span>}
    </button>
  </div>
</form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full space-y-4">
              <div className="flex items-center space-x-3 text-red-600">
                <div className="p-2 bg-red-100 rounded-full"><Trash2 size={24} /></div>
                <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600">Are you sure you want to delete user <span className="font-bold text-gray-900">"{deleteConfirm.username}"</span>? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3 pt-4">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                <button onClick={async () => { await deleteUser(deleteConfirm.id); setDeleteConfirm(null); }} className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};