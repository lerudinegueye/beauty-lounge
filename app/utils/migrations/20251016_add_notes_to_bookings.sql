-- Adds a notes column to bookings table if it doesn't exist (MySQL-compatible)
-- Some MySQL/MariaDB versions don't support "ADD COLUMN IF NOT EXISTS".
-- This script checks INFORMATION_SCHEMA and conditionally runs the ALTER TABLE.

SET @db := DATABASE();
SET @col_exists := (
	SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'notes'
);

SET @sql := IF(
	@col_exists = 0,
	'ALTER TABLE `bookings` ADD COLUMN `notes` TEXT NULL',
	'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;