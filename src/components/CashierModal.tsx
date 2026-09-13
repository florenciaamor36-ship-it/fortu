import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import { sound } from '../utils/audio';
import {
  X,
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Send,
  MessageSquare,
  Copy,
} from 'lucide-react';

interface CashierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashierModal: React.FC<CashierModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshBalance, addToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'cargar' | 'retirar' | 'movimientos'>('cargar');

  // Carga state
  const [loadAmount, setLoadAmount] = useState<number>(25000);
  const [loadAlias, setLoadAlias] = useState<string>('MERCADOPAGO.ALIAS.ARG');
  const [loadNote, setLoadNote] = useState<string>('');
  const [isSubmittingLoad, setIsSubmittingLoad] = useState<boolean>(false);

  // Retiro state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [withdrawAlias, setWithdrawAlias] = useState<string>('');
  const [withdrawNote, setWithdrawNote] = useState<string>('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && activeTab === 'movimientos') {
      setIsLoadingTx(true);
      api
        .getTransactions()
        .then((res) => setTransactions(res.transactions))
        .catch(() => {})
        .finally(() => setIsLoadingTx(false));
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const quickPacks = [10000, 25000, 50000, 100000, 250000];

  const handleRequestLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmittingLoad(true);
    sound.playChip();

    try {
      await api.requestChips(loadAmount, loadAlias, loadNote);
      addToast(
        'Solicitud Enviada',
        `Solicitud de ${loadAmount.toLocaleString('es-AR')} fichas enviada al Cajero Central.`,
        'success'
      );
      setActiveTab('movimientos');
      refreshBalance();
    } catch (err: any) {
      addToast('Error', err.message || 'No se pudo enviar la solicitud.', 'error');
    } finally {
      setIsSubmittingLoad(false);
    }
  };

  const handleRequestWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!withdrawAlias.trim()) {
      addToast('Faltan Datos', 'Ingresa tu Alias o CBU para recibir el retiro.', 'error');
      return;
    }

    setIsSubmittingWithdraw(true);
    sound.playChip();

    try {
      await api.requestWithdrawal(withdrawAmount, withdrawAlias, withdrawNote);
      addToast(
        'Solicitud de Retiro Registrada',
        `Tu retiro de ${withdrawAmount.toLocaleString('es-AR')} fichas está siendo procesado por el cajero.`,
        'success'
      );
      setActiveTab('movimientos');
      refreshBalance();
    } catch (err: any) {
      addToast('Error', err.message || 'No se pudo registrar el retiro.', 'error');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#091122] border-2 border-[#c5a059]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0c162b] border-b border-[#1d2d4c] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14233f] border border-[#c5a059]/60 flex items-center justify-center text-[#dfb76c]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-base md:text-lg text-slate-100 flex items-center gap-2">
                Cajero Virtual Oficial
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#13223f] text-[#dfb76c] font-mono border border-[#263c63]">
                  FICHAS ARS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gestión segura de carga y canje de fichas para apuestas online
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0e172a] border border-[#233554] text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Display Banner */}
        <div className="bg-gradient-to-r from-[#0d1830] via-[#101d3a] to-[#0d1830] border-b border-[#182642] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Saldo Actual de Fichas</div>
            <div className="text-2xl font-black font-mono text-[#fae5b8] mt-0.5">
              ${user ? user.chipBalance.toLocaleString('es-AR') : 0}{' '}
              <span className="text-xs text-[#c5a059] font-sans font-bold">FICHAS ARS</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#080f1d] border border-[#1b2b48] px-3 py-1.5 rounded-lg text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
            <span>Sin Comisiones de Terceros</span>
          </div>
        </div>

        {/* Cashier Tabs */}
        <div className="flex border-b border-[#182642] bg-[#070e1c] px-4">
          {[
            { id: 'cargar', label: 'Cargar Fichas', icon: ArrowDownCircle },
            { id: 'retirar', label: 'Retirar Fichas', icon: ArrowUpCircle },
            { id: 'movimientos', label: 'Historial de Transacciones', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-[#c5a059] text-[#fae5b8] bg-[#0c162b]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#dfb76c]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4">
          {/* TAB: CARGAR FICHAS */}
          {activeTab === 'cargar' && (
            <form onSubmit={handleRequestLoad} className="space-y-4">
              <div className="bg-[#0b1426] border border-[#1b2b47] rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 text-sm">
                  <Coins className="w-4 h-4 text-[#c5a059]" />
                  Sistema de Carga Directa por Cajero
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Para cargar fichas en tu cuenta sin pasarelas bancarias externas, selecciona el
                  paquete deseado e ingresa tu Alias de transferencia. El cajero asignado verificará y
                  acreditará tus fichas inmediatamente.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-[#16233b] text-[11px]">
                  <span className="text-slate-400">Alias Oficial de Recepción:</span>
                  <span className="font-mono font-bold text-[#dfb76c] bg-[#111d33] px-2 py-0.5 rounded border border-[#1f3152]">
                    LACLAVE.CASINO.FICHAS
                  </span>
                </div>
              </div>

              {/* Quick Packs */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Selecciona la cantidad de fichas a cargar:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {quickPacks.map((pack) => (
                    <button
                      type="button"
                      key={pack}
                      onClick={() => setLoadAmount(pack)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        loadAmount === pack
                          ? 'bg-[#15233c] border-[#c5a059] text-[#fae5b8] font-bold shadow-md'
                          : 'bg-[#0b1426] border-[#1c2c49] text-slate-300 hover:bg-[#111f38]'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">Fichas</div>
                      <div className="font-mono text-sm font-bold">
                        ${pack.toLocaleString('es-AR')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  O escribe un monto personalizado (mínimo $1.000):
                </label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={loadAmount}
                  onChange={(e) => setLoadAmount(Number(e.target.value))}
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-slate-100 font-mono outline-none"
                />
              </div>

              {/* Origin alias */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tu Alias / CBU o Titular de Transferencia:
                </label>
                <input
                  type="text"
                  value={loadAlias}
                  onChange={(e) => setLoadAlias(e.target.value)}
                  placeholder="ej. FLORENCIA.PAGO.FICHAS"
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nota o Comprobante (opcional):
                </label>
                <input
                  type="text"
                  value={loadNote}
                  onChange={(e) => setLoadNote(e.target.value)}
                  placeholder="ej. Transferencia realizada desde Banco Santander"
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLoad}
                className="w-full py-3.5 rounded-xl gold-gradient-btn font-cinzel font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmittingLoad
                    ? 'ENVIANDO SOLICITUD...'
                    : `SOLICITAR CARGA DE $${loadAmount.toLocaleString('es-AR')} FICHAS`}
                </span>
              </button>
            </form>
          )}

          {/* TAB: RETIRAR FICHAS */}
          {activeTab === 'retirar' && (
            <form onSubmit={handleRequestWithdraw} className="space-y-4">
              <div className="bg-[#0b1426] border border-[#1b2b47] rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5 text-sm">
                  <ArrowUpCircle className="w-4 h-4 text-[#c5a059]" />
                  Canje y Retiro de Fichas a Tu Cuenta
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Canjea tus fichas directamente a tu cuenta bancaria o billetera virtual
                  (MercadoPago, Ualá, Brubank, Bancos Nacionales). El pago es enviado por nuestro
                  cajero oficial en un plazo promedio de 5 a 15 minutos.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Fichas a retirar (mínimo $5.000):
                </label>
                <input
                  type="number"
                  min={5000}
                  step={1000}
                  max={user ? user.chipBalance : 0}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-slate-100 font-mono outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tu Alias / CBU / CVU de Destino:
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAlias}
                  onChange={(e) => setWithdrawAlias(e.target.value)}
                  placeholder="ej. FLORENCIA.BANCO.GALICIA o CVU de MercadoPago"
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Titular de la Cuenta:
                </label>
                <input
                  type="text"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="ej. Florencia Amor - DNI 39.420.891"
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-sm text-slate-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw}
                className="w-full py-3.5 rounded-xl gold-gradient-btn font-cinzel font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01]"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>
                  {isSubmittingWithdraw
                    ? 'PROCESANDO RETIRO...'
                    : `SOLICITAR RETIRO DE $${withdrawAmount.toLocaleString('es-AR')} FICHAS`}
                </span>
              </button>
            </form>
          )}

          {/* TAB: HISTORIAL Y MOVIMIENTOS */}
          {activeTab === 'movimientos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Registro de Transacciones Cifradas (SHA-256)</span>
                <span className="text-[#dfb76c] font-mono">
                  {transactions.length} movimientos
                </span>
              </div>

              {isLoadingTx ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Cargando libro contable seguro...
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-[#0b1324] border border-[#1c2c49] rounded-xl p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type.includes('PREMIO') || tx.type.includes('CARGA') || tx.type.includes('BONO')
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                : 'bg-red-950/80 text-red-300 border border-red-800/40'
                            }`}
                          >
                            {tx.type.replace('_', ' ')}
                          </span>
                          <span className="text-slate-300 font-medium">
                            {tx.gameTitle || tx.notes || 'Operación de Saldo'}
                          </span>
                        </div>

                        <span
                          className={`font-mono font-bold text-sm ${
                            tx.type.includes('PREMIO') || tx.type.includes('CARGA') || tx.type.includes('BONO')
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {tx.type.includes('PREMIO') || tx.type.includes('CARGA') || tx.type.includes('BONO')
                            ? '+'
                            : '-'}
                          ${tx.amount.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#15223a]">
                        <span>Saldo Posterior: ${tx.balanceAfter.toLocaleString('es-AR')}</span>
                        <span>{new Date(tx.timestamp).toLocaleString('es-AR')}</span>
                      </div>

                      {/* Cryptographic hash proof */}
                      <div className="text-[9px] font-mono text-slate-500 truncate flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400/80 shrink-0" />
                        <span className="truncate">Hash: {tx.hashIntegrity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No hay transacciones registradas aún.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
