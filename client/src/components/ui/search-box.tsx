import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/hooks/use-search";

export function SearchBox() {
  const [focused, setFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { suggestions, isLoading } = useSearch(searchTerm);

  // Handle clicks outside the search box
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const suggestionVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      overflow: "hidden"
    },
    visible: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3
      }
    }
  };

  const popularSearches = [
    "Battery Energy Storage Systems (BESS)",
    "Lithium-ion Batteries Germany",
    "Industrial Energy Storage Solutions",
    "Second-life EV Batteries",
    "Solar Battery Systems Europe"
  ];

  return (
    <div 
      ref={containerRef}
      className={`relative search-container ${focused ? 'active' : ''}`}
    >
      <div className="relative shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="ri-search-line text-black"></i>
        </div>
        <motion.input 
          ref={inputRef}
          type="text" 
          value={searchTerm}
          onChange={handleChange}
          onFocus={handleFocus}
          className="block w-full pl-10 pr-3 py-1.5 border border-black rounded-full leading-5 bg-white placeholder-black placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm" 
          placeholder="Search batteries, BESS, energy storage..."
          whileFocus={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        />
      </div>
      
      <AnimatePresence>
        {focused && (
          <motion.div 
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-xl border border-black"
            variants={suggestionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="py-1">
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-black">Loading suggestions...</div>
              ) : suggestions && suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <motion.a 
                    key={index}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="block px-4 py-2 text-sm text-black hover:bg-black hover:text-white transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {suggestion}
                  </motion.a>
                ))
              ) : (
                <>
                  <div className="px-4 py-1 text-xs font-semibold text-black uppercase tracking-wider">
                    Popular Searches
                  </div>
                  {popularSearches.map((term, index) => (
                    <motion.a 
                      key={index}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="block px-4 py-2 text-sm text-black hover:bg-black hover:text-white transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {term}
                    </motion.a>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
