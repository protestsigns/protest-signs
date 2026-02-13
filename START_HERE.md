# ⚠️ IMPORTANT: Before Running or Building

## Build/Run Errors?

If you see errors like:
- `supabaseUrl is required`
- `STRIPE_SECRET_KEY is undefined`
- Build failures

**This is normal!** The app requires environment variables to build.

## ✅ Solution

1. **Copy the environment template:**
```bash
cp .env.example .env.local
```

2. **Fill in your credentials in `.env.local`:**
   - Get Supabase credentials from: https://supabase.com → Your Project → Settings → API
   - Get Stripe credentials from: https://stripe.com → Developers → API keys

3. **Then run:**
```bash
npm run dev
```

## 📖 Full Setup Instructions

Follow **SETUP.md** for complete step-by-step instructions.

## 🚀 Quick Start Order

1. ✅ You are here - Code is built
2. ⏭️ Set up Supabase (10 min)
3. ⏭️ Set up Stripe (5 min)
4. ⏭️ Add env variables
5. ⏭️ Run `npm run dev`
6. ⏭️ Deploy to Vercel

---

**The build error you see is expected without environment variables. Follow SETUP.md!** 📚
