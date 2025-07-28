-- Market Genie Database Schema
-- Competitive Edge Features Implementation

-- 1. AI Wish Fulfillment System (Unique Differentiator)
CREATE TABLE IF NOT EXISTS genie_wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  wish_text TEXT NOT NULL,
  wish_type TEXT DEFAULT 'general',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  result JSONB, -- Stores AI output and recommendations
  confidence_score NUMERIC(3,2) DEFAULT 0.0,
  source TEXT CHECK (source IN ('text', 'voice', 'suggestion')) DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enhanced Campaigns with Self-Healing Capabilities
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('email', 'social', 'sms', 'web', 'multi-channel')) DEFAULT 'email',
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')) DEFAULT 'draft',
  
  -- Campaign Configuration
  steps JSONB NOT NULL DEFAULT '[]', -- Drag-and-drop workflow config
  settings JSONB DEFAULT '{}',
  subject TEXT,
  content TEXT,
  send_time TIMESTAMPTZ,
  frequency TEXT CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly')) DEFAULT 'once',
  
  -- Self-Healing Features (Competitive Edge)
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  last_auto_fix TIMESTAMPTZ,
  fix_history JSONB[] DEFAULT ARRAY[]::JSONB[], -- Array of automatic corrections
  auto_optimize BOOLEAN DEFAULT true,
  needs_attention BOOLEAN DEFAULT false,
  
  -- Metadata
  template_id UUID,
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Campaign Analytics with Real-time Health Monitoring
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Core Metrics
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  unsubscribes_count INTEGER DEFAULT 0,
  bounces_count INTEGER DEFAULT 0,
  
  -- Calculated Rates
  delivery_rate NUMERIC(5,4) DEFAULT 0.0,
  open_rate NUMERIC(5,4) DEFAULT 0.0,
  click_rate NUMERIC(5,4) DEFAULT 0.0,
  conversion_rate NUMERIC(5,4) DEFAULT 0.0,
  unsubscribe_rate NUMERIC(5,4) DEFAULT 0.0,
  bounce_rate NUMERIC(5,4) DEFAULT 0.0,
  
  -- Revenue Metrics
  revenue_generated NUMERIC(12,2) DEFAULT 0.0,
  cost_per_acquisition NUMERIC(8,2) DEFAULT 0.0,
  return_on_investment NUMERIC(8,2) DEFAULT 0.0,
  
  -- Timestamps
  period_start TIMESTAMPTZ DEFAULT NOW(),
  period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 3D Funnel Analytics (Visual Standout)
CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  
  -- Event Data
  event_type TEXT NOT NULL, -- 'page_view', 'form_submit', 'lead_qualified', 'purchase', etc.
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  
  -- 3D Visualization Coordinates (Competitive Edge)
  rendered_3d_coords JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}', -- x,y,z for Three.js
  funnel_stage INTEGER DEFAULT 0,
  
  -- Attribution
  campaign_id UUID REFERENCES campaigns(id),
  contact_id UUID,
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enhanced Contacts with Smart Segmentation
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Basic Info
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  
  -- Status and Scoring
  status TEXT CHECK (status IN ('lead', 'qualified', 'customer', 'churned', 'unsubscribed')) DEFAULT 'lead',
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  customer_value NUMERIC(12,2) DEFAULT 0.0,
  
  -- Engagement Tracking
  last_activity TIMESTAMPTZ,
  total_email_opens INTEGER DEFAULT 0,
  total_email_clicks INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  
  -- Custom Fields and Tags
  custom_fields JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  source TEXT, -- Where they came from
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contact Segments for Dynamic Grouping
CREATE TABLE IF NOT EXISTS contact_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Segment Rules (Dynamic)
  criteria JSONB NOT NULL DEFAULT '{}', -- Conditions for auto-inclusion
  is_dynamic BOOLEAN DEFAULT true,
  
  -- Metadata
  contact_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Segment Membership (Many-to-Many)
CREATE TABLE IF NOT EXISTS contact_segment_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment_id UUID REFERENCES contact_segments(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Membership tracking
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by TEXT DEFAULT 'system', -- 'system', 'manual', 'import'
  
  UNIQUE(segment_id, contact_id)
);

-- 8. Campaign Templates
CREATE TABLE IF NOT EXISTS campaign_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  -- Template Configuration
  config JSONB NOT NULL DEFAULT '{}',
  preview_image TEXT,
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0.0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Campaign Optimizations Log
CREATE TABLE IF NOT EXISTS campaign_optimizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Optimization Details
  optimization_type TEXT NOT NULL,
  description TEXT,
  changes_made JSONB DEFAULT '{}',
  
  -- Performance Impact
  health_score_before INTEGER,
  health_score_after INTEGER,
  estimated_improvement TEXT,
  actual_improvement JSONB,
  
  -- Metadata
  triggered_by TEXT DEFAULT 'system', -- 'system', 'user', 'schedule'
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Office Genie Integration (Optional)
CREATE TABLE IF NOT EXISTS office_genie_connections (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  
  -- Connection Details
  api_key TEXT, -- Will be encrypted using Supabase Vault
  connection_status TEXT CHECK (connection_status IN ('connected', 'disconnected', 'error')) DEFAULT 'disconnected',
  
  -- Sync Information
  last_sync TIMESTAMPTZ,
  sync_status JSONB DEFAULT '{}',
  
  -- Settings
  settings JSONB DEFAULT '{"auto_sync": true, "sync_frequency": "hourly"}',
  
  -- Metadata
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Wish Fulfillment Logs
CREATE TABLE IF NOT EXISTS genie_wish_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wish_id UUID REFERENCES genie_wishes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  
  -- Processing Details
  processor_type TEXT NOT NULL,
  wish_text TEXT NOT NULL,
  result_summary TEXT,
  processing_time_ms INTEGER,
  
  -- Metadata
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_genie_wishes_user_id ON genie_wishes(user_id);
CREATE INDEX IF NOT EXISTS idx_genie_wishes_status ON genie_wishes(status);
CREATE INDEX IF NOT EXISTS idx_genie_wishes_created_at ON genie_wishes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_health_score ON campaigns(health_score);

CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id ON funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id ON funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_type ON funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_at ON funnel_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON contacts(lead_score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE genie_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_genie_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE genie_wish_logs ENABLE ROW LEVEL SECURITY;
