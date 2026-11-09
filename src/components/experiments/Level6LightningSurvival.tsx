import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Info, Sparkles, Building, Car, TreePine, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { LevelCompleteModal } from '../ui/LevelCompleteModal';
import { soundManager } from '../../utils/audio';

interface SurvivalQuestion {
  id: number;
  scenario: string;
  context: string;
  options: {
    id: string;
    text: string;
    icon: string;
    isSafe: boolean;
    explanation: string;
  }[];
}

const SURVIVAL_SCENARIOS: SurvivalQuestion[] = [
  {
    id: 1,
    scenario: 'Thunder is getting closer! Where should Pip seek shelter?',
    context: 'Pip is outside on a park trail when thunder rumbles 3 miles away.',
    options: [
      {
        id: 'opt-building',
        text: 'Enter a substantial enclosed building (house, school, library).',
        icon: '🏠',
        isSafe: true,
        explanation: 'CORRECT! Substantial enclosed buildings with internal wiring and plumbing safely channel lightning current into the ground around you!',
      },
      {
        id: 'opt-tree',
        text: 'Stand underneath a tall isolated oak tree to stay dry.',
        icon: '🌳',
        isSafe: false,
        explanation: 'DANGEROUS! Tall isolated trees are lightning magnets. When lightning strikes a tree, electricity shoots outwards through the ground (ground current) and side-flashes to anyone nearby!',
      },
      {
        id: 'opt-flat',
        text: 'Lie completely flat on the damp ground in the open field.',
        icon: '🌾',
        isSafe: false,
        explanation: 'DANGEROUS! Lying flat on the ground maximizes your surface contact area. If lightning strikes anywhere nearby, the ground current travels directly through your body!',
      },
    ],
  },
  {
    id: 2,
    scenario: 'A fierce thunderstorm breaks out while driving on the highway.',
    context: 'Lightning is flashing all around the open road.',
    options: [
      {
        id: 'opt-car',
        text: 'Stay inside the hard-topped metal car with windows rolled up.',
        icon: '🚗',
        isSafe: true,
        explanation: 'CORRECT! The metal frame of a hard-topped car acts as a "Faraday Cage"—conducting the electric charge around the outside of the vehicle directly into the ground!',
      },
      {
        id: 'opt-umbrella',
        text: 'Get out of the car and walk with a tall metal-tipped umbrella.',
        icon: '☂️',
        isSafe: false,
        explanation: 'DANGEROUS! Leaving safe shelter to walk in an open storm with an elevated conductor makes you a prime target for upward streamers!',
      },
      {
        id: 'opt-convertible',
        text: 'Drop the fabric roof to see where the lightning is coming from.',
        icon: '🏎️',
        isSafe: false,
        explanation: 'DANGEROUS! Soft-top convertibles or motorcycles lack the complete metal outer shell needed for Faraday Cage protection!',
      },
    ],
  },
  {
    id: 3,
    scenario: 'Caught far from any building or vehicle with hair standing on end!',
    context: 'Your hair is rising electrostatically—a strike is imminent with no shelter nearby!',
    options: [
      {
        id: 'opt-crouch',
        text: 'Crouch low on the balls of your feet with heels touching, hands over ears.',
        icon: '🧘',
        isSafe: true,
        explanation: 'CORRECT LAST-RESORT ACTION! Crouching lowers your height and minimizes ground contact. Touching heels together provides a path for current to pass from foot to foot rather than through vital organs.',
      },
      {
        id: 'opt-run',
        text: 'Run as fast as you can with arms waving high in the air.',
        icon: '🏃',
        isSafe: false,
        explanation: 'DANGEROUS! Raising your height and arms increases the electric field gradient at your fingertips, inviting an upward streamer!',
      },
      {
        id: 'opt-cave',
        text: 'Duck into a shallow rocky overhang or wet cave entrance.',
        icon: '🪨',
        isSafe: false,
        explanation: 'DANGEROUS! Shallow overhangs and cave openings conduct ground currents and arc flash across the opening.',
      },
    ],
  },
  {
    id: 4,
    scenario: 'Safely inside your home during a severe electrical storm. What should you avoid?',
    context: 'You are cozy indoors while torrential rain and lightning rage outside.',
    options: [
      {
        id: 'opt-shower',
        text: 'Taking a shower or washing dishes in running tap water.',
        icon: '🚿',
        isSafe: true, // Note: choosing this as the hazard to avoid is correct!
        explanation: 'CORRECT SAFETY KNOWLEDGE! Lightning can strike external utility poles or pipes and travel through indoor metal plumbing lines. Stay away from running water until 30 minutes after thunder stops!',
      },
      {
        id: 'opt-book',
        text: 'Sitting on an interior couch reading a paperback book.',
        icon: '📖',
        isSafe: false,
        explanation: 'Reading a book on an interior couch is completely safe! It poses zero electrical hazard.',
      },
      {
        id: 'opt-boardgame',
        text: 'Playing a board game with your family on the living room rug.',
        icon: '🎲',
        isSafe: false,
        explanation: 'Playing board games indoors away from windows and wired electronics is completely safe!',
      },
    ],
  },
];

