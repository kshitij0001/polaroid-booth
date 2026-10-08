/**
 * Physical Print Dimensions & Layout Configuration (in millimeters)
 * 
 * Standard ISO 216 A4 sheet size: 210 x 297 mm
 * 
 * Classic Polaroid Originals / 600 style dimensions:
 * - Frame: ~88 mm width x 107 mm height
 * - Photo Area: ~79 mm width x 79 mm height (1:1 square)
 * - Borders: ~4.5 mm side/top, ~23.5 mm bottom chin
 * 
 * On a 210 x 297 mm A4 sheet in a 2x2 grid:
 * - Total width for 2 Polaroids: 88 * 2 = 176 mm (leaves 34 mm for margins + gutter)
 * - Total height for 2 Polaroids: 107 * 2 = 214 mm (leaves 83 mm for margins + gutter)
 * 
 * All dimensions are defined strictly in millimeters for 100% true physical scale printing.
 */

export interface PrintDimensionsConfig {
  // Page physical dimensions
  PAGE_WIDTH_MM: number;
  PAGE_HEIGHT_MM: number;

  // Individual Polaroid Card physical dimensions
  POLAROID_WIDTH_MM: number;
  POLAROID_HEIGHT_MM: number;

  // Photo area inside the Polaroid frame
  PHOTO_WIDTH_MM: number;
  PHOTO_HEIGHT_MM: number;

  // Border margins inside the Polaroid frame
  TOP_BORDER_MM: number;
  SIDE_BORDER_MM: number;
  BOTTOM_BORDER_MM: number;

  // Spacing between the 4 Polaroids on the A4 page
  GUTTER_X_MM: number;
  GUTTER_Y_MM: number;

  // Visual cutting guide styling
  CUTTING_GUIDE_COLOR: string;
  CUTTING_GUIDE_LINE_WIDTH_MM: number;
  CUTTING_GUIDE_DASH_MM: number[];

  // Polaroids background color
  CARD_BACKGROUND_COLOR: string;
}

export const DEFAULT_PRINT_DIMENSIONS: PrintDimensionsConfig = {
  // A4 Portrait
  PAGE_WIDTH_MM: 210,
  PAGE_HEIGHT_MM: 297,

  // Polaroid Card Size (Classic ~88 x 107 mm)
  POLAROID_WIDTH_MM: 88,
  POLAROID_HEIGHT_MM: 107,

  // Square Photo Window (~79 x 79 mm)
  PHOTO_WIDTH_MM: 79,
  PHOTO_HEIGHT_MM: 79,

  // Borders: 4.5mm top, 4.5mm sides, 23.5mm bottom chin
  TOP_BORDER_MM: 4.5,
  SIDE_BORDER_MM: 4.5,
  BOTTOM_BORDER_MM: 23.5,

  // Gutters between cards on the sheet (centered layout will automatically compute outer margins)
  GUTTER_X_MM: 10,
  GUTTER_Y_MM: 16,

  // Cutting guide configuration
  CUTTING_GUIDE_COLOR: '#b0b5be',
  CUTTING_GUIDE_LINE_WIDTH_MM: 0.25,
  CUTTING_GUIDE_DASH_MM: [2, 2], // 2mm dash, 2mm space

  // Crisp photographic card background
  CARD_BACKGROUND_COLOR: '#ffffff',
};
