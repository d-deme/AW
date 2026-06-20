import { useState } from 'react';
import { useCMS } from '../CMSContext';
import { CheckSquare, AlertCircle, Loader2 } from 'lucide-react';

export const UserProfile = () => {
  const { currentUser, updateProfile, isLoading } = useCMS();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await updateProfile({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: password || undefined
      });
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Update your personal information and password.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-green-700 text-sm font-bold flex items-center space-x-2">
              <CheckSquare size={18} />
              <span>Profile updated successfully!</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-700 text-sm font-bold flex items-center space-x-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <input 
                name="name"
                defaultValue={currentUser?.name}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-teal outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Username</label>
              <input 
                value={currentUser?.username}
                disabled
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 outline-none cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
              <input 
                name="email"
                type="email"
                defaultValue={currentUser?.email}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-teal outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
              <div className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-bold capitalize">
                {currentUser?.role}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-900">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">New Password</label>
                <input 
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-teal outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Confirm New Password</label>
                <input 
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-teal outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-brand-navy text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>Update Profile</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};