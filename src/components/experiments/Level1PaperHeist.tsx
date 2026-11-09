import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Info, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Eye, 
  Microscope,
  Zap,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { InvisibleWorldToggle } from '../ui/InvisibleWorldToggle';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { soundManager } from '../../utils/audio';

const TOTAL_PAPERS = 6;

type PaperState = 'table' | 'twitching' | 'attached' | 'in_jar';

interface PaperItem {
  id: number;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  rotation: number;
  state: PaperState;
  color: string;
}

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-polarize',
    text: 'The paper pieces jump because the ruler shifts their atomic electrons away, inducing a positive charge on the near side!',
    isCorrect: true,
    feedback: 'Spot on! The negative ruler pushes electrons inside paper atoms deeper, leaving the positive surface closer and strongly attracted!',
  },
  {
    id: 'opt-sticky-air',
    text: 'Static electricity turns the air between the ruler and desk into a sticky magnetic glue.',
    isCorrect: false,
    feedback: 'Not glue! It is Coulomb’s electrostatic force between opposite electrical charges acting across empty air.',
  },
  {
    id: 'opt-empty',
    text: 'Paper has no electrical charges whatsoever, so it gets pulled by pure gravity.',
    isCorrect: false,
    feedback: 'All matter is built of atoms with protons and electrons! Neutral paper contains billions of balanced charges.',
  },
];

