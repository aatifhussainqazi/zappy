import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Map, FlaskConical, BookOpen, Volume2, HelpCircle, ArrowRight, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { soundManager } from '../../utils/audio';

export const LandingPage: React.FC = () => {
  const { setView, startLevel, stats, isAudioStarted, startAudioContext, updateSettings } = useGame();

  // Interactive Teaser Balloon state
  const [teaserCharge, setTeaserCharge] = useState(0); // 0 to 1
  const [isRubbing, setIsRubbing] = useState(false);
  const [balloonPos, setBalloonPos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const lastRubPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startAudioContext();
    setIsRubbing(true);
    lastRubPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRubbing) return;

    if (lastRubPos.current) {
      const dx = e.clientX - lastRubPos.current.x;
      const dy = e.clientY - lastRubPos.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        // Friction generates static charge!
        setTeaserCharge((prev) => {
          const next = Math.min(1, prev + 0.035);
          soundManager.playRubbing(0.6);
          soundManager.playChargeHum(next);
          return next;
        });

        // Add tiny sparks / electron particles
        if (Math.random() > 0.4) {
          const newP = {
            id: Date.now() + Math.random(),
            x: e.clientX + (Math.random() * 40 - 20),
            y: e.clientY + (Math.random() * 40 - 20),
          };
          setParticles((p) => [...p.slice(-12), newP]);
        }
      }
    }
    lastRubPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsRubbing(false);
    lastRubPos.current = null;
    if (teaserCharge > 0.6) {
      soundManager.playSpark();
    }
  };

  const handleStartAdventure = () => {
    startAudioContext();
    // If player has progress, start at the first incomplete or start level 1
    const targetLevel = stats.unlockedLevels.find((lvl) => !stats.levelProgress[lvl]?.completed && lvl !== 'sandbox') || 'level-1';
    startLevel(targetLevel);
  };

  return (
    <div
      className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 p-4 sm:p-8"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Background Animated Atmosphere: Sparks & Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-yellow-300"
            style={{
              width: i % 2 === 0 ? 4 : 6,
              height: i % 2 === 0 ? 4 : 6,
              top: `${(i * 19) % 100}%`,
              left: `${(i * 29) % 100}%`,
              boxShadow: '0 0 10px #facc15',
            }}
            animate={{
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Electrical arcs in background */}
        <div className="absolute -top-12 -left-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-12 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Floating particles from teaser rubbing */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0, y: -25 }}
          transition={{ duration: 0.6 }}
          className="fixed w-3.5 h-3.5 rounded-full bg-sky-400 text-white font-black text-[9px] flex items-center justify-center pointer-events-none shadow-[0_0_8px_#38bdf8] z-50"
          style={{ left: p.x, top: p.y }}
        >
          −
        </motion.div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
        {/* Left Column: Title, Subtitle, Main Buttons */}
        <div className="flex-1 text-center lg:text-left space-y-5">
          {/* Tagline pill */}
          <div className="inline-flex items-center gap-2 bg-sky-950/80 border-2 border-sky-400/60 px-4 py-1.5 rounded-full shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
            <span className="text-xs sm:text-sm font-black text-sky-200 tracking-wide uppercase">
              Interactive Physics Lab & Adventure
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-1">
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-white drop-shadow-[0_4px_0_#0f172a] leading-none">
              <span className="text-yellow-300 inline-block hover:scale-105 transition-transform cursor-default">
                STATIC!
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-sky-200 drop-shadow">
              An adventure into the invisible world of electricity.
            </p>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
            Rub balloons, make paper fly against gravity, bend water streams with invisible forces,
            build thunderstorms, and discover the atomic dance of electrons!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={handleStartAdventure}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-base sm:text-lg rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center gap-3 cursor-pointer group"
            >
              <Play className="w-6 h-6 fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>START EXPERIMENTING</span>
            </button>

            <button
              type="button"
              onClick={() => setView('map')}
              className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base rounded-2xl comic-border comic-button flex items-center gap-2 cursor-pointer"
            >
              <Map className="w-5 h-5 text-sky-400" />
              <span>Experiment Map</span>
            </button>

            <button
              type="button"
              onClick={() => setView('sandbox')}
              className="px-6 py-4 bg-emerald-700/80 hover:bg-emerald-600 text-white font-extrabold text-base rounded-2xl comic-border comic-button flex items-center gap-2 cursor-pointer"
            >
              <FlaskConical className="w-5 h-5 text-emerald-300" />
              <span>Free Play Lab</span>
            </button>
          </div>

          {/* Quick Features Row */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-yellow-400">⚡</span>
              <span>6 Interactive Labs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400">🔬</span>
              <span>Atomic Particle View</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">🔊</span>
              <span>Synthesized Sound & Narration</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400">📚</span>
              <span>Discovery Encyclopedia</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Teaser Workbench & Prof Zappy */}
        <div className="flex-1 flex flex-col items-center relative w-full max-w-md">
          {/* Professor Zappy Welcoming */}
          <div className="mb-2">
            <ProfessorZappy
              size="lg"
              position="hero"
              mood={teaserCharge > 0.6 ? 'excited' : teaserCharge > 0.2 ? 'surprised' : 'idle'}
              staticHairCharge={teaserCharge}
              customText={
                teaserCharge > 0.7
                  ? 'GREAT GALLOPING ELECTRONS! The balloon is intensely charged!'
                  : teaserCharge > 0.1
                  ? 'Keep rubbing! The friction is pulling electrons right onto the rubber!'
                  : 'Try rubbing that red balloon with your mouse or finger right now!'
              }
            />
          </div>

          {/* Interactive Hero Teaser Station */}
          <div className="w-full bg-slate-900/90 rounded-3xl p-5 comic-border-lg shadow-2xl relative select-none">
            <div className="flex items-center justify-between mb-3 text-xs font-black uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5 text-yellow-300">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Quick Lab Preview
              </span>
              <span className="text-sky-400 font-bold">
                Charge: {Math.round(teaserCharge * 100)}%
              </span>
            </div>

            {/* Rubbing arena */}
            <div
              className="relative h-44 bg-slate-950 rounded-2xl border-2 border-dashed border-sky-600/40 flex items-center justify-around p-4 overflow-hidden cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
            >
              {/* Hair / Wool patch on the left */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-700/60 border-2 border-amber-500/80 flex items-center justify-center relative overflow-hidden">
                  {/* Fluffy hair strands */}
                  <div className="text-3xl">🧶</div>
                </div>
                <span className="text-[11px] font-black text-amber-300 mt-1 uppercase">
                  Wool Patch
                </span>
              </div>

              {/* Rub indicator prompt */}
              {teaserCharge < 0.15 && (
                <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
                  <span className="inline-block bg-yellow-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full animate-bounce shadow">
                    👈 Drag & Rub Balloon Here! 👉
                  </span>
                </div>
              )}

              {/* Interactive Balloon */}
              <motion.div
                className="relative z-10 select-none"
                animate={{
                  y: isRubbing ? [0, -4, 4, 0] : [0, -6, 0],
                  scale: 1 + teaserCharge * 0.12,
                }}
                transition={{
                  duration: isRubbing ? 0.2 : 2.5,
                  repeat: Infinity,
                }}
              >
                {/* Cartoon Balloon SVG */}
                <svg width="75" height="95" viewBox="0 0 80 100" className="drop-shadow-xl overflow-visible">
                  <defs>
                    <radialGradient id="balloonHeroGrad" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="70%" stopColor="#dc2626" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </radialGradient>
                  </defs>

                  {/* Balloon body */}
                  <ellipse cx="40" cy="42" rx="34" ry="40" fill="url(#balloonHeroGrad)" stroke="#0f172a" strokeWidth="3" />
                  
                  {/* Highlight sheen */}
                  <ellipse cx="26" cy="28" rx="8" ry="14" fill="#ffffff" opacity="0.4" transform="rotate(-20 26 28)" />

                  {/* Balloon knot */}
                  <polygon points="36,82 44,82 40,88" fill="#991b1b" stroke="#0f172a" strokeWidth="2" />

                  {/* String */}
                  <path d="M40 88 Q35 94 42 100 Q46 106 40 112" fill="none" stroke="#e2e8f0" strokeWidth="2" />

                  {/* Negative Charges (-) on balloon surface */}
                  {teaserCharge > 0.1 && (
                    <g className="animate-pulse">
                      <circle cx="28" cy="46" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
                      <text x="28" y="48.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">−</text>

                      {teaserCharge > 0.35 && (
                        <>
                          <circle cx="48" cy="38" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
                          <text x="48" y="40.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">−</text>
                        </>
                      )}
                      {teaserCharge > 0.65 && (
                        <>
                          <circle cx="38" cy="60" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1" />
                          <text x="38" y="62.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">−</text>
                        </>
                      )}
                    </g>
                  )}
                </svg>
              </motion.div>
            </div>

            {/* Charge Level bar */}
            <div className="mt-3">
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-yellow-400 rounded-full transition-all duration-150"
                  style={{ width: `${Math.round(teaserCharge * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
