// Centralized API configuration
export const API_BASE_URL =import.meta.env.VITE_API_BASE_URL || "https://api.coinsafe.network/api";

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;
};
