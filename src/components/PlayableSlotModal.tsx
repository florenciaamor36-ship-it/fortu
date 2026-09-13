import React, { useState, useEffect, useMemo } from 'react';
import { CasinoGame, SlotSkin, SlotSymbolDef } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { sound } from '../utils/audio';
import { SlotEngine, SlotSpinResult, PaylineWin } from '../engines/SlotEngine';
import { SkinRegistry } from '../games/SkinRegistry';
import confetti from 'canvas-confetti';
import {
  X,
  RotateCcw,
  Coins,
  ShieldCheck,
  Award,
  Sparkles,
  Info,
  Volume2,
  VolumeX,
  Zap,
  Sliders,
} from 'lucide-react';

interface PlayableSlotModalProps {
  game: CasinoGame;
  onClose: () => void;
  onOpenCashier: () => void;
}

export const PlayableSlotModal: React.FC<PlayableSlotModalProps> = ({
  game,
  onClose,
  onOpenCashier,
}) => {
  const { user, updateUserBalanceDirect, soundEnabled, toggleSound, addToast } = useAuth();

  // All available skins for this slot engine
  const availableSkins = useMemo(() => SkinRegistry.getAllSlotSkins(), []);

  // Initialize selected skin based on game.skinId or fallback
  const [currentSkin, setCurrentSkin] = useState<SlotSkin>(() => {
    return SkinRegistry.getSlotSkin(game.skinId || game.id);
  });

  const engine = useMemo(() => new SlotEngine(currentSkin), [currentSkin]);

  const [betAmount, setBetAmount] = useState<number>(game.minBet || 1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);

  // 5 reels x 3 rows grid state
  const [grid, setGrid] = useState<SlotSymbolDef[][]>(() => {
    const symbols = currentSkin.symbols;
    const initialGrid: SlotSymbolDef[][] = [];
    for (let c = 0; c < 5; c++) {
      const col: SlotSymbolDef[] = [];
      for (let r = 0; r < 3; r++) {
        col.push(symbols[(c + r) % symbols.length]);
      }
      initialGrid.push(col);
    }
    return initialGrid;
  });

  const [winningLines, setWinningLines] = useState<PaylineWin[]>([]);
  const [lastWin, setLastWin] = useState<number>(0);
  const [lastMultiplier, setLastMultiplier] = useState<number>(0);
  const [winMessage, setWinMessage] = useState<string>('');
  const [cryptoSignature, setCryptoSignature] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showPaytable, setShowPaytable] = useState(false);

  // Sync grid when skin changes
  useEffect(() => {
    engine.setSkin(currentSkin);
    const symbols = currentSkin.symbols;
    const initialGrid: SlotSymbolDef[][] = [];
    for (let c = 0; c < 5; c++) {
      const col: SlotSymbolDef[] = [];
      for (let r = 0; r < 3; r++) {
        col.push(symbols[(c + r) % symbols.length]);
      }
      initialGrid.push(col);
    }
    setGrid(initialGrid);
    setWinningLines([]);
    setLastWin(0);
  }, [currentSkin, engine]);

  const betSteps = [500, 1000, 2500, 5000, 10000, 25000, 50000];

  const handleSpin = async () => {
    if (isSpinning) return;
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Debes iniciar sesión para jugar.');
      return;
    }

    const currentBet = freeSpinsLeft > 0 ? 0 : betAmount;

    if (currentBet > 0 && user.chipBalance < currentBet) {
      setErrorMsg('Saldo insuficiente de fichas. Carga fichas en el cajero virtual.');
      setAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    sound.playReelSpin();
    sound.playChip();
    setWinningLines([]);

    // Fast visual tumbling reels simulation
    const symbols = currentSkin.symbols;
    const spinInterval = setInterval(() => {
      setGrid((prev) =>
        prev.map((col) =>
          col.map(() => symbols[Math.floor(Math.random() * symbols.length)])
        )
      );
    }, 75);

    try {
      // Calculate round through SlotEngine math
      const outcome: SlotSpinResult = engine.spin(currentBet > 0 ? currentBet : betAmount);

      // Persist to server backend
      let serverResponse: any = null;
      if (currentBet > 0) {
        serverResponse = await api.playGame(game.id, currentBet, {
          skinId: currentSkin.id,
          engine: 'ModularSlotEngine_v2',
        });
      }

      setTimeout(() => {
        clearInterval(spinInterval);
        setGrid(outcome.grid);
        setIsSpinning(false);
        setCryptoSignature(outcome.provablyFairHash);
        setWinningLines(outcome.winningLines);

        if (freeSpinsLeft > 0) {
          setFreeSpinsLeft((prev) => prev - 1);
        }

        if (outcome.isFreeSpinsBonus) {
          setFreeSpinsLeft((prev) => prev + outcome.freeSpinsCount);
          addToast(
            `¡RONDA DE BONO! ${outcome.freeSpinsCount} Giros Libres conseguidos!`,
            'info'
          );
        }

        if (outcome.isJackpot) {
          sound.playJackpot();
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#c5a059', '#00e5ff'],
          });
          setLastWin(outcome.totalPayout);
          setLastMultiplier(outcome.totalMultiplier);
          setWinMessage(`👑 ¡¡¡GRAN POZO JACKPOT ACUMULADO!!! Ganaste $${outcome.totalPayout.toLocaleString('es-AR')} fichas!`);
          if (serverResponse) {
            updateUserBalanceDirect(serverResponse.chipBalance);
          } else {
            updateUserBalanceDirect(user.chipBalance + outcome.totalPayout);
          }
          addToast(outcome.summary, 'success');
        } else if (outcome.isWin) {
          sound.playWin();
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
          setLastWin(outcome.totalPayout);
          setLastMultiplier(outcome.totalMultiplier);
          setWinMessage(outcome.summary);
          if (serverResponse) {
            updateUserBalanceDirect(serverResponse.chipBalance);
          } else {
            updateUserBalanceDirect(user.chipBalance + outcome.totalPayout);
          }
        } else {
          setLastWin(0);
          setLastMultiplier(0);
          setWinMessage('Tirada sin premio. ¡El pozo acumulado sigue creciendo!');
          if (serverResponse) {
            updateUserBalanceDirect(serverResponse.chipBalance);
          }
        }
      }, 950);
    } catch (err: any) {
      clearInterval(spinInterval);
      setIsSpinning(false);
      setAutoSpin(false);
      setErrorMsg(err.message || 'Error al conectar con la red de juego.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#0a1424] via-[#0d1a30] to-[#060b14] border border-[#c5a059]/40 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Top Decorative Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#c5a059]/20 bg-[#08101e]/80">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e5ff]"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2 font-serif">
                  {currentSkin.title}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#c5a059]/20 text-[#fae5b8] border border-[#c5a059]/40 font-mono">
                  MOTOR MODULAR V2
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentSkin.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button
              onClick={() => setShowPaytable(!showPaytable)}
              className={`p-2 rounded-lg transition ${
                showPaytable
                  ? 'bg-[#c5a059] text-black font-semibold'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
              title="Tabla de Pagos"
            >
              <Info size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-950/80 text-slate-300 hover:text-red-400 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Skin Selector ("Máscaras" de Juego) */}
        <div className="px-4 sm:px-6 py-2 bg-[#050b14] border-b border-[#c5a059]/15 flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 text-slate-400 whitespace-nowrap">
            <Sliders size={14} className="text-[#c5a059]" />
            <span className="font-semibold text-slate-300">Máscaras de Juego:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {availableSkins.map((s) => {
              const active = s.id === currentSkin.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentSkin(s)}
                  disabled={isSpinning}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? 'bg-gradient-to-r from-[#c5a059] to-[#dfba73] text-black font-bold shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Free Spins Alert Banner */}
          {freeSpinsLeft > 0 && (
            <div className="bg-gradient-to-r from-[#ffd700]/20 via-[#ff9100]/20 to-[#ffd700]/20 border border-[#ffd700]/50 rounded-xl p-3 text-center animate-pulse">
              <span className="text-sm font-bold text-[#ffd700] tracking-wide flex items-center justify-center gap-2">
                <Sparkles size={16} /> ¡GIROS LIBRES ACTIVOS: Te quedan {freeSpinsLeft} tiradas sin costo!
              </span>
            </div>
          )}

          {/* Paytable Dropdown Modal Overlay */}
          {showPaytable && (
            <div className="bg-[#050b14]/95 border border-[#c5a059]/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-bold text-[#fae5b8] text-sm flex items-center gap-2">
                  <Award size={16} className="text-[#c5a059]" /> Tabla de Pagos: {currentSkin.name}
                </h4>
                <button
                  onClick={() => setShowPaytable(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cerrar
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {currentSkin.symbols.map((sym) => (
                  <div key={sym.id} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center gap-2">
                    <span className="text-2xl">{sym.emoji}</span>
                    <div className="leading-tight">
                      <p className="font-bold text-white">{sym.label}</p>
                      <p className="text-[10px] text-[#c5a059]">5x: {sym.payouts[5]}x | 4x: {sym.payouts[4]}x</p>
                      {sym.badge && (
                        <span className="text-[9px] text-[#00e5ff] font-mono">{sym.badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reels Screen */}
          <div className="relative bg-gradient-to-b from-black/80 via-[#0a1222] to-black/80 rounded-xl p-3 sm:p-5 border-2 border-[#c5a059]/50 shadow-inner overflow-hidden">
            {/* Top Reel Frame Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />

            {/* 5 Columns / Reels */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {grid.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className="space-y-2 bg-[#060c18]/90 rounded-lg p-1.5 sm:p-2 border border-slate-800/80 shadow-md"
                >
                  {col.map((sym, rowIdx) => {
                    const isWinningCell = winningLines.some((w) =>
                      w.positions.some((pos) => pos.col === colIdx && pos.row === rowIdx)
                    );

                    return (
                      <div
                        key={rowIdx}
                        className={`h-16 sm:h-24 flex flex-col items-center justify-center rounded-lg border transition-all duration-300 relative ${
                          isWinningCell
                            ? 'bg-gradient-to-b from-[#ffd700]/30 to-[#ff9100]/20 border-[#ffd700] shadow-[0_0_15px_rgba(255,215,0,0.4)] scale-105'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl sm:text-4xl filter drop-shadow select-none transform transition-transform">
                          {sym.emoji}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-300 font-semibold tracking-tighter mt-1 truncate max-w-full px-1">
                          {sym.label}
                        </span>
                        {sym.isWild && (
                          <span className="absolute top-1 right-1 text-[8px] bg-cyan-500/80 text-black px-1 rounded font-black">
                            W
                          </span>
                        )}
                        {sym.isScatter && (
                          <span className="absolute top-1 right-1 text-[8px] bg-amber-500/90 text-black px-1 rounded font-black">
                            S
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bottom Reel Frame Accent */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ffd700] to-transparent opacity-80" />
          </div>

          {/* Outcome Status Bar */}
          <div className="bg-[#08101e] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="space-y-0.5">
              <p className="text-xs text-slate-400">Estado de la Tirada:</p>
              <p
                className={`text-sm font-semibold ${
                  lastWin > 0 ? 'text-[#ffd700] animate-bounce' : 'text-slate-300'
                }`}
              >
                {winMessage || 'Ajusta tu apuesta y gira los rodillos.'}
              </p>
            </div>

            {lastWin > 0 && (
              <div className="flex items-center gap-3 bg-[#c5a059]/15 border border-[#c5a059]/40 px-4 py-2 rounded-lg">
                <Award className="text-[#ffd700]" size={24} />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase font-mono">Premio Total</p>
                  <p className="text-lg font-black text-[#ffd700]">
                    +${lastWin.toLocaleString('es-AR')}
                    <span className="text-xs text-[#fae5b8] ml-1 font-normal">
                      ({lastMultiplier}x)
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls & Bets */}
          <div className="bg-[#050b14] border border-[#c5a059]/20 rounded-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Balance Display */}
              <div className="flex items-center gap-2">
                <Coins className="text-[#c5a059]" size={20} />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Tu Saldo</p>
                  <p className="text-base font-bold text-white">
                    ${(user?.chipBalance || 0).toLocaleString('es-AR')}{' '}
                    <span className="text-xs text-[#c5a059] font-normal">fichas</span>
                  </p>
                </div>
                <button
                  onClick={onOpenCashier}
                  className="ml-2 px-2.5 py-1 text-xs rounded bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#fae5b8] border border-[#c5a059]/40 transition"
                >
                  + Cargar
                </button>
              </div>

              {/* Bet Steps Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs text-slate-400 mr-1 font-medium">Apuesta:</span>
                {betSteps.map((step) => (
                  <button
                    key={step}
                    onClick={() => setBetAmount(step)}
                    disabled={isSpinning || freeSpinsLeft > 0}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      betAmount === step
                        ? 'bg-[#c5a059] text-black shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ${step >= 1000 ? `${step / 1000}k` : step}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/50 p-2 rounded-lg text-center">
                {errorMsg}
              </p>
            )}

            {/* Spin Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => setBetAmount(50000)}
                disabled={isSpinning || freeSpinsLeft > 0}
                className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider border border-amber-500/40 text-amber-300 bg-amber-950/20 hover:bg-amber-900/40 transition flex items-center justify-center gap-1.5"
              >
                <Zap size={16} /> Apuesta Máxima ($50.000)
              </button>

              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className={`sm:col-span-2 py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                  isSpinning
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#c5a059] via-[#e2be78] to-[#c5a059] hover:from-[#d8b46b] hover:to-[#d8b46b] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)] active:scale-[0.99]'
                }`}
              >
                <RotateCcw className={isSpinning ? 'animate-spin' : ''} size={18} />
                {isSpinning
                  ? 'RODANDO CARRETES...'
                  : freeSpinsLeft > 0
                  ? `GIRAR GRATIS (${freeSpinsLeft} RESTANTES)`
                  : `GIRAR (${betAmount.toLocaleString('es-AR')} FICHAS)`}
              </button>
            </div>

            {/* Cryptographic Provably Fair Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" /> Criptografía SHA-256 Verificada
              </span>
              <span className="truncate max-w-[200px] sm:max-w-[320px]">
                {cryptoSignature || 'Semilla inalterable de servidor lista'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
