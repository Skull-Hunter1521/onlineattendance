-- 🔥 Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can insert attendance records" ON attendance;
DROP POLICY IF EXISTS "Users can view all attendance records" ON attendance;

-- ✅ Enable RLS on the table
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ✅ Create INSERT policy: only allow user to insert their own attendance
CREATE POLICY "Users can insert attendance records"
ON attendance
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id  -- Ensure the row's user_id matches the logged-in user
);

-- ✅ Create SELECT policy: allow all authenticated users to read attendance
CREATE POLICY "Users can view all attendance records"
ON attendance
FOR SELECT
TO authenticated
USING (
  true  -- All authenticated users can view all records
);
