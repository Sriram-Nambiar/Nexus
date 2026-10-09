import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Course } from '../api/types';
import { getCourses, askAI } from '../api';
import { ChatMessageItem } from '../components/assistant/ChatMessageItem';
import type { ChatMessage } from '../components/assistant/ChatMessageItem';
import { Button } from '../components/common/Button';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `### Welcome to NEXUS Study Assistant

I am your offline campus AI study companion. I answer questions directly using the educational materials, lecture notes, and textbook chapters hosted on this local campus server.

- **Select a course context** above to focus answers on a specific syllabus.
- When an answer is grounded, you can inspect the exact **source references, quotations, and page numbers**, and jump directly to that page in the PDF reader.
- If a question is outside the local curriculum, I will let you know instead of pretending it is source-grounded.`,
  timestamp: new Date().toISOString(),
  responseMeta: {
    answer: '',
    sources: [],
    grounded: false,
    generated_at: new Date().toISOString(),
  },
};

export const AssistantPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course') || '';
  const initialQuestion = searchParams.get('q') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [questionInput, setQuestionInput] = useState<string>(initialQuestion);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasSentInitialQuestion = useRef(false);

  const handleSend = useCallback(async (questionToSend?: string) => {
    const text = (questionToSend !== undefined ? questionToSend : questionInput).trim();
    if (!text || isLoading) return;

    setQuestionInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askAI({
        course_id: selectedCourseId || undefined,
        question: text,
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        responseMeta: response,
        timestamp: response.generated_at,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Unable to communicate with the AI service.';

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**AI Service Unavailable**\n\n${errMsg}\n\nPlease verify that the local campus backend or AI container is running. You can also toggle "Simulate Offline" in the sidebar to test local cached responses.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [questionInput, isLoading, selectedCourseId]);

  // Load courses for course selector
  useEffect(() => {
    let isMounted = true;
    getCourses().then((data) => {
      if (isMounted) {
        setCourses(data);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Pre-fill question if passed in query param
  useEffect(() => {
    if (initialQuestion && !hasSentInitialQuestion.current && !isLoading) {
      hasSentInitialQuestion.current = true;
      handleSend(initialQuestion);
    }
  }, [initialQuestion, isLoading, handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation cleared. How can I help with your studies today?',
        timestamp: new Date().toISOString(),
        responseMeta: {
          answer: '',
          sources: [],
          grounded: false,
          generated_at: new Date().toISOString(),
        },
      },
    ]);
  };

  const suggestedQuestions = [
    {
      course: 'CS-301',
      text: 'What are the four Coffman conditions required for deadlocks?',
    },
    {
      course: 'CS-301',
      text: 'Explain Banker\'s Algorithm safety matrix check and execution sequence.',
    },
    {
      course: 'CS-340',
      text: 'How does Raft leader election work and how are split votes resolved?',
    },
    {
      course: 'CS-210',
      text: 'What are the 5 invariant properties of Red-Black Trees?',
    },
    {
      course: 'General',
      text: 'What is the purpose of the Translation Lookaside Buffer (TLB)?',
    },
  ];

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Header & Course Selector Controls */}
      <div className="pb-3 mb-3 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              AI Study Assistant
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Source Grounded
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              {selectedCourse
                ? `Context: ${selectedCourse.code} • ${selectedCourse.title}`
                : 'Searching across all campus course materials'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Course Context Selector */}
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSearchParams(e.target.value ? { course: e.target.value } : {});
              }}
              className="text-xs bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-zinc-700 appearance-none font-mono cursor-pointer"
            >
              <option value="">All Courses (Global Context)</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            leftIcon={<RotateCcw className="w-3 h-3 text-zinc-400" />}
            className="text-xs py-1 px-2 text-zinc-400 hover:text-zinc-200"
            title="Reset conversation"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto pr-1 py-2 space-y-4">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-2xl mr-auto mb-6">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-purple-400 shrink-0 mt-1">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>Analyzing lecture notes and searching verified source passages...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Area: Quick Prompts & Input Bar */}
      <div className="shrink-0 pt-3 border-t border-zinc-850 space-y-2.5 bg-zinc-950">
        {/* Suggested Questions Carousel */}
        {messages.length <= 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-zinc-500 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Prompts:
            </span>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.text)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-300 hover:text-white text-xs transition-colors shrink-0 whitespace-nowrap text-left"
              >
                <span className="text-purple-400 font-mono text-[10px] mr-1">[{q.course}]</span>
                {q.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Textarea and Send Button */}
        <div className="relative flex items-end gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700">
          <textarea
            ref={inputRef}
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedCourse
                ? `Ask a question about ${selectedCourse.code}...`
                : 'Ask anything about your course materials, algorithms, formulas...'
            }
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 resize-none px-2 py-1.5 focus:outline-none max-h-32 min-h-[36px]"
          />

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSend()}
            disabled={!questionInput.trim() || isLoading}
            isLoading={isLoading}
            className="shrink-0 h-9 px-3.5"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-zinc-950" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>Offline Grounded AI Model</span>
        </div>
      </div>
    </div>
  );
};
