# Database Schema

Database: PostgreSQL via Prisma ORM. Production currently targets Supabase PostgreSQL.

## Connection URLs

- `DATABASE_URL`: runtime connection. For Supabase pooler, use port `6543` with `?pgbouncer=true&connection_limit=10`.
- `DIRECT_URL`: direct PostgreSQL connection for Prisma migrations. For Supabase direct DB, use port `5432`.

## Core Tables

- `users`: admin / sales / HR accounts with hashed passwords.
- `site_content`: key-value content for editable website copy.
- `services`: service pages, including Vietnamese and English title, summary and body.
- `case_studies`: success stories by industry and impact.
- `blog_posts`: insight articles for SEO and content marketing.
- `jobs`: career openings.
- `job_applications`: career applications, CV URL, owner, notes and candidate pipeline stage.
- `application_activities`: activity/note timeline for CV/application follow-up.
- `contact_requests`: website contact form submissions.
- `staffing_requests`: Send JD / Request Talent form submissions.
- `staffing_activities`: activity/note timeline for staffing requests.
- `talents`: public/admin talent pool records.
- `talent_requests`: customer requests for specific talents.
- `timesheets`: monthly talent/client delivery tracking.
- `product_inquiries`: product/service inquiry submissions.
- `newsletter_subscribers`: newsletter signups.

## Notes

- Schema is defined in `prisma/schema.prisma`.
- Seed data is defined in `prisma/seed.ts`.
- Admin login primarily verifies DB user password hash; env-based admin credentials are available as a fallback and can sync the DB hash.
- Run migrations with `npm run prisma:migrate` when changing the schema.
