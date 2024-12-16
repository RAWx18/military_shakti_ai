"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from 'lucide-react';
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TechStackCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <motion.div
    className="bg-blue-900/40 backdrop-blur-sm rounded-2xl p-6 hover:bg-blue-900/50 transition-all duration-300"
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.95 }}
  >
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

export default function TechnologyStack() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f] relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <main className="container mx-auto px-4 py-20 relative z-10">
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-600 mb-8 text-center font-allerta relative z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          Technology Stack
          <motion.span
            className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-green-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.h1>

        <motion.h2 
          className="text-2xl font-bold text-white mt-8 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          Our Cutting-Edge Technologies
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="Vision Models" 
              description="DRISHTI Vision Model, OpenCV, YOLO for object detection and analysis." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="Text Processing & Tactical Models" 
              description="CHAKRAVYUHA tactical text model, RAG (Retrieval-Augmented Generation), and NLP pipelines." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="AI Frameworks" 
              description="AIRAVATA Framework for efficient pipeline management, training, and database handling." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="OCR & Document Analysis" 
              description="OCR for text extraction, PDF summarization, and document understanding." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="Multimodal AI" 
              description="Integrated text, image, and video analysis for holistic decision-making." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="Generative AI" 
              description="Transformer-based models for content generation and contextual storytelling." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="UI/UX Development" 
              description="React, Node.js, TypeScript, Tailwind CSS, ShadCN, and Framer Motion for dynamic interfaces." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="Deep Learning Frameworks" 
              description="TensorFlow, PyTorch for training and deploying AI models." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="Video Analysis" 
              description="Advanced video feed processing for real-time monitoring and analytics." 
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <TechStackCard 
              title="Real-Time Inference" 
              description="Optimized inference pipelines ensuring fast, accurate results." 
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Button asChild>
            <Link href="/about" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to About
            </Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

