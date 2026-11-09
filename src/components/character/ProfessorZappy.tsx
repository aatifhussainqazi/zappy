import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, MessageCircle, ChevronRight, X } from 'lucide-react';
import { ZappyMood } from '../../types/game';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../utils/audio';

interface ProfessorZappyProps {
  mood?: ZappyMood;
  customText?: string;
  staticHairCharge?: number; // 0 to 1, hair reacts to static electricity!
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-left' | 'inline' | 'hero';
}

export const ProfessorZappy: React.FC<ProfessorZappyProps> = ({
  mood = 'idle',
  customText,
  staticHairCharge = 0,
  size = 'md',
  position = 'inline',
}) => {
  const { dialogue, settings, stats } = useGame();
  const [isMinimized, setIsMinimized] = useState(false);

  const activeMood = mood || dialogue?.mood || 'idle';
  const textToShow = customText || dialogue?.text || "Science is all about curious minds trying things out!";

  const handleReplayVoice = () => {
    soundManager.playZappyBabble(activeMood);
    soundManager.speakNarration(textToShow);
  };

  // Dimensions based on size
  const svgSize = size === 'sm' ? 90 : size === 'lg' ? 170 : 130;

  // Static hair expansion calculation (hair puffs up wild when charged!)
  const hairScaleY = 1 + staticHairCharge * 0.45;
  const hairScaleX = 1 + staticHairCharge * 0.3;

  return (
    <div
      className={`relative flex items-end ${
        position === 'bottom-left'
          ? 'fixed bottom-4 left-4 z-40 max-w-sm md:max-w-md pointer-events-none'
          : position === 'hero'
          ? 'flex-col sm:flex-row items-center gap-4'
          : 'items-center gap-3'
      }`}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {!isMinimized && textToShow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: 'spring', damping: 18, stiffness: 300 }}
            className={`pointer-events-auto relative bg-amber-50 text-slate-900 rounded-2xl p-3.5 sm:p-4 comic-border shadow-xl ${
              position === 'bottom-left' ? 'mb-2 mr-2 max-w-xs' : 'max-w-md'
            }`}
          >
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2.5 left-8 w-4 h-4 bg-amber-50 border-r-3 border-b-3 border-slate-900 transform rotate-45" />

            {/* Header info */}
            <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-amber-200/80 pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                <span>Prof. Zappy</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReplayVoice}
                  title="Listen to Professor Zappy"
                  className="p-1 rounded-full hover:bg-amber-200 text-slate-700 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                {position === 'bottom-left' && (
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-full hover:bg-amber-200 text-slate-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Bubble text */}
            <p className="text-sm font-semibold text-slate-800 leading-snug tracking-tight">
              {textToShow}
            </p>

            {/* Static hair indicator if high */}
            {staticHairCharge > 0.4 && (
              <div className="mt-2 text-[11px] font-bold text-sky-600 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                Hair status: Electrostatically Charged ({Math.round(staticHairCharge * 100)}%)!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized avatar button when collapsed */}
      {isMinimized && position === 'bottom-left' && (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="pointer-events-auto bg-amber-400 hover:bg-amber-300 text-slate-900 p-2.5 rounded-full comic-border shadow-lg flex items-center gap-1.5 font-bold text-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask Zappy</span>
        </button>
      )}

      {/* Professor Zappy Animated Cartoon Avatar */}
      <motion.div
        className="pointer-events-auto relative cursor-pointer select-none group"
        onClick={() => {
          soundManager.playZappyBabble(activeMood);
          if (settings.voiceNarration) soundManager.speakNarration(textToShow);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          width={svgSize}
          height={svgSize * 1.15}
          viewBox="0 0 140 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Defs for gradients & patterns */}
          <defs>
            <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="coatGrad" x1="0" y1="0" x2="0" y2="1">
              {stats.currentAccessory === 'golden-coat' ? (
                <>
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#eab308" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Electric Hair Behind Head */}
          <motion.g
            animate={{
              scaleY: hairScaleY,
              scaleX: hairScaleX,
              y: staticHairCharge > 0.3 ? -staticHairCharge * 12 : 0,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            style={{ transformOrigin: '70px 65px' }}
          >
            {/* Wild scientist hair tufts */}
            <path
              d="M30 60 C15 45, 10 20, 35 25 C25 10, 50 0, 70 12 C88 -2, 115 10, 105 28 C128 20, 132 48, 115 62 C125 75, 118 90, 108 92 C108 100, 35 100, 30 60 Z"
              fill={stats.currentAccessory === 'lightning-hair' ? '#38bdf8' : 'url(#hairGrad)'}
              stroke="#0f172a"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Electrified spikes when charged */}
            {staticHairCharge > 0.2 && (
              <path
                d="M20 30 L5 20 L25 40 M68 5 L72 -12 L78 8 M120 25 L138 12 L118 42"
                stroke={stats.currentAccessory === 'lightning-hair' ? '#facc15' : '#0284c7'}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            )}
          </motion.g>

          {/* Body / Lab Coat */}
          <g>
            <path
              d="M40 105 C40 95, 100 95, 100 105 L115 155 L25 155 Z"
              fill="url(#coatGrad)"
              stroke="#0f172a"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Lab Coat Lapels */}
            <path
              d="M55 105 L70 128 L85 105"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3.5"
            />
            <path
              d="M70 128 L70 155"
              stroke="#0f172a"
              strokeWidth="3"
            />
            {/* Buttons / Pockets */}
            <circle cx="75" cy="138" r="2.5" fill="#0f172a" />
            <circle cx="75" cy="148" r="2.5" fill="#0f172a" />
            <rect x="85" y="125" width="16" height="12" rx="2" fill="none" stroke="#0f172a" strokeWidth="2.5" />
            {/* Pen in pocket */}
            <line x1="89" y1="120" x2="89" y2="128" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
            <line x1="94" y1="122" x2="94" y2="128" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

            {/* Bowtie Accessory */}
            {stats.currentAccessory === 'plasma-tie' ? (
              <g>
                <polygon points="58,104 70,111 58,118" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                <polygon points="82,104 70,111 82,118" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                <circle cx="70" cy="111" r="3.5" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
              </g>
            ) : (
              <g>
                <polygon points="62,106 70,111 62,116" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
                <polygon points="78,106 70,111 78,116" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
                <circle cx="70" cy="111" r="3" fill="#ca8a04" stroke="#0f172a" strokeWidth="1.5" />
              </g>
            )}
          </g>

          {/* Head & Neck */}
          <rect x="62" y="94" width="16" height="14" rx="4" fill="url(#skinGrad)" stroke="#0f172a" strokeWidth="3" />
          <circle cx="70" cy="68" r="30" fill="url(#skinGrad)" stroke="#0f172a" strokeWidth="4" />

          {/* Ears */}
          <circle cx="39" cy="68" r="6" fill="#fdba74" stroke="#0f172a" strokeWidth="3" />
          <circle cx="101" cy="68" r="6" fill="#fdba74" stroke="#0f172a" strokeWidth="3" />

          {/* Rosy Cheeks */}
          <ellipse cx="50" cy="76" rx="5" ry="3.5" fill="#f87171" opacity="0.45" />
          <ellipse cx="90" cy="76" rx="5" ry="3.5" fill="#f87171" opacity="0.45" />

          {/* Eyes (Animated for blinking and moods) */}
          {activeMood === 'surprised' ? (
            <g>
              {/* Wide surprised eyes */}
              <circle cx="56" cy="60" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="84" cy="60" r="9" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="56" cy="60" r="4" fill="#0f172a" />
              <circle cx="84" cy="60" r="4" fill="#0f172a" />
              <circle cx="58" cy="58" r="1.5" fill="#ffffff" />
              <circle cx="86" cy="58" r="1.5" fill="#ffffff" />
            </g>
          ) : activeMood === 'thinking' ? (
            <g>
              {/* Thinking eyes looking upwards */}
              <circle cx="56" cy="62" r="7.5" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="84" cy="62" r="7.5" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="58" cy="58" r="3.5" fill="#0f172a" />
              <circle cx="86" cy="58" r="3.5" fill="#0f172a" />
            </g>
          ) : activeMood === 'celebrating' || activeMood === 'funny-fail' ? (
            <g>
              {/* Squinting joyful eyes ^ ^ */}
              <path d="M50 63 Q56 55 62 63" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              <path d="M78 63 Q84 55 90 63" fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* Normal friendly eyes */}
              <circle cx="56" cy="62" r="7.5" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="84" cy="62" r="7.5" fill="#ffffff" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="57" cy="62" r="3.5" fill="#0f172a" />
              <circle cx="85" cy="62" r="3.5" fill="#0f172a" />
              <circle cx="59" cy="60" r="1.5" fill="#ffffff" />
              <circle cx="87" cy="60" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Eyebrows */}
          {activeMood === 'surprised' ? (
            <g>
              <path d="M48 46 Q56 40 64 46" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M76 46 Q84 40 92 46" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : activeMood === 'thinking' ? (
            <g>
              <path d="M48 50 Q56 46 64 52" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M76 44 Q84 38 92 42" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <path d="M49 50 Q56 46 63 50" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M77 50 Q84 46 91 50" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          )}

          {/* Nose */}
          <path d="M70 64 Q74 72 68 73" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

          {/* Mouth */}
          {activeMood === 'surprised' ? (
            <ellipse cx="70" cy="83" rx="5" ry="7" fill="#881337" stroke="#0f172a" strokeWidth="2.5" />
          ) : activeMood === 'celebrating' || activeMood === 'excited' ? (
            <path
              d="M58 78 Q70 94 82 78 Z"
              fill="#be123c"
              stroke="#0f172a"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ) : activeMood === 'funny-fail' ? (
            <path d="M60 84 Q70 78 80 84" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            <path d="M61 80 Q70 88 79 80" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* Eyeglasses or Tesla Goggles Accessory */}
          {stats.currentAccessory === 'tesla-goggles' ? (
            <g>
              {/* Futuristic Tesla Goggles */}
              <rect x="44" y="52" width="24" height="18" rx="6" fill="#0284c7" opacity="0.6" stroke="#0f172a" strokeWidth="3.5" />
              <rect x="72" y="52" width="24" height="18" rx="6" fill="#0284c7" opacity="0.6" stroke="#0f172a" strokeWidth="3.5" />
              <line x1="68" y1="61" x2="72" y2="61" stroke="#0f172a" strokeWidth="4" />
              <line x1="38" y1="60" x2="44" y2="60" stroke="#0f172a" strokeWidth="4" />
              <line x1="96" y1="60" x2="102" y2="60" stroke="#0f172a" strokeWidth="4" />
              <circle cx="56" cy="61" r="3" fill="#38bdf8" />
              <circle cx="84" cy="61" r="3" fill="#38bdf8" />
            </g>
          ) : (
            <g>
              {/* Round Scientist Spectacles */}
              <circle cx="56" cy="62" r="11" fill="none" stroke="#0f172a" strokeWidth="3.5" />
              <circle cx="84" cy="62" r="11" fill="none" stroke="#0f172a" strokeWidth="3.5" />
              <line x1="67" y1="62" x2="73" y2="62" stroke="#0f172a" strokeWidth="3.5" />
              <line x1="40" y1="62" x2="45" y2="62" stroke="#0f172a" strokeWidth="3" />
              <line x1="95" y1="62" x2="100" y2="62" stroke="#0f172a" strokeWidth="3" />
              {/* Glass reflection sheen */}
              <line x1="50" y1="56" x2="56" y2="54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="78" y1="56" x2="84" y2="54" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {/* Sparkles around hair if static charge is high */}
          {staticHairCharge > 0.4 && (
            <g>
              <polygon points="18,15 22,22 30,24 23,28 24,36 17,31 11,35 13,27 7,22 15,21" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
              <polygon points="120,12 123,17 129,18 124,22 125,28 120,24 115,27 116,21 111,18 117,17" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
