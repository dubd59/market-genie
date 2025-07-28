import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Star } from 'lucide-react'

export default function GenieLamp({ onWishClick, isActive = false }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isGlowing, setIsGlowing] = useState(false)

  const handleClick = () => {
    setIsGlowing(true)
    setTimeout(() => setIsGlowing(false), 1000)
    onWishClick?.()
  }

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className={`relative cursor-pointer transition-all duration-300 ${
          isActive || isHovered ? 'scale-110' : 'scale-100'
        }`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
      >
        {/* Magical Glow Effect */}
        <AnimatePresence>
          {(isHovered || isActive || isGlowing) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full blur-lg"
            />
          )}
        </AnimatePresence>

        {/* Lamp Body */}
        <motion.div
          className={`relative z-10 w-12 h-12 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg ${
            isGlowing ? 'animate-pulse' : ''
          }`}
          animate={{
            boxShadow: isHovered || isActive
              ? '0 0 30px rgba(251, 191, 36, 0.8)'
              : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>

        {/* Floating Sparkles */}
        <AnimatePresence>
          {(isHovered || isActive) && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, (i - 1) * 20],
                    y: [0, -30 - i * 10]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                >
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Magical Wisp Effect */}
        <AnimatePresence>
          {isGlowing && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1.5, 2],
                rotate: [0, 180, 360]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full opacity-30"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap z-20"
          >
            Make a wish to your Marketing Genie
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
