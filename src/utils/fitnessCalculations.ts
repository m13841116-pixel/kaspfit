import { UserProfile, AssessmentResults, WeeklyWorkoutPlan } from '../types/fitness';

export function calculateFitnessMetrics(profile: UserProfile): AssessmentResults {
  const { age, gender, height, weight, goal, activityLevel } = profile;

  // 1. BMI Calculation
  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

  let bmiCategory = 'نرمال و متناسب';
  let bmiStatusColor: 'emerald' | 'amber' | 'rose' | 'sky' = 'emerald';

  if (bmi < 18.5) {
    bmiCategory = 'کم‌وزن (نیاز به افزایش وزن)';
    bmiStatusColor = 'sky';
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = 'نرمال و محدوده سلامت ایده‌آل';
    bmiStatusColor = 'emerald';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'اضافه وزن ملایم';
    bmiStatusColor = 'amber';
  } else if (bmi >= 30 && bmi < 35) {
    bmiCategory = 'چاقی درجه ۱';
    bmiStatusColor = 'rose';
  } else {
    bmiCategory = 'چاقی شدید (نیازمند مداخله ورزشی و تغذیه‌ای)';
    bmiStatusColor = 'rose';
  }

  // 2. BMR (Mifflin-St Jeor Equation)
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // 3. TDEE (Total Daily Energy Expenditure)
  const tdee = Math.round(bmr * activityLevel);

  // 4. Ideal Weight (Devine & Robinson Formulas)
  // Height in inches over 5 feet (60 inches = 152.4 cm)
  const totalInches = height / 2.54;
  const inchesOver5Ft = Math.max(0, totalInches - 60);

  let devineWeight = 0;
  if (gender === 'male') {
    devineWeight = 50 + 2.3 * inchesOver5Ft;
  } else {
    devineWeight = 45.5 + 2.3 * inchesOver5Ft;
  }

  // Healthy BMI range weights (18.5 to 24.9)
  const idealWeightMin = Math.round(18.5 * (heightInMeters * heightInMeters));
  const idealWeightMax = Math.round(24.9 * (heightInMeters * heightInMeters));
  const idealWeightFormula = Math.round(devineWeight);

  // 5. Body Fat % Estimation (Deurenberg Formula)
  // Body Fat % = (1.20 × BMI) + (0.23 × Age) - (10.8 × gender) - 5.4 (gender: male=1, female=0)
  const genderFactor = gender === 'male' ? 1 : 0;
  let bodyFat = 1.2 * bmi + 0.23 * age - 10.8 * genderFactor - 5.4;
  bodyFat = Math.max(5, Math.min(55, parseFloat(bodyFat.toFixed(1))));

  // 6. Water intake: 35ml per kg + 500ml for training
  const dailyWaterLiters = parseFloat(((weight * 0.035) + 0.6).toFixed(1));

  // 7. Calorie target & note
  let targetCalories = tdee;
  let calorieAdjustmentNote = 'تثبیت وزن و حفظ توده عضلانی';

  if (goal === 'weight_loss') {
    targetCalories = Math.max(bmr, tdee - 450);
    calorieAdjustmentNote = 'کسری کالری ملایم (~۴۵۰ کالری) برای چربی‌سوزی پایدار بدون افت عضله';
  } else if (goal === 'muscle_gain') {
    targetCalories = tdee + 350;
    calorieAdjustmentNote = 'مازاد کالری هوشمند (~۳۵۰ کالری) جهت سوخت‌رسانی به هایپرتروفی عضلانی';
  } else if (goal === 'strength_endurance') {
    targetCalories = tdee + 150;
    calorieAdjustmentNote = 'انرژی بهینه با کربوهیدرات کافی جهت افزایش استقامت و توان عضلانی';
  }

  return {
    bmi,
    bmiCategory,
    bmiStatusColor,
    bmr,
    tdee,
    idealWeightMin,
    idealWeightMax,
    idealWeightFormula,
    bodyFatPercentage: bodyFat,
    dailyWaterLiters,
    targetCalories,
    calorieAdjustmentNote,
  };
}

