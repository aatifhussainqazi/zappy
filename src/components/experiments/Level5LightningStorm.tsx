import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  Microscope, 
  Zap, 
  Wind,
  CloudRain,
  Flame,
  Volume2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { InvisibleWorldToggle } from '../ui/InvisibleWorldToggle';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { PredictionModal, type PredictionOption } from '../ui/PredictionModal';
import { soundManager } from '../../utils/audio';

type StormPhase = 'calm' | 'building' | 'striking';

interface StormParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'ice' | 'graupel';
  charge: 'positive' | 'negative';
}

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-lightning',
    text: 'Millions of colliding ice crystals separated positive and negative charges until a giant spark (lightning) jumped to the ground!',
    isCorrect: true,
    feedback: 'Spot on! Collisions between light ice crystals and heavy graupel separate massive electric charges inside thunderstorms!',
  },
  {
    id: 'opt-pop',
    text: 'The cloud popped like a giant soapy bubble from too much air pressure.',
    isCorrect: false,
    feedback: 'Clouds are made of trillions of tiny water droplets and ice particles—they do not pop like soap bubbles!',
  },
  {
    id: 'opt-freeze',
    text: 'The ground became frozen into solid ice from the ice particles.',
    isCorrect: false,
    feedback: 'Lightning creates extreme heat (over 30,000 Kelvin!), five times hotter than the surface of the Sun!',
  },
];

