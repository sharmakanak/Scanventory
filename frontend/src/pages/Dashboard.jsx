import { useEffect, useState } from 'react';
import QRCard from '../components/QRCard';
import { Package, Search, Download, RefreshCw, AlertTriangle, Plus, MapPin, Tag, Database, ScanLine, X, Minus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';
import { API_BASE } from '../config';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

function QuantityCell({ item, onChange, className = "w-24 text-base" }) {
  const [val, setVal] = useState(item.quantity);

  useEffect(() => {
    setVal(item.quantity);
  }, [item.quantity]);

  const handleBlur = () => {
    const newQty = parseInt(val, 10);
    if (isNaN(newQty) || newQty < 0) {
      setVal(item.quantity);
      return;
    }
    if (newQty !== item.quantity) {
      onChange(item._id, newQty - item.quantity);
    }
  };

  return (
    <input
      type="number"
      min="0"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-center font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all ${className}`}
    />
  );
}
function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ itemName: '', category: '', quantity: 0, location: '' });
  const [scannedItemId, setScannedItemId] = useState('');
  const [scannedItem, setScannedItem] = useState(null);
  const [quantityInput, setQuantityInput] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [quantityFilter, setQuantityFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [previousQuantities, setPreviousQuantities] = useState({});

  const loadItems = async () => {
    setLoading(true); setError('');
    try {
      const data = await apiRequest('/items');
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  useEffect(() => {
    if (items.length > 0) {
      items.forEach((item) => {
        const prevQty = previousQuantities[item._id];
        if (prevQty !== undefined && prevQty >= 5 && item.quantity < 5) {
          showToast(`⚠️ Low Stock Alert: ${item.itemName} has ${item.quantity} items remaining!`, 'warning');
        }
      });
      const newPreviousQuantities = {};
      items.forEach((item) => { newPreviousQuantities[item._id] = item.quantity; });
      setPreviousQuantities(newPreviousQuantities);
    }
  }, [items]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      showToast('No items to export', 'warning');
      return;
    }
    const headers = ['Item Name', 'Category', 'Quantity', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => `"${item.itemName.replace(/"/g, '""')}","${item.category.replace(/"/g, '""')}",${item.quantity},"${item.location.replace(/"/g, '""')}"`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'scanventory_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.name === 'quantity' ? Number(e.target.value) : e.target.value }));

  const handleCreateItem = async (e) => {
    e.preventDefault(); setError('');
    try {
      await apiRequest('/items', { method: 'POST', body: JSON.stringify(form) });
      if (form.quantity < 5) showToast(`⚠️ Low Stock Alert: ${form.itemName} was added with only ${form.quantity} items!`, 'warning');
      setForm({ itemName: '', category: '', quantity: 0, location: '' });
      await loadItems();
    } catch (err) { setError(err.message); }
  };

  const handleQuantityChange = async (id, delta) => {
    setError('');
    try {
      await apiRequest(`/items/${id}/quantity`, { method: 'PATCH', body: JSON.stringify({ delta }) });
      await loadItems();
      if (scannedItem && scannedItem._id === id) {
        const updated = await apiRequest(`/items/${id}`);
        setScannedItem(updated);
        setQuantityInput(updated.quantity.toString());
      }
    } catch (err) { setError(err.message); }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this item?')) return;
    setError('');
    try {
      await apiRequest(`/items/${id}`, { method: 'DELETE' });
      showToast('Item deleted successfully.', 'info');
      if (scannedItem && scannedItem._id === id) {
        setScannedItem(null);
        setScannedItemId('');
      }
      await loadItems();
    } catch (err) { setError(err.message); }
  };

  const handleLoadScannedItem = async () => {
    if (!scannedItemId) return;
    if (scannedItem && scannedItem._id === scannedItemId) { showToast('Item already loaded', 'info'); return; }
    setError('');
    try {
      const item = await apiRequest(`/items/${scannedItemId}`);
      setScannedItem(item);
      setQuantityInput(item.quantity.toString());
    } catch (err) {
      setScannedItem(null); setQuantityInput(''); setError(err.message);
    }
  };

  const handleQuantityInputBlur = async () => {
    if (!scannedItem || quantityInput === '') return;
    const newQuantity = parseInt(quantityInput, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      setQuantityInput(scannedItem.quantity.toString());
      showToast('Invalid quantity.', 'warning');
      return;
    }
    const delta = newQuantity - scannedItem.quantity;
    if (delta !== 0) await handleQuantityChange(scannedItem._id, delta);
  };

  const filteredItems = items.filter((item) => {
    return (searchQuery === '' || item.itemName.toLowerCase().includes(searchQuery.toLowerCase())) &&
           (locationFilter === 'all' || item.location === locationFilter) &&
           (quantityFilter === 'all' || (quantityFilter === 'low' && item.quantity < 5));
  });

  const uniqueLocations = [...new Set(items.map((item) => item.location))].sort();

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="text-brand-500" size={32} />
            Inventory Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={18} /> Export
          </Button>
          <Button variant="gradient" onClick={loadItems} isLoading={loading}>
            <RefreshCw size={18} /> Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-400 animate-fade-in">
          <AlertTriangle size={24} />
          <span className="font-medium">{error}</span>
        </div>
      )}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-2xl border flex items-center gap-3 shadow-2xl animate-slide-up ${
          toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-brand-50 border-brand-200 text-brand-800'
        }`}>
          {toast.type === 'warning' ? <AlertTriangle size={20} /> : <Package size={20} />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)}><X size={16}/></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:-translate-y-1 transition-transform border-t-4 border-t-brand-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Items</p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{filteredItems.length}</p>
            </div>
            <div className="p-4 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-2xl"><Database size={32}/></div>
          </div>
        </Card>
        <Card className="hover:-translate-y-1 transition-transform border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Stock</p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{filteredItems.reduce((s, i) => s + i.quantity, 0)}</p>
            </div>
            <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Package size={32}/></div>
          </div>
        </Card>
        <Card className="hover:-translate-y-1 transition-transform border-t-4 border-t-rose-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Low Stock</p>
              <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{filteredItems.filter(i => i.quantity < 5).length}</p>
            </div>
            <div className="p-4 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl"><AlertTriangle size={32}/></div>
          </div>
        </Card>
      </div>

      {/* Vertical Single-Column Layout */}
      <div className="flex flex-col gap-8">
        
        {/* 1. Add New Item */}
        <Card>
          <CardHeader title="Add New Item" subtitle="Create a new inventory entry" />
          <form onSubmit={handleCreateItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Input label="Item Name" name="itemName" value={form.itemName} onChange={handleChange} required placeholder="e.g. USB Cable" icon={Tag} />
            <Input label="Category" name="category" value={form.category} onChange={handleChange} required placeholder="e.g. Electronics" icon={Database} />
            <Input label="Quantity" name="quantity" type="number" min={0} value={form.quantity} onChange={handleChange} required icon={Package} />
            <Input label="Location" name="location" value={form.location} onChange={handleChange} required placeholder="e.g. Shelf A2" icon={MapPin} />
            <div className="lg:col-span-4 mt-4 flex justify-center">
              <Button type="submit" variant="gradient" className="w-full sm:w-auto px-12">
                <Plus size={18} /> Add Item
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Inventory List (Table) */}
        <Card noPadding className="relative z-0">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <CardHeader title="Inventory List" subtitle="Manage and filter your items" className="mb-0" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Search..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} icon={Search} />
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full rounded-xl border bg-white dark:bg-slate-900/50 px-4 py-2.5 text-sm outline-none border-slate-200 dark:border-slate-700">
                <option value="all">All Locations</option>
                {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={quantityFilter} onChange={(e) => setQuantityFilter(e.target.value)} className="w-full rounded-xl border bg-white dark:bg-slate-900/50 px-4 py-2.5 text-sm outline-none border-slate-200 dark:border-slate-700">
                <option value="all">All Quantities</option>
                <option value="low">Low Stock (&lt;5)</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-visible pb-12">
            <table className="w-full text-left border-collapse relative">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-semibold">Item</th>
                  <th className="p-4 font-semibold text-center w-40">QR & ID</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold text-center">Stock</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredItems.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {item.itemName}
                        {item.quantity < 5 && <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">LOW</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-center justify-center gap-3">
                        {item.qrCode ? (
                          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
                            <img src={item.qrCode} alt="QR Code" className="w-24 h-24 object-contain" />
                          </div>
                        ) : (
                          <div className="w-28 h-28 flex items-center justify-center text-slate-300 bg-slate-100 rounded-xl"><Package size={32}/></div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                          <code 
                            className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-[110px] text-center truncate cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors select-all shadow-sm"
                            title={item._id}
                            onClick={() => {
                              navigator.clipboard.writeText(item._id);
                              showToast('ID copied to clipboard!', 'info');
                            }}
                          >
                            {item._id}
                          </code>
                          <span className="text-[9px] text-slate-400 font-medium">Click to copy</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{item.location}</td>
                    <td className="p-4 text-center">
                      <QuantityCell item={item} onChange={handleQuantityChange} className="w-20 text-sm py-1.5" />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={() => handleDeleteItem(item._id)}><Trash2 size={18}/></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      <Package size={48} className="mx-auto text-slate-300 mb-3" />
                      <p>No items found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 3. Quick Scan */}
        <Card>
          <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Quick Scan</h3>
              <p className="text-sm text-slate-500 mt-1">Load and manage a specific item by QR ID</p>
            </div>
            
            <div className="flex gap-3 w-full">
              <div className="flex-1">
                <Input 
                  placeholder="Enter Item ID..." 
                  value={scannedItemId} 
                  onChange={(e) => setScannedItemId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLoadScannedItem()}
                  icon={ScanLine}
                />
              </div>
              <Button onClick={handleLoadScannedItem} variant="primary" className="px-8"><Search size={20}/></Button>
            </div>
            
            {scannedItem && (
              <div className="mt-8 p-8 w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-8">
                {/* Left Side: Details */}
                <div className="flex-1 w-full text-left">
                  <h4 className="font-bold text-3xl mb-2 text-slate-900 dark:text-white">{scannedItem.itemName}</h4>
                  <div className="flex items-center gap-6 text-sm text-slate-500 mb-8">
                    <span className="flex items-center gap-1.5"><Tag size={16} className="text-brand-500"/> {scannedItem.category}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-accent-500"/> {scannedItem.location}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                    <span className="font-medium text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs">Current Stock</span>
                    <div className="flex items-center gap-4">
                      <QuantityCell item={scannedItem} onChange={handleQuantityChange} className="w-28 h-12 text-xl" />
                    </div>
                  </div>
                </div>

                {/* Right Side: QR Code */}
                <div className="flex-shrink-0 flex flex-col justify-center items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <QRCard qrCodeDataUrl={scannedItem.qrCode} itemId={scannedItem._id} size="medium" />
                  <code className="text-xs mt-3 font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md select-all text-center">
                    {scannedItem._id}
                  </code>
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

export default Dashboard;
