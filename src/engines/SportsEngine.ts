import { SportsEvent } from '../types';

export interface SportsBetSelection {
  eventId: string;
  eventName: string;
  sport: string;
  selectionKey: 'home' | 'draw' | 'away' | 'over25' | 'under25';
  selectionLabel: string;
  odd: number;
}

export interface SportsTicket {
  id: string;
  timestamp: string;
  type: 'SIMPLE' | 'COMBINADA';
  selections: SportsBetSelection[];
  totalOdds: number;
  betAmount: number;
  potentialPayout: number;
  verificationHash: string;
  status: 'ABIERTO' | 'GANADO' | 'PERDIDO';
}

export class SportsEngine {
  public calculateTotalOdds(selections: SportsBetSelection[]): number {
    if (selections.length === 0) return 0;
    const raw = selections.reduce((acc, curr) => acc * curr.odd, 1);
    return Number(raw.toFixed(2));
  }

  public calculatePotentialPayout(betAmount: number, totalOdds: number): number {
    return Math.round(betAmount * totalOdds);
  }

  public createTicket(
    selections: SportsBetSelection[],
    betAmount: number,
    userId: string,
    serverSeed: string = 'la_clave_sportsbook_salt'
  ): SportsTicket {
    if (selections.length === 0) {
      throw new Error('Debe incluir al menos una selección en la boleta.');
    }
    if (betAmount < 100) {
      throw new Error('La apuesta mínima en deportes es de $100 fichas.');
    }

    const type = selections.length > 1 ? 'COMBINADA' : 'SIMPLE';
    const totalOdds = this.calculateTotalOdds(selections);
    const potentialPayout = this.calculatePotentialPayout(betAmount, totalOdds);

    const ticketId = `TKT-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const hashData = `${ticketId}_${userId}_${betAmount}_${totalOdds}_${serverSeed}`;
    const verificationHash = 'PF-SP-' + Math.abs(this.hashCode(hashData)).toString(16).toUpperCase().padStart(12, '0');

    return {
      id: ticketId,
      timestamp: new Date().toISOString(),
      type,
      selections,
      totalOdds,
      betAmount,
      potentialPayout,
      verificationHash,
      status: 'ABIERTO',
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
