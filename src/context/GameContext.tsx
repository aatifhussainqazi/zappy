import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { GameSettings, GameView, LevelId, LevelProgress, PlayerStats, ZappyMood } from '../types/game';
import { soundManager } from '../utils/audio';
import { calculateRank, DEFAULT_SETTINGS, INITIAL_STATS, loadPlayerStats, loadSettings, savePlayerStats, saveSettings } from '../utils/storage';

interface DialogueState {
  text: string;
  mood: ZappyMood;
  speaker: string;
}

interface GameContextType {
  stats: PlayerStats;
  settings: GameSettings;
  currentView: GameView;
  currentLevelId: LevelId | null;
  dialogue: DialogueState | null;
  showInvisibleCharges: boolean;
  isAudioStarted: boolean;
  
  // Actions
  startAudioContext: () => void;
  setView: (view: GameView) => void;
  startLevel: (levelId: LevelId) => void;
  addXp: (amount: number, reason?: string) => void;
  completeLevel: (levelId: LevelId, stars: number, score: number) => void;
  unlockDiscovery: (pageId: string) => void;
  collectEvidence: (evidenceId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  setAccessory: (accId: string | null) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  setDialogue: (text: string, mood?: ZappyMood) => void;
  clearDialogue: () => void;
  toggleInvisibleCharges: () => void;
  resetProgress: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [currentView, setCurrentView] = useState<GameView>('landing');
  const [currentLevelId, setCurrentLevelId] = useState<LevelId | null>(null);
  const [dialogue, setDialogueState] = useState<DialogueState | null>({
    text: "Welcome to my lab! Grab a balloon or pick an experiment to discover the secrets of static electricity!",
    mood: 'excited',
    speaker: 'Professor Zappy'
  });
  const [showInvisibleCharges, setShowInvisibleCharges] = useState<boolean>(settings.showInvisibleCharges);
  const [isAudioStarted, setIsAudioStarted] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Save changes to localStorage
  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  useEffect(() => {
    saveSettings(settings);
    soundManager.setMuted(settings.muted);
    soundManager.setSfxVolume(settings.sfxVolume);
    soundManager.setMusicVolume(settings.musicVolume);
    soundManager.setVoiceNarration(settings.voiceNarration);
  }, [settings]);

  const startAudioContext = () => {
    if (!isAudioStarted) {
      soundManager.resume();
      soundManager.startMusic('lab');
      setIsAudioStarted(true);
      soundManager.playClick();
    }
  };

  const setView = (view: GameView) => {
    startAudioContext();
    soundManager.playClick();
    startTransition(() => {
      setCurrentView(view);
    });
    // Adjust music track based on view
    if (view === 'experiment' && currentLevelId === 'level-5') {
      soundManager.setMusicTrack('storm');
    } else {
      soundManager.setMusicTrack('lab');
    }
  };

  const startLevel = (levelId: LevelId) => {
    startAudioContext();
    soundManager.playClick();
    setCurrentLevelId(levelId);
    if (levelId === 'sandbox') {
      setView('sandbox');
    } else {
      setView('experiment');
    }
    if (levelId === 'level-5') {
      soundManager.setMusicTrack('storm');
    } else {
      soundManager.setMusicTrack('lab');
    }
  };

  const addXp = (amount: number, reason?: string) => {
    setStats((prev) => {
      const newXp = prev.xp + amount;
      const newRank = calculateRank(newXp);
      
      // Check unlockable accessories
      const newlyUnlockedAccs = [...prev.unlockedAccessories];
      if (newXp >= 100 && !newlyUnlockedAccs.includes('tesla-goggles')) newlyUnlockedAccs.push('tesla-goggles');
      if (newXp >= 250 && !newlyUnlockedAccs.includes('lightning-hair')) newlyUnlockedAccs.push('lightning-hair');
      if (newXp >= 450 && !newlyUnlockedAccs.includes('plasma-tie')) newlyUnlockedAccs.push('plasma-tie');
      if (newXp >= 700 && !newlyUnlockedAccs.includes('golden-coat')) newlyUnlockedAccs.push('golden-coat');

      return {
        ...prev,
        xp: newXp,
        rank: newRank,
        unlockedAccessories: newlyUnlockedAccs,
      };
    });
    soundManager.playXpSparkle();
    if (reason) {
      // Optional toast or quick message
    }
  };

  const completeLevel = (levelId: LevelId, stars: number, score: number) => {
    setStats((prev) => {
      const currentLevelProg = prev.levelProgress[levelId] || {
        levelId,
        completed: false,
        stars: 0,
        score: 0,
        unlocked: true,
      };

      const updatedProgress: Record<LevelId, LevelProgress> = {
        ...prev.levelProgress,
        [levelId]: {
          ...currentLevelProg,
          completed: true,
          stars: Math.max(currentLevelProg.stars, stars),
          score: Math.max(currentLevelProg.score, score),
        },
      };

      // Unlock next level sequentially
      const levelOrder: LevelId[] = ['level-1', 'level-2', 'level-3', 'level-4', 'level-5', 'level-6'];
      const currentIndex = levelOrder.indexOf(levelId);
      const unlockedLevels = [...prev.unlockedLevels];
      if (currentIndex !== -1 && currentIndex < levelOrder.length - 1) {
        const nextLevel = levelOrder[currentIndex + 1];
        if (!unlockedLevels.includes(nextLevel)) {
          unlockedLevels.push(nextLevel);
        }
        if (updatedProgress[nextLevel]) {
          updatedProgress[nextLevel] = {
            ...updatedProgress[nextLevel],
            unlocked: true,
          };
        }
      }

      // Unlock sandbox after level-1
      if (!unlockedLevels.includes('sandbox')) {
        unlockedLevels.push('sandbox');
      }

      // Unlock relevant discovery book pages
      const discoveryMap: Record<LevelId, string[]> = {
        'level-1': ['disc-1', 'disc-2'],
        'level-2': ['disc-3'],
        'level-3': ['disc-4'],
        'level-4': ['disc-5'],
        'level-5': ['disc-6', 'disc-7'],
        'level-6': ['disc-8'],
        'sandbox': [],
      };

      const newDiscoveryPages = [...prev.discoveryPages];
      const pagesToUnlock = discoveryMap[levelId] || [];
      pagesToUnlock.forEach(p => {
        if (!newDiscoveryPages.includes(p)) {
          newDiscoveryPages.push(p);
        }
      });

      return {
        ...prev,
        unlockedLevels,
        levelProgress: updatedProgress,
        discoveryPages: newDiscoveryPages,
      };
    });

    addXp(100 + stars * 25);
    soundManager.playFanfare();
  };

  const unlockDiscovery = (pageId: string) => {
    setStats((prev) => {
      if (prev.discoveryPages.includes(pageId)) return prev;
      return {
        ...prev,
        discoveryPages: [...prev.discoveryPages, pageId],
      };
    });
  };

  const collectEvidence = (evidenceId: string) => {
    setStats((prev) => {
      if (prev.collectedEvidence && prev.collectedEvidence.includes(evidenceId)) return prev;
      soundManager.playSpark();
      return {
        ...prev,
        collectedEvidence: [...(prev.collectedEvidence || []), evidenceId],
      };
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setStats((prev) => {
      const updated = prev.achievements.map((a) => {
        if (a.id === achievementId && !a.unlocked) {
          soundManager.playChime();
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return a;
      });
      return { ...prev, achievements: updated };
    });
  };

  const setAccessory = (accId: string | null) => {
    soundManager.playClick();
    setStats((prev) => ({ ...prev, currentAccessory: accId }));
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (newSettings.showInvisibleCharges !== undefined) {
        setShowInvisibleCharges(newSettings.showInvisibleCharges);
      }
      return merged;
    });
  };

  const setDialogue = (text: string, mood: ZappyMood = 'excited') => {
    setDialogueState({
      text,
      mood,
      speaker: 'Professor Zappy',
    });
    soundManager.playZappyBabble(mood);
    if (settings.voiceNarration) {
      soundManager.speakNarration(text);
    }
  };

  const clearDialogue = () => {
    setDialogueState(null);
    soundManager.cancelNarration();
  };

  const toggleInvisibleCharges = () => {
    soundManager.playClick();
    setShowInvisibleCharges((prev) => !prev);
  };

  const resetProgress = () => {
    setStats(INITIAL_STATS);
    setSettings(DEFAULT_SETTINGS);
    soundManager.playClick();
  };

  return (
    <GameContext.Provider
      value={{
        stats,
        settings,
        currentView,
        currentLevelId,
        dialogue,
        showInvisibleCharges,
        isAudioStarted,
        startAudioContext,
        setView,
        startLevel,
        addXp,
        completeLevel,
        unlockDiscovery,
        collectEvidence,
        unlockAchievement,
        setAccessory,
        updateSettings,
        setDialogue,
        clearDialogue,
        toggleInvisibleCharges,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
