import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BatteryLevelProps {
  health: number;
  className?: string;
}

export function BatteryLevel({ health, className }: BatteryLevelProps) {
  const [width, setWidth] = useState(0);
  
  // Get color based on health level
  const getHealthColor = () => {
    if (health >= 90) return "bg-green-500";
    if (health >= 70) return "bg-green-400";
    if (health >= 50) return "bg-yellow-500";
    if (health >= 30) return "bg-orange-500";
    return "bg-red-500";
  };
  
  useEffect(() => {
    // Small delay to enable animation
    const timeout = setTimeout(() => {
      setWidth(health);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [health]);

  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative h-6 w-12 border-2 border-neutral-600 rounded-sm p-0.5">
        <motion.div 
          className={cn("h-full rounded-sm", getHealthColor())}
          initial={{ width: "0%" }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <div className="absolute right-[-5px] top-[6px] h-2.5 w-[3px] bg-neutral-600 rounded-r-sm" />
      </div>
      <span className="ml-2 text-sm font-medium text-neutral-600">{health}% Health</span>
    </div>
  );
}
