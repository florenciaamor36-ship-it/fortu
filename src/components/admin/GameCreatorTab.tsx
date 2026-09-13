import React, { useState } from 'react';
import { CasinoGame } from '../../types';
import {
  Sparkles,
  Layers,
  Plus,
  Play,
  CheckCircle,
  HelpCircle,
  Sliders,
  Flame,
  Image as ImageIcon,
  Tag,
  Dices,
} from 'lucide-react';

interface GameCreatorTabProps {
  existingGames: CasinoGame[];
  isCreating: boolean;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  setTitle: (val: string) => void;
  subtitle: string;
  setSubtitle: (val: string) => void;
  category: 'slots' | 'ruleta' | 'bingo';
  setCategory: (val: 'slots' | 'ruleta' | 'bingo') => void;
  skinId: string;
  setSkinId: (val: string) => void;
  rtp: number;
  setRtp: (val: number) => void;
  minBet: number;
  setMinBet: (val: number) => void;
  maxBet: number;
  setMaxBet: (val: number) => void;
  volatility: 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
  setVolatility: (val: 'Baja' | 'Media' | 'Alta' | 'Muy Alta') => void;
  thumbnail: string;
  setThumbnail: (val: string) => void;
  features: string;
  setFeatures: (val: string) => void;
}

const PRESET_TEMPLATES = [
  {
    title: 'Tango & Fuego 777',
    subtitle: 'Megaways™ Rioplatense',
    category: 'slots' as const,
    skinId: 'slot-gaucho-de-oro',
    rtp: 96.9,
    minBet: 500,
    maxBet: 75000,
    volatility: 'Alta' as const,
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    features: 'Cascadas Megaways, Multiplicador x500, Giros Gratis Porteños',
  },
  {
    title: 'Gladiadores del Obelisco',
    subtitle: 'Edición Coliseo Argentino',
    category: 'slots' as const,
    skinId: 'slot-faraon',
    rtp: 97.1,
    minBet: 1000,
    maxBet: 100000,
    volatility: 'Muy Alta' as const,
    thumbnail: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=600&q=80',
    features: 'Comodín Expansivo, Compra de Bono, Pozo Progresivo',
  },
  {
    title: 'Ruleta Imperial de Mayo',
    subtitle: 'Cilindro Francés VIP',
    category: 'ruleta' as const,
    skinId: 'ruleta-relampago',
    rtp: 97.3,
    minBet: 1000,
    maxBet: 250000,
    volatility: 'Media' as const,
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    features: 'Multiplicadores Relámpago hasta x500, Pista Francesa Vecinos del Cero',
  },
  {
    title: 'Gran Bingo Pampeano 90',
    subtitle: 'Salón Clásico de Cartones',
    category: 'bingo' as const,
    skinId: 'bingo-criollo',
    rtp: 95.8,
    minBet: 200,
    maxBet: 20000,
    volatility: 'Media' as const,
    thumbnail: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    features: 'Extrabolas Doradas, Premio Línea Rápida, Pozo Acumulado Pampeano',
  },
];

