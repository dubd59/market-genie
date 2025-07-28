-- Row Level Security (RLS) Policies for Market Genie
-- Ensures users can only access their own data

-- Genie Wishes Policies
CREATE POLICY "Users can view their own wishes"
  ON genie_wishes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishes"
  ON genie_wishes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishes"
  ON genie_wishes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Campaigns Policies
CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Campaign Analytics Policies
CREATE POLICY "Users can view analytics for their campaigns"
  ON campaign_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_analytics.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analytics for their campaigns"
  ON campaign_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_analytics.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analytics for their campaigns"
  ON campaign_analytics FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_analytics.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Funnel Events Policies
CREATE POLICY "Users can view their own funnel events"
  ON funnel_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own funnel events"
  ON funnel_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can create funnel events"
  ON funnel_events FOR INSERT
  TO anon
  WITH CHECK (true); -- Allow anonymous tracking for public pages

-- Contacts Policies
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Contact Segments Policies
CREATE POLICY "Users can view their own segments"
  ON contact_segments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own segments"
  ON contact_segments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own segments"
  ON contact_segments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own segments"
  ON contact_segments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Contact Segment Members Policies
CREATE POLICY "Users can view segment members for their segments"
  ON contact_segment_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contact_segments 
      WHERE contact_segments.id = contact_segment_members.segment_id 
      AND contact_segments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to their segments"
  ON contact_segment_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contact_segments 
      WHERE contact_segments.id = contact_segment_members.segment_id 
      AND contact_segments.user_id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_segment_members.contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove members from their segments"
  ON contact_segment_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contact_segments 
      WHERE contact_segments.id = contact_segment_members.segment_id 
      AND contact_segments.user_id = auth.uid()
    )
  );

-- Campaign Templates Policies (Public read, restricted write)
CREATE POLICY "Everyone can view active templates"
  ON campaign_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON campaign_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Campaign Optimizations Policies
CREATE POLICY "Users can view optimizations for their campaigns"
  ON campaign_optimizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_optimizations.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create optimizations"
  ON campaign_optimizations FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Office Genie Connections Policies
CREATE POLICY "Users can view their own office genie connection"
  ON office_genie_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own office genie connection"
  ON office_genie_connections FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Genie Wish Logs Policies
CREATE POLICY "Users can view their own wish logs"
  ON genie_wish_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create wish logs"
  ON genie_wish_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Additional helper functions for RLS

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT auth.jwt() ->> 'role' = 'admin' OR
           (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a campaign
CREATE OR REPLACE FUNCTION user_owns_campaign(campaign_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM campaigns 
      WHERE id = campaign_id AND user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION user_owns_campaign(UUID) TO authenticated;
