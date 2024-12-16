'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowLeft, Briefcase } from 'lucide-react'
import { setCookie } from 'cookies-next'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from 'next/link'
import { AnimatedPasswordInput } from '@/components/animatePassword'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent, isLogin: boolean) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!isLogin && !name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name for signup.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/auth/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, position }),
      })
      const data = await response.json()

      if (response.ok) {
        setCookie('token', data.access_token)
        toast({
          title: isLogin ? "Login Successful" : "Signup Successful",
          description: "Redirecting to dashboard...",
        })
        router.push('/dashboard')
      } else {
        throw new Error(data.detail || 'An error occurred')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
      <Link href="/" className="absolute top-4 left-4 flex items-center text-white hover:text-purple-200 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full shadow-lg bg-white/10 backdrop-blur-md border-purple-500/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center text-white font-electrolize">
              Welcome
            </CardTitle>
            <CardDescription className="text-center text-base text-purple-200 font-electrolize">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setIsLogin(value === "login")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="login">
                    <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-purple-100">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 font-electrolize" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-white/20 text-white placeholder-black border-purple-500/50"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-purple-100">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 font-electrolize" />
                          <AnimatedPasswordInput
                            value={password}
                            onChange={setPassword}
                            className="pl-10 bg-white/20 text-white placeholder-black border-purple-500/50"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-electrolize" disabled={isLoading}>
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full"
                          />
                        ) : (
                          "Login"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="signup">
                    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-purple-100">Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 font-electrolize" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 bg-white/20 text-white placeholder-black border-purple-500/50"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position" className="text-purple-100">Position</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 font-electrolize" />
                          <Input
                            id="position"
                            type="text"
                            placeholder="Colonel"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="pl-10 bg-white/20 text-white placeholder-black border-purple-500/50"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-purple-100">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 font-electrolize" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-white/20 text-white placeholder-black border-purple-500/50"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-purple-100">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 font-electrolize" />
                          <AnimatedPasswordInput
                            value={password}
                            onChange={setPassword}
                            className="pl-10 bg-white/20 text-white placeholder-black border-purple-500/50"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-electrolize" disabled={isLoading}>
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full"
                          />
                        ) : (
                          "Sign Up"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

