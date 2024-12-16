"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const phrases = [
  "Cutting-edge AI",
  "Unparalleled Security",
  "Customizable Solutions",
  "24/7 Expert Support",
  "Resource Efficiency",
  "Offline Capability"
]

export default function DynamicText() {
  const [currentPhrase, setCurrentPhrase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length)
    }, 2000) // Change phrase every 3 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-20 flex items-center justify-center overflow-hidden -ml-4">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentPhrase}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-purple-300 font-electrolize"
        >
          {phrases[currentPhrase]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

