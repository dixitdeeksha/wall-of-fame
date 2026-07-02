# Books & Brews Silver Jubilee Wall of Fame

A premium, mobile-first Wall of Fame for the Books & Brews Silver Jubilee Meet Gala & Award Night. Registered attendees claim a frame with their handwritten-style signature; everyone else can admire the wall and register for the gala.

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** + **Framer Motion**
- **Supabase** (PostgreSQL + Realtime)
- **Vercel** (hosting)

## Features

- Luxury award-night landing page with 24+ responsive signature frames
- Registration-gated signing (case-insensitive name match)
- Fly-to-frame signature animation with sparkle effect
- Supabase Realtime — live updates across all open tabs
- Admin dashboard at `/admin` (password protected)
- Rate limiting: 1 sign request per 5 seconds per IP
- Maximum 100 signatures

## Local Development

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste the **entire** contents of [`supabase/SETUP.sql`](supabase/SETUP.sql) → **Run**
3. Verify: open `http://localhost:3000/api/setup-check` — should show `"ok": true`

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Optional — secret key for production (recommended) |
| `ADMIN_PASSWORD` | Password for `/admin` dashboard |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

## Deployment (Vercel)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Add all environment variables from `.env.example`
3. Deploy — no extra configuration required
4. Seed registered users via `/admin` → Bulk Upload (one name per line)
5. Smoke test: sign as a registered user, verify realtime in a second tab, confirm duplicate rejection

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/sign` | POST | Claim a frame (registered users only) |
| `/api/signatures` | GET | List all signatures |
| `/api/admin/login` | POST | Admin password login |
| `/api/admin/logout` | POST | Clear admin session |
| `/api/admin/stats` | GET | Dashboard analytics |
| `/api/admin/users` | POST | Add single or bulk registered users |

## Registration Link

Unregistered visitors are directed to:
https://forms.gle/orBRhUVpKYonykMG9

## Project Structure

```
app/                  # Pages and API routes
components/wall/      # Landing page UI
components/admin/     # Admin dashboard
components/ui/        # Shared animations
lib/                  # Supabase clients, helpers
supabase/migrations/  # Database schema
public/logo.jpg       # Books & Brews logo
```
