# Protest Signs — Owner's Guide

*A plain-English guide to running protestsigns.com day-to-day, without needing a developer.*

*Companion document: **Protest Signs — Credentials Reference** (shared with you as a separate Google Doc). Whenever this guide says "log in," the actual username/password location is in that doc.*

> **If something comes up that needs a developer** (see Section 7), here's who to call:
> - Name: _______________________
> - Phone/email: _______________________
> - Notes: _______________________

---

## 1. What This Website Is

Protestsigns.com is your online store. It sells protest signs (bag signs and paper signs), t-shirts, and takes donations. Customers browse, buy, and pay by card; you manage inventory, prices, and orders from a separate staff-only area called the **Admin Panel**.

In plain terms, here's what happens when someone buys something:

1. A customer browses signs on the website
2. They add signs/bags to their cart
3. They check out — payment is handled by **Stripe** (a payment processor, similar in role to a card reader at a cash register)
4. The order is saved in the site's database (**Supabase**)
5. Two emails go out automatically (via **Resend**, the email-sending service): one to the customer confirming their order, one to you (the shop owner) letting you know a new order came in
6. You fulfill the order using the **Admin Panel** (`protestsigns.com/admin`) — see the order, print a packing slip, ship it

![Homepage](sign-screenshots/home-page.png)

---

## 2. Site Map — Every Page On The Site

### Pages customers see

| Page | Address | What it does |
|---|---|---|
| Homepage | `protestsigns.com` | Shows off popular signs and product categories so shoppers can jump straight into browsing. |
| Browse / Shop | `/browse` | The full catalog — customers filter and browse all signs here. |
| Sign detail | `/sign/[a specific sign]` | The page for one specific sign — photos, price, description, "add to cart." |
| About | `/about` | Tells the story of the business and its mission. |
| Contact | `/contact` | A form so visitors can send the business a message (goes to your email and the sender gets an auto-reply). |
| Donate | `/donate` | Lets a supporter make a one-time donation of a chosen or custom amount. |
| Donate — Thank You | `/donate/success` | Confirmation page shown right after a donation. |
| Cart | `/cart` | Shows what's currently in the customer's shopping cart before checkout. |
| Checkout — Thank You | `/checkout/success` | The "thank you, your order is confirmed" page shown right after a purchase. |
| Sign in | `/auth/login` | Where returning customers (or you) log in — by email/password, or with the "Sign in with Google" button. |
| Create account | `/auth/signup` | Where a new customer creates an account — by email/password, or with "Sign up with Google." |
| Forgot password | `/auth/forgot-password` | Requests a password-reset email. |
| Reset password | `/auth/update-password` | Where someone lands from that reset email to type a new password. |
| My account | `/account` | A logged-in customer's own page — name and password. |

![Sign in page](sign-screenshots/signin.png)
![Browse page](sign-screenshots/browse.png)
![Product page](sign-screenshots/product.png)
![About page](sign-screenshots/about.png)
![Cart](sign-screenshots/cart.png)
![Contact page](sign-screenshots/contact.png)
![Donate page](sign-screenshots/donate.png)
![Account settings](sign-screenshots/user-settings.png)

### Pages only staff/admins see (`/admin/...`)

| Page | Address | What it does |
|---|---|---|
| Admin home | `/admin` | The staff dashboard — quick links to everything below. |
| Signs list | `/admin/signs` | Every sign for sale, with stock and status; button to add a new one. |
| Add a sign | `/admin/signs/new` | Form to create a brand-new listing (photos, price, stock, description). |
| Edit a sign | `/admin/signs/[a sign]/edit` | Form to update an existing sign's details, photos, price, and stock. |
| Tags list | `/admin/tags` | Manages the category labels ("tags") used to organize and filter signs. |
| Add a tag | `/admin/tags/new` | Form to create a new category. |
| Edit a tag | `/admin/tags/[a tag]/edit` | Form to rename/update an existing category. |
| Pricing | `/admin/pricing` | Sets prices for the different bag-sign bundle sizes and paper sign shipping. |
| Orders list | `/admin/orders` | All customer orders, filterable by status/date/customer, with export/print. |
| Order detail | `/admin/orders/[an order]` | Full detail of one order — items, totals, shipping, link to the Stripe payment. |
| Packing slips | `/admin/orders/packing-slips` | Generates printable packing slips for orders that still need to ship. |
| Users | `/admin/users` | See all site accounts; promote/demote admins, manage customers. |

