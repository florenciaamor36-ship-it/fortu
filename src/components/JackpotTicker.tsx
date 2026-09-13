import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Award } from 'lucide-react';

export const JackpotTicker: React.FC = () => {
  const [totalJackpot, setTotalJackpot] = useState(58450000);

  // Subtle natural jackpot counter tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalJackpot((prev) => prev + Math.floor(Math.random() * 450) + 50);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const winners = [
    { name: 'Martín G. (Rosario)', game: 'Sol de Mayo 777', amount: '$4.850.000' },
    { name: 'Florencia A. (CABA)', game: 'El Gaucho de Oro', amount: '$1.420.000' },
    { name: 'Joaquín R. (Córdoba)', game: 'Ruleta Relámpago', amount: '$850.000' },
    { name: 'Lucas B. (Mendoza)', game: 'Gran Bingo Criollo', amount: '$620.000' },
    { name: 'Esteban M. (La Plata)', game: 'Boca vs River', amount: '$390.000' },
  ];

  return (
    <div className="w-full bg-[#081122] border-y border-[#182744] py-2.5 px-4 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Progressive Jackpot Master Display */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1408] border border-[#c5a059]/40 text-[#dfb76c] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-[#dfb76c] animate-pulse" />
            <span>POZO ACUMULADO ARGENTINA</span>
          </div>

          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-xs text-[#c5a059] font-bold">FICHAS</span>
            <span className="text-base md:text-xl font-black text-[#fae5b8] tracking-tight">
              ${totalJackpot.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Right: Marquee of recent Argentine winners */}
        <div className="flex items-center gap-2 overflow-hidden w-full md:w-auto text-xs">
          <div className="flex items-center gap-1 text-slate-400 shrink-0 font-medium">
            <Trophy className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline">Últimos Premios:</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
            {winners.map((win, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 shrink-0 bg-[#0c162b] border border-[#1d2d4c] px-2.5 py-1 rounded-md text-[11px]"
              >
                <Award className="w-3 h-3 text-[#c5a059]" />
                <span className="text-slate-300 font-medium">{win.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{win.game}</span>
                <span className="text-[#fae5b8] font-mono font-bold">{win.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
