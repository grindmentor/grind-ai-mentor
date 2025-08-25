import React from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface EnhancedMarkdownProps {
  content: string;
  className?: string;
}

export const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({ 
  content, 
  className 
}) => {
  // Process markdown formatting
  const processMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-orange-300">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-orange-200">$1</em>')
      
      // Code blocks
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-orange-400 font-mono text-sm">$1</code>')
      
      // Lists
      .replace(/^\* (.*$)/gm, '<li class="ml-4 text-gray-200 mb-1">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-gray-200 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-gray-200 mb-1 list-decimal">$1</li>')
      
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  };

  // Sanitize HTML before rendering
  const sanitizedHTML = DOMPurify.sanitize(processMarkdown(content), {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code'],
    ALLOWED_ATTR: ['class'],
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'img', 'iframe'],
    USE_PROFILES: { html: true }
  });

  return (
    <div 
      className={cn('prose prose-invert max-w-none', className)}
      dangerouslySetInnerHTML={{ 
        __html: sanitizedHTML 
      }}
    />
  );
};