// AI API Service - Connects to real AI APIs using Firebase-stored user credentials
import toast from 'react-hot-toast';
import FirebaseUserDataService from './firebaseUserData';
import UnsubscribeService from './unsubscribeService';
import IntegrationService from './integrationService';

export class AIService {
  // Get stored API keys from Firebase - checks BOTH locations
  static async getStoredAPIKeys(userId, tenantId = null) {
    try {
      console.log('🔍 AIService.getStoredAPIKeys - Looking for keys with userId:', userId, 'tenantId:', tenantId);
      
      // First try the userData location (old method)
      console.log('🔍 Checking userData/' + userId + '_apiKeys');
      const userDataKeys = await FirebaseUserDataService.getAPIKeys(userId);
      console.log('🔍 userData keys found:', userDataKeys);
      
      // Also check IntegrationService location (new method) if tenantId provided
      let integrationKeys = [];
      const effectiveTenantId = tenantId || userId; // Use userId as tenantId if not provided
      
      console.log('🔍 Checking MarketGenie_tenants/' + effectiveTenantId + '/integrations/...');
      
      // Check for each AI provider in IntegrationService
      const aiProviders = ['openai', 'deepseek', 'anthropic', 'gemini'];
      for (const provider of aiProviders) {
        try {
          const result = await IntegrationService.getIntegrationCredentials(effectiveTenantId, provider);
          if (result.success && result.data && result.data.apiKey && result.data.status === 'connected') {
            console.log(`🔍 Found ${provider} key in IntegrationService`);
            integrationKeys.push({
              id: `integration_${provider}`,
              name: provider.charAt(0).toUpperCase() + provider.slice(1),
              service: provider,
              key: result.data.apiKey,
              status: 'active',
              source: 'integrationService'
            });
          }
        } catch (e) {
          // Provider not found, continue
        }
      }
      
      console.log('🔍 IntegrationService keys found:', integrationKeys.map(k => k.service));
      
      // Merge both sources, preferring IntegrationService (newer)
      const allKeys = [...integrationKeys];
      
      // Add userData keys that aren't duplicates
      for (const key of userDataKeys) {
        const exists = allKeys.some(k => k.service.toLowerCase() === key.service.toLowerCase());
        if (!exists) {
          allKeys.push(key);
        }
      }
      
      console.log('🔍 Total keys available:', allKeys.map(k => ({ service: k.service, status: k.status, source: k.source || 'userData' })));
      return allKeys;
    } catch (error) {
      console.error('Error loading API keys:', error);
      return [];
    }
  }

  // Get the first active API key for a specific service
  static async getAPIKey(userId, serviceName, tenantId = null) {
    const apiKeys = await this.getStoredAPIKeys(userId, tenantId);
    const key = apiKeys.find(k => 
      k.service.toLowerCase().includes(serviceName.toLowerCase()) && 
      k.status === 'active'
    );
    return key?.key || null;
  }

