# Deployment Guide

## Production Deployment — Vercel + Supabase

1. Install dependencies locally:

   ```bash
   npm install
   ```

2. Configure environment variables in Vercel:

   - `DATABASE_URL` — Supabase pooler URL, usually port `6543`, with `?pgbouncer=true&connection_limit=10`
   - `DIRECT_URL` — direct PostgreSQL URL, usually port `5432`, used by Prisma migrations
   - `NEXT_PUBLIC_SITE_URL` — production site URL
   - `JWT_SECRET` / `SESSION_SECRET` — long random secrets
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — emergency/env fallback admin login

3. Apply database migrations from a local trusted machine:

   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

4. Build locally before deploying:

   ```bash
   npm run build
   ```

5. Deploy with Vercel CLI or Git integration:

   ```bash
   vercel --prod
   ```

## Local Development

1. Copy env example:

   ```bash
   cp .env.example .env.local
   ```

2. Fill PostgreSQL credentials.
3. Generate Prisma client and run dev server:

   ```bash
   npx prisma generate
   npm run dev
   ```

## Production Notes

- Do not use SQLite in this project; Prisma datasource is PostgreSQL.
- Keep `.env` and `.env.local` out of git.
- Supabase pooler is required for serverless runtime stability; direct URL is required for migrations.
- Verify after deploy:
  - `/`
  - `/admin`
  - `/api/public/site`
  - `/api/talents`
  - `/api/posts`
- Put real ITSOL logo/photo assets in `public/brand/`.
- Add backup policy, uptime monitoring, form spam protection and domain/SSL checks before public launch.

## Suggested Next Phase

- Configure custom domain.
- Add uploaded media storage for blog/case studies.
- Add richer case study and blog detail content.
- Add email notifications for contact/staffing/career submissions.
- Add admin user management and audit log.
