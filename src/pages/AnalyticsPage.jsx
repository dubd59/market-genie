import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Mail, 
  MessageSquare, 
  Calendar,
  Target,
  Eye,
  MousePointer,
  ShoppingCart,
  Filter,
  Download,
  Zap,
  Clock,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'
import Funnel3D from '../components/ui/Funnel3D'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('overview')

  const metrics = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'campaigns',
      name: 'Campaigns',
      icon: Zap,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'leads',
      name: 'Leads',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'revenue',
      name: 'Revenue',
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  const performanceData = [
    { name: 'Leads Generated', value: '2,847', change: '+15.2%', trend: 'up' },
    { name: 'Conversion Rate', value: '18.7%', change: '+4.2%', trend: 'up' },
    { name: 'Email Open Rate', value: '42.8%', change: '+2.1%', trend: 'up' },
    { name: 'SMS Response Rate', value: '31.5%', change: '+5.7%', trend: 'up' },
    { name: 'Cost Per Lead', value: '$2.47', change: '-18.3%', trend: 'down' },
    { name: 'Customer LTV', value: '$1,247', change: '+12.8%', trend: 'up' },
    { name: 'Appointments Booked', value: '89', change: '+12', trend: 'up' },
    { name: 'Revenue Per Customer', value: '$428', change: '+8.9%', trend: 'up' }
  ]

  const channelPerformance = [
    { channel: 'Email Marketing', leads: 1247, conversions: 89, rate: '7.1%', cost: '$2.10' },
    { channel: 'SMS Campaigns', leads: 892, conversions: 67, rate: '7.5%', cost: '$1.80' },
    { channel: 'Social Media', leads: 634, conversions: 34, rate: '5.4%', cost: '$3.20' },
    { channel: 'Web Scraping', leads: 74, conversions: 12, rate: '16.2%', cost: '$0.85' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Deep insights into your marketing automation performance</p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedMetric === metric.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <metric.icon className="w-4 h-4" />
              <span>{metric.name}</span>
            </button>
          ))}
        </div>

        {/* Time Selector */}
        <div className="flex items-center space-x-2 ml-auto">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceData.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                metric.trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
            <div className="flex items-center">
              <TrendingUp className={`w-4 h-4 mr-1 ${
                metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`} />
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3D Funnel */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">3D Conversion Funnel</h2>
              <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
                Customize View
              </button>
            </div>
            <div className="h-96">
              <Funnel3D />
            </div>
          </motion.div>
        </div>

        {/* Channel Performance */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Channel Performance</h2>
            <div className="space-y-4">
              {channelPerformance.map((channel, index) => (
                <div key={channel.channel} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{channel.channel}</h3>
                    <span className="text-sm font-medium text-green-600">{channel.rate}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="block text-gray-500">Leads</span>
                      <span className="font-medium">{channel.leads.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Conversions</span>
                      <span className="font-medium">{channel.conversions}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Cost/Lead</span>
                      <span className="font-medium">{channel.cost}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">ROI</span>
                      <span className="font-medium text-green-600">324%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Revenue Trends</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-full">MRR</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">ARR</button>
            <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">LTV</button>
          </div>
        </div>
        
        {/* Simple Revenue Chart Placeholder */}
        <div className="h-64 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-cyan-500 mx-auto mb-2" />
            <p className="text-gray-600">Revenue chart visualization</p>
            <p className="text-sm text-gray-500">$47,329 this month (+22.1%)</p>
          </div>
        </div>
      </motion.div>

      {/* Device & Geographic Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Device Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Device Analytics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-blue-500" />
                <span>Desktop</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">64.2%</div>
                <div className="text-sm text-gray-500">1,827 sessions</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <span>Mobile</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">31.8%</div>
                <div className="text-sm text-gray-500">906 sessions</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-purple-500" />
                <span>Tablet</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">4.0%</div>
                <div className="text-sm text-gray-500">114 sessions</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Geographic Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Locations</h2>
          <div className="space-y-4">
            {[
              { country: 'United States', sessions: '1,247', percentage: '43.8%' },
              { country: 'Canada', sessions: '892', percentage: '31.3%' },
              { country: 'United Kingdom', sessions: '334', percentage: '11.7%' },
              { country: 'Australia', sessions: '189', percentage: '6.6%' },
              { country: 'Germany', sessions: '185', percentage: '6.5%' }
            ].map((location) => (
              <div key={location.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-cyan-500" />
                  <span>{location.country}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{location.percentage}</div>
                  <div className="text-sm text-gray-500">{location.sessions} sessions</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
