export interface CoverCropParams {
  srcX: number;
  srcY: number;
  srcWidth: number;
  srcHeight: number;
}

export interface PreviewImageStyle {
  width: string;
  height: string;
  left: string;
  top: string;
}

/**
 * Calculates cover-crop coordinates on the source image canvas.
 * Guaranteed 0 empty space:
 * - baseWidth & baseHeight cover the target window completely.
 * - Zoom enlarges the image / shrinks the source crop box.
 * - srcX and srcY are clamped to [0, imgWidth - srcWidth] and [0, imgHeight - srcHeight].
 * - When there is no room to pan in an axis (e.g. image height matches target height at zoom 1.0),
 *   delta is 0, keeping it perfectly pinned with zero margin or gap.
 */
export function calculateCoverCrop(
  imgWidth: number,
  imgHeight: number,
  targetWidth: number,
  targetHeight: number,
  offsetXPercent: number = 0,
  offsetYPercent: number = 0,
  zoom: number = 1.0
): CoverCropParams {
  const targetAspect = targetWidth / targetHeight;
  const imgAspect = imgWidth / imgHeight;

  let baseWidth: number;
  let baseHeight: number;

  if (imgAspect > targetAspect) {
    // Image is wider than window: fit height, width extends beyond window
    baseHeight = imgHeight;
    baseWidth = imgHeight * targetAspect;
  } else {
    // Image is taller than window: fit width, height extends beyond window
    baseWidth = imgWidth;
    baseHeight = imgWidth / targetAspect;
  }

  // Zoom factor: at zoom >= 1, we capture a smaller window of source pixels
  const effectiveZoom = Math.max(1, zoom);
  const srcWidth = Math.max(1, Math.min(imgWidth, baseWidth / effectiveZoom));
  const srcHeight = Math.max(1, Math.min(imgHeight, baseHeight / effectiveZoom));

  // Max distance the crop box can travel away from center
  const maxDeltaX = (imgWidth - srcWidth) / 2;
  const maxDeltaY = (imgHeight - srcHeight) / 2;

  // offsetXPercent: +50 = panned all the way right (reveal right part, crop window moves left)
  // -50 = panned all the way left
  const normX = Math.max(-50, Math.min(50, offsetXPercent)) / 50;
  const normY = Math.max(-50, Math.min(50, offsetYPercent)) / 50;

  let srcX = (imgWidth - srcWidth) / 2 - normX * maxDeltaX;
  let srcY = (imgHeight - srcHeight) / 2 - normY * maxDeltaY;

  // Strict physical clamps so the crop NEVER exceeds image boundaries
  srcX = Math.max(0, Math.min(Math.max(0, imgWidth - srcWidth), srcX));
  srcY = Math.max(0, Math.min(Math.max(0, imgHeight - srcHeight), srcY));

  return {
    srcX,
    srcY,
    srcWidth,
    srcHeight,
  };
}

/**
 * Calculates absolute CSS position and dimensions for the preview <img>
 * inside the overflow:hidden container.
 * 
 * Mathematically mirrors calculateCoverCrop:
 * The displayed image is guaranteed to cover 100% of the container in all directions
 * with ZERO empty space or white borders, regardless of how much you pan or zoom.
 */
export function getPreviewCoverStyle(
  imgWidth: number,
  imgHeight: number,
  containerAspect: number,
  offsetXPercent: number = 0,
  offsetYPercent: number = 0,
  zoom: number = 1.0
): PreviewImageStyle {
  const imgAspect = imgWidth / imgHeight;
  const effectiveZoom = Math.max(1, zoom);

  let renderWidthPct: number;
  let renderHeightPct: number;

  if (imgAspect > containerAspect) {
    // Wider than window: height is 100% * zoom, width is scaled proportionally
    renderHeightPct = 100 * effectiveZoom;
    renderWidthPct = (100 * (imgAspect / containerAspect)) * effectiveZoom;
  } else {
    // Taller than window: width is 100% * zoom, height is scaled proportionally
    renderWidthPct = 100 * effectiveZoom;
    renderHeightPct = (100 * (containerAspect / imgAspect)) * effectiveZoom;
  }

  // Maximum movable range in container percentage units
  const maxOverflowXPct = Math.max(0, renderWidthPct - 100);
  const maxOverflowYPct = Math.max(0, renderHeightPct - 100);

  // normX: -1 (all the way left) to +1 (all the way right)
  const normX = Math.max(-50, Math.min(50, offsetXPercent)) / 50;
  const normY = Math.max(-50, Math.min(50, offsetYPercent)) / 50;

  // Center position is -maxOverflow / 2
  // Panning right (positive drag) moves the image right (+ delta), revealing the left side
  const leftPct = -maxOverflowXPct / 2 + normX * (maxOverflowXPct / 2);
  const topPct = -maxOverflowYPct / 2 + normY * (maxOverflowYPct / 2);

  // Strict boundary clamps: left cannot exceed 0, and left + renderWidth cannot be < 100
  const clampedLeft = Math.min(0, Math.max(100 - renderWidthPct, leftPct));
  const clampedTop = Math.min(0, Math.max(100 - renderHeightPct, topPct));

  return {
    width: `${renderWidthPct}%`,
    height: `${renderHeightPct}%`,
    left: `${clampedLeft}%`,
    top: `${clampedTop}%`,
  };
}

/**
 * Reads an image file as a Data URL and extracts natural dimensions.
 */
export async function loadImageFromFile(file: File): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo file.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
