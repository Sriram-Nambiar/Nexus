import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Course, StudyPlanResponse, StudyPlanDay, StudyPlanTask } from '../api/types';
import { getCourses, generateStudyPlan, saveStudyPlan, getSavedStudyPlans, getResourceById } from '../api';
import { useApp } from '../context';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Save,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course') || '';
  const { openResourceViewer } = useApp();

  const [courses, setCourses] = useState<Course[]>([]);
  const [goal, setGoal] = useState<string>('Operating Systems Midterm Revision');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    initialCourseId ? [initialCourseId] : ['cs-301']
  );
  const [daysCount, setDaysCount] = useState<number>(4);
  const [hoursPerDay, setHoursPerDay] = useState<number>(3);

  const [savedPlans, setSavedPlans] = useState<StudyPlanResponse[]>(() => getSavedStudyPlans());
  const [activePlan, setActivePlan] = useState<StudyPlanResponse | null>(() => {
    const list = getSavedStudyPlans();
    return list.length > 0 ? list[0] : null;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load courses
  useEffect(() => {
    let isMounted = true;
    getCourses().then((data) => {
      if (isMounted) {
        setCourses(data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleGeneratePlan = async () => {
    if (!goal.trim()) {
      setError('Please specify a revision topic or exam target.');
      return;
    }
    if (selectedCourseIds.length === 0) {
      setError('Please select at least one course for the revision plan.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const plan = await generateStudyPlan({
        topic_or_goal: goal,
        course_ids: selectedCourseIds,
        days_count: daysCount,
        hours_per_day: hoursPerDay,
      });

      setActivePlan(plan);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to generate study revision plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!activePlan) return;
    setIsSaving(true);
    try {
      await saveStudyPlan(activePlan);
      setSaveSuccess(true);
      setSavedPlans((prev) => [activePlan, ...prev.filter((p) => p.id !== activePlan.id)]);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError('Could not save plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTask = (dayNumber: number, taskId: string) => {
    if (!activePlan) return;
    const updatedDays = activePlan.days.map((day) => {
      if (day.day_number !== dayNumber) return day;
      return {
        ...day,
        tasks: day.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      };
    });

    setActivePlan({
      ...activePlan,
      days: updatedDays,
    });
  };

  const completedTasksCount =
    activePlan?.days.reduce(
      (acc, day) => acc + day.tasks.filter((t) => t.completed).length,
      0
    ) || 0;

  const totalTasksCount =
    activePlan?.days.reduce((acc, day) => acc + day.tasks.length, 0) || 0;

  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Study Revision Planner
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            Structured Tasks
          </span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Formulate multi-day milestone revision timetables directly integrated with locally indexed course materials.
        </p>
      </div>

      {/* Plan Creator Form */}
      <Card className="p-5 sm:p-6 bg-zinc-900/90 border-zinc-800 space-y-5">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-mono">
          Configure Revision Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Goal / Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Exam Target or Subject Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Operating Systems End-Term, Raft Consensus Revision"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Timeframe & Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Total Days
              </label>
              <select
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                <option value={3}>3 Days (Crash Prep)</option>
                <option value={4}>4 Days (Intensive)</option>
                <option value={7}>7 Days (Full Week)</option>
                <option value={14}>14 Days (Comprehensive)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Hours / Day
              </label>
              <select
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                <option value={2}>2 Hours / Day</option>
                <option value={3}>3 Hours / Day</option>
                <option value={4}>4 Hours / Day</option>
                <option value={6}>6 Hours / Day</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Multi-select Chips */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-300 block">
            Select Courses to Include in Revision Plan
          </label>
          <div className="flex flex-wrap gap-2">
            {courses.map((c) => {
              const isSelected = selectedCourseIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleToggleCourse(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                    isSelected
                      ? 'bg-zinc-100 text-zinc-950 border-white font-medium'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {c.code} — {c.title}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleGeneratePlan}
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4 text-purple-600" />}
          >
            Generate Structured Plan
          </Button>
        </div>
      </Card>

      {/* Generated Plan View */}
      {isGenerating ? (
        <LoadingSpinner label="Formulating structured daily tasks and linking readings..." className="py-16" />
      ) : activePlan ? (
        <div className="space-y-6">
          {savedPlans.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-zinc-500 font-mono text-[11px] shrink-0">Saved Plans:</span>
              {savedPlans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlan(p)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors shrink-0 ${
                    activePlan.id === p.id
                      ? 'bg-zinc-100 text-zinc-950 font-medium'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {p.goal}
                </button>
              ))}
            </div>
          )}

          {/* Plan Meta Banner & Progress */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-800 text-white border border-zinc-750">
                  {activePlan.total_days} Days Revision
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {activePlan.total_hours} Estimated Hours
                </span>
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight">
                {activePlan.goal}
              </h3>

              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {activePlan.summary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              {/* Progress metric */}
              <div className="w-full sm:w-48 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
                  <span>Progress</span>
                  <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-500 font-mono text-right mt-1">
                  {completedTasksCount} of {totalTasksCount} tasks completed
                </div>
              </div>

              {/* Save Plan Button */}
              <Button
                variant={saveSuccess ? 'secondary' : 'outline'}
                size="sm"
                onClick={handleSavePlan}
                isLoading={isSaving}
                leftIcon={
                  saveSuccess ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Save className="w-4 h-4 text-zinc-300" />
                  )
                }
                className="w-full text-xs"
              >
                {saveSuccess ? 'Plan Saved' : 'Save Plan to Campus Backend'}
              </Button>
            </div>
          </div>

          {/* Structured Days Timeline Tasks */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Milestone Breakdown ({activePlan.days.length} Days)
            </h4>

            {activePlan.days.map((day: StudyPlanDay) => (
              <Card key={day.day_number} className="p-5 sm:p-6 bg-zinc-900/80 border-zinc-800 space-y-4">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
                  <div>
                    <h5 className="text-base font-bold text-zinc-100">{day.day_label}</h5>
                    <p className="text-xs text-zinc-400 mt-0.5">{day.focus_area}</p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-850 shrink-0">
                    {day.tasks.length} targeted tasks
                  </span>
                </div>

                {/* Day's Tasks Checklist */}
                <div className="space-y-2.5">
                  {day.tasks.map((task: StudyPlanTask) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(day.day_number, task.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        task.completed
                          ? 'bg-zinc-950/40 border-zinc-850 text-zinc-500 line-through opacity-70'
                          : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          type="button"
                          className="mt-0.5 text-zinc-400 hover:text-white shrink-0"
                          aria-label={task.completed ? 'Mark uncompleted' : 'Mark completed'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <p className={`text-sm font-semibold leading-snug ${task.completed ? 'text-zinc-500' : 'text-zinc-100'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                            {task.description}
                          </p>

                          {/* Linked local resource */}
                          {task.resource_title && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (task.resource_id) {
                                  getResourceById(task.resource_id)
                                    .then((r) => openResourceViewer(r))
                                    .catch(() => {});
                                }
                              }}
                              className="pt-1.5 flex items-center gap-2 hover:underline text-left group/res"
                            >
                              {task.resource_type && (
                                <Badge resourceType={task.resource_type} size="sm" />
                              )}
                              <span className="text-[11px] text-zinc-300 font-mono truncate max-w-md group-hover/res:text-white">
                                {task.resource_title}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 shrink-0">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{task.estimated_minutes} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<CalendarDays className="w-8 h-8 text-zinc-500" />}
          title="No Revision Plan Generated Yet"
          description="Enter your target exam or subject goal above to create a personalized multi-day structured revision schedule."
        />
      )}
    </div>
  );
};
