import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';
import { verifyPassword } from '../api';

interface PasswordModalProps {
  onAuthorize: () => void;
  onClose: () => void;
}

export default function PasswordModal({ onAuthorize, onClose }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await verifyPassword(password);
      if (result.success) {
        onAuthorize();
      } else {
        setError('Invalid manager password');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-8 text-center text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="bg-primary/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-primary/30 shadow-inner">
            <Lock className="text-primary" size={40} />
          </div>
          <h2 className="text-2xl font-bold">Activity Access</h2>
          <p className="text-slate-400 mt-2 text-sm italic">Manager authorization required</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 animate-in shake-x duration-500">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 ml-1">Password</label>
            <input
              autoFocus
              required
              type="password"
              className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-xl py-3 px-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono text-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Lock size={18} />
                Authorize Access
              </>
            )}
          </button>
          
          <p className="text-center text-slate-400 text-xs mt-6">
            Contact your administrator if you forgot your password.
          </p>
        </form>
      </div>
    </div>
  );
}
