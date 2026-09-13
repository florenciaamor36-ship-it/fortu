import { SlotSkin, RouletteSkin, BingoSkin } from '../types';
import { slotFaraonSkin } from './slots/skins/slot-faraon/skin.config';
import { slotCleopatraSkin } from './slots/skins/slot-cleopatra/skin.config';
import { slotDuendesSkin } from './slots/skins/slot-duendes/skin.config';
import { slotGauchoDeOroSkin } from './slots/skins/slot-gaucho-de-oro/skin.config';
import { slotSolDeMayoSkin } from './slots/skins/slot-sol-de-mayo/skin.config';
import { ruletaRelampagoSkin } from './roulette/skins/ruleta-relampago/skin.config';
import { ruletaPortenaVipSkin } from './roulette/skins/ruleta-portena-vip/skin.config';
import { bingoCriolloSkin } from './bingo/skins/bingo-criollo/skin.config';
import { bingoPatagoniaSkin } from './bingo/skins/bingo-patagonia/skin.config';

export class SkinRegistry {
  private static slotSkins: Map<string, SlotSkin> = new Map([
    [slotGauchoDeOroSkin.id, slotGauchoDeOroSkin],
    [slotFaraonSkin.id, slotFaraonSkin],
    [slotCleopatraSkin.id, slotCleopatraSkin],
    [slotDuendesSkin.id, slotDuendesSkin],
    [slotSolDeMayoSkin.id, slotSolDeMayoSkin],
  ]);

  private static rouletteSkins: Map<string, RouletteSkin> = new Map([
    [ruletaRelampagoSkin.id, ruletaRelampagoSkin],
    [ruletaPortenaVipSkin.id, ruletaPortenaVipSkin],
  ]);

  private static bingoSkins: Map<string, BingoSkin> = new Map([
    [bingoCriolloSkin.id, bingoCriolloSkin],
    [bingoPatagoniaSkin.id, bingoPatagoniaSkin],
  ]);

  // Slot Skins
  public static getSlotSkin(id: string): SlotSkin {
    return this.slotSkins.get(id) || slotGauchoDeOroSkin;
  }

  public static getAllSlotSkins(): SlotSkin[] {
    return Array.from(this.slotSkins.values());
  }

  public static registerSlotSkin(skin: SlotSkin): void {
    this.slotSkins.set(skin.id, skin);
  }

  // Roulette Skins
  public static getRouletteSkin(id: string): RouletteSkin {
    return this.rouletteSkins.get(id) || ruletaRelampagoSkin;
  }

  public static getAllRouletteSkins(): RouletteSkin[] {
    return Array.from(this.rouletteSkins.values());
  }

  public static registerRouletteSkin(skin: RouletteSkin): void {
    this.rouletteSkins.set(skin.id, skin);
  }

  // Bingo Skins
  public static getBingoSkin(id: string): BingoSkin {
    return this.bingoSkins.get(id) || bingoCriolloSkin;
  }

  public static getAllBingoSkins(): BingoSkin[] {
    return Array.from(this.bingoSkins.values());
  }

  public static registerBingoSkin(skin: BingoSkin): void {
    this.bingoSkins.set(skin.id, skin);
  }
}
