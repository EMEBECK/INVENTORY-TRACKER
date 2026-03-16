import { useEffect, useState } from 'react';
import { fetchActivityReports, fetchReportByDate } from '../api';
import { Calendar, ChevronRight, FileText, ArrowLeft, ArrowUpRight, ArrowDownRight, Edit, Plus } from 'lucide-react';
import { useStore } from '../store';

export default function ActivityLog() {
  const [reports, setReports] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const currency = useStore(state => state.settings.currency);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchActivityReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load activity reports', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetails = async (date: string) => {
    setLoading(true);
    try {
      const data = await fetchReportByDate(date);
      setCurrentReport(data);
      setSelectedDate(date);
    } catch (error) {
      console.error('Failed to load report details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (selectedDate) {
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <button 
          onClick={() => setSelectedDate(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Reports
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Daily Report: {selectedDate}</h2>
              <p className="text-slate-500">Overview of all inventory modifications</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              <span className="font-bold text-slate-700">{currentReport.length} Changes</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Time</th>
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4 text-right">Change</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentReport.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{log.item_name}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        log.update_type === 'sale' ? 'bg-orange-100 text-orange-700' : 
                        log.update_type === 'purchase' ? 'bg-green-100 text-green-700' :
                        log.update_type === 'Add Item' ? 'bg-blue-100 text-blue-700' :
                        log.update_type === 'Edit Item' ? 'bg-slate-100 text-slate-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {log.update_type === 'sale' && <ArrowDownRight size={12}/>}
                        {log.update_type === 'purchase' && <ArrowUpRight size={12}/>}
                        {log.update_type === 'Add Item' && <Plus size={12}/>}
                        {log.update_type === 'Edit Item' && <Edit size={12}/>}
                        {log.update_type}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${
                      log.change_amount > 0 ? 'text-green-600' : log.change_amount < 0 ? 'text-orange-600' : 'text-slate-400'
                    }`}>
                      {log.change_amount > 0 ? '+' : ''}{log.change_amount !== 0 ? log.change_amount : '-'}
                    </td>
                    <td className="p-4 text-right text-slate-600 font-mono">
                      {log.price_per_unit ? `${currency}${log.price_per_unit.toFixed(2)}` : '-'}
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${
                      log.total_amount > 0 ? 'text-green-600' : log.total_amount < 0 ? 'text-orange-600' : 'text-slate-400'
                    }`}>
                      {log.total_amount ? `${log.total_amount > 0 ? '+' : ''}${currency}${Math.abs(log.total_amount).toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Activity Reports</h1>
        <p className="text-slate-500 mt-1">Daily archives of all inventory modifications</p>
      </div>

      {loading && reports.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Reports Yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">Activity reports will appear here automatically once you start making changes to the inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((date) => (
            <button
              key={date}
              onClick={() => loadReportDetails(date)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                  <Calendar size={24} />
                </div>
                <div className="text-slate-300 group-hover:text-primary transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{date}</h3>
              <p className="text-slate-500 text-sm">Inventory Modification Report</p>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-2 text-primary font-bold text-sm">
                View Detailed Report
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
