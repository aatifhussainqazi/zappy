import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Microscope, 
  Zap, 
  ShieldAlert,
  Flame,
  Search
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { InvisibleWorldToggle } from '../ui/InvisibleWorldToggle';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { soundManager } from '../../utils/audio';

type BalloonWallState = 'pick_balloon' | 'rubbing' | 'charged' | 'stuck';

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-polarized',
    text: 'It sticks because the negative balloon pushes wall electrons deeper, exposing positive surface atoms (polarization)!',
    isCorrect: true,
    feedback: 'Spot on! The wall remains neutral overall, but its surface becomes polarized, attracting the negative balloon tight!',
  },
  {
    id: 'opt-glue',
    text: 'Static electricity creates a sticky chemical glue on the rubber.',
    isCorrect: false,
    feedback: 'No glue involved! It is pure invisible electrostatic force between opposite electrical charges!',
  },
  {
    id: 'opt-entire-wall',
    text: 'The entire house must become positively charged like a giant battery.',
    isCorrect: false,
    feedback: 'The wall stays neutral overall! Only the surface atoms right where the balloon touches shift their electrons.',
  },
];

export const Level2BalloonWall: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [charge, setCharge] = useState(0); // 0 to 1
  const [balloonPos, setBalloonPos] = useState({ x: 230, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isRubbingHair, setIsRubbingHair] = useState(false);
  const [isStuckToWall, setIsStuckToWall] = useState(false);

  // Modals & Panels
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDialogue(
      "Case 02: The Wall Defies Gravity! Rub the red balloon against Pip's hair to gather electrons, then bring it near the bedroom wall!",
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
    setIsStuckToWall(false);
    dragOffset.current = { x: mouseX - balloonPos.x, y: mouseY - balloonPos.y };
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !benchRef.current) return;

    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Constrain safely inside bedroom stage boundaries
    const newX = Math.max(15, Math.min(rect.width - 100, mouseX - dragOffset.current.x));
    const newY = Math.max(15, Math.min(rect.height - 140, mouseY - dragOffset.current.y));

    setBalloonPos({ x: newX, y: newY });

    // Pip's hair area: left 30px to 230px, y: 110px to 360px
    const isOverHair = newX <= 240 && newY >= 100 && newY <= 370;

    if (isOverHair && lastPointerPos.current) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      const moveDist = Math.hypot(dx, dy);

      if (moveDist > 6) {
        setIsRubbingHair(true);
        setCharge((prev) => {
          const next = Math.min(1, prev + moveDist * 0.0026);
          soundManager.playRubbing(0.75);
          soundManager.playChargeHum(next);

          if (next >= 0.75 && prev < 0.75) {
            setDialogue(
              "EXCELLENT! Balloon is loaded with negative charge! Drag it over to the bedroom wall on the right!",
              'excited'
            );
          }
          return next;
        });
      }
    } else {
      setIsRubbingHair(false);
    }

    // Grounding Metal Radiator Target at bottom-left: x: 180 to 290, y: rect.height - 100
    const radX = 230;
    const radY = rect.height - 110;
    const distToRadiator = Math.hypot(newX - radX, newY - radY);
    if (distToRadiator < 50 && charge > 0.05) {
      soundManager.playSpark();
      setCharge(0);
      setDialogue(
        "ZAP! You touched the metal grounding radiator! Extra electrons escaped safely into the earth, discharging the balloon!",
        'surprised'
      );
    }

    lastPointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    if (!isDragging || !benchRef.current) return;
    setIsDragging(false);
    setIsRubbingHair(false);
    lastPointerPos.current = null;

    const rect = benchRef.current.getBoundingClientRect();
    const wallLeftEdge = rect.width - 160;

    // Check if balloon was released near the wall
    if (balloonPos.x + 80 >= wallLeftEdge - 50) {
      if (charge >= 0.72) {
        // Snap and cling firmly to the wall against gravity!
        const stickX = wallLeftEdge - 28;
        setBalloonPos({ x: stickX, y: balloonPos.y });
        setIsStuckToWall(true);
        setIsCompleted(true);

        soundManager.playPop();
        soundManager.playSpark();
        soundManager.playFanfare();
        completeLevel('level-2', 3, 200);

        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#facc15', '#0ea5e9', '#10b981'],
        });

        setDialogue(
          "IT STICKS FIRMLY! The neutral drywall surface has polarized! Look at it defy gravity! Choose what to explore next!",
          'celebrating'
        );

        setTimeout(() => {
          setShowLearningChoice(true);
        }, 800);
      } else {
        // Not enough static charge to defeat gravity
        soundManager.playWrong();
        setDialogue(
          "It slid down! Uncharged or weakly charged objects can't induce enough surface polarization to hold against gravity! Rub Pip's hair longer!",
          'thinking'
        );
        // Balloon drops downward toward the bedroom floor
        setBalloonPos((prev) => ({
          x: Math.max(60, prev.x - 70),
          y: Math.min(rect.height - 145, prev.y + 90),
        }));
      }
    }
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setCharge(0);
    setIsStuckToWall(false);
    setIsDragging(false);
    setIsRubbingHair(false);
    setShowLearningChoice(false);
    setShowPrediction(false);
    setShowExplanation(false);
    setIsCompleted(false);
    setBalloonPos({ x: 230, y: 150 });
    setDialogue(
      "Reset! Rub the balloon against Pip's hair to pull electrons onto the rubber!",
      'excited'
    );
  };

  const benchWidth = benchRef.current ? benchRef.current.clientWidth : 800;
  const wallLeftEdge = benchWidth - 160;
  const wallDistance = Math.max(0, wallLeftEdge - (balloonPos.x + 80));
  const wallPolarization = Math.max(0, 1 - wallDistance / 240) * charge;

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
            #2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                CASE 02
              </span>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                The Wall Defies Gravity
              </h1>
            </div>
            <p className="text-xs font-bold text-amber-300">
              {charge < 0.72
                ? "Step 1: Rub the balloon on Pip's hair to accumulate negative charge (−)"
                : isStuckToWall
                ? "The balloon is sticking! Neutral wall surface atoms are polarized!"
                : "Step 2: Drag the balloon over to the bedroom wall on the right and release it!"}
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

      {/* Main Bedroom Scene Bench */}
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-indigo-950/20 via-slate-900 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px] border-2 border-slate-700"
      >
        {/* Bedroom Wallpaper and Baseboard */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-amber-950/30 to-transparent border-t-2 border-amber-900/30 pointer-events-none" />

        {/* Charge Meter HUD Overlay */}
        <div className="absolute top-4 left-4 sm:left-auto sm:right-4 z-20">
          <ChargeMeter
            charge={charge}
            polarity="negative"
            label="Balloon Static Charge"
            showNeedle={true}
          />
        </div>

        {/* PIP WITH REACTIVE ELECTROSTATIC HAIR (On Left) */}
        <div className="absolute left-6 sm:left-14 bottom-10 w-44 sm:w-52 h-64 sm:h-72 pointer-events-none z-10 flex flex-col items-center justify-end">
          {/* Hair Strands standing up with static charge */}
          <div className="relative w-28 h-20 mb-[-12px] flex justify-center">
            {[-35, -20, -8, 8, 20, 35].map((angle, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-12 bg-amber-400 rounded-full origin-bottom shadow-sm"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  transform: `rotate(${angle * (1 + charge * 0.9)}deg) scaleY(${1 + charge * 0.6})`,
                  transition: 'transform 0.15s ease-out',
                }}
              />
            ))}
          </div>

          {/* Pip Cartoon Body */}
          <div className="w-24 h-24 rounded-full bg-amber-200 border-4 border-amber-400 shadow-md flex flex-col items-center justify-center relative">
            {/* Eyes */}
            <div className="flex gap-4 mb-1">
              <div className="w-3.5 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full translate-x-0.5 -translate-y-0.5" />
              </div>
              <div className="w-3.5 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full translate-x-0.5 -translate-y-0.5" />
              </div>
            </div>
            {/* Mouth */}
            <div className="w-4 h-2 border-b-2 border-slate-900 rounded-full" />
          </div>

          <div className="mt-1 bg-slate-900/90 text-sky-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-slate-700">
            Pip's Hair (Electron Donor)
          </div>
        </div>

        {/* METAL GROUNDING RADIATOR (Grounding Point Target at bottom) */}
        <div className="absolute left-64 bottom-6 w-28 h-20 rounded-2xl bg-gradient-to-t from-slate-700 to-slate-500 border-2 border-slate-400 p-1.5 shadow-lg flex flex-col justify-between pointer-events-none z-10">
          <div className="text-[9px] font-black uppercase text-center text-slate-900 bg-slate-300 rounded">
            Metal Radiator
          </div>
          <div className="flex justify-around h-9">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-1.5 bg-slate-800 rounded-full" />
            ))}
          </div>
          <div className="text-[8px] text-center text-slate-300 font-bold">
            Grounding Touch Point
          </div>
        </div>

        {/* BEDROOM DRYWALL SECTION (Target on Right) */}
        <div className="absolute right-0 top-0 bottom-0 w-36 sm:w-44 bg-gradient-to-l from-amber-100 to-amber-50 border-l-4 border-amber-300 shadow-2xl flex flex-col justify-around p-3 pointer-events-none z-10">
          <div className="text-center font-black text-slate-800 text-xs bg-amber-200/90 py-1 rounded-xl border border-amber-400/60">
            BEDROOM WALL
          </div>

          {/* Atomic Induced Surface Polarization Layer in Invisible Mode */}
          {showInvisibleCharges && (
            <div className="space-y-4">
              <div className="text-[9px] font-black text-slate-500 uppercase text-center">
                Neutral Drywall
              </div>

              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 transition-all duration-200"
                >
                  <span
                    className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center transition-all ${
                      wallPolarization > 0.3
                        ? 'bg-rose-500 text-white shadow-[0_0_8px_#f43f5e] scale-110'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    +
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center transition-all ${
                      wallPolarization > 0.3
                        ? 'bg-sky-400 text-slate-950 shadow-[0_0_8px_#38bdf8] translate-x-2'
                        : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    −
                  </span>
                </div>
              ))}

              <div className="text-[8px] font-bold text-center text-rose-700 bg-rose-100 rounded py-0.5">
                {wallPolarization > 0.3 ? "Surface Polarized!" : "Dipoles Balanced"}
              </div>
            </div>
          )}

          <div className="text-[10px] text-center text-slate-500 font-bold">
            Release charged balloon near wall to stick!
          </div>
        </div>

        {/* DRAGGABLE RUBBER BALLOON */}
        <motion.div
          style={{
            position: 'absolute',
            left: `${balloonPos.x}px`,
            top: `${balloonPos.y}px`,
            touchAction: 'none',
          }}
          onPointerDown={handleBalloonPointerDown}
          className="w-24 sm:w-28 h-32 sm:h-36 cursor-grab active:cursor-grabbing z-30 select-none flex flex-col items-center"
        >
          {/* Balloon Body */}
          <div
            className={`relative w-full h-28 sm:h-32 rounded-[50%_50%_45%_45%] shadow-2xl transition-all border-2 ${
              charge >= 0.72
                ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 shadow-[0_0_24px_rgba(244,63,94,0.7)] border-rose-200'
                : 'bg-gradient-to-br from-rose-400 to-rose-600 border-rose-300 shadow-xl'
            }`}
          >
            {/* Rubber highlight shine */}
            <div className="absolute top-3 left-4 w-5 h-8 bg-white/40 rounded-full rotate-[-25deg] blur-[1px] pointer-events-none" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-black text-xs pointer-events-none">
              <span>RUBBER</span>
              <span className="text-sm">🎈</span>
            </div>

            {/* Negative Electron Charges in Invisible World Mode */}
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

          {/* Balloon tie knot & string */}
          <div className="w-3 h-2 bg-rose-700 rounded-sm" />
          <svg className="w-6 h-8 overflow-visible">
            <path d="M 12 0 Q 6 12 12 24" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          </svg>
        </motion.div>
      </div>

      {/* Bottom Professor Zappy & Action Bar */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={isStuckToWall ? 'celebrating' : isRubbingHair ? 'surprised' : 'idle'}
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
              onClick={() => startLevel('level-3')}
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
        levelTitle="The Wall Defies Gravity"
        onKeepExperimenting={() => setShowLearningChoice(false)}
        onLearnWhy={() => {
          setShowLearningChoice(false);
          setShowExplanation(true);
        }}
        onTryQuestion={() => {
          setShowLearningChoice(false);
          setShowPrediction(true);
        }}
        onNextLevel={() => startLevel('level-3')}
      />

      {/* PREDICTION MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="You watched the balloon stick firmly to the wall against gravity! Why does it cling to the neutral wall?"
        subtitle="Analyze your experimental observation!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setDialogue(
            "SPOT ON! The balloon's negative charge repels electrons in the wall's surface atoms, creating local positive attraction!",
            'celebrating'
          );
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
                  <strong>Why does hair donate electrons?</strong> Materials have different electrostatic affinities (the <em>triboelectric series</em>). Rubber collects extra electrons greedily, while human hair gladly surrenders them!
                </p>
                <p>
                  <strong>The wall never changes overall charge:</strong> The wall doesn't become positively charged overall. It remains strictly neutral.
                </p>
                <p>
                  <strong>Local surface polarization:</strong> When the negative balloon touches the wall, electrons in the wall's atoms are repelled deeper inside. The positive atomic cores are left exposed on the wall surface, pulling the balloon tight against gravity!
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