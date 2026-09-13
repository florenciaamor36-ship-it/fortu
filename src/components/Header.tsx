import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Lock,
  Wallet,
  Sparkles,
  Landmark,
} from 'lucide-react';

interface HeaderProps {
  onOpenCashier: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenAdmin: () => void;
  onOpenCashierOperator?: () => void;
  onOpenNotifications: () => void;
  currentSection?: string;
  onSelectSection?: (section: string) => void;
  currentCategory?: string;
  onSelectCategory?: (category: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCashier,
  onOpenAuth,
  onOpenAdmin,
  onOpenCashierOperator,
  onOpenNotifications,
  currentSection,
  onSelectSection,
  currentCategory,
  onSelectCategory,
}) => {
  const activeSection = currentCategory || currentSection || 'todos';

  const handleSelect = (sectionId: string) => {
    if (typeof onSelectCategory === 'function') {
      onSelectCategory(sectionId);
    }
    if (typeof onSelectSection === 'function') {
      onSelectSection(sectionId);
    }
  };

  const {
    user,
    logout,
    soundEnabled,
    toggleSound,
    quickSwitchUser,
    unreadNotifsCount,
    isAdmin,
  } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070d1a]/95 backdrop-blur-md border-b border-[#1c2842]">
      {/* Top micro-bar: Security, E2EE, Argentine Regulatory & Demo switcher */}
      <div className="bg-[#050811] text-[11px] text-slate-400 py-1.5 px-4 border-b border-[#141d30]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#c5a059] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
              Demo: transporte seguro depende del despliegue
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">
              Operación con Sistema de Fichas Oficial • Argentina 2025
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] bg-[#0d233a] text-[#70a9d4] border border-[#1e4268]">
              +18 Juego Responsable
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Quick Demo Persona Switcher */}
            <div className="relative">
              <button
                id="demo-switcher-btn"
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-[#0e1728] border border-[#23334e] text-slate-300 hover:text-[#dfb76c] hover:border-[#c5a059] transition-colors"
                title="Cambiar entre perfiles de demostración"
              >
                <Sparkles className="w-3 h-3 text-[#c5a059]" />
                <span>Perfil de Prueba:</span>
                <span className="font-semibold text-[#f5e4be]">
                  {user?.role === 'admin' ? 'Admin / Cajero' : user ? user.username : 'Invitado'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isDemoMenuOpen && (
                <div
                  id="demo-switcher-dropdown"
                  className="absolute right-0 mt-1.5 w-64 bg-[#0a1222] border border-[#243555] rounded-lg shadow-2xl p-2 z-50 text-xs"
                >
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Seleccionar Perfil Activo
                  </div>
                  <button
                    onClick={() => {
                      quickSwitchUser('demo-player');
                      setIsDemoMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between ${
                      user?.username === 'demo-player'
                        ? 'bg-[#15233c] text-[#f5e4be] border border-[#c5a059]/40'
                        : 'hover:bg-[#121c30] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">Florencia Amor (VIP)</div>
                      <div className="text-[10px] text-slate-400">Jugadora • $500.000 Fichas</div>
                    </div>
                    {user?.username === 'demo-player' && (
                      <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      quickSwitchUser('jugador1');
                      setIsDemoMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between ${
                      user?.username === 'jugador1'
                        ? 'bg-[#15233c] text-[#f5e4be] border border-[#c5a059]/40'
                        : 'hover:bg-[#121c30] text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-100">Facundo Morales</div>
                      <div className="text-[10px] text-slate-400">Jugador • $250.000 Fichas</div>
                    </div>
                    {user?.username === 'jugador1' && (
                      <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                    )}
                  </button>

                  <div className="my-1 border-t border-[#1a2740]"></div>

                  <button
                    onClick={() => {
                      quickSwitchUser('cajero_palermo');
                      setIsDemoMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between ${
                      user?.username === 'cajero_palermo'
                        ? 'bg-[#0a2333] text-cyan-300 border border-cyan-500'
                        : 'hover:bg-[#121c30] text-cyan-400'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <Landmark className="w-3 h-3 text-[#00e5ff]" />
                        Cajero Palermo VIP (Sub-Panel)
                      </div>
                      <div className="text-[10px] text-slate-400">Caja de recarga y cobro de jugadores</div>
                    </div>
                    {user?.username === 'cajero_palermo' && (
                      <span className="w-2 h-2 rounded-full bg-[#00e5ff]"></span>
                    )}
                  </button>

                  <div className="my-1 border-t border-[#1a2740]"></div>

                  <button
                    onClick={() => {
                      quickSwitchUser('admin');
                      setIsDemoMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md transition-colors flex items-center justify-between ${
                      user?.role === 'admin'
                        ? 'bg-[#2a2215] text-[#f5e4be] border border-[#c5a059]'
                        : 'hover:bg-[#121c30] text-[#dfb76c]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-[#c5a059]" />
                        Operador / Admin Central
                      </div>
                      <div className="text-[10px] text-slate-400">Control de saldos, jugadas y ledger</div>
                    </div>
                    {user?.role === 'admin' && (
                      <span className="w-2 h-2 rounded-full bg-[#c5a059]"></span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Sound Mute/Unmute */}
            <button
              id="sound-toggle-btn"
              onClick={toggleSound}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              title={soundEnabled ? 'Silenciar sonidos del casino' : 'Activar sonidos'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#c5a059]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => handleSelect('todos')}
          className="cursor-pointer flex items-center gap-3 select-none group"
        >
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#1b2a48] to-[#0a1222] border border-[#c5a059]/60 flex items-center justify-center shadow-lg group-hover:border-[#c5a059] transition-all">
            <span className="text-[#dfb76c] font-cinzel font-black text-xl tracking-tight">
              LC
            </span>
            {/* Subtle blue & white ribbon corner */}
            <div className="absolute -top-1 -right-1 w-3 h-3 overflow-hidden">
              <div className="bg-[#70a9d4] w-4 h-1 transform rotate-45 translate-x-1"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-lg md:text-xl font-bold tracking-wider text-slate-100 group-hover:text-white transition-colors">
                LA CLAVE
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold tracking-wider rounded bg-[#10203a] border border-[#1e3b63] text-[#70a9d4]">
                ARGENTINA
              </span>
            </div>
            <div className="text-[10px] tracking-widest text-[#c5a059] uppercase font-semibold font-cinzel">
              Casinos & Apuestas Online
            </div>
          </div>
        </div>

        {/* Central Balance / Cashier Pill (High Contrast for Real Gaming Experience) */}
        {user ? (
          <div className="flex items-center gap-2.5">
            {/* Chip Wallet Display */}
            <div
              onClick={onOpenCashier}
              id="wallet-pill"
              className="cursor-pointer bg-[#0c1527] hover:bg-[#111e38] border border-[#263756] hover:border-[#c5a059]/60 rounded-lg px-3 py-1.5 transition-all flex items-center gap-3 shadow-inner"
              title="Haz clic para ver el Cajero Virtual y solicitar fichas"
            >
              <div className="w-7 h-7 rounded-full bg-[#1b2b4a] border border-[#c5a059]/40 flex items-center justify-center text-[#dfb76c]">
                <Coins className="w-4 h-4 text-[#dfb76c]" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-medium leading-none">
                  Fichas Disponibles
                </div>
                <div className="text-sm md:text-base font-bold text-[#fae5b8] font-mono leading-tight">
                  ${user.chipBalance.toLocaleString('es-AR')}{' '}
                  <span className="text-[10px] text-[#c5a059] font-sans font-semibold">ARS</span>
                </div>
              </div>
            </div>

            {/* Virtual Cashier CTA button */}
            <button
              id="cashier-btn"
              onClick={onOpenCashier}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gold-gradient-btn font-semibold text-xs transition-transform active:scale-95 shadow-md"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Cajero Virtual</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#0f192c] hover:bg-[#162440] border border-[#223354] rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-3.5 py-2 text-xs font-semibold gold-gradient-btn rounded-lg transition-transform active:scale-95"
            >
              Registrarse (+50.000 Fichas)
            </button>
          </div>
        )}

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {/* Admin Panel Direct Access Button */}
          {isAdmin && (
            <button
              id="header-admin-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b1f0e] hover:bg-[#3d2c14] border border-[#c5a059] text-[#fae5b8] text-xs font-semibold transition-all shadow-md"
            >
              <Lock className="w-3.5 h-3.5 text-[#dfb76c]" />
              <span className="hidden md:inline">Panel Admin & Bóveda</span>
              <span className="md:hidden">Admin</span>
            </button>
          )}

          {/* Cashier Sub-Panel Direct Access Button (for Cajeros and Admins) */}
          {(user?.role === 'cajero' || isAdmin) && onOpenCashierOperator && (
            <button
              id="header-cashier-operator-btn"
              onClick={onOpenCashierOperator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#072433] hover:bg-[#0c3145] border border-[#00e5ff]/60 text-cyan-300 text-xs font-semibold transition-all shadow-md"
            >
              <Landmark className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span className="hidden md:inline">Sub-Panel Cajero</span>
              <span className="md:hidden">Cajero</span>
            </button>
          )}

          {/* Real-time Notifications Bell */}
          <button
            id="notifications-bell-btn"
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-300 hover:text-white bg-[#0e1728] hover:bg-[#16233d] border border-[#20314f] rounded-lg transition-colors"
            title="Notificaciones en tiempo real"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          {user && (
            <div className="relative">
              <button
                id="user-profile-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-[#0e1728] hover:bg-[#15233c] border border-[#223352] text-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-[#192742] border border-[#c5a059]/30 flex items-center justify-center text-[#dfb76c] font-bold text-xs">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">
                  {user.fullName || user.username}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-60 bg-[#0b1324] border border-[#263756] rounded-xl shadow-2xl p-2 z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-[#1b2942] mb-1">
                    <div className="font-semibold text-slate-100">{user.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">@{user.username}</div>
                    <div className="text-[10px] text-[#c5a059] mt-0.5">DNI: {user.dni}</div>
                    <div className="text-[10px] text-slate-400">Rol: {user.role === 'admin' ? 'Administrador' : 'Jugador VIP'}</div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenCashier();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#15223c] text-slate-200 flex items-center gap-2 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-[#c5a059]" />
                    <span>Cajero & Movimientos</span>
                  </button>

                  {(user.role === 'cajero' || isAdmin) && onOpenCashierOperator && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenCashierOperator();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#15223c] text-cyan-300 flex items-center gap-2 transition-colors font-medium"
                    >
                      <Landmark className="w-4 h-4 text-[#00e5ff]" />
                      <span>Sub-Panel de Cajero</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#15223c] text-[#dfb76c] flex items-center gap-2 transition-colors font-medium"
                    >
                      <Lock className="w-4 h-4 text-[#c5a059]" />
                      <span>Panel Administrativo</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-[#1b2942]"></div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-950/40 text-red-300 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Navigation Bar (Scalable for many categories & games) */}
      <nav className="bg-[#091121] border-t border-[#15223b] px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1 md:gap-2 py-2">
          {[
            { id: 'todos', label: 'Todos los Juegos' },
            { id: 'destacados', label: 'Juego Destacado' },
            { id: 'slots', label: 'Tragamonedas (Slots)' },
            { id: 'ruleta', label: 'Ruletas' },
            { id: 'bingo', label: 'Bingos' },
            { id: 'apuestas', label: 'Apuestas Deportivas' },
          ].map((cat) => {
            const isActive = activeSection === cat.id;
            return (
              <button
                key={cat.id}
                id={`nav-cat-${cat.id}`}
                onClick={() => handleSelect(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#152442] text-[#f5e4be] border border-[#c5a059]/60 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0e192e]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
