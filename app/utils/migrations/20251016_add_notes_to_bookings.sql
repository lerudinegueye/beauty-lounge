-- Adds a notes column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT NULL;