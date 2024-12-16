'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"

interface AnimatedPasswordInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  required?: boolean
  autoComplete?: string
  className?: string
}

export const AnimatedPasswordInput: React.FC<AnimatedPasswordInputProps> = ({
  value,
  onChange,
  id = 'password',
  required = false,
  autoComplete = 'new-password',
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isFocused && inputRef.current) {
      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }
  }, [isFocused, value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && showPassword) {
      e.preventDefault()
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="password"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`pr-10 ${className} ${showPassword ? 'text-transparent' : ''}`}
        required={required}
        autoComplete={autoComplete}
        style={{ caretColor: showPassword ? 'transparent' : 'auto' }}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
      <AnimatePresence>
        {showPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center pointer-events-none overflow-hidden pl-10"
          >
            {value.split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="text-base mx-[0.5px]"
              >
                {char}
              </motion.span>
            ))}
            {isFocused && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-[1px] h-5 bg-foreground ml-[1px]"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

