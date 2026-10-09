import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Course, Resource, ResourceType } from '../api/types';
import { getCourseById, getCourseResources } from '../api';
import { useApp } from '../context';
import { Button } from '../components/common/Button';
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
  FileCode,
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
          icon={<BookOpen className="w-8 h-8 text-rose-400" />}
          title="Course Not Found"
          description={error || `Course "${id}" could not be located on this campus server.`}
          actionLabel="Back to Course Library"
          onAction={() => navigate('/courses')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </button>
      </div>

      {/* Course Header Banner */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-mono font-bold px-3 py-1 rounded-md bg-zinc-800 text-white border border-zinc-700">
                {course.code}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {course.department} • {course.semester}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
              {course.title}
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-zinc-400">
              {course.instructor && (
                <div className="flex items-center gap-1.5 text-zinc-200">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>{course.instructor}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-zinc-400" />
                <span>{resources.length} indexed educational materials</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/assistant?course=${course.id}`)}
              leftIcon={<Bot className="w-4 h-4 text-purple-600" />}
              className="justify-start sm:justify-center"
            >
              Ask AI About This Course
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(`/planner?course=${course.id}`)}
              leftIcon={<CalendarDays className="w-4 h-4 text-zinc-400" />}
              className="justify-start sm:justify-center"
            >
              Plan Revision Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2.5 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Materials ({resourceCounts['all'] || 0})
        </button>

        <button
          onClick={() => setActiveTab('pdf')}
          className={`pb-2.5 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'pdf'
              ? 'border-rose-400 text-rose-300'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          PDFs & Textbooks ({resourceCounts['pdf'] || 0})
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`pb-2.5 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'video'
              ? 'border-purple-400 text-purple-300'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          Video Lectures ({resourceCounts['video'] || 0})
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-2.5 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-blue-400 text-blue-300'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Lecture Notes ({resourceCounts['notes'] || 0})
        </button>

        <button
          onClick={() => setActiveTab('lab')}
          className={`pb-2.5 px-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'lab'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          Labs & Code ({resourceCounts['lab'] || 0})
        </button>
      </div>

      {/* Resources List Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No materials in this category"
          description="There are currently no resources available for the selected filter."
          actionLabel="View All Materials"
          onAction={() => setActiveTab('all')}
        />
      )}
    </div>
  );
};
