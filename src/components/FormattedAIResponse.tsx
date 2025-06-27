
import React from 'react';

interface FormattedAIResponseProps {
  content: string;
  moduleType?: 'coach' | 'food-log' | 'training' | 'nutrition' | 'default';
}

const FormattedAIResponse: React.FC<FormattedAIResponseProps> = ({ content, moduleType = 'default' }) => {
  const getModuleStyles = () => {
    switch (moduleType) {
      case 'coach':
        return {
          containerClass: 'ai-response-coach',
          primaryColor: 'text-green-100',
          headingColor: 'text-green-200',
          strongColor: 'text-green-300',
          borderColor: 'border-green-500/30'
        };
      case 'food-log':
        return {
          containerClass: 'ai-response-food',
          primaryColor: 'text-orange-100',
          headingColor: 'text-orange-200',
          strongColor: 'text-orange-300',
          borderColor: 'border-orange-500/30'
        };
      case 'training':
        return {
          containerClass: 'ai-response-training',
          primaryColor: 'text-blue-100',
          headingColor: 'text-blue-200',
          strongColor: 'text-blue-300',
          borderColor: 'border-blue-500/30'
        };
      case 'nutrition':
        return {
          containerClass: 'ai-response-nutrition',
          primaryColor: 'text-purple-100',
          headingColor: 'text-purple-200',
          strongColor: 'text-purple-300',
          borderColor: 'border-purple-500/30'
        };
      default:
        return {
          containerClass: 'ai-response-default',
          primaryColor: 'text-slate-300',
          headingColor: 'text-white',
          strongColor: 'text-white',
          borderColor: 'border-slate-700'
        };
    }
  };

  const styles = getModuleStyles();

  const formatContent = (text: string) => {
    return text
      // Headers (###, ##, #)
      .replace(/^### (.+)$/gm, `<h3 class="text-lg font-semibold ${styles.headingColor} mt-6 mb-3 border-b ${styles.borderColor} pb-2">$1</h3>`)
      .replace(/^## (.+)$/gm, `<h2 class="text-xl font-semibold ${styles.headingColor} mt-8 mb-4 border-b-2 ${styles.borderColor} pb-2">$1</h2>`)
      .replace(/^# (.+)$/gm, `<h1 class="text-2xl font-bold ${styles.headingColor} mt-8 mb-6 border-b-2 ${styles.borderColor} pb-3">$1</h1>`)
      
      // Bold text (**text**)
      .replace(/\*\*([^*]+)\*\*/g, `<strong class="font-semibold ${styles.strongColor}">$1</strong>`)
      
      // Italic text (*text*)
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, `<em class="italic ${styles.primaryColor}">$1</em>`)
      
      // Lists (- item or • item)
      .replace(/^[•-] (.+)$/gm, `<li class="${styles.primaryColor} ml-4 list-disc list-inside mb-1">$1</li>`)
      
      // Line breaks and paragraphs
      .replace(/\n\n/g, `</p><p class="${styles.primaryColor} leading-relaxed mb-4">`)
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`ai-response prose prose-slate max-w-none ${styles.containerClass}`}>
      <div 
        className={`${styles.primaryColor} leading-relaxed`}
        dangerouslySetInnerHTML={{ 
          __html: `<p class="${styles.primaryColor} leading-relaxed mb-4">${formatContent(content)}</p>` 
        }} 
      />
      
      <style>{`
        .${styles.containerClass} h1, .${styles.containerClass} h2, .${styles.containerClass} h3 {
          color: ${styles.headingColor.replace('text-', '')} !important;
        }
        .${styles.containerClass} strong {
          color: ${styles.strongColor.replace('text-', '')} !important;
          font-weight: 600;
        }
        .${styles.containerClass} em {
          color: ${styles.primaryColor.replace('text-', '')} !important;
        }
        .${styles.containerClass} li {
          color: ${styles.primaryColor.replace('text-', '')} !important;
          margin-bottom: 0.25rem;
        }
        .${styles.containerClass} p {
          color: ${styles.primaryColor.replace('text-', '')} !important;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default FormattedAIResponse;
