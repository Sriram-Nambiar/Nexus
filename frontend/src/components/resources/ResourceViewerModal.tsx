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
        <div className="flex items-center gap-3">
          <Badge resourceType={resource.resource_type} size="sm" />
          <span className="font-heading text-lg font-extrabold text-black truncate max-w-xl">
            {resource.title}
          </span>
        </div>
      }
      subtitle={`${resource.course_code || 'UNIV'} • ${resource.course_title || 'Course Material'}`}
    >
      <div className="flex flex-col bg-white">
        {/* Main Content Viewer: PDF, Video, or Markdown Notes */}
        <div className="p-4 sm:p-6 border-b-2 border-black">
          {resource.resource_type === 'pdf' ? (
            <PdfViewer resource={resource} initialPage={targetPage} />
          ) : resource.resource_type === 'video' ? (
            <VideoPlayer resource={resource} />
          ) : (
            /* Notes / Text / Lab Viewer */
            <div className="bg-[#f4f4f5] border-2 border-black rounded-xl p-6 max-h-[60vh] overflow-y-auto shadow-hard-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black text-xs font-mono font-bold text-black">
                <span>{resource.file_name || 'document.md'}</span>
                <span>{resource.page_count ? `${resource.page_count} pages` : 'Markdown document'}</span>
              </div>
              <div className="text-black text-sm leading-relaxed space-y-4 font-mono whitespace-pre-wrap">
                {resource.content_preview || resource.description}
              </div>
            </div>
          )}
        </div>

        {/* Resource Meta & Direct AI Action Footer */}
        <div className="p-4 sm:p-5 bg-[#ffe17c] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold text-black">
          <div className="flex flex-wrap items-center gap-4">
            {resource.author && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border-2 border-black">
                <User className="w-3.5 h-3.5 text-black" />
                <span>{resource.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border-2 border-black">
              <HardDrive className="w-3.5 h-3.5 text-black" />
              <span>{formatFileSize(resource.file_size_bytes)}</span>
            </div>
            {resource.created_at && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border-2 border-black">
                <Calendar className="w-3.5 h-3.5 text-black" />
                <span>{new Date(resource.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Bot className="w-4 h-4 text-[#ffe17c]" />}
              onClick={handleAskAI}
              className="shadow-hard-sm"
            >
              Ask AI About This
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={closeResourceViewer}
              className="shadow-hard-sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
