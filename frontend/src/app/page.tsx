'use client';

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Eye, Cpu, BarChart, Map, Users, Video, Server, Lock } from 'lucide-react';
import { getCookie } from "cookies-next";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import DynamicText from "@/components/ui/dynamicText";

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const keyFeaturesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function checkUser() {
      const token = getCookie("token");
      const res = await fetch("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setIsLogin(true);
      }
      setIsLoading(false);
    }
    checkUser();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const scrollToKeyFeatures = () => {
    keyFeaturesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f] text-white">
      <Navbar />
      
      {/* New Banner Section */}
      <div className="bg-purple-800 text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm sm:text-base mb-2 sm:mb-0">
            Welcome to the next generation of artificial intelligence
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={scrollToKeyFeatures}
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 sm:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#1a0f2e] to-[#31195f] text-white relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl mb-10 sm:mb-20"
        >
          {/* Background Effect */}
          <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-lg" style={{ backgroundImage: 'url(/hero-background.jpg)' }}></div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
            {/* Left Section */}
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-block px-4 py-2 rounded-full bg-purple-700/50 text-purple-100 backdrop-blur-sm text-sm border border-purple-500/20">
                Advanced Military Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-allerta">
                Military Intelligence System
              </h1>
              <div className="relative">
                <DynamicText />
              </div>
              <p className="text-base sm:text-lg text-purple-100 leading-relaxed max-w-xl font-electrolize">
                Empower your military operations with our cutting-edge AI-driven intelligence system.
                Analyze drone imagery, detect objects in real-time, and gain tactical insights for
                enhanced decision-making.
              </p>

              <div className="flex flex-wrap gap-4">
                {isLogin ? (
                  <Button
                    asChild
                    className="group inline-flex items-center px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 text-base sm:text-lg shadow-lg hover:shadow-xl"
                  >
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="group inline-flex items-center px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 text-base sm:text-lg shadow-lg hover:shadow-xl"
                  >
                    <Link href="/auth" className="flex items-center">
                      Login
                      <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="relative mt-8 md:mt-0">
              <img
                src="/shakti1.jpg"
                alt="Military Intelligence Interface"
                className="rounded-2xl w-full object-cover shadow-2xl shadow-purple-950/50"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent rounded-2xl flex items-end justify-around p-4 sm:p-6">
                <FeatureCard icon={Shield} title="Secure" description="End-to-end encryption" />
                <FeatureCard icon={Eye} title="Precise" description="99.9% accuracy" />
                <FeatureCard icon={Cpu} title="AI-Powered" description="Advanced algorithms" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full border-t-4 border-purple-500 w-16 h-16"></div>
          </div>
        )}

        <motion.section
          ref={keyFeaturesRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-20"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Key Features</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureBox
              icon={BarChart}
              title="Real-time Analytics"
              description="Get instant insights from your data with our powerful analytics engine."
            />
            <FeatureBox
              icon={Map}
              title="Geospatial Intelligence"
              description="Visualize and analyze geographical data for strategic planning."
            />
            <FeatureBox
              icon={Users}
              title="Collaborative Platform"
              description="Work seamlessly with your team in a secure, shared environment."
            />
            <FeatureBox
              icon={Video}
              title="Video Detection"
              description="Support for real-time video detection and analysis."
            />
            <FeatureBox
              icon={Server}
              title="Lightweight"
              description="Runs efficiently on a single machine with minimal resources."
            />
            <FeatureBox
              icon={Lock}
              title="Offline Operation"
              description="Operates completely offline for enhanced security."
            />
          </div>
        </motion.section>

        {/* Why Choose Us Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-purple-700 via-indigo-800 to-indigo-900 p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl mb-10 sm:mb-20 backdrop-blur-lg"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-12 tracking-tight">
            Why Choose Us?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            <WhyChooseUsCard
              title="Cutting-edge Technology"
              description="Our system leverages the latest advancements in AI and machine learning to provide you with the most accurate and up-to-date intelligence."
            />
            <WhyChooseUsCard
              title="Unparalleled Security"
              description="We prioritize the security of your data with military-grade encryption and advanced access control measures."
            />
            <WhyChooseUsCard
              title="Customizable Solutions"
              description="Our platform is highly adaptable, allowing you to tailor the system to your specific needs and requirements."
            />
            <WhyChooseUsCard
              title="24/7 Support"
              description="Our dedicated team of experts is always available to provide support and ensure smooth operation of your intelligence system."
            />
            <WhyChooseUsCard
              title="Resource Efficient"
              description="Our system is lightweight and can run on a single machine with minimal resources."
            />
            <WhyChooseUsCard
              title="Offline Capability"
              description="Operates completely offline, ensuring your data remains secure and private."
            />
          </div>
        </motion.section>

        {/* Final Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Ready to Elevate Your Intelligence Capabilities?</h2>
          {isLogin ? (
            <Button
              asChild
              className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 sm:hover:pr-9 text-base sm:text-lg shadow-lg hover:shadow-xl"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 sm:hover:pr-9 text-base sm:text-lg shadow-lg hover:shadow-xl"
            >
              <Link href="/auth">
                Login
                <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
              </Link>
            </Button>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="text-center">
      <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-purple-300" />
      <h3 className="font-semibold text-sm sm:text-lg">{title}</h3>
      <p className="text-xs sm:text-sm text-purple-200">{description}</p>
    </div>
  );
}

function FeatureBox({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-purple-900/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center hover:bg-purple-900/60 transition-colors">
      <Icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-purple-400" />
      <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-purple-100">{description}</p>
    </div>
  );
}

function WhyChooseUsCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4 hover:scale-105 transition-all duration-300 ease-in-out bg-purple-800/50 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 relative">
        {title}
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-400 to-purple-500 mt-2"></span>
      </h3>
      <p className="text-lg text-purple-100">{description}</p>
    </div>
  );
}





// 'use client';

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { ArrowRight, Shield, Eye, Cpu, BarChart, Map, Users, Video, Server, Lock } from 'lucide-react';
// import { getCookie } from "cookies-next";
// import Navbar from "@/components/Navbar";
// import { Button } from "@/components/ui/button";
// import DynamicText from "@/components/ui/dynamicText";

// export default function HomePage() {
//   const [isLogin, setIsLogin] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     async function checkUser() {
//       const token = getCookie("token");
//       const res = await fetch("http://localhost:8000/api/user", {
//         headers: {
//           Authorization: Bearer ${token}
//         }
//       });
//       if (res.ok) {
//         setIsLogin(true);
//       }
//       setIsLoading(false);
//     }
//     checkUser();
//   }, []);

//   const fadeInUp = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] to-[#31195f] text-white">
//       <Navbar />
      
//       {/* New Banner Section */}
//       <div className="bg-purple-800 text-white py-4 px-4 sm:px-6 lg:px-8">
//         <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
//           <p className="text-sm sm:text-base mb-2 sm:mb-0 font-electrolize">
//             Welcome to the next generation of artificial intelligence
//           </p>
//           <Button variant="outline" size="sm" className="text-white border-white hover:bg-purple-700 font-electrolize">
//             Learn More
//           </Button>
//         </div>
//       </div>

//       <main className="container mx-auto px-4 py-6 sm:py-10">
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           variants={fadeInUp}
//           transition={{ duration: 0.5 }}
//           className="bg-gradient-to-br from-[#1a0f2e] to-[#31195f] text-white relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-12 shadow-xl mb-10 sm:mb-20"
//         >
//           {/* Background Effect */}
//           <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-lg" style={{ backgroundImage: 'url(/hero-background.jpg)' }}></div>
          
//           <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center relative z-10">
//             {/* Left Section */}
//             <div className="space-y-6 sm:space-y-8">
//               <div className="inline-block px-4 py-2 rounded-full bg-purple-700/50 text-purple-100 backdrop-blur-sm text-sm border border-purple-500/20">
//                 Advanced Military Intelligence
//               </div>
//               <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight font-allerta">
//                 Military Intelligence System
//               </h1>
//               <div className="relative">
//                 <DynamicText />
//               </div>
//               <p className="text-base sm:text-lg text-purple-100 leading-relaxed max-w-xl font-electrolize">
//                 Empower your military operations with our cutting-edge AI-driven intelligence system.
//                 Analyze drone imagery, detect objects in real-time, and gain tactical insights for
//                 enhanced decision-making.
//               </p>

//               <div className="flex flex-wrap gap-4">
//                 {isLogin ? (
//                   <Button
//                     asChild
//                     className="group inline-flex items-center px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 text-base sm:text-lg shadow-lg hover:shadow-xl"
//                   >
//                     <Link href="/dashboard">
//                       Go to Dashboard
//                       <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
//                     </Link>
//                   </Button>
//                 ) : (
//                   <Button
//                     asChild
//                     className="group inline-flex items-center px-6 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 text-base sm:text-lg shadow-lg hover:shadow-xl"
//                   >
//                     <Link href="/auth" className="flex items-center">
//                       Login
//                       <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
//                     </Link>
//                   </Button>
//                 )}
//               </div>
//             </div>

//             {/* Right Section */}
//             <div className="relative mt-8 md:mt-0">
//               <img
//                 src="/shakti1.jpg"
//                 alt="Military Intelligence Interface"
//                 className="rounded-2xl w-full object-cover shadow-2xl shadow-purple-950/50"
//               />

//               <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent rounded-2xl flex items-end justify-around p-4 sm:p-6">
//                 <FeatureCard icon={Shield} title="Secure" description="End-to-end encryption" />
//                 <FeatureCard icon={Eye} title="Precise" description="99.9% accuracy" />
//                 <FeatureCard icon={Cpu} title="AI-Powered" description="Advanced algorithms" />
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Loading Spinner */}
//         {isLoading && (
//           <div className="flex justify-center items-center py-8">
//             <div className="animate-spin rounded-full border-t-4 border-purple-500 w-16 h-16"></div>
//           </div>
//         )}

