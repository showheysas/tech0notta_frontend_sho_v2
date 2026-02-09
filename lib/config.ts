// API Configuration
// Hardcoded for Azure deployment

const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('azurewebsites.net');

export const API_URL = isProduction 
  ? 'https://app-002-tech0notta-backend-dev.azurewebsites.net'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
