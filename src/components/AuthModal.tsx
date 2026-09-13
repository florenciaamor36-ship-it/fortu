import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, User as UserIcon, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, quickSwitchUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register({
          username,
          fullName,
          dni,
          email,
          phone,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (type: 'demo-player' | 'jugador1' | 'admin') => {
    setIsLoading(true);
    try {
      await quickSwitchUser(type);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de demo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#091122] border-2 border-[#c5a059]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0c162b] border-b border-[#1d2d4c] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#14233f] border border-[#c5a059]/50 flex items-center justify-center text-[#dfb76c] font-cinzel font-black">
              LC
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-base text-slate-100">
                {mode === 'login' ? 'Iniciar Sesión' : 'Registro de Jugador'}
              </h3>
              <p className="text-[11px] text-[#c5a059]">La Clave Argentina Casinos</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="bg-[#060b16] border-b border-[#17253d] p-3 text-xs space-y-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#dfb76c]" />
            Acceso Rápido de Prueba (1 Clic):
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button
              onClick={() => handleQuickDemo('demo-player')}
              className="px-2 py-1.5 rounded-lg bg-[#0e182e] hover:bg-[#15233e] border border-[#233555] text-slate-200 text-center transition-colors"
            >
              <div className="font-bold text-[#f5e4be]">Florencia VIP</div>
              <div className="text-[9px] text-slate-400">$500.000</div>
            </button>
            <button
              onClick={() => handleQuickDemo('jugador1')}
              className="px-2 py-1.5 rounded-lg bg-[#0e182e] hover:bg-[#15233e] border border-[#233555] text-slate-200 text-center transition-colors"
            >
              <div className="font-bold text-slate-200">Facundo M.</div>
              <div className="text-[9px] text-slate-400">$250.000</div>
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-1.5 rounded-lg bg-[#241a0b] hover:bg-[#382811] border border-[#c5a059]/60 text-[#dfb76c] text-center transition-colors"
            >
              <div className="font-bold flex items-center justify-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Admin
              </div>
              <div className="text-[9px] text-slate-400">Control Total</div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="bg-red-950/60 border border-red-800 text-red-300 p-2.5 rounded-lg text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Nombre de Usuario:</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej. demo-player o tu_usuario"
              className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1 font-medium">Contraseña:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="text-slate-300 block mb-1 font-medium">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ej. Florencia Amor"
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">DNI Argentino:</label>
                <input
                  type="text"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="ej. 39.420.891"
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Teléfono / WhatsApp:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 9 11 0000-0000"
                  className="w-full bg-[#070d1a] border border-[#1f3152] focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl gold-gradient-btn font-cinzel font-bold text-xs tracking-wider transition-all shadow-xl hover:scale-101 mt-2"
          >
            {isLoading
              ? 'PROCESANDO...'
              : mode === 'login'
              ? 'ENTRAR AL CASINO'
              : 'REGISTRARSE Y RECIBIR 50.000 FICHAS'}
          </button>

          <div className="text-center pt-2 border-t border-[#17253d]">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="text-slate-400 hover:text-[#dfb76c] transition-colors"
              >
                ¿No tienes cuenta aún?{' '}
                <span className="text-[#dfb76c] font-semibold underline">Regístrate gratis</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-slate-400 hover:text-[#dfb76c] transition-colors"
              >
                ¿Ya tienes cuenta?{' '}
                <span className="text-[#dfb76c] font-semibold underline">Inicia Sesión</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
