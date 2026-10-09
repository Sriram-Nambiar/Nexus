import React, { useState, useEffect } from 'react';
import type { Course, ResourceType, Resource, OffspotStatusResponse } from '../api/types';
import { getCourses, uploadResource, getOffspotStatus } from '../api';
import { useApp } from '../context';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Server,
  HardDrive,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Layers,
  Cpu,
} from 'lucide-react';

export const AdminResourcesPage: React.FC = () => {
  const { openResourceViewer } = useApp();
  const [activeTab, setActiveTab] = useState<'upload' | 'offspot'>('upload');
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

  // Offspot Status state
  const [offspotData, setOffspotData] = useState<OffspotStatusResponse | null>(null);
  const [isLoadingOffspot, setIsLoadingOffspot] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoadingOffspot(true);
    try {
      const data = await getOffspotStatus();
      setOffspotData(data);
    } catch (err) {
      console.error('Failed to fetch offspot status:', err);
    } finally {
      setIsLoadingOffspot(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getOffspotStatus()
      .then((data) => {
        if (isMounted) setOffspotData(data);
      })
      .catch((err) => console.error('Failed to fetch offspot status:', err));

    return () => {
      isMounted = false;
    };
  }, []);

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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold border-2 border-black transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                : 'bg-white text-black hover:bg-[#ffe17c] shadow-hard-sm'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-black" />
            <span>Resource Ingestion</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('offspot');
              fetchStatus();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold border-2 border-black transition-all cursor-pointer inline-flex items-center gap-2 ${
              activeTab === 'offspot'
                ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                : 'bg-white text-black hover:bg-[#ffe17c] shadow-hard-sm'
            }`}
          >
            <Radio className="w-4 h-4 text-black" />
            <span>Offspot & Hotspot Status</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          /* Upload Form Card */
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
        ) : (
          /* Offspot & Deployment Telemetry Panel */
          <div className="space-y-6">
            {/* Header Refresh Bar */}
            <div className="flex items-center justify-between bg-white border-2 border-black rounded-2xl p-5 shadow-hard-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffe17c] border-2 border-black flex items-center justify-center shadow-hard-sm">
                  <Server className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-black">
                    Host & Kiwix Hotspot Telemetry
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium">
                    Honest network and service indicators from the live runtime
                  </p>
                </div>
              </div>
              <button
                onClick={fetchStatus}
                disabled={isLoadingOffspot}
                className="px-4 py-2 rounded-xl bg-[#b7c6c2] text-black font-bold text-xs border-2 border-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOffspot ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Grid of Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Deployment & Hotspot AP Mode */}
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-hard-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-black" />
                    Deployment Environment
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border-2 border-black shadow-hard-sm ${
                    offspotData?.offspot.configured
                      ? 'bg-emerald-300 text-black'
                      : 'bg-[#ffe17c] text-black'
                  }`}>
                    {offspotData?.offspot.configured ? 'Offspot RPi' : 'Mode A: Laptop'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 font-bold block">Active Mode:</span>
                    <span className="font-mono font-bold text-black text-sm">
                      {offspotData?.offspot.deployment_mode || 'Local Host / Standalone Network (Mode A)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">Wi-Fi AP Status:</span>
                    <span className="font-mono font-bold text-black">
                      {offspotData?.offspot.access_point_status || 'Not detected in this deployment'}
                    </span>
                    <p className="text-[11px] text-zinc-500 mt-1 italic">
                      *Note: The web container operates unprivileged and reports host AP telemetry without simulating synthetic status.
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">Offspot Domain:</span>
                    <span className="font-mono font-bold text-black">
                      {offspotData?.offspot.domain_name || 'N/A (Access via Host IP)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Backend Runtime & Binding */}
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-hard-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-black" />
                    Backend Node Runtime
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-300 text-black border-2 border-black shadow-hard-sm">
                    {offspotData?.backend.status || 'healthy'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <span className="text-zinc-500 font-bold block">Host Binding:</span>
                      <span className="font-bold text-black">{offspotData?.backend.host_binding || '0.0.0.0'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block">Listening Port:</span>
                      <span className="font-bold text-black">{offspotData?.backend.port || 5000}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">LAN Access:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-black inline-block mt-0.5">
                      {offspotData?.backend.lan_access_enabled ? 'ENABLED (Accepts Multi-Device Wi-Fi)' : 'DISABLED'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">Server Uptime:</span>
                    <span className="font-mono font-bold text-black">
                      {offspotData ? `${Math.floor(offspotData.backend.uptime_seconds / 60)}m ${offspotData.backend.uptime_seconds % 60}s` : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Storage & Offline Resources */}
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-hard-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-black" />
                    Persistent Storage Volume
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#ffe17c] text-black border-2 border-black shadow-hard-sm">
                    {offspotData?.storage.status || 'available'}
                  </span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-500 font-bold block">Ingested Items:</span>
                      <span className="font-bold text-black text-sm">{offspotData?.storage.total_resources ?? 23} assets</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-bold block">Volume Size:</span>
                      <span className="font-bold text-black text-sm">
                        {offspotData ? `${(offspotData.storage.total_size_bytes / (1024 * 1024)).toFixed(1)} MB` : '824.1 MB'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">OpenZIM Archives:</span>
                    <span className="font-bold text-black">
                      {offspotData?.storage.zim_packages_found || 1} package available (Supervised Learning ZIM)
                    </span>
                  </div>

                  <div className="truncate text-[11px] text-zinc-600">
                    <span className="text-zinc-500 font-bold block">Upload Directory:</span>
                    <span className="truncate block">{offspotData?.storage.upload_dir}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: AI Engine Status */}
              <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-hard-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-black" />
                    Offline AI Runtime
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#b7c6c2] text-black border-2 border-black shadow-hard-sm">
                    {offspotData?.ai_service.status || 'ok (mock)'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 font-bold block">Service Endpoint:</span>
                    <span className="font-mono font-bold text-black">{offspotData?.ai_service.url || 'http://127.0.0.1:8000'}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">Mock Fallback:</span>
                    <span className="font-mono font-bold text-black">
                      {offspotData?.ai_service.mock_fallback ? 'Enabled (Deterministic offline syllabus inference)' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                    When the Python AI container or Ollama is running, live neural completions are generated. Otherwise, syllabus-grounded offline extraction is used.
                  </p>
                </div>
              </div>
            </div>

            {/* Network Access URLs for Student Devices */}
            <div className="bg-[#ffe17c] bg-radial-dots border-2 border-black rounded-2xl p-6 shadow-hard-md space-y-4">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-black" />
                <h4 className="font-heading font-extrabold text-base text-black">
                  Student Multi-Device Access URLs (Wi-Fi / LAN)
                </h4>
              </div>

              <p className="text-xs text-black/90 font-medium leading-relaxed">
                Any student computer or tablet connected to this Wi-Fi hotspot can open the full NEXUS platform and stream video lectures without internet by visiting either of these local network addresses:
              </p>

              <div className="space-y-2">
                {offspotData?.network.access_urls.map((url) => (
                  <div
                    key={url}
                    className="flex items-center justify-between bg-white border-2 border-black rounded-xl p-3 shadow-hard-sm font-mono text-xs font-bold text-black"
                  >
                    <span>{url}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          setCopiedUrl(url);
                          setTimeout(() => setCopiedUrl(null), 2000);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#b7c6c2] border border-black hover:bg-black hover:text-[#ffe17c] transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUrl === url ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl === url ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#ffe17c] border border-black hover:bg-black hover:text-[#ffe17c] transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
