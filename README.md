<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1_lxrSigu-LBDacWhmOoLeRv6uq_YcLGj

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key to `.env.local`:
     ```
     VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
     ```
   - Get your API key from: https://aistudio.google.com/apikey

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your project to Vercel:
   - Go to https://vercel.com/new
   - Import your repository
   - Vercel will auto-detect the Angular framework

3. Add environment variable:
   - In Vercel project settings, go to "Environment Variables"
   - Add `VITE_GEMINI_API_KEY` with your Gemini API key
   - Make sure to add it for Production, Preview, and Development environments

4. Deploy:
   - Click "Deploy"
   - Your app will be live at `your-project.vercel.app`

### Quick Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL&env=VITE_GEMINI_API_KEY&envDescription=Gemini%20API%20Key%20from%20Google%20AI%20Studio&envLink=https://aistudio.google.com/apikey)
