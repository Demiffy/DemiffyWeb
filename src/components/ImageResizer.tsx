// ImageResizer.tsx

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { ArrowUpTrayIcon, ArrowsRightLeftIcon, ArrowPathIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import DragAndDropArea from './ui/DragAndDropArea';

const MAX_PREVIEW_SIZE = 500;

const ImageResizer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [, setIsResizing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setWidth(null);
    setHeight(null);
    setResizedImage(null);
    setOriginalDimensions(null);
    setError('');
    setLockAspectRatio(true);
    setAspectRatio(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(URL.createObjectURL(selectedImage));
      }
      if (resizedImage) {
        URL.revokeObjectURL(resizedImage);
      }
    };
  }, [selectedImage, resizedImage]);

  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      resetState();

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setSelectedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setResizedImage(imageUrl);

      // Get original image dimensions
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        setOriginalDimensions({ width: originalWidth, height: originalHeight });
        setAspectRatio(originalWidth / originalHeight);
        setWidth(originalWidth);
        setHeight(originalHeight);
      };
      img.onerror = () => {
        setError('Failed to load the original image.');
      };
    }
  };

  // Handle width change with aspect ratio lock
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newWidth = Number(e.target.value);
    if (lockAspectRatio && aspectRatio !== 0 && originalDimensions) {
      setWidth(newWidth);
      setHeight(Math.round(newWidth / aspectRatio));
    } else {
      setWidth(newWidth);
    }
  };

  // Handle height change with aspect ratio lock
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHeight = Number(e.target.value);
    if (lockAspectRatio && aspectRatio !== 0 && originalDimensions) {
      setHeight(newHeight);
      setWidth(Math.round(newHeight * aspectRatio));
    } else {
      setHeight(newHeight);
    }
  };

  // Handle aspect ratio lock toggle
  const handleLockAspectRatioChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isLocked = e.target.checked;
    setLockAspectRatio(isLocked);
    if (isLocked && aspectRatio !== 0 && width && originalDimensions) {
      setHeight(Math.round(width / aspectRatio));
    }
  };

  // Automatically resize image when width, height, selectedImage, rotation, flipH, or flipV changes
  useEffect(() => {
    if (selectedImage && width && height) {
      handleAutoResize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, selectedImage, rotation, flipH, flipV]);

  // Function to handle automatic resizing and transformations
  const handleAutoResize = () => {
    setIsResizing(true);
    setError('');

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = URL.createObjectURL(selectedImage!);

    img.onload = () => {
      // Apply rotation and flipping to canvas
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));

      // Calculate new canvas size to accommodate rotation
      const newWidth = Math.floor(width! * cos + height! * sin);
      const newHeight = Math.floor(width! * sin + height! * cos);
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -width! / 2, -height! / 2, width!, height!);
        const resizedUrl = canvas.toDataURL('image/png');
        setResizedImage(resizedUrl);
        setIsResizing(false);
      } else {
        setError('Failed to get canvas context.');
        setIsResizing(false);
      }
    };

    img.onerror = () => {
      setError('Failed to load the image.');
      setIsResizing(false);
    };
  };

  // Handle image download
  const handleDownload = () => {
    if (!resizedImage) {
      setError('No resized image to download.');
      return;
    }

    const link = document.createElement('a');
    link.href = resizedImage;
    link.download = 'resized-image.png';
    link.click();
  };

  // Trigger file input click
  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Handle rotation to the left (counter-clockwise)
  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  // Handle rotation to the right (clockwise)
  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Handle horizontal flip
  const handleFlipHorizontal = () => {
    setFlipH((prev) => !prev);
  };

  // Handle vertical flip
  const handleFlipVertical = () => {
    setFlipV((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-5 text-white">
      {!selectedImage ? (
        <DragAndDropArea
          isDragging={false}
          supportedInputFormats={['image/*']}
          fileInputRef={fileInputRef}
          onClick={handleUploadAreaClick}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onFileChange={handleImageChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          text="Drag and drop an image here, or click to select a file."
        />
      ) : (
        <div className="w-full max-w-7xl px-6 space-y-8">
          {/* Settings and Controls Panel */}
          <div className="w-full bg-primary-color p-8 rounded-lg shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Sizing Controls */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center">
                    <label htmlFor="width" className="w-32 text-sm font-medium">
                      Width (px):
                    </label>
                    <input
                      type="number"
                      id="width"
                      value={width ?? ''}
                      onChange={handleWidthChange}
                      className="flex-1 p-2 bg-tertiary-color border border-accent-color rounded text-white"
                      min={1}
                    />
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="height" className="w-32 text-sm font-medium">
                      Height (px):
                    </label>
                    <input
                      type="number"
                      id="height"
                      value={height ?? ''}
                      onChange={handleHeightChange}
                      className="flex-1 p-2 bg-tertiary-color border border-accent-color rounded text-white"
                      min={1}
                    />
                  </div>
                </div>

                {/* Lock Aspect Ratio */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lockAspectRatio"
                    checked={lockAspectRatio}
                    onChange={handleLockAspectRatioChange}
                    className="mr-2 h-5 w-5 accent-accent-color"
                  />
                  <label htmlFor="lockAspectRatio" className="text-sm font-medium">
                    Lock Aspect Ratio
                  </label>
                </div>
              </div>

              {/* Right: Transformation Controls */}
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleRotateLeft}
                    className="flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    aria-label="Rotate Left"
                    title="Rotate Left"
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2 transform rotate-180" />
                    Rotate Left
                  </button>
                  <button
                    onClick={handleRotateRight}
                    className="flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                    aria-label="Rotate Right"
                    title="Rotate Right"
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Rotate Right
                  </button>
                  <button
                    onClick={handleFlipHorizontal}
                    className="flex items-center justify-center py-3 px-6 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200"
                    aria-label="Flip Horizontal"
                    title="Flip Horizontal"
                  >
                    <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
                    Flip H
                  </button>
                  <button
                    onClick={handleFlipVertical}
                    className="flex items-center justify-center py-3 px-6 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200"
                    aria-label="Flip Vertical"
                    title="Flip Vertical"
                  >
                    <ArrowDownIcon className="h-5 w-5 mr-2" />
                    Flip V
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

          {/* Resized Image Preview */}
          {resizedImage && width && height && (
            <div className="w-full">
              <h2 className="text-2xl font-semibold mb-6 text-center">Resized Image</h2>
              <div className="flex flex-col lg:flex-row lg:space-x-8">
                {/* Resized Image Section */}
                <div className="w-full lg:w-1/2 p-6 flex flex-col items-center">
                  <div
                    className="bg-primary-color p-2 rounded border border-gray-600 flex items-center justify-center overflow-hidden"
                    style={{
                      width: width > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : width,
                      height: height > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : height,
                      maxWidth: '100%',
                      maxHeight: '60vh',
                    }}
                  >
                    <img
                      src={resizedImage}
                      alt="Resized"
                      style={{
                        width: width > MAX_PREVIEW_SIZE ? '100%' : `${width}px`,
                        height: height > MAX_PREVIEW_SIZE ? '100%' : `${height}px`,
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm">
                    Dimensions: {width}px &times; {height}px
                  </p>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center py-3 px-6 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 mt-4"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Download Image
                  </button>
                </div>

                {/* Original Image Section */}
                {selectedImage && originalDimensions && (
                  <div className="w-full lg:w-1/2 flex flex-col items-center mt-6 lg:mt-0">
                    <h2 className="text-2xl font-semibold mb-6">Original Image</h2>
                    <div
                      className="bg-primary-color p-2 rounded border border-gray-600 flex items-center justify-center overflow-hidden"
                      style={{
                        width:
                          originalDimensions.width > MAX_PREVIEW_SIZE
                            ? MAX_PREVIEW_SIZE
                            : originalDimensions.width,
                        height:
                          originalDimensions.height > MAX_PREVIEW_SIZE
                            ? MAX_PREVIEW_SIZE
                            : originalDimensions.height,
                        maxWidth: '100%',
                        maxHeight: '60vh',
                      }}
                    >
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Original"
                        style={{
                          width:
                            originalDimensions.width > MAX_PREVIEW_SIZE
                              ? '100%'
                              : `${originalDimensions.width}px`,
                          height:
                            originalDimensions.height > MAX_PREVIEW_SIZE
                              ? '100%'
                              : `${originalDimensions.height}px`,
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm">
                      Dimensions: {originalDimensions.width}px &times;{' '}
                      {originalDimensions.height}px
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageResizer;