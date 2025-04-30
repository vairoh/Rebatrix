import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/components/home/Hero";
import BatteryCategories from "@/components/home/BatteryCategories";
import FeaturedListings from "@/components/home/FeaturedListings";
import ListingCTA from "@/components/home/ListingCTA";
import { pageTransition } from "@/lib/motion";

export default function Home() {
  // Set SEO meta tags
  useEffect(() => {
    document.title = "Rebatrix | B2B Battery & Energy Storage Marketplace";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Rebatrix - B2B Marketplace for Battery Energy Storage Systems (BESS) in Germany and Europe. Buy, sell, rent or lend new and second-life batteries.");
    }
    
    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", "battery energy storage systems, BESS, energy storage, second-life batteries, industrial batteries, europe batteries, germany energy storage");
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home-page"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageTransition}
      >
        <Hero />
        <BatteryCategories />
        <FeaturedListings />
        <ListingCTA />
      </motion.div>
    </AnimatePresence>
  );
}
