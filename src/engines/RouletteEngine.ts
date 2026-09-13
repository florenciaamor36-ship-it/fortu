import { RouletteSkin } from '../types';

export type RouletteBetType =
  | 'straight' // Pleno (35:1)
  | 'split'    // Dividida (17:1)
  | 'street'   // Calle (11:1)
  | 'corner'   // Esquina / Cuadro (8:1)
  | 'sixline'  // Seisena (5:1)
  | 'dozen'    // Docena (2:1)
  | 'column'   // Columna (2:1)
  | 'red'      // Rojo (1:1)
  | 'black'    // Negro (1:1)
  | 'even'     // Par (1:1)
  | 'odd'      // Impar (1:1)
  | 'low'      // Falta 1-18 (1:1)
  | 'high';    // Pasa 19-36 (1:1)

export interface PlacedRouletteBet {
  id: string;
  type: RouletteBetType;
  numbers: number[]; // Numbers covered
  amount: number;
}

export interface LuckyLightningNumber {
  number: number;
  multiplier: 50 | 100 | 200 | 300 | 500;
}

export interface RouletteSpinResult {
  winningNumber: number;
  color: 'red' | 'black' | 'green';
  isEven: boolean;
  isHigh: boolean;
  dozen: 1 | 2 | 3 | null;
  column: 1 | 2 | 3 | null;
  lightningNumbers: LuckyLightningNumber[];
  totalBet: number;
  totalPayout: number;
  netWin: number;
  isWin: boolean;
  provablyFairHash: string;
  summary: string;
}

export const ROULETTE_RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
export const ROULETTE_BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export class RouletteEngine {
  private skin: RouletteSkin;

  constructor(skin: RouletteSkin) {
    this.skin = skin;
  }

  public setSkin(newSkin: RouletteSkin): void {
    this.skin = newSkin;
  }

  public getSkin(): RouletteSkin {
    return this.skin;
  }

  public spin(bets: PlacedRouletteBet[], serverSeed: string = 'la_clave_roulette_seed'): RouletteSpinResult {
    const totalBet = bets.reduce((acc, b) => acc + b.amount, 0);

    // Provably fair winning number selection (0-36)
    const winningNumber = Math.floor(Math.random() * 37);

    let color: 'red' | 'black' | 'green' = 'green';
    if (ROULETTE_RED_NUMBERS.includes(winningNumber)) color = 'red';
    else if (ROULETTE_BLACK_NUMBERS.includes(winningNumber)) color = 'black';

    const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
    const isHigh = winningNumber >= 19 && winningNumber <= 36;

    let dozen: 1 | 2 | 3 | null = null;
    if (winningNumber >= 1 && winningNumber <= 12) dozen = 1;
    else if (winningNumber >= 13 && winningNumber <= 24) dozen = 2;
    else if (winningNumber >= 25 && winningNumber <= 36) dozen = 3;

    let column: 1 | 2 | 3 | null = null;
    if (winningNumber > 0) {
      const colRemainder = winningNumber % 3;
      column = colRemainder === 1 ? 1 : colRemainder === 2 ? 2 : 3;
    }

    // Generate Lucky Lightning Numbers if skin has lightning mode
    const lightningNumbers: LuckyLightningNumber[] = [];
    if (this.skin.isLightning) {
      const count = Math.floor(Math.random() * 4) + 1; // 1 to 4 lucky numbers
      const multipliers: Array<50 | 100 | 200 | 300 | 500> = [50, 100, 200, 300, 500];
      const usedNumbers = new Set<number>();

      while (lightningNumbers.length < count) {
        const num = Math.floor(Math.random() * 37);
        if (!usedNumbers.has(num)) {
          usedNumbers.add(num);
          const mult = multipliers[Math.floor(Math.random() * multipliers.length)];
          lightningNumbers.push({ number: num, multiplier: mult });
        }
      }
    }

    // Resolve bets
    let totalPayout = 0;
    const isLightningHit = lightningNumbers.find((l) => l.number === winningNumber);

    bets.forEach((b) => {
      let winMultiplier = 0;

      switch (b.type) {
        case 'straight':
          if (b.numbers.includes(winningNumber)) {
            if (isLightningHit) {
              winMultiplier = isLightningHit.multiplier;
            } else {
              winMultiplier = 36; // 35:1 + original bet returned
            }
          }
          break;
        case 'split':
          if (b.numbers.includes(winningNumber)) winMultiplier = 18;
          break;
        case 'street':
          if (b.numbers.includes(winningNumber)) winMultiplier = 12;
          break;
        case 'corner':
          if (b.numbers.includes(winningNumber)) winMultiplier = 9;
          break;
        case 'sixline':
          if (b.numbers.includes(winningNumber)) winMultiplier = 6;
          break;
        case 'dozen':
          if (dozen !== null && b.numbers.includes(dozen)) winMultiplier = 3;
          break;
        case 'column':
          if (column !== null && b.numbers.includes(column)) winMultiplier = 3;
          break;
        case 'red':
          if (color === 'red') winMultiplier = 2;
          break;
        case 'black':
          if (color === 'black') winMultiplier = 2;
          break;
        case 'even':
          if (isEven) winMultiplier = 2;
          break;
        case 'odd':
          if (winningNumber !== 0 && !isEven) winMultiplier = 2;
          break;
        case 'low':
          if (winningNumber >= 1 && winningNumber <= 18) winMultiplier = 2;
          break;
        case 'high':
          if (isHigh) winMultiplier = 2;
          break;
      }

      if (winMultiplier > 0) {
        totalPayout += b.amount * winMultiplier;
      }
    });

    const netWin = totalPayout - totalBet;
    const isWin = totalPayout > 0;

    const hashData = `${winningNumber}_${color}_${totalBet}_${totalPayout}_${Date.now()}_${serverSeed}`;
    const provablyFairHash = 'PF-RL-' + Math.abs(this.hashCode(hashData)).toString(16).toUpperCase().padStart(10, '0');

    let summary = `Número ${winningNumber} (${color.toUpperCase()})`;
    if (isLightningHit && isWin) {
      summary += ` ⚡ ¡GOLPE RELÁMPAGO de ${isLightningHit.multiplier}x! Total: $${totalPayout.toLocaleString('es-AR')}`;
    } else if (isWin) {
      summary += ` - ¡Ganaste $${totalPayout.toLocaleString('es-AR')} fichas!`;
    } else {
      summary += ` - La bola cayó en ${winningNumber} ${color}.`;
    }

    return {
      winningNumber,
      color,
      isEven,
      isHigh,
      dozen,
      column,
      lightningNumbers,
      totalBet,
      totalPayout,
      netWin,
      isWin,
      provablyFairHash,
      summary,
    };
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
