# API List

## Public

- `GET /api/public/site`: returns home content, services, case studies, blog posts and jobs.
- `POST /api/contact`: stores a contact form submission.
- `POST /api/talent-requests`: stores a Request Talent / Send JD submission.

## Admin Auth

- `POST /api/admin/login`: login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- `POST /api/admin/logout`: clear admin session cookie.
- `GET /api/admin/me`: check current admin session.

## Admin CMS

All CMS endpoints require admin session cookie.

- `GET /api/admin/dashboard`: counts content and submissions.
- `GET /api/admin/content`: list editable site content fields.
- `PUT /api/admin/content`: update site content key-value fields.
- `GET /api/admin/services`: list services.
- `POST /api/admin/services`: create or update a service.
- `DELETE /api/admin/services?id=ID`: delete a service.
- `GET /api/admin/case-studies`: list case studies.
- `POST /api/admin/case-studies`: create or update a case study.
- `DELETE /api/admin/case-studies?id=ID`: delete a case study.
- `GET /api/admin/blog`: list blog posts.
- `POST /api/admin/blog`: create or update a blog post.
- `DELETE /api/admin/blog?id=ID`: delete a blog post.
- `GET /api/admin/jobs`: list jobs.
- `POST /api/admin/jobs`: create or update a job.
- `DELETE /api/admin/jobs?id=ID`: delete a job.
- `GET /api/admin/contact-submissions`: list submitted contact forms.
- `GET /api/admin/talent-requests`: list submitted Request Talent forms.
