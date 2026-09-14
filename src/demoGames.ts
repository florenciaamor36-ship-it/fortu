import { CasinoGame } from './types';

/** Fallback for GitHub Pages: the static demo has no Express /api server. */
export const DEMO_GAMES: CasinoGame[] = [
  {
    id: 'demo-gaucho', title: 'El Gaucho de Oro', subtitle: 'Tragamonedas demo argentino', category: 'slots', provider: 'La Clave Demo',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80', tag: 'HOT', rtp: 96.8, minBet: 100, maxBet: 5000, volatility: 'Alta', lines: 20, skinId: 'slot-gaucho-de-oro',
    description: 'Una máquina de demostración con estética pampeana y fichas virtuales.', features: ['Demo visual', '20 líneas', 'Fichas virtuales'],
  },
  {
    id: 'demo-cleopatra', title: 'Cleopatra Reina del Nilo', subtitle: 'Templo dorado · demo', category: 'slots', provider: 'Royal Demo Studio',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', tag: 'NUEVO', rtp: 96.8, minBet: 100, maxBet: 5000, volatility: 'Media', lines: 20, skinId: 'slot-cleopatra',
    description: 'Concepto egipcio preparado para recibir los assets finales de Cleopatra.', features: ['Wild demo', 'Giros virtuales', 'Assets en preparación'],
  },
  {
    id: 'demo-faraon', title: 'El Faraón del Nilo', subtitle: 'Tesoros de las pirámides · demo', category: 'slots', provider: 'Ancient Demo Studio',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80', tag: 'POPULAR', rtp: 96.8, minBet: 100, maxBet: 5000, volatility: 'Alta', lines: 20, skinId: 'slot-faraon',
    description: 'Máquina de muestra para probar el catálogo y el motor de juego.', features: ['Símbolos egipcios', '20 líneas', 'Modo demo'],
  },
  {
    id: 'demo-sol', title: 'Sol de Mayo 777', subtitle: 'Tragamonedas temática · demo', category: 'slots', provider: 'La Clave Demo',
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=600&q=80', tag: 'JACKPOT', rtp: 96.8, minBet: 100, maxBet: 5000, volatility: 'Muy Alta', lines: 20, skinId: 'slot-sol-de-mayo',
    description: 'Presentación visual de una tragamonedas argentina con fichas virtuales.', features: ['Hold & Win demo', 'Wilds demo', 'Sin premios reales'],
  },
  {
    id: 'demo-ruleta', title: 'Ruleta Criolla Demo', subtitle: 'Mesa virtual de demostración', category: 'ruleta', provider: 'La Clave Demo',
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&w=600&q=80', tag: 'HOT', rtp: 97.3, minBet: 100, maxBet: 5000, volatility: 'Alta',
    description: 'Ruleta visual para probar la navegación y las fichas virtuales.', features: ['Mesa demo', 'Historial local', 'Sin dinero real'],
  },
  {
    id: 'demo-ruleta-europea', title: 'Ruleta Europea Demo', subtitle: 'Mesa clásica · modo demo', category: 'ruleta', provider: 'La Clave Demo',
    thumbnail: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=600&q=80', tag: 'POPULAR', rtp: 97.3, minBet: 100, maxBet: 5000, volatility: 'Media',
    description: 'Versión visual de mesa europea para pruebas de interfaz.', features: ['Un cero visual', 'Fichas demo', 'Sin conexión externa'],
  },
  {
    id: 'demo-bingo', title: 'Gran Bingo Criollo', subtitle: 'Bingo virtual · demo', category: 'bingo', provider: 'La Clave Demo',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80', tag: 'HOT', rtp: 96.5, minBet: 100, maxBet: 1000, volatility: 'Media', skinId: 'bingo-criollo',
    description: 'Bingo de muestra con cartones virtuales y sin premios reales.', features: ['Cartones demo', 'Marcado local', 'Modo prueba'],
  },
  {
    id: 'demo-patagonia', title: 'Bingo Glaciar Patagonia', subtitle: 'Edición austral · demo', category: 'bingo', provider: 'La Clave Demo',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', tag: 'NUEVO', rtp: 96.8, minBet: 100, maxBet: 1000, volatility: 'Alta', skinId: 'bingo-patagonia',
    description: 'Tema patagónico para ampliar el catálogo visual de demostración.', features: ['Cartones demo', 'Tema glaciar', 'Sin apuestas reales'],
  },
];
