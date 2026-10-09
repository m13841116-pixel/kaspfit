import React, { useState } from 'react';
import { WeeklyWorkoutPlan, UserProfile, WorkoutDay, Exercise } from '../types/fitness';
import {
  CalendarDays,
  Sparkles,
  RefreshCw,
  Clock,
  Dumbbell,
  CheckCircle2,
  Circle,
  Timer,
  Camera,
  Flame,
  Printer,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Info,
  Layers,
  LayoutGrid,
  FileText,
  SlidersHorizontal,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface WeeklyPlannerTabProps {
  plan: WeeklyWorkoutPlan;
  setPlan: React.Dispatch<React.SetStateAction<WeeklyWorkoutPlan>>;
  profile: UserProfile;
  onLaunchTimerForRest: (seconds: number) => void;
  onLaunchPoseCheckerForExercise: (exerciseName: string) => void;
}

export const WeeklyPlannerTab: React.FC<WeeklyPlannerTabProps> = ({
  plan,
  setPlan,
  profile,
  onLaunchTimerForRest,
  onLaunchPoseCheckerForExercise,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'daily' | 'full_calendar'>('daily');
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Generator form options
  const [equipmentChoice, setEquipmentChoice] = useState<string>(profile.equipment || 'باشگاه بدنسازی کامل');
  const [targetDaysCount, setTargetDaysCount] = useState<number>(profile.daysPerWeek || 4);
  const [specialFocus, setSpecialFocus] = useState<string>('');

  const currentDay: WorkoutDay = plan.days[selectedDayIndex] || plan.days[0];

  const toggleExerciseCompleted = (dayIndex: number, exerciseId: string) => {
    setPlan((prevPlan) => {
      const updatedDays = prevPlan.days.map((d, dIdx) => {
        if (dIdx !== dayIndex) return d;
        const updatedExercises = d.exercises.map((ex) => {
          if (ex.id === exerciseId) {
            return { ...ex, completed: !ex.completed };
          }
          return ex;
        });
        return { ...d, exercises: updatedExercises };
      });
      return { ...prevPlan, days: updatedDays };
    });
  };

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const response = await fetch('/api/ai/generate-workout-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          fitnessLevel: profile.fitnessLevel,
          goal: profile.goal,
          injuryHistory: profile.injuryHistory,
          injuryDetails: profile.injuryDetails,
          equipment: equipmentChoice,
          daysPerWeek: targetDaysCount,
          specialPreferences: specialFocus,
        }),
      });

      const data = await response.json();
      if (data.success && data.data && data.data.days) {
        // Ensure each exercise has a unique ID and completed flag
        const formattedDays = data.data.days.map((d: any, idx: number) => ({
          ...d,
          dayIndex: idx,
          exercises: (d.exercises || []).map((ex: any, exIdx: number) => ({
            ...ex,
            id: `gen-${idx}-${exIdx}-${Date.now()}`,
            completed: false,
          })),
        }));

        setPlan({
          planTitle: data.data.planTitle || 'برنامه تمرینی هوشمند KASP Fit',
          overview: data.data.overview || '',
          recommendedWarmup: data.data.recommendedWarmup || '',
          recommendedCooldown: data.data.recommendedCooldown || '',
          days: formattedDays,
          generatedAt: new Date().toLocaleDateString('fa-IR'),
        });
        setIsGeneratorModalOpen(false);
      } else {
        throw new Error(data.error || 'خطا در ساخت برنامه با هوش مصنوعی');
      }
    } catch (err: any) {
      console.error(err);
      setGenerateError('خطا در ارتباط با سرور هوش مصنوعی Gemini. لطفاً دوباره تلاش فرمایید.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPlan = () => {
    window.print();
  };

  const totalExercises = currentDay.exercises.length;
  const completedCount = currentDay.exercises.filter((e) => e.completed).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Printable Sheet Header (Visible ONLY on print) */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          KASP FIT · تقویم تمرینی جامع و تخصصی ۷ روزه
        </h1>
        <p className="text-xs text-slate-600 mb-2">
          ورزشکار: {profile.gender === 'male' ? 'آقا' : 'خانم'} | سن: {profile.age} سال | وزن: {profile.weight}kg | قد: {profile.height}cm | هدف: {profile.goal}
        </p>
        <p className="text-xs text-slate-500">
          تاریخ تولید برنامه: {plan.generatedAt || 'امروز'} | {plan.planTitle}
        </p>
      </div>

      {/* Main Top Header Banner */}
      <div className="no-print bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <CalendarDays className="w-4 h-4" />
              <span>تقویم تمرینی هوشمند و هفتگی KASP Fit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {plan.planTitle}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {plan.overview}
            </p>
          </div>

          {/* Primary Action Button: "تولید تقویم تمرینی 7 روزه با AI" */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={handlePrintPlan}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold transition-all min-h-[44px] w-full sm:w-auto"
              title="خروجی پرینت و ذخیره به عنوان PDF"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>چاپ تقویم / خروجی PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGeneratorModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-95 text-slate-950 text-xs font-black transition-all shadow-xl shadow-emerald-500/25 min-h-[44px] w-full sm:w-auto whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>تولید تقویم تمرینی 7 روزه با AI</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Daily vs Full 7-Day Table) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-800/80 gap-3">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                viewMode === 'daily'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>نمای روزانه</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('full_calendar')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
                viewMode === 'full_calendar'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>تقویم کامل ۷ روزه</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>روز تمرینی</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              <span>استراحت فعال / ریکاوری</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: DAILY INTERACTIVE VIEW                                            */}
      {/* ========================================================================= */}
      {viewMode === 'daily' && (
        <div className="space-y-6 no-print">
          {/* 7-Day Horizontal Selector (Smooth scroll carousel on mobile, 7-col grid on tablet/desktop) */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-7 no-scrollbar snap-x touch-pan-x">
            {plan.days.map((day, idx) => {
              const isSelected = selectedDayIndex === idx;
              const dayCompleted =
                !day.isRestDay &&
                day.exercises.length > 0 &&
                day.exercises.every((e) => e.completed);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`shrink-0 w-22 sm:w-auto snap-center flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center relative min-h-[62px] active:scale-95 touch-manipulation ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : day.isRestDay
                      ? 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {dayCompleted && (
                    <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                  )}
                  <span className="text-xs font-bold">{day.dayName}</span>
                  <span
                    className={`text-[10px] mt-1 whitespace-nowrap truncate max-w-full font-medium ${
                      isSelected
                        ? 'text-slate-950 font-bold'
                        : day.isRestDay
                        ? 'text-sky-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.isRestDay ? 'ریکاوری' : `${day.exercises.length} حرکت`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Day Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            {/* Day Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {currentDay.dayName}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {currentDay.focus}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    مدت زمان تقریبی: {currentDay.estimatedDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    شدت: {currentDay.intensity}
                  </span>
                </div>
              </div>

              {!currentDay.isRestDay && totalExercises > 0 && (
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">پیشرفت تمرین امروز</span>
                    <span className="text-xs font-bold text-white tabular-nums">
                      {completedCount} از {totalExercises} انجام شد ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-slate-800 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-400"
                        strokeDasharray={`${progressPercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white tabular-nums">
                      {progressPercent}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Rest Day Message or Table of Exercises */}
            {currentDay.isRestDay ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="text-base font-bold text-white mb-1">
                    روز بازسازی، استراحت فعال و بازیابی ذخایر عضلانی
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    عضلات در زمان استراحت و ریکاوری رشد می‌کنند. برای افزایش جریان خون و دفع مواد زائد، توصیه‌های زیر را اجرا کنید:
                  </p>
                </div>
                <div className="max-w-lg mx-auto space-y-2.5 text-right">
                  {currentDay.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-white">{ex.nameFa}</h5>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ex.formTip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Desktop & Tablet Table (md and up) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-2 font-semibold">وضعیت</th>
                        <th className="py-3 px-3 font-semibold">حرکت ورزشی</th>
                        <th className="py-3 px-3 font-semibold text-center">ست</th>
                        <th className="py-3 px-3 font-semibold text-center">تکرار</th>
                        <th className="py-3 px-3 font-semibold text-center">استراحت بین ست</th>
                        <th className="py-3 px-4 font-semibold">نکات کلیدی اجرای ایمن (بیومکانیک)</th>
                        <th className="py-3 px-2 font-semibold text-center">ابزارها</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {currentDay.exercises.map((ex, exIdx) => {
                        const isChecked = !!ex.completed;
                        return (
                          <tr
                            key={ex.id || exIdx}
                            className={`hover:bg-slate-800/30 transition-colors ${
                              isChecked ? 'opacity-55' : 'opacity-100'
                            }`}
                          >
                            {/* Completed Checkbox */}
                            <td className="py-3.5 px-2">
                              <button
                                type="button"
                                onClick={() => toggleExerciseCompleted(selectedDayIndex, ex.id)}
                                className="text-slate-500 hover:text-emerald-400 transition-colors"
                              >
                                {isChecked ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-600" />
                                )}
                              </button>
                            </td>

                            {/* Exercise Name */}
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-white text-xs">
                                {ex.nameFa}
                              </div>
                              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                                {ex.nameEn}
                              </span>
                            </td>

                            {/* Sets */}
                            <td className="py-3.5 px-3 text-center">
                              <span className="font-bold text-slate-200 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 tabular-nums">
                                {ex.sets}
                              </span>
                            </td>

                            {/* Reps */}
                            <td className="py-3.5 px-3 text-center">
                              <span className="font-bold text-emerald-300 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 tabular-nums">
                                {ex.reps}
                              </span>
                            </td>

                            {/* Rest Seconds */}
                            <td className="py-3.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => onLaunchTimerForRest(ex.restSeconds)}
                                className="font-medium text-slate-300 hover:text-emerald-300 bg-slate-950 hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-800 tabular-nums transition-colors inline-flex items-center gap-1"
                                title="انتقال به تایمر استراحت"
                              >
                                <Timer className="w-3 h-3 text-emerald-400" />
                                <span>{ex.restSeconds}s</span>
                              </button>
                            </td>

                            {/* Biomechanical Form & Safety Tip */}
                            <td className="py-3.5 px-4 max-w-sm">
                              <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{ex.formTip}</span>
                              </div>
                            </td>

                            {/* Tool Shortcuts */}
                            <td className="py-3.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => onLaunchPoseCheckerForExercise(ex.nameFa)}
                                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-sky-400 hover:text-sky-300 transition-colors inline-block"
                                title="آنالیز فرم این حرکت با هوش مصنوعی"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Touch-Friendly Stacked Cards (Visible only on mobile screens < 768px) */}
                <div className="md:hidden space-y-3">
                  {currentDay.exercises.map((ex, exIdx) => {
                    const isChecked = !!ex.completed;
                    return (
                      <div
                        key={ex.id || exIdx}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isChecked
                            ? 'bg-slate-950/60 border-slate-900 opacity-60'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleExerciseCompleted(selectedDayIndex, ex.id)}
                              className="mt-0.5 text-slate-500 hover:text-emerald-400 min-h-[44px] min-w-[44px] flex items-center justify-center p-1 -m-1 active:scale-95 touch-manipulation"
                              title="علامت‌گذاری اتمام ست"
                            >
                              {isChecked ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-600" />
                              )}
                            </button>
                            <div>
                              <span
                                className={`text-xs sm:text-sm font-bold block ${
                                  isChecked ? 'line-through text-slate-400' : 'text-white'
                                }`}
                              >
                                {ex.nameFa}
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                                {ex.nameEn}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                            #{exIdx + 1}
                          </span>
                        </div>

                        {/* 3 Metric Pills */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-900/90 py-2 px-1 rounded-xl border border-slate-800/80">
                            <span className="block text-[10px] text-slate-400 mb-0.5">ست‌ها</span>
                            <span className="font-black text-slate-200 tabular-nums">{ex.sets} ست</span>
                          </div>
                          <div className="bg-slate-900/90 py-2 px-1 rounded-xl border border-slate-800/80">
                            <span className="block text-[10px] text-slate-400 mb-0.5">تکرار</span>
                            <span className="font-black text-emerald-300 tabular-nums">{ex.reps}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onLaunchTimerForRest(ex.restSeconds)}
                            className="bg-slate-900/90 hover:bg-slate-800 py-2 px-1 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center text-sky-300 transition-colors active:scale-95 min-h-[44px] touch-manipulation"
                            title="شروع تایمر استراحت"
                          >
                            <span className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1">
                              <Timer className="w-3 h-3 text-sky-400" />
                              استراحت
                            </span>
                            <span className="font-black tabular-nums">{ex.restSeconds}s</span>
                          </button>
                        </div>

                        {/* Biomechanical Form Tip */}
                        <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2 leading-relaxed">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{ex.formTip}</span>
                        </div>

                        {/* Mobile Actions: Timer & Pose Checker */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onLaunchTimerForRest(ex.restSeconds)}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-300 text-xs font-semibold border border-slate-800 transition-all min-h-[44px] touch-manipulation"
                          >
                            <Timer className="w-4 h-4 text-emerald-400" />
                            <span>تایمر ({ex.restSeconds}s)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onLaunchPoseCheckerForExercise(ex.nameFa)}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 active:scale-95 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all min-h-[44px] touch-manipulation"
                          >
                            <Camera className="w-4 h-4 text-sky-400" />
                            <span>آنالیز فرم هوشمند</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FULL 7-DAY CALENDAR (Comprehensive Table Cards & Print Ready)     */}
      {/* ========================================================================= */}
      {(viewMode === 'full_calendar' || true) && (
        <div className={`${viewMode === 'full_calendar' ? 'block' : 'hidden print:block'} space-y-6`}>
          <div className="grid grid-cols-1 gap-6">
            {plan.days.map((day, dIdx) => (
              <div
                key={dIdx}
                className="printable-card bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
              >
                {/* Day Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                      {day.dayName}
                    </span>
                    <h3 className="text-base font-bold text-white">
                      گروه عضلانی: {day.focus}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      مدت: {day.estimatedDuration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      شدت: {day.intensity}
                    </span>
                  </div>
                </div>

                {/* Exercises Table */}
                {day.isRestDay ? (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                    <span className="font-bold text-sky-400 block">روز استراحت فعال و بازیابی:</span>
                    {day.exercises.map((rex, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">{rex.nameFa}:</strong>{' '}
                          <span className="text-slate-400">{rex.formTip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {/* Desktop & Tablet Table (md and up) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400">
                            <th className="py-2.5 px-2 font-semibold">ردیف</th>
                            <th className="py-2.5 px-3 font-semibold">حرکت ورزشی (فارسی + لاتین)</th>
                            <th className="py-2.5 px-3 font-semibold text-center">تعداد ست</th>
                            <th className="py-2.5 px-3 font-semibold text-center">تکرار</th>
                            <th className="py-2.5 px-3 font-semibold text-center">استراحت بین ست</th>
                            <th className="py-2.5 px-4 font-semibold">نکات کلیدی اجرای ایمن (بیومکانیک)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {day.exercises.map((ex, exIdx) => (
                            <tr key={ex.id || exIdx} className="hover:bg-slate-800/20">
                              <td className="py-3 px-2 font-mono text-slate-500 tabular-nums">
                                {(exIdx + 1).toString().padStart(2, '0')}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-white block">{ex.nameFa}</span>
                                <span className="text-[10px] text-slate-400 font-sans block">
                                  {ex.nameEn}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-200 tabular-nums">
                                {ex.sets}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-emerald-300 tabular-nums">
                                {ex.reps}
                              </td>
                              <td className="py-3 px-3 text-center text-slate-300 tabular-nums">
                                {ex.restSeconds} ثانیه
                              </td>
                              <td className="py-3 px-4 text-[11px] text-slate-300 leading-relaxed max-w-md">
                                <div className="flex items-start gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 no-print" />
                                  <span>{ex.formTip}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Stacked Cards (Visible only on mobile screens < 768px) */}
                    <div className="md:hidden space-y-2.5">
                      {day.exercises.map((ex, exIdx) => (
                        <div
                          key={ex.id || exIdx}
                          className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-white block">{ex.nameFa}</span>
                              <span className="text-[10px] text-slate-400 font-sans block">{ex.nameEn}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              #{exIdx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-slate-300 font-bold tabular-nums">
                              {ex.sets} ست
                            </span>
                            <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-emerald-300 font-bold tabular-nums">
                              {ex.reps} تکرار
                            </span>
                            <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-sky-300 font-medium tabular-nums">
                              {ex.restSeconds} ثانیه استراحت
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{ex.formTip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warm-up & Cool-down Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs font-bold text-emerald-400 block mb-1">
            پروتکل گرم‌کردن استاندارد (Warm-up):
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {plan.recommendedWarmup}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs font-bold text-sky-400 block mb-1">
            پروتکل سرد کردن و بازتوانی (Cool-down):
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {plan.recommendedCooldown}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AI GENERATOR MODAL                                                        */}
      {/* ========================================================================= */}
      {isGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsGeneratorModalOpen(false)}
              className="absolute top-5 left-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>موتور هوش مصنوعی Gemini 3.8 Flash</span>
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              تولید تقویم تمرینی 7 روزه با AI
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              تقویم تمرینی هفتگی شما متناسب با سن ({profile.age} سال)، وزن ({profile.weight}kg)، قد ({profile.height}cm)، هدف ({profile.goal}) و سابقه آسیب‌دیدگی بازطراحی خواهد شد.
            </p>

            <div className="space-y-4">
              {/* Equipment */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  تجهیزات و محیط تمرینی
                </label>
                <select
                  value={equipmentChoice}
                  onChange={(e) => setEquipmentChoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="باشگاه بدنسازی کامل (هالتر، دمبل، دستگاه‌ها و سیم‌کش)">
                    باشگاه بدنسازی مجهز (هالتر، سیم‌کش، دمبل و دستگاه)
                  </option>
                  <option value="دمبل‌های خانگی و کش مقاومتی">
                    تمرین در منزل با دمبل و کش ورزشی
                  </option>
                  <option value="وزن بدن بدون هیچ وسیله‌ای (Calisthenics)">
                    تمرین با وزن بدن بدون وسیله (کالیستنیکس)
                  </option>
                </select>
              </div>

              {/* Days Per Week */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  تعداد روزهای تمرین پرفشار در هفته (بقیه روزها ریکاوری فعال)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTargetDaysCount(num)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                        targetDaysCount === num
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num} روز
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom notes or special focus */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  اولویت ویژه یا درخواست شخصی (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: تمرکز ویژه روی عضلات زیربغل و شانه، عدم فشار بر کمر..."
                  value={specialFocus}
                  onChange={(e) => setSpecialFocus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>

              {generateError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {generateError}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAIPlan}
                  disabled={isGenerating}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-98 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 disabled:opacity-50 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>در حال دریافت برنامه تفکیکی شنبه تا جمعه از Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>تولید تقویم تمرینی 7 روزه با AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
