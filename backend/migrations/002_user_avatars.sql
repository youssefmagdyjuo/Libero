-- Add avatar support to users table
USE libero_db;

ALTER TABLE users
    ADD COLUMN avatar_key VARCHAR(64) NULL AFTER username;

