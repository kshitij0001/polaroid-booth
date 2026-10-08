import React, { useRef } from 'react';
import type { PrintDimensionsConfig } from '../config/printDimensions';
import type { PhotoItem } from '../types';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';
import { PolaroidPreview } from './PolaroidPreview';

interface PhotoSlotProps {
  slotIndex: number;
  photo: PhotoItem;
  config: PrintDimensionsConfig;
  onReplacePhoto: (slotIndex: number, newFile: File) => void;
  onOpenAdjustModal: () => void;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({
  slotIndex,
  photo,
  config,
  onReplacePhoto,
  onOpenAdjustModal,
}) => {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onReplacePhoto(slotIndex, e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="photo-slot-card">
      <input
        type="file"
        ref={replaceInputRef}
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="hidden-file-input"
        onChange={handleFileChange}
        id={`replace-input-${slotIndex}`}
      />

      <div className="slot-header">
        <span className="slot-badge">PHOTO {slotIndex + 1}</span>
        <div className="slot-actions">
          <button
            type="button"
            className="action-btn text-btn highlight"
            onClick={onOpenAdjustModal}
            title="Open reposition and zoom editor"
            id={`adjust-btn-${slotIndex}`}
          >
            <SlidersHorizontal size={14} />
            <span>Reposition</span>
          </button>
          <button
            type="button"
            className="action-btn text-btn"
            onClick={() => replaceInputRef.current?.click()}
            title="Replace this photo"
            id={`replace-btn-${slotIndex}`}
          >
            <RefreshCw size={14} />
            <span>Replace</span>
          </button>
        </div>
      </div>

      <div
        className="slot-preview-wrapper clickable-slot-preview"
        onClick={onOpenAdjustModal}
        title="Tap to reposition or zoom"
      >
        <PolaroidPreview
          photo={photo}
          config={config}
          isEditable={false}
        />
        <div className="slot-hover-reposition-badge">
          <SlidersHorizontal size={12} />
          <span>Tap to Reposition</span>
        </div>
      </div>
    </div>
  );
};
