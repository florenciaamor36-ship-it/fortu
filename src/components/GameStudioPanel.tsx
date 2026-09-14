import React, { useState } from 'react';
import { X, Sparkles, Upload, Image as ImageIcon, Film, Music2, Scissors, Wand2, FolderOpen, Trash2 } from 'lucide-react';
import { CasinoGame } from '../types';
import { api } from '../services/api';
import { GameCreatorTab } from './admin/GameCreatorTab';

type AssetKind = 'images' | 'videos' | 'audio';
type StudioAsset = { id: string; file: File; kind: AssetKind; url: string; status: string };

export const GameStudioPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [games] = useState<CasinoGame[]>([]);
  const [assets, setAssets] = useState<StudioAsset[]>([]);
  const [assetKind, setAssetKind] = useState<AssetKind>('images');
  const [assetFolder, setAssetFolder] = useState('nuevo-juego');
  const [removeBackground, setRemoveBackground] = useState(false);
  const [videoFrames, setVideoFrames] = useState(false);
  const [audioFormat, setAudioFormat] = useState('mp3');

  const addAssets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    const newAssets = files.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      kind: assetKind,
      url: URL.createObjectURL(file),
      status: assetKind === 'images' && removeBackground ? 'Listo para quitar fondo' : assetKind === 'videos' && videoFrames ? 'Listo para extraer fotogramas' : 'Pendiente de procesamiento',
    }));
    setAssets((current) => [...current, ...newAssets]);
    event.target.value = '';
  };

  const removeAsset = (id: string) => setAssets((current) => current.filter((asset) => asset.id !== id));
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
          <section className="mb-8 rounded-2xl border border-[#1c2d4e] bg-[#0b1426] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-white"><FolderOpen className="text-[#c5a059]" size={19} /> Biblioteca de contenido del juego</h2>
                <p className="mt-1 text-xs text-slate-400">Subí recursos y preparalos antes de guardarlos dentro de la carpeta del juego.</p>
              </div>
              <input value={assetFolder} onChange={(e) => setAssetFolder(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '-'))} placeholder="carpeta-del-juego" className="rounded-lg border border-[#263b60] bg-[#070d1a] px-3 py-2 text-xs text-white" />
            </div>
            <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                {(['images', 'videos', 'audio'] as AssetKind[]).map((kind) => (
                  <button key={kind} type="button" onClick={() => setAssetKind(kind)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs ${assetKind === kind ? 'bg-[#c5a059] font-bold text-black' : 'bg-[#111e38] text-slate-300'}`}>
                    {kind === 'images' ? <ImageIcon size={15} /> : kind === 'videos' ? <Film size={15} /> : <Music2 size={15} />}
                    {kind === 'images' ? 'Imágenes' : kind === 'videos' ? 'Videos' : 'Sonidos'}
                  </button>
                ))}
              </div>
              <div>
                <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#42628f] bg-[#070d1a] text-center hover:border-[#c5a059]">
                  <Upload className="mb-2 text-[#c5a059]" size={25} />
                  <span className="text-sm font-semibold text-white">Subir {assetKind === 'images' ? 'imágenes' : assetKind === 'videos' ? 'videos' : 'sonidos'}</span>
                  <span className="mt-1 text-[11px] text-slate-400">Podés seleccionar varios archivos</span>
                  <input type="file" multiple accept={assetKind === 'images' ? 'image/*' : assetKind === 'videos' ? 'video/*' : 'audio/*'} onChange={addAssets} className="hidden" />
                </label>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
                  {assetKind === 'images' && <label className="flex items-center gap-2"><input type="checkbox" checked={removeBackground} onChange={(e) => setRemoveBackground(e.target.checked)} /> Quitar fondo</label>}
                  {assetKind === 'videos' && <label className="flex items-center gap-2"><input type="checkbox" checked={videoFrames} onChange={(e) => setVideoFrames(e.target.checked)} /> Extraer fotogramas</label>}
                  {assetKind === 'audio' && <label className="flex items-center gap-2">Formato <select value={audioFormat} onChange={(e) => setAudioFormat(e.target.value)} className="rounded bg-[#070d1a] px-2 py-1"><option>mp3</option><option>ogg</option><option>wav</option></select></label>}
                </div>
              </div>
            </div>
            {assets.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{assets.map((asset) => <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-[#1c2d4e] bg-[#070d1a] p-3">
              {asset.kind === 'images' ? <img src={asset.url} className="h-12 w-12 rounded object-cover" /> : asset.kind === 'videos' ? <Film className="text-sky-400" /> : <Music2 className="text-emerald-400" />}
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{asset.file.name}</p><p className="text-[10px] text-slate-400">{asset.status} • {assetFolder}</p></div>
              <button type="button" onClick={() => removeAsset(asset.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={15} /></button>
            </div>)}</div>}
            <p className="mt-4 flex items-center gap-2 text-[11px] text-amber-200"><Wand2 size={14} /> La demo permite seleccionar y previsualizar archivos; la conversión real, quitar fondo y exportación a fotogramas requieren el backend/procesador.</p>
          </section>
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
