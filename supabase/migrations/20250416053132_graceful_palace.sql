/*
  # Fix attendance table RLS policies

  1. Changes
    - Drop existing INSERT policy that was too restrictive
    - Add new INSERT policy allowing authenticated users to insert attendance records
    - Keep existing SELECT policy unchanged

  2. Security
    - Ensures authenticated users can insert attendance records
    - Maintains existing read access for authenticated users
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert attendance records" ON attendance;

-- Create new INSERT policy with proper permissions
CREATE POLICY "Users can insert attendance records"
ON attendance
FOR INSERT
TO authenticated
WITH CHECK (true);