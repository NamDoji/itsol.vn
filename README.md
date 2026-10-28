# ITSOL Corporate Website

Corporate website for ITSOL, positioning the company as **Talents Trusted Partner for the AI Era**.

## Stack

- Next.js 15 + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Supabase
- Next.js API routes
- Admin dashboard with cookie session auth
- Vercel deployment

## Pages

- Home
- About ITSOL
- Services: IT Staffing, Software Outsourcing, ODC, Product Development
- Industries
- Case Studies
- Products / AI Ecosystem
- Careers
- Blog / Insights
- Contact
- IT Staffing landing page + talent pool
- Admin Dashboard

## Run Local

```bash
cd /Users/cuongdoji/.openclaw/workspace/code_projects/itsol-corporate-website
cp .env.example .env.local
npm install
npx prisma generate
npm run dev
```

Open:

- Website: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Environment

Set these values in `.env.local` for local development and in Vercel for production:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
JWT_SECRET="change-this-long-random-secret"
SESSION_SECRET="change-this-long-random-secret"
ADMIN_EMAIL="admin@itsol.vn"
ADMIN_PASSWORD="change-this-password"
```

Notes:

- `DATABASE_URL` should use the Supabase pooler in PgBouncer transaction mode for runtime queries.
- `DIRECT_URL` should use the direct PostgreSQL connection for Prisma migrations.
- Do not commit real `.env` or `.env.local` files.

## Admin

Admin can manage:

- Dashboard metrics
- Website content blocks
- Blog posts
- Job openings and applications
- Contact submissions
- Staffing requests and activity notes
- Talent pool
- Timesheets

The backend also stores:

- Contact form submissions
- Request Talent / Send JD submissions
- Career applications and CV URLs
- Product inquiries / newsletter records

## Useful Commands

```bash
npm run build
npm run prisma:migrate
npm run prisma:seed
npm run lint
```

## Documentation

- Discovery proposal: `docs/00-discovery-proposal.md`
- Database schema: `docs/01-database-schema.md`
- API list: `docs/02-api-list.md`
- Deployment guide: `docs/03-deployment-guide.md`

## Notes

- No secrets are hard-coded.
- Real logo assets live in `public/brand/`.
- The public site supports Vietnamese and English via `?lang=vi|en`.
