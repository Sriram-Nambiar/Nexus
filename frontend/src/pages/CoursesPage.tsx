import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../api/types';
import { getCourses } from '../api';
import { useApp } from '../context';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  BookOpen,
  User,
  ArrowRight,
  Filter,
  Bot,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { recordCourseAccess } = useApp();

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCoursesData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCourses();
        if (isMounted) {
          setCourses(data);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message || 'Failed to fetch courses');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchCoursesData();
    return () => {
      isMounted = false;
    };
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.department));
    return ['All', ...Array.from(set)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept = selectedDept === 'All' || course.department === selectedDept;

      return matchSearch && matchDept;
    });
  }, [courses, searchTerm, selectedDept]);

  const handleOpenCourse = (course: Course) => {
    recordCourseAccess(course);
    navigate(`/courses/${course.id}`);
  };

  const handleAskAIAboutCourse = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    navigate(`/assistant?course=${course.id}`);
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading campus course catalog..." className="min-h-[60vh]" />;
  }

  return (
    <div className="min-h-screen bg-[#171e19] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner: Neo-Brutalist #ffe17c with Radial Dots */}
        <div className="bg-radial-dots border-2 border-black rounded-2xl p-6 sm:p-8 shadow-hard-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[#ffe17c] text-xs font-bold border-2 border-black shadow-hard-sm">
                <Layers className="w-3.5 h-3.5" />
                <span>OFFLINE REPOSITORY</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-black tracking-tight">
                Course Catalog & Lectures
              </h1>
              <p className="text-sm sm:text-base text-black/85 font-medium max-w-2xl leading-relaxed">
                Stream verified university courses with instant HTTP Range video scrubbing and in-browser PDF lecture notes.
              </p>
            </div>

            <div className="w-full md:w-80">
              <div className="bg-white border-2 border-black rounded-xl p-1 shadow-hard-md">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search code, title, instructor..."
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-[#f4f4f5] border-2 border-black text-black text-xs font-bold flex items-center gap-3 shadow-hard-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Notice: {error}. Displaying locally cached curriculum assets.</span>
          </div>
        )}

        {/* Department Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span className="text-[#b7c6c2] flex items-center gap-1.5 shrink-0 font-bold mr-1">
            <Filter className="w-4 h-4 text-[#ffe17c]" /> Filter:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-xl font-bold border-2 border-black transition-all cursor-pointer whitespace-nowrap ${
                selectedDept === dept
                  ? 'bg-[#ffe17c] text-black shadow-hard-sm translate-x-0.5 translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#b7c6c2] shadow-hard-sm'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Courses Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleOpenCourse(course)}
                className="group bg-white border-2 border-black rounded-xl p-6 shadow-hard-md hover:shadow-hard-lg hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code & Resource Count */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="font-mono font-bold text-xs bg-black text-[#ffe17c] px-3 py-1 rounded-lg border-2 border-black shadow-hard-sm">
                      {course.code}
                    </span>
                    <span className="text-xs font-bold font-mono bg-[#b7c6c2] text-black px-2.5 py-1 rounded-lg border-2 border-black">
                      {course.resource_count} assets
                    </span>
                  </div>

                  <h2 className="font-heading text-xl font-extrabold text-black group-hover:text-black mb-2 leading-snug">
                    {course.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-zinc-700 font-medium line-clamp-3 mb-5 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Resource Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {course.resource_types.map((type) => (
                      <Badge key={type} resourceType={type} size="sm" />
                    ))}
                  </div>
                </div>

                {/* Footer: Instructor & Actions */}
                <div className="pt-4 border-t-2 border-black flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-black font-bold truncate max-w-[170px]">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{course.instructor || course.department}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleAskAIAboutCourse(e, course)}
                      className="p-2 rounded-lg bg-[#b7c6c2] hover:bg-[#ffe17c] text-black border-2 border-black shadow-hard-sm transition-colors cursor-pointer"
                      title={`Ask AI questions about ${course.code}`}
                    >
                      <Bot className="w-4 h-4" />
                    </button>
                    <button
                      className="neo-btn-primary text-xs py-1.5 px-3"
                    >
                      <span>Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="w-10 h-10 text-black" />}
            title="No courses matched your query"
            description={
              searchTerm
                ? `No courses matching "${searchTerm}". Try searching for course code like CS-301 or keywords like Operating Systems.`
                : 'No courses available in this category.'
            }
            actionLabel="Reset Search"
            onAction={() => {
              setSearchTerm('');
              setSelectedDept('All');
            }}
          />
        )}
      </div>
    </div>
  );
};
