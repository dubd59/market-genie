// Budget-conscious AI swarm with cost controls
import { Databases } from 'node-appwrite';
import { CostController } from '../cost-controller.js';

export class BudgetAwareAISwarm {
  constructor(appwriteClient, userId) {
    this.db = new Databases(appwriteClient);
    this.costController = new CostController(appwriteClient);
    this.userId = userId;
    
    // AI operation costs (realistic pricing)
    this.aiCosts = {
      emailGeneration: 0.045,      // GPT-4 email creation
      socialPostGeneration: 0.018, // GPT-4 social post
      contentOptimization: 0.030,  // Content improvement
      adCopyGeneration: 0.025,     // Ad creative copy
      dataAnalysis: 0.015,         // Analytics insights
      leadPersonalization: 0.008,  // Personalized outreach
      chatbotResponse: 0.005       // Customer service responses
    };
    
    // Budget allocation strategy
    this.budgetAllocation = {
      starter: {    // $0.50/day
        aiOperations: 0.10,     // 20% for AI ($0.10)
        leadScraping: 0.35,     // 70% for leads ($0.35)
        outreach: 0.05          // 10% for outreach ($0.05)
      },
      basic: {      // $2.00/day
        aiOperations: 0.50,     // 25% for AI ($0.50)
        leadScraping: 1.20,     // 60% for leads ($1.20)
        outreach: 0.30          // 15% for outreach ($0.30)
      },
      growth: {     // $10.00/day
        aiOperations: 3.00,     // 30% for AI ($3.00)
        leadScraping: 5.00,     // 50% for leads ($5.00)
        outreach: 2.00          // 20% for outreach ($2.00)
      }
    };
  }

  async initializeSwarm(budgetTier) {
    const allocation = this.budgetAllocation[budgetTier];
    
    // Calculate what AI operations we can afford
    const affordableOperations = this.calculateAffordableAI(allocation.aiOperations);
    
    return {
      tier: budgetTier,
      aiOperationsBudget: allocation.aiOperations,
      affordableOperations,
      activeAgents: this.getActiveAgents(budgetTier),
      dailyLimits: this.setDailyLimits(affordableOperations)
    };
  }

  calculateAffordableAI(aiBudget) {
    return {
      emails: Math.floor(aiBudget / this.aiCosts.emailGeneration),
      socialPosts: Math.floor(aiBudget / this.aiCosts.socialPostGeneration),
      adCopies: Math.floor(aiBudget / this.aiCosts.adCopyGeneration),
      personalizations: Math.floor(aiBudget / this.aiCosts.leadPersonalization),
      // Mix and match approach
      balanced: {
        emails: Math.floor((aiBudget * 0.4) / this.aiCosts.emailGeneration),
        socialPosts: Math.floor((aiBudget * 0.3) / this.aiCosts.socialPostGeneration),
        personalizations: Math.floor((aiBudget * 0.3) / this.aiCosts.leadPersonalization)
      }
    };
  }

  getActiveAgents(budgetTier) {
    // Activate agents based on budget tier
    const agents = {
      starter: ['lead-agent'],  // Only basic lead processing
      basic: ['lead-agent', 'email-agent'],  // Add email automation
      growth: ['lead-agent', 'email-agent', 'content-agent', 'social-agent'],  // Full swarm
      pro: ['lead-agent', 'email-agent', 'content-agent', 'social-agent', 'analytics-agent'],
      enterprise: ['lead-agent', 'email-agent', 'content-agent', 'social-agent', 'analytics-agent', 'sales-agent']
    };
    
    return agents[budgetTier] || agents.starter;
  }

  async checkAIBudget(operationType) {
    const todayAISpend = await this.getTodayAISpending();
    const budgetSettings = await this.costController.getBudgetStatus(this.userId);
    const allocation = this.budgetAllocation[budgetSettings.tier];
    const operationCost = this.aiCosts[operationType];
    
    const canAfford = (todayAISpend + operationCost) <= allocation.aiOperations;
    
    return {
      canAfford,
      operationCost,
      todayAISpend,
      remainingAIBudget: Math.max(0, allocation.aiOperations - todayAISpend),
      dailyAILimit: allocation.aiOperations
    };
  }

