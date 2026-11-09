import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  HelpCircle, 
  Eye, 
  Layers, 
  Flame, 
  Zap, 
  Compass, 
  Play, 
  RotateCcw,
  BookOpen,
  FolderArchive
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { soundManager } from '../../utils/audio';

type StrangeThingId = 'paper' | 'balloon' | 'water' | 'lightning';

interface StrangeThing {
  id: StrangeThingId;
  title: string;
  tag: string;
  question: string;
  caseId: 'level-1' | 'level-2' | 'level-4' | 'level-5';
  actionPrompt: string;
}

const STRANGE_THINGS: StrangeThing[] = [
  {
    id: 'paper',
    title: 'The Paper That Leaps',
    tag: 'Case 01',
    question: 'That ruler never touched the paper. So what pulled it against gravity?',
    caseId: 'level-1',
    actionPrompt: 'Investigate Case 01: The Paper Heist',
  },
  {
    id: 'balloon',
    title: 'The Wall Defies Gravity',
    tag: 'Case 02',
    question: 'A rubber balloon clings tight to drywall with no tape, no glue, and no sticky adhesive.',
    caseId: 'level-2',
    actionPrompt: 'Investigate Case 02: Balloon vs Wall',
  },
  {
    id: 'water',
    title: 'The Water That Moves',
    tag: 'Case 04',
    question: 'A falling stream of tap water curves sideways in mid-air before reaching the drain.',
    caseId: 'level-4',
    actionPrompt: 'Investigate Case 04: The Magic Water Trick',
  },
  {
    id: 'lightning',
    title: "The Sky's Giant Spark",
    tag: 'Case 05',
    question: 'Tiny drifting ice crystals inside cold clouds separate gigavolts of raw electricity.',
    caseId: 'level-5',
    actionPrompt: "Investigate Case 05: The Sky's Giant Spark",
  },
];

