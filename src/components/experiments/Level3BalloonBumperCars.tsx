import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Info, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

type ChargeType = 'negative' | 'positive' | 'neutral';
type Level3State = 'experimenting' | 'discovered' | 'question' | 'explanation' | 'completed';

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-push',
    text: 'Like charges repel and push apart; opposite charges attract and pull together!',
    isCorrect: true,
    feedback: 'Exactly right! Negative and negative repel, positive and positive repel, while positive and negative attract!',
  },
  {
    id: 'opt-random',
    text: 'Electric charges attract or repel completely at random.',
    isCorrect: false,
    feedback: 'Not random at all! The electrostatic law is universal: likes always repel, and opposites always attract.',
  },
  {
    id: 'opt-always-stick',
    text: 'All charged objects always stick together regardless of charge type.',
    isCorrect: false,
    feedback: 'Careful! If charges are the same type, their electric fields push each other away like bumper cars!',
  },
];

export const Level3BalloonBumperCars: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [gameState, setGameState] = useState<Level3State>('experimenting');
  const [chargeA, setChargeA] = useState<ChargeType>('negative');
  const [chargeB, setChargeB] = useState<ChargeType>('negative');
  const [balloonAPos, setBalloonAPos] = useState({ x: 220, y: 150 });
  const [balloonBPos, setBalloonBPos] = useState({ x: 500, y: 150 });
  const [activeDragging, setActiveDragging] = useState<'A' | 'B' | null>(null);

  const [discoveredRepulsion, setDiscoveredRepulsion] = useState(false);
  const [discoveredAttraction, setDiscoveredAttraction] = useState(false);

  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setDialogue(
      "Experiment 3: Balloon Bumper Cars! Both balloons have gained negative charges (−). Try pushing them together!",
      'excited'
    );
  }, []);

  const isRepelling =
    (chargeA === 'negative' && chargeB === 'negative') ||
    (chargeA === 'positive' && chargeB === 'positive');

  const isAttracting =
    (chargeA === 'negative' && chargeB === 'positive') ||
    (chargeA === 'positive' && chargeB === 'negative');

  const handlePointerDown = (balloon: 'A' | 'B', e: React.PointerEvent) => {
    e.stopPropagation();
    if (!benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setActiveDragging(balloon);
    const targetPos = balloon === 'A' ? balloonAPos : balloonBPos;
    dragOffset.current = { x: mouseX - targetPos.x, y: mouseY - targetPos.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragging || !benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const boundedX = Math.max(20, Math.min(rect.width - 110, mouseX - dragOffset.current.x));
    const boundedY = Math.max(20, Math.min(rect.height - 130, mouseY - dragOffset.current.y));

    if (activeDragging === 'A') {
      let targetX = boundedX;
      let targetY = boundedY;

      // Force interaction with Balloon B
      const currentDist = Math.hypot(balloonBPos.x - targetX, balloonBPos.y - targetY);
      if (currentDist < 160) {
        if (isRepelling) {
          const pushAngle = Math.atan2(targetY - balloonBPos.y, targetX - balloonBPos.x);
          targetX = balloonBPos.x + Math.cos(pushAngle) * 160;
          targetY = balloonBPos.y + Math.sin(pushAngle) * 160;
          soundManager.playBoing();

          if (!discoveredRepulsion) {
            setDiscoveredRepulsion(true);
            setDialogue("BOING! LIKE CHARGES REPEL! They refuse to touch! Now try switching one balloon to Positive (+)", 'surprised');
          }
        } else if (isAttracting && currentDist < 120) {
          soundManager.playAttract();
          if (!discoveredAttraction) {
            setDiscoveredAttraction(true);
            setDialogue("OPPOSITES ATTRACT! Look at them hug together! An invisible magnetic-like pull!", 'celebrating');
          }
        }
      }

      setBalloonAPos({ x: targetX, y: targetY });
    } else if (activeDragging === 'B') {
      let targetX = boundedX;
      let targetY = boundedY;

      const currentDist = Math.hypot(targetX - balloonAPos.x, targetY - balloonAPos.y);
      if (currentDist < 160) {
        if (isRepelling) {
          const pushAngle = Math.atan2(targetY - balloonAPos.y, targetX - balloonAPos.x);
          targetX = balloonAPos.x + Math.cos(pushAngle) * 160;
          targetY = balloonAPos.y + Math.sin(pushAngle) * 160;
          soundManager.playBoing();

          if (!discoveredRepulsion) {
            setDiscoveredRepulsion(true);
            setDialogue("BOING! LIKE CHARGES REPEL! An invisible bumper cushion! Now switch one to Positive (+)", 'surprised');
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

    // Trigger completion sequence only after player has witnessed both repulsion and attraction
    if (discoveredRepulsion && discoveredAttraction && gameState === 'experimenting') {
      setGameState('discovered');
      setTimeout(() => {
        setShowPrediction(true);
        setGameState('question');
      }, 1500);
    }
  };

  const handlePointerUp = () => {
    setActiveDragging(null);
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setChargeA('negative');
    setChargeB('negative');
    setBalloonAPos({ x: 220, y: 150 });
    setBalloonBPos({ x: 500, y: 150 });
    setDiscoveredRepulsion(false);
    setDiscoveredAttraction(false);
    setGameState('experimenting');
    setShowPrediction(false);
    setShowExplanation(false);
    setIsCompleted(false);
    setDialogue("Reset! Push the two negative balloons together, then switch one polarity to test both laws!", 'excited');
  };

  const distBetween = Math.hypot(balloonBPos.x - balloonAPos.x, balloonBPos.y - balloonAPos.y) || 1;

  return (
    <div
      className="relative min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-6 overflow-hidden select-none flex flex-col justify-between"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Top Header Controls */}
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
              {!discoveredRepulsion
                ? "Step 1: Push the two negative balloons together to feel repulsion!"
                : !discoveredAttraction
                ? "Step 2: Switch one balloon to Positive (+) and bring them together!"
                : "Both laws discovered!"}
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

      {/* Main Arena Bench */}
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-purple-950/30 via-slate-900/90 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]"
      >
        {/* Arena Top Banners */}
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

        {/* Strings from ceiling */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="265" y1="0" x2={balloonAPos.x + 45} y2={balloonAPos.y} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 4" />
          <line x1="545" y1="0" x2={balloonBPos.x + 45} y2={balloonBPos.y} stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 4" />

          {distBetween < 220 && (
            <g>
              {isRepelling ? (
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

        {/* BALLOON A */}
        <div
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
          style={{ left: balloonAPos.x, top: balloonAPos.y }}
          onPointerDown={(e) => handlePointerDown('A', e)}
        >
          <div className="relative flex flex-col items-center">
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

            <span
              className={`-mt-1 px-2.5 py-0.5 rounded-full font-black text-xs comic-border shadow ${
                chargeA === 'positive' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
              }`}
            >
              {chargeA === 'positive' ? 'POSITIVE (+)' : 'NEGATIVE (−)'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setChargeA((c) => (c === 'negative' ? 'positive' : 'negative'));
              }}
              className="mt-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-yellow-300 rounded-lg border border-slate-700 comic-button"
            >
              Toggle (+ / −)
            </button>
          </div>
        </div>

        {/* BALLOON B */}
        <div
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
          style={{ left: balloonBPos.x, top: balloonBPos.y }}
          onPointerDown={(e) => handlePointerDown('B', e)}
        >
          <div className="relative flex flex-col items-center">
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

            <span
              className={`-mt-1 px-2.5 py-0.5 rounded-full font-black text-xs comic-border shadow ${
                chargeB === 'positive' ? 'bg-rose-500 text-white' : 'bg-sky-500 text-white'
              }`}
            >
              {chargeB === 'positive' ? 'POSITIVE (+)' : 'NEGATIVE (−)'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setChargeB((c) => (c === 'negative' ? 'positive' : 'negative'));
              }}
              className="mt-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-yellow-300 rounded-lg border border-slate-700 comic-button"
            >
              Toggle (+ / −)
            </button>
          </div>
        </div>

        {/* Status banner */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none">
          <div className="bg-slate-950/80 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-lg">
            <span className="text-xs font-black uppercase text-slate-300">
              Current Physics State:
            </span>
            <span
              className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-lg ${
                isRepelling ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
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

        {gameState === 'completed' && (
          <button
            type="button"
            onClick={() => completeLevel('level-3', 3, 120)}
            className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center gap-2 cursor-pointer animate-bounce"
          >
            <span>Proceed to Next Experiment!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* PREDICTION MODAL (Appears ONLY after observing repulsion & attraction) */}
      <PredictionModal
        isOpen={showPrediction}
        question="You tested both charge configurations! What is the fundamental rule governing electric charges?"
        subtitle="Analyze your experimental observations!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setShowExplanation(true);
          setDialogue("ABSOLUTELY RIGHT! Like charges repel each other, and opposite charges attract!", 'celebrating');
        }}
      />

      {/* SCIENCE EXPLANATION */}
      <AnimatePresence>
        {showExplanation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
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
                  onClick={() => {
                    setShowExplanation(false);
                    if (gameState === 'question') {
                      setIsCompleted(true);
                      setGameState('completed');
                    }
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <p>
                  <strong>Two Types of Charge:</strong> There are only two types of electric charge in the known universe: <em>positive (+)</em> and <em>negative (−)</em>.
                </p>
                <p>
                  <strong>Like Charges Repel:</strong> When two negative objects or two positive objects approach, their invisible electric field lines push outward, forcing them apart like bumper cars!
                </p>
                <p>
                  <strong>Opposites Attract:</strong> When a positive and a negative charge approach, electric field lines loop directly between them, pulling them together tightly!
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowExplanation(false);
                  setIsCompleted(true);
                  setGameState('completed');
                }}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Claim Victory & Stars!
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
