import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderArchive, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  FileText, 
  Volume2, 
  ExternalLink,
  Zap,
  Shield,
  Layers,
  Search
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { CASE_EVIDENCE_LIST } from '../../utils/storage';
import { soundManager } from '../../utils/audio';
import { CaseEvidence, LevelId } from '../../types/game';

export const InvestigationNotebook: React.FC = () => {
  const { setView, startLevel, stats } = useGame();
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('ev-1');
  const [activeTab, setActiveTab] = useState<'evidence' | 'cases'>('evidence');

  const activeEvidence: CaseEvidence = 
    CASE_EVIDENCE_LIST.find((ev) => ev.id === selectedEvidenceId) || CASE_EVIDENCE_LIST[0];

  const handleReadAloud = () => {
    soundManager.playZappyBabble('explaining');
    const speech = `${activeEvidence.title}. ${activeEvidence.discovery}. ${activeEvidence.deepDive}`;
    soundManager.speakNarration(speech);
  };

  const handleLaunchCase = (caseId: LevelId) => {
    soundManager.playClick();
    startLevel(caseId);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
      {/* Background blueprint/dossier grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl comic-border-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView('map')}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border comic-button"
              title="Back to Investigation Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-600/40">
                  CONFIDENTIAL DOSSIER
                </span>
                <span className="text-xs font-bold text-amber-400">
                  The Invisible Case Files
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mt-0.5">
                <FolderArchive className="w-7 h-7 text-yellow-400" />
                <span>Investigator's Evidence Notebook</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView('discovery-book')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Full Encyclopedia</span>
            </button>
          </div>
        </div>

        {/* Notebook Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Evidence List */}
          <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-4 comic-border-lg space-y-2.5 max-h-[620px] overflow-y-auto">
            <div className="text-xs font-black uppercase text-slate-400 tracking-wider px-2 py-1 flex items-center justify-between">
              <span>Collected Evidence ({CASE_EVIDENCE_LIST.length})</span>
              <span className="text-emerald-400 text-[10px]">ALL VERIFIED ✓</span>
            </div>

            {CASE_EVIDENCE_LIST.map((ev) => {
              const isSelected = ev.id === activeEvidence.id;

              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => {
                    setSelectedEvidenceId(ev.id);
                    soundManager.playClick();
                  }}
                  className={`w-full p-3.5 rounded-2xl transition-all flex items-center justify-between text-left comic-button ${
                    isSelected
                      ? 'bg-yellow-400 text-slate-950 comic-border-yellow font-black shadow-lg scale-[1.01]'
                      : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 comic-border font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-2xl flex-shrink-0">{ev.icon}</span>
                    <div className="truncate">
                      <div className={`text-[10px] uppercase font-black tracking-wider ${isSelected ? 'text-slate-800' : 'text-sky-400'}`}>
                        {ev.caseNumber}
                      </div>
                      <div className="text-xs truncate font-bold">{ev.title}</div>
                    </div>
                  </div>

                  <CheckCircle2
                    className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Evidence Card & Micro-Visualization */}
          <div className="lg:col-span-8 bg-slate-900/95 text-white rounded-3xl p-6 sm:p-8 comic-border-lg shadow-2xl relative min-h-[500px] border-2 border-slate-700 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvidence.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Evidence Card Top Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2.5 py-0.5 rounded-lg border border-yellow-400/30">
                        Evidence #{activeEvidence.id.replace('ev-', '0')}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Linked to {activeEvidence.caseNumber}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {activeEvidence.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReadAloud}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded-xl comic-border text-xs font-bold flex items-center gap-1.5"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Listen</span>
                    </button>
                  </div>
                </div>

                {/* Primary Breakthrough Card */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-sky-950/80 to-slate-900 rounded-2xl border-2 border-sky-500/40 shadow-inner">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-sky-400 mb-1.5 tracking-wider">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Investigator's Breakthrough</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                    "{activeEvidence.discovery}"
                  </p>
                </div>

                {/* Scientific Deep Dive */}
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>Scientific Mechanism</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    {activeEvidence.deepDive}
                  </p>
                </div>

                {/* Case Link Banner */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeEvidence.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-400">
                        Test this law in the field:
                      </div>
                      <div className="text-sm font-black text-yellow-300">
                        {activeEvidence.caseNumber}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLaunchCase(activeEvidence.caseId)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl comic-border-yellow comic-button shadow flex items-center justify-center gap-2"
                  >
                    <span>Launch Case</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};