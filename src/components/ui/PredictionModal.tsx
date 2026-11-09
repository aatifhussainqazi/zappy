import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export interface PredictionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

interface PredictionModalProps {
  isOpen: boolean;
  question: string;
  subtitle?: string;
  options: PredictionOption[];
  onCorrect: () => void;
}

export const PredictionModal: React.FC<PredictionModalProps> = ({
  isOpen,
  question,
  subtitle = "What do you think will happen next?",
  options,
  onCorrect,
}) => {
  const [selectedOption, setSelectedOption] = useState<PredictionOption | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (option: PredictionOption) => {
    setSelectedOption(option);
    setHasAttempted(true);

    if (option.isCorrect) {
      soundManager.playChime();
    } else {
      soundManager.playWrong();
    }
  };

  const handleContinue = () => {
    if (selectedOption?.isCorrect) {
      onCorrect();
    } else {
      // Allow retry
      setSelectedOption(null);
      setHasAttempted(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full comic-border-lg text-white shadow-2xl relative overflow-hidden"
        >
          {/* Top banner */}
          <div className="flex items-center gap-2 mb-3 text-yellow-400 font-black text-sm tracking-widest uppercase">
            <HelpCircle className="w-5 h-5 animate-bounce" />
            <span>Scientist Hypothesis Time!</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug mb-1">
            {question}
          </h3>
          <p className="text-sm font-semibold text-slate-300 mb-6">{subtitle}</p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              let btnStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-2 border-slate-700';

              if (hasAttempted && isSelected) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-300';
                } else {
                  btnStyle = 'bg-rose-900/80 border-rose-500 text-white';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={hasAttempted && selectedOption?.isCorrect}
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left p-4 rounded-2xl font-bold text-sm sm:text-base transition-all comic-button flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span>{opt.text}</span>
                  {hasAttempted && isSelected && (
                    <span>
                      {opt.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-yellow-300 fill-emerald-800 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-rose-300 flex-shrink-0" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback section */}
          {hasAttempted && selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl mb-6 border-2 ${
                selectedOption.isCorrect
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                  : 'bg-amber-950/80 border-amber-500 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm mb-1">
                {selectedOption.isCorrect ? (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>BRILLIANT HYPOTHESIS! +25 XP</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>GOOD GUESS, BUT NOT QUITE!</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {selectedOption.feedback}
              </p>
            </motion.div>
          )}

          {/* Continue / Try Again Button */}
          {hasAttempted && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleContinue}
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl comic-border-yellow comic-button flex items-center gap-2 shadow-lg"
              >
                <span>{selectedOption?.isCorrect ? 'Proceed to Experiment!' : 'Try Another Guess'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
