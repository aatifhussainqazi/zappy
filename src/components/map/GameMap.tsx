import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Play, RotateCcw, Sparkles, Award, ArrowLeft, FlaskConical, BookOpen } from 'lucide-react';
import { LevelId, LevelInfo } from '../../types/game';
import { useGame } from '../../context/GameContext';
import { LEVEL_DEFINITIONS } from '../../utils/storage';

export const GameMap: React.FC = () => {
  const { stats, startLevel, setView } = useGame();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Background lab blueprint grid & circuit lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl comic-border-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView('landing')}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border comic-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-yellow-300">
                Professor Zappy's Experiment Stations
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Complete experiments to unlock higher voltages and secrets of the static world!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('sandbox')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Free Play Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setView('discovery-book')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Discovery Book</span>
            </button>
          </div>
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEVEL_DEFINITIONS.map((level, idx) => {
            const isUnlocked = stats.unlockedLevels.includes(level.id);
            const progress = stats.levelProgress[level.id];
            const isCompleted = progress?.completed || false;
            const stars = progress?.stars || 0;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`relative rounded-3xl p-5 comic-border-lg transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? isCompleted
                      ? 'bg-slate-900 border-yellow-400 shadow-[0_4px_20px_rgba(250,204,21,0.15)]'
                      : 'bg-slate-900 border-sky-400 shadow-[0_4px_20px_rgba(14,165,233,0.15)]'
                    : 'bg-slate-950/80 border-slate-800 opacity-60'
                }`}
              >
                {/* Station Number Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 text-white font-black text-xs flex items-center justify-center comic-border">
                      #{level.number}
                    </span>
                    <span className="text-2xl">{level.icon}</span>
                  </div>

                  {/* Stars / Lock Status */}
                  {isUnlocked ? (
                    <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx <= stars
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-500 font-bold text-xs bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                      <Lock className="w-3.5 h-3.5" />
                      <span>LOCKED</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 mb-5">
                  <h3 className="text-xl font-black text-white leading-tight">
                    {level.title}
                  </h3>
                  <div className="text-xs font-bold text-yellow-300">
                    {level.subtitle}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {level.description}
                  </p>

                  {/* Concepts learned badges */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {level.concepts.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold bg-slate-800 text-sky-300 px-2 py-0.5 rounded-lg border border-slate-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <div>
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => startLevel(level.id)}
                      className={`w-full py-3 rounded-2xl font-black text-sm comic-button flex items-center justify-center gap-2 shadow-md ${
                        isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-yellow-300 comic-border'
                          : 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 comic-border-yellow'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Replay Experiment</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-slate-950" />
                          <span>Start Experiment</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Complete Station #{level.number - 1} to Unlock</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
