import React from 'react';
import type { SourceReference, Resource } from '../../api/types';
import { useApp } from '../../context';
import { Badge } from '../common/Badge';
import { ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '../common/Button';

interface SourceReferenceCardProps {
  source: SourceReference;
  index: number;
}

export const SourceReferenceCard: React.FC<SourceReferenceCardProps> = ({ source, index }) => {
  const { openResourceViewer } = useApp();

  const handleOpenSource = () => {
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
    <div className="bg-white border-2 border-black rounded-xl p-4 shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black text-[#ffe17c] font-bold border-2 border-black">
              [{index + 1}]
            </span>
            <Badge resourceType={source.resource_type} size="sm" />
            {source.course_code && (
              <span className="text-[11px] font-mono font-bold text-black bg-[#f4f4f5] px-2 py-0.5 rounded border border-black">
                {source.course_code}
              </span>
            )}
          </div>

          {source.page_number && (
            <span className="text-xs font-mono font-bold text-black bg-[#b7c6c2] px-2 py-0.5 rounded border-2 border-black shadow-hard-sm shrink-0">
              Page {source.page_number}
            </span>
          )}
        </div>

        <h5 className="font-heading text-xs font-extrabold text-black mb-1 leading-snug">
          {source.resource_title}
        </h5>

        {source.section && (
          <p className="text-[11px] text-zinc-600 mb-2 font-mono font-bold">{source.section}</p>
        )}

        {/* Quoted passage */}
        <div className="bg-[#ffe17c] border-2 border-black rounded-lg p-2.5 my-2 text-xs text-black font-medium italic leading-relaxed">
          "{source.passage}"
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenSource}
          leftIcon={<BookOpen className="w-3 h-3 text-black" />}
          rightIcon={<ExternalLink className="w-3 h-3 text-black" />}
          className="text-xs py-1 px-3 shadow-hard-sm"
        >
          {source.page_number ? `Open Page ${source.page_number}` : 'Open Resource'}
        </Button>
      </div>
    </div>
  );
};
