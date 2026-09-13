import { User, CasinoGame, Transaction, GameRoundHistory, NotificationItem, ChipRequest, SportsEvent, CashierPanel, CreateGameRequest, DualDatabaseStatus } from '../src/types.js';
import { sha256, generateLedgerHash, generateGameSignature } from './crypto.js';
import { dualDbManager } from './dualDatabase.js';

interface DatabaseState {
  users: User[];
  cashierPanels: CashierPanel[];
  games: CasinoGame[];
  transactions: Transaction[];
  gameHistory: GameRoundHistory[];
  notifications: NotificationItem[];
  chipRequests: ChipRequest[];
  sportsEvents: SportsEvent[];
  lastLedgerHash: string;
}

const SERVER_SEED = 'server_provably_fair_salt_la_clave_arg_2025';

// Pre-seeded games with Argentine high-roller casino theme and multi-skin support
const INITIAL_GAMES: CasinoGame[] = [
  {
    id: 'gaucho-de-oro',
    title: 'El Gaucho de Oro',
    subtitle: 'Megaways™ Exclusivo Argentino',
    category: 'slots',
    provider: 'La Clave Studios',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    banner: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1200&q=80',
    tag: 'HOT',
    jackpotAmount: 18450000,
    rtp: 96.85,
    minBet: 500,
    maxBet: 50000,
    volatility: 'Alta',
    lines: 20,
    skinId: 'slot-gaucho-de-oro',
    description: 'La tragamoneda insignia de La Clave. Adéntrate en la pampa con giros gratis, multiplicadores progresivos ilimitados y el bono Boleadoras de Oro.',
    features: ['Cascadas Megaways', 'Multiplicador Progresivo', 'Compra de Bono', 'Jackpot Progresivo'],
  },
  {
    id: 'slot-faraon',
    title: 'El Faraón del Nilo',
    subtitle: 'Tesoros de las Pirámides Antiguas',
    category: 'slots',
    provider: 'Ancient Dynasty Gaming',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    tag: 'POPULAR',
    jackpotAmount: 24800000,
    rtp: 96.7,
    minBet: 500,
    maxBet: 50000,
    volatility: 'Alta',
    lines: 20,
    skinId: 'slot-faraon',
    description: 'Explora las cámaras secretas del Faraón con Wilds expansivos de escarabajos dorados, scatters de pirámides y giros libres mágicos.',
    features: ['Wild Escarabajo', 'Scatter Pirámide', 'Jackpot Ojo de Horus', '20 Líneas Fijas'],
  },
  {
    id: 'slot-cleopatra',
    title: 'Cleopatra Reina del Nilo',
    subtitle: 'Lujo Real y Premios Triplicados',
    category: 'slots',
    provider: 'Royal Jewels Slots',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    tag: 'NUEVO',
    jackpotAmount: 31200000,
    rtp: 97.2,
    minBet: 1000,
    maxBet: 100000,
    volatility: 'Media',
    lines: 20,
    skinId: 'slot-cleopatra',
    description: 'La gran reina de Egipto te recibe en su templo dorado. Cada combinación con Cleopatra duplica tus ganancias.',
    features: ['Wild x2 Multiplicador', '15 Giros Libres x3', 'Bono Esfinge Real'],
  },
  {
    id: 'slot-duendes',
    title: 'Duendes de la Fortuna',
    subtitle: 'La Olla de Oro y Tréboles Mágicos',
    category: 'slots',
    provider: 'Emerald Luck Interactive',
    thumbnail: 'https://images.unsplash.com/photo-1511192836568-d9229f3d9d71?auto=format&fit=crop&w=600&q=80',
    tag: 'HOT',
    jackpotAmount: 19500000,
    rtp: 96.9,
    minBet: 200,
    maxBet: 30000,
    volatility: 'Media',
    lines: 20,
    skinId: 'slot-duendes',
    description: 'Sigue el arcoíris hasta la olla de oro custodiada por los duendes traviesos. Respins dorados y tréboles de cuatro hojas.',
    features: ['Wild Duende Expansivo', 'Bono Olla de Oro', 'Scatter Arcoíris'],
  },
  {
    id: 'sol-de-mayo-777',
    title: 'Sol de Mayo Jackpot 777',
    subtitle: 'Triple Respin Imperial',
    category: 'slots',
    provider: 'Pragmatic Gaming',
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=600&q=80',
    tag: 'JACKPOT',
    jackpotAmount: 34200000,
    rtp: 97.1,
    minBet: 1000,
    maxBet: 100000,
    volatility: 'Muy Alta',
    lines: 20,
    skinId: 'slot-sol-de-mayo',
    description: 'El clásico símbolo patrio argentino transformado en un festival de campanas doradas, diamantes y el pozo acumulado Sol de Mayo.',
    features: ['Hold & Win', '3 Jackpots Fijos + 1 Progresivo', 'Wilds Expansivos'],
  },
  // ROULETTE GAMES
  {
    id: 'ruleta-relampago-criolla',
    title: 'Ruleta Relámpago Criolla',
    subtitle: 'Multiplicadores hasta 500x En Vivo',
    category: 'ruleta',
    provider: 'Evolution Gaming',
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=600&q=80',
    tag: 'HOT',
    rtp: 97.3,
    minBet: 500,
    maxBet: 250000,
    volatility: 'Alta',
    skinId: 'ruleta-relampago',
    description: 'La ruleta más emocionante de Argentina. En cada tirada, de 1 a 5 Números de la Suerte son alcanzados por el relámpago pagando de 50x a 500x.',
    features: ['Números Relámpago', 'Croupier en Español', 'Apuestas Especiales'],
  },
  {
    id: 'ruleta-europea-clasica',
    title: 'Ruleta Europea Clásica VIP',
    subtitle: 'Mesa de Paño Azul Marino & Oro',
    category: 'ruleta',
    provider: 'La Clave Studios',
    thumbnail: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=600&q=80',
    tag: 'POPULAR',
    rtp: 97.3,
    minBet: 500,
    maxBet: 500000,
    volatility: 'Media',
    skinId: 'ruleta-portena-vip',
    description: 'Reglas estándar europeas con un solo cero (0). Paño de alta fidelidad, historial de números calientes/fríos y apuestas anunciadas.',
    features: ['Un solo cero (RTP 97.3%)', 'Vecinos del Cero', 'Historial Estadístico'],
  },
  // BINGO GAMES
  {
    id: 'bingo-criollo-75',
    title: 'Gran Bingo Criollo 75 Bolillas',
    subtitle: 'Extracción en Vivo & 4 Cartones',
    category: 'bingo',
    provider: 'Zitro Interactive',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    tag: 'HOT',
    jackpotAmount: 8500000,
    rtp: 96.5,
    minBet: 200,
    maxBet: 10000,
    volatility: 'Media',
    skinId: 'bingo-criollo',
    description: 'El bingo tradicional de los clubes argentinos. Juega con hasta 4 cartones simultáneos, bolillas extra de oro y pozo acumulado federal.',
    features: ['Bolilla Extra Dorada', 'Pozo Acumulado BINGO', 'Marcado Automático Inteligente'],
  },
  {
    id: 'bingo-patagonia',
    title: 'Bingo Glaciar Patagonia',
    subtitle: 'Edición Austral y Pozos de Nieve',
    category: 'bingo',
    provider: 'La Clave Studios',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    tag: 'NUEVO',
    jackpotAmount: 11200000,
    rtp: 96.8,
    minBet: 300,
    maxBet: 15000,
    volatility: 'Alta',
    skinId: 'bingo-patagonia',
    description: 'Siente el frío de los glaciares con bolillas de cristal y multiplicadores de escarcha.',
    features: ['Bolillas de Hielo x5', 'Cartón Doble Suerte', 'Jackpot Glaciar'],
  },
  // SPORTSBOOK
  {
    id: 'apuestas-deportivas-argentina',
    title: 'SportBook Federal Argentino',
    subtitle: 'Fútbol de Primera, Libertadores & NBA',
    category: 'apuestas',
    provider: 'Kambi Argentina Sports',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    tag: 'HOT',
    rtp: 98.2,
    minBet: 500,
    maxBet: 500000,
    volatility: 'Baja',
    description: 'Las mejores cuotas de Argentina para la Liga Profesional, Superclásico Boca-River, Copa Libertadores y eventos internacionales en vivo.',
    features: ['Supercuotas Mejoradas', 'Cashout en Vivo Inmediato', 'Creador de Apuestas'],
  },
];

