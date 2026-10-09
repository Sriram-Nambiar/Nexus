import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../api/types';
import { getCourses } from '../api';
import { useApp } from '../context';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
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
    return <LoadingSpinner label="Loading course catalog..." className="min-h-[60vh]" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Course Library
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse and access locally indexed curriculum modules and educational files.
          </p>
        </div>

        <div className="w-full md:w-80">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by course code, title, or instructor..."
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Notice: {error}. Loaded local catalog snapshot.</span>
        </div>
      )}

      {/* Department Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 flex items-center gap-1 shrink-0 font-medium mr-1">
          <Filter className="w-3.5 h-3.5" /> Department:
        </span>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedDept === dept
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              hoverable
              className="p-5 flex flex-col justify-between cursor-pointer group"
              onClick={() => handleOpenCourse(course)}
            >
              <div>
                {/* Course Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                      {course.code}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono ml-2">
                      {course.semester}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {course.resource_count} materials
                  </span>
                </div>

                <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white mb-2 leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                  {course.description}
                </p>

                {/* Resource Types Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.resource_types.map((type) => (
                    <Badge key={type} resourceType={type} size="sm" />
                  ))}
                </div>
              </div>

              {/* Course Footer */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-2 text-xs">
                {course.instructor ? (
                  <div className="flex items-center gap-1.5 text-zinc-400 truncate max-w-[160px]">
                    <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                ) : (
                  <span className="text-zinc-500 font-mono text-[11px]">{course.department}</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleAskAIAboutCourse(e, course)}
                    className="p-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-zinc-800 transition-colors"
                    title={`Ask AI questions about ${course.code}`}
                    aria-label={`Ask AI about ${course.code}`}
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="py-1 px-2.5 text-xs"
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No courses found"
          description={
            searchTerm
              ? `No courses matching "${searchTerm}". Try searching for course code like CS-301 or keywords like Operating Systems.`
              : 'No courses available in this category.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedDept('All');
          }}
        />
      )}
    </div>
  );
};
