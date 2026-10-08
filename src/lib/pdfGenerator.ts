import jsPDF from 'jspdf';
import type { PrintDimensionsConfig } from '../config/printDimensions';
import type { PhotoItem } from '../types';
import { calculateA4Layout } from './a4Layout';
import { renderPolaroidToCanvas } from './polaroidRenderer';

export interface PdfGenerationOptions {
  showCuttingGuides: boolean;
  dpi?: number;
  onProgress?: (step: number, total: number) => void;
}

/**
 * Generates an authoritative, true physical A4 PDF (210 x 297 mm) with the 4 Polaroids.
 * All coordinates and dimensions are strictly in millimeters.
 */
export async function generateA4Pdf(
  photos: PhotoItem[],
  config: PrintDimensionsConfig,
  options: PdfGenerationOptions
): Promise<jsPDF> {
  const { showCuttingGuides, dpi = 300, onProgress } = options;

  // Initialize jsPDF in portrait millimeter mode with exact A4 sheet dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [config.PAGE_WIDTH_MM, config.PAGE_HEIGHT_MM], // 210 x 297 mm
    compress: true,
  });

  const layout = calculateA4Layout(config);

  // Render each photo at 300 DPI canvas, then embed into the exact physical slot on the PDF
  for (let i = 0; i < 4; i++) {
    if (onProgress) {
      onProgress(i + 1, 4);
    }

    const photo = photos[i];
    const slot = layout.slots[i];

    if (photo && slot) {
      // 1. High-resolution canvas render
      const cardCanvas = await renderPolaroidToCanvas(photo, config, dpi);
      const cardDataUrl = cardCanvas.toDataURL('image/jpeg', 0.95);

      // 2. Place on PDF at exact millimeter coordinates
      pdf.addImage(
        cardDataUrl,
        'JPEG',
        slot.xMm,
        slot.yMm,
        slot.widthMm,
        slot.heightMm,
        `polaroid_${i}`,
        'FAST'
      );
    }
  }

  // 3. Render cutting guides if enabled
  if (showCuttingGuides) {
    pdf.setDrawColor(config.CUTTING_GUIDE_COLOR);
    pdf.setLineWidth(config.CUTTING_GUIDE_LINE_WIDTH_MM);
    // 2mm dashed pattern
    pdf.setLineDashPattern(config.CUTTING_GUIDE_DASH_MM, 0);

    // Full-span vertical cutting lines between and around cards
    layout.cuttingGuides.verticals.forEach((x) => {
      pdf.line(x, 0, x, config.PAGE_HEIGHT_MM);
    });

    // Full-span horizontal cutting lines
    layout.cuttingGuides.horizontals.forEach((y) => {
      pdf.line(0, y, config.PAGE_WIDTH_MM, y);
    });

    // Reset dash pattern
    pdf.setLineDashPattern([], 0);
  }

  // Add subtle metadata corner text outside print margins for production reference
  pdf.setFontSize(7);
  pdf.setTextColor(180, 180, 180);
  pdf.text(
    `POLAROID BOOTH • A4 (210×297mm) • Scale: 100% (Actual Size) • Card: ${config.POLAROID_WIDTH_MM}×${config.POLAROID_HEIGHT_MM}mm`,
    10,
    config.PAGE_HEIGHT_MM - 6
  );

  return pdf;
}

/**
 * Utility to download the generated PDF directly to device
 */
export async function downloadA4Pdf(
  photos: PhotoItem[],
  config: PrintDimensionsConfig,
  showCuttingGuides: boolean,
  fileName: string = 'polaroid-booth-a4.pdf'
): Promise<void> {
  const pdf = await generateA4Pdf(photos, config, { showCuttingGuides });
  pdf.save(fileName);
}

/**
 * Utility to trigger browser print dialog using the generated high-quality PDF blob
 */
export async function printA4Pdf(
  photos: PhotoItem[],
  config: PrintDimensionsConfig,
  showCuttingGuides: boolean
): Promise<void> {
  const pdf = await generateA4Pdf(photos, config, { showCuttingGuides });
  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Create an invisible iframe to trigger print reliably on desktop & modern mobile
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = blobUrl;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // Fallback: open in new tab
      window.open(blobUrl, '_blank');
    }
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(blobUrl);
    }, 60000);
  };
}
