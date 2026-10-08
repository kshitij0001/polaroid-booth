import React, { useState } from 'react';
import { DEFAULT_PRINT_DIMENSIONS, type PrintDimensionsConfig } from '../config/printDimensions';
import { X, RotateCcw, Save } from 'lucide-react';

interface DimensionsModalProps {
  config: PrintDimensionsConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: PrintDimensionsConfig) => void;
}

export const DimensionsModal: React.FC<DimensionsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PrintDimensionsConfig>({ ...config });

  if (!isOpen) return null;

  const handleChange = (field: keyof PrintDimensionsConfig, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value,
    }));
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_PRINT_DIMENSIONS });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Physical Print Calibration</h3>
            <p className="modal-subtitle">Fine-tune millimeter measurements after physical test prints</p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="dimensions-form">
          <div className="form-section">
            <h4>Polaroid Card Outer Dimensions (mm)</h4>
            <div className="form-row">
              <label>
                Width (mm)
                <input
                  type="number"
                  step="0.5"
                  value={formData.POLAROID_WIDTH_MM}
                  onChange={(e) => handleChange('POLAROID_WIDTH_MM', parseFloat(e.target.value))}
                />
              </label>
              <label>
                Height (mm)
                <input
                  type="number"
                  step="0.5"
                  value={formData.POLAROID_HEIGHT_MM}
                  onChange={(e) => handleChange('POLAROID_HEIGHT_MM', parseFloat(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4>Photo Window Dimensions (mm)</h4>
            <div className="form-row">
              <label>
                Photo Width (mm)
                <input
                  type="number"
                  step="0.5"
                  value={formData.PHOTO_WIDTH_MM}
                  onChange={(e) => handleChange('PHOTO_WIDTH_MM', parseFloat(e.target.value))}
                />
              </label>
              <label>
                Photo Height (mm)
                <input
                  type="number"
                  step="0.5"
                  value={formData.PHOTO_HEIGHT_MM}
                  onChange={(e) => handleChange('PHOTO_HEIGHT_MM', parseFloat(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4>Polaroid Margins (mm)</h4>
            <div className="form-row three-col">
              <label>
                Top (mm)
                <input
                  type="number"
                  step="0.5"
                  value={formData.TOP_BORDER_MM}
                  onChange={(e) => handleChange('TOP_BORDER_MM', parseFloat(e.target.value))}
                />
              </label>
              <label>
                Sides (mm)
                <input
                  type="number"
                  step="0.5"
                  value={formData.SIDE_BORDER_MM}
                  onChange={(e) => handleChange('SIDE_BORDER_MM', parseFloat(e.target.value))}
                />
              </label>
              <label>
                Bottom Chin (mm)
                <input
                  type="number"
                  step="0.5"
                  value={formData.BOTTOM_BORDER_MM}
                  onChange={(e) => handleChange('BOTTOM_BORDER_MM', parseFloat(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <h4>Grid Gutters on A4 (mm)</h4>
            <div className="form-row">
              <label>
                Horizontal Gap (mm)
                <input
                  type="number"
                  step="1"
                  value={formData.GUTTER_X_MM}
                  onChange={(e) => handleChange('GUTTER_X_MM', parseFloat(e.target.value))}
                />
              </label>
              <label>
                Vertical Gap (mm)
                <input
                  type="number"
                  step="1"
                  value={formData.GUTTER_Y_MM}
                  onChange={(e) => handleChange('GUTTER_Y_MM', parseFloat(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button icon-only-text"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              <span>Reset Defaults</span>
            </button>
            <button type="submit" className="primary-button icon-only-text">
              <Save size={16} />
              <span>Save & Apply</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
