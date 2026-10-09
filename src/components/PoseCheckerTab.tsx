import React, { useState, useRef, useEffect } from 'react';
import { PoseAnalysisResult } from '../types/fitness';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ShieldAlert,
  Play,
  RotateCcw,
  Zap,
  Layers,
  ArrowRight,
  Eye,
  Info,
  FileVideo,
  Image as ImageIcon,
  Check,
  X,
  Target,
} from 'lucide-react';

interface PoseCheckerTabProps {
  initialExerciseName?: string;
  onLaunchTimer?: () => void;
}

export const PoseCheckerTab: React.FC<PoseCheckerTabProps> = ({
  initialExerciseName = 'اسکات با هالتر (Barbell Squat)',
  onLaunchTimer,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string>(initialExerciseName);
  const [userNotes, setUserNotes] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<PoseAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSkeletonOverlay, setShowSkeletonOverlay] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Common exercise options
  const exercisePresets = [
    'اسکات با هالتر (Barbell Squat)',
    'ددلیفت کلاسیک (Conventional Deadlift)',
    'شنا سوئدی (Standard Push-Up)',
    'پلانک ایستا (Plank)',
    'پرس سرشانه با دمبل (Shoulder Press)',
    'لانج رو به جلو (Forward Lunge)',
    'زیربغل دمبل خم (Bent-Over Row)',
  ];

  // Sample pre-generated photos for instant 1-click test
  const samplePhotos = [
    {
      title: 'اسکات استاندارد',
      path: '/src/assets/images/sample_squat_pose_1791489389604.jpg',
      exercise: 'اسکات با هالتر (Barbell Squat)',
    },
    {
      title: 'ددلیفت قدرتی',
      path: '/src/assets/images/sample_deadlift_pose_1791489399545.jpg',
      exercise: 'ددلیفت کلاسیک (Conventional Deadlift)',
    },
    {
      title: 'شنا سوئدی و پلانک',
      path: '/src/assets/images/sample_pushup_pose_1791489408167.jpg',
      exercise: 'شنا سوئدی (Standard Push-Up)',
    },
  ];

  // Stop camera stream safely
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start live webcam feed (supports laptop & mobile front/back camera)
  const startCamera = async () => {
    setErrorMessage(null);
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setImagePreview(null);
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setErrorMessage('دسترسی به دوربین برقرار نشد. لطفاً مجوز دسترسی به دوربین را در مرورگر فعال کنید یا از فرم آپلود/Drag & Drop استفاده فرمایید.');
    }
  };

  // Capture still photo from live video feed
  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setImagePreview(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
    }
  };

  // Process File (Photo or Video keyframe) to Base64
  const processSelectedFile = (file: File) => {
    setErrorMessage(null);
    stopCamera();

    if (file.type.startsWith('video/')) {
      // For video file, extract first keyframe
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onloadeddata = () => {
        video.currentTime = 0.5; // grab frame at 0.5s
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setImagePreview(dataUrl);
          setMimeType('image/jpeg');
          URL.revokeObjectURL(objectUrl);
        }
      };
    } else {
      // Image file
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setMimeType(file.type || 'image/jpeg');
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Load sample demo photo
  const loadSamplePhoto = async (sample: (typeof samplePhotos)[0]) => {
    stopCamera();
    setSelectedExercise(sample.exercise);
    setImagePreview(sample.path);
    setMimeType('image/jpeg');
    setAnalysisResult(null);
  };

  // Call Gemini Multimodal AI via server
  const runAiPoseAnalysis = async () => {
    if (!imagePreview) {
      setErrorMessage('لطفاً ابتدا تصویری آپلود کنید یا با دوربین ثبت نمایید.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let base64Data = imagePreview;

      // If it's a relative asset URL, convert to base64
      if (imagePreview.startsWith('/src/assets/images/')) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/ai/analyze-pose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType,
          exerciseName: selectedExercise,
          notes: userNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Normalize accuracy score if returned under score or accuracyScore
        const normalizedScore = data.data.accuracyScore ?? data.data.score ?? 80;
        setAnalysisResult({
          ...data.data,
          accuracyScore: normalizedScore,
        });
      } else {
        throw new Error(data.error || 'خطا در تحلیل فرم حرکت توسط هوش مصنوعی');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('خطا در پردازش تصویر توسط هوش مصنوعی بینایی ماشین. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const accuracy = analysisResult ? analysisResult.accuracyScore : 0;

  const getScoreColorClasses = (score: number) => {
    if (score >= 80) {
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        border: 'border-emerald-500/40',
      };
    }
    if (score >= 60) {
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        border: 'border-amber-500/40',
      };
    }
    return {
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      border: 'border-rose-500/40',
    };
  };

  const scoreColors = getScoreColorClasses(accuracy);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-1">
          <Camera className="w-4 h-4" />
          <span>بینایی ماشین و پردازش تصویر هوش مصنوعی (AI Vision)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          آنالیز هوشمند فرم حرکت، زاویه مفاصل و ستون فقرات
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          تصویر یا ویدیوی خود حین تمرین را از طریق Drag & Drop، بارگذاری فایل یا دوربین فعال کنید تا مدل هوش مصنوعی بینایی Gemini نام حرکت، وضعیت زوایا و ستون فقرات، خطاهای حرکتی و نحوه درست اجرا را با محاسبه درصد صحت (Accuracy Score) بررسی کند.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Drag & Drop Upload + Camera Feed + Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Exercise Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              حرکت ورزشی مورد نظر برای پایش (اختیاری):
            </label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              {exercisePresets.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Form + Upload / Camera Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all relative overflow-hidden ${
              isDragging
                ? 'border-sky-400 bg-sky-950/20 scale-[1.01]'
                : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
            }`}
          >
            {isCameraActive ? (
              /* Live Camera Stream */
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500 text-white animate-pulse">
                    LIVE CAMERA ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhotoFromCamera}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/25 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>ثبت عکس و آنالیز فرم</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              /* Image / Keyframe Preview */
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 group">
                  <img
                    src={imagePreview}
                    alt="فرم حرکت ورزشی"
                    className="w-full h-full object-contain"
                  />

                  {/* Skeleton Overlay */}
                  {showSkeletonOverlay && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <svg
                        className="w-full h-full opacity-65"
                        viewBox="0 0 400 300"
                        preserveAspectRatio="none"
                      >
                        <circle
                          cx="200"
                          cy="130"
                          r="55"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                          fill="none"
                        />
                        <line
                          x1="200"
                          y1="40"
                          x2="200"
                          y2="260"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <circle cx="200" cy="80" r="4" fill="#10b981" />
                        <circle cx="185" cy="140" r="4" fill="#38bdf8" />
                        <circle cx="175" cy="215" r="4" fill="#f59e0b" />
                      </svg>
                      <span className="absolute top-3 right-3 text-[10px] font-mono bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded-md border border-slate-800">
                        SKELETON GRID: ON
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowSkeletonOverlay(!showSkeletonOverlay)}
                    className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-300 text-[11px] border border-slate-800 backdrop-blur-sm"
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>{showSkeletonOverlay ? 'مخفی‌سازی خطوط' : 'نمایش زوایا'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    تعویض تصویر
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>گرفتن با دوربین</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop Prompt State */
              <div className="space-y-4 py-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    تصویر یا ویدیوی اجرای حرکت را اینجا بکشید و رها کنید (Drag & Drop)
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    پشتیبانی از فرمت‌های PNG، JPG، MP4 یا استفاده از وبکم لپ‌تاپ و دوربین موبایل
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/20 min-h-[44px] w-full sm:w-auto touch-manipulation"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>انتخاب فایل عکس/ویدیو</span>
                  </button>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition-all min-h-[44px] w-full sm:w-auto touch-manipulation"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>فعال‌سازی دوربین زنده</span>
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Quick Demo Samples */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 block font-medium">
              یا از نمونه‌های تصویری استاندارد آماده برای تست سریع استفاده کنید:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {samplePhotos.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSamplePhoto(s)}
                  className="p-2.5 sm:p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-xs sm:text-[11px] text-slate-300 text-center transition-all truncate active:scale-95 min-h-[44px] flex items-center justify-center"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Run Analysis Trigger Button */}
          {imagePreview && (
            <button
              type="button"
              onClick={runAiPoseAnalysis}
              disabled={isAnalyzing}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 active:scale-98 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25 disabled:opacity-50 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>در حال ارسال Base64 و آنالیز بیومکانیکی با Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>شروع آنالیز فرم با هوش مصنوعی بینایی ماشین</span>
                </>
              )}
            </button>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: Visual & Textual Feedback Card with Accuracy Score Bar (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {analysisResult ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              {/* Header: Detected Exercise & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-0.5">
                    ۱. اسم حرکت ورزشی تشخیص داده‌شده:
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {analysisResult.detectedExercise}
                  </h3>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-xl border ${scoreColors.badge} self-start sm:self-center`}
                >
                  {analysisResult.overallStatus || analysisResult.statusLevel}
                </span>
              </div>

              {/* ACCURACY SCORE PROGRESS BAR (نوار درصد صحت اجرا) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Target className={`w-4 h-4 ${scoreColors.text}`} />
                    <span>نوار درصد صحت اجرا (Accuracy Score):</span>
                  </span>
                  <span className={`text-xl font-black tabular-nums font-sans ${scoreColors.text}`}>
                    {accuracy}٪
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${scoreColors.bg}`}
                    style={{ width: `${Math.min(100, Math.max(5, accuracy))}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 tabular-nums">
                  <span>۰٪ (اشتباه)</span>
                  <span>۶۰٪ (نیازمند اصلاح)</span>
                  <span>۱۰۰٪ (صحیح و استاندارد)</span>
                </div>
              </div>

              {/* 2. Joint, Spine, & Angles Status (وضعیت زوایا، ستون فقرات و مفاصل) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>۲. وضعیت زوایا، ستون فقرات و مفاصل (درست یا اشتباه):</span>
                </span>

                {analysisResult.jointSpineStatus && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    {analysisResult.jointSpineStatus}
                  </div>
                )}

                {/* Joint Angles Breakdown */}
                {analysisResult.jointAngles && analysisResult.jointAngles.length > 0 && (
                  <div className="space-y-1.5">
                    {analysisResult.jointAngles.map((ja, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{ja.joint}:</span>
                          <span className="text-sky-300 font-mono tabular-nums">{ja.angle}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">{ja.assessment}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Errors vs Correct Execution (خطاهای حرکتی و نحوه درست اجرا) */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>۳. خطاهای حرکتی مشخص‌شده و نحوه درست اجرا:</span>
                </span>

                {/* Mistakes */}
                {analysisResult.mistakes && analysisResult.mistakes.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      خطاهای بیومکانیکی مشخص‌شده:
                    </span>
                    <ul className="space-y-1 text-xs text-amber-200/90 leading-relaxed">
                      {analysisResult.mistakes.map((mst, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{mst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Corrective Steps */}
                {analysisResult.correctiveSteps && analysisResult.correctiveSteps.length > 0 && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      نحوه درست اجرا و راهکار اصلاحی:
                    </span>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs text-slate-200 leading-relaxed">
                      {analysisResult.correctiveSteps.map((step, idx) => (
                        <li key={idx} className="marker:text-emerald-400">
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Coach Pro Tip */}
              {analysisResult.coachProTip && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sky-300 block mb-0.5">نکته کلیدی مربی:</strong>
                    <span>{analysisResult.coachProTip}</span>
                  </div>
                </div>
              )}

              {/* Quick Launch Workout Timer */}
              {onLaunchTimer && (
                <button
                  type="button"
                  onClick={onLaunchTimer}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <span>تمرین اصلاح‌شده با تایمر ورزشی KASP Fit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Empty State Guidance */
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 text-sky-400 flex items-center justify-center mx-auto">
                <Target className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white mb-1">
                  سامانه سنجش بیومکانیک و بینایی ماشین (AI Vision)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  تصویر یا ویدیوی اجرای حرکت را آپلود کنید تا هوش مصنوعی بلافاصله نام حرکت، زوایا و ستون فقرات و نوار درصد صحت اجرا (Accuracy Score) را تحلیل کند.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-right max-w-sm mx-auto text-xs text-slate-400 pt-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تشخیص خودکار نام حرکت</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>محاسبه درصد صحت (Accuracy)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>بررسی زوایای مفاصل و ستون فقرات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>شناسایی خطا و دستورالعمل اصلاح</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