  // Generate email content using OpenAI GPT-4
  static async generateWithOpenAI(userId, prompt, campaignData, apiKey = null) {
    // Use provided key or fetch from storage
    const key = apiKey || await this.getAPIKey(userId, 'openai');
    if (!key) {
      throw new Error('No active OpenAI API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert email marketing copywriter. Create compelling, personalized email content that drives engagement and conversions. Keep emails professional, engaging, and action-oriented.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  // Generate email content using Anthropic Claude
  static async generateWithClaude(userId, prompt, campaignData, apiKey = null) {
    const key = apiKey || await this.getAPIKey(userId, 'anthropic');
    if (!key) {
      throw new Error('No active Anthropic API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are an expert email marketing copywriter. Create compelling, personalized email content that drives engagement and conversions. Keep emails professional, engaging, and action-oriented.\n\n${prompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Anthropic API request failed');
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw error;
    }
  }

  // Generate email content using Google Gemini
  static async generateWithGemini(userId, prompt, campaignData, apiKey = null) {
    const key = apiKey || await this.getAPIKey(userId, 'gemini');
    if (!key) {
      throw new Error('No active Google Gemini API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert email marketing copywriter. Create compelling, personalized email content that drives engagement and conversions. Keep emails professional, engaging, and action-oriented.\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Google Gemini API request failed');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  // Generate email content using DeepSeek
  static async generateWithDeepSeek(userId, prompt, campaignData, apiKey = null) {
    const key = apiKey || await this.getAPIKey(userId, 'deepseek');
    if (!key) {
      throw new Error('No active DeepSeek API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert email marketing copywriter. Create compelling, personalized email content that drives engagement and conversions. Keep emails professional, engaging, and action-oriented.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'DeepSeek API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
    }
  }

  // Main function to generate email content with AI
  static async generateEmailContent(userId, campaignData, preferredProvider = null, tenantId = null, recipientEmail = null, businessInfo = {}, senderInfo = {}) {
    const { name, type, targetAudience, subject, additionalPrompt, callToActionText, callToActionUrl } = campaignData;
    
    const prompt = `
You are a PREMIUM email marketing copywriter who creates VISUALLY STUNNING, professionally formatted emails. 

Campaign Name: ${name}
Campaign Type: ${type}
Target Audience: ${targetAudience}
Subject Line: ${subject}

${additionalPrompt ? `CRITICAL ADDITIONAL REQUIREMENTS (MUST FOLLOW):
${additionalPrompt}

` : ''}${callToActionText && callToActionUrl ? `🎯 CALL-TO-ACTION REQUIREMENTS (MANDATORY):
- Your email MUST end with a button-style link for: "${callToActionText}"
- Create a final paragraph with compelling text leading to the button
- The button link MUST be formatted exactly like this:
  <p style="margin-bottom: 16px; margin-top: 20px; text-align: center;"><a href="${callToActionUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">${callToActionText}</a></p>
- Do NOT show the URL as text - only show "${callToActionText}" as the button text
- Make the preceding paragraph compelling and action-oriented
- Example format:
  "Ready to transform your business? Take action now!"
  
  [BUTTON LINK HERE using the exact format above]

` : ''}VISUAL EXCELLENCE REQUIREMENTS (MANDATORY):
1. Create a compelling story flow with proper narrative structure
2. Use strategic <strong>bold highlights</strong> on key benefits, results, and important phrases
3. Include well-formatted bullet points for lists and benefits
4. Add emotional hooks and engagement elements
5. Create clear sections with proper paragraph separation
6. Use persuasive copywriting techniques

HTML FORMATTING RULES (FOLLOW EXACTLY):
- NEVER use markdown (**, *, -, #, [], etc.)
- Use <p style="margin-bottom: 16px;">content</p> for proper paragraph spacing
- For bold emphasis: <strong>key phrase</strong> (use generously for impact)
- For bullet points: 
  <p style="margin-bottom: 8px;">• <strong>Benefit:</strong> Description</p>
  <p style="margin-bottom: 8px;">• <strong>Feature:</strong> Description</p>
- For section breaks: <p style="margin-bottom: 24px;"></p>
- For links: <a href="url" style="color: #14b8a6; font-weight: bold; text-decoration: none;">Link Text</a>

CONTENT STRUCTURE REQUIREMENTS:
1. Opening hook paragraph (engaging, emotional)
2. Story/context paragraph with <strong>highlighted key points</strong>
3. Benefits section with bullet points and bold highlights
4. Social proof or urgency element with emphasis
5. POWERFUL CALL-TO-ACTION as the ABSOLUTE FINAL paragraph - this MUST be the last content before email ends

🚨 CRITICAL CTA PLACEMENT RULES (MANDATORY):
- The call-to-action MUST be the very last paragraph of your main email body content
- The CTA appears in the email body BEFORE any system-generated footer/signature
- NO TEXT, NO CLOSING, NO "BEST REGARDS" after the CTA in your content
- Use strong, action-oriented language like "Ready to get started?", "Don't miss out!", "Take action now!"
- Make the CTA paragraph stand out with <strong>bold formatting</strong>
- End your email content with the CTA paragraph - the system will add footer separately
- STOP WRITING after the CTA - no additional sentences or closing statements

EXAMPLE OF CORRECT ENDING:
"...your key benefits here.

<p style="margin-bottom: 16px;"><strong>Ready to transform your business? Let's make it happen today!</strong></p>"

❌ WRONG: CTA followed by "Best regards, John" or any closing
✅ CORRECT: CTA as final paragraph, then system adds footer

ABSOLUTELY FORBIDDEN IN YOUR CONTENT:
- Do NOT add signatures, names, or sign-offs after the CTA
- Do NOT add "Best regards", "Sincerely", "Thanks", or any closing
- Do NOT add unsubscribe links or footer content in your content
- Do NOT add contact information in your content
- The system automatically adds professional signature and footer below your content

NEVER CREATE BUTTONS OR INVENT URLS - Focus on compelling copy with strategic formatting.
EXCEPTION: If the user specifically provides a URL or link in their prompt, you MAY include it exactly as provided.

Write a professional email based on the campaign details above. Your content should end with a compelling call-to-action paragraph. Do NOT add any signatures, closings, "Best regards", names, or footer content after the CTA. The system will automatically add the professional footer and unsubscribe links below your content.
    `;

    // Use tenantId for key lookup - this is the key fix!
    const effectiveTenantId = tenantId || userId;
    const apiKeys = await this.getStoredAPIKeys(userId, effectiveTenantId);
    console.log('🔑 AI Service - Raw API Keys from Firebase:', apiKeys);
    console.log('🔑 AI Service - User ID:', userId, 'Tenant ID:', effectiveTenantId);
    
    const activeKeys = apiKeys.filter(k => k.status === 'active');
    console.log('🔑 AI Service - Active Keys:', activeKeys.map(k => ({ service: k.service, status: k.status, source: k.source })));

    if (activeKeys.length === 0) {
      console.error('🔑 AI Service - NO ACTIVE KEYS FOUND! This is why fallback is happening.');
      throw new Error('No active AI API keys found. Please add API keys in the API Keys & Integrations section.');
    }

    // Try preferred provider first, then fallback to available providers
    const providers = [
      { name: 'openai', func: this.generateWithOpenAI },
      { name: 'anthropic', func: this.generateWithClaude },
      { name: 'deepseek', func: this.generateWithDeepSeek },
      { name: 'gemini', func: this.generateWithGemini }
    ];

    let generatedContent = '';

    // If preferred provider is specified, try it first
    if (preferredProvider) {
      const provider = providers.find(p => p.name === preferredProvider.toLowerCase());
      const providerKey = activeKeys.find(k => k.service.toLowerCase().includes(provider?.name || ''));
      if (provider && providerKey) {
        try {
          console.log(`🚀 Trying preferred provider: ${provider.name} with key from ${providerKey.source || 'userData'}`);
          generatedContent = await provider.func.call(this, userId, prompt, campaignData, providerKey.key);
          toast.success(`Email generated successfully with ${provider.name.toUpperCase()}!`);
        } catch (error) {
          console.warn(`${preferredProvider} failed, trying fallback providers:`, error.message);
        }
      }
    }

    // Try each available provider if no content generated yet
    if (!generatedContent) {
      for (const provider of providers) {
        const providerKey = activeKeys.find(k => k.service.toLowerCase().includes(provider.name));
        if (providerKey) {
          try {
            console.log(`🚀 Trying provider: ${provider.name} with key from ${providerKey.source || 'userData'}`);
            generatedContent = await provider.func.call(this, userId, prompt, campaignData, providerKey.key);
            toast.success(`Email generated successfully with ${provider.name.toUpperCase()}!`);
            break;
          } catch (error) {
            console.warn(`${provider.name} failed:`, error.message);
            continue;
          }
        }
      }
    }

    if (!generatedContent) {
      throw new Error('All AI providers failed. Please check your API keys and try again.');
    }

    // Clean up excessive line spacing and formatting issues
    generatedContent = generatedContent
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Replace triple+ line breaks with double
      .replace(/(<\/p>)\s*\n+\s*(<p>)/g, '$1\n$2')  // Clean spacing between paragraphs
      .replace(/\n\s+/g, '\n')  // Remove leading whitespace on lines
      .trim();

    // Add clear visual separation before footer to preserve CTA prominence
    if (tenantId && recipientEmail) {
      const campaignId = `campaign_${Date.now()}`;
      // Add visual break to separate main content (with CTA) from footer
      generatedContent += `\n\n<div style="margin: 40px 0; border-top: 2px solid #e5e7eb; opacity: 0.3;"></div>\n`;
      const unsubscribeFooter = UnsubscribeService.generateUnsubscribeFooter(
        tenantId, 
        recipientEmail, 
        campaignId,
        businessInfo
      );
      generatedContent += unsubscribeFooter;
    } else if (Object.keys(senderInfo).length > 0) {
      // Add visual break before signature
      generatedContent += `\n\n<div style="margin: 40px 0; border-top: 2px solid #e5e7eb; opacity: 0.3;"></div>\n`;
      const signature = UnsubscribeService.generateEmailSignature(senderInfo);
      generatedContent += signature;
    }

    return generatedContent;
  }
}

export default AIService;