import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { CasinoGame, GameCategory } from './types';
import { DEMO_GAMES } from './demoGames';
import { Header } from './components/Header';
import { JackpotTicker } from './components/JackpotTicker';
import { HeroFeatured } from './components/HeroFeatured';
import { GamesGrid } from './components/GamesGrid';
import { SportsbookSection } from './components/SportsbookSection';
import { PlayableSlotModal } from './components/PlayableSlotModal';
import { PlayableRouletteModal } from './components/PlayableRouletteModal';
import { PlayableBingoModal } from './components/PlayableBingoModal';
import { CashierModal } from './components/CashierModal';
import { CashierOperatorModal } from './components/CashierOperatorModal';
import { AdminPanel } from './components/AdminPanel';
import { GameStudioPanel } from './components/GameStudioPanel';
import { AuthModal } from './components/AuthModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import {
  ShieldCheck,
  Award,
  Coins,
  MessageCircle,
  HelpCircle,
  Lock,
  Sparkles,
  Trophy,
  Dices,
  Flame,
  CheckCircle2,
  PhoneCall,
  Landmark,
} from 'lucide-react';

export default function App() {
  const { user, toasts, removeToast } = useAuth();

  // Navigation and category state
  const [currentCategory, setCurrentCategory] = useState<GameCategory>('destacados');
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [featuredGame, setFeaturedGame] = useState<CasinoGame | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState(true);

  // Modal open states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCashierOpen, setIsCashierOpen] = useState(false);
  const [isCashierOperatorOpen, setIsCashierOperatorOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isGameStudioOpen, setIsGameStudioOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Active game modal
  const [activeGame, setActiveGame] = useState<CasinoGame | null>(null);

  // Dedicated Cashier Panel URL detection & state
  const [cashierSlugParam, setCashierSlugParam] = useState<string | null>(null);
  const [publicCashierInfo, setPublicCashierInfo] = useState<any>(null);

  // Detect URL parameter ?cajero=slug or ?panel=slug
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('panel');
    const cashierParam = params.get('cajero');
    const cParam = cashierParam;
    if (adminParam === 'admin' || adminParam === 'assetforge') {
      setIsAdminOpen(true);
    }
    if (adminParam === 'gamecreator') {
      setIsGameStudioOpen(true);
    }
    if (cParam) {
      setCashierSlugParam(cParam);
      setIsCashierOperatorOpen(true);
      api
        .getPublicCashierPanel(cParam)
        .then((res) => {
          if (res && res.panel) {
            setPublicCashierInfo(res.panel);
            // If the logged-in user is this cashier or admin, auto-open sub-panel
            if (
              user &&
              (user.role === 'cashier' ||
                user.role === 'admin' ||
                user.cashierPanelId === res.panel.id ||
                user.username.toLowerCase() === res.panel.username.toLowerCase())
            ) {
              setIsCashierOperatorOpen(true);
            }
          }
        })
        .catch((err) => console.warn('Public cashier panel lookup:', err));
    }
  }, [user]);

  // Fetch games on load
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoadingGames(true);
      try {
        const res = await api.getGames();
        setGames(res.games);
        // Find featured
        const featured = res.games.find((g) => g.featured) || res.games[0];
        setFeaturedGame(featured);
      } catch (err) {
        // GitHub Pages serves the visual demo without the Express API.
        // Keep the lobby useful and honest instead of showing an empty catalog.
        console.warn('API no disponible; usando catálogo local de demostración.', err);
        setGames(DEMO_GAMES);
        setFeaturedGame(DEMO_GAMES.find((g) => g.featured) || DEMO_GAMES[0]);
      } finally {
        setIsLoadingGames(false);
      }
    };
    fetchGames();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handlePlayGame = (game: CasinoGame) => {
    if (game.category === 'apuestas') {
      setCurrentCategory('apuestas');
      window.scrollTo({ top: 600, behavior: 'smooth' });
      return;
    }
    setActiveGame(game);
  };

  const renderActiveGameModal = () => {
    if (!activeGame) return null;

    if (activeGame.category === 'slots' || activeGame.category === 'destacados') {
      return (
        <PlayableSlotModal
          game={activeGame}
          onClose={() => setActiveGame(null)}
          onOpenCashier={() => {
            setActiveGame(null);
            setIsCashierOpen(true);
          }}
        />
      );
    }

    if (activeGame.category === 'ruleta') {
      return (
        <PlayableRouletteModal
          game={activeGame}
          onClose={() => setActiveGame(null)}
          onOpenCashier={() => {
            setActiveGame(null);
            setIsCashierOpen(true);
          }}
        />
      );
    }

    if (activeGame.category === 'bingo') {
      return (
        <PlayableBingoModal
          game={activeGame}
          onClose={() => setActiveGame(null)}
          onOpenCashier={() => {
            setActiveGame(null);
            setIsCashierOpen(true);
          }}
        />
      );
    }

    // Default fallback to slot mechanics for other games
    return (
      <PlayableSlotModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
        onOpenCashier={() => {
          setActiveGame(null);
          setIsCashierOpen(true);
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-[#c5a059]/30 selection:text-[#fae5b8]">
      {/* Dedicated Cashier Agency Top Banner (when accessed via ?cajero=slug) */}
      {publicCashierInfo && (
        <div className="bg-gradient-to-r from-[#002f3a] via-[#091e38] to-[#002f3a] border-b border-[#00e5ff]/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-white shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/50 text-[#00e5ff]">
              <Landmark size={16} />
            </div>
            <div>
              <span className="font-bold text-slate-300">
                Punto de Carga Oficial:{' '}
                <strong className="text-[#00e5ff] text-sm">{publicCashierInfo.name}</strong>
              </span>
              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                <span>Operador: <strong className="text-white">{publicCashierInfo.operatorName}</strong></span>
                <span>WhatsApp: <strong className="text-white font-mono">{publicCashierInfo.phone}</strong></span>
                <span>Alias: <strong className="text-[#ffd700] font-mono">{publicCashierInfo.aliasCobro}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'cashier' || user?.role === 'admin' || user?.cashierPanelId === publicCashierInfo.id ? (
              <button
                onClick={() => setIsCashierOperatorOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-black font-black text-xs uppercase shadow-md hover:brightness-110 transition"
              >
                Abrir Sub-Panel del Cajero
              </button>
            ) : !user ? (
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-cyan-400 text-black font-black text-xs uppercase shadow-md hover:brightness-110 transition"
              >
                Ingresar a este Panel
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* 1. Master Header */}
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenCashier={() => setIsCashierOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenCashierOperator={() => setIsCashierOperatorOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        currentCategory={currentCategory}
        onSelectCategory={setCurrentCategory}
        currentSection={currentCategory}
        onSelectSection={(sec) => setCurrentCategory(sec as any)}
      />

      {/* 2. Real-Time Progressive Jackpot Ticker */}
      <JackpotTicker />

      {/* Main Page Layout Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* 3. Hero Featured Section */}
        {featuredGame && (
          <HeroFeatured
            game={featuredGame}
            onPlay={() => handlePlayGame(featuredGame)}
            onPlayGame={handlePlayGame}
            onOpenCashier={() => setIsCashierOpen(true)}
            onExplore={() => setCurrentCategory('slots')}
          />
        )}

        {/* 4. Quick Category Navigation Bar */}
        <div className="bg-[#091122] border border-[#1b2b4a] rounded-2xl p-2.5 shadow-xl flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'destacados', label: '🔥 Destacados' },
            { id: 'slots', label: '🎰 Tragamonedas' },
            { id: 'ruleta', label: '🎡 Ruletas VIP' },
            { id: 'bingo', label: '🎱 Salones de Bingo' },
            { id: 'apuestas', label: '⚽ SportBook Argentina' },
            { id: 'todos', label: '💎 Todos los Juegos' },
          ].map((tab) => {
            const isActive = currentCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentCategory(tab.id as GameCategory)}
                className={`px-4 py-2.5 rounded-xl font-cinzel font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'gold-gradient-btn text-[#070d1a] shadow-lg scale-102'
                    : 'bg-[#0f1b32] text-slate-300 hover:bg-[#162747] hover:text-white border border-[#203254]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 5. Main Content Area: Sportsbook OR Games Grid */}
        {currentCategory === 'apuestas' ? (
          <SportsbookSection onOpenCashier={() => setIsCashierOpen(true)} />
        ) : (
          <GamesGrid
            games={games}
            currentCategory={currentCategory}
            onSelectCategory={setCurrentCategory}
            onPlayGame={handlePlayGame}
          />
        )}

        {/* 6. Alcance verificable de esta demo */}
        <section className="bg-gradient-to-br from-[#091224] via-[#0d1a33] to-[#091224] border-2 border-[#1c2d4e] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="mb-6 max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#c5a059] font-bold">Estado del producto</span>
            <h3 className="font-cinzel text-xl font-bold text-slate-100 mt-2">Una base visual lista para conectar después</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Esta versión sirve para revisar navegación, catálogo y juegos de demostración. No procesa dinero real ni afirma servicios que todavía no fueron conectados o auditados.
            </p>
          </div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#070e1c]/80 border border-[#1a2b48] rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#12203c] border border-[#c5a059]/50 flex items-center justify-center text-[#dfb76c]"><Coins className="w-5 h-5" /></div>
              <h4 className="font-cinzel font-bold text-sm text-slate-100">Catálogo y fichas demo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Juegos de muestra, saldo virtual y navegación por categorías. Las operaciones de caja están deshabilitadas.</p>
            </div>
            <div className="bg-[#070e1c]/80 border border-[#1a2b48] rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#12203c] border border-[#c5a059]/50 flex items-center justify-center text-[#dfb76c]"><ShieldCheck className="w-5 h-5" /></div>
              <h4 className="font-cinzel font-bold text-sm text-slate-100">Conexiones pendientes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">El backend autoritativo, la persistencia, el RNG de servidor y las auditorías todavía deben implementarse y verificarse.</p>
            </div>
            <div className="bg-[#070e1c]/80 border border-[#1a2b48] rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#12203c] border border-[#c5a059]/50 flex items-center justify-center text-[#dfb76c]"><Award className="w-5 h-5" /></div>
              <h4 className="font-cinzel font-bold text-sm text-slate-100">Juego responsable</h4>
              <p className="text-xs text-slate-400 leading-relaxed">La interfaz incluye avisos de demo y juego responsable. No debe usarse para apuestas ni premios reales.</p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="bg-[#050912] border-t border-[#15233c] text-xs text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-cinzel font-black text-slate-100 text-base">
                <div className="w-7 h-7 rounded-lg bg-[#14233f] border border-[#c5a059] flex items-center justify-center text-[#dfb76c] text-xs">
                  LC
                </div>
                <span>LA CLAVE ARGENTINA</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Demo visual de entretenimiento con fichas virtuales. No procesa pagos, retiros ni premios reales.
              </p>
              <div className="text-[10px] text-[#c5a059] font-mono">
                Demo • backend y auditoría pendientes
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2.5">
              <div className="font-cinzel font-bold text-slate-200 text-xs uppercase tracking-wider">
                Secciones
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button
                    onClick={() => setCurrentCategory('slots')}
                    className="hover:text-[#dfb76c] transition-colors"
                  >
                    Máquinas Tragamonedas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentCategory('ruleta')}
                    className="hover:text-[#dfb76c] transition-colors"
                  >
                    Ruletas Europeas & En Vivo
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentCategory('bingo')}
                    className="hover:text-[#dfb76c] transition-colors"
                  >
                    Salones de Bingo Criollo
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentCategory('apuestas')}
                    className="hover:text-[#dfb76c] transition-colors"
                  >
                    SportBook Liga Profesional
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsCashierOpen(true)}
                    className="hover:text-[#dfb76c] transition-colors"
                  >
                    Cajero Virtual Oficial
                  </button>
                </li>
              </ul>
            </div>

            {/* Estado técnico verificable */}
            <div className="space-y-2.5">
              <div className="font-cinzel font-bold text-slate-200 text-xs uppercase tracking-wider">
                Estado técnico
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo visual, no producción</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Backend y pagos no conectados</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>RNG demo no auditado</span>
                </li>
                <li>
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="text-[#dfb76c] underline hover:text-[#fae5b8]"
                  >
                    Abrir panel administrativo
                  </button>
                </li>
              </ul>
            </div>

            {/* Responsible Gambling */}
            <div className="space-y-2.5">
              <div className="font-cinzel font-bold text-slate-200 text-xs uppercase tracking-wider">
                Juego Responsable
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-red-950 border border-red-800 text-red-300 font-bold flex items-center justify-center text-xs">
                  +18
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Solo mayores de 18 años. Jugar compulsivamente es perjudicial para la salud.
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Línea gratuita de orientación al jugador problemático: 0800-444-4000 (República
                Argentina).
              </p>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 border-t border-[#111c30] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
            <div>
              © 2026 La Clave Argentina casinos. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Términos y Condiciones</span>
              <span>•</span>
              <span>Política de Privacidad</span>
              <span>•</span>
              <span>Reglamento de Fichas</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 8. Active Game Modals (Slot / Roulette / Bingo) */}
      {renderActiveGameModal()}

      {/* 9. Cashier Modal */}
      <CashierModal isOpen={isCashierOpen} onClose={() => setIsCashierOpen(false)} />

      {/* 9.1 Cashier Operator Sub-Panel Modal */}
      <CashierOperatorModal
        isOpen={isCashierOperatorOpen}
        onClose={() => setIsCashierOperatorOpen(false)}
      />

      {/* 10. Admin Panel */}
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}

      {/* 10.1 Independent Game Studio Panel */}
      {isGameStudioOpen && <GameStudioPanel onClose={() => setIsGameStudioOpen(false)} />}

      {/* 11. Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* 12. Real-time Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* 13. Floating Live Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl transition-all cursor-pointer flex items-start gap-3 ${
              toast.type === 'jackpot'
                ? 'bg-[#1a1408] border-[#c5a059] text-[#fae5b8]'
                : toast.type === 'error'
                ? 'bg-[#220d11] border-red-800 text-red-200'
                : toast.type === 'success'
                ? 'bg-[#0d1f14] border-emerald-700 text-emerald-200'
                : 'bg-[#091224] border-[#1d2d4c] text-slate-200'
            }`}
          >
            {toast.type === 'jackpot' ? (
              <Trophy className="w-5 h-5 text-[#dfb76c] shrink-0 mt-0.5 animate-bounce" />
            ) : toast.type === 'error' ? (
              <HelpCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 flex-grow">
              <div className="text-xs font-bold font-cinzel">{toast.title}</div>
              <div className="text-[11px] opacity-90 leading-tight">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
