-- Migration to add question column to question table
ALTER TABLE question ADD COLUMN question TEXT;