export const GameCreatorTab: React.FC<GameCreatorTabProps> = ({
  existingGames,
  isCreating,
  onSubmit,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  category,
  setCategory,
  skinId,
  setSkinId,
  rtp,
  setRtp,
  minBet,
  setMinBet,
  maxBet,
  setMaxBet,
  volatility,
  setVolatility,
  thumbnail,
  setThumbnail,
  features,
  setFeatures,
}) => {
  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTitle(preset.title);
    setSubtitle(preset.subtitle);
    setCategory(preset.category);
    setSkinId(preset.skinId);
    setRtp(preset.rtp);
    setMinBet(preset.minBet);
    setMaxBet(preset.maxBet);
    setVolatility(preset.volatility);
    setThumbnail(preset.thumbnail);
    setFeatures(preset.features);
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner: Container Architecture (No HTML needed) */}
      <div className="bg-gradient-to-r from-[#141b2d] via-[#10192e] to-[#0d1424] border border-[#233554] rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#281a0b] border border-[#c5a059] flex items-center justify-center text-[#dfb76c]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base">
              Arquitectura de Carpetas Contenedores (Escalable a +10.000 Juegos)
            </h3>
            <p className="text-xs text-slate-300">
              Cada juego nuevo se monta dentro de un <strong>contenedor modular universal</strong>. No necesitas crear un archivo HTML por cada juego.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-[#080e1b] border border-[#1a2b47] p-3 rounded-xl">
            <span className="font-bold text-[#c5a059] block mb-1">1. Motor Matemático Único</span>
            <p className="text-slate-400">
              El motor certificado (RNG, líneas de pago, multiplicadores, física de ruleta o bolillero) reside en el servidor y se reutiliza para todos los títulos.
            </p>
          </div>

          <div className="bg-[#080e1b] border border-[#1a2b47] p-3 rounded-xl">
            <span className="font-bold text-[#38bdf8] block mb-1">2. Máscaras / Skins Visuales</span>
            <p className="text-slate-400">
              El contenedor aplica la máscara temática visual (símbolos, audio, colores y tipografía) dinámicamente según el ID seleccionado.
            </p>
          </div>

          <div className="bg-[#080e1b] border border-[#1a2b47] p-3 rounded-xl">
            <span className="font-bold text-emerald-400 block mb-1">3. Publicación Instantánea</span>
            <p className="text-slate-400">
              Al guardar aquí, el juego aparece al instante en el lobby de los jugadores, disponible para apostar con saldo real de fichas.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Templates Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Plantillas Rápidas para Montar en 1 Clic:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_TEMPLATES.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="p-2.5 rounded-xl bg-[#0b1426] hover:bg-[#111e38] border border-[#1c2c4d] text-left transition flex flex-col justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-white group-hover:text-[#c5a059] block truncate">
                  {p.title}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{p.category} • RTP {p.rtp}%</span>
              </div>
              <span className="text-[10px] text-[#38bdf8] mt-2 font-medium">Cargar Datos →</span>
            </button>
          ))}
        </div>
      </div>

      {/* Creation Form */}
      <div className="bg-[#0b1426] border border-[#1c2c4d] rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#182642] pb-3">
          <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
            <Sparkles className="text-[#c5a059]" size={18} /> Montar Nuevo Juego en su Contenedor
          </h4>
          <span className="text-[11px] text-slate-400">
            Los datos se guardan en la BBDD activa y se reflejan en el Lobby
          </span>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Nombre / Título del Juego:
              </label>
              <input
                type="text"
                required
                placeholder="ej. Tango Salvaje Megaways"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Subtítulo / Edición:
              </label>
              <input
                type="text"
                placeholder="ej. Megaways™ Exclusivo Argentino"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Categoría del Contenedor:
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as 'slots' | 'ruleta' | 'bingo';
                  setCategory(cat);
                  if (cat === 'slots') setSkinId('slot-faraon');
                  else if (cat === 'ruleta') setSkinId('ruleta-relampago');
                  else if (cat === 'bingo') setSkinId('bingo-criollo');
                }}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="slots">Tragamonedas (Slots)</option>
                <option value="ruleta">Ruleta en Vivo / Francesa</option>
                <option value="bingo">Bingo Criollo Multicartón</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Máscara Visual / Skin Base:
              </label>
              <select
                value={skinId}
                onChange={(e) => setSkinId(e.target.value)}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {category === 'slots' && (
                  <>
                    <option value="slot-gaucho-de-oro">Gaucho de Oro (Megaways Pampa)</option>
                    <option value="slot-faraon">El Faraón del Nilo (Egipto Oro)</option>
                    <option value="slot-cleopatra">Cleopatra Reina del Desierto</option>
                    <option value="slot-duendes">Duendes de la Fortuna Celta</option>
                  </>
                )}
                {category === 'ruleta' && (
                  <>
                    <option value="ruleta-relampago">Ruleta Criolla Relámpago (x500 Multiplicador)</option>
                    <option value="ruleta-europea">Ruleta Clásica Francesa</option>
                  </>
                )}
                {category === 'bingo' && (
                  <>
                    <option value="bingo-criollo">Bingo Criollo Tradicional 90 Bolas</option>
                    <option value="bingo-rapido">Bingo Express 75 Bolas</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Volatilidad:
              </label>
              <select
                value={volatility}
                onChange={(e) => setVolatility(e.target.value as any)}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Baja">Baja (Premios frecuentes pequeños)</option>
                <option value="Media">Media (Balanceada)</option>
                <option value="Alta">Alta (Grandes pagos ocasionales)</option>
                <option value="Muy Alta">Muy Alta (Jackpots masivos)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Retorno al Jugador (RTP %):
              </label>
              <input
                type="number"
                step="0.1"
                min="90"
                max="99"
                required
                value={rtp}
                onChange={(e) => setRtp(Number(e.target.value))}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Apuesta Mínima ($ Fichas):
              </label>
              <input
                type="number"
                step="100"
                min="100"
                required
                value={minBet}
                onChange={(e) => setMinBet(Number(e.target.value))}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Apuesta Máxima ($ Fichas):
              </label>
              <input
                type="number"
                step="5000"
                min="1000"
                required
                value={maxBet}
                onChange={(e) => setMaxBet(Number(e.target.value))}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                URL de Imagen / Portada:
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Características (Separadas por comas):
              </label>
              <input
                type="text"
                placeholder="ej. Giros Gratis, Cascadas, Multiplicador x500"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a059] via-[#dfb76c] to-[#c5a059] hover:opacity-95 text-black font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Montando Juego en Contenedor...' : 'Publicar Juego en el Casino Inmediatamente'}
          </button>
        </form>
      </div>

      {/* Catalog of Games Currently Loaded in Containers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif font-bold text-white text-sm">
            Catálogo Activo en Contenedores ({existingGames.length} Juegos en Total)
          </h4>
          <span className="text-xs text-slate-400">
            Todos comparten los motores sin archivos HTML individuales
          </span>
        </div>

        <div className="bg-[#0b1426] border border-[#1b2b48] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070c18] border-b border-[#1b2b48] text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Juego & Portada</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3">Máscara / Skin</th>
                  <th className="p-3">RTP</th>
                  <th className="p-3">Rango Apuesta</th>
                  <th className="p-3">Volatilidad</th>
                  <th className="p-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132038]">
                {existingGames.map((g) => (
                  <tr key={g.id} className="hover:bg-[#0e192f]">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={g.thumbnail}
                          alt={g.title}
                          className="w-9 h-9 rounded-lg object-cover border border-[#233554]"
                        />
                        <div>
                          <span className="font-bold text-white block">{g.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{g.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 capitalize">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#13203b] text-slate-300">
                        {g.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">
                      {g.skinId || 'default'}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#c5a059]">
                      {g.rtp}%
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      ${g.minBet.toLocaleString('es-AR')} - ${g.maxBet.toLocaleString('es-AR')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1e152f] text-[#c084fc]">
                        {g.volatility}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle className="w-3 h-3" /> ACTIVO
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
