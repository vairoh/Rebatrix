import { Variants } from "framer-motion";

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

// Subtle fade in animation - shorter and more subtle for micro interactions
export const microFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

// Slide up animation
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Slide in from left animation
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  }
};

// Slide in from right animation
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  }
};

// Zoom in animation
export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Staggered container for children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Item animation for staggered children
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Fade in up animation for staggered children
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Card hover animation
export const cardHover = {
  rest: { 
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  hover: { 
    y: -10,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)",
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// Button hover animation with enhanced transitions
export const buttonHover = {
  rest: { 
    scale: 1,
    transition: { duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }
  },
  hover: { 
    scale: 1.05, 
    transition: { duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }
  }
};

// Subtle button hover animation for micro interactions
export const microButtonHover = {
  rest: { 
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  hover: { 
    scale: 1.02, 
    transition: { duration: 0.15, ease: "easeOut" }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeOut" }
  }
};

// Pulse animation
export const pulse: Variants = {
  hidden: { opacity: 0.6, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

// Rotate animation
export const rotate: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity
    }
  }
};

// Micro slide up for subtle element transitions
export const microSlideUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Page transition animation
export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

// Hover scale animation for interactive elements
export const hoverScale = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.03,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Micro-animation for form field focus
export const formFieldFocus = {
  initial: { 
    borderColor: "rgba(0,0,0,0.1)",
    boxShadow: "none"
  },
  focus: { 
    borderColor: "rgba(0,0,0,0.8)",
    boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
    transition: { duration: 0.2, ease: "easeOut" }
  }
};
