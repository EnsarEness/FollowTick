-- Migration: Add type column to events table
-- Run this in Supabase SQL Editor

-- Add type column with default value and check constraint
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'hackathon' 
CHECK (type IN ('hackathon', 'internship', 'course', 'other'));

-- Update existing events to 'hackathon' type if NULL
UPDATE events SET type = 'hackathon' WHERE type IS NULL;

-- Verify the migration
SELECT id, name, type, deadline FROM events LIMIT 5;
