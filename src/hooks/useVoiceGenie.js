import { useEffect, useCallback, useRef } from 'react'

export const useVoiceGenie = ({ onResult, onStart, onEnd, onError }) => {
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    
    // Configure recognition settings
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    // Event handlers
    recognition.onstart = () => {
      isListeningRef.current = true
      onStart?.()
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim()
      const confidence = event.results[0][0].confidence
      
      // Only process if confidence is reasonable
      if (confidence > 0.5) {
        onResult?.(transcript, confidence)
      } else {
        onError?.('Low confidence in speech recognition')
      }
    }

    recognition.onend = () => {
      isListeningRef.current = false
      onEnd?.()
    }

    recognition.onerror = (event) => {
      isListeningRef.current = false
      onError?.(event.error)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current && isListeningRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onResult, onStart, onEnd, onError])

  // Keyboard shortcut (Ctrl+V)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'v' && e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        if (!isListeningRef.current) {
          startListening()
        } else {
          stopListening()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      onError?.(error.message)
    }
  }, [onError])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return

    try {
      recognitionRef.current.stop()
    } catch (error) {
      console.error('Error stopping speech recognition:', error)
      onError?.(error.message)
    }
  }, [onError])

  return {
    startListening,
    stopListening,
    isSupported: !!recognitionRef.current
  }
}
