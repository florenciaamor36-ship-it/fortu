import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CashierPanel, User, Transaction } from '../types';
import { sound } from '../utils/audio';
import {
  X,
  Landmark,
  Coins,
  Send,
  UserCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Phone,
  CreditCard,
  Percent,
  History,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  UserPlus,
  Users,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Lock,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

interface CashierOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashierOperatorModal: React.FC<CashierOperatorModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshBalance, addToast } = useAuth();
  const [panel, setPanel] = useState<CashierPanel | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'operaciones' | 'jugadores' | 'historial'>('operaciones');

  // URL copy state
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPlayerPass, setCopiedPlayerPass] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Operation Mode: 'CARGAR' (Subir fichas) vs 'BAJAR_RECUPERO' (Bajar fichas con recupero a la caja)
  const [operationMode, setOperationMode] = useState<'CARGAR' | 'BAJAR_RECUPERO'>('CARGAR');
  const [targetUsername, setTargetUsername] = useState('');
  const [operationAmount, setOperationAmount] = useState<number>(25000);
  const [operationNotes, setOperationNotes] = useState('');
  const [isProcessingOp, setIsProcessingOp] = useState(false);
  const [lastOpResult, setLastOpResult] = useState<any>(null);

  // Player search in modal
  const [playerSearch, setPlayerSearch] = useState('');

  // Create Player Modal State
  const [showCreatePlayerModal, setShowCreatePlayerModal] = useState(false);
  const [createPlayerForm, setCreatePlayerForm] = useState({
    username: '',
    password: '',
    fullName: '',
    dni: '',
    phone: '+54 9 11 ',
    initialChips: 0,
  });
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  // Edit Player Modal State
  const [editingPlayer, setEditingPlayer] = useState<User | null>(null);
  const [editPlayerForm, setEditPlayerForm] = useState({
    fullName: '',
    phone: '',
    password: '',
    status: 'activo' as 'activo' | 'suspendido',
  });
  const [isEditingPlayer, setIsEditingPlayer] = useState(false);

  // Delete Player Modal State
  const [deleteTargetPlayer, setDeleteTargetPlayer] = useState<User | null>(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [panelRes, playersRes] = await Promise.all([
        api.getCashierPanelInfo(),
        api.getCashierPlayers(),
      ]);

      if (panelRes.panel) {
        setPanel(panelRes.panel);
      }
      if (playersRes.players) {
        setPlayers(playersRes.players);
      }
    } catch (err: any) {
      addToast(err.message || 'Error al obtener datos del cajero', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCashierDirectUrl = () => {
    if (!panel) return window.location.origin;
    const slug = panel.slug || panel.username;
    return `${window.location.origin}/?cajero=${slug}`;
  };

  const copyPanelUrl = () => {
    navigator.clipboard.writeText(getCashierDirectUrl());
    setCopiedUrl(true);
    addToast('¡URL del sub-panel copiada!', 'success');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const togglePassword = (playerId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
  };

  const copyPlayerCredentials = (p: User) => {
    const text = `🎰 LA CLAVE ARGENTINA CASINO\n👤 Usuario: ${p.username}\n🔑 Contraseña: ${p.plainPassword || 'demo-player-password-change-me'}\n🌐 Acceso: ${getCashierDirectUrl()}`;
    navigator.clipboard.writeText(text);
    setCopiedPlayerPass(p.id);
    addToast(`Credenciales de @${p.username} copiadas para enviar por WhatsApp`, 'success');
    setTimeout(() => setCopiedPlayerPass(null), 2500);
  };

  // Find target player to display real-time chip balance
  const selectedPlayer = players.find(
    (p) => p.username.toLowerCase() === targetUsername.trim().toLowerCase()
  );

  // Quick Preset Amounts
  const quickAmounts = [5000, 10000, 20000, 50000, 100000];

  // SUBIR FICHAS (CARGAR AL JUGADOR)
  const handleChargePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || !operationAmount || operationAmount <= 0) return;

    if (panel && panel.chipBalance < operationAmount) {
      addToast('Saldo insuficiente en tu caja para transferir esas fichas.', 'error');
      return;
    }

    setIsProcessingOp(true);
    sound.playChip();
    try {
      const res = await api.cashierChargePlayer(targetUsername.trim(), operationAmount, operationNotes);
      addToast(
        `¡Carga Exitosa! $${operationAmount.toLocaleString('es-AR')} fichas transferidas a @${targetUsername}.`,
        'success'
      );
      setLastOpResult({
        type: 'CARGA',
        message: res.message,
        playerUsername: res.player.username,
        playerBalance: res.player.newBalance,
        cashierBalance: res.cashier.chipBalance,
      });
      setPanel(res.cashier);
      setTargetUsername('');
      setOperationNotes('');
      refreshBalance();
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al cargar fichas al jugador', 'error');
    } finally {
      setIsProcessingOp(false);
    }
  };

  // BAJAR FICHAS (RETIRO CON RECUPERO A LA CAJA DEL CAJERO)
  const handleRedeemPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || !operationAmount || operationAmount <= 0) return;

    if (selectedPlayer && selectedPlayer.chipBalance < operationAmount) {
      addToast(
        `El jugador tiene solo $${selectedPlayer.chipBalance.toLocaleString('es-AR')} fichas. No puedes bajar más de su saldo.`,
        'error'
      );
      return;
    }

    setIsProcessingOp(true);
    sound.playCoin();
    try {
      const res = await api.cashierRedeemPlayer(targetUsername.trim(), operationAmount, operationNotes);
      addToast(
        `¡Recupero Exitoso! Se bajaron $${operationAmount.toLocaleString('es-AR')} fichas de @${targetUsername} y volvieron a tu caja.`,
        'success'
      );
      setLastOpResult({
        type: 'RECUPERO',
        message: `Se bajaron $${operationAmount.toLocaleString('es-AR')} fichas al jugador y se recuperaron en tu caja.`,
        playerUsername: res.player.username,
        playerBalance: res.player.newBalance,
        cashierBalance: res.cashier.chipBalance,
      });
      setPanel(res.cashier);
      setTargetUsername('');
      setOperationNotes('');
      refreshBalance();
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al bajar fichas con recupero', 'error');
    } finally {
      setIsProcessingOp(false);
    }
  };

  // CREATE PLAYER
  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createPlayerForm.username.trim()) {
      addToast('Nombre de usuario requerido', 'error');
      return;
    }

    if (createPlayerForm.initialChips > 0 && panel && panel.chipBalance < createPlayerForm.initialChips) {
      addToast('Saldo insuficiente en tu caja para fondear fichas iniciales', 'error');
      return;
    }

    setIsCreatingPlayer(true);
    try {
      const res = await api.cashierCreatePlayer(createPlayerForm);
      addToast(`¡Jugador @${res.player.username} dado de alta exitosamente!`, 'success');
      setShowCreatePlayerModal(false);
      setCreatePlayerForm({
        username: '',
        password: '',
        fullName: '',
        dni: '',
        phone: '+54 9 11 ',
        initialChips: 0,
      });
      loadData();
      refreshBalance();
    } catch (err: any) {
      addToast(err.message || 'Error al crear jugador', 'error');
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  // EDIT PLAYER
  const handleSaveEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    setIsEditingPlayer(true);
    try {
      const res = await api.cashierEditPlayer(editingPlayer.id, editPlayerForm);
      addToast(`Datos de @${res.player.username} actualizados`, 'success');
      setEditingPlayer(null);
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al editar jugador', 'error');
    } finally {
      setIsEditingPlayer(false);
    }
  };

  // TOGGLE STATUS
  const handleTogglePlayerStatus = async (playerToToggle: User) => {
    try {
      const newStatus = playerToToggle.status === 'activo' ? 'suspendido' : 'activo';
      await api.cashierEditPlayer(playerToToggle.id, { status: newStatus });
      addToast(
        `Jugador @${playerToToggle.username} ahora está ${newStatus.toUpperCase()}`,
        'success'
      );
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al modificar estado', 'error');
    }
  };

  // DELETE PLAYER WITH RECUPERO
  const handleDeletePlayer = async () => {
    if (!deleteTargetPlayer) return;

    setIsDeletingPlayer(true);
    try {
      const res = await api.cashierDeletePlayer(deleteTargetPlayer.id);
      addToast(
        `Jugador eliminado. Se recuperaron $${res.recoveredChips.toLocaleString('es-AR')} fichas a tu caja.`,
        'success'
      );
      setDeleteTargetPlayer(null);
      loadData();
      refreshBalance();
    } catch (err: any) {
      addToast(err.message || 'Error al eliminar jugador', 'error');
    } finally {
      setIsDeletingPlayer(false);
    }
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.username.toLowerCase().includes(playerSearch.toLowerCase()) ||
      p.fullName.toLowerCase().includes(playerSearch.toLowerCase()) ||
      p.dni.toLowerCase().includes(playerSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#08101d] border-2 border-[#00e5ff] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-[#0b172c] border-b border-[#1c2c4b] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-[#00e5ff] shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">
                  {panel?.name || 'Sub-Panel Oficial de Cajero'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/80 text-[#00e5ff] font-black border border-cyan-700 tracking-wider">
                  CAJERO OFICIAL
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    panel?.status === 'activo'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {panel?.status || 'ACTIVO'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Operador: <span className="text-white font-semibold">{panel?.operatorName}</span> (@{panel?.username})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Panel URL Copy */}
            <button
              onClick={copyPanelUrl}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Copiar link de acceso directo de este panel"
            >
              {copiedUrl ? (
                <>
                  <Check size={14} className="text-emerald-400" /> Copiada
                </>
              ) : (
                <>
                  <ExternalLink size={14} className="text-[#00e5ff]" /> Copiar Link de Panel
                </>
              )}
            </button>

            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title="Refrescar Datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Live Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#050b14] border-b border-[#15233c] text-xs">
          <div className="bg-[#091322] border border-cyan-900/60 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Saldo en Caja</span>
            <p className="text-xl font-bold font-mono text-[#ffd700]">
              ${panel?.chipBalance.toLocaleString('es-AR') || '0'}
            </p>
            <p className="text-[10px] text-cyan-400">Fichas disponibles</p>
          </div>

          <div className="bg-[#091322] border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Distribuido (+)</span>
            <p className="text-xl font-bold font-mono text-emerald-400">
              ${panel?.totalChipsDistributed.toLocaleString('es-AR') || '0'}
            </p>
            <p className="text-[10px] text-slate-400">Cargadas a jugadores</p>
          </div>

          <div className="bg-[#091322] border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Recuperado (-)</span>
            <p className="text-xl font-bold font-mono text-[#00e5ff]">
              ${panel?.totalChipsRedeemed.toLocaleString('es-AR') || '0'}
            </p>
            <p className="text-[10px] text-slate-400">Retiros vueltos a caja</p>
          </div>

          <div className="bg-[#091322] border border-slate-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Jugadores Asignados</span>
            <p className="text-xl font-bold font-mono text-white">
              {players.length}
            </p>
            <p className="text-[10px] text-slate-400">Cuentas administradas</p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-[#182642] bg-[#070e1c] px-4 gap-2 text-xs">
          <button
            onClick={() => setActiveSubTab('operaciones')}
            className={`flex items-center gap-2 py-3 px-4 font-bold border-b-2 transition ${
              activeSubTab === 'operaciones'
                ? 'border-[#00e5ff] text-[#00e5ff] bg-[#0c182c]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins size={16} /> Operaciones de Fichas (Cargar / Recuperar)
          </button>
          <button
            onClick={() => setActiveSubTab('jugadores')}
            className={`flex items-center gap-2 py-3 px-4 font-bold border-b-2 transition ${
              activeSubTab === 'jugadores'
                ? 'border-[#00e5ff] text-[#00e5ff] bg-[#0c182c]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={16} /> Gestión de Jugadores ({players.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OPERACIONES DE FICHAS (SUBIR / BAJAR CON RECUPERO) */}
          {activeSubTab === 'operaciones' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              {/* Official Rule Card of Recupero */}
              <div className="bg-gradient-to-r from-[#071926] via-[#091829] to-[#061421] border-2 border-cyan-500/40 rounded-2xl p-4 flex items-start gap-3 shadow-md">
                <RotateCcw className="w-5 h-5 text-[#00e5ff] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    Sistema de Recupero Oficial Activo
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    Si un jugador tiene una carga de <strong className="text-white">$20.000</strong> fichas y decide retirar <strong className="text-[#00e5ff]">$10.000</strong>, le quedarán solo <strong className="text-white">$10.000</strong> en su perfil para seguir jugando, y las <strong className="text-[#ffd700]">$10.000</strong> bajadas se suman inmediatamente al total de fichas de tu caja.
                  </p>
                </div>
              </div>

              {/* Operation Mode Selector Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOperationMode('CARGAR');
                    setLastOpResult(null);
                  }}
                  className={`py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition ${
                    operationMode === 'CARGAR'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-950'
                      : 'bg-[#060c16] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <ArrowUpCircle size={18} /> Subir / Cargar Fichas (+)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOperationMode('BAJAR_RECUPERO');
                    setLastOpResult(null);
                  }}
                  className={`py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition ${
                    operationMode === 'BAJAR_RECUPERO'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-950'
                      : 'bg-[#060c16] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <RotateCcw size={18} /> Bajar Fichas con RECUPERO (-)
                </button>
              </div>

              {/* Form Card */}
              <div className="bg-[#060d1a] border border-[#1b2b48] rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#16243d] pb-2 text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    {operationMode === 'CARGAR' ? (
                      <>
                        <ArrowUpCircle className="text-emerald-400" size={16} /> Cargar Fichas a Jugador (Se debitan de tu caja)
                      </>
                    ) : (
                      <>
                        <RotateCcw className="text-[#00e5ff]" size={16} /> Bajar Fichas (Se acreditan de vuelta a tu caja)
                      </>
                    )}
                  </span>
                  <span className="text-slate-400 font-mono">Saldo Caja: ${panel?.chipBalance.toLocaleString('es-AR')}</span>
                </div>

                <form
                  onSubmit={operationMode === 'CARGAR' ? handleChargePlayer : handleRedeemPlayer}
                  className="space-y-4 text-xs"
                >
                  {/* Target Player Input with Autocomplete / Quick Select */}
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">
                      Usuario del Jugador:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-500 font-bold">@</span>
                      <input
                        type="text"
                        required
                        placeholder="ej. jugador1 o carlos_palermo"
                        value={targetUsername}
                        onChange={(e) => setTargetUsername(e.target.value)}
                        className="w-full bg-[#040812] border border-slate-700 focus:border-[#00e5ff] rounded-xl pl-9 pr-3 py-2.5 text-white font-medium outline-none"
                      />
                    </div>

                    {/* Quick player chips display */}
                    {selectedPlayer && (
                      <div className="mt-2 p-2.5 rounded-lg bg-[#0b182d] border border-cyan-800/60 flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          Jugador identificado: <strong className="text-white">{selectedPlayer.fullName}</strong>
                        </span>
                        <span className="text-slate-300">
                          Saldo actual:{' '}
                          <strong className="text-[#ffd700] font-mono font-bold">
                            ${selectedPlayer.chipBalance.toLocaleString('es-AR')} fichas
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 block font-semibold text-[11px]">
                      Montos Frecuentes:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setOperationAmount(amt)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            operationAmount === amt
                              ? 'bg-[#00e5ff] text-black border-cyan-300 font-bold shadow-sm'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          ${amt.toLocaleString('es-AR')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">
                      Monto de Fichas (ARS):
                    </label>
                    <input
                      type="number"
                      min={500}
                      step={500}
                      required
                      value={operationAmount}
                      onChange={(e) => setOperationAmount(Number(e.target.value))}
                      className="w-full bg-[#040812] border border-slate-700 focus:border-[#00e5ff] rounded-xl px-4 py-2.5 text-[#ffd700] font-mono font-bold text-base outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">
                      Comprobante / Detalle (Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder={
                        operationMode === 'CARGAR'
                          ? 'ej. Pago recibido por MercadoPago alias'
                          : 'ej. Retiro solicitado por WhatsApp, transferencia enviada'
                      }
                      value={operationNotes}
                      onChange={(e) => setOperationNotes(e.target.value)}
                      className="w-full bg-[#040812] border border-slate-700 focus:border-[#00e5ff] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessingOp}
                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 ${
                      operationMode === 'CARGAR'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black'
                        : 'bg-gradient-to-r from-[#00e5ff] to-cyan-400 hover:brightness-110 text-black'
                    }`}
                  >
                    {isProcessingOp ? (
                      'PROCESANDO...'
                    ) : operationMode === 'CARGAR' ? (
                      <>
                        <ArrowUpCircle size={17} />
                        CARGAR ${operationAmount.toLocaleString('es-AR')} FICHAS AL JUGADOR
                      </>
                    ) : (
                      <>
                        <RotateCcw size={17} />
                        BAJAR ${operationAmount.toLocaleString('es-AR')} FICHAS Y RECUPERAR A CAJA
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Last Transaction Feedback */}
              {lastOpResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1.5 animate-fadeIn ${
                    lastOpResult.type === 'CARGA'
                      ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                      : 'bg-cyan-950/40 border-cyan-700 text-cyan-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle size={17} />
                    <span>{lastOpResult.message}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                    <div>
                      Saldo Jugador (@{lastOpResult.playerUsername}):{' '}
                      <strong className="text-white">${lastOpResult.playerBalance.toLocaleString('es-AR')}</strong>
                    </div>
                    <div>
                      Nuevo Saldo Caja:{' '}
                      <strong className="text-[#ffd700]">${lastOpResult.cashierBalance.toLocaleString('es-AR')}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GESTIÓN DE JUGADORES (CRUD COMPLETO) */}
          {activeSubTab === 'jugadores' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#060c16] p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Users size={18} className="text-[#00e5ff]" />
                    Jugadores Administrados por tu Agencia
                  </h4>
                  <p className="text-xs text-slate-400">
                    Crea jugadores con usuario y contraseña, carga fichas, baja fichas con recupero, edita o suspende cuentas.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por usuario o DNI..."
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      className="w-full bg-[#040810] border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <button
                    onClick={() => setShowCreatePlayerModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-black font-black text-xs uppercase flex items-center gap-1.5 hover:brightness-110 shadow-md transition whitespace-nowrap"
                  >
                    <UserPlus size={15} /> Nuevo Jugador
                  </button>
                </div>
              </div>

              {/* Players Table / Cards */}
              <div className="space-y-3">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`bg-[#060c16] border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                      player.status === 'activo'
                        ? 'border-slate-800 hover:border-cyan-800'
                        : 'border-red-900/50 bg-red-950/10'
                    }`}
                  >
                    {/* Player Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">@{player.username}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            player.status === 'activo'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}
                        >
                          {player.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{player.fullName} · DNI: {player.dni} · Tel: {player.phone}</p>

                      {/* Password / Credentials viewer */}
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="text-slate-400">Contraseña:</span>
                        <span className="font-mono text-[#00e5ff] font-bold bg-[#040810] px-2 py-0.5 rounded border border-slate-800">
                          {visiblePasswords[player.id] ? player.plainPassword || 'demo-player-password-change-me' : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePassword(player.id)}
                          className="text-slate-400 hover:text-white"
                          title="Mostrar/Ocultar Contraseña"
                        >
                          {visiblePasswords[player.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          onClick={() => copyPlayerCredentials(player)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center gap-1"
                          title="Copiar credenciales para enviar por WhatsApp"
                        >
                          {copiedPlayerPass === player.id ? (
                            <>
                              <Check size={11} className="text-emerald-400" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy size={11} /> WhatsApp
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chip Balance and Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Fichas Jugador</p>
                        <p className="text-base font-bold font-mono text-[#ffd700]">
                          ${player.chipBalance.toLocaleString('es-AR')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Quick Charge (+) */}
                        <button
                          onClick={() => {
                            setTargetUsername(player.username);
                            setOperationMode('CARGAR');
                            setActiveSubTab('operaciones');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                          title="Subir Fichas a este Jugador"
                        >
                          <ArrowUpCircle size={14} /> Cargar
                        </button>

                        {/* Quick Redeem with Recupero (-) */}
                        <button
                          onClick={() => {
                            setTargetUsername(player.username);
                            setOperationMode('BAJAR_RECUPERO');
                            setActiveSubTab('operaciones');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                          title="Bajar Fichas con Recupero a tu Caja"
                        >
                          <RotateCcw size={14} /> Bajar
                        </button>

                        {/* Edit Player */}
                        <button
                          onClick={() => {
                            setEditingPlayer(player);
                            setEditPlayerForm({
                              fullName: player.fullName,
                              phone: player.phone,
                              password: player.plainPassword || '',
                              status: player.status,
                            });
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Editar Datos o Contraseña"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Toggle Status */}
                        <button
                          onClick={() => handleTogglePlayerStatus(player)}
                          className={`p-1.5 rounded-lg border ${
                            player.status === 'activo'
                              ? 'border-yellow-900 text-yellow-400 hover:bg-yellow-950/50'
                              : 'border-emerald-900 text-emerald-400 hover:bg-emerald-950/50'
                          }`}
                          title={player.status === 'activo' ? 'Suspender Jugador' : 'Habilitar Jugador'}
                        >
                          <UserCheck size={14} />
                        </button>

                        {/* Delete Player */}
                        <button
                          onClick={() => setDeleteTargetPlayer(player)}
                          className="p-1.5 rounded-lg bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/60"
                          title="Eliminar Jugador y Recuperar Fichas"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL: NUEVO JUGADOR */}
        {showCreatePlayerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
            <div className="bg-[#0a1426] border-2 border-[#00e5ff] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <UserPlus className="text-[#00e5ff]" size={18} /> Dar de Alta Nuevo Jugador
                </h4>
                <button
                  onClick={() => setShowCreatePlayerModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePlayer} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nombre de Usuario (@):</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. marcos2025"
                    value={createPlayerForm.username}
                    onChange={(e) => setCreatePlayerForm({ ...createPlayerForm, username: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Contraseña para el Jugador:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. demo-player-password-change-me"
                    value={createPlayerForm.password}
                    onChange={(e) => setCreatePlayerForm({ ...createPlayerForm, password: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Marcos Antonio Benítez"
                    value={createPlayerForm.fullName}
                    onChange={(e) => setCreatePlayerForm({ ...createPlayerForm, fullName: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">DNI:</label>
                    <input
                      type="text"
                      placeholder="38.991.002"
                      value={createPlayerForm.dni}
                      onChange={(e) => setCreatePlayerForm({ ...createPlayerForm, dni: e.target.value })}
                      className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-semibold">WhatsApp:</label>
                    <input
                      type="text"
                      placeholder="+54 9 11 ..."
                      value={createPlayerForm.phone}
                      onChange={(e) => setCreatePlayerForm({ ...createPlayerForm, phone: e.target.value })}
                      className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Carga Inicial de Fichas (Opcional):</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={createPlayerForm.initialChips}
                    onChange={(e) => setCreatePlayerForm({ ...createPlayerForm, initialChips: Number(e.target.value) })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-[#ffd700] font-mono font-bold outline-none focus:border-[#00e5ff]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Se restará de tu saldo de caja (${panel?.chipBalance.toLocaleString('es-AR')}).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingPlayer}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider mt-2 shadow-lg transition"
                >
                  {isCreatingPlayer ? 'CREANDO JUGADOR...' : 'DAR DE ALTA Y GUARDAR CREDENCIALES'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDITAR JUGADOR */}
        {editingPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
            <div className="bg-[#0a1426] border-2 border-[#c5a059] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <Edit className="text-[#ffd700]" size={18} /> Editar Jugador: @{editingPlayer.username}
                </h4>
                <button onClick={() => setEditingPlayer(null)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditPlayer} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    value={editPlayerForm.fullName}
                    onChange={(e) => setEditPlayerForm({ ...editPlayerForm, fullName: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Teléfono / WhatsApp:</label>
                  <input
                    type="text"
                    value={editPlayerForm.phone}
                    onChange={(e) => setEditPlayerForm({ ...editPlayerForm, phone: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Cambiar Contraseña:</label>
                  <input
                    type="text"
                    placeholder="Escribe la nueva clave..."
                    value={editPlayerForm.password}
                    onChange={(e) => setEditPlayerForm({ ...editPlayerForm, password: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Estado de la Cuenta:</label>
                  <select
                    value={editPlayerForm.status}
                    onChange={(e) => setEditPlayerForm({ ...editPlayerForm, status: e.target.value as any })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                  >
                    <option value="activo">Activo (Puede jugar y apostar)</option>
                    <option value="suspendido">Suspendido (Bloqueado)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isEditingPlayer}
                  className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#dfb76c] text-black font-bold text-xs uppercase tracking-wider mt-2 transition"
                >
                  {isEditingPlayer ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ELIMINAR JUGADOR CON RECUPERO */}
        {deleteTargetPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
            <div className="bg-[#0a1426] border-2 border-red-600 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400 border-b border-red-900/50 pb-3">
                <AlertTriangle size={24} />
                <h4 className="font-serif font-bold text-white text-base">
                  ¿Eliminar Jugador @{deleteTargetPlayer.username}?
                </h4>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  Estás a punto de dar de baja la cuenta del jugador <strong className="text-white">@{deleteTargetPlayer.username}</strong> ({deleteTargetPlayer.fullName}).
                </p>
                <div className="bg-cyan-950/40 border border-cyan-800 p-3 rounded-xl text-cyan-300">
                  <strong>✓ Recupero Automático a tu Caja:</strong>
                  <p className="mt-1">
                    Las <span className="font-mono font-bold text-white">${deleteTargetPlayer.chipBalance.toLocaleString('es-AR')}</span> fichas remanentes en la cuenta del jugador volverán inmediatamente al saldo de tu caja.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetPlayer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePlayer}
                  disabled={isDeletingPlayer}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Trash2 size={14} />
                  {isDeletingPlayer ? 'ELIMINANDO...' : 'SÍ, ELIMINAR Y RECUPERAR FICHAS'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
