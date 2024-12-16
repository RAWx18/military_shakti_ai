"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from 'lucide-react';
import { AiFillSafetyCertificate, AiFillThunderbolt, AiFillTag, AiFillEnvironment, AiFillTrophy, AiFillHeart, AiFillAlert, AiFillEye, AiFillBulb, AiFillSetting, AiFillFile, AiFillEyeInvisible, } from "react-icons/ai";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ImpactCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <motion.div
    className="bg-orange-900/40 backdrop-blur-sm rounded-2xl p-6 hover:bg-orange-900/50 transition-all duration-300"
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="text-orange-400 text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

export default function RealWorldImpact() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f] relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <main className="container mx-auto px-4 py-20 relative z-10">
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-8 text-center font-allerta relative z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          Real-World Impact
          <motion.span
            className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.h1>

        <motion.div
          className="grid md:grid-cols-2 gap-8 mb-12"
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
  <ImpactCard
    title="Situational Awareness"
    description="Provides real-time insights on battlefields by analyzing drone footage for tactical advantages."
    icon={<AiFillEye />}
  />
</motion.div>
<motion.div variants={fadeInUp}>
  <ImpactCard
    title="Threat Identification"
    description="Accurately detects enemy assets, camouflaged positions, and hidden threats using advanced object detection and OCR."
    icon={<AiFillAlert />}
  />
</motion.div>
<motion.div variants={fadeInUp}>
  <ImpactCard
    title="Tactical Decision Support"
    description="Generates actionable strategies by processing multi-modal inputs like images, text, and environmental conditions."
    icon={<AiFillBulb />}
  />
</motion.div>
<motion.div variants={fadeInUp}>
  <ImpactCard
    title="Resource Optimization"
    description="Efficiently operates on low-resource systems, ensuring continuity during critical system failures or resource scarcity."
    icon={<AiFillSetting />}
  />
</motion.div>
<motion.div variants={fadeInUp}>
  <ImpactCard
    title="Intelligence Reporting"
    description="Summarizes operational data from PDFs and images into concise intelligence briefs for rapid communication."
    icon={<AiFillFile />}
  />
</motion.div>
<motion.div variants={fadeInUp}>
  <ImpactCard
    title="Camouflage Detection"
    description="Enhances recognition of obscured targets through multi-attention models analyzing complex terrains."
    icon={<AiFillEyeInvisible />}
  />
</motion.div>
<motion.div variants={fadeInUp}>
  <ImpactCard
    title="Collaborative Mission Planning"
    description="Enables multi-team coordination by seamlessly sharing mission-critical data across units."
    icon={<AiFillTag />}
  />
</motion.div>
<motion.div variants={fadeInUp}>
  <ImpactCard
    title="Disaster Relief Assistance"
    description="Supports humanitarian missions by identifying survivors, analyzing terrains, and streamlining logistics."
    icon={<AiFillEnvironment />}
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
            <Link href="/about" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to About
            </Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
