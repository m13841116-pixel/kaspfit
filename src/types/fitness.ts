export type Gender = 'male' | 'female';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'strength_endurance' | 'general_fitness';
export type InjuryCategory = 'none' | 'knee' | 'lower_back' | 'shoulder' | 'neck' | 'wrist' | 'other';
export type UserRole = 'athlete' | 'student' | 'coach';

export interface AuthUser {
  id: string;
  fullName: string;
  identifier: string; // email or phone
  role: UserRole;
  roleLabel: string;
  registeredAt: string;
}

export interface UserProfile {
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  fitnessLevel: FitnessLevel;
  goal: FitnessGoal;
  activityLevel: number; // 1.2 to 1.9 multiplier
  injuryHistory: InjuryCategory;
  injuryDetails: string;
  equipment: string;
  daysPerWeek: number;
}

export interface AssessmentResults {
  bmi: number;
  bmiCategory: string;
  bmiStatusColor: 'emerald' | 'amber' | 'rose' | 'sky';
  bmr: number;
  tdee: number;
  idealWeightMin: number;
  idealWeightMax: number;
  idealWeightFormula: number;
  bodyFatPercentage: number;
  dailyWaterLiters: number;
  targetCalories: number;
  calorieAdjustmentNote: string;
}

export interface MacroTarget {
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
}

export interface SupplementRecommendation {
  name: string;
  dosage: string;
  timing: string;
  benefit: string;
}

export interface AIInsightResponse {
  summary: string;
  caloricTarget: number;
  macroSplit: MacroTarget;
  waterTargetLiters: number;
  weightTrainingStrategy: string;
  cardioRecommendation: string;
  supplements: SupplementRecommendation[];
  injuryPrecautions: string[];
  keyAdvice: string[];
}

export interface Exercise {
  id: string;
  nameFa: string;
  nameEn: string;
  sets: number;
  reps: string;
  restSeconds: number;
  rpe?: string;
  formTip: string;
  completed?: boolean;
}

export interface WorkoutDay {
  dayName: string; // شنبه، یکشنبه، ...
  dayIndex: number; // 0 to 6
  focus: string;
  isRestDay: boolean;
  estimatedDuration: string;
  intensity: string;
  exercises: Exercise[];
}

export interface WeeklyWorkoutPlan {
  planTitle: string;
  overview: string;
  recommendedWarmup: string;
  recommendedCooldown: string;
  days: WorkoutDay[];
  generatedAt?: string;
}

export interface JointAngle {
  joint: string;
  angle: string;
  assessment: string;
}

export interface PoseAnalysisResult {
  detectedExercise: string;
  accuracyScore: number;
  score?: number;
  overallStatus?: string;
  statusLevel: string;
  statusColor: 'emerald' | 'amber' | 'rose' | 'sky';
  jointSpineStatus?: string;
  injuryRisk?: 'پایین' | 'متوسط' | 'بالا';
  jointAngles: JointAngle[];
  strengths: string[];
  mistakes: string[];
  correctiveSteps: string[];
  jointStressWarning?: string;
  coachProTip?: string;
}

export type TabType = 'assessment' | 'planner' | 'pose' | 'timer';
