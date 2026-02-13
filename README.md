<p align="center">
  <img src="logo/logo.png" alt="Protest Signs Logo" width="600">
</p>

<h1 align="center">protestsigns.com</h1>

<p align="center">
  A production-ready e-commerce website for selling protest signs.<br>
  Built with Next.js, TypeScript, Supabase, and Stripe.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js 14">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Supabase-Latest-green" alt="Supabase">
  <img src="https://img.shields.io/badge/Stripe-Payments-purple" alt="Stripe">
</p>

---

## 🎯 Overview

**Protest Signs** is a serverless, full-stack e-commerce platform that allows users to browse, purchase, and manage protest sign inventory. The site features user authentication, shopping cart functionality, Stripe payment processing, and a complete admin dashboard for managing listings, tags, and orders.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, TypeScript) |
| **Styling** | Tailwind CSS |
| **Authentication** | Supabase Auth (email/password + Google + Yahoo OAuth) |
| **Database** | Supabase PostgreSQL with Row-Level Security |
| **File Storage** | Supabase Storage (sign images) |
| **Payments** | Stripe Checkout + Webhooks |
| **Deployment** | Vercel (serverless) |
| **Package Manager** | npm |

---

## ✨ Features

### User Features
- **Authentication**: Email/password signup, Google OAuth, Yahoo OAuth, forgot password
- **Browse Signs**: Filter by tags/categories (OR logic), search, sort by price/date
- **Sign Details**: View images, sizes, pricing, stock availability
- **Shopping Cart**: Add multiple items, adjust quantities, persistent cart
- **Checkout**: 
  - **Buy Now**: Direct Stripe checkout for a single item
  - **Cart Checkout**: Stripe checkout with multiple items
- **Inventory Management**: Automatic stock updates after successful purchases
- **Contact Support**: Submit inquiries via contact form

### Admin Features
- **Sign Management**: Create, edit, delete (soft delete), and archive signs
- **Image Upload**: Upload multiple images per sign to Supabase Storage
- **Tag Management**: Create, edit, delete tags/categories
- **Tag Assignment**: Assign multiple tags to signs with custom display order
- **Homepage Curation**: Control which tags appear as homepage groups and their order
- **Order History**: View all orders and their details

---

## 🗄️ Database Schema

### Core Tables

**`profiles`** — User profile data
- `id` (uuid, FK → auth.users)
- `email` (text)
- `full_name` (text)
- `is_admin` (boolean)
- `created_at` (timestamp)

**`tags`** — Categories/filters for signs
- `id` (uuid)
- `name` (text) — e.g. "Popular", "Environment"
- `slug` (text) — e.g. "popular", "environment"
- `show_on_homepage` (boolean) — display as homepage group
- `homepage_order` (integer) — order on homepage
- `created_at` (timestamp)

**`signs`** — Sign listings
- `id` (uuid)
- `title` (text)
- `description` (text)
- `price` (integer, in cents)
- `quantity_available` (integer)
- `images` (text[]) — Supabase Storage URLs
- `sizes` (text) — e.g. "12x18, 18x24, 24x36"
- `archived_at` (timestamp, nullable) — soft delete
- `created_at` (timestamp)
- `updated_at` (timestamp)

**`sign_tags`** — Many-to-many junction for sign-tag relationships
- `sign_id` (uuid, FK → signs)
- `tag_id` (uuid, FK → tags)
- `display_order` (integer) — position within this tag group

**`cart_items`** — User shopping cart
- `id` (uuid)
- `user_id` (uuid, FK → auth.users)
- `sign_id` (uuid, FK → signs)
- `quantity` (integer)
- `created_at` (timestamp)

**`orders`** — Completed purchases
- `id` (uuid)
- `user_id` (uuid, FK → auth.users)
- `stripe_session_id` (text)
- `status` (text) — "pending", "completed", "refunded"
- `total` (integer, in cents)
- `created_at` (timestamp)

**`order_items`** — Items in each order
- `id` (uuid)
- `order_id` (uuid, FK → orders)
- `sign_id` (uuid, FK → signs)
- `quantity` (integer)
- `price_at_purchase` (integer, in cents)

**`contact_submissions`** — Support form entries
- `id` (uuid)
- `name` (text)
- `email` (text)
- `message` (text)
- `created_at` (timestamp)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account
- Vercel account (for deployment)

### 1. Clone and Install

```bash
git clone <repository-url>
cd protest-signs
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase Setup

**A. Create Tables**
Run the SQL scripts in `/supabase/schema.sql` in your Supabase SQL Editor to create tables, Row-Level Security policies, and storage buckets.

**B. Enable Auth Providers**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google OAuth**:
   - Get credentials from Google Cloud Console
   - Add authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
3. Enable **Yahoo OAuth**:
   - Get credentials from Yahoo Developer Network
   - Add authorized redirect URI

**C. Create Storage Bucket**
- Bucket name: `sign-images`
- Public access: Yes
- Allowed file types: `image/png`, `image/jpeg`, `image/webp`

### 4. Stripe Setup

**A. Get API Keys**
- Dashboard → Developers → API keys
- Copy Publishable key and Secret key to `.env.local`

**B. Configure Webhook**
1. Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Listen to events: `checkout.session.completed`
4. Copy webhook secret to `.env.local`

### 5. Create Admin User

After signing up through the app:
1. Go to Supabase Dashboard → Table Editor → `profiles`
2. Find your user row
3. Set `is_admin` = `true`

---

## 💻 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Visit `http://localhost:3000`

---

## 🌐 Deployment to Vercel

### One-Click Deploy

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Import Project" → Select your GitHub repo
4. Add environment variables from `.env.local`
5. Deploy

