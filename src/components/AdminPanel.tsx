import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Transaction, GameRoundHistory, ChipRequest, CashierPanel, DualDatabaseStatus, CasinoGame } from '../types';
import { DualDatabaseTab } from './admin/DualDatabaseTab';
import { CashiersManagementTab } from './admin/CashiersManagementTab';
import { AssetForgeTab } from './admin/AssetForgeTab';
import {
  Lock,
  Users,
  Coins,
  ShieldCheck,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  PlusCircle,
  MinusCircle,
  Bell,
  Activity,
  Award,
  Filter,
  Zap,
  Landmark,
  Plus,
  ArrowUpRight,
  UserCheck,
  UserX,
  Sliders,
  DollarSign,
  KeyRound,
  FileSpreadsheet,
  Database,
  Server,
  HardDrive,
  Cpu,
  Layers,
  Check,
  Wand2,
} from 'lucide-react';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user: currentUser, addToast, updateUserBalanceDirect } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'boveda'
    | 'cajeros'
    | 'users'
    | 'requests'
    | 'transactions'
    | 'gamehistory'
    | 'database'
    | 'assetforge'
    | 'broadcast'
  >('overview');

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cashiers, setCashiers] = useState<CashierPanel[]>([]);
  const [requests, setRequests] = useState<ChipRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameHistory, setGameHistory] = useState<GameRoundHistory[]>([]);
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Minting state (Infinite Vault)
  const [mintAmount, setMintAmount] = useState<number>(50000000);
  const [mintReason, setMintReason] = useState<string>('Emisión autorizada para liquidez de red y cajeros');
  const [isMinting, setIsMinting] = useState(false);

  // New Cashier Sub-panel Modal State
  const [showCreateCashierModal, setShowCreateCashierModal] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [newCashierOperator, setNewCashierOperator] = useState('');
  const [newCashierUsername, setNewCashierUsername] = useState('');
  const [newCashierDni, setNewCashierDni] = useState('');
  const [newCashierPhone, setNewCashierPhone] = useState('+54 9 11 ');
  const [newCashierAlias, setNewCashierAlias] = useState('');
  const [newCashierCommission, setNewCashierCommission] = useState(10);
  const [newCashierInitialChips, setNewCashierInitialChips] = useState(5000000);
  const [newCashierNotes, setNewCashierNotes] = useState('');

  // Fund Cashier Modal State
  const [fundTargetCashier, setFundTargetCashier] = useState<CashierPanel | null>(null);
  const [fundAmount, setFundAmount] = useState<number>(5000000);
  const [fundNotes, setFundNotes] = useState<string>('Fondeo de recarga semanal');

  // Balance adjustment modal state
  const [adjustTargetUser, setAdjustTargetUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50000);
  const [adjustType, setAdjustType] = useState<'CARGA' | 'RETIRO'>('CARGA');
  const [adjustReason, setAdjustReason] = useState<string>('Acreditación manual por Cajero Central');

  // Search queries
  const [userSearch, setUserSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [cashierSearch, setCashierSearch] = useState('');

  // Integrity Check State
  const [integrityReport, setIntegrityReport] = useState<{ isValid: boolean; totalBlocks: number; checkedAt: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Dual Database & Quota Failover state
  const [dbStatus, setDbStatus] = useState<DualDatabaseStatus | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Dynamic Game Container Creator state
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameSubtitle, setNewGameSubtitle] = useState('');
  const [newGameCategory, setNewGameCategory] = useState<'slots' | 'ruleta' | 'bingo'>('slots');
  const [newGameSkinId, setNewGameSkinId] = useState('slot-faraon');
  const [newGameRtp, setNewGameRtp] = useState<number>(96.8);
  const [newGameMinBet, setNewGameMinBet] = useState<number>(500);
  const [newGameMaxBet, setNewGameMaxBet] = useState<number>(50000);
  const [newGameVolatility, setNewGameVolatility] = useState<'Baja' | 'Media' | 'Alta' | 'Muy Alta'>('Alta');
  const [newGameThumbnail, setNewGameThumbnail] = useState(
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80'
  );
  const [newGameFeatures, setNewGameFeatures] = useState('Cascadas Megaways, Giros Gratis, Multiplicadores Dinámicos');
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const loadDbStatus = async () => {
    setIsDbLoading(true);
    try {
      const res = await api.getDatabaseStatus();
      if (res && res.status) {
        setDbStatus(res.status);
      }
    } catch (err: any) {
      console.warn('Error fetching dual database status:', err);
    } finally {
      setIsDbLoading(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncingDb(true);
    try {
      const res = await api.forceDatabaseSync();
      addToast(res.message, 'success');
      setDbStatus(res.status);
    } catch (err: any) {
      addToast(err.message || 'Error al forzar sincronización', 'error');
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleSwitchDbTarget = async (target: 'primary' | 'secondary') => {
    try {
      const res = await api.switchDatabase(target);
      addToast(res.message, 'success');
      setDbStatus(res.status);
    } catch (err: any) {
      addToast(err.message || 'Error al conmutar base de datos', 'error');
    }
  };

  const handleCreateCustomGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) {
      addToast('El título del juego es obligatorio.', 'error');
      return;
    }

    setIsCreatingGame(true);
    try {
      const featuresArr = newGameFeatures
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await api.createCustomGame({
        title: newGameTitle.trim(),
        subtitle: newGameSubtitle.trim() || 'Edición Especial La Clave',
        category: newGameCategory,
        skinId: newGameSkinId,
        rtp: Number(newGameRtp) || 96.5,
        minBet: Number(newGameMinBet) || 500,
        maxBet: Number(newGameMaxBet) || 50000,
        volatility: newGameVolatility,
        thumbnail: newGameThumbnail.trim(),
        description: `Juego de ${newGameCategory} dinámico montado en contenedor modular sin generar archivos HTML adicionales.`,
        features: featuresArr,
      });

      addToast(res.message, 'success');
      setNewGameTitle('');
      setNewGameSubtitle('');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al montar nuevo juego en contenedor', 'error');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, usersRes, cashiersRes, reqsRes, txRes, historyRes, gamesRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getCashierPanels(),
        api.getAdminChipRequests(),
        api.getAdminTransactions(),
        api.getAdminGameHistory(),
        api.getGames(),
      ]);

      setMetrics(overviewRes.metrics);
      setUsers(usersRes.users);
      setCashiers(cashiersRes.cashiers || []);
      setRequests(reqsRes.requests);
      setTransactions(txRes.transactions);
      setGameHistory(historyRes.history);
      setGames(gamesRes.games || []);
    } catch (err: any) {
      addToast('Error al cargar datos administrativos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadDbStatus();
  }, []);

  // Infinite Chip Minting Handler
  const handleMintChips = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintAmount || mintAmount <= 0) return;

    setIsMinting(true);
    try {
      const res = await api.mintChips(mintAmount, mintReason);
      addToast(
        `⚡ ¡Emisión Exitosa! $${mintAmount.toLocaleString('es-AR')} fichas agregadas a la Bóveda Central.`,
        'success'
      );
      if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin') {
        updateUserBalanceDirect(res.adminUser.chipBalance);
      }
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al emitir fichas', 'error');
    } finally {
      setIsMinting(false);
    }
  };

  // Create Sub-Panel Handler
  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCashierPanel({
        name: newCashierName,
        operatorName: newCashierOperator,
        username: newCashierUsername,
        dni: newCashierDni,
        phone: newCashierPhone,
        aliasCobro: newCashierAlias,
        commissionRate: newCashierCommission,
        initialChips: newCashierInitialChips,
        notes: newCashierNotes,
      });

      addToast(`Sub-panel "${res.panel.name}" creado con éxito.`, 'success');
      setShowCreateCashierModal(false);
      // Reset form
      setNewCashierName('');
      setNewCashierOperator('');
      setNewCashierUsername('');
      setNewCashierDni('');
      setNewCashierAlias('');
      setNewCashierNotes('');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al crear sub-panel de cajero', 'error');
    }
  };

  // Fund Cashier Handler
  const handleFundCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundTargetCashier) return;

    try {
      await api.fundCashierPanel(fundTargetCashier.id, fundAmount, fundNotes);
      addToast(
        `Se inyectaron $${fundAmount.toLocaleString('es-AR')} fichas al sub-panel ${fundTargetCashier.name}`,
        'success'
      );
      setFundTargetCashier(null);
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al fondear sub-panel', 'error');
    }
  };

  // Toggle Cashier Status Handler
  const handleToggleCashier = async (cashierId: string) => {
    try {
      const res = await api.toggleCashierPanel(cashierId);
      addToast(`Sub-panel ahora está ${res.panel.status.toUpperCase()}`, 'info');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  const handleProcessRequest = async (requestId: string, approve: boolean) => {
    try {
      await api.processChipRequest(requestId, approve);
      addToast(`La solicitud ha sido ${approve ? 'APROBADA' : 'RECHAZADA'}.`, 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al procesar solicitud.', 'error');
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetUser) return;

    try {
      await api.adminAdjustBalance(adjustTargetUser.id, adjustAmount, adjustType, adjustReason);
      addToast(
        `Se han ${adjustType === 'CARGA' ? 'acreditado' : 'debitado'} $${adjustAmount.toLocaleString('es-AR')} fichas a ${adjustTargetUser.username}.`,
        'success'
      );
      setAdjustTargetUser(null);
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al modificar saldo.', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await api.adminToggleStatus(userId);
      addToast('Estado de cuenta actualizado con éxito.', 'info');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Error al alternar estado.', 'error');
    }
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await api.verifyIntegrity();
      setIntegrityReport(res);
      addToast('Cadena criptográfica auditada: 100% íntegra.', 'success');
    } catch (err: any) {
      addToast('Error en la verificación de hash SHA-256.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    try {
      await api.broadcastNotification(broadcastTitle, broadcastMessage, 'SISTEMA');
      addToast('Notificación enviada a todos los jugadores en tiempo real.', 'success');
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err: any) {
      addToast(err.message || 'Error al emitir comunicado.', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.dni.includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const filteredCashiers = cashiers.filter((c) => {
    if (!cashierSearch.trim()) return true;
    const q = cashierSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.operatorName.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.aliasCobro.toLowerCase().includes(q)
    );
  });

  const filteredTx = transactions.filter((t) => {
    if (!txSearch.trim()) return true;
    const q = txSearch.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.username.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      (t.gameTitle && t.gameTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-lg">
      <div className="relative w-full max-w-6xl bg-[#080e1a] border-2 border-[#c5a059] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="bg-[#0b1426] border-b border-[#1c2c4b] px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2a1e0b] border border-[#c5a059] flex items-center justify-center text-[#dfb76c]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-slate-100">
                  Panel Principal & Bóveda Central Super Admin
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#14233f] text-[#dfb76c] border border-[#273d66]">
                  LA CLAVE ARGENTINA CASINOS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Emisión ilimitada de fichas, gestión de sub-páneles de cajeros, control total de usuarios y ledger SHA-256
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-[#0e172a] border border-[#233554] text-slate-300 hover:text-white"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#142038] hover:bg-[#1c2c4d] text-slate-300 text-xs font-semibold"
            >
              Volver al Casino
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#182642] bg-[#060b16] px-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Métricas Generales', icon: Activity },
            { id: 'boveda', label: '⚡ Bóveda & Emisión Ilimitada', icon: Zap },
            { id: 'cajeros', label: `Sub-Páneles de Cajeros (${cashiers.length})`, icon: Landmark },
            { id: 'database', label: 'Dual DB & Caché L1 (Cuotas)', icon: Database },
            { id: 'assetforge', label: '🎨 Game Studio & AI Forge', icon: Wand2 },
            { id: 'users', label: 'Gestión de Usuarios & Saldos', icon: Users },
            {
              id: 'requests',
              label: `Cajero (${requests.filter((r) => r.status === 'PENDIENTE').length} Pendientes)`,
              icon: Coins,
            },
            { id: 'transactions', label: 'Libro Mayor Cifrado', icon: ShieldCheck },
            { id: 'gamehistory', label: 'Historial de Jugadas', icon: History },
            { id: 'broadcast', label: 'Comunicados en Vivo', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-[#c5a059] text-[#fae5b8] bg-[#0c162b]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#070c18] space-y-6">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0b1426] border border-[#1b2a47] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium">Jugadores Registrados</div>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {metrics.totalPlayers}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">✓ Cuentas verificadas DNI</div>
                </div>

                <div className="bg-[#0b1426] border border-[#1b2a47] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium">Fichas en Circulación</div>
                  <div className="text-2xl font-black font-mono text-[#fae5b8] mt-1">
                    ${metrics.totalChipsInCirculation.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Pasivo de fichas emitidas</div>
                </div>

                <div className="bg-[#0b1426] border border-[#1b2a47] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium">Sub-Páneles de Cajeros</div>
                  <div className="text-2xl font-black font-mono text-[#00e5ff] mt-1">
                    {cashiers.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Cajeros habilitados en red</div>
                </div>

                <div className="bg-[#0b1426] border border-[#1b2a47] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium">GGR Margen de la Casa</div>
                  <div
                    className={`text-2xl font-black font-mono mt-1 ${
                      metrics.grossGamingRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    ${metrics.grossGamingRevenue.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Total apuestas - Total premios</div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-[#1b1509] to-[#0c162b] border border-[#c5a059]/40 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#fae5b8] text-sm flex items-center gap-2">
                      <Zap className="text-[#ffd700]" size={16} /> Emisión Ilimitada de Fichas
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Genera liquidez infinita directa a la Bóveda Central.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('boveda')}
                    className="px-3 py-1.5 rounded-lg bg-[#c5a059] text-black font-bold text-xs hover:bg-[#dfb76c] transition"
                  >
                    Ir a Bóveda
                  </button>
                </div>

                <div className="bg-gradient-to-r from-[#0a1b26] to-[#0c162b] border border-[#00e5ff]/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#b9f6ca] text-sm flex items-center gap-2">
                      <Landmark className="text-[#00e5ff]" size={16} /> Alta de Sub-Páneles
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Crea cajeros, asigna comisiones y fondea saldos.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('cajeros');
                      setShowCreateCashierModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#00e5ff] text-black font-bold text-xs hover:bg-cyan-300 transition"
                  >
                    + Nuevo Cajero
                  </button>
                </div>
              </div>

              {/* Cryptographic Auditor Card */}
              <div className="bg-[#091224] border-2 border-[#1f3152] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Auditoría Criptográfica de la Base de Datos
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verificación de firma digital inalterable SHA-256 de todas las jugadas y transacciones
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyIntegrity}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#e2be78] text-black font-bold text-xs flex items-center gap-2 transition-all hover:scale-102"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isVerifying ? 'AUDITANDO CADENA...' : 'VERIFICAR INTEGRIDAD AHORA'}</span>
                  </button>
                </div>

                {integrityReport && (
                  <div className="bg-[#060c18] border border-emerald-700/60 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle className="w-5 h-5" />
                      <span>LIBRO MAYOR 100% ÍNTEGRO Y LIBRE DE ALTERACIONES</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px] pt-1 border-t border-[#132038]">
                      <div>
                        Total Bloques Auditados:{' '}
                        <span className="font-mono font-bold text-white">
                          {integrityReport.totalBlocks}
                        </span>
                      </div>
                      <div>
                        Algoritmo: <span className="font-mono text-[#dfb76c]">HMAC-SHA256</span>
                      </div>
                      <div>
                        Última verificación:{' '}
                        <span className="font-mono text-slate-400">
                          {new Date(integrityReport.checkedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BÓVEDA & EMISIÓN ILIMITADA (SUPERADMIN VAULT) */}
          {activeTab === 'boveda' && (
            <div className="space-y-6">
              {/* Vault Header Banner */}
              <div className="bg-gradient-to-r from-[#211804] via-[#352507] to-[#160f02] border-2 border-[#ffd700]/60 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Zap size={140} className="text-[#ffd700]" />
                </div>
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffd700]/20 border border-[#ffd700]/40 text-[#ffd700] text-xs font-bold uppercase tracking-wider">
                    <Zap size={14} /> Bóveda Maestra de Emisión Directa
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-black text-white">
                    Emisión Ilimitada de Fichas (Super Admin)
                  </h3>
                  <p className="text-sm text-slate-300 max-w-2xl">
                    Desde este panel podés acuñar fichas ilimitadas sin restricciones. Cada emisión se registra en el Libro Mayor inalterable SHA-256 para auditar el flujo de caja hacia los sub-páneles de cajeros.
                  </p>
                </div>
              </div>

              {/* Minting Form */}
              <div className="bg-[#0b1426] border border-[#1c2c4b] rounded-2xl p-6 space-y-5">
                <h4 className="font-bold text-[#fae5b8] text-base flex items-center gap-2">
                  <Coins className="text-[#ffd700]" size={20} /> Acuñar Fichas a la Bóveda Central
                </h4>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Accesos Rápidos de Emisión:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { label: '+10 Millones', value: 10000000 },
                      { label: '+50 Millones', value: 50000000 },
                      { label: '+100 Millones', value: 100000000 },
                      { label: '+500 Millones', value: 500000000 },
                      { label: '+1.000 Millones', value: 1000000000 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setMintAmount(preset.value)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          mintAmount === preset.value
                            ? 'bg-[#c5a059] text-black border-[#ffd700] shadow-md'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        <Zap size={14} className={mintAmount === preset.value ? 'text-black' : 'text-[#ffd700]'} />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleMintChips} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">
                        Monto Exacto a Emitir (Fichas ARS):
                      </label>
                      <input
                        type="number"
                        min={1000}
                        step={1000}
                        required
                        value={mintAmount}
                        onChange={(e) => setMintAmount(Number(e.target.value))}
                        className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-xl px-4 py-3 text-base text-white font-mono font-bold outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Formato legible: ${mintAmount.toLocaleString('es-AR')} fichas
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 block mb-1 font-medium">
                        Justificación / Motivo en Ledger:
                      </label>
                      <input
                        type="text"
                        required
                        value={mintReason}
                        onChange={(e) => setMintReason(e.target.value)}
                        className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-xl px-4 py-3 text-xs text-white outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Se incrustará en el bloque SHA-256 como firma inalterable.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isMinting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#c5a059] to-[#ffd700] text-black font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-2"
                  >
                    <Zap size={18} />
                    {isMinting
                      ? 'ACUÑANDO EN BÓVEDA...'
                      : `CONFIRMAR EMISIÓN DE $${mintAmount.toLocaleString('es-AR')} FICHAS`}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: GESTIÓN TOTAL DE SUB-PÁNELES DE CAJEROS */}
          {activeTab === 'cajeros' && (
            <CashiersManagementTab cashiers={cashiers} onRefresh={loadData} />
          )}

          {/* TAB 4: GESTIÓN DE USUARIOS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por usuario, nombre o DNI..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-[#0b1426] border border-[#1b2b48] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Mostrando <span className="text-white font-bold">{filteredUsers.length}</span> usuarios
                </div>
              </div>

              <div className="bg-[#0b1426] border border-[#1b2b48] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#070c18] border-b border-[#1b2b48] text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Usuario / Nombre</th>
                        <th className="p-3">DNI</th>
                        <th className="p-3">Rol</th>
                        <th className="p-3">Saldo Fichas</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#132038]">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#0d182e] transition">
                          <td className="p-3">
                            <div className="font-bold text-white">{u.fullName}</div>
                            <div className="text-[11px] text-slate-400">@{u.username}</div>
                          </td>
                          <td className="p-3 font-mono">{u.dni}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'superadmin' || u.role === 'admin'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : u.role === 'cajero'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#fae5b8]">
                            ${u.chipBalance.toLocaleString('es-AR')}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.status === 'activo'
                                  ? 'bg-emerald-950 text-emerald-400'
                                  : 'bg-red-950 text-red-400'
                              }`}
                            >
                              {u.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setAdjustTargetUser(u);
                                  setAdjustAmount(50000);
                                  setAdjustType('CARGA');
                                }}
                                className="px-2.5 py-1 rounded bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#fae5b8] border border-[#c5a059]/40 font-medium"
                              >
                                Ajustar Saldo
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className={`px-2.5 py-1 rounded text-[11px] border ${
                                  u.status === 'activo'
                                    ? 'border-red-900 text-red-400 hover:bg-red-950/40'
                                    : 'border-emerald-900 text-emerald-400 hover:bg-emerald-950/40'
                                }`}
                              >
                                {u.status === 'activo' ? 'Suspender' : 'Activar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOLICITUDES DE CAJERO */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="bg-[#0b1426] border border-[#1b2b48] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#070c18] border-b border-[#1b2b48] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Usuario</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Alias / CBU</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Resolución</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#132038]">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-[#0d182e]">
                        <td className="p-3 font-semibold text-white">@{r.username}</td>
                        <td className="p-3 font-bold">
                          <span
                            className={r.tipo === 'CARGA' ? 'text-emerald-400' : 'text-amber-400'}
                          >
                            {r.tipo}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          ${r.amount.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {r.aliasTransferencia || '-'}
                        </td>
                        <td className="p-3 text-[11px] text-slate-400">
                          {new Date(r.requestedAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'APROBADO'
                                ? 'bg-emerald-950 text-emerald-400'
                                : r.status === 'RECHAZADO'
                                ? 'bg-red-950 text-red-400'
                                : 'bg-amber-950 text-amber-400 animate-pulse'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {r.status === 'PENDIENTE' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleProcessRequest(r.id, true)}
                                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleProcessRequest(r.id, false)}
                                className="px-2.5 py-1 rounded bg-red-900 hover:bg-red-800 text-white font-bold"
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Procesado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LIBRO MAYOR SHA-256 */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por hash, usuario o tipo..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full bg-[#0b1426] border border-[#1b2b48] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="bg-[#0b1426] border border-[#1b2b48] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#070c18] border-b border-[#1b2b48] text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">ID Bloque</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Usuario</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Firma SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#132038] font-mono text-[11px]">
                    {filteredTx.map((t) => (
                      <tr key={t.id} className="hover:bg-[#0d182e]">
                        <td className="p-3 text-slate-400 font-bold">{t.id}</td>
                        <td className="p-3 text-slate-400">{new Date(t.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3 text-white font-semibold font-sans">@{t.username}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {t.type}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-[#ffd700]">
                          ${t.amount.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3 text-[10px] text-emerald-400 truncate max-w-[180px]">
                          {t.hashIntegrity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: HISTORIAL DE JUGADAS */}
          {activeTab === 'gamehistory' && (
            <div className="bg-[#0b1426] border border-[#1b2b48] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070c18] border-b border-[#1b2b48] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Juego</th>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Apuesta</th>
                    <th className="p-3">Premio</th>
                    <th className="p-3">Mult.</th>
                    <th className="p-3">Resumen de Tirada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#132038]">
                  {gameHistory.map((g) => (
                    <tr key={g.id} className="hover:bg-[#0d182e]">
                      <td className="p-3 font-bold text-white">{g.gameTitle}</td>
                      <td className="p-3 text-slate-400">@{g.username}</td>
                      <td className="p-3 font-mono">${g.betAmount.toLocaleString('es-AR')}</td>
                      <td
                        className={`p-3 font-mono font-bold ${
                          g.payoutAmount > 0 ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        ${g.payoutAmount.toLocaleString('es-AR')}
                      </td>
                      <td className="p-3 font-bold text-[#c5a059]">{g.multiplier}x</td>
                      <td className="p-3 text-[11px] text-slate-300">{g.resultSummary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: DUAL DATABASE & CACHE MANAGEMENT */}
          {activeTab === 'database' && (
            <DualDatabaseTab
              status={dbStatus}
              isLoading={isDbLoading}
              isSyncing={isSyncingDb}
              onForceSync={handleForceSync}
              onSwitchTarget={handleSwitchDbTarget}
              onRefresh={loadDbStatus}
            />
          )}

          {/* TAB: ASSET FORGE & GAME STUDIO */}
          {activeTab === 'assetforge' && (
            <AssetForgeTab />
          )}

          {/* TAB 8: COMUNICADOS EN VIVO */}
          {activeTab === 'broadcast' && (
            <div className="max-w-xl bg-[#0b1426] border border-[#1b2b48] rounded-2xl p-6 space-y-4">
              <h3 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Bell className="text-[#ffd700]" size={20} /> Emitir Notificación en Tiempo Real
              </h3>
              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Título del Comunicado:</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="ej. Mantenimiento programado o Bono del Fin de Semana"
                    className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Mensaje para los Jugadores:</label>
                  <textarea
                    rows={3}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Detalles del aviso..."
                    className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#dfb76c] text-black font-bold text-xs uppercase"
                >
                  TRANSMITIR COMUNICADO A TODOS
                </button>
              </form>
            </div>
          )}
        </div>

        {/* MODAL: CREATE NEW CASHIER SUB-PANEL */}
        {showCreateCashierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0b1426] border-2 border-[#00e5ff] rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <Landmark className="text-[#00e5ff]" size={18} /> Alta de Nuevo Sub-Panel de Cajero
                </h4>
                <button
                  onClick={() => setShowCreateCashierModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCashier} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Nombre de la Agencia / Caja:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Caja Central Palermo VIP o Agencia Rosario"
                    value={newCashierName}
                    onChange={(e) => setNewCashierName(e.target.value)}
                    className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Operador Responsable:</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellido"
                      value={newCashierOperator}
                      onChange={(e) => setNewCashierOperator(e.target.value)}
                      className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Usuario del Cajero:</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. cajero_rosario"
                      value={newCashierUsername}
                      onChange={(e) => setNewCashierUsername(e.target.value)}
                      className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">DNI Operador:</label>
                    <input
                      type="text"
                      required
                      placeholder="35.120.440"
                      value={newCashierDni}
                      onChange={(e) => setNewCashierDni(e.target.value)}
                      className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Teléfono / WhatsApp:</label>
                    <input
                      type="text"
                      value={newCashierPhone}
                      onChange={(e) => setNewCashierPhone(e.target.value)}
                      className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Alias CVU de Cobro:</label>
                    <input
                      type="text"
                      placeholder="ej. LACLAVE.ROSARIO.CVU"
                      value={newCashierAlias}
                      onChange={(e) => setNewCashierAlias(e.target.value)}
                      className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Comisión (%):</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={newCashierCommission}
                      onChange={(e) => setNewCashierCommission(Number(e.target.value))}
                      className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">
                    Fondeo Inicial de Fichas (Desde Bóveda):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={newCashierInitialChips}
                    onChange={(e) => setNewCashierInitialChips(Number(e.target.value))}
                    className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white font-mono font-bold outline-none focus:border-[#00e5ff]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Se debitará de la Bóveda Maestra y se acreditará inmediatamente a la caja.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-black font-black text-xs uppercase tracking-wider mt-2 shadow-lg hover:brightness-105 transition"
                >
                  DAR DE ALTA SUB-PANEL DE CAJERO
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FUND CASHIER PANEL */}
        {fundTargetCashier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0b1426] border-2 border-[#c5a059] rounded-2xl p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
                <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                  <Coins className="text-[#ffd700]" size={18} /> Inyectar Fichas a {fundTargetCashier.name}
                </h4>
                <button
                  onClick={() => setFundTargetCashier(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFundCashier} className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400">
                    Operador: <span className="text-white font-bold">{fundTargetCashier.operatorName}</span>
                  </p>
                  <p className="text-slate-400">
                    Saldo Actual: <span className="text-[#ffd700] font-mono font-bold">${fundTargetCashier.chipBalance.toLocaleString('es-AR')}</span>
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Monto a Inyectar (Fichas):</label>
                  <input
                    type="number"
                    min={10000}
                    step={10000}
                    required
                    value={fundAmount}
                    onChange={(e) => setFundAmount(Number(e.target.value))}
                    className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white font-mono font-bold text-sm outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Nota / Justificación:</label>
                  <input
                    type="text"
                    value={fundNotes}
                    onChange={(e) => setFundNotes(e.target.value)}
                    className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#dfb76c] text-black font-bold text-xs uppercase tracking-wider"
                >
                  CONFIRMAR FONDEO DESDE BÓVEDA
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADJUST USER BALANCE */}
        {adjustTargetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0b1426] border-2 border-[#c5a059] rounded-2xl p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
                <h4 className="font-serif font-bold text-white text-base">
                  Ajustar Saldo: @{adjustTargetUser.username}
                </h4>
                <button
                  onClick={() => setAdjustTargetUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdjustBalance} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Operación:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('CARGA')}
                      className={`py-2 rounded-lg font-bold border transition ${
                        adjustType === 'CARGA'
                          ? 'bg-emerald-800 text-white border-emerald-500'
                          : 'bg-[#070d1a] text-slate-400 border-[#1f3152]'
                      }`}
                    >
                      + Acreditar Fichas
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('RETIRO')}
                      className={`py-2 rounded-lg font-bold border transition ${
                        adjustType === 'RETIRO'
                          ? 'bg-red-800 text-white border-red-500'
                          : 'bg-[#070d1a] text-slate-400 border-[#1f3152]'
                      }`}
                    >
                      - Debitar Fichas
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Cantidad de Fichas:</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white font-mono font-bold text-sm outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Motivo:</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full bg-[#070d1a] border border-[#1f3152] rounded-lg px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#dfb76c] text-black font-bold text-xs uppercase"
                >
                  REGISTRAR EN LIBRO MAYOR
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
