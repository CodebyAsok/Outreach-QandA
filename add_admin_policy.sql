-- Add policy to allow admin read access to outreach_assessment table
-- This policy allows anyone to read the data (for the admin dashboard)
-- In production, you should restrict this to authenticated admin users

DROP POLICY IF EXISTS "Allow read access" ON outreach_assessment;

CREATE POLICY "Allow read access" ON outreach_assessment
  FOR SELECT
  USING (true);
