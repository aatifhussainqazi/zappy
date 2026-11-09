import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Microscope, 
  Zap, 
  Trophy,
  Droplets,
  Volume2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { InvisibleWorldToggle } from '../ui/InvisibleWorldToggle';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { soundManager } from '../../utils/audio';

type WaterLevelState = 'pick_balloon' | 'rubbing' | 'charged' | 'bending';

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-bend',
    text: 'Water molecules are polar dipoles that rotate so their positive hydrogen ends pull toward the balloon!',
    isCorrect: true,
    feedback: 'Spot on! H₂O has an uneven charge distribution, making water molecules rotate and bend toward the electric field!',
  },
  {
    id: 'opt-boil',
    text: 'Static electricity creates high heat that boils and evaporates the falling stream.',
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
  const { setDialogue, completeLevel, startLevel, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [charge, setCharge] = useState(0); // 0 to 1
  const [balloonPos, setBalloonPos] = useState({ x: 220, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRubbingWool, setIsRubbingWool] = useState(false);
  const [beakerFillLevel, setBeakerFillLevel] = useState(0); // 0 to 100%

  // Modals
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDialogue(
      "Case 04: The Water That Moves! Rub the balloon against the wool cloth to charge it, then bring it near the running faucet stream!",
      'excited'
    );
  }, []);

  const handleBalloonPointerDown = (e: React.PointerEvent) => {
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

    // Bounded inside sink laboratory
    const newX = Math.max(15, Math.min(rect.width - 110, mouseX - dragOffset.current.x));
    const newY = Math.max(20, Math.min(rect.height - 130, mouseY - dragOffset.current.y));

    setBalloonPos({ x: newX, y: newY });

    // Wool swatch zone: left 25px to 210px, top 40px to 270px
    const isOverWool = newX <= 220 && newY >= 35 && newY <= 275;

    if (isOverWool && lastPointerPos.current) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      const moveDist = Math.hypot(dx, dy);

      if (moveDist > 6) {
        setIsRubbingWool(true);
        setCharge((prev) => {
          const next = Math.min(1, prev + moveDist * 0.0028);
          soundManager.playRubbing(0.7);
          soundManager.playChargeHum(next);

          if (next >= 0.75 && prev < 0.75) {
            setDialogue(
              "CHARGED! Now slowly move the balloon towards the flowing water stream on the right!",
              'excited'
            );
          }
          return next;
        });
      }
    } else {
      setIsRubbingWool(false);
    }

    // Metal faucet pipe touch (discharges balloon if touched)
    const faucetX = rect.width - 180;
    if (Math.abs(newX + 45 - faucetX) < 35 && newY < 120 && charge > 0.05) {
      soundManager.playSpark();
      setCharge(0);
      setDialogue("TOUCHED METAL TAP! Metal plumbing grounded the extra electrons, discharging the balloon!", 'thinking');
    }

    lastPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRubbingWool(false);
    lastPointerPos.current = null;
  };

  // Continuous stream calculation
  const benchWidth = benchRef.current ? benchRef.current.clientWidth : 800;
  const faucetX = benchWidth - 170;
  const faucetY = 55;
  const balloonCenterX = balloonPos.x + 45;
  const balloonCenterY = balloonPos.y + 50;

  // Distance from balloon to falling stream
  const distToStream = Math.abs(balloonCenterX - faucetX);
  const streamPull = charge >= 0.25 && distToStream < 260
    ? ((260 - distToStream) / 260) * charge * (balloonCenterX < faucetX ? -1 : 1)
    : 0;

  // Max bend pixel deflection
  const maxDeflectionX = streamPull * 85;

  // Target Beaker mouth located at faucetX - 70, y: 320
  const beakerX = faucetX - 72;
  const beakerY = 320;
  const streamBottomX = faucetX + maxDeflectionX * 1.1;
  const isPouringIntoBeaker = Math.abs(streamBottomX - (beakerX + 30)) < 24 && charge >= 0.65;

  // Stream filling beaker interval effect
  useEffect(() => {
    if (!isPouringIntoBeaker || isCompleted) return;

    const interval = setInterval(() => {
      setBeakerFillLevel((prev) => {
        const next = Math.min(100, prev + 6);
        soundManager.playPaperFlutter();

        if (next >= 100 && !isCompleted) {
          setIsCompleted(true);
          soundManager.playFanfare();
          completeLevel('level-4', 3, 220);

          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#38bdf8', '#0ea5e9', '#facc15', '#10b981'],
          });

          setDialogue(
            "TARGET BEAKER FILLED! Pure electrostatic field curved the water stream right into the cup! Mystery Solved!",
            'celebrating'
          );

          setTimeout(() => {
            setShowLearningChoice(true);
          }, 800);
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPouringIntoBeaker, isCompleted]);

  const resetExperiment = () => {
    soundManager.playClick();
    setCharge(0);
    setBalloonPos({ x: 220, y: 150 });
    setBeakerFillLevel(0);
    setShowLearningChoice(false);
    setShowPrediction(false);
    setShowExplanation(false);
    setIsCompleted(false);
    setDialogue(
      "Reset! Rub the balloon against the wool cloth and bring it close to deflect the falling water!",
      'excited'
    );
  };

  return (
    <div
      className="relative min-h-[calc(100vh-65px)] bg-slate-950 p-3 sm:p-6 overflow-hidden select-none flex flex-col justify-between"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Top Objective Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg shadow">
            #4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                CASE 04
              </span>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                The Water That Moves
              </h1>
            </div>
            <p className="text-xs font-bold text-amber-300">
              {charge < 0.65
                ? "Step 1: Rub the balloon on wool cloth to accumulate negative electrons"
                : beakerFillLevel < 100
                ? `Step 2: Deflect the stream into the target beaker! (${beakerFillLevel}% filled)`
                : "Beaker filled! The electric field bent the stream without contact!"}
            </p>
          </div>
        </div>

        {/* Top Controls: Invisible World Switch & Reset */}
        <div className="flex items-center gap-2">
          <InvisibleWorldToggle
            active={showInvisibleCharges}
            onToggle={toggleInvisibleCharges}
          />

          <button
            type="button"
            onClick={() => setShowExplanation(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-xs rounded-xl comic-border comic-button flex items-center gap-1.5"
            title="Read Scientific Guide"
          >
            <Microscope className="w-4 h-4 text-sky-400" />
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

      {/* Main Kitchen / Sink Laboratory Bench */}
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-sky-950/20 via-slate-900 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px] border-2 border-slate-700"
      >
        {/* Sink basin backdrop */}
        <div className="absolute right-12 sm:right-20 bottom-0 w-64 sm:w-72 h-44 bg-slate-800/80 rounded-t-3xl border-t-4 border-x-4 border-slate-600 shadow-inner pointer-events-none" />
        <div className="absolute right-36 sm:right-48 bottom-4 w-16 h-8 rounded-full bg-slate-950 border-2 border-slate-700 pointer-events-none" />

        {/* Charge Meter HUD Overlay */}
        <div className="absolute top-4 left-4 z-20">
          <ChargeMeter
            charge={charge}
            polarity="negative"
            label="Balloon Static Charge"
            showNeedle={true}
          />
        </div>

        {/* WOOL CLOTH (Friction Target on Left) */}
        <div className="absolute left-6 sm:left-12 top-14 w-44 sm:w-52 h-44 sm:h-52 rounded-3xl bg-amber-800 border-4 border-amber-600 comic-border-lg p-3 flex flex-col justify-between shadow-xl pointer-events-none z-10">
          <div className="bg-amber-950/90 text-amber-200 text-center font-black text-xs py-1 rounded-xl">
            WOOL CLOTH
          </div>
          <div className="text-3xl text-center opacity-40">🧶</div>
          <div className="text-[10px] text-amber-300 text-center font-bold">
            {isRubbingWool ? "Rubbing builds charge!" : "Rub balloon back & forth here"}
          </div>
        </div>

        {/* CHROME FAUCET FIXTURE (On Right) */}
        <div className="absolute right-28 sm:right-36 top-6 w-20 h-28 pointer-events-none z-20 flex flex-col items-center">
          {/* Faucet gooseneck pipe */}
          <div className="w-5 h-20 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 rounded-t-full shadow-lg border border-slate-400" />
          <div className="w-10 h-6 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-b-xl shadow-md border border-slate-400 flex items-center justify-center">
            <div className="w-4 h-2 bg-slate-900 rounded-full" />
          </div>
        </div>

        {/* TARGET GRADUATED BEAKER / CUP (Target in Sink) */}
        <div
          style={{
            position: 'absolute',
            left: `${beakerX}px`,
            top: `${beakerY}px`,
          }}
          className="w-16 h-24 rounded-b-2xl border-2 border-sky-300 bg-sky-950/40 backdrop-blur-sm shadow-xl flex flex-col justify-end p-1 z-15 pointer-events-none"
        >
          {/* Beaker Volume Tick Marks */}
          <div className="absolute right-1 inset-y-2 flex flex-col justify-between text-[7px] text-sky-300/80 font-mono">
            <span>- 100</span>
            <span>- 75</span>
            <span>- 50</span>
            <span>- 25</span>
          </div>

          {/* Liquid fill volume */}
          <div
            className="w-full bg-gradient-to-t from-sky-500 to-sky-300 rounded-b-xl transition-all duration-200 shadow-[0_0_12px_#38bdf8]"
            style={{ height: `${beakerFillLevel}%` }}
          />

          <div className="absolute -top-5 inset-x-0 text-center text-[9px] font-black text-yellow-300 bg-slate-900/90 rounded px-1">
            TARGET CUP
          </div>
        </div>

        {/* CONTINUOUS LAMINAR WATER STREAM SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible">
          <defs>
            <linearGradient id="streamGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Smooth Continuous Water Stream Curve */}
          <path
            d={`M ${faucetX} ${faucetY} Q ${faucetX + maxDeflectionX} ${(faucetY + 360) / 2} ${streamBottomX} 360`}
            fill="none"
            stroke="url(#streamGrad)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Inner core shimmer */}
          <path
            d={`M ${faucetX} ${faucetY} Q ${faucetX + maxDeflectionX} ${(faucetY + 360) / 2} ${streamBottomX} 360`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="12 8"
          />

          {/* Rotating H2O Dipoles in Invisible World Mode */}
          {showInvisibleCharges && (
            <g>
              {[0.25, 0.5, 0.75].map((ratio, i) => {
                const py = faucetY + ratio * (360 - faucetY);
                const px = faucetX + maxDeflectionX * (1 - Math.pow(1 - ratio, 2));

                return (
                  <g key={i} transform={`translate(${px}, ${py})`}>
                    <circle r="6" fill="#ef4444" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                      O
                    </text>
                    {/* Hydrogens aligned toward negative balloon */}
                    <circle cx={streamPull < 0 ? -9 : 9} cy="-4" r="3.5" fill="#38bdf8" />
                    <circle cx={streamPull < 0 ? -9 : 9} cy="4" r="3.5" fill="#38bdf8" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* DRAGGABLE CHARGED BALLOON */}
        <motion.div
          style={{
            position: 'absolute',
            left: `${balloonPos.x}px`,
            top: `${balloonPos.y}px`,
            touchAction: 'none',
          }}
          onPointerDown={handleBalloonPointerDown}
          className="w-22 sm:w-26 h-30 sm:h-34 cursor-grab active:cursor-grabbing z-30 select-none flex flex-col items-center"
        >
          <div
            className={`w-20 sm:w-24 h-26 sm:h-30 rounded-[50%_50%_45%_45%] shadow-2xl transition-all border-2 flex flex-col items-center justify-center text-white font-black text-xs ${
              charge >= 0.65
                ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_24px_rgba(168,85,247,0.7)] border-purple-200'
                : 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 shadow-xl'
            }`}
          >
            <div className="absolute top-2 left-3 w-4 h-7 bg-white/40 rounded-full rotate-[-25deg] blur-[1px] pointer-events-none" />
            <span>RUBBER</span>
            <span className="text-sm">🎈</span>

            {showInvisibleCharges && charge > 0.1 && (
              <div className="absolute inset-0 flex flex-wrap items-center justify-center p-2 gap-1 pointer-events-none">
                {Array.from({ length: Math.min(8, Math.floor(charge * 9)) }).map((_, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full bg-sky-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-[0_0_6px_#38bdf8] border border-sky-200"
                  >
                    −
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="w-2.5 h-2 bg-purple-800 rounded-sm" />
        </motion.div>
      </div>

      {/* Bottom Professor Zappy & Action Bar */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={beakerFillLevel >= 100 ? 'celebrating' : isRubbingWool ? 'surprised' : 'idle'}
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
              <span>Case Menu</span>
            </button>
            <button
              type="button"
              onClick={() => startLevel('level-5')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-1.5"
            >
              <span>Next Case →</span>
            </button>
          </div>
        )}
      </div>

      {/* OPTIONAL LEARNING MODAL */}
      <OptionalLearningModal
        isOpen={showLearningChoice}
        levelTitle="The Water That Moves"
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
                  <Microscope className="w-6 h-6 text-yellow-400" />
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