import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/components/home/Hero";
import BatteryCategories from "@/components/home/BatteryCategories";
import FeaturedListings from "@/components/home/FeaturedListings";
import ListingCTA from "@/components/home/ListingCTA";
import { pageTransition } from "@/lib/motion";

export default function Home() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home-page"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={pageTransition}
      >
        <Helmet>
          <title>Rebatrix | B2B Battery & Energy Storage Marketplace</title>
          <meta
            name="description"
            content="Rebatrix - B2B Marketplace for Battery Energy Storage Systems (BESS) in Germany and Europe. Buy, sell, rent or lend new and second-life batteries."
          />
          <meta
            name="keywords"
            content="battery energy storage systems, BESS, energy storage, second-life batteries, industrial batteries, europe batteries, germany energy storage"
          />
          <meta property="og:title" content="Rebatrix – B2B Battery Marketplace" />
          <meta property="og:description" content="Explore Europe's trusted battery energy storage marketplace." />
          <meta property="og:image" content="/logo.png" />
          <meta property="og:url" content="https://rebatrix.com" />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <Hero />
        <BatteryCategories />
        <FeaturedListings />
        <ListingCTA />
      </motion.div>
    </AnimatePresence>
  );
}
