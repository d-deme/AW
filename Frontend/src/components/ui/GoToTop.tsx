import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';

export const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[90] p-4 bg-white border border-neutral-200 rounded-full text-navy shadow-2xl hover:bg-navy hover:text-white transition-all group"
          aria-label="Back to top"
        >
          <ChevronUp size={20} className="group-hover:-translate-y-1 transition-transform" />
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-navy text-white px-2 py-1 text-[8px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap rounded-sm">
            Back to Top
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
