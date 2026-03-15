import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import type { InventoryItem } from '../store';
import { Search, Plus, Edit2, X } from 'lucide-react';
import CategoryDropdown from '../components/CategoryDropdown';

export default function InventoryList() {
  const { items, loading, loadItems, addItem, adjustStock, error } = useStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadItems(search, status);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status, loadItems]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Inventory Management</h1>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border border-slate-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="healthy">Healthy</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm">
              <tr>
                <th className="p-4">Item Name & SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Stock Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && items.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading inventory...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No items found matching your criteria.</td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{item.category || '-'}</td>
                  <td className="p-4 text-right">
                    <span className="font-mono font-medium text-slate-800 text-lg">{item.quantity}</span>
                    <span className="text-slate-400 text-sm ml-1">/ {item.threshold} min</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      item.quantity === 0 ? 'bg-red-100 text-red-700' : 
                      item.is_low_stock ? 'bg-orange-100 text-orange-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.quantity === 0 ? 'Out of Stock' : item.is_low_stock ? 'Low Stock' : 'Healthy'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => setUpdateItem(item)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                    >
                      <Edit2 size={16}/> Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <AddItemModal 
          onClose={() => setIsAddOpen(false)} 
          onSubmit={async (data: any) => {
            await addItem(data);
            setIsAddOpen(false);
          }} 
          error={error}
        />
      )}

      {updateItem && (
        <UpdateStockModal 
          item={updateItem} 
          onClose={() => setUpdateItem(null)} 
          onSubmit={async (changeAmount: number, type: string, reason: string) => {
            await adjustStock(updateItem.id, changeAmount, type, reason);
            setUpdateItem(null);
          }}
          error={error}
        />
      )}
    </div>
  );
}

function AddItemModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', quantity: 0, threshold: 0, price: 0, supplier: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Add New Inventory Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
              <input required type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none" 
                     value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
              <input required type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none" 
                     value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <CategoryDropdown 
                value={formData.category} 
                onChange={val => setFormData({...formData, category: val})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Quantity *</label>
              <input required type="number" min="0" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none" 
                     value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Threshold *</label>
              <input required type="number" min="0" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none" 
                     value={formData.threshold} onChange={e => setFormData({...formData, threshold: parseInt(e.target.value)})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
              <input type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none" 
                     value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-primary text-white font-medium hover:bg-blue-600 rounded-lg transition-colors">Save Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateStockModal({ item, onClose, onSubmit }: any) {
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState('sale');
  const [reason, setReason] = useState('');

  const isDeduction = type === 'sale';
  const newStock = isDeduction ? item.quantity - amount : 
                   type === 'purchase' ? item.quantity + amount : 
                   item.quantity + amount; // adjustment can be positive or negative

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isDeduction ? -Math.abs(amount) : type === 'purchase' ? Math.abs(amount) : amount;
    onSubmit(finalAmount, type, reason);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Update Stock</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 p-4 bg-slate-50 rounded-lg flex justify-between items-center border border-slate-200">
            <div>
              <p className="font-semibold text-slate-800">{item.name}</p>
              <p className="text-sm text-slate-500 font-mono">{item.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium relative top-1">Current</p>
              <p className="text-2xl font-bold font-mono text-slate-800">{item.quantity}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Update Type</label>
              <select className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none" 
                      value={type} onChange={e => setType(e.target.value)}>
                <option value="sale">Sale (-) </option>
                <option value="purchase">Purchase (+)</option>
                <option value="adjustment">Manual Adjustment (+/-)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Amount (absolute magnitude)</label>
              <input required type="number" min="1" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none font-mono text-lg" 
                      value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} />
              
              <div className="mt-2 text-sm font-medium flex justify-between items-center bg-blue-50/50 p-2 rounded-md border border-blue-100 text-blue-800">
                 <span>Projected Stock:</span>
                 <span className={`font-mono font-bold ${newStock < 0 ? 'text-red-500' : ''}`}>{newStock}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason <span className="text-slate-400 font-normal">{type === 'adjustment' && '*'}</span></label>
              <textarea 
                required={type === 'adjustment'} 
                className="w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-primary outline-none resize-none" 
                rows={2} 
                value={reason} onChange={e => setReason(e.target.value)} 
                placeholder="Required for adjustments..."
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button disabled={newStock < 0 || amount === 0} type="submit" className="px-5 py-2 bg-primary disabled:opacity-50 text-white font-medium hover:bg-blue-600 rounded-lg transition-colors">
              Confirm Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
