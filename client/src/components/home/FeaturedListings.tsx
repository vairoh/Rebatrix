import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { BatteryCard } from "@/components/batteries/BatteryCard";
import { Battery } from "@/types";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

export default function FeaturedListings() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  
  const { data: batteries, isLoading, error } = useQuery<Battery[]>({
    queryKey: ['/api/featured?limit=4'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Navigation controls for mobile
  const [activeIndex, setActiveIndex] = useState(0);
  const maxVisibleItems = Math.min(batteries?.length || 0, 4);
  
  const handlePrevious = () => {
    setActiveIndex(prev => (prev - 1 + maxVisibleItems) % maxVisibleItems);
  };
  
  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % maxVisibleItems);
  };
  
  const handleViewAllListings = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast({
        title: "Authentication required",
        description: "Please sign in to view all battery listings",
        variant: "default",
      });
      
      // Redirect to login page
      setLocation("/login");
      return false;
    }
    // If user is authenticated, the Link component will handle the navigation
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-5">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-black mb-1">Featured Battery Systems</h2>
            <p className="text-black text-sm">Explore top energy storage solutions from across Europe</p>
          </motion.div>
          <div className="flex space-x-1">
            <motion.button
              className="p-2 rounded-full bg-white border border-black text-black hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-black"
              onClick={handlePrevious}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="ri-arrow-left-s-line text-lg"></i>
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-white border border-black text-black hover:bg-black hover:text-white focus:outline-none focus:ring-1 focus:ring-black"
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="ri-arrow-right-s-line text-lg"></i>
            </motion.button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg border border-black hover:shadow-xl transition-shadow duration-300">
                <div className="h-40 bg-black animate-pulse opacity-10"></div>
                <div className="p-4">
                  <div className="h-5 bg-black rounded animate-pulse opacity-10 mb-2"></div>
                  <div className="h-3 bg-black rounded animate-pulse opacity-10 w-1/2 mb-3"></div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <div className="h-5 w-14 bg-black rounded animate-pulse opacity-10"></div>
                    <div className="h-5 w-20 bg-black rounded animate-pulse opacity-10"></div>
                    <div className="h-5 w-16 bg-black rounded animate-pulse opacity-10"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 w-20 bg-black rounded animate-pulse opacity-10"></div>
                    <div className="h-5 w-16 bg-black rounded animate-pulse opacity-10"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error || !batteries || batteries.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg border border-black hover:shadow-xl transition-shadow duration-300">
                <div className="p-3 border-b border-black">
                  <div className="flex justify-between">
                    <Badge className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded-full">
                      {i % 2 === 0 ? 'New' : 'Second-Life'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-heading font-semibold text-base line-clamp-2 text-black">
                      {i % 2 === 0 ? 'Lithium-Ion Battery Pack' : 'Second-Life Storage Solution'}
                    </h3>
                    <span className="font-medium text-base text-black">
                      €{(1500 + (i * 500)).toLocaleString()}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs text-black">Berlin, Germany</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="px-1.5 py-0.5 text-xs bg-white text-black border-black rounded-full hover:bg-black hover:text-white transition-colors duration-200">
                      {30 + (i * 10)} kWh
                    </Badge>
                    <Badge variant="outline" className="px-1.5 py-0.5 text-xs bg-white text-black border-black rounded-full hover:bg-black hover:text-white transition-colors duration-200">
                      {i % 2 === 0 ? 'Lithium-Ion' : 'LFP'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-2.5 bg-black rounded-full">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${100 - (i * 5)}%` }}
                        />
                      </div>
                      <span className="ml-1.5 text-xs font-medium text-black">
                        {100 - (i * 5)}% Health
                      </span>
                    </div>
                    <Link href="/marketplace" onClick={handleViewAllListings}>
                      <div className="text-black hover:text-black font-medium flex items-center text-xs cursor-pointer underline-offset-2 hover:underline">
                        Details <i className="ri-arrow-right-line ml-0.5" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop display - grid for all batteries */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {batteries?.map((battery, index) => (
                <motion.div
                  key={battery.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <BatteryCard battery={battery} />
                </motion.div>
              ))}
            </div>
            
            {/* Mobile display - carousel with only one visible battery at a time */}
            <div className="md:hidden">
              <AnimatePresence mode="wait">
                {batteries && batteries.length > 0 && (
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BatteryCard battery={batteries[activeIndex]} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Dots indicator for mobile */}
              <div className="flex justify-center mt-3 space-x-1">
                {[...Array(maxVisibleItems)].map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === activeIndex ? 'bg-black' : 'border border-black bg-white'}`}
                    onClick={() => setActiveIndex(i)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/marketplace" onClick={handleViewAllListings}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-black hover:bg-black focus:outline-none focus:ring-1 focus:ring-black transition-colors">
                View All Listings <i className="ri-arrow-right-line ml-1"></i>
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}