export const LandingPage: React.FC = () => {
  const { setView, startLevel, startAudioContext, isAudioStarted } = useGame();

  const [activeStrangeIndex, setActiveStrangeIndex] = useState(0);
  const [hasTriggeredFirstJump, setHasTriggeredFirstJump] = useState(false);
  const [interactiveCharge, setInteractiveCharge] = useState(0);
  const [isRubbingWool, setIsRubbingWool] = useState(false);
  const [rulerY, setRulerY] = useState(130);
  const [paperAttached, setPaperAttached] = useState(false);

  const activeThing = STRANGE_THINGS[activeStrangeIndex];
  const lastPointerY = useRef<number | null>(null);

  // Play cold open jump automatically after 1.2s to deliver the 10-second hook!
  useEffect(() => {
    const timer = setTimeout(() => {
      setPaperAttached(true);
      setHasTriggeredFirstJump(true);
      soundManager.playPaperFlutter();
      soundManager.playPop();
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleNextStrangeThing = () => {
    startAudioContext();
    soundManager.playClick();
    setActiveStrangeIndex((prev) => (prev + 1) % STRANGE_THINGS.length);
  };

  const handleInvestigateActive = () => {
    startAudioContext();
    soundManager.playClick();
    startLevel(activeThing.caseId);
  };

  // Micro-interactive rubbing right on the cold open
  const handlePointerDownWool = (e: React.PointerEvent) => {
    startAudioContext();
    setIsRubbingWool(true);
    lastPointerY.current = e.clientY;
  };

  const handlePointerMoveDesk = (e: React.PointerEvent) => {
    if (!isRubbingWool || lastPointerY.current === null) return;
    const dy = Math.abs(e.clientY - lastPointerY.current);
    if (dy > 6) {
      setInteractiveCharge((prev) => {
        const next = Math.min(1, prev + 0.05);
        soundManager.playRubbing(0.6);
        soundManager.playChargeHum(next);
        return next;
      });
      lastPointerY.current = e.clientY;
    }
  };

  const handlePointerUp = () => {
    setIsRubbingWool(false);
    lastPointerY.current = null;
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden bg-slate-950 p-4 sm:p-8 select-none"
      onPointerMove={handlePointerMoveDesk}
      onPointerUp={handlePointerUp}
    >
      {/* Background investigator grid with subtle vignette */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />

      {/* Top Investigator Banner */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto w-full bg-slate-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl comic-border-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg shadow">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                CASE FILE INTEL
              </span>
              <span className="text-xs font-bold text-amber-400">
                STATIC! 2.0
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              The Invisible Case Files
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setView('map')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-xs rounded-xl comic-border comic-button flex items-center gap-1.5 shadow"
          >
            <Compass className="w-4 h-4 text-yellow-400" />
            <span>Investigation Board (6 Cases)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: The Impossible Event Close-Up */}
      <div className="relative z-10 max-w-4xl w-full mx-auto my-4 flex-1 flex flex-col justify-center">
        <div className="relative bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 rounded-3xl comic-border-lg p-5 sm:p-8 shadow-2xl border-2 border-slate-700 min-h-[420px] flex flex-col justify-between overflow-hidden">
          {/* Tabletop Surface Texture */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-amber-900/20 to-transparent border-t border-amber-800/20 pointer-events-none" />

          {/* Top Mystery Question Badge */}
          <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/90 backdrop-blur p-4 rounded-2xl border border-sky-500/40">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-sky-400 uppercase tracking-widest mb-0.5">
                <Search className="w-4 h-4 text-sky-400" />
                <span>Unsolved Mystery #{activeStrangeIndex + 1}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-yellow-300">
                "{activeThing.question}"
              </h2>
            </div>

            <div className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              No Touch. Pure Invisible Force.
            </div>
          </div>

          {/* Central Interactive Cold-Open Visualization */}
          <div className="relative my-8 flex items-center justify-center min-h-[180px]">
            {activeThing.id === 'paper' && (
              <div className="relative w-full max-w-md h-40 flex flex-col items-center justify-between">
                {/* Ruler floating above */}
                <motion.div
                  className="w-64 h-12 rounded-xl bg-gradient-to-r from-sky-400 to-sky-200 border-2 border-sky-100 shadow-[0_4px_20px_rgba(56,189,248,0.3)] flex items-center justify-between px-3 text-slate-900 font-black text-xs relative cursor-pointer"
                  animate={{
                    y: paperAttached ? 10 : [0, 8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: paperAttached ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                  onClick={() => {
                    setPaperAttached((prev) => !prev);
                    soundManager.playPaperFlutter();
                  }}
                >
                  <span>PLASTIC RULER</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="text-[10px] text-sky-950 font-black">
                        −
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Invisible Attraction Spark Line when attached */}
                {paperAttached && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    className="w-1 h-12 bg-yellow-400 shadow-[0_0_8px_#facc15]"
                  />
                )}

                {/* Paper pieces on workbench */}
                <div className="relative w-72 flex justify-around items-end h-14">
                  {/* Jumping paper piece */}
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-amber-50 border-2 border-amber-300 shadow-md flex items-center justify-center text-[10px] font-black text-slate-800"
                    animate={
                      paperAttached
                        ? { y: -72, rotate: 18, scale: 1.1 }
                        : { y: 0, rotate: -6, scale: 1 }
                    }
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  >
                    📄
                  </motion.div>

                  {/* Other resting papers */}
                  <div className="w-7 h-7 rounded-lg bg-amber-100/80 border border-amber-300/80 rotate-12 flex items-center justify-center text-[10px]">
                    📄
                  </div>
                  <div className="w-8 h-7 rounded-lg bg-amber-100/80 border border-amber-300/80 -rotate-6 flex items-center justify-center text-[10px]">
                    📄
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-amber-100/80 border border-amber-300/80 rotate-45 flex items-center justify-center text-[10px]">
                    📄
                  </div>
                </div>
              </div>
            )}

            {activeThing.id === 'balloon' && (
              <div className="relative w-full max-w-md h-40 flex items-center justify-center gap-12">
                <motion.div
                  className="w-24 h-32 rounded-[50%_50%_45%_45%] bg-gradient-to-br from-rose-500 to-rose-700 border-2 border-rose-300 shadow-xl flex flex-col items-center justify-center text-white font-black text-xs"
                  animate={{ x: [0, 20, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span>BALLOON</span>
                  <span className="text-sm">🎈</span>
                  <div className="flex gap-1 mt-1 text-[10px] text-yellow-200">
                    <span>−</span><span>−</span><span>−</span>
                  </div>
                </motion.div>
                <div className="w-6 h-36 bg-amber-100 rounded-lg border-2 border-amber-300 p-1 flex flex-col justify-around text-[10px] text-slate-700 font-black">
                  <span>WALL</span>
                  <span className="text-rose-500">+</span>
                  <span className="text-rose-500">+</span>
                  <span className="text-rose-500">+</span>
                </div>
              </div>
            )}

            {activeThing.id === 'water' && (
              <div className="relative w-full max-w-md h-40 flex items-center justify-center gap-10">
                <div className="w-16 h-22 rounded-[50%] bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-purple-300 shadow-xl flex items-center justify-center text-white font-black text-xs">
                  <span>− − −</span>
                </div>
                <div className="relative h-32 w-16 flex flex-col items-center">
                  <div className="w-8 h-3 bg-slate-600 rounded-t-lg" />
                  <motion.svg
                    className="w-12 h-28 overflow-visible"
                    viewBox="0 0 50 100"
                  >
                    <motion.path
                      d="M 25 0 Q 8 50 25 100"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{
                        d: ["M 25 0 Q 8 50 25 100", "M 25 0 Q 5 50 25 100", "M 25 0 Q 8 50 25 100"],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.svg>
                </div>
              </div>
            )}

            {activeThing.id === 'lightning' && (
              <div className="relative w-full max-w-md h-40 flex flex-col items-center justify-center">
                <div className="w-48 h-14 bg-slate-800 rounded-full border border-slate-600 shadow-xl flex items-center justify-around px-4 text-xs font-black text-sky-300">
                  <span>CLOUDS</span>
                  <span className="text-yellow-400">⚡</span>
                </div>
                <motion.div
                  className="text-3xl text-yellow-300 font-black my-1"
                  animate={{ opacity: [0.2, 1, 0.4, 1, 0.2] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  ⚡
                </motion.div>
                <div className="w-64 h-3 bg-emerald-700 rounded-full" />
              </div>
            )}
          </div>

          {/* Action Decision Buttons: Investigate vs Next Mystery */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleInvestigateActive}
              className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center justify-center gap-2 cursor-pointer scale-[1.02]"
            >
              <span>{activeThing.actionPrompt}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNextStrangeThing}
              className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Show Me Another Strange Thing ({activeStrangeIndex + 1}/4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Professor Zappy Partner Reaction Footer */}
      <div className="relative z-20 max-w-5xl w-full mx-auto flex items-end justify-between gap-4">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={paperAttached ? 'surprised' : 'thinking'}
        />

        <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Interactive Physics Active — Drag, Rub & Test Real Objects</span>
        </div>
      </div>
    </div>
  );
};