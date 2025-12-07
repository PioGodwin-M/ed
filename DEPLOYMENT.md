# Deployment Guide

## Environment Setup

This project requires a Gemini API key to function. 

### Get Your API Key
1. Visit https://aistudio.google.com/apikey
2. Create or select a project
3. Generate an API key

### Local Development
1. Copy `.env.example` to `.env.local`
2. Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard
1. Push code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variable:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: Your Gemini API key
5. Deploy

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add VITE_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

## Important Notes

- The `vercel.json` file is already configured for Angular routing
- Environment variables must be prefixed with `VITE_` to be accessible in the browser
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The API key will be exposed in the browser bundle - this is expected for client-side apps
- Consider implementing rate limiting and usage monitoring in production

## Troubleshooting

### API Key Not Working
- Ensure the variable name is exactly `VITE_GEMINI_API_KEY`
- Restart the dev server after changing environment variables
- Check that the API key is valid at https://aistudio.google.com/apikey

### Build Errors on Vercel
- Verify all dependencies are in `package.json`
- Check that Node.js version is compatible (18.x or higher recommended)
- Review build logs in Vercel dashboard

### Routing Issues
- The `vercel.json` rewrites configuration handles Angular routing
- All routes redirect to `index.html` for client-side routing
