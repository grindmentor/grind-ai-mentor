import React from "react";
import { cn } from "@/lib/utils";

interface EnhancedMarkdownProps {
  content: string;
  className?: string;
}

export const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({
  content,
  className
}) => {
  // Parse markdown-style content into styled HTML
  const parseMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-orange-400 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-orange-300 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-white">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-300">$1</em>')
      
      // Lists
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-300 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 text-gray-300 mb-1">$1. $2</li>')
      
      // Code blocks
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-800 text-orange-400 px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Line breaks
      .replace(/\n\n/gim, '<br><br>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div
      className={cn(
        "prose prose-invert prose-orange max-w-none",
        "text-gray-300 leading-relaxed",
        className
      )}
      dangerouslySetInnerHTML={{
        __html: parseMarkdown(content)
      }}
    />
  );
};