export const Level1PaperHeist: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [charge, setCharge] = useState(0); // 0 to 1
  const [rubStrokes, setRubStrokes] = useState(0);
  const [strokeChallengeActive, setStrokeChallengeActive] = useState(false);
  const [rulerPos, setRulerPos] = useState({ x: 300, y: 70 });
  const [isDraggingRuler, setIsDraggingRuler] = useState(false);
  const [isRubbingWool, setIsRubbingWool] = useState(false);

  // Modals & Panels
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showAtomCloseUp, setShowAtomCloseUp] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const lastRubDir = useRef<'up' | 'down' | null>(null);

  // Initialize scattered paper pieces
  const [papers, setPapers] = useState<PaperItem[]>(() => {
    const colors = ['#fef08a', '#fed7aa', '#bae6fd', '#e9d5ff', '#bbf7d0', '#fbcfe8'];
    return Array.from({ length: TOTAL_PAPERS }).map((_, i) => ({
      id: i,
      initialX: 300 + (i % 3) * 65 + Math.random() * 20,
      initialY: 310 + Math.floor(i / 3) * 45 + Math.random() * 12,
      currentX: 300 + (i % 3) * 65 + Math.random() * 20,
      currentY: 310 + Math.floor(i / 3) * 45 + Math.random() * 12,
      rotation: Math.random() * 40 - 20,
      state: 'table',
      color: colors[i % colors.length],
    }));
  });

  useEffect(() => {
    setDialogue(
      "Case 01: The Paper Heist! Rub the ruler against the wool cloth to gather negative electrons, pick up the paper, and drop them into the glass jar!",
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

    // Keep ruler safely inside workbench
    const newX = Math.max(10, Math.min(rect.width - 210, mouseX - dragOffset.current.x));
    const newY = Math.max(10, Math.min(rect.height - 70, mouseY - dragOffset.current.y));

    setRulerPos({ x: newX, y: newY });

    // Wool Cloth zone: left 20px to 230px, top 40px to 270px
    const rulerCenterX = newX + 100;
    const rulerCenterY = newY + 25;
    const isOverWool = rulerCenterX >= 25 && rulerCenterX <= 235 && rulerCenterY >= 40 && rulerCenterY <= 275;

    // Physical Rubbing Detection
    if (isOverWool && lastPointerPos.current) {
      const dy = e.clientY - lastPointerPos.current.y;
      const moveDist = Math.abs(dy);

      if (moveDist > 6) {
        setIsRubbingWool(true);
        const currentDir = dy > 0 ? 'down' : 'up';

        // Count a stroke when rubbing direction changes
        if (lastRubDir.current && lastRubDir.current !== currentDir) {
          setRubStrokes((s) => s + 1);
        }
        lastRubDir.current = currentDir;

        setCharge((prev) => {
          const next = Math.min(1, prev + moveDist * 0.0028);
          soundManager.playRubbing(0.7);
          soundManager.playChargeHum(next);

          if (next >= 0.75 && prev < 0.75) {
            setDialogue(
              "EXCELLENT! Ruler is heavily charged with extra electrons! Bring it down near the scattered paper!",
              'excited'
            );
          }
          return next;
        });
      }
    } else {
      setIsRubbingWool(false);
    }

    lastPointerPos.current = { x: e.clientX, y: e.clientY };

    // Glass Jar drop zone: right boundary (approx x: rect.width - 170 to rect.width - 20)
    const jarLeft = rect.width - 180;
    const jarTop = rect.height - 210;
    const isOverJar = rulerCenterX >= jarLeft - 15 && rulerCenterX <= rect.width - 15 && newY <= jarTop + 60;

    const rulerBottom = newY + 50;

    // Paper attraction and attachment logic
    setPapers((prevPapers) => {
      let newlyAttached = false;
      let jarCount = 0;

      const updated = prevPapers.map((paper, idx) => {
        // If already deposited in the jar, it stays settled in the jar bottom
        if (paper.state === 'in_jar') {
          jarCount++;
          return paper;
        }

        // If attached to ruler, it follows the ruler's movement
        if (paper.state === 'attached') {
          // If ruler is positioned directly over jar opening, drop the paper into the jar!
          if (isOverJar) {
            soundManager.playPaperFlutter();
            soundManager.playPop();
            jarCount++;
            return {
              ...paper,
              state: 'in_jar' as PaperState,
              currentX: jarLeft + 25 + (idx % 3) * 28 + Math.random() * 8,
              currentY: jarTop + 85 + Math.floor(idx / 3) * 25 + Math.random() * 6,
              rotation: Math.random() * 50 - 25,
            };
          }

          // Follow the ruler bottom
          return {
            ...paper,
            currentX: newX + 20 + idx * 26,
            currentY: rulerBottom - 8 + (idx % 2) * 5,
          };
        }

        // Table paper interaction based on distance and charge
        if (charge >= 0.65) {
          const dist = Math.hypot(paper.initialX - rulerCenterX, paper.initialY - rulerBottom);

          if (dist < 130) {
            // When close enough, paper leaps to the ruler!
            if (dist < 65) {
              soundManager.playPaperFlutter();
              soundManager.playPop();
              newlyAttached = true;
              return {
                ...paper,
                state: 'attached' as PaperState,
                currentX: newX + 20 + idx * 26,
                currentY: rulerBottom - 8,
                rotation: Math.random() * 30 - 15,
              };
            }

            // Twitching / lifting pre-jump
            return {
              ...paper,
              state: 'twitching' as PaperState,
              currentY: paper.initialY - (130 - dist) * 0.22,
              rotation: paper.rotation + (Math.random() * 8 - 4),
            };
          }
        }

        return {
          ...paper,
          state: 'table' as PaperState,
          currentY: paper.initialY,
        };
      });

      // Completion check: when all required papers have reached the jar!
      if (jarCount >= TOTAL_PAPERS && !isCompleted) {
        setIsCompleted(true);
        soundManager.playFanfare();
        completeLevel('level-1', 3, 200);

        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#facc15', '#ef4444', '#10b981'],
        });

        setDialogue(
          "MISSION ACCOMPLISHED! All papers safely collected in the jar without physical contact! Choose what to explore next!",
          'celebrating'
        );

        setTimeout(() => {
          setShowLearningChoice(true);
        }, 700);
      }

      return updated;
    });
  };

  const handlePointerUp = () => {
    setIsDraggingRuler(false);
    setIsRubbingWool(false);
    lastPointerPos.current = null;
  };

  const resetExperiment = (fewerStrokesChallenge = false) => {
    soundManager.playClick();
    setCharge(0);
    setRubStrokes(0);
    setStrokeChallengeActive(fewerStrokesChallenge);
    setIsDraggingRuler(false);
    setIsRubbingWool(false);
    setIsCompleted(false);
    setShowLearningChoice(false);
    setShowPrediction(false);
    setShowAtomCloseUp(false);
    setRulerPos({ x: 300, y: 70 });
    setPapers((prev) =>
      prev.map((p) => ({
        ...p,
        state: 'table',
        currentX: p.initialX,
        currentY: p.initialY,
      }))
    );
    setDialogue(
      fewerStrokesChallenge
        ? "CHALLENGE ACTIVE: Collect all paper using the fewest rubbing strokes! Rub with long, deliberate motions!"
        : "Reset! Pick up the ruler, rub it on the wool cloth, and drop the papers into the jar!",
      'excited'
    );
  };

  const attachedCount = papers.filter((p) => p.state === 'attached').length;
  const inJarCount = papers.filter((p) => p.state === 'in_jar').length;

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
            #1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                CASE 01
              </span>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                The Paper Heist
              </h1>
            </div>
            <p className="text-xs font-bold text-amber-300">
              {charge < 0.7
                ? "Step 1: Rub ruler on wool cloth to gather negative electrons"
                : inJarCount < TOTAL_PAPERS
                ? `Step 2: Attract paper (${attachedCount} attached) and move ruler over the jar to drop them! (${inJarCount}/${TOTAL_PAPERS} in jar)`
                : "All paper pieces collected into the jar! Case Solved!"}
            </p>
          </div>
        </div>

        {/* Top Controls: Invisible World Switch, Microscope & Reset */}
        <div className="flex items-center gap-2">
          <InvisibleWorldToggle
            active={showInvisibleCharges}
            onToggle={toggleInvisibleCharges}
          />

          <button
            type="button"
            onClick={() => setShowAtomCloseUp(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-xs rounded-xl comic-border comic-button flex items-center gap-1.5"
            title="See Microscopic Atomic View"
          >
            <Microscope className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Atom Close-Up</span>
          </button>

          <button
            type="button"
            onClick={() => resetExperiment(false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl comic-border comic-button"
            title="Reset Experiment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tabletop Workbench */}
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-amber-950/25 via-slate-900 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px] border-2 border-slate-700"
      >
        {/* Wood grain desk overlay */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-amber-900/30 to-transparent border-t-2 border-amber-800/20 pointer-events-none" />

        {/* Charge Meter HUD Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          <ChargeMeter
            charge={charge}
            polarity="negative"
            label="Ruler Charge (−)"
            showNeedle={true}
          />
          <div className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-black text-slate-300 flex items-center gap-1.5">
            <span>Rubbing Strokes:</span>
            <span className="text-yellow-400 text-xs font-bold">{rubStrokes}</span>
          </div>
        </div>

        {/* WOOL CLOTH (Friction Target on Left) */}
        <div className="absolute left-6 sm:left-10 top-12 w-48 sm:w-56 h-48 sm:h-56 rounded-3xl bg-gradient-to-br from-amber-800 to-amber-900 border-4 border-amber-600 comic-border-lg p-3 flex flex-col justify-between shadow-xl pointer-events-none">
          <div className="bg-amber-950/90 text-amber-200 text-center font-black text-xs py-1 px-2 rounded-xl border border-amber-700/60">
            WOOL CLOTH
          </div>

          {/* Wool fibers & electron donors */}
          <div className="relative flex-1 flex flex-wrap items-center justify-center p-2 gap-1.5">
            {showInvisibleCharges && (
              <div className="text-[10px] font-black text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40">
                Electron Donors (+)
              </div>
            )}
            <div className="text-3xl opacity-30">🧶</div>
          </div>

          <div className="text-[10px] text-amber-300 text-center font-bold">
            {isRubbingWool ? "Rubbing detected! Transfers electrons!" : "Rub ruler back & forth here"}
          </div>
        </div>

        {/* TRANSPARENT GLASS COLLECTION JAR (Target on Right) */}
        <div className="absolute right-6 sm:right-10 bottom-6 w-36 sm:w-44 h-52 sm:h-60 rounded-3xl bg-sky-950/30 border-4 border-sky-400/60 backdrop-blur-sm shadow-2xl flex flex-col justify-between p-2 pointer-events-none z-10">
          <div className="bg-sky-950/80 text-sky-300 text-center font-black text-[10px] py-1 px-1.5 rounded-xl border border-sky-600/40">
            COLLECTION JAR ({inJarCount}/{TOTAL_PAPERS})
          </div>

          <div className="text-center text-[10px] font-bold text-sky-200/80">
            Bring ruler over rim to drop paper!
          </div>
        </div>

        {/* SCATTERED PAPER PIECES (Interactive Items) */}
        {papers.map((paper) => (
          <motion.div
            key={paper.id}
            className={`w-7 sm:w-9 h-7 sm:h-9 rounded-lg border-2 shadow-md flex items-center justify-center font-black text-[10px] cursor-default pointer-events-none z-20 ${
              paper.state === 'attached'
                ? 'border-yellow-400 shadow-[0_0_10px_#facc15]'
                : paper.state === 'in_jar'
                ? 'border-sky-300 opacity-90'
                : 'border-amber-300'
            }`}
            style={{
              position: 'absolute',
              left: `${paper.currentX}px`,
              top: `${paper.currentY}px`,
              transform: `rotate(${paper.rotation}deg)`,
              backgroundColor: paper.color,
            }}
          >
            <span className="text-slate-800">📄</span>

            {/* Microscopic Induced Dipole Overlay in Invisible World View */}
            {showInvisibleCharges && paper.state !== 'in_jar' && (
              <div className="absolute -top-3 -bottom-3 inset-x-0 flex flex-col justify-between items-center pointer-events-none text-[8px] font-black">
                <span className="text-rose-600 bg-white/90 rounded-full px-0.5 shadow leading-none">+</span>
                <span className="text-sky-600 bg-white/90 rounded-full px-0.5 shadow leading-none">−</span>
              </div>
            )}
          </motion.div>
        ))}

        {/* THE DRAGGABLE PLASTIC RULER */}
        <div
          style={{
            position: 'absolute',
            left: `${rulerPos.x}px`,
            top: `${rulerPos.y}px`,
            touchAction: 'none',
          }}
          onPointerDown={handleRulerPointerDown}
          className={`w-48 sm:w-56 h-12 sm:h-14 rounded-2xl cursor-grab active:cursor-grabbing z-30 transition-shadow select-none comic-border ${
            charge >= 0.75
              ? 'bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.7)] border-sky-100'
              : 'bg-gradient-to-r from-sky-200 to-sky-300 border-sky-400 shadow-xl'
          }`}
        >
          {/* Ruler measurement tick lines */}
          <div className="absolute inset-x-2 top-0 h-2 flex justify-between pointer-events-none">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`w-0.5 bg-sky-800/60 ${i % 4 === 0 ? 'h-3' : 'h-1.5'}`}
              />
            ))}
          </div>

          <div className="h-full flex items-center justify-between px-3 text-slate-900 font-black text-xs pointer-events-none">
            <span className="truncate">PLASTIC RULER</span>
            <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono">
              {Math.round(charge * 100)}%
            </span>
          </div>

          {/* Negative Electron Particles Overlay */}
          {showInvisibleCharges && charge > 0.08 && (
            <div className="absolute inset-x-2 bottom-1 flex justify-around pointer-events-none">
              {Array.from({ length: Math.min(10, Math.floor(charge * 11)) }).map((_, i) => (
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
      </div>

      {/* Bottom Professor Zappy & Action Bar */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={inJarCount >= TOTAL_PAPERS ? 'celebrating' : isRubbingWool ? 'excited' : 'thinking'}
        />

        <div className="flex items-center gap-2">
          {isCompleted && (
            <>
              <button
                type="button"
                onClick={() => resetExperiment(true)}
                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button shadow-lg flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>Challenge: Fewer Strokes!</span>
              </button>
              <button
                type="button"
                onClick={() => startLevel('level-2')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-1.5"
              >
                <span>Next Case →</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* OPTIONAL LEARNING MODAL */}
      <OptionalLearningModal
        isOpen={showLearningChoice}
        levelTitle="The Paper Heist"
        onKeepExperimenting={() => setShowLearningChoice(false)}
        onLearnWhy={() => {
          setShowLearningChoice(false);
          setShowAtomCloseUp(true);
        }}
        onTryQuestion={() => {
          setShowLearningChoice(false);
          setShowPrediction(true);
        }}
        onNextLevel={() => startLevel('level-2')}
      />

      {/* OPTIONAL PREDICTION MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="You watched the paper jump against gravity into the jar! What caused the neutral paper to fly up?"
        subtitle="Analyze your experimental observation!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setDialogue(
            "BRILLIANT DEDUCTION! The ruler shifted the atomic charges inside the neutral paper—a phenomenon called induced polarization!",
            'celebrating'
          );
        }}
      />

      {/* MICROSCOPIC ATOMIC CLOSE-UP MODAL (The Invisible Science Explained) */}
      <AnimatePresence>
        {showAtomCloseUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-4 border-sky-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full comic-border-lg text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-2">
                  <Microscope className="w-6 h-6 text-sky-400" />
                  <span>The Invisible Science: Inside the Atom</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAtomCloseUp(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>

              {/* Visual Diagram of Induced Polarization */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center gap-3">
                <div className="w-48 h-8 rounded-lg bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow">
                  <span>RULER</span>
                  <span>(− − − − −)</span>
                </div>

                <div className="text-sky-400 font-bold text-xs flex items-center gap-1">
                  <span>↓ Invisible Attraction Force ↓</span>
                </div>

                <div className="w-44 p-3 rounded-2xl bg-amber-50 text-slate-900 border-2 border-amber-300 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 rounded-full border border-rose-300">
                    + Clcloser positive atomic cores +
                  </div>
                  <div className="text-xs font-black text-slate-700">
                    NEUTRAL PAPER ATOM
                  </div>
                  <div className="text-[10px] font-black text-sky-600 bg-sky-100 px-2 rounded-full border border-sky-300">
                    − Repelled electrons pushed deeper −
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <p>
                  <strong>1. Friction transfers electrons:</strong> Rubbing the plastic ruler on the wool cloth stripped loosely bound electrons from the wool onto the plastic. The ruler gained excess electrons (−).
                </p>
                <p>
                  <strong>2. Paper is neutral overall:</strong> The paper never gained or lost total electrons. It contains billions of positive protons and negative electrons.
                </p>
                <p>
                  <strong>3. Induced Surface Polarization:</strong> As the negative ruler approaches, electrons inside the paper atoms are repelled slightly downward. This leaves the near surface with a net positive charge!
                </p>
                <p>
                  <strong>4. Electrostatic attraction wins:</strong> Because opposite charges are closer together than like charges are, the attractive force overcomes gravity and pulls the paper upward!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAtomCloseUp(false)}
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