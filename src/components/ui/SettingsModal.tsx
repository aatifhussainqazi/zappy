import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Sparkles, Eye, ShieldAlert, RotateCcw, Check, Mic } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetProgress } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border-4 border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full comic-border-lg text-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-yellow-400" />
              <span>Settings & Audio</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Audio Settings */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-sky-400 tracking-wider">
                Sound & Audio
              </h3>

              {/* Master Mute Toggle */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  {settings.muted ? (
                    <VolumeX className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-sky-400" />
                  )}
                  <span className="font-bold text-sm">Mute All Audio</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ muted: !settings.muted })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.muted ? 'bg-rose-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.muted ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Music Volume Slider */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Music Volume</span>
                  <span>{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
              </div>

              {/* SFX Volume Slider */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Sound Effects Volume</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateSettings({ sfxVolume: val });
                    soundManager.playSpark();
                  }}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              {/* Voice Narration */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="font-bold text-sm">Professor Zappy Narration</div>
                    <div className="text-[11px] text-slate-400">Read dialogues aloud</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ voiceNarration: !settings.voiceNarration })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.voiceNarration ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.voiceNarration ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Accessibility & Visual Controls */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-yellow-400 tracking-wider">
                Visuals & Accessibility
              </h3>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-bold text-sm">Reduced Motion</div>
                  <div className="text-[11px] text-slate-400">Gentle, minimal animations</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.reducedMotion ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Flash (Photosensitivity) */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-bold text-sm">Reduced Screen Flashes</div>
                  <div className="text-[11px] text-slate-400">Soft glow during lightning storm</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ reducedFlash: !settings.reducedFlash })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.reducedFlash ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.reducedFlash ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Captions */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <div className="font-bold text-sm">Speech Captions</div>
                  <div className="text-[11px] text-slate-400">Show floating dialogue bubbles</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ captions: !settings.captions })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.captions ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.captions ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reset Progress */}
            <div className="pt-4 border-t border-slate-800">
              {confirmReset ? (
                <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-2xl text-center space-y-2">
                  <div className="text-xs font-bold text-rose-200">
                    Are you sure? This resets all XP, stars, and unlocked levels!
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetProgress();
                        setConfirmReset(false);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                    >
                      Yes, Reset Everything
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Progress & Saves</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
