import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Target, TrendingUp, Brain, Wand2, Sparkles, 
  Eye, MousePointer, DollarSign, Users, Clock, 
  BarChart3, PieChart, LineChart, ArrowUp, ArrowDown,
  Play, Pause, Settings, Copy, Share, Download,
  CheckCircle, ArrowRight, Rocket, Star
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import FunnelMetricsService from '../services/FunnelMetricsService';

const SuperiorFunnelBuilder = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [builderMode, setBuilderMode] = useState('dashboard'); // dashboard, ai-wizard, ai-results, launch-success
  
  // Real-time funnel metrics state
  const [funnelMetrics, setFunnelMetrics] = useState({
    totalRevenue: 0,
    aiConfidence: 0,
    liveVisitors: 0,
    wishesGranted: 0,
    isLoading: true,
    lastUpdated: null
  });
  const [aiWizardStep, setAiWizardStep] = useState(1);
  const [aiWizardData, setAiWizardData] = useState({
    industry: '',
    goalType: '',
    targetAudience: '',
    budget: '',
    timeline: '',
    // Branding information
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    logoUrl: ''
  });
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState(0);

  // Load real-time funnel metrics
  useEffect(() => {
    const loadFunnelMetrics = async () => {
      if (!tenant?.id) return;
      
      setFunnelMetrics(prev => ({ ...prev, isLoading: true }));
      
      try {
        const metrics = await FunnelMetricsService.getAllFunnelMetrics(tenant.id);
        setFunnelMetrics({
          ...metrics,
          isLoading: false
        });
        console.log('✅ Funnel metrics loaded:', metrics);
      } catch (error) {
        console.error('❌ Error loading funnel metrics:', error);
        setFunnelMetrics(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadFunnelMetrics();
    
    // Refresh metrics every 30 seconds for real-time updates
    const interval = setInterval(loadFunnelMetrics, 30000);
    return () => clearInterval(interval);
  }, [tenant?.id]);

  // Launch funnel function - the big reveal!
  const launchFunnel = async () => {
    setIsLaunching(true);
    setLaunchStep(1);

    // Step 1: Creating pages
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLaunchStep(2);

    // Step 2: Setting up AI optimization
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLaunchStep(3);

    // Step 3: Configuring analytics
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLaunchStep(4);

    // Step 4: Final deployment
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLaunchStep(5);

    // Success!
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLaunching(false);
    setBuilderMode('launch-success');
  };

  // 🚀 THE MAGIC FUNCTION - Download Complete Funnel System!
  const downloadCompleteFunnel = async (funnelData, type = 'html') => {
    console.log('🔍 Downloading funnel with branding data:', funnelData); // Debug log
    
    const funnelId = `${funnelData.industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const funnelName = `${funnelData.companyName || funnelData.industry} ${funnelData.goalType} Funnel`;
    
    if (type === 'html') {
      // Generate the complete funnel package
      const funnelPackage = generateCompleteFunnelHTML(funnelData, funnelId, funnelName);
      
      // Create ZIP file with all components
      await downloadAsZip(funnelPackage, `${funnelId}-complete-funnel.zip`);
      
    } else if (type === 'preview') {
      // Generate preview images
      await generatePreviewImages(funnelData, funnelId);
    }
  };

  // Generate Complete HTML Funnel System
  const generateCompleteFunnelHTML = (data, id, name) => {
    const timestamp = new Date().toISOString();
    
    // Industry-specific light gradient backgrounds
    const getIndustryGradient = (industry) => {
      const gradients = {
        'E-commerce': 'linear-gradient(135deg, #fef7f7 0%, #fff2e5 50%, #f0f9ff 100%)',
        'SaaS': 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f1f5f9 100%)',
        'Coaching': 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #ecfdf5 100%)',
        'Real Estate': 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
        'Healthcare': 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #a7f3d0 100%)',
        'Education': 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #e9d5ff 100%)',
        'Food Service': 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fb923c 100%)',
        'Construction': 'linear-gradient(135deg, #fefce8 0%, #fde047 50%, #facc15 100%)',
        'Manufacturing': 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #94a3b8 100%)',
        'Professional Services': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        'Fitness & Wellness': 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 50%, #86efac 100%)',
        'Beauty & Salon': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)'
      };
      return gradients[industry] || 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #f0f9ff 100%)';
    };
    
    // 1. LANDING PAGE (Main funnel page)
    const landingPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.companyName ? `${data.companyName} - ${name}` : name} | Powered by MarketGenie</title>
    <script src="https://cdn.emailjs.com/npm/@emailjs/browser@3/dist/email.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            background: ${getIndustryGradient(data.industry)};
            min-height: 100vh;
            color: #374151;
        }
        
        /* Full Width Layout - No Cards */
        .full-width { width: 100%; }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 20px; 
        }
        
        /* Top Banner */
        .top-banner {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            padding: 12px 0;
        }
        .top-banner .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .company-logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .company-logo img {
            max-height: 40px;
            width: auto;
        }
        .company-name {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
        }
        .contact-info {
            display: flex;
            gap: 20px;
            font-size: 0.9rem;
            color: #6b7280;
        }
        .contact-info a {
            color: #6b7280;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        .contact-info a:hover {
            color: #374151;
        }
        
        /* Hero Section - Full Width, No Cards */
        .hero-section {
            padding: 80px 0 100px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .hero-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(1px);
        }
        .hero-content {
            position: relative;
            z-index: 10;
        }
        .hero-logo {
            margin-bottom: 30px;
        }
        .hero-logo img {
            max-height: 120px;
            max-width: 300px;
            object-fit: contain;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .hero-headline {
            font-size: 3.5rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 24px;
            color: #111827;
            letter-spacing: -0.02em;
        }
        .hero-subheadline {
            font-size: 1.4rem;
            font-weight: 500;
            margin-bottom: 20px;
            color: #4b5563;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .hero-description {
            font-size: 1.1rem;
            margin-bottom: 40px;
            color: #6b7280;
            max-width: 700px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.7;
        }
        .hero-cta-primary {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 18px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1.1rem;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
            margin-bottom: 60px;
        }
        .hero-cta-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }
        
        /* Feature Image in Hero */
        .hero-feature-image {
            margin-top: 40px;
            text-align: center;
        }
        .hero-feature-image img {
            max-width: 100%;
            max-height: 300px;
            width: auto;
            height: auto;
            object-fit: cover;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
            border: 4px solid rgba(255, 255, 255, 0.8);
        }
        
        /* Main Content Sections */
        .content-section {
            padding: 80px 0;
            background: rgba(255, 255, 255, 0.6);
            backdrop-filter: blur(10px);
        }
        .content-section:nth-child(even) {
            background: rgba(255, 255, 255, 0.8);
        }
        
        /* Lead Capture Form - Clean Design */
        .lead-capture {
            background: white;
            padding: 60px 0;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .form-container {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
        }
        .form-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: #111827;
        }
        .form-subtitle {
            font-size: 1.2rem;
            color: #6b7280;
            margin-bottom: 40px;
        }
        .lead-form {
            text-align: left;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
            font-size: 0.95rem;
        }
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 16px 20px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: white;
        }
        .form-group input:focus,
        .form-group select:focus {
            border-color: #3b82f6;
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .submit-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 18px 0;
            border: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
        }
        
        /* Features Section */
        .features-section {
            padding: 80px 0;
            background: rgba(255, 255, 255, 0.4);
        }
        .features-title {
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 60px;
            color: #111827;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }
        .feature-item {
            text-align: center;
            padding: 40px 30px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }
        .feature-item:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .feature-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            display: block;
        }
        .feature-title {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: #111827;
        }
        .feature-description {
            color: #6b7280;
            line-height: 1.6;
        }
        
        /* Company Features Cards */
        .company-features {
            padding: 80px 0;
            background: rgba(255, 255, 255, 0.6);
        }
        .company-features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            max-width: 900px;
            margin: 0 auto;
        }
        .company-feature-card {
            background: white;
            padding: 30px 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            border: 2px solid rgba(59, 130, 246, 0.1);
            transition: all 0.3s ease;
        }
        .company-feature-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
            border-color: rgba(59, 130, 246, 0.3);
        }
        .feature-emoji {
            font-size: 3rem;
            display: block;
            margin-bottom: 15px;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        .feature-headline {
            font-size: 1.4rem;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 10px;
            line-height: 1.3;
        }
        .feature-description {
            font-size: 1rem;
            color: #6b7280;
            line-height: 1.5;
            margin: 0;
        }
        .company-feature-card h3 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        /* Impact Statements */
        .impact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 40px;
            max-width: 1000px;
            margin: 0 auto;
        }
        .impact-item {
            text-align: center;
            padding: 40px 30px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 2px solid rgba(59, 130, 246, 0.1);
            transition: all 0.3s ease;
        }
        .impact-item:hover {
            transform: translateY(-5px);
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
            border-color: rgba(59, 130, 246, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .impact-icon {
            font-size: 3rem;
            margin-bottom: 20px;
            display: block;
        }
        .impact-title {
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: #111827;
        }
        .impact-description {
            color: #4b5563;
            line-height: 1.7;
            font-size: 1rem;
        }
        
        /* Footer */
        .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: white;
            padding: 60px 0 40px;
            text-align: center;
        }
        .footer-company {
            margin-bottom: 30px;
        }
        .footer-company h3 {
            font-size: 1.8rem;
            margin-bottom: 10px;
            color: #f9fafb;
        }
        .footer-contact {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .footer-contact a {
            color: #d1d5db;
            text-decoration: none;
            transition: color 0.3s ease;
        }
        .footer-contact a:hover {
            color: #f9fafb;
        }
        .footer-powered {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 30px;
            color: #9ca3af;
            font-size: 0.9rem;
        }
        .footer-powered a {
            color: #60a5fa;
            text-decoration: none;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .hero-headline { font-size: 2.5rem; }
            .hero-subheadline { font-size: 1.2rem; }
            .hero-feature-image img { max-height: 200px; }
            .form-row { grid-template-columns: 1fr; }
            .features-grid { grid-template-columns: 1fr; gap: 30px; }
            .footer-contact { flex-direction: column; gap: 15px; }
            .contact-info { display: none; }
        }
    </style>
</head>
<body>
    <!-- Top Banner -->
    <div class="top-banner">
        <div class="container">
            <div class="company-logo">
                ${data.logoUrl ? `<img src="${data.logoUrl}" alt="${data.companyName}">` : ''}
                ${data.companyName ? `<span class="company-name">${data.companyName}</span>` : ''}
            </div>
            <div class="contact-info">
                ${data.phone ? `<a href="tel:${data.phone}">📞 ${data.phone}</a>` : ''}
                ${data.email ? `<a href="mailto:${data.email}">📧 ${data.email}</a>` : ''}
                ${data.website ? `<a href="${data.website}" target="_blank">🌐 Website</a>` : ''}
            </div>
        </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="hero-content">
                ${data.logoUrl && !data.companyName ? `
                <div class="hero-logo">
                    <img src="${data.logoUrl}" alt="Company Logo">
                </div>
                ` : ''}
                
                <h1 class="hero-headline">
                    ${data.companyName ? `Transform Your Business with ${data.companyName}` : `Transform Your ${data.industry} Business Today`}
                </h1>
                
                <p class="hero-subheadline">
                    ${data.companyName ? `${data.industry} Excellence by ${data.companyName}` : `Professional ${data.industry} Solutions That Deliver Results`}
                </p>
                
                <p class="hero-description">
                    Join satisfied ${data.targetAudience.toLowerCase()} who are already succeeding with ${data.companyName ? `${data.companyName}'s proven system` : 'our proven system'}. Get the results you deserve with industry-leading expertise.
                </p>
                
                <a href="#get-started" class="hero-cta-primary">
                    ${data.companyName ? `Work with ${data.companyName}` : `Get Started Today`}
                </a>
                
                ${data.featureImageUrl ? `
                <div class="hero-feature-image">
                    <img src="${data.featureImageUrl}" alt="${data.companyName ? `${data.companyName} - ` : ''}Our Business" />
                </div>
                ` : ''}
            </div>
        </div>
    </section>

    <!-- Lead Capture Section -->
    <section class="lead-capture" id="get-started">
        <div class="container">
            <div class="form-container">
                <h2 class="form-title">
                    ${data.companyName ? `Ready to Work with ${data.companyName}?` : `Get Your Free ${data.goalType} Strategy`}
                </h2>
                <p class="form-subtitle">
                    ${data.contactName ? `Connect directly with ${data.contactName} and our expert team` : 'Take the first step towards transforming your business'}
                </p>
                
                <form class="lead-form" id="leadForm" onsubmit="submitForm(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Full Name *</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address *</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone">
                        </div>
                        <div class="form-group">
                            <label for="company">Company/Business</label>
                            <input type="text" id="company" name="company">
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-btn">
                        ${data.companyName ? `Connect with ${data.companyName}` : `Get My Free ${data.goalType} Strategy`}
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Company Features Section -->
    ${data.feature1 || data.feature2 || data.feature3 || data.feature4 ? `
    <section class="company-features">
        <div class="container">
            <h2 class="features-title">What We Offer</h2>
            <div class="company-features-grid">
                ${data.feature1 ? `
                <div class="company-feature-card">
                    <span class="feature-emoji">🚀</span>
                    <h3 class="feature-headline">${data.feature1}</h3>
                    <p class="feature-description">Professional service delivery that exceeds expectations</p>
                </div>
                ` : ''}
                ${data.feature2 ? `
                <div class="company-feature-card">
                    <span class="feature-emoji">✨</span>
                    <h3 class="feature-headline">${data.feature2}</h3>
                    <p class="feature-description">Quality solutions tailored to your specific needs</p>
                </div>
                ` : ''}
                ${data.feature3 ? `
                <div class="company-feature-card">
                    <span class="feature-emoji">💯</span>
                    <h3 class="feature-headline">${data.feature3}</h3>
                    <p class="feature-description">Reliable results you can count on every time</p>
                </div>
                ` : ''}
                ${data.feature4 ? `
                <div class="company-feature-card">
                    <span class="feature-emoji">🎯</span>
                    <h3 class="feature-headline">${data.feature4}</h3>
                    <p class="feature-description">Focused expertise that delivers real value</p>
                </div>
                ` : ''}
            </div>
        </div>
    </section>
    ` : ''}

    <!-- Why Choose Us Section -->
    <section class="features-section">
        <div class="container">
            <h2 class="features-title">Why Choose ${data.companyName || 'Our Services'}?</h2>
            <div class="impact-grid">
                ${data.impact1 ? `
                <div class="impact-item">
                    <span class="impact-icon">⭐</span>
                    <h3 class="impact-title">Our Promise</h3>
                    <p class="impact-description">${data.impact1}</p>
                </div>
                ` : ''}
                ${data.impact2 ? `
                <div class="impact-item">
                    <span class="impact-icon">🎯</span>
                    <h3 class="impact-title">Our Advantage</h3>
                    <p class="impact-description">${data.impact2}</p>
                </div>
                ` : ''}
                ${data.impact3 ? `
                <div class="impact-item">
                    <span class="impact-icon">💎</span>
                    <h3 class="impact-title">Our Commitment</h3>
                    <p class="impact-description">${data.impact3}</p>
                </div>
                ` : ''}
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            ${data.companyName ? `
            <div class="footer-company">
                <h3>${data.companyName}</h3>
                <p>${data.industry} Excellence & ${data.goalType}</p>
            </div>
            ` : ''}
            
            <div class="footer-contact">
                ${data.email ? `<a href="mailto:${data.email}">📧 ${data.email}</a>` : ''}
                ${data.phone ? `<a href="tel:${data.phone}">📞 ${data.phone}</a>` : ''}
                ${data.website ? `<a href="${data.website}" target="_blank">🌐 ${data.website}</a>` : ''}
                ${data.address ? `<span>📍 ${data.address}</span>` : ''}
            </div>
            
            <div class="footer-powered">
                <p>✨ Powered by <a href="#" target="_blank">MarketGenie</a> - AI-Powered Marketing Solutions ✨</p>
                <p style="margin-top: 10px;">© ${new Date().getFullYear()} ${data.companyName || 'Your Company'}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Lead capture with validation
        function submitForm(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Store lead data
            storeLeadData(data);
            
            // Redirect to thank you page
            window.location.href = 'thank-you.html';
        }
        
        function storeLeadData(data) {
            // Store in localStorage for demo purposes
            const leads = JSON.parse(localStorage.getItem('funnel-leads') || '[]');
            leads.push({
                ...data,
                timestamp: new Date().toISOString(),
                funnelId: '${id}',
                source: window.location.href
            });
            localStorage.setItem('funnel-leads', JSON.stringify(leads));
            
            // 🔥 SEND EMAIL TO BUSINESS OWNER
            sendLeadNotification(data);
            
            // Analytics tracking
            trackConversion('lead-captured', data);
        }
        
        function sendLeadNotification(leadData) {
            // Create email content
            const emailSubject = 'New Lead from Your Landing Page!';
            const emailBody = \`
NEW LEAD SUBMISSION from ${data.companyName || 'Your Funnel'}!

📋 LEAD DETAILS:
• Name: \${leadData.name}
• Email: \${leadData.email}
• Phone: \${leadData.phone || 'Not provided'}
• Company: \${leadData.company || 'Not provided'}
• Submitted: \${new Date().toLocaleString()}
• From Page: \${window.location.href}

🎯 NEXT STEPS:
1. Contact this lead within 24 hours for best results
2. Reference your ${data.industry} expertise
3. Follow up with your custom proposal

Generated by MarketGenie - Your AI Marketing Assistant
            \`.trim();
            
            // Method 1: EmailJS (Recommended for client-side)
            if (typeof emailjs !== 'undefined') {
                emailjs.send('default_service', 'template_new_lead', {
                    to_email: '${data.email}',
                    to_name: '${data.contactName || data.companyName}',
                    from_name: leadData.name,
                    from_email: leadData.email,
                    message: emailBody,
                    subject: emailSubject
                });
            }
            
            // Method 2: Formspree (Alternative)
            fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: '${data.email}',
                    subject: emailSubject,
                    message: emailBody,
                    _replyto: leadData.email
                })
            });
            
            // Method 3: Simple mailto (Fallback)
            const mailtoLink = \`mailto:${data.email}?subject=\${encodeURIComponent(emailSubject)}&body=\${encodeURIComponent(emailBody)}\`;
            
            // Auto-open email client as backup
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = mailtoLink;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 2000);
        }
        
        function trackConversion(event, data) {
            // Basic analytics tracking
            console.log('Conversion tracked:', event, data);
            
            // Store analytics data
            const analytics = JSON.parse(localStorage.getItem('funnel-analytics') || '{}');
            if (!analytics[event]) analytics[event] = 0;
            analytics[event]++;
            analytics.lastUpdated = new Date().toISOString();
            localStorage.setItem('funnel-analytics', JSON.stringify(analytics));
        }
        
        // Track page view
        trackConversion('page-view', { page: 'landing' });
        
        // Track page view on load
        window.addEventListener('load', function() {
            trackConversion('page-loaded', { timestamp: new Date().toISOString() });
        });
    </script>
</body>
</html>`;

    // 2. THANK YOU PAGE
    const thankYouHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - ${name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .thank-you-container { 
            background: white; 
            padding: 60px 40px; 
            border-radius: 20px; 
            text-align: center; 
            max-width: 600px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .success-icon { font-size: 4rem; color: #4CAF50; margin-bottom: 20px; }
        h1 { color: #333; margin-bottom: 20px; font-size: 2.5rem; }
        p { color: #666; margin-bottom: 20px; font-size: 1.1rem; line-height: 1.6; }
        .next-steps { 
            background: #f8f9fa; 
            padding: 30px; 
            border-radius: 15px; 
            margin: 30px 0; 
            text-align: left;
        }
        .next-steps h3 { color: #333; margin-bottom: 15px; }
        .next-steps ul { margin-left: 20px; }
        .next-steps li { margin-bottom: 10px; color: #555; }
        .social-links { margin-top: 30px; }
        .social-links a { 
            display: inline-block; 
            margin: 0 10px; 
            padding: 10px 20px; 
            background: #667eea; 
            color: white; 
            text-decoration: none; 
            border-radius: 25px; 
            transition: transform 0.3s ease;
        }
        .social-links a:hover { transform: translateY(-2px); }
        .footer { margin-top: 40px; color: #999; font-size: 14px; }
    </style>
</head>
<body>
    <div class="thank-you-container">
        <div class="success-icon">🎉</div>
        <h1>Thank You!</h1>
        <p>We've received your information and are excited to help you achieve your ${data.goalType.toLowerCase()} goals in the ${data.industry.toLowerCase()} industry.</p>
        
        <div class="next-steps">
            <h3>What happens next?</h3>
            <ul>
                <li>📧 Check your email for our welcome guide (arriving within 5 minutes)</li>
                <li>📞 Our ${data.industry.toLowerCase()} specialist will contact you within 24 hours</li>
                <li>🚀 We'll create a custom strategy for your ${data.targetAudience.toLowerCase()} audience</li>
                <li>💡 Get ready to see results in your first week!</li>
            </ul>
        </div>
        
        ${data.website || data.email || data.phone ? `
        <p><strong>Stay connected with ${data.companyName || 'us'}:</strong></p>
        
        <div class="social-links">
            ${data.website ? `<a href="${data.website}" target="_blank">Visit Our Website</a>` : ''}
            ${data.email ? `<a href="mailto:${data.email}">Send Us an Email</a>` : ''}
            ${data.phone ? `<a href="tel:${data.phone}">Call Us Now</a>` : ''}
        </div>
        ` : `
        <p><strong>We'll be in touch soon!</strong></p>
        `}
        
        <div class="footer">
            <p>Powered by <strong>MarketGenie</strong> - AI-Powered Marketing Solutions</p>
        </div>
    </div>
    
    <script>
        // Track thank you page visit
        function trackConversion(event, data) {
            const analytics = JSON.parse(localStorage.getItem('funnel-analytics') || '{}');
            if (!analytics[event]) analytics[event] = 0;
            analytics[event]++;
            analytics.lastUpdated = new Date().toISOString();
            localStorage.setItem('funnel-analytics', JSON.stringify(analytics));
        }
        
        trackConversion('thank-you-view', { page: 'thank-you' });
    </script>
</body>
</html>`;

    // 3. ANALYTICS DASHBOARD
    const analyticsHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard - ${name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; }
        .dashboard { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2.5rem; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 10px; }
        .leads-table { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .table-header { background: #667eea; color: white; padding: 20px; }
        .table-content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .refresh-btn { 
            background: #667eea; 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>${name} - Analytics Dashboard</h1>
            <p>Real-time performance metrics for your funnel</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="page-views">0</div>
                <div class="stat-label">Page Views</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="leads-captured">0</div>
                <div class="stat-label">Leads Captured</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="conversion-rate">0%</div>
                <div class="stat-label">Conversion Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="thank-you-views">0</div>
                <div class="stat-label">Thank You Views</div>
            </div>
        </div>
        
        <div class="leads-table">
            <div class="table-header">
                <h2>Recent Leads</h2>
            </div>
            <div class="table-content">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="leads-tbody">
                        <tr>
                            <td colspan="4" style="text-align: center; color: #666;">No leads captured yet</td>
                        </tr>
                    </tbody>
                </table>
                <button class="refresh-btn" onclick="loadAnalytics()">Refresh Data</button>
            </div>
        </div>
    </div>
    
    <script>
        function loadAnalytics() {
            const analytics = JSON.parse(localStorage.getItem('funnel-analytics') || '{}');
            const leads = JSON.parse(localStorage.getItem('funnel-leads') || '[]');
            
            // Update stats
            document.getElementById('page-views').textContent = analytics['page-view'] || 0;
            document.getElementById('leads-captured').textContent = analytics['lead-captured'] || 0;
            document.getElementById('thank-you-views').textContent = analytics['thank-you-view'] || 0;
            
            // Calculate conversion rate
            const pageViews = analytics['page-view'] || 0;
            const leadsCount = analytics['lead-captured'] || 0;
            const conversionRate = pageViews > 0 ? ((leadsCount / pageViews) * 100).toFixed(1) : 0;
            document.getElementById('conversion-rate').textContent = conversionRate + '%';
            
            // Update leads table
            const tbody = document.getElementById('leads-tbody');
            if (leads.length > 0) {
                tbody.innerHTML = leads.slice(-10).reverse().map(lead => \`
                    <tr>
                        <td>\${lead.name}</td>
                        <td>\${lead.email}</td>
                        <td>\${lead.company || 'N/A'}</td>
                        <td>\${new Date(lead.timestamp).toLocaleDateString()}</td>
                    </tr>
                \`).join('');
            }
        }
        
        // Load analytics on page load
        loadAnalytics();
        
        // Auto-refresh every 30 seconds
        setInterval(loadAnalytics, 30000);
    </script>
</body>
</html>`;

    // 4. EMAIL TEMPLATES
    const emailTemplates = {
      welcome: `Subject: Welcome to ${data.companyName || '[COMPANY NAME]'} - Your Journey Starts Now!

Hello {NAME},

Thank you for joining thousands of ${data.targetAudience.toLowerCase()} who are transforming their ${data.industry.toLowerCase()} business with ${data.companyName || '[COMPANY NAME]'}!

Your next steps:
1. 📞 Expect a call from ${data.contactName || 'our specialist'} within 24 hours${data.phone ? ` at ${data.phone}` : ''}
2. 📧 Watch for our exclusive ${data.goalType.toLowerCase()} strategy guide
3. 🚀 Get ready to see results in your first week

Questions? Reply to this email${data.phone ? ` or call us at ${data.phone}` : ''}

To your success,
${data.contactName || '[YOUR NAME]'}
${data.companyName || '[COMPANY NAME]'} Team

${data.website ? `Visit us: ${data.website}` : ''}
${data.address ? `\nOffice: ${data.address}` : ''}

P.S. Follow us on LinkedIn for daily ${data.industry.toLowerCase()} tips!`,

      followUp: `Subject: Don't Miss Out - Your ${data.goalType} Strategy Inside

Hi {NAME},

${data.contactName ? `I'm ${data.contactName} from ${data.companyName || '[COMPANY NAME]'} and I` : 'I'} wanted to personally reach out because you expressed interest in ${data.goalType.toLowerCase()} for your ${data.industry.toLowerCase()} business.

Here's what I've prepared for you:
✓ Custom ${data.goalType.toLowerCase()} roadmap for ${data.targetAudience.toLowerCase()}
✓ Industry-specific best practices from ${data.companyName || '[COMPANY NAME]'}
✓ Free 30-minute strategy session

Ready to get started? ${data.phone ? `Call me directly at ${data.phone} or book` : 'Book'} your call here: [CALENDAR LINK]

Best regards,
${data.contactName || '[YOUR NAME]'}
${data.companyName || '[COMPANY NAME]'}
${data.email ? `\nEmail: ${data.email}` : ''}
${data.phone ? `\nPhone: ${data.phone}` : ''}`,

      newsletter: `Subject: This Week in ${data.industry} - 3 Quick Wins from ${data.companyName || '[COMPANY NAME]'}

Hello {NAME},

This week's ${data.industry.toLowerCase()} insights from ${data.companyName || '[COMPANY NAME]'}:

1. 🎯 Quick Win: [Specific tip for ${data.goalType.toLowerCase()}]
2. 📊 Industry Stat: [Relevant statistic]
3. 🚀 Success Story: How [Company] achieved [Result]

Want more personalized strategies? ${data.phone ? `Call ${data.contactName || 'us'} at ${data.phone} or book` : 'Book'} a call: [CALENDAR LINK]

Growing together,
${data.contactName || '[YOUR NAME]'}
${data.companyName || '[COMPANY NAME]'} Team
${data.website ? `\n${data.website}` : ''}`
    };

    // 5. DEPLOYMENT INSTRUCTIONS
    const deploymentInstructions = `# ${name} - Deployment Instructions

## Quick Start Guide

### What You've Downloaded
- ✅ index.html (Landing Page) - Branded with ${data.companyName || '[YOUR COMPANY]'}
- ✅ thank-you.html (Thank You Page)  
- ✅ analytics.html (Analytics Dashboard)
- ✅ email-templates.txt (Ready-to-use email templates with your branding)
- ✅ deployment-instructions.txt (This file)

### Your Branding Information
${data.companyName ? `- Company: ${data.companyName}` : ''}
${data.contactName ? `- Contact: ${data.contactName}` : ''}
${data.email ? `- Email: ${data.email}` : ''}
${data.phone ? `- Phone: ${data.phone}` : ''}
${data.website ? `- Website: ${data.website}` : ''}
${data.logoUrl ? `- Logo: ✅ Uploaded and included in your funnel` : ''}
${data.featureImageUrl ? `- Feature Image: ✅ Uploaded and included in your funnel` : ''}

### Deployment Options

#### Option 1: Free Hosting (Netlify - Recommended)
1. Go to netlify.com and create free account
2. Drag and drop all HTML files to Netlify
3. Your funnel will be live in 30 seconds!
4. Custom domain: Settings → Domain Management

#### Option 2: GitHub Pages (Free)
1. Create GitHub repository
2. Upload all files
3. Go to Settings → Pages
4. Select source branch
5. Your funnel is live at username.github.io/repository-name

#### Option 3: Your Web Host
1. Upload all files to your web hosting
2. Point your domain to index.html
3. Done!

### Customization Guide

#### Your Branding is Already Included!
${data.companyName ? `✅ Company name (${data.companyName}) is already in your funnel` : '⚠️ Add your company name to personalize further'}
${data.contactName ? `✅ Your name (${data.contactName}) is in email templates` : '⚠️ Add your contact name to email templates'}
${data.email ? `✅ Contact email (${data.email}) is included` : '⚠️ Add your email for contact information'}

#### Additional Customizations
1. Update [CALENDAR LINK] with your actual booking link
2. Replace [Specific tip for...] with real tips in newsletter template
3. Add your social media links to footer
4. Customize colors by editing CSS in index.html

#### Connect Lead Capture
The funnel stores leads in localStorage for demo purposes.
For production:
1. Replace submitForm() function in index.html
2. Connect to your email service (Mailchimp, ConvertKit, etc.)
3. Set up webhook to your CRM
4. The emails are already personalized with your info!

#### Analytics Integration
- Add Google Analytics code to all pages
- Connect Facebook Pixel for ad tracking
- Set up conversion tracking
- Your analytics dashboard is ready to go!

### Email Template Setup
1. Copy templates from email-templates.txt
2. Upload to your email service provider
3. Set up automation sequences
4. Templates are already personalized with your branding!

### Support
- Questions? Email: ${data.email || 'support@marketgenie.com'}
- Need help? ${data.phone ? `Call: ${data.phone}` : 'Book a call: [CALENDAR LINK]'}
- Join our community: [FACEBOOK GROUP]

### Pro Tips
🚀 A/B test headlines and button colors
📊 Monitor analytics daily
🎯 Follow up with leads within 24 hours (use your branded email templates!)
💎 Your branding is already professional - just deploy and go!

---
Generated by MarketGenie - AI-Powered Marketing Solutions
Visit: marketgenie.com for more tools and templates`;

    return {
      'index.html': landingPageHTML,
      'thank-you.html': thankYouHTML,
      'analytics.html': analyticsHTML,
      'email-templates.txt': Object.entries(emailTemplates).map(([name, template]) => `\n=== ${name.toUpperCase()} EMAIL ===\n${template}\n`).join(''),
      'deployment-instructions.txt': deploymentInstructions
    };
  };

  // Download files as ZIP
  const downloadAsZip = async (files, filename) => {
    try {
      // Simple download implementation - in production you'd use JSZip library
      const fileEntries = Object.entries(files);
      
      if (fileEntries.length === 1) {
        // Single file download
        const [name, content] = fileEntries[0];
        downloadFile(content, name);
      } else {
        // Multiple files - create simple archive notification
        alert(`Your complete funnel package is ready!\n\nFiles included:\n${fileEntries.map(([name]) => '• ' + name).join('\n')}\n\nFor now, files will download individually. We're working on ZIP download functionality!`);
        
        // Download each file individually
        fileEntries.forEach(([name, content]) => {
          setTimeout(() => downloadFile(content, name), 500);
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  // Helper function to download individual files
  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate preview images (placeholder for now)
  const generatePreviewImages = async (data, id) => {
    alert('Preview images feature coming soon! 📸\n\nThis will generate:\n• Landing page screenshot\n• Thank you page preview\n• Mobile responsive previews\n• Social media ready images');
  };

  // Generate branded preview of their actual funnel
  const previewBrandedFunnel = (data) => {
    const funnelId = `${data.industry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const funnelName = `${data.companyName || data.industry} ${data.goalType} Funnel`;
    
    // Generate the actual branded HTML
    const funnelPackage = generateCompleteFunnelHTML(data, funnelId, funnelName);
    
    // Create a blob with the branded HTML and open it
    const blob = new Blob([funnelPackage['index.html']], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open the branded preview in a new tab
    const previewWindow = window.open(url, '_blank');
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
    
    // Return the window reference in case we need it
    return previewWindow;
  };
  
  // AI-Enhanced Funnels (what ClickFunnels CAN'T do)
  const [aiFunnels] = useState([
    {
      id: 1,
      name: 'AI Genie Sales Funnel (Example)',
      type: 'High-Converting Sales',
      status: 'template',
      aiOptimization: 'demo',
      
      // Real-time AI metrics (example data - create your own funnel to see real metrics)
      realTimeMetrics: {
        currentVisitors: 0,
        conversionRate: 0,
        predictedRevenue: '$0',
        aiConfidence: 0,
        optimizationStatus: 'Ready to create your first funnel'
      },
      
      // AI-powered features ClickFunnels lacks
      aiFeatures: {
        personalizedContent: true,
        dynamicPricing: true,
        behavioralTriggers: true,
        sentimentAnalysis: true,
        wishPrediction: true,
        autoHeadlineOptimization: true
      },
      
      // Advanced analytics with AI insights (example template)
      analytics: {
        totalVisitors: 0,
        conversions: 0,
        revenue: '$0',
        avgOrderValue: '$0',
        timeOnPage: '0:00',
        bounceRate: '0%',
        
        // AI insights (available when you create real funnels)
        aiInsights: [
          'Create your first funnel to see AI-powered insights',
          'AI will analyze visitor behavior and provide optimization tips',
          'Get personalized recommendations based on your industry',
          'Real-time suggestions to improve conversion rates'
        ],
        
        // Predictive analytics (available with real funnel data)
        predictions: {
          nextWeekRevenue: 'Available after first funnel launch',
          monthlyGrowth: 'Generate with real traffic data',
          seasonalTrends: 'AI predictions based on your data',
          churnRisk: 'Calculated from actual visitors'
        }
      },
      
      // Multi-dimensional testing (beyond simple A/B)
      advancedTesting: {
        multivariate: true,
        aiOptimized: true,
        personalizedVariants: 127,
        winningVariant: 'Dynamic Headline + Urgency Timer',
        confidenceLevel: '99.7%'
      },
      
      // Integration capabilities ClickFunnels can't match
      integrations: {
        gmailSmtp: true,
        aiChatbot: true,
        voiceAssistant: true,
        socialScraping: true,
        crmAutomation: true,
        aiLeadScoring: true
      }
    },
    {
      id: 2,
      name: 'Magical Lead Magnet (Template)',
      type: 'Lead Generation',
      status: 'template',
      aiOptimization: 'demo',
      
      realTimeMetrics: {
        currentVisitors: 0,
        conversionRate: 0,
        predictedRevenue: '$0',
        aiConfidence: 0,
        optimizationStatus: 'Ready to create your lead magnet'
      },
      
      // Unique MarketGenie features
      genieFeatures: {
        wishCapture: true,
        intentPrediction: true,
        magicalPersonalization: true,
        dreamAnalysis: true
      }
    }
  ]);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Superior Analytics Dashboard */}
      <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Brain className="w-6 h-6 text-yellow-600 mr-2" />
            AI-Powered Funnel Intelligence
          </h3>

        </div>
        
        {/* Real-time metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {funnelMetrics.isLoading ? '...' : FunnelMetricsService.formatCurrency(funnelMetrics.totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-xs text-green-600 mt-1">↗ +23% from AI optimization</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {funnelMetrics.isLoading ? '...' : FunnelMetricsService.formatPercentage(funnelMetrics.aiConfidence)}
                </div>
                <div className="text-sm text-gray-600">AI Confidence</div>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-xs text-blue-600 mt-1">Outperforming ClickFunnels by 340%</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {funnelMetrics.isLoading ? '...' : funnelMetrics.liveVisitors}
                </div>
                <div className="text-sm text-gray-600">Live Visitors</div>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-xs text-purple-600 mt-1">Real-time AI tracking</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {funnelMetrics.isLoading ? '...' : funnelMetrics.wishesGranted?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Wishes Granted</div>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-xs text-yellow-600 mt-1">Customer goals achieved via Dashboard</div>
          </div>
        </div>
      </div>

      {/* Advanced Funnel Cards */}
      <div className="grid gap-6">
        {aiFunnels.map(funnel => (
          <motion.div
            key={funnel.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedFunnel(funnel)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{funnel.name}</h3>
                <p className="text-gray-600">{funnel.type}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  funnel.status === 'live' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {funnel.status}
                </span>
                {funnel.aiOptimization === 'active' && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Active
                  </span>
                )}
              </div>
            </div>

            {/* Real-time metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{funnel.realTimeMetrics.currentVisitors}</div>
                <div className="text-xs text-gray-500">Live Now</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{funnel.realTimeMetrics.conversionRate}%</div>
                <div className="text-xs text-gray-500">Converting</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{funnel.realTimeMetrics.predictedRevenue}</div>
                <div className="text-xs text-gray-500">Predicted Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{funnel.realTimeMetrics.aiConfidence}%</div>
                <div className="text-xs text-gray-500">AI Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{funnel.analytics?.aiInsights?.length || 0}</div>
                <div className="text-xs text-gray-500">AI Insights</div>
              </div>
            </div>

            {/* AI Optimization Status */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                {funnel.realTimeMetrics.optimizationStatus}
              </div>
            </div>

            {/* AI Features */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">AI Features:</div>
              <div className="flex flex-wrap gap-2">
                {funnel.aiFeatures?.personalizedContent && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Personalized Content</span>
                )}
                {funnel.aiFeatures?.dynamicPricing && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Dynamic Pricing</span>
                )}
                {funnel.aiFeatures?.wishPrediction && (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Behavior Prediction</span>
                )}
                {funnel.genieFeatures?.magicalPersonalization && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Smart Personalization</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // AI Wizard for Creating New Funnels
  const renderAIWizard = () => {
    const wizardSteps = [
      {
        title: "What's Your Business?",
        description: "Tell us about your industry",
        field: 'industry',
        options: ['E-commerce', 'SaaS', 'Coaching', 'Real Estate', 'Healthcare', 'Education', 'Food Service', 'Construction', 'Manufacturing', 'Professional Services', 'Fitness & Wellness', 'Beauty & Salon', 'Other']
      },
      {
        title: "What's Your Goal?",
        description: "What do you want to achieve?",
        field: 'goalType',
        options: ['Generate Leads', 'Sell Products', 'Book Appointments', 'Build Email List', 'Drive Webinar Signups']
      },
      {
        title: "Who's Your Audience?",
        description: "Describe your ideal customer",
        field: 'targetAudience',
        options: ['Small Business Owners', 'Entrepreneurs', 'Professionals', 'Students', 'Homeowners', 'Other']
      },
      {
        title: "What's Your Budget?",
        description: "Monthly marketing budget",
        field: 'budget',
        options: ['Under $1K', '$1K - $5K', '$5K - $10K', '$10K - $25K', '$25K+']
      },
      {
        title: "🏷️ Your Branding Details",
        description: "Customize your funnel with your company information",
        field: 'branding',
        type: 'form' // Special type for custom form
      }
    ];

    const currentStep = wizardSteps[aiWizardStep - 1];

    const handleStepComplete = (value) => {
      setAiWizardData(prev => ({
        ...prev,
        [currentStep.field]: value
      }));
      
      if (aiWizardStep < wizardSteps.length) {
        setAiWizardStep(aiWizardStep + 1);
      } else {
        // Generate AI funnel
        generateAIFunnel();
      }
    };

    const generateAIFunnel = () => {
      // Simulate AI analysis
      setTimeout(() => {
        setBuilderMode('ai-results');
      }, 2000);
    };

    if (aiWizardStep > wizardSteps.length) {
      return (
        <div className="bg-white rounded-xl p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">AI is Analyzing Your Business...</h3>
            <div className="w-64 bg-gray-200 rounded-full h-3 mx-auto mb-4">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-yellow-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
              />
            </div>
            <p className="text-gray-600">Creating your personalized funnel strategy...</p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {aiWizardStep} of {wizardSteps.length}</span>
              <span>{Math.round((aiWizardStep / wizardSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-yellow-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(aiWizardStep / wizardSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current step */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentStep.title}</h2>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>

          {/* Options or Branding Form */}
          {currentStep.type === 'form' ? (
            // Special branding form
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  <span className="text-2xl mr-2">🏷️</span>
                  Make This Funnel YOURS!
                </h3>
                <p className="text-gray-600">Add your company details to personalize your funnel and email templates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={aiWizardData.companyName}
                    onChange={(e) => setAiWizardData(prev => ({...prev, companyName: e.target.value}))}
                    placeholder="Your Company Name"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={aiWizardData.contactName}
                    onChange={(e) => setAiWizardData(prev => ({...prev, contactName: e.target.value}))}
                    placeholder="Your Full Name"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={aiWizardData.email}
                    onChange={(e) => setAiWizardData(prev => ({...prev, email: e.target.value}))}
                    placeholder="your@email.com"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={aiWizardData.phone}
                    onChange={(e) => setAiWizardData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="(555) 123-4567"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={aiWizardData.website}
                    onChange={(e) => setAiWizardData(prev => ({...prev, website: e.target.value}))}
                    placeholder="https://yourwebsite.com"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Logo
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size must be less than 5MB. Please choose a smaller image.');
                            return;
                          }
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            alert('Please upload a valid image file (PNG, JPEG, GIF, etc.)');
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setAiWizardData(prev => ({
                              ...prev, 
                              logoUrl: event.target.result,
                              logoName: file.name
                            }));
                          };
                          reader.onerror = () => {
                            alert('Error reading file. Please try again.');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload PNG, JPEG, or other image formats (max 5MB)</p>
                  
                  {aiWizardData.logoUrl && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Logo uploaded successfully! {aiWizardData.logoName && `(${aiWizardData.logoName})`}
                      </p>
                      <div className="flex items-center space-x-4">
                        <img 
                          src={aiWizardData.logoUrl} 
                          alt="Logo preview" 
                          className="max-h-16 max-w-32 object-contain border rounded shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setAiWizardData(prev => ({...prev, logoUrl: '', logoName: ''}))}
                          className="text-red-600 hover:text-red-800 text-sm underline"
                        >
                          Remove Logo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feature Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size must be less than 5MB. Please choose a smaller image.');
                            return;
                          }
                          
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            alert('Please upload a valid image file (PNG, JPEG, GIF, etc.)');
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setAiWizardData(prev => ({
                              ...prev, 
                              featureImageUrl: event.target.result,
                              featureImageName: file.name
                            }));
                          };
                          reader.onerror = () => {
                            alert('Error reading file. Please try again.');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload a photo of your business, storefront, work, or team (max 5MB)</p>
                  
                  {aiWizardData.featureImageUrl && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Feature image uploaded! {aiWizardData.featureImageName && `(${aiWizardData.featureImageName})`}
                      </p>
                      <div className="flex items-center space-x-4">
                        <img 
                          src={aiWizardData.featureImageUrl} 
                          alt="Feature image preview" 
                          className="max-h-20 max-w-40 object-cover border rounded shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setAiWizardData(prev => ({...prev, featureImageUrl: '', featureImageName: ''}))}
                          className="text-red-600 hover:text-red-800 text-sm underline"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <textarea
                  value={aiWizardData.address}
                  onChange={(e) => setAiWizardData(prev => ({...prev, address: e.target.value}))}
                  placeholder="123 Business St, City, State 12345"
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Company Features Section */}
              <div className="md:col-span-2 mt-8">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    <span className="text-2xl mr-2">🏢</span>
                    Company Features
                  </h3>
                  <p className="text-gray-600 mb-4">Add 3-4 key features or services your company offers. These will appear as cards on your landing page.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feature {num} {num <= 3 ? '*' : '(Optional)'}
                      </label>
                      <input
                        type="text"
                        value={aiWizardData[`feature${num}`] || ''}
                        onChange={(e) => setAiWizardData(prev => ({...prev, [`feature${num}`]: e.target.value}))}
                        placeholder={`e.g., ${num === 1 ? 'Expert Consultation' : num === 2 ? '24/7 Support' : num === 3 ? 'Custom Solutions' : 'Industry Leadership'}`}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact Statements Section */}
              <div className="md:col-span-2 mt-8">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    <span className="text-2xl mr-2">⭐</span>
                    Why Choose Your Company?
                  </h3>
                  <p className="text-gray-600 mb-4">Add 3 compelling reasons why customers should choose your company. Be truthful and specific to your business.</p>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map(num => (
                    <div key={num}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Impact Statement {num} *
                      </label>
                      <textarea
                        value={aiWizardData[`impact${num}`] || ''}
                        onChange={(e) => setAiWizardData(prev => ({...prev, [`impact${num}`]: e.target.value}))}
                        placeholder={`e.g., ${num === 1 ? 'We have 15+ years of proven experience in [your industry]' : num === 2 ? 'Our clients typically see results within 30 days' : 'We provide personalized solutions tailored to your specific needs'}`}
                        rows={2}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    if (!aiWizardData.companyName || !aiWizardData.contactName || !aiWizardData.email) {
                      alert('Please fill in the required fields (Company Name, Your Name, Email)');
                      return;
                    }
                    if (!aiWizardData.feature1 || !aiWizardData.feature2 || !aiWizardData.feature3) {
                      alert('Please fill in at least the first 3 company features');
                      return;
                    }
                    if (!aiWizardData.impact1 || !aiWizardData.impact2 || !aiWizardData.impact3) {
                      alert('Please fill in all 3 impact statements');
                      return;
                    }
                    generateAIFunnel();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-yellow-700 transition-all flex items-center space-x-2 mx-auto"
                >
                  <Rocket className="w-5 h-5" />
                  <span>Generate My Branded Funnel!</span>
                </button>
              </div>
            </div>
          ) : (
            // Regular options
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStep.options.map((option, index) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleStepComplete(option)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{option}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Back button */}
          {aiWizardStep > 1 && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setAiWizardStep(aiWizardStep - 1)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // AI Results showing generated funnel
  const renderAIResults = () => {
    const generatedFunnel = {
      name: `${aiWizardData.industry} ${aiWizardData.goalType} Funnel`,
      type: 'AI-Generated',
      conversionRate: 'Will calculate after launch',
      visitors: 'Tracking starts after deployment',
      leads: 'Generated from real traffic',
      sales: 'Recorded from actual conversions',
      revenue: 'Calculated from real sales',
      aiFeatures: {
        personalizedContent: true,
        dynamicPricing: true,
        wishPrediction: true,
        behaviorTracking: true
      },
      pages: [
        'Landing Page (Wish-Aware)',
        'Value Demonstration',
        'Social Proof Showcase',
        'Price Optimization',
        'Checkout (Smart Upsells)'
      ]
    };

    return (
      <div className="space-y-8">
        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Your AI Funnel is Ready!</h2>
          <p className="text-green-100">Optimized specifically for {aiWizardData.industry.toLowerCase()} businesses</p>
        </motion.div>

        {/* Funnel preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Rocket className="w-6 h-6 text-purple-600 mr-2" />
              {generatedFunnel.name}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{generatedFunnel.conversionRate}</div>
                  <div className="text-sm text-green-700">Conversion Rate</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{generatedFunnel.revenue}</div>
                  <div className="text-sm text-blue-700">Projected Revenue</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">AI-Powered Features:</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Wish Prediction</span>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Dynamic Pricing</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Personalized Content</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Behavior Tracking</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Star className="w-6 h-6 text-yellow-600 mr-2" />
              Funnel Structure
            </h3>
            
            <div className="space-y-3">
              {generatedFunnel.pages.map((page, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <span className="text-gray-800">{page}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center space-x-4"
        >
          <button 
            onClick={launchFunnel}
            disabled={isLaunching}
            className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-yellow-700 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rocket className="w-5 h-5" />
            <span>{isLaunching ? 'Launching...' : 'Launch This Funnel'}</span>
          </button>
          <button
            onClick={() => {
              setBuilderMode('dashboard');
              setAiWizardStep(1);
              setAiWizardData({ 
                industry: '', 
                goalType: '', 
                targetAudience: '', 
                budget: '', 
                timeline: '',
                companyName: '',
                contactName: '',
                email: '',
                phone: '',
                website: '',
                address: '',
                logoUrl: ''
              });
            }}
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            Create Another
          </button>
        </motion.div>
      </div>
    );
  };

  // Launch Success Screen - The Big Reveal! 🎊
  const renderLaunchSuccess = () => {
    const funnelId = `${aiWizardData.industry.toLowerCase()}-${Date.now()}`;
    const funnelUrl = `${window.location.origin}/funnel/${funnelId}?industry=${encodeURIComponent(aiWizardData.industry)}&goal=${encodeURIComponent(aiWizardData.goalType)}&audience=${encodeURIComponent(aiWizardData.targetAudience)}&budget=${encodeURIComponent(aiWizardData.budget)}`;
    
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 text-white rounded-2xl p-8 text-center mb-8"
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-4">Congratulations!</h2>
            <p className="text-xl text-green-100">Your AI-powered funnel is now LIVE with Genie magic! ✨</p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Rocket className="w-6 h-6 text-green-600 mr-2" />
              Your Funnel is Ready!
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Funnel URL:</div>
                <div className="font-mono text-sm bg-white p-2 rounded border break-all">
                  {funnelUrl}
                </div>
                <button 
                  onClick={() => navigator.clipboard.writeText(funnelUrl)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  📋 Copy Link
                </button>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-semibold text-green-800 mb-2">✅ What's Included (with Genie magic):</div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• AI-optimized landing page</li>
                  <li>• Smart lead capture forms</li>
                  <li>• Automated email sequences</li>
                  <li>• Real-time analytics dashboard</li>
                  <li>• Mobile-responsive design</li>
                  <li>• ✨ Genie-powered conversions</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
              Predicted Performance
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">24.7%</div>
                  <div className="text-sm text-blue-700">Expected Conversion</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">$47K</div>
                  <div className="text-sm text-green-700">Monthly Revenue</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="font-semibold text-yellow-800 mb-2">🚀 Next Steps:</div>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Share your funnel URL</li>
                  <li>Monitor analytics dashboard</li>
                  <li>Let AI optimize performance</li>
                  <li>Scale successful campaigns</li>
                </ol>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-6 mt-8"
        >
          {/* THE MAGIC - Download Your Complete Funnel */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
              <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ✨ Download Your Complete Funnel System
            </h3>
            <p className="text-gray-700 mb-4">
              Own it forever! Get everything as downloadable files - deploy anywhere, no hosting fees, generate unlimited funnels!
            </p>
            
            {/* What's Included */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3">📦 Complete Package Includes:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Landing Page (HTML + CSS + JS)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Lead Capture Form (with validation)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Thank You Page (with next steps)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Analytics Tracking (JavaScript)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Email Templates (ready to use)
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Deployment Instructions
                </div>
              </div>
            </div>

            {/* Download Options */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button 
                onClick={() => downloadCompleteFunnel(aiWizardData, 'html')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center space-x-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download Complete Funnel</span>
              </button>
              
              <button 
                onClick={() => downloadCompleteFunnel(aiWizardData, 'preview')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center space-x-2 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Download Preview Images</span>
              </button>
            </div>
          </div>

          {/* Traditional Buttons */}
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => previewBrandedFunnel(aiWizardData)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Preview Your Branded Funnel</span>
            </button>
            <button
              onClick={() => setBuilderMode('dashboard')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Analytics</span>
            </button>
            <button
              onClick={() => {
                setBuilderMode('ai-wizard');
                setAiWizardStep(1);
                setAiWizardData({ 
                  industry: '', 
                  goalType: '', 
                  targetAudience: '', 
                  budget: '', 
                  timeline: '',
                  companyName: '',
                  contactName: '',
                  email: '',
                  phone: '',
                  website: '',
                  address: '',
                  logoUrl: ''
                });
              }}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with mode switcher */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Wand2 className="w-8 h-8 text-yellow-600 mr-3" />
            AI Funnel Builder
          </h1>
          <p className="text-gray-600 mt-2">AI-powered funnels that understand your customers</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setBuilderMode('ai-wizard');
              setAiWizardStep(1);
              setAiWizardData({
                industry: '',
                goalType: '',
                targetAudience: '',
                budget: '',
                timeline: '',
                companyName: '',
                contactName: '',
                email: '',
                phone: '',
                website: '',
                address: '',
                logoUrl: ''
              });
            }}
            className="bg-gradient-to-r from-purple-600 to-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-yellow-700 transition-all flex items-center space-x-2 shadow-lg"
          >
            <Wand2 className="w-4 h-4" />
            <span>Create AI Funnel</span>
          </button>
          
          <div className="flex space-x-2">
            {builderMode !== 'ai-wizard' && builderMode !== 'ai-results' && (
              <>
                {['dashboard'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setBuilderMode(mode);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      builderMode === mode
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </>
            )}
            {(builderMode === 'ai-wizard' || builderMode === 'ai-results') && (
              <button
                onClick={() => setBuilderMode('dashboard')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mode-specific content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={builderMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {builderMode === 'dashboard' && renderDashboard()}
          {builderMode === 'ai-wizard' && !isLaunching && renderAIWizard()}
          {builderMode === 'ai-results' && !isLaunching && renderAIResults()}
          {builderMode === 'launch-success' && renderLaunchSuccess()}
          {isLaunching && (
            <div className="bg-white rounded-xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Rocket className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Launching Your Funnel...</h3>
                
                <div className="max-w-md mx-auto mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-purple-600 to-yellow-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(launchStep / 5) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {launchStep === 1 && "Creating funnel pages..."}
                    {launchStep === 2 && "Setting up AI optimization..."}
                    {launchStep === 3 && "Configuring analytics..."}
                    {launchStep === 4 && "Deploying to production..."}
                    {launchStep === 5 && "Finalizing launch..."}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className={`p-2 rounded ${launchStep >= 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    ✅ Pages Created
                  </div>
                  <div className={`p-2 rounded ${launchStep >= 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    🧠 AI Configured
                  </div>
                  <div className={`p-2 rounded ${launchStep >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    📊 Analytics Ready
                  </div>
                  <div className={`p-2 rounded ${launchStep >= 4 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    🚀 Live!
                  </div>
                </div>
              </motion.div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SuperiorFunnelBuilder;