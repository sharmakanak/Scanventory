import { useEffect, useState } from 'react';
import { API_BASE } from '../config';

/* ── Action metadata ─────────────────────────────────────────────── */
const ACTION_META = {
    created:          { icon: '✨', label: 'Item Added',    dot: 'bg-emerald-500', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-700' },
    updated:          { icon: '✏️', label: 'Details Edited', dot: 'bg-blue-500',    color: 'text-blue-700 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30',     border: 'border-blue-200 dark:border-blue-700'    },
    deleted:          { icon: '🗑️', label: 'Item Deleted',  dot: 'bg-rose-500',    color: 'text-rose-700 dark:text-rose-400',    bg: 'bg-rose-50 dark:bg-rose-900/30',     border: 'border-rose-200 dark:border-rose-700'    },
    quantity_changed: { icon: '🔢', label: 'Stock Changed', dot: 'bg-violet-500',   color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-200 dark:border-violet-700' },
};

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * ItemHistoryModal — slide-in modal with a vertical timeline layout.
 * Props: itemId, itemName, onClose
 */
function ItemHistoryModal({ itemId, itemName, onClose }) {
    const [logs, setLogs]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE}/items/${itemId}/history`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then(setLogs)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [itemId]);

    return (
        /* backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[82vh] animate-spring-in">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-2.5 shadow-lg shadow-violet-200/50 dark:shadow-violet-900/50">
                            <span className="text-lg">📋</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Activity History</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] mt-0.5">{itemName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold transition-all"
                        aria-label="Close"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                    </button>
                </div>

                {/* Timeline content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading && (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="text-rose-600 dark:text-rose-400 text-sm font-semibold text-center py-8">
                            ❌ {error}
                        </div>
                    )}

                    {!loading && !error && logs.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-2xl">📭</div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No activity recorded yet.</p>
                        </div>
                    )}

                    {/* Vertical timeline */}
                    {logs.length > 0 && (
                        <div className="relative">
                            {/* Connector line */}
                            <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-violet-300 via-slate-200 to-transparent dark:from-violet-700 dark:via-slate-700" />

                            <div className="space-y-4">
                                {logs.map((log, idx) => {
                                    const meta = ACTION_META[log.action] || ACTION_META.updated;
                                    return (
                                        <div key={log._id} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                                            {/* Timeline dot */}
                                            <div className="relative flex-shrink-0 mt-1">
                                                <div className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center text-lg z-10 relative shadow-sm`}>
                                                    {meta.icon}
                                                </div>
                                                <div className={`absolute top-1 left-1 w-2 h-2 rounded-full ${meta.dot}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800/60 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-700/60">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <span className={`text-sm font-bold ${meta.color}`}>{meta.label}</span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{timeAgo(log.createdAt)}</span>
                                                </div>

                                                {log.action === 'quantity_changed' && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        <span className={log.delta > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                                                            {log.delta > 0 ? `+${log.delta}` : log.delta} units
                                                        </span>
                                                        {' · '}Stock now: <strong className="text-slate-700 dark:text-slate-300">{log.quantityAfter}</strong>
                                                    </p>
                                                )}
                                                {log.action === 'created' && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">Initial stock: <strong className="text-slate-700 dark:text-slate-300">{log.quantityAfter}</strong></p>
                                                )}
                                                {log.action === 'updated' && (
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">Item details were updated</p>
                                                )}

                                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                    {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ItemHistoryModal;
