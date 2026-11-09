import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, BookOpen, RotateCcw, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface OptionalLearningModalProps {
  isOpen: boolean;
  levelTitle: string;
  onKeepExperimenting: () => void;
  onLearnWhy: () => void;
  onTryQuestion: () => void;
  onNextLevel?: () => void;
}

export const OptionalLearningModal: React.FC<OptionalLearningModalProps> = ({
  isOpen,
  levelTitle,
  onKeepExperimenting,
  onLearnWhy,
  onTryQuestion,
  onNextLevel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-md w-full comic-border-lg text-white shadow-2xl text-center space-y-5"
        >
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider comic-border-yellow shadow">
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Experiment Complete!</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {levelTitle}
            </h2>
            <p className="text-sm font-bold text-slate-300 mt-1">
              What would you like to do next?
            </p>
          </div>

          {/* 3 Main Action Buttons */}
          <div className="space-y-3 pt-1">
            {/* 1. Keep Experimenting */}
            <button
              type="button"
              onClick={onKeepExperimenting}
              className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-sm sm:text-base rounded-2xl comic-border comic-button flex items-center justify-center gap-3 shadow transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-sky-400" />
              <span>Keep Experimenting</span>
            </button>

            {/* 2. Learn Why */}
            <button
              type="button"
              onClick={onLearnWhy}
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-sm sm:text-base rounded-2xl comic-border-accent comic-button flex items-center justify-center gap-3 shadow transition-colors"
            >
              <BookOpen className="w-5 h-5 text-yellow-300" />
              <span>Learn Why (Science Guide)</span>
            </button>

            {/* 3. Try a Question */}
            <button
              type="button"
              onClick={onTryQuestion}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button flex items-center justify-center gap-3 shadow transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-slate-950" />
              <span>Try a Question</span>
            </button>
          </div>

          {/* Optional shortcut to next level if available */}
          {onNextLevel && (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onNextLevel}
                className="text-xs font-bold text-slate-400 hover:text-yellow-300 flex items-center justify-center gap-1.5 mx-auto transition-colors"
              >
                <span>Or jump to Next Station</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
