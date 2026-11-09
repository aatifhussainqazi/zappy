import React from 'react';
import { Eye, Microscope, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface InvisibleWorldToggleProps {
  active: boolean;
  onToggle: () => void;
  className?: string;
  variant?: 'compact' | 'prominent';
}

export const InvisibleWorldToggle: React.FC<InvisibleWorldToggleProps> = ({
  active,
  onToggle,
  className = '',
  variant = 'prominent',
}) => {
  const handleClick = () => {
    soundManager.playClick();
    onToggle();
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`px-3 py-1.5 rounded-xl font-black text-xs comic-border comic-button flex items-center gap-1.5 transition-all ${
          active
            ? 'bg-sky-400 text-slate-950 shadow-[0_0_12px_#38bdf8] border-sky-200'
            : 'bg-slate-800 text-slate-300 hover:text-white'
        } ${className}`}
        title="Toggle Invisible Charges View"
      >
        <Microscope className="w-3.5 h-3.5" />
        <span>{active ? 'Invisible Mode ON' : 'Invisible World'}</span>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 bg-slate-950/90 rounded-2xl comic-border border-2 border-slate-700 shadow-xl ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (active) handleClick();
        }}
        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
          !active
            ? 'bg-slate-800 text-yellow-300 comic-border shadow-md'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Eye className="w-3.5 h-3.5" />
        <span>REAL WORLD</span>
      </button>

      <button
        type="button"
        onClick={() => {
          if (!active) handleClick();
        }}
        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
          active
            ? 'bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-950 comic-border shadow-[0_0_16px_rgba(56,189,248,0.7)] animate-pulse'
            : 'text-slate-400 hover:text-sky-300'
        }`}
      >
        <Microscope className="w-3.5 h-3.5" />
        <span>INVISIBLE WORLD</span>
        <Sparkles className="w-3 h-3 text-yellow-300" />
      </button>
    </div>
  );
};