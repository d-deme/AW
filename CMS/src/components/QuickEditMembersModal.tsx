import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  UserPlus, 
  AlertCircle 
} from 'lucide-react';
import { AdministrativeUnit, AdministrativeMember } from '../types';
import { getMemberAvatarUrl } from '../utils/avatar';

interface QuickEditMembersModalProps {
  unit: AdministrativeUnit;
  onClose: () => void;
  onSave: (unitId: string, updatedMembers: AdministrativeMember[]) => Promise<void>;
}

export const QuickEditMembersModal: React.FC<QuickEditMembersModalProps> = ({ 
  unit, 
  onClose, 
  onSave 
}) => {
  // Local state for the list of members being managed
  const [members, setMembers] = useState<AdministrativeMember[]>([...(unit.members || [])]);
  
  // State for building a new member
  const [newMember, setNewMember] = useState({ name: '', role: '', photoUrl: '', email: '' });
  const [newMemberError, setNewMemberError] = useState<string | null>(null);

  // Track which existing member is being edited inline
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<AdministrativeMember | null>(null);

  // Saver state
  const [isSaving, setIsSaving] = useState(false);

  // Add a member locally
  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.role.trim()) {
      setNewMemberError('Both Name and Role are required.');
      return;
    }

    const memberWithId: AdministrativeMember = {
      id: `m-${Date.now()}`,
      name: newMember.name.trim(),
      role: newMember.role.trim(),
      photoUrl: getMemberAvatarUrl(newMember.email, newMember.name, newMember.photoUrl),
      email: newMember.email.trim()
    };

    setMembers(prev => [...prev, memberWithId]);
    setNewMember({ name: '', role: '', photoUrl: '', email: '' });
    setNewMemberError(null);
  };

  // Remove a member locally
  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    // If we're editing this member, clear edit state
    if (editingMemberId === id) {
      setEditingMemberId(null);
      setEditingData(null);
    }
  };

  // Turn on inline edit mode for an existing member
  const startEditing = (member: AdministrativeMember) => {
    setEditingMemberId(member.id);
    setEditingData({ ...member, email: member.email || '' });
  };

  // Save the in-place edited member locally
  const handleSaveInlineEdit = () => {
    if (!editingData) return;
    if (!editingData.name.trim() || !editingData.role.trim()) {
      return; // Validation fails silently or inline
    }

    setMembers(prev => prev.map(m => m.id === editingData.id ? { 
      ...editingData,
      name: editingData.name.trim(),
      role: editingData.role.trim(),
      photoUrl: getMemberAvatarUrl(editingData.email, editingData.name, editingData.photoUrl),
      email: editingData.email?.trim()
    } : m));

    setEditingMemberId(null);
    setEditingData(null);
  };

  const handleCancelInlineEdit = () => {
    setEditingMemberId(null);
    setEditingData(null);
  };

  // Persist local members state back to DB/central context
  const handlePersistChanges = async () => {
    setIsSaving(true);
    try {
    await onSave(unit.id, members);      
    onClose();
    } catch (e) {
      console.error('Failed to save members inline:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/60 max-w-2xl w-full overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col max-h-[85vh] transition-all duration-300"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 dark:bg-[#0a0f1d] border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between flex-shrink-0 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white leading-none">Manage Unit Members</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-tight mt-1">
                Quick assign to: <span className="text-fuchsia-600 dark:text-fuchsia-400">{unit.name}</span>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Members List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Assigned Members ({members.length})
            </h4>
            
            {members.length === 0 ? (
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                <Users className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={32} />
                No members currently assigned to this unit.
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {members.map((member) => {
                    const isEditingThis = editingMemberId === member.id;
                    
                    return (
                      <motion.div 
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`border rounded-2xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all ${
                          isEditingThis 
                            ? 'border-brand-teal bg-brand-teal/5 dark:bg-brand-teal/2' 
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        {isEditingThis && editingData ? (
                          /* Inline Edit Fields */
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                            <div>
                              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight block mb-0.5">Name</label>
                              <input 
                                type="text"
                                value={editingData.name}
                                onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                                placeholder="Full Name"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight block mb-0.5">Role / Designation</label>
                              <input 
                                type="text"
                                value={editingData.role}
                                onChange={(e) => setEditingData({ ...editingData, role: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                                placeholder="Role"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight block mb-0.5">Profile Photo URL</label>
                              <input 
                                type="text"
                                value={editingData.photoUrl}
                                onChange={(e) => setEditingData({ ...editingData, photoUrl: e.target.value })}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                        ) : (
                          /* Display Member Row */
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <img 
                              src={member.photoUrl || 'https://picsum.photos/seed/placeholder/300/300'} 
                              alt={member.name}
                              className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/placeholder/300/300';
                              }}
                            />
                            <div className="truncate">
                              <h5 className="font-extrabold text-slate-800 dark:text-slate-150 leading-tight text-sm">
                                {member.name}
                              </h5>
                              <p className="text-[10px] text-brand-teal-dark dark:text-brand-teal font-extrabold uppercase tracking-widest mt-0.5 leading-none">
                                {member.role}
                              </p>
                              {member.photoUrl && !member.photoUrl.startsWith('https://picsum') && (
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-1 max-w-[280px]">
                                  {member.photoUrl}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions wrapper */}
                        <div className="flex items-center justify-end space-x-1 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-2 md:pt-0">
                          {isEditingThis ? (
                            <>
                              <button
                                type="button"
                                onClick={handleSaveInlineEdit}
                                title="Apply changes"
                                className="p-1.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-all"
                              >
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelInlineEdit}
                                title="Discard inline edits"
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditing(member)}
                                title="Edit this member"
                                disabled={editingMemberId !== null}
                                className={`p-2 rounded-lg transition-all ${
                                  editingMemberId !== null 
                                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                    : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                                }`}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.id)}
                                title="Remove from unit"
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Add Member form card */}
          <div className="rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <UserPlus size={16} />
              <h4 className="text-xs font-black uppercase tracking-widest">
                Add New Staff / Representative
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Full Name *</label>
                <input 
                  type="text"
                  placeholder="e.g. Dr. Abera Tesfaye"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Role / Title *</label>
                <input 
                  type="text"
                  placeholder="e.g. Director of Operations"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Avatar URL (Optional)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/... (leaves seed placeholder if omitted)"
                  value={newMember.photoUrl}
                  onChange={(e) => setNewMember({ ...newMember, photoUrl: e.target.value })}
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
                />
                <button
                  type="button"
                  onClick={() => setNewMember({ 
                    ...newMember, 
                    photoUrl: `https://picsum.photos/seed/user-${Math.floor(Math.random() * 9999)}/300/300` 
                  })}
                  className="px-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 rounded-xl text-[11px] font-bold transition-all border border-slate-200 dark:border-slate-700 whitespace-nowrap"
                >
                  Roll Seed Target
                </button>
              </div>
            </div>

            {newMemberError && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-rose-500 mt-2 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{newMemberError}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddMember}
                className="bg-brand-navy hover:bg-brand-navy/90 dark:bg-brand-teal dark:hover:bg-brand-teal/90 dark:text-brand-navy text-white px-5 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all hover:scale-[1.02] shadow-sm select-none cursor-pointer"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Add Member to List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0a0f1d] border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-end space-x-3 flex-shrink-0 transition-colors">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-350 font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-all"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handlePersistChanges}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl font-black text-xs text-brand-navy bg-brand-teal hover:bg-brand-teal/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-brand-teal/10 flex items-center space-x-1.5 select-none cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check size={15} className="stroke-[3]" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
