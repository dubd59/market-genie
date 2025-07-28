-- Self-Healing Campaign System (Competitive Differentiator)
-- Automatically detects and fixes poor performing campaigns

-- Function to calculate campaign health score
CREATE OR REPLACE FUNCTION calculate_campaign_health_score(campaign_id UUID)
RETURNS INTEGER AS $$
DECLARE
  analytics_record RECORD;
  health_score INTEGER := 100;
BEGIN
  -- Get latest analytics for the campaign
  SELECT * INTO analytics_record
  FROM campaign_analytics
  WHERE campaign_analytics.campaign_id = calculate_campaign_health_score.campaign_id
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- If no analytics exist, return default score
  IF analytics_record IS NULL THEN
    RETURN 50;
  END IF;
  
  -- Deduct points based on poor performance
  -- Email open rate penalty
  IF analytics_record.open_rate < 0.15 THEN
    health_score := health_score - 30;
  ELSIF analytics_record.open_rate < 0.20 THEN
    health_score := health_score - 15;
  END IF;
  
  -- Click rate penalty
  IF analytics_record.click_rate < 0.02 THEN
    health_score := health_score - 25;
  ELSIF analytics_record.click_rate < 0.03 THEN
    health_score := health_score - 10;
  END IF;
  
  -- Conversion rate penalty
  IF analytics_record.conversion_rate < 0.01 THEN
    health_score := health_score - 30;
  ELSIF analytics_record.conversion_rate < 0.02 THEN
    health_score := health_score - 15;
  END IF;
  
  -- Unsubscribe rate penalty
  IF analytics_record.unsubscribe_rate > 0.05 THEN
    health_score := health_score - 20;
  ELSIF analytics_record.unsubscribe_rate > 0.03 THEN
    health_score := health_score - 10;
  END IF;
  
  -- Bounce rate penalty
  IF analytics_record.bounce_rate > 0.10 THEN
    health_score := health_score - 15;
  ELSIF analytics_record.bounce_rate > 0.05 THEN
    health_score := health_score - 5;
  END IF;
  
  -- Add bonus points for excellent performance
  IF analytics_record.open_rate > 0.30 THEN
    health_score := health_score + 5;
  END IF;
  
  IF analytics_record.click_rate > 0.05 THEN
    health_score := health_score + 5;
  END IF;
  
  IF analytics_record.conversion_rate > 0.03 THEN
    health_score := health_score + 10;
  END IF;
  
  -- Ensure score is within bounds
  health_score := GREATEST(0, LEAST(100, health_score));
  
  RETURN health_score;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-fix poor performing campaigns
CREATE OR REPLACE FUNCTION auto_fix_campaign()
RETURNS TRIGGER AS $$
DECLARE
  fix_record JSONB;
  analytics_record RECORD;
  new_subject TEXT;
  new_send_time TIMESTAMPTZ;
