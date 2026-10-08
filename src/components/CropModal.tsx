import React, { useState, useRef } from 'react';
import type { PrintDimensionsConfig } from '../config/printDimensions';
import type { PhotoItem } from '../types';
import { getPreviewCoverStyle } from '../lib/imageCrop';
import { X, Check, ZoomIn, ZoomOut, RotateCcw, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface CropModalProps {
  photo: PhotoItem;
  slotIndex: number;
  config: PrintDimensionsConfig;
  onClose: () => void;
  onSave: (id: string, offsetX: number, offsetY: number, zoom: number) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  photo,
  slotIndex,
  config,
  onClose,
  onSave,
}) => {
  const [offsetX, setOffsetX] = useState(photo.offsetX || 0);
  const [offsetY, setOffsetY] = useState(photo.offsetY || 0);
  const [zoom, setZoom] = useState(photo.zoom || 1.0);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    startOffsetX: number;
    startOffsetY: number;
  }>({
    pointerX: 0,
    pointerY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  const photoAspectRatio = config.PHOTO_WIDTH_MM / config.PHOTO_HEIGHT_MM;

  // Handle Drag Pointer events
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    // Moving pointer by 150px traverses ~100% of the available pan range
    const sensitivity = 0.55;
    const nextX = Math.max(-50, Math.min(50, dragStartRef.current.startOffsetX + dx * sensitivity));
    const nextY = Math.max(-50, Math.min(50, dragStartRef.current.startOffsetY + dy * sensitivity));

    setOffsetX(nextX);
    setOffsetY(nextY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  const handleNudge = (dx: number, dy: number) => {
    setOffsetX((prev) => Math.max(-50, Math.min(50, prev + dx)));
    setOffsetY((prev) => Math.max(-50, Math.min(50, prev + dy)));
  };

  const handleZoomChange = (delta: number) => {
    setZoom((prev) => Math.max(1.0, Math.min(3.0, Math.round((prev + delta) * 100) / 100)));
  };

  const handleReset = () => {
    setOffsetX(0);
    setOffsetY(0);
    setZoom(1.0);
  };

  const handleSaveAndApply = () => {
    onSave(photo.id, offsetX, offsetY, zoom);
    onClose();
  };

  const previewStyle = getPreviewCoverStyle(
    photo.width,
    photo.height,
    photoAspectRatio,
    offsetX,
    offsetY,
    zoom
  );

  return (
    <div className="crop-modal-backdrop" onClick={onClose}>
      <div className="crop-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="crop-modal-header">
          <div className="header-info">
            <h3>Reposition Photo {slotIndex + 1}</h3>
            <p>Drag or use controls to frame your subject perfectly</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Large Interactive Crop Workspace */}
        <div className="crop-modal-stage">
          <div
            className="crop-active-box"
            style={{
              aspectRatio: `${photoAspectRatio}`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* The full original photo, positioned dynamically without gaps */}
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className="crop-active-img"
              draggable={false}
              style={{
                position: 'absolute',
                width: previewStyle.width,
                height: previewStyle.height,
                left: previewStyle.left,
                top: previewStyle.top,
                maxWidth: 'none',
                maxHeight: 'none',
              }}
            />

            {/* Rule of Thirds Guides Overlay */}
            <div className="crop-modal-grid">
              <div className="modal-grid-h line-1" />
              <div className="modal-grid-h line-2" />
              <div className="modal-grid-v line-1" />
              <div className="modal-grid-v line-2" />
            </div>

            <div className="crop-touch-badge">
              <Move size={12} />
              <span>Drag to reposition</span>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="crop-modal-controls">
          {/* Zoom Slider & Buttons */}
          <div className="control-card">
            <span className="control-card-label">Zoom / Scale</span>
            <div className="zoom-bar">
              <button
                type="button"
                className="tool-btn"
                onClick={() => handleZoomChange(-0.15)}
                disabled={zoom <= 1.0}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="zoom-slider"
              />
              <button
                type="button"
                className="tool-btn"
                onClick={() => handleZoomChange(0.15)}
                disabled={zoom >= 3.0}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <span className="zoom-percent">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* D-Pad Pan & Reset */}
          <div className="control-card">
            <span className="control-card-label">Nudge Position</span>
            <div className="dpad-nudge-layout">
              <button
                type="button"
                className="dpad-nudge-btn up"
                onClick={() => handleNudge(0, -10)}
                title="Move Down"
              >
                <ArrowUp size={14} />
              </button>
              <div className="dpad-nudge-row">
                <button
                  type="button"
                  className="dpad-nudge-btn left"
                  onClick={() => handleNudge(-10, 0)}
                  title="Move Right"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  className="dpad-nudge-btn reset"
                  onClick={handleReset}
                  title="Reset position & zoom"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  type="button"
                  className="dpad-nudge-btn right"
                  onClick={() => handleNudge(10, 0)}
                  title="Move Left"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
              <button
                type="button"
                className="dpad-nudge-btn down"
                onClick={() => handleNudge(0, 10)}
                title="Move Up"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="crop-modal-footer">
          <button type="button" className="secondary-button modal-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary-button modal-btn" onClick={handleSaveAndApply}>
            <Check size={18} />
            <span>Apply Reposition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
