import React, { useRef } from 'react';
import { AlertCircle, ImagePlus } from 'lucide-react';
import { DEFAULT_PRINT_DIMENSIONS } from '../config/printDimensions';
import { calculateA4Layout } from '../lib/a4Layout';

interface PhotoPickerProps {
  onPhotosSelected: (files: File[]) => void;
  error?: string | null;
  isLoading?: boolean;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  onPhotosSelected,
  error,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layout = calculateA4Layout(DEFAULT_PRINT_DIMENSIONS);
  const config = DEFAULT_PRINT_DIMENSIONS;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onPhotosSelected(selectedFiles);
    }
    e.target.value = '';
  };

  const handleTrigger = () => {
    fileInputRef.current?.click();
  };

  // Percentage dimensions inside each Polaroid card
  const topBorderPct = (config.TOP_BORDER_MM / config.POLAROID_HEIGHT_MM) * 100;
  const sideBorderPct = (config.SIDE_BORDER_MM / config.POLAROID_WIDTH_MM) * 100;
  const photoWidthPct = (config.PHOTO_WIDTH_MM / config.POLAROID_WIDTH_MM) * 100;
  const photoHeightPct = (config.PHOTO_HEIGHT_MM / config.POLAROID_HEIGHT_MM) * 100;

  return (
    <div className="landing-screen">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
          width: '1px',
          height: '1px',
        }}
        onChange={handleFileChange}
        id="hidden-file-picker"
      />

      <div className="landing-hero-block">
        <h1 className="landing-heading">POLAROID BOOTH</h1>
        <p className="landing-subheading">
          Turn 4 photos into printable Polaroids arranged on an A4 sheet.
        </p>
      </div>

      {/* Central Interactive A4 Print Sheet (mathematically aligned to real A4 coordinates) */}
      <div 
        className="a4-interactive-stage"
        onClick={handleTrigger}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTrigger();
          }
        }}
      >
        <div className="stage-top-meta">
          <span>A4 • 210 × 297 mm</span>
        </div>

        {/* Real physical cutting guides */}
        <div className="stage-cutting-guides">
          {layout.cuttingGuides.verticals.map((x, i) => (
            <div
              key={`v-${i}`}
              className="stage-guide-line vertical"
              style={{ left: `${(x / config.PAGE_WIDTH_MM) * 100}%` }}
            />
          ))}
          {layout.cuttingGuides.horizontals.map((y, i) => (
            <div
              key={`h-${i}`}
              className="stage-guide-line horizontal"
              style={{ top: `${(y / config.PAGE_HEIGHT_MM) * 100}%` }}
            />
          ))}
        </div>

        {/* 4 Polaroid Cards placed at EXACT physical mm percentages */}
        {layout.slots.map((slot) => (
          <div
            key={`slot-${slot.index}`}
            className="stage-polaroid-card"
            style={{
              left: `${(slot.xMm / config.PAGE_WIDTH_MM) * 100}%`,
              top: `${(slot.yMm / config.PAGE_HEIGHT_MM) * 100}%`,
              width: `${(slot.widthMm / config.PAGE_WIDTH_MM) * 100}%`,
              height: `${(slot.heightMm / config.PAGE_HEIGHT_MM) * 100}%`,
            }}
          >
            <div
              className="stage-photo-window"
              style={{
                top: `${topBorderPct}%`,
                left: `${sideBorderPct}%`,
                width: `${photoWidthPct}%`,
                height: `${photoHeightPct}%`,
              }}
            >
              <span className="stage-slot-index">0{slot.index + 1}</span>
            </div>
            <div className="stage-card-chin" />
          </div>
        ))}

        {/* Centered CTA Pill */}
        <div className="stage-cta-wrapper">
          <div className="stage-cta-button">
            <ImagePlus size={18} strokeWidth={2.2} />
            <span>{isLoading ? 'Processing Photos…' : 'SELECT 4 PHOTOS'}</span>
          </div>
          <span className="stage-cta-helper">Click anywhere to choose photos</span>
        </div>
      </div>

      {error && (
        <div className="landing-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="landing-specs-row">
        <span>True Physical Scale</span>
        <span className="spec-bullet">•</span>
        <span>Automatic Cover Crop</span>
        <span className="spec-bullet">•</span>
        <span>Cutting Guides</span>
      </div>
    </div>
  );
};
