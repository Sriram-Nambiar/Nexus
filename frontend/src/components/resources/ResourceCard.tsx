import React from 'react';
import type { Resource } from '../../api/types';
import { useApp } from '../../context';
import { Card } from '../common/Card';
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
    <Card hoverable className="p-4 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <Badge resourceType={resource.resource_type} size="sm" />
          {showCourseBadge && resource.course_code && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-750">
              {resource.course_code}
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white line-clamp-2 mb-1.5 leading-snug">
          {resource.title}
        </h4>

        {resource.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-2">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
          {isVideo && resource.duration_seconds && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {formatDuration(resource.duration_seconds)}
            </span>
          )}
          {!isVideo && resource.page_count && (
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-zinc-400" />
              {resource.page_count} pages
            </span>
          )}
          {resource.file_size_bytes && <span>{formatSize(resource.file_size_bytes)}</span>}
        </div>

        <Button
          variant={isVideo ? 'primary' : 'secondary'}
          size="sm"
          onClick={handleOpen}
          leftIcon={isVideo ? <Play className="w-3 h-3 fill-current" /> : <Eye className="w-3.5 h-3.5" />}
          className="text-xs py-1 px-2.5"
        >
          {isVideo ? 'Play' : 'Open'}
        </Button>
      </div>
    </Card>
  );
};
