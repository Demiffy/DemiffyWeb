// ImageResizer.tsx

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid'; // Ensure @heroicons/react is installed
import Footer from './ui/Footer';

const MAX_PREVIEW_SIZE = 800; // Maximum preview size in pixels

const ImageResizer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(300);
  const [, setIsResizing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when a new image is uploaded
  const resetState = () => {
    setWidth(300);
    setHeight(300);
    setResizedImage(null);
    setOriginalDimensions(null);
    setError('');
    setLockAspectRatio(true);
    setAspectRatio(1);
  };

  // Clean up object URLs to prevent memory leaks
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
      resetState(); // Reset all states when a new image is uploaded

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
        setOriginalDimensions({ width: img.width, height: img.height });
        setAspectRatio(img.width / img.height);
      };
      img.onerror = () => {
        setError('Failed to load the original image.');
      };
    }
  };

  // Handle width change with aspect ratio lock
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newWidth = Number(e.target.value);
    if (lockAspectRatio && aspectRatio !== 0) {
      setWidth(newWidth);
      setHeight(Math.round(newWidth / aspectRatio));
    } else {
      setWidth(newWidth);
    }
  };

  // Handle height change with aspect ratio lock
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newHeight = Number(e.target.value);
    if (lockAspectRatio && aspectRatio !== 0) {
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
    if (isLocked && aspectRatio !== 0) {
      setHeight(Math.round(width / aspectRatio));
    }
  };

  // Automatically resize image when width, height, or selectedImage changes
  useEffect(() => {
    if (selectedImage) {
      handleAutoResize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, selectedImage]);

  // Function to handle automatic resizing
  const handleAutoResize = () => {
    setIsResizing(true);
    setError('');

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = URL.createObjectURL(selectedImage!);

    img.onload = () => {
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
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

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col pt-12">
      <header className="p-6">
        <h1 className="text-3xl font-bold text-center">Image Resizer</h1>
      </header>
  
      {/* Main Content */}
      <main className={`flex-grow p-6 ${!selectedImage ? 'flex items-center justify-center' : ''}`}>
        <div className={`flex ${selectedImage ? 'flex-col lg:flex-row lg:space-x-6' : 'items-center justify-center'}`}>
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
            className="flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer border-gray-500 bg-gray-700 hover:bg-gray-600"
          >
            <ArrowUpTrayIcon className="h-12 w-12 text-blue-400 mb-4" />
            <p className="text-center">Drag and drop an image here, or click to select a file.</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
  
          {/* Settings and Controls */}
          {selectedImage && (
            <div className="w-full lg:w-1/2 mt-6 lg:mt-0 bg-gray-700 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Resize Settings</h2>
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
                    className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded text-white"
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
                    className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded text-white"
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
              </div>
            </div>
          )}
        </div>
  
        {/* Error Message */}
        {error && <p className="text-red-400 mt-4 text-center lg:text-left">{error}</p>}
  
        {/* Resized Image Preview */}
        {resizedImage && (
          <div className="flex flex-col lg:flex-row lg:space-x-6 mt-6">
            {/* Resized Image */}
            <div className="w-full lg:w-1/2 bg-gray-700 p-6 rounded-lg shadow-md flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4">Resized Image</h2>
              <div
                className="bg-gray-800 p-2 rounded border border-gray-600 flex items-center justify-center overflow-hidden"
                style={{
                  width: width > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : width,
                  height: height > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : height,
                  maxWidth: MAX_PREVIEW_SIZE,
                  maxHeight: MAX_PREVIEW_SIZE,
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
                className="flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 mt-4"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Download Image
              </button>
            </div>
  
            {/* Original Image Preview */}
            {selectedImage && originalDimensions && (
              <div className="w-full lg:w-1/2 bg-gray-700 p-6 rounded-lg shadow-md flex flex-col items-center mt-6 lg:mt-0">
                <h2 className="text-2xl font-semibold mb-4">Original Image</h2>
                <div
                  className="bg-gray-800 p-2 rounded border border-gray-600 flex items-center justify-center overflow-hidden"
                  style={{
                    width: originalDimensions.width > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : originalDimensions.width,
                    height: originalDimensions.height > MAX_PREVIEW_SIZE ? MAX_PREVIEW_SIZE : originalDimensions.height,
                    maxWidth: MAX_PREVIEW_SIZE,
                    maxHeight: MAX_PREVIEW_SIZE,
                  }}
                >
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Original"
                    style={{
                      width: originalDimensions.width > MAX_PREVIEW_SIZE ? '100%' : `${originalDimensions.width}px`,
                      height: originalDimensions.height > MAX_PREVIEW_SIZE ? '100%' : `${originalDimensions.height}px`,
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <p className="mt-2 text-sm">
                  Dimensions: {originalDimensions.width}px &times; {originalDimensions.height}px
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
