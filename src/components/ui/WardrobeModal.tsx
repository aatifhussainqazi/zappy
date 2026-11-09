import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Lock, Shirt } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';

interface WardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCESSORIES = [
  {
    id: null,
    name: 'Classic Lab Look',
    description: 'Clean white lab coat and iconic scientist spectacles.',
    requiredXp: 0,
    icon: '🥼',
  },
  {
    id: 'tesla-goggles',
    name: 'Tesla Lab Goggles',
    description: 'Electrostatically shielded blue goggles for high-voltage studies.',
    requiredXp: 100,
    icon: '🥽',
  },
  {
    id: 'lightning-hair',
    name: 'Electric Blue Spikes',
    description: 'Permanently ionized hair that crackles with static energy.',
    requiredXp: 250,
    icon: '⚡',
  },
  {
    id: 'plasma-tie',
    name: 'Plasma Spark Bowtie',
    description: 'A glowing cyan bowtie powered by electrostatic charges.',
    requiredXp: 450,
    icon: '🎀',
  },
  {
    id: 'golden-coat',
    name: 'Quantum Gold Lab Coat',
    description: 'A conductive golden coat worn by master static electricity researchers.',
    requiredXp: 700,
    icon: '👑',
  },
];

export const WardrobeModal: React.FC<WardrobeModalProps> = ({ isOpen, onClose }) => {
  const { stats, setAccessory } = useGame();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full comic-border-lg text-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-2">
              <Shirt className="w-6 h-6 text-pink-400" />
              <span>Zappy's Science Wardrobe</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Avatar Preview */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center mb-6">
            <div className="text-xs font-bold text-slate-400 mb-2">Live Outfit Preview</div>
            <ProfessorZappy size="md" position="inline" mood="excited" staticHairCharge={0.4} />
            <div className="text-xs font-black text-yellow-300 mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Your XP: {stats.xp}</span>
            </div>
          </div>

          {/* Accessories Grid */}
          <div className="space-y-3">
            {ACCESSORIES.map((acc) => {
              const isUnlocked = stats.xp >= acc.requiredXp;
              const isSelected = stats.currentAccessory === acc.id;

              return (
                <button
                  key={acc.id ?? 'default'}
                  type="button"
                  disabled={!isUnlocked}
                  onClick={() => setAccessory(acc.id)}
                  className={`w-full p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-left comic-button ${
                    isSelected
                      ? 'bg-sky-950/90 border-sky-400 ring-2 ring-sky-300'
                      : isUnlocked
                      ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700'
                      : 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{acc.icon}</span>
                    <div>
                      <div className="font-extrabold text-sm text-white flex items-center gap-2">
                        <span>{acc.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-sky-500 text-white px-2 py-0.2 rounded-full font-black">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-medium">{acc.description}</div>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      isSelected ? (
                        <Check className="w-5 h-5 text-sky-400" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Equip</span>
                      )
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Lock className="w-4 h-4" />
                        <span>{acc.requiredXp} XP</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
