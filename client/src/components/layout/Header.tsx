import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBox } from "@/components/ui/search-box";
import { buttonHover, microButtonHover, microSlideUp } from "@/lib/motion";
import { useAuth } from "@/hooks/use-auth";
import { User, LogOut } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // All navigation items are hidden in the header
  const navItems = [];
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <motion.div
                  className="mr-2 relative"
                  style={{ 
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <img 
                    src="/logo.png"
                    alt="Rebatrix Logo"
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                <span className="font-heading font-bold text-xl text-black">rebatrix</span>
              </Link>
            </div>
            
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 + 0.1 }}
                >
                  <Link 
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                      location === item.path
                        ? "border-black text-sm font-medium"
                        : "border-transparent text-sm font-medium text-black hover:text-black hover:border-black"
                    }`}
                  >
                    <motion.span 
                      whileHover={{ y: -1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {item.icon ? (
                        <motion.div 
                          className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full" 
                          title={item.label}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <i className={`${item.icon} text-lg`}></i>
                          <span className="sr-only">{item.label}</span>
                        </motion.div>
                      ) : item.name}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center">
            <SearchBox />
            
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                // Logged in state
                <div className="flex gap-3 items-center">
                  <Link href="/profile">
                    <motion.div 
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonHover}
                      className="relative"
                    >
                      <button 
                        type="button" 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-sm rounded-full border border-black hover:bg-gray-50 transition-colors"
                      >
                        <User size={14} />
                        <motion.span
                          initial={{ y: 0 }}
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.1 }}
                          className="max-w-[100px] truncate"
                        >
                          {user.email}
                        </motion.span>
                      </button>
                    </motion.div>
                  </Link>

                  <motion.div 
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonHover}
                    className="relative"
                  >
                    <button 
                      type="button" 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-sm rounded-full hover:bg-black/90 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      <motion.span
                        initial={{ y: 0 }}
                        whileHover={{ y: -1 }}
                        transition={{ duration: 0.1 }}
                      >
                        Logout
                      </motion.span>
                    </button>
                  </motion.div>
                </div>
              ) : (
                // Logged out state
                <div className="flex gap-2">
                  <Link href="/login">
                    <motion.div 
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonHover}
                      className="relative"
                    >
                      <button 
                        type="button" 
                        className="px-4 py-1.5 bg-black text-white text-sm rounded-full hover:bg-black transition-colors"
                      >
                        <motion.span
                          initial={{ y: 0 }}
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.1 }}
                        >
                          Login
                        </motion.span>
                      </button>
                    </motion.div>
                  </Link>
                  <Link href="/signup">
                    <motion.div 
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonHover}
                      className="relative"
                    >
                      <button 
                        type="button" 
                        className="px-4 py-1.5 bg-white text-black text-sm rounded-full border border-black hover:bg-gray-50 transition-colors"
                      >
                        <motion.span
                          initial={{ y: 0 }}
                          whileHover={{ y: -1 }}
                          transition={{ duration: 0.1 }}
                        >
                          Sign Up
                        </motion.span>
                      </button>
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="ml-3 -mr-2 flex md:hidden">
              <motion.button 
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-full text-black hover:text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={microButtonHover}
                animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="sr-only">Open main menu</span>
                <i className="ri-menu-line text-xl"></i>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="pt-2 pb-3 space-y-1"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.07, delayChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Link 
                    href={item.path}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      location === item.path
                        ? "border-black text-black bg-white"
                        : "border-transparent text-black hover:bg-black hover:text-white hover:border-black"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon ? (
                      <div className="flex items-center">
                        <motion.div 
                          className="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full mr-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <i className={`${item.icon} text-lg`}></i>
                        </motion.div>
                        <span>{item.label}</span>
                      </div>
                    ) : item.name}
                  </Link>
                </motion.div>
              ))}
              
              {user ? (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <button
                    className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black hover:bg-black hover:text-white hover:border-black"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Link 
                      href="/login"
                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black hover:bg-black hover:text-white hover:border-black"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Link 
                      href="/signup"
                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-black hover:bg-black hover:text-white hover:border-black"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
