import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ChargeMeterProps {
  charge: number; // -1 to 1 (or 0 to 1 for intensity)
  polarity?: 'negative' | 'positive' | 'neutral';
  label?: string;
  maxCharge?: number;
  showNeedle?: boolean;
}

export const ChargeMeter: React.FC<ChargeMeterProps> = ({
  charge,
  polarity = 'negative',
  label = 'Static Charge Meter',
  showNeedle = true,
}) => {
  const absCharge = Math.min(1, Math.max(0, Math.abs(charge)));
  const percentage = Math.round(absCharge * 100);

  // Rotation angle for dial needle: -60 deg to +60 deg
  const needleAngle = -60 + absCharge * 120;

  const isHigh = absCharge > 0.65;
  const isMax = absCharge >= 0.95;

  const colorScheme =
    polarity === 'positive'
      ? {
          bar: 'bg-rose-500',
          border: 'border-rose-600',
          badge: 'bg-rose-600 text-white',
          symbol: '+',
          text: 'text-rose-400',
        }
      : polarity === 'neutral'
      ? {
          bar: 'bg-slate-400',
          border: 'border-slate-500',
          badge: 'bg-slate-600 text-white',
          symbol: '±',
          text: 'text-slate-300',
        }
      : {
          bar: 'bg-sky-500',
          border: 'border-sky-600',
          badge: 'bg-sky-600 text-white',
          symbol: '−',
          text: 'text-sky-400',
        };

  return (
    <div className="bg-slate-900 text-white p-3 rounded-2xl comic-border-lg max-w-xs w-full shadow-2xl relative overflow-hidden">
      {/* Background electrical glow when high */}
      {isHigh && (
        <div className="absolute inset-0 bg-sky-500/10 animate-pulse pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className={`w-4 h-4 ${isHigh ? 'text-yellow-400 animate-bounce' : 'text-slate-400'}`} />
          <span className="text-xs font-black tracking-wider uppercase text-slate-200">
            {label}
          </span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-black ${colorScheme.badge}`}>
          {polarity.toUpperCase()} ({colorScheme.symbol})
        </span>
      </div>

      {/* Analog Gauge Dial if showNeedle */}
      {showNeedle ? (
        <div className="relative flex flex-col items-center justify-center my-1">
          {/* Dial Face SVG */}
          <svg width="150" height="85" viewBox="0 0 160 90" className="overflow-visible">
            {/* Outer Arc Frame */}
            <path
              d="M 20 80 A 60 60 0 0 1 140 80"
              fill="none"
              stroke="#334155"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Colored Active Arc */}
            <path
              d="M 20 80 A 60 60 0 0 1 140 80"
              fill="none"
              stroke={polarity === 'positive' ? '#ef4444' : '#0ea5e9'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="188.5"
              strokeDashoffset={188.5 * (1 - absCharge)}
              className="transition-all duration-150"
            />
            {/* Tick marks */}
            {[0, 0.25, 0.5, 0.75, 1].map((val, i) => {
              const angle = (-150 + val * 120) * (Math.PI / 180);
              const x1 = 80 + 52 * Math.cos(angle);
              const y1 = 80 + 52 * Math.sin(angle);
              const x2 = 80 + 64 * Math.cos(angle);
              const y2 = 80 + 64 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                />
              );
            })}

            {/* Dial Needle */}
            <g transform={`rotate(${needleAngle}, 80, 80)`} className="transition-transform duration-100 ease-out">
              <polygon points="77,80 80,26 83,80" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="7" fill="#0f172a" stroke="#facc15" strokeWidth="2.5" />
            </g>
          </svg>

          {/* Digital Percentage Display */}
          <div className="text-center -mt-3">
            <span className="text-2xl font-black tracking-tight text-yellow-300 drop-shadow">
              {percentage}%
            </span>
            <div className="text-[10px] font-bold text-slate-400">
              {isMax ? '⚡ FULLY CHARGED! ⚡' : isHigh ? 'High Charge Accumulation' : 'Rub to charge!'}
            </div>
          </div>
        </div>
      ) : (
        /* Linear Progress Bar */
        <div className="space-y-1 my-1">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Charge Level</span>
            <span className="text-yellow-300 font-black">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-4 p-0.5 border-2 border-slate-700 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${colorScheme.bar}`}
              animate={{ width: `${percentage}%` }}
              transition={{ ease: 'easeOut', duration: 0.1 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
