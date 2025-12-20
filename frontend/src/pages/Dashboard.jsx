import { useEffect, useState } from 'react';
import QRCard from '../components/QRCard';

const API_BASE = 'http://localhost:5000/api';

// Simple helper to call backend with JWT token
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

        // If unauthorized, clear token and redirect to login
        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        throw new Error(errorBody.message || 'Request failed');
    }

    return res.json();
}

function Dashboard() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        itemName: '',
        category: '',
        quantity: 0,
        location: '',
    });

    const [scannedItemId, setScannedItemId] = useState('');
    const [scannedItem, setScannedItem] = useState(null);
    const [quantityInput, setQuantityInput] = useState('');

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [quantityFilter, setQuantityFilter] = useState('all'); // 'all' or 'low'
    const [toast, setToast] = useState(null);
    const [previousQuantities, setPreviousQuantities] = useState({});

    // Fetch all items from backend
    const loadItems = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiRequest('/items');
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    // Track quantities after loading items to detect low stock changes
    useEffect(() => {
        if (items.length > 0) {
            items.forEach((item) => {
                const prevQty = previousQuantities[item._id];
                const currentQty = item.quantity;

                // Check if item just reached low stock threshold (was >= 5, now < 5)
                if (prevQty !== undefined && prevQty >= 5 && currentQty < 5) {
                    showToast(`⚠️ Low Stock Alert: ${item.itemName} has ${currentQty} items remaining!`, 'warning');
                }
            });

            // Update previous quantities
            const newPreviousQuantities = {};
            items.forEach((item) => {
                newPreviousQuantities[item._id] = item.quantity;
            });
            setPreviousQuantities(newPreviousQuantities);
        }
    }, [items]);

    // Toast notification function
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 5000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'quantity' ? Number(value) : value,
        }));
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await apiRequest('/items', {
                method: 'POST',
                body: JSON.stringify(form),
            });

            // Check if new item has low stock
            if (form.quantity < 5) {
                showToast(`⚠️ Low Stock Alert: ${form.itemName} was added with only ${form.quantity} items!`, 'warning');
            }

            setForm({
                itemName: '',
                category: '',
                quantity: 0,
                location: '',
            });
            await loadItems();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleQuantityChange = async (id, delta) => {
        setError('');
        try {
            await apiRequest(`/items/${id}/quantity`, {
                method: 'PATCH',
                body: JSON.stringify({ delta }),
            });
            await loadItems();
            if (scannedItem && scannedItem._id === id) {
                // refresh scanned item details as well
                const updated = await apiRequest(`/items/${id}`);
                setScannedItem(updated);
                setQuantityInput(updated.quantity.toString()); // Update quantity input
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleScanInputChange = (e) => {
        setScannedItemId(e.target.value.trim());
    };

    const handleLoadScannedItem = async () => {
        if (!scannedItemId) return;

        // Check if the item is already loaded
        if (scannedItem && scannedItem._id === scannedItemId) {
            showToast('Item already loaded', 'info');
            return;
        }

        setError('');
        try {
            const item = await apiRequest(`/items/${scannedItemId}`);
            setScannedItem(item);
            setQuantityInput(item.quantity.toString()); // Initialize quantity input
        } catch (err) {
            setScannedItem(null);
            setQuantityInput('');
            setError(err.message);
        }
    };

    // Handle manual quantity update for scanned item
    const handleQuantityInputChange = (e) => {
        const value = e.target.value;
        // Allow empty string, numbers, and negative numbers
        if (value === '' || /^-?\d*$/.test(value)) {
            setQuantityInput(value);
        }
    };

    const handleQuantityInputBlur = async () => {
        if (!scannedItem || quantityInput === '') return;

        const newQuantity = parseInt(quantityInput, 10);

        // Validate input
        if (isNaN(newQuantity) || newQuantity < 0) {
            setQuantityInput(scannedItem.quantity.toString());
            showToast('Invalid quantity. Please enter a number >= 0', 'warning');
            return;
        }

        // Calculate delta
        const delta = newQuantity - scannedItem.quantity;

        if (delta === 0) {
            // No change needed
            return;
        }

        // Update quantity
        await handleQuantityChange(scannedItem._id, delta);
    };

    const handleQuantityInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Trigger blur to save
        }
    };

    // Filter items based on search and filters
    const filteredItems = items.filter((item) => {
        // Search filter (case-insensitive)
        const matchesSearch = searchQuery === '' ||
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase());

        // Location filter
        const matchesLocation = locationFilter === 'all' || item.location === locationFilter;

        // Quantity filter
        const matchesQuantity = quantityFilter === 'all' ||
            (quantityFilter === 'low' && item.quantity < 5);

        return matchesSearch && matchesLocation && matchesQuantity;
    });

    // Get unique locations for filter dropdown
    const uniqueLocations = [...new Set(items.map((item) => item.location))].sort();

    // Calculate stats based on filtered items
    const totalItems = filteredItems.length;
    const lowStockItems = filteredItems.filter((item) => item.quantity < 5).length;
    const totalQuantity = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50  via-indigo-50/40 to-purple-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Premium Header */}
                <header className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                                    <span className="text-3xl">📦</span>
                                </div>
                                <div>
                                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 tracking-tight">
                                        Scanventory
                                    </h1>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                        A QR Code Based Inventory Management System
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={loadItems}
                            disabled={loading}
                            className="hidden sm:flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-slate-200 hover:border-blue-300 disabled:opacity-50"
                        >
                            <span className={loading ? 'animate-spin text-lg' : 'text-lg'}>🔄</span>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {/* Premium Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="group bg-white rounded-2xl p-6 shadow-xl border-2 border-slate-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Items</p>
                                    <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalItems}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">📋</span>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-white rounded-2xl p-6 shadow-xl border-2 border-slate-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Total Stock</p>
                                    <p className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalQuantity}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">📊</span>
                                </div>
                            </div>
                        </div>
                        <div className="group bg-white rounded-2xl p-6 shadow-xl border-2 border-red-100 hover:shadow-2xl hover:border-red-300 transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Low Stock</p>
                                    <p className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{lowStockItems}</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl p-4 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">⚠️</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Premium Error Alert */}
                {error && (
                    <div className="mb-6 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 text-sm text-red-800 shadow-xl flex items-center gap-3 backdrop-blur-sm">
                        <span className="text-2xl animate-pulse">❌</span>
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 rounded-2xl border-2 px-6 py-4 text-sm font-semibold shadow-2xl backdrop-blur-sm animate-fade-in ${toast.type === 'warning'
                        ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-800'
                        : 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800'
                        }`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{toast.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                            <span>{toast.message}</span>
                            <button
                                onClick={() => setToast(null)}
                                className="ml-2 text-slate-500 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <main className="space-y-6">
                    {/* Premium Add Item Form */}
                    <section className="flex justify-center">
                        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-slate-200/50 hover:shadow-3xl hover:border-blue-300 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                                    <span className="text-2xl">➕</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Add New Item</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Create a new inventory entry</p>
                                </div>
                            </div>
                            <form className="space-y-5" onSubmit={handleCreateItem}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Item Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="itemName"
                                        value={form.itemName}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                        placeholder="e.g. USB Cable"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                        placeholder="e.g. Electronics"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={form.quantity}
                                        min={0}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                        placeholder="e.g. Shelf A2"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-sm font-bold text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    ✨ Save Item & Generate QR
                                </button>
                            </form>
                        </div>
                    </section>

                    {/* Premium Items List */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between gap-2 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-3 shadow-lg">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Inventory Items</h2>
                                    {filteredItems.length > 0 && (
                                        <span className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold mt-2 border border-blue-200">
                                            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} {searchQuery || locationFilter !== 'all' || quantityFilter !== 'all' ? 'found' : 'in stock'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={loadItems}
                                disabled={loading}
                                className="sm:hidden flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-md hover:shadow-lg transition-all duration-200 border border-slate-200 disabled:opacity-50"
                            >
                                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>

                        {/* Search and Filter Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-slate-200/50 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search Bar */}
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        🔍 Search Items
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by item name..."
                                            className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 pl-10 text-sm font-medium transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Location Filter */}
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        📍 Filter by Location
                                    </label>
                                    <select
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm font-medium transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400 bg-white"
                                    >
                                        <option value="all">All Locations</option>
                                        {uniqueLocations.map((location) => (
                                            <option key={location} value={location}>
                                                {location}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity Filter */}
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        📊 Filter by Quantity
                                    </label>
                                    <select
                                        value={quantityFilter}
                                        onChange={(e) => setQuantityFilter(e.target.value)}
                                        className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm font-medium transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400 bg-white"
                                    >
                                        <option value="all">All Items</option>
                                        <option value="low">Low Stock (&lt; 5)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {(searchQuery || locationFilter !== 'all' || quantityFilter !== 'all') && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-600">Active Filters:</span>
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Search: "{searchQuery}" <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-blue-900">✕</button>
                                        </span>
                                    )}
                                    {locationFilter !== 'all' && (
                                        <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Location: {locationFilter} <button onClick={() => setLocationFilter('all')} className="ml-1 hover:text-indigo-900">✕</button>
                                        </span>
                                    )}
                                    {quantityFilter !== 'all' && (
                                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Low Stock <button onClick={() => setQuantityFilter('all')} className="ml-1 hover:text-red-900">✕</button>
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setLocationFilter('all');
                                            setQuantityFilter('all');
                                        }}
                                        className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>

                        {loading && items.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border-2 border-slate-200 text-center">
                                <div className="animate-spin text-5xl mb-4">⏳</div>
                                <p className="text-slate-600 font-semibold text-lg">Loading inventory...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-3xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-2xl">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50">
                                        <tr>
                                            <th className="px-6 py-5 text-left text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                                                Item
                                            </th>
                                            <th className="px-6 py-5 text-left text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                                                Category
                                            </th>
                                            <th className="px-6 py-5 text-left text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                                                Location
                                            </th>
                                            <th className="px-6 py-5 text-center text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-5 text-center text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                                                QR Code
                                            </th>
                                            <th className="px-6 py-5 text-center text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {filteredItems.map((item) => (
                                            <tr
                                                key={item._id}
                                                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                                            >
                                                <td className={`px-6 py-4 whitespace-nowrap ${item.quantity < 5 ? 'bg-red-50/30' : ''}`}>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-bold ${item.quantity < 5 ? 'text-red-700' : 'text-slate-900'}`}>
                                                            {item.itemName}
                                                        </span>
                                                        {item.quantity < 5 && (
                                                            <span className="mt-2 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border-2 border-red-300 animate-pulse shadow-md">
                                                                ⚠️ LOW STOCK
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                        📍 {item.location}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span
                                                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ${item.quantity < 5
                                                            ? 'bg-red-100 text-red-700'
                                                            : item.quantity < 10
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {item.qrCode && (
                                                        <div className="flex justify-center">
                                                            <QRCard qrCodeDataUrl={item.qrCode} itemId={item._id} size="small" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(item._id, -1)}
                                                            className="rounded-lg border-2 border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 active:scale-95"
                                                            disabled={item.quantity === 0}
                                                            title="Decrease quantity"
                                                        >
                                                            ➖ -1
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuantityChange(item._id, 1)}
                                                            className="rounded-lg border-2 border-green-300 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100 hover:border-green-400 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                                            title="Increase quantity"
                                                        >
                                                            ➕ +1
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredItems.length === 0 && !loading && (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-12 text-center"
                                                >
                                                    <div className="flex flex-col items-center gap-3">
                                                        <span className="text-5xl">🔍</span>
                                                        <p className="text-slate-500 font-medium text-lg">
                                                            {items.length === 0
                                                                ? 'No items in inventory yet'
                                                                : 'No items match your filters'
                                                            }
                                                        </p>
                                                        <p className="text-slate-400 text-sm">
                                                            {items.length === 0
                                                                ? 'Add your first item using the form above'
                                                                : 'Try adjusting your search or filter criteria'
                                                            }
                                                        </p>
                                                        {(searchQuery || locationFilter !== 'all' || quantityFilter !== 'all') && (
                                                            <button
                                                                onClick={() => {
                                                                    setSearchQuery('');
                                                                    setLocationFilter('all');
                                                                    setQuantityFilter('all');
                                                                }}
                                                                className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                                                            >
                                                                Clear Filters
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Premium QR Scan Section */}
                    <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl border-2 border-emerald-200/50 p-8 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-3 shadow-lg">
                                <span className="text-3xl">📷</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    QR Code Scanner
                                </h3>
                                <p className="text-sm text-slate-600 font-medium mt-1">
                                    Enter or paste Item ID to load item details instantly
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={scannedItemId}
                                onChange={handleScanInputChange}
                                onKeyPress={(e) => e.key === 'Enter' && handleLoadScannedItem()}
                                placeholder="Paste scanned item ID here..."
                                className="flex-1 rounded-lg border-2 border-emerald-300 px-4 py-3 text-sm font-medium transition-all duration-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 hover:border-emerald-400"
                            />
                            <button
                                type="button"
                                onClick={handleLoadScannedItem}
                                className="rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-3 text-sm font-bold text-white shadow-xl hover:shadow-2xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                                🔍 Load Item
                            </button>
                        </div>

                        {scannedItem && (
                            <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-emerald-300/50 p-6 shadow-2xl animate-fade-in">
                                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-3 shadow-lg">
                                                <span className="text-2xl">✅</span>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                                    {scannedItem.itemName}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                                                        {scannedItem.category}
                                                    </span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-sm text-slate-600 font-semibold">
                                                        📍 {scannedItem.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-6 flex-wrap">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current Stock</p>
                                                    <p className={`text-3xl font-extrabold ${scannedItem.quantity < 5 ? 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent' :
                                                        scannedItem.quantity < 10 ? 'bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent' :
                                                            'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
                                                        }`}>
                                                        {scannedItem.quantity}
                                                    </p>
                                                </div>
                                                {scannedItem.quantity < 5 && (
                                                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl px-4 py-2 shadow-lg">
                                                        <p className="text-xs font-bold text-red-700">⚠️ Low Stock Alert</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quantity Input Field */}
                                            <div className="flex items-center gap-3">
                                                <label className="text-sm font-bold text-slate-700 whitespace-nowrap">
                                                    Update Quantity:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={quantityInput}
                                                    onChange={handleQuantityInputChange}
                                                    onBlur={handleQuantityInputBlur}
                                                    onKeyPress={handleQuantityInputKeyPress}
                                                    className="w-28 rounded-lg border-2 border-emerald-300 px-3 py-2 text-base font-bold text-slate-900 bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 hover:border-emerald-400 transition-all duration-200 text-center"
                                                    placeholder="Qty"
                                                />
                                                <span className="text-xs text-slate-500">(Press Enter to save)</span>
                                            </div>
                                        </div>
                                    </div>
                                    {scannedItem.qrCode && (
                                        <div className="flex flex-col items-center gap-3">
                                            <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">QR Code</p>
                                            <QRCard qrCodeDataUrl={scannedItem.qrCode} itemId={scannedItem._id} size="large" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
