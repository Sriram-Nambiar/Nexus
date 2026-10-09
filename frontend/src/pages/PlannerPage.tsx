import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Course, StudyPlanResponse, StudyPlanDay, StudyPlanTask } from '../api/types';
import { getCourses, generateStudyPlan, saveStudyPlan, getSavedStudyPlans, getResourceById } from '../api';
import { useApp } from '../context';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Save,
  Check,
  Sparkles,
  AlertCircle,
  BookOpen,
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
    <div className="min-h-screen bg-[#171e19] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner: Neo-Brutalist #ffe17c with Radial Dots */}
        <div className="bg-[#ffe17c] bg-radial-dots border-2 border-black rounded-2xl p-6 sm:p-8 shadow-hard-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[#ffe17c] text-xs font-bold border-2 border-black shadow-hard-sm">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>EXAM SYNC ENGINE</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-black tracking-tight">
                Study Revision Planner
              </h1>
              <p className="text-sm sm:text-base text-black/85 font-medium max-w-2xl leading-relaxed">
                Formulate multi-day milestone revision timetables directly integrated with locally indexed course materials.
              </p>
            </div>
          </div>
        </div>

        {/* Plan Creator Form */}
        <div className="bg-white border-2 border-black rounded-xl p-6 sm:p-8 shadow-hard-md space-y-6">
          <h2 className="font-heading text-lg font-extrabold text-black uppercase tracking-wider">
            Configure Revision Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goal / Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">
                Exam Target or Subject Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Operating Systems End-Term, Raft Consensus Revision"
                className="w-full px-4 py-3 bg-[#f4f4f5] border-2 border-black rounded-xl text-sm font-bold text-black focus:outline-none shadow-hard-sm"
              />
            </div>

            {/* Timeframe & Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Total Days
                </label>
                <select
                  value={daysCount}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#f4f4f5] border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none shadow-hard-sm cursor-pointer"
                >
                  <option value={3}>3 Days (Crash Prep)</option>
                  <option value={4}>4 Days (Intensive)</option>
                  <option value={7}>7 Days (Full Week)</option>
                  <option value={14}>14 Days (Comprehensive)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">
                  Hours / Day
                </label>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#f4f4f5] border-2 border-black rounded-xl text-xs font-bold text-black focus:outline-none shadow-hard-sm cursor-pointer"
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
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-black uppercase tracking-wider block">
              Select Courses to Include in Revision Plan
            </label>
            <div className="flex flex-wrap gap-2.5">
              {courses.map((c) => {
                const isSelected = selectedCourseIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleToggleCourse(c.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-[#ffe17c] shadow-hard-sm translate-x-0.5 translate-y-0.5'
                        : 'bg-white text-black hover:bg-[#ffe17c] shadow-hard-sm'
                    }`}
                  >
                    {c.code} — {c.title}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-100 border-2 border-black text-red-900 text-xs font-bold flex items-center gap-2 shadow-hard-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="neo-btn-primary text-sm py-3 px-6 shadow-hard-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#ffe17c]" />
              <span>{isGenerating ? 'Generating Plan...' : 'Generate Structured Plan'}</span>
            </button>
          </div>
        </div>

        {/* Generated Plan View */}
        {isGenerating ? (
          <LoadingSpinner label="Formulating structured daily milestones and linking readings..." className="py-16" />
        ) : activePlan ? (
          <div className="space-y-6">
            {savedPlans.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[#b7c6c2] font-mono font-bold text-xs shrink-0">Saved Plans:</span>
                {savedPlans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlan(p)}
                    className={`px-3 py-1.5 rounded-xl font-bold border-2 border-black transition-all shrink-0 cursor-pointer ${
                      activePlan.id === p.id
                        ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                        : 'bg-white text-black hover:bg-[#ffe17c] shadow-hard-sm'
                    }`}
                  >
                    {p.goal}
                  </button>
                ))}
              </div>
            )}

            {/* Plan Meta Banner & Progress */}
            <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-hard-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-black text-[#ffe17c] border-2 border-black shadow-hard-sm">
                    {activePlan.total_days} Days Revision
                  </span>
                  <span className="text-xs font-mono font-bold text-black bg-[#b7c6c2] px-3 py-1 rounded-lg border-2 border-black">
                    {activePlan.total_hours} Estimated Hours
                  </span>
                </div>

                <h3 className="font-heading text-2xl font-extrabold text-black tracking-tight">
                  {activePlan.goal}
                </h3>

                <p className="text-sm text-zinc-700 font-medium max-w-2xl leading-relaxed">
                  {activePlan.summary}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-4 shrink-0">
                {/* Progress metric */}
                <div className="w-full sm:w-56 bg-[#f4f4f5] p-4 rounded-xl border-2 border-black shadow-hard-sm">
                  <div className="flex justify-between text-xs font-bold text-black mb-2">
                    <span>Mastery Progress</span>
                    <span className="font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-white h-3 rounded-full overflow-hidden border-2 border-black">
                    <div
                      className="bg-[#ffe17c] h-full transition-all duration-300 border-r border-black"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono font-bold text-right mt-1.5">
                    {completedTasksCount} / {totalTasksCount} completed
                  </div>
                </div>

                {/* Save Plan Button */}
                <Button
                  variant={saveSuccess ? 'yellow' : 'secondary'}
                  size="sm"
                  onClick={handleSavePlan}
                  isLoading={isSaving}
                  leftIcon={
                    saveSuccess ? (
                      <Check className="w-4 h-4 text-black stroke-[3]" />
                    ) : (
                      <Save className="w-4 h-4 text-black" />
                    )
                  }
                  className="w-full text-xs shadow-hard-sm"
                >
                  {saveSuccess ? 'Plan Saved to SQLite' : 'Save Plan to Campus Node'}
                </Button>
              </div>
            </div>

            {/* Structured Days Timeline Tasks */}
            <div className="space-y-6">
              <h4 className="font-heading text-xl font-extrabold text-white uppercase tracking-wider">
                Milestone Schedule ({activePlan.days.length} Days)
              </h4>

              {activePlan.days.map((day: StudyPlanDay) => (
                <div
                  key={day.day_number}
                  className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-hard-md space-y-4"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading text-lg font-extrabold text-black">
                          Day {day.day_number}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black text-[#ffe17c]">
                          {day.focus_area}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium">
                        Target Time: ~{(day.tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0) / 60).toFixed(1)} Hours
                      </p>
                    </div>

                    <div className="text-xs font-mono font-bold bg-[#f4f4f5] border border-black px-2.5 py-1 rounded">
                      {day.tasks.filter((t) => t.completed).length} / {day.tasks.length} Done
                    </div>
                  </div>

                  {/* Tasks in Day */}
                  <div className="space-y-3">
                    {day.tasks.map((task: StudyPlanTask) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(day.day_number, task.id)}
                        className={`p-4 rounded-xl border-2 border-black transition-all cursor-pointer flex items-start gap-4 ${
                          task.completed
                            ? 'bg-[#b7c6c2]/40 opacity-70 line-through'
                            : 'bg-white hover:bg-[#ffe17c]/20 shadow-hard-sm'
                        }`}
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-black shrink-0"
                          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 fill-black text-[#ffe17c]" />
                          ) : (
                            <Circle className="w-5 h-5 stroke-[2]" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-black leading-snug">
                              {task.title}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-zinc-600 shrink-0">
                              {task.estimated_minutes}m
                            </span>
                          </div>

                          <p className="text-xs text-zinc-700 font-medium">
                            {task.description}
                          </p>

                          {task.resource_title && (
                            <div className="pt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (task.resource_id) {
                                    try {
                                      const resObj = await getResourceById(task.resource_id);
                                      openResourceViewer(resObj);
                                    } catch {}
                                  }
                                }}
                                className="text-[11px] font-bold text-black bg-[#ffe17c] px-2.5 py-1 rounded-lg border-2 border-black inline-flex items-center gap-1.5 shadow-hard-sm cursor-pointer hover:bg-black hover:text-[#ffe17c] transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{task.resource_title}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<CalendarDays className="w-10 h-10 text-black" />}
            title="No study plan generated yet"
            description="Specify your subject revision target and timeframe above to formulate your personalized campus study schedule."
            actionLabel="Generate Now"
            onAction={handleGeneratePlan}
          />
        )}
      </div>
    </div>
  );
};