const INITIAL_SPORTS: SportsEvent[] = [
  {
    id: 'sp-1',
    sport: 'Fútbol',
    league: 'Liga Profesional Argentina - Fecha 14',
    homeTeam: 'Boca Juniors',
    awayTeam: 'River Plate',
    time: 'Hoy 18:00',
    isLive: true,
    score: '1 - 1 (62\')',
    odds: { home: 2.45, draw: 3.10, away: 2.85, over25: 1.95, under25: 1.78 },
  },
  {
    id: 'sp-2',
    sport: 'Fútbol',
    league: 'Liga Profesional Argentina',
    homeTeam: 'Racing Club',
    awayTeam: 'Independiente',
    time: 'Hoy 20:30',
    odds: { home: 2.15, draw: 3.25, away: 3.40, over25: 2.05, under25: 1.70 },
  },
  {
    id: 'sp-3',
    sport: 'Fútbol',
    league: 'Copa Conmebol Libertadores',
    homeTeam: 'San Lorenzo',
    awayTeam: 'Flamengo',
    time: 'Mañana 21:00',
    odds: { home: 3.10, draw: 3.20, away: 2.25, over25: 1.88, under25: 1.82 },
  },
  {
    id: 'sp-4',
    sport: 'Básquetbol',
    league: 'Liga Nacional de Básquet (LNB)',
    homeTeam: 'Quimsa de Santiago',
    awayTeam: 'Instituto de Córdoba',
    time: 'Hoy 21:15',
    isLive: true,
    score: '74 - 71 (Q4)',
    odds: { home: 1.68, draw: 12.0, away: 2.10 },
  },
  {
    id: 'sp-5',
    sport: 'Tenis',
    league: 'ATP Buenos Aires - Semifinal',
    homeTeam: 'Francisco Cerúndolo',
    awayTeam: 'Sebastián Báez',
    time: 'Mañana 16:30',
    odds: { home: 1.85, draw: 25.0, away: 1.95 },
  },
];

class CasinoDatabase {
  private state: DatabaseState;

