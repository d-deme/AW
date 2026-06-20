import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  text?: string;
  className?: string;
  fallback?: string;
}

/**
 * Strips HTML tags cleanly, decodes common HTMl entities, and formats excess spaces.
 * Ideal for listing descriptions, card snippets, tables, and short teasers.
 */
export const stripHtml = (html?: string, maxLength?: number): string => {
  if (!html) return '';
  // Strip tags but replace specific tags with space to prevent words from sticking
  let clean = html.replace(/<\/?[^>]+(>|$)/g, ' ');
  // Clean entities
  clean = clean
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Collapse multi-spaces
    .replace(/\s+/g, ' ')
    .trim();

  if (maxLength && clean.length > maxLength) {
    return clean.substring(0, maxLength).trim() + '...';
  }
  return clean;
};

export const SafeHtml = ({ text, className = '', fallback = '' }: SafeHtmlProps) => {
  const content = text || fallback;
  if (!content) return null;

  const hasHtml = /<[a-z][\s\S]*>/i.test(content);
  const hasColorClass = className.includes('text-');
  const defaultColor = hasColorClass ? '' : 'text-neutral-700';

  if (hasHtml) {
    // Sanitize the HTML payload securely to defeat any XSS injection vectors
    const sanitizedHtml = DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'referrerpolicy'],
    });

    return (
      <div 
        className={`rich-text-container leading-relaxed text-sm ${defaultColor} font-medium whitespace-normal break-words
          [&_h1]:text-xl [&_h1]:md:text-2xl [&_h1]:font-black [&_h1]:text-navy [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:tracking-tight
          [&_h2]:text-lg [&_h2]:md:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:tracking-tight
          [&_h3]:text-base [&_h3]:md:text-lg [&_h3]:font-bold [&_h3]:text-navy [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:mb-4 [&_p]:last:mb-0 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5 [&_ul]:mr-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5 [&_ol]:mr-2
          [&_li]:leading-normal
          [&_strong]:font-bold [&_strong]:text-navy
          [&_em]:italic
          [&_a]:text-cyan [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-navy [&_a]:transition-colors [&_a]:font-bold
          [&_blockquote]:border-l-4 [&_blockquote]:border-cyan/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-5 [&_blockquote]:bg-neutral-50 [&_blockquote]:py-1 [&_blockquote]:rounded-r-xl [&_blockquote]:text-neutral-600
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:my-5 [&_img]:shadow-sm [&_img]:mx-auto
          ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  // Gracefully render raw paragraphs split cleanly by newlines
  const paragraphs = content.split('\n');
  return (
    <div className={`leading-relaxed text-sm ${defaultColor} font-medium ${className}`}>
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim();
        if (!trimmed) return <div key={idx} className="h-2.5" />;
        return (
          <p key={idx} className="mb-3.5 last:mb-0 leading-relaxed text-left">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};
