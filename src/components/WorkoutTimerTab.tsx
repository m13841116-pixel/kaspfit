import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bell,
  Check,
  Plus,
  Minus,
  Timer,
  Zap,
  Activity,
  Award,
  ChevronRight,
  Flame,
  Sliders,
  SlidersHorizontal,
  Smartphone,
  Eye,
  Radio,
} from 'lucide-react';
import {
  playCountdownTick,
  playStartWorkBeep,
  playRestBeep,
  playFinishFanfare,
  playSportsWhistle,
  sendWorkoutNotification,
} from '../utils/audioSynthesizer';

type TimerMode = 'rest' | 'tabata' | 'stopwatch';
type HiitPhase = 'prepare' | 'work' | 'rest' | 'cycle_rest' | 'complete';

interface WorkoutTimerTabProps {
  initialRestSeconds?: number;
}

export const WorkoutTimerTab: React.FC<WorkoutTimerTabProps> = ({ initialRestSeconds = 60 }) => {
  const [mode, setMode] = useState<TimerMode>('rest');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // ==========================================
  // 1. REST TIMER STATE (Background & Drift Safe)
  // ==========================================
  const [restDuration, setRestDuration] = useState<number>(initialRestSeconds);
  const [restTimeLeft, setRestTimeLeft] = useState<number>(initialRestSeconds);
  const [isRestRunning, setIsRestRunning] = useState<boolean>(false);
  const [customInputSeconds, setCustomInputSeconds] = useState<string>('60');
  const [isManualInputOpen, setIsManualInputOpen] = useState<boolean>(false);

  // Absolute end timestamp ref for background drift correction
  const restTargetEndRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Update restDuration if passed as prop
  useEffect(() => {
    if (initialRestSeconds && initialRestSeconds !== restDuration) {
      setRestDuration(initialRestSeconds);
      setRestTimeLeft(initialRestSeconds);
      setCustomInputSeconds(initialRestSeconds.toString());
      setIsRestRunning(false);
      restTargetEndRef.current = null;
    }
  }, [initialRestSeconds]);

  // Request Screen Wake Lock (prevents display sleep during exercise)
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {
      // Wake lock request failed or unsupported - non-critical
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
  };

  // Completion trigger for Rest Timer
  const handleRestComplete = () => {
    setIsRestRunning(false);
    restTargetEndRef.current = null;
    releaseWakeLock();

    // 1. Play sports referee whistle sound effect
    if (soundEnabled) {
      playSportsWhistle();
    }

    // 2. Send browser notification with exact required text
    sendWorkoutNotification(
      'زمان استراحت تمام شد! ست بعدی را شروع کنید.',
      'زمان استراحت شما تمام شد! ست بعدی را با انرژی و فرم صحیح شروع کنید. 🔥'
    );
  };

  // Rest Timer Engine: Drift-corrected with Date.now() timestamp
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRestRunning && restTargetEndRef.current) {
      requestWakeLock();

      interval = setInterval(() => {
        const now = Date.now();
        const target = restTargetEndRef.current;
        if (!target) return;

        const remaining = Math.max(0, Math.ceil((target - now) / 1000));
        setRestTimeLeft(remaining);

        // Warning countdown ticks on 3, 2, 1
        if (soundEnabled && remaining <= 3 && remaining > 0) {
          playCountdownTick();
        }

        if (remaining <= 0) {
          handleRestComplete();
        }
      }, 350); // fast polling avoids second skip
    } else {
      releaseWakeLock();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRestRunning, soundEnabled]);

  // Page Visibility API listener: syncs instantly when user switches tabs or locks/unlocks device
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRestRunning && restTargetEndRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((restTargetEndRef.current - now) / 1000));
        setRestTimeLeft(remaining);
        if (remaining <= 0) {
          handleRestComplete();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRestRunning, soundEnabled]);

  const startRestTimer = (seconds: number) => {
    setRestDuration(seconds);
    setRestTimeLeft(seconds);
    setCustomInputSeconds(seconds.toString());
    restTargetEndRef.current = Date.now() + seconds * 1000;
    setIsRestRunning(true);
  };

  const toggleRestTimer = () => {
    if (isRestRunning) {
      // Pause
      setIsRestRunning(false);
      restTargetEndRef.current = null;
      releaseWakeLock();
    } else {
      // Start or Resume
      const secs = restTimeLeft > 0 ? restTimeLeft : restDuration;
      setRestTimeLeft(secs);
      restTargetEndRef.current = Date.now() + secs * 1000;
      setIsRestRunning(true);
    }
  };

  const resetRestTimer = () => {
    setIsRestRunning(false);
    restTargetEndRef.current = null;
    setRestTimeLeft(restDuration);
    releaseWakeLock();
  };

  const addTimeRestTimer = (secs: number) => {
    const newRemaining = Math.max(0, restTimeLeft + secs);
    setRestTimeLeft(newRemaining);
    setRestDuration((prev) => Math.max(5, prev + secs));
    if (isRestRunning) {
      restTargetEndRef.current = Date.now() + newRemaining * 1000;
    }
  };

  const applyCustomManualSeconds = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return;
    const clamped = Math.max(5, Math.min(3600, secs));
    startRestTimer(clamped);
    setIsManualInputOpen(false);
  };

  // ==========================================
  // 2. TABATA / HIIT TIMER STATE (Drift Safe)
  // ==========================================
  const [workTime, setWorkTime] = useState<number>(20); // seconds
  const [restIntervalTime, setRestIntervalTime] = useState<number>(10); // seconds
  const [totalRounds, setTotalRounds] = useState<number>(8); // rounds per cycle
  const [totalCycles, setTotalCycles] = useState<number>(1);
  const [cycleRestTime, setCycleRestTime] = useState<number>(60); // rest between cycles

  // Running HIIT state
  const [isHiitRunning, setIsHiitRunning] = useState<boolean>(false);
  const [hiitPhase, setHiitPhase] = useState<HiitPhase>('prepare');
  const [hiitTimeLeft, setHiitTimeLeft] = useState<number>(5); // 5 sec prepare
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentCycle, setCurrentCycle] = useState<number>(1);

  const hiitTargetEndRef = useRef<number | null>(null);

  // HIIT Engine with absolute timestamps
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isHiitRunning && hiitPhase !== 'complete' && hiitTargetEndRef.current) {
      requestWakeLock();

      interval = setInterval(() => {
        const now = Date.now();
        const target = hiitTargetEndRef.current;
        if (!target) return;

        const remaining = Math.max(0, Math.ceil((target - now) / 1000));
        setHiitTimeLeft(remaining);

        if (soundEnabled && remaining <= 3 && remaining > 0) {
          playCountdownTick();
        }

        if (remaining <= 0) {
          // Transition phases
          if (hiitPhase === 'prepare') {
            if (soundEnabled) playStartWorkBeep();
            setHiitPhase('work');
            hiitTargetEndRef.current = Date.now() + workTime * 1000;
            setHiitTimeLeft(workTime);
          } else if (hiitPhase === 'work') {
            if (soundEnabled) playRestBeep();
            if (currentRound < totalRounds) {
              setHiitPhase('rest');
              hiitTargetEndRef.current = Date.now() + restIntervalTime * 1000;
              setHiitTimeLeft(restIntervalTime);
            } else {
              if (currentCycle < totalCycles) {
                setHiitPhase('cycle_rest');
                hiitTargetEndRef.current = Date.now() + cycleRestTime * 1000;
                setHiitTimeLeft(cycleRestTime);
              } else {
                // ALL FINISHED
                if (soundEnabled) playFinishFanfare();
                sendWorkoutNotification(
                  'تمرین تاباتا تکمیل شد! 🏆',
                  'آفرین قهرمان! تمام راندها و دورهای پروتکل اینتروال با موفقیت انجام شدند.'
                );
                setHiitPhase('complete');
                setIsHiitRunning(false);
                hiitTargetEndRef.current = null;
                releaseWakeLock();
              }
            }
          } else if (hiitPhase === 'rest') {
            if (soundEnabled) playStartWorkBeep();
            setCurrentRound((r) => r + 1);
            setHiitPhase('work');
            hiitTargetEndRef.current = Date.now() + workTime * 1000;
            setHiitTimeLeft(workTime);
          } else if (hiitPhase === 'cycle_rest') {
            if (soundEnabled) playStartWorkBeep();
            setCurrentCycle((c) => c + 1);
            setCurrentRound(1);
            setHiitPhase('work');
            hiitTargetEndRef.current = Date.now() + workTime * 1000;
            setHiitTimeLeft(workTime);
          }
        }
      }, 350);
    } else {
      releaseWakeLock();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isHiitRunning,
    hiitPhase,
    currentRound,
    currentCycle,
    workTime,
    restIntervalTime,
    totalRounds,
    totalCycles,
    cycleRestTime,
    soundEnabled,
  ]);

  const startHiit = () => {
    setHiitPhase('prepare');
    setHiitTimeLeft(5);
    setCurrentRound(1);
    setCurrentCycle(1);
    hiitTargetEndRef.current = Date.now() + 5 * 1000;
    setIsHiitRunning(true);
  };

  const toggleHiit = () => {
    if (hiitPhase === 'complete') {
      startHiit();
    } else if (isHiitRunning) {
      setIsHiitRunning(false);
      hiitTargetEndRef.current = null;
      releaseWakeLock();
    } else {
      const secs = hiitTimeLeft > 0 ? hiitTimeLeft : 5;
      hiitTargetEndRef.current = Date.now() + secs * 1000;
      setIsHiitRunning(true);
    }
  };

  const resetHiit = () => {
    setIsHiitRunning(false);
    hiitTargetEndRef.current = null;
    setHiitPhase('prepare');
    setHiitTimeLeft(5);
    setCurrentRound(1);
    setCurrentCycle(1);
    releaseWakeLock();
  };

  // ==========================================
  // 3. STOPWATCH STATE
  // ==========================================
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (isStopwatchRunning) {
        const delta = now - lastTime;
        setStopwatchMs((prev) => prev + delta);
      }
      lastTime = now;
      if (isStopwatchRunning) {
        animFrame = requestAnimationFrame(loop);
      }
    };

    if (isStopwatchRunning) {
      lastTime = performance.now();
      animFrame = requestAnimationFrame(loop);
    }
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [isStopwatchRunning]);

  const recordLap = () => {
    setLaps((prev) => [stopwatchMs, ...prev]);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchMs(0);
    setLaps([]);
  };

  // Request browser push notification permission
  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('سیستم اعلان ورزشی KASP Fit فعال شد', {
          body: 'هنگام اتمام زمان استراحت، پیام "زمان استراحت تمام شد! ست بعدی را شروع کنید." ارسال خواهد شد.',
        });
      }
    }
  };

  // Format MM:SS helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Format Stopwatch MM:SS.SS
  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${hundredths
      .toString()
      .padStart(2, '0')}`;
  };

  // Progress percentage for Rest circular ring
  const restProgress = restDuration > 0 ? (restTimeLeft / restDuration) * 100 : 0;

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Banner & Control Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <Timer className="w-4 h-4" />
            <span>زمان‌سنج حرفه‌ای ورزشی با عملکرد در پس‌زمینه (PWA Background Timer)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            تایمر استراحت بین ست‌ها و پروتکل تاباتا / HIIT
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1 text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>پخش پیوسته در پس‌زمینه مرورگر فعال است</span>
            </span>
          </div>
        </div>

        {/* Audio & Notification Toggles */}
        <div className="flex items-center gap-2">
          {/* Notification Permission Button */}
          <button
            type="button"
            onClick={handleRequestNotification}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors min-h-[42px] ${
              notificationPermission === 'granted'
                ? 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="فعال‌سازی سیستم اعلان مرورگر"
          >
            {notificationPermission === 'granted' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">اعلان فعال است</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>دریافت اعلان ست</span>
              </>
            )}
          </button>

          {/* Whistle & Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors min-h-[42px] ${
              soundEnabled
                ? 'bg-slate-950 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'قطع صدای سوت و بوق' : 'وصل صدا'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>سوت داوری روشن</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>بی‌صدا</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setMode('rest')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
            mode === 'rest'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>تایمر استراحت ست‌ها (Rest Timer)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('tabata')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
            mode === 'tabata'
              ? 'bg-orange-500 text-slate-950 shadow-md font-black shadow-orange-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>تاباتا و اینتروال (TABATA / HIIT)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('stopwatch')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
            mode === 'stopwatch'
              ? 'bg-sky-500 text-slate-950 shadow-md font-black shadow-sky-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>کرونومتر رکوردگیری</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. REST TIMER VIEW (Count-down Timer with Presets & Manual)*/}
      {/* ========================================================= */}
      {mode === 'rest' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center shadow-xl space-y-8">
          {/* Circular Animated Digital Countdown Ring */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800"
                strokeWidth="5"
                fill="none"
              />
              {/* Progress dynamic circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`transition-all duration-300 ${
                  restTimeLeft <= 5 && restTimeLeft > 0 ? 'stroke-rose-500 animate-pulse' : 'stroke-emerald-400'
                }`}
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * restProgress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Digital Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                {isRestRunning ? 'در حال استراحت' : restTimeLeft === 0 ? 'زمان تمام شد!' : 'آماده برای استراحت'}
              </span>
              <span className="text-4xl sm:text-6xl font-black text-white tabular-nums tracking-tight font-sans">
                {formatTime(restTimeLeft)}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 mt-2 font-mono tabular-nums">
                کل زمان ست: {restDuration} ثانیه
              </span>
            </div>
          </div>

          {/* Primary Play/Pause/Reset Controls */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <button
              type="button"
              onClick={resetRestTimer}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center transition-transform active:scale-95 shadow-md min-h-[44px] min-w-[44px] touch-manipulation"
              title="بازنشانی تایمر"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={toggleRestTimer}
              className="h-14 sm:h-16 px-7 sm:px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all min-h-[44px] touch-manipulation"
            >
              {isRestRunning ? (
                <>
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
                  <span>توقف موقت</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
                  <span>{restTimeLeft === 0 ? 'شروع مجدد' : 'شروع استراحت'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => addTimeRestTimer(15)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center transition-transform active:scale-95 shadow-md text-xs font-bold min-h-[44px] min-w-[44px] touch-manipulation"
              title="+15 ثانیه"
            >
              +15s
            </button>
          </div>

          {/* REQUIRED PRESETS: 30, 60, 90, 120 ثانیه */}
          <div className="space-y-3">
            <span className="text-xs text-slate-300 block font-bold">
              دکمه‌های پیش‌فرض زمان استراحت بین ست‌ها:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
              {[30, 60, 90, 120].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => startRestTimer(preset)}
                  className={`py-3 px-4 rounded-2xl text-xs font-black border transition-all text-center tabular-nums ${
                    restDuration === preset
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {preset} ثانیه استراحت
                </button>
              ))}
            </div>
          </div>

          {/* MANUAL CUSTOM TIMER SETTINGS (تنظیم تایمر دستی) */}
          <div className="pt-4 border-t border-slate-800/80 max-w-md mx-auto space-y-3">
            <button
              type="button"
              onClick={() => setIsManualInputOpen(!isManualInputOpen)}
              className="flex items-center justify-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-bold mx-auto transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isManualInputOpen ? 'بستن تنظیم دستی' : 'تنظیم زمان دلخواه به صورت دستی'}</span>
            </button>

            {isManualInputOpen && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs text-slate-400 block">
                  زمان دلخواه خود را به ثانیه وارد کنید:
                </span>
                <div className="flex items-center gap-2 justify-center">
                  <input
                    type="number"
                    min={5}
                    max={3600}
                    step={5}
                    value={customInputSeconds}
                    onChange={(e) => setCustomInputSeconds(e.target.value)}
                    className="w-28 text-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold tabular-nums focus:outline-none focus:border-sky-500"
                    placeholder="ثانیه"
                  />
                  <span className="text-xs text-slate-400">ثانیه</span>
                  <button
                    type="button"
                    onClick={() => applyCustomManualSeconds(parseInt(customInputSeconds, 10))}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition-all"
                  >
                    اعمال و شروع
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => addTimeRestTimer(-10)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    -10s
                  </button>
                  <button
                    type="button"
                    onClick={() => addTimeRestTimer(-5)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    -5s
                  </button>
                  <button
                    type="button"
                    onClick={() => addTimeRestTimer(5)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    +5s
                  </button>
                  <button
                    type="button"
                    onClick={() => addTimeRestTimer(10)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    +10s
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TABATA / HIIT TIMER VIEW (Interval Protocol)          */}
      {/* ========================================================= */}
      {mode === 'tabata' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center shadow-xl space-y-6">
            {/* Phase Indicator & Round Numbers */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 max-w-md mx-auto text-xs">
              <span className="text-slate-400 font-bold">
                راند <strong className="text-white tabular-nums">{currentRound}</strong> از {totalRounds}
              </span>
              <span className="text-slate-400 font-bold">
                دور <strong className="text-white tabular-nums">{currentCycle}</strong> از {totalCycles}
              </span>
            </div>

            {/* Giant Dynamic HIIT Status Screen */}
            <div
              className={`p-8 sm:p-12 rounded-3xl border transition-all max-w-lg mx-auto ${
                hiitPhase === 'prepare'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                  : hiitPhase === 'work'
                  ? 'bg-rose-950/25 border-rose-500/50 text-rose-400 ring-2 ring-rose-500/20 animate-pulse'
                  : hiitPhase === 'rest'
                  ? 'bg-sky-950/25 border-sky-500/40 text-sky-300'
                  : hiitPhase === 'cycle_rest'
                  ? 'bg-purple-950/25 border-purple-500/40 text-purple-300'
                  : 'bg-emerald-950/25 border-emerald-500/50 text-emerald-300'
              }`}
            >
              <div className="text-sm font-black uppercase tracking-widest mb-2">
                {hiitPhase === 'prepare' && 'آماده‌باش (Get Ready)'}
                {hiitPhase === 'work' && '🔥 فعالیت حداکثری (WORK) 🔥'}
                {hiitPhase === 'rest' && '💤 استراحت سریع (REST)'}
                {hiitPhase === 'cycle_rest' && 'استراحت بین دورها (Cycle Rest)'}
                {hiitPhase === 'complete' && '🏆 تمرین تکمیل شد! 🏆'}
              </div>

              <div className="text-7xl sm:text-8xl font-black text-white tabular-nums tracking-tighter my-2 font-sans">
                {hiitPhase === 'complete' ? 'FINISH' : hiitTimeLeft}
              </div>

              <div className="text-xs text-slate-400 mt-2">
                {hiitPhase === 'work' && 'با حداکثر توان کالری بسوزانید!'}
                {hiitPhase === 'rest' && 'نفس عمیق شکمی بکشید و آماده راند بعد شوید.'}
                {hiitPhase === 'prepare' && 'شروع تمرین در ۵ ثانیه...'}
                {hiitPhase === 'complete' && 'خسته نباشید! ریکاوری و آب‌رسانی را فراموش نکنید.'}
              </div>
            </div>

            {/* HIIT Master Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={resetHiit}
                className="w-13 h-13 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center transition-transform active:scale-95 shadow-md"
                title="بازنشانی تاباتا"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleHiit}
                className={`h-16 px-10 rounded-2xl font-black text-lg flex items-center gap-3 transition-all active:scale-95 shadow-xl ${
                  hiitPhase === 'work'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
                    : 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/25'
                }`}
              >
                {isHiitRunning ? (
                  <>
                    <Pause className="w-6 h-6 fill-current" />
                    <span>توقف موقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" />
                    <span>{hiitPhase === 'complete' ? 'شروع دوباره' : 'شروع پروتکل تاباتا'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* HIIT Custom Configuration Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>تنظیم پارامترهای پروتکل اینتروال (TABATA Settings)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Work Duration */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] sm:text-xs text-slate-400 block mb-1">زمان فعالیت (Work)</span>
                <span className="text-xl sm:text-2xl font-black text-rose-400 tabular-nums font-sans">
                  {workTime}s
                </span>
                <div className="flex items-center justify-center gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setWorkTime((t) => Math.max(5, t - 5))}
                    disabled={isHiitRunning}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 active:scale-90 transition-all touch-manipulation"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkTime((t) => t + 5)}
                    disabled={isHiitRunning}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 active:scale-90 transition-all touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rest Duration */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] sm:text-xs text-slate-400 block mb-1">زمان استراحت (Rest)</span>
                <span className="text-xl sm:text-2xl font-black text-sky-400 tabular-nums font-sans">
                  {restIntervalTime}s
                </span>
                <div className="flex items-center justify-center gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setRestIntervalTime((t) => Math.max(5, t - 5))}
                    disabled={isHiitRunning}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 active:scale-90 transition-all touch-manipulation"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestIntervalTime((t) => t + 5)}
                    disabled={isHiitRunning}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 active:scale-90 transition-all touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rounds per cycle */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-[11px] sm:text-xs text-slate-400 block mb-1">تعداد راند در دور</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 tabular-nums font-sans">
                  {totalRounds}
                </span>
                <div className="flex items-center justify-center gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setTotalRounds((r) => Math.max(1, r - 1))}
                    disabled={isHiitRunning}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 active:scale-90 transition-all touch-manipulation"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTotalRounds((r) => r + 1)}
                    disabled={isHiitRunning}
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40 active:scale-90 transition-all touch-manipulation"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total Cycles */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">تعداد دورهای کل</span>
                <span className="text-2xl font-black text-purple-400 tabular-nums font-sans">
                  {totalCycles}
                </span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setTotalCycles((c) => Math.max(1, c - 1))}
                    disabled={isHiitRunning}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTotalCycles((c) => c + 1)}
                    disabled={isHiitRunning}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. STOPWATCH VIEW                                         */}
      {/* ========================================================= */}
      {mode === 'stopwatch' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center shadow-xl space-y-8">
          <div className="py-6">
            <span className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-widest">
              زمان سپری شده
            </span>
            <div className="text-6xl sm:text-7xl font-black text-white tabular-nums tracking-tight font-sans">
              {formatStopwatch(stopwatchMs)}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={resetStopwatch}
              className="w-13 h-13 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center transition-transform active:scale-95 shadow-md"
              title="صفر کردن"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
              className="h-16 px-10 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-black text-lg flex items-center gap-3 shadow-xl shadow-sky-500/25 transition-all"
            >
              {isStopwatchRunning ? (
                <>
                  <Pause className="w-6 h-6 fill-slate-950" />
                  <span>توقف</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-slate-950" />
                  <span>شروع</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={recordLap}
              disabled={!isStopwatchRunning}
              className="w-13 h-13 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center transition-transform active:scale-95 shadow-md text-xs font-bold disabled:opacity-40"
              title="ثبت رکورد / Lap"
            >
              Lap
            </button>
          </div>

          {/* Lap list */}
          {laps.length > 0 && (
            <div className="max-w-md mx-auto pt-4 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 block text-right mb-2">
                رکوردهای ثبت‌شده (Laps):
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {laps.map((lap, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400">دور {laps.length - i}</span>
                    <span className="font-mono text-sky-400 font-bold tabular-nums">
                      {formatStopwatch(lap)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
