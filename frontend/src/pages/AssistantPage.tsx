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
  content: `### Welcome to NEXUS AI Study Assistant

I am your offline campus AI study companion. I answer questions directly using educational materials, lecture recordings, and textbook chapters stored on this local server node.

- **Select a course context** above to focus answers on a specific syllabus.
- Inspect exact **source citations, verified passages, and textbook page numbers**, and jump straight into the reader.
- 100% offline-ready with zero external internet dependencies.`,
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
        content: `**AI Service Notice**\n\n${errMsg}\n\nPlease verify that the local campus backend or AI container is running. You can also toggle simulated responses if operating without the Python container.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [questionInput, isLoading, selectedCourseId]);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        content: 'Conversation history reset. What would you like to explore today?',
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
    <div className="min-h-screen bg-[#171e19] py-6 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)] space-y-4">
        {/* Top Header & Controls: Neo-Brutalist #ffe17c banner */}
        <div className="bg-[#ffe17c] bg-radial-dots border-2 border-black rounded-2xl p-4 sm:p-5 shadow-hard-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black border-2 border-black rounded-xl flex items-center justify-center text-[#ffe17c] shadow-hard-sm shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-lg sm:text-xl font-extrabold text-black tracking-tight flex items-center gap-2">
                <span>Syllabus AI Assistant</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                  Grounding Active
                </span>
              </h1>
              <p className="text-xs text-black/80 font-bold">
                {selectedCourse
                  ? `Active Syllabus: ${selectedCourse.code} • ${selectedCourse.title}`
                  : 'Searching across all campus course materials'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Course Context Selector */}
            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSearchParams(e.target.value ? { course: e.target.value } : {});
                }}
                className="text-xs bg-white border-2 border-black text-black font-bold rounded-xl px-3 py-2 pr-8 focus:outline-none shadow-hard-sm appearance-none cursor-pointer"
              >
                <option value="">All Courses (Global Scope)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-black absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearHistory}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs py-1.5 px-3 shadow-hard-sm"
              title="Reset conversation"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto pr-2 py-2 space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-2xl mr-auto mb-6">
              <div className="w-9 h-9 rounded-xl bg-black border-2 border-black flex items-center justify-center text-[#ffe17c] shrink-0 mt-1 shadow-hard-sm">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border-2 border-black text-xs font-bold text-black flex items-center gap-3 shadow-hard-md">
                <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                <span>Searching local lecture notes and extracting verified citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Area: Prompts & Input Bar */}
        <div className="shrink-0 pt-2 space-y-3">
          {/* Quick Prompts Carousel */}
          {messages.length <= 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-xs font-bold text-[#b7c6c2] shrink-0 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ffe17c]" /> Ideas:
              </span>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#ffe17c] border-2 border-black text-black text-xs font-bold transition-all shrink-0 whitespace-nowrap text-left shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer"
                >
                  <span className="bg-black text-[#ffe17c] px-1.5 py-0.2 rounded text-[10px] mr-1.5 font-mono">
                    {q.course}
                  </span>
                  {q.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Textarea and Send Button */}
          <div className="flex items-end gap-3 bg-white border-2 border-black rounded-2xl p-2.5 shadow-hard-md">
            <textarea
              ref={inputRef}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedCourse
                  ? `Ask a question regarding ${selectedCourse.code} (${selectedCourse.title})...`
                  : 'Ask about course concepts, algorithms, exam theorems...'
              }
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-black placeholder-zinc-500 font-medium resize-none px-2 py-1.5 focus:outline-none max-h-32 min-h-[40px]"
            />

            <button
              onClick={() => handleSend()}
              disabled={!questionInput.trim() || isLoading}
              className="neo-btn-primary py-2.5 px-4 h-11 text-sm shadow-hard-sm shrink-0"
              aria-label="Send query"
            >
              <Send className="w-4 h-4 text-[#ffe17c]" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#b7c6c2] px-2">
            <span>Enter sends • Shift + Enter new line</span>
            <span>Local Python Microservice / Edge Inference</span>
          </div>
        </div>
      </div>
    </div>
  );
};
