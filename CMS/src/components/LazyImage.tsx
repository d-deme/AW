import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageOff } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  wrapperClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc,
  className = '',
  wrapperClassName = '',
  referrerPolicy = 'no-referrer',
  ...rest
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        rootMargin: '150px 0px', // Pre-load slightly before intersecting
        threshold: 0.01,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Reset error/loaded states if the src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Standard safe base64-encoded dark backdrop SVG as default fallback placeholder
  const computedPlaceholder = placeholderSrc || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27 width%3D%27400%27 height%3D%27300%27 viewBox%3D%270 0 400 300%27%3E%3Crect width%3D%27100%25%27 height%3D%27100%25%27 fill%3D%27%230f172a%27%2F%3E%3C%2Fsvg%3E';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center ${wrapperClassName}`}
      style={{ isolation: 'isolate' }}
    >
      {/* Low-res/Blur Placeholder Layer */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 w-full h-full flex items-center justify-center overflow-hidden bg-slate-200 dark:bg-slate-900"
          >
            <img
              src={computedPlaceholder}
              alt="placeholder"
              className="w-full h-full object-cover filter blur-2xl scale-110 pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Shimmer pulse effect overlay */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]"
              style={{
                animation: 'shimmer 1.8s infinite',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Fallback Graphic Layer */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/40 text-slate-400 dark:text-slate-500 text-center select-none">
          <ImageOff size={24} className="mb-1 text-slate-300 dark:text-slate-700 animate-pulse" />
          <span className="text-[10px] font-bold tracking-tight uppercase leading-none truncate max-w-full">
            No Image Asset
          </span>
        </div>
      )}

      {/* High-resolution Image Layer */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          referrerPolicy={referrerPolicy}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full transition-all duration-700 ease-out object-cover ${
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-md'
          } ${className}`}
          {...rest}
        />
      )}
    </div>
  );
};
