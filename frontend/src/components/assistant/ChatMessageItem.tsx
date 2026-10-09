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

  // Clean markdown formatter
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-heading text-base font-extrabold text-black mt-4 mb-2 first:mt-0">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-heading text-lg font-extrabold text-black mt-5 mb-2.5 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="font-heading text-xl font-extrabold text-black mt-6 mb-3 first:mt-0">
            {line.replace('# ', '')}
          </h2>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="border-2 border-black my-4" />;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-zinc-900 text-sm leading-relaxed my-1 font-medium">
            {formatInlineStyles(line.replace(/^[-*]\s+/, ''))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-5 list-decimal text-zinc-900 text-sm leading-relaxed my-1 font-medium">
            {formatInlineStyles(line.replace(/^\d+\.\s+/, ''))}
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-zinc-900 text-sm leading-relaxed my-1.5 font-medium">
          {formatInlineStyles(line)}
        </p>
      );
    });
  };

  const formatInlineStyles = (content: string) => {
    const parts = content.split(/(`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="bg-[#ffe17c] text-black font-mono text-xs px-1.5 py-0.5 rounded border border-black font-bold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return (
            <strong key={`${i}-${j}`} className="font-extrabold text-black">
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
        <div className="max-w-2xl bg-black text-[#ffe17c] border-2 border-black rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-hard-md">
          <p className="leading-relaxed whitespace-pre-wrap text-sm font-bold">{message.content}</p>
          <span className="block text-right text-[10px] text-white/70 mt-1 font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#ffe17c] border-2 border-black flex items-center justify-center text-black shadow-hard-sm shrink-0">
          <User className="w-5 h-5" />
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex gap-3 max-w-4xl mr-auto mb-8 w-full">
      <div className="w-9 h-9 rounded-xl bg-black border-2 border-black flex items-center justify-center text-[#ffe17c] shadow-hard-sm shrink-0 mt-1">
        <Bot className="w-5 h-5" />
      </div>

      <div className="flex-1 bg-white border-2 border-black rounded-2xl rounded-tl-sm p-5 sm:p-6 shadow-hard-md overflow-hidden">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-black">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-sm font-extrabold text-black">NEXUS AI Study Assistant</span>

            {message.isError ? (
              <Badge variant="rose" size="sm" icon={<AlertCircle className="w-3 h-3 text-black" />}>
                AI Error
              </Badge>
            ) : isGrounded ? (
              <Badge variant="grounded" size="sm">
                Verified Grounded • {sources.length} citations
              </Badge>
            ) : (
              <Badge variant="ungrounded" size="sm">
                General AI Query
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-black text-xs font-bold">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#f4f4f5] hover:bg-[#ffe17c] border border-black transition-colors cursor-pointer"
              title="Copy answer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <span className="font-mono text-[10px] text-zinc-600">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="text-black leading-relaxed font-sans space-y-1">
          {renderFormattedContent(message.content)}
        </div>

        {/* Source References Section */}
        {sources.length > 0 && (
          <div className="mt-6 pt-4 border-t-2 border-black">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center justify-between w-full p-2.5 rounded-xl bg-[#ffe17c] border-2 border-black text-xs font-bold text-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all shadow-hard-sm cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-black" />
                <span>
                  Inspect Grounded Source Citations ({sources.length})
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