  async getTodayAISpending() {
    // Get today's AI operation costs
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { documents } = await this.db.listDocuments(
        'marketGenie_campaigns',
        'ai_operations',
        [
          Query.equal('userId', this.userId),
          Query.equal('date', today)
        ]
      );

      return documents.reduce((total, op) => total + (op.cost || 0), 0);
    } catch (error) {
      console.error('Error getting AI spending:', error);
      return 0;
    }
  }

  async recordAIOperation(operationType, cost, result) {
    const operation = {
      userId: this.userId,
      operationType,
      cost,
      result: result.substring(0, 500), // Truncate long results
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    await this.db.createDocument(
      'marketGenie_campaigns',
      'ai_operations',
      'unique()',
      operation
    );

    return operation;
  }

  // Lightweight AI alternatives for ultra-low budgets
  async generateBudgetFriendlyContent(type, data) {
    const budgetCheck = await this.checkAIBudget(`${type}Generation`);
    
    if (!budgetCheck.canAfford) {
      // Fall back to templates for ultra-low budgets
      return this.generateTemplateContent(type, data);
    }

    // Use AI if budget allows
    return this.generateAIContent(type, data);
  }

  generateTemplateContent(type, data) {
    // Free template-based content generation
    const templates = {
      email: {
        subject: `Hi ${data.name}, quick question about ${data.company}`,
        body: `Hi ${data.name},\n\nI noticed ${data.company} is in the ${data.industry} space. We help companies like yours increase efficiency.\n\nWould you be open to a quick 15-minute call this week?\n\nBest regards`
      },
      socialPost: {
        content: `🚀 Exciting developments in ${data.industry}! Companies are seeing ${data.metric}% improvement with modern automation. What's your experience? #${data.industry} #Automation`
      },
      adCopy: {
        headline: `${data.industry} Companies: Increase Efficiency by ${data.percentage}%`,
        description: `Join ${data.testimonialCount}+ satisfied customers who've transformed their operations.`
      }
    };
    
    return templates[type] || { content: 'Template content' };
  }

  async generateAIContent(type, data) {
    // Actual AI generation (when budget allows)
    const prompt = this.buildPrompt(type, data);
    
    // This would integrate with OpenAI, Claude, etc.
    const aiResponse = await this.callAIService(prompt);
    
    // Record the cost
    await this.recordAIOperation(`${type}Generation`, this.aiCosts[`${type}Generation`], aiResponse);
    
    return aiResponse;
  }

  setDailyLimits(affordableOperations) {
    return {
      maxEmails: affordableOperations.balanced.emails,
      maxSocialPosts: affordableOperations.balanced.socialPosts,
      maxPersonalizations: affordableOperations.balanced.personalizations,
      resetTime: '00:00:00Z' // Reset at midnight UTC
    };
  }

  // Cost-optimized agent coordination
  async coordinateAgents(task, priority = 'normal') {
    const budgetSettings = await this.costController.getBudgetStatus(this.userId);
    const activeAgents = this.getActiveAgents(budgetSettings.tier);
    
    // Route tasks based on available budget and agent costs
    const taskAssignment = {
      agent: this.selectCheapestCapableAgent(task, activeAgents),
      estimatedCost: this.estimateTaskCost(task),
      fallbackOption: this.getFallbackOption(task),
      budgetImpact: 'low' // For $0.50 budget considerations
    };
    
    return taskAssignment;
  }

  selectCheapestCapableAgent(task, activeAgents) {
    // Always prefer template-based solutions for ultra-low budgets
    const agentCosts = {
      'lead-agent': 0.001,      // Mostly data processing
      'email-agent': 0.045,     // AI content generation
      'content-agent': 0.030,   // AI content creation
      'social-agent': 0.018,    // AI social posts
      'analytics-agent': 0.015, // AI data analysis
      'sales-agent': 0.008      // AI personalization
    };
    
    // Find cheapest agent that can handle the task
    const capableAgents = activeAgents.filter(agent => 
      this.canAgentHandleTask(agent, task)
    );
    
    return capableAgents.sort((a, b) => agentCosts[a] - agentCosts[b])[0];
  }
}

// Budget-aware AI swarm configuration
export const SwarmConfig = {
  budgetTiers: {
    starter: {      // $0.50/day
      aiOperations: 2,    // Max 2 AI operations per day
      primaryFocus: 'lead-generation',
      fallbackToTemplates: true,
      agents: 1
    },
    basic: {        // $2.00/day
      aiOperations: 11,   // Max 11 AI operations per day
      primaryFocus: 'lead-generation + email',
      fallbackToTemplates: true,
      agents: 2
    },
    growth: {       // $10.00/day
      aiOperations: 66,   // Max 66 AI operations per day
      primaryFocus: 'full-automation',
      fallbackToTemplates: false,
      agents: 4
    }
  }
};
