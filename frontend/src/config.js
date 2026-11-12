
// Shared frontend configuration

// API base URL
// Local development: Uses Vite proxy
// Production: Uses Render backend
export const API_BASE = `${
  import.meta.env.VITE_API_BASE_URL || ''
}/api`;

// Low-stock threshold
export const LOW_STOCK_THRESHOLD = 5;
