import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiCrop, FiRotateCcw, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import Button from '../../ui/Button';

const ImageCropModal = ({ image, onCrop, onClose, aspectRatio = 16 / 9 }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState('');

  // Convert file to image source
  React.useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
      });
      reader.readAsDataURL(image);
    }
  }, [image]);

  function onImageLoad(e) {
    if (aspectRatio) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspectRatio,
          width,
          height,
        ),
        width,
        height,
      ));
    }
  }

  const generateDownload = useCallback((canvas, crop) => {
    if (!crop || !canvas) {
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCrop(blob);
        }
      },
      'image/jpeg',
      0.9,
    );
  }, [onCrop]);

  const handleCropComplete = useCallback(() => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate,
      );
      generateDownload(previewCanvasRef.current, completedCrop);
    }
  }, [completedCrop, scale, rotate, generateDownload]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <FiCrop className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Crop Image</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Scale:</label>
                <input
                  id="scale-input"
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">{scale}x</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Rotate:</label>
                <input
                  id="rotate-input"
                  type="range"
                  min="0"
                  max="360"
                  value={rotate}
                  onChange={(e) => setRotate(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">{rotate}°</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRotate(0)}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-md"
                title="Reset rotation"
              >
                <FiRotateCcw size={16} />
              </button>
              <button
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-md"
                title="Zoom out"
              >
                <FiZoomOut size={16} />
              </button>
              <button
                onClick={() => setScale(Math.min(3, scale + 0.1))}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-md"
                title="Zoom in"
              >
                <FiZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Crop area */}
          <div className="flex justify-center max-h-[60vh] overflow-auto">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={50}
                minHeight={50}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ 
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    maxHeight: '400px',
                    objectFit: 'contain'
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
          </div>

          {/* Hidden preview canvas */}
          <canvas
            ref={previewCanvasRef}
            style={{
              display: 'none',
              border: '1px solid black',
              objectFit: 'contain',
              width: 150,
              height: 150,
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCropComplete}>
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
};

// Canvas preview helper function
function canvasPreview(image, canvas, crop, scale = 1, rotate = 0) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * (Math.PI / 180);
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();
}

export default ImageCropModal;
