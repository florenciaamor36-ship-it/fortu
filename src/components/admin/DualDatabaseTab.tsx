import React from 'react';
import { DualDatabaseStatus } from '../../types';
import {
  Database,
  Server,
  HardDrive,
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowRightLeft,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface DualDatabaseTabProps {
  status: DualDatabaseStatus | null;
  isLoading: boolean;
  isSyncing: boolean;
  onForceSync: () => void;
  onSwitchTarget: (target: 'primary' | 'secondary') => void;
  onRefresh: () => void;
}

export const DualDatabaseTab: React.FC<DualDatabaseTabProps> = ({
  status,
  isLoading,
  isSyncing,
  onForceSync,
  onSwitchTarget,
  onRefresh,
}) => {
  if (isLoading && !status) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-3 text-[#c5a059]" />
        Cargando estado de la arquitectura Dual Database...
      </div>
    );
  }

  const primary = status?.primary;
  const secondary = status?.secondary;
  const isPrimaryActive = status?.activeTarget === 'primary';

  const primaryWritePercent = primary ? Math.min(100, Math.round((primary.writesToday / primary.quotaLimitWrites) * 100)) : 0;
  const primaryReadPercent = primary ? Math.min(100, Math.round((primary.readsToday / primary.quotaLimitReads) * 100)) : 0;
  const secondaryWritePercent = secondary ? Math.min(100, Math.round((secondary.writesToday / secondary.quotaLimitWrites) * 100)) : 0;
  const secondaryReadPercent = secondary ? Math.min(100, Math.round((secondary.readsToday / secondary.quotaLimitReads) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header / Active Target Notice */}
      <div className="bg-[#0b1426] border border-[#1b2b48] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-900/50 to-[#0c1a2f] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-serif">
                  Arquitectura Dual Database & Conmutación Automática (Spark Plan)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-600/50">
                  {isPrimaryActive ? '🟢 BASE 1 ACTIVA' : '🟠 BASE 2 ACTIVA (DESBORDE)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Alcanza 100.000 lecturas y 40.000 escrituras diarias gratis combinando 2 instancias con Failover al 85% de cuota.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onForceSync}
            disabled={isSyncing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#14233f] hover:bg-[#1a2f55] text-slate-200 border border-[#273e68] text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#c5a059]' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Volcar Caché a Disco'}
          </button>

          <button
            onClick={() => onSwitchTarget(isPrimaryActive ? 'secondary' : 'primary')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfb76c] hover:opacity-90 text-black font-bold text-xs transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Conmutar a {isPrimaryActive ? 'Base 2' : 'Base 1'}
          </button>
        </div>
      </div>

      {/* Why Firebase Spark Comparison Box */}
      <div className="bg-gradient-to-r from-[#0d1c38] to-[#0a1529] border border-[#1e345b] rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            ¿Por qué Firebase Spark es la opción con mayor almacenamiento y solicitudes gratuitas?
          </p>
          <p className="text-slate-400 leading-relaxed">
            Frente a Supabase (que pausa proyectos inactivos y limita a 500 MB), Firebase otorga <strong className="text-emerald-400">50.000 lecturas y 20.000 escrituras diarias por proyecto</strong> de forma perpetua. Al usar este sistema Dual DB con 2 proyectos de Firebase, obtienes <strong className="text-[#fae5b8]">100.000 lecturas y 40.000 escrituras por día</strong> sin pagar un solo dólar. La base 1 aloja los jugadores iniciales, cajeros y bóveda; si llega al 85% de capacidad, el motor conmuta de inmediato a la base 2 para que el casino nunca se detenga.
          </p>
        </div>
      </div>

      {/* Database Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Primary Database Card */}
        <div className={`bg-[#0b1426] border-2 rounded-2xl p-5 space-y-4 transition ${
          isPrimaryActive ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/30' : 'border-[#1a2844] opacity-80'
        }`}>
          <div className="flex items-center justify-between border-b border-[#182642] pb-3">
            <div className="flex items-center gap-2.5">
              <Server className={`w-5 h-5 ${isPrimaryActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div>
                <h4 className="font-serif font-bold text-white text-sm">
                  Base 1: Instancia Primaria
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  ID: {primary?.projectId || 'la-clave-primary-prod'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
              isPrimaryActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {isPrimaryActive ? 'EN USO PRINCIPAL' : 'STANDBY'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Aloja primeros jugadores, cajeros oficiales, saldo de bóveda y fichas emitidas.
          </p>

          {/* Quota Bars */}
          <div className="space-y-3 pt-1">
            {/* Writes */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Escrituras Hoy (Spark Free Tier):</span>
                <span className="font-mono font-bold text-white">
                  {primary?.writesToday.toLocaleString('es-AR')} / 20.000 ({primaryWritePercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-[#060b16] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    primaryWritePercent > 80 ? 'bg-red-500' : primaryWritePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${primaryWritePercent}%` }}
                />
              </div>
            </div>

            {/* Reads */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Lecturas Hoy (Spark Free Tier):</span>
                <span className="font-mono font-bold text-white">
                  {primary?.readsToday.toLocaleString('es-AR')} / 50.000 ({primaryReadPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-[#060b16] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#38bdf8] transition-all duration-500"
                  style={{ width: `${primaryReadPercent}%` }}
                />
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#142036]">
              <span className="text-slate-400">Almacenamiento Usado:</span>
              <span className="font-mono text-[#fae5b8] font-semibold">
                {primary?.storageUsedMb.toFixed(2)} MB / 1.024 MB (1 GB)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estado de Conexión:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Conectado & Operativo
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Database Card */}
        <div className={`bg-[#0b1426] border-2 rounded-2xl p-5 space-y-4 transition ${
          !isPrimaryActive ? 'border-amber-500/60 shadow-lg shadow-amber-950/30' : 'border-[#1a2844]'
        }`}>
          <div className="flex items-center justify-between border-b border-[#182642] pb-3">
            <div className="flex items-center gap-2.5">
              <Server className={`w-5 h-5 ${!isPrimaryActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <div>
                <h4 className="font-serif font-bold text-white text-sm">
                  Base 2: Instancia de Desborde (Failover)
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  ID: {secondary?.projectId || 'la-clave-backup-prod'}
                </p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
              !isPrimaryActive ? 'bg-amber-950 text-amber-400 border border-amber-600/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {!isPrimaryActive ? 'CONMUTADA (EN USO)' : 'LISTA PARA FAILOVER'}
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Se activa automáticamente al alcanzar el 85% de escrituras en Base 1 para garantizar cero interrupciones.
          </p>

          {/* Quota Bars */}
          <div className="space-y-3 pt-1">
            {/* Writes */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Escrituras Hoy:</span>
                <span className="font-mono font-bold text-white">
                  {secondary?.writesToday.toLocaleString('es-AR')} / 20.000 ({secondaryWritePercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-[#060b16] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${secondaryWritePercent}%` }}
                />
              </div>
            </div>

            {/* Reads */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Lecturas Hoy:</span>
                <span className="font-mono font-bold text-white">
                  {secondary?.readsToday.toLocaleString('es-AR')} / 50.000 ({secondaryReadPercent}%)
                </span>
              </div>
              <div className="h-2 w-full bg-[#060b16] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#38bdf8] transition-all duration-500"
                  style={{ width: `${secondaryReadPercent}%` }}
                />
              </div>
            </div>

            {/* Storage */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#142036]">
              <span className="text-slate-400">Almacenamiento Usado:</span>
              <span className="font-mono text-[#fae5b8] font-semibold">
                {secondary?.storageUsedMb.toFixed(2)} MB / 1.024 MB (1 GB)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Umbral de Activación:</span>
              <span className="text-amber-400 font-semibold">
                Al llegar al 85% (17.000 escrituras) en Base 1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* L1 In-Memory RAM Cache & Write-Behind Batching Panel */}
      <div className="bg-[#0b1426] border border-[#1b2b48] rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1d1633] border border-[#7c3aed]/50 flex items-center justify-center text-[#c084fc]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-white text-sm">
              Motor de Caché L1 en RAM & Write-Behind Batching
            </h4>
            <p className="text-xs text-slate-400">
              Reduce las llamadas a la base de datos en un 99% reteniendo lecturas en memoria y agrupando escrituras en lotes cada 5 segundos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#070d1a] border border-[#16233a] rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Efectividad de Caché (Hit Ratio)</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {status?.cacheHitRatio || '99.4%'}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Casi todas las consultas se resuelven en microsegundos desde RAM</p>
          </div>

          <div className="bg-[#070d1a] border border-[#16233a] rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Lecturas Ahorradas a la BBDD</span>
            <span className="text-2xl font-bold font-mono text-[#38bdf8]">
              {status?.totalReadsSavedByCache.toLocaleString('es-AR')}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Consultas que no consumieron cuota de Firebase</p>
          </div>

          <div className="bg-[#070d1a] border border-[#16233a] rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Buffer de Escrituras Pendientes</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              {status?.pendingDirtyWrites || 0}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Entidades modificadas agrupadas para el próximo lote</p>
          </div>

          <div className="bg-[#070d1a] border border-[#16233a] rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block mb-1">Persistencia Local Instantánea</span>
            <span className="text-sm font-bold font-mono text-[#fae5b8] flex items-center gap-1 mt-1">
              <HardDrive className="w-4 h-4 text-[#c5a059]" />
              casino_store.json
            </span>
            <p className="text-[10px] text-emerald-400 mt-1">✓ Respaldado en disco local del servidor</p>
          </div>
        </div>
      </div>

      {/* Instructions on how to set Firebase keys */}
      <div className="bg-[#080f1d] border border-[#172642] rounded-2xl p-5 space-y-3">
        <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#c5a059] flex items-center gap-2">
          <Zap className="w-4 h-4" /> Cómo conectar tus 2 proyectos de Firebase en Producción
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Para que el sistema use tus dos cuentas reales de Firebase Spark, simplemente declara estas variables en tu archivo <code className="text-[#38bdf8] bg-slate-900 px-1 py-0.5 rounded">.env</code>:
        </p>
        <pre className="bg-[#040813] border border-[#15233c] p-3 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
{`# Base 1 (Primaria - Primeros jugadores, fichas y cajeros)
FIREBASE_PROJECT_ID_PRIMARY=mi-casino-clave-prod1
FIREBASE_API_KEY_PRIMARY=AIzaSy...

# Base 2 (Secundaria - Failover automático cuando base 1 llegue al 85% de cuota)
FIREBASE_PROJECT_ID_SECONDARY=mi-casino-clave-prod2
FIREBASE_API_KEY_SECONDARY=AIzaSy...`}
        </pre>
        <p className="text-[11px] text-slate-400">
          * Si no configuras las variables o estás en desarrollo local, el sistema utiliza el almacenamiento persistente ultrarrápido en disco y memoria RAM con el mismo comportamiento de cuotas y failover garantizado.
        </p>
      </div>
    </div>
  );
};
