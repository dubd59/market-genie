import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Sparkles } from 'lucide-react'
import { useGenie } from '../../contexts/GenieContext'
import { useVoiceGenie } from '../../hooks/useVoiceGenie'
import toast from 'react-hot-toast'

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const { grantWish, isProcessing } = useGenie()

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const handleVoiceResult = async (transcript) => {
    setIsListening(false)
    
    if (transcript.trim()) {
      toast.success(`🧞‍♂️ Heard: "${transcript}"`)
      await grantWish({
        text: transcript,
        type: 'voice_command',
        source: 'voice'
      })
    }
  }

  const { startListening, stopListening } = useVoiceGenie({
    onResult: handleVoiceResult,
    onStart: () => setIsListening(true),
    onEnd: () => setIsListening(false),
    onError: (error) => {
      setIsListening(false)
      toast.error('Voice recognition failed. Try again!')
      console.error('Speech recognition error:', error)
    }
  })

  const handleClick = () => {
    if (isProcessing) return
    
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Listen for global voice toggle event
  useEffect(() => {
    const handleToggleVoice = () => {
      if (!isListening && !isProcessing) {
        startListening()
      }
    }

    window.addEventListener('toggle-voice', handleToggleVoice)
    return () => window.removeEventListener('toggle-voice', handleToggleVoice)
  }, [isListening, isProcessing, startListening])

  if (!isSupported) {
    return null // Hide if not supported
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        disabled={isProcessing}
        className={`
          fixed bottom-6 right-6 z-50
          w-16 h-16 rounded-full
          flex items-center justify-center
          text-white font-medium text-sm
          shadow-lg border-2 border-white/20
          transition-all duration-300 ease-in-out
          ${isListening 
            ? 'voice-listening bg-gradient-to-r from-orange-400 to-orange-500' 
            : isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'voice-active bg-gradient-to-r from-teal-400 to-teal-500 hover:shadow-xl'
          }
        `}
        title={
          isProcessing 
            ? 'Processing your wish...' 
            : isListening 
            ? 'Listening... Speak your wish!' 
            : 'Click to speak your marketing wish'
        }
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
            >
              <Sparkles className="w-6 h-6 animate-spin" />
            </motion.div>
          ) : isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative"
            >
              <Mic className="w-6 h-6" />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center"
            >
              <Mic className="w-6 h-6" />
              <span className="text-xs mt-1 hidden">🧞‍♂️</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulsing rings when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 pointer-events-none"
          >
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 rounded-full border-2 border-orange-400"
                animate={{
                  scale: [1, 2, 3],
                  opacity: [0.8, 0.4, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: ring * 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="fixed bottom-24 right-6 z-40 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-75 pointer-events-none"
      >
        Ctrl+V to speak
      </motion.div>
    </AnimatePresence>
  )
}
