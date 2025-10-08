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
      id: 'starter',
      name: 'Starter',
      price: 47,
      description: 'Perfect for small businesses getting started',
      features: [
        '1,000 contacts',
        '5,000 emails/month',
        '500 SMS/month',
        'Basic automation',
        'Email support',
        'Lead capture forms'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 97,
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
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 297,
      description: 'For agencies and large businesses',
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
        'Advanced reporting'
      ],
      popular: false
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
    <div className="min-h-screen bg-gradient-to-br from-slate-600 via-emerald-700 to-slate-600">
      {/* Navigation */}
      <nav className="relative z-50 bg-black/40 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-lg flex items-center justify-center">
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
                className="bg-gradient-to-r from-emerald-500 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105"
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-500" style={{textShadow: '2px 2px 2px rgba(0,0,0,0.4), -1px -1px 1px rgba(0,0,0,0.2)'}}>
                Marketing Automation
              </span>
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent block" style={{textShadow: '2px 2px 2px rgba(0,0,0,0.4), -1px -1px 1px rgba(0,0,0,0.2)'}}>
                That Grants Your Wishes
              </span>
            </motion.h1>
            
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 flex justify-center"
            >
              <img 
                src="/marketG.png" 
                alt="Market Genie Platform" 
                className="max-w-lg w-full h-auto rounded-lg shadow-2xl border border-gray-700/50"
              />
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              The AI-powered marketing platform that outperforms ClickFunnels and HighLevel. 
              Generate leads, automate campaigns, and scale your business with intelligent automation.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button 
                onClick={scrollToPricing}
                className="bg-gradient-to-r from-emerald-500 to-yellow-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-emerald-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="border border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-200">
                Watch Demo
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex items-center justify-center space-x-8 text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>14-day free trial</span>
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
      <section id="features" className="py-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 mb-4" style={{textShadow: '1px 1px 1px rgba(0,0,0,0.3), -1px -1px 1px rgba(0,0,0,0.1)'}}>
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
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 mb-4" style={{textShadow: '1px 1px 1px rgba(0,0,0,0.3), -1px -1px 1px rgba(0,0,0,0.1)'}}>
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
                className={`relative bg-white/5 backdrop-blur-lg rounded-xl p-8 border ${
                  plan.popular 
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20' 
                    : 'border-white/10'
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
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-yellow-500 text-white hover:from-emerald-600 hover:to-yellow-600'
                      : 'border border-white/30 text-white hover:bg-white/10'
                  }`}
                >
                  Start Free Trial
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 mb-4" style={{textShadow: '1px 1px 1px rgba(0,0,0,0.3), -1px -1px 1px rgba(0,0,0,0.1)'}}>
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
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-emerald-500/20 to-yellow-500/20 rounded-2xl p-12 border border-white/10"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600 mb-4" style={{textShadow: '1px 1px 1px rgba(0,0,0,0.3), -1px -1px 1px rgba(0,0,0,0.1)'}}>
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of businesses already using Market Genie to automate their success
            </p>
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-emerald-500 to-yellow-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-emerald-600 hover:to-yellow-600 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
            >
              Start Your Free Trial Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Market Genie</span>
            </div>
            <div className="text-gray-400">
              © 2025 Market Genie. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
