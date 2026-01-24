-- Fix deals.stage column: Convert from DealStage enum to String
-- This migration preserves all existing data by casting enum values to text

-- Step 1: Convert stage column from enum to text, preserving existing values
ALTER TABLE "deals"
  ALTER COLUMN "stage" TYPE TEXT
  USING "stage"::TEXT;

-- Step 2: Update default value to match Prisma schema (Title case instead of UPPER)
ALTER TABLE "deals"
  ALTER COLUMN "stage" SET DEFAULT 'Lead';

-- Step 3: Add missing archive tracking columns
ALTER TABLE "deals"
  ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "archiveReason" TEXT;

-- Step 4: Add missing loss tracking columns
ALTER TABLE "deals"
  ADD COLUMN IF NOT EXISTS "isLost" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lossReason" TEXT,
  ADD COLUMN IF NOT EXISTS "stageAtLoss" TEXT;

-- Note: The DealStage enum type is intentionally NOT dropped.
-- It still exists in the Prisma schema for potential future use,
-- but is no longer used by the deals table.
-- If you want to remove it later: DROP TYPE IF EXISTS "DealStage";
