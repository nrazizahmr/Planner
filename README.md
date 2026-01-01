<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EKRaXBz_RHgKzMFpgzW4PvMoCl2trMd9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel (free)

Recommended: deploy the frontend to Vercel and use the included serverless API for AI calls.

- Connect this repository to Vercel (via GitHub/GitLab/Bitbucket) or use the `vercel` CLI.
- Set Environment Variables in the Vercel project settings:

   - `GEMINI_API_KEY` (your Gemini API key)
   - `AI_MODEL` (optional, e.g. `claude-haiku-4.5`)

- Vercel will run `npm run build` and publish the `dist` folder. The API endpoint is available at `/api/extractPlaceInfo`.

Quick deploy with Vercel CLI:

```bash
npm install -g vercel
vercel login
vercel --prod
```

After first deploy, open your Vercel dashboard, go to Project → Settings → Environment Variables, and add `GEMINI_API_KEY` and `AI_MODEL` for the `Production` environment.

Notes:
- The repository contains a `main.py` Streamlit app — Streamlit cannot be hosted on Vercel free. If you need the Streamlit UI publicly accessible, use Streamlit Cloud or Render for the Python app.
- The included `api/extractPlaceInfo.js` is a Node serverless function using `@google/genai` and will run on Vercel (free) as long as you set the `GEMINI_API_KEY` env var.