  constructor() {
    const genesisHash = sha256('GENESIS_BLOCK_LA_CLAVE_ARGENTINA_CASINOS_2025');

    const adminUser: User = {
      id: 'usr-admin-01',
      username: 'admin',
      fullName: 'Operador Principal & Super Admin La Clave',
      dni: '28.940.112',
      email: 'admin@example.invalid',
      phone: '+54 9 11 4055-9000',
      role: 'superadmin',
      chipBalance: 500000000, // 500 Millones iniciales en Bóveda Maestra
      status: 'activo',
      createdAt: '2025-01-15T10:00:00.000Z',
      lastLogin: new Date().toISOString(),
    };

    const cashierUser1: User = {
      id: 'usr-caj-01',
      username: 'cajero_palermo',
      fullName: 'Martín Benítez (Cajero Palermo)',
      dni: '32.114.908',
      email: 'cashier@example.invalid',
      phone: '+54 9 11 6720-3341',
      role: 'cajero',
      chipBalance: 5000000,
      status: 'activo',
      createdAt: '2025-02-01T10:00:00.000Z',
      lastLogin: new Date().toISOString(),
      cashierPanelId: 'caj-01',
    };

    const cashierUser2: User = {
      id: 'usr-caj-02',
      username: 'cajero_cordoba',
      fullName: 'Valeria Gómez (Cajero Córdoba)',
      dni: '34.551.229',
      email: 'cashier2@example.invalid',
      phone: '+54 9 351 440-9921',
      role: 'cajero',
      chipBalance: 3000000,
      status: 'activo',
      createdAt: '2025-02-05T12:00:00.000Z',
      lastLogin: new Date().toISOString(),
      cashierPanelId: 'caj-02',
    };

    const demoPlayer1: User = {
      id: 'usr-player-01',
      username: 'jugador1',
      fullName: 'Facundo Morales',
      dni: '36.812.445',
      email: 'facundo.morales@gmail.com',
      phone: '+54 9 11 5521-8840',
      role: 'jugador',
      chipBalance: 250000,
      status: 'activo',
      createdAt: '2025-02-01T14:30:00.000Z',
      lastLogin: new Date().toISOString(),
    };

    const demoPlayer2: User = {
      id: 'usr-player-02',
      username: 'demo-player',
      fullName: 'Florencia Amor',
      dni: '39.420.891',
      email: 'demo-player@example.invalid',
      phone: '+54 9 11 6301-7712',
      role: 'jugador',
      chipBalance: 500000,
      status: 'activo',
      createdAt: '2025-02-10T18:00:00.000Z',
      lastLogin: new Date().toISOString(),
    };

    const initialCashierPanels: CashierPanel[] = [
      {
        id: 'caj-01',
        name: 'Caja Central Palermo VIP',
        operatorName: 'Martín Benítez',
        username: 'cajero_palermo',
        dni: '32.114.908',
        phone: '+54 9 11 6720-3341',
        aliasCobro: 'LACLAVE.PALERMO.CVU',
        commissionRate: 10,
        chipBalance: 5000000,
        status: 'activo',
        createdAt: '2025-02-01T10:00:00.000Z',
        totalChipsDistributed: 18500000,
        totalChipsRedeemed: 11200000,
        assignedUserId: 'usr-caj-01',
        notes: 'Cajero VIP zona norte de CABA',
      },
      {
        id: 'caj-02',
        name: 'Agencia Córdoba Centro',
        operatorName: 'Valeria Gómez',
        username: 'cajero_cordoba',
        dni: '34.551.229',
        phone: '+54 9 351 440-9921',
        aliasCobro: 'LACLAVE.CORDOBA.FICHAS',
        commissionRate: 12,
        chipBalance: 3000000,
        status: 'activo',
        createdAt: '2025-02-05T12:00:00.000Z',
        totalChipsDistributed: 9400000,
        totalChipsRedeemed: 6100000,
        assignedUserId: 'usr-caj-02',
        notes: 'Sub-panel regional Córdoba y cuyo',
      },
    ];

    const initialTransactions: Transaction[] = [
      {
        id: 'tx-gen-001',
        timestamp: '2025-02-10T18:05:00.000Z',
        userId: 'usr-player-02',
        username: 'demo-player',
        type: 'BONO_BIENVENIDA',
        amount: 250000,
        balanceBefore: 0,
        balanceAfter: 250000,
        gameTitle: 'Bono Exclusivo Apertura',
        hashIntegrity: sha256(`${genesisHash}|tx-gen-001|usr-player-02|250000|250000`),
        status: 'COMPLETADO',
        notes: 'Acreditación de Bono VIP de bienvenida',
      },
      {
        id: 'tx-gen-002',
        timestamp: '2025-02-10T18:15:00.000Z',
        userId: 'usr-player-02',
        username: 'demo-player',
        type: 'CARGA_FICHAS',
        amount: 250000,
        balanceBefore: 250000,
        balanceAfter: 500000,
        hashIntegrity: sha256(`prev|tx-gen-002|usr-player-02|250000|500000`),
        status: 'COMPLETADO',
        notes: 'Carga de fichas mediante Cajero Virtual Oficial',
      },
    ];

    const initialHistory: GameRoundHistory[] = [
      {
        id: 'gr-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        userId: 'usr-player-02',
        username: 'demo-player',
        gameId: 'gaucho-de-oro',
        gameTitle: 'El Gaucho de Oro Megaways™',
        category: 'slots',
        betAmount: 5000,
        payoutAmount: 62500,
        multiplier: 12.5,
        isWin: true,
        resultSummary: 'Cascada de Boleadoras x12.5',
        hashSignature: sha256('gr-001-gaucho-demo-player'),
      },
      {
        id: 'gr-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        userId: 'usr-player-01',
        username: 'jugador1',
        gameId: 'ruleta-relampago-criolla',
        gameTitle: 'Ruleta Relámpago Criolla',
        category: 'ruleta',
        betAmount: 2000,
        payoutAmount: 200000,
        multiplier: 100,
        isWin: true,
        resultSummary: 'Número Relámpago 17 Negro alcanzado por rayo de 100x!',
        hashSignature: sha256('gr-002-ruleta-jugador1'),
      },
    ];

    const initialNotifications: NotificationItem[] = [
      {
        id: 'notif-1',
        timestamp: new Date().toISOString(),
        title: '¡Pozo Progresivo Sol de Mayo superó los $34.000.000!',
        message: 'El jackpot mayor de Argentina está listo para salir. ¡Juega ahora!',
        type: 'JACKPOT',
        highlightAmount: 34200000,
        read: false,
      },
      {
        id: 'notif-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        title: 'Red de Cajeros Oficiales Habilitada',
        message: 'Cargas y retiros inmediatos con tu cajero de confianza las 24 horas.',
        type: 'SISTEMA',
        read: false,
      },
      {
        id: 'notif-3',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        title: 'Seguridad Criptográfica Activa',
        message: 'Todas las jugadas y transacciones están protegidas con hash inalterable SHA-256.',
        type: 'SEGURIDAD',
        read: true,
      },
    ];

    const defaultState: DatabaseState = {
      users: [adminUser, cashierUser1, cashierUser2, demoPlayer1, demoPlayer2],
      cashierPanels: initialCashierPanels,
      games: INITIAL_GAMES,
      transactions: initialTransactions,
      gameHistory: initialHistory,
      notifications: initialNotifications,
      chipRequests: [
        {
          id: 'req-01',
          userId: 'usr-player-01',
          username: 'jugador1',
          amount: 50000,
          requestedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
          status: 'PENDIENTE',
          aliasTransferencia: 'JUGADOR1.CASINO.FICHAS',
          tipo: 'CARGA',
          nota: 'Transferencia bancaria efectuada - Fichas ARS',
        },
      ],
      sportsEvents: INITIAL_SPORTS,
      lastLedgerHash: genesisHash,
    };

    const savedSnapshot = dualDbManager.loadSnapshot();
    if (savedSnapshot && savedSnapshot.users && savedSnapshot.games) {
      this.state = savedSnapshot;
    } else {
      this.state = defaultState;
      dualDbManager.flushSync(this.state);
    }
  }

