export const environment = {
  production: true,
  geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || ''
};
