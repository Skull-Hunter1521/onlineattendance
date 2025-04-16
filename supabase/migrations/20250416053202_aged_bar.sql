/*
  # Fix attendance table RLS policies

  1. Changes
    - Update the INSERT policy to ensure users can only insert records with their own user_id
    
  2. Security
    - Modify RLS policy to enforce user ownership on insert
    - Maintain existing SELECT policy
*/

DROP POLICY IF EXISTS "Users can insert attendance records" ON attendance;

CREATE POLICY "Users can insert attendance records"
ON attendance
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);