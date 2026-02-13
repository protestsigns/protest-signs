# Deployment Checklist

Use this checklist to ensure your Protest Signs website is properly deployed and configured.

---

## Pre-Deployment

- [ ] All dependencies installed (`npm install`)
- [ ] `.env.local` file created with all credentials
- [ ] Database schema applied in Supabase (`supabase/schema.sql`)
- [ ] Storage bucket `sign-images` created with policies
- [ ] At least one admin user created (set `is_admin = true`)
- [ ] Test locally: `npm run dev` works without errors
- [ ] At least one tag created (e.g., "Popular")
- [ ] At least one sign created with image and tags

---

## Supabase Configuration

- [ ] Project created
- [ ] API keys copied to environment variables
- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] Storage bucket created and set to public
- [ ] Storage policies created (read, upload, delete)
- [ ] Auth email templates configured (optional)
- [ ] Google OAuth enabled (optional)
- [ ] Yahoo OAuth enabled (optional)

---

## Stripe Configuration

- [ ] Account created
- [ ] Test mode enabled for development
- [ ] API keys (publishable + secret) copied to environment variables
- [ ] Products/pricing configured (handled by app)

---

## Vercel Deployment

- [ ] GitHub repository created and code pushed
- [ ] Vercel project created and connected to GitHub
- [ ] All environment variables added in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET` (add after webhook creation)
  - [ ] `NEXT_PUBLIC_SITE_URL` (your Vercel domain)
- [ ] First deployment successful
- [ ] Site accessible at Vercel URL

---

## Stripe Webhook Configuration (Post-Deployment)

- [ ] Webhook endpoint created in Stripe dashboard
- [ ] Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
- [ ] Event `checkout.session.completed` selected
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel environment variables
- [ ] Site redeployed after adding webhook secret
- [ ] Test webhook with Stripe CLI or test purchase

---

## Testing Production

### Authentication
- [ ] Sign up with email works
- [ ] Email confirmation received and works
- [ ] Login works
- [ ] Password reset works
- [ ] Google OAuth works (if enabled)
- [ ] Logout works

### User Flows
- [ ] Homepage loads and shows sign groups
- [ ] Browse page shows all signs
- [ ] Filters work on browse page
- [ ] Sign detail page loads
- [ ] "Add to Cart" works
- [ ] Cart shows correct items
- [ ] "Buy Now" creates Stripe checkout
- [ ] Complete test purchase (card: 4242 4242 4242 4242)
- [ ] Redirected to success page after payment
- [ ] Inventory decremented after purchase
- [ ] Cart cleared after purchase
- [ ] Contact form submission works

### Admin Functions
- [ ] Admin user can access /admin
- [ ] Non-admin users redirected from /admin
- [ ] Create new sign works
- [ ] Edit sign works
- [ ] Sign appears on frontend immediately
- [ ] Create new tag works
- [ ] Tag homepage controls work
- [ ] Orders page shows completed purchases
- [ ] Sign images upload to Supabase Storage

---

## Security Verification

- [ ] `.env.local` is in `.gitignore` (NOT committed)
- [ ] Service role key only used on server-side
- [ ] Stripe secret key only used on server-side
- [ ] RLS policies prevent unauthorized access
- [ ] Admin routes protected by middleware
- [ ] Webhook signature verification working
- [ ] No console errors related to security

---

## Performance & SEO

- [ ] Images optimized (using Next.js Image component)
- [ ] Metadata configured (title, description)
- [ ] Favicon added (optional)
- [ ] Site loads quickly (< 3s)
- [ ] Mobile responsive

---

## Go-Live Checklist

### Switch to Production Mode

- [ ] Create production Stripe account
- [ ] Get production API keys from Stripe
- [ ] Update Vercel environment variables with production keys
- [ ] Update Stripe webhook with production keys
- [ ] Test with real payment method (small amount)
- [ ] Refund test transaction

### Optional Enhancements

- [ ] Custom domain configured in Vercel
- [ ] SSL certificate active (auto with Vercel)
- [ ] Google Analytics added (optional)
- [ ] Error tracking (Sentry, optional)
- [ ] Email notifications for orders (optional)

---

## Monitoring

- [ ] Vercel deployment notifications enabled
- [ ] Supabase usage monitored
- [ ] Stripe dashboard bookmarked
- [ ] Set up alerts for low inventory (optional)

---

## Documentation

- [ ] README.md reviewed
- [ ] SETUP.md reviewed
- [ ] Admin credentials documented securely
- [ ] API keys stored in password manager

---

**Once all items are checked, your site is ready for production! 🚀**
