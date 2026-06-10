-- Flyway migration: add profile_photo column to user table
-- Adjust table name if different; default entity name is `user` so JPA may create `users` or `user`.
-- Check your actual table name. For H2 default, it will probably be `user` or `users` depending on JPA naming strategy.

ALTER TABLE users ADD COLUMN profile_photo TEXT;