//         <motion.section
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           variants={fadeInUp}
//           transition={{ duration: 0.5 }}
//           className="mb-10 sm:mb-20"
//         >
//           <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Key Features</h2>
//           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
//             <FeatureBox
//               icon={BarChart}
//               title="Real-time Analytics"
//               description="Get instant insights from your data with our powerful analytics engine."
//             />
//             <FeatureBox
//               icon={Map}
//               title="Geospatial Intelligence"
//               description="Visualize and analyze geographical data for strategic planning."
//             />
//             <FeatureBox
//               icon={Users}
//               title="Collaborative Platform"
//               description="Work seamlessly with your team in a secure, shared environment."
//             />
//             <FeatureBox
//               icon={Video}
//               title="Video Detection"
//               description="Support for real-time video detection and analysis."
//             />
//             <FeatureBox
//               icon={Server}
//               title="Lightweight"
//               description="Runs efficiently on a single machine with minimal resources."
//             />
//             <FeatureBox
//               icon={Lock}
//               title="Offline Operation"
//               description="Operates completely offline for enhanced security."
//             />
//           </div>
//         </motion.section>

//         {/* Why Choose Us Section */}
//         <motion.section
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           variants={fadeInUp}
//           transition={{ duration: 0.7 }}
//           className="bg-gradient-to-r from-purple-700 via-indigo-800 to-indigo-900 p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl mb-10 sm:mb-20 backdrop-blur-lg"
//         >
//           <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-12 tracking-tight">
//             Why Choose Us?
//           </h2>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
//             <WhyChooseUsCard
//               title="Cutting-edge Technology"
//               description="Our system leverages the latest advancements in AI and machine learning to provide you with the most accurate and up-to-date intelligence."
//             />
//             <WhyChooseUsCard
//               title="Unparalleled Security"
//               description="We prioritize the security of your data with military-grade encryption and advanced access control measures."
//             />
//             <WhyChooseUsCard
//               title="Customizable Solutions"
//               description="Our platform is highly adaptable, allowing you to tailor the system to your specific needs and requirements."
//             />
//             <WhyChooseUsCard
//               title="24/7 Support"
//               description="Our dedicated team of experts is always available to provide support and ensure smooth operation of your intelligence system."
//             />
//             <WhyChooseUsCard
//               title="Resource Efficient"
//               description="Our system is lightweight and can run on a single machine with minimal resources."
//             />
//             <WhyChooseUsCard
//               title="Offline Capability"
//               description="Operates completely offline, ensuring your data remains secure and private."
//             />
//           </div>
//         </motion.section>

