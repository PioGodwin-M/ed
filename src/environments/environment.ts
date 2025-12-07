export const environment = {
  production: false,
  geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || ''
};
