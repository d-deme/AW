import React from 'react';
import { Facebook, Twitter, Send, Youtube } from 'lucide-react';

interface SocialMediaLinksProps {
  className?: string;
}

export const SocialMediaLinks = ({ className = "" }: SocialMediaLinksProps) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex items-center gap-2 hover:text-white transition-all hover:scale-110 group">
      <Facebook size={16} />
      <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">Facebook</span>
    </a>
    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="flex items-center gap-2 hover:text-white transition-all hover:scale-110 group">
      <Twitter size={16} />
      <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">X</span>
    </a>
    <a href="https://t.me" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="flex items-center gap-2 hover:text-white transition-all hover:scale-110 group">
      <Send size={16} />
      <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">Telegram</span>
    </a>
    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex items-center gap-2 hover:text-white transition-all hover:scale-110 group">
      <Youtube size={16} />
      <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">YouTube</span>
    </a>
  </div>
);