export const Level6LightningSurvival: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView } = useGame();

  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const scenario = SURVIVAL_SCENARIOS[currentScenarioIdx];

  useEffect(() => {
    setDialogue(
      "Experiment 6: Lightning Survival! Guide Pip to safety by applying real-world scientific thunderstorm survival rules!",
      'excited'
    );
  }, []);

  const handleSelectOption = (opt: (typeof SURVIVAL_SCENARIOS)[0]['options'][0]) => {
    setSelectedOptionId(opt.id);
    setShowFeedback(true);

    if (opt.isSafe) {
      soundManager.playChime();
      setScore((s) => s + 1);
      setDialogue("EXCELLENT SAFETY CHOICE! That is scientifically correct!", 'celebrating');
    } else {
      soundManager.playWrong();
      setDialogue("WATCH OUT! That choice increases lightning strike danger!", 'surprised');
    }
  };

  const handleNextScenario = () => {
    setShowFeedback(false);
    setSelectedOptionId(null);

    if (currentScenarioIdx < SURVIVAL_SCENARIOS.length - 1) {
      setCurrentScenarioIdx((idx) => idx + 1);
    } else {
      // Completed all scenarios!
      setShowSummaryModal(true);
      if (!isCompleted) {
        setIsCompleted(true);
      }
    }
  };

  const resetChallenge = () => {
    soundManager.playClick();
    setCurrentScenarioIdx(0);
    setSelectedOptionId(null);
    setShowFeedback(false);
    setScore(0);
    setShowSummaryModal(false);
    setDialogue("Reset! Let's review all the lightning survival decisions!", 'excited');
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-6 overflow-hidden select-none flex flex-col justify-between">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg">
            #6
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              Lightning Survival Adventure
            </h1>
            <p className="text-xs font-bold text-sky-400">
              Scenario {currentScenarioIdx + 1} of {SURVIVAL_SCENARIOS.length}: Test your thunderstorm life-saving instincts!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSummaryModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold text-xs rounded-xl comic-border comic-button flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Safety Rules</span>
          </button>
          <button
            type="button"
            onClick={resetChallenge}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl comic-border comic-button"
            title="Restart Challenge"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scenario Arena */}
      <div className="relative flex-1 w-full max-w-4xl mx-auto my-3 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 rounded-3xl comic-border-lg p-6 sm:p-8 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[460px]">
        {/* Scenario Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency Decision Point</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {scenario.scenario}
          </h2>
          <p className="text-sm font-semibold text-slate-300">
            {scenario.context}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3 my-4">
          {scenario.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let style = 'bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700';

            if (showFeedback && isSelected) {
              style = opt.isSafe
                ? 'bg-emerald-950/90 border-emerald-400 text-white ring-2 ring-emerald-400 shadow-xl'
                : 'bg-rose-950/90 border-rose-500 text-white ring-2 ring-rose-400';
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={showFeedback}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl transition-all comic-button text-left flex items-center justify-between gap-4 ${style}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{opt.icon}</span>
                  <span className="font-bold text-sm sm:text-base leading-snug">
                    {opt.text}
                  </span>
                </div>

                {showFeedback && isSelected && (
                  <div>
                    {opt.isSafe ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Scientific Feedback Banner */}
        {showFeedback && selectedOptionId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border-2 mb-2 ${
              scenario.options.find((o) => o.id === selectedOptionId)?.isSafe
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                : 'bg-rose-950/80 border-rose-500 text-rose-100'
            }`}
          >
            <div className="font-black text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Scientist Safety Debrief:</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed">
              {scenario.options.find((o) => o.id === selectedOptionId)?.explanation}
            </p>
          </motion.div>
        )}

        {/* Continue to next scenario button */}
        {showFeedback && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleNextScenario}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl comic-border-yellow comic-button flex items-center gap-2 shadow-lg"
            >
              <span>{currentScenarioIdx < SURVIVAL_SCENARIOS.length - 1 ? 'Next Scenario' : 'View Safety Handbook'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Professor Zappy & Action */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy size="md" position="inline" mood={score > 2 ? 'celebrating' : 'excited'} />

        {isCompleted && (
          <button
            type="button"
            onClick={() => completeLevel('level-6', 3, 250)}
            className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl comic-border-yellow comic-button shadow-2xl flex items-center gap-2 cursor-pointer animate-bounce"
          >
            <span>Claim Lightning Safety Certification!</span>
            <Award className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* OFFICIAL SAFETY RULES SUMMARY MODAL */}
      <AnimatePresence>
        {showSummaryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full comic-border-lg text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-yellow-400" />
                  <span>The Golden Rules of Lightning Safety</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSummaryModal(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-yellow-300">1. When thunder roars, go indoors!</strong>
                  <p className="mt-0.5 text-slate-300">
                    If you can hear thunder, you are close enough to be struck by lightning. Seek substantial enclosed shelter immediately.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-rose-300">2. Never shelter under isolated tall trees!</strong>
                  <p className="mt-0.5 text-slate-300">
                    Trees attract lightning and conduct deadly ground currents and side flashes to anyone beneath.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-sky-300">3. Metal cars are safe Faraday Cages!</strong>
                  <p className="mt-0.5 text-slate-300">
                    Hard-topped cars protect you because the metal frame safely routes the electrical surge around you into the ground.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-amber-300">4. Do NOT lie flat on the ground!</strong>
                  <p className="mt-0.5 text-slate-300">
                    Lying flat exposes you to maximum ground current. If stranded in the open, crouch on the balls of your feet with heels together.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-purple-300">5. Avoid indoor plumbing & corded devices!</strong>
                  <p className="mt-0.5 text-slate-300">
                    Do not take showers, wash hands, or use corded phones during active thunderstorms.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowSummaryModal(false);
                  if (score >= 3 && !isCompleted) {
                    completeLevel('level-6', 3, 250);
                  }
                }}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                I Know How to Stay Safe!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEVEL COMPLETE MODAL */}
      <LevelCompleteModal
        isOpen={isCompleted}
        levelId="level-6"
        levelTitle="Lightning Survival"
        starsEarned={3}
        xpGained={250}
        unlockedPageTitle="The Thunderstorm Survival Handbook"
        keyTakeaway="When thunder roars, go indoors! Never shelter under lonely trees or lie flat on open ground!"
        onNextLevel={() => setView('sandbox')}
        onReplay={resetChallenge}
        onClose={() => setView('map')}
      />
    </div>
  );
};
