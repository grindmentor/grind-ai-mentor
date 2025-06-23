
import React from 'react';

interface FormattedAIResponseProps {
  content: string;
  className?: string;
}

const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({ content, className = "" }) => {
  // Parse the formatted content and render appropriately
  const parseContent = (text: string) => {
    // Split by lines to handle different elements
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        elements.push(<br key={index} />);
        return;
      }
      
      // Handle headers
      if (line.includes('<h1>')) {
        const content = line.replace(/<\/?h1>/g, '');
        elements.push(<h1 key={index} className="text-2xl font-bold text-white mt-6 mb-3">{content}</h1>);
      } else if (line.includes('<h2>')) {
        const content = line.replace(/<\/?h2>/g, '');
        elements.push(<h2 key={index} className="text-xl font-bold text-orange-400 mt-5 mb-2">{content}</h2>);
      } else if (line.includes('<h3>')) {
        const content = line.replace(/<\/?h3>/g, '');
        elements.push(<h3 key={index} className="text-lg font-bold text-gray-300 mt-4 mb-2">{content}</h3>);
      } else {
        // Handle regular text with inline formatting
        const processedLine = processInlineFormatting(line);
        elements.push(<div key={index} className="text-gray-300 mb-1">{processedLine}</div>);
      }
    });
    
    return elements;
  };
  
  const processInlineFormatting = (text: string) => {
    const parts = [];
    let currentIndex = 0;
    
    // Process bold text
    const boldRegex = /<strong>(.*?)<\/strong>/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.slice(currentIndex, match.index));
      }
      
      // Add the bold text
      parts.push(<strong key={match.index} className="font-bold text-white">{match[1]}</strong>);
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`formatted-ai-response ${className}`}>
      <div className="space-y-2">
        {parseContent(content)}
      </div>
    </div>
  );
};

export default FormattedAIResponse;
