import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Microscope, 
  Sparkles, 
  Building, 
  Car, 
  TreePine, 
  Award,
  Radio,
  Flame,
  Volume2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { InvisibleWorldToggle } from '../ui/InvisibleWorldToggle';
import { OptionalLearningModal } from '../ui/OptionalLearningModal';
import { soundManager } from '../../utils/audio';

type DecisionStep = 'warning' | 'shelter_choice' | 'debrief';

interface ScenarioChoice {
  id: string;
  title: string;
  icon: string;
  isSafe: boolean;
  consequence: string;
  physicsReason: string;
}

const STAGE_CHOICES: ScenarioChoice[] = [
  {
    id: 'outpost',
    title: 'Enter the Desert Research Outpost (Enclosed Building)',
    icon: '🏠',
    isSafe: true,
    consequence: 'SAFE & PROTECTED! The building interior remained completely shielded.',
    physicsReason: 'Substantial enclosed buildings with internal electrical wiring and plumbing safely channel lightning surge directly into the ground surrounding the structure.',
  },
  {
    id: 'jeep',
    title: 'Shelter inside the Hard-Topped Metal 4x4 Jeep',
    icon: '🚗',
    isSafe: true,
    consequence: 'SAFE & PROTECTED! The vehicle acted as a mobile Faraday cage.',
    physicsReason: 'The metal exterior shell of a hard-topped vehicle forms a conductive Faraday Cage, directing lightning current around the outside of the vehicle safely into the earth.',
  },
  {
    id: 'tree',
    title: 'Run underneath the Tall Isolated Desert Acacia Tree',
    icon: '🌳',
    isSafe: false,
    consequence: 'LETHAL HAZARD! The tree was struck, blasting side-flashes across the trunk!',
    physicsReason: 'Isolated tall objects attract lightning. When struck, explosive energy shoots outward as lethal ground currents and side-flashes to anyone standing nearby.',
  },
  {
    id: 'flat_ground',
    title: 'Lie flat on the damp open desert plateau ground',
    icon: '🌾',
    isSafe: false,
    consequence: 'EXTREME GROUND CURRENT RISK! Electricity travels through the soil!',
    physicsReason: 'Lying flat maximizes your physical contact area with the ground. If lightning strikes anywhere within several hundred feet, ground current travels through your vital organs.',
  },
];

