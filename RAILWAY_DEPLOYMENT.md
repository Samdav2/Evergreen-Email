# Railway Deployment Guide — Evergreen Email

This repository is pre-configured for automated 1-click deployment on [Railway](https://railway.app).

---

## 🏗️ Architecture Overview

- **Frontend**: Vite + React 19 SPA compiled and served via Express on port `$PORT`.
- **Backend**: FastAPI (Python 3.12) running co-located on internal port `:8001` (managed via `start.sh`).
- **Proxy**: Express automatically proxies all `/api`, `/docs`, `/openapi.json` traffic to FastAPI internally.
- **Database**: PostgreSQL (Railway Postgres plugin) or SQLite fallback.

---

## 🚀 How to Deploy on Railway

### Option 1: Deploy via Railway CLI / GitHub Integration

1. **Push your code to GitHub** (or connect your local repo via Railway CLI):
   ```bash
   git add .
   git commit -m "Prepare project for Railway deployment"
   git push origin main
   ```

2. **Create a New Project on Railway**:
   - Go to [railway.app/new](https://railway.app/new).
   - Select **Deploy from GitHub repo**.
   - Select your `Evergreen-Email` repository.

3. **Add PostgreSQL Database (Recommended)**:
   - Click **+ New** in your Railway project canvas.
   - Select **Database** -> **Add PostgreSQL**.
   - Railway will automatically expose `DATABASE_URL` or `DATABASE_PRIVATE_URL` to your app service.

4. **Configure Environment Variables**:
   In your Service settings under **Variables**, set the following:

   | Variable | Description | Example |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | PostgreSQL connection URL (Auto-set if PostgreSQL plugin is added) | `postgresql://postgres:...@...railway.app:5432/railway` |
   | `RESEND_API_KEY` | Your API key from [Resend.com](https://resend.com) | `re_123456789...` |
   | `DEFAULT_FROM_EMAIL` | Sender email address (must be verified in Resend) | `onboarding@resend.dev` |
   | `DEFAULT_FROM_NAME` | Sender display name | `Evergreen Mail` |
   | `GEMINI_API_KEY` | *(Optional)* Google Gemini API Key | `AIzaSy...` |
   | `APP_URL` | Public Railway domain generated for your app | `https://your-app.up.railway.app` |

5. **Deploy**:
   - Railway will automatically detect `railway.json` / `nixpacks.toml` / `Dockerfile` and execute `bash start.sh`.
   - Once deployed, generate a Domain under **Service Settings -> Networking -> Public Networking** to access your app live on the web!

---

## 🛠️ Included Configuration Files

- **`railway.json`**: Specifies start command (`bash start.sh`) and health check path (`/`).
- **`nixpacks.toml`**: Configured dual runtime (`python312`, `nodejs_22`, `curl`, `gcc`).
- **`Dockerfile`**: Multi-stage production container build (Python 3.12 + Node.js 22).
- **`Procfile`**: Standard web process entrypoint (`web: bash start.sh`).
- **`start.sh`**: Dual-process orchestrator managing FastAPI (`:8001`) and Express (`:$PORT`).
