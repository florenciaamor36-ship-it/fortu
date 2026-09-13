import { BingoSkin } from '../types';

export interface BingoCardCell {
  number: number;
  isFree?: boolean;
  isMarked: boolean;
}

export type BingoPattern =
  | 'LINEA_HORIZONTAL'
  | 'LINEA_VERTICAL'
  | 'DIAGONAL'
  | 'CUATRO_ESQUINAS'
  | 'CARTON_LLENO';

export interface BingoRoundResult {
  card: BingoCardCell[][]; // 5x5
  drawnBalls: number[];
  hitNumbers: number[];
  completedPatterns: BingoPattern[];
  isBingo: boolean;
  totalPayout: number;
  multiplier: number;
  provablyFairHash: string;
  summary: string;
}

export class BingoEngine {
  private skin: BingoSkin;
  private maxBalls: number;

  constructor(skin: BingoSkin) {
    this.skin = skin;
    this.maxBalls = skin.ballsCount || 75;
  }

  public setSkin(newSkin: BingoSkin): void {
    this.skin = newSkin;
    this.maxBalls = newSkin.ballsCount || 75;
  }

  public getSkin(): BingoSkin {
    return this.skin;
  }

  /**
   * Generates a standard authentic 5x5 75-ball Bingo card
   */
  public generateCard(): BingoCardCell[][] {
    const card: BingoCardCell[][] = [];

    // Columns ranges: B (1-15), I (16-30), N (31-45), G (46-60), O (61-75)
    const ranges = [
      { min: 1, max: 15 },
      { min: 16, max: 30 },
      { min: 31, max: 45 },
      { min: 46, max: 60 },
      { min: 61, max: 75 },
    ];

    for (let c = 0; c < 5; c++) {
      const colNumbers: number[] = [];
      const pool: number[] = [];
      for (let n = ranges[c].min; n <= ranges[c].max; n++) {
        pool.push(n);
      }

      // Pick 5 unique numbers for this column
      for (let r = 0; r < 5; r++) {
        const idx = Math.floor(Math.random() * pool.length);
        colNumbers.push(pool.splice(idx, 1)[0]);
      }
      colNumbers.sort((a, b) => a - b);

      const colCells: BingoCardCell[] = colNumbers.map((num, r) => {
        if (c === 2 && r === 2) {
          return { number: 0, isFree: true, isMarked: true }; // Center FREE
        }
        return { number: num, isMarked: false };
      });

      card.push(colCells);
    }

    return card;
  }

  /**
   * Simulates a round extracting 35 balls out of 75
   */
  public playRound(
    cardInput: BingoCardCell[][],
    betAmount: number,
    ballsToDraw: number = 35,
    serverSeed: string = 'la_clave_bingo_seed'
  ): BingoRoundResult {
    // Clone card
    const card = cardInput.map((col) => col.map((cell) => ({ ...cell })));

    // Generate random drum of unique balls
    const drum: number[] = [];
    for (let i = 1; i <= this.maxBalls; i++) drum.push(i);

    const drawnBalls: number[] = [];
    for (let i = 0; i < ballsToDraw; i++) {
      const idx = Math.floor(Math.random() * drum.length);
      drawnBalls.push(drum.splice(idx, 1)[0]);
    }

    // Mark card hits
    const hitNumbers: number[] = [];
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        const cell = card[c][r];
        if (cell.isFree || drawnBalls.includes(cell.number)) {
          cell.isMarked = true;
          if (!cell.isFree) hitNumbers.push(cell.number);
        }
      }
    }

    // Check patterns
    const completedPatterns: BingoPattern[] = [];

    // 1. Horizontal lines (rows)
    for (let r = 0; r < 5; r++) {
      let isRowFull = true;
      for (let c = 0; c < 5; c++) {
        if (!card[c][r].isMarked) {
          isRowFull = false;
          break;
        }
      }
      if (isRowFull) completedPatterns.push('LINEA_HORIZONTAL');
    }

    // 2. Vertical lines (columns)
    for (let c = 0; c < 5; c++) {
      let isColFull = true;
      for (let r = 0; r < 5; r++) {
        if (!card[c][r].isMarked) {
          isColFull = false;
          break;
        }
      }
      if (isColFull) completedPatterns.push('LINEA_VERTICAL');
    }

    // 3. Diagonals
    let diag1 = true;
    let diag2 = true;
    for (let i = 0; i < 5; i++) {
      if (!card[i][i].isMarked) diag1 = false;
      if (!card[i][4 - i].isMarked) diag2 = false;
    }
    if (diag1 || diag2) completedPatterns.push('DIAGONAL');

    // 4. Four corners
    if (
      card[0][0].isMarked &&
      card[4][0].isMarked &&
      card[0][4].isMarked &&
      card[4][4].isMarked
    ) {
      completedPatterns.push('CUATRO_ESQUINAS');
    }

    // 5. Full card (BINGO)
    let isBingo = true;
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 5; r++) {
        if (!card[c][r].isMarked) {
          isBingo = false;
          break;
        }
      }
    }
    if (isBingo) completedPatterns.push('CARTON_LLENO');

    // Calculate payouts
    let multiplier = 0;
    if (isBingo) {
      multiplier += 200; // Gran Bingo
    } else {
      if (completedPatterns.includes('CUATRO_ESQUINAS')) multiplier += 3;
      if (completedPatterns.includes('DIAGONAL')) multiplier += 5;
      const hLines = completedPatterns.filter((p) => p === 'LINEA_HORIZONTAL').length;
      multiplier += hLines * 10;
      const vLines = completedPatterns.filter((p) => p === 'LINEA_VERTICAL').length;
      multiplier += vLines * 8;
    }

    const totalPayout = Math.round(betAmount * multiplier);

    const hashData = `${hitNumbers.join('-')}_${drawnBalls.length}_${totalPayout}_${Date.now()}_${serverSeed}`;
    const provablyFairHash = 'PF-BG-' + Math.abs(this.hashCode(hashData)).toString(16).toUpperCase().padStart(10, '0');

    let summary = '';
    if (isBingo) {
      summary = `¡¡¡BIIINGO COMPLETO!!! Premio Monumental de $${totalPayout.toLocaleString('es-AR')} fichas!`;
    } else if (multiplier > 0) {
      summary = `¡Premio de Línea/Patrón! ${completedPatterns.join(', ')} -> $${totalPayout.toLocaleString('es-AR')} (${multiplier}x)`;
    } else {
      summary = `Extracción terminada (${hitNumbers.length} aciertos). ¡Muy cerca de completar la línea!`;
    }

    return {
      card,
      drawnBalls,
      hitNumbers,
      completedPatterns,
      isBingo,
      totalPayout,
      multiplier,
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
