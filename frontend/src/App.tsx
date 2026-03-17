import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, AlertTriangle, History } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import ItemDetails from './pages/ItemDetails';
import ActivityLog from './pages/ActivityLog';
import PasswordModal from './components/PasswordModal';
import { useStore } from './store';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const error = useStore(state => state.error);
  const theme = useStore(state => state.settings.theme);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auto-lock Activity when navigating away
  useEffect(() => {
    if (location.pathname !== '/activity' && isAuthorized) {
      setIsAuthorized(false);
    }
    
    // Strict requirement: Prompt for password if accessing /activity directly
    if (location.pathname === '/activity' && !isAuthorized && !isPasswordModalOpen) {
      setIsPasswordModalOpen(true);
    }
  }, [location.pathname, isAuthorized, isPasswordModalOpen]);
  
  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-background text-slate-900'}`}>
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-2">
          <Package className="text-primary" />
          Smart Tracker
        </div>
        <nav className="flex-1 py-4">
          <Link 
            to="/" 
            className={`flex items-center gap-3 px-6 py-3 transition-colors ${location.pathname === '/' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/inventory" 
            className={`flex items-center gap-3 px-6 py-3 transition-colors ${location.pathname.startsWith('/inventory') ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Package size={20} />
            Inventory
          </Link>
          <button 
            onClick={() => {
              if (isAuthorized) {
                navigate('/activity');
              } else {
                setIsPasswordModalOpen(true);
              }
            }}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${location.pathname === '/activity' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <History size={20} />
            Report Activity
          </button>
        </nav>
      </aside>
      
      {isPasswordModalOpen && (
        <PasswordModal 
          onAuthorize={() => {
            setIsAuthorized(true);
            setIsPasswordModalOpen(false);
            navigate('/activity');
          }}
          onClose={() => {
            setIsPasswordModalOpen(false);
            if (location.pathname === '/activity') {
               navigate('/');
            }
          }}
        />
      )}
      
      <main className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="mb-6 bg-danger/10 text-danger px-4 py-3 rounded-md flex items-center gap-2 border border-danger/20 shadow-sm transition-all">
            <AlertTriangle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/:id" element={<ItemDetails />} />
          <Route path="/activity" element={<ActivityLog />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
