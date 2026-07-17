// Shared frontend configuration
// All magic constants and environment-driven values live here.

// API base URL — sourced from .env so it can differ between dev and production
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000/api';

// Low-stock threshold — items with quantity below this value are flagged as low stock.
// Update this single constant to change the threshold across the entire app.
export const LOW_STOCK_THRESHOLD = 5;
