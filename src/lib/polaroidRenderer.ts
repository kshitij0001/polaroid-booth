import type { PrintDimensionsConfig } from '../config/printDimensions';
import type { PhotoItem } from '../types';
import { calculateCoverCrop } from './imageCrop';

/**
 * Renders a single Polaroid card onto an offscreen canvas at specified DPI.
 * Standard print resolution: 300 DPI.
 */
export async function renderPolaroidToCanvas(
  photo: PhotoItem,
  config: PrintDimensionsConfig,
  dpi: number = 300
): Promise<HTMLCanvasElement> {
  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

  const cardWidthPx = mmToPx(config.POLAROID_WIDTH_MM);
  const cardHeightPx = mmToPx(config.POLAROID_HEIGHT_MM);

  const photoWidthPx = mmToPx(config.PHOTO_WIDTH_MM);
  const photoHeightPx = mmToPx(config.PHOTO_HEIGHT_MM);

  const topBorderPx = mmToPx(config.TOP_BORDER_MM);
  const sideBorderPx = mmToPx(config.SIDE_BORDER_MM);

  const canvas = document.createElement('canvas');
  canvas.width = cardWidthPx;
  canvas.height = cardHeightPx;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Draw solid polaroid background
  ctx.fillStyle = config.CARD_BACKGROUND_COLOR || '#ffffff';
  ctx.fillRect(0, 0, cardWidthPx, cardHeightPx);

  // 2. Load image element
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error('Failed to load image for rendering: ' + e));
    el.src = photo.dataUrl;
  });

  // 3. Compute crop
  const crop = calculateCoverCrop(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    photoWidthPx,
    photoHeightPx,
    photo.offsetX || 0,
    photo.offsetY || 0,
    photo.zoom || 1.0
  );

  // 4. Draw photo in target window
  ctx.save();
  // Clip to exact photo area
  ctx.beginPath();
  ctx.rect(sideBorderPx, topBorderPx, photoWidthPx, photoHeightPx);
  ctx.clip();

  ctx.drawImage(
    img,
    crop.srcX,
    crop.srcY,
    crop.srcWidth,
    crop.srcHeight,
    sideBorderPx,
    topBorderPx,
    photoWidthPx,
    photoHeightPx
  );
  ctx.restore();

  // Subtle inner border around the photo (mimicking true photographic dye well)
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = Math.max(1, Math.round(dpi / 300));
  ctx.strokeRect(sideBorderPx, topBorderPx, photoWidthPx, photoHeightPx);

  return canvas;
}
