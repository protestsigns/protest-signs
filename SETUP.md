# Protest Signs - Setup Guide

This guide will walk you through setting up the Protest Signs website from scratch.

---

## Prerequisites

- Node.js 18+ installed
- npm installed
- A Supabase account (free tier works)
- A Stripe account (test mode for development)
- A code editor

---

## Step 1: Clone and Install Dependencies

```bash
cd protest-signs
npm install
```

---

## Step 2: Supabase Setup (~10 minutes)

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name:** protest-signs (or any name)
   - **Database Password:** Choose a strong password and save it
   - **Region:** Select closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### 2.2 Get Your Credentials

1. Once the project is ready, go to **Settings** (gear icon) → **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (the `anon` key)
   - **service_role key** (click "Reveal" to see it)

### 2.3 Set Up the Database

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `supabase/schema.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

### 2.4 Create Storage Bucket

1. Go to **Storage** (left sidebar) → **"Create a new bucket"**
2. Fill in:
   - **Name:** `sign-images`
   - **Public bucket:** ✅ Yes (check this)
3. Click **"Create bucket"**

4. Click on the `sign-images` bucket → **Policies** tab → **"New policy"**

5. Create 3 policies:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'sign-images');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'sign-images');
```

**Policy 3: Admin Delete**
```sql
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'sign-images' 
  AND (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);
```

---

## Step 3: Stripe Setup (~5 minutes)

### 3.1 Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Toggle to **Test Mode** (top-right switch)

### 3.2 Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (click "Reveal" then copy, starts with `sk_test_...`)

### 3.3 Configure Webhook (Do this AFTER deploying to Vercel)

We'll come back to this after deployment.

---

## Step 4: Environment Variables

1. In your project root, create a file called `.env.local`
2. Copy this template and fill in your values:

```env
# Supabase (from Step 2.2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe (from Step 3.2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Leave this for now

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Step 5: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the homepage!

---

## Step 6: Create Your Admin Account

1. Go to `http://localhost:3000/auth/signup`
2. Sign up with your email
3. Check your email for the confirmation link and click it
4. Go back to Supabase dashboard → **Table Editor** → `profiles`
5. Find your profile row
6. Click the row, set `is_admin` to `true`, click **Save**
7. Sign out and sign back in - you should now see "Admin" in the navbar

---

## Step 7: Add Example Data

### Option A: Use the Seed Script

1. Go to Supabase **SQL Editor**
2. Open `supabase/seed.sql` from this project
3. Copy the contents and run it
4. This creates tags and example signs

### Option B: Add Data Manually via Admin Dashboard

1. Go to `http://localhost:3000/admin`
2. Create tags:
   - Click **"Manage Tags"** → **"Create New Tag"**
   - Create: "Popular", "Seasonal", "Environment", etc.
   - Enable "Show on Homepage" for "Popular" and "Seasonal"
3. Create signs:
   - Click **"View All Signs"** → **"Create New Sign"**
   - Add title, price, quantity, images
   - Assign tags

---

## Step 8: Deploy to Vercel

### 8.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### 8.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Environment Variables:** Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_SITE_URL` (set to your Vercel domain, e.g., `https://protest-signs.vercel.app`)
     - Leave `STRIPE_WEBHOOK_SECRET` empty for now
5. Click **"Deploy"**
6. Wait for deployment to complete (~2 minutes)
7. Copy your deployment URL (e.g., `https://protest-signs.vercel.app`)

---

## Step 9: Configure Stripe Webhook

1. Go back to Stripe dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Fill in:
   - **Endpoint URL:** `https://your-vercel-domain.vercel.app/api/stripe/webhook`
   - **Description:** Protest Signs Production
   - **Events to send:** Select `checkout.session.completed`
4. Click **"Add endpoint"**
5. Click on the newly created webhook
6. Click **"Reveal"** next to **Signing secret**
7. Copy the secret (starts with `whsec_...`)
8. Go back to Vercel → Your project → **Settings** → **Environment Variables**
9. Add `STRIPE_WEBHOOK_SECRET` with the value you just copied
10. Redeploy: **Deployments** tab → Click on latest deployment → **"Redeploy"**

---

## Step 10: Configure OAuth (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure consent screen if prompted
6. Choose **"Web application"**
7. Add authorized redirect URI:
   - `https://your-project.supabase.co/auth/v1/callback`
8. Copy **Client ID** and **Client Secret**
9. Go to Supabase → **Authentication** → **Providers**
10. Enable **Google**
11. Paste Client ID and Client Secret
12. Save

### Yahoo OAuth (Similar Process)

1. Go to [Yahoo Developer Network](https://developer.yahoo.com)
2. Create an app
3. Get Client ID and Secret
4. Configure in Supabase with redirect URI
5. Enable in Supabase → **Authentication** → **Providers**

---

## Step 11: Test Production

1. Visit your Vercel URL
2. Sign up, browse signs, add to cart, checkout (use Stripe test card `4242 4242 4242 4242`)
3. Verify inventory updates after purchase
4. Test admin functions

---

## Maintenance & Updates

### Adding New Signs

1. Go to `/admin` → **"Create New Sign"**
2. Fill in details and assign tags
3. Signs appear immediately on the site

### Managing Tags

1. Go to `/admin/tags`
2. Create/edit tags
3. Control homepage visibility and order

### Monitoring Orders

1. Go to `/admin/orders`
2. View all completed purchases

### Viewing Contact Submissions

1. Go to Supabase → **Table Editor** → `contact_submissions`

---

## Troubleshooting

### "Invalid API key" error
- Check that environment variables are set correctly
- Restart dev server after changing `.env.local`

### Images not uploading
- Verify storage bucket is public
- Check storage policies are created

### Stripe webhook not working
- Verify webhook URL is correct
- Check webhook secret matches in environment variables
- View webhook logs in Stripe dashboard

### User not showing as admin
- Go to Supabase → Table Editor → `profiles`
- Set `is_admin` to `true` for your user

---

## Security Checklist

- ✅ Row-Level Security enabled on all tables
- ✅ Service role key stored in environment variables
- ✅ Stripe webhook signature verification enabled
- ✅ Admin routes protected by middleware
- ✅ API routes validate user authentication

---

## Support

For issues or questions:
- Check the README.md
- Review Supabase logs: Dashboard → **Logs**
- Review Vercel logs: Dashboard → **Deployments** → Click deployment → **Logs**
- Check Stripe webhook logs: Dashboard → **Developers** → **Webhooks** → Click webhook → **Events**

---

**Congratulations! Your Protest Signs website is now live! 🎉**
