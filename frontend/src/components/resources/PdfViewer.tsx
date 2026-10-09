import React, { useState } from 'react';
import type { Resource } from '../../api/types';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';

interface PdfViewerProps {
  resource: Resource;
  initialPage?: number;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ resource, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [prevInitial, setPrevInitial] = useState<number>(initialPage);
  const totalPages = resource.page_count || 34;
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'embed' | 'reader'>('embed');

  if (initialPage !== prevInitial) {
    setPrevInitial(initialPage);
    setCurrentPage(initialPage);
  }

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(175, prev + 25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(75, prev - 25));
  };

  // Embed URL with page anchor
  const embedUrl = `${resource.file_url}#page=${currentPage}`;

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Viewer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setCurrentPage(val);
                }
              }}
              className="w-12 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-center text-white focus:outline-none focus:border-zinc-500 font-mono"
            />
            <span className="text-zinc-500">of {totalPages}</span>
          </div>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Zoom Controls & Mode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-zinc-800 p-0.5 border border-zinc-750">
            <button
              onClick={() => setViewMode('embed')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'embed' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              PDF Frame
            </button>
            <button
              onClick={() => setViewMode('reader')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'reader' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Study Reader
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5 border border-zinc-750">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-zinc-300 font-mono text-[11px]">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <a
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in Tab</span>
          </a>
          <a
            href={resource.file_url}
            download={resource.file_name || `${resource.title}.pdf`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Viewer Main Body */}
      <div className="flex-1 bg-zinc-950 overflow-auto relative min-h-[480px] max-h-[75vh] flex justify-center p-3 sm:p-6">
        {viewMode === 'embed' ? (
          <div
            className="w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-inner flex flex-col"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            <object
              data={embedUrl}
              type="application/pdf"
              className="w-full h-full flex-1"
            >
              {/* Fallback if browser blocks PDF rendering inside object */}
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-900">
                <FileText className="w-12 h-12 text-zinc-500 mb-3" />
                <h4 className="text-base font-semibold text-zinc-200 mb-1">
                  In-Browser PDF View
                </h4>
                <p className="text-sm text-zinc-400 max-w-md mb-4">
                  {resource.title} (Page {currentPage} of {totalPages})
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setViewMode('reader')}>
                    Switch to Study Reader View
                  </Button>
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white"
                  >
                    Open PDF Document
                  </a>
                </div>
              </div>
            </object>
          </div>
        ) : (
          /* Study Reader mode */
          <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800 text-xs text-zinc-400">
              <span className="font-mono uppercase tracking-wider text-zinc-300">
                {resource.course_code} • Section Document
              </span>
              <span className="font-mono bg-zinc-800 px-2.5 py-1 rounded text-zinc-300">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <h3 className="text-xl font-bold text-zinc-100 mb-3">{resource.title}</h3>

            <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed space-y-4">
              <div className="p-4 bg-zinc-950/60 rounded-lg border border-zinc-800/80 font-mono text-xs text-zinc-400">
                <p className="text-zinc-300 font-semibold mb-1">Explanatory Excerpt for Page {currentPage}:</p>
                <p className="leading-relaxed">
                  {resource.content_preview ||
                    'Detailed course material for this page covers algorithms, core invariants, system architecture diagrams, and problem formulations.'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/40 text-blue-200 text-xs leading-relaxed">
                <p className="font-semibold mb-1">Study Guide Tip:</p>
                <p>
                  You can use the <strong>AI Study Assistant</strong> tab to ask specific questions about this page
                  or cross-reference with past exam questions and recitation recordings.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-zinc-800 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentPage <= 1}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous Page
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