  // --- USERS & AUTH ---
  public getUsers(): User[] {
    dualDbManager.recordCacheRead(this.state.users.length);
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    dualDbManager.recordCacheRead(1);
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByUsername(username: string): User | undefined {
    dualDbManager.recordCacheRead(1);
    return this.state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public registerUser(userData: {
    username: string;
    fullName: string;
    dni: string;
    email: string;
    phone: string;
  }): { user: User; transaction: Transaction } {
    const existing = this.getUserByUsername(userData.username);
    if (existing) {
      throw new Error('El nombre de usuario ya está registrado.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: userData.username.trim(),
      fullName: userData.fullName.trim(),
      dni: userData.dni.trim(),
      email: userData.email.trim(),
      phone: userData.phone.trim(),
      role: 'jugador',
      chipBalance: 50000, // Bono de cortesía de bienvenida de 50.000 fichas!
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    this.state.users.push(newUser);

    const tx = this.recordTransaction({
      userId: newUser.id,
      username: newUser.username,
      type: 'BONO_BIENVENIDA',
      amount: 50000,
      balanceBefore: 0,
      balanceAfter: 50000,
      notes: 'Bono de bienvenida acreditado automáticamente',
    });

    this.addNotification({
      title: `¡Bienvenido/a ${newUser.fullName}!`,
      message: 'Te acreditamos 50.000 fichas de regalo para comenzar a jugar en La Clave Argentina.',
      type: 'PROMO',
    });

    return { user: newUser, transaction: tx };
  }

  // --- UNLIMITED CHIP MINTING (SUPERADMIN VAULT) ---
  public mintInfiniteChips(amount: number, reason: string = 'Emisión Directa Bóveda Central Super Admin'): {
    adminUser: User;
    transaction: Transaction;
  } {
    if (amount <= 0) {
      throw new Error('El monto de emisión debe ser mayor a 0');
    }

    const admin = this.state.users.find((u) => u.role === 'admin' || u.role === 'superadmin');
    if (!admin) throw new Error('Usuario Super Admin no encontrado');

    const balanceBefore = admin.chipBalance;
    admin.chipBalance += amount;

    const tx = this.recordTransaction({
      userId: admin.id,
      username: admin.username,
      type: 'EMISION_INFINITA_BOVEDA',
      amount,
      balanceBefore,
      balanceAfter: admin.chipBalance,
      notes: `Acuñación ilimitada autorizada por Super Admin: ${reason}`,
    });

    this.addNotification({
      title: '⚡ Emisión Ilimitada de Fichas',
      message: `La Bóveda Central emitió $${amount.toLocaleString('es-AR')} fichas. Nuevo saldo de reserva: $${admin.chipBalance.toLocaleString('es-AR')}`,
      type: 'SEGURIDAD',
      highlightAmount: amount,
    });

    return { adminUser: admin, transaction: tx };
  }

  // --- CASHIER SUB-PANELS MANAGEMENT ---
  public getCashierPanels(): CashierPanel[] {
    return this.state.cashierPanels;
  }

  public getCashierPanelById(id: string): CashierPanel | undefined {
    return this.state.cashierPanels.find((p) => p.id === id);
  }

  public getCashierPanelByUserId(userId: string): CashierPanel | undefined {
    return this.state.cashierPanels.find((p) => p.assignedUserId === userId);
  }

  public createCashierPanel(data: {
    name: string;
    operatorName: string;
    username: string;
    dni: string;
    phone: string;
    aliasCobro: string;
    commissionRate: number;
    initialChips?: number;
    notes?: string;
    password?: string;
  }): { panel: CashierPanel; user: User; transaction?: Transaction } {
    const existing = this.getUserByUsername(data.username);
    if (existing) {
      throw new Error('El nombre de usuario para el cajero ya está en uso');
    }

    const panelId = `caj-${Date.now().toString().slice(-4)}`;
    const userId = `usr-${panelId}`;
    const initialChips = Number(data.initialChips) || 0;
    const slug = data.username.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const plainPassword = data.password?.trim() || 'demo-player-password-change-me';

    const cashierUser: User = {
      id: userId,
      username: data.username.trim(),
      fullName: data.operatorName.trim(),
      dni: data.dni.trim(),
      email: `${data.username.trim().toLowerCase()}@laclaveargentina.com.ar`,
      phone: data.phone.trim(),
      role: 'cajero',
      chipBalance: initialChips,
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      cashierPanelId: panelId,
      plainPassword,
    };

    const panel: CashierPanel = {
      id: panelId,
      name: data.name.trim(),
      operatorName: data.operatorName.trim(),
      username: data.username.trim(),
      dni: data.dni.trim(),
      phone: data.phone.trim(),
      aliasCobro: data.aliasCobro.trim().toUpperCase(),
      commissionRate: Number(data.commissionRate) || 10,
      chipBalance: initialChips,
      status: 'activo',
      createdAt: new Date().toISOString(),
      totalChipsDistributed: 0,
      totalChipsRedeemed: 0,
      assignedUserId: userId,
      slug,
      notes: data.notes,
    };

    this.state.users.push(cashierUser);
    this.state.cashierPanels.push(panel);

    let tx: Transaction | undefined;
    if (initialChips > 0) {
      tx = this.recordTransaction({
        userId,
        username: cashierUser.username,
        type: 'FONDEO_CAJERO',
        amount: initialChips,
        balanceBefore: 0,
        balanceAfter: initialChips,
        notes: `Fondeo inicial de apertura para Sub-Panel ${panel.name}`,
      });
    }

    this.addNotification({
      title: 'Nuevo Sub-Panel de Cajero Creado',
      message: `Se dio de alta el sub-panel "${panel.name}" a cargo de ${panel.operatorName}.`,
      type: 'SISTEMA',
    });

    dualDbManager.markDirty(`cashier_panel_${panelId}`);
    dualDbManager.flushSync(this.state);

    return { panel, user: cashierUser, transaction: tx };
  }

  public editCashierPanel(
    panelId: string,
    data: {
      name?: string;
      operatorName?: string;
      phone?: string;
      aliasCobro?: string;
      commissionRate?: number;
      notes?: string;
      password?: string;
      status?: 'activo' | 'suspendido';
    }
  ): CashierPanel {
    const panel = this.getCashierPanelById(panelId);
    if (!panel) throw new Error('Sub-panel de cajero no encontrado');

    if (data.name !== undefined) panel.name = data.name.trim();
    if (data.operatorName !== undefined) panel.operatorName = data.operatorName.trim();
    if (data.phone !== undefined) panel.phone = data.phone.trim();
    if (data.aliasCobro !== undefined) panel.aliasCobro = data.aliasCobro.trim().toUpperCase();
    if (data.commissionRate !== undefined) panel.commissionRate = Number(data.commissionRate);
    if (data.notes !== undefined) panel.notes = data.notes;
    if (data.status !== undefined) panel.status = data.status;

    const cashierUser = this.getUserById(panel.assignedUserId);
    if (cashierUser) {
      if (data.operatorName !== undefined) cashierUser.fullName = data.operatorName.trim();
      if (data.phone !== undefined) cashierUser.phone = data.phone.trim();
      if (data.status !== undefined) cashierUser.status = panel.status;
      if (data.password !== undefined && data.password.trim()) cashierUser.plainPassword = data.password.trim();
    }

    dualDbManager.markDirty(`panel_edit_${panelId}`);
    dualDbManager.flushSync(this.state);
    return panel;
  }

  public deleteCashierPanel(panelId: string): { success: boolean; reclaimedChips: number; panelName: string } {
    const panelIdx = this.state.cashierPanels.findIndex((p) => p.id === panelId);
    if (panelIdx === -1) throw new Error('Sub-panel de cajero no encontrado');

    const panel = this.state.cashierPanels[panelIdx];
    const reclaimedChips = panel.chipBalance;
    const panelName = panel.name;

    // Recuperar fichas restantes a la Bóveda Central Super Admin
    if (reclaimedChips > 0) {
      const admin = this.state.users.find((u) => u.role === 'admin' || u.role === 'superadmin');
      if (admin) {
        admin.chipBalance += reclaimedChips;
        this.recordTransaction({
          userId: admin.id,
          username: admin.username,
          type: 'FONDEO_CAJERO',
          amount: reclaimedChips,
          balanceBefore: admin.chipBalance - reclaimedChips,
          balanceAfter: admin.chipBalance,
          notes: `Recupero de saldo a Bóveda Central por baja del sub-panel "${panelName}"`,
        });
      }
    }

    // Remover usuario operador del cajero
    const userIdx = this.state.users.findIndex((u) => u.id === panel.assignedUserId);
    if (userIdx !== -1) {
      this.state.users.splice(userIdx, 1);
    }

    this.state.cashierPanels.splice(panelIdx, 1);

    this.addNotification({
      title: 'Sub-Panel de Cajero Eliminado',
      message: `Se dio de baja el sub-panel "${panelName}". Fichas recuperadas a la Bóveda Central: $${reclaimedChips.toLocaleString('es-AR')}.`,
      type: 'SISTEMA',
    });

    dualDbManager.markDirty(`panel_delete_${panelId}`);
    dualDbManager.flushSync(this.state);

    return { success: true, reclaimedChips, panelName };
  }

  public getCashierPanelBySlugOrId(idOrSlug: string): CashierPanel | undefined {
    const clean = idOrSlug.toLowerCase().trim();
    return this.state.cashierPanels.find(
      (p) => p.id.toLowerCase() === clean || (p.slug && p.slug.toLowerCase() === clean) || p.username.toLowerCase() === clean
    );
  }

  public fundCashierPanel(panelId: string, amount: number, notes?: string): {
    panel: CashierPanel;
    cashierUser: User;
    transaction: Transaction;
  } {
    const panel = this.getCashierPanelById(panelId);
    if (!panel) throw new Error('Sub-panel de cajero no encontrado');

    const user = this.getUserById(panel.assignedUserId);
    if (!user) throw new Error('Usuario del cajero no encontrado');

    const balanceBefore = panel.chipBalance;
    panel.chipBalance += amount;
    user.chipBalance += amount;

    const tx = this.recordTransaction({
      userId: user.id,
      username: user.username,
      type: 'FONDEO_CAJERO',
      amount,
      balanceBefore,
      balanceAfter: user.chipBalance,
      notes: notes || `Inyección ilimitada de fichas desde Bóveda Central al sub-panel ${panel.name}`,
    });

    this.addNotification({
      title: 'Fondeo de Fichas a Cajero',
      message: `Se acreditaron $${amount.toLocaleString('es-AR')} fichas a la caja de ${panel.operatorName} (${panel.name}).`,
      type: 'TRANSACCION',
      highlightAmount: amount,
    });

    dualDbManager.markDirty(`panel_fund_${panelId}`);
    dualDbManager.flushSync(this.state);

    return { panel, cashierUser: user, transaction: tx };
  }

  public toggleCashierPanel(panelId: string): CashierPanel {
    const panel = this.getCashierPanelById(panelId);
    if (!panel) throw new Error('Sub-panel no encontrado');

    panel.status = panel.status === 'activo' ? 'suspendido' : 'activo';

    const user = this.getUserById(panel.assignedUserId);
    if (user) {
      user.status = panel.status;
    }

    dualDbManager.markDirty(`panel_toggle_${panelId}`);
    dualDbManager.flushSync(this.state);

    return panel;
  }

  // --- CASHIER SUB-PANEL PLAYERS OPERATIONS ---
  public getCashierPlayers(cashierUserId: string): User[] {
    const panel = this.getCashierPanelByUserId(cashierUserId);
    const cashierUser = this.getUserById(cashierUserId);

    if (cashierUser && (cashierUser.role === 'admin' || cashierUser.role === 'superadmin')) {
      return this.state.users.filter((u) => u.role === 'jugador');
    }

    if (!panel) return [];

    // Prioritize players explicitly assigned to this cashier panel
    const assigned = this.state.users.filter((u) => u.role === 'jugador' && u.assignedCashierId === panel.id);
    if (assigned.length > 0) return assigned;

    // Fallback so cashier can see and service existing player accounts
    return this.state.users.filter((u) => u.role === 'jugador');
  }

  public cashierCreatePlayer(
    cashierUserId: string,
    data: {
      username: string;
      password?: string;
      fullName: string;
      dni?: string;
      phone?: string;
      initialChips?: number;
    }
  ): { player: User; cashier: CashierPanel; transaction?: Transaction } {
    const cashierUser = this.getUserById(cashierUserId);
    if (!cashierUser) throw new Error('Cajero no identificado');

    const panel = this.getCashierPanelByUserId(cashierUserId);
    if (!panel) throw new Error('Sub-panel de cajero no encontrado');
    if (panel.status === 'suspendido') throw new Error('Tu sub-panel se encuentra temporalmente suspendido');

    const cleanUsername = data.username.trim().toLowerCase();
    if (this.getUserByUsername(cleanUsername)) {
      throw new Error(`El nombre de usuario "${cleanUsername}" ya existe en la plataforma`);
    }

    const initialChips = Number(data.initialChips) || 0;
    if (initialChips > 0 && panel.chipBalance < initialChips) {
      throw new Error(
        `Saldo insuficiente en tu caja ($${panel.chipBalance.toLocaleString('es-AR')}) para fondear con $${initialChips.toLocaleString('es-AR')}`
      );
    }

    const newPlayerId = `usr-ply-${Date.now().toString().slice(-5)}`;
    const plainPassword = data.password?.trim() || 'demo-player-password-change-me';

    const newPlayer: User = {
      id: newPlayerId,
      username: cleanUsername,
      fullName: data.fullName?.trim() || cleanUsername,
      dni: data.dni?.trim() || '38.000.000',
      email: `${cleanUsername}@laclaveargentina.com.ar`,
      phone: data.phone?.trim() || '+54 9 11 0000-0000',
      role: 'jugador',
      chipBalance: initialChips,
      status: 'activo',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      assignedCashierId: panel.id,
      plainPassword,
    };

    if (initialChips > 0) {
      panel.chipBalance -= initialChips;
      cashierUser.chipBalance -= initialChips;
      panel.totalChipsDistributed += initialChips;
    }

    this.state.users.push(newPlayer);

    let tx: Transaction | undefined;
    if (initialChips > 0) {
      tx = this.recordTransaction({
        userId: newPlayer.id,
        username: newPlayer.username,
        type: 'TRANSFERENCIA_CAJERO',
        amount: initialChips,
        balanceBefore: 0,
        balanceAfter: initialChips,
        notes: `Alta de jugador y carga inicial por sub-panel ${panel.name} (${cashierUser.username})`,
      });
    }

    this.addNotification({
      title: 'Nuevo Jugador Registrado por Cajero',
      message: `${panel.operatorName} dio de alta a @${newPlayer.username} con ${initialChips.toLocaleString('es-AR')} fichas.`,
      type: 'SISTEMA',
    });

    dualDbManager.markDirty(`player_create_${newPlayer.id}`);
    dualDbManager.flushSync(this.state);

    return { player: newPlayer, cashier: panel, transaction: tx };
  }

  // --- CARGAR FICHAS (SUBIR FICHAS) ---
  public cashierChargePlayer(cashierUserId: string, targetUsername: string, amount: number, notes?: string): {
    cashier: CashierPanel;
    player: User;
    transaction: Transaction;
  } {
    const cashierUser = this.getUserById(cashierUserId);
    if (!cashierUser) throw new Error('Cajero no identificado');

    const panel = this.getCashierPanelByUserId(cashierUserId);
    if (!panel) throw new Error('Sub-panel de cajero no encontrado');
    if (panel.status === 'suspendido') throw new Error('El sub-panel se encuentra temporalmente suspendido');

    if (panel.chipBalance < amount) {
      throw new Error(`Saldo insuficiente en el sub-panel ($${panel.chipBalance.toLocaleString('es-AR')}). Solicite más fichas a la Bóveda Central.`);
    }

    const player = this.getUserByUsername(targetUsername);
    if (!player) throw new Error(`El jugador "@${targetUsername}" no existe en la plataforma`);
    if (player.status === 'suspendido') throw new Error('La cuenta del jugador se encuentra suspendida');

    // Transfer chips: restan de la caja, suman al jugador
    panel.chipBalance -= amount;
    cashierUser.chipBalance -= amount;
    panel.totalChipsDistributed += amount;

    const playerBalanceBefore = player.chipBalance;
    player.chipBalance += amount;

    const tx = this.recordTransaction({
      userId: player.id,
      username: player.username,
      type: 'TRANSFERENCIA_CAJERO',
      amount,
      balanceBefore: playerBalanceBefore,
      balanceAfter: player.chipBalance,
      notes: notes || `Carga directa realizada por ${panel.name} (${cashierUser.username})`,
    });

    this.addNotification({
      title: 'Carga de Fichas Exitosa',
      message: `${cashierUser.username} cargó $${amount.toLocaleString('es-AR')} fichas a la cuenta de ${player.username}.`,
      type: 'TRANSACCION',
      highlightAmount: amount,
    });

    dualDbManager.markDirty(`charge_${tx.id}`);
    dualDbManager.flushSync(this.state);

    return { cashier: panel, player, transaction: tx };
  }

  // --- BAJAR FICHAS (RETIRO CON RECUPERO A LA CAJA) ---
  public cashierRedeemPlayer(
    cashierUserId: string,
    targetUsername: string,
    amount: number,
    notes?: string
  ): {
    cashier: CashierPanel;
    player: User;
    transaction: Transaction;
  } {
    const cashierUser = this.getUserById(cashierUserId);
    if (!cashierUser) throw new Error('Cajero no identificado');

    const panel = this.getCashierPanelByUserId(cashierUserId);
    if (!panel) throw new Error('Sub-panel de cajero no encontrado');
    if (panel.status === 'suspendido') throw new Error('El sub-panel se encuentra temporalmente suspendido');

    const player = this.getUserByUsername(targetUsername);
    if (!player) throw new Error(`El jugador "@${targetUsername}" no existe en la plataforma`);
    if (player.status === 'suspendido') throw new Error('La cuenta del jugador se encuentra suspendida');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new Error('El monto a bajar/retirar debe ser mayor a 0');
    }

    if (player.chipBalance < numAmount) {
      throw new Error(
        `El jugador @${player.username} tiene solo $${player.chipBalance.toLocaleString('es-AR')} fichas. No es posible bajar $${numAmount.toLocaleString('es-AR')}.`
      );
    }

    // --- CIRCUITO DE RECUPERO: Se restan del jugador y vuelven a la caja del cajero ---
    const playerBefore = player.chipBalance;
    player.chipBalance -= numAmount;

    panel.chipBalance += numAmount;
    cashierUser.chipBalance += numAmount;
    panel.totalChipsRedeemed += numAmount;

    const tx = this.recordTransaction({
      userId: player.id,
      username: player.username,
      type: 'RETIRO_RECUPERO_CAJERO',
      amount: numAmount,
      balanceBefore: playerBefore,
      balanceAfter: player.chipBalance,
      notes: notes || `Retiro con recupero de fichas a caja por ${panel.name} (${cashierUser.username})`,
    });

    this.addNotification({
      title: 'Retiro con Recupero de Fichas',
      message: `Se bajaron $${numAmount.toLocaleString('es-AR')} fichas de @${player.username} y volvieron al saldo disponible de ${panel.name}.`,
      type: 'TRANSACCION',
      highlightAmount: numAmount,
    });

    dualDbManager.markDirty(`redeem_${tx.id}`);
    dualDbManager.flushSync(this.state);

    return { cashier: panel, player, transaction: tx };
  }

  public cashierEditPlayer(
    cashierUserId: string,
    playerId: string,
    data: {
      fullName?: string;
      phone?: string;
      password?: string;
      status?: 'activo' | 'suspendido';
    }
  ): User {
    const player = this.getUserById(playerId);
    if (!player) throw new Error('Jugador no encontrado');

    if (data.fullName !== undefined) player.fullName = data.fullName.trim();
    if (data.phone !== undefined) player.phone = data.phone.trim();
    if (data.password !== undefined && data.password.trim()) player.plainPassword = data.password.trim();
    if (data.status !== undefined) player.status = data.status;

    dualDbManager.markDirty(`player_edit_${playerId}`);
    dualDbManager.flushSync(this.state);
    return player;
  }

  public cashierDeletePlayer(
    cashierUserId: string,
    playerId: string
  ): { success: boolean; recoveredChips: number; playerName: string } {
    const cashierUser = this.getUserById(cashierUserId);
    const panel = this.getCashierPanelByUserId(cashierUserId);

    const idx = this.state.users.findIndex((u) => u.id === playerId);
    if (idx === -1) throw new Error('Jugador no encontrado');

    const player = this.state.users[idx];
    const recoveredChips = player.chipBalance;
    const playerName = player.username;

    // Recupero automático de saldo remanente a la caja del cajero
    if (recoveredChips > 0 && panel && cashierUser) {
      panel.chipBalance += recoveredChips;
      cashierUser.chipBalance += recoveredChips;
      panel.totalChipsRedeemed += recoveredChips;
      this.recordTransaction({
        userId: player.id,
        username: player.username,
        type: 'RETIRO_RECUPERO_CAJERO',
        amount: recoveredChips,
        balanceBefore: recoveredChips,
        balanceAfter: 0,
        notes: `Recupero total de fichas por eliminación de jugador @${playerName} a caja ${panel.name}`,
      });
    }

    this.state.users.splice(idx, 1);
    dualDbManager.markDirty(`player_delete_${playerId}`);
    dualDbManager.flushSync(this.state);

    return { success: true, recoveredChips, playerName };
  }

  // --- CHIP BALANCE & LEDGER ---
  public adjustUserBalance(userId: string, deltaAmount: number): number {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    if (user.status === 'suspendido') throw new Error('Cuenta suspendida. Contacte al cajero.');
    if (user.chipBalance + deltaAmount < 0) {
      throw new Error('Saldo insuficiente de fichas.');
    }
    user.chipBalance += deltaAmount;
    return user.chipBalance;
  }

  public recordTransaction(params: {
    userId: string;
    username: string;
    type: Transaction['type'];
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    gameId?: string;
    gameTitle?: string;
    notes?: string;
  }): Transaction {
    const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    const hash = generateLedgerHash(
      this.state.lastLedgerHash,
      txId,
      params.userId,
      params.amount,
      params.balanceAfter,
      timestamp
    );

    this.state.lastLedgerHash = hash;

    const tx: Transaction = {
      id: txId,
      timestamp,
      userId: params.userId,
      username: params.username,
      type: params.type,
      amount: params.amount,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      gameId: params.gameId,
      gameTitle: params.gameTitle,
      hashIntegrity: hash,
      status: 'COMPLETADO',
      notes: params.notes,
    };

    this.state.transactions.unshift(tx);
    return tx;
  }

  public recordGameRound(params: {
    userId: string;
    username: string;
    gameId: string;
    gameTitle: string;
    category: CasinoGame['category'];
    betAmount: number;
    payoutAmount: number;
    multiplier: number;
    isWin: boolean;
    resultSummary: string;
    details?: any;
  }): GameRoundHistory {
    const signature = generateGameSignature(
      params.gameId,
      params.userId,
      params.betAmount,
      params.multiplier,
      params.resultSummary,
      SERVER_SEED
    );

    const round: GameRoundHistory = {
      id: `gr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: params.userId,
      username: params.username,
      gameId: params.gameId,
      gameTitle: params.gameTitle,
      category: params.category,
      betAmount: params.betAmount,
      payoutAmount: params.payoutAmount,
      multiplier: params.multiplier,
      isWin: params.isWin,
      resultSummary: params.resultSummary,
      hashSignature: signature,
      details: params.details,
    };

    this.state.gameHistory.unshift(round);

    if (params.payoutAmount >= 100000) {
      this.addNotification({
        title: '¡Gran Ganancia en La Clave!',
        message: `${params.username} acertó un premio de $${params.payoutAmount.toLocaleString('es-AR')} fichas (${params.multiplier.toFixed(1)}x) en ${params.gameTitle}!`,
        type: params.payoutAmount >= 1000000 ? 'JACKPOT' : 'PROMO',
        highlightAmount: params.payoutAmount,
      });
    }

    return round;
  }

  public getGames(category?: string): CasinoGame[] {
    if (!category || category === 'todos') {
      return this.state.games;
    }
    if (category === 'destacados') {
      return this.state.games.filter((g) => g.featured || g.tag === 'HOT' || g.tag === 'JACKPOT');
    }
    return this.state.games.filter((g) => g.category === category);
  }

  public getGameById(id: string): CasinoGame | undefined {
    return this.state.games.find((g) => g.id === id);
  }

  public getTransactionsByUser(userId: string): Transaction[] {
    return this.state.transactions.filter((t) => t.userId === userId);
  }

  public getAllTransactions(): Transaction[] {
    return this.state.transactions;
  }

  public getTransactions(userId?: string): Transaction[] {
    return userId ? this.getTransactionsByUser(userId) : this.getAllTransactions();
  }

  public getGameHistoryByUser(userId: string): GameRoundHistory[] {
    return this.state.gameHistory.filter((gh) => gh.userId === userId);
  }

  public getAllGameHistory(): GameRoundHistory[] {
    return this.state.gameHistory;
  }

  public getGameHistory(userId?: string): GameRoundHistory[] {
    return userId ? this.getGameHistoryByUser(userId) : this.getAllGameHistory();
  }

  public getNotifications(): NotificationItem[] {
    return this.state.notifications;
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.state.notifications.unshift(newNotif);
    return newNotif;
  }

  public getChipRequests(): ChipRequest[] {
    return this.state.chipRequests;
  }

  public createChipRequest(params: {
    userId: string;
    username: string;
    amount: number;
    aliasTransferencia?: string;
    tipo: 'CARGA' | 'RETIRO';
    nota?: string;
  }): ChipRequest {
    const user = this.getUserById(params.userId);
    if (!user) throw new Error('Usuario no encontrado');

    if (params.tipo === 'RETIRO' && user.chipBalance < params.amount) {
      throw new Error('Saldo insuficiente de fichas para solicitar retiro.');
    }

    const req: ChipRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: params.userId,
      username: params.username,
      amount: params.amount,
      requestedAt: new Date().toISOString(),
      status: 'PENDIENTE',
      aliasTransferencia: params.aliasTransferencia,
      tipo: params.tipo,
      nota: params.nota,
    };

    this.state.chipRequests.unshift(req);

    this.addNotification({
      title: params.tipo === 'CARGA' ? 'Solicitud de Carga Registrada' : 'Solicitud de Retiro en Proceso',
      message: `${params.username} ha solicitado ${params.tipo === 'CARGA' ? 'cargar' : 'retirar'} $${params.amount.toLocaleString('es-AR')} fichas.`,
      type: 'TRANSACCION',
      highlightAmount: params.amount,
    });

    return req;
  }

  public processChipRequest(requestId: string, approve: boolean, adminNotes?: string): ChipRequest {
    const req = this.state.chipRequests.find((r) => r.id === requestId);
    if (!req) throw new Error('Solicitud no encontrada');
    if (req.status !== 'PENDIENTE') throw new Error('La solicitud ya fue procesada anteriormente');

    const user = this.getUserById(req.userId);
    if (!user) throw new Error('Usuario no encontrado');

    if (approve) {
      const balanceBefore = user.chipBalance;
      if (req.tipo === 'CARGA') {
        user.chipBalance += req.amount;
        this.recordTransaction({
          userId: user.id,
          username: user.username,
          type: 'CARGA_FICHAS',
          amount: req.amount,
          balanceBefore,
          balanceAfter: user.chipBalance,
          notes: adminNotes || `Carga aprobada por Cajero Central (${req.aliasTransferencia || 'Transferencia'})`,
        });
      } else {
        if (user.chipBalance < req.amount) {
          throw new Error('El usuario no posee saldo suficiente para este retiro.');
        }
        user.chipBalance -= req.amount;
        this.recordTransaction({
          userId: user.id,
          username: user.username,
          type: 'RETIRO_FICHAS',
          amount: req.amount,
          balanceBefore,
          balanceAfter: user.chipBalance,
          notes: adminNotes || `Retiro procesado por Cajero Central a CBU/Alias: ${req.aliasTransferencia}`,
        });
      }
      req.status = 'APROBADO';
    } else {
      req.status = 'RECHAZADO';
    }

    return req;
  }

  public adminAdjustBalance(params: {
    userId: string;
    amount: number;
    type: 'CARGA' | 'RETIRO';
    reason: string;
  }): { user: User; transaction: Transaction } {
    const user = this.getUserById(params.userId);
    if (!user) throw new Error('Usuario no encontrado');

    const delta = params.type === 'CARGA' ? params.amount : -params.amount;
    const balanceBefore = user.chipBalance;

    if (balanceBefore + delta < 0) {
      throw new Error('El saldo final no puede ser negativo');
    }

    user.chipBalance += delta;

    const tx = this.recordTransaction({
      userId: user.id,
      username: user.username,
      type: 'AJUSTE_ADMIN',
      amount: params.amount,
      balanceBefore,
      balanceAfter: user.chipBalance,
      notes: `Ajuste Administrativo (${params.type}): ${params.reason}`,
    });

    this.addNotification({
      title: 'Ajuste de Saldo por Cajero',
      message: `Se ha registrado un ajuste de $${params.amount.toLocaleString('es-AR')} fichas en la cuenta de ${user.username}.`,
      type: 'TRANSACCION',
    });

    return { user, transaction: tx };
  }

  public toggleUserStatus(userId: string): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    user.status = user.status === 'activo' ? 'suspendido' : 'activo';
    return user;
  }

  public getSportsEvents(): SportsEvent[] {
    return this.state.sportsEvents;
  }

  public verifyLedgerIntegrity(): { isValid: boolean; totalBlocks: number; checkedAt: string } {
    let isValid = true;
    for (let i = 0; i < this.state.transactions.length; i++) {
      const tx = this.state.transactions[i];
      if (!tx.hashIntegrity || tx.hashIntegrity.length !== 64) {
        isValid = false;
        break;
      }
    }
    return {
      isValid,
      totalBlocks: this.state.transactions.length,
      checkedAt: new Date().toISOString(),
    };
  }

  public createCustomGame(gameData: CreateGameRequest): CasinoGame {
    const slug = gameData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `${gameData.category}-${slug}-${Date.now().toString().slice(-4)}`;

    const newGame: CasinoGame = {
      id,
      title: gameData.title.trim(),
      subtitle: gameData.subtitle.trim() || 'Edición Especial La Clave',
      category: gameData.category,
      provider: gameData.provider || 'La Clave Studios',
      thumbnail:
        gameData.thumbnail ||
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
      banner: gameData.banner || gameData.thumbnail,
      tag: 'NUEVO',
      skinId: gameData.skinId || (gameData.category === 'slots' ? 'slot-faraon' : 'ruleta-relampago'),
      jackpotAmount: 15000000,
      rtp: Number(gameData.rtp) || 96.5,
      minBet: Number(gameData.minBet) || 500,
      maxBet: Number(gameData.maxBet) || 50000,
      volatility: gameData.volatility || 'Alta',
      lines: 20,
      description:
        gameData.description ||
        'Nuevo juego modular montado en contenedor sin necesidad de crear archivos HTML.',
      features:
        gameData.features && gameData.features.length
          ? gameData.features
          : ['Giros Gratis', 'Comodín Expansivo', 'Multiplicadores Dinámicos'],
    };

    this.state.games.unshift(newGame);
    dualDbManager.markDirty(`game_${id}`);
    dualDbManager.flushSync(this.state);
    return newGame;
  }

  public getDualDatabaseStatus(): DualDatabaseStatus {
    return dualDbManager.getStatus();
  }

  public forceDatabaseSync(): { success: boolean; message: string; status: DualDatabaseStatus } {
    dualDbManager.flushSync(this.state);
    return {
      success: true,
      message: 'Sincronización forzada completada. Estado de BBDD guardado en disco y registrado en la nube.',
      status: dualDbManager.getStatus(),
    };
  }

  public switchDatabaseTarget(target: 'primary' | 'secondary'): DualDatabaseStatus {
    dualDbManager.switchActiveDatabase(target);
    return dualDbManager.getStatus();
  }
}

export const db = new CasinoDatabase();
