import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course, Resource } from '../api/types';
import { getCourses, getCourseResources } from '../api';
import { useApp } from '../context';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ResourceCard } from '../components/resources/ResourceCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BookOpen,
  Bot,
  Calendar,
  ArrowRight,
  Clock,
  AlertCircle,
  Search,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { recentCourses, recentResources, recordCourseAccess } = useApp();

  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCourses = await getCourses();
        if (isMounted) {
          setCourses(fetchedCourses);
          // Load some sample resources for dashboard display
          if (fetchedCourses.length > 0) {
            const res = await getCourseResources(fetchedCourses[0].id);
            if (isMounted) {
              setFeaturedResources(res.slice(0, 4));
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCourse = (course: Course) => {
    recordCourseAccess(course);
    navigate(`/courses/${course.id}`);
  };

  const displayRecentCourses =
    recentCourses.length > 0 ? recentCourses : courses.slice(0, 3);
  const displayRecentResources =
    recentResources.length > 0 ? recentResources : featuredResources;

  if (isLoading) {
    return <LoadingSpinner label="Loading campus course repository..." className="min-h-[60vh]" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300 font-mono mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Offline-First Campus Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back to NEXUS AI
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Access locally hosted university educational resources, search textbook chapters,
              ask syllabus-grounded questions with AI, and prepare structured revision plans without internet dependency.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/assistant')}
              leftIcon={<Bot className="w-4 h-4 text-purple-600" />}
            >
              Ask Study Assistant
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/planner')}
              leftIcon={<Calendar className="w-4 h-4 text-zinc-400" />}
            >
              Generate Study Plan
            </Button>
          </div>
        </div>

        {/* Subtle accent border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-transparent" />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Notice: {error}. Operating on local offline cache.</span>
        </div>
      )}

      {/* Quick Access AI Prompts & Study Planner CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Fast AI Assistant Launcher */}
        <Card className="p-5 md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Syllabus-Grounded AI Assistant
                </h3>
              </div>
              <Badge variant="grounded" size="sm">
                Local Citations
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Ask deep questions directly grounded in your lecture notes, handouts, and textbooks with exact source citations and page numbers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() =>
                  navigate('/assistant?q=What are the four Coffman conditions for deadlocks in CS-301?')
                }
                className="text-left p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                <span className="font-semibold text-purple-400 block mb-0.5">CS-301 Concurrency:</span>
                "What are the four Coffman deadlock conditions?"
              </button>
              <button
                onClick={() =>
                  navigate('/assistant?q=Explain the Raft consensus leader election process from CS-340.')
                }
                className="text-left p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors"
              >
                <span className="font-semibold text-purple-400 block mb-0.5">CS-340 Distributed:</span>
                "Explain the Raft leader election invariants"
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-800 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/assistant')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open AI Assistant
            </Button>
          </div>
        </Card>

        {/* Card 2: Revision Planner Card */}
        <Card className="p-5 flex flex-col justify-between bg-zinc-900/90 border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">Exam Revision Planner</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Break down challenging course syllabi into structured daily revision tasks with estimated study hours and linked local materials.
            </p>
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Active Target:</span>
                <span className="text-zinc-200">OS Midterm Prep</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Plan Structure:</span>
                <span className="text-zinc-200">4 Days • 12 Hours</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-800">
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-between"
              onClick={() => navigate('/planner')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Plan Your Revision
            </Button>
          </div>
        </Card>
      </div>

      {/* Recently Accessed Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              {recentCourses.length > 0 ? 'Recently Accessed Courses' : 'Featured Courses'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/courses')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            All Courses ({courses.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayRecentCourses.map((course: Course) => (
            <Card
              key={course.id}
              hoverable
              className="p-5 cursor-pointer flex flex-col justify-between"
              onClick={() => handleOpenCourse(course)}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                    {course.code}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {course.resource_count} resources
                  </span>
                </div>

                <h4 className="text-base font-semibold text-zinc-100 hover:text-white line-clamp-1 mb-1.5">
                  {course.title}
                </h4>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                  {course.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400 truncate max-w-[150px]">
                  {course.instructor || course.department}
                </span>
                <span className="text-zinc-200 font-medium inline-flex items-center gap-1">
                  Open Course <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recently Opened Resources / Recommended Materials */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              {recentResources.length > 0 ? 'Recently Opened Resources' : 'Key Educational Materials'}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/search')}
            rightIcon={<Search className="w-3.5 h-3.5" />}
          >
            Search Materials
          </Button>
        </div>

        {displayRecentResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayRecentResources.map((res: Resource) => (
              <ResourceCard key={res.id} resource={res} showCourseBadge />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-zinc-400 text-xs">
            No recently opened resources yet. Browse the course library to read lecture PDFs or watch videos.
          </Card>
        )}
      </div>
    </div>
  );
};
