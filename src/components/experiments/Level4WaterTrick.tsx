import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Info, ArrowRight, Sparkles, Droplets, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, PredictionOption } from '../ui/PredictionModal';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-bend',
    text: 'The falling stream of water will bend sideways toward the balloon!',
    isCorrect: true,
    feedback: 'Spot on! Water molecules act like tiny natural magnets and rotate to pull toward the electric field!',
  },
  {
    id: 'opt-boil',
    text: 'The water will instantly boil and evaporate into hot steam.',
    isCorrect: false,
    feedback: 'Nope! Static electricity here has high voltage but very little current—it won’t heat or boil water at all.',
  },
  {
    id: 'opt-straight',
    text: 'Nothing will happen because water is liquid and cannot feel electricity.',
    isCorrect: false,
    feedback: 'Surprisingly, liquids with polar molecules like water are deeply affected by electrostatic fields!',
  },
];

export const Level4WaterTrick: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [charge, setCharge] = useState(0); // 0 to 1
  const [isFaucetOn, setIsFaucetOn] = useState(true);
  const [balloonPos, setBalloonPos] = useState({ x: 220, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRubbing, setIsRubbing] = useState(false);
  const [maxBendAchieved, setMaxBendAchieved] = useState(false);

  const [showPrediction, setShowPrediction] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDialogue(
      "Experiment 4: The Magic Water Trick! Rub the balloon to charge it, then bring it close to the running tap stream!",
      'excited'
    );
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(50, Math.min(rect.width - 120, e.clientX - rect.left - 45));
    const newY = Math.max(50, Math.min(rect.height - 120, e.clientY - rect.top - 50));

    setBalloonPos({ x: newX, y: newY });

    // Check rubbing wool patch on left (x: 60 to 200, y: 100 to 260)
    const isOverWool = newX >= 50 && newX <= 220 && newY >= 80 && newY <= 280;

    if (isOverWool && lastPos.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        setIsRubbing(true);
        setCharge((prev) => {
          const next = Math.min(1, prev + 0.035);
          soundManager.playRubbing(0.7);
          soundManager.playChargeHum(next);
          return next;
        });

        if (charge > 0.45 && !hasPredicted && !showPrediction) {
          setShowPrediction(true);
        }
      }
    } else {
      setIsRubbing(false);
    }

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsRubbing(false);
    lastPos.current = null;
  };

  // Water stream coordinate: stream drops down around x = 580
  const streamX = 580;
  const distToStream = Math.abs(balloonPos.x + 45 - streamX);
  // Calculate horizontal deflection of water stream
  let streamBend = 0;
  if (isFaucetOn && charge > 0.2 && distToStream < 260) {
    const intensity = (1 - distToStream / 260) * charge;
    // Bends towards the balloon
    const direction = balloonPos.x + 45 < streamX ? -1 : 1;
    streamBend = direction * intensity * 95;

    if (Math.abs(streamBend) > 60 && !maxBendAchieved) {
      setMaxBendAchieved(true);
      soundManager.playAttract();
      setDialogue(
        "THE WATER IS BENDING! Notice how the stream curves without any physical contact!",
        'surprised'
      );
      if (!isCompleted) {
        setIsCompleted(true);
      }
    }
  }

  const resetExperiment = () => {
    soundManager.playClick();
    setCharge(0);
    setBalloonPos({ x: 220, y: 160 });
    setMaxBendAchieved(false);
    setDialogue("Reset! Charge up that balloon and bring it near the stream!", 'excited');
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
            #4
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              The Magic Water Trick
            </h1>
            <p className="text-xs font-bold text-sky-400">
              Objective: Charge the balloon and bend the flowing water stream using static electricity!
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

      {/* Main Sink Scene */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-cyan-950/30 via-slate-900/90 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]">
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

        {/* WOOL CLOTH ON LEFT */}
        <div className="absolute left-10 sm:left-16 top-24 w-44 h-44 rounded-3xl bg-amber-800/80 border-4 border-amber-600/80 comic-border-lg p-3 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs font-black uppercase text-amber-200">
            <span>Wool Cloth</span>
            <span>🧶</span>
          </div>
          <div className="text-center text-amber-300/40 text-[11px] font-mono font-bold">
            RUB BALLOON
            <br />
            HERE TO CHARGE
          </div>
          <div className="text-[10px] text-center font-bold text-amber-200">
            {charge > 0.6 ? '⚡ Charged!' : 'Rub here!'}
          </div>
        </div>

        {/* SINK & FAUCET ON RIGHT */}
        <div className="absolute right-12 sm:right-28 top-8 bottom-6 w-64 pointer-events-none flex flex-col items-center justify-between">
          {/* Faucet Plumbing SVG */}
          <svg width="180" height="130" viewBox="0 0 180 130" className="overflow-visible">
            {/* Brass Pipe */}
            <path
              d="M140 130 L140 40 Q140 15 115 15 L50 15 Q30 15 30 35 L30 65"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Faucet Spout */}
            <rect x="20" y="65" width="20" height="12" rx="3" fill="#a16207" stroke="#0f172a" strokeWidth="2.5" />
            {/* Valve handle */}
            <circle cx="115" cy="8" r="8" fill="#ef4444" stroke="#0f172a" strokeWidth="2.5" />
          </svg>

          {/* Water Stream Canvas / SVG */}
          <div className="relative w-full flex-1 -mt-8 flex justify-center">
            {isFaucetOn && (
              <svg width="220" height="260" viewBox="0 0 220 260" className="overflow-visible">
                {/* Curved Water Stream Path */}
                <path
                  d={`M 110 0 Q ${110 + streamBend} 120, ${110 + streamBend * 0.4} 240`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                {/* Inner white light reflection inside stream */}
                <path
                  d={`M 110 0 Q ${110 + streamBend} 120, ${110 + streamBend * 0.4} 240`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.75"
                />

                {/* H2O Polar Molecules along stream if showInvisibleCharges is ON */}
                {showInvisibleCharges && (
                  <g>
                    {[40, 90, 140, 190].map((yVal, idx) => {
                      // Molecule rotates: positive Hydrogen atoms point towards the balloon!
                      const xVal = 110 + (streamBend * (yVal / 240));
                      const angle = streamBend < 0 ? -45 : 45;
                      return (
                        <g key={idx} transform={`translate(${xVal}, ${yVal}) rotate(${angle})`}>
                          {/* Oxygen atom (negative -) */}
                          <circle cx="0" cy="0" r="7" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.5" />
                          <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">−</text>

                          {/* Hydrogen ears (positive +) */}
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
            )}
          </div>

          {/* Sink Drain */}
          <div className="w-48 h-8 bg-slate-800 rounded-full border-4 border-slate-700 flex items-center justify-center shadow-inner">
            <div className="w-12 h-4 bg-slate-950 rounded-full border border-slate-600" />
          </div>
        </div>

        {/* DRAGGABLE CHARGED BALLOON */}
        <div
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
            </svg>

            {/* Electrons on balloon */}
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
        </div>
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
          <button
            type="button"
            onClick={() => completeLevel('level-4', 3, 130)}
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
        question="The balloon is now buzzing with static electrons! What will happen when you bring it near the stream of water?"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setHasPredicted(true);
          setDialogue("Brilliant! Now move the balloon close to the water and observe the deflection!", 'excited');
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
                  <strong>Water molecules are polar:</strong> Water ($H_2O$) has an uneven charge distribution. The oxygen atom pulls electrons tighter (slightly negative), while hydrogen atoms are left slightly positive.
                </p>
                <p>
                  <strong>Dipole rotation:</strong> When the negative balloon approaches, the water molecules swivel around so their positive hydrogen ends face the balloon.
                </p>
                <p>
                  <strong>Deflection:</strong> Because water droplets in a falling stream are free to move, this attraction pulls the entire liquid stream sideways!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Back to Tap
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEVEL COMPLETE MODAL */}
      <LevelCompleteModal
        isOpen={isCompleted}
        levelId="level-4"
        levelTitle="The Magic Water Trick"
        starsEarned={3}
        xpGained={200}
        unlockedPageTitle="The Bending Water Phenomenon"
        keyTakeaway="Water molecules are polar dipoles that rotate toward static electric fields, curving the entire stream sideways!"
        onNextLevel={() => startLevel('level-5')}
        onReplay={resetExperiment}
        onClose={() => setView('map')}
      />
    </div>
  );
};
