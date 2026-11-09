export type LevelId = 
  | 'level-1' 
  | 'level-2' 
  | 'level-3' 
  | 'level-4' 
  | 'level-5' 
  | 'level-6'
  | 'sandbox';

export type GameView = 
  | 'landing' 
  | 'map' 
  | 'experiment' 
  | 'sandbox' 
  | 'discovery-book' 
  | 'settings' 
  | 'wardrobe';

export type ZappyMood = 
  | 'idle' 
  | 'excited' 
  | 'surprised' 
  | 'thinking' 
  | 'celebrating' 
  | 'explaining' 
  | 'funny-fail';

export interface LevelInfo {
  id: LevelId;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  concepts: string[];
}

export interface LevelProgress {
  levelId: LevelId;
  completed: boolean;
  stars: number; // 0 to 3
  score: number;
  unlocked: boolean;
}

export interface GameSettings {
  musicVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
  muted: boolean;
  voiceNarration: boolean;
  captions: boolean;
  showInvisibleCharges: boolean;
  reducedMotion: boolean;
  reducedFlash: boolean;
  freeExperimentMode: boolean; // Classroom mode: questions and lessons never pop up automatically
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  requiredXp: number;
  icon: string;
  type: 'hair' | 'goggles' | 'tie' | 'coat';
}

export interface PlayerStats {
  xp: number;
  rank: string;
  unlockedLevels: LevelId[];
  levelProgress: Record<LevelId, LevelProgress>;
  unlockedAccessories: string[];
  currentAccessory: string | null;
  discoveryPages: string[];
  achievements: Achievement[];
}

export interface DiscoveryPage {
  id: string;
  levelSource: LevelId;
  title: string;
  subtitle: string;
  summary: string;
  bullets: string[];
  deepDive: string;
  icon: string;
  chargeDemoType: 'friction' | 'polarization' | 'repulsion' | 'dipole' | 'storm' | 'safety';
}
