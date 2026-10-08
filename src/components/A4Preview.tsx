import React from 'react';
import type { PrintDimensionsConfig } from '../config/printDimensions';
import type { PhotoItem } from '../types';
import { calculateA4Layout } from '../lib/a4Layout';
import { PolaroidPreview } from './PolaroidPreview';
import { SlidersHorizontal } from 'lucide-react';

interface A4PreviewProps {
  photos: PhotoItem[];
  config: PrintDimensionsConfig;
  showCuttingGuides: boolean;
  onSelectPhotoToEdit?: (index: number) => void;
}

export const A4Preview: React.FC<A4PreviewProps> = ({
  photos,
  config,
  showCuttingGuides,
  onSelectPhotoToEdit,
}) => {
  const layout = calculateA4Layout(config);
  const a4AspectRatio = config.PAGE_WIDTH_MM / config.PAGE_HEIGHT_MM; // 210 / 297 ≈ 0.707

  return (
    <div className="a4-sheet-container">
      <div className="a4-sheet-wrapper">
        {/* Physical A4 Sheet simulation */}
        <div
          className="a4-sheet-paper"
          style={{
            aspectRatio: `${a4AspectRatio}`,
          }}
          id="a4-preview-sheet"
        >
          {/* Subtle paper grain & physical measurement indicator */}
          <div className="a4-watermark">
            <span>A4 • 210 × 297 mm</span>
          </div>

          {/* Cutting Guides Overlay */}
          {showCuttingGuides && (
            <div className="cutting-guides-layer">
              {/* Full-bleed vertical dashed lines */}
              {layout.cuttingGuides.verticals.map((x, i) => (
                <div
                  key={`v-${i}`}
                  className="guide-line vertical"
                  style={{
                    left: `${(x / config.PAGE_WIDTH_MM) * 100}%`,
                  }}
                />
              ))}

              {/* Full-bleed horizontal dashed lines */}
              {layout.cuttingGuides.horizontals.map((y, i) => (
                <div
                  key={`h-${i}`}
                  className="guide-line horizontal"
                  style={{
                    top: `${(y / config.PAGE_HEIGHT_MM) * 100}%`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 4 Polaroid Cards placed at exact physical positions */}
          {layout.slots.map((slot) => {
            const photo = photos[slot.index];
            if (!photo) return null;

            return (
              <div
                key={`slot-${slot.index}`}
                className="a4-polaroid-slot interactive-sheet-slot"
                style={{
                  left: `${(slot.xMm / config.PAGE_WIDTH_MM) * 100}%`,
                  top: `${(slot.yMm / config.PAGE_HEIGHT_MM) * 100}%`,
                  width: `${(slot.widthMm / config.PAGE_WIDTH_MM) * 100}%`,
                  height: `${(slot.heightMm / config.PAGE_HEIGHT_MM) * 100}%`,
                }}
                onClick={() => onSelectPhotoToEdit?.(slot.index)}
                title={`Photo ${slot.index + 1} • Tap to reposition`}
              >
                <PolaroidPreview
                  photo={photo}
                  config={config}
                  isEditable={false}
                />
                <button
                  type="button"
                  className="slot-quick-edit-indicator"
                  aria-label={`Reposition Photo ${slot.index + 1}`}
                >
                  <SlidersHorizontal size={10} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sheet-caption">
        <span>Exact 2×2 layout • Tap any photo to reposition & zoom</span>
      </div>
    </div>
  );
};
