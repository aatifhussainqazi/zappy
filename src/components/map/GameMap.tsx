import React from 'react';
import { motion } from 'framer-motion';
import { 
  FolderArchive, 
  Sparkles, 
  FlaskConical, 
  BookOpen, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Search, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { LEVEL_DEFINITIONS } from '../../utils/storage';
import { soundManager } from '../../utils/audio';
import { LevelId } from '../../types/game';

export const GameMap: React.FC = () => {
  const { stats, startLevel, setView } = useGame();

  const handleOpenCase = (levelId: LevelId) => {
    soundManager.playClick();
    startLevel(levelId);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Background blueprint & investigator string board pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl comic-border-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView('landing')}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border comic-button"
              title="Return to Opening"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-600/40">
                  INVESTIGATION BOARD
                </span>
                <span className="text-xs font-bold text-amber-400">
                  STATIC! 2.0
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mt-0.5">
                <Compass className="w-7 h-7 text-yellow-400" />
                <span>The Invisible Case Files</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setView('notebook')}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button shadow flex items-center gap-2"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Evidence Notebook</span>
            </button>
            <button
              type="button"
              onClick={() => setView('discovery-book')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Discovery Book</span>
            </button>
            <button
              type="button"
              onClick={() => setView('sandbox')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Free Play Lab</span>
            </button>
          </div>
        </div>

        {/* 6 Cases Dossier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVEL_DEFINITIONS.map((level, idx) => {
            const progress = stats.levelProgress[level.id];
            const isCompleted = progress?.completed || false;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className={`relative rounded-3xl p-5 comic-border-lg transition-all flex flex-col justify-between border-2 ${
                  isCompleted
                    ? 'bg-slate-900 border-yellow-400 shadow-[0_4px_24px_rgba(250,204,21,0.12)]'
                    : 'bg-slate-900 border-sky-400/80 shadow-[0_4px_20px_rgba(14,165,233,0.1)]'
                }`}
              >
                {/* Case Header Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-sky-400 font-black text-xs comic-border">
                        {level.caseNumber}
                      </span>
                      <span className="text-2xl">{level.icon}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCompleted ? (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SOLVED</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Search className="w-3 h-3" />
                          <span>OPEN CASE</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Mystery Question */}
                  <div className="space-y-1 mb-3">
                    <h2 className="text-xl font-black text-white leading-tight">
                      {level.title}
                    </h2>
                    <p className="text-xs font-bold text-amber-400 italic">
                      "{level.subtitle}"
                    </p>
                  </div>

                  {/* Location & Mystery Question */}
                  <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 mb-4">
                    <div className="text-[10px] uppercase font-black text-slate-400 flex items-center justify-between">
                      <span>LOCATION</span>
                      <span className="text-sky-300 font-bold">{level.environmentName}</span>
                    </div>
                    <div className="text-xs text-slate-200 font-medium leading-relaxed">
                      {level.mysteryQuestion}
                    </div>
                  </div>

                  {/* Core Physics Concepts Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {level.concepts.map((concept, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  type="button"
                  onClick={() => handleOpenCase(level.id)}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Investigate Case</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};