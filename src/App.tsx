import React, { useState } from 'react';
import { DEFAULT_PRINT_DIMENSIONS, type PrintDimensionsConfig } from './config/printDimensions';
import type { PhotoItem } from './types';
import { loadImageFromFile } from './lib/imageCrop';
import { downloadA4Pdf, printA4Pdf } from './lib/pdfGenerator';
import { PhotoPicker } from './components/PhotoPicker';
import { A4Preview } from './components/A4Preview';
import { PhotoSlot } from './components/PhotoSlot';
import { CropModal } from './components/CropModal';
import { PrintControls } from './components/PrintControls';
import { DimensionsModal } from './components/DimensionsModal';
import { Camera, LayoutGrid, FileText, Settings, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [config, setConfig] = useState<PrintDimensionsConfig>(DEFAULT_PRINT_DIMENSIONS);
  const [showCuttingGuides, setShowCuttingGuides] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'a4' | 'photos'>('a4');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);

  // Handle initial 4-photo selection
  const handlePhotosSelected = async (files: File[]) => {
    setErrorMessage(null);

    if (files.length !== 4) {
      setErrorMessage(`Please select exactly 4 photos. (You selected ${files.length})`);
      return;
    }

    setIsProcessing(true);
    try {
      const loadedPhotos: PhotoItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const imgData = await loadImageFromFile(file);
          loadedPhotos.push({
            id: `photo-${Date.now()}-${i}`,
            file,
            dataUrl: imgData.dataUrl,
            name: file.name,
            width: imgData.width,
            height: imgData.height,
            offsetX: 0,
            offsetY: 0,
            zoom: 1.0,
          });
        } catch {
          throw new Error(`Unable to read "${file.name}". Please ensure it is a valid image.`);
        }
      }

      setPhotos(loadedPhotos);
      setActiveTab('a4');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process photos.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Replace a single photo in a slot
  const handleReplacePhoto = async (slotIndex: number, newFile: File) => {
    try {
      const imgData = await loadImageFromFile(newFile);
      setPhotos((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          id: `photo-${Date.now()}-${slotIndex}`,
          file: newFile,
          dataUrl: imgData.dataUrl,
          name: newFile.name,
          width: imgData.width,
          height: imgData.height,
          offsetX: 0,
          offsetY: 0,
          zoom: 1.0,
        };
        return next;
      });
    } catch {
      alert(`Could not process photo "${newFile.name}". Please choose another.`);
    }
  };

  // Update crop pan or zoom for a photo
  const handleUpdateCrop = (id: string, offsetX: number, offsetY: number, zoom: number) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, offsetX, offsetY, zoom } : p))
    );
  };

  // Reset workflow to select new photos
  const handleStartOver = () => {
    if (window.confirm('Start over and select 4 new photos?')) {
      setPhotos([]);
      setErrorMessage(null);
    }
  };

  // Trigger true A4 PDF download
  const handleDownloadPdf = async () => {
    if (photos.length !== 4) return;
    try {
      setIsGeneratingPdf(true);
      await downloadA4Pdf(photos, config, showCuttingGuides, `polaroid-booth-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Trigger Print dialog
  const handlePrint = async () => {
    if (photos.length !== 4) return;
    try {
      setIsGeneratingPdf(true);
      await printA4Pdf(photos, config, showCuttingGuides);
    } catch (err) {
      console.error(err);
      alert('Error launching print dialog. Please download the PDF instead.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="brand-row">
          <div className="brand-icon-box">
            <Camera size={20} />
          </div>
          <div className="brand-text">
            <h1>POLAROID BOOTH</h1>
          </div>
        </div>

        <div className="header-actions">
          {photos.length === 4 && (
            <button
              type="button"
              className="icon-btn"
              onClick={handleStartOver}
              title="Start over"
            >
              <RotateCcw size={18} />
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure print millimeters"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="app-main">
        {photos.length !== 4 ? (
          <PhotoPicker
            onPhotosSelected={handlePhotosSelected}
            error={errorMessage}
            isLoading={isProcessing}
          />
        ) : (
          <div className="booth-workspace">
            {/* Top Bar Status */}
            <div className="top-bar-info">
              <div className="selection-status">
                <span className="status-indicator" />
                <span className="selection-text">4 Photos Ready</span>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={handleStartOver}
              >
                Change All
              </button>
            </div>

            {/* View Switcher Tabs: A4 Sheet vs Individual Photo adjustment */}
            <div className="view-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'a4' ? 'active' : ''}`}
                onClick={() => setActiveTab('a4')}
                id="tab-a4-preview"
              >
                <FileText size={16} />
                <span>A4 Sheet Preview</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
                onClick={() => setActiveTab('photos')}
                id="tab-edit-photos"
              >
                <LayoutGrid size={16} />
                <span>Reposition / Replace (4)</span>
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'a4' ? (
              <A4Preview
                photos={photos}
                config={config}
                showCuttingGuides={showCuttingGuides}
                onSelectPhotoToEdit={(index) => setEditingPhotoIndex(index)}
              />
            ) : (
              <div className="slots-grid">
                {photos.map((photo, index) => (
                  <PhotoSlot
                    key={photo.id}
                    slotIndex={index}
                    photo={photo}
                    config={config}
                    onReplacePhoto={handleReplacePhoto}
                    onOpenAdjustModal={() => setEditingPhotoIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Bottom Production Print Controls */}
            <PrintControls
              onDownloadPdf={handleDownloadPdf}
              onPrint={handlePrint}
              showCuttingGuides={showCuttingGuides}
              onToggleCuttingGuides={setShowCuttingGuides}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isGeneratingPdf={isGeneratingPdf}
            />
          </div>
        )}
      </main>

      {/* Full Dedicated Interactive Modal to Pan & Reposition */}
      {editingPhotoIndex !== null && photos[editingPhotoIndex] && (
        <CropModal
          photo={photos[editingPhotoIndex]}
          slotIndex={editingPhotoIndex}
          config={config}
          onClose={() => setEditingPhotoIndex(null)}
          onSave={handleUpdateCrop}
        />
      )}

      {/* Millimeter calibration modal */}
      <DimensionsModal
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(newCfg) => setConfig(newCfg)}
      />
    </>
  );
};

export default App;
