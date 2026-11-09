import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Info, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { soundManager } from '../../utils/audio';

type Level4State = 'pick_balloon' | 'rubbing' | 'charged' | 'bending' | 'question' | 'explanation' | 'completed';

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-bend',
    text: 'Water molecules are polar dipoles that rotate so their positive ends pull toward the balloon!',
    isCorrect: true,
    feedback: 'Spot on! H₂O has an uneven charge distribution, making water molecules rotate and bend toward the electric field!',
  },
  {
    id: 'opt-boil',
    text: 'The water boils and evaporates into hot invisible gas.',
    isCorrect: false,
    feedback: 'Static electricity here creates high voltage but negligible current—it has no heating power to boil water!',
  },
  {
    id: 'opt-straight',
    text: 'Water is neutral liquid, so electricity has zero effect on it.',
    isCorrect: false,
    feedback: 'Water contains polar molecules! The dipole moment causes liquids like water to bend readily toward charges.',
  },
];

export const Level4WaterTrick: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [gameState, setGameState] = useState<Level4State>('pick_balloon');
  const [charge, setCharge] = useState(0); // 0 to 1
  const [balloonPos, setBalloonPos] = useState({ x: 200, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRubbing, setIsRubbing] = useState(false);
  const [maxBendAchieved, setMaxBendAchieved] = useState(false);

  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDialogue(
      "Experiment 4: The Magic Water Trick! Rub the balloon against the wool cloth on the left to charge it, then bring it near the running water tap!",
      'excited'
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setIsDragging(true);
    dragOffset.current = { x: mouseX - balloonPos.x, y: mouseY - balloonPos.y };
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = Math.max(15, Math.min(rect.width - 95, mouseX - dragOffset.current.x));
    const newY = Math.max(15, Math.min(rect.height - 130, mouseY - dragOffset.current.y));

    setBalloonPos({ x: newX, y: newY });

    // Check rubbing wool patch on left (x: 20 to 220, y: 80 to 300)
    const isOverWool = newX <= 220 && newY >= 70 && newY <= 300;

    if (isOverWool && lastPointerPos.current) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      const moveDist = Math.hypot(dx, dy);

      if (moveDist > 6) {
        setIsRubbing(true);
        setCharge((prev) => {
          const next = Math.min(1, prev + moveDist * 0.0025);
          soundManager.playRubbing(0.7);
          soundManager.playChargeHum(next);

          if (next >= 0.75 && gameState === 'pick_balloon') {
            setGameState('charged');
            setDialogue(
              "FULLY CHARGED! Now drag the balloon close to the running tap water on the right and watch the stream!",
              'excited'
            );
          }
          return next;
        });
      }
    } else {
      setIsRubbing(false);
    }

    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    // Water stream bending check
    // The faucet spout is located at approx x = rect.width - 150
    const streamX = rect.width - 150;
    const distToStream = Math.abs(newX + 45 - streamX);

    if (charge >= 0.7 && distToStream < 190 && !maxBendAchieved && !isCompleted) {
      setMaxBendAchieved(true);
      setIsCompleted(true);
      setGameState('bending');
      soundManager.playAttract();
      soundManager.playFanfare();
      completeLevel('level-4', 3, 200);

      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#38bdf8', '#facc15', '#10b981'],
      });

      setDialogue(
        "LOOK AT THAT! THE WATER STREAM IS BENDING! Water molecules are rotating to pull toward the balloon! Choose what to explore next!",
        'celebrating'
      );

      setTimeout(() => {
        setShowLearningChoice(true);
      }, 800);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRubbing(false);
    lastPointerPos.current = null;
  };

  // Calculate stream bend for rendering
  const benchWidth = benchRef.current ? benchRef.current.clientWidth : 800;
  const streamX = benchWidth - 150;
  const distToStream = Math.abs(balloonPos.x + 45 - streamX);
  let streamBend = 0;
  if (charge >= 0.3 && distToStream < 260) {
    const intensity = (1 - distToStream / 260) * charge;
    const direction = balloonPos.x + 45 < streamX ? -1 : 1;
    streamBend = direction * intensity * 85;
  }

  const resetExperiment = () => {
    soundManager.playClick();
    setCharge(0);
    setBalloonPos({ x: 200, y: 150 });
    setMaxBendAchieved(false);
    setGameState('pick_balloon');
    setShowLearningChoice(false);
    setShowPrediction(false);
    setShowExplanation(false);
    setIsCompleted(false);
    setDialogue(
      "Reset! Rub the balloon against the wool cloth and bring it close to the running tap!",
      'excited'
    );
  };

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
            #4
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              The Magic Water Trick
            </h1>
            <p className="text-xs font-bold text-sky-400">
              {charge < 0.75
                ? "Step 1: Rub the balloon on the wool cloth until fully charged"
                : "Step 2: Bring the charged balloon close to the running water stream!"}
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

      {/* Main Sink Workbench */}
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-cyan-950/30 via-slate-900/90 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]"
      >
        {/* Charge Meter HUD */}
        <div className="absolute top-4 left-4 z-20">
          <ChargeMeter
            charge={charge}
            polarity="negative"
            label="Balloon Static Charge"
            showNeedle={true}
          />
        </div>

        {/* Legend */}
        {showInvisibleCharges && (
          <div className="absolute top-4 left-64 z-20 hidden md:block">
            <ParticleLegend />
          </div>
        )}

        {/* WOOL CLOTH (Left) */}
        <div className="absolute left-8 sm:left-14 top-20 w-44 h-44 rounded-3xl bg-amber-800/80 border-4 border-amber-600 comic-border-lg p-3 flex flex-col justify-between shadow-xl pointer-events-none">
          <div className="flex items-center justify-between text-xs font-black uppercase text-amber-200">
            <span>Wool Cloth</span>
            <span>🧶</span>
          </div>
          <div className="text-center text-amber-300/50 text-[11px] font-mono font-bold leading-tight">
            DRAG & RUB
            <br />
            BALLOON HERE
          </div>
          <div className="text-[10px] text-center font-bold text-amber-200">
            {charge >= 0.75 ? '⚡ FULLY CHARGED!' : `Charge: ${Math.round(charge * 100)}%`}
          </div>
        </div>

        {/* SINK & FAUCET (Right) */}
        <div className="absolute right-8 sm:right-20 top-6 bottom-6 w-64 pointer-events-none flex flex-col items-center justify-between">
          <svg width="180" height="130" viewBox="0 0 180 130" className="overflow-visible">
            <path
              d="M140 130 L140 40 Q140 15 115 15 L50 15 Q30 15 30 35 L30 65"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <rect x="20" y="65" width="20" height="12" rx="3" fill="#a16207" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="115" cy="8" r="8" fill="#ef4444" stroke="#0f172a" strokeWidth="2.5" />
          </svg>

          {/* Water Stream */}
          <div className="relative w-full flex-1 -mt-8 flex justify-center">
            <svg width="220" height="260" viewBox="0 0 220 260" className="overflow-visible">
              <path
                d={`M 110 0 Q ${110 + streamBend} 120, ${110 + streamBend * 0.4} 240`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d={`M 110 0 Q ${110 + streamBend} 120, ${110 + streamBend * 0.4} 240`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
              />

              {showInvisibleCharges && (
                <g>
                  {[40, 90, 140, 190].map((yVal, idx) => {
                    const xVal = 110 + (streamBend * (yVal / 240));
                    const angle = streamBend < 0 ? -45 : 45;
                    return (
                      <g key={idx} transform={`translate(${xVal}, ${yVal}) rotate(${angle})`}>
                        <circle cx="0" cy="0" r="7" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.5" />
                        <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">−</text>
                        <circle cx="-7" cy="-7" r="4.5" fill="#ef4444" stroke="#0f172a" strokeWidth="1.2" />
                        <text x="-7" y="-5" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">+</text>
                        <circle cx="7" cy="-7" r="4.5" fill="#ef4444" stroke="#0f172a" strokeWidth="1.2" />
                        <text x="7" y="-5" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">+</text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          <div className="w-48 h-8 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center shadow-inner">
            <div className="w-12 h-4 bg-slate-950 rounded-full border border-slate-600" />
          </div>
        </div>

        {/* DRAGGABLE BALLOON */}
        <motion.div
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
          style={{ left: balloonPos.x, top: balloonPos.y }}
          onPointerDown={handlePointerDown}
        >
          <div className="relative">
            <svg width="90" height="120" viewBox="0 0 90 120" className="drop-shadow-2xl">
              <defs>
                <radialGradient id="balloonWaterGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="65%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </radialGradient>
              </defs>
              <ellipse cx="45" cy="50" rx="38" ry="46" fill="url(#balloonWaterGrad)" stroke="#0f172a" strokeWidth="4" />
              <ellipse cx="30" cy="32" rx="9" ry="16" fill="#ffffff" opacity="0.45" transform="rotate(-20 30 32)" />
              <polygon points="41,96 49,96 45,103" fill="#991b1b" stroke="#0f172a" strokeWidth="2.5" />
              <path d="M45 103 Q38 112 46 120 Q52 128 45 135" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />

              {charge >= 0.75 && (
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

            {showInvisibleCharges && charge > 0.1 && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center p-3 gap-1 pointer-events-none">
                {Array.from({ length: Math.min(8, Math.floor(charge * 9)) }).map((_, i) => (
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
          mood={maxBendAchieved ? 'excited' : isRubbing ? 'surprised' : 'idle'}
          staticHairCharge={charge}
        />

        {isCompleted && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLearningChoice(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Experiment Menu</span>
            </button>
            <button
              type="button"
              onClick={() => startLevel('level-5')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-1.5"
            >
              <span>Next Station →</span>
            </button>
          </div>
        )}
      </div>

      {/* OPTIONAL LEARNING MODAL */}
      <OptionalLearningModal
        isOpen={showLearningChoice}
        levelTitle="The Magic Water Trick"
        onKeepExperimenting={() => setShowLearningChoice(false)}
        onLearnWhy={() => {
          setShowLearningChoice(false);
          setShowExplanation(true);
        }}
        onTryQuestion={() => {
          setShowLearningChoice(false);
          setShowPrediction(true);
        }}
        onNextLevel={() => startLevel('level-5')}
      />

      {/* PREDICTION MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="You watched the falling stream bend sideways without any physical contact! Why did water curve toward the balloon?"
        subtitle="Analyze your experimental observation!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setDialogue("BRILLIANT! Water molecules act like tiny electrostatic dipoles that pivot toward the charged balloon!", 'celebrating');
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
                  <span>The Science of Bending Water</span>
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
                  <strong>Water molecules are polar:</strong> In each water molecule (H₂O), the oxygen atom pulls electrons tighter (slightly negative), leaving the hydrogen atoms slightly positive.
                </p>
                <p>
                  <strong>Dipole rotation:</strong> When the negative balloon approaches, the water molecules pivot so their positive hydrogen ends face the balloon!
                </p>
                <p>
                  <strong>Fluid deflection:</strong> Because water droplets in a falling stream are free to move, this attraction pulls the entire liquid stream sideways before it reaches the drain!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Back to Experiment
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
