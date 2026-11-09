import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Eye, Sparkles, HelpCircle, Check, ArrowRight, Zap, Info } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { ParticleVisualizationToggle, ParticleLegend, AtomParticle } from '../ui/ParticleVisualization';
import { PredictionModal, PredictionOption } from '../ui/PredictionModal';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

interface PaperPiece {
  id: number;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  rotation: number;
  isStuck: boolean;
  wiggle: boolean;
}

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-fly',
    text: 'The paper pieces will fly up and stick to the ruler!',
    isCorrect: true,
    feedback: 'Spot on! The static electrical attraction is stronger than gravity on the tiny neutral paper!',
  },
  {
    id: 'opt-sparks',
    text: 'The paper will instantly combust into tiny fiery sparks.',
    isCorrect: false,
    feedback: 'Haha, no fire here! Static charges on a ruler are strong enough to attract light objects, but safe and harmless to paper!',
  },
  {
    id: 'opt-nothing',
    text: 'Nothing will happen because paper is completely neutral.',
    isCorrect: false,
    feedback: 'Surprise! Even neutral objects can be pulled by static electricity through a trick called polarization!',
  },
];

export const Level1PaperHeist: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  // Experiment State
  const [charge, setCharge] = useState(0); // 0 to 1
  const [isRubbing, setIsRubbing] = useState(false);
  const [rulerPos, setRulerPos] = useState({ x: 380, y: 120 });
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);
  const [stuckCount, setStuckCount] = useState(0);

  // Modals & Phases
  const [showPrediction, setShowPrediction] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Paper Pieces
  const [papers, setPapers] = useState<PaperPiece[]>(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      initialX: 320 + (i % 6) * 45 + Math.random() * 20,
      initialY: 340 + Math.floor(i / 6) * 35 + Math.random() * 15,
      currentX: 320 + (i % 6) * 45 + Math.random() * 20,
      currentY: 340 + Math.floor(i / 6) * 35 + Math.random() * 15,
      rotation: Math.random() * 60 - 30,
      isStuck: false,
      wiggle: false,
    }));
  });

  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial Professor Zappy greeting
  useEffect(() => {
    setDialogue(
      "Welcome to Experiment 1: The Paper Heist! Rub the plastic ruler vigorously against the wool cloth to collect electrons!",
      'excited'
    );
  }, []);

  // Handle pointer down on ruler
  const handleRulerPointerDown = (e: React.PointerEvent) => {
    setIsDraggingRuler(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  // Handle pointer move anywhere in container
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRuler || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(50, Math.min(rect.width - 150, e.clientX - rect.left - 75));
    const newY = Math.max(50, Math.min(rect.height - 80, e.clientY - rect.top - 25));

    setRulerPos({ x: newX, y: newY });

    // Check if rubbing over wool cloth (approx coords: x: 80 to 240, y: 100 to 280)
    const isOverWool = newX >= 50 && newX <= 260 && newY >= 80 && newY <= 300;

    if (isOverWool && lastPos.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
        setIsRubbing(true);
        setCharge((prev) => {
          const next = Math.min(1, prev + 0.03);
          soundManager.playRubbing(0.7);
          soundManager.playChargeHum(next);
          return next;
        });

        // Prompt hypothesis after sufficient charge
        if (charge > 0.45 && !hasPredicted && !showPrediction) {
          setShowPrediction(true);
        }
      }
    } else {
      setIsRubbing(false);
    }

    // Check distance between ruler and paper pieces
    if (charge > 0.35) {
      const rulerBottom = newY + 50;
      const rulerCenter = newX + 80;

      setPapers((prevPapers) =>
        prevPapers.map((paper) => {
          if (paper.isStuck) {
            // Move with ruler!
            return {
              ...paper,
              currentX: newX + (paper.id % 5) * 28 + 10,
              currentY: rulerBottom - 8 + (paper.id % 2) * 6,
            };
          }

          const distToRuler = Math.hypot(paper.initialX - rulerCenter, paper.initialY - rulerBottom);

          // Wiggle when getting near
          if (distToRuler < 180 && !paper.isStuck) {
            // If very close, jump up and stick!
            if (distToRuler < 85) {
              soundManager.playPaperFlutter();
              soundManager.playPop();
              setStuckCount((c) => {
                const nextC = c + 1;
                if (nextC === 5) {
                  setDialogue("THE PAPER HAS BETRAYED GRAVITY! Look at them fly!", 'surprised');
                }
                if (nextC >= 7 && !isCompleted) {
                  setIsCompleted(true);
                }
                return nextC;
              });

              return {
                ...paper,
                isStuck: true,
                currentX: newX + (paper.id % 5) * 28 + 10,
                currentY: rulerBottom - 8,
                rotation: Math.random() * 40 - 20,
              };
            }

            return {
              ...paper,
              wiggle: true,
              currentY: paper.initialY - (180 - distToRuler) * 0.15,
            };
          }

          return {
            ...paper,
            wiggle: false,
            currentY: paper.initialY,
          };
        })
      );
    }

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsDraggingRuler(false);
    setIsRubbing(false);
    lastPos.current = null;
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setCharge(0);
    setStuckCount(0);
    setRulerPos({ x: 380, y: 120 });
    setPapers((prev) =>
      prev.map((p) => ({
        ...p,
        isStuck: false,
        wiggle: false,
        currentX: p.initialX,
        currentY: p.initialY,
      }))
    );
    setDialogue("Experiment reset! Rub that ruler on the wool to charge it up again!", 'excited');
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-6 overflow-hidden select-none flex flex-col justify-between"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg">
            #1
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              The Paper Heist
            </h1>
            <p className="text-xs font-bold text-sky-400">
              Objective: Rub the ruler on wool to accumulate static charge, then pick up paper!
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

      {/* Main Experiment Workbench */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]">
        {/* Table Top Surface Texture */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-amber-900/30 to-transparent border-t-2 border-amber-700/20 pointer-events-none" />

        {/* HUD Overlay: Charge Meter */}
        <div className="absolute top-4 right-4 z-20">
          <ChargeMeter
            charge={charge}
            polarity="negative"
            label="Ruler Static Charge"
            showNeedle={true}
          />
        </div>

        {/* HUD Particle Legend */}
        {showInvisibleCharges && (
          <div className="absolute top-4 left-4 z-20">
            <ParticleLegend />
          </div>
        )}

        {/* WOOL CLOTH (Friction Target) */}
        <div className="absolute left-10 sm:left-16 top-16 w-48 sm:w-56 h-48 sm:h-56 rounded-3xl bg-amber-800/80 border-4 border-amber-600/80 comic-border-lg p-3 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs font-black uppercase text-amber-200">
            <span>Wool Cloth</span>
            <span>🧶</span>
          </div>

          {/* Wool texture fibers */}
          <div className="relative w-full h-28 border border-dashed border-amber-500/40 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="text-amber-300/40 text-xs font-mono font-bold select-none text-center">
              DRAG RULER HERE
              <br />
              TO GENERATE FRICTION
            </div>
            {/* If rubbing, show cartoon friction lines */}
            {isRubbing && (
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="absolute inset-0 bg-yellow-400/10 pointer-events-none flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-yellow-300 animate-spin" />
              </motion.div>
            )}
          </div>

          <div className="text-[11px] font-bold text-amber-200 text-center">
            {charge > 0.8
              ? '⚡ Plenty of electrons transferred!'
              : 'Rub ruler across cloth!'}
          </div>
        </div>

        {/* PAPER PIECES (Neutral Target) */}
        <div className="absolute inset-0 pointer-events-none">
          {papers.map((paper) => (
            <motion.div
              key={paper.id}
              className={`absolute select-none pointer-events-none ${
                paper.wiggle ? 'animate-wiggle' : ''
              }`}
              style={{
                left: paper.currentX,
                top: paper.currentY,
                transform: `rotate(${paper.rotation}deg)`,
              }}
            >
              <div
                className={`w-7 h-5 sm:w-9 sm:h-6 rounded bg-slate-100 border border-slate-400 shadow-md flex items-center justify-center font-bold text-[9px] text-slate-700 transition-colors ${
                  paper.isStuck ? 'bg-yellow-100 border-yellow-400' : ''
                }`}
              >
                {showInvisibleCharges ? (
                  /* Neutral polarization: positive side facing upwards toward negative ruler */
                  <div className="flex flex-col items-center justify-between h-full py-0.5 leading-none">
                    <span className="text-[8px] font-black text-rose-500">+</span >
                    <span className="text-[8px] font-black text-sky-500">−</span >
                  </div>
                ) : (
                  <span>📄</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* DRAGGABLE PLASTIC RULER */}
        <motion.div
          className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
          style={{
            left: rulerPos.x,
            top: rulerPos.y,
          }}
          onPointerDown={handleRulerPointerDown}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Plastic Ruler SVG */}
          <div className="relative">
            <svg
              width="190"
              height="55"
              viewBox="0 0 190 55"
              className="drop-shadow-2xl overflow-visible"
            >
              <defs>
                <linearGradient id="rulerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#0284c7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
                </linearGradient>
              </defs>

              {/* Ruler body */}
              <rect
                x="2"
                y="2"
                width="186"
                height="50"
                rx="6"
                fill="url(#rulerGrad)"
                stroke="#0f172a"
                strokeWidth="3.5"
              />

              {/* Measurement Ticks */}
              {Array.from({ length: 18 }).map((_, i) => (
                <line
                  key={i}
                  x1={12 + i * 9.5}
                  y1="3"
                  x2={12 + i * 9.5}
                  y2={i % 5 === 0 ? 18 : 10}
                  stroke="#ffffff"
                  strokeWidth={i % 5 === 0 ? 2 : 1.2}
                />
              ))}

              {/* Label */}
              <text
                x="95"
                y="38"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="900"
                letterSpacing="1"
              >
                STATIC RULER
              </text>

              {/* Electric blue glow when charged */}
              {charge > 0.2 && (
                <rect
                  x="0"
                  y="0"
                  width="190"
                  height="55"
                  rx="8"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="2"
                  className="animate-spark-pulse"
                />
              )}
            </svg>

            {/* Electron negative symbols on ruler surface when charged */}
            {showInvisibleCharges && charge > 0.1 && (
              <div className="absolute inset-0 flex items-center justify-around px-3 pointer-events-none">
                {Array.from({ length: Math.min(8, Math.floor(charge * 9)) }).map((_, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-[0_0_6px_#38bdf8] border border-sky-200 animate-pulse"
                  >
                    −
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Paper Pile Zone Hint */}
        <div className="absolute right-24 sm:right-36 bottom-6 pointer-events-none text-center">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
            Paper Scraps Target Zone ({stuckCount}/7 Stuck)
          </div>
        </div>
      </div>

      {/* Bottom Professor Zappy Assistant */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={stuckCount >= 5 ? 'excited' : isRubbing ? 'surprised' : 'idle'}
          staticHairCharge={charge}
        />

        {isCompleted && (
          <button
            type="button"
            onClick={() => {
              completeLevel('level-1', 3, 100);
            }}
            className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center gap-2 cursor-pointer animate-bounce"
          >
            <span>Proceed to Victory Screen!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* PREDICTION CHALLENGE MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="You've gathered high negative charge on the ruler! What will happen when you bring it near the neutral paper?"
        subtitle="Make a scientific prediction before testing it!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setHasPredicted(true);
          setDialogue(
            "Hypothesis confirmed! Now move the ruler slowly toward the paper scraps and watch them jump!",
            'excited'
          );
        }}
      />

      {/* SCIENCE EXPLANATION MODAL */}
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
                  <span>The Science of The Paper Heist</span>
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
                  <strong>1. Friction transfers electrons:</strong> When the plastic ruler rubs against wool, electrons hop from the wool onto the plastic. The ruler gains extra electrons and becomes <em>negatively charged (−)</em>.
                </p>
                <p>
                  <strong>2. Neutral objects have charges:</strong> The paper pieces are neutral (equal positive and negative charges). They are NOT empty of charge!
                </p>
                <p>
                  <strong>3. Induced Polarization:</strong> When the negative ruler approaches, electrons inside the paper are repelled and push away slightly. This leaves the side of the paper closer to the ruler with a <em>relative positive charge</em>!
                </p>
                <p>
                  <strong>4. Attraction beats gravity:</strong> Because opposite charges attract, and the positive side is closer to the ruler than the repelled negative side, the net pull overcomes gravity!
                </p>
              </div>

              <div className="p-3 bg-sky-950/80 rounded-xl border border-sky-600 text-xs text-sky-200 font-semibold">
                💡 <em>Key Rule:</em> A neutral object doesn't need to gain an overall charge to be attracted—it just rearranges its charges!
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Got It, Let's Experiment!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEVEL COMPLETE MODAL */}
      <LevelCompleteModal
        isOpen={isCompleted}
        levelId="level-1"
        levelTitle="The Paper Heist"
        starsEarned={3}
        xpGained={175}
        unlockedPageTitle="What is Static Electricity? & Why Does Paper Jump?"
        keyTakeaway="Friction transfers electrons, and a charged object can attract neutral objects by polarizing their atomic charges!"
        onNextLevel={() => startLevel('level-2')}
        onReplay={resetExperiment}
        onClose={() => setView('map')}
      />
    </div>
  );
};
