import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Info, Sparkles, HelpCircle, Check, ArrowRight, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

type Level1State = 'pick_ruler' | 'rubbing' | 'charged' | 'attracting' | 'question' | 'explanation' | 'completed';

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
    id: 'opt-polarize',
    text: 'The paper pieces fly up because the ruler shifts their atomic charges (polarization)!',
    isCorrect: true,
    feedback: 'Spot on! The negative ruler pushes electrons inside paper atoms away, leaving the positive side closer and strongly attracted!',
  },
  {
    id: 'opt-sparks',
    text: 'The paper sticks because static electricity acts like magnetic liquid glue.',
    isCorrect: false,
    feedback: 'Not glue! It is Coulomb’s electrostatic force between opposite electrical charges acting across empty air!',
  },
  {
    id: 'opt-nothing',
    text: 'Paper has no electrical charges whatsoever.',
    isCorrect: false,
    feedback: 'All matter has atoms with positive protons and negative electrons! Even neutral paper contains billions of electric charges.',
  },
];

export const Level1PaperHeist: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [gameState, setGameState] = useState<Level1State>('pick_ruler');
  const [charge, setCharge] = useState(0); // 0 to 1
  const [isRubbing, setIsRubbing] = useState(false);
  const [rulerPos, setRulerPos] = useState({ x: 380, y: 100 });
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);
  const [stuckCount, setStuckCount] = useState(0);

  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Bench reference for accurate local coordinates
  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const accumulatedFriction = useRef(0);

  // Initialize Paper Pieces scattered on the table
  const [papers, setPapers] = useState<PaperPiece[]>(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      initialX: 340 + (i % 6) * 48 + Math.random() * 15,
      initialY: 310 + Math.floor(i / 6) * 35 + Math.random() * 15,
      currentX: 340 + (i % 6) * 48 + Math.random() * 15,
      currentY: 310 + Math.floor(i / 6) * 35 + Math.random() * 15,
      rotation: Math.random() * 60 - 30,
      isStuck: false,
      wiggle: false,
    }));
  });

  useEffect(() => {
    setDialogue(
      "Welcome to Experiment 1: The Paper Heist! Drag the plastic ruler over the wool cloth and rub back and forth to gather electrons!",
      'excited'
    );
  }, []);

  // Pointer Down on Ruler
  const handleRulerPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setIsDraggingRuler(true);
    dragOffset.current = { x: mouseX - rulerPos.x, y: mouseY - rulerPos.y };
    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    if (gameState === 'pick_ruler') {
      setDialogue("Great grip! Now rub the ruler vigorously against the wool cloth on the left!", 'thinking');
    }
  };

  // Pointer Move on Workbench
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRuler || !benchRef.current) return;

    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Constrain ruler strictly inside workbench
    const newX = Math.max(15, Math.min(rect.width - 200, mouseX - dragOffset.current.x));
    const newY = Math.max(15, Math.min(rect.height - 70, mouseY - dragOffset.current.y));

    setRulerPos({ x: newX, y: newY });

    // Wool Cloth zone: left 25px to 270px, top 45px to 280px
    const rulerCenterX = newX + 95;
    const rulerCenterY = newY + 27;
    const isOverWool = rulerCenterX >= 30 && rulerCenterX <= 270 && rulerCenterY >= 50 && rulerCenterY <= 280;

    // Movement detection for friction
    if (isOverWool && lastPointerPos.current) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      const moveDist = Math.hypot(dx, dy);

      // Only count actual rubbing movement (not just holding/clicking)
      if (moveDist > 6) {
        setIsRubbing(true);
        accumulatedFriction.current += moveDist;

        setCharge((prev) => {
          const next = Math.min(1, prev + moveDist * 0.0022);
          soundManager.playRubbing(0.7);
          soundManager.playChargeHum(next);

          if (next >= 0.8 && gameState !== 'charged' && gameState !== 'attracting' && gameState !== 'question') {
            setGameState('charged');
            setDialogue(
              "EXCELLENT! The ruler is fully loaded with extra electrons! Now bring it close to the neutral paper pieces!",
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

    // Paper interaction (ONLY if ruler is charged >= 0.7)
    if (charge >= 0.7) {
      const rulerBottom = newY + 52;
      const currentRulerCenter = newX + 95;

      let newlyStuck = 0;

      setPapers((prevPapers) =>
        prevPapers.map((paper) => {
          if (paper.isStuck) {
            // Paper moves with the ruler!
            return {
              ...paper,
              currentX: newX + (paper.id % 6) * 28 + 12,
              currentY: rulerBottom - 10 + (paper.id % 2) * 5,
            };
          }

          const dist = Math.hypot(paper.initialX - currentRulerCenter, paper.initialY - rulerBottom);

          // Wiggle when getting close
          if (dist < 140) {
            // Jump up and stick when within attraction reach
            if (dist < 75) {
              soundManager.playPaperFlutter();
              soundManager.playPop();
              newlyStuck++;

              return {
                ...paper,
                isStuck: true,
                currentX: newX + (paper.id % 6) * 28 + 12,
                currentY: rulerBottom - 10,
                rotation: Math.random() * 30 - 15,
                wiggle: false,
              };
            }

            return {
              ...paper,
              wiggle: true,
              currentY: paper.initialY - (140 - dist) * 0.18,
            };
          }

          return {
            ...paper,
            wiggle: false,
            currentY: paper.initialY,
          };
        })
      );

      // Check if enough papers have been picked up
      setStuckCount((prevCount) => {
        const updated = prevCount + newlyStuck;
        if (updated >= 6 && gameState !== 'attracting' && gameState !== 'question' && gameState !== 'completed') {
          setGameState('attracting');
          setDialogue("THE PAPER HAS BETRAYED GRAVITY! Look at the neutral paper cling to the negative ruler!", 'surprised');

          // Allow the player to see the papers stuck for 1.5 seconds, then transition to the question
          setTimeout(() => {
            setShowPrediction(true);
            setGameState('question');
          }, 1500);
        }
        return updated;
      });
    }
  };

  const handlePointerUp = () => {
    setIsDraggingRuler(false);
    setIsRubbing(false);
    lastPointerPos.current = null;
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setCharge(0);
    setStuckCount(0);
    accumulatedFriction.current = 0;
    setGameState('pick_ruler');
    setIsDraggingRuler(false);
    setIsRubbing(false);
    setShowPrediction(false);
    setShowExplanation(false);
    setIsCompleted(false);
    setRulerPos({ x: 380, y: 100 });
    setPapers((prev) =>
      prev.map((p) => ({
        ...p,
        isStuck: false,
        wiggle: false,
        currentX: p.initialX,
        currentY: p.initialY,
      }))
    );
    setDialogue(
      "Experiment reset! Drag the ruler over to the wool cloth and rub it back and forth to charge it up!",
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
              {charge < 0.8
                ? "Step 1: Rub ruler across the wool cloth until fully charged"
                : "Step 2: Bring the charged ruler close to the paper pieces!"}
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
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]"
      >
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

        {/* WOOL CLOTH (Friction Target on Left) */}
        <div className="absolute left-8 sm:left-14 top-14 w-48 sm:w-56 h-48 sm:h-56 rounded-3xl bg-amber-800/80 border-4 border-amber-600 comic-border-lg p-3 flex flex-col justify-between shadow-xl pointer-events-none">
          <div className="flex items-center justify-between text-xs font-black uppercase text-amber-200">
            <span>Wool Cloth</span>
            <span>🧶</span>
          </div>

          <div className="relative w-full h-28 border border-dashed border-amber-500/40 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="text-amber-300/60 text-xs font-mono font-bold select-none text-center">
              DRAG & RUB RULER
              <br />
              BACK AND FORTH HERE
            </div>
            {isRubbing && (
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                className="absolute inset-0 bg-yellow-400/15 pointer-events-none flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-yellow-300 animate-spin" />
              </motion.div>
            )}
          </div>

          <div className="text-[11px] font-bold text-amber-200 text-center">
            {charge >= 0.8
              ? '⚡ FULLY CHARGED! Move to Paper!'
              : `Charge: ${Math.round(charge * 100)}% (Rub to charge)`}
          </div>
        </div>

        {/* PAPER PIECES (Neutral Target on Table) */}
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
                  paper.isStuck ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300' : ''
                }`}
              >
                {showInvisibleCharges ? (
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

              {/* Glow when charged */}
              {charge >= 0.7 && (
                <rect
                  x="0"
                  y="0"
                  width="190"
                  height="55"
                  rx="8"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="2.5"
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

        {/* Paper Target Zone Label */}
        <div className="absolute right-24 sm:right-36 bottom-6 pointer-events-none text-center">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
            Paper Target Zone ({stuckCount}/6 Stuck)
          </div>
        </div>
      </div>

      {/* Bottom Professor Zappy Assistant */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={stuckCount >= 6 ? 'excited' : isRubbing ? 'surprised' : 'idle'}
          staticHairCharge={charge}
        />

        {gameState === 'completed' && (
          <button
            type="button"
            onClick={() => completeLevel('level-1', 3, 100)}
            className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center gap-2 cursor-pointer animate-bounce"
          >
            <span>Proceed to Next Experiment!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* PREDICTION CHALLENGE MODAL (Appears ONLY after paper attraction reaction!) */}
      <PredictionModal
        isOpen={showPrediction}
        question="You watched the paper jump against gravity and stick! What caused the neutral paper to fly up?"
        subtitle="Analyze your experimental observation!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setShowExplanation(true);
          setDialogue(
            "BRILLIANT DEDUCTION! The ruler shifted the atomic charges inside the neutral paper—a phenomenon called induced polarization!",
            'celebrating'
          );
        }}
      />

      {/* SCIENCE EXPLANATION MODAL (Follows Question) */}
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
                  <span>The Science of The Paper Heist</span>
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
                  <strong>1. Friction transfers electrons:</strong> Rubbing the plastic ruler on the wool cloth caused electrons to move from the wool to the ruler. The ruler gained extra electrons, becoming <em>negatively charged (−)</em>.
                </p>
                <p>
                  <strong>2. Neutral objects contain balanced charges:</strong> Paper pieces are neutral (equal protons and electrons), not empty of charges.
                </p>
                <p>
                  <strong>3. Induced Polarization:</strong> When the negative ruler approached, electrons inside the paper atoms were repelled slightly deeper. This left the side of the paper facing the ruler with a <em>relative positive charge</em>!
                </p>
                <p>
                  <strong>4. Electrostatic attraction defeats gravity:</strong> Because the closer positive side feels stronger attraction than the farther negative side feels repulsion, the paper leaps upward!
                </p>
              </div>

              <div className="p-3 bg-sky-950/80 rounded-xl border border-sky-600 text-xs text-sky-200 font-semibold">
                💡 <em>Core Law:</em> A neutral object does not need an overall net charge to be attracted—it only needs to rearrange its internal charges!
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

      {/* LEVEL COMPLETE MODAL (Appears after Explanation is confirmed) */}
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
