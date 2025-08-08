import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiX, FiCrop, FiMove, FiMaximize, FiRefreshCw } from 'react-icons/fi';

// Image cropper component for banner uploads with dimension guidance
const ImageCropper = ({ 
  onImageSelect, 
  onCancel, 
  targetDimensions = { width: 1200, height: 400 }, 
  cropPresets = [],
  showDimensionGuide = true
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 50, height: 50 });
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Default crop presets based on common banner sizes
  const defaultPresets = [
    { name: 'Hero Banner', width: 1200, height: 400, ratio: 3 },
    { name: 'Dropdown Banner', width: 300, height: 200, ratio: 1.5 },
    { name: 'Sidebar Banner', width: 300, height: 600, ratio: 0.5 },
    { name: 'Square Banner', width: 400, height: 400, ratio: 1 },
    { name: 'Mobile Banner', width: 800, height: 300, ratio: 2.67 },
  ];

  const presets = cropPresets.length > 0 ? cropPresets : defaultPresets;

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        // Reset crop to center
        setCrop({ x: 25, y: 25, width: 50, height: 50 });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handlePresetSelect = useCallback((preset) => {
    const targetRatio = targetDimensions.width / targetDimensions.height;
    const presetRatio = preset.width / preset.height;
    
    if (Math.abs(targetRatio - presetRatio) < 0.1) {
      // If ratios match, use full image
      setCrop({ x: 0, y: 0, width: 100, height: 100 });
    } else {
      // Adjust crop to match preset ratio
      const cropRatio = preset.ratio || presetRatio;
      if (cropRatio > 1) {
        // Wider crop
        setCrop({ x: 10, y: 25, width: 80, height: 80 / cropRatio });
      } else {
        // Taller crop  
        setCrop({ x: 25, y: 10, width: 80 * cropRatio, height: 80 });
      }
    }
  }, [targetDimensions]);

  // Update preview whenever crop changes
  const updatePreview = useCallback(() => {
    if (!selectedImage || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Wait for image to load
    if (img.naturalWidth === 0 || img.naturalHeight === 0) return;

    canvas.width = targetDimensions.width;
    canvas.height = targetDimensions.height;
    
    // Calculate source dimensions with proper validation
    const scaleX = img.naturalWidth / 100;
    const scaleY = img.naturalHeight / 100;
    
    // Ensure crop values are within bounds
    const validCrop = {
      x: Math.max(0, Math.min(crop.x, 100 - crop.width)),
      y: Math.max(0, Math.min(crop.y, 100 - crop.height)),
      width: Math.max(1, Math.min(crop.width, 100 - crop.x)),
      height: Math.max(1, Math.min(crop.height, 100 - crop.y))
    };
    
    const sourceX = validCrop.x * scaleX;
    const sourceY = validCrop.y * scaleY;
    const sourceWidth = validCrop.width * scaleX;
    const sourceHeight = validCrop.height * scaleY;
    
    // Clear canvas and draw cropped image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      // Update preview data URL
      setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.9));
    } catch (error) {
      console.error('Error updating preview:', error);
      setPreviewDataUrl('');
    }
  }, [selectedImage, crop, targetDimensions]);

  // Update preview when crop or image changes
  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const cropImage = useCallback(() => {
    if (!selectedImage || !canvasRef.current || !imageRef.current) {
      console.error('Missing required elements for cropping');
      return null;
    }

    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      console.error('Image not loaded properly');
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        // Force preview update before cropping
        const ctx = canvas.getContext('2d');
        canvas.width = targetDimensions.width;
        canvas.height = targetDimensions.height;
        
        // Calculate source dimensions with proper validation
        const scaleX = img.naturalWidth / 100;
        const scaleY = img.naturalHeight / 100;
        
        // Ensure crop values are within bounds
        const validCrop = {
          x: Math.max(0, Math.min(crop.x, 100 - crop.width)),
          y: Math.max(0, Math.min(crop.y, 100 - crop.height)),
          width: Math.max(1, Math.min(crop.width, 100 - crop.x)),
          height: Math.max(1, Math.min(crop.height, 100 - crop.y))
        };
        
        const sourceX = validCrop.x * scaleX;
        const sourceY = validCrop.y * scaleY;
        const sourceWidth = validCrop.width * scaleX;
        const sourceHeight = validCrop.height * scaleY;
        
        // Clear canvas and draw cropped image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create image blob'));
            return;
          }
          
          const fileName = imageFile?.name || 'cropped-image.jpg';
          const fileType = imageFile?.type || 'image/jpeg';
          
          resolve({
            file: new File([blob], fileName, { type: fileType }),
            dataUrl: canvas.toDataURL('image/jpeg', 0.9)
          });
        }, 'image/jpeg', 0.9);
      } catch (error) {
        reject(error);
      }
    });
  }, [selectedImage, imageFile, crop, targetDimensions]);

  const handleCropAndSave = async () => {
    try {
      const croppedImage = await cropImage();
      if (croppedImage && onImageSelect) {
        onImageSelect(croppedImage);
        // Close the cropper after successful save
        handleClose();
      } else {
        console.error('Failed to crop image or no callback provided');
        alert('Failed to crop image. Please try again.');
      }
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Error cropping image. Please try again.');
    }
  };

  const handleClose = useCallback(() => {
    // Reset all state
    setSelectedImage(null);
    setImageFile(null);
    setPreviewDataUrl('');
    setCrop({ x: 25, y: 25, width: 50, height: 50 });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Call onCancel callback
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const resetCrop = () => {
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
  };

  const centerCrop = () => {
    setCrop({ x: 25, y: 25, width: 50, height: 50 });
  };

  const getFileSizeInfo = (file) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const isLarge = file.size > 5 * 1024 * 1024; // 5MB
    return { sizeInMB, isLarge };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div 
          className="flex justify-between items-center p-6 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <h2 
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Upload and Crop Banner Image
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
          >
            <FiX size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="p-6">
          {/* Dimension Guide */}
          {showDimensionGuide && (
            <div 
              className="mb-6 p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--bg-accent-light)', 
                borderColor: 'var(--border-primary)' 
              }}
            >
              <h3 
                className="font-medium mb-2"
                style={{ color: 'var(--brand-primary)' }}
              >
                📐 Recommended Dimensions
              </h3>
              <p 
                className="text-sm mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Target size: {targetDimensions.width} × {targetDimensions.height} pixels
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(preset)}
                    className="text-xs p-2 rounded border hover:bg-gray-50 transition-colors"
                    style={{ 
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-gray-500">{preset.width}×{preset.height}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!selectedImage ? (
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-12 cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ 
                  borderColor: 'var(--border-secondary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <FiUpload 
                  size={48} 
                  className="mx-auto mb-4"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <p 
                  className="text-lg font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Choose an Image
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Select a high-quality image. Supported formats: JPG, PNG, WebP
                </p>
                <p 
                  className="text-xs mt-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Maximum file size: 5MB
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Image Preview and Crop Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Image with Crop Overlay */}
                <div>
                  <h3 
                    className="font-medium mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Original Image - Adjust Crop Area
                  </h3>
                  <div className="relative border rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      ref={imageRef}
                      src={selectedImage} 
                      alt="Original" 
                      className="w-full h-64 object-contain"
                      onLoad={updatePreview}
                    />
                    {/* Crop Overlay Visualization */}
                    <div 
                      className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 pointer-events-none"
                      style={{
                        left: `${Math.max(0, Math.min(crop.x, 100 - crop.width))}%`,
                        top: `${Math.max(0, Math.min(crop.y, 100 - crop.height))}%`,
                        width: `${Math.max(1, Math.min(crop.width, 100 - crop.x))}%`,
                        height: `${Math.max(1, Math.min(crop.height, 100 - crop.y))}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded whitespace-nowrap">
                        Crop Area
                      </div>
                      {/* Corner indicators */}
                      <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full -translate-x-1 -translate-y-1"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full translate-x-1 -translate-y-1"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 rounded-full -translate-x-1 translate-y-1"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full translate-x-1 translate-y-1"></div>
                    </div>
                    {imageFile && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        {getFileSizeInfo(imageFile).sizeInMB} MB
                        {getFileSizeInfo(imageFile).isLarge && (
                          <span className="text-yellow-400 ml-1">⚠️</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <h3 
                    className="font-medium mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Live Preview ({targetDimensions.width}×{targetDimensions.height})
                  </h3>
                  <div 
                    className="border rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
                    style={{ 
                      aspectRatio: `${targetDimensions.width}/${targetDimensions.height}`,
                      minHeight: '200px'
                    }}
                  >
                    {previewDataUrl ? (
                      <img 
                        src={previewDataUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <FiCrop size={24} className="mx-auto mb-2" />
                        <p className="text-sm">Preview loading...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Improved Crop Controls */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 
                    className="font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Crop Controls
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={centerCrop}
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                      style={{ 
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-secondary)'
                      }}
                      title="Center crop area"
                    >
                      <FiMove size={12} />
                      Center
                    </button>
                    <button
                      onClick={resetCrop}
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                      style={{ 
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-secondary)'
                      }}
                      title="Reset to full image"
                    >
                      <FiMaximize size={12} />
                      Full
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label 
                      className="text-sm font-medium mb-2 flex items-center gap-1 text-gray-700"
                    >
                      <FiMove size={14} />
                      X Position ({Math.round(Math.max(0, Math.min(crop.x, 100 - crop.width)))}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, 100 - crop.width)}
                      value={Math.min(crop.x, 100 - crop.width)}
                      onChange={(e) => {
                        const newX = parseInt(e.target.value);
                        setCrop(prev => ({ 
                          ...prev, 
                          x: Math.max(0, Math.min(newX, 100 - prev.width))
                        }));
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">Left to right position</div>
                  </div>
                  <div>
                    <label 
                      className="text-sm font-medium mb-2 flex items-center gap-1 text-gray-700"
                    >
                      <FiMove size={14} />
                      Y Position ({Math.round(Math.max(0, Math.min(crop.y, 100 - crop.height)))}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, 100 - crop.height)}
                      value={Math.min(crop.y, 100 - crop.height)}
                      onChange={(e) => {
                        const newY = parseInt(e.target.value);
                        setCrop(prev => ({ 
                          ...prev, 
                          y: Math.max(0, Math.min(newY, 100 - prev.height))
                        }));
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">Top to bottom position</div>
                  </div>
                  <div>
                    <label 
                      className="text-sm font-medium mb-2 flex items-center gap-1 text-gray-700"
                    >
                      <FiMaximize size={14} />
                      Width ({Math.round(Math.max(10, Math.min(crop.width, 100 - crop.x)))}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max={100 - crop.x}
                      value={Math.min(crop.width, 100 - crop.x)}
                      onChange={(e) => {
                        const newWidth = parseInt(e.target.value);
                        setCrop(prev => ({ 
                          ...prev, 
                          width: Math.max(10, Math.min(newWidth, 100 - prev.x))
                        }));
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">Horizontal crop size</div>
                  </div>
                  <div>
                    <label 
                      className="text-sm font-medium mb-2 flex items-center gap-1 text-gray-700"
                    >
                      <FiMaximize size={14} />
                      Height ({Math.round(Math.max(10, Math.min(crop.height, 100 - crop.y)))}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max={100 - crop.y}
                      value={Math.min(crop.height, 100 - crop.y)}
                      onChange={(e) => {
                        const newHeight = parseInt(e.target.value);
                        setCrop(prev => ({ 
                          ...prev, 
                          height: Math.max(10, Math.min(newHeight, 100 - prev.y))
                        }));
                      }}
                      className="w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">Vertical crop size</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImageFile(null);
                    setPreviewDataUrl('');
                    setCrop({ x: 25, y: 25, width: 50, height: 50 });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  style={{ 
                    borderColor: 'var(--border-secondary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <FiRefreshCw size={16} />
                  Choose Different Image
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ 
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropAndSave}
                    className="px-6 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                    disabled={!selectedImage || !imageRef.current}
                  >
                    <FiCrop size={16} />
                    Crop & Save Banner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Hidden canvas for image processing */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default ImageCropper;
