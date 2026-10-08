export interface PhotoItem {
  id: string;
  file?: File;
  dataUrl: string;
  name: string;
  width: number;
  height: number;
  // Offset percentages for crop pan (-50 to 50, 0 is centered)
  offsetX: number;
  offsetY: number;
  zoom: number; // 1.0 = default cover
}

export interface CardSlotPosition {
  index: number;
  col: number; // 0 or 1
  row: number; // 0 or 1
  xMm: number; // mm from page left
  yMm: number; // mm from page top
  widthMm: number;
  heightMm: number;
  photoXMm: number;
  photoYMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
}

export interface CalculatedA4Layout {
  pageWidthMm: number;
  pageHeightMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  slots: CardSlotPosition[];
  cuttingGuides: {
    // Guidelines along card borders for precision cutting
    verticals: number[];   // x-coords across sheet in mm
    horizontals: number[]; // y-coords across sheet in mm
    boxOutlines: { x: number; y: number; w: number; h: number }[];
  };
}
