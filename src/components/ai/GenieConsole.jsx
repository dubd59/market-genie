import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Mic, History, Lightbulb, TrendingUp } from 'lucide-react'
import { useGenie } from '../../contexts/GenieContext'
import { useVoiceGenie } from '../../hooks/useVoiceGenie'
import toast from 'react-hot-toast'

export default function GenieConsole() {
  const [wish, setWish] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [response, setResponse] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const textareaRef = useRef(null)
  
  const { grantWish, isProcessing, lastWish, getWishHistory } = useGenie()

  // Suggested wishes for better UX
  const suggestedWishes = [
    "Find me more leads like my best customers",
    "Improve my email campaign open rates",
    "Create a social media content calendar",
    "Optimize my landing page conversion rate",
    "Set up automated lead nurturing sequences",
    "Analyze my marketing funnel performance"
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!wish.trim() || isProcessing) return

    const result = await grantWish(wish)
    if (result) {
      setResponse(result)
      setWish('')
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setWish(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const handleVoiceResult = async (transcript) => {
    setIsListening(false)
    setWish(transcript)
    setShowSuggestions(false)
    
    // Auto-submit voice commands
    if (transcript.trim()) {
      const result = await grantWish(transcript)
      if (result) {
        setResponse(result)
        setWish('')
      }
    }
  }

  const { startListening, stopListening } = useVoiceGenie({
    onResult: handleVoiceResult,
    onStart: () => setIsListening(true),
    onEnd: () => setIsListening(false),
    onError: (error) => {
      setIsListening(false)
      toast.error('Voice recognition failed. Please try again.')
    }
  })

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [wish])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold gradient-text">AI Marketing Genie</h2>
        </motion.div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tell me your marketing wishes and I'll make them happen. Use natural language - 
          I understand what you need and can automate the execution.
        </p>
      </div>

      {/* Main Console */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-genie p-6 mb-6"
      >
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your marketing wish? ✨
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                className="w-full p-4 pr-24 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 resize-none min-h-[80px]"
                placeholder="e.g., 'Find more leads like my top customers' or 'Improve my email open rates'"
                disabled={isProcessing}
                rows={2}
              />
              
              {/* Voice Button */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                className={`
                  absolute right-2 top-2 w-10 h-10 rounded-lg flex items-center justify-center transition-all
                  ${isListening 
                    ? 'bg-orange-500 text-white animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                title={isListening ? 'Stop listening' : 'Click to speak'}
              >
                <Mic className="w-4 h-4" />
              </button>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={!wish.trim() || isProcessing}
                className={`
                  absolute right-2 bottom-2 w-10 h-10 rounded-lg flex items-center justify-center transition-all
                  ${wish.trim() && !isProcessing
                    ? 'bg-teal-500 text-white hover:bg-teal-600' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Processing Status */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200"
              >
                <Sparkles className="w-5 h-5 text-teal-500 animate-spin" />
                <span className="text-teal-700 font-medium">
                  🧞‍♂️ Your genie is working on it...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Listening Status */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200"
              >
                <Mic className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="text-orange-700 font-medium">
                  🎤 Listening... Speak your marketing wish!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Suggested Wishes */}
        <AnimatePresence>
          {showSuggestions && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Need inspiration? Try these:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedWishes.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm"
                  >
                    "{suggestion}"
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Response */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-genie p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Your Wish Has Been Granted! ✨</h3>
            </div>

            {/* Response Message */}
            <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-teal-800 font-medium">{response.message}</p>
              {response.confidence && (
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-teal-600">
                    Confidence: {Math.round(response.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {response.suggestions && response.suggestions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Strategic Recommendations
                </h4>
                <div className="grid gap-3">
                  {response.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-teal-600">{index + 1}</span>
                      </div>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Automations */}
            {response.automations && response.automations.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Available Automations
                </h4>
                <div className="grid gap-2">
                  {response.automations.map((automation, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-purple-800">{automation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {response.next_steps && response.next_steps.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Next Steps</h4>
                <div className="space-y-2">
                  {response.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <span className="text-sm text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expected Impact */}
            {response.estimated_impact && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Expected Impact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  {response.estimated_impact.timeline && (
                    <div>
                      <span className="text-green-700 font-medium">Timeline:</span>
                      <p className="text-green-600">{response.estimated_impact.timeline}</p>
                    </div>
                  )}
                  {response.estimated_impact.effort && (
                    <div>
                      <span className="text-green-700 font-medium">Effort:</span>
                      <p className="text-green-600">{response.estimated_impact.effort}</p>
                    </div>
                  )}
                  {response.estimated_impact.expected_improvement && (
                    <div>
                      <span className="text-green-700 font-medium">Improvement:</span>
                      <p className="text-green-600">{response.estimated_impact.expected_improvement}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={() => setShowSuggestions(true)}
                className="btn-teal"
              >
                Make Another Wish
              </button>
              <button 
                onClick={() => setResponse(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <History className="w-4 h-4 inline mr-2" />
                Clear Response
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
