# Settings Save Debug Guide

## Problem Report
User reported that the "Featured Section" and "Trending Section" toggles in Admin → Settings are not saving to Supabase.

## Root Causes Found & Fixed

### 1. ✅ FIXED: Client-Side Normalization Bug
**File:** `src/services/settingsService.ts`
**Issue:** Used `!== false` which doesn't properly handle explicit `false` values
**Fix:** Changed to nullish coalescing operator `??` to respect explicit `false` values
**Commit:** `dfe04f5`

### 2. ✅ FIXED: Server-Side Missing Fields (CRITICAL)
**File:** `src/lib/admin.functions.ts` 
**Issue:** The server-side `normalizeSettings()` function was missing 30+ fields including:
- `featuredEnabled` ❌
- `trendingEnabled` ❌  
- All footer fields
- All stats fields
- All SEO fields
- `heroSecondaryCta`, `supportEmail`

**Result:** When admin clicked "Save Settings", these fields were silently stripped from the payload before being saved to Supabase.

**Fix:** Added ALL missing fields to server-side normalizeSettings
**Commit:** `7c526c2`

### 3. ✅ ADDED: Comprehensive Logging
**Files:** `src/routes/admin.tsx` + `src/lib/admin.functions.ts`
**Purpose:** Track exactly what's happening during save operations
**Commit:** (current changes)

## How to Test the Fix

### Step 1: Check Environment Variables
```bash
# Verify you have the service role key in .env:
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

**Get it from:** Supabase Dashboard → Project Settings → API → `service_role` key

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Test the Save Flow
1. Open browser console (F12)
2. Go to `http://localhost:3000/admin`
3. Navigate to Settings tab
4. **Uncheck** "Show Featured Section"
5. **Uncheck** "Show Trending Section"
6. Click "Save Settings"

### Step 4: Check Console Output

You should see this in the console:

```
━━━ ADMIN SETTINGS SAVE DEBUG ━━━
1. Settings being sent: {featuredEnabled: false, trendingEnabled: false, totalFields: 70}

━━━ SERVER-SIDE SAVE DEBUG ━━━  
1. Received settings: {featuredEnabled: false, trendingEnabled: false, totalFieldsReceived: 70}
2. After normalization: {featuredEnabled: false, trendingEnabled: false, totalFieldsNormalized: 70}
3. ✅ Saved to Supabase successfully!

2. Response from server: {featuredEnabled: false, trendingEnabled: false, totalFieldsReturned: 70}
3. Settings saved successfully!
```

### Step 5: Verify in Supabase
1. Go to Supabase Dashboard
2. Navigate to Table Editor → `settings` table
3. Find row where `key` = `'store_settings'`
4. Click on the `value` column (JSONB)
5. Search for `"featuredEnabled"` - should be `false`
6. Search for `"trendingEnabled"` - should be `false`

### Step 6: Verify on Homepage
1. Refresh homepage (`http://localhost:3000`)
2. Featured section should be HIDDEN ✅
3. Trending section should be HIDDEN ✅

## If It Still Doesn't Work

### Check 1: Service Role Key Missing
**Error:** `Unauthorized` or `permission denied`
**Solution:** Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env` file

### Check 2: Wrong Supabase Project
**Symptom:** No errors but changes don't appear
**Solution:** Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` match your actual project

### Check 3: RLS Policies
**Symptom:** `policy violation` error
**Solution:** Settings table should have:
- `SELECT` policy: `USING (true)` - anyone can read
- `INSERT/UPDATE` policy: service_role only (enforced by code, not RLS)

### Check 4: Build Cache
**Solution:** 
```bash
rm -rf .vinxi node_modules/.vite
npm run dev
```

### Check 5: Browser Cache
**Solution:** Hard refresh (Ctrl+Shift+R) or clear localStorage:
```javascript
localStorage.removeItem('badzy_store_settings')
location.reload()
```

## Debug Commands

### Check what's in the database RIGHT NOW:
```sql
SELECT value->'featuredEnabled', value->'trendingEnabled' 
FROM settings 
WHERE key = 'store_settings';
```

### Manually set values for testing:
```sql
UPDATE settings 
SET value = jsonb_set(
  jsonb_set(value, '{featuredEnabled}', 'false'),
  '{trendingEnabled}', 'false'
)
WHERE key = 'store_settings';
```

## Files Modified in This Fix

1. `src/services/settingsService.ts` - Client normalization fix
2. `src/lib/admin.functions.ts` - Server normalization fix + logging
3. `src/routes/admin.tsx` - Client-side logging
4. `SETTINGS_DEBUG_GUIDE.md` - This guide

## Architecture Overview

```
Admin UI (admin.tsx)
  ↓ Click "Save Settings"
  ↓ handleSave() - logs what's being sent
  ↓
Server Function (admin.functions.ts)
  ↓ saveAdminStoreSettings.handler()
  ↓ normalizeSettings() - MUST include ALL fields
  ↓ supabaseAdmin.from("settings").upsert()
  ↓
Supabase Database
  ↓ settings table → value (JSONB column)
  ↓
Client Fetch (settingsService.ts)
  ↓ fetchStoreSettings()
  ↓ normalizeSettings() - client-side defaults
  ↓
React Components (index.tsx, etc.)
  ↓ Conditional rendering based on featuredEnabled/trendingEnabled
```

## Next Steps if Still Broken

1. Share the console output from Step 4
2. Share a screenshot of the Supabase settings row
3. Check if error appears in server logs (terminal where npm run dev is running)
4. Verify your `.env` file has all required keys

## Contact
If you encounter issues after following this guide, provide:
- Console output (both client and server logs)
- Supabase table screenshot
- Your `.env` variable names (NOT the values!)
