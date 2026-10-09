import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course, Resource } from '../api/types';
import { getCourses, getCourseResources } from '../api';
import { useApp } from '../context';
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
  Zap,
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
    <div className="min-h-screen bg-[#171e19] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner: Neo-Brutalist #ffe17c with Radial Dots */}
        <div className="bg-[#ffe17c] bg-radial-dots border-2 border-black rounded-2xl p-6 sm:p-10 shadow-hard-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black text-[#ffe17c] text-xs font-bold border-2 border-black shadow-hard-sm">
                <Zap className="w-3.5 h-3.5 fill-[#ffe17c]" />
                <span>OFFLINE-FIRST CAMPUS DASHBOARD</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-black tracking-tight">
                Welcome to NEXUS AI
              </h1>
              <p className="text-sm sm:text-base text-black/85 font-medium leading-relaxed">
                Access locally hosted university educational resources, search textbook chapters,
                ask syllabus-grounded questions with AI, and prepare structured revision plans without internet dependency.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <button
                onClick={() => navigate('/assistant')}
                className="neo-btn-primary text-sm py-3 px-5 shadow-hard-md cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#ffe17c]" />
                <span>Ask Study Assistant</span>
              </button>
              <button
                onClick={() => navigate('/planner')}
                className="neo-btn-secondary text-sm py-3 px-5 shadow-hard-md cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-black" />
                <span>Generate Study Plan</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-100 border-2 border-black text-red-900 text-xs font-bold flex items-center gap-3 shadow-hard-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>Notice: {error}. Operating on local offline cache.</span>
          </div>
        )}

        {/* Quick Access AI Prompts & Study Planner CTA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fast AI Assistant Launcher */}
          <div className="bg-white border-2 border-black rounded-2xl p-6 md:col-span-2 shadow-hard-md flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-[#ffe17c] border-2 border-black flex items-center justify-center shadow-hard-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-lg font-extrabold text-black">
                    Syllabus-Grounded AI Assistant
                  </h3>
                </div>
                <Badge variant="grounded" size="sm">
                  Citations Active
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 font-medium mb-4 leading-relaxed">
                Ask deep questions directly grounded in your lecture notes, handouts, and textbooks with exact source citations and page numbers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    navigate('/assistant?q=What are the four Coffman conditions for deadlocks in CS-301?')
                  }
                  className="text-left p-3 rounded-xl bg-[#f4f4f5] border-2 border-black text-xs font-bold text-black hover:bg-[#ffe17c] transition-all shadow-hard-sm cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <span className="bg-black text-[#ffe17c] px-1.5 py-0.2 rounded text-[10px] mr-1 font-mono">
                    CS-301
                  </span>
                  "What are the four Coffman deadlock conditions?"
                </button>
                <button
                  onClick={() =>
                    navigate('/assistant?q=Explain the Raft consensus leader election process from CS-340.')
                  }
                  className="text-left p-3 rounded-xl bg-[#f4f4f5] border-2 border-black text-xs font-bold text-black hover:bg-[#ffe17c] transition-all shadow-hard-sm cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <span className="bg-black text-[#ffe17c] px-1.5 py-0.2 rounded text-[10px] mr-1 font-mono">
                    CS-340
                  </span>
                  "Explain the Raft leader election invariants"
                </button>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black flex justify-end">
              <button
                onClick={() => navigate('/assistant')}
                className="neo-btn-primary text-xs py-2 px-4 shadow-hard-sm cursor-pointer"
              >
                <span>Open AI Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Revision Planner Card */}
          <div className="bg-[#b7c6c2] border-2 border-black rounded-2xl p-6 shadow-hard-md flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-black text-white border-2 border-black flex items-center justify-center shadow-hard-sm">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-lg font-extrabold text-black">Exam Revision Planner</h3>
              </div>
              <p className="text-xs sm:text-sm text-black/85 font-medium mb-4 leading-relaxed">
                Break down challenging course syllabi into structured daily revision tasks with estimated study hours.
              </p>
              <div className="p-3.5 rounded-xl bg-white border-2 border-black text-xs space-y-2 font-mono font-bold shadow-hard-sm">
                <div className="flex items-center justify-between text-black">
                  <span>Target:</span>
                  <span>OS Midterm Prep</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Structure:</span>
                  <span>4 Days • 12 Hours</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black">
              <button
                onClick={() => navigate('/planner')}
                className="w-full neo-btn-primary text-xs py-2.5 px-4 shadow-hard-sm justify-between cursor-pointer"
              >
                <span>Plan Your Revision</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recently Accessed Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ffe17c]" />
              <h3 className="font-heading text-base font-extrabold text-white uppercase tracking-wider">
                {recentCourses.length > 0 ? 'Recently Accessed Courses' : 'Featured Courses'}
              </h3>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="font-bold text-xs text-[#ffe17c] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>All Courses ({courses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayRecentCourses.map((course: Course) => (
              <div
                key={course.id}
                onClick={() => handleOpenCourse(course)}
                className="bg-white border-2 border-black rounded-xl p-5 shadow-hard-md hover:shadow-hard-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono font-bold text-xs bg-black text-[#ffe17c] px-2.5 py-0.5 rounded border-2 border-black shadow-hard-sm">
                      {course.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-black bg-[#b7c6c2] px-2 py-0.5 rounded border border-black">
                      {course.resource_count} assets
                    </span>
                  </div>

                  <h4 className="font-heading text-base font-extrabold text-black mb-2 leading-snug">
                    {course.title}
                  </h4>

                  <p className="text-xs text-zinc-700 font-medium line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-600 font-bold text-[11px]">{course.semester}</span>
                  <button className="neo-btn-primary text-xs py-1 px-3 shadow-hard-sm">
                    Open &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Educational Resources */}
        {displayRecentResources.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#ffe17c]" />
                <h3 className="font-heading text-base font-extrabold text-white uppercase tracking-wider">
                  Featured Videos & Textbooks
                </h3>
              </div>
              <button
                onClick={() => navigate('/courses/1')}
                className="font-bold text-xs text-[#ffe17c] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Open NPTEL ML Player</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayRecentResources.map((res: Resource) => (
                <ResourceCard key={res.id} resource={res} showCourseBadge />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