### Webhook Configuration

After first deployment:
1. Copy your Vercel domain (e.g. `https://protestsigns.vercel.app`)
2. Update Stripe webhook endpoint to: `https://protestsigns.vercel.app/api/stripe/webhook`
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
4. Redeploy

---

## 🎨 How to Use the Site

### For Customers

#### 1. **Browse Signs**
- Visit the **homepage** to see curated groups (Popular, Seasonal, etc.)
- Click **"Look at more →"** on any group to see all signs in that category
- Or go directly to the **Browse** page via navigation

#### 2. **Filter & Search**
- Use the **filter sidebar** on the Browse page
- Select multiple tags (e.g. "Environment" + "Climate") to see signs with any of those tags
- Sort by price or newest
- Search by keyword

#### 3. **View Sign Details**
- Click any sign to see full details, images, sizes, and stock availability

#### 4. **Purchase Options**

**Option A: Buy Now (Quick Checkout)**
- Click **"Buy Now"** on a sign detail page
- Redirected directly to Stripe
- Complete payment
- Stock automatically updated

**Option B: Shopping Cart (Multiple Items)**
- Click **"Add to Cart"** on one or more signs
- View cart by clicking cart icon in navigation
- Adjust quantities
- Click **"Checkout"**
- Redirected to Stripe with all items
- Complete payment
- Stock automatically updated for all items
- Cart cleared

#### 5. **Account Management**
- **Sign Up**: Email/password or Google/Yahoo OAuth
- **Login**: Email or social login
- **Forgot Password**: Reset via email link
- View order history in account dashboard

#### 6. **Contact Support**
- Navigate to **Contact** page
- Fill out form (name, email, message)
- Admin receives submission

---

### For Admins

Access admin dashboard at `/admin` (requires `is_admin = true` in database)

#### 1. **Manage Signs**

**Create New Sign:**
- Go to Admin → Signs → "New Sign"
- Fill in title, description, price, quantity, sizes
- Upload images (multiple supported)
- Assign tags with display order
- Publish

**Edit Sign:**
- Click "Edit" next to any sign
- Update details, images, or tags
- Adjust inventory quantity
- Change tag display order (controls position in that tag group)

**Delete Sign:**
- Click "Delete" next to any sign
- Sign is soft-deleted (`archived_at` set)
- Remains in order history
- No longer visible to customers

#### 2. **Manage Tags**

**Create Tag:**
- Go to Admin → Tags → "New Tag"
- Enter name (e.g. "Environment")
- Slug auto-generated (e.g. "environment")
- Toggle **"Show on Homepage"** to feature as a homepage group
- Set **homepage order** (controls group position on homepage)

**Edit Tag:**
- Update name, slug, homepage visibility, or order

**Delete Tag:**
- Removes tag from all signs
- Cannot be undone

#### 3. **Homepage Curation**

To control what appears on the homepage:
1. Go to Admin → Tags
2. Enable **"Show on Homepage"** for desired tags
3. Set **homepage order** (1 = first group, 2 = second, etc.)
4. Signs appear in each group ordered by their `display_order` for that tag

**Example:**
- Tag "Popular" → show_on_homepage: ✓, homepage_order: 1
- Tag "Seasonal" → show_on_homepage: ✓, homepage_order: 2
- Tag "Environment" → show_on_homepage: ✗ (only in browse filters)

#### 4. **Display Order Logic**

When assigning tags to a sign, set **display_order** for each tag:

**Example: "Save the Planet" sign**
- Tag: Popular, display_order: **1** → Appears **1st** in Popular group
- Tag: Environment, display_order: **5** → Appears **5th** in Environment list
- Tag: Climate, display_order: **2** → Appears **2nd** in Climate list

This allows precise control over sign placement in each context.

#### 5. **View Orders**
- Admin → Orders
- See all completed purchases
- View order details and customer info

---

## 🔒 Security

- **Row-Level Security (RLS)** enabled on all Supabase tables
- Users can only read/write their own cart and profile
- Admins have elevated permissions for signs, tags, orders
- **Stripe webhook signature verification** prevents spoofed payments
- **Server-side API routes** protect secret keys
- **Input validation** with Zod on all API endpoints
- **Environment variables** never exposed to client

---

## 📂 Project Structure

```
protest-signs/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (site)/
│   │   ├── page.tsx                 # Homepage
│   │   ├── browse/
│   │   ├── sign/[id]/
│   │   ├── cart/
│   │   └── contact/
│   ├── admin/
│   │   ├── signs/
│   │   ├── tags/
│   │   └── orders/
│   ├── api/
│   │   └── stripe/
│   │       ├── checkout/
│   │       └── webhook/
│   └── layout.tsx
├── components/
│   ├── ui/                          # Reusable UI components
│   └── ...
├── lib/
│   ├── supabase/                    # Supabase client & helpers
│   ├── stripe/                      # Stripe helpers
│   └── utils.ts
├── supabase/
│   └── schema.sql                   # Database setup scripts
├── public/
├── .env.local
├── package.json
└── README.md
```

---

## 🐛 Troubleshooting

### Stripe Webhook Not Working
- Verify webhook endpoint URL matches deployment URL
- Check webhook secret in `.env.local`
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Auth Redirect Issues
- Ensure `NEXT_PUBLIC_SITE_URL` matches your actual domain
- Check OAuth redirect URIs in Google/Yahoo consoles match Supabase callback URL

### Images Not Uploading
- Verify Supabase Storage bucket `sign-images` exists and is public
- Check storage policies allow authenticated users to upload

---

## 📄 License

MIT

---

## 📧 Support

For questions or issues, use the Contact page on the site or reach out to the development team. 
