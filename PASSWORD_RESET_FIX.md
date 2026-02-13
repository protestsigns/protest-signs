# 🔧 Password Reset Fix - IMPORTANT

## ❌ Problem
When clicking "Reset Password" link in email, it goes to a page that doesn't exist.

## ✅ Solution
I've fixed the code, but you need to update **one setting in Supabase**.

---

## 🎯 What I Fixed in Code

1. ✅ Changed redirect URL from `/auth/reset-password` → `/auth/update-password`
2. ✅ Created new page: `app/auth/update-password/page.tsx`
3. ✅ Added session validation (checks if reset link is valid)
4. ✅ Shows error if link expired

---

## ⚙️ Required: Update Supabase Setting (2 minutes)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/igxnbkgaehqlowydrene

### Step 2: Navigate to Email Templates
1. Click **"Authentication"** in the left sidebar
2. Click **"Email Templates"** tab
3. Find **"Reset Password"** template

### Step 3: Update the Redirect URL

Look for a line that says something like:
```
{{ .SiteURL }}/auth/reset-password
```

Change it to:
```
{{ .SiteURL }}/auth/update-password
```

**OR** if the template shows a different format, just make sure the path ends with `/auth/update-password`

### Step 4: Save
Click **"Save"** at the bottom

---

## 🧪 Test It Now

1. **Request password reset:**
   ```bash
   make dev
   ```
   - Go to: http://localhost:3000/auth/forgot-password
   - Enter your email
   - Click "Send Reset Link"

2. **Check your email:**
   - You should receive an email
   - Click the "Reset Password" link

3. **Should work now:**
   - ✅ Should take you to: http://localhost:3000/auth/update-password
   - ✅ Should show password strength checker
   - ✅ Enter new strong password
   - ✅ Confirm password
   - ✅ Click "Reset Password"
   - ✅ Should redirect to login

---

## 🐛 If Link Still Doesn't Work

### Check the URL in Email
The link should look like:
```
http://localhost:3000/auth/update-password?token=...
```

If it says `/auth/reset-password` instead:
- You need to update the Supabase email template (see above)
- Request a new reset link (old links still have old URL)

### "Invalid or expired reset link" Error
This means:
- Link was already used (can only use once)
- Link expired (they expire after 1 hour)
- Solution: Request a new reset link

---

## 📝 What Changed

### Files Created:
- ✅ `app/auth/update-password/page.tsx` (new reset page)

### Files Modified:
- ✅ `app/auth/forgot-password/page.tsx` (updated redirect URL)

### Files Deleted:
- ❌ `app/auth/reset-password/page.tsx` (wrong name, replaced)

---

## 🔐 Security Features Added

- ✅ Validates reset token/session before showing form
- ✅ Shows error if link is invalid or expired
- ✅ Password strength checker (same as signup)
- ✅ Password confirmation with visual indicator
- ✅ Auto-redirect to login after success
- ✅ One-time use links (can't reuse same link)

---

## ✅ Summary

**Code:** ✅ Fixed
**Your Action:** Update Supabase email template redirect URL
**Time:** 2 minutes

After updating Supabase, password reset will work perfectly! 🎉
