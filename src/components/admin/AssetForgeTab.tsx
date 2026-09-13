import React, { useState, useRef } from 'react';
import { CasinoGame } from '../../types';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Video,
  Volume2,
  Play,
  CheckCircle2,
  Upload,
  RefreshCw,
  Sliders,
  Scissors,
  Layers,
  Check,
  Music,
  VolumeX,
  Crop,
  Clock,
  Dices,
  CircleDot,
  Flame,
  CreditCard,
} from 'lucide-react';

interface AssetForgeTabProps {
  onGameCreated?: (game: CasinoGame) => void;
}

export const AssetForgeTab: React.FC<AssetForgeTabProps> = ({ onGameCreated }) => {
  const [activeSubTab, setActiveSubTab] = useState<'symbols' | 'animations' | 'audio' | 'sandbox'>('symbols');
  const [selectedGameCategory, setSelectedGameCategory] = useState<'slots' | 'roulette' | 'blackjack' | 'crash' | 'dice' | 'plinko'>('slots');

  // Image Cropper & Asset Forge State
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80'
  );
  const [cropWidth, setCropWidth] = useState<number>(100);
  const [cropHeight, setCropHeight] = useState<number>(100);
  const [cropOffsetX, setCropOffsetX] = useState<number>(0);
  const [cropOffsetY, setCropOffsetY] = useState<number>(0);
  const [bgRemovalTolerance, setBgRemovalTolerance] = useState<number>(25);
  const [scaleFactor, setScaleFactor] = useState<number>(100);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processedImageResult, setProcessedImageResult] = useState<string | null>(null);

  // Video Trimmer & Transcoder State
  const [selectedVideo, setSelectedVideo] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-golden-coins-falling-on-a-table-41604-large.mp4');
  const [videoStartTime, setVideoStartTime] = useState<number>(0);
  const [videoEndTime, setVideoEndTime] = useState<number>(5);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [transcodeFormat, setTranscodeFormat] = useState<'webm' | 'spritesheet' | 'mp4_alpha'>('webm');
  const [transcodeSuccess, setTranscodeSuccess] = useState(false);

  // Audio Trimmer & Mixer State
  const [audioStartTime, setAudioStartTime] = useState<number>(0.0);
  const [audioEndTime, setAudioEndTime] = useState<number>(2.5);
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(50);
  const [sfxVolume, setSfxVolume] = useState<number>(80);
  const [isLoopAudio, setIsLoopAudio] = useState<boolean>(true);
  const [audioTrimSuccess, setAudioTrimSuccess] = useState(false);

  // Sandbox Demo State (Multi-Game)
  const [demoBet, setDemoBet] = useState<number>(1000);
  const [demoBalance, setDemoBalance] = useState<number>(1000000);
  
  // Slots State
  const [demoReels, setDemoReels] = useState<string[]>(['🎰', '💎', '7️⃣', '🍒', '👑']);
  const [isDemoSpinning, setIsDemoSpinning] = useState(false);
  
  // Roulette State
  const [rouletteNumber, setRouletteNumber] = useState<number | null>(null);
  const [rouletteBetType, setRouletteBetType] = useState<'red' | 'black' | 'even' | 'odd'>('red');
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);

  // Blackjack State
  const [bjPlayerHand, setBjPlayerHand] = useState<string[]>(['10♠', 'K♥']);
  const [bjDealerHand, setBjDealerHand] = useState<string[]>(['7♦']);
  const [bjStatus, setBjStatus] = useState<'betting' | 'playing' | 'dealer' | 'won' | 'lost'>('betting');

  // Crash State
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  const [isCrashActive, setIsCrashActive] = useState<boolean>(false);
  const [hasCrashed, setHasCrashed] = useState<boolean>(false);

  const [demoWinMessage, setDemoWinMessage] = useState<string | null>(null);

  const handleProcessImage = () => {
    setIsProcessingImage(true);
    setTimeout(() => {
      setProcessedImageResult(selectedImage);
      setIsProcessingImage(false);
    }, 1000);
  };

  const handleTranscodeVideo = () => {
    setIsTranscoding(true);
    setTranscodeSuccess(false);
    setTimeout(() => {
      setIsTranscoding(false);
      setTranscodeSuccess(true);
    }, 1500);
  };

  const handleTrimAudio = () => {
    setAudioTrimSuccess(false);
    setTimeout(() => {
      setAudioTrimSuccess(true);
    }, 800);
  };

  const playSynthSfx = (type: 'spin' | 'win' | 'card' | 'chip' | 'crash') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'spin') {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(sfxVolume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(sfxVolume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'card') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(sfxVolume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'chip') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(sfxVolume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(sfxVolume / 100, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('AudioContext warning:', e);
    }
  };

  const handleDemoAction = () => {
    if (demoBalance < demoBet) return;
    setDemoWinMessage(null);

    if (selectedGameCategory === 'slots') {
      if (isDemoSpinning) return;
      setDemoBalance(prev => prev - demoBet);
      setIsDemoSpinning(true);
      playSynthSfx('spin');

      const symbolsPool = ['🎰', '💎', '7️⃣', '🍒', '👑', '⭐️', '🔔'];
      let counter = 0;
      const interval = setInterval(() => {
        setDemoReels([
          symbolsPool[Math.floor(Math.random() * symbolsPool.length)],
          symbolsPool[Math.floor(Math.random() * symbolsPool.length)],
          symbolsPool[Math.floor(Math.random() * symbolsPool.length)],
          symbolsPool[Math.floor(Math.random() * symbolsPool.length)],
          symbolsPool[Math.floor(Math.random() * symbolsPool.length)],
        ]);
        counter++;
        if (counter > 10) {
          clearInterval(interval);
          setIsDemoSpinning(false);
          const win = Math.random() > 0.35;
          if (win) {
            const payout = demoBet * (Math.floor(Math.random() * 8) + 3);
            setDemoBalance(prev => prev + payout);
            setDemoWinMessage(`¡PREMIO SLOTS! +$${payout.toLocaleString('es-AR')}`);
            playSynthSfx('win');
          } else {
            playSynthSfx('chip');
          }
        }
      }, 70);
    } else if (selectedGameCategory === 'roulette') {
      if (isRouletteSpinning) return;
      setDemoBalance(prev => prev - demoBet);
      setIsRouletteSpinning(true);
      playSynthSfx('spin');

      setTimeout(() => {
        const num = Math.floor(Math.random() * 37);
        setRouletteNumber(num);
        setIsRouletteSpinning(false);
        const isEven = num > 0 && num % 2 === 0;
        const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num);
        const won = (rouletteBetType === 'red' && isRed) || (rouletteBetType === 'even' && isEven);
        if (won) {
          const payout = demoBet * 2;
          setDemoBalance(prev => prev + payout);
          setDemoWinMessage(`¡RULETA #${num} GANADA! +$${payout.toLocaleString('es-AR')}`);
          playSynthSfx('win');
        } else {
          setDemoWinMessage(`¡RULETA CAYÓ EN #${num}! Sigue intentando.`);
          playSynthSfx('chip');
        }
      }, 1500);
    } else if (selectedGameCategory === 'blackjack') {
      setDemoBalance(prev => prev - demoBet);
      playSynthSfx('card');
      const cards = ['A♥', '10♦', 'J♠', 'Q♣', '8♥', '9♠'];
      const playerCard = cards[Math.floor(Math.random() * cards.length)];
      setBjPlayerHand(['10♠', playerCard]);
      setBjStatus('playing');
      const win = Math.random() > 0.4;
      setTimeout(() => {
        if (win) {
          const payout = demoBet * 2;
          setDemoBalance(prev => prev + payout);
          setDemoWinMessage(`¡BLACKJACK GANADO! +$${payout.toLocaleString('es-AR')}`);
          setBjStatus('won');
          playSynthSfx('win');
        } else {
          setDemoWinMessage(`¡BLACKJACK PERDIDO! Casa gana.`);
          setBjStatus('lost');
          playSynthSfx('chip');
        }
      }, 1000);
    } else if (selectedGameCategory === 'crash') {
      if (isCrashActive) return;
      setDemoBalance(prev => prev - demoBet);
      setIsCrashActive(true);
      setHasCrashed(false);
      setCrashMultiplier(1.00);
      playSynthSfx('spin');

      let currentM = 1.00;
      const crashAt = +(Math.random() * 4 + 1.2).toFixed(2);
      const timer = setInterval(() => {
        currentM += 0.08;
        setCrashMultiplier(Number(currentM.toFixed(2)));
        if (currentM >= crashAt) {
          clearInterval(timer);
          setIsCrashActive(false);
          setHasCrashed(true);
          const won = Math.random() > 0.5;
          if (won) {
            const payout = Math.floor(demoBet * crashAt);
            setDemoBalance(prev => prev + payout);
            setDemoWinMessage(`¡RETIRADO A ${crashAt}x! +$${payout.toLocaleString('es-AR')}`);
            playSynthSfx('win');
          } else {
            setDemoWinMessage(`¡CRASH! Se estrelló en ${crashAt}x.`);
            playSynthSfx('crash');
          }
        }
      }, 120);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-[#1b1228] via-[#141b33] to-[#0a1122] border border-[#30204d] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-[#a855f7]/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2a1a4a] border border-[#a855f7]/50 flex items-center justify-center text-[#c084fc] shadow-lg shadow-purple-900/40">
              <Wand2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-lg flex items-center gap-2">
                Universal Casino Game Studio & Asset Forge <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b1f5e] text-[#c084fc] border border-[#7e22ce]">Multi-Juego v3.0</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Estudio universal para recortar y adaptar imágenes, videos y audios para <strong>cualquier juego de casino</strong> (Slots, Ruleta, Blackjack, Crash, Baccarat, Poker).
              </p>
            </div>
          </div>

          {/* Game Category Selector */}
          <div className="flex items-center gap-2 bg-[#070d1a] border border-[#1b2b48] px-3 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Juego Objetivo:</span>
            <select
              value={selectedGameCategory}
              onChange={(e) => setSelectedGameCategory(e.target.value as any)}
              className="bg-transparent text-[#c084fc] font-bold outline-none cursor-pointer"
            >
              <option value="slots">🎰 Tragamonedas (Slots)</option>
              <option value="roulette">🎡 Ruleta Europea</option>
              <option value="blackjack">🃏 Blackjack / Cartas</option>
              <option value="crash">🚀 Crash Aviator</option>
              <option value="dice">🎲 Dados (Dice)</option>
              <option value="plinko">🎯 Plinko</option>
            </select>
          </div>
        </div>

        {/* Studio Sub-tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 relative z-10">
          <button
            onClick={() => setActiveSubTab('symbols')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'symbols'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#0e1628] text-slate-300 hover:bg-[#16233f] border border-[#233554]'
            }`}
          >
            <Crop className="w-4 h-4" /> 1. Recortador & Fondo de Imágenes
          </button>

          <button
            onClick={() => setActiveSubTab('animations')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'animations'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#0e1628] text-slate-300 hover:bg-[#16233f] border border-[#233554]'
            }`}
          >
            <Clock className="w-4 h-4" /> 2. Trimmer & Videos de Victoria
          </button>

          <button
            onClick={() => setActiveSubTab('audio')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'audio'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#0e1628] text-slate-300 hover:bg-[#16233f] border border-[#233554]'
            }`}
          >
            <Music className="w-4 h-4" /> 3. Trimmer de Audios & SFX
          </button>

          <button
            onClick={() => setActiveSubTab('sandbox')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeSubTab === 'sandbox'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[#0e1628] text-slate-300 hover:bg-[#16233f] border border-[#233554]'
            }`}
          >
            <Play className="w-4 h-4" /> 4. Sandbox Multijuego (Demo)
          </button>
        </div>
      </div>

      {/* SubTab 1: Image & Symbol Cropper */}
      {activeSubTab === 'symbols' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#0b1426] border border-[#1c2c4d] rounded-2xl p-5 space-y-4 lg:col-span-1">
            <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
              <Crop className="text-purple-400" size={16} /> Recorte y Ajuste de Imágenes ({selectedGameCategory.toUpperCase()})
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">URL o Archivo de Imagen:</label>
                <input
                  type="url"
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(e.target.value)}
                  className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ancho Recorte:</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={cropWidth}
                    onChange={(e) => setCropWidth(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Alto Recorte:</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={cropHeight}
                    onChange={(e) => setCropHeight(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Tolerancia de Fondo Transparente:</span>
                  <span className="font-mono text-purple-400">{bgRemovalTolerance}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={bgRemovalTolerance}
                  onChange={(e) => setBgRemovalTolerance(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Escala en Pantalla:</span>
                  <span className="font-mono text-purple-400">{scaleFactor}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <button
                onClick={handleProcessImage}
                disabled={isProcessingImage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-purple-900/30"
              >
                {isProcessingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Recortando & Limpiando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Aplicar Recorte y Transparencia
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#0b1426] border border-[#1c2c4d] rounded-2xl p-5 lg:col-span-2 flex flex-col items-center justify-center min-h-[320px] relative">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Vista Previa de Recorte ({selectedGameCategory})
            </span>

            <div className="w-56 h-56 rounded-2xl bg-[#060a14] border-2 border-dashed border-[#233554] flex items-center justify-center relative overflow-hidden shadow-inner p-4">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
              
              <img
                src={selectedImage}
                alt="Asset recortado"
                style={{
                  width: `${cropWidth}%`,
                  height: `${cropHeight}%`,
                  transform: `scale(${scaleFactor / 100})`,
                }}
                className="object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transition-all duration-300"
              />
            </div>

            {processedImageResult && (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/40 border border-emerald-800/60 px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" /> Imagen recortada, fondo extraído y adaptada al motor de {selectedGameCategory}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 2: Video Trimmer & Transcoder */}
      {activeSubTab === 'animations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#0b1426] border border-[#1c2c4d] rounded-2xl p-5 space-y-4 lg:col-span-1">
            <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
              <Clock className="text-purple-400" size={16} /> Trimmer de Videos y Animaciones
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">URL de Video MP4 (IA):</label>
                <input
                  type="url"
                  value={selectedVideo}
                  onChange={(e) => setSelectedVideo(e.target.value)}
                  className="w-full bg-[#070d1a] border border-[#1b2b48] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Inicio (seg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={videoStartTime}
                    onChange={(e) => setVideoStartTime(Number(e.target.value))}
                    className="w-full bg-[#070d1a] border border-[#1b2b48] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fin (seg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={videoEndTime}
                    onChange={(e) => setVideoEndTime(Number(e.target.value))}
                    className="w-full bg-[#070d1a] border border-[#1b2b48] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Formato de Salida:</label>
                <select
                  value={transcodeFormat}
                  onChange={(e) => setTranscodeFormat(e.target.value as any)}
                  className="w-full bg-[#070d1a] border border-[#1b2b48] rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="webm">WebM (Alfa Transparente)</option>
                  <option value="spritesheet">Sprite Sheet (PNG Grid)</option>
                  <option value="mp4_alpha">MP4 Optimizado</option>
                </select>
              </div>

              <button
                onClick={handleTranscodeVideo}
                disabled={isTranscoding}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-purple-900/30"
              >
                {isTranscoding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Recortando y Transcodificando...
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" /> Recortar Video y Quitar Fondo
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#0b1426] border border-[#1c2c4d] rounded-2xl p-5 lg:col-span-2 flex flex-col items-center justify-center min-h-[320px] relative">
            <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reproductor de Video Recortado ({selectedGameCategory})
            </span>

            <div className="w-72 h-44 rounded-2xl bg-[#060a14] border border-[#233554] flex items-center justify-center relative overflow-hidden shadow-2xl">
              <video
                src={selectedVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover filter contrast-125"
              />
            </div>

            {transcodeSuccess && (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/40 border border-emerald-800/60 px-4 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4" /> Video recortado de {videoStartTime}s a {videoEndTime}s y convertido a {transcodeFormat.toUpperCase()}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SubTab 3: Audio Trimmer & Mixer */}
      {activeSubTab === 'audio' && (
        <div className="bg-[#0b1426] border border-[#1c2c4d] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#182642] pb-3">
            <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
              <Music className="text-purple-400" size={18} /> Trimmer y Sintetizador de Audio para {selectedGameCategory.toUpperCase()}
            </h4>
            <span className="text-xs text-slate-400">Recorte temporal y bucle ambiental</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Inicio Audio (seg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={audioStartTime}
                    onChange={(e) => setAudioStartTime(Number(e.target.value))}
                    className="w-full bg-[#070d1a] border border-[#1b2b48] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Fin Audio (seg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={audioEndTime}
                    onChange={(e) => setAudioEndTime(Number(e.target.value))}
                    className="w-full bg-[#070d1a] border border-[#1b2b48] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Volumen Música de Fondo (Loop):</span>
                  <span className="font-mono text-purple-400">{bgMusicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgMusicVolume}
                  onChange={(e) => setBgMusicVolume(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Volumen Efectos Especiales (SFX):</span>
                  <span className="font-mono text-purple-400">{sfxVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleTrimAudio}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Recortar y Guardar Rango de Audio
              </button>

              {audioTrimSuccess && (
                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Audio recortado de {audioStartTime}s a {audioEndTime}s con éxito.
                </p>
              )}
            </div>

            <div className="bg-[#070d1a] border border-[#1b2b48] rounded-xl p-4 flex flex-col justify-between space-y-4">
              <span className="text-xs font-bold text-slate-300 block">Banco de Pruebas de SFX Multijuego:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => playSynthSfx('spin')}
                  className="py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Giro / Acción
                </button>
                <button
                  onClick={() => playSynthSfx('card')}
                  className="py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Carta / Ficha
                </button>
                <button
                  onClick={() => playSynthSfx('chip')}
                  className="py-2.5 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <CircleDot className="w-3.5 h-3.5" /> Monedas
                </button>
                <button
                  onClick={() => playSynthSfx('win')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Gran Premio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Sandbox Multi-Game Demo */}
      {activeSubTab === 'sandbox' && (
        <div className="bg-[#0b1426] border border-[#1c2c4d] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#182642] pb-3">
            <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
              <Play className="text-purple-400" size={18} /> Sandbox Demo: Probando <span className="text-[#c084fc] uppercase">{selectedGameCategory}</span>
            </h4>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Saldo Demo: <strong className="text-emerald-400 font-mono">${demoBalance.toLocaleString('es-AR')}</strong></span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6 space-y-6">
            {/* Game Render based on category */}
            {selectedGameCategory === 'slots' && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 bg-[#060a14] border-2 border-purple-500/40 p-6 rounded-2xl shadow-2xl">
                  {demoReels.map((symbol, i) => (
                    <div
                      key={i}
                      className={`w-20 h-24 rounded-xl bg-gradient-to-b from-[#111c33] to-[#080e1b] border border-[#233554] flex items-center justify-center text-4xl shadow-inner transition-transform duration-150 ${
                        isDemoSpinning ? 'animate-bounce' : ''
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedGameCategory === 'roulette' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-emerald-900 to-emerald-950 border-4 border-amber-500/60 flex flex-col items-center justify-center shadow-2xl relative">
                  <span className="text-xs text-slate-300 uppercase tracking-widest">Ruleta Europea</span>
                  <span className="text-4xl font-mono font-bold text-white mt-2">
                    {isRouletteSpinning ? '🌀' : rouletteNumber !== null ? rouletteNumber : '?'}
                  </span>
                  <span className="text-[10px] text-amber-400 mt-1">Apuesta: {rouletteBetType.toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRouletteBetType('red')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${rouletteBetType === 'red' ? 'bg-red-600 border-red-400 text-white' : 'bg-[#070d1a] border-[#1b2b48] text-slate-300'}`}
                  >
                    Rojo
                  </button>
                  <button
                    onClick={() => setRouletteBetType('even')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border ${rouletteBetType === 'even' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-[#070d1a] border-[#1b2b48] text-slate-300'}`}
                  >
                    Par
                  </button>
                </div>
              </div>
            )}

            {selectedGameCategory === 'blackjack' && (
              <div className="flex flex-col items-center gap-4 w-full max-w-md bg-[#060a14] p-6 rounded-2xl border border-[#233554]">
                <div className="text-center">
                  <span className="text-xs text-slate-400">Mano del Dealer</span>
                  <div className="flex gap-2 justify-center mt-2">
                    {bjDealerHand.map((c, i) => (
                      <div key={i} className="w-12 h-16 bg-white text-slate-900 font-bold rounded-lg flex items-center justify-center text-sm shadow">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-4">
                  <span className="text-xs text-slate-400">Tu Mano (Jugador)</span>
                  <div className="flex gap-2 justify-center mt-2">
                    {bjPlayerHand.map((c, i) => (
                      <div key={i} className="w-12 h-16 bg-white text-slate-900 font-bold rounded-lg flex items-center justify-center text-sm shadow">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedGameCategory === 'crash' && (
              <div className="flex flex-col items-center gap-4 bg-[#060a14] border border-[#233554] p-8 rounded-2xl w-full max-w-md text-center">
                <span className="text-xs uppercase tracking-widest text-slate-400">Multiplicador en Vivo</span>
                <span className={`text-5xl font-mono font-bold ${isCrashActive ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`}>
                  {crashMultiplier.toFixed(2)}x
                </span>
                <span className="text-xs text-slate-400">
                  {isCrashActive ? '🚀 Vuelo en curso...' : hasCrashed ? '💥 ¡Estrellado!' : 'Listo para despegar'}
                </span>
              </div>
            )}

            {demoWinMessage && (
              <div className="text-amber-300 font-serif font-bold text-sm animate-pulse bg-amber-950/50 border border-amber-600/60 px-6 py-2 rounded-xl">
                {demoWinMessage}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#070d1a] border border-[#1b2b48] px-4 py-2 rounded-xl text-xs text-slate-300">
                <span>Apuesta:</span>
                <select
                  value={demoBet}
                  onChange={(e) => setDemoBet(Number(e.target.value))}
                  className="bg-transparent text-[#c5a059] font-mono font-bold outline-none cursor-pointer"
                >
                  <option value={100}>$100</option>
                  <option value={500}>$500</option>
                  <option value={1000}>$1.000</option>
                  <option value={5000}>$5.000</option>
                </select>
              </div>

              <button
                onClick={handleDemoAction}
                disabled={(selectedGameCategory === 'slots' && isDemoSpinning) || (selectedGameCategory === 'roulette' && isRouletteSpinning) || (selectedGameCategory === 'crash' && isCrashActive) || demoBalance < demoBet}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-900/40 transition disabled:opacity-50"
              >
                {selectedGameCategory === 'slots' && (isDemoSpinning ? 'GIRANDO...' : 'GIRAR SLOTS')}
                {selectedGameCategory === 'roulette' && (isRouletteSpinning ? 'GIRANDO RULETA...' : 'APOSTAR RULETA')}
                {selectedGameCategory === 'blackjack' && 'REPARTIR BLACKJACK'}
                {selectedGameCategory === 'crash' && (isCrashActive ? 'VOLANDO...' : 'LANZAR AVIATOR')}
                {selectedGameCategory === 'dice' && 'LANZAR DADOS'}
                {selectedGameCategory === 'plinko' && 'SOLTAR BOLA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
