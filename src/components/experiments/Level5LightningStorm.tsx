import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Info, ArrowRight, Sparkles, CloudRain, Zap, CloudLightning } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ChargeMeter } from '../ui/ChargeMeter';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { PredictionModal, PredictionOption } from '../ui/PredictionModal';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

interface CloudParticle {
  id: number;
  x: number;
  y: number;
  type: 'ice' | 'graupel'; // ice = positive top, graupel = negative bottom
  isColliding: boolean;
}

const PREDICTION_OPTIONS: PredictionOption[] = [
  {
    id: 'opt-lightning',
    text: 'A massive static electric spark (lightning) will jump from cloud to ground!',
    isCorrect: true,
    feedback: 'Spot on! When the voltage difference reaches millions of volts, static electricity breaks through the air as lightning!',
  },
  {
    id: 'opt-pop',
    text: 'The cloud will pop like a soap bubble and disappear.',
    isCorrect: false,
    feedback: 'Clouds are made of trillions of tiny droplets and ice crystals—they don’t pop like soap bubbles!',
  },
  {
    id: 'opt-freeze',
    text: 'The ground will instantly freeze into solid ice.',
    isCorrect: false,
    feedback: 'Lightning creates unbelievable heat (over 30,000 Kelvin!), definitely not freezing!',
  },
];

