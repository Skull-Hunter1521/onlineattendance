/*
  # Fix attendance table RLS policies

  1. Changes
    - Drop existing RLS policies on attendance table
    - Create new, more permissive policies for authenticated users
    
  2. Security
    - Maintains RLS enabled on attendance table
    - Ensures authenticated users can only:
      - Insert records with their own user_id
      - View all attendance records (maintained from previous policy)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert attendance records" ON attendance;
DROP POLICY IF EXISTS "Users can view all attendance records" ON attendance;

-- Recreate policies with correct permissions
CREATE POLICY "Users can insert attendance records"
ON attendance
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can view all attendance records"
ON attendance
FOR SELECT
TO authenticated
USING (true);