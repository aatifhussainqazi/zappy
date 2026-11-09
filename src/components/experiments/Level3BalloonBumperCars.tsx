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
  CheckCircle2,
  Compass,
  Search
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { InvisibleWorldToggle } from '../ui/InvisibleWorldToggle';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { soundManager } from '../../utils/audio';

type ChargeSign = 'neutral' | 'negative' | 'positive';

interface SuspendedObject {
  id: 'A' | 'B';
  material: 'plastic' | 'glass';
  name: string;
  charge: ChargeSign;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
}

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-push',
    text: 'Like charges repel and push apart; opposite charges attract and pull together!',
    isCorrect: true,
    feedback: 'Spot on! Negative and negative repel, positive and positive repel, while positive and negative attract!',
  },
  {
    id: 'opt-random',
    text: 'Charges push and pull completely at random depending on the humidity.',
    isCorrect: false,
    feedback: 'Not random! Coulomb’s electrostatic law is universal and deterministic: likes always repel, opposites always attract.',
  },
  {
    id: 'opt-always-attract',
    text: 'All charged objects always attract each other no matter what.',
    isCorrect: false,
    feedback: 'Careful! When two objects share the same charge, their electric field lines push outward against each other!',
  },
];

export const Level3BalloonBumperCars: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [objectA, setObjectA] = useState<SuspendedObject>({
    id: 'A',
    material: 'plastic',
    name: 'Plastic Rod',
    charge: 'neutral',
    x: 230,
    y: 160,
    anchorX: 230,
    anchorY: 10,
  });

  const [objectB, setObjectB] = useState<SuspendedObject>({
    id: 'B',
    material: 'glass',
    name: 'Glass Rod',
    charge: 'neutral',
    x: 520,
    y: 160,
    anchorX: 520,
    anchorY: 10,
  });

  const [activeDragging, setActiveDragging] = useState<'A' | 'B' | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<'A' | 'B'>('A');
  const [witnessedRepulsion, setWitnessedRepulsion] = useState(false);
  const [witnessedAttraction, setWitnessedAttraction] = useState(false);

  // Modals
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setDialogue(
      "Case 03: The Invisible Tug-of-War! Rub the Plastic Rod with wool, or the Glass Rod with silk, and bring them close to discover what happens!",
      'excited'
    );
  }, []);

  // Material Charging actions
  const chargeObjectWithMaterial = (target: 'A' | 'B', material: 'wool' | 'silk' | 'ground') => {
    soundManager.playRubbing(0.7);
    soundManager.playSpark();

    if (material === 'ground') {
      if (target === 'A') setObjectA((prev) => ({ ...prev, charge: 'neutral' }));
      else setObjectB((prev) => ({ ...prev, charge: 'neutral' }));
      setDialogue(`Grounded ${target === 'A' ? 'Plastic Rod A' : 'Glass Rod B'}! Discharged back to neutral.`, 'thinking');
      return;
    }

    if (material === 'wool') {
      // Rubbing with wool transfers electrons onto the object -> negative (−)
      if (target === 'A') {
        setObjectA((prev) => ({ ...prev, charge: 'negative' }));
        setDialogue("Rubbed Plastic Rod A with Wool! Gained electrons, making it NEGATIVE (−)!", 'excited');
      } else {
        setObjectB((prev) => ({ ...prev, charge: 'negative' }));
        setDialogue("Rubbed Glass Rod B with Wool! Gained electrons, making it NEGATIVE (−)!", 'excited');
      }
    } else if (material === 'silk') {
      // Rubbing with silk pulls electrons away -> positive (+)
      if (target === 'B') {
        setObjectB((prev) => ({ ...prev, charge: 'positive' }));
        setDialogue("Rubbed Glass Rod B with Silk! Silk pulled electrons away, leaving it POSITIVE (+)! ", 'excited');
      } else {
        setObjectA((prev) => ({ ...prev, charge: 'positive' }));
        setDialogue("Rubbed Plastic Rod A with Silk! Lost electrons, leaving it POSITIVE (+)! ", 'excited');
      }
    }
  };

  const handlePointerDown = (id: 'A' | 'B', e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedTarget(id);
    if (!benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setActiveDragging(id);
    const target = id === 'A' ? objectA : objectB;
    dragOffset.current = { x: mouseX - target.x, y: mouseY - target.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragging || !benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const boundedX = Math.max(25, Math.min(rect.width - 110, mouseX - dragOffset.current.x));
    const boundedY = Math.max(40, Math.min(rect.height - 120, mouseY - dragOffset.current.y));

    const otherObj = activeDragging === 'A' ? objectB : objectA;
    let targetX = boundedX;
    let targetY = boundedY;

    // Electrostatic Force calculation
    const hasForce = objectA.charge !== 'neutral' && objectB.charge !== 'neutral';
    const isRepelling = hasForce && objectA.charge === objectB.charge;
    const isAttracting = hasForce && objectA.charge !== objectB.charge;

    const currentDist = Math.hypot(targetX - otherObj.x, targetY - otherObj.y);

    if (currentDist < 170 && hasForce) {
      if (isRepelling) {
        // Like charges push apart
        const pushAngle = Math.atan2(targetY - otherObj.y, targetX - otherObj.x);
        targetX = otherObj.x + Math.cos(pushAngle) * 170;
        targetY = otherObj.y + Math.sin(pushAngle) * 170;
        soundManager.playBoing();

        if (!witnessedRepulsion) {
          setWitnessedRepulsion(true);
          setDialogue("BOING! THEY PUSH AWAY! Like charges repel each other! Notice they refuse to touch!", 'surprised');
        }
      } else if (isAttracting && currentDist < 155) {
        // Opposite charges pull together
        soundManager.playAttract();

        if (!witnessedAttraction) {
          setWitnessedAttraction(true);
          setDialogue("ATTRACT! Look at them pull together! Opposite charges attract across empty space!", 'celebrating');
        }
      }
    }

    if (activeDragging === 'A') {
      setObjectA((prev) => ({ ...prev, x: targetX, y: targetY }));
    } else {
      setObjectB((prev) => ({ ...prev, x: targetX, y: targetY }));
    }
  };

  const handlePointerUp = () => {
    setActiveDragging(null);
  };

  // Proximity & Force Detection (fires also when rods are charged while already close)
  useEffect(() => {
    const hasForce = objectA.charge !== 'neutral' && objectB.charge !== 'neutral';
    const isRepelling = hasForce && objectA.charge === objectB.charge;
    const isAttracting = hasForce && objectA.charge !== objectB.charge;
    const currentDist = Math.hypot(objectB.x - objectA.x, objectB.y - objectA.y);

    if (currentDist < 170 && hasForce) {
      if (isRepelling && !witnessedRepulsion) {
        setWitnessedRepulsion(true);
        soundManager.playBoing();
        setDialogue("BOING! THEY PUSH AWAY! Like charges repel each other! Notice they refuse to touch!", 'surprised');
      } else if (isAttracting && currentDist < 155 && !witnessedAttraction) {
        setWitnessedAttraction(true);
        soundManager.playAttract();
        setDialogue("ATTRACT! Look at them pull together! Opposite charges attract across empty space!", 'celebrating');
      }
    }
  }, [objectA.x, objectA.y, objectA.charge, objectB.x, objectB.y, objectB.charge, witnessedRepulsion, witnessedAttraction, setDialogue]);

  // Reliable Completion Trigger: Runs immediately when both required objectives are satisfied
  useEffect(() => {
    if (witnessedRepulsion && witnessedAttraction && !isCompleted) {
      setIsCompleted(true);
      soundManager.playFanfare();
      completeLevel('level-3', 3, 220);

      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#0ea5e9', '#facc15', '#ef4444', '#10b981'],
      });

      setDialogue(
        "MYSTERY SOLVED! Like charges repel, opposite charges attract! You proved Coulomb's law! Choose what to explore next!",
        'celebrating'
      );

      const timer = setTimeout(() => {
        setShowLearningChoice(true);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [witnessedRepulsion, witnessedAttraction, isCompleted, completeLevel, setDialogue]);

  const resetExperiment = () => {
    soundManager.playClick();
    setObjectA((prev) => ({ ...prev, charge: 'neutral', x: 230, y: 160 }));
    setObjectB((prev) => ({ ...prev, charge: 'neutral', x: 520, y: 160 }));
    setSelectedTarget('A');
    setWitnessedRepulsion(false);
    setWitnessedAttraction(false);
    setShowLearningChoice(false);
    setShowPrediction(false);
    setShowExplanation(false);
    setIsCompleted(false);
    setDialogue(
      "Reset! Rub the rods with Wool or Silk and bring them together to observe repulsion and attraction!",
      'excited'
    );
  };

  const distBetween = Math.hypot(objectB.x - objectA.x, objectB.y - objectA.y) || 1;
  const hasForce = objectA.charge !== 'neutral' && objectB.charge !== 'neutral';
  const isRepelling = hasForce && objectA.charge === objectB.charge;
  const isAttracting = hasForce && objectA.charge !== objectB.charge;
  const forceIntensity = Math.min(1, Math.max(0, 1 - (distBetween - 80) / 240));

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
            #3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                CASE 03
              </span>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                The Invisible Tug-of-War
              </h1>
            </div>
            <p className="text-xs font-bold text-amber-300">
              {!witnessedRepulsion
                ? "Step 1: Charge both rods with Wool (−) and bring them close to test repulsion"
                : !witnessedAttraction
                ? "Step 2: Charge one rod with Silk (+) and bring them close to test attraction"
                : "Both laws discovered: Likes Repel & Opposites Attract! Case Complete!"}
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

      {/* Main Suspended Physics Laboratory Arena */}
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-purple-950/20 via-slate-900 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px] border-2 border-slate-700"
      >
        {/* Arena Top Status Banner */}
        <div className="absolute top-4 inset-x-8 flex justify-center z-20 pointer-events-none">
          <div className="bg-slate-950/90 border-2 border-slate-700 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-4 text-xs font-black">
            <span className={isRepelling ? 'text-rose-400 font-black' : 'text-slate-500'}>
              SAME CHARGES (− − or + +) = REPEL ⛔
            </span>
            <span className="text-slate-600">|</span>
            <span className={isAttracting ? 'text-pink-400 font-black' : 'text-slate-500'}>
              OPPOSITE CHARGES (+ −) = ATTRACT ❤️
            </span>
          </div>
        </div>

        {/* Dynamic Force Field Vector Indicator */}
        {hasForce && (
          <div className="absolute top-16 inset-x-8 flex justify-center z-20 pointer-events-none">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl flex items-center gap-2 text-[10px] font-bold text-slate-300">
              <span>Electrostatic Force F:</span>
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-100 ${
                    isRepelling ? 'bg-rose-500' : 'bg-pink-500'
                  }`}
                  style={{ width: `${forceIntensity * 100}%` }}
                />
              </div>
              <span className="font-mono text-yellow-300">
                {Math.round(forceIntensity * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Ceiling Suspension Strings SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line
            x1="260"
            y1="0"
            x2={objectA.x + 35}
            y2={objectA.y}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />
          <line
            x1="550"
            y1="0"
            x2={objectB.x + 35}
            y2={objectB.y}
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />

          {/* Electric Field Lines in Invisible World Mode */}
          {showInvisibleCharges && hasForce && (
            <path
              d={`M ${objectA.x + 35} ${objectA.y + 25} Q ${(objectA.x + objectB.x) / 2 + 35} ${
                isRepelling ? objectA.y - 45 : objectA.y + 70
              } ${objectB.x + 35} ${objectB.y + 25}`}
              fill="none"
              stroke={isRepelling ? '#f43f5e' : '#38bdf8'}
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          )}
        </svg>

        {/* SUSPENDED OBJECT A (Plastic Rod on Left) */}
        <div
          style={{
            position: 'absolute',
            left: `${objectA.x}px`,
            top: `${objectA.y}px`,
            touchAction: 'none',
          }}
          onPointerDown={(e) => handlePointerDown('A', e)}
          className={`w-20 sm:w-24 h-28 sm:h-32 cursor-grab active:cursor-grabbing z-20 flex flex-col items-center select-none rounded-2xl transition-all ${
            selectedTarget === 'A' ? 'ring-4 ring-yellow-400/90 shadow-[0_0_16px_#facc15]' : ''
          }`}
        >
          <div
            className={`w-full h-24 rounded-2xl border-2 shadow-xl flex flex-col items-center justify-center p-1 transition-all ${
              objectA.charge === 'negative'
                ? 'bg-sky-400 border-sky-200 shadow-[0_0_20px_#38bdf8] text-slate-950'
                : objectA.charge === 'positive'
                ? 'bg-rose-500 border-rose-300 shadow-[0_0_20px_#f43f5e] text-white'
                : 'bg-slate-700 border-slate-500 text-slate-300'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-center leading-tight">
              Plastic Rod A
            </span>
            <span className="text-xl my-1">
              {objectA.charge === 'negative' ? '⚡' : objectA.charge === 'positive' ? '✨' : '⚪'}
            </span>
            <span className="text-xs font-black">
              {objectA.charge === 'negative' ? 'Negative (−)' : objectA.charge === 'positive' ? 'Positive (+)' : 'Neutral (0)'}
            </span>
          </div>

          <span className="text-[9px] font-bold text-slate-400 mt-1">
            {selectedTarget === 'A' ? 'Active Target' : 'Object A'}
          </span>
        </div>

        {/* SUSPENDED OBJECT B (Glass Rod on Right) */}
        <div
          style={{
            position: 'absolute',
            left: `${objectB.x}px`,
            top: `${objectB.y}px`,
            touchAction: 'none',
          }}
          onPointerDown={(e) => handlePointerDown('B', e)}
          className={`w-20 sm:w-24 h-28 sm:h-32 cursor-grab active:cursor-grabbing z-20 flex flex-col items-center select-none rounded-2xl transition-all ${
            selectedTarget === 'B' ? 'ring-4 ring-yellow-400/90 shadow-[0_0_16px_#facc15]' : ''
          }`}
        >
          <div
            className={`w-full h-24 rounded-2xl border-2 shadow-xl flex flex-col items-center justify-center p-1 transition-all ${
              objectB.charge === 'negative'
                ? 'bg-sky-400 border-sky-200 shadow-[0_0_20px_#38bdf8] text-slate-950'
                : objectB.charge === 'positive'
                ? 'bg-rose-500 border-rose-300 shadow-[0_0_20px_#f43f5e] text-white'
                : 'bg-slate-700 border-slate-500 text-slate-300'
            }`}
          >
            <span className="text-[10px] font-black uppercase text-center leading-tight">
              Glass Rod B
            </span>
            <span className="text-xl my-1">
              {objectB.charge === 'negative' ? '⚡' : objectB.charge === 'positive' ? '✨' : '⚪'}
            </span>
            <span className="text-xs font-black">
              {objectB.charge === 'negative' ? 'Negative (−)' : objectB.charge === 'positive' ? 'Positive (+)' : 'Neutral (0)'}
            </span>
          </div>

          <span className="text-[9px] font-bold text-slate-400 mt-1">
            {selectedTarget === 'B' ? 'Active Target' : 'Object B'}
          </span>
        </div>

        {/* PHYSICAL CHARGING STATION WORKBENCH (Bottom Trays with Target Selection) */}
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-3 z-20 bg-slate-950/90 p-3 rounded-2xl border-2 border-slate-700">
          {/* Target Rod Selector Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Target Rod:</span>
            <button
              type="button"
              onClick={() => setSelectedTarget('A')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                selectedTarget === 'A'
                  ? 'bg-yellow-400 text-slate-950 comic-border-yellow shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Plastic Rod A ({objectA.charge === 'negative' ? '−' : objectA.charge === 'positive' ? '+' : '0'})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTarget('B')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                selectedTarget === 'B'
                  ? 'bg-yellow-400 text-slate-950 comic-border-yellow shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Glass Rod B ({objectB.charge === 'negative' ? '−' : objectB.charge === 'positive' ? '+' : '0'})
            </button>
          </div>

          {/* Charging Material Swatches */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Wool Swatch (Transfers electrons -> makes negative) */}
            <button
              type="button"
              onClick={() => chargeObjectWithMaterial(selectedTarget, 'wool')}
              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-amber-200 font-black text-xs rounded-xl comic-border comic-button flex items-center gap-1.5 shadow"
            >
              <span>🧶 Rub with Wool (−)</span>
            </button>

            {/* Silk Cloth (Pulls electrons -> makes positive) */}
            <button
              type="button"
              onClick={() => chargeObjectWithMaterial(selectedTarget, 'silk')}
              className="px-3 py-1.5 bg-pink-900 hover:bg-pink-800 text-pink-200 font-black text-xs rounded-xl comic-border comic-button flex items-center gap-1.5 shadow"
            >
              <span>🎀 Rub with Silk (+)</span>
            </button>

            {/* Grounding Pad (Discharges to neutral) */}
            <button
              type="button"
              onClick={() => chargeObjectWithMaterial(selectedTarget, 'ground')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs rounded-xl comic-border comic-button flex items-center gap-1.5 shadow"
            >
              <span>⏚ Ground (0)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Professor Zappy & Action Bar */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={witnessedRepulsion && witnessedAttraction ? 'celebrating' : 'excited'}
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
              onClick={() => startLevel('level-4')}
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
        levelTitle="The Invisible Tug-of-War"
        onKeepExperimenting={() => setShowLearningChoice(false)}
        onLearnWhy={() => {
          setShowLearningChoice(false);
          setShowExplanation(true);
        }}
        onTryQuestion={() => {
          setShowLearningChoice(false);
          setShowPrediction(true);
        }}
        onNextLevel={() => startLevel('level-4')}
      />

      {/* PREDICTION MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="You tested both configurations! What is the fundamental rule governing electric charges?"
        subtitle="Analyze your experimental observations!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
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
                  <Microscope className="w-6 h-6 text-yellow-400" />
                  <span>The Fundamental Law of Charges</span>
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
                  <strong>Two Types of Charge:</strong> There are only two types of electric charge in the known universe: <em>positive (+)</em> and <em>negative (−)</em>.
                </p>
                <p>
                  <strong>Like Charges Repel:</strong> When two negative objects or two positive objects approach, their invisible electric field lines push outward, forcing them apart like bumper cars!
                </p>
                <p>
                  <strong>Opposites Attract:</strong> When a positive and a negative charge approach, electric field lines loop directly between them, pulling them together tightly!
                </p>
                <p>
                  <strong>Inverse-Square Law:</strong> The closer the objects move, the force increases exponentially according to Coulomb's Law (F = k · |q₁ · q₂| / r²)!
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