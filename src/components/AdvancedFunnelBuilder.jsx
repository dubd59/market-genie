import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Pause, 
  Save, 
  Eye, 
  Settings,
  Mail,
  MessageSquare,
  Share2,
  Users,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowDown,
  ArrowRight,
  Trash2,
  Copy,
  Brain,
  TrendingUp,
  BarChart3,
  Wand2,
  Rocket,
  Crown,
  Star,
  Lightbulb
} from 'lucide-react';

const AdvancedFunnelBuilder = () => {
  const [activeFunnels, setActiveFunnels] = useState([
    {
      id: 1,
      name: 'AI-Optimized SaaS Demo Funnel',
      type: 'Lead Generation',
      status: 'live',
      visitors: 12847,
      conversions: 2156,
      revenue: '$324,750',
      conversionRate: 16.8,
      pages: 5,
      aiOptimized: true,
      lastOptimized: '2 hours ago',
      aiScore: 95,
      wishesGranted: 247,
      predictedRevenue: '$425,000',
      smartFeatures: ['AI Headlines', 'Dynamic Pricing', 'Behavior Triggers', 'Exit Intent AI']
    },
    {
      id: 2,
      name: 'Genie-Powered E-commerce Flow',
      type: 'Sales',
      status: 'live',
      visitors: 8923,
      conversions: 1834,
      revenue: '$156,890',
      conversionRate: 20.5,
      pages: 4,
      aiOptimized: true,
      lastOptimized: '45 minutes ago',
      aiScore: 92,
      wishesGranted: 189,
      predictedRevenue: '$210,000',
      smartFeatures: ['Personalized Offers', 'Smart Upsells', 'Cart Recovery AI', 'Price Optimization']
    },
    {
      id: 3,
      name: 'Magical Webinar Registration',
      type: 'Event',
      status: 'live',
      visitors: 5642,
      conversions: 3421,
      revenue: '$89,500',
      conversionRate: 60.6,
      pages: 3,
      aiOptimized: true,
      lastOptimized: '1 hour ago',
      aiScore: 98,
      wishesGranted: 421,
      predictedRevenue: '$125,000',
      smartFeatures: ['Time-Based Urgency', 'Social Proof AI', 'Dynamic CTAs', 'Audience Matching']
    },
    {
      id: 4,
      name: 'Wish-Granting High-Ticket Funnel',
      type: 'High-Ticket',
      status: 'live',
      visitors: 2134,
      conversions: 287,
      revenue: '$574,000',
      conversionRate: 13.4,
      pages: 7,
      aiOptimized: true,
      lastOptimized: '30 minutes ago',
      aiScore: 94,
      wishesGranted: 87,
      predictedRevenue: '$750,000',
      smartFeatures: ['Psychology AI', 'Trust Signals', 'Objection Handling', 'Authority Building']
    }
  ]);

  const [funnelTemplates] = useState([
    {
      name: 'AI Genie Lead Magnet',
      type: 'Lead Generation',
      pages: 3,
      features: ['AI-Generated Headlines', 'Smart Form Fields', 'Behavioral Triggers', 'Auto-Segmentation'],
      conversionRate: '35-45%',
      icon: '�‍♂️',
      description: 'AI creates personalized lead magnets that adapt to each visitor',
      aiPowered: true
    },
    {
      name: 'Wish-Granting VSL',
      type: 'Sales',
      pages: 2,
      features: ['AI Video Personalization', 'Dynamic Script Optimization', 'Smart Pricing', 'Exit-Intent Magic'],
      conversionRate: '25-35%',
      icon: '✨',
      description: 'Video sales letters that grant conversion wishes with AI optimization',
      aiPowered: true
    },
    {
      name: 'Magical Webinar Funnel',
      type: 'Event',
      pages: 4,
      features: ['AI Attendance Prediction', 'Smart Scheduling', 'Engagement AI', 'Replay Optimization'],
      conversionRate: '55-75%',
      icon: '�',
      description: 'Webinars that magically adapt to audience behavior and interests',
      aiPowered: true
    },
    {
      name: 'Golden High-Ticket Funnel',
      type: 'High-Ticket',
      pages: 5,
      features: ['Psychology AI', 'Trust Score Algorithm', 'Objection Predictor', 'Authority Builder'],
      conversionRate: '15-25%',
      icon: '�',
      description: 'High-ticket funnels with AI-powered trust and authority building',
      aiPowered: true
    },
    {
      name: 'Genie Launch Sequence',
      type: 'Launch',
      pages: 8,
      features: ['AI Hype Generator', 'Smart Scarcity', 'Viral Mechanics', 'Conversion Prediction'],
      conversionRate: '20-30%',
      icon: '🚀',
      description: 'Product launches that create magical buzz and irresistible demand',
      aiPowered: true
    },
    {
      name: 'Enchanted Membership Funnel',
      type: 'Recurring',
      pages: 4,
      features: ['Retention AI', 'Churn Prevention', 'Value Optimization', 'Loyalty Rewards'],
      conversionRate: '18-28%',
      icon: '🏰',
      description: 'Membership funnels that keep subscribers enchanted and engaged',
      aiPowered: true
    }
  ]);

  const getTotalRevenue = () => {
    return activeFunnels.reduce((sum, funnel) => {
      return sum + parseFloat(funnel.revenue.replace('$', '').replace(',', ''));
    }, 0);
  };

  const getTotalConversions = () => {
    return activeFunnels.reduce((sum, funnel) => sum + funnel.conversions, 0);
  };

  const getAverageConversionRate = () => {
    return (activeFunnels.reduce((sum, funnel) => sum + funnel.conversionRate, 0) / activeFunnels.length).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-green-800 flex items-center gap-3">
            <span className="text-3xl">🏗️</span>
            Advanced AI Funnel Builder
          </h3>
          <p className="text-gray-600 mt-1">ClickFunnels + HighLevel on steroids with AI optimization and social media integration</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">${getTotalRevenue().toLocaleString()}</div>
          <div className="text-xs text-gray-500">{getAverageConversionRate()}% avg conversion</div>
        </div>
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 font-medium">Active Funnels</div>
          <div className="text-2xl font-bold text-green-800">{activeFunnels.length}</div>
          <div className="text-xs text-green-600">All AI-optimized</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Conversions</div>
          <div className="text-2xl font-bold text-blue-800">{getTotalConversions().toLocaleString()}</div>
          <div className="text-xs text-blue-600">This month</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Avg Conversion Rate</div>
          <div className="text-2xl font-bold text-purple-800">{getAverageConversionRate()}%</div>
          <div className="text-xs text-purple-600">Industry leading</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">AI Optimizations</div>
          <div className="text-2xl font-bold text-orange-800">247</div>
          <div className="text-xs text-orange-600">Today</div>
        </div>
      </div>

      {/* Active Funnels */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">Live Funnels Performance</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeFunnels.map(funnel => (
            <div key={funnel.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-semibold text-gray-900">{funnel.name}</h5>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{funnel.type}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{funnel.pages} pages</span>
                    {funnel.aiOptimized && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">🤖 AI Optimized</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{funnel.revenue}</div>
                  <div className="text-xs text-gray-500">Revenue</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <div className="text-gray-500">Visitors</div>
                  <div className="font-medium">{funnel.visitors.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Conversions</div>
                  <div className="font-medium">{funnel.conversions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Conv. Rate</div>
                  <div className="font-medium text-green-600">{funnel.conversionRate}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-purple-600">
                  🤖 Last AI optimization: {funnel.lastOptimized}
                </div>
                <div className="flex gap-2">
                  <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors">
                    Edit
                  </button>
                  <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors">
                    Analytics
                  </button>
                  <button className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs hover:bg-purple-200 transition-colors">
                    Clone
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel Templates */}
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-gray-900 mb-4">High-Converting Funnel Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {funnelTemplates.map((template, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h5 className="font-semibold text-gray-900">{template.name}</h5>
                  <p className="text-sm text-gray-600">{template.type} • {template.pages} pages</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs font-medium text-gray-500 mb-1">FEATURES</div>
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">Expected Rate:</span>
                  <span className="font-medium text-green-600 ml-1">{template.conversionRate}</span>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors">
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-5 border border-green-200 mb-6">
        <h4 className="font-semibold text-green-800 mb-3">🚀 Advanced Features (Beyond ClickFunnels/HighLevel)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <h5 className="font-medium text-gray-900 mb-2">🤖 AI Auto-Optimization</h5>
            <p className="text-sm text-gray-600">Real-time A/B testing with GPT-4 powered headline and copy optimization</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <h5 className="font-medium text-gray-900 mb-2">🌐 Social Media Integration</h5>
            <p className="text-sm text-gray-600">Direct lead capture from LinkedIn, Facebook, Instagram, and TikTok</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <h5 className="font-medium text-gray-900 mb-2">📊 Predictive Analytics</h5>
            <p className="text-sm text-gray-600">AI predicts conversion probability and suggests optimization strategies</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <h5 className="font-medium text-gray-900 mb-2">🎯 Smart Personalization</h5>
            <p className="text-sm text-gray-600">Dynamic content based on traffic source, behavior, and social media data</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-red-200">
            <h5 className="font-medium text-gray-900 mb-2">⚡ Voice & Video AI</h5>
            <p className="text-sm text-gray-600">AI-generated personalized video messages and voice interactions</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-200">
            <h5 className="font-medium text-gray-900 mb-2">🔗 Cross-Platform Tracking</h5>
            <p className="text-sm text-gray-600">Unified analytics across all social platforms and marketing channels</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {activeFunnels.length} active funnels • ${getTotalRevenue().toLocaleString()} total revenue • {getAverageConversionRate()}% avg conversion
        </div>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Create New Funnel
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Funnel Marketplace
          </button>
          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
            AI Optimizer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFunnelBuilder;
