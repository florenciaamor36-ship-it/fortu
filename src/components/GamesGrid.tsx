import React, { useState, useMemo } from 'react';
import { CasinoGame, GameCategory } from '../types';
import { GameCard } from './GameCard';
import { Search, Filter, Dices, Disc, Sparkles } from 'lucide-react';

interface GamesGridProps {
  games: CasinoGame[];
  currentCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
  onPlayGame: (game: CasinoGame) => void;
}

export const GamesGrid: React.FC<GamesGridProps> = ({
  games,
  currentCategory,
  onSelectCategory,
  onPlayGame,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('todos');

  // List unique providers for provider filter
  const providers = useMemo(() => {
    const list = Array.from(new Set(games.map((g) => g.provider)));
    return ['todos', ...list];
  }, [games]);

  // Filter games based on category, search, and provider
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Category filter
      if (currentCategory !== 'todos' && currentCategory !== 'destacados') {
        if (game.category !== currentCategory) return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = game.title.toLowerCase().includes(q);
        const matchSubtitle = game.subtitle.toLowerCase().includes(q);
        const matchTag = game.tag?.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchTag) return false;
      }
      // Provider filter
      if (selectedProvider !== 'todos' && game.provider !== selectedProvider) {
        return false;
      }
      return true;
    });
  }, [games, currentCategory, searchQuery, selectedProvider]);

  const getSectionTitle = () => {
    switch (currentCategory) {
      case 'slots':
        return 'Máquinas Tragamonedas de Alta Ganancia';
      case 'ruleta':
        return 'Ruletas Europeas & En Vivo';
      case 'bingo':
        return 'Salones de Bingo Criollo & Videobingo';
      case 'apuestas':
        return 'Apuestas Deportivas en Vivo';
      case 'destacados':
        return 'Juegos Destacados y Pozos Millonarios';
      default:
        return 'Catálogo General de Juegos';
    }
  };

  return (
    <section className="space-y-6">
      {/* Category header and filters toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182642] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
            {getSectionTitle()}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Mostrando {filteredGames.length} juegos optimizados con sistema oficial de fichas
          </p>
        </div>

        {/* Search & Provider Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-grow md:flex-grow-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar juego, pozo..."
              className="w-full bg-[#0b1324] border border-[#203150] focus:border-[#c5a059] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Provider selector */}
          <div className="flex items-center gap-1.5 bg-[#0b1324] border border-[#203150] rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer"
            >
              <option value="todos" className="bg-[#0b1324] text-slate-200">
                Todos los Proveedores
              </option>
              {providers
                .filter((p) => p !== 'todos')
                .map((p) => (
                  <option key={p} value={p} className="bg-[#0b1324] text-slate-200">
                    {p}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlayGame} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#0a1222] border border-[#1b2b48] rounded-xl p-8">
          <Dices className="w-12 h-12 text-[#c5a059] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-200">
            No se encontraron juegos con ese criterio
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Prueba a buscar con otro nombre o reinicia los filtros para ver todos los títulos disponibles.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('todos');
              onSelectCategory('todos');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold gold-gradient-btn rounded-lg"
          >
            Ver Todo el Catálogo
          </button>
        </div>
      )}
    </section>
  );
};
