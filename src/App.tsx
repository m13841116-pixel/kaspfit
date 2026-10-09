/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, UserProfile, WeeklyWorkoutPlan, AuthUser } from './types/fitness';
import { DEFAULT_WEEKLY_PLAN } from './utils/fitnessCalculations';
import { Navbar } from './components/Navbar';
import { AssessmentTab } from './components/AssessmentTab';
import { WeeklyPlannerTab } from './components/WeeklyPlannerTab';
import { PoseCheckerTab } from './components/PoseCheckerTab';
import { WorkoutTimerTab } from './components/WorkoutTimerTab';
import { AuthScreen } from './components/AuthScreen';

const DEFAULT_PROFILE: UserProfile = {
  age: 26,
  gender: 'male',
  height: 178,
  weight: 76,
  fitnessLevel: 'intermediate',
  goal: 'muscle_gain',
  activityLevel: 1.55,
  injuryHistory: 'none',
  injuryDetails: '',
  equipment: 'باشگاه بدنسازی کامل (هالتر، دمبل، دستگاه‌ها و سیم‌کش)',
  daysPerWeek: 4,
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('kasp_fit_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('assessment');

  // Load from localStorage if present
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('kasp_fit_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [plan, setPlan] = useState<WeeklyWorkoutPlan>(() => {
    try {
      const saved = localStorage.getItem('kasp_fit_plan');
      return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_PLAN;
    } catch {
      return DEFAULT_WEEKLY_PLAN;
    }
  });

  const [timerPresetSeconds, setTimerPresetSeconds] = useState<number>(60);
  const [poseExerciseName, setPoseExerciseName] = useState<string>('اسکات با هالتر (Barbell Squat)');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kasp_fit_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save profile to localStorage:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('kasp_fit_plan', JSON.stringify(plan));
    } catch (e) {
      console.warn('Could not save plan to localStorage:', e);
    }
  }, [plan]);

  // Handlers for cross-tab shortcuts
  const handleLaunchTimerForRest = (seconds: number) => {
    setTimerPresetSeconds(seconds);
    setActiveTab('timer');
  };

  const handleLaunchPoseCheckerForExercise = (exerciseName: string) => {
    setPoseExerciseName(exerciseName);
    setActiveTab('pose');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('kasp_fit_user');
    } catch (e) {
      console.warn('Error clearing user session:', e);
    }
    setCurrentUser(null);
  };

  // If user is not authenticated, show modern AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Universal Top Bar & Mobile Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onQuickStartWorkout={() => {
          setTimerPresetSeconds(60);
          setActiveTab('timer');
        }}
      />

      {/* Main Content Area (Optimized mobile padding and clearance for Bottom Nav) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 md:pb-12">
        {activeTab === 'assessment' && (
          <AssessmentTab
            profile={profile}
            setProfile={setProfile}
            plan={plan}
            currentUser={currentUser}
            onProceedToPlanner={() => setActiveTab('planner')}
          />
        )}

        {activeTab === 'planner' && (
          <WeeklyPlannerTab
            plan={plan}
            setPlan={setPlan}
            profile={profile}
            onLaunchTimerForRest={handleLaunchTimerForRest}
            onLaunchPoseCheckerForExercise={handleLaunchPoseCheckerForExercise}
          />
        )}

        {activeTab === 'pose' && (
          <PoseCheckerTab
            initialExerciseName={poseExerciseName}
            onLaunchTimer={() => setActiveTab('timer')}
          />
        )}

        {activeTab === 'timer' && (
          <WorkoutTimerTab initialRestSeconds={timerPresetSeconds} />
        )}
      </main>

      {/* Clean Uncluttered Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-400">
            KASP FIT · سامانه هوشمند تناسب اندام و ارزیابی بیومکانیک ورزشی
          </span>
          <span className="text-[11px] text-slate-600">
            مبتنی بر فیزیولوژی ورزشی مدرن و هوش مصنوعی
          </span>
        </div>
      </footer>
    </div>
  );
}
