import { useEffect, useState } from 'react';
import { Tag, Search, CheckSquare, Square, Printer, Check } from 'lucide-react';
import { API_BASE } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

async function apiRequest(path) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  });
  if (res.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }
  const errorBody = !res.ok ? await res.json().catch(() => ({})) : null;
  if (!res.ok) throw new Error(errorBody?.message || `Request failed with status ${res.status}`);
  return res.json();
}

function PrintLabels() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    apiRequest('/items')
      .then((data) => { setItems(data); setSelected(new Set(data.map((i) => i._id))); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) =>
    !searchQuery || i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleItem = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i._id)));
    }
  };

  const printItems = items.filter((i) => selected.has(i._id));
  const handlePrint = () => window.print();

  return (
    <div className="pb-12">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-grid { display: grid !important; }
          body { margin: 0; background: white; }
        }
        @media screen { .print-grid { display: none; } }
      `}</style>

      {/* Print grid (Visible only during printing) */}
      <div className="print-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '16px' }}>
        {printItems.map((item) => (
          <div key={item._id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px', breakInside: 'avoid', textAlign: 'center', fontFamily: 'sans-serif' }}>
            {item.qrCode && <img src={item.qrCode} alt="QR" style={{ width: '100px', height: '100px', margin: '0 auto 8px' }} />}
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b' }}>{item.itemName}</div>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>📍 {item.location}</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Qty: {item.quantity}</div>
            <div style={{ fontSize: '7px', color: '#94a3b8', marginTop: '4px', wordBreak: 'break-all' }}>{item._id}</div>
          </div>
        ))}
      </div>

      {/* Screen UI */}
      <div className="no-print space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-3">
            <Tag className="text-brand-500" size={32} />
            Print QR Labels
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Select items and print a batch of QR labels</p>
        </header>

        {/* Controls Toolbar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input 
              placeholder="Search items..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              icon={Search} 
              containerClassName="!mb-0"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700">
            <span className="text-brand-600 dark:text-brand-400">{selected.size}</span>
            <span className="text-slate-500">/ {items.length}</span>
          </div>

          <Button variant="secondary" onClick={toggleAll} className="w-full sm:w-auto">
            {selected.size === filtered.length ? <Square size={18}/> : <CheckSquare size={18}/>}
            {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
          </Button>

          <Button variant="gradient" onClick={handlePrint} disabled={selected.size === 0} className="w-full sm:w-auto">
            <Printer size={18} /> Print Labels
          </Button>
        </div>

        {/* Item Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => {
              const isChecked = selected.has(item._id);
              return (
                <button
                  key={item._id}
                  onClick={() => toggleItem(item._id)}
                  className={`relative group rounded-2xl border-2 p-4 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                    isChecked
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-md shadow-brand-500/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isChecked && <Check size={14} strokeWidth={3} />}
                  </div>

                  {item.qrCode && (
                    <img src={item.qrCode} alt="QR" className="w-16 h-16 mx-auto mb-3 rounded-lg shadow-sm mix-blend-multiply dark:mix-blend-normal dark:bg-white p-1" />
                  )}
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">{item.itemName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">📍 {item.location}</p>
                  
                  <div className="mt-3 inline-block bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Qty: {item.quantity}
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center text-slate-400">
                <Search size={48} className="mb-4 opacity-50" />
                <p className="font-semibold">No items match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PrintLabels;
