import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  Eye,
  MousePointer,
  ShoppingCart,
  Sparkles,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Funnel3D from '../components/ui/Funnel3D'
import GenieConsole from '../components/ai/GenieConsole'
import { useGenie } from '../contexts/GenieContext'
import { useCampaignHealth } from '../features/self-healing/useCampaignHealth'
import { generateSampleFunnelData, calculateFunnelMetrics } from '../services/funnel3d'

export default function Dashboard() {
  const { analytics, campaigns } = useGenie()
  const [selectedFunnelStage, setSelectedFunnelStage] = useState(null)
  const [funnelData, setFunnelData] = useState([])
  const [funnelMetrics, setFunnelMetrics] = useState({})
  const [showGenieConsole, setShowGenieConsole] = useState(false)

  // Sample data for demonstration
  useEffect(() => {
    const sampleData = generateSampleFunnelData()
    setFunnelData(sampleData)
    
    const metrics = calculateFunnelMetrics([
      { name: 'Visitors', count: 1000 },
      { name: 'Leads', count: 200 },
      { name: 'Qualified', count: 50 },
      { name: 'Customers', count: 12 }
    ])
    setFunnelMetrics(metrics)
  }, [])

  const handleFunnelStageClick = (stageData) => {
    setSelectedFunnelStage(stageData)
  }

  const statCards = [
    {
      name: 'Total Visitors',
      value: funnelMetrics.totalVisitors?.toLocaleString() || '1,000',
      change: '+12.5%',
      changeType: 'increase',
      icon: Eye,
      color: 'blue'
    },
    {
      name: 'Qualified Leads',
      value: analytics.totalLeads?.toLocaleString() || '50',
      change: '+23.1%',
      changeType: 'increase',
      icon: Users,
      color: 'teal'
    },
    {
      name: 'Conversion Rate',
      value: `${funnelMetrics.overallConversionRate?.toFixed(1) || '1.2'}%`,
      change: '+4.3%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'green'
    },
    {
      name: 'Revenue Generated',
      value: `$${analytics.revenueGenerated?.toLocaleString() || '24,500'}`,
      change: '+18.7%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'orange'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'optimization',
      title: 'Campaign auto-optimized',
      description: 'Summer Sale email campaign open rate improved by 23%',
      time: '5 minutes ago',
      icon: Zap,
      color: 'green'
    },
    {
      id: 2,
      type: 'leads',
      title: 'New qualified leads',
      description: '12 new leads from Facebook campaign',
      time: '1 hour ago',
      icon: Users,
      color: 'blue'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Campaign needs attention',
      description: 'Newsletter campaign health score dropped to 65%',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'success',
      title: 'Goal achieved',
      description: 'Monthly lead generation target reached',
      time: '1 day ago',
      icon: CheckCircle,
      color: 'green'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights and 3D funnel visualization
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGenieConsole(!showGenieConsole)}
          className="btn-teal flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Ask Marketing Genie
        </motion.button>
      </div>

      {/* Genie Console */}
      {showGenieConsole && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card-genie p-6"
        >
          <GenieConsole />
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-genie p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Funnel Visualization - Competitive Edge */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-genie p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">3D Marketing Funnel</h2>
                <p className="text-gray-600">Interactive visualization of your customer journey</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                Real-time data
              </div>
            </div>

            <Funnel3D 
              data={funnelData}
              stages={[
                { name: 'Visitors', count: 1000 },
                { name: 'Leads', count: 200 },
                { name: 'Qualified', count: 50 },
                { name: 'Customers', count: 12 }
              ]}
              onStageClick={handleFunnelStageClick}
            />

            {/* Funnel Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {funnelMetrics.overallConversionRate?.toFixed(1) || '1.2'}%
                </div>
                <div className="text-sm text-gray-600">Overall Conversion</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {funnelMetrics.healthScore?.toFixed(0) || '75'}
                </div>
                <div className="text-sm text-gray-600">Funnel Health</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {funnelMetrics.dropOffPoints?.length || 2}
                </div>
                <div className="text-sm text-gray-600">Drop-off Points</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-genie p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${activity.color}-100`}>
                    <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-sm text-teal-600 hover:text-teal-800 font-medium">
              View all activities
            </button>
          </motion.div>
        </div>
      </div>

      {/* Campaign Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-genie p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Active Campaigns</h2>
          
          <div className="space-y-4">
            {[
              { name: 'Summer Sale Email', health: 92, status: 'excellent', improvement: '+15% open rate' },
              { name: 'Social Media Ads', health: 78, status: 'good', improvement: 'Stable performance' },
              { name: 'Newsletter Weekly', health: 65, status: 'needs attention', improvement: 'Auto-fix applied' },
            ].map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{campaign.name}</p>
                  <p className="text-sm text-gray-600">{campaign.improvement}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.health >= 90 ? 'bg-green-100 text-green-800' :
                    campaign.health >= 75 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.health}% health
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-genie p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            AI Insights
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-teal-800">Optimization Opportunity</p>
                  <p className="text-sm text-teal-700 mt-1">
                    Your email campaigns could benefit from send time optimization. 
                    I can increase open rates by 20-30%.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Audience Insight</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your highest-value customers share similar characteristics. 
                    Let me find more lookalike prospects.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Growth Prediction</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Based on current trends, you're on track to exceed 
                    monthly targets by 15%.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowGenieConsole(true)}
            className="w-full mt-4 btn-teal flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get More Insights
          </button>
        </motion.div>
      </div>
    </div>
  )
}
