import React from 'react';
import { cn } from '@/lib/utils';

interface FormattedAIResponseProps {
  content: string;
  className?: string;
  moduleType?: string; // Optional prop for backward compatibility
}

export const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({ content, className, moduleType }) => {
  const formatText = (text: string) => {
    // Replace headers
    let formatted = text
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-foreground mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-foreground mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-foreground mt-6 mb-4">$1</h1>');

    // Replace bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    
    // Replace italic text  
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-foreground/90">$1</em>');

    // Replace bullet points with proper list formatting
    formatted = formatted.replace(/^[•\-\*] (.*)$/gm, '<li class="text-foreground/90 ml-4 mb-1">• $1</li>');
    
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li[^>]*>.*<\/li>\s*)+/gs, '<ul class="space-y-1 mb-4">$&</ul>');

    // Replace numbered lists
    formatted = formatted.replace(/^\d+\. (.*)$/gm, '<li class="text-foreground/90 ml-4 mb-1 list-decimal">$1</li>');
    
    // Replace line breaks with proper spacing
    formatted = formatted.replace(/\n\n/g, '</p><p class="text-foreground/90 mb-3">');
    formatted = formatted.replace(/\n/g, '<br />');

    // Wrap in paragraph tags if not already wrapped
    if (!formatted.startsWith('<')) {
      formatted = `<p class="text-foreground/90 mb-3">${formatted}</p>`;
    }

    return formatted;
  };

  return (
    <div 
      className={cn("prose prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  );
};

export default FormattedAIResponse;