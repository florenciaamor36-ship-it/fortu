/**
 * Cableado preparado para conectar el procesador de medios cuando exista backend.
 * Esta capa no ejecuta conversiones por sí sola: define contratos y evita acoplar
 * la interfaz a un proveedor concreto (Sharp, FFmpeg, Web Audio o almacenamiento).
 */
export type MediaKind = 'image' | 'video' | 'audio';

export interface MediaAssetInput {
  gameId: string;
  folder: string;
  kind: MediaKind;
  sourceKey: string;
  options: {
    crop?: { width: number; height: number; offset: number; backgroundTolerance: number };
    video?: { start: number; end: number; output: 'webm' | 'spritesheet' | 'mp4'; extractFrames: boolean };
    audio?: { start: number; end: number; volume: number; loop: boolean; format: 'mp3' | 'ogg' | 'wav' };
  };
}

export interface ProcessedMediaAsset {
  id: string;
  gameId: string;
  folder: string;
  kind: MediaKind;
  sourceKey: string;
  outputKey: string;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  metadata?: Record<string, string | number | boolean>;
  error?: string;
}

export interface MediaProcessor {
  enqueue(input: MediaAssetInput): Promise<ProcessedMediaAsset>;
  getStatus(id: string): Promise<ProcessedMediaAsset | null>;
}

/** Adaptador temporal: deja claro dónde conectar S3/Supabase Storage + FFmpeg/Sharp. */
export class PendingMediaProcessor implements MediaProcessor {
  async enqueue(input: MediaAssetInput): Promise<ProcessedMediaAsset> {
    return {
      id: `pending-${Date.now()}`,
      gameId: input.gameId,
      folder: input.folder,
      kind: input.kind,
      sourceKey: input.sourceKey,
      outputKey: `${input.folder}/${input.sourceKey}`,
      status: 'queued',
    };
  }

  async getStatus(_id: string): Promise<ProcessedMediaAsset | null> {
    return null;
  }
}
