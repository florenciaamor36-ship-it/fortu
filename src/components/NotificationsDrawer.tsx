import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Bell, Trophy, ShieldCheck, Coins, Sparkles, CheckCheck } from 'lucide-react';

export const NotificationsDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationsAsRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'JACKPOT':
        return <Trophy className="w-4 h-4 text-[#dfb76c]" />;
      case 'TRANSACCION':
        return <Coins className="w-4 h-4 text-emerald-400" />;
      case 'SEGURIDAD':
        return <ShieldCheck className="w-4 h-4 text-[#70a9d4]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#c5a059]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md h-full bg-[#081020] border-l-2 border-[#1c2d4e] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-[#0b162c] border-b border-[#1d2d4c] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#dfb76c]" />
            <h3 className="font-cinzel font-bold text-sm text-slate-100">
              Notificaciones en Tiempo Real
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markNotificationsAsRead}
              className="text-[11px] text-[#dfb76c] hover:underline flex items-center gap-1"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Leídas</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of notifications */}
        <div className="p-4 overflow-y-auto flex-grow space-y-2.5">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                  n.read
                    ? 'bg-[#0a1224] border-[#182642] text-slate-400'
                    : 'bg-[#0e1a33] border-[#c5a059]/40 text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-100">
                    {getIcon(n.type)}
                    <span>{n.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>

                {n.highlightAmount && (
                  <div className="text-[10px] font-mono font-bold text-[#dfb76c] pt-0.5">
                    Pozo: ${n.highlightAmount.toLocaleString('es-AR')} Fichas
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No hay notificaciones recientes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
