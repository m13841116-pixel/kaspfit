import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'KASP Fit API' });
});

// Endpoint: AI Workout Plan Generator
app.post('/api/ai/generate-workout-plan', async (req: Request, res: Response) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      fitnessLevel,
      goal,
      injuryHistory,
      injuryDetails,
      equipment = 'باشگاه بدنسازی کامل',
      daysPerWeek = 4,
      specialPreferences = '',
    } = req.body;

    const prompt = `نقش شما: مربی ارشد تربیت بدنی و متخصص بیومکانیک ورزشی و تغذیه در پلتفرم KASP Fit.
لحن شما: حرفه‌ای، کاملاً علمی، انگیزه‌بخش و دقیق به زبان فارسی.

وظیفه ۱ (تولید برنامه تمرینی هفتگی):
بر اساس مشخصات فردی و فیزیولوژیک زیر، یک برنامه تمرینی هفتگی کاملاً علمی، بیومکانیکی، بی‌خطر و شخصی‌سازی‌شده به فرمت معتبر JSON تولید کنید.

داده‌های ورودی ورزشکار:
- سن: ${age || 26} سال
- جنسیت: ${gender === 'female' ? 'خانم' : 'آقا'}
- قد: ${height || 178} سانتی‌متر
- وزن: ${weight || 75} کیلوگرم
- سطح آمادگی: ${fitnessLevel || 'متوسط'}
- هدف اصلی: ${goal || 'عضله‌سازی و هایپرتروفی'}
- تجهیزات در دسترس: ${equipment}
- تعداد روزهای تمرینی هدف در هفته: ${daysPerWeek} روز (بقیه روزها استراحت فعال / ریکاوری باشد)
- سابقه آسیب‌دیدگی: ${injuryHistory || 'ندارد'} ${injuryDetails ? `(توضیحات تکمیلی: ${injuryDetails})` : ''}
- اولویت‌ها: ${specialPreferences || 'تأکید بر فرم صحیح و پیشرفت تدریجی بار (Progressive Overload)'}

الزامات خروجی:
۱. شامل تمام روزهای هفته از شنبه تا جمعه (۷ روز).
۲. حرکات ورزشی با نام فارسی استاندارد و نام انگلیسی داخل پرانتز.
۳. تعداد ست‌ها و محدوده دقیق تکرارها.
۴. زمان استراحت بین ست‌ها (به ثانیه).
۵. نکات ایمنی بیومکانیکی مخصوص کاربر، به ویژه در نظر گرفتن سابقه آسیب‌دیدگی ورزشکار و حفاظت از مفاصل.
۶. لحن توضیحات باید حرفه‌ای و انگیزه‌بخش باشد.

خروجی باید منحصراً به فرمت JSON معتبر با ساختار زیر باشد:
{
  "planTitle": "برنامه تخصصی هایپرتروفی و ارتقای عملکرد جسمانی KASP Fit",
  "overview": "توضیحات استراتژی علمی برنامه، توصیه‌های تغذیه و متد اضافه بار تدریجی با لحن مربیگری انگیزه‌بخش",
  "recommendedWarmup": "پروتکل گرم‌کردن عمومی و اختصاصی پیش از تمرین",
  "recommendedCooldown": "پروتکل سرد کردن و کاهش ضربان قلب و بازتوانی",
  "days": [
    {
      "dayName": "شنبه",
      "focus": "سینه و پشت‌بازو (Chest & Triceps)",
      "isRestDay": false,
      "estimatedDuration": "60 دقیقه",
      "intensity": "متوسط به بالا",
      "exercises": [
        {
          "nameFa": "پرس سینه با هالتر روی نیمکت صاف",
          "nameEn": "Barbell Bench Press",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "rpe": "8",
          "formTip": "نکته ایمنی بیومکانیکی: جمع کردن کتف‌ها به عقب و پایین، جلوگیری از فلکشن مچ و حفظ مسیر طبیعی آرنج‌ها"
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'خطا در ارتباط با سرور هوش مصنوعی',
    });
  }
});

// Endpoint: AI Pose / Form Checker
app.post('/api/ai/analyze-pose', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', exerciseName, notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'تصویری جهت آنالیز ارسال نشده است.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `شما یک متخصص ارشد پردازش تصویر، بینایی ماشین و بیومکانیک ورزشی در پلتفرم KASP Fit هستید.
تصویر زیر را به عنوان یک متخصص بیومکانیک ورزشی آنالیز کن:
۱. اسم حرکت ورزشی چیست؟
۲. وضعیت زوایا، ستون فقرات و مفاصل کاربر درست است یا اشتباه؟
۳. در صورت وجود خطا، خطای حرکتی را مشخص کن و نحوه درست اجرا را توضیح بده.

