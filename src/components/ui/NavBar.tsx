import React from 'react';
import { Sparkles, BookOpen, FlaskConical, Map, Settings, Volume2, VolumeX, Shirt } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../utils/audio';

interface NavBarProps {
  onOpenSettings: () => void;
  onOpenWardrobe: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ onOpenSettings, onOpenWardrobe }) => {
  const { stats, settings, updateSettings, currentView, setView, isAudioStarted, startAudioContext } = useGame();

  const handleToggleMute = () => {
    startAudioContext();
    updateSettings({ muted: !settings.muted });
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b-4 border-slate-950 px-3 sm:px-6 py-2.5 flex items-center justify-between text-white shadow-xl">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setView('landing')}
          className="flex items-center gap-2 group text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-yellow-400 p-0.5 comic-border shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-2xl drop-shadow">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-yellow-300 drop-shadow-[0_2px_0_#0f172a] group-hover:text-yellow-200 transition-colors">
                STATIC! 2.0
              </span>
            </div>
            <span className="hidden md:inline-block text-[10px] font-black uppercase tracking-wider text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-600/50">
              The Invisible Case Files
            </span>
          </div>
        </button>
      </div>

      {/* Center Navigation Shortcuts */}
      <nav className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setView('map')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm comic-button ${
            currentView === 'map'
              ? 'bg-yellow-400 text-slate-950 comic-border-yellow'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border'
          }`}
        >
          <Map className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Case Files</span>
        </button>

        <button
          type="button"
          onClick={() => setView('notebook')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm comic-button ${
            currentView === 'notebook'
              ? 'bg-yellow-400 text-slate-950 comic-border-yellow'
              : 'bg-slate-800 hover:bg-slate-700 text-yellow-300 comic-border'
          }`}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="hidden sm:inline">Notebook</span>
        </button>

        <button
          type="button"
          onClick={() => setView('discovery-book')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm comic-button ${
            currentView === 'discovery-book'
              ? 'bg-yellow-400 text-slate-950 comic-border-yellow'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Discovery Book</span>
        </button>

        <button
          type="button"
          onClick={() => setView('sandbox')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm comic-button ${
            currentView === 'sandbox'
              ? 'bg-yellow-400 text-slate-950 comic-border-yellow'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Free Play</span>
        </button>
      </nav>

      {/* Right Controls: XP, Wardrobe, Audio, Settings */}
      <div className="flex items-center gap-2">
        {/* XP & Rank pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-xl border-2 border-slate-800">
          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
          <div className="text-left text-xs">
            <div className="font-extrabold text-yellow-300 leading-none">{stats.xp} XP</div>
            <div className="text-[10px] text-slate-400 font-bold truncate max-w-[110px]">{stats.rank}</div>
          </div>
        </div>

        {/* Zappy Wardrobe */}
        <button
          type="button"
          onClick={onOpenWardrobe}
          title="Zappy Wardrobe & Accessories"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl comic-border comic-button"
        >
          <Shirt className="w-4 h-4 text-pink-400" />
        </button>

        {/* Mute / Unmute */}
        <button
          type="button"
          onClick={handleToggleMute}
          title={settings.muted ? 'Unmute Audio' : 'Mute Audio'}
          className={`p-2 rounded-xl comic-border comic-button ${
            settings.muted
              ? 'bg-rose-900/60 text-rose-300 border-rose-700'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          {settings.muted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Game & Accessibility Settings"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl comic-border comic-button"
        >
          <Settings className="w-4 h-4 text-yellow-400" />
        </button>
      </div>
    </header>
  );
};
