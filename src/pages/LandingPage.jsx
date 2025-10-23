import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  Star,
  ArrowRight,
  Bot,
  Brain,
  Target,
  Rocket,
  Shield,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  BarChart3,
  Calendar,
  Workflow,
  DollarSign
} from 'lucide-react'

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro')

  // Function to scroll to pricing section
  const scrollToPricing = () => {
    const pricingElement = document.getElementById('pricing')
    if (pricingElement) {
      pricingElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const features = [
    {
      icon: Bot,
      title: "AI-Powered Automation",
      description: "Smart workflows that adapt and optimize themselves for maximum ROI"
    },
    {
      icon: Users,
      title: "Advanced Lead Generation",
      description: "Automated web scraping and lead enrichment from multiple sources"
    },
    {
      icon: Mail,
      title: "Multi-Channel Campaigns",
      description: "Email, SMS, social media, and voice campaigns from one platform"
    },
    {
      icon: Brain,
      title: "Intelligent Lead Scoring",
      description: "AI analyzes behavior patterns to identify your hottest prospects"
    },
    {
      icon: Workflow,
      title: "Visual Funnel Builder",
      description: "Drag-and-drop interface with 3D analytics visualization"
    },
    {
      icon: Calendar,
      title: "Appointment Automation",
      description: "Smart scheduling with automated reminders and follow-ups"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Beautiful 3D dashboards with predictive insights"
    },
    {
      icon: Shield,
      title: "Self-Healing Campaigns",
      description: "Automatic optimization and performance monitoring"
    }
  ]

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: 0,
      description: 'Perfect for small businesses getting started',
      features: [
        '75 contacts',
        '300 emails/month',
        '3 active campaigns',
        'Basic automation',
        'Email support',
        'Lead capture forms',
        'Basic AI features'
      ],
      popular: false,
      buttonText: 'Free with Limitations',
      priceText: 'FREE',
      subtitle: 'No credit card required'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 20,
      description: 'For growing businesses that need more power',
      features: [
        '10,000 contacts',
        '50,000 emails/month',
        '5,000 SMS/month',
        'Advanced AI automation',
        'Multi-channel campaigns',
        'Lead scoring & enrichment',
        'Appointment scheduling',
        '3D analytics dashboard',
        'Priority support',
        'Custom integrations'
      ],
      popular: true,
      buttonText: 'Monthly Subscription',
      priceText: '$20',
      subtitle: '/month'
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 300,
      description: 'One-time payment, yours forever',
      features: [
        'Unlimited contacts',
        'Unlimited emails',
        'Unlimited SMS',
        'White-label solution',
        'Multi-tenant management',
        'Custom AI training',
        'Advanced web scraping',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced reporting',
        'Lifetime updates'
      ],
      popular: false,
      buttonText: 'Get Lifetime Access',
      priceText: '$300',
      subtitle: 'One-time payment'
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "Digital Growth Co.",
      avatar: "SJ",
      text: "Market Genie increased our lead generation by 400% and cut our marketing costs in half. The AI automation is incredible!"
    },
    {
      name: "Michael Chen",
      company: "TechStart Solutions",
      avatar: "MC",
      text: "The 3D analytics alone are worth the price. We can see our funnel performance like never before."
    },
    {
      name: "Emily Rodriguez",
      company: "Scale Marketing Agency",
      avatar: "ER",
      text: "We manage 50+ client campaigns with Market Genie. The white-label features are perfect for agencies."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-500 via-emerald-600 to-slate-500">
      {/* Navigation */}
      <nav className="relative z-50 bg-black/35 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 border border-white/40 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Market Genie</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-200 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-200 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-200 hover:text-white transition-colors">Reviews</a>
              <Link to="/login" className="text-gray-200 hover:text-white transition-colors">Sign In</Link>
              <button 
                onClick={scrollToPricing}
                className="border border-white/40 text-white px-6 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-yellow-500/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-600" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.3)', filter: 'brightness(1.1) saturate(1.2)'}}>
                Your Marketing Just Grew an AI Brain
              </span>
            </motion.h1>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold mb-8 text-gray-200"
            >
              The Only Platform That Automates, Optimizes & Even Fixes Itself
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto"
            >
              <strong className="text-white">Meet Market Genie</strong> - Where every feature is powered by AI that learns your business, anticipates customer behavior, and continuously improves your results.
            </motion.p>
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 flex justify-center"
            >
              <img 
                src="/marketG.png" 
                alt="Market Genie Platform" 
                className="max-w-32 w-full h-auto rounded-lg shadow-2xl border border-gray-700/50"
              />
            </motion.div>

            {/* Video Player Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 flex justify-center"
            >
              <div className="bg-black/25 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-2xl w-full">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-gray-600">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">Watch Market Genie in Action</h3>
                    <p className="text-gray-300 text-sm">See how AI transforms your marketing in under 3 minutes</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Features Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center">
                  🧠 AI That Actually Works For You
                </h3>
                <ul className="text-gray-300 space-y-2 text-left">
                  <li><strong className="text-white">Natural Language Commands</strong> - "Find me more leads like my top customers"</li>
                  <li><strong className="text-white">Self-Healing Campaigns</strong> - Automatically fixes underperforming sequences</li>
                  <li><strong className="text-white">Voice-Activated Control</strong> - Hands-free marketing management</li>
                  <li><strong className="text-white">Predictive Analytics</strong> - Know which leads will convert before you contact them</li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center">
                  🚀 Everything You Need. Nothing You Don't.
                </h3>
                <div className="text-gray-300 text-left">
                  <div className="text-lg font-semibold text-white mb-2">
                    Generate Leads → Automate Campaigns → Close Deals → Analyze Results
                  </div>
                  <p className="italic text-yellow-200">All in one unified platform that replaces 10+ tools</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white/8 backdrop-blur-lg rounded-xl p-6 border border-white/12 max-w-2xl mx-auto mb-8"
            >
              <h3 className="text-xl font-bold text-yellow-300 mb-3">✨ See The Magic In Action</h3>
              <blockquote className="text-lg text-gray-300 italic mb-3">
                "Setup our entire lead generation system in one afternoon - something that used to take weeks"
              </blockquote>
              <p className="text-sm text-gray-400">- E-commerce Brand Director</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button 
                onClick={scrollToPricing}
                className="border border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                🧞‍♂️ Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-200">
                Watch 3-Min Demo →
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 flex items-center justify-center space-x-8 text-gray-200"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free version available</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-600 mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.3)', filter: 'brightness(1.1) saturate(1.2)'}}>
              Why Market Genie Dominates The Competition
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              While others offer basic automation, we deliver intelligent AI that actually thinks and optimizes for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/15 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-600 mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.3)', filter: 'brightness(1.1) saturate(1.2)'}}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your business. All plans include our core AI features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`relative bg-white/8 backdrop-blur-lg rounded-xl p-8 border ${
                  plan.popular 
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20' 
                    : 'border-white/12'
                } hover:border-cyan-500/50 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-emerald-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">{plan.priceText}</span>
                    <span className="text-gray-300">{plan.subtitle}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-200">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={
                    plan.id === 'starter' ? '/free-signup' :
                    plan.id === 'pro' ? '/pro' :
                    plan.id === 'lifetime' ? '/lifetime' :
                    '/register'
                  }
                  className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center border border-white/30 text-white hover:bg-white/10"
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-black/8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-600 mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.3)', filter: 'brightness(1.1) saturate(1.2)'}}>
              Loved by Marketers Worldwide
            </h2>
            <p className="text-xl text-gray-300">
              See why thousands of businesses choose Market Genie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white/8 backdrop-blur-lg rounded-xl p-6 border border-white/12"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 rounded-2xl p-12 border border-white/10"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-600 mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.3)', filter: 'brightness(1.1) saturate(1.2)'}}>
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of businesses already using Market Genie to automate their success
            </p>
            <Link
              to="/dashboard"
              className="border border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
            >
              Start Your Free Trial Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-black/8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 border border-white/40 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Market Genie</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-sm">
                AI-powered marketing automation that learns, optimizes, and fixes itself. 
                Transform your business with intelligent campaigns that grow with you.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com/marketgenie" className="text-gray-400 hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
                <a href="https://facebook.com/marketgenie" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com/company/marketgenie" className="text-gray-400 hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><a href="/integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="/api" className="hover:text-white transition-colors">API</a></li>
                <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://help.marketgenie.app" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/documentation" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/tutorials" className="hover:text-white transition-colors">Video Tutorials</a></li>
                <li><a href="/community" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="/status" className="hover:text-white transition-colors">System Status</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/press" className="hover:text-white transition-colors">Press Kit</a></li>
                <li><a href="/partners" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="/affiliates" className="hover:text-white transition-colors">Affiliate Program</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center md:text-left">
                <h4 className="text-white font-semibold mb-2">📧 Email Support</h4>
                <p className="text-gray-300">support@marketgenie.app</p>
                <p className="text-gray-300">sales@marketgenie.app</p>
              </div>
              <div className="text-center">
                <h4 className="text-white font-semibold mb-2">💬 Live Chat</h4>
                <p className="text-gray-300">Available 24/7</p>
                <a href="https://help.marketgenie.app/chat" className="text-yellow-400 hover:text-yellow-300 transition-colors">Start Chat</a>
              </div>
              <div className="text-center md:text-right">
                <h4 className="text-white font-semibold mb-2">📞 Phone Support</h4>
                <p className="text-gray-300">1-800-MKTGENIE</p>
                <p className="text-gray-300">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2025 Market Genie. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="/gdpr" className="hover:text-white transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
