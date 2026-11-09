import React from 'react';
import { Eye, EyeOff, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleVisualizationProps {
  active: boolean;
  onToggle: () => void;
  title?: string;
  description?: string;
  mode?: 'friction' | 'polarization' | 'repulsion' | 'dipole' | 'storm';
}

export const ParticleVisualizationToggle: React.FC<{
  active: boolean;
  onToggle: () => void;
}> = ({ active, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm transition-all comic-button ${
        active
          ? 'bg-sky-500 text-white comic-border-accent ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-900'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 comic-border'
      }`}
    >
      {active ? (
        <>
          <Eye className="w-4 h-4 text-yellow-300" />
          <span>INVISI-CHARGES: ON</span>
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4 text-slate-400" />
          <span>SHOW INVISIBLE CHARGES</span>
        </>
      )}
    </button>
  );
};

export const ParticleLegend: React.FC = () => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-sm p-2.5 rounded-xl comic-border text-xs flex flex-wrap items-center gap-3 text-slate-200">
      <div className="flex items-center gap-1.5 font-bold">
        <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black border border-rose-700">
          +
        </span>
        <span>Positive Proton / Nucleus</span>
      </div>
      <div className="flex items-center gap-1.5 font-bold">
        <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-black border border-sky-700">
          −
        </span>
        <span>Negative Electron</span>
      </div>
      <div className="flex items-center gap-1.5 font-bold">
        <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] border border-slate-600">
          +/−
        </span>
        <span>Neutral (Balanced)</span>
      </div>
    </div>
  );
};

// Atom Particle SVG Element
export const AtomParticle: React.FC<{
  x: number;
  y: number;
  polarizedTowards?: { x: number; y: number } | null;
  hasExtraElectron?: boolean;
  lostElectron?: boolean;
  label?: string;
}> = ({ x, y, polarizedTowards, hasExtraElectron = false, lostElectron = false }) => {
  // If polarized, electrons shift slightly away or towards
  let electronShiftX = 0;
  let electronShiftY = 0;
  if (polarizedTowards) {
    const dx = polarizedTowards.x - x;
    const dy = polarizedTowards.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    // Electrons are pushed away from negative source, so negative sign
    electronShiftX = -(dx / dist) * 7;
    electronShiftY = -(dy / dist) * 7;
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Orbit ring */}
      <circle cx="0" cy="0" r="16" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      
      {/* Positive nucleus */}
      <circle cx="0" cy="0" r="7" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
        +
      </text>

      {/* Orbiting electrons */}
      <g transform={`translate(${electronShiftX}, ${electronShiftY})`}>
        {/* Normal electron 1 */}
        {!lostElectron && (
          <g transform="translate(14, -6)">
            <circle cx="0" cy="0" r="4.5" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.2" />
            <text x="0" y="2.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">−</text>
          </g>
        )}
        {/* Normal electron 2 */}
        <g transform="translate(-13, 8)">
          <circle cx="0" cy="0" r="4.5" fill="#0ea5e9" stroke="#0f172a" strokeWidth="1.2" />
          <text x="0" y="2.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">−</text>
        </g>
        {/* Extra transferred electron */}
        {hasExtraElectron && (
          <g transform="translate(4, 15)">
            <circle cx="0" cy="0" r="5" fill="#38bdf8" stroke="#facc15" strokeWidth="1.5" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">−</text>
          </g>
        )}
      </g>
    </g>
  );
};
