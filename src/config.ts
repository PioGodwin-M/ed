// Configuration for API keys and environment variables
// This file handles environment variable access for both development and production

export const config = {
  get geminiApiKey(): string {
    // Try to get from import.meta.env (Vite)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env.VITE_GEMINI_API_KEY || '';
    }
    
    // Fallback for production builds
    // The build process should replace this with the actual value
    return '__VITE_GEMINI_API_KEY__';
  }
};
