import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Sparkles, BookOpen, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { LevelId } from '../../types/game';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../utils/audio';

interface LevelCompleteModalProps {
  isOpen: boolean;
  levelId: LevelId;
  levelTitle: string;
  starsEarned: number; // 1 to 3
  xpGained: number;
  unlockedPageTitle?: string;
  keyTakeaway: string;
  onNextLevel: () => void;
  onReplay: () => void;
  onClose: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  levelTitle,
  starsEarned,
  xpGained,
  unlockedPageTitle,
  keyTakeaway,
  onNextLevel,
  onReplay,
  onClose,
}) => {
  const { setView } = useGame();

  useEffect(() => {
    if (isOpen) {
      soundManager.playFanfare();
      // Burst celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#facc15', '#ef4444', '#10b981'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-md w-full comic-border-lg text-white shadow-2xl relative text-center"
        >
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider mb-3 comic-border-yellow">
            <Award className="w-4 h-4" />
            <span>Experiment Complete!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            {levelTitle}
          </h2>

          {/* Stars */}
          <div className="flex justify-center items-center gap-3 my-4">
            {[1, 2, 3].map((starIndex) => {
              const isEarned = starIndex <= starsEarned;
              return (
                <motion.div
                  key={starIndex}
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + starIndex * 0.15, type: 'spring' }}
                >
                  <Star
                    className={`w-12 h-12 ${
                      isEarned
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_4px_10px_rgba(250,204,21,0.5)]'
                        : 'text-slate-700'
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* XP & Rewards */}
          <div className="bg-slate-950/70 rounded-2xl p-4 my-4 border border-slate-800">
            <div className="flex items-center justify-center gap-2 text-yellow-300 font-black text-lg mb-1">
              <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>+{xpGained} XP Earned!</span>
            </div>
            <p className="text-xs text-slate-300 italic">
              "{keyTakeaway}"
            </p>
          </div>

          {/* Unlocked Discovery Book Notification */}
          {unlockedPageTitle && (
            <div className="bg-sky-950/70 border border-sky-600/60 rounded-2xl p-3 mb-6 flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                  Discovery Book Entry Unlocked
                </div>
                <div className="text-xs font-bold text-white">
                  {unlockedPageTitle}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onReplay}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={onNextLevel}
              className="px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
