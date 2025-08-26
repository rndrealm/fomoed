-- First, update any existing null email values
-- This ensures we don't have constraint violations when making the column non-nullable
UPDATE "public"."users" 
SET "email" = 'placeholder@example.com' 
WHERE "email" IS NULL;

-- Make the email column non-nullable
ALTER TABLE "public"."users" 
ALTER COLUMN "email" SET NOT NULL;
