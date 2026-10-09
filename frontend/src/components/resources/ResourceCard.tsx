import React from 'react';
import type { Resource } from '../../api/types';
import { useApp } from '../../context';
import { Badge } from '../common/Badge';
import { Play, Eye, Clock, FileText } from 'lucide-react';
import { Button } from '../common/Button';

interface ResourceCardProps {
  resource: Resource;
  showCourseBadge?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  showCourseBadge = false,
}) => {
  const { openResourceViewer } = useApp();

  const formatSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handleOpen = () => {
    openResourceViewer(resource);
  };

  const isVideo = resource.resource_type === 'video';

  return (
    <div className="bg-white border-2 border-black rounded-xl p-5 shadow-hard-md hover:shadow-hard-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge resourceType={resource.resource_type} size="sm" />
          {showCourseBadge && resource.course_code && (
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black text-[#ffe17c] border-2 border-black shadow-hard-sm">
              {resource.course_code}
            </span>
          )}
        </div>

        <h3 className="font-heading text-base font-extrabold text-black group-hover:text-black line-clamp-2 mb-2 leading-snug">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-xs text-zinc-700 font-medium line-clamp-2 mb-4 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t-2 border-black flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-[11px] text-black font-mono font-bold">
          {isVideo && resource.duration_seconds && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-black" />
              {formatDuration(resource.duration_seconds)}
            </span>
          )}
          {!isVideo && resource.page_count && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-black" />
              {resource.page_count} pp
            </span>
          )}
          {resource.file_size_bytes && <span>{formatSize(resource.file_size_bytes)}</span>}
        </div>

        <Button
          variant={isVideo ? 'yellow' : 'secondary'}
          size="sm"
          onClick={handleOpen}
          leftIcon={isVideo ? <Play className="w-3 h-3 fill-current" /> : <Eye className="w-3.5 h-3.5" />}
          className="text-xs py-1 px-3 shadow-hard-sm"
        >
          {isVideo ? 'Stream' : 'Read'}
        </Button>
      </div>
    </div>
  );
};
