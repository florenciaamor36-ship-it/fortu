import crypto from 'crypto';

/**
 * Utility functions for SHA-256 hashing and HMAC signature generation.
 * Implements end-to-end cryptographic verification for gaming ledger integrity.
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateLedgerHash(
  previousHash: string,
  txId: string,
  userId: string,
  amount: number,
  balanceAfter: number,
  timestamp: string
): string {
  const payload = `${previousHash}|${txId}|${userId}|${amount}|${balanceAfter}|${timestamp}`;
  return sha256(payload);
}

export function generateGameSignature(
  gameId: string,
  userId: string,
  betAmount: number,
  multiplier: number,
  resultSummary: string,
  serverSeed: string
): string {
  const payload = `${gameId}:${userId}:${betAmount}:${multiplier}:${resultSummary}:${serverSeed}`;
  return crypto.createHmac('sha256', serverSeed).update(payload).digest('hex');
}

export function generateToken(userId: string, username: string, role: string): string {
  const secret = process.env.SESSION_SECRET || 'clave_argentina_secret_key_2025_secure';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      username,
      role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { userId: string; username: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const secret = process.env.SESSION_SECRET || 'clave_argentina_secret_key_2025_secure';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && data.exp < Date.now()) return null;
    return { userId: data.userId, username: data.username, role: data.role };
  } catch {
    return null;
  }
}
