import {
  User,
  CasinoGame,
  Transaction,
  GameRoundHistory,
  NotificationItem,
  ChipRequest,
  SportsEvent,
  CashierPanel,
  DualDatabaseStatus,
  CreateGameRequest,
} from '../types';

const TOKEN_KEY = 'la_clave_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Demo-Transport': 'HTTPS required in deployment',
    'X-Client-Platform': 'La Clave Argentina Online v2.5',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Ocurrió un error en la solicitud.');
  }

  return data as T;
}

export const api = {
  getToken: getStoredToken,
  setToken: setStoredToken,
  removeToken: removeStoredToken,
  request,

  // Auth
  login(username: string, password: string) {
    return request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register(userData: { username: string; fullName: string; dni: string; email?: string; phone?: string }) {
    return request<{ token: string; user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe() {
    return request<{ user: User }>('/api/auth/me');
  },

  // Wallet / Chips
  getBalance() {
    return request<{ chipBalance: number }>('/api/wallet/balance');
  },

  getTransactions() {
    return request<{ transactions: Transaction[] }>('/api/transactions');
  },

  getGameHistory() {
    return request<{ history: GameRoundHistory[] }>('/api/history');
  },

  requestChips(amount: number, aliasTransferencia?: string, nota?: string) {
    return request<{ message: string; request: ChipRequest }>('/api/wallet/request-chips', {
      method: 'POST',
      body: JSON.stringify({ amount, aliasTransferencia, nota }),
    });
  },

  requestWithdrawal(amount: number, aliasTransferencia?: string, nota?: string) {
    return request<{ message: string; request: ChipRequest }>('/api/wallet/request-withdrawal', {
      method: 'POST',
      body: JSON.stringify({ amount, aliasTransferencia, nota }),
    });
  },

  // Games
  getGames(category?: string) {
    const query = category ? `?category=${category}` : '';
    return request<{ games: CasinoGame[] }>(`/api/games${query}`);
  },

  getGame(id: string) {
    return request<{ game: CasinoGame }>(`/api/games/${id}`);
  },

  playGame(gameId: string, betAmount: number, clientData?: any) {
    return request<{
      round: GameRoundHistory;
      chipBalance: number;
      isWin: boolean;
      payout: number;
      multiplier: number;
      resultSummary: string;
    }>('/api/games/play', {
      method: 'POST',
      body: JSON.stringify({ gameId, betAmount, clientData }),
    });
  },

  // Sports
  getSports() {
    return request<{ events: SportsEvent[] }>('/api/sports');
  },

  placeSportsBet(eventId: string, selection: string, odd: number, amount: number) {
    return request<{ message: string; chipBalance: number; ticketId: string }>('/api/sports/bet', {
      method: 'POST',
      body: JSON.stringify({ eventId, selection, odd, amount }),
    });
  },

  // Notifications
  getNotifications() {
    return request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  // Admin
  getAdminOverview() {
    return request<{
      metrics: {
        totalPlayers: number;
        totalChipsInCirculation: number;
        totalBetsVolume: number;
        totalPayouts: number;
        grossGamingRevenue: number;
        pendingRequests: number;
        ledgerBlocksCount: number;
      };
    }>('/api/admin/overview');
  },

  getAdminUsers() {
    return request<{ users: User[] }>('/api/admin/users');
  },

  getAdminChipRequests() {
    return request<{ requests: ChipRequest[] }>('/api/admin/chip-requests');
  },

  processChipRequest(requestId: string, approve: boolean, adminNotes?: string) {
    return request<{ success: boolean; request: ChipRequest }>('/api/admin/process-chip-request', {
      method: 'POST',
      body: JSON.stringify({ requestId, approve, adminNotes }),
    });
  },

  adminAdjustBalance(userId: string, amount: number, type: 'CARGA' | 'RETIRO', reason: string) {
    return request<{ success: boolean; user: User; transaction: Transaction }>('/api/admin/adjust-balance', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, type, reason }),
    });
  },

  adminToggleStatus(userId: string) {
    return request<{ success: boolean; user: User }>('/api/admin/toggle-status', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  getAdminTransactions() {
    return request<{ transactions: Transaction[] }>('/api/admin/transactions');
  },

  getAdminGameHistory() {
    return request<{ history: GameRoundHistory[] }>('/api/admin/game-history');
  },

  verifyIntegrity() {
    return request<{ isValid: boolean; totalBlocks: number; checkedAt: string }>('/api/admin/verify-integrity');
  },

  broadcastNotification(title: string, message: string, type: string) {
    return request<{ success: boolean; notification: NotificationItem }>('/api/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message, type }),
    });
  },

  // Unlimited Minting
  mintChips(amount: number, reason?: string) {
    return request<{ success: boolean; message: string; adminUser: User; transaction: Transaction }>('/api/admin/mint-chips', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  },

  // Sub-Panels Management
  getCashierPanels() {
    return request<{ cashiers: CashierPanel[] }>('/api/admin/cashiers');
  },

  createCashierPanel(data: {
    name: string;
    operatorName: string;
    username: string;
    dni: string;
    phone?: string;
    aliasCobro?: string;
    commissionRate?: number;
    initialChips?: number;
    notes?: string;
    password?: string;
  }) {
    return request<{ success: boolean; message: string; panel: CashierPanel; user: User; transaction?: Transaction }>('/api/admin/cashiers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  editCashierPanel(id: string, data: Partial<CashierPanel> & { password?: string }) {
    return request<{ success: boolean; message: string; panel: CashierPanel }>(`/api/admin/cashiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCashierPanel(id: string) {
    return request<{ success: boolean; message: string; reclaimedChips: number; panelName: string }>(`/api/admin/cashiers/${id}`, {
      method: 'DELETE',
    });
  },

  getPublicCashierPanel(slugOrId: string) {
    return request<{ panel: CashierPanel }>(`/api/cashier-panels/public/${slugOrId}`);
  },

  fundCashierPanel(id: string, amount: number, notes?: string) {
    return request<{ success: boolean; message: string; panel: CashierPanel; transaction: Transaction }>(`/api/admin/cashiers/${id}/fund`, {
      method: 'POST',
      body: JSON.stringify({ amount, notes }),
    });
  },

  toggleCashierPanel(id: string) {
    return request<{ success: boolean; message: string; panel: CashierPanel }>(`/api/admin/cashiers/${id}/toggle`, {
      method: 'POST',
    });
  },

  // Cashier Operational
  getCashierPanelInfo() {
    return request<{ panel: CashierPanel | undefined }>('/api/cashier/panel-info');
  },

  getCashierPlayers() {
    return request<{ players: User[] }>('/api/cashier/players');
  },

  cashierCreatePlayer(data: {
    username: string;
    password?: string;
    fullName: string;
    dni?: string;
    phone?: string;
    initialChips?: number;
  }) {
    return request<{
      success: boolean;
      message: string;
      player: User;
      cashier: CashierPanel;
      transaction?: Transaction;
    }>('/api/cashier/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cashierEditPlayer(id: string, data: { fullName?: string; phone?: string; password?: string; status?: 'activo' | 'suspendido' }) {
    return request<{ success: boolean; message: string; player: User }>(`/api/cashier/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cashierDeletePlayer(id: string) {
    return request<{ success: boolean; message: string; recoveredChips: number; playerName: string }>(`/api/cashier/players/${id}`, {
      method: 'DELETE',
    });
  },

  cashierChargePlayer(targetUsername: string, amount: number, notes?: string) {
    return request<{
      success: boolean;
      message: string;
      cashier: CashierPanel;
      player: { username: string; newBalance: number };
      transaction: Transaction;
    }>('/api/cashier/charge-player', {
      method: 'POST',
      body: JSON.stringify({ targetUsername, amount, notes }),
    });
  },

  // RETIRO CON RECUPERO A LA CAJA DEL CAJERO
  cashierRedeemPlayer(targetUsername: string, amount: number, notes?: string) {
    return request<{
      success: boolean;
      message: string;
      cashier: CashierPanel;
      player: { username: string; newBalance: number };
      transaction: Transaction;
    }>('/api/cashier/redeem-player', {
      method: 'POST',
      body: JSON.stringify({ targetUsername, amount, notes }),
    });
  },

  // Dual Database & Cache Management
  getDatabaseStatus() {
    return request<{ success: boolean; status: DualDatabaseStatus }>('/api/admin/database-status');
  },

  forceDatabaseSync() {
    return request<{ success: boolean; message: string; status: DualDatabaseStatus }>('/api/admin/database-sync', {
      method: 'POST',
    });
  },

  switchDatabase(target: 'primary' | 'secondary') {
    return request<{ success: boolean; message: string; status: DualDatabaseStatus }>('/api/admin/database-switch', {
      method: 'POST',
      body: JSON.stringify({ target }),
    });
  },

  // Dynamic Game Container Creation
  createCustomGame(data: CreateGameRequest) {
    return request<{ success: boolean; message: string; game: CasinoGame }>('/api/games/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
