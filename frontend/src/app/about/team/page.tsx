'use client'

import { useState } from 'react'
import Link from "next/link"
import { ArrowRight, ArrowLeft, Quote, Linkedin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import ParticleBackground from '@/components/ParticleBackground'

const teamMembers = [
  
  { 
    name: "Ryan Madhuwala", 
    contribution: "Team Leader", 
    image: "/ryan.jpeg", 
    quote: "Innovating for the future of defense technology.",
    linkedin: "https://linkedin.com/in/ryanmadhuwala/"
  },

  { 
    name: "Anukrati Chaturvedi", 
    contribution: "Team Member", 
    image: "/anu.jpg", 
    quote: "Dedicated to advancing military intelligence systems.",
    linkedin: "https://www.linkedin.com/in/anukrati-chaturvedi-948572288/"
  },
  { 
    name: "Ronit Raj", 
    contribution: "Team Member", 
    image: "/ronit.jpg", 
    quote: "Pushing the boundaries of AI in military applications.",
    linkedin: "https://www.linkedin.com/in/ronit-raj-662485225/"
  },
  { 
    name: "Murtuza Shaikh", 
    contribution: "Team Member", 
    image: "/murtuza.jpg", 
    quote: "Committed to enhancing military intelligence capabilities.",
    linkedin: "https://www.linkedin.com/in/murtuza-shaikh-2167b0295/"
  },
  { 
    name: "Udit Shrivastava", 
    contribution: "Team Member", 
    image: "/udit.jpg", 
    quote: "Developing cutting-edge solutions for defense.",
    linkedin: "https://www.linkedin.com/in/udit2303/"
  },
  { 
    name: "Kushal Trivedi", 
    contribution: "Team Member", 
    image: "/kushal.jpg", 
    quote: "Striving for excellence in military tech innovation.",
    linkedin: "https://www.linkedin.com/in/kushal-trivedi-16421a210/"
  },
]

export default function TeamCarouselPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const navigateTeam = (newDirection: 'prev' | 'next') => {
    setDirection(newDirection === 'next' ? 1 : -1)
    if (newDirection === 'prev') {
      setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : teamMembers.length - 1))
    } else {
      setCurrentIndex((prevIndex) => (prevIndex < teamMembers.length - 1 ? prevIndex + 1 : 0))
    }
  }

  const currentMember = teamMembers[currentIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f] overflow-hidden">
      <Navbar />
      <ParticleBackground />
      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div 
          className="bg-purple-900/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          {/* Navigation Arrows */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
            <motion.button 
              onClick={() => navigateTeam('prev')}
              className="p-2 hover:bg-purple-900/30 rounded-full transition-colors pointer-events-auto"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous team member"
            >
              <ArrowLeft className="h-6 w-6 text-white/70 hover:text-white" />
            </motion.button>
            <motion.button 
              onClick={() => navigateTeam('next')}
              className="p-2 hover:bg-purple-900/30 rounded-full transition-colors pointer-events-auto"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next team member"
            >
              <ArrowRight className="h-6 w-6 text-white/70 hover:text-white" />
            </motion.button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 * direction }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8 relative z-10"
            >
              <motion.div 
                className="text-purple-400/60"
                initial={{ rotate: 180 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Quote className="h-24 w-24 mx-auto" />
              </motion.div>

              <motion.p 
                className="text-white text-xl md:text-2xl max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {currentMember.quote}
              </motion.p>

              <motion.div 
                className="pt-8 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <motion.div 
                  className="relative w-24 h-24 mx-auto"
                  whileHover={{ scale: 1.1 }}
                >
                  <img
                    src={currentMember.image}
                    alt={currentMember.name}
                    className="rounded-full w-full h-full object-cover"
                  />
                </motion.div>
                
                <div className="space-y-2">
                  <p className="text-white font-medium text-lg">{currentMember.name}</p>
                  <p className="text-purple-200/80 text-sm">{currentMember.contribution}</p>
                </div>

                <div className="flex justify-center space-x-4 pt-2">
                  <motion.a 
                    href={currentMember.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-purple-300 transition-colors"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`${currentMember.name}'s LinkedIn`}
                  >
                    <Linkedin className="h-6 w-6" />
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {teamMembers.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/30'}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index === currentIndex ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

