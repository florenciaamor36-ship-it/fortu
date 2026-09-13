import React from 'react';
import { Play, Sparkles, Flame, ShieldAlert } from 'lucide-react';
import { CasinoGame } from '../types';

interface GameCardProps {
  game: CasinoGame;
  onPlay: (game: CasinoGame) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const getTagBadge = () => {
    if (!game.tag) return null;
    switch (game.tag) {
      case 'HOT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-red-950/80 text-red-300 border border-red-700/60 flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-400" />
            HOT
          </span>
        );
      case 'JACKPOT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#2b1f0c] text-[#dfb76c] border border-[#c5a059] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#dfb76c]" />
            POZO
          </span>
        );
      case 'EXCLUSIVO ARG':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#0f2845] text-[#8ec3eb] border border-[#235084]">
            ARG VIP
          </span>
        );
      case 'NUEVO':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
            NUEVO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-[#132038] text-slate-300 border border-[#25395e]">
            {game.tag}
          </span>
        );
    }
  };

  return (
    <div className="group relative rounded-xl bg-[#0a1222] border border-[#1b2a47] hover:border-[#c5a059]/80 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1">
      {/* Thumbnail area with play overlay */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#060b17]">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1222] via-[#0a1222]/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div>{getTagBadge()}</div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#070e1c]/80 backdrop-blur-sm text-slate-300 border border-[#1d2c49]">
            {game.provider}
          </span>
        </div>

        {/* Jackpot banner if available */}
        {game.jackpotAmount && (
          <div className="absolute bottom-2 left-2.5 right-2.5 bg-[#091122]/90 backdrop-blur-sm border border-[#c5a059]/60 px-2 py-1 rounded text-center">
            <span className="text-[10px] text-[#dfb76c] font-semibold">POZO: </span>
            <span className="text-xs font-mono font-bold text-[#fae5b8]">
              ${game.jackpotAmount.toLocaleString('es-AR')} Fichas
            </span>
          </div>
        )}

        {/* Hover play button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onPlay(game)}
            className="w-12 h-12 rounded-full gold-gradient-btn flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform"
          >
            <Play className="w-5 h-5 fill-current translate-x-0.5 text-[#060b17]" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <h3 className="font-cinzel font-bold text-sm text-slate-100 group-hover:text-[#fae5b8] transition-colors truncate">
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {game.subtitle}
          </p>
        </div>

        <div className="pt-2 border-t border-[#16233b] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <span>RTP</span>
            <span className="text-emerald-400 font-semibold">{game.rtp}%</span>
          </div>
          <div className="text-right font-mono text-slate-300">
            Min: <span className="text-[#fae5b8]">${game.minBet.toLocaleString('es-AR')}</span>
          </div>
        </div>

        <button
          onClick={() => onPlay(game)}
          className="w-full py-2 rounded-lg bg-[#111e36] hover:bg-[#c5a059] text-slate-200 hover:text-[#060b17] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#22365c] hover:border-[#c5a059]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Jugar con Fichas</span>
        </button>
      </div>
    </div>
  );
};
