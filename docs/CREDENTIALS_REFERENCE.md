# Protest Signs — Credentials Reference

*Companion to the Owner's Guide. This document tells you WHERE each login/secret lives and WHAT it's for. It intentionally does not contain live passwords or API keys inline — see the "Actual value" column for where each one is stored.*

**Base account:** most systems below are tied to `protestsigns111@gmail.com`.

---

## 1. Gmail — `protestsigns111@gmail.com`

- **Login:** gmail.com
- **What it's for:** the master email account most other accounts (Vercel, Supabase, Resend, Stripe, GitHub if applicable) were signed up with, plus the shop's contact/notification inbox
- **Importance:** ⚠️ Highest — losing access to this email can lock you out of every other account's password reset flow
- **Actual value:** password stored in [shared password manager entry / Google Doc — fill in once decided]
- **Recommend:** turn on 2-factor authentication if not already on, and make sure the recovery phone/email on this account is one Buck actually controls

## 2. GitHub

- **Login:** github.com
- **What it's for:** stores the website's source code (`protestsigns` repo). A developer pushes changes here; Vercel auto-deploys from it.
- **Importance:** Medium — only matters when making code changes
- **Actual value:** [account email / org name] — password/access token stored in [location]
- **Note:** if a new developer ever takes over, they need to be invited as a collaborator here rather than sharing the login directly

## 3. Vercel

- **Login:** vercel.com
- **What it's for:** hosts the live website; also where environment variables (API keys the site uses, including Stripe/Supabase/Resend keys) are configured
- **Importance:** ⚠️ High — this is where Stripe test-vs-live keys are switched (see Owner's Guide §5)
- **Actual value:** password stored in [location]
- **Where the Stripe keys live here:** Project → Settings → Environment Variables → `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

## 4. Supabase

- **Login:** supabase.com
- **What it's for:** the database — every sign, order, customer account, and contact form submission
- **Importance:** ⚠️ High — this is the actual store data
- **Actual value:** password stored in [location]
- **Also here:** `SUPABASE_SERVICE_ROLE_KEY` (used by the website's backend to read/write the database) — this key should never be shared publicly or committed to code; it's set in Vercel's environment variables, not typed anywhere visible

## 5. Stripe

- **Login:** dashboard.stripe.com
- **What it's for:** processes payments, handles payouts to the bank account, refunds, and (if configured) sales tax
- **Importance:** ⚠️ Highest — this is where the money moves
- **Actual value:** password stored in [location]; enable 2FA if not already on
- **Test vs. Live keys** (see Owner's Guide §5 for full explanation):
  | Key | Test | Live |
  |---|---|---|
  | Secret key | `sk_test_...` | `sk_live_...` |
  | Publishable key | `pk_test_...` | `pk_live_...` |
  | Webhook signing secret | test endpoint's secret | live endpoint's secret |
  - Current values for all of the above: stored in [Vercel env vars are the source of truth; a copy can also be kept in password manager]
  - Dashboard toggle (top-right "Test mode"/"Live mode") only changes what *you* are viewing — it does not change what the live site uses. The live site always uses whatever keys are set in Vercel.

## 6. Resend

- **Login:** resend.com
- **What it's for:** sends all automated emails — order confirmations, contact form replies/notifications
- **Importance:** Medium-High — if this account is inaccessible, transactional emails stop
- **Actual value:** password stored in [location]
- **Also here:** `RESEND_API_KEY` (set in Vercel env vars) and the domain verification status for protestsigns.com (Dashboard → Domains) — should read "Verified," not "Failed"/"Pending"

## 7. Google Sign-In (OAuth)

- **Login:** console.cloud.google.com (Google Cloud Console — a *different* thing from the `protestsigns111@gmail.com` inbox itself, even though it may be owned by the same Google account)
- **What it's for:** powers the "Sign in with Google" / "Sign up with Google" buttons on the site's login and signup pages (`/auth/login`, `/auth/signup`) — lets customers create an account using their Google account instead of a password
- **Importance:** Medium — if this breaks, customers can still sign up/log in the normal email+password way; only the Google button stops working
- **How it's wired up:** a Google Cloud project holds an OAuth Client (Client ID + Client Secret); those two values are then pasted into **Supabase → Authentication → Providers → Google** to turn the feature on. There's no key stored in this website's own code/environment variables — it's entirely configured on the Google Cloud + Supabase side.
- **Actual value:** Google Cloud Console login stored in [location]; the OAuth Client ID/Secret are stored in [location] and also visible directly inside Supabase → Authentication → Providers → Google once logged into Supabase
- **Note:** if the Google Cloud project or OAuth consent screen is ever suspended/deleted, the "Sign in with Google" button stops working until it's recreated and the new Client ID/Secret are re-entered in Supabase

## 8. Domain registrar (where protestsigns.com is registered)

- **Login:** [registrar name/URL — fill in]
- **What it's for:** DNS records (what makes protestsigns.com point to Vercel, and what makes Resend's domain verification work), domain renewal
- **Importance:** ⚠️ Highest — losing this can take the entire site offline or let the domain expire/lapse
- **Actual value:** password stored in [location]
- **Note:** renewal date should be checked periodically — set a calendar reminder

## 9. Admin Panel (protestsigns.com/admin)

- **Login:** protestsigns.com/admin
- **What it's for:** the day-to-day store management tool (see Owner's Guide §5)
- **Importance:** This is Buck's main tool — separate from all the accounts above
- **Actual value:** password stored in [location]; can be changed directly from the admin account settings without affecting anything else

---

## Sharing Method

This document is shared as a Google Doc with view access limited to Buck (and anyone else who needs it). It does not contain live passwords/keys — those are stored in **[fill in: e.g., a shared password manager vault]** and shared separately, one time, through a secure channel.

## Recommended follow-ups once handoff is complete

- Rotate the Stripe secret key, Supabase service role key, and Resend API key once Buck has full control — the developer currently knows these values
- Turn on 2FA everywhere it's supported (Gmail, GitHub, Stripe, Vercel, Supabase)
- Confirm the domain registrar's renewal auto-pay is set up under a card/account Buck controls
