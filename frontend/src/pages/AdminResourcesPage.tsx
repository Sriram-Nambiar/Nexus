import React, { useState, useEffect } from 'react';
import type { Course, ResourceType, Resource } from '../api/types';
import { getCourses, uploadResource } from '../api';
import { useApp } from '../context';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const AdminResourcesPage: React.FC = () => {
  const { openResourceViewer } = useApp();
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('pdf');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUploadedResource, setLastUploadedResource] = useState<Resource | null>(null);

  useEffect(() => {
    let isMounted = true;
    getCourses().then((data) => {
      if (isMounted) {
        setCourses(data);
        if (data.length > 0) {
          setCourseId(data[0].id);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Auto-populate title from clean filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please specify a resource title.');
      return;
    }
    if (!courseId) {
      setErrorMessage('Please select a course.');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await uploadResource(
        {
          title: title.trim(),
          course_id: courseId,
          resource_type: resourceType,
          description: description.trim(),
          file: selectedFile,
        },
        (percent) => {
          setUploadProgress(percent);
        }
      );

      setSuccessMessage(`Resource "${res.title}" successfully added to ${res.course_code || 'course'}!`);
      setLastUploadedResource(res);
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to upload educational resource.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Security & Scope Notice banner */}
      {/* Fulfills requirement: "Do not expose this page as a secure administrative system unless authentication and authorization are implemented by the backend." */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
        <div className="flex items-center gap-2 text-zinc-200 font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Local Educational Material Uploader (Campus Node Environment)</span>
        </div>
        <p className="leading-relaxed pl-6">
          Backend authentication and role-based authorization are not currently enforced in this offline campus node deployment.
          This tool is provided for locally hosting and indexing approved university lecture notes, slides, and educational media.
        </p>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Add Educational Material
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Upload and index lecture notes, textbooks, and video files to make them searchable and grounded in the AI assistant.
        </p>
      </div>

      {/* Main Upload Form */}
      <Card className="p-6 bg-zinc-900/90 border-zinc-800">
        <form onSubmit={handleUpload} className="space-y-5">
          {/* Resource Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Resource Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lecture 06: Paging Schemes and Page Fault Handling"
              disabled={isUploading}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Course & Resource Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Target Course <span className="text-rose-400">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Resource Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700 capitalize"
              >
                <option value="pdf">PDF Document / Textbook</option>
                <option value="video">Video Lecture (MP4 / WebM)</option>
                <option value="notes">Lecture Notes / Cheatsheet</option>
                <option value="slides">Presentation Slides</option>
                <option value="lab">Lab Assignment / Code</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Summary / Topic Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key concepts, syllabus section, or topics covered for AI grounding..."
              rows={2}
              disabled={isUploading}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 resize-none"
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Educational File <span className="text-rose-400">*</span>
            </label>
            <div className="border border-dashed border-zinc-800 rounded-xl p-5 bg-zinc-950/60 flex flex-col items-center justify-center text-center hover:border-zinc-700 transition-colors">
              <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.mp4,.webm,.md,.txt,.c,.py,.zip,.tar.gz"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-xs font-medium text-zinc-200 bg-zinc-850 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-750 transition-colors inline-flex items-center gap-2 mb-2"
              >
                <span>{selectedFile ? 'Change File' : 'Select Local File'}</span>
              </label>

              {selectedFile ? (
                <div className="text-xs font-mono text-zinc-300 flex items-center gap-2">
                  <span className="font-semibold">{selectedFile.name}</span>
                  <span className="text-zinc-500">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500">
                  Supported formats: PDF, MP4, Markdown, C, Python source files
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar (during upload) */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>Uploading and indexing resource...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
              {lastUploadedResource && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openResourceViewer(lastUploadedResource)}
                  className="text-xs py-1 px-2.5"
                >
                  Preview
                </Button>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUploading}
              disabled={isUploading}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Upload Educational Material
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
