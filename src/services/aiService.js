// AI API Service - Connects to real AI APIs using Firebase-stored user credentials
import toast from 'react-hot-toast';
import FirebaseUserDataService from './firebaseUserData';
import UnsubscribeService from './unsubscribeService';

export class AIService {
  // Get stored API keys from Firebase (requires userId)
  static async getStoredAPIKeys(userId) {
    try {
      return await FirebaseUserDataService.getAPIKeys(userId);
    } catch (error) {
      console.error('Error loading API keys:', error);
      return [];
    }
  }

  // Get the first active API key for a specific service
  static async getAPIKey(userId, serviceName) {
    const apiKeys = await this.getStoredAPIKeys(userId);
    const key = apiKeys.find(k => 
      k.service.toLowerCase().includes(serviceName.toLowerCase()) && 
      k.status === 'active'
    );
    return key?.key || null;
  }

  // Generate email content using OpenAI GPT-4
  static async generateWithOpenAI(userId, prompt, campaignData) {
    const apiKey = await this.getAPIKey(userId, 'openai');
    if (!apiKey) {
      throw new Error('No active OpenAI API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
  static async generateWithClaude(userId, prompt, campaignData) {
    const apiKey = await this.getAPIKey(userId, 'anthropic');
    if (!apiKey) {
      throw new Error('No active Anthropic API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
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
  static async generateWithGemini(userId, prompt, campaignData) {
    const apiKey = await this.getAPIKey(userId, 'gemini');
    if (!apiKey) {
      throw new Error('No active Google Gemini API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
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
  static async generateWithDeepSeek(userId, prompt, campaignData) {
    const apiKey = await this.getAPIKey(userId, 'deepseek');
    if (!apiKey) {
      throw new Error('No active DeepSeek API key found. Please add one in API Keys & Integrations.');
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
    const { name, type, targetAudience, subject, additionalPrompt } = campaignData;
    
    const prompt = `
You are a PREMIUM email marketing copywriter who creates VISUALLY STUNNING, professionally formatted emails. 

Campaign Name: ${name}
Campaign Type: ${type}
Target Audience: ${targetAudience}
Subject Line: ${subject}

${additionalPrompt ? `CRITICAL ADDITIONAL REQUIREMENTS (MUST FOLLOW):
${additionalPrompt}

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
5. Clear call-to-action paragraph
6. Closing with personality

NEVER CREATE BUTTONS OR INVENT URLS - Focus on compelling copy with strategic formatting.

SIGNATURE AND FOOTER REQUIREMENTS:
- Do NOT include any signatures, contact information, or closing statements
- Do NOT include unsubscribe links or footer content
- End the email with the main content only
- Do NOT add "Best regards", "Sincerely", names, or sign-offs
- The system will automatically add professional signature and footer

Write a professional email based on the campaign details above. Focus on clear, well-spaced content without adding any signatures, closings, buttons, links, or footer content unless specifically requested.
    `;

    const apiKeys = await this.getStoredAPIKeys(userId);
    const activeKeys = apiKeys.filter(k => k.status === 'active');

    if (activeKeys.length === 0) {
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
      if (provider && activeKeys.some(k => k.service.toLowerCase().includes(provider.name))) {
        try {
          generatedContent = await provider.func.call(this, userId, prompt, campaignData);
          toast.success(`Email generated successfully with ${provider.name.toUpperCase()}!`);
        } catch (error) {
          console.warn(`${preferredProvider} failed, trying fallback providers:`, error.message);
        }
      }
    }

    // Try each available provider if no content generated yet
    if (!generatedContent) {
      for (const provider of providers) {
        if (activeKeys.some(k => k.service.toLowerCase().includes(provider.name))) {
          try {
            generatedContent = await provider.func.call(this, userId, prompt, campaignData);
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

    // Add unsubscribe footer with business info (includes signature)
    if (tenantId && recipientEmail) {
      const campaignId = `campaign_${Date.now()}`;
      const unsubscribeFooter = UnsubscribeService.generateUnsubscribeFooter(
        tenantId, 
        recipientEmail, 
        campaignId,
        businessInfo
      );
      generatedContent += unsubscribeFooter;
    } else if (Object.keys(senderInfo).length > 0) {
      // Only add simple signature if no business footer
      const signature = UnsubscribeService.generateEmailSignature(senderInfo);
      generatedContent += signature;
    }

    return generatedContent;
  }
}

export default AIService;