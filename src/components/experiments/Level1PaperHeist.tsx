import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Info, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { soundManager } from '../../utils/audio';

const TOTAL_PAPERS = 8;

interface PaperPiece {
  id: number;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  rotation: number;
  isAttached: boolean;
  wiggle: boolean;
}

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-polarize',
    text: 'The paper pieces fly up because the ruler shifts their atomic charges (induced polarization)!',
    isCorrect: true,
    feedback: 'Spot on! The negative ruler pushes electrons inside paper atoms away, leaving the positive side closer and strongly attracted!',
  },
  {
    id: 'opt-sparks',
    text: 'The paper sticks because static electricity creates a sticky chemical glue.',
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

  const [charge, setCharge] = useState(0); // 0 to 1
  const [isRubbing, setIsRubbing] = useState(false);
  const [rulerPos, setRulerPos] = useState({ x: 380, y: 100 });
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);

  // Completion & Optional learning modals
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize exact 8 Paper Pieces on the workbench desk
  const [papers, setPapers] = useState<PaperPiece[]>(() => {
    return Array.from({ length: TOTAL_PAPERS }).map((_, i) => ({
      id: i,
      initialX: 340 + (i % 4) * 55 + Math.random() * 12,
      initialY: 310 + Math.floor(i / 4) * 45 + Math.random() * 10,
      currentX: 340 + (i % 4) * 55 + Math.random() * 12,
      currentY: 310 + Math.floor(i / 4) * 45 + Math.random() * 10,
      rotation: Math.random() * 40 - 20,
      isAttached: false,
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

    // Friction detection: requires actual pointer movement
    if (isOverWool && lastPointerPos.current) {
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      const moveDist = Math.hypot(dx, dy);

      if (moveDist > 6) {
        setIsRubbing(true);
        setCharge((prev) => {
          const next = Math.min(1, prev + moveDist * 0.0022);
          soundManager.playRubbing(0.7);
          soundManager.playChargeHum(next);

          if (next >= 0.75 && prev < 0.75) {
            setDialogue(
              "EXCELLENT! The ruler is fully loaded with extra electrons! Now bring it close to the paper pieces!",
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

    // Paper attraction and attachment (ONLY if ruler is charged >= 0.70)
    if (charge >= 0.70) {
      const rulerBottom = newY + 52;
      const currentRulerCenter = newX + 95;

      setPapers((prevPapers) => {
        let attachedCount = 0;

        const updated = prevPapers.map((paper) => {
          if (paper.isAttached) {
            attachedCount++;
            // Paper moves with ruler
            return {
              ...paper,
              currentX: newX + (paper.id * 21) + 12,
              currentY: rulerBottom - 10 + (paper.id % 2) * 4,
            };
          }

          const dist = Math.hypot(paper.initialX - currentRulerCenter, paper.initialY - rulerBottom);

          // Wiggle when getting close
          if (dist < 140) {
            // Attach when close enough to ruler bottom
            if (dist < 80) {
              soundManager.playPaperFlutter();
              soundManager.playPop();
              attachedCount++;

              return {
                ...paper,
                isAttached: true,
                currentX: newX + (paper.id * 21) + 12,
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
        });

        // Trigger completion when ALL paper pieces have successfully attached!
        if (attachedCount >= TOTAL_PAPERS && !isCompleted) {
          setIsCompleted(true);
          soundManager.playFanfare();
          completeLevel('level-1', 3, 175);

          confetti({
            particleCount: 70,
            spread: 65,
            origin: { y: 0.6 },
            colors: ['#0ea5e9', '#facc15', '#ef4444', '#10b981'],
          });

          setDialogue(
            "ALL 8 PAPERS COLLECTED! Gravity completely defeated by static charges! Choose what to explore next!",
            'celebrating'
          );

          // Open the Optional Learning Panel after paper attachment finishes
          setTimeout(() => {
            setShowLearningChoice(true);
          }, 800);
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
    setIsDraggingRuler(false);
    setIsRubbing(false);
    setIsCompleted(false);
    setShowLearningChoice(false);
    setShowPrediction(false);
    setShowExplanation(false);
    setRulerPos({ x: 380, y: 100 });
    setPapers((prev) =>
      prev.map((p) => ({
        ...p,
        isAttached: false,
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

  const attachedCount = papers.filter((p) => p.isAttached).length;

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
              {charge < 0.75
                ? "Step 1: Rub ruler across the wool cloth until fully charged"
                : attachedCount < TOTAL_PAPERS
                ? `Step 2: Bring the charged ruler close to the paper pieces! (${attachedCount}/${TOTAL_PAPERS} Collected)`
                : "All papers attached! Experiment Complete!"}
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
            {charge >= 0.75
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
                  paper.isAttached ? 'bg-yellow-100 border-yellow-400 ring-2 ring-yellow-300' : ''
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
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-700 shadow flex items-center gap-2">
            <span>Paper Scraps Target</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${attachedCount === TOTAL_PAPERS ? 'bg-emerald-500 text-white font-black' : 'bg-slate-800 text-yellow-300 font-bold'}`}>
              {attachedCount}/{TOTAL_PAPERS} Attached
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Professor Zappy & Live Action Bar */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={attachedCount >= TOTAL_PAPERS ? 'celebrating' : isRubbing ? 'surprised' : 'idle'}
          staticHairCharge={charge}
        />

        {/* If completed, show clear quick action pills */}
        {isCompleted && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLearningChoice(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Experiment Options</span>
            </button>
            <button
              type="button"
              onClick={() => startLevel('level-2')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-1.5"
            >
              <span>Next Station →</span>
            </button>
          </div>
        )}
      </div>

      {/* OPTIONAL LEARNING MODAL (Clean prompt to choose what to do next) */}
      <OptionalLearningModal
        isOpen={showLearningChoice}
        levelTitle="The Paper Heist"
        onKeepExperimenting={() => setShowLearningChoice(false)}
        onLearnWhy={() => {
          setShowLearningChoice(false);
          setShowExplanation(true);
        }}
        onTryQuestion={() => {
          setShowLearningChoice(false);
          setShowPrediction(true);
        }}
        onNextLevel={() => startLevel('level-2')}
      />

      {/* OPTIONAL PREDICTION QUESTION (Only shown when explicitly chosen) */}
      <PredictionModal
        isOpen={showPrediction}
        question="You watched the paper jump against gravity and stick! What caused the neutral paper to fly up?"
        subtitle="Test your scientific hypothesis!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setDialogue(
            "BRILLIANT DEDUCTION! The ruler shifted the atomic charges inside the neutral paper—a phenomenon called induced polarization!",
            'celebrating'
          );
        }}
      />

      {/* SCIENCE EXPLANATION (Only shown when explicitly chosen) */}
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
                  onClick={() => setShowExplanation(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <p>
                  <strong>1. Friction transfers electrons:</strong> Rubbing the plastic ruler on the wool cloth caused electrons to move from the wool onto the plastic. The ruler gained extra electrons, becoming <em>negatively charged (−)</em>.
                </p>
                <p>
                  <strong>2. Neutral objects contain balanced charges:</strong> Paper pieces are neutral (equal positive protons and negative electrons), not empty of charges.
                </p>
                <p>
                  <strong>3. Induced Polarization:</strong> When the negative ruler approached, electrons inside the paper atoms were repelled slightly deeper. This left the side of the paper facing the ruler with a <em>relative positive charge</em>!
                </p>
                <p>
                  <strong>4. Attraction overcomes gravity:</strong> Because the closer positive side feels stronger attraction than the farther negative side feels repulsion, the paper leaps upward and clings to the ruler!
                </p>
              </div>

              <div className="p-3 bg-sky-950/80 rounded-xl border border-sky-600 text-xs text-sky-200 font-semibold">
                💡 <em>Core Law:</em> A neutral object does not need an overall net charge to be attracted—it only needs to rearrange its internal charges!
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
