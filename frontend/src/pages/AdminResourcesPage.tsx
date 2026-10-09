import React, { useState, useEffect } from 'react';
import type { Course, ResourceType, Resource } from '../api/types';
import { getCourses, uploadResource } from '../api';
import { useApp } from '../context';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
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
    <div className="min-h-screen bg-[#171e19] py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner: Neo-Brutalist #ffe17c with Radial Dots */}
        <div className="bg-[#ffe17c] bg-radial-dots border-2 border-black rounded-2xl p-6 sm:p-8 shadow-hard-lg">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[#ffe17c] text-xs font-bold border-2 border-black shadow-hard-sm">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>INTRANET CURATION CONSOLE</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-black tracking-tight">
              Resource Ingestion Manager
            </h1>
            <p className="text-sm sm:text-base text-black/85 font-medium max-w-2xl leading-relaxed">
              Upload lecture recordings, lab guides, and textbooks directly to local server disk storage with automated MIME validation and SQLite metadata cataloging.
            </p>
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-hard-lg space-y-6">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Target Course
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f4f4f5] border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none shadow-hard-sm cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resource Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Format Type
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as ResourceType)}
                  className="w-full px-4 py-3 bg-[#f4f4f5] border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none shadow-hard-sm cursor-pointer"
                >
                  <option value="pdf">PDF Textbook / Problem Set</option>
                  <option value="video">MP4 Video Lecture (HTTP 206 Range)</option>
                  <option value="notes">Markdown / Study Notes</option>
                  <option value="lab">Lab / Code Assignment</option>
                  <option value="slides">Presentation Slides</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Resource Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4: Deadlock Prevention and Detection"
                className="w-full px-4 py-3 bg-[#f4f4f5] border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none shadow-hard-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Educational Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a syllabus summary or keywords to facilitate local indexing..."
                rows={3}
                className="w-full px-4 py-3 bg-[#f4f4f5] border-2 border-black rounded-xl text-sm font-medium text-black focus:outline-none shadow-hard-sm resize-none"
              />
            </div>

            {/* File Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                File Attachment (Disk Stored)
              </label>
              <div className="bg-[#ffe17c]/20 border-2 border-dashed border-black rounded-2xl p-6 text-center hover:bg-[#ffe17c]/30 transition-all cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.mp4,.webm,.md,.txt,.zip,.doc,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center shadow-hard-sm">
                    <UploadCloud className="w-6 h-6 text-black" />
                  </div>
                  <div className="text-sm font-bold text-black">
                    {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
                  </div>
                  <div className="text-xs text-zinc-600 font-mono">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • ${selectedFile.type || 'binary'}`
                      : 'Supports PDF, MP4 (Range Streaming), Markdown, TXT'}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-100 border-2 border-black text-red-900 text-xs font-bold flex items-center gap-2 shadow-hard-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-xl bg-[#b7c6c2] border-2 border-black text-black text-xs font-bold flex items-center justify-between shadow-hard-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                  <span>{successMessage}</span>
                </div>
                {lastUploadedResource && (
                  <button
                    type="button"
                    onClick={() => openResourceViewer(lastUploadedResource)}
                    className="underline text-black font-extrabold cursor-pointer hover:text-white"
                  >
                    View Now &rarr;
                  </button>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="neo-btn-primary text-sm py-3 px-6 shadow-hard-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadCloud className="w-4 h-4 text-[#ffe17c]" />
                <span>{isUploading ? `Ingesting (${uploadProgress}%)...` : 'Store on Campus Server'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
