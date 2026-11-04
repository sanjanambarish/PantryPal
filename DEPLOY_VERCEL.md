# Deploying PantryPal AI to Vercel (Frontend)

## Step 1 – Deploy the Django Backend first

Vercel only hosts static sites / serverless. The Django backend must be deployed elsewhere.

**Recommended free option: Railway.app**

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo, choose the `backend/` folder
3. Add environment variables:
   ```
   DJANGO_SECRET_KEY=<generate a strong key>
   DEBUG=False
   COUCHDB_URL=<your CouchDB URL>
   COUCHDB_USER=admin
   COUCHDB_PASSWORD=<password>
   COUCHDB_DB=pantrypal
   ```
4. Railway will auto-detect Django and run `gunicorn pantrypal.wsgi`
5. Note your backend URL, e.g. `https://pantrypal-backend.up.railway.app`

**CouchDB: use CouchDB Cloud (IBM Cloudant free tier)**
→ [cloud.ibm.com/catalog/services/cloudant](https://cloud.ibm.com/catalog/services/cloudant)

---

## Step 2 – Deploy the Frontend to Vercel

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# From the frontend folder:
cd frontend
vercel

# Follow prompts:
# - Framework: Vite
# - Build command: npm run build
# - Output dir: dist
```

### Option B: Vercel Dashboard (easier)

1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
5. Deploy!

---

## Step 3 – Update vercel.json

Edit `frontend/vercel.json` and replace the placeholder:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://YOUR_BACKEND_URL/api/$1" },
    { "source": "/media/(.*)", "destination": "https://YOUR_BACKEND_URL/media/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Replace `YOUR_BACKEND_URL` with your actual Railway URL.

---

## Mobile Demo Tips

- The app is fully responsive and works on iOS Safari and Android Chrome.
- Add it to your iPhone/Android home screen for a native-app feel:
  - iOS: Safari → Share → "Add to Home Screen"
  - Android: Chrome → ⋮ menu → "Add to Home Screen"
- The dark theme automatically matches OLED screens (perfect on mobile).
- `viewport-fit=cover` ensures content reaches the edges on iPhone notch/Dynamic Island.

---

## CORS for Production

After deploying to Vercel, add your Vercel URL to Django ALLOWED_HOSTS:

```python
# backend/pantrypal/settings.py
ALLOWED_HOSTS = ["localhost", "your-backend.railway.app"]
CORS_ALLOWED_ORIGINS = ["https://your-app.vercel.app"]
```
