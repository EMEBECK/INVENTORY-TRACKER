import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, AlertTriangle } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import { useStore } from './store';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const error = useStore(state => state.error);
  
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
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
            className={`flex items-center gap-3 px-6 py-3 transition-colors ${location.pathname === '/inventory' ? 'bg-primary/10 text-primary border-r-4 border-primary' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Package size={20} />
            Inventory
          </Link>
        </nav>
      </aside>
      
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
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
