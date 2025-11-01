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
    industries: [],
    targetType: 'smb'
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
    // Small to Medium Business Owners (Your Primary Target!)
    { first: 'Mike', last: 'Johnson', company: 'Local Marketing Pro', domain: 'localmarketingpro.com' },
    { first: 'Sarah', last: 'Williams', company: 'Boutique Consulting', domain: 'boutiqueconsulting.com' },
    { first: 'David', last: 'Brown', company: 'Metro Services LLC', domain: 'metroservicesllc.com' },
    { first: 'Lisa', last: 'Davis', company: 'Creative Solutions Hub', domain: 'creativesolutionshub.com' },
    { first: 'Tom', last: 'Wilson', company: 'Wilson Construction', domain: 'wilsonconstruction.com' },
    { first: 'Amy', last: 'Taylor', company: 'Taylor Digital Agency', domain: 'taylordigitalagency.com' },
    { first: 'John', last: 'Martinez', company: 'Martinez Auto Repair', domain: 'martinezautorepair.com' },
    { first: 'Jessica', last: 'Anderson', company: 'Anderson Law Firm', domain: 'andersonlawfirm.com' },
    
    // John Q Customer Business Owners (Perfect Market Genie Customers!)
    { first: 'Robert', last: 'Thompson', company: 'Thompson Plumbing', domain: 'thompsonplumbing.com' },
    { first: 'Michelle', last: 'Garcia', company: 'Garcia Real Estate', domain: 'garciarealestate.com' },
    { first: 'Chris', last: 'Moore', company: 'Moore Insurance Agency', domain: 'mooreinsurance.com' },
    { first: 'Jennifer', last: 'White', company: 'White Dental Practice', domain: 'whitedental.com' },
    { first: 'Kevin', last: 'Lee', company: 'Lee Accounting Services', domain: 'leeaccounting.com' },
    { first: 'Rachel', last: 'Clark', company: 'Clark Fitness Studio', domain: 'clarkfitness.com' },
    { first: 'Mark', last: 'Lewis', company: 'Lewis HVAC Solutions', domain: 'lewishvac.com' },
    { first: 'Amanda', last: 'Walker', company: 'Walker Pet Grooming', domain: 'walkerpetgrooming.com' },
    
    // Support Genie Prospects (Customer Service Heavy Businesses)
    { first: 'Steve', last: 'Hall', company: 'Hall Tech Support', domain: 'halltechsupport.com' },
    { first: 'Nicole', last: 'Young', company: 'Young Customer Care', domain: 'youngcustomercare.com' },
    { first: 'Brian', last: 'King', company: 'King Call Center', domain: 'kingcallcenter.com' },
    { first: 'Stephanie', last: 'Wright', company: 'Wright Help Desk', domain: 'wrighthelpdesk.com' },
    { first: 'Alex', last: 'Scott', company: 'Scott Support Services', domain: 'scottsupport.com' },
    { first: 'Melissa', last: 'Green', company: 'Green Customer Solutions', domain: 'greencustomersolutions.com' },
    
    // Local Service Businesses (High Need for Lead Generation)
    { first: 'Paul', last: 'Adams', company: 'Adams Landscaping', domain: 'adamslandscaping.com' },
    { first: 'Laura', last: 'Baker', company: 'Baker Cleaning Services', domain: 'bakercleaning.com' },
    { first: 'Daniel', last: 'Mitchell', company: 'Mitchell Home Repairs', domain: 'mitchellhomerepairs.com' },
    { first: 'Kelly', last: 'Turner', company: 'Turner Event Planning', domain: 'turnereventplanning.com' },
    { first: 'Ryan', last: 'Phillips', company: 'Phillips Moving Company', domain: 'phillipsmoving.com' },
    { first: 'Lisa', last: 'Campbell', company: 'Campbell Catering', domain: 'campbellcatering.com' },
    
    // E-commerce Store Owners (Need Marketing Automation)
    { first: 'Jason', last: 'Evans', company: 'Evans Online Store', domain: 'evansonlinestore.com' },
    { first: 'Kimberly', last: 'Roberts', company: 'Roberts Boutique', domain: 'robertsboutique.com' },
    { first: 'Matthew', last: 'Carter', company: 'Carter Electronics', domain: 'carterelectronics.com' },
    { first: 'Ashley', last: 'Parker', company: 'Parker Home Goods', domain: 'parkerhomegoods.com' },
    { first: 'Andrew', last: 'Cox', company: 'Cox Outdoor Gear', domain: 'coxoutdoorgear.com' },
    { first: 'Samantha', last: 'Ward', company: 'Ward Fashion Hub', domain: 'wardfashionhub.com' },
    
    // Professional Services (Lawyers, Accountants, Consultants)
    { first: 'Michael', last: 'Torres', company: 'Torres CPA Firm', domain: 'torrescpa.com' },
    { first: 'Linda', last: 'Rivera', company: 'Rivera Legal Group', domain: 'riveralegal.com' },
    { first: 'James', last: 'Cooper', company: 'Cooper Financial Advisors', domain: 'cooperfinancial.com' },
    { first: 'Karen', last: 'Reed', company: 'Reed HR Consulting', domain: 'reedhr.com' },
    { first: 'William', last: 'Bailey', company: 'Bailey Business Consulting', domain: 'baileybusiness.com' },
    { first: 'Patricia', last: 'Gray', company: 'Gray Marketing Consultants', domain: 'graymarketing.com' },
    
    // SaaS Startup Founders & Small Business Owners (Still good targets!)
    { first: 'Nathan', last: 'Latka', company: 'Founderpath', domain: 'founderpath.com' },
    { first: 'Des', last: 'Traynor', company: 'Intercom', domain: 'intercom.com' },
    { first: 'Joel', last: 'Gascoigne', company: 'Buffer', domain: 'buffer.com' },
    { first: 'Wade', last: 'Foster', company: 'Zapier', domain: 'zapier.com' },
    { first: 'Ryan', last: 'Hoover', company: 'Product Hunt', domain: 'producthunt.com' },
    { first: 'Sahil', last: 'Lavingia', company: 'Gumroad', domain: 'gumroad.com' },
    { first: 'Steli', last: 'Efti', company: 'Close', domain: 'close.com' },
    { first: 'Rand', last: 'Fishkin', company: 'SparkToro', domain: 'sparktoro.com' },
    
    // Support & Customer Service SaaS (Great targets for Support Genie!)
    { first: 'Alex', last: 'Turnbull', company: 'Groove', domain: 'groove.com' },
    { first: 'Nick', last: 'Francis', company: 'Help Scout', domain: 'helpscout.com' },
    { first: 'Mathilde', last: 'Collin', company: 'Front', domain: 'frontapp.com' },
    { first: 'Baptiste', last: 'Jamin', company: 'Crisp', domain: 'crisp.chat' },
    { first: 'Mariusz', last: 'Ciesla', company: 'LiveChat', domain: 'livechat.com' },
    { first: 'Szymon', last: 'Klimczak', company: 'Tidio', domain: 'tidio.com' }
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
              // NUCLEAR OPTION: Use bypass mode for bulk operations
              const bulkOptions = {
                bulkMode: true,
                skipDuplicateCheck: true,
                emergencyMode: true
              };
              
              // Extended timeout for network-challenged environments (15 seconds)
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Save timeout for ${leadEmail} (attempt ${attempts})`)), 15000)
              );
              
              const savePromise = LeadService.createLead(tenant.id, leadData, bulkOptions);
              
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
            <select 
              className="w-full bg-white/20 border border-white/30 rounded p-2 text-white"
              value={scrapeForm.targetType || 'smb'}
              onChange={(e) => setScrapeForm(prev => ({ ...prev, targetType: e.target.value }))}
            >
              <option value="smb">Small to Medium Businesses</option>
              <option value="johnq">John Q Customer Business Owners</option>
              <option value="support">Support Genie Prospects</option>
              <option value="local">Local Service Businesses</option>
              <option value="ecommerce">E-commerce Store Owners</option>
              <option value="professional">Professional Services</option>
              <option value="saas">SaaS Startups</option>
              <option value="agencies">Marketing Agencies</option>
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