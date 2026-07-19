-- FIX: Run this FIRST if signup is broken with "Database error saving new user"
-- This removes any broken trigger/function that references missing tables

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
