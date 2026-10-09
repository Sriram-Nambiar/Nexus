import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchResult } from '../api/types';
import { searchResources, getResourceById } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import { useApp } from '../context';
import { SearchInput } from '../components/common/SearchInput';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Search,
  BookOpen,
  Filter,
  Eye,
  Play,
  Sparkles,
} from 'lucide-react';

const getFallbackTimestamp = () => new Date().toISOString();

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { openResourceViewer } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  useEffect(() => {
    let isMounted = true;

    async function executeSearch() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      setSearchParams({ q: debouncedQuery });

      try {
        const data = await searchResources(debouncedQuery);
        if (isMounted) {
          setResults(data);
        }
      } catch {
        if (isMounted) {
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, setSearchParams]);

  const filteredResults = results.filter((r) => {
    if (selectedType === 'all') return true;
    return r.resource_type === selectedType;
  });

  const handleOpenResult = async (res: SearchResult) => {
    try {
      const fullResource = await getResourceById(res.resource_id);
      openResourceViewer(fullResource, res.page_number);
    } catch {
      openResourceViewer({
        id: res.resource_id,
        course_id: res.course_id,
        course_title: res.course_title,
        course_code: res.course_code,
        title: res.resource_title,
        resource_type: res.resource_type,
        file_url: res.file_url,
        created_at: getFallbackTimestamp(),
        content_preview: res.matching_snippet,
      }, res.page_number);
    }
  };

  const sampleSearchTerms = [
    'Deadlocks',
    'Banker\'s Algorithm',
    'Machine Learning',
    'NPTEL',
    'Virtual Memory',
    'Raft Consensus',
    'Scheduling',
  ];

  return (
    <div className="min-h-screen bg-[#171e19] py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner: Neo-Brutalist #ffe17c with Radial Dots */}
        <div className="bg-[#ffe17c] bg-radial-dots border-2 border-black rounded-2xl p-6 sm:p-8 shadow-hard-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[#ffe17c] text-xs font-bold border-2 border-black shadow-hard-sm">
              <Search className="w-3.5 h-3.5" />
              <span>METADATA & INDEXED PASSAGES</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-black tracking-tight">
              Global Academic Search
            </h1>
            <p className="text-sm sm:text-base text-black/85 font-medium max-w-2xl leading-relaxed">
              Search indexed course syllabi, lecture notes, textbook chapters, and video timestamps across all campus courses.
            </p>
          </div>
        </div>

        {/* Main Search Input */}
        <div className="bg-white border-2 border-black rounded-xl p-4 shadow-hard-md space-y-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search topics (e.g. deadlocks, machine learning, banker's algorithm, paging)..."
            autoFocus
            className="text-base"
          />

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
            <span className="text-black font-bold text-xs shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-black" /> Suggestions:
            </span>
            {sampleSearchTerms.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-lg bg-[#f4f4f5] hover:bg-[#ffe17c] border-2 border-black text-black text-xs font-bold transition-all shrink-0 cursor-pointer shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter Tabs */}
        {hasSearched && (
          <div className="flex items-center justify-between border-b-2 border-black pb-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-[#b7c6c2] flex items-center gap-1 font-bold mr-1">
                <Filter className="w-4 h-4 text-[#ffe17c]" /> Filter:
              </span>
              {['all', 'pdf', 'video', 'notes', 'lab'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1.5 rounded-xl capitalize font-bold border-2 border-black transition-all cursor-pointer ${
                    selectedType === type
                      ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                      : 'bg-white text-black hover:bg-[#ffe17c] shadow-hard-sm'
                  }`}
                >
                  {type === 'all' ? 'All Formats' : type}
                </button>
              ))}
            </div>

            <span className="text-[#b7c6c2] font-mono font-bold text-xs hidden sm:inline">
              {filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'} found
            </span>
          </div>
        )}

        {/* Results List */}
        {isLoading ? (
          <LoadingSpinner label="Scanning local academic corpus and metadata..." className="py-16" />
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4">
            {filteredResults.map((res) => (
              <div
                key={res.id}
                onClick={() => handleOpenResult(res)}
                className="p-5 sm:p-6 rounded-xl bg-white border-2 border-black shadow-hard-md hover:shadow-hard-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-black text-[#ffe17c] border-2 border-black shadow-hard-sm">
                      {res.course_code}
                    </span>
                    <span className="text-xs font-bold text-black">
                      {res.course_title}
                    </span>
                    <Badge resourceType={res.resource_type} size="sm" />
                    {res.page_number && (
                      <span className="text-xs font-mono font-bold text-black bg-[#b7c6c2] px-2.5 py-1 rounded border-2 border-black shadow-hard-sm">
                        Page {res.page_number}
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading text-base sm:text-lg font-extrabold text-black group-hover:text-black leading-snug">
                    {res.resource_title}
                  </h3>

                  {/* Relevant Matching Excerpt snippet */}
                  <div className="text-xs text-black bg-[#ffe17c] p-3 rounded-xl border-2 border-black font-sans leading-relaxed">
                    <span className="text-black font-mono text-[10px] uppercase font-bold block mb-1">
                      Matched Excerpt:
                    </span>
                    <p className="line-clamp-2 italic font-medium">
                      "{res.matching_snippet}"
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end sm:flex-col sm:items-end gap-2">
                  <Button
                    variant={res.resource_type === 'video' ? 'yellow' : 'secondary'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenResult(res);
                    }}
                    leftIcon={
                      res.resource_type === 'video' ? (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )
                    }
                    className="text-xs py-2 px-4 shadow-hard-sm"
                  >
                    {res.resource_type === 'video' ? 'Play Video' : 'Read PDF'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched && query.trim() ? (
          <EmptyState
            icon={<Search className="w-10 h-10 text-black" />}
            title={`No results found for "${query}"`}
            description="Try checking for keywords such as 'machine learning', 'deadlocks', or 'banker'."
            actionLabel="Reset Search"
            onAction={() => {
              setQuery('');
              setHasSearched(false);
            }}
          />
        ) : (
          <EmptyState
            icon={<BookOpen className="w-10 h-10 text-black" />}
            title="Search the offline university repository"
            description="Type a keyword above to find lecture notes, textbook chapters, videos, and code examples indexed across all courses."
          />
        )}
      </div>
    </div>
  );
};