BEGIN
  -- Only process if health score is poor and auto-optimize is enabled
  IF NEW.health_score >= 70 OR NEW.auto_optimize = FALSE THEN
    RETURN NEW;
  END IF;
  
  -- Prevent too frequent auto-fixes (minimum 1 hour between fixes)
  IF NEW.last_auto_fix IS NOT NULL AND 
     NEW.last_auto_fix > NOW() - INTERVAL '1 hour' THEN
    RETURN NEW;
  END IF;
  
  -- Get campaign analytics
  SELECT * INTO analytics_record
  FROM campaign_analytics
  WHERE campaign_id = NEW.id
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- Initialize fix record
  fix_record := jsonb_build_object(
    'fixed_at', NOW(),
    'health_score_before', OLD.health_score,
    'health_score_after', NEW.health_score,
    'fixes', '[]'::jsonb
  );
  
  -- Fix 1: Poor open rates - optimize subject line
  IF analytics_record.open_rate < 0.20 THEN
    new_subject := NEW.subject;
    
    -- Add urgency if not present
    IF NEW.subject IS NOT NULL AND 
       NEW.subject NOT LIKE '%[URGENT]%' AND 
       NEW.subject NOT LIKE '%🔥%' AND
       NEW.subject NOT LIKE '%⚡%' THEN
      new_subject := '🔥 ' || NEW.subject;
      NEW.subject := new_subject;
      
      fix_record := jsonb_set(
        fix_record,
        '{fixes}',
        (fix_record->'fixes') || jsonb_build_array(jsonb_build_object(
          'type', 'subject_optimization',
          'action', 'Added urgency indicator to subject line',
          'old_value', OLD.subject,
          'new_value', new_subject,
          'expected_improvement', '15-25% open rate increase'
        ))
      );
    END IF;
    
    -- Optimize send time to 10 AM if currently outside optimal window
    IF NEW.send_time IS NOT NULL AND 
       EXTRACT(hour FROM NEW.send_time) NOT BETWEEN 9 AND 11 THEN
      new_send_time := date_trunc('day', NEW.send_time) + INTERVAL '10 hours';
      NEW.send_time := new_send_time;
      
      fix_record := jsonb_set(
        fix_record,
        '{fixes}',
        (fix_record->'fixes') || jsonb_build_array(jsonb_build_object(
          'type', 'send_time_optimization',
          'action', 'Rescheduled to optimal time (10:00 AM)',
          'old_value', OLD.send_time,
          'new_value', new_send_time,
          'expected_improvement', '10-20% open rate increase'
        ))
      );
    END IF;
  END IF;
  
  -- Fix 2: High unsubscribe rates - reduce frequency
  IF analytics_record.unsubscribe_rate > 0.05 AND NEW.frequency = 'daily' THEN
    NEW.frequency := 'weekly';
    
    fix_record := jsonb_set(
      fix_record,
      '{fixes}',
      (fix_record->'fixes') || jsonb_build_array(jsonb_build_object(
        'type', 'frequency_optimization',
        'action', 'Reduced send frequency from daily to weekly',
        'old_value', 'daily',
        'new_value', 'weekly',
        'expected_improvement', '50-70% unsubscribe rate reduction'
      ))
    );
  END IF;
  
  -- Fix 3: Poor click rates - flag for manual CTA review
  IF analytics_record.click_rate < 0.02 THEN
    NEW.needs_attention := TRUE;
    
    fix_record := jsonb_set(
      fix_record,
      '{fixes}',
      (fix_record->'fixes') || jsonb_build_array(jsonb_build_object(
        'type', 'cta_review_needed',
        'action', 'Flagged for manual CTA optimization',
        'manual_action_required', true,
        'expected_improvement', '20-40% click rate increase'
      ))
    );
  END IF;
  
  -- Apply fixes if any were made
  IF jsonb_array_length(fix_record->'fixes') > 0 THEN
    NEW.last_auto_fix := NOW();
    NEW.fix_history := COALESCE(NEW.fix_history, ARRAY[]::JSONB[]) || fix_record;
    
    -- Log the optimization
    INSERT INTO campaign_optimizations (
      campaign_id,
      optimization_type,
      description,
      changes_made,
      health_score_before,
      health_score_after,
      triggered_by
    ) VALUES (
      NEW.id,
      'auto_fix',
      'Automatic campaign health optimization',
      fix_record,
      OLD.health_score,
      NEW.health_score,
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign health score when analytics change
CREATE OR REPLACE FUNCTION update_campaign_health_on_analytics_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate new health score
  UPDATE campaigns 
  SET 
    health_score = calculate_campaign_health_score(NEW.campaign_id),
    updated_at = NOW()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to find lookalike leads (for AI wish fulfillment)
CREATE OR REPLACE FUNCTION find_lookalike_leads(customer_data JSONB, user_id_param UUID)
RETURNS TABLE(
  email TEXT,
  similarity_score NUMERIC,
  matching_attributes TEXT[]
) AS $$
BEGIN
  -- This is a simplified version - in production you'd use more sophisticated ML
  RETURN QUERY
  SELECT 
    c.email,
    CASE 
      WHEN c.company = (customer_data->0->>'company') THEN 0.8
      WHEN c.position = (customer_data->0->>'position') THEN 0.6
      ELSE 0.3
    END as similarity_score,
    ARRAY['company', 'position'] as matching_attributes
  FROM contacts c
  WHERE c.user_id = user_id_param
    AND c.status = 'lead'
    AND (
      c.company = (customer_data->0->>'company') OR
      c.position = (customer_data->0->>'position')
    )
  ORDER BY similarity_score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers

-- Trigger for campaign health monitoring and auto-fixing
CREATE TRIGGER campaign_health_monitor
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  WHEN (NEW.health_score IS DISTINCT FROM OLD.health_score)
  EXECUTE FUNCTION auto_fix_campaign();

-- Trigger to update campaign health when analytics change
CREATE TRIGGER campaign_analytics_health_update
  AFTER INSERT OR UPDATE ON campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_health_on_analytics_change();

-- Function to automatically calculate and update health scores (for scheduled jobs)
CREATE OR REPLACE FUNCTION refresh_all_campaign_health_scores()
RETURNS INTEGER AS $$
DECLARE
  campaign_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  -- Update health scores for all active campaigns
  FOR campaign_record IN 
    SELECT id FROM campaigns WHERE status = 'active'
  LOOP
    UPDATE campaigns 
    SET health_score = calculate_campaign_health_score(campaign_record.id)
    WHERE id = campaign_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- RPC function to calculate campaign health (callable from frontend)
CREATE OR REPLACE FUNCTION rpc_calculate_campaign_health(campaign_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN calculate_campaign_health_score(campaign_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION rpc_calculate_campaign_health(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_lookalike_leads(JSONB, UUID) TO service_role;
