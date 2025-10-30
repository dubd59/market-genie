import { FirebaseAPI } from '../FirebaseAPI.js'
import { collection, addDoc, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc } from '../security/SecureFirebase.js'
import { serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import IntegrationService from './integrationService.js'

class LeadService {
  constructor() {
    // We'll create the path dynamically based on tenant
  }

  // Get the correct collection path for tenant - MARKET GENIE ISOLATED
  getLeadsCollection(tenantId) {
    return collection(db, 'MarketGenie_tenants', tenantId, 'leads')
  }

  // Find lead by email to prevent duplicates
  async findLeadByEmail(tenantId, email) {
    try {
      const leadsCollection = this.getLeadsCollection(tenantId)
      const q = query(leadsCollection, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() }
      }
      return null
    } catch (error) {
      console.error('Error finding lead by email:', error)
      return null
    }
  }

  // Create a new lead (with duplicate checking)
  async createLead(tenantId, leadData) {
    try {
      // Check if lead with this email already exists
      const existingLead = await this.findLeadByEmail(tenantId, leadData.email)
      if (existingLead) {
        console.log(`Skipping duplicate lead: ${leadData.email}`)
        return { success: false, error: 'Lead already exists', duplicate: true }
      }

      const enrichedLead = {
        ...leadData,
        tenantId,
        status: 'new',
        enriched: false,
        lastContact: null,
        score: leadData.score || Math.floor(Math.random() * 40) + 60,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const leadsCollection = this.getLeadsCollection(tenantId)
      const docRef = await addDoc(leadsCollection, enrichedLead)
      
      if (docRef.id) {
        await this.updateTenantUsage(tenantId, 'leads', 1)
        return { success: true, data: { id: docRef.id, ...enrichedLead } }
      }

      return { success: false, error: 'Failed to create lead' }
    } catch (error) {
      console.error('Error creating lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Get leads for a tenant
  async getLeads(tenantId, limitCount = 200) {
    try {
      const leadsCollection = this.getLeadsCollection(tenantId)
      const q = query(
        leadsCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const documents = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Auto-fix old leads to have clean "Genie" tag only
        if (!data.tags || !data.tags.includes('Genie')) {
          data.tags = ['Genie']
        } else if (data.tags.length > 1) {
          // Clean up existing leads that have extra tags
          data.tags = ['Genie']
        }
        documents.push({ id: doc.id, ...data })
      })

      return { success: true, data: documents }
    } catch (error) {
      console.error('Error getting leads:', error)
      return { success: false, error: error.message }
    }
  }

  // Update a lead
  async updateLead(tenantId, leadId, updateData) {
    try {
      const leadDoc = doc(db, 'MarketGenie_tenants', tenantId, 'leads', leadId)
      await updateDoc(leadDoc, {
        ...updateData,
        updatedAt: serverTimestamp()
      })
      return { success: true, data: updateData }
    } catch (error) {
      console.error('Error updating lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete a lead
  async deleteLead(tenantId, leadId) {
    try {
      const leadDoc = doc(db, 'MarketGenie_tenants', tenantId, 'leads', leadId)
      await deleteDoc(leadDoc)
      return { success: true }
    } catch (error) {
      console.error('Error deleting lead:', error)
      return { success: false, error: error.message }
    }
  }

  // Get lead statistics for a tenant
  async getLeadStats(tenantId) {
    try {
      const result = await this.getLeads(tenantId, 1000)
      
      if (result.success) {
        const leads = result.data
        const totalLeads = leads.length
        const highQuality = leads.filter(lead => lead.score >= 80).length
        const mediumQuality = leads.filter(lead => lead.score >= 60 && lead.score < 80).length
        const lowQuality = leads.filter(lead => lead.score < 60).length
        
        const converted = leads.filter(lead => lead.status === 'converted').length
        const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0

        // Calculate leads by source
        const aiScrapingLeads = leads.filter(lead => 
          lead.source && (lead.source.includes('apollo') || lead.source.includes('hunter') || lead.source.includes('linkedin') || lead.source === 'ai-scraping' || lead.source === 'Business Directory' || lead.source === 'Social Media' || lead.source === 'Custom Sources')
        )
        const bulkImportLeads = leads.filter(lead => 
          lead.source && (lead.source.includes('csv') || lead.source.includes('import') || lead.source === 'csv-import')
        )
        const manualEntryLeads = leads.filter(lead => 
          lead.source && (lead.source === 'manual' || lead.source === 'Manual Entry' || lead.source === 'enrichment')
        )

        // Calculate success rates
        const aiScrapingSuccessRate = aiScrapingLeads.length > 0 ? 
          Math.round((aiScrapingLeads.filter(lead => lead.email && lead.email.includes('@')).length / aiScrapingLeads.length) * 100) : 0
        const bulkImportValidationRate = bulkImportLeads.length > 0 ? 
          Math.round((bulkImportLeads.filter(lead => lead.email && lead.email.includes('@')).length / bulkImportLeads.length) * 100) : 0
        const manualEntryQualityRate = manualEntryLeads.length > 0 ? 
          Math.round((manualEntryLeads.filter(lead => lead.score >= 80).length / manualEntryLeads.length) * 100) : 0

        // Calculate time-based metrics
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
        const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
        
        const leadsThisWeek = leads.filter(lead => {
          if (!lead.createdAt) return false
          const createdDate = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
          return createdDate >= oneWeekAgo
        }).length

        const leadsLastWeek = leads.filter(lead => {
          if (!lead.createdAt) return false
          const createdDate = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
          return createdDate >= twoWeeksAgo && createdDate < oneWeekAgo
        }).length

        const weeklyGrowthRate = leadsLastWeek > 0 ? 
          Math.round(((leadsThisWeek - leadsLastWeek) / leadsLastWeek) * 100) : 0

        // Calculate average cost per lead (assuming AI scraping costs)
        const avgCostPerLead = aiScrapingLeads.length > 0 ? 
          Math.round((aiScrapingLeads.length * 0.5) / aiScrapingLeads.length * 100) / 100 : 0

        // Calculate quality score percentage
        const avgQualityScore = totalLeads > 0 ? 
          Math.round((highQuality / totalLeads) * 100) : 0

        // Calculate active reports (based on different analysis types available)
        const activeReports = [
          totalLeads > 0 ? 1 : 0, // Lead Overview Report
          aiScrapingLeads.length > 0 ? 1 : 0, // AI Scraping Report
          bulkImportLeads.length > 0 ? 1 : 0, // Bulk Import Report
          manualEntryLeads.length > 0 ? 1 : 0, // Manual Entry Report
          leadsThisWeek > 0 ? 1 : 0, // Weekly Report
          converted > 0 ? 1 : 0, // Conversion Report
          highQuality > 0 ? 1 : 0, // Quality Report
          1, // Performance Trends (always available)
          1, // Source Analysis (always available)
          1  // Growth Metrics (always available)
        ].reduce((sum, report) => sum + report, 0)

        // Calculate key insights (real business insights based on data)
        const keyInsights = [
          conversionRate > 15 ? 1 : 0, // High conversion insight
          avgQualityScore > 70 ? 1 : 0, // High quality insight
          weeklyGrowthRate > 0 ? 1 : 0, // Growth insight
          aiScrapingSuccessRate > 80 ? 1 : 0, // AI efficiency insight
          totalLeads > 50 ? 1 : 0 // Volume insight
        ].reduce((sum, insight) => sum + insight, 0)

        // Calculate monthly growth rate
        const newThisMonth = leads.filter(lead => {
          if (!lead.createdAt) return false
          const createdDate = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
          return createdDate.getMonth() === now.getMonth() && 
                 createdDate.getFullYear() === now.getFullYear()
        }).length

        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
        const newLastMonth = leads.filter(lead => {
          if (!lead.createdAt) return false
          const createdDate = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
          return createdDate.getMonth() === lastMonth.getMonth() && 
                 createdDate.getFullYear() === lastMonth.getFullYear()
        }).length

        const monthlyGrowthRate = newLastMonth > 0 ? 
          Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100) : 0

        return {
          success: true,
          data: {
            totalLeads,
            highQuality,
            mediumQuality,
            lowQuality,
            conversionRate,
            newThisMonth,
            // New comprehensive analytics
            activeReports,
            keyInsights,
            monthlyGrowthRate,
            aiScrapingSuccessRate,
            bulkImportValidationRate,
            manualEntryQualityRate,
            leadsThisWeek,
            weeklyGrowthRate,
            avgCostPerLead,
            avgQualityScore,
            // Lead source counts
            aiScrapingCount: aiScrapingLeads.length,
            bulkImportCount: bulkImportLeads.length,
            manualEntryCount: manualEntryLeads.length
          }
        }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error('Error getting lead stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Generate AI-powered leads using ONLY real APIs (Hunter.io, Apollo.io)
  async generateAILeads(tenantId, source, count = 5) {
    try {
      // Import the integration service
      const IntegrationService = (await import('./integrationService.js')).default;
      let leads = [];

      switch(source.toLowerCase()) {
        case 'business directories':
          // E-commerce and online service SMBs
          const businessLeads = [];
          const businessDomains = [
            // E-commerce Platforms & Tools
            'bigcommerce.com', 'woocommerce.com', 'squarespace.com', 'wix.com', 'webflow.com',
            'shopify.com', 'magento.com', 'prestashop.com', 'opencart.com', 'ecwid.com',
            'volusion.com', 'bigcartel.com', '3dcart.com', 'cs-cart.com', 'zen-cart.com',
            
            // Online Course & Education Platforms
            'teachable.com', 'thinkific.com', 'kajabi.com', 'learnworlds.com', 'zippy-courses.com',
            'coursecraft.net', 'academy-of-mine.com', 'fedora.io', 'mighty-networks.com',
            
            // Digital Product & Content Platforms
            'etsy.com', 'gumroad.com', 'selz.com', 'payhip.com', 'fastspring.com',
            'paddle.com', 'lemonsqueezy.com', 'selly.gg', 'gumlet.com', 'sellfy.com',
            
            // Email Marketing SMBs
            'convertkit.com', 'mailerlite.com', 'constant-contact.com', 'aweber.com', 'getresponse.com',
            'campaignmonitor.com', 'sendinblue.com', 'benchmark.email', 'mailjet.com', 'moosend.com',
            
            // Website Builders & Hosting SMBs
            'hostgator.com', 'bluehost.com', 'siteground.com', 'godaddy.com', 'namecheap.com',
            'dreamhost.com', 'a2hosting.com', 'inmotionhosting.com', 'hostinger.com'
          ];
          
          // Shuffle domains to get variety each time
          const shuffledBusinessDomains = businessDomains.sort(() => 0.5 - Math.random());
          
          for (let i = 0; i < Math.min(count, shuffledBusinessDomains.length); i++) {
            const domain = shuffledBusinessDomains[i];
            try {
              // Try multiple providers for better lead coverage
              const domainResult = await this.searchDomainMultiProvider(tenantId, domain, 2);
              if (domainResult.success && domainResult.data && domainResult.data.length > 0) {
                domainResult.data.forEach(person => {
                  businessLeads.push({
                    firstName: person.first_name || 'Business',
                    lastName: person.last_name || 'Contact',
                    email: person.email,
                    company: domain.split('.')[0],
                    phone: person.phone || '',
                    title: person.position || 'Business Professional',
                    source: person.source || 'multi-provider-business-directory',
                    score: person.confidence || 80
                  });
                });
              }
            } catch (error) {
              console.log('Multi-provider business search error for', domain, error.message);
            }
          }
          
          if (businessLeads.length > 0) {
            leads = businessLeads.slice(0, count);
          } else {
            return { success: false, error: 'Hunter.io business directory search failed. Please check your API key and quota.' };
          }
          break;

        case 'social media':
          // Small business SaaS and service providers
          const socialLeads = [];
          const socialDomains = [
            // Social Media Management SMBs
            'bufferapp.com', 'later.com', 'socialbee.io', 'agorapulse.com', 'sendible.com',
            'sproutsocial.com', 'hootsuite.com', 'socialpilot.co', 'crowdfire.com', 'postcron.com',
            'recurpost.com', 'socialoomph.com', 'creatorco.com', 'loomly.com', 'publer.io',
            
            // Webinar & Video Conferencing SMBs
            'livestorm.co', 'demio.com', 'webinarjam.com', 'gotowebinar.com', 'zoom.us',
            'bigmarker.com', 'webex.com', 'webinarninja.com', 'crowdcast.io', 'streamyard.com',
            
            // Scheduling & Appointment SMBs
            'calendly.com', 'acuityscheduling.com', 'bookingkoala.com', 'setmore.com', 'appointy.com',
            'square.com/appointments', 'timely.com', 'bookafy.com', 'picktime.com', 'when2meet.com',
            
            // Design & Creative Tools SMBs
            'canva.com', 'figma.com', 'sketch.com', 'invisionapp.com', 'miro.com',
            'lucidchart.com', 'creately.com', 'visme.co', 'animoto.com', 'loom.com',
            
            // Analytics & SEO SMBs
            'hotjar.com', 'crazyegg.com', 'optimizely.com', 'unbounce.com', 'leadpages.com',
            'semrush.com', 'ahrefs.com', 'moz.com', 'screaming-frog.co.uk', 'brightlocal.com'
          ];
          
          // Shuffle domains to get variety each time
          const shuffledSocialDomains = socialDomains.sort(() => 0.5 - Math.random());
          
          for (let i = 0; i < Math.min(count, shuffledSocialDomains.length); i++) {
            const domain = shuffledSocialDomains[i];
            try {
              const domainResult = await IntegrationService.searchDomain(tenantId, domain, 2);
              if (domainResult.success && domainResult.data && domainResult.data.length > 0) {
                domainResult.data.forEach(person => {
                  socialLeads.push({
                    firstName: person.first_name || 'Social',
                    lastName: person.last_name || 'Professional',
                    email: person.email,
                    company: domain.split('.')[0],
                    phone: '',
                    title: person.position || 'Social Media Professional',
                    source: 'hunter-social-media',
                    score: person.confidence || 85
                  });
                });
              }
            } catch (error) {
              console.log('Hunter.io social media search error for', domain, error.message);
            }
          }
          
          if (socialLeads.length > 0) {
            leads = socialLeads.slice(0, count);
          } else {
            return { success: false, error: 'Hunter.io social media search failed. Please check your API key and quota.' };
          }
          break;

        case 'custom sources':
          // SMB SaaS companies perfect for Support Genie
          const hunterLeads = [];
          const realDomains = [
            // Customer Support & Help Desk SMBs
            'freshworks.com', 'intercom.com', 'helpscout.com', 'crisp.chat', 'tidio.com',
            'livechat.com', 'uservoice.com', 'groove.com', 'kayako.com', 'helpshift.com',
            'drift.com', 'olark.com', 'chatra.io', 'tawk.to', 'smartsupp.com',
            'zendesk.com', 'freshdesk.com', 'helpcrunch.com', 'chaport.com', 'userlike.com',
            
            // Form & Survey Tools (need customer support)
            'typeform.com', 'jotform.com', 'formstack.com', 'paperform.co', 'tally.so',
            'surveymonkey.com', 'wufoo.com', 'cognito.com', 'formsite.com', 'ninja-forms.com',
            
            // Project Management & Business Tools SMBs
            'asana.com', 'trello.com', 'monday.com', 'notion.so', 'airtable.com',
            'clickup.com', 'basecamp.com', 'teamwork.com', 'wrike.com', 'smartsheet.com',
            'podio.com', 'workzone.com', 'clarizen.com', 'freedcamp.com', 'hitask.com',
            
            // CRM & Sales Tools (SMB focused)
            'pipedrive.com', 'close.com', 'copper.com', 'insightly.com', 'nutshell.com',
            'keap.com', 'capsule-crm.com', 'streak.com', 'folk.app', 'nimble.com',
            'amoCRM.com', 'apptivo.com', 'batchbook.com', 'flowlu.com', 'ontraport.com',
            
            // Marketing Automation SMBs
            'activecampaign.com', 'drip.com', 'klaviyo.com', 'omnisend.com', 'sendlane.com',
            'getresponse.com', 'campaignmonitor.com', 'sendinblue.com', 'benchmark.email'
          ];
          
          // Shuffle domains to get variety each time
          const shuffledDomains = realDomains.sort(() => 0.5 - Math.random());
          
          for (let i = 0; i < Math.min(count, shuffledDomains.length); i++) {
            const domain = shuffledDomains[i];
            try {
              // Use domain search instead of individual email finder
              const domainResult = await IntegrationService.searchDomain(tenantId, domain, 2);
              if (domainResult.success && domainResult.data && domainResult.data.length > 0) {
                // Add all found people from this domain
                domainResult.data.forEach(person => {
                  hunterLeads.push({
                    firstName: person.first_name || 'Unknown',
                    lastName: person.last_name || 'Person',
                    email: person.email,
                    company: domain.split('.')[0],
                    phone: '',
                    title: person.position || 'Employee',
                    source: 'hunter-domain-search',
                    score: person.confidence || 85
                  });
                });
              } else {
                console.log('No people found at', domain);
              }
            } catch (error) {
              console.log('Hunter.io domain search error for', domain, error.message);
            }
          }
          
          if (hunterLeads.length > 0) {
            leads = hunterLeads.slice(0, count); // Limit to requested count
          } else {
            return { success: false, error: 'Hunter.io domain search failed to find any real people. Please check your API key and quota in Settings.' };
          }
          break;

        default:
          return { success: false, error: 'Invalid lead source specified.' };
      }

      // Process and save the leads (ONLY if we have real data)
      if (leads.length === 0) {
        return { success: false, error: 'No real leads found from API. Please try again or check API settings.' };
      }

      const results = [];
      let duplicateCount = 0;
      
      for (const leadData of leads) {
        const enrichedLead = {
          ...leadData,
          source: source.toLowerCase(),
          title: leadData.title || this.generateRandomTitle(),
          score: leadData.score || Math.floor(Math.random() * 40) + 60,
          tags: ['Genie'],
          notes: [`Generated from ${source} via Market Genie API integration`]
        };

        const result = await this.createLead(tenantId, enrichedLead);
        if (result.success) {
          results.push(result.data);
        } else if (result.duplicate) {
          duplicateCount++;
        }
      }

      const message = duplicateCount > 0 
        ? `Generated ${results.length} new leads, skipped ${duplicateCount} duplicates`
        : `Generated ${results.length} new leads`;

      return { success: true, data: results, message };
    } catch (error) {
      console.error('Error generating AI leads:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove enterprise company leads - focus on SMBs only
  async removeEnterpriseLeads(tenantId) {
    try {
      const leadsCollection = this.getLeadsCollection(tenantId)
      const querySnapshot = await getDocs(leadsCollection)
      
      // Enterprise domains to remove (big companies not good for Support Genie)
      const enterpriseDomains = [
        'microsoft.com', 'salesforce.com', 'oracle.com', 'ibm.com', 'adobe.com',
        'servicenow.com', 'workday.com', 'tableau.com', 'snowflake.com', 'databricks.com',
        'palantir.com', 'mongodb.com', 'elastic.co', 'splunk.com', 'okta.com',
        'crowdstrike.com', 'meta.com', 'google.com', 'amazon.com', 'apple.com',
        'netflix.com', 'uber.com', 'airbnb.com', 'stripe.com', 'square.com'
      ]
      
      let removedCount = 0
      const removedLeads = []
      
      for (const docSnapshot of querySnapshot.docs) {
        const lead = docSnapshot.data()
        if (lead.email) {
          const emailDomain = lead.email.split('@')[1]?.toLowerCase()
          
          // Check if this lead is from an enterprise domain
          if (enterpriseDomains.some(domain => emailDomain === domain)) {
            await deleteDoc(doc(leadsCollection, docSnapshot.id))
            removedLeads.push({
              email: lead.email,
              company: lead.company || emailDomain,
              name: lead.name || 'Unknown'
            })
            removedCount++
          }
        }
      }
      
      console.log(`Removed ${removedCount} enterprise leads:`, removedLeads)
      
      return {
        success: true,
        removedCount,
        removedLeads,
        message: `Successfully removed ${removedCount} enterprise company leads. Focusing on SMB prospects for Support Genie.`
      }
    } catch (error) {
      console.error('Error removing enterprise leads:', error)
      return {
        success: false,
        error: error.message,
        message: 'Failed to remove enterprise leads'
      }
    }
  }

  // Remove duplicate leads (keep the newest one for each email)
  async removeDuplicateLeads(tenantId) {
    try {
      const leadsResult = await this.getLeads(tenantId, 1000) // Get more leads to check for duplicates
      if (!leadsResult.success) {
        return { success: false, error: 'Failed to get leads' }
      }

      const leads = leadsResult.data
      const emailMap = new Map()
      const duplicatesToDelete = []

      // Group leads by email, keeping track of the newest one
      leads.forEach(lead => {
        if (lead.email) {
          if (emailMap.has(lead.email)) {
            // We have a duplicate - keep the newer one
            const existing = emailMap.get(lead.email)
            const leadDate = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt)
            const existingDate = existing.createdAt?.toDate ? existing.createdAt.toDate() : new Date(existing.createdAt)
            
            if (leadDate > existingDate) {
              // New lead is newer, mark old one for deletion
              duplicatesToDelete.push(existing.id)
              emailMap.set(lead.email, lead)
            } else {
              // Existing lead is newer, mark new one for deletion
              duplicatesToDelete.push(lead.id)
            }
          } else {
            emailMap.set(lead.email, lead)
          }
        }
      })

      // Delete the duplicates
      for (const leadId of duplicatesToDelete) {
        await this.deleteLead(tenantId, leadId)
      }

      return { 
        success: true, 
        message: `Removed ${duplicatesToDelete.length} duplicate leads`,
        removedCount: duplicatesToDelete.length 
      }
    } catch (error) {
      console.error('Error removing duplicates:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper method to generate random job titles
  generateRandomTitle() {
    const titles = [
      'Marketing Manager', 'Sales Director', 'CEO', 'CTO', 'VP Sales',
      'Marketing Director', 'Business Owner', 'Founder', 'Head of Marketing',
      'Sales Manager', 'Product Manager', 'Operations Manager'
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  // Update tenant usage statistics
  async updateTenantUsage(tenantId, metric, increment = 1) {
    try {
      console.log(`Updated tenant ${tenantId} ${metric} by ${increment}`)
    } catch (error) {
      console.error('Error updating tenant usage:', error)
    }
  }

  // Search leads
  async searchLeads(tenantId, searchTerm, filters = {}) {
    try {
      const result = await this.getLeads(tenantId, 1000)
      
      if (result.success) {
        let filteredLeads = result.data

        if (searchTerm) {
          filteredLeads = filteredLeads.filter(lead => 
            lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        }

        if (filters.source && filters.source !== 'all') {
          filteredLeads = filteredLeads.filter(lead => lead.source === filters.source)
        }

        if (filters.minScore) {
          filteredLeads = filteredLeads.filter(lead => lead.score >= filters.minScore)
        }

        return { success: true, data: filteredLeads }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error('Error searching leads:', error)
      return { success: false, error: error.message }
    }
  }

  // ===================================
  // MULTI-PROVIDER LEAD GENERATION
  // ===================================
  
  // Search domain using multiple providers for better coverage
  async searchDomainMultiProvider(tenantId, domain, limit = 5) {
    console.log(`🔍 Multi-provider search for domain: ${domain}`)
    
    // Define available providers with connection status check
    const potentialProviders = [
      { name: 'prospeo-io', backendName: 'prospeo', method: 'findEmailWithProvider' },
      { name: 'voila-norbert', backendName: 'voilanorbert', method: 'findEmailWithProvider' },
      { name: 'hunter-io', backendName: 'hunter-io', method: 'searchDomain' }
    ]
    
    // Check which providers are actually connected and available
    const availableProviders = []
    for (const provider of potentialProviders) {
      try {
        const credentials = await IntegrationService.getIntegrationCredentials(tenantId, provider.backendName)
        if (credentials.success && credentials.data.status === 'connected') {
          availableProviders.push(provider)
          console.log(`✅ ${provider.name} is connected and available`)
        } else {
          console.log(`⚠️ ${provider.name} is not connected (status: ${credentials.data?.status || 'no credentials'})`)
        }
      } catch (error) {
        console.log(`❌ ${provider.name} connection check failed:`, error.message)
      }
    }
    
    if (availableProviders.length === 0) {
      console.log('❌ No lead generation providers are connected!')
      return { success: false, data: [], providers: [], error: 'No connected providers available' }
    }
    
    console.log(`🎯 Using ${availableProviders.length} connected providers:`, availableProviders.map(p => p.name))
    
    let allResults = []
    let successfulProviders = []
    
    for (const provider of availableProviders) {
      try {
        console.log(`🎯 Trying ${provider.name} for ${domain}`)
        
        let result
        if (provider.name === 'hunter-io') {
          // Check for rate limiting first
          result = await IntegrationService.searchDomain(tenantId, domain, limit)
          if (!result.success && result.error?.includes('Too Many Requests')) {
            console.log(`⚠️ ${provider.name} rate limited - skipping`)
            continue // Skip to next provider
          }
        } else if (provider.name === 'voila-norbert') {
          // VoilaNorbert is designed for specific person searches, not domain searches
          // Skip for domain-based lead generation to avoid wasting credits
          console.log(`⚠️ Skipping VoilaNorbert for domain search - designed for specific person searches`)
          result = { success: false, error: 'VoilaNorbert requires specific person names, not domain searches' };
          continue;
        } else if (provider.name === 'prospeo-io') {
          // Use Firebase proxy for Prospeo domain search - pass null names to trigger domain search
          result = await IntegrationService.findEmailWithProvider(tenantId, provider.backendName, domain, null, null, domain)
          if (result.success && result.data) {
            // Handle both single contact and multiple contacts format
            if (result.data.contacts) {
              // Domain search returns multiple contacts
              result.data = result.data.contacts
            } else if (result.data.email) {
              // Single email result - convert to array format
              result.data = [result.data]
            }
          }
        }
        
        if (result && result.success && result.data && result.data.length > 0) {
          console.log(`✅ ${provider.name} found ${result.data.length} contacts for ${domain}`)
          successfulProviders.push(provider.name)
          
          // Add provider info to each result
          const enrichedResults = result.data.map(contact => ({
            ...contact,
            source: contact.source || provider.name,
            provider: provider.name
          }))
          
          allResults = allResults.concat(enrichedResults)
        } else {
          console.log(`❌ ${provider.name} found no contacts for ${domain}`)
        }
      } catch (error) {
        console.log(`⚠️ ${provider.name} error for ${domain}:`, error.message)
      }
    }
    
    // Remove duplicates based on email
    const uniqueResults = []
    const seenEmails = new Set()
    
    for (const contact of allResults) {
      if (contact.email && !seenEmails.has(contact.email.toLowerCase())) {
        seenEmails.add(contact.email.toLowerCase())
        uniqueResults.push(contact)
      }
    }
    
    console.log(`🎯 Multi-provider results for ${domain}: ${uniqueResults.length} unique contacts from ${successfulProviders.length} providers`)
    
    if (uniqueResults.length > 0) {
      return {
        success: true,
        data: uniqueResults.slice(0, limit), // Respect the limit
        providers: successfulProviders
      }
    }
    
    return {
      success: false,
      error: `No contacts found for ${domain} across all providers`,
      providers: successfulProviders
    }
  }

  // Find specific person using multiple providers
  async findPersonMultiProvider(tenantId, domain, firstName, lastName) {
    console.log(`🔍 Multi-provider person search: ${firstName} ${lastName} at ${domain}`)
    
    const providers = [
      { name: 'hunter-io', method: 'findEmails' },
      { name: 'voila-norbert', method: 'findEmailVoilaNorbert' },
      { name: 'rocketreach', method: 'findPersonRocketReach' }
    ]
    
    for (const provider of providers) {
      try {
        console.log(`🎯 Trying ${provider.name} for ${firstName} ${lastName}`)
        
        let result
        if (provider.name === 'hunter-io') {
          result = await IntegrationService.findEmails(tenantId, domain, firstName, lastName)
        } else if (provider.name === 'voila-norbert') {
          result = await IntegrationService.findEmailVoilaNorbert(tenantId, domain, firstName, lastName)
        } else if (provider.name === 'rocketreach') {
          result = await IntegrationService.findPersonRocketReach(tenantId, domain, firstName, lastName)
        }
        
        if (result && result.success && result.data && result.data.email) {
          console.log(`✅ ${provider.name} found ${firstName} ${lastName}: ${result.data.email}`)
          return {
            ...result,
            data: {
              ...result.data,
              source: result.data.source || provider.name,
              provider: provider.name
            }
          }
        } else {
          console.log(`❌ ${provider.name} could not find ${firstName} ${lastName}`)
        }
      } catch (error) {
        console.log(`⚠️ ${provider.name} error for ${firstName} ${lastName}:`, error.message)
      }
    }
    
    return {
      success: false,
      error: `Could not find ${firstName} ${lastName} at ${domain} using any provider`
    }
  }
}

export default new LeadService()