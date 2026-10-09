import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types/fitness';
import {
  Dumbbell,
  User,
  Mail,
  Lock,
  Phone,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [activeAuthTab, setActiveAuthTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupRole, setSignupRole] = useState<UserRole>('athlete');

  // Error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roleLabels: Record<UserRole, string> = {
    athlete: 'ورزشکار',
    student: 'دانشجو',
    coach: 'مربی',
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg('لطفاً ایمیل یا شماره تماس خود را وارد نمایید.');
      return;
    }
    if (!loginPassword || loginPassword.length < 4) {
      setErrorMsg('رمز عبور باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    // Check if user exists in localStorage accounts or create session
    let accounts: AuthUser[] = [];
    try {
      accounts = JSON.parse(localStorage.getItem('kasp_fit_accounts') || '[]');
    } catch {
      accounts = [];
    }

    const matched = accounts.find((a) => a.identifier.toLowerCase() === loginIdentifier.trim().toLowerCase());

    const loggedUser: AuthUser = matched || {
      id: `usr-${Date.now()}`,
      fullName: loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : 'کاربر ورزشکار',
      identifier: loginIdentifier.trim(),
      role: 'athlete',
      roleLabel: 'ورزشکار',
      registeredAt: new Date().toLocaleDateString('fa-IR'),
    };

    localStorage.setItem('kasp_fit_user', JSON.stringify(loggedUser));
    onLoginSuccess(loggedUser);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupFullName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }
    if (!signupIdentifier.trim()) {
      setErrorMsg('لطفاً ایمیل یا شماره تماس معتبر وارد کنید.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setErrorMsg('رمز عبور باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      fullName: signupFullName.trim(),
      identifier: signupIdentifier.trim(),
      role: signupRole,
      roleLabel: roleLabels[signupRole],
      registeredAt: new Date().toLocaleDateString('fa-IR'),
    };

    // Save to accounts registry and active session
    try {
      const existingAccounts: AuthUser[] = JSON.parse(localStorage.getItem('kasp_fit_accounts') || '[]');
      existingAccounts.push(newUser);
      localStorage.setItem('kasp_fit_accounts', JSON.stringify(existingAccounts));
      localStorage.setItem('kasp_fit_user', JSON.stringify(newUser));
    } catch {
      localStorage.setItem('kasp_fit_user', JSON.stringify(newUser));
    }

    onLoginSuccess(newUser);
  };

  // Quick Demo Access
  const handleQuickDemo = (role: UserRole = 'athlete') => {
    const demoUser: AuthUser = {
      id: `usr-demo-${Date.now()}`,
      fullName: role === 'coach' ? 'استاد رضا رادمان' : role === 'student' ? 'سارا کاویانی' : 'آرش سهرابی',
      identifier: 'athlete@kaspfit.ir',
      role,
      roleLabel: roleLabels[role],
      registeredAt: new Date().toLocaleDateString('fa-IR'),
    };
    localStorage.setItem('kasp_fit_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience & Hero Backdrop */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img
          src="/src/assets/images/kasp_hero_athlete_1791489379118.jpg"
          alt="پس‌زمینه ورزشی KASP Fit"
          className="w-full h-full object-cover filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Lockup */}
        <div className="text-center mb-6 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/25">
            <Dumbbell className="w-7 h-7 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            KASP <span className="text-emerald-400">FIT</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            پلتفرم هوشمند تناسب اندام، برنامه‌ریزی علمی و آنالیز بیومکانیک حرکتی
          </p>
        </div>

        {/* Auth Card Container */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Segmented Tabs: ورود / ثبت نام */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('login');
                setErrorMsg(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                activeAuthTab === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ورود به حساب
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveAuthTab('signup');
                setErrorMsg(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                activeAuthTab === 'signup'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ثبت‌نام جدید
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LOGIN FORM                                        */}
          {/* ======================================================== */}
          {activeAuthTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ایمیل یا شماره همراه
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="مثال: user@example.com یا 0912..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="رمز عبور حساب خود را وارد کنید"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-98 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 mt-2"
              >
                <span>ورود به حساب کاربری</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* ======================================================== */
            /* TAB 2: SIGNUP FORM                                       */
            /* ======================================================== */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Email / Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ایمیل یا شماره همراه
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signupIdentifier}
                    onChange={(e) => setSignupIdentifier(e.target.value)}
                    placeholder="مثال: name@kaspfit.ir یا 09123456789"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="حداقل ۴ نویسه"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showSignupPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection (ورزشکار / دانشجو / مربی) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نقش شما در سامانه
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'athlete', label: 'ورزشکار', icon: <Dumbbell className="w-3.5 h-3.5" /> },
                      { id: 'student', label: 'دانشجو', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                      { id: 'coach', label: 'مربی', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                    ] as { id: UserRole; label: string; icon: React.ReactNode }[]
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSignupRole(r.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                        signupRole === r.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.icon}
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-98 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 mt-3"
              >
                <span>تکمیل ثبت‌نام و ورود به KASP Fit</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Access Bar */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <span className="text-[11px] text-slate-500 block">
              می‌خواهید بلافاصله امکانات را بدون تایپ امتحان کنید؟
            </span>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('athlete')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors"
              >
                ورود آزمایشی (ورزشکار)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('coach')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 text-[11px] border border-slate-800 transition-colors"
              >
                ورود آزمایشی (مربی)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
