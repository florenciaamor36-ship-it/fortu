import React, { useState } from 'react';
import { CasinoGame } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, RotateCw, Coins, Zap, ShieldCheck, Volume2, VolumeX } from 'lucide-react';

interface PlayableRouletteModalProps {
  game: CasinoGame;
  onClose: () => void;
  onOpenCashier: () => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const PlayableRouletteModal: React.FC<PlayableRouletteModalProps> = ({
  game,
  onClose,
  onOpenCashier,
}) => {
  const { user, updateUserBalanceDirect, soundEnabled, toggleSound, addToast } = useAuth();

  const [selectedBetType, setSelectedBetType] = useState<'rojo' | 'negro' | 'par' | 'impar' | 'numero'>('rojo');
  const [selectedNumber, setSelectedNumber] = useState<number>(17);
  const [chipValue, setChipValue] = useState<number>(1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastLanded, setLastLanded] = useState<number | null>(null);
  const [lightningNumbers, setLightningNumbers] = useState<{ num: number; mult: number }[]>([
    { num: 17, mult: 250 },
    { num: 7, mult: 100 },
  ]);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [lastPayout, setLastPayout] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const chipOptions = [500, 1000, 2500, 5000, 10000, 25000];

  const handleSpin = async () => {
    if (isSpinning) return;
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Debes iniciar sesión para apostar.');
      return;
    }

    if (user.chipBalance < chipValue) {
      setErrorMsg('Saldo de fichas insuficiente.');
      return;
    }

    setIsSpinning(true);
    sound.playChip();

    // Wheel ticking sound simulation
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sound.playWheelTick();
      tickCount++;
      if (tickCount > 16) clearInterval(tickInterval);
    }, 120);

    // Roll random lightning numbers for excitement
    const randNum1 = Math.floor(Math.random() * 37);
    const randNum2 = Math.floor(Math.random() * 37);
    setLightningNumbers([
      { num: randNum1, mult: 50 * (Math.floor(Math.random() * 8) + 2) },
      { num: randNum2, mult: 100 },
    ]);

    try {
      const clientData: any = {
        betType: selectedBetType,
        chosenNumber: selectedBetType === 'numero' ? selectedNumber : undefined,
        chosenColor: selectedBetType === 'rojo' ? 'rojo' : selectedBetType === 'negro' ? 'negro' : undefined,
      };

      const response = await api.playGame(game.id, chipValue, clientData);

      setTimeout(() => {
        clearInterval(tickInterval);
        const landedNum = Math.floor(Math.random() * 37);
        setLastLanded(landedNum);
        updateUserBalanceDirect(response.chipBalance);
        setLastPayout(response.payout);
        setResultMessage(response.resultSummary);
        setIsSpinning(false);

        if (response.isWin && response.payout > 0) {
          if (response.multiplier >= 10) {
            sound.playJackpot();
            try {
              confetti({
                particleCount: 100,
                spread: 70,
                colors: ['#c5a059', '#e5c378', '#ffffff'],
              });
            } catch {}
            addToast('¡PLENO GANADOR EN RULETA!', response.resultSummary, 'jackpot');
          } else {
            sound.playWin();
          }
        }
      }, 1500);
    } catch (err: any) {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setErrorMsg(err.message || 'Error al procesar la jugada');
    }
  };

  const isRed = (n: number) => RED_NUMBERS.includes(n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#081020] border-2 border-[#c5a059]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-[#0b162c] border-b border-[#1d2d4c] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14233f] border border-[#c5a059]/40 flex items-center justify-center text-[#dfb76c] font-black font-cinzel">
              RL
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-sm md:text-base text-slate-100 flex items-center gap-2">
                {game.title}
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#162744] text-[#dfb76c] border border-[#273d66]">
                  EN VIVO VIP
                </span>
              </h3>
              <div className="text-[11px] text-slate-400">{game.subtitle}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-[#0e172a] border border-[#233554] text-slate-300 hover:text-white"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#c5a059]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#0e172a] border border-[#233554] text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4">
          {/* Status Bar */}
          <div className="bg-[#0c162b] border border-[#1d2c49] rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#dfb76c]" />
              <span className="text-slate-400">Saldo Fichas:</span>
              <span className="font-mono font-bold text-[#fae5b8] text-sm">
                ${user ? user.chipBalance.toLocaleString('es-AR') : 0} ARS
              </span>
            </div>
            <button
              onClick={onOpenCashier}
              className="text-[11px] px-2.5 py-1 rounded bg-[#162544] hover:bg-[#20345d] text-[#dfb76c] border border-[#2d436d] font-semibold"
            >
              + Cargar Fichas
            </button>
          </div>

          {/* Lightning Multipliers Banner */}
          <div className="bg-gradient-to-r from-[#181106] via-[#241a0b] to-[#181106] border border-[#c5a059]/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#dfb76c] animate-bounce" />
              <span className="text-xs font-bold text-[#f5e4be] tracking-wide uppercase">
                Números Relámpago de la Tirada:
              </span>
            </div>
            <div className="flex items-center gap-3">
              {lightningNumbers.map((ln, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-[#0e1628] border border-[#c5a059] px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  <span className="text-white font-mono text-sm">#{ln.num}</span>
                  <span className="text-[#dfb76c] font-mono">{ln.mult}x</span>
                </div>
              ))}
            </div>
          </div>

          {/* Roulette Wheel Visualizer */}
          <div className="bg-[#070c18] border-2 border-[#1c2c49] rounded-2xl p-6 text-center space-y-3 shadow-inner">
            <div className="flex items-center justify-center gap-6">
              {/* Spinning Wheel Graphic */}
              <div
                className={`w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-[#c5a059] flex items-center justify-center bg-gradient-to-tr from-[#060b17] via-[#101b33] to-[#060b17] shadow-2xl transition-transform duration-1000 ${
                  isSpinning ? 'rotate-[720deg]' : ''
                }`}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-[#263b63] flex flex-col items-center justify-center bg-[#070e1c]">
                  <RotateCw className={`w-5 h-5 text-[#dfb76c] ${isSpinning ? 'animate-spin' : ''}`} />
                  <span className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">
                    {isSpinning ? 'Girando' : 'Ruleta'}
                  </span>
                </div>
              </div>

              {/* Landed Number Display */}
              <div className="text-left space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">
                  Último Número Salió:
                </div>
                {lastLanded !== null ? (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold font-mono text-xl shadow-lg ${
                        lastLanded === 0
                          ? 'bg-emerald-600 text-white'
                          : isRed(lastLanded)
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-900 text-white border border-slate-700'
                      }`}
                    >
                      {lastLanded}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {lastLanded === 0 ? 'CERO' : isRed(lastLanded) ? 'ROJO' : 'NEGRO'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {lastLanded % 2 === 0 ? 'PAR' : 'IMPAR'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 font-mono">Esperando tirada...</div>
                )}
              </div>
            </div>

            {/* Payout Banner */}
            {lastPayout > 0 && (
              <div className="bg-[#121c0e] border border-emerald-700/60 rounded-xl p-2.5 text-center">
                <div className="text-xs font-bold text-emerald-400">¡GANANCIA ACREDITADA!</div>
                <div className="text-xl font-black font-mono text-[#fae5b8]">
                  +${lastPayout.toLocaleString('es-AR')} FICHAS
                </div>
                <div className="text-[11px] text-slate-300">{resultMessage}</div>
              </div>
            )}
          </div>

          {/* Roulette Table Betting Board */}
          <div className="bg-[#0a1324] border border-[#1b2b48] rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Selecciona tu Apuesta:</div>

            {/* Bet Type Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedBetType('rojo')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedBetType === 'rojo'
                    ? 'bg-red-700 text-white ring-2 ring-[#c5a059]'
                    : 'bg-[#1e1315] text-red-300 hover:bg-red-950/60 border border-red-900/60'
                }`}
              >
                ROJO (x2)
              </button>
              <button
                onClick={() => setSelectedBetType('negro')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedBetType === 'negro'
                    ? 'bg-slate-900 text-white ring-2 ring-[#c5a059] border border-slate-600'
                    : 'bg-[#0e1628] text-slate-300 hover:bg-[#142038] border border-[#203254]'
                }`}
              >
                NEGRO (x2)
              </button>
              <button
                onClick={() => setSelectedBetType('par')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedBetType === 'par'
                    ? 'bg-[#182949] text-[#fae5b8] ring-2 ring-[#c5a059]'
                    : 'bg-[#0e1628] text-slate-300 hover:bg-[#142038] border border-[#203254]'
                }`}
              >
                PAR (x2)
              </button>
              <button
                onClick={() => setSelectedBetType('impar')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedBetType === 'impar'
                    ? 'bg-[#182949] text-[#fae5b8] ring-2 ring-[#c5a059]'
                    : 'bg-[#0e1628] text-slate-300 hover:bg-[#142038] border border-[#203254]'
                }`}
              >
                IMPAR (x2)
              </button>
              <button
                onClick={() => setSelectedBetType('numero')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  selectedBetType === 'numero'
                    ? 'bg-[#c5a059] text-[#060b17] shadow-lg'
                    : 'bg-[#0e1628] text-slate-300 hover:bg-[#142038] border border-[#203254]'
                }`}
              >
                PLENO #{selectedNumber} (x36)
              </button>
            </div>

            {/* If Pleno is selected, show numbers 0-36 picker */}
            {selectedBetType === 'numero' && (
              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-1.5">
                  Elige un número del 0 al 36:
                </div>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-[#070d1a] rounded-lg border border-[#1b2b48]">
                  {Array.from({ length: 37 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedNumber(i)}
                      className={`w-7 h-7 rounded text-xs font-mono font-bold transition-transform ${
                        selectedNumber === i
                          ? 'ring-2 ring-white scale-110 z-10'
                          : ''
                      } ${
                        i === 0
                          ? 'bg-emerald-700 text-white'
                          : isRed(i)
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chip Stake Values */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">Fichas a Apostar:</span>
              <div className="flex flex-wrap gap-1.5">
                {chipOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setChipValue(c);
                      sound.playChip();
                    }}
                    disabled={isSpinning}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md font-bold transition-all ${
                      chipValue === c
                        ? 'bg-[#c5a059] text-[#060b17]'
                        : 'bg-[#121f38] text-slate-300 border border-[#20345b]'
                    }`}
                  >
                    ${c.toLocaleString('es-AR')}
                  </button>
                ))}
              </div>
            </div>

            {/* Spin CTA Button */}
            <button
              id="roulette-spin-btn"
              onClick={handleSpin}
              disabled={isSpinning}
              className={`w-full py-4 rounded-xl font-cinzel font-black text-base tracking-wider transition-all flex items-center justify-center gap-3 shadow-xl ${
                isSpinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'gold-gradient-btn hover:scale-[1.01] active:scale-[0.98]'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>
                {isSpinning
                  ? 'LA BOLA ESTÁ GIRANDO...'
                  : `GIRAR RULETA ($${chipValue.toLocaleString('es-AR')} FICHAS)`}
              </span>
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-lg">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
