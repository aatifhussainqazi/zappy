import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Eye, Sparkles, FlaskConical, Zap, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { ProfessorZappy } from '../character/ProfessorZappy';
import { ParticleVisualizationToggle, ParticleLegend } from '../ui/ParticleVisualization';
import { soundManager } from '../../utils/audio';

interface LabItem {
  id: string;
  type: 'balloon' | 'ruler' | 'paper' | 'metal-spoon';
  x: number;
  y: number;
  charge: number; // -1 to 1
  label: string;
}

export const FreePlayLab: React.FC = () => {
  const { setDialogue, setView, showInvisibleCharges, toggleInvisibleCharges } = useGame();

  const [items, setItems] = useState<LabItem[]>([
    { id: 'b1', type: 'balloon', x: 220, y: 150, charge: -0.8, label: 'Red Balloon (−)' },
    { id: 'b2', type: 'balloon', x: 420, y: 150, charge: 0.8, label: 'Blue Balloon (+)' },
    { id: 'r1', type: 'ruler', x: 280, y: 300, charge: 0, label: 'Plastic Ruler' },
    { id: 'p1', type: 'paper', x: 500, y: 320, charge: 0, label: 'Paper Scrap' },
  ]);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const benchRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setDialogue(
      "Welcome to the Free Play Sandbox! Spawn objects, rub them against materials, change polarities, and watch invisible electrostatic forces in action!",
      'excited'
    );
  }, []);

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (!benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setActiveItemId(id);
    const item = items.find((it) => it.id === id);
    if (item) {
      dragOffset.current = { x: mouseX - item.x, y: mouseY - item.y };
    }
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeItemId || !benchRef.current) return;
    const rect = benchRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = Math.max(20, Math.min(rect.width - 90, mouseX - dragOffset.current.x));
    const newY = Math.max(20, Math.min(rect.height - 90, mouseY - dragOffset.current.y));

    setItems((prev) => {
      const active = prev.find((it) => it.id === activeItemId);
      if (!active) return prev;

      // Check if rubbing wool area on bottom-left (x: 20 to 180, y: 260 to 440)
      const isOverWool = newX >= 10 && newX <= 180 && newY >= 240 && newY <= 440;
      let newCharge = active.charge;

      if (isOverWool && lastPos.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        if (Math.hypot(dx, dy) > 8) {
          newCharge = Math.max(-1, newCharge - 0.05);
          soundManager.playRubbing(0.7);
        }
      }

      // Check interaction forces with other items
      return prev.map((item) => {
        if (item.id === activeItemId) {
          return { ...item, x: newX, y: newY, charge: newCharge };
        }

        // Electrostatic repulsion / attraction push
        const dist = Math.hypot(item.x - newX, item.y - newY);
        if (dist < 130 && dist > 1) {
          const force = (active.charge * item.charge * 1800) / (dist * dist);
          const angle = Math.atan2(item.y - newY, item.x - newX);

          // If same charge -> repel (force > 0); if opposite -> attract (force < 0)
          const pushX = Math.cos(angle) * force;
          const pushY = Math.sin(angle) * force;

          return {
            ...item,
            x: Math.max(30, Math.min(rect.width - 90, item.x + pushX * 0.15)),
            y: Math.max(30, Math.min(rect.height - 90, item.y + pushY * 0.15)),
          };
        }

        return item;
      });
    });

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setActiveItemId(null);
    lastPos.current = null;
  };

  // Grounding / Discharge an item
  const handleGroundItem = (id: string) => {
    soundManager.playSpark();
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, charge: 0 } : it))
    );
    setDialogue("ZAP! Grounding touch neutralizes all extra charges!", 'surprised');
  };

  // Add items
  const handleSpawn = (type: 'balloon' | 'ruler' | 'paper' | 'metal-spoon') => {
    soundManager.playPop();
    const newItem: LabItem = {
      id: `item-${Date.now()}`,
      type,
      x: 200 + Math.random() * 250,
      y: 120 + Math.random() * 150,
      charge: type === 'balloon' ? -0.5 : 0,
      label: type === 'balloon' ? 'Balloon' : type === 'ruler' ? 'Ruler' : type === 'paper' ? 'Paper' : 'Metal Spoon',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleResetLab = () => {
    soundManager.playClick();
    setItems([
      { id: 'b1', type: 'balloon', x: 220, y: 150, charge: -0.8, label: 'Red Balloon (−)' },
      { id: 'b2', type: 'balloon', x: 420, y: 150, charge: 0.8, label: 'Blue Balloon (+)' },
      { id: 'r1', type: 'ruler', x: 280, y: 300, charge: 0, label: 'Plastic Ruler' },
      { id: 'p1', type: 'paper', x: 500, y: 320, charge: 0, label: 'Paper Scrap' },
    ]);
  };

  return (
    <div
      className="relative min-h-[calc(100vh-65px)] bg-slate-950 p-4 sm:p-6 overflow-hidden select-none flex flex-col justify-between"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl comic-border-lg z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView('map')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 comic-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-emerald-300 leading-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              <span>Static Electricity Laboratory (Free Play)</span>
            </h1>
            <p className="text-xs font-bold text-slate-400">
              Drag items, rub on the wool pad, ground charges, and test custom electrostatic setups!
            </p>
          </div>
        </div>

        {/* Spawner shelf */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSpawn('balloon')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl comic-border comic-button flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Balloon</span>
          </button>
          <button
            type="button"
            onClick={() => handleSpawn('ruler')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl comic-border comic-button flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-yellow-400" />
            <span>+ Ruler</span>
          </button>
          <button
            type="button"
            onClick={() => handleSpawn('paper')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl comic-border comic-button flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>+ Paper</span>
          </button>
          <button
            type="button"
            onClick={() => handleSpawn('metal-spoon')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl comic-border comic-button flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>+ Spoon</span>
          </button>

          <ParticleVisualizationToggle
            active={showInvisibleCharges}
            onToggle={toggleInvisibleCharges}
          />

          <button
            type="button"
            onClick={handleResetLab}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl comic-border comic-button"
            title="Reset Sandbox"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Sandbox Canvas */}
      <div
        ref={benchRef}
        className="relative flex-1 w-full max-w-6xl mx-auto my-3 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl comic-border-lg p-4 sm:p-8 overflow-hidden shadow-2xl min-h-[480px]"
      >
        {/* Lab Table Grid Texture */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* HUD Particle Legend */}
        {showInvisibleCharges && (
          <div className="absolute top-4 left-4 z-20">
            <ParticleLegend />
          </div>
        )}

        {/* WOOL FRICTION PAD (Bottom-Left) */}
        <div className="absolute left-6 bottom-6 w-44 h-44 rounded-3xl bg-amber-800/80 border-4 border-amber-600 comic-border-lg p-3 flex flex-col justify-between shadow-xl z-10 pointer-events-none">
          <div className="flex items-center justify-between text-xs font-black uppercase text-amber-200">
            <span>Wool Friction Pad</span>
            <span>🧶</span>
          </div>
          <div className="text-center text-amber-300/50 text-[10px] font-mono font-bold leading-tight">
            DRAG ANY OBJECT
            <br />
            HERE TO CHARGE IT!
          </div>
          <div className="text-[10px] text-center font-bold text-amber-200">
            Donates Electrons (−)
          </div>
        </div>

        {/* GROUNDING DISCHARGE ZONE (Bottom-Right) */}
        <div className="absolute right-6 bottom-6 w-44 h-44 rounded-3xl bg-emerald-950/80 border-4 border-emerald-600 comic-border-lg p-3 flex flex-col justify-between shadow-xl z-10 pointer-events-none">
          <div className="flex items-center justify-between text-xs font-black uppercase text-emerald-200">
            <span>Earth Ground Zone</span>
            <span>⚡</span>
          </div>
          <div className="text-center text-emerald-300/50 text-[10px] font-mono font-bold leading-tight">
            TAP "GROUND" BUTTON
            <br />
            TO DISCHARGE STATIC
          </div>
          <div className="text-[10px] text-center font-bold text-emerald-300">
            Removes All Static
          </div>
        </div>

        {/* DRAGGABLE LAB ITEMS */}
        {items.map((item) => {
          const isNegative = item.charge < -0.1;
          const isPositive = item.charge > 0.1;
          const isNeutral = !isNegative && !isPositive;

          return (
            <motion.div
              key={item.id}
              className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
              style={{ left: item.x, top: item.y }}
              onPointerDown={(e) => handlePointerDown(item.id, e)}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative flex flex-col items-center group">
                {/* Visual based on item type */}
                {item.type === 'balloon' ? (
                  <svg width="75" height="95" viewBox="0 0 80 100" className="drop-shadow-xl">
                    <ellipse
                      cx="40"
                      cy="42"
                      rx="34"
                      ry="40"
                      fill={isPositive ? '#ef4444' : isNegative ? '#0ea5e9' : '#64748b'}
                      stroke="#0f172a"
                      strokeWidth="3.5"
                    />
                    <ellipse cx="26" cy="28" rx="7" ry="12" fill="#ffffff" opacity="0.4" transform="rotate(-20 26 28)" />
                    <polygon points="36,82 44,82 40,88" fill="#0f172a" />
                  </svg>
                ) : item.type === 'ruler' ? (
                  <div className="w-36 h-10 rounded-md bg-sky-600 border-2 border-slate-900 shadow-lg flex items-center justify-center font-bold text-white text-[10px]">
                    📏 Plastic Ruler
                  </div>
                ) : item.type === 'paper' ? (
                  <div className="w-10 h-8 rounded bg-white border-2 border-slate-400 shadow-md flex items-center justify-center text-xs">
                    📄
                  </div>
                ) : (
                  <div className="w-28 h-6 rounded-full bg-slate-300 border-2 border-slate-700 shadow flex items-center justify-center font-black text-[9px] text-slate-800">
                    🥄 Metal Spoon
                  </div>
                )}

                {/* Charge readout & Controls */}
                <div className="mt-1 flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-700 text-[10px] font-black">
                  <span
                    className={
                      isPositive
                        ? 'text-rose-400'
                        : isNegative
                        ? 'text-sky-400'
                        : 'text-slate-400'
                    }
                  >
                    {isPositive ? `+${Math.round(item.charge * 100)}%` : isNegative ? `${Math.round(item.charge * 100)}%` : 'Neutral'}
                  </span>

                  {/* Ground Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroundItem(item.id);
                    }}
                    title="Discharge / Ground"
                    className="p-0.5 hover:bg-slate-700 rounded text-emerald-400 font-bold"
                  >
                    ⚡
                  </button>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItems((prev) => prev.filter((it) => it.id !== item.id));
                    }}
                    title="Delete item"
                    className="p-0.5 hover:bg-rose-900/60 rounded text-rose-400"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Professor Zappy */}
      <div className="relative z-30 flex items-end justify-between">
        <ProfessorZappy size="md" position="inline" mood="excited" />
      </div>
    </div>
  );
};
