"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Cpu, Shield, Map, TrendingUp, Zap, Video, BarChart, Users, MemoryStick, Terminal, Brain, Clock, Eye, Camera, Settings, Calculator, Workflow, CheckCircle } from 'lucide-react'
import Navbar from "@/components/Navbar"
import { motion } from "framer-motion"
import TechStackCard from "@/app/about/project/TechStackCard"
import FeatureCard from "@/app/about/project/FeatureCard"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function ProjectAboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f]">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Link 
            href="/about"
            className="inline-flex items-center text-purple-300 hover:text-purple-200 mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to About
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto">
        <motion.h1 
  className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 text-center font-allerta relative z-10"
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    type: "spring",
    stiffness: 100,
    damping: 15,
    delay: 0.2 
  }}
>
  Project Overview
  <motion.span
    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-600"
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: 0.8, delay: 0.5 }}
  />
</motion.h1>


          
          <motion.div 
            className="bg-purple-900/40 backdrop-blur-sm rounded-3xl p-8 space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300">
              We present SHAKTI (Strategic Handling and Knowledge of Tactical Intelligence), an advanced
multimodal Large Language Model (MLLM) tailored for military tactical response through AI-
powered image conversational capabilities. SHAKTI integrates cutting-edge vision-language mod-
eling to perform complex military tasks, such as real-time reasoning, decision-making, and scene
understanding. 
              </p>

              {/* <motion.h2 
                className="text-2xl font-bold text-white mt-8 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                Technology Stack
              </motion.h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
  <TechStackCard 
    title="Vision Models" 
    description="DRISHTI Vision Model, OpenCV, YOLO for object detection and analysis." 
  />
  <TechStackCard 
    title="Text Processing & Tactical Models" 
    description="CHAKRAVYUHA tactical text model, RAG (Retrieval-Augmented Generation), and NLP pipelines." 
  />
  <TechStackCard 
    title="AI Frameworks" 
    description="AIRAVATA Framework for efficient pipeline management, training, and database handling." 
  />
  <TechStackCard 
    title="OCR & Document Analysis" 
    description="OCR for text extraction, PDF summarization, and document understanding." 
  />
  <TechStackCard 
    title="Multimodal AI" 
    description="Integrated text, image, and video analysis for holistic decision-making." 
  />
  <TechStackCard 
    title="Generative AI" 
    description="Transformer-based models for content generation and contextual storytelling." 
  />
  <TechStackCard 
    title="UI/UX Development" 
    description="React, Node.js, TypeScript, Tailwind CSS, ShadCN, and Framer Motion for dynamic interfaces." 
  />
  <TechStackCard 
    title="Deep Learning Frameworks" 
    description="TensorFlow, PyTorch for training and deploying AI models." 
  />
  <TechStackCard 
    title="Video Analysis" 
    description="Advanced video feed processing for real-time monitoring and analytics." 
  />
  <TechStackCard 
    title="Real-Time Inference" 
    description="Optimized inference pipelines ensuring fast, accurate results." 
  />
</div> */}
              
              <motion.h2 
                className="text-2xl font-bold text-white mt-8 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                Key Features
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  <FeatureCard 
    icon={Cpu} 
    title="Story Utilization & Decryption" 
    description="Generates context-aware stories using code, words, and symbols with decryption capabilities." 
  />
  <FeatureCard 
    icon={MemoryStick} 
    title="Optimized VRAM Usage" 
    description="Highly optimized model requires only 6GB VRAM due to minimal parameters and optimizations." 
  />
  <FeatureCard 
    icon={Terminal} 
    title="Linux Setup" 
    description="POP_OS ensures ease of setup and cross-OS compatibility." 
  />
  <FeatureCard 
    icon={BarChart} 
    title="High FPS & Efficiency" 
    description="Maintains high FPS with minimal fan usage, ideal for emergency operations." 
  />
  <FeatureCard 
    icon={Clock} 
    title="Extended Runtime" 
    description="Runs locally with minimal requirements, sustaining operations during hardware failures." 
  />
  <FeatureCard 
    icon={Eye} 
    title="Enhanced Camouflage Detection" 
    description="Uses multiple attention mechanisms for better parallel processing of image and text." 
  />
  <FeatureCard 
    icon={Camera} 
    title="OCR & Object Detection" 
    description="Features OCR, emotional recognition, and advanced object detection." 
  />
  <FeatureCard 
    icon={Settings} 
    title="Low Resource Adaptability" 
    description="Shadows modules dynamically to ensure performance on low-resource PCs." 
  />
  <FeatureCard 
    icon={Calculator} 
    title="Precision Flexibility" 
    description="Adjustable floating-point precision to balance accuracy and performance." 
  />
  <FeatureCard 
    icon={Workflow} 
    title="Dynamic Workload" 
    description="Modifiable work token quantity reduces load on the model during high-demand scenarios." 
  />
  <FeatureCard 
    icon={Brain} 
    title="Superior Reasoning" 
    description="Offers exceptional reasoning and tactical capabilities, outperforming competitors." 
  />
  <FeatureCard 
    icon={CheckCircle} 
    title="Rigorous Validation" 
    description="Validated across six testing stages for comprehensive military scenarios." 
  />
  <FeatureCard 
    icon={TrendingUp} 
    title="Efficiency Metrics" 
    description="Optimized inference time, time complexity, and space complexity." 
  />
  <FeatureCard 
    icon={Zap} 
    title="Tokens Per Second" 
    description="Efficient token processing ensures real-time performance in critical situations." 
  />
</div>


             


              <motion.div 
                className="mt-8 pt-8 border-t border-purple-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                {/* <div className="flex items-center">
                  <img
                    src="/placeholder.svg?height=48&width=48"
                    alt="Matt Zhang"
                    className="rounded-full w-12 h-12"
                  />
                  <div className="ml-4">
                    <p className="text-white font-medium">Matt Zhang</p>
                    <p className="text-sm text-gray-400">CEO at Borcelle</p>
                  </div>
                </div> */}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

