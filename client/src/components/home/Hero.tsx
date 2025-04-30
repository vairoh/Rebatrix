import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { fadeIn, buttonHover, microSlideUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative bg-black overflow-hidden min-h-[70vh] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <motion.div 
          className="text-center mb-10"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            <span className="block mb-2">The B2B Marketplace for</span>
            <motion.span
              className="text-white bg-black px-2 py-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Battery Energy Storage
            </motion.span>
          </h1>
          <p className="text-white text-sm md:text-base mb-8 max-w-3xl mx-auto">
            Europe's leading platform for buying, selling and renting battery solutions
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link href="/marketplace">
                <motion.div
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonHover}
                >
                  <Button className="bg-white text-black hover:bg-white text-lg px-10 py-3 h-auto font-semibold rounded-full">
                    <motion.span
                      initial={{ y: 0 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.1 }}
                    >
                      Buyer
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link href="/list-battery">
                <motion.div
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonHover}
                >
                  <Button variant="outline" className="border-white text-white hover:bg-black bg-black text-lg px-10 py-3 h-auto font-semibold rounded-full">
                    <motion.span
                      initial={{ y: 0 }}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.1 }}
                    >
                      Seller
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        

      </div>
    </section>
  );
}