خروجی باید منحصراً در قالب ساختار JSON زیر به زبان فارسی باشد:
{
  "detectedExercise": "اسم دقیق حرکت ورزشی به فارسی (به همراه نام انگلیسی در پرانتز)",
  "accuracyScore": 85,
  "overallStatus": "صحیح / نیازمند اصلاح / اشتباه",
  "statusLevel": "خوب با اصلاحات جزئی",
  "statusColor": "emerald",
  "jointSpineStatus": "ارزیابی جامع وضعیت زوایا، ستون فقرات و مفاصل (تشریح درست یا اشتباه بودن راستاها)",
  "jointAngles": [
    { "joint": "مفصل زانو و ران", "angle": "زاویه تخمینی", "assessment": "درست / اشتباه - تحلیل بیومکانیکی" },
    { "joint": "ستون فقرات کمری و گردن", "angle": "شیب تنه", "assessment": "درست / اشتباه - انحنای خنثی" }
  ],
  "strengths": [
    "نقاط قوت در اجرای حرکت"
  ],
  "mistakes": [
    "خطای حرکتی مشخص‌شده (مثلاً خم شدن یا راندینگ کمر در اسکوات، والگوس زانو و...)"
  ],
  "correctiveSteps": [
    "دستورالعمل نحوه درست اجرا به صورت گام‌به‌گام و علمی"
  ],
  "jointStressWarning": "هشدار آسیب‌دیدگی در صورت ادامه اجرای اشتباه",
  "coachProTip": "نکته کلیدی و تشویقی برای اجرای ۱۰۰٪ صحیح"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const responseText = response.text || '{}';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error analyzing pose:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'خطا در پردازش تصویر توسط هوش مصنوعی',
    });
  }
});

