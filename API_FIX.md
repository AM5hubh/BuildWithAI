# API Connection Fix

## Problem

After changing the AI model and saving, execution fails with:

```
POST http://localhost:3000/api/execute 500 (Internal Server Error)
```

## Root Cause

The frontend was using relative URLs (`/api/execute`) which relied on Vite's proxy configuration. After model changes and flow sync, the proxy sometimes doesn't work correctly, causing 500 errors.

## Solution Applied

### Changes Made:

1. **ModelBlock.ts** - Updated to use absolute backend URL

   ```typescript
   const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
   const response = await fetch(`${apiUrl}/api/execute`, {
   ```

2. **flowStore.ts** - Updated model fetching to use absolute URL

   ```typescript
   const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
   const response = await fetch(`${apiUrl}/api/models`);
   ```

3. **flowPersistence.ts** - Updated flow sync endpoints

   ```typescript
   const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
   await fetch(`${apiUrl}/api/flows/save`, ...);
   await fetch(`${apiUrl}/api/flows/${flowId}`, ...);
   ```

4. **.env.example** - Added VITE_API_URL configuration
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Benefits:

- ✅ Direct connection to backend (no proxy dependency)
- ✅ Works reliably after model changes
- ✅ Configurable via environment variable
- ✅ Consistent across all API calls
- ✅ Better error messages with response details

### How to Use:

**Option 1: Use defaults (recommended)**

- No configuration needed
- Backend URL defaults to `http://localhost:3001`

**Option 2: Custom backend URL**

- Add to `.env` file:
  ```env
  VITE_API_URL=http://your-backend-url:port
  ```
- Restart the dev server: `npm run dev`

### Testing:

1. Start backend: `npm run dev` (or `node backend/server.js`)
2. Start frontend: `npm run dev` (in another terminal)
3. Change a model in the Inspector
4. Click "Run" button
5. ✅ Should work without 500 errors

### Troubleshooting:

**If still getting errors:**

1. **Check backend is running:**

   ```bash
   curl http://localhost:3001/api/health
   ```

   Should return: `{"status":"ok","hasApiKey":true}`

2. **Check model payload:**
   - Open browser DevTools → Network tab
   - Look for `/api/execute` request
   - Check the request body has valid model ID

3. **Check backend logs:**
   - Look for error messages in the terminal running the backend
   - Common issues:
     - Invalid model ID
     - Insufficient OpenRouter credits (402 error)
     - Missing API key

4. **Clear browser cache:**

   ```javascript
   localStorage.clear();
   ```

   Then refresh the page

5. **Restart both servers:**
   - Stop both frontend and backend
   - Clear terminal: `cls` (Windows) or `clear` (Mac/Linux)
   - Restart: `npm run dev`

### API Call Flow:

```
Frontend (localhost:3000)
    ↓
[ModelBlock.execute()]
    ↓
fetch(http://localhost:3001/api/execute)
    ↓
Backend (localhost:3001)
    ↓
[Express /api/execute endpoint]
    ↓
OpenRouter API
    ↓
Response back to frontend
```

### Environment Variables:

```env
# Backend
OPENROUTER_API_KEY=sk-or-v1-xxxxx
YOUR_SITE_URL=http://localhost:3000
YOUR_SITE_NAME=BuildWithAi
PORT=3001

# Frontend (Vite)
VITE_API_URL=http://localhost:3001  # Optional, defaults to this
```

### Vite Proxy (Still Active):

The Vite proxy in `vite.config.ts` is still configured as a fallback:

```typescript
proxy: {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
}
```

But now all API calls use absolute URLs, so the proxy is not strictly needed.

---

**Status:** ✅ Fixed
**Date:** January 26, 2026
**Issue:** Model execution 500 errors after changing model
**Solution:** Use absolute backend URLs instead of relative URLs
