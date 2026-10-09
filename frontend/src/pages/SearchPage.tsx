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
      // Fallback object
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
    'Virtual Memory',
    'Raft Consensus',
    'Red-Black Trees',
    'Scheduling',
    'TLB',
    'ARIES',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Global Academic Search
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Search indexed course syllabi, lecture notes, textbook chapters, and video timestamps across all campus courses.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="space-y-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search topics (e.g. deadlocks, banker's algorithm, raft, paging)..."
          autoFocus
          className="text-base"
        />

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
          <span className="text-zinc-500 font-mono text-[11px] shrink-0">Suggestions:</span>
          {sampleSearchTerms.map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-colors shrink-0"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter Tabs (when there are results or search query) */}
      {hasSearched && (
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-zinc-500 flex items-center gap-1 font-medium mr-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {['all', 'pdf', 'video', 'notes', 'lab'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-850'
                }`}
              >
                {type === 'all' ? 'All Formats' : type}
              </button>
            ))}
          </div>

          <span className="text-zinc-500 font-mono text-[11px] hidden sm:inline">
            {filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'} found
          </span>
        </div>
      )}

      {/* Results List */}
      {isLoading ? (
        <LoadingSpinner label="Searching local academic corpus..." className="py-12" />
      ) : filteredResults.length > 0 ? (
        <div className="space-y-3">
          {filteredResults.map((res) => (
            <div
              key={res.id}
              onClick={() => handleOpenResult(res)}
              className="p-4 sm:p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-750">
                    {res.course_code}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {res.course_title}
                  </span>
                  <Badge resourceType={res.resource_type} size="sm" />
                  {res.page_number && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      Page {res.page_number}
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-white leading-snug">
                  {res.resource_title}
                </h4>

                {/* Relevant Matching Excerpt snippet */}
                <div className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850 font-sans leading-relaxed">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">
                    Matching excerpt:
                  </span>
                  <p className="line-clamp-2 italic">
                    "{res.matching_snippet}"
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end sm:flex-col sm:items-end gap-2">
                <Button
                  variant={res.resource_type === 'video' ? 'primary' : 'secondary'}
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
                  className="text-xs py-1.5 px-3"
                >
                  {res.resource_type === 'video' ? 'Play Video' : 'Open Resource'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched && query.trim() ? (
        <EmptyState
          icon={<Search className="w-8 h-8 text-zinc-500" />}
          title={`No results found for "${query}"`}
          description="Try checking for typos or searching by broader keywords such as 'concurrency', 'deadlocks', or 'trees'."
          actionLabel="Clear Search"
          onAction={() => {
            setQuery('');
            setHasSearched(false);
          }}
        />
      ) : (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-zinc-500" />}
          title="Search the offline university repository"
          description="Type a keyword above to find lecture notes, textbook chapters, videos, and code examples indexed across all courses."
        />
      )}
    </div>
  );
};
