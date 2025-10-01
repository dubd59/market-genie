import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Users, DollarSign, Zap, Sparkles } from 'lucide-react';

const FunnelPreview = () => {
  const { funnelId } = useParams();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract funnel data from URL parameters or localStorage
  const funnelData = {
    industry: searchParams.get('industry') || 'SaaS',
    goalType: searchParams.get('goal') || 'Generate Leads',
    targetAudience: searchParams.get('audience') || 'Small Business Owners',
    budget: searchParams.get('budget') || '$5K - $10K'
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-gray-800">Loading your AI-powered funnel...</h2>
          <p className="text-gray-600 mt-2">✨ Applying Genie magic ✨</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-yellow-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">MarketGenie Funnel</h1>
              <p className="text-xs text-gray-500">Powered by AI ✨ with Genie magic</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Funnel ID: {funnelId}
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="inline-block bg-gradient-to-r from-purple-100 to-yellow-100 rounded-full px-6 py-2 mb-6"
          >
            <span className="text-purple-600 font-medium">✨ AI-Optimized for {funnelData.industry} ✨</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your {funnelData.industry} Business with 
            <span className="bg-gradient-to-r from-purple-600 to-yellow-600 bg-clip-text text-transparent"> Genie Magic</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {funnelData.goalType === 'Generate Leads' && `Discover how ${funnelData.targetAudience.toLowerCase()} are scaling their ${funnelData.industry.toLowerCase()} businesses with our AI-powered solution.`}
            {funnelData.goalType === 'Sell Products' && `The #1 platform that ${funnelData.targetAudience.toLowerCase()} trust to boost their ${funnelData.industry.toLowerCase()} sales by 340%.`}
            {funnelData.goalType === 'Book Appointments' && `Book a strategy session and see how ${funnelData.targetAudience.toLowerCase()} are transforming their ${funnelData.industry.toLowerCase()} operations.`}
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <button className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-yellow-700 transition-all flex items-center space-x-2 shadow-lg">
              {funnelData.goalType === 'Generate Leads' && <><span>Get FREE Strategy Guide</span><ArrowRight className="w-5 h-5" /></>}
              {funnelData.goalType === 'Sell Products' && <><span>Start Free Trial</span><ArrowRight className="w-5 h-5" /></>}
              {funnelData.goalType === 'Book Appointments' && <><span>Book Free Consultation</span><ArrowRight className="w-5 h-5" /></>}
            </button>
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                ))}
              </div>
              <span className="text-sm">Join 12,847+ {funnelData.targetAudience.toLowerCase()}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {[
            { icon: <Zap className="w-8 h-8" />, title: "AI-Powered Optimization", desc: "Our Genie magic automatically optimizes your funnel for maximum conversions" },
            { icon: <Users className="w-8 h-8" />, title: "Built for " + funnelData.targetAudience, desc: `Specifically designed for the unique needs of ${funnelData.targetAudience.toLowerCase()}` },
            { icon: <DollarSign className="w-8 h-8" />, title: "Fits Your Budget", desc: `Scalable solutions that work within your ${funnelData.budget} budget range` }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-purple-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-xl p-8 shadow-lg text-center"
        >
          <div className="flex justify-center space-x-1 mb-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-xl text-gray-700 italic mb-4">
            "This AI-powered funnel increased our {funnelData.industry.toLowerCase()} conversions by 340%. The Genie magic is real!"
          </blockquote>
          <cite className="text-gray-600 font-medium">
            — Sarah Johnson, CEO of TechScale {funnelData.industry}
          </cite>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Scale Your {funnelData.industry} Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of {funnelData.targetAudience.toLowerCase()} who've transformed their business with Genie magic
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white px-12 py-4 rounded-lg font-bold text-xl hover:from-purple-700 hover:to-yellow-700 transition-all shadow-lg">
            {funnelData.goalType === 'Generate Leads' && 'Download Free Guide Now'}
            {funnelData.goalType === 'Sell Products' && 'Start Your Free Trial'}
            {funnelData.goalType === 'Book Appointments' && 'Book Your Free Session'}
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-400">
            This funnel was generated by MarketGenie AI ✨ with Genie magic
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tailored for {funnelData.industry} • Optimized for {funnelData.targetAudience} • Budget: {funnelData.budget}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FunnelPreview;