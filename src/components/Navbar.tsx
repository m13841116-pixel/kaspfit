import React from 'react';
import { TabType, AuthUser, UserRole } from '../types/fitness';
import { Activity, CalendarDays, Camera, Timer, Dumbbell, Zap, LogOut, User, ShieldCheck, GraduationCap } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onQuickStartWorkout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onQuickStartWorkout,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'assessment', label: 'سنجش وضعیت', icon: <Activity className="w-4 h-4" /> },
    { id: 'planner', label: 'برنامه هفتگی', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'pose', label: 'آنالیز فرم حرکت', icon: <Camera className="w-4 h-4" /> },
    { id: 'timer', label: 'تایمر تمرین', icon: <Timer className="w-4 h-4" /> },
  ];

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'coach':
        return {
          label: 'مربی',
          color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: <ShieldCheck className="w-3 h-3 text-amber-400" />,
        };
      case 'student':
        return {
          label: 'دانشجو',
          color: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: <GraduationCap className="w-3 h-3 text-sky-400" />,
        };
      case 'athlete':
      default:
        return {
          label: 'ورزشکار',
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: <Dumbbell className="w-3 h-3 text-emerald-400" />,
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <>
      {/* Desktop & Tablet Top Bar (Universal Constitution 3-Zone Contract) */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('assessment')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                  KASP <span className="text-emerald-400">FIT</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text with active state indicator) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[40px] ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Start Timer button */}
            <button
              onClick={() => {
                if (onQuickStartWorkout) onQuickStartWorkout();
                else setActiveTab('timer');
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all rounded-lg shadow-md shadow-emerald-500/20 whitespace-nowrap min-h-[38px]"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>شروع سریع تایمر</span>
            </button>

            {/* User Profile Info Chip */}
            {currentUser && (
              <div className="flex items-center gap-1 sm:gap-2 pl-0 sm:pl-2 border-r border-slate-800/80 pr-1 sm:pr-2">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                    {currentUser.fullName.charAt(0) || <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex flex-col text-right max-w-[80px] sm:max-w-[130px]">
                    <span className="text-[11px] sm:text-xs font-bold text-white truncate leading-tight">
                      {currentUser.fullName}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-1 py-0.2 rounded border font-medium ${roleInfo.color} leading-none mt-0.5`}>
                      {roleInfo.icon}
                      <span>{roleInfo.label}</span>
                    </span>
                  </div>
                </div>

                {/* Touch-Friendly 44px Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="خروج از حساب کاربری"
                    className="min-h-[44px] min-w-[40px] px-2 flex items-center justify-center rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 active:scale-95 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline mr-1 text-[11px]">خروج</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Natural Thumb Zone with Safe-Area) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom),10px)] shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
        <nav className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all min-h-[52px] active:scale-95 touch-manipulation relative ${
                  isActive
                    ? 'text-emerald-400 font-black'
                    : 'text-slate-400 hover:text-slate-200 active:bg-slate-900/60'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/25 scale-110'
                      : 'text-slate-400'
                  }`}
                >
                  {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                </div>
                <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap truncate max-w-full font-medium">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
