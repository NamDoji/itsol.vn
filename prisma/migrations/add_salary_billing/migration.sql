-- Add salary fields to Talent
ALTER TABLE "Talent" ADD COLUMN IF NOT EXISTS "grossSalary" DOUBLE PRECISION;
ALTER TABLE "Talent" ADD COLUMN IF NOT EXISTS "netSalary"   DOUBLE PRECISION;

-- Add salary & billing to ProjectAssignment
ALTER TABLE "ProjectAssignment" ADD COLUMN IF NOT EXISTS "grossSalary"     DOUBLE PRECISION;
ALTER TABLE "ProjectAssignment" ADD COLUMN IF NOT EXISTS "netSalary"       DOUBLE PRECISION;
ALTER TABLE "ProjectAssignment" ADD COLUMN IF NOT EXISTS "billingRate"     DOUBLE PRECISION;
ALTER TABLE "ProjectAssignment" ADD COLUMN IF NOT EXISTS "billingCurrency" TEXT NOT NULL DEFAULT 'VND';

-- Add back-office flags to Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "isBackOffice"  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "overheadRate"  DOUBLE PRECISION NOT NULL DEFAULT 0.30;
