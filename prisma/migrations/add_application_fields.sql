-- Add rich candidate management fields to JobApplication
ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "internalNotes" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "projectMatch" TEXT;
ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "candidateStatus" TEXT DEFAULT 'new';
