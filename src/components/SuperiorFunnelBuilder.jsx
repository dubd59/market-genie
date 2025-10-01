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

const SuperiorFunnelBuilder = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [builderMode, setBuilderMode] = useState('dashboard'); // dashboard, builder, analytics, ai-optimizer, ai-wizard
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
    
    // 1. LANDING PAGE (Main funnel page)
    const landingPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.companyName ? `${data.companyName} - ${name}` : name} | Powered by MarketGenie</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            background: linear-gradient(135deg, #f3e8ff 0%, #fef3c7 100%);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        
        /* Genie Magic Header Styles */
        .company-header {
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 20px;
            text-align: center;
            margin-bottom: 30px;
            border: 2px solid rgba(147, 51, 234, 0.1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .company-header h1 { 
            font-size: 2.5rem; 
            margin-bottom: 10px; 
            background: linear-gradient(135deg, #9333ea 0%, #eab308 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .company-header .subtitle { 
            font-size: 1.2rem; 
            color: #6b7280; 
            margin-bottom: 15px; 
        }
        .company-contact { 
            font-size: 0.95rem; 
            color: #9333ea; 
            font-weight: 500;
        }
        
        /* Hero Section with Genie Magic */
        .hero { 
            text-align: center; 
            padding: 80px 20px; 
            background: linear-gradient(135deg, #9333ea 0%, #eab308 100%);
            border-radius: 25px;
            margin-bottom: 40px;
            box-shadow: 0 25px 50px rgba(147, 51, 234, 0.3);
            color: white; 
        }
        .hero h1 { 
            font-size: 3.5rem; 
            margin-bottom: 20px; 
            font-weight: bold; 
            text-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .hero h2 { 
            font-size: 1.8rem; 
            margin-bottom: 20px; 
            opacity: 0.95; 
            font-weight: 600;
        }
        .hero p { 
            font-size: 1.3rem; 
            margin-bottom: 40px; 
            opacity: 0.9; 
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        
        /* Beautiful CTA Section */
        .cta-section { 
            background: rgba(255,255,255,0.95); 
            backdrop-filter: blur(10px);
            padding: 60px 40px; 
            margin: 40px 0; 
            border-radius: 25px; 
            box-shadow: 0 25px 50px rgba(0,0,0,0.1);
            border: 1px solid rgba(147, 51, 234, 0.1);
        }
        .cta-section h2 {
            background: linear-gradient(135deg, #9333ea 0%, #eab308 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2.2rem;
            margin-bottom: 15px;
        }
        .cta-section .subtitle {
            color: #6b7280;
            font-size: 1.1rem;
            margin-bottom: 30px;
        }
        
        /* Gorgeous Form Styling */
        .lead-form { max-width: 500px; margin: 0 auto; }
        .form-group { margin-bottom: 25px; }
        .form-group label { 
            display: block; 
            margin-bottom: 8px; 
            font-weight: bold; 
            color: #374151;
            font-size: 1rem;
        }
        .form-group input, .form-group select { 
            width: 100%; 
            padding: 18px 20px; 
            border: 2px solid #e5e7eb; 
            border-radius: 15px; 
            font-size: 16px;
            transition: all 0.3s ease;
            background: rgba(255,255,255,0.8);
        }
        .form-group input:focus, .form-group select:focus { 
            border-color: #9333ea; 
            outline: none;
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
            transform: translateY(-2px);
        }
        
        /* Magical Submit Button */
        .submit-btn { 
            background: linear-gradient(135deg, #9333ea 0%, #eab308 100%); 
            color: white; 
            padding: 20px 40px; 
            border: none; 
            border-radius: 15px; 
            font-size: 18px; 
            font-weight: bold; 
            cursor: pointer; 
            width: 100%; 
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);
            position: relative;
            overflow: hidden;
        }
        .submit-btn:hover { 
            transform: translateY(-3px); 
            box-shadow: 0 15px 35px rgba(147, 51, 234, 0.4);
        }
        .submit-btn:before {
            content: '✨';
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        /* Beautiful Features Grid */
        .features { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 30px; 
            margin: 60px 0; 
        }
        .feature { 
            background: rgba(255,255,255,0.9); 
            backdrop-filter: blur(10px);
            padding: 35px; 
            border-radius: 20px; 
            text-align: center; 
            box-shadow: 0 15px 35px rgba(147, 51, 234, 0.1);
            border: 1px solid rgba(147, 51, 234, 0.1);
            transition: all 0.3s ease;
        }
        .feature:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 45px rgba(147, 51, 234, 0.15);
        }
        .feature h3 { 
            margin-bottom: 15px; 
            font-size: 1.5rem;
            background: linear-gradient(135deg, #9333ea 0%, #eab308 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .feature p { color: #6b7280; font-size: 1rem; }
        
        /* Professional Footer */
        .footer { 
            background: rgba(17, 24, 39, 0.95);
            backdrop-filter: blur(10px);
            color: white;
            text-align: center; 
            padding: 40px 20px; 
            border-radius: 20px;
            margin-top: 60px;
        }
        .footer p { margin-bottom: 10px; }
        .footer a { color: #fbbf24; text-decoration: none; transition: color 0.3s ease; }
        .footer a:hover { color: #f59e0b; }
        .footer .powered-by {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 14px;
            opacity: 0.8;
        }
        
        /* Responsive Magic */
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero h2 { font-size: 1.5rem; }
            .hero p { font-size: 1.1rem; }
            .company-header h1 { font-size: 2rem; }
            .cta-section { padding: 40px 20px; }
            .features { grid-template-columns: 1fr; }
            .feature { padding: 25px; }
        }
        
        /* Genie Magic Animations */
        @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
        }
        .sparkle { animation: sparkle 2s ease-in-out infinite; }
    </style>
</head>
<body>
    <div class="container">
        ${data.logoUrl ? `<div style="text-align: center; margin-bottom: 30px;"><img src="${data.logoUrl}" alt="${data.companyName}" style="max-height: 80px; max-width: 250px; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"></div>` : ''}
        
        ${data.companyName ? `
        <div class="company-header sparkle">
            <h1>${data.companyName}</h1>
            <p class="subtitle">${data.industry} Excellence & ${data.goalType}</p>
            ${data.contactName ? `<p style="font-size: 1.1rem; color: #6b7280; margin-bottom: 15px;">Led by ${data.contactName}</p>` : ''}
            <div class="company-contact">
                ${data.phone ? `📞 ${data.phone}` : ''} 
                ${data.email ? `${data.phone ? ' • ' : ''}📧 ${data.email}` : ''}
                ${data.website ? `${(data.phone || data.email) ? ' • ' : ''}🌐 ${data.website.replace(/^https?:\/\//, '')}` : ''}
            </div>
        </div>
        ` : ''}
        
        <div class="hero">
            <h1>${data.companyName ? `Welcome to ${data.companyName}` : `Transform Your ${data.industry} Business Today`}</h1>
            <h2>
                ${data.companyName ? `${data.industry} Excellence by ${data.companyName}` : `Transform Your ${data.industry} Business Today`}
            </h2>
            <p>Join thousands of ${data.targetAudience.toLowerCase()} who are already succeeding with ${data.companyName ? `${data.companyName}'s proven system` : 'our proven system'}</p>
            ${data.contactName ? `<p style="margin-top: 15px; font-size: 1.1rem; opacity: 0.9;">✨ Led by ${data.contactName} and our expert team ✨</p>` : ''}
        </div>

        <div class="cta-section">
            <h2>
                ${data.companyName ? `Ready to Work with ${data.companyName}?` : `Get Started - ${data.goalType} Made Simple`}
            </h2>
            ${data.contactName ? `<p class="subtitle">Connect directly with ${data.contactName} and our ${data.industry.toLowerCase()} experts</p>` : ''}
            <form class="lead-form" id="leadForm" onsubmit="submitForm(event)">
                <div class="form-group">
                    <label for="name">Full Name *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email Address *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone">
                </div>
                <div class="form-group">
                    <label for="company">Company/Business</label>
                    <input type="text" id="company" name="company">
                </div>
                <button type="submit" class="submit-btn">
                    ${data.companyName ? `Connect with ${data.companyName}` : `Get My Free ${data.goalType} Strategy`}
                </button>
            </form>
        </div>

        <div class="features">
            <div class="feature">
                <h3>🚀 Proven Results</h3>
                <p>${data.companyName ? `${data.companyName}'s ${data.industry.toLowerCase()} strategies` : `Our ${data.industry.toLowerCase()} strategies`} have helped businesses increase conversions by 340% with Genie magic</p>
            </div>
            <div class="feature">
                <h3>⚡ Fast Implementation</h3>
                <p>Get up and running in under 24 hours with ${data.companyName ? `${data.companyName}'s step-by-step system` : 'our step-by-step system'} powered by AI</p>
            </div>
            <div class="feature">
                <h3>💎 Premium Support</h3>
                <p>Direct access to ${data.contactName || `${data.companyName ? data.companyName : 'our'} team`} and other ${data.industry.toLowerCase()} experts who understand your unique challenges</p>
            </div>
        </div>
    </div>

    <div class="footer">
        ${data.companyName ? `<h3 style="margin-bottom: 15px; color: #fbbf24;">${data.companyName}</h3>` : ''}
        ${data.email ? `<p>📧 Contact: <a href="mailto:${data.email}">${data.email}</a></p>` : ''}
        ${data.phone ? `<p>📞 Phone: <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
        ${data.website ? `<p>🌐 Website: <a href="${data.website}" target="_blank">${data.website}</a></p>` : ''}
        ${data.address ? `<p>📍 ${data.address}</p>` : ''}
        <div class="powered-by">
            <p>✨ Powered by <a href="#" target="_blank">MarketGenie</a> - AI-Powered Marketing Solutions with Genie Magic ✨</p>
            <p style="font-size: 12px; margin-top: 10px;">© ${new Date().getFullYear()} ${data.companyName || 'Your Company'}. All rights reserved.</p>
        </div>
    </div>

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
            // In production, this would send to your backend
            const leads = JSON.parse(localStorage.getItem('funnel-leads') || '[]');
            leads.push({
                ...data,
                timestamp: new Date().toISOString(),
                funnelId: '${id}',
                source: window.location.href
            });
            localStorage.setItem('funnel-leads', JSON.stringify(leads));
            
            // Analytics tracking
            trackConversion('lead-captured', data);
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
        
        <p><strong>In the meantime, follow us for daily ${data.industry.toLowerCase()} tips and strategies:</strong></p>
        
        <div class="social-links">
            <a href="#">Follow on LinkedIn</a>
            <a href="#">Join Our Community</a>
            <a href="#">Download Free Guide</a>
        </div>
        
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
${data.logoUrl ? `- Logo: ${data.logoUrl}` : ''}

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
  
  // AI-Enhanced Funnels (what ClickFunnels CAN'T do)
  const [aiFunnels] = useState([
    {
      id: 1,
      name: 'AI Genie Sales Funnel',
      type: 'High-Converting Sales',
      status: 'live',
      aiOptimization: 'active',
      
      // Real-time AI metrics
      realTimeMetrics: {
        currentVisitors: 47,
        conversionRate: 32.4,
        predictedRevenue: '$15,420',
        aiConfidence: 94,
        optimizationStatus: 'Learning from 2,341 interactions'
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
      
      // Advanced analytics with AI insights
      analytics: {
        totalVisitors: 18429,
        conversions: 5967,
        revenue: '$489,230',
        avgOrderValue: '$82.00',
        timeOnPage: '4:23',
        bounceRate: '12%',
        
        // AI insights
        aiInsights: [
          'Visitors from social media convert 67% better with video headlines',
          'Mobile users prefer shorter forms (3 fields max)',
          'Evening traffic shows 23% higher intent to purchase',
          'Users mentioning "urgent" in chat have 89% conversion rate'
        ],
        
        // Predictive analytics
        predictions: {
          nextWeekRevenue: '$67,890',
          monthlyGrowth: '+34%',
          seasonalTrends: 'Q4 surge expected +120%',
          churnRisk: 'Low (8.3%)'
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
      name: 'Magical Lead Magnet',
      type: 'Lead Generation',
      status: 'optimizing',
      aiOptimization: 'learning',
      
      realTimeMetrics: {
        currentVisitors: 23,
        conversionRate: 67.8,
        predictedRevenue: '$8,940',
        aiConfidence: 87,
        optimizationStatus: 'Testing 12 AI-generated variations'
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
          <div className="flex space-x-2">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center text-sm">
              <Wand2 className="w-4 h-4 mr-1" />
              Auto-Optimize All
            </button>
          </div>
        </div>
        
        {/* Real-time metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">$503,170</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-xs text-green-600 mt-1">↗ +23% from AI optimization</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">94.2%</div>
                <div className="text-sm text-gray-600">AI Confidence</div>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-xs text-blue-600 mt-1">Outperforming ClickFunnels by 340%</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">70</div>
                <div className="text-sm text-gray-600">Live Visitors</div>
              </div>
              <Eye className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-xs text-purple-600 mt-1">Real-time AI tracking</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">1,247</div>
                <div className="text-sm text-gray-600">Wishes Granted</div>
              </div>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-xs text-yellow-600 mt-1">Unique to MarketGenie</div>
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
        options: ['E-commerce', 'SaaS', 'Coaching', 'Real Estate', 'Healthcare', 'Education', 'Other']
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
                    Logo URL (optional)
                  </label>
                  <input
                    type="url"
                    value={aiWizardData.logoUrl}
                    onChange={(e) => setAiWizardData(prev => ({...prev, logoUrl: e.target.value}))}
                    placeholder="https://yourlogo.com/logo.png"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
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

              {/* Continue Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    if (!aiWizardData.companyName || !aiWizardData.contactName || !aiWizardData.email) {
                      alert('Please fill in the required fields (Company Name, Your Name, Email)');
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
      conversionRate: '24.7%',
      visitors: '8,453',
      leads: '2,088',
      sales: '312',
      revenue: '$47,820',
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
              onClick={() => window.open(funnelUrl, '_blank')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all flex items-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Preview First</span>
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
                {['dashboard', 'builder', 'analytics', 'ai-optimizer'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setBuilderMode(mode);
                      if (mode === 'builder') {
                        // Reset wizard when entering builder mode
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
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      builderMode === mode
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'builder' ? 'Create Funnel' : mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
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
          {builderMode === 'builder' && renderAIWizard()}
          {builderMode === 'analytics' && (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Advanced Analytics Dashboard</h3>
              <p className="text-gray-600">Deep analytics with AI insights coming soon</p>
            </div>
          )}
          {builderMode === 'ai-optimizer' && (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">AI Optimization Engine</h3>
              <p className="text-gray-600">Automatic funnel optimization with machine learning</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SuperiorFunnelBuilder;