/*
  # Fix attendance table RLS policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies with proper authentication checks
    
  2. Security
    - Enable RLS (already enabled)
    - Add policies for:
      - INSERT: Users can only insert their own attendance records
      - SELECT: Users can view all attendance records (unchanged)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert attendance records" ON attendance;
DROP POLICY IF EXISTS "Users can view all attendance records" ON attendance;

-- Recreate policies with proper checks
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