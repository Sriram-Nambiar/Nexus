import React, { useState } from 'react';
import type { AskQuestionResponse, SourceReference } from '../../api/types';
import { Badge } from '../common/Badge';
import { SourceReferenceCard } from './SourceReferenceCard';
import { Bot, User, Copy, Check, ChevronDown, ChevronUp, BookOpen, AlertCircle } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseMeta?: AskQuestionResponse;
  timestamp: string;
  isError?: boolean;
}

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const meta = message.responseMeta;
  const sources = meta?.sources || [];
  const isGrounded = Boolean(meta?.grounded && sources.length > 0);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple clean markdown formatter for academic responses
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-zinc-100 mt-4 mb-2 first:mt-0">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header 2
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-white mt-5 mb-2.5 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Header 1
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-white mt-6 mb-3 first:mt-0">
            {line.replace('# ', '')}
          </h2>
        );
      }
      // Horizontal rule
      if (line.trim() === '---') {
        return <hr key={idx} className="border-zinc-800 my-4" />;
      }
      // Unordered list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-zinc-300 text-sm leading-relaxed my-1">
            {formatInlineStyles(line.replace(/^[-*]\s+/, ''))}
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-zinc-300 text-sm leading-relaxed my-1 font-sans">
            {formatInlineStyles(line.replace(/^\d+\.\s+/, ''))}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-zinc-300 text-sm leading-relaxed my-1.5">
          {formatInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper to format inline bold, inline code, and backticks
  const formatInlineStyles = (content: string) => {
    // Split on inline code blocks `code`
    const parts = content.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300 font-mono text-xs border border-zinc-700/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      // Split on bold **bold**
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, bi) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`${i}-${bi}`} className="font-semibold text-zinc-100">
              {bPart.slice(2, -2)}
            </strong>
          );
        }
        return bPart;
      });
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-4xl ml-auto mb-6">
        <div className="max-w-2xl bg-zinc-800 border border-zinc-700/80 rounded-2xl rounded-tr-sm px-4 py-3 text-zinc-100 text-sm shadow-sm">
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <span className="block text-right text-[10px] text-zinc-400 mt-1.5 font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex gap-3 max-w-4xl mr-auto mb-8 w-full">
      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-purple-400 shrink-0 mt-1">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 sm:p-5 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-200">NEXUS Study AI</span>

            {/* Grounding Status Indicator */}
            {message.isError ? (
              <Badge variant="rose" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
                AI Error
              </Badge>
            ) : isGrounded ? (
              <Badge variant="grounded" size="sm">
                Verified Source Grounded • {sources.length} citations
              </Badge>
            ) : (
              <Badge variant="ungrounded" size="sm">
                General AI • Not grounded in local materials
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 p-1 hover:text-white rounded hover:bg-zinc-800 transition-colors"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <span className="font-mono text-[10px]">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="text-zinc-200 leading-relaxed font-sans space-y-1">
          {renderFormattedContent(message.content)}
        </div>

        {/* Source References Section (if present) */}
        {sources.length > 0 && (
          <div className="mt-5 pt-4 border-t border-zinc-800/80">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center justify-between w-full p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">
                  Inspect Grounded Source References ({sources.length})
                </span>
              </div>
              {sourcesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {sourcesOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 animate-in fade-in duration-150">
                {sources.map((src: SourceReference, idx: number) => (
                  <SourceReferenceCard key={src.resource_id || idx} source={src} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
