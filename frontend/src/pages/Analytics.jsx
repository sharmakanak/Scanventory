import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Package, BarChart3, Tags, AlertTriangle, MapPin, CheckCircle2, PieChart as PieChartIcon } from 'lucide-react';
import { API_BASE, LOW_STOCK_THRESHOLD } from '../config';
import { Card, CardHeader } from '../components/ui/Card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

async function apiRequest(path) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  const errorBody = !res.ok ? await res.json().catch(() => ({})) : null;
  if (!res.ok) throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  return res.json();
}

function KpiCard({ icon: Icon, label, value, colorClass, bgClass }) {
  return (
    <Card className={`hover:-translate-y-1 transition-transform border-t-4 ${colorClass}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${bgClass}`}>
          <Icon size={32} />
        </div>
      </div>
    </Card>
  );
}

const CustomTooltipBar = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{label}</p>
      <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">{payload[0].value} units</p>
    </div>
  );
};

const CustomTooltipPie = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{payload[0].name}</p>
      <p className="text-lg font-extrabold" style={{ color: payload[0].fill }}>{payload[0].value} items</p>
    </div>
  );
};

function SkeletonCard() {
  return (
    <Card>
      <div className="h-3 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full w-24 mb-4" />
      <div className="h-9 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
    </Card>
  );
}

function Analytics() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/items')
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalItems = items.length;
  const totalStock = items.reduce((s, i) => s + i.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity < LOW_STOCK_THRESHOLD).length;
  const categories = [...new Set(items.map((i) => i.category))];

  const categoryData = categories.map((cat) => ({
    name: cat,
    stock: items.filter((i) => i.category === cat).reduce((s, i) => s + i.quantity, 0),
    count: items.filter((i) => i.category === cat).length,
  })).sort((a, b) => b.stock - a.stock);

  const locationMap = {};
  items.forEach((i) => { locationMap[i.location] = (locationMap[i.location] || 0) + 1; });
  const locationData = Object.entries(locationMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const lowStockItems = items
    .filter((i) => i.quantity < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-rose-50 dark:bg-rose-900/20 p-8 rounded-3xl border border-rose-200 dark:border-rose-800 text-center max-w-sm">
          <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
          <p className="text-rose-600 dark:text-rose-400 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="text-brand-500" size={32} />
          Analytics Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Insights and metrics for your inventory</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KpiCard icon={Package} label="Total Items" value={totalItems} colorClass="border-t-indigo-500" bgClass="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" />
            <KpiCard icon={BarChart3} label="Total Stock" value={totalStock} colorClass="border-t-emerald-500" bgClass="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
            <KpiCard icon={Tags} label="Categories" value={categories.length} colorClass="border-t-violet-500" bgClass="bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400" />
            <KpiCard icon={AlertTriangle} label="Low Stock" value={lowStockCount} colorClass="border-t-rose-500" bgClass="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 p-2 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <CardHeader title="Stock by Category" subtitle="Total units per category" className="mb-0" />
          </div>
          
          {loading ? (
            <div className="h-[260px] animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ) : categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-slate-400">
              <BarChart3 size={48} className="mb-2 opacity-50" />
              <p>No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltipBar />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Pie Chart */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
              <PieChartIcon size={24} />
            </div>
            <CardHeader title="Items by Location" subtitle="Distribution across storage areas" className="mb-0" />
          </div>

          {loading ? (
            <div className="h-[260px] animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ) : locationData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-slate-400">
              <MapPin size={48} className="mb-2 opacity-50" />
              <p>No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={locationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown List */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 p-2 rounded-xl">
              <Tags size={24} />
            </div>
            <CardHeader title="Category Breakdown" subtitle="Detailed stock levels" className="mb-0" />
          </div>
          
          <div className="space-y-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-32" />
                  <div className="h-2 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                </div>
              ))
            ) : categoryData.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No categories found.</p>
            ) : categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">{cat.name}</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2 whitespace-nowrap">
                      {cat.count} items · {cat.stock} units
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(100, (cat.stock / Math.max(1, totalStock)) * 100)}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock List */}
        <Card className="border-t-4 border-t-rose-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-2 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <CardHeader title="Low Stock Alerts" subtitle={`Items below ${LOW_STOCK_THRESHOLD} units`} className="mb-0" />
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />)
            ) : lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-emerald-500">
                <CheckCircle2 size={48} className="mb-2" />
                <p className="font-semibold">All items are well stocked!</p>
              </div>
            ) : (
              lowStockItems.map(item => (
                <div key={item._id} className="flex justify-between items-center p-3 rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{item.itemName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex gap-2">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><MapPin size={10}/>{item.location}</span>
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-black ${item.quantity === 0 ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                    {item.quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
