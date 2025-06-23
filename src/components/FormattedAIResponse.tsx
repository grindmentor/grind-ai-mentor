
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
      // Handle headers
      if (line.startsWith('### ')) {
        formattedLines.push(
          <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        formattedLines.push(
          <h2 key={index} className="text-xl font-bold text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        formattedLines.push(
          <h1 key={index} className="text-2xl font-bold text-white mt-4 mb-3">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold lines
        formattedLines.push(
          <p key={index} className="font-bold text-white mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      } else if (line.startsWith('• ') || line.startsWith('- ')) {
        // Bullet points
        formattedLines.push(
          <li key={index} className="text-gray-300 ml-4 mb-1">
            {line.replace(/^[•\-]\s/, '')}
          </li>
        );
      } else if (line.startsWith('|') && line.includes('|')) {
        // Table rows - format as grid
        const cells = line.split('|').filter(cell => cell.trim());
        if (cells.length > 1) {
          formattedLines.push(
            <div key={index} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 bg-gray-800 p-2 rounded mb-1">
              {cells.map((cell, cellIndex) => (
                <div key={cellIndex} className="text-gray-300 text-sm">
                  {cell.trim()}
                </div>
              ))}
            </div>
          );
        }
      } else if (line.trim()) {
        // Regular text with inline formatting
        const formattedLine = formatInlineText(line);
        formattedLines.push(
          <p key={index} className="text-gray-300 mb-2">
            {formattedLine}
          </p>
        );
      } else {
        // Empty line for spacing
        formattedLines.push(<br key={index} />);
      }
    });
    
    return formattedLines;
  };

  const formatInlineText = (text: string) => {
    // Handle bold text **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.replace(/\*\*/g, '')}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className={`formatted-ai-response space-y-2 ${className}`}>
      {formatContent(content)}
    </div>
  );
};

export default FormattedAIResponse;
