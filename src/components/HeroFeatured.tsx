import React from 'react';
import { Play, Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';
import { CasinoGame } from '../types';

interface HeroFeaturedProps {
  game: CasinoGame;
  onPlayGame?: (game: CasinoGame) => void;
  onOpenCashier?: () => void;
  onPlay?: () => void;
  onExplore?: () => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  game,
  onPlayGame,
  onOpenCashier,
  onPlay,
  onExplore,
}) => {
  const handlePlay = () => {
    if (typeof onPlay === 'function') {
      onPlay();
    } else if (typeof onPlayGame === 'function') {
      onPlayGame(game);
    }
  };

  const handleCashierOrExplore = () => {
    if (typeof onOpenCashier === 'function') {
      onOpenCashier();
    } else if (typeof onExplore === 'function') {
      onExplore();
    }
  };
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#091122] via-[#0d1830] to-[#131f3d] border border-[#233556] p-6 md:p-10 mb-10 shadow-2xl">
      {/* Subtle background ambient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#c5a059]/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Game details & CTA */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#2a2010] text-[#dfb76c] border border-[#c5a059]/60">
              <Sparkles className="w-3 h-3 text-[#dfb76c]" />
              JUEGO DESTACADO DE LA SEMANA
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#11243e] text-[#70a9d4] border border-[#234571]">
              Exclusivo Argentina
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
              RTP {game.rtp}%
            </span>
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-cinzel font-black tracking-wide text-white leading-tight">
              {game.title}
            </h1>
            <p className="text-base md:text-lg text-[#dfb76c] font-medium mt-1">
              {game.subtitle}
            </p>
          </div>

          <p className="text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
            {game.description}
          </p>

          {/* Key Game Features Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {game.features.map((feat, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-md bg-[#0a1222] border border-[#1e2d49] text-slate-300 font-medium"
              >
                ✓ {feat}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="pt-3 flex flex-wrap items-center gap-4">
            <button
              id="hero-play-btn"
              onClick={handlePlay}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl gold-gradient-btn font-bold text-sm md:text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>JUGAR CON FICHAS</span>
            </button>

            <button
              id="hero-cashier-btn"
              onClick={handleCashierOrExplore}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#111c33] hover:bg-[#182848] text-[#f5e4be] border border-[#2b3e63] font-semibold text-sm transition-colors"
            >
              <span>Cargar Fichas</span>
              <ChevronRight className="w-4 h-4 text-[#c5a059]" />
            </button>
          </div>

          {/* Proof seals */}
          <div className="pt-2 flex items-center gap-5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#c5a059]" />
              <span>Cifrado SHA-256 Inalterable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#70a9d4]" />
              <span>Pagos Instantáneos en Fichas</span>
            </div>
          </div>
        </div>

        {/* Right column: Game banner display with interactive simulator launcher */}
        <div className="lg:col-span-5">
          <div className="relative group rounded-2xl overflow-hidden border-2 border-[#c5a059]/40 hover:border-[#c5a059] shadow-2xl transition-all">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-full h-72 md:h-80 object-cover transform group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b17] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

            {/* Jackpot overlay badge */}
            {game.jackpotAmount && (
              <div className="absolute top-4 right-4 bg-[#0a1222]/90 backdrop-blur-sm border border-[#c5a059] px-3 py-1.5 rounded-lg text-right shadow-lg">
                <div className="text-[10px] text-[#dfb76c] font-bold uppercase tracking-wider">
                  Pozo Máximo
                </div>
                <div className="text-base font-black text-[#fae5b8] font-mono">
                  ${game.jackpotAmount.toLocaleString('es-AR')} Fichas
                </div>
              </div>
            )}

            {/* Play overlay button on image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => onPlayGame(game)}
                className="w-16 h-16 rounded-full bg-[#c5a059]/90 hover:bg-[#dfb76c] text-[#060b17] flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95"
              >
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
              <span className="bg-[#0b1426]/80 px-2 py-1 rounded backdrop-blur-sm border border-[#203150]">
                Líneas: {game.lines?.toLocaleString('es-AR') || 'Megaways'}
              </span>
              <span className="bg-[#0b1426]/80 px-2 py-1 rounded backdrop-blur-sm border border-[#203150] text-[#dfb76c]">
                Apuesta: ${game.minBet.toLocaleString('es-AR')} - ${game.maxBet.toLocaleString('es-AR')} Fichas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
