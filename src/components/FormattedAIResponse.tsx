
import React from 'react';

interface FormattedAIResponseProps {
  content: string;
}

const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({ content }) => {
  const formatContent = (text: string) => {
    return text
      // Headers (###, ##, #)
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-3 border-b border-slate-700 pb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-white mt-8 mb-4 border-b-2 border-orange-500 pb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-6 border-b-2 border-orange-500 pb-3">$1</h1>')
      
      // Bold text (**text**)
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      
      // Italic text (*text*)
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-slate-200">$1</em>')
      
      // Lists (- item or • item)
      .replace(/^[•-] (.+)$/gm, '<li class="text-slate-200 ml-4 list-disc list-inside mb-1">$1</li>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed mb-4">')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="ai-response prose prose-slate max-w-none">
      <div 
        className="text-slate-300 leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: `<p class="text-slate-300 leading-relaxed mb-4">${formatContent(content)}</p>` 
        }} 
      />
      
      <style>{`
        .ai-response h1, .ai-response h2, .ai-response h3 {
          color: white !important;
        }
        .ai-response strong {
          color: white !important;
          font-weight: 600;
        }
        .ai-response em {
          color: #cbd5e1 !important;
        }
        .ai-response li {
          color: #cbd5e1 !important;
          margin-bottom: 0.25rem;
        }
        .ai-response p {
          color: #cbd5e1 !important;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default FormattedAIResponse;
