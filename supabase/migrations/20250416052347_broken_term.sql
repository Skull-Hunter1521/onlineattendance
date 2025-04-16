/*
  # Create attendance system tables

  1. New Tables
    - `attendance`
      - `id` (uuid, primary key)
      - `enrollment` (text, not null)
      - `division` (text, not null)
      - `status` (text, not null)
      - `date` (date, not null)
      - `created_at` (timestamp with time zone)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `attendance` table
    - Add policies for authenticated users to:
      - Read all attendance records
      - Insert their own attendance records
*/

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment text NOT NULL,
  division text NOT NULL,
  status text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all attendance records"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert attendance records"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);