export const Level5LightningStorm: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, showInvisibleCharges, toggleInvisibleCharges, settings } = useGame();

  const [updraftSpeed, setUpdraftSpeed] = useState(20); // 0 to 50 m/s
  const [electricField, setElectricField] = useState(0); // 0 to 1 (Breakdown at 1.0)
  const [isStriking, setIsStriking] = useState(false);
  const [thunderDelay, setThunderDelay] = useState(2); // seconds
  const [isThunderRumbling, setIsThunderRumbling] = useState(false);

  // Modals
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Storm Particles (Ice crystals & Graupel)
  const [particles, setParticles] = useState<StormParticle[]>(() =>
    Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: 80 + (i % 8) * 75 + Math.random() * 20,
      y: 60 + Math.floor(i / 8) * 45 + Math.random() * 15,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      type: i % 2 === 0 ? 'ice' : 'graupel',
      charge: i % 2 === 0 ? 'positive' : 'negative',
    }))
  );

  useEffect(() => {
    soundManager.setMusicTrack('storm');
    setDialogue(
      "Case 05: The Sky's Giant Spark! Increase the storm updraft to sweep light ice crystals upward while heavy graupel sinks, building voltage until lightning arcs!",
      'excited'
    );

    return () => {
      soundManager.setMusicTrack('lab');
    };
  }, []);

  // Storm Simulation Loop
  useEffect(() => {
    if (isStriking || isCompleted) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => {
          // Updraft lifts lighter ice crystals toward cloud top, while graupel falls toward cloud base
          const targetY = p.type === 'ice'
            ? Math.max(30, p.y - (updraftSpeed * 0.08) + Math.random() * 2)
            : Math.min(220, p.y + (25 - updraftSpeed * 0.3) * 0.1 + Math.random() * 2);

          const nextX = Math.max(40, Math.min(760, p.x + p.vx));

          return {
            ...p,
            x: nextX,
            y: targetY,
          };
        })
      );

      // Charge separation increases when updraft is strong enough (> 25 m/s)
      if (updraftSpeed >= 25 && !isStriking) {
        setElectricField((prev) => {
          const delta = (updraftSpeed / 50) * 0.045;
          const next = Math.min(1, prev + delta);

          if (next >= 1 && prev < 1 && !isStriking) {
            triggerDischarge();
          }
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [updraftSpeed, isStriking, isCompleted]);

  const triggerDischarge = () => {
    setIsStriking(true);
    soundManager.playSpark();

    // After brief flash, play delayed thunder boom!
    setTimeout(() => {
      soundManager.playThunder(settings.reducedFlash);
      setIsThunderRumbling(true);
      setTimeout(() => setIsThunderRumbling(false), 2000);
    }, thunderDelay * 600);

    setTimeout(() => {
      setIsStriking(false);
      setIsCompleted(true);
      completeLevel('level-5', 3, 250);

      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#38bdf8', '#facc15', '#ffffff', '#a855f7'],
      });

      setDialogue(
        "KABOOOOM! AIR BREAKDOWN ACHIEVED! A blinding stepped leader connected to the upward streamer! Choose what to explore next!",
        'celebrating'
      );

      setTimeout(() => {
        setShowLearningChoice(true);
      }, 900);
    }, 700);
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setUpdraftSpeed(20);
    setElectricField(0);
    setIsStriking(false);
    setIsThunderRumbling(false);
    setShowLearningChoice(false);
    setShowPrediction(false);
    setShowExplanation(false);
    setIsCompleted(false);
    setDialogue(
      "Reset! Adjust the updraft slider to separate ice particles and build electric field potential!",
      'excited'
    );
  };

  return (
    <div
      className={`relative min-h-[calc(100vh-65px)] bg-slate-950 p-3 sm:p-6 overflow-hidden select-none flex flex-col justify-between transition-colors duration-150 ${
        isStriking && !settings.reducedFlash ? 'bg-slate-100' : ''
      }`}
    >
      {/* Reduced flash soft glow overlay */}
      {isStriking && settings.reducedFlash && (
        <div className="absolute inset-0 bg-yellow-300/30 pointer-events-none z-50 animate-pulse" />
      )}

      {/* Top Objective Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg shadow">
            #5
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                CASE 05
              </span>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                The Sky's Giant Spark
              </h1>
            </div>
            <p className="text-xs font-bold text-amber-300">
              {electricField < 1
                ? `Step 1: Increase updraft to build electric field! (${Math.round(electricField * 100)}% Breakdown)`
                : "Air ionization reached! Massive lightning strike discharge!"}
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

      {/* Main Atmospheric Thundercloud Arena */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-slate-900 via-sky-950/40 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px] border-2 border-slate-700 flex flex-col justify-between">
        {/* Thunderstorm rain & cloud backdrop */}
        <div className="absolute inset-x-8 top-6 h-56 bg-slate-800/90 rounded-full blur-sm border-2 border-slate-600 shadow-2xl pointer-events-none" />

        {/* Breakdown Potential Gauge HUD */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-2xl shadow-xl flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase font-black text-sky-400 tracking-wider">
              Breakdown Electric Field
            </span>
            <div className="w-36 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-150 ${
                  electricField >= 0.85 ? 'bg-rose-500 animate-pulse' : 'bg-yellow-400'
                }`}
                style={{ width: `${electricField * 100}%` }}
              />
            </div>
            <span className="font-mono text-xs text-yellow-300 font-bold">
              {(electricField * 3.2).toFixed(1)} MV/m (Max 3.0)
            </span>
          </div>

          {/* Thunder delayed rumble indicator */}
          {isThunderRumbling && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-amber-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shadow flex items-center gap-1.5 animate-bounce"
            >
              <Volume2 className="w-4 h-4" />
              <span>BOOOOM! Sonic Shockwave Heard!</span>
            </motion.div>
          )}
        </div>

        {/* THUNDERCLOUD CUTAWAY CHARGE REGIONS */}
        <div className="relative z-10 w-full h-64 pointer-events-none">
          {/* Anvil Top: Positive (+) Ice Region */}
          <div className="absolute top-2 left-16 right-16 flex items-center justify-between text-[10px] font-black text-rose-400 bg-rose-950/40 px-4 py-1 rounded-full border border-rose-800/40">
            <span>UPPER ANVIL (+ + + + +)</span>
            <span>Sub-zero Ice Crystals</span>
          </div>

          {/* Cloud Base: Negative (−) Graupel Region */}
          <div className="absolute bottom-2 left-16 right-16 flex items-center justify-between text-[10px] font-black text-sky-400 bg-sky-950/60 px-4 py-1 rounded-full border border-sky-800/40">
            <span>CLOUD BASE (− − − − −)</span>
            <span>Heavy Hail & Graupel</span>
          </div>

          {/* Drifting Collision Particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}px`,
                top: `${p.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow transition-transform ${
                p.type === 'ice'
                  ? 'bg-rose-500 text-white border border-rose-200'
                  : 'bg-sky-400 text-slate-950 border border-sky-100'
              }`}
            >
              {p.type === 'ice' ? '+' : '−'}
            </div>
          ))}
        </div>

        {/* GROUND WITH INDUCED POSITIVE CHARGE */}
        <div className="relative z-10 w-full h-24 bg-gradient-to-t from-emerald-950 to-slate-900 rounded-2xl border-t-2 border-emerald-600/50 flex items-center justify-between px-6 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌲</span>
            <div>
              <div className="text-xs font-black text-emerald-400">GROUND SURFACE</div>
              <div className="text-[10px] text-rose-400 font-bold">
                Induced Positive (+) Surface Charge
              </div>
            </div>
          </div>

          {/* Lightning rod on roof */}
          <div className="flex items-center gap-2">
            <div className="text-3xl">🏠</div>
            <div className="w-1 h-12 bg-yellow-400 border border-yellow-200 shadow" />
          </div>
        </div>

        {/* REALISTIC LIGHTNING BOLT SVG DURING STRIKE */}
        {isStriking && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-40">
            <polyline
              points="400,60 410,130 380,180 430,260 410,340 450,400"
              fill="none"
              stroke="#fef08a"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <polyline
              points="400,60 410,130 380,180 430,260 410,340 450,400"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Stepped leader branches */}
            <polyline
              points="410,130 450,160 460,200"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
            />
            <polyline
              points="380,180 340,220 330,250"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
            />
          </svg>
        )}

        {/* UPDRAFT CONTROL INTERACTIVE SLIDER (Bottom Workbench) */}
        <div className="relative z-20 bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-sky-400" />
            <div>
              <div className="text-xs font-black text-white">
                Storm Updraft Velocity
              </div>
              <div className="text-[10px] text-slate-400">
                Faster updraft lifts ice, driving collision charge separation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="range"
              min="0"
              max="50"
              value={updraftSpeed}
              onChange={(e) => setUpdraftSpeed(Number(e.target.value))}
              className="w-full sm:w-48 accent-yellow-400 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-yellow-300 w-16 text-right">
              {updraftSpeed} m/s
            </span>
          </div>

          <button
            type="button"
            onClick={() => setUpdraftSpeed(45)}
            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl comic-border-yellow comic-button shadow flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Maximum Updraft</span>
          </button>
        </div>
      </div>

      {/* Bottom Professor Zappy & Action Bar */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={isStriking || isCompleted ? 'celebrating' : 'excited'}
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
              onClick={() => startLevel('level-6')}
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
        levelTitle="The Sky's Giant Spark"
        onKeepExperimenting={() => setShowLearningChoice(false)}
        onLearnWhy={() => {
          setShowLearningChoice(false);
          setShowExplanation(true);
        }}
        onTryQuestion={() => {
          setShowLearningChoice(false);
          setShowPrediction(true);
        }}
        onNextLevel={() => startLevel('level-6')}
      />

      {/* PREDICTION MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="You witnessed a blinding static lightning discharge! What caused this giant spark to jump through the sky?"
        subtitle="Analyze your experimental observation!"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setDialogue("BRILLIANT! Colliding ice crystals create massive charge separation until millions of volts ionize the air!", 'celebrating');
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
                  <span>The Science of Storms & Lightning</span>
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
                  <strong>How charges separate:</strong> In storm updrafts, lighter ice crystals collide with heavier slush/graupel. The ice crystals lose electrons (becoming positive and rising to the cloud top), while the graupel gains electrons (becoming negative and sinking to the cloud base).
                </p>
                <p>
                  <strong>Stepped leader meets streamer:</strong> When the voltage difference reaches tens of millions of volts, a branching path of ionized air called a stepped leader shoots down, meeting an upward streamer from the ground.
                </p>
                <p>
                  <strong>Why does thunder rumble?</strong> Lightning heats the surrounding air channel to roughly 30,000 K (5 times hotter than the Sun's surface!). This explosive expansion creates the sonic shockwave we hear as thunder!
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