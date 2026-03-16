import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Calendar, ShieldCheck, 
  User, Mail, MapPin, History, Edit, Trash2, TrendingUp 
} from 'lucide-react';
import { useStore } from '../store';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedItem, loading, loadItem, settings } = useStore();

  useEffect(() => {
    if (id) loadItem(id);
  }, [id, loadItem]);

  if (loading || !selectedItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${settings.currency}${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    // Simplified formatting based on settings
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (settings.dateFormat === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
    if (settings.dateFormat === 'MM/DD/YYYY') return `${month}/${day}/${year}`;
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Inventory
        </button>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{selectedItem.name}</h1>
          <div className="flex gap-4 items-center">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-mono text-sm font-bold">
              ID: {selectedItem.sku}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
              {selectedItem.category}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            <Edit size={18} />
            Edit Item
          </button>
          <button className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-lg font-bold text-red-600 hover:bg-red-100 shadow-sm transition-all">
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Stock Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={24} />
            </div>
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
              selectedItem.quantity === 0 ? 'bg-red-100 text-red-700' : 
              selectedItem.is_low_stock ? 'bg-orange-100 text-orange-700' : 
              'bg-green-100 text-green-700'
            }`}>
              {selectedItem.quantity === 0 ? 'Out of Stock' : selectedItem.is_low_stock ? 'Low Stock' : 'Healthy'}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Current Stock</p>
          <p className="text-3xl font-black text-slate-900">{selectedItem.quantity}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Min Threshold: <span className="text-slate-600">{selectedItem.threshold}</span> units</p>
        </div>

        {/* Card 2: Purchase Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Last Purchase</p>
          <p className="text-2xl font-black text-slate-900">{formatDate(selectedItem.date_purchased)}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Amount: <span className="text-green-600 font-bold">{selectedItem.purchase_amount ? formatCurrency(selectedItem.purchase_amount) : '-'}</span></p>
        </div>

        {/* Card 3: Supplier Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-50 text-slate-600 rounded-xl">
              <User size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Primary Supplier</p>
          <p className="text-xl font-black text-slate-900 truncate">{selectedItem.supplier_name || selectedItem.supplier || 'N/A'}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium truncate">{selectedItem.supplier_contact || 'No contact info'}</p>
        </div>

        {/* Card 4: Last Updated */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <History size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Last Updated</p>
          <p className="text-xl font-black text-slate-900">{formatDate(selectedItem.updated_at)}</p>
          <p className="text-xs text-slate-400 mt-2 font-medium">Activity Logged</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Info Cards */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
               <ShieldCheck size={24} className="text-primary"/>
               Item Specifications
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
               <div className="space-y-4">
                 <div className="flex justify-between pb-3 border-b border-slate-50">
                   <span className="text-slate-500 font-bold uppercase">Item Name</span>
                   <span className="text-slate-900 font-semibold">{selectedItem.name}</span>
                 </div>
                 <div className="flex justify-between pb-3 border-b border-slate-50">
                   <span className="text-slate-500 font-bold uppercase">SKU / ID</span>
                   <span className="text-slate-900 font-mono font-bold">{selectedItem.sku}</span>
                 </div>
                 <div className="flex justify-between pb-3 border-b border-slate-50">
                   <span className="text-slate-500 font-bold uppercase">Category</span>
                   <span className="text-slate-900 font-semibold">{selectedItem.category}</span>
                 </div>
                 <div className="flex justify-between pb-3 border-b border-slate-50">
                   <span className="text-slate-500 font-bold uppercase">Unit Price</span>
                   <span className="text-slate-900 font-bold">{formatCurrency(selectedItem.price)}</span>
                 </div>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between pb-3 border-b border-slate-50">
                   <span className="text-slate-500 font-bold uppercase">Qty Purchased</span>
                   <span className="text-slate-900 font-semibold">{selectedItem.quantity_purchased || 0}</span>
                 </div>
                 <div className="flex justify-between pb-3 border-b border-slate-50">
                   <span className="text-slate-500 font-bold uppercase">Supplier Contact</span>
                   <span className="text-slate-900 font-semibold">{selectedItem.supplier_contact || '-'}</span>
                 </div>
                 <div className="col-span-2">
                   <span className="text-slate-500 font-bold uppercase block mb-1">Notes</span>
                   <p className="bg-slate-50 p-3 rounded-lg text-slate-600 leading-relaxed italic border border-slate-100">
                     {selectedItem.notes || "No additional notes provided for this item."}
                   </p>
                 </div>
               </div>
             </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden">
             <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
               <History size={24} className="text-primary"/>
               Stock Activity History
             </h2>
             <div className="overflow-x-auto -mx-8">
               <table className="w-full text-left whitespace-nowrap">
                 <thead className="bg-slate-50 border-y border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                   <tr>
                     <th className="px-8 py-3">Date & Time</th>
                     <th className="px-4 py-3">Update Type</th>
                     <th className="px-4 py-3">Change</th>
                     <th className="px-8 py-3">Reason / Details</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {selectedItem.logs?.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-4 text-sm font-medium text-slate-600">{formatDate(log.timestamp)}</td>
                       <td className="px-4 py-4">
                         <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                           log.update_type === 'sale' ? 'bg-red-50 text-red-600' : 
                           log.update_type === 'purchase' ? 'bg-green-50 text-green-600' : 
                           'bg-blue-50 text-blue-600'
                         }`}>
                           {log.update_type}
                         </span>
                       </td>
                       <td className={`px-4 py-4 text-sm font-black ${log.change_amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                         {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                       </td>
                       <td className="px-8 py-4 text-sm text-slate-500 italic truncate max-w-[200px]">{log.reason || '-'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Supplier Info Block */}
          <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <ShieldCheck size={120} />
             </div>
             <h3 className="text-lg font-black mb-6 uppercase tracking-wider text-indigo-200">Supplier Overview</h3>
             <div className="space-y-6 relative z-10">
               <div>
                 <p className="text-xs font-bold text-indigo-300 uppercase mb-1">Company</p>
                 <p className="text-xl font-black">{selectedItem.supplier_name || selectedItem.supplier || 'N/A'}</p>
               </div>
               <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-800 rounded-lg text-indigo-300">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-300 uppercase">Contact</p>
                      <p className="text-sm font-semibold">{selectedItem.supplier_contact || '-'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-800 rounded-lg text-indigo-300">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-300 uppercase">Location</p>
                      <p className="text-sm font-semibold leading-tight">{selectedItem.supplier_address || '-'}</p>
                    </div>
                 </div>
               </div>
               <button className="w-full mt-4 py-3 bg-indigo-800 hover:bg-indigo-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">
                 Contact Supplier
               </button>
             </div>
          </div>

          {/* Quick Stats/Trend */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <h3 className="text-slate-900 font-black mb-4 flex items-center gap-2">
               <TrendingUp size={20} className="text-green-500"/>
               Performance
             </h3>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-xs font-bold text-slate-500 uppercase">Stock Utilization</span>
                   <span className="text-sm font-black text-slate-900">78%</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full w-[78%] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                 </div>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 This item has been moving fast. Consider increasing the minimum threshold by <span className="text-primary font-bold">10%</span> next month.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
