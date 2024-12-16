"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, Zap, Sparkles } from 'lucide-react';
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineProject, AiOutlineTeam, AiFillRocket, AiFillThunderbolt } from "react-icons/ai";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface AboutCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const AboutCard: React.FC<AboutCardProps> = ({ href, title, description, icon, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        className={`bg-${color}-900/40 backdrop-blur-sm rounded-3xl p-8 h-full hover:bg-${color}-900/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden`}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r from-${color}-500/20 to-${color}-700/20`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <div className={`flex items-center mb-6 text-${color}-400 text-5xl relative z-10`}>
          {icon}
          <motion.div
            className="ml-2 w-8 h-8"
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4 relative z-10">{title}</h2>
        <p className="text-gray-300 relative z-10">{description}</p>
        <motion.div
          className="mt-4 text-sm text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          Click to explore more →
        </motion.div>
      </motion.div>
    </Link>
  );
};

const FunFact: React.FC = () => {
  const [fact, setFact] = useState("Did you know? Our AI can process over 1 million data points per second!");
  const facts = [
    "Did you know? Our AI can process over 1 million data points per second!",
    "Fun fact: Our team has a combined experience of over 100 years in AI and military intelligence!",
    "Wow! Our system has helped in over 500 successful missions worldwide!",
  ];

  const changeFact = () => {
    const newFact = facts[Math.floor(Math.random() * facts.length)];
    setFact(newFact);
  };

  return (
    <motion.div
      className="bg-indigo-900/40 backdrop-blur-sm rounded-3xl p-6 mt-8 text-center"
      whileHover={{ scale: 1.02 }}
    >
      <Quote className="text-indigo-400 mb-2 mx-auto" size={32} />
      <p className="text-white text-lg mb-4">{fact}</p>
      <Button onClick={changeFact} variant="outline" className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white">
        New Fun Fact <Zap className="ml-2" size={16} />
      </Button>
    </motion.div>
  );
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f] relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <main className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <motion.h1
            className="text-7xl font-bold text-white mb-4 font-allerta relative inline-block"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            ABOUT US
            <motion.span
              className="absolute -bottom-2 left-0 w-full h-1 bg-purple-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </motion.h1>
          <motion.p
            className="text-xl text-purple-300 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover the future of military intelligence
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <motion.div variants={fadeInUp}>
            <AboutCard
              href="/about/project"
              title="Project Insights"
              description="Dive deep into our cutting-edge military intelligence system. Explore its advanced AI capabilities, real-time data processing, and how it's revolutionizing decision-making on the battlefield."
              icon={<AiOutlineProject />}
              color="purple"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AboutCard
              href="/about/team"
              title="Meet Our Experts"
              description="Get to know the brilliant minds behind our innovation. Our team of AI specialists, military strategists, and data scientists are pushing the boundaries of what's possible in military intelligence."
              icon={<AiOutlineTeam />}
              color="blue"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AboutCard
              href="/about/technology"
              title="Technology Stack"
              description="Uncover the advanced technologies powering our platform. From machine learning algorithms to secure cloud infrastructure, learn how we're leveraging cutting-edge tech to keep our military ahead."
              icon={<AiFillRocket />}
              color="green"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <AboutCard
              href="/about/impact"
              title="Real-World Impact"
              description="Explore the tangible results of our system in action. Discover case studies, success stories, and the measurable impact we're making in enhancing military operations and saving lives."
              icon={<AiFillThunderbolt />}
              color="orange"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <FunFact />
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <Button asChild>
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105"
            >
              Back to Home
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}


// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Quote, Zap, Sparkles } from 'lucide-react';
// import Navbar from "@/components/Navbar";
// import ParticleBackground from "@/components/ParticleBackground";
// import { motion, AnimatePresence } from "framer-motion";
// import { AiOutlineProject, AiOutlineTeam, AiFillRocket, AiFillThunderbolt } from "react-icons/ai";

// const fadeInUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
// };

// interface AboutCardProps {
//   href: string;
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   color: string;
// }

// const AboutCard: React.FC<AboutCardProps> = ({ href, title, description, icon, color }) => {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <Link href={href}>
//       <motion.div
//         className={`bg-${color}-900/40 backdrop-blur-sm rounded-3xl p-8 h-full hover:bg-${color}-900/50 transition-all duration-300 transform hover:scale-105 relative overflow-hidden`}
//         whileHover={{ y: -5 }}
//         whileTap={{ scale: 0.95 }}
//         onHoverStart={() => setIsHovered(true)}
//         onHoverEnd={() => setIsHovered(false)}
//       >
//         <motion.div
//           className={`absolute inset-0 bg-gradient-to-r from-${color}-500/20 to-${color}-700/20`}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: isHovered ? 1 : 0 }}
//           transition={{ duration: 0.3 }}
//         />
//         <div className={`flex items-center mb-6 text-${color}-400 text-5xl relative z-10`}>
//           {icon}
//           <motion.div
//             className="ml-2 w-8 h-8"
//             animate={{ rotate: isHovered ? 360 : 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <Sparkles />
//           </motion.div>
//         </div>
//         <h2 className="text-2xl font-bold text-white mb-4 relative z-10">{title}</h2>
//         <p className="text-gray-300 relative z-10">{description}</p>
//         <motion.div
//           className="mt-4 text-sm text-white/70"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: isHovered ? 1 : 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           Click to explore more →
//         </motion.div>
//       </motion.div>
//     </Link>
//   );
// };

// const FunFact: React.FC = () => {
//   const [fact, setFact] = useState("Did you know? Our AI can process over 1 million data points per second!");
//   const facts = [
//     "Did you know? Our AI can process over 1 million data points per second!",
//     "Fun fact: Our team has a combined experience of over 100 years in AI and military intelligence!",
//     "Wow! Our system has helped in over 500 successful missions worldwide!",
//   ];

//   const changeFact = () => {
//     const newFact = facts[Math.floor(Math.random() * facts.length)];
//     setFact(newFact);
//   };

//   return (
//     <motion.div
//       className="bg-indigo-900/40 backdrop-blur-sm rounded-3xl p-6 mt-8 text-center"
//       whileHover={{ scale: 1.02 }}
//     >
//       <Quote className="text-indigo-400 mb-2 mx-auto" size={32} />
//       <p className="text-white text-lg mb-4">{fact}</p>
//       <Button onClick={changeFact} variant="outline" className="text-indigo-400 border-indigo-400 hover:bg-indigo-400 hover:text-white">
//         New Fun Fact <Zap className="ml-2" size={16} />
//       </Button>
//     </motion.div>
//   );
// };

// export default function AboutPage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f] relative overflow-hidden">
//       <ParticleBackground />
//       <Navbar />

//       <main className="container mx-auto px-4 py-20 relative z-10">
//         {/* Heading */}
//         <motion.div
//           className="text-center mb-16"
//           initial="hidden"
//           animate="visible"
//           variants={fadeInUp}
//         >
//           <motion.h1
//             className="text-7xl font-bold text-white mb-4 font-allerta relative inline-block"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, ease: "easeOut" }}
//           >
//             ABOUT US
//             <motion.span
//               className="absolute -bottom-2 left-0 w-full h-1 bg-purple-500"
//               initial={{ scaleX: 0 }}
//               animate={{ scaleX: 1 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//             />
//           </motion.h1>
//           <motion.p
//             className="text-xl text-purple-300 mt-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//           >
//             Discover the future of military intelligence
//           </motion.p>
//         </motion.div>

//         {/* Cards Section */}
//         <motion.div
//           className="grid md:grid-cols-2 gap-8"
//           initial="hidden"
//           animate="visible"
//           variants={{
//             hidden: { opacity: 0 },
//             visible: {
//               opacity: 1,
//               transition: {
//                 staggerChildren: 0.2,
//               },
//             },
//           }}
//         >
//           {/* About Project Card */}
//           <motion.div variants={fadeInUp}>
//             <AboutCard
//               href="/about/project"
//               title="Project Insights"
//               description="Dive deep into our cutting-edge military intelligence system. Explore its advanced AI capabilities, real-time data processing, and how it's revolutionizing decision-making on the battlefield."
//               icon={<AiOutlineProject />}
//               color="purple"
//             />
//           </motion.div>

//           {/* About Team Card */}
//           <motion.div variants={fadeInUp}>
//             <AboutCard
//               href="/about/team"
//               title="Meet Our Experts"
//               description="Get to know the brilliant minds behind our innovation. Our team of AI specialists, military strategists, and data scientists are pushing the boundaries of what's possible in military intelligence."
//               icon={<AiOutlineTeam />}
//               color="blue"
//             />
//           </motion.div>

//           {/* Technology Overview Card */}
//           <motion.div variants={fadeInUp}>
//             <AboutCard
//               href="/about/technology"
//               title="Technology Stack"
//               description="Uncover the advanced technologies powering our platform. From machine learning algorithms to secure cloud infrastructure, learn how we're leveraging cutting-edge tech to keep our military ahead."
//               icon={<AiFillRocket />}
//               color="green"
//             />
//           </motion.div>

//           {/* Impact and Results Card */}
//           <motion.div variants={fadeInUp}>
//             <AboutCard
//               href="/about/impact"
//               title="Real-World Impact"
//               description="Explore the tangible results of our system in action. Discover case studies, success stories, and the measurable impact we're making in enhancing military operations and saving lives."
//               icon={<AiFillThunderbolt />}
//               color="orange"
//             />
//           </motion.div>
//         </motion.div>

//         {/* Fun Fact Section */}
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeInUp}
//         >
//           <FunFact />
//         </motion.div>

//         {/* Back to Home Button */}
//         <motion.div
//           className="mt-16 text-center"
//           initial="hidden"
//           animate="visible"
//           variants={fadeInUp}
//         >
//           <Button asChild>
//             <Link
//               href="/"
//               className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full inline-flex items-center text-lg transition-all duration-300 transform hover:scale-105"
//             >
//               Back to Home
//               <ArrowRight className="ml-2 h-5 w-5" />
//             </Link>
//           </Button>
//         </motion.div>
//       </main>
//     </div>
//   );
// }




