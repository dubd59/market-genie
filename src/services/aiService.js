// AI API Service - Connects to real AI APIs using stored user credentials
import toast from 'react-hot-toast';

export class AIService {
  // Get stored API keys from localStorage
  static getStoredAPIKeys() {
    try {
      const keys = localStorage.getItem('marketgenie_api_keys');
      return keys ? JSON.parse(keys) : [];
    } catch (error) {
      console.error('Error loading API keys:', error);
      return [];
    }
  }

  // Get the first active API key for a specific service
  static getAPIKey(serviceName) {
    const apiKeys = this.getStoredAPIKeys();
    const key = apiKeys.find(k => 
      k.service.toLowerCase().includes(serviceName.toLowerCase()) && 
      k.status === 'active'
    );
    return key?.key || null;
  }

  // Generate email content using OpenAI GPT-4
  static async generateWithOpenAI(prompt, campaignData) {
    const apiKey = this.getAPIKey('openai');
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
  static async generateWithClaude(prompt, campaignData) {
    const apiKey = this.getAPIKey('anthropic');
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
  static async generateWithGemini(prompt, campaignData) {
    const apiKey = this.getAPIKey('gemini');
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
  static async generateWithDeepSeek(prompt, campaignData) {
    const apiKey = this.getAPIKey('deepseek');
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
  static async generateEmailContent(campaignData, preferredProvider = null) {
    const { name, type, targetAudience, subject } = campaignData;
    
    const prompt = `
Create a compelling email for the following campaign:

Campaign Name: ${name}
Campaign Type: ${type}
Target Audience: ${targetAudience}
Subject Line: ${subject}

Please create an engaging email that:
1. Has a personalized greeting with {firstName} placeholder
2. Introduces the campaign value proposition
3. Includes relevant benefits and features
4. Has a clear call-to-action
5. Maintains a professional yet engaging tone
6. Is optimized for ${targetAudience}

The email should be ready to send and include placeholders for personalization like {firstName}, {company}, etc.
    `;

    const apiKeys = this.getStoredAPIKeys();
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

    // If preferred provider is specified, try it first
    if (preferredProvider) {
      const provider = providers.find(p => p.name === preferredProvider.toLowerCase());
      if (provider && activeKeys.some(k => k.service.toLowerCase().includes(provider.name))) {
        try {
          const content = await provider.func.call(this, prompt, campaignData);
          toast.success(`Email generated successfully with ${provider.name.toUpperCase()}!`);
          return content;
        } catch (error) {
          console.warn(`${preferredProvider} failed, trying fallback providers:`, error.message);
        }
      }
    }

    // Try each available provider
    for (const provider of providers) {
      if (activeKeys.some(k => k.service.toLowerCase().includes(provider.name))) {
        try {
          const content = await provider.func.call(this, prompt, campaignData);
          toast.success(`Email generated successfully with ${provider.name.toUpperCase()}!`);
          return content;
        } catch (error) {
          console.warn(`${provider.name} failed:`, error.message);
          continue;
        }
      }
    }

    throw new Error('All AI providers failed. Please check your API keys and try again.');
  }
}

export default AIService;