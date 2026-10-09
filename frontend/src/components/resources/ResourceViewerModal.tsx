import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { PdfViewer } from './PdfViewer';
import { VideoPlayer } from './VideoPlayer';
import { Bot, Calendar, HardDrive, User } from 'lucide-react';

export const ResourceViewerModal: React.FC = () => {
  const { viewerState, closeResourceViewer } = useApp();
  const { isOpen, resource, targetPage } = viewerState;
  const navigate = useNavigate();

  if (!isOpen || !resource) return null;

  const handleAskAI = () => {
    closeResourceViewer();
    navigate(`/assistant?course=${resource.course_id}&topic=${encodeURIComponent(resource.title)}`);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeResourceViewer}
      maxWidth="6xl"
      title={
        <div className="flex items-center gap-2.5">
          <Badge resourceType={resource.resource_type} size="sm" />
          <span className="text-base font-semibold text-zinc-100 truncate max-w-xl">
            {resource.title}
          </span>
        </div>
      }
      subtitle={`${resource.course_code || 'UNIV'} • ${resource.course_title || 'Course Material'}`}
    >
      <div className="flex flex-col bg-zinc-950">
        {/* Main Content Viewer: PDF, Video, or Markdown Notes */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80">
          {resource.resource_type === 'pdf' ? (
            <PdfViewer resource={resource} initialPage={targetPage} />
          ) : resource.resource_type === 'video' ? (
            <VideoPlayer resource={resource} />
          ) : (
            /* Notes / Text / Lab Viewer */
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800 text-xs text-zinc-400">
                <span className="font-mono">{resource.file_name || 'document.md'}</span>
                <span>{resource.page_count ? `${resource.page_count} pages` : 'Markdown document'}</span>
              </div>
              <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4 font-mono whitespace-pre-wrap">
                {resource.content_preview || resource.description}
              </div>
            </div>
          )}
        </div>

        {/* Resource Meta & Direct AI Action Footer */}
        <div className="p-4 sm:p-5 bg-zinc-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex flex-wrap items-center gap-4">
            {resource.author && (
              <div className="flex items-center gap-1.5 text-zinc-300">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>{resource.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formatFileSize(resource.file_size_bytes)}</span>
            </div>
            {resource.created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{new Date(resource.created_at).toLocaleDateString()}</span>
              </div>
            )}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {resource.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Bot className="w-4 h-4 text-purple-400" />}
              onClick={handleAskAI}
            >
              Ask AI About This
            </Button>
            <Button variant="ghost" size="sm" onClick={closeResourceViewer}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