export const Level5LightningStorm: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges, settings } = useGame();

  const [stormCharge, setStormCharge] = useState(0); // 0 to 1
  const [isStriking, setIsStriking] = useState(false);
  const [strikeCount, setStrikeCount] = useState(0);

  const [showPrediction, setShowPrediction] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Cloud particles
  const [particles, setParticles] = useState<CloudParticle[]>(() =>
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: 180 + (i % 6) * 70 + Math.random() * 20,
      y: 90 + Math.floor(i / 6) * 35 + Math.random() * 15,
      type: i % 2 === 0 ? 'ice' : 'graupel',
      isColliding: false,
    }))
  );

  const [activeParticleId, setActiveParticleId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    soundManager.setMusicTrack('storm');
    setDialogue(
      "Experiment 5: The Sky's Giant Spark! Drag ice crystals inside the thundercloud to collide them and separate massive electric charges!",
      'excited'
    );
    return () => {
      soundManager.setMusicTrack('lab');
    };
  }, []);

  const triggerLightningStrike = () => {
    setIsStriking(true);
    soundManager.playThunder(settings.reducedFlash);
    setDialogue("KA-BOOOOM! A GIANT STATIC SPARK! Stepped leader meets upward streamer!", 'surprised');
    setStrikeCount((c) => c + 1);

    setTimeout(() => {
      setIsStriking(false);
      if (!isCompleted) {
        setIsCompleted(true);
      }
    }, 700);
  };

  const handlePointerDown = (id: number) => {
    setActiveParticleId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeParticleId === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    setParticles((prev) => {
      return prev.map((p) => {
        if (p.id === activeParticleId) {
          return { ...p, x: newX, y: newY };
        }

        // Check collision between active particle and other particles
        const dist = Math.hypot(p.x - newX, p.y - newY);
        if (dist < 40 && !p.isColliding) {
          soundManager.playSpark();
          setStormCharge((sc) => {
            const nextSc = Math.min(1, sc + 0.07);
            if (nextSc > 0.5 && !hasPredicted && !showPrediction) {
              setShowPrediction(true);
            }
            if (nextSc >= 1 && !isStriking) {
              triggerLightningStrike();
            }
            return nextSc;
          });
          return { ...p, isColliding: true };
        }
        return { ...p, isColliding: false };
      });
    });
  };

  const handlePointerUp = () => {
    setActiveParticleId(null);
  };

  const resetExperiment = () => {
    soundManager.playClick();
    setStormCharge(0);
    setIsStriking(false);
    setDialogue("Reset! Stir up the ice crystals to build another thunderstorm!", 'excited');
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-6 overflow-hidden select-none flex flex-col justify-between transition-colors duration-100 ${
        isStriking && !settings.reducedFlash ? 'bg-slate-100' : ''
      }`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Reduced flash soft glow overlay */}
      {isStriking && settings.reducedFlash && (
        <div className="absolute inset-0 bg-yellow-300/30 pointer-events-none z-50 animate-pulse" />
      )}

      {/* Screen Shake effect on strike */}
      <motion.div
        className="w-full h-full flex flex-col justify-between"
        animate={
          isStriking && !settings.reducedMotion
            ? { x: [-12, 12, -8, 8, 0], y: [8, -8, 6, -6, 0] }
            : {}
        }
        transition={{ duration: 0.4 }}
      >
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg">
              #5
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
                The Sky's Giant Spark
              </h1>
              <p className="text-xs font-bold text-sky-400">
                Objective: Collide ice particles to separate cloud charges and trigger a lightning strike!
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

        {/* Storm Sky & Landscape Scene */}
        <div className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[460px]">
          {/* Storm Charge Meter HUD */}
          <div className="absolute top-4 left-4 z-20">
            <ChargeMeter
              charge={stormCharge}
              polarity="negative"
              label="Atmospheric Voltage"
              showNeedle={true}
            />
          </div>

          {/* Legend */}
          {showInvisibleCharges && (
            <div className="absolute top-4 left-64 z-20 hidden md:block">
              <ParticleLegend />
            </div>
          )}

          {/* Rain streaks */}
          <div className="absolute inset-0 pointer-events-none opacity-30 overflow-hidden">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-6 bg-sky-400 rotate-12"
                style={{
                  left: `${(i * 17) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                }}
              />
            ))}
          </div>

          {/* TOWERING THUNDERCLOUD (Cumulonimbus) */}
          <div className="relative mx-auto w-full max-w-2xl h-56 mt-4">
            {/* Cloud SVG Body (darkens as stormCharge increases) */}
            <svg width="100%" height="220" viewBox="0 0 600 220" className="overflow-visible">
              <defs>
                <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={stormCharge > 0.6 ? '#334155' : '#64748b'}
                  />
                  <stop
                    offset="100%"
                    stopColor={stormCharge > 0.6 ? '#0f172a' : '#1e293b'}
                  />
                </linearGradient>
              </defs>

              {/* Massive Cumulonimbus Puffs */}
              <ellipse cx="300" cy="110" rx="260" ry="85" fill="url(#cloudGrad)" stroke="#0f172a" strokeWidth="4" />
              <circle cx="180" cy="80" r="75" fill="url(#cloudGrad)" />
              <circle cx="320" cy="60" r="90" fill="url(#cloudGrad)" />
              <circle cx="440" cy="85" r="70" fill="url(#cloudGrad)" />

              {/* Cloud Charge Separation Regions (Positive at Top, Negative at Bottom) */}
              {showInvisibleCharges && (
                <g>
                  {/* Top Positive Ice (+ + +) */}
                  <text x="200" y="55" fill="#ef4444" fontSize="16" fontWeight="900">+</text>
                  <text x="310" y="45" fill="#ef4444" fontSize="16" fontWeight="900">+</text>
                  <text x="420" y="55" fill="#ef4444" fontSize="16" fontWeight="900">+</text>

                  {/* Bottom Negative Graupel (− − −) */}
                  <text x="170" y="155" fill="#0ea5e9" fontSize="20" fontWeight="900">−</text>
                  <text x="240" y="165" fill="#0ea5e9" fontSize="20" fontWeight="900">−</text>
                  <text x="310" y="170" fill="#0ea5e9" fontSize="20" fontWeight="900">−</text>
                  <text x="380" y="165" fill="#0ea5e9" fontSize="20" fontWeight="900">−</text>
                  <text x="450" y="155" fill="#0ea5e9" fontSize="20" fontWeight="900">−</text>
                </g>
              )}
            </svg>

            {/* Draggable colliding ice crystals inside cloud */}
            <div className="absolute inset-0 pointer-events-auto">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute cursor-grab active:cursor-grabbing p-1.5 select-none"
                  style={{ left: p.x, top: p.y }}
                  onPointerDown={() => handlePointerDown(p.id)}
                  whileHover={{ scale: 1.2 }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 ${
                      p.type === 'ice'
                        ? 'bg-sky-200 border-sky-400 text-sky-950'
                        : 'bg-indigo-300 border-indigo-500 text-indigo-950'
                    }`}
                  >
                    {p.type === 'ice' ? '❄️' : '🧊'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* LIGHTNING BOLT SVG (Active during strike) */}
          {isStriking && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-40 overflow-visible">
              {/* Stepped leader zig-zag bolt */}
              <polyline
                points="330,170 310,240 350,280 290,360 330,420 300,470"
                fill="none"
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="330,170 310,240 350,280 290,360 330,420 300,470"
                fill="none"
                stroke="#facc15"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Secondary Branch */}
              <polyline
                points="310,240 250,290 230,340"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          )}

          {/* GROUND LANDSCAPE BELOW (With induced positive charges) */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-950 to-slate-900 border-t-4 border-emerald-900/80 flex items-center justify-around px-8">
            {/* Induced positive ground charges (+) */}
            {showInvisibleCharges && (
              <div className="flex justify-around w-full text-rose-400 font-black text-sm">
                <span>+</span>
                <span>+</span>
                <span>+</span>
                <span>+</span>
                <span>+</span>
                <span>+</span>
              </div>
            )}
            <div className="absolute bottom-2 text-center text-xs font-bold text-emerald-300/80">
              Earth Surface (Induced Positive Charge Attracts Negative Cloud Base)
            </div>
          </div>

          {/* Prompt banner if low charge */}
          {stormCharge < 0.3 && (
            <div className="absolute inset-x-0 bottom-28 flex justify-center pointer-events-none">
              <span className="bg-yellow-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs animate-bounce shadow">
                👉 Click & drag ice particles inside cloud to collide them!
              </span>
            </div>
          )}
        </div>

        {/* Bottom Professor Zappy & Action */}
        <div className="relative z-30 flex items-end justify-between">
          <ProfessorZappy
            size="md"
            position="inline"
            mood={isStriking ? 'surprised' : stormCharge > 0.6 ? 'excited' : 'idle'}
            staticHairCharge={stormCharge}
          />

          {isCompleted && (
            <button
              type="button"
              onClick={() => completeLevel('level-5', 3, 140)}
              className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center gap-2 cursor-pointer animate-bounce"
            >
              <span>Proceed to Victory Screen!</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* PREDICTION MODAL */}
      <PredictionModal
        isOpen={showPrediction}
        question="Millions of colliding ice crystals have built an enormous electrical difference! What will happen next?"
        options={PREDICTION_OPTIONS}
        onCorrect={() => {
          setShowPrediction(false);
          setHasPredicted(true);
          setDialogue("Spot on! Keep colliding particles until the 100% threshold discharges a massive bolt!", 'excited');
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
                  <strong>How charges separate:</strong> In storm updrafts, lighter ice crystals collide with heavier slush/graupel. The ice crystals lose electrons (becoming positive and rising), while the graupel gains electrons (becoming negative and sinking to the cloud base).
                </p>
                <p>
                  <strong>Stepped leader meets streamer:</strong> When the voltage difference reaches tens of millions of volts, a branching path of ionized air called a stepped leader shoots down, meeting an upward streamer from the ground.
                </p>
                <p>
                  <strong>Why does thunder rumble?</strong> Lightning heats the surrounding air channel to roughly 30,000 K (5 times hotter than the Sun's surface!). This explosive expansion creates the sonic boom we hear as thunder!
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Back to Storm
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEVEL COMPLETE MODAL */}
      <LevelCompleteModal
        isOpen={isCompleted}
        levelId="level-5"
        levelTitle="The Sky's Giant Spark"
        starsEarned={3}
        xpGained={220}
        unlockedPageTitle="How Clouds Make Lightning & Why Thunder Rumbles"
        keyTakeaway="Lightning is static electricity on a grand planetary scale caused by colliding ice crystals separating charges inside thunderclouds!"
        onNextLevel={() => startLevel('level-6')}
        onReplay={resetExperiment}
        onClose={() => setView('map')}
      />
    </div>
  );
};
