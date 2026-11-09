import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowLeft, Volume2, Sparkles, Lock, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { DISCOVERY_PAGES } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

export const DiscoveryBook: React.FC = () => {
  const { stats, setView, settings } = useGame();
  const [selectedPageId, setSelectedPageId] = useState<string>(
    stats.discoveryPages[0] || 'disc-1'
  );

  const activePage = DISCOVERY_PAGES.find((p) => p.id === selectedPageId) || DISCOVERY_PAGES[0];
  const isUnlocked = stats.discoveryPages.includes(activePage.id);

  const handleReadAloud = () => {
    soundManager.playZappyBabble('explaining');
    const fullText = `${activePage.title}. ${activePage.summary}. ${activePage.bullets.join('. ')}`;
    soundManager.speakNarration(fullText);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl comic-border-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView('map')}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border comic-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-amber-400" />
                <span>Professor Zappy's Discovery Book</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Unlocked {stats.discoveryPages.length} of {DISCOVERY_PAGES.length} scientific discoveries!
              </p>
            </div>
          </div>

          <div className="text-xs font-black bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl comic-border-yellow flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Encyclopedia of Static</span>
          </div>
        </div>

        {/* Book Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Chapters / Pages Table of Contents */}
          <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-4 comic-border-lg space-y-2 max-h-[600px] overflow-y-auto">
            <div className="text-xs font-black uppercase text-slate-400 tracking-wider px-2 py-1">
              Table of Contents
            </div>
            {DISCOVERY_PAGES.map((page, idx) => {
              const unlocked = stats.discoveryPages.includes(page.id);
              const isSelected = page.id === activePage.id;

              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    setSelectedPageId(page.id);
                    soundManager.playClick();
                  }}
                  className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between text-left comic-button ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 comic-border-yellow font-black shadow-md'
                      : unlocked
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border font-bold'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-500 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-lg">{page.icon}</span>
                    <div className="truncate">
                      <div className="text-xs truncate">{page.title}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                        {unlocked ? page.subtitle : 'Locked in experiments'}
                      </div>
                    </div>
                  </div>

                  <div>
                    {unlocked ? (
                      <CheckCircle2
                        className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`}
                      />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Discovery Page Content */}
          <div className="lg:col-span-8 bg-amber-50 text-slate-950 rounded-3xl p-6 sm:p-8 comic-border-lg shadow-2xl relative min-h-[480px]">
            {isUnlocked ? (
              <motion.div
                key={activePage.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Page Header */}
                <div className="flex items-start justify-between gap-4 border-b-2 border-amber-200 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-widest mb-1">
                      <span>{activePage.icon} Discovery Chapter</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                      {activePage.title}
                    </h2>
                    <p className="text-sm font-bold text-amber-800 mt-0.5">
                      {activePage.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReadAloud}
                    title="Read Aloud"
                    className="p-3 bg-amber-200 hover:bg-amber-300 rounded-2xl comic-border text-slate-900 transition-colors flex items-center gap-2 font-bold text-xs"
                  >
                    <Volume2 className="w-5 h-5 text-slate-900" />
                    <span className="hidden sm:inline">Read Aloud</span>
                  </button>
                </div>

                {/* Summary Card */}
                <div className="bg-amber-100/80 rounded-2xl p-4 border border-amber-300/80">
                  <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                    {activePage.summary}
                  </p>
                </div>

                {/* Core Scientific Truths */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                    Key Scientific Takeaways:
                  </h3>
                  <div className="space-y-2">
                    {activePage.bullets.map((bullet, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 bg-white/80 p-3 rounded-xl border border-amber-200 shadow-sm"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scientist Deep Dive Note */}
                <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💡</span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-sky-800 mb-0.5">
                      Professor Zappy's Secret Lab Note
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-sky-950">
                      {activePage.deepDive}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Locked Placeholder */
              <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center space-y-4 p-8">
                <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-3xl">
                  <Lock className="w-8 h-8 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800">
                    This Chapter is Sealed!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-sm">
                    Complete the corresponding experiment on the Map to uncover this breakthrough!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView('map')}
                  className="px-6 py-2.5 bg-slate-900 text-white font-black text-xs rounded-xl comic-border"
                >
                  Go to Experiment Map
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
