import React, { useState } from 'react';
import {
  UserProfile,
  AssessmentResults,
  AIInsightResponse,
  InjuryCategory,
  FitnessGoal,
  FitnessLevel,
  Gender,
  AuthUser,
  WeeklyWorkoutPlan,
} from '../types/fitness';
import { calculateFitnessMetrics } from '../utils/fitnessCalculations';
import {
  Scale,
  Flame,
  Target,
  Droplets,
  HeartPulse,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  Info,
  CheckCircle2,
  RefreshCw,
  Pill,
  Dumbbell,
  ShieldAlert,
  Printer,
  FileDown,
  BookOpen,
  Wand2,
  X,
  User,
  Calendar,
  Check,
} from 'lucide-react';
import { PrintDossierModal } from './PrintDossierModal';
import { DEFAULT_WEEKLY_PLAN } from '../utils/fitnessCalculations';

interface AssessmentTabProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  plan?: WeeklyWorkoutPlan;
  currentUser?: AuthUser | null;
  onProceedToPlanner: () => void;
  onOpenPrintModal?: (mode?: 'full' | 'plan_only' | 'assessment_only') => void;
}

export const AssessmentTab: React.FC<AssessmentTabProps> = ({
  profile,
  setProfile,
  plan,
  currentUser,
  onProceedToPlanner,
  onOpenPrintModal,
}) => {
  const metrics: AssessmentResults = calculateFitnessMetrics(profile);
  const [aiInsights, setAiInsights] = useState<AIInsightResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isScientificModalOpen, setIsScientificModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [showDemoToast, setShowDemoToast] = useState<boolean>(false);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 1. Fill Demo / Sample Athlete Data
  const handleFillDemoData = () => {
    setProfile({
      age: 24,
      gender: 'male',
      height: 178,
      weight: 75,
      fitnessLevel: 'intermediate',
      goal: 'muscle_gain',
      activityLevel: 1.55,
      injuryHistory: 'knee',
      injuryDetails: 'کوفتگی خفیف تاندون پاتلار زانو راست در حرکات پرشی و جهشی',
      equipment: 'باشگاه بدنسازی کامل (هالتر، دمبل، دستگاه‌ها و سیم‌کش)',
      daysPerWeek: 4,
    });
    setShowDemoToast(true);
    setTimeout(() => setShowDemoToast(false), 3500);
  };

  // 2. Print / PDF Export
  const handlePrintDossier = () => {
    if (onOpenPrintModal) {
      onOpenPrintModal('full');
    } else {
      setIsPrintModalOpen(true);
    }
  };

  const fetchAIInsights = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/fitness-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          fitnessLevel: profile.fitnessLevel,
          goal: profile.goal,
          bmi: metrics.bmi,
          bmr: metrics.bmr,
          tdee: metrics.tdee,
          bodyFat: metrics.bodyFatPercentage,
          idealWeight: metrics.idealWeightFormula,
          injuryHistory: profile.injuryHistory !== 'none' ? `${profile.injuryHistory}: ${profile.injuryDetails}` : 'ندارد',
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAiInsights(resData.data);
      } else {
        throw new Error(resData.error || 'خطا در برقراری ارتباط');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('عدم امکان برقراری ارتباط با هوش مصنوعی. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoadingAi(false);
    }
  };

  // BMI status color helpers
  const getBmiColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'amber':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'rose':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'sky':
      default:
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-16 relative">
      {/* Toast Notification on Loading Demo Data */}
      {showDemoToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">داده‌های نمونه بارگذاری شد!</p>
            <p className="text-[11px] text-emerald-300/90">
              مشخصات ورزشکار نمونه (آقا، ۲۴ ساله، قد ۱۷۸، وزن ۷۵، هدف عضله‌سازی) در فرم ثبت گردید.
            </p>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="no-print relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <HeartPulse className="w-4 h-4" />
              <span>سیستم فیزیولوژی و ارزیابی جامع ورزشی</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              سنجش وضعیت جسمانی و آنالیز متابولیک
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              شاخص‌های بدنی خود را وارد کنید تا پارامترهای بیومتریک شامل شاخص توده بدنی (BMI)، متابولیسم پایه (BMR)، کالری هدف و وزن ایده‌آل به صورت بلادرنگ و با فرمول‌های استاندارد فیزیولوژی ورزشی محاسبه شوند.
            </p>
          </div>

          {/* Action Hub in Hero Banner */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            {/* 1. Fill Demo Data Button */}
            <button
              type="button"
              onClick={handleFillDemoData}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-95 min-h-[44px] w-full sm:w-auto"
            >
              <Wand2 className="w-4 h-4 text-emerald-400 group-hover:text-slate-950" />
              <span>پر کردن داده‌های نمونه (دمو)</span>
            </button>

            {/* 2. PDF Export / Print Dossier Button */}
            <button
              type="button"
              onClick={handlePrintDossier}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 min-h-[44px] w-full sm:w-auto"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>خروجی PDF / پرینت پرونده ورزشی</span>
            </button>

            {/* 3. Scientific Guide Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsScientificModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-bold transition-all shadow-sm active:scale-95 min-h-[44px] w-full sm:w-auto"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>راهنمای علمی فرمول‌ها</span>
            </button>
          </div>
        </div>
        <div className="absolute left-0 bottom-0 top-0 w-1/3 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Main Interactive Workspace (Hidden on Print) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: User Input (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">اطلاعات فردی و آنتروپومتریک</h2>
                <span className="text-[11px] text-slate-400">ورودی‌های سنجش فیزیولوژیک</span>
              </div>
              {/* Quick Fill Demo shortcut */}
              <button
                type="button"
                onClick={handleFillDemoData}
                title="تکمیل سریع با مشخصات فرد نمونه"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>داده‌های دمو</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Gender Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">جنسیت</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'male')}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      profile.gender === 'male'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    آقا (Male)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('gender', 'female')}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      profile.gender === 'female'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    خانم (Female)
                  </button>
                </div>
              </div>

              {/* Age & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">سن (سال)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={12}
                      max={90}
                      value={profile.age}
                      onChange={(e) => handleInputChange('age', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 pointer-events-none">سال</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">قد (سانتی‌متر)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={120}
                      max={225}
                      value={profile.height}
                      onChange={(e) => handleInputChange('height', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 pointer-events-none">cm</span>
                  </div>
                </div>
              </div>

              {/* Weight & Activity Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">وزن فعلی (کیلوگرم)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={35}
                      max={200}
                      step="0.5"
                      value={profile.weight}
                      onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 pointer-events-none">kg</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">سطح فعالیت روزانه</label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) => handleInputChange('activityLevel', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1.2}>کم‌تحرک (نشسته / کارمندی)</option>
                    <option value={1.375}>سبک (۱ تا ۳ روز ورزش در هفته)</option>
                    <option value={1.55}>متوسط (۳ تا ۵ روز ورزش در هفته)</option>
                    <option value={1.725}>سنگین (۶ تا ۷ روز تمرین)</option>
                    <option value={1.9}>فوق‌العاده فعال (ورزشکار حرفه‌ای)</option>
                  </select>
                </div>
              </div>

              {/* Fitness Level */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">سطح آمادگی جسمانی</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'beginner', label: 'مبتدی (Beginner)' },
                      { id: 'intermediate', label: 'متوسط (Intermediate)' },
                      { id: 'advanced', label: 'حرفه‌ای (Advanced)' },
                    ] as { id: FitnessLevel; label: string }[]
                  ).map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleInputChange('fitnessLevel', lvl.id)}
                      className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                        profile.fitnessLevel === lvl.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">هدف اصلی تمرینی</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'weight_loss', label: 'کاهش وزن و چربی‌سوزی' },
                      { id: 'muscle_gain', label: 'عضله‌سازی و هایپرتروفی' },
                      { id: 'strength_endurance', label: 'افزایش استقامت و توان' },
                      { id: 'general_fitness', label: 'تندرستی و سلامت عمومی' },
                    ] as { id: FitnessGoal; label: string }[]
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleInputChange('goal', g.id)}
                      className={`p-2.5 text-xs font-medium rounded-xl border text-right transition-all ${
                        profile.goal === g.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Injury History */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    سابقه آسیب‌دیدگی یا محدودیت مفصلی
                  </span>
                  <span className="text-[10px] text-slate-500">جهت اصلاح هوشمند تمرین</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                  {(
                    [
                      { id: 'none', label: 'ندارم' },
                      { id: 'knee', label: 'زانو' },
                      { id: 'lower_back', label: 'کمر/دیسک' },
                      { id: 'shoulder', label: 'سرشانه' },
                    ] as { id: InjuryCategory; label: string }[]
                  ).map((inj) => (
                    <button
                      key={inj.id}
                      type="button"
                      onClick={() => handleInputChange('injuryHistory', inj.id)}
                      className={`py-1.5 text-xs rounded-lg border transition-all ${
                        profile.injuryHistory === inj.id
                          ? inj.id === 'none'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {inj.label}
                    </button>
                  ))}
                </div>
                {profile.injuryHistory !== 'none' && (
                  <input
                    type="text"
                    placeholder="توضیح بیشتر در مورد درد یا نوع آسیب (مثلاً پارگی مینیسک، تاندونیت)..."
                    value={profile.injuryDetails}
                    onChange={(e) => handleInputChange('injuryDetails', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Metric Cards & Scientific Results (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main 4 Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BMI Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 relative overflow-hidden space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    شاخص توده بدنی (BMI)
                  </span>
                  {/* Scientific Formula Subtitle */}
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    (بر اساس فرمول‌های استاندارد Quetelet و Devine)
                  </span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getBmiColorClasses(metrics.bmiStatusColor)}`}>
                  {metrics.bmiCategory}
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-black text-white tabular-nums tracking-tight font-sans">
                  {metrics.bmi}
                </span>
                <span className="text-xs text-slate-500">kg/m²</span>
              </div>
              {/* Visual meter bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-sky-400 w-[20%]" title="کم‌وزن (< 18.5)" />
                <div className="h-full bg-emerald-500 w-[30%]" title="نرمال (18.5 - 24.9)" />
                <div className="h-full bg-amber-400 w-[25%]" title="اضافه وزن (25 - 29.9)" />
                <div className="h-full bg-rose-500 w-[25%]" title="چاق (≥ 30)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 tabular-nums">
                <span>16</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            {/* BMR Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    متابولیسم پایه (BMR)
                  </span>
                  {/* Scientific Formula Subtitle */}
                  <span className="text-[10px] text-orange-300/80 block mt-0.5">
                    (بر اساس فرمول‌های استاندارد Mifflin-St Jeor و Devine)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScientificModalOpen(true)}
                  className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 transition-colors"
                  title="مشاهده متدولوژی و رفرنس‌های علمی"
                >
                  <BookOpen className="w-3 h-3 text-emerald-400" />
                  <span>راهنما</span>
                </button>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-black text-white tabular-nums tracking-tight font-sans">
                  {metrics.bmr}
                </span>
                <span className="text-xs text-slate-500">کیلوکالری / روز</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                حداقل کالری ضروری برای حیات اندام‌های حیاتی بدن در حالت استراحت مطلق.
              </p>
            </div>

            {/* Target Calories & TDEE */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    کالری هدف روزانه
                  </span>
                  <span className="text-[10px] text-emerald-400/90 block mt-0.5 tabular-nums">
                    TDEE (کل انرژی مصرفی): {metrics.tdee} kcal
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-black text-emerald-400 tabular-nums tracking-tight font-sans">
                  {metrics.targetCalories}
                </span>
                <span className="text-xs text-slate-400">kcal/day</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {metrics.calorieAdjustmentNote}
              </p>
            </div>

            {/* Ideal Body Weight Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-400" />
                    وزن ایده‌آل و محدوده سلامت
                  </span>
                  {/* Scientific Formula Subtitle */}
                  <span className="text-[10px] text-indigo-300/80 block mt-0.5">
                    (بر اساس فرمول استاندارد Devine 1974)
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-3xl font-black text-white tabular-nums tracking-tight font-sans">
                  {metrics.idealWeightFormula}
                </span>
                <span className="text-xs text-slate-500">kg (ایده‌آل)</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                دامنه وزن سالم بر مبنای قد: <span className="text-emerald-400 font-bold tabular-nums">{metrics.idealWeightMin} تا {metrics.idealWeightMax}</span> کیلوگرم
              </p>
            </div>
          </div>

          {/* Secondary Stats Row: Body Fat & Hydration (Single column on mobile, 2 cols on tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">درصد چربی تخمینی (Deurenberg)</span>
                <span className="text-lg font-bold text-white tabular-nums font-sans">
                  ~{metrics.bodyFatPercentage}%
                </span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">آب مصرفی پیشنهادی</span>
                <span className="text-lg font-bold text-white tabular-nums font-sans">
                  {metrics.dailyWaterLiters} لیتر / روز
                </span>
              </div>
            </div>
          </div>

          {/* AI Insights Card & Generation Button */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>تحلیل تخصصی فیزیولوژی با هوش مصنوعی (AI Nutrition & Strategy)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تحلیل چندبعدی ماکرونوترینت‌ها (پروتئین، کربوهیدرات، چربی به گرم)، استراتژی ورزشی و احتیاط‌های بیومکانیکی
                </p>
              </div>

              <button
                type="button"
                onClick={fetchAIInsights}
                disabled={loadingAi}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loadingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>در حال پردازش فیزیولوژی...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تولید توصیه‌های هوشمند AI</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Result Presentation Box */}
            {aiInsights && (
              <div className="space-y-5 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
                {/* 1. Executive Summary */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed font-medium">
                    {aiInsights.summary}
                  </p>
                </div>

                {/* 2. Macro Split: Exact Grams */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-200 block">
                    توزیع دقیق ماکرونوترینت‌های روزانه (بر مبنای وزن و هدف):
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                      <span className="block text-[11px] text-slate-400">پروتئین خالص</span>
                      <span className="text-lg font-black text-rose-400 tabular-nums font-sans">
                        {aiInsights.macroSplit.proteinGrams}g
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {(aiInsights.macroSplit.proteinGrams * 4)} kcal
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                      <span className="block text-[11px] text-slate-400">کربوهیدرات پیچیده</span>
                      <span className="text-lg font-black text-amber-400 tabular-nums font-sans">
                        {aiInsights.macroSplit.carbsGrams}g
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {(aiInsights.macroSplit.carbsGrams * 4)} kcal
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
                      <span className="block text-[11px] text-slate-400">چربی‌های سالم</span>
                      <span className="text-lg font-black text-sky-400 tabular-nums font-sans">
                        {aiInsights.macroSplit.fatsGrams}g
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {(aiInsights.macroSplit.fatsGrams * 9)} kcal
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Weight & Cardio Strategies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5" />
                      استراتژی تمرینات قدرتی و با وزنه:
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {aiInsights.weightTrainingStrategy}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5" />
                      پروتکل تمرینات هوازی و کاردیو:
                    </span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {aiInsights.cardioRecommendation}
                    </p>
                  </div>
                </div>

                {/* 4. Supplements */}
                {aiInsights.supplements && aiInsights.supplements.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-sky-400" />
                      مکمل‌های ورزشی مجاز و علمی پیشنهادی (Safe Sports Supplements):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {aiInsights.supplements.map((supp, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-white text-xs truncate">{supp.name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                              {supp.dosage}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="text-slate-500">زمان مصرف:</span>
                            <span className="text-slate-300">{supp.timing}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {supp.benefit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Biomechanical Injury Precautions & Alerts */}
                {aiInsights.injuryPrecautions && aiInsights.injuryPrecautions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      هشدارها و احتیاط‌های بیومکانیکی مربوط به آسیب‌دیدگی:
                    </span>
                    <ul className="space-y-1.5 text-xs text-amber-100/90 leading-relaxed">
                      {aiInsights.injuryPrecautions.map((prec, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{prec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Key Advice Bullet Points */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 block mb-1">
                    توصیه‌های کلیدی برای استمرار و ارتقای عملکرد:
                  </span>
                  {aiInsights.keyAdvice.map((advice, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{advice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick CTA to next step: Planner & Print */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">مرحله بعدی: برنامه‌ریزی تمرینی</span>
              <span className="text-[11px] text-slate-400">انتقال اطلاعات ارزیابی به تقویم تمرینی هفتگی هوشمند</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintDossier}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                <Printer className="w-4 h-4 text-sky-400" />
                <span>پرینت پرونده</span>
              </button>
              <button
                type="button"
                onClick={onProceedToPlanner}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition-all min-h-[40px]"
              >
                <span>مشاهده برنامه تمرینی</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SCIENTIFIC GUIDE MODAL (متدولوژی و فرمول‌های علمی)         */}
      {/* ======================================================== */}
      {isScientificModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    راهنمای علمی و متدولوژی فرمول‌های محاسباتی
                  </h3>
                  <p className="text-xs text-slate-400">
                    رفرنس‌های معتبر فیزیولوژی ورزشی و تغذیه بالینی (ACSM و WHO)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScientificModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* 1. BMI */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    ۱. شاخص توده بدنی (BMI - Quetelet Index)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">BMI = Weight (kg) / Height² (m)</span>
                </div>
                <p className="text-slate-400 text-xs">
                  این شاخص توسط آدولف کِتله توسعه یافته و توسط سازمان جهانی بهداشت (WHO) برای دسته‌بندی وزن سلامت، کم‌وزنی (زیر ۱۸.۵)، نرمال (۱۸.۵ تا ۲۴.۹)، اضافه‌وزن (۲۵ تا ۲۹.۹) و چاقی (بالای ۳۰) استفاده می‌شود.
                </p>
              </div>

              {/* 2. BMR: Mifflin-St Jeor */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    ۲. متابولیسم پایه (BMR - Mifflin-St Jeor 1990)
                  </span>
                  <span className="text-[10px] text-orange-400 font-mono">استاندارد طلایی ژورنال AJCN</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                  <div>آقایان: BMR = (10 × وزن به کیلوگرم) + (6.25 × قد به سانتی‌متر) - (5 × سن) + 5</div>
                  <div>بانوان: BMR = (10 × وزن به کیلوگرم) + (6.25 × قد به سانتی‌متر) - (5 × سن) - 161</div>
                </div>
                <p className="text-slate-400 text-xs">
                  طبق مطالعات کالج تغذیه بالینی آمریکا، فرمول میفلین-سنت ژور ۵ تا ۱۰ درصد نسبت به فرمول قدیمی هریس-بندیکت (۱۹۱۹) دقیق‌تر بوده و خطای بیش‌تخمینی کمتری در افراد امروزی دارد.
                </p>
              </div>

              {/* 3. Devine Ideal Body Weight */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-400" />
                    ۳. وزن ایده‌آل بر اساس قد (Devine Formula 1974)
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">استاندارد بالینی داروشناسی و ورزش</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
                  <div>آقایان: 50kg + 2.3 × (قد بر حسب اینچ - 60)</div>
                  <div>بانوان: 45.5kg + 2.3 × (قد بر حسب اینچ - 60)</div>
                </div>
                <p className="text-slate-400 text-xs">
                  فرمول دیواین یکی از شناخته‌شده‌ترین متدهای تعیین وزن فیزیولوژیک بر اساس طول قد اسکلتی است و در دوزبندی پزشکی و تناسب اندام مبنا قرار می‌گیرد.
                </p>
              </div>

              {/* 4. TDEE and Body Fat */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-purple-400" />
                  ۴. درصد چربی (Deurenberg) و انرژی کل روزانه (TDEE)
                </span>
                <p className="text-slate-400 text-xs">
                  کل انرژی روزانه بر اساس ضرایب فعالیت بدنی پال (PAL) از ۱.۲ تا ۱.۹ ضربدر BMR برآورد می‌گردد. همچنین درصد چربی با مدل دِرنبِرگ (Deurenberg 1991) بر پایه رابطه بین سن، جنسیت و شاخص BMI استخراج می‌شود.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsScientificModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
              >
                متوجه شدم، بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PRINT-FRIENDLY ATHLETIC & CLINICAL DOSSIER             */}
      {/*    (Visible ONLY during Print / PDF Export)              */}
      {/* ======================================================== */}
      <div className="printable-dossier hidden print:block text-slate-900 bg-white p-6 font-sans">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              KASP FIT · سامانه تخصصی ارزیابی فیزیولوژی و برنامه تمرینی
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              پرونده رسمی سنجش وضعیت جسمانی، شاخص‌های متابولیک و پروتکل تمرینی اختصاصی
            </p>
          </div>
          <div className="text-left text-xs text-slate-700 space-y-0.5">
            <div><span className="font-bold">تاریخ صدور:</span> {new Date().toLocaleDateString('fa-IR')}</div>
            <div><span className="font-bold">کد پیگیری:</span> FIT-{Date.now().toString().slice(-6)}</div>
          </div>
        </div>

        {/* Section 1: User & Anthropometric Profile */}
        <div className="printable-card p-4 rounded-xl mb-4 bg-slate-50 border border-slate-300">
          <h2 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>۱. مشخصات فردی و آنتروپومتریک</span>
            {currentUser && (
              <span className="text-xs font-normal text-slate-700">
                نام: <strong className="font-bold">{currentUser.fullName}</strong> ({currentUser.roleLabel})
              </span>
            )}
          </h2>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">جنسیت:</span>
              <span className="font-bold">{profile.gender === 'male' ? 'آقا' : 'خانم'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">سن:</span>
              <span className="font-bold">{profile.age} سال</span>
            </div>
            <div>
              <span className="text-slate-500 block">قد:</span>
              <span className="font-bold">{profile.height} cm</span>
            </div>
            <div>
              <span className="text-slate-500 block">وزن فعلی:</span>
              <span className="font-bold">{profile.weight} kg</span>
            </div>
            <div>
              <span className="text-slate-500 block">سطح آمادگی:</span>
              <span className="font-bold">{profile.fitnessLevel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">هدف اصلی:</span>
              <span className="font-bold">
                {profile.goal === 'muscle_gain'
                  ? 'عضله‌سازی و هایپرتروفی'
                  : profile.goal === 'weight_loss'
                  ? 'کاهش وزن و چربی‌سوزی'
                  : profile.goal === 'strength_endurance'
                  ? 'افزایش استقامت و توان'
                  : 'تندرستی و سلامت عمومی'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">محدودیت یا آسیب‌دیدگی:</span>
              <span className="font-bold text-amber-800">
                {profile.injuryHistory === 'none' ? 'فاقد آسیب‌دیدگی' : `${profile.injuryHistory}: ${profile.injuryDetails || 'ثبت شده'}`}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Biometric & Metabolic Calculations */}
        <div className="printable-card p-4 rounded-xl mb-4 bg-slate-50 border border-slate-300">
          <h2 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-1">
            ۲. شاخص‌های متابولیک و فیزیولوژیک (بر اساس فرمول‌های استاندارد Mifflin-St Jeor و Devine)
          </h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">شاخص توده بدنی (BMI):</span>
              <span className="text-base font-black text-slate-900">{metrics.bmi} kg/m²</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">وضعیت: {metrics.bmiCategory}</span>
            </div>
            <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">متابولیسم پایه (BMR):</span>
              <span className="text-base font-black text-slate-900">{metrics.bmr} kcal</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">معادله Mifflin-St Jeor</span>
            </div>
            <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">انرژی کل روزانه (TDEE):</span>
              <span className="text-base font-black text-slate-900">{metrics.tdee} kcal</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">هدف روزانه: {metrics.targetCalories} kcal</span>
            </div>
            <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">وزن ایده‌آل (Devine Formula):</span>
              <span className="text-base font-black text-slate-900">{metrics.idealWeightFormula} kg</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">دامنه سلامت: {metrics.idealWeightMin} - {metrics.idealWeightMax} kg</span>
            </div>
            <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">درصد چربی تخمینی:</span>
              <span className="text-base font-black text-slate-900">~{metrics.bodyFatPercentage}%</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">فرمول Deurenberg</span>
            </div>
            <div className="border border-slate-200 bg-white p-2.5 rounded-lg">
              <span className="text-slate-500 block text-[11px]">آب مصرفی روزانه:</span>
              <span className="text-base font-black text-slate-900">{metrics.dailyWaterLiters} لیتر</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">هیدراتاسیون ورزشی</span>
            </div>
          </div>
        </div>

        {/* Section 3: AI Insights / Nutrition Breakdown (if generated) */}
        {aiInsights && (
          <div className="printable-card p-4 rounded-xl mb-4 bg-slate-50 border border-slate-300">
            <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">
              ۳. تحلیل تخصصی تغذیه و استراتژی تمرین هوش مصنوعی
            </h2>
            <p className="text-xs text-slate-700 mb-3">{aiInsights.summary}</p>
            <div className="grid grid-cols-3 gap-3 text-xs mb-3">
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">پروتئین:</span>
                <span className="font-bold text-sm text-slate-900">{aiInsights.macroSplit.proteinGrams} گرم</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">کربوهیدرات:</span>
                <span className="font-bold text-sm text-slate-900">{aiInsights.macroSplit.carbsGrams} گرم</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200 text-center">
                <span className="text-slate-500 block text-[11px]">چربی‌های سالم:</span>
                <span className="font-bold text-sm text-slate-900">{aiInsights.macroSplit.fatsGrams} گرم</span>
              </div>
            </div>
            {aiInsights.injuryPrecautions && aiInsights.injuryPrecautions.length > 0 && (
              <div className="text-xs bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-900">
                <strong className="block mb-1">احتیاط‌های بیومکانیکی مهم:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {aiInsights.injuryPrecautions.map((prec, i) => (
                    <li key={i}>{prec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Section 4: Complete Weekly Training Protocol (if plan available) */}
        {plan && plan.days && (
          <div className="printable-card p-4 rounded-xl mb-4 bg-slate-50 border border-slate-300 page-break-before">
            <h2 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>۴. پروتکل و تقویم تمرینی جامع ۷ روزه ({plan.planTitle || 'برنامه هفتگی KASP Fit'})</span>
              <span className="text-[11px] font-mono text-slate-500">شنبه تا جمعه</span>
            </h2>

            {plan.overview && (
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">{plan.overview}</p>
            )}

            <div className="space-y-3">
              {plan.days.map((day, dIdx) => (
                <div key={dIdx} className="avoid-break bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-xs text-slate-900 border border-slate-300">
                        {day.dayName}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        تمرکز: {day.focus}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      مدت: {day.estimatedDuration} | شدت: {day.intensity}
                    </span>
                  </div>

                  {day.isRestDay ? (
                    <div className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>روز استراحت فعال، بازیابی عضلانی و تحرک مفاصل</span>
                    </div>
                  ) : (
                    <table className="printable-table text-right">
                      <thead>
                        <tr>
                          <th style={{ width: '6%' }}>ردیف</th>
                          <th style={{ width: '38%' }}>حرکت ورزشی (فارسی و انگلیسی)</th>
                          <th style={{ width: '10%', textAlign: 'center' }}>ست</th>
                          <th style={{ width: '12%', textAlign: 'center' }}>تکرار</th>
                          <th style={{ width: '14%', textAlign: 'center' }}>استراحت</th>
                          <th style={{ width: '20%' }}>نکته ایمنی بیومکانیکی</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.exercises.map((ex, exIdx) => (
                          <tr key={ex.id || exIdx}>
                            <td className="font-mono text-center">{exIdx + 1}</td>
                            <td>
                              <strong className="block text-slate-900 text-[11px]">{ex.nameFa}</strong>
                              <span className="text-[9.5px] text-slate-500 font-sans block">{ex.nameEn}</span>
                            </td>
                            <td className="text-center font-bold text-[11px]">{ex.sets}</td>
                            <td className="text-center font-bold text-emerald-800 text-[11px]">{ex.reps}</td>
                            <td className="text-center text-slate-700 font-mono text-[10.5px]">
                              {ex.restSeconds}s
                            </td>
                            <td className="text-[10px] text-slate-600 leading-snug">{ex.formTip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature & Official Seal Box */}
        <div className="avoid-break mt-6 pt-3 border-t-2 border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-900 block">تأییدیه سیستم فیزیولوژی ورزشی KASP FIT</span>
            <span className="text-[10px] text-slate-500">سامانه هوشمند سلامت و تربیت بدنی</span>
          </div>
          <div className="text-center">
            <span className="block mb-4 text-[10px] text-slate-500">مهر و امضای متخصص تربیت بدنی / مربی</span>
            <span className="inline-block border-t border-slate-400 w-44"></span>
          </div>
        </div>
      </div>

      {/* Print and Save PDF Modal */}
      <PrintDossierModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        profile={profile}
        plan={plan || DEFAULT_WEEKLY_PLAN}
        currentUser={currentUser}
        aiInsights={aiInsights}
        initialMode="full"
      />
    </div>
  );
};
