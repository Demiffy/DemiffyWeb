// GifMaker.tsx

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { ArrowUpTrayIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import Footer from './ui/Footer';
import GIF from 'gif.js.optimized';

interface ImageData {
  id: string;
  file: File;
  url: string;
  error: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const GifMaker: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [globalError, setGlobalError] = useState<string>('');
  const [gifUrl, setGifUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [frameDelay, setFrameDelay] = useState<number>(500);
  const [gifWidth, setGifWidth] = useState<number>(500);
  const [gifHeight, setGifHeight] = useState<number>(500);
  const [autoSizeGif, setAutoSizeGif] = useState<boolean>(true);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [loopCount, setLoopCount] = useState<number>(0); 
  const [reverseFrames, setReverseFrames] = useState<boolean>(false);
  const [gifQuality, setGifQuality] = useState<number>(10);
  const [progress, setProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }
    };
  }, [selectedImages, gifUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGlobalError('');
    const files = e.target.files;
    if (files) {
      const imagesArray: ImageData[] = Array.from(files).map((file) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !supportedFormats.includes(fileExtension)) {
          return {
            id: `${file.name}-${Date.now()}`,
            file,
            url: '',
            error: 'Unsupported file format.',
          };
        }
        if (file.size > MAX_FILE_SIZE) {
          return {
            id: `${file.name}-${Date.now()}`,
            file,
            url: '',
            error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
          };
        }
        const url = URL.createObjectURL(file);
        return {
          id: `${file.name}-${Date.now()}`,
          file,
          url,
          error: '',
        };
      });
      setSelectedImages((prev) => [...prev, ...imagesArray]);
    }
  };

  const handleUploadAreaClick = (): void => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number): void => {
    setSelectedImages((prev) => {
      const newArray = [...prev];
      URL.revokeObjectURL(newArray[index].url);
      newArray.splice(index, 1);
      return newArray;
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down'): void => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < selectedImages.length) {
      const newImages = [...selectedImages];
      const [movedImage] = newImages.splice(index, 1);
      newImages.splice(newIndex, 0, movedImage);
      setSelectedImages(newImages);
    }
  };

  const updateImageIndex = (index: number, newIndex: number): void => {
    if (newIndex >= 0 && newIndex < selectedImages.length) {
      const newImages = [...selectedImages];
      const [movedImage] = newImages.splice(index, 1);
      newImages.splice(newIndex, 0, movedImage);
      setSelectedImages(newImages);
    }
  };

  const generateGif = (): void => {
    if (selectedImages.length === 0) {
      setGlobalError('Please add at least one image to create a GIF.');
      return;
    }

    setIsGenerating(true);
    setGifUrl('');
    setGlobalError('');
    setProgress(0);

    let finalGifWidth = gifWidth;
    let finalGifHeight = gifHeight;

    if (autoSizeGif) {
      const dimensionsPromises = selectedImages.map((imageData) => {
        return new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
          };
          img.onerror = () => {
            reject('Failed to load image');
          };
          img.src = imageData.url;
        });
      });

      Promise.all(dimensionsPromises)
        .then((dimensions) => {
          finalGifWidth = Math.max(...dimensions.map((d) => d.width));
          finalGifHeight = Math.max(...dimensions.map((d) => d.height));
          proceedWithGifGeneration(finalGifWidth, finalGifHeight);
        })
        .catch(() => {
          setGlobalError('Failed to load one or more images.');
          setIsGenerating(false);
          setProgress(0);
        });
    } else {
      proceedWithGifGeneration(finalGifWidth, finalGifHeight);
    }
  };

  const proceedWithGifGeneration = (finalGifWidth: number, finalGifHeight: number) => {
    const gif = new GIF({
      workers: 2,
      quality: gifQuality,
      workerScript: '/gif.worker.js',
      width: finalGifWidth,
      height: finalGifHeight,
      repeat: loopCount === 0 ? 0 : loopCount - 1,
    });

    let loadedImages = 0;
    const totalImages = selectedImages.length;

    const imagesToProcess = reverseFrames ? [...selectedImages].reverse() : selectedImages;

    imagesToProcess.forEach((imageData) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageData.url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = finalGifWidth;
        canvas.height = finalGifHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          let targetWidth = finalGifWidth;
          let targetHeight = finalGifHeight;
          let offsetX = 0;
          let offsetY = 0;

          if (keepAspectRatio) {
            const aspectRatio = img.width / img.height;
            if (img.width > img.height) {
              targetWidth = finalGifWidth;
              targetHeight = finalGifWidth / aspectRatio;
              if (targetHeight > finalGifHeight) {
                targetHeight = finalGifHeight;
                targetWidth = finalGifHeight * aspectRatio;
              }
            } else {
              targetHeight = finalGifHeight;
              targetWidth = finalGifHeight * aspectRatio;
              if (targetWidth > finalGifWidth) {
                targetWidth = finalGifWidth;
                targetHeight = finalGifWidth / aspectRatio;
              }
            }
            offsetX = (finalGifWidth - targetWidth) / 2;
            offsetY = (finalGifHeight - targetHeight) / 2;
          }

          ctx.fillStyle = 'transparent';
          ctx.fillRect(0, 0, finalGifWidth, finalGifHeight);
          ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);
          gif.addFrame(canvas, { delay: frameDelay, copy: true });
        }
        loadedImages++;
        setProgress(Math.round((loadedImages / totalImages) * 50));

        if (loadedImages === totalImages) {
          gif.render();
        }
      };
      img.onerror = () => {
        setGlobalError('Failed to load one or more images.');
        setIsGenerating(false);
        setProgress(0);
      };
    });

    gif.on('progress', (p: number) => {
      const renderProgress = p * 50;
      setProgress(Math.round(50 + renderProgress));
    });

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      setGifUrl(url);
      setIsGenerating(false);
      setProgress(100);
    });

    gif.on('error', () => {
      setGlobalError('Failed to generate GIF.');
      setIsGenerating(false);
      setProgress(0);
    });
  };

  const handleFrameDelayChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    setFrameDelay(value);
  };

  const handleGifWidthChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    setGifWidth(value);
  };

  const handleGifHeightChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    setGifHeight(value);
  };

  const handleLoopCountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    setLoopCount(value);
  };

  const handleReverseFramesChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setReverseFrames(e.target.checked);
  };

  const handleGifQualityChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);
    setGifQuality(value);
  };

  const handleAutoSizeGifChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAutoSizeGif(e.target.checked);
  };

  const handleKeepAspectRatioChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setKeepAspectRatio(e.target.checked);
  };

  return (
    <div className="min-h-screen text-white p-12">
      <section className="min-h-screen flex flex-col items-center text-white p-6">
        <h2 className="text-3xl font-bold mb-6 text-accent-color">GIF Maker</h2>

        <div className="flex flex-col lg:flex-row w-full max-w-7xl space-y-6 lg:space-y-0 lg:space-x-6">
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
            className="flex flex-col items-center justify-center w-full lg:w-1/3 h-64 p-6 border-2 border-dashed rounded transition-colors duration-200 cursor-pointer border-gray-500 bg-primary-color hover:bg-black"
          >
            <ArrowUpTrayIcon className="h-12 w-12 text-blue-400 mb-4" />
            <p className="text-center mb-4">Drag and drop images here, or click to select files.</p>
            <input
              type="file"
              accept={supportedFormats.map((fmt) => `.${fmt}`).join(', ')}
              multiple
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>

          {/* Settings and Generate Button */}
          <div className="flex flex-col w-full lg:w-2/3 space-y-4">
            <div className="bg-primary-color p-6 rounded shadow-md">
              <h3 className="text-xl font-semibold mb-4">Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frame Delay */}
                <div>
                  <label htmlFor="frameDelay" className="block mb-2 text-sm font-medium">
                    Frame Delay (ms)
                  </label>
                  <input
                    type="number"
                    id="frameDelay"
                    value={frameDelay}
                    onChange={handleFrameDelayChange}
                    className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                    min={20}
                  />
                </div>

                {/* Loop Count */}
                <div>
                  <label htmlFor="loopCount" className="block mb-2 text-sm font-medium">
                    Loop Count (0 for infinite)
                  </label>
                  <input
                    type="number"
                    id="loopCount"
                    value={loopCount}
                    onChange={handleLoopCountChange}
                    className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                    min={0}
                  />
                </div>

                {/* GIF Quality */}
                <div>
                  <label htmlFor="gifQuality" className="block mb-2 text-sm font-medium">
                    GIF Quality (1 best - 30 worst)
                  </label>
                  <input
                    type="number"
                    id="gifQuality"
                    value={gifQuality}
                    onChange={handleGifQualityChange}
                    className="w-full p-2 bg-tertiary-color border border-accent-color rounded text-white"
                    min={1}
                    max={30}
                  />
                </div>

                {/* Reverse Frames */}
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="reverseFrames"
                    checked={reverseFrames}
                    onChange={handleReverseFramesChange}
                    className="mr-2"
                  />
                  <label htmlFor="reverseFrames" className="text-sm font-medium">
                    Reverse Frames
                  </label>
                </div>

                {/* Auto Size GIF */}
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="autoSizeGif"
                    checked={autoSizeGif}
                    onChange={handleAutoSizeGifChange}
                    className="mr-2"
                  />
                  <label htmlFor="autoSizeGif" className="text-sm font-medium">
                    Auto Size GIF
                  </label>
                </div>

                {/* Keep Aspect Ratio */}
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="keepAspectRatio"
                    checked={keepAspectRatio}
                    onChange={handleKeepAspectRatioChange}
                    className="mr-2"
                  />
                  <label htmlFor="keepAspectRatio" className="text-sm font-medium">
                    Keep Aspect Ratio
                  </label>
                </div>

                {/* GIF Dimensions */}
                {!autoSizeGif && (
                  <>
                    <div>
                      <label htmlFor="gifWidth" className="block mb-2 text-sm font-medium">
                        GIF Width (px)
                      </label>
                      <input
                        type="number"
                        id="gifWidth"
                        value={gifWidth}
                        onChange={handleGifWidthChange}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
                        min={1}
                      />
                    </div>
                    <div>
                      <label htmlFor="gifHeight" className="block mb-2 text-sm font-medium">
                        GIF Height (px)
                      </label>
                      <input
                        type="number"
                        id="gifHeight"
                        value={gifHeight}
                        onChange={handleGifHeightChange}
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
                        min={1}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Progress Indicator */}
              {isGenerating && (
                <div className="mt-6">
                  <label htmlFor="progress" className="block mb-2 text-sm font-medium">
                    Generating GIF: {progress}%
                  </label>
                  <div className="w-full bg-gray-600 rounded h-4">
                    <div
                      className="bg-blue-500 h-4 rounded"
                      style={{ width: `${progress}%`, transition: 'width 0.3s' }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              {selectedImages.length > 0 && (
                <button
                  onClick={generateGif}
                  disabled={isGenerating}
                  className={`w-full py-2 px-4 mt-6 bg-blue-600 text-white rounded ${
                    isGenerating
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-700 transition-colors duration-200'
                  }`}
                >
                  {isGenerating ? 'Generating GIF...' : 'Generate GIF'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Global Error */}
        {globalError && <p className="text-red-400 mt-4">{globalError}</p>}

        {/* Selected Images List */}
        {selectedImages.length > 0 && (
          <div className="w-full max-w-7xl mt-6">
            <h3 className="text-xl font-semibold mb-2">Selected Images:</h3>
            <ul className="flex overflow-x-auto space-x-4 p-2">
              {selectedImages.map((imageData, index) => (
                <li
                  key={imageData.id}
                  className="relative bg-primary-color p-2 rounded flex flex-col items-center min-w-[150px]"
                >
                  <img src={imageData.url} alt={`Selected ${index}`} className="w-full h-auto rounded mb-2" />
                  {imageData.error && <p className="text-red-400 text-sm">{imageData.error}</p>}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => moveImage(index, 'up')}
                      disabled={index === 0}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>

                    <button
                      onClick={() => moveImage(index, 'down')}
                      disabled={index === selectedImages.length - 1}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-2">
                    <label htmlFor={`index-input-${index}`} className="block text-sm font-medium text-white">
                      Set Index
                    </label>
                    <input
                      id={`index-input-${index}`}
                      type="number"
                      value={index + 1}
                      min={1}
                      max={selectedImages.length}
                      onChange={(e) => updateImageIndex(index, parseInt(e.target.value, 10) - 1)}
                      className="w-16 p-2 mt-1 text-center bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>

                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-transparent hover:bg-slate-700 text-white rounded-full"
                    title="Remove Image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* GIF Preview */}
        {gifUrl && (
          <div className="w-full max-w-7xl mt-6">
            <h3 className="text-2xl font-semibold mb-4">Generated GIF:</h3>
            <div className="bg-primary-color p-4 rounded shadow-md flex flex-col items-center">
              <img
                src={gifUrl}
                alt="Generated GIF"
                className="w-full h-auto mb-4 rounded"
                style={{ maxWidth: '500px' }}
              />
              <a
                href={gifUrl}
                download={`animated.gif`}
                className="inline-flex items-center py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Download GIF
              </a>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default GifMaker;