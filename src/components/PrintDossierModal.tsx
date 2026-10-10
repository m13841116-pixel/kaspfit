import React, { useState } from 'react';
import {
  UserProfile,
  WeeklyWorkoutPlan,
  AuthUser,
  AIInsightResponse,
} from '../types/fitness';
import { calculateFitnessMetrics } from '../utils/fitnessCalculations';
import {
  Printer,
  FileDown,
  X,
  Eye,
  CheckCircle2,
  CalendarDays,
  Activity,
  ShieldCheck,
  Dumbbell,
  Clock,
  Sparkles,
  Info,
  Scale,
  Flame,
  FileText,
} from 'lucide-react';

export type PrintDossierMode = 'full' | 'plan_only' | 'assessment_only';

interface PrintDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  plan: WeeklyWorkoutPlan;
  currentUser?: AuthUser | null;
  aiInsights?: AIInsightResponse | null;
  initialMode?: PrintDossierMode;
}

export const PrintDossierModal: React.FC<PrintDossierModalProps> = ({
  isOpen,
  onClose,
  profile,
  plan,
  currentUser,
  aiInsights,
  initialMode = 'full',
}) => {
  const [printMode, setPrintMode] = useState<PrintDossierMode>(initialMode);
  const metrics = calculateFitnessMetrics(profile);
  const currentDate = new Date().toLocaleDateString('fa-IR');
  const trackingCode = `FIT-${(profile.age * 137 + profile.height * 19).toString().slice(0, 6)}`;

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const showAssessment = printMode === 'full' || printMode === 'assessment_only';
  const showWorkoutPlan = printMode === 'full' || printMode === 'plan_only';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header Controls (Hidden on Print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>پیش‌نمایش چاپ و ذخیره PDF پرونده ورزشی</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                  استاندارد A4
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                خروجی پاکیزه و بهینه‌سازی‌شده برای ذخیره فایل PDF و چاپ رسمی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>چاپ / ذخیره PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              title="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options Bar & Helper Callout (Hidden on Print) */}
        <div className="no-print p-3 sm:px-6 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">محتوای خروجی:</span>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPrintMode('full')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  printMode === 'full'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                پرونده جامع (هر دو)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('assessment_only')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  printMode === 'assessment_only'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                فقط ارزیابی جسمانی
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('plan_only')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  printMode === 'plan_only'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                فقط برنامه تمرینی
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-sky-300 bg-sky-950/30 border border-sky-500/20 px-3 py-1.5 rounded-xl">
            <Info className="w-3.5 h-3.5 shrink-0 text-sky-400" />
            <span>
              راهنما: در پنجره چاپ مرورگر، مقصد را روی <strong>Save as PDF</strong> تنظیم کنید.
            </span>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/80">
          {/* A4 Paper Mockup (In screen it has A4 styling, during print it takes over cleanly) */}
          <div className="printable-dossier max-w-3xl mx-auto bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl font-sans">
            {/* Header: Official KASP FIT Branding */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 font-black text-sm flex items-center justify-center font-mono">
                    KF
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    KASP FIT · پرونده تخصصی ارزیابی و برنامه تمرینی
                  </h1>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  سامانه ملی فیزیولوژی ورزشی، بیومکانیک حرکتی و برنامه‌ریزی هوشمند تربیت بدنی
                </p>
              </div>

              <div className="text-xs text-slate-700 space-y-0.5 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-right sm:text-left">
                <div>
                  <span className="font-bold text-slate-500">تاریخ صدور: </span>
                  <span className="font-mono font-bold">{currentDate}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">کد رهگیری: </span>
                  <span className="font-mono font-bold text-emerald-800">{trackingCode}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500">وضعیت پرونده: </span>
                  <span className="font-bold text-emerald-700">تأییدشده و معتبر</span>
                </div>
              </div>
            </div>

            {/* User Profile Banner */}
            <div className="printable-card p-4 rounded-xl mb-5 bg-slate-50 border border-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  مشخصات ورزشکار و اطلاعات فردی
                </span>
                {currentUser ? (
                  <span className="text-xs text-slate-700">
                    ورزشکار: <strong className="text-slate-900 font-bold">{currentUser.fullName}</strong> ({currentUser.roleLabel})
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">ورزشکار ثبت‌شده در سیستم</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">جنسیت:</span>
                  <span className="font-bold">{profile.gender === 'male' ? 'آقا' : 'خانم'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">سن:</span>
                  <span className="font-bold">{profile.age} سال</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">قد اسکلتی:</span>
                  <span className="font-bold">{profile.height} سانتی‌متر</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">وزن فعلی:</span>
                  <span className="font-bold">{profile.weight} کیلوگرم</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">سطح آمادگی:</span>
                  <span className="font-bold">
                    {profile.fitnessLevel === 'beginner'
                      ? 'مبتدی (آموزش الگو)'
                      : profile.fitnessLevel === 'intermediate'
                      ? 'متوسط (پیشرفت بار)'
                      : 'پیشرفته (حرفه‌ای)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">هدف اصلی:</span>
                  <span className="font-bold">
                    {profile.goal === 'muscle_gain'
                      ? 'عضله‌سازی و هایپرتروفی'
                      : profile.goal === 'weight_loss'
                      ? 'کاهش وزن و چربی‌سوزی'
                      : profile.goal === 'strength_endurance'
                      ? 'استقامت عضلانی و توان'
                      : 'تندرستی و سلامت عمومی'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[11px]">سابقه آسیب‌دیدگی:</span>
                  <span className="font-bold text-amber-900">
                    {profile.injuryHistory === 'none'
                      ? 'فاقد هرگونه آسیب مفاصل یا ستون فقرات'
                      : `${profile.injuryHistory} ${profile.injuryDetails ? `(${profile.injuryDetails})` : ''}`}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 1: PHYSICAL ASSESSMENT & METABOLIC FORMULAS */}
            {showAssessment && (
              <div className="space-y-4 mb-6">
                <div className="printable-card p-4 rounded-xl bg-slate-50 border border-slate-300">
                  <h3 className="text-xs font-bold text-slate-900 mb-3 border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <span>۱. نتایج سنجش فیزیولوژی و شاخص‌های بیومتریک</span>
                    <span className="text-[10px] text-slate-600 font-normal">
                      فرمول‌های استاندارد بالینی Mifflin-St Jeor و Devine
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">شاخص توده بدنی (BMI):</span>
                      <span className="text-base font-black text-slate-900">{metrics.bmi} kg/m²</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        وضعیت: {metrics.bmiCategory}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">متابولیسم پایه (BMR):</span>
                      <span className="text-base font-black text-slate-900">{metrics.bmr} kcal</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        معادله Mifflin-St Jeor (1990)
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">انرژی کل روزانه (TDEE):</span>
                      <span className="text-base font-black text-slate-900">{metrics.tdee} kcal</span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        کالری هدف: {metrics.targetCalories} kcal
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">وزن ایده‌آل (Devine Index):</span>
                      <span className="text-base font-black text-slate-900">
                        {metrics.idealWeightFormula} kg
                      </span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        دامنه سلامت: {metrics.idealWeightMin} تا {metrics.idealWeightMax} kg
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">درصد چربی تخمینی:</span>
                      <span className="text-base font-black text-slate-900">
                        ~{metrics.bodyFatPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        فرمول دِرنبِرگ (Deurenberg)
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">آب مصرفی روزانه:</span>
                      <span className="text-base font-black text-slate-900">
                        {metrics.dailyWaterLiters} لیتر
                      </span>
                      <span className="text-[10px] text-slate-600 block mt-0.5">
                        هیدراتاسیون ورزشی ۳۵ml/kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Physiological & Nutritional Insights (if generated or default values) */}
                {aiInsights && (
                  <div className="printable-card p-4 rounded-xl bg-slate-50 border border-slate-300">
                    <h3 className="text-xs font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                      <span>۲. تحلیل تخصصی تغذیه و استراتژی فیزیولوژیک AI</span>
                      <span className="text-[10px] text-emerald-800 font-bold">هوش مصنوعی ورزشی KASP</span>
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed mb-3">
                      {aiInsights.summary}
                    </p>

                    <div className="grid grid-cols-3 gap-2.5 text-xs mb-3">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[10px]">پروتئین هدف:</span>
                        <span className="font-black text-slate-900">{aiInsights.macroSplit.proteinGrams} گرم</span>
                        <span className="text-[10px] text-slate-500 block">سنتز پروتئین عضلانی</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[10px]">کربوهیدرات:</span>
                        <span className="font-black text-slate-900">{aiInsights.macroSplit.carbsGrams} گرم</span>
                        <span className="text-[10px] text-slate-500 block">گلیکوژن و انرژی تمرین</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                        <span className="text-slate-500 block text-[10px]">چربی‌های سالم:</span>
                        <span className="font-black text-slate-900">{aiInsights.macroSplit.fatsGrams} گرم</span>
                        <span className="text-[10px] text-slate-500 block">تنظیم هورمونی</span>
                      </div>
                    </div>

                    {aiInsights.supplements && aiInsights.supplements.length > 0 && (
                      <div className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 mb-2">
                        <strong className="block text-slate-800 mb-1 text-[11px]">
                          مکمل‌های ورزشی علمی و ایمن پیشنهادی:
                        </strong>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {aiInsights.supplements.map((sup, sIdx) => (
                            <div key={sIdx} className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px]">
                              <span className="font-bold text-slate-900 block">{sup.name}</span>
                              <span className="text-slate-600 block">دوز: {sup.dosage}</span>
                              <span className="text-slate-500 text-[10px] block">زمان: {sup.timing}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiInsights.injuryPrecautions && aiInsights.injuryPrecautions.length > 0 && (
                      <div className="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
                        <strong className="block mb-1 text-[11px]">
                          احتیاط‌ها و محدودیت‌های بیومکانیکی مهم:
                        </strong>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {aiInsights.injuryPrecautions.map((prec, pIdx) => (
                            <li key={pIdx}>{prec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: WORKOUT PLAN PROTOCOL (7-DAY COMPREHENSIVE CALENDAR) */}
            {showWorkoutPlan && (
              <div className="space-y-4 mb-6">
                <div className={`printable-card p-4 rounded-xl bg-slate-50 border border-slate-300 ${showAssessment ? 'page-break-before' : ''}`}>
                  <div className="border-b border-slate-200 pb-2 mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                        ۳. برنامه تمرینی هفتگی جامع ({plan.planTitle})
                      </h3>
                      <span className="text-xs font-mono text-slate-600">
                        تولیدشده در پلتفرم KASP Fit
                      </span>
                    </div>
                    {plan.overview && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {plan.overview}
                      </p>
                    )}
                  </div>

                  {/* Warm-up and Cool-down summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <strong className="text-emerald-800 block text-[11px]">پروتکل گرم‌کردن:</strong>
                      <span className="text-slate-600 text-[11px]">
                        {plan.recommendedWarmup || '۵-۱۰ دقیقه هوازی سبک + موبیلیتی مفاصل'}
                      </span>
                    </div>
                    <div>
                      <strong className="text-sky-800 block text-[11px]">پروتکل سردکردن:</strong>
                      <span className="text-slate-600 text-[11px]">
                        {plan.recommendedCooldown || '۵ دقیقه کشش ایستا و بازگشت ضربان قلب'}
                      </span>
                    </div>
                  </div>

                  {/* 7-Day Exercise Tables */}
                  <div className="space-y-4">
                    {plan.days.map((day, dIdx) => (
                      <div
                        key={dIdx}
                        className="avoid-break bg-white p-3 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-xs text-slate-900 border border-slate-300">
                              {day.dayName}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              تمرکز: {day.focus}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            مدت: {day.estimatedDuration} | شدت: {day.intensity}
                          </span>
                        </div>

                        {day.isRestDay ? (
                          <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>
                              روز استراحت فعال، کشش ملایم و بازیابی عضلانی
                            </span>
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
                                    <strong className="block text-slate-900">{ex.nameFa}</strong>
                                    <span className="text-[10px] text-slate-500 font-sans block">
                                      {ex.nameEn}
                                    </span>
                                  </td>
                                  <td className="text-center font-bold">{ex.sets}</td>
                                  <td className="text-center font-bold text-emerald-800">{ex.reps}</td>
                                  <td className="text-center text-slate-700 font-mono">
                                    {ex.restSeconds} ثانیه
                                  </td>
                                  <td className="text-[10px] text-slate-600 leading-snug">
                                    {ex.formTip}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Official Footer: Signatures and Validation Seals */}
            <div className="avoid-break mt-6 pt-4 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block">
                  سامانه سنجش فیزیولوژی و برنامه‌ریزی ورزشی KASP FIT
                </span>
                <span className="text-[11px] text-slate-500">
                  صادرشده به صورت سیستمی و معتبر بر اساس استانداردهای بین‌المللی ACSM و WHO
                </span>
              </div>

              <div className="text-center">
                <span className="block mb-5 text-[11px] text-slate-500">
                  محل امضا و مهر مربی / متخصص تربیت بدنی
                </span>
                <span className="inline-block border-t border-slate-400 w-44"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden on Print) */}
        <div className="no-print p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            برای خروجی بهتر، تیک Headers and Footers مرورگر را بردارید.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ و ذخیره فایل PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
