import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Tag, ArrowLeft, RefreshCw, Plus, Minus, 
  CheckCircle2, AlertTriangle, ScanLine, LogIn, ExternalLink,
  Barcode, Calendar, Clock, DollarSign
} from 'lucide-react';
import { API_BASE, LOW_STOCK_THRESHOLD } from '../config';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import CameraScanner from '../components/CameraScanner';

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  const loadItem = async () => {
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${API_BASE}/items/public/${id}`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Item not found in inventory.');
        throw new Error(`Failed to load item (status ${res.status})`);
      }
      const data = await res.json();
      setItem(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Connection timed out. Please verify your phone is connected to the same network.');
      } else {
        setError(err.message || 'Could not fetch item details.');
      }
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const handleAdjustQuantity = async (delta) => {
    if (!token) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/items/${id}/quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ delta })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to update quantity');
      }
      const updated = await res.json();
      setItem(prev => ({ ...prev, quantity: updated.quantity, updatedAt: updated.updatedAt }));
      setActionSuccess(`Quantity updated: ${updated.quantity}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleScanAnother = (scannedText) => {
    setShowScanner(false);
    if (!scannedText) return;
    // Extract ID if a full URL was scanned
    const match = scannedText.match(/\/item\/([a-fA-F0-9]{24})/i) || scannedText.match(/[a-fA-F0-9]{24}/);
    const newId = match ? match[1] || match[0] : scannedText.trim();
    if (newId) {
      navigate(`/item/${newId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading item information...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto my-12 p-4">
        <Card className="text-center p-8 space-y-6">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Item Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {error || 'The requested inventory item could not be found or may have been deleted.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Button variant="gradient" fullWidth onClick={() => setShowScanner(true)}>
              <ScanLine size={18} /> Scan Another QR Code
            </Button>
            <Link to="/">
              <Button variant="secondary" fullWidth>
                <ArrowLeft size={18} /> Back to Home
              </Button>
            </Link>
          </div>

          {showScanner && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <CameraScanner onScan={handleScanAnother} onClose={() => setShowScanner(false)} />
            </div>
          )}
        </Card>
      </div>
    );
  }

  const isLowStock = item.quantity < LOW_STOCK_THRESHOLD && item.quantity > 0;
  const isOutOfStock = item.quantity === 0;

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16 animate-fade-in">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link to={token ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <ArrowLeft size={18} />
          {token ? 'Back to Dashboard' : 'Scanventory Home'}
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowScanner(!showScanner)}
          className="text-brand-600 dark:text-brand-400"
        >
          <ScanLine size={16} /> Scan Next
        </Button>
      </div>

      {/* Live Scanner Modal / Inline view */}
      {showScanner && (
        <Card className="animate-slide-down border-2 border-brand-500/30">
          <CardHeader title="Scan QR Code" subtitle="Point camera at an item's QR code" />
          <CameraScanner onScan={handleScanAnother} onClose={() => setShowScanner(false)} />
        </Card>
      )}

      {/* Action alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-3 animate-fade-in font-medium">
          <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Main Item Card */}
      <Card noPadding className="overflow-hidden shadow-xl border-t-4 border-t-brand-500">
        
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-brand-50/30 dark:from-slate-800/60 dark:to-brand-950/20 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
              <Tag size={12} /> {item.category}
            </span>

            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 animate-pulse">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <AlertTriangle size={12} /> Low Stock (&lt;{LOW_STOCK_THRESHOLD})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 size={12} /> In Stock
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white break-words">
            {item.itemName}
          </h1>

          <div className="flex items-center gap-2 mt-2 text-slate-600 dark:text-slate-400 font-medium text-sm">
            <MapPin size={16} className="text-brand-500 flex-shrink-0" />
            <span>Located at: <strong className="text-slate-900 dark:text-slate-200">{item.location}</strong></span>
          </div>
        </div>

        {/* Stock Status & Quick Adjustment */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Current Stock Quantity</p>
              <p className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
                {item.quantity}
                <span className="text-sm font-semibold text-slate-400 ml-2">units</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Package size={36} />
            </div>
          </div>

          {/* Quick Stock Controls (If logged in as manager/staff) */}
          {token ? (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Staff Quick Adjustment</p>
              <div className="grid grid-cols-4 gap-2">
                <Button 
                  variant="secondary" 
                  disabled={updating || item.quantity <= 0} 
                  onClick={() => handleAdjustQuantity(-10)}
                  className="font-bold text-sm"
                >
                  -10
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={updating || item.quantity <= 0} 
                  onClick={() => handleAdjustQuantity(-1)}
                  className="font-bold text-sm"
                >
                  <Minus size={16} /> 1
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={updating} 
                  onClick={() => handleAdjustQuantity(1)}
                  className="font-bold text-sm"
                >
                  <Plus size={16} /> 1
                </Button>
                <Button 
                  variant="secondary" 
                  disabled={updating} 
                  onClick={() => handleAdjustQuantity(10)}
                  className="font-bold text-sm"
                >
                  +10
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <span className="text-slate-600 dark:text-slate-300">Are you a staff member managing stock?</span>
              <Link to="/login" className="shrink-0 w-full sm:w-auto">
                <Button variant="gradient" size="sm" fullWidth>
                  <LogIn size={15} /> Log In to Edit
                </Button>
              </Link>
            </div>
          )}

          {/* Item Metadata Details */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">Item Specifications</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {item.sku && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <span className="text-xs text-slate-400 block font-medium">SKU / Barcode</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5 mt-0.5">
                    <Barcode size={16} className="text-brand-500" /> {item.sku}
                  </span>
                </div>
              )}

              {item.unitPrice != null && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <span className="text-xs text-slate-400 block font-medium">Unit Price</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1 mt-0.5">
                    <DollarSign size={16} className="text-emerald-500" /> {Number(item.unitPrice).toFixed(2)}
                  </span>
                </div>
              )}

              {item.updatedAt && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <span className="text-xs text-slate-400 block font-medium">Last Stock Update</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5 mt-0.5">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(item.updatedAt).toLocaleDateString()} {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-400 block font-medium">System Item ID</span>
                <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 truncate block mt-0.5 select-all">
                  {item._id}
                </span>
              </div>
            </div>

            {item.description && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-400 block font-medium mb-1">Description</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
          </div>

          {/* QR Code Display & Share */}
          {item.qrCode && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 flex-shrink-0">
                <img src={item.qrCode} alt="Item QR Code" className="w-28 h-28 object-contain" />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Direct Mobile QR Code</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Scanning this QR code from any smartphone camera immediately opens this item's live details.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: item.itemName, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        setActionSuccess('Link copied to clipboard!');
                        setTimeout(() => setActionSuccess(''), 2500);
                      }
                    }}
                  >
                    Share / Copy Link
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}

export default ItemDetails;
