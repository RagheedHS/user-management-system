-- Flyway migration: backfill created_at / updated_at and active defaults for existing users
-- Only updates rows where values are NULL. Safe no-op for rows already populated.

UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
UPDATE users SET active = TRUE WHERE active IS NULL;
