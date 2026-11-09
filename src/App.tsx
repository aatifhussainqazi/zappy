import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { NavBar } from './components/ui/NavBar';
import { SettingsModal } from './components/ui/SettingsModal';
import { WardrobeModal } from './components/ui/WardrobeModal';
import { LandingPage } from './components/landing/LandingPage';
import { GameMap } from './components/map/GameMap';
import { DiscoveryBook } from './components/discovery/DiscoveryBook';
import { InvestigationNotebook } from './components/discovery/InvestigationNotebook';
import { Level1PaperHeist } from './components/experiments/Level1PaperHeist';
import { Level2BalloonWall } from './components/experiments/Level2BalloonWall';
import { Level3BalloonBumperCars } from './components/experiments/Level3BalloonBumperCars';
import { Level4WaterTrick } from './components/experiments/Level4WaterTrick';
import { Level5LightningStorm } from './components/experiments/Level5LightningStorm';
import { Level6LightningSurvival } from './components/experiments/Level6LightningSurvival';
import { FreePlayLab } from './components/experiments/FreePlayLab';
import { Volume2, Sparkles } from 'lucide-react';

const MainGameContainer: React.FC = () => {
  const { currentView, currentLevelId, isAudioStarted, startAudioContext } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);

  // Render view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'map':
        return <GameMap />;
      case 'discovery-book':
        return <DiscoveryBook />;
      case 'notebook':
        return <InvestigationNotebook />;
      case 'sandbox':
        return <FreePlayLab />;
      case 'experiment':
        switch (currentLevelId) {
          case 'level-1':
            return <Level1PaperHeist />;
          case 'level-2':
            return <Level2BalloonWall />;
          case 'level-3':
            return <Level3BalloonBumperCars />;
          case 'level-4':
            return <Level4WaterTrick />;
          case 'level-5':
            return <Level5LightningStorm />;
          case 'level-6':
            return <Level6LightningSurvival />;
          default:
            return <Level1PaperHeist />;
        }
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navigation */}
      <NavBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWardrobe={() => setIsWardrobeOpen(true)}
      />

      {/* Main Interactive View */}
      <main className="flex-1 flex flex-col">{renderCurrentView()}</main>

      {/* Audio Autoplay Initialization Banner (Shown on first visit if audio context not resumed yet) */}
      {!isAudioStarted && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
          <button
            type="button"
            onClick={startAudioContext}
            className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl comic-border-yellow shadow-2xl flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <Volume2 className="w-4 h-4 fill-slate-950" />
            <span>Enable Science Audio & SFX</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <WardrobeModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <GameProvider>
      <MainGameContainer />
    </GameProvider>
  );
}

export default App;
