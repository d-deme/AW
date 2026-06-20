import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, ShieldCheck, X } from 'lucide-react';

export const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="fixed bottom-24 left-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6"
          >
            <h4 className="text-lg font-bold text-navy mb-2">Share your feedback</h4>
            <p className="text-xs text-neutral-500 mb-4">Help us improve the Adama City digital experience.</p>
            
            {submitted ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="text-navy" size={24} />
                </div>
                <p className="text-sm font-bold text-navy">Thank you for your feedback!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your suggestions or issues..."
                  className="w-full h-32 p-3 text-sm rounded-xl border border-neutral-200 focus:ring-2 focus:ring-cyan focus:border-cyan outline-none transition-all"
                  required
                />
                <button type="submit" className="w-full btn-primary py-2 text-sm">
                  Submit Feedback
                </button>
              </form>
            )}
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-navy transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-navy text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-cyan hover:text-navy transition-all duration-300 active:scale-95"
        aria-label="Open feedback widget"
      >
        <Megaphone size={24} />
      </button>
    </div>
  );
};
