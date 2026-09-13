import React, { useState, useEffect } from 'react';
import { SportsEvent } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import { Trophy, CheckCircle, Ticket, Clock, Zap, Coins } from 'lucide-react';

export const SportsbookSection: React.FC<{ onOpenCashier: () => void }> = ({ onOpenCashier }) => {
  const { user, updateUserBalanceDirect, addToast } = useAuth();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [selectedBet, setSelectedBet] = useState<{
    event: SportsEvent;
    selection: string;
    odd: number;
  } | null>(null);
  const [betStake, setBetStake] = useState<number>(2000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketConfirmed, setTicketConfirmed] = useState<string | null>(null);

  useEffect(() => {
    api.getSports().then((res) => setEvents(res.events)).catch(() => {});
  }, []);

  const handleSelectOdd = (event: SportsEvent, selection: string, odd: number) => {
    sound.playChip();
    setSelectedBet({ event, selection, odd });
    setTicketConfirmed(null);
  };

  const handlePlaceBet = async () => {
    if (!selectedBet) return;
    if (!user) {
      addToast('Acceso Requerido', 'Inicia sesión para apostar.', 'error');
      return;
    }
    if (user.chipBalance < betStake) {
      addToast('Saldo Insuficiente', 'No cuentas con suficientes fichas.', 'error');
      return;
    }

    setIsSubmitting(true);
    sound.playChip();

    try {
      const res = await api.placeSportsBet(
        selectedBet.event.id,
        `${selectedBet.event.homeTeam} vs ${selectedBet.event.awayTeam} - ${selectedBet.selection}`,
        selectedBet.odd,
        betStake
      );

      updateUserBalanceDirect(res.chipBalance);
      setTicketConfirmed(res.ticketId);
      sound.playWin();
      addToast(
        '¡Apuesta Confirmada!',
        `Boleta registrada con éxito. Ticket: ${res.ticketId.slice(0, 10)}...`,
        'success'
      );
    } catch (err: any) {
      addToast('Error', err.message || 'No se pudo registrar la apuesta.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const potentialWin = selectedBet ? Math.round(betStake * selectedBet.odd) : 0;

  return (
    <section className="space-y-6">
      <div className="border-b border-[#182642] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-[#dfb76c]" />
            SportBook La Clave: Liga Argentina & Torneos Internacionales
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Mercados en vivo con cuotas mejoradas 0% margen y liquidación instantánea en fichas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Events Matches List (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#0a1222] border border-[#1b2b48] hover:border-[#2b416b] rounded-xl p-4 transition-all shadow-md"
            >
              {/* Event Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#15223a] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{evt.sport}</span>
                  <span>•</span>
                  <span>{evt.league}</span>
                </div>

                <div className="flex items-center gap-2">
                  {evt.isLive ? (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      EN VIVO {evt.score}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                      {evt.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Match Teams and Odds Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm md:text-base text-slate-100 flex items-center gap-2">
                    <span>{evt.homeTeam}</span>
                    <span className="text-slate-500 font-normal">vs</span>
                    <span>{evt.awayTeam}</span>
                  </div>
                  {evt.isLive && (
                    <div className="text-xs font-mono text-[#dfb76c] font-semibold">
                      Marcador: {evt.score}
                    </div>
                  )}
                </div>

                {/* Odds Buttons */}
                <div className="flex items-center gap-2">
                  {/* Home Win */}
                  <button
                    onClick={() => handleSelectOdd(evt, `Gana ${evt.homeTeam}`, evt.odds.home)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex flex-col items-center min-w-[70px] ${
                      selectedBet?.event.id === evt.id && selectedBet?.selection.includes(evt.homeTeam)
                        ? 'bg-[#c5a059] text-[#080e1a] font-bold ring-2 ring-white/60'
                        : 'bg-[#101b31] hover:bg-[#182848] text-slate-200 border border-[#203254]'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-sans">1</span>
                    <span className="font-bold">{evt.odds.home.toFixed(2)}</span>
                  </button>

                  {/* Draw */}
                  {evt.odds.draw > 0 && (
                    <button
                      onClick={() => handleSelectOdd(evt, 'Empate (X)', evt.odds.draw)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex flex-col items-center min-w-[70px] ${
                        selectedBet?.event.id === evt.id && selectedBet?.selection.includes('Empate')
                          ? 'bg-[#c5a059] text-[#080e1a] font-bold ring-2 ring-white/60'
                          : 'bg-[#101b31] hover:bg-[#182848] text-slate-200 border border-[#203254]'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-sans">X</span>
                      <span className="font-bold">{evt.odds.draw.toFixed(2)}</span>
                    </button>
                  )}

                  {/* Away Win */}
                  <button
                    onClick={() => handleSelectOdd(evt, `Gana ${evt.awayTeam}`, evt.odds.away)}
                    className={`px-3 py-2 rounded-lg text-xs font-mono transition-all flex flex-col items-center min-w-[70px] ${
                      selectedBet?.event.id === evt.id && selectedBet?.selection.includes(evt.awayTeam)
                        ? 'bg-[#c5a059] text-[#080e1a] font-bold ring-2 ring-white/60'
                        : 'bg-[#101b31] hover:bg-[#182848] text-slate-200 border border-[#203254]'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-sans">2</span>
                    <span className="font-bold">{evt.odds.away.toFixed(2)}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Betslip (4 cols) */}
        <div className="lg:col-span-4 bg-[#091224] border-2 border-[#1c2d4e] rounded-2xl p-5 shadow-2xl space-y-4 sticky top-24">
          <div className="flex items-center justify-between border-b border-[#17253d] pb-3">
            <div className="flex items-center gap-2 font-cinzel font-bold text-sm text-slate-100">
              <Ticket className="w-4 h-4 text-[#c5a059]" />
              <span>Boleta de Apuestas</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[#13223f] text-[#dfb76c] font-mono">
              SIMPLE
            </span>
          </div>

          {selectedBet ? (
            <div className="space-y-4">
              <div className="bg-[#070e1c] border border-[#1b2a47] rounded-xl p-3 space-y-2">
                <div className="text-xs font-semibold text-slate-200">
                  {selectedBet.event.homeTeam} vs {selectedBet.event.awayTeam}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#dfb76c] font-medium">{selectedBet.selection}</span>
                  <span className="font-mono font-bold text-white bg-[#15233c] px-2 py-0.5 rounded border border-[#24375a]">
                    @{selectedBet.odd.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">{selectedBet.event.league}</div>
              </div>

              {/* Stake input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Importe de Apuesta (Fichas):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={betStake}
                    onChange={(e) => setBetStake(Math.max(500, Number(e.target.value)))}
                    className="w-full bg-[#070d1a] border border-[#203152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-slate-100 font-mono outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#c5a059]">
                    FICHAS
                  </span>
                </div>

                <div className="flex gap-1.5 mt-2">
                  {[1000, 2500, 5000, 10000].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => setBetStake(quick)}
                      className="text-[10px] px-2 py-1 rounded bg-[#0f1b32] hover:bg-[#162747] text-slate-300 font-mono"
                    >
                      +${quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Calculation */}
              <div className="bg-[#0b1528] border border-[#1d2d4c] rounded-xl p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cuota Total:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedBet.odd.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-200 pt-1 border-t border-[#17253d]">
                  <span className="font-semibold">Ganancia Potencial:</span>
                  <span className="font-mono font-black text-base text-[#fae5b8]">
                    ${potentialWin.toLocaleString('es-AR')}{' '}
                    <span className="text-[10px] text-[#c5a059]">FICHAS</span>
                  </span>
                </div>
              </div>

              {/* Confirm CTA */}
              <button
                id="place-sports-bet-btn"
                onClick={handlePlaceBet}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl gold-gradient-btn font-cinzel font-black text-sm tracking-wider transition-all shadow-xl hover:scale-[1.01] active:scale-[0.98] disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isSubmitting ? 'CONFIRMANDO APUESTA...' : 'CONFIRMAR APUESTA CON FICHAS'}
              </button>

              {ticketConfirmed && (
                <div className="bg-emerald-950/60 border border-emerald-700 p-3 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">¡Ticket Acreditado con Éxito!</div>
                    <div className="font-mono text-[10px] text-emerald-400 break-all">
                      ID: {ticketConfirmed}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Ticket className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-medium">Boleta vacía</div>
              <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                Selecciona una cuota de los partidos argentinos para armar tu jugada.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
