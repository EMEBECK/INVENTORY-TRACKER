import { useEffect } from 'react';
import { useStore } from '../store';
import { PackageOpen, AlertOctagon, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import SettingsDropdown from '../components/SettingsDropdown';

export default function Dashboard() {
  const { items, loading, loadItems } = useStore();

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const totalItems = items.length;
  const outOfStock = items.filter(i => i.quantity === 0).length;
  const lowStock = items.filter(i => i.quantity > 0 && i.is_low_stock).length;
  const healthy = items.filter(i => i.quantity > 0 && !i.is_low_stock).length;

  if (loading) return <div className="text-center py-10 opacity-50">Loading metrics...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={32} />
          Dashboard Overview
        </h1>
        <SettingsDropdown />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <MetricCard title="Total Catalog" value={totalItems} icon={<PackageOpen size={24}/>} color="bg-blue-50 text-blue-600" />
        <MetricCard title="Out of Stock" value={outOfStock} icon={<AlertOctagon size={24}/>} color="bg-red-50 text-red-600" />
        <MetricCard title="Low Stock" value={lowStock} icon={<AlertOctagon size={24} className="opacity-75"/>} color="bg-orange-50 text-orange-600" />
        <MetricCard title="Healthy Stock" value={healthy} icon={<CheckCircle2 size={24}/>} color="bg-green-50 text-green-600" />
      </div>

      <h2 className="text-xl font-bold mb-4">Urgent Actions Needed</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {(outOfStock > 0 || lowStock > 0) ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.filter(i => i.quantity === 0 || i.is_low_stock).map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-700">{item.name}</td>
                  <td className="p-4 text-slate-500">{item.sku}</td>
                  <td className="p-4 font-mono text-slate-700">{item.quantity} / {item.threshold}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${item.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/inventory/${item.id}`} className="px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-colors">
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-10 text-center text-slate-500">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-green-400 opacity-50" />
            <p>All stock levels are healthy. No urgent actions required.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
