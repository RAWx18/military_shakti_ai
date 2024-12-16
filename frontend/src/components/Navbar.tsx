// "use client";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Github, Menu } from "lucide-react";
// import { useState } from "react";
// import { motion } from "framer-motion";

// export default function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <header className="bg-gradient-to-r from-purple-800 to-purple-900 shadow-lg sticky top-0 z-50">
//       <div className="container mx-auto px-4 py-4">
//         <nav className="flex items-center justify-between">
//           {/* Logo with Framer Motion Effect */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.6 }}
//           >
//             <Link
//               href="/"
//               className="text-white text-2xl font-bold tracking-tighter hover:opacity-90 transition-opacity"
//             >
//               BEGANS
//             </Link>
//           </motion.div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             <NavLink href="/dashboard">Dashboard</NavLink>
//             <NavLink href="/auth">Login</NavLink>
//             <NavLink href="/about">About</NavLink>
//           </div>

//           {/* Right Actions */}
//           <div className="flex items-center space-x-4">
//             {/* GitHub Link */}
//             <Link
//               href="https://github.com"
//               className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:shadow-lg transition-all hover:pr-5 text-sm font-medium"
//             >
//               <Github className="mr-2 h-4 w-4" />
//               <span>GitHub</span>
//             </Link>

//             {/* Mobile Menu Button */}
//             <Button
//               className="md:hidden"
//               variant="ghost"
//               size="icon"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               <Menu className="h-6 w-6 text-white" />
//             </Button>
//           </div>
//         </nav>

//         {/* Mobile Dropdown */}
//         {isMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="md:hidden mt-4 bg-purple-900/60 backdrop-blur-md rounded-lg p-4"
//           >
//             <div className="flex flex-col space-y-4">
//               <NavLink href="/dashboard">Dashboard</NavLink>
//               <NavLink href="/auth">Login</NavLink>
//               <NavLink href="/about">About</NavLink>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </header>
//   );
// }

// function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
//   return (
//     <Link
//       href={href}
//       className="text-gray-200 hover:text-white transition-colors text-base font-medium relative group font-allerta p-3 rounded-lg border-2 border-transparent hover:border-purple-500"
//     >
//       {children}
//       <span className="absolute inset-x-0 -bottom-1 h-[2px] bg-gradient-to-r from-purple-500 to-purple-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
//     </Link>
//   );
// }

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Menu } from 'lucide-react';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    position: '',
    avatarUrl: '',
  });
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = getCookie('token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await fetch('http://localhost:8000/api/user', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = () => {
    deleteCookie('token');
    setIsLoggedIn(false);
    setUser({
      name: '',
      email: '',
      position: '',
      avatarUrl: '',
    });
    router.push('/auth');
  };

  return (
    <header className="bg-gradient-to-r from-purple-800 to-purple-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo with Framer Motion Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link
              href="/"
              className="text-white text-2xl font-bold tracking-tighter hover:opacity-90 transition-opacity"
            >
              BEGANS
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/dashboard">Dashboard</NavLink>
            {!isLoggedIn && <NavLink href="/auth">Login</NavLink>}
            <NavLink href="/about">About</NavLink>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* GitHub Link */}
            <Link
              href="https://github.com"
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:shadow-lg transition-all hover:pr-5 text-sm font-medium"
            >
              <Github className="mr-2 h-4 w-4" />
              <span>GitHub</span>
            </Link>

            {/* User Profile Dropdown (if logged in) */}
            {isLoggedIn ? (
              <UserProfileDropdown user={user} onLogout={handleLogout} />
            ) : (
              <NavLink href="/auth">Login</NavLink>
            )}

            {/* Mobile Menu Button */}
            <Button
              className="md:hidden"
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 bg-purple-900/60 backdrop-blur-md rounded-lg p-4"
            >
              <div className="flex flex-col space-y-4">
                <NavLink href="/dashboard">Dashboard</NavLink>
                {!isLoggedIn && <NavLink href="/auth">Login</NavLink>}
                <NavLink href="/about">About</NavLink>
                {isLoggedIn && (
                  <div className="pt-2 border-t border-purple-700">
                    <div className="flex items-center space-x-3">
                      <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-purple-300 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:text-red-300 mt-2"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-200 hover:text-white transition-colors text-base font-medium relative group font-allerta p-3 rounded-lg border-2 border-transparent hover:border-purple-500"
    >
      {children}
      <span className="absolute inset-x-0 -bottom-1 h-[2px] bg-gradient-to-r from-purple-500 to-purple-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out" />
    </Link>
  );
}






