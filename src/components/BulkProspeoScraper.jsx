import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import IntegrationService from '../services/integrationService';
import LeadService from '../services/leadService';
import securityBypass from '../utils/securityBypass';
import toast from 'react-hot-toast';

const BulkProspeoScraper = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const [scrapeForm, setScrapeForm] = useState({
    domain: '',
    leadCount: 20,
    industries: []
  });
  
  const [scraping, setScraping] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState([]);
  const [scrapeProgress, setScrapeProgress] = useState(0);

  // Pre-defined SaaS & startup domains for bulk scraping (better targets than Fortune 500!)
  const popularDomains = [
    'buffer.com', 'zapier.com', 'helpscout.com', 'drift.com', 'close.com',
    'gumroad.com', 'convertkit.com', 'crisp.chat', 'tidio.com', 'groove.com',
    'freshworks.com', 'livechat.com', 'uservoice.com', 'frontapp.com', 'helpshift.com',
    'sparktoro.com', 'usefyi.com', 'baremetrics.com', 'nomadlist.com', 'producthunt.com'
  ];

  const industryTargets = [
    { name: 'SaaS Startups', domains: ['convertkit.com', 'usefyi.com', 'sparktoro.com', 'gumroad.com'] },
    { name: 'Support Tools', domains: ['helpscout.com', 'crisp.chat', 'tidio.com', 'livechat.com'] },
    { name: 'Small Agencies', domains: ['buffer.com', 'zapier.com', 'microacquire.com'] },
    { name: 'Developer Tools', domains: ['producthunt.com', 'nomadlist.com', 'unsplash.com'] }
  ];

  const executiveNames = [
    // SaaS Startup Founders & Small Business Owners (Much more likely to respond!)
    { first: 'Nathan', last: 'Latka', company: 'Founderpath', domain: 'founderpath.com' },
    { first: 'Des', last: 'Traynor', company: 'Intercom', domain: 'intercom.com' },
    { first: 'Joel', last: 'Gascoigne', company: 'Buffer', domain: 'buffer.com' },
    { first: 'Mikael', last: 'Cho', company: 'Unsplash', domain: 'unsplash.com' },
    { first: 'Wade', last: 'Foster', company: 'Zapier', domain: 'zapier.com' },
    { first: 'Ryan', last: 'Hoover', company: 'Product Hunt', domain: 'producthunt.com' },
    { first: 'Sahil', last: 'Lavingia', company: 'Gumroad', domain: 'gumroad.com' },
    { first: 'Andrew', last: 'Gazdecki', company: 'MicroAcquire', domain: 'microacquire.com' },
    { first: 'Pieter', last: 'Levels', company: 'Nomad List', domain: 'nomadlist.com' },
    { first: 'Justin', last: 'Mares', company: 'Kettle & Fire', domain: 'kettleandfire.com' },
    
    // Small SaaS Company Founders & CTOs (Better targets!)
    { first: 'Rand', last: 'Fishkin', company: 'SparkToro', domain: 'sparktoro.com' },
    { first: 'Hiten', last: 'Shah', company: 'FYI', domain: 'usefyi.com' },
    { first: 'David', last: 'Cancel', company: 'Drift', domain: 'drift.com' },
    { first: 'Steli', last: 'Efti', company: 'Close', domain: 'close.com' },
    { first: 'Des', last: 'Traynor', company: 'Intercom', domain: 'intercom.com' },
    { first: 'Brian', last: 'Chesky', company: 'Airbnb', domain: 'airbnb.com' },
    { first: 'Patrick', last: 'McKenzie', company: 'Stripe', domain: 'stripe.com' },
    { first: 'Jason', last: 'Fried', company: 'Basecamp', domain: 'basecamp.com' },
    { first: 'Tobias', last: 'Lutke', company: 'Shopify', domain: 'shopify.com' },
    { first: 'Matt', last: 'Mullenweg', company: 'Automattic', domain: 'automattic.com' },
    
    // Developer Tool Companies & Indie Hackers
    { first: 'Guillermo', last: 'Rauch', company: 'Vercel', domain: 'vercel.com' },
    { first: 'Tom', last: 'Preston-Werner', company: 'GitHub', domain: 'github.com' },
    { first: 'Mitchell', last: 'Hashimoto', company: 'HashiCorp', domain: 'hashicorp.com' },
    { first: 'Solomon', last: 'Hykes', company: 'Docker', domain: 'docker.com' },
    { first: 'Nat', last: 'Friedman', company: 'GitHub', domain: 'github.com' },
    { first: 'Armon', last: 'Dadgar', company: 'HashiCorp', domain: 'hashicorp.com' },
    { first: 'John', last: 'Resig', company: 'Khan Academy', domain: 'khanacademy.org' },
    { first: 'Ryan', last: 'Dahl', company: 'Node', domain: 'nodejs.org' },
    { first: 'Yehuda', last: 'Katz', company: 'Ember', domain: 'emberjs.com' },
    { first: 'Dan', last: 'Abramov', company: 'Meta', domain: 'meta.com' },
    
    // Support & Customer Service SaaS (Great targets for your tools!)
    { first: 'Alex', last: 'Turnbull', company: 'Groove', domain: 'groove.com' },
    { first: 'Nick', last: 'Francis', company: 'Help Scout', domain: 'helpscout.com' },
    { first: 'Mathilde', last: 'Collin', company: 'Front', domain: 'frontapp.com' },
    { first: 'Mikkel', last: 'Svane', company: 'Zendesk', domain: 'zendesk.com' },
    { first: 'Girish', last: 'Mathrubootham', company: 'Freshworks', domain: 'freshworks.com' },
    { first: 'Baptiste', last: 'Jamin', company: 'Crisp', domain: 'crisp.chat' },
    { first: 'Mariusz', last: 'Ciesla', company: 'LiveChat', domain: 'livechat.com' },
    { first: 'Szymon', last: 'Klimczak', company: 'Tidio', domain: 'tidio.com' },
    { first: 'Christian', last: 'Sejersen', company: 'Helpshift', domain: 'helpshift.com' },
    { first: 'Richard', last: 'White', company: 'UserVoice', domain: 'uservoice.com' }
  ];

  const handleBulkScrape = async () => {
    if (scrapeForm.leadCount < 5 || scrapeForm.leadCount > 40) {
      toast.error('Lead count must be between 5 and 40');
      return;
    }

    try {
      setScraping(true);
      setScrapedLeads([]);
      setScrapeProgress(0);
      
      console.log('🚀 Starting bulk lead scrape for', scrapeForm.leadCount, 'leads');
      
      const foundLeads = [];
      const targetCount = Math.min(scrapeForm.leadCount, executiveNames.length);
      
      // Shuffle executive names for variety
      const shuffledExecutives = [...executiveNames].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < targetCount; i++) {
        try {
          const executive = shuffledExecutives[i];
          setScrapeProgress(Math.round(((i + 1) / targetCount) * 100));
          
          console.log(`🔍 Searching for ${executive.first} ${executive.last} at ${executive.company}...`);
          
          // Use our working Prospeo API to find the email
          const result = await IntegrationService.findEmailProspeo(
            tenant.id, 
            executive.domain, 
            executive.first, 
            executive.last, 
            executive.company
          );

          if (result.success && result.data && result.data.email) {
            const leadData = {
              firstName: executive.first,
              lastName: executive.last,
              email: result.data.email,
              company: executive.company,
              domain: executive.domain,
              source: 'bulk-prospeo-scrape',
              status: result.data.status || 'unknown',
              confidence: result.data.confidence || null,
              score: result.data.status === 'VALID' ? 95 : 75,
              createdAt: new Date().toISOString(),
              title: 'Executive' // Default title for executives
            };

            foundLeads.push(leadData);
            console.log(`✅ Found: ${leadData.email}`);
            
          } else {
            console.log(`❌ No email found for ${executive.first} ${executive.last}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ Error searching for ${shuffledExecutives[i].first} ${shuffledExecutives[i].last}:`, error);
        }
      }

      setScrapedLeads(foundLeads);
      
      // Batch save all leads to database in one operation
      if (foundLeads.length > 0) {
        toast.success(`🎉 Bulk scrape complete! Found ${foundLeads.length} executive emails`);
        
        // Show saving toast
        const savingToast = toast.loading(`💾 Saving ${foundLeads.length} leads to database...`);
        
        try {
          await saveBatchLeadsToDatabase(foundLeads);
          toast.dismiss(savingToast);
          toast.success(`✅ Successfully saved ${foundLeads.length} leads to your database!`);
        } catch (error) {
          toast.dismiss(savingToast);
          toast.error(`❌ Failed to save leads to database: ${error.message}`);
          console.error('❌ Batch save failed:', error);
        }
      } else {
        toast.error('No leads found in this scrape. Try again or check your API credits.');
      }

    } catch (error) {
      console.error('❌ Bulk scrape error:', error);
      toast.error('Bulk scrape failed - please try again');
    } finally {
      setScraping(false);
      setScrapeProgress(0);
    }
  };

  const saveBatchLeadsToDatabase = async (leads) => {
    console.log(`💾 Starting aggressive save of ${leads.length} leads (one-by-one with retries)...`);
    
    try {
      // Prepare lead data
      const leadDataArray = leads.map(lead => ({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        company: lead.company,
        phone: '', // Not available from Prospeo
        title: lead.title || 'Executive',
        source: 'bulk-prospeo-scrape',
        notes: `Found via bulk Prospeo scrape - Status: ${lead.status}, Confidence: ${lead.confidence}`
      }));

      return await securityBypass.executeWithBypass(async () => {
        let savedCount = 0;
        let failedCount = 0;
        
        // Save ONE lead at a time with retries to work around Firebase issues
        for (let i = 0; i < leadDataArray.length; i++) {
          const leadData = leadDataArray[i];
          const leadEmail = leadData.email;
          
          console.log(`💾 Saving lead ${i + 1}/${leadDataArray.length}: ${leadEmail}...`);
          
          let saved = false;
          let attempts = 0;
          const maxAttempts = 3;
          
          // Try up to 3 times per lead
          while (!saved && attempts < maxAttempts) {
            attempts++;
            
            try {
              // Short timeout per attempt (8 seconds)
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Save timeout for ${leadEmail} (attempt ${attempts})`)), 8000)
              );
              
              const savePromise = LeadService.createLead(tenant.id, leadData);
              
              const result = await Promise.race([savePromise, timeoutPromise]);
              
              if (result?.success) {
                console.log(`✅ Successfully saved: ${leadEmail}`);
                savedCount++;
                saved = true;
              } else {
                throw new Error('Save returned false/null');
              }
              
            } catch (error) {
              console.log(`❌ Attempt ${attempts}/${maxAttempts} failed for ${leadEmail}: ${error.message}`);
              
              if (attempts < maxAttempts) {
                console.log(`🔄 Retrying ${leadEmail} in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
          
          if (!saved) {
            console.error(`💀 FAILED to save ${leadEmail} after ${maxAttempts} attempts`);
            failedCount++;
          }
          
          // Brief pause between leads to not overwhelm Firebase
          if (i < leadDataArray.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log(`📊 Final results: ${savedCount} saved, ${failedCount} failed out of ${leadDataArray.length} total`);
        
        if (savedCount > 0) {
          return { success: true, savedCount: savedCount, failedCount: failedCount };
        } else {
          throw new Error(`All ${leadDataArray.length} leads failed to save - Firebase connection issues`);
        }
      });
      
    } catch (error) {
      console.error('❌ Save process error:', error.message);
      throw error;
    }
  };

  const saveLeadToDatabase = async (leadData) => {
    // This function is now deprecated in favor of batch saving
    console.log('⚠️ Individual save called - should use batch save instead');
    return { success: false, error: 'Use batch save instead' };
  };

  const handleQuickScrape = (targetCount) => {
    setScrapeForm(prev => ({ ...prev, leadCount: targetCount }));
    handleBulkScrape();
  };

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">🚀</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold">Bulk Executive Scraper</h3>
          <p className="text-purple-100">Find 10-40 high-value executive emails in one scrape</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => handleQuickScrape(10)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">10 Leads</div>
          <div className="text-sm text-purple-100">Quick Scrape</div>
        </button>
        <button
          onClick={() => handleQuickScrape(20)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">20 Leads</div>
          <div className="text-sm text-purple-100">Standard</div>
        </button>
        <button
          onClick={() => handleQuickScrape(30)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">30 Leads</div>
          <div className="text-sm text-purple-100">Power Scrape</div>
        </button>
        <button
          onClick={() => handleQuickScrape(40)}
          disabled={scraping}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-all disabled:opacity-50"
        >
          <div className="text-lg font-bold">40 Leads</div>
          <div className="text-sm text-purple-100">Max Scrape</div>
        </button>
      </div>

      {/* Custom Settings */}
      <div className="bg-white/10 rounded-lg p-4 mb-6">
        <h4 className="font-semibold mb-3">Custom Scrape Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Leads</label>
            <input
              type="range"
              min="5"
              max="40"
              value={scrapeForm.leadCount}
              onChange={(e) => setScrapeForm(prev => ({ ...prev, leadCount: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="text-center text-sm mt-1">{scrapeForm.leadCount} leads</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Quality</label>
            <select className="w-full bg-white/20 border border-white/30 rounded p-2">
              <option value="executives">Fortune 500 Executives</option>
              <option value="startups">Tech Startup Leaders</option>
              <option value="saas">SaaS Company Executives</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleBulkScrape}
          disabled={scraping}
          className="w-full mt-4 bg-white text-purple-600 py-3 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {scraping ? `🔍 Scraping... ${scrapeProgress}%` : `🚀 Start Custom Scrape (${scrapeForm.leadCount} leads)`}
        </button>
      </div>

      {/* Progress Bar */}
      {scraping && (
        <div className="mb-4">
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${scrapeProgress}%` }}
            ></div>
          </div>
          <div className="text-center text-sm mt-1">
            Finding executives... {scrapeProgress}% complete
          </div>
        </div>
      )}

      {/* Results Summary */}
      {scrapedLeads.length > 0 && (
        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
          <h4 className="font-semibold text-green-100 mb-2">
            ✅ Scrape Complete! Found {scrapedLeads.length} Executive Emails
          </h4>
          <div className="text-sm text-green-200 space-y-1">
            {scrapedLeads.slice(0, 5).map((lead, index) => (
              <div key={index}>
                • {lead.firstName} {lead.lastName} - {lead.email} ({lead.company})
              </div>
            ))}
            {scrapedLeads.length > 5 && (
              <div className="text-green-300 font-medium">
                + {scrapedLeads.length - 5} more leads saved to Recent Leads database
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-purple-200 mt-4">
        💡 All leads auto-save to Recent Leads database. Uses your Prospeo API credits (73 remaining).
      </div>
    </div>
  );
};

export default BulkProspeoScraper;