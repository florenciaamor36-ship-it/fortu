import React, { useState } from 'react';
import { CashierPanel, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { sound } from '../../utils/audio';
import {
  Landmark,
  Plus,
  Coins,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  Power,
  Key,
  Shield,
  ExternalLink,
  Phone,
  CreditCard,
  Percent,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';

interface CashiersManagementTabProps {
  cashiers: CashierPanel[];
  onRefresh: () => void;
}

export const CashiersManagementTab: React.FC<CashiersManagementTabProps> = ({ cashiers, onRefresh }) => {
  const { addToast } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    operatorName: '',
    username: '',
    password: '',
    dni: '',
    phone: '+54 9 11 ',
    aliasCobro: '',
    commissionRate: 10,
    initialChips: 5000000,
    notes: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal state
  const [editingCashier, setEditingCashier] = useState<CashierPanel | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    operatorName: '',
    phone: '',
    aliasCobro: '',
    commissionRate: 10,
    notes: '',
    password: '',
    status: 'activo' as 'activo' | 'suspendido',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fund modal state (Unlimited)
  const [fundCashier, setFundCashier] = useState<CashierPanel | null>(null);
  const [fundAmount, setFundAmount] = useState<number>(10000000);
  const [fundNotes, setFundNotes] = useState('Inyección ilimitada de liquidez autorizada');
  const [isFunding, setIsFunding] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CashierPanel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('¡URL copiada al portapapeles!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredCashiers = cashiers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.aliasCobro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.operatorName || !createForm.username) {
      addToast('Nombre de caja, operador y usuario son obligatorios', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.createCashierPanel(createForm);
      addToast(res.message || 'Sub-panel creado exitosamente', 'success');
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        operatorName: '',
        username: '',
        password: '',
        dni: '',
        phone: '+54 9 11 ',
        aliasCobro: '',
        commissionRate: 10,
        initialChips: 5000000,
        notes: '',
      });
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Error al crear sub-panel de cajero', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (cashier: CashierPanel) => {
    setEditingCashier(cashier);
    setEditForm({
      name: cashier.name,
      operatorName: cashier.operatorName,
      phone: cashier.phone,
      aliasCobro: cashier.aliasCobro,
      commissionRate: cashier.commissionRate,
      notes: cashier.notes || '',
      password: '',
      status: cashier.status,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCashier) return;

    setIsEditing(true);
    try {
      const res = await api.editCashierPanel(editingCashier.id, editForm);
      addToast(res.message || 'Sub-panel actualizado exitosamente', 'success');
      setEditingCashier(null);
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Error al actualizar sub-panel', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggle = async (cashier: CashierPanel) => {
    try {
      const res = await api.toggleCashierPanel(cashier.id);
      addToast(`Sub-panel ${res.panel.name} ahora está ${res.panel.status.toUpperCase()}`, 'success');
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Error al cambiar estado del sub-panel', 'error');
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundCashier || fundAmount <= 0) return;

    setIsFunding(true);
    sound.playCoin();
    try {
      const res = await api.fundCashierPanel(fundCashier.id, fundAmount, fundNotes);
      addToast(res.message || 'Fichas inyectadas con éxito', 'success');
      setFundCashier(null);
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Error al fondear sub-panel', 'error');
    } finally {
      setIsFunding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await api.deleteCashierPanel(deleteTarget.id);
      addToast(res.message || 'Sub-panel eliminado correctamente', 'success');
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      addToast(err.message || 'Error al eliminar sub-panel', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCashierUrl = (cashier: CashierPanel) => {
    const slug = cashier.slug || cashier.username;
    return `${window.location.origin}/?cajero=${slug}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#081122] border border-[#1b2b48] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Landmark className="text-[#00e5ff]" size={22} />
              Gestión Maestra de Sub-Páneles de Cajeros
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-950 text-[#00e5ff] border border-cyan-800">
              {cashiers.length} Paneles Activos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Crea paneles con URL propia, emite fichas ilimitadas, edita, suspende o elimina cajas con recupero a la Bóveda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar caja, operador, usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050a14] border border-[#1b2b48] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#00e5ff]"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-110 shadow-lg shadow-cyan-950 transition whitespace-nowrap"
          >
            <Plus size={16} /> Crear Panel de Cajero
          </button>
        </div>
      </div>

      {/* Cashier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCashiers.map((cashier) => {
          const panelUrl = getCashierUrl(cashier);
          return (
            <div
              key={cashier.id}
              className={`bg-[#0a1324] border-2 rounded-2xl p-5 space-y-4 transition-all shadow-lg ${
                cashier.status === 'activo'
                  ? 'border-[#192b4a] hover:border-[#00e5ff]/50'
                  : 'border-red-900/50 opacity-80'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-lg">{cashier.name}</h4>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        cashier.status === 'activo'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {cashier.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Operador: <span className="font-semibold text-white">{cashier.operatorName}</span>
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>Usuario: <span className="text-[#00e5ff] font-bold">@{cashier.username}</span></span>
                    <span>DNI: {cashier.dni}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block text-xs px-2.5 py-1 rounded-lg bg-[#c5a059]/15 text-[#ffd700] border border-[#c5a059]/40 font-mono font-bold">
                    {cashier.commissionRate}% Comisión
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {cashier.id}
                  </div>
                </div>
              </div>

              {/* Dedicated Panel URL Banner */}
              <div className="bg-[#050a14] border border-[#1b2b48] rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <ExternalLink size={14} className="text-[#00e5ff] shrink-0" />
                  <span className="text-[11px] text-slate-400 truncate font-mono">
                    {panelUrl}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(panelUrl, cashier.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition"
                  title="Copiar URL del Panel"
                >
                  {copiedId === cashier.id ? (
                    <>
                      <Check size={13} className="text-emerald-400" /> Copiada
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copiar URL
                    </>
                  )}
                </button>
              </div>

              {/* Financial Metrics in Box */}
              <div className="grid grid-cols-3 gap-2 bg-[#050a14] p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Saldo en Caja</p>
                  <p className="text-base font-bold text-[#ffd700] font-mono mt-0.5">
                    ${cashier.chipBalance.toLocaleString('es-AR')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Fichas Cargadas</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    ${cashier.totalChipsDistributed.toLocaleString('es-AR')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Fichas Recuperadas</p>
                  <p className="text-sm font-bold text-[#00e5ff] font-mono mt-0.5">
                    ${cashier.totalChipsRedeemed.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>

              {/* Payment & Contact Info */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 border-t border-slate-800/80 pt-2">
                <div className="flex items-center gap-3 text-[11px]">
                  <span>Alias: <strong className="text-white font-mono">{cashier.aliasCobro}</strong></span>
                  <span>Tel: <strong className="text-white font-mono">{cashier.phone}</strong></span>
                </div>

                {/* Operations & Control Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setFundCashier(cashier);
                      setFundAmount(10000000);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#dfb76c] text-black font-bold text-xs flex items-center gap-1 shadow-sm transition"
                    title="Cargar Fichas Ilimitadas a esta Caja"
                  >
                    <Coins size={14} /> Fondeo Ilimitado
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cashier)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                    title="Editar Sub-Panel"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleToggle(cashier)}
                    className={`p-1.5 rounded-lg border transition ${
                      cashier.status === 'activo'
                        ? 'border-yellow-900/60 text-yellow-400 hover:bg-yellow-950/40'
                        : 'border-emerald-900/60 text-emerald-400 hover:bg-emerald-950/40'
                    }`}
                    title={cashier.status === 'activo' ? 'Suspender Sub-Panel' : 'Activar Sub-Panel'}
                  >
                    <Power size={15} />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(cashier)}
                    className="p-1.5 rounded-lg bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-900/60 transition"
                    title="Eliminar Sub-Panel y Recuperar Fichas"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CREAR NUEVO PANEL DE CAJERO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b1426] border-2 border-[#00e5ff] rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
              <h4 className="font-serif font-bold text-white text-lg flex items-center gap-2">
                <Landmark className="text-[#00e5ff]" size={20} /> Crear Nuevo Sub-Panel de Cajero
              </h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nombre de la Agencia / Caja:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Cajero Quilmes Centro"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Nombre del Operador:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Juan Pérez"
                    value={createForm.operatorName}
                    onChange={(e) => setCreateForm({ ...createForm, operatorName: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Usuario de Acceso:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. cajero_quilmes"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Contraseña del Cajero:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. demo-player-password-change-me"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">DNI Operador:</label>
                  <input
                    type="text"
                    required
                    placeholder="35.441.982"
                    value={createForm.dni}
                    onChange={(e) => setCreateForm({ ...createForm, dni: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Teléfono / WhatsApp:</label>
                  <input
                    type="text"
                    placeholder="+54 9 11 ..."
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Comisión (%):</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={createForm.commissionRate}
                    onChange={(e) => setCreateForm({ ...createForm, commissionRate: Number(e.target.value) })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Alias de Cobro (CBU/CVU/MP):</label>
                  <input
                    type="text"
                    placeholder="CAJERO.QUILMES.FICHAS"
                    value={createForm.aliasCobro}
                    onChange={(e) => setCreateForm({ ...createForm, aliasCobro: e.target.value.toUpperCase() })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white uppercase font-mono outline-none focus:border-[#00e5ff]"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Fondeo Inicial Ilimitado (Fichas):</label>
                  <input
                    type="number"
                    min={0}
                    step={1000000}
                    value={createForm.initialChips}
                    onChange={(e) => setCreateForm({ ...createForm, initialChips: Number(e.target.value) })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-[#ffd700] font-mono font-bold outline-none focus:border-[#00e5ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Notas Administrativas:</label>
                <input
                  type="text"
                  placeholder="Zona sur, sucursal peatonal"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e5ff]"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider mt-2 shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                {isCreating ? 'CREANDO SUB-PANEL...' : 'CONFIRMAR Y CREAR SUB-PANEL OFICIAL'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR PANEL DE CAJERO */}
      {editingCashier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b1426] border-2 border-[#c5a059] rounded-2xl p-6 max-w-md w-full space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
              <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Edit2 className="text-[#ffd700]" size={18} /> Editar Sub-Panel: {editingCashier.name}
              </h4>
              <button onClick={() => setEditingCashier(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Nombre de la Agencia:</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Nombre del Operador:</label>
                <input
                  type="text"
                  required
                  value={editForm.operatorName}
                  onChange={(e) => setEditForm({ ...editForm, operatorName: e.target.value })}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Teléfono:</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Comisión (%):</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={editForm.commissionRate}
                    onChange={(e) => setEditForm({ ...editForm, commissionRate: Number(e.target.value) })}
                    className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Alias de Cobro:</label>
                <input
                  type="text"
                  value={editForm.aliasCobro}
                  onChange={(e) => setEditForm({ ...editForm, aliasCobro: e.target.value.toUpperCase() })}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white uppercase font-mono outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Cambiar Contraseña (opcional):</label>
                <input
                  type="text"
                  placeholder="Dejar vacío para mantener la actual"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Estado del Panel:</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#c5a059]"
                >
                  <option value="activo">Activo (Habilitado para operar)</option>
                  <option value="suspendido">Suspendido (Bloqueado temporalmente)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isEditing}
                className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#dfb76c] text-black font-bold text-xs uppercase tracking-wider shadow-lg transition"
              >
                {isEditing ? 'GUARDANDO CAMBIOS...' : 'GUARDAR MODIFICACIONES'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INYECTAR FICHAS ILIMITADAS A CAJERO */}
      {fundCashier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b1426] border-2 border-[#ffd700] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2c4b] pb-3">
              <h4 className="font-serif font-bold text-white text-base flex items-center gap-2">
                <Coins className="text-[#ffd700]" size={20} /> Inyectar Fichas Ilimitadas
              </h4>
              <button onClick={() => setFundCashier(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleFund} className="space-y-4 text-xs">
              <div className="bg-[#050a14] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <p className="text-slate-400">Sub-Panel: <strong className="text-white">{fundCashier.name}</strong></p>
                <p className="text-slate-400">Operador: <strong className="text-white">{fundCashier.operatorName}</strong> (@{fundCashier.username})</p>
                <p className="text-slate-400">
                  Saldo Actual en Caja:{' '}
                  <strong className="text-[#ffd700] font-mono text-sm">${fundCashier.chipBalance.toLocaleString('es-AR')}</strong>
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-slate-400 block font-semibold text-[11px]">Montos Rápidos:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5000000, 10000000, 50000000, 100000000, 500000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFundAmount(amt)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-semibold transition ${
                        fundAmount === amt
                          ? 'bg-[#ffd700] text-black border-amber-300 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      ${(amt / 1000000).toLocaleString('es-AR')}M
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Monto Exacto a Inyectar (ARS):</label>
                <input
                  type="number"
                  min={100000}
                  step={500000}
                  required
                  value={fundAmount}
                  onChange={(e) => setFundAmount(Number(e.target.value))}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-4 py-2.5 text-[#ffd700] font-mono font-bold text-base outline-none focus:border-[#ffd700]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Nota o Justificación:</label>
                <input
                  type="text"
                  value={fundNotes}
                  onChange={(e) => setFundNotes(e.target.value)}
                  className="w-full bg-[#050a14] border border-[#1f3152] rounded-xl px-3 py-2 text-white outline-none focus:border-[#ffd700]"
                />
              </div>

              <button
                type="submit"
                disabled={isFunding}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ffd700] to-amber-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2"
              >
                <Coins size={16} />
                {isFunding ? 'INYECTANDO FICHAS...' : `CONFIRMAR INYECCIÓN DE $${fundAmount.toLocaleString('es-AR')} FICHAS`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMAR ELIMINACIÓN DE SUB-PANEL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b1426] border-2 border-red-600 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 border-b border-red-900/50 pb-3">
              <AlertTriangle size={24} />
              <h4 className="font-serif font-bold text-white text-base">
                ¿Dar de Baja Sub-Panel de Cajero?
              </h4>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Estás a punto de eliminar el sub-panel <strong className="text-white">"{deleteTarget.name}"</strong> (Operador: {deleteTarget.operatorName}).
              </p>
              <div className="bg-emerald-950/40 border border-emerald-800 p-3 rounded-xl text-emerald-300">
                <strong>✓ Recupero Automático a Bóveda Central:</strong>
                <p className="mt-1">
                  Las <span className="font-mono font-bold text-white">${deleteTarget.chipBalance.toLocaleString('es-AR')}</span> fichas remanentes en la caja volverán inmediatamente al saldo de la Bóveda Central Super Admin.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
              >
                <Trash2 size={14} />
                {isDeleting ? 'ELIMINANDO...' : 'SÍ, ELIMINAR Y RECUPERAR FICHAS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
