import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function ListingCTA() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  return (
    <section className="py-10 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <motion.h2 
            className="font-heading text-2xl md:text-3xl font-bold text-white mb-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Ready to Become a Seller?
          </motion.h2>
          <motion.p 
            className="text-neutral-300 text-base mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Join hundreds of businesses across Europe who are already using rebatrix to buy, sell, rent, or lend battery energy storage systems.
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div onClick={() => !user ? setLocation("/login") : setLocation("/marketplace")}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button variant="secondary" className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-full text-black bg-white border border-white hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-white transition-colors">
                  <i className="ri-question-line mr-1.5"></i> Learn More
                </Button>
              </motion.div>
            </div>
            <Link href="/list-battery">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button variant="outline" className="inline-flex items-center px-6 py-2.5 border border-white text-sm font-medium rounded-full text-white bg-black hover:bg-black focus:outline-none focus:ring-1 focus:ring-white transition-colors">
                  <i className="ri-upload-cloud-line mr-1.5"></i> Become a Seller
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
