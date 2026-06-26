-- Update policies to use Supabase Auth for secure access
-- This replaces the previous open policy with authenticated user checks

-- Drop old policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON outreach_assessment;
DROP POLICY IF EXISTS "Allow read access" ON outreach_assessment;

-- Create new policies that require authentication
-- Allow anyone to insert (for the public assessment form)
CREATE POLICY "Allow anonymous inserts" ON outreach_assessment
  FOR INSERT
  WITH CHECK (true);

-- Allow only authenticated users to read (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON outreach_assessment
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Optional: Allow users to update their own submissions if needed
CREATE POLICY "Allow users to update own submissions" ON outreach_assessment
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Optional: Allow users to delete their own submissions if needed
CREATE POLICY "Allow users to delete own submissions" ON outreach_assessment
  FOR DELETE
  USING (auth.uid()::text = id::text);
