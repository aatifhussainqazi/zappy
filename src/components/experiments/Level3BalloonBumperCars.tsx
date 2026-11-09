import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Info, ArrowRight, Sparkles, Heart, Zap, ArrowLeftRight } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, PredictionOption } from '../ui/PredictionModal';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

type ChargeType = 'negative' | 'positive' | 'neutral';

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-push',
    text: 'Both balloons will push apart and bounce away like bumper cars!',
    isCorrect: true,
    feedback: 'Exactly right! Two negative charges repel each other with an invisible electrostatic force field!',
  },
  {
    id: 'opt-merge',
    text: 'They will merge together into one mega giant balloon.',
    isCorrect: false,
    feedback: 'Haha! Balloon rubber is tough—they won’t merge, they will violently push each other away!',
  },
  {
    id: 'opt-stick',
    text: 'They will stick together like magnetic glue.',
    isCorrect: false,
    feedback: 'Careful! Like charges repel each other! Only OPPOSITE charges pull together.',
  },
];

export const Level3BalloonBumperCars: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  // Balloon A & Balloon B states
  const [chargeA, setChargeA] = useState<ChargeType>('negative');
  const [chargeB, setChargeB] = useState<ChargeType>('negative');
  const [balloonAPos, setBalloonAPos] = useState({ x: 260, y: 180 });
  const [balloonBPos, setBalloonBPos] = useState({ x: 520, y: 180 });
  const [activeDragging, setActiveDragging] = useState<'A' | 'B' | null>(null);

  const [discoveredRepulsion, setDiscoveredRepulsion] = useState(false);
  const [discoveredAttraction, setDiscoveredAttraction] = useState(false);

  const [showPrediction, setShowPrediction] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDialogue(
      "Experiment 3: Balloon Bumper Cars! Both balloons have gained negative charges (−). Try pushing them together!",
      'excited'
    );
  }, []);

  // Distance between balloons
  const dx = balloonBPos.x - balloonAPos.x;
  const dy = balloonBPos.y - balloonAPos.y;
  const distance = Math.hypot(dx, dy) || 1;

  // Determine force interaction
  const isRepelling =
    (chargeA === 'negative' && chargeB === 'negative') ||
    (chargeA === 'positive' && chargeB === 'positive');

  const isAttracting =
    (chargeA === 'negative' && chargeB === 'positive') ||
    (chargeA === 'positive' && chargeB === 'negative');

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = Math.max(50, Math.min(rect.width - 120, e.clientX - rect.left - 45));
    const mouseY = Math.max(80, Math.min(rect.height - 120, e.clientY - rect.top - 50));

    if (activeDragging === 'A') {
      let targetX = mouseX;
      let targetY = mouseY;

      // Physics force reaction against Balloon B
      const currentDist = Math.hypot(balloonBPos.x - targetX, balloonBPos.y - targetY);
      if (currentDist < 160) {
        if (isRepelling) {
          // Repulsion force pushback!
          const pushAngle = Math.atan2(targetY - balloonBPos.y, targetX - balloonBPos.x);
          targetX = balloonBPos.x + Math.cos(pushAngle) * 160;
          targetY = balloonBPos.y + Math.sin(pushAngle) * 160;
          soundManager.playBoing();

          if (!discoveredRepulsion) {
            setDiscoveredRepulsion(true);
            setDialogue("BOING! LIKE CHARGES REPEL! They simply refuse to touch!", 'surprised');
          }
        } else if (isAttracting && currentDist < 120) {
          soundManager.playAttract();
          if (!discoveredAttraction) {
            setDiscoveredAttraction(true);
            setDialogue("OPPOSITES ATTRACT! Look at them hug together!", 'celebrating');
          }
        }
      }

      setBalloonAPos({ x: targetX, y: targetY });
    } else if (activeDragging === 'B') {
      let targetX = mouseX;
      let targetY = mouseY;

      const currentDist = Math.hypot(targetX - balloonAPos.x, targetY - balloonAPos.y);
      if (currentDist < 160) {
        if (isRepelling) {
          const pushAngle = Math.atan2(targetY - balloonAPos.y, targetX - balloonAPos.x);
          targetX = balloonAPos.x + Math.cos(pushAngle) * 160;
          targetY = balloonAPos.y + Math.sin(pushAngle) * 160;
          soundManager.playBoing();

          if (!discoveredRepulsion) {
            setDiscoveredRepulsion(true);
            setDialogue("BOING! LIKE CHARGES REPEL! An invisible bumper cushion!", 'surprised');
          }
        } else if (isAttracting && currentDist < 120) {
          soundManager.playAttract();
          if (!discoveredAttraction) {
            setDiscoveredAttraction(true);
            setDialogue("OPPOSITES ATTRACT! Even invisible charges have preferences!", 'celebrating');
          }
        }
      }

      setBalloonBPos({ x: targetX, y: targetY });
    }

    // Trigger complete when player has experienced both
    if (discoveredRepulsion && discoveredAttraction && !isCompleted) {
      setIsCompleted(true);
    }
  };

  const handlePointerUp = () => {
    setActiveDragging(null);
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setChargeA('negative');
    setChargeB('negative');
    setBalloonAPos({ x: 260, y: 180 });
    setBalloonBPos({ x: 520, y: 180 });
    setDialogue("Reset! Try toggling Balloon B's charge to Positive to see attraction!", 'excited');
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-6 overflow-hidden select-none flex flex-col justify-between"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg">
            #3
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              Balloon Bumper Cars
            </h1>
            <p className="text-xs font-bold text-sky-400">
              Objective: Test attraction & repulsion between positive and negative charges!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ParticleVisualizationToggle
            active={showInvisibleCharges}
            onToggle={toggleInvisibleCharges}
          />
          <button
            type="button"
            onClick={() => setShowExplanation(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-xs rounded-xl comic-border comic-button flex items-center gap-1.5"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Science Guide</span>
          </button>
          <button
            type="button"
            onClick={resetExperiment}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl comic-border comic-button"
            title="Reset Experiment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Arena */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-purple-950/30 via-slate-900/90 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]">
        {/* Arena Top Banners: The Golden Laws of Electrostatics */}
        <div className="absolute top-4 inset-x-8 flex justify-center z-20 pointer-events-none">
          <div className="bg-slate-900/90 border-2 border-slate-700 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 text-xs font-black">
            <span className={chargeA === chargeB ? 'text-yellow-400' : 'text-slate-500'}>
              SAME CHARGES (− − or + +) = REPEL ⛔
            </span>
            <span className="text-slate-600">|</span>
            <span className={chargeA !== chargeB ? 'text-pink-400' : 'text-slate-500'}>
              OPPOSITE CHARGES (+ −) = ATTRACT ❤️
            </span>
          </div>
        </div>

        {/* Strings suspended from ceiling */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="305" y1="0" x2={balloonAPos.x + 45} y2={balloonAPos.y} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 4" />
          <line x1="565" y1="0" x2={balloonBPos.x + 45} y2={balloonBPos.y} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 4" />

          {/* Force Lines between Balloons */}
          {distance < 240 && (
            <g>
              {isRepelling ? (
                /* Repulsion Shockwave Curves */
                <circle
                  cx={(balloonAPos.x + balloonBPos.x) / 2 + 45}
                  cy={(balloonAPos.y + balloonBPos.y) / 2 + 50}
                  r="35"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  className="animate-spin"
                />
              ) : (
                /* Attraction Magnetic Flow Lines */
                <line
                  x1={balloonAPos.x + 45}
                  y1={balloonAPos.y + 50}
                  x2={balloonBPos.x + 45}
                  y2={balloonBPos.y + 50}
                  stroke="#38bdf8"
                  strokeWidth="4"
                  className="animate-pulse"
                />
              )}
            </g>
          )}
        </svg>

        {/* BALLOON A (Left) */}
        <div
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
          style={{ left: balloonAPos.x, top: balloonAPos.y }}
          onPointerDown={() => {
            setActiveDragging('A');
            if (!hasPredicted && !showPrediction) setShowPrediction(true);
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Balloon SVG */}
            <svg width="90" height="110" viewBox="0 0 90 110" className="drop-shadow-2xl">
              <ellipse
                cx="45"
                cy="46"
                rx="38"
                ry="44"
                fill={chargeA === 'positive' ? '#ef4444' : '#0ea5e9'}
                stroke="#0f172a"
                strokeWidth="4"
              />
              <ellipse cx="32" cy="30" rx="8" ry="14" fill="#ffffff" opacity="0.4" transform="rotate(-20 32 30)" />
              <polygon points="41,88 49,88 45,95" fill="#0f172a" />
            </svg>

            {/* Charge Badge */}
            <span
              className={`-mt-1 px-2.5 py-0.5 rounded-full font-black text-xs comic-border shadow ${
                chargeA === 'positive' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
              }`}
            >
              {chargeA === 'positive' ? 'POSITIVE (+)' : 'NEGATIVE (−)'}
            </span>

            {/* Polarity Switcher for A */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setChargeA((c) => (c === 'negative' ? 'positive' : 'negative'));
              }}
              className="mt-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-yellow-300 rounded-lg border border-slate-700"
            >
              Switch Polarity
            </button>
          </div>
        </div>

        {/* BALLOON B (Right) */}
        <div
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
          style={{ left: balloonBPos.x, top: balloonBPos.y }}
          onPointerDown={() => {
            setActiveDragging('B');
            if (!hasPredicted && !showPrediction) setShowPrediction(true);
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Balloon SVG */}
            <svg width="90" height="110" viewBox="0 0 90 110" className="drop-shadow-2xl">
              <ellipse
                cx="45"
                cy="46"
                rx="38"
                ry="44"
                fill={chargeB === 'positive' ? '#ef4444' : '#0ea5e9'}
                stroke="#0f172a"
                strokeWidth="4"
              />
              <ellipse cx="32" cy="30" rx="8" ry="14" fill="#ffffff" opacity="0.4" transform="rotate(-20 32 30)" />
              <polygon points="41,88 49,88 45,95" fill="#0f172a" />
            </svg>

            {/* Charge Badge */}
            <span
              className={`-mt-1 px-2.5 py-0.5 rounded-full font-black text-xs comic-border shadow ${
                chargeB === 'positive' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
              }`}
            >
              {chargeB === 'positive' ? 'POSITIVE (+)' : 'NEGATIVE (−)'}
            </span>

            {/* Polarity Switcher for B */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setChargeB((c) => (c === 'negative' ? 'positive' : 'negative'));
              }}
              className="mt-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-yellow-300 rounded-lg border border-slate-700"
            >
              Switch Polarity
            </button>
          </div>
        </div>

        {/* Interaction Status Banner */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none">
          <div className="bg-slate-950/80 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-3">
            <span className="text-xs font-black uppercase text-slate-300">
              Interaction Status:
            </span>
            <span
              className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-lg ${
                isRepelling
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isRepelling ? '🚫 Like Charges Repelling' : '❤️ Opposite Charges Attracting'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Professor Zappy & Action */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={discoveredAttraction && discoveredRepulsion ? 'celebrating' : 'excited'}
        />

        {isCompleted && (
          <button
            type="button"
            onClick={() => completeLevel('level-3', 3, 120)}
            className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center gap-2 cursor-pointer animate-bounce"
          >
            <span>Proceed to Victory Screen!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* PREDICTION MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="Both balloons have gained negative charges (−). What will happen when you push them close?"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setHasPredicted(true);
          setDialogue("Brilliant! Now try to force them together and feel the invisible bumper car effect!", 'excited');
        }}
      />

      {/* SCIENCE EXPLANATION */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-4 border-sky-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full comic-border-lg text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <span>The Fundamental Law of Charges</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowExplanation(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <p>
                  <strong>There are only two kinds of charge:</strong> Benjamin Franklin named them <em>positive (+)</em> and <em>negative (−)</em> over 250 years ago!
                </p>
                <p>
                  <strong>Like charges repel:</strong> When two negative objects meet, their electric fields push back against each other.
                </p>
                <p>
                  <strong>Opposite charges attract:</strong> A negative object pulls toward a positive object with an invisible force called Coulomb's force!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Back to Bumper Cars
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEVEL COMPLETE MODAL */}
      <LevelCompleteModal
        isOpen={isCompleted}
        levelId="level-3"
        levelTitle="Balloon Bumper Cars"
        starsEarned={3}
        xpGained={190}
        unlockedPageTitle="The Golden Law of Charges"
        keyTakeaway="Same charges repel and push apart; opposite charges attract and pull together!"
        onNextLevel={() => startLevel('level-4')}
        onReplay={resetExperiment}
        onClose={() => setView('map')}
      />
    </div>
  );
};
