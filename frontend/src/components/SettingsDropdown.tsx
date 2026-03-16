import { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, RotateCcw, Palette, Lock } from 'lucide-react';
import { useStore } from '../store';
import type { Settings } from '../store';

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings, resetSettings } = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateFormats: Settings['dateFormat'][] = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  const currencies = ['$', '₦', '€', '£', '¥'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        title="Settings"
      >
        <SettingsIcon size={24} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
          <div className="p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Preferences</h3>
            
            <div className="space-y-4">
              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${settings.theme === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                  >
                    <Sun size={18} />
                    <span className="text-[10px] font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${settings.theme === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                  >
                    <Moon size={18} />
                    <span className="text-[10px] font-medium">Dark</span>
                  </button>
                  <button
                    className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-200 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Palette size={18} />
                    <span className="text-[10px] font-medium">Custom</span>
                  </button>
                </div>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => updateSettings({ dateFormat: e.target.value as any })}
                  className="w-full text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary"
                >
                  {dateFormats.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Currency Symbol</label>
                <div className="flex flex-wrap gap-2">
                  {currencies.map(c => (
                    <button
                      key={c}
                      onClick={() => updateSettings({ currency: c })}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all font-bold ${settings.currency === c ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Stock Notifications</span>
                <button
                  onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${settings.notificationsEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded-b-xl flex justify-between items-center">
            <button
              onClick={() => {
                if (window.confirm('Reset all settings to default?')) resetSettings();
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 p-2"
            >
              <RotateCcw size={12} />
              RESET ALL
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              DONE
            </button>
          </div>
          
          <div className="p-4 bg-slate-100/50 border-t border-slate-200">
             <h3 className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <Lock size={12} />
                Security Settings
             </h3>
             <PasswordChangeSection />
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordChangeSection() {
  const [isChanging, setIsChanging] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { changePassword } = useStore(); // WE NEED TO ADD THIS TO STORE

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await changePassword(current, next);
      setMsg({ type: 'success', text: 'Password updated!' });
      setCurrent('');
      setNext('');
      setTimeout(() => setIsChanging(false), 2000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!isChanging) {
    return (
      <button 
        onClick={() => setIsChanging(true)}
        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all"
      >
        Change Manager Password
      </button>
    );
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-3 animate-in slide-in-from-top-1 duration-200">
      <input 
        required
        type="password"
        placeholder="Current Password"
        className="w-full text-xs border border-slate-200 rounded-lg p-2 outline-none focus:border-primary"
        value={current}
        onChange={e => setCurrent(e.target.value)}
      />
      <input 
        required
        type="password"
        placeholder="New Password"
        className="w-full text-xs border border-slate-200 rounded-lg p-2 outline-none focus:border-primary"
        value={next}
        onChange={e => setNext(e.target.value)}
      />
      {msg.text && (
        <p className={`text-[10px] font-bold ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg.text}
        </p>
      )}
      <div className="flex gap-2">
        <button 
          disabled={loading}
          type="submit"
          className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? '...' : 'Update'}
        </button>
        <button 
          type="button"
          onClick={() => setIsChanging(false)}
          className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