//         {/* Final Section */}
//         <motion.section
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           variants={fadeInUp}
//           transition={{ duration: 0.5 }}
//           className="text-center"
//         >
//           <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Ready to Elevate Your Intelligence Capabilities?</h2>
//           {isLogin ? (
//             <Button
//               asChild
//               className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 sm:hover:pr-9 text-base sm:text-lg shadow-lg hover:shadow-xl"
//             >
//               <Link href="/dashboard">
//                 Go to Dashboard
//                 <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
//               </Link>
//             </Button>
//           ) : (
//             <Button
//               asChild
//               className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:pr-7 sm:hover:pr-9 text-base sm:text-lg shadow-lg hover:shadow-xl"
//             >
//               <Link href="/auth">
//                 Login
//                 <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
//               </Link>
//             </Button>
//           )}
//         </motion.section>
//       </main>
//     </div>
//   );
// }

// function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
//   return (
//     <div className="text-center">
//       <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-purple-300" />
//       <h3 className="font-semibold text-sm sm:text-lg">{title}</h3>
//       <p className="text-xs sm:text-sm text-purple-200">{description}</p>
//     </div>
//   );
// }

// function FeatureBox({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
//   return (
//     <div className="bg-purple-900/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center hover:bg-purple-900/60 transition-colors">
//       <Icon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-purple-400" />
//       <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
//       <p className="text-sm sm:text-base text-purple-100">{description}</p>
//     </div>
//   );
// }

// function WhyChooseUsCard({ title, description }: { title: string; description: string }) {
//   return (
//     <div className="space-y-4 hover:scale-105 transition-all duration-300 ease-in-out bg-purple-800/50 p-6 rounded-lg shadow-lg">
//       <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3 relative">
//         {title}
//         <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-400 to-purple-500 mt-2"></span>
//       </h3>
//       <p className="text-lg text-purple-100">{description}</p>
//     </div>
//   );
// }