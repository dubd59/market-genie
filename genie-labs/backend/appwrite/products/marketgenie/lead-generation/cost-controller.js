// Cost monitoring and budget control system
import { Databases, Query } from 'node-appwrite';

export class CostController {
  constructor(appwriteClient) {
    this.db = new Databases(appwriteClient);
    
    // Ultra-conservative cost limits (optimized for $0.50/day starting budget)
    this.costLimits = {
      // Daily budget tiers (starting ultra-low)
      budgetTiers: {
        starter: 0.50,      // $0.50/day - absolute minimum for beginners
        basic: 2.00,        // $2.00/day - when first sales come in
        growth: 10.00,      // $10.00/day - scaling up
        pro: 50.00,         // $50.00/day - established business
        enterprise: 200.00  // $200.00/day - high volume
      },
      
      // Ultra-optimized cost per operation (designed for $0.50 budget)
      operations: {
        basicScrape: 0.0005,     // $0.0005 per basic scrape (1000 leads max/day)
        emailLookup: 0.003,      // $0.003 per email lookup (166 max/day)
        phoneEnrichment: 0.008,  // $0.008 per phone lookup (62 max/day)
        companyEnrichment: 0.015, // $0.015 per company data (33 max/day)
        emailSend: 0.0008,       // $0.0008 per email sent (625 max/day)
        smsMessage: 0.008,       // $0.008 per SMS (62 max/day)
        proxyRequest: 0.0003,    // $0.0003 per proxy request
        captchaSolve: 0.001      // $0.001 per captcha solve
      }
    };
    
    // Legacy cost rates (kept for reference)
    this.costRates = {
      scraping: {
        basic: 0.0005,      // Reduced from 0.001
        residential_proxy: 0.003,  // Reduced from 0.005
        captcha_solving: 0.001     // Reduced from 0.002
      },
      enrichment: {
        email_verification: 0.003,  // Reduced from 0.03
        company_data: 0.015,        // Reduced from 0.15
        contact_data: 0.050,        // Reduced from 0.50
        social_profiles: 0.008      // Reduced from 0.10
      },
      outreach: {
        email: 0.001,              // $0.001 per email sent
        sms: 0.015,               // $0.015 per SMS sent
        linkedin_message: 0.05     // $0.05 per LinkedIn message
      },
      infrastructure: {
        server_hourly: 0.25,       // $0.25 per hour server time
        storage_gb: 0.02,          // $0.02 per GB storage per month
        bandwidth_gb: 0.05         // $0.05 per GB bandwidth
      }
    };
  }

  async initializeBudgetControl(userId, dailyBudget = 0.50, monthlyBudget = 15.00) {
    const budgetConfig = {
      userId,
      dailyBudget: Math.max(0.50, dailyBudget), // Minimum $0.50/day
      monthlyBudget: Math.max(15.00, monthlyBudget), // Minimum $15/month
      currentDailySpend: 0,
      currentMonthlySpend: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      lastMonthlyReset: new Date().toISOString().substring(0, 7),
      tier: this.getTierForBudget(Math.max(0.50, dailyBudget)),
      settings: {
        pauseWhenBudgetHit: true,
        alertThresholds: [0.40, 0.70, 0.90], // Alert at 40%, 70%, 90% for tight budgets
        priorityMode: 'quality', // Focus on quality over quantity for low budgets
        maxLeadsPerDay: this.calculateMaxLeadsForBudget(Math.max(0.50, dailyBudget)),
        autoScale: false, // Manual scaling only to start
        emergencyStop: true
      }
    };

    await this.db.createDocument(
      'marketGenie_campaigns',
      'budget_controls',
      userId,
      budgetConfig
    );

    return budgetConfig;
  }

  getTierForBudget(dailyBudget) {
    if (dailyBudget <= 1.00) return 'starter';
    if (dailyBudget <= 5.00) return 'basic';
    if (dailyBudget <= 25.00) return 'growth';
    if (dailyBudget <= 100.00) return 'pro';
    return 'enterprise';
  }

  calculateMaxLeadsForBudget(dailyBudget) {
    // Ultra-conservative: For $0.50 budget, focus on 50-100 quality leads max
    if (dailyBudget <= 0.50) {
      return 100; // 100 basic scrapes at $0.0005 each = $0.05, leaves budget for enrichment
    } else if (dailyBudget <= 2.00) {
      return Math.floor(dailyBudget / 0.010); // $0.01 per lead average
    } else {
      return Math.floor(dailyBudget / 0.025); // $0.025 per lead for higher budgets
    }
  }

