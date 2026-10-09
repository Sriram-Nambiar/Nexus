import React from 'react';
import type { SourceReference, Resource } from '../../api/types';
import { useApp } from '../../context';
import { Badge } from '../common/Badge';
import { ExternalLink, BookOpen, Quote } from 'lucide-react';
import { Button } from '../common/Button';

interface SourceReferenceCardProps {
  source: SourceReference;
  index: number;
}

export const SourceReferenceCard: React.FC<SourceReferenceCardProps> = ({ source, index }) => {
  const { openResourceViewer } = useApp();

  const handleOpenSource = () => {
    // Construct a resource object to pass to the in-browser viewer
    const resourceObj: Resource = {
      id: source.resource_id,
      course_id: source.course_id,
      course_title: source.course_title,
      course_code: source.course_code || 'UNIV',
      title: source.resource_title,
      resource_type: source.resource_type,
      file_url: source.file_url,
      page_count: source.page_number ? Math.max(30, source.page_number + 5) : undefined,
      created_at: new Date().toISOString(),
      content_preview: source.passage,
    };

    openResourceViewer(resourceObj, source.page_number);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 hover:border-zinc-700/80 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold border border-zinc-700">
            [{index + 1}]
          </span>
          <Badge resourceType={source.resource_type} size="sm" />
          {source.course_code && (
            <span className="text-[11px] font-mono text-zinc-400">
              {source.course_code}
            </span>
          )}
        </div>

        {source.page_number && (
          <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 shrink-0">
            Page {source.page_number}
          </span>
        )}
      </div>

      <h5 className="text-xs font-semibold text-zinc-200 mb-1 leading-snug">
        {source.resource_title}
      </h5>

      {source.section && (
        <p className="text-[11px] text-zinc-400 mb-2 font-mono">{source.section}</p>
      )}

      {/* Quoted passage */}
      <div className="relative pl-3 pr-2 py-1.5 my-2 border-l-2 border-zinc-700 bg-zinc-950/40 rounded-r text-xs text-zinc-300 italic font-sans leading-relaxed">
        <Quote className="w-3 h-3 text-zinc-500 absolute -top-1.5 -left-1 opacity-60" />
        "{source.passage}"
      </div>

      <div className="flex justify-end pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenSource}
          leftIcon={<BookOpen className="w-3 h-3 text-zinc-400" />}
          rightIcon={<ExternalLink className="w-3 h-3 opacity-60" />}
          className="text-xs py-1 px-2.5 bg-zinc-800/60"
        >
          {source.page_number ? `Open Page ${source.page_number}` : 'Open Resource'}
        </Button>
      </div>
    </div>
  );
};