// Endpoint: AI Fitness Assessment Insights
app.post('/api/ai/fitness-insights', async (req: Request, res: Response) => {
  try {
    const {
      age,
      gender,
      height,
      weight,
      fitnessLevel,
      goal,
      bmi,
      bmr,
      tdee,
      bodyFat,
      idealWeight,
      injuryHistory,
    } = req.body;

    const prompt = `نقش شما: پزشک متخصص تغذیه ورزشی، فیزیولوژیست و کارشناس ارشد بیومکانیک در تیم KASP Fit.
بر اساس مشخصات فردی، شاخص‌های بیومتریک و سابقه آسیب‌دیدگی زیر، یک تحلیل تخصصی جامع فیزیولوژی و تغذیه با فرمت JSON تولید کنید:

مشخصات ورزشکار:
- سن: ${age} سال | جنسیت: ${gender === 'female' ? 'خانم' : 'آقا'} | قد: ${height} سانتی‌متر | وزن: ${weight} کیلوگرم
- شاخص توده بدنی (BMI): ${bmi}
- متابولیسم پایه (BMR): ${bmr} کیلوکالری
- مصرف انرژی روزانه (TDEE): ${tdee} کیلوکالری
- درصد چربی تخمینی: ${bodyFat}%
- وزن ایده‌آل: ${idealWeight} کیلوگرم
- هدف تمرینی: ${goal}
- سطح آمادگی: ${fitnessLevel}
- سابقه آسیب‌دیدگی و محدودیت‌ها: ${injuryHistory || 'بدون آسیب'}

الزامات خروجی:
۱. تحلیل دقیق و علمی وضعیت متابولیک، تیپ بدنی و اهداف.
۲. کالری هدف روزانه و تفکیک دقیق درشت‌مغذی‌ها (پروتئین، کربوهیدرات، چربی خالص به گرم) بر مبنای وزن و هدف.
۳. استراتژی اختصاصی کاردیو و وزنه (سیستم تمرینی، حجم و شدت مناسب).
۴. مکمل‌های ورزشی مجاز و علمی با دوز ایمن (Safe Sports Supplements)، زمان‌بندی مصرف (Timing) و مزیت فیزیولوژیک.
۵. هشدارها و احتیاط‌های بیومکانیکی مستقیم متناسب با سابقه آسیب‌دیدگی ثبت‌شده (حرکات ممنوعه یا احتیاطی).
۶. توصیه‌های کلیدی لایف‌استایل و ریکاوری.

خروجی باید منحصراً در قالب JSON معتبر زیر باشد:
{
  "summary": "تحلیل تخصصی وضعیت متابولیک و فیزیولوژیک ورزشکار در ۳ الی ۴ جمله منسجم و علمی",
  "caloricTarget": 2350,
  "macroSplit": {
    "proteinGrams": 155,
    "carbsGrams": 250,
    "fatsGrams": 65
  },
  "waterTargetLiters": 3.2,
  "weightTrainingStrategy": "استراتژی اختصاصی تمرین با وزنه (تعداد جلسات، دامنه تکرار و سیستم اضافه بار)",
  "cardioRecommendation": "استراتژی اختصاصی کاردیو (نوع هوازی، ضربان هدف و فرکانس هفتگی)",
  "supplements": [
    {
      "name": "کراتین مونوهیدرات (Creatine Monohydrate)",
      "dosage": "۵ گرم در روز",
      "timing": "پس از تمرین یا صبح‌ها همراه با کربوهیدرات زودجذب",
      "benefit": "افزایش ذخایر فسفوکراتین عضلانی و ارتقای توان بی هوازی"
    },
    {
      "name": "پروتئین وی ایزوله / کنسانتره (Whey Protein)",
      "dosage": "۲۵ الی ۳۰ گرم (۱ اسکوپ)",
      "timing": "بلافاصله پس از تمرین یا در وعده صبحانه",
      "benefit": "تسریع سنتز پروتئین عضلانی (MPS) و ریکاوری فیبرهای آسیب‌دیده"
    },
    {
      "name": "امگا ۳ (Omega-3 Fish Oil)",
      "dosage": "۱۰۰۰ الی ۲۰۰۰ میلی‌گرم EPA/DHA",
      "timing": "همراه با وعده غذایی اصلی",
      "benefit": "کاهش التهابات سیستمیک عضلانی و محافظت از غضروف مفاصل"
    }
  ],
  "injuryPrecautions": [
    "دستورالعمل و هشدار بیومکانیکی اول مربوط به سابقه آسیب‌دیدگی",
    "حرکات ممنوعه یا جایگزین‌های ایمن برای مفاصل در معرض خطر"
  ],
  "keyAdvice": [
    "توصیه اول در خصوص تعادل هورمونی و رژیم غذایی",
    "توصیه دوم در خصوص زمان‌بندی خواب و ترشح هورمون رشد",
    "توصیه سوم در خصوص پیشرفت مداوم و ثبات در تمرین"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const responseText = response.text || '{}';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating fitness insights:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'خطا در ارزیابی شاخص‌ها',
    });
  }
});

// Setup Vite middleware in dev or static serve in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KASP Fit Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