  async checkBudgetBeforeOperation(userId, operationType, quantity = 1) {
    const budgetData = await this.getBudgetStatus(userId);
    const operationCost = this.costLimits.operations[operationType] * quantity;
    const projectedSpend = budgetData.currentDailySpend + operationCost;

    const canProceed = projectedSpend <= (budgetData.dailyBudget * 0.95); // 95% threshold
    
    const status = {
      canProceed,
      currentSpend: budgetData.currentDailySpend,
      operationCost,
      projectedSpend,
      remainingBudget: Math.max(0, budgetData.dailyBudget - projectedSpend),
      budgetUtilization: (projectedSpend / budgetData.dailyBudget) * 100,
      tier: budgetData.tier
    };

    return status;
  }

  async checkBudgetStatus(userId) {
    const budgetData = await this.db.getDocument(
      'marketGenie_campaigns',
      'budget_controls',
      userId
    );

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Reset daily counter if new day
    if (budgetData.lastResetDate !== today) {
      budgetData.currentDailySpend = 0;
      budgetData.lastResetDate = today;
    }

    // Reset monthly counter if new month
    if (budgetData.lastMonthlyReset !== currentMonth) {
      budgetData.currentMonthlySpend = 0;
      budgetData.lastMonthlyReset = currentMonth;
    }

    const dailyRemaining = budgetData.dailyBudget - budgetData.currentDailySpend;
    const monthlyRemaining = budgetData.monthlyBudget - budgetData.currentMonthlySpend;

    return {
      ...budgetData,
      dailyRemaining,
      monthlyRemaining,
      canContinue: dailyRemaining > 0 && monthlyRemaining > 0,
      alertLevel: this.calculateAlertLevel(budgetData)
    };
  }

  calculateAlertLevel(budgetData) {
    const dailyUsagePercent = budgetData.currentDailySpend / budgetData.dailyBudget;
    const monthlyUsagePercent = budgetData.currentMonthlySpend / budgetData.monthlyBudget;
    
    const maxUsage = Math.max(dailyUsagePercent, monthlyUsagePercent);
    
    if (maxUsage >= 0.95) return 'critical';
    if (maxUsage >= 0.80) return 'warning';
    if (maxUsage >= 0.50) return 'caution';
    return 'normal';
  }

  async recordCost(userId, operation, quantity, metadata = {}) {
    const cost = this.calculateCost(operation, quantity, metadata);
    
    // Get current budget status
    const budgetStatus = await this.checkBudgetStatus(userId);
    
    // Check if operation would exceed budget
    if (budgetStatus.dailyRemaining < cost || budgetStatus.monthlyRemaining < cost) {
      throw new Error(`Operation would exceed budget. Daily remaining: $${budgetStatus.dailyRemaining.toFixed(2)}, Monthly remaining: $${budgetStatus.monthlyRemaining.toFixed(2)}, Operation cost: $${cost.toFixed(2)}`);
    }

    // Record the cost
    await this.db.createDocument(
      'marketGenie_campaigns',
      'cost_tracking',
      'unique()',
      {
        userId,
        operation,
        quantity,
        cost,
        metadata,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      }
    );

    // Update budget totals
    budgetStatus.currentDailySpend += cost;
    budgetStatus.currentMonthlySpend += cost;

    await this.db.updateDocument(
      'marketGenie_campaigns',
      'budget_controls',
      userId,
      {
        currentDailySpend: budgetStatus.currentDailySpend,
        currentMonthlySpend: budgetStatus.currentMonthlySpend
      }
    );

    // Check for alerts
    await this.checkAndSendAlerts(userId, budgetStatus);

    return { cost, budgetStatus };
  }

  calculateCost(operation, quantity, metadata = {}) {
    const [category, type] = operation.split('.');
    
    if (!this.costRates[category] || !this.costRates[category][type]) {
      console.warn(`Unknown operation: ${operation}`);
      return 0;
    }

    let baseCost = this.costRates[category][type] * quantity;
    
    // Apply modifiers based on metadata
    if (metadata.quality === 'premium') {
      baseCost *= 1.5; // 50% premium for high-quality sources
    }
    
    if (metadata.speed === 'urgent') {
      baseCost *= 2; // 100% premium for urgent processing
    }

    return baseCost;
  }

  async checkAndSendAlerts(userId, budgetStatus) {
    const alertLevel = this.calculateAlertLevel(budgetStatus);
    
    if (alertLevel !== 'normal') {
      await this.sendBudgetAlert(userId, alertLevel, budgetStatus);
    }
  }

