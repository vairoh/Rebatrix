import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Battery } from "@/types";
import { Badge } from "@/components/ui/badge";
import { BatteryLevel } from "./BatteryLevel";
import { cardHover, microButtonHover, hoverScale } from "@/lib/motion";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

interface BatteryCardProps {
  battery: Battery;
}

export function BatteryCard({ battery }: BatteryCardProps) {
  // Using only black and white for all elements
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  const handleBatteryDetails = (e: React.MouseEvent) => {
    console.log("Handle Battery Details called for battery:", battery);
    if (!user) {
      e.preventDefault();
      toast({
        title: "Authentication required",
        description: "Please sign in to view battery details",
        variant: "default",
      });

      // Redirect to login page
      setLocation("/login");
      return false;
    }
    // If user is authenticated, the Link component will handle the navigation
  };

  const formatPrice = (price: string, listingType: string, rentalPeriod?: string) => {
    const numPrice = Number(price);

    if (listingType === 'rent' || listingType === 'lend') {
      // Map rental period to display suffix
      let suffix = "/mo"; // Default to monthly
      if (rentalPeriod === "yearly") suffix = "/yr";
      else if (rentalPeriod === "quarterly") suffix = "/qtr";
      else if (rentalPeriod === "weekly") suffix = "/wk";
      else if (rentalPeriod === "daily") suffix = "/day";
      
      return `€${numPrice.toLocaleString()}${suffix}`;
    }

    return `€${numPrice.toLocaleString()}`;
  };

  const calculatePricePerKWh = (price: string, capacity: string) => {
    const numPrice = Number(price);
    const numCapacity = Number(capacity);
    
    if (numCapacity <= 0) return "N/A";
    
    const pricePerKWh = numPrice / numCapacity;
    return `€${pricePerKWh.toFixed(2)}/kWh`;
  };

  const getBadgeText = (listingType: string, batteryType: string) => {
    if (listingType === 'rent' || listingType === 'lend') {
      return 'Rental';
    } else if (listingType === 'sell') {
      return 'For Sale';
    } else {
      return batteryType === 'new' ? 'New' : battery.batteryType === 'used' ? 'Used' : 'Second-Life';
    }
  };

  const isOwner = user && user.id === battery.userId; // Added owner check

  return (
    <motion.div
      className="battery-card bg-white rounded-xl overflow-hidden shadow-lg border border-black hover:shadow-xl transition-shadow duration-300"
      initial="rest"
      whileHover="hover"
      variants={cardHover}
    >
      <div className="p-3 border-b border-black">
        <div className="flex justify-between">
          <Badge className="px-2 py-0.5 text-xs font-medium bg-black text-white rounded-full">
            {getBadgeText(battery.listingType, battery.batteryType)}
          </Badge>
          <div className="flex gap-2">
            {!isOwner && (
              <Link href={`/battery/${battery.id}`} onClick={(e) => {
                e.stopPropagation();
                sessionStorage.setItem('lastViewedBatteryId', String(battery.id));
                sessionStorage.setItem(`battery-${battery.id}`, JSON.stringify(battery));
                if (!user) {
                  e.preventDefault();
                  toast({
                    title: "Authentication required",
                    description: "Please sign in to contact seller",
                    variant: "default",
                  });
                  setLocation("/login");
                  return false;
                }
                return true;
              }}>
                <motion.button 
                  className="p-1 rounded-full bg-white text-black border border-black hover:bg-black hover:text-white"
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  variants={microButtonHover}
                  title="Contact Seller"
                >
                  <i className="ri-mail-line text-sm"></i>
                </motion.button>
              </Link>
            )}
            <motion.button 
              className="p-1 rounded-full bg-white text-black border border-black hover:bg-black hover:text-white"
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              variants={microButtonHover}
            >
              <i className="ri-heart-line text-sm"></i>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          {/* Capacity as primary identifier */}
          <h3 className="font-heading font-semibold text-base line-clamp-2 text-black">
            {battery.capacity} kWh {battery.manufacturer} Battery
          </h3>
          <div className="flex flex-col items-end">
            <span className="font-semibold text-lg text-black">
              {formatPrice(battery.price, battery.listingType, battery.rentalPeriod)}
            </span>
            <span className="text-xs text-neutral-600">
              {calculatePricePerKWh(battery.price, battery.capacity)}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <span className="text-xs text-black">{battery.location}, {battery.country}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Badge variant="outline" className="px-1.5 py-0.5 text-xs bg-white text-black border-black rounded-full hover:bg-black hover:text-white transition-colors duration-200">
              {battery.capacity} kWh
            </Badge>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-1.5 py-0.5 text-xs bg-white text-black border-black rounded-full hover:bg-black hover:text-white transition-colors duration-200">
              {battery.technologyType}
            </Badge>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Badge variant="outline" className="px-1.5 py-0.5 text-xs bg-white text-black border-black rounded-full hover:bg-black hover:text-white transition-colors duration-200">
              {battery.category.charAt(0).toUpperCase() + battery.category.slice(1)}
            </Badge>
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BatteryLevel percentage={battery.healthPercentage || 100} />
            <span className="ml-1.5 text-xs font-medium text-black">
              {battery.healthPercentage || 100}% Health
            </span>
          </div>

          <Link href={`/battery/${battery.id}`} onClick={(e) => {
            console.log("Navigating to battery details:", battery.id, "Battery Object:", battery);
            // Use string IDs consistently
            sessionStorage.setItem('lastViewedBatteryId', String(battery.id));
            // Add battery data to sessionStorage for better reliability
            sessionStorage.setItem(`battery-${battery.id}`, JSON.stringify(battery));
            return handleBatteryDetails(e);
          }}>
            <motion.div
              className="text-black hover:text-black font-medium flex items-center text-xs cursor-pointer underline-offset-2 hover:underline"
              initial="initial"
              whileHover="hover"
              variants={hoverScale}
            >
              {isOwner ? 'Edit' : 'Details'} <motion.i 
                className="ri-arrow-right-line ml-0.5"
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}