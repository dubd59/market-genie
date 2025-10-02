import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const AIAgentHelper = ({ embedded = false, onClose = null, forceOpen = false }) => {
  const [isOpen, setIsOpen] = useState(embedded ? true : forceOpen);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hi! I'm your Market Genie AI Assistant. I can help you with lead generation, campaign optimization, and any questions about your marketing automation. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { tenant } = useTenant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  const predefinedResponses = {
    'lead generation': "I can help you generate high-quality leads! Here's what we can do:\n\n🎯 **Smart Lead Scraping**: Budget-aware prospect discovery\n📊 **Lead Scoring**: AI-powered qualification\n💰 **Cost Optimization**: Maximum ROI on lead generation\n📧 **Contact Enrichment**: Complete prospect profiles\n\nWould you like me to start a new lead generation campaign for you?",
    
    'campaigns': "Let's optimize your campaigns! I can help with:\n\n🚀 **Multi-Channel Automation**: Email, LinkedIn, SMS\n🎨 **Creative Optimization**: A/B testing for better results\n📈 **Performance Tracking**: Real-time analytics\n⏰ **Smart Scheduling**: Optimal send times\n\nWhat type of campaign would you like to create?",
    
    'analytics': "I'll help you understand your performance data:\n\n📊 **Conversion Tracking**: Lead to customer journey\n💡 **Insights & Recommendations**: AI-powered suggestions\n📈 **ROI Analysis**: Campaign profitability\n🎯 **Audience Insights**: Demographic breakdowns\n\nWhich metrics would you like to dive into?",
    
    'budget': "Smart budget management is key! Here's how I can help:\n\n💰 **Cost Controls**: Automated spending limits\n📊 **Budget Allocation**: Optimal channel distribution\n⚡ **Real-time Monitoring**: Live spend tracking\n🎯 **ROI Optimization**: Best performing activities\n\nWould you like to review your current budget settings?",
    
    'contacts': "Let's organize your contact management:\n\n👥 **Contact Segmentation**: Smart audience grouping\n🔄 **Data Enrichment**: Complete prospect profiles\n📱 **CRM Integration**: Seamless data flow\n🎯 **Lead Scoring**: Automated qualification\n\nWhat would you like to do with your contacts?",
    
    'help': "I'm here to help with everything Market Genie! I can assist with:\n\n🎯 Lead Generation & Prospecting\n🚀 Campaign Creation & Optimization  \n📊 Analytics & Performance Tracking\n💰 Budget Management & Cost Controls\n👥 Contact & CRM Management\n🤖 Automation Setup & Workflows\n\nJust ask me anything or say what you'd like to work on!"
  };

  const generateAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Check for keywords and return appropriate response
    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }
    
    // Default responses based on common patterns
    if (message.includes('how') || message.includes('what') || message.includes('?')) {
      return "Great question! I can help you with lead generation, campaign automation, analytics, and budget management. Could you be more specific about what you'd like to work on?";
    }
    
    if (message.includes('start') || message.includes('create') || message.includes('new')) {
      return "I'd love to help you get started! Here are some quick actions:\n\n🎯 Generate new leads\n🚀 Create a campaign\n📊 Set up analytics tracking\n💰 Configure budget controls\n\nWhich one interests you most?";
    }
    
    if (message.includes('thanks') || message.includes('thank you')) {
      return "You're very welcome! I'm always here to help optimize your marketing efforts. Is there anything else you'd like to work on?";
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". I can help you with lead generation, campaigns, analytics, budget management, and contact organization. Could you tell me more specifically what you'd like to accomplish?`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: generateAIResponse(inputText),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "Generate leads", action: () => setInputText("I want to generate new leads") },
    { text: "Create campaign", action: () => setInputText("Help me create a new campaign") },
    { text: "View analytics", action: () => setInputText("Show me my analytics") },
    { text: "Budget controls", action: () => setInputText("Help me with budget management") }
  ];

  // If embedded mode, always show the chat interface
  if (embedded) {
    return (
      <div className="w-full">
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-genie-teal text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 p-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about marketing..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-genie-teal text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="bg-genie-teal hover:bg-genie-teal/90 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Floating mode (original behavior)
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-genie-teal hover:bg-genie-teal/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
        >
          <span role="img" aria-label="ai" className="text-2xl group-hover:scale-110 transition-transform">🧞‍♂️</span>
          <span className="hidden md:block font-medium">AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-genie-teal text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span role="img" aria-label="ai" className="text-2xl">🧞‍♂️</span>
            <div>
              <h3 className="font-semibold">Market Genie AI</h3>
              <p className="text-sm opacity-90">Your Marketing Assistant</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              onClose && onClose();
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-genie-teal text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="text-xs bg-genie-teal/10 text-genie-teal px-3 py-1 rounded-full hover:bg-genie-teal/20 transition-colors"
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your marketing..."
              className="flex-1 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-genie-teal/50 focus:border-genie-teal"
              rows="2"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="bg-genie-teal text-white p-3 rounded-xl hover:bg-genie-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span role="img" aria-label="send">🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgentHelper;
