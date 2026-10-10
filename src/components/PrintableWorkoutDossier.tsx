import React from 'react';
import {
  UserProfile,
  WeeklyWorkoutPlan,
  AuthUser,
  AIInsightResponse,
} from '../types/fitness';
import { calculateFitnessMetrics } from '../utils/fitnessCalculations';
import { CheckCircle2 } from 'lucide-react';

interface PrintableWorkoutDossierProps {
  profile: UserProfile;
  plan: WeeklyWorkoutPlan;
  currentUser?: AuthUser | null;
  aiInsights?: AIInsightResponse | null;
}

export const PrintableWorkoutDossier: React.FC<PrintableWorkoutDossierProps> = ({
  profile,
  plan,
  currentUser,
  aiInsights,
}) => {
  const metrics = calculateFitnessMetrics(profile);
  const currentDate = new Date().toLocaleDateString('fa-IR');
  const trackingCode = `FIT-${(profile.age * 137 + profile.height * 19).toString().slice(0, 6)}`;

  return (
    <div className="printable-dossier hidden print:block text-slate-900 bg-white font-sans w-full">
      {/* ======================================================== */}
      {/* 1. OFFICIAL DOSSIER HEADER                                */}
      {/* ======================================================== */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-slate-900">
              KASP FIT · پرونده جامع سنجش وضعیت جسمانی و برنامه تمرینی
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            سامانه تخصصی ارزیابی فیزیولوژی ورزشی، بیومکانیک و برنامه‌ریزی تربیت بدنی
          </p>
        </div>

        <div className="text-left text-[11px] text-slate-700 space-y-0.5 border border-slate-300 p-2 rounded-lg bg-slate-50">
          <div><span className="font-bold text-slate-500">تاریخ صدور:</span> <span className="font-mono">{currentDate}</span></div>
          <div><span className="font-bold text-slate-500">کد رهگیری:</span> <span className="font-mono font-bold text-emerald-800">{trackingCode}</span></div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. ATHLETE ANTHROPOMETRIC PROFILE                        */}
      {/* ======================================================== */}
      <div className="printable-card p-3.5 rounded-xl mb-3 bg-slate-50 border border-slate-300">
        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-900">
            ۱. مشخصات فردی و آنتروپومتریک ورزشکار
          </span>
          {currentUser && (
            <span className="text-xs text-slate-700">
              ورزشکار: <strong className="font-bold text-slate-900">{currentUser.fullName}</strong> ({currentUser.roleLabel})
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">جنسیت:</span>
            <span className="font-bold">{profile.gender === 'male' ? 'آقا' : 'خانم'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">سن:</span>
            <span className="font-bold">{profile.age} سال</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">قد اسکلتی:</span>
            <span className="font-bold">{profile.height} cm</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">وزن فعلی:</span>
            <span className="font-bold">{profile.weight} kg</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">سطح آمادگی:</span>
            <span className="font-bold">
              {profile.fitnessLevel === 'beginner' ? 'مبتدی' : profile.fitnessLevel === 'intermediate' ? 'متوسط' : 'پیشرفته'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">هدف اصلی:</span>
            <span className="font-bold">
              {profile.goal === 'muscle_gain'
                ? 'عضله‌سازی و هایپرتروفی'
                : profile.goal === 'weight_loss'
                ? 'کاهش وزن و چربی‌سوزی'
                : profile.goal === 'strength_endurance'
                ? 'استقامت و توان'
                : 'تندرستی و سلامت'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block text-[10px]">محدودیت یا آسیب‌دیدگی:</span>
            <span className="font-bold text-amber-900">
              {profile.injuryHistory === 'none' ? 'فاقد هرگونه آسیب‌دیدگی' : `${profile.injuryHistory}: ${profile.injuryDetails || 'ثبت شده'}`}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. BIOMETRIC & METABOLIC FORMULAS                        */}
      {/* ======================================================== */}
      <div className="printable-card p-3.5 rounded-xl mb-3 bg-slate-50 border border-slate-300">
        <h3 className="text-xs font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>۲. شاخص‌های متابولیک و فیزیولوژیک (Mifflin-St Jeor & Devine)</span>
          <span className="text-[10px] text-slate-500 font-normal">استاندارد بالینی کالج پزشکی ورزشی آمریکا (ACSM)</span>
        </h3>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="border border-slate-200 bg-white p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">شاخص توده بدنی (BMI):</span>
            <span className="text-sm font-black text-slate-900">{metrics.bmi} kg/m²</span>
            <span className="text-[10px] text-slate-600 block mt-0.5">وضعیت: {metrics.bmiCategory}</span>
          </div>
          <div className="border border-slate-200 bg-white p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">متابولیسم پایه (BMR):</span>
            <span className="text-sm font-black text-slate-900">{metrics.bmr} kcal</span>
            <span className="text-[10px] text-slate-600 block mt-0.5">معادله Mifflin-St Jeor</span>
          </div>
          <div className="border border-slate-200 bg-white p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">انرژی کل روزانه (TDEE):</span>
            <span className="text-sm font-black text-slate-900">{metrics.tdee} kcal</span>
            <span className="text-[10px] text-slate-600 block mt-0.5">کالری هدف: {metrics.targetCalories} kcal</span>
          </div>
          <div className="border border-slate-200 bg-white p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">وزن ایده‌آل (Devine Formula):</span>
            <span className="text-sm font-black text-slate-900">{metrics.idealWeightFormula} kg</span>
            <span className="text-[10px] text-slate-600 block mt-0.5">دامنه سلامت: {metrics.idealWeightMin} - {metrics.idealWeightMax} kg</span>
          </div>
          <div className="border border-slate-200 bg-white p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">درصد چربی تخمینی:</span>
            <span className="text-sm font-black text-slate-900">~{metrics.bodyFatPercentage}%</span>
            <span className="text-[10px] text-slate-600 block mt-0.5">فرمول دِرنبِرگ (Deurenberg)</span>
          </div>
          <div className="border border-slate-200 bg-white p-2 rounded-lg">
            <span className="text-slate-500 block text-[10px]">آب مصرفی روزانه:</span>
            <span className="text-sm font-black text-slate-900">{metrics.dailyWaterLiters} لیتر</span>
            <span className="text-[10px] text-slate-600 block mt-0.5">هیدراتاسیون تمرینی</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. AI NUTRITION & PHYSIOLOGY INSIGHTS                     */}
      {/* ======================================================== */}
      {aiInsights && (
        <div className="printable-card p-3.5 rounded-xl mb-3 bg-slate-50 border border-slate-300 avoid-break">
          <h3 className="text-xs font-bold text-slate-900 mb-1.5 border-b border-slate-200 pb-1">
            ۳. تحلیل تغذیه، ماکرونوترینت‌ها و استراتژی ورزشی هوش مصنوعی
          </h3>
          <p className="text-[11px] text-slate-700 mb-2 leading-relaxed">{aiInsights.summary}</p>
          
          <div className="grid grid-cols-3 gap-2 text-xs mb-2">
            <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
              <span className="text-slate-500 block text-[10px]">پروتئین خالص:</span>
              <span className="font-bold text-slate-900">{aiInsights.macroSplit.proteinGrams} گرم</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
              <span className="text-slate-500 block text-[10px]">کربوهیدرات:</span>
              <span className="font-bold text-slate-900">{aiInsights.macroSplit.carbsGrams} گرم</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
              <span className="text-slate-500 block text-[10px]">چربی‌های سالم:</span>
              <span className="font-bold text-slate-900">{aiInsights.macroSplit.fatsGrams} گرم</span>
            </div>
          </div>

          {aiInsights.injuryPrecautions && aiInsights.injuryPrecautions.length > 0 && (
            <div className="text-[11px] bg-amber-50 p-2 rounded border border-amber-200 text-amber-900">
              <strong className="block mb-0.5">هشدارها و احتیاط‌های بیومکانیکی:</strong>
              <ul className="list-disc list-inside space-y-0.5">
                {aiInsights.injuryPrecautions.map((prec, i) => (
                  <li key={i}>{prec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. COMPLETE 7-DAY WORKOUT PLAN PROTOCOL                  */}
      {/* ======================================================== */}
      <div className="printable-card p-3.5 rounded-xl mb-3 bg-slate-50 border border-slate-300 page-break-before">
        <div className="border-b border-slate-200 pb-1.5 mb-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900">
              ۴. برنامه تمرینی تفکیکی هفتگی ({plan.planTitle || 'برنامه تخصصی KASP Fit'})
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              شنبه تا جمعه (۷ روزه)
            </span>
          </div>
          {plan.overview && (
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {plan.overview}
            </p>
          )}
        </div>

        {/* Warm-up & Cool-down */}
        <div className="grid grid-cols-2 gap-2 text-[11px] mb-2.5 bg-white p-2 rounded-lg border border-slate-200">
          <div>
            <strong className="text-emerald-800 block text-[10px]">پروتکل گرم‌کردن:</strong>
            <span className="text-slate-600">{plan.recommendedWarmup || '۵ الی ۱۰ دقیقه هوازی سبک + موبیلیتی'}</span>
          </div>
          <div>
            <strong className="text-sky-800 block text-[10px]">پروتکل سردکردن:</strong>
            <span className="text-slate-600">{plan.recommendedCooldown || '۵ دقیقه کشش ایستا و ریکاوری'}</span>
          </div>
        </div>

        {/* Day-by-Day Exercises */}
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

      {/* ======================================================== */}
      {/* 6. OFFICIAL VERIFICATION & SEAL                         */}
      {/* ======================================================== */}
      <div className="avoid-break mt-6 pt-3 border-t-2 border-slate-300 flex items-center justify-between text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-900 block">
            سامانه هوشمند سلامت و تربیت بدنی KASP FIT
          </span>
          <span className="text-[10px] text-slate-500">
            تأییدیه خودکار فیزیولوژی ورزشی بر مبنای استانداردهای ACSM
          </span>
        </div>
        <div className="text-center">
          <span className="block mb-4 text-[10px] text-slate-500">
            محل امضا و مهر مربی / متخصص تربیت بدنی
          </span>
          <span className="inline-block border-t border-slate-400 w-44"></span>
        </div>
      </div>
    </div>
  );
};
