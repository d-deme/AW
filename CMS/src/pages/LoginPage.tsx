import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../services/api';
import { useCMS } from '../CMSContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useCMS();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { token, user } = await authAPI.login(username, password);
      localStorage.setItem('token', token);
      login(token, user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

 
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="bg-brand-navy p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="w-20 h-20 bg-brand-teal rounded-3xl flex items-center justify-center text-brand-navy mx-auto mb-6 shadow-lg relative z-10">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight relative z-10">CMS Portal</h1>
          <p className="text-brand-teal/60 font-bold uppercase tracking-widest text-xs mt-2 relative z-10">Adama City Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-600"
            >
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-navy font-bold focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all outline-none"
              placeholder="Enter username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-navy font-bold focus:ring-2 focus:ring-brand-teal focus:border-transparent transition-all outline-none"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-navy text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-brand-navy/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <span>Sign In to CMS</span>
            )}
          </button>
          
          <p className="text-center text-gray-400 text-xs font-medium">
            Authorized Personnel Only
          </p>
        </form>
      </motion.div>
    </div>
  );
};