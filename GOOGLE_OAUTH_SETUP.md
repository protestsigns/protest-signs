# 🔐 Google OAuth Setup Guide

## Overview
Enable "Sign in with Google" for your Protest Signs website. This will allow users to sign up and log in using their Google account.

---

## Prerequisites
- ✅ Supabase project created (you have this)
- ✅ Google account
- ⏱️ Time needed: ~10 minutes

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create a New Project (or use existing)
1. Click the project dropdown (top left)
2. Click "NEW PROJECT"
3. Name: `Protest Signs Auth`
4. Click "CREATE"
5. Wait for creation, then select your new project

### 1.3 Enable Google+ API
1. Search for "Google+ API" in the search bar
2. Click on "Google+ API"
3. Click "ENABLE"

### 1.4 Create OAuth Credentials
1. In the left sidebar, click "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" (top)
3. Select "OAuth client ID"
4. If prompted, click "CONFIGURE CONSENT SCREEN"

#### Configure Consent Screen:
- User Type: **External**
- Click "CREATE"
- Fill in:
  - App name: `Protest Signs`
  - User support email: `tejvirmann11@gmail.com`
  - Developer contact: `tejvirmann11@gmail.com`
- Click "SAVE AND CONTINUE"
- Skip "Scopes" → Click "SAVE AND CONTINUE"
- Add test user: `tejvirmann11@gmail.com`
- Click "SAVE AND CONTINUE"
- Click "BACK TO DASHBOARD"

#### Create OAuth Client:
1. Go back to "Credentials" tab
2. Click "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `Protest Signs Web`
5. Under "Authorized redirect URIs", click "+ ADD URI"
6. Add this EXACT URL:
   ```
   https://igxnbkgaehqlowydrene.supabase.co/auth/v1/callback
   ```
7. Click "CREATE"
8. **SAVE THESE CREDENTIALS:**
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxx`

---

## Step 2: Configure Supabase

### 2.1 Open Supabase Dashboard
Visit: https://supabase.com/dashboard/project/igxnbkgaehqlowydrene

### 2.2 Enable Google Provider
1. In left sidebar, click "Authentication"
2. Click "Providers"
3. Find "Google" in the list
4. Toggle it ON (enable)

### 2.3 Add Google Credentials
1. Paste your **Client ID** from Google
2. Paste your **Client Secret** from Google
3. Click "Save"

---

## Step 3: Test It!

### 3.1 Run Your Dev Server
```bash
make dev
```

### 3.2 Test Google Sign In
1. Go to: http://localhost:3000/auth/signup
2. Click "Sign up with Google"
3. You should be redirected to Google
4. Sign in with your Google account
5. You'll be redirected back to your site ✅

### 3.3 Verify in Supabase
1. Go to Supabase → Authentication → Users
2. You should see your Google account listed!

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Fix:** Make sure the redirect URI in Google Cloud Console is EXACTLY:
```
https://igxnbkgaehqlowydrene.supabase.co/auth/v1/callback
```
No trailing slash, no extra spaces.

### Error: "OAuth client not found"
**Fix:** Wait 5 minutes after creating credentials. Google needs time to propagate changes.

### Users not appearing in database
**Fix:** Make sure you've run the database schema (`supabase/schema.sql`) to create the profiles table.

---

## Production Deployment

When you deploy to Vercel:

1. **Update .env.local:**
   ```env
   NEXT_PUBLIC_SITE_URL=https://protestsigns.com
   ```

2. **No other changes needed!**
   - Supabase handles OAuth redirects
   - Your Google OAuth is already configured

---

## Security Notes

✅ **What's Already Secure:**
- Google OAuth uses industry-standard security
- Supabase handles all token management
- Sessions are encrypted and stored securely
- Cookies are httpOnly and secure in production

✅ **Best Practices:**
- Never commit Google Client Secret to git (already in .gitignore)
- Use different OAuth credentials for staging vs production
- Regularly rotate secrets every 90 days

---

## Need Help?

1. **Google OAuth not working?**
   - Check browser console for errors
   - Verify redirect URI matches exactly
   - Make sure Google+ API is enabled

2. **Users can't sign in?**
   - Check Supabase logs: Dashboard → Logs → Auth logs
   - Verify Google provider is enabled in Supabase

3. **Still stuck?**
   - Check Supabase docs: https://supabase.com/docs/guides/auth/social-login/auth-google
