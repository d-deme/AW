import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageIcon } from 'lucide-react';

interface HighContrastImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

// Map Tailwind spacing unit classes to approximate pixel values
const parseTailwindDimensions = (classes: string[]): { width?: number; height?: number } => {
  let width: number | undefined = undefined;
  let height: number | undefined = undefined;

  for (const c of classes) {
    if (c.startsWith('w-')) {
      const val = c.substring(2);
      const numeric = parseInt(val, 10);
      if (!isNaN(numeric)) {
        // Tailwind scale is typically 1 unit = 0.25rem = 4px.
        // We multiply by 8 to get 2x resolution for High DPI displays and crisp rendering.
        width = numeric * 8;
      }
    } else if (c.startsWith('h-')) {
      const val = c.substring(2);
      const numeric = parseInt(val, 10);
      if (!isNaN(numeric)) {
        height = numeric * 8;
      }
    }
  }

  return { width, height };
};

const optimizeImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return '';
  
  // Do not optimize state/local paths, inline svg data or non-http protocols
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }

  // Optimize Unsplash images natively to utilize custom CDN transforms
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('fm', 'webp');
      u.searchParams.set('q', '85');
      if (width) u.searchParams.set('w', String(width));
      if (height) u.searchParams.set('h', String(height));
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('auto', 'format,compress');
      return u.toString();
    } catch {
      return url;
    }
  }

  // Optimize Picsum photos sizes directly or proxy them
  if (url.includes('picsum.photos')) {
    // If it's standard picsum path, e.g. https://picsum.photos/seed/abc/800/600
    // We can proxy it to encode and return webp compression
    try {
      const encodedUrl = encodeURIComponent(url);
      let proxyUrl = `https://images.weserv.nl/?url=${encodedUrl}&output=webp&q=85`;
      if (width) proxyUrl += `&w=${width}`;
      if (height) proxyUrl += `&h=${height}`;
      return proxyUrl;
    } catch {
      return url;
    }
  }

  // Generic Dynamic Image Optimisation Proxy with global high-speed Cloudflare CDN (images.weserv.nl)
  try {
    const encodedUrl = encodeURIComponent(url);
    let proxyUrl = `https://images.weserv.nl/?url=${encodedUrl}&output=webp&q=85`;
    if (width) proxyUrl += `&w=${width}`;
    if (height) proxyUrl += `&h=${height}`;
    return proxyUrl;
  } catch {
    return url;
  }
};

export const HighContrastImage = ({ 
  src, 
  alt, 
  className = '', 
  wrapperClassName = '',
  loading = 'lazy',
  width: customWidth,
  height: customHeight
}: HighContrastImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(!src);
  }, [src]);

  const classes = useMemo(() => className.split(' ').filter(Boolean), [className]);
  
  // Sizing, positioning, layout, rounded edges, borders, shadows go to the wrapper
  const wrapperClassesExtracted = useMemo(() => {
    return classes.filter(c => 
      c.startsWith('w-') || 
      c.startsWith('h-') || 
      c.startsWith('aspect-') || 
      c.startsWith('rounded-') || 
      c.startsWith('shrink-') || 
      c.startsWith('grow-') || 
      c.startsWith('flex-') || 
      c.startsWith('border') || 
      c.startsWith('shadow') || 
      c.startsWith('max-') || 
      c.startsWith('min-') || 
      c.startsWith('absolute') || 
      c.startsWith('relative') || 
      c.startsWith('inset-') || 
      c.startsWith('top-') || 
      c.startsWith('left-') || 
      c.startsWith('right-') || 
      c.startsWith('bottom-') || 
      c.startsWith('z-')
    ).join(' ');
  }, [classes]);

  // Image fitting, hovering, transitions, scale and shape go to the img element
  const imgClassesExtracted = useMemo(() => {
    return classes.filter(c => 
      c.startsWith('object-') || 
      c.startsWith('group-hover:') || 
      c.startsWith('hover:') || 
      c.startsWith('transition-') || 
      c.startsWith('duration-') ||
      c.startsWith('ease-') ||
      c.startsWith('rounded-')
    ).join(' ');
  }, [classes]);

  // Compute optimized webp dynamic resource URL with intelligent width & height parameters
  const optimizedSrc = useMemo(() => {
    const dims = parseTailwindDimensions(classes);
    const resolvedWidth = customWidth || dims.width || 800; // default width fallback for quality balance
    const resolvedHeight = customHeight || dims.height;
    return optimizeImageUrl(src, resolvedWidth, resolvedHeight);
  }, [src, classes, customWidth, customHeight]);

  return (
    <div className={`relative overflow-hidden bg-neutral-900 select-none ${wrapperClassesExtracted} ${wrapperClassName}`}>
      {/* Skeleton / Placeholder loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
          <motion.div 
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <ImageIcon className="text-neutral-500 animate-pulse" size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest text-neutral-600">Rendering Asset</span>
          </motion.div>
        </div>
      )}

      {/* Fallback image */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-neutral-900 border border-neutral-800 rounded-[inherit]">
          <ImageIcon className="text-neutral-600 mb-1" size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Asset Unavailable</span>
        </div>
      )}

      {/* Actual High-Contrast Image */}
      {optimizedSrc ? (
        <motion.img
          src={optimizedSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading={loading}
          initial={{ opacity: 0, scale: 1.05, filter: 'contrast(1.1) brightness(0.95) saturate(1.05)' }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            scale: isLoaded ? 1 : 1.05,
            filter: isLoaded ? 'contrast(1.15) brightness(0.95) saturate(1.1)' : 'contrast(1.1) brightness(0.95) saturate(1.05)'
          }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-700 rounded-[inherit] ${imgClassesExtracted}`}
          referrerPolicy="no-referrer"
        />
      ) : null}

      {/* Dark subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none rounded-[inherit]" />
    </div>
  );
};
