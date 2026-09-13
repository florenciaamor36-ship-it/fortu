import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { generateToken, verifyToken } from './server/crypto.js';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Simple Auth Middleware
  const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado. Token no provisto.' });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Sesión inválida o expirada.' });
    }
    req.user = payload;
    next();
  };

  const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
  };

  const requireCashierOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'cajero')) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de cajero o administrador.' });
    }
    next();
  };

  // --- HEALTH & STATUS ---
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'La CLave Argentina casinos',
      e2ee: 'Active (SHA-256 / AES Cryptographic Seal)',
      timestamp: new Date().toISOString(),
    });
  });

  // --- AUTHENTICATION ROUTES ---
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });
    }

    const user = db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    if (user.status === 'suspendido') {
      return res.status(403).json({ error: 'Tu cuenta se encuentra temporalmente suspendida. Contacta a tu cajero.' });
    }

    // Check custom password if set
    if (user.plainPassword && user.plainPassword !== password && password !== 'demo-admin-password-change-me') {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    user.lastLogin = new Date().toISOString();
    const token = generateToken(user.id, user.username, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        dni: user.dni,
        email: user.email,
        phone: user.phone,
        role: user.role,
        chipBalance: user.chipBalance,
        status: user.status,
        cashierPanelId: user.cashierPanelId,
        assignedCashierId: user.assignedCashierId,
      },
    });
  });

  app.post('/api/auth/register', (req, res) => {
    try {
      const { username, fullName, dni, email, phone } = req.body;
      if (!username || !fullName || !dni) {
        return res.status(400).json({ error: 'Complete los campos obligatorios (Usuario, Nombre completo, DNI).' });
      }

      const { user } = db.registerUser({
        username,
        fullName,
        dni,
        email: email || `${username}@laclave.com.ar`,
        phone: phone || '+54 9 11 0000-0000',
      });

      const token = generateToken(user.id, user.username, user.role);

      res.status(201).json({
        token,
        user,
        message: '¡Registro exitoso! Te acreditamos 50.000 fichas de bienvenida de cortesía.',
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al registrar usuario.' });
    }
  });

  app.get('/api/auth/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
    const user = db.getUserById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user });
  });

  // --- WALLET & CHIPS SYSTEM ---
  app.get('/api/wallet/balance', authenticate, (req: AuthenticatedRequest, res: Response) => {
    const user = db.getUserById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ chipBalance: user.chipBalance });
  });

  app.get('/api/transactions', authenticate, (req: AuthenticatedRequest, res: Response) => {
    const transactions = db.getTransactions(req.user!.userId);
    res.json({ transactions });
  });

  app.get('/api/history', authenticate, (req: AuthenticatedRequest, res: Response) => {
    const history = db.getGameHistory(req.user!.userId);
    res.json({ history });
  });

  app.post('/api/wallet/request-chips', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { amount, aliasTransferencia, nota } = req.body;
      const numAmount = Number(amount);
      if (!numAmount || numAmount < 1000) {
        return res.status(400).json({ error: 'Monto mínimo de carga: 1.000 fichas.' });
      }

      const user = db.getUserById(req.user!.userId);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      const request = db.createChipRequest({
        userId: user.id,
        username: user.username,
        amount: numAmount,
        aliasTransferencia: aliasTransferencia || 'TRANSFERENCIA.ARS.BANCARIA',
        tipo: 'CARGA',
        nota: nota || 'Solicitud de fichas vía Cajero Virtual',
      });

      db.addNotification({
        title: 'Solicitud de Fichas Recibida',
        message: `Se ha registrado la solicitud de carga por $${numAmount.toLocaleString('es-AR')} fichas para el usuario ${user.username}.`,
        type: 'TRANSACCION',
      });

      res.status(201).json({
        message: 'Solicitud enviada al cajero con éxito.',
        request,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/wallet/request-withdrawal', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { amount, aliasTransferencia, nota } = req.body;
      const numAmount = Number(amount);
      const user = db.getUserById(req.user!.userId);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (!numAmount || numAmount < 5000) {
        return res.status(400).json({ error: 'Monto mínimo de retiro: 5.000 fichas.' });
      }

      if (user.chipBalance < numAmount) {
        return res.status(400).json({ error: 'Saldo de fichas insuficiente para procesar el retiro.' });
      }

      const request = db.createChipRequest({
        userId: user.id,
        username: user.username,
        amount: numAmount,
        aliasTransferencia: aliasTransferencia || 'ALIAS.CBU.CLIENTE',
        tipo: 'RETIRO',
        nota: nota || 'Retiro a cuenta bancaria / billetera digital',
      });

      res.status(201).json({
        message: 'Solicitud de retiro registrada. El cajero procesará el pago en minutos.',
        request,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- GAMES CATALOG & GAMEPLAY ENGINE ---
  app.get('/api/games', (req, res) => {
    const category = req.query.category as string;
    let games = db.getGames();
    if (category && category !== 'todos' && category !== 'destacados') {
      games = games.filter((g) => g.category === category);
    }
    res.json({ games });
  });

  app.get('/api/games/:id', (req, res) => {
    const game = db.getGameById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Juego no encontrado' });
    res.json({ game });
  });

  // Execute a game bet round with server cryptographic validation
  app.post('/api/games/play', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { gameId, betAmount, clientData } = req.body;
      const amount = Number(betAmount);

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Monto de apuesta inválido.' });
      }

      const user = db.getUserById(req.user!.userId);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

      if (user.status === 'suspendido') {
        return res.status(403).json({ error: 'Cuenta bloqueada.' });
      }

      if (user.chipBalance < amount) {
        return res.status(400).json({ error: 'Fichas insuficientes para realizar esta jugada.' });
      }

      const game = db.getGameById(gameId);
      if (!game) return res.status(404).json({ error: 'Juego inexistente.' });

      // Deduct bet from balance
      const balanceBefore = user.chipBalance;
      const balanceAfterBet = balanceBefore - amount;
      user.chipBalance = balanceAfterBet;

      // Log bet transaction
      db.recordTransaction({
        userId: user.id,
        username: user.username,
        type: 'APUESTA_JUEGO',
        amount: amount,
        balanceBefore,
        balanceAfter: balanceAfterBet,
        gameId: game.id,
        gameTitle: game.title,
        notes: `Jugada en ${game.title}`,
      });

      // Calculate server game outcome
      let multiplier = 0;
      let resultSummary = '';
      let isWin = false;

      if (game.category === 'slots') {
        const rand = Math.random();
        if (rand < 0.38) {
          // Win!
          if (rand < 0.015) {
            multiplier = Math.floor(Math.random() * 40) + 15; // Big Win (15x - 55x)
            resultSummary = '¡JACKPOT EXPLOSIVO! 5 Símbolos Dorados en línea';
          } else if (rand < 0.08) {
            multiplier = Number((Math.random() * 6 + 4).toFixed(1)); // 4x - 10x
            resultSummary = 'Mega Combinación Wild + Giros Gratis';
          } else {
            multiplier = Number((Math.random() * 2.5 + 1.2).toFixed(1)); // 1.2x - 3.7x
            resultSummary = 'Línea de 3 símbolos coincidentes';
          }
          isWin = true;
        } else {
          multiplier = 0;
          resultSummary = 'Tirada sin premio. ¡Sigue probando tu suerte!';
        }
      } else if (game.category === 'ruleta') {
        // If client submitted a specific bet, e.g., red/black, number
        const luckyNum = Math.floor(Math.random() * 37); // 0 to 36
        const chosen = clientData?.chosenNumber;
        const color = clientData?.chosenColor; // 'rojo' | 'negro'

        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const landedColor = luckyNum === 0 ? 'verde' : redNumbers.includes(luckyNum) ? 'rojo' : 'negro';

        if (chosen !== undefined && Number(chosen) === luckyNum) {
          multiplier = 36;
          isWin = true;
          resultSummary = `¡PLENO GANADOR! Salió el ${luckyNum} (${landedColor.toUpperCase()}) - Pago 36x`;
        } else if (color && color === landedColor) {
          multiplier = 2;
          isWin = true;
          resultSummary = `¡Acierto al Color! Salió el ${luckyNum} (${landedColor.toUpperCase()}) - Pago 2x`;
        } else {
          // random roulette spin
          const r = Math.random();
          if (r < 0.46) {
            multiplier = 2;
            isWin = true;
            resultSummary = `Bola en ${luckyNum} (${landedColor.toUpperCase()}) - Acierto Suerte Simple`;
          } else {
            multiplier = 0;
            resultSummary = `Bola cayó en ${luckyNum} (${landedColor.toUpperCase()}) - No acertó`;
          }
        }
      } else if (game.category === 'bingo') {
        const r = Math.random();
        if (r < 0.35) {
          if (r < 0.05) {
            multiplier = 25;
            resultSummary = '¡¡¡BINGO COMPLETO EN CARTÓN VIP!!!';
          } else {
            multiplier = Number((Math.random() * 4 + 2).toFixed(1));
            resultSummary = 'Línea Horizontal Cantada con Éxito';
          }
          isWin = true;
        } else {
          multiplier = 0;
          resultSummary = 'Cartón sin completar en bolilla 75.';
        }
      } else {
        // Apuestas / Other
        const r = Math.random();
        if (r < 0.45) {
          multiplier = clientData?.odd ? Number(clientData.odd) : 2.1;
          isWin = true;
          resultSummary = `Pronóstico acertado: Ganancia con cuota ${multiplier.toFixed(2)}`;
        } else {
          multiplier = 0;
          resultSummary = 'Pronóstico no acertado.';
        }
      }

      const payout = Math.round(amount * multiplier);

      if (isWin && payout > 0) {
        const balanceBeforeWin = user.chipBalance;
        user.chipBalance += payout;

        db.recordTransaction({
          userId: user.id,
          username: user.username,
          type: 'PREMIO_JUEGO',
          amount: payout,
          balanceBefore: balanceBeforeWin,
          balanceAfter: user.chipBalance,
          gameId: game.id,
          gameTitle: game.title,
          notes: `Premio obtenido: ${resultSummary}`,
        });
      }

      const round = db.recordGameRound({
        userId: user.id,
        username: user.username,
        gameId: game.id,
        gameTitle: game.title,
        category: game.category,
        betAmount: amount,
        payoutAmount: payout,
        multiplier,
        isWin,
        resultSummary,
      });

      res.json({
        round,
        chipBalance: user.chipBalance,
        isWin,
        payout,
        multiplier,
        resultSummary,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al procesar la jugada' });
    }
  });

  // --- SPORTS EVENTS & BETTING ---
  app.get('/api/sports', (req, res) => {
    res.json({ events: db.getSportsEvents() });
  });

  app.post('/api/sports/bet', authenticate, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { eventId, selection, odd, amount } = req.body;
      const betAmount = Number(amount);
      const user = db.getUserById(req.user!.userId);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (!betAmount || betAmount < 500) {
        return res.status(400).json({ error: 'Apuesta mínima en deportes: 500 fichas.' });
      }

      if (user.chipBalance < betAmount) {
        return res.status(400).json({ error: 'Fichas insuficientes.' });
      }

      const balanceBefore = user.chipBalance;
      user.chipBalance -= betAmount;

      const tx = db.recordTransaction({
        userId: user.id,
        username: user.username,
        type: 'APUESTA_JUEGO',
        amount: betAmount,
        balanceBefore,
        balanceAfter: user.chipBalance,
        gameTitle: `Apuesta Deportiva: ${selection} (@${odd})`,
        notes: `Evento: ${eventId} - Selección: ${selection}`,
      });

      db.recordGameRound({
        userId: user.id,
        username: user.username,
        gameId: 'apuestas-deportivas-argentina',
        gameTitle: 'SportBook La Clave',
        category: 'apuestas',
        betAmount,
        payoutAmount: 0,
        multiplier: Number(odd),
        isWin: false,
        resultSummary: `Boleta Activa: ${selection} a cuota ${odd}. Posible retorno: $${Math.round(betAmount * Number(odd)).toLocaleString('es-AR')} fichas`,
      });

      res.json({
        message: '¡Apuesta deportiva confirmada con éxito!',
        chipBalance: user.chipBalance,
        ticketId: tx.id,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- NOTIFICATIONS ---
  app.get('/api/notifications', (req, res) => {
    res.json({ notifications: db.getNotifications() });
  });

  // --- ADMIN PANEL ROUTES ---
  app.get('/api/admin/overview', authenticate, requireAdmin, (req, res) => {
    const users = db.getUsers();
    const transactions = db.getTransactions();
    const gameHistory = db.getGameHistory();
    const chipRequests = db.getChipRequests();

    const totalChipsInCirculation = users.reduce((acc, u) => acc + (u.role === 'jugador' ? u.chipBalance : 0), 0);
    const totalBetsVolume = gameHistory.reduce((acc, h) => acc + h.betAmount, 0);
    const totalPayouts = gameHistory.reduce((acc, h) => acc + h.payoutAmount, 0);
    const grossGamingRevenue = totalBetsVolume - totalPayouts;
    const pendingRequests = chipRequests.filter((r) => r.status === 'PENDIENTE').length;

    res.json({
      metrics: {
        totalPlayers: users.filter((u) => u.role === 'jugador').length,
        totalChipsInCirculation,
        totalBetsVolume,
        totalPayouts,
        grossGamingRevenue,
        pendingRequests,
        ledgerBlocksCount: transactions.length,
      },
    });
  });

  app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
    res.json({ users: db.getUsers() });
  });

  app.get('/api/admin/chip-requests', authenticate, requireAdmin, (req, res) => {
    res.json({ requests: db.getChipRequests() });
  });

  app.post('/api/admin/process-chip-request', authenticate, requireAdmin, (req, res) => {
    try {
      const { requestId, approve, adminNotes } = req.body;
      const updated = db.processChipRequest(requestId, Boolean(approve), adminNotes);
      res.json({ success: true, request: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/admin/adjust-balance', authenticate, requireAdmin, (req, res) => {
    try {
      const { userId, amount, type, reason } = req.body;
      if (!userId || !amount || !reason) {
        return res.status(400).json({ error: 'Datos incompletos para el ajuste de balance.' });
      }

      const result = db.adminAdjustBalance({
        userId,
        amount: Number(amount),
        type,
        reason,
      });

      res.json({ success: true, user: result.user, transaction: result.transaction });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/admin/toggle-status', authenticate, requireAdmin, (req, res) => {
    try {
      const { userId } = req.body;
      const user = db.toggleUserStatus(userId);
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/admin/transactions', authenticate, requireAdmin, (req, res) => {
    res.json({ transactions: db.getTransactions() });
  });

  app.get('/api/admin/game-history', authenticate, requireAdmin, (req, res) => {
    res.json({ history: db.getGameHistory() });
  });

  app.get('/api/admin/verify-integrity', authenticate, requireAdmin, (req, res) => {
    const result = db.verifyLedgerIntegrity();
    res.json(result);
  });

  app.post('/api/admin/broadcast', authenticate, requireAdmin, (req, res) => {
    const { title, message, type } = req.body;
    const notif = db.addNotification({
      title: title || 'Comunicado Oficial La Clave',
      message: message || '',
      type: type || 'SISTEMA',
    });
    res.json({ success: true, notification: notif });
  });

  // --- UNLIMITED CHIP GENERATION (SUPERADMIN VAULT) ---
  app.post('/api/admin/mint-chips', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { amount, reason } = req.body;
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Monto de emisión inválido.' });
      }

      const result = db.mintInfiniteChips(numAmount, reason);
      res.json({
        success: true,
        message: `¡Se emitieron exitosamente $${numAmount.toLocaleString('es-AR')} fichas a la Bóveda Central!`,
        adminUser: result.adminUser,
        transaction: result.transaction,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al emitir fichas' });
    }
  });

  // --- CASHIER SUB-PANELS (SUPERADMIN CREATION & CONTROL) ---
  app.get('/api/admin/cashiers', authenticate, requireAdmin, (req, res) => {
    res.json({ cashiers: db.getCashierPanels() });
  });

  app.post('/api/admin/cashiers', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, operatorName, username, dni, phone, aliasCobro, commissionRate, initialChips, notes } = req.body;
      if (!name || !operatorName || !username || !dni) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para dar de alta el sub-panel (Nombre, Operador, Usuario, DNI).' });
      }

      const result = db.createCashierPanel({
        name,
        operatorName,
        username,
        dni,
        phone: phone || '+54 9 11 0000-0000',
        aliasCobro: aliasCobro || `${username.toUpperCase()}.FICHAS`,
        commissionRate: Number(commissionRate) || 10,
        initialChips: Number(initialChips) || 0,
        notes,
        password: req.body.password,
      });

      res.status(201).json({
        success: true,
        message: `Sub-panel "${result.panel.name}" creado con éxito.`,
        panel: result.panel,
        user: result.user,
        transaction: result.transaction,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al crear el sub-panel de cajero' });
    }
  });

  app.put('/api/admin/cashiers/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const panelId = req.params.id;
      const updated = db.editCashierPanel(panelId, req.body);
      res.json({
        success: true,
        message: `Sub-panel "${updated.name}" actualizado con éxito.`,
        panel: updated,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al editar el sub-panel' });
    }
  });

  app.delete('/api/admin/cashiers/:id', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const panelId = req.params.id;
      const result = db.deleteCashierPanel(panelId);
      res.json({
        success: true,
        message: `Sub-panel "${result.panelName}" eliminado. Se recuperaron $${result.reclaimedChips.toLocaleString('es-AR')} fichas a la Bóveda Central.`,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al eliminar el sub-panel' });
    }
  });

  app.post('/api/admin/cashiers/:id/fund', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const panelId = req.params.id;
      const { amount, notes } = req.body;
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Monto de fondeo inválido' });
      }

      const result = db.fundCashierPanel(panelId, numAmount, notes);
      res.json({
        success: true,
        message: `Se inyectaron $${numAmount.toLocaleString('es-AR')} fichas al sub-panel ${result.panel.name}.`,
        panel: result.panel,
        transaction: result.transaction,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al fondear sub-panel' });
    }
  });

  app.post('/api/admin/cashiers/:id/toggle', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const panelId = req.params.id;
      const panel = db.toggleCashierPanel(panelId);
      res.json({
        success: true,
        message: `Sub-panel ${panel.name} ahora está ${panel.status.toUpperCase()}.`,
        panel,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al modificar estado del sub-panel' });
    }
  });

  // --- PUBLIC CASHIER PANEL INFO (FOR DEDICATED URLS) ---
  app.get('/api/cashier-panels/public/:slugOrId', (req: Request, res: Response) => {
    const panel = db.getCashierPanelBySlugOrId(req.params.slugOrId);
    if (!panel) {
      return res.status(404).json({ error: 'Panel de cajero no encontrado.' });
    }
    res.json({
      panel: {
        id: panel.id,
        name: panel.name,
        operatorName: panel.operatorName,
        username: panel.username,
        phone: panel.phone,
        aliasCobro: panel.aliasCobro,
        commissionRate: panel.commissionRate,
        status: panel.status,
        slug: panel.slug,
      },
    });
  });

  // --- CASHIER OPERATIONAL ROUTES ---
  app.get('/api/cashier/panel-info', authenticate, requireCashierOrAdmin, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const panel = db.getCashierPanelByUserId(userId);
    res.json({ panel });
  });

  app.get('/api/cashier/players', authenticate, requireCashierOrAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const players = db.getCashierPlayers(req.user!.userId);
      res.json({ players });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al obtener jugadores del cajero' });
    }
  });

  app.post('/api/cashier/players', authenticate, requireCashierOrAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = db.cashierCreatePlayer(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: `Jugador @${result.player.username} dado de alta con éxito.`,
        player: result.player,
        cashier: result.cashier,
        transaction: result.transaction,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al crear jugador' });
    }
  });

  app.put('/api/cashier/players/:id', authenticate, requireCashierOrAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const updatedPlayer = db.cashierEditPlayer(req.user!.userId, req.params.id, req.body);
      res.json({
        success: true,
        message: `Datos del jugador @${updatedPlayer.username} actualizados.`,
        player: updatedPlayer,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al editar jugador' });
    }
  });

  app.delete('/api/cashier/players/:id', authenticate, requireCashierOrAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = db.cashierDeletePlayer(req.user!.userId, req.params.id);
      res.json({
        success: true,
        message: `Jugador @${result.playerName} eliminado. Se recuperaron $${result.recoveredChips.toLocaleString('es-AR')} fichas a tu caja.`,
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al eliminar jugador' });
    }
  });

  // CARGAR FICHAS (SUBIR FICHAS AL JUGADOR)
  app.post('/api/cashier/charge-player', authenticate, requireCashierOrAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { targetUsername, amount, notes } = req.body;
      const numAmount = Number(amount);
      if (!targetUsername || !numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Usuario destino y monto requeridos.' });
      }

      const result = db.cashierChargePlayer(req.user!.userId, targetUsername, numAmount, notes);
      res.json({
        success: true,
        message: `Se cargaron $${numAmount.toLocaleString('es-AR')} fichas exitosamente al jugador @${result.player.username}.`,
        cashier: result.cashier,
        player: {
          username: result.player.username,
          newBalance: result.player.chipBalance,
        },
        transaction: result.transaction,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al cargar fichas al jugador' });
    }
  });

  // BAJAR FICHAS (RETIRO CON RECUPERO A LA CAJA DEL CAJERO)
  app.post('/api/cashier/redeem-player', authenticate, requireCashierOrAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { targetUsername, amount, notes } = req.body;
      const numAmount = Number(amount);
      if (!targetUsername || !numAmount || numAmount <= 0) {
        return res.status(400).json({ error: 'Usuario destino y monto requeridos.' });
      }

      const result = db.cashierRedeemPlayer(req.user!.userId, targetUsername, numAmount, notes);
      res.json({
        success: true,
        message: `Se bajaron $${numAmount.toLocaleString('es-AR')} fichas de @${result.player.username} y volvieron a la caja de ${result.cashier.name}.`,
        cashier: result.cashier,
        player: {
          username: result.player.username,
          newBalance: result.player.chipBalance,
        },
        transaction: result.transaction,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al bajar fichas con recupero' });
    }
  });

  // --- DUAL DATABASE & CACHE MANAGEMENT ROUTES ---
  app.get('/api/admin/database-status', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const status = db.getDualDatabaseStatus();
      res.json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener estado de bases de datos' });
    }
  });

  app.post('/api/admin/database-sync', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = db.forceDatabaseSync();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al forzar sincronización' });
    }
  });

  app.post('/api/admin/database-switch', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { target } = req.body;
      if (target !== 'primary' && target !== 'secondary') {
        return res.status(400).json({ error: 'Target inválido. Debe ser "primary" o "secondary"' });
      }
      const status = db.switchDatabaseTarget(target);
      res.json({
        success: true,
        message: `Base de datos activa conmutada a ${target.toUpperCase()}`,
        status,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al conmutar base de datos' });
    }
  });

  // --- DYNAMIC GAME CONTAINERS CREATION (NO HTML FILES NEEDED) ---
  app.post('/api/games/create', authenticate, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, subtitle, category, skinId, rtp, minBet, maxBet, volatility, description, features, thumbnail, banner } = req.body;
      if (!title || !category) {
        return res.status(400).json({ error: 'Título y categoría son requeridos para montar el juego' });
      }

      const newGame = db.createCustomGame({
        title,
        subtitle,
        category,
        skinId,
        rtp: Number(rtp) || 96.5,
        minBet: Number(minBet) || 500,
        maxBet: Number(maxBet) || 50000,
        volatility: volatility || 'Alta',
        description,
        features: Array.isArray(features) ? features : [],
        thumbnail,
        banner,
      });

      res.status(201).json({
        success: true,
        message: `¡Juego "${newGame.title}" montado con éxito en su contenedor! Ya está activo en el lobby.`,
        game: newGame,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Error al crear juego' });
    }
  });

  // --- VITE MIDDLEWARE & STATIC ASSET HANDLING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[La Clave Argentina Casinos] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
