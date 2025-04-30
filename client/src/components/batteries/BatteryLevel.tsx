import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface BatteryLevelProps {
  percentage: number;
}

export function BatteryLevel({ percentage }: BatteryLevelProps) {
  const progressValue = useMotionValue(0);
  const width = useTransform(progressValue, value => `${value}%`);
  
  // For initial animation
  const hasAnimated = useRef(false);
  
  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      animate(progressValue, percentage, { duration: 1.5, ease: "easeOut" });
    }
  }, [percentage, progressValue]);
  
  // Always use black for battery health - strict black/white theme
  const getColor = () => {
    return "#000000"; // Always black regardless of health
  };

  return (
    <div className="relative h-4 w-8 border border-black rounded-sm p-[1px]" style={{ position: "relative" }}>
      <motion.div 
        className="h-full rounded-[1px]"
        style={{ 
          width, 
          backgroundColor: getColor()
        }}
      />
      <div 
        className="absolute -right-[3px] top-[4px] h-[6px] w-[2px] bg-black rounded-r-sm"
        style={{ 
          position: "absolute",
          right: "-3px",
          top: "4px",
          height: "6px",
          width: "2px",
          backgroundColor: "#000000",
          borderRadius: "0 1px 1px 0"
        }}
      />
    </div>
  );
}
