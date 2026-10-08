import React from 'react';
import { Download, Printer, Settings2, Scissors, Info } from 'lucide-react';

interface PrintControlsProps {
  onDownloadPdf: () => void;
  onPrint: () => void;
  showCuttingGuides: boolean;
  onToggleCuttingGuides: (show: boolean) => void;
  onOpenSettings: () => void;
  isGeneratingPdf?: boolean;
}

export const PrintControls: React.FC<PrintControlsProps> = ({
  onDownloadPdf,
  onPrint,
  showCuttingGuides,
  onToggleCuttingGuides,
  onOpenSettings,
  isGeneratingPdf,
}) => {
  return (
    <div className="print-controls-container">
      {/* Print settings toggles */}
      <div className="controls-toolbar">
        <label className="toggle-label" htmlFor="cutting-guides-toggle">
          <input
            id="cutting-guides-toggle"
            type="checkbox"
            checked={showCuttingGuides}
            onChange={(e) => onToggleCuttingGuides(e.target.checked)}
            className="toggle-checkbox"
          />
          <Scissors size={16} className="toggle-icon" />
          <span>Cutting Guides</span>
        </label>

        <button
          type="button"
          className="settings-trigger-btn"
          onClick={onOpenSettings}
          title="Adjust physical dimensions"
          id="config-dimensions-btn"
        >
          <Settings2 size={16} />
          <span>Dimensions (mm)</span>
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="action-buttons-group">
        <button
          type="button"
          className="primary-button download-btn"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          id="download-pdf-btn"
        >
          <Download size={22} className="btn-icon" />
          <span>{isGeneratingPdf ? 'GENERATING A4 PDF...' : 'DOWNLOAD A4 PDF'}</span>
        </button>

        <button
          type="button"
          className="secondary-button print-btn"
          onClick={onPrint}
          disabled={isGeneratingPdf}
          id="print-a4-btn"
        >
          <Printer size={22} className="btn-icon" />
          <span>PRINT A4</span>
        </button>
      </div>

      {/* Critical Printing Instructions callout */}
      <div className="print-instructions-box">
        <div className="box-title">
          <Info size={16} />
          <strong>PRINTING INSTRUCTIONS (100% SCALE)</strong>
        </div>
        <ul className="instructions-list">
          <li><strong>Paper:</strong> A4 (210 × 297 mm)</li>
          <li><strong>Orientation:</strong> Portrait</li>
          <li><strong>Scale:</strong> <code>100% / Actual Size</code> (Do NOT use <em>"Fit to page"</em>)</li>
          <li><strong>Margins:</strong> None / Default</li>
        </ul>
      </div>
    </div>
  );
};
