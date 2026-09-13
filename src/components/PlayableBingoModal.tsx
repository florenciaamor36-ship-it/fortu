import React, { useState } from 'react';
import { CasinoGame } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Play, Coins, Award, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface PlayableBingoModalProps {
  game: CasinoGame;
  onClose: () => void;
  onOpenCashier: () => void;
}

export const PlayableBingoModal: React.FC<PlayableBingoModalProps> = ({
  game,
  onClose,
  onOpenCashier,
}) => {
  const { user, updateUserBalanceDirect, soundEnabled, toggleSound, addToast } = useAuth();

  const [card, setCard] = useState<number[][]>([
    [5, 18, 33, 51, 68],
    [12, 22, 40, 58, 71],
    [9, 27, 0, 49, 63], // 0 is Free Center Sol de Mayo
    [3, 19, 38, 55, 75],
    [14, 30, 44, 60, 72],
  ]);

  const [marked, setMarked] = useState<boolean[][]>([
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, true, false, false], // Free center
    [false, false, false, false, false],
    [false, false, false, false, false],
  ]);

  const [calledBalls, setCalledBalls] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number | null>(null);
  const [cardPrice, setCardPrice] = useState<number>(500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusText, setStatusText] = useState<string>('Compra tu cartón y canta BINGO');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleStartRound = async () => {
    if (isPlaying) return;
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Debes iniciar sesión para jugar.');
      return;
    }

    if (user.chipBalance < cardPrice) {
      setErrorMsg('Fichas insuficientes.');
      return;
    }

    setIsPlaying(true);
    sound.playChip();
    setCalledBalls([]);
    setCurrentBall(null);
    setStatusText('Iniciando extracción de bolillas...');

    try {
      const response = await api.playGame(game.id, cardPrice);

      // Simulate ball calling sequence
      const sampleBalls = [12, 5, 22, 40, 58, 71, 9, 33, 51, 68, 14, 44, 60, 75];
      let idx = 0;

      const caller = setInterval(() => {
        if (idx < sampleBalls.length) {
          const ball = sampleBalls[idx];
          setCurrentBall(ball);
          setCalledBalls((prev) => [...prev, ball]);
          sound.playWheelTick();

          // Mark on card
          setMarked((prev) => {
            const copy = prev.map((r) => [...r]);
            card.forEach((row, rIdx) => {
              row.forEach((num, cIdx) => {
                if (num === ball) {
                  copy[rIdx][cIdx] = true;
                }
              });
            });
            return copy;
          });

          idx++;
        } else {
          clearInterval(caller);
          updateUserBalanceDirect(response.chipBalance);
          setIsPlaying(false);
          setStatusText(response.resultSummary);

          if (response.isWin && response.payout > 0) {
            sound.playJackpot();
            try {
              confetti({ particleCount: 90, spread: 60 });
            } catch {}
            addToast('¡PREMIO EN BINGO!', response.resultSummary, 'success');
          }
        }
      }, 350);
    } catch (err: any) {
      setIsPlaying(false);
      setErrorMsg(err.message || 'Error al procesar la jugada');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#081020] border-2 border-[#c5a059]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-[#0b162c] border-b border-[#1d2d4c] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14233f] border border-[#c5a059]/40 flex items-center justify-center text-[#dfb76c] font-black font-cinzel">
              BG
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-sm md:text-base text-slate-100 flex items-center gap-2">
                {game.title}
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#162744] text-[#dfb76c] border border-[#273d66]">
                  75 BOLILLAS
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

          {/* Current Ball Caller Drum */}
          <div className="bg-[#070c18] border border-[#1b2b48] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">
                Bolilla Extraída
              </div>
              <div className="text-xs text-slate-300">{statusText}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#dfb76c] to-[#c5a059] text-[#080e1b] flex items-center justify-center font-black font-mono text-2xl shadow-xl animate-pulse">
                {currentBall !== null ? currentBall : '—'}
              </div>
            </div>
          </div>

          {/* Bingo Card Table (B-I-N-G-O) */}
          <div className="bg-[#0a1222] border-2 border-[#1c2d4d] rounded-2xl p-4 shadow-xl">
            {/* Letters */}
            <div className="grid grid-cols-5 gap-2 text-center pb-2 font-cinzel font-black text-base text-[#dfb76c]">
              <div>B</div>
              <div>I</div>
              <div>N</div>
              <div>G</div>
              <div>O</div>
            </div>

            {/* Grid numbers */}
            <div className="grid grid-cols-5 gap-2">
              {card.map((row, rIdx) =>
                row.map((num, cIdx) => {
                  const isMark = marked[rIdx][cIdx];
                  const isCenter = rIdx === 2 && cIdx === 2;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-12 md:h-14 rounded-xl flex flex-col items-center justify-center font-bold text-sm md:text-base font-mono transition-all ${
                        isMark
                          ? 'bg-[#c5a059] text-[#060b17] shadow-lg scale-102 ring-2 ring-white/50'
                          : 'bg-[#101c34] text-slate-200 border border-[#21355a]'
                      }`}
                    >
                      {isCenter ? '☀️' : num}
                      {isCenter && <span className="text-[8px] font-sans">LIBRE</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Action Control */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300">Precio Cartón:</span>
              {[200, 500, 1000, 2500].map((price) => (
                <button
                  key={price}
                  onClick={() => setCardPrice(price)}
                  disabled={isPlaying}
                  className={`px-2.5 py-1 text-xs font-mono rounded font-bold ${
                    cardPrice === price
                      ? 'bg-[#c5a059] text-[#060b17]'
                      : 'bg-[#121f38] text-slate-300 border border-[#20345b]'
                  }`}
                >
                  ${price}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartRound}
              disabled={isPlaying}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-cinzel font-black text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                isPlaying ? 'bg-slate-700 text-slate-400' : 'gold-gradient-btn hover:scale-102'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isPlaying ? 'JUGANDO...' : `CANTAR BINGO ($${cardPrice} FICHAS)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
