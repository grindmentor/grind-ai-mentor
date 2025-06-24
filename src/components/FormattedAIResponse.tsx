
import React from 'react';

interface FormattedAIResponseProps {
  content: string;
  className?: string;
}

const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({ content, className = "" }) => {
  const formatContent = (text: string) => {
    // Split content into lines for processing
    const lines = text.split('\n');
    const formattedLines: JSX.Element[] = [];
    
    lines.forEach((line, index) => {
      // Handle headers with proper styling
      if (line.startsWith('### ')) {
        formattedLines.push(
          <h3 key={index} className="text-xl font-bold text-white mt-6 mb-3 border-b border-gray-700 pb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        formattedLines.push(
          <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4 border-b-2 border-orange-500 pb-3">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        formattedLines.push(
          <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-6 border-b-2 border-orange-500 pb-4">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        // Bold section headers
        formattedLines.push(
          <div key={index} className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-l-4 border-orange-500 p-4 my-4 rounded-r-lg">
            <h4 className="font-bold text-lg text-orange-300">
              {line.replace(/\*\*/g, '')}
            </h4>
          </div>
        );
      } else if (line.match(/^\d+\.\s/)) {
        // Numbered lists
        const number = line.match(/^(\d+)\.\s(.*)$/);
        if (number) {
          formattedLines.push(
            <div key={index} className="flex items-start space-x-3 my-2 p-3 bg-gray-800/50 rounded-lg">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {number[1]}
              </span>
              <p className="text-gray-300 flex-1">{formatInlineText(number[2])}</p>
            </div>
          );
        }
      } else if (line.startsWith('• ') || line.startsWith('- ')) {
        // Bullet points with enhanced styling
        formattedLines.push(
          <div key={index} className="flex items-start space-x-3 my-2 p-3 bg-gray-800/30 rounded-lg">
            <span className="text-orange-400 font-bold mt-1">•</span>
            <p className="text-gray-300 flex-1">{formatInlineText(line.replace(/^[•\-]\s/, ''))}</p>
          </div>
        );
      } else if (line.startsWith('|') && line.includes('|')) {
        // Enhanced table formatting
        const cells = line.split('|').filter(cell => cell.trim());
        if (cells.length > 1) {
          formattedLines.push(
            <div key={index} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gradient-to-r from-gray-800 to-gray-700 p-4 rounded-lg mb-2 border border-gray-600">
              {cells.map((cell, cellIndex) => (
                <div key={cellIndex} className="text-gray-200 text-sm font-medium bg-gray-900/50 p-2 rounded">
                  {cell.trim()}
                </div>
              ))}
            </div>
          );
        }
      } else if (line.trim().startsWith('```')) {
        // Code blocks with syntax highlighting
        formattedLines.push(
          <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto">
            <code className="text-green-400">{line.replace(/```\w*/, '')}</code>
          </div>
        );
      } else if (line.trim()) {
        // Regular paragraphs with enhanced formatting
        const formattedLine = formatInlineText(line);
        formattedLines.push(
          <p key={index} className="text-gray-300 mb-3 leading-relaxed">
            {formattedLine}
          </p>
        );
      } else {
        // Spacing for empty lines
        formattedLines.push(<div key={index} className="h-2" />);
      }
    });
    
    return formattedLines;
  };

  const formatInlineText = (text: string) => {
    // Handle multiple formatting patterns
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
    
    return parts.map((part, index) => {
      // Bold text **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-white bg-orange-500/20 px-1 rounded">
            {part.replace(/\*\*/g, '')}
          </strong>
        );
      }
      // Italic text *text*
      else if (part.startsWith('*') && part.endsWith('*') && !part.includes('**')) {
        return (
          <em key={index} className="italic text-orange-300">
            {part.replace(/\*/g, '')}
          </em>
        );
      }
      // Inline code `text`
      else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-gray-800 text-green-400 px-2 py-1 rounded font-mono text-sm">
            {part.replace(/`/g, '')}
          </code>
        );
      }
      // Links [text](url)
      else if (part.match(/\[.*?\]\(.*?\)/)) {
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          return (
            <a key={index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" 
               className="text-orange-400 hover:text-orange-300 underline font-medium">
              {linkMatch[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className={`formatted-ai-response font-inter leading-relaxed ${className}`}>
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
        <div className="space-y-1">
          {formatContent(content)}
        </div>
      </div>
    </div>
  );
};

export default FormattedAIResponse;
