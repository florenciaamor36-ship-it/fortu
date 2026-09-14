import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { CasinoGame } from '../types';
import { api } from '../services/api';
import { GameCreatorTab } from './admin/GameCreatorTab';

export const GameStudioPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [games] = useState<CasinoGame[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<'slots' | 'ruleta' | 'bingo'>('slots');
  const [skinId, setSkinId] = useState('slot-faraon');
  const [rtp, setRtp] = useState(96.8);
  const [minBet, setMinBet] = useState(500);
  const [maxBet, setMaxBet] = useState(50000);
  const [volatility, setVolatility] = useState<'Baja' | 'Media' | 'Alta' | 'Muy Alta'>('Alta');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80');
  const [features, setFeatures] = useState('Cascadas Megaways, Giros Gratis, Multiplicadores Dinámicos');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsCreating(true);
    setMessage('');
    try {
      await api.createCustomGame({
        title: title.trim(),
        subtitle: subtitle.trim() || 'Edición Demo',
        category,
        skinId,
        rtp: Number(rtp) || 96.5,
        minBet: Number(minBet) || 500,
        maxBet: Number(maxBet) || 50000,
        volatility,
        thumbnail,
        description: 'Juego demo creado desde Game Studio.',
        features: features.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setMessage('Juego creado en el backend.');
    } catch {
      setMessage('Modo visual: el backend no está conectado en GitHub Pages.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050912]/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto rounded-3xl border border-[#c5a059]/40 bg-[#080f1d] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#1c2d4e] bg-[#080f1d] px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c5a059] bg-[#281a0b] text-[#dfb76c]"><Sparkles size={20} /></div>
            <div>
              <h1 className="font-serif text-lg font-bold text-white">Game Studio &amp; AI Forge</h1>
              <p className="text-xs text-slate-400">Panel independiente de creación de juegos</p>
            </div>
          </div>
          <button onClick={onClose} className="flex items-center gap-2 rounded-xl bg-[#142038] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#1c2c4d]">
            <X size={16} /> Volver al casino
          </button>
        </header>
        <main className="p-5 md:p-8">
          {message && <div className="mb-4 rounded-xl border border-[#c5a059]/40 bg-[#20170a] px-4 py-3 text-sm text-[#fae5b8]">{message}</div>}
          <GameCreatorTab
            existingGames={games}
            isCreating={isCreating}
            onSubmit={handleSubmit}
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            category={category}
            setCategory={setCategory}
            skinId={skinId}
            setSkinId={setSkinId}
            rtp={rtp}
            setRtp={setRtp}
            minBet={minBet}
            setMinBet={setMinBet}
            maxBet={maxBet}
            setMaxBet={setMaxBet}
            volatility={volatility}
            setVolatility={setVolatility}
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            features={features}
            setFeatures={setFeatures}
          />
        </main>
      </div>
    </div>
  );
};