![Admin dashboard](sign-screenshots/admin-home.png)

---

## 3. How It All Fits Together (Architecture)

You don't need to memorize this, but it helps to have the mental picture when something goes wrong and you need to describe the problem to a developer.

![Architecture diagram](diagrams/architecture.png)

**In words:** the domain (protestsigns.com) is registered at **GoDaddy**, which points it at **Vercel** via DNS and also lets **Resend** prove it's allowed to send email from that domain (also via DNS). The website itself (code) lives on **GitHub** and runs on **Vercel**. All store data (signs, orders, accounts) lives in **Supabase**. Payments go through **Stripe**. Emails go through **Resend**, landing in the **Gmail inbox** for order/contact alerts, and delivered to customers for their own confirmations. Customers can also sign in via **Google Cloud**'s OAuth, handled through Supabase. The **Admin Panel** is part of the website only staff can access, which reads and writes the same Supabase database.

![Vercel project dashboard](sign-screenshots/vercel.png)
![Supabase project dashboard](sign-screenshots/supabase.png)
*(Optional: a screenshot of Supabase's Table Editor → `orders` table specifically would replace the general dashboard view above with something more directly tied to order data.)*

---

## 4. Every Component — What It Is And What It's For

This table covers every system you have credentials for (see the companion Credentials Reference doc), what it actually does, and how it connects to everything else.

| Component | What it is | What it's used for | Connects to |
|---|---|---|---|
| **GoDaddy** | The domain registrar — where `protestsigns.com` itself is registered/renewed | Controls DNS records: which server the domain points to, and which mail-sending services are allowed to send email "from" the domain | Points the domain at Vercel; provides the DNS records Resend needs to verify sending |
| **GitHub** | Source code hosting | Stores every version of the website's code | Pushing to the main branch triggers Vercel to rebuild and redeploy the live site |
| **Vercel** | Hosting platform | Runs the actual website; also holds the environment variables (API keys) the site uses, including which Stripe mode is active | Pulls code from GitHub; talks to Supabase, Stripe, and Resend on the site's behalf |
| **Supabase** | Database + customer auth | Stores every sign, order, customer account, and contact-form message; handles email/password and Google login | Read/written by Vercel (the live site) and the Admin Panel; hands off to Google Cloud for Google sign-in |
| **Stripe** | Payment processor | Charges customer cards, handles payouts to your bank, refunds, and (optionally) sales tax | Called by Vercel to create a checkout session; sends a webhook back to Vercel when a payment succeeds |
| **Resend** | Transactional email service | Sends order confirmations and contact-form emails/replies | Called by Vercel's code; needs GoDaddy DNS records to be "verified" for protestsigns.com; delivers to customers and to the Gmail inbox |
| **Gmail** (`protestsigns111@gmail.com`) | The email inbox | Where new-order and contact-form alerts land for you to read; also the account most other services were signed up under | Receives mail from Resend; typically the login email for Vercel/Supabase/GitHub/Resend accounts |
| **Google Cloud** | Holds the OAuth Client (Client ID/Secret) | Powers the "Sign in/up with Google" button so customers can skip creating a password | Configured into Supabase's Auth provider settings — not called directly by the website's own code |
| **Admin Panel** (`protestsigns.com/admin`) | The staff-only control panel, part of the website itself | Where you manage signs, pricing, tags, orders, and users day-to-day | Reads/writes the same Supabase database the live site uses |

---

## 5. The Tech Stack — What Each Piece Does

| System | What it is | When you'd ever need to log into it |
|---|---|---|
| **Vercel** | Hosts the website — the "server" the site actually runs on. Every time code changes, Vercel rebuilds and publishes the new version automatically. | Rarely — mostly to check if the site is "up," view traffic/analytics, or view environment settings (like Stripe keys — see Section 8). |
| **GitHub** | Stores the website's source code and its history of changes. | Only if you hire a developer to make code changes — they'll push changes here, which auto-deploys to Vercel. |
| **Supabase** | The database — every sign, order, customer account, and contact-form message lives here. Also handles customer login/accounts. | To look up an order directly, check inventory numbers, or if the admin panel doesn't show something you need. |
| **Stripe** | Processes all credit card payments and payouts to your bank account. | To see payment history, issue refunds, check payouts, or update your bank account for deposits. |
| **Resend** | Sends all automated emails (order confirmations, contact form replies). | Only if emails stop arriving — check the "Domains" and "Logs" tabs there first. |
| **Admin Panel** (`protestsigns.com/admin`) | The control panel *you* actually use day-to-day — built specifically for managing this store. | This is your main tool. Everything in Section 6 happens here. |
| **Google Sign-In** | Powers the "Sign in/up with Google" buttons on the login/signup pages, so customers can use their Google account instead of a password. **This is entirely powered by Supabase** — the website's own code just asks Supabase to "start a Google login" and Supabase handles the rest (redirecting to Google, verifying the login, sending the customer back). See below for exactly where this lives in the Supabase dashboard. | Only if that button stops working — see Common Situations below. |
| **GoDaddy** | Where the domain is registered and its DNS records live. | Only for domain renewal, or if a developer needs to add/change a DNS record (e.g. fixing email verification). |

---

## 6. Page-By-Page: What You Can Do Yourself

All of this happens by logging into `protestsigns.com/admin` with your admin account — no developer needed.

### Adding a new sign listing
![New sign form](sign-screenshots/admin-new-sign.png)
- Go to **Admin → Signs → New Sign** (`/admin/signs/new`)
- Fill in title, description, price, photos, quantity available, and product type (bag / paper / t-shirt / etc.)
- Save — it appears on the live site immediately

### Editing or archiving an existing sign
![Signs list](sign-screenshots/admin-signs.png)
![Edit sign form](sign-screenshots/admin-edit-sign.png)
- **Admin → Signs**, click a sign to edit its price, photos, description, or stock count (this is also where the "display order" / sort field lives — lower numbers show first on the site)
- "Archiving" hides a sign from the site without deleting its order history — use this instead of deleting when discontinuing something

### Updating prices (including bag bundle pricing tiers)
![Pricing table](sign-screenshots/admin-pricing.png)
- **Admin → Pricing** controls the tiered bag pricing (e.g. "1 bag = $X, 3 bags = $Y") and paper sign shipping — these are the same tables that show on the homepage pricing section

### Viewing and fulfilling orders
![Orders list](sign-screenshots/admin-orders.png)
- **Admin → Orders** lists every order, customer info, and shipping address — click one to see full detail, including a link to that payment in Stripe
- Packing slips can be generated/printed from **Admin → Orders → Packing Slips**
- *Note: the order-list screenshot above shows real customer emails and order data — treat it, and this whole guide once screenshots are in it, as private, not something to post publicly.*

### Managing tags/categories
![Tags list](sign-screenshots/admin-tags.png)
![New tag form](sign-screenshots/admin-new-tag.png)
- **Admin → Tags** lets you create/edit the categories signs are filtered by on the site

### Managing users
![User management](sign-screenshots/admin-users.png)
- **Admin → Users** shows every account and lets you promote a user to admin or manage customer accounts

### Changing your own admin password
- From the admin account settings — this does **not** require a developer and does not affect any other system's password

---

## 7. What Requires a Developer

These involve editing the website's actual code, not just data in the admin panel — and it's a common misconception (worth flagging clearly) that *everything* on the homepage is admin-editable. It isn't. Only signs, pricing, tags, and orders are. Everything else on the homepage — the hero section wording, which sections appear in what order, images, the "How to Make a Sign" video — is hardcoded into the page and needs a developer to change:

- Homepage layout, wording, section order, or images not tied to an admin-editable field
- Adding new pages or new *types* of listings (e.g. a wholly new product category with different fields than signs have)
- Changing how checkout works, adding new payment methods
- DNS/domain changes (e.g. verifying email sending — see Section 10)
- Anything involving the code in GitHub

---

## 8. Stripe: Test Mode vs. Live Mode

Stripe has two completely separate modes. This trips a lot of people up, so it's worth understanding clearly:

- **Live mode** — real cards, real charges, real money into your bank account. This is what customers use on the actual live site.
- **Test mode** — fake "cards" (like `4242 4242 4242 4242`) that simulate a purchase without moving real money. Used only for testing that the site works, never seen by real customers.

**Where the switch happens:** Stripe mode is controlled by which API keys the website is configured with — there is a toggle in the Stripe Dashboard (top-right corner: "Test mode" / "Live mode" switch) that lets *you* view test vs. live data, but the website itself always uses whichever keys are set in its environment variables:

| Key | Test mode looks like | Live mode looks like | Where it's set |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | starts with `sk_test_...` | starts with `sk_live_...` | Vercel → Project → Settings → Environment Variables |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | starts with `pk_test_...` | starts with `pk_live_...` | Vercel → Project → Settings → Environment Variables |
| `STRIPE_WEBHOOK_SECRET` | test webhook secret | live webhook secret | Vercel → Project → Settings → Environment Variables |

The actual key values live in the Credentials Reference doc / Stripe Dashboard directly — **do not put real key values in this guide or anywhere public.**

**To check which mode the live site is currently in:** in the Stripe Dashboard, toggle to "Live mode" (top right) and look at Payments — if real orders show up there, the site is live. If they only show up under "Test mode," the site is still using test keys (meaning **no real payments are being processed** — a critical thing to check before/after any deploy).

**Never mix modes** — a test secret key with a live publishable key (or vice versa) will break checkout entirely.

`[SCREENSHOT: Vercel environment variables page, values redacted]`
`[SCREENSHOT: Stripe dashboard test/live toggle]`

---

## 9. Common Situations

**"A customer says they never got a confirmation email."**
Check Resend's dashboard → Logs for that email address — it'll show delivered / bounced / spam. If it says delivered but the customer says they don't see it, ask them to check spam — this is common until the sending domain is fully verified (see below).

**"Is protestsigns.com verified with Resend?"**
Check Resend Dashboard → Domains → protestsigns.com. It should say "Verified." If it says "Failed" or "Pending," DNS records need to be added at the domain registrar — this is a one-time developer/DNS-admin task, not something fixable from the admin panel.

**"A customer emailed asking about sales tax."**
Sales tax handling is configured in Stripe under Tax settings (Stripe Dashboard → Settings → Tax) — this is not something the site code does automatically.

**"Something on the site looks broken."**
First check `protestsigns.com/api/health` — if it loads and shows all green/true values, the core services (database, payments) are reachable, and the issue is more likely a specific page/feature. Note this endpoint only checks that credentials are configured, not that every feature works — if something looks visibly broken, that's a developer question.

**"I need to know if the database is 'paused.'"**
Supabase automatically pauses free-tier projects after a period of inactivity. Log into supabase.com, open the project — if it shows a "Restore" button instead of the normal dashboard, it's paused and needs a click to restore (may take a minute to spin back up).

**"How does 'Sign in with Google' actually work, and where do I see it?"**
It's powered entirely by Supabase — the website's own code doesn't handle Google logins itself. When a customer clicks the button, the site just asks Supabase to start a Google login; Supabase redirects them to Google, verifies it, and sends them back signed in.

To see this in the Supabase dashboard yourself: log into supabase.com → open the project → **Authentication** (left sidebar) → **Providers** → **Google**. That page shows whether Google sign-in is turned on and holds the Google credentials (Client ID/Secret) that make it work — but not which Google account those credentials belong to (that's set up separately in Google Cloud Console).

**If the button doesn't work:** this is configured in two places that both need to agree — a Google Cloud project (holds the actual Google credentials) and that same Supabase → Authentication → Providers → Google screen (where those credentials get entered). If the button errors out, check Supabase's **Authentication → Logs** first — a common cause is the Google Cloud OAuth consent screen expiring or being suspended, which needs a developer or whoever owns the Google Cloud project to fix. Customers can always fall back to signing in with plain email/password in the meantime — this doesn't take the whole site down.

**"How many people are visiting the site?"**
The site already has Vercel Analytics installed. Log into Vercel → your project → **Analytics** tab to see visitor counts, page views, and top pages — no extra setup needed.

**"The domain is about to expire / I need to renew it."**
That happens at GoDaddy, not Vercel or anywhere else — log into GoDaddy directly to check the renewal date and payment method on file.

---

## 10. Backing Up Your Data

You don't need to run backups yourself day-to-day — Supabase keeps the database running continuously — but it's worth knowing how to pull a copy of your data out, both for your own records and in case you ever need to hand data to an accountant, a new developer, or recover something.

**Exporting orders/signs/customers as a spreadsheet (CSV):**
1. Log into supabase.com and open the project
2. Go to the **Table Editor** (left sidebar)
3. Pick a table — usually `orders`, `order_items`, `signs`, or `contact_submissions`
4. Use the **Export** button (usually in the top-right of the table view) to download it as a CSV, which opens in Excel/Google Sheets

**A simpler option for orders specifically:** the Admin Panel's **Orders → Download USPS CSV** button already exports order/shipping data without needing to touch Supabase directly.

**How often should this happen?** There's no automated backup schedule you need to manage — Supabase handles that on its end for the database itself. Manual exports above are only for when *you* want a copy in hand (e.g., before a big change, for year-end taxes, or before switching developers).

---

## 11. Where To Go From Here

- Day-to-day store management: **Admin Panel**
- Payment questions: **Stripe Dashboard**
- Email delivery questions: **Resend Dashboard**
- Traffic/visitor questions: **Vercel → Analytics**
- Domain/renewal questions: **GoDaddy**
- Need a copy of your data: **Supabase Table Editor / Admin → Orders → Download USPS CSV** (Section 10)
- Anything involving code, layout, or new features: **a developer**
- All login locations: **Credentials Reference** (companion Google Doc)

---

## 12. For a Future Developer

If you (Buck) ever hire a new developer, or if you're a developer picking this project up, this section is for you.

### Tech stack
- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Database/Auth:** Supabase (Postgres + Supabase Auth, including Google OAuth)
- **Payments:** Stripe (Checkout Sessions + webhooks)
- **Email:** Resend
- **Hosting:** Vercel, auto-deploying from the `main` branch on GitHub
- **Analytics:** Vercel Analytics (`@vercel/analytics`), already wired into `app/layout.tsx`

### Where things live in the code
- `app/` — every page and route, using Next's App Router (folder = URL path). Customer-facing pages sit at the top level (`app/page.tsx`, `app/browse`, `app/cart`, etc.); staff-only pages live under `app/admin/`.
- `app/api/` — server-side API routes: `contact` (contact form + emails), `stripe/checkout` (creates a Checkout Session), `stripe/webhook` (handles `checkout.session.completed`, writes the order to Supabase, sends confirmation emails), `health` (checks required env vars are present).
- `lib/` — shared helpers: `stripe.ts` and `resend.ts` (API clients), `email-template.ts` (the branded HTML email wrapper), `pricing.ts` (bag-bundle and paper-sign pricing logic), `supabase/` (Supabase client setup for server vs. browser), `usps-csv.ts`, `guest-cart.ts`, `utils.ts`.
- `supabase/schema.sql` and `supabase/migrations/` — the full database schema and its migration history. `supabase/seed.sql` has sample seed data.

### Environment variables (set in Vercel → Project → Settings → Environment Variables, mirrored locally in `.env.local`)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_ACCOUNT_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`, `NEXT_PUBLIC_SITE_URL`, plus USPS sender address fields used for shipping labels/CSV export.

### Local development
1. Clone the repo, `npm install`
2. Copy `.env.example` to `.env.local` and fill in test-mode Supabase/Stripe/Resend values
3. `npm run dev`
4. To test the full purchase → webhook → email flow locally, use the Stripe CLI: `stripe login`, then `stripe listen --forward-to localhost:3000/api/stripe/webhook`, and check out with Stripe's test card `4242 4242 4242 4242`

### Things to know before touching this codebase
- **Only signs, pricing tiers, tags, and orders are admin-editable.** Everything else on the homepage (hero copy, section order, the "How to Make a Sign" video) is hardcoded in `app/page.tsx` — don't assume there's a CMS field backing it.
- **Resend domain verification status should be checked before assuming production email works.** As of this handoff, verify current status in the Resend dashboard — if it shows "Failed"/"Pending," production emails from an `@protestsigns.com` address will be unreliable/land in spam until the DNS records (in GoDaddy) are added and propagate.
- **Stripe test vs. live keys** — see Section 8. Never mix a test key with a live key.
- **The Stripe webhook is the source of truth for orders** — orders are created in `checkout.session.completed`, not at Checkout Session creation time. If testing locally, the webhook must be reachable (via `stripe listen`) or orders won't be created even if the Stripe payment succeeds.
- **Admin role** — user roles (owner/admin/customer) are managed in Supabase's `users` table via `/admin/users`; the "Owner" role can't be modified on yourself from the UI (by design).
- **Mobile responsiveness** — the site uses Tailwind's mobile-first responsive classes throughout; no fixed pixel widths were found in a review pass, but there's no automated visual regression testing, so changes should be manually checked on a narrow viewport.

---

## ⚠️ Known Outstanding Item: Resend Domain Verification

As of this handoff, **protestsigns.com is not yet verified in Resend.** This is the single most important loose end to close before/soon after handoff, because it's the most likely explanation for past "customers never got their email" complaints.

**What needs to happen:** DNS records (a DKIM TXT record, an SPF TXT record, and an SPF/MX record) need to be added at **GoDaddy**, where the domain is registered. Resend generates these exact records for you — log into Resend → Domains → protestsigns.com to see them, or ask a developer to pull and add them. Once added, DNS propagation typically takes anywhere from a few minutes to a few hours.

**Will it automatically start sending from the protestsigns.com domain and stay out of spam once verified?** Two separate things need to both be true:
1. **The domain needs to show "Verified" in Resend** (the DNS step above).
2. **`RESEND_FROM_EMAIL` needs to be set to an `@protestsigns.com` address in Vercel's environment variables.** If that variable isn't set, or is missing, the code falls back to Resend's own shared sandbox address (`onboarding@resend.dev`) — which works, but never looks like it's really coming from Protest Signs.

Once *both* of those are true, yes — emails will actually be sent from an `@protestsigns.com` address instead of the fallback. That alone fixes the most common cause of landing in spam (an unverified/mismatched sending domain is one of the biggest spam signals to Gmail/Outlook).

**However, verification is not an absolute guarantee against spam.** Deliverability also depends on things like how many people mark the email as spam, how "spammy" the email content looks, and general sender reputation building up over time. Verifying the domain gets you from "almost certainly flagged" to "normal transactional email deliverability" — it's the single biggest fix available, but not a 100% guarantee forever.

**In the meantime**, a small safeguard has been added directly to the site: both the checkout success page and the contact form's "message sent" confirmation now display a note asking customers to check their spam/junk folder if they don't see the email — so customers aren't left thinking the site is broken while this gets fixed.
