# 📧 Resend Email Setup Guide

## ✅ What I Did
- Installed Resend package
- Created API route for contact form
- Added email notifications
- Updated contact form to use API

## 🚀 How to Set It Up (5 minutes)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up (free - 3,000 emails/month)
3. Verify your email

### Step 2: Get API Key
1. In Resend dashboard → **API Keys**
2. Click **"Create API Key"**
3. Name it: "Protest Signs"
4. Copy the key (starts with `re_...`)

### Step 3: Add to .env.local
Open `.env.local` and replace:
```env
RESEND_API_KEY=your-resend-api-key-here
CONTACT_EMAIL=your-actual-email@gmail.com
```

With your actual values:
```env
RESEND_API_KEY=re_abc123...
CONTACT_EMAIL=yourname@gmail.com
```

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
make dev
```

## ✨ What Happens Now

When someone submits the contact form:
1. ✅ Saved to Supabase database
2. ✅ Email sent to your `CONTACT_EMAIL` address
3. ✅ User gets confirmation message

## 📧 Email Details

**Subject:** New Contact Form: [Name]

**Contains:**
- Sender's name and email
- Their message
- Reply-To is set to sender's email (you can just hit reply!)

## 🎯 Free Tier Limits

Resend Free Tier:
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ More than enough for contact forms!

## ⚠️ Default Email Address

Initially, emails come from: `onboarding@resend.dev`

To use your own domain (e.g., `support@protestsigns.com`):
1. Add your domain in Resend dashboard
2. Verify DNS records
3. Update `from` address in `/app/api/contact/route.ts`

For now, the default works fine!

## 🧪 Test It

1. Go to http://localhost:3000/contact
2. Fill out the form
3. Submit
4. Check your email inbox!

---

**You're all set! Contact form now sends emails! 📧**