  async sendBudgetAlert(userId, alertLevel, budgetStatus) {
    const alert = {
      userId,
      type: 'budget_alert',
      level: alertLevel,
      message: this.getBudgetAlertMessage(alertLevel, budgetStatus),
      timestamp: new Date().toISOString(),
      budgetData: {
        dailySpent: budgetStatus.currentDailySpend,
        dailyBudget: budgetStatus.dailyBudget,
        monthlySpent: budgetStatus.currentMonthlySpend,
        monthlyBudget: budgetStatus.monthlyBudget
      }
    };

    await this.db.createDocument(
      'marketGenie_campaigns',
      'alerts',
      'unique()',
      alert
    );
  }

  getBudgetAlertMessage(alertLevel, budgetStatus) {
    const dailyPercent = ((budgetStatus.currentDailySpend / budgetStatus.dailyBudget) * 100).toFixed(1);
    const monthlyPercent = ((budgetStatus.currentMonthlySpend / budgetStatus.monthlyBudget) * 100).toFixed(1);

    switch (alertLevel) {
      case 'critical':
        return `🚨 CRITICAL: You've used ${Math.max(dailyPercent, monthlyPercent)}% of your budget! Lead generation will pause automatically.`;
      case 'warning':
        return `⚠️ WARNING: You've used ${Math.max(dailyPercent, monthlyPercent)}% of your budget. Consider slowing down or adjusting settings.`;
      case 'caution':
        return `💡 NOTICE: You've used ${Math.max(dailyPercent, monthlyPercent)}% of your budget. Monitor spending closely.`;
      default:
        return 'Budget status normal.';
    }
  }

  // Intensity adjustment methods
  async adjustIntensity(userId, intensityLevel) {
    // intensityLevel: 'low' (25%), 'medium' (50%), 'high' (75%), 'maximum' (100%)
    const budgetStatus = await this.checkBudgetStatus(userId);
    
    const intensitySettings = {
      low: {
        leadsPerHour: 5,
        enrichmentLevel: 'basic',
        sources: ['yellowpages'],
        costMultiplier: 0.25
      },
      medium: {
        leadsPerHour: 20,
        enrichmentLevel: 'standard',
        sources: ['yellowpages', 'yelp'],
        costMultiplier: 0.50
      },
      high: {
        leadsPerHour: 50,
        enrichmentLevel: 'premium',
        sources: ['yellowpages', 'yelp', 'linkedin'],
        costMultiplier: 0.75
      },
      maximum: {
        leadsPerHour: 100,
        enrichmentLevel: 'premium',
        sources: ['yellowpages', 'yelp', 'linkedin', 'crunchbase'],
        costMultiplier: 1.0
      }
    };

    const settings = intensitySettings[intensityLevel];
    const adjustedDailyBudget = budgetStatus.dailyBudget * settings.costMultiplier;
    
    await this.db.updateDocument(
      'marketGenie_campaigns',
      'budget_controls',
      userId,
      {
        'settings.intensityLevel': intensityLevel,
        'settings.leadsPerHour': settings.leadsPerHour,
        'settings.enrichmentLevel': settings.enrichmentLevel,
        'settings.activeSources': settings.sources,
        'settings.adjustedDailyBudget': adjustedDailyBudget
      }
    );

    return {
      intensityLevel,
      estimatedDailyCost: adjustedDailyBudget,
      estimatedLeadsPerDay: settings.leadsPerHour * 24,
      settings
    };
  }

  async generateCostReport(userId, startDate, endDate) {
    const costs = await this.db.listDocuments(
      'marketGenie_campaigns',
      'cost_tracking',
      [
        Query.equal('userId', userId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate)
      ]
    );

    const summary = {
      totalCost: 0,
      operationBreakdown: {},
      dailyBreakdown: {},
      leadsGenerated: 0,
      avgCostPerLead: 0
    };

    costs.documents.forEach(cost => {
      summary.totalCost += cost.cost;
      
      // Operation breakdown
      if (!summary.operationBreakdown[cost.operation]) {
        summary.operationBreakdown[cost.operation] = 0;
      }
      summary.operationBreakdown[cost.operation] += cost.cost;
      
      // Daily breakdown
      if (!summary.dailyBreakdown[cost.date]) {
        summary.dailyBreakdown[cost.date] = 0;
      }
      summary.dailyBreakdown[cost.date] += cost.cost;
      
      // Count leads
      if (cost.operation === 'scraping.basic') {
        summary.leadsGenerated += cost.quantity;
      }
    });

    summary.avgCostPerLead = summary.leadsGenerated > 0 ? 
      summary.totalCost / summary.leadsGenerated : 0;

    return summary;
  }
}
