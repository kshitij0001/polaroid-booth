import React, { useState, useRef } from 'react';
import type { PrintDimensionsConfig } from '../config/printDimensions';
import type { PhotoItem } from '../types';
import { getPreviewCoverStyle } from '../lib/imageCrop';

interface PolaroidPreviewProps {
  photo: PhotoItem;
  config: PrintDimensionsConfig;
  onUpdateCrop?: (id: string, offsetX: number, offsetY: number, zoom: number) => void;
  isEditable?: boolean;
}

export const PolaroidPreview: React.FC<PolaroidPreviewProps> = ({
  photo,
  config,
  onUpdateCrop,
  isEditable = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialOffsetX: number; initialOffsetY: number }>({
    x: 0,
    y: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
  });

  const cardAspectRatio = config.POLAROID_WIDTH_MM / config.POLAROID_HEIGHT_MM;
  const photoAspectRatio = config.PHOTO_WIDTH_MM / config.PHOTO_HEIGHT_MM;

  // Percentage dimensions inside Polaroid card
  const topBorderPct = (config.TOP_BORDER_MM / config.POLAROID_HEIGHT_MM) * 100;
  const sideBorderPct = (config.SIDE_BORDER_MM / config.POLAROID_WIDTH_MM) * 100;
  const photoWidthPct = (config.PHOTO_WIDTH_MM / config.POLAROID_WIDTH_MM) * 100;
  const photoHeightPct = (config.PHOTO_HEIGHT_MM / config.POLAROID_HEIGHT_MM) * 100;

  // Touch and mouse drag handling for repositioning crop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditable || !onUpdateCrop) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: photo.offsetX || 0,
      initialOffsetY: photo.offsetY || 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !onUpdateCrop) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Convert pixel delta to percentage offset delta (-50 to +50)
    // Moving finger/mouse right shifts image right (reveals left side)
    const sensitivity = 0.5;
    const newOffsetX = Math.max(-50, Math.min(50, dragStartRef.current.initialOffsetX + dx * sensitivity));
    const newOffsetY = Math.max(-50, Math.min(50, dragStartRef.current.initialOffsetY + dy * sensitivity));

    onUpdateCrop(photo.id, newOffsetX, newOffsetY, photo.zoom || 1.0);
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

  const previewStyle = getPreviewCoverStyle(
    photo.width,
    photo.height,
    photoAspectRatio,
    photo.offsetX || 0,
    photo.offsetY || 0,
    photo.zoom || 1.0
  );

  return (
    <div
      className="polaroid-card-frame"
      style={{
        aspectRatio: `${cardAspectRatio}`,
        backgroundColor: config.CARD_BACKGROUND_COLOR || '#ffffff',
      }}
    >
      {/* Photo Cutout Area */}
      <div
        className={`polaroid-photo-window ${isEditable ? 'editable-window' : ''}`}
        style={{
          top: `${topBorderPct}%`,
          left: `${sideBorderPct}%`,
          width: `${photoWidthPct}%`,
          height: `${photoHeightPct}%`,
          aspectRatio: `${photoAspectRatio}`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src={photo.dataUrl}
          alt={photo.name}
          className="polaroid-img"
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
        {isEditable && (
          <div className="crop-drag-overlay">
            <div className="crop-grid-lines">
              <div className="grid-h line-1" />
              <div className="grid-h line-2" />
              <div className="grid-v line-1" />
              <div className="grid-v line-2" />
            </div>
            <div className="crop-drag-hint">
              <span>✦ Drag to reposition</span>
            </div>
          </div>
        )}
      </div>

      {/* Classic Polaroid bottom chin margin */}
      <div className="polaroid-chin-area">
        <div className="polaroid-subtle-emboss" />
      </div>
    </div>
  );
};
