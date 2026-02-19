# Deployment to Render - Complete Setup Guide

## Quick Summary
You need to deploy **ONE service** (Backend) that serves both the API and the built frontend.

## Step 1: Push to GitHub
Push your entire project (with the `build/` folder) to GitHub.

```bash
git add .
git commit -m "Ready for deployment"
git push
```

## Step 2: Deploy on Render (Single Service)

1. Go to [https://render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `expenses-app` (or your choice)
   - **Root Directory**: Leave blank (root of repo) or `backend`
   - **Runtime**: Node
   - **Build Command**: 
     ```
     cd frontend && npm install && npm run build && cd ../backend && npm install
     ```
   - **Start Command**: 
     ```
     cd backend && npm start
     ```

5. **Environment Variables** (if needed):
   ```
   REACT_APP_API_URL=/api
   NODE_ENV=production
   ```

6. Click "Create Web Service"

## Step 3: Wait for Deployment

- Render will run the build command
- Then start your backend
- Once deployed, visit the URL provided (e.g., `https://expenses-app.onrender.com`)

## How It Works

- **Backend** listens on port 5000 (or $PORT on Render)
- **Backend serves** the frontend static files from `build/` folder
- **Frontend** sends API requests to `/members`, `/expenses`, `/debts` (same server)
- Everything is served from **one URL**

## Testing Locally First

Before deploying to Render:

```bash
# Build frontend
cd frontend
npm run build

# Start backend (which serves the built frontend)
cd ../backend
npm start
```

Then visit: `http://localhost:5000`

## If Still Getting "Not Found"

### Check 1: Is build folder present?
```bash
ls frontend/build/index.html  # Should exist
```

### Check 2: Are the API routes working?
- Visit: `http://localhost:5000/members`
- Should return JSON array with members

### Check 3: Check logs on Render
- Go to your service on Render
- Click "Logs" tab
- Look for errors

### Check 4: Verify CORS
The backend allows all origins with:
```javascript
cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
})
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot GET /" | Build frontend: `npm run build` |
| API calls fail | Check `REACT_APP_API_URL` matches backend URL |
| "Cannot find module" | Run `npm install` in backend folder |
| Port already in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |

## File Structure Expected

```
expenses sharing system/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── build/           ← This must exist!
│   │   ├── index.html
│   │   └── static/
│   ├── src/
│   ├── public/
│   └── package.json
└── package.json
```
