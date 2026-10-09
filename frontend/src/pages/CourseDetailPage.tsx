import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Resource, ResourceType } from '../api/types';
import { getCourseById, getCourseResources } from '../api';
import { useApp } from '../context';
import { ResourceCard } from '../components/resources/ResourceCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  BookOpen,
  User,
  Layers,
  Bot,
  ArrowLeft,
  FileText,
  Video,
  FileCheck,
  CalendarDays,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recordCourseAccess } = useApp();

  const [course, setCourse] = useState<Course | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | ResourceType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    async function loadCourseData() {
      setIsLoading(true);
      setError(null);
      try {
        const [courseData, resourcesData] = await Promise.all([
          getCourseById(id!),
          getCourseResources(id!),
        ]);

        if (isMounted) {
          setCourse(courseData);
          setResources(resourcesData);
          recordCourseAccess(courseData);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message || 'Failed to load course details');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCourseData();
    return () => {
      isMounted = false;
    };
  }, [id, recordCourseAccess]);

  const filteredResources = useMemo(() => {
    if (activeTab === 'all') return resources;
    return resources.filter((r) => r.resource_type === activeTab);
  }, [resources, activeTab]);

  const resourceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: resources.length };
    resources.forEach((r) => {
      counts[r.resource_type] = (counts[r.resource_type] || 0) + 1;
    });
    return counts;
  }, [resources]);

  if (isLoading) {
    return <LoadingSpinner label="Loading course materials..." className="min-h-[60vh]" />;
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          icon={<BookOpen className="w-10 h-10 text-black" />}
          title="Course Not Found"
          description={error || `Course "${id}" could not be located on this campus server.`}
          actionLabel="Back to Course Library"
          onAction={() => navigate('/courses')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171e19] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border-2 border-black font-bold text-xs text-black shadow-hard-sm hover:bg-[#ffe17c] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>&larr; Back to Courses</span>
          </button>
        </div>

        {/* Course Header Banner */}
        <div className="bg-[#ffe17c] bg-radial-dots border-2 border-black rounded-2xl p-6 sm:p-10 shadow-hard-lg">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono font-bold text-xs bg-black text-[#ffe17c] px-3.5 py-1 rounded-lg border-2 border-black shadow-hard-sm">
                  {course.code}
                </span>
                <span className="text-xs font-bold text-black bg-white px-3 py-1 rounded-lg border-2 border-black">
                  {course.department} • {course.semester}
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-black tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-base text-black/90 font-medium leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-black">
                {course.instructor && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border-2 border-black shadow-hard-sm">
                    <User className="w-4 h-4 text-black" />
                    <span>Instructor: {course.instructor}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[#b7c6c2] px-3 py-1 rounded-lg border-2 border-black shadow-hard-sm">
                  <Layers className="w-4 h-4 text-black" />
                  <span>{resources.length} offline assets</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => navigate(`/assistant?course=${course.id}`)}
                className="neo-btn-primary text-sm py-3 px-5 shadow-hard-md cursor-pointer justify-center"
              >
                <Bot className="w-4 h-4 text-[#ffe17c]" />
                <span>Ask AI About This Course</span>
              </button>
              <button
                onClick={() => navigate(`/planner?course=${course.id}`)}
                className="neo-btn-secondary text-sm py-3 px-5 shadow-hard-md cursor-pointer justify-center"
              >
                <CalendarDays className="w-4 h-4 text-black" />
                <span>Plan Revision Schedule</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-black text-[#ffe17c] shadow-hard-sm'
                : 'bg-white text-black hover:bg-[#ffe17c] shadow-hard-sm'
            }`}
          >
            All Materials ({resourceCounts['all'] || 0})
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2 rounded-xl font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                : 'bg-white text-black hover:bg-[#ffe17c] shadow-hard-sm'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Videos ({resourceCounts['video'] || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2 rounded-xl font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pdf'
                ? 'bg-[#b7c6c2] text-black shadow-hard-sm'
                : 'bg-white text-black hover:bg-[#b7c6c2] shadow-hard-sm'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PDFs ({resourceCounts['pdf'] || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'bg-[#f4f4f5] text-black shadow-hard-sm'
                : 'bg-white text-black hover:bg-[#f4f4f5] shadow-hard-sm'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Notes ({resourceCounts['notes'] || 0})</span>
          </button>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="w-10 h-10 text-black" />}
            title="No materials in this category"
            description="There are currently no resources available for the selected filter."
            actionLabel="View All Materials"
            onAction={() => setActiveTab('all')}
          />
        )}
      </div>
    </div>
  );
};
