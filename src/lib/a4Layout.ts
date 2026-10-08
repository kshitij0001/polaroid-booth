import type { PrintDimensionsConfig } from '../config/printDimensions';
import type { CalculatedA4Layout, CardSlotPosition } from '../types';

/**
 * Calculates exact physical coordinates (in millimeters) for a 2x2 grid of Polaroids on an A4 sheet.
 * Perfectly balances and centers the margins horizontally and vertically.
 */
export function calculateA4Layout(config: PrintDimensionsConfig): CalculatedA4Layout {
  const {
    PAGE_WIDTH_MM,
    PAGE_HEIGHT_MM,
    POLAROID_WIDTH_MM,
    POLAROID_HEIGHT_MM,
    PHOTO_WIDTH_MM,
    PHOTO_HEIGHT_MM,
    TOP_BORDER_MM,
    SIDE_BORDER_MM,
    GUTTER_X_MM,
    GUTTER_Y_MM,
  } = config;

  // Total width of the 2-column block
  const totalGridWidthMm = POLAROID_WIDTH_MM * 2 + GUTTER_X_MM;
  // Total height of the 2-row block
  const totalGridHeightMm = POLAROID_HEIGHT_MM * 2 + GUTTER_Y_MM;

  // Center on A4 page
  const marginLeftMm = Math.max(0, (PAGE_WIDTH_MM - totalGridWidthMm) / 2);
  const marginTopMm = Math.max(0, (PAGE_HEIGHT_MM - totalGridHeightMm) / 2);

  const slots: CardSlotPosition[] = [];

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const index = row * 2 + col;
      const xMm = marginLeftMm + col * (POLAROID_WIDTH_MM + GUTTER_X_MM);
      const yMm = marginTopMm + row * (POLAROID_HEIGHT_MM + GUTTER_Y_MM);

      const photoXMm = xMm + SIDE_BORDER_MM;
      const photoYMm = yMm + TOP_BORDER_MM;

      slots.push({
        index,
        col,
        row,
        xMm,
        yMm,
        widthMm: POLAROID_WIDTH_MM,
        heightMm: POLAROID_HEIGHT_MM,
        photoXMm,
        photoYMm,
        photoWidthMm: PHOTO_WIDTH_MM,
        photoHeightMm: PHOTO_HEIGHT_MM,
      });
    }
  }

  // Calculate cut guidelines (along boundaries of each card)
  const verticalCutLines = new Set<number>();
  const horizontalCutLines = new Set<number>();
  const boxOutlines: { x: number; y: number; w: number; h: number }[] = [];

  slots.forEach((s) => {
    verticalCutLines.add(s.xMm);
    verticalCutLines.add(s.xMm + s.widthMm);
    horizontalCutLines.add(s.yMm);
    horizontalCutLines.add(s.yMm + s.heightMm);
    boxOutlines.push({
      x: s.xMm,
      y: s.yMm,
      w: s.widthMm,
      h: s.heightMm,
    });
  });

  return {
    pageWidthMm: PAGE_WIDTH_MM,
    pageHeightMm: PAGE_HEIGHT_MM,
    marginLeftMm,
    marginTopMm,
    slots,
    cuttingGuides: {
      verticals: Array.from(verticalCutLines).sort((a, b) => a - b),
      horizontals: Array.from(horizontalCutLines).sort((a, b) => a - b),
      boxOutlines,
    },
  };
}
