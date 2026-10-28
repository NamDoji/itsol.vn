-- Create TimesheetStatus new values (Postgres ALTER TYPE)
ALTER TYPE "TimesheetStatus" ADD VALUE IF NOT EXISTS 'HRSubmitted';
ALTER TYPE "TimesheetStatus" ADD VALUE IF NOT EXISTS 'CHRMApproved';
ALTER TYPE "TimesheetStatus" ADD VALUE IF NOT EXISTS 'BODApproved';
ALTER TYPE "TimesheetStatus" ADD VALUE IF NOT EXISTS 'ClientApproved';
ALTER TYPE "TimesheetStatus" ADD VALUE IF NOT EXISTS 'Invoiced';

-- Create Project table
CREATE TABLE IF NOT EXISTS "Project" (
  "id"          SERIAL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "clientName"  TEXT NOT NULL,
  "clientEmail" TEXT,
  "status"      TEXT NOT NULL DEFAULT 'active',
  "startDate"   TIMESTAMP,
  "endDate"     TIMESTAMP,
  "rate"        TEXT,
  "currency"    TEXT NOT NULL DEFAULT 'VND',
  "description" TEXT,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create ProjectAssignment table
CREATE TABLE IF NOT EXISTS "ProjectAssignment" (
  "id"         SERIAL PRIMARY KEY,
  "talentId"   INTEGER NOT NULL REFERENCES "Talent"("id") ON DELETE CASCADE,
  "projectId"  INTEGER NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "role"       TEXT,
  "startDate"  TIMESTAMP,
  "endDate"    TIMESTAMP,
  "status"     TEXT NOT NULL DEFAULT 'active',
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Update Timesheet: add projectId, approvedBy, invoiceRef
ALTER TABLE "Timesheet" ADD COLUMN IF NOT EXISTS "projectId"  INTEGER REFERENCES "Project"("id") ON DELETE SET NULL;
ALTER TABLE "Timesheet" ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;
ALTER TABLE "Timesheet" ADD COLUMN IF NOT EXISTS "invoiceRef" TEXT;
