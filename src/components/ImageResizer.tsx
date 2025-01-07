// ImageResizer.tsx

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { ArrowUpTrayIcon, ArrowsRightLeftIcon, ArrowPathIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import Footer from './ui/Footer';

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
    <div className="min-h-screen text-white flex flex-col pt-12">
      <header className="p-6">
        <h1 className="text-3xl font-bold text-center text-accent-color">Image Resizer</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 overflow-auto">
        <div
          className={`flex flex-col lg:flex-row lg:space-x-6 ${
            !selectedImage ? 'items-center justify-center' : ''
          }`}
        >
          {/* Upload Area */}
          <div
            onClick={handleUploadAreaClick}
            role="button"
            aria-label="File Upload Area"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            className={`flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer border-gray-500 bg-primary-color hover:bg-black ${
              selectedImage ? 'lg:w-1/2' : ''
            }`}
          >
            <ArrowUpTrayIcon className="h-12 w-12 text-accent-color mb-4" />
            <p className="text-center">
              Drag and drop an image here, or click to select a file.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>

          {/* Settings and Controls */}
          {selectedImage && width && height && (
            <div className="w-full lg:w-1/2 mt-6 lg:mt-0 bg-primary-color p-6 rounded-lg shadow-md max-h-full overflow-auto">
              <h2 className="text-2xl font-semibold mb-4">Resize & Transform Settings</h2>
              <div className="space-y-4">
                {/* Width Input */}
                <div className="flex items-center">
                  <label htmlFor="width" className="w-24 text-sm font-medium">
                    Width (px):
                  </label>
                  <input
                    type="number"
                    id="width"
                    value={width}
                    onChange={handleWidthChange}
                    className="flex-1 p-2 bg-tertiary-color border border-accent-color rounded text-white"
                    min={1}
                  />
                </div>

                {/* Height Input */}
                <div className="flex items-center">
                  <label htmlFor="height" className="w-24 text-sm font-medium">
                    Height (px):
                  </label>
                  <input
                    type="number"
                    id="height"
                    value={height}
                    onChange={handleHeightChange}
                    className="flex-1 p-2 bg-tertiary-color border border-accent-color rounded text-white"
                    min={1}
                  />
                </div>

                {/* Lock Aspect Ratio */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lockAspectRatio"
                    checked={lockAspectRatio}
                    onChange={handleLockAspectRatioChange}
                    className="mr-2"
                  />
                  <label htmlFor="lockAspectRatio" className="text-sm font-medium">
                    Lock Aspect Ratio
                  </label>
                </div>

                {/* Transformation Controls */}
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Transformations</h3>
                  <div className="flex flex-wrap space-x-2">
                    <button
                      onClick={handleRotateLeft}
                      className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 mb-2"
                      aria-label="Rotate Left"
                      title="Rotate Left"
                    >
                      <ArrowPathIcon className="h-5 w-5 mr-2 transform rotate-180" />
                      Rotate Left
                    </button>
                    <button
                      onClick={handleRotateRight}
                      className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 mb-2"
                      aria-label="Rotate Right"
                      title="Rotate Right"
                    >
                      <ArrowPathIcon className="h-5 w-5 mr-2" />
                      Rotate Right
                    </button>
                    <button
                      onClick={handleFlipHorizontal}
                      className="flex items-center justify-center py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 mb-2"
                      aria-label="Flip Horizontal"
                      title="Flip Horizontal"
                    >
                      <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
                      Flip H
                    </button>
                    <button
                      onClick={handleFlipVertical}
                      className="flex items-center justify-center py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 mb-2"
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
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 mt-4 text-center lg:text-left">{error}</p>
        )}

        {/* Resized Image Preview */}
        {resizedImage && width && height && (
          <div className="flex flex-col lg:flex-row lg:space-x-6 mt-6">
            {/* Resized Image */}
            <div className="w-full lg:w-1/2 p-6 flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4">Resized Image</h2>
              <div
                className="bg-primary-color p-2 rounded border border-gray-600 flex items-center justify-center overflow-hidden"
                style={{
                  width:
                    width > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : width,
                  height:
                    height > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : height,
                  maxWidth: '100%',
                  maxHeight: '60vh',
                }}
              >
                <img
                  src={resizedImage}
                  alt="Resized"
                  style={{
                    width: width > MAX_PREVIEW_SIZE ? '100%' : `${width}px`,
                    height:
                      height > MAX_PREVIEW_SIZE ? '100%' : `${height}px`,
                    objectFit: 'contain',
                  }}
                />
              </div>
              <p className="mt-2 text-sm">
                Dimensions: {width}px &times; {height}px
              </p>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 mt-4"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Download Image
              </button>
            </div>

            {/* Original Image Preview */}
            {selectedImage && originalDimensions && (
              <div className="w-full lg:w-1/2 flex flex-col items-center mt-6 lg:mt-0">
                <h2 className="text-2xl font-semibold mb-4">Original Image</h2>
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ImageResizer;
