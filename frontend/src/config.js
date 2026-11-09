// Shared frontend configuration
// All magic constants and environment-driven values live here.

// API base URL — uses relative '/api' so Vite proxy handles it seamlessly across all networks & devices
export const API_BASE = '/api';

// Low-stock threshold — items with quantity below this value are flagged as low stock.
// Update this single constant to change the threshold across the entire app.
export const LOW_STOCK_THRESHOLD = 5;
