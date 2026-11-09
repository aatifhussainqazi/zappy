import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Info, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, PredictionOption } from '../ui/PredictionModal';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-polarized',
    text: 'It sticks because the wall surface polarizes, pulling toward the negative balloon!',
    isCorrect: true,
    feedback: 'Excellent! The balloon pushes wall electrons slightly away, so the positive atomic nuclei on the wall surface hold the balloon tight!',
  },
  {
    id: 'opt-glue',
    text: 'Static electricity creates a sticky liquid glue on the rubber.',
    isCorrect: false,
    feedback: 'No glue involved! It is a pure invisible electrostatic force operating between opposite electrical charges!',
  },
  {
    id: 'opt-entire-wall',
    text: 'The entire house and wall must turn into a giant battery.',
    isCorrect: false,
    feedback: 'The wall stays neutral overall! Only the surface atoms right where the balloon touches shift their electrons.',
  },
];

export const Level2BalloonWall: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [charge, setCharge] = useState(0); // 0 to 1
  const [balloonPos, setBalloonPos] = useState({ x: 260, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRubbingHair, setIsRubbingHair] = useState(false);
  const [isStuckToWall, setIsStuckToWall] = useState(false);

  const [showPrediction, setShowPrediction] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDialogue(
      "Experiment 2: Balloon vs. Wall! Rub the red balloon against Pip's hair to charge it up, then see if it sticks to the wall!",
      'excited'
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsStuckToWall(false);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(40, Math.min(rect.width - 120, e.clientX - rect.left - 40));
    const newY = Math.max(40, Math.min(rect.height - 120, e.clientY - rect.top - 40));

    setBalloonPos({ x: newX, y: newY });

    // Check rubbing against hair (Head position approx: x: 100 to 240, y: 180 to 340)
    const isOverHair = newX >= 80 && newX <= 260 && newY >= 140 && newY <= 340;

    if (isOverHair && lastPos.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        setIsRubbingHair(true);
        setCharge((prev) => {
          const next = Math.min(1, prev + 0.035);
          soundManager.playRubbing(0.75);
          soundManager.playChargeHum(next);
          return next;
        });

        if (charge > 0.5 && !hasPredicted && !showPrediction) {
          setShowPrediction(true);
        }
      }
    } else {
      setIsRubbingHair(false);
    }

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRubbingHair(false);
    lastPos.current = null;

    // Check if close to wall (wall is on the right side: x > 650)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const wallX = rect.width - 160;

      if (balloonPos.x >= wallX - 80) {
        if (charge >= 0.45) {
          // Snap and STICK to wall!
          setBalloonPos({ x: wallX - 35, y: balloonPos.y });
          setIsStuckToWall(true);
          soundManager.playPop();
          soundManager.playSpark();
          setDialogue(
            "IT STICKS! Look at that balloon cling against gravity! The neutral wall has polarized!",
            'surprised'
          );
          if (!isCompleted) {
            setIsCompleted(true);
          }
        } else {
          // Drops down if not enough charge
          setDialogue(
            "It fell down! Not enough charge yet! Rub the balloon against the hair for longer to gather more electrons!",
            'thinking'
          );
          soundManager.playWrong();
          setBalloonPos((prev) => ({ ...prev, y: Math.min(prev.y + 120, rect.height - 140) }));
        }
      }
    }
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setCharge(0);
    setIsStuckToWall(false);
    setBalloonPos({ x: 260, y: 160 });
    setDialogue("Reset! Give Pip's hair another good rub with the balloon!", 'excited');
  };

  // Wall distance for polarization calculation
  const wallDistance = Math.max(0, 600 - balloonPos.x);
  const wallPolarization = Math.max(0, 1 - wallDistance / 350) * charge;

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
            #2
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              Balloon vs. Wall
            </h1>
            <p className="text-xs font-bold text-sky-400">
              Objective: Rub the balloon on hair to charge it, then stick it to the bedroom wall!
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

      {/* Experiment Scene (Bedroom) */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-indigo-950/40 via-slate-900/90 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]">
        {/* Charge Meter HUD */}
        <div className="absolute top-4 left-4 z-20">
          <ChargeMeter
            charge={charge}
            polarity="negative"
            label="Balloon Negative Charge"
            showNeedle={true}
          />
        </div>

        {/* Legend */}
        {showInvisibleCharges && (
          <div className="absolute top-4 left-64 z-20 hidden md:block">
            <ParticleLegend />
          </div>
        )}

        {/* CHARACTER HEAD WITH FLUFFY HAIR (Pip) */}
        <div className="absolute left-10 sm:left-24 bottom-12 w-48 h-64 select-none pointer-events-none">
          <svg width="190" height="240" viewBox="0 0 190 240" className="overflow-visible">
            {/* Pip's Hair (reacts to balloon charge!) */}
            <motion.g
              animate={{
                scaleY: 1 + charge * (isRubbingHair ? 0.35 : 0.25),
                skewX: isRubbingHair ? [-4, 4, -4] : 0,
              }}
              transition={{ repeat: isRubbingHair ? Infinity : 0, duration: 0.15 }}
              style={{ transformOrigin: '95px 110px' }}
            >
              {/* Fluffy brown hair puffs */}
              <circle cx="95" cy="80" r="60" fill="#78350f" stroke="#0f172a" strokeWidth="4" />
              <circle cx="55" cy="90" r="38" fill="#78350f" stroke="#0f172a" strokeWidth="3" />
              <circle cx="135" cy="90" r="38" fill="#78350f" stroke="#0f172a" strokeWidth="3" />
              <circle cx="95" cy="45" r="32" fill="#92400e" stroke="#0f172a" strokeWidth="3" />

              {/* Hair strands standing up towards balloon */}
              {charge > 0.2 && (
                <g>
                  <path d="M50 50 Q40 20 55 10" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                  <path d="M90 40 Q95 10 105 5" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                  <path d="M130 50 Q145 20 140 10" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                  {/* Positive charges on hair (+) */}
                  {showInvisibleCharges && (
                    <>
                      <circle cx="55" cy="55" r="5" fill="#ef4444" stroke="#0f172a" strokeWidth="1" />
                      <text x="55" y="57.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">+</text>
                      <circle cx="105" cy="45" r="5" fill="#ef4444" stroke="#0f172a" strokeWidth="1" />
                      <text x="105" y="47.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">+</text>
                    </>
                  )}
                </g>
              )}
            </motion.g>

            {/* Pip's Face */}
            <circle cx="95" cy="130" r="48" fill="#fed7aa" stroke="#0f172a" strokeWidth="4" />
            {/* Eyes */}
            <circle cx="80" cy="125" r="6" fill="#0f172a" />
            <circle cx="110" cy="125" r="6" fill="#0f172a" />
            <circle cx="82" cy="123" r="2" fill="#ffffff" />
            <circle cx="112" cy="123" r="2" fill="#ffffff" />
            {/* Smile / Gasp */}
            {charge > 0.5 ? (
              <ellipse cx="95" cy="150" rx="8" ry="10" fill="#991b1b" stroke="#0f172a" strokeWidth="2.5" />
            ) : (
              <path d="M85 145 Q95 155 105 145" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
            )}
            {/* Body / Shirt */}
            <path d="M50 180 C50 170, 140 170, 140 180 L160 240 L30 240 Z" fill="#0284c7" stroke="#0f172a" strokeWidth="4" />
          </svg>

          <div className="text-center font-black text-xs text-amber-200 mt-1">
            Pip's Hair (Friction Source)
          </div>
        </div>

        {/* BEDROOM WALL (Target on Right) */}
        <div className="absolute right-0 top-0 bottom-0 w-36 sm:w-48 bg-amber-900/60 border-l-4 border-amber-600/80 p-3 flex flex-col justify-between shadow-2xl">
          <div className="text-xs font-black uppercase text-amber-200 tracking-wider">
            Bedroom Wall
          </div>

          {/* Wall Wallpaper Texture */}
          <div className="relative flex-1 my-2 border border-dashed border-amber-500/30 rounded-2xl p-2 flex flex-col justify-around overflow-hidden">
            {/* Wall Atoms & Polarization Visualization */}
            {showInvisibleCharges ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-1">
                    {/* Positive core on left side of atom facing balloon */}
                    <motion.div
                      animate={{ x: wallPolarization > 0.3 ? -6 : 0 }}
                      className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center border border-rose-700 shadow"
                    >
                      +
                    </motion.div>
                    {/* Negative electron pushed deeper into wall away from balloon */}
                    <motion.div
                      animate={{ x: wallPolarization > 0.3 ? 12 : 0 }}
                      className="w-4 h-4 rounded-full bg-sky-500 text-white font-black text-[9px] flex items-center justify-center border border-sky-700 shadow"
                    >
                      −
                    </motion.div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-amber-200/50 text-xs font-bold leading-relaxed">
                BRING CHARGED
                <br />
                BALLOON HERE
                <br />
                TO STICK!
              </div>
            )}
          </div>

          <div className="text-[10px] font-bold text-center text-amber-300">
            {isStuckToWall ? '⚡ STUCK BY POLARIZATION!' : 'Neutral Wall Surface'}
          </div>
        </div>

        {/* DRAGGABLE BALLOON */}
        <motion.div
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
          style={{
            left: balloonPos.x,
            top: balloonPos.y,
          }}
          onPointerDown={handlePointerDown}
          animate={
            isStuckToWall
              ? { x: [0, 2, 0] }
              : undefined
          }
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="relative">
            <svg width="90" height="120" viewBox="0 0 90 120" className="drop-shadow-2xl overflow-visible">
              <defs>
                <radialGradient id="balloonWallGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="65%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </radialGradient>
              </defs>

              {/* Balloon Body */}
              <ellipse cx="45" cy="50" rx="38" ry="46" fill="url(#balloonWallGrad)" stroke="#0f172a" strokeWidth="4" />
              {/* Highlight */}
              <ellipse cx="30" cy="32" rx="9" ry="16" fill="#ffffff" opacity="0.45" transform="rotate(-20 30 32)" />
              {/* Knot */}
              <polygon points="41,96 49,96 45,103" fill="#991b1b" stroke="#0f172a" strokeWidth="2.5" />
              {/* String */}
              <path d="M45 103 Q38 112 46 120 Q52 128 45 135" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />

              {/* Glow when charged */}
              {charge > 0.4 && (
                <ellipse
                  cx="45"
                  cy="50"
                  rx="41"
                  ry="49"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="animate-spark-pulse"
                />
              )}
            </svg>

            {/* Negative Electron symbols on balloon */}
            {showInvisibleCharges && charge > 0.1 && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center p-3 gap-1 pointer-events-none">
                {Array.from({ length: Math.min(10, Math.floor(charge * 11)) }).map((_, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-[0_0_6px_#38bdf8] border border-sky-200"
                  >
                    −
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Professor Zappy & Action */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={isStuckToWall ? 'excited' : isRubbingHair ? 'surprised' : 'idle'}
          staticHairCharge={charge}
        />

        {isCompleted && (
          <button
            type="button"
            onClick={() => completeLevel('level-2', 3, 110)}
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
        question="The balloon is now heavily charged with electrons! Why will it stick to the wooden wall?"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setHasPredicted(true);
          setDialogue("Spot on! Now drag the balloon right onto the wall and let go!", 'excited');
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
                  <span>The Science of Balloon vs. Wall</span>
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
                  <strong>Why does hair give up electrons?</strong> Materials have different affinities for electrons (the <em>triboelectric series</em>). Rubber loves gaining electrons, while human hair gladly donates them!
                </p>
                <p>
                  <strong>The wall never changes overall charge:</strong> The wall doesn't become positively charged overall. It remains strictly neutral.
                </p>
                <p>
                  <strong>Local surface polarization:</strong> When the negative balloon touches the wall, electrons in the wall's atoms are repelled deeper inside. The positive atomic cores are left exposed on the wall surface, pulling the balloon tight!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Back to Lab
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEVEL COMPLETE MODAL */}
      <LevelCompleteModal
        isOpen={isCompleted}
        levelId="level-2"
        levelTitle="Balloon vs. Wall"
        starsEarned={3}
        xpGained={180}
        unlockedPageTitle="The Sticky Balloon Mystery"
        keyTakeaway="Rubber balloons accumulate negative static charge, causing neutral wall surfaces to polarize and stick against gravity!"
        onNextLevel={() => startLevel('level-3')}
        onReplay={resetExperiment}
        onClose={() => setView('map')}
      />
    </div>
  );
};