export const Level6LightningSurvival: React.FC = () => {
  const { setDialogue, completeLevel, startLevel, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [currentStep, setCurrentStep] = useState<DecisionStep>('warning');
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [decisionsHistory, setDecisionsHistory] = useState<ScenarioChoice[]>([]);

  // Modals
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLearningChoice, setShowLearningChoice] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    soundManager.setMusicTrack('storm');
    setDialogue(
      "Case 06: The Desert Storm! You are leading a desert trek when a thunderstorm alert arrives. What do you do before lightning strikes?",
      'surprised'
    );

    return () => {
      soundManager.setMusicTrack('lab');
    };
  }, []);

  const handleMakeChoice = (choice: ScenarioChoice) => {
    soundManager.playClick();
    setSelectedChoice(choice);
    setDecisionsHistory((prev) => [...prev, choice]);

    if (choice.isSafe) {
      soundManager.playFanfare();
      soundManager.playSpark();
      setDialogue(
        `EXCELLENT DECISION! ${choice.consequence} Learn why the physics protected you!`,
        'celebrating'
      );
      if (!isCompleted) {
        setIsCompleted(true);
        completeLevel('level-6', 3, 250);
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#facc15', '#ffffff'],
        });

        setTimeout(() => {
          setShowLearningChoice(true);
        }, 1200);
      }
    } else {
      soundManager.playWrong();
      soundManager.playThunder(false);
      setDialogue(
        `CRITICAL SAFETY ALERT! ${choice.consequence} Review the physical hazard!`,
        'thinking'
      );
    }

    setCurrentStep('debrief');
  };

  const resetChallenge = () => {
    soundManager.playClick();
    setCurrentStep('warning');
    setSelectedChoice(null);
    setDecisionsHistory([]);
    setIsCompleted(false);
    setShowLearningChoice(false);
    setShowExplanation(false);
    setDialogue(
      "Scenario reset! Evaluate the weather warning and pick the safest real-world physics shelter!",
      'excited'
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] bg-slate-950 p-3 sm:p-6 overflow-hidden select-none flex flex-col justify-between">
      {/* Top Objective Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black flex items-center justify-center comic-border-yellow text-lg shadow">
            #6
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                CASE 06
              </span>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                The Desert Storm
              </h1>
            </div>
            <p className="text-xs font-bold text-amber-300">
              When thunder roars, go indoors! Decide on safe shelter before the storm hits.
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
            onClick={resetChallenge}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl comic-border comic-button"
            title="Reset Scenario"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Desert Trekking Scenario Arena */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto my-3 bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 rounded-3xl comic-border-lg p-5 sm:p-8 overflow-hidden shadow-2xl min-h-[460px] border-2 border-slate-700 flex flex-col justify-between">
        {/* Desert Storm Horizon Texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-amber-950/40 pointer-events-none" />

        {/* Weather Alert Radio Dispatch Header */}
        <div className="relative z-20 bg-slate-950/90 border border-amber-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                NATIONAL WEATHER SERVICE ALERT
              </span>
              <div className="text-xs sm:text-sm font-black text-white">
                Severe thunderstorm rapidly approaching plateau! Lightning strikes detected within 5 miles.
              </div>
            </div>
          </div>

          <div className="text-right text-[10px] font-mono text-slate-400 hidden sm:block">
            NO SAFE PLACE OUTDOORS
          </div>
        </div>

        {/* Active Scenario Decision Display */}
        <div className="relative z-20 my-4 flex-1 flex flex-col justify-center">
          {currentStep === 'warning' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-yellow-300">
                  Where Should Pip Seek Shelter Immediately?
                </h2>
                <p className="text-xs text-slate-300">
                  Select an action based on physics principles of static electricity and charge grounding:
                </p>
              </div>

              {/* 4 Decision Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-3xl mx-auto w-full">
                {STAGE_CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleMakeChoice(choice)}
                    className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 hover:border-yellow-400 text-left transition-all comic-button shadow-lg flex items-start gap-3 group"
                  >
                    <span className="text-3xl p-2 bg-slate-950 rounded-xl group-hover:scale-110 transition-transform">
                      {choice.icon}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-black text-white group-hover:text-yellow-300 transition-colors">
                        {choice.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Click to execute decision
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'debrief' && selectedChoice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto w-full bg-slate-950/95 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <span className="text-4xl">{selectedChoice.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedChoice.isSafe ? (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED SAFE</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-400 border border-rose-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>LETHAL HAZARD</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {selectedChoice.title}
                  </h3>
                </div>
              </div>

              {/* Consequence feedback */}
              <div className={`p-4 rounded-2xl border ${
                selectedChoice.isSafe
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}>
                <div className="text-xs font-black uppercase mb-1">Observation:</div>
                <div className="text-sm font-bold">{selectedChoice.consequence}</div>
              </div>

              {/* Physical mechanism */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <div className="text-[10px] font-black uppercase text-amber-400 mb-1">
                  The Underlying Physics:
                </div>
                {selectedChoice.physicsReason}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('warning')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl comic-border comic-button"
                >
                  Test Another Shelter Decision
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* NWS Safety Truth Banner at Bottom of Arena */}
        <div className="relative z-20 bg-slate-950/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold text-yellow-300">
            ⚠️ Critical Truth: The "lightning crouch" does NOT make someone safe outdoors.
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Plan ahead and seek enclosed structures immediately!
          </span>
        </div>
      </div>

      {/* Bottom Professor Zappy & Action Bar */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy
          size="md"
          position="inline"
          mood={isCompleted ? 'celebrating' : 'thinking'}
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
              onClick={() => setView('notebook')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl comic-border comic-button flex items-center gap-1.5"
            >
              <span>Investigation Notebook →</span>
            </button>
          </div>
        )}
      </div>

      {/* OPTIONAL LEARNING MODAL */}
      <OptionalLearningModal
        isOpen={showLearningChoice}
        levelTitle="The Desert Storm"
        onKeepExperimenting={() => setShowLearningChoice(false)}
        onLearnWhy={() => {
          setShowLearningChoice(false);
          setShowExplanation(true);
        }}
        onTryQuestion={() => {
          setShowLearningChoice(false);
          setCurrentStep('warning');
        }}
        onNextLevel={() => setView('notebook')}
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
                  <span>The Physics of Lightning Safety</span>
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
                  <strong>No safe place outdoors:</strong> The National Weather Service emphasizes that when thunder is audible, lightning is already close enough to strike you. There is no guaranteed safe outdoor stance or location.
                </p>
                <p>
                  <strong>Faraday Cages in Action:</strong> Metal hard-topped vehicles protect occupants because charge stays on the outer metal skin and flows around to the ground. Rubber tires do NOT insulate 300 million volts!
                </p>
                <p>
                  <strong>Ground Currents & Isolated Trees:</strong> Over 50% of lightning casualties occur from ground currents spreading outward from trees or structures. Standing near tall objects makes you a prime conduit for side-flashes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExplanation(false)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl comic-border-yellow"
              >
                Back to Scenario
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};