export const DEFAULT_WEEKLY_PLAN: WeeklyWorkoutPlan = {
  planTitle: 'برنامه جامع بدنسازی و فیتنس هفتگی KASP Fit',
  overview: 'این برنامه بر اساس متد علمی تفکیک عضلات و اضافه بار تدریجی طراحی شده است. زمان‌های استراحت را با تایمر KASP Fit رعایت کنید.',
  recommendedWarmup: '۵ الی ۸ دقیقه کاردیو سبک (دوچرخه یا تردمیل) + چرخش مفاصل شانه، لگن و زانو + ۲ ست سبک گرم‌کردن اختصاصی با وزنه سبک',
  recommendedCooldown: '۵ دقیقه کشش ایستا عضلات هدف + تنفس عمیق دیافراگمی جهت کاهش ترشح کورتیزول',
  days: [
    {
      dayName: 'شنبه',
      dayIndex: 0,
      focus: 'سینه، سرشانه قدامی و پشت‌بازو (Push)',
      isRestDay: false,
      estimatedDuration: '65 دقیقه',
      intensity: 'سنگین',
      exercises: [
        {
          id: 'ex-1',
          nameFa: 'پرس سینه با هالتر روی نیمکت صاف',
          nameEn: 'Barbell Bench Press',
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          rpe: '8-9',
          formTip: 'شاخک‌های کتف را به هم نزدیک و قفل کنید. در پایین حرکت میله را با کنترل روی خط سینه لمس کنید.',
        },
        {
          id: 'ex-2',
          nameFa: 'پرس بالاسینه با دمبل',
          nameEn: 'Incline Dumbbell Press',
          sets: 3,
          reps: '10-12',
          restSeconds: 75,
          rpe: '8',
          formTip: 'شیب صندلی را روی ۳۰ درجه تنظیم کنید تا تمرکز روی بخش فوقانی سینه باقی بماند.',
        },
        {
          id: 'ex-3',
          nameFa: 'فلای سینه با سیم‌کش (کراس‌اوور)',
          nameEn: 'Cable Chest Flyes',
          sets: 3,
          reps: '12-15',
          restSeconds: 60,
          rpe: '7-8',
          formTip: 'در اوج انقباض ۱ ثانیه مکث کنید و بازوها را به آرامی با کشش کامل باز کنید.',
        },
        {
          id: 'ex-4',
          nameFa: 'نشر از جانب با دمبل (سرشانه جانبی)',
          nameEn: 'Dumbbell Lateral Raise',
          sets: 4,
          reps: '12-15',
          restSeconds: 60,
          rpe: '8',
          formTip: 'از پرتاب کردن وزنه با بالاتنه پرهیز کنید؛ آرنج‌ها اندکی خم و هدایت‌کننده حرکت باشند.',
        },
        {
          id: 'ex-5',
          nameFa: 'پشت‌بازو سیم‌کش با طناب',
          nameEn: 'Triceps Rope Pushdown',
          sets: 3,
          reps: '12-15',
          restSeconds: 60,
          rpe: '8',
          formTip: 'در انتهای دامنه طناب را به طرفین باز کنید تا سر جانبی پشت‌بازو کاملاً منقبض شود.',
        },
      ],
    },
    {
      dayName: 'یکشنبه',
      dayIndex: 1,
      focus: 'زیربغل، دلتوئید خلفی و جلوبازو (Pull)',
      isRestDay: false,
      estimatedDuration: '60 دقیقه',
      intensity: 'سنگین',
      exercises: [
        {
          id: 'ex-6',
          nameFa: 'بارفیکس دست باز / لت سیم‌کش',
          nameEn: 'Wide-Grip Lat Pulldown',
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          rpe: '8',
          formTip: 'کشش را از عضلات لت شروع کنید و میله را تا بالای جناغ سینه پایین بکشید.',
        },
        {
          id: 'ex-7',
          nameFa: 'زیربغل قایقی سیم‌کش دست جمع',
          nameEn: 'Seated Cable Row',
          sets: 3,
          reps: '10-12',
          restSeconds: 75,
          rpe: '8',
          formTip: 'کمر کاملاً صاف باشد و در انتهای کشش، شست‌ها به سمت شکم هدایت شوند.',
        },
        {
          id: 'ex-8',
          nameFa: 'فیس‌پول با سیم‌کش',
          nameEn: 'Face Pulls',
          sets: 3,
          reps: '15',
          restSeconds: 60,
          rpe: '7',
          formTip: 'عالی برای حفظ سلامت روتاتور کاف و تقویت دلتوئید خلفی.',
        },
        {
          id: 'ex-9',
          nameFa: 'جلوبازو با هالتر EZ ایستاده',
          nameEn: 'EZ-Bar Biceps Curl',
          sets: 3,
          reps: '10-12',
          restSeconds: 60,
          rpe: '8',
          formTip: 'آرنج‌ها را کنار دنده‌ها ثابت نگه دارید و از تاب دادن کمر بپرهیزید.',
        },
        {
          id: 'ex-10',
          nameFa: 'جلوبازو دمبل چکشی روی میز شیب‌دار',
          nameEn: 'Incline Dumbbell Hammer Curl',
          sets: 3,
          reps: '12',
          restSeconds: 60,
          rpe: '8',
          formTip: 'تقویت عضله براکیالیس و قطر بازو.',
        },
      ],
    },
    {
      dayName: 'دوشنبه',
      dayIndex: 2,
      focus: 'استراحت فعال، موبیلیتی و مفاصل (Active Recovery)',
      isRestDay: true,
      estimatedDuration: '30 دقیقه',
      intensity: 'سبک',
      exercises: [
        {
          id: 'ex-rec-1',
          nameFa: 'پیاده‌روی با سرعت متوسط در فضای باز یا تردمیل',
          nameEn: 'Brisk Walking',
          sets: 1,
          reps: '25-30 دقیقه',
          restSeconds: 0,
          formTip: 'افزایش گردش خون و تسریع دفع اسید لاکتیک از فیبرهای عضلانی.',
        },
        {
          id: 'ex-rec-2',
          nameFa: 'حرکات کششی پویا و فوم رولر ران و باسن',
          nameEn: 'Foam Rolling & Dynamic Stretches',
          sets: 3,
          reps: 'هر مفصل ۶۰ ثانیه',
          restSeconds: 30,
          formTip: 'رهاسازی نقاط ماشه‌ای عضلات (Myofascial Release).',
        },
      ],
    },
    {
      dayName: 'سه‌شنبه',
      dayIndex: 3,
      focus: 'عضلات پا، چهارسر، همسترینگ و ساق (Legs)',
      isRestDay: false,
      estimatedDuration: '70 دقیقه',
      intensity: 'خیلی سنگین',
      exercises: [
        {
          id: 'ex-11',
          nameFa: 'اسکات پا با هالتر از پشت',
          nameEn: 'Barbell Back Squat',
          sets: 4,
          reps: '8-10',
          restSeconds: 120,
          rpe: '8-9',
          formTip: 'هسته بدن را منقبض کرده، تا زاویه ۹۰ درجه موازی با زمین فرود بیایید و وزن روی میانه پا باشد.',
        },
        {
          id: 'ex-12',
          nameFa: 'پرس پا با دستگاه ۴۵ درجه',
          nameEn: '45-Degree Leg Press',
          sets: 3,
          reps: '10-12',
          restSeconds: 90,
          rpe: '8',
          formTip: 'در اوج حرکت زانوها را قفل نکنید تا فشار از روی مفصل زانو برداشته شود.',
        },
        {
          id: 'ex-13',
          nameFa: 'ددلیفت رومانیایی با دمبل (پشت پا)',
          nameEn: 'Romanian Deadlift (RDL)',
          sets: 3,
          reps: '10-12',
          restSeconds: 90,
          rpe: '8',
          formTip: 'لگن را به عقب هل دهید و ستون فقرات را کاملاً صاف و بدون قوز نگه دارید.',
        },
        {
          id: 'ex-14',
          nameFa: 'جلو ران با دستگاه',
          nameEn: 'Leg Extension',
          sets: 3,
          reps: '12-15',
          restSeconds: 60,
          rpe: '8',
          formTip: 'مکث ۱ ثانیه‌ای در انتهای دامنه مثبت برای پمپاژ حداکثری خون به چهارسر.',
        },
        {
          id: 'ex-15',
          nameFa: 'ساق پا ایستاده با دستگاه',
          nameEn: 'Standing Calf Raise',
          sets: 4,
          reps: '15-20',
          restSeconds: 45,
          rpe: '8',
          formTip: 'کشش کامل در پایین و انقباض روی پنجه در بالای حرکت.',
        },
      ],
    },
    {
      dayName: 'چهارشنبه',
      dayIndex: 4,
      focus: 'سرشانه، کول و شکم (Shoulders & Abs)',
      isRestDay: false,
      estimatedDuration: '55 دقیقه',
      intensity: 'متوسط به بالا',
      exercises: [
        {
          id: 'ex-16',
          nameFa: 'پرس سرشانه با دمبل نشسته',
          nameEn: 'Seated Dumbbell Shoulder Press',
          sets: 4,
          reps: '8-10',
          restSeconds: 90,
          rpe: '8',
          formTip: 'کف دست‌ها زاویه ۴۵ درجه رو به جلو؛ از برخورد محکم دمبل‌ها در بالا خودداری کنید.',
        },
        {
          id: 'ex-17',
          nameFa: 'نشر از جلو با صفحه هالتر',
          nameEn: 'Plate Front Raise',
          sets: 3,
          reps: '12',
          restSeconds: 60,
          rpe: '7',
          formTip: 'بالا آوردن صفحه تا سطح چشم و کنترل کامل در فاز منفی.',
        },
        {
          id: 'ex-18',
          nameFa: 'کول با دمبل یا هالتر اسمیت',
          nameEn: 'Barbell Shrugs',
          sets: 4,
          reps: '12-15',
          restSeconds: 60,
          rpe: '8',
          formTip: 'حرکت تنها بالا و پایین رفتن شانه‌هاست؛ از چرخاندن شانه پرهیز کنید.',
        },
        {
          id: 'ex-19',
          nameFa: 'پلانک شکم ایستا',
          nameEn: 'Standard Plank',
          sets: 3,
          reps: '45-60 ثانیه',
          restSeconds: 60,
          formTip: 'خط صاف از سر تا پاشنه، باسن را منقبض کرده و شکم را به داخل بکشید.',
        },
        {
          id: 'ex-20',
          nameFa: 'کرانچ سیم‌کش روی زانو',
          nameEn: 'Kneeling Cable Crunch',
          sets: 3,
          reps: '15',
          restSeconds: 60,
          rpe: '8',
          formTip: 'ستون فقرات را به شکل C خم کنید تا عضله راست شکمی کامل درگیر شود.',
        },
      ],
    },
    {
      dayName: 'پنج‌شنبه',
      dayIndex: 5,
      focus: 'فول بادی، استقامت و کاردیو HIIT',
      isRestDay: false,
      estimatedDuration: '50 دقیقه',
      intensity: 'شدید و هوازی',
      exercises: [
        {
          id: 'ex-21',
          nameFa: 'کتل‌بل سوئینگ (تاب دادن وزنه)',
          nameEn: 'Kettlebell Swings',
          sets: 4,
          reps: '15-20',
          restSeconds: 60,
          rpe: '8',
          formTip: 'انرژی حرکت از پرتاب لولاگونه باسن تولید می‌شود، نه بلند کردن با دست‌ها.',
        },
        {
          id: 'ex-22',
          nameFa: 'شنا سوئدی استاندارد',
          nameEn: 'Standard Push-Ups',
          sets: 3,
          reps: '15-20',
          restSeconds: 60,
          rpe: '8',
          formTip: 'بدن کاملاً مستقیم و عمق تا فاصله ۵ سانتی‌متری از سطح زمین.',
        },
        {
          id: 'ex-23',
          nameFa: 'لانج معکوس متناوب با دمبل',
          nameEn: 'Dumbbell Reverse Lunges',
          sets: 3,
          reps: '12 هر پا',
          restSeconds: 60,
          rpe: '8',
          formTip: 'زانوی جلو زاویه ۹۰ درجه داشته باشد و زانوی عقب نزدیک زمین متوقف شود.',
        },
        {
          id: 'ex-24',
          nameFa: 'اینتروال تاباتا با طناب ورزشی یا برپی',
          nameEn: 'Tabata Jump Rope / Burpees',
          sets: 8,
          reps: '۲۰ ثانیه کار / ۱۰ ثانیه استراحت',
          restSeconds: 10,
          formTip: 'از تب تایمر KASP Fit برای اجرای پروتکل تاباتا استفاده کنید.',
        },
      ],
    },
    {
      dayName: 'جمعه',
      dayIndex: 6,
      focus: 'استراحت کامل، تغذیه و آماده‌سازی هفته آینده (Full Rest)',
      isRestDay: true,
      estimatedDuration: '—',
      intensity: 'استراحت',
      exercises: [
        {
          id: 'ex-rest-1',
          nameFa: 'خواب کافی ۸ ساعته و هیدراتاسیون',
          nameEn: 'Sleep & Hydration Recovery',
          sets: 1,
          reps: 'حداقل ۸ ساعت',
          restSeconds: 0,
          formTip: 'ترشح هورمون رشد (GH) و بازسازی فیبرهای عضلانی در خواب عمیق اتفاق می‌افتد.',
        },
        {
          id: 'ex-rest-2',
          nameFa: 'آماده‌سازی وعده‌های غذایی غنی از پروتئین',
          nameEn: 'Meal Prep & Nutrition',
          sets: 1,
          reps: '۳ تا ۵ وعده مغذی',
          restSeconds: 0,
          formTip: 'تأمین آمینواسیدهای ضروری برای جبران تمرینات پرفشار هفته.',
        },
      ],
    },
  ],
};
